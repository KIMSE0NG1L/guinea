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

export const uiImages = {
  coin: require("../assets/ui/coin.png"),
  coins: require("../assets/ui/item-coins.png"),
  crystal: require("../assets/ui/item-crystal.png"),
  gear: require("../assets/ui/item-gear.png"),
  badgeAlert: require("../assets/ui/badge-alert.png"),
};

// Every strip frame is 160x160px, in a 5-frame row (guinea/slime) or 4-frame row (boss).
export const FRAME_SIZE = 160;
