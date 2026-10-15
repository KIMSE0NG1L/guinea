import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { fonts } from "../theme";
import { GameButton } from "./GameButton";
import { formatDuration } from "../state/buffs";

export function BattleActionsPanel({
  isAutoBattle,
  onToggleAuto,
  speedBoostActive,
  speedBoostRemainingMs,
  onWatchAd,
  left,
}: {
  isAutoBattle: boolean;
  onToggleAuto: () => void;
  speedBoostActive: boolean;
  speedBoostRemainingMs: number;
  onWatchAd: () => void;
  left?: ReactNode; // pinned to the row's left end (the food buff slots)
}) {

  return (
    <View style={styles.wrap}>
      {left}
      <View style={styles.spacer} />
      <GameButton
        onPress={onToggleAuto}
        accessibilityLabel={`자동 전투 ${isAutoBattle ? "끄기" : "켜기"}`}
        variant={isAutoBattle ? "green" : "gray"}
        style={styles.autoToggle}
        textStyle={styles.autoToggleText}
      >
        {`자동 전투 ${isAutoBattle ? "ON" : "OFF"}`}
      </GameButton>

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
  autoToggle: { minHeight: 32, paddingHorizontal: 10, justifyContent: "center" },
  autoToggleText: { fontSize: 9 },
  adButton: { minHeight: 32, paddingHorizontal: 10 },
  adButtonText: { color: "#4f463c", fontSize: 9, fontWeight: "900", fontFamily: fonts.bold, textAlign: "center" },
  adButtonSmall: { marginTop: 1, fontSize: 7, textAlign: "center", color: "#4f463c" },
});
