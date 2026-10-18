import { Image, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { chef, kit, shopKit } from "../assets";
import { GameButton } from "../components/GameButton";
import { Panel } from "../components/NineSlice";
import { ProgressBar } from "../components/ProgressBar";
import { RecipeArt } from "../components/RecipeArt";
import { ShopTopBar } from "../components/ShopScene";
import { getCookbookProgress, isCookbookComplete } from "../state/cookbook";
import { getKnownRecipes, getRecipeStage, isRecipeForSale, RECIPES } from "../state/recipes";
import { RECIPE_TIERS } from "../state/recipeTiers";

// A line under the progress bar that moves on as the book fills up.
function progressLine(done: number, total: number) {
  if (done >= total) return "모든 페이지를 맛봤어요. 기니의 요리책 완성!";
  if (done === 0) return "책장을 넘기면 처음 보는 요리가 가득해요.";
  if (done < total / 3) return "첫 장들을 맛보는 중. 아직 갈 길이 멀어요.";
  if (done < (total * 2) / 3) return "책의 절반쯤 왔어요. 세상의 맛이 조금씩 보여요.";
  return `마지막 ${total - done}장만 남았어요!`;
}

// 《세상의 모든 맛》: every recipe as a page — tasted (cooked at least once), learned but not
// yet made, or still sealed — with gem milestones along the way and an epilogue at the end.
export function CookbookScreen({
  cookedRecipes,
  knownRecipes,
  clearedStages,
  gold,
  onBack,
  onOpenEnding,
}: {
  cookedRecipes: string[] | undefined;
  knownRecipes: string[] | undefined;
  // Stages whose boss has fallen — a recipe goes on sale once its stage is cleared.
  clearedStages: number[];
  gold: number;
  onBack: () => void;
  onOpenEnding: () => void;
}) {
  const total = RECIPES.length;
  const done = getCookbookProgress(cookedRecipes);
  const known = getKnownRecipes(knownRecipes);
  const cooked = new Set(cookedRecipes ?? []);

  return (
    <View style={styles.page}>
      <ShopTopBar kicker="COOKBOOK" title="세상의 모든 맛" gold={gold} onBack={onBack} backLabel="부엌으로 돌아가기" />

      <Panel slice={kit.panelParchment} style={styles.hero}>
        <Image source={chef.book} style={styles.heroImage} />
        <View style={styles.heroCopy}>
          <Text style={styles.heroLabel}>맛본 요리</Text>
          <Text style={styles.heroCount}>
            {done} <Text style={styles.heroTotal}>/ {total}</Text>
          </Text>
          <ProgressBar progress={(done / total) * 100} height={14} />
          <Text style={styles.heroLine}>{progressLine(done, total)}</Text>
        </View>
      </Panel>

      {isCookbookComplete(cookedRecipes) && (
        <GameButton variant="pillCream" onPress={onOpenEnding} style={styles.rereadButton} textStyle={styles.rereadText}>
          마지막 장 읽기
        </GameButton>
      )}

      <View style={styles.grid}>
        {RECIPES.map((recipe) => {
          const tasted = cooked.has(recipe.id);
          const learned = known.includes(recipe.id);
          const sealed = !learned && recipe.tier === "hidden";
          const tier = RECIPE_TIERS[recipe.tier];
          return (
            <Panel slice={tasted ? shopKit.cardWood : kit.inset} scale={0.4} style={styles.pageCard} key={recipe.id}>
              <View style={[styles.tierBadge, { backgroundColor: tier.color }]}>
                <Text style={styles.tierText}>{tier.label}</Text>
              </View>
              <View style={!tasted && styles.untasted}>
                <RecipeArt recipe={recipe} size={64} sealed={sealed} />
              </View>
              <Text style={[styles.pageName, !tasted && styles.pageNameDim]} numberOfLines={1}>
                {learned || tasted ? recipe.name : "???"}
              </Text>
              <Text style={[styles.pageState, tasted && styles.pageStateDone]}>
                {tasted
                  ? "맛봄 ✓"
                  : learned
                    ? "아직 안 만들어 봄"
                    : isRecipeForSale(recipe, clearedStages)
                      ? "레시피 상점에 있음"
                      : `${getRecipeStage(recipe) + 1}스테이지 클리어 시 해금`}
              </Text>
            </Panel>
          );
        })}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: "#e8dcc4", paddingHorizontal: 12, paddingTop: 14, paddingBottom: 25 },
  hero: { marginBottom: 10, paddingHorizontal: 14, paddingVertical: 12, flexDirection: "row", alignItems: "center", gap: 12 },
  heroImage: { width: 76, height: 76 },
  heroCopy: { flex: 1, gap: 4 },
  heroLabel: { color: colors.brown, fontSize: 9, fontWeight: "900", fontFamily: fonts.bold, letterSpacing: 1 },
  heroCount: { fontSize: 24, fontWeight: "900", fontFamily: fonts.bold, color: colors.ink },
  heroTotal: { fontSize: 13, color: colors.muted },
  heroLine: { fontSize: 9, color: colors.brown },
  // Wraps three to a row, so the list can grow as the book does.
  rereadButton: { alignSelf: "center", marginBottom: 10, paddingHorizontal: 14 },
  rereadText: { fontSize: 10 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 8 },
  pageCard: { width: "32%", alignItems: "center", paddingHorizontal: 6, paddingTop: 10, paddingBottom: 9 },
  tierBadge: { position: "absolute", top: 6, left: 6, paddingHorizontal: 4, paddingVertical: 1, borderRadius: 5, zIndex: 1 },
  tierText: { fontSize: 7, fontWeight: "900", fontFamily: fonts.bold, color: colors.cream },
  untasted: { opacity: 0.45, filter: "grayscale(1)" },
  pageName: { marginTop: 3, fontSize: 10, fontWeight: "900", fontFamily: fonts.bold, color: colors.ink },
  pageNameDim: { color: colors.muted },
  pageState: { marginTop: 1, fontSize: 7, fontWeight: "800", fontFamily: fonts.bold, color: colors.muted },
  pageStateDone: { color: colors.green },
});
