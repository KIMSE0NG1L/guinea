import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming, Easing } from "react-native-reanimated";
import { colors, fonts } from "../theme";

// Shown when the boss fight's timer runs out — mirrors StageAdvanceBanner's reveal timing
// but in a warning red tone, and mount fresh via `key={bossFledKey}` at the call site.
export function BossFleeBanner() {
  const reveal = useSharedValue(0);

  useEffect(() => {
    reveal.value = withSequence(
      withTiming(1, { duration: 270, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: 750 }),
      withTiming(0, { duration: 480, easing: Easing.in(Easing.quad) }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const revealStyle = useAnimatedStyle(() => ({ opacity: reveal.value }));

  return (
    <Animated.View style={[styles.overlay, revealStyle]} pointerEvents="none">
      <LinearGradient colors={["#5c1f1fcc", "#3d1414d9", "#200b0beb"]} locations={[0, 0.58, 1]} style={StyleSheet.absoluteFill} />
      <View style={styles.content}>
        <Text style={styles.badge}>TIME OVER</Text>
        <Text style={styles.title}>보스가 도망쳤다!</Text>
        <Text style={styles.sub}>몹을 처음부터 다시 잡아야 해요</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFill, zIndex: 8, alignItems: "center", justifyContent: "center" },
  content: { alignItems: "center" },
  badge: {
    color: colors.cream,
    backgroundColor: "#a33030",
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
  title: { marginTop: 7, color: "#ffd9d9", fontSize: 26, fontWeight: "800", fontFamily: fonts.bold, letterSpacing: -1 },
  sub: {
    marginTop: 7,
    color: colors.cream,
    backgroundColor: "#2a1414b8",
    borderRadius: 5,
    paddingVertical: 3,
    paddingHorizontal: 7,
    fontSize: 9,
    fontWeight: "900",
    fontFamily: fonts.bold,
  },
});
