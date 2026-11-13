import { Modal, Pressable, StyleSheet, View } from "react-native";
import { Text } from "./GameText";
import { colors, fonts } from "../theme";
import { kit } from "../assets";
import { NineSlice } from "./NineSlice";
import { GameButton } from "./GameButton";
import { t } from "../i18n";

// Alert.alert is a no-op on web (react-native-web ships an empty stub) — this is the
// cross-platform replacement for any destructive action that needs a yes/no check.
export function ConfirmModal({
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  children,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  // Extra content between the message and the buttons (e.g. the exit dialog's banner ad).
  children?: React.ReactNode;
}) {
  const resolvedConfirmLabel = confirmLabel ?? t("확인", "OK");
  const resolvedCancelLabel = cancelLabel ?? t("취소", "Cancel");
  return (
    <Modal visible animationType="fade" transparent onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={styles.panel} onPress={(event) => event.stopPropagation()}>
          <NineSlice slice={kit.panelLarge} />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          {children}
          <View style={styles.buttonRow}>
            <GameButton variant="gray" onPress={onCancel} style={styles.button}>{resolvedCancelLabel}</GameButton>
            <GameButton variant="green" onPress={onConfirm} style={styles.button}>{resolvedConfirmLabel}</GameButton>
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
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    alignItems: "center",
  },
  title: { fontSize: 19, fontWeight: "800", fontFamily: fonts.bold, color: colors.ink, textAlign: "center" },
  message: { fontFamily: fonts.light, letterSpacing: -0.36, marginTop: 8, fontSize: 12, color: colors.brown, textAlign: "center", lineHeight: 16 },
  buttonRow: { marginTop: 18, flexDirection: "row", gap: 10 },
  button: { minWidth: 96 },
});
