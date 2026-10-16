import type { GameState } from "../types";

type Inventory = GameState["inventory"];

// Each slot holds one kind of item in an unlimited stack, so only new kinds need room.
// Deliberately roomy next to most idle games (which start around 20–30 slots and charge
// steeply to grow): 40 to start, +10 per expansion, with a gentle price ramp.
export const BAG_BASE_SLOTS = 40;
export const BAG_EXPAND_SLOTS = 10;
export const BAG_MAX_SLOTS = 120;

export function getBagCapacity(expansions = 0) {
  return Math.min(BAG_MAX_SLOTS, BAG_BASE_SLOTS + expansions * BAG_EXPAND_SLOTS);
}

// 30, 50, 70, … gems.
export function getBagExpandCost(expansions = 0) {
  return 30 + expansions * 20;
}

// Splits incoming items into those that fit (an existing stack, or a free slot) and the
// ones left behind because they'd need a new slot in a full bag.
export function fitItems<T extends { name: string }>(inventory: Inventory, items: T[], capacity: number) {
  const names = new Set(inventory.map((item) => item.name));
  const kept: T[] = [];
  const overflow: T[] = [];
  for (const item of items) {
    if (names.has(item.name)) {
      kept.push(item);
    } else if (names.size < capacity) {
      names.add(item.name);
      kept.push(item);
    } else {
      overflow.push(item);
    }
  }
  return { kept, overflow };
}
