import { useEffect, useRef, useState } from "react";
import Svg, { Path } from "react-native-svg";
import { ARROW_H, ARROW_W, GuideArrow } from "./GuideArrow";
import { measureTarget, type TargetRect } from "./tutorialTargets";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { colors, fonts } from "../theme";
import { frameKit, icons, navIcons, shopKit } from "../assets";
import { NineSlice } from "./NineSlice";
import { CharacterSprite } from "./CharacterSprite";
import { GameButton } from "./GameButton";

// `**word**` in a line is drawn in red to point out the thing being explained.
// The intro only sets the scene — everything else is taught in context, as it happens:
// loot right after the first kill, upgrades once there's gold, the stage bar / boss /
// quests once the stage is under way, cooking once there are ingredients.
const STEPS: { line: string; icon?: number }[] = [
  { line: "안녕! 나는 **모험기니**야.\n건초만 먹기 지겨워서\n맛있는 끼니를 찾아 모험 중이야!" },
  { line: "몬스터는 내가 **자동으로** 공격해.\n어떻게 싸우는지는 직접 보면서\n하나씩 알려 줄게!", icon: navIcons.battle },
  { line: "자, 첫 **전투**야! 이건 내가 널 위해\n준비한 **선물**이야.\n잠깐 엄청 강해질 거야!", icon: icons.chest },
];

const SPRITE_SIZE = 132;

export function RichLine({ text, style }: { text: string; style?: object }) {
  const parts = text.split(/\*\*(.+?)\*\*/);
  return (
    <Text style={[styles.line, style]}>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <Text key={index} style={styles.emphasis}>{part}</Text>
        ) : (
          part
        ),
      )}
    </Text>
  );
}

// First-run walkthrough: 모험기니 stands in the bottom corner and explains the game in a
// speech bubble, one tap per line. Both the guinea and the bubble cast drop shadows so
// they lift off the dimmed game behind them.
export function TutorialOverlay({ onFinish }: { onFinish: () => void }) {
  const [step, setStep] = useState(0);
  const last = step === STEPS.length - 1;
  const { line, icon } = STEPS[step];
  const next = () => (last ? onFinish() : setStep((current) => current + 1));
  return (
    <GuideScene
      stepKey={step}
      line={line}
      icon={icon}
      dots={{ count: STEPS.length, index: step }}
      onTap={last ? undefined : next}
      onSkip={last ? undefined : onFinish}
      action={last ? { label: "선물 받기!", onPress: onFinish } : undefined}
    />
  );
}

