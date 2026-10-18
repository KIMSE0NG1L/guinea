import type { GameState } from "../types";
import { getEnemyMaxHp, STAGE_KILL_TARGET } from "./stages";
import { getExpReward, getExpToLevel, getGoldReward, getTotalAttack } from "./gameMath";
import { DILIGENT_OFFLINE_BONUS } from "./skills";
import { getBuffTotals } from "./buffs";

export type OfflineSummary = {
  mobsKilled: number;
  goldEarned: number;
  expGained: number;
  levelsGained: number;
  timeAwayMs: number;
  // True when the offline grind filled the kill target — the boss is queued up and
  // waiting, but was deliberately not auto-fought (see simulateOfflineProgress).
  bossReady: boolean;
};

// Mirrors useAutoBattle's steady-state cadence: a non-killing hit lands roughly every
// (idle delay 600ms + attack windup 260ms); killing one also pays its respawn + entering
// delay before the next hit can land.
const AVG_HIT_INTERVAL_MS = 860;
const MOB_RESPAWN_MS = 650 + 220;

// Caps how much time away actually counts, and ignores trivial app switches.
const MAX_OFFLINE_MS = 8 * 60 * 60 * 1000;
const MIN_OFFLINE_MS = 30 * 1000;

function expectedDamage(attack: number, criticalChance: number, criticalDamage: number) {
  const chance = Math.min(100, Math.max(0, criticalChance)) / 100;
  return attack * (1 + chance * (criticalDamage / 100 - 1));
}

// Fast-forwards regular-mob kills only, using expected (non-random) damage per hit, for
// the whole elapsed time away. Food buffs running when the app closed: an offlineGold one
// raises all of it; with an offlineBuffs one, every food buff also keeps working (attack,
// crits, gold, exp) until it runs out, so the time away is split at each expiry.
// Deliberately never auto-fights the boss or advances
// stageNumber — that would skip past a new stage's mob and boss art without the player
// ever seeing it — so stageKills just keeps climbing past the kill target instead of
// stopping there; the boss stays queued up for them to fight in person when they return.
export function simulateOfflineProgress(
  state: GameState,
  elapsedMsRaw: number
): { state: GameState; summary: OfflineSummary } | null {
  const elapsedMs = Math.min(elapsedMsRaw, MAX_OFFLINE_MS);
  if (elapsedMs < MIN_OFFLINE_MS) return null;
  const leftAt = Date.now() - elapsedMsRaw;
  const atLeave = getBuffTotals(state.buffSlots, leftAt, state.equippedOutfit);
  const goldMultiplier = (state.equippedSkill === "diligent" ? 1 + DILIGENT_OFFLINE_BONUS : 1) * (1 + atLeave.offlineGold / 100);
  const keepBuffs = atLeave.offlineBuffs > 0;

  // Where the stretch away is cut: each running buff's expiry (only when buffs carry over).
  const cuts = keepBuffs
    ? (state.buffSlots ?? [])
        .map((slot) => (slot ? slot.expiresAt - leftAt : 0))
        .filter((offset) => offset > 0 && offset < elapsedMs)
        .sort((a, b) => a - b)
    : [];
  const segments = [0, ...cuts, elapsedMs].slice(1).map((end, index, ends) => ({ start: index === 0 ? 0 : ends[index - 1], end }));

  let remainingMs = 0;
  let stageKills = state.stageKills;
  let kills = state.kills;
  let gold = state.gold;
  let totalGoldEarned = state.totalGoldEarned;
  let experience = state.experience;
  let level = state.level;
  let mobsKilled = 0;
  let expGained = 0;

  const enemyMaxHp = getEnemyMaxHp(state.stageNumber, false);

  for (const segment of segments) {
    // Leftover time from the last segment carries into this one.
    remainingMs += segment.end - segment.start;
    const food = keepBuffs ? getBuffTotals(state.buffSlots, leftAt + segment.start, state.equippedOutfit) : undefined;
    const attack = getTotalAttack(state) * (1 + (food?.attack ?? 0) / 100);
    const dmg = expectedDamage(
      attack,
      (state.criticalChance ?? 5) + (food?.criticalChance ?? 0),
      state.criticalDamage + (food?.criticalDamage ?? 0),
    );
    if (dmg <= 0) continue;
    const mobExpReward = Math.round(getExpReward(state.stageNumber, false) * (1 + (food?.exp ?? 0) / 100));
    const hits = Math.max(1, Math.ceil(enemyMaxHp / dmg));
    const msPerMob = hits * AVG_HIT_INTERVAL_MS + MOB_RESPAWN_MS;

    while (remainingMs >= msPerMob) {
      remainingMs -= msPerMob;

      const goldReward = Math.round(getGoldReward(attack, state.goldBonus + (food?.gold ?? 0), enemyMaxHp, false) * goldMultiplier);
      gold += goldReward;
      totalGoldEarned += goldReward;
      kills += 1;
      experience += mobExpReward;
      expGained += mobExpReward;
      while (experience >= getExpToLevel(level)) {
        experience -= getExpToLevel(level);
        level += 1;
      }
      mobsKilled += 1;
      stageKills += 1;
    }
  }

  if (mobsKilled === 0) return null;

  const levelsGained = level - state.level;

  const newState: GameState = {
    ...state,
    gold,
    totalGoldEarned,
    kills,
    experience,
    level,
    stageKills,
    quests: state.quests.map((quest) => {
      if (quest.id === "kills") return { ...quest, current: kills };
      if (quest.id === "gold") return { ...quest, current: totalGoldEarned };
      return quest;
    }),
  };

  return {
    state: newState,
    summary: {
      mobsKilled,
      goldEarned: totalGoldEarned - state.totalGoldEarned,
      expGained,
      levelsGained,
      timeAwayMs: elapsedMs - remainingMs,
      bossReady: stageKills >= STAGE_KILL_TARGET,
    },
  };
}
