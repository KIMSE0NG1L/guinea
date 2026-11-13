import { useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { Text } from "../components/GameText";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming } from "react-native-reanimated";
import { colors, fonts } from "../theme";
import { icons, kit, uiImages } from "../assets";
import { Panel } from "../components/NineSlice";
import { PageHeading } from "../components/PageHeading";
import { CharacterSprite } from "../components/CharacterSprite";
import { StrokedText } from "../components/StrokedText";
import { useCountUp } from "../components/motion";
import { formatGameNumber } from "../state/gameMath";
import { getPeakAreaStage, LAST_STAGE_NUMBER, STAGES } from "../state/stages";
import { t } from "../i18n";
import { getCookbookProgress } from "../state/cookbook";
import { RECIPES } from "../state/recipes";
import { OUTFIT_NAMES } from "../state/buffs";
import { isOutfitUnlocked } from "../state/unlocks";
import type { GameState, Outfit } from "../types";

// How far apart the cards pop in, one after another down the page.
const POP_GAP = 45;

// getStageLabel (state/stages.ts) concatenates the stage number with the Korean area name
// directly, so it can't be translated via a one-arg dictionary lookup on the whole string —
// this rebuilds the same label with the area name translated on its own.
function stageLabel(stageNumber: number) {
  const area = STAGES[Math.min(stageNumber, LAST_STAGE_NUMBER)].area;
  return `${stageNumber + 1} ${t(area)}`;
}

function formatDuration(ms: number) {
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);
  if (hours >= 1) return t(`${formatGameNumber(hours)}시간 ${minutes % 60}분`, `${formatGameNumber(hours)}h ${minutes % 60}m`);
  return t(`${minutes}분`, `${minutes}m`);
}

function formatSeconds(ms: number) {
  const seconds = ms / 1000;
  return seconds < 60
    ? t(`${seconds.toFixed(1)}초`, `${seconds.toFixed(1)}s`)
    : t(`${Math.floor(seconds / 60)}분 ${Math.round(seconds % 60)}초`, `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`);
}

// A card that pops in after `delay`, its number counting up from zero.
function StatCard({ icon, label, value, format = formatGameNumber, text, delay }: { icon: number; label: string; value?: number; format?: (n: number) => string; text?: string; delay: number }) {
  const counted = useCountUp(value ?? 0, 800, delay + 120);
  return (
    <PopIn delay={delay} style={styles.cardSlot}>
      <Panel slice={kit.panel} style={styles.card}>
        <Image source={icon} style={styles.cardIcon} resizeMode="contain" />
        <Text style={styles.cardValue} numberOfLines={1} adjustsFontSizeToFit>
          {text ?? format(counted)}
        </Text>
        <Text style={styles.cardLabel}>{label}</Text>
      </Panel>
    </PopIn>
  );
}

