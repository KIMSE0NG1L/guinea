import type { EnemyKind } from "../types";

export const ENEMY_NAME: Record<EnemyKind, string> = {
  slime: "골목 슬라임",
  mushroom: "습지 버섯",
  carrot: "밭 당근토끼",
};

export const BOSS_NAME: Record<EnemyKind, string> = {
  slime: "왕 슬라임",
  mushroom: "버섯 대왕",
  carrot: "감자 골렘",
};

// Indexed by stageNumber. Only these stages have a theme, mob, and boss implemented —
// clearing the last one's boss loops back to the first.
export const STAGES: { area: string; enemyKind: EnemyKind }[] = [
  { area: "골목", enemyKind: "slime" },
  { area: "버섯 늪", enemyKind: "mushroom" },
  { area: "거대 채소 농장", enemyKind: "carrot" },
];

export const LAST_STAGE_NUMBER = STAGES.length - 1;

export function getStageCode(stageNumber: number) {
  return `1-${stageNumber + 1}`;
}

export function getEnemyKind(stageNumber: number): EnemyKind {
  return STAGES[Math.min(stageNumber, LAST_STAGE_NUMBER)].enemyKind;
}
