import { StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { GameButton } from "./GameButton";
import { ResourceBar } from "./ResourceBar";
import type { GameState } from "../types";

export function GameHeader({ state, onQuest }: { state: GameState; onQuest: () => void }) {
  const ready = state.quests.filter((quest) => quest.current >= quest.target && !quest.claimed).length;
  return (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <View style={styles.actions}>
          <GameButton onPress={onQuest} style={styles.questButton}>
            <View style={styles.questButtonContent}>
              <Text style={styles.questButtonLabel}>퀘스트</Text>
              {ready > 0 && (
                <View style={styles.alertDot}>
                  <Text style={styles.alertDotText}>{ready}</Text>
                </View>
              )}
            </View>
          </GameButton>
          <GameButton accessibilityLabel="설정" style={styles.iconButton}>
            <View style={styles.gearIcon} />
          </GameButton>
        </View>
      </View>
      <View style={styles.statusRow}>
        <View style={styles.headerTitle}>
          <Text style={styles.eyebrow}>배고픈 기니의 생존기</Text>
          <Text style={styles.h1}>기니 키우기</Text>
        </View>
        <ResourceBar gold={state.gold} gems={state.gems} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 14,
    paddingHorizontal: 14,
    paddingBottom: 10,
    backgroundColor: colors.greenDark,
    borderBottomWidth: 3,
    borderBottomColor: colors.line,
  },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 10 },
  actions: { flexDirection: "row", gap: 6, alignItems: "center" },
  questButton: { paddingHorizontal: 9, paddingVertical: 7 },
  questButtonContent: { flexDirection: "row", alignItems: "center" },
  questButtonLabel: { color: colors.ink, fontWeight: "900", fontFamily: fonts.bold, fontSize: 11 },
  alertDot: {
    position: "absolute",
    right: -11,
    top: -12,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.red,
    borderWidth: 2,
    borderColor: colors.line,
    borderRadius: 9,
  },
  alertDotText: { color: "white", fontSize: 9, fontWeight: "900", fontFamily: fonts.bold },
  iconButton: { width: 34, height: 32 },
  gearIcon: {
    width: 15,
    height: 15,
    borderRadius: 8,
    borderWidth: 4,
    borderColor: colors.brown,
    borderStyle: "dotted",
  },
  statusRow: { marginTop: 11, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  headerTitle: { flex: 1 },
  eyebrow: { color: "#d7dfab", fontWeight: "800", fontFamily: fonts.bold, fontSize: 9, letterSpacing: 1.5, marginBottom: 1 },
  h1: { fontSize: 24, fontWeight: "800", fontFamily: fonts.bold, color: colors.cream, letterSpacing: -1 },
});
