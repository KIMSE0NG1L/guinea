import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { kit } from "../assets";
import { ConfirmModal } from "../components/ConfirmModal";
import { GameButton } from "../components/GameButton";
import { Panel } from "../components/NineSlice";
import { PageHeading } from "../components/PageHeading";
import { RewardedAdModal } from "../components/RewardedAdModal";
import { canRebirth, REBIRTH_AD_GEMS, REBIRTH_ATTACK_MULTIPLIER, REBIRTH_GOLD_BONUS } from "../state/rebirth";
import { getRunNumber, REBIRTH_HP_MULTIPLIER } from "../state/stages";
import { formatGameNumber } from "../state/gameMath";
import type { GameState } from "../types";

export function RebirthScreen({ state, onRebirth }: { state: GameState; onRebirth: (bonusGems: number) => void }) {
  const [confirming, setConfirming] = useState<"plain" | "ad" | null>(null);
  const [watchingAd, setWatchingAd] = useState(false);
  const ready = canRebirth(state);
  const run = getRunNumber(state);

  return (
    <View style={styles.page}>
      <PageHeading kicker="REBIRTH" title="환생" description="마지막 보스를 쓰러뜨리면 더 강해져서 처음부터 다시 떠나요." />

      <Panel slice={kit.panel} style={styles.summary}>
        <Text style={styles.summaryValue}>{formatGameNumber(run)}회차 모험 중</Text>
        <Text style={styles.summaryLabel}>
          {`시작 공격력 ×${formatGameNumber(REBIRTH_ATTACK_MULTIPLIER ** (run - 1))} · 골드 획득 +${formatGameNumber(REBIRTH_GOLD_BONUS * (run - 1))}%`}
        </Text>
      </Panel>

      <Text style={styles.section}>다음 회차로</Text>
      <Panel slice={kit.panel} style={styles.info}>
        <Text style={styles.infoStrong}>{`시작 공격력 ×${REBIRTH_ATTACK_MULTIPLIER} · 골드 획득 +${REBIRTH_GOLD_BONUS}%`}</Text>
        <Text style={styles.infoLine}>{`대신 적 체력이 ${REBIRTH_HP_MULTIPLIER}배가 돼요.`}</Text>
        <Text style={styles.infoLine}>유지: 동료 · 레시피 · 보석 · 레벨 · 도감</Text>
        <Text style={styles.infoLine}>초기화: 스테이지 · 골드 · 스탯 · 가방</Text>
        {ready ? (
          <View style={styles.actions}>
            <GameButton variant="beige" onPress={() => setConfirming("plain")}>
              {`${formatGameNumber(run + 1)}회차 시작`}
            </GameButton>
            <GameButton variant="green" onPress={() => setConfirming("ad")}>
              {`광고 보고 시작 (보석 +${REBIRTH_AD_GEMS})`}
            </GameButton>
          </View>
        ) : (
          <Text style={styles.locked}>마지막 스테이지의 보스를 쓰러뜨리면 환생할 수 있어요.</Text>
        )}
      </Panel>

      {confirming && (
        <ConfirmModal
          title="정말 환생할까요?"
          message="스테이지, 골드, 스탯, 가방의 재료와 요리가 사라져요. 되돌릴 수 없어요."
          confirmLabel="환생하기"
          onCancel={() => setConfirming(null)}
          onConfirm={() => {
            const viaAd = confirming === "ad";
            setConfirming(null);
            if (viaAd) setWatchingAd(true);
            else onRebirth(0);
          }}
        />
      )}
      {watchingAd && (
        <RewardedAdModal
          message={`지금은 광고가 없네요. 그래도 보석 ${REBIRTH_AD_GEMS}개를 챙겨드릴게요.`}
          claimLabel="환생하기"
          onClaim={() => onRebirth(REBIRTH_AD_GEMS)}
          onCancel={() => setWatchingAd(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: "#e8dcc4", paddingHorizontal: 12, paddingTop: 18, paddingBottom: 25 },
  summary: { alignItems: "center", paddingVertical: 14 },
  summaryValue: { fontSize: 18, fontWeight: "900", fontFamily: fonts.bold, color: colors.ink },
  summaryLabel: { marginTop: 3, fontSize: 10, color: colors.brown },
  section: { marginTop: 16, marginBottom: 8, fontSize: 13, fontWeight: "900", fontFamily: fonts.bold, color: colors.brown },
  info: { paddingHorizontal: 14, paddingVertical: 14, gap: 4 },
  infoStrong: { fontSize: 13, fontWeight: "900", fontFamily: fonts.bold, color: colors.ink },
  infoLine: { fontSize: 11, lineHeight: 16, color: colors.brown },
  actions: { marginTop: 10, gap: 8 },
  locked: { marginTop: 10, fontSize: 11, fontWeight: "800", fontFamily: fonts.bold, color: colors.red, textAlign: "center" },
});
