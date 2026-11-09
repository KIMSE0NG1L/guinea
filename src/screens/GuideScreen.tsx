import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { kit } from "../assets";
import { Panel } from "../components/NineSlice";
import { PageHeading } from "../components/PageHeading";

// 게임 가이드: how each system works, one topic per collapsible card. Kept to what a player
// needs; the exact numbers live in the code (and 설정집's 시스템 규칙).
const TOPICS: { title: string; lines: string[] }[] = [
  {
    title: "⚔️ 전투와 스테이지",
    lines: [
      "기니는 자동으로 싸워요. 몬스터 50마리를 잡는 동안 화난 중간 보스가 네 번 불쑥 나타나고, 50마리를 다 잡으면 보스가 나타나요. 보스를 쓰러뜨리면 한 번 더 분노해서 일어나요. 마지막 보스까지 잡으면 지도의 환생으로 더 강해져서 다시 떠날 수 있어요.",
      "중간 보스는 일반 몬스터보다 훨씬 튼튼하지만, 재료와 경험치를 더 많이 줘요.",
      "아주 가끔 반짝이는 황금 중간 보스가 나타나요. 잡으면 골드 10배와 보석을 줘요!",
      "보스가 나오면 화면을 눌러 도전하세요. 누르기 전까지는 기다려 줘요.",
      "보스는 제한시간 안에 잡아야 해요. 놓치면 광고를 보고 남은 체력 그대로 다시 도전할 수 있어요.",
      "보스를 잡으면 다음 지역으로! 지도에서 이미 지나온 지역으로 돌아갈 수도 있어요.",
    ],
  },
  {
    title: "👑 보스 스킬",
    lines: [
      "보스는 체력이 줄어들 때 스킬을 써요. 기절형은 잠시 자동 전투를 멈추고, 회복형은 체력을 조금 회복해요.",
      "기절 중에도 화면을 직접 눌러 공격할 수 있어요.",
      "한 방에 쓰러뜨리면 보스가 스킬을 쓸 틈이 없어요.",
    ],
  },
  {
    title: "💪 강화",
    lines: [
      "골드로 공격력·치명타 피해·치명타 확률·골드 획득을 강화해요.",
      "강화 단위 버튼으로 1레벨, 10레벨, 최대치까지 한 번에 올릴 수 있어요.",
    ],
  },
  {
    title: "🍳 요리와 음식 효과",
    lines: [
      "몬스터가 떨어뜨린 재료로 요리하고, 다 된 요리를 음식 칸에 넣어 먹으면 일정 시간 효과가 생겨요.",
      "음식 칸은 3개까지 열 수 있어요. 같은 세트의 요리 3개를 함께 먹으면 세트 효과가 추가돼요.",
      "요리마다 '궁합' 동료가 있어요. 그 동료와 함께일 때 먹으면 효과가 1.5배예요.",
      "요리하다 대성공이 나면 한 번에 두 그릇이 나와요. 보석으로 바로 완성할 수도 있어요.",
      "레시피는 셰프 상점에서 골드로 배우고, 재료는 할머니 식료품점에서도 살 수 있어요.",
    ],
  },
  {
    title: "✨ 스킬",
    lines: [
      "레벨이 오르면 새 스킬이 열려요. 스킬은 하나만 장착할 수 있어요.",
      "액티브 스킬은 3분마다 쓸 수 있고, 쓰거나 패시브를 장착하면 3분 동안 다른 스킬로 바꿀 수 없어요.",
      "스킬 화면의 미리보기로 어떤 스킬인지 먼저 볼 수 있어요.",
    ],
  },
  {
    title: "🐹 동료",
    lines: [
      "새 지역에 도착하면 동료가 합류해요. 아직 못 간 지역의 동료도 보석으로 미리 데려올 수 있어요.",
      "동료마다 능력이 달라요. 보스나 상황에 맞춰 바꿔 보세요.",
    ],
  },
  {
    title: "🌙 자리를 비운 동안",
    lines: [
      "게임을 꺼 두어도 기니는 사냥을 계속해요. 최대 8시간까지 골드·경험치·재료를 모아 와요.",
      "오프라인 사냥은 직접 플레이보다 적게 벌어요. 보스는 직접 잡아야 해요.",
      "광고를 보면 오프라인 골드를 2배로 받을 수 있어요.",
    ],
  },
  {
    title: "💎 보석 모으기",
    lines: [
      "보스를 처음 잡으면 광고를 보고 보석 보너스를 받을 수 있어요.",
      "날아다니는 동전을 눌러 보세요. 가끔 날개 달린 보석이 나와요.",
      "매일 출석 보상을 받고, 퀘스트를 깨서 보석을 모으세요.",
    ],
  },
  {
    title: "💾 세이브",
    lines: [
      "진행 상황은 이 기기에 자동으로 저장돼요.",
      "기기를 바꾸거나 앱을 지우기 전에는 설정 → 세이브 백업에서 백업 코드를 꼭 챙겨 두세요.",
    ],
  },
];

export function GuideScreen() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <View style={styles.page}>
      <PageHeading kicker="GUIDE" title="게임 가이드" description="모험에 필요한 것들을 정리했어요." />
      <View style={styles.list}>
        {TOPICS.map((topic, index) => {
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
  page: { backgroundColor: "#e8dcc4", paddingHorizontal: 12, paddingTop: 18, paddingBottom: 25 },
  list: { gap: 8 },
  card: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 12 },
  cardHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardTitle: { fontSize: 14, fontWeight: "900", fontFamily: fonts.bold, color: colors.ink },
  chevron: { fontSize: 10, color: colors.brown },
  line: { marginTop: 8, flexDirection: "row", gap: 6 },
  bullet: { fontSize: 11, color: colors.brown, lineHeight: 17 },
  lineText: { flex: 1, fontSize: 11, color: colors.ink, lineHeight: 17 },
});
