import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSequence, withTiming } from "react-native-reanimated";
import { colors, fonts } from "../theme";
import { kit } from "../assets";
import { Panel } from "../components/NineSlice";
import { PageHeading } from "../components/PageHeading";
import { GameButton } from "../components/GameButton";
import { SkillIcon } from "../components/SkillIcon";
import { SKILLS, type SkillId } from "../state/skills";
import { formatDuration } from "../state/buffs";
import { isSkillUnlocked, SKILL_UNLOCK_LEVEL } from "../state/unlocks";
import { LockBadge } from "../components/LockBadge";

// Every skill, with one equip slot between them — equipping a skill swaps out the last one.
export function SkillsScreen({
  equippedSkill,
  level,
  onEquip,
  swapReadyAt,
  now,
}: {
  equippedSkill: SkillId | null;
  level: number;
  onEquip: (id: SkillId | null) => void;
  swapReadyAt: number;
  now: number;
}) {
  const swapLockLeftMs = Math.max(0, swapReadyAt - now);
  return (
    <View style={styles.page}>
      <PageHeading
        kicker="SKILLS"
        title="기니의 스킬"
        description="스킬은 하나만 장착할 수 있어요. 스킬을 쓰거나 패시브를 장착하면 3분 동안 바꿀 수 없어요."
      />
      <View style={styles.list}>
        {[...SKILLS].sort((a, b) => SKILL_UNLOCK_LEVEL[a.id] - SKILL_UNLOCK_LEVEL[b.id]).map((skill) => {
          const equipped = skill.id === equippedSkill;
          const locked = swapLockLeftMs > 0;
          const unlockLevel = SKILL_UNLOCK_LEVEL[skill.id];
          const sealed = !equipped && !isSkillUnlocked(skill.id, level);
          return (
            <Panel slice={equipped ? kit.panel : kit.inset} style={styles.card} key={skill.id}>
              <View>
                <EquipSlam equipped={equipped}>
                  <View style={sealed && styles.dimmed}>
                    <SkillIcon id={skill.id} height={50} />
                  </View>
                </EquipSlam>
                {sealed && <LockBadge />}
              </View>
              <View style={styles.cardCopy}>
                <Text style={[styles.cardSmall, sealed && styles.cardSmallLocked]}>
                  {equipped ? "장착 중" : sealed ? `Lv.${unlockLevel}에 해금` : skill.passive ? "패시브" : `쿨타임 ${skill.cooldownMs / 60000}분`}
                </Text>
                <Text style={styles.cardStrong}>{skill.name}</Text>
                <Text style={styles.cardSpan}>{skill.description}</Text>
              </View>
              <GameButton
                variant={sealed || locked ? "gray" : equipped ? "green" : "beige"}
                disabled={sealed || locked}
                onPress={() => onEquip(equipped ? null : skill.id)}
                style={styles.equipButton}
                textStyle={styles.equipButtonText}
              >
                {sealed ? `Lv.${unlockLevel}` : locked ? formatDuration(swapLockLeftMs) : equipped ? "해제" : "장착"}
              </GameButton>
            </Panel>
          );
        })}
      </View>
    </View>
  );
}

// Equipping a skill here: its icon drops in big and thumps down inside a gold ring burst.
function EquipSlam({ equipped, children }: { equipped: boolean; children: React.ReactNode }) {
  const [equippedOnArrival] = useState(equipped);
  const slam = useSharedValue(1);
  const ring = useSharedValue(0);
  useEffect(() => {
    if (!equipped || equippedOnArrival) return;
    slam.value = withSequence(withTiming(1.5, { duration: 0 }), withTiming(0.9, { duration: 170, easing: Easing.in(Easing.quad) }), withTiming(1, { duration: 120 }));
    ring.value = withSequence(withTiming(0, { duration: 150 }), withTiming(1, { duration: 450, easing: Easing.out(Easing.quad) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [equipped]);
  const slamStyle = useAnimatedStyle(() => ({ transform: [{ scale: slam.value }] }));
  const ringStyle = useAnimatedStyle(() => ({ opacity: ring.value > 0 ? 1 - ring.value : 0, transform: [{ scale: 0.6 + ring.value * 0.9 }] }));
  return (
    <View>
      <Animated.View style={[styles.ring, ringStyle]} pointerEvents="none" />
      <Animated.View style={slamStyle}>{children}</Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  ring: { position: "absolute", top: -6, left: -6, right: -6, bottom: -6, borderRadius: 40, borderWidth: 4, borderColor: colors.gold },
  page: { backgroundColor: "#e8dcc4", paddingHorizontal: 12, paddingTop: 18, paddingBottom: 25 },
  list: { gap: 8 },
  card: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 12, flexDirection: "row", alignItems: "center", gap: 10 },
  dimmed: { opacity: 0.35 },
  cardSmallLocked: { color: colors.red },
  cardCopy: { flex: 1 },
  cardSmall: { color: colors.green, fontSize: 8, fontWeight: "900", fontFamily: fonts.bold },
  cardStrong: { marginVertical: 2, fontSize: 13, fontWeight: "800", fontFamily: fonts.bold, color: colors.ink },
  cardSpan: { color: colors.muted, fontSize: 9 },
  equipButton: { minWidth: 56 },
  equipButtonText: { fontSize: 9 },
});
