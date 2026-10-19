import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SearchBox } from "../components/SearchBox";
import { matchesSearch } from "../state/search";
import Svg, { Rect } from "react-native-svg";
import { colors, fonts } from "../theme";
import { chef, frameKit, grandma, kit } from "../assets";
import { ProgressBar } from "../components/ProgressBar";
import { getCookbookProgress } from "../state/cookbook";
import { COOK_TIME_MS, formatCookTime, type CookingPot } from "../state/cooking";
import { CookingPots } from "../components/CookingPots";
import { DishSetGuide } from "../components/DishSetGuide";
import { launchFlight } from "../components/FlightLayer";
import { measureTarget } from "../components/tutorialTargets";
import { SEALED_RECIPE } from "../state/recipeTiers";
import { BUFFS, describeDish, describeDishLinks, INSTANT_DISHES } from "../state/buffs";
import { BalancedRows, estimateTextWidth } from "../components/BalancedLines";
import { PageHeading } from "../components/PageHeading";
import { GameButton } from "../components/GameButton";
import { NineSlice, Panel } from "../components/NineSlice";
import { canCook, getItemQuantity, getKnownRecipes, ITEM_IMAGES, RECIPES } from "../state/recipes";
import { IconCaption } from "../components/IconCaption";
import type { GameState } from "../types";

export type KitchenLayout = "list" | "grid";

const EFFECT_FONT = 9;
const INGREDIENT_FONT = 8;
const INGREDIENT_ICON = 16;

