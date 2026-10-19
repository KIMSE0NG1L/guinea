import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { useShake } from "../components/motion";
import { colors, fonts } from "../theme";
import { chef, grandma, shopKit } from "../assets";
import { GameButton } from "../components/GameButton";
import { Panel } from "../components/NineSlice";
import { ShopHero, ShopTopBar, useShopTalk } from "../components/ShopScene";
import { getKnownRecipes, getRecipeStage, isRecipeForSale, ITEM_IMAGES, RECIPES, type Recipe } from "../state/recipes";
import { RECIPE_TIERS } from "../state/recipeTiers";
import { CoinPrice } from "../components/CoinPrice";
import { RecipeArt } from "../components/RecipeArt";

const GREETING = { pose: chef.spoon, line: "어떤 요리를 배워볼래? 레시피는 내가 직접 썼지!" };

export function RecipeShopScreen({
  knownRecipes,
  clearedStages,
  gold,
  onLearn,
  onBack,
  onOpenGrocery,
}: {
  knownRecipes: string[] | undefined;
  // Stages whose boss has fallen — a recipe is on sale once its stage is among them.
  clearedStages: number[];
  gold: number;
  onLearn: (recipeId: string) => boolean;
  onBack: () => void;
  onOpenGrocery: () => void;
}) {
  const { talk, say } = useShopTalk(GREETING);
  const known = getKnownRecipes(knownRecipes);

  // Card order is fixed when the shop opens, so a recipe learned here stays put instead
  // of jumping to the bottom.
  const rank = (recipe: (typeof RECIPES)[number]) => (known.includes(recipe.id) ? 2 : isRecipeForSale(recipe, clearedStages) ? 0 : 1);
  const [order] = useState(() => [...RECIPES].sort((a, b) => rank(a) - rank(b)).map((recipe) => recipe.id));

  // Reports whether it went through, so the card can rattle on short gold.
  const learn = (recipeId: string, name: string) => {
    if (known.includes(recipeId)) {
      say(chef.serve, `${name}? 그건 이미 잘 알잖아!`);
      return true;
    }
    if (onLearn(recipeId)) {
      say(chef.cheer, `좋아! 이제 ${name}도 만들 수 있어!`);
      return true;
    }
    say(chef.book, "음… 골드가 조금 부족한걸.");
    return false;
  };

  return (
    <View style={styles.page}>
      <ShopTopBar kicker="RECIPES" title="셰프의 레시피" gold={gold} onBack={onBack} backLabel="부엌으로 돌아가기"
        other={{ label: "재료", keeper: grandma.basket, onPress: onOpenGrocery, accessibilityLabel: "재료 상점으로 가기" }}
      />
      <ShopHero speaker="셰프 기니" talk={talk} />

      <Text style={styles.count}>
        배운 레시피 {known.length} / {RECIPES.length}
      </Text>

      <View style={styles.grid}>
        {/* For sale first, then ones a stage clear away, then already-learned ones. */}
        {order.map((id) => {
          const recipe = RECIPES.find((item) => item.id === id)!;
          return (
            <RecipeCard
              key={id}
              recipe={recipe}
              learned={known.includes(id)}
              forSale={isRecipeForSale(recipe, clearedStages)}
              affordable={gold >= recipe.price}
              onLearn={() => learn(recipe.id, recipe.name)}
            />
          );
        })}
      </View>
    </View>
  );
}

