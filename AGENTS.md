# AGENTS.md — clio.css

For AI coding agents using or changing this repository.

## Using clio.css in a project

- Link `dist/clio.css` (System 6 default) and set `data-era="platinum"` on `<html>` or
  any element for Mac OS 9 Platinum. Copy markup from `dist/components.json`
  (`components[].html`); it is the same markup the docs render.
- Style overrides go through `--clio-*` custom properties, not by restating rules.
  Library rules have zero or one-class specificity, so a plain class in your CSS wins.
- Do not add hover effects to push buttons: the era had none, and the library's state
  model is pressed-on-pointer-down only.

## Changing this repository

- Sources: `src/*.css` (concatenated in file-name order) and `components/index.mjs`
  (docs, `components.json`, `llms.txt`, `llms-full.txt` and `EVIDENCE.md` are generated
  from it). Never hand-edit `dist/`, `docs/`, `llms.txt` or `EVIDENCE.md`.
- After a change: `npm test` (build + static checks) must pass. For Platinum chrome,
  run `npm run fidelity` and do not let a specimen's exact-match share fall.
- Every new or changed value needs an evidence row in `components/index.mjs` with an
  honest status: `measured` only when read from real pixels of the era (name the
  capture), `inferred` when reasoned, `adapted` for web-only changes, `third-party` for
  licensed art or fonts. An unmeasured value is never labelled measured.
- No Apple fonts, logos or icon files, and never ship a screenshot or a crop of one.
  Control art (arrows, boxes, lamps, tabs) may be a pixel-level reconstruction: an SVG
  or palette PNG redrawn from measured pixels by a script in `tooling/` (see
  `tooling/s6-art.py`, `tooling/tab-art.py`, `tooling/db-art.py`). Name the capture or
  resource it was measured from in its evidence row. Large textures and illustrations
  (Drawing Board's paper and sketch lines) are not reproduced: use the dominant measured
  colour and label it `adapted`. For the Mac OS X eras the owner chose otherwise (D4 in
  ROADMAP-MACOSX.md): every part, large textures included, is redrawn pixel by pixel.
  Third-party art needs a licence entry in `THIRD-PARTY.md`.
- Scope (owner decisions, 2026-11-13 and 2026-11-14): eras that can be measured in an
  emulator — System 6, System 7, Drawing Board (Mac OS 8.5b6, as "System 8"), Platinum
  (as "System 9"), and for the Mac OS X phase Aqua (10.2), Tiger (10.4), NeXTSTEP 3.3,
  Snow Leopard (10.6), Lion (10.7), Yosemite (10.10) and Big Sur (11), plus the laptops
  behind AI System 6's Pocket Desk (`clio.machines.css`). Never Dewfall, AI System 6's
  own glass skin. clio.css feeds back into AI System 6, so AI System 6's own chrome
  (Control Strip, Dock, …) is in scope with its markup. Launch posts (awesome lists,
  Show HN) wait for Aqua. The plan and the decisions behind it: ROADMAP-MACOSX.md.
- Tokens live on `:root, [data-era="system6"]` (01-tokens.css),
  `[data-era="system7"]` (80-system7.css), `:is([data-era="platinum"],
  [data-era="drawingboard"])` (90-platinum.css, shared: both are Appearance Manager
  themes) and `[data-era="drawingboard"]` (92-drawingboard.css, which overrides). A token that reads another token is
  resolved where it is declared, so an era that changes `--clio-paper` must re-declare
  every token built from it.
- Motion: none today. If added, animate `transform`/`opacity` only and honour
  `prefers-reduced-motion`.
- Clio Sans '84, Clio Text '84 and Clio Sans '97 are generated: edit `fonts-src/*.txt`
  (or re-extract with `npm run capture:keycaps [-- geneva|geneva9|charcoal]` then
  `npm run build:font`, which needs Python with fontTools and brotli), never the WOFF2 by
  hand. Clio Sans '97 (Charcoal 12) comes from Mac OS 9.0's Key Caps, whose bar is 2px.
- Keep `dist/clio.min.css` under the size budget in `test/check.mjs`.
