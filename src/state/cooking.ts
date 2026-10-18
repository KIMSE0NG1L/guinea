import type { RecipeTier } from "./recipeTiers";

// `fast`: started under a cook-speed buff (the pot shows a ⚡).
export type CookingPot = { recipeId: string; startedAt: number; readyAt: number; fast?: boolean } | null;

const MINUTE = 60 * 1000;

// How long a dish simmers, by how hard its recipe is.
export const COOK_TIME_MS: Record<RecipeTier, number> = {
  common: 1 * MINUTE,
  rare: 5 * MINUTE,
  epic: 15 * MINUTE,
  legendary: 60 * MINUTE,
  hidden: 120 * MINUTE,
};

// The recipe tutorial's first dish — a full minute would stall the guided steps.
export const TUTORIAL_COOK_MS = 5000;

// One pot to start; more are bought with gems.
export const MAX_POTS = 3;

// 100 gems for the second pot, 250 for the third.
export function getPotUnlockCost(unlocked: number) {
  return unlocked <= 1 ? 100 : 250;
}

// Finishing a dish early: 1 gem per 2 minutes still to go, at least 1 — so a fresh
// 1-hour legendary is 30 gems, a 2-hour hidden one 60.
export function getRushCost(remainingMs: number) {
  return Math.max(1, Math.ceil(remainingMs / (2 * 60 * 1000)));
}

// A gem or gold price with a food-buff discount (percent) taken off — never below 1.
export function applyDiscount(price: number, percent: number) {
  return Math.max(1, Math.round(price * (1 - Math.min(90, percent) / 100)));
}

export function getPotsUnlocked(potsUnlocked: number | undefined) {
  return Math.max(1, Math.min(MAX_POTS, potsUnlocked ?? 1));
}

// Always MAX_POTS long (locked ones stay null), so pot indices are stable.
export function getCookingPots(pots: CookingPot[] | undefined): CookingPot[] {
  return Array.from({ length: MAX_POTS }, (_, index) => pots?.[index] ?? null);
}

// "4:59", "1:02:03"
export function formatRemaining(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const pad = (value: number) => String(value).padStart(2, "0");
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
}

// "1분", "1시간", "2시간"
export function formatCookTime(ms: number) {
  const minutes = Math.round(ms / MINUTE);
  return minutes >= 60 ? `${Math.round(minutes / 60)}시간` : `${minutes}분`;
}
