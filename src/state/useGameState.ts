import { useCallback, useEffect, useState } from "react";
import { AppState } from "react-native";
import type { GameState, StatKey, UpgradeMode } from "../types";
import { initialState } from "./initialState";
import { getStatLevel, getStatValue, getUpgradeQuote, statInfo } from "./gameMath";
import { useAutoBattle } from "./useAutoBattle";
import { loadSave, writeSave } from "./storage";

export function useGameState() {
  const [state, setState] = useState(initialState);
  const [pendingReward, setPendingReward] = useState(220);
  const [questOpen, setQuestOpen] = useState(false);
  const [boss, setBoss] = useState(false);
  const [defeatedBoss, setDefeatedBoss] = useState(false);
  const [stageAnnouncement, setStageAnnouncement] = useState<string | null>(null);
  const [upgradeMode, setUpgradeMode] = useState<UpgradeMode>(1);
  const [upgraded, setUpgraded] = useState<StatKey | null>(null);
  const enemyMaxHp = boss ? 220 : 80;

  // Gates the autosave effect below until the saved-game load (or its absence) has
  // resolved — otherwise the fresh `initialState` would autosave over a real save
  // during the brief window before AsyncStorage responds.
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadSave().then((save) => {
      if (save) {
        // Guards against a save written before an outfit was retired (e.g. "forest") —
        // falls back to default rather than crashing when looking up its sprite sheet.
        const validOutfits = ["default", "acorn", "pauper"];
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
    if (state.stageNumber === 0) return;
    setStageAnnouncement(`+${state.stageNumber} 스테이지`);
    const timer = setTimeout(() => setStageAnnouncement(null), 1500);
    return () => clearTimeout(timer);
  }, [state.stageNumber]);

  const handleEnemyDefeat = useCallback((goldReward: number) => {
    setDefeatedBoss(boss);
    if (boss) setBoss(false);

    setState((previous) => {
      const kills = previous.kills + 1;
      const experience = previous.experience + 8;
      const totalGoldEarned = previous.totalGoldEarned + goldReward;
      const stageNumber = boss ? previous.stageNumber + 1 : previous.stageNumber;
      return {
        ...previous,
        gold: previous.gold + goldReward,
        kills,
        currentStage: boss ? `+${stageNumber} 스테이지` : previous.currentStage,
        stageNumber,
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
  }, [boss]);

  const battle = useAutoBattle({
    attack: state.attack,
    criticalDamage: state.criticalDamage,
    criticalChance: state.criticalChance ?? 5,
    goldBonus: state.goldBonus,
    enemyMaxHp,
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

  const onBoss = () => {
    const nextBoss = !boss;
    setDefeatedBoss(false);
    setBoss(nextBoss);
    battle.resetEnemy(nextBoss ? 220 : 80);
  };

  return {
    state,
    setState,
    pendingReward,
    questOpen,
    setQuestOpen,
    boss,
    defeatedBoss,
    stageAnnouncement,
    upgradeMode,
    setUpgradeMode,
    upgraded,
    enemyMaxHp,
    battle,
    claimReward,
    upgradeStat,
    claimQuest,
    onBoss,
  };
}

export type UseGameState = ReturnType<typeof useGameState>;
