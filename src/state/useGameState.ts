import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import type { GameState, StatKey, UpgradeMode } from "../types";
import { initialState } from "./initialState";
import { getStatLevel, getStatValue, getUpgradeQuote, statInfo } from "./gameMath";
import { useAutoBattle } from "./useAutoBattle";
import { clearSave, loadSave, writeSave } from "./storage";
import { getEnemyKind, getEnemyMaxHp, getStageLabel, LAST_STAGE_NUMBER, STAGE_KILL_TARGET } from "./stages";
import { rollDrops } from "./drops";
import { BUFFS, emptyBuffSlots, getBuffTotals } from "./buffs";
import { canCook, getKnownRecipes, RECIPES, STARTER_RECIPES } from "./recipes";
import { simulateOfflineProgress, type OfflineSummary } from "./offline";

export type DropEvent = { id: number; name: string; delay: number };

// No ad SDK wired up yet — watching one grants this instantly, same as a completed view would.
const SPEED_BOOST_DURATION_MS = 120_000;

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
  const skipStageAnnouncement = useRef(false);
  // Enemies get tougher each stage so progression isn't flat — tuned in stages.ts.
  const enemyMaxHp = getEnemyMaxHp(state.stageNumber, boss);
  // Ticks once a second so buff timers count down and expire on time.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const buffSlots = state.buffSlots ?? emptyBuffSlots();
  const buffs = getBuffTotals(buffSlots, now);
  // Ingredient drops currently flying from the defeated monster into the bag button.
  const [dropEvents, setDropEvents] = useState<DropEvent[]>([]);
  const dropEventId = useRef(0);

  // Watching an ad doubles auto-battle's pace for a while — not persisted, so it doesn't
  // survive an app restart (matches how a real rewarded-ad timer would behave).
  const [speedBoostUntil, setSpeedBoostUntil] = useState<number | null>(null);
  const speedBoostRemainingMs = speedBoostUntil ? Math.max(0, speedBoostUntil - now) : 0;
  const speedMultiplier = speedBoostRemainingMs > 0 ? 2 : 1;
  const watchAdForSpeedBoost = () => {
    if (speedBoostRemainingMs > 0) return;
    setSpeedBoostUntil(Date.now() + SPEED_BOOST_DURATION_MS);
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
        const validOutfits = ["default"];
        const equippedOutfit = validOutfits.includes(save.state.equippedOutfit)
          ? save.state.equippedOutfit
          : "default";
        let loadedState = { ...save.state, equippedOutfit };
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

  useEffect(() => {
    if (skipStageAnnouncement.current) {
      skipStageAnnouncement.current = false;
      return;
    }
    if (state.stageNumber === 0) return;
    setStageAnnouncement(getStageLabel(state.stageNumber));
    const timer = setTimeout(() => setStageAnnouncement(null), 1500);
    return () => clearTimeout(timer);
  }, [state.stageNumber]);

  // Fires the level-up burst whenever level actually goes up during live play. Gated on
  // `loaded` and previousLevelRef is synced inside the load effect above, so loading a
  // save at a higher level (or an offline-progress jump) never triggers a spurious burst.
  const [levelUpAnnouncement, setLevelUpAnnouncement] = useState<number | null>(null);
  useEffect(() => {
    if (!loaded) return;
    if (state.level > previousLevelRef.current) {
      setLevelUpAnnouncement(state.level);
      const timer = setTimeout(() => setLevelUpAnnouncement(null), 1100);
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
    const drops = rollDrops(getEnemyKind(state.stageNumber), boss);
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
      const experience = previous.experience + 8;
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
        kills,
        currentStage: boss ? getStageLabel(stageNumber) : previous.currentStage,
        stageNumber,
        highestStageNumber,
        stageKills: boss ? 0 : previous.stageKills + 1,
        totalGoldEarned,
        bossKills,
        level: experience >= 100 ? previous.level + 1 : previous.level,
        experience: experience % 100,
        quests: previous.quests.map((quest) => {
          if (quest.id === "kills") return { ...quest, current: kills };
          if (quest.id === "gold") return { ...quest, current: totalGoldEarned };
          if (quest.id === "bossKills") return { ...quest, current: bossKills };
          if (quest.id === "stage") return { ...quest, current: highestStageNumber };
          return quest;
        }),
      };
    });
  }, [boss, state.stageKills, state.stageNumber]);

  const battle = useAutoBattle({
    // Food buffs apply on top of the upgraded stats.
    attack: Math.round(state.attack * (1 + buffs.attack / 100)),
    criticalDamage: state.criticalDamage + buffs.criticalDamage,
    criticalChance: (state.criticalChance ?? 5) + buffs.criticalChance,
    goldBonus: state.goldBonus + buffs.gold,
    enemyMaxHp,
    boss,
    speedMultiplier,
    onDefeat: handleEnemyDefeat,
  });

  const upgradeStat = (key: StatKey) => {
    setState((previous) => {
      const info = statInfo[key];
      const quote = getUpgradeQuote(key, getStatLevel(previous, key), previous.gold, upgradeMode);
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
        gold: previous.gold + quest.reward,
        quests: previous.quests.map((item) => item.id === id ? { ...item, claimed: true } : item),
      };
    });
  };

  const selectStage = (stageNumber: number) => {
    const highestStageNumber = state.highestStageNumber ?? state.stageNumber;
    if (stageNumber > highestStageNumber) return;
    if (stageNumber !== state.stageNumber) skipStageAnnouncement.current = true;
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

  // Spends the recipe's ingredients from the bag and adds one of the dish.
  const cook = (recipeId: string) => {
    const recipe = RECIPES.find((item) => item.id === recipeId);
    if (!recipe) return;
    setState((previous) => {
      if (!getKnownRecipes(previous.knownRecipes).includes(recipe.id) || !canCook(previous.inventory, recipe)) return previous;
      const inventory = previous.inventory
        .map((item) => {
          const used = recipe.ingredients.find((ingredient) => ingredient.name === item.name)?.quantity ?? 0;
          return used ? { ...item, quantity: item.quantity - used } : item;
        })
        .filter((item) => item.quantity > 0);
      const dish = inventory.find((item) => item.name === recipe.name);
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

  // Returns whether the purchase went through, so the shop can react either way.
  const buyIngredient = (name: string, price: number) => {
    if (state.gold < price) return false;
    setState((previous) => {
      if (previous.gold < price) return previous;
      return { ...previous, gold: previous.gold - price, inventory: addItems(previous.inventory, [{ name, quantity: 1 }]) };
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
          index === slotIndex ? { recipeId, expiresAt: startedAt + buff.durationMs, durationMs: buff.durationMs } : slot,
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
    setSpeedBoostUntil(null);
    setState(initialState);
    battle.resetEnemy(getEnemyMaxHp(0, false));
  };

  return {
    state,
    setState,
    questOpen,
    setQuestOpen,
    boss,
    defeatedBoss,
    defeatedStageNumber,
    stageAnnouncement,
    levelUpAnnouncement,
    upgradeMode,
    setUpgradeMode,
    upgraded,
    enemyMaxHp,
    battle,
    upgradeStat,
    claimQuest,
    selectStage,
    resetSave,
    offlineSummary,
    dismissOfflineSummary: () => setOfflineSummary(null),
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
