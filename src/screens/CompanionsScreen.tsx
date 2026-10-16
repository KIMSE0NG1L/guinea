import { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, fonts } from "../theme";
import { images, kit, shopKit } from "../assets";
import { Panel } from "../components/NineSlice";
import { PageHeading } from "../components/PageHeading";
import { GameButton } from "../components/GameButton";
import { CharacterSprite } from "../components/CharacterSprite";
import {
  OUTFIT_BUFFS,
  OUTFIT_COOLDOWN_REDUCTION_SEC,
  OUTFIT_FOOD_DURATION_BONUS_SEC,
  OUTFIT_HIT_COUNT,
  OUTFIT_MISS_CHANCE,
  describeEffect,
} from "../state/buffs";
import { LockBadge } from "../components/LockBadge";
import { isOutfitUnlocked, OUTFIT_UNLOCK_LEVEL } from "../state/unlocks";
import type { Outfit } from "../types";

// Each entry swaps the battle sprite to that companion's art and grants whichever of these
// quirks apply for as long as it stays equipped.
function companionDetail(outfit: Outfit) {
  const parts: string[] = [];
  const buff = OUTFIT_BUFFS[outfit];
  if (buff) parts.push(describeEffect(buff));
  const missChance = OUTFIT_MISS_CHANCE[outfit];
  if (missChance) parts.push(`${missChance}% 확률로 공격 빗나감`);
  const hitCount = OUTFIT_HIT_COUNT[outfit];
  if (hitCount) parts.push(`한 번에 ${hitCount}타씩 타격`);
  const foodDurationBonus = OUTFIT_FOOD_DURATION_BONUS_SEC[outfit];
  if (foodDurationBonus) parts.push(`음식 효과시간 +${foodDurationBonus}초`);
  const cooldownReduction = OUTFIT_COOLDOWN_REDUCTION_SEC[outfit];
  if (cooldownReduction) parts.push(`스킬 쿨타임 -${cooldownReduction / 60}분`);
  return parts.length > 0 ? parts.join(" · ") : "동료 없이 다닐 때";
}

const COMPANIONS: { outfit: Outfit; name: string; blurb: string; detail: string }[] = [
  { outfit: "default", name: "모험기니", blurb: "건초에 지쳐 새로운 끼니를 찾아 세상을 모험하는 기니.", detail: companionDetail("default") },
  {
    outfit: "explorerHamster",
    name: "탐험기니",
    blurb: "전설의 당근을 찾아 세상을 탐험하는 호기심 많은 기니.",
    detail: companionDetail("explorerHamster"),
  },
  {
    outfit: "tetoGini",
    name: "테토기니",
    blurb: "멋을 위해 선글라스를 쓴 헬창 기니. 하지만 어두워서 가끔 헛스윙을 한다.",
    detail: companionDetail("tetoGini"),
  },
  {
    outfit: "assassinGini",
    name: "암살기니",
    blurb: "두건으로 얼굴을 가리고 단검을 숨긴 그림자 속의 자객.",
    detail: companionDetail("assassinGini"),
  },
  {
    outfit: "egenGini",
    name: "에겐기니",
    blurb: "벚꽃 지팡이를 든 다정하고 상냥한 기니. 함께 있으면 마음이 편안해진다.",
    detail: companionDetail("egenGini"),
  },
];

const PREVIEW_SPRITE_SIZE = 108;
// Height / width of the battle backgrounds (1168x880).
const BACKDROP_ASPECT = 880 / 1168;

export function getCompanionName(outfit: Outfit) {
  return COMPANIONS.find((item) => item.outfit === outfit)?.name ?? outfit;
}

