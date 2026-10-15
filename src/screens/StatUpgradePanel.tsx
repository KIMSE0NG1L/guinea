import { Image, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { frameKit, kit, statIcons } from "../assets";
import { GameButton } from "../components/GameButton";
import { Panel } from "../components/NineSlice";
import { formatGameNumber, getStatLevel, getStatValue, getTotalAttack, getUpgradeQuote, getNextUpgradeMode, statInfo } from "../state/gameMath";
import type { GameState, StatKey, UpgradeMode } from "../types";


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
    <Panel slice={kit.panelLarge} style={[styles.panel, compact && styles.panelCompact]}>
      <View style={[styles.heading, compact && styles.headingCompact]}>
        <View>
          <Text style={styles.kicker}>POWER UP</Text>
          <Text style={styles.title}>기니 성장</Text>
        </View>
        <GameButton
          variant="green"
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
          const value = key === "attack" ? getTotalAttack(state) : getStatValue(state, key);
          const level = getStatLevel(state, key);
          const quote = getUpgradeQuote(key, level, state.gold, upgradeMode);
          const nextValue = value + info.step * quote.levels;
          const suffix = key === "attack" ? "" : "%";
          return (
            <Panel slice={upgraded === key ? kit.panel : kit.inset} scale={0.4} style={styles.row} key={key}>
              <Panel slice={frameKit.squareWood} scale={0.4} style={styles.mark}>
                <Image source={statIcons[key]} style={styles.markIcon} accessibilityLabel={info.label} />
              </Panel>
              <View style={styles.rowCopy}>
                <Text style={styles.rowSmall}>Lv. {level} · {info.label}</Text>
                <Text style={styles.rowValue}>{formatGameNumber(value)}{suffix}</Text>
              </View>
              <View style={styles.gain}>
                <Text style={styles.gainSmall}>다음</Text>
                <Text style={styles.gainValue}>{formatGameNumber(nextValue)}{suffix}</Text>
              </View>
              <GameButton
                variant="brown"
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
            </Panel>
          );
        })}
      </View>
    </Panel>
  );
}

const styles = StyleSheet.create({
  panel: {
    margin: 8,
    marginHorizontal: 10,
    paddingHorizontal: 13,
    paddingTop: 12,
    paddingBottom: 15,
  },
  panelCompact: {},
  heading: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 9 },
  headingCompact: { marginBottom: 7 },
  kicker: { color: colors.green, fontWeight: "800", fontFamily: fonts.bold, fontSize: 9, letterSpacing: 1.5 },
  title: { fontSize: 18, fontWeight: "800", fontFamily: fonts.bold, color: colors.ink },
  modeButton: { minWidth: 84, minHeight: 42, paddingHorizontal: 12 },
  modeButtonSmall: { color: "white", fontSize: 7, marginBottom: 2 },
  modeButtonLabel: { color: "white", fontWeight: "900", fontFamily: fonts.bold, fontSize: 11 },
  list: { gap: 6 },
  row: {
    minHeight: 49,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingVertical: 7,
    paddingLeft: 8,
    paddingRight: 8,
  },
  mark: { width: 40, height: 40, paddingBottom: 2, alignItems: "center", justifyContent: "center" },
  markIcon: { width: 28, height: 28 },
  rowCopy: { flex: 1 },
  rowSmall: { color: colors.brown, fontSize: 9 },
  rowValue: { fontSize: 16, fontWeight: "900", fontFamily: fonts.bold, color: colors.ink },
  gain: { minWidth: 42, alignItems: "flex-end" },
  gainSmall: { color: colors.muted, fontSize: 7, marginBottom: 2 },
  gainValue: { color: colors.green, fontWeight: "900", fontFamily: fonts.bold, fontSize: 10 },
  upgradeButton: { minWidth: 70, paddingHorizontal: 8 },
  upgradeButtonText: { color: "white", fontWeight: "900", fontFamily: fonts.bold, fontSize: 10, textAlign: "center" },
  upgradeButtonCost: { color: "#f3d993", fontSize: 7, marginTop: 1, textAlign: "center" },
});
