import type { EnemyKind } from "../types";

type DropEntry = { name: string; chance: number; quantity?: number };

// What each monster can drop on defeat — each entry is rolled independently.
// Bosses roll their own richer table instead of the mob one. Every drop has to make sense
// for the creature (a slime drops jelly, a crab drops crab meat) — nothing random.
const DROPS: Record<EnemyKind, { mob: DropEntry[]; boss: DropEntry[] }> = {
  // 뒷산: slimes shed green jelly and dew; the king's crown drips royal jelly.
  slime: {
    mob: [
      { name: "초록 젤리", chance: 0.4 },
      { name: "이슬", chance: 0.3 },
      { name: "고수", chance: 0.1 },
    ],
    boss: [
      { name: "로열 젤리", chance: 1 },
      { name: "초록 젤리", chance: 1, quantity: 3 },
      { name: "이슬", chance: 1, quantity: 3 },
    ],
  },
  // 버섯 늪: mushrooms and the swamp's wild herbs.
  mushroom: {
    mob: [
      { name: "버섯", chance: 0.35 },
      { name: "고수", chance: 0.1 },
      { name: "딜", chance: 0.1 },
    ],
    boss: [
      { name: "버섯", chance: 1, quantity: 3 },
      { name: "고수", chance: 0.5 },
      { name: "딜", chance: 0.5 },
    ],
  },
  // 거대 채소 농장: carrots and tomatoes.
  carrot: {
    mob: [
      { name: "당근", chance: 0.4 },
      { name: "토마토", chance: 0.15 },
    ],
    boss: [
      { name: "당근", chance: 1, quantity: 4 },
      { name: "토마토", chance: 0.6 },
      { name: "호박", chance: 0.3 },
    ],
  },
  // 꼬꼬 농장: eggs and drumsticks, plus the corn they're fed.
  chicken: {
    mob: [
      { name: "계란", chance: 0.35 },
      { name: "통다리살", chance: 0.1 },
    ],
    boss: [
      { name: "계란", chance: 1, quantity: 3 },
      { name: "통다리살", chance: 1, quantity: 2 },
      { name: "옥수수", chance: 0.5 },
    ],
  },
  // 감자 동굴: potatoes, onions and cave mushrooms.
  potato: {
    mob: [
      { name: "감자", chance: 0.4 },
      { name: "양파", chance: 0.15 },
    ],
    boss: [
      { name: "감자", chance: 1, quantity: 4 },
      { name: "양파", chance: 0.6 },
      { name: "버섯", chance: 0.3 },
    ],
  },
  // 평범한 마을: the mouse hoards cheese; the thieving cat has swiped fish.
  mouse: {
    mob: [
      { name: "치즈", chance: 0.35 },
      { name: "우유", chance: 0.15 },
    ],
    boss: [
      { name: "치즈", chance: 1, quantity: 3 },
      { name: "결 고운 생선살", chance: 0.5 },
      { name: "우유", chance: 0.4 },
    ],
  },
  // 부잣집 주방: pots of pork belly; the fridge is packed with the good cuts.
  cauldron: {
    mob: [
      { name: "겹겹 뱃살", chance: 0.25 },
      { name: "우유", chance: 0.15 },
    ],
    boss: [
      { name: "두툼 살코기", chance: 1, quantity: 2 },
      { name: "뼈 갈빗살", chance: 0.5 },
      { name: "치즈", chance: 0.4 },
    ],
  },
  // 항구 해변: shellfish from the mudflats; the king crab guards the shoreline's catch.
  mudskipper: {
    mob: [
      { name: "굴", chance: 0.3 },
      { name: "홍합", chance: 0.2 },
      { name: "꽃게", chance: 0.1 },
    ],
    boss: [
      { name: "게살", chance: 1, quantity: 2 },
      { name: "새우", chance: 0.5 },
      { name: "바닷가재", chance: 0.3 },
    ],
  },
  // 침몰선 산호초: the shoal's small fish and reef life; the shark's big catch.
  bluefish: {
    mob: [
      { name: "정어리", chance: 0.35 },
      { name: "오징어", chance: 0.15 },
      { name: "미역", chance: 0.1 },
    ],
    boss: [
      { name: "지느러미", chance: 1 },
      { name: "두툼 생선 토막", chance: 0.6 },
      { name: "문어", chance: 0.4 },
    ],
  },
  // 화산섬: chilies and fruit that only ripen in the heat.
  salamander: {
    mob: [
      { name: "불꽃 고추", chance: 0.3 },
      { name: "화염 열매", chance: 0.1 },
    ],
    boss: [
      { name: "화염 열매", chance: 1, quantity: 2 },
      { name: "불꽃 고추", chance: 0.5 },
      { name: "소금 결정", chance: 0.3 },
    ],
  },
  // 열대 정글: the monkeys' fruit; the carnivorous plant is full of what it lured in.
  monkey: {
    mob: [
      { name: "바나나", chance: 0.4 },
      { name: "망고", chance: 0.15 },
    ],
    boss: [
      { name: "바나나", chance: 1, quantity: 3 },
      { name: "망고", chance: 0.5 },
      { name: "코코넛", chance: 0.4 },
    ],
  },
  // 오아시스: carp from the pool, palm coconuts; the dragon carp's prized roe.
  carp: {
    mob: [
      { name: "결 고운 생선살", chance: 0.35 },
      { name: "코코넛", chance: 0.1 },
    ],
    boss: [
      { name: "반짝 생선알", chance: 1, quantity: 2 },
      { name: "결 고운 생선살", chance: 0.6 },
      { name: "분홍 생선살", chance: 0.4 },
    ],
  },
  // 사막: salt crusts and green apples from the cactus patches; the camel's pack still
  // carries the milk and cheese it set out with.
  cactus: {
    mob: [
      { name: "소금 결정", chance: 0.3 },
      { name: "풋사과", chance: 0.15 },
    ],
    boss: [
      { name: "치즈", chance: 1, quantity: 2 },
      { name: "우유", chance: 0.6 },
      { name: "소금 결정", chance: 0.4 },
    ],
  },
  // 사막시장: the fox snatches produce, lemons and spice off the stalls; the rattlesnake guards
  // the market's finest cured goods.
  fox: {
    mob: [
      { name: "토마토", chance: 0.3 },
      { name: "불꽃 고추", chance: 0.15 },
      { name: "레몬", chance: 0.15 },
    ],
    boss: [
      { name: "두툼 살코기", chance: 1, quantity: 2 },
      { name: "뼈 갈빗살", chance: 0.6 },
      { name: "치즈", chance: 0.4 },
    ],
  },
  // 밤의 실크로드: caravan dairy and cured goods left out under the lanterns; the haunted
  // goat guards the richest stash before dissolving into its own hoarded coins.
  lizard: {
    mob: [
      { name: "치즈", chance: 0.3 },
      { name: "우유", chance: 0.15 },
    ],
    boss: [
      { name: "뼈 갈빗살", chance: 1, quantity: 2 },
      { name: "두툼 살코기", chance: 0.6 },
      { name: "우유", chance: 0.4 },
    ],
  },
};

// Every place an ingredient drops: which monster, mob or boss table, and the entry.
export function getDropSources(name: string) {
  return (Object.keys(DROPS) as EnemyKind[]).flatMap((kind) => [
    ...DROPS[kind].mob.filter((entry) => entry.name === name).map((entry) => ({ kind, boss: false, entry })),
    ...DROPS[kind].boss.filter((entry) => entry.name === name).map((entry) => ({ kind, boss: true, entry })),
  ]);
}

// Every ingredient a monster can drop, mob table then boss table, for the codex.
export function getDropTable(kind: EnemyKind, boss: boolean): DropEntry[] {
  return boss ? DROPS[kind].boss : DROPS[kind].mob;
}

export function rollDrops(kind: EnemyKind, boss: boolean): { name: string; quantity: number }[] {
  return (boss ? DROPS[kind].boss : DROPS[kind].mob)
    .filter((entry) => Math.random() < entry.chance)
    .map((entry) => ({ name: entry.name, quantity: entry.quantity ?? 1 }));
}
