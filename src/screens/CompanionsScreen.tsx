import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radii, fonts } from "../theme";
import { kit } from "../assets";
import { Panel } from "../components/NineSlice";
import { PageHeading } from "../components/PageHeading";
import { GameButton } from "../components/GameButton";
import { CharacterSprite } from "../components/CharacterSprite";
import { OUTFIT_BUFFS, describeEffect } from "../state/buffs";
import type { Outfit } from "../types";

// Each entry swaps the battle sprite to that companion's art and, past "default", grants
// its OUTFIT_BUFFS bonus for as long as it stays equipped.
const COMPANIONS: { outfit: Outfit; name: string; detail: string }[] = [
  { outfit: "default", name: "모험기니", detail: "동료 없이 다닐 때" },
  { outfit: "explorerHamster", name: "탐험기니", detail: describeEffect(OUTFIT_BUFFS.explorerHamster!) },
];

const PREVIEW_SPRITE_SIZE = 108;

export function CompanionsScreen({
  equippedOutfit,
  onEquip,
}: {
  equippedOutfit: Outfit;
  onEquip: (outfit: Outfit) => void;
}) {
  const equippedItem = COMPANIONS.find((item) => item.outfit === equippedOutfit) ?? COMPANIONS[0];

  return (
    <View style={styles.page}>
      <PageHeading kicker="FRIENDS" title="동료" description="혼자보다 덜 쓸쓸하고, 조금 더 세다." />

      <LinearGradient colors={[colors.greenDark, "#73835e"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.preview}>
        <View>
          <Text style={styles.previewLabel}>함께하는 중</Text>
          <Text style={styles.previewTitle}>{equippedItem.name}</Text>
          <Text style={styles.previewSub}>{equippedItem.detail}</Text>
        </View>
        <View style={styles.previewSprite}>
          <CharacterSprite outfit={equippedOutfit} animation="idle" size={PREVIEW_SPRITE_SIZE} restartKey={equippedOutfit} />
        </View>
      </LinearGradient>

      <View style={styles.list}>
        {COMPANIONS.map((item) => {
          const equipped = item.outfit === equippedOutfit;
          return (
            <Panel slice={equipped ? kit.panel : kit.inset} style={styles.card} key={item.outfit}>
              <View style={styles.avatar}>
                <CharacterSprite outfit={item.outfit} animation="idle" size={46} restartKey={item.outfit} />
              </View>
              <View style={styles.cardCopy}>
                <Text style={styles.cardSmall}>{equipped ? "함께하는 중" : "같이 다닐 수 있음"}</Text>
                <Text style={styles.cardStrong}>{item.name}</Text>
                <Text style={styles.cardSpan}>{item.detail}</Text>
              </View>
              <GameButton
                variant={equipped ? "green" : "beige"}
                onPress={() => onEquip(item.outfit)}
                style={styles.equipButton}
                textStyle={styles.equipButtonText}
              >
                {equipped ? "함께 중" : "함께하기"}
              </GameButton>
            </Panel>
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
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3ead3",
    borderWidth: 3,
    borderColor: colors.line,
    borderRadius: 28,
    overflow: "hidden",
  },
  cardCopy: { flex: 1 },
  cardSmall: { color: colors.green, fontSize: 8, fontWeight: "900", fontFamily: fonts.bold },
  cardStrong: { marginVertical: 2, fontSize: 12, fontWeight: "800", fontFamily: fonts.bold, color: colors.ink },
  cardSpan: { color: colors.muted, fontSize: 8 },
  equipButton: { minWidth: 70 },
  equipButtonText: { fontSize: 9 },
});
