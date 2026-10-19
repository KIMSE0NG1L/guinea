import type { GameState, Outfit, Quest } from "../types";
import { food, frameImages, icons, navIcons, statIcons, uiImages } from "../assets";
import { formatGameNumber, getStatLevel } from "./gameMath";
import { STAGES } from "./stages";
import { RECIPES, STARTER_RECIPES } from "./recipes";
import { getCookbookProgress } from "./cookbook";
import { GROCERY } from "./grocery";
import { isOutfitUnlocked, OUTFIT_UNLOCK_STAGE } from "./unlocks";

// What a mission measures — always a lifetime number read straight off the save, so a
// mission is done the moment that number reaches its target (even if that happened before
// its chapter opened).
type Metric =
  | "kills"
  | "gold"
  | "bossKills"
  | "stage"
  | "attackUpgrades"
  | "critDamageLevel"
  | "level"
  | "cooked"
  | "eaten"
  | "recipes"
  | "cookbook"
  | "ingredients"
  | "coinsCaught"
  | "foodSlots"
  | "bagExpansions"
  | "companions";

const METRICS: Record<Metric, { icon: number; title: (target: number) => string; read: (state: GameState) => number }> = {
  kills: { icon: navIcons.battle, title: (n) => `적 ${formatGameNumber(n)}마리 처치`, read: (s) => s.kills },
  gold: { icon: icons.coins, title: (n) => `골드 ${formatGameNumber(n)} 획득`, read: (s) => s.totalGoldEarned },
  bossKills: { icon: icons.trophy, title: (n) => `보스 ${formatGameNumber(n)}마리 처치`, read: (s) => s.bossKills ?? 0 },
  stage: {
    icon: icons.mapTrim,
    title: (n) => `${STAGES[n - 1].area}(${n}) 도착`,
    read: (s) => (s.highestStageNumber ?? s.stageNumber) + 1,
  },
  attackUpgrades: { icon: statIcons.attack, title: (n) => `공격력 ${formatGameNumber(n)}회 강화`, read: (s) => s.attackUpgrades },
  critDamageLevel: {
    icon: statIcons.criticalDamage,
    title: (n) => `치명타 피해 Lv.${formatGameNumber(n)} 달성`,
    read: (s) => getStatLevel(s, "criticalDamage"),
  },
  level: { icon: icons.star, title: (n) => `기니 Lv.${formatGameNumber(n)} 달성`, read: (s) => s.level },
  cooked: { icon: food.cookPotTrim, title: (n) => `요리 ${formatGameNumber(n)}회 만들기`, read: (s) => s.dishesCooked ?? 0 },
  eaten: { icon: food.dishBananaMilk, title: (n) => `버프 요리 ${formatGameNumber(n)}회 먹기`, read: (s) => s.dishesEaten ?? 0 },
  recipes: {
    icon: icons.scroll,
    title: (n) => `레시피 ${n}개 배우기`,
    read: (s) => (s.knownRecipes ?? []).filter((id) => !STARTER_RECIPES.includes(id)).length,
  },
  cookbook: { icon: icons.codexBook, title: (n) => `요리책 ${n}장 채우기`, read: (s) => getCookbookProgress(s.cookedRecipes) },
  ingredients: { icon: icons.codexIngredient, title: (n) => `식재료 ${n}종 모으기`, read: (s) => (s.discoveredItems ?? []).length },
  coinsCaught: { icon: uiImages.coinWinged, title: (n) => `날개 코인 ${n}개 잡기`, read: (s) => s.coinsCaught ?? 0 },
  foodSlots: { icon: frameImages.slotPlus, title: (n) => `음식 슬롯 ${n}칸 열기`, read: (s) => s.buffSlotsUnlocked ?? 1 },
  bagExpansions: { icon: icons.backpackTrim, title: (n) => `가방 ${n}번 늘리기`, read: (s) => s.bagExpansions ?? 0 },
  companions: {
    icon: navIcons.companions,
    title: (n) => `동료 ${n}명 만나기`,
    read: (s) =>
      (Object.keys(OUTFIT_UNLOCK_STAGE) as Outfit[]).filter(
        (outfit) => outfit !== "default" && isOutfitUnlocked(outfit, s.highestStageNumber ?? s.stageNumber),
      ).length,
  },
};

