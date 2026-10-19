import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { icons, kit } from "../assets";
import { Panel } from "../components/NineSlice";
import { PageHeading } from "../components/PageHeading";
import { COMIC_ORDER, COMICS, getComicUnlockLabel, getUnlockedComics, type ComicId } from "../state/comics";

// 추억 앨범: every story comic in story order. Reached ones show their first panel and play
// on tap (a "NEW" tag until watched); the rest stay covered with what opens them.
export function ComicsScreen({
  clearedStages,
  allUnlocked,
  seenComics,
  onPlay,
  onBack,
}: {
  clearedStages: number[];
  allUnlocked: boolean;
  seenComics: string[] | undefined;
  onPlay: (id: ComicId) => void;
  onBack: () => void;
}) {
  const unlocked = getUnlockedComics(clearedStages, allUnlocked);
  const seen = new Set(seenComics ?? []);

  return (
    <View style={styles.page}>
      <View style={styles.headingRow}>
        <View style={styles.heading}>
          <PageHeading kicker="ALBUM" title="추억 앨범" description="지나온 이야기를 다시 볼 수 있어요." />
        </View>
        <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="모험 지도로 돌아가기" hitSlop={6} style={({ pressed }) => [styles.back, pressed && styles.pressed]}>
          <Image source={icons.map} style={styles.backIcon} />
        </Pressable>
      </View>
      <Text style={styles.count}>
        모은 이야기 {unlocked.length} / {COMIC_ORDER.length}
      </Text>
      <View style={styles.list}>
        {COMIC_ORDER.map((id, index) => {
          const comic = COMICS[id];
          const open = unlocked.includes(id);
          const cover = comic.panels[0];
          return (
            <Pressable
              key={id}
              disabled={!open}
              onPress={() => onPlay(id)}
              accessibilityRole="button"
              accessibilityLabel={open ? `${comic.title} 보기` : `잠긴 이야기, ${getComicUnlockLabel(id)}`}
              style={({ pressed }) => [pressed && styles.pressed]}
            >
              <Panel slice={open ? kit.panel : kit.inset} scale={0.4} style={styles.card}>
                <View style={[styles.cover, { aspectRatio: 1 / cover.aspect }]}>
                  <Image source={cover.image} style={[styles.coverImage, !open && styles.coverLocked]} />
                  {!open && (
                    <View style={styles.lockVeil}>
                      <Text style={styles.lockText}>🔒</Text>
                    </View>
                  )}
                  {open && !seen.has(id) && (
                    <View style={styles.newTag}>
                      <Text style={styles.newText}>NEW</Text>
                    </View>
                  )}
                </View>
                <View style={styles.copy}>
                  <Text style={styles.episode}>{index + 1}화</Text>
                  <Text style={[styles.title, !open && styles.titleLocked]} numberOfLines={1}>
                    {open ? comic.title : "???"}
                  </Text>
                  <Text style={styles.condition}>{open ? "터치해서 다시 보기 ▶" : getComicUnlockLabel(id)}</Text>
                </View>
              </Panel>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: "#e8dcc4", paddingHorizontal: 12, paddingTop: 18, paddingBottom: 25 },
  headingRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  heading: { flex: 1 },
  back: { marginTop: 4 },
  backIcon: { width: 46, height: 46 },
  pressed: { transform: [{ scale: 0.97 }] },
  count: { marginBottom: 8, marginLeft: 4, fontSize: 11, fontWeight: "800", fontFamily: fonts.bold, color: colors.brown },
  list: { gap: 10 },
  card: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 10, paddingVertical: 10 },
  cover: { width: 120, borderRadius: 6, borderWidth: 2, borderColor: colors.line, overflow: "hidden" },
  coverImage: { width: "100%", height: "100%" },
  coverLocked: { opacity: 0.25, filter: "grayscale(1) blur(2px)" },
  lockVeil: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center", backgroundColor: "#2b1f1799" },
  lockText: { fontSize: 22 },
  newTag: { position: "absolute", top: 4, left: 4, paddingHorizontal: 5, borderRadius: 5, backgroundColor: colors.red },
  newText: { fontSize: 8, fontWeight: "900", fontFamily: fonts.bold, color: colors.cream },
  copy: { flex: 1 },
  episode: { fontSize: 9, fontWeight: "900", fontFamily: fonts.bold, color: colors.green },
  title: { marginTop: 2, fontSize: 13, fontWeight: "900", fontFamily: fonts.bold, color: colors.ink },
  titleLocked: { color: colors.muted },
  condition: { marginTop: 4, fontSize: 9, fontWeight: "800", fontFamily: fonts.bold, color: colors.brown },
});
