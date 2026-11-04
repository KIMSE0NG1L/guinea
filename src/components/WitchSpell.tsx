import { useEffect, useState } from "react";
import { View, type ImageSourcePropType } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { effects } from "../assets";
import { SpriteStrip } from "./SpriteStrip";
import type { Point } from "./ExecuteEffect";

// 마녀기니 fights from where she stands: every swing is a spell bolt fired from her wand at
// the enemy, landing in a burst. Bolts reach the enemy just before useAutoBattle's 260ms
// attack→hit beat, so the burst and the damage number arrive together.
export const WITCH_TRAVEL_MS = 230;
// How long a mounted spell needs before it can be dropped (longest crit burst + travel).
export const WITCH_SPELL_LIFE_MS = WITCH_TRAVEL_MS + 1250;

type Clip = { source: ImageSourcePropType; frameSize: number; frameCount: number; durationMs: number; display: number };

// Eight elements, each a looping bolt and its own hit-spark. Every strip is `--square`
// padded, so the art sits on the frame's horizontal midline; the bolt's head is a bit right
// of centre (`head`, as a share of the display box) with its trail behind it.
const ELEMENTS: { bolt: Clip & { head: number }; hit: Clip }[] = [
  {
    bolt: { source: effects.witchOrbArcane, frameSize: 144, frameCount: 24, durationMs: 767, display: 170, head: 0.3 },
    hit: { source: effects.witchHitArcane, frameSize: 136, frameCount: 16, durationMs: 500, display: 190 },
  },
  {
    bolt: { source: effects.witchOrbFire, frameSize: 136, frameCount: 36, durationMs: 1167, display: 160, head: 0.36 },
    hit: { source: effects.witchHitFire, frameSize: 136, frameCount: 16, durationMs: 500, display: 190 },
  },
  {
    bolt: { source: effects.witchOrbIce, frameSize: 176, frameCount: 24, durationMs: 767, display: 190, head: 0.36 },
    hit: { source: effects.witchHitIce, frameSize: 136, frameCount: 16, durationMs: 500, display: 190 },
  },
  {
    bolt: { source: effects.witchOrbPoison, frameSize: 144, frameCount: 24, durationMs: 767, display: 170, head: 0.3 },
    hit: { source: effects.witchHitPoison, frameSize: 136, frameCount: 16, durationMs: 500, display: 190 },
  },
  {
    bolt: { source: effects.witchOrbVolt, frameSize: 120, frameCount: 15, durationMs: 467, display: 130, head: 0.18 },
    hit: { source: effects.witchHitVolt, frameSize: 136, frameCount: 16, durationMs: 500, display: 190 },
  },
  {
    bolt: { source: effects.witchOrbHoly, frameSize: 144, frameCount: 24, durationMs: 767, display: 170, head: 0.3 },
    hit: { source: effects.witchHitHoly, frameSize: 136, frameCount: 16, durationMs: 500, display: 190 },
  },
  {
    bolt: { source: effects.witchOrbPink, frameSize: 120, frameCount: 15, durationMs: 467, display: 130, head: 0.18 },
    hit: { source: effects.witchHitPink, frameSize: 136, frameCount: 16, durationMs: 500, display: 190 },
  },
  {
    bolt: { source: effects.witchOrbGhost, frameSize: 136, frameCount: 36, durationMs: 1167, display: 160, head: 0.36 },
    hit: { source: effects.witchHitGhost, frameSize: 136, frameCount: 16, durationMs: 500, display: 190 },
  },
];

// A crit also blows up in one of these on top of the element's own spark.
const CRITS: Clip[] = [
  { source: effects.witchCritStar, frameSize: 216, frameCount: 28, durationMs: 900, display: 230 },
  { source: effects.witchCritPlasma, frameSize: 224, frameCount: 30, durationMs: 967, display: 210 },
  { source: effects.witchCritMana, frameSize: 208, frameCount: 36, durationMs: 1167, display: 230 },
];

// One cast: mount fresh (new key) per swing. Picks its element (and crit burst) at random
// on mount, flies the bolt from `from` to `to`, then plays the burst there.
export function WitchSpell({ from, to, critical }: { from: Point; to: Point; critical: boolean }) {
  const [pick] = useState(() => ({
    element: ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)],
    crit: CRITS[Math.floor(Math.random() * CRITS.length)],
  }));
  const [landed, setLanded] = useState(false);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, { duration: WITCH_TRAVEL_MS, easing: Easing.in(Easing.quad) });
    const timer = setTimeout(() => setLanded(true), WITCH_TRAVEL_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { bolt, hit } = pick.element;
  // A crit bolt is fatter, so it reads before it even lands.
  const boltSize = bolt.display * (critical ? 1.45 : 1);
  const dx = to.left - from.left;
  const dy = to.bottom - from.bottom;
  const angle = Math.atan2(-dy, dx); // screen y grows downward, `bottom` grows up
  const headX = boltSize * bolt.head;
  const boltStyle = useAnimatedStyle(() => ({
    // Fades in over the first stretch so the trail doesn't flash up over her body.
    opacity: Math.min(1, progress.value * 5),
    transform: [
      { translateX: dx * progress.value - headX * Math.cos(angle) },
      { translateY: -dy * progress.value - headX * Math.sin(angle) },
      { rotate: `${angle}rad` },
    ],
  }));

  return (
    <View style={{ position: "absolute", left: 0, top: 0, right: 0, bottom: 0 }} pointerEvents="none">
      {!landed && (
        <Animated.View style={[{ position: "absolute", left: from.left - boltSize / 2, bottom: from.bottom - boltSize / 2, width: boltSize, height: boltSize }, boltStyle]}>
          <SpriteStrip source={bolt.source} frameSize={bolt.frameSize} frameCount={bolt.frameCount} displaySize={boltSize} durationMs={bolt.durationMs} mode="loop" />
        </Animated.View>
      )}
      {landed && critical && <Burst clip={pick.crit} at={to} />}
      {landed && <Burst clip={hit} at={to} scale={critical ? 1.3 : 1} />}
    </View>
  );
}

function Burst({ clip, at, scale = 1 }: { clip: Clip; at: Point; scale?: number }) {
  const size = clip.display * scale;
  return (
    <View style={{ position: "absolute", left: at.left - size / 2, bottom: at.bottom - size / 2, width: size, height: size }}>
      <SpriteStrip source={clip.source} frameSize={clip.frameSize} frameCount={clip.frameCount} displaySize={size} durationMs={clip.durationMs} mode="once" />
    </View>
  );
}
