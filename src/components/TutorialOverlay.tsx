import { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { colors, fonts } from "../theme";
import { food, frameKit, icons, navIcons, shopKit, statIcons } from "../assets";
import { NineSlice } from "./NineSlice";
import { CharacterSprite } from "./CharacterSprite";
import { GameButton } from "./GameButton";

// `**word**` in a line is drawn in red to point out the thing being explained.
const STEPS: { line: string; icon?: number }[] = [
  { line: "안녕! 나는 **모험기니**야.\n건초만 먹기 지겨워서\n맛있는 끼니를 찾아 모험 중이야!" },
  { line: "몬스터는 내가 **자동으로** 공격해.\n쓰러뜨리면 **골드**랑 **재료**를\n떨어뜨려!", icon: navIcons.battle },
  { line: "스테이지 바가 가득 차면\n**보스**가 나타나. 보스를 이기면\n다음 지역으로 갈 수 있어!", icon: icons.trophy },
  { line: "모은 골드로 아래 **능력치**를\n강화해 줘. 강해질수록\n더 멀리 모험할 수 있어.", icon: statIcons.attack },
  { line: "재료가 모이면 **냄비**를 눌러\n요리해! 요리를 **음식 슬롯**에\n넣으면 버프가 생겨.", icon: food.cookPotTrim },
  { line: "**퀘스트 메달**에 빨간 점이 뜨면\n보상을 받을 수 있어.\n자, 이제 출발하자!", icon: icons.questMedal },
];

const SPRITE_SIZE = 132;

function RichLine({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/);
  return (
    <Text style={styles.line}>
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
      action={last ? { label: "출발!", onPress: onFinish } : undefined}
    />
  );
}

// The shared stage for every guided moment: 모험기니 in the corner, a dimmed game behind,
// and one speech-bubble line. Tapping advances when `onTap` is set; otherwise the bubble
// waits for its `action` button (used when the step needs the player to do something).
export function GuideScene({
  stepKey,
  line,
  icon,
  dots,
  onTap,
  onSkip,
  action,
}: {
  stepKey: number | string;
  line: string;
  icon?: number;
  dots?: { count: number; index: number };
  onTap?: () => void;
  onSkip?: () => void;
  action?: { label: string; onPress: () => void; accessibilityLabel?: string };
}) {
  const pop = useSharedValue(0);
  const blink = useSharedValue(1);

  useEffect(() => {
    pop.value = 0;
    pop.value = withTiming(1, { duration: 260, easing: Easing.out(Easing.back(1.8)) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepKey]);

  useEffect(() => {
    blink.value = withRepeat(withSequence(withTiming(0.35, { duration: 600 }), withTiming(1, { duration: 600 })), -1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bubbleStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, pop.value * 1.6),
    transform: [{ translateY: (1 - pop.value) * 10 }, { scale: 0.9 + pop.value * 0.1 }],
  }));
  const hintStyle = useAnimatedStyle(() => ({ opacity: blink.value }));

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.scrim} onPress={onTap} accessibilityRole={onTap ? "button" : undefined} accessibilityLabel={onTap ? "다음 설명" : undefined}>
        {/* Extra darkness behind the guinea and bubble so they read clearly. */}
        <LinearGradient colors={["rgba(20,16,12,0)", "rgba(20,16,12,0.6)"]} style={styles.scrimFade} pointerEvents="none" />
      </Pressable>

      <View style={styles.guinea} pointerEvents="none">
        <View style={styles.groundShadow} />
        <View style={styles.spriteShadow}>
          <CharacterSprite outfit="default" animation="idle" size={SPRITE_SIZE} />
        </View>
      </View>

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
            ) : (
              onTap && <Animated.Text style={[styles.hint, hintStyle]}>터치해서 계속 ▸</Animated.Text>
            )}
          </View>
        </BubbleBody>
      </Animated.View>
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

const styles = StyleSheet.create({
  overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 50 },
  scrim: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(20, 16, 12, 0.55)" },
  scrimFade: { position: "absolute", left: 0, right: 0, bottom: 0, height: "55%" },
  skip: { alignSelf: "flex-end", minHeight: 30, paddingHorizontal: 14, marginBottom: 10 },
  skipText: { fontSize: 12 },
  guinea: { position: "absolute", left: 4, bottom: 26, width: SPRITE_SIZE, height: SPRITE_SIZE, alignItems: "center" },
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
  bubbleWrap: { position: "absolute", left: 70, right: 12, bottom: SPRITE_SIZE + 4 },
  bubble: { paddingTop: 16, paddingLeft: 20, paddingRight: 18, paddingBottom: 34, minHeight: 150 },
  bubbleShadow: { position: "absolute", top: 7, left: 5, right: -5, bottom: -7, opacity: 0.5, filter: "blur(3px)" },
  body: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  copy: { flex: 1 },
  speaker: { fontSize: 11, fontWeight: "900", fontFamily: fonts.bold, color: colors.red, letterSpacing: 0.5 },
  line: { marginTop: 5, fontSize: 14, lineHeight: 22, fontWeight: "700", fontFamily: fonts.bold, color: colors.ink },
  emphasis: { color: colors.red },
  iconSlot: { width: 54, height: 54, alignItems: "center", justifyContent: "center", marginTop: 4 },
  icon: { width: 38, height: 38 },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 10, minHeight: 32 },
  dots: { flexDirection: "row", gap: 5 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#d9c49e" },
  dotActive: { width: 16, backgroundColor: colors.gold },
  hint: { fontSize: 11, fontWeight: "800", fontFamily: fonts.bold, color: colors.muted },
  start: { minHeight: 34, paddingHorizontal: 18 },
  startText: { fontSize: 13 },
});
