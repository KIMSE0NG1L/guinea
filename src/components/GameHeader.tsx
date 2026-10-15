import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { colors, fonts } from "../theme";
import { frameImages, headerKit, icons, navIcons } from "../assets";
import { Panel } from "./NineSlice";
import { ProgressBar } from "./ProgressBar";
import { getExpToLevel } from "../state/gameMath";
import { DEFAULT_NICKNAME } from "../state/initialState";
import { CHIP_WIDTH, ResourceBar } from "./ResourceBar";
import { ConfirmModal } from "./ConfirmModal";
import { SettingsModal } from "./SettingsModal";
import type { GameState } from "../types";

// The header row is laid out for the 430px app frame (406px inside its padding):
// profile 158 + two 100px chips + gear and gaps. On narrower phones everything scales
// down together so the row never overflows; the widths stay fixed regardless of values.
const FRAME_WIDTH = 430;
const HEADER_PADDING = 12;
const DESIGN_ROW = FRAME_WIDTH - HEADER_PADDING * 2;
const PROFILE_WIDTH = 158;

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
  const { width: screenWidth } = useWindowDimensions();
  const fit = Math.min(1, (Math.min(screenWidth, FRAME_WIDTH) - HEADER_PADDING * 2) / DESIGN_ROW);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);

  return (
    <View style={styles.header}>
      <View style={styles.statusRow}>
        <Panel slice={headerKit.profile} scale={0.74 * fit} style={[styles.profile, { width: PROFILE_WIDTH * fit, height: 50 * fit }]}>
          <View style={[styles.avatar, { width: 50 * fit, height: 50 * fit }]}>
            <Image source={frameImages.ringGold} style={[styles.avatarRing, { width: 50 * fit, height: 50 * fit }]} />
            <Image source={navIcons.companions} style={{ width: 36 * fit, height: 36 * fit }} />
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
          <ResourceBar gold={state.gold} gems={state.gems} onOpenShop={onOpenShop} width={Math.round(CHIP_WIDTH * fit)} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="설정"
            onPress={() => setSettingsOpen(true)}
            hitSlop={6}
            style={({ pressed }) => [styles.iconButton, { width: 36 * fit }, pressed && styles.pressed]}
          >
            <Image source={icons.settingsGear} style={[styles.headerIcon, { width: 34 * fit, height: 34 * fit }]} />
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
  // Width is set inline from PROFILE_WIDTH, scaled to the screen.
  profile: { height: 50, flexDirection: "row", alignItems: "center", paddingRight: 14, minWidth: 0 },
  // Sits over the socket baked into the pill's left end.
  avatar: { width: 50, height: 50, alignItems: "center", justifyContent: "center" },
  avatarRing: { position: "absolute", width: 50, height: 50 },
  profileCopy: { flex: 1, minWidth: 0, marginLeft: 4, gap: 2 },
  nameRow: { flexDirection: "row", alignItems: "baseline", gap: 4 },
  levelText: { fontSize: 10, fontWeight: "900", fontFamily: fonts.bold, color: colors.green },
  nickname: { flexShrink: 1, fontSize: 11, fontWeight: "900", fontFamily: fonts.bold, color: colors.ink },
});
