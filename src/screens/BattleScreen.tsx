import { useEffect, useRef, useState } from "react";
import { DishPicker } from "../components/DishPicker";
import { BattleActionsPanel } from "../components/BattleActionsPanel";
import { BuffSlots } from "../components/BuffSlots";
import { SkillSlot } from "../components/SkillSlot";
import { AdUnavailableModal } from "../components/AdUnavailableModal";
import { BattleScene } from "./BattleScene";
import { StatUpgradePanel } from "./StatUpgradePanel";
import type { UseGameState } from "../state/useGameState";
import { getEnemyKind, getStageLabel } from "../state/stages";
import { getBagCapacity } from "../state/bag";
import type { EnemyKind } from "../types";

export function BattleScreen({ game }: { game: UseGameState }) {
  const { state, battle, upgradeMode, setUpgradeMode, upgradeStat, upgraded, enemyMaxHp, boss, defeatedBoss, defeatedStageNumber } = game;
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
  const [adModalOpen, setAdModalOpen] = useState(false);

  // Fires once right as the boss sprite actually appears (displayBoss flips false→true),
  // not at the 25th-kill moment — that's still mid mob-death-clip, see isMobToBossTransition.
  const [bossEntranceKey, setBossEntranceKey] = useState<string | null>(null);
  const wasDisplayBoss = useRef(displayBoss);
  useEffect(() => {
    if (displayBoss && !wasDisplayBoss.current) {
      const key = `${regularEnemyKind}-${battle.enemyId}`;
      setBossEntranceKey(key);
      const timer = setTimeout(() => setBossEntranceKey(null), 1300);
      wasDisplayBoss.current = displayBoss;
      return () => clearTimeout(timer);
    }
    wasDisplayBoss.current = displayBoss;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayBoss]);

  return (
    <>
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
        questReady={state.quests.some((quest) => quest.current >= quest.target && !quest.claimed)}
        onQuest={() => game.setQuestOpen(true)}
        outfit={state.equippedOutfit}
        manualEnabled={!battle.isAutoBattle}
        onManualAttack={battle.manualAttack}
        onOpenMap={() => game.setState((previous) => ({ ...previous, selectedTab: "milestone" }))}
        onOpenKitchen={() => game.setState((previous) => ({ ...previous, selectedTab: "kitchen" }))}
        onOpenBag={() => game.setState((previous) => ({ ...previous, selectedTab: "inventory" }))}
        bagFull={state.inventory.length >= getBagCapacity(state.bagExpansions)}
        skillBar={
          <SkillSlot
            skillId={state.equippedSkill ?? null}
            timers={battle.skillTimers}
            now={game.now}
            canCast={battle.canCastSkill(game.now)}
            onCast={battle.castSkill}
            onOpenSkills={() => game.setState((previous) => ({ ...previous, selectedTab: "skills" }))}
          />
        }
        goldEvents={battle.goldEvents}
        executeId={battle.executeId}
        executedKill={battle.lastKillExecuted}
        beamId={battle.castIds.beam}
        stealId={battle.castIds.steal}
        focusId={battle.castIds.focus}
        shoutId={battle.castIds.shout}
        dropEvents={game.dropEvents}
        bossEntranceKey={bossEntranceKey}
        levelUpAnnouncement={game.levelUpAnnouncement}
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
      {adModalOpen && (
        <AdUnavailableModal
          message="대신 섭섭하지 않게 2배속 효과는 그대로 챙겨드릴게요."
          claimLabel="2배속 받기"
          onClaim={() => {
            game.watchAdForSpeedBoost();
            setAdModalOpen(false);
          }}
        />
      )}
      <BattleActionsPanel
        isAutoBattle={battle.isAutoBattle}
        onToggleAuto={() => battle.setIsAutoBattle((value) => !value)}
        speedBoostActive={game.speedMultiplier > 1}
        speedBoostRemainingMs={game.speedBoostRemainingMs}
        onWatchAd={() => setAdModalOpen(true)}
        left={<BuffSlots slots={game.buffSlots} now={game.now} onPressSlot={setPickingSlot} />}
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

