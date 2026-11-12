import type { RecipeTier } from "./recipeTiers";

// Once a pot finishes simmering (cooking.ts), the player times 3 stops of a sweeping
// indicator to finish the dish. This file is the pure math behind that — no GameState, no
// React — so it's trivial to reason about and reuse from the minigame component.

export type RoundResult = "perfect" | "good" | "miss";

// How hard each tier's minigame is: how long one one-way sweep takes (the indicator
// ping-pongs, so the full back-and-forth period is double this — the same 2s for every tier
// and every round), and how wide the target zone is as a share of the 0–1 track (40% down to
// 15%). Harder tiers only get a narrower window.
const SWEEP_MS = 2000;
export const MINIGAME_DIFFICULTY: Record<RecipeTier, { label: string; sweepMs: number; zoneWidth: number }> = {
  common: { label: "쉬움", sweepMs: SWEEP_MS, zoneWidth: 0.4 },
  rare: { label: "보통", sweepMs: SWEEP_MS, zoneWidth: 0.34 },
  epic: { label: "어려움", sweepMs: SWEEP_MS, zoneWidth: 0.27 },
  legendary: { label: "매우 어려움", sweepMs: SWEEP_MS, zoneWidth: 0.21 },
  hidden: { label: "극한", sweepMs: SWEEP_MS, zoneWidth: 0.15 },
};

// Within the zone, this inner share of its width counts as a dead-center "perfect" (drawn as
// the brighter band inside the zone); the rest of the zone is "good"; outside it is a "miss".
export const PERFECT_SHARE = 0.5;

export const MINIGAME_ROUNDS = 3;
// Auto-miss if the player never taps 멈춰! — so a round (and the modal) can't hang forever.
export const ROUND_TIMEOUT_MS = 6000;

// cookSpeed (see buffs.ts) widens the zone by its % — easier, not faster — capped so the
// hardest tier never trivializes into a free pass.
export function getZoneWidth(tier: RecipeTier, cookSpeedPercent: number): number {
  return Math.min(0.7, MINIGAME_DIFFICULTY[tier].zoneWidth * (1 + cookSpeedPercent / 100));
}

// The sweep pace is fixed (SWEEP_MS) for all three rounds — no per-round speed-up. Kept as a
// function so the component doesn't care; the last round still gets its drifting zone below.
export function getRoundSweepMs(baseSweepMs: number, _round: number): number {
  return baseSweepMs;
}

// Only the last round's zone drifts — a moving target instead of a static one, turning the
// final stop into the cook's climax. The margin is how far the center can wander either way;
// randomZoneCenter's own `margin` param keeps the base center far enough from each edge that
// drifting by this much never pushes the zone off the 0–1 track.
const DRIFT_ROUND = MINIGAME_ROUNDS - 1;
const DRIFT_PERIOD_MS = 2600;
export function isDriftingRound(round: number): boolean {
  return round === DRIFT_ROUND;
}
export function getDriftMargin(zoneWidth: number): number {
  return ((1 - zoneWidth) / 2) * 0.55;
}
// Where the zone's center actually sits at `elapsedMs`, oscillating ± `margin` around
// `baseCenter` on a sine wave. `margin` 0 (non-drifting rounds) collapses to `baseCenter`.
export function driftingZoneCenter(elapsedMs: number, baseCenter: number, margin: number): number {
  if (margin === 0) return baseCenter;
  return baseCenter + Math.sin((elapsedMs / DRIFT_PERIOD_MS) * Math.PI * 2) * margin;
}

// Where the sweeping indicator sits (0–1) at `elapsedMs` into a round: a linear ping-pong
// (triangle wave), one-way trip `sweepMs`. Gameplay-critical, so this is a pure function of
// wall-clock time rather than a Reanimated shared value — see CookingMinigame.tsx.
export function sweepPosition(elapsedMs: number, sweepMs: number): number {
  const period = sweepMs * 2;
  const t = elapsedMs % period;
  return t <= sweepMs ? t / sweepMs : 2 - t / sweepMs;
}

// A random zone center, never flush against either end of the track. `margin` (the drifting
// round's sine amplitude — see driftingZoneCenter) pulls the valid range in further still, so
// the drift itself never carries the zone off the track.
export function randomZoneCenter(zoneWidth: number, margin = 0): number {
  const half = zoneWidth / 2 + margin;
  if (half >= 0.5) return 0.5;
  return half + Math.random() * (1 - half * 2);
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
