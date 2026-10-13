import { StageHeader } from "../components/StageHeader";
import { RewardPanel } from "../components/RewardPanel";
import { BattleScene } from "./BattleScene";
import { StatUpgradePanel } from "./StatUpgradePanel";
import type { UseGameState } from "../state/useGameState";
import type { EnemyKind } from "../types";

// Stage 1 (stageNumber 0) is the alley slime, stage 2 the mushroom swamp, stage 3+
// (stageNumber >= 2) the giant-vegetable farm's carrot rabbit.
function getEnemyKind(stageNumber: number): EnemyKind {
  return stageNumber >= 2 ? "carrot" : stageNumber >= 1 ? "mushroom" : "slime";
}

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
      />
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
    </>
  );
}
