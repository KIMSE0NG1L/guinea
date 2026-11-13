import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "../components/GameText";
import { colors, fonts } from "../theme";
import { kit } from "../assets";
import { Panel } from "../components/NineSlice";
import { PageHeading } from "../components/PageHeading";
import { t, useLanguage } from "../i18n";

// 게임 가이드: how each system works, one topic per collapsible card. Kept to what a player
// needs; the exact numbers live in the code (and 설정집's 시스템 규칙).
// A function (not a module-level constant) so every t() call re-reads the current language —
// see useLanguage() in the component below, which re-renders this when it's toggled.
function getTopics(): { title: string; lines: string[] }[] {
  return [
    {
      title: t("⚔️ 전투와 스테이지", "⚔️ Combat & Stages"),
      lines: [
        t(
          "기니는 자동으로 싸워요. 몬스터 50마리를 잡는 동안 화난 중간 보스가 네 번 불쑥 나타나고, 50마리를 다 잡으면 보스가 나타나요. 보스를 쓰러뜨리면 한 번 더 분노해서 일어나요. 마지막 보스까지 잡으면 다시 첫 지역부터 모험이 이어져요.",
          "Gini fights automatically. While clearing 50 monsters, four angry mid-bosses pop up along the way, and once all 50 are down, the boss appears. Beat the boss once and it gets back up enraged for a second round. Clear the very last boss and the adventure loops back to the first area.",
        ),
        t(
          "중간 보스는 일반 몬스터보다 훨씬 튼튼하지만, 재료와 경험치를 더 많이 줘요.",
          "Mid-bosses are much tougher than regular monsters, but they give more ingredients and experience.",
        ),
        t(
          "아주 가끔 반짝이는 황금 중간 보스가 나타나요. 잡으면 골드 10배와 보석을 줘요!",
          "Every once in a while, a shimmering golden mid-boss shows up. Defeat it for 10x gold plus gems!",
        ),
        t("보스가 나오면 화면을 눌러 도전하세요. 누르기 전까지는 기다려 줘요.", "When a boss appears, tap the screen to challenge it. It waits until you do."),
        t(
          "보스는 제한시간 안에 잡아야 해요. 놓치면 광고를 보고 남은 체력 그대로 다시 도전할 수 있어요.",
          "Bosses have to be beaten within a time limit. If you miss it, you can watch an ad to retry with its remaining HP intact.",
        ),
        t(
          "보스를 잡으면 다음 지역으로! 지도에서 이미 지나온 지역으로 돌아갈 수도 있어요.",
          "Beat the boss and move on to the next area! You can also head back to an area you've already passed through from the map.",
        ),
      ],
    },
    {
      title: t("👑 보스 스킬", "👑 Boss Skills"),
      lines: [
        t(
          "보스는 체력이 줄어들 때 스킬을 써요. 기절형은 잠시 자동 전투를 멈추고, 회복형은 체력을 조금 회복해요.",
          "Bosses cast skills as their HP drops. Stun-type skills briefly pause auto-battle; heal-type skills recover a bit of their HP.",
        ),
        t("기절 중에도 화면을 직접 눌러 공격할 수 있어요.", "You can still tap the screen to attack manually while stunned."),
        t("한 방에 쓰러뜨리면 보스가 스킬을 쓸 틈이 없어요.", "Kill it in one hit and the boss never gets the chance to cast a skill."),
      ],
    },
    {
      title: t("💪 강화", "💪 Upgrades"),
      lines: [
        t("골드로 공격력·치명타 피해·치명타 확률·골드 획득을 강화해요.", "Spend gold to upgrade Attack, Crit Damage, Crit Chance, and Gold Gain."),
        t(
          "강화 단위 버튼으로 1레벨, 10레벨, 최대치까지 한 번에 올릴 수 있어요.",
          "Use the upgrade-count buttons to raise it by 1 level, 10 levels, or all the way to max at once.",
        ),
      ],
    },
    {
      title: t("🍳 요리와 음식 효과", "🍳 Cooking & Food Effects"),
      lines: [
        t(
          "몬스터가 떨어뜨린 재료로 요리하고, 다 된 요리를 음식 칸에 넣어 먹으면 일정 시간 효과가 생겨요.",
          "Cook with ingredients dropped by monsters, then eat the finished dish from a food slot for a timed effect.",
        ),
        t(
          "음식 칸은 3개까지 열 수 있어요. 같은 세트의 요리 3개를 함께 먹으면 세트 효과가 추가돼요.",
          "You can open up to 3 food slots. Eating 3 dishes from the same set together adds a set bonus.",
        ),
        t("요리마다 '궁합' 동료가 있어요. 그 동료와 함께일 때 먹으면 효과가 1.5배예요.", "Every dish has a 'paired' companion. Eating it while that companion is equipped gives 1.5x the effect."),
        t(
          "요리하다 대성공이 나면 한 번에 두 그릇이 나와요. 보석으로 바로 완성할 수도 있어요.",
          "A Great Success while cooking yields two servings at once. You can also finish a pot instantly with gems.",
        ),
        t(
          "레시피는 셰프 상점에서 골드로 배우고, 재료는 할머니 식료품점에서도 살 수 있어요.",
          "Learn recipes with gold at the chef's shop, and buy ingredients at grandma's grocery too.",
        ),
      ],
    },
    {
      title: t("✨ 스킬", "✨ Skills"),
      lines: [
        t("레벨이 오르면 새 스킬이 열려요. 스킬은 하나만 장착할 수 있어요.", "New skills unlock as you level up. Only one skill can be equipped at a time."),
        t(
          "액티브 스킬은 3분마다 쓸 수 있고, 쓰거나 패시브를 장착하면 3분 동안 다른 스킬로 바꿀 수 없어요.",
          "Active skills can be used every 3 minutes, and casting one — or equipping a passive — locks the slot for 3 minutes before you can swap.",
        ),
        t("스킬 화면의 미리보기로 어떤 스킬인지 먼저 볼 수 있어요.", "Use the preview on the skills screen to check out a skill before equipping it."),
      ],
    },
    {
      title: t("🐹 동료", "🐹 Companions"),
      lines: [
        t(
          "새 지역에 도착하면 동료가 합류해요. 아직 못 간 지역의 동료도 보석으로 미리 데려올 수 있어요.",
          "Companions join when you reach a new area. You can also bring one along early with gems before you've reached its area.",
        ),
        t("동료마다 능력이 달라요. 보스나 상황에 맞춰 바꿔 보세요.", "Each companion has different abilities. Try switching depending on the boss or situation."),
      ],
    },
    {
      title: t("🌙 자리를 비운 동안", "🌙 While You're Away"),
      lines: [
        t(
          "게임을 꺼 두어도 기니는 사냥을 계속해요. 최대 8시간까지 골드·경험치·재료를 모아 와요.",
          "Gini keeps hunting even with the game closed, gathering gold, experience, and ingredients for up to 8 hours.",
        ),
        t("오프라인 사냥은 직접 플레이보다 적게 벌어요. 보스는 직접 잡아야 해요.", "Offline hunting earns less than playing directly, and bosses still have to be beaten in person."),
        t("광고를 보면 오프라인 골드를 2배로 받을 수 있어요.", "Watch an ad to double the offline gold you earned."),
      ],
    },
    {
      title: t("💎 보석 모으기", "💎 Earning Gems"),
      lines: [
        t("보스를 처음 잡으면 광고를 보고 보석 보너스를 받을 수 있어요.", "The first time you beat a boss, you can watch an ad for a gem bonus."),
        t("날아다니는 동전을 눌러 보세요. 가끔 날개 달린 보석이 나와요.", "Tap the flying coins when they show up — every so often a winged gem appears instead."),
        t("매일 출석 보상을 받고, 퀘스트를 깨서 보석을 모으세요.", "Claim your daily attendance reward and clear quests to collect gems."),
      ],
    },
    {
      title: t("💾 세이브", "💾 Saving"),
      lines: [
        t("진행 상황은 이 기기에 자동으로 저장돼요.", "Your progress is saved automatically on this device."),
        t(
          "기기를 바꾸거나 앱을 지우기 전에는 설정 → 세이브 백업에서 백업 코드를 꼭 챙겨 두세요.",
          "Before switching devices or deleting the app, be sure to grab a backup code from Settings → Save Backup.",
        ),
      ],
    },
  ];
}

