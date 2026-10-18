import { food, uiImages } from "../assets";
import type { RecipeTier } from "./recipeTiers";
import { getDropSources } from "./drops";
import { STAGES } from "./stages";
import { getReferenceMobGold, roundPrice } from "./gameMath";

export type Recipe = {
  id: string;
  name: string;
  description: string;
  image: number; // the finished dish
  tier: RecipeTier; // picks the scroll/book its recipe card is drawn on
  price: number; // gold to learn it; 0 = known from the start
  ingredients: { name: string; quantity: number }[];
};

type RecipeDef = Omit<Recipe, "price">;

const RECIPE_DEFS: RecipeDef[] = [
  // Ordered by how easy the ingredients are to get: tier follows the stage where they
  // first drop (slime dishes come first — slimes are the very first monster) (common = first few stages … epic = late stages), and legendary/hidden
  // need many different rare or boss-only ingredients. Prices are worked out below.
  {
    id: "green-jelly",
    name: "말랑 초록 젤리",
    description: "기니의 첫 요리. 탱글탱글 흔들리는 디저트.",
    image: food.dishGreenJelly,
    tier: "common",
    ingredients: [
      { name: "초록 젤리", quantity: 3 },
    ],
  },
  {
    id: "slime-potion",
    name: "말랑 에너지 물약",
    description: "흔들면 찰랑, 마시면 기운이 번쩍.",
    image: food.dishSlimePotion,
    tier: "common",
    ingredients: [
      { name: "초록 젤리", quantity: 2 },
      { name: "이슬", quantity: 1 },
    ],
  },
  {
    id: "royal-jelly",
    name: "왕관 로열 젤리",
    description: "왕 슬라임의 왕관에서 흘러내린 황금빛 한 그릇.",
    image: food.dishRoyalJelly,
    tier: "common",
    ingredients: [
      { name: "로열 젤리", quantity: 1 },
      { name: "초록 젤리", quantity: 2 },
    ],
  },
  {
    id: "carrot-soup",
    name: "당근 수프",
    description: "뭉근히 끓여 속까지 따뜻해지는 맛.",
    image: food.cookPot,
    tier: "common",
    ingredients: [{ name: "당근", quantity: 3 }],
  },
  {
    id: "fried-egg",
    name: "계란 프라이",
    description: "노른자는 무조건 반숙.",
    image: food.fryingPan,
    tier: "common",
    ingredients: [{ name: "계란", quantity: 2 }],
  },
  {
    id: "chopped-salad",
    name: "숭덩숭덩 샐러드",
    description: "칼질은 서툴러도 신선함은 만점.",
    image: food.dishSalad,
    tier: "common",
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
    image: food.dishVeggieStew,
    tier: "rare",
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
    tier: "rare",
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
    tier: "rare",
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
    tier: "rare",
    ingredients: [
      { name: "호박", quantity: 1 },
      { name: "치즈", quantity: 1 },
    ],
  },
  {
    id: "chicken-grill",
    name: "바삭 통다리 구이",
    description: "껍질은 바삭, 속은 촉촉. 큰 놈 잡기 전엔 이거지.",
    image: food.chickenGrilled,
    tier: "rare",
    ingredients: [
      { name: "통다리살", quantity: 2 },
      { name: "고수", quantity: 1 },
    ],
  },
  {
    // A snack: eaten on the spot for gold instead of filling a buff slot (INSTANT_DISHES).
    id: "pork-belly",
    name: "지글지글 삼겹살",
    description: "한 점 먹자마자 힘이 불끈, 지갑도 두둑.",
    image: food.porkBellyGrilled,
    tier: "rare",
    ingredients: [
      { name: "겹겹 뱃살", quantity: 2 },
      { name: "양파", quantity: 1 },
    ],
  },
  {
    id: "potato-pancake",
    name: "바삭 감자전",
    description: "갈아서 부치면 겉바속촉.",
    image: food.dishPotatoPancake,
    tier: "epic",
    ingredients: [
      { name: "감자", quantity: 3 },
      { name: "양파", quantity: 1 },
      { name: "소금 결정", quantity: 1 },
    ],
  },
  {
    id: "salmon-steak",
    name: "레몬 생선 스테이크",
    description: "두툼한 생선살을 겉만 바삭하게.",
    image: food.dishSalmonSteak,
    tier: "epic",
    ingredients: [
      { name: "두툼 생선 토막", quantity: 1 },
      { name: "레몬", quantity: 1 },
      { name: "딜", quantity: 1 },
      { name: "소금 결정", quantity: 1 },
    ],
  },
  {
    id: "steak",
    name: "두툼 스테이크",
    description: "칼집 사이로 육즙이 주르륵.",
    image: food.dishSteak,
    tier: "epic",
    ingredients: [
      { name: "두툼 살코기", quantity: 2 },
      { name: "토마토", quantity: 1 },
      { name: "소금 결정", quantity: 1 },
    ],
  },
  {
    id: "banana-milk",
    name: "바나나 우유",
    description: "정글에서 따 온 바나나로 흔들흔들.",
    image: food.dishBananaMilk,
    tier: "epic",
    ingredients: [
      { name: "바나나", quantity: 2 },
      { name: "우유", quantity: 1 },
    ],
  },
  {
    id: "mussel-seaweed-soup",
    name: "홍합 미역국",
    description: "바다 냄새 가득, 속이 확 풀리는 국.",
    image: food.dishMusselSeaweedSoup,
    tier: "epic",
    ingredients: [
      { name: "미역", quantity: 1 },
      { name: "홍합", quantity: 2 },
    ],
  },
  {
    id: "shrimp-sashimi",
    name: "단새우회",
    description: "입에서 사르르 녹는 달큰한 맛.",
    image: food.dishShrimpSashimi,
    tier: "epic",
    ingredients: [
      { name: "새우", quantity: 3 },
    ],
  },
  {
    id: "salmon-sashimi",
    name: "결 고운 생선회",
    description: "결대로 썰어 부드럽게 녹는 회.",
    image: food.dishSalmonSashimi,
    tier: "epic",
    ingredients: [
      { name: "결 고운 생선살", quantity: 2 },
    ],
  },
  {
    id: "yukhoe",
    name: "육회",
    description: "노른자를 톡 터뜨려 비벼 먹는 별미.",
    image: food.dishYukhoe,
    tier: "epic",
    ingredients: [
      { name: "두툼 살코기", quantity: 1 },
      { name: "계란", quantity: 1 },
      { name: "풋사과", quantity: 1 },
    ],
  },
  {
    id: "octopus",
    name: "문어 숙회",
    description: "살짝 데쳐 쫄깃함이 살아 있어요.",
    image: food.dishOctopus,
    tier: "epic",
    ingredients: [
      { name: "문어", quantity: 1 },
      { name: "소금 결정", quantity: 1 },
    ],
  },
  {
    id: "tuna-sashimi",
    name: "두툼 생선회",
    description: "붉은 살을 도톰하게 썰어 낸 회.",
    image: food.dishTunaSashimi,
    tier: "epic",
    ingredients: [
      { name: "두툼 생선 토막", quantity: 2 },
    ],
  },
  {
    id: "lamb-rib",
    name: "매콤 갈비 구이",
    description: "뼈째 뜯는 순간 기운이 확 돌아와요.",
    image: food.lambGrilled,
    tier: "epic",
    ingredients: [
      { name: "뼈 갈빗살", quantity: 2 },
      { name: "불꽃 고추", quantity: 1 },
    ],
  },
  {
    id: "fire-skewer",
    name: "불꽃 꼬치",
    description: "입안이 불타서 정신이 하나도 없어요. 대신 힘은 최고!",
    image: food.beefGrilled,
    tier: "epic",
    ingredients: [
      { name: "두툼 살코기", quantity: 1 },
      { name: "불꽃 고추", quantity: 2 },
      { name: "화염 열매", quantity: 1 },
    ],
  },
  {
    id: "seafood-boil",
    name: "해물 보일링",
    description: "냄비째 쏟아붓는 바다 한 상.",
    image: food.dishSeafoodBoil,
    tier: "legendary",
    ingredients: [
      { name: "꽃게", quantity: 1 },
      { name: "바닷가재", quantity: 1 },
      { name: "새우", quantity: 2 },
      { name: "홍합", quantity: 2 },
      { name: "오징어", quantity: 1 },
      { name: "옥수수", quantity: 1 },
      { name: "이슬", quantity: 2 },
    ],
  },
  {
    id: "guinea-feast",
    name: "기니의 한 상",
    description: "오늘만큼은 배고프지 않다.",
    image: food.kitchen,
    tier: "hidden",
    ingredients: [
      { name: "당근 수프", quantity: 1 },
      { name: "계란 프라이", quantity: 1 },
      { name: "치즈", quantity: 1 },
    ],
  },
];

