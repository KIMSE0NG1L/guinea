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
    samuraiGini: {
      idle: require("../assets/sprites/guinea-samurai-idle-strip.webp"),
      attack: require("../assets/sprites/guinea-samurai-attack-strip.webp"),
      critical: require("../assets/sprites/guinea-samurai-critical-strip.webp"),
      win: require("../assets/sprites/guinea-samurai-win-strip.webp"),
    },
    chefGini: {
      idle: require("../assets/sprites/guinea-chef-idle-strip.webp"),
      attack: require("../assets/sprites/guinea-chef-attack-strip.webp"),
      critical: require("../assets/sprites/guinea-chef-critical-strip.webp"),
      win: require("../assets/sprites/guinea-chef-win-strip.webp"),
    },
    boxerGini: {
      idle: require("../assets/sprites/guinea-boxer-idle-strip.webp"),
      attack: require("../assets/sprites/guinea-boxer-attack-strip.webp"),
      critical: require("../assets/sprites/guinea-boxer-critical-strip.webp"),
      win: require("../assets/sprites/guinea-boxer-win-strip.webp"),
    },
    witchGini: {
      idle: require("../assets/sprites/witch-gini-idle-strip.webp"),
      attack: require("../assets/sprites/witch-gini-attack-strip.webp"),
      critical: require("../assets/sprites/witch-gini-critical-strip.webp"),
      win: require("../assets/sprites/witch-gini-win-strip.webp"),
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
  blossomCrab: {
    idle: require("../assets/sprites/blossom-crab-idle-strip.webp"),
    hit: require("../assets/sprites/blossom-crab-hit-strip.webp"),
    die: require("../assets/sprites/blossom-crab-die-strip.webp"),
  },
  bossBlossomShark: {
    idle: require("../assets/sprites/boss-blossom-shark-idle-strip.webp"),
    hit: require("../assets/sprites/boss-blossom-shark-hit-strip.webp"),
    die: require("../assets/sprites/boss-blossom-shark-die-strip.webp"),
  },
  shrineFox: {
    idle: require("../assets/sprites/shrine-fox-idle-strip.webp"),
    hit: require("../assets/sprites/shrine-fox-hit-strip.webp"),
    die: require("../assets/sprites/shrine-fox-die-strip.webp"),
  },
  bossTanukiMerchant: {
    idle: require("../assets/sprites/boss-tanuki-merchant-idle-strip.webp"),
    hit: require("../assets/sprites/boss-tanuki-merchant-hit-strip.webp"),
    die: require("../assets/sprites/boss-tanuki-merchant-die-strip.webp"),
  },
  armorBeetle: {
    idle: require("../assets/sprites/armor-beetle-idle-strip.webp"),
    hit: require("../assets/sprites/armor-beetle-hit-strip.webp"),
    die: require("../assets/sprites/armor-beetle-die-strip.webp"),
  },
  bossGoldenShachi: {
    idle: require("../assets/sprites/boss-golden-shachi-idle-strip.webp"),
    hit: require("../assets/sprites/boss-golden-shachi-hit-strip.webp"),
    die: require("../assets/sprites/boss-golden-shachi-die-strip.webp"),
  },
  onsenMonkey: {
    idle: require("../assets/sprites/onsen-monkey-idle-strip.webp"),
    hit: require("../assets/sprites/onsen-monkey-hit-strip.webp"),
    die: require("../assets/sprites/onsen-monkey-die-strip.webp"),
  },
  bossCapybaraInnkeeper: {
    idle: require("../assets/sprites/boss-capybara-innkeeper-idle-strip.webp"),
    hit: require("../assets/sprites/boss-capybara-innkeeper-hit-strip.webp"),
    die: require("../assets/sprites/boss-capybara-innkeeper-die-strip.webp"),
  },
  ninjaFrog: {
    idle: require("../assets/sprites/ninja-frog-idle-strip.webp"),
    hit: require("../assets/sprites/ninja-frog-hit-strip.webp"),
    die: require("../assets/sprites/ninja-frog-die-strip.webp"),
  },
  bossScrollRat: {
    idle: require("../assets/sprites/boss-scroll-rat-idle-strip.webp"),
    hit: require("../assets/sprites/boss-scroll-rat-hit-strip.webp"),
    die: require("../assets/sprites/boss-scroll-rat-die-strip.webp"),
  },
  lanternAngler: {
    idle: require("../assets/sprites/lantern-angler-idle-strip.webp"),
    hit: require("../assets/sprites/lantern-angler-hit-strip.webp"),
    die: require("../assets/sprites/lantern-angler-die-strip.webp"),
  },
  bossSeahorseGeneral: {
    idle: require("../assets/sprites/boss-seahorse-general-idle-strip.webp"),
    hit: require("../assets/sprites/boss-seahorse-general-hit-strip.webp"),
    die: require("../assets/sprites/boss-seahorse-general-die-strip.webp"),
  },
  clamMaid: {
    idle: require("../assets/sprites/clam-maid-idle-strip.webp"),
    hit: require("../assets/sprites/clam-maid-hit-strip.webp"),
    die: require("../assets/sprites/clam-maid-die-strip.webp"),
  },
  bossDragonKing: {
    idle: require("../assets/sprites/boss-dragon-king-idle-strip.webp"),
    hit: require("../assets/sprites/boss-dragon-king-hit-strip.webp"),
    die: require("../assets/sprites/boss-dragon-king-die-strip.webp"),
  },
  gondolaDuck: {
    idle: require("../assets/sprites/gondola-duck-idle-strip.webp"),
    hit: require("../assets/sprites/gondola-duck-hit-strip.webp"),
    die: require("../assets/sprites/gondola-duck-die-strip.webp"),
  },
  bossOvenGolem: {
    idle: require("../assets/sprites/boss-oven-golem-idle-strip.webp"),
    hit: require("../assets/sprites/boss-oven-golem-hit-strip.webp"),
    die: require("../assets/sprites/boss-oven-golem-die-strip.webp"),
  },
  bellCalf: {
    idle: require("../assets/sprites/bell-calf-idle-strip.webp"),
    hit: require("../assets/sprites/bell-calf-hit-strip.webp"),
    die: require("../assets/sprites/bell-calf-die-strip.webp"),
  },
  bossRescueDog: {
    idle: require("../assets/sprites/boss-rescue-dog-idle-strip.webp"),
    hit: require("../assets/sprites/boss-rescue-dog-hit-strip.webp"),
    die: require("../assets/sprites/boss-rescue-dog-die-strip.webp"),
  },
  croissantKid: {
    idle: require("../assets/sprites/croissant-kid-idle-strip.webp"),
    hit: require("../assets/sprites/croissant-kid-hit-strip.webp"),
    die: require("../assets/sprites/croissant-kid-die-strip.webp"),
  },
  bossBaguetteKnight: {
    idle: require("../assets/sprites/boss-baguette-knight-idle-strip.webp"),
    hit: require("../assets/sprites/boss-baguette-knight-hit-strip.webp"),
    die: require("../assets/sprites/boss-baguette-knight-die-strip.webp"),
  },
  sleepyGini: {
    idle: require("../assets/sprites/sleepy-gini-idle-strip.webp"),
    hit: require("../assets/sprites/sleepy-gini-hit-strip.webp"),
    die: require("../assets/sprites/sleepy-gini-die-strip.webp"),
  },
  bossElderGini: {
    idle: require("../assets/sprites/boss-elder-gini-idle-strip.webp"),
    hit: require("../assets/sprites/boss-elder-gini-hit-strip.webp"),
    die: require("../assets/sprites/boss-elder-gini-die-strip.webp"),
  },
  sleepwalkerGini: {
    idle: require("../assets/sprites/sleepwalker-gini-idle-strip.webp"),
    hit: require("../assets/sprites/sleepwalker-gini-hit-strip.webp"),
    die: require("../assets/sprites/sleepwalker-gini-die-strip.webp"),
  },
  bossWitchGini: {
    idle: require("../assets/sprites/boss-witch-gini-idle-strip.webp"),
    hit: require("../assets/sprites/boss-witch-gini-hit-strip.webp"),
    die: require("../assets/sprites/boss-witch-gini-die-strip.webp"),
  },
  candyBasketSlime: {
    idle: require("../assets/sprites/candy-basket-slime-idle-strip.webp"),
    hit: require("../assets/sprites/candy-basket-slime-hit-strip.webp"),
    die: require("../assets/sprites/candy-basket-slime-die-strip.webp"),
  },
  bossPumpkinGolem: {
    idle: require("../assets/sprites/pumpkin-golem-boss-idle-strip.webp"),
    hit: require("../assets/sprites/pumpkin-golem-boss-hit-strip.webp"),
    die: require("../assets/sprites/pumpkin-golem-boss-die-strip.webp"),
  },
  bee: {
    idle: require("../assets/sprites/bee-idle-strip.webp"),
    hit: require("../assets/sprites/bee-hit-strip.webp"),
    die: require("../assets/sprites/bee-die-strip.webp"),
  },
  bossQueenBee: {
    idle: require("../assets/sprites/queen-bee-idle-strip.webp"),
    hit: require("../assets/sprites/queen-bee-hit-strip.webp"),
    die: require("../assets/sprites/queen-bee-die-strip.webp"),
  },
  bossGriffin: {
    idle: require("../assets/sprites/boss-griffin-idle-strip.webp"),
    hit: require("../assets/sprites/boss-griffin-hit-strip.webp"),
    die: require("../assets/sprites/boss-griffin-die-strip.webp"),
  },
  angryCandyBasketSlime: {
    idle: require("../assets/sprites/angry-candy-basket-slime-idle-strip.webp"),
    hit: require("../assets/sprites/angry-candy-basket-slime-hit-strip.webp"),
    die: require("../assets/sprites/angry-candy-basket-slime-die-strip.webp"),
  },
  thiefCrow: {
    idle: require("../assets/sprites/thief-crow-idle-strip.webp"),
    hit: require("../assets/sprites/thief-crow-hit-strip.webp"),
    die: require("../assets/sprites/thief-crow-die-strip.webp"),
  },
  bossHungryRedDragon: {
    idle: require("../assets/sprites/hungry-red-dragon-idle-strip.webp"),
    hit: require("../assets/sprites/hungry-red-dragon-hit-strip.webp"),
    die: require("../assets/sprites/hungry-red-dragon-die-strip.webp"),
  },
};

