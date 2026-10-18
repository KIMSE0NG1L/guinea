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
};

// Skills: utility and short buffs early, the big damage dealers late.
export const SKILL_UNLOCK_LEVEL: Record<SkillId, number> = {
  steal: 3,
  focus: 6,
  glutton: 9,
  diligent: 12,
  shout: 16,
  beam: 20,
  execute: 25,
};

// `highestStageNumber`: the furthest stage (0-based) ever reached.
export function isOutfitUnlocked(outfit: Outfit, highestStageNumber: number) {
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
