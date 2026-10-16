import type { Outfit } from "../types";

// Food buffs: eating a cooked dish into a battle slot grants its effect for a while.
// Higher-tier dishes (harder-to-get ingredients) last longer — from 1 to 10 minutes.

export type BuffEffect = {
  attack?: number; // % more attack
  criticalChance?: number; // percentage points
  criticalDamage?: number; // percentage points
  gold?: number; // percentage points of gold bonus
};

export type BuffSlot = { recipeId: string; expiresAt: number; durationMs: number } | null;

export const BUFF_SLOT_COUNT = 3;

const MINUTE = 60_000;

export const BUFFS: Record<string, { effect: BuffEffect; durationMs: number; tint: string }> = {
  "green-jelly": { effect: { attack: 10 }, durationMs: 1 * MINUTE, tint: "#bfe08a" },
  "slime-potion": { effect: { attack: 15 }, durationMs: 2 * MINUTE, tint: "#c9e39a" },
  "royal-jelly": { effect: { attack: 15, criticalChance: 3 }, durationMs: 2 * MINUTE, tint: "#fbd56e" },
  "carrot-soup": { effect: { criticalDamage: 30 }, durationMs: 2 * MINUTE, tint: "#9ebdba" },
  "fried-egg": { effect: { criticalChance: 5 }, durationMs: 2 * MINUTE, tint: "#dfc1a6" },
  "chopped-salad": { effect: { gold: 20 }, durationMs: 2 * MINUTE, tint: "#e0ab7b" },
  "veggie-stew": { effect: { attack: 20 }, durationMs: 3 * MINUTE, tint: "#f8a37e" },
  "banana-milk": { effect: { criticalChance: 10 }, durationMs: 7 * MINUTE, tint: "#fce6a0" },
  "potato-pancake": { effect: { gold: 60 }, durationMs: 6 * MINUTE, tint: "#fdd785" },
  pudding: { effect: { criticalDamage: 50 }, durationMs: 4 * MINUTE, tint: "#efcf9d" },
  "mushroom-soup": { effect: { attack: 30 }, durationMs: 4 * MINUTE, tint: "#efc598" },
  "pumpkin-roast": { effect: { gold: 50 }, durationMs: 5 * MINUTE, tint: "#f8b37c" },
  "salmon-steak": { effect: { criticalDamage: 70 }, durationMs: 6 * MINUTE, tint: "#fbb989" },
  steak: { effect: { attack: 40 }, durationMs: 7 * MINUTE, tint: "#d69f7c" },
  "mussel-seaweed-soup": { effect: { gold: 45 }, durationMs: 6 * MINUTE, tint: "#c9d69a" },
  "shrimp-sashimi": { effect: { gold: 55 }, durationMs: 6 * MINUTE, tint: "#f8c1a8" },
  yukhoe: { effect: { attack: 35 }, durationMs: 6 * MINUTE, tint: "#e79a8c" },
  octopus: { effect: { criticalChance: 8 }, durationMs: 6 * MINUTE, tint: "#f2c4c8" },
  "tuna-sashimi": { effect: { attack: 30, criticalChance: 5 }, durationMs: 7 * MINUTE, tint: "#e98f8f" },
  "salmon-sashimi": { effect: { criticalDamage: 80 }, durationMs: 7 * MINUTE, tint: "#f9b48a" },
  "seafood-boil": { effect: { attack: 30, criticalDamage: 60, gold: 40 }, durationMs: 9 * MINUTE, tint: "#faa880" },
  "guinea-feast": { effect: { attack: 50, criticalChance: 10, gold: 50 }, durationMs: 10 * MINUTE, tint: "#dab8a2" },
};

// Companion outfits: equipping one swaps the battle sprite and grants a small permanent
// bonus — smaller than a food buff since it never runs out, unlike those timed dishes.
export const OUTFIT_BUFFS: Partial<Record<Outfit, BuffEffect>> = {
  explorerHamster: { gold: 10 },
  // Huge attack, but every hit risks whiffing entirely — see OUTFIT_MISS_CHANCE.
  tetoGini: { attack: 100 },
  // Weaker per hit, but strikes twice per swing — see OUTFIT_HIT_COUNT.
  assassinGini: { attack: -30 },
};

// Percent chance an attack whiffs completely (0 damage, no kill, no on-hit effects) while
// this outfit is equipped — the tradeoff that balances tetoGini's oversized attack buff.
export const OUTFIT_MISS_CHANCE: Partial<Record<Outfit, number>> = {
  tetoGini: 40,
};

// Extra strikes landed per swing (default 1) — assassinGini's twin daggers hit twice,
// each rolling its own crit independently, offsetting its attack penalty.
export const OUTFIT_HIT_COUNT: Partial<Record<Outfit, number>> = {
  assassinGini: 2,
};

// Extra seconds added to every food buff's duration the moment it's eaten, while this
// outfit is equipped — 모험기니 doesn't fight any better, it just makes meals last longer.
export const OUTFIT_FOOD_DURATION_BONUS_SEC: Partial<Record<Outfit, number>> = {
  default: 15,
};

// Seconds shaved off every active skill's cooldown while this outfit is equipped.
export const OUTFIT_COOLDOWN_REDUCTION_SEC: Partial<Record<Outfit, number>> = {
  egenGini: 60,
};

const EFFECT_LABELS: Record<keyof BuffEffect, (value: number) => string> = {
  attack: (value) => `공격력 ${value >= 0 ? "+" : ""}${value}%`,
  criticalChance: (value) => `치명타 확률 +${value}%`,
  criticalDamage: (value) => `치명타 피해 +${value}%`,
  gold: (value) => `골드 획득 +${value}%`,
};

export function describeEffect(effect: BuffEffect) {
  return (Object.keys(effect) as (keyof BuffEffect)[])
    .map((key) => EFFECT_LABELS[key](effect[key] ?? 0))
    .join(" · ");
}

export function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

// Sum of every slot that's still running at `now`.
export function getBuffTotals(slots: BuffSlot[] | undefined, now: number): Required<BuffEffect> {
  const totals = { attack: 0, criticalChance: 0, criticalDamage: 0, gold: 0 };
  for (const slot of slots ?? []) {
    if (!slot || slot.expiresAt <= now) continue;
    const effect = BUFFS[slot.recipeId]?.effect ?? {};
    totals.attack += effect.attack ?? 0;
    totals.criticalChance += effect.criticalChance ?? 0;
    totals.criticalDamage += effect.criticalDamage ?? 0;
    totals.gold += effect.gold ?? 0;
  }
  return totals;
}

export function emptyBuffSlots(): BuffSlot[] {
  return Array.from({ length: BUFF_SLOT_COUNT }, () => null);
}
