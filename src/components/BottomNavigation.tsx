import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { BattleSwordIcon } from "./BattleSwordIcon";
import type { Tab } from "../types";

// Ported as-is from the web nav list: only these 4 tabs are reachable from the bottom bar today.
// growth/equipment/inventory exist as panels (state.selectedTab supports them) but have no nav
// entry point in the source app either — not something this port invented or should silently add.
// `wideShape` just matches battle's row-layout/big-corner tab shape — it doesn't imply a custom icon.
// The big corner mirrors toward whichever edge of the bar the tab sits on (battle=left end, shop=right end).
const navigation: { id: Tab; label: string; icon?: string; isSword?: boolean; wideShape?: "left" | "right" }[] = [
  { id: "battle", label: "전투", isSword: true, wideShape: "left" },
  { id: "companions", label: "동료", icon: "FR" },
  { id: "wardrobe", label: "옷장", icon: "CL" },
  { id: "shop", label: "상점", icon: "SH", wideShape: "right" },
];

export function BottomNavigation({ selected, onSelect }: { selected: Tab; onSelect: (tab: Tab) => void }) {
  return (
    <View style={styles.nav}>
      {navigation.map((item) => {
        const active = selected === item.id;
        const wide = Boolean(item.wideShape);
        return (
          <Pressable
            key={item.id}
            onPress={() => onSelect(item.id)}
            style={[
              styles.item,
              wide && styles.assetItem,
              item.wideShape === "left" && styles.assetItemLeft,
              item.wideShape === "right" && styles.assetItemRight,
              active && styles.itemActive,
              active && wide && styles.assetItemActive,
            ]}
          >
            {item.isSword ? (
              <BattleSwordIcon width={20} height={28} />
            ) : (
              <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
                <Text style={[styles.iconText, active && styles.iconTextActive]}>{item.icon}</Text>
              </View>
            )}
            <Text style={[styles.label, wide && styles.assetLabel, active && styles.labelActive]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    height: 73,
    paddingHorizontal: 6,
    paddingTop: 6,
    paddingBottom: 7,
    flexDirection: "row",
    gap: 3,
    backgroundColor: "#ede2cb",
    borderTopWidth: 3,
    borderTopColor: colors.line,
  },
  item: {
    flex: 1,
    height: 56,
    paddingHorizontal: 1,
    paddingVertical: 4,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    borderRadius: 8,
  },
  itemActive: {
    backgroundColor: colors.green,
    borderWidth: 2,
    borderColor: colors.line,
    transform: [{ translateY: -5 }],
  },
  assetItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 11,
    gap: 6,
  },
  assetItemLeft: { borderBottomLeftRadius: 38 },
  assetItemRight: { borderBottomRightRadius: 38 },
  assetItemActive: { backgroundColor: "rgb(147, 147, 147)" },
  iconWrap: {
    width: 24,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#c8bba3",
    borderWidth: 2,
    borderColor: "#6d6254",
    borderRadius: 6,
  },
  iconWrapActive: { backgroundColor: "#dbe3bd", borderColor: colors.greenDark },
  iconText: { fontSize: 7, fontWeight: "900", fontFamily: fonts.bold, color: "#6d6254" },
  iconTextActive: { color: colors.greenDark },
  label: { fontSize: 9, fontWeight: "900", fontFamily: fonts.bold, color: "#6d6254" },
  assetLabel: { fontSize: 12 },
  labelActive: { color: colors.cream },
});
