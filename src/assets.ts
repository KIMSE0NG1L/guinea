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
  bossCarrotGiant: {
    idle: require("../assets/sprites/boss-carrot-giant-idle-strip.png"),
    hit: require("../assets/sprites/boss-carrot-giant-hit-strip.png"),
    die: require("../assets/sprites/boss-carrot-giant-die-strip.png"),
  },
  chicken: {
    idle: require("../assets/sprites/chick-egg-idle-strip.png"),
    hit: require("../assets/sprites/chick-egg-hit-strip.png"),
    die: require("../assets/sprites/chick-egg-die-strip.png"),
  },
  bossChicken: {
    idle: require("../assets/sprites/boss-chick-idle-strip.png"),
    hit: require("../assets/sprites/boss-chick-hit-strip.png"),
    die: require("../assets/sprites/boss-chick-die-strip.png"),
  },
  potato: {
    idle: require("../assets/sprites/little-potato-idle-strip.png"),
    hit: require("../assets/sprites/little-potato-hit-strip.png"),
    die: require("../assets/sprites/little-potato-die-strip.png"),
  },
  bossPotato: {
    idle: require("../assets/sprites/boss-potato-idle-strip.png"),
    hit: require("../assets/sprites/boss-potato-hit-strip.png"),
    die: require("../assets/sprites/boss-potato-die-strip.png"),
  },
  mouse: {
    idle: require("../assets/sprites/city-mouse-idle-strip.png"),
    hit: require("../assets/sprites/city-mouse-hit-strip.png"),
    die: require("../assets/sprites/city-mouse-die-strip.png"),
  },
  bossFatCat: {
    idle: require("../assets/sprites/boss-fatcat-idle-strip.png"),
    hit: require("../assets/sprites/boss-fatcat-hit-strip.png"),
    die: require("../assets/sprites/boss-fatcat-die-strip.png"),
  },
  cauldron: {
    idle: require("../assets/sprites/cauldron-idle-strip.png"),
    hit: require("../assets/sprites/cauldron-hit-strip.png"),
    die: require("../assets/sprites/cauldron-die-strip.png"),
  },
  bossFridge: {
    idle: require("../assets/sprites/boss-fridge-idle-strip.png"),
    hit: require("../assets/sprites/boss-fridge-hit-strip.png"),
    die: require("../assets/sprites/boss-fridge-die-strip.png"),
  },
  mudskipper: {
    idle: require("../assets/sprites/mudskipper-idle-strip.png"),
    hit: require("../assets/sprites/mudskipper-hit-strip.png"),
    die: require("../assets/sprites/mudskipper-die-strip.png"),
  },
  bossKingCrab: {
    idle: require("../assets/sprites/boss-kingcrab-idle-strip.png"),
    hit: require("../assets/sprites/boss-kingcrab-hit-strip.png"),
    die: require("../assets/sprites/boss-kingcrab-die-strip.png"),
  },
  bluefish: {
    idle: require("../assets/sprites/bluefish-idle-strip.png"),
    hit: require("../assets/sprites/bluefish-hit-strip.png"),
    die: require("../assets/sprites/bluefish-die-strip.png"),
  },
  bossShark: {
    idle: require("../assets/sprites/boss-shark-idle-strip.png"),
    hit: require("../assets/sprites/boss-shark-hit-strip.png"),
    die: require("../assets/sprites/boss-shark-die-strip.png"),
  },
  salamander: {
    idle: require("../assets/sprites/lava-salamander-idle-strip.png"),
    hit: require("../assets/sprites/lava-salamander-hit-strip.png"),
    die: require("../assets/sprites/lava-salamander-die-strip.png"),
  },
  bossLavaSlime: {
    idle: require("../assets/sprites/boss-lavaslime-idle-strip.png"),
    hit: require("../assets/sprites/boss-lavaslime-hit-strip.png"),
    die: require("../assets/sprites/boss-lavaslime-die-strip.png"),
  },
  monkey: {
    idle: require("../assets/sprites/banasungi-idle-strip.png"),
    hit: require("../assets/sprites/banasungi-hit-strip.png"),
    die: require("../assets/sprites/banasungi-die-strip.png"),
  },
  bossCarnivorousPlant: {
    idle: require("../assets/sprites/boss-carnivorous-plant-idle-strip.png"),
    hit: require("../assets/sprites/boss-carnivorous-plant-hit-strip.png"),
    die: require("../assets/sprites/boss-carnivorous-plant-die-strip.png"),
  },
  carp: {
    idle: require("../assets/sprites/ingeo-idle-strip.png"),
    hit: require("../assets/sprites/ingeo-hit-strip.png"),
    die: require("../assets/sprites/ingeo-die-strip.png"),
  },
  bossStreamDragon: {
    idle: require("../assets/sprites/boss-stream-dragon-idle-strip.png"),
    hit: require("../assets/sprites/boss-stream-dragon-hit-strip.png"),
    die: require("../assets/sprites/boss-stream-dragon-die-strip.png"),
  },
  cactus: {
    idle: require("../assets/sprites/cactus-idle-strip.png"),
    hit: require("../assets/sprites/cactus-hit-strip.png"),
    die: require("../assets/sprites/cactus-die-strip.png"),
  },
  bossDehydratedCamel: {
    idle: require("../assets/sprites/boss-dehydrated-camel-idle-strip.png"),
    hit: require("../assets/sprites/boss-dehydrated-camel-hit-strip.png"),
    die: require("../assets/sprites/boss-dehydrated-camel-die-strip.png"),
  },
};

