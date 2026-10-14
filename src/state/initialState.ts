import type { GameState } from "../types";
import { formatGameNumber } from "./gameMath";
import { getStageLabel } from "./stages";

export const initialState: GameState = {
  gold: 1250,
  gems: 10,
  level: 1,
  experience: 32,
  attack: 12,
  criticalDamage: 200,
  criticalChance: 5,
  goldBonus: 10,
  currentStage: getStageLabel(0),
  stageNumber: 0,
  stageKills: 0,
  highestStageNumber: 0,
  knownRecipes: ["carrot-soup"],
  equippedOutfit: "default",
  selectedTab: "battle",
  inventory: [
    { name: "당근", quantity: 5, type: "food" },
    { name: "낡은 천", quantity: 2, type: "material" },
    { name: "작은 돌", quantity: 8, type: "material" },
  ],
  equipment: { weapon: null, hat: null, armor: null, accessory: null },
  companions: [
    { name: "골목 햄스터", unlocked: false },
    { name: "떠돌이 토끼", unlocked: false },
    { name: "수상한 두더지", unlocked: false },
  ],
  quests: [
    { id: "kills", title: "적 10마리 처치", current: 0, target: 10, reward: 300, claimed: false },
    { id: "attack", title: "공격력 5회 강화", current: 0, target: 5, reward: 500, claimed: false },
    { id: "gold", title: `골드 ${formatGameNumber(1000)} 획득`, current: 0, target: 1000, reward: 700, claimed: false },
  ],
  kills: 0,
  totalGoldEarned: 0,
  attackUpgrades: 0,
  statLevels: {
    attack: 1,
    criticalDamage: 1,
    criticalChance: 1,
    goldBonus: 1,
  },
};
