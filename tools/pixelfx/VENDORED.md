# Vendored copy

This directory is a pinned, trimmed copy of [patch-gg/pixelfx](https://github.com/patch-gg/pixelfx) —
not a git submodule — so the library, its render tools, and the Claude Code skill it ships are always
present in this repo, including for cloud/background agent runs that don't have network access or run
`git submodule update`.

- **Source:** https://github.com/patch-gg/pixelfx
- **Pinned commit:** `a84159688af3ca37a4be05a0d422b94451b2e24e` (2026-10-31, `main`)
- **License:** MIT (see `LICENSE`, `NOTICE.md`)

## What was removed from the upstream tree

- `gallery/` — the web gallery and its bundled **Patch Pixel** font. We don't serve the gallery, and the
  font is Patch's own (not MIT, not covered by the library license) — not vendored, not used anywhere in
  this project. See `../../THIRD-PARTY-NOTICES.md`.
- `tools/serve.mjs`, `tools/build-gallery.mjs` — only served/bundled the removed `gallery/`.
- `.github/`, `docs/readme/*.gif`, `package-lock.json`, `.claude-plugin/` — CI config, large demo GIFs, and
  plugin-marketplace packaging not needed in a vendored copy.
- `esbuild` devDependency and the `gallery` npm script — only used to bundle the removed gallery.

Everything else (`src/`, `tools/` render & export scripts, `docs/AUTHORING.md`, `docs/CATALOG.md`,
`skills/pixelfx/SKILL.md`, `README.md`, `LICENSE`, `NOTICE.md`) is unmodified from the pinned commit,
except `package.json` (scripts/devDependencies trimmed to match, above).

## Updating the pin

1. Pick a new commit from https://github.com/patch-gg/pixelfx/commits/main.
2. Re-clone it somewhere temporary, re-apply the same trims as above, and replace this directory.
3. Update the commit hash and date in this file, and re-check `../../THIRD-PARTY-NOTICES.md` and
   `../../.claude/skills/pixelfx/SKILL.md` (paths there assume this layout: `tools/pixelfx/...`) still match.
4. Re-run `node tools/pixelfx-export.mjs <some-effect>` (see the repo root `tools/` script) to confirm the
   export pipeline still works against the new pin.
