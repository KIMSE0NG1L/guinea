import { useEffect } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { colors, fonts } from "../theme";
import { StrokedText } from "./StrokedText";
import { images } from "../assets";

// The very first thing the player sees on a cold launch — tap anywhere to continue into
// the game (App.tsx gates GameScreen behind this with local, non-persisted state, so it
// shows again on every real app launch, not just the first-ever one).
export function TitleScreen({ onStart }: { onStart: () => void }) {
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 650, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 650, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
    );
  }, [pulse]);
  const pulseStyle = useAnimatedStyle(() => ({ opacity: 0.55 + pulse.value * 0.45 }));

  return (
    // Same "dark shell + max-430-wide centered card" split GameScreen uses, so a wide
    // desktop web preview shows a phone-width column instead of the art stretched edge
    // to edge — on an actual phone this shell is invisible (the frame already fills it).
    <View style={styles.shell}>
      <Pressable style={styles.frame} onPress={onStart} accessibilityRole="button" accessibilityLabel="터치하여 시작">
        <Image source={images.titleScreen} style={[StyleSheet.absoluteFill, styles.background]} resizeMode="cover" />
        <View style={styles.titleWrap} pointerEvents="none">
          <StrokedText style={styles.title} strokeColor={colors.line} strokeWidth={3}>
            기니 키우기
          </StrokedText>
        </View>
        <Animated.View style={[styles.startWrap, pulseStyle]} pointerEvents="none">
          <StrokedText style={styles.start} strokeColor={colors.line} strokeWidth={2}>
            터치하여 시작
          </StrokedText>
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: colors.appBackground },
  frame: { flex: 1, maxWidth: 430, width: "100%", alignSelf: "center", overflow: "hidden" },
  background: { width: "100%", height: "100%" },
  titleWrap: { position: "absolute", top: "7%", width: "100%", alignItems: "center" },
  title: { fontSize: 40, fontWeight: "900", fontFamily: fonts.bold, color: colors.cream, letterSpacing: 1 },
  startWrap: { position: "absolute", bottom: "8%", width: "100%", alignItems: "center" },
  start: { fontSize: 18, fontWeight: "800", fontFamily: fonts.bold, color: colors.cream },
});