// 견습기니: the bubble-riding follower that tags along from the second loop on (see
// state/comics.ts's apprenticeGini and BattleScene's own ApprenticeFollower). Not an Outfit
// — it isn't equippable, just a trailing sprite — so it sits outside spriteSheets.
export const apprenticeSprite = {
  idle: require("../assets/sprites/guinea-apprentice-idle-strip.webp"),
};

export const images = {
  titleScreen: require("../assets/sprites/title-screen.webp"),
  // Same scene and framing as titleScreen, at sunset and at night (see TitleScreen's TIME_OF_DAY).
  titleScreenSunset: require("../assets/sprites/title-screen-sunset.webp"),
  titleScreenNight: require("../assets/sprites/title-screen-night.webp"),
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
  battleBackgroundBlossomBeach: require("../assets/sprites/battle-blossom-beach.webp"),
  battleBackgroundFoxShrine: require("../assets/sprites/battle-fox-shrine.webp"),
  battleBackgroundCastleKeep: require("../assets/sprites/battle-castle-keep.webp"),
  battleBackgroundHotSpring: require("../assets/sprites/battle-hot-spring-village.webp"),
  battleBackgroundNinjaVillage: require("../assets/sprites/battle-ninja-village.webp"),
  battleBackgroundDragonSeaRoad: require("../assets/sprites/battle-dragon-sea-road.webp"),
  battleBackgroundDragonPalace: require("../assets/sprites/battle-dragon-palace.webp"),
  battleBackgroundCanalCity: require("../assets/sprites/battle-canal-city.webp"),
  battleBackgroundAlpineVillage: require("../assets/sprites/battle-alpine-village.webp"),
  battleBackgroundBakeryStreet: require("../assets/sprites/battle-bakery-street.webp"),
  battleBackgroundGiniMetropolis: require("../assets/sprites/battle-gini-metropolis.webp"),
  battleBackgroundSuspiciousHouse: require("../assets/sprites/battle-suspicious-house.webp"),
  battleBackgroundPumpkinForest: require("../assets/sprites/battle-pumpkin-forest.webp"),
  battleBackgroundHoneyTrail: require("../assets/sprites/battle-honey-trail.webp"),
  battleBackgroundDragonMountainRuin: require("../assets/sprites/battle-dragon-mountain-ruin.webp"),
  battleBackgroundRuinedCitadel: require("../assets/sprites/battle-ruined-citadel.webp"),
};

