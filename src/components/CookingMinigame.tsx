import { useEffect, useRef, useState } from "react";
import { Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { chef, frameKit, kit } from "../assets";
import { NineSlice } from "./NineSlice";
import { GameButton } from "./GameButton";
import { StrokedText } from "./StrokedText";
import { GuideArrow } from "./GuideArrow";
import {
  classifyStop,
  getZoneWidth,
  gradeFromRounds,
  MINIGAME_DIFFICULTY,
  MINIGAME_ROUNDS,
  randomZoneCenter,
  ROUND_TIMEOUT_MS,
  sweepPosition,
  type RoundResult,
} from "../state/cookingMinigame";
import type { Recipe } from "../state/recipes";
import type { CookGrade } from "../state/buffs";
import { playHaptic } from "../haptics";

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

const RESULT_TEXT: Record<RoundResult, string> = { perfect: "완벽!", good: "좋아!", miss: "아깝다!" };
const RESULT_COLOR: Record<RoundResult, string> = { perfect: "#ffd34d", good: "#bfe08a", miss: "#e07a5f" };

// The active-cooking screen: 3 timed stops of a sweeping indicator, replacing the old
// real-time pot wait. Ingredients/gold are NOT spent by this component at all — the caller
// (KitchenScreen) only spends them once `onFinish` reports a grade, so "그만두기" below is
// always a free, no-cost cancel.
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
  // failed cook, since finishCook grants nothing) before onFinish actually closes this.
  const [failed, setFailed] = useState(false);
  const difficulty = MINIGAME_DIFFICULTY[recipe.tier];
  const zoneWidth = getZoneWidth(recipe.tier, cookSpeedPercent);
  const showingResult = results.length > round;
  const lastResult = results[results.length - 1];

  const handleStop = (result: RoundResult) => {
    playHaptic(result === "perfect" ? "crit" : "hit");
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
        setTimeout(() => onFinish("fail"), FAIL_HOLD_MS);
      } else {
        onFinish(grade);
      }
    }, RESULT_HOLD_MS);
  };

  return (
    <Modal visible animationType="fade" transparent onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.panel}>
          <NineSlice slice={kit.panelLarge} />
          <View style={styles.top}>
            <Text style={styles.eyebrow}>COOKING</Text>
            <Text style={styles.title}>{recipe.name}</Text>
            <Text style={styles.difficulty}>{`난이도 ${difficulty.label}`}</Text>
          </View>

          <Image source={chef.wok} style={styles.chef} resizeMode="contain" />

          <View style={styles.dots}>
            {Array.from({ length: MINIGAME_ROUNDS }, (_, index) => (
              <View key={index} style={[styles.dot, results[index] && { backgroundColor: RESULT_COLOR[results[index]] }]} />
            ))}
          </View>

          {failed ? (
            <View style={styles.failWrap}>
              <View style={styles.failImageWrap}>
                <Image source={recipe.image} style={styles.failImage} />
                {/* 80% black over the dish — see the plan: a failed cook grants nothing, so
                    this is the only visual the player gets for it. */}
                <View style={styles.failOverlay} />
              </View>
              <StrokedText style={styles.failText} strokeColor={colors.line} strokeWidth={2.5}>
                망함...
              </StrokedText>
            </View>
          ) : showingResult && lastResult ? (
            <View style={styles.resultWrap}>
              <StrokedText style={[styles.resultText, { color: RESULT_COLOR[lastResult] }]} strokeColor={colors.line} strokeWidth={2}>
                {RESULT_TEXT[lastResult]}
              </StrokedText>
            </View>
          ) : (
            <Round
              key={round}
              sweepMs={difficulty.sweepMs}
              zoneWidth={zoneWidth}
              guideActive={guideActive && round === 0}
              onStop={handleStop}
            />
          )}

          {!failed && (
            <Pressable onPress={onCancel} style={styles.cancel} accessibilityRole="button" accessibilityLabel="요리 그만두기">
              <Text style={styles.cancelText}>그만두기</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}

// One sweep-and-stop attempt. Remounted fresh (via the parent's `key={round}`) for every
// round, so there's nothing to manually reset between attempts. The indicator's position is
// a pure function of wall-clock time (sweepPosition), read straight off Date.now() at the
// moment of stopping — never off the `now` state below, which only drives the *visual*
// redraw and would otherwise be a stale closure inside the round-timeout's one-time effect.
function Round({
  sweepMs,
  zoneWidth,
  guideActive,
  onStop,
}: {
  sweepMs: number;
  zoneWidth: number;
  guideActive: boolean;
  onStop: (result: RoundResult) => void;
}) {
  const [zoneCenter] = useState(() => randomZoneCenter(zoneWidth));
  const [startedAt] = useState(() => Date.now());
  const [now, setNow] = useState(startedAt);
  const [channelWidth, setChannelWidth] = useState(0);
  const stoppedRef = useRef(false);

  const stop = () => {
    if (stoppedRef.current) return;
    stoppedRef.current = true;
    const position = sweepPosition(Date.now() - startedAt, sweepMs);
    onStop(classifyStop(position, zoneCenter, zoneWidth));
  };

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 16);
    const timeout = setTimeout(stop, ROUND_TIMEOUT_MS);
    return () => {
      clearInterval(tick);
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const position = sweepPosition(now - startedAt, sweepMs);

  return (
    <View style={styles.round}>
      <View style={styles.track}>
        <NineSlice slice={frameKit.barFrame} scale={TRACK_SCALE} />
        <View
          style={[styles.channel, { top: CHANNEL_INSET_Y, bottom: CHANNEL_INSET_Y, left: CHANNEL_INSET_X, right: CHANNEL_INSET_X }]}
          onLayout={(event) => setChannelWidth(event.nativeEvent.layout.width)}
        >
          {channelWidth > 0 && (
            <>
              <View style={[styles.zone, { left: (zoneCenter - zoneWidth / 2) * channelWidth, width: zoneWidth * channelWidth }]} />
              <View style={[styles.indicator, { left: position * channelWidth - INDICATOR_SIZE / 2 }]} />
            </>
          )}
        </View>
      </View>
      <View style={styles.stopButtonWrap}>
        <GameButton variant="green" onPress={stop} style={styles.stopButton} textStyle={styles.stopButtonText}>
          멈춰!
        </GameButton>
        {guideActive && (
          <>
            <GuideArrow direction="down" style={styles.guideArrow} />
            <Text style={styles.guideHint}>지금 눌러서 멈춰 봐!</Text>
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
  resultWrap: { width: "100%", height: TRACK_HEIGHT + 56, marginTop: 14, alignItems: "center", justifyContent: "center" },
  resultText: { fontSize: 28, fontWeight: "900", fontFamily: fonts.bold },
  failWrap: { width: "100%", height: TRACK_HEIGHT + 56, marginTop: 14, alignItems: "center", justifyContent: "center", gap: 6 },
  failImageWrap: { width: 56, height: 56 },
  failImage: { width: "100%", height: "100%", resizeMode: "contain" },
  failOverlay: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, borderRadius: 8, backgroundColor: "#000000cc" },
  failText: { fontSize: 24, fontWeight: "900", fontFamily: fonts.bold, color: "#e07a5f" },
  stopButtonWrap: { marginTop: 18, alignItems: "center" },
  stopButton: { minWidth: 140, minHeight: 44, paddingHorizontal: 20 },
  stopButtonText: { fontSize: 16 },
  guideArrow: { bottom: "100%", marginBottom: 2 },
  guideHint: { position: "absolute", bottom: "100%", marginBottom: 46, fontSize: 11, fontWeight: "800", fontFamily: fonts.bold, color: colors.cream, textAlign: "center", width: 160 },
  cancel: { marginTop: 14, paddingVertical: 4, paddingHorizontal: 10 },
  cancelText: { fontSize: 11, fontWeight: "800", fontFamily: fonts.bold, color: colors.muted },
});
