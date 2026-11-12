import { useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";

// Release banner units ("exit_banner"); dev builds use Google's test unit, same as the
// rewarded/interstitial units in src/ads (tapping real ads on your own device can get the
// AdMob account suspended).
const EXIT_BANNER_UNIT_ID = __DEV__
  ? TestIds.BANNER
  : Platform.select({
      ios: "ca-app-pub-7612859698236948/1487682266",
      default: "ca-app-pub-7612859698236948/7278551643",
    });

// The 300×250 banner inside the "게임을 나가시겠어요?" dialog. Its box is held at full size
// while loading, so the 예/아니요 buttons never jump under a finger when the ad pops in; if no
// ad comes (no fill, offline) it collapses and the dialog is just its plain self. The bottom
// margin keeps a clear gap above the buttons against accidental taps.
export function ExitBannerAd() {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <View style={styles.box}>
      <BannerAd unitId={EXIT_BANNER_UNIT_ID} size={BannerAdSize.MEDIUM_RECTANGLE} onAdFailedToLoad={() => setFailed(true)} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { marginTop: 16, marginBottom: 14, width: 300, height: 250, alignItems: "center", justifyContent: "center" },
});
