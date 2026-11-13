import { Platform } from "react-native";
import mobileAds, { AdEventType, InterstitialAd, RewardedAd, RewardedAdEventType, TestIds } from "react-native-google-mobile-ads";
import { requestTrackingPermissionsAsync } from "expo-tracking-transparency";
import { setBgmSuspended } from "../sound";

export type AdResult = "earned" | "dismissed" | "failed";

// Development builds always use Google's test unit: tapping real ads on your own device
// can get the AdMob account suspended. Release builds use the real "reward_main" units.
const REWARDED_UNIT_ID = __DEV__
  ? TestIds.REWARDED
  : Platform.select({
      ios: "ca-app-pub-7612859698236948/7276051796",
      default: "ca-app-pub-7612859698236948/9410426390",
    });

// Release interstitial units ("interstitial_main"); dev builds use Google's test unit.
const INTERSTITIAL_UNIT_ID = __DEV__
  ? TestIds.INTERSTITIAL
  : Platform.select({
      ios: "ca-app-pub-7612859698236948/7548136659",
      default: "ca-app-pub-7612859698236948/8661732764",
    });

// How long a button press waits for an ad that isn't loaded yet before giving up.
const LOAD_TIMEOUT_MS = 8000;
// A loaded rewarded ad goes stale after an hour; drop it a little before that.
const LOADED_AD_MAX_AGE_MS = 50 * 60 * 1000;

let initPromise: Promise<unknown> | null = null;
// One ad kept loaded ahead of time, so pressing "광고 보기" usually starts it at once.
let preloaded: { ad: RewardedAd; loadedAt: number } | null = null;
let preloading: Promise<RewardedAd | null> | null = null;
let showing = false;
// Why the last ad couldn't be loaded or shown (e.g. "no-fill", "timeout"), shown small on the
// "no ad right now" panel so a missing ad can be diagnosed from a release build.
let lastAdError: string | null = null;
// When the last full-screen ad of either kind closed, so an interstitial never follows one
// the player just watched.
let lastAdClosedAt = 0;

// Whether a full-screen ad is up right now, for the game to pause under it (see subscribeAdShowing).
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

function describeError(error: unknown) {
  const code = (error as { code?: unknown } | null)?.code;
  const text = typeof code === "string" ? code : error instanceof Error ? error.message : String(error);
  return text.replace(/^googleMobileAds\//, "").slice(0, 60);
}

export function initAds() {
  if (!initPromise) {
    // Apple requires the ATT prompt before any IDFA-dependent SDK init; the SDK then
    // serves personalized or non-personalized ads based on the user's answer on its own.
    initPromise = requestTrackingPermissionsAsync()
      .catch(() => null)
      .then(() => mobileAds().initialize())
      .catch(() => null);
    initPromise.then(() => {
      preload();
      preloadInterstitial();
    });
  }
  return initPromise;
}

function loadAd(timeoutMs: number): Promise<RewardedAd | null> {
  return new Promise((resolve) => {
    const ad = RewardedAd.createForAdRequest(REWARDED_UNIT_ID);
    let settled = false;
    const finish = (result: RewardedAd | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      offLoaded();
      offError();
      resolve(result);
    };
    const offLoaded = ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
      lastAdError = null;
      finish(ad);
    });
    const offError = ad.addAdEventListener(AdEventType.ERROR, (error) => {
      lastAdError = describeError(error);
      finish(null);
    });
    const timer = setTimeout(() => {
      lastAdError = "timeout";
      finish(null);
    }, timeoutMs);
    ad.load();
  });
}

function preload() {
  if (preloaded || preloading) return preloading;
  // Background preloads may take their time; only a button press waits on LOAD_TIMEOUT_MS.
  preloading = loadAd(60000).then((ad) => {
    preloading = null;
    if (ad) preloaded = { ad, loadedAt: Date.now() };
    return ad;
  });
  return preloading;
}