export const images = {
  battleBackground: require("../assets/sprites/battle-forest.png"),
  battleBackgroundMushroom: require("../assets/sprites/battle-mushroom-swamp.png"),
  battleBackgroundFarm: require("../assets/sprites/battle-farm.png"),
  battleBackgroundChicken: require("../assets/sprites/battle-chicken-farm.png"),
  battleBackgroundPotatoCave: require("../assets/sprites/battle-potato-cave.png"),
  battleBackgroundVillage: require("../assets/sprites/battle-village.png"),
  battleBackgroundMansionKitchen: require("../assets/sprites/battle-mansion-kitchen.png"),
  battleBackgroundHarborBeach: require("../assets/sprites/battle-harbor-beach.png"),
  battleBackgroundSunkenReef: require("../assets/sprites/battle-sunken-reef.png"),
  battleBackgroundVolcanoIsland: require("../assets/sprites/battle-volcano-island.png"),
  battleBackgroundTropicalJungle: require("../assets/sprites/battle-tropical-jungle.png"),
  battleBackgroundOasis: require("../assets/sprites/battle-oasis.png"),
  battleBackgroundDesert: require("../assets/sprites/battle-desert.png"),
};

// A 3-frame flash played once over the enemy when a hit lands as a critical.
export const effects = {
  critFlash: require("../assets/sprites/crit-flash-strip.png"),
  // Guinea Beam: charge → full beam → dissipate. 512x250 each, muzzle ring at the left.
  beam: [
    require("../assets/effects/beam-1.png"),
    require("../assets/effects/beam-2.png"),
    require("../assets/effects/beam-3.png"),
  ],
};

export const icons = {
  map: require("../assets/icons/icon-map.png"),
  backpack: require("../assets/icons/icon-backpack.png"),
  backpackOutlined: require("../assets/icons/icon-backpack-outlined.png"),
  // Trimmed to their visible art, for the battle scene's fixed-box button row.
  mapTrim: require("../assets/icons/icon-map-trim.png"),
  backpackTrim: require("../assets/icons/icon-backpack-trim.png"),
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
  settingsGear: require("../assets/icons/icon-settings-gear.png"),
  questMedal: require("../assets/icons/icon-quest-medal.png"),
};

export const uiImages = {
  coin: require("../assets/ui/coin.png"),
  coins: require("../assets/ui/item-coins.png"),
  crystal: require("../assets/ui/item-crystal.png"),
  gear: require("../assets/ui/item-gear.png"),
  badgeAlert: require("../assets/ui/badge-alert.png"),
  carrot: require("../assets/ui/item-carrot.png"),
};

// Skill icons, 256px wide; SKILL_ICON_ASPECT is each one's width / height.
export const skillImages = {
  beam: require("../assets/skills/beam.png"),
  steal: require("../assets/skills/steal.png"),
  focus: require("../assets/skills/focus.png"),
  execute: require("../assets/skills/execute.png"),
  shout: require("../assets/skills/shout.png"),
  diligent: require("../assets/skills/diligent.png"),
  glutton: require("../assets/skills/glutton.png"),
};
const WIDE_ICON = 256 / 222;
const SQUARE_ICON = 256 / 258;
export const SKILL_ICON_ASPECT: Record<keyof typeof skillImages, number> = {
  beam: WIDE_ICON,
  steal: WIDE_ICON,
  focus: WIDE_ICON,
  execute: WIDE_ICON,
  shout: SQUARE_ICON,
  diligent: SQUARE_ICON,
  glutton: SQUARE_ICON,
};

