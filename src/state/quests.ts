import type { Quest } from "../types";
import { food, icons, navIcons, statIcons } from "../assets";
import { formatGameNumber } from "./gameMath";
import { LAST_STAGE_NUMBER, STAGES } from "./stages";
import { RECIPES, STARTER_RECIPES } from "./recipes";
import { getCookbookQuestTargets } from "./cookbook";

type QuestDef = {
  icon: number;
  title: (target: number) => string;
  // Hand-picked targets; counter quests keep going past them (×`growth` each tier,
  // default 2), `finite` ones stop at the last entry. Past QUEST_REWARD_CAP the same gem
  // reward simply repeats; rungs are spaced so payouts don't come too often.
  targets: number[];
  growth?: number;
  finite?: boolean;
  // Gems for tier 0, plus `step` more for every tier after — never past QUEST_REWARD_CAP.
  reward: number;
  step: number;
};

// Each quest row is a ladder: claiming it moves the same row on to a bigger target and a
// bigger gem reward, so the list never runs dry. `current` is always the lifetime counter.
const QUEST_DEFS: Record<string, QuestDef> = {
  kills: {
    icon: navIcons.battle,
    title: (target) => `적 ${formatGameNumber(target)}마리 처치`,
    targets: [30, 100, 300, 800, 2000, 5000],
    growth: 2.5,
    reward: 20,
    step: 5,
  },
  attack: {
    icon: statIcons.attack,
    title: (target) => `공격력 ${formatGameNumber(target)}회 강화`,
    targets: [8, 25, 60, 120, 250],
    growth: 2,
    reward: 20,
    step: 5,
  },
  gold: {
    icon: icons.coins,
    title: (target) => `골드 ${formatGameNumber(target)} 획득`,
    targets: [2000, 20000, 200000, 2000000],
    growth: 5,
    reward: 20,
    step: 5,
  },
  bossKills: {
    icon: icons.trophy,
    title: (target) => `보스 ${formatGameNumber(target)}마리 처치`,
    targets: [2, 6, 15, 30, 60],
    growth: 2,
    reward: 30,
    step: 5,
  },
  stage: {
    icon: icons.mapTrim,
    // Targets are 0-based stage numbers; the title shows the 1-based one players see.
    title: (target) => `${STAGES[target].area}(${target + 1}) 도착`,
    targets: stageTargets(),
    finite: true,
    reward: 30,
    step: 5,
  },
  cook: {
    icon: food.cookPotTrim,
    title: (target) => `요리 ${formatGameNumber(target)}회 만들기`,
    targets: [5, 20, 50, 120, 300],
    growth: 2.5,
    reward: 20,
    step: 5,
  },
  recipe: {
    icon: icons.scroll,
    title: (target) => `레시피 ${target}개 배우기`,
    targets: recipeTargets(),
    finite: true,
    reward: 25,
    step: 5,
  },
  // 《세상의 모든 맛》 pages: every 5, then the whole book (grows as recipes are added).
  cookbook: {
    icon: icons.codexBook,
    title: (target) => (target >= RECIPES.length ? `요리책 완성 (${target}장)` : `요리책 ${target}장 채우기`),
    targets: getCookbookQuestTargets(),
    finite: true,
    reward: 25,
    step: 5,
  },
  buff: {
    icon: food.dishBananaMilk,
    title: (target) => `버프 요리 ${formatGameNumber(target)}회 섭취`,
    targets: [3, 12, 30, 75, 180],
    growth: 2.5,
    reward: 20,
    step: 5,
  },
};

export const QUEST_ORDER = Object.keys(QUEST_DEFS);

// No single quest pays more than this many gems, however far up its ladder.
export const QUEST_REWARD_CAP = 50;

export function getQuestIcon(id: string): number | undefined {
  return QUEST_DEFS[id]?.icon;
}

// Rounds to two significant figures so generated rungs read as tidy numbers.
function tidy(value: number) {
  const magnitude = 10 ** Math.max(0, Math.floor(Math.log10(value)) - 1);
  return Math.round(value / magnitude) * magnitude;
}

function targetFor(def: QuestDef, tier: number) {
  const { targets } = def;
  if (tier < targets.length) return targets[tier];
  return tidy(targets[targets.length - 1] * (def.growth ?? 2) ** (tier - targets.length + 1));
}

// Every fourth stage from 감자 동굴(5) to the last one (0-based stage numbers).
function stageTargets() {
  const targets: number[] = [];
  for (let stage = 4; stage < LAST_STAGE_NUMBER; stage += 4) targets.push(stage);
  return [...targets, LAST_STAGE_NUMBER];
}

// Every fifth recipe learned, up to all of them.
function recipeTargets() {
  const total = RECIPES.length - STARTER_RECIPES.length;
  const targets = [2];
  for (let count = 7; count < total; count += 5) targets.push(count);
  return [...targets, total];
}

function isLastTier(def: QuestDef, tier: number) {
  return Boolean(def.finite) && tier >= def.targets.length - 1;
}

export function buildQuest(id: string, tier: number, current: number): Quest {
  const def = QUEST_DEFS[id];
  const target = targetFor(def, tier);
  return { id, tier, title: def.title(target), target, reward: Math.min(QUEST_REWARD_CAP, def.reward + def.step * tier), current, claimed: false };
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
