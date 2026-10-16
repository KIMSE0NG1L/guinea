import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { frameKit, kit, uiImages } from "../assets";
import { getQuestIcon } from "../state/quests";
import { NineSlice, Panel } from "./NineSlice";
import { ProgressBar } from "./ProgressBar";
import { formatGameNumber } from "../state/gameMath";
import { GameButton } from "./GameButton";
import type { Quest } from "../types";

export function QuestModal({
  quests,
  onClose,
  onClaim,
}: {
  quests: Quest[];
  onClose: () => void;
  onClaim: (id: string) => void;
}) {
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
              <GameButton onPress={onClose} style={styles.closeButton}>닫기</GameButton>
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
                  <Panel slice={kit.panel} scale={0.4} style={styles.item} key={quest.id}>
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
                    <GameButton
                      variant="green"
                      disabled={!complete || quest.claimed}
                      onPress={() => onClaim(quest.id)}
                      style={styles.claimButton}
                      textStyle={styles.claimButtonText}
                    >
                      {quest.claimed ? "완료" : "받기"}
                    </GameButton>
                  </Panel>
                );
              })}
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
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
