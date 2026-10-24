import type { GameState } from "../types";

type Inventory = GameState["inventory"];

// Each slot holds up to STACK_SIZE of one item; more of it spills into another slot.
// Deliberately roomy next to most idle games (which start around 20–30 slots and charge
// steeply to grow): 40 to start, +10 per expansion, with a gentle price ramp.
export const STACK_SIZE = 64;
export const BAG_BASE_SLOTS = 40;
export const BAG_EXPAND_SLOTS = 10;
export const BAG_MAX_SLOTS = 200;

export function getBagCapacity(expansions = 0) {
  return Math.min(BAG_MAX_SLOTS, BAG_BASE_SLOTS + expansions * BAG_EXPAND_SLOTS);
}

// 30, 50, 70, … gems.
export function getBagExpandCost(expansions = 0) {
  return 30 + expansions * 20;
}

export function slotsFor(quantity: number) {
  return Math.ceil(quantity / STACK_SIZE);
}

// Slots the whole bag takes up: every item, split into stacks of STACK_SIZE.
export function slotsUsed(inventory: Inventory) {
  return inventory.reduce((total, item) => total + slotsFor(item.quantity), 0);
}

// Splits incoming items into what fits (topping up an item's last stack, then free slots)
// and what's left over because the bag is full — partially, if only some of a pile fits.
export function fitItems<T extends { name: string; quantity?: number }>(inventory: Inventory, items: T[], capacity: number) {
  const owned = new Map(inventory.map((item) => [item.name, item.quantity]));
  let used = slotsUsed(inventory);
  const kept: (T & { quantity: number })[] = [];
  const overflow: (T & { quantity: number })[] = [];
  for (const item of items) {
    const want = item.quantity ?? 1;
    const have = owned.get(item.name) ?? 0;
    const room = slotsFor(have) * STACK_SIZE - have + Math.max(0, capacity - used) * STACK_SIZE;
    const take = Math.min(want, room);
    if (take > 0) {
      kept.push({ ...item, quantity: take });
      used += slotsFor(have + take) - slotsFor(have);
      owned.set(item.name, have + take);
    }
    if (take < want) overflow.push({ ...item, quantity: want - take });
  }
  return { kept, overflow };
}
