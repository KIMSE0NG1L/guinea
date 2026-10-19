import { View } from "react-native";
import { SpriteStrip } from "./SpriteStrip";
import { spriteSheets, FRAME_SIZE } from "../assets";
import type { Outfit, PlayerAnimation } from "../types";

// Ported verbatim from index.css .guinea-sprite.* animation-duration values. Shared by
// every outfit — only the frame art changes per outfit, not the timing.
const DURATIONS: Record<PlayerAnimation, number> = {
  idle: 425,
  attack: 230,
  critical: 240,
  win: 480,
};

// Per-outfit frame layout. The original "default" strip is a 5-frame sheet, and its
// critical strip is drawn at 320px per frame with the guinea pig small inside (leaving
// room for its slash/burst) — `scale` puts that back at idle size, feet and centre
// lined up. Later outfits (cropped from a plain 4-frame reference sheet) use the normal
// FRAME_SIZE for every animation and need no extra scale compensation.
// 셰프기니's 16 frames were cut at one shared scale (the frying-pan flame frames set it),
// so one factor brings every animation back to the other companions' size.
const CHEF_FIT = 1.16;
const CHEF_SCALE = { idle: CHEF_FIT, attack: CHEF_FIT, critical: CHEF_FIT, win: CHEF_FIT };

const CONFIG: Record<Outfit, Record<PlayerAnimation, { frameCount: number; frameSize: number; scale: number }>> = {
  default: {
    idle: { frameCount: 5, frameSize: FRAME_SIZE, scale: 1 },
    attack: { frameCount: 5, frameSize: FRAME_SIZE, scale: 1 },
    critical: { frameCount: 5, frameSize: 320, scale: 2.52 },
    win: { frameCount: 5, frameSize: FRAME_SIZE, scale: 1 },
  },
  // This reference sheet draws attack/critical/win with an arm or prop flung out to the
  // side (plus a swirl/burst trailing it), so those frames needed extra side margin to
  // avoid clipping the effect — leaving the hamster itself smaller within the frame than
  // idle. Each `scale` below restores it to idle's on-screen size (128 / that frame's
  // actual content height, both measured when the strips were cropped).
  explorerHamster: {
    idle: { frameCount: 4, frameSize: FRAME_SIZE, scale: 1 },
    attack: { frameCount: 4, frameSize: FRAME_SIZE, scale: 1.42 },
    critical: { frameCount: 4, frameSize: FRAME_SIZE, scale: 1.45 },
    win: { frameCount: 4, frameSize: FRAME_SIZE, scale: 1.14 },
  },
  tetoGini: {
    idle: { frameCount: 4, frameSize: FRAME_SIZE, scale: 1 },
    attack: { frameCount: 4, frameSize: FRAME_SIZE, scale: 1.56 },
    // Reuses the attack strip verbatim — same frame layout/scale, not just the same source.
    critical: { frameCount: 4, frameSize: FRAME_SIZE, scale: 1.56 },
    win: { frameCount: 4, frameSize: FRAME_SIZE, scale: 1.04 },
  },
  assassinGini: {
    idle: { frameCount: 3, frameSize: FRAME_SIZE, scale: 1.24 },
    attack: { frameCount: 4, frameSize: FRAME_SIZE, scale: 1.56 },
    critical: { frameCount: 4, frameSize: FRAME_SIZE, scale: 1.56 },
    win: { frameCount: 4, frameSize: FRAME_SIZE, scale: 1.21 },
  },
  egenGini: {
    idle: { frameCount: 3, frameSize: FRAME_SIZE, scale: 1.35 },
    attack: { frameCount: 4, frameSize: FRAME_SIZE, scale: 1.56 },
    critical: { frameCount: 4, frameSize: FRAME_SIZE, scale: 1.56 },
    win: { frameCount: 4, frameSize: FRAME_SIZE, scale: 1.11 },
  },
  // Frames are lined up on the straw hat and the feet; the sword (attack) and red slash
  // (critical) needed a smaller fit, which these scales undo (idle × 1.25 / 1.37 / 0.95).
  samuraiGini: {
    idle: { frameCount: 4, frameSize: FRAME_SIZE, scale: 1.15 },
    attack: { frameCount: 4, frameSize: FRAME_SIZE, scale: 1.44 },
    critical: { frameCount: 4, frameSize: FRAME_SIZE, scale: 1.58 },
    // The sheet's 4th win frame (turned away, bowing) was dropped.
    win: { frameCount: 3, frameSize: FRAME_SIZE, scale: 1.09 },
  },
  chefGini: {
    idle: { frameCount: 4, frameSize: FRAME_SIZE, scale: CHEF_SCALE.idle },
    attack: { frameCount: 4, frameSize: FRAME_SIZE, scale: CHEF_SCALE.attack },
    critical: { frameCount: 4, frameSize: FRAME_SIZE, scale: CHEF_SCALE.critical },
    win: { frameCount: 4, frameSize: FRAME_SIZE, scale: CHEF_SCALE.win },
  },
};

export function CharacterSprite({
  outfit,
  animation,
  size = 108,
  scale = 1,
  repeat = 1,
  restartKey,
}: {
  outfit: Outfit;
  animation: PlayerAnimation;
  size?: number;
  scale?: number;
  repeat?: number;
  restartKey?: string | number;
}) {
  const source = spriteSheets.guinea[outfit][animation];
  const config = CONFIG[outfit][animation];

  // Fixed-size wrapper + transform (not a bigger displaySize) keeps the layout box
  // constant across outfits, so siblings/containers don't reflow when a scaled outfit is equipped.
  return (
    <View style={{ width: size, height: size, transform: [{ scale: scale * config.scale }], transformOrigin: "50% 100%" }}>
      <SpriteStrip
        source={source}
        frameSize={config.frameSize}
        frameCount={config.frameCount}
        displaySize={size}
        durationMs={DURATIONS[animation]}
        mode={animation === "idle" ? "loop" : "once"}
        repeat={repeat}
        restartKey={restartKey}
      />
    </View>
  );
}
