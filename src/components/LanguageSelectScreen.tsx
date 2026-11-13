import { Image, StyleSheet, View } from "react-native";
import { Text } from "./GameText";
import { StrokedText } from "./StrokedText";
import { CharacterSprite } from "./CharacterSprite";
import { GameButton } from "./GameButton";
import { APP_MAX_WIDTH, colors, fonts } from "../theme";
import { images } from "../assets";
import { playSfx } from "../sound";
import { setLanguage, type Lang } from "../i18n";

// Shown once, before the title screen, on a cold install that's never had a language
// picked (App.tsx gates on i18n's hasChosenLanguage()). Deliberately bilingual — the
// player hasn't told us a language yet, so every bit of copy here says itself twice.
export function LanguageSelectScreen({ onDone }: { onDone: () => void }) {
  const choose = (lang: Lang) => {
    playSfx("uiClick");
    setLanguage(lang);
    onDone();
  };

  return (
    <View style={styles.shell}>
      <View style={styles.frame}>
        <Image source={images.titleScreen} style={[StyleSheet.absoluteFill, styles.background]} resizeMode="cover" />
        <View style={styles.overlay} />
        <View style={styles.content}>
          <View style={styles.faceWrap}>
            <CharacterSprite outfit="default" animation="idle" size={92} />
          </View>
          <StrokedText style={styles.title} strokeColor={colors.line} strokeWidth={3}>
            언어를 선택하세요
          </StrokedText>
          <StrokedText style={styles.title} strokeColor={colors.line} strokeWidth={3}>
            Choose Your Language
          </StrokedText>
          <View style={[styles.buttons, styles.buttonsFirstRow]}>
            <GameButton variant="cream" onPress={() => choose("ko")} style={styles.button} textStyle={styles.buttonText}>
              한국어
            </GameButton>
            <GameButton variant="green" onPress={() => choose("en")} style={styles.button} textStyle={styles.buttonText}>
              English
            </GameButton>
          </View>
          <View style={styles.buttons}>
            <GameButton variant="beige" onPress={() => choose("ja")} style={styles.button} textStyle={styles.buttonText}>
              日本語
            </GameButton>
            <GameButton variant="brown" onPress={() => choose("zh")} style={styles.button} textStyle={styles.buttonText}>
              中文
            </GameButton>
          </View>
          <Text style={styles.hint}>나중에 설정에서 바꿀 수 있어요 · You can change this later in Settings</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: colors.appBackground },
  frame: { flex: 1, maxWidth: APP_MAX_WIDTH, width: "100%", alignSelf: "center", overflow: "hidden" },
  background: { width: "100%", height: "100%" },
  overlay: { ...StyleSheet.absoluteFill, backgroundColor: "#1c1613a0" },
  content: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 28 },
  faceWrap: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#fdf0d6",
    borderWidth: 3,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: 18,
  },
  title: { fontSize: 24, fontWeight: "900", fontFamily: fonts.bold, color: colors.cream, letterSpacing: 0.5, textAlign: "center" },
  buttons: { flexDirection: "row", gap: 14, marginTop: 10, width: "100%", justifyContent: "center" },
  buttonsFirstRow: { marginTop: 28 },
  button: { minWidth: 130, paddingHorizontal: 20 },
  buttonText: { fontSize: 18 },
  hint: { marginTop: 22, color: "#f3e6c8d9", fontSize: 12, fontWeight: "700", fontFamily: fonts.bold, textAlign: "center", textShadowColor: "#1c1613", textShadowRadius: 3 },
});
