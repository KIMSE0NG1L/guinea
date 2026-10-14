import { useState } from "react";
import { StageHeader } from "../components/StageHeader";
import { DishPicker } from "../components/DishPicker";
import { RewardPanel } from "../components/RewardPanel";
import { BattleScene } from "./BattleScene";
import { StatUpgradePanel } from "./StatUpgradePanel";
import type { UseGameState } from "../state/useGameState";
import { getEnemyKind, getStageLabel } from "../state/stages";
import type { EnemyKind } from "../types";

export function BattleScreen({ game }: { game: UseGameState }) {
  const { state, battle, pendingReward, claimReward, upgradeMode, setUpgradeMode, upgradeStat, upgraded, enemyMaxHp, boss, defeatedBoss, defeatedStageNumber } = game;
  // stageNumber advances the instant a boss dies, before its ~650ms death clip finishes —
  // keep showing the stage it died in (not the next one) for the rest of that clip, same
  // as the `boss` flag below already does, or the die animation flashes the next boss.
  const isDefeatFlash = battle.phase === "defeated" && defeatedBoss;
  const displayStageNumber = isDefeatFlash ? defeatedStageNumber : state.stageNumber;
  const regularEnemyKind: EnemyKind = getEnemyKind(displayStageNumber);
  // Derived live from stageNumber rather than the saved `state.currentStage` string, so a
  // save written before a stage-label wording change can't show a stale label.
  const stageLabel = getStageLabel(displayStageNumber);
  // The 25th regular-mob kill flips `boss` true immediately (so the next spawn is the
  // boss), but that mob's own ~650ms death clip is still playing — keep rendering it as
  // the mob until the clip (and `phase`) actually moves past "defeated", or the die
  // animation flashes the boss for a frame.
  const isMobToBossTransition = battle.phase === "defeated" && !defeatedBoss && boss;
  const displayBoss = (boss && !isMobToBossTransition) || isDefeatFlash;
  // Which empty buff slot the dish picker is filling, if it's open.
  const [pickingSlot, setPickingSlot] = useState<number | null>(null);

  return (
    <>
      <StageHeader level={state.level} experience={state.experience} />
      <BattleScene
        critical={battle.lastCritical}
        damageEvents={battle.damageEvents}
        enemyHp={battle.enemyHp}
        enemyMaxHp={enemyMaxHp}
        boss={displayBoss}
        enemyKind={regularEnemyKind}
        phase={battle.phase}
        enemyId={battle.enemyId}
        lastGoldReward={battle.lastGoldReward}
        stageAdvance={game.stageAnnouncement}
        stageLabel={boss ? `${stageLabel} · 보스` : stageLabel}
        stageKills={state.stageKills}
        outfit={state.equippedOutfit}
        manualEnabled={!battle.isAutoBattle}
        onManualAttack={battle.manualAttack}
        onOpenMap={() => game.setState((previous) => ({ ...previous, selectedTab: "milestone" }))}
        onOpenKitchen={() => game.setState((previous) => ({ ...previous, selectedTab: "kitchen" }))}
        onOpenBag={() => game.setState((previous) => ({ ...previous, selectedTab: "inventory" }))}
        dropEvents={game.dropEvents}
        buffSlots={game.buffSlots}
        now={game.now}
        onPressBuffSlot={setPickingSlot}
      />
      {pickingSlot !== null && (
        <DishPicker
          inventory={state.inventory}
          slots={game.buffSlots}
          now={game.now}
          onEat={(recipeId) => {
            game.eatDish(pickingSlot, recipeId);
            setPickingSlot(null);
          }}
          onClose={() => setPickingSlot(null)}
          onGoCook={() => {
            setPickingSlot(null);
            game.setState((previous) => ({ ...previous, selectedTab: "kitchen" }));
          }}
        />
      )}
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

