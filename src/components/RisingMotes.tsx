import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming } from "react-native-reanimated";

// Little lights drifting up from the bottom of a scene, each on its own size, speed, sway
// and start — fading in low and out before the top, then looping from the bottom.
// `fireflies`: bigger, slower, wider-wandering and blinking, staying in the lower half.
// `opacity`: overall strength, so a busy screen (the battle) can keep them faint.
// `fall`: drift down from the top instead (snow, petals, leaves). `scale`: mote size factor.
export function RisingMotes({
  count,
  colors,
  fireflies = false,
  opacity = 0.8,
  fall = false,
  scale = 1,
}: {
  count: number;
  colors: [string, string];
  fireflies?: boolean;
  opacity?: number;
  fall?: boolean;
  scale?: number;
}) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
      onLayout={(event) => setSize({ width: event.nativeEvent.layout.width, height: event.nativeEvent.layout.height })}
    >
      {size.height > 0 &&
        Array.from({ length: count }, (_, index) => (
          <Mote key={index} width={size.width} height={size.height} colors={colors} firefly={fireflies} strength={opacity} fall={fall} scale={scale} />
        ))}
    </View>
  );
}

function Mote({
  width,
  height,
  colors,
  firefly,
  strength,
  fall,
  scale,
}: {
  width: number;
  height: number;
  colors: [string, string];
  firefly: boolean;
  strength: number;
  fall: boolean;
  scale: number;
}) {
  // Fixed per mote for this mount, so re-renders don't reshuffle the drift.
  const [mote] = useState(() => ({
    x: Math.random() * width,
    size: (firefly ? 3.5 + Math.random() * 3 : 2 + Math.random() * 3.5) * scale,
    duration: firefly ? 9000 + Math.random() * 7000 : 6000 + Math.random() * 6000,
    delay: Math.random() * 8000,
    sway: firefly ? 24 + Math.random() * 36 : 10 + Math.random() * 22,
    // Falling ones cross the whole height; rising ones fade out somewhere on the way up.
    rise: height * (fall ? 0.85 + Math.random() * 0.25 : firefly ? 0.2 + Math.random() * 0.3 : 0.55 + Math.random() * 0.4),
    color: colors[Math.random() < 0.7 ? 0 : 1],
    blink: firefly ? 2 + Math.floor(Math.random() * 3) : 0,
  }));
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(mote.delay, withRepeat(withTiming(1, { duration: mote.duration, easing: Easing.linear }), -1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({
    // In over the first 15%, out over the last 30%; fireflies pulse a few times on the way.
    opacity:
      t.value === 0
        ? 0
        : Math.min(1, t.value / 0.15) *
          Math.min(1, (1 - t.value) / 0.3) *
          (mote.blink > 0 ? 0.35 + 0.65 * Math.abs(Math.sin(t.value * Math.PI * mote.blink)) : 1) *
          strength,
    transform: [{ translateY: (fall ? 1 : -1) * t.value * mote.rise }, { translateX: Math.sin(t.value * Math.PI * 2) * mote.sway }],
  }));
  return (
    <Animated.View
      style={[
        styles.mote,
        fall ? styles.fromTop : styles.fromBottom,
        { left: mote.x, width: mote.size, height: mote.size, borderRadius: mote.size, backgroundColor: mote.color, shadowColor: mote.color },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  mote: { position: "absolute", shadowOpacity: 0.9, shadowRadius: 4, shadowOffset: { width: 0, height: 0 } },
  fromBottom: { bottom: -6 },
  fromTop: { top: -6 },
});

// Named looks for a scene's ambience (the battle picks one per stage — see BattleScene).
export type MotePreset = "dust" | "spores" | "sand" | "embers" | "bubbles" | "snow" | "petals" | "leaves" | "fireflies" | "magic" | "honey";
export const MOTE_PRESETS: Record<MotePreset, { count: number; colors: [string, string]; opacity: number; fall?: boolean; fireflies?: boolean; scale?: number }> = {
  dust: { count: 10, colors: ["#fff1c9", "#ffd27a"], opacity: 0.5 },
  spores: { count: 12, colors: ["#e6f7b8", "#b8e07a"], opacity: 0.55 },
  sand: { count: 12, colors: ["#f6e2b0", "#e8c27a"], opacity: 0.5, scale: 0.8 },
  embers: { count: 14, colors: ["#ffb060", "#ff6a3a"], opacity: 0.75 },
  bubbles: { count: 10, colors: ["#dff4ff", "#9fd8ff"], opacity: 0.55, scale: 1.6 },
  snow: { count: 16, colors: ["#ffffff", "#e6f2ff"], opacity: 0.8, fall: true, scale: 1.2 },
  petals: { count: 12, colors: ["#ffd0e2", "#ff9ac0"], opacity: 0.75, fall: true, scale: 1.4 },
  leaves: { count: 10, colors: ["#b8e07a", "#7cc24a"], opacity: 0.65, fall: true, scale: 1.4 },
  fireflies: { count: 8, colors: ["#f4ff9a", "#c8ff6a"], opacity: 0.75, fireflies: true },
  magic: { count: 12, colors: ["#e2c4ff", "#b07aff"], opacity: 0.65 },
  honey: { count: 12, colors: ["#ffe27a", "#ffb020"], opacity: 0.6 },
};
