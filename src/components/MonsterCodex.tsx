import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { kit } from "../assets";
import { Panel } from "./NineSlice";
import { EnemySprite } from "./EnemySprite";
import { MonsterStoryModal } from "./MonsterStoryModal";
import { getDropTable } from "../state/drops";
import { ITEM_IMAGES } from "../state/recipes";
import { BOSS_NAME, ENEMY_NAME, getStageCode, STAGES } from "../state/stages";
import type { EnemyKind } from "../types";

// Every stage's mob and boss. A mob is discovered once its stage is reached, a boss once
// it's been beaten; undiscovered ones show as a dark silhouette with "???".
export function MonsterCodex({ highestStageNumber }: { highestStageNumber: number }) {
  const entries = STAGES.flatMap((stage, index) => [
    { key: `${stage.enemyKind}-mob`, kind: stage.enemyKind, boss: false, index, area: stage.area, found: index <= highestStageNumber },
    { key: `${stage.enemyKind}-boss`, kind: stage.enemyKind, boss: true, index, area: stage.area, found: index < highestStageNumber },
  ]);
  const found = entries.filter((entry) => entry.found).length;
  const [open, setOpen] = useState<(typeof entries)[number] | null>(null);

  return (
    <View>
      <Text style={styles.count}>
        발견한 몬스터 {found} / {entries.length}
      </Text>
      <View style={styles.grid}>
        {entries.map((entry) => (
          <CodexCard
            key={entry.key}
            kind={entry.kind}
            boss={entry.boss}
            index={entry.index}
            area={entry.area}
            found={entry.found}
            onPress={() => setOpen(entry)}
          />
        ))}
      </View>
      {open && (
        <MonsterStoryModal kind={open.kind} boss={open.boss} stageIndex={open.index} area={open.area} onClose={() => setOpen(null)} />
      )}
    </View>
  );
}

function CodexCard({
  kind,
  boss,
  index,
  area,
  found,
  onPress,
}: {
  kind: EnemyKind;
  boss: boolean;
  index: number;
  area: string;
  found: boolean;
  onPress: () => void;
}) {
  return (
    // Only discovered monsters open their story; the rest stay a mystery.
    <Pressable
      onPress={onPress}
      disabled={!found}
      accessibilityRole="button"
      accessibilityLabel={found ? `${boss ? BOSS_NAME[kind] : ENEMY_NAME[kind]} 이야기 보기` : "아직 만나지 못한 몬스터"}
      style={({ pressed }) => [styles.cardWrap, pressed && styles.pressed]}
    >
      <Panel slice={found ? kit.panel : kit.inset} scale={0.4} style={styles.card}>
        <View style={[styles.tag, boss ? styles.tagBoss : styles.tagMob]}>
          <Text style={styles.tagText}>{boss ? "보스" : "일반"}</Text>
        </View>
        <Text style={styles.stage}>{getStageCode(index)}</Text>
        <View style={styles.portrait}>
          <EnemySprite
            boss={boss}
            kind={kind}
            animation="idle"
            size={boss ? 84 : 72}
            restartKey={`${kind}-${boss}`}
            tintColor={found ? undefined : "#3d3128"}
          />
        </View>
        <Text style={styles.name} numberOfLines={1}>
          {found ? (boss ? BOSS_NAME[kind] : ENEMY_NAME[kind]) : "???"}
        </Text>
        <Text style={styles.area} numberOfLines={1}>{found ? area : "아직 만나지 못했어요"}</Text>
        {found && (
          <View style={styles.drops}>
            {getDropTable(kind, boss).map((drop) => (
              <View key={drop.name} style={styles.drop}>
                <Image source={ITEM_IMAGES[drop.name]} style={styles.dropIcon} accessibilityLabel={drop.name} />
                <Text style={styles.dropChance}>{Math.round(drop.chance * 100)}%</Text>
              </View>
            ))}
          </View>
        )}
      </Panel>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  count: { marginBottom: 8, marginLeft: 4, fontSize: 11, fontWeight: "800", fontFamily: fonts.bold, color: colors.brown },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 10 },
  cardWrap: { width: "48.5%" },
  pressed: { transform: [{ scale: 0.97 }] },
  card: { alignItems: "center", paddingHorizontal: 10, paddingTop: 10, paddingBottom: 12 },
  tag: { position: "absolute", top: 8, left: 8, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, zIndex: 1 },
  tagMob: { backgroundColor: colors.green },
  tagBoss: { backgroundColor: colors.red },
  tagText: { fontSize: 8, fontWeight: "900", fontFamily: fonts.bold, color: colors.cream },
  stage: { position: "absolute", top: 9, right: 10, fontSize: 9, fontWeight: "900", fontFamily: fonts.bold, color: colors.muted },
  portrait: { height: 88, marginTop: 8, alignItems: "center", justifyContent: "flex-end", overflow: "hidden" },
  name: { marginTop: 4, fontSize: 12, fontWeight: "900", fontFamily: fonts.bold, color: colors.ink },
  area: { marginTop: 1, fontSize: 9, color: colors.muted },
  drops: { marginTop: 6, flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 6 },
  drop: { alignItems: "center" },
  dropIcon: { width: 20, height: 20 },
  dropChance: { fontSize: 8, fontWeight: "800", fontFamily: fonts.bold, color: colors.brown },
});
