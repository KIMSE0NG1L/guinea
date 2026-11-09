import { getDropSources } from "./drops";
import { STAGE_KILL_TARGET, STAGES } from "./stages";
import { getReferenceMobGold, roundPrice } from "./gameMath";
import { applyDiscount } from "./cooking";

// Grandma's grocery stock. Prices are in gold, one item per purchase.
export type GroceryCategory = "vegetable" | "fruit" | "grain" | "nut" | "farm" | "meat" | "seafood" | "special";

// Stock list. Prices aren't hand-set: each comes from where the item drops (see
// getGroceryPrice). Only items no monster drops carry a fixed `shopPrice`.
const STOCK: { name: string; category: GroceryCategory; shopPrice?: number }[] = [
  { name: "당근", category: "vegetable" },
  { name: "토마토", category: "vegetable" },
  { name: "감자", category: "vegetable" },
  { name: "양파", category: "vegetable" },
  { name: "양배추", category: "vegetable", shopPrice: 30 },
  { name: "옥수수", category: "vegetable" },
  { name: "버섯", category: "vegetable" },
  { name: "호박", category: "vegetable" },
  { name: "계란", category: "farm" },
  { name: "우유", category: "farm" },
  { name: "치즈", category: "farm" },
  { name: "통다리살", category: "meat" },
  { name: "겹겹 뱃살", category: "meat" },
  { name: "결 고운 생선살", category: "meat" },
  { name: "뼈 갈빗살", category: "meat" },
  { name: "두툼 살코기", category: "meat" },
  { name: "풋사과", category: "fruit" },
  { name: "바나나", category: "fruit" },
  { name: "레몬", category: "fruit" },
  { name: "망고", category: "fruit" },
  { name: "코코넛", category: "fruit" },
  { name: "미역", category: "seafood" },
  { name: "정어리", category: "seafood" },
  { name: "홍합", category: "seafood" },
  { name: "굴", category: "seafood" },
  { name: "오징어", category: "seafood" },
  { name: "새우", category: "seafood" },
  { name: "꽃게", category: "seafood" },
  { name: "분홍 생선살", category: "seafood" },
  { name: "문어", category: "seafood" },
  { name: "게살", category: "seafood" },
  { name: "두툼 생선 토막", category: "seafood" },
  { name: "바닷가재", category: "seafood" },
  { name: "반짝 생선알", category: "seafood" },
  { name: "지느러미", category: "seafood" },
  { name: "이슬", category: "special" },
  { name: "소금 결정", category: "special" },
  { name: "고수", category: "special" },
  { name: "딜", category: "special" },
  { name: "불꽃 고추", category: "special" },
  { name: "초록 젤리", category: "special" },
  { name: "화염 열매", category: "special" },
  { name: "로열 젤리", category: "special" },
  { name: "죽순", category: "vegetable" },
  { name: "만두피", category: "special" },
  { name: "곶감", category: "fruit" },
  { name: "막걸리", category: "special" },
  { name: "진달래꽃", category: "special" },
  { name: "배", category: "fruit" },
  { name: "복숭아", category: "fruit" },
  { name: "감", category: "fruit" },
  { name: "거봉", category: "fruit" },
  { name: "샤인머스캣", category: "fruit" },
  { name: "귤", category: "fruit" },
  { name: "천도복숭아", category: "fruit" },
  { name: "대추", category: "fruit" },
  { name: "매실", category: "fruit" },
  { name: "살구", category: "fruit" },
  { name: "키위", category: "fruit" },
  { name: "석류", category: "fruit" },
  { name: "산딸기", category: "fruit" },
  { name: "오미자", category: "fruit" },
  { name: "딸기", category: "fruit" },
  { name: "참외", category: "fruit" },
  { name: "아몬드", category: "nut" },
  { name: "호두", category: "nut" },
  { name: "캐슈넛", category: "nut" },
  { name: "피스타치오", category: "nut" },
  { name: "헤이즐넛", category: "nut" },
  { name: "마카다미아", category: "nut" },
  { name: "피칸", category: "nut" },
  { name: "땅콩", category: "nut" },
  { name: "잣", category: "nut" },
  { name: "밤", category: "nut" },
  { name: "은행", category: "nut" },
  { name: "브라질너트", category: "nut" },
  { name: "쌀", category: "grain" },
  { name: "찹쌀", category: "grain" },
  { name: "현미", category: "grain" },
  { name: "흑미", category: "grain" },
  { name: "보리", category: "grain" },
  { name: "귀리", category: "grain" },
  { name: "조", category: "grain" },
  { name: "수수", category: "grain" },
  { name: "팥", category: "grain" },
  { name: "검은콩", category: "grain" },
  { name: "고춧가루", category: "special" },
  { name: "고등어", category: "seafood" },
  { name: "먹물", category: "seafood" },
  { name: "벚꽃잎", category: "special" },
  { name: "유부", category: "farm" },
  { name: "무", category: "vegetable" },
  { name: "유자", category: "fruit" },
  { name: "전복", category: "seafood" },
];

