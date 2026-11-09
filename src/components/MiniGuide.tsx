import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { colors, fonts } from "../theme";
import { CharacterSprite } from "./CharacterSprite";
import { ARROW_H, ARROW_W, GuideArrow } from "./GuideArrow";
import { RichLine } from "./TutorialOverlay";
import { measureTarget, type TargetRect } from "./tutorialTargets";

// A light-touch guide: no dimming, so the game stays in full view. 모험기니's face pops up
// with a small speech bubble at the top, and arrows point at the things being talked
// about (e.g. the gold counter and the bag). Tap the bubble to move on — or, with
// `tapAnywhere`, anywhere on screen (for steps that point at something on the stage the
// player will naturally tap instead, like the held loot).
export function MiniGuide({ line, targetIds = [], onTap, tapAnywhere = false }: { line: string; targetIds?: string[]; onTap: () => void; tapAnywhere?: boolean }) {
  const overlayRef = useRef<View>(null);
  const [holes, setHoles] = useState<TargetRect[]>([]);
  const pop = useSharedValue(0);
  // One tap per step: a quick double tap would otherwise run onTap twice before the parent
  // re-renders (and swaps this guide out), e.g. crediting the held gold twice.
  const tapped = useRef(false);
  const tap = () => {
    if (tapped.current) return;
    tapped.current = true;
    onTap();
  };

  useEffect(() => {
    pop.value = withTiming(1, { duration: 280, easing: Easing.out(Easing.back(1.8)) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Arrows follow their targets (the page may still be settling).
  useEffect(() => {
    let alive = true;
    const measure = () =>
      Promise.all(targetIds.map((id) => measureTarget(id))).then((rects) => {
        overlayRef.current?.measureInWindow((ox, oy) => {
          if (!alive) return;
          setHoles(rects.filter((rect): rect is TargetRect => rect !== null).map((rect) => ({ ...rect, x: rect.x - ox, y: rect.y - oy })));
        });
      });
    measure();
    const timer = setInterval(measure, 300);
    return () => {
      alive = false;
      clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const popStyle = useAnimatedStyle(() => ({ opacity: pop.value, transform: [{ translateY: (1 - pop.value) * -12 }, { scale: 0.9 + pop.value * 0.1 }] }));

  return (
    <View ref={overlayRef} style={styles.overlay} pointerEvents="box-none">
      {tapAnywhere && <Pressable style={StyleSheet.absoluteFill} onPress={tap} accessibilityRole="button" accessibilityLabel="눌러서 줍기" />}
      {holes.map((hole, index) => {
        const below = hole.y < ARROW_H + 12;
        return (
          <GuideArrow
            key={index}
            direction={below ? "up" : "down"}
            style={{ left: hole.x + hole.width / 2 - ARROW_W / 2, top: below ? hole.y + hole.height + 4 : hole.y - ARROW_H - 4 }}
          />
        );
      })}
      <Animated.View style={[styles.wrap, popStyle]}>
        <Pressable onPress={tap} accessibilityRole="button" accessibilityLabel="다음 설명" style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
          <View style={styles.face}>
            <View style={styles.faceCrop}>
              <CharacterSprite outfit="default" animation="idle" size={72} />
            </View>
          </View>
          <View style={styles.bubble}>
            <View style={styles.tail} />
            <RichLine text={line} style={styles.line} />
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 50 },
  // Over the top of the battle scene (the stage bar), leaving the ground and the buttons clear.
  wrap: { position: "absolute", top: 84, left: 12, right: 12 },
  row: { flexDirection: "row", alignItems: "center" },
  pressed: { transform: [{ scale: 0.98 }] },
  face: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 3,
    borderColor: colors.line,
    backgroundColor: "#fdf0d6",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  // The sprite's head sits in the upper part of its frame — nudge it down into the circle.
  faceCrop: { marginTop: 18 },
  bubble: {
    flex: 1,
    marginLeft: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: "#fff8e6",
    borderWidth: 2.5,
    borderColor: colors.line,
    filter: "drop-shadow(0px 3px 2px rgba(10, 6, 3, 0.35))",
  },
  tail: {
    position: "absolute",
    left: -9,
    top: "50%",
    marginTop: -7,
    width: 14,
    height: 14,
    backgroundColor: "#fff8e6",
    borderLeftWidth: 2.5,
    borderBottomWidth: 2.5,
    borderColor: colors.line,
    transform: [{ rotate: "45deg" }],
  },
  line: { marginTop: 0, fontSize: 13, lineHeight: 19, fontFamily: fonts.bold },
});
