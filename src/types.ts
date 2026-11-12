import type { SkillTimers } from "./state/skills";
import type { CookGrade } from "./state/buffs";
export type Tab = "battle" | "companions" | "inventory" | "skills" | "shop" | "milestone" | "kitchen" | "grocery" | "recipes" | "cookbook" | "comics" | "stats" | "guide" | "credits" | "backup";
export type StatKey = "attack" | "criticalDamage" | "criticalChance" | "goldBonus";
export type BattlePhase = "idle" | "attacking" | "hit" | "defeated" | "entering";
export type PlayerAnimation = "idle" | "attack" | "critical" | "win";
export type EnemyAnimation = "idle" | "hit" | "die";
export type EnemyKind = "slime" | "mushroom" | "carrot" | "chicken" | "potato" | "mouse" | "cauldron" | "mudskipper" | "bluefish" | "salamander" | "monkey" | "carp" | "cactus" | "fox" | "lizard" | "mantou" | "pig" | "magpie" | "snowRabbit" | "drunkCat" | "flowerSnake" | "riceSack" | "mackerel" | "blossomCrab" | "shrineFox" | "armorBeetle" | "onsenMonkey" | "ninjaFrog" | "lanternAngler" | "clamMaid" | "gondolaDuck" | "bellCalf" | "croissantKid" | "sleepyGini" | "sleepwalkerGini" | "candyBasketSlime" | "bee" | "angryCandyBasketSlime" | "thiefCrow" | "spiceElephant" | "teaYak" | "saffronParrot";
export type Outfit = "default" | "explorerHamster" | "tetoGini" | "assassinGini" | "egenGini" | "samuraiGini" | "chefGini" | "boxerGini" | "witchGini";
export type SkillId = "beam" | "steal" | "focus" | "execute" | "shout" | "diligent" | "glutton" | "barrage" | "teleport" | "carrotThrow" | "chiliThrow" | "meteor";
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
  // Furthest stage reached this loop — every stage up to it can be revisited from the
  // milestone map. Resets to 0 each time stageNumber wraps back to stage 1 (see
  // state/stages.ts's getDifficultyStage/getPeakAreaStage for what stays permanent instead).
  highestStageNumber?: number;
  // Times stageNumber has wrapped back to stage 1 after the last stage's boss. Missing means
  // never yet (stage difficulty and highestStageNumber's lock both key off this).
  loopsCompleted?: number;
  // state/progression.ts, all missing on older saves: each companion's
  // unspent shards and level, today's shard ads, and each stage's stars (STAR_* bits).
  companionShards?: Partial<Record<Outfit, number>>;
  companionLevels?: Partial<Record<Outfit, number>>;
  shardAds?: { day: string; count: number };
  stageStars?: Record<string, number>;
  // Ingredients got from monsters, for the codex's gold bonus (buying one doesn't count).
  // Saves from before this start from everything their codex already held.
  droppedItems?: string[];
  // Recipe ids the player has learned; missing on saves from before the recipe shop.
  knownRecipes?: string[];
  // Food buff slots on the battle screen (null = empty); missing on older saves.
  // When the ad-for-2x-speed boost runs out (epoch ms); saved so it survives a restart.
  speedBoostUntil?: number;
  // When the shop's ad-for-25-gems button is ready again (epoch ms); same shape as
  // speedBoostUntil, saved so the cooldown survives a restart.
  adGemsReadyAt?: number;
  // The shop's rewarded ads watched today (SHOP_ADS_PER_DAY of each kind a day).
  shopAds?: { day: string; gems: number; gold: number };
  // Shown on the header profile; missing on older saves (falls back to DEFAULT_NICKNAME).
  nickname?: string;
  // Set once the first-run tutorial is finished or skipped; missing on older saves.
  tutorialDone?: boolean;
  // Set once the follow-up tutorial that has the player buy their first recipe is done.
  recipeTutorialDone?: boolean;
  // Set once the follow-up tutorial that has the player equip and cast their first skill is done.
  skillTutorialDone?: boolean;
  // Kills left on the post-intro "선물" — each one is a one-hit kill with a sure 초록 젤리
  // and enough gold for the first upgrade. Missing on older saves = none.
  giftKills?: number;
  // When the gift's one-hit kills kick in (epoch ms) — a short pause after the intro so the
  // player gets to look at the stage first.
  giftStartsAt?: number;
  // The first gift kill's loot was frozen on the stage and explained (gold, then ingredients).
  giftLootExplained?: boolean;
  // The stat-upgrade tutorial that runs between the gift and the recipe tutorial.
  upgradeTutorialDone?: boolean;
  // The recipe tutorial's free gold (for the recipe) was paid.
  recipeGiftGiven?: boolean;
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
  // Pots finished instantly by watching an ad today (AD_RUSHES_PER_DAY). Missing on older saves.
  adRushes?: { day: string; count: number };
  // A FIFO queue per recipe of its uneaten units' cook-minigame grades ("great"/"good"/
  // "fail" — state/buffs.ts's CookGrade) — pushed on collectDish, shifted on eatDish/eatSnack.
  // Decides that specific unit's buff duration (or, for an instant dish, its gold payout)
  // when eaten. Missing/empty means no record (an older save, or a desynced unit); callers
  // fall back to "good".
  dishQuality?: Record<string, CookGrade[]>;
  // What the bag and the ingredient codex held when last looked at — anything newer gets a
  // "NEW"/"발견!" mark on the next visit. Missing on older saves (= nothing marked).
  bagSeen?: string[];
  // Story comics already shown (state/comics.ts); missing on older saves = none.
  seenComics?: string[];
  // Set from 설정 → "만화 다 열기": the album shows every comic regardless of progress.
  allComicsUnlocked?: boolean;
  // Companions already shown unlocked — one unlocked since gets its lock broken on the next visit.
  outfitsSeen?: Outfit[];
  // Companions bought with gems instead of unlocked by stage (e.g. 복서기니); missing on older saves.
  purchasedOutfits?: Outfit[];
  // Furthest stage the map has shown — a newer one gets its path drawn in on the next visit.
  mapSeenStage?: number;
  codexSeen?: string[];
  // Recipe ids cooked at least once (the "NEW" badge, and the cookbook goal — see
  // state/cookbook.ts). Older saves are seeded from the dishes in their bag on load.
  cookedRecipes?: string[];
  // Legacy quest rows (ladder / first chapter system) — only read to migrate claims.
  quests: Quest[];
  questChapter?: number;
  // 골목 퀘스트 mission ids already claimed (state/quests.ts); missing on older saves.
  questClaimed?: string[];
  // Winged coins caught in battle (a chapter mission); missing on older saves.
  coinsCaught?: number;
  // Skill cooldowns (absolute timestamps) and the last cast, saved so a reload doesn't
  // hand every skill back early. Missing on older saves.
  skillTimers?: SkillTimers;
  lastSkillCastAt?: number;
  // A first boss clear whose celebration (and its ad-for-gems offer) hasn't been closed yet —
  // saved so a reload brings it back instead of losing the reward. Missing when none.
  pendingFirstClear?: { stageNumber: number; bossName: string; gems: number; companions: string[] };
  // 기니의 발자취: when this save began, how long the game has been played (ms), and personal
  // bests. All missing on older saves (tracked from the update on).
  startedAt?: number;
  playTimeMs?: number;
  records?: { maxHit?: number; fastestBossMs?: number; bestOfflineGold?: number };
  // Mob kills made on a stage before leaving it from the map (stageNumber -> kills), so going
  // back picks up where it was. Missing on older saves.
  stageKillsSaved?: Record<string, number>;
  // Mid-bosses beaten on the current stage, and on stages left from the map (by stageNumber).
  stageMiniBosses?: number;
  // A random number fixed for this save, mixed into where mid-bosses fall and which are
  // golden — so two players don't meet them all in the same places. Set on first load.
  runSeed?: number;
  stageMiniBossesSaved?: Record<string, number>;
  // 업데이트 소식: the LATEST_UPDATE id this player has seen (and got the gift for).
  seenUpdate?: string;
  // Daily attendance: days claimed in all (the 7-day cycle is claimed % 7) and the local
  // date of the last claim. Missing until the first claim.
  attendance?: { claimed: number; lastDay: string };
  // Winged-gem ads watched today (`day` is the local date, YYYY-MM-DD) — capped per day.
  flyingGemAds?: { day: string; count: number };
  // Interstitials shown today and when the last one was (see maybeShowInterstitial).
  interstitialAds?: { day: string; count: number; lastAt: number };
  // The day the attendance reward was doubled by an ad (once a day).
  attendanceBonusDay?: string;
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
