import { useEffect, useState, type ReactNode } from "react";
import { Image, StyleSheet, View } from "react-native";
import { Text } from "./GameText";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Svg, { Defs, Ellipse, RadialGradient, Rect, Stop } from "react-native-svg";
import { effects, food, uiImages } from "../assets";
import { CARROT_THROW_HIT_MS, CHILI_THROW_BURN_MS, CHILI_THROW_HIT_MS, METEOR_HIT_MS } from "../state/skills";
import { Flash, Sparks, SpriteBurst, type Point } from "./ExecuteEffect";
import { SkillCallout } from "./SkillCallout";
import { t as tr } from "../i18n";

// Steal is green and coin-gold, Focus is gold on deep blue — matching their icons.
const STEAL_GREEN = "#5fd35a";
const STEAL_GOLD = "#ffc93a";
const STEAL_GOLD_LIGHT = "#fff0a0";
const FOCUS_GOLD = "#ffd24a";
const BARRAGE_RED = "#ff5a2e";
const BARRAGE_GOLD = "#ffc93a";
const SHOUT_RED = "#ff3b2f";
const CARROT_ORANGE = "#ff8f2e";
const CARROT_GREEN = "#8fd14f";
const CHILI_RED = "#e8371f";
const CHILI_YELLOW = "#ffc93a";

// ---- Cast bursts (scene overlay, once per cast) ----------------------------------------

// The screen dip every buff skill makes on cast — one shared piece so they all darken
// exactly alike; each skill's colour comes from its sparks and callout instead.
function CastDim() {
  return <Flash color="#000000" peak={0.45} delay={0} rise={60} fall={320} />;
}

export function StealCastEffect({ at }: { at: Point }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <CastDim />
      <Sparks at={at} delay={20} color={STEAL_GREEN} />
      <Sparks at={at} delay={80} color="#ffe27a" />
      <SkillCallout text={tr("훔치기!", "Steal!")} color="#8af07a" strokeColor="#123d10" holdMs={420} />
    </View>
  );
}

export function FocusCastEffect({ at }: { at: Point }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <CastDim />
      <Ring at={at} color={FOCUS_GOLD} delay={40} />
      <Ring at={at} color="#9cc8ff" delay={140} />
      <Sparks at={at} delay={60} color={FOCUS_GOLD} />
      <SkillCallout text={tr("집중!", "Focus!")} color="#ffe07a" strokeColor="#13265c" holdMs={420} />
    </View>
  );
}

// Barrage: Steal and Focus are buffs with no motion of their own, so they get a ring +
// sparks; Barrage already means "rapid hits," so a pixelfx flurry (red-orange, matching its
// own icon) carries it alone, flashing where the guinea pig stands.
export function BarrageCastEffect({ at }: { at: Point }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <CastDim />
      <SpriteBurst
        source={effects.barrageFlurry}
        frameSize={[148, 104]}
        frameCount={30}
        fps={30}
        at={at}
        displayWidth={130}
        displayHeight={91}
        delay={20}
      />
      <Sparks at={at} delay={40} color={BARRAGE_RED} />
      <Sparks at={at} delay={100} color={BARRAGE_GOLD} />
      <SkillCallout text={tr("난타!!", "Flurry!!")} color="#ffb24a" strokeColor="#4a1200" holdMs={420} />
    </View>
  );
}

// Teleport doesn't move the player sprite at all — teleportToBoss swaps the enemy under them
// instantly, with no travel. BattleScene holds the player on its existing "win" pose for this
// window instead of building a teleport-specific animation (see TELEPORT_PAD_MS there); this
// effect's job is just to sell the instant swap: a white flash, then a purple warp pad at
// their feet. pixelfx's own default purple already matches the Teleport skill's own icon.
export const TELEPORT_PAD_MS = 650;
const TELEPORT_PAD_SIZE = { w: 96, h: 104 };
const TELEPORT_PAD_FRAMES = 72;
const TELEPORT_PAD_FPS = 30;
// The pad's ground line sits near the bottom of its frame (pixelfx origin y=92 of h=104) —
// this fraction of the display box's height hangs below the character's feet.
const TELEPORT_PAD_BELOW_GROUND = 0.115;