type Mission = { metric: Metric; target: number; reward: number };
type Chapter = { title: string; line: string; level: number; missions: Mission[] };

const LAST_STAGE = STAGES.length;
const ALL_RECIPES = RECIPES.length - STARTER_RECIPES.length;
const ALL_COMPANIONS = Object.keys(OUTFIT_UNLOCK_STAGE).length - 1;
const stage = (n: number) => Math.min(n, LAST_STAGE);

// The 골목 퀘스트 storybook: each chapter opens once 기니 reaches its `level`, and stays
// open — the player can flip between every opened chapter. Later chapters ask for more and
// bring in new kinds of missions. Rewards stay within QUEST_REWARD_CAP.
export const CHAPTERS: Chapter[] = [
  {
    title: "1장: 골목의 기니",
    level: 1,
    line: "기니는 오늘도 배가 고팠다.",
    missions: [
      { metric: "kills", target: 30, reward: 20 },
      { metric: "attackUpgrades", target: 8, reward: 20 },
      { metric: "gold", target: 2000, reward: 20 },
      { metric: "bossKills", target: 2, reward: 30 },
      { metric: "stage", target: stage(5), reward: 30 },
      { metric: "cooked", target: 5, reward: 20 },
      { metric: "recipes", target: 2, reward: 25 },
      { metric: "eaten", target: 3, reward: 20 },
    ],
  },
  {
    title: "2장: 첫 장바구니",
    level: 10,
    line: "할머니 가게 앞에서, 기니는 처음으로 장바구니를 들었다.",
    missions: [
      { metric: "kills", target: 300, reward: 25 },
      { metric: "level", target: 15, reward: 25 },
      { metric: "ingredients", target: 15, reward: 25 },
      { metric: "cooked", target: 20, reward: 25 },
      { metric: "recipes", target: 6, reward: 30 },
      { metric: "stage", target: stage(8), reward: 30 },
      { metric: "coinsCaught", target: 5, reward: 30 },
    ],
  },
  {
    title: "3장: 바다 내음",
    level: 25,
    line: "짠 내 나는 바람이 처음 맡아 보는 맛을 실어 왔다.",
    missions: [
      { metric: "stage", target: stage(12), reward: 35 },
      { metric: "bossKills", target: 15, reward: 35 },
      { metric: "critDamageLevel", target: 20, reward: 30 },
      { metric: "cookbook", target: 12, reward: 35 },
      { metric: "foodSlots", target: 2, reward: 40 },
      { metric: "gold", target: 200000, reward: 30 },
      { metric: "eaten", target: 30, reward: 30 },
    ],
  },
  {
    title: "4장: 동쪽 나라의 식탁",
    level: 50,
    line: "김이 모락모락 피어오르는 나라에서, 기니의 수첩이 빼곡해졌다.",
    missions: [
      { metric: "stage", target: stage(22), reward: 40 },
      { metric: "kills", target: 3000, reward: 40 },
      { metric: "level", target: 60, reward: 40 },
      { metric: "recipes", target: 18, reward: 40 },
      { metric: "ingredients", target: 40, reward: 40 },
      { metric: "bagExpansions", target: 1, reward: 35 },
      { metric: "companions", target: 3, reward: 45 },
    ],
  },
  {
    title: "5장: 용궁의 잔치",
    level: 90,
    line: "바닷속 잔칫상 앞에서, 기니는 아직 배울 맛이 많다는 걸 알았다.",
    missions: [
      { metric: "stage", target: stage(30), reward: 45 },
      { metric: "bossKills", target: 60, reward: 45 },
      { metric: "cooked", target: 300, reward: 45 },
      { metric: "cookbook", target: 30, reward: 50 },
      { metric: "attackUpgrades", target: 250, reward: 45 },
      { metric: "gold", target: 20000000, reward: 45 },
      { metric: "coinsCaught", target: 50, reward: 45 },
    ],
  },
  {
    title: "6장: 세상의 모든 맛",
    level: 140,
    line: "마지막 페이지를 채우는 날, 기니는 더 이상 배고프지 않을 것이다.",
    missions: [
      { metric: "stage", target: LAST_STAGE, reward: 50 },
      { metric: "kills", target: 20000, reward: 50 },
      { metric: "level", target: 150, reward: 50 },
      { metric: "foodSlots", target: 3, reward: 50 },
      { metric: "recipes", target: ALL_RECIPES, reward: 50 },
      { metric: "ingredients", target: Math.min(80, GROCERY.length), reward: 50 },
      { metric: "companions", target: ALL_COMPANIONS, reward: 50 },
    ],
  },
];

