import type { GameState } from "../types";
import { formatGameNumber } from "./gameMath";
import { getStageLabel } from "./stages";

export const initialState: GameState = {
  gold: 1250,
  gems: 10,
  level: 1,
  experience: 32,
  attack: 6,
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
    { id: "kills", title: "적 30마리 처치", current: 0, target: 30, reward: 400, claimed: false },
    { id: "attack", title: "공격력 8회 강화", current: 0, target: 8, reward: 600, claimed: false },
    { id: "gold", title: `골드 ${formatGameNumber(2000)} 획득`, current: 0, target: 2000, reward: 900, claimed: false },
    { id: "bossKills", title: "보스 2마리 처치", current: 0, target: 2, reward: 1200, claimed: false },
    { id: "stage", title: "감자 동굴(1-5) 도착", current: 0, target: 4, reward: 1500, claimed: false },
    { id: "cook", title: "요리 5회 만들기", current: 0, target: 5, reward: 700, claimed: false },
    { id: "recipe", title: "레시피 2개 배우기", current: 0, target: 2, reward: 900, claimed: false },
    { id: "buff", title: "버프 요리 3회 섭취", current: 0, target: 3, reward: 600, claimed: false },
  ],
  kills: 0,
  totalGoldEarned: 0,
  attackUpgrades: 0,
  bossKills: 0,
  dishesCooked: 0,
  dishesEaten: 0,
  statLevels: {
    attack: 1,
    criticalDamage: 1,
    criticalChance: 1,
    goldBonus: 1,
  },
};
