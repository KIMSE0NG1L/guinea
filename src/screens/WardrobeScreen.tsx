import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radii, fonts } from "../theme";
import { PageHeading } from "../components/PageHeading";
import { GameButton } from "../components/GameButton";
import { CharacterSprite } from "../components/CharacterSprite";
import type { Outfit } from "../types";

const wardrobeItems: { outfit: Outfit; name: string; detail: string; swatch: string }[] = [
  { outfit: "default", name: "기본 빨간 망토", detail: "기니의 첫 모험복", swatch: "#b84e3c" },
  { outfit: "acorn", name: "도토리 탐험복", detail: "도토리 향이 나는 탐험복", swatch: "#a97a43" },
  { outfit: "pauper", name: "빈곤 모험가 로브", detail: "동전 한 닢 없어도 모험은 계속된다", swatch: "#8a7a63" },
];

// Matches web: `.wardrobe-preview .guinea-sprite { scale: 1.18 }`. The sprite's own
// 108x108 layout box stays fixed — only the visual scale changes — so the preview
// card's height doesn't shift per outfit.
const WARDROBE_SPRITE_SIZE = 108;
const WARDROBE_SCALE = 1.18;

export function WardrobeScreen({
  equippedOutfit,
  onEquip,
}: {
  equippedOutfit: Outfit;
  onEquip: (outfit: Outfit) => void;
}) {
  const equippedItem = wardrobeItems.find((item) => item.outfit === equippedOutfit) ?? wardrobeItems[0];

  return (
    <View style={styles.page}>
      <PageHeading kicker="DRESS UP" title="기니의 옷장" description="강함보다 중요한 건 망토의 펄럭임." />

      <LinearGradient colors={[colors.greenDark, "#73835e"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.preview}>
        <View>
          <Text style={styles.previewLabel}>현재 모습</Text>
          <Text style={styles.previewTitle}>{equippedItem.name}</Text>
          <Text style={styles.previewSub}>오늘도 제법 주인공 같다.</Text>
        </View>
        <View style={styles.previewSprite}>
          <CharacterSprite
            outfit={equippedOutfit}
            animation="idle"
            size={WARDROBE_SPRITE_SIZE}
            scale={WARDROBE_SCALE}
            restartKey={equippedOutfit}
          />
        </View>
      </LinearGradient>

      <View style={styles.list}>
        {wardrobeItems.map((item) => {
          const equipped = item.outfit === equippedOutfit;
          return (
            <View style={[styles.card, equipped && styles.cardEquipped]} key={item.name}>
              <View style={[styles.swatch, { backgroundColor: item.swatch }]}>
                <View style={styles.swatchDot} />
              </View>
              <View style={styles.cardCopy}>
                <Text style={styles.cardSmall}>{equipped ? "착용 중" : "보유 중"}</Text>
                <Text style={styles.cardStrong}>{item.name}</Text>
                <Text style={styles.cardSpan}>{item.detail}</Text>
              </View>
              <GameButton
                onPress={() => onEquip(item.outfit)}
                style={[styles.wardrobeButton, equipped && styles.wardrobeButtonEquipped]}
                textStyle={[styles.wardrobeButtonText, equipped && styles.wardrobeButtonTextEquipped]}
              >
                {equipped ? "착용 중" : "입기"}
              </GameButton>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: "#e8dcc4", paddingHorizontal: 12, paddingTop: 18, paddingBottom: 25 },
  preview: {
    minHeight: 150,
    marginBottom: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 3,
    borderColor: colors.line,
    borderRadius: radii.lg,
    overflow: "hidden",
  },
  previewLabel: { color: "#d7dfab", fontSize: 9, fontWeight: "900", fontFamily: fonts.bold, letterSpacing: 1.5 },
  previewTitle: { marginTop: 5, fontSize: 17, fontWeight: "800", fontFamily: fonts.bold, color: colors.cream },
  previewSub: { marginTop: 5, color: "#e4ddca", fontSize: 9 },
  previewSprite: { marginRight: -2, marginBottom: -18 },
  list: { gap: 8 },
  card: {
    padding: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#e1d7c4",
    borderWidth: 2,
    borderColor: "#a99a82",
    borderStyle: "dashed",
    borderRadius: 11,
  },
  cardEquipped: { backgroundColor: colors.cream, borderWidth: 3, borderColor: colors.line, borderStyle: "solid" },
  swatch: {
    width: 46,
    height: 46,
    alignItems: "center",
    borderWidth: 3,
    borderColor: colors.line,
    borderTopLeftRadius: 23,
    borderTopRightRadius: 23,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  swatchDot: { position: "absolute", bottom: 5, width: 11, height: 11, backgroundColor: colors.gold, borderWidth: 2, borderColor: colors.line, borderRadius: 6 },
  cardCopy: { flex: 1 },
  cardSmall: { color: colors.green, fontSize: 8, fontWeight: "900", fontFamily: fonts.bold },
  cardStrong: { marginVertical: 2, fontSize: 12, fontWeight: "800", fontFamily: fonts.bold, color: colors.ink },
  cardSpan: { color: colors.muted, fontSize: 8 },
  wardrobeButton: { minWidth: 62, paddingVertical: 6, backgroundColor: "#d8cba9" },
  wardrobeButtonEquipped: { backgroundColor: colors.green },
  wardrobeButtonText: { fontSize: 8 },
  wardrobeButtonTextEquipped: { color: colors.cream },
});
