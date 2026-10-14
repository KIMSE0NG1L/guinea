import { useEffect, useRef, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { shopImages, shopKit } from "../assets";
import { NineSlice, Panel } from "./NineSlice";
import { GameButton } from "./GameButton";
import { formatGameNumber } from "../state/gameMath";

// Height / width of the kitchen background art (1168x880).
const BACKGROUND_ASPECT = 880 / 1168;

export type Talk = { pose: number; line: string };

// A shopkeeper reacts for a moment, then goes back to their greeting.
export function useShopTalk(greeting: Talk) {
  const [talk, setTalk] = useState(greeting);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
  }, []);

  const say = (pose: number, line: string) => {
    setTalk({ pose, line });
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setTalk(greeting), 2200);
  };

  return { talk, say };
}

export function ShopTopBar({
  kicker,
  title,
  gold,
  onBack,
  backLabel,
  other,
}: {
  kicker: string;
  title: string;
  gold: number;
  onBack: () => void;
  backLabel: string;
  // The sister shop, so a shopping trip can hop between both without going back.
  other?: { label: string; keeper: number; onPress: () => void; accessibilityLabel: string };
}) {
  return (
    <View style={styles.topRow}>
      <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel={backLabel} hitSlop={6}>
        {({ pressed }) => <Image source={shopImages.arrowBack} style={[styles.back, pressed && styles.pressed]} />}
      </Pressable>
      <View style={styles.titleCopy}>
        <Text style={styles.kicker}>{kicker}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
      <Panel slice={shopKit.coinPill} scale={0.36} style={styles.goldPill}>
        <Text style={styles.goldText} numberOfLines={1}>{formatGameNumber(gold)}</Text>
      </Panel>
      {other && (
        <GameButton variant="red" onPress={other.onPress} accessibilityLabel={other.accessibilityLabel} style={styles.otherButton}>
          <View style={styles.otherContent}>
            <Image source={other.keeper} style={styles.otherKeeper} />
            <Text style={styles.otherText}>{other.label}</Text>
          </View>
        </GameButton>
      )}
    </View>
  );
}

// The kitchen backdrop in a wooden frame, with the shopkeeper and their speech bubble.
export function ShopHero({ speaker, talk }: { speaker: string; talk: Talk }) {
  const [heroWidth, setHeroWidth] = useState(0);
  return (
    <Panel slice={shopKit.frameWide} scale={0.32} style={styles.heroFrame}>
      <View style={styles.hero} onLayout={(event) => setHeroWidth(event.nativeEvent.layout.width)}>
        {heroWidth > 0 && (
          <Image
            source={shopImages.background}
            resizeMode="stretch"
            style={[styles.heroImage, { width: heroWidth, height: heroWidth * BACKGROUND_ASPECT }]}
          />
        )}
        <Image source={talk.pose} style={styles.keeper} resizeMode="contain" />
        <View style={styles.bubble}>
          <NineSlice slice={shopKit.bubble} scale={0.32} />
          <Text style={styles.bubbleName}>{speaker}</Text>
          <Text style={styles.bubbleText}>{talk.line}</Text>
        </View>
      </View>
    </Panel>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  back: { width: 50, height: 32 },
  pressed: { transform: [{ scale: 0.94 }] },
  titleCopy: { flex: 1 },
  kicker: { color: colors.red, fontWeight: "800", fontFamily: fonts.bold, fontSize: 9, letterSpacing: 1.5 },
  title: { fontSize: 17, fontWeight: "800", fontFamily: fonts.bold, color: colors.ink, letterSpacing: -0.5 },
  // Text starts past the coin baked into the pill's left end.
  goldPill: { height: 36, minWidth: 92, paddingLeft: 38, paddingRight: 12, justifyContent: "center" },
  otherButton: { minHeight: 38, paddingLeft: 3, paddingRight: 10 },
  otherContent: { flexDirection: "row", alignItems: "center", gap: 2 },
  // Pokes up out of the pill, like the other shopkeeper is peeking over it.
  otherKeeper: { width: 30, height: 30, marginTop: -10 },
  otherText: { fontSize: 11, fontWeight: "900", fontFamily: fonts.bold, color: colors.cream },
  goldText: { fontSize: 12, fontWeight: "900", fontFamily: fonts.bold, color: colors.ink, textAlign: "right" },
  heroFrame: { padding: 11, marginBottom: 8 },
  hero: { height: 210, overflow: "hidden", borderRadius: 4 },
  // Full width, pinned to the bottom so the counter (lower half of the art) stays in view.
  heroImage: { position: "absolute", left: 0, bottom: 0 },
  keeper: { position: "absolute", left: 10, bottom: 4, width: 140, height: 140 },
  bubble: { position: "absolute", top: 14, right: 12, width: "52%", paddingLeft: 16, paddingRight: 14, paddingTop: 11, paddingBottom: 24 },
  bubbleName: { fontSize: 8, fontWeight: "900", fontFamily: fonts.bold, color: colors.red, letterSpacing: 0.5 },
  bubbleText: { marginTop: 3, fontSize: 11, lineHeight: 15, fontWeight: "700", fontFamily: fonts.bold, color: colors.ink },
});
