import type { ReactNode } from "react";
import { StyleSheet, Text, View, type StyleProp, type TextStyle } from "react-native";

// Fakes CSS `-webkit-text-stroke` (not supported by RN Text) by stacking 8 copies of the
// same text offset by `strokeWidth` in every direction, with the real text painted on top.
const OFFSETS: [number, number][] = [
  [-1, -1], [0, -1], [1, -1],
  [-1, 0], [1, 0],
  [-1, 1], [0, 1], [1, 1],
];

export function StrokedText({
  children,
  style,
  strokeColor,
  strokeWidth = 1,
}: {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
  strokeColor: string;
  strokeWidth?: number;
}) {
  return (
    <View style={styles.wrap}>
      {OFFSETS.map(([dx, dy]) => (
        <Text
          key={`${dx}-${dy}`}
          style={[style, styles.layer, { color: strokeColor, left: dx * strokeWidth, top: dy * strokeWidth }]}
        >
          {children}
        </Text>
      ))}
      <Text style={style}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "relative" },
  layer: { position: "absolute" },
});