// A 3-frame flash played once over the enemy when a hit lands as a critical.
export const effects = {
  critFlash: require("../assets/sprites/crit-flash-strip.webp"),
  // Guinea Beam: charge → full beam → dissipate. 512x250 each, muzzle ring at the left.
  beam: [
    require("../assets/effects/beam-1.webp"),
    require("../assets/effects/beam-2.webp"),
    require("../assets/effects/beam-3.webp"),
  ],
  // A spinning gold coin, 56x56, 48 frames — exported from the pixelfx effect library via
  // `node tools/pixelfx-export.mjs pickups/coin-spin` (see tools/pixelfx/VENDORED.md).
  coinSpin: require("../assets/effects/coin-spin-strip.webp"),
  // The sustained fire stage of the beam, animated: 264x100, 36 frames, gold-recolored —
  // `node tools/pixelfx-export.mjs arcane/arcane-beam --out beam-fire --opts '{"palette":[...]}'`.
  // Stands in for beam[1] inside BeamArt's fire stage; not part of the `beam` array above.
  beamFire: require("../assets/effects/beam-fire-strip.webp"),
  // One-shot burst layered behind Execute's slash, blood-red recolored: 216x136, 28 frames —
  // `node tools/pixelfx-export.mjs impacts/crit-hit --out execute-burst --opts '{"palette":[...]}'`.
  executeBurst: require("../assets/effects/execute-burst-strip.webp"),
  // One-shot thud where a thrown carrot lands, warm-gold recolored: 128x88, 28 frames —
  // `node tools/pixelfx-export.mjs impacts/blunt-hit --out carrot-impact --opts '{"palette":[...]}'`.
  carrotImpact: require("../assets/effects/carrot-impact-strip.webp"),
  // One-shot flurry of quick cuts on Barrage's cast, red-orange recolored to match its own
  // icon: 148x104, 30 frames — `node tools/pixelfx-export.mjs melee/dagger-flurry --out
  // barrage-flurry --opts '{"palette":[...]}'`.
  barrageFlurry: require("../assets/effects/barrage-flurry-strip.webp"),
  // Looping teleport pad under the player on Teleport's cast — pixelfx's own default purple
  // already matches the skill's own icon, no recolor needed: 96x104, 72 frames —
  // `node tools/pixelfx-export.mjs scifi/teleporter-pad --out teleport-pad`.
  teleportPad: require("../assets/effects/teleport-pad-strip.webp"),
  // The mid-boss's seething aura (anger mark, steam, stress lines, hot floor — none of the
  // effect's own stand-in figure): 80x80, 36 frames looping —
  // `node tools/pixelfx-export.mjs status/rage --out mini-boss-rage --opts '{"body":false}'`.
  miniBossRage: require("../assets/effects/mini-boss-rage-strip.webp"),
  // The mid-boss going down: a gold starburst with sparks (216x216 padded, 28 frames) —
  // `node tools/pixelfx-export.mjs impacts/crit-hit --out mini-boss-burst --square`.
  miniBossBurst: require("../assets/effects/mini-boss-burst-strip.webp"),
  // 운석 낙하's falling rock and impact, pixelfx's own fire palette: 272x232, the first 66
  // frames (2.2s) of 151 — the long smoke tail is faded out in code instead —
  // `node tools/pixelfx-export.mjs fire/meteor --out meteor-strike --max-frames 66`.
  meteorStrike: require("../assets/effects/meteor-strike-strip.png"),
  // 마녀기니's spells (src/components/WitchSpell.tsx), all `--square` padded: five element
  // bolts (looping, flying right) each with its matching hit-spark, plus three big crit
  // bursts. Bolts: projectiles/plasma-shot (arcane / poison palettes), fire/fireball,
  // ice/ice-lance, projectiles/energy-disc. Hits: impacts/hit-spark recolored per element.
  // Crits: impacts/crit-hit (arcane), explosions/plasma-explosion (--max-frames 30),
  // arcane/mana-burst (--max-frames 36).
  witchOrbArcane: require("../assets/effects/witch-orb-arcane-strip.webp"),
  witchOrbFire: require("../assets/effects/witch-orb-fire-strip.webp"),
  witchOrbIce: require("../assets/effects/witch-orb-ice-strip.webp"),
  witchOrbPoison: require("../assets/effects/witch-orb-poison-strip.webp"),
  witchOrbVolt: require("../assets/effects/witch-orb-volt-strip.webp"),
  // Added later: holy (plasma-shot, gold), pink star-disc (energy-disc, pink), ghost fire
  // (fireball, teal) — each with a hit-spark in the same palette.
  witchOrbHoly: require("../assets/effects/witch-orb-holy-strip.webp"),
  witchOrbPink: require("../assets/effects/witch-orb-pink-strip.webp"),
  witchOrbGhost: require("../assets/effects/witch-orb-ghost-strip.webp"),
  witchHitHoly: require("../assets/effects/witch-hit-holy-strip.webp"),
  witchHitPink: require("../assets/effects/witch-hit-pink-strip.webp"),
  witchHitGhost: require("../assets/effects/witch-hit-ghost-strip.webp"),
  witchHitArcane: require("../assets/effects/witch-hit-arcane-strip.webp"),
  witchHitFire: require("../assets/effects/witch-hit-fire-strip.webp"),
  witchHitIce: require("../assets/effects/witch-hit-ice-strip.webp"),
  witchHitPoison: require("../assets/effects/witch-hit-poison-strip.webp"),
  witchHitVolt: require("../assets/effects/witch-hit-volt-strip.webp"),
  witchCritStar: require("../assets/effects/witch-crit-star-strip.webp"),
  witchCritPlasma: require("../assets/effects/witch-crit-plasma-strip.webp"),
  witchCritMana: require("../assets/effects/witch-crit-mana-strip.webp"),
  // Boss skills (src/state/bossSkills.ts): stun variants play over the player (status-effect
  // style, loop), heal variants play over the boss (one-shot, cropped early with --max-frames
  // — both are several seconds of pixelfx's own art, only the opening beat is used here).
  bossStunStunned: require("../assets/effects/stun-stunned-strip.webp"),
  bossStunSleep: require("../assets/effects/stun-sleep-strip.webp"),
  bossStunConfused: require("../assets/effects/stun-confused-strip.webp"),
  bossHealHoly: require("../assets/effects/heal-holy-strip.webp"),
  bossHealBloom: require("../assets/effects/heal-bloom-strip.webp"),
  // 밤의 실크로드's lizard (flavor-texted as a ghost-possessed goat — see stages.ts) comes
  // back from the dead once a fight, guaranteed: a spectral light pillar, 128x150, 50 frames
  // — `node tools/pixelfx-export.mjs spawn/respawn-beam --out boss-revive --max-frames 50`.
  bossRevive: require("../assets/effects/boss-revive-strip.webp"),
  // The burn mark Chili Throw's DoT leaves on the enemy for its duration, fire-recolored:
  // 80x124, 90 frames — `node tools/pixelfx-export.mjs fire/spirit-flame --out chili-burn
  // --opts '{"palette":[...]}'`.
  chiliBurn: require("../assets/effects/chili-burn-strip.webp"),
};

export const icons = {
  map: require("../assets/icons/icon-map.webp"),
  backpack: require("../assets/icons/icon-backpack.webp"),
  backpackOutlined: require("../assets/icons/icon-backpack-outlined.webp"),
  // Trimmed to their visible art, for the battle scene's fixed-box button row.
  mapTrim: require("../assets/icons/icon-map-trim.webp"),
  backpackTrim: require("../assets/icons/icon-backpack-trim.webp"),
  coins: require("../assets/icons/icon-coins.webp"),
  chest: require("../assets/icons/icon-chest.webp"),
  potionRed: require("../assets/icons/icon-potion-red.webp"),
  potionBlue: require("../assets/icons/icon-potion-blue.webp"),
  compass: require("../assets/icons/icon-compass.webp"),
  star: require("../assets/icons/icon-star.webp"),
  heart: require("../assets/icons/icon-heart.webp"),
  shop: require("../assets/icons/icon-shop.webp"),
  key: require("../assets/icons/icon-key.webp"),
  trophy: require("../assets/icons/icon-trophy.webp"),
  energy: require("../assets/icons/icon-energy.webp"),
  scroll: require("../assets/icons/icon-scroll.webp"),
  home: require("../assets/icons/icon-home.webp"),
  settings: require("../assets/icons/icon-settings.webp"),
  settingsGear: require("../assets/icons/icon-settings-gear.webp"),
  questMedal: require("../assets/icons/icon-quest-medal.webp"),
  codexBook: require("../assets/icons/icon-codex-book.webp"),
  codexMonster: require("../assets/icons/icon-codex-monster.webp"),
  codexIngredient: require("../assets/icons/icon-codex-ingredient.webp"),
};

export const uiImages = {
  coin: require("../assets/ui/coin.webp"),
  // Winged coin that flutters across the battle scene to be tapped.
  coinWinged: require("../assets/ui/coin-winged.webp"),
  // Winged gem that occasionally replaces the flying coin in battle.
  gemWinged: require("../assets/ui/gem-winged.webp"),
  coins: require("../assets/ui/item-coins.webp"),
  crystal: require("../assets/ui/item-crystal.webp"),
  gear: require("../assets/ui/item-gear.webp"),
  badgeAlert: require("../assets/ui/badge-alert.webp"),
  carrot: require("../assets/ui/item-carrot.webp"),
  swords: require("../assets/ui/round-swords.webp"),
};

