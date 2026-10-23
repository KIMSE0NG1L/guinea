import { useEffect, useRef, useState, type ReactNode } from "react";
import { Image, ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming, Easing } from "react-native-reanimated";
import { colors, fonts } from "../theme";
import { effects, food, icons, images, kitImages, FRAME_SIZE } from "../assets";
import { StrokedText } from "../components/StrokedText";
import { CharacterSprite } from "../components/CharacterSprite";
import { EnemySprite } from "../components/EnemySprite";
import { SpriteStrip } from "../components/SpriteStrip";
import { DamageNumber } from "../components/DamageNumber";
import { CoinPopup } from "../components/CoinPopup";
import { GoldFly } from "../components/GoldFly";
import { StageAdvanceBanner } from "../components/StageAdvanceBanner";
import { BossEntranceBanner } from "../components/BossEntranceBanner";
import { LevelUpBurst } from "../components/LevelUpBurst";
import { ProgressBar } from "../components/ProgressBar";
import { SKILL_SLOT_HEIGHT } from "../components/SkillSlot";
import { EXECUTE_TIMING, ExecuteEffect } from "../components/ExecuteEffect";
import { BeamEffect } from "../components/BeamEffect";
import { BEAM_TIMING, getSkill } from "../state/skills";
import {
  BuffVignette,
  FocusAura,
  FocusCastEffect,
  ShoutCastEffect,
  ShoutDebuff,
  StealAura,
  StealCastEffect,
  StealCoins,
} from "../components/SkillAuras";
import { DROP_ARRIVAL_MS, DropItem } from "../components/DropItem";
import { MonsterSpeechBubble } from "../components/MonsterSpeechBubble";
import { BOSS_NAME, ENEMY_NAME, STAGE_KILL_TARGET } from "../state/stages";
import { BOSS_LINES, MOB_LINES } from "../state/monsterLines";
import { ITEM_IMAGES } from "../state/recipes";
import type { DropEvent } from "../state/useGameState";
import { tutorialRef } from "../components/tutorialTargets";
import { getUnlocksAtLevel } from "../state/unlocks";
import { FlyingCoin } from "../components/FlyingCoin";
import { IconCaption } from "../components/IconCaption";
import type { BattlePhase, EnemyAnimation, EnemyKind, Outfit, PlayerAnimation } from "../types";

// Each boss art source fills a different fraction of its 160px frame (the original
// boss-slime asset nearly fills it edge to edge; the mushroom/potato ones were cropped
// with more headroom), so a flat displaySize makes them wildly inconsistent in size —
// scale each down to read as roughly the same on-screen height.
const BOSS_SIZE: Record<EnemyKind, number> = {
  slime: 128,
  mushroom: 158,
  carrot: 180,
  chicken: 165,
  potato: 165,
  mouse: 175,
  cauldron: 170,
  mudskipper: 175,
  bluefish: 180,
  salamander: 170,
  monkey: 170,
  carp: 175,
  cactus: 150,
  fox: 150,
  lizard: 160,
  mantou: 160,
  pig: 160,
  magpie: 160,
  snowRabbit: 160,
  drunkCat: 160,
  flowerSnake: 160,
  riceSack: 160,
  mackerel: 160,
  blossomCrab: 160,
  shrineFox: 160,
  armorBeetle: 160,
  onsenMonkey: 160,
  ninjaFrog: 160,
  lanternAngler: 160,
  clamMaid: 160,
  gondolaDuck: 160,
  bellCalf: 160,
  croissantKid: 160,
};

// Regular mobs render at a flat 108px by default; override here for the rare mob whose
// art reads too small or large at that size (same idea as BOSS_SIZE, just sparse since
// most mobs look fine at the default).
const MOB_SIZE: Partial<Record<EnemyKind, number>> = {
  pig: 140,
  // Its frames also hold its fox-fires and fanned tails, so the fox itself reads small.
  shrineFox: 140,
};

const BACKGROUND: Record<EnemyKind, number> = {
  slime: images.battleBackground,
  mushroom: images.battleBackgroundMushroom,
  carrot: images.battleBackgroundFarm,
  chicken: images.battleBackgroundChicken,
  potato: images.battleBackgroundPotatoCave,
  mouse: images.battleBackgroundVillage,
  cauldron: images.battleBackgroundMansionKitchen,
  mudskipper: images.battleBackgroundHarborBeach,
  bluefish: images.battleBackgroundSunkenReef,
  salamander: images.battleBackgroundVolcanoIsland,
  monkey: images.battleBackgroundTropicalJungle,
  carp: images.battleBackgroundOasis,
  cactus: images.battleBackgroundDesert,
  fox: images.battleBackgroundDesertMarket,
  lizard: images.battleBackgroundSilkRoadNight,
  mantou: images.battleBackgroundBambooCloudCity,
  pig: images.battleBackgroundBambooCloudPalace,
  magpie: images.battleBackgroundSnowVillage,
  snowRabbit: images.battleBackgroundSnowMountain,
  drunkCat: images.battleBackgroundSnowTavern,
  flowerSnake: images.battleBackgroundAzaleaPath,
  riceSack: images.battleBackgroundJoseonMarket,
  mackerel: images.battleBackgroundFishingPort,
  blossomCrab: images.battleBackgroundBlossomBeach,
  shrineFox: images.battleBackgroundFoxShrine,
  armorBeetle: images.battleBackgroundCastleKeep,
  onsenMonkey: images.battleBackgroundHotSpring,
  ninjaFrog: images.battleBackgroundNinjaVillage,
  lanternAngler: images.battleBackgroundDragonSeaRoad,
  clamMaid: images.battleBackgroundDragonPalace,
  gondolaDuck: images.battleBackgroundCanalCity,
  bellCalf: images.battleBackgroundAlpineVillage,
  croissantKid: images.battleBackgroundBakeryStreet,
};