// Earliest stage an ingredient drops at; a dish used as an ingredient counts from when its
// own recipe can be cooked, and shop-only items (양배추) are available from the start.
function firstStage(name: string): number {
  const dish = RECIPE_DEFS.find((recipe) => recipe.name === name);
  if (dish) return getRecipeStage(dish);
  const stages = getDropSources(name).map(({ kind }) => STAGES.findIndex((stage) => stage.enemyKind === kind));
  return stages.length > 0 ? Math.min(...stages) : 0;
}

// The stage a recipe first becomes cookable at — when its last ingredient starts dropping.
export function getRecipeStage(recipe: RecipeDef) {
  return Math.max(0, ...recipe.ingredients.map((ingredient) => firstStage(ingredient.name)));
}

// A recipe costs this many regular kills' gold at the stage it unlocks (getReferenceMobGold)
// — a fraction of a stage (25 kills) for everyday dishes, about a stage for an epic one.
const PRICE_IN_KILLS: Record<RecipeTier, number> = { common: 10, rare: 15, epic: 25, legendary: 40, hidden: 60 };

// Bought for real during the recipe tutorial on the starting gold, so it stays a token price.
const TUTORIAL_RECIPE_PRICE = 50;

// The chef only sells a recipe once the boss of its stage (getRecipeStage) has been beaten.
// The tutorial's first recipe is the exception — it's bought before any boss falls.
export function isRecipeForSale(recipe: RecipeDef, clearedStages: number[]) {
  return recipe.id === "green-jelly" || clearedStages.includes(getRecipeStage(recipe));
}

