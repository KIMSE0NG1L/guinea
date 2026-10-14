import { useEffect, useRef } from "react";
import { Image, ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming, Easing } from "react-native-reanimated";
import { colors, fonts } from "../theme";
import { effects, food, icons, images, FRAME_SIZE } from "../assets";
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
import { DROP_ARRIVAL_MS, DropItem } from "../components/DropItem";
import { BUFF_SLOT_SIZE, BuffSlots } from "../components/BuffSlots";
import type { BuffSlot } from "../state/buffs";
import { formatGameNumber } from "../state/gameMath";
import { BOSS_NAME, ENEMY_NAME, STAGE_KILL_TARGET } from "../state/stages";
import { ITEM_IMAGES } from "../state/recipes";
import type { DropEvent } from "../state/useGameState";
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
};

const BACKGROUND: Record<EnemyKind, number> = {
  slime: images.battleBackground,
  mushroom: images.battleBackgroundMushroom,
  carrot: images.battleBackgroundFarm,
  chicken: images.battleBackgroundChicken,
  potato: images.battleBackgroundPotatoCave,
  mouse: images.battleBackgroundVillage,
};

// Scene geometry the drop animation needs, measured from the sky's bottom-right corner.
// Keep in sync with styles.fighters (right/bottom) and the bottom-right button row.
const FIGHTERS_BOTTOM = 55;
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
  outfit,
  manualEnabled,
  onManualAttack,
  onOpenMap,
  onOpenKitchen,
  onOpenBag,
  dropEvents,
  buffSlots,
  now,
  onPressBuffSlot,
  bossEntranceKey,
  levelUpAnnouncement,
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
  stageKills: number;
  outfit: Outfit;
  manualEnabled: boolean;
  onManualAttack: () => void;
  onOpenMap: () => void;
  onOpenKitchen: () => void;
  onOpenBag: () => void;
  dropEvents: DropEvent[];
  buffSlots: BuffSlot[];
  now: number;
  onPressBuffSlot: (index: number) => void;
  bossEntranceKey: string | null;
  levelUpAnnouncement: number | null;
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
  const killPunchStyle = useAnimatedStyle(() => ({ transform: [{ scale: killPunch.value }] }));
  // Flying gold coins only for the fresh kill this render reflects (new enemyId + reward).
  const goldFlyFrom = { right: ENEMY_CENTER_RIGHT, bottom: FIGHTERS_BOTTOM + enemySize * 0.6 };

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
            <ProgressBar progress={stageProgress} height={12} style={styles.stageBarTrack} />
            <Text style={styles.stageBarCount}>{Math.min(stageKills, STAGE_KILL_TARGET)} / {STAGE_KILL_TARGET}</Text>
          </LinearGradient>

          {stageAdvance && <StageAdvanceBanner key={stageAdvance} stageLabel={stageAdvance} />}
          {bossEntranceKey && <BossEntranceBanner key={bossEntranceKey} bossName={BOSS_NAME[enemyKind]} />}

          <Animated.View style={[styles.fighters, killPunchStyle]}>
            <PlayerFighter animation={playerAnimation} outfit={outfit} boss={boss} />
            {levelUpAnnouncement !== null && <LevelUpBurst key={levelUpAnnouncement} level={levelUpAnnouncement} />}

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
            />

            {/* Kept below the enemy nameplate (fixed at bottom: 112) so numbers never cover
                the name or HP bar — they float up over the sprite's body instead. */}
            <View style={styles.effects} pointerEvents="none">
              {damageEvents.map((event) => (
                <DamageNumber key={event.id} amount={event.amount} critical={event.critical} />
              ))}
              {phase === "defeated" && <CoinPopup key={`coin-${enemyId}`} amount={lastGoldReward} />}
            </View>
          </Animated.View>

          <BuffSlots slots={buffSlots} now={now} onPressSlot={onPressBuffSlot} style={styles.buffSlots} />

          <BagButton onPress={onOpenBag} dropEvents={dropEvents} />

          <Pressable
            onPress={onOpenKitchen}
            accessibilityRole="button"
            accessibilityLabel="요리 페이지 열기"
            hitSlop={8}
            style={({ pressed }) => [styles.kitchenButton, pressed && styles.mapButtonPressed]}
          >
            <Image source={POT_ICON.source} style={fitInBox(POT_ICON)} />
          </Pressable>

          <Pressable
            onPress={onOpenMap}
            accessibilityRole="button"
            accessibilityLabel="마일스톤 지도 열기"
            hitSlop={8}
            style={({ pressed }) => [styles.mapButton, pressed && styles.mapButtonPressed]}
          >
            <Image source={MAP_ICON.source} style={fitInBox(MAP_ICON)} />
          </Pressable>

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
function BagButton({ onPress, dropEvents }: { onPress: () => void; dropEvents: DropEvent[] }) {
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
      accessibilityLabel="가방 열기"
      hitSlop={8}
      style={({ pressed }) => [styles.bagButton, pressed && styles.mapButtonPressed]}
    >
      <Animated.Image source={BAG_ICON.source} style={[fitInBox(BAG_ICON), style]} />
    </Pressable>
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
        // The critical strip draws the guinea pig noticeably smaller than every other
        // animation (to leave room for its burst effects) — compensate so it doesn't
        // visibly shrink mid-combo.
        scale={animation === "critical" ? 1.18 : 1}
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
  critical,
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
}) {
  const shake = useSharedValue(0);
  const knockback = useSharedValue(0);
  const hitFlash = useSharedValue(0);
  const defeat = useSharedValue(0);
  const enter = useSharedValue(phase === "entering" ? 0 : 1);

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
      { translateX: knockback.value * 14 - defeat.value * -7 + (1 - enter.value) * 35 },
      { translateY: defeat.value * 30 },
      { rotate: `${shake.value * 5 + defeat.value * 18}deg` },
      { scale: 1 - defeat.value * 0.65 + (1 - enter.value) * -0.4 },
    ],
  }));
  const hitFlashStyle = useAnimatedStyle(() => ({ opacity: hitFlash.value }));

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
  stageBarTrack: { width: "100%", marginTop: 4 },
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
  mapButton: { position: "absolute", right: rowRight(0), bottom: ROW_BOTTOM, ...ICON_BOX },
  kitchenButton: { position: "absolute", right: rowRight(1), bottom: ROW_BOTTOM, ...ICON_BOX },
  bagButton: { position: "absolute", right: rowRight(2), bottom: ROW_BOTTOM, ...ICON_BOX },
  mapButtonPressed: { transform: [{ scale: 0.92 }] },
  // Bottom-left, on the same centre line as the bottom-right button row.
  buffSlots: { position: "absolute", left: 8, bottom: BUTTON_ROW_CENTER - BUFF_SLOT_SIZE / 2 },
  effects: { position: "absolute", right: 96, bottom: 30, zIndex: 10 },
  // Below enemyNameplateFixed's zIndex: 5 so a big flash can never cover the HP bar.
  critFlash: { position: "absolute", bottom: 0, alignSelf: "center", zIndex: 4 },
  // Sits right over the base sprite (same box), below critFlash/the nameplate.
  hitFlash: { position: "absolute", bottom: 0, alignSelf: "center", zIndex: 3 },
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
  unitHealthTrack: { width: "100%", height: 6, overflow: "hidden", backgroundColor: "#211a16", borderWidth: 1, borderColor: "#f7ecd066", borderRadius: 5 },
  unitHealthFill: { height: "100%", backgroundColor: "#dc6048" },
});
