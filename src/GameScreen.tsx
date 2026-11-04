import { useEffect, useRef, useState } from "react";
import { ScrollView, StatusBar, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "./theme";
import { LOOT_COIN_GAP_MS, LOOT_COINS, LOOT_FLIGHT_MS, useGameState } from "./state/useGameState";
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
import { SkillTutorial } from "./components/SkillTutorial";
import { CookCompleteBurst } from "./components/CookCompleteBurst";
import { FlightLayer, launchFlight } from "./components/FlightLayer";
import { ComicViewer } from "./components/ComicViewer";
import { COMIC_ON_FIRST_CLEAR, type ComicId } from "./state/comics";
import { ComicsScreen } from "./screens/ComicsScreen";
import { measureTarget } from "./components/tutorialTargets";
import { getCookingPots, getPotsUnlocked } from "./state/cooking";
import { canCook, getKnownRecipes, RECIPES, ITEM_IMAGES } from "./state/recipes";
import { isOutfitUnlocked } from "./state/unlocks";
import { BGM_GROUP, getEnemyKind } from "./state/stages";
import { setBgmTrack } from "./sound";
import { UpgradeTutorial } from "./components/UpgradeTutorial";
import { getStatLevel, getUpgradeCost } from "./state/gameMath";
import { MiniGuide } from "./components/MiniGuide";
import { uiImages } from "./assets";
import type { Tab } from "./types";

// Kills on the post-intro gift: one-hit kills that pay for the first upgrade and the
// recipe tutorial's 초록 젤리.
const GIFT_KILLS = 3;
// A beat to look at the stage between closing the intro and the gift kicking in.
const GIFT_PAUSE_MS = 2000;

export function GameScreen() {
  // Declared ahead of useGameState so it can tell that hook to pause battle while a comic
  // (a real cutscene — full-screen, has to be read/dismissed) is up; this is
  // presentation/navigation state GameScreen already owns, not something useGameState itself
  // needs to track. comicPaused is synced a beat later (see the effect below it needs
  // game.loaded/game.state to compute "is the opening comic showing", which don't exist
  // until after this first useGameState call), rather than read directly here — passing
  // playingComic alone would miss the opening comic.
  const [playingComic, setPlayingComic] = useState<ComicId | null>(null);
  const [comicPaused, setComicPaused] = useState(false);
  const game = useGameState({ externallyPaused: comicPaused });
  const { state, setState, questOpen, setQuestOpen, claimQuest } = game;

  // Lives here rather than in BattleScreen so the right track keeps playing on other tabs.
  // Keyed off displayBoss (not the raw 25th-kill moment) so the switch lands with the
  // boss-entrance sfx, and off the same "stage during a boss's death clip" stage number
  // BattleScreen's own display uses, so the region doesn't flip mid-transition.
  const bgmStageNumber = game.isBossDefeatFlash ? game.defeatedStageNumber : state.stageNumber;
  const bgmGroup = BGM_GROUP[getEnemyKind(bgmStageNumber)];
  useEffect(() => {
    setBgmTrack(bgmGroup, game.displayBoss);
  }, [bgmGroup, game.displayBoss]);

  const onSelectTab = (selectedTab: Tab) => setState((previous) => ({ ...previous, selectedTab }));

  // The recipe tutorial opens after a beat (so the last drop finishes flying into the bag)
  // once the player has gathered 3 초록 젤리 from slimes — exactly one 말랑 초록 젤리's
  // worth, so the tutorial ends in a dish they can actually cook.
  const hasJelly = (state.inventory.find((item) => item.name === "초록 젤리")?.quantity ?? 0) >= 3;
  const [recipeTutorialArmed, setRecipeTutorialArmed] = useState(false);
  const recipeTutorialDue = hasJelly && Boolean(state.upgradeTutorialDone) && !state.recipeTutorialDone;
  useEffect(() => {
    if (!recipeTutorialDue || recipeTutorialArmed) return;
    const timer = setTimeout(() => {
      setRecipeTutorialArmed(true);
      // On the house: the first recipe's price in gold (there's no starting gold) and one
      // gem to finish the dish on the spot.
      setState((previous) => {
        if (previous.recipeGiftGiven) return previous;
        const price = RECIPES.find((recipe) => recipe.id === "green-jelly")?.price ?? 0;
        return { ...previous, gold: previous.gold + price, gems: previous.gems + 1, recipeGiftGiven: true };
      });
    }, 1600);
    return () => clearTimeout(timer);
  }, [recipeTutorialDue, recipeTutorialArmed, setState]);

  // The upgrade tutorial follows the gift kills, after a beat for the last gold to land.
  const giftDone = Boolean(state.tutorialDone) && (state.giftKills ?? 0) === 0;
  const [upgradeTutorialArmed, setUpgradeTutorialArmed] = useState(false);
  useEffect(() => {
    if (!giftDone || upgradeTutorialArmed) return;
    const timer = setTimeout(() => setUpgradeTutorialArmed(true), 1500);
    return () => clearTimeout(timer);
  }, [giftDone, upgradeTutorialArmed]);

  // The skill tutorial opens once 훔치기 unlocks — after a beat, so it doesn't collide with
  // the level-up burst and "새 스킬 해금!" toast (held 2800ms, see useGameState).
  // Every tutorial below also waits out the first-clear celebration: it stays up until the
  // player picks "watch an ad" or "skip", and a tutorial's dim on top would block both.
  const [skillTutorialArmed, setSkillTutorialArmed] = useState(false);
  useEffect(() => {
    if (!game.skillTutorialActive || skillTutorialArmed) return;
    const timer = setTimeout(() => setSkillTutorialArmed(true), 3000);
    return () => clearTimeout(timer);
  }, [game.skillTutorialActive, skillTutorialArmed]);

  // The dish whose "완성!" burst is playing (keyed so each collect replays it), and whether
  // the last collect bounced off a full bag.
  const [collected, setCollected] = useState<{ key: number; recipeId: string; great: boolean; isNew: boolean } | null>(null);
  const [cookbookEndingOpen, setCookbookEndingOpen] = useState(false);
  // The opening comic plays once on a new game; story comics follow a boss's first clear
  // (COMIC_ON_FIRST_CLEAR); any reached one can be replayed from settings.
  const openingSeen = (state.seenComics ?? []).includes("opening");
  // Mirrors the opening ComicViewer's own render condition below — kept in sync via effect
  // (see comicPaused's declaration) rather than computed inline, so useGameState can be told
  // about it without a circular dependency on the game state it itself owns. Deferred via
  // setTimeout (react-hooks/set-state-in-effect), same as useGameState's own boss-timer and
  // boss-skill effects — the condition is still evaluated synchronously every render, only
  // the resulting state change is pushed to a fresh macrotask.
  const openingComicShowing = game.loaded && !state.tutorialDone && !openingSeen && !game.offlineSummary && !playingComic;
  useEffect(() => {
    const next = openingComicShowing || playingComic !== null;
    const timer = setTimeout(() => setComicPaused(next), 0);
    return () => clearTimeout(timer);
  }, [openingComicShowing, playingComic]);
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
              setState((previous) =>
                isOutfitUnlocked(equippedOutfit, previous.highestStageNumber ?? previous.stageNumber, previous.purchasedOutfits) ? { ...previous, equippedOutfit } : previous,
              )
            }
            gems={state.gems}
            purchasedOutfits={state.purchasedOutfits}
            onPurchase={game.purchaseOutfit}
            onOpenShop={() => onSelectTab("shop")}
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
            enemyKind={getEnemyKind(state.stageNumber)}
            outfit={state.equippedOutfit}
          />
        );
      case "shop":
        return <ShopScreen game={game} />;
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
          onAddGems={() => game.cheatAddGems(10000)}
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
          // The village runs edge to edge, down under the nav bar's rim (no padding gap).
          contentContainerStyle={[styles.contentContainer, state.selectedTab === "companions" && styles.contentFlush]}
        >
          {renderContent()}
        </ScrollView>
        <View style={state.selectedTab === "companions" && styles.navOverlap}>
          <BottomNavigation selected={state.selectedTab} onSelect={onSelectTab} />
        </View>
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
            onClaimAd={game.claimFirstClearGems}
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
        {openingComicShowing && (
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
          <TutorialOverlay onFinish={() => setState((previous) => ({ ...previous, tutorialDone: true, giftKills: GIFT_KILLS, giftStartsAt: Date.now() + GIFT_PAUSE_MS }))} />
        )}
        {/* First gift kill (after the intro): the loot sits frozen on the stage while 모험기니
            explains it — gold first, then ingredients — and each tap sends that part flying
            where it belongs. No arrows; the flight itself shows where it goes. */}
        {game.heldLoot && (game.heldLoot.stage === "gold" || game.heldLoot.stage === "items") && state.selectedTab === "battle" && (
          <MiniGuide
            key={game.heldLoot.stage}
            // The loot itself sits on the stage under this guide — tapping it (or anywhere)
            // picks it up, not just the speech bubble.
            tapAnywhere
            line={
              game.heldLoot.stage === "gold"
                ? "쓰러뜨렸다! 몬스터가 **골드**를 떨어뜨렸어.\n눌러서 **골드 칸**에 담아 보자!"
                : "**초록 젤리**도 떨어졌어! 이런 **재료**는\n**가방**에 모아 뒀다가 요리에 써."
            }
            onTap={() => {
              const loot = game.heldLoot;
              if (!loot) return;
              const gold = loot.stage === "gold";
              // Slow, deliberate flights so the player can follow where it goes.
              Promise.all([measureTarget(gold ? "loot-gold" : "loot-items"), measureTarget(gold ? "header-gold" : "bag")]).then(([from, to]) => {
                if (from && to) {
                  // Coins go up one at a time (each credited as it lands); ingredients follow suit.
                  const images = gold ? Array.from({ length: LOOT_COINS }, () => uiImages.coin) : loot.items.map((item) => ITEM_IMAGES[item.name]);
                  images.forEach((image, index) => launchFlight({ image, from, to, delay: index * LOOT_COIN_GAP_MS, size: gold ? 26 : 34, duration: LOOT_FLIGHT_MS, arc: 70 }));
                }
              });
              if (gold) game.collectHeldGold();
              else game.collectHeldItems();
            }}
          />
        )}
        {game.loaded && state.tutorialDone && !state.upgradeTutorialDone && upgradeTutorialArmed && !game.offlineSummary && !game.firstClear && state.selectedTab === "battle" && (
          <UpgradeTutorial
            attackUpgrades={state.attackUpgrades}
            canAfford={state.gold >= getUpgradeCost("attack", getStatLevel(state, "attack"))}
            onFinish={() => setState((previous) => ({ ...previous, upgradeTutorialDone: true }))}
          />
        )}
        {game.loaded && state.tutorialDone && state.upgradeTutorialDone && !state.recipeTutorialDone && recipeTutorialArmed && !game.offlineSummary && !game.firstClear && (
          <RecipeTutorial
            tab={state.selectedTab}
            knowsFirstRecipe={getKnownRecipes(state.knownRecipes).includes("green-jelly")}
            canCookFirst={canCook(state.inventory, RECIPES.find((recipe) => recipe.id === "green-jelly")!)}
            dishesCooked={state.dishesCooked ?? 0}
            firstDishPot={cookingPots.findIndex((pot) => pot?.recipeId === "green-jelly")}
            firstDishReady={cookingPots.some((pot) => pot?.recipeId === "green-jelly" && pot.readyAt <= game.now)}
            dishesEaten={state.dishesEaten ?? 0}
            freeSlotIndex={Math.max(0, game.buffSlots.findIndex((slot, index) => index < (state.buffSlotsUnlocked ?? 1) && (!slot || slot.expiresAt <= game.now)))}
            onGoTo={onSelectTab}
            onFinish={() => setState((previous) => ({ ...previous, recipeTutorialDone: true }))}
          />
        )}
        {game.loaded && game.skillTutorialActive && skillTutorialArmed && !game.offlineSummary && !game.firstClear && (
          <SkillTutorial
            tab={state.selectedTab}
            equippedSkill={state.equippedSkill ?? null}
            skillTimers={game.battle.skillTimers}
            onGoTo={onSelectTab}
            onFinish={() => setState((previous) => ({ ...previous, skillTutorialDone: true }))}
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
  contentFlush: { paddingBottom: 0 },
  // Pulled up over the bottom of the page so the map shows behind the nav's rounded rim.
  navOverlap: { marginTop: -18 },
});
