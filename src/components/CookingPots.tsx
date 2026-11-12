import { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View, type DimensionValue } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { colors, fonts } from "../theme";
import { chef, food, icons, kit, uiImages } from "../assets";
import { getPotUnlockCost, type CookingPot } from "../state/cooking";
import { RECIPES, type Recipe } from "../state/recipes";
import { playSfx } from "../sound";
import { tutorialRef } from "./tutorialTargets";
import { GameButton } from "./GameButton";
import { LockBadge } from "./LockBadge";
import { Panel } from "./NineSlice";

// The kitchen's row of pots. Each one is empty (breathing, with a suggestion of what could
// go in), done (a dish just went in — the chef holds the plate out at once; tap it to play
// the cooking minigame, whose result decides what comes out), or locked behind gems.
export function CookingPots({
  pots,
  potsUnlocked,
  gems,
  suggestion,
  onCollect,
  onUnlock,
  onShowRecipe,
}: {
  pots: CookingPot[];
  potsUnlocked: number;
  gems: number;
  // A dish that could go in right now, shown faintly in empty pots.
  suggestion: Recipe | null;
  // A done pot was tapped: the kitchen opens the cooking minigame for it.
  onCollect: (potIndex: number) => void;
  onUnlock: () => boolean;
  // Scroll to a recipe's card (tapping an empty pot's suggestion).
  onShowRecipe: (recipeId: string) => void;
}) {
  // The pot that was just bought, so it can drop into place.
  const [justUnlocked, setJustUnlocked] = useState<number | null>(null);

  return (
    <View style={styles.row}>
      {pots.map((pot, index) => {
        let content;
        if (index >= potsUnlocked) {
          // Only the next pot in line can be bought; the one after it just shows a lock.
          const cost = getPotUnlockCost(potsUnlocked);
          content = (
            <LockedPot
              next={index === potsUnlocked}
              cost={cost}
              affordable={gems >= cost}
              onUnlock={() => {
                if (!onUnlock()) return;
                setJustUnlocked(index);
                // Only the first appearance drops in, not every later time it empties out.
                setTimeout(() => setJustUnlocked(null), 1200);
              }}
            />
          );
        } else if (!pot) {
          content = (
            <EmptyPot dropIn={justUnlocked === index} suggestion={suggestion} onShowRecipe={onShowRecipe} />
          );
        } else {
          const recipe = RECIPES.find((item) => item.id === pot.recipeId);
          if (!recipe) return null;
          content = <ReadyPot key={pot.startedAt} recipe={recipe} readyAt={pot.readyAt} onCollect={() => onCollect(index)} />;
        }
        return (
          <View key={index} ref={tutorialRef(`cook-pot-${index}`)} style={styles.slot}>
            {content}
          </View>
        );
      })}
    </View>
  );
}

// --- Empty ----------------------------------------------------------------------------

function EmptyPot({ dropIn: dropInProp, suggestion, onShowRecipe }: { dropIn: boolean; suggestion: Recipe | null; onShowRecipe: (id: string) => void }) {
  // Read once on mount: the pot only drops in when it first appears.
  const [dropIn] = useState(dropInProp);
  const breathe = useSharedValue(0);
  const drop = useSharedValue(dropIn ? 0 : 1);
  useEffect(() => {
    breathe.value = withRepeat(withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.sin) }), -1, true);
    if (dropIn) drop.value = withTiming(1, { duration: 520, easing: Easing.out(Easing.bounce) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const potStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, drop.value * 2),
    transform: [{ translateY: (1 - drop.value) * -50 }, { scale: 1 + breathe.value * 0.04 }],
  }));
  return (
    <Pressable
      disabled={!suggestion}
      onPress={() => suggestion && onShowRecipe(suggestion.id)}
      accessibilityRole="button"
      accessibilityLabel={suggestion ? `${suggestion.name} 레시피 보기` : "빈 냄비"}
      style={({ pressed }) => [styles.fill, pressed && styles.pressed]}
    >
      <Panel slice={kit.inset} scale={0.4} style={styles.pot}>
        {dropIn && <Sparkles count={4} />}
        <Animated.Image source={food.cookPotTrim} style={[styles.potImage, potStyle]} />
        {suggestion ? (
          <>
            <Image source={suggestion.image} style={styles.suggestion} />
            <Text style={styles.caption} numberOfLines={1}>추천: {suggestion.name}</Text>
          </>
        ) : (
          <Text style={styles.caption}>비어 있음</Text>
        )}
      </Panel>
    </Pressable>
  );
}

