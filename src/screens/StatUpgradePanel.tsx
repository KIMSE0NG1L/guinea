import { StyleSheet, Text, View } from "react-native";
import { colors, radii, fonts } from "../theme";
import { GameButton } from "../components/GameButton";
import { formatGameNumber, getStatLevel, getStatValue, getUpgradeQuote, getNextUpgradeMode, statInfo } from "../state/gameMath";
import type { GameState, StatKey, UpgradeMode } from "../types";

const STAT_COLORS: Record<StatKey, string> = {
  attack: colors.red,
  criticalDamage: "#b26050",
  criticalChance: "#a44d3f",
  goldBonus: "#c69137",
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
    <View style={[styles.panel, compact && styles.panelCompact]}>
      <View style={[styles.heading, compact && styles.headingCompact]}>
        <View>
          <Text style={styles.kicker}>POWER UP</Text>
          <Text style={styles.title}>기니 성장</Text>
        </View>
        <GameButton
          onPress={() => onUpgradeModeChange(getNextUpgradeMode(upgradeMode))}
          accessibilityLabel={`강화 단위 변경, 현재 ${modeLabel}`}
          style={styles.modeButton}
        >
          <Text style={styles.modeButtonSmall}>강화 단위</Text>
          <Text style={styles.modeButtonLabel}>
            {upgradeMode === "max" ? "MAX" : upgradeMode === "next" ? "NEXT" : `${upgradeMode}레벨`}
          </Text>
        </GameButton>
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
            <View style={[styles.row, upgraded === key && styles.rowUpgraded]} key={key}>
              <View style={[styles.mark, { backgroundColor: STAT_COLORS[key] }]}>
                <Text style={styles.markText}>{info.mark}</Text>
              </View>
              <View style={styles.rowCopy}>
                <Text style={styles.rowSmall}>Lv. {level} · {info.label}</Text>
                <Text style={styles.rowValue}>{formatGameNumber(value)}{suffix}</Text>
              </View>
              <View style={styles.gain}>
                <Text style={styles.gainSmall}>다음</Text>
                <Text style={styles.gainValue}>{formatGameNumber(nextValue)}{suffix}</Text>
              </View>
              <GameButton
                disabled={quote.levels === 0 || state.gold < quote.cost}
                onPress={() => onUpgrade(key)}
                style={styles.upgradeButton}
              >
                <View>
                  <Text style={styles.upgradeButtonText}>
                    {upgradeMode === "max" ? `MAX +${quote.levels}` : `+${quote.levels} 강화`}
                  </Text>
                  <Text style={styles.upgradeButtonCost}>{formatGameNumber(quote.cost)} G</Text>
                </View>
              </GameButton>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    margin: 8,
    marginHorizontal: 10,
    padding: 11,
    backgroundColor: colors.cream,
    borderWidth: 2,
    borderColor: colors.line,
    borderRadius: 13,
  },
  panelCompact: {},
  heading: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 9 },
  headingCompact: { marginBottom: 7 },
  kicker: { color: colors.green, fontWeight: "800", fontFamily: fonts.bold, fontSize: 9, letterSpacing: 1.5 },
  title: { fontSize: 18, fontWeight: "800", fontFamily: fonts.bold, color: colors.ink },
  modeButton: { minWidth: 82, minHeight: 40, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: colors.green },
  modeButtonSmall: { color: "white", fontSize: 7, marginBottom: 2 },
  modeButtonLabel: { color: "white", fontWeight: "900", fontFamily: fonts.bold, fontSize: 11 },
  list: { gap: 6 },
  row: {
    minHeight: 49,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    padding: 5,
    backgroundColor: "#eee4cf",
    borderWidth: 2,
    borderColor: "#beaf95",
    borderRadius: 9,
  },
  rowUpgraded: { backgroundColor: "#dbe5ba" },
  mark: { width: 34, height: 34, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: colors.line, borderRadius: 8 },
  markText: { color: "white", fontWeight: "900", fontFamily: fonts.bold, fontSize: 7 },
  rowCopy: { flex: 1 },
  rowSmall: { color: colors.brown, fontSize: 9 },
  rowValue: { fontSize: 16, fontWeight: "900", fontFamily: fonts.bold, color: colors.ink },
  gain: { minWidth: 42, alignItems: "flex-end" },
  gainSmall: { color: colors.muted, fontSize: 7, marginBottom: 2 },
  gainValue: { color: colors.green, fontWeight: "900", fontFamily: fonts.bold, fontSize: 10 },
  upgradeButton: { paddingHorizontal: 7, paddingVertical: 5, backgroundColor: colors.brown },
  upgradeButtonText: { color: "white", fontWeight: "900", fontFamily: fonts.bold, fontSize: 10, textAlign: "center" },
  upgradeButtonCost: { color: "#f3d993", fontSize: 7, marginTop: 1, textAlign: "center" },
});
