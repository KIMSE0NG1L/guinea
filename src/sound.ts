import { useEffect, useState } from "react";
import { AppState, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from "expo-audio";
import { bgm, sfx } from "./assets";

const VOLUME_KEY = "gini.sfx.volume";
// Short effects can overlap themselves (a burst of auto-battle hits, several coin pickups
// in a row) — a pool per sound lets each play land on its own player instead of the next
// call cutting the previous one off.
const POOL_SIZE = 3;

export type SfxKey = keyof typeof sfx;

setAudioModeAsync({ playsInSilentMode: true, interruptionMode: "mixWithOthers" }).catch(() => {});

const pools = (Object.keys(sfx) as SfxKey[]).reduce((acc, key) => {
  acc[key] = { players: Array.from({ length: POOL_SIZE }, () => createAudioPlayer(sfx[key])), next: 0 };
  return acc;
}, {} as Record<SfxKey, { players: AudioPlayer[]; next: number }>);

// User-facing master volume (0-1); 0 behaves like the old mute toggle. Kept apart from
// playSfx's own per-call `volume` (e.g. a quieter variant of one sound) — the two multiply.
let sfxVolume = 1;
const listeners = new Set<(volume: number) => void>();

AsyncStorage.getItem(VOLUME_KEY)
  .then((raw) => {
    const parsed = raw === null ? NaN : Number(raw);
    if (!Number.isFinite(parsed)) return;
    sfxVolume = Math.min(1, Math.max(0, parsed));
    listeners.forEach((listener) => listener(sfxVolume));
  })
  .catch(() => {});

export function playSfx(key: SfxKey, volume = 1) {
  if (sfxVolume <= 0) return;
  const pool = pools[key];
  const player = pool.players[pool.next];
  pool.next = (pool.next + 1) % pool.players.length;
  player.volume = volume * sfxVolume;
  player.seekTo(0);
  player.play();
}

export function getSfxVolume() {
  return sfxVolume;
}

export function setSfxVolume(value: number) {
  sfxVolume = Math.min(1, Math.max(0, value));
  listeners.forEach((listener) => listener(sfxVolume));
  AsyncStorage.setItem(VOLUME_KEY, String(sfxVolume)).catch(() => {});
}

export function subscribeSfxVolume(listener: (volume: number) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useSfxVolume() {
  const [value, setValue] = useState(sfxVolume);
  useEffect(() => subscribeSfxVolume(setValue), []);
  return value;
}

// --- Background music ---------------------------------------------------------------

const BGM_VOLUME_KEY = "gini.bgm.volume";
const DEFAULT_BGM_VOLUME = 0.35;

type BgmTrack = keyof typeof bgm;

const bgmPlayers = (Object.keys(bgm) as BgmTrack[]).reduce((acc, track) => {
  const player = createAudioPlayer(bgm[track]);
  player.loop = true;
  acc[track] = player;
  return acc;
}, {} as Record<BgmTrack, AudioPlayer>);

let bgmTrack: BgmTrack = "field";
let bgmVolume = DEFAULT_BGM_VOLUME;
let bgmStarted = false;
let appActive = AppState.currentState === "active";
const bgmListeners = new Set<(volume: number) => void>();

function applyBgmVolume() {
  (Object.keys(bgmPlayers) as BgmTrack[]).forEach((track) => {
    bgmPlayers[track].volume = bgmVolume;
  });
}
applyBgmVolume();

function syncBgm() {
  const shouldPlay = bgmStarted && bgmVolume > 0 && appActive;
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

AsyncStorage.getItem(BGM_VOLUME_KEY)
  .then((raw) => {
    const parsed = raw === null ? NaN : Number(raw);
    if (!Number.isFinite(parsed)) return;
    bgmVolume = Math.min(1, Math.max(0, parsed));
    applyBgmVolume();
    bgmListeners.forEach((listener) => listener(bgmVolume));
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

export function getBgmVolume() {
  return bgmVolume;
}

export function setBgmVolume(value: number) {
  bgmVolume = Math.min(1, Math.max(0, value));
  applyBgmVolume();
  bgmListeners.forEach((listener) => listener(bgmVolume));
  syncBgm();
  AsyncStorage.setItem(BGM_VOLUME_KEY, String(bgmVolume)).catch(() => {});
}

export function useBgmVolume() {
  const [value, setValue] = useState(bgmVolume);
  useEffect(() => {
    bgmListeners.add(setValue);
    return () => {
      bgmListeners.delete(setValue);
    };
  }, []);
  return value;
}
