import { useEffect, useRef, useState } from "react";
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
import { CompanionsHub } from "./screens/CompanionsHub";
import { InventoryScreen } from "./screens/InventoryScreen";
import { WardrobeScreen } from "./screens/WardrobeScreen";
import { ShopScreen } from "./screens/ShopScreen";
import { SkillsScreen } from "./screens/SkillsScreen";
import { MilestoneScreen } from "./screens/MilestoneScreen";
import { KitchenScreen } from "./screens/KitchenScreen";
import { GroceryScreen } from "./screens/GroceryScreen";
import { RecipeShopScreen } from "./screens/RecipeShopScreen";
import { CookbookScreen } from "./screens/CookbookScreen";
import { getCookbookProgress, isCookbookComplete } from "./state/cookbook";
import { CookbookEnding } from "./components/CookbookEnding";
import { TutorialOverlay } from "./components/TutorialOverlay";
import { BagFullModal } from "./components/BagFullModal";
import { FirstClearCelebration } from "./components/FirstClearCelebration";
import { RecipeTutorial } from "./components/RecipeTutorial";
import { CookCompleteBurst } from "./components/CookCompleteBurst";
import { FlightLayer, launchFlight } from "./components/FlightLayer";
import { ComicViewer } from "./components/ComicViewer";
import { COMIC_ON_FIRST_CLEAR, type ComicId } from "./state/comics";
import { ComicsScreen } from "./screens/ComicsScreen";
import { measureTarget } from "./components/tutorialTargets";
import { getCookingPots, getPotsUnlocked } from "./state/cooking";
import { canCook, getKnownRecipes, RECIPES } from "./state/recipes";
import { isOutfitUnlocked } from "./state/unlocks";
import { setBgmTrack } from "./sound";
import type { Tab } from "./types";

