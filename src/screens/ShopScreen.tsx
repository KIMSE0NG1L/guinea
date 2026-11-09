import { useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { Text } from "../components/GameText";
import { colors, fonts } from "../theme";
import { PageHeading } from "../components/PageHeading";
import { GameButton } from "../components/GameButton";
import { AdBadge } from "../components/AdBadge";
import { RewardedAdModal } from "../components/RewardedAdModal";
import { creamSlices, currencyImages, kit } from "../assets";
import { Panel } from "../components/NineSlice";
import { formatGameNumber } from "../state/gameMath";
import { AD_GEMS_REWARD, SHOP_ADS_PER_DAY, type UseGameState } from "../state/useGameState";

type AdKind = "gems" | "gold";

// What the store will sell once payments open. Shown now so the shop isn't empty, but every
// one is locked behind the "추후 오픈" notice — nothing here can be bought yet.
const PACKS: { kind: "gem" | "gold"; tier: number; name: string; amount: string }[] = [
  { kind: "gem", tier: 2, name: "보석 한 줌", amount: "보석 300" },
  { kind: "gem", tier: 3, name: "보석 주머니", amount: "보석 1,000" },
  { kind: "gem", tier: 4, name: "보석 자루", amount: "보석 3,000" },
  { kind: "gem", tier: 5, name: "보석 수레", amount: "보석 10,000" },
  { kind: "gold", tier: 2, name: "골드 한 줌", amount: "몹 500마리분" },
  { kind: "gold", tier: 3, name: "골드 주머니", amount: "몹 2,000마리분" },
  { kind: "gold", tier: 4, name: "골드 자루", amount: "몹 6,000마리분" },
  { kind: "gold", tier: 5, name: "골드 수레", amount: "몹 20,000마리분" },
];

export function ShopScreen({ game }: { game: UseGameState }) {
  const [watching, setWatching] = useState<AdKind | null>(null);
  const reward = (kind: AdKind) => (kind === "gems" ? `보석 ${AD_GEMS_REWARD}개` : `골드 ${formatGameNumber(game.adGoldReward)}`);
  return (
    <View style={styles.page}>
      <PageHeading kicker="SHOP" title="골목 상점" description="광고를 보면 하루에 보석과 골드를 5번씩 받을 수 있어요." />

      <Text style={styles.section}>무료 보상</Text>
      <View style={styles.adRow}>
        {(["gems", "gold"] as const).map((kind) => {
          const left = game.shopAdsLeft[kind];
          return (
            <Panel key={kind} slice={kit.panel} style={styles.adCard}>
              <Image source={kind === "gems" ? currencyImages.gem[1] : currencyImages.gold[1]} style={styles.adIcon} />
              <Text style={styles.adAmount}>{reward(kind)}</Text>
              <Text style={styles.adLeft}>{`오늘 ${left}/${SHOP_ADS_PER_DAY}`}</Text>
              <View>
                <GameButton
                  variant={left > 0 ? "green" : "gray"}
                  disabled={left === 0}
                  onPress={() => setWatching(kind)}
                  style={styles.adButton}
                  textStyle={styles.adButtonText}
                  accessibilityLabel={`광고 보고 ${reward(kind)} 받기`}
                >
                  {left > 0 ? "광고 보기" : "내일 다시"}
                </GameButton>
                {left > 0 && <AdBadge />}
              </View>
            </Panel>
          );
        })}
      </View>

      <Text style={styles.section}>보석 · 골드 상품</Text>
      {/* Payments aren't wired up yet: one clear notice, and every pack greyed out. */}
      <Panel slice={creamSlices.row} scale={0.4} style={styles.notice}>
        <Text style={styles.noticeText}>결제 시스템은 추후 오픈할 예정이에요.</Text>
      </Panel>
      <View style={styles.grid}>
        {PACKS.map((pack) => (
          <Panel key={`${pack.kind}-${pack.tier}`} slice={kit.inset} style={styles.pack}>
            <Image source={(pack.kind === "gem" ? currencyImages.gem : currencyImages.gold)[pack.tier - 1]} style={styles.packIcon} />
            <Text style={styles.packName}>{pack.name}</Text>
            <Text style={styles.packAmount}>{pack.amount}</Text>
            <GameButton variant="gray" disabled style={styles.packButton} textStyle={styles.packButtonText}>
              추후 오픈
            </GameButton>
          </Panel>
        ))}
      </View>

      {watching && (
        <RewardedAdModal
          message={`대신 섭섭하지 않게 ${reward(watching)}는 그대로 챙겨드릴게요.`}
          claimLabel={`${reward(watching)} 받기`}
          onClaim={() => {
            game.watchShopAd(watching);
            setWatching(null);
          }}
          onCancel={() => setWatching(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: "#e8dcc4", paddingHorizontal: 16, paddingTop: 20, paddingBottom: 25 },
  section: { marginTop: 4, marginBottom: 8, fontSize: 16, fontWeight: "900", fontFamily: fonts.bold, color: colors.ink },
  adRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  adCard: { flex: 1, alignItems: "center", paddingHorizontal: 12, paddingTop: 14, paddingBottom: 16, gap: 2 },
  adIcon: { width: 72, height: 64, resizeMode: "contain", marginBottom: 4 },
  adAmount: { fontSize: 16, fontWeight: "900", fontFamily: fonts.bold, color: colors.ink },
  adLeft: { fontFamily: fonts.light, letterSpacing: -0.36, fontSize: 12, color: colors.muted },
  adButton: { marginTop: 8, minWidth: 110, minHeight: 44 },
  adButtonText: { fontSize: 15 },
  notice: { marginBottom: 10, paddingVertical: 10, paddingHorizontal: 14, alignItems: "center" },
  noticeText: { fontSize: 13, fontWeight: "800", fontFamily: fonts.bold, color: colors.brown, textAlign: "center" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  pack: { flexBasis: "47%", flexGrow: 1, alignItems: "center", paddingHorizontal: 10, paddingTop: 12, paddingBottom: 14, gap: 2 },
  packIcon: { width: 64, height: 60, resizeMode: "contain", marginBottom: 4, opacity: 0.85 },
  packName: { fontSize: 14, fontWeight: "900", fontFamily: fonts.bold, color: colors.ink },
  packAmount: { fontFamily: fonts.light, letterSpacing: -0.36, fontSize: 12, color: colors.muted },
  packButton: { marginTop: 8, minWidth: 96 },
  packButtonText: { fontSize: 13 },
});