// One recipe for sale. Learning it unrolls the scroll; a
// sealed hidden recipe glows softly now and then; short gold rattles the button.
function RecipeCard({
  recipe,
  learned,
  forSale,
  affordable,
  onLearn,
}: {
  recipe: Recipe;
  learned: boolean;
  // False until its stage's boss has been beaten.
  forSale: boolean;
  affordable: boolean;
  onLearn: () => boolean;
}) {
  const tier = RECIPE_TIERS[recipe.tier];
  // Hidden recipes keep their dish and ingredients secret until learned.
  const sealed = recipe.tier === "hidden" && !learned;
  const [learnedAtOpen] = useState(learned);
  const unroll = useSharedValue(1);
  const glow = useSharedValue(0);
  const { style: shakeStyle, shake } = useShake();

  useEffect(() => {
    if (!learned || learnedAtOpen) return;
    unroll.value = withSequence(withTiming(0.15, { duration: 0 }), withTiming(1, { duration: 420, easing: Easing.out(Easing.back(1.6)) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [learned]);
  useEffect(() => {
    glow.value = sealed ? withRepeat(withSequence(withTiming(1, { duration: 900 }), withTiming(0, { duration: 900 }), withDelay(1200, withTiming(0, { duration: 0 }))), -1) : 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sealed]);

  const unrollStyle = useAnimatedStyle(() => ({ transform: [{ scaleY: unroll.value }] }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value * 0.6, transform: [{ scale: 0.9 + glow.value * 0.2 }] }));

  return (
    <Panel slice={shopKit.cardWood} scale={0.4} style={styles.card}>
      <View style={[styles.tierBadge, { backgroundColor: tier.color }]}>
        <Text style={styles.tierText}>{tier.label}</Text>
      </View>
      <Animated.View style={[learned && styles.artLearned, unrollStyle]}>
        {sealed && <Animated.View style={[styles.sealGlow, glowStyle]} pointerEvents="none" />}
        <RecipeArt recipe={recipe} size={72} sealed={sealed} />
      </Animated.View>
      <Text style={styles.name}>{sealed ? "???" : recipe.name}</Text>
      <View style={styles.ingredients}>
        {sealed ? (
          <Text style={styles.secret}>재료 비밀</Text>
        ) : (
          recipe.ingredients.map((ingredient) => (
            <Image key={ingredient.name} source={ITEM_IMAGES[ingredient.name]} style={styles.ingredient} accessibilityLabel={ingredient.name} />
          ))
        )}
      </View>
      <Animated.View style={[styles.buttonWrap, shakeStyle]}>
        <GameButton
          variant={learned ? "pillCream" : affordable && forSale ? "red" : "pillGray"}
          disabled={!learned && !forSale}
          onPress={() => {
            if (!onLearn()) shake();
          }}
          tutorialId={`learn-${recipe.id}`}
          accessibilityLabel={learned ? `${recipe.name} 배움` : `${sealed ? "히든" : recipe.name} 레시피 ${recipe.price}골드에 배우기`}
          style={styles.button}
        >
          {learned ? (
            <Text style={[styles.buttonText, styles.buttonTextLearned]}>배움 ✓</Text>
          ) : forSale ? (
            <CoinPrice amount={recipe.price} textStyle={[styles.buttonText, !affordable && styles.buttonTextOff]} />
          ) : (
            <Text style={[styles.buttonText, styles.buttonTextOff]}>{`${getRecipeStage(recipe) + 1}스테이지 클리어`}</Text>
          )}
        </GameButton>
      </Animated.View>
    </Panel>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: "#e8dcc4", paddingHorizontal: 12, paddingTop: 14, paddingBottom: 25 },
  count: { marginBottom: 8, marginLeft: 4, fontSize: 11, fontWeight: "800", fontFamily: fonts.bold, color: colors.brown },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 10 },
  card: { width: "48.5%", alignItems: "center", paddingHorizontal: 12, paddingTop: 14, paddingBottom: 16 },
  artLearned: { opacity: 0.75 },
  tierBadge: { position: "absolute", top: 10, left: 10, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, zIndex: 1 },
  tierText: { fontSize: 8, fontWeight: "900", fontFamily: fonts.bold, color: colors.cream },
  secret: { fontSize: 9, fontWeight: "800", fontFamily: fonts.bold, color: colors.muted },
  name: { marginTop: 4, fontSize: 13, fontWeight: "800", fontFamily: fonts.bold, color: colors.ink, textAlign: "center" },
  ingredients: { marginTop: 4, flexDirection: "row", gap: 3, minHeight: 18 },
  ingredient: { width: 18, height: 18 },
  buttonWrap: { marginTop: 8, alignSelf: "stretch" },
  button: { minHeight: 34 },
  sealGlow: { position: "absolute", top: -6, left: -6, right: -6, bottom: -6, borderRadius: 40, backgroundColor: "#ffe27a" },
  buttonText: { fontSize: 11, fontWeight: "900", fontFamily: fonts.bold, color: colors.cream },
  buttonTextLearned: { color: colors.green },
  buttonTextOff: { color: "#4f463c" },
});
