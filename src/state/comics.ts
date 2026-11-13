import { comics } from "../assets";
import type { SfxKey } from "../sound";
import { LAST_STAGE_NUMBER } from "./stages";
import { t } from "../i18n";

// Short story comics. Each panel is one picture plus the speech bubbles laid over it
// (lettering lives here rather than in the art, so it can be edited and stays crisp).
// Bubble positions are fractions of the panel; the tail points from that side toward the
// speaker, `tailAt` along the edge (0 = start, 1 = end).

export type ComicBubble = {
  text: string;
  left?: number;
  right?: number;
  top: number;
  maxWidth?: number; // fraction of the panel width
  tail: "top" | "bottom" | "left" | "right";
  tailAt: number;
  shout?: boolean; // spiky-feeling bold bubble for yelling
};

// `aspect`: the panel art's height / width (panels from one page can differ slightly).
export type ComicPanel = { image: number; aspect: number; bubbles: ComicBubble[]; sfx?: SfxKey; shake?: boolean };

export type ComicId = "opening" | "explorer" | "cookbook" | "teto" | "assassin" | "egen" | "samurai" | "harbor" | "dive" | "kite" | "snowpass" | "jungle" | "cavevillage" | "cloudpalace" | "farmchicken" | "jungleoasis" | "marketsilk" | "oasisdesert" | "slimeroad" | "swampfarm" | "snowvillage" | "tigerride" | "foxpath" | "chiliport" | "shrinesteps" | "tanukimap" | "castleonsen" | "nightthief" | "dragonroad" | "dragongate" | "whaleride" | "alpinetrain" | "sledbakery" | "ginitown" | "townasleep" | "pumpkinforest" | "beeChase" | "giniReturn" | "griffinFlight" | "ending" | "bazaarBound" | "teaTrail" | "saffronGarden" | "apprenticeGini" | "apprenticeWeak" | "apprenticeGuard" | "boxerEvolution";

// Loop-gated story beats: each fires once, in GameScreen's comic chain, the first time
// `loopsCompleted` equals `afterLoop` and (if given) `stageNumber` has passed `afterStage` —
// i.e. "that stage's (0-based) boss, cleared during that specific loop." `afterStage` omitted
// means "that loop's very last boss, whichever stage that currently is" (stays correct no
// matter how many stages get appended after today's last one). apprenticeGini is NOT here —
// it chains directly off the "ending" comic closing (see GameScreen), not off persisted state.
// Add a row for the next loop's beat here instead of wiring up another one-off effect.
export type LoopComic = { comic: ComicId; afterLoop: number; afterStage?: number };
export const LOOP_COMICS: LoopComic[] = [
  { comic: "apprenticeWeak", afterLoop: 1, afterStage: 5 }, // 평범한 마을 (stage 6): first real fight, goes badly
  { comic: "apprenticeGuard", afterLoop: 1, afterStage: 22 }, // 수군 포구 (stage 23): the rescue
  { comic: "boxerEvolution", afterLoop: 2 }, // second loop's last boss: evolves into 복서기니
];

