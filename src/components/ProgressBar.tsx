import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { colors } from "../theme";
import { kit } from "../assets";
import { NineSlice } from "./NineSlice";

// Outlined cream track (kit art) with a flat rounded fill that grows inside its rim.
export function ProgressBar({
  progress,
  color = colors.gold,
  height = 14,
  style,
}: {
  progress: number; // 0–100
  color?: string;
  height?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const clamped = Math.max(0, Math.min(100, progress));
  // The rim is ~20% of the bar's height on each side.
  const rim = Math.max(2, Math.round(height * 0.2));
  return (
    <View style={[{ height }, style]}>
      <NineSlice slice={kit.track} scale={height / 47} />
      <View style={[styles.inner, { top: rim, bottom: rim + 1, left: rim + 1, right: rim + 1, borderRadius: height }]}>
        {clamped > 0 && (
          <View style={[styles.fill, { width: `${clamped}%`, backgroundColor: color, borderRadius: height }]}>
            <View style={styles.shine} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inner: { position: "absolute", overflow: "hidden" },
  fill: { height: "100%", overflow: "hidden" },
  shine: { height: "38%", marginHorizontal: 3, marginTop: 1, backgroundColor: "#ffffff40", borderRadius: 4 },
});
