import { Image, View } from "react-native";
import { RECIPE_TIERS, SEALED_RECIPE } from "../state/recipeTiers";
import type { Recipe } from "../state/recipes";

// A recipe card: its tier's blank scroll/book with the dish drawn onto the blank space.
// Hidden recipes stay a sealed scroll until learned.
export function RecipeArt({ recipe, size, sealed = false }: { recipe: Recipe; size: number; sealed?: boolean }) {
  if (sealed) {
    return <Image source={SEALED_RECIPE} style={{ width: size, height: size }} />;
  }
  const tier = RECIPE_TIERS[recipe.tier];
  const [x, y, w, h] = tier.dishArea;
  const dish = Math.min(w, h) * size;
  return (
    <View style={{ width: size, height: size }}>
      <Image source={tier.template} style={{ width: size, height: size }} />
      <Image
        source={recipe.image}
        style={{
          position: "absolute",
          width: dish,
          height: dish,
          left: (x + w / 2) * size - dish / 2,
          top: (y + h / 2) * size - dish / 2,
          transform: [{ rotate: `${tier.dishTilt}deg` }],
        }}
      />
    </View>
  );
}
