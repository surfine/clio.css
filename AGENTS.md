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
- No Apple bitmaps, icons, logos or fonts, and no art cut from a screenshot. Draw art as
  CSS or small SVGs (see `tooling/tab-art.py` for a drawn-from-measurement example).
  Third-party art needs a licence entry in `THIRD-PARTY.md`.
- Tokens live on `:root, [data-era="system6"]` (01-tokens.css) and
  `[data-era="platinum"]` (90-platinum.css). A token that reads another token is
  resolved where it is declared, so an era that changes `--clio-paper` must re-declare
  every token built from it.
- Motion: none today. If added, animate `transform`/`opacity` only and honour
  `prefers-reduced-motion`.
- Keep `dist/clio.min.css` under the size budget in `test/check.mjs`.
