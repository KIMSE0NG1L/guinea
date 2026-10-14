import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming } from "react-native-reanimated";

const SIZE = 28;

// One dropped ingredient: pops out of the monster, falls and bounces on the ground like a
// coin, rests a beat, then flies into the bag button. Mount a fresh instance per drop
// (keyed by its id) — it plays once and the parent removes it afterwards.
export function DropItem({
  image,
  delay,
  from,
  groundDrop,
  to,
}: {
  image: number;
  delay: number;
  from: { right: number; bottom: number }; // where it pops out (centre, from the scene's bottom-right)
  groundDrop: number; // how far below `from` the ground is
  to: { dx: number; dy: number }; // offset from `from` to the bag button's centre
}) {
  // Spread a pile of drops sideways so they don't land on top of each other.
  const [spread] = useState(() => -36 + Math.random() * 44);
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const scale = useSharedValue(0.4);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const quadOut = Easing.out(Easing.quad);
    const quadIn = Easing.in(Easing.quad);
    opacity.value = withDelay(delay, withSequence(
      withTiming(1, { duration: 80 }),
      withDelay(1150, withTiming(0, { duration: 160 })),
    ));
    scale.value = withDelay(delay, withSequence(
      withTiming(1.1, { duration: 200, easing: quadOut }),
      withTiming(1, { duration: 120 }),
      withDelay(800, withTiming(0.55, { duration: 420, easing: quadIn })),
    ));
    x.value = withDelay(delay, withSequence(
      withTiming(spread, { duration: 520, easing: quadOut }),
      withDelay(400, withTiming(to.dx, { duration: 430, easing: Easing.inOut(Easing.quad) })),
    ));
    y.value = withDelay(delay, withSequence(
      withTiming(-42, { duration: 220, easing: quadOut }), // pop up
      withTiming(groundDrop, { duration: 300, easing: quadIn }), // fall
      withTiming(groundDrop - 10, { duration: 110, easing: quadOut }), // bounce
      withTiming(groundDrop, { duration: 110, easing: quadIn }),
      withDelay(180, withTiming(to.dy, { duration: 430, easing: Easing.inOut(Easing.quad) })), // into the bag
    ));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: x.value }, { translateY: y.value }, { scale: scale.value }],
  }));

  return (
    <Animated.Image
      source={image}
      style={[styles.item, { right: from.right - SIZE / 2, bottom: from.bottom - SIZE / 2 }, style]}
    />
  );
}

// How long a drop takes from popping out to reaching the bag (excluding its own delay).
export const DROP_ARRIVAL_MS = 1300;

const styles = StyleSheet.create({
  item: { position: "absolute", width: SIZE, height: SIZE },
});