function PopIn({ delay, style, children }: { delay: number; style?: object; children: React.ReactNode }) {
  const pop = useSharedValue(0);
  useEffect(() => {
    pop.value = withDelay(delay, withSequence(withTiming(1.08, { duration: 170, easing: Easing.out(Easing.quad) }), withTiming(1, { duration: 120 })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const animated = useAnimatedStyle(() => ({ opacity: Math.min(1, pop.value), transform: [{ scale: 0.85 + pop.value * 0.15 }] }));
  return <Animated.View style={[style, animated]}>{children}</Animated.View>;
}

function Section({ title }: { title: string }) {
  return (
    <View style={styles.sectionRow}>
      <View style={styles.sectionLine} />
      <StrokedText style={styles.sectionTitle} strokeColor={colors.line} strokeWidth={1.5}>
        {title}
      </StrokedText>
      <View style={styles.sectionLine} />
    </View>
  );
}

export function StatsScreen({ state }: { state: GameState }) {
  const outfits = Object.keys(OUTFIT_NAMES) as Outfit[];
  const highest = getPeakAreaStage(state);
  const ownedCompanions = outfits.filter((outfit) => isOutfitUnlocked(outfit, highest, state.purchasedOutfits)).length;
  const cookbookDone = getCookbookProgress(state.cookedRecipes);
  // Read once on opening the page.
  const [openedAt] = useState(() => Date.now());
  const days = state.startedAt ? Math.floor((openedAt - state.startedAt) / 86_400_000) + 1 : 1;

  let order = 0;
  const next = () => (order++) * POP_GAP;

  return (
    <View style={styles.page}>
      <PageHeading kicker="PROFILE" title={t("기니의 발자취", "Gini's Footprints")} description={t("지금까지 쌓아 온 것들을 한눈에.", "Everything you've built up, at a glance.")} />

      {/* 1. The adventurer: the companion out front, where it's got to. */}
      <PopIn delay={0}>
        <Panel slice={kit.panel} style={styles.hero}>
          <View style={styles.heroSprite}>
            <CharacterSprite outfit={state.equippedOutfit} animation="idle" size={96} restartKey={state.equippedOutfit} />
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.heroName}>
              Lv.{formatGameNumber(state.level)} {t(OUTFIT_NAMES[state.equippedOutfit])}
            </Text>
            <Text style={styles.heroStage}>{t(`${stageLabel(state.stageNumber)}에서 모험 중`, `Adventuring in ${stageLabel(state.stageNumber)}`)}</Text>
            <Text style={styles.heroMeta}>
              {t(`모험 ${formatGameNumber(days)}일째 · 플레이 ${formatDuration(state.playTimeMs ?? 0)}`, `Day ${formatGameNumber(days)} of the adventure · Played ${formatDuration(state.playTimeMs ?? 0)}`)}
            </Text>
          </View>
        </Panel>
      </PopIn>

      <Section title={t("모험 기록", "Adventure Record")} />
      <View style={styles.grid}>
        <StatCard delay={next()} icon={icons.star} label={t("레벨", "Level")} value={state.level} />
        <StatCard delay={next()} icon={icons.compass} label={t("최고 스테이지", "Furthest Stage")} text={stageLabel(highest)} />
        <StatCard delay={next()} icon={uiImages.swords} label={t("총 처치 수", "Total Kills")} value={state.kills} />
        <StatCard delay={next()} icon={icons.codexMonster} label={t("보스 처치 수", "Bosses Defeated")} value={state.bossKills ?? 0} />
        <StatCard delay={next()} icon={icons.coins} label={t("누적 획득 골드", "Lifetime Gold Earned")} value={state.totalGoldEarned} />
        <StatCard delay={next()} icon={icons.codexBook} label={t("완성한 요리책", "Cookbook Completed")} text={`${cookbookDone} / ${RECIPES.length}`} />
        <StatCard delay={next()} icon={icons.codexIngredient} label={t("발견한 식재료", "Ingredients Discovered")} value={(state.discoveredItems ?? []).length} />
        <StatCard delay={next()} icon={icons.trophy} label={t("함께한 동료", "Companions Met")} text={`${ownedCompanions} / ${outfits.length}`} />
        <StatCard delay={next()} icon={icons.questMedal} label={t("출석한 날", "Days Attended")} value={state.attendance?.claimed ?? 0} />
      </View>

      {/* 2. The odd little counters the game already keeps. */}
      <Section title={t("재미 기록", "Fun Records")} />
      <View style={styles.grid}>
        <StatCard delay={next()} icon={icons.codexBook} label={t("요리한 횟수", "Dishes Cooked")} value={state.dishesCooked ?? 0} />
        <StatCard delay={next()} icon={icons.codexIngredient} label={t("먹은 요리", "Dishes Eaten")} value={state.dishesEaten ?? 0} />
        <StatCard delay={next()} icon={uiImages.coin} label={t("잡은 날아다니는 동전", "Winged Coins Caught")} value={state.coinsCaught ?? 0} />
        <StatCard delay={next()} icon={uiImages.swords} label={t("공격력 강화 횟수", "Attack Upgrades")} value={state.attackUpgrades} />
        <StatCard delay={next()} icon={icons.chest} label={t("가방 확장", "Bag Expansions")} value={state.bagExpansions ?? 0} />
        <StatCard delay={next()} icon={icons.chest} label={t("가방이 꽉 찬 횟수", "Times Bag Was Full")} value={state.bagFullCount ?? 0} />
        <StatCard delay={next()} icon={icons.star} label={t("8시간 넘게 푹 잔 횟수", "Times Slept 8+ Hours")} value={state.longNaps ?? 0} />
        <StatCard delay={next()} icon={icons.codexMonster} label={t("테토기니 헛스윙", "Teto Gini Whiffs")} value={state.tetoMisses ?? 0} />
      </View>

      {/* 5. Personal bests (tracked from this update on). */}
      <Section title={t("최고 기록", "Personal Bests")} />
      <View style={styles.grid}>
        <StatCard delay={next()} icon={uiImages.swords} label={t("가장 센 한 방", "Hardest Hit")} text={state.records?.maxHit ? formatGameNumber(state.records.maxHit) : t("기록 없음", "No record yet")} />
        <StatCard delay={next()} icon={icons.codexMonster} label={t("가장 빨리 잡은 보스", "Fastest Boss Kill")} text={state.records?.fastestBossMs ? formatSeconds(state.records.fastestBossMs) : t("기록 없음", "No record yet")} />
        <StatCard delay={next()} icon={icons.coins} label={t("최대 오프라인 골드", "Best Offline Gold")} text={state.records?.bestOfflineGold ? formatGameNumber(state.records.bestOfflineGold) : t("기록 없음", "No record yet")} />
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  page: { backgroundColor: "#e8dcc4", paddingHorizontal: 16, paddingTop: 20, paddingBottom: 25 },
  hero: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 12, gap: 10 },
  heroSprite: { width: 100, height: 100, alignItems: "center", justifyContent: "flex-end" },
  heroCopy: { flex: 1, gap: 3 },
  heroName: { fontSize: 20, fontWeight: "900", fontFamily: fonts.bold, color: colors.ink },
  heroStage: { fontSize: 12, fontWeight: "800", fontFamily: fonts.bold, color: colors.brown },
  heroMeta: { fontFamily: fonts.light, letterSpacing: -0.36, fontSize: 12, lineHeight: 16, color: colors.muted },
  sectionRow: { marginTop: 18, marginBottom: 10, flexDirection: "row", alignItems: "center", gap: 8 },
  sectionLine: { flex: 1, height: 2, borderRadius: 1, backgroundColor: "#c9a978" },
  sectionTitle: { fontSize: 15, fontWeight: "900", fontFamily: fonts.bold, color: colors.cream },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  cardSlot: { width: "31.5%" },
  card: { minHeight: 100, paddingHorizontal: 12, paddingTop: 15, paddingBottom: 13, alignItems: "center" },
  cardIcon: { width: 28, height: 28, marginBottom: 6 },
  cardValue: { fontSize: 15, fontWeight: "900", fontFamily: fonts.bold, color: colors.ink },
  cardLabel: { fontFamily: fonts.light, letterSpacing: -0.36, marginTop: 3, fontSize: 12, lineHeight: 16, color: colors.brown, textAlign: "center" },
});