// Scene geometry the drop animation needs, measured from the sky's bottom-right corner.
// Keep in sync with styles.fighters (right/bottom) and the bottom-right button row.
const FIGHTERS_BOTTOM = 55;
const FIGHTERS_SIDE = 15;
const STEAL_DURATION = getSkill("steal").durationMs ?? 0;
const FOCUS_DURATION = getSkill("focus").durationMs ?? 0;
const SHOUT_DURATION = getSkill("shout").durationMs ?? 0;
// A boss always gets a speech bubble on entrance (it's the stage's big moment); a regular
// mob only some of the time, or the fast auto-battle kill-chain would pop a bubble over
// every single death.
const MOB_SPEECH_CHANCE = 0.45;

// Turns a skill's ever-increasing cast counter into what the scene should play:
// - `id` is 0 for casts from before this scene mounted (e.g. before visiting another
//   tab), so coming back doesn't replay their effects;
// - `active` is true from a fresh cast until `durationMs` later (flipped on during
//   render so it lands in the same frame as the cast, and off by a timer).
function useSkillEvent(rawId: number, durationMs: number) {
  const [mountedId] = useState(rawId);
  const id = rawId === mountedId ? 0 : rawId;
  const [seenId, setSeenId] = useState(id);
  const [active, setActive] = useState(false);
  if (id !== seenId) {
    setSeenId(id);
    setActive(id > 0 && durationMs > 0);
  }
  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(() => setActive(false), durationMs);
    return () => clearTimeout(timer);
  }, [active, id, durationMs]);
  return { id, active };
}
const CHARACTER_WIDTH = 108;
const ENEMY_CENTER_RIGHT = 15 + 108 / 2;
const GROUND_BOTTOM = 68;
// Bottom-right button row: bag, cook pot, map. Every icon gets the same box; its art
// (trimmed to the visible pixels) is scaled to fit that box and centred in it, and the
// boxes sit on one line with equal gaps. Art that would look off when fitted whole
// declares a `fit` region instead — only that part is fitted, the rest may overflow.
type RowIcon = { source: number; width: number; height: number; fit?: { x: number; y: number; width: number; height: number } };

const ICON_BOX = { width: 52, height: 44 };
const ICON_GAP = 4;
const ROW_RIGHT = 8;
const ROW_BOTTOM = 6;
const BUTTON_ROW_CENTER = ROW_BOTTOM + ICON_BOX.height / 2;

const MAP_ICON: RowIcon = { source: icons.mapTrim, width: 669, height: 574 };
const BAG_ICON: RowIcon = { source: icons.backpackTrim, width: 349, height: 324 };
// The spoon pokes up out of the pot, so fitting the whole art makes the pot itself look
// small — fit the pot body (below the spoon, y >= 62) and let the spoon stick out.
const POT_ICON: RowIcon = { source: food.cookPotTrim, width: 356, height: 353, fit: { x: 0, y: 62, width: 356, height: 291 } };

// Image size/offset inside an ICON_BOX so the icon's fit region fills it, centred.
function fitInBox(icon: RowIcon) {
  const fit = icon.fit ?? { x: 0, y: 0, width: icon.width, height: icon.height };
  const scale = Math.min(ICON_BOX.width / fit.width, ICON_BOX.height / fit.height);
  return {
    position: "absolute" as const,
    width: icon.width * scale,
    height: icon.height * scale,
    left: ICON_BOX.width / 2 - (fit.x + fit.width / 2) * scale,
    top: ICON_BOX.height / 2 - (fit.y + fit.height / 2) * scale,
  };
}