// --- Locked ---------------------------------------------------------------------------

function LockedPot({ next, cost, affordable, onUnlock }: { next: boolean; cost: number; affordable: boolean; onUnlock: () => void }) {
  const shake = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${shake.value * 8}deg` }] }));
  return (
    <Panel slice={kit.inset} scale={0.4} style={styles.pot}>
      <Animated.View style={shakeStyle}>
        <Image source={food.cookPotOutlined} style={[styles.potImage, styles.locked]} />
        <LockBadge />
      </Animated.View>
      {next ? (
        <GameButton
          variant={affordable ? "green" : "gray"}
          disabled={!affordable}
          onPress={() => {
            // The lock rattles loose, then the new pot drops in (EmptyPot's dropIn).
            shake.value = withSequence(
              withTiming(-1, { duration: 50 }),
              withTiming(1, { duration: 70 }),
              withTiming(-1, { duration: 70 }),
              withTiming(0, { duration: 50 }),
            );
            setTimeout(onUnlock, 260);
          }}
          accessibilityLabel={`보석 ${cost}개로 냄비 열기`}
          style={styles.smallButton}
        >
          <View style={styles.costContent}>
            <Image source={uiImages.crystal} style={styles.gem} />
            <Text style={[styles.costText, !affordable && styles.costTextDim]}>{cost}</Text>
          </View>
        </GameButton>
      ) : (
        <Text style={styles.caption}>잠김</Text>
      )}
    </Panel>
  );
}

// --- Ready ----------------------------------------------------------------------------

function ReadyPot({ recipe, readyAt, onCollect }: { recipe: Recipe; readyAt: number; onCollect: () => void }) {
  // Turned ready while the kitchen was open (not already done when it was opened): "띵!"
  const [fresh] = useState(() => Date.now() - readyAt < 1500);
  const pop = useSharedValue(fresh ? 0 : 1);
  const flash = useSharedValue(0);
  const bounce = useSharedValue(0);
  const swap = useSharedValue(0);
  useEffect(() => {
    if (fresh) {
      playSfx("cookDone");
      pop.value = withSequence(withTiming(1.15, { duration: 160, easing: Easing.out(Easing.quad) }), withTiming(1, { duration: 180 }));
      flash.value = withSequence(withTiming(1, { duration: 100 }), withTiming(0, { duration: 450 }));
    }
    bounce.value = withRepeat(withTiming(1, { duration: 380, easing: Easing.out(Easing.quad) }), -1, true);
    // Plate-out and cheering poses take turns.
    swap.value = withRepeat(withSequence(withDelay(700, withTiming(1, { duration: 120 })), withDelay(700, withTiming(0, { duration: 120 }))), -1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const popStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value === 0 ? 1 : pop.value }] }));
  const flashStyle = useAnimatedStyle(() => ({ opacity: flash.value * 0.8 }));
  const dishStyle = useAnimatedStyle(() => ({ transform: [{ translateY: -bounce.value * 6 }, { scale: 1 + bounce.value * 0.08 }] }));
  const serveStyle = useAnimatedStyle(() => ({ opacity: 1 - swap.value }));
  const cheerStyle = useAnimatedStyle(() => ({ opacity: swap.value }));

  return (
    <Pressable
      onPress={onCollect}
      accessibilityRole="button"
      accessibilityLabel={`${recipe.name} 마무리하기`}
      style={({ pressed }) => [styles.fill, pressed && styles.pressed]}
    >
      <Animated.View style={[styles.fill, popStyle]}>
        <Panel slice={kit.panel} scale={0.4} style={styles.pot}>
          <Sparkles count={4} loop />
          <View style={styles.figure}>
            <Animated.Image source={chef.serve} style={[styles.chef, styles.layered, serveStyle]} />
            <Animated.Image source={chef.cheer} style={[styles.chef, styles.layered, cheerStyle]} />
            <Animated.Image source={recipe.image} style={[styles.dishBadge, styles.dishReady, dishStyle]} />
          </View>
          <Text style={styles.ready}>완성!</Text>
          <Text style={styles.caption}>눌러서 마무리!</Text>
          <Animated.View style={[styles.flash, flashStyle]} pointerEvents="none" />
        </Panel>
      </Animated.View>
    </Pressable>
  );
}

// --- Shared ---------------------------------------------------------------------------

// Stars twinkling around a pot — once (a pot just unlocked) or on a loop (ready/legendary).
const SPARKLE_SPOTS: { left: DimensionValue; top: DimensionValue; size: number }[] = [
  { left: "12%", top: "10%", size: 12 },
  { left: "78%", top: "16%", size: 10 },
  { left: "20%", top: "58%", size: 9 },
  { left: "80%", top: "52%", size: 11 },
];

function Sparkles({ count, loop = false }: { count: number; loop?: boolean }) {
  return (
    <>
      {SPARKLE_SPOTS.slice(0, count).map((spot, index) => (
        <Sparkle key={index} {...spot} delay={index * 260} loop={loop} />
      ))}
    </>
  );
}

function Sparkle({ left, top, size, delay, loop }: { left: DimensionValue; top: DimensionValue; size: number; delay: number; loop: boolean }) {
  const t = useSharedValue(0);
  useEffect(() => {
    const blink = withSequence(withTiming(1, { duration: 220 }), withTiming(0, { duration: 320 }));
    t.value = withDelay(delay, loop ? withRepeat(withSequence(blink, withDelay(600, withTiming(0, { duration: 0 }))), -1) : blink);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: t.value, transform: [{ scale: 0.4 + t.value * 0.8 }, { rotate: `${t.value * 90}deg` }] }));
  return (
    <Animated.Image
      source={icons.star}
      style={[styles.sparkle, { left, top, width: size, height: size }, style]}
    />
  );
}

const FIGURE = 64;

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 6, marginBottom: 12 },
  slot: { flex: 1 },
  fill: { flex: 1 },
  pot: { flex: 1, minHeight: 118, alignItems: "center", justifyContent: "center", paddingHorizontal: 6, paddingTop: 8, paddingBottom: 9 },
  pressed: { transform: [{ scale: 0.95 }] },
  potImage: { width: 52, height: 52 },
  locked: { opacity: 0.45, filter: "grayscale(1)" },
  suggestion: { position: "absolute", top: 22, width: 26, height: 26, opacity: 0.45 },
  caption: { marginTop: 4, fontSize: 12, fontWeight: "800", fontFamily: fonts.bold, color: colors.brown },
  ready: { marginTop: 2, fontSize: 13, fontWeight: "900", fontFamily: fonts.bold, color: colors.red },
  figure: { width: FIGURE, height: FIGURE },
  chef: { width: FIGURE, height: FIGURE },
  layered: { position: "absolute", left: 0, top: 0 },
  dishBadge: { position: "absolute", right: -12, bottom: -2, width: 26, height: 26 },
  dishReady: { right: -6, top: -8, bottom: undefined, width: 32, height: 32 },
  flash: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, borderRadius: 10, backgroundColor: "#fff6c8" },
  sparkle: { position: "absolute", pointerEvents: "none" },
  smallButton: { marginTop: 6, minHeight: 30, paddingHorizontal: 10 },
  costContent: { flexDirection: "row", alignItems: "center", gap: 3 },
  gem: { width: 14, height: 14, resizeMode: "contain" },
  costText: { fontSize: 12, fontWeight: "900", fontFamily: fonts.bold, color: colors.cream },
  costTextDim: { color: "#4f463c" },
});
