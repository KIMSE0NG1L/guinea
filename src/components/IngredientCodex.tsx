import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming } from "react-native-reanimated";
import { SearchBox } from "./SearchBox";
import { matchesSearch } from "../state/search";
import { colors, fonts } from "../theme";
import { kit } from "../assets";
import { Panel } from "./NineSlice";
import { GROCERY, type GroceryCategory } from "../state/grocery";
import { getDropSources } from "../state/drops";
import { ITEM_IMAGES, RECIPES } from "../state/recipes";
import { CoinPrice } from "./CoinPrice";
import { getStageCode, STAGES } from "../state/stages";

const CATEGORY_LABEL: Record<GroceryCategory, string> = {
  vegetable: "채소",
  fruit: "과일",
  grain: "곡물",
  farm: "농장",
  meat: "고기",
  seafood: "해산물",
  special: "특산",
};

const CATEGORY_COLOR: Record<GroceryCategory, string> = {
  vegetable: "#6f9a3c",
  fruit: "#d98a2b",
  grain: "#b8913a",
  farm: "#b88a4a",
  meat: "#b8553f",
  seafood: "#3f7fb0",
  special: "#8a5cb0",
};

// Stages an ingredient drops in (mob or boss), earliest first, each listed once.
function getSourceStages(name: string) {
  const stages = getDropSources(name).map(({ kind }) => STAGES.findIndex((item) => item.enemyKind === kind));
  return [...new Set(stages)].sort((a, b) => a - b);
}

