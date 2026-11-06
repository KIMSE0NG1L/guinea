// Web (and anything without the AdMob native module): there is no ad to show, so every
// request reports "failed" and the caller falls back to handing the reward out anyway.
// iOS/Android load index.native.ts instead.

export type AdResult = "earned" | "dismissed" | "failed";

export function initAds() {}

export function showRewardedAd(): Promise<AdResult> {
  return Promise.resolve("failed");
}
