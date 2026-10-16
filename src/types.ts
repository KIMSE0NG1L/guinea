export type Tab = "battle" | "growth" | "equipment" | "companions" | "inventory" | "wardrobe" | "skills" | "shop" | "milestone" | "kitchen" | "grocery" | "recipes";
export type StatKey = "attack" | "criticalDamage" | "criticalChance" | "goldBonus";
export type BattlePhase = "idle" | "attacking" | "hit" | "defeated" | "entering";
export type PlayerAnimation = "idle" | "attack" | "critical" | "win";
export type EnemyAnimation = "idle" | "hit" | "die";
export type EnemyKind = "slime" | "mushroom" | "carrot" | "chicken" | "potato" | "mouse" | "cauldron" | "mudskipper" | "bluefish" | "salamander" | "monkey" | "carp" | "cactus" | "fox" | "lizard";
export type Outfit = "default" | "explorerHamster" | "tetoGini" | "assassinGini" | "egenGini";
export type SkillId = "beam" | "steal" | "focus" | "execute" | "shout" | "diligent" | "glutton";
export type UpgradeMode = 1 | 10 | 100 | "next" | "max";

export interface Quest {
  id: string;
  title: string;
  current: number;
  target: number;
  reward: number;
  claimed: boolean;
}

export interface GameState {
  gold: number;
  gems: number;
  level: number;
  experience: number;
  attack: number;
  criticalDamage: number;
  criticalChance?: number;
  goldBonus: number;
  currentStage: string;
  stageNumber: number;
  stageKills: number;
  // Furthest stage reached — every stage up to it can be revisited from the milestone map.
  highestStageNumber?: number;
  // Recipe ids the player has learned; missing on saves from before the recipe shop.
  knownRecipes?: string[];
  // Food buff slots on the battle screen (null = empty); missing on older saves.
  // When the ad-for-2x-speed boost runs out (epoch ms); saved so it survives a restart.
  speedBoostUntil?: number;
  // Shown on the header profile; missing on older saves (falls back to DEFAULT_NICKNAME).
  nickname?: string;
  // Set once the first-run tutorial is finished or skipped; missing on older saves.
  tutorialDone?: boolean;
  buffSlots?: ({ recipeId: string; expiresAt: number; durationMs: number } | null)[];
  equippedOutfit: Outfit;
  // The one skill in the battle slot (null = none); missing on older saves.
  equippedSkill?: SkillId | null;
  // When the current skill went into the slot (ms epoch); missing on older saves.
  skillEquippedAt?: number;
  selectedTab: Tab;
  inventory: { name: string; quantity: number; type: string }[];
  equipment: Record<string, string | null>;
  quests: Quest[];
  kills: number;
  totalGoldEarned: number;
  attackUpgrades: number;
  statLevels?: Partial<Record<StatKey, number>>;
  // Missing on saves from before these quests existed — treated as 0.
  bossKills?: number;
  dishesCooked?: number;
  dishesEaten?: number;
}
