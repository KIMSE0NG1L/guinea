import { Platform } from "react-native";
import {
  LevelPlay,
  LevelPlayInitRequest,
  LevelPlayRewardedAd,
  LevelPlayInterstitialAd,
} from "unity-levelplay-mediation";
import type { LevelPlayAdError } from "unity-levelplay-mediation";
import { requestTrackingPermissionsAsync } from "expo-tracking-transparency";
import { setBgmSuspended } from "../sound";

export type AdResult = "earned" | "dismissed" | "failed";

// Unity LevelPlay (ironSource's successor) — Android and iOS are registered as separate apps in
// the dashboard, each with its own numeric Game ID (used as the SDK init key) and its own
// placement IDs (used directly as ad unit IDs — the unified dashboard has no separate "ad unit
// ID" distinct from the placement).
const APP_KEY = Platform.select({
  ios: "800436671",
  default: "800436672",
})!;
const REWARDED_UNIT_ID = Platform.select({
  ios: "BP_Rewarded_iOS",
  default: "BP_Rewarded_Android",
})!;
const INTERSTITIAL_UNIT_ID = Platform.select({
  ios: "BP_Interstitial_iOS",
  default: "BP_Interstitial_Android",
})!;

// How long a button press waits for a rewarded ad that isn't loaded yet before giving up.
const LOAD_TIMEOUT_MS = 8000;

let initPromise: Promise<unknown> | null = null;
let showing = false;
// Why the last ad couldn't be loaded or shown, shown small on the "no ad right now" panel so a
// missing ad can be diagnosed from a release build.
let lastAdError: string | null = null;
// When the last full-screen ad of either kind closed, so an interstitial never follows one the
// player just watched.
let lastAdClosedAt = 0;

// Whether a full-screen ad is up right now, for the game to pause under it.
const adShowingListeners = new Set<(showing: boolean) => void>();
function setAdShowing(showing: boolean) {
  adShowingListeners.forEach((listener) => listener(showing));
}
export function subscribeAdShowing(listener: (showing: boolean) => void) {
  adShowingListeners.add(listener);
  return () => {
    adShowingListeners.delete(listener);
  };
}

export function msSinceLastAd() {
  return lastAdClosedAt === 0 ? Infinity : Date.now() - lastAdClosedAt;
}

export function getLastAdError() {
  return lastAdError;
}

function describeError(error: LevelPlayAdError | null | undefined) {
  const text = error?.errorMessage || `code ${error?.errorCode ?? "unknown"}`;
  return text.slice(0, 60);
}

function finishShowing() {
  showing = false;
  setBgmSuspended(false);
  setAdShowing(false);
}

// One long-lived ad object per format, reused across loads for the whole session (LevelPlay's
// own object manager keeps a single native ad behind each instance and reloads it in place).
const rewardedAd = new LevelPlayRewardedAd(REWARDED_UNIT_ID);
const interstitialAd = new LevelPlayInterstitialAd(INTERSTITIAL_UNIT_ID);

// ---- Rewarded ----
let rewardedLoading = false;
let pendingRewardedWait: ((ready: boolean) => void) | null = null;
let pendingRewardedShow: ((result: AdResult) => void) | null = null;
let rewardEarned = false;

function loadRewarded() {
  if (rewardedLoading) return;
  rewardedLoading = true;
  rewardedAd.loadAd();
}

async function waitForRewardedReady(timeoutMs: number): Promise<boolean> {
  if (await rewardedAd.isAdReady()) return true;
  loadRewarded();
  return new Promise((resolve) => {
    let settled = false;
    const finish = (ready: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      pendingRewardedWait = null;
      resolve(ready);
    };
    pendingRewardedWait = finish;
    const timer = setTimeout(() => finish(false), timeoutMs);
  });
}

// ---- Interstitials ----
// Only ever loaded in the background: if one isn't ready at the moment it's due, that moment is
// simply skipped (the player is never made to wait for an ad they didn't ask for).
let interstitialLoading = false;
let pendingInterstitialShow: ((shown: boolean) => void) | null = null;

