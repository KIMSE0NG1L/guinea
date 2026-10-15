import { useState } from "react";
import { Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { chef, grandma, shopImages, shopKit } from "../assets";
import { GameButton } from "../components/GameButton";
import { Panel } from "../components/NineSlice";
import { ShopHero, ShopTopBar, useShopTalk } from "../components/ShopScene";
import { formatGameNumber } from "../state/gameMath";
import { GROCERY, type GroceryCategory } from "../state/grocery";
import { getItemQuantity, ITEM_IMAGES } from "../state/recipes";
import type { GameState } from "../types";

type Filter = "all" | GroceryCategory;

const TABS: { id: Filter; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "vegetable", label: "채소" },
  { id: "fruit", label: "과일" },
  { id: "farm", label: "농장" },
  { id: "meat", label: "고기" },
  { id: "seafood", label: "해산물" },
  { id: "special", label: "특산" },
];

const GREETING = { pose: grandma.happy, line: "어서 오렴! 오늘 들어온 재료가 아주 싱싱하단다." };
const TAB_LINES: Record<Filter, string> = {
  all: GREETING.line,
  vegetable: "채소는 오늘 아침 밭에서 바로 따왔지.",
  farm: "계란이랑 우유는 새벽에 받아왔단다.",
  meat: "고기는 귀한 거라 값이 좀 나간단다.",
  fruit: "남쪽 정글에서 온 과일이란다. 달달하지?",
  seafood: "항구에서 막 들어온 해산물이야. 비린내 안 나지?",
  special: "젤리랑 열매는 몬스터한테서나 나오는 귀한 거란다.",
};

export function GroceryScreen({
  inventory,
  gold,
  onBuy,
  onBack,
  onOpenRecipes,
}: {
  inventory: GameState["inventory"];
  gold: number;
  onBuy: (name: string, price: number) => boolean;
  onBack: () => void;
  onOpenRecipes: () => void;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const { talk, say } = useShopTalk(GREETING);

  const selectTab = (id: Filter) => {
    setFilter(id);
    say(grandma.menu, TAB_LINES[id]);
  };

  const buy = (name: string, price: number) => {
    if (onBuy(name, price)) {
      say(grandma.wave, `${name} 하나 담아뒀단다. 맛있게 해먹으렴!`);
    } else {
      say(grandma.happy, "어이쿠, 골드가 조금 모자라구나.");
    }
  };

  const items = GROCERY.filter((item) => filter === "all" || item.category === filter);

  return (
    <View style={styles.page}>
      <ShopTopBar kicker="GROCERY" title="할머니 식료품점" gold={gold} onBack={onBack} backLabel="부엌으로 돌아가기"
        other={{ label: "레시피", keeper: chef.spoon, onPress: onOpenRecipes, accessibilityLabel: "레시피 상점으로 가기" }}
      />
      <ShopHero speaker="할멈 기니" talk={talk} />

      {/* More categories than fit across, so the row scrolls sideways. */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll} contentContainerStyle={styles.tabs}>
        {TABS.map((tab) => {
          const active = tab.id === filter;
          return (
            <Pressable key={tab.id} onPress={() => selectTab(tab.id)} accessibilityRole="tab" accessibilityState={{ selected: active }}>
              <ImageBackground source={active ? shopImages.tabRed : shopImages.tabCream} resizeMode="stretch" style={styles.tab}>
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab.label}</Text>
              </ImageBackground>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.grid}>
        {items.map((item) => {
          const affordable = gold >= item.price;
          return (
            <Panel slice={shopKit.cardWood} scale={0.4} style={styles.card} key={item.name}>
              <Image source={ITEM_IMAGES[item.name]} style={styles.itemImage} />
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.owned}>보유 {getItemQuantity(inventory, item.name)}</Text>
              <GameButton
                variant={affordable ? "red" : "pillGray"}
                onPress={() => buy(item.name, item.price)}
                accessibilityLabel={`${item.name} ${item.price}골드에 구매`}
                style={styles.buyButton}
              >
                <Text style={[styles.buyText, !affordable && styles.buyTextOff]}>{formatGameNumber(item.price)} G</Text>
              </GameButton>
            </Panel>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: "#e8dcc4", paddingHorizontal: 12, paddingTop: 14, paddingBottom: 25 },
  tabScroll: { marginBottom: 6, marginHorizontal: -12 },
  tabs: { gap: 4, paddingHorizontal: 14 },
  // Matches the tab art's ~3:2 shape; the label sits on the upper flap, above the fold.
  tab: { width: 75, height: 50, alignItems: "center", justifyContent: "center", paddingBottom: 14 },
  tabText: { fontSize: 12, fontWeight: "900", fontFamily: fonts.bold, color: colors.brown },
  tabTextActive: { color: colors.cream },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 10 },
  card: { width: "48.5%", alignItems: "center", paddingHorizontal: 12, paddingTop: 14, paddingBottom: 16 },
  itemImage: { width: 54, height: 54 },
  itemName: { marginTop: 4, fontSize: 13, fontWeight: "800", fontFamily: fonts.bold, color: colors.ink },
  owned: { marginTop: 1, fontSize: 9, color: colors.muted },
  buyButton: { marginTop: 8, alignSelf: "stretch", minHeight: 34 },
  buyText: { fontSize: 11, fontWeight: "900", fontFamily: fonts.bold, color: colors.cream },
  buyTextOff: { color: "#4f463c" },
});
