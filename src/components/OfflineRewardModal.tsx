import { Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { kit, icons, uiImages } from "../assets";
import { NineSlice, Panel } from "./NineSlice";
import { GameButton } from "./GameButton";
import { formatGameNumber } from "../state/gameMath";
import type { OfflineSummary } from "../state/offline";

function formatTimeAway(ms: number) {
  const totalMinutes = Math.round(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `${hours}시간 ${minutes}분`;
  return `${minutes}분`;
}

export function OfflineRewardModal({ summary, onClaim }: { summary: OfflineSummary; onClaim: () => void }) {
  return (
    <Modal visible animationType="fade" transparent onRequestClose={onClaim}>
      <Pressable style={styles.backdrop} onPress={onClaim}>
        <Pressable style={styles.panel} onPress={(event) => event.stopPropagation()}>
          <NineSlice slice={kit.panelLarge} />
          <Image source={icons.compass} style={styles.heroIcon} />
          <Text style={styles.eyebrow}>자리를 비운 동안</Text>
          <Text style={styles.title}>기니가 혼자 사냥했어요!</Text>
          <Text style={styles.timeAway}>{formatTimeAway(summary.timeAwayMs)} 동안 자동 전투</Text>

          <Panel slice={kit.panelParchment} style={styles.statRow}>
            <View style={styles.statItem}>
              <Image source={uiImages.coin} style={styles.statIcon} />
              <Text style={styles.statValue}>+{formatGameNumber(summary.goldEarned)}</Text>
              <Text style={styles.statLabel}>골드</Text>
            </View>
            <View style={styles.statItem}>
              <Image source={icons.scroll} style={styles.statIcon} />
              <Text style={styles.statValue}>{formatGameNumber(summary.mobsKilled)}마리</Text>
              <Text style={styles.statLabel}>처치</Text>
            </View>
            {summary.levelsGained > 0 && (
              <View style={styles.statItem}>
                <Image source={icons.star} style={styles.statIcon} />
                <Text style={styles.statValue}>+{summary.levelsGained}</Text>
                <Text style={styles.statLabel}>레벨업</Text>
              </View>
            )}
          </Panel>

          {summary.bossReady && <Text style={styles.bossNote}>보스가 기다리고 있어요 — 직접 잡으러 가볼까요?</Text>}

          <GameButton variant="green" onPress={onClaim} style={styles.claimButton}>받기</GameButton>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    padding: 22,
    paddingHorizontal: 14,
    justifyContent: "center",
    backgroundColor: "#263024cf",
  },
  panel: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 18,
    alignItems: "center",
  },
  heroIcon: { width: 44, height: 44, marginBottom: 6 },
  eyebrow: { color: colors.green, fontWeight: "800", fontFamily: fonts.bold, fontSize: 9, letterSpacing: 1.5 },
  title: { marginTop: 2, fontSize: 18, fontWeight: "800", fontFamily: fonts.bold, color: colors.ink, textAlign: "center" },
  timeAway: { marginTop: 4, fontSize: 10, color: colors.brown },
  statRow: {
    marginTop: 16,
    width: "100%",
    paddingVertical: 14,
    paddingHorizontal: 10,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: { alignItems: "center", gap: 2 },
  statIcon: { width: 26, height: 26, marginBottom: 2 },
  statValue: { fontSize: 13, fontWeight: "900", fontFamily: fonts.bold, color: colors.ink },
  statLabel: { fontSize: 8, color: colors.muted, fontWeight: "700", fontFamily: fonts.bold },
  bossNote: { marginTop: 12, fontSize: 10, fontWeight: "700", fontFamily: fonts.bold, color: colors.red, textAlign: "center" },
  claimButton: { marginTop: 16, minWidth: 140 },
});
