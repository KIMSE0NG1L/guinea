import type { Quest } from "../types";
import { food, icons, navIcons, statIcons } from "../assets";
import { formatGameNumber } from "./gameMath";
import { LAST_STAGE_NUMBER, STAGES } from "./stages";
import { RECIPES, STARTER_RECIPES } from "./recipes";

type QuestDef = {
  icon: number;
  title: (target: number) => string;
  // Hand-picked early targets; counter quests keep going past them (×3 each tier),
  // `finite` ones stop at the last entry.
  targets: number[];
  finite?: boolean;
  // Gems for tier 0, plus `step` more for every tier after.
  reward: number;
  step: number;
};

// Each quest row is a ladder: claiming it moves the same row on to a bigger target and a
// bigger gem reward, so the list never runs dry. `current` is always the lifetime counter.
const QUEST_DEFS: Record<string, QuestDef> = {
  kills: {
    icon: navIcons.battle,
    title: (target) => `적 ${formatGameNumber(target)}마리 처치`,
    targets: [30, 100, 300, 1000],
    reward: 30,
    step: 20,
  },
  attack: {
    icon: statIcons.attack,
    title: (target) => `공격력 ${formatGameNumber(target)}회 강화`,
    targets: [8, 25, 60, 150],
    reward: 40,
    step: 20,
  },
  gold: {
    icon: icons.coins,
    title: (target) => `골드 ${formatGameNumber(target)} 획득`,
    targets: [2000, 10000, 50000, 250000],
    reward: 40,
    step: 20,
  },
  bossKills: {
    icon: icons.trophy,
    title: (target) => `보스 ${formatGameNumber(target)}마리 처치`,
    targets: [2, 5, 10, 25],
    reward: 60,
    step: 30,
  },
  stage: {
    icon: icons.mapTrim,
    // Targets are 0-based stage numbers; the title shows the 1-based one players see.
    title: (target) => `${STAGES[target].area}(${target + 1}) 도착`,
    targets: [4, 7, 9, 11, LAST_STAGE_NUMBER],
    finite: true,
    reward: 100,
    step: 40,
  },
  cook: {
    icon: food.cookPotTrim,
    title: (target) => `요리 ${formatGameNumber(target)}회 만들기`,
    targets: [5, 15, 40, 100],
    reward: 40,
    step: 20,
  },
  recipe: {
    icon: icons.scroll,
    title: (target) => `레시피 ${target}개 배우기`,
    targets: [2, 5, 8, RECIPES.length - STARTER_RECIPES.length],
    finite: true,
    reward: 50,
    step: 25,
  },
  buff: {
    icon: food.dishBananaMilk,
    title: (target) => `버프 요리 ${formatGameNumber(target)}회 섭취`,
    targets: [3, 10, 25, 60],
    reward: 40,
    step: 20,
  },
};

export const QUEST_ORDER = Object.keys(QUEST_DEFS);

export function getQuestIcon(id: string): number | undefined {
  return QUEST_DEFS[id]?.icon;
}

function targetFor(def: QuestDef, tier: number) {
  const { targets } = def;
  if (tier < targets.length) return targets[tier];
  return targets[targets.length - 1] * 3 ** (tier - targets.length + 1);
}

function isLastTier(def: QuestDef, tier: number) {
  return Boolean(def.finite) && tier >= def.targets.length - 1;
}

export function buildQuest(id: string, tier: number, current: number): Quest {
  const def = QUEST_DEFS[id];
  const target = targetFor(def, tier);
  return { id, tier, title: def.title(target), target, reward: def.reward + def.step * tier, current, claimed: false };
}

// After a claim: the next rung of the same quest, or the row marked done when a finite
// ladder (stages, recipes) has run out.
export function advanceQuest(quest: Quest): Quest {
  const def = QUEST_DEFS[quest.id];
  const tier = quest.tier ?? 0;
  if (!def || isLastTier(def, tier)) return { ...quest, claimed: true };
  return buildQuest(quest.id, tier + 1, quest.current);
}

// Rebuilds a saved quest list against the current ladders: titles, targets and rewards
// come from QUEST_DEFS, and a row claimed under the old one-shot system moves to tier 1.
export function migrateQuests(saved: Quest[]): Quest[] {
  return QUEST_ORDER.map((id) => {
    const old = saved.find((quest) => quest.id === id);
    if (!old) return buildQuest(id, 0, 0);
    const tier = old.tier ?? 0;
    if (old.claimed && old.tier === undefined) return advanceQuest(buildQuest(id, 0, old.current));
    const def = QUEST_DEFS[id];
    if (old.claimed && isLastTier(def, tier)) return { ...buildQuest(id, tier, old.current), claimed: true };
    return buildQuest(id, tier, old.current);
  });
}
