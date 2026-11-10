import { useState, type ReactNode } from "react";
import { Image, ImageBackground, Pressable, StyleSheet, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from "react-native";
import { Text } from "../components/GameText";
import { colors, fonts } from "../theme";
import { GameButton } from "../components/GameButton";
import { AdBadge } from "../components/AdBadge";
import { RewardedAdModal } from "../components/RewardedAdModal";
import { creamSlices, currencyImages, merchantImages, shopImages, storeSlices, type UiSlice } from "../assets";
import { NineSlice, Panel } from "../components/NineSlice";
import { ShopHero, useShopTalk } from "../components/ShopScene";
import { formatGameNumber } from "../state/gameMath";
import { AD_GEMS_REWARD, SHOP_ADS_PER_DAY, type UseGameState } from "../state/useGameState";

type AdKind = "gems" | "gold";
type PackKind = "gem" | "gold";
type Pack = { tier: number; name: string; amount: string };

// What the store will sell once payments open. Shown now so the shop isn't empty, but every
// one is locked behind the "추후 오픈" notice — nothing here can be bought yet.
const PACKS: Record<PackKind, Pack[]> = {
  gem: [
    { tier: 2, name: "보석 한 줌", amount: "보석 300" },
    { tier: 3, name: "보석 주머니", amount: "보석 1,000" },
    { tier: 4, name: "보석 자루", amount: "보석 3,000" },
    { tier: 5, name: "보석 수레", amount: "보석 10,000" },
  ],
  gold: [
    { tier: 2, name: "골드 한 줌", amount: "몹 500마리분" },
    { tier: 3, name: "골드 주머니", amount: "몹 2,000마리분" },
    { tier: 4, name: "골드 자루", amount: "몹 6,000마리분" },
    { tier: 5, name: "골드 수레", amount: "몹 20,000마리분" },
  ],
};

const TABS: { id: PackKind; label: string }[] = [
  { id: "gem", label: "보석" },
  { id: "gold", label: "골드" },
];

const GREETING = { pose: merchantImages.wave, line: "어서 와요! 광고 한 편이면 오늘 몫을 공짜로 챙겨 드려요." };
// The merchant holds up whatever the open tab sells.
const TAB_TALK: Record<PackKind, { pose: number; line: string }> = {
  gem: { pose: merchantImages.gem, line: "반짝반짝 보석은 결제가 열리면 팔게요. 조금만 기다려 줘요!" },
  gold: { pose: merchantImages.gold, line: "묵직한 골드도 결제가 열리면 바로 내놓을게요!" },
};

// A full-width store frame. Its slices keep the gem crown whole by never stretching sideways,
// so the art is drawn at whatever scale makes its source width match the box.
function StoreFrame({ slice, title, style, children }: { slice: UiSlice; title: string; style?: StyleProp<ViewStyle>; children: ReactNode }) {
  const [width, setWidth] = useState(0);
  const onLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);
  return (
    <View style={style} onLayout={onLayout}>
      {width > 0 && <NineSlice slice={slice} scale={width / slice.width} />}
      <Text style={styles.frameTitle}>{title}</Text>
      {children}
    </View>
  );
}

