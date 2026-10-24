import { useEffect, useRef, useState } from "react";
import { Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming, type SharedValue } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { colors, fonts } from "../../theme";
import { icons, images, villageUi } from "../../assets";
import { CharacterSprite } from "../../components/CharacterSprite";
import { StrokedText } from "../../components/StrokedText";
import { isOutfitUnlocked, OUTFIT_UNLOCK_STAGE } from "../../state/unlocks";
import type { Outfit } from "../../types";
import { BACKDROP, DEPTH, getBackdropSize, getHomes, House, PROPS, Swing } from "./villageWorld";

export type VillageCompanion = { outfit: Outfit; name: string; blurb: string };

// One line each 기니 says when you tap them in the village.
const LINES: Record<Outfit, string> = {
  default: "오늘은 또 어떤 맛을 찾으러 가 볼까?",
  explorerHamster: "저 숲 너머에 전설의 당근이 있대!",
  tetoGini: "오늘도 3대 500… 아니, 헛스윙 500.",
  assassinGini: "…쉿. 방금 그건 못 본 걸로 해.",
  egenGini: "차 한 잔 할래? 벚꽃잎 띄워 줄게.",
  samuraiGini: "칼은 뽑지 않는 날이 가장 좋은 날이오.",
  chefGini: "배고프지? 금방 한 그릇 말아 줄게!",
  iceMageGini: "으음… 오로라 꿈을 꾸던 중이었는데…",
};

// Each house gets the backdrop of the place that 기니 comes from.
const HOUSE_BACKDROP: Record<Outfit, number> = {
  default: images.battleBackgroundVillage,
  explorerHamster: images.battleBackgroundTropicalJungle,
  tetoGini: images.battleBackgroundVolcanoIsland,
  assassinGini: images.battleBackgroundNinjaVillage,
  egenGini: images.battleBackgroundBlossomBeach,
  samuraiGini: images.battleBackgroundCastleKeep,
  chefGini: images.battleBackgroundBakeryStreet,
  iceMageGini: images.battleBackgroundAuroraPalace,
};

const SPRITE = 76;
const MAX_ZOOM = 1.8;
const FOCUS_ZOOM = 1.4;
// Opening view: the whole clearing at its base size (the backdrop already overscans).
const HOME_ZOOM = 1;
const DRAG_SLOP = 6;

// Each 기니 drifts around in front of their house on a slow, lazy loop. It's a pure
// function of the shared clock, so anything (the speech bubble, the camera) can work out
// where a 기니 is right now without asking it.
function wanderOffset(t: number, index: number) {
  "worklet";
  const speed = 0.11 + index * 0.013;
  return {
    x: Math.sin(t * speed + index * 1.7) * 38,
    y: Math.sin(t * speed * 0.7 + index) * 12 + 34,
    facing: Math.cos(t * speed + index * 1.7) >= 0 ? 1 : -1,
  };
}

