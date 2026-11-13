import { useEffect, useRef, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { Text } from "../components/GameText";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { colors, fonts } from "../theme";
import { creamSlices, food, frameImages, icons, images, kit, shopKit, skillImages, statIcons, uiImages } from "../assets";
import { EnemySprite } from "../components/EnemySprite";
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
  OUTFIT_FIRST_STRIKE,
  OUTFIT_FORCED_MANUAL,
  OUTFIT_NO_OFFLINE,
  OUTFIT_SURE_DROPS,
  OUTFIT_SKILL_POWER,
  DISH_PARTNERS,
  PARTNER_MULTIPLIER,
  describeEffect,
  describeEffectParts,
} from "../state/buffs";
import type { BuffEffect } from "../state/buffs";
import { RECIPES } from "../state/recipes";
import { LockBadge } from "../components/LockBadge";
import { getOutfitGemPrice, isOutfitUnlocked, OUTFIT_EARLY_UNLOCK_GEMS, OUTFIT_GEM_PRICE, OUTFIT_LOOP_GRANT, OUTFIT_UNLOCK_STAGE } from "../state/unlocks";
import { ConfirmModal } from "../components/ConfirmModal";
import { RewardedAdModal } from "../components/RewardedAdModal";
import { COMPANION_ATTACK_PER_LEVEL, COMPANION_MAX_LEVEL, COMPANION_SHARD_STAGE, getCompanionLevel, getCompanionShards, getShardCost, SHARD_AD_REWARD, SHARD_ADS_PER_DAY, SHARDS_PER_BOSS } from "../state/progression";
import { BOSS_NAME, getEnemyKind, getStageCode } from "../state/stages";
import type { GameState, Outfit } from "../types";
import { t } from "../i18n";

// Each entry swaps the battle sprite to that companion's art and grants whichever of these
// quirks apply for as long as it stays equipped.
function companionDetail(outfit: Outfit) {
  const parts: string[] = [];
  const buff = OUTFIT_BUFFS[outfit];
  if (buff) parts.push(describeEffect(buff));
  const missChance = OUTFIT_MISS_CHANCE[outfit];
  if (missChance) parts.push(t(`${missChance}% 확률로 공격 빗나감`, `${missChance}% chance to whiff`));
  const hitCount = OUTFIT_HIT_COUNT[outfit];
  if (hitCount) parts.push(t(`한 번에 ${hitCount}타씩 타격`, `Strikes ${hitCount} times per hit`));
  const foodDurationBonus = OUTFIT_FOOD_DURATION_BONUS_SEC[outfit];
  if (foodDurationBonus) parts.push(t(`음식 효과시간 +${foodDurationBonus}초`, `+${foodDurationBonus}s food buff duration`));
  const firstStrike = OUTFIT_FIRST_STRIKE[outfit];
  if (firstStrike)
    parts.push(t(`적마다 첫 공격은 일반 공격 ×${firstStrike} (치명타 없음)`, `First hit on each enemy is ×${firstStrike} a normal attack (no crit)`), t("수동 공격 불가", "No manual attacking"));
  if (OUTFIT_SURE_DROPS[outfit]) parts.push(t("재료 드랍 확률 100%", "100% ingredient drop rate"));
  const cooldownReduction = OUTFIT_COOLDOWN_REDUCTION_SEC[outfit];
  if (cooldownReduction) parts.push(t(`스킬 쿨타임 -${cooldownReduction / 60}분`, `Skill cooldown -${cooldownReduction / 60}min`));
  const skillPower = OUTFIT_SKILL_POWER[outfit];
  if (skillPower) parts.push(t(`스킬 효과 ×${skillPower} (기니빔 보스 피해 최대 80%)`, `Skill power ×${skillPower} (Guinea Beam up to 80% boss damage)`));
  if (OUTFIT_FORCED_MANUAL[outfit]) parts.push(t("항상 수동 전투 (탭해서 공격)", "Always manual combat (tap to attack)"));
  if (OUTFIT_NO_OFFLINE[outfit]) parts.push(t("휴식(오프라인) 중에는 사냥 안 함", "Doesn't hunt while resting (offline)"));
  return parts.length > 0 ? parts.join(" · ") : t("동료 없이 다닐 때", "Traveling without a companion");
}

