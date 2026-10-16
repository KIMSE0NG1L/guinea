import { Image, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { chef, grandma, kit } from "../assets";
import { SEALED_RECIPE } from "../state/recipeTiers";
import { PageHeading } from "../components/PageHeading";
import { GameButton } from "../components/GameButton";
import { Panel } from "../components/NineSlice";
import { canCook, getItemQuantity, getKnownRecipes, ITEM_IMAGES, RECIPES } from "../state/recipes";
import type { GameState } from "../types";

export function KitchenScreen({
  inventory,
  bagCapacity,
  knownRecipes,
  onCook,
  onOpenGrocery,
  onOpenRecipes,
}: {
  inventory: GameState["inventory"];
  bagCapacity: number;
  knownRecipes: string[] | undefined;
  onCook: (recipeId: string) => void;
  onOpenGrocery: () => void;
  onOpenRecipes: () => void;
}) {
  const known = getKnownRecipes(knownRecipes);
  const recipes = RECIPES.filter((recipe) => known.includes(recipe.id));
  const unlearned = RECIPES.length - recipes.length;

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
          <GameButton variant="pillCream" onPress={onOpenRecipes} accessibilityLabel="레시피 상점 열기" style={styles.shopButton}>
            <View style={styles.shopContent}>
              <Image source={chef.spoon} style={styles.shopImage} />
              <Text style={[styles.shopText, styles.shopTextDark]}>레시피</Text>
            </View>
          </GameButton>
        </View>
      </View>

      <Panel slice={kit.panelParchment} style={styles.hero}>
        <Image source={chef.wok} style={styles.heroImage} />
        <View style={styles.heroCopy}>
          <Text style={styles.heroLabel}>오늘의 주방</Text>
          <Text style={styles.heroTitle}>보글보글 끓는 중</Text>
          <Text style={styles.heroSub}>요리는 가방에 담겨요.</Text>
        </View>
      </Panel>

      <View style={styles.list}>
        {recipes.map((recipe) => {
          const ready = canCook(inventory, recipe);
          const owned = getItemQuantity(inventory, recipe.name);
          // A new dish needs a free slot — counting the ones its ingredients free up.
          const freed = recipe.ingredients.filter((ingredient) => getItemQuantity(inventory, ingredient.name) === ingredient.quantity).length;
          const room = owned > 0 || inventory.length - freed < bagCapacity;
          const cookable = ready && room;
          return (
            <Panel slice={ready ? kit.panel : kit.inset} style={styles.card} key={recipe.id}>
              <Image source={recipe.image} style={styles.dish} />
              <View style={styles.cardCopy}>
                <View style={styles.titleRow}>
                  <Text style={styles.cardStrong}>{recipe.name}</Text>
                  {owned > 0 && <Text style={styles.owned}>보유 {owned}</Text>}
                </View>
                <Text style={styles.cardSpan}>{recipe.description}</Text>
                <View style={styles.ingredients}>
                  {recipe.ingredients.map((ingredient) => {
                    const have = getItemQuantity(inventory, ingredient.name);
                    const short = have < ingredient.quantity;
                    return (
                      <View style={styles.ingredient} key={ingredient.name}>
                        {ITEM_IMAGES[ingredient.name] !== undefined && (
                          <Image source={ITEM_IMAGES[ingredient.name]} style={styles.ingredientImage} />
                        )}
                        <Text style={[styles.ingredientText, short && styles.ingredientShort]}>
                          {ingredient.name} {have}/{ingredient.quantity}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
              <GameButton
                variant={cookable ? "green" : "gray"}
                disabled={!cookable}
                onPress={() => onCook(recipe.id)}
                style={styles.cookButton}
                textStyle={styles.cookButtonText}
              >
                {!ready ? "재료 부족" : room ? "요리하기" : "가방 가득"}
              </GameButton>
            </Panel>
          );
        })}
        {unlearned > 0 && (
          <Panel slice={kit.inset} style={styles.more}>
            <Image source={SEALED_RECIPE} style={styles.moreImage} />
            <Text style={styles.moreText}>아직 배우지 않은 레시피가 {unlearned}개 있어요.</Text>
            <GameButton variant="red" onPress={onOpenRecipes} style={styles.cookButton} textStyle={styles.cookButtonText}>
              배우러 가기
            </GameButton>
          </Panel>
        )}
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
  hero: { marginBottom: 12, paddingHorizontal: 16, paddingVertical: 14, flexDirection: "row", alignItems: "center", gap: 12 },
  heroImage: { width: 72, height: 72 },
  heroCopy: { flex: 1 },
  heroLabel: { color: colors.brown, fontSize: 9, fontWeight: "900", fontFamily: fonts.bold, letterSpacing: 1 },
  heroTitle: { marginTop: 3, fontSize: 16, fontWeight: "800", fontFamily: fonts.bold, color: colors.ink },
  heroSub: { marginTop: 3, fontSize: 9, color: colors.brown },
  list: { gap: 10 },
  card: { paddingHorizontal: 12, paddingTop: 11, paddingBottom: 13, flexDirection: "row", alignItems: "center", gap: 10 },
  dish: { width: 54, height: 54 },
  cardCopy: { flex: 1 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  cardStrong: { fontSize: 13, fontWeight: "800", fontFamily: fonts.bold, color: colors.ink },
  owned: { fontSize: 8, fontWeight: "900", fontFamily: fonts.bold, color: colors.green },
  cardSpan: { marginTop: 2, color: colors.muted, fontSize: 9 },
  ingredients: { marginTop: 5, flexDirection: "row", flexWrap: "wrap", gap: 6 },
  ingredient: { flexDirection: "row", alignItems: "center", gap: 2 },
  ingredientImage: { width: 16, height: 16 },
  ingredientText: { fontSize: 8, fontWeight: "800", fontFamily: fonts.bold, color: colors.brown },
  ingredientShort: { color: colors.red },
  cookButton: { minWidth: 68 },
  cookButtonText: { fontSize: 9 },
});
