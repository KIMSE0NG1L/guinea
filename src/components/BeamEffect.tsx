import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { effects } from "../assets";
import { fonts } from "../theme";
import { BEAM_TIMING } from "../state/skills";
import { Flash, SmokePuff, Sparks, type Point } from "./ExecuteEffect";
import { StrokedText } from "./StrokedText";

// Beam frame art is 512x250; the muzzle ring's centre sits this far in from the left edge.
const BEAM_ASPECT = 250 / 512;
const MUZZLE_X = 0.08;
// Drawn thinner than the art's own proportions so the beam doesn't swamp the scene.
const THICKNESS = 0.78;

// The art's own frames, relative to ART_START: charge frame → full beam (flickering) →
// dissipating frame. ART_START lines the charge frame up so the full beam comes out at
// BEAM_TIMING.fire.
const CHARGE_END = 90;
const FIRE_END = 420;
const FADE_END = 580;
const ART_START = BEAM_TIMING.fire - CHARGE_END;
const { fire: FIRE, hit: HIT } = BEAM_TIMING;

// Mount with a fresh key per cast; everything ends transparent, so it can stay mounted.
// Charge: the scene dims, sparks get sucked into the guinea pig's mouth and an orb swells
// there while "기니빔!!" slams in. Fire: the beam art. Hit: orange flash, shockwave, embers,
// then a little smoke where the enemy was.
export function BeamEffect({ mouth, targetLeft, enemy }: { mouth: Point; targetLeft: number; enemy: Point }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Darken />
      <Gather at={mouth} />
      <ChargeOrb at={mouth} />
      <BeamArt mouth={mouth} targetLeft={targetLeft} />
      <Flash color="#ff8a1a" peak={0.45} delay={HIT} rise={30} fall={260} />
      <Shockwave at={enemy} delay={HIT} />
      <Sparks at={enemy} delay={HIT} color="#ffb03a" />
      <Sparks at={enemy} delay={HIT + 60} color="#fff1b0" />
      <SmokePuff at={{ left: enemy.left, bottom: enemy.bottom - 10 }} delay={HIT + 260} />
      <Callout />
    </View>
  );
}

// Dims the scene through the charge and the shot, lifting once the beam lands.
function Darken() {
  const opacity = useSharedValue(0);
  useEffect(() => {
    opacity.value = withSequence(
      withTiming(0.4, { duration: 120 }),
      withDelay(HIT - 120, withTiming(0, { duration: 320 })),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: "#120604" }, style]} />;
}

// Embers drawn in from all around toward the mouth during the charge.
const GATHER = [
  { angle: -150, distance: 70 },
  { angle: -110, distance: 58 },
  { angle: -70, distance: 66 },
  { angle: -30, distance: 54 },
  { angle: 10, distance: 62 },
  { angle: 50, distance: 56 },
  { angle: 90, distance: 64 },
  { angle: 130, distance: 52 },
  { angle: 170, distance: 68 },
  { angle: 210, distance: 60 },
];

function Gather({ at }: { at: Point }) {
  return (
    <>
      {GATHER.map((mote, index) => (
        <Mote key={index} at={at} delay={(index % 5) * 30} {...mote} />
      ))}
    </>
  );
}