export function TeleportCastEffect({ at }: { at: Point }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Flash color="#ffffff" peak={0.6} delay={0} rise={30} fall={140} />
      <TeleportPad at={at} />
    </View>
  );
}

function TeleportPad({ at }: { at: Point }) {
  const [frame, setFrame] = useState(0);
  const opacity = useSharedValue(0);
  useEffect(() => {
    opacity.value = withSequence(
      withTiming(1, { duration: 80, easing: Easing.out(Easing.quad) }),
      withDelay(TELEPORT_PAD_MS - 80 - 220, withTiming(0, { duration: 220, easing: Easing.in(Easing.quad) })),
    );
    const id = setInterval(() => setFrame((f) => (f + 1) % TELEPORT_PAD_FRAMES), 1000 / TELEPORT_PAD_FPS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const width = 92;
  const height = (width / TELEPORT_PAD_SIZE.w) * TELEPORT_PAD_SIZE.h;
  const scaleX = width / TELEPORT_PAD_SIZE.w, scaleY = height / TELEPORT_PAD_SIZE.h;
  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: at.left - width / 2,
          bottom: at.bottom - height * TELEPORT_PAD_BELOW_GROUND,
          width,
          height,
          overflow: "hidden",
        },
        style,
      ]}
    >
      <Image
        source={effects.teleportPad}
        resizeMode="stretch"
        style={{
          width: TELEPORT_PAD_SIZE.w * TELEPORT_PAD_FRAMES * scaleX,
          height: TELEPORT_PAD_SIZE.h * scaleY,
          transform: [{ translateX: -frame * TELEPORT_PAD_SIZE.w * scaleX }],
        }}
      />
    </Animated.View>
  );
}

// Shout: scream waves ripple out of the guinea pig's mouth toward the enemy, which
// gets a red jolt of sparks as the waves reach it.
export function ShoutCastEffect({ mouth, enemy }: { mouth: Point; enemy: Point }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <CastDim />
      <Ring at={mouth} color={SHOUT_RED} delay={0} />
      <Ring at={mouth} color="#ff9a8a" delay={90} />
      <Ring at={mouth} color={SHOUT_RED} delay={180} />
      <Sparks at={enemy} delay={160} color={SHOUT_RED} />
      <Sparks at={enemy} delay={220} color="#ffd0c4" />
      <SkillCallout text={tr("찍찍!!", "Squeak!!")} color="#ff6b5a" strokeColor="#4a0a06" holdMs={420} />
    </View>
  );
}

// Carrot throw: the guinea pig hurls a carrot (the same item art used in the bag/shop)
// across the scene; it lands and bursts into orange/green sparks right as the damage
// actually lands in useAutoBattle (see CARROT_THROW_HIT_MS, shared by both).
export function CarrotThrowEffect({ from, to }: { from: Point; to: Point }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <CastDim />
      <ThrownCarrot from={from} to={to} />
      <Flash color={CARROT_ORANGE} peak={0.5} delay={CARROT_THROW_HIT_MS} rise={30} fall={240} />
      <SpriteBurst
        source={effects.carrotImpact}
        frameSize={[128, 88]}
        frameCount={28}
        fps={30}
        at={to}
        displayWidth={96}
        displayHeight={66}
        delay={CARROT_THROW_HIT_MS}
      />
      <Sparks at={to} delay={CARROT_THROW_HIT_MS} color={CARROT_ORANGE} />
      <Sparks at={to} delay={CARROT_THROW_HIT_MS + 40} color={CARROT_GREEN} />
      <SkillCallout text={tr("당근던지기!!", "Carrot Throw!!")} color="#ffb24a" strokeColor="#5a2a00" holdMs={CARROT_THROW_HIT_MS + 100} />
    </View>
  );
}

