import { useEffect, useRef, useState } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { Text } from "../components/GameText";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { colors, fonts } from "../theme";
import { frameKit, icons, kit, uiImages } from "../assets";
import { IngredientCodex } from "../components/IngredientCodex";
import { ITEM_IMAGES } from "../state/recipes";
import { BAG_EXPAND_SLOTS, BAG_MAX_SLOTS, getBagCapacity, getBagExpandCost, slotsFor, STACK_SIZE } from "../state/bag";
import { Panel } from "../components/NineSlice";
import { PageHeading } from "../components/PageHeading";
import { GameButton } from "../components/GameButton";
import { ProgressBar } from "../components/ProgressBar";
import { IconCaption } from "../components/IconCaption";
import { tutorialRef } from "../components/tutorialTargets";
import { SellIngredientModal } from "../components/SellIngredientModal";
import type { GameState } from "../types";
import { t } from "../i18n";

type InventoryItem = GameState["inventory"][number];

const COLUMNS = 4;

export function InventoryScreen({
  inventory,
  discoveredItems,
  droppedItems,
  priceStage,
  gems,
  expansions,
  onExpand,
  onOpenShop,
  bagSeen,
  codexSeen,
  onSeen,
  canSell,
  onSell,
}: {
  inventory: GameState["inventory"];
  discoveredItems: string[];
  droppedItems: string[] | undefined;
  // The stage grocery and sell prices are set by (see getGroceryPrice).
  priceStage: number;
  gems: number;
  expansions: number;
  onExpand: () => boolean;
  onOpenShop: () => void;
  // What was in the bag / codex at the last visit (undefined = never tracked yet).
  bagSeen: string[] | undefined;
  codexSeen: string[] | undefined;
  // Called on leaving with what's there now, so the next visit marks only newer things.
  onSeen: (seen: { bag: string[]; codex: string[] }) => void;
  // Ingredients can be tapped to sell once the tutorials that cook with them are done.
  canSell: boolean;
  onSell: (name: string, quantity: number) => void;
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
  const [selling, setSelling] = useState<string | null>(null);
  const sellingItem = selling ? inventory.find((item) => item.name === selling && item.type === "food") : undefined;

  // Fixed for the whole visit: what's new since last time, and the bag size on arrival.
  const bagNames = inventory.map((item) => item.name);
  const [newInBag] = useState(() => (bagSeen ? bagNames.filter((name) => !bagSeen.includes(name)) : []));
  const [newInCodex] = useState(() => (codexSeen ? discoveredItems.filter((name) => !codexSeen.includes(name)) : []));
  const [expansionsOnArrival] = useState(expansions);
  const latest = useRef({ bag: bagNames, codex: discoveredItems, onSeen });
  useEffect(() => {
    latest.current = { bag: bagNames, codex: discoveredItems, onSeen };
  });
  useEffect(() => () => latest.current.onSeen({ bag: latest.current.bag, codex: latest.current.codex }), []);

  return (
    <View style={styles.page}>
      <View style={styles.headingRow}>
        <View style={styles.heading}>
          {codex ? (
            <PageHeading kicker="PANTRY" title={t("식재료 도감", "Ingredient Codex")} description={t("한 번이라도 손에 넣은 식재료가 기록돼요.", "Every ingredient you've ever held gets recorded here.")} />
          ) : (
            <PageHeading kicker="BAG" title={t("가방", "Bag")} description={t("주운 건 일단 넣고 본다.", "Grab it first, sort it out later.")} />
          )}
        </View>
        {/* Bare icon: the green book opens the ingredient codex, the bag icon comes back. */}
        <Pressable
          onPress={() => setCodex((current) => !current)}
          accessibilityRole="button"
          accessibilityLabel={codex ? t("가방으로 돌아가기", "Back to Bag") : t("식재료 도감 열기", "Open Ingredient Codex")}
          hitSlop={6}
          style={({ pressed }) => [styles.toggle, pressed && styles.togglePressed]}
        >
          <Image source={codex ? icons.backpackTrim : icons.codexIngredient} style={styles.toggleIcon} resizeMode="contain" />
          <IconCaption>{codex ? t("가방", "Bag") : t("식재료 도감", "Ingredient Codex")}</IconCaption>
        </Pressable>
      </View>
      {codex ? (
        <IngredientCodex discovered={discoveredItems} dropped={droppedItems} priceStage={priceStage} fresh={newInCodex} />
      ) : (
      <>
      <Panel slice={kit.buttonBeige} style={styles.summary}>
        <View style={styles.capacity}>
          <View style={styles.capacityRow}>
            <Text style={styles.summarySpan}>{t("가방 칸", "Bag Slots")}</Text>
            {full && <Text style={styles.fullText}>{t("가득 찼어요!", "Full!")}</Text>}
          </View>
          <ProgressBar
            progress={(used / capacity) * 100}
            fill={full ? "red" : "green"}
            height={16}
            label={`${used} / ${capacity}`}
          />
          <Text style={styles.summaryHint}>
            {canSell
              ? t("같은 아이템은 64개씩 쌓여요. 재료를 누르면 팔 수 있어요.", "Items stack in 64s. Tap an ingredient to sell it.")
              : t("같은 아이템은 한 칸에 64개까지 쌓여요.", "Items stack up to 64 per slot.")}
          </Text>
        </View>
        {maxed ? (
          <View style={styles.maxed}>
            <Text style={styles.maxedText}>{t("최대 크기", "Max Size")}</Text>
          </View>
        ) : (
          <GameButton
            variant={affordable ? "green" : "gray"}
            onPress={affordable ? onExpand : onOpenShop}
            accessibilityLabel={t(`보석 ${cost}개로 가방 ${BAG_EXPAND_SLOTS}칸 늘리기`, `Spend ${cost} gems to add ${BAG_EXPAND_SLOTS} bag slots`)}
            style={styles.expand}
          >
            <View style={styles.expandContent}>
              <Text style={[styles.expandTitle, !affordable && styles.expandTitleDim]}>{t(`+${BAG_EXPAND_SLOTS}칸`, `+${BAG_EXPAND_SLOTS}`)}</Text>
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
          // Empty cells remount after an expansion so the new room pops in, one by one.
          <PopIn
            key={item?.key ?? `empty-${index}-${expansions}`}
            delay={!item && expansions > expansionsOnArrival ? (index - used) * 45 : -1}
            style={styles.cellWrap}
          >
            <Pressable
              disabled={!item || !canSell || item.type !== "food"}
              onPress={() => item && setSelling(item.name)}
              accessibilityRole={item && canSell && item.type === "food" ? "button" : undefined}
              accessibilityLabel={item && canSell && item.type === "food" ? t(`${item.name} 팔기`, `Sell ${t(item.name)}`) : undefined}
              style={({ pressed }) => pressed && styles.cellPressed}
            >
            <Panel slice={item ? frameKit.squareGold : frameKit.squareWood} scale={0.5} style={styles.cell}>
              {item && (
                <>
                  {/* The first stack of each item can be pointed at by the tutorial. */}
                  {item.key.endsWith("-0") && <View ref={tutorialRef(`bag-item-${item.name}`)} style={styles.tutorialAnchor} pointerEvents="none" />}
                  <ItemShape name={item.name} />
                  <Text style={styles.cellName} numberOfLines={1}>{t(item.name)}</Text>
                  <View style={styles.cellQty}>
                    <Text style={styles.cellQtyText}>x{item.quantity}</Text>
                  </View>
                  {newInBag.includes(item.name) && <NewBadge />}
                </>
              )}
            </Panel>
            </Pressable>
          </PopIn>
        ))}
      </View>
      {shown < capacity && <Text style={styles.moreSlots}>{t(`빈 칸 ${capacity - shown}개 더 있어요`, `${capacity - shown} more empty slots`)}</Text>}
      {sellingItem && (
        <SellIngredientModal
          name={sellingItem.name}
          owned={sellingItem.quantity}
          priceStage={priceStage}
          onSell={(quantity) => onSell(sellingItem.name, quantity)}
          onClose={() => setSelling(null)}
        />
      )}
      </>
      )}
    </View>
  );
}