// Skill icons, 256px wide; SKILL_ICON_ASPECT is each one's width / height.
export const skillImages = {
  beam: require("../assets/skills/beam.webp"),
  steal: require("../assets/skills/steal.webp"),
  focus: require("../assets/skills/focus.webp"),
  execute: require("../assets/skills/execute.webp"),
  shout: require("../assets/skills/shout.webp"),
  diligent: require("../assets/skills/diligent.webp"),
  glutton: require("../assets/skills/glutton.webp"),
  barrage: require("../assets/skills/barrage.webp"),
  teleport: require("../assets/skills/teleport.webp"),
  carrotThrow: require("../assets/skills/carrotThrow.webp"),
  chiliThrow: require("../assets/skills/chiliThrow.webp"),
  meteor: require("../assets/skills/meteor.webp"),
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
  barrage: SQUARE_ICON,
  teleport: SQUARE_ICON,
  carrotThrow: SQUARE_ICON,
  chiliThrow: SQUARE_ICON,
  meteor: 1,
};

export const food = {
  cookPot: require("../assets/food/cook-pot.webp"),
  cookPotOutlined: require("../assets/food/cook-pot-outlined.webp"),
  cookPotTrim: require("../assets/food/cook-pot-trim.webp"),
  fryingPan: require("../assets/food/frying-pan.webp"),
  stewPot: require("../assets/food/stew-pot.webp"),
  cuttingBoard: require("../assets/food/cutting-board.webp"),
  kitchen: require("../assets/food/kitchen.webp"),
  carrot: require("../assets/food/carrot.webp"),
  tomato: require("../assets/food/tomato.webp"),
  potato: require("../assets/food/potato.webp"),
  mushroom: require("../assets/food/mushroom.webp"),
  cabbage: require("../assets/food/cabbage.webp"),
  pumpkin: require("../assets/food/pumpkin.webp"),
  corn: require("../assets/food/corn.webp"),
  onion: require("../assets/food/onion.webp"),
  egg: require("../assets/food/egg.webp"),
  milk: require("../assets/food/milk.webp"),
  cheese: require("../assets/food/cheese.webp"),
  chicken: require("../assets/food/chicken.webp"),
  porkBelly: require("../assets/food/pork-belly.webp"),
  beef: require("../assets/food/beef.webp"),
  lamb: require("../assets/food/lamb.webp"),
  salmon: require("../assets/food/salmon.webp"),
  // Grilled versions, saved for future grill recipes.
  chickenGrilled: require("../assets/food/chicken-grilled.webp"),
  porkBellyGrilled: require("../assets/food/pork-belly-grilled.webp"),
  beefGrilled: require("../assets/food/beef-grilled.webp"),
  lambGrilled: require("../assets/food/lamb-grilled.webp"),
  salmonGrilled: require("../assets/food/salmon-grilled.webp"),
  pudding: require("../assets/food/pudding.webp"),
  mushroomSoup: require("../assets/food/mushroom-soup.webp"),
  pumpkinRoast: require("../assets/food/pumpkin-roast.webp"),
  dishVeggieStew: require("../assets/food/dish-veggie-stew.webp"),
  dishSalad: require("../assets/food/dish-salad.webp"),
  dishBananaMilk: require("../assets/food/dish-banana-milk.webp"),
  dishPotatoPancake: require("../assets/food/dish-potato-pancake.webp"),
  dishSalmonSteak: require("../assets/food/dish-salmon-steak.webp"),
  dishSlimePotion: require("../assets/food/dish-slime-potion.webp"),
  dishYukhoe: require("../assets/food/dish-yukhoe.webp"),
  dishMusselSeaweedSoup: require("../assets/food/dish-mussel-seaweed-soup.webp"),
  dishSalmonSashimi: require("../assets/food/dish-salmon-sashimi.webp"),
  dishBarleyTea: require("../assets/food/dish-barley-tea.webp"),
  dishMangoSmoothie: require("../assets/food/dish-mango-smoothie.webp"),
  dishGrilledSardine: require("../assets/food/dish-grilled-sardine.webp"),
  dishSpicyOyster: require("../assets/food/dish-spicy-oyster.webp"),
  dishFiveGrainRice: require("../assets/food/dish-five-grain-rice.webp"),
  dishPatbingsu: require("../assets/food/dish-patbingsu.webp"),
  dishSalmonRoeBowl: require("../assets/food/dish-salmon-roe-bowl.webp"),
  dishTunaSashimi: require("../assets/food/dish-tuna-sashimi.webp"),
  dishOctopus: require("../assets/food/dish-octopus.webp"),
  dishShrimpSashimi: require("../assets/food/dish-shrimp-sashimi.webp"),
  dishGreenJelly: require("../assets/food/dish-green-jelly.webp"),
  dishRoyalJelly: require("../assets/food/dish-royal-jelly.webp"),
  dishSteak: require("../assets/food/dish-steak.webp"),
  dishSeafoodBoil: require("../assets/food/dish-seafood-boil.webp"),
  crab: require("../assets/food/crab.webp"),
  shrimp: require("../assets/food/shrimp.webp"),
  octopus: require("../assets/food/octopus.webp"),
  squid: require("../assets/food/squid.webp"),
  tuna: require("../assets/food/tuna.webp"),
  sardine: require("../assets/food/sardine.webp"),
  mussel: require("../assets/food/mussel.webp"),
  lobster: require("../assets/food/lobster.webp"),
  oyster: require("../assets/food/oyster.webp"),
  fishSteak: require("../assets/food/fish-steak.webp"),
  sharkFin: require("../assets/food/shark-fin.webp"),
  roe: require("../assets/food/roe.webp"),
  chili: require("../assets/food/chili.webp"),
  fireFruit: require("../assets/food/fire-fruit.webp"),
  seaweed: require("../assets/food/seaweed.webp"),
  greenJelly: require("../assets/food/green-jelly.webp"),
  herb: require("../assets/food/herb.webp"),
  dill: require("../assets/food/dill.webp"),
  // 이슬: the water of this world's cooking, shed by slimes.
  dew: require("../assets/food/dew.webp"),
  lemon: require("../assets/food/lemon.webp"),
  greenApple: require("../assets/food/green-apple.webp"),
  royalJelly: require("../assets/food/royal-jelly.webp"),
  salt: require("../assets/food/salt.webp"),
  crabMeat: require("../assets/food/crab-meat.webp"),
  banana: require("../assets/food/banana.webp"),
  mango: require("../assets/food/mango.webp"),
  coconut: require("../assets/food/coconut.webp"),
  bambooShoot: require("../assets/food/bamboo-shoot.webp"),
  dumplingWrapper: require("../assets/food/dumpling-wrapper.webp"),
  driedPersimmon: require("../assets/food/dried-persimmon.webp"),
  makgeolli: require("../assets/food/makgeolli.webp"),
  azalea: require("../assets/food/azalea.webp"),
  rice: require("../assets/food/rice.webp"),
  // Fruits.
  asianPear: require("../assets/food/asian-pear.webp"),
  peach: require("../assets/food/peach.webp"),
  persimmon: require("../assets/food/persimmon.webp"),
  kyohoGrapes: require("../assets/food/kyoho-grapes.webp"),
  shineMuscat: require("../assets/food/shine-muscat.webp"),
  mandarin: require("../assets/food/mandarin.webp"),
  nectarine: require("../assets/food/nectarine.webp"),
  jujube: require("../assets/food/jujube.webp"),
  ume: require("../assets/food/ume.webp"),
  apricot: require("../assets/food/apricot.webp"),
  kiwi: require("../assets/food/kiwi.webp"),
  pomegranate: require("../assets/food/pomegranate.webp"),
  koreanRaspberry: require("../assets/food/korean-raspberry.webp"),
  omija: require("../assets/food/omija.webp"),
  strawberry: require("../assets/food/strawberry.webp"),
  chamoe: require("../assets/food/chamoe.webp"),
  // Nuts.
  almond: require("../assets/food/almond.webp"),
  walnut: require("../assets/food/walnut.webp"),
  cashew: require("../assets/food/cashew.webp"),
  pistachio: require("../assets/food/pistachio.webp"),
  hazelnut: require("../assets/food/hazelnut.webp"),
  macadamia: require("../assets/food/macadamia.webp"),
  pecan: require("../assets/food/pecan.webp"),
  peanut: require("../assets/food/peanut.webp"),
  pineNut: require("../assets/food/pine-nut.webp"),
  chestnut: require("../assets/food/chestnut.webp"),
  ginkgo: require("../assets/food/ginkgo.webp"),
  brazilNut: require("../assets/food/brazil-nut.webp"),
  // Grains and beans.
  brownRice: require("../assets/food/brown-rice.webp"),
  blackRice: require("../assets/food/black-rice.webp"),
  glutinousRice: require("../assets/food/glutinous-rice.webp"),
  barley: require("../assets/food/barley.webp"),
  oats: require("../assets/food/oats.webp"),
  foxtailMillet: require("../assets/food/foxtail-millet.webp"),
  sorghum: require("../assets/food/sorghum.webp"),
  redBeans: require("../assets/food/red-beans.webp"),
  blackBeans: require("../assets/food/black-beans.webp"),
  chiliPowder: require("../assets/food/chili-powder.webp"),
  mackerel: require("../assets/food/mackerel.webp"),
  squidInk: require("../assets/food/squid-ink.webp"),
  blossomPetals: require("../assets/food/blossom-petals.webp"),
  friedTofu: require("../assets/food/fried-tofu.webp"),
  radish: require("../assets/food/radish.webp"),
  yuzu: require("../assets/food/yuzu.webp"),
  abalone: require("../assets/food/abalone.webp"),
  dishBambooDumpling: require("../assets/food/dish-bamboo-dumpling.webp"),
  dishPersimmonRoll: require("../assets/food/dish-persimmon-roll.webp"),
  dishHaemulPajeon: require("../assets/food/dish-haemul-pajeon.webp"),
  dishAzaleaHwajeon: require("../assets/food/dish-azalea-hwajeon.webp"),
  dishTteokbokki: require("../assets/food/dish-tteokbokki.webp"),
  dishBraisedMackerel: require("../assets/food/dish-braised-mackerel.webp"),
  dishSquidInkRisotto: require("../assets/food/dish-squid-ink-risotto.webp"),
  dishSakuraMochi: require("../assets/food/dish-sakura-mochi.webp"),
  dishInariSushi: require("../assets/food/dish-inari-sushi.webp"),
  dishYuzuSherbet: require("../assets/food/dish-yuzu-sherbet.webp"),
  dishAbalonePorridge: require("../assets/food/dish-abalone-porridge.webp"),
  dishDragonFeast: require("../assets/food/dish-dragon-feast.webp"),
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
  panelLarge: slice(require("../assets/kit2/panel-xl.webp"), 421, 145, [26, 26, 28, 26], "#feebbe"),
  panel: slice(require("../assets/kit2/card.webp"), 176, 97, [24, 24, 26, 24], "#fbebcc"),
  panelSmall: slice(require("../assets/kit2/panel-square.webp"), 133, 151, [26, 26, 28, 26], "#fdf0d6"),
  panelBrown: slice(require("../assets/kit2/plank.webp"), 179, 59, [18, 24, 20, 24], "#deab6f"),
  panelParchment: slice(require("../assets/kit2/panel-tall.webp"), 117, 153, [26, 26, 28, 26], "#feebbe"),
  inset: slice(require("../assets/kit2/cushion.webp"), 157, 66, [22, 24, 24, 24], "#fde8bd"),
  slot: slice(require("../assets/kit2/sq-cream.webp"), 54, 56, [16, 16, 18, 16], "#fceccb"),
  buttonCream: slice(require("../assets/kit2/btn-cream.webp"), 147, 48, [16, 22, 18, 22]),
  buttonGreen: slice(require("../assets/kit2/btn-green.webp"), 145, 49, [16, 22, 18, 22]),
  buttonBeige: slice(require("../assets/kit2/btn-tan-2.webp"), 145, 48, [16, 22, 18, 22]),
  buttonGray: slice(require("../assets/kit2/btn-gray.webp"), 134, 47, [16, 22, 18, 22]),
  buttonBrown: slice(require("../assets/kit2/plank.webp"), 179, 59, [18, 24, 20, 24]),
  tabGreen: slice(require("../assets/kit2/green-panel.webp"), 204, 95, [26, 28, 30, 28], "#82be3b"),
  track: slice(require("../assets/ui/kit-track.webp"), 362, 47, [20, 24, 20, 24], "#f8eac7"),
};

