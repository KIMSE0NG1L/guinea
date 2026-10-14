import { View } from "react-native";
import { SpriteStrip } from "./SpriteStrip";
import { spriteSheets, FRAME_SIZE } from "../assets";
import type { Outfit, PlayerAnimation } from "../types";

// Ported verbatim from index.css .guinea-sprite.* animation-duration values.
const DURATIONS: Record<PlayerAnimation, number> = {
  idle: 425,
  attack: 230,
  critical: 240,
  win: 480,
};

// The critical strip is drawn at 320px per frame (the rest use FRAME_SIZE) and with the
// guinea pig small in each frame, leaving room for its slash and burst. CRITICAL_SCALE
// puts it back at exactly idle size, feet and centre lined up (scaled from the feet).
const CRITICAL_FRAME_SIZE = 320;
export const CRITICAL_SCALE = 2.52;

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
  const durationMs = DURATIONS[animation];

  // Fixed-size wrapper + transform (not a bigger displaySize) keeps the layout box
  // constant across outfits, so siblings/containers don't reflow when a scaled outfit is equipped.
  return (
    <View style={{ width: size, height: size, transform: [{ scale }], transformOrigin: "50% 100%" }}>
      <SpriteStrip
        source={source}
        frameSize={animation === "critical" ? CRITICAL_FRAME_SIZE : FRAME_SIZE}
        frameCount={5}
        displaySize={size}
        durationMs={durationMs}
        mode={animation === "idle" ? "loop" : "once"}
        repeat={repeat}
        restartKey={restartKey}
      />
    </View>
  );
}
