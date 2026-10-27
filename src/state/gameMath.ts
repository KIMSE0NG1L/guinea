import type { GameState, StatKey, UpgradeMode } from "../types";
import { BOSS_BASE_HP, getEnemyMaxHp, MOB_BASE_HP } from "./stages";

// `step` is a flat add-per-level, used for every stat except attack (see
// ATTACK_UPGRADE_RATE below and applyUpgradeLevels) — kept here anyway so attack still
// has a value for getUpgradeQuote's STAT_CAP math, which never actually reads it since
// attack has no cap.
export const statInfo: Record<StatKey, { label: string; mark: string; step: number; baseCost: number }> = {
  attack: { label: "공격력", mark: "ATK", step: 1.5, baseCost: 120 },
  criticalDamage: { label: "치명타 피해", mark: "DMG", step: 2.5, baseCost: 100 },
  criticalChance: { label: "치명타 확률", mark: "CRIT", step: 1, baseCost: 140 },
  goldBonus: { label: "골드 획득", mark: "GOLD", step: 2.5, baseCost: 160 },
};

// Attack upgrades are multiplicative (% of current attack) instead of a flat add. A flat
// add next to upgrade cost's own exponential growth (see getUpgradeCost) means the gold
// cost per point of attack diverges to infinity as purchases pile up, while enemy HP
// (STAGE_HP_GROWTH in stages.ts) grows geometrically every stage regardless — so a flat
// step always loses that race eventually, no matter how generous the gold curve is,
// and runs headlong into a wall where no amount of grinding closes the gap.
// Making the gain geometric too fixes this structurally: simulating 100 stages of a
// maximally-efficient player (every gold coin spent on attack the instant it's earned)
// against the current HP/gold/cost curves found the required rate empirically — below
// ~10% the wall still hits by stage 100 (swings-needed-per-kill blows up past 1e9);
// by 12.5% it's already comfortable (under 5,000 swings for the single hardest kill
// across all 100 stages); 15% leaves real margin for a less-than-perfectly-optimal
// player (under 300).
// Was 0.10 (user's call on 2026-10-17); raised to 0.13 on 2026-10-19 after re-simulating
// the real 25-stage loop (every coin into attack, auto-battle, no food/crit/skills):
// 0.10 kept falling behind enemy HP — stage 25 needed ~3,600 swings per mob and ~37,000
// per boss (~153h to get there); 0.15 snowballed into 3-hit mobs by stage 25; 0.13 holds
// difficulty roughly flat from stage 10 on (~60 swings a mob, ~500 a boss, ~9h to 25).
export const ATTACK_UPGRADE_RATE = 0.13;

// How much a purchased stat levels up by: attack compounds (see ATTACK_UPGRADE_RATE
// above), every other stat still just adds its flat `step` — those are percentage-point
// stats already (crit chance, crit damage, gold bonus), so "percent of current value"
// wouldn't make sense for them the way it does for a raw number like attack.
export function applyUpgradeLevels(key: StatKey, currentValue: number, levels: number) {
  if (key === "attack") return currentValue * (1 + ATTACK_UPGRADE_RATE) ** levels;
  return currentValue + statInfo[key].step * levels;
}

// Extra payout for killing the boss, beyond its sheer HP being 10x a regular mob's — it's
// the stage's one-time milestone moment and should feel like a real payday.
const BOSS_GOLD_MULTIPLIER = 5;

// Reward scales with how tanky the current enemy actually is (enemyMaxHp vs. its un-scaled
// base HP), raised above 1 so payout compounds faster than enemy HP (and therefore kill
// time) does — gold-per-minute actually climbs every stage you clear, instead of merely
// holding flat, so pushing further is always worth it.
const STAGE_GOLD_CURVE = 1.5;

export function getGoldReward(attack: number, goldBonus: number, enemyMaxHp: number, boss: boolean) {
  const baseHp = boss ? BOSS_BASE_HP : MOB_BASE_HP;
  const stageMultiplier = (enemyMaxHp / baseHp) ** STAGE_GOLD_CURVE;
  const base = (18 + attack / 2) * (1 + goldBonus / 100) * stageMultiplier;
  return Math.round(boss ? base * BOSS_GOLD_MULTIPLIER : base);
}

// What one regular kill pays at this stage for a player keeping a normal pace (starting
// attack growing ~1.5x a stage, no gold bonus) — the yardstick the grocery and recipe shop
// price against, so their prices keep pace with gold income instead of going trivial a
// few stages in (kill gold grows ~2.4x a stage).
export function getReferenceMobGold(stageNumber: number) {
  return getGoldReward(6 * 1.5 ** stageNumber, 0, getEnemyMaxHp(stageNumber, false), false);
}

