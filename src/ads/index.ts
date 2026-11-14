// Web (and anything without the Unity LevelPlay native module): there is no ad to show, so every
// request reports "failed" and the caller falls back to handing the reward out anyway.
// iOS/Android load index.native.ts instead.

export type AdResult = "earned" | "dismissed" | "failed";

// Returns a resolved promise (not void) so callers that do `initAds().then((success) => ...)` —
// needed because the native module's initAds() is genuinely async and resolves with whether
// LevelPlay.init() succeeded — type-check here too; plain `tsc` doesn't know about the
// .native.ts platform convention and resolves imports to this file.
export function initAds(): Promise<boolean> {
  return Promise.resolve(true);
}

export function getLastAdError(): string | null {
  return null;
}

export function subscribeAdShowing(listener: (showing: boolean) => void) {
  void listener;
  return () => {};
}

export function msSinceLastAd() {
  return Infinity;
}

export function showInterstitial(): Promise<boolean> {
  return Promise.resolve(false);
}

export function showRewardedAd(): Promise<AdResult> {
  return Promise.resolve("failed");
}

export function launchAdTestSuite() {}
