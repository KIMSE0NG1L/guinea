import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { useShake } from "../components/motion";
import { colors, fonts } from "../theme";
import { PageHeading } from "../components/PageHeading";
import { GameButton } from "../components/GameButton";
import { kit, uiImages } from "../assets";
import { Panel } from "../components/NineSlice";
import { formatGameNumber } from "../state/gameMath";

const products = [
  { group: "골드 상품", name: "주머니 골드", detail: `골드 ${formatGameNumber(1000)}`, price: "보석 10", tone: "gold" as const },
  { group: "보석 상품", name: "반짝 보석", detail: "보석 50", price: "준비 중", tone: "gem" as const },
  { group: "아이템 상품", name: "당근 한 묶음", detail: "당근 10개", price: "500 G", tone: "carrot" as const },
];

export function ShopScreen() {
  return (
    <View style={styles.page}>
      <PageHeading kicker="SHOP" title="골목 상점" description="없는 것 빼고 다 준비 중입니다." />
      <View style={styles.list}>
        {products.map((product, index) => (
          <ProductCard key={product.group} product={product} index={index} />
        ))}
      </View>
      <View style={styles.note}>
        <Text style={styles.noteText}>실제 결제 및 광고 기능은 연결되지 않았어요.</Text>
      </View>
    </View>
  );
}

// A product: its icon floats gently with a light sweeping the card now and then. Purchases
// aren't wired up yet, so pressing just rattles the button.
function ProductCard({ product, index }: { product: (typeof products)[number]; index: number }) {
  const float = useSharedValue(0);
  const shine = useSharedValue(0);
  const { style: shakeStyle, shake } = useShake();
  useEffect(() => {
    float.value = withDelay(index * 300, withRepeat(withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.sin) }), -1, true));
    shine.value = withDelay(index * 500, withRepeat(withSequence(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }), withDelay(2400, withTiming(0, { duration: 0 }))), -1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const floatStyle = useAnimatedStyle(() => ({ transform: [{ translateY: -float.value * 5 }, { rotate: `${(float.value - 0.5) * 6}deg` }] }));
  const shineStyle = useAnimatedStyle(() => ({ left: `${-30 + shine.value * 140}%`, opacity: shine.value === 0 ? 0 : 0.35 }));
  const icon = product.tone === "gem" ? uiImages.crystal : product.tone === "carrot" ? uiImages.carrot : uiImages.coins;
  return (
    <Panel slice={kit.panel} style={styles.card}>
      <View style={styles.shineClip} pointerEvents="none">
        <Animated.View style={[styles.shine, shineStyle]} />
      </View>
      <Animated.Image source={icon} style={[styles.productIcon, floatStyle]} />
      <View style={styles.cardCopy}>
        <Text style={styles.cardSmall}>{product.group}</Text>
        <Text style={styles.cardStrong}>{product.name}</Text>
        <Text style={styles.cardSpan}>{product.detail}</Text>
      </View>
      <Animated.View style={shakeStyle}>
        <GameButton variant="beige" onPress={shake} style={styles.buyButton} textStyle={styles.buyButtonText}>{product.price}</GameButton>
      </Animated.View>
    </Panel>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: "#e8dcc4", paddingHorizontal: 12, paddingTop: 18, paddingBottom: 25 },
  list: { gap: 10 },
  card: {
    paddingHorizontal: 13,
    paddingTop: 11,
    paddingBottom: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  productIcon: { width: 58, height: 58, resizeMode: "contain" },
  shineClip: { position: "absolute", top: 6, left: 6, right: 6, bottom: 6, overflow: "hidden", borderRadius: 8 },
  shine: { position: "absolute", top: 0, bottom: 0, width: "20%", backgroundColor: "#ffffff", transform: [{ skewX: "-20deg" }] },
  cardCopy: { flex: 1 },
  cardSmall: { color: colors.brown, fontSize: 8 },
  cardStrong: { marginVertical: 2, fontSize: 13, fontWeight: "800", fontFamily: fonts.bold, color: colors.ink },
  cardSpan: { color: colors.muted, fontSize: 9 },
  buyButton: { minWidth: 70 },
  buyButtonText: { fontSize: 9 },
  note: { marginTop: 14, padding: 10, borderWidth: 2, borderColor: "#b6a78e", borderStyle: "dashed", borderRadius: 10 },
  noteText: { color: colors.muted, fontSize: 9, textAlign: "center" },
});
