import type { RecipeTier } from "./recipeTiers";

// Cooking resolves instantly now: the player times 3 stops of a sweeping indicator instead
// of waiting out a real-time pot. This file is the pure math behind that — no GameState, no
// React — so it's trivial to reason about and reuse from the minigame component.

export type RoundResult = "perfect" | "good" | "miss";

// How hard each tier's minigame is: how long one one-way sweep takes (the indicator
// ping-pongs, so the full back-and-forth period is double this), and how wide the target
// zone is as a share of the 0–1 track. Harder tiers sweep faster and give a narrower window.
export const MINIGAME_DIFFICULTY: Record<RecipeTier, { label: string; sweepMs: number; zoneWidth: number }> = {
  common: { label: "쉬움", sweepMs: 1400, zoneWidth: 0.34 },
  rare: { label: "보통", sweepMs: 1150, zoneWidth: 0.28 },
  epic: { label: "어려움", sweepMs: 950, zoneWidth: 0.22 },
  legendary: { label: "매우 어려움", sweepMs: 780, zoneWidth: 0.17 },
  hidden: { label: "극한", sweepMs: 650, zoneWidth: 0.13 },
};

// Within the zone, this inner share of its half-width counts as a dead-center "perfect";
// the rest of the zone is "good"; outside it entirely is a "miss".
const PERFECT_SHARE = 0.35;

export const MINIGAME_ROUNDS = 3;
// Auto-miss if the player never taps 멈춰! — so a round (and the modal) can't hang forever.
export const ROUND_TIMEOUT_MS = 6000;

// cookSpeed (see buffs.ts) widens the zone by its % — easier, not faster — capped so the
// hardest tier never trivializes into a free pass.
export function getZoneWidth(tier: RecipeTier, cookSpeedPercent: number): number {
  return Math.min(0.7, MINIGAME_DIFFICULTY[tier].zoneWidth * (1 + cookSpeedPercent / 100));
}

// Where the sweeping indicator sits (0–1) at `elapsedMs` into a round: a linear ping-pong
// (triangle wave), one-way trip `sweepMs`. Gameplay-critical, so this is a pure function of
// wall-clock time rather than a Reanimated shared value — see CookingMinigame.tsx.
export function sweepPosition(elapsedMs: number, sweepMs: number): number {
  const period = sweepMs * 2;
  const t = elapsedMs % period;
  return t <= sweepMs ? t / sweepMs : 2 - t / sweepMs;
}

// A random zone center, never flush against either end of the track.
export function randomZoneCenter(zoneWidth: number): number {
  const half = zoneWidth / 2;
  return half + Math.random() * (1 - zoneWidth);
}

// Classifies one stop: `stop` and `zoneCenter` are both 0–1 track positions.
export function classifyStop(stop: number, zoneCenter: number, zoneWidth: number): RoundResult {
  const half = zoneWidth / 2;
  const distance = Math.abs(stop - zoneCenter);
  if (distance <= half * PERFECT_SHARE) return "perfect";
  if (distance <= half) return "good";
  return "miss";
}

// Two perfects with no misses is a 대성공; two or more misses is a 망함 regardless of the
// third; everything else (the broad middle) is 보통. A count-based rule rather than summed
// points, so a single perfect can never "rescue" two misses into a non-fail grade.
export function gradeFromRounds(rounds: RoundResult[]): "great" | "good" | "fail" {
  const perfects = rounds.filter((round) => round === "perfect").length;
  const misses = rounds.filter((round) => round === "miss").length;
  if (perfects >= 2 && misses === 0) return "great";
  if (misses >= 2) return "fail";
  return "good";
}
