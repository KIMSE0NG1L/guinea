import { useEffect, useRef, useState } from "react";
import { Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { colors, fonts } from "../theme";
import { chef, frameKit, kit } from "../assets";
import { NineSlice } from "./NineSlice";
import { GameButton } from "./GameButton";
import { StrokedText } from "./StrokedText";
import { GuideArrow } from "./GuideArrow";
import { RewardedAdModal } from "./RewardedAdModal";
import {
  classifyStop,
  driftingZoneCenter,
  getDriftMargin,
  getRoundSweepMs,
  getZoneWidth,
  gradeFromRounds,
  isDriftingRound,
  MINIGAME_DIFFICULTY,
  MINIGAME_ROUNDS,
  PERFECT_SHARE,
  randomZoneCenter,
  ROUND_TIMEOUT_MS,
  sweepPosition,
  type RoundResult,
} from "../state/cookingMinigame";
import type { Recipe } from "../state/recipes";
import type { RecipeTier } from "../state/recipeTiers";
import type { CookGrade } from "../state/buffs";
import { playHaptic } from "../haptics";
import { playSfx } from "../sound";
import { t } from "../i18n";

// MINIGAME_DIFFICULTY's Korean labels can't go through the shared t(value) dictionary lookup:
// "보통" here (Normal difficulty) collides with the unrelated cook-grade label "보통" (Good),
// which the dictionary already maps to a different English word. Keyed by tier instead.
const DIFFICULTY_LABEL_EN: Record<RecipeTier, string> = { common: "Easy", rare: "Normal", epic: "Hard", legendary: "Very Hard", hidden: "Extreme" };
// ja/zh also keyed by tier rather than looked up by the Korean label text, same reason as
// above — "보통" (Normal here) would otherwise collide with the cook-grade "보통" (Good).
const DIFFICULTY_LABEL_JA: Record<RecipeTier, string> = { common: "簡単", rare: "普通", epic: "難しい", legendary: "とても難しい", hidden: "極限" };
const DIFFICULTY_LABEL_ZH: Record<RecipeTier, string> = { common: "简单", rare: "普通", epic: "困难", legendary: "非常困难", hidden: "极限" };

const TRACK_HEIGHT = 34;
const TRACK_SCALE = TRACK_HEIGHT / 40;
// The bar-frame art's decorative brass caps eat more of its declared nine-slice inset than
// its actual visible channel — same hand-tuned numbers ProgressBar uses for the same art.
const CHANNEL_INSET_Y = Math.round(7 * TRACK_SCALE);
const CHANNEL_INSET_X = Math.round(16 * TRACK_SCALE);
const INDICATOR_SIZE = 20;
const RESULT_HOLD_MS = 650;
// Held longer than a per-round result — nothing follows a fail (no CookCompleteBurst), so
// this is the only beat the player gets to actually read "망함".
const FAIL_HOLD_MS = 1200;
// How many times a 망함 can be retried (each one costs a watched ad) before it sticks.
const FAIL_RETRIES = 2;

const RESULT_TEXT: Record<RoundResult, string> = { perfect: "완벽!", good: "좋아!", miss: "아깝다!" };
const RESULT_TEXT_EN: Record<RoundResult, string> = { perfect: "Perfect!", good: "Nice!", miss: "So Close!" };
// Keyed by result rather than looked up by the Korean text — "좋아!" also appears as plain
// dialogue elsewhere (comics), so looking it up by that text risks pulling in the wrong tone.
const RESULT_TEXT_JA: Record<RoundResult, string> = { perfect: "完璧！", good: "いいね！", miss: "惜しい！" };
const RESULT_TEXT_ZH: Record<RoundResult, string> = { perfect: "完美！", good: "不错！", miss: "可惜！" };
const RESULT_COLOR: Record<RoundResult, string> = { perfect: "#ffd34d", good: "#bfe08a", miss: "#e07a5f" };

// How many perfects in a row sit at the end of `rounds` right now — purely cosmetic (the
// COMBO badge below), not read anywhere near gradeFromRounds.
function countTrailingPerfects(rounds: RoundResult[]): number {
  let count = 0;
  for (let i = rounds.length - 1; i >= 0 && rounds[i] === "perfect"; i--) count++;
  return count;
}

// The finishing step of a pot that's done simmering (CookingPots): 3 timed stops of a
// sweeping indicator, whose grade decides what comes out. The ingredients already went in
// when the pot started, so "나중에" below just closes this — the pot stays ready to retry.
export function CookingMinigame({
  recipe,
  cookSpeedPercent,
  guideActive = false,
  onCancel,
  onFinish,
}: {
  recipe: Recipe;
  cookSpeedPercent: number;
  // First-ever cook only: draws its own arrow/hint pointing at the 멈춰! button on round 1.
  // This modal renders above TutorialOverlay's spotlight layer, so — the same reason
  // DishPicker's own `guideRecipeId` draws its own arrow — it has to do this itself.
  guideActive?: boolean;
  onCancel: () => void;
  onFinish: (grade: CookGrade) => void;
}) {
  const [round, setRound] = useState(0);
  const [results, setResults] = useState<RoundResult[]>([]);
  // Set only on a 망함 grade — held up on its own for a beat (no CookCompleteBurst follows a
  // failed cook, since collectDish grants nothing) before onFinish actually closes this.
  const [failed, setFailed] = useState(false);
  // A 망함 can be retried by watching an ad, up to FAIL_RETRIES times per cook; `attempt`
  // keys the rounds so a retry remounts them fresh.
  const [retriesLeft, setRetriesLeft] = useState(FAIL_RETRIES);
  const [attempt, setAttempt] = useState(0);
  const difficulty = MINIGAME_DIFFICULTY[recipe.tier];
  const zoneWidth = getZoneWidth(recipe.tier, cookSpeedPercent);
  const showingResult = results.length > round;
  const lastResult = results[results.length - 1];
  const combo = countTrailingPerfects(results);

  // Sizzle-on cue the moment the pot's up, so the three stops below don't open in silence —
  // cookStart/cookDone exist in sfx already but nothing was ever wired to play them.
  useEffect(() => {
    playSfx("cookStart");
  }, []);

  const handleStop = (result: RoundResult) => {
    playHaptic(result === "perfect" ? "crit" : "hit");
    playSfx(result === "perfect" ? "crit" : "hit", result === "miss" ? 0.5 : 1);
    const next = [...results, result];
    setResults(next);
    setTimeout(() => {
      if (next.length < MINIGAME_ROUNDS) {
        setRound((value) => value + 1);
        return;
      }
      const grade = gradeFromRounds(next);
      if (grade === "fail") {
        setFailed(true);
        // With retries left, the ad offer below decides what happens next instead.
        if (retriesLeft === 0) setTimeout(() => onFinish("fail"), FAIL_HOLD_MS);
      } else {
        playSfx("cookDone");
        onFinish(grade);
      }
    }, RESULT_HOLD_MS);
  };

  const retry = () => {
    setRetriesLeft((value) => value - 1);
    setAttempt((value) => value + 1);
    setResults([]);
    setRound(0);
    setFailed(false);
  };

  return (
    <Modal visible animationType="fade" transparent onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.panel}>
          <NineSlice slice={kit.panelLarge} />
          <View style={styles.top}>
            <Text style={styles.eyebrow}>COOKING</Text>
            <Text style={styles.title}>{t(recipe.name)}</Text>
            <Text style={styles.difficulty}>
              {t(
                `난이도 ${difficulty.label}`,
                `Difficulty: ${DIFFICULTY_LABEL_EN[recipe.tier]}`,
                `難易度: ${DIFFICULTY_LABEL_JA[recipe.tier]}`,
                `难度: ${DIFFICULTY_LABEL_ZH[recipe.tier]}`,
              )}
            </Text>
          </View>

          <JigglingChef active={!failed} />

          <View style={styles.dots}>
            {Array.from({ length: MINIGAME_ROUNDS }, (_, index) => (
              <Dot key={index} result={results[index]} />
            ))}
          </View>

          {failed ? (
            <View style={styles.failWrap}>
              {/* The dish itself goes black (tintColor recolors its opaque pixels, keeping
                  its silhouette) — not a dark rectangle laid over it. */}
              <Image source={recipe.image} style={styles.failImage} />
              <StrokedText style={styles.failText} strokeColor={colors.line} strokeWidth={2.5}>
                {t("망함...", "Failed...")}
              </StrokedText>
            </View>
          ) : showingResult && lastResult ? (
            <ResultReveal key={`${attempt}-${results.length}`} result={lastResult} combo={combo} />
          ) : (
            <Round
              key={`${attempt}-${round}`}
              round={round}
              baseSweepMs={difficulty.sweepMs}
              zoneWidth={zoneWidth}
              guideActive={guideActive && round === 0 && attempt === 0}
              onStop={handleStop}
            />
          )}

          {failed && retriesLeft > 0 && (
            <RewardedAdModal
              autoStart={false}
              message={t(
                `광고를 보면 한 번 더 도전할 수 있어요. (남은 기회 ${retriesLeft}/${FAIL_RETRIES})`,
                `Watch an ad to try again. (${retriesLeft}/${FAIL_RETRIES} chances left)`,
              )}
              claimLabel={t("재도전", "Try Again")}
              onClaim={retry}
              secondary={{ label: t("포기하기", "Give Up"), onPress: () => onFinish("fail") }}
            />
          )}

          {!failed && (
            <Pressable onPress={onCancel} style={styles.cancel} accessibilityRole="button" accessibilityLabel={t("나중에 마무리하기", "Finish later")}>
              <Text style={styles.cancelText}>{t("나중에", "Later")}</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}

// The chef+wok rocks and hops in place the whole time cooking's underway — a continuous
// "들썩들썩" simmer feel instead of sitting dead still while the player works the bar below.
// Settles to a stop once `active` goes false (the 망함 reveal — still jiggling through that
// would read wrong).
function JigglingChef({ active }: { active: boolean }) {
  const wobble = useSharedValue(0);
  useEffect(() => {
    wobble.value = active
      ? withRepeat(withSequence(withTiming(1, { duration: 150, easing: Easing.inOut(Easing.quad) }), withTiming(0, { duration: 150, easing: Easing.inOut(Easing.quad) })), -1)
      : withTiming(0, { duration: 200 });
  }, [active, wobble]);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: -wobble.value * 4 }, { rotate: `${(wobble.value - 0.5) * 8}deg` }],
  }));
  return <Animated.Image source={chef.wok} style={[styles.chef, style]} resizeMode="contain" />;
}