export const COMICS: Record<ComicId, { title: string; panels: ComicPanel[] }> = {
  // Before the first battle: hay again → grandma's golden carrot → the mouse snatches it →
  // the chase up 뒷산 begins (see 설정집 "기원 스토리").
  opening: {
    title: "황금 당근 도난 사건",
    panels: [
      {
        image: comics.opening1,
        aspect: 494 / 751,
        bubbles: [{ text: "오늘도... 건초.", left: 0.04, top: 0.05, maxWidth: 0.4, tail: "bottom", tailAt: 0.7 }],
      },
      {
        image: comics.opening2,
        aspect: 494 / 751,
        sfx: "levelup",
        bubbles: [
          { text: "별똥별이 떨어진 자리에서\n자란 황금 당근이란다!", left: 0.02, top: 0.03, maxWidth: 0.5, tail: "bottom", tailAt: 0.6 },
          { text: "황, 황금 당근...!", right: 0.02, top: 0.36, maxWidth: 0.4, tail: "bottom", tailAt: 0.6 },
        ],
      },
      {
        image: comics.opening3,
        aspect: 497 / 751,
        sfx: "crit",
        shake: true,
        bubbles: [
          { text: "아—", left: 0.04, top: 0.04, maxWidth: 0.3, tail: "bottom", tailAt: 0.75 },
          { text: "이건 내가 접수한다!", right: 0.02, top: 0.6, maxWidth: 0.45, tail: "top", tailAt: 0.45 },
        ],
      },
      {
        image: comics.opening4,
        aspect: 497 / 751,
        sfx: "bossEnter",
        bubbles: [
          { text: "조심하거라~!", left: 0.02, top: 0.02, maxWidth: 0.34, tail: "bottom", tailAt: 0.3 },
          { text: "거기 서!!! 내 당근!!!", left: 0.08, top: 0.84, maxWidth: 0.55, tail: "top", tailAt: 0.45, shout: true },
        ],
      },
    ],
  },
  // Reaching stage 5 (stage 4's boss down): in the potato cave 기니 literally bumps into
  // 탐험기니, who has been chasing the same "legendary carrot" — grandma's golden carrot.
  explorer: {
    title: "동굴에서 만난 탐험기니",
    panels: [
      {
        image: comics.explorer1,
        aspect: 479 / 749,
        bubbles: [{ text: "쥐 녀석,\n이 동굴로 들어갔어...", left: 0.3, top: 0.06, maxWidth: 0.38, tail: "bottom", tailAt: 0.25 }],
      },
      {
        image: comics.explorer2,
        aspect: 479 / 749,
        sfx: "hit",
        shake: true,
        bubbles: [
          { text: "아야!", left: 0.15, top: 0.05, maxWidth: 0.2, tail: "bottom", tailAt: 0.5 },
          { text: "앗, 미안!\n지도 보느라...", right: 0.12, top: 0.04, maxWidth: 0.3, tail: "bottom", tailAt: 0.45 },
        ],
      },
      {
        image: comics.explorer3,
        aspect: 512 / 749,
        sfx: "levelup",
        bubbles: [
          { text: "난 별똥별 당근,\n전설의 당근을 찾고 있어!", right: 0.01, top: 0.03, maxWidth: 0.45, tail: "bottom", tailAt: 0.55 },
          { text: "그거... 우리\n할머니 당근인데?!", left: 0.02, top: 0.03, maxWidth: 0.4, tail: "bottom", tailAt: 0.6 },
        ],
      },
      {
        image: comics.explorer4,
        aspect: 512 / 749,
        sfx: "bossEnter",
        bubbles: [
          { text: "그럼 같이 찾자!\n길은 내가 알아!", left: 0.42, top: 0.03, maxWidth: 0.42, tail: "bottom", tailAt: 0.2 },
          { text: "좋아, 가자!", left: 0.03, top: 0.8, maxWidth: 0.3, tail: "top", tailAt: 0.7, shout: true },
        ],
      },
    ],
  },
  // Stage 6's boss (도둑 뚱냥이) falls for the first time: the golden carrot is back, and
  // beside the loot lies 《세상의 모든 맛》 — the cookbook the rest of the journey is for.
  cookbook: {
    title: "되찾은 당근, 낡은 요리책",
    panels: [
      {
        image: comics.cookbook1,
        aspect: 479 / 746,
        sfx: "hit",
        bubbles: [
          { text: "드디어 찾았다!", left: 0.03, top: 0.4, maxWidth: 0.34, tail: "bottom", tailAt: 0.6 },
          { text: "히익!", left: 0.53, top: 0.4, maxWidth: 0.2, tail: "bottom", tailAt: 0.7 },
          { text: "어, 어떻게 여기까지...!", right: 0.01, top: 0.17, maxWidth: 0.34, tail: "bottom", tailAt: 0.6 },
        ],
      },
      {
        image: comics.cookbook2,
        aspect: 479 / 749,
        sfx: "levelup",
        bubbles: [{ text: "내 황금 당근...!\n다시는 안 놓칠 거야.", left: 0.28, top: 0.04, maxWidth: 0.42, tail: "bottom", tailAt: 0.8 }],
      },
      {
        image: comics.cookbook3,
        aspect: 512 / 746,
        sfx: "uiToggle",
        bubbles: [{ text: "이건... 요리책?", right: 0.02, top: 0.04, maxWidth: 0.34, tail: "left", tailAt: 0.7 }],
      },
      {
        image: comics.cookbook4,
        aspect: 512 / 749,
        sfx: "cookDone",
        bubbles: [
          { text: "《세상의 모든 맛》...", left: 0.3, top: 0.03, maxWidth: 0.45, tail: "bottom", tailAt: 0.35 },
          { text: "이 책에 있는 요리,\n전부 먹어볼 테야!", left: 0.2, top: 0.82, maxWidth: 0.6, tail: "top", tailAt: 0.45, shout: true },
        ],
      },
    ],
  },
  // Reaching stage 10 (stage 9's boss down): on the volcano island a sunglassed strongman
  // lifts boulders — and whiffs his punches, the sunglasses being far too dark (테토기니's
  // 40% miss in battle). The carrot is already back by now (stage 6), so it's 탐험기니's map
  // of the cookbook's ingredients — and its meat dishes — that win him over.
  teto: {
    title: "화산섬의 선글라스 헬창",
    panels: [
      {
        image: comics.teto1,
        aspect: 490 / 750,
        bubbles: [
          { text: "저기 누가 있어!", left: 0.02, top: 0.08, maxWidth: 0.32, tail: "bottom", tailAt: 0.65 },
          { text: "여기가 화산섬...\n덥다 더워.", left: 0.38, top: 0.1, maxWidth: 0.36, tail: "bottom", tailAt: 0.5 },
        ],
      },
      {
        image: comics.teto2,
        aspect: 490 / 750,
        sfx: "levelup",
        bubbles: [
          { text: "후읍! 오늘의\n바위 들기 백 번째!", right: 0.01, top: 0.3, maxWidth: 0.3, tail: "left", tailAt: 0.5 },
          { text: "바, 바위를...?!", left: 0.02, top: 0.32, maxWidth: 0.28, tail: "bottom", tailAt: 0.5 },
        ],
      },
      {
        image: comics.teto3,
        aspect: 504 / 750,
        sfx: "crit",
        shake: true,
        bubbles: [
          { text: "봤냐, 이 펀치!", left: 0.02, top: 0.03, maxWidth: 0.3, tail: "bottom", tailAt: 0.8 },
          { text: "...안\n맞았는데.", left: 0.0, top: 0.43, maxWidth: 0.22, tail: "bottom", tailAt: 0.5 },
        ],
      },
      {
        image: comics.teto4,
        aspect: 504 / 750,
        sfx: "bossEnter",
        bubbles: [
          { text: "요리책 재료 지도라고?\n고기 요리도 있겠군. 나도 간다!", left: 0.02, top: 0.03, maxWidth: 0.47, tail: "bottom", tailAt: 0.35, shout: true },
          { text: "근육보다 입맛이\n먼저구나...", right: 0.02, top: 0.03, maxWidth: 0.36, tail: "bottom", tailAt: 0.1 },
        ],
      },
    ],
  },
  // Reaching stage 14 (stage 13's boss down): a desert-market fox goes for the cookbook and
  // a hooded figure cuts it free with two strikes in one (암살기니's double hit). Then the
  // open book's dishes make the assassin's stomach growl — and that settles it.
  assassin: {
    title: "사막시장의 그림자",
    panels: [
      {
        image: comics.assassin1,
        aspect: 498 / 753,
        bubbles: [
          { text: "향신료 냄새 좋다~", left: 0.02, top: 0.38, maxWidth: 0.32, tail: "bottom", tailAt: 0.6 },
          { text: "이 책,\n값 좀 나가겠는걸?", right: 0.01, top: 0.84, maxWidth: 0.4, tail: "top", tailAt: 0.3 },
        ],
      },
      {
        image: comics.assassin2,
        aspect: 498 / 754,
        sfx: "crit",
        shake: true,
        bubbles: [{ text: "히익?!", right: 0.02, top: 0.45, maxWidth: 0.2, tail: "bottom", tailAt: 0.5 }],
      },
      {
        image: comics.assassin3,
        aspect: 499 / 753,
        sfx: "uiToggle",
        bubbles: [
          { text: "소중한 건\n꼭 쥐고 다녀.", right: 0.02, top: 0.06, maxWidth: 0.32, tail: "left", tailAt: 0.5 },
          { text: "방금... 두 번\n벤 거야?!", right: 0.0, top: 0.53, maxWidth: 0.3, tail: "bottom", tailAt: 0.15, shout: true },
        ],
      },
      {
        image: comics.assassin4,
        aspect: 499 / 754,
        sfx: "cookDone",
        bubbles: [
          { text: "꼬르륵~", left: 0.62, top: 0.6, maxWidth: 0.24, tail: "top", tailAt: 0.2, shout: true },
          { text: "...배고파?", left: 0.2, top: 0.02, maxWidth: 0.25, tail: "bottom", tailAt: 0.5 },
          { text: "...이 요리,\n먹어보고 싶어.", left: 0.47, top: 0.02, maxWidth: 0.34, tail: "bottom", tailAt: 0.3 },
        ],
      },
    ],
  },
  // Reaching stage 21 (stage 20's tavern boss down): the worn-out party drags itself up the
  // azalea path; 에겐기니 sweeps them back to life with a flower breeze (her skill cooldown
  // cut) and shares azalea pancakes. A nine-tailed silhouette watches from the pavilion —
  // stage 21's boss, 구미호.
  egen: {
    title: "진달래길의 꽃바람",
    panels: [
      {
        image: comics.egen1,
        aspect: 498 / 752,
        bubbles: [
          { text: "주막에서\n너무 놀았어...", right: 0.02, top: 0.04, maxWidth: 0.34, tail: "bottom", tailAt: 0.1 },
          { text: "다리가\n안 움직여...", left: 0.3, top: 0.28, maxWidth: 0.26, tail: "bottom", tailAt: 0.4 },
        ],
      },
      {
        image: comics.egen2,
        aspect: 498 / 752,
        sfx: "levelup",
        bubbles: [{ text: "어머,\n다들 많이 지쳤구나.", left: 0.02, top: 0.04, maxWidth: 0.36, tail: "right", tailAt: 0.6 }],
      },
      {
        image: comics.egen3,
        aspect: 498 / 752,
        sfx: "cookDone",
        bubbles: [
          { text: "꽃바람 한 번이면\n괜찮아질 거야.", right: 0.02, top: 0.03, maxWidth: 0.36, tail: "left", tailAt: 0.6 },
          { text: "몸이 가벼워졌어!", left: 0.2, top: 0.86, maxWidth: 0.36, tail: "top", tailAt: 0.2, shout: true },
        ],
      },
      {
        image: comics.egen4,
        aspect: 498 / 752,
        bubbles: [
          { text: "진달래 화전이야.\n같이 먹고 가~", left: 0.3, top: 0.02, maxWidth: 0.36, tail: "bottom", tailAt: 0.55 },
          { text: "맛있다!\n우리랑 같이 가자!", left: 0.01, top: 0.84, maxWidth: 0.36, tail: "top", tailAt: 0.25 },
        ],
      },
    ],
  },
  // Reaching stage 24 (stage 23's pirate-octopus boss down): the party sails to the cherry
  // blossom island and is mobbed by blossom crabs on landing; a silent wandering samurai
  // clears the beach in one draw (사무라이기니's opening strike), then his stomach gives him
  // away — tuna sashimi, his partner dish, wins him over.
  samurai: {
    title: "벚꽃 해변의 떠돌이 무사",
    panels: [
      {
        image: comics.samurai1,
        aspect: 512 / 768,
        sfx: "bossEnter",
        bubbles: [
          { text: "섬에 오자마자\n이게 뭐야?!", left: 0.06, top: 0.22, maxWidth: 0.32, tail: "bottom", tailAt: 0.6 },
          { text: "옆으로 옆으로~", right: 0.02, top: 0.4, maxWidth: 0.3, tail: "bottom", tailAt: 0.6 },
        ],
      },
      {
        image: comics.samurai2,
        aspect: 512 / 768,
        bubbles: [{ text: "......", left: 0.34, top: 0.34, maxWidth: 0.2, tail: "left", tailAt: 0.6 }],
      },
      {
        image: comics.samurai3,
        aspect: 512 / 768,
        sfx: "crit",
        shake: true,
        bubbles: [
          { text: "착—", right: 0.08, top: 0.08, maxWidth: 0.2, tail: "bottom", tailAt: 0.3, shout: true },
          { text: "한 칼에...?!", left: 0.02, top: 0.36, maxWidth: 0.3, tail: "bottom", tailAt: 0.3 },
        ],
      },
      {
        image: comics.samurai4,
        aspect: 512 / 768,
        sfx: "cookDone",
        bubbles: [
          { text: "배고프지?\n참치 회 먹을래?", left: 0.3, top: 0.08, maxWidth: 0.34, tail: "bottom", tailAt: 0.55 },
          { text: "...신세 지겠소.", right: 0.02, top: 0.14, maxWidth: 0.3, tail: "bottom", tailAt: 0.55 },
          { text: "꼬르륵", left: 0.52, top: 0.5, maxWidth: 0.16, tail: "right", tailAt: 0.6 },
        ],
      },
    ],
  },
  // Reaching stage 8 (stage 7's 폭식 냉장고 down): the fridge is bare but for a fish
  // delivery slip, the cookbook opens on its seafood pages, and a pelican's delivery cart
  // runs the pair down to the harbor beach.
  harbor: {
    title: "생선 배달 수레를 타고",
    panels: [
      {
        image: comics.harbor1,
        aspect: 512 / 768,
        sfx: "hit",
        bubbles: [
          { text: "냉장고가...\n텅 비었어?", left: 0.02, top: 0.08, maxWidth: 0.3, tail: "bottom", tailAt: 0.4 },
          { text: "쪽지가 있어!\n생선 그림이네?", left: 0.36, top: 0.04, maxWidth: 0.32, tail: "bottom", tailAt: 0.2 },
        ],
      },
      {
        image: comics.harbor2,
        aspect: 512 / 768,
        sfx: "levelup",
        bubbles: [
          { text: "꽃게, 조개, 생선구이...!", left: 0.02, top: 0.04, maxWidth: 0.4, tail: "bottom", tailAt: 0.5 },
          { text: "요리책에\n바다 요리가 있어!", right: 0.02, top: 0.04, maxWidth: 0.34, tail: "bottom", tailAt: 0.5 },
        ],
      },
      {
        image: comics.harbor3,
        aspect: 512 / 768,
        bubbles: [
          { text: "항구까지 배달 갑니다~", right: 0.02, top: 0.08, maxWidth: 0.36, tail: "bottom", tailAt: 0.4 },
          { text: "꽉 잡아!", left: 0.06, top: 0.06, maxWidth: 0.24, tail: "bottom", tailAt: 0.7 },
        ],
      },
      {
        image: comics.harbor4,
        aspect: 512 / 768,
        sfx: "bossEnter",
        bubbles: [
          { text: "바다다!!!", left: 0.24, top: 0.06, maxWidth: 0.28, tail: "bottom", tailAt: 0.4, shout: true },
          { text: "해산물 잔뜩 모으자!", right: 0.04, top: 0.22, maxWidth: 0.32, tail: "bottom", tailAt: 0.3 },
        ],
      },
    ],
  },
  // Reaching stage 9 (stage 8's 킹크랩 down): a grateful sea turtle, 탐험기니's map of a
  // sunken ship, bubble helmets, and a dive down to the coral reef.
  dive: {
    title: "거북 등을 타고 바닷속으로",
    panels: [
      {
        image: comics.dive1,
        aspect: 512 / 768,
        sfx: "hit",
        bubbles: [
          { text: "고마워, 꼬마들.\n그 게가 내 해초밭을\n다 뜯어 먹었거든.", right: 0.02, top: 0.04, maxWidth: 0.36, tail: "bottom", tailAt: 0.6 },
        ],
      },
      {
        image: comics.dive2,
        aspect: 512 / 768,
        bubbles: [
          { text: "지도에 침몰선이 있어!", left: 0.02, top: 0.06, maxWidth: 0.34, tail: "bottom", tailAt: 0.5 },
          { text: "근데 우리...\n수영 못하잖아?", right: 0.04, top: 0.08, maxWidth: 0.3, tail: "bottom", tailAt: 0.4 },
        ],
      },
      {
        image: comics.dive3,
        aspect: 512 / 768,
        sfx: "uiToggle",
        bubbles: [
          { text: "등에 꽉 붙어 있으렴!", right: 0.04, top: 0.08, maxWidth: 0.34, tail: "bottom", tailAt: 0.3 },
          { text: "뽀글뽀글...", left: 0.06, top: 0.06, maxWidth: 0.24, tail: "bottom", tailAt: 0.7 },
        ],
      },
      {
        image: comics.dive4,
        aspect: 512 / 768,
        sfx: "levelup",
        bubbles: [
          { text: "보물선이다...!", right: 0.06, top: 0.06, maxWidth: 0.28, tail: "bottom", tailAt: 0.3 },
          { text: "생선이 이렇게 많다니!", left: 0.04, top: 0.06, maxWidth: 0.34, tail: "bottom", tailAt: 0.7 },
        ],
      },
    ],
  },
  // Reaching stage 16 (stage 15's 귀신들린 염소 down): a city on the clouds glimpsed over the
  // night dunes; a camel kite-maker lends his dragon kite and the desert wind does the rest.
  kite: {
    title: "용 연을 타고 구름 위로",
    panels: [
      {
        image: comics.kite1,
        aspect: 512 / 768,
        sfx: "hit",
        bubbles: [
          { text: "저기... 구름 위에\n도시가 있어?!", left: 0.02, top: 0.34, maxWidth: 0.3, tail: "bottom", tailAt: 0.3 },
          { text: "저길 어떻게 가냐.", left: 0.36, top: 0.04, maxWidth: 0.28, tail: "bottom", tailAt: 0.1 },
        ],
      },
      {
        image: comics.kite2,
        aspect: 512 / 768,
        sfx: "levelup",
        bubbles: [
          { text: "내 용 연을 빌려주마.\n바람 좋은 밤이야.", right: 0.02, top: 0.04, maxWidth: 0.36, tail: "bottom", tailAt: 0.5 },
          { text: "우와...!", left: 0.04, top: 0.4, maxWidth: 0.2, tail: "bottom", tailAt: 0.5 },
        ],
      },
      {
        image: comics.kite3,
        aspect: 512 / 768,
        sfx: "bossEnter",
        shake: true,
        bubbles: [
          { text: "으아아 높아!!!", left: 0.02, top: 0.06, maxWidth: 0.3, tail: "right", tailAt: 0.6, shout: true },
          { text: "야호~!", left: 0.3, top: 0.62, maxWidth: 0.2, tail: "top", tailAt: 0.7 },
        ],
      },
      {
        image: comics.kite4,
        aspect: 512 / 768,
        bubbles: [
          { text: "여기가 죽운성...!", left: 0.02, top: 0.08, maxWidth: 0.3, tail: "bottom", tailAt: 0.6 },
          { text: "...구름 위에 성이라니.", right: 0.04, top: 0.36, maxWidth: 0.34, tail: "bottom", tailAt: 0.2 },
        ],
      },
    ],
  },
  // Reaching stage 18 (stage 17's 죽순중독 판다 down): down the cloud stairs into a blizzard —
  // 테토기니's sunglasses frost over — until a badger peddler hands out knitted hats for
  // the snowy pass.
  snowpass: {
    title: "눈보라 고개를 넘어",
    panels: [
      {
        image: comics.snowpass1,
        aspect: 512 / 768,
        sfx: "hit",
        bubbles: [
          { text: "이제 내려가자!", left: 0.3, top: 0.04, maxWidth: 0.28, tail: "bottom", tailAt: 0.2 },
          { text: "계단 끝이\n안 보이는데...", right: 0.04, top: 0.04, maxWidth: 0.28, tail: "bottom", tailAt: 0.1 },
        ],
      },
      {
        image: comics.snowpass2,
        aspect: 512 / 768,
        sfx: "bossEnter",
        shake: true,
        bubbles: [
          { text: "아, 앞이 안 보여...!", left: 0.4, top: 0.06, maxWidth: 0.32, tail: "bottom", tailAt: 0.5, shout: true },
          { text: "추, 추워...!", left: 0.02, top: 0.34, maxWidth: 0.24, tail: "bottom", tailAt: 0.4 },
        ],
      },
      {
        image: comics.snowpass3,
        aspect: 512 / 768,
        sfx: "cookDone",
        bubbles: [
          { text: "고개 넘으려면\n이거 쓰고 가거라.", left: 0.5, top: 0.02, maxWidth: 0.32, tail: "left", tailAt: 0.6 },
          { text: "...좀 작은데.", left: 0.44, top: 0.86, maxWidth: 0.24, tail: "top", tailAt: 0.5 },
        ],
      },
      {
        image: comics.snowpass4,
        aspect: 512 / 768,
        bubbles: [
          { text: "저 산문 너머가\n설산이야!", left: 0.04, top: 0.06, maxWidth: 0.3, tail: "bottom", tailAt: 0.6 },
          { text: "가자!", left: 0.56, top: 0.28, maxWidth: 0.18, tail: "bottom", tailAt: 0.4, shout: true },
        ],
      },
    ],
  },
  // Reaching stage 11 (stage 10's 용암 슬라임 down): the volcano blows, 테토기니 shoulders a
  // whole raft's worth of palm logs, a giant wave carries them off, and they wash up on the
  // jungle beach — straight into the monkeys' banana-peel pranks.
  jungle: {
    title: "화산섬 탈출",
    panels: [
      {
        image: comics.jungle1,
        aspect: 512 / 768,
        sfx: "bossEnter",
        shake: true,
        bubbles: [
          { text: "화, 화산이 터진다!", left: 0.02, top: 0.3, maxWidth: 0.3, tail: "bottom", tailAt: 0.3, shout: true },
          { text: "섬을 빠져나가야 해!", left: 0.3, top: 0.04, maxWidth: 0.3, tail: "bottom", tailAt: 0.3 },
        ],
      },
      {
        image: comics.jungle2,
        aspect: 512 / 768,
        sfx: "hit",
        bubbles: [
          { text: "뗏목? 금방이지.", left: 0.3, top: 0.03, maxWidth: 0.28, tail: "bottom", tailAt: 0.8 },
          { text: "통나무를...\n한 손으로?!", left: 0.02, top: 0.3, maxWidth: 0.28, tail: "bottom", tailAt: 0.5 },
        ],
      },
      {
        image: comics.jungle3,
        aspect: 512 / 768,
        sfx: "crit",
        shake: true,
        bubbles: [
          { text: "요리책만은\n못 놓쳐!", left: 0.02, top: 0.04, maxWidth: 0.28, tail: "bottom", tailAt: 0.4 },
          { text: "노 저어!!!", left: 0.5, top: 0.06, maxWidth: 0.24, tail: "bottom", tailAt: 0.3, shout: true },
        ],
      },
      {
        image: comics.jungle4,
        aspect: 512 / 768,
        sfx: "uiToggle",
        bubbles: [
          { text: "끼끼끽!", left: 0.3, top: 0.05, maxWidth: 0.2, tail: "left", tailAt: 0.6 },
          { text: "...여긴 또 어디야.", left: 0.34, top: 0.44, maxWidth: 0.3, tail: "left", tailAt: 0.7 },
        ],
      },
    ],
  },
  cavevillage: {
    title: "동굴 밖 마을로",
    panels: [
      {
        image: comics.cavevillage1,
        aspect: 502 / 768,
        sfx: "hit",
        bubbles: [
          { text: "출구는 이쪽이야!", left: 0.3, top: 0.1, maxWidth: 0.4, tail: "bottom", tailAt: 0.35 },
        ],
      },
      {
        image: comics.cavevillage2,
        aspect: 502 / 768,
        bubbles: [
          { text: "눈부셔...!", left: 0.05, top: 0.15, maxWidth: 0.3, tail: "bottom", tailAt: 0.5 },
        ],
      },
      {
        image: comics.cavevillage3,
        aspect: 501 / 768,
        bubbles: [
          { text: "밀가루에\n쥐 발자국!", left: 0.02, top: 0.1, maxWidth: 0.34, tail: "bottom", tailAt: 0.5 },
        ],
      },
      {
        image: comics.cavevillage4,
        aspect: 501 / 768,
        sfx: "levelup",
        bubbles: [
          { text: "빵 냄새...", left: 0.3, top: 0.06, maxWidth: 0.28, tail: "bottom", tailAt: 0.4 },
          { text: "쥐부터 잡자고!", right: 0.02, top: 0.04, maxWidth: 0.32, tail: "bottom", tailAt: 0.6 },
        ],
      },
    ],
  },
  cloudpalace: {
    title: "판다와 죽순 만두",
    panels: [
      {
        image: comics.cloudpalace1,
        aspect: 503 / 768,
        sfx: "hit",
        bubbles: [
          { text: "죽순...\n내 죽순...", left: 0.4, top: 0.12, maxWidth: 0.3, tail: "bottom", tailAt: 0.4 },
        ],
      },
      {
        image: comics.cloudpalace2,
        aspect: 504 / 768,
        bubbles: [
          { text: "같이 먹자!", left: 0.02, top: 0.1, maxWidth: 0.28, tail: "bottom", tailAt: 0.5 },
        ],
      },
      {
        image: comics.cloudpalace3,
        aspect: 505 / 768,
        bubbles: [
          { text: "누각에\n거북신령님이 계시지.", right: 0.03, top: 0.05, maxWidth: 0.4, tail: "left", tailAt: 0.8 },
        ],
      },
      {
        image: comics.cloudpalace4,
        aspect: 506 / 768,
        sfx: "levelup",
        bubbles: [
          { text: "계단이...\n끝이 없다.", left: 0.02, top: 0.3, maxWidth: 0.28, tail: "bottom", tailAt: 0.5 },
        ],
      },
    ],
  },
  farmchicken: {
    title: "당근 거인의 길 안내",
    panels: [
      {
        image: comics.farmchicken1,
        aspect: 503 / 768,
        sfx: "hit",
        bubbles: [
          { text: "미안하다, 꼬마야...", right: 0.03, top: 0.03, maxWidth: 0.4, tail: "bottom", tailAt: 0.4 },
          { text: "쥐 못 봤어?", left: 0.03, top: 0.3, maxWidth: 0.3, tail: "bottom", tailAt: 0.5 },
        ],
      },
      {
        image: comics.farmchicken2,
        aspect: 502 / 768,
        bubbles: [
          { text: "쥐라면\n저 닭장 쪽으로 갔다.", left: 0.02, top: 0.03, maxWidth: 0.4, tail: "bottom", tailAt: 0.6 },
        ],
      },
      {
        image: comics.farmchicken3,
        aspect: 500 / 768,
        bubbles: [
          { text: "쉿...\n조용히...", left: 0.45, top: 0.25, maxWidth: 0.26, tail: "bottom", tailAt: 0.5 },
        ],
      },
      {
        image: comics.farmchicken4,
        aspect: 500 / 768,
        sfx: "levelup",
        bubbles: [
          { text: "꼬꼬꼬꼬!", left: 0.02, top: 0.03, maxWidth: 0.28, tail: "bottom", tailAt: 0.6 },
          { text: "으아,\n왜 나만!", right: 0.03, top: 0.03, maxWidth: 0.28, tail: "bottom", tailAt: 0.3 },
        ],
      },
    ],
  },
  jungleoasis: {
    title: "정글 끝의 물웅덩이",
    panels: [
      {
        image: comics.jungleoasis1,
        aspect: 501 / 768,
        sfx: "hit",
        bubbles: [
          { text: "...다시는\n안 들어가.", left: 0.3, top: 0.1, maxWidth: 0.32, tail: "bottom", tailAt: 0.5 },
        ],
      },
      {
        image: comics.jungleoasis2,
        aspect: 502 / 768,
        bubbles: [
          { text: "정글이\n끝나 간다...", left: 0.3, top: 0.1, maxWidth: 0.32, tail: "bottom", tailAt: 0.4 },
          { text: "더워...", left: 0.02, top: 0.3, maxWidth: 0.2, tail: "bottom", tailAt: 0.5 },
        ],
      },
      {
        image: comics.jungleoasis3,
        aspect: 501 / 768,
        bubbles: [
          { text: "물... 물...", left: 0.55, top: 0.2, maxWidth: 0.24, tail: "bottom", tailAt: 0.7 },
        ],
      },
      {
        image: comics.jungleoasis4,
        aspect: 501 / 768,
        sfx: "levelup",
        bubbles: [
          { text: "오아시스다!!!", left: 0.1, top: 0.06, maxWidth: 0.4, tail: "bottom", tailAt: 0.3, shout: true },
        ],
      },
    ],
  },
  marketsilk: {
    title: "방울뱀과 대상 행렬",
    panels: [
      {
        image: comics.marketsilk1,
        aspect: 504 / 768,
        sfx: "hit",
        bubbles: [
          { text: "내 방울이...", left: 0.45, top: 0.04, maxWidth: 0.3, tail: "bottom", tailAt: 0.5 },
        ],
      },
      {
        image: comics.marketsilk2,
        aspect: 505 / 768,
        bubbles: [
          { text: "밤길은 위험하니\n같이 가세.", left: 0.25, top: 0.05, maxWidth: 0.36, tail: "right", tailAt: 0.7 },
        ],
      },
      {
        image: comics.marketsilk3,
        aspect: 504 / 768,
        bubbles: [
          { text: "낙타가...\n작다.", left: 0.45, top: 0.05, maxWidth: 0.26, tail: "bottom", tailAt: 0.5 },
        ],
      },
      {
        image: comics.marketsilk4,
        aspect: 505 / 768,
        sfx: "levelup",
        bubbles: [
          { text: "밤엔 귀신이\n나온대...", left: 0.18, top: 0.05, maxWidth: 0.34, tail: "bottom", tailAt: 0.5 },
          { text: "히익!", left: 0.01, top: 0.22, maxWidth: 0.16, tail: "bottom", tailAt: 0.4 },
        ],
      },
    ],
  },
  oasisdesert: {
    title: "잉어의 선물",
    panels: [
      {
        image: comics.oasisdesert1,
        aspect: 503 / 768,
        sfx: "hit",
        bubbles: [
          { text: "용이 되는 건...\n내년에.", right: 0.03, top: 0.1, maxWidth: 0.38, tail: "bottom", tailAt: 0.5 },
        ],
      },
      {
        image: comics.oasisdesert2,
        aspect: 504 / 768,
        bubbles: [
          { text: "사막을 건너려면\n가져가거라.", right: 0.03, top: 0.03, maxWidth: 0.4, tail: "bottom", tailAt: 0.5 },
        ],
      },
      {
        image: comics.oasisdesert3,
        aspect: 508 / 768,
        bubbles: [
          { text: "물은\n내가 든다.", left: 0.02, top: 0.1, maxWidth: 0.26, tail: "right", tailAt: 0.6 },
        ],
      },
      {
        image: comics.oasisdesert4,
        aspect: 509 / 768,
        sfx: "levelup",
        bubbles: [
          { text: "사막 시장까지\n가 보자!", left: 0.03, top: 0.08, maxWidth: 0.4, tail: "bottom", tailAt: 0.7 },
        ],
      },
    ],
  },
  slimeroad: {
    title: "쥐를 쫓아 숲속으로",
    panels: [
      {
        image: comics.slimeroad1,
        aspect: 507 / 768,
        sfx: "hit",
        bubbles: [
          { text: "왕관은 됐고...\n쥐는 어디 갔지?", left: 0.04, top: 0.12, maxWidth: 0.4, tail: "bottom", tailAt: 0.3 },
        ],
      },
      {
        image: comics.slimeroad2,
        aspect: 507 / 768,
        bubbles: [
          { text: "발자국이 이쪽으로...", left: 0.08, top: 0.22, maxWidth: 0.36, tail: "bottom", tailAt: 0.35 },
        ],
      },
      {
        image: comics.slimeroad3,
        aspect: 502 / 768,
        bubbles: [
          { text: "으앗, 미끄러워!", right: 0.03, top: 0.06, maxWidth: 0.3, tail: "left", tailAt: 0.7 },
        ],
      },
      {
        image: comics.slimeroad4,
        aspect: 502 / 768,
        sfx: "levelup",
        bubbles: [
          { text: "여긴... 버섯 늪?", left: 0.03, top: 0.05, maxWidth: 0.34, tail: "bottom", tailAt: 0.8 },
          { text: "누구냐!", right: 0.03, top: 0.08, maxWidth: 0.2, tail: "bottom", tailAt: 0.4 },
        ],
      },
    ],
  },
  swampfarm: {
    title: "늪을 빠져나오니",
    panels: [
      {
        image: comics.swampfarm1,
        aspect: 492 / 768,
        sfx: "hit",
        bubbles: [
          { text: "에, 에취!", left: 0.02, top: 0.05, maxWidth: 0.3, tail: "bottom", tailAt: 0.4 },
        ],
      },
      {
        image: comics.swampfarm2,
        aspect: 494 / 768,
        bubbles: [
          { text: "저기다!\n황금 당근!", left: 0.03, top: 0.12, maxWidth: 0.34, tail: "bottom", tailAt: 0.4 },
        ],
      },
      {
        image: comics.swampfarm3,
        aspect: 511 / 768,
        bubbles: [
          { text: "헉... 헉...\n너무 빨라...", left: 0.03, top: 0.1, maxWidth: 0.34, tail: "bottom", tailAt: 0.5 },
        ],
      },
      {
        image: comics.swampfarm4,
        aspect: 511 / 768,
        sfx: "levelup",
        bubbles: [
          { text: "당근이...\n집채만 해!", left: 0.03, top: 0.05, maxWidth: 0.34, tail: "bottom", tailAt: 0.3 },
        ],
      },
    ],
  },
  snowvillage: {
    title: "얼음골렘과 따끈한 국물",
    panels: [
      {
        image: comics.snowvillage1,
        aspect: 499 / 768,
        sfx: "hit",
        bubbles: [
          { text: "춥다...\n나도 춥다...", left: 0.35, top: 0.1, maxWidth: 0.3, tail: "bottom", tailAt: 0.5 },
        ],
      },
      {
        image: comics.snowvillage2,
        aspect: 501 / 768,
        bubbles: [
          { text: "따끈한\n국물이야!", left: 0.02, top: 0.2, maxWidth: 0.3, tail: "bottom", tailAt: 0.3 },
        ],
      },
      {
        image: comics.snowvillage3,
        aspect: 503 / 768,
        bubbles: [
          { text: "저 아래 마을...\n감이 달다.", left: 0.3, top: 0.04, maxWidth: 0.36, tail: "left", tailAt: 0.7 },
        ],
      },
      {
        image: comics.snowvillage4,
        aspect: 503 / 768,
        sfx: "levelup",
        bubbles: [
          { text: "야호~!", left: 0.08, top: 0.06, maxWidth: 0.22, tail: "bottom", tailAt: 0.8 },
          { text: "멈춰!!!", right: 0.05, top: 0.08, maxWidth: 0.22, tail: "left", tailAt: 0.7, shout: true },
        ],
      },
    ],
  },
  tigerride: {
    title: "산군의 밤길",
    panels: [
      {
        image: comics.tigerride1,
        aspect: 507 / 768,
        sfx: "hit",
        bubbles: [
          { text: "허허,\n제법이구나.", left: 0.45, top: 0.06, maxWidth: 0.3, tail: "bottom", tailAt: 0.4 },
        ],
      },
      {
        image: comics.tigerride2,
        aspect: 507 / 768,
        bubbles: [
          { text: "밤길은\n내가 데려다주마.", left: 0.02, top: 0.1, maxWidth: 0.32, tail: "bottom", tailAt: 0.5 },
        ],
      },
      {
        image: comics.tigerride3,
        aspect: 507 / 768,
        bubbles: [
          { text: "모자,\n내 모자!", left: 0.02, top: 0.05, maxWidth: 0.26, tail: "right", tailAt: 0.6 },
        ],
      },
      {
        image: comics.tigerride4,
        aspect: 507 / 768,
        sfx: "levelup",
        bubbles: [
          { text: "주막이다!\n국밥 냄새!", left: 0.03, top: 0.1, maxWidth: 0.3, tail: "bottom", tailAt: 0.6 },
        ],
      },
    ],
  },
  foxpath: {
    title: "구미호의 지름길",
    panels: [
      {
        image: comics.foxpath1,
        aspect: 500 / 768,
        sfx: "hit",
        bubbles: [
          { text: "흥, 들켰네.", right: 0.03, top: 0.04, maxWidth: 0.26, tail: "bottom", tailAt: 0.4 },
        ],
      },
      {
        image: comics.foxpath2,
        aspect: 500 / 768,
        bubbles: [
          { text: "고마워요,\n여우님.", right: 0.02, top: 0.8, maxWidth: 0.26, tail: "top", tailAt: 0.5 },
        ],
      },
      {
        image: comics.foxpath3,
        aspect: 505 / 768,
        bubbles: [
          { text: "여우불이\n길을 비춰 줘...", left: 0.02, top: 0.12, maxWidth: 0.32, tail: "bottom", tailAt: 0.3 },
        ],
      },
      {
        image: comics.foxpath4,
        aspect: 505 / 768,
        sfx: "levelup",
        bubbles: [
          { text: "궁궐 앞 장터야!", left: 0.02, top: 0.06, maxWidth: 0.32, tail: "bottom", tailAt: 0.6 },
          { text: "쌀가마가\n많다.", left: 0.5, top: 0.08, maxWidth: 0.24, tail: "left", tailAt: 0.8 },
        ],
      },
    ],
  },
  chiliport: {
    title: "고춧가루 대감의 재채기",
    panels: [
      {
        image: comics.chiliport1,
        aspect: 500 / 768,
        sfx: "hit",
        bubbles: [
          { text: "에취! 에취!", left: 0.02, top: 0.1, maxWidth: 0.3, tail: "bottom", tailAt: 0.4 },
        ],
      },
      {
        image: comics.chiliport2,
        aspect: 500 / 768,
        bubbles: [
          { text: "...이래서\n복면을 쓴다.", left: 0.5, top: 0.05, maxWidth: 0.3, tail: "bottom", tailAt: 0.4 },
        ],
      },
      {
        image: comics.chiliport3,
        aspect: 502 / 768,
        bubbles: [
          { text: "포구까지\n태워 주세요!", left: 0.02, top: 0.04, maxWidth: 0.32, tail: "bottom", tailAt: 0.3 },
        ],
      },
      {
        image: comics.chiliport4,
        aspect: 501 / 768,
        sfx: "levelup",
        bubbles: [
          { text: "수군 포구다!", left: 0.02, top: 0.06, maxWidth: 0.3, tail: "bottom", tailAt: 0.4 },
        ],
      },
    ],
  },
  shrinesteps: {
    title: "벚꽃 상어와 달밤",
    panels: [
      {
        image: comics.shrinesteps1,
        aspect: 499 / 768,
        sfx: "hit",
        bubbles: [
          { text: "에취!\n꽃가루...", right: 0.03, top: 0.1, maxWidth: 0.3, tail: "bottom", tailAt: 0.4 },
        ],
      },
      {
        image: comics.shrinesteps2,
        aspect: 499 / 768,
        bubbles: [
          { text: "저 위에\n여우 신사가 있소.", right: 0.03, top: 0.06, maxWidth: 0.36, tail: "bottom", tailAt: 0.4 },
        ],
      },
      {
        image: comics.shrinesteps3,
        aspect: 504 / 768,
        bubbles: [
          { text: "여우불...\n구미호님이랑 닮았어.", right: 0.03, top: 0.1, maxWidth: 0.32, tail: "left", tailAt: 0.5 },
        ],
      },
      {
        image: comics.shrinesteps4,
        aspect: 504 / 768,
        sfx: "levelup",
        bubbles: [
          { text: "흥,\n참배는 저쪽.", right: 0.1, top: 0.06, maxWidth: 0.26, tail: "bottom", tailAt: 0.8 },
        ],
      },
    ],
  },
  tanukimap: {
    title: "너구리 행상의 지도",
    panels: [
      {
        image: comics.tanukimap1,
        aspect: 499 / 768,
        sfx: "hit",
        bubbles: [
          { text: "내 물건!!!", left: 0.45, top: 0.12, maxWidth: 0.26, tail: "bottom", tailAt: 0.5, shout: true },
        ],
      },
      {
        image: comics.tanukimap2,
        aspect: 499 / 768,
        bubbles: [
          { text: "이건 공짜...\n아니, 반값!", left: 0.3, top: 0.04, maxWidth: 0.32, tail: "bottom", tailAt: 0.7 },
        ],
      },
      {
        image: comics.tanukimap3,
        aspect: 505 / 768,
        bubbles: [
          { text: "...천수각이군.", right: 0.03, top: 0.06, maxWidth: 0.3, tail: "bottom", tailAt: 0.5 },
        ],
      },
      {
        image: comics.tanukimap4,
        aspect: 505 / 768,
        sfx: "levelup",
        bubbles: [
          { text: "저기 황금이\n반짝여!", left: 0.02, top: 0.06, maxWidth: 0.32, tail: "bottom", tailAt: 0.3 },
        ],
      },
    ],
  },
  castleonsen: {
    title: "성 다음엔 온천",
    panels: [
      {
        image: comics.castleonsen1,
        aspect: 499 / 768,
        sfx: "hit",
        bubbles: [
          { text: "좋은 덤벨이다.", right: 0.03, top: 0.12, maxWidth: 0.3, tail: "left", tailAt: 0.7 },
        ],
      },
      {
        image: comics.castleonsen2,
        aspect: 499 / 768,
        bubbles: [
          { text: "다리가\n후들거려...", left: 0.02, top: 0.12, maxWidth: 0.3, tail: "bottom", tailAt: 0.3 },
        ],
      },
      {
        image: comics.castleonsen3,
        aspect: 506 / 768,
        bubbles: [
          { text: "온천 김이다!", left: 0.02, top: 0.12, maxWidth: 0.3, tail: "bottom", tailAt: 0.7 },
        ],
      },
      {
        image: comics.castleonsen4,
        aspect: 507 / 768,
        sfx: "levelup",
        bubbles: [
          { text: "하아~\n천국이다...", left: 0.3, top: 0.08, maxWidth: 0.3, tail: "bottom", tailAt: 0.5 },
        ],
      },
    ],
  },
  nightthief: {
    title: "한밤의 요리책 도둑",
    panels: [
      {
        image: comics.nightthief1,
        aspect: 499 / 768,
        sfx: "hit",
        bubbles: [
          { text: "...물 식기 전에\n들어가세요.", left: 0.4, top: 0.06, maxWidth: 0.4, tail: "bottom", tailAt: 0.55 },
        ],
      },
      {
        image: comics.nightthief2,
        aspect: 499 / 768,
        bubbles: [
          { text: "쿨... 쿨...", left: 0.1, top: 0.06, maxWidth: 0.24, tail: "bottom", tailAt: 0.5 },
        ],
      },
      {
        image: comics.nightthief3,
        aspect: 504 / 768,
        bubbles: [
          { text: "...누구냐.", right: 0.05, top: 0.2, maxWidth: 0.22, tail: "left", tailAt: 0.5 },
        ],
      },
      {
        image: comics.nightthief4,
        aspect: 505 / 768,
        sfx: "levelup",
        bubbles: [
          { text: "내 요리책\n돌려줘!!!", left: 0.02, top: 0.06, maxWidth: 0.34, tail: "bottom", tailAt: 0.2, shout: true },
        ],
      },
    ],
  },
  dragonroad: {
    title: "용궁으로 가는 두루마리",
    panels: [
      {
        image: comics.dragonroad1,
        aspect: 510 / 768,
        sfx: "hit",
        bubbles: [
          { text: "졌다...\n책은 돌려주지.", left: 0.02, top: 0.1, maxWidth: 0.3, tail: "bottom", tailAt: 0.3 },
        ],
      },
      {
        image: comics.dragonroad2,
        aspect: 512 / 768,
        bubbles: [
          { text: "용궁에...\n세상에서 제일 귀한 맛?!", left: 0.02, top: 0.04, maxWidth: 0.42, tail: "bottom", tailAt: 0.55 },
        ],
      },
      {
        image: comics.dragonroad3,
        aspect: 508 / 768,
        bubbles: [
          { text: "저 불빛을\n따라가 보자!", left: 0.3, top: 0.12, maxWidth: 0.3, tail: "bottom", tailAt: 0.6 },
        ],
      },
      {
        image: comics.dragonroad4,
        aspect: 510 / 768,
        sfx: "levelup",
        bubbles: [
          { text: "...바닷속\n길이라니.", left: 0.02, top: 0.06, maxWidth: 0.3, tail: "bottom", tailAt: 0.3 },
          { text: "숨은...\n쉬어지네.", left: 0.38, top: 0.1, maxWidth: 0.26, tail: "bottom", tailAt: 0.5 },
        ],
      },
    ],
  },
  dragongate: {
    title: "열려라, 용궁 문",
    panels: [
      {
        image: comics.dragongate1,
        aspect: 498 / 768,
        sfx: "hit",
        bubbles: [
          { text: "허락하마...\n지나가거라.", right: 0.03, top: 0.12, maxWidth: 0.3, tail: "bottom", tailAt: 0.4 },
        ],
      },
      {
        image: comics.dragongate2,
        aspect: 497 / 768,
        bubbles: [
          { text: "문이...\n열린다!", left: 0.02, top: 0.1, maxWidth: 0.26, tail: "bottom", tailAt: 0.3 },
        ],
      },
      {
        image: comics.dragongate3,
        aspect: 498 / 768,
        bubbles: [
          { text: "어서 오세요,\n손님들~", left: 0.02, top: 0.04, maxWidth: 0.3, tail: "bottom", tailAt: 0.3 },
          { text: "조개가... 인사를?", left: 0.4, top: 0.06, maxWidth: 0.3, tail: "bottom", tailAt: 0.4 },
        ],
      },
      {
        image: comics.dragongate4,
        aspect: 497 / 768,
        sfx: "levelup",
        bubbles: [
          { text: "저게 바로...\n세상에서 제일 귀한 맛?!", left: 0.02, top: 0.04, maxWidth: 0.42, tail: "bottom", tailAt: 0.2 },
        ],
      },
    ],
  },
  whaleride: {
    title: "고래를 타고 세상 반대편으로",
    panels: [
      {
        image: comics.whaleride1,
        aspect: 503 / 768,
        sfx: "hit",
        bubbles: [
          { text: "허허허!\n이런 손님은 처음이구나.", left: 0.02, top: 0.06, maxWidth: 0.36, tail: "right", tailAt: 0.7 },
        ],
      },
      {
        image: comics.whaleride2,
        aspect: 501 / 768,
        bubbles: [
          { text: "제일 귀한 맛은\n세상 반대편 미식 도시에 있지.", right: 0.02, top: 0.05, maxWidth: 0.44, tail: "left", tailAt: 0.6 },
        ],
      },
      {
        image: comics.whaleride3,
        aspect: 506 / 768,
        bubbles: [
          { text: "고래야,\n잘 부탁해!", left: 0.5, top: 0.36, maxWidth: 0.3, tail: "top", tailAt: 0.1 },
        ],
      },
      {
        image: comics.whaleride4,
        aspect: 505 / 768,
        sfx: "levelup",
        bubbles: [
          { text: "치즈 냄새...!", left: 0.4, top: 0.3, maxWidth: 0.22, tail: "bottom", tailAt: 0.5 },
          { text: "여기가\n미식 도시?", left: 0.02, top: 0.28, maxWidth: 0.24, tail: "bottom", tailAt: 0.4 },
        ],
      },
    ],
  },
  alpinetrain: {
    title: "치즈를 찾아 산악 열차로",
    panels: [
      {
        image: comics.alpinetrain1,
        aspect: 496 / 768,
        sfx: "hit",
        bubbles: [
          { text: "내 피자...\n치즈가 부족했어.", left: 0.02, top: 0.1, maxWidth: 0.3, tail: "bottom", tailAt: 0.7 },
        ],
      },
      {
        image: comics.alpinetrain2,
        aspect: 496 / 768,
        bubbles: [
          { text: "최고의 피자엔\n알프스 치즈가 필요해!", right: 0.03, top: 0.08, maxWidth: 0.4, tail: "bottom", tailAt: 0.3 },
        ],
      },
      {
        image: comics.alpinetrain3,
        aspect: 506 / 768,
        bubbles: [
          { text: "산이다~!", left: 0.3, top: 0.08, maxWidth: 0.22, tail: "bottom", tailAt: 0.4 },
        ],
      },
      {
        image: comics.alpinetrain4,
        aspect: 506 / 768,
        sfx: "levelup",
        bubbles: [
          { text: "치즈가\n산처럼 쌓였어!", left: 0.1, top: 0.1, maxWidth: 0.3, tail: "bottom", tailAt: 0.7 },
          { text: "음매~?", left: 0.6, top: 0.25, maxWidth: 0.18, tail: "bottom", tailAt: 0.5 },
        ],
      },
    ],
  },
  sledbakery: {
    title: "빵집의 셰프 기니",
    panels: [
      {
        image: comics.sledbakery1,
        aspect: 500 / 768,
        sfx: "hit",
        bubbles: [
          { text: "꽉 잡아라,\n내려간다!", right: 0.05, top: 0.08, maxWidth: 0.3, tail: "bottom", tailAt: 0.6 },
        ],
      },
      {
        image: comics.sledbakery2,
        aspect: 500 / 768,
        bubbles: [
          { text: "으앙~\n또 태웠어...!", right: 0.05, top: 0.04, maxWidth: 0.3, tail: "bottom", tailAt: 0.5 },
        ],
      },
      {
        image: comics.sledbakery3,
        aspect: 501 / 768,
        bubbles: [
          { text: "불은 줄이고\n천천히~", left: 0.2, top: 0.04, maxWidth: 0.28, tail: "bottom", tailAt: 0.5 },
        ],
      },
      {
        image: comics.sledbakery4,
        aspect: 501 / 768,
        sfx: "levelup",
        bubbles: [
          { text: "나도 데려가 줘!\n맛있는 거 해 줄게!", left: 0.28, top: 0.06, maxWidth: 0.36, tail: "bottom", tailAt: 0.6 },
          { text: "좋아!", right: 0.17, top: 0.14, maxWidth: 0.13, tail: "bottom", tailAt: 0.4 },
        ],
      },
    ],
  },
  ginitown: {
    title: "기니 대도시의 낮잠 소동",
    panels: [
      {
        image: comics.ginitown1,
        aspect: 512 / 768,
        bubbles: [
          { text: "우와,\n이런 도시가 있었어?!", left: 0.04, top: 0.03, maxWidth: 0.36, tail: "bottom", tailAt: 0.3 },
        ],
      },
      {
        image: comics.ginitown2,
        aspect: 512 / 768,
        bubbles: [
          { text: "저기요...\n다들 괜찮아요?", left: 0.02, top: 0.03, maxWidth: 0.34, tail: "bottom", tailAt: 0.3 },
        ],
      },
      {
        image: comics.ginitown3,
        aspect: 512 / 768,
        sfx: "hit",
        bubbles: [
          { text: "저기, 저기요!", left: 0.02, top: 0.03, maxWidth: 0.26, tail: "bottom", tailAt: 0.4 },
          { text: "...졸려...", right: 0.08, top: 0.1, maxWidth: 0.2, tail: "bottom", tailAt: 0.5 },
        ],
      },
      {
        image: comics.ginitown4,
        aspect: 512 / 768,
        bubbles: [
          { text: "다들 왜 이렇게\n졸린 거야?!", left: 0.02, top: 0.02, maxWidth: 0.4, tail: "bottom", tailAt: 0.3, shout: true },
        ],
      },
    ],
  },
  townasleep: {
    title: "온 마을을 뒤덮은 수상한 냄새",
    panels: [
      {
        image: comics.townasleep1,
        aspect: 512 / 768,
        bubbles: [
          { text: "고마워, 덕분에 깼어!\n근데... 큰일이야.", left: 0.03, top: 0.03, maxWidth: 0.4, tail: "bottom", tailAt: 0.3 },
        ],
      },
      {
        image: comics.townasleep2,
        aspect: 512 / 768,
        bubbles: [
          { text: "저 수상한 집 냄새 때문에\n마을이 통째로 잠들고 있어...", left: 0.02, top: 0.02, maxWidth: 0.46, tail: "bottom", tailAt: 0.3 },
        ],
      },
      {
        image: comics.townasleep3,
        aspect: 512 / 768,
        sfx: "levelup",
        bubbles: [
          { text: "제가 가서\n확인해 볼게요!", left: 0.3, top: 0.02, maxWidth: 0.38, tail: "bottom", tailAt: 0.5 },
        ],
      },
      {
        image: comics.townasleep4,
        aspect: 512 / 768,
        bubbles: [
          { text: "좋아, 가보자!", left: 0.04, top: 0.04, maxWidth: 0.3, tail: "bottom", tailAt: 0.3 },
        ],
      },
    ],
  },
  pumpkinforest: {
    title: "달맞이 호박을 찾아서",
    panels: [
      {
        image: comics.pumpkinforest1,
        aspect: 512 / 768,
        bubbles: [
          { text: "마을의 잠을 풀려면\n숲의 달맞이 호박이 필요해.", right: 0.02, top: 0.03, maxWidth: 0.58, tail: "bottom", tailAt: 0.7 },
        ],
      },
      {
        image: comics.pumpkinforest2,
        aspect: 512 / 768,
        bubbles: [
          { text: "호박은 못 줘!\n숲의 수확물이야!", right: 0.02, top: 0.03, maxWidth: 0.42, tail: "bottom", tailAt: 0.7 },
        ],
      },
      {
        image: comics.pumpkinforest3,
        aspect: 512 / 768,
        sfx: "bossEnter",
        shake: true,
        bubbles: [
          { text: "호박등 숲의 수확물을\n가져가려는 자, 누구냐!", left: 0.02, top: 0.02, maxWidth: 0.62, tail: "bottom", tailAt: 0.75, shout: true },
        ],
      },
      {
        image: comics.pumpkinforest4,
        aspect: 512 / 768,
        bubbles: [
          { text: "저 골렘이 숲을 지켜.\n조심해!", left: 0.02, top: 0.03, maxWidth: 0.43, tail: "bottom", tailAt: 0.3 },
          { text: "마을 사람들을 위해\n안으로 가야 해!", right: 0.02, top: 0.03, maxWidth: 0.43, tail: "bottom", tailAt: 0.6 },
        ],
      },
    ],
  },
  beeChase: {
    title: "달콤한 냄새를 따라온 벌떼",
    panels: [
      {
        image: comics.beeChase1,
        aspect: 512 / 746,
        bubbles: [{ text: "호박을 챙겼으니\n이제 마을로 돌아가자!", left: 0.03, top: 0.03, maxWidth: 0.42, tail: "bottom", tailAt: 0.65 }],
      },
      {
        image: comics.beeChase2,
        aspect: 512 / 746,
        bubbles: [{ text: "잠깐... 이 냄새를\n맡고 온 것 같은데?", left: 0.02, top: 0.03, maxWidth: 0.43, tail: "bottom", tailAt: 0.35 }],
      },
      {
        image: comics.beeChase3,
        aspect: 512 / 746,
        sfx: "hit",
        shake: true,
        bubbles: [{ text: "으아아! 벌들이\n점점 많아져!", left: 0.03, top: 0.03, maxWidth: 0.42, tail: "bottom", tailAt: 0.35, shout: true }],
      },
      {
        image: comics.beeChase4,
        aspect: 512 / 746,
        sfx: "bossEnter",
        bubbles: [
          { text: "그 달콤한 호박은\n우리 벌집의 것이야!", right: 0.02, top: 0.03, maxWidth: 0.43, tail: "bottom", tailAt: 0.75, shout: true },
          { text: "마을에 가져갈\n소중한 호박이야!", left: 0.02, top: 0.03, maxWidth: 0.37, tail: "bottom", tailAt: 0.35 },
        ],
      },
    ],
  },
  giniReturn: {
    title: "호박죽 냄새를 맡은 손님들",
    panels: [
      {
        image: comics.giniReturn1,
        aspect: 486 / 759,
        bubbles: [{ text: "호박죽이 보글보글…\n기니들도 곧 깨어나겠네!", left: 0.03, top: 0.03, maxWidth: 0.42, tail: "bottom", tailAt: 0.7 }],
      },
      {
        image: comics.giniReturn2,
        aspect: 486 / 759,
        bubbles: [{ text: "으음… 맛있는 냄새!", right: 0.03, top: 0.04, maxWidth: 0.35, tail: "bottom", tailAt: 0.3 }],
      },
      {
        image: comics.giniReturn3,
        aspect: 520 / 759,
        sfx: "hit",
        shake: true,
        bubbles: [{ text: "호박죽 냄새다!\n먼저 온 건 나야!", right: 0.03, top: 0.04, maxWidth: 0.38, tail: "bottom", tailAt: 0.65, shout: true }],
      },
      {
        image: comics.giniReturn4,
        aspect: 520 / 759,
        sfx: "bossEnter",
        bubbles: [
          { text: "이 향기는… 호박죽!", right: 0.02, top: 0.03, maxWidth: 0.36, tail: "bottom", tailAt: 0.7, shout: true },
          { text: "그리핀까지 왔잖아?!", left: 0.03, top: 0.26, maxWidth: 0.32, tail: "right", tailAt: 0.65 },
        ],
      },
    ],
  },
  griffinFlight: {
    title: "그리핀의 등에 올라",
    panels: [
      {
        image: comics.griffinFlight1,
        aspect: 435 / 799,
        bubbles: [{ text: "미안하다… 너무 배가 고파서\n그만 냄비를 노렸구나.", right: 0.03, top: 0.03, maxWidth: 0.42, tail: "bottom", tailAt: 0.4 }],
      },
      {
        image: comics.griffinFlight2,
        aspect: 435 / 800,
        bubbles: [
          { text: "음식을 숨겨 둔 용을 안다.\n꽉 잡아라!", left: 0.02, top: 0.66, maxWidth: 0.36, tail: "top", tailAt: 0.7 },
          { text: "우와, 하늘을 난다~!", right: 0.02, top: 0.04, maxWidth: 0.28, tail: "left", tailAt: 0.5 },
        ],
      },
      {
        image: comics.griffinFlight3,
        aspect: 434 / 799,
        sfx: "hit",
        shake: true,
        bubbles: [{ text: "까마귀 떼다!\n으아아, 떨어진다!", right: 0.02, top: 0.03, maxWidth: 0.32, tail: "bottom", tailAt: 0.2, shout: true }],
      },
      {
        image: comics.griffinFlight4,
        aspect: 434 / 800,
        sfx: "bossEnter",
        bubbles: [
          { text: "…내 음식에\n손대지 마라.", left: 0.02, top: 0.04, maxWidth: 0.3, tail: "right", tailAt: 0.5, shout: true },
          { text: "으윽… 여긴 어디야?", right: 0.02, top: 0.4, maxWidth: 0.28, tail: "left", tailAt: 0.75 },
        ],
      },
    ],
  },
  // The last stage's boss (무너진 성채's 배고픈 드래곤) finally down: every recipe book
  // ingredient recovered, the whole party carries it home to 할머니's — the cookbook from
  // stage 5's comic ("세상의 모든 맛") finished for real, cooked and eaten together.
  ending: {
    title: "세상의 모든 맛, 완성",
    panels: [
      {
        image: comics.ending1,
        aspect: 499 / 666,
        sfx: "levelup",
        bubbles: [
          { text: "다 모았어! 책에 있는 재료, 전부 다!", left: 0.04, top: 0.03, maxWidth: 0.42, tail: "bottom", tailAt: 0.6, shout: true },
          { text: "할머니한테 가자!", right: 0.03, top: 0.04, maxWidth: 0.28, tail: "bottom", tailAt: 0.3 },
        ],
      },
      {
        image: comics.ending2,
        aspect: 499 / 666,
        bubbles: [
          { text: "얘들아! 다들 무사히 왔구나!", right: 0.02, top: 0.04, maxWidth: 0.36, tail: "bottom", tailAt: 0.3 },
          { text: "할머니, 저희 왔어요!", left: 0.02, top: 0.7, maxWidth: 0.32, tail: "top", tailAt: 0.5 },
        ],
      },
      {
        image: comics.ending3,
        aspect: 499 / 666,
        sfx: "cookDone",
        bubbles: [
          { text: "자, 가진 재료 다 넣자꾸나!", left: 0.3, top: 0.02, maxWidth: 0.4, tail: "bottom", tailAt: 0.4 },
          { text: "보글보글, 냄새 좋다!", right: 0.02, top: 0.55, maxWidth: 0.3, tail: "left", tailAt: 0.5 },
        ],
      },
      {
        image: comics.ending4,
        aspect: 499 / 666,
        sfx: "levelup",
        bubbles: [{ text: "세상에서 제일 귀한 맛... 바로 이거였어!", left: 0.14, top: 0.02, maxWidth: 0.55, tail: "bottom", tailAt: 0.4, shout: true }],
      },
    ],
  },
  // Stage 39 (0-based) — 무너진 성채. 용을 잡고(1) → 낯선 냄새를 따라 떠나(2) → 바자르에
  // 도착해서(3) → 호랑이 셰프와 시비가 붙는(4) 데까지, 한 편으로. 다음 스테이지(40, 인도
  // 향신료 바자르)에서 그 싸움을 직접 겪고, 그 스테이지를 클리어하면 "ending"이 이어진다.
  bazaarBound: {
    title: "낯선 향기를 따라서",
    panels: [
      {
        image: comics.bazaarBound1,
        aspect: 504 / 760,
        sfx: "levelup",
        bubbles: [{ text: "드디어 잡았다!\n숨긴 재료도 돌려받자!", left: 0.02, top: 0.02, maxWidth: 0.44, tail: "bottom", tailAt: 0.7, shout: true }],
      },
      {
        image: comics.bazaarBound2,
        aspect: 504 / 760,
        bubbles: [{ text: "다시 요리책 재료 모으러!\n어? 이 냄새는...?", left: 0.02, top: 0.02, maxWidth: 0.44, tail: "bottom", tailAt: 0.7 }],
      },
      {
        image: comics.bazaarBound3,
        aspect: 504 / 760,
        bubbles: [{ text: "커리 향신료가\n전부 여기 있어!", left: 0.02, top: 0.02, maxWidth: 0.42, tail: "bottom", tailAt: 0.7 }],
      },
      {
        image: comics.bazaarBound4,
        aspect: 504 / 760,
        sfx: "bossEnter",
        bubbles: [
          { text: "내 바자르에서\n뭘 찾는 거지?", right: 0.02, top: 0.02, maxWidth: 0.4, tail: "bottom", tailAt: 0.3 },
          { text: "커리 향신료,\n좀 나눠 줘!", left: 0.0, top: 0.68, maxWidth: 0.36, tail: "top", tailAt: 0.6, shout: true },
        ],
      },
    ],
  },
  // Plays once, right after "ending" — the first time stageNumber loops back to stage 1
  // (see useGameState's loopsCompleted). The feast's smell draws the village's 아가기니 to
  // the fence; one works up the nerve to ask along. It's this one who tags along from the
  // second run on, so later runs skip straight back to stage 1 without it.
  apprenticeGini: {
    title: "견습기니의 소원",
    panels: [
      {
        image: comics.apprenticeGini1,
        aspect: 499 / 666,
        sfx: "cookDone",
        bubbles: [{ text: "자, 한 그릇씩 더 먹자!", left: 0.3, top: 0.03, maxWidth: 0.4, tail: "bottom", tailAt: 0.4 }],
      },
      {
        image: comics.apprenticeGini2,
        aspect: 499 / 666,
        bubbles: [
          { text: "냄새가 너무 좋아...", left: 0.02, top: 0.52, maxWidth: 0.32, tail: "bottom", tailAt: 0.4 },
          { text: "저 안에서 무슨 요리를 하는 거지?", right: 0.02, top: 0.3, maxWidth: 0.4, tail: "bottom", tailAt: 0.5 },
        ],
      },
      {
        image: comics.apprenticeGini3,
        aspect: 499 / 666,
        sfx: "cookDone",
        bubbles: [
          { text: "우와, 이거 진짜 맛있다!", left: 0.02, top: 0.03, maxWidth: 0.4, tail: "bottom", tailAt: 0.6 },
          { text: "나도 모험하면서\n이런 요리 해주고 싶어!", right: 0.02, top: 0.55, maxWidth: 0.4, tail: "left", tailAt: 0.5 },
        ],
      },
      {
        image: comics.apprenticeGini4,
        aspect: 499 / 666,
        sfx: "levelup",
        bubbles: [
          { text: "저도... 같이 가도 될까요?", left: 0.02, top: 0.03, maxWidth: 0.42, tail: "bottom", tailAt: 0.7 },
          { text: "그래, 같이 가자!", right: 0.02, top: 0.68, maxWidth: 0.34, tail: "top", tailAt: 0.3 },
        ],
      },
    ],
  },
  // Stage 39 (0-based) — 인도 향신료 바자르. 커리 재료를 다 모으고 호랑이 셰프에게서 요리책 짜이의
  // 찻잎이 산 위에 있다는 걸 듣고(1) → 산길을 올라(2) →
  // 히말라야 차밭에 도착해 감탄하고(3) → 짜이 설인이 나타나는(4) 데까지. 다음 스테이지(40,
  // 히말라야 차밭)에서 그 싸움을 직접 겪는다.
  teaTrail: {
    title: "찻잎 향기 따라 산 위로",
    panels: [
      {
        image: comics.teaTrail1,
        aspect: 504 / 760,
        sfx: "levelup",
        bubbles: [
          { text: "커리 재료,\n다 모았다!", left: 0.02, top: 0.02, maxWidth: 0.3, tail: "bottom", tailAt: 0.4, shout: true },
          { text: "짜이에 넣을 찻잎은...\n저 산 위에 있지...", right: 0.02, top: 0.02, maxWidth: 0.4, tail: "bottom", tailAt: 0.6 },
        ],
      },
      {
        image: comics.teaTrail2,
        aspect: 504 / 760,
        bubbles: [{ text: "헉헉... 그래도\n찻잎 냄새가 나!", left: 0.02, top: 0.02, maxWidth: 0.4, tail: "bottom", tailAt: 0.7 }],
      },
      {
        image: comics.teaTrail3,
        aspect: 504 / 760,
        bubbles: [{ text: "우와...\n찻잎이 한가득!", left: 0.22, top: 0.02, maxWidth: 0.36, tail: "bottom", tailAt: 0.1 }],
      },
      {
        image: comics.teaTrail4,
        aspect: 504 / 760,
        sfx: "bossEnter",
        bubbles: [
          { text: "내 찻잎을 노리는 거냐?\n짜이부터 받아라!", left: 0.02, top: 0.02, maxWidth: 0.44, tail: "bottom", tailAt: 0.9 },
          { text: "요리책 짜이,\n꼭 만들 거야!", left: 0.0, top: 0.4, maxWidth: 0.32, tail: "bottom", tailAt: 0.5, shout: true },
        ],
      },
    ],
  },
  // Stage 40 (0-based) — 히말라야 차밭. 짜이 설인을 쓰러뜨려 찻잎을 얻고, 요리책 다음 요리 비리야니에
  // 사프란이 필요하다는 걸 알고(1) → 강을 따라 내려가(2) → 타지마할 정원에 도착해 감탄하고(3) →
  // 황실 사프란을 끌어안은 공작 황제가 나타나는(4) 데까지.
  saffronGarden: {
    title: "사프란 꽃이 피는 정원",
    panels: [
      {
        image: comics.saffronGarden1,
        aspect: 504 / 760,
        sfx: "levelup",
        bubbles: [
          { text: "찻잎 확보!\n짜이 완성이다!", left: 0.02, top: 0.02, maxWidth: 0.34, tail: "bottom", tailAt: 0.4, shout: true },
          { text: "다음 비리야니엔...\n사프란이 필요하대!", right: 0.02, top: 0.02, maxWidth: 0.4, tail: "bottom", tailAt: 0.3 },
        ],
      },
      {
        image: comics.saffronGarden2,
        aspect: 504 / 760,
        bubbles: [{ text: "사프란 꽃이 핀다는\n하얀 궁전까지 가자!", left: 0.02, top: 0.02, maxWidth: 0.44, tail: "bottom", tailAt: 0.7 }],
      },
      {
        image: comics.saffronGarden3,
        aspect: 504 / 760,
        bubbles: [{ text: "우와... 꽃밭이\n전부 사프란이야!", left: 0.02, top: 0.02, maxWidth: 0.4, tail: "bottom", tailAt: 0.6 }],
      },
      {
        image: comics.saffronGarden4,
        aspect: 504 / 760,
        sfx: "bossEnter",
        bubbles: [
          { text: "황실 사프란은\n한 올도 못 내준다!", left: 0.02, top: 0.02, maxWidth: 0.4, tail: "bottom", tailAt: 0.9 },
          { text: "비리야니에\n딱 한 줌만!", left: 0.0, top: 0.36, maxWidth: 0.3, tail: "bottom", tailAt: 0.5, shout: true },
        ],
      },
    ],
  },
  // Fires once: the second loop's 평범한 마을 boss (LOOP_COMICS, stage 6) clear —
  // see GameScreen's comic chain. 견습기니's first real taste of actually fighting instead of
  // just tagging along, and it does not go well — sets up the contrast for apprenticeGuard's
  // stage-23 turn and boxerEvolution's training arc later this same loop.
  apprenticeWeak: {
    title: "무력한 아가기니",
    panels: [
      {
        image: comics.apprenticeWeak1,
        aspect: 504 / 760,
        bubbles: [
          { text: "쥐들이 많아!\n조심해!", right: 0.0, top: 0.02, maxWidth: 0.4, tail: "bottom", tailAt: 0.3, shout: true },
          { text: "나도...\n싸울 수 있어!", left: 0.0, top: 0.55, maxWidth: 0.3, tail: "bottom", tailAt: 0.6 },
        ],
      },
      {
        image: comics.apprenticeWeak2,
        aspect: 504 / 760,
        sfx: "hit",
        shake: true,
        bubbles: [{ text: "으앗...?!", left: 0.02, top: 0.4, maxWidth: 0.3, tail: "bottom", tailAt: 0.5, shout: true }],
      },
      {
        image: comics.apprenticeWeak3,
        aspect: 504 / 760,
        sfx: "crit",
        shake: true,
        bubbles: [
          { text: "히익!", left: 0.0, top: 0.02, maxWidth: 0.22, tail: "bottom", tailAt: 0.6, shout: true },
          { text: "저리 가!", right: 0.0, top: 0.02, maxWidth: 0.28, tail: "bottom", tailAt: 0.4, shout: true },
        ],
      },
      {
        image: comics.apprenticeWeak4,
        aspect: 504 / 760,
        bubbles: [
          { text: "나는...\n역시 도움이 안 되나 봐.", left: 0.0, top: 0.02, maxWidth: 0.38, tail: "bottom", tailAt: 0.6 },
          { text: "천천히 하면 돼.\n급할 거 없어.", right: 0.0, top: 0.68, maxWidth: 0.4, tail: "top", tailAt: 0.3 },
        ],
      },
    ],
  },
  // Fires once: the second loop's 수군 포구 boss (LOOP_COMICS, stage 23) clear —
  // see GameScreen's comic chain. 견습기니's been tagging along quietly since joining at the
  // start of this loop, never once in the thick of a fight; here the pirate captain's tentacle
  // comes in from 모험기니's blind side and the "weak" one is the one who actually stops it.
  apprenticeGuard: {
    title: "수군 포구의 작은 방패",
    panels: [
      {
        image: comics.apprenticeGuard1,
        aspect: 504 / 760,
        bubbles: [
          { text: "해적선장이다!\n이번에도 내가 처리할게!", right: 0.02, top: 0.03, maxWidth: 0.44, tail: "bottom", tailAt: 0.4 },
          { text: "나는... 그냥 뒤에 있을게...", left: 0.0, top: 0.42, maxWidth: 0.3, tail: "bottom", tailAt: 0.6 },
        ],
      },
      {
        image: comics.apprenticeGuard2,
        aspect: 504 / 760,
        sfx: "hit",
        shake: true,
        bubbles: [{ text: "하압—!!", left: 0.02, top: 0.03, maxWidth: 0.3, tail: "bottom", tailAt: 0.7, shout: true }],
      },
      {
        image: comics.apprenticeGuard3,
        aspect: 504 / 760,
        sfx: "crit",
        shake: true,
        bubbles: [
          { text: "견습기니?!", left: 0.02, top: 0.02, maxWidth: 0.34, tail: "bottom", tailAt: 0.75, shout: true },
          { text: "내, 내가 막을게...!", left: 0.3, top: 0.68, maxWidth: 0.4, tail: "top", tailAt: 0.3, shout: true },
        ],
      },
      {
        image: comics.apprenticeGuard4,
        aspect: 504 / 760,
        sfx: "levelup",
        bubbles: [
          { text: "...너 하나도\n안 약하잖아.", left: 0.02, top: 0.02, maxWidth: 0.4, tail: "bottom", tailAt: 0.7 },
          { text: "에헤헤...\n나도 도움이 됐지?", right: 0.02, top: 0.68, maxWidth: 0.4, tail: "top", tailAt: 0.3 },
        ],
      },
    ],
  },
  // Fires once: the moment loopsCompleted ticks past 2 — i.e. the very last boss of the
  // second loop falls, whichever stage that currently is (see GameScreen's comic chain; no
  // stage number is hardcoded here on purpose, since new stages keep getting appended to the
  // far end and today's "last boss" won't stay the last boss). 복서기니 has never had a join
  // story of its own (it's gem-bought, not stage-unlocked — see unlocks.ts) — this comic
  // quietly adopts it as who 견습기니 trains into after two full loops at 아가기니's side.
  boxerEvolution: {
    title: "복서기니의 탄생",
    panels: [
      {
        image: comics.boxerEvolution1,
        aspect: 504 / 760,
        sfx: "levelup",
        bubbles: [
          { text: "해냈다!\n또 한 바퀴 다 돌았어!", left: 0.02, top: 0.02, maxWidth: 0.42, tail: "bottom", tailAt: 0.7, shout: true },
          { text: "나도... 더 강해지고 싶어.", right: 0.0, top: 0.5, maxWidth: 0.36, tail: "bottom", tailAt: 0.4 },
        ],
      },
      {
        image: comics.boxerEvolution2,
        aspect: 504 / 760,
        sfx: "hit",
        shake: true,
        bubbles: [{ text: "하나 더...!\n하나만 더!!", left: 0.02, top: 0.02, maxWidth: 0.4, tail: "bottom", tailAt: 0.6, shout: true }],
      },
      {
        image: comics.boxerEvolution3,
        aspect: 504 / 760,
        sfx: "levelup",
        shake: true,
        bubbles: [{ text: "이 빛은 뭐야?!", left: 0.02, top: 0.02, maxWidth: 0.34, tail: "bottom", tailAt: 0.8, shout: true }],
      },
      {
        image: comics.boxerEvolution4,
        aspect: 504 / 760,
        sfx: "bossEnter",
        bubbles: [
          { text: "우와...\n진짜 복서기니가 됐구나!", left: 0.02, top: 0.02, maxWidth: 0.4, tail: "bottom", tailAt: 0.7 },
          { text: "이제부턴\n내 주먹도 믿어봐!", right: 0.02, top: 0.68, maxWidth: 0.4, tail: "top", tailAt: 0.3, shout: true },
        ],
      },
    ],
  },
};

