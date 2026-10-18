import { useEffect, useState } from "react";
import { AppState, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from "expo-audio";
import { bgm, sfx } from "./assets";

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

// --- Background music ---------------------------------------------------------------

const BGM_MUTE_KEY = "gini.bgm.muted";
const BGM_VOLUME = 0.35;

type BgmTrack = keyof typeof bgm;

const bgmPlayers = (Object.keys(bgm) as BgmTrack[]).reduce((acc, track) => {
  const player = createAudioPlayer(bgm[track]);
  player.loop = true;
  player.volume = BGM_VOLUME;
  acc[track] = player;
  return acc;
}, {} as Record<BgmTrack, AudioPlayer>);

let bgmTrack: BgmTrack = "field";
let bgmMuted = false;
let bgmStarted = false;
let appActive = AppState.currentState === "active";
const bgmListeners = new Set<(muted: boolean) => void>();

function syncBgm() {
  const shouldPlay = bgmStarted && !bgmMuted && appActive;
  (Object.keys(bgmPlayers) as BgmTrack[]).forEach((track) => {
    if (shouldPlay && track === bgmTrack) bgmPlayers[track].play();
    else bgmPlayers[track].pause();
  });
}

// The boss theme restarts from the top on every boss; the field theme picks up where it
// left off once the boss is down.
export function setBgmTrack(track: BgmTrack) {
  if (track === bgmTrack) return;
  bgmTrack = track;
  if (track === "boss") bgmPlayers.boss.seekTo(0);
  syncBgm();
}

AsyncStorage.getItem(BGM_MUTE_KEY)
  .then((raw) => {
    if (raw !== "1") return;
    bgmMuted = true;
    bgmListeners.forEach((listener) => listener(bgmMuted));
    syncBgm();
  })
  .catch(() => {});

AppState.addEventListener("change", (status) => {
  appActive = status === "active";
  syncBgm();
});

export function startBgm() {
  bgmStarted = true;
  syncBgm();
  // Browsers block audio until the first user gesture — retry on the first tap.
  if (Platform.OS === "web" && typeof document !== "undefined") {
    document.addEventListener("pointerdown", syncBgm, { once: true });
  }
}

export function setBgmMuted(value: boolean) {
  bgmMuted = value;
  bgmListeners.forEach((listener) => listener(bgmMuted));
  syncBgm();
  AsyncStorage.setItem(BGM_MUTE_KEY, value ? "1" : "0").catch(() => {});
}

export function useBgmMuted() {
  const [value, setValue] = useState(bgmMuted);
  useEffect(() => {
    bgmListeners.add(setValue);
    return () => {
      bgmListeners.delete(setValue);
    };
  }, []);
  return value;
}
