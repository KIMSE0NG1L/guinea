import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { magicEffects } from "../assets";
import { METEOR_TIMING, SWORD_COUNT, SWORD_FLIGHT, SWORD_STAGGER } from "../state/skills";
import { Flash, SmokePuff, Sparks, type Point } from "./ExecuteEffect";
import { SkillCallout } from "./SkillCallout";

// Effects for the magic skills (메테오, 빛의 검, 빙결). Each mounts with a fresh key per cast
// and ends transparent, like BeamEffect.

const METEOR_SIZE = 120;
const SWORD_WIDTH = 74;
const SWORD_HEIGHT = (SWORD_WIDTH * 267) / 409;
const ICE_SIZE = 116;

// 메테오: a flaming rock drops from the top-right onto the enemy, then a big orange flash,
// sparks and smoke as it lands.
export function MeteorEffect({ enemy }: { enemy: Point }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Dim until={METEOR_TIMING.hit} />
      <Meteor enemy={enemy} />
      <Flash color="#ff7a1a" peak={0.55} delay={METEOR_TIMING.hit} rise={30} fall={320} />
      <Sparks at={enemy} delay={METEOR_TIMING.hit} color="#ffb03a" />
      <Sparks at={enemy} delay={METEOR_TIMING.hit + 70} color="#fff1b0" />
      <SmokePuff at={{ left: enemy.left, bottom: enemy.bottom - 10 }} delay={METEOR_TIMING.hit + 200} />
      <SkillCallout text="메테오!!" color="#ff8a2e" strokeColor="#4a1500" holdMs={METEOR_TIMING.hit} />
    </View>
  );
}

function Meteor({ enemy }: { enemy: Point }) {
  const fall = useSharedValue(0);
  useEffect(() => {
    fall.value = withTiming(1, { duration: METEOR_TIMING.hit, easing: Easing.in(Easing.quad) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({
    opacity: fall.value >= 1 ? 0 : 1,
    transform: [{ translateX: (1 - fall.value) * 170 }, { translateY: -(1 - fall.value) * 260 }, { scale: 0.6 + fall.value * 0.5 }],
  }));
  return (
    <Animated.Image
      source={magicEffects.meteor}
      resizeMode="contain"
      style={[{ position: "absolute", width: METEOR_SIZE, height: METEOR_SIZE, left: enemy.left - METEOR_SIZE / 2, bottom: enemy.bottom - METEOR_SIZE / 3 }, style]}
    />
  );
}

// 빛의 검: SWORD_COUNT swords fan out from the guinea pig and streak into the enemy one
// after another, each popping a little golden spark as it lands.
export function SwordsEffect({ from, enemy }: { from: Point; enemy: Point }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: SWORD_COUNT }, (_, index) => (
        <Sword key={index} index={index} from={from} enemy={enemy} />
      ))}
      {Array.from({ length: SWORD_COUNT }, (_, index) => (
        <Sparks key={`spark-${index}`} at={enemy} delay={index * SWORD_STAGGER + SWORD_FLIGHT} color={index % 2 ? "#fff1b0" : "#ffd54a"} />
      ))}
      <SkillCallout text="빛의 검!!" color="#ffe066" strokeColor="#4a3500" holdMs={SWORD_STAGGER * SWORD_COUNT} />
    </View>
  );
}

function Sword({ index, from, enemy }: { index: number; from: Point; enemy: Point }) {
  const progress = useSharedValue(0);
  // Fanned start heights, so the swords come in from above and below the guinea pig.
  const lift = (index - (SWORD_COUNT - 1) / 2) * 26;
  useEffect(() => {
    progress.value = withDelay(index * SWORD_STAGGER, withTiming(1, { duration: SWORD_FLIGHT, easing: Easing.in(Easing.cubic) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const dx = enemy.left - from.left;
  const dy = enemy.bottom - from.bottom;
  const style = useAnimatedStyle(() => {
    const t = progress.value;
    const arc = lift * (1 - t);
    return {
      opacity: t === 0 || t >= 1 ? 0 : 1,
      transform: [{ translateX: dx * t }, { translateY: -(dy * t + arc) }, { rotate: `${-lift * 0.6 * (1 - t)}deg` }],
    };
  });
  return (
    <Animated.Image
      source={magicEffects.sword}
      resizeMode="contain"
      style={[{ position: "absolute", width: SWORD_WIDTH, height: SWORD_HEIGHT, left: from.left - SWORD_WIDTH / 2, bottom: from.bottom - SWORD_HEIGHT / 2 }, style]}
    />
  );
}

// 빙결 on cast: a cold blue flash and "빙결!!".
export function FreezeCastEffect({ enemy }: { enemy: Point }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Flash color="#9fe8ff" peak={0.45} delay={0} rise={40} fall={360} />
      <Sparks at={enemy} delay={80} color="#c8f4ff" />
      <SkillCallout text="빙결!!" color="#8fe3ff" strokeColor="#06304a" holdMs={420} />
    </View>
  );
}

// 빙결 while it lasts: ice crystals over the enemy, gently shimmering, melting away at the end.
export function FreezeAura({ enemy, durationMs }: { enemy: Point; durationMs: number }) {
  const life = useSharedValue(0);
  const shimmer = useSharedValue(0);
  useEffect(() => {
    life.value = withSequence(
      withTiming(1, { duration: 220, easing: Easing.out(Easing.back(2)) }),
      withDelay(Math.max(0, durationMs - 700), withTiming(0, { duration: 480 })),
    );
    shimmer.value = withRepeat(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }), -1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({
    opacity: life.value * (0.8 + shimmer.value * 0.2),
    transform: [{ scale: 0.6 + life.value * 0.4 }],
  }));
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.Image
        source={magicEffects.freeze}
        resizeMode="contain"
        style={[{ position: "absolute", width: ICE_SIZE, height: ICE_SIZE, left: enemy.left - ICE_SIZE / 2, bottom: enemy.bottom - ICE_SIZE / 2 }, style]}
      />
    </View>
  );
}

function Dim({ until }: { until: number }) {
  const opacity = useSharedValue(0);
  useEffect(() => {
    opacity.value = withSequence(withTiming(0.35, { duration: 140 }), withDelay(until - 140, withTiming(0, { duration: 300 })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: "#0c0a1c" }, style]} />;
}
