import { useEffect } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import Svg, { Defs, Ellipse, RadialGradient, Stop } from "react-native-svg";
import { colors, fonts } from "../theme";
import { icons, statIcons } from "../assets";
import { formatGameNumber } from "../state/gameMath";
import { StrokedText } from "./StrokedText";

const STAGE = 150; // square the burst elements radiate within, centered under the label
const CENTER = STAGE / 2;
const GLOW_SIZE = 150; // soft radial light behind everything else, bright center fading to nothing

// A sunburst of thin rays fanning out from the center, a couple of expanding rings, a
// handful of sparks shooting out, and a few twinkling stars — built from plain Views
// (no SVG) to match how the rest of this project's combat effects (ExecuteEffect,
// SkillAuras) compose their bursts.
const RAY_COUNT = 12;
const RAYS = Array.from({ length: RAY_COUNT }, (_, i) => (360 / RAY_COUNT) * i);

const SPARKS = [
  { angle: -70, distance: 60, delay: 40 },
  { angle: -20, distance: 68, delay: 90 },
  { angle: 25, distance: 58, delay: 60 },
  { angle: 75, distance: 64, delay: 110 },
  { angle: 140, distance: 62, delay: 70 },
  { angle: -140, distance: 66, delay: 100 },
];

const STARS = [
  { angle: -55, distance: 66, delay: 180, size: 15 },
  { angle: 20, distance: 72, delay: 260, size: 12 },
  { angle: 95, distance: 64, delay: 220, size: 13 },
  { angle: -165, distance: 70, delay: 300, size: 11 },
];

