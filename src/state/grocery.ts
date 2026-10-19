import { getDropSources } from "./drops";
import { STAGE_KILL_TARGET, STAGES } from "./stages";
import { getReferenceMobGold, roundPrice } from "./gameMath";

// Grandma's grocery stock. Prices are in gold, one item per purchase.
export type GroceryCategory = "vegetable" | "fruit" | "grain" | "farm" | "meat" | "seafood" | "special";

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

// Priced as the gold those kills would pay at the item's stage (getReferenceMobGold), so a
// stage-10 ingredient costs what stage-10 kills are worth. The cheapest source sets it.
export function getGroceryPrice(name: string, shopPrice?: number) {
  const prices = getDropSources(name).map(({ kind, boss, entry }) => {
    const stage = Math.max(0, STAGES.findIndex((item) => item.enemyKind === kind));
    return getReferenceMobGold(stage) * expectedKills(boss, entry.chance, entry.quantity) * BUY_PREMIUM;
  });
  return prices.length > 0 ? roundPrice(Math.min(...prices)) : (shopPrice ?? 30);
}

// Cheapest first.
// `shopOnly`: sold here on purpose without any monster dropping it (a fixed shopPrice).
export const GROCERY: { name: string; price: number; category: GroceryCategory; shopOnly: boolean }[] = STOCK
  .map((item) => ({ name: item.name, category: item.category, price: getGroceryPrice(item.name, item.shopPrice), shopOnly: item.shopPrice !== undefined }))
  .sort((a, b) => a.price - b.price);
