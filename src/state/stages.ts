import type { EnemyKind } from "../types";

export const ENEMY_NAME: Record<EnemyKind, string> = {
  slime: "뒷산 슬라임",
  mushroom: "습지 버섯",
  carrot: "밭 당근토끼",
  chicken: "꼬꼬알",
  potato: "꼬마감자",
  mouse: "도시 쥐",
  cauldron: "투덜이 냄비",
  mudskipper: "심술 망둥어",
  bluefish: "성난 꽁치",
  salamander: "용암 도마뱀",
  monkey: "바나숭이",
  carp: "연못 잉어",
  cactus: "꼬마 선인장",
};

export const BOSS_NAME: Record<EnemyKind, string> = {
  slime: "왕 슬라임",
  mushroom: "버섯 대왕",
  carrot: "당근 거인",
  chicken: "꼬꼬마",
  potato: "싹난감자",
  mouse: "도둑 뚱냥이",
  cauldron: "폭식 냉장고",
  mudskipper: "킹크랩",
  bluefish: "포악한 상어",
  salamander: "용암 슬라임",
  monkey: "거대식충식물",
  carp: "개천용",
  cactus: "탈수 직전 낙타",
};

// Indexed by stageNumber. Only these stages have a theme, mob, and boss implemented —
// clearing the last one's boss loops back to the first.
export const STAGES: { area: string; enemyKind: EnemyKind }[] = [
  { area: "뒷산", enemyKind: "slime" },
  { area: "버섯 늪", enemyKind: "mushroom" },
  { area: "거대 채소 농장", enemyKind: "carrot" },
  { area: "꼬꼬 농장", enemyKind: "chicken" },
  { area: "감자 동굴", enemyKind: "potato" },
  { area: "평범한 마을", enemyKind: "mouse" },
  { area: "부잣집 주방", enemyKind: "cauldron" },
  { area: "항구 해변", enemyKind: "mudskipper" },
  { area: "침몰선 산호초", enemyKind: "bluefish" },
  { area: "화산섬", enemyKind: "salamander" },
  { area: "열대 정글", enemyKind: "monkey" },
  { area: "오아시스", enemyKind: "carp" },
  { area: "사막", enemyKind: "cactus" },
];

export const LAST_STAGE_NUMBER = STAGES.length - 1;

// Regular-mob kills needed in a stage before the boss spawns automatically.
export const STAGE_KILL_TARGET = 25;

// Un-scaled HP at stage 1 — getEnemyMaxHp below grows this per stage. The boss sits at
// 10x a regular mob, the usual range for a stage-gate boss (vs. ~30-100x for a raid-tier
// one) — enough that grinding 25 kills to reach it actually pays off in a real fight.
export const MOB_BASE_HP = 120;
export const BOSS_BASE_HP = MOB_BASE_HP * 15;

// Every stage's monsters are this many times tougher than the previous stage's.
const STAGE_HP_GROWTH = 1.8;

export function getEnemyMaxHp(stageNumber: number, boss: boolean) {
  return Math.round((boss ? BOSS_BASE_HP : MOB_BASE_HP) * STAGE_HP_GROWTH ** stageNumber);
}

export function getStageCode(stageNumber: number) {
  return `1-${stageNumber + 1}`;
}

// "1-1 뒷산" — the code plus its area name, for the battle header/stage-advance banner.
// getStageCode alone is still used for the milestone map's compact round badge, where the
// area name is already shown separately right next to it.
export function getStageLabel(stageNumber: number) {
  const area = STAGES[Math.min(stageNumber, LAST_STAGE_NUMBER)].area;
  return `${getStageCode(stageNumber)} ${area}`;
}

export function getEnemyKind(stageNumber: number): EnemyKind {
  return STAGES[Math.min(stageNumber, LAST_STAGE_NUMBER)].enemyKind;
}
