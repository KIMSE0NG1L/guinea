import { useState, type ReactNode } from "react";
import { View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from "react-native";

// Rough rendered width of a line of Maplestory Bold text: Hangul is about square, digits
// and Latin narrower, punctuation narrower still. Good enough to balance line breaks.
export function estimateTextWidth(text: string, fontSize: number) {
  let width = 0;
  for (const char of text) {
    if (/[가-힣]/.test(char)) width += 1;
    else if (/[0-9A-Za-z%+]/.test(char)) width += 0.62;
    else width += 0.36;
  }
  return width * fontSize * 1.04;
}

// Splits items into the fewest lines that fit `available`, with those lines as even in
// width as possible (contiguous groups, minimising the widest line).
export function balanceLines(widths: number[], available: number, gap: number): number[][] {
  const n = widths.length;
  const span = (from: number, to: number) => widths.slice(from, to).reduce((sum, w) => sum + w, 0) + gap * Math.max(0, to - from - 1);
  const all = Array.from({ length: n }, (_, index) => index);
  if (n <= 1 || available <= 0 || span(0, n) <= available) return [all];
  for (let lines = 2; lines <= n; lines += 1) {
    // best[k][i] = smallest possible widest line splitting the first i items into k lines.
    const best: number[][] = Array.from({ length: lines + 1 }, () => Array(n + 1).fill(Infinity));
    const cut: number[][] = Array.from({ length: lines + 1 }, () => Array(n + 1).fill(0));
    best[0][0] = 0;
    for (let k = 1; k <= lines; k += 1) {
      for (let i = k; i <= n; i += 1) {
        for (let j = k - 1; j < i; j += 1) {
          const value = Math.max(best[k - 1][j], span(j, i));
          if (value < best[k][i]) {
            best[k][i] = value;
            cut[k][i] = j;
          }
        }
      }
    }
    if (best[lines][n] <= available || lines === n) {
      const groups: number[][] = [];
      let end = n;
      for (let k = lines; k >= 1; k -= 1) {
        const start = cut[k][end];
        groups.unshift(all.slice(start, end));
        end = start;
      }
      return groups;
    }
  }
  return [all];
}

// Lays `items` out in evenly balanced rows that fit the measured width. `renderRow` can
// draw a row itself (e.g. one Text joining the row's parts with separators).
export function BalancedRows({
  items,
  widths,
  gap,
  rowGap = 2,
  align = "flex-start",
  style,
  renderRow,
}: {
  items: ReactNode[];
  widths: number[];
  gap: number;
  rowGap?: number;
  align?: "flex-start" | "center";
  style?: StyleProp<ViewStyle>;
  renderRow?: (indices: number[]) => ReactNode;
}) {
  const [available, setAvailable] = useState(0);
  const onLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    setAvailable((previous) => (Math.abs(previous - width) < 1 ? previous : width));
  };
  const rows = balanceLines(widths, available, gap);
  return (
    <View style={[{ alignSelf: "stretch", gap: rowGap }, style]} onLayout={onLayout}>
      {rows.map((row) => (
        <View key={row.join("-")} style={{ flexDirection: "row", justifyContent: align, gap }}>
          {renderRow ? renderRow(row) : row.map((index) => items[index])}
        </View>
      ))}
    </View>
  );
}
