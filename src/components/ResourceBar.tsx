import { Image, Pressable, StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";
import { colors, fonts } from "../theme";
import { buttonImages, buttonKit, uiImages } from "../assets";
import { Panel } from "./NineSlice";
import { formatGameNumber } from "../state/gameMath";
import { useBumpOnChange, useRollingNumber } from "./motion";
import { tutorialRef } from "./tutorialTargets";

// Sized for a 7-character value (e.g. "12,345b") at full width; GameHeader passes a
// smaller `width` on narrow phones.
export const CHIP_WIDTH = 100;

// Gold and gems, each on a cream pill with a "+" that jumps to the shop.
export function ResourceBar({
  gold,
  gems,
  onOpenShop,
  width = CHIP_WIDTH,
}: {
  gold: number;
  gems: number;
  onOpenShop: () => void;
  width?: number;
}) {
  return (
    <View style={styles.bar}>
      <ResourceChip icon={uiImages.coin} value={gold} label="골드" targetId="header-gold" onPlus={onOpenShop} width={width} />
      <ResourceChip icon={uiImages.crystal} value={gems} label="보석" targetId="header-gems" onPlus={onOpenShop} width={width} />
    </View>
  );
}

function ResourceChip({
  icon,
  value,
  label,
  targetId,
  onPlus,
  width,
}: {
  icon: number;
  value: number;
  label: string;
  // Lets flying rewards (gems from a quest) aim at this chip's icon.
  targetId: string;
  onPlus: () => void;
  width: number;
}) {
  // Text shrinks with the chip so 7 characters still fit on narrow screens.
  const k = Math.min(1, width / CHIP_WIDTH);
  const fontSize = Math.round(10 * k * 10) / 10;
  const iconSize = Math.round(18 * k);
  const plusSize = Math.round(21 * k);
  // The number rolls to its new value; the icon hops on a gain and the number blinks red
  // on a spend.
  const shown = useRollingNumber(value);
  const { style: bumpStyle, direction } = useBumpOnChange(value);
  return (
    <Panel slice={buttonKit.pillCream} scale={0.3} style={[styles.chip, { width }]}>
      <Animated.View ref={tutorialRef(targetId)} style={direction === "up" ? bumpStyle : undefined}>
        <Image source={icon} style={[styles.icon, { width: iconSize, height: iconSize }]} />
      </Animated.View>
      <Animated.Text style={[styles.value, { fontSize }, direction === "down" && styles.spent]} numberOfLines={1}>
        {formatGameNumber(shown)}
      </Animated.Text>
      <Pressable
        onPress={onPlus}
        accessibilityRole="button"
        accessibilityLabel={`${label} 충전하러 상점 가기`}
        hitSlop={6}
        style={({ pressed }) => [styles.plus, pressed && styles.pressed]}
      >
        <Image source={buttonImages.plusGreen} style={{ width: plusSize, height: plusSize }} />
      </Pressable>
    </Panel>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: "row", gap: 4, minWidth: 0 },
  // Fixed width sized for a 7-character value (e.g. "12,345b") so the header never shifts
  // as numbers grow. The "+" sits inside the pill's right end.
  chip: { height: 28, paddingLeft: 4, paddingRight: 3, flexDirection: "row", alignItems: "center", gap: 3 },
  icon: { width: 18, height: 18, resizeMode: "contain" },
  value: { flex: 1, color: colors.ink, fontWeight: "900", fontFamily: fonts.bold, fontSize: 10 },
  spent: { color: colors.red },
  plus: {},
  pressed: { transform: [{ scale: 0.9 }] },
});
