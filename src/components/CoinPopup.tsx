import { useEffect } from "react";
import { Image, StyleSheet, Text } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming, Easing } from "react-native-reanimated";
import { formatGameNumber } from "../state/gameMath";
import { fonts } from "../theme";
import { uiImages } from "../assets";

// Mount a fresh instance per kill via `key={`coin-${enemyId}`}` on the call site — mirrors the
// web's remount trick that restarted the CSS `coinUp` animation (.8s, with a .15s delay).
export function CoinPopup({ amount }: { amount: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      150,
      withSequence(
        withTiming(0.3, { duration: 240, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 560, easing: Easing.out(Easing.quad) }),
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => {
    const opacity = progress.value < 0.3 ? progress.value / 0.3 : 1 - (progress.value - 0.3) / 0.7;
    const translateY = progress.value < 0.3 ? 8 - (progress.value / 0.3) * 8 : -((progress.value - 0.3) / 0.7) * 17;
    return { opacity, transform: [{ translateY }] };
  });

  return (
    <Animated.View style={[styles.wrap, style]}>
      <Image source={uiImages.coin} style={styles.coin} />
      <Text style={styles.text}>+{formatGameNumber(amount)}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", top: 26, flexDirection: "row", alignItems: "center", gap: 3 },
  coin: { width: 14, height: 14 },
  text: { color: "#7a5317", fontSize: 11, fontWeight: "900", fontFamily: fonts.bold },
});
