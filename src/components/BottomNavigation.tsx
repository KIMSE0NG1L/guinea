import { Image, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "./GameText";
import { colors, fonts } from "../theme";
import { NineSlice } from "./NineSlice";
import { food, kit, navIcons } from "../assets";
import { tutorialRef } from "./tutorialTargets";
import { playSfx } from "../sound";
import { StrokedText } from "./StrokedText";
import type { Tab } from "../types";

// Only these 5 tabs are reachable from the bottom bar; the rest of the screens open from
// buttons elsewhere. Five tabs leave no room for a label beside the icon, so every tab —
// selected or not — puts its label under the icon; the selected one sits on the raised
// green tab art. 요리's icon isn't a custom
// nav glyph — the existing cook-pot item icon already matches this set's thick-outline look
// closely enough.
const navigation: { id: Tab; label: string; icon: number }[] = [
  { id: "companions", label: "동료", icon: navIcons.companions },
  { id: "skills", label: "스킬", icon: navIcons.skills },
  { id: "battle", label: "전투", icon: navIcons.battle },
  { id: "kitchen", label: "요리", icon: food.cookPot },
  { id: "shop", label: "상점", icon: navIcons.shop },
];

export function BottomNavigation({ selected, onSelect }: { selected: Tab; onSelect: (tab: Tab) => void }) {
  // Each tab is a fixed box with padding on every side, so the icon never hugs the top of
  // the green selected-tab art. On phones with a home indicator the bar takes only the part
  // of that inset the indicator bar itself needs (the tabs sink into the rest), so no empty
  // strip is left under the labels.
  const { bottom } = useSafeAreaInsets();
  const below = Math.max(0, bottom - INSET_SINK);
  return (
    <View style={[styles.nav, { height: NAV_HEIGHT + below, paddingBottom: NAV_PADDING_BOTTOM + below }]}>
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
            style={({ pressed }) => [styles.item, pressed && !active && styles.pressed]}
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

// Tab box: 7 above the icon, 7 below the label (icon 32 + label line 18 + 1 gap = 51).
const TAB_HEIGHT = 65;
const NAV_PADDING_TOP = 9;
const NAV_PADDING_BOTTOM = 6;
const NAV_HEIGHT = NAV_PADDING_TOP + TAB_HEIGHT + NAV_PADDING_BOTTOM;
// How much of the bottom safe-area inset the tabs may sit in (iPhone's is 34; the indicator
// bar takes the lowest ~13).
const INSET_SINK = 22;

const styles = StyleSheet.create({
  nav: {
    height: NAV_HEIGHT,
    paddingHorizontal: 6,
    paddingTop: NAV_PADDING_TOP,
    paddingBottom: NAV_PADDING_BOTTOM,
    flexDirection: "row",
    gap: 3,
    backgroundColor: colors.paper,
    overflow: "hidden",
  },
  background: { position: "absolute", top: 0, left: -16, right: -16, bottom: -18 },
  // Idle tabs: icon over its caption, both kept inside the tab with some breathing room.
  item: {
    flex: 1,
    height: TAB_HEIGHT,
    paddingTop: 7,
    paddingBottom: 7,
    alignItems: "center",
    justifyContent: "center",
    gap: 1,
  },
  pressed: { transform: [{ scale: 0.92 }] },
  icon: { width: 32, height: 32 },
  iconActive: { width: 32, height: 32 },
  caption: { fontSize: 14, fontWeight: "900", fontFamily: fonts.bold, color: colors.cream },
  label: { fontSize: 14, fontWeight: "900", fontFamily: fonts.bold, color: colors.cream },
});
