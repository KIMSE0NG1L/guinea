import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Defs, LinearGradient as SvgGradient, Path, Stop } from "react-native-svg";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming } from "react-native-reanimated";

// Timeline (ms) shared with PlayerFighter's teleport so the two stay in step:
// vanish in smoke → reappear at the enemy → slash → hold → vanish → back home.
export const EXECUTE_TIMING = {
  vanish: 50,
  arrive: 90,
  leave: 450,
  home: 500,
};

export type Point = { left: number; bottom: number };

// Mount with a fresh key per execute; everything ends fully transparent, so it can just
// stay mounted until the next one replaces it.
// `home` / `arrival` are where the guinea pig vanishes and reappears; `enemy` is the cut.
export function ExecuteEffect({ home, arrival, enemy }: { home: Point; arrival: Point; enemy: Point }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Flash color="#000000" peak={0.35} delay={0} rise={40} fall={300} />
      <Dash left={home.left} right={arrival.left} bottom={home.bottom} />
      <SmokePuff at={home} delay={0} />
      <SmokePuff at={arrival} delay={EXECUTE_TIMING.vanish} />
      {/* An uneven X: a long downward stroke, then a shorter one drawn back the other way. */}
      <Slash at={enemy} angle={-26} length={190} offset={{ x: -4, y: 6 }} delay={EXECUTE_TIMING.arrive} />
      <Slash at={enemy} angle={180 + 44} length={150} offset={{ x: 6, y: -4 }} delay={EXECUTE_TIMING.arrive + 70} />
      <Sparks at={enemy} delay={EXECUTE_TIMING.arrive + 40} />
      <Flash color="#d3121c" peak={0.55} delay={EXECUTE_TIMING.arrive + 20} rise={40} fall={280} />
      <SmokePuff at={arrival} delay={EXECUTE_TIMING.leave} />
      <SmokePuff at={home} delay={EXECUTE_TIMING.home} />
    </View>
  );
}

