import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import type { GameState, SkillId, StatKey, UpgradeMode } from "../types";
import { GLUTTON_FOOD_MULTIPLIER, SKILL_SWAP_LOCK_MS, getSkill } from "./skills";
import { initialState } from "./initialState";
import { getExpReward, getExpToLevel, getStatLevel, getStatValue, getTotalAttack, getUpgradeQuote, statInfo } from "./gameMath";
import { useAutoBattle } from "./useAutoBattle";
import { clearSave, loadSave, writeSave } from "./storage";
import { advanceQuest, migrateQuests } from "./quests";
import { getUnlocksAtLevel, isSkillUnlocked } from "./unlocks";
import { fitItems, getBagCapacity, getBagExpandCost, BAG_MAX_SLOTS } from "./bag";
import { getEnemyKind, getEnemyMaxHp, getStageLabel, LAST_STAGE_NUMBER, STAGE_KILL_TARGET } from "./stages";
import { rollDrops } from "./drops";
import { BUFFS, OUTFIT_BUFFS, OUTFIT_COOLDOWN_REDUCTION_SEC, OUTFIT_FOOD_DURATION_BONUS_SEC, OUTFIT_HIT_COUNT, OUTFIT_MISS_CHANCE, emptyBuffSlots, getBuffTotals } from "./buffs";
import { canCook, consumeIngredients, getKnownRecipes, RECIPES, STARTER_RECIPES } from "./recipes";
import { simulateOfflineProgress, type OfflineSummary } from "./offline";

export type DropEvent = { id: number; name: string; delay: number };

// No ad SDK wired up yet — watching one grants this instantly, same as a completed view would.
const SPEED_BOOST_DURATION_MS = 60 * 60_000; // 1 hour

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

