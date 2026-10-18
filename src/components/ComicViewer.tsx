import { useEffect, useState } from "react";
import { Image, Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSequence, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts } from "../theme";
import { COMICS, type ComicBubble, type ComicId } from "../state/comics";
import { playSfx } from "../sound";

// Plays a story comic one panel at a time: each tap pops in the panel's next speech bubble,
// then moves on to the next panel; the last tap closes it. "건너뛰기" closes it any time.
export function ComicViewer({ id, onClose }: { id: ComicId; onClose: () => void }) {
  const comic = COMICS[id];
  const { width: windowWidth } = useWindowDimensions();
  // Keeps the title/skip row clear of the notch and status bar.
  const insets = useSafeAreaInsets();
  const width = Math.min(windowWidth - 24, 460);
  const [panel, setPanel] = useState(0);
  const [shown, setShown] = useState(0); // bubbles revealed on the current panel

  const current = comic.panels[panel];
  const advance = () => {
    if (shown < current.bubbles.length) {
      setShown(shown + 1);
      playSfx("uiClick");
    } else if (panel < comic.panels.length - 1) {
      setPanel(panel + 1);
      setShown(0);
    } else {
      onClose();
    }
  };

  // The first bubble follows a beat after each panel slides in, on its own.
  useEffect(() => {
    const timer = setTimeout(() => setShown((value) => Math.max(value, 1)), 550);
    return () => clearTimeout(timer);
  }, [panel]);

  const last = panel === comic.panels.length - 1 && shown >= current.bubbles.length;

  return (
    <Modal visible animationType="fade" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={advance} accessibilityRole="button" accessibilityLabel="다음 장면">
        <View style={[styles.top, { top: insets.top + 12 }]}>
          <Text style={styles.title}>{comic.title}</Text>
          <Pressable onPress={onClose} hitSlop={10} accessibilityRole="button" accessibilityLabel="만화 건너뛰기" style={styles.skip}>
            <Text style={styles.skipText}>건너뛰기 ▶▶</Text>
          </Pressable>
        </View>
        <ComicPanelView key={panel} panel={current} width={width} shown={shown} />
        <View style={styles.dots}>
          {comic.panels.map((_, index) => (
            <View key={index} style={[styles.dot, index === panel && styles.dotActive, index < panel && styles.dotDone]} />
          ))}
        </View>
        <Text style={styles.hint}>{last ? "터치해서 모험 시작!" : "터치해서 넘기기"}</Text>
      </Pressable>
    </Modal>
  );
}

function ComicPanelView({ panel, width, shown }: { panel: (typeof COMICS)[ComicId]["panels"][number]; width: number; shown: number }) {
  const height = width * panel.aspect;
  const enter = useSharedValue(0);
  const shake = useSharedValue(0);
  useEffect(() => {
    enter.value = withTiming(1, { duration: 380, easing: Easing.out(Easing.cubic) });
    if (panel.sfx) {
      const timer = setTimeout(() => playSfx(panel.sfx!), 200);
      if (panel.shake) {
        shake.value = withSequence(
          withTiming(0, { duration: 260 }),
          withTiming(-8, { duration: 50 }),
          withTiming(8, { duration: 70 }),
          withTiming(-5, { duration: 60 }),
          withTiming(0, { duration: 60 }),
        );
      }
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ translateX: (1 - enter.value) * 40 + shake.value }, { scale: 0.96 + enter.value * 0.04 }],
  }));
  return (
    <Animated.View style={[styles.panel, { width, height }, style]}>
      <Image source={panel.image} style={{ width, height }} />
      {panel.bubbles.slice(0, shown).map((bubble, index) => (
        <Bubble key={index} bubble={bubble} width={width} height={height} />
      ))}
    </Animated.View>
  );
}

const TAIL = 12;

// A speech bubble: white, outlined, with a little tail on one edge pointing at the speaker.
function Bubble({ bubble, width, height }: { bubble: ComicBubble; width: number; height: number }) {
  const pop = useSharedValue(0);
  useEffect(() => {
    pop.value = withSequence(withTiming(1.12, { duration: 140, easing: Easing.out(Easing.quad) }), withTiming(1, { duration: 110 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: Math.min(1, pop.value * 1.5), transform: [{ scale: pop.value }] }));
  const position = {
    top: bubble.top * height,
    ...(bubble.left !== undefined ? { left: bubble.left * width } : { right: (bubble.right ?? 0) * width }),
    maxWidth: (bubble.maxWidth ?? 0.5) * width,
  };
  const along = `${Math.round(bubble.tailAt * 100)}%` as const;
  const tailStyle =
    bubble.tail === "bottom"
      ? { bottom: -TAIL / 2, left: along, marginLeft: -TAIL / 2 }
      : bubble.tail === "top"
        ? { top: -TAIL / 2, left: along, marginLeft: -TAIL / 2 }
        : bubble.tail === "left"
          ? { left: -TAIL / 2, top: along, marginTop: -TAIL / 2 }
          : { right: -TAIL / 2, top: along, marginTop: -TAIL / 2 };
  return (
    <Animated.View style={[styles.bubbleWrap, position, style]} pointerEvents="none">
      <View style={[styles.tail, tailStyle, bubble.shout && styles.shoutBorder]} />
      <View style={[styles.bubble, bubble.shout && styles.shout]}>
        <Text style={[styles.bubbleText, bubble.shout && styles.shoutText]}>{bubble.text}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#14100cf2", paddingHorizontal: 12 },
  top: { position: "absolute", left: 16, right: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { color: colors.gold, fontSize: 13, fontWeight: "900", fontFamily: fonts.bold, letterSpacing: 0.5 },
  skip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, backgroundColor: "#ffffff22" },
  skipText: { color: colors.cream, fontSize: 11, fontWeight: "900", fontFamily: fonts.bold },
  panel: { borderRadius: 6, borderWidth: 3, borderColor: colors.line, overflow: "hidden" },
  dots: { marginTop: 14, flexDirection: "row", gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#ffffff33" },
  dotActive: { backgroundColor: colors.gold, width: 18 },
  dotDone: { backgroundColor: "#ffffff88" },
  hint: { marginTop: 10, color: "#e9dfc8", fontSize: 11, fontWeight: "800", fontFamily: fonts.bold },
  bubbleWrap: { position: "absolute" },
  tail: {
    position: "absolute",
    width: TAIL,
    height: TAIL,
    backgroundColor: "#ffffff",
    borderWidth: 2.5,
    borderColor: colors.line,
    transform: [{ rotate: "45deg" }],
  },
  bubble: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, borderWidth: 2.5, borderColor: colors.line, backgroundColor: "#ffffff" },
  bubbleText: { fontSize: 12, lineHeight: 16, fontWeight: "900", fontFamily: fonts.bold, color: colors.ink, textAlign: "center" },
  shout: { backgroundColor: "#fff3c4", borderWidth: 3 },
  shoutBorder: { backgroundColor: "#fff3c4", borderWidth: 3 },
  shoutText: { fontSize: 14, color: colors.red },
});
