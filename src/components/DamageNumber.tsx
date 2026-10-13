import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming, Easing } from "react-native-reanimated";
import { colors, fonts } from "../theme";
import { StrokedText } from "./StrokedText";
import { formatGameNumber } from "../state/gameMath";

// Mount a fresh instance per hit via `key={tick}` on the call site — mirrors the web's
// `key={tick}` remount trick that restarted the CSS `damageUp` animation on every hit.
export function DamageNumber({ amount, critical }: { amount: number; critical: boolean }) {
  const progress = useSharedValue(0);
  // A little spread so a burst of taps doesn't stack every number in the exact same spot.
  const [jitter] = useState(() => ({ x: Math.round((Math.random() - 0.5) * 44), y: Math.round((Math.random() - 0.5) * 20) }));

  useEffect(() => {
    progress.value = withSequence(
      withTiming(0.25, { duration: 163, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: 488, easing: Easing.out(Easing.quad) }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => {
    const opacity = progress.value < 0.25 ? progress.value / 0.25 : 1 - (progress.value - 0.25) / 0.75;
    const translateY = progress.value < 0.25 ? 12 - progress.value / 0.25 * 12 : -((progress.value - 0.25) / 0.75) * 30;
    const scale = progress.value < 0.25 ? 0.7 + (progress.value / 0.25) * 0.45 : 1.15 - ((progress.value - 0.25) / 0.75) * 0.15;
    return { opacity, transform: [{ translateX: jitter.x }, { translateY: jitter.y + translateY }, { scale }] };
  });

  return (
    <Animated.View style={[styles.wrap, style]}>
      {critical && (
        <StrokedText style={styles.criticalLabel} strokeColor={colors.line} strokeWidth={1}>
          CRITICAL!
        </StrokedText>
      )}
      <StrokedText style={[styles.amount, critical && styles.amountCritical]} strokeColor={colors.cream} strokeWidth={1.5}>
        -{formatGameNumber(amount)}
      </StrokedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", alignItems: "center" },
  amount: {
    color: "#ae3828",
    fontSize: 21,
    fontWeight: "900",
    fontFamily: fonts.bold,
    fontStyle: "italic",
    letterSpacing: 0.3,
  },
  amountCritical: { color: "#db3b27", fontSize: 26 },
  criticalLabel: {
    color: "#f3b62f",
    fontSize: 9,
    fontWeight: "900",
    fontFamily: fonts.bold,
    fontStyle: "italic",
    letterSpacing: 1,
    marginBottom: 2,
  },
});
