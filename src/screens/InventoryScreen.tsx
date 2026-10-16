import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { frameKit, icons, kit, uiImages } from "../assets";
import { IngredientCodex } from "../components/IngredientCodex";
import { ITEM_IMAGES } from "../state/recipes";
import { BAG_EXPAND_SLOTS, BAG_MAX_SLOTS, getBagCapacity, getBagExpandCost, slotsFor, STACK_SIZE } from "../state/bag";
import { Panel } from "../components/NineSlice";
import { PageHeading } from "../components/PageHeading";
import { GameButton } from "../components/GameButton";
import { ProgressBar } from "../components/ProgressBar";
import type { GameState } from "../types";

type InventoryItem = GameState["inventory"][number];

const COLUMNS = 4;

export function InventoryScreen({
  inventory,
  discoveredItems,
  gems,
  expansions,
  onExpand,
  onOpenShop,
}: {
  inventory: GameState["inventory"];
  discoveredItems: string[];
  gems: number;
  expansions: number;
  onExpand: () => boolean;
  onOpenShop: () => void;
}) {
  const capacity = getBagCapacity(expansions);
  const cost = getBagExpandCost(expansions);
  const maxed = capacity >= BAG_MAX_SLOTS;
  const affordable = gems >= cost;
  // One cell per stack: an item over 64 fills a cell with 64 and carries on in the next.
  const stacks: (InventoryItem & { key: string })[] = inventory.flatMap((item) =>
    Array.from({ length: slotsFor(item.quantity) }, (_, index) => ({
      ...item,
      quantity: Math.min(STACK_SIZE, item.quantity - index * STACK_SIZE),
      key: `${item.name}-${index}`,
    })),
  );
  const used = stacks.length;
  const full = used >= capacity;
  // Shows a few empty rows rather than every free slot, so a roomy bag doesn't mean a long scroll.
  const shown = Math.min(capacity, Math.max(12, Math.ceil((used + 1) / COLUMNS) * COLUMNS));
  const cells = [...stacks, ...Array.from({ length: Math.max(0, shown - used) }, () => null)];

  const [codex, setCodex] = useState(false);

  return (
    <View style={styles.page}>
      <View style={styles.headingRow}>
        <View style={styles.heading}>
          {codex ? (
            <PageHeading kicker="PANTRY" title="식재료 도감" description="한 번이라도 손에 넣은 식재료가 기록돼요." />
          ) : (
            <PageHeading kicker="BAG" title="가방" description="주운 건 일단 넣고 본다." />
          )}
        </View>
        {/* Bare icon: the green book opens the ingredient codex, the bag icon comes back. */}
        <Pressable
          onPress={() => setCodex((current) => !current)}
          accessibilityRole="button"
          accessibilityLabel={codex ? "가방으로 돌아가기" : "식재료 도감 열기"}
          hitSlop={6}
          style={({ pressed }) => [styles.toggle, pressed && styles.togglePressed]}
        >
          <Image source={codex ? icons.backpackTrim : icons.codexIngredient} style={styles.toggleIcon} resizeMode="contain" />
        </Pressable>
      </View>
      {codex ? (
        <IngredientCodex discovered={discoveredItems} />
      ) : (
      <>
      <Panel slice={kit.buttonBeige} style={styles.summary}>
        <View style={styles.capacity}>
          <View style={styles.capacityRow}>
            <Text style={styles.summarySpan}>가방 칸</Text>
            {full && <Text style={styles.fullText}>가득 찼어요!</Text>}
          </View>
          <ProgressBar
            progress={(used / capacity) * 100}
            fill={full ? "red" : "green"}
            height={16}
            label={`${used} / ${capacity}`}
          />
          <Text style={styles.summaryHint}>같은 아이템은 한 칸에 64개까지 쌓여요.</Text>
        </View>
        {maxed ? (
          <View style={styles.maxed}>
            <Text style={styles.maxedText}>최대 크기</Text>
          </View>
        ) : (
          <GameButton
            variant={affordable ? "green" : "gray"}
            onPress={affordable ? onExpand : onOpenShop}
            accessibilityLabel={`보석 ${cost}개로 가방 ${BAG_EXPAND_SLOTS}칸 늘리기`}
            style={styles.expand}
          >
            <View style={styles.expandContent}>
              <Text style={[styles.expandTitle, !affordable && styles.expandTitleDim]}>+{BAG_EXPAND_SLOTS}칸</Text>
              <View style={styles.expandCost}>
                <Image source={uiImages.crystal} style={styles.gem} />
                <Text style={[styles.expandCostText, !affordable && styles.expandTitleDim]}>{cost}</Text>
              </View>
            </View>
          </GameButton>
        )}
      </Panel>
      <View style={styles.grid}>
        {cells.map((item, index) => (
          <Panel slice={item ? frameKit.squareGold : frameKit.squareWood} scale={0.5} style={styles.cell} key={item?.key ?? `empty-${index}`}>
            {item && (
              <>
                <ItemShape name={item.name} />
                <Text style={styles.cellName} numberOfLines={1}>{item.name}</Text>
                <View style={styles.cellQty}>
                  <Text style={styles.cellQtyText}>x{item.quantity}</Text>
                </View>
              </>
            )}
          </Panel>
        ))}
      </View>
      {shown < capacity && <Text style={styles.moreSlots}>빈 칸 {capacity - shown}개 더 있어요</Text>}
      </>
      )}
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
  headingRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  heading: { flex: 1 },
  toggle: { marginTop: 4 },
  togglePressed: { transform: [{ scale: 0.92 }] },
  toggleIcon: { width: 46, height: 46 },
  page: { backgroundColor: "#e8dcc4", paddingHorizontal: 12, paddingTop: 18, paddingBottom: 25 },
  summary: {
    marginTop: -7,
    marginBottom: 11,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  capacity: { flex: 1, gap: 5 },
  capacityRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  summarySpan: { fontSize: 11, fontWeight: "800", fontFamily: fonts.bold, color: colors.ink },
  summaryHint: { fontSize: 9, fontFamily: fonts.bold, color: colors.muted },
  fullText: { fontSize: 10, fontWeight: "900", fontFamily: fonts.bold, color: colors.red },
  expand: { minHeight: 52, paddingHorizontal: 10 },
  expandContent: { alignItems: "center" },
  expandTitle: { fontSize: 13, fontWeight: "900", fontFamily: fonts.bold, color: colors.cream },
  expandTitleDim: { color: "#4f463c" },
  expandCost: { flexDirection: "row", alignItems: "center", gap: 2, marginTop: 1 },
  expandCostText: { fontSize: 11, fontWeight: "900", fontFamily: fonts.bold, color: colors.cream },
  gem: { width: 13, height: 13 },
  maxed: { paddingHorizontal: 10, justifyContent: "center" },
  maxedText: { fontSize: 11, fontWeight: "900", fontFamily: fonts.bold, color: colors.muted },
  moreSlots: { marginTop: 10, textAlign: "center", fontSize: 10, fontFamily: fonts.bold, color: colors.muted },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  cell: {
    width: "23%",
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
