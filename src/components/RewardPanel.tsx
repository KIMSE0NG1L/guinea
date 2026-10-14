import { Image, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { kitImages } from "../assets";
import { GameButton } from "./GameButton";
import { formatGameNumber } from "../state/gameMath";

export function RewardPanel({
  earned,
  onClaim,
  isAutoBattle,
  onToggleAuto,
}: {
  earned: number;
  onClaim: () => void;
  isAutoBattle: boolean;
  onToggleAuto: () => void;
}) {
  return (
    <View style={styles.wrap}>
      <GameButton
        onPress={onToggleAuto}
        accessibilityLabel={`자동 전투 ${isAutoBattle ? "끄기" : "켜기"}`}
        style={styles.autoToggle}
      >
        <View style={styles.autoToggleContent}>
          <Image source={isAutoBattle ? kitImages.toggleOn : kitImages.toggleOff} style={styles.toggle} />
          <Text style={[styles.autoToggleText, !isAutoBattle && styles.autoToggleTextOff]}>
            자동 전투 {isAutoBattle ? "ON" : "OFF"}
          </Text>
        </View>
      </GameButton>

      <View style={styles.actions}>
        <GameButton variant="green" onPress={onClaim} style={styles.claimButton}>
          <View style={styles.claimButtonContent}>
            <Text style={styles.claimSpan}>보상 받기</Text>
            <Text style={styles.claimSmall}>+{formatGameNumber(earned)} 골드</Text>
          </View>
        </GameButton>
        <GameButton variant="gray" disabled style={styles.adButton}>
          <View>
            <Text style={styles.adButtonText}>광고 보상</Text>
            <Text style={styles.adButtonSmall}>준비 중</Text>
          </View>
        </GameButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { margin: 10, flexDirection: "row", gap: 8, alignItems: "stretch" },
  autoToggle: { minWidth: 92, minHeight: 46, paddingHorizontal: 8 },
  toggle: { width: 26, height: 15 },
  autoToggleContent: { flexDirection: "row", alignItems: "center", gap: 5 },
  autoToggleText: { color: colors.ink, fontSize: 9, fontWeight: "900", fontFamily: fonts.bold },
  autoToggleTextOff: { color: "#756b5e" },
  actions: { flex: 1, flexDirection: "row", gap: 6 },
  claimButton: { flex: 1.15, minHeight: 46 },
  claimButtonContent: { alignItems: "center" },
  claimSpan: { color: colors.cream, fontWeight: "700", fontFamily: fonts.bold, fontSize: 10 },
  claimSmall: { marginTop: 2, color: colors.cream, fontSize: 14, fontWeight: "700", fontFamily: fonts.bold },
  adButton: { flex: 0.85, minHeight: 46 },
  adButtonText: { color: "#4f463c", fontSize: 10, fontWeight: "900", fontFamily: fonts.bold, textAlign: "center" },
  adButtonSmall: { marginTop: 2, fontSize: 8, textAlign: "center", color: "#4f463c" },
});
