import { useEffect, useState } from "react";
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { colors, fonts } from "../theme";
import { frameKit, kit, uiImages } from "../assets";
import { getQuestIcon } from "../state/quests";
import { NineSlice, Panel } from "./NineSlice";
import { ProgressBar } from "./ProgressBar";
import { formatGameNumber } from "../state/gameMath";
import { GameButton } from "./GameButton";
import type { Quest } from "../types";
import { FlightLayer, launchFlight } from "./FlightLayer";
import { measureTarget, tutorialRef } from "./tutorialTargets";
import { useBumpOnChange, useRollingNumber } from "./motion";
import { playSfx } from "../sound";

export function QuestModal({
  quests,
  gems,
  onClose,
  onClaim,
}: {
  quests: Quest[];
  gems: number;
  onClose: () => void;
  onClaim: (id: string) => void;
}) {
  // Tiers as the modal opened: a quest whose tier moves on while it's open flips in fresh.
  const [openedTiers] = useState(() => new Map(quests.map((quest) => [quest.id, quest.tier ?? 0])));
  const shownGems = useRollingNumber(gems, 700);
  const { style: gemBump } = useBumpOnChange(gems);

  // Gems spill out of the claim button and fly up into the counter, then the reward lands.
  // The quest whose gems are mid-flight — its button waits so a double tap can't claim twice.
  const [claiming, setClaiming] = useState<string | null>(null);
  const claim = (quest: Quest) => {
    if (claiming) return;
    setClaiming(quest.id);
    measureTarget(`quest-claim-${quest.id}`).then((from) =>
      measureTarget("quest-gems").then((to) => {
        if (from && to) {
          const count = Math.min(6, 2 + Math.floor(quest.reward / 10));
          for (let index = 0; index < count; index++) {
            launchFlight({ image: uiImages.crystal, from, to, delay: index * 70, size: 18, duration: 520, arc: 50 + index * 6, channel: "quest" });
          }
        }
        setTimeout(() => {
          onClaim(quest.id);
          setClaiming(null);
          playSfx("levelup");
        }, 450);
      }),
    );
  };

  return (
    <Modal visible animationType="fade" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.panel} onPress={(event) => event.stopPropagation()}>
          <NineSlice slice={kit.panelLarge} />
          <ScrollView>
            <View style={styles.top}>
              <View>
                <Text style={styles.topEyebrow}>오늘의 할 일</Text>
                <Text style={styles.topTitle}>골목 퀘스트</Text>
              </View>
              <View style={styles.topRight}>
                <Animated.View ref={tutorialRef("quest-gems")} style={[styles.gemCounter, gemBump]}>
                  <Image source={uiImages.crystal} style={styles.gemIcon} />
                  <Text style={styles.gemText}>{formatGameNumber(shownGems)}</Text>
                </Animated.View>
                <GameButton onPress={onClose} style={styles.closeButton}>닫기</GameButton>
              </View>
            </View>

            <Panel slice={kit.panelParchment} style={styles.storyCard}>
              <Text style={styles.storyEyebrow}>1장: 골목의 기니</Text>
              <Text style={styles.storyLine}>&quot;기니는 오늘도 배가 고팠다.&quot;</Text>
            </Panel>

            <View style={styles.list}>
              {quests.map((quest) => {
                const complete = quest.current >= quest.target;
                const progress = Math.min(100, (quest.current / quest.target) * 100);
                return (
                  <FlipIn key={`${quest.id}-${quest.tier ?? 0}`} fresh={(quest.tier ?? 0) !== openedTiers.get(quest.id)}>
                  <Panel slice={kit.panel} scale={0.4} style={styles.item}>
                    <Panel slice={frameKit.squareWood} scale={0.45} style={styles.iconSlot}>
                      {getQuestIcon(quest.id) !== undefined && (
                        <Image source={getQuestIcon(quest.id)} style={styles.icon} resizeMode="contain" />
                      )}
                      {complete && !quest.claimed && (
                        <View style={styles.check}>
                          <Text style={styles.checkText}>✓</Text>
                        </View>
                      )}
                    </Panel>
                    <View style={styles.info}>
                      <View style={styles.titleRow}>
                        <Text style={styles.infoTitle}>{quest.title}</Text>
                        <Text style={styles.tier}>{(quest.tier ?? 0) + 1}단계</Text>
                      </View>
                      <ProgressBar progress={progress} fill="green" height={12} style={styles.track} />
                      <View style={styles.infoSubRow}>
                        <Text style={styles.infoSub}>
                          {formatGameNumber(Math.min(quest.current, quest.target))} / {formatGameNumber(quest.target)} · 보상
                        </Text>
                        <Image source={uiImages.crystal} style={styles.rewardCoin} />
                        <Text style={styles.infoSub}>{formatGameNumber(quest.reward)}</Text>
                      </View>
                    </View>
                    <View ref={tutorialRef(`quest-claim-${quest.id}`)}>
                      <GameButton
                        variant="green"
                        disabled={!complete || quest.claimed || claiming === quest.id}
                        onPress={() => claim(quest)}
                        style={styles.claimButton}
                        textStyle={styles.claimButtonText}
                      >
                        {quest.claimed ? "완료" : "받기"}
                      </GameButton>
                    </View>
                  </Panel>
                  </FlipIn>
                );
              })}
            </View>
          </ScrollView>
          <FlightLayer channel="quest" />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// The next rung of a quest turning over like a card (it scales in from edge-on).
function FlipIn({ fresh, children }: { fresh: boolean; children: React.ReactNode }) {
  const t = useSharedValue(fresh ? 0 : 1);
  useEffect(() => {
    if (fresh) t.value = withTiming(1, { duration: 380, easing: Easing.out(Easing.back(1.4)) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: 0.3 + t.value * 0.7, transform: [{ perspective: 600 }, { rotateX: `${(1 - t.value) * 90}deg` }] }));
  return <Animated.View style={style}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    padding: 22,
    paddingHorizontal: 14,
    justifyContent: "center",
    backgroundColor: "#263024cf",
  },
  panel: {
    maxHeight: "90%",
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 20,
  },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  topEyebrow: { color: colors.green, fontWeight: "800", fontFamily: fonts.bold, fontSize: 9, letterSpacing: 1.5 },
  topTitle: { fontSize: 20, fontWeight: "800", fontFamily: fonts.bold, color: colors.ink, letterSpacing: -0.5 },
  closeButton: { paddingHorizontal: 12 },
  topRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  gemCounter: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, backgroundColor: "#4a3418d9" },
  gemIcon: { width: 16, height: 16 },
  gemText: { color: colors.gold, fontSize: 11, fontWeight: "900", fontFamily: fonts.bold },
  storyCard: {
    marginVertical: 14,
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  storyEyebrow: { color: colors.brown, fontSize: 9, fontFamily: fonts.bold },
  storyLine: { marginTop: 5, color: colors.ink, fontSize: 13 },
  list: { gap: 8 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 11,
    paddingTop: 9,
    paddingBottom: 11,
  },
  iconSlot: { width: 42, height: 42, alignItems: "center", justifyContent: "center" },
  icon: { width: 30, height: 30 },
  // Gold tick on the tile's corner while the reward is waiting to be claimed.
  check: {
    position: "absolute",
    right: -4,
    top: -4,
    width: 17,
    height: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gold,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: 9,
  },
  checkText: { color: "white", fontSize: 9, fontWeight: "900", fontFamily: fonts.bold },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  tier: { fontSize: 8, fontWeight: "900", fontFamily: fonts.bold, color: colors.green },
  info: { flex: 1 },
  infoTitle: { fontSize: 10, fontWeight: "800", fontFamily: fonts.bold, color: colors.ink },
  infoSubRow: { flexDirection: "row", alignItems: "center", gap: 2 },
  rewardCoin: { width: 12, height: 12 },
  infoSub: { color: colors.muted, fontSize: 8, fontWeight: "700", fontFamily: fonts.bold },
  track: { marginVertical: 4 },
  claimButton: { minWidth: 50, paddingHorizontal: 8 },
  claimButtonText: { fontSize: 9 },
});