// Story comics that play when a stage's (0-based) boss falls for the first time.
export const COMIC_ON_FIRST_CLEAR: Partial<Record<number, ComicId>> = {
  0: "slimeroad",
  1: "swampfarm",
  2: "farmchicken",
  3: "explorer",
  4: "cavevillage",
  5: "cookbook",
  6: "harbor",
  7: "dive",
  8: "teto",
  9: "jungle",
  10: "jungleoasis",
  11: "oasisdesert",
  12: "assassin",
  13: "marketsilk",
  14: "kite",
  15: "cloudpalace",
  16: "snowpass",
  17: "snowvillage",
  18: "tigerride",
  19: "egen",
  20: "foxpath",
  21: "chiliport",
  22: "samurai",
  23: "shrinesteps",
  24: "tanukimap",
  25: "castleonsen",
  26: "nightthief",
  27: "dragonroad",
  28: "dragongate",
  29: "whaleride",
  30: "alpinetrain",
  31: "sledbakery",
  32: "ginitown",
  33: "townasleep",
  34: "pumpkinforest",
  35: "beeChase",
  36: "giniReturn",
  37: "griffinFlight",
  // 38 (무너진 성채): the dragon falls and gives back its hoarded ingredients, the party returns
  // to the cookbook (curry next), follows the spice scent, and confronts 40's boss waiting
  // at the bazaar (see COMICS.bazaarBound) — a normal first-clear entry, nothing dynamic.
  38: "bazaarBound",
  // 39 (인도 향신료 바자르): the tiger chef falls and points at the mountains, the climb, the
  // tea terraces, and the chai yeti's entrance (see COMICS.teaTrail) — same shape as 38.
  39: "teaTrail",
  // 40 (히말라야 차밭): the yeti falls and hands over the tea, the cookbook's biryani page calls for
  // saffron, the river trip down, the Mughal garden, the peacock emperor (COMICS.saffronGarden).
  40: "saffronGarden",
  // "ending" plays on whichever stage is CURRENTLY the true last one (41, 타지마할 정원, today) —
  // keyed dynamically so it always follows the real frontier, not pinned to this number. The
  // next time a stage ships past this one, write that stage's own bridge comic (same shape as
  // bazaarBound above: wherever 39's fight leaves off, through to arriving at and clashing
  // with the new area's boss) and this key keeps pointing at "ending" with zero edits here —
  // only GameScreen's apprenticeGini chain (tied to the actual loop-wrap stage) needs
  // re-pointing by hand when that happens.
  [LAST_STAGE_NUMBER]: "ending",
};

