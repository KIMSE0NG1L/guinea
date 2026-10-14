import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import type { GameState, StatKey, UpgradeMode } from "../types";
import { initialState } from "./initialState";
import { getStatLevel, getStatValue, getUpgradeQuote, statInfo } from "./gameMath";
import { useAutoBattle } from "./useAutoBattle";
import { loadSave, writeSave } from "./storage";
import { getStageLabel, LAST_STAGE_NUMBER, STAGE_KILL_TARGET } from "./stages";
import { canCook, RECIPES } from "./recipes";

function getStageHpMultiplier(stageNumber: number) {
  return 1 + stageNumber * 1.2;
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
  // Enemies get tougher each stage so progression isn't flat — tune the multiplier here.
  const stageHpMultiplier = getStageHpMultiplier(state.stageNumber);
  const enemyMaxHp = Math.round((boss ? 220 : 80) * stageHpMultiplier);

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
  }, [boss, state.stageKills]);

  const battle = useAutoBattle({
    attack: state.attack,
    criticalDamage: state.criticalDamage,
    criticalChance: state.criticalChance ?? 5,
    goldBonus: state.goldBonus,
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
    battle.resetEnemy(Math.round(80 * getStageHpMultiplier(stageNumber)));
  };

  // Spends the recipe's ingredients from the bag and adds one of the dish.
  const cook = (recipeId: string) => {
    const recipe = RECIPES.find((item) => item.id === recipeId);
    if (!recipe) return;
    setState((previous) => {
      if (!canCook(previous.inventory, recipe)) return previous;
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
  };
}

export type UseGameState = ReturnType<typeof useGameState>;
