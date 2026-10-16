import { StyleSheet, View } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";
import { colors } from "../theme";

// Small padlock pinned to the corner of a locked companion/skill icon.
export function LockBadge() {
  return (
    <View style={styles.badge} pointerEvents="none">
      <Svg width={14} height={16} viewBox="0 0 14 16">
        <Path d="M3.5 7 V4.8 a3.5 3.5 0 0 1 7 0 V7" stroke={colors.cream} strokeWidth={2} fill="none" />
        <Rect x={1.5} y={7} width={11} height={8} rx={2} fill={colors.gold} stroke={colors.cream} strokeWidth={1.2} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    right: -4,
    bottom: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.line,
  },
});
