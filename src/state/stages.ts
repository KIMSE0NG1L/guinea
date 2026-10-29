import type { EnemyKind, GameState } from "../types";

// Groups stages by region/mood for BGM — several stages share one field+boss pair (see
// sound.ts's bgm lookup). Not every group has tracks yet; sound.ts falls back to
// "countryside" for any group still missing one.
export type BgmGroupId = "countryside" | "tropical" | "desert" | "china" | "korea" | "japan" | "dragonPalace" | "europe";

export const BGM_GROUP: Record<EnemyKind, BgmGroupId> = {
  // 뒷산~부잣집 주방
  slime: "countryside",
  mushroom: "countryside",
  carrot: "countryside",
  chicken: "countryside",
  potato: "countryside",
  mouse: "countryside",
  cauldron: "countryside",
  // 항구 해변~열대 정글
  mudskipper: "tropical",
  bluefish: "tropical",
  salamander: "tropical",
  monkey: "tropical",
  // 오아시스~밤의 실크로드
  carp: "desert",
  cactus: "desert",
  fox: "desert",
  lizard: "desert",
  // 죽운성~죽운성 누각
  mantou: "china",
  pig: "china",
  // 설산~수군 포구
  snowRabbit: "korea",
  magpie: "korea",
  drunkCat: "korea",
  flowerSnake: "korea",
  riceSack: "korea",
  mackerel: "korea",
  // 벚꽃 해변~대나무 닌자 마을
  blossomCrab: "japan",
  shrineFox: "japan",
  armorBeetle: "japan",
  onsenMonkey: "japan",
  ninjaFrog: "japan",
  // 용궁 가는 바닷길~용궁
  lanternAngler: "dragonPalace",
  clamMaid: "dragonPalace",
  // 운하의 미식 도시~빵집 골목
  gondolaDuck: "europe",
  bellCalf: "europe",
  croissantKid: "europe",
  sleepyGini: "europe",
  sleepwalkerGini: "europe",
};

export const ENEMY_NAME: Record<EnemyKind, string> = {
  slime: "뒷산 슬라임",
  mushroom: "습지 버섯",
  carrot: "밭 당근토끼",
  chicken: "꼬꼬알",
  potato: "꼬마감자",
  mouse: "도시 쥐",
  cauldron: "투덜이 냄비",
  mudskipper: "심술 망둥어",
  bluefish: "성난 꽁치",
  salamander: "용암 도마뱀",
  monkey: "바나숭이",
  carp: "연못 잉어",
  cactus: "꼬마 선인장",
  fox: "사막여우",
  lizard: "사막 도마뱀",
  mantou: "만두맨",
  pig: "잡졸돼지",
  magpie: "감서리 까치",
  snowRabbit: "설산토끼",
  drunkCat: "술주정 뚱뚱냥",
  flowerSnake: "꽃 뱀",
  riceSack: "심술 쌀가마",
  mackerel: "뚱한 고등어",
  blossomCrab: "벚꽃 게",
  shrineFox: "신사 여우",
  armorBeetle: "갑옷 장수풍뎅이",
  onsenMonkey: "온천 원숭이",
  ninjaFrog: "닌자 개구리",
  lanternAngler: "등롱 아귀",
  clamMaid: "조개 시녀",
  gondolaDuck: "곤돌라 오리",
  bellCalf: "방울 송아지",
  croissantKid: "크루아상 꼬마",
  sleepyGini: "꿀잠기니",
  sleepwalkerGini: "몽유병 기니",
};

export const BOSS_NAME: Record<EnemyKind, string> = {
  slime: "왕 슬라임",
  mushroom: "버섯 대왕",
  carrot: "당근 거인",
  chicken: "꼬꼬마",
  potato: "싹난감자",
  mouse: "도둑 뚱냥이",
  cauldron: "폭식 냉장고",
  mudskipper: "킹크랩",
  bluefish: "포악한 상어",
  salamander: "용암 슬라임",
  monkey: "거대식충식물",
  carp: "개천용",
  cactus: "탈수 직전 낙타",
  fox: "방울뱀",
  lizard: "귀신들린 염소",
  mantou: "죽순중독 판다",
  pig: "거북신령",
  magpie: "산군",
  snowRabbit: "얼음골렘",
  drunkCat: "주모 뚱냥",
  flowerSnake: "구미호",
  riceSack: "고춧가루 대감",
  mackerel: "문어 해적선장",
  blossomCrab: "벚꽃 상어",
  shrineFox: "너구리 행상",
  armorBeetle: "황금 샤치호코",
  onsenMonkey: "카피바라 여관 주인",
  ninjaFrog: "두루마리 쥐 두목",
  lanternAngler: "해마 장군",
  clamMaid: "용왕",
  gondolaDuck: "피자 화덕 골렘",
  bellCalf: "구조견 대장",
  croissantKid: "바게트 기사",
  sleepyGini: "장로기니",
  sleepwalkerGini: "마녀 기니",
};

