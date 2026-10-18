import { useCallback, useEffect, useState } from "react";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSequence, withTiming } from "react-native-reanimated";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { frameImages } from "../assets";
import { getSkill, SKILL_SUMMARY, type SkillId, type SkillTimers } from "../state/skills";
import { InfoBubble } from "./InfoBubble";
import { formatDuration } from "../state/buffs";
import { SkillIcon } from "./SkillIcon";
import { StrokedText } from "./StrokedText";

export const SKILL_SLOT_HEIGHT = 44;

// The battle scene's single skill slot. Empty → "+" that opens the skill page. Active skill
// → tap to cast; darkened with seconds left while cooling down, gold ring while its buff
// runs. While a skill is in effect (its buff running, or a passive that's always on),
// tapping toggles a black info bubble summarising it instead.
export function SkillSlot({
  skillId,
  timers,
  now,
  canCast,
  onCast,
  onOpenSkills,
}: {
  skillId: SkillId | null;
  timers: SkillTimers;
  now: number;
  canCast: boolean;
  onCast: () => void;
  onOpenSkills: () => void;
}) {
  const [info, setInfo] = useState(false);
  const closeInfo = useCallback(() => setInfo(false), []);
  if (!skillId) {
    return (
      <Pressable
        onPress={onOpenSkills}
        accessibilityRole="button"
        accessibilityLabel="스킬 장착하러 가기"
        hitSlop={6}
        style={({ pressed }) => [styles.empty, pressed && styles.pressed]}
      >
        <Image source={frameImages.slotPlus} style={styles.slotArt} />
      </Pressable>
    );
  }

  const skill = getSkill(skillId);
  const cooldownLeft = Math.min(timers[skillId].readyAt - now, skill.cooldownMs);
  const activeLeft = Math.min(timers[skillId].activeUntil - now, skill.durationMs ?? 0);
  const cooling = cooldownLeft > 0;
  const running = activeLeft > 0;
  const inEffect = skill.passive || running;

  return (
    <Pressable
      onPress={inEffect ? () => setInfo((current) => !current) : onCast}
      disabled={!inEffect && !canCast}
      accessibilityRole="button"
      accessibilityLabel={
        skill.passive
          ? `${skill.name} 상시 적용 중`
          : cooling
            ? `${skill.name} 재사용 ${Math.ceil(cooldownLeft / 1000)}초 남음`
            : `${skill.name} 사용`
      }
      hitSlop={6}
      style={({ pressed }) => [styles.slot, pressed && styles.pressed]}
    >
      <SkillIcon id={skillId} height={SKILL_SLOT_HEIGHT} />
      {running ? (
        <View style={[styles.overlay, styles.running]} pointerEvents="none">
          <StrokedText style={styles.seconds} strokeColor={colors.line} strokeWidth={1}>
            {Math.ceil(activeLeft / 1000)}
          </StrokedText>
        </View>
      ) : cooling ? (
        <View style={[styles.overlay, styles.cooling]} pointerEvents="none">
          <StrokedText style={styles.seconds} strokeColor={colors.line} strokeWidth={1}>
            {formatDuration(cooldownLeft)}
          </StrokedText>
        </View>
      ) : null}
      {/* Cooldown just ran out: a flash and "준비!" (keyed so each one plays once). */}
      {!skill.passive && !cooling && timers[skillId].readyAt > 0 && now - timers[skillId].readyAt < 1500 && (
        <ReadyFlash key={timers[skillId].readyAt} />
      )}
      {skill.passive && (
        <View style={styles.passiveTag} pointerEvents="none">
          <Text style={styles.passiveText}>상시</Text>
        </View>
      )}
      {info && inEffect && (
        <InfoBubble
          title={skill.name}
          lines={[SKILL_SUMMARY[skillId], skill.passive ? "장착 중 상시 적용" : `${Math.ceil(activeLeft / 1000)}초 남음`]}
          anchorWidth={SKILL_SLOT_HEIGHT}
          onClose={closeInfo}
        />
      )}
    </Pressable>
  );
}

function ReadyFlash() {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withSequence(withTiming(1, { duration: 140, easing: Easing.out(Easing.quad) }), withTiming(0, { duration: 900 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const flashStyle = useAnimatedStyle(() => ({ opacity: t.value * 0.85 }));
  const textStyle = useAnimatedStyle(() => ({ opacity: Math.min(1, t.value * 2), transform: [{ translateY: -(1 - t.value) * 10 }, { scale: 0.8 + t.value * 0.3 }] }));
  return (
    <>
      <Animated.View style={[styles.overlay, styles.readyFlash, flashStyle]} pointerEvents="none" />
      <Animated.View style={[styles.readyLabel, textStyle]} pointerEvents="none">
        <StrokedText style={styles.readyText} strokeColor={colors.line} strokeWidth={1.5}>
          준비!
        </StrokedText>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  readyFlash: { backgroundColor: "#fff3b0" },
  readyLabel: { position: "absolute", top: -18, left: -10, right: -10, alignItems: "center" },
  readyText: { fontSize: 11, fontWeight: "900", fontFamily: fonts.bold, color: colors.gold },
  slot: { height: SKILL_SLOT_HEIGHT },
  empty: { width: SKILL_SLOT_HEIGHT, height: SKILL_SLOT_HEIGHT, alignItems: "center", justifyContent: "center" },
  slotArt: { width: "100%", height: "100%" },
  pressed: { transform: [{ scale: 0.92 }] },
  overlay: {
    position: "absolute",
    top: 1,
    left: 1,
    right: 1,
    bottom: 1,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  cooling: { backgroundColor: "#1c120bA6" },
  running: { borderWidth: 2, borderColor: colors.gold },
  seconds: { fontSize: 13, fontWeight: "900", fontFamily: fonts.bold, color: colors.cream },
  passiveTag: {
    position: "absolute",
    right: -4,
    bottom: -4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.gold,
  },
  passiveText: { fontSize: 8, fontWeight: "900", fontFamily: fonts.bold, color: colors.ink },
});
