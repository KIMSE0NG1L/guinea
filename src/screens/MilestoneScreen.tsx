import { Image, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { frameImages, icons, kit } from "../assets";
import { PageHeading } from "../components/PageHeading";
import { GameButton } from "../components/GameButton";
import { Panel } from "../components/NineSlice";
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
              <Panel slice={unlocked ? kit.panel : kit.inset} style={styles.card}>
                <View style={[styles.badge, !unlocked && styles.badgeLocked]}>
                  <Image source={current ? frameImages.ringGold : frameImages.ringWood} style={styles.badgeRing} />
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
                  <GameButton variant="green" style={styles.moveButton} textStyle={styles.moveButtonText} onPress={onBack}>
                    진행 중
                  </GameButton>
                ) : unlocked ? (
                  <GameButton variant="beige" style={styles.moveButton} textStyle={styles.moveButtonText} onPress={() => onSelectStage(index)}>
                    이동
                  </GameButton>
                ) : (
                  <Image source={icons.key} style={styles.lockIcon} accessibilityLabel="잠김" />
                )}
              </Panel>
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
    paddingHorizontal: 13,
    paddingTop: 11,
    paddingBottom: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  badge: {
    width: 54,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeRing: { position: "absolute", width: 54, height: 54 },
  badgeLocked: { opacity: 0.5 },
  badgeText: { color: "#71491b", fontSize: 15, fontWeight: "900", fontFamily: fonts.bold },
  badgeTextCurrent: { color: colors.red },
  cardCopy: { flex: 1 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  cardStrong: { marginVertical: 2, fontSize: 14, fontWeight: "800", fontFamily: fonts.bold, color: colors.ink },
  cardSpan: { color: colors.muted, fontSize: 9 },
  statusIcon: { width: 16, height: 16 },
  lockIcon: { width: 34, height: 34, marginRight: 18, opacity: 0.6 },
  moveButton: { minWidth: 70 },
  moveButtonText: { fontSize: 10 },
  // Dashed trail between stage cards, lined up under the round stage badge.
  path: { width: 0, height: 22, marginLeft: 38, borderLeftWidth: 4, borderColor: colors.gold, borderStyle: "dashed" },
  pathLocked: { borderColor: "#b6a78e" },
});
