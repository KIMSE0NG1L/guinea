import { useEffect, useRef, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { colors, fonts } from "../theme";
import { frameImages, icons, kit } from "../assets";
import { PageHeading } from "../components/PageHeading";
import { GameButton } from "../components/GameButton";
import { Panel } from "../components/NineSlice";
import { MonsterCodex } from "../components/MonsterCodex";
import { IconCaption } from "../components/IconCaption";
import { BOSS_NAME, ENEMY_NAME, getStageCode, STAGES } from "../state/stages";

type Page = "map" | "monsters";

const HEADINGS: Record<Page, { kicker: string; title: string; description: string; icon: number; open: string; caption: string }> = {
  map: { kicker: "MILESTONE", title: "모험 지도", description: "보스를 쓰러뜨리면 다음 스테이지가 열려요.", icon: icons.map, open: "모험 지도로 돌아가기", caption: "지도" },
  monsters: { kicker: "BESTIARY", title: "몬스터 도감", description: "만난 몬스터와 떨어뜨리는 재료를 모아봐요.", icon: icons.codexMonster, open: "몬스터 도감 열기", caption: "몬스터 도감" },
};

export function MilestoneScreen({
  stageNumber,
  highestStageNumber,
  onSelectStage,
  onBack,
  seenStage,
  onSeen,
  onOpenComics,
}: {
  stageNumber: number;
  highestStageNumber: number;
  // Furthest stage shown last visit (undefined = never tracked), and the report on leaving.
  seenStage: number | undefined;
  onSeen: (stage: number) => void;
  // Opens the comic album (추억 앨범).
  onOpenComics: () => void;
  onSelectStage: (stageNumber: number) => void;
  onBack: () => void;
}) {
  const [view, setView] = useState<Page>("map");
  const heading = HEADINGS[view];
  // A stage opened since the last visit: its path draws in and its badge drops onto the map.
  const [newStage] = useState(() => (seenStage !== undefined && highestStageNumber > seenStage ? highestStageNumber : null));
  const latest = useRef({ highestStageNumber, onSeen });
  useEffect(() => {
    latest.current = { highestStageNumber, onSeen };
  });
  useEffect(() => () => latest.current.onSeen(latest.current.highestStageNumber), []);

  return (
    <View style={styles.page}>
      <View style={styles.headingRow}>
        <View style={styles.heading}>
          <PageHeading kicker={heading.kicker} title={heading.title} description={heading.description} />
        </View>
        {/* Bare icon: the purple book opens the monster codex, the map brings you back. */}
        <View style={styles.toggles}>
          {(["map", "monsters"] as Page[])
            .filter((item) => item !== view)
            .map((item) => (
              <Pressable
                key={item}
                onPress={() => setView(item)}
                accessibilityRole="button"
                accessibilityLabel={HEADINGS[item].open}
                hitSlop={6}
                style={({ pressed }) => [styles.toggle, pressed && styles.togglePressed]}
              >
                <Image source={HEADINGS[item].icon} style={styles.toggleIcon} />
                <IconCaption shift={item === "map" ? 4 : 0}>{HEADINGS[item].caption}</IconCaption>
              </Pressable>
            ))}
          <Pressable
            onPress={onOpenComics}
            accessibilityRole="button"
            accessibilityLabel="추억 앨범 열기"
            hitSlop={6}
            style={({ pressed }) => [styles.toggle, pressed && styles.togglePressed]}
          >
            <Image source={icons.scroll} style={styles.toggleIcon} />
          </Pressable>
        </View>
      </View>
      {view === "monsters" ? (
        <MonsterCodex highestStageNumber={highestStageNumber} />
      ) : (
      <View style={styles.list}>
        {STAGES.map((stage, index) => {
          const current = index === stageNumber;
          const unlocked = index <= highestStageNumber;
          const cleared = index < highestStageNumber;
          const isLast = index === STAGES.length - 1;
          return (
            <View key={stage.area}>
              <Panel slice={unlocked ? kit.panel : kit.inset} style={styles.card}>
                <StageBadge current={current} drop={index === newStage}>
                  <View style={[styles.badge, !unlocked && styles.badgeLocked]}>
                    <Image source={current ? frameImages.ringGold : frameImages.ringWood} style={styles.badgeRing} />
                    <Text style={[styles.badgeText, current && styles.badgeTextCurrent]}>{getStageCode(index)}</Text>
                  </View>
                </StageBadge>
                <View style={styles.cardCopy}>
                  <View style={styles.titleRow}>
                    <Text style={styles.cardStrong}>{stage.area}</Text>
                    {cleared && <WavingStar delay={index * 120} />}
                  </View>
                  <Text style={styles.cardSpan}>{unlocked ? stage.story : "이전 스테이지 보스를 처치하세요"}</Text>
                  {unlocked && (
                    <Text style={styles.cardMonsters}>
                      {ENEMY_NAME[stage.enemyKind]} · 보스 {BOSS_NAME[stage.enemyKind]}
                    </Text>
                  )}
                </View>
                {current ? (
                  <GameButton variant="green" style={styles.moveButton} textStyle={styles.moveButtonText} onPress={onBack}>
                    진행 중
                  </GameButton>
                ) : unlocked ? (
                  <GameButton variant="beige" style={styles.moveButton} textStyle={styles.moveButtonText} onPress={() => onSelectStage(index)}>
                    이동
                  </GameButton>
                ) : (
                  <Image source={icons.key} style={styles.lockIcon} accessibilityLabel="잠김" />
                )}
              </Panel>
              {!isLast && <TrailPath locked={index >= highestStageNumber} draw={index + 1 === newStage} />}
            </View>
          );
        })}
      </View>
      )}
    </View>
  );
}

// The current stage's badge bobs; a newly opened one drops in from above (after its path).
function StageBadge({ current, drop, children }: { current: boolean; drop: boolean; children: React.ReactNode }) {
  const bob = useSharedValue(0);
  const fall = useSharedValue(drop ? 0 : 1);
  useEffect(() => {
    bob.value = current ? withRepeat(withTiming(1, { duration: 650, easing: Easing.inOut(Easing.sin) }), -1, true) : withTiming(0, { duration: 150 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);
  useEffect(() => {
    if (drop) fall.value = withDelay(650, withTiming(1, { duration: 500, easing: Easing.out(Easing.bounce) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({
    opacity: Math.min(1, fall.value * 3),
    transform: [{ translateY: -bob.value * 5 - (1 - fall.value) * 60 }],
  }));
  return <Animated.View style={style}>{children}</Animated.View>;
}

// The dashed trail to the next stage — drawn in top to bottom when that stage just opened.
function TrailPath({ locked, draw }: { locked: boolean; draw: boolean }) {
  const grow = useSharedValue(draw ? 0 : 1);
  useEffect(() => {
    if (draw) grow.value = withDelay(200, withTiming(1, { duration: 450, easing: Easing.inOut(Easing.quad) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({ height: 22 * grow.value }));
  return (
    <View style={styles.pathSlot}>
      <Animated.View style={[styles.path, locked && styles.pathLocked, style]} />
    </View>
  );
}

// A cleared stage's star, swaying like a little flag.
function WavingStar({ delay }: { delay: number }) {
  const sway = useSharedValue(0);
  useEffect(() => {
    sway.value = withDelay(delay, withRepeat(withSequence(withTiming(1, { duration: 700, easing: Easing.inOut(Easing.sin) }), withTiming(-1, { duration: 700, easing: Easing.inOut(Easing.sin) })), -1, true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${sway.value * 12}deg` }] }));
  return <Animated.Image source={icons.star} style={[styles.statusIcon, style]} />;
}

const styles = StyleSheet.create({
  pathSlot: { height: 22 },
  headingRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  heading: { flex: 1 },
  toggles: { flexDirection: "row", gap: 2, marginTop: 4 },
  toggle: {},
  togglePressed: { transform: [{ scale: 0.92 }] },
  toggleIcon: { width: 46, height: 46 },
  page: { backgroundColor: "#e8dcc4", paddingHorizontal: 12, paddingTop: 18, paddingBottom: 25 },
  list: {},
  card: {
    paddingHorizontal: 13,
    paddingTop: 11,
    paddingBottom: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  badge: {
    width: 54,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeRing: { position: "absolute", width: 54, height: 54 },
  badgeLocked: { opacity: 0.5 },
  badgeText: { color: "#71491b", fontSize: 15, fontWeight: "900", fontFamily: fonts.bold },
  badgeTextCurrent: { color: colors.red },
  cardCopy: { flex: 1 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  cardStrong: { marginVertical: 2, fontSize: 14, fontWeight: "800", fontFamily: fonts.bold, color: colors.ink },
  cardSpan: { color: colors.muted, fontSize: 9 },
  cardMonsters: { marginTop: 3, color: colors.brown, fontSize: 8, fontWeight: "800", fontFamily: fonts.bold },
  statusIcon: { width: 16, height: 16 },
  lockIcon: { width: 34, height: 34, marginRight: 18, opacity: 0.6 },
  moveButton: { minWidth: 70 },
  moveButtonText: { fontSize: 10 },
  // Dashed trail between stage cards, lined up under the round stage badge.
  path: { width: 0, height: 22, marginLeft: 38, borderLeftWidth: 4, borderColor: colors.gold, borderStyle: "dashed" },
  pathLocked: { borderColor: "#b6a78e" },
});
