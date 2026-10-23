export type Tab = "battle" | "growth" | "equipment" | "companions" | "inventory" | "wardrobe" | "skills" | "shop" | "milestone" | "kitchen" | "grocery" | "recipes" | "cookbook" | "comics";
export type StatKey = "attack" | "criticalDamage" | "criticalChance" | "goldBonus";
export type BattlePhase = "idle" | "attacking" | "hit" | "defeated" | "entering";
export type PlayerAnimation = "idle" | "attack" | "critical" | "win";
export type EnemyAnimation = "idle" | "hit" | "die";
export type EnemyKind = "slime" | "mushroom" | "carrot" | "chicken" | "potato" | "mouse" | "cauldron" | "mudskipper" | "bluefish" | "salamander" | "monkey" | "carp" | "cactus" | "fox" | "lizard" | "mantou" | "pig" | "magpie" | "snowRabbit" | "drunkCat" | "flowerSnake" | "riceSack" | "mackerel" | "blossomCrab" | "shrineFox" | "armorBeetle" | "onsenMonkey" | "ninjaFrog" | "lanternAngler" | "clamMaid" | "gondolaDuck" | "bellCalf" | "croissantKid";
export type Outfit = "default" | "explorerHamster" | "tetoGini" | "assassinGini" | "egenGini" | "samuraiGini" | "chefGini";
export type SkillId = "beam" | "steal" | "focus" | "execute" | "shout" | "diligent" | "glutton";
export type UpgradeMode = 1 | 10 | 100 | "next" | "max";

export interface Quest {
  id: string;
  title: string;
  current: number;
  target: number;
  reward: number;
  claimed: boolean;
  // Rung on this quest's ladder (state/quests.ts); missing on saves from before ladders.
  tier?: number;
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
  // Stage indices whose boss has been beaten at least once (first-clear gem bonus);
  // missing on older saves.
  bossesCleared?: number[];
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
  // Set once the follow-up tutorial that has the player buy their first recipe is done.
  recipeTutorialDone?: boolean;
  // How many food slots are open (1–3); missing on older saves = 1.
  buffSlotsUnlocked?: number;
  buffSlots?: ({ recipeId: string; expiresAt: number; durationMs: number } | null)[];
  equippedOutfit: Outfit;
  // The one skill in the battle slot (null = none); missing on older saves.
  equippedSkill?: SkillId | null;
  // When the current skill went into the slot (ms epoch); missing on older saves.
  skillEquippedAt?: number;
  selectedTab: Tab;
  inventory: { name: string; quantity: number; type: string }[];
  // Every ingredient ever obtained (ingredient codex); missing on older saves.
  discoveredItems?: string[];
  // Kitchen recipe layout the player picked (one-column list / two-column cards).
  kitchenLayout?: "list" | "grid";
  // Bought bag expansions (see state/bag.ts); missing on older saves = none.
  bagExpansions?: number;
  // Dishes simmering in the kitchen (null = empty pot), and how many pots are open; see
  // state/cooking.ts. Missing on older saves = one empty pot.
  cookingPots?: ({ recipeId: string; startedAt: number; readyAt: number; fast?: boolean } | null)[];
  potsUnlocked?: number;
  // What the bag and the ingredient codex held when last looked at — anything newer gets a
  // "NEW"/"발견!" mark on the next visit. Missing on older saves (= nothing marked).
  bagSeen?: string[];
  // Story comics already shown (state/comics.ts); missing on older saves = none.
  seenComics?: string[];
  // Set from 설정 → "만화 다 열기": the album shows every comic regardless of progress.
  allComicsUnlocked?: boolean;
  // Companions already shown unlocked — one unlocked since gets its lock broken on the next visit.
  outfitsSeen?: Outfit[];
  // Furthest stage the map has shown — a newer one gets its path drawn in on the next visit.
  mapSeenStage?: number;
  codexSeen?: string[];
  // Recipe ids cooked at least once (the "NEW" badge, and the cookbook goal — see
  // state/cookbook.ts). Older saves are seeded from the dishes in their bag on load.
  cookedRecipes?: string[];
  equipment: Record<string, string | null>;
  // Legacy quest rows (ladder / first chapter system) — only read to migrate claims.
  quests: Quest[];
  questChapter?: number;
  // 골목 퀘스트 mission ids already claimed (state/quests.ts); missing on older saves.
  questClaimed?: string[];
  // Winged coins caught in battle (a chapter mission); missing on older saves.
  coinsCaught?: number;
  // Quirk counters behind the hidden quests; all missing on older saves.
  tetoMisses?: number;
  bagFullCount?: number;
  longNaps?: number;
  // Hidden quest ids already claimed.
  hiddenClaimed?: string[];
  kills: number;
  totalGoldEarned: number;
  attackUpgrades: number;
  statLevels?: Partial<Record<StatKey, number>>;
  // Missing on saves from before these quests existed — treated as 0.
  bossKills?: number;
  dishesCooked?: number;
  dishesEaten?: number;
}
