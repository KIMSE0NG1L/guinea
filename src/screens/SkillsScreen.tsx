import { StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { kit } from "../assets";
import { Panel } from "../components/NineSlice";
import { PageHeading } from "../components/PageHeading";
import { GameButton } from "../components/GameButton";
import { SkillIcon } from "../components/SkillIcon";
import { SKILLS, type SkillId } from "../state/skills";
import { formatDuration } from "../state/buffs";

// Every skill, with one equip slot between them — equipping a skill swaps out the last one.
export function SkillsScreen({
  equippedSkill,
  onEquip,
  swapReadyAt,
  now,
}: {
  equippedSkill: SkillId | null;
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
        {SKILLS.map((skill) => {
          const equipped = skill.id === equippedSkill;
          const locked = swapLockLeftMs > 0;
          return (
            <Panel slice={equipped ? kit.panel : kit.inset} style={styles.card} key={skill.id}>
              <SkillIcon id={skill.id} height={50} />
              <View style={styles.cardCopy}>
                <Text style={styles.cardSmall}>
                  {equipped ? "장착 중" : skill.passive ? "패시브" : `쿨타임 ${skill.cooldownMs / 60000}분`}
                </Text>
                <Text style={styles.cardStrong}>{skill.name}</Text>
                <Text style={styles.cardSpan}>{skill.description}</Text>
              </View>
              <GameButton
                variant={locked ? "gray" : equipped ? "green" : "beige"}
                disabled={locked}
                onPress={() => onEquip(equipped ? null : skill.id)}
                style={styles.equipButton}
                textStyle={styles.equipButtonText}
              >
                {locked ? formatDuration(swapLockLeftMs) : equipped ? "해제" : "장착"}
              </GameButton>
            </Panel>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: "#e8dcc4", paddingHorizontal: 12, paddingTop: 18, paddingBottom: 25 },
  list: { gap: 8 },
  card: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 12, flexDirection: "row", alignItems: "center", gap: 10 },
  cardCopy: { flex: 1 },
  cardSmall: { color: colors.green, fontSize: 8, fontWeight: "900", fontFamily: fonts.bold },
  cardStrong: { marginVertical: 2, fontSize: 13, fontWeight: "800", fontFamily: fonts.bold, color: colors.ink },
  cardSpan: { color: colors.muted, fontSize: 9 },
  equipButton: { minWidth: 56 },
  equipButtonText: { fontSize: 9 },
});
