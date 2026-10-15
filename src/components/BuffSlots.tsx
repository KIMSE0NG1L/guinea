import { Image, Pressable, StyleSheet, View } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";
import { colors, fonts } from "../theme";
import { frameImages } from "../assets";
import { StrokedText } from "./StrokedText";
import { BUFFS, formatDuration, type BuffSlot } from "../state/buffs";
import { RECIPES } from "../state/recipes";

export const BUFF_SLOT_SIZE = 44;

// Clock-style cooldown: a dark wedge for the time already spent, swept clockwise from
// 12 o'clock. The radius overshoots the square so the wedge reaches its corners too —
// the slot's rounded, overflow-hidden frame trims it.
function ElapsedWedge({ fraction }: { fraction: number }) {
  const size = BUFF_SLOT_SIZE - SLOT_BORDER * 2; // drawn inside the slot's border
  const c = size / 2;
  const r = size;
  if (fraction <= 0) return null;
  const angle = Math.min(fraction, 1) * Math.PI * 2;
  const x = c + r * Math.sin(angle);
  const y = c - r * Math.cos(angle);
  return (
    <Svg width={size} height={size} style={StyleSheet.absoluteFill} pointerEvents="none">
      {fraction >= 1 ? (
        <Rect width={size} height={size} fill={WEDGE_COLOR} />
      ) : (
        <Path d={`M ${c} ${c} L ${c} ${c - r} A ${r} ${r} 0 ${angle > Math.PI ? 1 : 0} 1 ${x} ${y} Z`} fill={WEDGE_COLOR} />
      )}
    </Svg>
  );
}

const WEDGE_COLOR = "#1c120bA6";
const SLOT_BORDER = 2;

// Three food slots: "+" when empty, otherwise the dish on its tint with a clock-style
// wedge for time already spent and a live countdown in the middle.
export function BuffSlots({
  slots,
  now,
  onPressSlot,
  style,
}: {
  slots: BuffSlot[];
  now: number;
  onPressSlot: (index: number) => void;
  style?: object;
}) {
  return (
    <View style={[styles.row, style]}>
      {slots.map((slot, index) => {
        const running = slot && slot.expiresAt > now ? slot : null;
        const recipe = running ? RECIPES.find((item) => item.id === running.recipeId) : undefined;
        const buff = running ? BUFFS[running.recipeId] : undefined;
        const remaining = running ? running.expiresAt - now : 0;
        const elapsed = running ? 1 - remaining / running.durationMs : 0;
        return (
          <Pressable
            key={index}
            onPress={() => onPressSlot(index)}
            disabled={Boolean(running)}
            accessibilityRole="button"
            accessibilityLabel={running && recipe ? `${recipe.name} 버프 ${formatDuration(remaining)} 남음` : `음식 슬롯 ${index + 1}에 음식 넣기`}
            hitSlop={4}
            style={({ pressed }) => [styles.slot, pressed && styles.pressed]}
          >
            {running && recipe && buff ? (
              <View style={[styles.active, { backgroundColor: buff.tint }]}>
                <Image source={recipe.image} style={styles.dish} />
                <ElapsedWedge fraction={elapsed} />
                <View style={styles.timer}>
                  <StrokedText style={styles.timerText} strokeColor={colors.line} strokeWidth={1}>
                    {formatDuration(remaining)}
                  </StrokedText>
                </View>
              </View>
            ) : (
              <>
                <Image source={frameImages.slotPlus} style={styles.slotArt} />
              </>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 5 },
  slot: { width: BUFF_SLOT_SIZE, height: BUFF_SLOT_SIZE, alignItems: "center", justifyContent: "center" },
  pressed: { transform: [{ scale: 0.92 }] },
  slotArt: { width: "100%", height: "100%" },
  active: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: SLOT_BORDER,
    borderColor: colors.line,
    borderRadius: 9,
  },
  dish: { width: BUFF_SLOT_SIZE - 6, height: BUFF_SLOT_SIZE - 6 },
  timer: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" },
  timerText: { fontSize: 11, fontWeight: "900", fontFamily: fonts.bold, color: colors.cream },
});
