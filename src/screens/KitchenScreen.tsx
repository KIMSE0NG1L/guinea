import { Image, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { food, kit } from "../assets";
import { PageHeading } from "../components/PageHeading";
import { GameButton } from "../components/GameButton";
import { Panel } from "../components/NineSlice";
import { canCook, getItemQuantity, ITEM_IMAGES, RECIPES } from "../state/recipes";
import type { GameState } from "../types";

export function KitchenScreen({ inventory, onCook }: { inventory: GameState["inventory"]; onCook: (recipeId: string) => void }) {
  return (
    <View style={styles.page}>
      <PageHeading kicker="COOKING" title="기니의 부엌" description="재료를 모아 배고픈 기니에게 한 끼를." />

      <Panel slice={kit.panelParchment} style={styles.hero}>
        <Image source={food.kitchen} style={styles.heroImage} />
        <View style={styles.heroCopy}>
          <Text style={styles.heroLabel}>오늘의 주방</Text>
          <Text style={styles.heroTitle}>보글보글 끓는 중</Text>
          <Text style={styles.heroSub}>요리는 가방에 담겨요.</Text>
        </View>
      </Panel>

      <View style={styles.list}>
        {RECIPES.map((recipe) => {
          const ready = canCook(inventory, recipe);
          const owned = getItemQuantity(inventory, recipe.name);
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
                variant={ready ? "green" : "gray"}
                disabled={!ready}
                onPress={() => onCook(recipe.id)}
                style={styles.cookButton}
                textStyle={styles.cookButtonText}
              >
                {ready ? "요리하기" : "재료 부족"}
              </GameButton>
            </Panel>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: "#e8dcc4", paddingHorizontal: 12, paddingTop: 18, paddingBottom: 25 },
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