function ThrownCarrot({ from, to }: { from: Point; to: Point }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withTiming(1, { duration: CARROT_THROW_HIT_MS, easing: Easing.out(Easing.quad) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const dx = to.left - from.left;
  const dy = to.bottom - from.bottom;
  const style = useAnimatedStyle(() => ({
    opacity: t.value === 0 ? 0 : t.value > 0.85 ? (1 - t.value) / 0.15 : 1,
    transform: [
      { translateX: dx * t.value },
      // Up-and-over arc, same shape as Steal's flying coins.
      { translateY: -(dy * t.value + 40 * 4 * t.value * (1 - t.value)) },
      { rotate: `${-20 + t.value * 380}deg` },
    ],
  }));
  return (
    <Animated.Image
      source={uiImages.carrot}
      style={[styles.carrot, { left: from.left - CARROT_SIZE / 2, bottom: from.bottom - CARROT_SIZE / 2 }, style]}
    />
  );
}

// Chili throw: carrotThrow's sibling — same hurl, but the hit is a burn mark that ticks
// damage over CHILI_THROW_BURN_MS instead of landing all at once (see useAutoBattle's
// castSkill for the actual tick timing, shared via CHILI_THROW_HIT_MS/CHILI_THROW_BURN_MS).
export function ChiliThrowEffect({ from, to }: { from: Point; to: Point }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <CastDim />
      <ThrownChili from={from} to={to} />
      <Flash color={CHILI_RED} peak={0.5} delay={CHILI_THROW_HIT_MS} rise={30} fall={240} />
      <Sparks at={to} delay={CHILI_THROW_HIT_MS} color={CHILI_RED} />
      <Sparks at={to} delay={CHILI_THROW_HIT_MS + 40} color={CHILI_YELLOW} />
      <ChiliBurnOverlay at={to} />
      <SkillCallout text={tr("고추던지기!!", "Chili Throw!!")} color="#ff8a5c" strokeColor="#4a0f00" holdMs={CHILI_THROW_HIT_MS + 100} />
    </View>
  );
}

function ThrownChili({ from, to }: { from: Point; to: Point }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withTiming(1, { duration: CHILI_THROW_HIT_MS, easing: Easing.out(Easing.quad) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const dx = to.left - from.left;
  const dy = to.bottom - from.bottom;
  const style = useAnimatedStyle(() => ({
    opacity: t.value === 0 ? 0 : t.value > 0.85 ? (1 - t.value) / 0.15 : 1,
    transform: [
      { translateX: dx * t.value },
      // Up-and-over arc, same shape as the thrown carrot.
      { translateY: -(dy * t.value + 40 * 4 * t.value * (1 - t.value)) },
      { rotate: `${-20 + t.value * 380}deg` },
    ],
  }));
  return (
    <Animated.Image
      source={food.chili}
      style={[styles.carrot, { left: from.left - CARROT_SIZE / 2, bottom: from.bottom - CARROT_SIZE / 2 }, style]}
    />
  );
}

const CHILI_BURN_SIZE = { w: 80, h: 124 };
const CHILI_BURN_FRAMES = 90;
const CHILI_BURN_FPS = 30;
const CHILI_BURN_DISPLAY_WIDTH = 44;

// A small flame hovering over the enemy for exactly as long as the DoT keeps ticking —
// same continuous-loop-that-fades-itself-out pattern as BossSkillEffect's StunOverlay.
function ChiliBurnOverlay({ at }: { at: Point }) {
  const [frame, setFrame] = useState(0);
  const opacity = useSharedValue(0);
  useEffect(() => {
    opacity.value = withDelay(
      CHILI_THROW_HIT_MS,
      withSequence(
        withTiming(1, { duration: 120, easing: Easing.out(Easing.quad) }),
        withDelay(CHILI_THROW_BURN_MS - 120 - 260, withTiming(0, { duration: 260, easing: Easing.in(Easing.quad) })),
      ),
    );
    const id = setInterval(() => setFrame((f) => (f + 1) % CHILI_BURN_FRAMES), 1000 / CHILI_BURN_FPS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const width = CHILI_BURN_DISPLAY_WIDTH;
  const height = (width / CHILI_BURN_SIZE.w) * CHILI_BURN_SIZE.h;
  const scaleX = width / CHILI_BURN_SIZE.w, scaleY = height / CHILI_BURN_SIZE.h;
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        { position: "absolute", left: at.left - width / 2, bottom: at.bottom + 20, width, height, overflow: "hidden" },
        style,
      ]}
    >
      <Image
        source={effects.chiliBurn}
        resizeMode="stretch"
        style={{
          width: CHILI_BURN_SIZE.w * CHILI_BURN_FRAMES * scaleX,
          height: CHILI_BURN_SIZE.h * scaleY,
          transform: [{ translateX: -frame * CHILI_BURN_SIZE.w * scaleX }],
        }}
      />
    </Animated.View>
  );
}

function Ring({ at, color, delay }: { at: Point; color: string; delay: number }) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withDelay(delay, withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({
    opacity: progress.value === 0 ? 0 : 1 - progress.value,
    transform: [{ scale: 0.3 + progress.value * 1.8 }],
  }));
  return <Animated.View style={[styles.ring, { borderColor: color, left: at.left - RING / 2, bottom: at.bottom - RING / 2 }, style]} />;
}

// ---- Vignette (scene overlay, for the skill's whole duration) ----------------------------

// Darkens only the edges of the scene while a buff runs, pulling the eye to the fight in
// the middle without hiding it. Eases in, holds, and lifts slowly as the buff ends.
export function BuffVignette({ durationMs }: { durationMs: number }) {
  const life = useSharedValue(0);
  useEffect(() => {
    life.value = withSequence(
      withTiming(1, { duration: 300 }),
      withDelay(durationMs - 900, withTiming(0, { duration: 600, easing: Easing.in(Easing.quad) })),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: life.value }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, style]} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <RadialGradient id="buff-vignette" cx="50%" cy="55%" rx="62%" ry="62%">
            <Stop offset={0} stopColor={BUFF_VIGNETTE} stopOpacity={0} />
            <Stop offset={0.5} stopColor={BUFF_VIGNETTE} stopOpacity={0} />
            <Stop offset={1} stopColor={BUFF_VIGNETTE} stopOpacity={0.78} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#buff-vignette)" />
      </Svg>
    </Animated.View>
  );
}

// Shared by every buff skill, so they all dim the scene the same way.
const BUFF_VIGNETTE = "#1e1206";

// ---- Auras (inside the player's box, for the skill's whole duration) -------------------

// Fades in, holds, and fades out right as the buff runs out.
function useAuraLife(durationMs: number) {
  const life = useSharedValue(0);
  useEffect(() => {
    life.value = withSequence(
      withTiming(1, { duration: 180 }),
      withDelay(durationMs - 480, withTiming(0, { duration: 300 })),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return life;
}

// Steal: gold glints popping all around.
export function StealAura({ durationMs }: { durationMs: number }) {
  const life = useAuraLife(durationMs);
  const lifeStyle = useAnimatedStyle(() => ({ opacity: life.value }));
  return (
    <Animated.View style={[styles.aura, lifeStyle]} pointerEvents="none">
      {STEAL_GLINTS.map((glint, index) => (
        <Glint key={index} {...glint} />
      ))}
    </Animated.View>
  );
}

const STEAL_GLINTS = [
  { left: 8, bottom: 70, delay: 0, color: STEAL_GOLD },
  { left: 86, bottom: 58, delay: 140, color: STEAL_GOLD_LIGHT },
  { left: 22, bottom: 24, delay: 260, color: STEAL_GOLD_LIGHT },
  { left: 92, bottom: 18, delay: 380, color: STEAL_GOLD },
  { left: 54, bottom: 92, delay: 500, color: STEAL_GOLD },
];

// Focus: a golden glow behind the guinea pig, a halo over its head and arrows rising.
export function FocusAura({ durationMs }: { durationMs: number }) {
  const life = useAuraLife(durationMs);
  const lifeStyle = useAnimatedStyle(() => ({ opacity: life.value }));
  return (
    <Animated.View style={[styles.aura, lifeStyle]} pointerEvents="none">
      <Pulse style={styles.bodyGlow} period={700}>
        <SoftGlow id="focus-body" width={BODY_GLOW.width} height={BODY_GLOW.height} stops={BODY_GLOW_STOPS} />
      </Pulse>
      <Pulse style={styles.halo} period={450}>
        <SoftGlow id="focus-halo" width={HALO.width} height={HALO.height} stops={HALO_STOPS} />
      </Pulse>
      {FOCUS_ARROWS.map((arrow, index) => (
        <RisingArrow key={index} {...arrow} />
      ))}
    </Animated.View>
  );
}

const FOCUS_ARROWS = [
  { left: 4, delay: 0 },
  { left: 90, delay: 260 },
  { left: 18, delay: 520 },
  { left: 78, delay: 780 },
];

// Breathes between two sizes forever (until its aura unmounts).
function Pulse({ style, period, children }: { style: object; period: number; children?: ReactNode }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(withTiming(1, { duration: period, easing: Easing.inOut(Easing.quad) }), -1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const animated = useAnimatedStyle(() => ({ opacity: 0.45 + t.value * 0.35, transform: [{ scale: 0.92 + t.value * 0.12 }] }));
  return <Animated.View style={[style, animated]}>{children}</Animated.View>;
}

// An elliptical radial gradient filling its box — soft light with no hard edge.
function SoftGlow({
  id,
  width,
  height,
  stops,
}: {
  id: string;
  width: number;
  height: number;
  stops: { offset: number; color: string; opacity: number }[];
}) {
  return (
    <Svg width={width} height={height}>
      <Defs>
        <RadialGradient id={id} cx="50%" cy="50%" rx="50%" ry="50%">
          {stops.map((stop) => (
            <Stop key={stop.offset} offset={stop.offset} stopColor={stop.color} stopOpacity={stop.opacity} />
          ))}
        </RadialGradient>
      </Defs>
      <Ellipse cx={width / 2} cy={height / 2} rx={width / 2} ry={height / 2} fill={`url(#${id})`} />
    </Svg>
  );
}

// Glow behind the body: bright warm core bleeding out to nothing.
const BODY_GLOW = { width: 124, height: 116 };
const BODY_GLOW_STOPS = [
  { offset: 0, color: "#fff6c8", opacity: 0.95 },
  { offset: 0.4, color: FOCUS_GOLD, opacity: 0.7 },
  { offset: 1, color: FOCUS_GOLD, opacity: 0 },
];
// Halo: a hollow band of light — clear in the middle, glowing ring, soft outer bleed.
const HALO = { width: 64, height: 26 };
const HALO_STOPS = [
  { offset: 0, color: FOCUS_GOLD, opacity: 0 },
  { offset: 0.45, color: FOCUS_GOLD, opacity: 0.1 },
  { offset: 0.7, color: "#fff3b0", opacity: 1 },
  { offset: 0.82, color: FOCUS_GOLD, opacity: 0.75 },
  { offset: 1, color: FOCUS_GOLD, opacity: 0 },
];

// A four-point sparkle that pops in and out on a loop.
function Glint({ left, bottom, delay, color }: { left: number; bottom: number; delay: number; color: string }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(
      delay,
      withRepeat(withSequence(withTiming(1, { duration: 220 }), withTiming(0, { duration: 260 }), withTiming(0, { duration: 160 })), -1),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: t.value, transform: [{ scale: 0.4 + t.value * 0.8 }, { rotate: `${t.value * 45}deg` }] }));
  return (
    <Animated.View style={[styles.glint, { left: left - GLINT / 2, bottom }, style]}>
      <View style={[styles.glintBar, { backgroundColor: color }]} />
      <View style={[styles.glintBar, styles.glintBarCross, { backgroundColor: color }]} />
    </Animated.View>
  );
}

function RisingArrow({ left, delay }: { left: number; delay: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(delay, withRepeat(withTiming(1, { duration: 1000, easing: Easing.out(Easing.quad) }), -1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({
    opacity: t.value < 0.2 ? t.value * 5 : (1 - t.value) / 0.8,
    transform: [{ translateY: -t.value * 50 }],
  }));
  return (
    <Animated.View style={[styles.arrow, { left: left - 7 }, style]}>
      <Text style={styles.arrowText}>▲</Text>
    </Animated.View>
  );
}

// Shout's debuff on the enemy: red arrows sinking past it on a loop for the whole
// duration — the same "down" arrows as on the icon.
export function ShoutDebuff({ durationMs }: { durationMs: number }) {
  const life = useAuraLife(durationMs);
  const lifeStyle = useAnimatedStyle(() => ({ opacity: life.value }));
  return (
    <Animated.View style={[styles.aura, lifeStyle]} pointerEvents="none">
      {SHOUT_ARROWS.map((arrow, index) => (
        <SinkingArrow key={index} {...arrow} />
      ))}
    </Animated.View>
  );
}

const SHOUT_ARROWS = [
  { left: 10, delay: 0 },
  { left: 94, delay: 300 },
  { left: 30, delay: 600 },
  { left: 76, delay: 900 },
];

function SinkingArrow({ left, delay }: { left: number; delay: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(delay, withRepeat(withTiming(1, { duration: 1100, easing: Easing.in(Easing.quad) }), -1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({
    opacity: t.value < 0.2 ? t.value * 5 : (1 - t.value) / 0.8,
    transform: [{ translateY: t.value * 50 }],
  }));
  return (
    <Animated.View style={[styles.sinkingArrow, { left: left - 7 }, style]}>
      <Text style={styles.sinkingArrowText}>▼</Text>
    </Animated.View>
  );
}

// ---- Steal's per-hit coins (scene overlay) -----------------------------------------------

// Each Steal hit knocks a few coins off the enemy that arc over to the guinea pig.
export function StealCoins({ from, to }: { from: Point; to: Point }) {
  return (
    <>
      {[
        { delay: 0, lift: 46 },
        { delay: 70, lift: 64 },
        { delay: 140, lift: 34 },
      ].map((coin, index) => (
        <FlyingCoin key={index} from={from} to={to} {...coin} />
      ))}
    </>
  );
}

function FlyingCoin({ from, to, delay, lift }: { from: Point; to: Point; delay: number; lift: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(delay, withTiming(1, { duration: 480, easing: Easing.inOut(Easing.quad) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const dx = to.left - from.left;
  const dy = to.bottom - from.bottom;
  const style = useAnimatedStyle(() => ({
    opacity: t.value === 0 ? 0 : t.value > 0.85 ? (1 - t.value) / 0.15 : 1,
    transform: [
      { translateX: dx * t.value },
      // Up-and-over arc: a parabola peaking `lift` px above the straight line.
      { translateY: -(dy * t.value + lift * 4 * t.value * (1 - t.value)) },
      { rotate: `${t.value * 540}deg` },
    ],
  }));
  return (
    <Animated.Image
      source={uiImages.coin}
      style={[styles.coin, { left: from.left - COIN / 2, bottom: from.bottom - COIN / 2 }, style]}
    />
  );
}

const RING = 70;
const GLINT = 14;
const COIN = 16;
const CARROT_SIZE = 40;

const styles = StyleSheet.create({
  ring: { position: "absolute", width: RING, height: RING, borderRadius: RING / 2, borderWidth: 4 },
  // Fills the 108px-wide player box from its feet up; rendered first so it sits behind the sprite.
  aura: { position: "absolute", left: 0, right: 0, bottom: 0, height: 120 },
  // Both glows draw their own soft edges; these boxes just place them.
  bodyGlow: { position: "absolute", left: (108 - BODY_GLOW.width) / 2, bottom: -2, width: BODY_GLOW.width, height: BODY_GLOW.height },
  halo: { position: "absolute", left: (108 - HALO.width) / 2, bottom: 98, width: HALO.width, height: HALO.height },
  glint: { position: "absolute", width: GLINT, height: GLINT, alignItems: "center", justifyContent: "center" },
  glintBar: { position: "absolute", width: GLINT, height: 3, borderRadius: 2 },
  glintBarCross: { transform: [{ rotate: "90deg" }] },
  arrow: { position: "absolute", bottom: 20 },
  arrowText: { fontSize: 16, color: FOCUS_GOLD, textShadowColor: "#7a4b00", textShadowRadius: 2, textShadowOffset: { width: 0, height: 1 } },
  coin: { position: "absolute", width: COIN, height: COIN },
  carrot: { position: "absolute", width: CARROT_SIZE, height: CARROT_SIZE, resizeMode: "contain" },
  sinkingArrow: { position: "absolute", bottom: 80 },
  sinkingArrowText: { fontSize: 16, color: SHOUT_RED, textShadowColor: "#4a0a06", textShadowRadius: 2, textShadowOffset: { width: 0, height: 1 } },
});

// ---- 운석 낙하 ---------------------------------------------------------------------------

// pixelfx fire/meteor: 272x232 frames, the rock hitting the ground at (150, 208) at 0.62s
// (METEOR_HIT_MS). Only its first 66 frames ship; the smoke left at the end fades out here.
const METEOR_FRAME = { w: 272, h: 232 };
const METEOR_GROUND = { x: 150, y: 208 };
const METEOR_FRAMES = 66;
const METEOR_FPS = 30;
const METEOR_SCALE = 1.1;
const METEOR_FADE_START = 1600;
const METEOR_FADE_MS = 600;

// One falling meteor, its impact point lined up on `at` (the enemy's feet). Mount fresh per
// strike; it ends fully transparent, so it can stay mounted until the next one.
export function MeteorStrikeEffect({ at }: { at: Point }) {
  const width = METEOR_FRAME.w * METEOR_SCALE;
  const height = METEOR_FRAME.h * METEOR_SCALE;
  // SpriteBurst centres the frame on its point — shift that so the impact lands on `at`.
  const center = {
    left: at.left + (METEOR_FRAME.w / 2 - METEOR_GROUND.x) * METEOR_SCALE,
    bottom: at.bottom + (METEOR_GROUND.y - METEOR_FRAME.h / 2) * METEOR_SCALE,
  };
  const fade = useSharedValue(1);
  useEffect(() => {
    fade.value = withDelay(METEOR_FADE_START, withTiming(0, { duration: METEOR_FADE_MS }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: fade.value }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, style]} pointerEvents="none">
      <SpriteBurst
        source={effects.meteorStrike}
        frameSize={[METEOR_FRAME.w, METEOR_FRAME.h]}
        frameCount={METEOR_FRAMES}
        fps={METEOR_FPS}
        at={center}
        displayWidth={width}
        displayHeight={height}
      />
      {/* The ground shakes with a warm flash right as the rock lands. */}
      <Flash color="#ffb060" peak={0.45} delay={METEOR_HIT_MS} rise={30} fall={260} />
    </Animated.View>
  );
}
