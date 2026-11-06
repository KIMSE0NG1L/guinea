import { useEffect, useRef, useState } from "react";
import { Image, Linking, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming, type SharedValue } from "react-native-reanimated";
import { colors, fonts } from "../theme";
import { StrokedText } from "./StrokedText";
import { RisingMotes } from "./RisingMotes";
import { images } from "../assets";
import { playSfx } from "../sound";
import appConfig from "../../app.json";

// Version shown in the corner. Policy pages are docs/*.md served by GitHub Pages (main, /docs).
const APP_VERSION = appConfig.expo.version;
const PRIVACY_URL = "https://kimse0ng1l.github.io/guinea/privacy-policy";
const TERMS_URL = "https://kimse0ng1l.github.io/guinea/terms-of-service";


// One shown at a time above "터치하여 시작", cycling.
const TIPS = [
  "보스가 나타나면 화면을 눌러 도전해요.",
  "같은 세트 음식을 함께 먹으면 세트 효과가 생겨요.",
  "동료마다 능력이 달라요. 보스에 맞춰 바꿔 보세요.",
  "하늘을 나는 동전을 눌러 골드를 챙기세요.",
  "자리를 비운 동안에도 기니는 사냥을 계속해요.",
  "스킬은 하나만 장착할 수 있어요. 상황에 맞게 골라 보세요.",
  "요리책을 채우면 퀘스트 보상을 받을 수 있어요.",
  "보스를 처음 잡으면 보석 보너스를 받을 수 있어요.",
  "강화는 골드가 모일 때마다 틈틈이 해 두세요.",
  "가방이 꽉 차면 재료가 떨어지지 않아요.",
];
const TIP_MS = 7000;
const DUST_COUNT = 22;

// The title art follows the player's own clock: day, a sunset hour band, then night. Each
// has its own drifting particles — warm dust by day, ember-orange at sunset, and blinking
// fireflies wandering at night.
type TimeOfDay = "day" | "sunset" | "night";
function getTimeOfDay(hour = new Date().getHours()): TimeOfDay {
  // Web preview: `?tod=day|sunset|night` forces one, to check the art without touching the
  // computer's clock (which the save uses for offline time, attendance and cooldowns).
  if (Platform.OS === "web" && typeof window !== "undefined") {
    const forced = new URLSearchParams(window.location.search).get("tod");
    if (forced === "day" || forced === "sunset" || forced === "night") return forced;
  }
  if (hour >= 17 && hour < 19) return "sunset";
  if (hour >= 19 || hour < 6) return "night";
  return "day";
}
const BACKGROUND: Record<TimeOfDay, number> = {
  day: images.titleScreen,
  sunset: images.titleScreenSunset,
  night: images.titleScreenNight,
};
const MOTE_COLORS: Record<TimeOfDay, [string, string]> = {
  day: ["#fff1c9", "#ffd27a"],
  sunset: ["#ffd0a0", "#ff9a5a"],
  night: ["#f4ff9a", "#c8ff6a"],
};
// How long the tap's flash plays before the game takes over.
const EXIT_MS = 380;

