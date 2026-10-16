import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { kit } from "../assets";
import { NineSlice } from "./NineSlice";
import { GameButton } from "./GameButton";

export function SettingsModal({
  onSkipToBoss,
  onKillEnemy,
  onAddLevels,
  onUnlockAllStages,
  onReplayTutorial,
  onResetRequest,
  onClose,
}: {
  onSkipToBoss: () => void;
  onKillEnemy: () => void;
  onAddLevels: () => void;
  onUnlockAllStages: () => void;
  onReplayTutorial: () => void;
  onResetRequest: () => void;
  onClose: () => void;
}) {
  return (
    <Modal visible animationType="fade" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.panel} onPress={(event) => event.stopPropagation()}>
          <NineSlice slice={kit.panelLarge} />
          <Text style={styles.title}>설정</Text>
          <View style={styles.list}>
            <GameButton
              variant="green"
              onPress={() => {
                onSkipToBoss();
                onClose();
              }}
              style={styles.button}
            >
              보스로 바로 가기
            </GameButton>
            <GameButton
              variant="green"
              onPress={() => {
                onKillEnemy();
                onClose();
              }}
              style={styles.button}
            >
              몹 즉사
            </GameButton>
            <GameButton
              variant="green"
              onPress={() => {
                onAddLevels();
                onClose();
              }}
              style={styles.button}
            >
              +50레벨
            </GameButton>
            <GameButton
              variant="green"
              onPress={() => {
                onUnlockAllStages();
                onClose();
              }}
              style={styles.button}
            >
              맵 다 깨기
            </GameButton>
            <GameButton
              variant="cream"
              onPress={() => {
                onReplayTutorial();
                onClose();
              }}
              style={styles.button}
            >
              튜토리얼 다시 보기
            </GameButton>
            <GameButton variant="red" onPress={onResetRequest} style={styles.button}>
              세이브 초기화
            </GameButton>
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
  list: { marginTop: 16, width: "100%", gap: 8 },
  button: { width: "100%" },
});
