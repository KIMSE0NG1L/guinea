import { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming } from "react-native-reanimated";
import { fonts } from "../theme";
import { StrokedText } from "./StrokedText";

// A skill's name shouted across the top of the battle scene: slams in oversized, holds
// for `holdMs`, then swells slightly as it fades.
export function SkillCallout({
  text,
  color,
  strokeColor,
  holdMs,
}: {
  text: string;
  color: string;
  strokeColor: string;
  holdMs: number;
}) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withDelay(
      40,
      withSequence(
        withTiming(1, { duration: 120, easing: Easing.out(Easing.back(2.4)) }),
        withDelay(holdMs, withTiming(2, { duration: 220 })),
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({
    opacity: progress.value === 0 ? 0 : progress.value <= 1 ? 1 : 2 - progress.value,
    transform: [
      { scale: progress.value <= 1 ? 1.8 - progress.value * 0.8 : 1 + (progress.value - 1) * 0.15 },
      { rotate: "-4deg" },
    ],
  }));
  return (
    <Animated.View style={[styles.callout, style]} pointerEvents="none">
      <StrokedText style={[styles.text, { color }]} strokeColor={strokeColor} strokeWidth={2}>
        {text}
      </StrokedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  callout: { position: "absolute", top: 58, left: 0, right: 0, alignItems: "center" },
  text: { fontSize: 26, fontWeight: "900", fontFamily: fonts.bold },
});