// The same quirks as companionDetail, each with an icon — the companion cards lead with the
// icon and keep the words as a caption.
const EFFECT_ICONS: Partial<Record<keyof BuffEffect, number>> = {
  attack: statIcons.attack,
  criticalDamage: statIcons.criticalDamage,
  criticalChance: statIcons.criticalChance,
  gold: statIcons.goldBonus,
  attackSpeed: icons.energy,
  cookSpeed: food.cookPotTrim,
  greatSuccess: icons.star,
};

function companionEffects(outfit: Outfit): { icon: number; text: string }[] {
  const parts: { icon: number; text: string }[] = [];
  const buff = OUTFIT_BUFFS[outfit];
  if (buff) for (const part of describeEffectParts(buff)) parts.push({ icon: EFFECT_ICONS[part.key] ?? icons.star, text: part.text });
  const missChance = OUTFIT_MISS_CHANCE[outfit];
  if (missChance) parts.push({ icon: statIcons.criticalChance, text: t(`${missChance}% 빗나감`, `${missChance}% whiff`) });
  const hitCount = OUTFIT_HIT_COUNT[outfit];
  if (hitCount) parts.push({ icon: uiImages.swords, text: t(`${hitCount}연타`, `${hitCount}-hit combo`) });
  const foodDurationBonus = OUTFIT_FOOD_DURATION_BONUS_SEC[outfit];
  if (foodDurationBonus) parts.push({ icon: food.cookPotTrim, text: t(`음식 시간 +${foodDurationBonus}초`, `+${foodDurationBonus}s food duration`) });
  const firstStrike = OUTFIT_FIRST_STRIKE[outfit];
  if (firstStrike)
    parts.push({ icon: skillImages.execute, text: t(`첫 공격 ×${firstStrike}`, `First hit ×${firstStrike}`) }, { icon: skillImages.barrage, text: t("수동 공격 불가", "No manual attack") });
  if (OUTFIT_SURE_DROPS[outfit]) parts.push({ icon: icons.chest, text: t("재료 드랍 100%", "100% ingredient drop") });
  const cooldownReduction = OUTFIT_COOLDOWN_REDUCTION_SEC[outfit];
  if (cooldownReduction) parts.push({ icon: icons.energy, text: t(`쿨타임 -${cooldownReduction / 60}분`, `Cooldown -${cooldownReduction / 60}min`) });
  const skillPower = OUTFIT_SKILL_POWER[outfit];
  if (skillPower) parts.push({ icon: skillImages.beam, text: t(`스킬 효과 ×${skillPower}`, `Skill power ×${skillPower}`) });
  if (OUTFIT_FORCED_MANUAL[outfit]) parts.push({ icon: skillImages.barrage, text: t("항상 수동 전투", "Always manual combat") });
  if (OUTFIT_NO_OFFLINE[outfit]) parts.push({ icon: icons.home, text: t("휴식 중 사냥 안 함", "Doesn't hunt while resting") });
  if (outfit === "witchGini") parts.push({ icon: icons.potionBlue, text: t("모든 공격이 마법", "Every attack is magic") });
  return parts.length > 0 ? parts : [{ icon: icons.heart, text: t("동료 없이", "No companion") }];
}

// A big icon with a small caption beside it.
function IconFact({ icon, caption, children }: { icon?: number; caption: string; children?: React.ReactNode }) {
  return (
    <View style={styles.fact}>
      {children ?? <Image source={icon} style={styles.factIcon} />}
      <Text style={styles.factCaption}>{caption}</Text>
    </View>
  );
}

