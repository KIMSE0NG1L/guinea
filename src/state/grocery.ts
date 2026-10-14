// Grandma's grocery stock. Prices are in gold, one item per purchase.
export type GroceryCategory = "vegetable" | "farm" | "meat";

export const GROCERY: { name: string; price: number; category: GroceryCategory }[] = [
  { name: "당근", price: 30, category: "vegetable" },
  { name: "토마토", price: 40, category: "vegetable" },
  { name: "감자", price: 40, category: "vegetable" },
  { name: "양파", price: 40, category: "vegetable" },
  { name: "양배추", price: 50, category: "vegetable" },
  { name: "옥수수", price: 50, category: "vegetable" },
  { name: "버섯", price: 60, category: "vegetable" },
  { name: "호박", price: 80, category: "vegetable" },
  { name: "계란", price: 60, category: "farm" },
  { name: "우유", price: 70, category: "farm" },
  { name: "치즈", price: 120, category: "farm" },
  // Named by cut, not by animal, so they fit whatever creature roams this world.
  { name: "통다리살", price: 100, category: "meat" },
  { name: "겹겹 뱃살", price: 140, category: "meat" },
  { name: "결 고운 생선살", price: 160, category: "meat" },
  { name: "뼈 갈빗살", price: 180, category: "meat" },
  { name: "두툼 살코기", price: 200, category: "meat" },
];
