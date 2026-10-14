import type { GameState, StatKey, UpgradeMode } from "../types";
import { BOSS_BASE_HP, MOB_BASE_HP } from "./stages";

export const statInfo: Record<StatKey, { label: string; mark: string; step: number; baseCost: number }> = {
  attack: { label: "공격력", mark: "ATK", step: 1.5, baseCost: 120 },
  criticalDamage: { label: "치명타 피해", mark: "DMG", step: 10, baseCost: 100 },
  criticalChance: { label: "치명타 확률", mark: "CRIT", step: 2, baseCost: 140 },
  goldBonus: { label: "골드 획득", mark: "GOLD", step: 5, baseCost: 160 },
};

// Extra payout for killing the boss, beyond its sheer HP being 10x a regular mob's — it's
// the stage's one-time milestone moment and should feel like a real payday.
const BOSS_GOLD_MULTIPLIER = 2.5;

// Reward scales with how tanky the current enemy actually is (enemyMaxHp vs. its un-scaled
// base HP), so later stages stay worth fighting instead of just taking longer per kill for
// the same payout — gold-per-minute would otherwise fall every stage you clear.
export function getGoldReward(attack: number, goldBonus: number, enemyMaxHp: number, boss: boolean) {
  const baseHp = boss ? BOSS_BASE_HP : MOB_BASE_HP;
  const stageMultiplier = enemyMaxHp / baseHp;
  const base = (18 + attack / 2) * (1 + goldBonus / 100) * stageMultiplier;
  return Math.round(boss ? base * BOSS_GOLD_MULTIPLIER : base);
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

export function getStatValue(state: GameState, key: StatKey) {
  if (key === "criticalChance") return state.criticalChance ?? 5;
  return state[key];
}