// Indexed by stageNumber. Only these stages have a theme, mob, and boss implemented —
// clearing the last one's boss loops back to the first. `story` is a one-line blurb shown
// on the milestone map — what the area is plus a touch of its monster's story, not the full
// codex entry (see bestiary.ts's MOB_LORE/BOSS_LORE for that).
export const STAGES: { area: string; enemyKind: EnemyKind; story: string }[] = [
  { area: "뒷산", enemyKind: "slime", story: "비 온 다음 날이면 말랑한 슬라임들이 양배추 잎을 몰래 녹여 먹는 뒷산 풀숲." },
  { area: "버섯 늪", enemyKind: "mushroom", story: "축축한 버섯들이 느긋하게 자라나는, 포자 냄새 가득한 그늘진 늪지." },
  { area: "거대 채소 농장", enemyKind: "carrot", story: "당근과 양배추가 집채만큼 자란 농장, 토끼들이 몰래 갉아먹는 중." },
  { area: "꼬꼬 농장", enemyKind: "chicken", story: "짚더미 속 병아리들이 계란과 닭다리살을 흘리며 뛰노는 농장." },
  { area: "감자 동굴", enemyKind: "potato", story: "햇빛을 피해 싹을 틔우지 않으려는 감자들이 숨어 사는 어두운 동굴." },
  { area: "평범한 마을", enemyKind: "mouse", story: "빵집과 치즈 가게 골목을 누비는 쥐들이 활개 치는 작은 마을." },
  { area: "부잣집 주방", enemyKind: "cauldron", story: "백 년 묵은 냄비가 투덜대며 음식을 끓이는 부잣집의 거대한 주방." },
  { area: "항구 해변", enemyKind: "mudskipper", story: "망둥어가 진흙을 튀기며 뛰노는, 어부들의 활기찬 항구 해변." },
  { area: "침몰선 산호초", enemyKind: "bluefish", story: "가라앉은 보물선 주위를 꽁치 떼가 맴도는 화려한 산호초." },
  { area: "화산섬", enemyKind: "salamander", story: "식은 용암 위에서 일광욕하는 도마뱀들이 사는 뜨거운 화산섬." },
  { area: "열대 정글", enemyKind: "monkey", story: "바나나 껍질 장난이 끊이지 않는, 원숭이들의 무성한 열대 정글." },
  { area: "오아시스", enemyKind: "carp", story: "용이 되길 꿈꾸는 잉어가 매일 점프 연습을 하는 사막 한가운데 오아시스." },
  { area: "사막", enemyKind: "cactus", story: "물이 급한 낙타와 다정한 선인장들이 신기루 사이를 헤매는 사막." },
  { area: "사막시장", enemyKind: "fox", story: "흥정 소리 요란한 천막 시장, 여우들이 떨어진 물건을 주워 되파는 곳." },
  { area: "밤의 실크로드", enemyKind: "lizard", story: "달빛 아래 대상의 등불이 늘어선, 유령 들린 염소가 떠도는 밤의 사막길." },
  { area: "죽운성", enemyKind: "mantou", story: "구름에 닿은 누각과 다리 사이로, 솥에서 몰래 빠져나온 만두맨들이 돌아다니는 대나무 도시." },
  { area: "죽운성 누각", enemyKind: "pig", story: "붉은 깃발과 등불이 늘어선 달밤의 대전, 톱니 낫을 든 졸개 돼지들이 거북 신령의 궁을 지킨다." },
  { area: "설산", enemyKind: "snowRabbit", story: "달빛 아래 눈 덮인 산문, 얼음 당근 창을 든 설산토끼들이 돌사자 곁을 지나는 이들을 노린다." },
  { area: "설화골", enemyKind: "magpie", story: "눈꽃 쌓인 초가와 돌다리가 이어진 산골 마을, 감서리 까치들이 처마 밑 감을 훔쳐 달아난다." },
  { area: "주막", enemyKind: "drunkCat", story: "눈 쌓인 산길의 주막, 거나하게 취한 뚱뚱냥이들이 술독을 끌어안고 비틀대는 곳." },
  { area: "진달래길", enemyKind: "flowerSnake", story: "진달래가 흐드러지게 핀 산길, 꽃 사이에 똬리를 튼 꽃뱀 너머로 구미호가 사는 정자가 보인다." },
  { area: "궁궐 앞 장터", enemyKind: "riceSack", story: "궁궐 문 앞 너른 마당에 장이 선 날, 팔려 가기 싫은 쌀가마들이 씩씩대며 좌판 사이를 돌아다닌다." },
  { area: "수군 포구", enemyKind: "mackerel", story: "돛배가 드나드는 성곽 아래 포구, 그물을 빠져나온 고등어들이 부둣가를 뚱한 얼굴로 어슬렁거린다." },
  { area: "벚꽃 해변", enemyKind: "blossomCrab", story: "벚꽃잎이 파도에 실려 오는 섬마을 해변, 꽃잎을 등에 인 게들이 모래사장을 옆으로 옆으로 누빈다." },
  { area: "여우 신사", enemyKind: "shrineFox", story: "보름달 아래 등롱이 줄지어 밝힌 대나무 숲 신사, 여우불을 띄운 신사 여우들이 돌계단을 지킨다." },
  { area: "벚꽃 성 천수각", enemyKind: "armorBeetle", story: "노을빛에 물든 흰 성벽과 겹겹 지붕의 천수각, 갑옷을 걸친 장수풍뎅이들이 돌 마당을 순찰한다." },
  { area: "눈 내리는 온천 마을", enemyKind: "onsenMonkey", story: "함박눈이 소복이 쌓인 산속 온천 마을, 머리에 수건을 얹은 원숭이들이 김 오르는 노천탕 자리를 지킨다." },
  { area: "대나무 닌자 마을", enemyKind: "ninjaFrog", story: "안개 낀 대나무 숲 깊숙이 숨은 닌자 마을, 두건을 쓴 개구리들이 수리검을 들고 수련장을 뛰어다닌다." },
  { area: "용궁 가는 바닷길", enemyKind: "lanternAngler", story: "빛나는 산호가 길을 이루는 깊은 바닷속, 등롱을 매단 아귀들이 저 멀리 용궁으로 가는 길을 밝힌다." },
  { area: "용궁", enemyKind: "clamMaid", story: "산호 기둥과 진주 장식이 빛나는 바닷속 궁궐, 쟁반을 든 조개 시녀들이 잔칫상 사이를 바쁘게 오간다." },
  { area: "운하의 미식 도시", enemyKind: "gondolaDuck", story: "알록달록한 집들 사이로 운하가 흐르는 미식 도시, 줄무늬 셔츠를 입은 오리들이 곤돌라를 저으며 손님을 부른다." },
  { area: "알프스 목장 마을", enemyKind: "bellCalf", story: "눈 덮인 봉우리 아래 초록 목장이 펼쳐진 산골 마을, 방울을 단 송아지들이 딸랑딸랑 풀밭을 누빈다." },
  { area: "빵집 골목", enemyKind: "croissantKid", story: "갓 구운 빵 냄새가 골목을 가득 채운 돌길 거리, 베레모를 쓴 크루아상들이 진열장 앞을 뽐내며 걸어 다닌다." },
  { area: "기니 대도시", enemyKind: "sleepyGini", story: "기니들만 모여 사는 번화한 대도시, 당근 분수 광장 너머로 낮잠과 안마가 일상인 느긋한 기니들이 거리를 오간다." },
  { area: "수상한 집", enemyKind: "sleepwalkerGini", story: "달빛 아래 보랏빛 커튼이 드리운 수상한 집, 몽유병에 걸린 기니들이 밤마다 홀린 듯 계단을 오르내린다." },
];

