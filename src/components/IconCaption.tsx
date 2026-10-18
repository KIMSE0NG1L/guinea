import { StyleSheet, View } from "react-native";
import { colors, fonts } from "../theme";
import { StrokedText } from "./StrokedText";

// Outlined caption pinned under an icon-only button, so it says what it does. Place it
// inside the button (which needs no overflow clipping); it hangs just below the icon.
// Small captions get a thinner outline so the strokes don't smear the letters together.
// `shift` nudges it sideways for icons drawn at a slant, whose visual centre isn't the box's.
export function IconCaption({ children, size = 10, offset = -7, shift = 0 }: { children: string; size?: number; offset?: number; shift?: number }) {
  return (
    <View style={[styles.wrap, { bottom: offset, transform: [{ translateX: shift }] }]} pointerEvents="none">
      <StrokedText style={[styles.text, { fontSize: size }]} strokeColor={colors.line} strokeWidth={size >= 11 ? 2 : 1.4}>
        {children}
      </StrokedText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", left: -20, right: -20, alignItems: "center", zIndex: 2 },
  text: { fontWeight: "900", fontFamily: fonts.bold, color: colors.cream },
});
