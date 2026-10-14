import { food, recipeArt, uiImages } from "../assets";

export type Recipe = {
  id: string;
  name: string;
  description: string;
  image: number; // the finished dish
  art: number; // the recipe scroll/card sold in the recipe shop
  price: number; // gold to learn it; 0 = known from the start
  ingredients: { name: string; quantity: number }[];
};

export const RECIPES: Recipe[] = [
  {
    id: "carrot-soup",
    name: "당근 수프",
    description: "뭉근히 끓인 기니의 첫 요리.",
    image: food.cookPot,
    art: recipeArt.carrotSoup,
    price: 0,
    ingredients: [{ name: "당근", quantity: 3 }],
  },
  {
    id: "fried-egg",
    name: "계란 프라이",
    description: "노른자는 무조건 반숙.",
    image: food.fryingPan,
    art: recipeArt.friedEgg,
    price: 200,
    ingredients: [{ name: "계란", quantity: 2 }],
  },
  {
    id: "chopped-salad",
    name: "숭덩숭덩 샐러드",
    description: "칼질은 서툴러도 신선함은 만점.",
    image: food.cuttingBoard,
    art: recipeArt.scrollClosed,
    price: 300,
    ingredients: [
      { name: "토마토", quantity: 1 },
      { name: "양배추", quantity: 1 },
      { name: "당근", quantity: 1 },
    ],
  },
  {
    id: "veggie-stew",
    name: "채소 스튜",
    description: "냄비째 들고 먹고 싶은 맛.",
    image: food.stewPot,
    art: recipeArt.veggieStew,
    price: 400,
    ingredients: [
      { name: "당근", quantity: 2 },
      { name: "감자", quantity: 1 },
      { name: "양파", quantity: 1 },
    ],
  },
  {
    id: "pudding",
    name: "탱글 푸딩",
    description: "숟가락이 멈추지 않는 디저트.",
    image: food.pudding,
    art: recipeArt.pudding,
    price: 450,
    ingredients: [
      { name: "계란", quantity: 1 },
      { name: "우유", quantity: 1 },
    ],
  },
  {
    id: "mushroom-soup",
    name: "버섯 크림 수프",
    description: "숲 향이 가득한 고소한 한 그릇.",
    image: food.mushroomSoup,
    art: recipeArt.mushroomSoup,
    price: 500,
    ingredients: [
      { name: "버섯", quantity: 2 },
      { name: "우유", quantity: 1 },
    ],
  },
  {
    id: "pumpkin-roast",
    name: "치즈 호박 구이",
    description: "달큰한 호박 위에 치즈가 사르르.",
    image: food.pumpkinRoast,
    art: recipeArt.pumpkin,
    price: 600,
    ingredients: [
      { name: "호박", quantity: 1 },
      { name: "치즈", quantity: 1 },
    ],
  },
  {
    id: "guinea-feast",
    name: "기니의 한 상",
    description: "오늘만큼은 배고프지 않다.",
    image: food.kitchen,
    art: recipeArt.special,
    price: 1500,
    ingredients: [
      { name: "당근 수프", quantity: 1 },
      { name: "계란 프라이", quantity: 1 },
      { name: "치즈", quantity: 1 },
    ],
  },
];

export const STARTER_RECIPES = RECIPES.filter((recipe) => recipe.price === 0).map((recipe) => recipe.id);

export function getKnownRecipes(knownRecipes: string[] | undefined) {
  return knownRecipes ?? STARTER_RECIPES;
}

// Art for anything that can sit in the bag by name — raw ingredients and cooked dishes.
export const ITEM_IMAGES: Record<string, number> = {
  당근: uiImages.carrot,
  토마토: food.tomato,
  감자: food.potato,
  버섯: food.mushroom,
  양배추: food.cabbage,
  호박: food.pumpkin,
  옥수수: food.corn,
  양파: food.onion,
  계란: food.egg,
  우유: food.milk,
  치즈: food.cheese,
  ...Object.fromEntries(RECIPES.map((recipe) => [recipe.name, recipe.image])),
};

export function getItemQuantity(inventory: { name: string; quantity: number }[], name: string) {
  return inventory.find((item) => item.name === name)?.quantity ?? 0;
}

export function canCook(inventory: { name: string; quantity: number }[], recipe: Recipe) {
  return recipe.ingredients.every((ingredient) => getItemQuantity(inventory, ingredient.name) >= ingredient.quantity);
}
