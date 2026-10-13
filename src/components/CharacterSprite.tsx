import { View } from "react-native";
import { SpriteStrip } from "./SpriteStrip";
import { spriteSheets, FRAME_SIZE } from "../assets";
import type { Outfit, PlayerAnimation } from "../types";

// Ported verbatim from index.css .guinea-sprite.* animation-duration values.
// acorn/pauper outfits override critical to .32s; default stays .24s.
const DURATIONS: Record<PlayerAnimation, number> = {
  idle: 425,
  attack: 230,
  critical: 240,
  win: 480,
};
const CRITICAL_OVERRIDE_MS = 320;

export function CharacterSprite({
  outfit,
  animation,
  size = 108,
  scale = 1,
  restartKey,
}: {
  outfit: Outfit;
  animation: PlayerAnimation;
  size?: number;
  scale?: number;
  restartKey?: string | number;
}) {
  const source = spriteSheets.guinea[outfit][animation];
  const durationMs = animation === "critical" && outfit !== "default" ? CRITICAL_OVERRIDE_MS : DURATIONS[animation];

  // Fixed-size wrapper + transform (not a bigger displaySize) keeps the layout box
  // constant across outfits, so siblings/containers don't reflow when a scaled outfit is equipped.
  return (
    <View style={{ width: size, height: size, transform: [{ scale }], transformOrigin: "50% 100%" }}>
      <SpriteStrip
        source={source}
        frameSize={FRAME_SIZE}
        frameCount={5}
        displaySize={size}
        durationMs={durationMs}
        mode={animation === "idle" ? "loop" : "once"}
        restartKey={restartKey}
      />
    </View>
  );
}
