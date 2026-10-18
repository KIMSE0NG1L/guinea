import { RECIPES } from "./recipes";

// 《세상의 모든 맛》 — the recipe book 기니 found in stage 6, and the game's long goal: cook
// every dish in it at least once. Progress is the set of recipes ever cooked
// (GameState.cookedRecipes). Its rewards are the "cookbook" quest ladder (quests.ts), and
// filling the last page opens a short epilogue.

export function getCookbookProgress(cookedRecipes: string[] | undefined) {
  const cooked = new Set(cookedRecipes ?? []);
  return RECIPES.filter((recipe) => cooked.has(recipe.id)).length;
}

export function isCookbookComplete(cookedRecipes: string[] | undefined) {
  return getCookbookProgress(cookedRecipes) >= RECIPES.length;
}

// Quest rungs: every 5 pages, then the whole book — so the ladder grows with the recipes.
export function getCookbookQuestTargets(total = RECIPES.length) {
  const steps = Array.from({ length: Math.ceil(total / 5) - 1 }, (_, i) => (i + 1) * 5).filter((count) => count < total);
  return [...steps, total];
}
