import type { GameState } from "../types";
import { getEnemyMaxHp, STAGE_KILL_TARGET } from "./stages";
import { getGoldReward } from "./gameMath";

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
// the whole elapsed time away. Deliberately never auto-fights the boss or advances
// stageNumber — that would skip past a new stage's mob and boss art without the player
// ever seeing it — so stageKills just keeps climbing past the kill target instead of
// stopping there; the boss stays queued up for them to fight in person when they return.
export function simulateOfflineProgress(
  state: GameState,
  elapsedMsRaw: number
): { state: GameState; summary: OfflineSummary } | null {
  const elapsedMs = Math.min(elapsedMsRaw, MAX_OFFLINE_MS);
  if (elapsedMs < MIN_OFFLINE_MS) return null;

  const dmg = expectedDamage(state.attack, state.criticalChance ?? 5, state.criticalDamage);
  if (dmg <= 0) return null;

  let remainingMs = elapsedMs;
  let stageKills = state.stageKills;
  let kills = state.kills;
  let gold = state.gold;
  let totalGoldEarned = state.totalGoldEarned;
  let experience = state.experience;
  let level = state.level;
  let mobsKilled = 0;

  const enemyMaxHp = getEnemyMaxHp(state.stageNumber, false);
  const hits = Math.max(1, Math.ceil(enemyMaxHp / dmg));
  const msPerMob = hits * AVG_HIT_INTERVAL_MS + MOB_RESPAWN_MS;

  while (remainingMs >= msPerMob) {
    remainingMs -= msPerMob;

    const goldReward = getGoldReward(state.attack, state.goldBonus, enemyMaxHp, false);
    gold += goldReward;
    totalGoldEarned += goldReward;
    kills += 1;
    experience += 8;
    if (experience >= 100) {
      level += 1;
      experience -= 100;
    }
    mobsKilled += 1;
    stageKills += 1;
  }

  if (mobsKilled === 0) return null;

  const levelsGained = level - state.level;
  const expGained = levelsGained * 100 + (experience - state.experience);

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
