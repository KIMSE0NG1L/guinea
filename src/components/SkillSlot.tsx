import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { kit } from "../assets";
import { getSkill, type SkillId, type SkillTimers } from "../state/skills";
import { formatDuration } from "../state/buffs";
import { NineSlice } from "./NineSlice";
import { SkillIcon } from "./SkillIcon";
import { StrokedText } from "./StrokedText";

export const SKILL_SLOT_HEIGHT = 44;

// The battle scene's single skill slot. Empty → "+" that opens the skill page. Active skill
// → tap to cast; darkened with seconds left while cooling down, gold ring while its buff
// runs. Passive skill → always on, tapping opens the skill page to swap it.
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
  if (!skillId) {
    return (
      <Pressable
        onPress={onOpenSkills}
        accessibilityRole="button"
        accessibilityLabel="스킬 장착하러 가기"
        hitSlop={6}
        style={({ pressed }) => [styles.empty, pressed && styles.pressed]}
      >
        <NineSlice slice={kit.slot} scale={0.32} />
        <Text style={styles.plus}>+</Text>
      </Pressable>
    );
  }

  const skill = getSkill(skillId);
  const cooldownLeft = Math.min(timers[skillId].readyAt - now, skill.cooldownMs);
  const activeLeft = Math.min(timers[skillId].activeUntil - now, skill.durationMs ?? 0);
  const cooling = cooldownLeft > 0;
  const running = activeLeft > 0;

  return (
    <Pressable
      onPress={skill.passive ? onOpenSkills : onCast}
      disabled={!skill.passive && !canCast}
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
      {skill.passive && (
        <View style={styles.passiveTag} pointerEvents="none">
          <Text style={styles.passiveText}>상시</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  slot: { height: SKILL_SLOT_HEIGHT },
  empty: { width: SKILL_SLOT_HEIGHT, height: SKILL_SLOT_HEIGHT, alignItems: "center", justifyContent: "center" },
  plus: { marginTop: -3, fontSize: 22, fontWeight: "900", fontFamily: fonts.bold, color: "#8a7458" },
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