export function useGameState() {
  const [state, setState] = useState(initialState);
  const [questOpen, setQuestOpen] = useState(false);
  const [boss, setBoss] = useState(false);
  const [defeatedBoss, setDefeatedBoss] = useState(false);
  // The stage theme (and therefore boss sprite) a dying boss should keep showing until
  // its death animation finishes — stageNumber itself advances immediately on defeat,
  // which would otherwise swap the die animation to the *next* stage's boss mid-clip.
  const [defeatedStageNumber, setDefeatedStageNumber] = useState(0);
  const [stageAnnouncement, setStageAnnouncement] = useState<string | null>(null);
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
  const foodBuffs = getBuffTotals(buffSlots, now);
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
  const watchAdForSpeedBoost = () => {
    if (speedBoostRemainingMs > 0) return;
    const startedAt = Date.now();
    setState((previous) => ({ ...previous, speedBoostUntil: startedAt + SPEED_BOOST_DURATION_MS }));
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
        const validOutfits = ["default", "explorerHamster", "tetoGini", "assassinGini", "egenGini"];
        const equippedOutfit = validOutfits.includes(save.state.equippedOutfit)
          ? save.state.equippedOutfit
          : "default";
        // Placeholder starter materials that were never used by any recipe — strip them
        // from older saves so they stop cluttering the bag.
        const retiredItems = ["낡은 천", "작은 돌"];
        // Items renamed since the save was written keep their count under the new name.
        const renamedItems: Record<string, string> = { "들풀 다발": "고수" };
        const inventory = save.state.inventory
          .filter((item) => !retiredItems.includes(item.name))
          .map((item) => (renamedItems[item.name] ? { ...item, name: renamedItems[item.name] } : item));
        // Re-reads titles/targets/gem rewards from the quest ladders (older saves had
        // one-shot gold quests).
        const quests = migrateQuests(save.state.quests);
        // 당근 수프 used to be the free starter recipe; there is none now (the first one is
        // bought in the recipe tutorial), so saves from before that drop the freebie — once.
        // Those saves are the ones with no recipeTutorialDone field yet; it's filled in below,
        // so a 당근 수프 bought afterwards is never stripped again on the next load.
        const fromBeforeRecipeTutorial = save.state.recipeTutorialDone === undefined;
        const knownRecipes = fromBeforeRecipeTutorial
          ? (save.state.knownRecipes ?? []).filter((id) => id !== "carrot-soup")
          : save.state.knownRecipes;
        const recipeTutorialDone = save.state.recipeTutorialDone ?? false;
        // Saves from before the ingredient codex start it from whatever's in the bag now.
        const discoveredItems = save.state.discoveredItems ?? inventory.filter((item) => item.type === "food").map((item) => item.name);
        let loadedState: GameState = { ...save.state, equippedOutfit, inventory, quests, knownRecipes, recipeTutorialDone, discoveredItems };
        lastSeenAtRef.current = save.lastSeenAt;
        if (save.lastSeenAt) {
          const result = simulateOfflineProgress(loadedState, Date.now() - save.lastSeenAt);
          if (result) {
            loadedState = result.state;
            setOfflineSummary(result.summary);
          }
        }
        previousLevelRef.current = loadedState.level;
        setState(loadedState);
      }
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const timer = setTimeout(() => {
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

  useEffect(() => {
    if (!stageAnnouncement) return;
    const timer = setTimeout(() => setStageAnnouncement(null), 1500);
    return () => clearTimeout(timer);
  }, [stageAnnouncement]);

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
      // Held longer when something unlocks, so its toast can actually be read.
      const unlocks = getUnlocksAtLevel(state.level);
      const holdMs = unlocks.outfits.length + unlocks.skills.length > 0 ? 2800 : 1100;
      const timer = setTimeout(() => setLevelUpAnnouncement(null), holdMs);
      previousLevelRef.current = state.level;
      return () => clearTimeout(timer);
    }
    previousLevelRef.current = state.level;
  }, [state.level, loaded]);

  const handleEnemyDefeat = useCallback((goldReward: number) => {
    setDefeatedBoss(boss);
    if (boss) setBoss(false);
    // Killing the 25th regular mob spawns the boss directly — no manual "challenge" step.
    const reachesBossThreshold = !boss && state.stageKills + 1 >= STAGE_KILL_TARGET;
    if (reachesBossThreshold) setBoss(true);

    // Rolled out here, not inside the state updater, so a re-run updater can't re-roll.
    // A full bag turns away whatever has no room left (no free slot, no space in its
    // last stack of 64) — those just don't drop.
    let rolled = rollDrops(getEnemyKind(state.stageNumber), boss);
    // The first slime after the intro always leaves a 초록 젤리 ×3 — exactly one 말랑 초록
    // 젤리's worth, which kicks off the recipe tutorial.
    const tutorialJelly = state.tutorialDone && !state.recipeTutorialDone && !boss
      && getEnemyKind(state.stageNumber) === "slime" && !state.inventory.some((item) => item.name === "초록 젤리");
    if (tutorialJelly) rolled = [...rolled.filter((drop) => drop.name !== "초록 젤리"), { name: "초록 젤리", quantity: 3 }];
    const drops = fitItems(state.inventory, rolled, getBagCapacity(state.bagExpansions)).kept;
    if (drops.length > 0) {
      // One flying icon per item, staggered so a boss's pile spills out one by one.
      const events = drops
        .flatMap((drop) => Array.from({ length: drop.quantity }, () => drop.name))
        .map((name, index) => ({ id: ++dropEventId.current, name, delay: index * 110 }));
      setDropEvents((current) => [...current, ...events]);
      const ids = events.map((event) => event.id);
      setTimeout(() => setDropEvents((current) => current.filter((event) => !ids.includes(event.id))), 2000 + events.length * 110);
    }

    setState((previous) => {
      if (boss) setDefeatedStageNumber(previous.stageNumber);

      const kills = previous.kills + 1;
      let level = previous.level;
      let experience = previous.experience + getExpReward(previous.stageNumber, boss);
      while (experience >= getExpToLevel(level)) {
        experience -= getExpToLevel(level);
        level += 1;
      }
      const totalGoldEarned = previous.totalGoldEarned + goldReward;
      const bossKills = (previous.bossKills ?? 0) + (boss ? 1 : 0);
      // Stage 3 (stageNumber 2) is the last one with content — clearing its boss loops
      // back to stage 1 instead of advancing into an unthemed stage 4.
      const stageNumber = boss ? (previous.stageNumber >= LAST_STAGE_NUMBER ? 0 : previous.stageNumber + 1) : previous.stageNumber;
      // Saves from before the milestone map have no record — what they're on is the floor.
      const highestStageNumber = Math.max(previous.highestStageNumber ?? previous.stageNumber, stageNumber);
      return {
        ...previous,
        gold: previous.gold + goldReward,
        inventory: addItems(previous.inventory, drops),
        discoveredItems: discover(previous.discoveredItems, drops.map((drop) => drop.name)),
        kills,
        currentStage: boss ? getStageLabel(stageNumber) : previous.currentStage,
        stageNumber,
        highestStageNumber,
        stageKills: boss ? 0 : previous.stageKills + 1,
        totalGoldEarned,
        bossKills,
        level,
        experience,
        quests: previous.quests.map((quest) => {
          if (quest.id === "kills") return { ...quest, current: kills };
          if (quest.id === "gold") return { ...quest, current: totalGoldEarned };
          if (quest.id === "bossKills") return { ...quest, current: bossKills };
          if (quest.id === "stage") return { ...quest, current: highestStageNumber };
          return quest;
        }),
      };
    });
  }, [boss, state.stageKills, state.stageNumber, state.inventory, state.bagExpansions, state.tutorialDone, state.recipeTutorialDone]);

  // Gold that isn't a kill reward (the Steal skill) still counts toward the gold quest.
  const addBonusGold = useCallback((amount: number) => {
    setState((previous) => {
      const totalGoldEarned = previous.totalGoldEarned + amount;
      return {
        ...previous,
        gold: previous.gold + amount,
        totalGoldEarned,
        quests: previous.quests.map((quest) => (quest.id === "gold" ? { ...quest, current: totalGoldEarned } : quest)),
      };
    });
  }, []);

  const battle = useAutoBattle({
    // Food buffs and the equipped companion's bonus apply on top of the upgraded stats.
    attack: Math.round(getTotalAttack(state) * (1 + buffs.attack / 100)),
    criticalDamage: state.criticalDamage + buffs.criticalDamage,
    criticalChance: (state.criticalChance ?? 5) + buffs.criticalChance,
    goldBonus: state.goldBonus + buffs.gold,
    missChance: OUTFIT_MISS_CHANCE[state.equippedOutfit] ?? 0,
    hitCount: OUTFIT_HIT_COUNT[state.equippedOutfit] ?? 1,
    cooldownReductionMs: (OUTFIT_COOLDOWN_REDUCTION_SEC[state.equippedOutfit] ?? 0) * 1000,
    enemyMaxHp,
    boss,
    speedMultiplier,
    onDefeat: handleEnemyDefeat,
    onBonusGold: addBonusGold,
    equippedSkill: state.equippedSkill ?? null,
  });

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
      const info = statInfo[key];
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
        [key]: getStatValue(previous, key) + info.step * quote.levels,
        statLevels: {
          ...previousLevels,
          [key]: previousLevels[key] + quote.levels,
        },
        attackUpgrades,
        quests: previous.quests.map((quest) =>
          quest.id === "attack" ? { ...quest, current: attackUpgrades } : quest
        ),
      };
    });
    setUpgraded(key);
    setTimeout(() => setUpgraded(null), 400);
  };

  const claimQuest = (id: string) => {
    setState((previous) => {
      const quest = previous.quests.find((item) => item.id === id);
      if (!quest || quest.claimed || quest.current < quest.target) return previous;
      return {
        ...previous,
        gems: previous.gems + quest.reward,
        quests: previous.quests.map((item) => (item.id === id ? advanceQuest(item) : item)),
      };
    });
  };

  const selectStage = (stageNumber: number) => {
    const highestStageNumber = state.highestStageNumber ?? state.stageNumber;
    if (stageNumber > highestStageNumber) return;
    if (stageNumber !== state.stageNumber) setSkipStageAnnouncement(true);
    setStageAnnouncement(null);
    setBoss(false);
    setDefeatedBoss(false);
    setState((previous) => ({
      ...previous,
      currentStage: getStageLabel(stageNumber),
      stageNumber,
      stageKills: 0,
      highestStageNumber,
      selectedTab: "battle",
      quests: previous.quests.map((quest) =>
        quest.id === "stage" ? { ...quest, current: highestStageNumber } : quest
      ),
    }));
    battle.resetEnemy(getEnemyMaxHp(stageNumber, false));
  };

  // Dev-convenience shortcut from the settings menu — skips straight to the current
  // stage's boss instead of grinding out the 25 regular-mob kills first.
  const skipToBoss = () => {
    if (boss) return;
    setStageAnnouncement(null);
    setDefeatedBoss(false);
    setBoss(true);
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

  // Spends the recipe's ingredients from the bag and adds one of the dish.
  const cook = (recipeId: string) => {
    const recipe = RECIPES.find((item) => item.id === recipeId);
    if (!recipe) return;
    setState((previous) => {
      if (!getKnownRecipes(previous.knownRecipes).includes(recipe.id) || !canCook(previous.inventory, recipe)) return previous;
      const inventory = consumeIngredients(previous.inventory, recipe);
      const dish = inventory.find((item) => item.name === recipe.name);
      // The finished dish needs room — a free slot, or space left in its last stack.
      if (fitItems(inventory, [{ name: recipe.name, quantity: 1 }], getBagCapacity(previous.bagExpansions)).overflow.length > 0) return previous;
      const dishesCooked = (previous.dishesCooked ?? 0) + 1;
      return {
        ...previous,
        inventory: dish
          ? inventory.map((item) => (item === dish ? { ...item, quantity: item.quantity + 1 } : item))
          : [...inventory, { name: recipe.name, quantity: 1, type: "dish" }],
        dishesCooked,
        quests: previous.quests.map((quest) =>
          quest.id === "cook" ? { ...quest, current: dishesCooked } : quest
        ),
      };
    });
  };

  // Reports why a purchase failed (or "ok"), so the shop can react either way.
  const buyIngredient = (name: string, price: number): "ok" | "gold" | "full" => {
    if (state.gold < price) return "gold";
    if (fitItems(state.inventory, [{ name, quantity: 1 }], getBagCapacity(state.bagExpansions)).overflow.length > 0) return "full";
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

  // Returns whether the recipe was learned, so the shop can react either way.
  const learnRecipe = (recipeId: string) => {
    const recipe = RECIPES.find((item) => item.id === recipeId);
    const known = getKnownRecipes(state.knownRecipes);
    if (!recipe || known.includes(recipeId) || state.gold < recipe.price) return false;
    setState((previous) => {
      const previousKnown = getKnownRecipes(previous.knownRecipes);
      if (previousKnown.includes(recipeId) || previous.gold < recipe.price) return previous;
      const knownRecipes = [...previousKnown, recipeId];
      const learnedCount = knownRecipes.filter((id) => !STARTER_RECIPES.includes(id)).length;
      return {
        ...previous,
        gold: previous.gold - recipe.price,
        knownRecipes,
        quests: previous.quests.map((quest) =>
          quest.id === "recipe" ? { ...quest, current: learnedCount } : quest
        ),
      };
    });
    return true;
  };

  // Eats one of a cooked dish from the bag into an empty buff slot.
  const eatDish = (slotIndex: number, recipeId: string) => {
    const recipe = RECIPES.find((item) => item.id === recipeId);
    const buff = BUFFS[recipeId];
    if (!recipe || !buff) return;
    const startedAt = Date.now();
    setState((previous) => {
      // Glutton stretches dishes eaten while it's equipped; 모험기니 tacks on a flat bonus.
      const foodDurationBonusMs = (OUTFIT_FOOD_DURATION_BONUS_SEC[previous.equippedOutfit] ?? 0) * 1000;
      const durationMs = buff.durationMs * (previous.equippedSkill === "glutton" ? GLUTTON_FOOD_MULTIPLIER : 1) + foodDurationBonusMs;
      const slots = previous.buffSlots ?? emptyBuffSlots();
      const running = (slot: (typeof slots)[number]) => slot && slot.expiresAt > startedAt;
      if (running(slots[slotIndex])) return previous;
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
        quests: previous.quests.map((quest) =>
          quest.id === "buff" ? { ...quest, current: dishesEaten } : quest
        ),
      };
    });
    setNow(startedAt);
  };

  // Wipes the save and every piece of in-memory battle state, back to a brand-new game.
  const resetSave = async () => {
    await clearSave();
    lastSeenAtRef.current = undefined;
    setOfflineSummary(null);
    setBoss(false);
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
    stageAnnouncement,
    levelUpAnnouncement,
    levelUpAttackGain,
    upgradeMode,
    setUpgradeMode,
    upgraded,
    enemyMaxHp,
    battle,
    upgradeStat,
    claimQuest,
    expandBag,
    selectStage,
    skipToBoss,
    cheatAddLevels,
    cheatUnlockAllStages,
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
          quests: previous.quests.map((quest) => (quest.id === "gold" ? { ...quest, current: totalGoldEarned } : quest)),
        };
      });
      setOfflineSummary(null);
    },
    cook,
    buyIngredient,
    learnRecipe,
    dropEvents,
    buffSlots,
    now,
    eatDish,
    speedMultiplier,
    speedBoostRemainingMs,
    watchAdForSpeedBoost,
  };
}

export type UseGameState = ReturnType<typeof useGameState>;
