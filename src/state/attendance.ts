import type { GameState } from "../types";

// Local calendar day (YYYY-MM-DD) — what "today" means for daily things like attendance and
// the winged-gem ad cap.
export function todayKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

// The 7-day attendance cycle, claimed once a day. Days don't have to be in a row: a missed
// day just waits, the cycle picks up where it left off. Gem days build up to a big 7th day;
// gold days pay a number of the current stage's regular mobs' worth, so they keep pace with
// how far the player has got.
export type AttendanceReward = { kind: "gems"; amount: number } | { kind: "gold"; mobs: number };
export const ATTENDANCE_REWARDS: AttendanceReward[] = [
  { kind: "gems", amount: 10 },
  { kind: "gold", mobs: 100 },
  { kind: "gems", amount: 20 },
  { kind: "gold", mobs: 200 },
  { kind: "gems", amount: 30 },
  { kind: "gold", mobs: 300 },
  { kind: "gems", amount: 100 },
];

// Which day of the cycle is next (0-based), and whether today's is still to claim.
export function getAttendance(state: Pick<GameState, "attendance">, today = todayKey()) {
  const claimed = state.attendance?.claimed ?? 0;
  return { dayIndex: claimed % ATTENDANCE_REWARDS.length, ready: state.attendance?.lastDay !== today };
}
