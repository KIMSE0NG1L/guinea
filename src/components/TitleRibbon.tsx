import { StyleSheet, View } from "react-native";
import { fonts } from "../theme";
import { StrokedText } from "./StrokedText";
import { BAND_W, RIBBON_H, RIBBON_W, RibbonBand, RibbonTail } from "./FirstClearCelebration";

// The red ribbon title across the top of a big framed reward popup (offline haul, attendance),
// the same ribbon the boss first-clear uses, scaled down to sit inside the frame's padding.
export function TitleRibbon({ children }: { children: string }) {
  return (
    <View style={styles.ribbon}>
      <View style={styles.tailLeft}>
        <RibbonTail />
      </View>
      <View style={styles.tailRight}>
        <RibbonTail flip />
      </View>
      <View style={styles.band}>
        <RibbonBand />
      </View>
      <View style={styles.words}>
        <StrokedText style={styles.title} strokeColor="#5a1a12" strokeWidth={2}>
          {children}
        </StrokedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ribbon: { marginTop: -4, marginBottom: -6, transform: [{ scale: 0.86 }], width: RIBBON_W, height: RIBBON_H - 8, alignItems: "center", justifyContent: "center" },
  band: { position: "absolute", top: 0, left: (RIBBON_W - BAND_W) / 2 },
  tailLeft: { position: "absolute", left: 0, top: 18 },
  tailRight: { position: "absolute", right: 0, top: 18 },
  // A little high in the band, which arches — its visual middle is above centre.
  words: { position: "absolute", top: 1, left: 0, right: 0, height: RIBBON_H - 26, alignItems: "center", justifyContent: "center" },
  // Small enough that a 12-character title stays inside the band.
  title: { fontSize: 16, fontWeight: "900", fontFamily: fonts.bold, color: "#fff1c4" },
});
