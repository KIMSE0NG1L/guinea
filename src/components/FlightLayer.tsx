import { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming } from "react-native-reanimated";
import type { TargetRect } from "./tutorialTargets";

// Icons that fly across the whole screen — ingredients into a pot, a finished dish into its
// recipe card. Anything can launch one with window-space rects (measureTarget); the layer,
// mounted once over the game, turns them into its own coordinates.
export type Flight = {
  image: number;
  from: TargetRect | "center"; // "center" = middle of the game frame
  to: TargetRect;
  delay?: number;
  size?: number;
  duration?: number;
  arc?: number; // how high the path bows up, px
  onArrive?: () => void;
  // Which layer draws it — a modal mounts its own (it sits above the main one).
  channel?: string;
};

type ActiveFlight = Flight & { id: number };

const listeners = new Set<(flight: ActiveFlight) => void>();
let nextId = 0;

export function launchFlight(flight: Flight) {
  const active = { ...flight, id: ++nextId };
  listeners.forEach((listener) => listener(active));
}

export function FlightLayer({ channel = "main" }: { channel?: string }) {
  const ref = useRef<View>(null);
  const [origin, setOrigin] = useState<TargetRect | null>(null);
  const [flights, setFlights] = useState<ActiveFlight[]>([]);

  useEffect(() => {
    const listener = (flight: ActiveFlight) => {
      if ((flight.channel ?? "main") === channel) setFlights((current) => [...current, flight]);
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, [channel]);

  return (
    <View
      ref={ref}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
      onLayout={() => ref.current?.measureInWindow((x, y, width, height) => setOrigin({ x, y, width, height }))}
    >
      {origin &&
        flights.map((flight) => (
          <FlyingIcon
            key={flight.id}
            flight={flight}
            origin={origin}
            onDone={() => setFlights((current) => current.filter((item) => item.id !== flight.id))}
          />
        ))}
    </View>
  );
}

function FlyingIcon({ flight, origin, onDone }: { flight: ActiveFlight; origin: TargetRect; onDone: () => void }) {
  const size = flight.size ?? 26;
  const duration = flight.duration ?? 520;
  const from =
    flight.from === "center"
      ? { x: origin.width / 2, y: origin.height / 2 }
      : { x: flight.from.x - origin.x + flight.from.width / 2, y: flight.from.y - origin.y + flight.from.height / 2 };
  const to = { x: flight.to.x - origin.x + flight.to.width / 2, y: flight.to.y - origin.y + flight.to.height / 2 };
  const arc = flight.arc ?? 70;
  const t = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(flight.delay ?? 0, withSequence(withTiming(1, { duration: 60 }), withDelay(duration - 120, withTiming(0, { duration: 60 }))));
    t.value = withDelay(flight.delay ?? 0, withTiming(1, { duration, easing: Easing.inOut(Easing.quad) }));
    const timer = setTimeout(() => {
      flight.onArrive?.();
      onDone();
    }, (flight.delay ?? 0) + duration);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => {
    const x = from.x + (to.x - from.x) * t.value;
    // A parabola on top of the straight line, peaking halfway.
    const y = from.y + (to.y - from.y) * t.value - arc * 4 * t.value * (1 - t.value);
    return {
      opacity: opacity.value,
      transform: [{ translateX: x - size / 2 }, { translateY: y - size / 2 }, { scale: 1 - t.value * 0.35 }],
    };
  });

  return <Animated.Image source={flight.image} style={[styles.icon, { width: size, height: size }, style]} />;
}

const styles = StyleSheet.create({
  icon: { position: "absolute", left: 0, top: 0 },
});