export const food = {
  cookPot: require("../assets/food/cook-pot.png"),
  cookPotOutlined: require("../assets/food/cook-pot-outlined.png"),
  cookPotTrim: require("../assets/food/cook-pot-trim.png"),
  fryingPan: require("../assets/food/frying-pan.png"),
  stewPot: require("../assets/food/stew-pot.png"),
  cuttingBoard: require("../assets/food/cutting-board.png"),
  kitchen: require("../assets/food/kitchen.png"),
  carrot: require("../assets/food/carrot.png"),
  tomato: require("../assets/food/tomato.png"),
  potato: require("../assets/food/potato.png"),
  mushroom: require("../assets/food/mushroom.png"),
  cabbage: require("../assets/food/cabbage.png"),
  pumpkin: require("../assets/food/pumpkin.png"),
  corn: require("../assets/food/corn.png"),
  onion: require("../assets/food/onion.png"),
  egg: require("../assets/food/egg.png"),
  milk: require("../assets/food/milk.png"),
  cheese: require("../assets/food/cheese.png"),
  chicken: require("../assets/food/chicken.png"),
  porkBelly: require("../assets/food/pork-belly.png"),
  beef: require("../assets/food/beef.png"),
  lamb: require("../assets/food/lamb.png"),
  salmon: require("../assets/food/salmon.png"),
  // Grilled versions, saved for future grill recipes.
  chickenGrilled: require("../assets/food/chicken-grilled.png"),
  porkBellyGrilled: require("../assets/food/pork-belly-grilled.png"),
  beefGrilled: require("../assets/food/beef-grilled.png"),
  lambGrilled: require("../assets/food/lamb-grilled.png"),
  salmonGrilled: require("../assets/food/salmon-grilled.png"),
  pudding: require("../assets/food/pudding.png"),
  mushroomSoup: require("../assets/food/mushroom-soup.png"),
  pumpkinRoast: require("../assets/food/pumpkin-roast.png"),
};

// A stretchable UI frame: `insets` (source px: top, right, bottom, left) mark the rounded
// corners/outline that NineSlice keeps unscaled while the plain middle stretches.
// `centerColor` replaces the stretched middle for frames that grow far past their art.
export type UiSlice = { source: number; width: number; height: number; insets: [number, number, number, number]; centerColor?: string };

const slice = (source: number, width: number, height: number, insets: UiSlice["insets"], centerColor?: string): UiSlice => ({
  source,
  width,
  height,
  insets,
  centerColor,
});

export const kit = {
  panelLarge: slice(require("../assets/ui/kit-panel-lg.png"), 426, 231, [30, 30, 34, 30], "#fcf3d8"),
  panel: slice(require("../assets/ui/kit-panel.png"), 303, 115, [26, 26, 30, 26], "#fbf3d8"),
  panelSmall: slice(require("../assets/ui/kit-panel-sm.png"), 118, 116, [26, 26, 30, 26]),
  panelBrown: slice(require("../assets/ui/kit-panel-brown.png"), 221, 110, [26, 26, 30, 26], "#714c32"),
  panelParchment: slice(require("../assets/ui/kit-panel-parchment.png"), 211, 108, [30, 30, 30, 30], "#f8deae"),
  inset: slice(require("../assets/ui/kit-inset.png"), 253, 108, [32, 32, 34, 32], "#e6d9be"),
  slot: slice(require("../assets/ui/kit-slot.png"), 111, 113, [32, 32, 34, 32], "#d8c5a6"),
  buttonCream: slice(require("../assets/ui/kit-btn-cream.png"), 206, 92, [26, 26, 30, 26]),
  buttonGreen: slice(require("../assets/ui/kit-btn-green.png"), 271, 92, [26, 26, 30, 26]),
  buttonBeige: slice(require("../assets/ui/kit-btn-beige.png"), 176, 92, [26, 26, 30, 26]),
  buttonGray: slice(require("../assets/ui/kit-btn-gray.png"), 176, 93, [26, 26, 30, 26]),
  buttonBrown: slice(require("../assets/ui/kit-panel-brown.png"), 221, 110, [26, 26, 30, 26]),
  // The raised bump sits left of centre, so the left inset spans it to keep it unstretched.
  tabGreen: slice(require("../assets/ui/kit-tab-green.png"), 165, 73, [26, 50, 24, 108]),
  track: slice(require("../assets/ui/kit-track.png"), 362, 47, [20, 24, 20, 24], "#f8eac7"),
};

