import { useEffect, useRef, useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { Text } from "./GameText";
import { colors, fonts } from "../theme";
import { kit } from "../assets";
import { NineSlice } from "./NineSlice";
import { GameButton } from "./GameButton";
import { BattleScene } from "../screens/BattleScene";
import { BEAM_TIMING, CARROT_THROW_HIT_MS, CHILI_THROW_DOT_TICK_MS, CHILI_THROW_DOT_TICKS, CHILI_THROW_HIT_MS, getSkill, METEOR_HIT_MS, type SkillId } from "../state/skills";
import type { BattlePhase, EnemyKind, Outfit } from "../types";
import { t } from "../i18n";

const MAX_HP = 1000;
const HIT = 80; // a plain swing's damage on the stand-in enemy

// Skills that change something you can actually watch in a fight — the rest (오프라인
// 골드, 음식 버프 시간) have nothing to act out.
export const PREVIEWABLE_SKILLS: SkillId[] = ["beam", "steal", "focus", "execute", "shout", "barrage", "teleport", "carrotThrow", "chiliThrow", "meteor"];

type Fx = {
  phase: BattlePhase;
  enemyHp: number;
  enemyId: number;
  critical: boolean;
  executedKill: boolean;
  damageEvents: { id: number; amount: number; critical: boolean }[];
  goldEvents: { id: number; amount: number }[];
  castIds: Record<SkillId, number>;
  executeId: number;
  // One per falling meteor (운석 낙하's own count, apart from castIds).
  meteorStrikeId: number;
};

const NO_CASTS = Object.fromEntries(PREVIEWABLE_SKILLS.map((id) => [id, 0])) as Record<SkillId, number>;
const INITIAL: Fx = { phase: "idle", enemyHp: MAX_HP, enemyId: 1, critical: false, executedKill: false, damageEvents: [], goldEvents: [], castIds: NO_CASTS, executeId: 0, meteorStrikeId: 0 };

// A looping, scripted mini fight in the real BattleScene (preview mode: no HUD) that acts
// out one skill: the guinea pig against the current stage's mob, the skill's own cast VFX,
// and the hits it causes. Nothing here touches the game state.
export function SkillPreviewModal({ skillId, enemyKind, outfit, onClose }: { skillId: SkillId; enemyKind: EnemyKind; outfit: Outfit; onClose: () => void }) {
  const skill = getSkill(skillId);
  const [fx, setFx] = useState<Fx>(INITIAL);
  const nextId = useRef(1);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));
    const update = (patch: (previous: Fx) => Partial<Fx>) => setFx((previous) => ({ ...previous, ...patch(previous) }));

    // Damage on the enemy: a number pops, hp drops, the hit clip plays (or the die clip at 0).
    const damage = (amount: number, critical = false, gold = 0) => {
      const id = nextId.current++;
      update((previous) => {
        const enemyHp = Math.max(0, previous.enemyHp - amount);
        return {
          enemyHp,
          critical,
          phase: enemyHp === 0 ? "defeated" : "hit",
          damageEvents: [...previous.damageEvents, { id, amount, critical }],
          goldEvents: gold > 0 ? [...previous.goldEvents, { id, amount: gold }] : previous.goldEvents,
        };
      });
      setTimeout(() => update((previous) => ({
        damageEvents: previous.damageEvents.filter((event) => event.id !== id),
        goldEvents: previous.goldEvents.filter((event) => event.id !== id),
      })), 1100);
    };
    // A normal swing: wind up, then the hit lands.
    const swing = (ms: number, amount = HIT, critical = false, gold = 0) => {
      at(ms, () => update(() => ({ phase: "attacking", critical })));
      at(ms + 140, () => damage(amount, critical, gold));
      at(ms + 340, () => update((previous) => (previous.phase === "hit" ? { phase: "idle" } : {})));
    };
    const cast = (ms: number) => at(ms, () => update((previous) => ({ castIds: { ...previous.castIds, [skillId]: previous.castIds[skillId] + 1 } })));
    // A fresh enemy walks in (after a kill, or between loops).
    const respawn = (ms: number) => {
      at(ms, () => update((previous) => ({ enemyId: previous.enemyId + 1, enemyHp: MAX_HP, phase: "entering", executedKill: false, critical: false })));
      at(ms + 450, () => update(() => ({ phase: "idle" })));
    };

    // Each script returns its loop length.
    const script = (): number => {
      switch (skillId) {
        case "beam":
          cast(500);
          at(500 + BEAM_TIMING.hit, () => damage(MAX_HP, true));
          respawn(500 + BEAM_TIMING.hit + 900);
          return 3400;
        case "carrotThrow":
          swing(300);
          cast(1000);
          at(1000 + CARROT_THROW_HIT_MS, () => damage(MAX_HP * 0.25, true));
          swing(1900);
          return 3200;
        case "chiliThrow":
          cast(400);
          for (let tick = 0; tick < CHILI_THROW_DOT_TICKS; tick += 1) {
            at(400 + CHILI_THROW_HIT_MS + tick * CHILI_THROW_DOT_TICK_MS, () => damage((MAX_HP * 0.3) / CHILI_THROW_DOT_TICKS));
          }
          return 400 + CHILI_THROW_HIT_MS + CHILI_THROW_DOT_TICKS * CHILI_THROW_DOT_TICK_MS + 800;
        case "steal":
          cast(400);
          for (let index = 0; index < 7; index += 1) swing(900 + index * 550, HIT, false, 15);
          return 5400;
        case "focus":
          cast(400);
          for (let index = 0; index < 7; index += 1) swing(900 + index * 550, HIT * 2.5, true);
          return 5400;
        case "barrage":
          cast(400);
          for (let index = 0; index < 14; index += 1) swing(900 + index * 280, HIT);
          return 5400;
        case "shout":
          swing(300);
          cast(1000);
          for (let index = 0; index < 4; index += 1) swing(1800 + index * 600, HIT * 1.3);
          return 4800;
        case "execute":
          swing(300, 300);
          swing(1000, 300);
          // This swing leaves it under 25% — execute finishes it instead.
          at(1700, () => update(() => ({ phase: "attacking", critical: false })));
          at(1840, () => update((previous) => ({ enemyHp: 0, phase: "defeated", executedKill: true, executeId: previous.executeId + 1 })));
          respawn(2900);
          return 4000;
        case "meteor": {
          // The cast's meteor, then the shower: each arriving mob gets one of its own.
          const drop = (ms: number) => {
            at(ms, () => update((previous) => ({ meteorStrikeId: previous.meteorStrikeId + 1 })));
            at(ms + METEOR_HIT_MS, () => damage(MAX_HP, true));
            respawn(ms + METEOR_HIT_MS + 700);
          };
          cast(400);
          drop(400);
          drop(400 + 1900);
          drop(400 + 3800);
          return 400 + 3800 + METEOR_HIT_MS + 1300;
        }
        case "teleport":
          cast(500);
          respawn(500 + 300);
          return 2800;
        default:
          return 3000;
      }
    };

    let alive = true;
    const loop = () => {
      if (!alive) return;
      setFx((previous) => ({ ...previous, enemyHp: MAX_HP, phase: "idle", executedKill: false, damageEvents: [], goldEvents: [] }));
      const length = script();
      timers.push(setTimeout(loop, length));
    };
    loop();
    return () => {
      alive = false;
      timers.forEach(clearTimeout);
    };
  }, [skillId]);

  return (
    <Modal visible animationType="fade" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.panel} onPress={(event) => event.stopPropagation()}>
          <NineSlice slice={kit.panelLarge} />
          <Text style={styles.eyebrow}>{t("스킬 미리보기", "Skill Preview")}</Text>
          <Text style={styles.title}>{t(skill.name)}</Text>
          <Text style={styles.message}>{t(skill.description)}</Text>
          <View style={styles.sceneWrap} pointerEvents="none">
            <BattleScene
              preview
              critical={fx.critical}
              damageEvents={fx.damageEvents}
              enemyHp={fx.enemyHp}
              enemyMaxHp={MAX_HP}
              boss={false}
              enemyKind={enemyKind}
              phase={fx.phase}
              enemyId={fx.enemyId}
              lastGoldReward={0}
              stageAdvance={null}
              stageLabel=""
              stageKills={0}
              questReady={false}
              onQuest={noop}
              outfit={outfit}
              manualEnabled={false}
              onManualAttack={noop}
              onOpenMap={noop}
              onOpenKitchen={noop}
              kitchenReadyDish={null}
              onOpenBag={noop}
              bagFull={false}
              onCatchFlyingCoin={noCoin}
              skillBar={null}
              goldEvents={fx.goldEvents}
              executeId={fx.executeId}
              firstStrikeId={0}
              executedKill={fx.executedKill}
              beamId={fx.castIds.beam}
              stealId={fx.castIds.steal}
              focusId={fx.castIds.focus}
              barrageId={fx.castIds.barrage}
              teleportId={fx.castIds.teleport}
              shoutId={fx.castIds.shout}
              carrotThrowId={fx.castIds.carrotThrow}
              chiliThrowId={fx.castIds.chiliThrow}
              meteorStrikeId={fx.meteorStrikeId}
              dropEvents={[]}
              bossEntranceKey={null}
              onBeginBoss={noop}
              levelUpAnnouncement={null}
              now={0}
              bossTimerStartedAt={null}
              bossTimeLimitMs={0}
              bossFledKey={0}
              bossSkillCastId={0}
              bossSkillConfig={null}
              bossReviveId={0}
            />
          </View>
          <GameButton variant="green" onPress={onClose} style={styles.closeButton}>{t("닫기", "Close")}</GameButton>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const noop = () => {};
const noCoin = () => ({ gold: 0, gems: 0 });

const styles = StyleSheet.create({
  backdrop: { flex: 1, padding: 14, justifyContent: "center", backgroundColor: "#263024cf" },
  panel: { width: "100%", maxWidth: 430, alignSelf: "center", paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24, alignItems: "center" },
  eyebrow: { color: colors.green, fontWeight: "800", fontFamily: fonts.bold, fontSize: 12, letterSpacing: 1.5 },
  title: { marginTop: 2, fontSize: 19, fontWeight: "800", fontFamily: fonts.bold, color: colors.ink, textAlign: "center" },
  message: { fontFamily: fonts.light, letterSpacing: -0.36, marginTop: 4, paddingHorizontal: 8, fontSize: 12, color: colors.brown, textAlign: "center", lineHeight: 16 },
  sceneWrap: { alignSelf: "stretch" },
  closeButton: { marginTop: 4, minWidth: 120 },
});
