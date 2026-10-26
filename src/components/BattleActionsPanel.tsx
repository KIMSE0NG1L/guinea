import type { ReactNode } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
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
  // useAutoBattle's isAutoBattle), so this is just a status badge now.
  return (
    <View style={styles.wrap}>
      {left}
      <View style={styles.spacer} />
      <View style={[styles.autoToggle, styles.autoBadge, isAutoBattle ? styles.autoBadgeOn : styles.autoBadgeOff]}>
        <Image source={isAutoBattle ? icons.energy : uiImages.swords} style={styles.autoIcon} />
        <Text style={styles.autoToggleText}>
          {autoLocked ? "자동 전투 고정" : isAutoBattle ? "자동 전투 중" : "난타 중 · 직접 공격"}
        </Text>
      </View>

      <GameButton
        variant={speedBoostActive ? "gray" : "beige"}
        disabled={speedBoostActive}
        onPress={onWatchAd}
        style={styles.adButton}
      >
        <View>
          <Text style={styles.adButtonText}>{speedBoostActive ? "2배속 중" : "광고 보고 2배속"}</Text>
          <Text style={styles.adButtonSmall}>{speedBoostActive ? `${formatDuration(speedBoostRemainingMs)} 남음` : "전투 속도 2배"}</Text>
        </View>
      </GameButton>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 8, marginBottom: 2, marginHorizontal: 10, flexDirection: "row", alignItems: "center", gap: 6 },
  spacer: { flex: 1 },
  autoToggle: { minHeight: 32, paddingHorizontal: 10, flexDirection: "row", justifyContent: "center" },
  autoBadge: { borderRadius: 10, alignItems: "center", gap: 5 },
  autoBadgeOn: { backgroundColor: "#8fc45b" },
  autoBadgeOff: { backgroundColor: "#d9a441" },
  autoIcon: { width: 16, height: 16 },
  autoToggleText: { fontSize: 9, fontWeight: "900", fontFamily: fonts.bold, color: "#2a2316" },
  adButton: { minHeight: 32, paddingHorizontal: 10 },
  adButtonText: { color: "#4f463c", fontSize: 9, fontWeight: "900", fontFamily: fonts.bold, textAlign: "center" },
  adButtonSmall: { marginTop: 1, fontSize: 7, textAlign: "center", color: "#4f463c" },
});
