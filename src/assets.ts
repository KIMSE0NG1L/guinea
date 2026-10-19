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
    iceMageGini: {
      idle: require("../assets/sprites/guinea-icemage-idle-strip.webp"),
      attack: require("../assets/sprites/guinea-icemage-attack-strip.webp"),
      critical: require("../assets/sprites/guinea-icemage-critical-strip.webp"),
      win: require("../assets/sprites/guinea-icemage-win-strip.webp"),
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
  grapeKid: {
    idle: require("../assets/sprites/grape-kid-idle-strip.webp"),
    hit: require("../assets/sprites/grape-kid-hit-strip.webp"),
    die: require("../assets/sprites/grape-kid-die-strip.webp"),
  },
  bossOliveTree: {
    idle: require("../assets/sprites/boss-olive-tree-idle-strip.webp"),
    hit: require("../assets/sprites/boss-olive-tree-hit-strip.webp"),
    die: require("../assets/sprites/boss-olive-tree-die-strip.webp"),
  },
  gingerbreadKid: {
    idle: require("../assets/sprites/gingerbread-kid-idle-strip.webp"),
    hit: require("../assets/sprites/gingerbread-kid-hit-strip.webp"),
    die: require("../assets/sprites/gingerbread-kid-die-strip.webp"),
  },
  bossCandyWitch: {
    idle: require("../assets/sprites/boss-candy-witch-idle-strip.webp"),
    hit: require("../assets/sprites/boss-candy-witch-hit-strip.webp"),
    die: require("../assets/sprites/boss-candy-witch-die-strip.webp"),
  },
  teacupRabbit: {
    idle: require("../assets/sprites/teacup-rabbit-idle-strip.webp"),
    hit: require("../assets/sprites/teacup-rabbit-hit-strip.webp"),
    die: require("../assets/sprites/teacup-rabbit-die-strip.webp"),
  },
  bossTeapotDuchess: {
    idle: require("../assets/sprites/boss-teapot-duchess-idle-strip.webp"),
    hit: require("../assets/sprites/boss-teapot-duchess-hit-strip.webp"),
    die: require("../assets/sprites/boss-teapot-duchess-die-strip.webp"),
  },
  pretzelKid: {
    idle: require("../assets/sprites/pretzel-kid-idle-strip.webp"),
    hit: require("../assets/sprites/pretzel-kid-hit-strip.webp"),
    die: require("../assets/sprites/pretzel-kid-die-strip.webp"),
  },
  bossBandBear: {
    idle: require("../assets/sprites/boss-band-bear-idle-strip.webp"),
    hit: require("../assets/sprites/boss-band-bear-hit-strip.webp"),
    die: require("../assets/sprites/boss-band-bear-die-strip.webp"),
  },
  puffinFisher: {
    idle: require("../assets/sprites/puffin-fisher-idle-strip.webp"),
    hit: require("../assets/sprites/puffin-fisher-hit-strip.webp"),
    die: require("../assets/sprites/puffin-fisher-die-strip.webp"),
  },
  bossWalrusViking: {
    idle: require("../assets/sprites/boss-walrus-viking-idle-strip.webp"),
    hit: require("../assets/sprites/boss-walrus-viking-hit-strip.webp"),
    die: require("../assets/sprites/boss-walrus-viking-die-strip.webp"),
  },
  babySeal: {
    idle: require("../assets/sprites/baby-seal-idle-strip.webp"),
    hit: require("../assets/sprites/baby-seal-hit-strip.webp"),
    die: require("../assets/sprites/baby-seal-die-strip.webp"),
  },
  bossPolarBear: {
    idle: require("../assets/sprites/boss-polar-bear-idle-strip.webp"),
    hit: require("../assets/sprites/boss-polar-bear-hit-strip.webp"),
    die: require("../assets/sprites/boss-polar-bear-die-strip.webp"),
  },
  snowFairy: {
    idle: require("../assets/sprites/snow-fairy-idle-strip.webp"),
    hit: require("../assets/sprites/snow-fairy-hit-strip.webp"),
    die: require("../assets/sprites/snow-fairy-die-strip.webp"),
  },
  bossIceQueenCat: {
    idle: require("../assets/sprites/boss-ice-queen-cat-idle-strip.webp"),
    hit: require("../assets/sprites/boss-ice-queen-cat-hit-strip.webp"),
    die: require("../assets/sprites/boss-ice-queen-cat-die-strip.webp"),
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
  battleBackgroundVineyardHills: require("../assets/sprites/battle-vineyard-hills.webp"),
  battleBackgroundCandyForest: require("../assets/sprites/battle-candy-forest.webp"),
  battleBackgroundTeaGarden: require("../assets/sprites/battle-tea-garden.webp"),
  battleBackgroundSausageFest: require("../assets/sprites/battle-sausage-fest.webp"),
  battleBackgroundFjordVillage: require("../assets/sprites/battle-fjord-village.webp"),
  battleBackgroundArcticGlacier: require("../assets/sprites/battle-arctic-glacier.webp"),
  battleBackgroundAuroraPalace: require("../assets/sprites/battle-aurora-palace.webp"),
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
  meteor: require("../assets/skills/meteor.png"),
  freeze: require("../assets/skills/freeze.png"),
  swords: require("../assets/skills/swords.png"),
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
  meteor: 256 / 260,
  freeze: 256 / 265,
  swords: 256 / 261,
};

// Objects the magic skills throw around (MagicEffects.tsx).
export const magicEffects = {
  meteor: require("../assets/effects/magic-meteor.png"), // 398x438, tail up-right
  freeze: require("../assets/effects/magic-freeze.png"), // 418x445
  sword: require("../assets/effects/magic-sword.png"), // 409x267, points right
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
  dishBarleyTea: require("../assets/food/dish-barley-tea.png"),
  dishMangoSmoothie: require("../assets/food/dish-mango-smoothie.png"),
  dishGrilledSardine: require("../assets/food/dish-grilled-sardine.png"),
  dishSpicyOyster: require("../assets/food/dish-spicy-oyster.png"),
  dishFiveGrainRice: require("../assets/food/dish-five-grain-rice.png"),
  dishPatbingsu: require("../assets/food/dish-patbingsu.png"),
  dishSalmonRoeBowl: require("../assets/food/dish-salmon-roe-bowl.png"),
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
  bambooShoot: require("../assets/food/bamboo-shoot.png"),
  dumplingWrapper: require("../assets/food/dumpling-wrapper.png"),
  driedPersimmon: require("../assets/food/dried-persimmon.png"),
  makgeolli: require("../assets/food/makgeolli.png"),
  azalea: require("../assets/food/azalea.png"),
  rice: require("../assets/food/rice.png"),
  // Fruits.
  asianPear: require("../assets/food/asian-pear.png"),
  peach: require("../assets/food/peach.png"),
  persimmon: require("../assets/food/persimmon.png"),
  kyohoGrapes: require("../assets/food/kyoho-grapes.png"),
  shineMuscat: require("../assets/food/shine-muscat.png"),
  mandarin: require("../assets/food/mandarin.png"),
  nectarine: require("../assets/food/nectarine.png"),
  jujube: require("../assets/food/jujube.png"),
  ume: require("../assets/food/ume.png"),
  apricot: require("../assets/food/apricot.png"),
  kiwi: require("../assets/food/kiwi.png"),
  pomegranate: require("../assets/food/pomegranate.png"),
  koreanRaspberry: require("../assets/food/korean-raspberry.png"),
  omija: require("../assets/food/omija.png"),
  strawberry: require("../assets/food/strawberry.png"),
  chamoe: require("../assets/food/chamoe.png"),
  // Nuts.
  almond: require("../assets/food/almond.png"),
  walnut: require("../assets/food/walnut.png"),
  cashew: require("../assets/food/cashew.png"),
  pistachio: require("../assets/food/pistachio.png"),
  hazelnut: require("../assets/food/hazelnut.png"),
  macadamia: require("../assets/food/macadamia.png"),
  pecan: require("../assets/food/pecan.png"),
  peanut: require("../assets/food/peanut.png"),
  pineNut: require("../assets/food/pine-nut.png"),
  chestnut: require("../assets/food/chestnut.png"),
  ginkgo: require("../assets/food/ginkgo.png"),
  brazilNut: require("../assets/food/brazil-nut.png"),
  // Grains and beans.
  brownRice: require("../assets/food/brown-rice.png"),
  blackRice: require("../assets/food/black-rice.png"),
  glutinousRice: require("../assets/food/glutinous-rice.png"),
  barley: require("../assets/food/barley.png"),
  oats: require("../assets/food/oats.png"),
  foxtailMillet: require("../assets/food/foxtail-millet.png"),
  sorghum: require("../assets/food/sorghum.png"),
  redBeans: require("../assets/food/red-beans.png"),
  blackBeans: require("../assets/food/black-beans.png"),
  chiliPowder: require("../assets/food/chili-powder.png"),
  mackerel: require("../assets/food/mackerel.png"),
  squidInk: require("../assets/food/squid-ink.png"),
  blossomPetals: require("../assets/food/blossom-petals.png"),
  friedTofu: require("../assets/food/fried-tofu.png"),
  radish: require("../assets/food/radish.png"),
  yuzu: require("../assets/food/yuzu.png"),
  abalone: require("../assets/food/abalone.png"),
  dishBambooDumpling: require("../assets/food/dish-bamboo-dumpling.png"),
  dishPersimmonRoll: require("../assets/food/dish-persimmon-roll.png"),
  dishHaemulPajeon: require("../assets/food/dish-haemul-pajeon.png"),
  dishAzaleaHwajeon: require("../assets/food/dish-azalea-hwajeon.png"),
  dishTteokbokki: require("../assets/food/dish-tteokbokki.png"),
  dishBraisedMackerel: require("../assets/food/dish-braised-mackerel.png"),
  dishSquidInkRisotto: require("../assets/food/dish-squid-ink-risotto.png"),
  dishSakuraMochi: require("../assets/food/dish-sakura-mochi.png"),
  dishInariSushi: require("../assets/food/dish-inari-sushi.png"),
  dishYuzuSherbet: require("../assets/food/dish-yuzu-sherbet.png"),
  dishAbalonePorridge: require("../assets/food/dish-abalone-porridge.png"),
  dishDragonFeast: require("../assets/food/dish-dragon-feast.png"),
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
  arrowBackGray: require("../assets/shop/arrow-back-gray.png"),
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
  picnicride1: require("../assets/comics/picnicride-1.webp"),
  picnicride2: require("../assets/comics/picnicride-2.webp"),
  picnicride3: require("../assets/comics/picnicride-3.webp"),
  picnicride4: require("../assets/comics/picnicride-4.webp"),
  candypath1: require("../assets/comics/candypath-1.webp"),
  candypath2: require("../assets/comics/candypath-2.webp"),
  candypath3: require("../assets/comics/candypath-3.webp"),
  candypath4: require("../assets/comics/candypath-4.webp"),
  teaparty1: require("../assets/comics/teaparty-1.webp"),
  teaparty2: require("../assets/comics/teaparty-2.webp"),
  teaparty3: require("../assets/comics/teaparty-3.webp"),
  teaparty4: require("../assets/comics/teaparty-4.webp"),
  festivalwalk1: require("../assets/comics/festivalwalk-1.webp"),
  festivalwalk2: require("../assets/comics/festivalwalk-2.webp"),
  festivalwalk3: require("../assets/comics/festivalwalk-3.webp"),
  festivalwalk4: require("../assets/comics/festivalwalk-4.webp"),
  riverboat1: require("../assets/comics/riverboat-1.webp"),
  riverboat2: require("../assets/comics/riverboat-2.webp"),
  riverboat3: require("../assets/comics/riverboat-3.webp"),
  riverboat4: require("../assets/comics/riverboat-4.webp"),
  iceberg1: require("../assets/comics/iceberg-1.webp"),
  iceberg2: require("../assets/comics/iceberg-2.webp"),
  iceberg3: require("../assets/comics/iceberg-3.webp"),
  iceberg4: require("../assets/comics/iceberg-4.webp"),
  aurorapath1: require("../assets/comics/aurorapath-1.webp"),
  aurorapath2: require("../assets/comics/aurorapath-2.webp"),
  aurorapath3: require("../assets/comics/aurorapath-3.webp"),
  aurorapath4: require("../assets/comics/aurorapath-4.webp"),
};

export const bgm = {
  field: require("../assets/bgm/main_theme.mp3"),
  boss: require("../assets/bgm/boss_theme.mp3"),
};

// Every strip frame is 160x160px, in a 5-frame row (guinea/slime) or 4-frame row (boss).
export const FRAME_SIZE = 160;
