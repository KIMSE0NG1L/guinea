import { useEffect } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { colors, fonts } from "../theme";
import { uiImages, uiSlices } from "../assets";
import { SliceButton } from "./NineSlice";
import { StrokedText } from "./StrokedText";
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
      <SliceButton
        slice={uiSlices.buttonParchment}
        scale={0.4}
        onPress={onToggleAuto}
        accessibilityLabel={`자동 전투 ${isAutoBattle ? "끄기" : "켜기"}`}
        style={styles.autoToggle}
      >
        <View style={styles.autoToggleContent}>
          <PulseDot active={isAutoBattle} />
          <Text style={[styles.autoToggleText, !isAutoBattle && styles.autoToggleTextOff]}>
            자동 전투 {isAutoBattle ? "ON" : "OFF"}
          </Text>
        </View>
      </SliceButton>

      <SliceButton slice={uiSlices.buttonGreen} scale={0.4} onPress={onClaim} style={styles.claimButton}>
        <View style={styles.claimButtonContent}>
          <Image source={uiImages.coin} style={styles.coin} />
          <View style={styles.claimCopy}>
            <StrokedText style={styles.claimSpan} strokeColor={colors.greenDark}>보상 받기</StrokedText>
            <StrokedText style={styles.claimSmall} strokeColor={colors.greenDark}>+{formatGameNumber(earned)} 골드</StrokedText>
          </View>
        </View>
      </SliceButton>

      <SliceButton slice={uiSlices.buttonParchment} scale={0.4} disabled style={styles.adButton}>
        <View style={styles.adButtonContent}>
          <Image source={uiImages.chest} style={styles.chest} />
          <View>
            <Text style={styles.adButtonText}>광고 보상</Text>
            <Text style={styles.adButtonSmall}>준비 중</Text>
          </View>
        </View>
      </SliceButton>
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
  wrap: { margin: 10, flexDirection: "row", gap: 6, alignItems: "stretch" },
  autoToggle: { flex: 0.9, minHeight: 48 },
  autoToggleContent: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 6 },
  autoToggleText: { color: colors.ink, fontSize: 10, fontWeight: "900", fontFamily: fonts.bold },
  autoToggleTextOff: { color: "#756b5e" },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#6b8b50" },
  dotOff: { backgroundColor: "#8d867c" },
  claimButton: { flex: 1.25, minHeight: 48 },
  claimButtonContent: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 5 },
  coin: { width: 24, height: 24 },
  claimCopy: { alignItems: "center" },
  claimSpan: { color: colors.cream, fontWeight: "700", fontFamily: fonts.bold, fontSize: 9 },
  claimSmall: { color: colors.cream, fontSize: 14, fontWeight: "700", fontFamily: fonts.bold },
  adButton: { flex: 0.9, minHeight: 48 },
  adButtonContent: { flexDirection: "row", alignItems: "center", gap: 4 },
  chest: { width: 24, height: 21 },
  adButtonText: { color: colors.ink, fontSize: 10, fontWeight: "900", fontFamily: fonts.bold, textAlign: "center" },
  adButtonSmall: { marginTop: 1, fontSize: 8, textAlign: "center", color: colors.muted },
});
