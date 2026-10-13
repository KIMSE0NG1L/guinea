import { useEffect } from "react";
import { ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming, Easing } from "react-native-reanimated";
import { colors, fonts } from "../theme";
import { images } from "../assets";
import { CharacterSprite } from "../components/CharacterSprite";
import { EnemySprite } from "../components/EnemySprite";
import { DamageNumber } from "../components/DamageNumber";
import { CoinPopup } from "../components/CoinPopup";
import { StageAdvanceBanner } from "../components/StageAdvanceBanner";
import { formatGameNumber } from "../state/gameMath";
import type { BattlePhase, EnemyAnimation, EnemyKind, Outfit, PlayerAnimation } from "../types";

const ENEMY_NAME: Record<EnemyKind, string> = {
  slime: "골목 슬라임",
  mushroom: "습지 버섯",
  carrot: "밭 당근토끼",
};

const BOSS_NAME: Record<EnemyKind, string> = {
  slime: "왕 슬라임",
  mushroom: "버섯 대왕",
  carrot: "감자 대왕",
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
            <PlayerFighter animation={playerAnimation} outfit={outfit} />

            <View style={styles.effects} pointerEvents="none">
              {damageEvents.map((event) => (
                <DamageNumber key={event.id} amount={event.amount} critical={event.critical} />
              ))}
              {phase === "defeated" && <CoinPopup key={`coin-${enemyId}`} amount={lastGoldReward} />}
            </View>

            <EnemyFighter
              animation={enemyAnimation}
              boss={boss}
              enemyKind={enemyKind}
              enemyId={enemyId}
              currentHp={enemyHp}
              maxHp={enemyMaxHp}
              manualEnabled={manualEnabled}
              phase={phase}
            />
          </View>
        </ImageBackground>
      </Pressable>
    </View>
  );
}

function PlayerFighter({ animation, outfit }: { animation: PlayerAnimation; outfit: Outfit }) {
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
      <CharacterSprite outfit={outfit} animation={animation} restartKey={`${outfit}-${animation}`} />
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
  manualEnabled,
  phase,
}: {
  animation: EnemyAnimation;
  boss: boolean;
  enemyKind: EnemyKind;
  enemyId: number;
  currentHp: number;
  maxHp: number;
  manualEnabled: boolean;
  phase: BattlePhase;
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
      <View style={[styles.unitLabel, styles.enemyNameplate, boss && styles.enemyNameplateBoss]}>
        <Text style={styles.unitLabelText}>{boss ? BOSS_NAME[enemyKind] : `${ENEMY_NAME[enemyKind]} ${enemyId}`}</Text>
        <View style={styles.unitHealthTrack}>
          <View style={[styles.unitHealthFill, { width: `${(currentHp / maxHp) * 100}%` }]} />
        </View>
      </View>
      <EnemySprite boss={boss} kind={enemyKind} animation={animation} size={boss ? 180 : 108} restartKey={`${animation}-${enemyId}`} />
      {manualEnabled && (
        <View style={styles.touchHint}>
          <Text style={styles.touchHintText}>터치 공격</Text>
        </View>
      )}
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
  effects: { position: "absolute", top: "42%", right: 96 },
  characterWrap: { width: 108, alignItems: "center" },
  unitLabel: {
    marginBottom: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: colors.line,
    borderRadius: 5,
  },
  unitLabelText: { color: colors.cream, fontSize: 8, fontWeight: "800", fontFamily: fonts.bold },
  enemyNameplate: { width: 104, paddingHorizontal: 6, paddingTop: 4, paddingBottom: 5, gap: 3, alignItems: "center" },
  enemyNameplateBoss: { width: 116 },
  unitHealthTrack: { width: "100%", height: 6, overflow: "hidden", backgroundColor: "#211a16", borderWidth: 1, borderColor: "#f7ecd066", borderRadius: 5 },
  unitHealthFill: { height: "100%", backgroundColor: "#dc6048" },
  touchHint: {
    position: "absolute",
    right: 8,
    bottom: -16,
    paddingHorizontal: 6,
    paddingVertical: 3,
    backgroundColor: colors.greenDark,
    borderWidth: 2,
    borderColor: colors.line,
    borderRadius: 7,
  },
  touchHintText: { color: colors.cream, fontSize: 8, fontWeight: "900", fontFamily: fonts.bold },
});
