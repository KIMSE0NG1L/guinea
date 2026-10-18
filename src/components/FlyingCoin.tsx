import { useEffect, useRef, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { colors, fonts } from "../theme";
import { uiImages } from "../assets";
import { formatGameNumber } from "../state/gameMath";
import { StrokedText } from "./StrokedText";

const COIN_W = 58;
const COIN_H = COIN_W * (144 / 256);
const FLIGHT_MS = 7000;
const POPUP_MS = 1300;
// Seconds between flights: the first one shows up fairly soon, later ones less often.
const FIRST_DELAY = [15, 30];
const NEXT_DELAY = [35, 75];

const randomBetween = ([min, max]: number[]) => (min + Math.random() * (max - min)) * 1000;

type Flight = { id: number; fromLeft: boolean; top: number };
type Catch = { id: number; x: number; y: number; gold: number; gems: number };

// Every so often a winged coin flutters across the battle scene, bobbing as it goes. Tap
// it before it leaves to catch it; `onCatch` pays out and says how much for the popup.
export function FlyingCoin({ onCatch }: { onCatch: () => { gold: number; gems: number } }) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [flight, setFlight] = useState<Flight | null>(null);
  const [caught, setCaught] = useState<Catch | null>(null);
  const nextId = useRef(0);

  // Schedules the next flight whenever none is in the air.
  useEffect(() => {
    if (flight || size.height === 0) return;
    const timer = setTimeout(
      () => setFlight({ id: ++nextId.current, fromLeft: Math.random() < 0.5, top: size.height * (0.12 + Math.random() * 0.3) }),
      randomBetween(nextId.current === 0 ? FIRST_DELAY : NEXT_DELAY),
    );
    return () => clearTimeout(timer);
  }, [flight, size.height]);

  return (
    // Above the fighters' sprite layers, which would otherwise swallow the tap.
    <View
      style={[StyleSheet.absoluteFill, styles.layer]}
      pointerEvents="box-none"
      onLayout={(event) => setSize({ width: event.nativeEvent.layout.width, height: event.nativeEvent.layout.height })}
    >
      {flight && size.width > 0 && (
        <Coin
          key={flight.id}
          flight={flight}
          width={size.width}
          onGone={() => setFlight(null)}
          onTap={(x, y) => {
            const reward = onCatch();
            setCaught({ id: flight.id, x, y, ...reward });
            setFlight(null);
          }}
        />
      )}
      {caught && <CatchPopup key={caught.id} caught={caught} onDone={() => setCaught(null)} />}
    </View>
  );
}

function Coin({ flight, width, onGone, onTap }: { flight: Flight; width: number; onGone: () => void; onTap: (x: number, y: number) => void }) {
  const progress = useSharedValue(0);
  const flap = useSharedValue(0);
  const start = flight.fromLeft ? -COIN_W : width;
  const end = flight.fromLeft ? width : -COIN_W;

  useEffect(() => {
    progress.value = withTiming(1, { duration: FLIGHT_MS, easing: Easing.linear });
    flap.value = withRepeat(withSequence(withTiming(1, { duration: 180 }), withTiming(0, { duration: 180 })), -1);
    // Off the far edge by then — timed on the JS side rather than via a worklet callback.
    const timer = setTimeout(onGone, FLIGHT_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: start + (end - start) * progress.value },
      { translateY: Math.sin(progress.value * Math.PI * 6) * 14 },
      { scaleY: 1 - flap.value * 0.12 },
      { rotate: `${Math.sin(progress.value * Math.PI * 6) * 8}deg` },
    ],
  }));

  return (
    <Animated.View style={[styles.coin, { top: flight.top }, style]}>
      <Pressable
        onPress={(event) => onTap(event.nativeEvent.pageX, event.nativeEvent.pageY)}
        hitSlop={14}
        accessibilityRole="button"
        accessibilityLabel="날아다니는 코인 잡기"
      >
        <Image source={uiImages.coinWinged} style={styles.coinImage} />
      </Pressable>
    </Animated.View>
  );
}

// "+N" (and "+2 보석" on the lucky roll) rising out of where the coin was caught.
function CatchPopup({ caught, onDone }: { caught: Catch; onDone: () => void }) {
  const rise = useSharedValue(0);
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);
  const ref = useRef<View>(null);
  useEffect(() => {
    ref.current?.measureInWindow((x, y) => setOrigin({ x: caught.x - x, y: caught.y - y }));
    rise.value = withTiming(1, { duration: POPUP_MS, easing: Easing.out(Easing.quad) });
    const timer = setTimeout(onDone, POPUP_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({
    opacity: rise.value < 0.7 ? 1 : (1 - rise.value) / 0.3,
    transform: [{ translateY: -rise.value * 40 }, { scale: 0.8 + Math.min(rise.value * 4, 1) * 0.3 }],
  }));
  return (
    <View ref={ref} style={StyleSheet.absoluteFill} pointerEvents="none">
      {origin && (
        <Animated.View style={[styles.popup, { left: origin.x - 60, top: origin.y - 30 }, style]}>
          <View style={styles.popupRow}>
            <Image source={uiImages.coin} style={styles.popupIcon} />
            <StrokedText style={styles.popupGold} strokeColor={colors.line} strokeWidth={2}>
              +{formatGameNumber(caught.gold)}
            </StrokedText>
          </View>
          {caught.gems > 0 && (
            <View style={styles.popupRow}>
              <Image source={uiImages.crystal} style={styles.popupIcon} />
              <StrokedText style={styles.popupGem} strokeColor={colors.line} strokeWidth={2}>
                +{caught.gems} 보석!
              </StrokedText>
            </View>
          )}
          <Text style={styles.popupLabel}>잡았다!</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: { zIndex: 20 },
  coin: { position: "absolute", left: 0, zIndex: 7, filter: "drop-shadow(0px 3px 2px rgba(10, 6, 3, 0.45))" },
  coinImage: { width: COIN_W, height: COIN_H },
  popup: { position: "absolute", width: 120, alignItems: "center", zIndex: 7 },
  popupRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  popupIcon: { width: 18, height: 18 },
  popupGold: { fontSize: 18, fontWeight: "900", fontFamily: fonts.bold, color: "#ffe066" },
  popupGem: { fontSize: 15, fontWeight: "900", fontFamily: fonts.bold, color: "#bff0ff" },
  popupLabel: { fontSize: 10, fontWeight: "900", fontFamily: fonts.bold, color: colors.cream },
});
