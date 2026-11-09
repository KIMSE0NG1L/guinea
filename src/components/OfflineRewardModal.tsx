import { useEffect, useState } from "react";
import { Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming } from "react-native-reanimated";
import { useCountUp, useRollingNumber } from "./motion";
import { colors, fonts } from "../theme";
import { creamSlices, icons, panelSlices, uiImages } from "../assets";
import { StrokedText } from "./StrokedText";
import { TitleRibbon } from "./TitleRibbon";
import { NineSlice, Panel } from "./NineSlice";
import { GameButton } from "./GameButton";
import { RewardedAdModal } from "./RewardedAdModal";
import { AdBadge } from "./AdBadge";
import { formatGameNumber } from "../state/gameMath";
import type { OfflineSummary } from "../state/offline";
import { ITEM_IMAGES } from "../state/recipes";

// When each part of the summary lands (ms after opening): gold and kills count up first,
// then the ingredients pop in one by one, then the level-up.
const ITEMS_AT = 900;
const ITEM_GAP = 110;
// The most ingredient icons shown; the rest fold into a "+N종" chip.
const MAX_ITEMS = 8;

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
      <RewardedAdModal
        message={`대신 섭섭하지 않게 골드 2배는 그대로 챙겨드릴게요.\n+${formatGameNumber(summary.goldEarned * 2)} 골드`}
        claimLabel="2배 받기"
        onClaim={onClaimDouble}
        onCancel={() => {
          setAdOpen(false);
          setDoubling(false);
        }}
      />
    );
  }

  return (
    <Modal visible animationType="fade" transparent onRequestClose={onClaim}>
      <Pressable style={styles.backdrop} onPress={onClaim}>
        <Pressable style={styles.panel} onPress={(event) => event.stopPropagation()}>
          {/* Wood frame with brass corner bolts — a treasure-chest lid feel. */}
          <NineSlice slice={panelSlices.woodBolts} scale={0.62} />

          {/* Title on the same red ribbon the boss first-clear uses. */}
          <TitleRibbon>기니가 혼자 사냥했어요!</TitleRibbon>
          {/* The haul on plain cream plates (no frames inside the big wood frame): one cream card, gold / ingredients / level-up split by thin lines. */}
          <Panel slice={creamSlices.card} scale={0.3} style={styles.card}>
            <View style={styles.goldRow}>
              <Image source={uiImages.coins} style={styles.goldPile} />
              <Animated.View style={goldPopStyle}>
                <StrokedText style={[styles.goldValue, doubling && styles.goldValueDouble]} strokeColor={colors.line} strokeWidth={2.5}>
                  +{formatGameNumber(goldShown)}
                </StrokedText>
              </Animated.View>
            </View>

            {summary.items.length > 0 && (
              <>
                <View style={styles.divider} />
                <View style={styles.itemsRow}>
                  {summary.items.slice(0, MAX_ITEMS).map((item, index) => (
                    <PopIn key={item.name} delay={ITEMS_AT + index * ITEM_GAP}>
                      <Panel slice={creamSlices.cell} scale={0.28} style={styles.itemCell}>
                        {ITEM_IMAGES[item.name] !== undefined && <Image source={ITEM_IMAGES[item.name]} style={styles.itemIcon} />}
                        <Text style={styles.itemCount}>×{formatGameNumber(item.quantity)}</Text>
                      </Panel>
                    </PopIn>
                  ))}
                  {summary.items.length > MAX_ITEMS && (
                    <PopIn delay={ITEMS_AT + MAX_ITEMS * ITEM_GAP}>
                      <Panel slice={creamSlices.cell} scale={0.28} style={[styles.itemCell, styles.moreCell]}>
                        <Text style={styles.moreText}>+{summary.items.length - MAX_ITEMS}종</Text>
                      </Panel>
                    </PopIn>
                  )}
                </View>
                {summary.bagFull && <Text style={styles.bagFull}>가방이 꽉 차서 일부 재료는 두고 왔어요</Text>}
              </>
            )}

            {summary.levelsGained > 0 && (
              <>
                <View style={styles.divider} />
                <Animated.View style={[styles.levelRow, levelPopStyle]}>
                  <Image source={icons.star} style={styles.levelStar} />
                  <Text style={styles.levelText}>
                    Lv.{formatGameNumber(summary.levelFrom)} → <Text style={styles.levelTo}>Lv.{formatGameNumber(summary.levelTo)}</Text>
                  </Text>
                </Animated.View>
              </>
            )}
          </Panel>

          <View style={styles.buttons}>
            <GameButton variant="beige" onPress={onClaim} style={styles.claimButton}>받기</GameButton>
            {summary.goldEarned > 0 && (
              <View>
                <GameButton variant="green" disabled={doubling} onPress={startDouble} accessibilityLabel="광고 보고 골드 2배 받기" style={styles.claimButton}>
                  <View style={styles.doubleContent}>
                    <Text style={styles.doubleSmall}>광고 보고</Text>
                    <Text style={styles.doubleLabel}>2배 받기</Text>
                  </View>
                </GameButton>
                <AdBadge />
              </View>
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
  card: { marginTop: 12, width: "100%", paddingVertical: 16, paddingHorizontal: 16, alignItems: "center" },
  goldRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  divider: { marginVertical: 12, alignSelf: "stretch", height: 2, borderRadius: 1, backgroundColor: "#ead3a4" },
  goldPile: { width: 42, height: 42 },
  goldValue: { fontSize: 28, fontWeight: "900", fontFamily: fonts.bold, color: "#ffd34d" },
  goldValueDouble: { color: "#ff9a6a" },
  itemsRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 6 },
  itemCell: { width: 46, height: 50, paddingTop: 5, alignItems: "center" },
  itemIcon: { width: 26, height: 26, resizeMode: "contain" },
  itemCount: { fontSize: 12, fontWeight: "900", fontFamily: fonts.bold, color: colors.ink },
  moreCell: { justifyContent: "center", paddingTop: 0 },
  moreText: { fontSize: 12, fontWeight: "900", fontFamily: fonts.bold, color: colors.brown },
  bagFull: { marginTop: 6, textAlign: "center", fontSize: 12, fontWeight: "700", fontFamily: fonts.bold, color: colors.red },
  levelRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  levelStar: { width: 20, height: 20 },
  levelText: { fontSize: 15, fontWeight: "900", fontFamily: fonts.bold, color: colors.ink },
  levelTo: { color: colors.red },
  backdrop: {
    flex: 1,
    padding: 22,
    paddingHorizontal: 14,
    justifyContent: "center",
    backgroundColor: "#263024cf",
  },
  panel: {
    paddingHorizontal: 34,
    paddingTop: 34,
    paddingBottom: 32,
    alignItems: "center",
  },
  buttons: { marginTop: 16, flexDirection: "row", gap: 8 },
  claimButton: { minWidth: 110, minHeight: 44 },
  doubleContent: { alignItems: "center" },
  doubleSmall: { fontSize: 12, fontWeight: "800", fontFamily: fonts.bold, color: "#e9f2d4" },
  doubleLabel: { fontSize: 12, fontWeight: "900", fontFamily: fonts.bold, color: colors.cream },
});
