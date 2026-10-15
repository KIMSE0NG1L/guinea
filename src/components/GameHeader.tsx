import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { icons, kitImages } from "../assets";
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
  onOpenShop,
}: {
  state: GameState;
  onQuest: () => void;
  onReset: () => void;
  onSkipToBoss: () => void;
  onKillEnemy: () => void;
  onOpenShop: () => void;
}) {
  const ready = state.quests.filter((quest) => quest.current >= quest.target && !quest.claimed).length;
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);

  return (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <View style={styles.actions}>
          {/* Bare icons, no button frame — same treatment as the battle scene's bag/pot/map. */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="퀘스트"
            onPress={onQuest}
            hitSlop={6}
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          >
            <Image source={icons.questMedal} style={styles.headerIcon} />
            {ready > 0 && (
              <Image source={kitImages.dotRed} style={styles.alertDot} accessibilityLabel="받을 보상 있음" />
            )}
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="설정"
            onPress={() => setSettingsOpen(true)}
            hitSlop={6}
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          >
            <Image source={icons.settingsGear} style={styles.headerIcon} />
          </Pressable>
        </View>
      </View>
      <View style={styles.statusRow}>
        <View style={styles.headerTitle}>
          <Text style={styles.eyebrow}>배고픈 기니의 생존기</Text>
          <Text style={styles.h1}>기니 키우기</Text>
        </View>
        <ResourceBar gold={state.gold} gems={state.gems} onOpenShop={onOpenShop} />
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
  // Just a dot — whether there's something to claim, not how many.
  alertDot: { position: "absolute", right: 3, top: 2, width: 12, height: 12 },
  iconButton: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  pressed: { transform: [{ scale: 0.92 }] },
  headerIcon: { width: 34, height: 34 },
  statusRow: { marginTop: 11, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  headerTitle: { flex: 1 },
  eyebrow: { color: "#d7dfab", fontWeight: "800", fontFamily: fonts.bold, fontSize: 9, letterSpacing: 1.5, marginBottom: 1 },
  h1: { fontSize: 24, fontWeight: "800", fontFamily: fonts.bold, color: colors.cream, letterSpacing: -1 },
});
