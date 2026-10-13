import { StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";

export function PageHeading({ kicker, title, description }: { kicker: string; title: string; description: string }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.kicker}>{kicker}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginHorizontal: 2, marginTop: 2, marginBottom: 18 },
  kicker: { color: colors.green, fontWeight: "800", fontFamily: fonts.bold, fontSize: 9, letterSpacing: 1.5, marginBottom: 1 },
  title: { fontSize: 27, fontWeight: "800", fontFamily: fonts.bold, color: colors.ink, letterSpacing: -1 },
  description: { marginTop: 3, color: colors.brown, fontSize: 11 },
});