// Shop prices rounded to two significant figures (80, 540, 17,000, 1,400,000) so they
// read as set prices rather than formula output.
export function roundPrice(value: number) {
  if (value < 100) return Math.max(10, Math.round(value / 10) * 10);
  const unit = 10 ** (Math.floor(Math.log10(value)) - 1);
  return Math.round(value / unit) * unit;
}

// Boss kills are the stage's milestone moment, so they pay out notably more exp than a
// regular mob at the same stage — on top of already being worth 10x a mob's HP.
const BOSS_EXP_MULTIPLIER = 3;

// Exp reward grows 1:1 with how much tougher the current stage's enemies are (see
// STAGE_HP_GROWTH in stages.ts), so a kill further in always feels proportional to what
// it took to land it, instead of every mob paying the same flat amount forever.
const STAGE_EXP_CURVE = 1;

export function getExpReward(stageNumber: number, boss: boolean) {
  const baseHp = boss ? BOSS_BASE_HP : MOB_BASE_HP;
  const enemyMaxHp = getEnemyMaxHp(stageNumber, boss);
  const stageMultiplier = (enemyMaxHp / baseHp) ** STAGE_EXP_CURVE;
  const base = 8 * stageMultiplier;
  return Math.round(boss ? base * BOSS_EXP_MULTIPLIER : base);
}

// Mirrors useAutoBattle's steady-state swing cadence (idle delay 600ms + attack windup
// 260ms + 320ms post-hit recovery before the next swing is queued) — same constant
// offline.ts uses for its own kill-rate math (AVG_HIT_INTERVAL_MS), duplicated here since
// neither module exports it.
const BOSS_TIMER_HIT_INTERVAL_MS = 1180;
// Trims the no-food/skill clear time so it's not quite enough — the timer is meant to make
// skills and food buffs matter during a boss fight, not just pad out a fight plain auto-
// battle would already win on its own stats.
const BOSS_TIME_MARGIN = 0.8;

// Same expected-damage-per-swing math as offline.ts's own expectedDamage (duplicated for
// the same reason as BOSS_TIMER_HIT_INTERVAL_MS above) — a crit lands `chance` of the time
// for `criticalDamage`% instead of 100%, averaged into one per-swing number.
function getExpectedDamage(attack: number, criticalChance: number, criticalDamage: number) {
  const chance = Math.min(100, Math.max(0, criticalChance)) / 100;
  return attack * (1 + chance * (criticalDamage / 100 - 1));
}

// How long a boss fight's timer runs before the boss flees (see useGameState's
// bossTimerStartedAt) — snapshotted once from the player's plain attack/crit stats (no
// food/skill buffs) the moment the boss appears, so it reflects "how long auto-battle alone
// would take *this specific fight*" rather than a flat per-stage guess that could drift out
// of sync with ATTACK_UPGRADE_RATE/STAGE_HP_GROWTH if either is retuned later.
export function getBossTimeLimitMs(attack: number, criticalChance: number, criticalDamage: number, bossMaxHp: number) {
  const expectedDamage = getExpectedDamage(attack, criticalChance, criticalDamage);
  const swings = Math.max(1, Math.ceil(bossMaxHp / Math.max(1, expectedDamage)));
  return Math.round(swings * BOSS_TIMER_HIT_INTERVAL_MS * BOSS_TIME_MARGIN);
}

// A `base * rate^n`-style exponential, left alone below `safeN` steps but switched to a
// straight line past it (matching the exponential's own slope right at the switchover, so
// there's no visible kink) — otherwise, given enough steps, it eventually overflows to
// literal `Infinity` (found this the hard way: getExpToLevel did exactly that around level
// ~6263, since 1.12^6262 exceeds a float64's ~1.8e308 ceiling). That's not just a display
// glitch — `experience >= Infinity` can never be true again, so leveling (and therefore
// every level-gated unlock) halts forever once it happens. `safeN` is chosen with large
// margin below the real overflow point in each call site below, so this only ever matters
// for a level of play far beyond anything reachable in practice; it exists purely so the
// math literally cannot produce a hard wall, no matter how long someone idles.
function safeExponential(base: number, rate: number, n: number, safeN: number) {
  if (n <= safeN) return base * rate ** n;
  const atCap = base * rate ** safeN;
  const slopeAtCap = atCap * Math.log(rate);
  return atCap + slopeAtCap * (n - safeN);
}

// Each level needs more exp than the last, climbing at the same kind of pace as
// getUpgradeCost's cost growth, so leveling stays meaningful instead of flattening out.
const LEVEL_EXP_GROWTH = 1.12;
// 1.12^4999 ≈ 1e246 — nowhere near the ~1.8e308 float ceiling (level 5000 is itself far
// past anything reachable in practice; see gini_balance_economy memory), just a large
// safety margin so the exponential truly never has a chance to overflow.
const LEVEL_EXP_SAFE_LEVELS = 5000;

