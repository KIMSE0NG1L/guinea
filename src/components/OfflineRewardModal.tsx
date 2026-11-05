import { useEffect, useState } from "react";
import { Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming } from "react-native-reanimated";
import { useCountUp, useRollingNumber } from "./motion";
import { colors, fonts } from "../theme";
import { kit, icons, uiImages } from "../assets";
import { NineSlice, Panel } from "./NineSlice";
import { GameButton } from "./GameButton";
import { AdUnavailableModal } from "./AdUnavailableModal";
import { formatGameNumber } from "../state/gameMath";
import type { OfflineSummary } from "../state/offline";
import { ITEM_IMAGES } from "../state/recipes";

// When each part of the summary lands (ms after opening): gold and kills count up first,
// then the ingredients pop in one by one, then the level-up.
const ITEMS_AT = 900;
const ITEM_GAP = 110;
// The most ingredient icons shown; the rest fold into a "+N종" chip.
const MAX_ITEMS = 8;

function formatTimeAway(ms: number) {
  const totalMinutes = Math.round(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `${hours}시간 ${minutes}분`;
  return `${minutes}분`;
}

export function OfflineRewardModal({
  summary,
  onClaim,
  onClaimDouble,
}: {
  summary: OfflineSummary;
  onClaim: () => void;
  onClaimDouble: () => void;
}) {
  const [adOpen, setAdOpen] = useState(false);
  // Gold and kills count up from zero as the popup opens; "2배" rolls the gold up to double
  // (with a pop) before the claim goes through.
  const countedGold = useCountUp(summary.goldEarned, 1100, 250);
  const countedKills = useCountUp(summary.mobsKilled, 900, 250);
  const [doubling, setDoubling] = useState(false);
  const doubledGold = useRollingNumber(doubling ? summary.goldEarned * 2 : summary.goldEarned, 600);
  const goldShown = doubling ? doubledGold : countedGold;
  const goldPop = useSharedValue(1);
  const goldPopStyle = useAnimatedStyle(() => ({ transform: [{ scale: goldPop.value }] }));
  const levelPop = useSharedValue(0);
  const levelPopStyle = useAnimatedStyle(() => ({ opacity: Math.min(1, levelPop.value), transform: [{ scale: levelPop.value }] }));
  useEffect(() => {
    levelPop.set(withDelay(ITEMS_AT + Math.min(summary.items.length, MAX_ITEMS + 1) * ITEM_GAP + 250, withSequence(withTiming(1.3, { duration: 180, easing: Easing.out(Easing.quad) }), withTiming(1, { duration: 160 }))));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const startDouble = () => {
    setDoubling(true);
    goldPop.set(withDelay(500, withSequence(withTiming(1.35, { duration: 140 }), withTiming(1, { duration: 160 }))));
    setTimeout(() => setAdOpen(true), 900);
  };

  if (adOpen) {
    return (
      <AdUnavailableModal
        message={`대신 섭섭하지 않게 골드 2배는 그대로 챙겨드릴게요.\n+${formatGameNumber(summary.goldEarned * 2)} 골드`}
        claimLabel="2배 받기"
        onClaim={onClaimDouble}
      />
    );
  }

  return (
    <Modal visible animationType="fade" transparent onRequestClose={onClaim}>
      <Pressable style={styles.backdrop} onPress={onClaim}>
        <Pressable style={styles.panel} onPress={(event) => event.stopPropagation()}>
          <NineSlice slice={kit.panelLarge} />
          <Image source={icons.compass} style={styles.heroIcon} />
          <Text style={styles.eyebrow}>자리를 비운 동안</Text>
          <Text style={styles.title}>기니가 혼자 사냥했어요!</Text>
          <Text style={styles.timeAway}>{formatTimeAway(summary.timeAwayMs)} 동안 자동 전투</Text>

          <Panel slice={kit.panelParchment} style={styles.statRow}>
            <View style={styles.statItem}>
              <Image source={uiImages.coin} style={styles.statIcon} />
              <Animated.Text style={[styles.statValue, goldPopStyle, doubling && styles.statValueDouble]}>+{formatGameNumber(goldShown)}</Animated.Text>
              <Text style={styles.statLabel}>골드</Text>
            </View>
            <View style={styles.statItem}>
              <Image source={icons.scroll} style={styles.statIcon} />
              <Text style={styles.statValue}>{formatGameNumber(countedKills)}마리</Text>
              <Text style={styles.statLabel}>처치</Text>
            </View>
          </Panel>

          {/* Ingredients picked up: icons pop in one at a time, each with its count. */}
          {summary.items.length > 0 && (
            <View style={styles.itemsBlock}>
              <Text style={styles.sectionLabel}>주운 재료</Text>
              <View style={styles.itemsRow}>
                {summary.items.slice(0, MAX_ITEMS).map((item, index) => (
                  <PopIn key={item.name} delay={ITEMS_AT + index * ITEM_GAP}>
                    <View style={styles.itemCell}>
                      {ITEM_IMAGES[item.name] !== undefined && <Image source={ITEM_IMAGES[item.name]} style={styles.itemIcon} />}
                      <Text style={styles.itemCount}>×{formatGameNumber(item.quantity)}</Text>
                    </View>
                  </PopIn>
                ))}
                {summary.items.length > MAX_ITEMS && (
                  <PopIn delay={ITEMS_AT + MAX_ITEMS * ITEM_GAP}>
                    <View style={[styles.itemCell, styles.moreCell]}>
                      <Text style={styles.moreText}>+{summary.items.length - MAX_ITEMS}종</Text>
                    </View>
                  </PopIn>
                )}
              </View>
              {summary.bagFull && <Text style={styles.bagFull}>가방이 꽉 차서 일부 재료는 두고 왔어요</Text>}
            </View>
          )}

          {/* Level-up: a gold banner that slams in last, with the old and new level. */}
          {summary.levelsGained > 0 && (
            <Animated.View style={[styles.levelBanner, levelPopStyle]}>
              <Image source={icons.star} style={styles.levelStar} />
              <Text style={styles.levelText}>
                레벨업! Lv.{formatGameNumber(summary.levelFrom)} → <Text style={styles.levelTo}>Lv.{formatGameNumber(summary.levelTo)}</Text>
              </Text>
              <Image source={icons.star} style={styles.levelStar} />
            </Animated.View>
          )}

          {summary.bossReady && <Text style={styles.bossNote}>보스가 기다리고 있어요 — 직접 잡으러 가볼까요?</Text>}

          <View style={styles.buttons}>
            <GameButton variant="beige" onPress={onClaim} style={styles.claimButton}>받기</GameButton>
            {summary.goldEarned > 0 && (
              <GameButton variant="green" disabled={doubling} onPress={startDouble} accessibilityLabel="광고 보고 골드 2배 받기" style={styles.claimButton}>
                <View style={styles.doubleContent}>
                  <Text style={styles.doubleSmall}>광고 보고</Text>
                  <Text style={styles.doubleLabel}>2배 받기</Text>
                </View>
              </GameButton>
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// Springs a child in from nothing after `delay`.
function PopIn({ delay, children }: { delay: number; children: React.ReactNode }) {
  const pop = useSharedValue(0);
  useEffect(() => {
    pop.set(withDelay(delay, withSequence(withTiming(1.25, { duration: 160, easing: Easing.out(Easing.quad) }), withTiming(1, { duration: 120 }))));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: Math.min(1, pop.value), transform: [{ scale: pop.value }] }));
  return <Animated.View style={style}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  itemsBlock: { marginTop: 12, width: "100%", alignItems: "center" },
  sectionLabel: { fontSize: 9, fontWeight: "900", fontFamily: fonts.bold, color: colors.brown, letterSpacing: 1 },
  itemsRow: { marginTop: 6, flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 6 },
  itemCell: {
    width: 44,
    paddingTop: 4,
    paddingBottom: 3,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#c9a978",
    backgroundColor: "#fff6e2",
    alignItems: "center",
  },
  itemIcon: { width: 26, height: 26, resizeMode: "contain" },
  itemCount: { fontSize: 9, fontWeight: "900", fontFamily: fonts.bold, color: colors.ink },
  moreCell: { height: 47, justifyContent: "center" },
  moreText: { fontSize: 10, fontWeight: "900", fontFamily: fonts.bold, color: colors.brown },
  bagFull: { marginTop: 6, fontSize: 9, fontWeight: "700", fontFamily: fonts.bold, color: colors.red },
  levelBanner: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.line,
    backgroundColor: "#ffd84a",
  },
  levelStar: { width: 16, height: 16 },
  levelText: { fontSize: 12, fontWeight: "900", fontFamily: fonts.bold, color: colors.ink },
  levelTo: { color: colors.red },
  statValueDouble: { color: colors.red },
  backdrop: {
    flex: 1,
    padding: 22,
    paddingHorizontal: 14,
    justifyContent: "center",
    backgroundColor: "#263024cf",
  },
  panel: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 18,
    alignItems: "center",
  },
  heroIcon: { width: 44, height: 44, marginBottom: 6 },
  eyebrow: { color: colors.green, fontWeight: "800", fontFamily: fonts.bold, fontSize: 9, letterSpacing: 1.5 },
  title: { marginTop: 2, fontSize: 18, fontWeight: "800", fontFamily: fonts.bold, color: colors.ink, textAlign: "center" },
  timeAway: { marginTop: 4, fontSize: 10, color: colors.brown },
  statRow: {
    marginTop: 16,
    width: "100%",
    paddingVertical: 14,
    paddingHorizontal: 10,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: { alignItems: "center", gap: 2 },
  statIcon: { width: 26, height: 26, marginBottom: 2 },
  statValue: { fontSize: 13, fontWeight: "900", fontFamily: fonts.bold, color: colors.ink },
  statLabel: { fontSize: 8, color: colors.muted, fontWeight: "700", fontFamily: fonts.bold },
  bossNote: { marginTop: 12, fontSize: 10, fontWeight: "700", fontFamily: fonts.bold, color: colors.red, textAlign: "center" },
  buttons: { marginTop: 16, flexDirection: "row", gap: 8 },
  claimButton: { minWidth: 110, minHeight: 44 },
  doubleContent: { alignItems: "center" },
  doubleSmall: { fontSize: 8, fontWeight: "800", fontFamily: fonts.bold, color: "#e9f2d4" },
  doubleLabel: { fontSize: 12, fontWeight: "900", fontFamily: fonts.bold, color: colors.cream },
});
