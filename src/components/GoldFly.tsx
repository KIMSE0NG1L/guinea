import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming } from "react-native-reanimated";
import { uiImages } from "../assets";

const SIZE = 16;

// One coin popping out of the kill point and arcing up and off the top of the scene —
// toward the gold counter in the header above. Mount a fresh instance per coin (keyed by
// its id); it plays once and the parent removes it afterwards.
export function GoldFly({ delay, from }: { delay: number; from: { right: number; bottom: number } }) {
  const [driftX] = useState(() => -18 + Math.random() * 36);
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const quadOut = Easing.out(Easing.quad);
    const quadIn = Easing.in(Easing.quad);
    opacity.value = withDelay(delay, withSequence(
      withTiming(1, { duration: 90 }),
      withDelay(400, withTiming(0, { duration: 180 })),
    ));
    scale.value = withDelay(delay, withSequence(
      withTiming(1.2, { duration: 140, easing: quadOut }),
      withTiming(0.7, { duration: 460, easing: quadIn }),
    ));
    x.value = withDelay(delay, withTiming(driftX, { duration: 640, easing: Easing.inOut(Easing.quad) }));
    y.value = withDelay(delay, withSequence(
      withTiming(-18, { duration: 140, easing: quadOut }),
      withTiming(-190, { duration: 500, easing: quadIn }),
    ));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: x.value }, { translateY: y.value }, { scale: scale.value }],
  }));

  return (
    <Animated.Image
      source={uiImages.coin}
      style={[styles.coin, { right: from.right - SIZE / 2, bottom: from.bottom - SIZE / 2 }, style]}
    />
  );
}

const styles = StyleSheet.create({
  coin: { position: "absolute", width: SIZE, height: SIZE },
});
