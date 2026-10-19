import { Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { icons, kit } from "../assets";
import { NineSlice } from "./NineSlice";
import { GameButton } from "./GameButton";

// Pops up when something couldn't go into a full bag, and points the way to the bag to
// make room (or buy more slots there).
export function BagFullModal({ onOpenBag, onClose }: { onOpenBag: () => void; onClose: () => void }) {
  return (
    <Modal visible animationType="fade" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.panel} onPress={(event) => event.stopPropagation()}>
          <NineSlice slice={kit.panelLarge} />
          <Image source={icons.backpackTrim} style={styles.icon} resizeMode="contain" />
          <Text style={styles.title}>가방이 꽉 찼어요!</Text>
          <Text style={styles.message}>
            자리가 없어서 새로 얻은 걸 담지 못했어요.{"\n"}가방에서 요리에 쓰거나, 칸을 늘려 자리를 만들어 주세요.
          </Text>
          <View style={styles.buttonRow}>
            <GameButton variant="gray" onPress={onClose} style={styles.button}>닫기</GameButton>
            <GameButton
              variant="green"
              onPress={() => {
                onOpenBag();
                onClose();
              }}
              style={styles.button}
            >
              가방으로 가기
            </GameButton>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, padding: 22, paddingHorizontal: 14, justifyContent: "center", backgroundColor: "#263024cf" },
  panel: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 18, alignItems: "center" },
  icon: { width: 64, height: 64 },
  title: { marginTop: 6, fontSize: 17, fontWeight: "900", fontFamily: fonts.bold, color: colors.ink, textAlign: "center" },
  message: { marginTop: 8, fontSize: 11, color: colors.brown, textAlign: "center", lineHeight: 17 },
  buttonRow: { marginTop: 18, flexDirection: "row", gap: 10 },
  button: { minWidth: 110 },
});