// The shared stage for every guided moment: 모험기니 in a corner, a dimmed game behind,
// and one speech-bubble line. Tapping advances when `onTap` is set. With `targetId`, the
// dim layer gets a hole over that button and an arrow bounces on it — only the real
// button can be pressed, and the guide waits for the game to react.
export function GuideScene({
  stepKey,
  line,
  icon,
  dots,
  onTap,
  onSkip,
  action,
  targetId,
  showcase = false,
}: {
  stepKey: number | string;
  line: string;
  icon?: number;
  dots?: { count: number; index: number };
  onTap?: () => void;
  onSkip?: () => void;
  action?: { label: string; onPress: () => void; accessibilityLabel?: string };
  targetId?: string;
  // With targetId: just show the target off — no arrow, it sparkles in its hole in the
  // dim, and a tap anywhere continues (onTap) instead of pressing it.
  showcase?: boolean;
}) {
  const pop = useSharedValue(0);
  const blink = useSharedValue(1);
  const overlayRef = useRef<View>(null);
  const [overlaySize, setOverlaySize] = useState({ width: 0, height: 0 });
  const [hole, setHole] = useState<TargetRect | null>(null);

  useEffect(() => {
    pop.value = 0;
    pop.value = withTiming(1, { duration: 260, easing: Easing.out(Easing.back(1.8)) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepKey]);

  useEffect(() => {
    blink.value = withRepeat(withSequence(withTiming(0.35, { duration: 600 }), withTiming(1, { duration: 600 })), -1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-measured on a short poll: pages change, scroll and settle under the guide.
  // The parent keys each step's scene, so a stale hole never carries over.
  useEffect(() => {
    if (!targetId) return;
    let alive = true;
    const measure = async () => {
      const overlay = overlayRef.current;
      const target = await measureTarget(targetId);
      if (!alive || !overlay) return;
      overlay.measureInWindow((ox, oy) => {
        if (!alive) return;
        const next = target ? { x: target.x - ox, y: target.y - oy, width: target.width, height: target.height } : null;
        setHole((previous) =>
          previous && next && Math.abs(previous.x - next.x) < 1 && Math.abs(previous.y - next.y) < 1 && previous.width === next.width
            ? previous
            : next,
        );
      });
    };
    measure();
    const timer = setInterval(measure, 250);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [targetId, stepKey]);

  const bubbleStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, pop.value * 1.6),
    transform: [{ translateY: (1 - pop.value) * 10 }, { scale: 0.9 + pop.value * 0.1 }],
  }));
  const hintStyle = useAnimatedStyle(() => ({ opacity: blink.value }));

  // Guide sits at the bottom unless the button it points at is down there.
  const atTop = hole !== null && hole.y + hole.height / 2 > overlaySize.height * 0.5;

  return (
    <View
      ref={overlayRef}
      style={styles.overlay}
      pointerEvents="box-none"
      onLayout={(event) => setOverlaySize({ width: event.nativeEvent.layout.width, height: event.nativeEvent.layout.height })}
    >
      {targetId ? (
        hole ? (
          <Spotlight hole={hole} size={overlaySize} showcase={showcase} onTap={showcase ? onTap : undefined} />
        ) : (
          <View style={styles.scrim} />
        )
      ) : (
        <Pressable style={styles.scrim} onPress={onTap} accessibilityRole={onTap ? "button" : undefined} accessibilityLabel={onTap ? "다음 설명" : undefined}>
          {/* Extra darkness behind the guinea and bubble so they read clearly. */}
          <LinearGradient colors={["rgba(20,16,12,0)", "rgba(20,16,12,0.6)"]} style={styles.scrimFade} pointerEvents="none" />
        </Pressable>
      )}

      <View style={[styles.group, atTop ? styles.groupTop : styles.groupBottom]} pointerEvents="box-none">
        <Animated.View style={[styles.bubbleWrap, bubbleStyle]} pointerEvents="box-none">
          {onSkip && (
            <GameButton variant="pillGray" onPress={onSkip} style={styles.skip} textStyle={styles.skipText} accessibilityLabel="튜토리얼 건너뛰기">
              건너뛰기 ▸▸
            </GameButton>
          )}
          {/* Only a tap-to-continue bubble is pressable — a disabled Pressable would swallow
              presses meant for the action button inside it on web. */}
          <BubbleBody onPress={onTap}>
            {/* A dark silhouette of the bubble, nudged down-right, is its drop shadow. */}
            <View style={styles.bubbleShadow}>
              <NineSlice slice={shopKit.bubble} scale={0.42} tint="#140c06" />
            </View>
            <NineSlice slice={shopKit.bubble} scale={0.42} />
            <View style={styles.body}>
              <View style={styles.copy}>
                <Text style={styles.speaker}>모험기니</Text>
                <RichLine text={line} />
              </View>
              {icon !== undefined && (
                <View style={styles.iconSlot}>
                  <NineSlice slice={frameKit.squareWood} scale={0.5} />
                  <Image source={icon} style={styles.icon} resizeMode="contain" />
                </View>
              )}
            </View>
            <View style={styles.footer}>
              <View style={styles.dots}>
                {dots && Array.from({ length: dots.count }, (_, index) => (
                  <View key={index} style={[styles.dot, index === dots.index && styles.dotActive]} />
                ))}
              </View>
              {action ? (
                <GameButton variant="green" onPress={action.onPress} style={styles.start} textStyle={styles.startText} accessibilityLabel={action.accessibilityLabel}>
                  {action.label}
                </GameButton>
              ) : targetId && !showcase ? (
                <Animated.Text style={[styles.hint, hintStyle]}>화살표를 눌러 봐!</Animated.Text>
              ) : (
                onTap && <Animated.Text style={[styles.hint, hintStyle]}>터치해서 계속 ▸</Animated.Text>
              )}
            </View>
          </BubbleBody>
        </Animated.View>
        <View style={styles.guinea} pointerEvents="none">
          <View style={styles.groundShadow} />
          <View style={styles.spriteShadow}>
            <CharacterSprite outfit="default" animation="idle" size={SPRITE_SIZE} />
          </View>
        </View>
      </View>
    </View>
  );
}

function BubbleBody({ onPress, children }: { onPress?: () => void; children: React.ReactNode }) {
  if (!onPress) return <View style={styles.bubble}>{children}</View>;
  return (
    <Pressable onPress={onPress} style={styles.bubble} accessibilityRole="button" accessibilityLabel="다음 설명">
      {children}
    </Pressable>
  );
}

const HOLE_PAD = 6;
const RING_RADIUS = 12;
const DIM_COLOR = "rgba(20, 16, 12, 0.6)";

// Four dim panels around the target leave it uncovered (and pressable), with a pulsing
// gold ring around it and a bouncing arrow pointing in from above (or below, near the top).
function Spotlight({
  hole,
  size,
  showcase = false,
  onTap,
}: {
  hole: TargetRect;
  size: { width: number; height: number };
  showcase?: boolean;
  onTap?: () => void;
}) {
  const bounce = useSharedValue(0);
  useEffect(() => {
    bounce.value = withRepeat(withSequence(withTiming(1, { duration: 380, easing: Easing.out(Easing.quad) }), withTiming(0, { duration: 380, easing: Easing.in(Easing.quad) })), -1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const left = hole.x - HOLE_PAD;
  const top = hole.y - HOLE_PAD;
  const right = hole.x + hole.width + HOLE_PAD;
  const bottom = hole.y + hole.height + HOLE_PAD;
  const below = top < ARROW_H + 12;
  const ringStyle = useAnimatedStyle(() => ({ opacity: 0.55 + bounce.value * 0.45 }));
  // The dim is drawn as one shape with a rounded hole matching the gold ring, so no square
  // corners of undimmed game peek out around it. The four clear panels only block presses.
  const ring = { left: left - 2, top: top - 2, right: right + 2, bottom: bottom + 2 };
  const r = Math.min(RING_RADIUS, (ring.right - ring.left) / 2, (ring.bottom - ring.top) / 2);
  const dimPath =
    `M0 0 H${size.width} V${size.height} H0 Z ` +
    `M${ring.left + r} ${ring.top} H${ring.right - r} A${r} ${r} 0 0 1 ${ring.right} ${ring.top + r} ` +
    `V${ring.bottom - r} A${r} ${r} 0 0 1 ${ring.right - r} ${ring.bottom} ` +
    `H${ring.left + r} A${r} ${r} 0 0 1 ${ring.left} ${ring.bottom - r} ` +
    `V${ring.top + r} A${r} ${r} 0 0 1 ${ring.left + r} ${ring.top} Z`;
  return (
    <>
      <Svg width={size.width} height={size.height} style={styles.dimShape} pointerEvents="none">
        <Path d={dimPath} fill={DIM_COLOR} fillRule="evenodd" />
      </Svg>
      {showcase ? (
        // Showing off, not asking for a press: the whole screen (target included) continues.
        <Pressable style={[styles.blocker, { left: 0, top: 0, width: size.width, height: size.height }]} onPress={onTap} accessibilityRole="button" accessibilityLabel="다음 설명" />
      ) : (
        <>
          <View style={[styles.blocker, { left: 0, top: 0, width: size.width, height: Math.max(0, top) }]} />
          <View style={[styles.blocker, { left: 0, top: bottom, width: size.width, height: Math.max(0, size.height - bottom) }]} />
          <View style={[styles.blocker, { left: 0, top, width: Math.max(0, left), height: bottom - top }]} />
          <View style={[styles.blocker, { left: right, top, width: Math.max(0, size.width - right), height: bottom - top }]} />
        </>
      )}
      <Animated.View
        pointerEvents="none"
        style={[styles.ring, { left: ring.left, top: ring.top, width: ring.right - ring.left, height: ring.bottom - ring.top, borderRadius: r }, ringStyle]}
      />
      {showcase ? (
        <Sparkles box={{ left: ring.left, top: ring.top, width: ring.right - ring.left, height: ring.bottom - ring.top }} />
      ) : (
        <GuideArrow direction={below ? "up" : "down"} style={{ left: hole.x + hole.width / 2 - ARROW_W / 2, top: below ? bottom + 4 : top - ARROW_H - 4 }} />
      )}
    </>
  );
}

// Little four-point stars twinkling around a showcased target, each on its own beat.
const SPARKLE_SPOTS = [
  { x: -0.08, y: 0.1, size: 18, delay: 0 },
  { x: 0.92, y: -0.06, size: 22, delay: 250 },
  { x: 1.02, y: 0.78, size: 16, delay: 500 },
  { x: 0.1, y: 0.95, size: 20, delay: 750 },
  { x: 0.55, y: -0.12, size: 14, delay: 380 },
];

export function Sparkles({ box }: { box: { left: number; top: number; width: number; height: number } }) {
  return (
    <>
      {SPARKLE_SPOTS.map((spot, index) => (
        <Sparkle key={index} delay={spot.delay} size={spot.size} left={box.left + box.width * spot.x - spot.size / 2} top={box.top + box.height * spot.y - spot.size / 2} />
      ))}
    </>
  );
}

function Sparkle({ delay, size, left, top }: { delay: number; size: number; left: number; top: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(delay, withRepeat(withSequence(withTiming(1, { duration: 420 }), withTiming(0, { duration: 520 })), -1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: t.value, transform: [{ scale: 0.4 + t.value * 0.8 }, { rotate: `${t.value * 45}deg` }] }));
  return (
    <Animated.View pointerEvents="none" style={[{ position: "absolute", left, top, width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox="0 0 20 20">
        <Path d="M10 0 L12.2 7.8 L20 10 L12.2 12.2 L10 20 L7.8 12.2 L0 10 L7.8 7.8 Z" fill="#fff6b0" stroke="#e8b830" strokeWidth={1} />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 50 },
  scrim: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(20, 16, 12, 0.55)" },
  scrimFade: { position: "absolute", left: 0, right: 0, bottom: 0, height: "55%" },
  skip: { alignSelf: "flex-end", minHeight: 30, paddingHorizontal: 14, marginBottom: 10 },
  skipText: { fontSize: 12 },
  // Bubble above, guinea below it; the whole group parks at the bottom or the top.
  group: { position: "absolute", left: 0, right: 0 },
  groupBottom: { bottom: 26 },
  groupTop: { top: 12 },
  guinea: { marginLeft: 4, marginTop: 4, width: SPRITE_SIZE, height: SPRITE_SIZE, alignItems: "center" },
  dimShape: { position: "absolute", left: 0, top: 0 },
  blocker: { position: "absolute" },
  ring: { position: "absolute", borderWidth: 3, borderColor: "#ffd34d" },
  // Soft oval under the feet so the guinea stands on something instead of floating.
  groundShadow: {
    position: "absolute",
    bottom: 4,
    width: SPRITE_SIZE * 0.56,
    height: 14,
    borderRadius: 999,
    backgroundColor: "#00000073",
  },
  spriteShadow: { filter: "drop-shadow(0px 5px 4px rgba(10, 6, 3, 0.55))" },
  // The tail sits at the bubble's bottom-left, so the bubble hangs up and right of the guinea's head.
  bubbleWrap: { marginLeft: 70, marginRight: 12 },
  bubble: { paddingTop: 16, paddingLeft: 20, paddingRight: 18, paddingBottom: 34, minHeight: 150 },
  bubbleShadow: { position: "absolute", top: 7, left: 5, right: -5, bottom: -7, opacity: 0.5, filter: "blur(3px)" },
  body: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  copy: { flex: 1 },
  speaker: { fontSize: 12, fontWeight: "900", fontFamily: fonts.bold, color: colors.red, letterSpacing: 0.5 },
  line: { marginTop: 5, fontSize: 14, lineHeight: 22, fontWeight: "700", fontFamily: fonts.bold, color: colors.ink },
  emphasis: { color: colors.red },
  iconSlot: { width: 54, height: 54, alignItems: "center", justifyContent: "center", marginTop: 4 },
  icon: { width: 38, height: 38 },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 10, minHeight: 32 },
  dots: { flexDirection: "row", gap: 5 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#d9c49e" },
  dotActive: { width: 16, backgroundColor: colors.gold },
  hint: { fontSize: 12, fontWeight: "800", fontFamily: fonts.bold, color: colors.muted },
  start: { minHeight: 34, paddingHorizontal: 18 },
  startText: { fontSize: 13 },
});
