import { useEffect, useRef, useState } from "react";
import { Image, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { colors, fonts } from "../theme";
import { StrokedText } from "./StrokedText";
import { images } from "../assets";
import { loadSave } from "../state/storage";
import { getStageLabel } from "../state/stages";
import { OUTFIT_NAMES, OUTFIT_NO_OFFLINE } from "../state/buffs";
import { playSfx } from "../sound";
import { MAX_OFFLINE_MS } from "../state/offline";
import appConfig from "../../app.json";

// Shown in the corner. The policy links only appear once their pages exist — fill these in.
const APP_VERSION = appConfig.expo.version;
const PRIVACY_URL = "";
const TERMS_URL = "";
// Shorter than this away and it's just a reload, not worth a line (offline.ts's own floor).
const AWAY_MIN_MS = 30 * 1000;

// "3시간 20분" / "45분" / "1분 미만" for the away line.
function formatAway(ms: number) {
  const minutes = Math.floor(ms / 60000);
  if (minutes < 1) return "1분 미만";
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${minutes}분`;
  return rest === 0 ? `${hours}시간` : `${hours}시간 ${rest}분`;
}

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
// How long the tap's flash plays before the game takes over.
const EXIT_MS = 380;

// The very first thing the player sees on a cold launch — tap anywhere to continue into
// the game (App.tsx gates GameScreen behind this with local, non-persisted state, so it
// shows again on every real app launch, not just the first-ever one).
export function TitleScreen({ onStart }: { onStart: () => void }) {
  // Where a returning player left off, read straight from the save (null: still loading).
  const [progress, setProgress] = useState<{ line: string; away?: string } | null>(null);
  useEffect(() => {
    let alive = true;
    loadSave().then((save) => {
      if (!alive) return;
      const state = save?.state;
      // How long the game was closed: the companion has been out hunting (capped like the
      // offline reward itself), or — for one who doesn't hunt offline — resting.
      let away: string | undefined;
      const awayMs = state?.tutorialDone && save?.lastSeenAt ? Date.now() - save.lastSeenAt : 0;
      if (state && awayMs >= AWAY_MIN_MS) {
        const name = OUTFIT_NAMES[state.equippedOutfit] ?? "모험기니";
        away = OUTFIT_NO_OFFLINE[state.equippedOutfit]
          ? `${formatAway(awayMs)} 동안 ${name}가 푹 쉬었어요`
          : awayMs > MAX_OFFLINE_MS
            ? `${formatAway(awayMs)} 동안 ${name}가 사냥했어요 (최대 ${MAX_OFFLINE_MS / 3600000}시간 보상)`
            : `${formatAway(awayMs)} 동안 ${name}가 사냥했어요`;
      }
      setProgress({
        away,
        line: state && state.tutorialDone
          ? `Lv.${state.level} ${OUTFIT_NAMES[state.equippedOutfit] ?? "모험기니"} · ${getStageLabel(state.stageNumber)}`
          : "새로운 모험을 시작해요",
      });
    });
    return () => {
      alive = false;
    };
  }, []);

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
          <Image source={images.titleScreen} style={[StyleSheet.absoluteFill, styles.background]} resizeMode="cover" />
        </Animated.View>
        <Dust />
        <View style={styles.titleWrap} pointerEvents="none">
          <Animated.Text style={[styles.sparkle, styles.sparkleLeft, sparkleStyle]}>✦</Animated.Text>
          <Animated.Text style={[styles.sparkle, styles.sparkleRight, sparkleStyle]}>✧</Animated.Text>
          <StrokedText style={styles.title} strokeColor={colors.line} strokeWidth={3}>
            기니 키우기
          </StrokedText>
          {progress && (
            <View style={styles.progress}>
              <Text style={styles.progressText}>{progress.line}</Text>
            </View>
          )}
          {progress?.away && <Text style={styles.awayText}>{progress.away}</Text>}
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
          {PRIVACY_URL !== "" && (
            <Pressable onPress={() => Linking.openURL(PRIVACY_URL)} hitSlop={8} accessibilityRole="link">
              <Text style={[styles.footerText, styles.footerLink]}>개인정보처리방침</Text>
            </Pressable>
          )}
          {TERMS_URL !== "" && (
            <Pressable onPress={() => Linking.openURL(TERMS_URL)} hitSlop={8} accessibilityRole="link">
              <Text style={[styles.footerText, styles.footerLink]}>이용약관</Text>
            </Pressable>
          )}
        </View>
        <Animated.View style={[StyleSheet.absoluteFill, styles.flash, flashStyle]} pointerEvents="none" />
      </Pressable>
    </View>
  );
}

// Warm motes of dust drifting up from the bottom of the art, each on its own size, speed,
// sway and start — fading in low and out before the top, then looping from the bottom.
function Dust() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
      onLayout={(event) => setSize({ width: event.nativeEvent.layout.width, height: event.nativeEvent.layout.height })}
    >
      {size.height > 0 && Array.from({ length: DUST_COUNT }, (_, index) => <Mote key={index} width={size.width} height={size.height} />)}
    </View>
  );
}

function Mote({ width, height }: { width: number; height: number }) {
  // Fixed per mote for this mount, so re-renders don't reshuffle the drift.
  const [mote] = useState(() => ({
    x: Math.random() * width,
    size: 2 + Math.random() * 3.5,
    duration: 6000 + Math.random() * 6000,
    delay: Math.random() * 8000,
    sway: 10 + Math.random() * 22,
    rise: height * (0.55 + Math.random() * 0.4),
    color: Math.random() < 0.7 ? "#fff1c9" : "#ffd27a",
  }));
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(mote.delay, withRepeat(withTiming(1, { duration: mote.duration, easing: Easing.linear }), -1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({
    // In over the first 15%, out over the last 30%.
    opacity: t.value === 0 ? 0 : Math.min(1, t.value / 0.15) * Math.min(1, (1 - t.value) / 0.3) * 0.8,
    transform: [{ translateY: -t.value * mote.rise }, { translateX: Math.sin(t.value * Math.PI * 2) * mote.sway }],
  }));
  return (
    <Animated.View
      style={[
        styles.mote,
        { left: mote.x, width: mote.size, height: mote.size, borderRadius: mote.size, backgroundColor: mote.color, shadowColor: mote.color },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  mote: { position: "absolute", bottom: -6, shadowOpacity: 0.9, shadowRadius: 4, shadowOffset: { width: 0, height: 0 } },
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
  progress: { marginTop: 10, paddingVertical: 5, paddingHorizontal: 14, borderRadius: 999, backgroundColor: "#2b1d12b8", borderWidth: 2, borderColor: "#f3d993" },
  progressText: { color: "#fff4d6", fontSize: 13, fontWeight: "900", fontFamily: fonts.bold },
  // Just under "터치하여 시작", plain outlined text like it.
  tipWrap: { position: "absolute", bottom: "8%", left: 24, right: 24, alignItems: "center" },
  tipText: { color: "#f3e6c8", fontSize: 12, fontWeight: "800", fontFamily: fonts.bold, textAlign: "center" },
  flash: { backgroundColor: "#ffffff" },
  awayText: { marginTop: 6, color: "#fff4d6", fontSize: 11, fontWeight: "800", fontFamily: fonts.bold, textShadowColor: "#1c1613", textShadowRadius: 4 },
  // Bottom-right corner, out of the way of the tip and "터치하여 시작".
  footer: { position: "absolute", bottom: 10, right: 12, flexDirection: "row", alignItems: "center", gap: 10 },
  footerText: { color: "#f3e6c8b3", fontSize: 9, fontWeight: "800", fontFamily: fonts.bold, textShadowColor: "#1c1613", textShadowRadius: 3 },
  footerLink: { textDecorationLine: "underline" },
  start: { fontSize: 18, fontWeight: "800", fontFamily: fonts.bold, color: colors.cream },
});
