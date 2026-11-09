import type { GameState, Outfit } from "../types";
import { OUTFIT_NAMES } from "./buffs";
import { initialState } from "./initialState";
import { getClearedBosses, getPeakStageNumber, getStageLabel, LAST_STAGE_NUMBER } from "./stages";
import { isOutfitUnlocked } from "./unlocks";

// 환생: having beaten the last boss, start the next 회차 from stage 1 against tougher enemies
// (REBIRTH_HP_MULTIPLIER in stages.ts), with a higher starting attack and gold bonus.
// Companions, recipes, gems, levels and the codexes stay; the stage, gold, stats and bag go.
//
// Balance, simulated over 8 runs: ×2 attack and +50% gold against ×4 HP makes each run a little
// longer than the last. Attack has to multiply because HP does. The ad's bonus is gems rather
// than anything that compounds: extra power per run made the players watching ads finish first.
export const REBIRTH_ATTACK_MULTIPLIER = 2;
export const REBIRTH_GOLD_BONUS = 50;
export const REBIRTH_AD_GEMS = 100;

export function canRebirth(state: GameState) {
  return getClearedBosses(state).includes(LAST_STAGE_NUMBER);
}

export function applyRebirth(previous: GameState, bonusGems: number): GameState {
  if (!canRebirth(previous)) return previous;
  const rebirths = (previous.rebirths ?? 0) + 1;
  const highest = previous.highestStageNumber ?? previous.stageNumber;
  // Companions unlock off the furthest stage, which restarts here: carry them over as owned.
  const companions = (Object.keys(OUTFIT_NAMES) as Outfit[]).filter(
    (outfit) => outfit !== "default" && isOutfitUnlocked(outfit, highest, previous.purchasedOutfits),
  );
  return {
    ...previous,
    rebirths,
    gems: previous.gems + bonusGems,
    purchasedOutfits: companions,
    peakStageNumber: getPeakStageNumber(previous),
    everClearedBosses: [...new Set([...(previous.everClearedBosses ?? []), ...getClearedBosses(previous)])],
    gold: 0,
    attack: initialState.attack * REBIRTH_ATTACK_MULTIPLIER ** rebirths,
    criticalDamage: initialState.criticalDamage,
    criticalChance: initialState.criticalChance,
    goldBonus: initialState.goldBonus + REBIRTH_GOLD_BONUS * rebirths,
    statLevels: initialState.statLevels,
    inventory: [],
    currentStage: getStageLabel(0),
    stageNumber: 0,
    stageKills: 0,
    stageMiniBosses: 0,
    stageKillsSaved: {},
    stageMiniBossesSaved: {},
    highestStageNumber: 0,
    mapSeenStage: 0,
    bossesCleared: [],
    pendingFirstClear: undefined,
    selectedTab: "battle",
  };
}