// Grandma's grocery: warmer wood-and-linen frames from the shop sheet.
export const shopKit = {
  cardWood: slice(require("../assets/shop/card-wood.webp"), 184, 253, [36, 36, 40, 36], "#fcf1d5"),
  frameWide: slice(require("../assets/shop/frame-wide.webp"), 598, 237, [70, 60, 70, 70], "#faedd1"),
  // Tail hangs off the bottom-left, so those insets are wide enough to keep it whole.
  bubble: slice(require("../assets/shop/bubble.webp"), 347, 206, [40, 40, 60, 80], "#fcf2d9"),
  // Coin is baked into the left end.
  coinPill: slice(require("../assets/shop/coin-pill.webp"), 331, 104, [30, 50, 36, 100]),
  pillRed: slice(require("../assets/shop/pill-red.webp"), 225, 74, [30, 40, 34, 40]),
  pillCream: slice(require("../assets/shop/pill-cream.webp"), 225, 72, [30, 40, 34, 40]),
  pillGray: slice(require("../assets/shop/pill-gray.webp"), 188, 74, [30, 40, 34, 40]),
};

export const shopImages = {
  background: require("../assets/shop/background.jpg"),
  tabCream: require("../assets/shop/tab-cream.webp"),
  tabRed: require("../assets/shop/tab-red.webp"),
  arrowBack: require("../assets/shop/arrow-back.webp"),
  arrowBackGray: require("../assets/shop/arrow-back-gray.webp"),
};

export const chef = {
  spoon: require("../assets/npc/chef-spoon.webp"),
  cheer: require("../assets/npc/chef-cheer.webp"),
  serve: require("../assets/npc/chef-serve.webp"),
  book: require("../assets/npc/chef-book.webp"),
  wok: require("../assets/npc/chef-wok.webp"),
};

