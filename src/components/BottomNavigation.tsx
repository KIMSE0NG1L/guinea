import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { BattleSwordIcon } from "./BattleSwordIcon";
import { NineSlice, Panel } from "./NineSlice";
import { kit } from "../assets";
import type { Tab } from "../types";

// Ported as-is from the web nav list: only these 4 tabs are reachable from the bottom bar today.
// growth/equipment/inventory exist as panels (state.selectedTab supports them) but have no nav
// entry point in the source app either — not something this port invented or should silently add.
// `wideShape` marks the end tabs that lay out icon and label in a row — it doesn't imply a custom icon.
// The active tab sits on the kit's raised green tab art.
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
            style={[styles.item, wide && styles.assetItem, active && styles.itemActive]}
          >
            {active && <NineSlice slice={kit.tabGreen} scale={0.42} />}
            {item.isSword ? (
              // Wrapped: on web a bare <svg> paints beneath the absolutely positioned tab art.
              <View>
                <BattleSwordIcon width={20} height={28} />
              </View>
            ) : (
              <Panel slice={active ? kit.buttonCream : kit.buttonBeige} scale={0.2} style={styles.iconWrap}>
                <Text style={[styles.iconText, active && styles.iconTextActive]}>{item.icon}</Text>
              </Panel>
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
    paddingTop: 6,
    paddingBottom: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  itemActive: { transform: [{ translateY: -5 }] },
  assetItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 11,
    gap: 6,
  },
  iconWrap: { width: 26, height: 22, paddingBottom: 2, alignItems: "center", justifyContent: "center" },
  iconText: { fontSize: 7, fontWeight: "900", fontFamily: fonts.bold, color: "#6d6254" },
  iconTextActive: { color: colors.greenDark },
  label: { fontSize: 9, fontWeight: "900", fontFamily: fonts.bold, color: "#6d6254" },
  assetLabel: { fontSize: 12 },
  labelActive: { color: colors.cream },
});
