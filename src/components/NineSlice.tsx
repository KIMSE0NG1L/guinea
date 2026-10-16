import { useState, type ReactNode } from "react";
import { Image, StyleSheet, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from "react-native";
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

// Draws a framed piece of UI art at any size, filling its parent: corners keep their art
// (scaled by `scale`), edges stretch along one axis and the middle stretches both ways.
// RN has no border-image, so each of the 9 cells is a clipped window onto the same image.
// `tint` paints every opaque pixel one flat colour — offset behind the real frame, that
// silhouette makes a drop shadow that follows the art's own outline (tails, rounded corners).
export function NineSlice({ slice, scale = 0.5, tint }: { slice: UiSlice; scale?: number; tint?: string }) {
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
        // +0.5px overlap hides hairline seams between cells from subpixel rounding.
        const frame = { left: column.start, top: row.start, width: column.length + 0.5, height: row.length + 0.5 };
        if (r === 1 && c === 1 && slice.centerColor) {
          return <View key="center" style={[styles.cell, frame, { backgroundColor: tint ?? slice.centerColor }]} />;
        }
        const sx = column.length / column.srcLength;
        const sy = row.length / row.srcLength;
        return (
          <View key={`${r}-${c}`} style={[styles.cell, frame]}>
            <Image
              source={slice.source}
              resizeMode="stretch"
              style={{ position: "absolute", left: -column.srcStart * sx, top: -row.srcStart * sy, width: slice.width * sx, height: slice.height * sy, tintColor: tint }}
            />
          </View>
        );
      })
    );
  }

  return (
    <View style={StyleSheet.absoluteFill} onLayout={onLayout} pointerEvents="none">
      {cells}
    </View>
  );
}

// A View whose background is a NineSlice frame — the drop-in replacement for the old
// `backgroundColor + borderWidth + borderRadius` card styles.
export function Panel({
  slice,
  scale,
  style,
  children,
}: {
  slice: UiSlice;
  scale?: number;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}) {
  return (
    <View style={style}>
      <NineSlice slice={slice} scale={scale} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  cell: { position: "absolute", overflow: "hidden" },
});
