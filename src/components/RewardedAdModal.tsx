import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Image, Modal, Pressable, StyleSheet, Text } from "react-native";
import { colors, fonts } from "../theme";
import { kit, icons } from "../assets";
import { NineSlice } from "./NineSlice";
import { GameButton } from "./GameButton";
import { getLastAdError, showRewardedAd } from "../ads";

type Phase = "prompt" | "loading" | "fallback";

// Every "watch an ad for X" button goes through this. It plays a real rewarded ad (src/ads):
// - watched to the end: onClaim hands the reward out.
// - closed early: onCancel (or, without one, back to the prompt to try again).
// - no ad to show (offline, no fill yet, web): the old "no ad right now" panel with
//   `message` (the "we'll give it to you anyway" line), and the reward is handed out anyway.
// `autoStart` false shows the message with a button first (the boss retry prompt, which
// opens on its own when the boss timer runs out; an ad must never start unasked).
export function RewardedAdModal({
  message,
  claimLabel,
  onClaim,
  onCancel,
  autoStart = true,
}: {
  message: string;
  claimLabel: string;
  onClaim: () => void;
  onCancel?: () => void;
  autoStart?: boolean;
}) {
  const [phase, setPhase] = useState<Phase>(autoStart ? "loading" : "prompt");
  const mounted = useRef(true);
  const callbacks = useRef({ onClaim, onCancel });
  useEffect(() => {
    callbacks.current = { onClaim, onCancel };
  });

  const start = () => {
    showRewardedAd().then((result) => {
      if (!mounted.current) return;
      if (result === "earned") callbacks.current.onClaim();
      else if (result === "failed") setPhase("fallback");
      else if (callbacks.current.onCancel) callbacks.current.onCancel();
      else setPhase("prompt");
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

  const dismiss = phase === "fallback" ? onClaim : phase === "prompt" ? onCancel : undefined;

  return (
    <Modal visible animationType="fade" transparent onRequestClose={() => dismiss?.()}>
      <Pressable style={styles.backdrop} onPress={() => dismiss?.()}>
        <Pressable style={styles.panel} onPress={(event) => event.stopPropagation()}>
          <NineSlice slice={kit.panelLarge} />
          <Image source={icons.energy} style={styles.heroIcon} />
          <Text style={styles.eyebrow}>광고 안내</Text>
          {phase === "loading" && (
            <>
              <Text style={styles.title}>광고를 불러오는 중이에요</Text>
              <ActivityIndicator color={colors.green} style={styles.spinner} />
            </>
          )}
          {phase === "prompt" && (
            <>
              <Text style={styles.message}>{message}</Text>
              <GameButton variant="green" onPress={play} style={styles.claimButton}>{claimLabel}</GameButton>
            </>
          )}
          {phase === "fallback" && (
            <>
              <Text style={styles.title}>앗, 지금은 보여드릴 광고가 없어요!</Text>
              <Text style={styles.message}>{autoStart ? message : "대신 섭섭하지 않게 보상은 그대로 챙겨드릴게요."}</Text>
              <GameButton variant="green" onPress={onClaim} style={styles.claimButton}>{claimLabel}</GameButton>
              {getLastAdError() !== null && <Text style={styles.errorCode}>광고 오류: {getLastAdError()}</Text>}
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 18,
    alignItems: "center",
  },
  heroIcon: { width: 44, height: 44, marginBottom: 6 },
  eyebrow: { color: colors.green, fontWeight: "800", fontFamily: fonts.bold, fontSize: 9, letterSpacing: 1.5 },
  title: { marginTop: 2, fontSize: 15, fontWeight: "800", fontFamily: fonts.bold, color: colors.ink, textAlign: "center" },
  message: { marginTop: 8, fontSize: 11, color: colors.brown, textAlign: "center", lineHeight: 16 },
  spinner: { marginTop: 14, marginBottom: 4 },
  claimButton: { marginTop: 16, minWidth: 140 },
  errorCode: { marginTop: 8, fontSize: 8, color: colors.muted, textAlign: "center" },
});
