import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { frameImages, headerKit, icons, navIcons } from "../assets";
import { Panel } from "./NineSlice";
import { ProgressBar } from "./ProgressBar";
import { getExpToLevel } from "../state/gameMath";
import { DEFAULT_NICKNAME } from "../state/initialState";
import { ResourceBar } from "./ResourceBar";
import { ConfirmModal } from "./ConfirmModal";
import { SettingsModal } from "./SettingsModal";
import type { GameState } from "../types";

export function GameHeader({
  state,
  onReset,
  onSkipToBoss,
  onKillEnemy,
  onOpenShop,
}: {
  state: GameState;
  onReset: () => void;
  onSkipToBoss: () => void;
  onKillEnemy: () => void;
  onOpenShop: () => void;
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);

  return (
    <View style={styles.header}>
      <View style={styles.statusRow}>
        <Panel slice={headerKit.profile} scale={0.74} style={styles.profile}>
          <View style={styles.avatar}>
            <Image source={frameImages.ringGold} style={styles.avatarRing} />
            <Image source={navIcons.companions} style={styles.avatarFace} />
          </View>
          <View style={styles.profileCopy}>
            <View style={styles.nameRow}>
              <Text style={styles.levelText}>Lv.{state.level}</Text>
              <Text style={styles.nickname} numberOfLines={1}>{state.nickname ?? DEFAULT_NICKNAME}</Text>
            </View>
            <ProgressBar
              progress={(state.experience / getExpToLevel(state.level)) * 100}
              height={13}
              label={`${state.experience} / ${getExpToLevel(state.level)}`}
            />
          </View>
        </Panel>
        <View style={styles.statusRight}>
          <ResourceBar gold={state.gold} gems={state.gems} onOpenShop={onOpenShop} />
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
  header: { paddingTop: 10, paddingHorizontal: 12, paddingBottom: 8 },
  iconButton: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  pressed: { transform: [{ scale: 0.92 }] },
  headerIcon: { width: 34, height: 34 },
  statusRight: { flexDirection: "row", alignItems: "center", gap: 4 },
  statusRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 6 },
  profile: { flex: 1, height: 50, flexDirection: "row", alignItems: "center", paddingRight: 14, minWidth: 0 },
  // Sits over the socket baked into the pill's left end.
  avatar: { width: 50, height: 50, alignItems: "center", justifyContent: "center" },
  avatarRing: { position: "absolute", width: 50, height: 50 },
  avatarFace: { width: 36, height: 36 },
  profileCopy: { flex: 1, minWidth: 0, marginLeft: 4, gap: 2 },
  nameRow: { flexDirection: "row", alignItems: "baseline", gap: 4 },
  levelText: { fontSize: 10, fontWeight: "900", fontFamily: fonts.bold, color: colors.green },
  nickname: { flexShrink: 1, fontSize: 11, fontWeight: "900", fontFamily: fonts.bold, color: colors.ink },
});
