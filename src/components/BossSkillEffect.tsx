import { useEffect, useState } from "react";
import { Image, StyleSheet, View, type ImageSourcePropType } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming } from "react-native-reanimated";
import { effects } from "../assets";
import { BOSS_SKILL_STUN_MS, GHOST_GOAT_REVIVE_NAME, type BossSkill, type HealVariant, type StunVariant } from "../state/bossSkills";
import { Flash, SpriteBurst, type Point } from "./ExecuteEffect";
import { SkillCallout } from "./SkillCallout";

// SpriteBurst just holds whatever frame it lands on forever once it's done playing — fine
// for a one-shot that was rendered to its own natural "ends empty" last frame (every
// pixelfx one-shot is authored to fade/shrink/fall away to nothing by its last frame), but
// not for one cropped short with --max-frames (see VENDORED.md): that frame usually isn't
// blank yet, so it'd freeze as a visible leftover. This fades it out shortly after its own
// playback (frameCount/fps) finishes, restoring the "ends empty" guarantee by animation
// instead of relying on the source frames.
function FadingSpriteBurst({
  source,
  frameSize,
  frameCount,
  fps,
  at,
  displayWidth,
  displayHeight,
  fadeMs = 260,
}: {
  source: ImageSourcePropType;
  frameSize: [number, number];
  frameCount: number;
  fps: number;
  at: Point;
  displayWidth: number;
  displayHeight: number;
  fadeMs?: number;
}) {
  const opacity = useSharedValue(1);
  useEffect(() => {
    opacity.value = withDelay((frameCount / fps) * 1000, withTiming(0, { duration: fadeMs, easing: Easing.in(Easing.quad) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, style]} pointerEvents="none">
      <SpriteBurst source={source} frameSize={frameSize} frameCount={frameCount} fps={fps} at={at} displayWidth={displayWidth} displayHeight={displayHeight} />
    </Animated.View>
  );
}

// A boss using its own skill (src/state/bossSkills.ts): a screen flash + name banner (same
// recipe as every player skill cast), plus a themed pixelfx overlay. Stun plays over the
// *player* (a status effect — dizzy stars, Zzz, a spinning question mark — above their head,
// same idea as status/stunned etc. drawn on a character in any other game); heal plays over
// the *boss* (a ring or a blooming flower at their feet). Mount with a fresh key per cast.
export function BossSkillCastEffect({ skill, bossAt, playerAt }: { skill: BossSkill; bossAt: Point; playerAt: Point }) {
  const tint = skill.kind === "heal" ? "#bff0c8" : "#d8c8ff";
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Flash color={tint} peak={0.3} delay={0} rise={70} fall={280} />
      {skill.kind === "stun" ? <StunOverlay variant={skill.variant} at={playerAt} /> : <HealOverlay variant={skill.variant} at={bossAt} />}
      <SkillCallout text={`${skill.name}!`} color={skill.kind === "heal" ? "#8af0a0" : "#c9b6ff"} strokeColor="#241a40" holdMs={420} />
    </View>
  );
}

const STUN_SOURCES: Record<StunVariant, { source: ImageSourcePropType; size: [number, number]; frames: number }> = {
  stunned: { source: effects.bossStunStunned, size: [60, 64], frames: 60 },
  sleep: { source: effects.bossStunSleep, size: [60, 82], frames: 72 },
  confused: { source: effects.bossStunConfused, size: [60, 78], frames: 72 },
};
const STUN_FPS = 30;
const STUN_DISPLAY_WIDTH = 54;

// Floats above the player's head for the stun's own duration, then fades — a continuous
// loop (same stepping pattern as BeamEffect's BeamFireStrip / SkillAuras' TeleportPad), not
// a one-shot, so it has to end itself instead of just finishing its last frame. The parent
// never explicitly unmounts this (same "stays mounted, already invisible" convention as
// every other cast effect here), so without its own fade-out it would spin forever.
function StunOverlay({ variant, at }: { variant: StunVariant; at: Point }) {
  const { source, size, frames } = STUN_SOURCES[variant];
  const [sw, sh] = size;
  const [frame, setFrame] = useState(0);
  const opacity = useSharedValue(0);
  useEffect(() => {
    opacity.value = withSequence(
      withTiming(1, { duration: 120, easing: Easing.out(Easing.quad) }),
      withDelay(BOSS_SKILL_STUN_MS - 120 - 260, withTiming(0, { duration: 260, easing: Easing.in(Easing.quad) })),
    );
    const id = setInterval(() => setFrame((f) => (f + 1) % frames), 1000 / STUN_FPS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frames]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const width = STUN_DISPLAY_WIDTH;
  const height = (width / sw) * sh;
  const scaleX = width / sw, scaleY = height / sh;
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          left: at.left - width / 2,
          // Floats just above the character's head rather than centered on their body —
          // guinea pigs are round and low, so this sits noticeably lower than a biped's
          // head would (CharacterSprite's own box is 108px tall, but the art doesn't fill
          // it edge to edge).
          bottom: at.bottom + 54,
          width,
          height,
          overflow: "hidden",
        },
        style,
      ]}
    >
      <Image
        source={source}
        resizeMode="stretch"
        style={{
          width: sw * frames * scaleX,
          height: sh * scaleY,
          transform: [{ translateX: -frame * sw * scaleX }],
        }}
      />
    </Animated.View>
  );
}