function loadInterstitial() {
  if (interstitialLoading) return;
  interstitialLoading = true;
  interstitialAd.loadAd();
}

export function initAds() {
  if (!initPromise) {
    rewardedAd.setListener({
      onAdLoaded: () => {
        rewardedLoading = false;
        lastAdError = null;
        pendingRewardedWait?.(true);
      },
      onAdLoadFailed: (error) => {
        rewardedLoading = false;
        lastAdError = describeError(error);
        pendingRewardedWait?.(false);
      },
      onAdDisplayed: () => {},
      onAdRewarded: () => {
        rewardEarned = true;
      },
      onAdClosed: () => {
        finishShowing();
        lastAdClosedAt = Date.now();
        const resolve = pendingRewardedShow;
        pendingRewardedShow = null;
        resolve?.(rewardEarned ? "earned" : "dismissed");
        loadRewarded();
      },
      onAdDisplayFailed: (error) => {
        lastAdError = describeError(error);
        finishShowing();
        const resolve = pendingRewardedShow;
        pendingRewardedShow = null;
        resolve?.(rewardEarned ? "earned" : "failed");
        loadRewarded();
      },
    });

    interstitialAd.setListener({
      onAdLoaded: () => {
        interstitialLoading = false;
      },
      onAdLoadFailed: () => {
        interstitialLoading = false;
      },
      onAdDisplayed: () => {},
      onAdClosed: () => {
        finishShowing();
        lastAdClosedAt = Date.now();
        const resolve = pendingInterstitialShow;
        pendingInterstitialShow = null;
        resolve?.(true);
        loadInterstitial();
      },
      onAdDisplayFailed: () => {
        finishShowing();
        const resolve = pendingInterstitialShow;
        pendingInterstitialShow = null;
        resolve?.(false);
        loadInterstitial();
      },
    });

    // Apple requires the ATT prompt before any IDFA-dependent SDK init; the SDK then serves
    // personalized or non-personalized ads based on the user's answer on its own.
    initPromise = requestTrackingPermissionsAsync()
      .catch(() => null)
      .then(
        () =>
          new Promise<void>((resolve) => {
            LevelPlay.init(LevelPlayInitRequest.builder(APP_KEY).build(), {
              onInitSuccess: () => resolve(),
              onInitFailed: () => resolve(),
            });
          }),
      )
      .catch(() => null);
    initPromise.then(() => {
      loadRewarded();
      loadInterstitial();
    });
  }
  return initPromise;
}

// Shows one rewarded ad. "earned": watched to the reward point, hand the reward out.
// "dismissed": closed early, no reward. "failed": nothing could be loaded or shown (offline, no
// fill yet), and the caller decides what to do instead.
export async function showRewardedAd(): Promise<AdResult> {
  if (showing) return "failed";
  await initAds();
  const ready = await waitForRewardedReady(LOAD_TIMEOUT_MS);
  if (!ready) return "failed";
  showing = true;
  rewardEarned = false;
  return new Promise<AdResult>((resolve) => {
    pendingRewardedShow = resolve;
    setBgmSuspended(true);
    setAdShowing(true);
    rewardedAd.showAd();
  });
}

// Opens Unity's Test Suite debug screen: shows fake test ads (not real ones) per ad unit, so
// integration can be checked (does init succeed, does each placement load) without any risk of
// tapping a real ad. Dev-build only, wired to a hidden settings button (see SettingsModal).
export function launchAdTestSuite() {
  initAds().then(() => LevelPlay.launchTestSuite());
}

// Shows the preloaded interstitial if there is one; resolves true once it was shown and closed.
export async function showInterstitial(): Promise<boolean> {
  if (showing) return false;
  if (!(await interstitialAd.isAdReady())) {
    loadInterstitial();
    return false;
  }
  showing = true;
  return new Promise<boolean>((resolve) => {
    pendingInterstitialShow = resolve;
    setBgmSuspended(true);
    setAdShowing(true);
    interstitialAd.showAd();
  });
}
