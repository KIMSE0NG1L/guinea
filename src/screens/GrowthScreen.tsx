import { StyleSheet, View } from "react-native";
import { PageHeading } from "../components/PageHeading";
import { StatUpgradePanel } from "./StatUpgradePanel";
import type { UseGameState } from "../state/useGameState";

export function GrowthScreen({ game }: { game: UseGameState }) {
  const { state, upgradeMode, setUpgradeMode, upgradeStat, upgraded } = game;
  return (
    <View style={styles.page}>
      <PageHeading kicker="POWER UP" title="성장 연구소" description="먹고 자고 강화하면 언젠가 세진다." />
      <StatUpgradePanel
        state={state}
        upgradeMode={upgradeMode}
        onUpgradeModeChange={setUpgradeMode}
        onUpgrade={upgradeStat}
        upgraded={upgraded}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: "#e8dcc4", paddingHorizontal: 12, paddingTop: 18, paddingBottom: 25 },
});
