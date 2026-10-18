import { useEffect, useRef, useState } from "react";
import { StyleSheet, type StyleProp, type TextStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";

// Small reusable motions shared across screens: a number that rolls to its new value,
// a shake, a bump when something changes, a floating "+N", and hold-to-repeat.

// The displayed value glides from the old number to the new one instead of jumping.
export function useRollingNumber(value: number, durationMs = 500) {
  const [shown, setShown] = useState(value);
  const fromRef = useRef(value);
  useEffect(() => {
    const from = fromRef.current;
    if (from === value) return;
    const start = Date.now();
    const timer = setInterval(() => {
      const t = Math.min(1, (Date.now() - start) / durationMs);
      const eased = 1 - (1 - t) ** 3;
      const next = t >= 1 ? value : from + (value - from) * eased;
      fromRef.current = next;
      setShown(next);
      if (t >= 1) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [value, durationMs]);
  return Math.round(shown);
}

// Counts up from 0 to `value` once, after `delayMs` — for a reward reveal.
export function useCountUp(value: number, durationMs = 900, delayMs = 0) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    const wait = setTimeout(() => {
      const start = Date.now();
      timer = setInterval(() => {
        const t = Math.min(1, (Date.now() - start) / durationMs);
        setShown(value * (1 - (1 - t) ** 3));
        if (t >= 1) clearInterval(timer);
      }, 30);
    }, delayMs);
    return () => {
      clearTimeout(wait);
      clearInterval(timer);
    };
    // Plays once, for the value it mounted with.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return Math.round(shown);
}

// A quick side-to-side rattle ("no" — not enough gold, etc). Call `shake()` to play it.
export function useShake() {
  const x = useSharedValue(0);
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const shake = () => {
    // .set() rather than assigning .value: called from event handlers the React Compiler
    // can't see into.
    x.set(
      withSequence(
        withTiming(-6, { duration: 45 }),
        withTiming(6, { duration: 70 }),
        withTiming(-4, { duration: 60 }),
        withTiming(3, { duration: 55 }),
        withTiming(0, { duration: 45 }),
      ),
    );
  };
  return { style, shake };
}

// Pops (scale up and back) whenever `value` changes — not on first mount. `direction`
// reports whether it went up or down, for callers that tint the change.
export function useBumpOnChange(value: number, scale = 1.25) {
  const bump = useSharedValue(1);
  const previous = useRef(value);
  const [direction, setDirection] = useState<"up" | "down" | null>(null);
  useEffect(() => {
    if (previous.current === value) return;
    const up = value > previous.current;
    previous.current = value;
    bump.value = withSequence(withTiming(scale, { duration: 110, easing: Easing.out(Easing.quad) }), withTiming(1, { duration: 160 }));
    // Reported asynchronously, so the change itself never triggers a cascading render.
    const show = setTimeout(() => setDirection(up ? "up" : "down"), 0);
    const clear = setTimeout(() => setDirection(null), 450);
    return () => {
      clearTimeout(show);
      clearTimeout(clear);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: bump.value }] }));
  return { style, direction };
}

// "+15%" drifting up and fading out. Mount one per event (keyed) — it plays once.
export function FloatText({ text, style }: { text: string; style?: StyleProp<TextStyle> }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withTiming(1, { duration: 750, easing: Easing.out(Easing.quad) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const animated = useAnimatedStyle(() => ({
    opacity: t.value < 0.6 ? 1 : (1 - t.value) / 0.4,
    transform: [{ translateY: -t.value * 22 }, { scale: 0.8 + Math.min(1, t.value * 4) * 0.25 }],
  }));
  return <Animated.Text style={[styles.float, style, animated]}>{text}</Animated.Text>;
}

// A one-shot flash (0 → 1 → 0). Returns the shared value to drive any style, and a trigger.
export function useFlash(durationMs = 450) {
  const v = useSharedValue(0);
  const flash = () => {
    v.set(withSequence(withTiming(1, { duration: 90 }), withDelay(60, withTiming(0, { duration: durationMs }))));
  };
  return { value: v, flash };
}

// Holding a button keeps firing it: once on press, then again every `everyMs` after a
// short wait. Hand the returned handlers to a Pressable (onPressIn/onPressOut).
export function useHoldRepeat(action: () => void, everyMs = 110, waitMs = 380) {
  const timers = useRef<{ wait?: ReturnType<typeof setTimeout>; every?: ReturnType<typeof setInterval> }>({});
  const actionRef = useRef(action);
  useEffect(() => {
    actionRef.current = action;
  });
  const stop = () => {
    clearTimeout(timers.current.wait);
    clearInterval(timers.current.every);
    timers.current = {};
  };
  useEffect(() => stop, []);
  return {
    onPressIn: () => {
      stop();
      timers.current.wait = setTimeout(() => {
        timers.current.every = setInterval(() => actionRef.current(), everyMs);
      }, waitMs);
    },
    onPressOut: stop,
  };
}

const styles = StyleSheet.create({
  float: { position: "absolute", fontWeight: "900" },
});