// Right offset of the n-th box from the scene's right edge (0 = map, 1 = pot, 2 = bag).
const rowRight = (index: number) => ROW_RIGHT + index * (ICON_BOX.width + ICON_GAP);
const BAG_CENTER = { right: rowRight(2) + ICON_BOX.width / 2, bottom: BUTTON_ROW_CENTER };

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
  stageKills,
  questReady,
  onQuest,
  outfit,
  manualEnabled,
  onManualAttack,
  onOpenMap,
  onOpenKitchen,
  kitchenReadyDish,
  onOpenBag,
  bagFull,
  onCatchFlyingCoin,
  skillBar,
  goldEvents,
  executeId: rawExecuteId,
  firstStrikeId,
  executedKill,
  beamId: rawBeamId,
  stealId: rawStealId,
  focusId: rawFocusId,
  shoutId: rawShoutId,
  dropEvents,
  bossEntranceKey,
  levelUpAnnouncement,
  levelUpAttackGain,
}: {
  critical: boolean;
  damageEvents: { id: number; amount: number; critical: boolean; missed?: boolean }[];
  enemyHp: number;
  enemyMaxHp: number;
  boss: boolean;
  enemyKind: EnemyKind;
  phase: BattlePhase;
  enemyId: number;
  lastGoldReward: number;
  stageAdvance: string | null;
  stageLabel: string;
  stageKills: number;
  questReady: boolean;
  onQuest: () => void;
  outfit: Outfit;
  manualEnabled: boolean;
  onManualAttack: () => void;
  onOpenMap: () => void;
  onOpenKitchen: () => void;
  // A dish is done in a kitchen pot and waiting to be taken out.
  kitchenReadyDish: number | null;
  onOpenBag: () => void;
  bagFull: boolean;
  onCatchFlyingCoin: () => { gold: number; gems: number };
  skillBar: ReactNode;
  // Gold scattered by the Steal skill, one popup per hit.
  goldEvents: { id: number; amount: number }[];
  // Bumped each time Execute finishes an enemy (0 = never) — plays the teleport-slash.
  executeId: number;
  // 사무라이기니's first-strike draws — each plays the execute slash, without the dash.
  firstStrikeId: number;
  // The kill now playing out was an Execute — crit pose instead of the win pose.
  executedKill: boolean;
  // Bumped on each cast of that skill (0 = never).
  beamId: number;
  stealId: number;
  focusId: number;
  shoutId: number;
  dropEvents: DropEvent[];
  bossEntranceKey: string | null;
  levelUpAnnouncement: number | null;
  levelUpAttackGain: number;
}) {
  const { id: executeId } = useSkillEvent(rawExecuteId, 0);
  // Guinea Beam holds a crit pose from the cast until the beam has faded.
  const { id: beamId, active: beaming } = useSkillEvent(rawBeamId, BEAM_TIMING.end);
  const steal = useSkillEvent(rawStealId, STEAL_DURATION);
  const focus = useSkillEvent(rawFocusId, FOCUS_DURATION);
  const shout = useSkillEvent(rawShoutId, SHOUT_DURATION);
  // Every timed buff skill shares one vignette element; only one skill is ever equipped.
  const buffVignette = steal.active
    ? { key: `steal-${steal.id}`, durationMs: STEAL_DURATION }
    : focus.active
      ? { key: `focus-${focus.id}`, durationMs: FOCUS_DURATION }
      : shout.active
        ? { key: `shout-${shout.id}`, durationMs: SHOUT_DURATION }
        : null;

  // Monster chatter: a boss always speaks on entrance (the stage's big moment); a regular
  // mob only some of the time, or the fast auto-battle kill-chain would pop a bubble over
  // every single death. Rendered at the scene's top level (not nested under the enemy's
  // own clipped sprite column) so it has room to actually show instead of being cut off.
  const [speechLine, setSpeechLine] = useState<string | null>(null);
  useEffect(() => {
    const pool = boss ? BOSS_LINES[enemyKind] : MOB_LINES[enemyKind];
    setSpeechLine(boss || Math.random() < MOB_SPEECH_CHANCE ? pool[Math.floor(Math.random() * pool.length)] : null);
  }, [enemyId, boss, enemyKind]);

  const executing = phase === "defeated" && executedKill;
  const playerAnimation: PlayerAnimation =
    executing || beaming
      ? "critical"
      : phase === "attacking"
        ? critical ? "critical" : "attack"
        : phase === "hit" && critical
          ? "critical"
          : phase === "defeated"
            ? "win"
            : "idle";
  // A skill pose pins the guinea pig in place and always restarts its strip, even if the
  // swing before it was already a crit.
  const skillPoseKey = executing ? `execute-${executeId}` : beaming ? `beam-${beamId}` : null;

  const enemyAnimation: EnemyAnimation =
    phase === "hit" ? "hit" : phase === "defeated" ? "die" : "idle";
  const enemySize = boss ? BOSS_SIZE[enemyKind] : MOB_SIZE[enemyKind] ?? 108;
  // Sits just past the enemy's left edge at roughly its mid-height, scaling with its own
  // size (the sprite is always centred on ENEMY_CENTER_RIGHT regardless of how wide it
  // renders, so half its size is exactly the gap to clear it) — works the same for a
  // compact mob or a sprawling boss without the bubble ever overlapping the sprite.
  const speechAnchor = { right: ENEMY_CENTER_RIGHT + enemySize / 2 + 10, bottom: FIGHTERS_BOTTOM + enemySize * 0.5 };
  // Drops pop out of the enemy's middle and fly into the bag button's centre.
  const dropFrom = { right: ENEMY_CENTER_RIGHT, bottom: FIGHTERS_BOTTOM + enemySize * 0.45 };
  const dropTo = { dx: ENEMY_CENTER_RIGHT - BAG_CENTER.right, dy: dropFrom.bottom - BAG_CENTER.bottom };
  const stageProgress = (Math.min(stageKills, STAGE_KILL_TARGET) / STAGE_KILL_TARGET) * 100;

  // Finishing-blow punch: a quick zoom on both fighters, on every kill (not just
  // bosses) — re-fires each time `phase` cycles back to "defeated".
  const killPunch = useSharedValue(1);
  useEffect(() => {
    if (phase !== "defeated") return;
    killPunch.value = withSequence(
      withTiming(1.07, { duration: 90, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: 220, easing: Easing.inOut(Easing.quad) }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);
  const sceneShake = useSharedValue(0);
  useEffect(() => {
    if (beamId === 0) return;
    sceneShake.value = withDelay(
      BEAM_TIMING.hit,
      withSequence(
        withTiming(7, { duration: 35 }),
        withTiming(-6, { duration: 45 }),
        withTiming(5, { duration: 45 }),
        withTiming(-3, { duration: 45 }),
        withTiming(0, { duration: 45 }),
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beamId]);
  const killPunchStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: sceneShake.value }, { translateY: sceneShake.value * -0.4 }, { scale: killPunch.value }],
  }));
  // Flying gold coins only for the fresh kill this render reflects (new enemyId + reward).
  const goldFlyFrom = { right: ENEMY_CENTER_RIGHT, bottom: FIGHTERS_BOTTOM + enemySize * 0.6 };

  // Execute: the guinea pig blinks across to just in front of the enemy and back. The
  // fighters row is measured since the gap between the two depends on screen width.
  const [fightersWidth, setFightersWidth] = useState(0);
  const playerCenterLeft = FIGHTERS_SIDE + CHARACTER_WIDTH / 2;
  const enemyCenterLeft = FIGHTERS_SIDE + fightersWidth - CHARACTER_WIDTH / 2;
  const arrivalCenterLeft = Math.max(playerCenterLeft, enemyCenterLeft - enemySize * 0.5 - 22);
  const teleportX = arrivalCenterLeft - playerCenterLeft;
  const bodyBottom = FIGHTERS_BOTTOM + 45;

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

          {/* One vignette for every buff skill — Steal and Focus render this exact element.
              It sits right on the backdrop, under the stage bar, fighters and buttons. */}
          {buffVignette && <BuffVignette key={buffVignette.key} durationMs={buffVignette.durationMs} />}

          <LinearGradient
            colors={["#171d19e8", "#263125a8", "#26312500"]}
            locations={[0, 0.62, 1]}
            style={styles.stageBar}
            pointerEvents="box-none"
          >
            <View style={styles.stageBarInfo} pointerEvents="none">
              <StrokedText style={styles.stageBarTitle} strokeColor={colors.line} strokeWidth={1.5}>
                {stageLabel}
              </StrokedText>
              <ProgressBar
                progress={stageProgress}
                height={18}
                label={`${Math.min(stageKills, STAGE_KILL_TARGET)} / ${STAGE_KILL_TARGET}`}
                style={styles.stageBarTrack}
              />
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="퀘스트"
              onPress={onQuest}
              hitSlop={6}
              style={({ pressed }) => [styles.questButton, pressed && styles.questPressed]}
            >
              <WobblingMedal wobble={questReady} />
              <IconCaption offset={-5}>퀘스트</IconCaption>
              {questReady && <Image source={kitImages.dotRed} style={styles.questDot} accessibilityLabel="받을 보상 있음" />}
            </Pressable>
          </LinearGradient>

          <FlyingCoin onCatch={onCatchFlyingCoin} />
          {stageAdvance && <StageAdvanceBanner key={stageAdvance} stageLabel={stageAdvance} />}
          {bossEntranceKey && <BossEntranceBanner key={bossEntranceKey} bossName={BOSS_NAME[enemyKind]} />}
          {levelUpAnnouncement !== null && <UnlockToast key={`unlock-${levelUpAnnouncement}`} level={levelUpAnnouncement} />}
          {speechLine && <MonsterSpeechBubble key={enemyId} line={speechLine} anchor={speechAnchor} onClose={() => setSpeechLine(null)} />}


          <Animated.View
            style={[styles.fighters, killPunchStyle]}
            onLayout={(event) => setFightersWidth(event.nativeEvent.layout.width)}
          >
            <PlayerFighter
              animation={playerAnimation}
              outfit={outfit}
              boss={boss}
              executeId={executeId}
              beamId={beamId}
              skillPoseKey={skillPoseKey}
              teleportX={teleportX}
              stealAuraId={steal.active ? steal.id : 0}
              focusAuraId={focus.active ? focus.id : 0}
            />
            {levelUpAnnouncement !== null && (
              <LevelUpBurst key={levelUpAnnouncement} level={levelUpAnnouncement} attackGain={levelUpAttackGain} />
            )}

            <EnemyFighter
              animation={enemyAnimation}
              boss={boss}
              enemyKind={enemyKind}
              enemyId={enemyId}
              currentHp={enemyHp}
              maxHp={enemyMaxHp}
              phase={phase}
              size={enemySize}
              critical={critical}
              beamId={beamId}
              shoutDebuffId={shout.active ? shout.id : 0}
              executedKill={executedKill}
            />

            {/* Kept below the enemy nameplate (fixed at bottom: 112) so numbers never cover
                the name or HP bar — they float up over the sprite's body instead. */}
            <View style={styles.effects} pointerEvents="none">
              {damageEvents.map((event) => (
                <DamageNumber key={event.id} amount={event.amount} critical={event.critical} missed={event.missed} />
              ))}
              {phase === "defeated" && <CoinPopup key={`coin-${enemyId}`} amount={lastGoldReward} />}
              {goldEvents.map((event) => (
                <CoinPopup key={`steal-${event.id}`} amount={event.amount} />
              ))}
            </View>
          </Animated.View>

          <BagButton onPress={onOpenBag} dropEvents={dropEvents} full={bagFull} />

          <Pressable
            onPress={onOpenKitchen}
            accessibilityRole="button"
            accessibilityLabel="요리 페이지 열기"
            hitSlop={8}
            style={({ pressed }) => [styles.kitchenButton, pressed && styles.mapButtonPressed]}
          >
            <Image source={POT_ICON.source} style={fitInBox(POT_ICON)} />
            {kitchenReadyDish !== null && <KitchenReadyBadge dish={kitchenReadyDish} />}
            <IconCaption>요리</IconCaption>
          </Pressable>

          <Pressable
            onPress={onOpenMap}
            accessibilityRole="button"
            accessibilityLabel="마일스톤 지도 열기"
            hitSlop={8}
            style={({ pressed }) => [styles.mapButton, pressed && styles.mapButtonPressed]}
          >
            <Image source={MAP_ICON.source} style={fitInBox(MAP_ICON)} />
            <IconCaption shift={5}>지도</IconCaption>
          </Pressable>

          <View style={styles.skillBar}>{skillBar}</View>

          {beamId > 0 && fightersWidth > 0 && (
            <BeamEffect
              key={`beam-${beamId}`}
              mouth={{ left: playerCenterLeft + 34, bottom: FIGHTERS_BOTTOM + 48 }}
              targetLeft={enemyCenterLeft + 20}
              enemy={{ left: enemyCenterLeft, bottom: FIGHTERS_BOTTOM + enemySize * 0.45 }}
            />
          )}

          {steal.id > 0 && <StealCastEffect key={`steal-${steal.id}`} at={{ left: playerCenterLeft, bottom: bodyBottom }} />}
          {focus.id > 0 && <FocusCastEffect key={`focus-${focus.id}`} at={{ left: playerCenterLeft, bottom: bodyBottom }} />}
          {shout.id > 0 && fightersWidth > 0 && (
            <ShoutCastEffect
              key={`shout-${shout.id}`}
              mouth={{ left: playerCenterLeft + 34, bottom: FIGHTERS_BOTTOM + 48 }}
              enemy={{ left: enemyCenterLeft, bottom: FIGHTERS_BOTTOM + enemySize * 0.45 }}
            />
          )}
          {fightersWidth > 0 &&
            goldEvents.map((event) => (
              <StealCoins
                key={`steal-coins-${event.id}`}
                from={{ left: enemyCenterLeft, bottom: FIGHTERS_BOTTOM + enemySize * 0.45 }}
                to={{ left: playerCenterLeft, bottom: bodyBottom }}
              />
            ))}

          {firstStrikeId > 0 && fightersWidth > 0 && (
            <ExecuteEffect
              key={`first-strike-${firstStrikeId}`}
              home={{ left: playerCenterLeft, bottom: bodyBottom }}
              arrival={{ left: playerCenterLeft, bottom: bodyBottom }}
              enemy={{ left: enemyCenterLeft, bottom: FIGHTERS_BOTTOM + enemySize * 0.45 }}
              dash={false}
            />
          )}
          {executeId > 0 && fightersWidth > 0 && (
            <ExecuteEffect
              key={`execute-${executeId}`}
              home={{ left: playerCenterLeft, bottom: bodyBottom }}
              arrival={{ left: arrivalCenterLeft, bottom: bodyBottom }}
              enemy={{ left: enemyCenterLeft, bottom: FIGHTERS_BOTTOM + enemySize * 0.45 }}
            />
          )}

          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {dropEvents.map((event) => (
              <DropItem
                key={event.id}
                image={ITEM_IMAGES[event.name]}
                delay={event.delay}
                from={dropFrom}
                groundDrop={dropFrom.bottom - GROUND_BOTTOM}
                to={dropTo}
              />
            ))}
            {phase === "defeated" && [0, 1, 2].map((index) => (
              <GoldFly key={`gold-${enemyId}-${index}`} delay={index * 70} from={goldFlyFrom} />
            ))}
          </View>
        </ImageBackground>
      </Pressable>
    </View>
  );
}