function Mote({ at, delay, angle, distance }: { at: Point; delay: number; angle: number; distance: number }) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withDelay(delay, withTiming(1, { duration: FIRE - delay - 20, easing: Easing.in(Easing.quad) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const radians = (angle * Math.PI) / 180;
  const style = useAnimatedStyle(() => ({
    opacity: progress.value === 0 || progress.value === 1 ? 0 : Math.min(1, progress.value * 3),
    transform: [
      { translateX: Math.cos(radians) * distance * (1 - progress.value) },
      { translateY: Math.sin(radians) * distance * (1 - progress.value) },
      { scale: 1.2 - progress.value * 0.7 },
    ],
  }));
  return <Animated.View style={[styles.mote, { left: at.left - MOTE / 2, bottom: at.bottom - MOTE / 2 }, style]} />;
}

// A glowing ball swelling and throbbing at the mouth until the beam fires out of it.
function ChargeOrb({ at }: { at: Point }) {
  const grow = useSharedValue(0);
  const pulse = useSharedValue(0);
  useEffect(() => {
    grow.value = withSequence(
      withTiming(1, { duration: FIRE - 40, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: 80 }),
    );
    pulse.value = withRepeat(withSequence(withTiming(1, { duration: 50 }), withTiming(0, { duration: 50 })), 3);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({
    opacity: grow.value === 0 ? 0 : 0.95,
    transform: [{ scale: grow.value * (1 + pulse.value * 0.15) }],
  }));
  return (
    <Animated.View style={[styles.orb, { left: at.left - ORB / 2, bottom: at.bottom - ORB / 2 }, style]}>
      <View style={styles.orbCore} />
    </Animated.View>
  );
}

function BeamArt({ mouth, targetLeft }: { mouth: Point; targetLeft: number }) {
  const length = Math.max(120, (targetLeft - mouth.left) / (1 - MUZZLE_X));
  const height = length * BEAM_ASPECT * THICKNESS;
  const box = { left: mouth.left - length * MUZZLE_X, bottom: mouth.bottom - height / 2, width: length, height };

  const charge = useSharedValue(0);
  const fire = useSharedValue(0);
  const flicker = useSharedValue(0);
  const fade = useSharedValue(0);
  useEffect(() => {
    charge.value = withDelay(
      ART_START,
      withSequence(withTiming(1, { duration: 40 }), withDelay(CHARGE_END - 40, withTiming(0, { duration: 30 }))),
    );
    fire.value = withDelay(
      ART_START + CHARGE_END - 10,
      withSequence(withTiming(1, { duration: 40 }), withDelay(FIRE_END - CHARGE_END - 40, withTiming(0, { duration: 60 }))),
    );
    flicker.value = withDelay(
      ART_START + CHARGE_END,
      withSequence(
        withTiming(1, { duration: 60 }),
        withTiming(-0.6, { duration: 70 }),
        withTiming(0.8, { duration: 70 }),
        withTiming(-0.4, { duration: 70 }),
        withTiming(0, { duration: 60 }),
      ),
    );
    fade.value = withDelay(
      ART_START + FIRE_END - 20,
      withSequence(withTiming(1, { duration: 40 }), withTiming(0, { duration: FADE_END - FIRE_END - 20, easing: Easing.in(Easing.quad) })),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The full beam punches out from the muzzle (scaleX from the left) and its thickness
  // pulses; translateX keeps the scale anchored on the left edge.
  const chargeStyle = useAnimatedStyle(() => ({ opacity: charge.value }));
  const fireStyle = useAnimatedStyle(() => {
    const scaleX = 0.4 + Math.min(fire.value, 1) * 0.6;
    return {
      opacity: fire.value,
      transform: [{ translateX: (-length * (1 - scaleX)) / 2 }, { scaleX }, { scaleY: 1 + flicker.value * 0.08 }],
    };
  });
  const fadeStyle = useAnimatedStyle(() => ({ opacity: fade.value, transform: [{ scaleY: 1 + (1 - fade.value) * 0.15 }] }));

  return (
    <View style={[styles.box, box]}>
      <Animated.Image source={effects.beam[0]} style={[StyleSheet.absoluteFill, styles.frame, chargeStyle]} />
      <Animated.Image source={effects.beam[1]} style={[StyleSheet.absoluteFill, styles.frame, fireStyle]} />
      <Animated.Image source={effects.beam[2]} style={[StyleSheet.absoluteFill, styles.frame, fadeStyle]} />
    </View>
  );
}

// Expanding hot ring where the beam connects.
function Shockwave({ at, delay }: { at: Point; delay: number }) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withDelay(delay, withTiming(1, { duration: 360, easing: Easing.out(Easing.cubic) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({
    opacity: progress.value === 0 ? 0 : 1 - progress.value,
    transform: [{ scale: 0.3 + progress.value * 1.7 }],
  }));
  return <Animated.View style={[styles.ring, { left: at.left - RING / 2, bottom: at.bottom - RING / 2 }, style]} />;
}

// The move's name shouted across the top of the scene as it charges.
function Callout() {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withDelay(
      40,
      withSequence(
        withTiming(1, { duration: 120, easing: Easing.out(Easing.back(2.4)) }),
        withDelay(HIT - 40, withTiming(2, { duration: 220 })),
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({
    opacity: progress.value === 0 ? 0 : progress.value <= 1 ? 1 : 2 - progress.value,
    transform: [
      { scale: progress.value <= 1 ? 1.8 - progress.value * 0.8 : 1 + (progress.value - 1) * 0.15 },
      { rotate: "-4deg" },
    ],
  }));
  return (
    <Animated.View style={[styles.callout, style]}>
      <StrokedText style={styles.calloutText} strokeColor="#4a1500" strokeWidth={2}>
        기니빔!!
      </StrokedText>
    </Animated.View>
  );
}

const MOTE = 7;
const ORB = 34;
const RING = 70;

const styles = StyleSheet.create({
  box: { position: "absolute" },
  frame: { width: "100%", height: "100%", resizeMode: "stretch" },
  mote: { position: "absolute", width: MOTE, height: MOTE, borderRadius: MOTE / 2, backgroundColor: "#ffd27a" },
  orb: {
    position: "absolute",
    width: ORB,
    height: ORB,
    borderRadius: ORB / 2,
    backgroundColor: "#ff9b2e",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#ff7a00",
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  orbCore: { width: ORB * 0.55, height: ORB * 0.55, borderRadius: ORB * 0.275, backgroundColor: "#fff6d8" },
  ring: { position: "absolute", width: RING, height: RING, borderRadius: RING / 2, borderWidth: 4, borderColor: "#ffc061" },
  callout: { position: "absolute", top: 58, left: 0, right: 0, alignItems: "center" },
  calloutText: { fontSize: 26, fontWeight: "900", fontFamily: fonts.bold, color: "#ffb52e" },
});
