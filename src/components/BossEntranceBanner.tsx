import { useEffect } from "react";
import { StyleSheet, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming, Easing } from "react-native-reanimated";
import { colors, fonts } from "../theme";

// Same visual language as StageAdvanceBanner (radial-ish flash + rings), red-themed for a
// boss instead of stage-clear gold. Mount fresh via `key` at the call site so it restarts
// every time a new boss spawns.
export function BossEntranceBanner({ bossName }: { bossName: string }) {
  const reveal = useSharedValue(0);
  const ringA = useSharedValue(0);
  const ringB = useSharedValue(0);
  const punch = useSharedValue(0.6);

  useEffect(() => {
    reveal.value = withSequence(
      withTiming(1, { duration: 220, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: 650 }),
      withTiming(0, { duration: 420, easing: Easing.in(Easing.quad) }),
    );
    ringA.value = withTiming(1, { duration: 760, easing: Easing.out(Easing.quad) });
    ringB.value = withSequence(withTiming(0, { duration: 60 }), withTiming(1, { duration: 760, easing: Easing.out(Easing.quad) }));
    punch.value = withSequence(withTiming(1.12, { duration: 180, easing: Easing.out(Easing.quad) }), withTiming(1, { duration: 180 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const revealStyle = useAnimatedStyle(() => ({ opacity: reveal.value }));
  const ringAStyle = useAnimatedStyle(() => ({
    opacity: ringA.value < 1 ? 1 - Math.abs(ringA.value - 0.35) : 0,
    transform: [{ scale: 0.35 + ringA.value * 0.9 }, { rotate: `${24 - ringA.value * 38}deg` }],
  }));
  const ringBStyle = useAnimatedStyle(() => ({
    opacity: ringB.value < 1 ? 1 - Math.abs(ringB.value - 0.35) : 0,
    transform: [{ scale: 0.35 + ringB.value * 0.9 }, { rotate: `${24 - ringB.value * 38}deg` }],
  }));
  const punchStyle = useAnimatedStyle(() => ({ transform: [{ scale: punch.value }] }));

  return (
    <Animated.View style={[styles.overlay, revealStyle]} pointerEvents="none">
      <LinearGradient
        colors={["#c8553dcc", "#3d2a1dd9", "#1c1613eb"]}
        locations={[0, 0.58, 1]}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View style={[styles.ring, styles.ringDashed, ringAStyle]} />
      <Animated.View style={[styles.ring, styles.ringSolid, ringBStyle]} />
      <Animated.View style={[styles.content, punchStyle]}>
        <Text style={styles.badge}>BOSS</Text>
        <Text style={styles.name}>{bossName}</Text>
        <Text style={styles.sub}>긴장해, 전력으로 간다!</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFill, zIndex: 8, alignItems: "center", justifyContent: "center" },
  ring: { position: "absolute", borderRadius: 999 },
  ringDashed: { width: 210, height: 210, borderWidth: 2, borderColor: "#f3a993", borderStyle: "dashed" },
  ringSolid: { width: 155, height: 155, borderWidth: 2, borderColor: "#ffd4bd88" },
  content: { alignItems: "center" },
  badge: {
    color: colors.cream,
    backgroundColor: colors.red,
    borderWidth: 2,
    borderColor: colors.line,
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 11,
    fontSize: 10,
    fontWeight: "900",
    fontFamily: fonts.bold,
    letterSpacing: 3,
  },
  name: { marginTop: 7, color: "#ffe3d4", fontSize: 24, fontWeight: "800", fontFamily: fonts.bold, letterSpacing: -1 },
  sub: {
    marginTop: 7,
    color: colors.cream,
    backgroundColor: "#382d25b8",
    borderRadius: 5,
    paddingVertical: 3,
    paddingHorizontal: 7,
    fontSize: 9,
    fontWeight: "900",
    fontFamily: fonts.bold,
  },
});
