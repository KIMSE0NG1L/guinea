import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming, Easing } from "react-native-reanimated";
import { colors, fonts } from "../theme";

// A radial flash + popping level number over the player, mounted fresh via `key={level}`
// at the call site so it restarts on every level-up.
export function LevelUpBurst({ level, attackGain }: { level: number; attackGain: number }) {
  const flash = useSharedValue(0);
  const punch = useSharedValue(0.4);
  const spin = useSharedValue(-16);

  useEffect(() => {
    flash.value = withSequence(
      withTiming(1, { duration: 140, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: 650, easing: Easing.in(Easing.quad) }),
    );
    punch.value = withSequence(
      withTiming(1.2, { duration: 220, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: 160 }),
      withTiming(0.9, { duration: 260 }),
    );
    spin.value = withTiming(16, { duration: 800, easing: Easing.out(Easing.quad) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rayStyle = useAnimatedStyle(() => ({
    opacity: flash.value,
    transform: [{ scale: 0.4 + flash.value * 1.3 }, { rotate: `${spin.value}deg` }],
  }));
  const contentStyle = useAnimatedStyle(() => ({
    opacity: flash.value > 0 ? 1 : 0,
    transform: [{ scale: punch.value }],
  }));

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Animated.View style={[styles.ray, rayStyle]} />
      <Animated.View style={[styles.content, contentStyle]}>
        <Text style={styles.label}>LEVEL UP</Text>
        <Text style={styles.level}>Lv.{level}</Text>
        <Text style={styles.gain}>공격력 +{attackGain}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", top: -14, left: 0, right: 0, alignItems: "center", zIndex: 9 },
  ray: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: "#fff2b8",
    backgroundColor: "#f2c44b33",
  },
  content: { alignItems: "center" },
  label: { color: colors.gold, fontSize: 9, fontWeight: "900", fontFamily: fonts.bold, letterSpacing: 2 },
  level: { marginTop: 1, color: "#fff4bd", fontSize: 20, fontWeight: "800", fontFamily: fonts.bold, letterSpacing: -0.5 },
  gain: { marginTop: 1, color: colors.gold, fontSize: 10, fontWeight: "800", fontFamily: fonts.bold },
});
