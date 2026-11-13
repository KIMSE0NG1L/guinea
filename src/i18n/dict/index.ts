import { ITEMS_DICT } from "./items";
import { STAGES_DICT } from "./stages";
import { SYSTEMS_DICT } from "./systems";
import { BESTIARY_DICT } from "./bestiary";
import { COMICS_DICT } from "./comics";

import { ITEMS_DICT_JA } from "./items.ja";
import { STAGES_DICT_JA } from "./stages.ja";
import { SYSTEMS_DICT_JA } from "./systems.ja";
import { BESTIARY_DICT_JA } from "./bestiary.ja";
import { COMICS_DICT_JA } from "./comics.ja";
import { UI_DICT_JA } from "./ui.ja";

import { ITEMS_DICT_ZH } from "./items.zh";
import { STAGES_DICT_ZH } from "./stages.zh";
import { SYSTEMS_DICT_ZH } from "./systems.zh";
import { BESTIARY_DICT_ZH } from "./bestiary.zh";
import { COMICS_DICT_ZH } from "./comics.zh";
import { UI_DICT_ZH } from "./ui.zh";

// One merged Korean → English map for every data-file-sourced string (item/recipe
// names, stage names, skill/buff/quest text, bestiary stories, comic dialogue).
// Split into per-domain files above so independent translation passes don't collide
// on the same file; t() in engine.ts falls back to the Korean itself on a miss, so
// an incomplete domain never breaks anything. English's ad-hoc UI copy (buttons,
// labels, tutorial lines, ...) isn't here — it's given inline at each t(ko, en) call
// site instead, which is why there's no UI_DICT for English.
export const DICT_EN: Record<string, string> = {
  ...ITEMS_DICT,
  ...STAGES_DICT,
  ...SYSTEMS_DICT,
  ...BESTIARY_DICT,
  ...COMICS_DICT,
};

// Japanese/Chinese cover the same data domains PLUS a `ui` domain for the ad-hoc copy
// that English keeps inline — ja/zh always look text up by its Korean key (see t() in
// engine.ts), so that copy needs a dictionary entry regardless of how it was written.
export const DICT_JA: Record<string, string> = {
  ...ITEMS_DICT_JA,
  ...STAGES_DICT_JA,
  ...SYSTEMS_DICT_JA,
  ...BESTIARY_DICT_JA,
  ...COMICS_DICT_JA,
  ...UI_DICT_JA,
};

export const DICT_ZH: Record<string, string> = {
  ...ITEMS_DICT_ZH,
  ...STAGES_DICT_ZH,
  ...SYSTEMS_DICT_ZH,
  ...BESTIARY_DICT_ZH,
  ...COMICS_DICT_ZH,
  ...UI_DICT_ZH,
};
