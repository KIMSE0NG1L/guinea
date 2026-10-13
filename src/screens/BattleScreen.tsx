import { StageHeader } from "../components/StageHeader";
import { RewardPanel } from "../components/RewardPanel";
import { ImageBackground, StyleSheet, View } from "react-native";
import { BattleScene, STAGE_BACKGROUND } from "./BattleScene";
import { StatUpgradePanel } from "./StatUpgradePanel";
import type { UseGameState } from "../state/useGameState";
import { getEnemyKind } from "../state/stages";
import type { EnemyKind } from "../types";

export function BattleScreen({ game }: { game: UseGameState }) {
  const { state, battle, onBoss, pendingReward, claimReward, upgradeMode, setUpgradeMode, upgradeStat, upgraded, enemyMaxHp, boss, defeatedBoss, defeatedStageNumber } = game;
  // stageNumber advances the instant a boss dies, before its ~650ms death clip finishes —
  // keep showing the stage it died in (not the next one) for the rest of that clip, same
  // as the `boss` flag below already does, or the die animation flashes the next boss.
  const isDefeatFlash = battle.phase === "defeated" && defeatedBoss;
  const regularEnemyKind: EnemyKind = getEnemyKind(isDefeatFlash ? defeatedStageNumber : state.stageNumber);

  return (
    <>
      <StageHeader level={state.level} experience={state.experience} onBoss={onBoss} />
      <BattleScene
        critical={battle.lastCritical}
        damageEvents={battle.damageEvents}
        enemyHp={battle.enemyHp}
        enemyMaxHp={enemyMaxHp}
        boss={boss || isDefeatFlash}
        enemyKind={regularEnemyKind}
        phase={battle.phase}
        enemyId={battle.enemyId}
        lastGoldReward={battle.lastGoldReward}
        stageAdvance={game.stageAnnouncement}
        stageLabel={boss ? `${state.currentStage} · 보스` : state.currentStage}
        stageProgress={Math.min(state.stageKills, 10) * 10}
        outfit={state.equippedOutfit}
        manualEnabled={!battle.isAutoBattle}
        onManualAttack={battle.manualAttack}
        onOpenMap={() => game.setState((previous) => ({ ...previous, selectedTab: "milestone" }))}
      />
      <ImageBackground source={STAGE_BACKGROUND[regularEnemyKind]} resizeMode="cover" style={styles.lower} imageStyle={styles.lowerImage}>
        <View style={styles.lowerShade} pointerEvents="none" />
        <RewardPanel
          earned={pendingReward}
          onClaim={claimReward}
          isAutoBattle={battle.isAutoBattle}
          onToggleAuto={() => battle.setIsAutoBattle((value) => !value)}
        />
        <StatUpgradePanel
          state={state}
          upgradeMode={upgradeMode}
          onUpgradeModeChange={setUpgradeMode}
          onUpgrade={upgradeStat}
          compact
          upgraded={upgraded}
        />
      </ImageBackground>
    </>
  );
}

const styles = StyleSheet.create({
  lower: { flexGrow: 1, marginTop: 6 },
  lowerImage: { opacity: 0.85 },
  // Knocks the busy forest art back so the parchment panels read first.
  lowerShade: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: "#1d2a1a40" },
});
