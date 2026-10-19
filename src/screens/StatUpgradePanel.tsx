import { useRef, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { colors, fonts } from "../theme";
import { frameKit, kit, statIcons } from "../assets";
import { GameButton } from "../components/GameButton";
import { Panel } from "../components/NineSlice";
import { FloatText, useFlash, useHoldRepeat, useShake } from "../components/motion";
import { applyUpgradeLevels, formatGameNumber, getStatLevel, getStatValue, getTotalAttack, getUpgradeQuote, getNextUpgradeMode, statInfo, STAT_CAP } from "../state/gameMath";
import { CoinPrice } from "../components/CoinPrice";
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
        {(Object.keys(statInfo) as StatKey[]).map((key) => (
          <StatRow key={key} statKey={key} state={state} upgradeMode={upgradeMode} highlighted={upgraded === key} onUpgrade={onUpgrade} />
        ))}
      </View>
    </Panel>
  );
}

// One stat: its value, what the next purchase brings, and the buy button. Buying floats
// the gain over the value and flashes the icon; holding the button keeps buying; pressing
// it without enough gold rattles the row and blinks the price red.
function StatRow({
  statKey: key,
  state,
  upgradeMode,
  highlighted,
  onUpgrade,
}: {
  statKey: StatKey;
  state: GameState;
  upgradeMode: UpgradeMode;
  highlighted: boolean;
  onUpgrade: (key: StatKey) => void;
}) {
  const info = statInfo[key];
  const value = key === "attack" ? getTotalAttack(state) : getStatValue(state, key);
  const level = getStatLevel(state, key);
  const quote = getUpgradeQuote(key, level, state.gold, upgradeMode, getStatValue(state, key));
  const rawValue = getStatValue(state, key);
  // For attack, `value` above is the total (raw purchased attack + flat level
  // bonus) — only the raw purchased part actually compounds on upgrade, so apply
  // the delta on top of `value` rather than upgrading the total directly.
  const nextValue = value + (applyUpgradeLevels(key, rawValue, quote.levels) - rawValue);
  const suffix = key === "attack" ? "" : "%";
  const atCap = STAT_CAP[key] !== undefined && getStatValue(state, key) >= STAT_CAP[key]!;
  const affordable = quote.levels > 0 && state.gold >= quote.cost;
  const short = !atCap && !affordable;

  const [gains, setGains] = useState<{ id: number; text: string }[]>([]);
  const gainId = useRef(0);
  const { style: shakeStyle, shake } = useShake();
  const { value: flash, flash: flashIcon } = useFlash();
  const flashStyle = useAnimatedStyle(() => ({ opacity: flash.value * 0.8, transform: [{ scale: 1 + flash.value * 0.3 }] }));

  // Kept fresh every render so a held button always buys at the current quote.
  const latest = { affordable, gain: nextValue - value };
  const buy = () => {
    if (!latest.affordable) {
      shake();
      return;
    }
    onUpgrade(key);
    flashIcon();
    const id = ++gainId.current;
    setGains((current) => [...current.slice(-3), { id, text: `+${formatGameNumber(latest.gain)}${suffix}` }]);
    setTimeout(() => setGains((current) => current.filter((gain) => gain.id !== id)), 800);
  };
  // Holding only keeps buying while it can — running dry just stops, no rattling.
  const hold = useHoldRepeat(() => {
    if (latest.affordable) buy();
  });

  return (
    <Animated.View style={shakeStyle}>
      <Panel slice={highlighted ? kit.panel : kit.inset} scale={0.4} style={styles.row}>
        <Panel slice={frameKit.squareWood} scale={0.4} style={styles.mark}>
          <Image source={statIcons[key]} style={styles.markIcon} accessibilityLabel={info.label} />
          <Animated.View style={[styles.markFlash, flashStyle]} pointerEvents="none" />
        </Panel>
        <View style={styles.rowCopy}>
          <Text style={styles.rowSmall}>Lv. {formatGameNumber(level)} · {info.label}</Text>
          <Text style={styles.rowValue}>{formatGameNumber(value)}{suffix}</Text>
          {gains.map((gain) => (
            <FloatText key={gain.id} text={gain.text} style={styles.gainFloat} />
          ))}
        </View>
        <View style={styles.gain}>
          <Text style={styles.gainSmall}>다음</Text>
          <Text style={styles.gainValue}>{formatGameNumber(nextValue)}{suffix}</Text>
        </View>
        {/* Short of gold looks just like a maxed-out stat: the same faded button (it stays
            pressable so a tap still gives the "can't afford" shake). */}
        <GameButton
          variant="brown"
          disabled={atCap || quote.levels === 0}
          onPress={buy}
          onPressIn={hold.onPressIn}
          onPressOut={hold.onPressOut}
          style={[styles.upgradeButton, short && styles.upgradeButtonShort]}
        >
          <View>
            <Text style={styles.upgradeButtonText}>
              {atCap ? "최대" : upgradeMode === "max" ? `MAX +${quote.levels}` : `+${quote.levels} 강화`}
            </Text>
            {!atCap && (
              <CoinPrice
                amount={quote.cost}
                textStyle={styles.upgradeButtonCost}
                style={styles.upgradeButtonCostRow}
              />
            )}
          </View>
        </GameButton>
      </Panel>
    </Animated.View>
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
  upgradeButtonText: { color: colors.ink, fontWeight: "900", fontFamily: fonts.bold, fontSize: 10, textAlign: "center" },
  upgradeButtonCost: { color: colors.brown, fontSize: 8, textAlign: "center" },
  upgradeButtonCostRow: { marginTop: 1, gap: 2 },
  // Matches GameButton's own disabled fade, which a maxed-out stat gets.
  upgradeButtonShort: { opacity: 0.55 },
  markFlash: { position: "absolute", top: 4, left: 4, right: 4, bottom: 4, borderRadius: 6, backgroundColor: "#fff3b0" },
  gainFloat: { left: 0, top: 4, fontSize: 13, fontFamily: fonts.bold, color: colors.green },
});
