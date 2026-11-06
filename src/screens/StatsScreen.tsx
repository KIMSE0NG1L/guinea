import { Image, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { icons, kit, uiImages } from "../assets";
import { Panel } from "../components/NineSlice";
import { PageHeading } from "../components/PageHeading";
import { formatGameNumber } from "../state/gameMath";
import { getStageLabel } from "../state/stages";
import { getCookbookProgress } from "../state/cookbook";
import { RECIPES } from "../state/recipes";
import { OUTFIT_NAMES } from "../state/buffs";
import { isOutfitUnlocked } from "../state/unlocks";
import type { GameState, Outfit } from "../types";

function StatCard({ icon, label, value }: { icon: number; label: string; value: string }) {
  return (
    <Panel slice={kit.panel} style={styles.card}>
      <Image source={icon} style={styles.cardIcon} resizeMode="contain" />
      <Text style={styles.cardValue} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.cardLabel}>{label}</Text>
    </Panel>
  );
}

export function StatsScreen({ state }: { state: GameState }) {
  const outfits = Object.keys(OUTFIT_NAMES) as Outfit[];
  const ownedCompanions = outfits.filter((outfit) =>
    isOutfitUnlocked(outfit, state.highestStageNumber ?? state.stageNumber, state.purchasedOutfits),
  ).length;
  const cookbookDone = getCookbookProgress(state.cookedRecipes);

  return (
    <View style={styles.page}>
      <PageHeading kicker="PROFILE" title="기니의 발자취" description="지금까지 쌓아 온 것들을 한눈에." />
      <View style={styles.grid}>
        <StatCard icon={icons.star} label="레벨" value={formatGameNumber(state.level)} />
        <StatCard icon={icons.compass} label="최고 스테이지" value={getStageLabel(state.highestStageNumber ?? state.stageNumber)} />
        <StatCard icon={uiImages.swords} label="총 처치 수" value={formatGameNumber(state.kills)} />
        <StatCard icon={icons.codexMonster} label="보스 처치 수" value={formatGameNumber(state.bossKills ?? 0)} />
        <StatCard icon={icons.coins} label="누적 획득 골드" value={formatGameNumber(state.totalGoldEarned)} />
        <StatCard icon={icons.codexBook} label="완성한 요리책" value={`${cookbookDone} / ${RECIPES.length}`} />
        <StatCard icon={icons.codexIngredient} label="발견한 식재료" value={formatGameNumber((state.discoveredItems ?? []).length)} />
        <StatCard icon={icons.trophy} label="함께한 동료" value={`${ownedCompanions} / ${outfits.length}`} />
        <StatCard icon={icons.questMedal} label="출석한 날" value={formatGameNumber(state.attendance?.claimed ?? 0)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: "#e8dcc4", paddingHorizontal: 12, paddingTop: 18, paddingBottom: 25 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  card: {
    width: "31.5%",
    minHeight: 100,
    paddingHorizontal: 8,
    paddingTop: 12,
    paddingBottom: 10,
    alignItems: "center",
  },
  cardIcon: { width: 28, height: 28, marginBottom: 6 },
  cardValue: { fontSize: 13, fontWeight: "900", fontFamily: fonts.bold, color: colors.ink },
  cardLabel: { marginTop: 3, fontSize: 9, color: colors.brown, textAlign: "center" },
});
