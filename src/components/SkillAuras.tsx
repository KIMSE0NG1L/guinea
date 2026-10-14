import { useEffect, type ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Svg, { Defs, Ellipse, RadialGradient, Rect, Stop } from "react-native-svg";
import { uiImages } from "../assets";
import { Flash, Sparks, type Point } from "./ExecuteEffect";
import { SkillCallout } from "./SkillCallout";

// Steal is green and coin-gold, Focus is gold on deep blue — matching their icons.
const STEAL_GREEN = "#5fd35a";
const STEAL_GOLD = "#ffc93a";
const STEAL_GOLD_LIGHT = "#fff0a0";
const FOCUS_GOLD = "#ffd24a";

// ---- Cast bursts (scene overlay, once per cast) ----------------------------------------

// The screen dip every buff skill makes on cast — one shared piece so they all darken
// exactly alike; each skill's colour comes from its sparks and callout instead.
function CastDim() {
  return <Flash color="#000000" peak={0.45} delay={0} rise={60} fall={320} />;
}

export function StealCastEffect({ at }: { at: Point }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <CastDim />
      <Sparks at={at} delay={20} color={STEAL_GREEN} />
      <Sparks at={at} delay={80} color="#ffe27a" />
      <SkillCallout text="훔치기!" color="#8af07a" strokeColor="#123d10" holdMs={420} />
    </View>
  );
}

export function FocusCastEffect({ at }: { at: Point }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <CastDim />
      <Ring at={at} color={FOCUS_GOLD} delay={40} />
      <Ring at={at} color="#9cc8ff" delay={140} />
      <Sparks at={at} delay={60} color={FOCUS_GOLD} />
      <SkillCallout text="집중!" color="#ffe07a" strokeColor="#13265c" holdMs={420} />
    </View>
  );
}

function Ring({ at, color, delay }: { at: Point; color: string; delay: number }) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withDelay(delay, withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({
    opacity: progress.value === 0 ? 0 : 1 - progress.value,
    transform: [{ scale: 0.3 + progress.value * 1.8 }],
  }));
  return <Animated.View style={[styles.ring, { borderColor: color, left: at.left - RING / 2, bottom: at.bottom - RING / 2 }, style]} />;
}

// ---- Vignette (scene overlay, for the skill's whole duration) ----------------------------

// Darkens only the edges of the scene while a buff runs, pulling the eye to the fight in
// the middle without hiding it. Eases in, holds, and lifts slowly as the buff ends.
export function BuffVignette({ durationMs }: { durationMs: number }) {
  const life = useSharedValue(0);
  useEffect(() => {
    life.value = withSequence(
      withTiming(1, { duration: 300 }),
      withDelay(durationMs - 900, withTiming(0, { duration: 600, easing: Easing.in(Easing.quad) })),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: life.value }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, style]} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <RadialGradient id="buff-vignette" cx="50%" cy="55%" rx="62%" ry="62%">
            <Stop offset={0} stopColor={BUFF_VIGNETTE} stopOpacity={0} />
            <Stop offset={0.5} stopColor={BUFF_VIGNETTE} stopOpacity={0} />
            <Stop offset={1} stopColor={BUFF_VIGNETTE} stopOpacity={0.78} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#buff-vignette)" />
      </Svg>
    </Animated.View>
  );
}

// Shared by every buff skill, so they all dim the scene the same way.
const BUFF_VIGNETTE = "#1e1206";

// ---- Auras (inside the player's box, for the skill's whole duration) -------------------

