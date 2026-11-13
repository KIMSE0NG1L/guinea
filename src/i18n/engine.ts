import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DICT_EN, DICT_JA, DICT_ZH } from "./dict";

export type Lang = "ko" | "en" | "ja" | "zh";

const LANGUAGE_KEY = "gini.language";
const VALID_LANGS: Lang[] = ["ko", "en", "ja", "zh"];

// Korean by default (the app's primary market); same persisted-singleton shape as
// haptics.ts/sound.ts, just for the language pick instead of a volume/toggle.
let language: Lang = "ko";
const listeners = new Set<(lang: Lang) => void>();

AsyncStorage.getItem(LANGUAGE_KEY)
  .then((raw) => {
    if (!VALID_LANGS.includes(raw as Lang)) return;
    language = raw as Lang;
    listeners.forEach((listener) => listener(language));
  })
  .catch(() => {});

export function getLanguage() {
  return language;
}

// True once the player has ever picked a language (manually in Settings, or on the
// first-launch language screen) — false means this is a cold install, before anything's
// been chosen or saved. See App.tsx's language-select gate.
export function hasChosenLanguage(): Promise<boolean> {
  return AsyncStorage.getItem(LANGUAGE_KEY).then((raw) => VALID_LANGS.includes(raw as Lang));
}

export function setLanguage(value: Lang) {
  language = value;
  listeners.forEach((listener) => listener(language));
  AsyncStorage.setItem(LANGUAGE_KEY, value).catch(() => {});
}

export function useLanguage() {
  const [value, setValue] = useState(language);
  useEffect(() => {
    listeners.add(setValue);
    return () => {
      listeners.delete(setValue);
    };
  }, []);
  return value;
}

// Translates a piece of in-game text. Three ways to call it:
//   t("고정 UI 문구", "Fixed UI copy") — the English is given right here, inline.
//   t(someRecipe.name) — looked up by the Korean key in src/i18n/dict/*.ts.
//   t(`공격력 +${n}%`, `Attack +${n}%`, `攻撃力 +${n}%`, `攻击力 +${n}%`) — for TEMPLATED/
//     interpolated text (a number baked in at the call site): a dictionary can't match a
//     string that varies per call, so ja/zh need their own literal translation right here
//     too, same as en. Used sparingly, only for the handful of high-traffic templates
//     (buff/effect labels, quest progress lines, ...) — most calls only ever need `en`.
// Japanese and Chinese otherwise ALWAYS go through their dictionaries (src/i18n/dict/
// *.ja.ts / *.zh.ts), keyed by the same Korean text, regardless of which form the call
// uses — so a two-arg call's English-only `en` still gets a ja/zh translation once one
// exists. Any missing entry falls back to the explicit `ja`/`zh` arg if given, else to
// English, then to the Korean itself, so nothing ever breaks or goes blank while a
// dictionary (or a template's ja/zh args) is incomplete.
export function t(ko: string, en?: string, ja?: string, zh?: string): string {
  switch (language) {
    case "ko":
      return ko;
    case "en":
      return en !== undefined ? en : (DICT_EN[ko] ?? ko);
    case "ja":
      return ja !== undefined ? ja : (DICT_JA[ko] ?? en ?? ko);
    case "zh":
      return zh !== undefined ? zh : (DICT_ZH[ko] ?? en ?? ko);
    default:
      return ko;
  }
}
