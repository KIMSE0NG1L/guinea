import type { GameState, StatKey, UpgradeMode } from "../types";

export const statInfo: Record<StatKey, { label: string; mark: string; step: number; baseCost: number }> = {
  attack: { label: "공격력", mark: "ATK", step: 3, baseCost: 120 },
  criticalDamage: { label: "치명타 피해", mark: "DMG", step: 10, baseCost: 100 },
  criticalChance: { label: "치명타 확률", mark: "CRIT", step: 2, baseCost: 140 },
  goldBonus: { label: "골드 획득", mark: "GOLD", step: 5, baseCost: 160 },
};

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