const HEAL_SOURCES: Record<
  HealVariant,
  { source: ImageSourcePropType; size: [number, number]; frames: number; displayWidth: number; displayHeight: number; liftAboveFeet: number }
> = {
  // The AoE ring is wide and short — scaled to sit noticeably wider than the boss itself.
  holyAoe: { source: effects.bossHealHoly, size: [256, 136], frames: 42, displayWidth: 190, displayHeight: 101, liftAboveFeet: 30 },
  // The bloom is a small flower growing at the boss's feet, not meant to rival its size.
  bloom: { source: effects.bossHealBloom, size: [124, 120], frames: 45, displayWidth: 90, displayHeight: 87, liftAboveFeet: 30 },
};
const HEAL_FPS = 30;

function HealOverlay({ variant, at }: { variant: HealVariant; at: Point }) {
  const { source, size, frames, displayWidth, displayHeight, liftAboveFeet } = HEAL_SOURCES[variant];
  return (
    <FadingSpriteBurst
      source={source}
      frameSize={size}
      frameCount={frames}
      fps={HEAL_FPS}
      at={{ left: at.left, bottom: at.bottom + liftAboveFeet }}
      displayWidth={displayWidth}
      displayHeight={displayHeight}
    />
  );
}

const REVIVE_SIZE: [number, number] = [128, 150];
const REVIVE_FRAMES = 50;
const REVIVE_FPS = 30;
const REVIVE_DISPLAY_WIDTH = 100;
const REVIVE_DISPLAY_HEIGHT = (REVIVE_DISPLAY_WIDTH / REVIVE_SIZE[0]) * REVIVE_SIZE[1];

// The one guaranteed revive (not part of BOSS_SKILLS — see bossSkills.ts's
// GHOST_GOAT_REVIVE_*): a spectral light pillar slams down on the boss the instant it would
// have died, right as its hp bar jumps back up. Mount with a fresh key per revive.
export function BossReviveEffect({ bossAt }: { bossAt: Point }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Flash color="#bdf5ec" peak={0.4} delay={0} rise={50} fall={320} />
      <FadingSpriteBurst
        source={effects.bossRevive}
        frameSize={REVIVE_SIZE}
        frameCount={REVIVE_FRAMES}
        fps={REVIVE_FPS}
        at={{ left: bossAt.left, bottom: bossAt.bottom + 40 }}
        displayWidth={REVIVE_DISPLAY_WIDTH}
        displayHeight={REVIVE_DISPLAY_HEIGHT}
      />
      <SkillCallout text={`${GHOST_GOAT_REVIVE_NAME}!!`} color="#9df0e0" strokeColor="#0a2b26" holdMs={480} />
    </View>
  );
}