// `detail` isn't translated here (module-scope, evaluated once at import — baking in
// whatever language was active then) — call companionDetail(outfit) fresh at display time
// instead (see the preview panel below), which is what every other reader of this array uses.
export const COMPANIONS: { outfit: Outfit; name: string; blurb: string; detail: string }[] = [
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
  {
    outfit: "samuraiGini",
    name: "사무라이기니",
    blurb: "벚꽃 해변을 떠도는 과묵한 떠돌이 무사. 칼은 단 한 번 뽑으면 충분하다.",
    detail: companionDetail("samuraiGini"),
  },
  {
    outfit: "chefGini",
    name: "셰프기니",
    blurb: "빵집 골목 주방에서 반죽하던 요리사 기니. 국자 하나면 어떤 요리든 뚝딱이다.",
    detail: companionDetail("chefGini"),
  },
  {
    outfit: "witchGini",
    name: "마녀기니",
    blurb: "수상한 집의 마법을 연구하던 기니. 모든 공격이 마법이라, 제자리에서 불꽃·얼음·독·번개·빛·유령불 등 여러 마법을 쏘아 싸운다.",
    detail: `${companionDetail("witchGini")} · 모든 공격이 마법`,
  },
  // After 마녀기니 (36스테이지, loop 1): 복서기니 only joins once loop 2 is done.
  {
    outfit: "boxerGini",
    name: "복서기니",
    blurb: "글러브를 벗는 법이 없는 열혈 복서. 2회차를 마칠 때쯤 단련 끝에 합류한다.",
    detail: companionDetail("boxerGini"),
  },
];

// witchGini's extra " · 모든 공격이 마법" suffix on its detail (baked in above) — translated
// separately so the live companionDetail() call at display time can append it too.
const WITCH_EXTRA_DETAIL = "모든 공격이 마법";

// Dishes whose buff this companion boosts (DISH_PARTNERS), with their icons.
function PartnerDishes({ outfit, light = false }: { outfit: Outfit; light?: boolean }) {
  const dishes = RECIPES.filter((recipe) => DISH_PARTNERS[recipe.id] === outfit);
  if (dishes.length === 0) return null;
  return (
    <View style={styles.partners}>
      <Text style={[styles.partnerLabel, light && styles.partnerLabelLight]}>{t(`궁합 요리 ×${PARTNER_MULTIPLIER}`, `Paired Dish ×${PARTNER_MULTIPLIER}`)}</Text>
      {dishes.map((recipe) => (
        <View style={styles.partner} key={recipe.id}>
          <Image source={recipe.image} style={styles.partnerImage} />
          <Text style={[styles.partnerName, light && styles.partnerNameLight]}>{t(recipe.name)}</Text>
        </View>
      ))}
    </View>
  );
}

function partnerDishes(outfit: Outfit) {
  return RECIPES.filter((recipe) => DISH_PARTNERS[recipe.id] === outfit);
}

// One fact about a companion on a soft cream plate: a small label over its value.
function InfoTile({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Panel slice={creamSlices.cell} scale={0.2} style={styles.tile}>
      <Text style={styles.tileLabel}>{label}</Text>
      <View style={styles.tileFacts}>{children}</View>
    </Panel>
  );
}

// Puffs of smoke around the preview while the companion swaps outfits, then a little pop.
const PUFFS = [
  { x: -30, y: -10 },
  { x: 28, y: -18 },
  { x: -18, y: 26 },
  { x: 24, y: 20 },
  { x: 0, y: -34 },
];

