import { useState } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { colors, fonts } from "../theme";
import { StrokedText } from "./StrokedText";
import { frameKit } from "../assets";
import { NineSlice } from "./NineSlice";

const FILLS = {
  gold: frameKit.fillGold,
  green: frameKit.fillGreen,
  red: frameKit.fillRed,
  blue: frameKit.fillBlue,
} as const;

export type ProgressFill = keyof typeof FILLS;

// Brass-capped wooden track with a glossy fill bar that grows inside it.
export function ProgressBar({
  progress,
  fill = "gold",
  height = 14,
  label,
  style,
}: {
  progress: number; // 0–100
  fill?: ProgressFill;
  height?: number;
  label?: string; // drawn centred over the bar
  style?: StyleProp<ViewStyle>;
}) {
  const [innerWidth, setInnerWidth] = useState(0);
  const clamped = Math.max(0, Math.min(100, progress));
  // The track art is 40px tall: its parchment channel sits 7px in from top/bottom and
  // starts after the ~18px brass caps on each side.
  const scale = height / 40;
  const insetY = Math.round(7 * scale);
  const insetX = Math.round(16 * scale);
  const fillWidth = (innerWidth * clamped) / 100;
  return (
    <View style={[{ height }, style]}>
      <NineSlice slice={frameKit.barFrame} scale={scale} />
      <View
        style={[styles.inner, { top: insetY, bottom: insetY, left: insetX, right: insetX }]}
        onLayout={(event) => setInnerWidth(event.nativeEvent.layout.width)}
      >
        {fillWidth > 0 && (
          <View style={[styles.fill, { width: fillWidth }]}>
            <NineSlice slice={FILLS[fill]} scale={(height - insetY * 2) / 36} />
          </View>
        )}
      </View>
      {label !== undefined && (
        <View style={styles.labelWrap} pointerEvents="none">
          <StrokedText style={[styles.label, { fontSize: Math.max(8, Math.round(height * 0.55)) }]} strokeColor={colors.line}>
            {label}
          </StrokedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inner: { position: "absolute" },
  fill: { height: "100%" },
  labelWrap: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" },
  label: { color: colors.cream, fontWeight: "900", fontFamily: fonts.bold },
});