export function GameScreen() {
  const game = useGameState();
  const { state, setState, questOpen, setQuestOpen, claimQuest } = game;

  // Lives here rather than in BattleScreen so the boss theme keeps playing on other tabs.
  // Keyed off displayBoss so the switch lands with the boss-entrance sfx, not the 25th kill.
  useEffect(() => {
    setBgmTrack(game.displayBoss ? "boss" : "field");
  }, [game.displayBoss]);

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

  // The dish whose "완성!" burst is playing (keyed so each collect replays it), and whether
  // the last collect bounced off a full bag.
  const [collected, setCollected] = useState<{ key: number; recipeId: string; great: boolean; isNew: boolean } | null>(null);
  const [cookbookEndingOpen, setCookbookEndingOpen] = useState(false);
  // The opening comic plays once on a new game; story comics follow a boss's first clear
  // (COMIC_ON_FIRST_CLEAR); any reached one can be replayed from settings.
  const openingSeen = (state.seenComics ?? []).includes("opening");
  const [playingComic, setPlayingComic] = useState<ComicId | null>(null);
  const markComicSeen = (id: ComicId) =>
    setState((previous) => ({ ...previous, seenComics: [...new Set([...(previous.seenComics ?? []), id])] }));
  const cookingPots = getCookingPots(state.cookingPots);
  const collectCount = useRef(0);
  const onCollect = (potIndex: number, rush = false) => {
    const recipeId = cookingPots[potIndex]?.recipeId;
    const result = game.collectDish(potIndex, rush);
    if ((result === "ok" || result === "great") && recipeId) {
      const isNew = !(state.cookedRecipes ?? []).includes(recipeId);
      collectCount.current += 1;
      setCollected({ key: collectCount.current, recipeId, great: result === "great", isNew });
    }
    if (result === "full") game.notifyBagFull();
  };
  const collectedRecipe = collected && RECIPES.find((recipe) => recipe.id === collected.recipeId);

  // Once the burst closes, the dish flies from the middle of the screen into its recipe card.
  const finishCollect = () => {
    const recipe = collectedRecipe;
    // That dish filled the book's last page: the epilogue follows the burst.
    if (collected?.isNew && isCookbookComplete(state.cookedRecipes)) setCookbookEndingOpen(true);
    setCollected(null);
    if (!recipe) return;
    measureTarget(`cook-${recipe.id}`).then((to) => {
      if (to) launchFlight({ image: recipe.image, from: "center", to, size: 44, duration: 560, arc: 40 });
    });
  };

  // Scrolls the page so a recipe card (tagged via tutorialRef) sits near the top.
  const scrollRef = useRef<ScrollView>(null);
  const scrollY = useRef(0);
  const showRecipe = (recipeId: string) => {
    const scroll = scrollRef.current;
    Promise.all([
      measureTarget(`cook-${recipeId}`),
      new Promise<number>((resolve) => (scroll as unknown as View | null)?.measureInWindow((_x, y) => resolve(y)) ?? resolve(0)),
    ]).then(([target, top]) => {
      if (target) scroll?.scrollTo({ y: Math.max(0, scrollY.current + target.y - top - 90), animated: true });
    });
  };

  const renderContent = () => {
    switch (state.selectedTab) {
      case "growth":
        return <GrowthScreen game={game} />;
      case "equipment":
        return <EquipmentScreen equipment={state.equipment} />;
      case "companions":
        return (
          <CompanionsHub
            equippedOutfit={state.equippedOutfit}
            highestStageNumber={state.highestStageNumber ?? state.stageNumber}
            outfitsSeen={state.outfitsSeen}
            onSeen={(outfitsSeen) => setState((previous) => ({ ...previous, outfitsSeen }))}
            onEquip={(equippedOutfit) =>
              setState((previous) => (isOutfitUnlocked(equippedOutfit, previous.highestStageNumber ?? previous.stageNumber) ? { ...previous, equippedOutfit } : previous))
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
            bagSeen={state.bagSeen}
            codexSeen={state.codexSeen}
            onSeen={({ bag, codex }) => setState((previous) => ({ ...previous, bagSeen: bag, codexSeen: codex }))}
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
            knownRecipes={state.knownRecipes}
            pots={cookingPots}
            potsUnlocked={getPotsUnlocked(state.potsUnlocked)}
            now={game.now}
            gems={state.gems}
            rushDiscount={game.foodBuffs.rushDiscount}
            onCook={game.cook}
            onCollect={onCollect}
            onRush={(potIndex) => onCollect(potIndex, true)}
            onUnlockPot={game.unlockPot}
            onShowRecipe={showRecipe}
            cookedRecipes={state.cookedRecipes}
            onOpenCookbook={() => onSelectTab("cookbook")}
            onOpenGrocery={() => onSelectTab("grocery")}
            onOpenRecipes={() => onSelectTab("recipes")}
            layout={state.kitchenLayout ?? "list"}
            onLayoutChange={(kitchenLayout) => setState((previous) => ({ ...previous, kitchenLayout }))}
          />
        );
      case "cookbook":
        return (
          <CookbookScreen
            cookedRecipes={state.cookedRecipes}
            knownRecipes={state.knownRecipes}
            clearedStages={game.clearedStages}
            gold={state.gold}
            onBack={() => onSelectTab("kitchen")}
            onOpenEnding={() => setCookbookEndingOpen(true)}
          />
        );
      case "recipes":
        return (
          <RecipeShopScreen
            knownRecipes={state.knownRecipes}
            clearedStages={game.clearedStages}
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
            discount={game.foodBuffs.groceryDiscount}
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
            seenStage={state.mapSeenStage}
            onSeen={(mapSeenStage) => setState((previous) => ({ ...previous, mapSeenStage }))}
            onBack={() => onSelectTab("battle")}
            onOpenComics={() => onSelectTab("comics")}
          />
        );
      case "comics":
        return (
          <ComicsScreen
            clearedStages={game.clearedStages}
            allUnlocked={state.allComicsUnlocked ?? false}
            seenComics={state.seenComics}
            onPlay={setPlayingComic}
            onBack={() => onSelectTab("milestone")}
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
          onOpenComics={() => onSelectTab("comics")}
          onUnlockAllComics={() => setState((previous) => ({ ...previous, allComicsUnlocked: true, selectedTab: "comics" }))}
        />
        <ScrollView
          key={state.selectedTab}
          ref={scrollRef}
          onScroll={(event) => {
            scrollY.current = event.nativeEvent.contentOffset.y;
          }}
          scrollEventThrottle={32}
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
        >
          {renderContent()}
        </ScrollView>
        <BottomNavigation selected={state.selectedTab} onSelect={onSelectTab} />
        {questOpen && (
          <QuestModal state={state} gems={state.gems} onClose={() => setQuestOpen(false)} onClaim={claimQuest} />
        )}
        {game.offlineSummary && (
          <OfflineRewardModal
            summary={game.offlineSummary}
            onClaim={game.dismissOfflineSummary}
            onClaimDouble={game.claimOfflineDouble}
          />
        )}
        {game.firstClear && (
          <FirstClearCelebration
            key={game.firstClear.key}
            bossName={game.firstClear.bossName}
            gems={game.firstClear.gems}
            companions={game.firstClear.companions}
            onDone={() => {
              // A story comic waiting on this boss plays once the celebration closes.
              const comic = COMIC_ON_FIRST_CLEAR[game.firstClear!.stageNumber];
              game.dismissFirstClear();
              if (comic && !(state.seenComics ?? []).includes(comic)) setPlayingComic(comic);
            }}
          />
        )}
        {game.bagFullAt !== null && (
          <BagFullModal onOpenBag={() => onSelectTab("inventory")} onClose={game.dismissBagFull} />
        )}
        {/* Waits for the save to load (so returning players never see it flash) and for the offline popup. */}
        {/* A brand-new game opens on the story comic, then the tutorial picks up after it. */}
        {game.loaded && !state.tutorialDone && !openingSeen && !game.offlineSummary && !playingComic && (
          <ComicViewer id="opening" onClose={() => markComicSeen("opening")} />
        )}
        {playingComic && (
          <ComicViewer
            key={playingComic}
            id={playingComic}
            onClose={() => {
              markComicSeen(playingComic);
              setPlayingComic(null);
            }}
          />
        )}
        {game.loaded && !state.tutorialDone && openingSeen && !game.offlineSummary && (
          <TutorialOverlay onFinish={() => setState((previous) => ({ ...previous, tutorialDone: true }))} />
        )}
        {game.loaded && state.tutorialDone && !state.recipeTutorialDone && recipeTutorialArmed && !game.offlineSummary && (
          <RecipeTutorial
            tab={state.selectedTab}
            knowsFirstRecipe={getKnownRecipes(state.knownRecipes).includes("green-jelly")}
            canCookFirst={canCook(state.inventory, RECIPES.find((recipe) => recipe.id === "green-jelly")!)}
            dishesCooked={state.dishesCooked ?? 0}
            firstDishPot={cookingPots.findIndex((pot) => pot?.recipeId === "green-jelly")}
            dishesEaten={state.dishesEaten ?? 0}
            freeSlotIndex={Math.max(0, game.buffSlots.findIndex((slot, index) => index < (state.buffSlotsUnlocked ?? 1) && (!slot || slot.expiresAt <= game.now)))}
            onGoTo={onSelectTab}
            onFinish={() => setState((previous) => ({ ...previous, recipeTutorialDone: true }))}
          />
        )}
        {collected && collectedRecipe && (
          <CookCompleteBurst
            key={collected.key}
            dishName={collectedRecipe.name}
            dishImage={collectedRecipe.image}
            great={collected.great}
            isNew={collected.isNew}
            // The page count after this dish — it's already in cookedRecipes by now.
            pageText={collected.isNew ? `요리책 ${getCookbookProgress(state.cookedRecipes)} / ${RECIPES.length}` : undefined}
            onDone={finishCollect}
          />
        )}
        {cookbookEndingOpen && <CookbookEnding onClose={() => setCookbookEndingOpen(false)} />}
        <FlightLayer />
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
