import { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GameScreen } from "./src/GameScreen";
import { TitleScreen } from "./src/components/TitleScreen";
import { LanguageSelectScreen } from "./src/components/LanguageSelectScreen";
import { colors } from "./src/theme";
import { setTitleBgm, startBgm } from "./src/sound";
import { writeSave } from "./src/state/storage";
import type { GameState } from "./src/types";
import { checkContent } from "./src/state/contentCheck";
import { initAds } from "./src/ads";
import { installWebWordBreak } from "./src/components/GameText";
import { hasChosenLanguage } from "./src/i18n";

// Lists any half-added recipe/ingredient in the console (dev builds only).
if (__DEV__) checkContent();
// Korean wraps by word, not mid-word (native Text handles this in GameText).
installWebWordBreak();

export default function App() {
  const [fontsLoaded] = useFonts({
    "Maplestory-Bold": require("./assets/fonts/Maplestory-Bold.ttf"),
    "Maplestory-Light": require("./assets/fonts/Maplestory-Light.ttf"),
    Binggrae: require("./assets/fonts/Binggrae.otf"),
  });
  // Not persisted — the title screen is meant to greet every cold launch, not just the
  // very first one ever.
  const [started, setStarted] = useState(false);
  // Gates everything behind a one-time language pick on a fresh install — null while the
  // check is in flight, then true/false. Once chosen (here or later in Settings) it's
  // persisted (src/i18n), so this only ever shows once per install.
  const [languageChosen, setLanguageChosen] = useState<boolean | null>(null);
  useEffect(() => {
    hasChosenLanguage().then(setLanguageChosen);
  }, []);
  // Restoring a backup: the game is taken down (so its own autosave can't write the old state
  // over the new one), the backup written with no lastSeenAt (no offline reward off it), then
  // a fresh GameScreen loads it.
  const [gameKey, setGameKey] = useState(0);
  const [restoring, setRestoring] = useState(false);
  const restoreSave = (state: GameState) => {
    setRestoring(true);
    writeSave({ state: { ...state, selectedTab: "battle" } }).then(() => {
      setGameKey((key) => key + 1);
      setRestoring(false);
    });
  };

  useEffect(() => {
    startBgm();
    // Starts the ad SDK and preloads one rewarded ad (no-op on web).
    initAds();
  }, []);

  if (!fontsLoaded || languageChosen === null) {
    return <View style={{ flex: 1, backgroundColor: colors.appBackground }} />;
  }

  return (
    <SafeAreaProvider>
      {!languageChosen ? (
        <LanguageSelectScreen onDone={() => setLanguageChosen(true)} />
      ) : restoring ? (
        <View style={{ flex: 1, backgroundColor: colors.appBackground }} />
      ) : started ? (
        <GameScreen key={gameKey} onRestoreSave={restoreSave} />
      ) : (
        <TitleScreen
          onStart={() => {
            setTitleBgm(false);
            setStarted(true);
          }}
        />
      )}
    </SafeAreaProvider>
  );
}
