import { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View, type DimensionValue } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { colors, fonts } from "../theme";
import { chef, food, icons, kit, uiImages } from "../assets";
import { applyDiscount, formatRemaining, getPotUnlockCost, getRushCost, type CookingPot } from "../state/cooking";
import { ITEM_IMAGES, RECIPES, type Recipe } from "../state/recipes";
import type { RecipeTier } from "../state/recipeTiers";
import { playSfx } from "../sound";
import { tutorialRef } from "./tutorialTargets";
import { GameButton } from "./GameButton";
import { LockBadge } from "./LockBadge";
import { Panel } from "./NineSlice";
import { ProgressBar } from "./ProgressBar";

// The kitchen's row of pots. Each one is empty (breathing, with a suggestion of what could
// go in), simmering (the chef at work, steam, bubbles and ingredients hopping out, a
// progress bar), done (the chef holding the plate out — tap to take it), or locked behind gems.
export function CookingPots({
  pots,
  potsUnlocked,
  now,
  gems,
  rushDiscount,
  suggestion,
  onCollect,
  onRush,
  onUnlock,
  onShowRecipe,
}: {
  pots: CookingPot[];
  potsUnlocked: number;
  now: number;
  gems: number;
  // % off the rush price while a discount dish is running.
  rushDiscount: number;
  // A dish that could go in right now, shown faintly in empty pots.
  suggestion: Recipe | null;
  onCollect: (potIndex: number) => void;
  // Finish a still-simmering dish right now for gems.
  onRush: (potIndex: number) => void;
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
          content =
            pot.readyAt <= now ? (
              <ReadyPot key={pot.startedAt} recipe={recipe} readyAt={pot.readyAt} onCollect={() => onCollect(index)} />
            ) : (
              <SimmeringPot
                key={pot.startedAt}
                pot={pot}
                recipe={recipe}
                now={now}
                rushCost={applyDiscount(getRushCost(pot.readyAt - now), rushDiscount)}
                gems={gems}
                onRush={() => onRush(index)}
              />
            );
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

// --- Simmering ------------------------------------------------------------------------

// What the chef cooks with, by tier — and what colour the steam comes off in.
const TIER_LOOK: Record<RecipeTier, { chef: number; tool: number; steam: string; sparkle: boolean }> = {
  common: { chef: chef.spoon, tool: food.cuttingBoard, steam: "#ffffff", sparkle: false },
  rare: { chef: chef.wok, tool: food.fryingPan, steam: "#fff1d6", sparkle: false },
  epic: { chef: chef.wok, tool: food.stewPot, steam: "#ffd29a", sparkle: false },
  legendary: { chef: chef.wok, tool: food.cookPot, steam: "#ffe680", sparkle: true },
  hidden: { chef: chef.wok, tool: food.cookPot, steam: "#f4cbff", sparkle: true },
};

// The last stretch of cooking, as a share of the whole, when the pot gets frantic.
const HURRY_SHARE = 0.1;
// How long ingredients take to fly in from the recipe card (see KitchenScreen).
const FILL_DELAY_MS = 520;

function SimmeringPot({
  pot,
  recipe,
  now,
  rushCost,
  gems,
  onRush,
}: {
  pot: NonNullable<CookingPot>;
  recipe: Recipe;
  now: number;
  rushCost: number;
  gems: number;
  onRush: () => void;
}) {
  const look = TIER_LOOK[recipe.tier];
  const total = pot.readyAt - pot.startedAt;
  const hurry = pot.readyAt - now < total * HURRY_SHARE;
  // Mounted right as the dish went in (not on opening the kitchen later): play the intro.
  const [fresh] = useState(() => Date.now() - pot.startedAt < 1500);
  // While a rush plays out: when it started, for the quick bar fill.
  const [rushStart, setRushStart] = useState<number | null>(null);
  const [rushNow, setRushNow] = useState(0);

  const squash = useSharedValue(1);
  const flame = useSharedValue(0);
  const gemDrop = useSharedValue(0);
  useEffect(() => {
    if (!fresh) return;
    const timer = setTimeout(() => {
      playSfx("cookStart");
      squash.value = withSequence(withTiming(0.82, { duration: 90 }), withTiming(1.12, { duration: 140 }), withTiming(1, { duration: 140 }));
      flame.value = withSequence(withTiming(1, { duration: 160 }), withTiming(0, { duration: 600 }));
    }, FILL_DELAY_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (rushStart === null) return;
    const frame = setInterval(() => setRushNow(Date.now()), 16);
    const done = setTimeout(() => {
      onRush();
      // Still here means it didn't go through (e.g. a full bag) — put the pot back as it was.
      setRushStart(null);
    }, 600);
    return () => {
      clearInterval(frame);
      clearTimeout(done);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rushStart]);

  const baseProgress = ((now - pot.startedAt) / total) * 100;
  // The rush sweeps the bar to full over ~0.45s once the gem lands.
  const rushProgress = rushStart === null ? 0 : Math.min(1, Math.max(0, (rushNow - rushStart - 150) / 450));
  const progress = baseProgress + (100 - baseProgress) * rushProgress;

  const squashStyle = useAnimatedStyle(() => ({ transform: [{ scaleY: squash.value }, { scaleX: 2 - squash.value }] }));
  const flameStyle = useAnimatedStyle(() => ({ opacity: flame.value * 0.75, transform: [{ scale: 0.6 + flame.value * 0.9 }] }));
  const gemStyle = useAnimatedStyle(() => ({
    opacity: gemDrop.value > 0 && gemDrop.value < 1 ? 1 : 0,
    transform: [{ translateY: -40 + gemDrop.value * 44 }, { scale: 1.2 - gemDrop.value * 0.5 }],
  }));

  return (
    <Panel slice={kit.panel} scale={0.4} style={styles.pot}>
      {look.sparkle && <Sparkles count={3} loop />}
      <Animated.View style={[styles.figure, squashStyle]}>
        <Animated.View style={[styles.flame, flameStyle]} />
        <Image source={look.tool} style={styles.tool} />
        <Steam color={look.steam} hurry={hurry} />
        <Bubbles />
        <TossingChef image={look.chef} hurry={hurry} />
        {recipe.ingredients.slice(0, 3).map((ingredient, index) =>
          ITEM_IMAGES[ingredient.name] !== undefined ? (
            <HoppingIngredient key={ingredient.name} image={ITEM_IMAGES[ingredient.name]} index={index} />
          ) : null,
        )}
        <Image source={recipe.image} style={styles.dishBadge} />
        <Animated.Image source={uiImages.crystal} style={[styles.rushGem, gemStyle]} />
      </Animated.View>
      <View style={styles.progressWrap}>
        <ProgressBar progress={progress} height={12} />
        <Shine />
      </View>
      <Text style={styles.time}>
        {pot.fast ? "⚡" : ""}
        {formatRemaining(rushStart === null ? pot.readyAt - now : 0)}
      </Text>
      <GameButton
        variant={gems >= rushCost && rushStart === null ? "green" : "gray"}
        disabled={gems < rushCost || rushStart !== null}
        onPress={() => {
          gemDrop.value = withTiming(1, { duration: 260, easing: Easing.in(Easing.quad) });
          setRushNow(Date.now());
          setRushStart(Date.now());
        }}
        accessibilityLabel={`보석 ${rushCost}개로 ${recipe.name} 바로 완성`}
        style={styles.rushButton}
      >
        <View style={styles.costContent}>
          <Image source={uiImages.crystal} style={styles.gem} />
          <Text style={[styles.costText, gems < rushCost && styles.costTextDim]}>{`${rushCost} 즉시`}</Text>
        </View>
      </GameButton>
    </Panel>
  );
}

// The chef rocking side to side — faster in the last stretch.
function TossingChef({ image, hurry }: { image: number; hurry: boolean }) {
  const toss = useSharedValue(0);
  useEffect(() => {
    toss.value = 0;
    toss.value = withRepeat(withTiming(1, { duration: hurry ? 260 : 520, easing: Easing.inOut(Easing.quad) }), -1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hurry]);
  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${-5 + toss.value * 10}deg` }, { translateY: -Math.abs(toss.value - 0.5) * 4 }],
  }));
  return <Animated.Image source={image} style={[styles.chef, style]} />;
}

// One of the dish's ingredients hopping up out of the pan and dropping back in, on a loop.
function HoppingIngredient({ image, index }: { image: number; index: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(
      index * 700,
      withRepeat(withSequence(withTiming(1, { duration: 700, easing: Easing.linear }), withDelay(1400, withTiming(0, { duration: 0 }))), -1),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const side = index % 2 === 0 ? 1 : -1;
  const style = useAnimatedStyle(() => ({
    opacity: t.value > 0 && t.value < 1 ? 1 : 0,
    transform: [
      { translateX: side * t.value * 14 },
      { translateY: -Math.sin(t.value * Math.PI) * 30 },
      { rotate: `${t.value * 360 * side}deg` },
    ],
  }));
  return <Animated.Image source={image} style={[styles.hop, style]} />;
}

// Puffs drifting up and fading, tinted by tier — more of them in the last stretch.
function Steam({ color, hurry }: { color: string; hurry: boolean }) {
  const puffs = hurry ? [0, 300, 600, 900, 1200] : [0, 500, 1000];
  return (
    <>
      {puffs.map((delay, index) => (
        <SteamPuff key={`${hurry}-${delay}`} delay={delay} left={40 + ((index * 11) % 26)} color={color} />
      ))}
    </>
  );
}

function SteamPuff({ delay, left, color }: { delay: number; left: number; color: string }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(delay, withRepeat(withSequence(withTiming(1, { duration: 1500, easing: Easing.out(Easing.quad) }), withTiming(0, { duration: 0 })), -1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({
    opacity: t.value === 0 ? 0 : (1 - t.value) * 0.85,
    transform: [{ translateY: -t.value * 26 }, { translateX: Math.sin(t.value * Math.PI * 2) * 3 }, { scale: 0.6 + t.value * 0.8 }],
  }));
  return <Animated.View style={[styles.steam, { left, backgroundColor: color }, style]} />;
}

// Little bubbles swelling at the pan's rim and popping.
function Bubbles() {
  return (
    <>
      {[
        { left: 14, delay: 0 },
        { left: 30, delay: 450 },
        { left: 22, delay: 900 },
      ].map((bubble) => (
        <Bubble key={bubble.left} {...bubble} />
      ))}
    </>
  );
}

function Bubble({ left, delay }: { left: number; delay: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(delay, withRepeat(withSequence(withTiming(1, { duration: 900 }), withTiming(0, { duration: 0 })), -1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({
    // Grows for most of the cycle, then pops (a quick swell and vanish).
    opacity: t.value < 0.85 ? 0.9 : (1 - t.value) * 6,
    transform: [{ translateY: -t.value * 10 }, { scale: t.value < 0.85 ? 0.3 + t.value * 0.8 : 1.4 }],
  }));
  return <Animated.View style={[styles.bubble, { left }, style]} />;
}

// A soft light sweeping across the progress bar every couple of seconds.
function Shine() {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(withSequence(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }), withDelay(1300, withTiming(0, { duration: 0 }))), -1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({ left: `${-30 + t.value * 140}%`, opacity: t.value === 0 ? 0 : 0.55 }));
  return <Animated.View style={[styles.shine, style]} pointerEvents="none" />;
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
      accessibilityLabel={`${recipe.name} 받기`}
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
          <Text style={styles.caption}>눌러서 받기</Text>
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
  caption: { marginTop: 4, fontSize: 9, fontWeight: "800", fontFamily: fonts.bold, color: colors.brown },
  ready: { marginTop: 2, fontSize: 13, fontWeight: "900", fontFamily: fonts.bold, color: colors.red },
  time: { marginTop: 2, fontSize: 10, fontWeight: "900", fontFamily: fonts.bold, color: colors.ink },
  figure: { width: FIGURE, height: FIGURE },
  chef: { width: FIGURE, height: FIGURE },
  layered: { position: "absolute", left: 0, top: 0 },
  tool: { position: "absolute", left: -14, bottom: -4, width: 24, height: 24 },
  flame: { position: "absolute", left: 8, right: 8, bottom: -6, height: 22, borderRadius: 11, backgroundColor: "#ff9a3c" },
  hop: { position: "absolute", left: 38, top: 20, width: 16, height: 16 },
  dishBadge: { position: "absolute", right: -12, bottom: -2, width: 26, height: 26 },
  dishReady: { right: -6, top: -8, bottom: undefined, width: 32, height: 32 },
  rushGem: { position: "absolute", left: 40, top: 18, width: 18, height: 18 },
  steam: { position: "absolute", top: 8, width: 10, height: 10, borderRadius: 5 },
  bubble: { position: "absolute", top: 34, width: 6, height: 6, borderRadius: 3, borderWidth: 1, borderColor: "#ffffffcc", backgroundColor: "#ffffff55" },
  progressWrap: { marginTop: 6, alignSelf: "stretch", overflow: "hidden", borderRadius: 6 },
  shine: { position: "absolute", top: 0, bottom: 0, width: "25%", backgroundColor: "#ffffff", transform: [{ skewX: "-20deg" }] },
  flash: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, borderRadius: 10, backgroundColor: "#fff6c8" },
  sparkle: { position: "absolute", pointerEvents: "none" },
  smallButton: { marginTop: 6, minHeight: 30, paddingHorizontal: 10 },
  rushButton: { marginTop: 4, minHeight: 26, paddingHorizontal: 8 },
  costContent: { flexDirection: "row", alignItems: "center", gap: 3 },
  gem: { width: 14, height: 14 },
  costText: { fontSize: 11, fontWeight: "900", fontFamily: fonts.bold, color: colors.cream },
  costTextDim: { color: "#4f463c" },
});
