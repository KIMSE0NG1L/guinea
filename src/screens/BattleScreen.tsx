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
import { getBagCapacity, slotsUsed } from "../state/bag";
import { playSfx } from "../sound";
import { ConfirmModal } from "../components/ConfirmModal";
import { BUFF_SLOT_PRICES } from "../state/buffs";
import type { EnemyKind } from "../types";
import { getCookingPots } from "../state/cooking";
import { hasClaimableQuest } from "../state/quests";
import { RECIPES } from "../state/recipes";

export function BattleScreen({ game }: { game: UseGameState }) {
  const { state, battle, upgradeMode, setUpgradeMode, upgradeStat, upgraded, enemyMaxHp, boss, displayBoss, isBossDefeatFlash, defeatedStageNumber } = game;
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
  // The first finished dish waiting in a pot, shown floating over the kitchen button.
  const readyPot = getCookingPots(state.cookingPots).find((pot) => pot && pot.readyAt <= game.now);
  const readyDish = readyPot ? RECIPES.find((recipe) => recipe.id === readyPot.recipeId) : undefined;
  // A locked food slot that was tapped: confirm the gem price (slots open in order).
  const [unlockingSlot, setUnlockingSlot] = useState<number | null>(null);
  const [adModalOpen, setAdModalOpen] = useState(false);

  // Fires once right as the boss sprite actually appears (displayBoss flips false→true),
  // not at the 25th-kill moment — that's still mid mob-death-clip, see displayBoss.
  const [bossEntranceKey, setBossEntranceKey] = useState<string | null>(null);
  const wasDisplayBoss = useRef(displayBoss);
  useEffect(() => {
    if (displayBoss && !wasDisplayBoss.current) {
      const key = `${regularEnemyKind}-${battle.enemyId}`;
      setBossEntranceKey(key);
      playSfx("bossEnter");
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
        questReady={hasClaimableQuest(state)}
        onQuest={() => game.setQuestOpen(true)}
        outfit={state.equippedOutfit}
        manualEnabled={!battle.isAutoBattle}
        onManualAttack={battle.manualAttack}
        onOpenMap={() => game.setState((previous) => ({ ...previous, selectedTab: "milestone" }))}
        onOpenKitchen={() => game.setState((previous) => ({ ...previous, selectedTab: "kitchen" }))}
        kitchenReadyDish={readyDish?.image ?? null}
        onOpenBag={() => game.setState((previous) => ({ ...previous, selectedTab: "inventory" }))}
        bagFull={slotsUsed(state.inventory) >= getBagCapacity(state.bagExpansions)}
        onCatchFlyingCoin={game.catchFlyingCoin}
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
        firstStrikeId={battle.firstStrikeId}
        executedKill={battle.lastKillExecuted}
        beamId={battle.castIds.beam}
        stealId={battle.castIds.steal}
        focusId={battle.castIds.focus}
        shoutId={battle.castIds.shout}
        dropEvents={game.dropEvents}
        bossEntranceKey={bossEntranceKey}
        levelUpAnnouncement={game.levelUpAnnouncement}
        levelUpAttackGain={game.levelUpAttackGain}
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

