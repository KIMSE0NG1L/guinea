import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { kit } from "../assets";
import { NineSlice, Panel } from "./NineSlice";
import { GameButton } from "./GameButton";
import { EnemySprite } from "./EnemySprite";
import { BOSS_LORE, MOB_LORE } from "../state/bestiary";
import { BOSS_NAME, ENEMY_NAME, getStageCode } from "../state/stages";
import type { EnemyKind } from "../types";

export function MonsterStoryModal({
  kind,
  boss,
  stageIndex,
  area,
  onClose,
}: {
  kind: EnemyKind;
  boss: boolean;
  stageIndex: number;
  area: string;
  onClose: () => void;
}) {
  const lore = boss ? BOSS_LORE[kind] : MOB_LORE[kind];
  return (
    <Modal visible animationType="fade" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.panel} onPress={(event) => event.stopPropagation()}>
          <NineSlice slice={kit.panelLarge} />
          <View style={styles.top}>
            <View style={[styles.tag, boss ? styles.tagBoss : styles.tagMob]}>
              <Text style={styles.tagText}>{boss ? "보스" : "일반"}</Text>
            </View>
            <Text style={styles.where}>
              {getStageCode(stageIndex)} {area}
            </Text>
          </View>
          <View style={styles.portrait}>
            <EnemySprite boss={boss} kind={kind} animation="idle" size={boss ? 130 : 110} restartKey={`story-${kind}-${boss}`} />
          </View>
          <Text style={styles.name}>{boss ? BOSS_NAME[kind] : ENEMY_NAME[kind]}</Text>
          <View style={styles.traits}>
            {lore.traits.map((trait) => (
              <View key={trait} style={styles.trait}>
                <Text style={styles.traitText}>#{trait}</Text>
              </View>
            ))}
          </View>
          <Panel slice={kit.inset} scale={0.4} style={styles.storyBox}>
            <Text style={styles.story}>{lore.story}</Text>
          </Panel>
          <GameButton variant="green" onPress={onClose} style={styles.close}>
            닫기
          </GameButton>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, paddingHorizontal: 16, justifyContent: "center", backgroundColor: "#263024cf" },
  panel: { width: "100%", maxWidth: 400, alignSelf: "center", alignItems: "center", paddingHorizontal: 20, paddingTop: 18, paddingBottom: 20 },
  top: { alignSelf: "stretch", flexDirection: "row", alignItems: "center", gap: 6 },
  tag: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  tagMob: { backgroundColor: colors.green },
  tagBoss: { backgroundColor: colors.red },
  tagText: { fontSize: 9, fontWeight: "900", fontFamily: fonts.bold, color: colors.cream },
  where: { fontSize: 10, fontWeight: "800", fontFamily: fonts.bold, color: colors.brown },
  portrait: { height: 130, justifyContent: "flex-end", alignItems: "center" },
  name: { marginTop: 4, fontSize: 20, fontWeight: "900", fontFamily: fonts.bold, color: colors.ink },
  traits: { marginTop: 6, flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 5 },
  trait: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8, backgroundColor: "#e9d6ae" },
  traitText: { fontSize: 9, fontWeight: "800", fontFamily: fonts.bold, color: colors.brown },
  storyBox: { marginTop: 12, alignSelf: "stretch", paddingHorizontal: 16, paddingTop: 12, paddingBottom: 14 },
  story: { fontSize: 12, lineHeight: 19, color: colors.ink, fontFamily: fonts.bold },
  close: { marginTop: 14, minWidth: 120 },
});
