import { View } from "react-native";
import { SpriteStrip } from "./SpriteStrip";
import { spriteSheets, FRAME_SIZE } from "../assets";
import type { EnemyAnimation, EnemyKind } from "../types";

// Ported from index.css .slime-sprite.* / .boss-slime-sprite.* animation-duration + frame counts.
// NOTE: the web CSS never actually set a background-size/animation for
// .boss-slime-sprite.hit/.die (an apparent oversight — only .idle was wired up), and the
// boss hit/die source strips are in fact 5-frame sheets (same layout as the regular slime's),
// not the 4-frame layout the boss idle sheet uses. We animate them properly here instead of
// porting the broken static/tiled look.
// mushroom (stage 2's regular mob) is a plain 5-frame sheet for every animation, same
// layout as slime — only bossSlime's idle kept the web's 4-frame sheet.
// carrot (stage 3's regular mob), chicken (stage 4's regular mob), potato (stage 5's
// regular mob), bossMushroom, bossCarrotGiant, bossChicken, and bossPotato are 4-frame
// sheets for every animation.
const CONFIG: Record<EnemyKind | "bossSlime" | "bossMushroom" | "bossCarrotGiant" | "bossChicken" | "bossPotato" | "bossFatCat" | "bossFridge" | "bossKingCrab" | "bossShark" | "bossLavaSlime" | "bossCarnivorousPlant" | "bossStreamDragon" | "bossDehydratedCamel" | "bossRattlesnake" | "bossHauntedGoat" | "bossBambooPanda" | "bossTurtleSpirit" | "bossTigerSpirit" | "bossIceGolem" | "bossTavernKeeper" | "bossNineTailedFox" | "bossChiliSack" | "bossPirateOctopus" | "bossBlossomShark" | "bossTanukiMerchant" | "bossGoldenShachi" | "bossCapybaraInnkeeper" | "bossScrollRat" | "bossSeahorseGeneral" | "bossDragonKing" | "bossOvenGolem" | "bossRescueDog" | "bossBaguetteKnight" | "bossElderGini" | "bossWitchGini", Record<EnemyAnimation, { frameCount: number; durationMs: number; mode: "loop" | "once"; offsetY?: number }>> = {
  slime: {
    idle: { frameCount: 5, durationMs: 650, mode: "loop" },
    hit: { frameCount: 5, durationMs: 310, mode: "once" },
    die: { frameCount: 5, durationMs: 480, mode: "once" },
  },
  // Regenerated a third time with per-cell adaptive cropping (bounding box detected per
  // cell, not assumed centered) and an explicit "draw it small, 25%+ margin on every side,
  // nothing touches a cell edge" prompt — verified frame-by-frame afterward (every frame's
  // content sits well clear of both y=0 and y=160), so no offsetY correction is needed.
  mushroom: {
    idle: { frameCount: 5, durationMs: 650, mode: "loop" },
    hit: { frameCount: 5, durationMs: 310, mode: "once" },
    die: { frameCount: 5, durationMs: 480, mode: "once" },
  },
  carrot: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  bossSlime: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 5, durationMs: 310, mode: "once" },
    die: { frameCount: 5, durationMs: 480, mode: "once" },
  },
  bossMushroom: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  bossCarrotGiant: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  // Regenerated a third time with per-cell adaptive cropping and an explicit "draw it
  // small, 25%+ margin on every side" prompt — verified frame-by-frame afterward, every
  // frame sits well clear of y=0 and y=160, so no offsetY correction is needed.
  chicken: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  bossChicken: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  // Regenerated with a thinner outline, same offsetY-from-measured-foot-row approach
  // (idle:158 baseline, hit:148, die:126 out of 160).
  potato: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop", offsetY: 0 },
    hit: { frameCount: 4, durationMs: 310, mode: "once", offsetY: 10 },
    die: { frameCount: 4, durationMs: 480, mode: "once", offsetY: 32 },
  },
  bossPotato: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  mouse: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  bossFatCat: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  cauldron: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  bossFridge: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  // Regenerated with more cell padding, same frame-bleed fix as 습지버섯. offsetY checked
  // against every frame's own bottom pixel before picking a value (idle/hit already sit on
  // the same line at 152 of 160, no shift needed; die's frames all reach ~140, 12px short).
  mudskipper: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop", offsetY: 0 },
    hit: { frameCount: 4, durationMs: 310, mode: "once", offsetY: 0 },
    die: { frameCount: 4, durationMs: 480, mode: "once", offsetY: 12 },
  },
  bossKingCrab: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  bluefish: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  bossShark: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  salamander: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  bossLavaSlime: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  monkey: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  bossCarnivorousPlant: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  carp: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  bossStreamDragon: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  cactus: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  bossDehydratedCamel: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  fox: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  bossRattlesnake: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  lizard: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  bossHauntedGoat: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  mantou: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  bossBambooPanda: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  pig: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  bossTurtleSpirit: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  magpie: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  bossTigerSpirit: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  snowRabbit: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  bossIceGolem: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  drunkCat: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  bossTavernKeeper: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  flowerSnake: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  bossNineTailedFox: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  // Its sheet's fourth hit frame already tips over, so the hit keeps the first three.
  riceSack: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 3, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  bossChiliSack: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  mackerel: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  bossPirateOctopus: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  blossomCrab: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  bossBlossomShark: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  shrineFox: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  bossTanukiMerchant: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  armorBeetle: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  bossGoldenShachi: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  onsenMonkey: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  bossCapybaraInnkeeper: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  ninjaFrog: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  bossScrollRat: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  lanternAngler: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  bossSeahorseGeneral: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  clamMaid: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  bossDragonKing: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  gondolaDuck: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  bossOvenGolem: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  bellCalf: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  bossRescueDog: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  croissantKid: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  bossBaguetteKnight: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  sleepyGini: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  bossElderGini: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  sleepwalkerGini: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
  bossWitchGini: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
  },
};