export function GuideScreen() {
  const [open, setOpen] = useState<number | null>(0);
  // Subscribing here re-renders this screen (and recomputes getTopics()) the moment the
  // language is toggled in Settings, even though it reads t() directly rather than this value.
  useLanguage();
  const topics = getTopics();
  return (
    <View style={styles.page}>
      <PageHeading kicker="GUIDE" title={t("게임 가이드", "Game Guide")} description={t("모험에 필요한 것들을 정리했어요.", "Everything you need for the adventure, in one place.")} />
      <View style={styles.list}>
        {topics.map((topic, index) => {
          const expanded = open === index;
          return (
            <Pressable key={topic.title} onPress={() => setOpen(expanded ? null : index)} accessibilityRole="button" accessibilityState={{ expanded }}>
              <Panel slice={expanded ? kit.panel : kit.inset} style={styles.card}>
                <View style={styles.cardHead}>
                  <Text style={styles.cardTitle}>{topic.title}</Text>
                  <Text style={styles.chevron}>{expanded ? "▲" : "▼"}</Text>
                </View>
                {expanded &&
                  topic.lines.map((line) => (
                    <View key={line} style={styles.line}>
                      <Text style={styles.bullet}>•</Text>
                      <Text style={styles.lineText}>{line}</Text>
                    </View>
                  ))}
              </Panel>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: "#e8dcc4", paddingHorizontal: 16, paddingTop: 20, paddingBottom: 25 },
  list: { gap: 8 },
  card: { paddingHorizontal: 18, paddingTop: 15, paddingBottom: 15 },
  cardHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardTitle: { fontSize: 16, fontWeight: "900", fontFamily: fonts.bold, color: colors.ink },
  chevron: { fontSize: 12, color: colors.brown },
  line: { marginTop: 8, flexDirection: "row", gap: 6 },
  bullet: { fontFamily: fonts.light, letterSpacing: -0.36, fontSize: 12, color: colors.brown, lineHeight: 16 },
  lineText: { fontFamily: fonts.light, letterSpacing: -0.36, flex: 1, fontSize: 12, color: colors.ink, lineHeight: 16 },
});
