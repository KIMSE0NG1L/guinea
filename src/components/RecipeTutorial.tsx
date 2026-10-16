import { useEffect, useState } from "react";
import { chef, food, frameImages, statIcons } from "../assets";
import { RECIPES } from "../state/recipes";
import { GuideScene } from "./TutorialOverlay";
import type { Tab } from "../types";

const FIRST_RECIPE = "green-jelly";
const STEPS = 7;

// Follows the intro tutorial: 모험기니 walks the player to the chef to buy their first
// recipe (말랑 초록 젤리 — the 초록 젤리 they start with is exactly what it needs), cooks it
// in the kitchen, then eats it into a battle food slot. Each step moves to the screen it
// talks about.
export function RecipeTutorial({
  knowsFirstRecipe,
  canCookFirst,
  onGoTo,
  onLearn,
  onCook,
  onEat,
  onFinish,
}: {
  knowsFirstRecipe: boolean;
  canCookFirst: boolean;
  onGoTo: (tab: Tab) => void;
  onLearn: (recipeId: string) => boolean;
  onCook: (recipeId: string) => void;
  onEat: (recipeId: string) => void;
  onFinish: () => void;
}) {
  const [step, setStep] = useState(0);
  const recipe = RECIPES.find((item) => item.id === FIRST_RECIPE)!;

  // A save that already has the recipe has nothing to buy here.
  useEffect(() => {
    if (knowsFirstRecipe) onFinish();
    // Only checked on arrival — learning it in step 1 is the point, not a reason to bail.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (step === 0) {
    return (
      <GuideScene
        stepKey="recipe-0"
        line={"요리하려면 먼저 **레시피**가\n필요해. **셰프 기니**한테\n배우러 가 보자!"}
        icon={chef.spoon}
        dots={{ count: STEPS, index: 0 }}
        action={{
          label: "레시피 상점 가기",
          onPress: () => {
            onGoTo("recipes");
            setStep(1);
          },
        }}
      />
    );
  }
  if (step === 1) {
    return (
      <GuideScene
        stepKey="recipe-1"
        line={`슬라임한테 받은 **초록 젤리**로\n만드는 **${recipe.name}**부터\n배워 보자!`}
        icon={recipe.image}
        dots={{ count: STEPS, index: 1 }}
        action={{
          label: `배우기 ${recipe.price} G`,
          accessibilityLabel: `${recipe.name} 레시피 ${recipe.price}골드에 배우기`,
          onPress: () => {
            onLearn(FIRST_RECIPE);
            setStep(2);
          },
        }}
      />
    );
  }
  if (step === 2) {
    return (
      <GuideScene
        stepKey="recipe-2"
        line={"배웠다! 이제 **부엌**에 가서\n직접 만들어 보자."}
        icon={food.cookPotTrim}
        dots={{ count: STEPS, index: 2 }}
        action={{
          label: "부엌으로",
          onPress: () => {
            onGoTo("kitchen");
            setStep(3);
          },
        }}
      />
    );
  }
  if (step === 3) {
    // An older save may not have the 초록 젤리 to hand — send them off to collect it instead.
    if (!canCookFirst) {
      return (
        <GuideScene
          stepKey="recipe-3-short"
          line={"앗, **초록 젤리**가 모자라네.\n슬라임을 잡아서 3개 모은 뒤\n요리해 봐!"}
          icon={recipe.image}
          dots={{ count: STEPS, index: 3 }}
          action={{ label: "알겠어!", onPress: onFinish }}
        />
      );
    }
    return (
      <GuideScene
        stepKey="recipe-3"
        line={`**초록 젤리** 3개로\n**${recipe.name}**를 만들어 보자!`}
        icon={recipe.image}
        dots={{ count: STEPS, index: 3 }}
        action={{
          label: "요리하기",
          onPress: () => {
            onCook(FIRST_RECIPE);
            setStep(4);
          },
        }}
      />
    );
  }
  if (step === 4) {
    return (
      <GuideScene
        stepKey="recipe-4"
        line={"완성! 요리는 **가방**에 담겼어.\n이제 전투 화면의 **음식 슬롯**에\n넣어 먹어 보자!"}
        icon={frameImages.slotPlus}
        dots={{ count: STEPS, index: 4 }}
        action={{
          label: "전투로",
          onPress: () => {
            onGoTo("battle");
            setStep(5);
          },
        }}
      />
    );
  }
  if (step === 5) {
    return (
      <GuideScene
        stepKey="recipe-5"
        line={`위에 있는 **+ 슬롯**을 누르면\n요리를 먹을 수 있어.\n**${recipe.name}**를 넣어 보자!`}
        icon={recipe.image}
        dots={{ count: STEPS, index: 5 }}
        action={{
          label: "슬롯에 넣기",
          onPress: () => {
            onEat(FIRST_RECIPE);
            setStep(6);
          },
        }}
      />
    );
  }
  return (
    <GuideScene
      stepKey="recipe-6"
      line={"냠! **공격력**이 올라갔어.\n슬롯의 시계가 다 돌면 버프가\n끝나니까, 그때 또 먹으면 돼."}
      icon={statIcons.attack}
      dots={{ count: STEPS, index: 6 }}
      action={{ label: "알겠어!", onPress: onFinish }}
    />
  );
}
