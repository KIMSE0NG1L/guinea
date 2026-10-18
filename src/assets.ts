// Metro requires static require() calls — no dynamic `guinea-${outfit}-idle.png` strings.
// This file is the one place that enumerates every sprite strip and small icon.

export const spriteSheets = {
  guinea: {
    default: {
      idle: require("../assets/sprites/guinea-idle-strip.webp"),
      attack: require("../assets/sprites/guinea-attack-strip.webp"),
      critical: require("../assets/sprites/guinea-critical-strip.webp"),
      win: require("../assets/sprites/guinea-win-strip.webp"),
    },
    explorerHamster: {
      idle: require("../assets/sprites/guinea-explorer-hamster-idle-strip.webp"),
      attack: require("../assets/sprites/guinea-explorer-hamster-attack-strip.webp"),
      critical: require("../assets/sprites/guinea-explorer-hamster-critical-strip.webp"),
      win: require("../assets/sprites/guinea-explorer-hamster-win-strip.webp"),
    },
    tetoGini: {
      idle: require("../assets/sprites/guinea-teto-idle-strip.webp"),
      // Critical reuses the attack strip verbatim — no separate critical art for this outfit.
      attack: require("../assets/sprites/guinea-teto-attack-strip.webp"),
      critical: require("../assets/sprites/guinea-teto-attack-strip.webp"),
      win: require("../assets/sprites/guinea-teto-win-strip.webp"),
    },
    assassinGini: {
      idle: require("../assets/sprites/guinea-assassin-idle-strip.webp"),
      attack: require("../assets/sprites/guinea-assassin-attack-strip.webp"),
      critical: require("../assets/sprites/guinea-assassin-critical-strip.webp"),
      win: require("../assets/sprites/guinea-assassin-win-strip.webp"),
    },
    egenGini: {
      idle: require("../assets/sprites/guinea-egen-idle-strip.webp"),
      attack: require("../assets/sprites/guinea-egen-attack-strip.webp"),
      critical: require("../assets/sprites/guinea-egen-critical-strip.webp"),
      win: require("../assets/sprites/guinea-egen-win-strip.webp"),
    },
  },
  slime: {
    idle: require("../assets/sprites/slime-idle-strip.webp"),
    hit: require("../assets/sprites/slime-hit-strip.webp"),
    die: require("../assets/sprites/slime-die-strip.webp"),
  },
  mushroom: {
    idle: require("../assets/sprites/mushroom-idle-strip.webp"),
    hit: require("../assets/sprites/mushroom-hit-strip.webp"),
    die: require("../assets/sprites/mushroom-die-strip.webp"),
  },
  carrot: {
    idle: require("../assets/sprites/carrot-rabbit-idle-strip.webp"),
    hit: require("../assets/sprites/carrot-rabbit-hit-strip.webp"),
    die: require("../assets/sprites/carrot-rabbit-die-strip.webp"),
  },
  bossSlime: {
    idle: require("../assets/sprites/boss-slime-idle-strip.webp"),
    hit: require("../assets/sprites/boss-slime-hit-strip.webp"),
    die: require("../assets/sprites/boss-slime-die-strip.webp"),
  },
  bossMushroom: {
    idle: require("../assets/sprites/boss-mushroom-idle-strip.webp"),
    hit: require("../assets/sprites/boss-mushroom-hit-strip.webp"),
    die: require("../assets/sprites/boss-mushroom-die-strip.webp"),
  },
  bossCarrotGiant: {
    idle: require("../assets/sprites/boss-carrot-giant-idle-strip.webp"),
    hit: require("../assets/sprites/boss-carrot-giant-hit-strip.webp"),
    die: require("../assets/sprites/boss-carrot-giant-die-strip.webp"),
  },
  chicken: {
    idle: require("../assets/sprites/chick-egg-idle-strip.webp"),
    hit: require("../assets/sprites/chick-egg-hit-strip.webp"),
    die: require("../assets/sprites/chick-egg-die-strip.webp"),
  },
  bossChicken: {
    idle: require("../assets/sprites/boss-chick-idle-strip.webp"),
    hit: require("../assets/sprites/boss-chick-hit-strip.webp"),
    die: require("../assets/sprites/boss-chick-die-strip.webp"),
  },
  potato: {
    idle: require("../assets/sprites/little-potato-idle-strip.webp"),
    hit: require("../assets/sprites/little-potato-hit-strip.webp"),
    die: require("../assets/sprites/little-potato-die-strip.webp"),
  },
  bossPotato: {
    idle: require("../assets/sprites/boss-potato-idle-strip.webp"),
    hit: require("../assets/sprites/boss-potato-hit-strip.webp"),
    die: require("../assets/sprites/boss-potato-die-strip.webp"),
  },
  mouse: {
    idle: require("../assets/sprites/city-mouse-idle-strip.webp"),
    hit: require("../assets/sprites/city-mouse-hit-strip.webp"),
    die: require("../assets/sprites/city-mouse-die-strip.webp"),
  },
  bossFatCat: {
    idle: require("../assets/sprites/boss-fatcat-idle-strip.webp"),
    hit: require("../assets/sprites/boss-fatcat-hit-strip.webp"),
    die: require("../assets/sprites/boss-fatcat-die-strip.webp"),
  },
  cauldron: {
    idle: require("../assets/sprites/cauldron-idle-strip.webp"),
    hit: require("../assets/sprites/cauldron-hit-strip.webp"),
    die: require("../assets/sprites/cauldron-die-strip.webp"),
  },
  bossFridge: {
    idle: require("../assets/sprites/boss-fridge-idle-strip.webp"),
    hit: require("../assets/sprites/boss-fridge-hit-strip.webp"),
    die: require("../assets/sprites/boss-fridge-die-strip.webp"),
  },
  mudskipper: {
    idle: require("../assets/sprites/mudskipper-idle-strip.webp"),
    hit: require("../assets/sprites/mudskipper-hit-strip.webp"),
    die: require("../assets/sprites/mudskipper-die-strip.webp"),
  },
  bossKingCrab: {
    idle: require("../assets/sprites/boss-kingcrab-idle-strip.webp"),
    hit: require("../assets/sprites/boss-kingcrab-hit-strip.webp"),
    die: require("../assets/sprites/boss-kingcrab-die-strip.webp"),
  },
  bluefish: {
    idle: require("../assets/sprites/bluefish-idle-strip.webp"),
    hit: require("../assets/sprites/bluefish-hit-strip.webp"),
    die: require("../assets/sprites/bluefish-die-strip.webp"),
  },
  bossShark: {
    idle: require("../assets/sprites/boss-shark-idle-strip.webp"),
    hit: require("../assets/sprites/boss-shark-hit-strip.webp"),
    die: require("../assets/sprites/boss-shark-die-strip.webp"),
  },
  salamander: {
    idle: require("../assets/sprites/lava-salamander-idle-strip.webp"),
    hit: require("../assets/sprites/lava-salamander-hit-strip.webp"),
    die: require("../assets/sprites/lava-salamander-die-strip.webp"),
  },
  bossLavaSlime: {
    idle: require("../assets/sprites/boss-lavaslime-idle-strip.webp"),
    hit: require("../assets/sprites/boss-lavaslime-hit-strip.webp"),
    die: require("../assets/sprites/boss-lavaslime-die-strip.webp"),
  },
  monkey: {
    idle: require("../assets/sprites/banasungi-idle-strip.webp"),
    hit: require("../assets/sprites/banasungi-hit-strip.webp"),
    die: require("../assets/sprites/banasungi-die-strip.webp"),
  },
  bossCarnivorousPlant: {
    idle: require("../assets/sprites/boss-carnivorous-plant-idle-strip.webp"),
    hit: require("../assets/sprites/boss-carnivorous-plant-hit-strip.webp"),
    die: require("../assets/sprites/boss-carnivorous-plant-die-strip.webp"),
  },
  carp: {
    idle: require("../assets/sprites/ingeo-idle-strip.webp"),
    hit: require("../assets/sprites/ingeo-hit-strip.webp"),
    die: require("../assets/sprites/ingeo-die-strip.webp"),
  },
  bossStreamDragon: {
    idle: require("../assets/sprites/boss-stream-dragon-idle-strip.webp"),
    hit: require("../assets/sprites/boss-stream-dragon-hit-strip.webp"),
    die: require("../assets/sprites/boss-stream-dragon-die-strip.webp"),
  },
  cactus: {
    idle: require("../assets/sprites/cactus-idle-strip.webp"),
    hit: require("../assets/sprites/cactus-hit-strip.webp"),
    die: require("../assets/sprites/cactus-die-strip.webp"),
  },
  bossDehydratedCamel: {
    idle: require("../assets/sprites/boss-dehydrated-camel-idle-strip.webp"),
    hit: require("../assets/sprites/boss-dehydrated-camel-hit-strip.webp"),
    die: require("../assets/sprites/boss-dehydrated-camel-die-strip.webp"),
  },
  fox: {
    idle: require("../assets/sprites/desert-fox-idle-strip.webp"),
    hit: require("../assets/sprites/desert-fox-hit-strip.webp"),
    die: require("../assets/sprites/desert-fox-die-strip.webp"),
  },
  bossRattlesnake: {
    idle: require("../assets/sprites/boss-rattlesnake-idle-strip.webp"),
    hit: require("../assets/sprites/boss-rattlesnake-hit-strip.webp"),
    die: require("../assets/sprites/boss-rattlesnake-die-strip.webp"),
  },
  lizard: {
    idle: require("../assets/sprites/night-lizard-idle-strip.webp"),
    hit: require("../assets/sprites/night-lizard-hit-strip.webp"),
    die: require("../assets/sprites/night-lizard-die-strip.webp"),
  },
  bossHauntedGoat: {
    idle: require("../assets/sprites/boss-haunted-goat-idle-strip.webp"),
    hit: require("../assets/sprites/boss-haunted-goat-hit-strip.webp"),
    die: require("../assets/sprites/boss-haunted-goat-die-strip.webp"),
  },
  mantou: {
    idle: require("../assets/sprites/mantou-man-idle-strip.webp"),
    hit: require("../assets/sprites/mantou-man-hit-strip.webp"),
    die: require("../assets/sprites/mantou-man-die-strip.webp"),
  },
  bossBambooPanda: {
    idle: require("../assets/sprites/boss-bamboo-panda-idle-strip.webp"),
    hit: require("../assets/sprites/boss-bamboo-panda-hit-strip.webp"),
    die: require("../assets/sprites/boss-bamboo-panda-die-strip.webp"),
  },
  pig: {
    idle: require("../assets/sprites/pig-grunt-idle-strip.webp"),
    hit: require("../assets/sprites/pig-grunt-hit-strip.webp"),
    die: require("../assets/sprites/pig-grunt-die-strip.webp"),
  },
  bossTurtleSpirit: {
    idle: require("../assets/sprites/boss-turtle-spirit-idle-strip.webp"),
    hit: require("../assets/sprites/boss-turtle-spirit-hit-strip.webp"),
    die: require("../assets/sprites/boss-turtle-spirit-die-strip.webp"),
  },
  magpie: {
    idle: require("../assets/sprites/magpie-persimmon-idle-strip.webp"),
    hit: require("../assets/sprites/magpie-persimmon-hit-strip.webp"),
    die: require("../assets/sprites/magpie-persimmon-die-strip.webp"),
  },
  bossTigerSpirit: {
    idle: require("../assets/sprites/boss-tiger-spirit-idle-strip.webp"),
    hit: require("../assets/sprites/boss-tiger-spirit-hit-strip.webp"),
    die: require("../assets/sprites/boss-tiger-spirit-die-strip.webp"),
  },
  snowRabbit: {
    idle: require("../assets/sprites/snow-rabbit-idle-strip.webp"),
    hit: require("../assets/sprites/snow-rabbit-hit-strip.webp"),
    die: require("../assets/sprites/snow-rabbit-die-strip.webp"),
  },
  bossIceGolem: {
    idle: require("../assets/sprites/boss-ice-golem-idle-strip.webp"),
    hit: require("../assets/sprites/boss-ice-golem-hit-strip.webp"),
    die: require("../assets/sprites/boss-ice-golem-die-strip.webp"),
  },
  drunkCat: {
    idle: require("../assets/sprites/drunk-cat-idle-strip.webp"),
    hit: require("../assets/sprites/drunk-cat-hit-strip.webp"),
    die: require("../assets/sprites/drunk-cat-die-strip.webp"),
  },
  bossTavernKeeper: {
    idle: require("../assets/sprites/boss-tavern-keeper-idle-strip.webp"),
    hit: require("../assets/sprites/boss-tavern-keeper-hit-strip.webp"),
    die: require("../assets/sprites/boss-tavern-keeper-die-strip.webp"),
  },
  flowerSnake: {
    idle: require("../assets/sprites/flower-snake-idle-strip.webp"),
    hit: require("../assets/sprites/flower-snake-hit-strip.webp"),
    die: require("../assets/sprites/flower-snake-die-strip.webp"),
  },
  bossNineTailedFox: {
    idle: require("../assets/sprites/boss-nine-tailed-fox-idle-strip.webp"),
    hit: require("../assets/sprites/boss-nine-tailed-fox-hit-strip.webp"),
    die: require("../assets/sprites/boss-nine-tailed-fox-die-strip.webp"),
  },
  riceSack: {
    idle: require("../assets/sprites/rice-sack-idle-strip.webp"),
    hit: require("../assets/sprites/rice-sack-hit-strip.webp"),
    die: require("../assets/sprites/rice-sack-die-strip.webp"),
  },
  bossChiliSack: {
    idle: require("../assets/sprites/boss-chili-sack-idle-strip.webp"),
    hit: require("../assets/sprites/boss-chili-sack-hit-strip.webp"),
    die: require("../assets/sprites/boss-chili-sack-die-strip.webp"),
  },
  mackerel: {
    idle: require("../assets/sprites/mackerel-idle-strip.webp"),
    hit: require("../assets/sprites/mackerel-hit-strip.webp"),
    die: require("../assets/sprites/mackerel-die-strip.webp"),
  },
  bossPirateOctopus: {
    idle: require("../assets/sprites/boss-pirate-octopus-idle-strip.webp"),
    hit: require("../assets/sprites/boss-pirate-octopus-hit-strip.webp"),
    die: require("../assets/sprites/boss-pirate-octopus-die-strip.webp"),
  },
};

