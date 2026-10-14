import { Image, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { kit } from "../assets";
import { ITEM_IMAGES } from "../state/recipes";
import { Panel } from "../components/NineSlice";
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
      <Panel slice={kit.buttonBeige} style={styles.summary}>
        <Text style={styles.summarySpan}>보유 아이템</Text>
        <Text style={styles.summaryStrong}>{inventory.length} / 24</Text>
      </Panel>
      <View style={styles.grid}>
        {cells.map((item, index) => (
          <Panel slice={item ? kit.panelSmall : kit.slot} scale={0.45} style={styles.cell} key={item?.name ?? `empty-${index}`}>
            {item && (
              <>
                <ItemShape name={item.name} />
                <Text style={styles.cellName}>{item.name}</Text>
                <View style={styles.cellQty}>
                  <Text style={styles.cellQtyText}>x{item.quantity}</Text>
                </View>
              </>
            )}
          </Panel>
        ))}
      </View>
    </View>
  );
}

// Food and dishes have art; materials without any fall back to a plain stone shape.
function ItemShape({ name }: { name: string }) {
  const image = ITEM_IMAGES[name];
  if (image === undefined) {
    return <View style={styles.shapeMaterial} />;
  }
  return <Image source={image} style={styles.foodImage} />;
}

const styles = StyleSheet.create({
  page: { backgroundColor: "#e8dcc4", paddingHorizontal: 12, paddingTop: 18, paddingBottom: 25 },
  summary: {
    marginTop: -7,
    marginBottom: 11,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summarySpan: { fontSize: 11, color: colors.ink },
  summaryStrong: { fontSize: 11, fontWeight: "800", fontFamily: fonts.bold, color: colors.ink },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  cell: {
    width: "31%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 3,
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
  foodImage: { width: 44, height: 44 },
  shapeMaterial: { width: 39, height: 30, backgroundColor: "#9b9587", borderWidth: 3, borderColor: colors.line, borderRadius: 16 },
});
