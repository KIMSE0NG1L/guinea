import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import type { GameState, StatKey, UpgradeMode } from "../types";
import { initialState } from "./initialState";
import { getStatLevel, getStatValue, getUpgradeQuote, statInfo } from "./gameMath";
import { useAutoBattle } from "./useAutoBattle";
import { loadSave, writeSave } from "./storage";
import { getEnemyKind, getEnemyMaxHp, getStageGoldMultiplier, getStageLabel, LAST_STAGE_NUMBER, STAGE_KILL_TARGET } from "./stages";
import { rollDrops } from "./drops";
import { BUFFS, emptyBuffSlots, getBuffTotals } from "./buffs";
import { canCook, getKnownRecipes, RECIPES } from "./recipes";

export type DropEvent = { id: number; name: string; delay: number };

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
  const [pendingReward, setPendingReward] = useState(220);
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

  // Gates the autosave effect below until the saved-game load (or its absence) has
  // resolved — otherwise the fresh `initialState` would autosave over a real save
  // during the brief window before AsyncStorage responds.
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadSave().then((save) => {
      if (save) {
        // Guards against a save written before an outfit was retired (e.g. "forest") —
        // falls back to default rather than crashing when looking up its sprite sheet.
        const validOutfits = ["default"];
        const equippedOutfit = validOutfits.includes(save.state.equippedOutfit)
          ? save.state.equippedOutfit
          : "default";
        setState({ ...save.state, equippedOutfit });
        setPendingReward(save.pendingReward);
      }
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const timer = setTimeout(() => {
      writeSave({ state, pendingReward });
    }, 800);

    // Flush immediately if the app is backgrounded/closed before the debounce fires,
    // so the last few seconds of progress aren't lost.
    const subscription = AppState.addEventListener("change", (status) => {
      if (status !== "active") writeSave({ state, pendingReward });
    });

    return () => {
      clearTimeout(timer);
      subscription.remove();
    };
  }, [state, pendingReward, loaded]);

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
      // Stage 3 (stageNumber 2) is the last one with content — clearing its boss loops
      // back to stage 1 instead of advancing into an unthemed stage 4.
      const stageNumber = boss ? (previous.stageNumber >= LAST_STAGE_NUMBER ? 0 : previous.stageNumber + 1) : previous.stageNumber;
      return {
        ...previous,
        gold: previous.gold + goldReward,
        inventory: addItems(previous.inventory, drops),
        kills,
        currentStage: boss ? getStageLabel(stageNumber) : previous.currentStage,
        stageNumber,
        // Saves from before the milestone map have no record — what they're on is the floor.
        highestStageNumber: Math.max(previous.highestStageNumber ?? previous.stageNumber, stageNumber),
        stageKills: boss ? 0 : previous.stageKills + 1,
        totalGoldEarned,
        level: experience >= 100 ? previous.level + 1 : previous.level,
        experience: experience % 100,
        quests: previous.quests.map((quest) => {
          if (quest.id === "kills") return { ...quest, current: kills };
          if (quest.id === "gold") return { ...quest, current: totalGoldEarned };
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
    goldMultiplier: getStageGoldMultiplier(state.stageNumber),
    enemyMaxHp,
    boss,
    onDefeat: handleEnemyDefeat,
  });

  const claimReward = () => {
    setState((previous) => {
      const totalGoldEarned = previous.totalGoldEarned + pendingReward;
      return {
        ...previous,
        gold: previous.gold + pendingReward,
        totalGoldEarned,
        quests: previous.quests.map((quest) =>
          quest.id === "gold" ? { ...quest, current: totalGoldEarned } : quest
        ),
      };
    });
    setPendingReward(0);
  };

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
      return {
        ...previous,
        inventory: dish
          ? inventory.map((item) => (item === dish ? { ...item, quantity: item.quantity + 1 } : item))
          : [...inventory, { name: recipe.name, quantity: 1, type: "dish" }],
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
      return { ...previous, gold: previous.gold - recipe.price, knownRecipes: [...previousKnown, recipeId] };
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
      return {
        ...previous,
        inventory: previous.inventory
          .map((item) => (item === dish ? { ...item, quantity: item.quantity - 1 } : item))
          .filter((item) => item.quantity > 0),
        buffSlots: slots.map((slot, index) =>
          index === slotIndex ? { recipeId, expiresAt: startedAt + buff.durationMs, durationMs: buff.durationMs } : slot,
        ),
      };
    });
    setNow(startedAt);
  };

  return {
    state,
    setState,
    pendingReward,
    questOpen,
    setQuestOpen,
    boss,
    defeatedBoss,
    defeatedStageNumber,
    stageAnnouncement,
    upgradeMode,
    setUpgradeMode,
    upgraded,
    enemyMaxHp,
    battle,
    claimReward,
    upgradeStat,
    claimQuest,
    selectStage,
    cook,
    buyIngredient,
    learnRecipe,
    dropEvents,
    buffSlots,
    now,
    eatDish,
  };
}

export type UseGameState = ReturnType<typeof useGameState>;