export const images = {
  battleBackground: require("../assets/sprites/battle-forest.webp"),
  battleBackgroundMushroom: require("../assets/sprites/battle-mushroom-swamp.webp"),
  battleBackgroundFarm: require("../assets/sprites/battle-farm.webp"),
  battleBackgroundChicken: require("../assets/sprites/battle-chicken-farm.webp"),
  battleBackgroundPotatoCave: require("../assets/sprites/battle-potato-cave.webp"),
  battleBackgroundVillage: require("../assets/sprites/battle-village.webp"),
  battleBackgroundMansionKitchen: require("../assets/sprites/battle-mansion-kitchen.webp"),
  battleBackgroundHarborBeach: require("../assets/sprites/battle-harbor-beach.webp"),
  battleBackgroundSunkenReef: require("../assets/sprites/battle-sunken-reef.webp"),
  battleBackgroundVolcanoIsland: require("../assets/sprites/battle-volcano-island.webp"),
  battleBackgroundTropicalJungle: require("../assets/sprites/battle-tropical-jungle.webp"),
  battleBackgroundOasis: require("../assets/sprites/battle-oasis.webp"),
  battleBackgroundDesert: require("../assets/sprites/battle-desert.webp"),
  battleBackgroundDesertMarket: require("../assets/sprites/battle-desert-market.webp"),
  battleBackgroundSilkRoadNight: require("../assets/sprites/battle-silk-road-night.webp"),
  battleBackgroundBambooCloudCity: require("../assets/sprites/battle-bamboo-cloud-city.webp"),
  battleBackgroundBambooCloudPalace: require("../assets/sprites/battle-bamboo-cloud-palace.webp"),
  battleBackgroundSnowVillage: require("../assets/sprites/battle-snow-village.webp"),
  battleBackgroundSnowMountain: require("../assets/sprites/battle-snow-mountain.webp"),
  battleBackgroundSnowTavern: require("../assets/sprites/battle-snow-tavern.webp"),
  battleBackgroundAzaleaPath: require("../assets/sprites/battle-azalea-path.webp"),
  battleBackgroundJoseonMarket: require("../assets/sprites/battle-joseon-market.webp"),
  battleBackgroundFishingPort: require("../assets/sprites/battle-fishing-port.webp"),
};