// Opens the bag; bumps each time a dropped ingredient lands in it.
// Under the stage bar on a level-up that opens a skill — says what just opened.
function UnlockToast({ level }: { level: number }) {
  const { skills } = getUnlocksAtLevel(level);
  const lines = skills.map((id) => `새 스킬 해금! ${getSkill(id).name}`);
  if (lines.length === 0) return null;
  return (
    <View style={styles.unlockToast} pointerEvents="none">
      {lines.map((line) => (
        <StrokedText key={line} style={styles.unlockText} strokeColor={colors.line}>
          {line}
        </StrokedText>
      ))}
    </View>
  );
}

function BagButton({ onPress, dropEvents, full }: { onPress: () => void; dropEvents: DropEvent[]; full: boolean }) {
  const bump = useSharedValue(1);
  const lastSeen = useRef(0);

  useEffect(() => {
    const fresh = dropEvents.filter((event) => event.id > lastSeen.current);
    if (fresh.length === 0) return;
    lastSeen.current = Math.max(...fresh.map((event) => event.id));
    const lastArrival = Math.max(...fresh.map((event) => event.delay)) + DROP_ARRIVAL_MS;
    bump.value = withDelay(lastArrival, withSequence(withTiming(1.22, { duration: 90 }), withTiming(1, { duration: 160 })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dropEvents]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: bump.value }] }));

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      ref={tutorialRef("bag")}
      accessibilityLabel={full ? "가방 열기 (가득 참)" : "가방 열기"}
      hitSlop={8}
      style={({ pressed }) => [styles.bagButton, pressed && styles.mapButtonPressed]}
    >
      <Animated.Image source={BAG_ICON.source} style={[fitInBox(BAG_ICON), style]} />
      <IconCaption>가방</IconCaption>
      {full && (
        <View style={styles.bagFull} pointerEvents="none">
          <Text style={styles.bagFullText}>가득</Text>
        </View>
      )}
    </Pressable>
  );
}

