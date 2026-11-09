import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming } from "react-native-reanimated";
import { colors, fonts } from "../theme";
import { icons, kit, uiImages } from "../assets";
import { Panel } from "../components/NineSlice";
import { PageHeading } from "../components/PageHeading";
import { CharacterSprite } from "../components/CharacterSprite";
import { StrokedText } from "../components/StrokedText";
import { useCountUp } from "../components/motion";
import { formatGameNumber } from "../state/gameMath";
import { getPeakAreaStage, getStageLabel } from "../state/stages";
import { getCookbookProgress } from "../state/cookbook";
import { RECIPES } from "../state/recipes";
import { OUTFIT_NAMES } from "../state/buffs";
import { isOutfitUnlocked } from "../state/unlocks";
import type { GameState, Outfit } from "../types";

// How far apart the cards pop in, one after another down the page.
const POP_GAP = 45;

function formatDuration(ms: number) {
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);
  if (hours >= 1) return `${formatGameNumber(hours)}시간 ${minutes % 60}분`;
  return `${minutes}분`;
}

function formatSeconds(ms: number) {
  const seconds = ms / 1000;
  return seconds < 60 ? `${seconds.toFixed(1)}초` : `${Math.floor(seconds / 60)}분 ${Math.round(seconds % 60)}초`;
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
      <PageHeading kicker="PROFILE" title="기니의 발자취" description="지금까지 쌓아 온 것들을 한눈에." />

      {/* 1. The adventurer: the companion out front, where it's got to. */}
      <PopIn delay={0}>
        <Panel slice={kit.panel} style={styles.hero}>
          <View style={styles.heroSprite}>
            <CharacterSprite outfit={state.equippedOutfit} animation="idle" size={96} restartKey={state.equippedOutfit} />
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.heroName}>
              Lv.{formatGameNumber(state.level)} {OUTFIT_NAMES[state.equippedOutfit]}
            </Text>
            <Text style={styles.heroStage}>{getStageLabel(state.stageNumber)}에서 모험 중</Text>
            <Text style={styles.heroMeta}>
              모험 {formatGameNumber(days)}일째 · 플레이 {formatDuration(state.playTimeMs ?? 0)}
            </Text>
          </View>
        </Panel>
      </PopIn>

      <Section title="모험 기록" />
      <View style={styles.grid}>
        <StatCard delay={next()} icon={icons.star} label="레벨" value={state.level} />
        <StatCard delay={next()} icon={icons.compass} label="최고 스테이지" text={getStageLabel(highest)} />
        <StatCard delay={next()} icon={uiImages.swords} label="총 처치 수" value={state.kills} />
        <StatCard delay={next()} icon={icons.codexMonster} label="보스 처치 수" value={state.bossKills ?? 0} />
        <StatCard delay={next()} icon={icons.coins} label="누적 획득 골드" value={state.totalGoldEarned} />
        <StatCard delay={next()} icon={icons.codexBook} label="완성한 요리책" text={`${cookbookDone} / ${RECIPES.length}`} />
        <StatCard delay={next()} icon={icons.codexIngredient} label="발견한 식재료" value={(state.discoveredItems ?? []).length} />
        <StatCard delay={next()} icon={icons.trophy} label="함께한 동료" text={`${ownedCompanions} / ${outfits.length}`} />
        <StatCard delay={next()} icon={icons.questMedal} label="출석한 날" value={state.attendance?.claimed ?? 0} />
      </View>

      {/* 2. The odd little counters the game already keeps. */}
      <Section title="재미 기록" />
      <View style={styles.grid}>
        <StatCard delay={next()} icon={icons.codexBook} label="요리한 횟수" value={state.dishesCooked ?? 0} />
        <StatCard delay={next()} icon={icons.codexIngredient} label="먹은 요리" value={state.dishesEaten ?? 0} />
        <StatCard delay={next()} icon={uiImages.coin} label="잡은 날아다니는 동전" value={state.coinsCaught ?? 0} />
        <StatCard delay={next()} icon={uiImages.swords} label="공격력 강화 횟수" value={state.attackUpgrades} />
        <StatCard delay={next()} icon={icons.chest} label="가방 확장" value={state.bagExpansions ?? 0} />
        <StatCard delay={next()} icon={icons.chest} label="가방이 꽉 찬 횟수" value={state.bagFullCount ?? 0} />
        <StatCard delay={next()} icon={icons.star} label="8시간 넘게 푹 잔 횟수" value={state.longNaps ?? 0} />
        <StatCard delay={next()} icon={icons.codexMonster} label="테토기니 헛스윙" value={state.tetoMisses ?? 0} />
      </View>

      {/* 5. Personal bests (tracked from this update on). */}
      <Section title="최고 기록" />
      <View style={styles.grid}>
        <StatCard delay={next()} icon={uiImages.swords} label="가장 센 한 방" text={state.records?.maxHit ? formatGameNumber(state.records.maxHit) : "기록 없음"} />
        <StatCard delay={next()} icon={icons.codexMonster} label="가장 빨리 잡은 보스" text={state.records?.fastestBossMs ? formatSeconds(state.records.fastestBossMs) : "기록 없음"} />
        <StatCard delay={next()} icon={icons.coins} label="최대 오프라인 골드" text={state.records?.bestOfflineGold ? formatGameNumber(state.records.bestOfflineGold) : "기록 없음"} />
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  page: { backgroundColor: "#e8dcc4", paddingHorizontal: 12, paddingTop: 18, paddingBottom: 25 },
  hero: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 12, gap: 10 },
  heroSprite: { width: 100, height: 100, alignItems: "center", justifyContent: "flex-end" },
  heroCopy: { flex: 1, gap: 3 },
  heroName: { fontSize: 17, fontWeight: "900", fontFamily: fonts.bold, color: colors.ink },
  heroStage: { fontSize: 11, fontWeight: "800", fontFamily: fonts.bold, color: colors.brown },
  heroMeta: { fontSize: 9, color: colors.muted },
  sectionRow: { marginTop: 18, marginBottom: 10, flexDirection: "row", alignItems: "center", gap: 8 },
  sectionLine: { flex: 1, height: 2, borderRadius: 1, backgroundColor: "#c9a978" },
  sectionTitle: { fontSize: 13, fontWeight: "900", fontFamily: fonts.bold, color: colors.cream },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  cardSlot: { width: "31.5%" },
  card: { minHeight: 100, paddingHorizontal: 8, paddingTop: 12, paddingBottom: 10, alignItems: "center" },
  cardIcon: { width: 28, height: 28, marginBottom: 6 },
  cardValue: { fontSize: 13, fontWeight: "900", fontFamily: fonts.bold, color: colors.ink },
  cardLabel: { marginTop: 3, fontSize: 9, color: colors.brown, textAlign: "center" },
});
