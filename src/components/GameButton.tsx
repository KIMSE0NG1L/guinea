import { Pressable, StyleSheet, Text, type GestureResponderEvent, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import { colors, fonts } from "../theme";
import { kit, shopKit } from "../assets";
import { NineSlice } from "./NineSlice";

export type ButtonVariant = "cream" | "green" | "beige" | "gray" | "brown" | "red" | "pillCream" | "pillGray";

const SLICES = {
  cream: kit.buttonCream,
  green: kit.buttonGreen,
  beige: kit.buttonBeige,
  gray: kit.buttonGray,
  brown: kit.buttonBrown,
  red: shopKit.pillRed,
  pillCream: shopKit.pillCream,
  pillGray: shopKit.pillGray,
} as const;

// Label colour that reads on each button face.
const LABEL_COLORS: Record<ButtonVariant, string> = {
  cream: colors.ink,
  green: colors.cream,
  beige: colors.ink,
  gray: "#4f463c",
  brown: colors.ink, // light wood plank
  red: colors.cream,
  pillCream: colors.ink,
  pillGray: "#4f463c",
};

export function GameButton({
  children,
  onPress,
  disabled = false,
  variant = "cream",
  style,
  textStyle,
  accessibilityLabel,
}: {
  children: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  variant?: ButtonVariant;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.base,
        style,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <NineSlice slice={SLICES[variant]} scale={0.4} />
      {typeof children === "string" ? (
        <Text style={[styles.label, { color: LABEL_COLORS[variant] }, textStyle]}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Extra bottom padding clears the art's baked-in drop shadow so labels sit centred on the face.
  base: { minHeight: 32, paddingHorizontal: 10, paddingTop: 6, paddingBottom: 8, alignItems: "center", justifyContent: "center" },
  pressed: { transform: [{ translateY: 2 }, { scale: 0.97 }] },
  disabled: { opacity: 0.55 },
  label: {
    fontWeight: "900",
    fontFamily: fonts.bold,
    fontSize: 11,
  },
});
