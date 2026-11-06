import { Platform } from "react-native";
import mobileAds, { AdEventType, RewardedAd, RewardedAdEventType, TestIds } from "react-native-google-mobile-ads";
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

// How long a button press waits for an ad that isn't loaded yet before giving up.
const LOAD_TIMEOUT_MS = 8000;
// A loaded rewarded ad goes stale after an hour; drop it a little before that.
const LOADED_AD_MAX_AGE_MS = 50 * 60 * 1000;

let initPromise: Promise<unknown> | null = null;
// One ad kept loaded ahead of time, so pressing "광고 보기" usually starts it at once.
let preloaded: { ad: RewardedAd; loadedAt: number } | null = null;
let preloading: Promise<RewardedAd | null> | null = null;
let showing = false;

export function initAds() {
  if (!initPromise) {
    initPromise = mobileAds()
      .initialize()
      .catch(() => null);
    initPromise.then(() => preload());
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
    const offLoaded = ad.addAdEventListener(RewardedAdEventType.LOADED, () => finish(ad));
    const offError = ad.addAdEventListener(AdEventType.ERROR, () => finish(null));
    const timer = setTimeout(() => finish(null), timeoutMs);
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
        ad.addAdEventListener(AdEventType.ERROR, () => done(earned ? "earned" : "failed")),
      ];
      const done = (result: AdResult) => {
        offs.forEach((off) => off());
        setBgmSuspended(false);
        resolve(result);
      };
      setBgmSuspended(true);
      ad.show().catch(() => done("failed"));
    });
  } finally {
    showing = false;
    // Line up the next one in the background.
    preload();
  }
}
