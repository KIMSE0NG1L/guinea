import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Image, Modal, Pressable, StyleSheet, View } from "react-native";
import { Text } from "./GameText";
import { colors, fonts } from "../theme";
import { kit, icons } from "../assets";
import { NineSlice } from "./NineSlice";
import { GameButton } from "./GameButton";
import { AdBadge } from "./AdBadge";
import { getLastAdError, showRewardedAd } from "../ads";
import { t } from "../i18n";

type Phase = "prompt" | "loading" | "fallback";

// Every "watch an ad for X" button goes through this. It plays a real rewarded ad (src/ads):
// - watched to the end: onClaim hands the reward out.
// - closed early, or no ad to show (offline, no fill yet, web): no reward — onCancel (or,
//   without one, back to the prompt to try again). The "no ad right now" panel just explains
//   why and dismisses; it never hands the reward out on its own.
// `autoStart` false shows the message with a button first (the boss retry prompt, which
// opens on its own when the boss timer runs out; an ad must never start unasked).
export function RewardedAdModal({
  message,
  claimLabel,
  onClaim,
  onCancel,
  autoStart = true,
  secondary,
}: {
  message: string;
  claimLabel: string;
  onClaim: () => void;
  onCancel?: () => void;
  autoStart?: boolean;
  // A no-ad alternative shown beside the ad button on the prompt (e.g. the boss retry's
  // "그냥 다시 도전"), so skipping the ad is a clear choice rather than a hidden dismiss.
  secondary?: { label: string; onPress: () => void };
}) {
  const [phase, setPhase] = useState<Phase>(autoStart ? "loading" : "prompt");
  const mounted = useRef(true);
  const callbacks = useRef({ onClaim, onCancel });
  useEffect(() => {
    callbacks.current = { onClaim, onCancel };
  });

  // No ad watched to the end: no reward. "failed" (load/display failure, no fill) still shows
  // the fallback panel to explain why before dismissing; "dismissed" (closed early) skips
  // straight to it.
  const dismissNoReward = () => {
    if (callbacks.current.onCancel) callbacks.current.onCancel();
    else setPhase("prompt");
  };
  const start = () => {
    showRewardedAd().then((result) => {
      if (!mounted.current) return;
      if (result === "earned") callbacks.current.onClaim();
      else if (result === "failed") setPhase("fallback");
      else dismissNoReward();
    });
  };
  const play = () => {
    setPhase("loading");
    start();
  };

  useEffect(() => {
    mounted.current = true;
    if (autoStart) start();
    return () => {
      mounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dismiss = phase === "fallback" ? dismissNoReward : phase === "prompt" ? onCancel : undefined;

  return (
    <Modal visible animationType="fade" transparent onRequestClose={() => dismiss?.()}>
      <Pressable style={styles.backdrop} onPress={() => dismiss?.()}>
        <Pressable style={styles.panel} onPress={(event) => event.stopPropagation()}>
          <NineSlice slice={kit.panelLarge} />
          <Image source={icons.energy} style={styles.heroIcon} />
          <Text style={styles.eyebrow}>{t("광고 안내", "Ad")}</Text>
          {phase === "loading" && (
            <>
              <Text style={styles.title}>{t("광고를 불러오는 중이에요", "Loading the ad")}</Text>
              <ActivityIndicator color={colors.green} style={styles.spinner} />
            </>
          )}
          {phase === "prompt" && (
            <>
              <Text style={styles.message}>{message}</Text>
              {secondary ? (
                <View style={styles.choiceRow}>
                  <GameButton variant="beige" onPress={secondary.onPress} style={styles.choiceButton} textStyle={styles.choiceLabel}>
                    {secondary.label}
                  </GameButton>
                  <View>
                    <GameButton variant="green" onPress={play} style={styles.choiceButton}>
                      <View style={styles.choiceContent}>
                        <Text style={styles.choiceSmall}>{t("광고 보고", "Watch Ad")}</Text>
                        <Text style={styles.choiceLabel}>{claimLabel}</Text>
                      </View>
                    </GameButton>
                    <AdBadge />
                  </View>
                </View>
              ) : (
                <GameButton variant="green" onPress={play} style={styles.claimButton}>{claimLabel}</GameButton>
              )}
            </>
          )}
          {phase === "fallback" && (
            <>
              <Text style={styles.title}>{t("앗, 지금은 보여드릴 광고가 없어요!", "Oops, there's no ad to show right now!")}</Text>
              <Text style={styles.message}>{t("잠시 후 다시 시도해주세요.", "Please try again in a bit.")}</Text>
              <GameButton variant="green" onPress={dismissNoReward} style={styles.claimButton}>{t("확인", "OK")}</GameButton>
              {getLastAdError() !== null && <Text style={styles.errorCode}>{t(`광고 오류: ${getLastAdError()}`, `Ad error: ${getLastAdError()}`)}</Text>}
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    padding: 22,
    paddingHorizontal: 14,
    justifyContent: "center",
    backgroundColor: "#263024cf",
  },
  panel: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    alignItems: "center",
  },
  heroIcon: { width: 44, height: 44, marginBottom: 6 },
  eyebrow: { color: colors.green, fontWeight: "800", fontFamily: fonts.bold, fontSize: 12, letterSpacing: 1.5 },
  title: { marginTop: 2, fontSize: 18, fontWeight: "800", fontFamily: fonts.bold, color: colors.ink, textAlign: "center" },
  message: { fontFamily: fonts.light, letterSpacing: -0.36, marginTop: 8, fontSize: 12, color: colors.brown, textAlign: "center", lineHeight: 16 },
  spinner: { marginTop: 14, marginBottom: 4 },
  claimButton: { marginTop: 16, minWidth: 140 },
  choiceRow: { marginTop: 16, flexDirection: "row", gap: 8 },
  choiceButton: { minWidth: 124, minHeight: 50 },
  choiceContent: { alignItems: "center" },
  choiceSmall: { fontSize: 12, fontWeight: "800", fontFamily: fonts.bold, color: "#e9f2d4" },
  choiceLabel: { fontSize: 16, fontWeight: "900", fontFamily: fonts.bold, color: colors.cream },
  errorCode: { fontFamily: fonts.light, letterSpacing: -0.36, marginTop: 8, fontSize: 12, lineHeight: 16, color: colors.muted, textAlign: "center" },
});