async function takeLoadedAd(): Promise<RewardedAd | null> {
  if (preloaded && Date.now() - preloaded.loadedAt < LOADED_AD_MAX_AGE_MS) {
    const { ad } = preloaded;
    preloaded = null;
    return ad;
  }
  preloaded = null;
  if (preloading) {
    const ad = await Promise.race([preloading, new Promise<null>((resolve) => setTimeout(() => resolve(null), LOAD_TIMEOUT_MS))]);
    // A timed-out preload still lands in `preloaded` later, ready for the next press.
    if (ad) preloaded = null;
    return ad;
  }
  return loadAd(LOAD_TIMEOUT_MS);
}

// Shows one rewarded ad. "earned": watched to the reward point, hand the reward out.
// "dismissed": closed early, no reward. "failed": nothing could be loaded or shown
// (offline, no fill yet), and the caller decides what to do instead.
export async function showRewardedAd(): Promise<AdResult> {
  if (showing) return "failed";
  showing = true;
  try {
    await initAds();
    const ad = await takeLoadedAd();
    if (!ad) return "failed";
    return await new Promise<AdResult>((resolve) => {
      let earned = false;
      const offs = [
        ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
          earned = true;
        }),
        ad.addAdEventListener(AdEventType.CLOSED, () => done(earned ? "earned" : "dismissed")),
        ad.addAdEventListener(AdEventType.ERROR, (error) => {
          lastAdError = describeError(error);
          done(earned ? "earned" : "failed");
        }),
      ];
      const done = (result: AdResult) => {
        offs.forEach((off) => off());
        setBgmSuspended(false);
        setAdShowing(false);
        lastAdClosedAt = Date.now();
        resolve(result);
      };
      setBgmSuspended(true);
      setAdShowing(true);
      ad.show().catch((error) => {
        lastAdError = describeError(error);
        done("failed");
      });
    });
  } finally {
    showing = false;
    // Line up the next one in the background.
    preload();
  }
}

// ---- Interstitials ----
// Only ever loaded in the background: if one isn't ready at the moment it's due, that
// moment is simply skipped (the player is never made to wait for an ad they didn't ask for).
let interstitial: { ad: InterstitialAd; loadedAt: number } | null = null;
let interstitialLoading = false;

function preloadInterstitial() {
  if (!INTERSTITIAL_UNIT_ID || interstitial || interstitialLoading) return;
  interstitialLoading = true;
  const ad = InterstitialAd.createForAdRequest(INTERSTITIAL_UNIT_ID);
  const offs = [
    ad.addAdEventListener(AdEventType.LOADED, () => {
      offs.forEach((off) => off());
      interstitialLoading = false;
      interstitial = { ad, loadedAt: Date.now() };
    }),
    ad.addAdEventListener(AdEventType.ERROR, () => {
      offs.forEach((off) => off());
      interstitialLoading = false;
    }),
  ];
  ad.load();
}

// Shows the preloaded interstitial if there is one; resolves true once it was shown and closed.
export async function showInterstitial(): Promise<boolean> {
  if (showing) return false;
  const ready = interstitial && Date.now() - interstitial.loadedAt < LOADED_AD_MAX_AGE_MS ? interstitial.ad : null;
  interstitial = null;
  if (!ready) {
    preloadInterstitial();
    return false;
  }
  showing = true;
  try {
    return await new Promise<boolean>((resolve) => {
      const offs = [
        ready.addAdEventListener(AdEventType.CLOSED, () => done(true)),
        ready.addAdEventListener(AdEventType.ERROR, () => done(false)),
      ];
      const done = (shown: boolean) => {
        offs.forEach((off) => off());
        setBgmSuspended(false);
        setAdShowing(false);
        if (shown) lastAdClosedAt = Date.now();
        resolve(shown);
      };
      setBgmSuspended(true);
      setAdShowing(true);
      ready.show().catch(() => done(false));
    });
  } finally {
    showing = false;
    preloadInterstitial();
  }
}