// Buying costs this much more than the gold you'd earn farming the item yourself, so the
// shop saves time rather than replacing the hunt.
const BUY_PREMIUM = 1.5;

// Kills it takes on average to farm one: 1/chance for a mob drop, and for boss loot the
// whole stage (25 mobs + the boss) per boss, split over how many it drops.
function expectedKills(boss: boolean, chance: number, quantity = 1) {
  return (boss ? STAGE_KILL_TARGET + 1 : 1) / (chance * quantity);
}

// Priced as the gold those kills would pay at `stageNumber` (the furthest stage of this run,
// so prices keep up with income and walking back to stage 1 can't get them cheap). The
// easiest source to farm sets it. A shop-only item's `shopPrice` is its stage-1 price.
export function getGroceryPrice(name: string, stageNumber: number) {
  const mobGold = getReferenceMobGold(stageNumber);
  const kills = getDropSources(name).map(({ boss, entry }) => expectedKills(boss, entry.chance, entry.quantity));
  if (kills.length > 0) return roundPrice(mobGold * Math.min(...kills) * BUY_PREMIUM);
  const shopPrice = STOCK.find((item) => item.name === name)?.shopPrice ?? 30;
  return roundPrice((shopPrice * mobGold) / getReferenceMobGold(0));
}

// On the shelf once this run has reached a stage that drops it. Prices no longer depend on
// where an item comes from, so without this a fresh run could buy late-game ingredients cheaply.
// Shop-only items, which nothing drops, are always in stock.
export function isGroceryAvailable(name: string, stageNumber: number) {
  const stages = getDropSources(name).map(({ kind }) => STAGES.findIndex((item) => item.enemyKind === kind));
  return stages.length === 0 || Math.min(...stages) <= stageNumber;
}

// Cheapest first (prices all scale together, so the order holds at every stage).
// `shopOnly`: sold here on purpose without any monster dropping it (a set shopPrice).
export const GROCERY: { name: string; category: GroceryCategory; shopOnly: boolean }[] = STOCK
  .map((item) => ({ name: item.name, category: item.category, shopOnly: item.shopPrice !== undefined }))
  .sort((a, b) => getGroceryPrice(a.name, 0) - getGroceryPrice(b.name, 0));

// Selling an ingredient from the bag pays a tenth of what the grocery charges for it: a
// small top-up for spare drops (selling every drop shouldn't out-earn the hunt itself), and
// buying to resell always loses gold.
const SELL_RATIO = 0.1;

export function getSellPrice(name: string, stageNumber: number) {
  return Math.max(1, Math.floor(getGroceryPrice(name, stageNumber) * SELL_RATIO));
}

// What's missing from the bag to cook `ingredients`, and what the grocery would charge for it
// (with the food-buff discount). null when something missing isn't sold there.
export function getShortfall(
  inventory: { name: string; quantity: number }[],
  ingredients: { name: string; quantity: number }[],
  discountPercent: number,
  stageNumber: number,
): { items: { name: string; quantity: number }[]; cost: number } | null {
  const items: { name: string; quantity: number }[] = [];
  let cost = 0;
  for (const ingredient of ingredients) {
    const have = inventory.filter((item) => item.name === ingredient.name).reduce((sum, item) => sum + item.quantity, 0);
    const missing = ingredient.quantity - have;
    if (missing <= 0) continue;
    if (!GROCERY.some((item) => item.name === ingredient.name) || !isGroceryAvailable(ingredient.name, stageNumber)) return null;
    items.push({ name: ingredient.name, quantity: missing });
    cost += applyDiscount(getGroceryPrice(ingredient.name, stageNumber), discountPercent) * missing;
  }
  return { items, cost };
}
