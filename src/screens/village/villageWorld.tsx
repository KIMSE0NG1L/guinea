import { useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import type { Outfit } from "../../types";

// The village is one painted top-down forest map, drawn much larger than the screen so
// it can be dragged around. World units are pixels of that drawn image at zoom 1, with
// (0, 0) at its centre.
export const BACKDROP = require("../../../assets/village/forest-map.webp");
const BACKDROP_ASPECT = 992 / 1325;
// The map is drawn at a fixed scale, big enough that its trees stand taller than a 기니
// (≈70px trees in the 1325px art × 1.7 ≈ 120px, vs a 76px 기니) — far wider than any
// screen, so there's plenty to pan around.
const BACKDROP_WIDTH = 1325 * 1.7;

export function getBackdropSize(view: { width: number; height: number }) {
  // Never smaller than the viewport, so its edges can't show.
  const width = Math.max(BACKDROP_WIDTH, view.width, view.height / BACKDROP_ASPECT);
  return { width, height: width * BACKDROP_ASPECT };
}

// Things that stand up (houses, 기니) sort by their feet: zIndex = DEPTH + y.
export const DEPTH = 100000;

// Where each companion hangs out (no house art drawn for now), as fractions of the
// backdrop from its centre — a ring around the open dirt clearing in the middle of the map.
const HOME_RING: Record<Outfit, { fx: number; fy: number }> = {
  default: { fx: 0, fy: -0.16 },
  explorerHamster: { fx: 0.15, fy: -0.1 },
  tetoGini: { fx: 0.19, fy: 0.05 },
  assassinGini: { fx: 0.09, fy: 0.16 },
  egenGini: { fx: -0.09, fy: 0.16 },
  samuraiGini: { fx: -0.19, fy: 0.05 },
  chefGini: { fx: -0.15, fy: -0.1 },
  // Tucked into the gap between 모험기니 and 탐험기니 — the ring's one gem-bought resident.
  boxerGini: { fx: 0.08, fy: -0.15 },
  witchGini: { fx: -0.13, fy: -0.25 },
};

export function getHomes(backdrop: { width: number; height: number }) {
  return Object.fromEntries(
    (Object.keys(HOME_RING) as Outfit[]).map((outfit) => [
      outfit,
      { x: HOME_RING[outfit].fx * backdrop.width, y: HOME_RING[outfit].fy * backdrop.height },
    ]),
  ) as Record<Outfit, { x: number; y: number }>;
}


// Village props, placed like the houses (fractions of the backdrop from its centre).
export const PROPS = {
  swing: { fx: -0.05, fy: -0.02 },
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
