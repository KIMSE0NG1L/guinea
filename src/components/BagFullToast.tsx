import { useEffect } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { colors, fonts } from "../theme";
import { icons } from "../assets";

const SHOW_MS = 2600;

// Drops in under the header when something couldn't go into a full bag. Tapping it opens
// the bag; it slides away on its own otherwise. Remount (key) per notice to replay.
export function BagFullToast({ onOpenBag, onDone }: { onOpenBag: () => void; onDone: () => void }) {
  const shown = useSharedValue(0);
  useEffect(() => {
    shown.value = withTiming(1, { duration: 220, easing: Easing.out(Easing.back(1.6)) });
    const timer = setTimeout(onDone, SHOW_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({
    opacity: shown.value,
    transform: [{ translateY: (1 - shown.value) * -16 }],
  }));
  return (
    <Animated.View style={[styles.wrap, style]} pointerEvents="box-none">
      <Pressable
        onPress={() => {
          onOpenBag();
          onDone();
        }}
        accessibilityRole="button"
        accessibilityLabel="가방이 꽉 찼어요. 가방 열기"
        style={({ pressed }) => [styles.toast, pressed && styles.pressed]}
      >
        <Image source={icons.backpackTrim} style={styles.icon} resizeMode="contain" />
        <View>
          <Text style={styles.title}>가방이 꽉 찼어요!</Text>
          <Text style={styles.sub}>눌러서 가방 정리하기</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", top: 66, left: 0, right: 0, alignItems: "center", zIndex: 40 },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingLeft: 10,
    paddingRight: 16,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: "#14100ceb",
    borderWidth: 2,
    borderColor: colors.red,
  },
  pressed: { transform: [{ scale: 0.97 }] },
  icon: { width: 30, height: 30 },
  title: { fontSize: 13, fontWeight: "900", fontFamily: fonts.bold, color: "#ffd0c2" },
  sub: { marginTop: 1, fontSize: 9, fontWeight: "800", fontFamily: fonts.bold, color: colors.cream },
});
