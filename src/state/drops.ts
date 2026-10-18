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
  // 죽운성: dumpling filling spilled from the mantou men's own steamer baskets; the panda
  // hoards the richest stash of meat and dairy between bites of bamboo shoot.
  mantou: {
    mob: [
      { name: "당근", chance: 0.3 },
      { name: "양파", chance: 0.15 },
    ],
    boss: [
      { name: "두툼 살코기", chance: 1, quantity: 2 },
      { name: "치즈", chance: 0.6 },
      { name: "우유", chance: 0.4 },
    ],
  },
  // 죽운성 누각: the pig guards skim scraps from the palace kitchen between patrols; the
  // turtle spirit has centuries of the palace's finest offerings stored away.
  pig: {
    mob: [
      { name: "계란", chance: 0.3 },
      { name: "치즈", chance: 0.15 },
    ],
    boss: [
      { name: "뼈 갈빗살", chance: 1, quantity: 2 },
      { name: "두툼 살코기", chance: 0.6 },
      { name: "치즈", chance: 0.4 },
    ],
  },
  // 설화골: the magpies drop whatever fruit they swiped off the eaves between bites; the
  // tiger spirit guards the valley's richest winter stores.
  magpie: {
    mob: [
      { name: "풋사과", chance: 0.3 },
      { name: "레몬", chance: 0.15 },
    ],
    boss: [
      { name: "두툼 살코기", chance: 1, quantity: 2 },
      { name: "뼈 갈빗살", chance: 0.6 },
      { name: "우유", chance: 0.4 },
    ],
  },
  // 설산: the rabbits carry frozen carrots down from their own stash; the ice golem has
  // been crushing whatever caravans tried to cross the mountain pass for centuries.
  snowRabbit: {
    mob: [
      { name: "당근", chance: 0.3 },
      { name: "우유", chance: 0.15 },
    ],
    boss: [
      { name: "뼈 갈빗살", chance: 1, quantity: 2 },
      { name: "두툼 살코기", chance: 0.6 },
      { name: "치즈", chance: 0.4 },
    ],
  },
  // 주막: 취한 뚱뚱냥들이 안주로 집어먹다 흘린 것들; 주모는 단골들에게만 내어주는
  // 진짜 좋은 고기와 소금을 챙겨뒀다.
  drunkCat: {
    mob: [
      { name: "겹겹 뱃살", chance: 0.3 },
      { name: "계란", chance: 0.15 },
    ],
    boss: [
      { name: "두툼 살코기", chance: 1, quantity: 2 },
      { name: "뼈 갈빗살", chance: 0.6 },
      { name: "소금 결정", chance: 0.4 },
    ],
  },
  // 진달래길: 꽃뱀이 꽃가루와 함께 핥고 다니는 봄나물; 구미호는 정자에서 나그네들에게
  // 대접하던 귀한 고기와 과실을 품고 있다.
  flowerSnake: {
    mob: [
      { name: "딜", chance: 0.3 },
      { name: "고수", chance: 0.15 },
    ],
    boss: [
      { name: "두툼 살코기", chance: 1, quantity: 2 },
      { name: "뼈 갈빗살", chance: 0.6 },
      { name: "레몬", chance: 0.4 },
    ],
  },
  // 궁궐 앞 장터: 쌀가마가 좌판에서 굴러다니며 묻혀 온 채소; 고춧가루 대감은 이름값대로
  // 고추를 잔뜩 달고 다니고, 장터 최고급 고기도 챙겨 둔다.
  riceSack: {
    mob: [
      { name: "감자", chance: 0.3 },
      { name: "양파", chance: 0.15 },
    ],
    boss: [
      { name: "불꽃 고추", chance: 1, quantity: 3 },
      { name: "화염 열매", chance: 0.6 },
      { name: "두툼 살코기", chance: 0.4 },
    ],
  },
  // 수군 포구: 고등어 떼에 섞여 올라오는 정어리와 미역; 문어 해적선장은 다리마다 노획물을
  // 감고 다닌다.
  mackerel: {
    mob: [
      { name: "정어리", chance: 0.35 },
      { name: "미역", chance: 0.15 },
    ],
    boss: [
      { name: "문어", chance: 1, quantity: 2 },
      { name: "오징어", chance: 0.6 },
      { name: "반짝 생선알", chance: 0.4 },
    ],
  },
  // 벚꽃 해변: 벚꽃 게가 모래사장에서 주워 온 조개; 벚꽃 상어는 이름 그대로 지느러미와
  // 두툼한 살을 남긴다.
  blossomCrab: {
    mob: [
      { name: "꽃게", chance: 0.3 },
      { name: "홍합", chance: 0.15 },
    ],
    boss: [
      { name: "지느러미", chance: 1, quantity: 2 },
      { name: "두툼 생선 토막", chance: 0.6 },
      { name: "게살", chance: 0.4 },
    ],
  },
  // 여우 신사: 신사 여우가 공물에서 슬쩍한 우유와 풋사과; 너구리 행상은 등짐에서 쏟아지는
  // 생선과 과일을 남긴다.
  shrineFox: {
    mob: [
      { name: "우유", chance: 0.3 },
      { name: "풋사과", chance: 0.15 },
    ],
    boss: [
      { name: "결 고운 생선살", chance: 1, quantity: 2 },
      { name: "토마토", chance: 0.6 },
      { name: "풋사과", chance: 0.4 },
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

// Food buffs that bend the roll (see BuffEffect in buffs.ts).
export type DropModifiers = {
  // Extra % on top of each entry's chance, for that item (all items + its category).
  chanceBonus?: (name: string) => number;
  // % chance each dropped item comes in twos.
  doubleChance?: number;
  // Every boss entry drops, whatever its chance.
  bossSure?: boolean;
};

export function rollDrops(kind: EnemyKind, boss: boolean, modifiers: DropModifiers = {}): { name: string; quantity: number }[] {
  return (boss ? DROPS[kind].boss : DROPS[kind].mob)
    .filter((entry) => {
      if (boss && modifiers.bossSure) return true;
      const chance = entry.chance * (1 + (modifiers.chanceBonus?.(entry.name) ?? 0) / 100);
      return Math.random() < chance;
    })
    .map((entry) => {
      const quantity = entry.quantity ?? 1;
      const doubled = Math.random() * 100 < (modifiers.doubleChance ?? 0);
      return { name: entry.name, quantity: doubled ? quantity * 2 : quantity };
    });
}
