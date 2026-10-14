import type { EnemyKind } from "../types";

type DropEntry = { name: string; chance: number; quantity?: number };

// What each monster can drop on defeat — each entry is rolled independently.
// Bosses roll their own richer table instead of the mob one.
const DROPS: Record<EnemyKind, { mob: DropEntry[]; boss: DropEntry[] }> = {
  slime: {
    mob: [
      { name: "양배추", chance: 0.25 },
      { name: "옥수수", chance: 0.1 },
    ],
    boss: [
      { name: "양배추", chance: 1, quantity: 3 },
      { name: "옥수수", chance: 0.5, quantity: 2 },
    ],
  },
  mushroom: {
    mob: [{ name: "버섯", chance: 0.35 }],
    boss: [
      { name: "버섯", chance: 1, quantity: 3 },
      { name: "호박", chance: 0.3 },
    ],
  },
  carrot: {
    mob: [
      { name: "당근", chance: 0.4 },
      { name: "토마토", chance: 0.15 },
    ],
    boss: [
      { name: "당근", chance: 1, quantity: 4 },
      { name: "토마토", chance: 0.6, quantity: 2 },
      { name: "호박", chance: 0.3 },
    ],
  },
  chicken: {
    mob: [
      { name: "계란", chance: 0.35 },
      { name: "옥수수", chance: 0.15 },
    ],
    boss: [
      { name: "계란", chance: 1, quantity: 3 },
      { name: "우유", chance: 0.5 },
      { name: "치즈", chance: 0.25 },
    ],
  },
  potato: {
    mob: [
      { name: "감자", chance: 0.4 },
      { name: "양파", chance: 0.15 },
    ],
    boss: [
      { name: "감자", chance: 1, quantity: 4 },
      { name: "양파", chance: 0.6, quantity: 2 },
      { name: "치즈", chance: 0.25 },
    ],
  },
  mouse: {
    mob: [
      { name: "치즈", chance: 0.35 },
      { name: "옥수수", chance: 0.15 },
    ],
    boss: [
      { name: "치즈", chance: 1, quantity: 3 },
      { name: "우유", chance: 0.5 },
      { name: "양파", chance: 0.25 },
    ],
  },
  cauldron: {
    mob: [
      { name: "우유", chance: 0.35 },
      { name: "계란", chance: 0.15 },
    ],
    boss: [
      { name: "우유", chance: 1, quantity: 3 },
      { name: "치즈", chance: 0.5 },
      { name: "계란", chance: 0.25 },
    ],
  },
  mudskipper: {
    mob: [
      { name: "양배추", chance: 0.35 },
      { name: "옥수수", chance: 0.15 },
    ],
    boss: [
      { name: "양배추", chance: 1, quantity: 3 },
      { name: "호박", chance: 0.5 },
      { name: "토마토", chance: 0.25 },
    ],
  },
};

export function rollDrops(kind: EnemyKind, boss: boolean): { name: string; quantity: number }[] {
  return (boss ? DROPS[kind].boss : DROPS[kind].mob)
    .filter((entry) => Math.random() < entry.chance)
    .map((entry) => ({ name: entry.name, quantity: entry.quantity ?? 1 }));
}
