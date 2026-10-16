import { recipeTemplates } from "../assets";

export type RecipeTier = "common" | "rare" | "epic" | "legendary" | "hidden";

// `dishArea` is where the dish sits on the template's blank space, as fractions of the
// (square) template: x, y, width, height. The ribbon scroll's area starts below its crown.
// `dishTilt` (degrees, negative = counter-clockwise) matches how the template art itself
// leans, measured from its top edge, so the dish looks drawn onto the page.
export const RECIPE_TIERS: Record<
  RecipeTier,
  { label: string; color: string; template: number; dishArea: [number, number, number, number]; dishTilt: number }
> = {
  common: { label: "하급", color: "#8a7458", template: recipeTemplates.scrollPlain, dishArea: [0.285, 0.211, 0.422, 0.441], dishTilt: -10 },
  rare: { label: "상급", color: "#c8553d", template: recipeTemplates.scrollRibbonCrown, dishArea: [0.336, 0.4, 0.387, 0.32], dishTilt: -10 },
  epic: { label: "에픽", color: "#9b3b2c", template: recipeTemplates.bookRed, dishArea: [0.415, 0.29, 0.28, 0.28], dishTilt: -9 },
  legendary: { label: "레전더리", color: "#2f5fb8", template: recipeTemplates.bookBlueStar, dishArea: [0.425, 0.29, 0.26, 0.26], dishTilt: -9 },
  // Learned hidden recipes open into this book; until then they stay a sealed scroll.
  hidden: { label: "히든", color: "#b8860b", template: recipeTemplates.bookBrown, dishArea: [0.425, 0.275, 0.29, 0.29], dishTilt: -9 },
};

export const SEALED_RECIPE = recipeTemplates.scrollSealedGold;
