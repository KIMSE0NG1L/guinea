import { Pressable, StyleSheet, Text, type GestureResponderEvent, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import { colors, radii, fonts } from "../theme";

export function GameButton({
  children,
  onPress,
  disabled = false,
  style,
  textStyle,
  accessibilityLabel,
}: {
  children: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
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
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {typeof children === "string" ? <Text style={[styles.label, textStyle]}>{children}</Text> : children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 2,
    borderColor: colors.line,
    borderBottomWidth: 5,
    backgroundColor: colors.cream,
    borderRadius: radii.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    borderBottomWidth: 2,
    transform: [{ translateY: 3 }],
  },
  disabled: {
    opacity: 0.55,
  },
  label: {
    color: colors.ink,
    fontWeight: "900",
    fontFamily: fonts.bold,
    fontSize: 11,
  },
});
