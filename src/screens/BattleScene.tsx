import { useEffect } from "react";
import { Image, ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming, Easing } from "react-native-reanimated";
import { colors, fonts } from "../theme";
import { icons, images } from "../assets";
import { CharacterSprite } from "../components/CharacterSprite";
import { EnemySprite } from "../components/EnemySprite";
import { DamageNumber } from "../components/DamageNumber";
import { CoinPopup } from "../components/CoinPopup";
import { StageAdvanceBanner } from "../components/StageAdvanceBanner";
import { formatGameNumber } from "../state/gameMath";
import { BOSS_NAME, ENEMY_NAME } from "../state/stages";
import type { BattlePhase, EnemyAnimation, EnemyKind, Outfit, PlayerAnimation } from "../types";

// Each boss art source fills a different fraction of its 160px frame (the original
// boss-slime asset nearly fills it edge to edge; the mushroom/potato ones were cropped
// with more headroom), so a flat displaySize makes them wildly inconsistent in size —
// scale each down to read as roughly the same on-screen height.
const BOSS_SIZE: Record<EnemyKind, number> = {
  slime: 128,
  mushroom: 180,
  carrot: 180,
};

const BACKGROUND: Record<EnemyKind, number> = {
  slime: images.battleBackground,
  mushroom: images.battleBackgroundMushroom,
  carrot: images.battleBackgroundFarm,
};

export function BattleScene({
  critical,
  damageEvents,
  enemyHp,
  enemyMaxHp,
  boss,
  enemyKind,
  phase,
  enemyId,
  lastGoldReward,
  stageAdvance,
  stageLabel,
  stageProgress,
  outfit,
  manualEnabled,
  onManualAttack,
  onOpenMap,
}: {
  critical: boolean;
  damageEvents: { id: number; amount: number; critical: boolean }[];
  enemyHp: number;
  enemyMaxHp: number;
  boss: boolean;
  enemyKind: EnemyKind;
  phase: BattlePhase;
  enemyId: number;
  lastGoldReward: number;
  stageAdvance: string | null;
  stageLabel: string;
  stageProgress: number;
  outfit: Outfit;
  manualEnabled: boolean;
  onManualAttack: () => void;
  onOpenMap: () => void;
}) {
  const playerAnimation: PlayerAnimation =
    phase === "attacking"
      ? critical ? "critical" : "attack"
      : phase === "hit" && critical
        ? "critical"
        : phase === "defeated"
          ? "win"
          : "idle";

  const enemyAnimation: EnemyAnimation =
    phase === "hit" ? "hit" : phase === "defeated" ? "die" : "idle";
  const enemySize = boss ? BOSS_SIZE[enemyKind] : 108;

  return (
    <View style={styles.scene}>
      <Pressable onPress={manualEnabled ? onManualAttack : undefined} disabled={!manualEnabled}>
        <ImageBackground source={BACKGROUND[enemyKind]} resizeMode="cover" style={styles.sky} imageStyle={styles.skyImage}>
          <LinearGradient
            colors={["#17321b1f", "#17291400", "#17291424"]}
            locations={[0, 0.42, 1]}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />

          <LinearGradient
            colors={["#171d19e8", "#263125a8", "#26312500"]}
            locations={[0, 0.62, 1]}
            style={styles.stageBar}
            pointerEvents="none"
          >
            <Text style={styles.stageBarTitle}>{stageLabel}</Text>
            <View style={styles.stageBarTrack}>
              <View style={[styles.stageBarFill, { width: `${stageProgress}%` }]} />
            </View>
            <Text style={styles.stageBarCount}>{Math.floor(stageProgress / 10)} / 10</Text>
          </LinearGradient>

          {stageAdvance && <StageAdvanceBanner key={stageAdvance} stageLabel={stageAdvance} />}

          <View style={styles.fighters}>
            <PlayerFighter animation={playerAnimation} outfit={outfit} boss={boss} />

            <EnemyFighter
              animation={enemyAnimation}
              boss={boss}
              enemyKind={enemyKind}
              enemyId={enemyId}
              currentHp={enemyHp}
              maxHp={enemyMaxHp}
              phase={phase}
              size={enemySize}
            />

            {/* Kept below the enemy nameplate (fixed at bottom: 112) so numbers never cover
                the name or HP bar — they float up over the sprite's body instead. */}
            <View style={styles.effects} pointerEvents="none">
              {damageEvents.map((event) => (
                <DamageNumber key={event.id} amount={event.amount} critical={event.critical} />
              ))}
              {phase === "defeated" && <CoinPopup key={`coin-${enemyId}`} amount={lastGoldReward} />}
            </View>
          </View>

          <Pressable
            onPress={onOpenMap}
            accessibilityRole="button"
            accessibilityLabel="마일스톤 지도 열기"
            hitSlop={8}
            style={({ pressed }) => [styles.mapButton, pressed && styles.mapButtonPressed]}
          >
            <Image source={icons.map} style={styles.mapIcon} />
          </Pressable>
        </ImageBackground>
      </Pressable>
    </View>
  );
}