const BOSS_SHEET_FOR: Record<EnemyKind, "bossSlime" | "bossMushroom" | "bossCarrotGiant" | "bossChicken" | "bossPotato" | "bossFatCat" | "bossFridge" | "bossKingCrab" | "bossShark" | "bossLavaSlime" | "bossCarnivorousPlant" | "bossStreamDragon" | "bossDehydratedCamel" | "bossRattlesnake" | "bossHauntedGoat" | "bossBambooPanda" | "bossTurtleSpirit" | "bossTigerSpirit" | "bossIceGolem" | "bossTavernKeeper" | "bossNineTailedFox" | "bossChiliSack" | "bossPirateOctopus" | "bossBlossomShark" | "bossTanukiMerchant" | "bossGoldenShachi" | "bossCapybaraInnkeeper" | "bossScrollRat" | "bossSeahorseGeneral" | "bossDragonKing" | "bossOvenGolem" | "bossRescueDog" | "bossBaguetteKnight" | "bossElderGini" | "bossWitchGini"> = {
  slime: "bossSlime",
  mushroom: "bossMushroom",
  carrot: "bossCarrotGiant",
  chicken: "bossChicken",
  potato: "bossPotato",
  mouse: "bossFatCat",
  cauldron: "bossFridge",
  mudskipper: "bossKingCrab",
  bluefish: "bossShark",
  salamander: "bossLavaSlime",
  monkey: "bossCarnivorousPlant",
  carp: "bossStreamDragon",
  cactus: "bossDehydratedCamel",
  fox: "bossRattlesnake",
  lizard: "bossHauntedGoat",
  mantou: "bossBambooPanda",
  pig: "bossTurtleSpirit",
  magpie: "bossTigerSpirit",
  snowRabbit: "bossIceGolem",
  drunkCat: "bossTavernKeeper",
  flowerSnake: "bossNineTailedFox",
  riceSack: "bossChiliSack",
  mackerel: "bossPirateOctopus",
  blossomCrab: "bossBlossomShark",
  shrineFox: "bossTanukiMerchant",
  armorBeetle: "bossGoldenShachi",
  onsenMonkey: "bossCapybaraInnkeeper",
  ninjaFrog: "bossScrollRat",
  lanternAngler: "bossSeahorseGeneral",
  clamMaid: "bossDragonKing",
  gondolaDuck: "bossOvenGolem",
  bellCalf: "bossRescueDog",
  croissantKid: "bossBaguetteKnight",
  sleepyGini: "bossElderGini",
  sleepwalkerGini: "bossWitchGini",
};

export function EnemySprite({
  boss,
  kind = "slime",
  animation,
  size,
  restartKey,
  tintColor,
}: {
  boss: boolean;
  kind?: EnemyKind;
  animation: EnemyAnimation;
  size: number;
  restartKey?: string | number;
  tintColor?: string;
}) {
  const bossKind = BOSS_SHEET_FOR[kind];
  const sheet = boss ? spriteSheets[bossKind] : spriteSheets[kind];
  const config = CONFIG[boss ? bossKind : kind][animation];
  // Converts a crop-correction offset expressed in source frame px (FRAME_SIZE=160) into
  // this instance's actual render px — same fix as CharacterSprite's offsetY.
  const offsetYPx = (config.offsetY ?? 0) * (size / FRAME_SIZE);

  return (
    <View style={offsetYPx ? { width: size, height: size, transform: [{ translateY: offsetYPx }] } : undefined}>
      <SpriteStrip
        source={sheet[animation]}
        frameSize={FRAME_SIZE}
        frameCount={config.frameCount}
        displaySize={size}
        durationMs={config.durationMs}
        mode={config.mode}
        restartKey={restartKey}
        tintColor={tintColor}
      />
    </View>
  );
}
