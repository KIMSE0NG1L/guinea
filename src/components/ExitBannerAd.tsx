// Web (and anything without the Unity LevelPlay native module): no banner — the exit dialog shows
// without it. iOS/Android load ExitBannerAd.native.tsx instead.
export function ExitBannerAd() {
  return null;
}
