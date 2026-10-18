import { useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import Svg, { Defs, Ellipse, RadialGradient, Stop } from "react-native-svg";
import { colors, fonts } from "../theme";
import { chef, icons } from "../assets";
import { playSfx } from "../sound";
import { StrokedText } from "./StrokedText";

const STAGE = 260; // square the burst radiates within, centered on the chef
const CENTER = STAGE / 2;
const SHOW_MS = 1900; // closes on its own after this; a tap closes it sooner

const RAY_COUNT = 14;
const RAYS = Array.from({ length: RAY_COUNT }, (_, i) => (360 / RAY_COUNT) * i);

const SPARKS = [
  { angle: -80, distance: 104, delay: 60 },
  { angle: -30, distance: 116, delay: 120 },
  { angle: 20, distance: 100, delay: 80 },
  { angle: 70, distance: 110, delay: 140 },
  { angle: 130, distance: 104, delay: 90 },
  { angle: 180, distance: 112, delay: 130 },
  { angle: -135, distance: 108, delay: 100 },
];

const STARS = [
  { angle: -60, distance: 110, delay: 240, size: 20 },
  { angle: 10, distance: 120, delay: 320, size: 16 },
  { angle: 100, distance: 104, delay: 280, size: 18 },
  { angle: -160, distance: 116, delay: 360, size: 15 },
  { angle: 160, distance: 96, delay: 420, size: 14 },
];

// "완성!" — the head chef bounces in cheering while the finished dish floats up over their
// head, inside the same glow + sunburst + sparks + stars recipe LevelUpBurst uses. Mount it
// fresh (via `key`) for every dish collected.
// `great`: a great-success double — the title reads "대성공!" and the name gets "×2".
export function CookCompleteBurst({
  dishName,
  dishImage,
  great = false,
  onDone,
}: {
  dishName: string;
  dishImage: number;
  great?: boolean;
  onDone: () => void;
}) {
  const glow = useSharedValue(0);
  const burst = useSharedValue(0);
  const chefPop = useSharedValue(0.3);
  const dishRise = useSharedValue(0);
  const bob = useSharedValue(0);
  const fade = useSharedValue(0);

  useEffect(() => {
    playSfx("levelup");
    fade.value = withSequence(
      withTiming(1, { duration: 140 }),
      withDelay(SHOW_MS - 420, withTiming(0, { duration: 280, easing: Easing.in(Easing.quad) })),
    );
    glow.value = withSequence(
      withTiming(1, { duration: 200, easing: Easing.out(Easing.quad) }),
      withDelay(900, withTiming(0.35, { duration: 500 })),
    );
    burst.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) });
    chefPop.value = withSequence(
      withTiming(1.15, { duration: 240, easing: Easing.out(Easing.back(2)) }),
      withTiming(1, { duration: 160 }),
    );
    dishRise.value = withDelay(180, withTiming(1, { duration: 420, easing: Easing.out(Easing.back(1.6)) }));
    bob.value = withDelay(600, withRepeat(withTiming(1, { duration: 420, easing: Easing.inOut(Easing.quad) }), -1, true));
    const timer = setTimeout(onDone, SHOW_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const wrapStyle = useAnimatedStyle(() => ({ opacity: fade.value }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value * 0.95, transform: [{ scale: 0.5 + glow.value * 0.6 }] }));
  const chefStyle = useAnimatedStyle(() => ({ transform: [{ scale: chefPop.value }] }));
  const dishStyle = useAnimatedStyle(() => ({
    opacity: dishRise.value,
    transform: [{ translateY: 30 - dishRise.value * 74 - bob.value * 6 }, { scale: 0.4 + dishRise.value * 0.6 }],
  }));
  const titleStyle = useAnimatedStyle(() => ({ transform: [{ scale: 0.6 + Math.min(1, burst.value * 2) * 0.4 }] }));

  return (
    <Animated.View style={[styles.backdrop, wrapStyle]}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onDone} accessibilityRole="button" accessibilityLabel="닫기" />
      <View style={styles.stage} pointerEvents="none">
        <Animated.View style={[styles.glow, glowStyle]}>
          <Svg width={STAGE} height={STAGE}>
            <Defs>
              <RadialGradient id="cook-complete-glow" cx="50%" cy="50%" rx="50%" ry="50%">
                <Stop offset={0} stopColor="#fffbe8" stopOpacity={1} />
                <Stop offset={0.35} stopColor="#ffe9a0" stopOpacity={0.9} />
                <Stop offset={0.7} stopColor="#ffc93a" stopOpacity={0.4} />
                <Stop offset={1} stopColor="#ffc93a" stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Ellipse cx={CENTER} cy={CENTER} rx={CENTER} ry={CENTER} fill="url(#cook-complete-glow)" />
          </Svg>
        </Animated.View>
        {RAYS.map((angle) => (
          <Ray key={angle} angle={angle} burst={burst} />
        ))}
        <Ring delay={0} />
        <Ring delay={160} />
        {SPARKS.map((spark, index) => (
          <Spark key={index} {...spark} />
        ))}
        {STARS.map((star, index) => (
          <Twinkle key={index} {...star} />
        ))}
        <Animated.Image source={chef.cheer} style={[styles.chef, chefStyle]} />
        <Animated.Image source={dishImage} style={[styles.dish, dishStyle]} />
      </View>
      <Animated.View style={[styles.copy, titleStyle]} pointerEvents="none">
        <StrokedText style={styles.title} strokeColor={colors.line} strokeWidth={2.5}>
          {great ? "대성공!" : "완성!"}
        </StrokedText>
        <StrokedText style={styles.name} strokeColor={colors.line} strokeWidth={1.5}>
          {great ? `${dishName} ×2` : dishName}
        </StrokedText>
      </Animated.View>
    </Animated.View>
  );
}

