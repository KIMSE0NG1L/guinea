import { Linking, Pressable, StyleSheet, View } from "react-native";
import { Text } from "../components/GameText";
import { colors, fonts } from "../theme";
import { kit } from "../assets";
import { Panel } from "../components/NineSlice";
import { PageHeading } from "../components/PageHeading";
import appConfig from "../../app.json";
import { t } from "../i18n";

// 크레딧: who made the game and the outside work it uses (see THIRD-PARTY-NOTICES.md and
// assets/sfx/SOURCES.md for the full texts). Module-level, so Korean-only; titleEn/nameEn/
// detailEn are read via t(ko, en) at render time to keep the language toggle reactive.
const SECTIONS: { title: string; titleEn: string; entries: { name: string; nameEn?: string; detail: string; detailEn: string; url?: string }[] }[] = [
  {
    title: "만든 사람",
    titleEn: "Made By",
    entries: [{ name: "기니 키우기 팀", nameEn: "The Guinea Life Team", detail: "기획 · 아트 디렉션 · 개발", detailEn: "Design · Art Direction · Development" }],
  },
  {
    title: "이펙트",
    titleEn: "Effects",
    entries: [
      { name: "pixelfx", detail: "© 2026 Patch · MIT License", detailEn: "© 2026 Patch · MIT License", url: "https://github.com/patch-gg/pixelfx" },
      {
        name: "Sprite Fusion pixel art VFX",
        detail: "© 2026 Hugo Duprez · MIT License (pixelfx 포함)",
        detailEn: "© 2026 Hugo Duprez · MIT License (bundled via pixelfx)",
        url: "https://www.spritefusion.com/pixel-art-vfx",
      },
      {
        name: "Hollow Crown",
        detail: "© 2026 rehan-remade · MIT License (pixelfx 포함)",
        detailEn: "© 2026 rehan-remade · MIT License (bundled via pixelfx)",
        url: "https://github.com/rehan-remade/hollow-crown",
      },
    ],
  },
  {
    title: "효과음",
    titleEn: "Sound Effects",
    entries: [{ name: "Kenney", detail: "UI Audio · Impact Sounds · Music Jingles (CC0)", detailEn: "UI Audio · Impact Sounds · Music Jingles (CC0)", url: "https://kenney.nl" }],
  },
  {
    title: "음악",
    titleEn: "Music",
    entries: [{ name: "Suno", detail: "배경 음악 생성", detailEn: "Background music generation", url: "https://suno.com" }],
  },
  {
    title: "글꼴",
    titleEn: "Fonts",
    entries: [
      { name: "메이플스토리체", nameEn: "Maplestory Font", detail: "© NEXON Korea", detailEn: "© NEXON Korea" },
      { name: "빙그레체", nameEn: "Binggrae Font", detail: "© Binggrae Co., Ltd.", detailEn: "© Binggrae Co., Ltd." },
    ],
  },
];

export function CreditsScreen() {
  return (
    <View style={styles.page}>
      <PageHeading kicker="CREDITS" title={t("크레딧", "Credits")} description={t("이 게임을 함께 만든 것들.", "Everything that came together to make this game.")} />
      <View style={styles.list}>
        {SECTIONS.map((section) => (
          <Panel key={section.title} slice={kit.panel} style={styles.card}>
            <Text style={styles.sectionTitle}>{t(section.title, section.titleEn)}</Text>
            {section.entries.map((entry) => (
              <Pressable
                key={entry.name}
                disabled={!entry.url}
                onPress={() => entry.url && Linking.openURL(entry.url)}
                accessibilityRole={entry.url ? "link" : undefined}
                style={styles.entry}
              >
                <Text style={[styles.entryName, entry.url && styles.entryLink]}>{t(entry.name, entry.nameEn ?? entry.name)}</Text>
                <Text style={styles.entryDetail}>{t(entry.detail, entry.detailEn)}</Text>
              </Pressable>
            ))}
          </Panel>
        ))}
      </View>
      <Text style={styles.version}>{t(`기니 키우기 v${appConfig.expo.version}`, `Guinea Life v${appConfig.expo.version}`)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: "#e8dcc4", paddingHorizontal: 16, paddingTop: 20, paddingBottom: 25 },
  list: { gap: 10 },
  card: { paddingHorizontal: 18, paddingTop: 15, paddingBottom: 15 },
  sectionTitle: { fontSize: 12, fontWeight: "900", fontFamily: fonts.bold, color: colors.green, letterSpacing: 1 },
  entry: { marginTop: 8 },
  entryName: { fontSize: 15, fontWeight: "900", fontFamily: fonts.bold, color: colors.ink },
  entryLink: { textDecorationLine: "underline" },
  entryDetail: { fontFamily: fonts.light, letterSpacing: -0.36, marginTop: 1, fontSize: 12, lineHeight: 16, color: colors.brown },
  version: { fontFamily: fonts.light, letterSpacing: -0.36, marginTop: 16, textAlign: "center", fontSize: 12, lineHeight: 16, color: colors.muted },
});
