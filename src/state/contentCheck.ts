import { hasOwnEffect } from "./buffs";
import { getDropSources } from "./drops";
import { GROCERY } from "./grocery";
import { ITEM_IMAGES, RECIPES } from "./recipes";

// Dev-only sanity check for content added by hand (recipes, ingredients, drops). Nothing
// here breaks the build, so it's easy to miss a step — this lists what's missing in the
// console when the app starts in development.
//
// To add an ingredient: GROCERY's STOCK (grocery.ts, with its category — the codex and
// the shop list come from there), its icon in ITEM_IMAGES (recipes.ts), and a drop in
// drops.ts (that sets its shop price). To add a recipe: RECIPE_DEFS (recipes.ts) and its
// effect in EFFECTS (buffs.ts). Prices, cook time, buff duration and the cookbook follow.
export function checkContent() {
  const problems: string[] = [];
  const stocked = new Set(GROCERY.map((item) => item.name));
  const dishes = new Set(RECIPES.map((recipe) => recipe.name));

  for (const recipe of RECIPES) {
    if (!hasOwnEffect(recipe.id)) problems.push(`요리 "${recipe.name}": buffs.ts EFFECTS에 효과가 없어 기본 공격력 버프로 대체됨`);
    for (const { name } of recipe.ingredients) {
      if (dishes.has(name)) continue;
      if (!stocked.has(name)) problems.push(`재료 "${name}" (${recipe.name}): grocery.ts STOCK에 없음 — 도감·상점에 안 보임`);
      if (ITEM_IMAGES[name] === undefined) problems.push(`재료 "${name}" (${recipe.name}): recipes.ts ITEM_IMAGES에 아이콘 없음`);
    }
  }
  for (const item of GROCERY) {
    if (ITEM_IMAGES[item.name] === undefined) problems.push(`재료 "${item.name}": recipes.ts ITEM_IMAGES에 아이콘 없음`);
    if (getDropSources(item.name).length === 0 && !item.shopOnly) {
      problems.push(`재료 "${item.name}": 어떤 몬스터도 안 떨어뜨림 — 상점 기본 가격으로만 팔림`);
    }
  }

  if (problems.length > 0) console.warn(`[content check] ${problems.length}개 확인 필요:\n- ${problems.join("\n- ")}`);
}