export const RECIPES: Recipe[] = RECIPE_DEFS.map((recipe) => ({
  ...recipe,
  price:
    recipe.id === "green-jelly"
      ? TUTORIAL_RECIPE_PRICE
      : roundPrice(getReferenceMobGold(getRecipeStage(recipe)) * PRICE_IN_KILLS[recipe.tier]),
}));

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
  "통다리살": food.chicken,
  "겹겹 뱃살": food.porkBelly,
  "두툼 살코기": food.beef,
  "뼈 갈빗살": food.lamb,
  "결 고운 생선살": food.salmon,
  "꽃게": food.crab,
  "새우": food.shrimp,
  "문어": food.octopus,
  "오징어": food.squid,
  "분홍 생선살": food.tuna,
  "정어리": food.sardine,
  "홍합": food.mussel,
  "바닷가재": food.lobster,
  "굴": food.oyster,
  "두툼 생선 토막": food.fishSteak,
  "지느러미": food.sharkFin,
  "반짝 생선알": food.roe,
  "불꽃 고추": food.chili,
  "화염 열매": food.fireFruit,
  "미역": food.seaweed,
  "초록 젤리": food.greenJelly,
  "고수": food.herb,
  "딜": food.dill,
  "이슬": food.dew,
  "레몬": food.lemon,
  "풋사과": food.greenApple,
  "로열 젤리": food.royalJelly,
  "소금 결정": food.salt,
  "게살": food.crabMeat,
  "바나나": food.banana,
  "망고": food.mango,
  "코코넛": food.coconut,
  양파: food.onion,
  계란: food.egg,
  우유: food.milk,
  치즈: food.cheese,
  ...Object.fromEntries(RECIPES.map((recipe) => [recipe.name, recipe.image])),
};

export function getItemQuantity(inventory: { name: string; quantity: number }[], name: string) {
  return inventory.find((item) => item.name === name)?.quantity ?? 0;
}

// The bag after a recipe's ingredients are taken out (emptied items drop off).
export function consumeIngredients<T extends { name: string; quantity: number }>(inventory: T[], recipe: Recipe): T[] {
  return inventory
    .map((item) => {
      const used = recipe.ingredients.find((ingredient) => ingredient.name === item.name)?.quantity ?? 0;
      return used ? { ...item, quantity: item.quantity - used } : item;
    })
    .filter((item) => item.quantity > 0);
}

export function canCook(inventory: { name: string; quantity: number }[], recipe: Recipe) {
  return recipe.ingredients.every((ingredient) => getItemQuantity(inventory, ingredient.name) >= ingredient.quantity);
}
