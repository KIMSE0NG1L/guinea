import { ITEMS_DICT } from "./items";
import { STAGES_DICT } from "./stages";
import { SYSTEMS_DICT } from "./systems";
import { BESTIARY_DICT } from "./bestiary";
import { COMICS_DICT } from "./comics";

// One merged Korean → English map for every data-file-sourced string (item/recipe
// names, stage names, skill/buff/quest text, bestiary stories, comic dialogue).
// Split into per-domain files above so independent translation passes don't collide
// on the same file; t() in engine.ts falls back to the Korean itself on a miss, so
// an incomplete domain never breaks anything.
export const DICT: Record<string, string> = {
  ...ITEMS_DICT,
  ...STAGES_DICT,
  ...SYSTEMS_DICT,
  ...BESTIARY_DICT,
  ...COMICS_DICT,
};
