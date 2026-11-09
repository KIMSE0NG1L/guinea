import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { NineSlice } from "./NineSlice";
import { kit, navIcons } from "../assets";
import { tutorialRef } from "./tutorialTargets";
import { playSfx } from "../sound";
import { StrokedText } from "./StrokedText";
import type { Tab } from "../types";

// Only these 4 tabs are reachable from the bottom bar; the rest of the screens open from
// buttons elsewhere. The selected tab sits on the raised green tab art with its label next
// to the icon; the others show a small caption under the icon.
const navigation: { id: Tab; label: string; icon: number }[] = [
  { id: "battle", label: "전투", icon: navIcons.battle },
  { id: "companions", label: "동료", icon: navIcons.companions },
  { id: "skills", label: "스킬", icon: navIcons.skills },
  { id: "shop", label: "상점", icon: navIcons.shop },
];

export function BottomNavigation({ selected, onSelect }: { selected: Tab; onSelect: (tab: Tab) => void }) {
  return (
    <View style={styles.nav}>
      {/* Oversized so its left, right and bottom edges run off-screen — only the top rim shows. */}
      <View style={styles.background} pointerEvents="none">
        <NineSlice slice={kit.panelLarge} scale={0.45} />
      </View>
      {navigation.map((item) => {
        const active = selected === item.id;
        return (
          <Pressable
            key={item.id}
            ref={tutorialRef(`nav-${item.id}`)}
            onPress={() => {
              playSfx("uiClick");
              onSelect(item.id);
            }}
            accessibilityRole="tab"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: active }}
            style={({ pressed }) => [styles.item, active && styles.itemActive, pressed && !active && styles.pressed]}
          >
            {active && <NineSlice slice={kit.tabGreen} scale={0.4} />}
            <Image source={item.icon} style={[styles.icon, active && styles.iconActive]} />
            {active ? (
              <Text style={styles.label}>{item.label}</Text>
            ) : (
              <StrokedText style={styles.caption} strokeColor={colors.line} strokeWidth={1.4}>
                {item.label}
              </StrokedText>
            )}
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
    backgroundColor: colors.paper,
    overflow: "hidden",
  },
  background: { position: "absolute", top: 0, left: -16, right: -16, bottom: -18 },
  // Idle tabs: icon over its caption, both kept inside the tab with some breathing room.
  item: {
    flex: 1,
    height: 56,
    paddingTop: 4,
    paddingBottom: 5,
    alignItems: "center",
    justifyContent: "center",
    gap: 1,
  },
  // Selected tab: raised green art, icon and label side by side with padding on both ends.
  itemActive: { height: 52, alignSelf: "center", flexDirection: "row", paddingHorizontal: 12, paddingBottom: 3, gap: 6 },
  pressed: { transform: [{ scale: 0.92 }] },
  icon: { width: 32, height: 32 },
  iconActive: { width: 34, height: 34 },
  caption: { fontSize: 13, fontWeight: "900", fontFamily: fonts.bold, color: colors.cream },
  label: { fontSize: 15, fontWeight: "900", fontFamily: fonts.bold, color: colors.cream },
});
