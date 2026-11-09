import { useEffect, useRef, useState } from "react";
import { DishPicker } from "../components/DishPicker";
import { BattleActionsPanel } from "../components/BattleActionsPanel";
import { BuffSlots } from "../components/BuffSlots";
import { SkillSlot } from "../components/SkillSlot";
import { RewardedAdModal } from "../components/RewardedAdModal";
import { BattleScene } from "./BattleScene";
import { StatUpgradePanel } from "./StatUpgradePanel";
import { BOSS_RETRY_TIME_RATIO, type UseGameState } from "../state/useGameState";
import { getBossTimeLimitMs } from "../state/gameMath";
import { getEnemyKind, getStageLabel } from "../state/stages";
import { getBagCapacity, slotsUsed } from "../state/bag";
import { playSfx } from "../sound";
import { ConfirmModal } from "../components/ConfirmModal";
import { BUFF_SLOT_PRICES } from "../state/buffs";
import type { EnemyKind } from "../types";
import { hasClaimableQuest } from "../state/quests";

export function BattleScreen({ game }: { game: UseGameState }) {
  const {
    state,
    battle,
    upgradeMode,
    setUpgradeMode,
    upgradeStat,
    upgraded,
    enemyMaxHp,
    boss,
    displayBoss,
    isBossDefeatFlash,
    defeatedStageNumber,
    bossSkillCastId,
    bossSkillConfig,
    bossReviveId,
  } = game;
  // stageNumber advances the instant a boss dies, before its ~650ms death clip finishes —
  // keep showing the stage it died in (not the next one) for the rest of that clip, same
  // as `displayBoss` already does, or the die animation flashes the next boss.
  const displayStageNumber = isBossDefeatFlash ? defeatedStageNumber : state.stageNumber;
  const regularEnemyKind: EnemyKind = getEnemyKind(displayStageNumber);
  // Derived live from stageNumber rather than the saved `state.currentStage` string, so a
  // save written before a stage-label wording change can't show a stale label.
  const stageLabel = getStageLabel(displayStageNumber);
  // Which empty buff slot the dish picker is filling, if it's open.
  const [pickingSlot, setPickingSlot] = useState<number | null>(null);
  // A locked food slot that was tapped: confirm the gem price (slots open in order).
  const [unlockingSlot, setUnlockingSlot] = useState<number | null>(null);
  const [adModalOpen, setAdModalOpen] = useState(false);

  // The entrance banner shows once the boss sprite is actually up (displayBoss — not at the
  // 25th-kill moment, that's still mid mob-death-clip) and stays until tapped.
  const bossEntranceKey = displayBoss && game.bossIntroPending ? `${regularEnemyKind}-${battle.enemyId}` : null;
  const wasDisplayBoss = useRef(displayBoss);
  useEffect(() => {
    if (displayBoss && !wasDisplayBoss.current) playSfx("bossEnter");
    wasDisplayBoss.current = displayBoss;
  }, [displayBoss]);

  return (
    <>
      <BattleScene
        critical={battle.lastCritical}
        damageEvents={battle.damageEvents}
        enemyHp={battle.enemyHp}
        enemyMaxHp={enemyMaxHp}
        boss={displayBoss}
        miniBoss={game.displayMiniBoss}
        bossEnraged={game.bossEnraged}
        miniBossDefeated={game.isMiniDefeatFlash}
        golden={game.displayGolden}
        goldenReward={game.goldenReward}
        bossReward={game.bossReward}
        enemyKind={regularEnemyKind}
        foeKind={game.displayStrayKind ?? regularEnemyKind}
        phase={battle.phase}
        enemyId={battle.enemyId}
        lastGoldReward={battle.lastGoldReward}
        stageAdvance={game.stageAnnouncement}
        onContinueStage={game.continueStage}
        battleSpeed={game.battleSpeed}
        stageLabel={game.bossEnraged ? `${stageLabel} · 분노한 보스` : boss ? `${stageLabel} · 보스` : game.displayMiniBoss ? `${stageLabel} · ${game.displayGolden ? "황금 " : ""}중간 보스` : stageLabel}
        stageKills={state.stageKills}
        questReady={hasClaimableQuest(state)}
        onQuest={() => game.setQuestOpen(true)}
        outfit={state.equippedOutfit}
        apprenticeActive={(state.loopsCompleted ?? 0) >= 1}
        apprenticeAttackId={battle.apprenticeAttackId}
        apprenticeAttackKind={battle.apprenticeAttackKind}
        apprenticeAttackHitMs={battle.apprenticeAttackHitMs}
        manualEnabled={!battle.isAutoBattle}
        onManualAttack={battle.manualAttack}
        onOpenMap={() => game.setState((previous) => ({ ...previous, selectedTab: "milestone" }))}
        onOpenKitchen={() => game.setState((previous) => ({ ...previous, selectedTab: "kitchen" }))}
        onOpenBag={() => game.setState((previous) => ({ ...previous, selectedTab: "inventory" }))}
        bagFull={slotsUsed(state.inventory) >= getBagCapacity(state.bagExpansions)}
        onCatchFlyingCoin={game.catchFlyingCoin}
        flyingGemsLeft={game.flyingGemAdsLeft}
        giftKills={state.giftKills ?? 0}
        heldLoot={game.heldLoot}
        skillBar={
          <SkillSlot
            skillId={state.equippedSkill ?? null}
            timers={battle.skillTimers}
            now={game.now}
            canCast={!game.bossIntroPending && (state.equippedSkill === "teleport" ? game.canTeleportToBoss(game.now) : battle.canCastSkill(game.now))}
            onCast={state.equippedSkill === "teleport" ? game.teleportToBoss : battle.castSkill}
            onOpenSkills={() => game.setState((previous) => ({ ...previous, selectedTab: "skills" }))}
          />
        }
        goldEvents={battle.goldEvents}
        executeId={battle.executeId}
        firstStrikeId={battle.firstStrikeId}
        executedKill={battle.lastKillExecuted}
        beamId={battle.castIds.beam}
        stealId={battle.castIds.steal}
        focusId={battle.castIds.focus}
        barrageId={battle.castIds.barrage}
        teleportId={battle.castIds.teleport}
        shoutId={battle.castIds.shout}
        carrotThrowId={battle.castIds.carrotThrow}
        chiliThrowId={battle.castIds.chiliThrow}
        meteorStrikeId={battle.meteorStrikeId}
        dropEvents={game.dropEvents}
        bossEntranceKey={bossEntranceKey}
        bossFirstMeet={!game.clearedStages.includes(state.stageNumber)}
        onBeginBoss={game.beginBossFight}
        levelUpAnnouncement={game.levelUpAnnouncement}
        now={game.now}
        bossTimerStartedAt={game.bossTimerStartedAt}
        bossTimeLimitMs={game.bossTimeLimitMs}
        bossFledKey={game.bossFledKey}
        bossSkillCastId={bossSkillCastId}
        bossSkillConfig={bossSkillConfig}
        bossReviveId={bossReviveId}
      />
      {unlockingSlot !== null && (() => {
        const next = state.buffSlotsUnlocked ?? 1;
        const price = BUFF_SLOT_PRICES[next];
        const outOfOrder = unlockingSlot > next;
        const affordable = state.gems >= price;
        return (
          <ConfirmModal
            title={`음식 슬롯 ${next + 1} 열기`}
            message={
              outOfOrder
                ? `슬롯은 차례대로 열려요. 먼저 슬롯 ${next + 1}을 보석 ${price}개로 열 수 있어요.`
                : affordable
                  ? `보석 ${price}개로 음식 슬롯을 하나 더 열까요? 음식 버프를 동시에 더 받을 수 있어요.`
                  : `보석이 ${price - state.gems}개 모자라요. 상점에서 보석을 모아 올까요?`
            }
            confirmLabel={affordable ? `보석 ${price}개로 열기` : "상점으로"}
            onConfirm={() => {
              if (affordable) game.unlockBuffSlot();
              else game.setState((previous) => ({ ...previous, selectedTab: "shop" }));
              setUnlockingSlot(null);
            }}
            onCancel={() => setUnlockingSlot(null)}
          />
        );
      })()}
      {pickingSlot !== null && (
        <DishPicker
          inventory={state.inventory}
          dishQuality={state.dishQuality}
          slots={game.buffSlots}
          now={game.now}
          outfit={state.equippedOutfit}
          onEat={(recipeId) => {
            game.eatDish(pickingSlot, recipeId);
            setPickingSlot(null);
          }}
          onClose={() => setPickingSlot(null)}
          guideRecipeId={state.tutorialDone && !state.recipeTutorialDone ? "green-jelly" : undefined}
          onGoCook={() => {
            setPickingSlot(null);
            game.setState((previous) => ({ ...previous, selectedTab: "kitchen" }));
          }}
        />
      )}
      {adModalOpen && (
        <RewardedAdModal
          message="대신 섭섭하지 않게 2배속 효과는 그대로 챙겨드릴게요."
          claimLabel="2배속 받기"
          onClaim={() => {
            game.watchAdForSpeedBoost();
            setAdModalOpen(false);
          }}
          onCancel={() => setAdModalOpen(false)}
        />
      )}
      {game.bossRetryAvailable && (
        <RewardedAdModal
          message={`광고를 보면 보스의 남은 체력 그대로 이어서 싸워요. 제한 시간은 절반(${Math.round((getBossTimeLimitMs(state.stageNumber, game.bossEnraged ? 2 : 1) * BOSS_RETRY_TIME_RATIO) / 1000)}초)이에요. 필드로 가면 보스는 도망가고 처음부터 다시 몹을 잡아야 해요.`}
          claimLabel="이어서 도전"
          onClaim={game.retryBossAfterAd}
          autoStart={false}
          secondary={{ label: "필드로 가기", onPress: game.leaveBossFight }}
        />
      )}
      <BattleActionsPanel
        isAutoBattle={battle.isAutoBattle}
        autoLocked={battle.autoLocked}
        speedBoostActive={game.speedMultiplier > 1}
        speedBoostRemainingMs={game.speedBoostRemainingMs}
        onWatchAd={() => setAdModalOpen(true)}
        left={
          <BuffSlots
            slots={game.buffSlots}
            now={game.now}
            outfit={state.equippedOutfit}
            unlocked={state.buffSlotsUnlocked ?? 1}
            onPressSlot={setPickingSlot}
            onPressLocked={setUnlockingSlot}
          />
        }
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