// Fades in, holds, and fades out right as the buff runs out.
function useAuraLife(durationMs: number) {
  const life = useSharedValue(0);
  useEffect(() => {
    life.value = withSequence(
      withTiming(1, { duration: 180 }),
      withDelay(durationMs - 480, withTiming(0, { duration: 300 })),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return life;
}

// Steal: gold glints popping all around.
export function StealAura({ durationMs }: { durationMs: number }) {
  const life = useAuraLife(durationMs);
  const lifeStyle = useAnimatedStyle(() => ({ opacity: life.value }));
  return (
    <Animated.View style={[styles.aura, lifeStyle]} pointerEvents="none">
      {STEAL_GLINTS.map((glint, index) => (
        <Glint key={index} {...glint} />
      ))}
    </Animated.View>
  );
}

const STEAL_GLINTS = [
  { left: 8, bottom: 70, delay: 0, color: STEAL_GOLD },
  { left: 86, bottom: 58, delay: 140, color: STEAL_GOLD_LIGHT },
  { left: 22, bottom: 24, delay: 260, color: STEAL_GOLD_LIGHT },
  { left: 92, bottom: 18, delay: 380, color: STEAL_GOLD },
  { left: 54, bottom: 92, delay: 500, color: STEAL_GOLD },
];

// Focus: a golden glow behind the guinea pig, a halo over its head and arrows rising.
export function FocusAura({ durationMs }: { durationMs: number }) {
  const life = useAuraLife(durationMs);
  const lifeStyle = useAnimatedStyle(() => ({ opacity: life.value }));
  return (
    <Animated.View style={[styles.aura, lifeStyle]} pointerEvents="none">
      <Pulse style={styles.bodyGlow} period={700}>
        <SoftGlow id="focus-body" width={BODY_GLOW.width} height={BODY_GLOW.height} stops={BODY_GLOW_STOPS} />
      </Pulse>
      <Pulse style={styles.halo} period={450}>
        <SoftGlow id="focus-halo" width={HALO.width} height={HALO.height} stops={HALO_STOPS} />
      </Pulse>
      {FOCUS_ARROWS.map((arrow, index) => (
        <RisingArrow key={index} {...arrow} />
      ))}
    </Animated.View>
  );
}

const FOCUS_ARROWS = [
  { left: 4, delay: 0 },
  { left: 90, delay: 260 },
  { left: 18, delay: 520 },
  { left: 78, delay: 780 },
];

// Breathes between two sizes forever (until its aura unmounts).
function Pulse({ style, period, children }: { style: object; period: number; children?: ReactNode }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(withTiming(1, { duration: period, easing: Easing.inOut(Easing.quad) }), -1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const animated = useAnimatedStyle(() => ({ opacity: 0.45 + t.value * 0.35, transform: [{ scale: 0.92 + t.value * 0.12 }] }));
  return <Animated.View style={[style, animated]}>{children}</Animated.View>;
}

// An elliptical radial gradient filling its box — soft light with no hard edge.
function SoftGlow({
  id,
  width,
  height,
  stops,
}: {
  id: string;
  width: number;
  height: number;
  stops: { offset: number; color: string; opacity: number }[];
}) {
  return (
    <Svg width={width} height={height}>
      <Defs>
        <RadialGradient id={id} cx="50%" cy="50%" rx="50%" ry="50%">
          {stops.map((stop) => (
            <Stop key={stop.offset} offset={stop.offset} stopColor={stop.color} stopOpacity={stop.opacity} />
          ))}
        </RadialGradient>
      </Defs>
      <Ellipse cx={width / 2} cy={height / 2} rx={width / 2} ry={height / 2} fill={`url(#${id})`} />
    </Svg>
  );
}

// Glow behind the body: bright warm core bleeding out to nothing.
const BODY_GLOW = { width: 124, height: 116 };
const BODY_GLOW_STOPS = [
  { offset: 0, color: "#fff6c8", opacity: 0.95 },
  { offset: 0.4, color: FOCUS_GOLD, opacity: 0.7 },
  { offset: 1, color: FOCUS_GOLD, opacity: 0 },
];
// Halo: a hollow band of light — clear in the middle, glowing ring, soft outer bleed.
const HALO = { width: 64, height: 26 };
const HALO_STOPS = [
  { offset: 0, color: FOCUS_GOLD, opacity: 0 },
  { offset: 0.45, color: FOCUS_GOLD, opacity: 0.1 },
  { offset: 0.7, color: "#fff3b0", opacity: 1 },
  { offset: 0.82, color: FOCUS_GOLD, opacity: 0.75 },
  { offset: 1, color: FOCUS_GOLD, opacity: 0 },
];

// A four-point sparkle that pops in and out on a loop.
function Glint({ left, bottom, delay, color }: { left: number; bottom: number; delay: number; color: string }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(
      delay,
      withRepeat(withSequence(withTiming(1, { duration: 220 }), withTiming(0, { duration: 260 }), withTiming(0, { duration: 160 })), -1),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: t.value, transform: [{ scale: 0.4 + t.value * 0.8 }, { rotate: `${t.value * 45}deg` }] }));
  return (
    <Animated.View style={[styles.glint, { left: left - GLINT / 2, bottom }, style]}>
      <View style={[styles.glintBar, { backgroundColor: color }]} />
      <View style={[styles.glintBar, styles.glintBarCross, { backgroundColor: color }]} />
    </Animated.View>
  );
}

function RisingArrow({ left, delay }: { left: number; delay: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(delay, withRepeat(withTiming(1, { duration: 1000, easing: Easing.out(Easing.quad) }), -1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({
    opacity: t.value < 0.2 ? t.value * 5 : (1 - t.value) / 0.8,
    transform: [{ translateY: -t.value * 50 }],
  }));
  return (
    <Animated.View style={[styles.arrow, { left: left - 7 }, style]}>
      <Text style={styles.arrowText}>▲</Text>
    </Animated.View>
  );
}

// ---- Steal's per-hit coins (scene overlay) -----------------------------------------------

// Each Steal hit knocks a few coins off the enemy that arc over to the guinea pig.
export function StealCoins({ from, to }: { from: Point; to: Point }) {
  return (
    <>
      {[
        { delay: 0, lift: 46 },
        { delay: 70, lift: 64 },
        { delay: 140, lift: 34 },
      ].map((coin, index) => (
        <FlyingCoin key={index} from={from} to={to} {...coin} />
      ))}
    </>
  );
}

function FlyingCoin({ from, to, delay, lift }: { from: Point; to: Point; delay: number; lift: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(delay, withTiming(1, { duration: 480, easing: Easing.inOut(Easing.quad) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const dx = to.left - from.left;
  const dy = to.bottom - from.bottom;
  const style = useAnimatedStyle(() => ({
    opacity: t.value === 0 ? 0 : t.value > 0.85 ? (1 - t.value) / 0.15 : 1,
    transform: [
      { translateX: dx * t.value },
      // Up-and-over arc: a parabola peaking `lift` px above the straight line.
      { translateY: -(dy * t.value + lift * 4 * t.value * (1 - t.value)) },
      { rotate: `${t.value * 540}deg` },
    ],
  }));
  return (
    <Animated.Image
      source={uiImages.coin}
      style={[styles.coin, { left: from.left - COIN / 2, bottom: from.bottom - COIN / 2 }, style]}
    />
  );
}

const RING = 70;
const GLINT = 14;
const COIN = 16;

const styles = StyleSheet.create({
  ring: { position: "absolute", width: RING, height: RING, borderRadius: RING / 2, borderWidth: 4 },
  // Fills the 108px-wide player box from its feet up; rendered first so it sits behind the sprite.
  aura: { position: "absolute", left: 0, right: 0, bottom: 0, height: 120 },
  // Both glows draw their own soft edges; these boxes just place them.
  bodyGlow: { position: "absolute", left: (108 - BODY_GLOW.width) / 2, bottom: -2, width: BODY_GLOW.width, height: BODY_GLOW.height },
  halo: { position: "absolute", left: (108 - HALO.width) / 2, bottom: 98, width: HALO.width, height: HALO.height },
  glint: { position: "absolute", width: GLINT, height: GLINT, alignItems: "center", justifyContent: "center" },
  glintBar: { position: "absolute", width: GLINT, height: 3, borderRadius: 2 },
  glintBarCross: { transform: [{ rotate: "90deg" }] },
  arrow: { position: "absolute", bottom: 20 },
  arrowText: { fontSize: 14, color: FOCUS_GOLD, textShadowColor: "#7a4b00", textShadowRadius: 2, textShadowOffset: { width: 0, height: 1 } },
  coin: { position: "absolute", width: COIN, height: COIN },
});