// ["공격력 +10%", "3분", "세트: 디저트 타임"] — what eating the dish does, for how long
// (snacks are eaten on the spot), and its set/partner, as separate parts so a long list
// can break between them.
function describeBuffParts(recipeId: string) {
  const buff = BUFFS[recipeId];
  if (!buff) return [];
  const duration = INSTANT_DISHES[recipeId] ? [] : [formatCookTime(buff.durationMs)];
  return [...describeDish(recipeId).split(" · "), ...duration, ...describeDishLinks(recipeId)];
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
  pots,
  potsUnlocked,
  now,
  gems,
  rushDiscount,
  onCook,
  onCollect,
  onRush,
  onUnlockPot,
  onShowRecipe,
  cookedRecipes,
  onOpenCookbook,
  onOpenGrocery,
  onOpenRecipes,
  layout,
  onLayoutChange,
}: {
  inventory: GameState["inventory"];
  knownRecipes: string[] | undefined;
  pots: CookingPot[];
  potsUnlocked: number;
  now: number;
  gems: number;
  rushDiscount: number;
  onCook: (recipeId: string) => void;
  onCollect: (potIndex: number) => void;
  onRush: (potIndex: number) => void;
  onUnlockPot: () => boolean;
  // Scroll the page to a recipe's card.
  onShowRecipe: (recipeId: string) => void;
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
  const startCooking = (recipe: (typeof RECIPES)[number]) => {
    onCook(recipe.id);
    Promise.all([measureTarget(`cook-${recipe.id}`), measureTarget(`cook-pot-${freePotIndex}`)]).then(([from, to]) => {
      if (!from || !to) return;
      recipe.ingredients.forEach((ingredient, index) => {
        const image = ITEM_IMAGES[ingredient.name];
        if (image !== undefined) launchFlight({ image, from, to, delay: index * 90, duration: 480, arc: 60 });
      });
    });
  };
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
          <PageHeading kicker="COOKING" title="기니의 부엌" description="재료를 모아 배고픈 기니에게 한 끼를." />
        </View>
        <View style={styles.shopButtons}>
          <GameButton variant="red" onPress={onOpenGrocery} accessibilityLabel="재료 상점 열기" style={styles.shopButton}>
            <View style={styles.shopContent}>
              <Image source={grandma.basket} style={styles.shopImage} />
              <Text style={styles.shopText}>재료</Text>
            </View>
          </GameButton>
          <GameButton variant="pillCream" onPress={onOpenRecipes} tutorialId="kitchen-recipes" accessibilityLabel="레시피 상점 열기" style={styles.shopButton}>
            <View style={styles.shopContent}>
              <Image source={chef.spoon} style={styles.shopImage} />
              <Text style={[styles.shopText, styles.shopTextDark]}>레시피</Text>
            </View>
          </GameButton>
        </View>
      </View>

      <CookingPots
        pots={pots}
        potsUnlocked={potsUnlocked}
        now={now}
        gems={gems}
        rushDiscount={rushDiscount}
        suggestion={recipes.find((recipe) => canCook(inventory, recipe)) ?? null}
        onCollect={onCollect}
        onRush={onRush}
        onUnlock={onUnlockPot}
        onShowRecipe={onShowRecipe}
      />
      <Pressable
        onPress={onOpenCookbook}
        accessibilityRole="button"
        accessibilityLabel="요리책 열기"
        style={({ pressed }) => [styles.cookbook, pressed && styles.pressed]}
      >
        <Panel slice={kit.panelParchment} scale={0.5} style={styles.cookbookCard}>
          <Image source={chef.book} style={styles.cookbookImage} />
          <View style={styles.cookbookCopy}>
            <Text style={styles.cookbookTitle}>
              요리책 《세상의 모든 맛》 <Text style={styles.cookbookCount}>{getCookbookProgress(cookedRecipes)} / {RECIPES.length}</Text>
            </Text>
            <ProgressBar progress={(getCookbookProgress(cookedRecipes) / RECIPES.length) * 100} height={12} />
          </View>
        </Panel>
      </Pressable>
      <DishSetGuide known={known} />

      <View style={styles.toolbar}>
        <Text style={styles.toolbarText}>아는 레시피 {recipes.length}개</Text>
        <View style={styles.layoutToggle}>
          {(["list", "grid"] as KitchenLayout[]).map((mode) => (
            <Pressable
              key={mode}
              onPress={() => onLayoutChange(mode)}
              accessibilityRole="button"
              accessibilityLabel={mode === "list" ? "목록으로 보기" : "카드로 보기"}
              accessibilityState={{ selected: layout === mode }}
              hitSlop={4}
              style={({ pressed }) => [styles.layoutButton, pressed && styles.pressed]}
            >
              <NineSlice slice={layout === mode ? frameKit.squareGold : frameKit.squareWood} scale={0.35} />
              {/* Wrapped so it stacks above the absolutely-positioned frame on web. */}
              <View>
                <LayoutIcon mode={mode} active={layout === mode} />
              </View>
              <IconCaption size={10} offset={-12}>{mode === "list" ? "목록" : "카드"}</IconCaption>
            </Pressable>
          ))}
        </View>
      </View>

      <SearchBox value={query} onChange={setQuery} placeholder="요리나 재료 이름으로 찾기" resultCount={shown.length} />
      <View style={layout === "grid" ? styles.grid : styles.list}>
        {shown.map((recipe) => {
          const ready = canCook(inventory, recipe);
          const owned = getItemQuantity(inventory, recipe.name);
          // Bag room is checked when the dish comes out of the pot, not when it goes in.
          const cookable = ready && freePot;
          const ingredientLabels = recipe.ingredients.map(
            (ingredient) => `${layout === "grid" ? "" : `${ingredient.name} `}${getItemQuantity(inventory, ingredient.name)}/${ingredient.quantity}`,
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
          const cookButton = (
            <GameButton
              variant={cookable ? "green" : "gray"}
              disabled={!cookable}
              onPress={() => startCooking(recipe)}
              tutorialId={`cook-${recipe.id}`}
              style={layout === "grid" ? styles.gridCookButton : styles.cookButton}
              textStyle={styles.cookButtonText}
            >
              {!ready ? "재료 부족" : freePot ? "요리하기" : "냄비 가득"}
            </GameButton>
          );
          const effectParts = [...describeBuffParts(recipe.id), `⏱${formatCookTime(COOK_TIME_MS[recipe.tier])}`];
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
                    <Text style={styles.ownedTagText}>보유 {owned}</Text>
                  </View>
                )}
                <Image source={recipe.image} style={[styles.gridDish, !ready && styles.dishShort]} />
                <Text style={styles.gridName} numberOfLines={1}>{recipe.name}</Text>
                <Text style={styles.gridDescription} numberOfLines={2}>{recipe.description}</Text>
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
                  <Text style={styles.cardStrong}>{recipe.name}</Text>
                  {owned > 0 && <Text style={styles.owned}>보유 {owned}</Text>}
                </View>
                <Text style={styles.cardSpan}>{recipe.description}</Text>
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
              <Text style={styles.gridName}>배울 레시피 {unlearned}개</Text>
              <Text style={styles.gridDescription} numberOfLines={2}>셰프 기니한테 새 요리를 배워 봐요.</Text>
              <GameButton variant="red" onPress={onOpenRecipes} style={styles.gridCookButton} textStyle={styles.cookButtonText}>
                배우러 가기
              </GameButton>
            </Panel>
          ) : (
            <Panel slice={kit.inset} style={styles.more}>
              <Image source={SEALED_RECIPE} style={styles.moreImage} />
              <Text style={styles.moreText}>아직 배우지 않은 레시피가 {unlearned}개 있어요.</Text>
              <GameButton variant="red" onPress={onOpenRecipes} style={styles.cookButton} textStyle={styles.cookButtonText}>
                배우러 가기
              </GameButton>
            </Panel>
          ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: "#e8dcc4", paddingHorizontal: 12, paddingTop: 18, paddingBottom: 25 },
  headingRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  heading: { flex: 1 },
  shopButtons: { marginTop: 8, flexDirection: "row", gap: 5 },
  shopButton: { paddingLeft: 4, paddingRight: 12, minHeight: 40 },
  shopContent: { flexDirection: "row", alignItems: "center", gap: 3 },
  // Pokes up out of the pill a little, like the shopkeeper is peeking over it.
  shopImage: { width: 34, height: 34, marginTop: -10 },
  shopText: { fontSize: 12, fontWeight: "900", fontFamily: fonts.bold, color: colors.cream },
  shopTextDark: { color: colors.brown },
  more: { paddingHorizontal: 12, paddingTop: 11, paddingBottom: 13, flexDirection: "row", alignItems: "center", gap: 10 },
  moreImage: { width: 50, height: 50 },
  moreText: { flex: 1, fontSize: 11, fontWeight: "800", fontFamily: fonts.bold, color: colors.brown },
  cookbook: { marginBottom: 12 },
  cookbookCard: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, paddingVertical: 9 },
  cookbookImage: { width: 44, height: 44 },
  cookbookCopy: { flex: 1, gap: 4 },
  cookbookTitle: { fontSize: 11, fontWeight: "900", fontFamily: fonts.bold, color: colors.ink },
  cookbookCount: { color: colors.brown },
  toolbar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18, paddingLeft: 4 },
  toolbarText: { fontSize: 11, fontWeight: "800", fontFamily: fonts.bold, color: colors.brown },
  layoutToggle: { flexDirection: "row", gap: 4 },
  layoutButton: { width: 34, height: 34, alignItems: "center", justifyContent: "center" },
  pressed: { transform: [{ scale: 0.92 }] },
  list: { gap: 10 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 10 },
  gridCard: { width: "48.5%", alignItems: "center", paddingHorizontal: 10, paddingTop: 12, paddingBottom: 12 },
  gridDish: { width: 64, height: 64 },
  gridName: { marginTop: 4, fontSize: 12, fontWeight: "900", fontFamily: fonts.bold, color: colors.ink },
  gridDescription: { marginTop: 2, minHeight: 24, fontSize: 9, lineHeight: 12, color: colors.muted, textAlign: "center" },
  gridIngredients: { justifyContent: "center", marginBottom: 8 },
  gridCookButton: { alignSelf: "stretch" },
  ownedTag: { position: "absolute", top: 8, right: 8, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: colors.green, zIndex: 1 },
  ownedTagText: { fontSize: 8, fontWeight: "900", fontFamily: fonts.bold, color: colors.cream },
  effectBox: { marginTop: 3 },
  effect: { fontSize: EFFECT_FONT, lineHeight: 13, fontWeight: "900", fontFamily: fonts.bold, color: "#b0632a" },
  card: { paddingHorizontal: 12, paddingTop: 11, paddingBottom: 13, flexDirection: "row", alignItems: "center", gap: 10 },
  dish: { width: 54, height: 54 },
  // Missing ingredients: the dish goes black-and-white (faded too, where filters aren't supported).
  dishShort: { filter: "grayscale(1)", opacity: 0.6 },
  cardCopy: { flex: 1 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  cardStrong: { fontSize: 13, fontWeight: "800", fontFamily: fonts.bold, color: colors.ink },
  owned: { fontSize: 8, fontWeight: "900", fontFamily: fonts.bold, color: colors.green },
  cardSpan: { marginTop: 2, color: colors.muted, fontSize: 9 },
  ingredients: { marginTop: 5, alignSelf: "stretch" },
  ingredient: { flexDirection: "row", alignItems: "center", gap: 2 },
  ingredientImage: { width: INGREDIENT_ICON, height: INGREDIENT_ICON },
  ingredientText: { fontSize: INGREDIENT_FONT, fontWeight: "800", fontFamily: fonts.bold, color: colors.brown },
  ingredientShort: { color: colors.red },
  cookButton: { minWidth: 68 },
  cookButtonText: { fontSize: 9 },
});
