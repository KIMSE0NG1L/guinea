import { useCallback, useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { colors, fonts } from "../theme";
import { frameImages } from "../assets";
import { StrokedText } from "./StrokedText";
import { BUFFS, DISH_PARTNERS, describeEffect, formatDuration, getActiveSet, PARTNER_MULTIPLIER, runningSlots, type BuffSlot } from "../state/buffs";
import { InfoBubble } from "./InfoBubble";
import { tutorialRef } from "./tutorialTargets";
import { RECIPES } from "../state/recipes";
import type { Outfit } from "../types";

export const BUFF_SLOT_SIZE = 44;

// Clock-style cooldown: a dark wedge for the time already spent, swept clockwise from
// 12 o'clock. The radius overshoots the square so the wedge reaches its corners too —
// the slot's rounded, overflow-hidden frame trims it.
function ElapsedWedge({ fraction }: { fraction: number }) {
  const size = BUFF_SLOT_SIZE - SLOT_BORDER * 2; // drawn inside the slot's border
  const c = size / 2;
  const r = size;
  if (fraction <= 0) return null;
  const angle = Math.min(fraction, 1) * Math.PI * 2;
  const x = c + r * Math.sin(angle);
  const y = c - r * Math.cos(angle);
  return (
    <Svg width={size} height={size} style={StyleSheet.absoluteFill} pointerEvents="none">
      {fraction >= 1 ? (
        <Rect width={size} height={size} fill={WEDGE_COLOR} />
      ) : (
        <Path d={`M ${c} ${c} L ${c} ${c - r} A ${r} ${r} 0 ${angle > Math.PI ? 1 : 0} 1 ${x} ${y} Z`} fill={WEDGE_COLOR} />
      )}
    </Svg>
  );
}

const WEDGE_COLOR = "#1c120bA6";
const SLOT_BORDER = 2;

// Three food slots: "+" when empty, otherwise the dish on its tint with a clock-style
// wedge for time already spent and a live countdown in the middle. Tapping a running slot
// toggles a black info bubble summarising its buff.
export function BuffSlots({
  slots,
  now,
  outfit,
  onPressSlot,
  style,
}: {
  slots: BuffSlot[];
  now: number;
  outfit: Outfit;
  onPressSlot: (index: number) => void;
  style?: object;
}) {
  const [infoIndex, setInfoIndex] = useState<number | null>(null);
  const closeInfo = useCallback(() => setInfoIndex(null), []);
  const activeSet = getActiveSet(slots, now);
  // When the set came together: the moment its last dish went in.
  const setSince = activeSet ? Math.max(...runningSlots(slots, now).map((slot) => slot.expiresAt - slot.durationMs)) : 0;
  const setJustFormed = activeSet && now - setSince < 2500;
  return (
    <View style={[styles.row, style]}>
      {setJustFormed && <SetFormed key={setSince} name={activeSet.name} />}
      {slots.map((slot, index) => {
        const running = slot && slot.expiresAt > now ? slot : null;
        const recipe = running ? RECIPES.find((item) => item.id === running.recipeId) : undefined;
        const buff = running ? BUFFS[running.recipeId] : undefined;
        const remaining = running ? running.expiresAt - now : 0;
        const elapsed = running ? 1 - remaining / running.durationMs : 0;
        return (
          <Pressable
            key={index}
            ref={tutorialRef(`buff-slot-${index}`)}
            onPress={() => (running ? setInfoIndex((current) => (current === index ? null : index)) : onPressSlot(index))}
            accessibilityRole="button"
            accessibilityLabel={running && recipe ? `${recipe.name} 버프 ${formatDuration(remaining)} 남음` : `음식 슬롯 ${index + 1}에 음식 넣기`}
            hitSlop={4}
            style={({ pressed }) => [styles.slot, pressed && styles.pressed]}
          >
            {running && recipe && buff ? (
              <SlotPulse key={`${running.recipeId}-${running.expiresAt}`} fresh={now - (running.expiresAt - running.durationMs) < 1500} ending={remaining < 10_000}>
              <View style={[styles.active, { backgroundColor: buff.tint }, activeSet && styles.activeSet]}>
                <Image source={recipe.image} style={styles.dish} />
                <ElapsedWedge fraction={elapsed} />
                <View style={styles.timer}>
                  <StrokedText style={styles.timerText} strokeColor={colors.line} strokeWidth={1}>
                    {formatDuration(remaining)}
                  </StrokedText>
                </View>
              </View>
              </SlotPulse>
            ) : (
              <>
                <Image source={frameImages.slotPlus} style={styles.slotArt} />
                {/* Just ran out: a puff where the dish was. */}
                {slot && now - slot.expiresAt < 1200 && <Poof key={slot.expiresAt} />}
              </>
            )}
            {running && recipe && buff && infoIndex === index && (
              <InfoBubble
                title={recipe.name}
                lines={[
                  ...describeEffect(buff.effect).split(" · "),
                  ...(DISH_PARTNERS[running.recipeId] === outfit ? [`동료 궁합 ×${PARTNER_MULTIPLIER}`] : []),
                  ...(activeSet ? [`${activeSet.name} 세트: ${describeEffect(activeSet.bonus)}`] : []),
                  `${formatDuration(remaining)} 남음`,
                ]}
                anchorWidth={BUFF_SLOT_SIZE}
                onClose={closeInfo}
              />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

// Wraps a running slot: slams in with a glow when just eaten, and blinks in its last
// 10 seconds.
function SlotPulse({ fresh, ending, children }: { fresh: boolean; ending: boolean; children: React.ReactNode }) {
  const slam = useSharedValue(fresh ? 1.6 : 1);
  const glow = useSharedValue(fresh ? 1 : 0);
  const blink = useSharedValue(1);
  useEffect(() => {
    if (!fresh) return;
    slam.value = withSequence(withTiming(0.88, { duration: 160, easing: Easing.in(Easing.quad) }), withTiming(1, { duration: 140 }));
    glow.value = withTiming(0, { duration: 700 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    blink.value = ending ? withRepeat(withSequence(withTiming(0.35, { duration: 260 }), withTiming(1, { duration: 260 })), -1) : withTiming(1, { duration: 100 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ending]);
  const style = useAnimatedStyle(() => ({ opacity: blink.value, transform: [{ scale: slam.value }] }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value * 0.85, transform: [{ scale: 1 + (1 - glow.value) * 0.6 }] }));
  return (
    <Animated.View style={[styles.fill, style]}>
      <Animated.View style={[styles.glow, glowStyle]} pointerEvents="none" />
      {children}
    </Animated.View>
  );
}

// A little grey puff where a dish just ran out.
function Poof() {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: (1 - t.value) * 0.8, transform: [{ scale: 0.5 + t.value * 0.9 }] }));
  return <Animated.View style={[styles.poof, style]} pointerEvents="none" />;
}

// All three slots from one set: a gold light sweeps across them and the set's name pops
// up below.
function SetFormed({ name }: { name: string }) {
  const sweep = useSharedValue(0);
  const pop = useSharedValue(0);
  useEffect(() => {
    sweep.value = withTiming(1, { duration: 700, easing: Easing.inOut(Easing.quad) });
    pop.value = withSequence(withTiming(1.15, { duration: 200, easing: Easing.out(Easing.back(2)) }), withTiming(1, { duration: 150 }), withTiming(1, { duration: 1500 }), withTiming(0, { duration: 300 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const sweepStyle = useAnimatedStyle(() => ({ left: `${-30 + sweep.value * 130}%`, opacity: sweep.value < 1 ? 0.7 : 0 }));
  const bannerStyle = useAnimatedStyle(() => ({ opacity: Math.min(1, pop.value), transform: [{ scale: pop.value }] }));
  return (
    <>
      <Animated.View style={[styles.sweep, sweepStyle]} pointerEvents="none" />
      <Animated.View style={[styles.setBanner, bannerStyle]} pointerEvents="none">
        <StrokedText style={styles.setBannerText} strokeColor={colors.line} strokeWidth={1.5}>
          {`${name}!`}
        </StrokedText>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 5 },
  slot: { width: BUFF_SLOT_SIZE, height: BUFF_SLOT_SIZE, alignItems: "center", justifyContent: "center" },
  pressed: { transform: [{ scale: 0.92 }] },
  slotArt: { width: "100%", height: "100%" },
  active: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: SLOT_BORDER,
    borderColor: colors.line,
    borderRadius: 9,
  },
  activeSet: { borderColor: colors.gold },
  fill: { width: "100%", height: "100%" },
  glow: { position: "absolute", top: -6, left: -6, right: -6, bottom: -6, borderRadius: 14, backgroundColor: "#fff3b0" },
  poof: { position: "absolute", width: BUFF_SLOT_SIZE - 8, height: BUFF_SLOT_SIZE - 8, borderRadius: BUFF_SLOT_SIZE, backgroundColor: "#d8d2c4" },
  sweep: { position: "absolute", top: -2, bottom: -2, width: "30%", backgroundColor: "#ffe680", transform: [{ skewX: "-20deg" }], zIndex: 2 },
  setBanner: {
    position: "absolute",
    top: BUFF_SLOT_SIZE + 4,
    left: 0,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.gold,
    zIndex: 3,
  },
  setBannerText: { fontSize: 11, fontWeight: "900", fontFamily: fonts.bold, color: colors.cream },
  dish: { width: BUFF_SLOT_SIZE - 6, height: BUFF_SLOT_SIZE - 6 },
  timer: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" },
  timerText: { fontSize: 11, fontWeight: "900", fontFamily: fonts.bold, color: colors.cream },
});
