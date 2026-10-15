import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { buttonImages, buttonKit, uiImages } from "../assets";
import { Panel } from "./NineSlice";
import { formatGameNumber } from "../state/gameMath";

// Gold and gems, each on a cream pill with a "+" that jumps to the shop.
export function ResourceBar({ gold, gems, onOpenShop }: { gold: number; gems: number; onOpenShop: () => void }) {
  return (
    <View style={styles.bar}>
      <ResourceChip icon={uiImages.coin} value={gold} label="골드" onPlus={onOpenShop} />
      <ResourceChip icon={uiImages.crystal} value={gems} label="보석" onPlus={onOpenShop} />
    </View>
  );
}

function ResourceChip({ icon, value, label, onPlus }: { icon: number; value: number; label: string; onPlus: () => void }) {
  return (
    <View style={styles.chipWrap}>
      <Panel slice={buttonKit.pillCream} scale={0.3} style={styles.chip}>
        <Image source={icon} style={styles.icon} />
        <Text style={styles.value} numberOfLines={1}>{formatGameNumber(value)}</Text>
      </Panel>
      <Pressable
        onPress={onPlus}
        accessibilityRole="button"
        accessibilityLabel={`${label} 충전하러 상점 가기`}
        hitSlop={6}
        style={({ pressed }) => [styles.plus, pressed && styles.pressed]}
      >
        <Image source={buttonImages.plusGreen} style={styles.plusImage} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: "row", gap: 6, minWidth: 0 },
  chipWrap: { flexDirection: "row", alignItems: "center" },
  // Right padding leaves room for the "+" that overlaps the pill's right end.
  chip: { minWidth: 80, maxWidth: 116, height: 30, paddingLeft: 5, paddingRight: 18, flexDirection: "row", alignItems: "center", gap: 4 },
  icon: { width: 20, height: 20, resizeMode: "contain" },
  value: { flexShrink: 1, color: colors.ink, fontWeight: "900", fontFamily: fonts.bold, fontSize: 11 },
  plus: { marginLeft: -14 },
  pressed: { transform: [{ scale: 0.9 }] },
  plusImage: { width: 24, height: 24 },
});
