import { Image, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { uiImages, uiSlices } from "../assets";
import { NineSlice, SliceButton } from "../components/NineSlice";
import { StrokedText } from "../components/StrokedText";
import { formatGameNumber, getStatLevel, getStatValue, getUpgradeQuote, getNextUpgradeMode, statInfo } from "../state/gameMath";
import type { GameState, StatKey, UpgradeMode } from "../types";

const STAT_TILES: Record<StatKey, { image: number; stroke: string }> = {
  attack: { image: uiImages.tileRed, stroke: "#7a2418" },
  criticalDamage: { image: uiImages.tilePurple, stroke: "#45286e" },
  criticalChance: { image: uiImages.tileTeal, stroke: "#145a58" },
  goldBonus: { image: uiImages.tileGold, stroke: "#7a4c0c" },
};

export function StatUpgradePanel({
  state,
  upgradeMode,
  onUpgradeModeChange,
  onUpgrade,
  compact = false,
  upgraded,
}: {
  state: GameState;
  upgradeMode: UpgradeMode;
  onUpgradeModeChange: (mode: UpgradeMode) => void;
  onUpgrade: (key: StatKey) => void;
  compact?: boolean;
  upgraded: StatKey | null;
}) {
  const modeLabel =
    upgradeMode === "max" ? "구매 가능한 만큼" : upgradeMode === "next" ? "다음 10레벨 단위까지" : `${upgradeMode}레벨`;

  return (
    <NineSlice slice={uiSlices.panelParchment} scale={0.6} style={[styles.panel, compact && styles.panelCompact]}>
      <View style={[styles.heading, compact && styles.headingCompact]}>
        <View>
          <Text style={styles.kicker}>POWER UP</Text>
          <Text style={styles.title}>기니 성장</Text>
        </View>
        <SliceButton
          slice={uiSlices.buttonGreenFramed}
          scale={0.4}
          onPress={() => onUpgradeModeChange(getNextUpgradeMode(upgradeMode))}
          accessibilityLabel={`강화 단위 변경, 현재 ${modeLabel}`}
          style={styles.modeButton}
        >
          <Text style={styles.modeButtonSmall}>강화 단위</Text>
          <StrokedText style={styles.modeButtonLabel} strokeColor={colors.greenDark}>
            {upgradeMode === "max" ? "MAX" : upgradeMode === "next" ? "NEXT" : `${upgradeMode}레벨`}
          </StrokedText>
        </SliceButton>
      </View>

      <View style={styles.list}>
        {(Object.keys(statInfo) as StatKey[]).map((key) => {
          const info = statInfo[key];
          const value = getStatValue(state, key);
          const level = getStatLevel(state, key);
          const quote = getUpgradeQuote(key, level, state.gold, upgradeMode);
          const nextValue = value + info.step * quote.levels;
          const suffix = key === "attack" ? "" : "%";
          return (
            <NineSlice slice={uiSlices.rowParchment} scale={0.42} style={[styles.row, upgraded === key && styles.rowUpgraded]} key={key}>
              <View style={styles.mark}>
                <Image source={STAT_TILES[key].image} style={styles.markImage} />
                <StrokedText style={styles.markText} strokeColor={STAT_TILES[key].stroke}>{info.mark}</StrokedText>
              </View>
              <View style={styles.rowCopy}>
                <Text style={styles.rowSmall}>Lv. {level} · {info.label}</Text>
                <Text style={styles.rowValue}>{formatGameNumber(value)}{suffix}</Text>
              </View>
              <View style={styles.gain}>
                <Text style={styles.gainSmall}>다음</Text>
                <Text style={styles.gainValue}>{formatGameNumber(nextValue)}{suffix}</Text>
              </View>
              <SliceButton
                slice={uiSlices.buttonWood}
                scale={0.36}
                disabled={quote.levels === 0 || state.gold < quote.cost}
                onPress={() => onUpgrade(key)}
                style={styles.upgradeButton}
              >
                <View style={styles.upgradeButtonContent}>
                  <StrokedText style={styles.upgradeButtonText} strokeColor="#3b2414">
                    {upgradeMode === "max" ? `MAX +${quote.levels}` : `+${quote.levels} 강화`}
                  </StrokedText>
                  <View style={styles.costRow}>
                    <Image source={uiImages.coin} style={styles.costCoin} />
                    <Text style={styles.upgradeButtonCost}>{formatGameNumber(quote.cost)} G</Text>
                  </View>
                </View>
              </SliceButton>
            </NineSlice>
          );
        })}
      </View>
    </NineSlice>
  );
}

const styles = StyleSheet.create({
  panel: { margin: 8, marginHorizontal: 10, paddingHorizontal: 14, paddingTop: 14, paddingBottom: 16 },
  panelCompact: {},
  heading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 9, paddingLeft: 16 },
  headingCompact: { marginBottom: 7 },
  kicker: { color: colors.green, fontWeight: "800", fontFamily: fonts.bold, fontSize: 9, letterSpacing: 1.5 },
  title: { fontSize: 18, fontWeight: "800", fontFamily: fonts.bold, color: colors.ink },
  modeButton: { minWidth: 92, minHeight: 44 },
  modeButtonSmall: { color: "#e9f2d4", fontSize: 7, marginBottom: 1, fontFamily: fonts.bold },
  modeButtonLabel: { color: "white", fontWeight: "900", fontFamily: fonts.bold, fontSize: 12 },
  list: { gap: 6 },
  row: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingVertical: 6,
    paddingLeft: 9,
    paddingRight: 8,
  },
  rowUpgraded: { opacity: 0.8 },
  mark: { width: 40, height: 37, alignItems: "center", justifyContent: "center" },
  markImage: { position: "absolute", width: 40, height: 37 },
  markText: { color: "white", fontWeight: "900", fontFamily: fonts.bold, fontSize: 8 },
  rowCopy: { flex: 1 },
  rowSmall: { color: colors.brown, fontSize: 9 },
  rowValue: { fontSize: 16, fontWeight: "900", fontFamily: fonts.bold, color: colors.ink },
  gain: { minWidth: 42, alignItems: "flex-end" },
  gainSmall: { color: colors.muted, fontSize: 7, marginBottom: 2 },
  gainValue: { color: colors.green, fontWeight: "900", fontFamily: fonts.bold, fontSize: 10 },
  upgradeButton: { minWidth: 78, minHeight: 40 },
  upgradeButtonContent: { alignItems: "center", paddingHorizontal: 8, paddingVertical: 4 },
  upgradeButtonText: { color: "white", fontWeight: "900", fontFamily: fonts.bold, fontSize: 10, textAlign: "center" },
  costRow: { flexDirection: "row", alignItems: "center", gap: 2, marginTop: 1 },
  costCoin: { width: 10, height: 10 },
  upgradeButtonCost: { color: "#f3d993", fontSize: 8, fontFamily: fonts.bold },
});
