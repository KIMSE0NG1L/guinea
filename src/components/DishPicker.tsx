import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { kit } from "../assets";
import { GameButton } from "./GameButton";
import { ARROW_H, ARROW_W, GuideArrow } from "./GuideArrow";
import { NineSlice, Panel } from "./NineSlice";
import { BUFFS, DISH_PARTNERS, describeDish, describeDishLinks, formatDuration, INSTANT_DISHES, PARTNER_MULTIPLIER, type BuffSlot } from "../state/buffs";
import { getItemQuantity, RECIPES } from "../state/recipes";
import type { GameState, Outfit } from "../types";

// Choose a cooked dish from the bag to eat into a buff slot.
export function DishPicker({
  inventory,
  slots,
  now,
  outfit,
  onEat,
  onClose,
  onGoCook,
  guideRecipeId,
}: {
  inventory: GameState["inventory"];
  slots: BuffSlot[];
  now: number;
  // Equipped companion — a dish partnered with it shows its boosted strength.
  outfit: Outfit;
  onEat: (recipeId: string) => void;
  onClose: () => void;
  onGoCook: () => void;
  // During the recipe tutorial: the dish whose 먹기 button gets the guide arrow. The picker
  // is a Modal above the guide layer, so it draws that arrow itself.
  guideRecipeId?: string;
}) {
  const dishes = RECIPES.filter((recipe) => getItemQuantity(inventory, recipe.name) > 0);
  const running = new Set(slots.filter((slot) => slot && slot.expiresAt > now).map((slot) => slot!.recipeId));

  return (
    <Modal visible animationType="fade" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.panel} onPress={(event) => event.stopPropagation()}>
          <NineSlice slice={kit.panelLarge} />
          <View style={styles.top}>
            <View>
              <Text style={styles.eyebrow}>FOOD BUFF</Text>
              <Text style={styles.title}>무엇을 먹을까?</Text>
            </View>
            <GameButton onPress={onClose} style={styles.closeButton}>닫기</GameButton>
          </View>

          {dishes.length === 0 ? (
            <Panel slice={kit.inset} style={styles.empty}>
              <Text style={styles.emptyText}>가방에 요리한 음식이 없어요.</Text>
              <GameButton variant="red" onPress={onGoCook} style={styles.emptyButton}>
                부엌에서 요리하기
              </GameButton>
            </Panel>
          ) : (
            <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
              {dishes.map((recipe) => {
                const buff = BUFFS[recipe.id];
                const busy = running.has(recipe.id);
                return (
                  <Panel slice={kit.panel} scale={0.4} style={styles.item} key={recipe.id}>
                    <View style={[styles.dishWrap, { backgroundColor: buff.tint }]}>
                      <Image source={recipe.image} style={styles.dish} />
                    </View>
                    <View style={styles.info}>
                      <Text style={styles.name}>
                        {recipe.name} <Text style={styles.count}>x{getItemQuantity(inventory, recipe.name)}</Text>
                      </Text>
                      <Text style={styles.effect}>{describeDish(recipe.id)}</Text>
                      <Text style={styles.duration}>
                        {[
                          INSTANT_DISHES[recipe.id] ? "즉시 효과" : `${formatDuration(buff.durationMs)} 지속`,
                          ...describeDishLinks(recipe.id),
                          ...(DISH_PARTNERS[recipe.id] === outfit ? [`효과 ×${PARTNER_MULTIPLIER}`] : []),
                        ].join(" · ")}
                      </Text>
                    </View>
                    <View>
                      <GameButton
                        variant={busy ? "gray" : "green"}
                        disabled={busy}
                        onPress={() => onEat(recipe.id)}
                        style={styles.eatButton}
                        textStyle={styles.eatText}
                      >
                        {busy ? "효과 중" : "먹기"}
                      </GameButton>
                      {recipe.id === guideRecipeId && !busy && <GuideArrow direction="right" style={styles.guideArrow} />}
                    </View>
                  </Panel>
                );
              })}
            </ScrollView>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // Points in from the left — the list scrolls, so anything above the row gets clipped.
  guideArrow: { right: "100%", marginRight: 2, top: "50%", marginTop: -ARROW_H / 2, width: ARROW_W },
  backdrop: { flex: 1, paddingHorizontal: 14, justifyContent: "center", backgroundColor: "#263024cf" },
  panel: { maxHeight: "80%", width: "100%", maxWidth: 410, alignSelf: "center", paddingHorizontal: 18, paddingTop: 16, paddingBottom: 20 },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  eyebrow: { color: colors.green, fontWeight: "800", fontFamily: fonts.bold, fontSize: 9, letterSpacing: 1.5 },
  title: { fontSize: 20, fontWeight: "800", fontFamily: fonts.bold, color: colors.ink, letterSpacing: -0.5 },
  closeButton: { paddingHorizontal: 12 },
  empty: { alignItems: "center", gap: 10, paddingVertical: 20, paddingHorizontal: 14 },
  emptyText: { fontSize: 12, fontWeight: "800", fontFamily: fonts.bold, color: colors.brown },
  emptyButton: { paddingHorizontal: 16 },
  list: { flexGrow: 0 },
  listContent: { gap: 8 },
  item: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 11, paddingTop: 9, paddingBottom: 11 },
  dishWrap: { width: 46, height: 46, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: colors.line, borderRadius: 9 },
  dish: { width: 40, height: 40 },
  info: { flex: 1 },
  name: { fontSize: 12, fontWeight: "800", fontFamily: fonts.bold, color: colors.ink },
  count: { fontSize: 10, color: colors.muted },
  effect: { marginTop: 2, fontSize: 10, fontWeight: "800", fontFamily: fonts.bold, color: colors.green },
  duration: { marginTop: 1, fontSize: 9, color: colors.muted },
  eatButton: { minWidth: 58 },
  eatText: { fontSize: 10 },
});
