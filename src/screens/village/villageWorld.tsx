import { useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { villageUi } from "../../assets";
import type { Outfit } from "../../types";

// The village is one painted forest clearing, drawn larger than the screen so it can be
// dragged around a little. World units are pixels of that drawn image at zoom 1, with
// (0, 0) at its centre.
export const BACKDROP = require("../../../assets/village/forest-clearing.webp");
const BACKDROP_ASPECT = 880 / 1168;
// How much bigger than the viewport the backdrop is drawn — the room there is to pan.
const OVERSCAN = 1.35;

export function getBackdropSize(view: { width: number; height: number }) {
  const width = Math.max(view.width * OVERSCAN, (view.height * OVERSCAN) / BACKDROP_ASPECT);
  return { width, height: width * BACKDROP_ASPECT };
}

// Things that stand up (houses, 기니) sort by their feet: zIndex = DEPTH + y.
export const DEPTH = 100000;

// Where each companion lives, as fractions of the backdrop from its centre — a ring of
// houses around the open dirt clearing.
const HOME_RING: Record<Outfit, { fx: number; fy: number }> = {
  default: { fx: 0, fy: -0.27 },
  explorerHamster: { fx: 0.24, fy: -0.17 },
  tetoGini: { fx: 0.3, fy: 0.08 },
  assassinGini: { fx: 0.14, fy: 0.29 },
  egenGini: { fx: -0.14, fy: 0.29 },
  samuraiGini: { fx: -0.3, fy: 0.08 },
  chefGini: { fx: -0.24, fy: -0.17 },
};

export function getHomes(backdrop: { width: number; height: number }) {
  return Object.fromEntries(
    (Object.keys(HOME_RING) as Outfit[]).map((outfit) => [
      outfit,
      { x: HOME_RING[outfit].fx * backdrop.width, y: HOME_RING[outfit].fy * backdrop.height },
    ]),
  ) as Record<Outfit, { x: number; y: number }>;
}

export function House({ x, y, size = 96 }: { x: number; y: number; size?: number }) {
  return (
    <Image
      source={villageUi.house}
      style={[styles.abs, { left: x - size / 2, top: y - size * 0.9, width: size, height: size * (139 / 147), zIndex: DEPTH + Math.round(y) }]}
    />
  );
}

// Village props, placed like the houses (fractions of the backdrop from its centre).
export const PROPS = {
  swing: { fx: -0.07, fy: -0.04 },
};

// A rope swing rocking back and forth: its three-frame strip (left · middle · right),
// played middle → right → middle → left on a loop.
const SWING_STRIP = require("../../../assets/village/swing-strip.png");
const SWING_FRAME_W = 202;
const SWING_FRAME_H = 200;
const SWING_SEQUENCE = [1, 2, 1, 0];
const SWING_FRAME_MS = 260;

export function Swing({ x, y, width = 120 }: { x: number; y: number; width?: number }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setStep((current) => (current + 1) % SWING_SEQUENCE.length), SWING_FRAME_MS);
    return () => clearInterval(timer);
  }, []);
  const scale = width / SWING_FRAME_W;
  const height = SWING_FRAME_H * scale;
  return (
    <View style={[styles.abs, styles.clip, { left: x - width / 2, top: y - height, width, height, zIndex: DEPTH + Math.round(y) }]}>
      <Image
        source={SWING_STRIP}
        style={{ position: "absolute", top: 0, left: -SWING_SEQUENCE[step] * width, width: width * 3, height }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  clip: { overflow: "hidden" },
  abs: { position: "absolute" },
});
