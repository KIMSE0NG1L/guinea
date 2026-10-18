import type { Outfit } from "../types";
import { RECIPES } from "./recipes";
import type { RecipeTier } from "./recipeTiers";

// Food buffs: eating a cooked dish into a battle slot grants its effect for a while.

export type BuffEffect = {
  attack?: number; // % more attack (negative = less)
  criticalChance?: number; // percentage points (negative can switch crits off)
  criticalDamage?: number; // percentage points
  gold?: number; // percentage points of gold bonus
  attackSpeed?: number; // % faster auto-battle pace
  bossDamage?: number; // % more damage dealt to bosses
  exp?: number; // % more exp per kill
  extraHit?: number; // % chance a swing lands one more strike
  missReduction?: number; // points off a companion's miss chance
  skillCooldown?: number; // seconds off every skill cooldown
  execute?: number; // points added to Execute's HP threshold (only with Execute equipped)
  dropRate?: number; // % more likely, every ingredient drop
  dropDouble?: number; // % chance a dropped ingredient comes in twos
  vegetableDrop?: number; // % more likely, vegetables only
  seafoodDrop?: number; // % more likely, seafood only
  bossDropSure?: number; // > 0: every boss drop is guaranteed
  cookSpeed?: number; // % shorter cook time for dishes started while it runs
  greatSuccess?: number; // % chance a collected dish comes out as two
  ingredientSave?: number; // % chance, per ingredient, to use one less when cooking
  groceryDiscount?: number; // % off grandma's grocery
  rushDiscount?: number; // % off finishing a dish early with gems
  offlineGold?: number; // % more offline gold, if running when the app closes
  offlineBuffs?: number; // > 0: food buffs keep working through offline progress
  skillReset?: number; // > 0: eating it makes the equipped skill ready at once
};

export type BuffSlot = { recipeId: string; expiresAt: number; durationMs: number } | null;

export const BUFF_SLOT_COUNT = 3;

// Only the first food slot is open from the start; the others are bought with gems.
// Index = slot index (slot 0 is free).
export const BUFF_SLOT_PRICES = [0, 500, 3000];

const MINUTE = 60_000;

// How long a dish lasts, by tier — at least as long as it takes to cook (COOK_TIME_MS in
// cooking.ts: 1 / 5 / 15 / 60 / 120 min), so three pots can keep three slots running.
// Cheap dishes outlast their cook time more; dear ones pay off in strength instead.
const BUFF_DURATION_MS: Record<RecipeTier, number> = {
  common: 3 * MINUTE,
  rare: 10 * MINUTE,
  epic: 20 * MINUTE,
  legendary: 60 * MINUTE,
  hidden: 120 * MINUTE,
};

// Effects are sized to a per-tier budget — common ~12, rare ~25, epic ~40, legendary ~95,
// hidden ~130 points. Per point: 1% attack, attack speed or extra-hit chance; 1 point of
// crit chance; 0.3% crit damage; 0.6% gold; 0.5% boss damage, exp or miss reduction;
// 2 points of execute; 0.4% drop rate; 0.6% double drops; 0.25% category drops; 0.3s skill
// cooldown; 0.3% cook speed; 0.8% great success; 0.5% ingredient save; 0.4% grocery
// discount; 0.2% rush discount; 0.3% offline gold; ~10–15 for each on/off perk.
// Within a tier, dishes that unlock on later stages sit at the top of the budget.
const EFFECTS: Record<string, { effect: BuffEffect; tint: string }> = {
  "green-jelly": { effect: { attack: 10 }, tint: "#bfe08a" },
  "slime-potion": { effect: { attackSpeed: 12 }, tint: "#c9e39a" },
  "royal-jelly": { effect: { dropDouble: 15, attack: 5 }, tint: "#fbd56e" },
  "carrot-soup": { effect: { criticalDamage: 25, exp: 10 }, tint: "#9ebdba" },
  "fried-egg": { effect: { criticalChance: 8, groceryDiscount: 20 }, tint: "#dfc1a6" },
  "chopped-salad": { effect: { dropRate: 20, gold: 8 }, tint: "#e0ab7b" },
  "veggie-stew": { effect: { vegetableDrop: 40, attack: 15 }, tint: "#f8a37e" },
  pudding: { effect: { exp: 30, criticalDamage: 30 }, tint: "#efcf9d" },
  "mushroom-soup": { effect: { cookSpeed: 30, rushDiscount: 30, attack: 10 }, tint: "#efc598" },
  "pumpkin-roast": { effect: { gold: 30, offlineGold: 25 }, tint: "#f8b37c" },
  "chicken-grill": { effect: { bossDamage: 40, attack: 5 }, tint: "#f3c27a" },
  "pork-belly": { effect: {}, tint: "#f0a98f" },
  "salmon-sashimi": { effect: { seafoodDrop: 60, criticalDamage: 80 }, tint: "#f9b48a" },
  "shrimp-sashimi": { effect: { gold: 45, greatSuccess: 15 }, tint: "#f8c1a8" },
  "mussel-seaweed-soup": { effect: { offlineBuffs: 1, offlineGold: 50, gold: 25 }, tint: "#c9d69a" },
  "tuna-sashimi": { effect: { attack: 30, criticalChance: 10 }, tint: "#e98f8f" },
  steak: { effect: { bossDamage: 50, attack: 15 }, tint: "#d69f7c" },
  octopus: { effect: { extraHit: 25, criticalChance: 10, attack: 5 }, tint: "#f2c4c8" },
  "potato-pancake": { effect: { ingredientSave: 30, gold: 40 }, tint: "#fdd785" },
  "banana-milk": { effect: { attackSpeed: 25, criticalChance: 15 }, tint: "#fce6a0" },
  yukhoe: { effect: { execute: 10, attack: 20 }, tint: "#e79a8c" },
  "salmon-steak": { effect: { criticalDamage: 100, missReduction: 20 }, tint: "#fbb989" },
  "lamb-rib": { effect: { skillReset: 1, skillCooldown: 30, attack: 25 }, tint: "#d98b6a" },
  // All in on raw power: no crits at all while it runs.
  "fire-skewer": { effect: { attack: 90, criticalChance: -100 }, tint: "#f27b5b" },
  "seafood-boil": { effect: { bossDropSure: 1, seafoodDrop: 50, attack: 50, gold: 30 }, tint: "#faa880" },
  "guinea-feast": { effect: { attack: 60, criticalChance: 10, gold: 60, exp: 30 }, tint: "#dab8a2" },
};

