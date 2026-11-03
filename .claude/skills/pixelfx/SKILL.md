---
name: pixelfx
description: Make pixel art effects and sprite animations in code with the pixelfx library, which has 244 ready-made ones, acted out by a character who winds up, freezes on contact and recovers (fire, explosions, water, ice, lightning, sci-fi, melee, impacts, projectiles, spawn and death, arcane, holy, shadow, status, nature, weather, UI, pickups, transitions, critters) to drop into this game, recolor, export as sprite sheets or remix, plus a draft, render, look, refine loop that makes new ones look hand-animated. Use when someone wants pixel art VFX, sprite animations or sprite sheets for this game, game juice, a specific effect ("a frost nova for my mage", "a coin pickup sparkle"), or wants their pixel effects to look better.
license: MIT
compatibility: Node 18 or newer (this repo's own requirement already exceeds that). ffmpeg is optional (GIF and MP4 previews) and not required for anything below.
---

# pixelfx, in this repo

This repo vendors [patch-gg/pixelfx](https://github.com/patch-gg/pixelfx) at a pinned commit — see
`tools/pixelfx/VENDORED.md` for the exact commit and what was trimmed (the web gallery and its
non-MIT "Patch Pixel" font are not included; see `/THIRD-PARTY-NOTICES.md`). It is a plain, pinned
copy of the library (not a git submodule, not the Claude Code plugin install), so it — and this skill
— are available in every session on this repo, including cloud/background agents with no network access.

**Don't `git clone` a fresh copy.** The checkout is already at `tools/pixelfx/`. Run its tools from
there: `cd tools/pixelfx && node tools/render.mjs fire/torch`.

**This game's "engine"** is not Godot/Unity/Phaser — it's this Expo/React Native app, and it already
has its own sprite player: `src/components/SpriteStrip.tsx` plays a single horizontal row of
**square** frames (`frameSize` px each) via `translateX`, at a fixed `durationMs` for the full cycle,
in `"loop"` or `"once"` mode (see that file's prop comments, and `effects.critFlash` / `effects.beam`
in `src/assets.ts` for existing examples). It does not understand Aseprite JSON, multi-row grids, or
non-square cells. `tools/pixelfx-export.mjs` (project root, one level up from the vendored checkout)
bridges pixelfx to that: it renders an effect and lays the frames into exactly the single-row,
transparent-background strip `SpriteStrip` expects.

## Before anything

Check the vendored copy runs: `cd tools/pixelfx && node tools/render.mjs fire/torch` writes
`records/fire/torch/contact.png` (gitignored, fine to leave around). Open that PNG with your
image-reading tool — that contact sheet is how you see any effect before using it.

## 1. Look for an existing effect first

From `tools/pixelfx/`: `node tools/list.mjs <words>` searches ids, names, tags and descriptions
(`node tools/list.mjs frost`, `node tools/list.mjs slash loop`). `docs/CATALOG.md` lists everything by
category. Render candidates and look at them before choosing. Most requests are an existing effect
with different options:

- `palette`: the main ramp, dark to bright, as hex strings. Any `PAL` ramp in `src/core/color.js` (fire
  ember lava smoke dust ice water electric volt poison holy heal arcane shadow blood earth stone gold
  leaf wood metal bone neon cyber matrix candy night) or your own.
- `seed` for a different but equivalent take; `flip` to face left; `angle` to rotate; `light` (0..1+)
  for glow strength; plus each effect's own knobs in its `meta.options`.
- Try options without editing code: `node tools/render.mjs fire/torch --opts '{"palette":["#102","#215","#43a","#8cf","#fff"]}'`.

## 2. Put it in the game

From the **repo root** (not `tools/pixelfx/`):

```
node tools/pixelfx-export.mjs pickups/coin-spin
```

writes `assets/effects/coin-spin-strip.png` (one row, native frame size, transparent) and prints the
`SpriteStrip` props to use with it (`frameSize`, `frameCount`, `durationMs`, `mode`). See
`tools/pixelfx-export.mjs`'s header comment for the flags: `--out <name>`, `--fps`, `--seed`, `--opts`,
`--actor` (bake in pixelfx's own stand-in character — usually leave this off; this game draws its own
characters and UI around the effect), `--square` (pad a non-square frame, since `SpriteStrip` assumes
square cells — full-screen transitions and wide beams need this, or a different player entirely).

Then wire it up like any other sprite:

1. Add it to `effects` in `src/assets.ts`: `require("../assets/effects/<name>-strip.png")`.
2. Use it: `<SpriteStrip source={effects.<name>} frameSize={…} frameCount={…} displaySize={…} durationMs={…} mode="loop"|"once" />`
   — `displaySize` is independent of `frameSize`, set it to whatever looks right at the call site.
3. For a one-shot combat hit, mirror `effects.critFlash`'s usage in `src/screens/BattleScene.tsx`
   (`mode="once"`, mounted fresh via a changing `key` so it restarts).

`node tools/pixelfx-export.mjs <category>/*` is not wired up (the export script takes one id at a
time, unlike upstream's `render.mjs`/`sheets.mjs`) — loop a shell `for` over `node tools/pixelfx/tools/list.mjs <category>` output if exporting a whole category.

**A hit needs a body behind it.** An effect alone looks like a sticker — that's normal, and in this
game it's correct: the pixelfx effect is the VFX layer, the existing hand-built components
(`ExecuteEffect.tsx`, `SkillAuras.tsx`, `BeamEffect.tsx`, `LevelUpBurst.tsx`) are how characters, slashes
and impacts already read as having weight. Don't reach for pixelfx's own stock-character `act` system
(`createAct`, `node tools/act.mjs --sheet`) here — it's for games with no character animation of their
own; this one already has one, in its own hand-drawn style (see `src/components/SpriteStrip.tsx`'s
users for the convention: `*-strip.webp` character sheets at `FRAME_SIZE = 160` from `src/assets.ts`).

`tools/pixelfx/src/fx/moves/` has whole attacks chained from the effects, wind-up to recovery — useful
reference even though this game choreographs its own moves by hand.

## 3. Make a new one

Read `tools/pixelfx/docs/AUTHORING.md` first: it is the contract (meta, `draw(p, t, o)` for pure
effects or `create(o)` for simulated ones, local coordinates, seamless loops, ending empty), the
toolkit, the painter API and the quality bar. All of `node tools/new.mjs`, `render.mjs`, `act.mjs`,
`check.mjs` below run from inside `tools/pixelfx/`, against its own `src/fx/` — new effects land in the
vendored checkout, not this project's own `src/`.

1. **Say it in one line** with art direction: what it is, how it moves, its palette, its timing.
2. **Find references**: `node tools/list.mjs <words>`, read the two or three closest effect files and
   borrow their techniques (`Particles`/`Bits` in `src/core/sim.js`, `p.disc` for translucent volumes,
   `cycle` for seamless particles, `tileFbm` scrolls for flames and water). [Hugo Duprez's
   effects](https://www.spritefusion.com/pixel-art-vfx) are the quality bar this library adapts from.
3. **Draft.** `node tools/new.mjs <category>/<name>` (add `--loop` for a loop). For an open brief, write
   3-5 genuinely different drafts (`<name>-a.js`..`-e.js`), render them all
   (`node tools/render.mjs "<category>/<name>-*"`), look at every contact sheet before choosing.
4. **Look, judge, fix.** Render, open `records/<id>/contact.png`, judge like a picky pixel artist. Fix
   the worst thing, render again — three rounds minimum. `--all` shows every frame, `--mp4` shows
   motion at full speed (needs ffmpeg).
5. **Check.** `node tools/check.mjs <id>` catches drawing outside the canvas, one-shots that don't end
   empty, loop seams, unseeded randomness and slow frames. Fix until clean, delete unkept drafts.
6. **Export it into the game** per section 2 once it passes — from the repo root, not `tools/pixelfx/`.

What to look for, and the usual fix:

| you see | fix |
|---|---|
| it reads as mush at 1x | fewer colors, a clear silhouette, one focal point, bigger shapes |
| speckle: lone noise pixels inside shapes | threshold noise less, quantize with `at()`, no noise on small shapes |
| floaty, no punch | fast in, slow out (`ease.outQuart`/`outExpo`), a 1 to 2 frame white hero frame, shorter total time |
| stiff or mechanical | vary every particle (size, speed, delay, life), add secondary motion (sparks, smoke, debris) |
| washed out | less glow (k 0.2 to 0.5), darker edge steps, keep white for the hottest core only |
| flat | light from one side: brighter top-left, darker bottom-right step; a darker ramp step at the base |
| smooth gradients, vector look | hard ramp steps in color; softness only in light and in translucent smoke |
| a checkerboard where smoke should be | `SMOKE`, `VAPOUR` or `DUST` particles, or `p.disc`: truly translucent, lit on top |
| seam when a loop wraps | `cycle`, `loopNoise(phase)`, whole-cell `tileNoise` scrolls, `sin(phase * TAU * n)` |
| a one-shot that pops off | let it shrink, dither out or fall away before t = duration |

Directional effects face right, ground effects stand on y = 0, and nothing uses `Math.random`. Generic
motifs are fine; never recreate a specific game's sprites, characters or logos — and never recreate
this game's own existing mobs, NPCs or UI art either.

## Keeping the pin up to date

See `tools/pixelfx/VENDORED.md`. Don't `npm install` or add pixelfx as a package dependency — it's
vendored source, not a published package, and the tools run on plain Node with zero dependencies.
