import { useEffect } from "react";
import { Image, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { uiImages } from "../assets";

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
      {/* The art points right; turned a quarter so "down" is the base the rotation above starts from. */}
      <Image source={uiImages.guideArrow} style={styles.image} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  arrow: { position: "absolute", width: ARROW_W, height: ARROW_H, alignItems: "center", justifyContent: "center", filter: "drop-shadow(0px 3px 2px rgba(10, 6, 3, 0.5))" },
  // 256x201 art, as long as the box is tall once turned to point down.
  image: { width: ARROW_H, height: ARROW_H * (201 / 256), resizeMode: "contain", transform: [{ rotate: "90deg" }] },
});
