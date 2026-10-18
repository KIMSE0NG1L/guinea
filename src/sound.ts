import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from "expo-audio";
import { sfx } from "./assets";

const MUTE_KEY = "gini.sfx.muted";
// Short effects can overlap themselves (a burst of auto-battle hits, several coin pickups
// in a row) — a pool per sound lets each play land on its own player instead of the next
// call cutting the previous one off.
const POOL_SIZE = 3;

type SfxKey = keyof typeof sfx;

setAudioModeAsync({ playsInSilentMode: true, interruptionMode: "mixWithOthers" }).catch(() => {});

const pools = (Object.keys(sfx) as SfxKey[]).reduce((acc, key) => {
  acc[key] = { players: Array.from({ length: POOL_SIZE }, () => createAudioPlayer(sfx[key])), next: 0 };
  return acc;
}, {} as Record<SfxKey, { players: AudioPlayer[]; next: number }>);

let muted = false;
const listeners = new Set<(muted: boolean) => void>();

AsyncStorage.getItem(MUTE_KEY)
  .then((raw) => {
    if (raw !== "1") return;
    muted = true;
    listeners.forEach((listener) => listener(muted));
  })
  .catch(() => {});

export function playSfx(key: SfxKey, volume = 1) {
  if (muted) return;
  const pool = pools[key];
  const player = pool.players[pool.next];
  pool.next = (pool.next + 1) % pool.players.length;
  player.volume = volume;
  player.seekTo(0);
  player.play();
}

export function isSfxMuted() {
  return muted;
}

export function setSfxMuted(value: boolean) {
  muted = value;
  listeners.forEach((listener) => listener(muted));
  AsyncStorage.setItem(MUTE_KEY, value ? "1" : "0").catch(() => {});
}

export function subscribeSfxMuted(listener: (muted: boolean) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useSfxMuted() {
  const [value, setValue] = useState(muted);
  useEffect(() => subscribeSfxMuted(setValue), []);
  return value;
}