// A radial flash + sunburst + popping level number over the player, mounted fresh via
// `key={level}` at the call site so it restarts on every level-up.
export function LevelUpBurst({ level, attackGain }: { level: number; attackGain: number }) {
  const glow = useSharedValue(0);
  const burst = useSharedValue(0);
  const punch = useSharedValue(0.3);
  // Drives the text's own fade in/out, independent of `punch`'s scale bounce — so it
  // actually disappears before the component unmounts instead of sitting there fully
  // opaque (and looking stuck) once the rest of the burst has already faded out.
  const contentOpacity = useSharedValue(0);
  const gainLift = useSharedValue(1);

  useEffect(() => {
    glow.value = withSequence(
      withTiming(1, { duration: 160, easing: Easing.out(Easing.quad) }),
      withDelay(480, withTiming(0, { duration: 520, easing: Easing.in(Easing.quad) })),
    );
    burst.value = withTiming(1, { duration: 780, easing: Easing.out(Easing.cubic) });
    punch.value = withSequence(
      withTiming(1.3, { duration: 220, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: 160 }),
      withDelay(450, withTiming(0.85, { duration: 350, easing: Easing.in(Easing.quad) })),
    );
    contentOpacity.value = withSequence(
      withTiming(1, { duration: 160, easing: Easing.out(Easing.quad) }),
      withDelay(740, withTiming(0, { duration: 350, easing: Easing.in(Easing.quad) })),
    );
    gainLift.value = withDelay(260, withSequence(withTiming(0, { duration: 220, easing: Easing.out(Easing.quad) })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value * 0.9, transform: [{ scale: 0.6 + glow.value * 0.6 }] }));
  const contentStyle = useAnimatedStyle(() => ({ opacity: contentOpacity.value, transform: [{ scale: punch.value }] }));
  const gainStyle = useAnimatedStyle(() => ({
    opacity: 1 - gainLift.value,
    transform: [{ translateY: gainLift.value * 10 }, { scale: 0.85 + (1 - gainLift.value) * 0.15 }],
  }));

  return (
    <View style={styles.wrap} pointerEvents="none">
      <View style={styles.stage}>
        <Animated.View style={[styles.glow, glowStyle]}>
          <Svg width={GLOW_SIZE} height={GLOW_SIZE}>
            <Defs>
              <RadialGradient id="level-up-glow" cx="50%" cy="50%" rx="50%" ry="50%">
                <Stop offset={0} stopColor="#fffbe8" stopOpacity={1} />
                <Stop offset={0.35} stopColor="#ffe9a0" stopOpacity={0.9} />
                <Stop offset={0.7} stopColor="#ffc93a" stopOpacity={0.4} />
                <Stop offset={1} stopColor="#ffc93a" stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Ellipse cx={GLOW_SIZE / 2} cy={GLOW_SIZE / 2} rx={GLOW_SIZE / 2} ry={GLOW_SIZE / 2} fill="url(#level-up-glow)" />
          </Svg>
        </Animated.View>
        {RAYS.map((angle) => (
          <Ray key={angle} angle={angle} burst={burst} />
        ))}
        <Ring delay={0} />
        <Ring delay={130} />
        {SPARKS.map((spark, index) => (
          <Spark key={index} {...spark} />
        ))}
        {STARS.map((star, index) => (
          <Twinkle key={index} {...star} />
        ))}
      </View>
      <Animated.View style={[styles.content, contentStyle]}>
        <StrokedText style={styles.label} strokeColor={colors.line} strokeWidth={1.5}>
          LEVEL UP
        </StrokedText>
        <StrokedText style={styles.level} strokeColor={colors.line} strokeWidth={2}>
          {`Lv.${formatGameNumber(level)}`}
        </StrokedText>
        <Animated.View style={[styles.gainBadge, gainStyle]}>
          <Image source={statIcons.attack} style={styles.gainIcon} />
          <Text style={styles.gainText}>{`+${attackGain}`}</Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

// One thin bar rotated to `angle`, growing out from the center and fading as it goes.
function Ray({ angle, burst }: { angle: number; burst: SharedValue<number> }) {
  const style = useAnimatedStyle(() => ({
    opacity: burst.value < 0.15 ? 0 : (1 - burst.value) * 0.9,
    transform: [{ rotate: `${angle}deg` }, { scaleX: 0.3 + burst.value * 0.9 }],
  }));
  return <Animated.View style={[styles.ray, style]} />;
}

function Ring({ delay }: { delay: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(delay, withTiming(1, { duration: 480, easing: Easing.out(Easing.cubic) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({
    opacity: t.value === 0 ? 0 : 1 - t.value,
    transform: [{ scale: 0.3 + t.value * 1.6 }],
  }));
  return <Animated.View style={[styles.ring, style]} />;
}

function Spark({ angle, distance, delay }: { angle: number; distance: number; delay: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(delay, withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const radians = (angle * Math.PI) / 180;
  const style = useAnimatedStyle(() => ({
    opacity: t.value === 0 ? 0 : 1 - t.value,
    transform: [
      { translateX: Math.cos(radians) * distance * t.value },
      { translateY: Math.sin(radians) * distance * t.value },
      { rotate: `${angle}deg` },
      { scaleX: 1 - t.value * 0.5 },
    ],
  }));
  return <Animated.View style={[styles.spark, style]} />;
}

function Twinkle({ angle, distance, delay, size }: { angle: number; distance: number; delay: number; size: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(
      delay,
      withSequence(withTiming(1, { duration: 180, easing: Easing.out(Easing.quad) }), withTiming(0, { duration: 240 })),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const radians = (angle * Math.PI) / 180;
  const left = CENTER + Math.cos(radians) * distance - size / 2;
  const top = CENTER + Math.sin(radians) * distance - size / 2;
  const style = useAnimatedStyle(() => ({
    opacity: t.value,
    transform: [{ scale: 0.3 + t.value * 0.9 }, { rotate: `${t.value * 90}deg` }],
  }));
  return <Animated.Image source={icons.star} style={[styles.twinkle, { left, top, width: size, height: size }, style]} />;
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", top: -44, left: 0, right: 0, alignItems: "center", zIndex: 9 },
  stage: { position: "absolute", top: 0, width: STAGE, height: STAGE, alignItems: "center", justifyContent: "center" },
  glow: {
    position: "absolute",
    width: GLOW_SIZE,
    height: GLOW_SIZE,
  },
  ray: {
    position: "absolute",
    width: 60,
    height: 5,
    borderRadius: 2,
    left: CENTER,
    top: CENTER - 2.5,
    backgroundColor: "#ffc93a",
    borderWidth: 0.5,
    borderColor: "#c97a00",
  },
  ring: {
    position: "absolute",
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 4,
    borderColor: "#ffc93a",
  },
  spark: { position: "absolute", width: 16, height: 4, borderRadius: 2, backgroundColor: "#ff9f1c", borderWidth: 0.5, borderColor: "#c4660c" },
  twinkle: { position: "absolute" },
  content: { marginTop: 34, alignItems: "center" },
  label: { color: colors.gold, fontSize: 10, fontWeight: "900", fontFamily: fonts.bold, letterSpacing: 2 },
  level: { marginTop: 1, color: "#fff4bd", fontSize: 24, fontWeight: "800", fontFamily: fonts.bold, letterSpacing: -0.5 },
  gainBadge: {
    marginTop: 3,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: "#4a3418d9",
  },
  gainIcon: { width: 12, height: 12 },
  gainText: { color: colors.gold, fontSize: 11, fontWeight: "900", fontFamily: fonts.bold },
});
