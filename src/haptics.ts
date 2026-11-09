import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";

const HAPTICS_KEY = "gini.haptics.enabled";

// On by default; same persisted-boolean shape as sound.ts's volumes, just without a dial —
// haptics only ever need an on/off.
let hapticsEnabled = true;
const listeners = new Set<(enabled: boolean) => void>();

AsyncStorage.getItem(HAPTICS_KEY)
  .then((raw) => {
    if (raw === null) return;
    hapticsEnabled = raw === "1";
    listeners.forEach((listener) => listener(hapticsEnabled));
  })
  .catch(() => {});

export function getHapticsEnabled() {
  return hapticsEnabled;
}

export function setHapticsEnabled(value: boolean) {
  hapticsEnabled = value;
  listeners.forEach((listener) => listener(hapticsEnabled));
  AsyncStorage.setItem(HAPTICS_KEY, value ? "1" : "0").catch(() => {});
}

export function useHapticsEnabled() {
  const [value, setValue] = useState(hapticsEnabled);
  useEffect(() => {
    listeners.add(setValue);
    return () => {
      listeners.delete(setValue);
    };
  }, []);
  return value;
}

export type HapticKey = "hit" | "crit" | "claim" | "streak";

// Every call swallows its own rejection — Haptics silently no-ops on web without vibration
// hardware, iOS Low Power Mode, etc., and a thrown promise there shouldn't surface anywhere.
export function playHaptic(key: HapticKey) {
  if (!hapticsEnabled) return;
  switch (key) {
    case "hit":
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      break;
    case "crit":
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      break;
    case "streak":
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid).catch(() => {});
      break;
    case "claim":
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      break;
  }
}
