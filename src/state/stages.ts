import type { EnemyKind } from "../types";

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
];

export const LAST_STAGE_NUMBER = STAGES.length - 1;

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