export function VillageScreen({
  companions,
  highestStageNumber,
  equippedOutfit,
  onEquip,
  onOpenCodex,
}: {
  companions: VillageCompanion[];
  highestStageNumber: number;
  equippedOutfit: Outfit;
  onEquip: (outfit: Outfit) => void;
  onOpenCodex: () => void;
}) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const backdrop = getBackdropSize(size);
  const HOMES = getHomes(backdrop);
  // Zoomed out no further than the backdrop still covering the screen.
  const minZoom = size.width === 0 ? 1 : Math.max(size.width / backdrop.width, size.height / backdrop.height);
  const residents = companions.filter((companion) => isOutfitUnlocked(companion.outfit, highestStageNumber));

  // Camera: world point at the centre of the screen, plus zoom. Shared values so panning
  // never re-renders; `view` (React state) only tracks which chunks to draw.
  const camX = useSharedValue(0);
  const camY = useSharedValue(0);
  const zoom = useSharedValue(HOME_ZOOM);
  const clock = useSharedValue(0);

  const [selected, setSelected] = useState<Outfit | null>(null);
  const [talking, setTalking] = useState<Outfit | null>(null);
  const [home, setHome] = useState<Outfit | null>(null);

  useEffect(() => {
    clock.value = withRepeat(withTiming(100000, { duration: 100000 * 1000, easing: Easing.linear }), -1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Every camera move is clamped so the backdrop's edges never come into view.
  const moveCamera = (x: number, y: number, z: number, animate: boolean) => {
    const zoomTo = Math.min(MAX_ZOOM, Math.max(minZoom, z));
    const maxX = Math.max(0, backdrop.width / 2 - size.width / 2 / zoomTo);
    const maxY = Math.max(0, backdrop.height / 2 - size.height / 2 / zoomTo);
    const toX = Math.min(maxX, Math.max(-maxX, x));
    const toY = Math.min(maxY, Math.max(-maxY, y));
    const timing = { duration: 650, easing: Easing.inOut(Easing.cubic) };
    camX.value = animate ? withTiming(toX, timing) : toX;
    camY.value = animate ? withTiming(toY, timing) : toY;
    zoom.value = animate ? withTiming(zoomTo, timing) : zoomTo;
  };

  // Drag pans the map; only a real drag (past DRAG_SLOP) takes over, so taps still reach
  // the 기니 and buttons underneath — and a tap right at the end of a drag is ignored.
  const drag = useRef({ downX: 0, downY: 0, camX: 0, camY: 0, dragged: false });
  const dragHandlers = {
    onStartShouldSetResponderCapture: (event: { nativeEvent: { pageX: number; pageY: number } }) => {
      drag.current.downX = event.nativeEvent.pageX;
      drag.current.downY = event.nativeEvent.pageY;
      drag.current.dragged = false;
      return false;
    },
    onMoveShouldSetResponderCapture: (event: { nativeEvent: { pageX: number; pageY: number } }) =>
      Math.abs(event.nativeEvent.pageX - drag.current.downX) > DRAG_SLOP || Math.abs(event.nativeEvent.pageY - drag.current.downY) > DRAG_SLOP,
    onResponderGrant: () => {
      drag.current.camX = camX.value;
      drag.current.camY = camY.value;
      drag.current.dragged = true;
      setTalking(null);
    },
    onResponderMove: (event: { nativeEvent: { pageX: number; pageY: number } }) => {
      const dx = event.nativeEvent.pageX - drag.current.downX;
      const dy = event.nativeEvent.pageY - drag.current.downY;
      moveCamera(drag.current.camX - dx / zoom.value, drag.current.camY - dy / zoom.value, zoom.value, false);
    },
    onResponderTerminationRequest: () => false,
  };

  const companionPosition = (outfit: Outfit) => {
    const index = companions.findIndex((companion) => companion.outfit === outfit);
    const offset = wanderOffset(clock.value, index);
    return { x: HOMES[outfit].x + offset.x, y: HOMES[outfit].y + offset.y };
  };

  // Bottom profile → glide the camera over to that 기니 and lean in a little.
  const focus = (outfit: Outfit) => {
    setSelected(outfit);
    setTalking(null);
    const position = companionPosition(outfit);
    moveCamera(position.x, position.y - 30, FOCUS_ZOOM, true);
  };

  const tapCompanion = (outfit: Outfit) => {
    if (drag.current.dragged) return;
    setSelected(outfit);
    setTalking((current) => (current === outfit ? null : outfit));
  };

  const worldStyle = useAnimatedStyle(() => ({
    transform: [{ scale: zoom.value }, { translateX: -camX.value }, { translateY: -camY.value }],
  }));

  return (
    <View style={styles.root} onLayout={(event) => setSize({ width: event.nativeEvent.layout.width, height: event.nativeEvent.layout.height })}>
      {/* World layers: ground → forest chunks → plaza → houses → 기니. Only these move. */}
      <View style={styles.viewport} {...dragHandlers}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setTalking(null)} accessibilityLabel="마을 바닥" />
        <Animated.View pointerEvents="box-none" style={[styles.world, { left: size.width / 2, top: size.height / 2 }, worldStyle]}>
          <Image
            source={BACKDROP}
            style={{ position: "absolute", left: -backdrop.width / 2, top: -backdrop.height / 2, width: backdrop.width, height: backdrop.height }}
          />
          <Swing x={PROPS.swing.fx * backdrop.width} y={PROPS.swing.fy * backdrop.height} />
          {residents.map((companion) => (
            <House key={companion.outfit} x={HOMES[companion.outfit].x} y={HOMES[companion.outfit].y} />
          ))}
          {residents.map((companion) => (
            <Resident
              key={companion.outfit}
              outfit={companion.outfit}
              home={HOMES[companion.outfit]}
              name={companion.name}
              index={companions.findIndex((item) => item.outfit === companion.outfit)}
              clock={clock}
              highlighted={selected === companion.outfit}
              onPress={() => tapCompanion(companion.outfit)}
            />
          ))}
        </Animated.View>
      </View>

      {/* Fixed UI: everything below here stays put while the map moves. */}
      {talking && (
        <SpeechBubble
          companion={companions.find((item) => item.outfit === talking)!}
          home={HOMES[talking]}
          index={companions.findIndex((item) => item.outfit === talking)}
          clock={clock}
          camX={camX}
          camY={camY}
          zoom={zoom}
          size={size}
          equipped={equippedOutfit === talking}
          onEquip={() => onEquip(talking)}
          onGoHome={() => {
            setHome(talking);
            setTalking(null);
          }}
        />
      )}

      <View style={styles.topBar} pointerEvents="box-none">
        <View style={styles.titleSign}>
          <Image source={villageUi.woodSign} style={styles.fill} resizeMode="stretch" />
          <StrokedText style={styles.titleText} strokeColor="#3d2b1f" strokeWidth={2}>
            기니 마을
          </StrokedText>
        </View>
        <View style={styles.topButtons}>
          <LeafButton icon={icons.codexBook} label="동료 도감" onPress={onOpenCodex} />
        </View>
      </View>

      <View style={styles.sideButtons} pointerEvents="box-none">
        <LeafButton label="+" onPress={() => moveCamera(camX.value, camY.value, Math.min(MAX_ZOOM, zoom.value + 0.2), true)} small />
        <LeafButton label="−" onPress={() => moveCamera(camX.value, camY.value, zoom.value - 0.2, true)} small />
        <LeafButton icon={villageUi.house} label="마을" onPress={() => { setSelected(null); setTalking(null); moveCamera(0, 0, HOME_ZOOM, true); }} small />
      </View>

      <ProfileStrip
        companions={companions}
        highestStageNumber={highestStageNumber}
        selected={selected}
        equippedOutfit={equippedOutfit}
        onSelect={focus}
      />

      {home && (
        <HouseView
          companion={companions.find((item) => item.outfit === home)!}
          equipped={equippedOutfit === home}
          onEquip={() => onEquip(home)}
          onBack={() => setHome(null)}
        />
      )}
    </View>
  );
}

function Resident({
  outfit,
  home: homePos,
  name,
  index,
  clock,
  highlighted,
  onPress,
}: {
  outfit: Outfit;
  home: { x: number; y: number };
  name: string;
  index: number;
  clock: SharedValue<number>;
  highlighted: boolean;
  onPress: () => void;
}) {
  const style = useAnimatedStyle(() => {
    const offset = wanderOffset(clock.value, index);
    const y = homePos.y + offset.y;
    return {
      zIndex: DEPTH + Math.round(y),
      transform: [{ translateX: homePos.x + offset.x - SPRITE / 2 }, { translateY: y - SPRITE }],
    };
  });
  const flip = useAnimatedStyle(() => ({ transform: [{ scaleX: wanderOffset(clock.value, index).facing }] }));
  return (
    <Animated.View style={[styles.resident, style]}>
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${name}에게 말 걸기`}>
        <View style={[styles.residentShadow, highlighted && styles.residentShadowOn]} />
        <Animated.View style={flip}>
          <CharacterSprite outfit={outfit} animation="idle" size={SPRITE} />
        </Animated.View>
        <View style={styles.nameTag}>
          <StrokedText style={styles.nameTagText} strokeColor="#3d2b1f" strokeWidth={1.5}>
            {name}
          </StrokedText>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const BUBBLE_W = 250;

function SpeechBubble({
  companion,
  home,
  index,
  clock,
  camX,
  camY,
  zoom,
  size,
  equipped,
  onEquip,
  onGoHome,
}: {
  companion: VillageCompanion;
  home: { x: number; y: number };
  index: number;
  clock: SharedValue<number>;
  camX: SharedValue<number>;
  camY: SharedValue<number>;
  zoom: SharedValue<number>;
  size: { width: number; height: number };
  equipped: boolean;
  onEquip: () => void;
  onGoHome: () => void;
}) {
  // Pinned above the 기니's head on screen, following them as they wander and the map moves.
  const style = useAnimatedStyle(() => {
    const offset = wanderOffset(clock.value, index);
    const sx = (home.x + offset.x - camX.value) * zoom.value + size.width / 2;
    const sy = (home.y + offset.y - SPRITE - camY.value) * zoom.value + size.height / 2;
    const left = Math.min(size.width - BUBBLE_W - 8, Math.max(8, sx - BUBBLE_W / 2));
    return { transform: [{ translateX: left }, { translateY: Math.max(56, sy - 178) }] };
  });
  return (
    <Animated.View style={[styles.bubble, style]}>
      <Image source={villageUi.speech} style={styles.fill} resizeMode="stretch" />
      <Text style={styles.bubbleName}>{companion.name}</Text>
      <Text style={styles.bubbleBlurb} numberOfLines={2}>{companion.blurb}</Text>
      <Text style={styles.bubbleLine}>&quot;{LINES[companion.outfit]}&quot;</Text>
      <View style={styles.bubbleButtons}>
        <WoodButton label="집으로 가기" onPress={onGoHome} />
        <WoodButton label={equipped ? "함께 중" : "함께하기"} onPress={onEquip} muted={equipped} />
      </View>
    </Animated.View>
  );
}

function ProfileStrip({
  companions,
  highestStageNumber,
  selected,
  equippedOutfit,
  onSelect,
}: {
  companions: VillageCompanion[];
  highestStageNumber: number;
  selected: Outfit | null;
  equippedOutfit: Outfit;
  onSelect: (outfit: Outfit) => void;
}) {
  return (
    <View style={styles.strip}>
      <LinearGradient colors={["#2b1d1200", "#2b1d12cc"]} style={StyleSheet.absoluteFill} pointerEvents="none" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stripContent}>
        {companions.map((companion) => {
          const open = isOutfitUnlocked(companion.outfit, highestStageNumber);
          const active = selected === companion.outfit;
          return (
            <Pressable
              key={companion.outfit}
              onPress={() => open && onSelect(companion.outfit)}
              disabled={!open}
              accessibilityRole="button"
              accessibilityLabel={open ? `${companion.name} 찾아가기` : `${companion.name} 잠김`}
              style={({ pressed }) => [styles.card, active && styles.cardActive, pressed && styles.pressed]}
            >
              <Image source={active ? villageUi.leafTile : villageUi.leafTileOff} style={styles.fill} resizeMode="stretch" />
              <View style={[styles.cardSprite, !open && styles.locked]}>
                <CharacterSprite outfit={companion.outfit} animation="idle" size={46} />
              </View>
              <Text style={[styles.cardName, active && styles.cardNameActive]} numberOfLines={1}>
                {open ? companion.name : `${OUTFIT_UNLOCK_STAGE[companion.outfit]}스테이지`}
              </Text>
              {equippedOutfit === companion.outfit && <View style={styles.cardBadge} />}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

// The 기니's own little home: their homeland as a backdrop, a few belongings, their profile
// on a note card, and the way back to the village (where the camera is right where it was).
function HouseView({
  companion,
  equipped,
  onEquip,
  onBack,
}: {
  companion: VillageCompanion;
  equipped: boolean;
  onEquip: () => void;
  onBack: () => void;
}) {
  return (
    <View style={StyleSheet.absoluteFill}>
      <ImageBackground source={HOUSE_BACKDROP[companion.outfit]} resizeMode="cover" style={StyleSheet.absoluteFill}>
        <LinearGradient colors={["#1d140c55", "#1d140c00", "#1d140ccc"]} locations={[0, 0.4, 1]} style={StyleSheet.absoluteFill} />
      </ImageBackground>
      <View style={styles.houseTop}>
        <View style={styles.titleSign}>
          <Image source={villageUi.woodSign} style={styles.fill} resizeMode="stretch" />
          <StrokedText style={styles.titleText} strokeColor="#3d2b1f" strokeWidth={2}>
            {companion.name}의 집
          </StrokedText>
        </View>
        <LeafButton icon={villageUi.house} label="마을로" onPress={onBack} />
      </View>
      <View style={styles.houseStage}>
        <Image source={icons.chest} style={[styles.prop, { left: "8%", bottom: 6 }]} />
        <Image source={villageUi.flower} style={[styles.prop, styles.propSmall, { right: "12%", bottom: 10 }]} />
        <Image source={icons.heart} style={[styles.prop, styles.propSmall, { right: "26%", top: 10 }]} />
        <View style={styles.houseShadow} />
        <CharacterSprite outfit={companion.outfit} animation="idle" size={150} />
      </View>
      <View style={styles.noteCard}>
        <Image source={villageUi.note} style={styles.fill} resizeMode="stretch" />
        <Text style={styles.noteName}>{companion.name}</Text>
        <Text style={styles.noteBlurb}>{companion.blurb}</Text>
        <Text style={styles.noteLine}>&quot;{LINES[companion.outfit]}&quot;</Text>
        <View style={styles.noteButtons}>
          <WoodButton label={equipped ? "함께 중" : "함께하기"} onPress={onEquip} muted={equipped} />
        </View>
      </View>
    </View>
  );
}

function LeafButton({ icon, label, onPress, small = false }: { icon?: number; label: string; onPress: () => void; small?: boolean }) {
  const size = small ? 40 : 50;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={6} style={({ pressed }) => [styles.leafButton, pressed && styles.pressed]}>
      <Image source={villageUi.leafRound} style={{ width: size, height: size }} />
      <View style={[StyleSheet.absoluteFill, styles.leafInner]}>
        {icon !== undefined ? (
          <Image source={icon} style={{ width: size * 0.62, height: size * 0.62 }} resizeMode="contain" />
        ) : (
          <StrokedText style={styles.leafGlyph} strokeColor="#2f4a1c" strokeWidth={2}>
            {label}
          </StrokedText>
        )}
      </View>
      {icon !== undefined && (
        <StrokedText style={styles.leafLabel} strokeColor="#3d2b1f" strokeWidth={1.5}>
          {label}
        </StrokedText>
      )}
    </Pressable>
  );
}

function WoodButton({ label, onPress, muted = false }: { label: string; onPress: () => void; muted?: boolean }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={({ pressed }) => [styles.woodButton, muted && styles.muted, pressed && styles.pressed]}>
      <Image source={villageUi.woodSign} style={styles.fill} resizeMode="stretch" />
      <StrokedText style={styles.woodText} strokeColor="#3d2b1f" strokeWidth={1.5}>
        {label}
      </StrokedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Web images need explicit sizes; absoluteFill alone leaves them at their natural size.
  fill: { position: "absolute", left: 0, top: 0, width: "100%", height: "100%" },
  root: { flex: 1, minHeight: 420, overflow: "hidden", backgroundColor: "#6f8f3c" },
  viewport: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, cursor: "grab" } as object,
  world: { position: "absolute", width: 0, height: 0, transformOrigin: "0% 0%" } as object,
  resident: { position: "absolute", left: 0, top: 0, alignItems: "center" },
  residentShadow: { position: "absolute", bottom: 2, left: SPRITE * 0.2, width: SPRITE * 0.6, height: 12, borderRadius: 999, backgroundColor: "#00000033" },
  residentShadowOn: { backgroundColor: "#fff3a0aa", borderWidth: 2, borderColor: "#ffd34d" },
  nameTag: { position: "absolute", bottom: -10, left: -30, right: -30, alignItems: "center" },
  nameTagText: { fontSize: 10, fontWeight: "900", fontFamily: fonts.bold, color: colors.cream },
  topBar: { position: "absolute", top: 10, left: 10, right: 10, flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  topButtons: { flexDirection: "row", gap: 6 },
  titleSign: { width: 150, height: 56, alignItems: "center", justifyContent: "center", paddingRight: 14 },
  titleText: { fontSize: 16, fontWeight: "900", fontFamily: fonts.bold, color: "#fff4d6" },
  sideButtons: { position: "absolute", right: 10, top: 92, gap: 10, alignItems: "center" },
  leafButton: { alignItems: "center" },
  leafInner: { alignItems: "center", justifyContent: "center", height: undefined },
  leafGlyph: { fontSize: 20, fontWeight: "900", fontFamily: fonts.bold, color: "#f4ffe0" },
  leafLabel: { marginTop: 1, fontSize: 9, fontWeight: "900", fontFamily: fonts.bold, color: colors.cream },
  bubble: { position: "absolute", left: 0, top: 0, width: BUBBLE_W, paddingTop: 24, paddingHorizontal: 16, paddingBottom: 14, zIndex: 20 },
  bubbleName: { fontSize: 14, fontWeight: "900", fontFamily: fonts.bold, color: "#5a3b1f" },
  bubbleBlurb: { marginTop: 3, fontSize: 9, lineHeight: 13, color: "#7a6048", fontFamily: fonts.bold },
  bubbleLine: { marginTop: 5, fontSize: 11, lineHeight: 15, color: colors.ink, fontFamily: fonts.bold },
  bubbleButtons: { marginTop: 8, flexDirection: "row", gap: 6 },
  woodButton: { flex: 1, height: 38, alignItems: "center", justifyContent: "center", paddingRight: 10 },
  woodText: { fontSize: 11, fontWeight: "900", fontFamily: fonts.bold, color: "#fff4d6" },
  muted: { opacity: 0.6 },
  strip: { position: "absolute", left: 0, right: 0, bottom: 0, paddingTop: 18, paddingBottom: 8 },
  stripContent: { paddingHorizontal: 10, gap: 8 },
  card: { width: 70, height: 84, alignItems: "center", justifyContent: "flex-end", paddingBottom: 8 },
  cardActive: { transform: [{ translateY: -6 }] },
  cardSprite: { position: "absolute", top: 4 },
  locked: { opacity: 0.35 },
  cardName: { fontSize: 9, fontWeight: "900", fontFamily: fonts.bold, color: "#f4ead2" },
  cardNameActive: { color: "#fff6a8" },
  cardBadge: { position: "absolute", top: 4, right: 4, width: 10, height: 10, borderRadius: 5, backgroundColor: "#ffd34d", borderWidth: 1.5, borderColor: "#3d2b1f" },
  pressed: { transform: [{ scale: 0.94 }] },
  houseTop: { position: "absolute", top: 10, left: 10, right: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  houseStage: { position: "absolute", left: 0, right: 0, top: "26%", height: 180, alignItems: "center", justifyContent: "flex-end" },
  houseShadow: { position: "absolute", bottom: 6, width: 110, height: 18, borderRadius: 999, backgroundColor: "#00000040" },
  prop: { position: "absolute", width: 54, height: 54 },
  propSmall: { width: 34, height: 34 },
  noteCard: { position: "absolute", left: 16, right: 16, bottom: 16, paddingHorizontal: 24, paddingTop: 22, paddingBottom: 20 },
  noteName: { fontSize: 18, fontWeight: "900", fontFamily: fonts.bold, color: "#5a3b1f", textAlign: "center" },
  noteBlurb: { marginTop: 6, fontSize: 11, lineHeight: 16, color: "#7a6048", fontFamily: fonts.bold, textAlign: "center" },
  noteLine: { marginTop: 8, fontSize: 12, lineHeight: 17, color: colors.ink, fontFamily: fonts.bold, textAlign: "center" },
  noteButtons: { marginTop: 12, flexDirection: "row", justifyContent: "center" },
});