export function ShopScreen({ game }: { game: UseGameState }) {
  const [watching, setWatching] = useState<AdKind | null>(null);
  const [tab, setTab] = useState<PackKind>("gem");
  const { talk, say } = useShopTalk(GREETING);
  const reward = (kind: AdKind) => (kind === "gems" ? `보석 ${AD_GEMS_REWARD}개` : `골드 ${formatGameNumber(game.adGoldReward)}`);
  const icons = tab === "gem" ? currencyImages.gem : currencyImages.gold;

  const selectTab = (id: PackKind) => {
    setTab(id);
    say(TAB_TALK[id].pose, TAB_TALK[id].line);
  };

  return (
    <View style={styles.page}>
      {/* Same opening as the grocery and recipe shops: title, then the shopkeeper's scene. */}
      <View style={styles.titleCopy}>
        <Text style={styles.kicker}>SHOP</Text>
        <Text style={styles.title}>골목 상점</Text>
      </View>
      <ShopHero speaker="상인 기니" talk={talk} background={merchantImages.background} />

      {/* The one thing you can actually get here today, so it wears the ornate frame. */}
      <StoreFrame slice={storeSlices.ornate} title="오늘의 무료 보상" style={styles.freeFrame}>
        <View style={styles.freeRow}>
          {(["gems", "gold"] as const).map((kind) => {
            const left = game.shopAdsLeft[kind];
            return (
              <Panel key={kind} slice={creamSlices.cell} scale={0.3} style={styles.freeTile}>
                <Image source={kind === "gems" ? currencyImages.gem[1] : currencyImages.gold[1]} style={styles.freeIcon} />
                <Text style={styles.freeAmount} numberOfLines={1} adjustsFontSizeToFit>
                  {reward(kind)}
                </Text>
                <Text style={styles.freeLeft}>{`오늘 ${left}/${SHOP_ADS_PER_DAY}`}</Text>
                <View style={styles.freeButtonWrap}>
                  <GameButton
                    variant={left > 0 ? "green" : "gray"}
                    disabled={left === 0}
                    onPress={() => setWatching(kind)}
                    style={styles.freeButton}
                    textStyle={styles.freeButtonText}
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
      </StoreFrame>

      {/* Paid packs: grocery-style tabs over a plain gold frame; payments aren't open yet. */}
      <View style={styles.tabs}>
        {TABS.map((item) => {
          const active = item.id === tab;
          return (
            <Pressable key={item.id} onPress={() => selectTab(item.id)} accessibilityRole="tab" accessibilityState={{ selected: active }}>
              <ImageBackground source={active ? shopImages.tabRed : shopImages.tabCream} resizeMode="stretch" style={styles.tab}>
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{item.label}</Text>
              </ImageBackground>
            </Pressable>
          );
        })}
      </View>
      <StoreFrame slice={storeSlices.simple} title={tab === "gem" ? "보석 상품" : "골드 상품"} style={styles.packFrame}>
        <Text style={styles.notice}>결제 시스템은 추후 오픈할 예정이에요.</Text>
        <View style={styles.grid}>
          {PACKS[tab].map((pack) => (
            <Panel key={pack.tier} slice={creamSlices.cell} scale={0.3} style={styles.pack}>
              <Image source={icons[pack.tier - 1]} style={styles.packIcon} />
              <Text style={styles.packName}>{pack.name}</Text>
              <Text style={styles.packAmount}>{pack.amount}</Text>
              <GameButton variant="gray" disabled style={styles.packButton} textStyle={styles.packButtonText}>
                추후 오픈
              </GameButton>
            </Panel>
          ))}
        </View>
      </StoreFrame>

      {watching && (
        <RewardedAdModal
          message={`대신 섭섭하지 않게 ${reward(watching)}는 그대로 챙겨드릴게요.`}
          claimLabel={`${reward(watching)} 받기`}
          onClaim={() => {
            game.watchShopAd(watching);
            say(merchantImages.wave, `${reward(watching)} 여기 있어요. 내일 또 와요!`);
            setWatching(null);
          }}
          onCancel={() => setWatching(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: "#e8dcc4", paddingHorizontal: 16, paddingTop: 20, paddingBottom: 28 },
  // Matches ShopTopBar's title block (no back arrow — this shop is a bottom tab of its own).
  titleCopy: { marginBottom: 10 },
  kicker: { color: colors.red, fontWeight: "800", fontFamily: fonts.bold, fontSize: 12, letterSpacing: 1.5 },
  title: { fontSize: 20, fontWeight: "800", fontFamily: fonts.bold, color: colors.ink, letterSpacing: -0.5 },

  frameTitle: { alignSelf: "center", fontSize: 17, fontWeight: "900", fontFamily: fonts.bold, color: colors.ink, marginBottom: 10 },

  freeFrame: { marginTop: 6, marginBottom: 14, paddingTop: 60, paddingHorizontal: 30, paddingBottom: 34 },
  freeRow: { flexDirection: "row", gap: 10 },
  freeTile: { flex: 1, alignItems: "center", paddingHorizontal: 10, paddingTop: 14, paddingBottom: 16, gap: 2 },
  freeIcon: { width: 64, height: 56, resizeMode: "contain", marginBottom: 4 },
  freeAmount: { fontSize: 16, fontWeight: "900", fontFamily: fonts.bold, color: colors.ink },
  freeLeft: { fontFamily: fonts.light, letterSpacing: -0.36, fontSize: 12, color: colors.muted },
  freeButtonWrap: { marginTop: 8 },
  freeButton: { minWidth: 104, minHeight: 44 },
  freeButtonText: { fontSize: 15 },

  tabs: { flexDirection: "row", gap: 4, paddingHorizontal: 4 },
  // Matches the tab art's ~3:2 shape; the label sits on the upper flap, above the fold.
  tab: { width: 75, height: 50, alignItems: "center", justifyContent: "center", paddingBottom: 14 },
  tabText: { fontSize: 14, fontWeight: "900", fontFamily: fonts.bold, color: colors.brown },
  tabTextActive: { color: colors.cream },

  packFrame: { paddingTop: 44, paddingHorizontal: 28, paddingBottom: 30 },
  notice: { alignSelf: "center", marginTop: -4, marginBottom: 12, fontFamily: fonts.light, letterSpacing: -0.39, fontSize: 13, color: colors.brown, textAlign: "center" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  pack: { flexBasis: "46%", flexGrow: 1, alignItems: "center", paddingHorizontal: 10, paddingTop: 12, paddingBottom: 14, gap: 2 },
  packIcon: { width: 60, height: 52, resizeMode: "contain", marginBottom: 4, opacity: 0.85 },
  packName: { fontSize: 15, fontWeight: "900", fontFamily: fonts.bold, color: colors.ink },
  packAmount: { fontFamily: fonts.light, letterSpacing: -0.36, fontSize: 12, color: colors.muted },
  packButton: { marginTop: 8, minWidth: 96 },
  packButtonText: { fontSize: 13 },
});
