import { useEffect } from "react";
import { StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import { colors } from "../theme";

export const ARROW_W = 38;
export const ARROW_H = 44;

type Direction = "down" | "up" | "right";
const ROTATION: Record<Direction, string> = { down: "0deg", up: "180deg", right: "-90deg" };

// The tutorial's bouncing gold arrow, pointing the way it's told at what to press.
export function GuideArrow({ direction = "down", style }: { direction?: Direction; style?: StyleProp<ViewStyle> }) {
  const bounce = useSharedValue(0);
  useEffect(() => {
    bounce.value = withRepeat(
      withSequence(withTiming(1, { duration: 380, easing: Easing.out(Easing.quad) }), withTiming(0, { duration: 380, easing: Easing.in(Easing.quad) })),
      -1,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const animated = useAnimatedStyle(() => {
    const swing = bounce.value * 10;
    return {
      transform: [
        direction === "right" ? { translateX: -swing } : { translateY: direction === "up" ? swing : -swing },
        { rotate: ROTATION[direction] },
      ],
    };
  });
  return (
    <Animated.View pointerEvents="none" style={[styles.arrow, style, animated]}>
      <Svg width={ARROW_W} height={ARROW_H} viewBox="0 0 38 44">
        <Path d="M12 3 H26 V22 H35 L19 41 L3 22 H12 Z" fill="#ffd34d" stroke={colors.line} strokeWidth={3} strokeLinejoin="round" />
        <Path d="M15 6 H19 V24 H15 Z" fill="#fff3b8" opacity={0.8} />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  arrow: { position: "absolute", width: ARROW_W, height: ARROW_H, filter: "drop-shadow(0px 3px 2px rgba(10, 6, 3, 0.5))" },
});