// The very first thing the player sees on a cold launch — tap anywhere to continue into
// the game (App.tsx gates GameScreen behind this with local, non-persisted state, so it
// shows again on every real app launch, not just the first-ever one).
export function TitleScreen({ onStart }: { onStart: () => void }) {
  // Fixed for this visit to the title (it's only up for a moment).
  const [timeOfDay] = useState(() => getTimeOfDay());

  // Tips: fade out, swap, fade back in.
  const [tipIndex, setTipIndex] = useState(() => Math.floor(Math.random() * TIPS.length));
  const tipFade = useSharedValue(1);
  useEffect(() => {
    const id = setInterval(() => {
      tipFade.value = withSequence(withTiming(0, { duration: 250 }), withTiming(1, { duration: 350 }));
      setTimeout(() => setTipIndex((index) => (index + 1) % TIPS.length), 250);
    }, TIP_MS);
    return () => clearInterval(id);
  }, [tipFade]);
  const tipStyle = useAnimatedStyle(() => ({ opacity: tipFade.value }));

  // The tap: a click, a white flash and a small push in, then the game.
  const flash = useSharedValue(0);
  const zoom = useSharedValue(1);
  const leaving = useRef(false);
  const start = () => {
    if (leaving.current) return;
    leaving.current = true;
    playSfx("uiClick");
    flash.value = withTiming(1, { duration: EXIT_MS, easing: Easing.in(Easing.quad) });
    zoom.value = withTiming(1.08, { duration: EXIT_MS, easing: Easing.in(Easing.quad) });
    setTimeout(onStart, EXIT_MS);
  };
  const flashStyle = useAnimatedStyle(() => ({ opacity: flash.value }));
  const zoomStyle = useAnimatedStyle(() => ({ transform: [{ scale: zoom.value }] }));

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
  const shine = useSharedValue(0);
  useEffect(() => {
    shine.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 750, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 950, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
    );
  }, [shine]);
  const sparkleStyle = useAnimatedStyle(() => ({
    opacity: 0.12 + shine.value * 0.38,
    transform: [{ scale: 0.8 + shine.value * 0.2 }, { rotate: `${shine.value * 18 - 9}deg` }],
  }));

  return (
    // Same "dark shell + max-430-wide centered card" split GameScreen uses, so a wide
    // desktop web preview shows a phone-width column instead of the art stretched edge
    // to edge — on an actual phone this shell is invisible (the frame already fills it).
    <View style={styles.shell}>
      <Pressable style={styles.frame} onPress={start} accessibilityRole="button" accessibilityLabel="터치하여 시작">
        <Animated.View style={[StyleSheet.absoluteFill, zoomStyle]}>
          <Image source={BACKGROUND[timeOfDay]} style={[StyleSheet.absoluteFill, styles.background]} resizeMode="cover" />
        </Animated.View>
        <RisingMotes count={timeOfDay === "night" ? 16 : DUST_COUNT} colors={MOTE_COLORS[timeOfDay]} fireflies={timeOfDay === "night"} />
        <View style={styles.titleWrap} pointerEvents="none">
          <TitleLogo>
            <Animated.Text style={[styles.sparkle, styles.sparkleLeft, sparkleStyle]}>✦</Animated.Text>
            <Animated.Text style={[styles.sparkle, styles.sparkleRight, sparkleStyle]}>✧</Animated.Text>
            <StrokedText style={styles.title} strokeColor={colors.line} strokeWidth={3}>
              기니 키우기
            </StrokedText>
          </TitleLogo>

        </View>
        <Animated.View style={[styles.tipWrap, tipStyle]} pointerEvents="none">
          <StrokedText style={styles.tipText} strokeColor={colors.line} strokeWidth={1.5}>
            {`TIP · ${TIPS[tipIndex]}`}
          </StrokedText>
        </Animated.View>
        <Animated.View style={[styles.startWrap, pulseStyle]} pointerEvents="none">
          <StrokedText style={styles.start} strokeColor={colors.line} strokeWidth={2}>
            터치하여 시작
          </StrokedText>
        </Animated.View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>v{APP_VERSION}</Text>
          <Pressable onPress={() => Linking.openURL(PRIVACY_URL)} hitSlop={8} accessibilityRole="link">
            <Text style={[styles.footerText, styles.footerLink]}>개인정보처리방침</Text>
          </Pressable>
          <Pressable onPress={() => Linking.openURL(TERMS_URL)} hitSlop={8} accessibilityRole="link">
            <Text style={[styles.footerText, styles.footerLink]}>이용약관</Text>
          </Pressable>
        </View>
        <Animated.View style={[StyleSheet.absoluteFill, styles.flash, flashStyle]} pointerEvents="none" />
      </Pressable>
    </View>
  );
}

// The title's entrance: it drops in from above, lands with a squash and a bounce, then a
// glint sweeps across it and a ring of sparkles pops off it. After that it bobs gently.
const DROP_MS = 520;
const GLINT_AT = DROP_MS + 260;
const GLINT_MS = 520;
const BURST = [
  { x: -120, y: -18, glyph: "✦" },
  { x: -70, y: -34, glyph: "✧" },
  { x: 0, y: -40, glyph: "✦" },
  { x: 72, y: -32, glyph: "✧" },
  { x: 118, y: -14, glyph: "✦" },
  { x: -96, y: 26, glyph: "✧" },
  { x: 100, y: 28, glyph: "✧" },
];