// Blank recipe scrolls/books. A recipe's card is one of these plus its dish drawn on top,
// so a new recipe never needs its own art.
export const recipeTemplates = {
  scrollPlain: require("../assets/recipe-templates/scroll-plain.webp"),
  scrollRibbonCrown: require("../assets/recipe-templates/scroll-ribbon-crown.webp"),
  bookRed: require("../assets/recipe-templates/book-red.webp"),
  bookBlueStar: require("../assets/recipe-templates/book-blue-star.webp"),
  bookBrown: require("../assets/recipe-templates/book-brown.webp"),
  scrollSealedGold: require("../assets/recipe-templates/scroll-sealed-gold.webp"),
};

export const grandma = {
  happy: require("../assets/npc/grandma-happy.webp"),
  wave: require("../assets/npc/grandma-wave.webp"),
  basket: require("../assets/npc/grandma-basket.webp"),
  menu: require("../assets/npc/grandma-menu.webp"),
  counter: require("../assets/npc/grandma-counter.webp"),
};

export const statIcons = {
  attack: require("../assets/stats/attack.webp"),
  criticalDamage: require("../assets/stats/critical-damage.webp"),
  criticalChance: require("../assets/stats/critical-chance.webp"),
  goldBonus: require("../assets/stats/gold.webp"),
};

// Rounded green/cream button set.
export const buttonKit = {
  pillCream: slice(require("../assets/buttons/pill-cream.webp"), 255, 94, [36, 46, 40, 46]),
};

export const buttonImages = {
  plusGreen: require("../assets/buttons/plus-green.webp"),
  // Round red X — a popup's close button, pinned to its top-right corner.
  closeRed: require("../assets/buttons/close-red.webp"),
};

export const navIcons = {
  battle: require("../assets/nav/battle.webp"),
  companions: require("../assets/nav/companions.webp"),
  skills: require("../assets/nav/skills.webp"),
  shop: require("../assets/nav/shop.webp"),
};

// Wood-and-brass frames: bars, slots, rings and emblems.
export const frameKit = {
  barFrame: slice(require("../assets/frames/bar-frame.webp"), 495, 40, [10, 22, 10, 22], "#fde6be"),
  fillGold: slice(require("../assets/frames/fill-gold.webp"), 275, 36, [14, 18, 14, 18]),
  fillGreen: slice(require("../assets/frames/fill-green.webp"), 277, 36, [14, 18, 14, 18]),
  fillRed: slice(require("../assets/frames/fill-red.webp"), 275, 34, [14, 18, 14, 18]),
  fillBlue: slice(require("../assets/frames/fill-blue.webp"), 276, 36, [14, 18, 14, 18]),
  squareWood: slice(require("../assets/kit2/sq-cream.webp"), 54, 56, [16, 16, 18, 16], "#fceccb"),
  squareGold: slice(require("../assets/kit2/frame-gold.webp"), 134, 153, [24, 24, 24, 24], "#fdf2d7"),
};

export const frameImages = {
  slotPlus: require("../assets/frames/slot-wood-plus.webp"),
  ringWood: require("../assets/frames/ring-wood.webp"),
  ringGold: require("../assets/frames/ring-gold.webp"),
};

export const headerKit = {
  nameTag: slice(require("../assets/kit2/scroll-tag.webp"), 147, 55, [14, 26, 16, 26], "#f9e6c3"),
  // One cream card holding the whole profile (avatar, name, level, exp).
  // Wood-rimmed pill with a round socket on the left that the avatar sits in.
  profile: slice(require("../assets/kit2/pill-coin.webp"), 232, 68, [20, 34, 22, 66], "#fdedcc"),
};

