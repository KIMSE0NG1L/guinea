import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { kit } from "../assets";
import { DISH_SETS, describeEffect } from "../state/buffs";
import { RECIPES } from "../state/recipes";
import { Panel } from "./NineSlice";

// The kitchen's set codex: each set's bonus and the dishes in it (unlearned ones dimmed).
// Folded by default so it doesn't push the recipes down.
export function DishSetGuide({ known }: { known: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <Panel slice={kit.inset} scale={0.4} style={styles.panel}>
      <Pressable
        onPress={() => setOpen((value) => !value)}
        accessibilityRole="button"
        accessibilityLabel={open ? "세트 도감 접기" : "세트 도감 펼치기"}
        hitSlop={6}
        style={styles.header}
      >
        <Text style={styles.title}>세트 도감</Text>
        <Text style={styles.hint}>{open ? "접기 ▲" : "같은 세트 요리 아무거나 3개를 동시에 먹으면 보너스! ▼"}</Text>
      </Pressable>
      {open &&
        DISH_SETS.map((set) => (
          <View style={styles.set} key={set.id}>
            <View style={styles.setTop}>
              <Text style={styles.setName}>{set.name}</Text>
              <Text style={styles.bonus}>{describeEffect(set.bonus)}</Text>
            </View>
            <View style={styles.dishes}>
              {set.recipes.map((id) => {
                const recipe = RECIPES.find((item) => item.id === id);
                if (!recipe) return null;
                const learned = known.includes(id);
                return (
                  <View style={styles.dish} key={id}>
                    <Image source={recipe.image} style={[styles.dishImage, !learned && styles.unlearned]} />
                    <Text style={[styles.dishName, !learned && styles.dishNameDim]} numberOfLines={1}>
                      {learned ? recipe.name : "???"}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        ))}
    </Panel>
  );
}

const styles = StyleSheet.create({
  panel: { marginBottom: 12, paddingHorizontal: 12, paddingTop: 9, paddingBottom: 10 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  title: { fontSize: 12, fontWeight: "900", fontFamily: fonts.bold, color: colors.ink },
  hint: { flexShrink: 1, fontSize: 9, fontWeight: "800", fontFamily: fonts.bold, color: colors.brown, textAlign: "right" },
  set: { marginTop: 10 },
  setTop: { flexDirection: "row", alignItems: "baseline", flexWrap: "wrap", columnGap: 6 },
  setName: { fontSize: 11, fontWeight: "900", fontFamily: fonts.bold, color: colors.ink },
  bonus: { fontSize: 9, fontWeight: "900", fontFamily: fonts.bold, color: "#b0632a" },
  dishes: { marginTop: 4, flexDirection: "row", flexWrap: "wrap", gap: 6 },
  dish: { width: 48, alignItems: "center" },
  dishImage: { width: 30, height: 30 },
  unlearned: { opacity: 0.35, filter: "grayscale(1)" },
  dishName: { marginTop: 1, fontSize: 7, fontWeight: "800", fontFamily: fonts.bold, color: colors.brown },
  dishNameDim: { color: colors.muted },
});
