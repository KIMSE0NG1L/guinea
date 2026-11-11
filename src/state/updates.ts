// 업데이트 소식: what's new in the latest update, shown once to a player who hasn't seen this
// `id` yet (with a small gift), and any time again from the settings. For each new update,
// replace this with a fresh `id` (e.g. the release date) and its own list. Each line gets a
// game icon (`image`) or, for a new companion, that companion's own sprite (`outfit`).
import { icons, skillImages } from "../assets";
import type { Outfit } from "../types";

type UpdateItem = { text: string; image?: number; outfit?: Outfit };

export const LATEST_UPDATE: { id: string; title: string; gems: number; items: UpdateItem[] } = {
  id: "2026-11-07",
  title: "새로운 모험이 기다려요!",
  gems: 100,
  items: [
    { image: icons.map, text: "새 지역: 꿀향기 귀갓길 · 기니 대도시 귀환길 · 무너진 성채 (37~39 스테이지)" },
    { outfit: "witchGini", text: "새 동료 마녀기니 — 모든 공격이 마법!" },
    { image: skillImages.meteor, text: "새 스킬 운석 낙하 — 몹 5마리를 한 번에!" },
    { image: icons.chest, text: "매일 받는 출석 보상과 더 풍성해진 오프라인 보상" },
    { image: icons.scroll, text: "기니의 발자취 · 게임 가이드 · 세이브 백업 추가" },
    { image: icons.star, text: "시작 화면과 판타지 지역의 새 음악" },
  ],
};
