import { useCallback, useEffect, useRef, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { LevelPlayAdSize, LevelPlayBannerAdView } from "unity-levelplay-mediation";
import type { LevelPlayBannerAdViewMethods } from "unity-levelplay-mediation";
import { initAds } from "../ads";

const EXIT_BANNER_UNIT_ID = Platform.select({
  ios: "BP_Banner_iOS",
  default: "BP_Banner_Android",
})!;

// The 300×250 MREC inside the "게임을 나가시겠어요?" dialog. Its box is held at full size while
// loading, so the 예/아니요 buttons never jump under a finger when the ad pops in; if no ad comes
// (no fill, offline) it collapses and the dialog is just its plain self. The bottom margin keeps
// a clear gap above the buttons against accidental taps.
export function ExitBannerAd() {
  const [failed, setFailed] = useState(false);
  const bannerRef = useRef<LevelPlayBannerAdViewMethods>(null);
  useEffect(() => {
    initAds();
  }, []);
  const loadAd = useCallback(() => {
    initAds().then(() => bannerRef.current?.loadAd());
  }, []);
  if (failed) return null;
  return (
    <View style={styles.box}>
      <LevelPlayBannerAdView
        ref={bannerRef}
        adUnitId={EXIT_BANNER_UNIT_ID}
        adSize={LevelPlayAdSize.MEDIUM_RECTANGLE}
        placementName={null}
        style={styles.ad}
        onLayout={loadAd}
        listener={{
          onAdLoaded: () => {},
          onAdLoadFailed: () => setFailed(true),
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { marginTop: 16, marginBottom: 14, width: 300, height: 250, alignItems: "center", justifyContent: "center" },
  ad: { width: 300, height: 250 },
});
