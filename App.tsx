import { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GameScreen } from "./src/GameScreen";
import { TitleScreen } from "./src/components/TitleScreen";
import { colors } from "./src/theme";
import { startBgm } from "./src/sound";
import { checkContent } from "./src/state/contentCheck";

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

  useEffect(() => {
    startBgm();
  }, []);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.appBackground }} />;
  }

  return (
    <SafeAreaProvider>
      {started ? <GameScreen /> : <TitleScreen onStart={() => setStarted(true)} />}
    </SafeAreaProvider>
  );
}
