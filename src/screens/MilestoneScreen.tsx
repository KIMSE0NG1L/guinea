import { Image, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { icons } from "../assets";
import { PageHeading } from "../components/PageHeading";
import { GameButton } from "../components/GameButton";
import { BOSS_NAME, ENEMY_NAME, getStageCode, STAGES } from "../state/stages";

export function MilestoneScreen({
  stageNumber,
  highestStageNumber,
  onSelectStage,
  onBack,
}: {
  stageNumber: number;
  highestStageNumber: number;
  onSelectStage: (stageNumber: number) => void;
  onBack: () => void;
}) {
  return (
    <View style={styles.page}>
      <PageHeading kicker="MILESTONE" title="모험 지도" description="보스를 쓰러뜨리면 다음 스테이지가 열려요." />
      <View style={styles.list}>
        {STAGES.map((stage, index) => {
          const current = index === stageNumber;
          const unlocked = index <= highestStageNumber;
          const cleared = index < highestStageNumber;
          const isLast = index === STAGES.length - 1;
          return (
            <View key={stage.area}>
              <View style={[styles.card, current && styles.cardCurrent, !unlocked && styles.cardLocked]}>
                <View style={[styles.badge, current && styles.badgeCurrent, !unlocked && styles.badgeLocked]}>
                  <Text style={[styles.badgeText, current && styles.badgeTextCurrent]}>{getStageCode(index)}</Text>
                </View>
                <View style={styles.cardCopy}>
                  <View style={styles.titleRow}>
                    <Text style={styles.cardStrong}>{stage.area}</Text>
                    {cleared && <Image source={icons.star} style={styles.statusIcon} />}
                  </View>
                  <Text style={styles.cardSpan}>
                    {unlocked ? `${ENEMY_NAME[stage.enemyKind]} · 보스 ${BOSS_NAME[stage.enemyKind]}` : "이전 스테이지 보스를 처치하세요"}
                  </Text>
                </View>
                {current ? (
                  <GameButton style={[styles.moveButton, styles.moveButtonCurrent]} textStyle={styles.moveButtonTextCurrent} onPress={onBack}>
                    진행 중
                  </GameButton>
                ) : unlocked ? (
                  <GameButton style={styles.moveButton} textStyle={styles.moveButtonText} onPress={() => onSelectStage(index)}>
                    이동
                  </GameButton>
                ) : (
                  <Image source={icons.key} style={styles.lockIcon} accessibilityLabel="잠김" />
                )}
              </View>
              {!isLast && <View style={[styles.path, index >= highestStageNumber && styles.pathLocked]} />}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: "#e8dcc4", paddingHorizontal: 12, paddingTop: 18, paddingBottom: 25 },
  list: {},
  card: {
    padding: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    backgroundColor: colors.cream,
    borderWidth: 3,
    borderColor: colors.line,
    borderRadius: 13,
  },
  cardCurrent: { backgroundColor: "#eef0d8", borderColor: colors.greenDark },
  cardLocked: { backgroundColor: "#ddd1b8", borderColor: "#9f927e" },
  badge: {
    width: 54,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gold,
    borderWidth: 3,
    borderColor: colors.line,
    borderRadius: 27,
  },
  badgeCurrent: { backgroundColor: colors.green, borderColor: colors.greenDark },
  badgeLocked: { backgroundColor: "#c8bba3", borderColor: "#9f927e" },
  badgeText: { color: "#71491b", fontSize: 15, fontWeight: "900", fontFamily: fonts.bold },
  badgeTextCurrent: { color: colors.cream },
  cardCopy: { flex: 1 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  cardStrong: { marginVertical: 2, fontSize: 14, fontWeight: "800", fontFamily: fonts.bold, color: colors.ink },
  cardSpan: { color: colors.muted, fontSize: 9 },
  statusIcon: { width: 16, height: 16 },
  lockIcon: { width: 34, height: 34, marginRight: 18, opacity: 0.6 },
  moveButton: { minWidth: 70, paddingVertical: 7, backgroundColor: "#dbc99e" },
  moveButtonText: { fontSize: 10 },
  moveButtonCurrent: { backgroundColor: colors.green },
  moveButtonTextCurrent: { fontSize: 10, color: colors.cream },
  // Dashed trail between stage cards, lined up under the round stage badge.
  path: { width: 0, height: 22, marginLeft: 38, borderLeftWidth: 4, borderColor: colors.gold, borderStyle: "dashed" },
  pathLocked: { borderColor: "#b6a78e" },
});
