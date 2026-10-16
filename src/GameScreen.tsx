import { ScrollView, StatusBar, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "./theme";
import { useGameState } from "./state/useGameState";
import { GameHeader } from "./components/GameHeader";
import { BottomNavigation } from "./components/BottomNavigation";
import { QuestModal } from "./components/QuestModal";
import { OfflineRewardModal } from "./components/OfflineRewardModal";
import { BattleScreen } from "./screens/BattleScreen";
import { GrowthScreen } from "./screens/GrowthScreen";
import { EquipmentScreen } from "./screens/EquipmentScreen";
import { CompanionsScreen } from "./screens/CompanionsScreen";
import { InventoryScreen } from "./screens/InventoryScreen";
import { WardrobeScreen } from "./screens/WardrobeScreen";
import { ShopScreen } from "./screens/ShopScreen";
import { SkillsScreen } from "./screens/SkillsScreen";
import { MilestoneScreen } from "./screens/MilestoneScreen";
import { KitchenScreen } from "./screens/KitchenScreen";
import { GroceryScreen } from "./screens/GroceryScreen";
import { RecipeShopScreen } from "./screens/RecipeShopScreen";
import { TutorialOverlay } from "./components/TutorialOverlay";
import { getBagCapacity } from "./state/bag";
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
        return (
          <CompanionsScreen
            equippedOutfit={state.equippedOutfit}
            onEquip={(equippedOutfit) => setState((previous) => ({ ...previous, equippedOutfit }))}
          />
        );
      case "inventory":
        return (
          <InventoryScreen
            inventory={state.inventory}
            gems={state.gems}
            expansions={state.bagExpansions ?? 0}
            onExpand={game.expandBag}
            onOpenShop={() => onSelectTab("shop")}
          />
        );
      case "wardrobe":
        return (
          <WardrobeScreen
            equippedOutfit={state.equippedOutfit}
            onEquip={(equippedOutfit) => setState((previous) => ({ ...previous, equippedOutfit }))}
          />
        );
      case "skills":
        return (
          <SkillsScreen
            equippedSkill={state.equippedSkill ?? null}
            onEquip={game.equipSkill}
            swapReadyAt={game.skillSwapReadyAt}
            now={game.now}
          />
        );
      case "shop":
        return <ShopScreen />;
      case "kitchen":
        return (
          <KitchenScreen
            inventory={state.inventory}
            bagCapacity={getBagCapacity(state.bagExpansions)}
            knownRecipes={state.knownRecipes}
            onCook={game.cook}
            onOpenGrocery={() => onSelectTab("grocery")}
            onOpenRecipes={() => onSelectTab("recipes")}
          />
        );
      case "recipes":
        return (
          <RecipeShopScreen
            knownRecipes={state.knownRecipes}
            gold={state.gold}
            onLearn={game.learnRecipe}
            onBack={() => onSelectTab("kitchen")}
            onOpenGrocery={() => onSelectTab("grocery")}
          />
        );
      case "grocery":
        return (
          <GroceryScreen
            inventory={state.inventory}
            gold={state.gold}
            onBuy={game.buyIngredient}
            onBack={() => onSelectTab("kitchen")}
            onOpenRecipes={() => onSelectTab("recipes")}
          />
        );
      case "milestone":
        return (
          <MilestoneScreen
            stageNumber={state.stageNumber}
            highestStageNumber={state.highestStageNumber ?? state.stageNumber}
            onSelectStage={game.selectStage}
            onBack={() => onSelectTab("battle")}
          />
        );
      default:
        return <BattleScreen game={game} />;
    }
  };

  return (
    <View style={styles.shell}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.frame} edges={["top", "bottom"]}>
        <GameHeader
          state={state}
          onReset={game.resetSave}
          onSkipToBoss={game.skipToBoss}
          onKillEnemy={game.battle.killEnemy}
          onOpenShop={() => onSelectTab("shop")}
          onReplayTutorial={() => setState((previous) => ({ ...previous, selectedTab: "battle", tutorialDone: false }))}
        />
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {renderContent()}
        </ScrollView>
        <BottomNavigation selected={state.selectedTab} onSelect={onSelectTab} />
        {questOpen && (
          <QuestModal quests={state.quests} onClose={() => setQuestOpen(false)} onClaim={claimQuest} />
        )}
        {game.offlineSummary && (
          <OfflineRewardModal
            summary={game.offlineSummary}
            onClaim={game.dismissOfflineSummary}
            onClaimDouble={game.claimOfflineDouble}
          />
        )}
        {/* Waits for the save to load (so returning players never see it flash) and for the offline popup. */}
        {game.loaded && !state.tutorialDone && !game.offlineSummary && (
          <TutorialOverlay onFinish={() => setState((previous) => ({ ...previous, tutorialDone: true }))} />
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
