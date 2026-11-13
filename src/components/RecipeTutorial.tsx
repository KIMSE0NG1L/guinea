import { useState } from "react";
import { food, frameImages, statIcons } from "../assets";
import { RECIPES } from "../state/recipes";
import { GuideScene } from "./TutorialOverlay";
import type { Tab } from "../types";
import { t } from "../i18n";

const FIRST_RECIPE = "green-jelly";
const STEPS = 9;

// Starts once 3 초록 젤리 have been gathered from slimes. 모험기니 walks the player from the
// bag to the chef, has them buy 말랑 초록 젤리, cook it and eat it into a food slot.
// Wherever a button has to be pressed, the guide points an arrow at the real one and waits;
// pure explanations move the game to the page they describe.
//
// The step isn't stored — it's read off the game each render (which page is open, whether
// the recipe is known, whether a dish got cooked or eaten), so it can't drift out of sync
// with what the player actually did.
export function RecipeTutorial({
  tab,
  knowsFirstRecipe,
  canCookFirst,
  dishesCooked,
  firstDishPot,
  dishesEaten,
  freeSlotIndex,
  onGoTo,
  onFinish,
}: {
  tab: Tab;
  knowsFirstRecipe: boolean;
  canCookFirst: boolean;
  dishesCooked: number;
  // Which kitchen pot the first dish went into (-1 = none).
  firstDishPot: number;
  dishesEaten: number;
  freeSlotIndex: number;
  onGoTo: (tab: Tab) => void;
  onFinish: () => void;
}) {
  const recipe = RECIPES.find((item) => item.id === FIRST_RECIPE)!;
  // Counted from when the tutorial appeared, so earlier cooking doesn't skip steps.
  const [start] = useState({ cooked: dishesCooked, eaten: dishesEaten });
  const cooked = dishesCooked > start.cooked;
  const eaten = dishesEaten > start.eaten;

  const scene = (index: number, props: Omit<Parameters<typeof GuideScene>[0], "stepKey" | "dots">) => (
    <GuideScene key={index} stepKey={index} dots={{ count: STEPS, index }} onSkip={index < STEPS - 1 ? onFinish : undefined} {...props} />
  );

  if (eaten) {
    return scene(8, {
      topic: { feature: t("요리", "Cooking"), detail: t("음식 버프", "Food Buff") },
      line: t(
        "냠! **공격력**이 올라갔어.\n슬롯의 시계가 다 돌면 버프가\n끝나니까, 그때 또 먹으면 돼.",
        "Yum! Your **attack power** went up.\nWhen the slot's clock runs out the buff\nends — just eat another one then.",
      ),
      icon: statIcons.attack,
      action: { label: t("알겠어!", "Got it!"), onPress: onFinish },
    });
  }
  if (cooked) {
    if (tab !== "battle") {
      return scene(6, {
      topic: { feature: t("요리", "Cooking"), detail: t("전투로 돌아가기", "Back to Battle") },
        line: t(
          "완성! 요리는 **가방**에 담겼어.\n아래 **전투** 버튼을 눌러\n먹으러 가자!",
          "Done! The dish went into your **bag**.\nTap the **Battle** button below\nto go eat it!",
        ),
        icon: recipe.image,
        targetId: "nav-battle",
      });
    }
    return scene(7, {
      topic: { feature: t("요리", "Cooking"), detail: t("음식 먹기", "Eating Food") },
      line: t(`빈 **음식 슬롯**을 눌러서\n**${recipe.name}**를 먹어 봐!`, `Tap an empty **food slot**\nto eat **${t(recipe.name)}**!`),
      icon: frameImages.slotPlus,
      targetId: `buff-slot-${freeSlotIndex}`,
    });
  }
  // Checked before canCookFirst below — starting the dish used the jelly up, which would
  // otherwise read as "not enough jelly".
  if (firstDishPot >= 0) {
    return scene(5, {
      topic: { feature: t("요리", "Cooking"), detail: t("마무리하기", "Finishing Up") },
      line: t("다 됐다! **냄비**를 눌러서\n타이밍 맞춰 마무리해 봐.", "It's ready! Tap the **pot**\nand finish it with good timing."),
      icon: food.cookPotTrim,
      targetId: `cook-pot-${firstDishPot}`,
    });
  }
  if (knowsFirstRecipe) {
    if (tab !== "kitchen") {
      return scene(4, {
      topic: { feature: t("요리", "Cooking"), detail: t("부엌으로 돌아가기", "Back to the Kitchen") },
        line: t("배웠다! 이제 **부엌**으로\n돌아가서 직접 만들어 보자.", "Learned it! Now let's head back\nto the **kitchen** and cook it ourselves."),
        icon: food.cookPotTrim,
        targetId: "shop-back",
      });
    }
    if (!canCookFirst) {
      return scene(5, {
      topic: { feature: t("요리", "Cooking"), detail: t("요리하기", "Cooking") },
        line: t(
          "앗, **초록 젤리**가 모자라네.\n슬라임을 잡아서 3개 모은 뒤\n요리해 봐!",
          "Oops, you're short on **Green Jelly**.\nDefeat slimes until you have 3,\nthen come cook!",
        ),
        icon: recipe.image,
        action: { label: t("알겠어!", "Got it!"), onPress: onFinish },
      });
    }
    return scene(5, {
      topic: { feature: t("요리", "Cooking"), detail: t("요리하기", "Cooking") },
      line: t(`**요리하기**를 눌러서\n**${recipe.name}**를\n만들어 봐!`, `Tap **Cook**\nto make\n**${t(recipe.name)}**!`),
      icon: recipe.image,
      targetId: `cook-${FIRST_RECIPE}`,
    });
  }
  if (tab === "recipes") {
    return scene(3, {
      topic: { feature: t("요리", "Cooking"), detail: t("레시피 배우기", "Learning a Recipe") },
      line: t(
        `**${recipe.name}** 레시피를\n배워 보자! 레시피 값은\n내가 **골드**로 챙겨 줬어.`,
        `Let's learn the **${t(recipe.name)}**\nrecipe! I covered the recipe's\ncost with **gold** for you.`,
      ),
      icon: recipe.image,
      targetId: `learn-${FIRST_RECIPE}`,
    });
  }
  if (tab === "kitchen") {
    return scene(2, {
      topic: { feature: t("요리", "Cooking"), detail: t("부엌 둘러보기", "Looking Around the Kitchen") },
      line: t(
        "여기는 **기니의 부엌**이야.\n**레시피** 버튼을 눌러\n셰프한테 배우러 가자!",
        "This is **Gini's Kitchen**.\nTap the **Recipes** button\nto go learn from the chef!",
      ),
      icon: food.cookPotTrim,
      targetId: "kitchen-recipes",
    });
  }
  if (tab === "inventory") {
    return scene(1, {
      topic: { feature: t("요리", "Cooking"), detail: t("재료 살펴보기", "Checking Ingredients") },
      line: t(
        "슬라임한테 모은 **초록 젤리**야.\n이걸로 요리를 할 수 있는데,\n먼저 **레시피**가 필요해.",
        "This is **Green Jelly** gathered\nfrom slimes. You can cook with it,\nbut first you need a **recipe**.",
      ),
      icon: food.greenJelly,
      targetId: "bag-item-초록 젤리",
      showcase: true,
      onTap: () => onGoTo("kitchen"),
    });
  }
  return scene(0, {
      topic: { feature: t("요리", "Cooking"), detail: t("가방 열기", "Opening the Bag") },
    line: t("**초록 젤리**를 3개나 모았어!\n**가방**을 열어 볼까?", "You've gathered 3 **Green Jelly**!\nShall we open the **bag**?"),
    icon: food.greenJelly,
    targetId: "bag",
  });
}
