import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { NineSlice } from "./NineSlice";
import { kit, navIcons } from "../assets";
import type { Tab } from "../types";

// Only these 4 tabs are reachable from the bottom bar; the rest of the screens open from
// buttons elsewhere. The selected tab widens onto the raised green tab art and shows its
// label next to the icon; the others are icon-only.
const navigation: { id: Tab; label: string; icon: number }[] = [
  { id: "battle", label: "전투", icon: navIcons.battle },
  { id: "companions", label: "동료", icon: navIcons.companions },
  { id: "skills", label: "스킬", icon: navIcons.skills },
  { id: "shop", label: "상점", icon: navIcons.shop },
];

export function BottomNavigation({ selected, onSelect }: { selected: Tab; onSelect: (tab: Tab) => void }) {
  return (
    <View style={styles.nav}>
      {navigation.map((item) => {
        const active = selected === item.id;
        return (
          <Pressable
            key={item.id}
            onPress={() => onSelect(item.id)}
            accessibilityRole="tab"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: active }}
            style={({ pressed }) => [styles.item, active && styles.itemActive, pressed && !active && styles.pressed]}
          >
            {active && <NineSlice slice={kit.tabGreen} scale={0.42} />}
            <Image source={item.icon} style={[styles.icon, active && styles.iconActive]} />
            {active && <Text style={styles.label}>{item.label}</Text>}
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
    paddingBottom: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  // Wider than the icon-only tabs so the label fits beside the icon.
  itemActive: { flex: 1.7, paddingBottom: 8, transform: [{ translateY: -5 }] },
  pressed: { transform: [{ scale: 0.92 }] },
  icon: { width: 40, height: 40 },
  iconActive: { width: 34, height: 34 },
  label: { fontSize: 13, fontWeight: "900", fontFamily: fonts.bold, color: colors.cream },
});
