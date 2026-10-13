import { StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { formatGameNumber } from "../state/gameMath";
import { GemIcon } from "./GemIcon";

export function ResourceBar({ gold, gems }: { gold: number; gems: number }) {
  return (
    <View style={styles.bar}>
      <View style={styles.chip}>
        <View style={styles.coinIcon}>
          <Text style={styles.coinIconText}>$</Text>
        </View>
        <Text style={styles.chipValue}>{formatGameNumber(gold)}</Text>
      </View>
      <View style={styles.chip}>
        <View style={styles.gemIcon}>
          <GemIcon width={18} height={16} />
        </View>
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
  coinIcon: {
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gold,
    borderWidth: 2,
    borderColor: "#b17525",
    borderRadius: 9,
  },
  coinIconText: { color: "#6b4517", fontWeight: "900", fontFamily: fonts.bold, fontSize: 10 },
  gemIcon: { width: 18, height: 18, alignItems: "center", justifyContent: "center" },
  chipValue: { color: colors.cream, fontWeight: "900", fontFamily: fonts.bold, fontSize: 11, flexShrink: 1 },
});
