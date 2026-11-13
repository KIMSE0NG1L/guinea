import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DICT } from "./dict";

export type Lang = "ko" | "en";

const LANGUAGE_KEY = "gini.language";

// Korean by default (the app's primary market); same persisted-singleton shape as
// haptics.ts/sound.ts, just for the language pick instead of a volume/toggle.
let language: Lang = "ko";
const listeners = new Set<(lang: Lang) => void>();

AsyncStorage.getItem(LANGUAGE_KEY)
  .then((raw) => {
    if (raw !== "ko" && raw !== "en") return;
    language = raw;
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
  return AsyncStorage.getItem(LANGUAGE_KEY).then((raw) => raw === "ko" || raw === "en");
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

// Translates a piece of in-game text to English when the app is in English mode,
// otherwise returns the Korean as-is. Two ways to call it:
//   t("고정 UI 문구", "Fixed UI copy") — the English is given right here, inline.
//   t(someRecipe.name) — looked up in DICT (src/i18n/dict/*.ts); falls back to the
//     Korean itself if a value from a data file (recipes/drops/bestiary/...) has no
//     entry yet, so a missing translation never breaks or hides anything.
export function t(ko: string, en?: string): string {
  if (language !== "en") return ko;
  if (en !== undefined) return en;
  return DICT[ko] ?? ko;
}