// Snacks: eaten on the spot instead of filling a slot — they pay out this many regular
// kills' worth of gold at the current stage, right away.
export const INSTANT_DISHES: Record<string, { goldKills: number }> = {
  "pork-belly": { goldKills: 40 },
};

export const BUFFS: Record<string, { effect: BuffEffect; durationMs: number; tint: string }> = Object.fromEntries(
  RECIPES.filter((recipe) => EFFECTS[recipe.id]).map((recipe) => [
    recipe.id,
    { ...EFFECTS[recipe.id], durationMs: BUFF_DURATION_MS[recipe.tier] },
  ]),
);

// Filling all three slots with dishes from one set adds its bonus on top.
export const DISH_SETS: { id: string; name: string; recipes: string[]; bonus: BuffEffect }[] = [
  {
    id: "sea",
    name: "바다 한 상",
    recipes: ["salmon-sashimi", "shrimp-sashimi", "mussel-seaweed-soup", "tuna-sashimi", "octopus", "salmon-steak", "seafood-boil"],
    bonus: { gold: 30, seafoodDrop: 30 },
  },
  {
    id: "meat",
    name: "고기 파티",
    recipes: ["chicken-grill", "steak", "yukhoe", "lamb-rib", "fire-skewer"],
    bonus: { attack: 25, bossDamage: 25 },
  },
  {
    id: "garden",
    name: "텃밭 정식",
    recipes: ["carrot-soup", "chopped-salad", "veggie-stew", "mushroom-soup", "pumpkin-roast", "potato-pancake"],
    bonus: { dropRate: 25, exp: 15 },
  },
  {
    id: "sweet",
    name: "디저트 타임",
    recipes: ["green-jelly", "slime-potion", "royal-jelly", "pudding", "banana-milk"],
    bonus: { attackSpeed: 15, criticalChance: 5 },
  },
];

export function getDishSet(recipeId: string) {
  return DISH_SETS.find((set) => set.recipes.includes(recipeId));
}

// A dish's effect is this much stronger while its partner companion is equipped.
export const PARTNER_MULTIPLIER = 1.5;
export const DISH_PARTNERS: Record<string, Outfit> = {
  "chopped-salad": "default",
  "banana-milk": "explorerHamster",
  "salmon-steak": "tetoGini",
  "fire-skewer": "tetoGini",
  octopus: "assassinGini",
  "lamb-rib": "egenGini",
};

export const OUTFIT_NAMES: Record<Outfit, string> = {
  default: "모험기니",
  explorerHamster: "탐험기니",
  tetoGini: "테토기니",
  assassinGini: "암살기니",
  egenGini: "에겐기니",
};

