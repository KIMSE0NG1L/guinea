import { navIcons, skillImages } from "../assets";
import { GuideScene } from "./TutorialOverlay";
import type { SkillId, SkillTimers } from "../state/skills";
import type { Tab } from "../types";

const STEPS = 5;

// Starts once the player reaches the level that unlocks 훔치기 (the first skill, see
// SKILL_UNLOCK_LEVEL). Walks them to the skills tab, has them equip it, sends them back to
// battle, and has them cast it once.
//
// Like RecipeTutorial, the step isn't stored — it's read off live state each render (which
// tab is open, whether steal is equipped, whether it's ever been cast), so it can't drift
// out of sync with what the player actually did. Battle itself is paused the whole time
// this is up (see useGameState's skillTutorialActive / useAutoBattle's `paused`), so a
// stray auto-swing never kills the mob or ticks stage progress out from under the dialog.
export function SkillTutorial({
  tab,
  equippedSkill,
  skillTimers,
  onGoTo,
  onFinish,
}: {
  tab: Tab;
  equippedSkill: SkillId | null;
  skillTimers: SkillTimers;
  onGoTo: (tab: Tab) => void;
  onFinish: () => void;
}) {
  const equipped = equippedSkill === "steal";
  const cast = equipped && skillTimers.steal.readyAt > 0;

  const scene = (index: number, props: Omit<Parameters<typeof GuideScene>[0], "stepKey" | "dots">) => (
    <GuideScene key={index} stepKey={index} dots={{ count: STEPS, index }} onSkip={index < STEPS - 1 ? onFinish : undefined} {...props} />
  );

  if (cast) {
    return scene(4, {
      line: "좋아! 공격할 때마다 처치 골드를\n더 얻고 있어. 다 쓰면 3분 뒤에\n다시 쓸 수 있어.",
      icon: skillImages.steal,
      action: { label: "알겠어!", onPress: onFinish },
    });
  }
  if (equipped) {
    if (tab !== "battle") {
      return scene(2, {
        line: "장착 완료! 이제 **전투**로 돌아가서\n스킬을 써 보자.",
        icon: navIcons.battle,
        targetId: "nav-battle",
      });
    }
    return scene(3, {
      line: "아래 **스킬 슬롯**을 눌러서\n훔치기를 써 봐!",
      icon: skillImages.steal,
      targetId: "skill-slot",
    });
  }
  if (tab === "skills") {
    return scene(1, {
      line: "**훔치기**는 때릴 때마다 처치\n골드의 10%를 더 주는 스킬이야.\n**장착** 버튼을 눌러 봐!",
      icon: skillImages.steal,
      targetId: "equip-steal",
    });
  }
  return scene(0, {
    line: "레벨이 올라서 첫 **스킬**을\n쓸 수 있게 됐어! 아래\n**스킬** 버튼을 눌러 보자.",
    icon: navIcons.skills,
    targetId: "nav-skills",
  });
}
