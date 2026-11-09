import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { kit } from "../assets";
import { NineSlice } from "./NineSlice";
import { GameButton } from "./GameButton";
import { VolumeSlider } from "./VolumeSlider";
import { playSfx, setBgmVolume, setSfxVolume, useBgmVolume, useSfxVolume } from "../sound";
import { playHaptic, setHapticsEnabled, useHapticsEnabled } from "../haptics";

export function SettingsModal({
  onSkipToBoss,
  onSpawnGoldenMini,
  onKillEnemy,
  onAddLevels,
  onUnlockAllStages,
  onAddGems,
  onReplayTutorial,
  onOpenComics,
  onUnlockAllComics,
  onResetRequest,
  onOpenPage,
  onOpenWhatsNew,
  onClose,
}: {
  onSkipToBoss: () => void;
  onSpawnGoldenMini: () => void;
  onKillEnemy: () => void;
  onAddLevels: () => void;
  onUnlockAllStages: () => void;
  onAddGems: () => void;
  onReplayTutorial: () => void;
  // Opens the comic album (추억 앨범).
  onOpenComics: () => void;
  // Opens every story comic in the album, then shows the album.
  onUnlockAllComics: () => void;
  onResetRequest: () => void;
  // Full pages opened from here (guide / backup / credits) and the update list.
  onOpenPage: (page: "guide" | "backup" | "credits") => void;
  onOpenWhatsNew: () => void;
  onClose: () => void;
}) {
  const sfxVolume = useSfxVolume();
  const bgmVolume = useBgmVolume();
  const hapticsEnabled = useHapticsEnabled();
  return (
    <Modal visible animationType="fade" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.panel} onPress={(event) => event.stopPropagation()}>
          <NineSlice slice={kit.panelLarge} />
          <Text style={styles.title}>설정</Text>
          <View style={styles.sfxRow}>
            <Text style={styles.sfxLabel}>효과음</Text>
            <View style={styles.sliderWrap}>
              <VolumeSlider
                value={sfxVolume}
                accessibilityLabel="효과음 음량"
                onChange={(value) => {
                  const wasZero = sfxVolume <= 0;
                  setSfxVolume(value);
                  // A tap that un-mutes plays a confirm click; dragging while already
                  // audible doesn't spam it on every move event.
                  if (wasZero && value > 0) playSfx("uiToggle");
                }}
              />
            </View>
          </View>
          <View style={[styles.sfxRow, styles.bgmRow]}>
            <Text style={styles.sfxLabel}>배경음</Text>
            <View style={styles.sliderWrap}>
              <VolumeSlider value={bgmVolume} accessibilityLabel="배경음 음량" onChange={setBgmVolume} />
            </View>
          </View>
          <View style={[styles.sfxRow, styles.bgmRow]}>
            <Text style={styles.sfxLabel}>진동</Text>
            <GameButton
              variant={hapticsEnabled ? "green" : "beige"}
              onPress={() => {
                const next = !hapticsEnabled;
                setHapticsEnabled(next);
                playSfx("uiToggle");
                if (next) playHaptic("claim");
              }}
              style={styles.hapticButton}
              textStyle={styles.hapticButtonText}
            >
              {hapticsEnabled ? "켜짐" : "꺼짐"}
            </GameButton>
          </View>
          <View style={styles.list}>
            {(
              [
                ["guide", "게임 가이드"],
                ["backup", "세이브 백업"],
                ["credits", "크레딧"],
              ] as const
            ).map(([page, label]) => (
              <GameButton
                key={page}
                variant="cream"
                onPress={() => {
                  onOpenPage(page);
                  onClose();
                }}
                style={styles.button}
              >
                {label}
              </GameButton>
            ))}
            <GameButton
              variant="cream"
              onPress={() => {
                onOpenWhatsNew();
                onClose();
              }}
              style={styles.button}
            >
              업데이트 소식
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
            <GameButton variant="red" onPress={onResetRequest} style={styles.button}>
              세이브 초기화
            </GameButton>
            {/* Cheats for testing: only in development builds (__DEV__), never in a release. */}
            {__DEV__ && (
              <>
                <Text style={styles.devLabel}>개발용</Text>
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
                  onSpawnGoldenMini();
                  onClose();
                }}
                style={styles.button}
              >
                황금 중간보스 소환
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
                variant="green"
                onPress={() => {
                  onAddGems();
                  onClose();
                }}
                style={styles.button}
              >
                보석 +10000
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
              </>
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  devLabel: { marginTop: 6, textAlign: "center", fontSize: 12, fontWeight: "900", fontFamily: fonts.bold, color: colors.muted, letterSpacing: 2 },
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
  title: { fontSize: 18, fontWeight: "800", fontFamily: fonts.bold, color: colors.ink, textAlign: "center" },
  sfxRow: {
    marginTop: 14,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  bgmRow: { marginTop: 10 },
  sfxLabel: { fontSize: 14, fontWeight: "700", fontFamily: fonts.bold, color: colors.ink },
  sliderWrap: { width: 140 },
  hapticButton: { minHeight: 28, paddingHorizontal: 16 },
  hapticButtonText: { fontSize: 11 },
  list: { marginTop: 16, width: "100%", gap: 8 },
  button: { width: "100%" },
});
