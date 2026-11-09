import { useState } from "react";
import { Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { kit } from "../assets";
import { NineSlice } from "./NineSlice";
import { GameButton } from "./GameButton";
import { CoinPrice } from "./CoinPrice";
import { ITEM_IMAGES } from "../state/recipes";
import { getSellPrice } from "../state/grocery";
import { playSfx } from "../sound";

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
          <Text style={styles.eyebrow}>재료 팔기</Text>
          {image !== undefined ? <Image source={image} style={styles.image} /> : <View style={styles.material} />}
          <Text style={styles.name}>{name}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.info}>가지고 있는 개수 {owned}개</Text>
            <Text style={styles.info}>·</Text>
            <Text style={styles.info}>1개당</Text>
            <CoinPrice amount={unit} textStyle={styles.info} />
          </View>

          <View style={styles.stepper}>
            <StepButton label="−" onPress={() => change(count - 1)} disabled={count <= 1} accessibilityLabel="1개 줄이기" />
            <Text style={styles.count}>{count}</Text>
            <StepButton label="+" onPress={() => change(count + 1)} disabled={count >= owned} accessibilityLabel="1개 늘리기" />
          </View>
          <View style={styles.quickRow}>
            <GameButton variant="cream" onPress={() => change(count + 10)} disabled={count >= owned} style={styles.quick} textStyle={styles.quickText}>
              +10
            </GameButton>
            <GameButton variant="cream" onPress={() => change(owned)} disabled={count >= owned} style={styles.quick} textStyle={styles.quickText}>
              전부
            </GameButton>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>받는 골드</Text>
            <CoinPrice amount={unit * count} textStyle={styles.total} />
          </View>

          <View style={styles.actions}>
            <GameButton variant="cream" onPress={onClose} style={styles.action}>
              취소
            </GameButton>
            <GameButton
              variant="green"
              onPress={() => {
                playSfx("uiClick");
                onSell(count);
                onClose();
              }}
              accessibilityLabel={`${name} ${count}개를 ${unit * count}골드에 팔기`}
              style={styles.action}
            >
              {`${count}개 팔기`}
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
  panel: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 18, alignItems: "center" },
  eyebrow: { color: colors.green, fontWeight: "800", fontFamily: fonts.bold, fontSize: 9, letterSpacing: 1.5 },
  image: { marginTop: 6, width: 56, height: 56 },
  material: { marginTop: 10, width: 46, height: 36, backgroundColor: "#9b9587", borderWidth: 3, borderColor: colors.line, borderRadius: 18 },
  name: { marginTop: 4, fontSize: 16, fontWeight: "800", fontFamily: fonts.bold, color: colors.ink },
  infoRow: { marginTop: 4, flexDirection: "row", alignItems: "center", gap: 4 },
  info: { fontSize: 10, fontWeight: "700", fontFamily: fonts.bold, color: colors.brown },
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
  stepText: { marginTop: -2, fontSize: 20, fontWeight: "900", fontFamily: fonts.bold, color: colors.cream },
  count: { minWidth: 48, textAlign: "center", fontSize: 24, fontWeight: "900", fontFamily: fonts.bold, color: colors.ink },
  quickRow: { marginTop: 10, flexDirection: "row", gap: 8 },
  quick: { minWidth: 70 },
  quickText: { fontSize: 12 },
  totalRow: { marginTop: 14, flexDirection: "row", alignItems: "center", gap: 8 },
  totalLabel: { fontSize: 12, fontWeight: "800", fontFamily: fonts.bold, color: colors.brown },
  total: { fontSize: 18, fontWeight: "900", fontFamily: fonts.bold, color: colors.ink },
  actions: { marginTop: 16, flexDirection: "row", gap: 10 },
  action: { minWidth: 110 },
});