export function CompanionsScreen({
  equippedOutfit,
  level,
  onEquip,
}: {
  equippedOutfit: Outfit;
  level: number;
  onEquip: (outfit: Outfit) => void;
}) {
  const equippedItem = COMPANIONS.find((item) => item.outfit === equippedOutfit) ?? COMPANIONS[0];
  const [previewWidth, setPreviewWidth] = useState(0);

  return (
    <View style={styles.page}>
      <PageHeading kicker="FRIENDS" title="동료" description="혼자보다 덜 쓸쓸하고, 조금 더 세다." />

      {/* Wooden frame around a slice of the forest stage, with the companion standing on its
          ground and a dark scrim behind the copy that fades out toward the right. */}
      <Panel slice={shopKit.frameWide} scale={0.32} style={styles.previewFrame}>
        <View style={styles.preview} onLayout={(event) => setPreviewWidth(event.nativeEvent.layout.width)}>
          {previewWidth > 0 && (
            <Image
              source={images.battleBackground}
              resizeMode="stretch"
              style={[styles.previewBackdrop, { width: previewWidth, height: previewWidth * BACKDROP_ASPECT }]}
            />
          )}
          <LinearGradient
            colors={["#14100ce6", "#14100cb3", "#14100c00"]}
            locations={[0, 0.45, 0.78]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.previewScrim}
            pointerEvents="none"
          />
          <View style={styles.previewCopy}>
            <Text style={styles.previewLabel}>함께하는 중</Text>
            <Text style={styles.previewTitle}>{equippedItem.name}</Text>
            <Text style={styles.previewBlurb}>{equippedItem.blurb}</Text>
            <Text style={styles.previewSub}>{equippedItem.detail}</Text>
          </View>
          <View style={styles.previewSprite}>
            <CharacterSprite outfit={equippedOutfit} animation="idle" size={PREVIEW_SPRITE_SIZE} restartKey={equippedOutfit} />
          </View>
        </View>
      </Panel>

      <View style={styles.list}>
        {COMPANIONS.map((item) => {
          const equipped = item.outfit === equippedOutfit;
          const unlockLevel = OUTFIT_UNLOCK_LEVEL[item.outfit];
          const locked = !equipped && !isOutfitUnlocked(item.outfit, level);
          return (
            <Panel slice={equipped ? kit.panel : kit.inset} style={styles.card} key={item.outfit}>
              <View>
                <View style={[styles.avatar, locked && styles.avatarLocked]}>
                  <View style={locked && styles.dimmed}>
                    <CharacterSprite outfit={item.outfit} animation="idle" size={46} restartKey={item.outfit} />
                  </View>
                </View>
                {locked && <LockBadge />}
              </View>
              <View style={styles.cardCopy}>
                <Text style={[styles.cardSmall, locked && styles.cardSmallLocked]}>
                  {equipped ? "함께하는 중" : locked ? `Lv.${unlockLevel}에 합류` : "같이 다닐 수 있음"}
                </Text>
                <Text style={styles.cardStrong}>{item.name}</Text>
                <Text style={styles.cardBlurb}>{item.blurb}</Text>
                <Text style={styles.cardSpan}>{item.detail}</Text>
              </View>
              <GameButton
                variant={equipped ? "green" : locked ? "gray" : "beige"}
                disabled={locked}
                onPress={() => onEquip(item.outfit)}
                style={styles.equipButton}
                textStyle={styles.equipButtonText}
              >
                {equipped ? "함께 중" : locked ? `Lv.${unlockLevel}` : "함께하기"}
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
  previewFrame: { padding: 11, marginBottom: 12 },
  preview: { height: 170, flexDirection: "row", alignItems: "center", overflow: "hidden", borderRadius: 4 },
  // Pinned to the bottom so the forest floor sits under the companion's feet.
  previewBackdrop: { position: "absolute", left: 0, bottom: -10 },
  previewScrim: { position: "absolute", top: 0, left: 0, bottom: 0, right: 0 },
  // Copy takes the left part; the companion gets the rest and is centred inside it.
  previewCopy: { width: "58%", paddingLeft: 16, paddingRight: 4 },
  previewLabel: { color: "#d7dfab", fontSize: 9, fontWeight: "900", fontFamily: fonts.bold, letterSpacing: 1.5 },
  previewTitle: { marginTop: 4, fontSize: 18, fontWeight: "800", fontFamily: fonts.bold, color: colors.cream },
  previewBlurb: { marginTop: 4, color: "#efe7d4", fontSize: 9, fontStyle: "italic", lineHeight: 13 },
  previewSub: { marginTop: 5, color: "#f3d993", fontSize: 9, fontWeight: "800", fontFamily: fonts.bold },
  previewSprite: { flex: 1, alignSelf: "stretch", alignItems: "center", justifyContent: "center" },
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
  avatarLocked: { backgroundColor: "#d9cfb9" },
  dimmed: { opacity: 0.35 },
  cardSmallLocked: { color: colors.red },
  cardCopy: { flex: 1 },
  cardSmall: { color: colors.green, fontSize: 8, fontWeight: "900", fontFamily: fonts.bold },
  cardStrong: { marginVertical: 2, fontSize: 12, fontWeight: "800", fontFamily: fonts.bold, color: colors.ink },
  cardBlurb: { color: colors.muted, fontSize: 8, fontStyle: "italic", marginBottom: 2 },
  cardSpan: { color: colors.muted, fontSize: 8 },
  equipButton: { minWidth: 70 },
  equipButtonText: { fontSize: 9 },
});
