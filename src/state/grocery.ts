import { getDropSources } from "./drops";
import { STAGES } from "./stages";

// Grandma's grocery stock. Prices are in gold, one item per purchase.
export type GroceryCategory = "vegetable" | "fruit" | "farm" | "meat" | "seafood" | "special";

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
];

const BASE_PRICE = 20;
// Price climbs this much per stage, following how much stronger each stage's monsters are.
const STAGE_PRICE_GROWTH = 1.3;

// How hard one drop entry is to come by: common mob drops ×1, rarer mob drops more, and
// boss-only loot (one boss per 25 kills) the most — scaled up further when even the boss
// doesn't always drop it.
function rarityMultiplier(boss: boolean, chance: number) {
  if (boss) return 3 + (1 - chance) * 2;
  if (chance >= 0.3) return 1;
  if (chance >= 0.15) return 1.5;
  return 2;
}

// The cheapest way to get an item sets its price: the earliest, most common place it drops.
export function getGroceryPrice(name: string, shopPrice?: number) {
  const prices = getDropSources(name).map(({ kind, boss, entry }) => {
    const stage = Math.max(0, STAGES.findIndex((item) => item.enemyKind === kind));
    return BASE_PRICE * STAGE_PRICE_GROWTH ** stage * rarityMultiplier(boss, entry.chance);
  });
  const raw = prices.length > 0 ? Math.min(...prices) : (shopPrice ?? BASE_PRICE);
  return Math.round(raw / 10) * 10;
}

// Cheapest first.
export const GROCERY: { name: string; price: number; category: GroceryCategory }[] = STOCK
  .map((item) => ({ name: item.name, category: item.category, price: getGroceryPrice(item.name, item.shopPrice) }))
  .sort((a, b) => a.price - b.price);
