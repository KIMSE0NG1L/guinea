import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming, Easing } from "react-native-reanimated";
import { colors, fonts } from "../theme";
import { shopKit } from "../assets";
import { NineSlice } from "./NineSlice";

const AUTO_HIDE_MS = 2600;
// Small cut of the same parchment speech-bubble art TutorialOverlay uses for 모험기니's
// dialogue, at a much smaller scale for a one-line monster quip.
const SCALE = 0.24;

// Pops up beside the enemy (to its left — `anchor` is computed by the caller so the gap
// scales with however big that enemy's sprite renders) when it spawns. Mounted fresh via
// `key={enemyId}` at the call site so it restarts per enemy; hides itself after a beat by
// calling `onClose` (same self-timing pattern as InfoBubble).
export function MonsterSpeechBubble({
  line,
  anchor,
  onClose,
}: {
  line: string;
  anchor: { right: number; bottom: number };
  onClose: () => void;
}) {
  const pop = useSharedValue(0);

  useEffect(() => {
    pop.value = withSequence(
      withTiming(1, { duration: 180, easing: Easing.out(Easing.back(1.6)) }),
      withTiming(1, { duration: AUTO_HIDE_MS - 420 }),
      withTiming(0, { duration: 180, easing: Easing.in(Easing.quad) }),
    );
    const timer = setTimeout(onClose, AUTO_HIDE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: pop.value,
    transform: [{ scale: 0.7 + pop.value * 0.3 }, { translateY: (1 - pop.value) * 6 }],
  }));

  return (
    <Animated.View
      style={[styles.wrap, { right: anchor.right, bottom: anchor.bottom }, style]}
      pointerEvents="none"
    >
      <View style={styles.bubble}>
        {/* The source art's tail is baked in at the bottom-left; flipped horizontally here
            so it hangs bottom-right instead, pointing at the enemy this bubble sits beside
            (to its left). */}
        <View style={styles.art}>
          <View style={styles.shadow}>
            <NineSlice slice={shopKit.bubble} scale={SCALE} tint="#140c06" />
          </View>
          <NineSlice slice={shopKit.bubble} scale={SCALE} />
        </View>
        <Text style={styles.line} numberOfLines={2}>{line}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Below 8 — StageAdvanceBanner/BossEntranceBanner's full-scene tint overlays both use
  // zIndex 8, and at a tie React Native paints later JSX siblings on top. This bubble used
  // to render after them and sat on top unaffected, floating in plain color while the rest
  // of the scene dimmed. Staying under 8 lets those overlays paint over it like everything
  // else on screen (nameplate included, at zIndex 5).
  wrap: { position: "absolute", maxWidth: 150, zIndex: 6 },
  bubble: { paddingTop: 10, paddingRight: 19, paddingBottom: 14, paddingLeft: 10 },
  art: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, transform: [{ scaleX: -1 }] },
  shadow: { position: "absolute", top: 3, left: -3, right: 3, bottom: -4, opacity: 0.5 },
  line: { fontSize: 10, fontWeight: "800", fontFamily: fonts.bold, color: colors.ink, textAlign: "center" },
});
