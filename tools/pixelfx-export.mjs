#!/usr/bin/env node
// Export a pixelfx effect (tools/pixelfx, vendored at a pinned commit — see tools/pixelfx/VENDORED.md)
// as a horizontal sprite strip this game's SpriteStrip component (src/components/SpriteStrip.tsx) can
// play directly: one row, N frames, transparent background, native pixel size.
//
//   node tools/pixelfx-export.mjs pickups/coin-spin
//   node tools/pixelfx-export.mjs impacts/crit-hit --out big-crit --fps 24 --square
//   node tools/pixelfx-export.mjs fire/fireball --opts '{"palette":["#102","#215","#43a","#8cf","#fff"]}'
//
// Options:
//   --out <name>   output basename (default: the effect's own name) -> assets/effects/<name>-strip.png
//   --fps N        override the effect's own fps
//   --seed N       a different but equivalent take
//   --opts JSON    passed straight to the effect (palette, flip, angle, light, its own meta.options...)
//   --actor        bake in pixelfx's stock stand-in character (default: effect alone — this game
//                  draws its own characters/UI around the effect)
//   --square       pad the frame to a square canvas (centered) if it isn't already one — SpriteStrip
//                  assumes square cells; effects that are naturally wide/tall (full-screen transitions,
//                  beams) need either this or a different player component
//   --max-frames N keep only the first N rendered frames — for a long one-shot (several seconds)
//                  you only want the punchy opening beat of in a quick game moment; the dropped
//                  tail is usually just a slow fade you can cut without it being missed
//
// node tools/*.mjs (list, render, act, check...) work the same way against the vendored checkout:
// `cd tools/pixelfx && node tools/list.mjs <words>` finds effects, `node tools/render.mjs <id>` writes
// a contact sheet you can look at before exporting.

import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadEffect, renderFrames, canvas, save } from "./pixelfx/tools/lib/fxlib.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, "..");

const args = process.argv.slice(2), flags = {}, ids = [];
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (!a.startsWith("--")) ids.push(a);
  else if (["actor", "square"].includes(a.slice(2))) flags[a.slice(2)] = true;
  else flags[a.slice(2)] = args[++i];
}
if (ids.length !== 1) {
  console.error("usage: node tools/pixelfx-export.mjs <effect-id> [--out name] [--fps N] [--seed N] [--opts JSON] [--actor] [--square] [--max-frames N]");
  process.exit(1);
}

const id = ids[0];
let fx;
try {
  fx = await loadEffect(id);
} catch (e) {
  console.error(`${id}: ${e.message}`);
  console.error(`(cd tools/pixelfx && node tools/list.mjs to see every effect id)`);
  process.exit(1);
}

const r = renderFrames(fx, {
  fps: flags.fps ? +flags.fps : undefined,
  seed: flags.seed ? +flags.seed : undefined,
  bg: "none",
  actor: flags.actor ? true : false,
  options: flags.opts ? JSON.parse(flags.opts) : undefined,
});

const { w, h, fps } = r;
const frames = flags["max-frames"] ? r.frames.slice(0, +flags["max-frames"]) : r.frames;
const n = frames.length;
const cell = flags.square ? Math.max(w, h) : null;
const cw = cell ?? w, ch = cell ?? h;
const ox = cell ? Math.floor((cell - w) / 2) : 0, oy = cell ? Math.floor((cell - h) / 2) : 0;

const strip = canvas(cw * n, ch, [0, 0, 0, 0]);
frames.forEach((f, i) => strip.paste(f.clear, w, h, i * cw + ox, oy));

const name = flags.out ?? id.split("/")[1];
const outFile = join(REPO_ROOT, "assets", "effects", `${name}-strip.png`);
save(outFile, strip.png());

const m = fx.meta;
const durationMs = n > 1 ? Math.round(((n - 1) / fps) * 1000) : 0;
console.log(`${id}  ${m.desc ?? ""}`);
console.log(`-> ${outFile}`);
console.log(`   ${n} frames @ ${fps}fps, ${cw}x${ch} each${cell ? ` (padded from ${w}x${h})` : ""}, ${m.loop ? "loop" : "once"}`);
console.log(`\nSpriteStrip props for src/components/SpriteStrip.tsx:`);
console.log(`  frameSize={${cw}}  frameCount={${n}}  durationMs={${durationMs}}  mode="${m.loop ? "loop" : "once"}"`);
if (!cell && w !== h) {
  console.log(`\nNote: this effect's native frame is ${w}x${h}, not square — SpriteStrip assumes square`);
  console.log(`cells. Re-run with --square to pad it, or use a different player for this one.`);
}
