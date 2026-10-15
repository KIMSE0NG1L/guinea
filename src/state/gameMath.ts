import type { GameState, StatKey, UpgradeMode } from "../types";
import { BOSS_BASE_HP, getEnemyMaxHp, MOB_BASE_HP } from "./stages";

export const statInfo: Record<StatKey, { label: string; mark: string; step: number; baseCost: number }> = {
  attack: { label: "공격력", mark: "ATK", step: 1.5, baseCost: 120 },
  criticalDamage: { label: "치명타 피해", mark: "DMG", step: 2.5, baseCost: 100 },
  criticalChance: { label: "치명타 확률", mark: "CRIT", step: 1, baseCost: 140 },
  goldBonus: { label: "골드 획득", mark: "GOLD", step: 2.5, baseCost: 160 },
};

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

// Each level needs more exp than the last, climbing at the same kind of pace as
// getUpgradeCost's cost growth, so leveling stays meaningful instead of flattening out.
const LEVEL_EXP_GROWTH = 1.12;

export function getExpToLevel(level: number) {
  return Math.round((100 * LEVEL_EXP_GROWTH ** (level - 1)) / 10) * 10;
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

export function formatGameNumber(value: number) {
  if (!Number.isFinite(value)) return "∞";
  const absolute = Math.abs(value);
  if (absolute < 1000) {
    return value.toLocaleString("ko-KR", { maximumFractionDigits: 3 });
  }

  const group = Math.floor(Math.log(absolute) / Math.log(1000));
  const scaled = absolute / Math.pow(1000, group);
  const sign = value < 0 ? "-" : "";
  return `${sign}${scaled.toFixed(3).replace(".", ",")}${getNumberSuffix(group - 1)}`;
}

export function getUpgradeCost(key: StatKey | "defense", level: number) {
  const resolvedKey: StatKey = key === "defense" ? "criticalChance" : key;
  const safeLevel = Number.isFinite(level) && level > 0 ? level : 1;
  return Math.round((statInfo[resolvedKey].baseCost * Math.pow(1.35, safeLevel - 1)) / 10) * 10;
}

export function getUpgradeQuote(key: StatKey, level: number, gold: number, mode: UpgradeMode) {
  const requestedLevels =
    mode === "max"
      ? Number.POSITIVE_INFINITY
      : mode === "next"
        ? 10 - (level % 10)
        : mode;
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
