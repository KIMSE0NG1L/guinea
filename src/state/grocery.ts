// Grandma's grocery stock. Prices are in gold, one item per purchase.
export type GroceryCategory = "vegetable" | "farm";

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
];