// No single quest pays more than this many gems.
export const QUEST_REWARD_CAP = 50;

function missionId(chapter: number, metric: Metric) {
  return `c${chapter + 1}-${metric}`;
}

function findMission(id: string): Mission | undefined {
  const match = /^c(\d+)-(\w+)$/.exec(id);
  if (!match) return undefined;
  return CHAPTERS[Number(match[1]) - 1]?.missions.find((item) => item.metric === match[2]);
}

export function getQuestIcon(id: string): number | undefined {
  const mission = findMission(id);
  return mission ? METRICS[mission.metric].icon : undefined;
}

export function isChapterOpen(state: GameState, chapter: number) {
  return state.level >= (CHAPTERS[chapter]?.level ?? Infinity);
}

// A chapter's missions with progress read live from the save and claims from questClaimed.
export function getChapterQuests(state: GameState, chapter: number): Quest[] {
  const claimed = state.questClaimed ?? [];
  return (CHAPTERS[chapter]?.missions ?? []).map((mission) => {
    const id = missionId(chapter, mission.metric);
    return {
      id,
      title: METRICS[mission.metric].title(mission.target),
      target: mission.target,
      reward: Math.min(QUEST_REWARD_CAP, mission.reward),
      current: METRICS[mission.metric].read(state),
      claimed: claimed.includes(id),
    };
  });
}

function chapterHasClaimable(state: GameState, chapter: number) {
  return isChapterOpen(state, chapter) && getChapterQuests(state, chapter).some((quest) => !quest.claimed && quest.current >= quest.target);
}

export function hasClaimableQuest(state: GameState) {
  return CHAPTERS.some((_, index) => chapterHasClaimable(state, index)) || getRevealedHiddenQuests(state).some((quest) => !quest.claimed);
}

// Where the quest window opens: the first chapter with something to claim, otherwise the
// newest open chapter.
export function getDefaultChapter(state: GameState) {
  const claimable = CHAPTERS.findIndex((_, index) => chapterHasClaimable(state, index));
  if (claimable >= 0) return claimable;
  let newest = 0;
  CHAPTERS.forEach((_, index) => {
    if (isChapterOpen(state, index)) newest = index;
  });
  return newest;
}

// Pays one mission's gems — only from a chapter that's open.
export function claimMission(state: GameState, id: string): GameState {
  const match = /^c(\d+)-/.exec(id);
  const chapter = match ? Number(match[1]) - 1 : -1;
  if (!isChapterOpen(state, chapter)) return state;
  const quest = getChapterQuests(state, chapter).find((item) => item.id === id);
  if (!quest || quest.claimed || quest.current < quest.target) return state;
  return { ...state, gems: state.gems + quest.reward, questClaimed: [...(state.questClaimed ?? []), id] };
}

// Older saves keep their claims: chapter-era saves stored them on `quests`, and saves from
// the ladder system count a chapter-1 mission as claimed if its first rung was.
const LEGACY_IDS: Partial<Record<Metric, string>> = { eaten: "buff", cooked: "cook", recipes: "recipe", attackUpgrades: "attack" };

