import { useEffect, useState } from "react";
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
import { RecipeTutorial } from "./components/RecipeTutorial";
import { canCook, getKnownRecipes, RECIPES } from "./state/recipes";
import { getBagCapacity } from "./state/bag";
import { isOutfitUnlocked } from "./state/unlocks";
import type { Tab } from "./types";

export function GameScreen() {
  const game = useGameState();
  const { state, setState, questOpen, setQuestOpen, claimQuest } = game;

  const onSelectTab = (selectedTab: Tab) => setState((previous) => ({ ...previous, selectedTab }));

  // The recipe tutorial opens once the first 초록 젤리 is in the bag — after a beat, so the
  // drop gets to finish flying into the bag button first.
  const hasJelly = state.inventory.some((item) => item.name === "초록 젤리");
  const [recipeTutorialArmed, setRecipeTutorialArmed] = useState(false);
  useEffect(() => {
    if (!hasJelly || recipeTutorialArmed) return;
    const timer = setTimeout(() => setRecipeTutorialArmed(true), 1600);
    return () => clearTimeout(timer);
  }, [hasJelly, recipeTutorialArmed]);

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
            level={state.level}
            onEquip={(equippedOutfit) =>
              setState((previous) => (isOutfitUnlocked(equippedOutfit, previous.level) ? { ...previous, equippedOutfit } : previous))
            }
          />
        );
      case "inventory":
        return (
          <InventoryScreen
            inventory={state.inventory}
            discoveredItems={state.discoveredItems ?? []}
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
            level={state.level}
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
            layout={state.kitchenLayout ?? "list"}
            onLayoutChange={(kitchenLayout) => setState((previous) => ({ ...previous, kitchenLayout }))}
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
          onAddLevels={() => game.cheatAddLevels(50)}
          onUnlockAllStages={game.cheatUnlockAllStages}
          onOpenShop={() => onSelectTab("shop")}
          onReplayTutorial={() => setState((previous) => ({ ...previous, selectedTab: "battle", tutorialDone: false }))}
        />
        <ScrollView key={state.selectedTab} style={styles.content} contentContainerStyle={styles.contentContainer}>
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
        {game.loaded && state.tutorialDone && !state.recipeTutorialDone && recipeTutorialArmed && !game.offlineSummary && (
          <RecipeTutorial
            tab={state.selectedTab}
            knowsFirstRecipe={getKnownRecipes(state.knownRecipes).includes("green-jelly")}
            canCookFirst={canCook(state.inventory, RECIPES.find((recipe) => recipe.id === "green-jelly")!)}
            dishesCooked={state.dishesCooked ?? 0}
            dishesEaten={state.dishesEaten ?? 0}
            freeSlotIndex={Math.max(0, game.buffSlots.findIndex((slot) => !slot || slot.expiresAt <= game.now))}
            onGoTo={onSelectTab}
            onFinish={() => setState((previous) => ({ ...previous, recipeTutorialDone: true }))}
          />
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
