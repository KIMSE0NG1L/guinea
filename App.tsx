import { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GameScreen } from "./src/GameScreen";
import { TitleScreen } from "./src/components/TitleScreen";
import { colors } from "./src/theme";
import { setTitleBgm, startBgm } from "./src/sound";
import { writeSave } from "./src/state/storage";
import type { GameState } from "./src/types";
import { checkContent } from "./src/state/contentCheck";
import { initAds } from "./src/ads";

// Lists any half-added recipe/ingredient in the console (dev builds only).
if (__DEV__) checkContent();

export default function App() {
  const [fontsLoaded] = useFonts({
    "Maplestory-Bold": require("./assets/fonts/Maplestory-Bold.ttf"),
    "Maplestory-Light": require("./assets/fonts/Maplestory-Light.ttf"),
  });
  // Not persisted — the title screen is meant to greet every cold launch, not just the
  // very first one ever.
  const [started, setStarted] = useState(false);
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

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.appBackground }} />;
  }

  return (
    <SafeAreaProvider>
      {restoring ? (
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