// A 3-frame flash played once over the enemy when a hit lands as a critical.
export const effects = {
  critFlash: require("../assets/sprites/crit-flash-strip.webp"),
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
  codexBook: require("../assets/icons/icon-codex-book.png"),
  codexMonster: require("../assets/icons/icon-codex-monster.png"),
  codexIngredient: require("../assets/icons/icon-codex-ingredient.png"),
};

export const uiImages = {
  coin: require("../assets/ui/coin.png"),
  // Winged coin that flutters across the battle scene to be tapped.
  coinWinged: require("../assets/ui/coin-winged.png"),
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
  dishVeggieStew: require("../assets/food/dish-veggie-stew.png"),
  dishSalad: require("../assets/food/dish-salad.png"),
  dishBananaMilk: require("../assets/food/dish-banana-milk.png"),
  dishPotatoPancake: require("../assets/food/dish-potato-pancake.png"),
  dishSalmonSteak: require("../assets/food/dish-salmon-steak.png"),
  dishSlimePotion: require("../assets/food/dish-slime-potion.png"),
  dishYukhoe: require("../assets/food/dish-yukhoe.png"),
  dishMusselSeaweedSoup: require("../assets/food/dish-mussel-seaweed-soup.png"),
  dishSalmonSashimi: require("../assets/food/dish-salmon-sashimi.png"),
  dishTunaSashimi: require("../assets/food/dish-tuna-sashimi.png"),
  dishOctopus: require("../assets/food/dish-octopus.png"),
  dishShrimpSashimi: require("../assets/food/dish-shrimp-sashimi.png"),
  dishGreenJelly: require("../assets/food/dish-green-jelly.png"),
  dishRoyalJelly: require("../assets/food/dish-royal-jelly.png"),
  dishSteak: require("../assets/food/dish-steak.png"),
  dishSeafoodBoil: require("../assets/food/dish-seafood-boil.png"),
  crab: require("../assets/food/crab.png"),
  shrimp: require("../assets/food/shrimp.png"),
  octopus: require("../assets/food/octopus.png"),
  squid: require("../assets/food/squid.png"),
  tuna: require("../assets/food/tuna.png"),
  sardine: require("../assets/food/sardine.png"),
  mussel: require("../assets/food/mussel.png"),
  lobster: require("../assets/food/lobster.png"),
  oyster: require("../assets/food/oyster.png"),
  fishSteak: require("../assets/food/fish-steak.png"),
  sharkFin: require("../assets/food/shark-fin.png"),
  roe: require("../assets/food/roe.png"),
  chili: require("../assets/food/chili.png"),
  fireFruit: require("../assets/food/fire-fruit.png"),
  seaweed: require("../assets/food/seaweed.png"),
  greenJelly: require("../assets/food/green-jelly.png"),
  herb: require("../assets/food/herb.png"),
  dill: require("../assets/food/dill.png"),
  // 이슬: the water of this world's cooking, shed by slimes.
  dew: require("../assets/food/dew.png"),
  lemon: require("../assets/food/lemon.png"),
  greenApple: require("../assets/food/green-apple.png"),
  royalJelly: require("../assets/food/royal-jelly.png"),
  salt: require("../assets/food/salt.png"),
  crabMeat: require("../assets/food/crab-meat.png"),
  banana: require("../assets/food/banana.png"),
  mango: require("../assets/food/mango.png"),
  coconut: require("../assets/food/coconut.png"),
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

// Soft parchment-and-pill kit. Shared by the growth panel, buttons, cards and modals on
// every page — swapping art here reskins all of them.
export const kit = {
  panelLarge: slice(require("../assets/kit2/panel-xl.png"), 421, 145, [26, 26, 28, 26], "#feebbe"),
  panel: slice(require("../assets/kit2/card.png"), 176, 97, [24, 24, 26, 24], "#fbebcc"),
  panelSmall: slice(require("../assets/kit2/panel-square.png"), 133, 151, [26, 26, 28, 26], "#fdf0d6"),
  panelBrown: slice(require("../assets/kit2/plank.png"), 179, 59, [18, 24, 20, 24], "#deab6f"),
  panelParchment: slice(require("../assets/kit2/panel-tall.png"), 117, 153, [26, 26, 28, 26], "#feebbe"),
  inset: slice(require("../assets/kit2/cushion.png"), 157, 66, [22, 24, 24, 24], "#fde8bd"),
  slot: slice(require("../assets/kit2/sq-cream.png"), 54, 56, [16, 16, 18, 16], "#fceccb"),
  buttonCream: slice(require("../assets/kit2/btn-cream.png"), 147, 48, [16, 22, 18, 22]),
  buttonGreen: slice(require("../assets/kit2/btn-green.png"), 145, 49, [16, 22, 18, 22]),
  buttonBeige: slice(require("../assets/kit2/btn-tan-2.png"), 145, 48, [16, 22, 18, 22]),
  buttonGray: slice(require("../assets/kit2/btn-gray.png"), 134, 47, [16, 22, 18, 22]),
  buttonBrown: slice(require("../assets/kit2/plank.png"), 179, 59, [18, 24, 20, 24]),
  tabGreen: slice(require("../assets/kit2/green-panel.png"), 204, 95, [26, 28, 30, 28], "#82be3b"),
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

// Wood-and-brass frames: bars, slots, rings and emblems.
export const frameKit = {
  barFrame: slice(require("../assets/frames/bar-frame.png"), 495, 40, [10, 22, 10, 22], "#fde6be"),
  fillGold: slice(require("../assets/frames/fill-gold.png"), 275, 36, [14, 18, 14, 18]),
  fillGreen: slice(require("../assets/frames/fill-green.png"), 277, 36, [14, 18, 14, 18]),
  fillRed: slice(require("../assets/frames/fill-red.png"), 275, 34, [14, 18, 14, 18]),
  fillBlue: slice(require("../assets/frames/fill-blue.png"), 276, 36, [14, 18, 14, 18]),
  squareWood: slice(require("../assets/kit2/sq-cream.png"), 54, 56, [16, 16, 18, 16], "#fceccb"),
  squareGold: slice(require("../assets/kit2/frame-gold.png"), 134, 153, [24, 24, 24, 24], "#fdf2d7"),
};

export const frameImages = {
  slotPlus: require("../assets/frames/slot-wood-plus.png"),
  ringWood: require("../assets/frames/ring-wood.png"),
  ringGold: require("../assets/frames/ring-gold.png"),
};

export const headerKit = {
  nameTag: slice(require("../assets/kit2/scroll-tag.png"), 147, 55, [14, 26, 16, 26], "#f9e6c3"),
  // One cream card holding the whole profile (avatar, name, level, exp).
  // Wood-rimmed pill with a round socket on the left that the avatar sits in.
  profile: slice(require("../assets/kit2/pill-coin.png"), 232, 68, [20, 34, 22, 66], "#fdedcc"),
};

export const kitImages = {
  toggleOn: require("../assets/ui/kit-toggle-on.png"),
  toggleOff: require("../assets/ui/kit-toggle-off.png"),
  dotRed: require("../assets/ui/kit-dot-red.png"),
};

// Kenney.nl CC0 sound effects (public domain, no attribution required) — see
// assets/sfx/SOURCES.md for which pack and original file each one came from.
export const sfx = {
  hit: require("../assets/sfx/hit.wav"),
  crit: require("../assets/sfx/crit.wav"),
  levelup: require("../assets/sfx/levelup.wav"),
  bossEnter: require("../assets/sfx/boss_enter.wav"),
  uiClick: require("../assets/sfx/ui_click.wav"),
  uiToggle: require("../assets/sfx/ui_toggle.wav"),
  cookStart: require("../assets/sfx/cook_start.wav"),
  cookDone: require("../assets/sfx/cook_done.wav"),
};

// Looping background tracks — "Counter-Rhythms" by Buant for the field, "8-bit 보스전" while a boss is up.
export const bgm = {
  field: require("../assets/bgm/main_theme.mp3"),
  boss: require("../assets/bgm/boss_theme.mp3"),
};

// Every strip frame is 160x160px, in a 5-frame row (guinea/slime) or 4-frame row (boss).
export const FRAME_SIZE = 160;
