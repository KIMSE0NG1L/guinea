import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "./GameText";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming, Easing } from "react-native-reanimated";
import { colors, fonts } from "../theme";
import { StrokedText } from "./StrokedText";
import { t } from "../i18n";

// Approximates the web's `radial-gradient(circle, #f2c44b88, #3d513ad9 58%, #263525eb)` as a
// 3-stop linear gradient (see plan: true radial has no core RN primitive, not worth
// react-native-svg for one ~1.5s flash). Mount fresh via `key={stageLabel}` at the call site —
// mirrors the web's `key={stageAdvance}` remount trick for the CSS `stageReveal` animation.
const EXIT_MS = 200;

// Stays up until tapped (`onContinue`) — the battle waits on the next stage until then.
export function StageAdvanceBanner({ stageLabel, onContinue }: { stageLabel: string; onContinue?: () => void }) {
  const reveal = useSharedValue(0);
  const ringA = useSharedValue(0);
  const ringB = useSharedValue(0);
  const title = useSharedValue(0);
  const rule = useSharedValue(0);
  const prompt = useSharedValue(0);
  const exit = useSharedValue(0);
  const [leaving, setLeaving] = useState(false);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // The title slams in big and settles; the gold rules then draw out from it.
    title.value = withSequence(
      withTiming(0, { duration: 60 }),
      withTiming(1.12, { duration: 170, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: 140, easing: Easing.inOut(Easing.quad) }),
    );
    rule.value = withSequence(withTiming(0, { duration: 200 }), withTiming(1, { duration: 320, easing: Easing.out(Easing.cubic) }));
    reveal.value = withTiming(1, { duration: 270, easing: Easing.out(Easing.quad) });
    prompt.value = withSequence(
      withTiming(0, { duration: 700 }),
      withRepeat(withSequence(withTiming(1, { duration: 520 }), withTiming(0.35, { duration: 520 })), -1),
    );
    ringA.value = withTiming(1, { duration: 880, easing: Easing.out(Easing.quad) });
    ringB.value = withSequence(withTiming(0, { duration: 60 }), withTiming(1, { duration: 880, easing: Easing.out(Easing.quad) }));
    return () => {
      if (exitTimer.current) clearTimeout(exitTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const proceed = () => {
    if (leaving || !onContinue) return;
    setLeaving(true);
    exit.value = withTiming(1, { duration: EXIT_MS, easing: Easing.in(Easing.quad) });
    exitTimer.current = setTimeout(onContinue, EXIT_MS);
  };

  const revealStyle = useAnimatedStyle(() => ({ opacity: reveal.value * (1 - exit.value) }));
  const promptStyle = useAnimatedStyle(() => ({ opacity: prompt.value, transform: [{ scale: 0.96 + prompt.value * 0.06 }] }));
  const titleStyle = useAnimatedStyle(() => ({ opacity: Math.min(1, title.value * 3), transform: [{ scale: 1.6 - Math.min(title.value, 1) * 0.6 + Math.max(0, title.value - 1) }] }));
  const ruleStyle = useAnimatedStyle(() => ({ opacity: rule.value, transform: [{ scaleX: rule.value }] }));
  const ringAStyle = useAnimatedStyle(() => ({
    opacity: ringA.value < 1 ? 1 - Math.abs(ringA.value - 0.35) : 0,
    transform: [{ scale: 0.35 + ringA.value * 0.85 }, { rotate: `${-24 + ringA.value * 38}deg` }],
  }));
  const ringBStyle = useAnimatedStyle(() => ({
    opacity: ringB.value < 1 ? 1 - Math.abs(ringB.value - 0.35) : 0,
    transform: [{ scale: 0.35 + ringB.value * 0.85 }, { rotate: `${-24 + ringB.value * 38}deg` }],
  }));

  return (
    <Animated.View style={[styles.overlay, revealStyle]} pointerEvents={onContinue ? "auto" : "none"}>
      {/* The press target wraps everything, so the backdrop and rings drawn inside it can't
          sit on top of it and swallow the tap. */}
      <Pressable style={styles.press} onPress={proceed} disabled={!onContinue} accessibilityRole="button" accessibilityLabel={t(`${stageLabel}로 출발하기`, `Head to ${stageLabel}`)}>
      <LinearGradient
        colors={["#f2c44bcc", "#3d513ad9", "#263525eb"]}
        locations={[0, 0.58, 1]}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View style={[styles.ring, styles.ringDashed, ringAStyle]} />
      <Animated.View style={[styles.ring, styles.ringSolid, ringBStyle]} />
      <View style={styles.content} pointerEvents="none">
        <Animated.View style={titleStyle}>
          <StrokedText style={styles.title} strokeColor="#3a2410" strokeWidth={3}>
            STAGE CLEAR
          </StrokedText>
        </Animated.View>
        {/* Gold rules either side of the stage name, each ending in a small diamond. */}
        <View style={styles.nameRow}>
          <Animated.View style={[styles.rule, styles.ruleLeft, ruleStyle]}>
            <View style={styles.ruleLine} />
            <View style={styles.diamond} />
          </Animated.View>
          <StrokedText style={styles.stageLabel} strokeColor={colors.line} strokeWidth={2}>
            {stageLabel}
          </StrokedText>
          <Animated.View style={[styles.rule, styles.ruleRight, ruleStyle]}>
            <View style={styles.diamond} />
            <View style={styles.ruleLine} />
          </Animated.View>
        </View>
        <Text style={styles.sub}>{t("다음 지역으로 출발!", "Heading to the next area!")}</Text>
        {onContinue && (
          <Animated.View style={[styles.prompt, promptStyle]}>
            <Text style={styles.promptText}>{t("터치해서 계속", "Tap to Continue")}</Text>
          </Animated.View>
        )}
      </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFill, zIndex: 8 },
  press: { ...StyleSheet.absoluteFill, alignItems: "center", justifyContent: "center" },
  ring: { position: "absolute", borderRadius: 999 },
  ringDashed: { width: 210, height: 210, borderWidth: 2, borderColor: "#f3d993", borderStyle: "dashed" },
  ringSolid: { width: 155, height: 155, borderWidth: 2, borderColor: "#fff4bd88" },
  content: { alignItems: "center" },
  title: { color: "#ffd84a", fontSize: 32, fontWeight: "900", fontFamily: fonts.bold, letterSpacing: 2 },
  nameRow: { marginTop: 2, flexDirection: "row", alignItems: "center", gap: 8 },
  rule: { flexDirection: "row", alignItems: "center", width: 46 },
  ruleLeft: { transformOrigin: "100% 50%" },
  ruleRight: { transformOrigin: "0% 50%" },
  ruleLine: { flex: 1, height: 2, borderRadius: 1, backgroundColor: "#f3d993" },
  diamond: { width: 7, height: 7, backgroundColor: "#ffd84a", borderWidth: 1, borderColor: "#3a2410", transform: [{ rotate: "45deg" }] },
  stageLabel: { color: "#fff4bd", fontSize: 24, fontWeight: "800", fontFamily: fonts.bold, letterSpacing: -0.5 },
  prompt: { marginTop: 14, backgroundColor: "#3d513a", borderWidth: 2, borderColor: colors.line, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 14 },
  promptText: { color: "#fff4bd", fontSize: 14, fontWeight: "900", fontFamily: fonts.bold },
  sub: { marginTop: 6, color: "#f3e6c8", fontSize: 12, fontWeight: "900", fontFamily: fonts.bold, letterSpacing: 1 },
});