// Grandma's grocery: warmer wood-and-linen frames from the shop sheet.
export const shopKit = {
  cardWood: slice(require("../assets/shop/card-wood.png"), 184, 253, [36, 36, 40, 36], "#fcf1d5"),
  frameWide: slice(require("../assets/shop/frame-wide.png"), 598, 237, [70, 60, 70, 70], "#faedd1"),
  // Tail hangs off the bottom-left, so those insets are wide enough to keep it whole.
  bubble: slice(require("../assets/shop/bubble.png"), 347, 206, [40, 40, 60, 80], "#fcf2d9"),
  // Coin is baked into the left end.
  coinPill: slice(require("../assets/shop/coin-pill.png"), 331, 104, [30, 50, 36, 100]),
  pillRed: slice(require("../assets/shop/pill-red.png"), 225, 74, [30, 40, 34, 40]),
  pillCream: slice(require("../assets/shop/pill-cream.png"), 225, 72, [30, 40, 34, 40]),
  pillGray: slice(require("../assets/shop/pill-gray.png"), 188, 74, [30, 40, 34, 40]),
};

export const shopImages = {
  background: require("../assets/shop/background.jpg"),
  tabCream: require("../assets/shop/tab-cream.png"),
  tabRed: require("../assets/shop/tab-red.png"),
  arrowBack: require("../assets/shop/arrow-back.png"),
};

export const chef = {
  spoon: require("../assets/npc/chef-spoon.png"),
  cheer: require("../assets/npc/chef-cheer.png"),
  serve: require("../assets/npc/chef-serve.png"),
  book: require("../assets/npc/chef-book.png"),
  wok: require("../assets/npc/chef-wok.png"),
};

// Blank recipe scrolls/books. A recipe's card is one of these plus its dish drawn on top,
// so a new recipe never needs its own art.
export const recipeTemplates = {
  scrollPlain: require("../assets/recipe-templates/scroll-plain.png"),
  scrollRibbonCrown: require("../assets/recipe-templates/scroll-ribbon-crown.png"),
  bookRed: require("../assets/recipe-templates/book-red.png"),
  bookBlueStar: require("../assets/recipe-templates/book-blue-star.png"),
  bookBrown: require("../assets/recipe-templates/book-brown.png"),
  scrollSealedGold: require("../assets/recipe-templates/scroll-sealed-gold.png"),
};

export const grandma = {
  happy: require("../assets/npc/grandma-happy.png"),
  wave: require("../assets/npc/grandma-wave.png"),
  basket: require("../assets/npc/grandma-basket.png"),
  menu: require("../assets/npc/grandma-menu.png"),
  counter: require("../assets/npc/grandma-counter.png"),
};

export const statIcons = {
  attack: require("../assets/stats/attack.png"),
  criticalDamage: require("../assets/stats/critical-damage.png"),
  criticalChance: require("../assets/stats/critical-chance.png"),
  goldBonus: require("../assets/stats/gold.png"),
};

// Rounded green/cream button set.
export const buttonKit = {
  pillCream: slice(require("../assets/buttons/pill-cream.png"), 255, 94, [36, 46, 40, 46]),
};

export const buttonImages = {
  plusGreen: require("../assets/buttons/plus-green.png"),
};

export const navIcons = {
  battle: require("../assets/nav/battle.png"),
  companions: require("../assets/nav/companions.png"),
  skills: require("../assets/nav/skills.png"),
  shop: require("../assets/nav/shop.png"),
};

export const kitImages = {
  toggleOn: require("../assets/ui/kit-toggle-on.png"),
  toggleOff: require("../assets/ui/kit-toggle-off.png"),
  dotRed: require("../assets/ui/kit-dot-red.png"),
};

// Every strip frame is 160x160px, in a 5-frame row (guinea/slime) or 4-frame row (boss).
export const FRAME_SIZE = 160;
