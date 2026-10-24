import { useState, type ComponentProps } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { colors, fonts } from "../theme";
import { villageUi } from "../assets";
import { StrokedText } from "../components/StrokedText";
import { COMPANIONS, CompanionsScreen } from "./CompanionsScreen";
import { VillageScreen } from "./village/VillageScreen";

// The 동료 tab: the forest village is the main view; the original companion list lives on
// as the 동료 도감, opened from the village's book button.
export function CompanionsHub(props: ComponentProps<typeof CompanionsScreen>) {
  const [view, setView] = useState<"village" | "codex">("village");
  if (view === "village") {
    return (
      <VillageScreen
        companions={COMPANIONS}
        highestStageNumber={props.highestStageNumber}
        equippedOutfit={props.equippedOutfit}
        onEquip={props.onEquip}
        onOpenCodex={() => setView("codex")}
      />
    );
  }
  return (
    <View>
      <CompanionsScreen {...props} />
      <Pressable
        onPress={() => setView("village")}
        accessibilityRole="button"
        accessibilityLabel="마을로 돌아가기"
        hitSlop={6}
        style={({ pressed }) => [styles.back, pressed && styles.pressed]}
      >
        <Image source={villageUi.house} style={styles.backIcon} />
        <StrokedText style={styles.backLabel} strokeColor={colors.line} strokeWidth={1.5}>
          마을
        </StrokedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  back: { position: "absolute", top: 14, right: 14, alignItems: "center" },
  pressed: { transform: [{ scale: 0.92 }] },
  backIcon: { width: 46, height: 44 },
  backLabel: { marginTop: -2, fontSize: 10, fontWeight: "900", fontFamily: fonts.bold, color: colors.cream },
});
