# Third-party notices

## pixelfx

`tools/pixelfx/` is a pinned, trimmed copy of [patch-gg/pixelfx](https://github.com/patch-gg/pixelfx)
by Patch (https://patch.gg), used to generate pixel art VFX sprite sheets for this game. See
`tools/pixelfx/VENDORED.md` for the exact pinned commit and what was removed from the upstream tree.

> Copyright (c) 2026 Patch
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
> associated documentation files (the "Software"), to deal in the Software without restriction,
> including without limitation the rights to use, copy, modify, merge, publish, distribute,
> sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions: the above copyright notice and this
> permission notice shall be included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
> LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.

pixelfx's own code in turn adapts two other MIT-licensed works (carried through transparently, full
text in `tools/pixelfx/NOTICE.md`):

- **Hugo Duprez** — `src/core/sim.js` and the effects that say so adapt Sprite Fusion's open-source
  pixel art VFX (https://www.spritefusion.com/pixel-art-vfx), Copyright (c) 2026 Hugo Duprez, MIT.
- **Hollow Crown** — `src/core/act.js` adapts how Hollow Crown plays its skills, from
  https://github.com/rehan-remade/hollow-crown, Copyright (c) 2026 rehan-remade, MIT.

**Not included, not used:** pixelfx's web gallery (`gallery/`) and its bundled "Patch Pixel" font are
not vendored into this repo and are not used anywhere in this project — that font is Patch's own and
is not covered by pixelfx's MIT license.

Sprite sheets this project exports *from* pixelfx (`assets/effects/*-strip.png`, via
`tools/pixelfx-export.mjs`) are original renders of this game's own choice of effects/palettes/options
and ship as part of this game's own asset bundle, same as any other asset in `assets/`.
