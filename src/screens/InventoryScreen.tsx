import { StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { PageHeading } from "../components/PageHeading";
import type { GameState } from "../types";

type InventoryItem = GameState["inventory"][number];

export function InventoryScreen({ inventory }: { inventory: GameState["inventory"] }) {
  const cells: (InventoryItem | null)[] = [
    ...inventory,
    ...Array.from({ length: Math.max(0, 9 - inventory.length) }, () => null),
  ];

  return (
    <View style={styles.page}>
      <PageHeading kicker="BAG" title="가방" description="주운 건 일단 넣고 본다." />
      <View style={styles.summary}>
        <Text style={styles.summarySpan}>보유 아이템</Text>
        <Text style={styles.summaryStrong}>{inventory.length} / 24</Text>
      </View>
      <View style={styles.grid}>
        {cells.map((item, index) => (
          <View style={[styles.cell, item && styles.cellFilled]} key={item?.name ?? `empty-${index}`}>
            {item && (
              <>
                <ItemShape type={item.type} />
                <Text style={styles.cellName}>{item.name}</Text>
                <View style={styles.cellQty}>
                  <Text style={styles.cellQtyText}>x{item.quantity}</Text>
                </View>
              </>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

function ItemShape({ type }: { type: string }) {
  if (type === "material") {
    return <View style={styles.shapeMaterial} />;
  }
  return (
    <View style={styles.shapeFoodWrap}>
      <View style={styles.shapeFoodLeaf} />
      <View style={styles.shapeFood} />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: "#e8dcc4", paddingHorizontal: 12, paddingTop: 18, paddingBottom: 25 },
  summary: {
    marginTop: -7,
    marginBottom: 11,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#d6c8aa",
    borderWidth: 2,
    borderColor: colors.line,
    borderRadius: 10,
  },
  summarySpan: { fontSize: 11, color: colors.ink },
  summaryStrong: { fontSize: 11, fontWeight: "800", fontFamily: fonts.bold, color: colors.ink },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  cell: {
    width: "31%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ded3bd",
    borderWidth: 2,
    borderColor: "#aa9b82",
    borderStyle: "dashed",
    borderRadius: 11,
  },
  cellFilled: {
    backgroundColor: colors.cream,
    borderWidth: 3,
    borderColor: colors.line,
    borderStyle: "solid",
  },
  cellName: { marginTop: 5, fontSize: 9, fontWeight: "800", fontFamily: fonts.bold, color: colors.ink },
  cellQty: {
    position: "absolute",
    right: 5,
    bottom: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    backgroundColor: colors.line,
    borderRadius: 5,
  },
  cellQtyText: { color: "white", fontSize: 8, fontWeight: "800", fontFamily: fonts.bold },
  shapeFoodWrap: { width: 25, height: 42, alignItems: "center", transform: [{ rotate: "20deg" }] },
  shapeFoodLeaf: {
    width: 18,
    height: 13,
    marginBottom: -8,
    backgroundColor: colors.green,
    borderWidth: 2,
    borderColor: colors.line,
    borderRadius: 7,
    zIndex: 1,
  },
  shapeFood: { width: 25, height: 42, backgroundColor: "#dc7441", borderWidth: 3, borderColor: colors.line, borderRadius: 14 },
  shapeMaterial: { width: 39, height: 30, backgroundColor: "#9b9587", borderWidth: 3, borderColor: colors.line, borderRadius: 16 },
});
