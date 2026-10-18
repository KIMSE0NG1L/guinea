import { comics } from "../assets";
import type { SfxKey } from "../sound";

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

export type ComicId = "opening" | "explorer" | "cookbook" | "teto" | "assassin" | "egen" | "samurai";

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
};

// Story comics that play when a stage's (0-based) boss falls for the first time.
export const COMIC_ON_FIRST_CLEAR: Partial<Record<number, ComicId>> = {
  3: "explorer",
  5: "cookbook",
  8: "teto",
  12: "assassin",
  19: "egen",
  22: "samurai",
};

// Story order, for the album: the opening, then each by the stage that unlocks it.
export const COMIC_ORDER: ComicId[] = [
  "opening",
  ...(Object.entries(COMIC_ON_FIRST_CLEAR) as [string, ComicId][])
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([, id]) => id),
];

// What opens a comic, for the album's locked cards.
export function getComicUnlockLabel(id: ComicId) {
  if (id === "opening") return "게임 시작";
  const stage = Object.entries(COMIC_ON_FIRST_CLEAR).find(([, comic]) => comic === id)?.[0];
  return stage === undefined ? "" : `${Number(stage) + 1}스테이지 보스를 처음 잡으면 열려요`;
}

// Comics the player has reached so far (for the album): the opening always, the rest
// once their stage's boss has been beaten.
export function getUnlockedComics(clearedStages: number[]): ComicId[] {
  const reached = Object.entries(COMIC_ON_FIRST_CLEAR)
    .filter(([stage]) => clearedStages.includes(Number(stage)))
    .map(([, id]) => id as ComicId);
  return ["opening", ...reached];
}
