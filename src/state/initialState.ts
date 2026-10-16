import type { GameState } from "../types";
import { buildQuest, QUEST_ORDER } from "./quests";
import { getStageLabel } from "./stages";

export const DEFAULT_NICKNAME = "꼬질꼬질 기니";

export const initialState: GameState = {
  nickname: DEFAULT_NICKNAME,
  tutorialDone: false,
  recipeTutorialDone: false,
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
  knownRecipes: [],
  equippedOutfit: "default",
  equippedSkill: null,
  selectedTab: "battle",
  // Empty — the first slime after the intro drops the 초록 젤리 for the recipe tutorial.
  inventory: [],
  bagExpansions: 0,
  equipment: { weapon: null, hat: null, armor: null, accessory: null },
  quests: QUEST_ORDER.map((id) => buildQuest(id, 0, 0)),
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
