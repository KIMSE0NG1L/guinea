import type { EnemyKind } from "../types";

// Short battle-chatter lines shown in a speech bubble over the enemy when it spawns. Kept
// in-character with each monster's bestiary.ts trait/story — not full sentences, just a
// quick taunt or reaction, the way a monster would actually bark mid-fight.
export const MOB_LINES: Record<EnemyKind, string[]> = {
  slime: ["꾸울꺽...", "양배추는 내꺼야!"],
  mushroom: ["에취!", "포자 조심해~"],
  carrot: ["이거 내 당근인데?", "깡충깡충!"],
  chicken: ["삐약!", "아직 안 깼어!"],
  potato: ["싹 안 났어!", "어두운 게 좋아"],
  mouse: ["치즈 냄새?", "같은 설치류잖아!"],
  cauldron: ["간이 안 맞잖아", "불이 약해!"],
  mudskipper: ["진흙 맛 좀 봐라", "첨벙!"],
  bluefish: ["이 보물은 우리 거야!", "비늘 번쩍!"],
  salamander: ["뜨끈해~", "세 번은 담가야지"],
  monkey: ["껍질 조심!", "바나나 내놔"],
  carp: ["폭포 어딨어?", "점프 연습 중"],
  cactus: ["가시 조심!", "안아줄까?"],
  fox: ["싼 가게 찾았다!", "귀가 커서 다 들려"],
  lizard: ["밤이 더 따뜻해", "치즈 좀 슬쩍..."],
  mantou: ["솥에서 탈출!", "소 흘렸다!"],
  pig: ["누구냐!", "...졸리다"],
  magpie: ["곶감 내꺼!", "서리 내린다~"],
  snowRabbit: ["당근 녹기 전에!", "춥지 않아"],
};

export const BOSS_LINES: Record<EnemyKind, string[]> = {
  slime: ["내가 왕이다!", "크아, 도망쳐라!"],
  mushroom: ["늪의 주인이시다!", "다들 내 자식이야!"],
  carrot: ["내 밭에서 나가!", "쿵쿵쿵!"],
  chicken: ["삐약...아니 꼬끼오!", "큰소리 쳐볼게!"],
  potato: ["싹 나버렸다...", "밖은 위험해!"],
  mouse: ["생선은 내꺼야", "담장 넘다 걸렸넹"],
  cauldron: ["문 닫지 마!", "다 내가 먹을 거야"],
  mudskipper: ["집게 조심해!", "옆으로 걷는 게 더 빨라"],
  bluefish: ["이빨 보이지?", "보물 위에서 잘 거야"],
  salamander: ["다 녹여버린다", "식으면 안 돼!"],
  monkey: ["향긋하지?", "배부르면 뱉어줄게"],
  carp: ["용이 됐다!", "연못이 좁아"],
  cactus: ["물...물 줘...", "신기루 또 속았네"],
  fox: ["자릿세 내", "방울 소리 들리지?"],
  lizard: ["짤랑짤랑...", "동전은 내 거야"],
  mantou: ["죽순 더 줘", "배불러서 못 잡아"],
  pig: ["조용히 해라", "나도 졸린다"],
  magpie: ["감히 내 산에서", "...졸려"],
  snowRabbit: ["안 녹는다", "눈사태 조심해"],
};
