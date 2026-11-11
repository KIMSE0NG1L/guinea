import { Image, StyleSheet, View } from "react-native";
import { uiImages } from "../assets";

// A little clapperboard pinned to a button's top-right corner: "this one plays an ad".
// Place it inside a wrapper View around the button (not inside the button, which may clip).
// `inline` drops the corner pinning, to sit in a row of other content instead.
export function AdBadge({ inline = false }: { inline?: boolean }) {
  return (
    <View style={[styles.badge, inline && styles.inline]} pointerEvents="none">
      <Image source={uiImages.adClapper} style={styles.image} />
    </View>
  );
}

// The art is 219x256.
const styles = StyleSheet.create({
  badge: { position: "absolute", top: -15, right: -10, width: 28, height: 33 },
  inline: { position: "relative", top: 0, right: 0 },
  image: { width: "100%", height: "100%", resizeMode: "contain" },
});
