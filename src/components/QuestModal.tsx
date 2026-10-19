import { useEffect, useState } from "react";
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { colors, fonts } from "../theme";
import { buttonKit, frameKit, kit, uiImages, shopImages, kitImages } from "../assets";
import { NineSlice, Panel } from "./NineSlice";
import { ProgressBar } from "./ProgressBar";
import { formatGameNumber } from "../state/gameMath";
import { GameButton } from "./GameButton";
import type { GameState } from "../types";
import { getAllClaimable, getChapterInfo, getDefaultChapter, getQuestIcon, getRevealedHiddenQuests } from "../state/quests";
import { FlightLayer, launchFlight } from "./FlightLayer";
import { measureTarget, tutorialRef } from "./tutorialTargets";
import { useBumpOnChange, useRollingNumber } from "./motion";
import { playSfx } from "../sound";

export function QuestModal({
  state,
  gems,
  onClose,
  onClaim,
}: {
  state: GameState;
  gems: number;
  onClose: () => void;
  onClaim: (id: string) => void;
}) {
  // Opens on the chapter with something to claim (or the newest open one); the arrows on
  // the story card flip between every chapter, locked ones included (they say when they open).
  const [chapterIndex, setChapterIndex] = useState(() => getDefaultChapter(state));
  const chapter = getChapterInfo(state, chapterIndex);
  const quests = chapter.quests;
  const claimedCount = chapter.claimedCount;
  const canPrev = chapterIndex > 0;
  const canNext = chapterIndex < chapter.total - 1;
  // Hidden quests on screen as the modal opened: one achieved while it's open flips in.
  const [openedIds] = useState(() => new Set(getRevealedHiddenQuests(state).map((quest) => quest.id)));
  const shownGems = useRollingNumber(gems, 700);
  const { style: gemBump } = useBumpOnChange(gems);

  // Gems spill out of the claim button and fly up into the counter, then the reward lands.
  // The quest whose gems are mid-flight — its button waits so a double tap can't claim twice.
  const [claiming, setClaiming] = useState<string | null>(null);
  const hidden = getRevealedHiddenQuests(state);
  const claim = (quest: { id: string; reward: number }) => {
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

  // One tap for everything ready across every open chapter (and hidden quests): gems
  // burst out of the button, then each claim lands.
  const claimable = getAllClaimable(state);
  const claimableGems = claimable.reduce((sum, quest) => sum + quest.reward, 0);
  const claimAll = () => {
    if (claiming || claimable.length === 0) return;
    setClaiming("all");
    measureTarget("quest-claim-all").then((from) =>
      measureTarget("quest-gems").then((to) => {
        if (from && to) {
          for (let index = 0; index < Math.min(10, 3 + claimable.length); index++) {
            launchFlight({ image: uiImages.crystal, from, to, delay: index * 60, size: 18, duration: 520, arc: 50 + index * 5, channel: "quest" });
          }
        }
        setTimeout(() => {
          claimable.forEach((quest) => onClaim(quest.id));
          setClaiming(null);
          playSfx("levelup");
        }, 500);
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
                {/* Same cream pill as the header's resource chips. */}
                <Animated.View ref={tutorialRef("quest-gems")} style={[styles.gemCounter, gemBump]}>
                  <NineSlice slice={buttonKit.pillCream} scale={0.3} />
                  <Image source={uiImages.crystal} style={styles.gemIcon} />
                  <Text style={styles.gemText}>{formatGameNumber(shownGems)}</Text>
                </Animated.View>
                <GameButton onPress={onClose} style={styles.closeButton}>닫기</GameButton>
              </View>
            </View>

            <Panel slice={kit.panelParchment} style={styles.storyCard}>
              <View style={styles.chapterRow}>
                <Pressable
                  onPress={() => canPrev && setChapterIndex(chapterIndex - 1)}
                  disabled={!canPrev}
                  accessibilityRole="button"
                  accessibilityLabel="이전 장"
                  hitSlop={6}
                  style={({ pressed }) => [pressed && styles.arrowPressed]}
                >
                  <Image source={canPrev ? shopImages.arrowBack : shopImages.arrowBackGray} style={styles.arrow} />
                </Pressable>
                <View style={styles.chapterCopy}>
                  <Text style={styles.storyEyebrow}>
                    {chapter.title}
                  </Text>
                  <Text style={styles.storyCount}>
                    {chapter.open ? `받은 미션 ${claimedCount} / ${quests.length}` : `Lv.${chapter.level}에 열려요`}
                  </Text>
                  <Text style={styles.storyLine}>{chapter.open ? `"${chapter.line}"` : "아직 열리지 않은 장이에요."}</Text>
                </View>
                <Pressable
                  onPress={() => canNext && setChapterIndex(chapterIndex + 1)}
                  disabled={!canNext}
                  accessibilityRole="button"
                  accessibilityLabel="다음 장"
                  hitSlop={6}
                  style={({ pressed }) => [pressed && styles.arrowPressed]}
                >
                  <Image source={canNext ? shopImages.arrowBack : shopImages.arrowBackGray} style={[styles.arrow, styles.arrowFlip]} />
                </Pressable>
              </View>
            </Panel>

            {claimable.length > 0 && (
              <View ref={tutorialRef("quest-claim-all")} style={styles.claimAllWrap}>
                <GameButton variant="green" onPress={claimAll} disabled={claiming !== null} style={styles.claimAll} accessibilityLabel={`보상 ${claimable.length}개 모두 받기`}>
                  <View style={styles.claimAllContent}>
                    <Text style={styles.claimAllText}>모두 받기 ({claimable.length})</Text>
                    <RewardLabel gems={claimableGems} />
                  </View>
                </GameButton>
              </View>
            )}

            <View style={styles.list}>
              {quests.map((quest) => {
                const complete = quest.current >= quest.target;
                const progress = Math.min(100, (quest.current / quest.target) * 100);
                return (
                  <FlipIn key={quest.id} fresh={false}>
                  <Panel slice={kit.panel} scale={0.4} style={[styles.item, !chapter.open && styles.itemLocked]}>
                    <Panel slice={frameKit.squareWood} scale={0.45} style={styles.iconSlot}>
                      {getQuestIcon(quest.id) !== undefined && (
                        <Image source={getQuestIcon(quest.id)} style={styles.icon} resizeMode="contain" />
                      )}
                      {chapter.open && complete && !quest.claimed && (
                        <Image source={kitImages.dotRed} style={styles.readyDot} accessibilityLabel="받을 보상 있음" />
                      )}
                    </Panel>
                    <View style={styles.info}>
                      <View style={styles.titleRow}>
                        <Text style={styles.infoTitle}>{quest.title}</Text>
                      </View>
                      <ProgressBar progress={progress} fill="green" height={12} style={styles.track} />
                      <Text style={styles.infoSub}>
                        {formatGameNumber(Math.min(quest.current, quest.target))} / {formatGameNumber(quest.target)}
                      </Text>
                    </View>
                    <View ref={tutorialRef(`quest-claim-${quest.id}`)}>
                      <GameButton
                        variant="green"
                        disabled={!chapter.open || !complete || quest.claimed || claiming === quest.id}
                        onPress={() => claim(quest)}
                        style={styles.claimButton}
                        textStyle={styles.claimButtonText}
                      >
                        {quest.claimed ? "완료" : <RewardLabel gems={quest.reward} />}
                      </GameButton>
                    </View>
                  </Panel>
                  </FlipIn>
                );
              })}
            </View>

            {/* Hidden quests only appear once achieved — a little secret for whoever got there. */}
            {hidden.length > 0 && (
              <View style={styles.hiddenSection}>
                <Text style={styles.hiddenHeading}>✦ 히든 퀘스트</Text>
                {hidden.map((quest) => (
                  <FlipIn key={quest.id} fresh={!openedIds.has(quest.id)}>
                    <Panel slice={kit.panelParchment} scale={0.4} style={styles.item}>
                      <Panel slice={frameKit.squareGold} scale={0.4} style={styles.iconSlot}>
                        <Text style={styles.hiddenMark}>?!</Text>
                      </Panel>
                      <View style={styles.info}>
                        <Text style={styles.infoTitle}>{quest.title}</Text>
                        <Text style={styles.hiddenFlavor}>{quest.flavor}</Text>
                      </View>
                      <View ref={tutorialRef(`quest-claim-${quest.id}`)}>
                        <GameButton
                          variant="green"
                          disabled={quest.claimed || claiming === quest.id}
                          onPress={() => claim(quest)}
                          style={styles.claimButton}
                          textStyle={styles.claimButtonText}
                        >
                          {quest.claimed ? "완료" : <RewardLabel gems={quest.reward} />}
                        </GameButton>
                      </View>
                    </Panel>
                  </FlipIn>
                ))}
              </View>
            )}
          </ScrollView>
          <FlightLayer channel="quest" />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// The claim button's face: the gems it pays, instead of a "받기" label.
function RewardLabel({ gems }: { gems: number }) {
  return (
    <View style={styles.rewardLabel}>
      <Image source={uiImages.crystal} style={styles.rewardGem} />
      <Text style={styles.rewardText}>{formatGameNumber(gems)}</Text>
    </View>
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
  gemCounter: { height: 32, minWidth: 74, flexDirection: "row", alignItems: "center", gap: 4, paddingLeft: 8, paddingRight: 14, paddingBottom: 2 },
  gemIcon: { width: 18, height: 18 },
  gemText: { color: colors.ink, fontSize: 12, fontWeight: "900", fontFamily: fonts.bold },
  storyCard: {
    marginVertical: 14,
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  hiddenSection: { marginTop: 16, gap: 8 },
  hiddenHeading: { marginLeft: 4, fontSize: 12, fontWeight: "900", fontFamily: fonts.bold, color: "#8a5cb0", letterSpacing: 1 },
  hiddenMark: { fontSize: 16, fontWeight: "900", fontFamily: fonts.bold, color: "#8a5cb0" },
  hiddenFlavor: { marginTop: 2, marginBottom: 3, fontSize: 9, fontStyle: "italic", color: colors.brown },
  chapterRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  chapterCopy: { flex: 1, alignItems: "center" },
  arrow: { width: 40, height: 26 },
  arrowFlip: { transform: [{ scaleX: -1 }] },
  arrowPressed: { transform: [{ scale: 0.92 }] },
  itemLocked: { opacity: 0.55 },
  storyCount: { marginTop: 3, textAlign: "center", color: colors.green, fontSize: 10, fontWeight: "900", fontFamily: fonts.bold },
  storyEyebrow: { textAlign: "center", color: colors.ink, fontSize: 17, fontWeight: "900", fontFamily: fonts.bold },
  storyLine: { marginTop: 8, textAlign: "center", color: colors.brown, fontSize: 12, lineHeight: 18 },
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
  // Same red dot as the battle screen's quest medal: this one's ready to claim.
  readyDot: { position: "absolute", right: -3, top: -3, width: 13, height: 13 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  info: { flex: 1 },
  infoTitle: { fontSize: 10, fontWeight: "800", fontFamily: fonts.bold, color: colors.ink },
  claimAllWrap: { marginBottom: 10 },
  claimAll: { minHeight: 40 },
  claimAllContent: { flexDirection: "row", alignItems: "center", gap: 10 },
  claimAllText: { fontSize: 13, fontWeight: "900", fontFamily: fonts.bold, color: colors.cream },
  rewardLabel: { flexDirection: "row", alignItems: "center", gap: 3 },
  rewardGem: { width: 15, height: 15 },
  rewardText: { fontSize: 12, fontWeight: "900", fontFamily: fonts.bold, color: colors.cream },
  infoSub: { color: colors.muted, fontSize: 8, fontWeight: "700", fontFamily: fonts.bold },
  track: { marginVertical: 4 },
  claimButton: { minWidth: 50, paddingHorizontal: 8 },
  claimButtonText: { fontSize: 9 },
});
