import { Image, Modal, StyleSheet, View } from "react-native";
import { Text } from "./GameText";
import { colors, fonts } from "../theme";
import { kit, uiImages } from "../assets";
import { NineSlice } from "./NineSlice";
import { GameButton } from "./GameButton";
import { LATEST_UPDATE } from "../state/updates";

// 업데이트 소식: the latest update's list. `gift`: the first time a player sees this update,
// its gems come with the close button; reopened from the settings it's just the list.
export function WhatsNewModal({ gift, onClose }: { gift: boolean; onClose: () => void }) {
  return (
    <Modal visible animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.panel}>
          <NineSlice slice={kit.panelLarge} />
          <Text style={styles.eyebrow}>UPDATE</Text>
          <Text style={styles.title}>{LATEST_UPDATE.title}</Text>
          <View style={styles.list}>
            {LATEST_UPDATE.items.map((item) => (
              <View key={item.text} style={styles.item}>
                <Text style={styles.icon}>{item.icon}</Text>
                <Text style={styles.text}>{item.text}</Text>
              </View>
            ))}
          </View>
          <GameButton variant="green" onPress={onClose} style={styles.button}>
            {gift ? (
              <View style={styles.gift}>
                <Text style={styles.giftText}>업데이트 선물 받기</Text>
                <Image source={uiImages.crystal} style={styles.gem} />
                <Text style={styles.giftText}>{LATEST_UPDATE.gems}</Text>
              </View>
            ) : (
              "닫기"
            )}
          </GameButton>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, padding: 18, justifyContent: "center", backgroundColor: "#263024cf" },
  panel: { width: "100%", maxWidth: 400, alignSelf: "center", paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24, alignItems: "center" },
  eyebrow: { color: colors.green, fontWeight: "800", fontFamily: fonts.bold, fontSize: 12, letterSpacing: 2 },
  title: { marginTop: 2, fontSize: 22, fontWeight: "900", fontFamily: fonts.bold, color: colors.ink, textAlign: "center" },
  list: { marginTop: 14, alignSelf: "stretch", gap: 8 },
  item: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  icon: { fontSize: 18, width: 22, textAlign: "center" },
  text: { flex: 1, fontSize: 12, lineHeight: 16, color: colors.ink, fontWeight: "700", fontFamily: fonts.bold },
  button: { marginTop: 16, minWidth: 190 },
  gift: { flexDirection: "row", alignItems: "center", gap: 4 },
  giftText: { fontSize: 14, fontWeight: "900", fontFamily: fonts.bold, color: colors.cream },
  gem: { width: 13, height: 18, resizeMode: "contain" },
});