function TitleLogo({ children }: { children: React.ReactNode }) {
  const drop = useSharedValue(0);
  const squash = useSharedValue(0);
  const glint = useSharedValue(0);
  const burst = useSharedValue(0);
  const bob = useSharedValue(0);
  useEffect(() => {
    drop.value = withTiming(1, { duration: DROP_MS, easing: Easing.out(Easing.bounce) });
    // A squash on each of the bounce's first contacts, settling out.
    squash.value = withDelay(
      DROP_MS * 0.36,
      withSequence(
        withTiming(1, { duration: 70 }),
        withTiming(0, { duration: 140 }),
        withDelay(DROP_MS * 0.2, withSequence(withTiming(0.4, { duration: 60 }), withTiming(0, { duration: 120 }))),
      ),
    );
    glint.value = withDelay(GLINT_AT, withTiming(1, { duration: GLINT_MS, easing: Easing.inOut(Easing.quad) }));
    burst.value = withDelay(GLINT_AT + 80, withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) }));
    bob.value = withDelay(
      GLINT_AT + GLINT_MS,
      withRepeat(withSequence(withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.sin) }), withTiming(0, { duration: 1400, easing: Easing.inOut(Easing.sin) })), -1),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const logoStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, drop.value * 3),
    transform: [
      { translateY: (1 - drop.value) * -180 - bob.value * 4 },
      { scaleX: 1 + squash.value * 0.12 },
      { scaleY: 1 - squash.value * 0.14 },
    ],
  }));
  // A slanted streak of light passing over the title, left to right.
  const glintStyle = useAnimatedStyle(() => ({
    opacity: glint.value > 0 && glint.value < 1 ? 0.45 : 0,
    transform: [{ translateX: -150 + glint.value * 300 }, { rotate: "18deg" }],
  }));
  return (
    <Animated.View style={[styles.logo, logoStyle]}>
      {children}
      <View style={styles.glintClip} pointerEvents="none">
        <Animated.View style={[styles.glint, glintStyle]} />
      </View>
      {BURST.map((spark, index) => (
        <BurstSpark key={index} burst={burst} x={spark.x} y={spark.y} glyph={spark.glyph} />
      ))}
    </Animated.View>
  );
}

function BurstSpark({ burst, x, y, glyph }: { burst: SharedValue<number>; x: number; y: number; glyph: string }) {
  const style = useAnimatedStyle(() => ({
    opacity: burst.value > 0 ? Math.sin(burst.value * Math.PI) : 0,
    transform: [{ translateX: x * (0.4 + burst.value * 0.6) }, { translateY: y * (0.4 + burst.value * 0.6) }, { scale: 0.4 + Math.sin(burst.value * Math.PI) * 0.9 }],
  }));
  return <Animated.Text style={[styles.burstSpark, style]}>{glyph}</Animated.Text>;
}


const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: colors.appBackground },
  frame: { flex: 1, maxWidth: 430, width: "100%", alignSelf: "center", overflow: "hidden" },
  background: { width: "100%", height: "100%" },
  titleWrap: { position: "absolute", top: "13%", width: "100%", alignItems: "center" },
  title: {
    fontSize: 40,
    fontWeight: "900",
    fontFamily: fonts.bold,
    color: colors.cream,
    letterSpacing: 1,
  },
  sparkle: { position: "absolute", top: 2, color: "#fff1c9", fontSize: 15, textShadowColor: "#f5dfaa", textShadowRadius: 5 },
  sparkleLeft: { left: "50%", marginLeft: -132 },
  sparkleRight: { left: "50%", marginLeft: 112, top: -6, fontSize: 12 },
  startWrap: { position: "absolute", bottom: "14%", width: "100%", alignItems: "center" },
  // Just under "터치하여 시작", plain outlined text like it.
  tipWrap: { position: "absolute", bottom: "8%", left: 24, right: 24, alignItems: "center" },
  tipText: { color: "#f3e6c8", fontSize: 12, fontWeight: "800", fontFamily: fonts.bold, textAlign: "center" },
  flash: { backgroundColor: "#ffffff" },
  logo: { alignItems: "center", justifyContent: "center" },
  // The glint is clipped to roughly the title's box so it reads as light on the letters.
  glintClip: { position: "absolute", left: -10, right: -10, top: 0, bottom: 0, overflow: "hidden", alignItems: "center", justifyContent: "center" },
  glint: { width: 26, height: 90, backgroundColor: "#fffbe6" },
  burstSpark: { position: "absolute", color: "#fff1c9", fontSize: 16, textShadowColor: "#ffd27a", textShadowRadius: 6 },
  // Bottom-right corner, out of the way of the tip and "터치하여 시작".
  footer: { position: "absolute", bottom: 10, right: 12, flexDirection: "row", alignItems: "center", gap: 10 },
  footerText: { color: "#f3e6c8b3", fontSize: 9, fontWeight: "800", fontFamily: fonts.bold, textShadowColor: "#1c1613", textShadowRadius: 3 },
  footerLink: { textDecorationLine: "underline" },
  start: { fontSize: 18, fontWeight: "800", fontFamily: fonts.bold, color: colors.cream },
});