export function migrateQuestClaims(state: GameState): string[] {
  if (state.questClaimed) return state.questClaimed;
  const saved = state.quests ?? [];
  const claimed = saved.filter((quest) => /^c\d+-/.test(quest.id) && quest.claimed).map((quest) => quest.id);
  // Chapters before the one a chapter-era save was on were all claimed to get there.
  for (let chapter = 0; chapter < (state.questChapter ?? 0); chapter++) {
    CHAPTERS[chapter].missions.forEach((mission) => claimed.push(missionId(chapter, mission.metric)));
  }
  if (state.questChapter === undefined) {
    CHAPTERS[0].missions.forEach((mission) => {
      const legacy = saved.find((quest) => quest.id === (LEGACY_IDS[mission.metric] ?? mission.metric));
      if (legacy && (legacy.claimed || (legacy.tier ?? 0) > 0)) claimed.push(missionId(0, mission.metric));
    });
  }
  return [...new Set(claimed)];
}

export function getChapterInfo(state: GameState, chapter: number) {
  const quests = getChapterQuests(state, chapter);
  return {
    index: chapter,
    title: CHAPTERS[chapter].title,
    line: CHAPTERS[chapter].line,
    level: CHAPTERS[chapter].level,
    total: CHAPTERS.length,
    open: isChapterOpen(state, chapter),
    claimable: chapterHasClaimable(state, chapter),
    quests,
    claimedCount: quests.filter((quest) => quest.claimed).length,
  };
}

// Hidden quests: never listed until they've been achieved — then they show up in their
// own section with a reveal, ready to claim. Each reads one of the save's quirk counters.
type HiddenQuest = { id: string; title: string; flavor: string; target: number; reward: number; read: (state: GameState) => number };

export const HIDDEN_QUESTS: HiddenQuest[] = [
  {
    id: "teto-miss-100",
    title: "테토기니 헛스윙 100번",
    flavor: "선글라스… 이제 좀 벗어도 되지 않을까?",
    target: 100,
    reward: 50,
    read: (s) => s.tetoMisses ?? 0,
  },
  {
    id: "teto-miss-1000",
    title: "테토기니 헛스윙 1,000번",
    flavor: "허공 가르기 장인. 바람만은 확실히 베었다.",
    target: 1000,
    reward: 50,
    read: (s) => s.tetoMisses ?? 0,
  },
  {
    id: "bag-full-20",
    title: "가방 꽉 참 20번",
    flavor: "정리는… 내일부터 하자.",
    target: 20,
    reward: 30,
    read: (s) => s.bagFullCount ?? 0,
  },
  {
    id: "long-nap-3",
    title: "8시간 꽉 채워 자고 오기 3번",
    flavor: "기니 혼자서도 아주 잘 지냈어요.",
    target: 3,
    reward: 30,
    read: (s) => s.longNaps ?? 0,
  },
  {
    id: "coins-200",
    title: "날개 코인 200개 잡기",
    flavor: "날개 달린 동전만 보면 손이 먼저 나간다.",
    target: 200,
    reward: 50,
    read: (s) => s.coinsCaught ?? 0,
  },
];

// Hidden quests the player has achieved (claimed or not) — the only ones ever shown.
export function getRevealedHiddenQuests(state: GameState) {
  const claimed = state.hiddenClaimed ?? [];
  return HIDDEN_QUESTS.filter((quest) => quest.read(state) >= quest.target).map((quest) => ({
    ...quest,
    claimed: claimed.includes(quest.id),
  }));
}

export function claimHiddenQuest(state: GameState, id: string): GameState {
  const quest = HIDDEN_QUESTS.find((item) => item.id === id);
  const claimed = state.hiddenClaimed ?? [];
  if (!quest || claimed.includes(id) || quest.read(state) < quest.target) return state;
  return { ...state, gems: state.gems + Math.min(QUEST_REWARD_CAP, quest.reward), hiddenClaimed: [...claimed, id] };
}

// Everything ready to claim right now — open chapters' missions and revealed hidden quests.
export function getAllClaimable(state: GameState) {
  const missions = CHAPTERS.flatMap((_, index) =>
    isChapterOpen(state, index) ? getChapterQuests(state, index).filter((quest) => !quest.claimed && quest.current >= quest.target) : [],
  );
  const hidden = getRevealedHiddenQuests(state).filter((quest) => !quest.claimed);
  return [...missions, ...hidden].map((quest) => ({ id: quest.id, reward: Math.min(QUEST_REWARD_CAP, quest.reward) }));
}