export function Flash({ color, peak, delay, rise, fall }: { color: string; peak: number; delay: number; rise: number; fall: number }) {
  const opacity = useSharedValue(0);
  useEffect(() => {
    opacity.value = withDelay(delay, withSequence(withTiming(peak, { duration: rise }), withTiming(0, { duration: fall })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: color }, style]} />;
}

// Three grey puffs bursting out and fading — the ninja vanish/appear.
export function SmokePuff({ at, delay }: { at: Point; delay: number }) {
  return (
    <>
      {[
        { dx: 0, dy: 0, size: 46 },
        { dx: -20, dy: -8, size: 30 },
        { dx: 20, dy: 6, size: 34 },
      ].map((puff, index) => (
        <Puff key={index} left={at.left + puff.dx} bottom={at.bottom + puff.dy} size={puff.size} delay={delay + index * 25} />
      ))}
    </>
  );
}

function Puff({ left, bottom, size, delay }: { left: number; bottom: number; size: number; delay: number }) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withDelay(delay, withTiming(1, { duration: 360, easing: Easing.out(Easing.quad) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({
    opacity: progress.value === 0 ? 0 : 0.85 * (1 - progress.value),
    transform: [{ scale: 0.3 + progress.value * 1.1 }, { translateY: -progress.value * 10 }],
  }));
  return (
    <Animated.View
      style={[
        styles.puff,
        { left: left - size / 2, bottom: bottom - size / 2, width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
    />
  );
}

// A speed line along the teleport path, flashing once as the guinea pig crosses it.
function Dash({ left, right, bottom }: { left: number; right: number; bottom: number }) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withDelay(
      EXECUTE_TIMING.vanish - 10,
      withSequence(withTiming(1, { duration: 60 }), withTiming(2, { duration: 200 })),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({
    opacity: progress.value <= 1 ? progress.value : 2 - progress.value,
    transform: [{ scaleY: progress.value <= 1 ? 1 : 2 - progress.value }],
  }));
  return <Animated.View style={[styles.dash, { left, width: Math.max(0, right - left), bottom }, style]} />;
}

// One curved, tapered blade stroke: a red crescent with a white-hot edge. It's revealed
// along its own axis (a clip that widens), so it reads as being drawn by the blade
// rather than popping in; then it thins out and fades.
function Slash({
  at,
  angle,
  length,
  offset,
  delay,
}: {
  at: Point;
  angle: number;
  length: number;
  offset: { x: number; y: number };
  delay: number;
}) {
  const draw = useSharedValue(0);
  const fade = useSharedValue(0);
  useEffect(() => {
    draw.value = withDelay(delay, withTiming(1, { duration: 90, easing: Easing.out(Easing.cubic) }));
    fade.value = withDelay(delay + 150, withTiming(1, { duration: 260, easing: Easing.in(Easing.quad) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const outerStyle = useAnimatedStyle(() => ({
    opacity: draw.value === 0 ? 0 : 1 - fade.value,
    transform: [{ rotate: `${angle}deg` }, { scaleY: 1 - fade.value * 0.85 }],
  }));
  const clipStyle = useAnimatedStyle(() => ({ width: length * draw.value }));
  const h = SLASH_THICKNESS;
  // Crescent: thick in the middle, needle-sharp at both tips, bowed slightly upward.
  const outer = `M 0 ${h * 0.55} Q ${length / 2} ${-h * 0.35} ${length} ${h * 0.45} Q ${length / 2} ${h * 1.05} 0 ${h * 0.55} Z`;
  const core = `M ${length * 0.06} ${h * 0.5} Q ${length / 2} ${h * 0.05} ${length * 0.94} ${h * 0.45} Q ${length / 2} ${h * 0.6} ${length * 0.06} ${h * 0.5} Z`;
  return (
    <Animated.View
      style={[
        { position: "absolute", width: length, height: h, left: at.left - length / 2 + offset.x, bottom: at.bottom - h / 2 + offset.y },
        outerStyle,
      ]}
    >
      <Animated.View style={[{ height: h, overflow: "hidden" }, clipStyle]}>
        <Svg width={length} height={h}>
          <Defs>
            <SvgGradient id="blade" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="#7a0008" stopOpacity="0" />
              <Stop offset="0.35" stopColor="#e3141e" />
              <Stop offset="1" stopColor="#ff5a3a" />
            </SvgGradient>
          </Defs>
          <Path d={outer} fill="url(#blade)" />
          <Path d={core} fill="#fff7ec" />
        </Svg>
      </Animated.View>
    </Animated.View>
  );
}

// Hot sparks flying out from where the blades cross.
const SPARKS = [
  { angle: -70, distance: 58, length: 16 },
  { angle: -20, distance: 66, length: 20 },
  { angle: 15, distance: 52, length: 14 },
  { angle: 60, distance: 60, length: 18 },
  { angle: 110, distance: 56, length: 15 },
  { angle: 155, distance: 64, length: 19 },
  { angle: 200, distance: 50, length: 13 },
  { angle: 245, distance: 62, length: 17 },
];

export function Sparks({ at, delay, color = "#ffe08a" }: { at: Point; delay: number; color?: string }) {
  return (
    <>
      {SPARKS.map((spark, index) => (
        <Spark key={index} at={at} delay={delay + (index % 3) * 15} color={color} {...spark} />
      ))}
    </>
  );
}

function Spark({
  at,
  delay,
  color,
  angle,
  distance,
  length,
}: {
  at: Point;
  delay: number;
  color: string;
  angle: number;
  distance: number;
  length: number;
}) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withDelay(delay, withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const radians = (angle * Math.PI) / 180;
  const style = useAnimatedStyle(() => ({
    opacity: progress.value === 0 ? 0 : 1 - progress.value,
    transform: [
      { translateX: Math.cos(radians) * distance * progress.value },
      { translateY: Math.sin(radians) * distance * progress.value },
      { rotate: `${angle}deg` },
      { scaleX: 1 - progress.value * 0.6 },
    ],
  }));
  return <Animated.View style={[styles.spark, { width: length, left: at.left - length / 2, bottom: at.bottom - 1.5, backgroundColor: color }, style]} />;
}

const SLASH_THICKNESS = 14;

const styles = StyleSheet.create({
  puff: { position: "absolute", backgroundColor: "#d9d4ca", borderWidth: 2, borderColor: "#8f877a" },
  dash: { position: "absolute", height: 3, borderRadius: 2, backgroundColor: "#fff6e0" },
  spark: { position: "absolute", height: 3, borderRadius: 2 },
});
