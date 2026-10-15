import type { EnemyKind } from "../types";

type DropEntry = { name: string; chance: number; quantity?: number };

// What each monster can drop on defeat — each entry is rolled independently.
// Bosses roll their own richer table instead of the mob one. Every ingredient sold at the
// grocery drops somewhere; meats only start showing up from the farm stages onward.
const DROPS: Record<EnemyKind, { mob: DropEntry[]; boss: DropEntry[] }> = {
  // 뒷산: leafy greens and corn from the hillside.
  slime: {
    mob: [
      { name: "양배추", chance: 0.3 },
      { name: "옥수수", chance: 0.1 },
    ],
    boss: [
      { name: "양배추", chance: 1, quantity: 3 },
      { name: "옥수수", chance: 0.5 },
      { name: "버섯", chance: 0.2 },
    ],
  },
  // 버섯 늪: mushrooms, plus the swamp's onions and pumpkins.
  mushroom: {
    mob: [
      { name: "버섯", chance: 0.35 },
      { name: "양파", chance: 0.1 },
    ],
    boss: [
      { name: "버섯", chance: 1, quantity: 3 },
      { name: "양파", chance: 0.4 },
      { name: "호박", chance: 0.3 },
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
  // 꼬꼬 농장: eggs and the first meat, drumsticks.
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
  // 항구 해변: fish, and the king crab guards a richer catch.
  mudskipper: {
    mob: [
      { name: "결 고운 생선살", chance: 0.3 },
      { name: "양배추", chance: 0.1 },
    ],
    boss: [
      { name: "결 고운 생선살", chance: 1, quantity: 3 },
      { name: "뼈 갈빗살", chance: 0.4 },
      { name: "토마토", chance: 0.3 },
    ],
  },
  // 침몰선 산호초: fish meat from the shoal; the shark guards an even richer catch.
  bluefish: {
    mob: [
      { name: "결 고운 생선살", chance: 0.3 },
      { name: "치즈", chance: 0.1 },
    ],
    boss: [
      { name: "결 고운 생선살", chance: 1, quantity: 3 },
      { name: "두툼 살코기", chance: 0.4 },
      { name: "양배추", chance: 0.3 },
    ],
  },
  // 화산섬: tough cuts seared by the heat; the lava slime melts down the richest ones.
  salamander: {
    mob: [
      { name: "뼈 갈빗살", chance: 0.25 },
      { name: "호박", chance: 0.1 },
    ],
    boss: [
      { name: "뼈 갈빗살", chance: 1, quantity: 2 },
      { name: "두툼 살코기", chance: 0.5 },
      { name: "버섯", chance: 0.3 },
    ],
  },
  // 열대 정글: ripe jungle produce the monkeys hoard; the carnivorous plant has been
  // swallowing whatever richer catch wanders too close.
  monkey: {
    mob: [
      { name: "호박", chance: 0.3 },
      { name: "토마토", chance: 0.15 },
    ],
    boss: [
      { name: "호박", chance: 1, quantity: 3 },
      { name: "두툼 살코기", chance: 0.6 },
      { name: "뼈 갈빗살", chance: 0.4 },
    ],
  },
  // 오아시스: carp from the clear pool; the dragon it grew into guards the richest catch.
  carp: {
    mob: [
      { name: "결 고운 생선살", chance: 0.35 },
      { name: "우유", chance: 0.1 },
    ],
    boss: [
      { name: "결 고운 생선살", chance: 1, quantity: 4 },
      { name: "두툼 살코기", chance: 0.6 },
      { name: "치즈", chance: 0.4 },
    ],
  },
  // 사막: desert produce the cactus hoards; the camel's pack still carries its own stash
  // of milk and jerky from however long ago it left the oasis.
  cactus: {
    mob: [
      { name: "양파", chance: 0.3 },
      { name: "호박", chance: 0.15 },
    ],
    boss: [
      { name: "치즈", chance: 1, quantity: 2 },
      { name: "두툼 살코기", chance: 0.6 },
      { name: "뼈 갈빗살", chance: 0.4 },
    ],
  },
  // 사막시장: the fox snatches whatever spice jars and produce it can carry off the
  // stalls; the rattlesnake guards the market's finest smoked and cured goods.
  fox: {
    mob: [
      { name: "토마토", chance: 0.3 },
      { name: "양파", chance: 0.15 },
    ],
    boss: [
      { name: "두툼 살코기", chance: 1, quantity: 2 },
      { name: "뼈 갈빗살", chance: 0.6 },
      { name: "치즈", chance: 0.4 },
    ],
  },
};

// Every ingredient a monster can drop, mob table then boss table, for the codex.
export function getDropTable(kind: EnemyKind, boss: boolean): DropEntry[] {
  return boss ? DROPS[kind].boss : DROPS[kind].mob;
}

export function rollDrops(kind: EnemyKind, boss: boolean): { name: string; quantity: number }[] {
  return (boss ? DROPS[kind].boss : DROPS[kind].mob)
    .filter((entry) => Math.random() < entry.chance)
    .map((entry) => ({ name: entry.name, quantity: entry.quantity ?? 1 }));
}
