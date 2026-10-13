import { Image, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { uiImages } from "../assets";
import { formatGameNumber } from "../state/gameMath";

export function ResourceBar({ gold, gems }: { gold: number; gems: number }) {
  return (
    <View style={styles.bar}>
      <View style={styles.chip}>
        <Image source={uiImages.coin} style={styles.icon} />
        <Text style={styles.chipValue}>{formatGameNumber(gold)}</Text>
      </View>
      <View style={styles.chip}>
        <Image source={uiImages.crystal} style={styles.icon} />
        <Text style={styles.chipValue}>{formatGameNumber(gems)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: "row", gap: 5, minWidth: 0 },
  chip: {
    minWidth: 76,
    maxWidth: 112,
    height: 28,
    paddingVertical: 3,
    paddingLeft: 4,
    paddingRight: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#263525",
    borderWidth: 2,
    borderColor: "#819073",
    borderRadius: 8,
  },
  icon: { width: 20, height: 20, resizeMode: "contain" },
  chipValue: { color: colors.cream, fontWeight: "900", fontFamily: fonts.bold, fontSize: 11, flexShrink: 1 },
});
