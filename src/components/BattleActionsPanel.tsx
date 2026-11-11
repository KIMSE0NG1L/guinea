import type { ReactNode } from "react";
import { Image, StyleSheet, View } from "react-native";
import { Text } from "./GameText";
import { fonts } from "../theme";
import { icons, uiImages } from "../assets";
import { GameButton } from "./GameButton";
import { formatDuration } from "../state/buffs";

export function BattleActionsPanel({
  isAutoBattle,
  autoLocked = false,
  speedBoostActive,
  speedBoostRemainingMs,
  onWatchAd,
  left,
}: {
  isAutoBattle: boolean;
  // A companion that can't fight by hand (사무라이기니) pins auto-battle on.
  autoLocked?: boolean;
  speedBoostActive: boolean;
  speedBoostRemainingMs: number;
  onWatchAd: () => void;
  left?: ReactNode; // pinned to the row's left end (the food buff slots)
}) {
  // Not a toggle any more — manual combat only opens up while 난타 is cast (see
  // useAutoBattle's isAutoBattle), so this is just a status display now, but still built
  // from the same GameButton face as every other button on this row (not a flat badge).
  return (
    <View style={styles.wrap}>
      {left}
      <View style={styles.spacer} />
      {/* Both buttons share one fixed width (ACTION_WIDTH), sized for the longest label
          either can show, and the same caption-over-label layout — so the row never shifts
          as the status text changes. */}
      <GameButton variant={isAutoBattle ? "green" : "beige"} style={styles.action} textStyle={styles.actionLabel}>
        <View style={styles.autoContent}>
          <Image source={isAutoBattle ? icons.energy : uiImages.swords} style={styles.autoIcon} />
          <View style={styles.stack}>
            <Text style={[styles.actionSmall, isAutoBattle && styles.actionSmallOnGreen]}>{isAutoBattle ? "자동 전투" : "난타 중"}</Text>
            <Text style={[styles.actionLabel, isAutoBattle && styles.actionLabelOnGreen]}>{autoLocked ? "고정" : isAutoBattle ? "진행 중" : "직접 공격"}</Text>
          </View>
        </View>
      </GameButton>

      {/* The ad clapper sits left of the text, inside the button — the same icon-then-text
          layout as the auto-battle button beside it. */}
      <GameButton variant={speedBoostActive ? "gray" : "beige"} disabled={speedBoostActive} onPress={onWatchAd} style={styles.action}>
        <View style={styles.autoContent}>
          {!speedBoostActive && <Image source={uiImages.adClapper} style={styles.adIcon} />}
          <View style={styles.stack}>
            <Text style={styles.actionSmall}>{speedBoostActive ? "2배속 중" : "광고 보고"}</Text>
            <Text style={styles.actionLabel}>{speedBoostActive ? formatDuration(speedBoostRemainingMs) : "2배속"}</Text>
          </View>
        </View>
      </GameButton>
    </View>
  );
}

// Fits "직접 공격" beside its icon (the longest label either button shows) with padding.
const ACTION_WIDTH = 104;

const styles = StyleSheet.create({
  wrap: { marginTop: 8, marginBottom: 2, marginHorizontal: 10, flexDirection: "row", alignItems: "center", gap: 6 },
  spacer: { flex: 1 },
  action: { width: ACTION_WIDTH, minHeight: 50, paddingHorizontal: 8 },
  autoContent: { flexDirection: "row", alignItems: "center", gap: 4 },
  autoIcon: { width: 16, height: 16 },
  // Clapper art is 219x256.
  adIcon: { width: 22, height: 26, resizeMode: "contain" },
  stack: { alignItems: "center" },
  actionSmall: { fontSize: 12, fontWeight: "800", fontFamily: fonts.bold, color: "#4f463c" },
  actionSmallOnGreen: { color: "#2f4a16" },
  actionLabel: { fontSize: 15, fontWeight: "900", fontFamily: fonts.bold, color: "#2a2316" },
  actionLabelOnGreen: { color: "#2a2316" },
});
