import { useState } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
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
  style,
}: {
  progress: number; // 0–100
  fill?: ProgressFill;
  height?: number;
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
    </View>
  );
}

const styles = StyleSheet.create({
  inner: { position: "absolute" },
  fill: { height: "100%" },
});
