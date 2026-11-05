import type { Outfit, SkillId } from "../types";

// The stage (1-based, as players see it) each companion joins at, the moment 기니 arrives
// there — roughly in order of how much they add: a small gold bonus first, then the swingy
// damage outfits, and the skill cooldown cut (more casts of everything) last.
export const OUTFIT_UNLOCK_STAGE: Record<Outfit, number> = {
  default: 0,
  explorerHamster: 5, // 골드 +10%
  tetoGini: 10, // 공격력 +100%, 40% 헛스윙 (평균 약 1.2배)
  assassinGini: 14, // 공격력 -30%, 2연타 (평균 약 1.4배)
  egenGini: 21, // 스킬 쿨타임 -1분
  samuraiGini: 24, // 적마다 첫 공격 = 일반 공격 ×10 ×치명타 피해, 공격 속도 -25%, 수동 공격 불가
  chefGini: 33, // 요리 시간 -50%, 요리 대성공 +20%, 재료 드랍 100%, 공격력 -15%
  // Never reached by stage — bought instead, see OUTFIT_GEM_PRICE below.
  boxerGini: Infinity,
  witchGini: 36, // 기니 대도시(35스테이지) 보스 첫 처치 보상
};

// Companions bought with gems instead of joining at a stage (checked before
// OUTFIT_UNLOCK_STAGE in isOutfitUnlocked below).
export const OUTFIT_GEM_PRICE: Partial<Record<Outfit, number>> = {
  boxerGini: 2000,
};

// Any stage companion can also be brought along early, before reaching its stage, for this.
export const OUTFIT_EARLY_UNLOCK_GEMS = 1000;

// What it costs in gems to unlock this companion right now: its own price for gem-only ones
// (OUTFIT_GEM_PRICE), the early-unlock price for stage ones, nothing for the starter.
export function getOutfitGemPrice(outfit: Outfit): number | undefined {
  if (outfit === "default") return undefined;
  return OUTFIT_GEM_PRICE[outfit] ?? OUTFIT_EARLY_UNLOCK_GEMS;
}

// Skills: utility and short buffs early, the big damage dealers late, spread out so a new
// one opens every 15-25 levels up to Execute — the strongest passive — at level 200.
// steal is pulled down to 2 on its own — that's about when a fresh player reaches the
// first boss (see gini_balance_economy memory), so it's the one skill introduced via
// SkillTutorial right as the player has something to use it on.
export const SKILL_UNLOCK_LEVEL: Record<SkillId, number> = {
  steal: 2,
  carrotThrow: 15,
  chiliThrow: 30,
  focus: 45,
  glutton: 60,
  diligent: 75,
  barrage: 90,
  shout: 110,
  teleport: 130,
  meteor: 150,
  beam: 175,
  execute: 200,
};

// `highestStageNumber`: the furthest stage (0-based) ever reached. `purchasedOutfits`:
// companions bought with gems — gem-only ones (OUTFIT_GEM_PRICE) or stage ones unlocked early.
export function isOutfitUnlocked(outfit: Outfit, highestStageNumber: number, purchasedOutfits?: Outfit[]) {
  if (purchasedOutfits?.includes(outfit)) return true;
  if (outfit in OUTFIT_GEM_PRICE) return false;
  return outfit === "default" || highestStageNumber >= OUTFIT_UNLOCK_STAGE[outfit] - 1;
}

// Companions that join on first arriving at this stage (0-based).
export function getOutfitsUnlockedByStage(stageNumber: number) {
  return (Object.keys(OUTFIT_UNLOCK_STAGE) as Outfit[]).filter((outfit) => outfit !== "default" && OUTFIT_UNLOCK_STAGE[outfit] - 1 === stageNumber);
}

export function isSkillUnlocked(id: SkillId, level: number) {
  return level >= SKILL_UNLOCK_LEVEL[id];
}

// Skills that open exactly at this level — for the level-up announcement. (Companions
// join on reaching a stage instead; see getOutfitsUnlockedByStage.)
export function getUnlocksAtLevel(level: number) {
  return {
    skills: (Object.keys(SKILL_UNLOCK_LEVEL) as SkillId[]).filter((id) => SKILL_UNLOCK_LEVEL[id] === level),
  };
}