// One bar rotated to `angle`, growing out from the center and fading as it goes.
function Ray({ angle, burst }: { angle: number; burst: SharedValue<number> }) {
  const style = useAnimatedStyle(() => ({
    opacity: burst.value < 0.1 ? 0 : (1 - burst.value) * 0.9,
    transform: [{ rotate: `${angle}deg` }, { scaleX: 0.3 + burst.value * 0.9 }],
  }));
  return <Animated.View style={[styles.ray, style]} />;
}

function Ring({ delay }: { delay: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(delay, withTiming(1, { duration: 560, easing: Easing.out(Easing.cubic) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({
    opacity: t.value === 0 ? 0 : 1 - t.value,
    transform: [{ scale: 0.3 + t.value * 1.8 }],
  }));
  return <Animated.View style={[styles.ring, style]} />;
}

function Spark({ angle, distance, delay }: { angle: number; distance: number; delay: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(delay, withTiming(1, { duration: 480, easing: Easing.out(Easing.cubic) }));
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
      withSequence(withTiming(1, { duration: 200, easing: Easing.out(Easing.quad) }), withTiming(0, { duration: 300 })),
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
  backdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#263024b3",
    zIndex: 30,
  },
  stage: { width: STAGE, height: STAGE, alignItems: "center", justifyContent: "center" },
  glow: { position: "absolute", width: STAGE, height: STAGE },
  ray: {
    position: "absolute",
    width: 110,
    height: 7,
    borderRadius: 3,
    left: CENTER,
    top: CENTER - 3.5,
    backgroundColor: "#ffc93a",
    borderWidth: 0.5,
    borderColor: "#c97a00",
    transformOrigin: "left center",
  },
  ring: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 5,
    borderColor: "#ffc93a",
  },
  spark: { position: "absolute", width: 22, height: 5, borderRadius: 2.5, backgroundColor: "#ff9f1c", borderWidth: 0.5, borderColor: "#c4660c" },
  twinkle: { position: "absolute" },
  chef: { position: "absolute", width: 150, height: 150, top: CENTER - 50 },
  dish: { position: "absolute", width: 84, height: 84, top: CENTER - 92 },
  copy: { marginTop: -10, alignItems: "center" },
  title: { color: "#fff4bd", fontSize: 30, fontWeight: "800", fontFamily: fonts.bold, letterSpacing: -0.5 },
  name: { marginTop: 2, color: colors.gold, fontSize: 14, fontWeight: "900", fontFamily: fonts.bold },
});
