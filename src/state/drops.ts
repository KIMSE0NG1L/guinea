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
      { name: "보리", chance: 0.1 },
    ],
    boss: [
      { name: "당근", chance: 1, quantity: 4 },
      { name: "토마토", chance: 0.6 },
      { name: "호박", chance: 0.3 },
      { name: "귀리", chance: 0.4 },
    ],
  },
  // 꼬꼬 농장: eggs and drumsticks, plus the corn and grain they're fed.
  chicken: {
    mob: [
      { name: "계란", chance: 0.35 },
      { name: "통다리살", chance: 0.1 },
      { name: "조", chance: 0.15 },
    ],
    boss: [
      { name: "계란", chance: 1, quantity: 3 },
      { name: "통다리살", chance: 1, quantity: 2 },
      { name: "옥수수", chance: 0.5 },
      { name: "수수", chance: 0.5 },
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
      { name: "만두피", chance: 0.25 },
    ],
    boss: [
      { name: "죽순", chance: 1, quantity: 2 },
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
      { name: "곶감", chance: 0.2 },
      { name: "흑미", chance: 0.15 },
    ],
    boss: [
      { name: "두툼 살코기", chance: 1, quantity: 2 },
      { name: "뼈 갈빗살", chance: 0.6 },
      { name: "우유", chance: 0.4 },
      { name: "검은콩", chance: 0.5 },
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
      { name: "막걸리", chance: 0.2 },
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
      { name: "진달래꽃", chance: 0.25 },
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
      { name: "쌀", chance: 0.3 },
      { name: "찹쌀", chance: 0.15 },
      { name: "현미", chance: 0.15 },
    ],
    boss: [
      { name: "고춧가루", chance: 1, quantity: 2 },
      { name: "팥", chance: 0.5 },
      { name: "화염 열매", chance: 0.6 },
      { name: "두툼 살코기", chance: 0.4 },
    ],
  },
  // 수군 포구: 고등어 떼에 섞여 올라오는 정어리와 미역; 문어 해적선장은 다리마다 노획물을
  // 감고 다닌다.
  mackerel: {
    mob: [
      { name: "정어리", chance: 0.35 },
      { name: "고등어", chance: 0.25 },
    ],
    boss: [
      { name: "문어", chance: 1, quantity: 2 },
      { name: "먹물", chance: 0.6 },
      { name: "반짝 생선알", chance: 0.4 },
    ],
  },
  // 벚꽃 해변: 벚꽃 게가 모래사장에서 주워 온 조개; 벚꽃 상어는 이름 그대로 지느러미와
  // 두툼한 살을 남긴다.
  blossomCrab: {
    mob: [
      { name: "꽃게", chance: 0.3 },
      { name: "벚꽃잎", chance: 0.25 },
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
      { name: "유부", chance: 0.2 },
    ],
    boss: [
      { name: "결 고운 생선살", chance: 1, quantity: 2 },
      { name: "무", chance: 0.6 },
      { name: "풋사과", chance: 0.4 },
    ],
  },
  // 벚꽃 성 천수각: 장수풍뎅이 무사가 아껴 둔 젤리와 마당 버섯; 황금 샤치호코는 금빛 비늘
  // 사이에 품고 있던 생선알과 지느러미를 떨어뜨린다.
  armorBeetle: {
    mob: [
      { name: "로열 젤리", chance: 0.15 },
      { name: "버섯", chance: 0.3 },
    ],
    boss: [
      { name: "반짝 생선알", chance: 1, quantity: 2 },
      { name: "지느러미", chance: 0.6 },
      { name: "분홍 생선살", chance: 0.4 },
    ],
  },
  // 눈 내리는 온천 마을: 원숭이들이 탕에 담가 둔 온천 계란과 목욕 후 우유; 카피바라 여관
  // 주인은 유자탕에 띄우던 레몬과 여관 부엌의 계란, 치즈를 남긴다.
  onsenMonkey: {
    mob: [
      { name: "계란", chance: 0.3 },
      { name: "우유", chance: 0.15 },
    ],
    boss: [
      { name: "유자", chance: 1, quantity: 2 },
      { name: "계란", chance: 0.6 },
      { name: "치즈", chance: 0.4 },
    ],
  },
  // 대나무 닌자 마을: 닌자 개구리가 대나무 잎에서 모은 이슬과 수련장 텃밭의 양배추; 쥐 두목은
  // 패거리가 그동안 훔쳐 모은 치즈, 옥수수, 당근을 쏟아 놓는다.
  ninjaFrog: {
    mob: [
      { name: "이슬", chance: 0.2 },
      { name: "양배추", chance: 0.3 },
    ],
    boss: [
      { name: "치즈", chance: 1, quantity: 2 },
      { name: "옥수수", chance: 0.6 },
      { name: "당근", chance: 0.4 },
    ],
  },
  // 용궁 가는 바닷길: 등롱 아귀가 불빛으로 꾀어 모은 정어리와 반짝 생선알; 해마 장군은 용궁
  // 진상품으로 챙겨 가던 바닷가재와 홍합, 미역을 떨어뜨린다.
  lanternAngler: {
    mob: [
      { name: "정어리", chance: 0.3 },
      { name: "반짝 생선알", chance: 0.15 },
    ],
    boss: [
      { name: "바닷가재", chance: 1, quantity: 2 },
      { name: "홍합", chance: 0.6 },
      { name: "미역", chance: 0.4 },
    ],
  },
  // 용궁: 조개 시녀의 쟁반에서 떨어진 굴과 홍합; 용왕은 잔칫상에 올리려던 두툼한 생선 토막과
  // 꽃게, 문어를 남긴다.
  clamMaid: {
    mob: [
      { name: "굴", chance: 0.3 },
      { name: "홍합", chance: 0.15 },
    ],
    boss: [
      { name: "두툼 생선 토막", chance: 1, quantity: 2 },
      { name: "꽃게", chance: 0.6 },
      { name: "전복", chance: 0.5 },
    ],
  },
  // 운하의 미식 도시: 곤돌라 오리가 시장에서 싣고 다니는 토마토와 양파; 피자 화덕 골렘은 피자에 올리던 치즈와 토마토, 고기를 떨어뜨린다.
  gondolaDuck: {
    mob: [
      { name: "토마토", chance: 0.3 },
      { name: "양파", chance: 0.15 },
    ],
    boss: [
      { name: "치즈", chance: 1, quantity: 2 },
      { name: "토마토", chance: 0.6 },
      { name: "두툼 살코기", chance: 0.4 },
    ],
  },
  // 알프스 목장 마을: 방울 송아지가 목장에서 나눠 주는 우유와 치즈; 구조견 대장은 산장 비상식량으로 챙겨 둔 고기와 우유, 감자를 떨어뜨린다.
  bellCalf: {
    mob: [
      { name: "우유", chance: 0.3 },
      { name: "치즈", chance: 0.15 },
    ],
    boss: [
      { name: "두툼 살코기", chance: 1, quantity: 2 },
      { name: "우유", chance: 0.6 },
      { name: "감자", chance: 0.4 },
    ],
  },
  // 빵집 골목: 크루아상 꼬마가 반죽에 쓰는 계란과 우유; 바게트 기사는 빵집 창고에서 챙긴 계란과 치즈, 양파를 떨어뜨린다.
  croissantKid: {
    mob: [
      { name: "계란", chance: 0.3 },
      { name: "우유", chance: 0.15 },
    ],
    boss: [
      { name: "계란", chance: 1, quantity: 2 },
      { name: "치즈", chance: 0.6 },
      { name: "양파", chance: 0.4 },
    ],
  },
  // 포도밭 언덕: 포도송이 꼬마가 이웃 과수원에서 굴려 온 풋사과와 레몬; 올리브 나무 할아버지는 발치 텃밭의 토마토와 양파, 딜을 떨어뜨린다.
  grapeKid: {
    mob: [
      { name: "풋사과", chance: 0.3 },
      { name: "레몬", chance: 0.15 },
    ],
    boss: [
      { name: "토마토", chance: 1, quantity: 2 },
      { name: "양파", chance: 0.6 },
      { name: "딜", chance: 0.4 },
    ],
  },
  // 과자 숲: 진저브레드 꼬마가 반죽에서 슬쩍한 계란과 로열 젤리; 과자집 마녀 박쥐는 과자집을 굽던 우유와 계란, 로열 젤리를 떨어뜨린다.
  gingerbreadKid: {
    mob: [
      { name: "계란", chance: 0.3 },
      { name: "로열 젤리", chance: 0.15 },
    ],
    boss: [
      { name: "우유", chance: 1, quantity: 2 },
      { name: "계란", chance: 0.6 },
      { name: "로열 젤리", chance: 0.4 },
    ],
  },
  // 홍차 정원: 찻잔 토끼가 홍차에 타 마시는 우유와 풋사과; 티포트 공작부인은 티 테이블의 우유와 레몬, 스콘용 계란을 떨어뜨린다.
  teacupRabbit: {
    mob: [
      { name: "우유", chance: 0.3 },
      { name: "풋사과", chance: 0.15 },
    ],
    boss: [
      { name: "우유", chance: 1, quantity: 2 },
      { name: "레몬", chance: 0.6 },
      { name: "계란", chance: 0.4 },
    ],
  },
  // 소시지 축제 마을: 프레첼 꼬마가 축제 가판대에서 굴려 온 감자와 양배추; 소시지 악단장 곰은 소시지를 만들던 고기와 양파, 감자를 떨어뜨린다.
  pretzelKid: {
    mob: [
      { name: "감자", chance: 0.3 },
      { name: "양배추", chance: 0.15 },
    ],
    boss: [
      { name: "겹겹 뱃살", chance: 1, quantity: 2 },
      { name: "양파", chance: 0.6 },
      { name: "감자", chance: 0.4 },
    ],
  },
  // 피오르 어촌: 퍼핀 어부가 그물로 건져 올린 정어리와 바닷가 소금 결정; 바다코끼리 바이킹은 배에 실어 둔 생선살과 고등어, 생선알을 떨어뜨린다.
  puffinFisher: {
    mob: [
      { name: "정어리", chance: 0.3 },
      { name: "소금 결정", chance: 0.15 },
    ],
    boss: [
      { name: "결 고운 생선살", chance: 1, quantity: 2 },
      { name: "고등어", chance: 0.6 },
      { name: "반짝 생선알", chance: 0.4 },
    ],
  },
  // 북극 빙하: 아기 물범이 얻어먹고 남긴 정어리와 얼음 녹은 이슬; 북극곰 얼음낚시꾼은 양동이에 담아 둔 생선 토막과 생선살, 소금 결정을 떨어뜨린다.
  babySeal: {
    mob: [
      { name: "정어리", chance: 0.3 },
      { name: "이슬", chance: 0.15 },
    ],
    boss: [
      { name: "두툼 생선 토막", chance: 1, quantity: 2 },
      { name: "결 고운 생선살", chance: 0.6 },
      { name: "소금 결정", chance: 0.4 },
    ],
  },
  // 오로라 얼음 궁전: 눈송이 요정이 녹으며 흘린 이슬과 우유; 얼음 여왕 고양이는 빙수 재료로 아끼던 우유와 유자, 로열 젤리를 떨어뜨린다.
  snowFairy: {
    mob: [
      { name: "이슬", chance: 0.3 },
      { name: "우유", chance: 0.15 },
    ],
    boss: [
      { name: "우유", chance: 1, quantity: 2 },
      { name: "유자", chance: 0.6 },
      { name: "로열 젤리", chance: 0.4 },
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
  // Every entry drops, mob or boss, whatever its chance (셰프기니).
  allSure?: boolean;
};

export function rollDrops(kind: EnemyKind, boss: boolean, modifiers: DropModifiers = {}): { name: string; quantity: number }[] {
  return (boss ? DROPS[kind].boss : DROPS[kind].mob)
    .filter((entry) => {
      if (modifiers.allSure || (boss && modifiers.bossSure)) return true;
      const chance = entry.chance * (1 + (modifiers.chanceBonus?.(entry.name) ?? 0) / 100);
      return Math.random() < chance;
    })
    .map((entry) => {
      const quantity = entry.quantity ?? 1;
      const doubled = Math.random() * 100 < (modifiers.doubleChance ?? 0);
      return { name: entry.name, quantity: doubled ? quantity * 2 : quantity };
    });
}