// Pops in after `delay` ms; a negative delay means it just appears (no animation).
function PopIn({ delay, style, children }: { delay: number; style: object; children: React.ReactNode }) {
  const t = useSharedValue(delay < 0 ? 1 : 0);
  useEffect(() => {
    if (delay >= 0) t.value = withDelay(delay, withTiming(1, { duration: 260, easing: Easing.out(Easing.back(2)) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const animated = useAnimatedStyle(() => ({ opacity: Math.min(1, t.value * 2), transform: [{ scale: t.value }] }));
  return <Animated.View style={[style, animated]}>{children}</Animated.View>;
}

// "NEW" on a cell holding something that wasn't in the bag last visit, with a twinkle.
function NewBadge() {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(withSequence(withTiming(1, { duration: 500 }), withTiming(0, { duration: 500 })), -1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: 1 + t.value * 0.12 }] }));
  const starStyle = useAnimatedStyle(() => ({ opacity: t.value, transform: [{ rotate: `${t.value * 90}deg` }, { scale: 0.6 + t.value * 0.6 }] }));
  return (
    <>
      <Animated.Image source={icons.star} style={[styles.newStar, starStyle]} />
      <Animated.View style={[styles.newBadge, style]}>
        <Text style={styles.newText}>NEW</Text>
      </Animated.View>
    </>
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
  tutorialAnchor: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  newBadge: { position: "absolute", top: 3, left: 3, paddingHorizontal: 4, borderRadius: 5, backgroundColor: colors.red },
  newText: { fontSize: 7, fontWeight: "900", fontFamily: fonts.bold, color: colors.cream },
  newStar: { position: "absolute", top: 2, right: 4, width: 12, height: 12 },
  headingRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  heading: { flex: 1 },
  toggle: { marginTop: 4 },
  togglePressed: { transform: [{ scale: 0.92 }] },
  toggleIcon: { width: 46, height: 46 },
  page: { backgroundColor: "#e8dcc4", paddingHorizontal: 16, paddingTop: 20, paddingBottom: 25 },
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
  summarySpan: { fontSize: 12, fontWeight: "800", fontFamily: fonts.bold, color: colors.ink },
  summaryHint: { fontSize: 12, fontFamily: fonts.bold, color: colors.muted },
  fullText: { fontSize: 12, fontWeight: "900", fontFamily: fonts.bold, color: colors.red },
  expand: { minHeight: 52, paddingHorizontal: 10 },
  expandContent: { alignItems: "center" },
  expandTitle: { fontSize: 15, fontWeight: "900", fontFamily: fonts.bold, color: colors.cream },
  expandTitleDim: { color: "#4f463c" },
  expandCost: { flexDirection: "row", alignItems: "center", gap: 2, marginTop: 1 },
  expandCostText: { fontSize: 12, fontWeight: "900", fontFamily: fonts.bold, color: colors.cream },
  gem: { width: 13, height: 13, resizeMode: "contain" },
  maxed: { paddingHorizontal: 10, justifyContent: "center" },
  maxedText: { fontSize: 12, fontWeight: "900", fontFamily: fonts.bold, color: colors.muted },
  moreSlots: { marginTop: 10, textAlign: "center", fontSize: 12, fontFamily: fonts.bold, color: colors.muted },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  cellWrap: { width: "23%" },
  cellPressed: { transform: [{ scale: 0.94 }] },
  cell: {
    width: "100%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 3,
  },
  cellName: { marginTop: 5, fontSize: 12, fontWeight: "800", fontFamily: fonts.bold, color: colors.ink },
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
