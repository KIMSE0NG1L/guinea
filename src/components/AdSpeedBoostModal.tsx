import { Image, Modal, Pressable, StyleSheet, Text } from "react-native";
import { colors, fonts } from "../theme";
import { kit, icons } from "../assets";
import { NineSlice } from "./NineSlice";
import { GameButton } from "./GameButton";

// Stands in for a real rewarded-ad flow until one is wired up — same payout, same beat
// (ask, then reward), just honest that there's nothing to actually watch yet.
export function AdSpeedBoostModal({ onClaim }: { onClaim: () => void }) {
  return (
    <Modal visible animationType="fade" transparent onRequestClose={onClaim}>
      <Pressable style={styles.backdrop} onPress={onClaim}>
        <Pressable style={styles.panel} onPress={(event) => event.stopPropagation()}>
          <NineSlice slice={kit.panelLarge} />
          <Image source={icons.energy} style={styles.heroIcon} />
          <Text style={styles.eyebrow}>광고 안내</Text>
          <Text style={styles.title}>앗, 지금은 보여드릴 광고가 없어요!</Text>
          <Text style={styles.message}>대신 섭섭하지 않게 2배속 효과는 그대로 챙겨드릴게요.</Text>
          <GameButton variant="green" onPress={onClaim} style={styles.claimButton}>2배속 받기</GameButton>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    padding: 22,
    paddingHorizontal: 14,
    justifyContent: "center",
    backgroundColor: "#263024cf",
  },
  panel: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 18,
    alignItems: "center",
  },
  heroIcon: { width: 44, height: 44, marginBottom: 6 },
  eyebrow: { color: colors.green, fontWeight: "800", fontFamily: fonts.bold, fontSize: 9, letterSpacing: 1.5 },
  title: { marginTop: 2, fontSize: 15, fontWeight: "800", fontFamily: fonts.bold, color: colors.ink, textAlign: "center" },
  message: { marginTop: 8, fontSize: 11, color: colors.brown, textAlign: "center", lineHeight: 16 },
  claimButton: { marginTop: 16, minWidth: 140 },
});
