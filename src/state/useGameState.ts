import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import type { GameState, Outfit, SkillId, StatKey, UpgradeMode } from "../types";
import { GLUTTON_FOOD_MULTIPLIER, INITIAL_SKILL_TIMERS, SKILL_SWAP_LOCK_MS, getSkill } from "./skills";
import { initialState } from "./initialState";
import { applyUpgradeLevels, getBossTimeLimitMs, getExpReward, getGoldReward, getExpToLevel, getStatLevel, getStatValue, getTotalAttack, getUpgradeQuote } from "./gameMath";
import { useAutoBattle } from "./useAutoBattle";
import { clearSave, loadSave, writeSave } from "./storage";
import { claimHiddenQuest, claimMission, migrateQuestClaims } from "./quests";
import { getOutfitGemPrice, getOutfitsUnlockedByStage, getUnlocksAtLevel, isOutfitUnlocked, isSkillUnlocked } from "./unlocks";
import { fitItems, getBagCapacity, getBagExpandCost, BAG_MAX_SLOTS, slotsUsed } from "./bag";
import { BOSS_NAME, getClearedBosses, getEnemyKind, getEnemyMaxHp, getStageLabel, LAST_STAGE_NUMBER, STAGE_KILL_TARGET } from "./stages";
import { rollDrops } from "./drops";
import { BUFF_SLOT_PRICES, BUFFS, INSTANT_DISHES, OUTFIT_FIRST_STRIKE, OUTFIT_FORCED_MANUAL, OUTFIT_NAMES, OUTFIT_BUFFS, OUTFIT_COOLDOWN_REDUCTION_SEC, OUTFIT_FOOD_DURATION_BONUS_SEC, OUTFIT_HIT_COUNT, OUTFIT_MISS_CHANCE, OUTFIT_SKILL_POWER, OUTFIT_SURE_DROPS, emptyBuffSlots, getBuffTotals } from "./buffs";
import { GROCERY } from "./grocery";
import { canCook, consumeIngredients, getKnownRecipes, isRecipeForSale, RECIPES } from "./recipes";
import { COOK_TIME_MS, applyDiscount, getCookingPots, getPotsUnlocked, getPotUnlockCost, getRushCost, MAX_POTS, TUTORIAL_COOK_MS } from "./cooking";
import { playSfx } from "../sound";
import { simulateOfflineProgress, type OfflineSummary, MAX_OFFLINE_MS } from "./offline";
import {
  BOSS_SKILL_CHECKPOINTS,
  BOSS_SKILL_HEAL_RATIO,
  BOSS_SKILL_STUN_MS,
  getBossSkill,
  GHOST_GOAT_REVIVE_HP_RATIO,
  GHOST_GOAT_REVIVE_KIND,
  type BossSkill,
} from "./bossSkills";

export type DropEvent = { id: number; name: string; delay: number };

// No ad SDK wired up yet — watching one grants this instantly, same as a completed view would.
const SPEED_BOOST_DURATION_MS = 5 * 60_000; // 5 minutes
// The shop's "광고 보고 보석 받기" button.
export const AD_GEMS_REWARD = 25;
const AD_GEMS_COOLDOWN_MS = 15 * 60_000; // 15 minutes
// The winged gem's "watch an ad" offer: gems per ad, and ads a day before only coins fly.
export const FLYING_GEM_AD_REWARD = 5;
export const FLYING_GEM_ADS_PER_DAY = 8;
// Local calendar day, for the per-day ad cap.
const todayKey = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};
const flyingGemAdsToday = (state: GameState) => (state.flyingGemAds?.day === todayKey() ? state.flyingGemAds.count : 0);
// Gold each of the three post-intro gift kills pays at the least (the first attack
// upgrade costs 120).
const GIFT_KILL_GOLD = 50;
// How long the explained demo loot takes to drift up to the gold counter / bag.
export const LOOT_FLIGHT_MS = 1200;
// The held gold goes up as this many coins, one every LOOT_COIN_GAP_MS.
export const LOOT_COINS = 5;
export const LOOT_COIN_GAP_MS = 280;
// Gems for beating a stage's boss for the very first time.
export const FIRST_CLEAR_GEMS = 50;


// Grocery category of each ingredient, for the category drop buffs (vegetableDrop, seafoodDrop).
const ITEM_CATEGORY = new Map(GROCERY.map((item) => [item.name, item.category]));

// Ingredient names ever obtained, for the ingredient codex — kept even after they're used up.
function discover(known: string[] | undefined, names: string[]) {
  const list = known ?? [];
  const fresh = names.filter((name) => !list.includes(name));
  return fresh.length > 0 ? [...list, ...new Set(fresh)] : list;
}

// Adds dropped/bought items to the bag, stacking onto what's already there.
function addItems(inventory: GameState["inventory"], items: { name: string; quantity: number }[]) {
  return items.reduce((bag, item) => {
    const owned = bag.find((entry) => entry.name === item.name);
    return owned
      ? bag.map((entry) => (entry === owned ? { ...entry, quantity: entry.quantity + item.quantity } : entry))
      : [...bag, { name: item.name, quantity: item.quantity, type: "food" }];
  }, inventory);
}