export const kitImages = {
  toggleOn: require("../assets/ui/kit-toggle-on.webp"),
  toggleOff: require("../assets/ui/kit-toggle-off.webp"),
  dotRed: require("../assets/ui/kit-dot-red.webp"),
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
// Story comic panels (see state/comics.ts for their speech bubbles).
export const comics = {
  opening1: require("../assets/comics/opening-1.webp"),
  opening2: require("../assets/comics/opening-2.webp"),
  opening3: require("../assets/comics/opening-3.webp"),
  opening4: require("../assets/comics/opening-4.webp"),
  cookbook1: require("../assets/comics/cookbook-1.webp"),
  cookbook2: require("../assets/comics/cookbook-2.webp"),
  cookbook3: require("../assets/comics/cookbook-3.webp"),
  cookbook4: require("../assets/comics/cookbook-4.webp"),
  explorer1: require("../assets/comics/explorer-1.webp"),
  explorer2: require("../assets/comics/explorer-2.webp"),
  explorer3: require("../assets/comics/explorer-3.webp"),
  explorer4: require("../assets/comics/explorer-4.webp"),
  teto1: require("../assets/comics/teto-1.webp"),
  teto2: require("../assets/comics/teto-2.webp"),
  teto3: require("../assets/comics/teto-3.webp"),
  teto4: require("../assets/comics/teto-4.webp"),
  assassin1: require("../assets/comics/assassin-1.webp"),
  assassin2: require("../assets/comics/assassin-2.webp"),
  assassin3: require("../assets/comics/assassin-3.webp"),
  assassin4: require("../assets/comics/assassin-4.webp"),
  egen1: require("../assets/comics/egen-1.webp"),
  egen2: require("../assets/comics/egen-2.webp"),
  egen3: require("../assets/comics/egen-3.webp"),
  egen4: require("../assets/comics/egen-4.webp"),
  samurai1: require("../assets/comics/samurai-1.webp"),
  samurai2: require("../assets/comics/samurai-2.webp"),
  samurai3: require("../assets/comics/samurai-3.webp"),
  samurai4: require("../assets/comics/samurai-4.webp"),
  harbor1: require("../assets/comics/harbor-1.webp"),
  harbor2: require("../assets/comics/harbor-2.webp"),
  harbor3: require("../assets/comics/harbor-3.webp"),
  harbor4: require("../assets/comics/harbor-4.webp"),
  dive1: require("../assets/comics/dive-1.webp"),
  dive2: require("../assets/comics/dive-2.webp"),
  dive3: require("../assets/comics/dive-3.webp"),
  dive4: require("../assets/comics/dive-4.webp"),
  kite1: require("../assets/comics/kite-1.webp"),
  kite2: require("../assets/comics/kite-2.webp"),
  kite3: require("../assets/comics/kite-3.webp"),
  kite4: require("../assets/comics/kite-4.webp"),
  snowpass1: require("../assets/comics/snowpass-1.webp"),
  snowpass2: require("../assets/comics/snowpass-2.webp"),
  snowpass3: require("../assets/comics/snowpass-3.webp"),
  snowpass4: require("../assets/comics/snowpass-4.webp"),
  jungle1: require("../assets/comics/jungle-1.webp"),
  jungle2: require("../assets/comics/jungle-2.webp"),
  jungle3: require("../assets/comics/jungle-3.webp"),
  jungle4: require("../assets/comics/jungle-4.webp"),
  cavevillage1: require("../assets/comics/cavevillage-1.webp"),
  cavevillage2: require("../assets/comics/cavevillage-2.webp"),
  cavevillage3: require("../assets/comics/cavevillage-3.webp"),
  cavevillage4: require("../assets/comics/cavevillage-4.webp"),
  cloudpalace1: require("../assets/comics/cloudpalace-1.webp"),
  cloudpalace2: require("../assets/comics/cloudpalace-2.webp"),
  cloudpalace3: require("../assets/comics/cloudpalace-3.webp"),
  cloudpalace4: require("../assets/comics/cloudpalace-4.webp"),
  farmchicken1: require("../assets/comics/farmchicken-1.webp"),
  farmchicken2: require("../assets/comics/farmchicken-2.webp"),
  farmchicken3: require("../assets/comics/farmchicken-3.webp"),
  farmchicken4: require("../assets/comics/farmchicken-4.webp"),
  jungleoasis1: require("../assets/comics/jungleoasis-1.webp"),
  jungleoasis2: require("../assets/comics/jungleoasis-2.webp"),
  jungleoasis3: require("../assets/comics/jungleoasis-3.webp"),
  jungleoasis4: require("../assets/comics/jungleoasis-4.webp"),
  marketsilk1: require("../assets/comics/marketsilk-1.webp"),
  marketsilk2: require("../assets/comics/marketsilk-2.webp"),
  marketsilk3: require("../assets/comics/marketsilk-3.webp"),
  marketsilk4: require("../assets/comics/marketsilk-4.webp"),
  oasisdesert1: require("../assets/comics/oasisdesert-1.webp"),
  oasisdesert2: require("../assets/comics/oasisdesert-2.webp"),
  oasisdesert3: require("../assets/comics/oasisdesert-3.webp"),
  oasisdesert4: require("../assets/comics/oasisdesert-4.webp"),
  slimeroad1: require("../assets/comics/slimeroad-1.webp"),
  slimeroad2: require("../assets/comics/slimeroad-2.webp"),
  slimeroad3: require("../assets/comics/slimeroad-3.webp"),
  slimeroad4: require("../assets/comics/slimeroad-4.webp"),
  swampfarm1: require("../assets/comics/swampfarm-1.webp"),
  swampfarm2: require("../assets/comics/swampfarm-2.webp"),
  swampfarm3: require("../assets/comics/swampfarm-3.webp"),
  swampfarm4: require("../assets/comics/swampfarm-4.webp"),
  snowvillage1: require("../assets/comics/snowvillage-1.webp"),
  snowvillage2: require("../assets/comics/snowvillage-2.webp"),
  snowvillage3: require("../assets/comics/snowvillage-3.webp"),
  snowvillage4: require("../assets/comics/snowvillage-4.webp"),
  tigerride1: require("../assets/comics/tigerride-1.webp"),
  tigerride2: require("../assets/comics/tigerride-2.webp"),
  tigerride3: require("../assets/comics/tigerride-3.webp"),
  tigerride4: require("../assets/comics/tigerride-4.webp"),
  foxpath1: require("../assets/comics/foxpath-1.webp"),
  foxpath2: require("../assets/comics/foxpath-2.webp"),
  foxpath3: require("../assets/comics/foxpath-3.webp"),
  foxpath4: require("../assets/comics/foxpath-4.webp"),
  chiliport1: require("../assets/comics/chiliport-1.webp"),
  chiliport2: require("../assets/comics/chiliport-2.webp"),
  chiliport3: require("../assets/comics/chiliport-3.webp"),
  chiliport4: require("../assets/comics/chiliport-4.webp"),
  shrinesteps1: require("../assets/comics/shrinesteps-1.webp"),
  shrinesteps2: require("../assets/comics/shrinesteps-2.webp"),
  shrinesteps3: require("../assets/comics/shrinesteps-3.webp"),
  shrinesteps4: require("../assets/comics/shrinesteps-4.webp"),
  tanukimap1: require("../assets/comics/tanukimap-1.webp"),
  tanukimap2: require("../assets/comics/tanukimap-2.webp"),
  tanukimap3: require("../assets/comics/tanukimap-3.webp"),
  tanukimap4: require("../assets/comics/tanukimap-4.webp"),
  castleonsen1: require("../assets/comics/castleonsen-1.webp"),
  castleonsen2: require("../assets/comics/castleonsen-2.webp"),
  castleonsen3: require("../assets/comics/castleonsen-3.webp"),
  castleonsen4: require("../assets/comics/castleonsen-4.webp"),
  nightthief1: require("../assets/comics/nightthief-1.webp"),
  nightthief2: require("../assets/comics/nightthief-2.webp"),
  nightthief3: require("../assets/comics/nightthief-3.webp"),
  nightthief4: require("../assets/comics/nightthief-4.webp"),
  dragonroad1: require("../assets/comics/dragonroad-1.webp"),
  dragonroad2: require("../assets/comics/dragonroad-2.webp"),
  dragonroad3: require("../assets/comics/dragonroad-3.webp"),
  dragonroad4: require("../assets/comics/dragonroad-4.webp"),
  dragongate1: require("../assets/comics/dragongate-1.webp"),
  dragongate2: require("../assets/comics/dragongate-2.webp"),
  dragongate3: require("../assets/comics/dragongate-3.webp"),
  dragongate4: require("../assets/comics/dragongate-4.webp"),
  whaleride1: require("../assets/comics/whaleride-1.webp"),
  whaleride2: require("../assets/comics/whaleride-2.webp"),
  whaleride3: require("../assets/comics/whaleride-3.webp"),
  whaleride4: require("../assets/comics/whaleride-4.webp"),
  alpinetrain1: require("../assets/comics/alpinetrain-1.webp"),
  alpinetrain2: require("../assets/comics/alpinetrain-2.webp"),
  alpinetrain3: require("../assets/comics/alpinetrain-3.webp"),
  alpinetrain4: require("../assets/comics/alpinetrain-4.webp"),
  sledbakery1: require("../assets/comics/sledbakery-1.webp"),
  sledbakery2: require("../assets/comics/sledbakery-2.webp"),
  sledbakery3: require("../assets/comics/sledbakery-3.webp"),
  sledbakery4: require("../assets/comics/sledbakery-4.webp"),
  townasleep1: require("../assets/comics/townasleep-1.webp"),
  townasleep2: require("../assets/comics/townasleep-2.webp"),
  townasleep3: require("../assets/comics/townasleep-3.webp"),
  townasleep4: require("../assets/comics/townasleep-4.webp"),
  ginitown1: require("../assets/comics/ginitown-1.webp"),
  ginitown2: require("../assets/comics/ginitown-2.webp"),
  ginitown3: require("../assets/comics/ginitown-3.webp"),
  ginitown4: require("../assets/comics/ginitown-4.webp"),
  pumpkinforest1: require("../assets/comics/pumpkinforest-1.webp"),
  pumpkinforest2: require("../assets/comics/pumpkinforest-2.webp"),
  pumpkinforest3: require("../assets/comics/pumpkinforest-3.webp"),
  pumpkinforest4: require("../assets/comics/pumpkinforest-4.webp"),
  beeChase1: require("../assets/comics/bee-chase-1.webp"),
  beeChase2: require("../assets/comics/bee-chase-2.webp"),
  beeChase3: require("../assets/comics/bee-chase-3.webp"),
  beeChase4: require("../assets/comics/bee-chase-4.webp"),
  giniReturn1: require("../assets/comics/gini-return-1.webp"),
  giniReturn2: require("../assets/comics/gini-return-2.webp"),
  giniReturn3: require("../assets/comics/gini-return-3.webp"),
  giniReturn4: require("../assets/comics/gini-return-4.webp"),
  griffinFlight1: require("../assets/comics/griffin-flight-1.webp"),
  griffinFlight2: require("../assets/comics/griffin-flight-2.webp"),
  griffinFlight3: require("../assets/comics/griffin-flight-3.webp"),
  griffinFlight4: require("../assets/comics/griffin-flight-4.webp"),
  ending1: require("../assets/comics/ending-1.webp"),
  ending2: require("../assets/comics/ending-2.webp"),
  ending3: require("../assets/comics/ending-3.webp"),
  ending4: require("../assets/comics/ending-4.webp"),
  apprenticeGini1: require("../assets/comics/apprentice-gini-1.webp"),
  apprenticeGini2: require("../assets/comics/apprentice-gini-2.webp"),
  apprenticeGini3: require("../assets/comics/apprentice-gini-3.webp"),
  apprenticeGini4: require("../assets/comics/apprentice-gini-4.webp"),
};

// Per-region BGM — see BGM_GROUP in stages.ts for which EnemyKind maps to which group.
// Not every group has tracks yet; sound.ts falls back to "countryside" for the rest.
export const bgm = {
  countryside: {
    field: require("../assets/bgm/field-countryside.mp3"),
    boss: require("../assets/bgm/boss-countryside.mp3"),
  },
  tropical: {
    field: require("../assets/bgm/field-tropical.mp3"),
    boss: require("../assets/bgm/boss-tropical.mp3"),
  },
  desert: {
    field: require("../assets/bgm/field-desert.mp3"),
    boss: require("../assets/bgm/boss-desert.mp3"),
  },
  china: {
    field: require("../assets/bgm/field-china.mp3"),
    boss: require("../assets/bgm/boss-china.mp3"),
  },
  korea: {
    field: require("../assets/bgm/field-korea.mp3"),
    boss: require("../assets/bgm/boss-korea.mp3"),
  },
  japan: {
    field: require("../assets/bgm/field-japan.mp3"),
    boss: require("../assets/bgm/boss-japan.mp3"),
  },
  dragonPalace: {
    field: require("../assets/bgm/field-dragonPalace.mp3"),
    boss: require("../assets/bgm/boss-dragonPalace.mp3"),
  },
  europe: {
    field: require("../assets/bgm/field-europe.mp3"),
    boss: require("../assets/bgm/boss-europe.mp3"),
  },
  hauntedHouse: {
    field: require("../assets/bgm/field-hauntedHouse.mp3"),
    boss: require("../assets/bgm/boss-hauntedHouse.mp3"),
  },
  // Classic-fantasy road from 꿀향기 귀갓길 on (castles, a griffin, a dragon): "Curventure"
  // and "The Final Surge".
  fantasy: {
    field: require("../assets/bgm/field-fantasy.mp3"),
    boss: require("../assets/bgm/boss-fantasy.mp3"),
  },
};

// The title screen's own theme (마을 대기 화면), looping until the player taps in.
export const bgmTitle = require("../assets/bgm/title-village.mp3");

// Every strip frame is 160x160px, in a 5-frame row (guinea/slime) or 4-frame row (boss).
export const FRAME_SIZE = 160;

// Wood / gold / ribbon panel frames (sheet order, left→right, top→bottom). Drawn whole at
// their own aspect, or as 9-slices through panelSlices below.
export const panelArt = [
  require("../assets/panels/panel-00.webp"),
  require("../assets/panels/panel-01.webp"),
  require("../assets/panels/panel-02.webp"),
  require("../assets/panels/panel-03.webp"),
  require("../assets/panels/panel-04.webp"),
  require("../assets/panels/panel-05.webp"),
  require("../assets/panels/panel-06.webp"),
  require("../assets/panels/panel-07.webp"),
  require("../assets/panels/panel-08.webp"),
  require("../assets/panels/panel-09.webp"),
  require("../assets/panels/panel-10.webp"),
  require("../assets/panels/panel-11.webp"),
  require("../assets/panels/panel-12.webp"),
  require("../assets/panels/panel-13.webp"),
  require("../assets/panels/panel-14.webp"),
  require("../assets/panels/panel-15.webp"),
  require("../assets/panels/panel-16.webp"),
  require("../assets/panels/panel-17.webp"),
  require("../assets/panels/panel-18.webp"),
  require("../assets/panels/panel-19.webp"),
  require("../assets/panels/panel-20.webp"),
  require("../assets/panels/panel-21.webp"),
  require("../assets/panels/panel-22.webp"),
  require("../assets/panels/panel-23.webp"),
  require("../assets/panels/panel-24.webp"),
  require("../assets/panels/panel-25.webp"),
  require("../assets/panels/panel-26.webp"),
  require("../assets/panels/panel-27.webp"),
  require("../assets/panels/panel-28.webp"),
];

// The ones used as stretchy frames, with insets that keep their corners and trim intact.
export const panelSlices = {
  // Big wood frame with brass bolts in each corner.
  woodBolts: slice(panelArt[0], 480, 212, [44, 50, 44, 50], "#f6e2b8"),
  goldPill: slice(panelArt[16], 393, 109, [48, 52, 48, 52], "#fce6a8"),
  // Wood frame with a leafy plank sign across the top — the title goes on the plank.
  leafPlank: slice(panelArt[1], 480, 257, [106, 66, 42, 66]),
  // Ornate boss-trophy frame (crown, crossed swords, wings up top; star medallion below).
  // Left/right insets meet in the middle so the ornaments never stretch sideways — draw it
  // at width = 1000 × scale; only the plain side posts stretch to fit taller content.
  bossTrophy: slice(require("../assets/panels/boss-frame.webp"), 1000, 749, [300, 499, 259, 499]),
};

// Soft cream inner panels (the second panel sheet): plain rounded plates for rows, chips and
// cells that sit inside a bigger frame. 0 big card, 3 square, 6 long pill, 7 speech bubble,
// 8 inset well, 9/14 gray (disabled), 10 dashed, 13/16/18/21 tan, 15/16 tall.
export const creamArt = [
  require("../assets/panels-cream/cream-00.webp"),
  require("../assets/panels-cream/cream-01.webp"),
  require("../assets/panels-cream/cream-02.webp"),
  require("../assets/panels-cream/cream-03.webp"),
  require("../assets/panels-cream/cream-04.webp"),
  require("../assets/panels-cream/cream-05.webp"),
  require("../assets/panels-cream/cream-06.webp"),
  require("../assets/panels-cream/cream-07.webp"),
  require("../assets/panels-cream/cream-08.webp"),
  require("../assets/panels-cream/cream-09.webp"),
  require("../assets/panels-cream/cream-10.webp"),
  require("../assets/panels-cream/cream-11.webp"),
  require("../assets/panels-cream/cream-12.webp"),
  require("../assets/panels-cream/cream-13.webp"),
  require("../assets/panels-cream/cream-14.webp"),
  require("../assets/panels-cream/cream-15.webp"),
  require("../assets/panels-cream/cream-16.webp"),
  require("../assets/panels-cream/cream-17.webp"),
  require("../assets/panels-cream/cream-18.webp"),
  require("../assets/panels-cream/cream-19.webp"),
  require("../assets/panels-cream/cream-20.webp"),
  require("../assets/panels-cream/cream-21.webp"),
];

export const creamSlices = {
  // A big card that groups several rows.
  card: slice(creamArt[0], 1114, 339, [96, 100, 100, 100], "#feecc3"),
  // A full-width row plate.
  row: slice(creamArt[6], 1105, 139, [64, 72, 68, 72], "#fdedc7"),
  // A square cell for an item or icon.
  cell: slice(creamArt[3], 224, 217, [56, 58, 60, 58], "#fdecc4"),
};