function OutfitSwap({ animate, children }: { animate: boolean; children: React.ReactNode }) {
  const pop = useSharedValue(animate ? 0 : 1);
  useEffect(() => {
    if (animate) pop.value = withDelay(180, withSequence(withTiming(1.15, { duration: 180, easing: Easing.out(Easing.quad) }), withTiming(1, { duration: 140 })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: Math.min(1, pop.value * 2), transform: [{ scale: pop.value }] }));
  return (
    <View style={styles.swap}>
      {animate && PUFFS.map((puff, index) => <SmokePuff key={index} {...puff} />)}
      <Animated.View style={style}>{children}</Animated.View>
    </View>
  );
}

function SmokePuff({ x, y }: { x: number; y: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withTiming(1, { duration: 650, easing: Easing.out(Easing.quad) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({
    opacity: (1 - t.value) * 0.9,
    transform: [{ translateX: x * t.value }, { translateY: y * t.value }, { scale: 0.5 + t.value * 1.1 }],
  }));
  return <Animated.View style={[styles.puff, style]} pointerEvents="none" />;
}

// The padlock of a newly joined companion jumps, spins off and fades away.
function BreakingLock() {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(350, withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({
    opacity: 1 - t.value,
    transform: [{ translateY: -t.value * 26 + t.value * t.value * 30 }, { translateX: t.value * 14 }, { rotate: `${t.value * 200}deg` }, { scale: 1 + t.value * 0.3 }],
  }));
  return (
    <Animated.View style={[styles.breaking, style]} pointerEvents="none">
      <LockBadge />
    </Animated.View>
  );
}

const PREVIEW_SPRITE_SIZE = 108;
// Height / width of the battle backgrounds (1168x880).
const BACKDROP_ASPECT = 880 / 1168;

// How a still-locked companion joins, for its ??? card.
function unlockCondition(outfit: Outfit) {
  const gemOnlyPrice = OUTFIT_GEM_PRICE[outfit];
  const loopGrant = OUTFIT_LOOP_GRANT[outfit];
  if (gemOnlyPrice !== undefined) {
    return loopGrant !== undefined
      ? t(`보석 ${gemOnlyPrice}개로 해금 · ${loopGrant}회차 완료 시 무료 합류`, `Unlock for ${gemOnlyPrice} gems · joins free after loop ${loopGrant}`)
      : t(`보석 ${gemOnlyPrice}개로 해금`, `Unlock for ${gemOnlyPrice} gems`);
  }
  if (loopGrant !== undefined) return t(`${loopGrant}회차 완료 시 합류`, `Joins after loop ${loopGrant}`);
  return t(
    `${OUTFIT_UNLOCK_STAGE[outfit]}스테이지 도달 시 합류 · 보석 ${OUTFIT_EARLY_UNLOCK_GEMS}개로 미리 해금`,
    `Joins on reaching stage ${OUTFIT_UNLOCK_STAGE[outfit]} · unlock early for ${OUTFIT_EARLY_UNLOCK_GEMS} gems`,
  );
}

export function getCompanionName(outfit: Outfit) {
  const name = COMPANIONS.find((item) => item.outfit === outfit)?.name;
  return name ? t(name) : outfit;
}

export function CompanionsScreen({
  equippedOutfit,
  highestStageNumber,
  onEquip,
  outfitsSeen,
  onSeen,
  gems,
  purchasedOutfits,
  onPurchase,
  onOpenShop,
  progress,
  onUpgrade,
  shardAdsLeft,
  onClaimShardAd,
}: {
  // 동료 승급 (state/progression.ts).
  progress: Pick<GameState, "companionLevels" | "companionShards">;
  onUpgrade: (outfit: Outfit) => void;
  shardAdsLeft: number;
  onClaimShardAd: () => void;
  equippedOutfit: Outfit;
  // Furthest stage reached (0-based) — companions join on arriving at their stage.
  highestStageNumber: number;
  onEquip: (outfit: Outfit) => void;
  // Companions shown unlocked last visit (undefined = never tracked), and the report on leaving.
  outfitsSeen: Outfit[] | undefined;
  onSeen: (outfits: Outfit[]) => void;
  // For gem-bought companions — any stage one unlocked early (OUTFIT_EARLY_UNLOCK_GEMS).
  gems: number;
  purchasedOutfits: Outfit[] | undefined;
  onPurchase: (outfit: Outfit) => void;
  onOpenShop: () => void;
}) {
  const equippedItem = COMPANIONS.find((item) => item.outfit === equippedOutfit) ?? COMPANIONS[0];
  const [previewWidth, setPreviewWidth] = useState(0);
  // A locked companion whose gem button was tapped: confirm before spending.
  const [buying, setBuying] = useState<Outfit | null>(null);
  const [shardAdOpen, setShardAdOpen] = useState(false);
  const unlockedNow = COMPANIONS.filter((item) => isOutfitUnlocked(item.outfit, highestStageNumber, purchasedOutfits)).map((item) => item.outfit);
  // Unlocked since the last visit: their padlock breaks open this time.
  const [freshlyUnlocked] = useState(() => (outfitsSeen ? unlockedNow.filter((outfit) => !outfitsSeen.includes(outfit)) : []));
  const [outfitOnArrival] = useState(equippedOutfit);
  const latest = useRef({ unlockedNow, onSeen });
  useEffect(() => {
    latest.current = { unlockedNow, onSeen };
  });
  useEffect(() => () => latest.current.onSeen(latest.current.unlockedNow), []);

  return (
    <View style={styles.page}>
      <PageHeading kicker="FRIENDS" title={t("동료", "Companions")} description={t("혼자보다 덜 쓸쓸하고, 조금 더 세다.", "Less lonely than alone, and a little stronger.")} />

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
            <Text style={styles.previewLabel}>{t("함께하는 중", "Traveling With")}</Text>
            <Text style={styles.previewTitle}>{t(equippedItem.name)}</Text>
            <Text style={styles.previewBlurb}>{t(equippedItem.blurb)}</Text>
            <Text style={styles.previewSub}>
              {equippedItem.outfit === "witchGini" ? `${companionDetail(equippedItem.outfit)} · ${t(WITCH_EXTRA_DETAIL, "Every attack is magic")}` : companionDetail(equippedItem.outfit)}
            </Text>
            <PartnerDishes outfit={equippedItem.outfit} light />
          </View>
          <View style={styles.previewSprite}>
            <OutfitSwap key={equippedOutfit} animate={equippedOutfit !== outfitOnArrival}>
              <CharacterSprite outfit={equippedOutfit} animation="idle" size={PREVIEW_SPRITE_SIZE} restartKey={equippedOutfit} />
            </OutfitSwap>
          </View>
        </View>
      </Panel>

      <Text style={styles.shardHint}>
        {t(`동료마다 전담 보스가 있어요. 그 보스를 쓰러뜨리면 조각 ${SHARDS_PER_BOSS}개를 얻어요.`, `Each companion has its own boss — defeat it for ${SHARDS_PER_BOSS} shards.`)}
      </Text>
      <GameButton
        variant={shardAdsLeft > 0 ? "green" : "gray"}
        disabled={shardAdsLeft === 0}
        onPress={() => setShardAdOpen(true)}
        style={styles.shardAdButton}
        textStyle={styles.equipButtonText}
      >
        {t(
          `광고 보고 ${equippedItem.name} 조각 +${SHARD_AD_REWARD} (오늘 ${shardAdsLeft}/${SHARD_ADS_PER_DAY})`,
          `Watch an ad for +${SHARD_AD_REWARD} ${t(equippedItem.name)} shards (${shardAdsLeft}/${SHARD_ADS_PER_DAY} today)`,
        )}
      </GameButton>

      <View style={styles.list}>
        {COMPANIONS.map((item) => {
          const equipped = item.outfit === equippedOutfit;
          const unlockStage = OUTFIT_UNLOCK_STAGE[item.outfit];
          const gemPrice = getOutfitGemPrice(item.outfit);
          const loopGrant = OUTFIT_LOOP_GRANT[item.outfit];
          const locked = !equipped && !isOutfitUnlocked(item.outfit, highestStageNumber, purchasedOutfits);
          const affordable = gemPrice !== undefined && gems >= gemPrice;
          const level = getCompanionLevel(progress, item.outfit);
          const shards = getCompanionShards(progress, item.outfit);
          const shardCost = getShardCost(level);
          const maxed = level >= COMPANION_MAX_LEVEL;
          const canUpgrade = !locked && !maxed && shards >= shardCost;
          return (
            <Panel slice={equipped ? kit.panel : kit.inset} style={styles.card} key={item.outfit}>
              <View style={styles.cardHead}>
              <View>
                {/* Portrait in a wood ring (gold for the one along now). A locked companion
                    is just a black silhouette — no name, no blurb, no effects; when it joins
                    is on its button instead. */}
                <View style={styles.avatar}>
                  <Image source={equipped ? frameImages.ringGold : frameImages.ringWood} style={styles.avatarRing} />
                  <View style={styles.avatarInner}>
                    <CharacterSprite outfit={item.outfit} animation="idle" size={46} restartKey={item.outfit} tintColor={locked ? "#000" : undefined} />
                  </View>
                </View>
                {freshlyUnlocked.includes(item.outfit) && <BreakingLock />}
              </View>
              <View style={styles.cardCopy}>
                {!locked && <Text style={styles.cardSmall}>{equipped ? t("함께하는 중", "Traveling With") : t("같이 다닐 수 있음", "Available")}</Text>}
                <Text style={styles.cardStrong}>{locked ? "???" : t(item.name)}</Text>
                {locked ? (
                  // The one thing a locked companion does say: how to get it.
                  <Text style={styles.cardBlurb}>{unlockCondition(item.outfit)}</Text>
                ) : (
                  <Text style={styles.cardBlurb}>{t(item.blurb)}</Text>
                )}
              </View>
              {locked && gemPrice !== undefined ? (
                // Short of gems: just greyed out (no detour to the shop).
                <GameButton
                  variant={affordable ? "beige" : "gray"}
                  disabled={!affordable}
                  onPress={() => setBuying(item.outfit)}
                  style={styles.equipButton}
                  textStyle={styles.equipButtonText}
                  accessibilityLabel={t(`보석 ${gemPrice}개로 동료 열기`, `Unlock companion for ${gemPrice} gems`)}
                >
                  <View style={styles.gemCost}>
                    <Image source={uiImages.crystal} style={styles.gemIcon} />
                    <Text style={[styles.gemButtonText, !affordable && styles.gemButtonTextOff]}>{t(`${gemPrice}개로 열기`, `Unlock for ${gemPrice}`)}</Text>
                  </View>
                </GameButton>
              ) : (
                <GameButton
                  variant={equipped ? "green" : locked ? "gray" : "beige"}
                  disabled={locked}
                  onPress={() => onEquip(item.outfit)}
                  style={styles.equipButton}
                  textStyle={styles.equipButtonText}
                >
                  {equipped
                    ? t("함께 중", "Traveling")
                    : locked
                      ? loopGrant !== undefined
                        ? t(`${loopGrant}회차 완료`, `Loop ${loopGrant} Complete`)
                        : t(`${unlockStage}스테이지`, `Stage ${unlockStage}`)
                      : t("함께하기", "Travel Together")}
                </GameButton>
              )}
              </View>
              {/* What the companion does, as little cards rather than lines of text — kept
                  hidden until it joins. */}
              {!locked && <View style={styles.tiles}>
                <InfoTile label={t("적용 효과", "Effects")}>
                  {companionEffects(item.outfit).map((effect) => (
                    <IconFact key={effect.text} icon={effect.icon} caption={effect.text} />
                  ))}
                </InfoTile>
                {partnerDishes(item.outfit).length > 0 && (
                  <InfoTile label={t(`궁합 요리 ×${PARTNER_MULTIPLIER}`, `Paired Dish ×${PARTNER_MULTIPLIER}`)}>
                    {partnerDishes(item.outfit).map((recipe) => (
                      <IconFact key={recipe.id} icon={recipe.image} caption={t(recipe.name)} />
                    ))}
                  </InfoTile>
                )}
                <InfoTile label={t("조각 획득", "Get Shards")}>
                  <IconFact
                    caption={t(
                      `${BOSS_NAME[getEnemyKind(COMPANION_SHARD_STAGE[item.outfit])]}\n${getStageCode(COMPANION_SHARD_STAGE[item.outfit])}스테이지 보스`,
                      `${t(BOSS_NAME[getEnemyKind(COMPANION_SHARD_STAGE[item.outfit])])}\nStage ${getStageCode(COMPANION_SHARD_STAGE[item.outfit])} Boss`,
                    )}
                  >
                    <View style={styles.factSprite}>
                      <EnemySprite boss kind={getEnemyKind(COMPANION_SHARD_STAGE[item.outfit])} animation="idle" size={44} restartKey={`shard-${item.outfit}`} />
                    </View>
                  </IconFact>
                </InfoTile>
                <InfoTile label={t(`레벨 ${level}${maxed ? " · 최고" : ""}`, `Level ${level}${maxed ? " · Max" : ""}`)}>
                  <IconFact
                    icon={statIcons.attack}
                    caption={t(
                      `공격력 +${level * COMPANION_ATTACK_PER_LEVEL}%${maxed ? "" : `\n조각 ${shards}/${shardCost}`}`,
                      `Attack +${level * COMPANION_ATTACK_PER_LEVEL}%${maxed ? "" : `\nShards ${shards}/${shardCost}`}`,
                    )}
                  />
                  {canUpgrade && (
                    <GameButton variant="green" onPress={() => onUpgrade(item.outfit)} style={styles.upgradeButton} textStyle={styles.equipButtonText} accessibilityLabel={t(`${item.name} 승급`, `Upgrade ${t(item.name)}`)}>
                      {t("승급", "Upgrade")}
                    </GameButton>
                  )}
                </InfoTile>
              </View>}
            </Panel>
          );
        })}
      </View>
      {shardAdOpen && (
        <RewardedAdModal
          message={t(`지금은 광고가 없네요. 그래도 조각 ${SHARD_AD_REWARD}개를 챙겨드릴게요.`, `No ad available right now. We'll still give you ${SHARD_AD_REWARD} shards.`)}
          claimLabel={t(`조각 ${SHARD_AD_REWARD}개 받기`, `Claim ${SHARD_AD_REWARD} Shards`)}
          onClaim={() => {
            onClaimShardAd();
            setShardAdOpen(false);
          }}
          onCancel={() => setShardAdOpen(false)}
        />
      )}
      {buying && (() => {
        const price = getOutfitGemPrice(buying) ?? 0;
        const gemOnly = buying in OUTFIT_GEM_PRICE;
        return (
          <ConfirmModal
            // Still locked, so the name stays hidden here too.
            title={t("??? 데려오기", "Bring Along ???")}
            message={
              gemOnly
                ? t(`보석 ${price}개로 이 동료를 데려올까요?`, `Bring this companion along for ${price} gems?`)
                : t(
                    `보석 ${price}개로 이 동료를 지금 바로 데려올까요? (${OUTFIT_UNLOCK_STAGE[buying]}스테이지에 도착하면 무료로 합류해요)`,
                    `Bring this companion along right now for ${price} gems? (It joins free on reaching stage ${OUTFIT_UNLOCK_STAGE[buying]})`,
                  )
            }
            confirmLabel={t(`보석 ${price}개 쓰기`, `Spend ${price} Gems`)}
            onConfirm={() => {
              onPurchase(buying);
              setBuying(null);
            }}
            onCancel={() => setBuying(null)}
          />
        );
      })()}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: "#e8dcc4", paddingHorizontal: 16, paddingTop: 20, paddingBottom: 25 },
  previewFrame: { padding: 11, marginBottom: 12 },
  preview: { height: 170, flexDirection: "row", alignItems: "center", overflow: "hidden", borderRadius: 4 },
  // Pinned to the bottom so the forest floor sits under the companion's feet.
  previewBackdrop: { position: "absolute", left: 0, bottom: -10 },
  previewScrim: { position: "absolute", top: 0, left: 0, bottom: 0, right: 0 },
  // Copy takes the left part; the companion gets the rest and is centred inside it.
  previewCopy: { width: "58%", paddingLeft: 16, paddingRight: 4 },
  previewLabel: { color: "#d7dfab", fontSize: 12, fontWeight: "900", fontFamily: fonts.bold, letterSpacing: 1.5 },
  previewTitle: { marginTop: 4, fontSize: 22, fontWeight: "800", fontFamily: fonts.bold, color: colors.cream },
  previewBlurb: { fontFamily: fonts.light, letterSpacing: -0.36, marginTop: 4, color: "#efe7d4", fontSize: 12, fontStyle: "italic", lineHeight: 16 },
  previewSub: { marginTop: 5, color: "#f3d993", fontSize: 12, fontWeight: "800", fontFamily: fonts.bold },
  previewSprite: { flex: 1, alignSelf: "stretch", alignItems: "center", justifyContent: "center" },
  list: { gap: 8 },
  shardHint: { marginBottom: 6, fontFamily: fonts.light, letterSpacing: -0.36, fontSize: 12, lineHeight: 16, color: colors.brown, textAlign: "center" },
  shardAdButton: { marginBottom: 12 },
  upgradeButton: { alignSelf: "flex-start", minWidth: 56 },
  swap: { alignItems: "center", justifyContent: "center" },
  puff: { position: "absolute", width: 36, height: 36, borderRadius: 18, backgroundColor: "#f3eee2" },
  breaking: { position: "absolute", right: 0, bottom: 0, width: 24, height: 24 },
  partners: { marginTop: 4, flexDirection: "row", flexWrap: "wrap", alignItems: "center", columnGap: 6, rowGap: 2 },
  partnerLabel: { fontSize: 12, fontWeight: "900", fontFamily: fonts.bold, color: "#b0632a" },
  partnerLabelLight: { color: "#f3d993" },
  partner: { flexDirection: "row", alignItems: "center", gap: 2 },
  partnerImage: { width: 16, height: 16 },
  partnerName: { fontSize: 12, fontWeight: "800", fontFamily: fonts.bold, color: colors.brown },
  partnerNameLight: { color: "#efe7d4" },
  card: { paddingHorizontal: 16, paddingTop: 15, paddingBottom: 15, gap: 10 },
  cardHead: { flexDirection: "row", alignItems: "center", gap: 10 },
  tiles: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  // Two per row; an odd one out stretches across.
  tile: { flexBasis: "45%", flexGrow: 1, paddingHorizontal: 10, paddingTop: 7, paddingBottom: 9 },
  tileLabel: { fontSize: 12, fontWeight: "800", fontFamily: fonts.bold, color: "#b0632a" },
  tileFacts: { marginTop: 5, gap: 6 },
  // Icon first, its caption to the right.
  fact: { flexDirection: "row", alignItems: "center", gap: 6 },
  factIcon: { width: 34, height: 34, resizeMode: "contain" },
  factSprite: { width: 40, height: 40, alignItems: "center", justifyContent: "flex-end", overflow: "hidden" },
  factCaption: { flexShrink: 1, fontFamily: fonts.light, letterSpacing: -0.36, fontSize: 12, lineHeight: 15, color: colors.brown },
  // ring-wood.png's opening is ~55% of its width; the face is clipped to that circle.
  avatar: { width: 66, height: 66, alignItems: "center", justifyContent: "center" },
  avatarRing: { position: "absolute", left: 0, top: 0, width: 66, height: 66 },
  avatarInner: { width: 37, height: 37, borderRadius: 18.5, overflow: "hidden", alignItems: "center", justifyContent: "center" },
  avatarGem: { width: 24, height: 24, resizeMode: "contain" },
  avatarStage: { fontSize: 16, lineHeight: 18, fontWeight: "900", fontFamily: fonts.bold, color: colors.brown },
  // Squeezed inside the ring's opening — one of the few labels kept under 12pt.
  avatarStageLabel: { fontSize: 8, lineHeight: 9, fontWeight: "800", fontFamily: fonts.bold, color: colors.muted },
  cardCopy: { flex: 1 },
  cardSmall: { color: colors.green, fontSize: 12, fontWeight: "900", fontFamily: fonts.bold },
  cardStrong: { marginVertical: 2, fontSize: 14, fontWeight: "800", fontFamily: fonts.bold, color: colors.ink },
  cardBlurb: { fontFamily: fonts.light, letterSpacing: -0.36, color: colors.muted, fontSize: 12, lineHeight: 16, fontStyle: "italic", marginBottom: 2 },
  equipButton: { minWidth: 70 },
  equipButtonText: { fontSize: 12 },
  gemButtonText: { fontSize: 12, fontWeight: "900", fontFamily: fonts.bold, color: colors.ink },
  gemButtonTextOff: { color: "#4f463c" },
  gemCost: { flexDirection: "row", alignItems: "center", gap: 3 },
  gemIcon: { width: 12, height: 12, resizeMode: "contain" },
});
