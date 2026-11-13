import { Image, Modal, Pressable, StyleSheet, View } from "react-native";
import { Text } from "./GameText";
import { colors, fonts } from "../theme";
import { buttonImages, kit } from "../assets";
import { NineSlice } from "./NineSlice";
import { GameButton } from "./GameButton";
import { VolumeSlider } from "./VolumeSlider";
import { playSfx, setBgmVolume, setSfxVolume, useBgmVolume, useSfxVolume } from "../sound";
import { playHaptic, setHapticsEnabled, useHapticsEnabled } from "../haptics";
import { setLanguage, t, useLanguage } from "../i18n";

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
  const language = useLanguage();
  return (
    <Modal visible animationType="fade" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.panel} onPress={(event) => event.stopPropagation()}>
          <NineSlice slice={kit.panelLarge} />
          <Text style={styles.title}>{t("설정", "Settings")}</Text>
          <Pressable
            onPress={() => {
              playSfx("uiClick");
              onClose();
            }}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t("설정 닫기", "Close settings")}
            style={({ pressed }) => [styles.close, pressed && styles.closePressed]}
          >
            <Image source={buttonImages.closeRed} style={styles.closeIcon} />
          </Pressable>
          <View style={styles.sfxRow}>
            <Text style={styles.sfxLabel}>{t("언어", "Language")}</Text>
            <GameButton
              variant="cream"
              onPress={() => {
                const next = language === "en" ? "ko" : "en";
                setLanguage(next);
                playSfx("uiToggle");
              }}
              style={styles.hapticButton}
              textStyle={styles.hapticButtonText}
            >
              {language === "en" ? "English" : "한국어"}
            </GameButton>
          </View>
          <View style={[styles.sfxRow, styles.bgmRow]}>
            <Text style={styles.sfxLabel}>{t("효과음", "SFX")}</Text>
            <View style={styles.sliderWrap}>
              <VolumeSlider
                value={sfxVolume}
                accessibilityLabel={t("효과음 음량", "SFX volume")}
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
            <Text style={styles.sfxLabel}>{t("배경음", "Music")}</Text>
            <View style={styles.sliderWrap}>
              <VolumeSlider value={bgmVolume} accessibilityLabel={t("배경음 음량", "Music volume")} onChange={setBgmVolume} />
            </View>
          </View>
          <View style={[styles.sfxRow, styles.bgmRow]}>
            <Text style={styles.sfxLabel}>{t("진동", "Vibration")}</Text>
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
              {hapticsEnabled ? t("켜짐", "On") : t("꺼짐", "Off")}
            </GameButton>
          </View>
          <View style={styles.list}>
            {(
              [
                ["guide", t("게임 가이드", "Game Guide")],
                ["backup", t("세이브 백업", "Save Backup")],
                ["credits", t("크레딧", "Credits")],
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
              {t("업데이트 소식", "What's New")}
            </GameButton>
            <GameButton
              variant="cream"
              onPress={() => {
                onReplayTutorial();
                onClose();
              }}
              style={styles.button}
            >
              {t("튜토리얼 다시 보기", "Replay Tutorial")}
            </GameButton>
            <GameButton
              variant="cream"
              onPress={() => {
                onOpenComics();
                onClose();
              }}
              style={styles.button}
            >
              {t("만화 다시 보기 (추억 앨범)", "Rewatch Comics (Memory Album)")}
            </GameButton>
            <GameButton variant="red" onPress={onResetRequest} style={styles.button}>
              {t("세이브 초기화", "Reset Save")}
            </GameButton>
            {/* Cheats for testing: only in development builds (__DEV__), never in a release. */}
            {__DEV__ && (
              <>
                <Text style={styles.devLabel}>{t("개발용", "Dev")}</Text>
              <GameButton
                variant="green"
                onPress={() => {
                  onSkipToBoss();
                  onClose();
                }}
                style={styles.button}
              >
                {t("보스로 바로 가기", "Skip to Boss")}
              </GameButton>
              <GameButton
                variant="green"
                onPress={() => {
                  onSpawnGoldenMini();
                  onClose();
                }}
                style={styles.button}
              >
                {t("황금 중간보스 소환", "Spawn Golden Mid-Boss")}
              </GameButton>
              <GameButton
                variant="green"
                onPress={() => {
                  onKillEnemy();
                  onClose();
                }}
                style={styles.button}
              >
                {t("몹 즉사", "Instant-Kill Mob")}
              </GameButton>
              <GameButton
                variant="green"
                onPress={() => {
                  onAddLevels();
                  onClose();
                }}
                style={styles.button}
              >
                {t("+50레벨", "+50 Levels")}
              </GameButton>
              <GameButton
                variant="green"
                onPress={() => {
                  onUnlockAllStages();
                  onClose();
                }}
                style={styles.button}
              >
                {t("맵 다 깨기", "Clear Whole Map")}
              </GameButton>
              <GameButton
                variant="green"
                onPress={() => {
                  onAddGems();
                  onClose();
                }}
                style={styles.button}
              >
                {t("보석 +10000", "+10000 Gems")}
              </GameButton>
              <GameButton
                variant="green"
                onPress={() => {
                  onUnlockAllComics();
                  onClose();
                }}
                style={styles.button}
              >
                {t("만화 다 열기", "Unlock All Comics")}
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
  // Hangs off the panel's top-right corner.
  close: { position: "absolute", top: -10, right: -8, zIndex: 2 },
  closePressed: { transform: [{ scale: 0.9 }] },
  closeIcon: { width: 36, height: 36 },
  panel: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    alignItems: "center",
  },
  title: { fontSize: 19, fontWeight: "800", fontFamily: fonts.bold, color: colors.ink, textAlign: "center" },
  sfxRow: {
    marginTop: 14,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  bgmRow: { marginTop: 10 },
  sfxLabel: { fontSize: 15, fontWeight: "700", fontFamily: fonts.bold, color: colors.ink },
  sliderWrap: { width: 140 },
  hapticButton: { minHeight: 28, paddingHorizontal: 16 },
  hapticButtonText: { fontSize: 11 },
  list: { marginTop: 16, width: "100%", gap: 8 },
  button: { width: "100%" },
});
