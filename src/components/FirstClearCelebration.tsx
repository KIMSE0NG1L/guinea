import { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import { colors, fonts } from "../theme";
import { uiImages } from "../assets";
import { StrokedText } from "./StrokedText";

const SHOW_MS = 4200;
const CONFETTI_COLORS = ["#ffd34d", "#ff7a59", "#7ed957", "#5bc0ff", "#ff9ad5", "#fff3b8"];
const RAY_COUNT = 14;

// Sunburst behind the title: alternating gold wedges, slowly spinning.
function Rays({ size }: { size: number }) {
  const c = size / 2;
  const wedges = Array.from({ length: RAY_COUNT }, (_, index) => {
    const a0 = (index / RAY_COUNT) * Math.PI * 2;
    const a1 = a0 + Math.PI / RAY_COUNT;
    return `M${c} ${c} L${c + Math.cos(a0) * c} ${c + Math.sin(a0) * c} L${c + Math.cos(a1) * c} ${c + Math.sin(a1) * c} Z`;
  });
  return (
    <Svg width={size} height={size}>
      {wedges.map((d) => (
        <Path key={d} d={d} fill="#ffd34d" opacity={0.28} />
      ))}
    </Svg>
  );
}

function ConfettiPiece({ index, width, height }: { index: number; width: number; height: number }) {
  // Fixed per piece for this mount, so re-renders don't reshuffle the shower.
  const [piece] = useState(() => ({
    x: Math.random() * width,
    delay: Math.random() * 700,
    drift: (Math.random() - 0.5) * 120,
    spin: (Math.random() - 0.5) * 900,
    size: 6 + Math.random() * 7,
    long: Math.random() > 0.5,
    color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
    duration: 1900 + Math.random() * 1400,
  }));
  const fall = useSharedValue(0);
  useEffect(() => {
    fall.value = withDelay(piece.delay, withTiming(1, { duration: piece.duration, easing: Easing.in(Easing.quad) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({
    opacity: fall.value > 0.92 ? (1 - fall.value) / 0.08 : 1,
    transform: [
      { translateX: piece.drift * fall.value },
      { translateY: -30 + fall.value * (height + 60) },
      { rotate: `${piece.spin * fall.value}deg` },
    ],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.confetti,
        { left: piece.x, width: piece.size, height: piece.long ? piece.size * 1.8 : piece.size, backgroundColor: piece.color },
        style,
      ]}
    />
  );
}

const RIBBON_W = 300;
const BAND_W = 236;
const RIBBON_H = 76;

// Red cloth band with gold trim, gently arched — the middle of the title ribbon.
function RibbonBand() {
  return (
    <Svg width={BAND_W} height={RIBBON_H - 12} viewBox={`0 0 ${BAND_W} ${RIBBON_H - 12}`}>
      <Path d={`M2 10 Q${BAND_W / 2} -2 ${BAND_W - 2} 10 V54 Q${BAND_W / 2} 42 2 54 Z`} fill="#d64a3a" stroke={colors.line} strokeWidth={3} strokeLinejoin="round" />
      <Path d={`M8 15 Q${BAND_W / 2} 4 ${BAND_W - 8} 15`} stroke="#ffd34d" strokeWidth={2} fill="none" />
      <Path d={`M8 49 Q${BAND_W / 2} 38 ${BAND_W - 8} 49`} stroke="#ffd34d" strokeWidth={2} fill="none" />
      <Path d={`M10 18 Q${BAND_W / 2} 8 ${BAND_W - 10} 18 V24 Q${BAND_W / 2} 14 10 24 Z`} fill="#ffffff" opacity={0.16} />
    </Svg>
  );
}

// A notched ribbon end peeking out behind the band, with the darker fold where it tucks.
function RibbonTail({ flip = false }: { flip?: boolean }) {
  return (
    <Svg width={56} height={52} viewBox="0 0 56 52" style={flip ? { transform: [{ scaleX: -1 }] } : undefined}>
      <Path d="M2 6 H48 V46 H2 L16 26 Z" fill="#b23628" stroke={colors.line} strokeWidth={3} strokeLinejoin="round" />
      <Path d="M48 6 L56 0 V40 L48 46 Z" fill="#7e2219" stroke={colors.line} strokeWidth={2.5} strokeLinejoin="round" />
      <Path d="M8 12 H44" stroke="#ffd34d" strokeWidth={1.6} />
      <Path d="M8 40 H44" stroke="#ffd34d" strokeWidth={1.6} />
    </Svg>
  );
}

// The first time a stage's boss falls: dim the game, spin a sunburst, rain confetti, unroll
// a red ribbon that reveals "최초 토벌!", then burst the gem reward out underneath.
export function FirstClearCelebration({ bossName, gems, onDone }: { bossName: string; gems: number; onDone: () => void }) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const backdrop = useSharedValue(0);
  const spin = useSharedValue(0);
  const title = useSharedValue(0);
  const unfurl = useSharedValue(0);
  const words = useSharedValue(0);
  const reward = useSharedValue(0);
  const glow = useSharedValue(0);

  useEffect(() => {
    backdrop.value = withTiming(1, { duration: 200 });
    spin.value = withRepeat(withTiming(360, { duration: 9000, easing: Easing.linear }), -1);
    title.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.quad) });
    // The ribbon unrolls out from its middle, the tails tuck out after, then the words.
    unfurl.value = withDelay(120, withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) }));
    words.value = withDelay(560, withTiming(1, { duration: 280, easing: Easing.out(Easing.quad) }));
    reward.value = withDelay(520, withSpring(1, { damping: 7, stiffness: 140 }));
    glow.value = withRepeat(withSequence(withTiming(1, { duration: 500 }), withTiming(0, { duration: 500 })), -1);
    const timer = setTimeout(onDone, SHOW_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdrop.value }));
  const raysStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value}deg` }, { scale: 0.6 + title.value * 0.4 }] }));
  const bandStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: Math.max(0.02, unfurl.value) }] }));
  const leftTailStyle = useAnimatedStyle(() => ({
    opacity: unfurl.value > 0.55 ? 1 : 0,
    transform: [{ translateX: (1 - Math.min(1, Math.max(0, (unfurl.value - 0.55) / 0.45))) * 60 }],
  }));
  const rightTailStyle = useAnimatedStyle(() => ({
    opacity: unfurl.value > 0.55 ? 1 : 0,
    transform: [{ translateX: -(1 - Math.min(1, Math.max(0, (unfurl.value - 0.55) / 0.45))) * 60 }],
  }));
  const wordsStyle = useAnimatedStyle(() => ({ opacity: words.value, transform: [{ scale: 0.85 + words.value * 0.15 }] }));
  const kickerStyle = useAnimatedStyle(() => ({ opacity: title.value }));
  const rewardStyle = useAnimatedStyle(() => ({ opacity: Math.min(1, reward.value * 2), transform: [{ scale: reward.value }] }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: 0.35 + glow.value * 0.5, transform: [{ scale: 1 + glow.value * 0.15 }] }));
  const raySize = Math.max(size.width, size.height) * 1.2;

  return (
    <Pressable
      style={styles.overlay}
      onPress={onDone}
      accessibilityRole="button"
      accessibilityLabel={`${bossName} 최초 토벌! 보석 ${gems}개 획득. 눌러서 닫기`}
      onLayout={(event) => setSize({ width: event.nativeEvent.layout.width, height: event.nativeEvent.layout.height })}
    >
      <Animated.View style={[styles.backdrop, backdropStyle]} />
      {size.width > 0 && (
        <>
          <Animated.View style={[styles.rays, { width: raySize, height: raySize, marginLeft: -raySize / 2, marginTop: -raySize / 2 }, raysStyle]} pointerEvents="none">
            <Rays size={raySize} />
          </Animated.View>
          {Array.from({ length: 36 }, (_, index) => (
            <ConfettiPiece key={index} index={index} width={size.width} height={size.height} />
          ))}
        </>
      )}
      <View style={styles.center} pointerEvents="none">
        <Animated.Text style={[styles.kicker, kickerStyle]}>BOSS FIRST CLEAR</Animated.Text>
        <View style={styles.ribbon}>
          <Animated.View style={[styles.tailLeft, leftTailStyle]}>
            <RibbonTail />
          </Animated.View>
          <Animated.View style={[styles.tailRight, rightTailStyle]}>
            <RibbonTail flip />
          </Animated.View>
          <Animated.View style={[styles.band, bandStyle]}>
            <RibbonBand />
          </Animated.View>
          <Animated.View style={[styles.ribbonWords, wordsStyle]}>
            <StrokedText style={styles.title} strokeColor="#5a1a12" strokeWidth={3}>
              최초 토벌!
            </StrokedText>
          </Animated.View>
        </View>
        <StrokedText style={styles.boss} strokeColor={colors.line} strokeWidth={2}>
          {bossName} 격파!
        </StrokedText>
        <Animated.View style={[styles.reward, rewardStyle]}>
          <Animated.View style={[styles.gemGlow, glowStyle]} />
          <Image source={uiImages.crystal} style={styles.gem} />
          <StrokedText style={styles.rewardText} strokeColor={colors.line} strokeWidth={3}>
            +{gems}
          </StrokedText>
        </Animated.View>
        <Text style={styles.rewardLabel}>보석 보너스!</Text>
        <Text style={styles.hint}>터치해서 닫기</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 45, overflow: "hidden", alignItems: "center", justifyContent: "center" },
  backdrop: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(20, 12, 6, 0.72)" },
  rays: { position: "absolute", left: "50%", top: "42%" },
  confetti: { position: "absolute", top: 0, borderRadius: 2 },
  center: { alignItems: "center", marginTop: -40 },
  kicker: { textAlign: "center", fontSize: 11, fontWeight: "900", fontFamily: fonts.bold, color: "#ffe9a3", letterSpacing: 3 },
  title: { fontSize: 30, fontWeight: "900", fontFamily: fonts.bold, color: "#fff1c4" },
  ribbon: { marginTop: 6, width: RIBBON_W, height: RIBBON_H, alignItems: "center", justifyContent: "center" },
  band: { position: "absolute", top: 0, left: (RIBBON_W - BAND_W) / 2 },
  tailLeft: { position: "absolute", left: 0, top: 18 },
  tailRight: { position: "absolute", right: 0, top: 18 },
  ribbonWords: { position: "absolute", top: 8, left: 0, right: 0, height: RIBBON_H - 26, alignItems: "center", justifyContent: "center" },
  boss: { marginTop: 6, fontSize: 18, fontWeight: "900", fontFamily: fonts.bold, color: colors.cream },
  reward: { marginTop: 22, flexDirection: "row", alignItems: "center", gap: 8 },
  gemGlow: { position: "absolute", left: -18, width: 96, height: 96, borderRadius: 48, backgroundColor: "#7fd6ff" },
  gem: { width: 60, height: 60 },
  rewardText: { fontSize: 40, fontWeight: "900", fontFamily: fonts.bold, color: "#bff0ff" },
  rewardLabel: { marginTop: 4, fontSize: 13, fontWeight: "900", fontFamily: fonts.bold, color: "#bff0ff" },
  hint: { marginTop: 26, fontSize: 10, fontWeight: "800", fontFamily: fonts.bold, color: "#d8cdb8" },
});
