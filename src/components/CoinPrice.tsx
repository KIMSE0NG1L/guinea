import { Image, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import { uiImages } from "../assets";
import { formatGameNumber } from "../state/gameMath";

// A gold amount the way prices are shown everywhere: the coin icon, then the number
// (no "G"). The icon scales with the text's font size.
export function CoinPrice({
  amount,
  textStyle,
  style,
  iconSize,
}: {
  amount: number;
  textStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
  iconSize?: number;
}) {
  const fontSize = StyleSheet.flatten(textStyle)?.fontSize ?? 11;
  const size = iconSize ?? Math.round(fontSize * 1.25);
  return (
    <View style={[styles.row, style]}>
      <Image source={uiImages.coin} style={{ width: size, height: size }} />
      <Text style={textStyle}>{formatGameNumber(amount)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 3 },
});
