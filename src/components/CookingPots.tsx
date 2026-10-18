import { useEffect } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { colors, fonts } from "../theme";
import { chef, food, kit, uiImages } from "../assets";
import { applyDiscount, formatRemaining, getPotUnlockCost, getRushCost, type CookingPot } from "../state/cooking";
import { RECIPES } from "../state/recipes";
import { tutorialRef } from "./tutorialTargets";
import { GameButton } from "./GameButton";
import { Panel } from "./NineSlice";
import { ProgressBar } from "./ProgressBar";

// The kitchen's row of pots: empty, simmering (the chef tossing the wok, steam rising, a
// progress bar), done (the chef holding the plate out — tap to take it), or locked behind gems.
export function CookingPots({
  pots,
  potsUnlocked,
  now,
  gems,
  rushDiscount,
  onCollect,
  onRush,
  onUnlock,
}: {
  pots: CookingPot[];
  potsUnlocked: number;
  now: number;
  gems: number;
  // % off the rush price while a discount dish is running.
  rushDiscount: number;
  onCollect: (potIndex: number) => void;
  // Finish a still-simmering dish right now for gems.
  onRush: (potIndex: number) => void;
  onUnlock: () => void;
}) {
  return (
    <View style={styles.row}>
      {pots.map((pot, index) => {
        if (index >= potsUnlocked) {
          // Only the next pot in line can be bought; the one after it just shows a lock.
          const next = index === potsUnlocked;
          const cost = getPotUnlockCost(potsUnlocked);
          return (
            <Panel slice={kit.inset} scale={0.4} style={styles.pot} key={index}>
              <Image source={food.cookPotOutlined} style={[styles.potImage, styles.locked]} />
              {next ? (
                <GameButton
                  variant={gems >= cost ? "green" : "gray"}
                  disabled={gems < cost}
                  onPress={onUnlock}
                  accessibilityLabel={`보석 ${cost}개로 냄비 열기`}
                  style={styles.unlockButton}
                >
                  <View style={styles.unlockContent}>
                    <Image source={uiImages.crystal} style={styles.gem} />
                    <Text style={[styles.unlockText, gems < cost && styles.unlockTextDim]}>{cost}</Text>
                  </View>
                </GameButton>
              ) : (
                <Text style={styles.caption}>잠김</Text>
              )}
            </Panel>
          );
        }
        if (!pot) {
          return (
            <Panel slice={kit.inset} scale={0.4} style={styles.pot} key={index}>
              <Image source={food.cookPotTrim} style={styles.potImage} />
              <Text style={styles.caption}>비어 있음</Text>
            </Panel>
          );
        }
        const recipe = RECIPES.find((item) => item.id === pot.recipeId);
        if (!recipe) return null;
        const ready = pot.readyAt <= now;
        if (ready) {
          return (
            <Pressable
              key={index}
              ref={tutorialRef(`cook-pot-${index}`)}
              onPress={() => onCollect(index)}
              accessibilityRole="button"
              accessibilityLabel={`${recipe.name} 받기`}
              style={({ pressed }) => [styles.potPressable, pressed && styles.pressed]}
            >
              <Panel slice={kit.panel} scale={0.4} style={styles.pot}>
                <ReadyChef dishImage={recipe.image} />
                <Text style={styles.ready}>완성!</Text>
                <Text style={styles.caption}>눌러서 받기</Text>
              </Panel>
            </Pressable>
          );
        }
        const progress = ((now - pot.startedAt) / (pot.readyAt - pot.startedAt)) * 100;
        const rushCost = applyDiscount(getRushCost(pot.readyAt - now), rushDiscount);
        return (
          <View key={index} ref={tutorialRef(`cook-pot-${index}`)} style={styles.potPressable}>
            <Panel slice={kit.panel} scale={0.4} style={styles.pot}>
              <SimmeringChef dishImage={recipe.image} />
              <ProgressBar progress={progress} height={12} style={styles.progress} />
              <Text style={styles.time}>{formatRemaining(pot.readyAt - now)}</Text>
              <GameButton
                variant={gems >= rushCost ? "green" : "gray"}
                disabled={gems < rushCost}
                onPress={() => onRush(index)}
                accessibilityLabel={`보석 ${rushCost}개로 ${recipe.name} 바로 완성`}
                style={styles.rushButton}
              >
                <View style={styles.unlockContent}>
                  <Image source={uiImages.crystal} style={styles.gem} />
                  <Text style={[styles.unlockText, gems < rushCost && styles.unlockTextDim]}>{`${rushCost} 즉시`}</Text>
                </View>
              </GameButton>
            </Panel>
          </View>
        );
      })}
    </View>
  );
}

