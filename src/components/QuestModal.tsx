import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { kit, uiImages } from "../assets";
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
                    {complete ? (
                      <View style={styles.symbol}>
                        <Text style={styles.symbolText}>✓</Text>
                      </View>
                    ) : (
                      <Image source={uiImages.badgeAlert} style={styles.symbolImage} />
                    )}
                    <View style={styles.info}>
                      <Text style={styles.infoTitle}>{quest.title}</Text>
                      <ProgressBar progress={progress} fill="green" height={12} style={styles.track} />
                      <View style={styles.infoSubRow}>
                        <Text style={styles.infoSub}>
                          {formatGameNumber(Math.min(quest.current, quest.target))} / {formatGameNumber(quest.target)} · 보상
                        </Text>
                        <Image source={uiImages.coin} style={styles.rewardCoin} />
                        <Text style={styles.infoSub}>{formatGameNumber(quest.reward)} G</Text>
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
  symbol: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gold,
    borderWidth: 2,
    borderColor: colors.line,
    borderRadius: 15,
  },
  symbolText: { color: "white", fontWeight: "900", fontFamily: fonts.bold },
  symbolImage: { width: 30, height: 30 },
  info: { flex: 1 },
  infoTitle: { fontSize: 10, fontWeight: "800", fontFamily: fonts.bold, color: colors.ink },
  infoSubRow: { flexDirection: "row", alignItems: "center", gap: 2 },
  rewardCoin: { width: 10, height: 10 },
  infoSub: { color: colors.muted, fontSize: 8, fontWeight: "700", fontFamily: fonts.bold },
  track: { marginVertical: 4 },
  claimButton: { minWidth: 50, paddingHorizontal: 8 },
  claimButtonText: { fontSize: 9 },
});
