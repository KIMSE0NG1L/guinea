import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { kit } from "../assets";
import { Panel } from "../components/NineSlice";
import { PageHeading } from "../components/PageHeading";
import appConfig from "../../app.json";

// 크레딧: who made the game and the outside work it uses (see THIRD-PARTY-NOTICES.md and
// assets/sfx/SOURCES.md for the full texts).
const SECTIONS: { title: string; entries: { name: string; detail: string; url?: string }[] }[] = [
  {
    title: "만든 사람",
    entries: [{ name: "기니 키우기 팀", detail: "기획 · 아트 디렉션 · 개발" }],
  },
  {
    title: "이펙트",
    entries: [
      { name: "pixelfx", detail: "© 2026 Patch · MIT License", url: "https://github.com/patch-gg/pixelfx" },
      { name: "Sprite Fusion pixel art VFX", detail: "© 2026 Hugo Duprez · MIT License (pixelfx 포함)", url: "https://www.spritefusion.com/pixel-art-vfx" },
      { name: "Hollow Crown", detail: "© 2026 rehan-remade · MIT License (pixelfx 포함)", url: "https://github.com/rehan-remade/hollow-crown" },
    ],
  },
  {
    title: "효과음",
    entries: [{ name: "Kenney", detail: "UI Audio · Impact Sounds · Music Jingles (CC0)", url: "https://kenney.nl" }],
  },
  {
    title: "음악",
    entries: [{ name: "Suno", detail: "배경 음악 생성", url: "https://suno.com" }],
  },
  {
    title: "글꼴",
    entries: [
      { name: "메이플스토리체", detail: "© NEXON Korea" },
      { name: "빙그레체", detail: "© Binggrae Co., Ltd." },
    ],
  },
];

export function CreditsScreen() {
  return (
    <View style={styles.page}>
      <PageHeading kicker="CREDITS" title="크레딧" description="이 게임을 함께 만든 것들." />
      <View style={styles.list}>
        {SECTIONS.map((section) => (
          <Panel key={section.title} slice={kit.panel} style={styles.card}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.entries.map((entry) => (
              <Pressable
                key={entry.name}
                disabled={!entry.url}
                onPress={() => entry.url && Linking.openURL(entry.url)}
                accessibilityRole={entry.url ? "link" : undefined}
                style={styles.entry}
              >
                <Text style={[styles.entryName, entry.url && styles.entryLink]}>{entry.name}</Text>
                <Text style={styles.entryDetail}>{entry.detail}</Text>
              </Pressable>
            ))}
          </Panel>
        ))}
      </View>
      <Text style={styles.version}>기니 키우기 v{appConfig.expo.version}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: "#e8dcc4", paddingHorizontal: 12, paddingTop: 18, paddingBottom: 25 },
  list: { gap: 10 },
  card: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 12 },
  sectionTitle: { fontSize: 12, fontWeight: "900", fontFamily: fonts.bold, color: colors.green, letterSpacing: 1 },
  entry: { marginTop: 8 },
  entryName: { fontSize: 13, fontWeight: "900", fontFamily: fonts.bold, color: colors.ink },
  entryLink: { textDecorationLine: "underline" },
  entryDetail: { fontFamily: fonts.light, letterSpacing: -0.36, marginTop: 1, fontSize: 12, color: colors.brown },
  version: { fontFamily: fonts.light, letterSpacing: -0.36, marginTop: 16, textAlign: "center", fontSize: 12, color: colors.muted },
});
