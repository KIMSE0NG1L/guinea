import { StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { frameKit, kit } from "../assets";
import { Panel } from "../components/NineSlice";
import { PageHeading } from "../components/PageHeading";
import { GameButton } from "../components/GameButton";
import type { GameState } from "../types";

const slots: { key: string; label: string; symbol: string }[] = [
  { key: "weapon", label: "무기", symbol: "/" },
  { key: "hat", label: "모자", symbol: "^" },
  { key: "armor", label: "갑옷", symbol: "#" },
  { key: "accessory", label: "장신구", symbol: "*" },
];

export function EquipmentScreen({ equipment }: { equipment: GameState["equipment"] }) {
  return (
    <View style={styles.page}>
      <PageHeading kicker="GEAR" title="장비" description="낡았어도 안 입는 것보단 낫다." />
      <View style={styles.grid}>
        {slots.map((slot) => (
          <Panel slice={kit.panel} style={styles.card} key={slot.key}>
            <Panel slice={frameKit.squareWood} scale={0.6} style={styles.slotSymbol}>
              <Text style={styles.slotSymbolText}>{slot.symbol}</Text>
            </Panel>
            <View style={styles.cardCopy}>
              <Text style={styles.cardSmall}>{slot.label}</Text>
              <Text style={styles.cardStrong}>{equipment[slot.key] ?? "비어 있음"}</Text>
            </View>
            <GameButton variant="beige" style={styles.equipButton} textStyle={styles.equipButtonText}>장착</GameButton>
          </Panel>
        ))}
      </View>
      <Panel slice={kit.buttonBeige} style={styles.notice}>
        <Text style={styles.noticeStrong}>장비 도감</Text>
        <Text style={styles.noticeSpan}>수집한 장비 0 / 24</Text>
      </Panel>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: "#e8dcc4", paddingHorizontal: 12, paddingTop: 18, paddingBottom: 25 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  card: {
    width: "48%",
    minHeight: 152,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 14,
    alignItems: "center",
  },
  slotSymbol: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
  },
  slotSymbolText: { color: "#a69a84", fontSize: 26, fontWeight: "900", fontFamily: fonts.bold },
  cardCopy: { marginVertical: 7, alignItems: "center" },
  cardSmall: { color: colors.brown, fontSize: 9 },
  cardStrong: { fontSize: 12, fontWeight: "800", fontFamily: fonts.bold, color: colors.ink },
  equipButton: { width: "100%", marginTop: "auto" },
  equipButtonText: { fontSize: 10 },
  notice: {
    marginTop: 12,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  noticeStrong: { fontSize: 11, fontWeight: "800", fontFamily: fonts.bold, color: colors.ink },
  noticeSpan: { fontSize: 11, color: colors.ink },
});
