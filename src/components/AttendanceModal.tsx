import { useEffect, useState } from "react";
import { Image, Modal, StyleSheet, Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { colors, fonts } from "../theme";
import { creamSlices, panelSlices, uiImages } from "../assets";
import { NineSlice, Panel } from "./NineSlice";
import { StrokedText } from "./StrokedText";
import { AdBadge } from "./AdBadge";
import { GameButton } from "./GameButton";
import { formatGameNumber } from "../state/gameMath";
import { ATTENDANCE_REWARDS, type AttendanceReward } from "../state/attendance";
import { RewardedAdModal } from "./RewardedAdModal";

const STAMP_MS = 700;

// The daily attendance card: a wood frame with a leafy plank sign carrying the title, then
// one cream card holding the 7-day cycle (4 + 3 tiles; the 7th, the big gem day, is double
// wide in a plain gold frame, the one framed tile). Days already claimed are stamped; today's tile has a green tag. Claiming stamps today's tile; then the same reward can be taken
// once more by watching an ad, or the card closed.
export function AttendanceModal({
  dayIndex: dayIndexProp,
  goldFor,
  onClaim,
  onBonus,
  onClose,
}: {
  dayIndex: number;
  // Gold a "mobs" day pays right now.
  goldFor: (mobs: number) => number;
  onClaim: () => { gems: number; gold: number };
  // Pays `reward` again after the ad (once a day; the state guards it).
  onBonus: (reward: { gems: number; gold: number }) => void;
  onClose: () => void;
}) {
  // Fixed at opening: claiming advances the save's day, which would shift the stamp onto
  // tomorrow's tile.
  const [dayIndex] = useState(dayIndexProp);
  const [claimed, setClaimed] = useState<{ gems: number; gold: number } | null>(null);
  const [adOpen, setAdOpen] = useState(false);
  const [stamped, setStamped] = useState(false);
  const claim = () => {
    if (claimed) return;
    setClaimed(onClaim());
    setTimeout(() => setStamped(true), STAMP_MS);
  };

  if (adOpen && claimed) {
    const what = [claimed.gems > 0 ? `보석 ${claimed.gems}개` : "", claimed.gold > 0 ? `골드 ${formatGameNumber(claimed.gold)}` : ""].filter(Boolean).join(", ");
    return (
      <RewardedAdModal
        message={`대신 섭섭하지 않게 ${what}를 한 번 더 챙겨드릴게요.`}
        claimLabel="한 번 더 받기"
        onClaim={() => {
          onBonus(claimed);
          onClose();
        }}
        onCancel={onClose}
      />
    );
  }

  return (
    <Modal visible animationType="fade" transparent onRequestClose={claimed ? onClose : claim}>
      <View style={styles.backdrop}>
        <View style={styles.panel}>
          <NineSlice slice={panelSlices.leafPlank} scale={0.7} />
          <View style={styles.plank} pointerEvents="none">
            <StrokedText style={styles.title} strokeColor="#4a2408" strokeWidth={2.5}>
              출석 보상
            </StrokedText>
          </View>
            <View style={styles.grid}>
              {ATTENDANCE_REWARDS.map((reward, index) => (
                <Tile
                  key={index}
                  day={index + 1}
                  reward={reward}
                  gold={reward.kind === "gold" ? goldFor(reward.mobs) : 0}
                  state={index < dayIndex || (index === dayIndex && claimed !== null) ? "done" : index === dayIndex ? "today" : "later"}
                  stamping={index === dayIndex && claimed !== null}
                  wide={index === ATTENDANCE_REWARDS.length - 1}
                />
              ))}
            </View>
          <View style={styles.buttons}>
            {claimed && stamped ? (
              <>
                <GameButton variant="beige" onPress={onClose} style={styles.button}>
                  닫기
                </GameButton>
                <View>
                  <GameButton variant="green" onPress={() => setAdOpen(true)} accessibilityLabel="광고 보고 한 번 더 받기" style={styles.button}>
                    <View style={styles.adContent}>
                      <Text style={styles.adSmall}>광고 보고</Text>
                      <Text style={styles.adLabel}>한 번 더</Text>
                    </View>
                  </GameButton>
                  <AdBadge />
                </View>
              </>
            ) : (
              <GameButton variant={claimed ? "gray" : "green"} disabled={claimed !== null} onPress={claim} style={styles.claimButton}>
                {claimed ? "받았어요!" : "받기"}
              </GameButton>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function Tile({
  day,
  reward,
  gold,
  state,
  stamping,
  wide,
}: {
  day: number;
  reward: AttendanceReward;
  gold: number;
  state: "done" | "today" | "later";
  stamping: boolean;
  wide: boolean;
}) {
  // Today's tile breathes until claimed; the stamp slams down when it is.
  const glow = useSharedValue(0);
  const stamp = useSharedValue(state === "done" && !stamping ? 1 : 0);
  useEffect(() => {
    if (state === "today") glow.value = withRepeat(withSequence(withTiming(1, { duration: 600 }), withTiming(0, { duration: 600 })), -1);
    else glow.value = withTiming(0, { duration: 150 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);
  useEffect(() => {
    if (!stamping) return;
    stamp.value = withSequence(withTiming(0, { duration: 0 }), withTiming(1, { duration: STAMP_MS, easing: Easing.out(Easing.back(2)) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stamping]);
  const todayStyle = useAnimatedStyle(() => ({ transform: [{ scale: 1 + glow.value * 0.06 }] }));
  const stampStyle = useAnimatedStyle(() => ({ opacity: Math.min(1, stamp.value * 2), transform: [{ scale: 2 - stamp.value }, { rotate: "-14deg" }] }));

  return (
    <Animated.View style={[styles.tile, wide && styles.tileWide, todayStyle]}>
      <Panel slice={wide ? panelSlices.goldPill : creamSlices.cell} scale={wide ? 0.3 : 0.28} style={[styles.tileInner, wide && styles.tileInnerWide]}>
        <View style={[styles.dayTag, state === "today" && styles.dayTagToday]}>
          <Text style={[styles.day, state === "today" && styles.dayToday]}>{day}일</Text>
        </View>
        <View style={[styles.tileBody, state === "done" && styles.tileBodyDone]}>
          <Image source={reward.kind === "gems" ? uiImages.crystal : uiImages.coin} style={[styles.icon, wide && styles.iconWide]} />
          <Text style={styles.amount}>{reward.kind === "gems" ? `${reward.amount}` : formatGameNumber(gold)}</Text>
        </View>
      </Panel>
      {(state === "done" || stamping) && (
        <Animated.View style={[styles.stamp, stampStyle]} pointerEvents="none">
          <Text style={styles.stampText}>받음</Text>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const TILE = 62;
const GAP = 8;

const styles = StyleSheet.create({
  backdrop: { flex: 1, padding: 22, paddingHorizontal: 14, justifyContent: "center", backgroundColor: "#263024cf" },
  panel: { width: "100%", maxWidth: 400, alignSelf: "center", paddingHorizontal: 32, paddingTop: 88, paddingBottom: 32, alignItems: "center" },
  // Sits over the plank sign at the top of the frame (94px of art at scale 0.7).
  plank: { position: "absolute", top: 10, left: 0, right: 0, height: 52, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "900", fontFamily: fonts.bold, color: "#fff1c4" },
  grid: { marginTop: 4, width: TILE * 4 + GAP * 3, flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: GAP },
  tile: { width: TILE, height: 80 },
  tileWide: { width: TILE * 2 + GAP },
  tileInnerWide: { paddingTop: 9, paddingBottom: 8 },
  tileInner: { flex: 1, paddingTop: 5, paddingBottom: 5, alignItems: "center" },
  dayTag: { paddingHorizontal: 6, borderRadius: 7 },
  dayTagToday: { backgroundColor: colors.green },
  day: { fontSize: 12, fontWeight: "900", fontFamily: fonts.bold, color: colors.brown },
  dayToday: { color: colors.cream },
  tileBody: { flex: 1, alignItems: "center", justifyContent: "center" },
  tileBodyDone: { opacity: 0.4 },
  icon: { width: 26, height: 26, resizeMode: "contain" },
  iconWide: { width: 30, height: 30 },
  amount: { marginTop: 1, fontSize: 12, fontWeight: "900", fontFamily: fonts.bold, color: colors.ink },
  stamp: {
    position: "absolute",
    top: 26,
    alignSelf: "center",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.red,
    backgroundColor: "#ffffffd9",
  },
  stampText: { color: colors.red, fontSize: 13, fontWeight: "900", fontFamily: fonts.bold },
  buttons: { marginTop: 16, flexDirection: "row", gap: 8 },
  button: { minWidth: 110, minHeight: 44 },
  claimButton: { minWidth: 150, minHeight: 44 },
  adContent: { alignItems: "center" },
  adSmall: { fontSize: 13, fontWeight: "800", fontFamily: fonts.bold, color: "#e9f2d4" },
  adLabel: { fontSize: 13, fontWeight: "900", fontFamily: fonts.bold, color: colors.cream },
});
