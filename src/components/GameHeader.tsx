import { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { kitImages, uiImages } from "../assets";
import { GameButton } from "./GameButton";
import { ResourceBar } from "./ResourceBar";
import { ConfirmModal } from "./ConfirmModal";
import { SettingsModal } from "./SettingsModal";
import type { GameState } from "../types";

export function GameHeader({
  state,
  onQuest,
  onReset,
  onSkipToBoss,
  onKillEnemy,
}: {
  state: GameState;
  onQuest: () => void;
  onReset: () => void;
  onSkipToBoss: () => void;
  onKillEnemy: () => void;
}) {
  const ready = state.quests.filter((quest) => quest.current >= quest.target && !quest.claimed).length;
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);

  return (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <View style={styles.actions}>
          <GameButton onPress={onQuest} style={styles.questButton}>
            <View style={styles.questButtonContent}>
              <Text style={styles.questButtonLabel}>퀘스트</Text>
              {ready > 0 && (
                <View style={styles.alertDot}>
                  <Image source={kitImages.dotRed} style={styles.alertDotImage} />
                  <Text style={styles.alertDotText}>{ready}</Text>
                </View>
              )}
            </View>
          </GameButton>
          <GameButton accessibilityLabel="설정" onPress={() => setSettingsOpen(true)} style={styles.iconButton}>
            <Image source={uiImages.gear} style={styles.gearIcon} />
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
      {settingsOpen && (
        <SettingsModal
          onSkipToBoss={onSkipToBoss}
          onKillEnemy={onKillEnemy}
          onResetRequest={() => {
            setSettingsOpen(false);
            setConfirmingReset(true);
          }}
          onClose={() => setSettingsOpen(false)}
        />
      )}
      {confirmingReset && (
        <ConfirmModal
          title="세이브 초기화"
          message="지금까지 쌓은 진행도가 전부 사라지고 처음부터 다시 시작해요. 정말 초기화할까요?"
          confirmLabel="초기화"
          onConfirm={() => {
            setConfirmingReset(false);
            onReset();
          }}
          onCancel={() => setConfirmingReset(false)}
        />
      )}
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
  questButton: { paddingHorizontal: 12 },
  questButtonContent: { flexDirection: "row", alignItems: "center" },
  questButtonLabel: { color: colors.ink, fontWeight: "900", fontFamily: fonts.bold, fontSize: 11 },
  alertDot: {
    position: "absolute",
    right: -11,
    top: -12,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  alertDotImage: { position: "absolute", width: 20, height: 20 },
  alertDotText: { color: "white", fontSize: 9, fontWeight: "900", fontFamily: fonts.bold },
  iconButton: { width: 38, paddingHorizontal: 0 },
  gearIcon: { width: 20, height: 20 },
  statusRow: { marginTop: 11, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  headerTitle: { flex: 1 },
  eyebrow: { color: "#d7dfab", fontWeight: "800", fontFamily: fonts.bold, fontSize: 9, letterSpacing: 1.5, marginBottom: 1 },
  h1: { fontSize: 24, fontWeight: "800", fontFamily: fonts.bold, color: colors.cream, letterSpacing: -1 },
});