// "세트: 바다 한 상", "궁합: 테토기니" — the set a dish belongs to and its partner companion.
export function describeDishLinks(recipeId: string) {
  const set = getDishSet(recipeId);
  const partner = DISH_PARTNERS[recipeId];
  return [set && `세트: ${set.name}`, partner && `궁합: ${OUTFIT_NAMES[partner]}`].filter((part): part is string => !!part);
}

export function runningSlots(slots: BuffSlot[] | undefined, now: number) {
  return (slots ?? []).filter((slot): slot is NonNullable<BuffSlot> => !!slot && slot.expiresAt > now);
}

// The set whose bonus is on: every slot running, all from that one set.
export function getActiveSet(slots: BuffSlot[] | undefined, now: number) {
  const running = runningSlots(slots, now);
  if (running.length < BUFF_SLOT_COUNT) return undefined;
  const set = getDishSet(running[0].recipeId);
  return set && running.every((slot) => set.recipes.includes(slot.recipeId)) ? set : undefined;
}

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

const signed = (value: number) => `${value >= 0 ? "+" : ""}${value}`;

const EFFECT_LABELS: Record<keyof BuffEffect, (value: number) => string> = {
  attack: (value) => `공격력 ${signed(value)}%`,
  criticalChance: (value) => (value <= -100 ? "치명타 없음" : `치명타 확률 ${signed(value)}%`),
  criticalDamage: (value) => `치명타 피해 ${signed(value)}%`,
  gold: (value) => `골드 획득 ${signed(value)}%`,
  attackSpeed: (value) => `공격 속도 ${signed(value)}%`,
  bossDamage: (value) => `보스 피해 ${signed(value)}%`,
  exp: (value) => `경험치 ${signed(value)}%`,
  extraHit: (value) => `추가 타격 ${value}%`,
  missReduction: (value) => `빗나감 -${value}%`,
  skillCooldown: (value) => `스킬 쿨타임 -${value}초`,
  execute: (value) => `처형 기준 +${value}%`,
  dropRate: (value) => `재료 드롭 ${signed(value)}%`,
  dropDouble: (value) => `재료 2배 ${value}%`,
  vegetableDrop: (value) => `채소 드롭 ${signed(value)}%`,
  seafoodDrop: (value) => `해산물 드롭 ${signed(value)}%`,
  bossDropSure: () => "보스 재료 확정",
  cookSpeed: (value) => `요리 시간 -${value}%`,
  greatSuccess: (value) => `요리 대성공 ${value}%`,
  ingredientSave: (value) => `재료 절약 ${value}%`,
  groceryDiscount: (value) => `재료 상점 -${value}%`,
  rushDiscount: (value) => `즉시 완성 -${value}%`,
  offlineGold: (value) => `오프라인 골드 ${signed(value)}%`,
  offlineBuffs: () => "자는 동안 버프 유지",
  skillReset: () => "먹으면 스킬 즉시 충전",
};

const EFFECT_KEYS = Object.keys(EFFECT_LABELS) as (keyof BuffEffect)[];

export function describeEffect(effect: BuffEffect) {
  return EFFECT_KEYS.filter((key) => effect[key] !== undefined)
    .map((key) => EFFECT_LABELS[key](effect[key] ?? 0))
    .join(" · ");
}

// What a dish does, for UI copy — an instant snack describes its payout instead.
export function describeDish(recipeId: string) {
  const instant = INSTANT_DISHES[recipeId];
  if (instant) return `먹으면 즉시 골드 (몹 ${instant.goldKills}마리분)`;
  return describeEffect(BUFFS[recipeId]?.effect ?? {});
}

export function emptyEffect(): Required<BuffEffect> {
  return Object.fromEntries(EFFECT_KEYS.map((key) => [key, 0])) as Required<BuffEffect>;
}

function addEffect(totals: Required<BuffEffect>, effect: BuffEffect, scale = 1) {
  for (const key of EFFECT_KEYS) totals[key] += Math.round((effect[key] ?? 0) * scale);
}

export function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

// Sum of every slot that's still running at `now` — a dish whose partner companion is
// equipped counts PARTNER_MULTIPLIER times over — plus a full set's bonus.
export function getBuffTotals(slots: BuffSlot[] | undefined, now: number, outfit?: Outfit): Required<BuffEffect> {
  const totals = emptyEffect();
  for (const slot of runningSlots(slots, now)) {
    const effect = BUFFS[slot.recipeId]?.effect ?? {};
    addEffect(totals, effect, outfit && DISH_PARTNERS[slot.recipeId] === outfit ? PARTNER_MULTIPLIER : 1);
  }
  const set = getActiveSet(slots, now);
  if (set) addEffect(totals, set.bonus);
  return totals;
}

export function emptyBuffSlots(): BuffSlot[] {
  return Array.from({ length: BUFF_SLOT_COUNT }, () => null);
}