export function useGameState({ externallyPaused = false }: { externallyPaused?: boolean } = {}) {
  const [state, setState] = useState(initialState);
  const [questOpen, setQuestOpen] = useState(false);
  const [boss, setBoss] = useState(false);
  const [defeatedBoss, setDefeatedBoss] = useState(false);
  // When the current boss fight started (wall-clock) and how long it gets before the boss
  // flees — snapshotted together the moment `boss` turns true (see startBossFight below),
  // not recomputed live, so casting a skill or eating a buff mid-fight can't retroactively
  // stretch the very deadline it's meant to help beat.
  const [bossTimerStartedAt, setBossTimerStartedAt] = useState<number | null>(null);
  const [bossTimeLimitMs, setBossTimeLimitMs] = useState(0);
  // Bumped each time the boss flees (timer ran out) so the battle scene can flash a message
  // even if the player is looking at the same stage/boss as last time.
  const [bossFledKey, setBossFledKey] = useState(0);
  const [bossRetryAvailable, setBossRetryAvailable] = useState(false);
  // A freshly spawned boss waits behind BossEntranceBanner until the player taps it —
  // battle is paused and the timer hasn't started until then (see beginBossFight).
  const [bossIntroPending, setBossIntroPending] = useState(false);
  // A boss skill mid-fight (src/state/bossSkills.ts) — at most once per fight, see the
  // scheduling effect below. Stun pauses auto-battle only (manual tapping stays open);
  // bossSkillCastId/bossSkillConfig just drive BattleScene's VFX.
  const [bossStunnedUntil, setBossStunnedUntil] = useState(0);
  const [bossSkillCastId, setBossSkillCastId] = useState(0);
  const [bossSkillConfig, setBossSkillConfig] = useState<BossSkill | null>(null);
  // The stage theme (and therefore boss sprite) a dying boss should keep showing until
  // its death animation finishes — stageNumber itself advances immediately on defeat,
  // which would otherwise swap the die animation to the *next* stage's boss mid-clip.
  const [defeatedStageNumber, setDefeatedStageNumber] = useState(0);
  const [stageAnnouncement, setStageAnnouncement] = useState<string | null>(null);
  // The first gift kill's loot, held on the ground while the tutorial explains it.
  // Stages: "gold" (coins on the ground, explained) → "goldFlying" → "items" → "itemsFlying".
  const [heldLoot, setHeldLoot] = useState<{
    gold: number;
    items: { name: string; quantity: number }[];
    stage: "gold" | "goldFlying" | "items" | "itemsFlying";
  } | null>(null);
  const [firstClear, setFirstClear] = useState<{ key: number; stageNumber: number; bossName: string; gems: number; companions: string[] } | null>(null);
  const [upgradeMode, setUpgradeMode] = useState<UpgradeMode>(1);
  const [upgraded, setUpgraded] = useState<StatKey | null>(null);
  // Set when the player jumps stages from the milestone map, so the stageNumber change
  // below doesn't flash the "STAGE CLEAR" banner for a stage they didn't clear.
  const [skipStageAnnouncement, setSkipStageAnnouncement] = useState(false);
  const [announcedStageNumber, setAnnouncedStageNumber] = useState(state.stageNumber);
  // Enemies get tougher each stage so progression isn't flat — tuned in stages.ts.
  const enemyMaxHp = getEnemyMaxHp(state.stageNumber, boss);
  // Ticks once a second so buff timers count down and expire on time.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const buffSlots = state.buffSlots ?? emptyBuffSlots();
  const foodBuffs = getBuffTotals(buffSlots, now, state.equippedOutfit);
  const outfitBuff = OUTFIT_BUFFS[state.equippedOutfit];
  const buffs = {
    attack: foodBuffs.attack + (outfitBuff?.attack ?? 0),
    criticalChance: foodBuffs.criticalChance + (outfitBuff?.criticalChance ?? 0),
    criticalDamage: foodBuffs.criticalDamage + (outfitBuff?.criticalDamage ?? 0),
    gold: foodBuffs.gold + (outfitBuff?.gold ?? 0),
  };
  // Ingredient drops currently flying from the defeated monster into the bag button.
  const [dropEvents, setDropEvents] = useState<DropEvent[]>([]);
  const dropEventId = useRef(0);

  // Watching an ad doubles auto-battle's pace for an hour. Saved with the game and run on
  // wall-clock time like the food buffs, so it keeps counting down while the app is closed.
  const speedBoostRemainingMs = state.speedBoostUntil ? Math.max(0, state.speedBoostUntil - now) : 0;
  const speedMultiplier = speedBoostRemainingMs > 0 ? 2 : 1;
  // The ad boost, attack-speed food and a companion's own pace (사무라이기니 -25%) stack.
  const battleSpeed = speedMultiplier * (1 + foodBuffs.attackSpeed / 100) * (1 + (OUTFIT_BUFFS[state.equippedOutfit]?.attackSpeed ?? 0) / 100);
  const watchAdForSpeedBoost = () => {
    if (speedBoostRemainingMs > 0) return;
    const startedAt = Date.now();
    setState((previous) => ({ ...previous, speedBoostUntil: startedAt + SPEED_BOOST_DURATION_MS }));
    setNow(startedAt);
  };

  // The shop's "광고 보고 보석 받기" button — same shape as the speed boost above (wall-clock
  // cooldown, saved with the game), just a flat gem payout instead of a timed buff.
  const adGemsRemainingMs = state.adGemsReadyAt ? Math.max(0, state.adGemsReadyAt - now) : 0;
  const watchAdForGems = () => {
    if (adGemsRemainingMs > 0) return;
    const startedAt = Date.now();
    setState((previous) => ({ ...previous, gems: previous.gems + AD_GEMS_REWARD, adGemsReadyAt: startedAt + AD_GEMS_COOLDOWN_MS }));
    setNow(startedAt);
  };

  // Gates the autosave effect below until the saved-game load (or its absence) has
  // resolved — otherwise the fresh `initialState` would autosave over a real save
  // during the brief window before AsyncStorage responds.
  const [loaded, setLoaded] = useState(false);
  // Shown once after a load that found meaningful time away; dismissed by the player.
  const [offlineSummary, setOfflineSummary] = useState<OfflineSummary | null>(null);
  // Carries the save's lastSeenAt forward on every autosave so a later background event
  // can diff against it — only that event actually advances it to "now".
  const lastSeenAtRef = useRef<number | undefined>(undefined);
  // Last level the level-up burst has already fired for — synced here (not reactively)
  // so loading a save at a higher level, or an offline-progress jump, never triggers it.
  const previousLevelRef = useRef(state.level);

  useEffect(() => {
    loadSave().then((save) => {
      if (save) {
        // Guards against a save written before an outfit was retired (e.g. "forest") —
        // falls back to default rather than crashing when looking up its sprite sheet.
        const validOutfits = ["default", "explorerHamster", "tetoGini", "assassinGini", "egenGini", "samuraiGini", "chefGini", "boxerGini", "witchGini"];
        const equippedOutfit = validOutfits.includes(save.state.equippedOutfit)
          ? save.state.equippedOutfit
          : "default";
        // Same guard for a save written before a skill (e.g. the old "freeze"/"swords"/"meteor"
        // magic trio) was retired — getSkill() would otherwise throw looking it up.
        const validSkills = ["beam", "steal", "focus", "execute", "shout", "diligent", "glutton", "barrage", "teleport", "carrotThrow", "chiliThrow", "meteor"];
        const equippedSkill = save.state.equippedSkill && validSkills.includes(save.state.equippedSkill) ? save.state.equippedSkill : null;
        // Placeholder starter materials that were never used by any recipe — strip them
        // from older saves so they stop cluttering the bag.
        const retiredItems = ["낡은 천", "작은 돌"];
        // Items renamed since the save was written keep their count under the new name.
        const renamedItems: Record<string, string> = { "들풀 다발": "고수" };
        const inventory = save.state.inventory
          .filter((item) => !retiredItems.includes(item.name))
          .map((item) => (renamedItems[item.name] ? { ...item, name: renamedItems[item.name] } : item));
        // Quest claims now live in questClaimed (older saves kept them on quest rows).
        const questClaimed = migrateQuestClaims(save.state);
        // 당근 수프 used to be the free starter recipe; there is none now (the first one is
        // bought in the recipe tutorial), so saves from before that drop the freebie — once.
        // Those saves are the ones with no recipeTutorialDone field yet; it's filled in below,
        // so a 당근 수프 bought afterwards is never stripped again on the next load.
        const fromBeforeRecipeTutorial = save.state.recipeTutorialDone === undefined;
        const knownRecipes = fromBeforeRecipeTutorial
          ? (save.state.knownRecipes ?? []).filter((id) => id !== "carrot-soup")
          : save.state.knownRecipes;
        const recipeTutorialDone = save.state.recipeTutorialDone ?? false;
        const skillTutorialDone = save.state.skillTutorialDone ?? false;
        // Saves already past the intro predate the upgrade tutorial — they skip it.
        const upgradeTutorialDone = save.state.upgradeTutorialDone ?? Boolean(save.state.tutorialDone);
        // Saves from before the ingredient codex start it from whatever's in the bag now.
        const discoveredItems = save.state.discoveredItems ?? inventory.filter((item) => item.type === "food").map((item) => item.name);
        // Saves from before the cookbook have no cooked-recipe record; anything already sitting
        // in the bag as a dish was clearly cooked, so that's the starting page count.
        const cookedRecipes =
          save.state.cookedRecipes ?? RECIPES.filter((recipe) => inventory.some((item) => item.name === recipe.name)).map((recipe) => recipe.id);
        let loadedState: GameState = { ...save.state, equippedOutfit, equippedSkill, inventory, questClaimed, knownRecipes, recipeTutorialDone, skillTutorialDone, upgradeTutorialDone, discoveredItems, cookedRecipes };
        // The game is running again from now on — so a reload (which never fires the
        // background event below) can't hand the same offline stretch out a second time.
        lastSeenAtRef.current = Date.now();
        if (save.lastSeenAt) {
          const awayMs = Date.now() - save.lastSeenAt;
          const result = simulateOfflineProgress(loadedState, awayMs);
          if (result) {
            loadedState = result.state;
            // Away the full offline cap or longer: a "slept the whole time" for the hidden quest.
            if (awayMs >= MAX_OFFLINE_MS) loadedState = { ...loadedState, longNaps: (loadedState.longNaps ?? 0) + 1 };
            setOfflineSummary(result.summary);
          }
        }
        previousLevelRef.current = loadedState.level;
        // The saved stage is where the player already is, not one they just reached — mark it
        // announced in the same update so loading it doesn't pop the stage-clear banner.
        setAnnouncedStageNumber(loadedState.stageNumber);
        // The enemy on screen was built for the fresh game's stage 1 before the save came in —
        // replace it with a full-HP mob of the loaded stage, or it walks in nearly dead.
        battle.resetEnemy(getEnemyMaxHp(loadedState.stageNumber, false));
        // A first-clear celebration that was still open when the game closed comes back.
        if (loadedState.pendingFirstClear) setFirstClear({ ...loadedState.pendingFirstClear, key: Date.now() });
        setState(loadedState);
      }
      setLoaded(true);
    });
    // Runs once, on mount — the load itself; `battle` is only used for that one reset.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const timer = setTimeout(() => {
      lastSeenAtRef.current = Date.now();
      writeSave({ state, lastSeenAt: lastSeenAtRef.current });
    }, 800);

    // Flush immediately if the app is backgrounded/closed before the debounce fires,
    // so the last few seconds of progress aren't lost — and stamp lastSeenAt here (only
    // here) so the next load can tell how long the app was actually away.
    const subscription = AppState.addEventListener("change", (status) => {
      if (status !== "active") {
        lastSeenAtRef.current = Date.now();
        writeSave({ state, lastSeenAt: lastSeenAtRef.current });
      }
    });

    return () => {
      clearTimeout(timer);
      subscription.remove();
    };
  }, [state, loaded]);

  // Heartbeat: keeps lastSeenAt current while nothing in the save changes (a paused screen,
  // a banner waiting for its tap), so offline time is only ever time the game wasn't running.
  const latestStateRef = useRef(state);
  useEffect(() => {
    latestStateRef.current = state;
  });
  useEffect(() => {
    if (!loaded) return;
    const id = setInterval(() => {
      lastSeenAtRef.current = Date.now();
      writeSave({ state: latestStateRef.current, lastSeenAt: lastSeenAtRef.current });
    }, 15_000);
    return () => clearInterval(id);
  }, [loaded]);

  // Reacts to stageNumber changes during render (not in an effect) so the banner shows up
  // in the same pass as the new stage instead of one cascaded render later.
  if (state.stageNumber !== announcedStageNumber) {
    setAnnouncedStageNumber(state.stageNumber);
    if (skipStageAnnouncement) {
      setSkipStageAnnouncement(false);
    } else if (state.stageNumber !== 0) {
      setStageAnnouncement(getStageLabel(state.stageNumber));
    }
  }

  // The stage-clear banner stays up (battle paused) until the player taps on to the next
  // stage — see continueStage.

  // Fires the level-up burst whenever level actually goes up during live play. Gated on
  // `loaded` and previousLevelRef is synced inside the load effect above, so loading a
  // save at a higher level (or an offline-progress jump) never triggers a spurious burst.
  const [levelUpAnnouncement, setLevelUpAnnouncement] = useState<number | null>(null);
  // +1 attack per level (see getTotalAttack) — if a single kill's exp carries the player
  // past more than one level, this is the sum across all of them, not just the last.
  const [levelUpAttackGain, setLevelUpAttackGain] = useState(1);
  useEffect(() => {
    if (!loaded) return;
    if (state.level > previousLevelRef.current) {
      setLevelUpAnnouncement(state.level);
      setLevelUpAttackGain(state.level - previousLevelRef.current);
      playSfx("levelup");
      // Held longer when something unlocks, so its toast can actually be read. The plain
      // case holds a bit past when LevelUpBurst's own fade-out finishes (~1.25s in, see
      // its contentOpacity timeline) so the component unmounts only once it's already
      // fully invisible — cutting this too close (tried 1300) unmounted it mid-fade,
      // popping it off abruptly instead of letting it finish dissolving.
      const unlocks = getUnlocksAtLevel(state.level);
      const holdMs = unlocks.skills.length > 0 ? 2800 : 1500;
      const timer = setTimeout(() => setLevelUpAnnouncement(null), holdMs);
      previousLevelRef.current = state.level;
      return () => clearTimeout(timer);
    }
    previousLevelRef.current = state.level;
  }, [state.level, loaded]);

  // Spawns the boss and snapshots its deadline — a fixed per-stage value (see
  // getBossTimeLimitMs) — but the clock itself waits for the player to tap the entrance
  // banner (beginBossFight), so the boss can be sized up first.
  const startBossFight = useCallback(() => {
    setBossTimerStartedAt(null);
    setBossTimeLimitMs(getBossTimeLimitMs(state.stageNumber));
    setBossIntroPending(true);
    setBoss(true);
  }, [state.stageNumber]);
  const beginBossFight = useCallback(() => {
    if (!bossIntroPending) return;
    setBossIntroPending(false);
    setBossTimerStartedAt(Date.now());
    setNow(Date.now());
  }, [bossIntroPending]);
  const endBossFight = () => {
    setBoss(false);
    setBossIntroPending(false);
    setBossTimerStartedAt(null);
  };

  const { dropRate, vegetableDrop, seafoodDrop, dropDouble, bossDropSure, exp: expBonus } = foodBuffs;
  const handleEnemyDefeat = useCallback((rawGold: number) => {
    // A gift kill (right after the intro) pays at least enough for the first upgrade over
    // the three of them, and always drops one 초록 젤리 for the recipe tutorial.
    const gift = (state.giftKills ?? 0) > 0 && !boss;
    const goldReward = gift ? Math.max(rawGold, GIFT_KILL_GOLD) : rawGold;
    setDefeatedBoss(boss);
    if (boss) endBossFight();
    // Killing the 25th regular mob spawns the boss directly — no manual "challenge" step.
    const reachesBossThreshold = !boss && state.stageKills + 1 >= STAGE_KILL_TARGET;
    if (reachesBossThreshold) startBossFight();

    // Rolled out here, not inside the state updater, so a re-run updater can't re-roll.
    // A full bag turns away whatever has no room left (no free slot, no space in its
    // last stack of 64) — those just don't drop.
    const rolled = rollDrops(getEnemyKind(state.stageNumber), boss, {
      chanceBonus: (name) =>
        dropRate +
        (ITEM_CATEGORY.get(name) === "vegetable" ? vegetableDrop : 0) +
        (ITEM_CATEGORY.get(name) === "seafood" ? seafoodDrop : 0),
      doubleChance: dropDouble,
      bossSure: bossDropSure > 0,
      allSure: OUTFIT_SURE_DROPS[state.equippedOutfit] ?? false,
    });
    const withGift = gift ? [...rolled.filter((drop) => drop.name !== "초록 젤리"), { name: "초록 젤리", quantity: 1 }] : rolled;
    const fitted = fitItems(state.inventory, withGift, getBagCapacity(state.bagExpansions));
    const drops = fitted.kept;
    if (fitted.overflow.length > 0) notifyBagFull(true);
    // The very first gift kill's loot stays put on the ground — the battle pauses and the
    // tutorial explains the gold, then the ingredients, sending each in as it's explained.
    const holdLoot = gift && !state.giftLootExplained;
    if (holdLoot) setHeldLoot({ gold: goldReward, items: drops, stage: "gold" });
    if (drops.length > 0 && !holdLoot) {
      // One flying icon per item, staggered so a boss's pile spills out one by one.
      const events = drops
        .flatMap((drop) => Array.from({ length: drop.quantity }, () => drop.name))
        .map((name, index) => ({ id: ++dropEventId.current, name, delay: index * 110 }));
      setDropEvents((current) => [...current, ...events]);
      const ids = events.map((event) => event.id);
      setTimeout(() => setDropEvents((current) => current.filter((event) => !ids.includes(event.id))), 2000 + events.length * 110);
    }

    // First time this stage's boss goes down: a big celebration, whose gem bonus is only
    // paid out by watching an ad there (claimFirstClearGems).
    const firstClear = boss && !getClearedBosses({
      bossesCleared: state.bossesCleared,
      highestStageNumber: state.highestStageNumber,
      stageNumber: state.stageNumber,
    }).includes(state.stageNumber);
    if (firstClear) {
      const pending = {
        stageNumber: state.stageNumber,
        bossName: BOSS_NAME[getEnemyKind(state.stageNumber)],
        gems: FIRST_CLEAR_GEMS,
        // Beating this boss for the first time is what opens the next stage, so a companion
        // waiting there is announced with it — unless that stage was already reached.
        companions:
          (state.highestStageNumber ?? state.stageNumber) > state.stageNumber
            ? []
            : getOutfitsUnlockedByStage(state.stageNumber + 1)
                // Already brought along early with gems — nothing new to announce.
                .filter((outfit) => !(state.purchasedOutfits ?? []).includes(outfit))
                .map((outfit) => OUTFIT_NAMES[outfit]),
      };
      setFirstClear({ ...pending, key: Date.now() });
      setState((previous) => ({ ...previous, pendingFirstClear: pending }));
    }

    setState((previous) => {
      if (boss) setDefeatedStageNumber(previous.stageNumber);
      const cleared = getClearedBosses(previous);
      const paysFirstClear = firstClear && !cleared.includes(previous.stageNumber);

      const kills = previous.kills + 1;
      let level = previous.level;
      const expReward = Math.round(getExpReward(previous.stageNumber, boss) * (1 + expBonus / 100));
      let experience = previous.experience + expReward;
      while (experience >= getExpToLevel(level)) {
        experience -= getExpToLevel(level);
        level += 1;
      }
      const creditedGold = holdLoot ? 0 : goldReward;
      const totalGoldEarned = previous.totalGoldEarned + creditedGold;
      const bossKills = (previous.bossKills ?? 0) + (boss ? 1 : 0);
      // Clearing the last implemented boss loops back to stage 1; keep this dynamic as
      // each new region is added.
      const stageNumber = boss ? (previous.stageNumber >= LAST_STAGE_NUMBER ? 0 : previous.stageNumber + 1) : previous.stageNumber;
      // Saves from before the milestone map have no record — what they're on is the floor.
      const highestStageNumber = Math.max(previous.highestStageNumber ?? previous.stageNumber, stageNumber);
      return {
        ...previous,
        gold: previous.gold + creditedGold,
        giftKills: gift ? Math.max(0, (previous.giftKills ?? 0) - 1) : previous.giftKills,
        bossesCleared: paysFirstClear ? [...cleared, previous.stageNumber] : previous.bossesCleared,
        inventory: holdLoot ? previous.inventory : addItems(previous.inventory, drops),
        discoveredItems: holdLoot ? previous.discoveredItems : discover(previous.discoveredItems, drops.map((drop) => drop.name)),
        kills,
        currentStage: boss ? getStageLabel(stageNumber) : previous.currentStage,
        stageNumber,
        highestStageNumber,
        stageKills: boss ? 0 : previous.stageKills + 1,
        totalGoldEarned,
        bossKills,
        level,
        experience,
      };
    });
  }, [boss, state.stageKills, state.stageNumber, state.inventory, state.bagExpansions, state.bossesCleared, state.highestStageNumber, state.purchasedOutfits, state.equippedOutfit, dropRate, vegetableDrop, seafoodDrop, dropDouble, bossDropSure, expBonus, startBossFight, state.giftKills, state.giftLootExplained]);

  // Gold that isn't a kill reward (the Steal skill) still counts toward the gold quest.
  const addBonusGold = useCallback((amount: number) => {
    setState((previous) => {
      const totalGoldEarned = previous.totalGoldEarned + amount;
      return {
        ...previous,
        gold: previous.gold + amount,
        totalGoldEarned,
      };
    });
  }, []);

  // Flying coins grant stage-scaled gold (5x the stage's regular mob); a winged gem pays
  // nothing on the catch itself — its gems come from the ad it offers (FLYING_GEM_AD_REWARD).
  const catchFlyingCoin = (kind: "coin" | "gem", watchAd = false) => {
    if (kind === "gem") {
      if (!watchAd || flyingGemAdsToday(state) >= FLYING_GEM_ADS_PER_DAY) return { gold: 0, gems: 0 };
      setState((previous) => {
        const count = flyingGemAdsToday(previous);
        if (count >= FLYING_GEM_ADS_PER_DAY) return previous;
        return { ...previous, gems: previous.gems + FLYING_GEM_AD_REWARD, flyingGemAds: { day: todayKey(), count: count + 1 } };
      });
      return { gold: 0, gems: FLYING_GEM_AD_REWARD };
    }
    const attack = Math.round(getTotalAttack(state) * (1 + buffs.attack / 100));
    const mobGold = getGoldReward(attack, state.goldBonus + buffs.gold, getEnemyMaxHp(state.stageNumber, false), false);
    const gold = Math.max(1, Math.round(mobGold * 5));
    addBonusGold(gold);
    setState((previous) => ({ ...previous, coinsCaught: (previous.coinsCaught ?? 0) + 1 }));
    return { gold, gems: 0 };
  };

  // SkillTutorial is up: reading a dialog shouldn't let swings land (or the stage
  // progress/exp it explains) change out from under the player. Gated on !boss like
  // tutorialJelly below, so it never collides with the boss-flee timer.
  // Waits its turn behind the first-run tutorials (upgrade, recipe) so they never overlap.
  const skillTutorialActive = state.tutorialDone && Boolean(state.recipeTutorialDone) && !state.skillTutorialDone && isSkillUnlocked("steal", state.level) && !boss;

  const battle = useAutoBattle({
    // Food buffs and the equipped companion's bonus apply on top of the upgraded stats.
    attack: Math.round(getTotalAttack(state) * (1 + buffs.attack / 100)),
    criticalDamage: state.criticalDamage + buffs.criticalDamage,
    criticalChance: (state.criticalChance ?? 5) + buffs.criticalChance,
    goldBonus: state.goldBonus + buffs.gold,
    missChance: Math.max(0, (OUTFIT_MISS_CHANCE[state.equippedOutfit] ?? 0) - foodBuffs.missReduction),
    hitCount: OUTFIT_HIT_COUNT[state.equippedOutfit] ?? 1,
    cooldownReductionMs: ((OUTFIT_COOLDOWN_REDUCTION_SEC[state.equippedOutfit] ?? 0) + foodBuffs.skillCooldown) * 1000,
    bossDamage: foodBuffs.bossDamage,
    skillPower: OUTFIT_SKILL_POWER[state.equippedOutfit] ?? 1,
    firstStrikeMultiplier: OUTFIT_FIRST_STRIKE[state.equippedOutfit] ?? 0,
    forcedManual: OUTFIT_FORCED_MANUAL[state.equippedOutfit] ?? false,
    extraHitChance: foodBuffs.extraHit,
    executeBonus: foodBuffs.execute,
    enemyMaxHp,
    boss,
    speedMultiplier: battleSpeed,
    onDefeat: handleEnemyDefeat,
    onBonusGold: addBonusGold,
    // Only 테토기니 whiffs; each one counts toward the hidden 헛스윙 quests.
    onMiss: () => setState((previous) => (previous.equippedOutfit === "tetoGini" ? { ...previous, tetoMisses: (previous.tetoMisses ?? 0) + 1 } : previous)),
    equippedSkill: state.equippedSkill ?? null,
    now,
    // FirstClearCelebration is one actual cutscene (full-screen, blocks input, has to be
    // dismissed) — without pausing for it, auto-battle kept fighting invisibly behind it the
    // whole ~4.2s it's up, so closing it could land you mid-swing against an enemy (or
    // several kills) you never saw happen. externallyPaused covers the other one
    // (ComicViewer) — GameScreen owns that state (it's presentation/navigation, not game
    // state), so it passes it in rather than this hook reaching out to know about it.
    // The very first fight starts from the tutorial: nothing happens during the story and
    // intro, and none while the first gift kill's loot is being explained.
    paused: skillTutorialActive || bossRetryAvailable || bossIntroPending || stageAnnouncement !== null || firstClear !== null || externallyPaused || !state.tutorialDone || heldLoot !== null,
    autoStunned: now < bossStunnedUntil,
    reviveHpRatio: boss && getEnemyKind(state.stageNumber) === GHOST_GOAT_REVIVE_KIND ? GHOST_GOAT_REVIVE_HP_RATIO : undefined,
    instantKill: (state.giftKills ?? 0) > 0 && !boss && now >= (state.giftStartsAt ?? 0) && heldLoot === null,
  });

  // Skill cooldowns survive a reload: put the saved ones back once the save is in, then keep
  // the save in step with every cast (deferred out of the effect body, like the others here).
  const skillTimersRestored = useRef(false);
  useEffect(() => {
    if (!loaded || skillTimersRestored.current) return;
    skillTimersRestored.current = true;
    if (state.skillTimers) battle.restoreSkillTimers(state.skillTimers, state.lastSkillCastAt ?? 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);
  useEffect(() => {
    // Still the untouched initial timers (nothing cast, nothing restored yet): nothing to save.
    if (!loaded || battle.skillTimers === INITIAL_SKILL_TIMERS) return;
    const timer = setTimeout(() => {
      setState((previous) =>
        previous.skillTimers === battle.skillTimers && previous.lastSkillCastAt === battle.lastSkillCastAt
          ? previous
          : { ...previous, skillTimers: battle.skillTimers, lastSkillCastAt: battle.lastSkillCastAt },
      );
    }, 0);
    return () => clearTimeout(timer);
  }, [loaded, battle.skillTimers, battle.lastSkillCastAt]);

  // The boss fight's clock: once bossTimeLimitMs elapses without a kill, it flees — back to
  // square one on this stage's regular mobs, not just a free re-fight. `now` only ticks
  // once a second (see its own effect above), so this fires within a second of the real
  // deadline rather than needing its own interval.
  useEffect(() => {
    if (!boss || bossTimerStartedAt === null) return;
    if (now - bossTimerStartedAt < bossTimeLimitMs) return;
    // Deferred out of the effect body itself (react-hooks/set-state-in-effect) — the
    // condition above is still evaluated synchronously on every `now` tick, only the
    // resulting state change is pushed to a fresh macrotask.
    const timer = setTimeout(() => {
      // Keep the boss and its remaining HP in place while the retry prompt is open.
      // Only its countdown stops; accepting the rewarded retry starts a fresh window.
      setBossTimerStartedAt(null);
      setStageAnnouncement(null);
      setBossFledKey((key) => key + 1);
      setBossRetryAvailable(true);
    }, 0);
    return () => clearTimeout(timer);
  }, [now, boss, bossTimerStartedAt, bossTimeLimitMs]);

  // Boss skill (src/state/bossSkills.ts): up to 3 casts per fight, one per BOSS_SKILL_CHECKPOINTS
  // entry (75%/50%/30% of the boss's own hp), each resolved — rolled and spent, hit or miss —
  // the moment hp first drops to that checkpoint's threshold, as a last-stand move rather
  // than a random mid-fight event. bossSkillPlanRef (not state) holds which checkpoints are
  // already resolved so re-renders can't re-roll them; reset fresh on every new
  // bossTimerStartedAt. If one giant hit crosses more than one threshold at once, every
  // newly-crossed checkpoint is still resolved (so none of them lingers to fire later off a
  // smaller hit), but only the first one that actually rolls a hit casts — never two at once.
  //
  // `synced`: right as a *fresh* boss spawns, enemyMaxHp (derived from `boss`) jumps to the
  // boss's own max hp a render before battle.enemyHp actually catches up to it — the old
  // regular mob's leftover (much smaller) hp is still sitting there until useAutoBattle's
  // respawn timer lands the boss at full hp a beat later. Comparing ratios during that gap
  // reads as the boss already critically low, which burned through all 3 checkpoints the
  // instant the boss appeared and left none for its real hp drops. Wait for
  // battle.enemyHp >= enemyMaxHp (truly at full hp) before trusting any ratio against it —
  // but only for a fresh spawn (battle.enemyId just changed): retryBossAfterAd starts a new
  // bossTimerStartedAt on the *same* enemy, at whatever hp the timeout left it at (never
  // reset to max), so demanding a sync there would wait forever and disable the boss's
  // skill for the rest of that attempt.
  //
  // `maxHp` is *snapshotted* once (when synced), and checkpoint evaluation below keeps
  // running off `plan.enemyId === battle.enemyId` rather than the live `boss` flag — a
  // killing blow sets battle.enemyHp to 0 and flips `boss` back to false in the very same
  // state batch (dealDamage -> defeatEnemy -> onDefeat -> endBossFight all run
  // synchronously), so a one-hit kill (Execute, Beam, or just enough raw damage) would
  // otherwise never land on a render where `boss` is still true to catch hp hitting 0.
  // That render is now used only to skip: a killing blow casts nothing — a boss knocked out
  // in one hit (or finished off past a checkpoint) doesn't get a parting shot. The
  // checkpoints are left unresolved rather than spent, so a boss that comes back from 0
  // (the lizard's revive) still has them for the rest of the fight. Reading
  // the live enemyMaxHp at that point wouldn't work either: by then it's already reverted to
  // the regular-mob formula. battle.enemyId itself doesn't bump until the *later* respawn
  // timer, so it's still safe to trust for this one render.
  const bossSkillPlanRef = useRef<{ startedAt: number | null; enemyId: number; maxHp: number; resolved: boolean[]; synced: boolean }>({
    startedAt: null,
    enemyId: -1,
    maxHp: 0,
    resolved: [],
    synced: false,
  });
  useEffect(() => {
    const plan = bossSkillPlanRef.current;
    if (boss && bossTimerStartedAt !== null && plan.startedAt !== bossTimerStartedAt) {
      const freshSpawn = plan.enemyId !== battle.enemyId;
      plan.startedAt = bossTimerStartedAt;
      plan.enemyId = battle.enemyId;
      plan.maxHp = enemyMaxHp;
      // A retry-after-ad (same enemy, new bossTimerStartedAt — see freshSpawn's own comment
      // above) picks the same fight back up: checkpoints it already used stay used, or every
      // failed attempt would hand back up to 3 fresh skill rolls for free.
      if (freshSpawn) plan.resolved = BOSS_SKILL_CHECKPOINTS.map(() => false);
      plan.synced = !freshSpawn;
    }
    if (plan.startedAt === null || plan.enemyId !== battle.enemyId) return;
    if (!plan.synced) {
      if (battle.enemyHp < plan.maxHp) return;
      plan.synced = true;
    }
    if (battle.enemyHp <= 0) return;
    let castIndex = -1;
    BOSS_SKILL_CHECKPOINTS.forEach((checkpoint, index) => {
      if (plan.resolved[index] || battle.enemyHp > plan.maxHp * checkpoint.hpRatio) return;
      plan.resolved[index] = true;
      if (castIndex === -1 && Math.random() < checkpoint.chance) castIndex = index;
    });
    if (castIndex === -1) return;
    // Deferred out of the effect body itself (react-hooks/set-state-in-effect), same as the
    // boss timer effect above — the condition is still evaluated synchronously on every hp
    // change, only the resulting state changes are pushed to a fresh macrotask.
    const timer = setTimeout(() => {
      const skill = getBossSkill(getEnemyKind(state.stageNumber));
      setBossSkillConfig(skill);
      setBossSkillCastId((id) => id + 1);
      if (skill.kind === "stun") {
        setBossStunnedUntil(Date.now() + BOSS_SKILL_STUN_MS);
        // `now` (read by autoStunned below) only ticks once a second, so just comparing
        // against bossStunnedUntil could leave auto-battle paused up to ~1s after the
        // stun's own visual (StunOverlay, timed precisely via Reanimated) has already
        // faded out. This clears it exactly on time regardless of that tick's timing.
        setTimeout(() => setBossStunnedUntil(0), BOSS_SKILL_STUN_MS);
      } else {
        battle.healEnemy(Math.round(battle.enemyHp * BOSS_SKILL_HEAL_RATIO));
      }
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boss, bossTimerStartedAt, state.stageNumber, battle.enemyHp, battle.enemyId, enemyMaxHp]);

  // The first-clear celebration's "watch an ad" reward. Clears `firstClear` in the same
  // update so a second tap can't pay twice.
  const claimFirstClearGems = () => {
    if (!firstClear) return;
    const { gems } = firstClear;
    setFirstClear(null);
    setState((previous) => ({ ...previous, gems: previous.gems + gems, pendingFirstClear: undefined }));
  };

  const retryBossAfterAd = useCallback(() => {
    if (!bossRetryAvailable) return;
    setBossRetryAvailable(false);
    // Same enemy, fresh window — no entrance banner for a retry.
    setBossTimerStartedAt(Date.now());
    setBossTimeLimitMs(getBossTimeLimitMs(state.stageNumber));
    setNow(Date.now());
  }, [bossRetryAvailable, state.stageNumber]);

  // Whether the boss sprite is actually on screen — lags `boss` by the death clip on both
  // ends. The 25th regular-mob kill flips `boss` true immediately (so the next spawn is
  // the boss), but that mob's own ~650ms death clip is still playing; likewise a dying
  // boss flips `boss` false while its die animation is still running.
  const isMobToBossTransition = battle.phase === "defeated" && !defeatedBoss && boss;
  const isBossDefeatFlash = battle.phase === "defeated" && defeatedBoss;
  const displayBoss = (boss && !isMobToBossTransition) || isBossDefeatFlash;

  // Only one skill fits the battle slot — equipping one replaces whatever was there.
  // A new skill can only go in once SKILL_SWAP_LOCK_MS has passed since the last cast.
  // Execute is never cast, so while it's equipped the lock runs out and swapping away is
  // free; emptying the slot is always allowed.
  // The slot is locked for SKILL_SWAP_LOCK_MS after either the last cast or putting a
  // passive in — passives are never cast, so without the latter they could be flicked on
  // and off freely. The lock covers every change, emptying the slot included.
  const castLockEnd = battle.lastSkillCastAt > 0 ? battle.lastSkillCastAt + SKILL_SWAP_LOCK_MS : 0;
  const equippedPassive = state.equippedSkill ? getSkill(state.equippedSkill).passive : false;
  const passiveLockEnd = equippedPassive && state.skillEquippedAt ? state.skillEquippedAt + SKILL_SWAP_LOCK_MS : 0;
  const skillSwapReadyAt = Math.max(castLockEnd, passiveLockEnd);
  const equipSkill = (equippedSkill: SkillId | null) => {
    if (Date.now() < skillSwapReadyAt) return;
    if (equippedSkill && !isSkillUnlocked(equippedSkill, state.level)) return;
    setState((previous) => ({ ...previous, equippedSkill, skillEquippedAt: Date.now() }));
  };

  const upgradeStat = (key: StatKey) => {
    setState((previous) => {
      const quote = getUpgradeQuote(key, getStatLevel(previous, key), previous.gold, upgradeMode, getStatValue(previous, key));
      if (quote.levels === 0 || previous.gold < quote.cost) return previous;
      const attackUpgrades =
        key === "attack"
          ? previous.attackUpgrades + quote.levels
          : previous.attackUpgrades;
      const previousLevels: Record<StatKey, number> = {
        attack: getStatLevel(previous, "attack"),
        criticalDamage: getStatLevel(previous, "criticalDamage"),
        criticalChance: getStatLevel(previous, "criticalChance"),
        goldBonus: getStatLevel(previous, "goldBonus"),
      };
      return {
        ...previous,
        gold: previous.gold - quote.cost,
        [key]: applyUpgradeLevels(key, getStatValue(previous, key), quote.levels),
        statLevels: {
          ...previousLevels,
          [key]: previousLevels[key] + quote.levels,
        },
        attackUpgrades,
      };
    });
    setUpgraded(key);
    setTimeout(() => setUpgraded(null), 400);
  };

  const claimQuest = (id: string) =>
    setState((previous) => (/^c\d+-/.test(id) ? claimMission(previous, id) : claimHiddenQuest(previous, id)));

  const selectStage = (stageNumber: number) => {
    const highestStageNumber = state.highestStageNumber ?? state.stageNumber;
    if (stageNumber > highestStageNumber) return;
    if (stageNumber !== state.stageNumber) setSkipStageAnnouncement(true);
    setStageAnnouncement(null);
    endBossFight();
    setDefeatedBoss(false);
    setState((previous) => ({
      ...previous,
      currentStage: getStageLabel(stageNumber),
      stageNumber,
      stageKills: 0,
      highestStageNumber,
      selectedTab: "battle",
    }));
    battle.resetEnemy(getEnemyMaxHp(stageNumber, false));
  };

  // Dev-convenience shortcut from the settings menu — skips straight to the current
  // stage's boss instead of grinding out the 25 regular-mob kills first.
  const skipToBoss = () => {
    if (boss) return;
    setStageAnnouncement(null);
    setDefeatedBoss(false);
    startBossFight();
    setState((previous) => ({ ...previous, stageKills: STAGE_KILL_TARGET }));
    battle.resetEnemy(getEnemyMaxHp(state.stageNumber, true));
  };

  // 텔레포트: the player-facing version of the shortcut above — only on a stage whose boss
  // has already fallen at least once (re-grinding an old stage, not skipping new content),
  // and gated by the skill's own cooldown like any other cast.
  const canTeleportToBoss = (now: number) =>
    state.equippedSkill === "teleport" && !boss && getClearedBosses(state).includes(state.stageNumber) && battle.canCastSkill(now);
  const teleportToBoss = () => {
    if (!canTeleportToBoss(Date.now())) return;
    battle.castSkill();
    setStageAnnouncement(null);
    setDefeatedBoss(false);
    startBossFight();
    setState((previous) => ({ ...previous, stageKills: STAGE_KILL_TARGET }));
    battle.resetEnemy(getEnemyMaxHp(state.stageNumber, true));
  };

  // Dev-convenience shortcut from the settings menu — bumps the level by a flat amount
  // without touching experience. Done live (not loaded), so it fires the normal level-up
  // burst and its attack-gain text same as leveling up for real.
  const cheatAddLevels = (amount: number) => {
    setState((previous) => ({ ...previous, level: previous.level + amount }));
  };

  // Dev-convenience shortcut from the settings menu — unlocks every stage on the
  // milestone map for selection, without marking them cleared or moving the player.
  const cheatUnlockAllStages = () => {
    setState((previous) => ({ ...previous, highestStageNumber: LAST_STAGE_NUMBER }));
  };

  // Dev-convenience shortcut from the settings menu — adds gems outright.
  const cheatAddGems = (amount: number) => {
    setState((previous) => ({ ...previous, gems: previous.gems + amount }));
  };

  // Pops the "bag is full" dialog when an action needed a fresh bag slot and there wasn't
  // one. Drops come every kill during auto-battle, so those raise it only once per time the
  // bag fills up — not again until it has had room in between.
  const [bagFullAt, setBagFullAt] = useState<number | null>(null);
  const dropNoticeShownRef = useRef(false);
  const bagHasRoom = slotsUsed(state.inventory) < getBagCapacity(state.bagExpansions);
  useEffect(() => {
    if (bagHasRoom) dropNoticeShownRef.current = false;
  }, [bagHasRoom]);
  function notifyBagFull(fromDrop = false) {
    if (fromDrop) {
      if (dropNoticeShownRef.current) return;
      dropNoticeShownRef.current = true;
    }
    setBagFullAt(Date.now());
    setState((previous) => ({ ...previous, bagFullCount: (previous.bagFullCount ?? 0) + 1 }));
  }

  // Spends the recipe's ingredients from the bag and adds one of the dish.
  // Puts a dish on to simmer in the first free pot — the ingredients go in now, the dish
  // comes out once its tier's cook time has passed (see collectDish).
  const cook = (recipeId: string) => {
    const recipe = RECIPES.find((item) => item.id === recipeId);
    if (!recipe) return;
    setState((previous) => {
      if (!getKnownRecipes(previous.knownRecipes).includes(recipe.id) || !canCook(previous.inventory, recipe)) return previous;
      const pots = getCookingPots(previous.cookingPots);
      const potIndex = pots.findIndex((pot, index) => index < getPotsUnlocked(previous.potsUnlocked) && !pot);
      if (potIndex < 0) return previous;
      const inTutorial = previous.tutorialDone && !previous.recipeTutorialDone && recipe.id === "green-jelly";
      const startedAt = Date.now();
      // cookSpeed shortens it (never below a quarter); ingredientSave may spare one of each.
      const cookTime = COOK_TIME_MS[recipe.tier] * Math.max(0.25, 1 - foodBuffs.cookSpeed / 100);
      const readyAt = startedAt + (inTutorial ? TUTORIAL_COOK_MS : cookTime);
      const used = {
        ...recipe,
        ingredients: recipe.ingredients.map((ingredient) => ({
          ...ingredient,
          quantity: ingredient.quantity - (Math.random() * 100 < foodBuffs.ingredientSave ? 1 : 0),
        })),
      };
      return {
        ...previous,
        inventory: consumeIngredients(previous.inventory, used),
        cookingPots: pots.map((pot, index) => (index === potIndex ? { recipeId: recipe.id, startedAt, readyAt, fast: foodBuffs.cookSpeed > 0 } : pot)),
      };
    });
  };

  // Takes a finished dish out of its pot and into the bag. Reports why it couldn't (or
  // "ok"), so the kitchen can play the completion burst or explain.
  // With `rush`, a dish still simmering is finished on the spot for gems (getRushCost) —
  // checked against the bag first, so gems are never spent on a dish that can't come out.
  const collectDish = (potIndex: number, rush = false): "ok" | "great" | "full" | "notReady" | "gems" => {
    const pot = getCookingPots(state.cookingPots)[potIndex];
    const recipe = pot && RECIPES.find((item) => item.id === pot.recipeId);
    if (!pot || !recipe) return "notReady";
    const rushCost = rush ? applyDiscount(getRushCost(pot.readyAt - Date.now()), foodBuffs.rushDiscount) : 0;
    if (!rush && pot.readyAt > Date.now()) return "notReady";
    // The finished dish needs room — a free slot, or space left in its last stack.
    if (fitItems(state.inventory, [{ name: recipe.name, quantity: 1 }], getBagCapacity(state.bagExpansions)).overflow.length > 0) return "full";
    if (state.gems < rushCost) return "gems";
    // Great success: the pot gives two — if the bag has room for the second.
    const great =
      Math.random() * 100 < foodBuffs.greatSuccess &&
      fitItems(state.inventory, [{ name: recipe.name, quantity: 2 }], getBagCapacity(state.bagExpansions)).overflow.length === 0;
    const count = great ? 2 : 1;
    setState((previous) => {
      const pots = getCookingPots(previous.cookingPots);
      if (pots[potIndex]?.recipeId !== recipe.id || previous.gems < rushCost) return previous;
      const dish = previous.inventory.find((item) => item.name === recipe.name);
      const dishesCooked = (previous.dishesCooked ?? 0) + count;
      const cookedRecipes = previous.cookedRecipes?.includes(recipe.id) ? previous.cookedRecipes : [...(previous.cookedRecipes ?? []), recipe.id];
      return {
        ...previous,
        gems: previous.gems - rushCost,
        inventory: dish
          ? previous.inventory.map((item) => (item === dish ? { ...item, quantity: item.quantity + count } : item))
          : [...previous.inventory, { name: recipe.name, quantity: count, type: "dish" }],
        cookingPots: pots.map((item, index) => (index === potIndex ? null : item)),
        cookedRecipes,
        dishesCooked,
      };
    });
    return great ? "great" : "ok";
  };

  // Spends gems to open another pot; returns whether it went through.
  const unlockPot = () => {
    const unlocked = getPotsUnlocked(state.potsUnlocked);
    if (unlocked >= MAX_POTS || state.gems < getPotUnlockCost(unlocked)) return false;
    setState((previous) => {
      const current = getPotsUnlocked(previous.potsUnlocked);
      const price = getPotUnlockCost(current);
      if (current >= MAX_POTS || previous.gems < price) return previous;
      return { ...previous, gems: previous.gems - price, potsUnlocked: current + 1 };
    });
    return true;
  };

  const readyPotCount = getCookingPots(state.cookingPots).filter((pot) => pot && pot.readyAt <= now).length;

  // Reports why a purchase failed (or "ok"), so the shop can react either way.
  const buyIngredient = (name: string, listPrice: number): "ok" | "gold" | "full" => {
    const price = applyDiscount(listPrice, foodBuffs.groceryDiscount);
    if (state.gold < price) return "gold";
    if (fitItems(state.inventory, [{ name, quantity: 1 }], getBagCapacity(state.bagExpansions)).overflow.length > 0) {
      notifyBagFull();
      return "full";
    }
    setState((previous) => {
      if (previous.gold < price) return previous;
      const { kept } = fitItems(previous.inventory, [{ name, quantity: 1 }], getBagCapacity(previous.bagExpansions));
      return {
        ...previous,
        gold: previous.gold - price,
        inventory: addItems(previous.inventory, kept),
        discoveredItems: discover(previous.discoveredItems, kept.map((item) => item.name)),
      };
    });
    return "ok";
  };

  // Opens the next locked food slot for gems; returns whether it went through.
  const unlockBuffSlot = () => {
    const index = state.buffSlotsUnlocked ?? 1;
    const price = BUFF_SLOT_PRICES[index];
    if (price === undefined || state.gems < price) return false;
    setState((previous) => {
      const current = previous.buffSlotsUnlocked ?? 1;
      const cost = BUFF_SLOT_PRICES[current];
      if (cost === undefined || previous.gems < cost) return previous;
      return { ...previous, gems: previous.gems - cost, buffSlotsUnlocked: current + 1 };
    });
    return true;
  };

  // Buys a gem-priced companion (e.g. 복서기니) outright; returns whether it went through.
  const purchaseOutfit = (outfit: Outfit) => {
    const price = getOutfitGemPrice(outfit);
    const unlocked = (previous: GameState) => isOutfitUnlocked(outfit, previous.highestStageNumber ?? previous.stageNumber, previous.purchasedOutfits);
    if (price === undefined || state.gems < price || unlocked(state)) return false;
    setState((previous) => {
      if (previous.gems < price || unlocked(previous)) return previous;
      return { ...previous, gems: previous.gems - price, purchasedOutfits: [...(previous.purchasedOutfits ?? []), outfit] };
    });
    return true;
  };

  // Spends gems for more bag slots; returns whether it went through.
  const expandBag = () => {
    const expansions = state.bagExpansions ?? 0;
    const cost = getBagExpandCost(expansions);
    if (state.gems < cost || getBagCapacity(expansions) >= BAG_MAX_SLOTS) return false;
    setState((previous) => {
      const current = previous.bagExpansions ?? 0;
      const price = getBagExpandCost(current);
      if (previous.gems < price || getBagCapacity(current) >= BAG_MAX_SLOTS) return previous;
      return { ...previous, gems: previous.gems - price, bagExpansions: current + 1 };
    });
    return true;
  };

  // Returns whether the recipe was learned, so the shop can react either way. A recipe is
  // only for sale once the boss of its stage has fallen (isRecipeForSale).
  const learnRecipe = (recipeId: string) => {
    const recipe = RECIPES.find((item) => item.id === recipeId);
    const known = getKnownRecipes(state.knownRecipes);
    if (!recipe || known.includes(recipeId) || state.gold < recipe.price || !isRecipeForSale(recipe, getClearedBosses(state))) return false;
    setState((previous) => {
      const previousKnown = getKnownRecipes(previous.knownRecipes);
      if (previousKnown.includes(recipeId) || previous.gold < recipe.price) return previous;
      const knownRecipes = [...previousKnown, recipeId];
      return {
        ...previous,
        gold: previous.gold - recipe.price,
        knownRecipes,
      };
    });
    return true;
  };

  // Eats one of a cooked dish from the bag into an empty buff slot.
  // A snack is eaten on the spot: no slot, just this many regular kills' gold right now.
  const eatSnack = (name: string, goldKills: number) => {
    const killGold = getGoldReward(
      getTotalAttack(state),
      state.goldBonus + buffs.gold,
      getEnemyMaxHp(state.stageNumber, false),
      false,
    );
    const amount = killGold * goldKills;
    setState((previous) => {
      const dish = previous.inventory.find((item) => item.name === name);
      if (!dish) return previous;
      const dishesEaten = (previous.dishesEaten ?? 0) + 1;
      const totalGoldEarned = previous.totalGoldEarned + amount;
      return {
        ...previous,
        gold: previous.gold + amount,
        totalGoldEarned,
        inventory: previous.inventory
          .map((item) => (item === dish ? { ...item, quantity: item.quantity - 1 } : item))
          .filter((item) => item.quantity > 0),
        dishesEaten,
      };
    });
    playSfx("levelup");
  };

  const eatDish = (slotIndex: number, recipeId: string) => {
    const recipe = RECIPES.find((item) => item.id === recipeId);
    const buff = BUFFS[recipeId];
    if (!recipe || !buff) return;
    const instant = INSTANT_DISHES[recipeId];
    if (instant) {
      eatSnack(recipe.name, instant.goldKills);
      return;
    }
    if (buff.effect.skillReset) battle.resetSkillCooldown();
    const startedAt = Date.now();
    setState((previous) => {
      // Glutton stretches dishes eaten while it's equipped; 모험기니 tacks on a flat bonus.
      const foodDurationBonusMs = (OUTFIT_FOOD_DURATION_BONUS_SEC[previous.equippedOutfit] ?? 0) * 1000;
      const durationMs = buff.durationMs * (previous.equippedSkill === "glutton" ? GLUTTON_FOOD_MULTIPLIER : 1) + foodDurationBonusMs;
      const slots = previous.buffSlots ?? emptyBuffSlots();
      const running = (slot: (typeof slots)[number]) => slot && slot.expiresAt > startedAt;
      if (running(slots[slotIndex])) return previous;
      if (slotIndex >= (previous.buffSlotsUnlocked ?? 1)) return previous;
      // One of each dish at a time — its buff wouldn't stack meaningfully anyway.
      if (slots.some((slot) => running(slot) && slot?.recipeId === recipeId)) return previous;
      const dish = previous.inventory.find((item) => item.name === recipe.name);
      if (!dish) return previous;
      const dishesEaten = (previous.dishesEaten ?? 0) + 1;
      return {
        ...previous,
        inventory: previous.inventory
          .map((item) => (item === dish ? { ...item, quantity: item.quantity - 1 } : item))
          .filter((item) => item.quantity > 0),
        buffSlots: slots.map((slot, index) =>
          index === slotIndex ? { recipeId, expiresAt: startedAt + durationMs, durationMs } : slot,
        ),
        dishesEaten,
      };
    });
    setNow(startedAt);
  };

  // Wipes the save and every piece of in-memory battle state, back to a brand-new game.
  const resetSave = async () => {
    await clearSave();
    lastSeenAtRef.current = undefined;
    setOfflineSummary(null);
    endBossFight();
    setDefeatedBoss(false);
    setStageAnnouncement(null);
    setState(initialState);
    battle.resetEnemy(getEnemyMaxHp(0, false));
  };

  return {
    state,
    loaded,
    setState,
    questOpen,
    setQuestOpen,
    boss,
    defeatedBoss,
    defeatedStageNumber,
    displayBoss,
    isBossDefeatFlash,
    bossTimerStartedAt,
    bossTimeLimitMs,
    bossFledKey,
    bossRetryAvailable,
    retryBossAfterAd,
    bossIntroPending,
    beginBossFight,
    bossSkillCastId,
    bossSkillConfig,
    bossStunned: now < bossStunnedUntil,
    bossReviveId: battle.reviveId,
    stageAnnouncement,
    continueStage: () => setStageAnnouncement(null),
    firstClear,
    clearedStages: getClearedBosses(state),
    dismissFirstClear: () => {
      setFirstClear(null);
      setState((previous) => (previous.pendingFirstClear ? { ...previous, pendingFirstClear: undefined } : previous));
    },
    claimFirstClearGems,
    levelUpAnnouncement,
    levelUpAttackGain,
    upgradeMode,
    setUpgradeMode,
    upgraded,
    enemyMaxHp,
    battle,
    skillTutorialActive,
    upgradeStat,
    claimQuest,
    catchFlyingCoin,
    // Winged-gem ads still left today; at 0 only coins fly.
    flyingGemAdsLeft: Math.max(0, FLYING_GEM_ADS_PER_DAY - flyingGemAdsToday(state)),
    heldLoot,
    // Sends the held gold slowly up to the counter (credited as it lands), then — on the next
    // call — the ingredients into the bag, after which the intro carries on.
    collectHeldGold: () => {
      if (!heldLoot || heldLoot.stage !== "gold") return;
      setHeldLoot({ ...heldLoot, stage: "goldFlying" });
      // Credited coin by coin as each one lands, so the counter visibly stacks up.
      const shares = Array.from({ length: LOOT_COINS }, (_, index) =>
        Math.floor((heldLoot.gold * (index + 1)) / LOOT_COINS) - Math.floor((heldLoot.gold * index) / LOOT_COINS),
      );
      shares.forEach((share, index) => {
        setTimeout(() => {
          setState((previous) => ({ ...previous, gold: previous.gold + share, totalGoldEarned: previous.totalGoldEarned + share }));
        }, index * LOOT_COIN_GAP_MS + LOOT_FLIGHT_MS);
      });
      setTimeout(() => {
        setHeldLoot((current) => (current ? { ...current, stage: "items" } : current));
      }, (LOOT_COINS - 1) * LOOT_COIN_GAP_MS + LOOT_FLIGHT_MS + 400);
    },
    collectHeldItems: () => {
      if (!heldLoot || heldLoot.stage !== "items") return;
      const items = heldLoot.items;
      setHeldLoot({ ...heldLoot, stage: "itemsFlying" });
      setTimeout(() => {
        setHeldLoot(null);
        setState((previous) => ({
          ...previous,
          inventory: addItems(previous.inventory, items),
          discoveredItems: discover(previous.discoveredItems, items.map((item) => item.name)),
          giftLootExplained: true,
        }));
      }, LOOT_FLIGHT_MS + 300);
    },
    expandBag,
    unlockBuffSlot,
    purchaseOutfit,
    bagFullAt,
    notifyBagFull: () => notifyBagFull(),
    dismissBagFull: () => setBagFullAt(null),
    selectStage,
    skipToBoss,
    teleportToBoss,
    canTeleportToBoss,
    cheatAddLevels,
    cheatUnlockAllStages,
    cheatAddGems,
    equipSkill,
    skillSwapReadyAt,
    resetSave,
    offlineSummary,
    dismissOfflineSummary: () => setOfflineSummary(null),
    // The offline gold is already in the bag when the popup shows; doubling pays it once more.
    claimOfflineDouble: () => {
      if (!offlineSummary) return;
      const bonus = offlineSummary.goldEarned;
      setState((previous) => {
        const totalGoldEarned = previous.totalGoldEarned + bonus;
        return {
          ...previous,
          gold: previous.gold + bonus,
          totalGoldEarned,
        };
      });
      setOfflineSummary(null);
    },
    cook,
    foodBuffs,
    collectDish,
    unlockPot,
    readyPotCount,
    buyIngredient,
    learnRecipe,
    dropEvents,
    buffSlots,
    now,
    eatDish,
    speedMultiplier,
    // The fight's actual pace (boost x attack-speed buffs), as useAutoBattle runs it.
    battleSpeed,
    speedBoostRemainingMs,
    watchAdForSpeedBoost,
    adGemsRemainingMs,
    watchAdForGems,
  };
}

export type UseGameState = ReturnType<typeof useGameState>;
