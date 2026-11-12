// Web (and anything without the AdMob native module): no banner — the exit dialog shows
// without it. iOS/Android load ExitBannerAd.native.tsx instead.
export function ExitBannerAd() {
  return null;
}