function PlayerFighter({
  animation,
  outfit,
  boss,
  executeId,
  beamId,
  skillPoseKey,
  teleportX,
  stealAuraId,
  focusAuraId,
}: {
  animation: PlayerAnimation;
  outfit: Outfit;
  boss: boolean;
  executeId: number;
  beamId: number;
  // Set while a skill pose (Execute's cut, Guinea Beam) plays: no swing lunge/shake on
  // top of it, and the strip restarts per cast.
  skillPoseKey: string | null;
  teleportX: number;
  // Non-zero (the cast's id) while that buff skill's aura should show.
  stealAuraId: number;
  focusAuraId: number;
}) {
  const isAttacking = animation === "attack" || animation === "critical";
  const shake = useSharedValue(0);
  const lunge = useSharedValue(0);
  const teleport = useSharedValue(0);
  const visible = useSharedValue(1);
  const recoil = useSharedValue(0);

  // Guinea Beam kicks the guinea pig back a step as it fires, then it plants again.
  useEffect(() => {
    if (beamId === 0) return;
    recoil.value = withDelay(
      BEAM_TIMING.fire,
      withSequence(
        withTiming(1, { duration: 60, easing: Easing.out(Easing.quad) }),
        withDelay(BEAM_TIMING.hit - BEAM_TIMING.fire + 80, withTiming(0, { duration: 260, easing: Easing.inOut(Easing.quad) })),
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beamId]);

  // Execute's ninja blink: fade out, jump to the enemy, pop back in for the cut, then the
  // same in reverse.
  useEffect(() => {
    if (executeId === 0) return;
    const { vanish, arrive, leave, home } = EXECUTE_TIMING;
    teleport.value = withSequence(
      withDelay(vanish, withTiming(teleportX, { duration: 0 })),
      withDelay(home - vanish, withTiming(0, { duration: 0 })),
    );
    visible.value = withSequence(
      withTiming(0, { duration: vanish }),
      withTiming(1, { duration: arrive - vanish }),
      withDelay(leave - arrive, withTiming(0, { duration: home - leave })),
      withTiming(1, { duration: 60 }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [executeId]);

  useEffect(() => {
    // A skill pose pins the guinea pig (e.g. at Execute's teleport spot) — kill any swing
    // motion still in flight, like a crit lunge from the swing that triggered it.
    if (skillPoseKey) {
      shake.value = 0;
      lunge.value = 0;
      return;
    }
    if (isAttacking) {
      shake.value = withSequence(withTiming(1, { duration: 130, easing: Easing.inOut(Easing.quad) }), withTiming(0, { duration: 130, easing: Easing.inOut(Easing.quad) }));
    }
    if (animation === "critical") {
      lunge.value = withSequence(withTiming(1, { duration: 260, easing: Easing.inOut(Easing.quad) }), withTiming(0, { duration: 260, easing: Easing.inOut(Easing.quad) }));
    } else {
      lunge.value = 0;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animation, skillPoseKey]);

  const style = useAnimatedStyle(() => ({
    opacity: visible.value,
    transform: [
      { translateX: shake.value * 24 + lunge.value * 112 + teleport.value - recoil.value * 12 },
      { rotate: `${shake.value * 4}deg` },
      { scale: 1 + lunge.value * 0.05 },
    ],
  }));

  return (
    <Animated.View style={[styles.characterWrap, style]}>
      {stealAuraId > 0 && <StealAura key={`steal-${stealAuraId}`} durationMs={STEAL_DURATION} />}
      {focusAuraId > 0 && <FocusAura key={`focus-${focusAuraId}`} durationMs={FOCUS_DURATION} />}
      <View style={styles.unitLabel}>
        <Text style={styles.unitLabelText}>기니</Text>
      </View>
      <CharacterSprite
        outfit={outfit}
        animation={animation}
        repeat={animation === "win" && boss ? 3 : 1}
        restartKey={skillPoseKey ? `${outfit}-${skillPoseKey}` : `${outfit}-${animation}`}
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
  critical,
  beamId,
  shoutDebuffId,
  executedKill,
}: {
  animation: EnemyAnimation;
  boss: boolean;
  enemyKind: EnemyKind;
  enemyId: number;
  currentHp: number;
  maxHp: number;
  phase: BattlePhase;
  size: number;
  critical: boolean;
  beamId: number;
  // Non-zero (the cast's id) while Shout's debuff mark should show.
  shoutDebuffId: number;
  // True while the current "defeated" phase is the result of an Execute kill — swaps the
  // usual shrink-and-fade for the sprite slicing in half along Execute's cut.
  executedKill: boolean;
}) {
  const shake = useSharedValue(0);
  const knockback = useSharedValue(0);
  const hitFlash = useSharedValue(0);
  const defeat = useSharedValue(0);
  const split = useSharedValue(0);
  const cutFlash = useSharedValue(0);
  const enter = useSharedValue(phase === "entering" ? 0 : 1);
  const beamPush = useSharedValue(0);
  const beamFlash = useSharedValue(0);

  // Guinea Beam connecting: a white flash and a shove back. A mob dies on the spot anyway;
  // a boss (which survives at half HP) gets dragged further and slowly plants its feet.
  useEffect(() => {
    if (beamId === 0) return;
    beamFlash.value = withDelay(
      BEAM_TIMING.hit,
      withSequence(withTiming(1, { duration: 40 }), withTiming(0.7, { duration: 120 }), withTiming(0, { duration: 200 })),
    );
    beamPush.value = withDelay(
      BEAM_TIMING.hit,
      withSequence(
        withTiming(1, { duration: 140, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 420, easing: Easing.inOut(Easing.quad) }),
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beamId]);

  useEffect(() => {
    if (phase === "hit") {
      // A brief static hold (hit-stop) before the knockback punches out and eases back,
      // instead of jumping straight into the recoil — sells the impact as actually landing.
      knockback.value = withSequence(
        withTiming(0, { duration: 55 }),
        withTiming(1, { duration: 70, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 190, easing: Easing.out(Easing.quad) }),
      );
      shake.value = withSequence(withTiming(0, { duration: 55 }), withTiming(1, { duration: 160 }), withTiming(0, { duration: 160 }));
      hitFlash.value = withSequence(withTiming(1, { duration: 55 }), withTiming(0.85, { duration: 40 }), withTiming(0, { duration: 110 }));
    }
    if (phase === "defeated") {
      defeat.value = withTiming(1, { duration: 620, easing: Easing.in(Easing.quad) });
      if (executedKill) {
        // The split itself carries the sprite's exit motion, so the container's own
        // shrink/sink/rotate stays off for this death — see `style` below.
        cutFlash.value = withSequence(withTiming(1, { duration: 30 }), withTiming(0, { duration: 220 }));
        split.value = withTiming(1, { duration: 420, easing: Easing.out(Easing.quad) });
      }
    } else {
      defeat.value = 0;
      split.value = 0;
      cutFlash.value = 0;
    }
    if (phase === "entering") {
      enter.value = 0;
      enter.value = withTiming(1, { duration: 220, easing: Easing.out(Easing.quad) });
    } else if (phase === "idle") {
      enter.value = 1;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, executedKill]);

  const style = useAnimatedStyle(() => ({
    opacity: (1 - defeat.value) * (0.4 + enter.value * 0.6),
    transform: [
      {
        translateX:
          knockback.value * 14 - (executedKill ? 0 : defeat.value * -7) + (1 - enter.value) * 35 + beamPush.value * (boss ? 34 : 18),
      },
      { translateY: executedKill ? 0 : defeat.value * 30 },
      { rotate: `${shake.value * 5 + (executedKill ? 0 : defeat.value * 18)}deg` },
      { scale: executedKill ? 1 : 1 - defeat.value * 0.65 + (1 - enter.value) * -0.4 },
    ],
  }));
  const hitFlashStyle = useAnimatedStyle(() => ({ opacity: Math.max(hitFlash.value, beamFlash.value) }));
  // Top half slides up-left, bottom half drops down-right — an uneven split reads more
  // like a real cut than two pieces mirroring each other.
  const topHalfStyle = useAnimatedStyle(() => ({
    opacity: 1 - Math.max(0, split.value - 0.5) * 2,
    transform: [{ translateX: -split.value * 16 }, { translateY: -split.value * 22 }, { rotate: `${-split.value * 10}deg` }],
  }));
  const bottomHalfStyle = useAnimatedStyle(() => ({
    opacity: 1 - Math.max(0, split.value - 0.5) * 2,
    transform: [{ translateX: split.value * 14 }, { translateY: split.value * 28 }, { rotate: `${split.value * 12}deg` }],
  }));
  const cutLineStyle = useAnimatedStyle(() => ({
    opacity: cutFlash.value,
    transform: [{ scaleX: 1 + split.value * 0.5 }],
  }));

  return (
    <Animated.View style={[styles.characterWrap, style]}>
      {shoutDebuffId > 0 && <ShoutDebuff key={`shout-${shoutDebuffId}`} durationMs={SHOUT_DURATION} />}
      {/* Fixed position regardless of sprite size, so the boss's HP bar lines up with a
          regular mob's — the (much taller) boss sprite grows upward behind it instead. */}
      <View style={[styles.unitLabel, styles.enemyNameplate, styles.enemyNameplateFixed, boss && styles.enemyNameplateBoss]}>
        <Text style={styles.unitLabelText}>{boss ? BOSS_NAME[enemyKind] : `${ENEMY_NAME[enemyKind]} ${enemyId}`}</Text>
        <ProgressBar progress={(currentHp / maxHp) * 100} fill="red" height={11} style={styles.unitHealthTrack} />
      </View>
      {executedKill && phase === "defeated" ? (
        <View style={{ width: size, height: size }}>
          <Animated.View style={[styles.executeHalf, { width: size, height: size / 2 }, topHalfStyle]}>
            <EnemySprite boss={boss} kind={enemyKind} animation={animation} size={size} restartKey={`${animation}-${enemyId}`} />
          </Animated.View>
          <Animated.View style={[styles.executeHalf, { top: size / 2, width: size, height: size / 2 }, bottomHalfStyle]}>
            <View style={{ position: "absolute", top: -size / 2, left: 0, width: size, height: size }}>
              <EnemySprite boss={boss} kind={enemyKind} animation={animation} size={size} restartKey={`${animation}-${enemyId}`} />
            </View>
          </Animated.View>
          <Animated.View style={[styles.executeCutLine, { top: size / 2, width: size + 16 }, cutLineStyle]} pointerEvents="none" />
        </View>
      ) : (
        <EnemySprite boss={boss} kind={enemyKind} animation={animation} size={size} restartKey={`${animation}-${enemyId}`} />
      )}
      {/* White silhouette flash on every landed hit — same sprite/frame, tinted and faded
          in/out fast, so it exactly matches the current pose with no extra art. */}
      <Animated.View style={[styles.hitFlash, { width: size, height: size }, hitFlashStyle]} pointerEvents="none">
        <EnemySprite boss={boss} kind={enemyKind} animation={animation} size={size} restartKey={`${animation}-${enemyId}`} tintColor="#ffffff" />
      </Animated.View>
      {/* Mounts/unmounts with the hit phase itself, so it restarts fresh on every crit
          without needing its own restartKey. */}
      {phase === "hit" && critical && (
        <View style={[styles.critFlash, { width: size * 1.1, height: size * 1.1 }]} pointerEvents="none">
          <SpriteStrip source={effects.critFlash} frameSize={FRAME_SIZE} frameCount={3} displaySize={size * 1.1} durationMs={240} mode="once" />
        </View>
      )}
    </Animated.View>
  );
}

// The quest medal — rocks back and forth now and then while a reward waits to be claimed.
function WobblingMedal({ wobble }: { wobble: boolean }) {
  const r = useSharedValue(0);
  useEffect(() => {
    r.value = wobble
      ? withRepeat(withSequence(withTiming(-14, { duration: 90 }), withTiming(12, { duration: 120 }), withTiming(-8, { duration: 110 }), withTiming(0, { duration: 90 }), withDelay(1300, withTiming(0, { duration: 0 }))), -1)
      : withTiming(0, { duration: 100 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wobble]);
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${r.value}deg` }] }));
  return <Animated.Image source={icons.questMedal} style={[styles.questIcon, style]} />;
}

// On the kitchen button while a dish waits in a pot: the red dot hops and the dish
// floats above the button.
function KitchenReadyBadge({ dish }: { dish: number }) {
  const hop = useSharedValue(0);
  const float = useSharedValue(0);
  useEffect(() => {
    hop.value = withRepeat(withSequence(withTiming(1, { duration: 180, easing: Easing.out(Easing.quad) }), withTiming(0, { duration: 180, easing: Easing.in(Easing.quad) }), withDelay(900, withTiming(0, { duration: 0 }))), -1);
    float.value = withRepeat(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }), -1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const dotStyle = useAnimatedStyle(() => ({ transform: [{ translateY: -hop.value * 6 }] }));
  const dishStyle = useAnimatedStyle(() => ({ transform: [{ translateY: -float.value * 5 }] }));
  return (
    <>
      <Animated.Image source={dish} style={[styles.kitchenFloatDish, dishStyle]} />
      <Animated.Image source={kitImages.dotRed} style={[styles.kitchenDot, dotStyle]} accessibilityLabel="완성된 요리 있음" />
    </>
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
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stageBarInfo: { flex: 1, alignItems: "center" },
  stageBarTitle: { color: colors.cream, fontSize: 16, fontWeight: "900", fontFamily: fonts.bold, letterSpacing: -0.3 },
  stageBarTrack: { width: "100%", marginTop: 4 },
  questButton: { width: 42, height: 42, alignItems: "center", justifyContent: "center" },
  questPressed: { transform: [{ scale: 0.92 }] },
  questIcon: { width: 38, height: 38 },
  // Just a dot — whether there's something to claim, not how many.
  unlockToast: {
    position: "absolute",
    top: 62,
    alignSelf: "center",
    left: 40,
    right: 40,
    alignItems: "center",
    gap: 2,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "#14100cb3",
    borderWidth: 2,
    borderColor: "#ffd34d",
    zIndex: 12,
  },
  unlockText: { fontSize: 13, fontWeight: "900", fontFamily: fonts.bold, color: "#ffe9a3" },
  // Red tag on the bag's corner while new kinds of drops are being turned away.
  bagFull: { position: "absolute", top: -4, right: -6, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 7, backgroundColor: colors.red, borderWidth: 1.5, borderColor: colors.line },
  bagFullText: { fontSize: 9, fontWeight: "900", fontFamily: fonts.bold, color: colors.cream },
  questDot: { position: "absolute", right: 3, top: 2, width: 12, height: 12 },
  kitchenFloatDish: { position: "absolute", top: -26, left: "50%", marginLeft: -11, width: 22, height: 22 },
  kitchenDot: { position: "absolute", right: -2, top: -2, width: 12, height: 12 },
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
  mapButton: { position: "absolute", right: rowRight(0), bottom: ROW_BOTTOM, ...ICON_BOX },
  kitchenButton: { position: "absolute", right: rowRight(1), bottom: ROW_BOTTOM, ...ICON_BOX },
  bagButton: { position: "absolute", right: rowRight(2), bottom: ROW_BOTTOM, ...ICON_BOX },
  mapButtonPressed: { transform: [{ scale: 0.92 }] },
  // Bottom-left, mirroring the right-hand button row's inset; sits below the player sprite.
  skillBar: { position: "absolute", left: ROW_RIGHT, bottom: ROW_BOTTOM + (ICON_BOX.height - SKILL_SLOT_HEIGHT) / 2 },
  effects: { position: "absolute", right: 96, bottom: 30, zIndex: 10 },
  // Below enemyNameplateFixed's zIndex: 5 so a big flash can never cover the HP bar.
  critFlash: { position: "absolute", bottom: 0, alignSelf: "center", zIndex: 4 },
  // Sits right over the base sprite (same box), below critFlash/the nameplate.
  hitFlash: { position: "absolute", bottom: 0, alignSelf: "center", zIndex: 3 },
  // Execute's two sprite halves — each clips its own full-size copy of the sprite to just
  // one half, then the two slide apart (see topHalfStyle/bottomHalfStyle).
  executeHalf: { position: "absolute", top: 0, left: 0, overflow: "hidden" },
  executeCutLine: { position: "absolute", left: -8, height: 3, borderRadius: 1.5, backgroundColor: "#ffffff" },
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
  // so a much taller boss sprite doesn't drag its HP bar up with it. zIndex keeps it
  // painted above the sprite below — a tall boss (e.g. the mushroom boss's cap) can
  // otherwise grow up past bottom: 112 and paint over its own name/HP bar.
  enemyNameplateFixed: { position: "absolute", bottom: 112, zIndex: 5 },
  enemyNameplateBoss: { width: 116 },
  unitHealthTrack: { width: "100%" },
});
