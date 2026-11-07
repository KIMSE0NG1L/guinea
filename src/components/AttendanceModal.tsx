import { useEffect, useState } from "react";
import { Image, Modal, StyleSheet, Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { colors, fonts } from "../theme";
import { kit, uiImages } from "../assets";
import { NineSlice } from "./NineSlice";
import { GameButton } from "./GameButton";
import { formatGameNumber } from "../state/gameMath";
import { ATTENDANCE_REWARDS, type AttendanceReward } from "../state/attendance";
import { RewardedAdModal } from "./RewardedAdModal";

const STAMP_MS = 700;

// The daily attendance card: the 7-day cycle as a row of tiles (4 + 3), days already claimed
// stamped, today's glowing. Claiming stamps today's tile; then the same reward can be taken
// once more by watching an ad, or the card closed.
export function AttendanceModal({
  dayIndex,
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
          <NineSlice slice={kit.panelLarge} />
          <Text style={styles.eyebrow}>DAILY</Text>
          <Text style={styles.title}>출석 보상</Text>
          <Text style={styles.sub}>매일 접속하면 보상을 받아요. 7일째엔 보석이 듬뿍!</Text>
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
          {claimed && stamped ? (
            <View style={styles.afterRow}>
              <GameButton variant="cream" onPress={onClose} style={styles.afterButton}>
                닫기
              </GameButton>
              <GameButton variant="green" onPress={() => setAdOpen(true)} style={styles.afterButton}>
                광고 보고 한 번 더
              </GameButton>
            </View>
          ) : (
            <GameButton variant={claimed ? "gray" : "green"} disabled={claimed !== null} onPress={claim} style={styles.button}>
              {claimed ? "받았어요!" : `${dayIndex + 1}일차 보상 받기`}
            </GameButton>
          )}
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
  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value * 0.6 }));
  const stampStyle = useAnimatedStyle(() => ({ opacity: Math.min(1, stamp.value * 2), transform: [{ scale: 2 - stamp.value }, { rotate: "-14deg" }] }));

  return (
    <View style={[styles.tile, wide && styles.tileWide, state === "today" && styles.tileToday, state === "done" && styles.tileDone]}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.tileGlow, glowStyle]} pointerEvents="none" />
      <Text style={[styles.day, state === "today" && styles.dayToday]}>{day}일</Text>
      <Image source={reward.kind === "gems" ? uiImages.crystal : uiImages.coin} style={[styles.icon, wide && styles.iconWide]} />
      <Text style={styles.amount}>{reward.kind === "gems" ? `${reward.amount}` : formatGameNumber(gold)}</Text>
      {(state === "done" || stamping) && (
        <Animated.View style={[styles.stamp, stampStyle]} pointerEvents="none">
          <Text style={styles.stampText}>받음</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  afterRow: { marginTop: 14, flexDirection: "row", gap: 8 },
  afterButton: { minWidth: 110 },
  backdrop: { flex: 1, padding: 18, justifyContent: "center", backgroundColor: "#263024cf" },
  panel: { width: "100%", maxWidth: 400, alignSelf: "center", paddingHorizontal: 16, paddingTop: 20, paddingBottom: 18, alignItems: "center" },
  eyebrow: { color: colors.green, fontWeight: "800", fontFamily: fonts.bold, fontSize: 9, letterSpacing: 2 },
  title: { marginTop: 2, fontSize: 20, fontWeight: "900", fontFamily: fonts.bold, color: colors.ink },
  sub: { marginTop: 4, fontSize: 10, color: colors.brown, textAlign: "center" },
  grid: { marginTop: 14, flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8 },
  tile: {
    width: 70,
    paddingTop: 6,
    paddingBottom: 6,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#c9a978",
    backgroundColor: "#fff6e2",
    alignItems: "center",
    overflow: "hidden",
  },
  tileWide: { width: 148, borderColor: "#e0a52a", backgroundColor: "#fff0c2" },
  tileToday: { borderColor: colors.green, borderWidth: 3 },
  tileDone: { backgroundColor: "#ece2cc" },
  tileGlow: { backgroundColor: "#d9f5a6" },
  day: { fontSize: 10, fontWeight: "900", fontFamily: fonts.bold, color: colors.brown },
  dayToday: { color: colors.green },
  icon: { marginTop: 3, width: 26, height: 26, resizeMode: "contain" },
  iconWide: { width: 34, height: 34 },
  amount: { marginTop: 2, fontSize: 11, fontWeight: "900", fontFamily: fonts.bold, color: colors.ink },
  stamp: {
    position: "absolute",
    top: "28%",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.red,
    backgroundColor: "#ffffffd9",
  },
  stampText: { color: colors.red, fontSize: 12, fontWeight: "900", fontFamily: fonts.bold },
  button: { marginTop: 16, minWidth: 180 },
});
