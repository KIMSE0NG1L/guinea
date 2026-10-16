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
const CONFIG: Record<EnemyKind | "bossSlime" | "bossMushroom" | "bossCarrotGiant" | "bossChicken" | "bossPotato" | "bossFatCat" | "bossFridge" | "bossKingCrab" | "bossShark" | "bossLavaSlime" | "bossCarnivorousPlant" | "bossStreamDragon" | "bossDehydratedCamel" | "bossRattlesnake" | "bossHauntedGoat" | "bossBambooPanda", Record<EnemyAnimation, { frameCount: number; durationMs: number; mode: "loop" | "once" }>> = {
  slime: {
    idle: { frameCount: 5, durationMs: 650, mode: "loop" },
    hit: { frameCount: 5, durationMs: 310, mode: "once" },
    die: { frameCount: 5, durationMs: 480, mode: "once" },
  },
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
  potato: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
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
  mudskipper: {
    idle: { frameCount: 4, durationMs: 650, mode: "loop" },
    hit: { frameCount: 4, durationMs: 310, mode: "once" },
    die: { frameCount: 4, durationMs: 480, mode: "once" },
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
};

const BOSS_SHEET_FOR: Record<EnemyKind, "bossSlime" | "bossMushroom" | "bossCarrotGiant" | "bossChicken" | "bossPotato" | "bossFatCat" | "bossFridge" | "bossKingCrab" | "bossShark" | "bossLavaSlime" | "bossCarnivorousPlant" | "bossStreamDragon" | "bossDehydratedCamel" | "bossRattlesnake" | "bossHauntedGoat" | "bossBambooPanda"> = {
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

  return (
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
  );
}
