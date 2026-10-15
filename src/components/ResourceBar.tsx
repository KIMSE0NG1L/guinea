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
    <Panel slice={buttonKit.pillCream} scale={0.3} style={styles.chip}>
      <Image source={icon} style={styles.icon} />
      <Text style={styles.value} numberOfLines={1}>{formatGameNumber(value)}</Text>
      <Pressable
        onPress={onPlus}
        accessibilityRole="button"
        accessibilityLabel={`${label} 충전하러 상점 가기`}
        hitSlop={6}
        style={({ pressed }) => [styles.plus, pressed && styles.pressed]}
      >
        <Image source={buttonImages.plusGreen} style={styles.plusImage} />
      </Pressable>
    </Panel>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: "row", gap: 4, minWidth: 0 },
  // The "+" sits inside the pill's right end, so icon, value and "+" read as one control.
  chip: { minWidth: 74, height: 28, paddingLeft: 4, paddingRight: 3, flexDirection: "row", alignItems: "center", gap: 3 },
  icon: { width: 18, height: 18, resizeMode: "contain" },
  value: { flex: 1, color: colors.ink, fontWeight: "900", fontFamily: fonts.bold, fontSize: 10 },
  plus: {},
  pressed: { transform: [{ scale: 0.9 }] },
  plusImage: { width: 21, height: 21 },
});