export const LAST_STAGE_NUMBER = STAGES.length - 1;

// Stages whose boss has been beaten at least once. Saves from before this was tracked
// count every stage below the furthest one reached — those bosses had to fall to get there.
export function getClearedBosses(state: Pick<GameState, "bossesCleared" | "highestStageNumber" | "stageNumber">) {
  return state.bossesCleared ?? Array.from({ length: state.highestStageNumber ?? state.stageNumber }, (_, index) => index);
}

// Regular-mob kills needed in a stage before the boss spawns automatically.
export const STAGE_KILL_TARGET = 25;

// Un-scaled HP at stage 1 — getEnemyMaxHp below grows this per stage. The boss sits at
// 10x a regular mob, the usual range for a stage-gate boss (vs. ~30-100x for a raid-tier
// one) — enough that grinding 25 kills to reach it actually pays off in a real fight.
export const MOB_BASE_HP = 120;
export const BOSS_BASE_HP = MOB_BASE_HP * 15;

// Every stage's monsters are this many times tougher than the previous stage's.
const STAGE_HP_GROWTH = 1.8;

export function getEnemyMaxHp(stageNumber: number, boss: boolean) {
  return Math.round((boss ? BOSS_BASE_HP : MOB_BASE_HP) * STAGE_HP_GROWTH ** stageNumber);
}

export function getStageCode(stageNumber: number) {
  return `${stageNumber + 1}`;
}

// "1 뒷산" — the code plus its area name, for the battle header/stage-advance banner.
// getStageCode alone is still used for the milestone map's compact round badge, where the
// area name is already shown separately right next to it.
export function getStageLabel(stageNumber: number) {
  const area = STAGES[Math.min(stageNumber, LAST_STAGE_NUMBER)].area;
  return `${getStageCode(stageNumber)} ${area}`;
}

export function getEnemyKind(stageNumber: number): EnemyKind {
  return STAGES[Math.min(stageNumber, LAST_STAGE_NUMBER)].enemyKind;
}