// The chef tossing the wok side to side, steam puffing up, the dish-in-progress beside them.
function SimmeringChef({ dishImage }: { dishImage: number }) {
  const toss = useSharedValue(0);
  useEffect(() => {
    toss.value = withRepeat(withTiming(1, { duration: 520, easing: Easing.inOut(Easing.quad) }), -1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const chefStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${-5 + toss.value * 10}deg` }, { translateY: -Math.abs(toss.value - 0.5) * 4 }],
  }));
  return (
    <View style={styles.figure}>
      <Steam delay={0} left={52} />
      <Steam delay={500} left={62} />
      <Steam delay={1000} left={44} />
      <Animated.Image source={chef.wok} style={[styles.chef, chefStyle]} />
      <Image source={dishImage} style={styles.dishBadge} />
    </View>
  );
}

// A soft white puff that drifts up and fades, on a loop.
function Steam({ delay, left }: { delay: number; left: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(delay, withRepeat(withSequence(withTiming(1, { duration: 1500, easing: Easing.out(Easing.quad) }), withTiming(0, { duration: 0 })), -1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({
    opacity: t.value === 0 ? 0 : (1 - t.value) * 0.8,
    transform: [{ translateY: -t.value * 26 }, { translateX: Math.sin(t.value * Math.PI * 2) * 3 }, { scale: 0.6 + t.value * 0.8 }],
  }));
  return <Animated.View style={[styles.steam, { left }, style]} />;
}

// The chef holding the finished plate out, the dish bouncing above it.
function ReadyChef({ dishImage }: { dishImage: number }) {
  const bounce = useSharedValue(0);
  useEffect(() => {
    bounce.value = withRepeat(withTiming(1, { duration: 380, easing: Easing.out(Easing.quad) }), -1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const dishStyle = useAnimatedStyle(() => ({ transform: [{ translateY: -bounce.value * 6 }, { scale: 1 + bounce.value * 0.08 }] }));
  return (
    <View style={styles.figure}>
      <Image source={chef.serve} style={styles.chef} />
      <Animated.Image source={dishImage} style={[styles.dishBadge, styles.dishReady, dishStyle]} />
    </View>
  );
}

const FIGURE = 64;

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 6, marginBottom: 12 },
  potPressable: { flex: 1 },
  pot: { flex: 1, minHeight: 118, alignItems: "center", justifyContent: "center", paddingHorizontal: 6, paddingTop: 8, paddingBottom: 9 },
  pressed: { transform: [{ scale: 0.95 }] },
  potImage: { width: 52, height: 52 },
  locked: { opacity: 0.45, filter: "grayscale(1)" },
  caption: { marginTop: 4, fontSize: 9, fontWeight: "800", fontFamily: fonts.bold, color: colors.brown },
  ready: { marginTop: 2, fontSize: 13, fontWeight: "900", fontFamily: fonts.bold, color: colors.red },
  time: { marginTop: 2, fontSize: 10, fontWeight: "900", fontFamily: fonts.bold, color: colors.ink },
  figure: { width: FIGURE, height: FIGURE },
  chef: { width: FIGURE, height: FIGURE },
  dishBadge: { position: "absolute", right: -12, bottom: -2, width: 26, height: 26 },
  dishReady: { right: -6, top: -8, bottom: undefined, width: 32, height: 32 },
  steam: { position: "absolute", top: 8, width: 10, height: 10, borderRadius: 5, backgroundColor: "#ffffff" },
  progress: { marginTop: 6, alignSelf: "stretch" },
  rushButton: { marginTop: 4, minHeight: 26, paddingHorizontal: 8 },
  unlockButton: { marginTop: 6, minHeight: 30, paddingHorizontal: 10 },
  unlockContent: { flexDirection: "row", alignItems: "center", gap: 3 },
  gem: { width: 14, height: 14 },
  unlockText: { fontSize: 11, fontWeight: "900", fontFamily: fonts.bold, color: colors.cream },
  unlockTextDim: { color: "#4f463c" },
});
