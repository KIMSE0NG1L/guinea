import { StyleSheet, View } from "react-native";
import { colors } from "../theme";

// A little red camcorder badge pinned to a button's top-right corner: "this one plays an ad".
// Place it inside a wrapper View around the button (not inside the button, which may clip).
// `inline` drops the corner pinning, to sit in a row of other content instead.
export function AdBadge({ inline = false }: { inline?: boolean }) {
  return (
    <View style={[styles.badge, inline && styles.inline]} pointerEvents="none">
      <View style={styles.body} />
      <View style={styles.lens} />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: -10,
    right: -9,
    width: 30,
    height: 22,
    borderRadius: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 1,
    backgroundColor: colors.red,
    borderWidth: 2,
    borderColor: colors.cream,
  },
  inline: { position: "relative", top: 0, right: 0 },
  body: { width: 11, height: 9, borderRadius: 2, backgroundColor: colors.cream },
  lens: { width: 0, height: 0, borderTopWidth: 4, borderBottomWidth: 4, borderRightWidth: 5, borderTopColor: "transparent", borderBottomColor: "transparent", borderRightColor: colors.cream },
});
