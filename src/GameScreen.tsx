import { ScrollView, StatusBar, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "./theme";
import { useGameState } from "./state/useGameState";
import { GameHeader } from "./components/GameHeader";
import { BottomNavigation } from "./components/BottomNavigation";
import { QuestModal } from "./components/QuestModal";
import { BattleScreen } from "./screens/BattleScreen";
import { GrowthScreen } from "./screens/GrowthScreen";
import { EquipmentScreen } from "./screens/EquipmentScreen";
import { CompanionsScreen } from "./screens/CompanionsScreen";
import { InventoryScreen } from "./screens/InventoryScreen";
import { WardrobeScreen } from "./screens/WardrobeScreen";
import { ShopScreen } from "./screens/ShopScreen";
import type { Tab } from "./types";

export function GameScreen() {
  const game = useGameState();
  const { state, setState, questOpen, setQuestOpen, claimQuest } = game;

  const onSelectTab = (selectedTab: Tab) => setState((previous) => ({ ...previous, selectedTab }));

  const renderContent = () => {
    switch (state.selectedTab) {
      case "growth":
        return <GrowthScreen game={game} />;
      case "equipment":
        return <EquipmentScreen equipment={state.equipment} />;
      case "companions":
        return <CompanionsScreen companions={state.companions} />;
      case "inventory":
        return <InventoryScreen inventory={state.inventory} />;
      case "wardrobe":
        return (
          <WardrobeScreen
            equippedOutfit={state.equippedOutfit}
            onEquip={(equippedOutfit) => setState((previous) => ({ ...previous, equippedOutfit }))}
          />
        );
      case "shop":
        return <ShopScreen />;
      default:
        return <BattleScreen game={game} />;
    }
  };

  return (
    <View style={styles.shell}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.frame} edges={["top", "bottom"]}>
        <GameHeader state={state} onQuest={() => setQuestOpen(true)} />
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {renderContent()}
        </ScrollView>
        <BottomNavigation selected={state.selectedTab} onSelect={onSelectTab} />
        {questOpen && (
          <QuestModal quests={state.quests} onClose={() => setQuestOpen(false)} onClaim={claimQuest} />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: colors.appBackground },
  frame: { flex: 1, maxWidth: 430, width: "100%", alignSelf: "center", backgroundColor: colors.paper },
  content: { flex: 1 },
  contentContainer: { flexGrow: 1, paddingBottom: 12 },
});
