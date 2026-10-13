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

// Every strip frame is 228x228px, in a 5-frame row (guinea/slime) or 4-frame row (boss).
export const FRAME_SIZE = 228;
