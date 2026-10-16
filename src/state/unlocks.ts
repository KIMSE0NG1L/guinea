import type { Outfit, SkillId } from "../types";

// Character level each companion / skill opens at, roughly in order of how much it adds.
// Companions: a small gold bonus first, then the swingy damage outfits, and the skill
// cooldown cut (more casts of everything) last.
export const OUTFIT_UNLOCK_LEVEL: Record<Outfit, number> = {
  default: 1,
  explorerHamster: 5, // 골드 +10%
  tetoGini: 10, // 공격력 +100%, 40% 헛스윙 (평균 약 1.2배)
  assassinGini: 15, // 공격력 -30%, 2연타 (평균 약 1.4배)
  egenGini: 20, // 스킬 쿨타임 -1분
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

export function isOutfitUnlocked(outfit: Outfit, level: number) {
  return level >= OUTFIT_UNLOCK_LEVEL[outfit];
}

export function isSkillUnlocked(id: SkillId, level: number) {
  return level >= SKILL_UNLOCK_LEVEL[id];
}

// What opens exactly at this level — for the level-up announcement.
export function getUnlocksAtLevel(level: number) {
  return {
    outfits: (Object.keys(OUTFIT_UNLOCK_LEVEL) as Outfit[]).filter((outfit) => outfit !== "default" && OUTFIT_UNLOCK_LEVEL[outfit] === level),
    skills: (Object.keys(SKILL_UNLOCK_LEVEL) as SkillId[]).filter((id) => SKILL_UNLOCK_LEVEL[id] === level),
  };
}
