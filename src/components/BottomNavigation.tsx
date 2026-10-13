import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { uiImages, uiSlices } from "../assets";
import { NineSlice, SliceButton } from "./NineSlice";
import type { Tab } from "../types";

// Ported as-is from the web nav list: only these 4 tabs are reachable from the bottom bar today.
// growth/equipment/inventory exist as panels (state.selectedTab supports them) but have no nav
// entry point in the source app either — not something this port invented or should silently add.
// Battle gets its own stone button (crystal baked into the art); the rest share a parchment strip.
const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: "companions", label: "동료", icon: "FR" },
  { id: "wardrobe", label: "옷장", icon: "CL" },
  { id: "shop", label: "상점", icon: "SH" },
];

export function BottomNavigation({ selected, onSelect }: { selected: Tab; onSelect: (tab: Tab) => void }) {
  const battleActive = selected === "battle";
  return (
    <NineSlice slice={uiSlices.buttonWood} scale={0.4} style={styles.nav}>
      <SliceButton
        slice={uiSlices.navBattle}
        scale={0.4}
        onPress={() => onSelect("battle")}
        accessibilityLabel="전투"
        style={[styles.battle, !battleActive && styles.inactive]}
      >
        <Text style={styles.battleLabel}>전투</Text>
      </SliceButton>

      <NineSlice slice={uiSlices.navParchment} scale={0.4} style={styles.tabs}>
        {tabs.map((item) => {
          const active = selected === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => onSelect(item.id)}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              style={({ pressed }) => [styles.tab, (active || pressed) && styles.tabRaised]}
            >
              <View style={styles.key}>
                <Image source={uiImages.keyStone} style={styles.keyImage} />
                <Text style={[styles.keyText, active && styles.textActive]}>{item.icon}</Text>
              </View>
              <Text style={[styles.label, active && styles.textActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </NineSlice>
    </NineSlice>
  );
}

const styles = StyleSheet.create({
  nav: {
    height: 78,
    marginHorizontal: 4,
    marginBottom: 4,
    paddingHorizontal: 8,
    paddingVertical: 8,
    flexDirection: "row",
    gap: 4,
  },
  battle: { flex: 1 },
  inactive: { opacity: 0.7 },
  // Clears the crystal on the left of the art.
  battleLabel: { paddingLeft: 40, color: colors.ink, fontSize: 15, fontWeight: "900", fontFamily: fonts.bold },
  tabs: { flex: 2, flexDirection: "row", alignItems: "center", paddingHorizontal: 12 },
  tab: { flex: 1, alignItems: "center", justifyContent: "center", gap: 2 },
  tabRaised: { transform: [{ translateY: -3 }] },
  key: { width: 30, height: 26, alignItems: "center", justifyContent: "center" },
  keyImage: { position: "absolute", width: 30, height: 26 },
  keyText: { fontSize: 8, fontWeight: "900", fontFamily: fonts.bold, color: "#4f463c" },
  label: { fontSize: 10, fontWeight: "900", fontFamily: fonts.bold, color: "#6d6254" },
  textActive: { color: colors.greenDark },
});
