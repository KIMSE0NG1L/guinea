import { useState } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { Text } from "../components/GameText";
import { SearchBox } from "../components/SearchBox";
import { matchesSearch } from "../state/search";
import Svg, { Rect } from "react-native-svg";
import { colors, fonts } from "../theme";
import { chef, frameKit, grandma, kit } from "../assets";
import { ProgressBar } from "../components/ProgressBar";
import { getCookbookProgress } from "../state/cookbook";
import { MINIGAME_DIFFICULTY } from "../state/cookingMinigame";
import { CookingMinigame } from "../components/CookingMinigame";
import { CookingPots } from "../components/CookingPots";
import type { CookingPot } from "../state/cooking";
import { launchFlight } from "../components/FlightLayer";
import { measureTarget } from "../components/tutorialTargets";
import { DishSetGuide } from "../components/DishSetGuide";
import { SEALED_RECIPE } from "../state/recipeTiers";
import { BUFFS, describeDish, describeDishLinks, type CookGrade } from "../state/buffs";
import { BalancedRows, estimateTextWidth } from "../components/BalancedLines";
import { PageHeading } from "../components/PageHeading";
import { GameButton } from "../components/GameButton";
import { NineSlice, Panel } from "../components/NineSlice";
import { canCook, getItemQuantity, getKnownRecipes, ITEM_IMAGES, RECIPES } from "../state/recipes";
import { IconCaption } from "../components/IconCaption";
import { CoinPrice } from "../components/CoinPrice";
import { getShortfall } from "../state/grocery";
import type { GameState } from "../types";
import { t } from "../i18n";
import type { RecipeTier } from "../state/recipeTiers";

const DIFFICULTY_LABEL_EN: Record<RecipeTier, string> = { common: "Easy", rare: "Normal", epic: "Hard", legendary: "Very Hard", hidden: "Extreme" };

export type KitchenLayout = "list" | "grid";

const EFFECT_FONT = 12;
const INGREDIENT_FONT = 12;
const INGREDIENT_ICON = 16;

// ["공격력 +10%", "세트: 디저트 타임"] — what eating the dish does and its set/partner, as
// separate parts so a long list can break between them. How long it lasts depends on the
// cooking minigame's grade, not the recipe — see DishPicker, which shows that per-unit.
function describeBuffParts(recipeId: string) {
  const buff = BUFFS[recipeId];
  if (!buff) return [];
  return [...describeDish(recipeId).split(" · "), ...describeDishLinks(recipeId)];
}

// Toggle glyphs: three bars for the list, a 2×2 of squares for the cards.
function LayoutIcon({ mode, active }: { mode: KitchenLayout; active: boolean }) {
  const color = active ? colors.ink : "#9b8466";
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18">
      {mode === "list" ? (
        [3, 8, 13].map((y) => <Rect key={y} x={2} y={y} width={14} height={3} rx={1.5} fill={color} />)
      ) : (
        [[2, 2], [10, 2], [2, 10], [10, 10]].map(([x, y]) => <Rect key={`${x}-${y}`} x={x} y={y} width={6} height={6} rx={1.5} fill={color} />)
      )}
    </Svg>
  );
}

