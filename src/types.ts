export type Tab = "battle" | "growth" | "equipment" | "companions" | "inventory" | "wardrobe" | "shop" | "milestone" | "kitchen" | "grocery" | "recipes";
export type StatKey = "attack" | "criticalDamage" | "criticalChance" | "goldBonus";
export type BattlePhase = "idle" | "attacking" | "hit" | "defeated" | "entering";
export type PlayerAnimation = "idle" | "attack" | "critical" | "win";
export type EnemyAnimation = "idle" | "hit" | "die";
export type EnemyKind = "slime" | "mushroom" | "carrot" | "chicken" | "potato" | "mouse";
export type Outfit = "default";
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
  buffSlots?: ({ recipeId: string; expiresAt: number; durationMs: number } | null)[];
  equippedOutfit: Outfit;
  selectedTab: Tab;
  inventory: { name: string; quantity: number; type: string }[];
  equipment: Record<string, string | null>;
  companions: { name: string; unlocked: boolean }[];
  quests: Quest[];
  kills: number;
  totalGoldEarned: number;
  attackUpgrades: number;
  statLevels?: Partial<Record<StatKey, number>>;
}