function PlayerFighter({ animation, outfit, boss }: { animation: PlayerAnimation; outfit: Outfit; boss: boolean }) {
  const isAttacking = animation === "attack" || animation === "critical";
  const shake = useSharedValue(0);
  const lunge = useSharedValue(0);

  useEffect(() => {
    if (isAttacking) {
      shake.value = withSequence(withTiming(1, { duration: 130, easing: Easing.inOut(Easing.quad) }), withTiming(0, { duration: 130, easing: Easing.inOut(Easing.quad) }));
    }
    if (animation === "critical") {
      lunge.value = withSequence(withTiming(1, { duration: 260, easing: Easing.inOut(Easing.quad) }), withTiming(0, { duration: 260, easing: Easing.inOut(Easing.quad) }));
    } else {
      lunge.value = 0;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animation]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: shake.value * 24 + lunge.value * 112 },
      { rotate: `${shake.value * 4}deg` },
      { scale: 1 + lunge.value * 0.05 },
    ],
  }));

  return (
    <Animated.View style={[styles.characterWrap, style]}>
      <View style={styles.unitLabel}>
        <Text style={styles.unitLabelText}>기니</Text>
      </View>
      <CharacterSprite
        outfit={outfit}
        animation={animation}
        repeat={animation === "win" && boss ? 3 : 1}
        restartKey={`${outfit}-${animation}`}
      />
    </Animated.View>
  );
}

function EnemyFighter({
  animation,
  boss,
  enemyKind,
  enemyId,
  currentHp,
  maxHp,
  phase,
  size,
}: {
  animation: EnemyAnimation;
  boss: boolean;
  enemyKind: EnemyKind;
  enemyId: number;
  currentHp: number;
  maxHp: number;
  phase: BattlePhase;
  size: number;
}) {
  const shake = useSharedValue(0);
  const defeat = useSharedValue(0);
  const enter = useSharedValue(phase === "entering" ? 0 : 1);

  useEffect(() => {
    if (phase === "hit") {
      shake.value = withSequence(withTiming(1, { duration: 160 }), withTiming(0, { duration: 160 }));
    }
    if (phase === "defeated") {
      defeat.value = withTiming(1, { duration: 620, easing: Easing.in(Easing.quad) });
    } else {
      defeat.value = 0;
    }
    if (phase === "entering") {
      enter.value = 0;
      enter.value = withTiming(1, { duration: 220, easing: Easing.out(Easing.quad) });
    } else if (phase === "idle") {
      enter.value = 1;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const style = useAnimatedStyle(() => ({
    opacity: (1 - defeat.value) * (0.4 + enter.value * 0.6),
    transform: [
      { translateX: shake.value * 7 - defeat.value * -7 + (1 - enter.value) * 35 },
      { translateY: defeat.value * 30 },
      { rotate: `${shake.value * 5 + defeat.value * 18}deg` },
      { scale: 1 - defeat.value * 0.65 + (1 - enter.value) * -0.4 },
    ],
  }));

  return (
    <Animated.View style={[styles.characterWrap, style]}>
      {/* Fixed position regardless of sprite size, so the boss's HP bar lines up with a
          regular mob's — the (much taller) boss sprite grows upward behind it instead. */}
      <View style={[styles.unitLabel, styles.enemyNameplate, styles.enemyNameplateFixed, boss && styles.enemyNameplateBoss]}>
        <Text style={styles.unitLabelText}>{boss ? BOSS_NAME[enemyKind] : `${ENEMY_NAME[enemyKind]} ${enemyId}`}</Text>
        <View style={styles.unitHealthTrack}>
          <View style={[styles.unitHealthFill, { width: `${(currentHp / maxHp) * 100}%` }]} />
        </View>
      </View>
      <EnemySprite boss={boss} kind={enemyKind} animation={animation} size={size} restartKey={`${animation}-${enemyId}`} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: {
    marginHorizontal: 10,
    marginTop: 10,
    marginBottom: 8,
    borderWidth: 3,
    borderColor: colors.line,
    borderRadius: 15,
    overflow: "hidden",
  },
  sky: { width: "100%", height: 260, overflow: "hidden" },
  skyImage: { width: "100%", height: "100%" },
  stageBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    minHeight: 50,
    paddingHorizontal: 12,
    paddingTop: 7,
    paddingBottom: 13,
    alignItems: "center",
  },
  stageBarTitle: { color: colors.cream, fontSize: 12, fontWeight: "700", fontFamily: fonts.bold },
  stageBarTrack: { width: "100%", height: 7, marginTop: 4, overflow: "hidden", backgroundColor: "#182017cc", borderWidth: 1, borderColor: "#f7ecd077", borderRadius: 6 },
  stageBarFill: { height: "100%", backgroundColor: colors.gold },
  stageBarCount: { marginTop: 2, color: colors.cream, fontSize: 8, fontWeight: "900", fontFamily: fonts.bold },
  fighters: {
    position: "absolute",
    top: 42,
    left: 15,
    right: 15,
    bottom: 55,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  mapButton: { position: "absolute", right: 8, bottom: 8 },
  mapButtonPressed: { transform: [{ scale: 0.92 }] },
  mapIcon: { width: 52, height: 52 },
  effects: { position: "absolute", right: 96, bottom: 30, zIndex: 10 },
  characterWrap: { width: 108, alignItems: "center", position: "relative" },
  unitLabel: {
    marginBottom: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: colors.line,
    borderRadius: 5,
  },
  unitLabelText: { color: colors.cream, fontSize: 8, fontWeight: "800", fontFamily: fonts.bold },
  enemyNameplate: { width: 104, paddingHorizontal: 6, paddingTop: 4, paddingBottom: 5, gap: 3, alignItems: "center" },
  // Pinned at the regular mob's natural nameplate position (108px sprite + its 4px gap)
  // so a much taller boss sprite doesn't drag its HP bar up with it.
  enemyNameplateFixed: { position: "absolute", bottom: 112 },
  enemyNameplateBoss: { width: 116 },
  unitHealthTrack: { width: "100%", height: 6, overflow: "hidden", backgroundColor: "#211a16", borderWidth: 1, borderColor: "#f7ecd066", borderRadius: 5 },
  unitHealthFill: { height: "100%", backgroundColor: "#dc6048" },
});
