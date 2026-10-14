import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { kit } from "../assets";
import { NineSlice } from "./NineSlice";
import { GameButton } from "./GameButton";

// Alert.alert is a no-op on web (react-native-web ships an empty stub) — this is the
// cross-platform replacement for any destructive action that needs a yes/no check.
export function ConfirmModal({
  title,
  message,
  confirmLabel = "확인",
  cancelLabel = "취소",
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal visible animationType="fade" transparent onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={styles.panel} onPress={(event) => event.stopPropagation()}>
          <NineSlice slice={kit.panelLarge} />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttonRow}>
            <GameButton variant="gray" onPress={onCancel} style={styles.button}>{cancelLabel}</GameButton>
            <GameButton variant="green" onPress={onConfirm} style={styles.button}>{confirmLabel}</GameButton>
          </View>
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
    paddingTop: 18,
    paddingBottom: 18,
    alignItems: "center",
  },
  title: { fontSize: 16, fontWeight: "800", fontFamily: fonts.bold, color: colors.ink, textAlign: "center" },
  message: { marginTop: 8, fontSize: 11, color: colors.brown, textAlign: "center", lineHeight: 16 },
  buttonRow: { marginTop: 18, flexDirection: "row", gap: 10 },
  button: { minWidth: 96 },
});
