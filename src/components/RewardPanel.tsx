import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { colors, radii, fonts } from "../theme";
import { GameButton } from "./GameButton";
import { formatGameNumber } from "../state/gameMath";

export function RewardPanel({
  earned,
  onClaim,
  isAutoBattle,
  onToggleAuto,
}: {
  earned: number;
  onClaim: () => void;
  isAutoBattle: boolean;
  onToggleAuto: () => void;
}) {
  return (
    <View style={styles.wrap}>
      <GameButton
        onPress={onToggleAuto}
        accessibilityLabel={`자동 전투 ${isAutoBattle ? "끄기" : "켜기"}`}
        style={[styles.autoToggle, !isAutoBattle && styles.autoToggleOff]}
      >
        <View style={styles.autoToggleContent}>
          <PulseDot active={isAutoBattle} />
          <Text style={[styles.autoToggleText, !isAutoBattle && styles.autoToggleTextOff]}>
            자동 전투 {isAutoBattle ? "ON" : "OFF"}
          </Text>
        </View>
      </GameButton>

      <View style={styles.actions}>
        <GameButton onPress={onClaim} style={styles.claimButton}>
          <View style={styles.claimButtonContent}>
            <Text style={styles.claimSpan}>보상 받기</Text>
            <Text style={styles.claimSmall}>+{formatGameNumber(earned)} 골드</Text>
          </View>
        </GameButton>
        <GameButton disabled style={styles.adButton} textStyle={styles.adButtonText}>
          <View>
            <Text style={styles.adButtonText}>광고 보상</Text>
            <Text style={styles.adButtonSmall}>준비 중</Text>
          </View>
        </GameButton>
      </View>
    </View>
  );
}

function PulseDot({ active }: { active: boolean }) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (active) {
      pulse.value = withRepeat(withSequence(withTiming(0.35, { duration: 500 }), withTiming(1, { duration: 500 })), -1, false);
    } else {
      pulse.value = 1;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const style = useAnimatedStyle(() => ({ opacity: pulse.value, transform: [{ scale: 0.3 + pulse.value * 0.7 }] }));

  return <Animated.View style={[styles.dot, !active && styles.dotOff, style]} />;
}

const styles = StyleSheet.create({
  wrap: { margin: 10, flexDirection: "row", gap: 8, alignItems: "stretch" },
  autoToggle: { minWidth: 92, minHeight: 42, paddingHorizontal: 8, paddingVertical: 6 },
  autoToggleOff: { backgroundColor: "#d9d1c2" },
  autoToggleContent: { flexDirection: "row", alignItems: "center", gap: 5 },
  autoToggleText: { color: colors.ink, fontSize: 9, fontWeight: "900", fontFamily: fonts.bold },
  autoToggleTextOff: { color: "#756b5e" },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#6b8b50" },
  dotOff: { backgroundColor: "#8d867c" },
  actions: { flex: 1, flexDirection: "row", gap: 6 },
  claimButton: { flex: 1.15, minHeight: 42, paddingVertical: 5, backgroundColor: "rgb(133, 189, 84)", borderColor: "rgb(91, 149, 64)", borderRadius: radii.md },
  claimButtonContent: { alignItems: "center" },
  claimSpan: { color: colors.cream, fontWeight: "700", fontFamily: fonts.bold, fontSize: 10 },
  claimSmall: { marginTop: 2, color: colors.cream, fontSize: 14, fontWeight: "700", fontFamily: fonts.bold },
  adButton: { flex: 0.85, minHeight: 42, paddingVertical: 5, backgroundColor: "#d8d1c3" },
  adButtonText: { color: colors.ink, fontSize: 10, fontWeight: "900", fontFamily: fonts.bold, textAlign: "center" },
  adButtonSmall: { marginTop: 2, fontSize: 8, textAlign: "center", color: colors.ink },
});
