import { StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { GameButton } from "./GameButton";

export function StageHeader({
  level,
  experience,
  onBoss,
}: {
  level: number;
  experience: number;
  onBoss: () => void;
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.copy}>
        <Text style={styles.level}>LEVEL</Text>
        <Text style={styles.levelValue}>Lv. {level}</Text>
      </View>
      <View style={styles.progress}>
        <View style={styles.track}>
          <View style={[styles.trackFill, { width: `${experience}%` }]} />
        </View>
        <Text style={styles.progressLabel}>{experience} / 100</Text>
      </View>
      <GameButton onPress={onBoss} style={styles.bossButton}>보스 도전</GameButton>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: "#e5d7bb",
    borderBottomWidth: 2,
    borderBottomColor: colors.line,
  },
  copy: {},
  level: { color: colors.brown, fontWeight: "800", fontFamily: fonts.bold, fontSize: 8, letterSpacing: 2 },
  levelValue: { fontSize: 14, fontWeight: "800", fontFamily: fonts.bold, color: colors.ink },
  progress: { flex: 1, flexDirection: "row", alignItems: "center", gap: 5, minWidth: 0 },
  track: { flex: 1, height: 9, overflow: "hidden", borderWidth: 2, borderColor: colors.line, backgroundColor: colors.cream, borderRadius: 8 },
  trackFill: { height: "100%", backgroundColor: colors.gold },
  progressLabel: { fontSize: 9, color: colors.brown, fontWeight: "700", fontFamily: fonts.bold },
  bossButton: { paddingHorizontal: 10, paddingVertical: 8 },
});
