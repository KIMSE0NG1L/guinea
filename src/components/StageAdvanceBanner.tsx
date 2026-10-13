import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming, Easing } from "react-native-reanimated";
import { colors, fonts } from "../theme";

// Approximates the web's `radial-gradient(circle, #f2c44b88, #3d513ad9 58%, #263525eb)` as a
// 3-stop linear gradient (see plan: true radial has no core RN primitive, not worth
// react-native-svg for one ~1.5s flash). Mount fresh via `key={stageLabel}` at the call site —
// mirrors the web's `key={stageAdvance}` remount trick for the CSS `stageReveal` animation.
export function StageAdvanceBanner({ stageLabel }: { stageLabel: string }) {
  const reveal = useSharedValue(0);
  const ringA = useSharedValue(0);
  const ringB = useSharedValue(0);

  useEffect(() => {
    reveal.value = withSequence(
      withTiming(1, { duration: 270, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: 750 }),
      withTiming(0, { duration: 480, easing: Easing.in(Easing.quad) }),
    );
    ringA.value = withTiming(1, { duration: 880, easing: Easing.out(Easing.quad) });
    ringB.value = withSequence(withTiming(0, { duration: 60 }), withTiming(1, { duration: 880, easing: Easing.out(Easing.quad) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const revealStyle = useAnimatedStyle(() => ({ opacity: reveal.value }));
  const ringAStyle = useAnimatedStyle(() => ({
    opacity: ringA.value < 1 ? 1 - Math.abs(ringA.value - 0.35) : 0,
    transform: [{ scale: 0.35 + ringA.value * 0.85 }, { rotate: `${-24 + ringA.value * 38}deg` }],
  }));
  const ringBStyle = useAnimatedStyle(() => ({
    opacity: ringB.value < 1 ? 1 - Math.abs(ringB.value - 0.35) : 0,
    transform: [{ scale: 0.35 + ringB.value * 0.85 }, { rotate: `${-24 + ringB.value * 38}deg` }],
  }));

  return (
    <Animated.View style={[styles.overlay, revealStyle]} pointerEvents="none">
      <LinearGradient
        colors={["#f2c44bcc", "#3d513ad9", "#263525eb"]}
        locations={[0, 0.58, 1]}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View style={[styles.ring, styles.ringDashed, ringAStyle]} />
      <Animated.View style={[styles.ring, styles.ringSolid, ringBStyle]} />
      <View style={styles.content}>
        <Text style={styles.badge}>STAGE CLEAR</Text>
        <Text style={styles.stageLabel}>{stageLabel}</Text>
        <Text style={styles.sub}>새로운 숲 구역으로 전진!</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFill, zIndex: 8, alignItems: "center", justifyContent: "center" },
  ring: { position: "absolute", borderRadius: 999 },
  ringDashed: { width: 210, height: 210, borderWidth: 2, borderColor: "#f3d993", borderStyle: "dashed" },
  ringSolid: { width: 155, height: 155, borderWidth: 2, borderColor: "#fff4bd88" },
  content: { alignItems: "center" },
  badge: {
    color: colors.line,
    backgroundColor: colors.gold,
    borderWidth: 2,
    borderColor: colors.line,
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 9,
    fontSize: 9,
    fontWeight: "900",
    fontFamily: fonts.bold,
    letterSpacing: 2,
  },
  stageLabel: { marginTop: 7, color: "#fff4bd", fontSize: 28, fontWeight: "800", fontFamily: fonts.bold, letterSpacing: -1 },
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