export function getExpToLevel(level: number) {
  return Math.round(safeExponential(100, LEVEL_EXP_GROWTH, level - 1, LEVEL_EXP_SAFE_LEVELS) / 10) * 10;
}

export function getNumberSuffix(index: number) {
  let suffix = "";
  let current = index;
  while (current >= 0) {
    suffix = String.fromCharCode(97 + (current % 26)) + suffix;
    current = Math.floor(current / 26) - 1;
  }
  return suffix;
}

// Up to six digits a number shows in full (with thousands commas). Past that, the last
// three digits drop off into a unit letter — repeated until six digits or fewer remain:
// 1,234,567 → 1,234a · 100,000,000 → 100,000a · 1,234,567,890 → 1,234b …
const MAX_SHOWN = 1_000_000;

export function formatGameNumber(value: number) {
  if (!Number.isFinite(value)) return "∞";
  const absolute = Math.abs(value);
  if (absolute < MAX_SHOWN) {
    return value.toLocaleString("ko-KR", { maximumFractionDigits: absolute < 1000 ? 3 : 0 });
  }

  let group = 0;
  let scaled = absolute;
  while (scaled >= MAX_SHOWN) {
    scaled /= 1000;
    group += 1;
  }
  const sign = value < 0 ? "-" : "";
  // Rounded down, so an abbreviated amount never reads as more than there really is.
  return `${sign}${Math.floor(scaled).toLocaleString("ko-KR")}${getNumberSuffix(group - 1)}`;
}

// 1.35^1499 ≈ 1e195 — same overflow guard as LEVEL_EXP_SAFE_LEVELS above, same reason:
// a purchase count this high is already astronomically beyond any realistic session, this
// is just insurance so cost can never hit Infinity (which would permanently block that
// stat from ever being upgraded again, same failure mode as the exp-to-level bug).
const UPGRADE_COST_SAFE_LEVELS = 1500;

export function getUpgradeCost(key: StatKey | "defense", level: number) {
  const resolvedKey: StatKey = key === "defense" ? "criticalChance" : key;
  const safeLevel = Number.isFinite(level) && level > 0 ? level : 1;
  return Math.round(safeExponential(statInfo[resolvedKey].baseCost, 1.35, safeLevel - 1, UPGRADE_COST_SAFE_LEVELS) / 10) * 10;
}

// Stats with a hard ceiling on their purchased value — upgrading can't push past this no
// matter how much gold is spent. Crit chance caps at 50% so a hit is never a coin flip.
// Crit damage caps at 400% (2.5x expected damage at max chance) so it stays a strong payoff
// without breaking the "no crit" assumption ATTACK_UPGRADE_RATE's own curve was tuned
// against, or compressing a fully-invested boss timer (getBossTimeLimitMs) toward 0.
export const STAT_CAP: Partial<Record<StatKey, number>> = {
  criticalChance: 50,
  criticalDamage: 400,
};

export function getUpgradeQuote(key: StatKey, level: number, gold: number, mode: UpgradeMode, value: number) {
  const cap = STAT_CAP[key];
  const capLevels = cap === undefined ? Number.POSITIVE_INFINITY : Math.max(0, Math.floor((cap - value) / statInfo[key].step + 1e-9));
  const requestedLevels = Math.min(
    capLevels,
    mode === "max"
      ? Number.POSITIVE_INFINITY
      : mode === "next"
        ? 10 - (level % 10)
        : mode,
  );
  let levels = 0;
  let cost = 0;

  while (levels < requestedLevels) {
    const nextCost = getUpgradeCost(key, level + levels);
    if (!Number.isFinite(nextCost) || !Number.isFinite(cost + nextCost)) {
      if (mode === "max") break;
      return { levels: requestedLevels, cost: Number.POSITIVE_INFINITY };
    }
    if (mode === "max" && cost + nextCost > gold) break;
    cost += nextCost;
    levels += 1;
  }

  return { levels, cost };
}

export function getNextUpgradeMode(mode: UpgradeMode): UpgradeMode {
  if (mode === 1) return 10;
  if (mode === 10) return 100;
  if (mode === 100) return "next";
  if (mode === "next") return "max";
  return 1;
}

export function getStatLevel(state: GameState, key: StatKey) {
  const legacyLevels = state.statLevels as (GameState["statLevels"] & { defense?: number }) | undefined;
  return state.statLevels?.[key]
    ?? (key === "criticalChance" ? legacyLevels?.defense : undefined)
    ?? 1;
}

// Each character level past 1 adds a flat +1 attack on top of the upgraded stat. Kept out of
// state.attack itself so stat upgrades keep stacking on the purchased value only.
export function getTotalAttack(state: GameState) {
  return state.attack + Math.max(0, state.level - 1);
}

export function getStatValue(state: GameState, key: StatKey) {
  if (key === "criticalChance") return state.criticalChance ?? 5;
  return state[key];
}