// Story order, for the album: the opening, then each by the stage that unlocks it. "ending"
// and "bazaarBound" are both normal stage-keyed entries now (dynamic and 38, respectively) so
// they're included automatically below — only apprenticeGini/apprenticeWeak/apprenticeGuard/
// boxerEvolution (loop-specific triggers, not stage-keyed) are appended by hand.
export const COMIC_ORDER: ComicId[] = [
  "opening",
  ...(Object.entries(COMIC_ON_FIRST_CLEAR) as [string, ComicId][])
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([, id]) => id),
  "apprenticeGini",
  "apprenticeWeak",
  "apprenticeGuard",
  "boxerEvolution",
];

// What opens a comic, for the album's locked cards.
export function getComicUnlockLabel(id: ComicId) {
  if (id === "opening") return t("게임 시작", "Start the Game");
  if (id === "apprenticeGini") return t("2회차를 시작하면 열려요", "Unlocks when you start loop 2");
  const loopComic = LOOP_COMICS.find((entry) => entry.comic === id);
  if (loopComic) {
    const loopNumber = loopComic.afterLoop + 1;
    const loopLabel = `${loopNumber}회차`;
    return loopComic.afterStage === undefined
      ? t(
          `${loopLabel}의 마지막 보스를 잡으면 열려요`,
          `Unlocks on beating loop ${loopNumber}'s last boss`,
          `${loopNumber}周目の最後のボスを倒すと解放されます`,
          `击败第${loopNumber}周目的最终首领后解锁`,
        )
      : t(
          `${loopLabel}에 ${loopComic.afterStage + 1}스테이지 보스를 잡으면 열려요`,
          `Unlocks on beating stage ${loopComic.afterStage + 1}'s boss during loop ${loopNumber}`,
          `${loopNumber}周目でステージ${loopComic.afterStage + 1}のボスを倒すと解放されます`,
          `在第${loopNumber}周目击败第${loopComic.afterStage + 1}关首领后解锁`,
        );
  }
  const stage = Object.entries(COMIC_ON_FIRST_CLEAR).find(([, comic]) => comic === id)?.[0];
  return stage === undefined
    ? ""
    : t(
        `${Number(stage) + 1}스테이지 보스를 처음 잡으면 열려요`,
        `Unlocks on first beating stage ${Number(stage) + 1}'s boss`,
        `ステージ${Number(stage) + 1}のボスを初めて倒すと解放されます`,
        `首次击败第${Number(stage) + 1}关首领后解锁`,
      );
}

// Comics the player has reached so far (for the album): the opening always, the rest
// once their stage's boss has been beaten.
export function getUnlockedComics(clearedStages: number[], all = false): ComicId[] {
  if (all) return COMIC_ORDER;
  const reached = Object.entries(COMIC_ON_FIRST_CLEAR)
    .filter(([stage]) => clearedStages.includes(Number(stage)))
    .map(([, id]) => id as ComicId);
  return ["opening", ...reached];
}
