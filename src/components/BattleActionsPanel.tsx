import { StyleSheet, Text, View } from "react-native";
import { fonts } from "../theme";
import { GameButton } from "./GameButton";

export function BattleActionsPanel({
  isAutoBattle,
  onToggleAuto,
  speedBoostActive,
  speedBoostRemainingMs,
  onWatchAd,
}: {
  isAutoBattle: boolean;
  onToggleAuto: () => void;
  speedBoostActive: boolean;
  speedBoostRemainingMs: number;
  onWatchAd: () => void;
}) {
  const remainingSeconds = Math.ceil(speedBoostRemainingMs / 1000);

  return (
    <View style={styles.wrap}>
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
          <Text style={styles.adButtonSmall}>{speedBoostActive ? `${remainingSeconds}초 남음` : "전투 속도 2배"}</Text>
        </View>
      </GameButton>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { margin: 10, flexDirection: "row", gap: 8, alignItems: "stretch" },
  autoToggle: { flex: 1, minHeight: 46, justifyContent: "center" },
  autoToggleText: { fontSize: 11 },
  adButton: { flex: 1, minHeight: 46 },
  adButtonText: { color: "#4f463c", fontSize: 10, fontWeight: "900", fontFamily: fonts.bold, textAlign: "center" },
  adButtonSmall: { marginTop: 2, fontSize: 8, textAlign: "center", color: "#4f463c" },
});
