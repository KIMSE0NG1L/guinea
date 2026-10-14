import { Image, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { chef, shopKit } from "../assets";
import { GameButton } from "../components/GameButton";
import { Panel } from "../components/NineSlice";
import { ShopHero, ShopTopBar, useShopTalk } from "../components/ShopScene";
import { formatGameNumber } from "../state/gameMath";
import { getKnownRecipes, ITEM_IMAGES, RECIPES } from "../state/recipes";

const GREETING = { pose: chef.spoon, line: "어떤 요리를 배워볼래? 레시피는 내가 직접 썼지!" };

export function RecipeShopScreen({
  knownRecipes,
  gold,
  onLearn,
  onBack,
}: {
  knownRecipes: string[] | undefined;
  gold: number;
  onLearn: (recipeId: string) => boolean;
  onBack: () => void;
}) {
  const { talk, say } = useShopTalk(GREETING);
  const known = getKnownRecipes(knownRecipes);

  const learn = (recipeId: string, name: string) => {
    if (known.includes(recipeId)) {
      say(chef.serve, `${name}? 그건 이미 잘 알잖아!`);
    } else if (onLearn(recipeId)) {
      say(chef.cheer, `좋아! 이제 ${name}도 만들 수 있어!`);
    } else {
      say(chef.book, "음… 골드가 조금 부족한걸.");
    }
  };

  return (
    <View style={styles.page}>
      <ShopTopBar kicker="RECIPES" title="셰프의 레시피" gold={gold} onBack={onBack} backLabel="부엌으로 돌아가기" />
      <ShopHero speaker="셰프 기니" talk={talk} />

      <Text style={styles.count}>
        배운 레시피 {known.length} / {RECIPES.length}
      </Text>

      <View style={styles.grid}>
        {RECIPES.map((recipe) => {
          const learned = known.includes(recipe.id);
          const affordable = gold >= recipe.price;
          return (
            <Panel slice={shopKit.cardWood} scale={0.4} style={styles.card} key={recipe.id}>
              <Image source={recipe.art} style={[styles.art, learned && styles.artLearned]} />
              <Text style={styles.name}>{recipe.name}</Text>
              <View style={styles.ingredients}>
                {recipe.ingredients.map((ingredient) => (
                  <Image key={ingredient.name} source={ITEM_IMAGES[ingredient.name]} style={styles.ingredient} accessibilityLabel={ingredient.name} />
                ))}
              </View>
              <GameButton
                variant={learned ? "pillCream" : affordable ? "red" : "pillGray"}
                onPress={() => learn(recipe.id, recipe.name)}
                accessibilityLabel={learned ? `${recipe.name} 배움` : `${recipe.name} 레시피 ${recipe.price}골드에 배우기`}
                style={styles.button}
              >
                <Text style={[styles.buttonText, learned && styles.buttonTextLearned, !learned && !affordable && styles.buttonTextOff]}>
                  {learned ? "배움 ✓" : `${formatGameNumber(recipe.price)} G`}
                </Text>
              </GameButton>
            </Panel>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: "#e8dcc4", paddingHorizontal: 12, paddingTop: 14, paddingBottom: 25 },
  count: { marginBottom: 8, marginLeft: 4, fontSize: 11, fontWeight: "800", fontFamily: fonts.bold, color: colors.brown },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 10 },
  card: { width: "48.5%", alignItems: "center", paddingHorizontal: 12, paddingTop: 14, paddingBottom: 16 },
  art: { width: 64, height: 64 },
  artLearned: { opacity: 0.75 },
  name: { marginTop: 4, fontSize: 13, fontWeight: "800", fontFamily: fonts.bold, color: colors.ink, textAlign: "center" },
  ingredients: { marginTop: 4, flexDirection: "row", gap: 3, minHeight: 18 },
  ingredient: { width: 18, height: 18 },
  button: { marginTop: 8, alignSelf: "stretch", minHeight: 34 },
  buttonText: { fontSize: 11, fontWeight: "900", fontFamily: fonts.bold, color: colors.cream },
  buttonTextLearned: { color: colors.green },
  buttonTextOff: { color: "#4f463c" },
});
