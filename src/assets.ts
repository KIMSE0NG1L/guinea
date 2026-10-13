// Metro requires static require() calls — no dynamic `guinea-${outfit}-idle.png` strings.
// This file is the one place that enumerates every sprite strip and small icon.

export const spriteSheets = {
  guinea: {
    default: {
      idle: require("../assets/sprites/guinea-idle-strip.png"),
      attack: require("../assets/sprites/guinea-attack-strip.png"),
      critical: require("../assets/sprites/guinea-critical-strip.png"),
      win: require("../assets/sprites/guinea-win-strip.png"),
    },
    acorn: {
      idle: require("../assets/sprites/guinea-acorn-idle-strip.png"),
      attack: require("../assets/sprites/guinea-acorn-attack-strip.png"),
      critical: require("../assets/sprites/guinea-acorn-critical-strip.png"),
      win: require("../assets/sprites/guinea-acorn-win-strip.png"),
    },
    pauper: {
      idle: require("../assets/sprites/guinea-pauper-idle-strip.png"),
      attack: require("../assets/sprites/guinea-pauper-attack-strip.png"),
      critical: require("../assets/sprites/guinea-pauper-critical-strip.png"),
      win: require("../assets/sprites/guinea-pauper-win-strip.png"),
    },
  },
  slime: {
    idle: require("../assets/sprites/slime-idle-strip.png"),
    hit: require("../assets/sprites/slime-hit-strip.png"),
    die: require("../assets/sprites/slime-die-strip.png"),
  },
  mushroom: {
    idle: require("../assets/sprites/mushroom-idle-strip.png"),
    hit: require("../assets/sprites/mushroom-hit-strip.png"),
    die: require("../assets/sprites/mushroom-die-strip.png"),
  },
  carrot: {
    idle: require("../assets/sprites/carrot-rabbit-idle-strip.png"),
    hit: require("../assets/sprites/carrot-rabbit-hit-strip.png"),
    die: require("../assets/sprites/carrot-rabbit-die-strip.png"),
  },
  bossSlime: {
    idle: require("../assets/sprites/boss-slime-idle-strip.png"),
    hit: require("../assets/sprites/boss-slime-hit-strip.png"),
    die: require("../assets/sprites/boss-slime-die-strip.png"),
  },
  bossMushroom: {
    idle: require("../assets/sprites/boss-mushroom-idle-strip.png"),
    hit: require("../assets/sprites/boss-mushroom-hit-strip.png"),
    die: require("../assets/sprites/boss-mushroom-die-strip.png"),
  },
  bossPotato: {
    idle: require("../assets/sprites/boss-potato-idle-strip.png"),
    hit: require("../assets/sprites/boss-potato-hit-strip.png"),
    die: require("../assets/sprites/boss-potato-die-strip.png"),
  },
};

export const images = {
  battleBackground: require("../assets/sprites/battle-forest.png"),
  battleBackgroundMushroom: require("../assets/sprites/battle-mushroom-swamp.png"),
  battleBackgroundFarm: require("../assets/sprites/battle-farm.png"),
};

export const icons = {
  map: require("../assets/icons/icon-map.png"),
  backpack: require("../assets/icons/icon-backpack.png"),
  coins: require("../assets/icons/icon-coins.png"),
  chest: require("../assets/icons/icon-chest.png"),
  potionRed: require("../assets/icons/icon-potion-red.png"),
  potionBlue: require("../assets/icons/icon-potion-blue.png"),
  compass: require("../assets/icons/icon-compass.png"),
  star: require("../assets/icons/icon-star.png"),
  heart: require("../assets/icons/icon-heart.png"),
  shop: require("../assets/icons/icon-shop.png"),
  key: require("../assets/icons/icon-key.png"),
  trophy: require("../assets/icons/icon-trophy.png"),
  energy: require("../assets/icons/icon-energy.png"),
  scroll: require("../assets/icons/icon-scroll.png"),
  home: require("../assets/icons/icon-home.png"),
  settings: require("../assets/icons/icon-settings.png"),
};

// A stretchable UI frame: `insets` (source px: top, right, bottom, left) mark the leafy
// corners/edges that NineSlice keeps unscaled while the plain middle stretches.
// `centerColor` replaces the stretched middle for frames that grow far taller than their art,
// where stretching a thin band would show streaks.
export type UiSlice = { source: number; width: number; height: number; insets: [number, number, number, number]; centerColor?: string };

export const uiSlices = {
  panelParchment: { source: require("../assets/ui/bar-parchment-1.png"), width: 716, height: 114, insets: [56, 72, 48, 70], centerColor: "#f9e4c0" },
  rowParchment: { source: require("../assets/ui/bar-parchment-2.png"), width: 713, height: 102, insets: [36, 50, 46, 60] },
  buttonParchment: { source: require("../assets/ui/btn-parchment-small.png"), width: 236, height: 89, insets: [30, 40, 40, 48] },
  buttonGreen: { source: require("../assets/ui/btn-green-wide.png"), width: 387, height: 99, insets: [35, 55, 45, 55] },
  buttonGreenFramed: { source: require("../assets/ui/btn-green-framed.png"), width: 238, height: 101, insets: [35, 55, 50, 45] },
  buttonWood: { source: require("../assets/ui/btn-wood-1.png"), width: 226, height: 102, insets: [32, 50, 48, 40] },
  // Crystal is baked into the left end, so the left inset is wide enough to keep it intact.
  navBattle: { source: require("../assets/ui/nav-battle.png"), width: 320, height: 100, insets: [35, 40, 45, 140] },
  navParchment: { source: require("../assets/ui/nav-parchment.png"), width: 397, height: 104, insets: [35, 55, 48, 45] },
} satisfies Record<string, UiSlice>;

export const uiImages = {
  tileRed: require("../assets/ui/tile-red.png"),
  tilePurple: require("../assets/ui/tile-purple.png"),
  tileTeal: require("../assets/ui/tile-teal.png"),
  tileGold: require("../assets/ui/tile-gold.png"),
  keyStone: require("../assets/ui/key-stone-1.png"),
  coin: require("../assets/ui/round-coin.png"),
  chest: require("../assets/ui/chest.png"),
  flower: require("../assets/ui/flower.png"),
};

// Every strip frame is 228x228px, in a 5-frame row (guinea/slime) or 4-frame row (boss).
export const FRAME_SIZE = 228;
