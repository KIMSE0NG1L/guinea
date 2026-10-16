import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";

const AUTO_HIDE_MS = 3000;

// Small black speech bubble that pops up above a battle slot with a one-glance summary of
// what's in effect. Its tail points down at the slot's centre; it hides itself after a beat.
export function InfoBubble({ title, lines, anchorWidth, onClose }: { title: string; lines: string[]; anchorWidth: number; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, AUTO_HIDE_MS);
    return () => clearTimeout(timer);
  }, [onClose]);
  return (
    <View style={styles.wrap} pointerEvents="none">
      <View style={styles.bubble}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {lines.map((line) => (
          <Text key={line} style={styles.line}>{line}</Text>
        ))}
      </View>
      <View style={[styles.tail, { left: anchorWidth / 2 - TAIL }]} />
    </View>
  );
}

const TAIL = 6;

const styles = StyleSheet.create({
  // Left-aligned with the slot (they sit at the left of the screen), opening upward.
  wrap: { position: "absolute", left: -4, bottom: "100%", marginBottom: 8, zIndex: 30 },
  bubble: {
    minWidth: 120,
    maxWidth: 200,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: "#14100ceb",
    borderWidth: 1.5,
    borderColor: "#4a392d",
  },
  title: { fontSize: 11, fontWeight: "900", fontFamily: fonts.bold, color: "#ffe9a3" },
  line: { marginTop: 2, fontSize: 10, fontWeight: "800", fontFamily: fonts.bold, color: colors.cream },
  tail: {
    position: "absolute",
    bottom: -TAIL + 1,
    marginLeft: 4,
    width: 0,
    height: 0,
    borderLeftWidth: TAIL,
    borderRightWidth: TAIL,
    borderTopWidth: TAIL,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#14100ceb",
  },
});
