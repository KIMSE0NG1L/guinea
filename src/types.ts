export type Tab = "battle" | "growth" | "equipment" | "companions" | "inventory" | "wardrobe" | "shop";
export type StatKey = "attack" | "criticalDamage" | "criticalChance" | "goldBonus";
export type BattlePhase = "idle" | "attacking" | "hit" | "defeated" | "entering";
export type PlayerAnimation = "idle" | "attack" | "critical" | "win";
export type EnemyAnimation = "idle" | "hit" | "die";
export type EnemyKind = "slime" | "mushroom" | "carrot";
export type Outfit = "default" | "acorn" | "pauper";
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