// One progress pip, popping in with an overshoot the instant its round lands instead of just
// appearing — `result` goes from undefined to set exactly once, which this watches to fire.
function Dot({ result }: { result: RoundResult | undefined }) {
  const pop = useSharedValue(1);
  useEffect(() => {
    if (!result) return;
    pop.value = 0.3;
    pop.value = withTiming(1, { duration: 260, easing: Easing.out(Easing.back(2.2)) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));
  return <Animated.View style={[styles.dot, result && { backgroundColor: RESULT_COLOR[result] }, style]} />;
}

// The per-round payoff: the result text punches in with an overshoot (a harder punch for a
// perfect, a side-to-side shake layered on for a miss) instead of just appearing static.
// Keyed by `results.length` in the parent so this remounts — and replays — fresh every round.
function ResultReveal({ result, combo }: { result: RoundResult; combo: number }) {
  const pop = useSharedValue(0.4);
  const shake = useSharedValue(0);
  const comboPop = useSharedValue(0);
  useEffect(() => {
    pop.value = withTiming(1, {
      duration: result === "perfect" ? 320 : 220,
      easing: Easing.out(Easing.back(result === "perfect" ? 2.4 : 1.6)),
    });
    if (result === "miss") {
      shake.value = withSequence(
        withTiming(1, { duration: 50 }),
        withTiming(-1, { duration: 90 }),
        withTiming(0.6, { duration: 90 }),
        withTiming(0, { duration: 90 }),
      );
    }
    // The badge lands a beat after the text itself, so it reads as "...and a combo!" rather
    // than both slamming in at once.
    if (combo >= 2) comboPop.value = withDelay(120, withTiming(1, { duration: 220, easing: Easing.out(Easing.back(2)) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const textStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pop.value }, { translateX: shake.value * 10 }],
  }));
  const comboStyle = useAnimatedStyle(() => ({
    opacity: comboPop.value === 0 ? 0 : 1,
    transform: [{ scale: comboPop.value }],
  }));
  return (
    <View style={styles.resultWrap}>
      <Animated.View style={textStyle}>
        <StrokedText style={[styles.resultText, { color: RESULT_COLOR[result] }]} strokeColor={colors.line} strokeWidth={2}>
          {t(RESULT_TEXT[result], RESULT_TEXT_EN[result], RESULT_TEXT_JA[result], RESULT_TEXT_ZH[result])}
        </StrokedText>
      </Animated.View>
      {combo >= 2 && (
        <Animated.View style={comboStyle}>
          <StrokedText style={styles.comboText} strokeColor={colors.line} strokeWidth={1.5}>
            {t(`${combo} 콤보!`, `${combo} Combo!`)}
          </StrokedText>
        </Animated.View>
      )}
    </View>
  );
}

// One sweep-and-stop attempt. Remounted fresh (via the parent's `key={round}`) for every
// round, so there's nothing to manually reset between attempts. The indicator's position is
// a pure function of wall-clock time (sweepPosition), read straight off Date.now() at the
// moment of stopping — never off the `now` state below, which only drives the *visual*
// redraw and would otherwise be a stale closure inside the round-timeout's one-time effect.
function Round({
  round,
  baseSweepMs,
  zoneWidth,
  guideActive,
  onStop,
}: {
  round: number;
  baseSweepMs: number;
  zoneWidth: number;
  guideActive: boolean;
  onStop: (result: RoundResult) => void;
}) {
  const sweepMs = getRoundSweepMs(baseSweepMs, round);
  const drifting = isDriftingRound(round);
  const margin = drifting ? getDriftMargin(zoneWidth) : 0;
  const [zoneCenter] = useState(() => randomZoneCenter(zoneWidth, margin));
  const [startedAt] = useState(() => Date.now());
  const [now, setNow] = useState(startedAt);
  const [channelWidth, setChannelWidth] = useState(0);
  const stoppedRef = useRef(false);
  const pulse = useSharedValue(0);

  const stop = () => {
    if (stoppedRef.current) return;
    stoppedRef.current = true;
    const elapsed = Date.now() - startedAt;
    const position = sweepPosition(elapsed, sweepMs);
    onStop(classifyStop(position, driftingZoneCenter(elapsed, zoneCenter, margin), zoneWidth));
  };

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 16);
    const timeout = setTimeout(stop, ROUND_TIMEOUT_MS);
    // A slow, continuous breathing pulse on the zone/indicator — just enough to keep the
    // track feeling alive while the player's tracking the sweep, not a gameplay signal.
    pulse.value = withRepeat(withSequence(withTiming(1, { duration: 500, easing: Easing.inOut(Easing.quad) }), withTiming(0, { duration: 500, easing: Easing.inOut(Easing.quad) })), -1);
    return () => {
      clearInterval(tick);
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const position = sweepPosition(now - startedAt, sweepMs);
  const liveZoneCenter = driftingZoneCenter(now - startedAt, zoneCenter, margin);
  const zonePulseStyle = useAnimatedStyle(() => ({ opacity: 0.75 + pulse.value * 0.25 }));
  const indicatorPulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: 1 + pulse.value * 0.12 }] }));

  return (
    <View style={styles.round}>
      {drifting && <Text style={styles.driftHint}>{t("타겟이 움직여요!", "The target is moving!")}</Text>}
      <View style={styles.track}>
        <NineSlice slice={frameKit.barFrame} scale={TRACK_SCALE} />
        <View
          style={[styles.channel, { top: CHANNEL_INSET_Y, bottom: CHANNEL_INSET_Y, left: CHANNEL_INSET_X, right: CHANNEL_INSET_X }]}
          onLayout={(event) => setChannelWidth(event.nativeEvent.layout.width)}
        >
          {channelWidth > 0 && (
            <>
              <Animated.View
                style={[styles.zone, { left: (liveZoneCenter - zoneWidth / 2) * channelWidth, width: zoneWidth * channelWidth }, zonePulseStyle]}
              >
                {/* The 완벽 band — the middle PERFECT_SHARE of the zone (classifyStop). */}
                <View
                  style={[
                    styles.perfectZone,
                    { left: ((1 - PERFECT_SHARE) / 2) * zoneWidth * channelWidth, width: PERFECT_SHARE * zoneWidth * channelWidth },
                  ]}
                />
              </Animated.View>
              <Animated.View style={[styles.indicator, { left: position * channelWidth - INDICATOR_SIZE / 2 }, indicatorPulseStyle]} />
            </>
          )}
        </View>
      </View>
      <View style={styles.stopButtonWrap}>
        <GameButton variant="green" onPress={stop} style={styles.stopButton} textStyle={styles.stopButtonText}>
          {t("멈춰!", "Stop!")}
        </GameButton>
        {guideActive && (
          <>
            <GuideArrow direction="down" style={styles.guideArrow} />
            <Text style={styles.guideHint}>{t("지금 눌러서 멈춰 봐!", "Tap it now to stop!")}</Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, padding: 22, paddingHorizontal: 14, justifyContent: "center", backgroundColor: "#263024cf" },
  panel: { width: "100%", maxWidth: 410, alignSelf: "center", paddingHorizontal: 20, paddingTop: 18, paddingBottom: 22, alignItems: "center" },
  top: { alignItems: "center" },
  eyebrow: { color: colors.green, fontWeight: "800", fontFamily: fonts.bold, fontSize: 12, letterSpacing: 1.5 },
  title: { marginTop: 2, fontSize: 20, fontWeight: "800", fontFamily: fonts.bold, color: colors.ink, letterSpacing: -0.5 },
  difficulty: { marginTop: 2, fontFamily: fonts.light, letterSpacing: -0.33, fontSize: 11, color: colors.muted },
  chef: { width: 96, height: 96, marginTop: 6 },
  dots: { flexDirection: "row", gap: 8, marginTop: 10 },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.paper, borderWidth: 2, borderColor: colors.line },
  round: { width: "100%", alignItems: "center", marginTop: 14 },
  track: { width: "100%", height: TRACK_HEIGHT },
  channel: { position: "absolute" },
  zone: { position: "absolute", top: 0, bottom: 0, borderRadius: 4, backgroundColor: "#bfe08a99" },
  perfectZone: { position: "absolute", top: 0, bottom: 0, borderRadius: 4, backgroundColor: "#ffd34dcc", borderLeftWidth: 1.5, borderRightWidth: 1.5, borderColor: "#c98a1a" },
  indicator: {
    position: "absolute",
    top: -3,
    bottom: -3,
    width: INDICATOR_SIZE,
    borderRadius: INDICATOR_SIZE / 2,
    backgroundColor: colors.gold,
    borderWidth: 2,
    borderColor: colors.line,
  },
  resultWrap: { width: "100%", height: TRACK_HEIGHT + 56, marginTop: 14, alignItems: "center", justifyContent: "center", gap: 4 },
  resultText: { fontSize: 28, fontWeight: "900", fontFamily: fonts.bold },
  comboText: { fontSize: 15, fontWeight: "900", fontFamily: fonts.bold, color: colors.gold },
  driftHint: { marginBottom: -4, fontSize: 11, fontWeight: "800", fontFamily: fonts.bold, color: colors.red, letterSpacing: -0.2 },
  failWrap: { width: "100%", height: TRACK_HEIGHT + 56, marginTop: 14, alignItems: "center", justifyContent: "center", gap: 6 },
  // tintColor repaints every opaque pixel black, leaving transparent ones alone — the dish's
  // own shape reads as a burnt silhouette instead of a black box sitting over it.
  failImage: { width: 56, height: 56, resizeMode: "contain", tintColor: "#000000", opacity: 0.85 },
  failText: { fontSize: 24, fontWeight: "900", fontFamily: fonts.bold, color: "#e07a5f" },
  stopButtonWrap: { marginTop: 18, alignItems: "center" },
  stopButton: { minWidth: 140, minHeight: 44, paddingHorizontal: 20 },
  stopButtonText: { fontSize: 16 },
  guideArrow: { bottom: "100%", marginBottom: 2 },
  guideHint: { position: "absolute", bottom: "100%", marginBottom: 46, fontSize: 11, fontWeight: "800", fontFamily: fonts.bold, color: colors.cream, textAlign: "center", width: 160 },
  cancel: { marginTop: 14, paddingVertical: 4, paddingHorizontal: 10 },
  cancelText: { fontSize: 11, fontWeight: "800", fontFamily: fonts.bold, color: colors.muted },
});
