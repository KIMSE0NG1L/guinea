import type { GameState } from "../types";
import { getEnemyKind, getEnemyMaxHp, getEnemyRewardHp, STAGE_KILL_TARGET } from "./stages";
import { getExpReward, getExpToLevel, getGoldReward, getTotalAttack } from "./gameMath";
import { DILIGENT_OFFLINE_BONUS } from "./skills";
import { getBuffTotals, OUTFIT_BUFFS, OUTFIT_FIRST_STRIKE, OUTFIT_NO_OFFLINE } from "./buffs";
import { getDropTable } from "./drops";
import { fitItems, getBagCapacity } from "./bag";

export type OfflineSummary = {
  mobsKilled: number;
  goldEarned: number;
  expGained: number;
  levelsGained: number;
  timeAwayMs: number;
  // Level before and after, for the "Lv.12 → Lv.15" line.
  levelFrom: number;
  levelTo: number;
  // Ingredients picked up while away (already in the bag), and whether some didn't fit.
  items: { name: string; quantity: number }[];
  bagFull: boolean;
  // True when the offline grind filled the kill target — the boss is queued up and
  // waiting, but was deliberately not auto-fought (see simulateOfflineProgress).
  bossReady: boolean;
};

// Mirrors useAutoBattle's steady-state cadence: a non-killing hit lands roughly every
// (idle delay 600ms + attack windup 260ms + 320ms post-hit recovery before the next swing
// is queued) = 1180ms; killing one also pays its respawn + entering delay before the next
// hit can land. Was 860 (missing that 320ms recovery leg) until re-traced against
// useAutoBattle's actual queueAttack chain and corrected.
const AVG_HIT_INTERVAL_MS = 1180;
const MOB_RESPAWN_MS = 650 + 220;

// Offline grinding pays less than actually playing — otherwise leaving the app open would
// be strictly better than fighting in person. User's call: 1/8 of the online rate, applied
// to both gold and exp equally.
const OFFLINE_REWARD_RATE = 1 / 8;

// Caps how much time away actually counts, and ignores trivial app switches.
export const MAX_OFFLINE_MS = 8 * 60 * 60 * 1000;
const MIN_OFFLINE_MS = 30 * 1000;

function expectedDamage(attack: number, criticalChance: number, criticalDamage: number) {
  const chance = Math.min(100, Math.max(0, criticalChance)) / 100;
  return attack * (1 + chance * (criticalDamage / 100 - 1));
}

// Fast-forwards regular-mob kills only, using expected (non-random) damage per hit, for
// the whole elapsed time away. Food buffs running when the app closed: an offlineGold one
// raises all of it; with an offlineBuffs one, every food buff also keeps working (attack,
// crits, gold, exp) until it runs out, so the time away is split at each expiry.
// Deliberately never auto-fights the boss, advances stageNumber, or moves stageKills —
// those all stay exactly as the player left them, so offline time only pays out gold/exp
// (at OFFLINE_REWARD_RATE) and never silently finishes a stage's mob quota or queues up
// the boss while they're away.
export function simulateOfflineProgress(
  state: GameState,
  elapsedMsRaw: number
): { state: GameState; summary: OfflineSummary } | null {
  if (OUTFIT_NO_OFFLINE[state.equippedOutfit]) return null;
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
  let kills = state.kills;
  let gold = state.gold;
  let totalGoldEarned = state.totalGoldEarned;
  let experience = state.experience;
  let level = state.level;
  let mobsKilled = 0;
  let expGained = 0;

  const enemyMaxHp = getEnemyMaxHp(state.stageNumber, false, state.rebirths ?? 0);

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
    const mobExpReward = Math.round(getExpReward(state.stageNumber, false) * (1 + (food?.exp ?? 0) / 100) * OFFLINE_REWARD_RATE);
    // 사무라이기니's opening draw (attack × N, no crit) may finish a mob outright.
    const firstStrike = OUTFIT_FIRST_STRIKE[state.equippedOutfit] ?? 0;
    const opening = attack * firstStrike;
    const hits = opening >= enemyMaxHp ? 1 : (opening > 0 ? 1 : 0) + Math.max(1, Math.ceil((enemyMaxHp - opening) / dmg));
    const pace = 1 + (OUTFIT_BUFFS[state.equippedOutfit]?.attackSpeed ?? 0) / 100;
    const msPerMob = (hits * AVG_HIT_INTERVAL_MS) / pace + MOB_RESPAWN_MS;

    while (remainingMs >= msPerMob) {
      remainingMs -= msPerMob;

      const goldReward = Math.round(getGoldReward(attack, state.goldBonus + (food?.gold ?? 0), getEnemyRewardHp(state.stageNumber, false), false) * goldMultiplier * OFFLINE_REWARD_RATE);
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
    }
  }

  if (mobsKilled === 0) return null;

  const levelsGained = level - state.level;

  // Ingredients: each of the mob's drops, at its own chance per kill and the same offline
  // rate as gold, rounded at random so small piles still turn up now and then. Whatever the
  // bag has no room for is left behind, as it would be in a live fight.
  const rolled = getDropTable(getEnemyKind(state.stageNumber), false)
    .map((entry) => {
      const expected = mobsKilled * entry.chance * OFFLINE_REWARD_RATE * (entry.quantity ?? 1);
      return { name: entry.name, quantity: Math.floor(expected) + (Math.random() < expected % 1 ? 1 : 0) };
    })
    .filter((item) => item.quantity > 0);
  const fitted = fitItems(state.inventory, rolled, getBagCapacity(state.bagExpansions));
  const items = fitted.kept.map(({ name, quantity }) => ({ name, quantity }));
  const inventory = items.reduce((bag, item) => {
    const owned = bag.find((entry) => entry.name === item.name);
    return owned
      ? bag.map((entry) => (entry === owned ? { ...entry, quantity: entry.quantity + item.quantity } : entry))
      : [...bag, { name: item.name, quantity: item.quantity, type: "food" as const }];
  }, state.inventory);
  const known = state.discoveredItems ?? [];
  const discoveredItems = [...known, ...items.map((item) => item.name).filter((name) => !known.includes(name))];

  const newState: GameState = {
    ...state,
    gold,
    totalGoldEarned,
    kills,
    experience,
    level,
    inventory,
    discoveredItems,
  };

  return {
    state: newState,
    summary: {
      mobsKilled,
      goldEarned: totalGoldEarned - state.totalGoldEarned,
      expGained,
      levelsGained,
      timeAwayMs: elapsedMs - remainingMs,
      levelFrom: state.level,
      levelTo: level,
      items,
      bagFull: fitted.overflow.length > 0,
      bossReady: state.stageKills >= STAGE_KILL_TARGET,
    },
  };
}