// Every ingredient in the game (cheapest first, so roughly in the order you meet them).
// One you've ever had shows where it drops, its shop price and the dishes it goes into;
// the rest are dark silhouettes with a hint of where to look.
// `fresh`: found since the codex was last opened — they light up from silhouette with "발견!".
export function IngredientCodex({ discovered, fresh = [] }: { discovered: string[]; fresh?: string[] }) {
  const found = GROCERY.filter((item) => discovered.includes(item.name)).length;
  // Search by ingredient name or a dish that uses it; undiscovered ones only show unfiltered.
  const [query, setQuery] = useState("");
  const shown = GROCERY.filter((item) =>
    discovered.includes(item.name)
      ? matchesSearch(query, item.name, ...RECIPES.filter((recipe) => recipe.ingredients.some((ingredient) => ingredient.name === item.name)).map((recipe) => recipe.name))
      : !query.trim(),
  );
  return (
    <View>
      <Text style={styles.count}>
        모은 식재료 {found} / {GROCERY.length}
      </Text>
      <SearchBox value={query} onChange={setQuery} placeholder="재료나 요리 이름으로 찾기" resultCount={shown.length} />
      <View style={styles.grid}>
        {shown.map((item) => {
          const known = discovered.includes(item.name);
          const sources = getSourceStages(item.name);
          const dishes = RECIPES.filter((recipe) => recipe.ingredients.some((ingredient) => ingredient.name === item.name));
          return (
            <Panel slice={known ? kit.panel : kit.inset} scale={0.4} style={styles.card} key={item.name}>
              <View style={[styles.tag, { backgroundColor: CATEGORY_COLOR[item.category] }]}>
                <Text style={styles.tagText}>{CATEGORY_LABEL[item.category]}</Text>
              </View>
              <CoinPrice amount={item.price} textStyle={styles.priceText} style={styles.price} />
              <View>
                <Image
                  source={ITEM_IMAGES[item.name]}
                  style={[styles.icon, !known && styles.iconUnknown]}
                  accessibilityLabel={known ? item.name : "아직 모르는 식재료"}
                />
                {fresh.includes(item.name) && <Discovered image={ITEM_IMAGES[item.name]} />}
              </View>
              <Text style={styles.name} numberOfLines={1}>{known ? item.name : "???"}</Text>
              {known ? (
                <>
                  <View style={styles.section}>
                    <Text style={styles.sectionLabel}>얻는 곳</Text>
                    <View style={styles.pills}>
                      {sources.length > 0 ? (
                        sources.map((stage) => (
                          <View key={stage} style={styles.pill}>
                            <Text style={styles.pillText} numberOfLines={1}>
                              {getStageCode(stage)} {STAGES[stage].area}
                            </Text>
                          </View>
                        ))
                      ) : (
                        <View style={[styles.pill, styles.pillShop]}>
                          <Text style={styles.pillText}>할머니 식료품점</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  {dishes.length > 0 && (
                    <View style={styles.section}>
                      <Text style={styles.sectionLabel}>쓰이는 요리</Text>
                      <View style={styles.dishes}>
                        {dishes.map((recipe) => (
                          <Image key={recipe.id} source={recipe.image} style={styles.dish} accessibilityLabel={recipe.name} />
                        ))}
                      </View>
                    </View>
                  )}
                </>
              ) : (
                <Text style={styles.hint} numberOfLines={2}>
                  {sources.length > 0 ? `${STAGES[sources[0]].area}에서\n구할 수 있대요` : "식료품점에서\n살 수 있대요"}
                </Text>
              )}
            </Panel>
          );
        })}
      </View>
    </View>
  );
}

// Newly found: a dark silhouette over the art fades away and "발견!" pops up.
function Discovered({ image }: { image: number }) {
  const reveal = useSharedValue(0);
  const pop = useSharedValue(0);
  useEffect(() => {
    reveal.value = withDelay(250, withTiming(1, { duration: 650, easing: Easing.inOut(Easing.quad) }));
    pop.value = withDelay(700, withSequence(withTiming(1.25, { duration: 160 }), withTiming(1, { duration: 140 })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const shadowStyle = useAnimatedStyle(() => ({ opacity: (1 - reveal.value) * 0.9 }));
  const popStyle = useAnimatedStyle(() => ({ opacity: pop.value === 0 ? 0 : 1, transform: [{ scale: pop.value }, { rotate: "-10deg" }] }));
  return (
    <>
      <Animated.Image source={image} style={[styles.icon, styles.iconUnknown, styles.overlay, shadowStyle]} />
      <Animated.View style={[styles.found, popStyle]}>
        <Text style={styles.foundText}>발견!</Text>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: { position: "absolute", left: 0, top: 0 },
  found: { position: "absolute", right: -18, top: 8, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 6, backgroundColor: colors.red },
  foundText: { fontSize: 9, fontWeight: "900", fontFamily: fonts.bold, color: colors.cream },
  count: { marginBottom: 8, marginLeft: 4, fontSize: 11, fontWeight: "800", fontFamily: fonts.bold, color: colors.brown },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 10 },
  card: { width: "48.5%", alignItems: "center", paddingHorizontal: 10, paddingTop: 10, paddingBottom: 12 },
  tag: { position: "absolute", top: 8, left: 8, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, zIndex: 1 },
  tagText: { fontSize: 8, fontWeight: "900", fontFamily: fonts.bold, color: colors.cream },
  price: { position: "absolute", top: 8, right: 9, gap: 2 },
  priceText: { fontSize: 9, fontWeight: "900", fontFamily: fonts.bold, color: colors.muted },
  icon: { marginTop: 14, width: 54, height: 54 },
  iconUnknown: { tintColor: "#3d3128", opacity: 0.85 },
  name: { marginTop: 4, fontSize: 12, fontWeight: "900", fontFamily: fonts.bold, color: colors.ink },
  section: { marginTop: 6, alignSelf: "stretch", alignItems: "center" },
  sectionLabel: { fontSize: 8, fontWeight: "900", fontFamily: fonts.bold, color: colors.green, marginBottom: 1 },
  pills: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 4 },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "#f6e6c2",
    borderWidth: 1.5,
    borderColor: "#c9a86e",
  },
  pillShop: { backgroundColor: "#f3d9cf", borderColor: "#c98a6e" },
  pillText: { fontSize: 9, fontWeight: "800", fontFamily: fonts.bold, color: colors.brown },
  dishes: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 3 },
  dish: { width: 22, height: 22 },
  hint: { marginTop: 4, fontSize: 9, color: colors.muted, textAlign: "center", lineHeight: 13 },
});
