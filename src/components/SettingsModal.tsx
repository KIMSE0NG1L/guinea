import { Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { kit, kitImages } from "../assets";
import { NineSlice } from "./NineSlice";
import { GameButton } from "./GameButton";
import { playSfx, setBgmMuted, setSfxMuted, useBgmMuted, useSfxMuted } from "../sound";

export function SettingsModal({
  onSkipToBoss,
  onKillEnemy,
  onAddLevels,
  onUnlockAllStages,
  onReplayTutorial,
  onOpenComics,
  onUnlockAllComics,
  onResetRequest,
  onClose,
}: {
  onSkipToBoss: () => void;
  onKillEnemy: () => void;
  onAddLevels: () => void;
  onUnlockAllStages: () => void;
  onReplayTutorial: () => void;
  // Opens the comic album (추억 앨범).
  onOpenComics: () => void;
  // Opens every story comic in the album, then shows the album.
  onUnlockAllComics: () => void;
  onResetRequest: () => void;
  onClose: () => void;
}) {
  const sfxMuted = useSfxMuted();
  const bgmMuted = useBgmMuted();
  return (
    <Modal visible animationType="fade" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.panel} onPress={(event) => event.stopPropagation()}>
          <NineSlice slice={kit.panelLarge} />
          <Text style={styles.title}>설정</Text>
          <Pressable
            style={styles.sfxRow}
            onPress={() => {
              // Flip the state first, then play — so unmuting gives an audible confirm
              // click, and muting plays nothing (silence is its own confirmation).
              setSfxMuted(!sfxMuted);
              playSfx("uiToggle");
            }}
            hitSlop={6}
          >
            <Text style={styles.sfxLabel}>효과음</Text>
            <Image source={sfxMuted ? kitImages.toggleOff : kitImages.toggleOn} style={styles.sfxToggle} resizeMode="contain" />
          </Pressable>
          <Pressable
            style={[styles.sfxRow, styles.bgmRow]}
            onPress={() => {
              setBgmMuted(!bgmMuted);
              playSfx("uiToggle");
            }}
            hitSlop={6}
          >
            <Text style={styles.sfxLabel}>배경음</Text>
            <Image source={bgmMuted ? kitImages.toggleOff : kitImages.toggleOn} style={styles.sfxToggle} resizeMode="contain" />
          </Pressable>
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
            <GameButton
              variant="cream"
              onPress={() => {
                onOpenComics();
                onClose();
              }}
              style={styles.button}
            >
              만화 다시 보기 (추억 앨범)
            </GameButton>
            <GameButton
              variant="green"
              onPress={() => {
                onUnlockAllComics();
                onClose();
              }}
              style={styles.button}
            >
              만화 다 열기
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
  sfxRow: {
    marginTop: 14,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  bgmRow: { marginTop: 10 },
  sfxLabel: { fontSize: 13, fontWeight: "700", fontFamily: fonts.bold, color: colors.ink },
  sfxToggle: { width: 52, height: 30 },
  list: { marginTop: 16, width: "100%", gap: 8 },
  button: { width: "100%" },
});