export function KitchenScreen({
  inventory,
  knownRecipes,
  cookSpeedPercent,
  pots,
  potsUnlocked,
  gems,
  gold,
  groceryDiscount,
  priceStage,
  onCook,
  onBuyAndCook,
  onCollect,
  onUnlockPot,
  guideRecipeId,
  cookedRecipes,
  onOpenCookbook,
  onOpenGrocery,
  onOpenRecipes,
  layout,
  onLayoutChange,
}: {
  inventory: GameState["inventory"];
  knownRecipes: string[] | undefined;
  // Widens the cooking minigame's target zone — see state/cookingMinigame.ts's getZoneWidth.
  cookSpeedPercent: number;
  pots: CookingPot[];
  potsUnlocked: number;
  gems: number;
  gold: number;
  // Food-buff % off grocery prices, for the "buy what's missing" cost.
  groceryDiscount: number;
  // The stage grocery prices are set by (see getGroceryPrice).
  priceStage: number;
  // Puts a dish straight into the first free pot, done at once (ingredients spent now).
  onCook: (recipeId: string) => "ok" | "noPot" | "unavailable";
  // Buys the missing ingredients from the grocery and starts the dish (see buyMissingAndCook).
  onBuyAndCook: (recipeId: string) => "ok" | "gold" | "noPot" | "unavailable";
  // Takes a done pot's dish out at the grade its minigame scored.
  onCollect: (potIndex: number, grade: CookGrade) => void;
  onUnlockPot: () => boolean;
  // During the recipe tutorial: the dish whose minigame gets the first-round guide arrow.
  guideRecipeId?: string;
  cookedRecipes: string[] | undefined;
  onOpenCookbook: () => void;
  onOpenGrocery: () => void;
  onOpenRecipes: () => void;
  layout: KitchenLayout;
  onLayoutChange: (layout: KitchenLayout) => void;
}) {
  const known = getKnownRecipes(knownRecipes);
  const freePotIndex = pots.findIndex((pot, index) => index < potsUnlocked && !pot);
  const freePot = freePotIndex >= 0;
  // Ingredients hop from the recipe card into the pot the dish is going into.
  const startCooking = (recipe: (typeof RECIPES)[number], buyMissing = false) => {
    const result = buyMissing ? onBuyAndCook(recipe.id) : onCook(recipe.id);
    if (result !== "ok") return;
    Promise.all([measureTarget(`cook-${recipe.id}`), measureTarget(`cook-pot-${freePotIndex}`)]).then(([from, to]) => {
      if (!from || !to) return;
      recipe.ingredients.forEach((ingredient, index) => {
        const image = ITEM_IMAGES[ingredient.name];
        if (image !== undefined) launchFlight({ image, from, to, delay: index * 90, duration: 480, arc: 60 });
      });
    });
  };
  // The done pot whose cooking minigame is playing (null = none). Tapping a ready pot opens
  // it; 그만두기 just closes it and the pot stays ready for later.
  const [finishingPot, setFinishingPot] = useState<number | null>(null);
  const finishingDish = finishingPot !== null ? pots[finishingPot] : null;
  const cookingRecipe = finishingDish ? RECIPES.find((recipe) => recipe.id === finishingDish.recipeId) : undefined;
  // What can be cooked right now floats to the top; otherwise recipe order is kept.
  const recipes = RECIPES.filter((recipe) => known.includes(recipe.id))
    .map((recipe) => ({ recipe, cookable: canCook(inventory, recipe) }))
    .sort((a, b) => Number(b.cookable) - Number(a.cookable))
    .map(({ recipe }) => recipe);
  const unlearned = RECIPES.length - recipes.length;
  // Search by dish name or any ingredient in it.
  const [query, setQuery] = useState("");
  const shown = recipes.filter((recipe) => matchesSearch(query, recipe.name, ...recipe.ingredients.map((ingredient) => ingredient.name)));

  return (
    <View style={styles.page}>
      <View style={styles.headingRow}>
        <View style={styles.heading}>
          <PageHeading kicker="COOKING" title={t("기니의 부엌", "Gini's Kitchen")} description={t("재료를 모아 배고픈 기니에게 한 끼를.", "Gather ingredients and cook a meal for a hungry Gini.")} />
        </View>
        <View style={styles.shopButtons}>
          <GameButton variant="red" onPress={onOpenGrocery} accessibilityLabel={t("재료 상점 열기", "Open ingredient shop")} style={styles.shopButton}>
            <View style={styles.shopContent}>
              <Image source={grandma.basket} style={styles.shopImage} />
              <Text style={styles.shopText}>{t("재료", "Shop")}</Text>
            </View>
          </GameButton>
          <GameButton variant="pillCream" onPress={onOpenRecipes} tutorialId="kitchen-recipes" accessibilityLabel={t("레시피 상점 열기", "Open recipe shop")} style={styles.shopButton}>
            <View style={styles.shopContent}>
              <Image source={chef.spoon} style={styles.shopImage} />
              <Text style={[styles.shopText, styles.shopTextDark]}>{t("레시피", "Recipes")}</Text>
            </View>
          </GameButton>
        </View>
      </View>

      <CookingPots
        pots={pots}
        potsUnlocked={potsUnlocked}
        gems={gems}
        suggestion={recipes.find((recipe) => canCook(inventory, recipe)) ?? null}
        onCollect={setFinishingPot}
        onUnlock={onUnlockPot}
        onShowRecipe={(recipeId) => setQuery(RECIPES.find((recipe) => recipe.id === recipeId)?.name ?? "")}
      />
      <Pressable
        onPress={onOpenCookbook}
        accessibilityRole="button"
        accessibilityLabel={t("요리책 열기", "Open cookbook")}
        style={({ pressed }) => [styles.cookbook, pressed && styles.pressed]}
      >
        <Panel slice={kit.panelParchment} scale={0.5} style={styles.cookbookCard}>
          <Image source={chef.book} style={styles.cookbookImage} />
          <View style={styles.cookbookCopy}>
            <Text style={styles.cookbookTitle}>
              {t("요리책 《세상의 모든 맛》", "Cookbook: Every Flavor in the World")} <Text style={styles.cookbookCount}>{getCookbookProgress(cookedRecipes)} / {RECIPES.length}</Text>
            </Text>
            <ProgressBar progress={(getCookbookProgress(cookedRecipes) / RECIPES.length) * 100} height={12} />
          </View>
        </Panel>
      </Pressable>
      <DishSetGuide known={known} />

      <View style={styles.toolbar}>
        <Text style={styles.toolbarText}>{t(`아는 레시피 ${recipes.length}개`, `${recipes.length} Known Recipes`)}</Text>
        <View style={styles.layoutToggle}>
          {(["list", "grid"] as KitchenLayout[]).map((mode) => (
            <Pressable
              key={mode}
              onPress={() => onLayoutChange(mode)}
              accessibilityRole="button"
              accessibilityLabel={mode === "list" ? t("목록으로 보기", "View as list") : t("카드로 보기", "View as cards")}
              accessibilityState={{ selected: layout === mode }}
              hitSlop={4}
              style={({ pressed }) => [styles.layoutButton, pressed && styles.pressed]}
            >
              <NineSlice slice={layout === mode ? frameKit.squareGold : frameKit.squareWood} scale={0.35} />
              {/* Wrapped so it stacks above the absolutely-positioned frame on web. */}
              <View>
                <LayoutIcon mode={mode} active={layout === mode} />
              </View>
              <IconCaption size={12} offset={-12}>{mode === "list" ? t("목록", "List") : t("카드", "Cards")}</IconCaption>
            </Pressable>
          ))}
        </View>
      </View>

      <SearchBox value={query} onChange={setQuery} placeholder={t("요리나 재료 이름으로 찾기", "Search by dish or ingredient name")} resultCount={shown.length} />
      <View style={layout === "grid" ? styles.grid : styles.list}>
        {shown.map((recipe) => {
          const ready = canCook(inventory, recipe);
          const owned = getItemQuantity(inventory, recipe.name);
          // Bag room is checked when the dish comes out of the pot, not when it goes in.
          const cookable = ready && freePot;
          const ingredientLabels = recipe.ingredients.map(
            (ingredient) => `${layout === "grid" ? "" : `${t(ingredient.name)} `}${getItemQuantity(inventory, ingredient.name)}/${ingredient.quantity}`,
          );
          const ingredientChips = recipe.ingredients.map((ingredient, index) => (
            <View style={styles.ingredient} key={ingredient.name}>
              {ITEM_IMAGES[ingredient.name] !== undefined && (
                <Image source={ITEM_IMAGES[ingredient.name]} style={styles.ingredientImage} />
              )}
              <Text style={[styles.ingredientText, getItemQuantity(inventory, ingredient.name) < ingredient.quantity && styles.ingredientShort]}>
                {ingredientLabels[index]}
              </Text>
            </View>
          ));
          // Rows balanced by width, so a long list breaks into even lines instead of a
          // full line plus a straggler.
          const ingredients = (
            <BalancedRows
              items={ingredientChips}
              widths={ingredientLabels.map((label) => INGREDIENT_ICON + 2 + estimateTextWidth(label, INGREDIENT_FONT))}
              gap={6}
              align={layout === "grid" ? "center" : "flex-start"}
            />
          );
          // Short on ingredients the grocery sells: one button buys the rest and starts it.
          const shortfall = !ready && freePot ? getShortfall(inventory, recipe.ingredients, groceryDiscount, priceStage) : null;
          const affordable = shortfall !== null && gold >= shortfall.cost;
          const cookButton = shortfall ? (
            <GameButton
              variant={affordable ? "cream" : "gray"}
              disabled={!affordable}
              onPress={() => startCooking(recipe, true)}
              tutorialId={`cook-${recipe.id}`}
              accessibilityLabel={t(
                `부족한 재료를 ${shortfall.cost}골드에 사서 ${recipe.name} 요리하기`,
                `Buy missing ingredients for ${shortfall.cost} gold and cook ${t(recipe.name)}`,
              )}
              style={layout === "grid" ? styles.gridCookButton : styles.cookButton}
            >
              <View style={styles.buyCook}>
                <Text style={[styles.cookButtonText, styles.buyCookText]}>{t("사서 요리", "Buy & Cook")}</Text>
                <CoinPrice amount={shortfall.cost} textStyle={[styles.buyCookCost, !affordable && styles.buyCookCostShort]} />
              </View>
            </GameButton>
          ) : (
            <GameButton
              variant={cookable ? "green" : "gray"}
              disabled={!cookable}
              onPress={() => startCooking(recipe)}
              tutorialId={`cook-${recipe.id}`}
              style={layout === "grid" ? styles.gridCookButton : styles.cookButton}
              textStyle={styles.cookButtonText}
            >
              {!ready ? t("재료 부족", "Missing Ingredients") : freePot ? t("요리하기", "Cook") : t("냄비 가득", "Pots Full")}
            </GameButton>
          );
          const effectParts = [...describeBuffParts(recipe.id), `🎯${t(MINIGAME_DIFFICULTY[recipe.tier].label, DIFFICULTY_LABEL_EN[recipe.tier])}`];
          const effect = (
            <BalancedRows
              items={effectParts}
              widths={effectParts.map((part) => estimateTextWidth(part, EFFECT_FONT))}
              gap={estimateTextWidth(" · ", EFFECT_FONT)}
              rowGap={0}
              align={layout === "grid" ? "center" : "flex-start"}
              style={styles.effectBox}
              renderRow={(row) => <Text style={styles.effect}>{row.map((index) => effectParts[index]).join(" · ")}</Text>}
            />
          );

          if (layout === "grid") {
            return (
              <Panel slice={ready ? kit.panel : kit.inset} scale={0.4} style={styles.gridCard} key={recipe.id}>
                {owned > 0 && (
                  <View style={styles.ownedTag}>
                    <Text style={styles.ownedTagText}>{t(`보유 ${owned}`, `Have ${owned}`)}</Text>
                  </View>
                )}
                <Image source={recipe.image} style={[styles.gridDish, !ready && styles.dishShort]} />
                <Text style={styles.gridName} numberOfLines={1}>{t(recipe.name)}</Text>
                <Text style={styles.gridDescription} numberOfLines={2}>{t(recipe.description)}</Text>
                {effect}
                <View style={[styles.ingredients, styles.gridIngredients]}>{ingredients}</View>
                {cookButton}
              </Panel>
            );
          }
          return (
            <Panel slice={ready ? kit.panel : kit.inset} style={styles.card} key={recipe.id}>
              <Image source={recipe.image} style={[styles.dish, !ready && styles.dishShort]} />
              <View style={styles.cardCopy}>
                <View style={styles.titleRow}>
                  <Text style={styles.cardStrong}>{t(recipe.name)}</Text>
                  {owned > 0 && <Text style={styles.owned}>{t(`보유 ${owned}`, `Have ${owned}`)}</Text>}
                </View>
                <Text style={styles.cardSpan}>{t(recipe.description)}</Text>
                {effect}
                <View style={styles.ingredients}>{ingredients}</View>
              </View>
              {cookButton}
            </Panel>
          );
        })}
        {unlearned > 0 &&
          (layout === "grid" ? (
            <Panel slice={kit.inset} scale={0.4} style={styles.gridCard}>
              <Image source={SEALED_RECIPE} style={styles.gridDish} />
              <Text style={styles.gridName}>{t(`배울 레시피 ${unlearned}개`, `${unlearned} Recipes to Learn`)}</Text>
              <Text style={styles.gridDescription} numberOfLines={2}>{t("셰프 기니한테 새 요리를 배워 봐요.", "Learn new dishes from Chef Gini.")}</Text>
              <GameButton variant="red" onPress={onOpenRecipes} style={styles.gridCookButton} textStyle={styles.cookButtonText}>
                {t("배우러 가기", "Go Learn")}
              </GameButton>
            </Panel>
          ) : (
            <Panel slice={kit.inset} style={styles.more}>
              <Image source={SEALED_RECIPE} style={styles.moreImage} />
              <Text style={styles.moreText}>{t(`아직 배우지 않은 레시피가 ${unlearned}개 있어요.`, `There are ${unlearned} recipes you haven't learned yet.`)}</Text>
              <GameButton variant="red" onPress={onOpenRecipes} style={styles.cookButton} textStyle={styles.cookButtonText}>
                {t("배우러 가기", "Go Learn")}
              </GameButton>
            </Panel>
          ))}
      </View>
      {finishingPot !== null && cookingRecipe && (
        <CookingMinigame
          recipe={cookingRecipe}
          cookSpeedPercent={cookSpeedPercent}
          guideActive={cookingRecipe.id === guideRecipeId}
          onCancel={() => setFinishingPot(null)}
          onFinish={(grade) => {
            onCollect(finishingPot, grade);
            setFinishingPot(null);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: "#e8dcc4", paddingHorizontal: 16, paddingTop: 20, paddingBottom: 25 },
  headingRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  heading: { flex: 1 },
  shopButtons: { marginTop: 8, flexDirection: "row", gap: 5 },
  shopButton: { paddingLeft: 4, paddingRight: 12, minHeight: 40 },
  shopContent: { flexDirection: "row", alignItems: "center", gap: 3 },
  // Pokes up out of the pill a little, like the shopkeeper is peeking over it.
  shopImage: { width: 34, height: 34, marginTop: -10 },
  shopText: { fontSize: 14, fontWeight: "900", fontFamily: fonts.bold, color: colors.cream },
  shopTextDark: { color: colors.brown },
  more: { paddingHorizontal: 12, paddingTop: 11, paddingBottom: 13, flexDirection: "row", alignItems: "center", gap: 10 },
  moreImage: { width: 50, height: 50 },
  moreText: { flex: 1, fontSize: 12, fontWeight: "800", fontFamily: fonts.bold, color: colors.brown },
  cookbook: { marginBottom: 12 },
  cookbookCard: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, paddingVertical: 9 },
  cookbookImage: { width: 44, height: 44 },
  cookbookCopy: { flex: 1, gap: 4 },
  cookbookTitle: { fontSize: 12, fontWeight: "900", fontFamily: fonts.bold, color: colors.ink },
  cookbookCount: { color: colors.brown },
  toolbar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18, paddingLeft: 4 },
  toolbarText: { fontSize: 12, fontWeight: "800", fontFamily: fonts.bold, color: colors.brown },
  layoutToggle: { flexDirection: "row", gap: 4 },
  layoutButton: { width: 34, height: 34, alignItems: "center", justifyContent: "center" },
  pressed: { transform: [{ scale: 0.92 }] },
  list: { gap: 10 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 10 },
  gridCard: { width: "48.5%", alignItems: "center", paddingHorizontal: 10, paddingTop: 12, paddingBottom: 12 },
  gridDish: { width: 64, height: 64 },
  gridName: { marginTop: 4, fontSize: 14, fontWeight: "900", fontFamily: fonts.bold, color: colors.ink },
  gridDescription: { fontFamily: fonts.light, letterSpacing: -0.36, marginTop: 2, minHeight: 34, fontSize: 12, lineHeight: 16, color: colors.muted, textAlign: "center" },
  gridIngredients: { justifyContent: "center", marginBottom: 8 },
  gridCookButton: { alignSelf: "stretch" },
  ownedTag: { position: "absolute", top: 8, right: 8, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: colors.green, zIndex: 1 },
  ownedTagText: { fontSize: 8, fontWeight: "900", fontFamily: fonts.bold, color: colors.cream },
  effectBox: { marginTop: 3 },
  effect: { fontSize: EFFECT_FONT, lineHeight: 17, fontWeight: "900", fontFamily: fonts.bold, color: "#b0632a" },
  card: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 16, flexDirection: "row", alignItems: "center", gap: 10 },
  dish: { width: 54, height: 54 },
  // Missing ingredients: the dish goes black-and-white (faded too, where filters aren't supported).
  dishShort: { filter: "grayscale(1)", opacity: 0.6 },
  cardCopy: { flex: 1 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  cardStrong: { fontSize: 15, fontWeight: "800", fontFamily: fonts.bold, color: colors.ink },
  owned: { fontSize: 12, fontWeight: "900", fontFamily: fonts.bold, color: colors.green },
  cardSpan: { fontFamily: fonts.light, letterSpacing: -0.36, marginTop: 2, color: colors.muted, fontSize: 12, lineHeight: 16 },
  ingredients: { marginTop: 5, alignSelf: "stretch" },
  ingredient: { flexDirection: "row", alignItems: "center", gap: 2 },
  ingredientImage: { width: INGREDIENT_ICON, height: INGREDIENT_ICON },
  ingredientText: { fontSize: INGREDIENT_FONT, fontWeight: "800", fontFamily: fonts.bold, color: colors.brown },
  ingredientShort: { color: colors.red },
  cookButton: { minWidth: 68 },
  cookButtonText: { fontSize: 12 },
  buyCook: { alignItems: "center" },
  buyCookText: { fontWeight: "900", fontFamily: fonts.bold, color: colors.brown },
  buyCookCost: { fontSize: 12, fontWeight: "900", fontFamily: fonts.bold, color: colors.ink },
  buyCookCostShort: { color: colors.red },
});
