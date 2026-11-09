import { useEffect, useState } from "react";
import { AppState, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from "expo-audio";
import { bgm, bgmTitle, sfx } from "./assets";
import type { BgmGroupId } from "./state/stages";

const VOLUME_KEY = "gini.sfx.volume";
// A burst of auto-battle hits overlaps itself, so those sounds get a pool: each play lands on
// its own player instead of the next call cutting the previous one off. Everything else
// gets one player, since every player holds device audio resources for as long as it exists.
const OVERLAPPING_SFX_POOL_SIZE = 3;
const OVERLAPPING_SFX: readonly string[] = ["hit", "crit"];

export type SfxKey = keyof typeof sfx;

setAudioModeAsync({ playsInSilentMode: true, interruptionMode: "mixWithOthers" }).catch(() => {});

// This module can run more than once in the same app: in a dev build, editing it (or
// assets.ts, which it imports) re-runs it in place, and each run used to make a fresh music
// player while the previous one kept playing — two tracks on top of each other. Every player
// made here is recorded on globalThis, and the ones left over from an earlier run are
// stopped and released before new ones are made.
type AudioRegistry = { players: AudioPlayer[]; appState?: { remove: () => void } };
const registry = ((globalThis as { __giniAudio?: AudioRegistry }).__giniAudio ??= { players: [] });
// The earlier run's app-state listener would otherwise try to resume its released player.
registry.appState?.remove();
for (const stale of registry.players.splice(0)) {
  try {
    stale.pause();
    stale.release();
  } catch {
    // Already gone — nothing to stop.
  }
}
function makePlayer(source: Parameters<typeof createAudioPlayer>[0]) {
  const player = createAudioPlayer(source);
  registry.players.push(player);
  return player;
}

const pools = (Object.keys(sfx) as SfxKey[]).reduce((acc, key) => {
  const poolSize = OVERLAPPING_SFX.includes(key) ? OVERLAPPING_SFX_POOL_SIZE : 1;
  acc[key] = { players: Array.from({ length: poolSize }, () => makePlayer(sfx[key])), next: 0 };
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

// Hit sounds only while the battle is on screen: auto-battle keeps fighting behind every
// other page, and its hits clattering away under the kitchen or the shop is just noise.
const BATTLE_ONLY_SFX: SfxKey[] = ["hit", "crit"];
let battleVisible = true;
export function setBattleVisible(visible: boolean) {
  battleVisible = visible;
}

export function playSfx(key: SfxKey, volume = 1) {
  if (sfxVolume <= 0) return;
  if (!battleVisible && BATTLE_ONLY_SFX.includes(key)) return;
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

// Only the region groups with actual tracks in assets.ts's bgm object — not every
// BgmGroupId has one yet (see BGM_GROUP in stages.ts for the full region list).
type LoadedBgmGroup = keyof typeof bgm;
type BgmKind = "field" | "boss";

const FALLBACK_GROUP: LoadedBgmGroup = "countryside";

// One player for all music, swapping its source when the track changes. A player per track
// (21 of them, on top of the sfx pools) left the last ones created silent on Android: each
// player holds on to device audio resources from the moment it's created, even paused.
const bgmPlayer = makePlayer(bgmTitle);
bgmPlayer.loop = true;
let loadedBgmSource = bgmTitle;
// A track that can't play is otherwise just silence.
bgmPlayer.addListener("playbackStatusUpdate", (status) => {
  if (status.error) console.warn("BGM playback error:", status.error);
});
// The title screen plays its own theme instead of any region's, until the game starts.
let titleMode = true;

let bgmGroup: LoadedBgmGroup = FALLBACK_GROUP;
let bgmKind: BgmKind = "field";
let bgmVolume = DEFAULT_BGM_VOLUME;
let bgmStarted = false;
let appActive = AppState.currentState === "active";
// True while a full-screen rewarded ad is up: its own audio plays instead of ours.
let bgmSuspended = false;
const bgmListeners = new Set<(volume: number) => void>();

function applyBgmVolume() {
  bgmPlayer.volume = bgmVolume;
}
applyBgmVolume();

function syncBgm() {
  const source = titleMode ? bgmTitle : bgm[bgmGroup][bgmKind];
  if (source !== loadedBgmSource) {
    loadedBgmSource = source;
    bgmPlayer.replace(source);
    // Not documented to survive replace().
    bgmPlayer.loop = true;
    applyBgmVolume();
  }
  const shouldPlay = bgmStarted && bgmVolume > 0 && appActive && !bgmSuspended;
  if (shouldPlay) bgmPlayer.play();
  else bgmPlayer.pause();
}

// Every track change starts the new track from the top. Falls back to "countryside" for any
// region that doesn't have its own tracks yet.
export function setBgmTrack(group: BgmGroupId, boss: boolean) {
  const resolvedGroup: LoadedBgmGroup = group in bgm ? (group as LoadedBgmGroup) : FALLBACK_GROUP;
  const kind: BgmKind = boss ? "boss" : "field";
  if (resolvedGroup === bgmGroup && kind === bgmKind) return;
  bgmGroup = resolvedGroup;
  bgmKind = kind;
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

registry.appState = AppState.addEventListener("change", (status) => {
  appActive = status === "active";
  syncBgm();
});

// Off once the player taps past the title: the region's field/boss tracks take over.
export function setTitleBgm(on: boolean) {
  if (titleMode === on) return;
  titleMode = on;
  syncBgm();
}

// Silences the music while an ad plays (src/ads), and brings it back after.
export function setBgmSuspended(on: boolean) {
  if (bgmSuspended === on) return;
  bgmSuspended = on;
  syncBgm();
}

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
