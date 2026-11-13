import { useState } from "react";
import { Image, Modal, Pressable, StyleSheet, View } from "react-native";
import { Text } from "./GameText";
import { colors, fonts } from "../theme";
import { kit } from "../assets";
import { NineSlice } from "./NineSlice";
import { GameButton } from "./GameButton";
import { CoinPrice } from "./CoinPrice";
import { ITEM_IMAGES } from "../state/recipes";
import { getSellPrice } from "../state/grocery";
import { playSfx } from "../sound";
import { t } from "../i18n";

// Tapping an ingredient in the bag: pick how many to sell (starts at 1), see the gold it
// brings in, and sell. Prices come from getSellPrice (a tenth of the grocery price).
export function SellIngredientModal({
  name,
  owned,
  priceStage,
  onSell,
  onClose,
}: {
  name: string;
  owned: number;
  priceStage: number;
  onSell: (quantity: number) => void;
  onClose: () => void;
}) {
  const [count, setCount] = useState(1);
  const unit = getSellPrice(name, priceStage);
  const image = ITEM_IMAGES[name];
  const change = (next: number) => setCount(Math.max(1, Math.min(owned, next)));

  return (
    <Modal visible animationType="fade" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.panel} onPress={(event) => event.stopPropagation()}>
          <NineSlice slice={kit.panelLarge} />
          <Text style={styles.eyebrow}>{t("재료 팔기", "Sell Ingredient")}</Text>
          {image !== undefined ? <Image source={image} style={styles.image} /> : <View style={styles.material} />}
          <Text style={styles.name}>{t(name)}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.info}>{t(`가지고 있는 개수 ${owned}개`, `Owned: ${owned}`)}</Text>
            <Text style={styles.info}>·</Text>
            <Text style={styles.info}>{t("1개당", "Each")}</Text>
            <CoinPrice amount={unit} textStyle={styles.info} />
          </View>

          <View style={styles.stepper}>
            <StepButton label="−" onPress={() => change(count - 1)} disabled={count <= 1} accessibilityLabel={t("1개 줄이기", "Decrease by 1")} />
            <Text style={styles.count}>{count}</Text>
            <StepButton label="+" onPress={() => change(count + 1)} disabled={count >= owned} accessibilityLabel={t("1개 늘리기", "Increase by 1")} />
          </View>
          <View style={styles.quickRow}>
            <GameButton variant="cream" onPress={() => change(count + 10)} disabled={count >= owned} style={styles.quick} textStyle={styles.quickText}>
              +10
            </GameButton>
            <GameButton variant="cream" onPress={() => change(owned)} disabled={count >= owned} style={styles.quick} textStyle={styles.quickText}>
              {t("전부", "All")}
            </GameButton>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{t("받는 골드", "Gold You Get")}</Text>
            <CoinPrice amount={unit * count} textStyle={styles.total} />
          </View>

          <View style={styles.actions}>
            <GameButton variant="cream" onPress={onClose} style={styles.action}>
              {t("취소", "Cancel")}
            </GameButton>
            <GameButton
              variant="green"
              onPress={() => {
                playSfx("uiClick");
                onSell(count);
                onClose();
              }}
              accessibilityLabel={t(`${name} ${count}개를 ${unit * count}골드에 팔기`, `Sell ${count} ${t(name)} for ${unit * count} gold`)}
              style={styles.action}
            >
              {t(`${count}개 팔기`, `Sell ${count}`)}
            </GameButton>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function StepButton({ label, onPress, disabled, accessibilityLabel }: { label: string; onPress: () => void; disabled: boolean; accessibilityLabel: string }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.step, disabled && styles.stepDisabled, pressed && styles.stepPressed]}
    >
      <Text style={styles.stepText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, padding: 22, paddingHorizontal: 14, justifyContent: "center", backgroundColor: "#263024cf" },
  panel: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24, alignItems: "center" },
  eyebrow: { color: colors.green, fontWeight: "800", fontFamily: fonts.bold, fontSize: 12, letterSpacing: 1.5 },
  image: { marginTop: 6, width: 56, height: 56 },
  material: { marginTop: 10, width: 46, height: 36, backgroundColor: "#9b9587", borderWidth: 3, borderColor: colors.line, borderRadius: 18 },
  name: { marginTop: 4, fontSize: 19, fontWeight: "800", fontFamily: fonts.bold, color: colors.ink },
  infoRow: { marginTop: 4, flexDirection: "row", alignItems: "center", gap: 4 },
  info: { fontSize: 12, fontWeight: "700", fontFamily: fonts.bold, color: colors.brown },
  stepper: { marginTop: 14, flexDirection: "row", alignItems: "center", gap: 18 },
  step: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.green,
    borderWidth: 3,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
  },
  stepDisabled: { backgroundColor: colors.muted },
  stepPressed: { transform: [{ scale: 0.92 }] },
  stepText: { marginTop: -2, fontSize: 24, fontWeight: "900", fontFamily: fonts.bold, color: colors.cream },
  count: { minWidth: 48, textAlign: "center", fontSize: 28, fontWeight: "900", fontFamily: fonts.bold, color: colors.ink },
  quickRow: { marginTop: 10, flexDirection: "row", gap: 8 },
  quick: { minWidth: 70 },
  quickText: { fontSize: 14 },
  totalRow: { marginTop: 14, flexDirection: "row", alignItems: "center", gap: 8 },
  totalLabel: { fontSize: 14, fontWeight: "800", fontFamily: fonts.bold, color: colors.brown },
  total: { fontSize: 22, fontWeight: "900", fontFamily: fonts.bold, color: colors.ink },
  actions: { marginTop: 16, flexDirection: "row", gap: 10 },
  action: { minWidth: 110 },
});
