import { StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { PageHeading } from "../components/PageHeading";
import { GameButton } from "../components/GameButton";
import { GemIcon } from "../components/GemIcon";
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
        {products.map((product) => (
          <View style={styles.card} key={product.group}>
            {product.tone === "gem" ? (
              <View style={styles.gemIconWrap}>
                <GemIcon width={45} height={41} />
              </View>
            ) : product.tone === "carrot" ? (
              <View style={styles.carrotIcon} />
            ) : (
              <View style={styles.goldIcon}>
                <Text style={styles.goldIconText}>$</Text>
              </View>
            )}
            <View style={styles.cardCopy}>
              <Text style={styles.cardSmall}>{product.group}</Text>
              <Text style={styles.cardStrong}>{product.name}</Text>
              <Text style={styles.cardSpan}>{product.detail}</Text>
            </View>
            <GameButton style={styles.buyButton} textStyle={styles.buyButtonText}>{product.price}</GameButton>
          </View>
        ))}
      </View>
      <View style={styles.note}>
        <Text style={styles.noteText}>실제 결제 및 광고 기능은 연결되지 않았어요.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: "#e8dcc4", paddingHorizontal: 12, paddingTop: 18, paddingBottom: 25 },
  list: { gap: 10 },
  card: {
    padding: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    backgroundColor: colors.cream,
    borderWidth: 3,
    borderColor: colors.line,
    borderRadius: 13,
  },
  goldIcon: { width: 58, height: 58, alignItems: "center", justifyContent: "center", backgroundColor: colors.gold, borderWidth: 3, borderColor: colors.line, borderRadius: 29 },
  goldIconText: { color: "#71491b", fontSize: 20, fontWeight: "900", fontFamily: fonts.bold },
  carrotIcon: { width: 32, height: 57, backgroundColor: "#db7846", borderRadius: 16, transform: [{ rotate: "20deg" }] },
  gemIconWrap: { width: 58, height: 58, alignItems: "center", justifyContent: "center" },
  cardCopy: { flex: 1 },
  cardSmall: { color: colors.brown, fontSize: 8 },
  cardStrong: { marginVertical: 2, fontSize: 13, fontWeight: "800", fontFamily: fonts.bold, color: colors.ink },
  cardSpan: { color: colors.muted, fontSize: 9 },
  buyButton: { minWidth: 70, paddingVertical: 7, backgroundColor: "#dbc99e" },
  buyButtonText: { fontSize: 9 },
  note: { marginTop: 14, padding: 10, borderWidth: 2, borderColor: "#b6a78e", borderStyle: "dashed", borderRadius: 10 },
  noteText: { color: colors.muted, fontSize: 9, textAlign: "center" },
});
