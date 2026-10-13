import { useState, type ReactNode } from "react";
import { Image, Pressable, StyleSheet, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from "react-native";
import type { UiSlice } from "../assets";

type Span = { srcStart: number; srcLength: number; start: number; length: number };

function spans(sourceLength: number, startInset: number, endInset: number, length: number, scale: number): Span[] {
  const start = startInset * scale;
  const end = endInset * scale;
  return [
    { srcStart: 0, srcLength: startInset, start: 0, length: start },
    { srcStart: startInset, srcLength: sourceLength - startInset - endInset, start, length: length - start - end },
    { srcStart: sourceLength - endInset, srcLength: endInset, start: length - end, length: end },
  ];
}

// Draws a decorated frame at any size: corners keep their art (scaled by `scale`), edges
// stretch along one axis and the middle stretches both ways. RN has no border-image, so
// each of the 9 cells is a clipped window onto the same image, sized so its slice fills it.
export function NineSlice({
  slice,
  scale = 0.5,
  style,
  children,
}: {
  slice: UiSlice;
  scale?: number;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}) {
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize((previous) => (previous?.width === width && previous?.height === height ? previous : { width, height }));
  };

  const [top, right, bottom, left] = slice.insets;
  let cells: ReactNode = null;
  if (size) {
    // Shrink the corners when the box is too small to fit them at the requested scale.
    const fit = Math.min(scale, size.width / (left + right), size.height / (top + bottom));
    const columns = spans(slice.width, left, right, size.width, fit);
    const rows = spans(slice.height, top, bottom, size.height, fit);
    cells = rows.flatMap((row, r) =>
      columns.map((column, c) => {
        if (column.length <= 0 || row.length <= 0) return null;
        if (r === 1 && c === 1 && slice.centerColor) {
          return (
            <View
              key="center"
              style={[styles.cell, { left: column.start, top: row.start, width: column.length + 0.5, height: row.length + 0.5, backgroundColor: slice.centerColor }]}
            />
          );
        }
        const sx = column.length / column.srcLength;
        const sy = row.length / row.srcLength;
        return (
          <View
            key={`${r}-${c}`}
            // +0.5px overlap hides hairline seams between cells from subpixel rounding.
            style={[styles.cell, { left: column.start, top: row.start, width: column.length + 0.5, height: row.length + 0.5 }]}
          >
            <Image
              source={slice.source}
              resizeMode="stretch"
              style={{ position: "absolute", left: -column.srcStart * sx, top: -row.srcStart * sy, width: slice.width * sx, height: slice.height * sy }}
            />
          </View>
        );
      })
    );
  }

  return (
    <View style={style} onLayout={onLayout}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">{cells}</View>
      {children}
    </View>
  );
}

// A NineSlice that presses down like the old GameButton.
export function SliceButton({
  slice,
  scale,
  style,
  children,
  onPress,
  disabled = false,
  accessibilityLabel,
}: {
  slice: UiSlice;
  scale?: number;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={accessibilityLabel} style={style}>
      {({ pressed }) => (
        <NineSlice
          slice={slice}
          scale={scale}
          style={[styles.fill, pressed && !disabled && styles.pressed, disabled && styles.disabled]}
        >
          {children}
        </NineSlice>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cell: { position: "absolute", overflow: "hidden" },
  fill: { flexGrow: 1, alignItems: "center", justifyContent: "center" },
  pressed: { transform: [{ translateY: 2 }, { scale: 0.97 }] },
  disabled: { opacity: 0.55 },
});
