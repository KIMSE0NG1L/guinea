import { useState } from "react";
import { icons, statIcons } from "../assets";
import { GuideScene } from "./TutorialOverlay";

// After the gift kills, with gold in hand: 모험기니 points at the attack upgrade and waits for
// the player to buy it, then — now that the stage is under way — explains the stage bar,
// the boss and the quest medal. Whether the upgrade happened is read off the game (bought
// since this appeared); the closing lines are a little local step counter.
const AFTER = [
  { line: "훨씬 세졌어! 골드를 모을 때마다\n**능력치**를 강화하면\n더 멀리 모험할 수 있어.", icon: statIcons.attack },
  { line: "위의 **스테이지 바**가 가득 차면\n**보스**가 나타나. 보스를 이기면\n다음 지역으로 갈 수 있어!", icon: icons.trophy },
  { line: "**퀘스트 메달**에 빨간 점이 뜨면\n보상을 받을 수 있어.\n자, 계속 모험하자!", icon: icons.questMedal },
];
const STEPS = 1 + AFTER.length;

export function UpgradeTutorial({
  attackUpgrades,
  canAfford,
  onFinish,
}: {
  attackUpgrades: number;
  canAfford: boolean;
  onFinish: () => void;
}) {
  const [start] = useState(attackUpgrades);
  const [after, setAfter] = useState(0);
  const upgraded = attackUpgrades > start;

  if (upgraded || !canAfford) {
    const index = upgraded ? after : Math.max(1, after);
    const last = index === AFTER.length - 1;
    const step = AFTER[index];
    return (
      <GuideScene
        key={`upgrade-after-${index}`}
        stepKey={`upgrade-after-${index}`}
        line={step.line}
        icon={step.icon}
        dots={{ count: STEPS, index: index + 1 }}
        onTap={last ? undefined : () => setAfter(index + 1)}
        action={last ? { label: "알겠어!", onPress: onFinish } : undefined}
      />
    );
  }
  return (
    <GuideScene
      key="upgrade-0"
      stepKey="upgrade-0"
      line={"선물로 모은 **골드**로\n**공격력**을 강화해 보자!\n아래 강화 버튼을 눌러 봐."}
      icon={statIcons.attack}
      dots={{ count: STEPS, index: 0 }}
      onSkip={onFinish}
      targetId="upgrade-attack"
    />
  );
}
