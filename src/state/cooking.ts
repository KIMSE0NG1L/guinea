// The kitchen's pots. A dish goes in and finishes at once; tapping the pot opens the 3-stop
// timing minigame (cookingMinigame.ts), and that result decides what comes out.
export type CookingPot = { recipeId: string; startedAt: number; readyAt: number; fast?: boolean } | null;

// One pot to start; more are bought with gems.
export const MAX_POTS = 3;

// 100 gems for the second pot, 250 for the third.
export function getPotUnlockCost(unlocked: number) {
  return unlocked <= 1 ? 100 : 250;
}

export function getPotsUnlocked(potsUnlocked: number | undefined) {
  return Math.max(1, Math.min(MAX_POTS, potsUnlocked ?? 1));
}

// Always MAX_POTS long (locked ones stay null), so pot indices are stable.
export function getCookingPots(pots: CookingPot[] | undefined): CookingPot[] {
  return Array.from({ length: MAX_POTS }, (_, index) => pots?.[index] ?? null);
}
