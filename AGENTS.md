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

- Sources: the CSS fragments in `packages/core/src/` (`components/<name>/<name>.css` for a
  component's base, `<name>.<layer>.css` for an era layer such as `window.platinum.css`,
  `foundation/` for fonts, tokens, base, cursors, adapt and CJK) and each component's
  `components/<name>/<name>.data.ts` (markup, selectors, tokens, evidence; the order is
  `packages/core/src/components.ts`).
  `packages/core/src/order.ts` lists which fragment segments make up each single-file layer
  (named as the old `src/` files: `20-window.css`, `90-platinum.css`…), in cascade order;
  segments inside a fragment are separated by `/* clio:segment */`. Add a rule to the segment
  it belongs beside; a rule that must sit between two other fragments' rules is a new segment
  and a new `order.ts` entry. `npm test` fails on an unused or doubly used segment.
  Docs, `components.json`, `llms.txt`, `llms-full.txt` and `EVIDENCE.md` are generated
  from the data modules. Never hand-edit `dist/`, `docs/`, `llms.txt` or `EVIDENCE.md`.
- `dist/contract.js` (+ `.d.ts`) and `dist/tokens/<era>.json` are the host contract (M2):
  generated from the data modules and each era's `:root` values; hosts import
  `clio.css/contract` instead of pinning values by hand.
- Tooling and tests are TypeScript under `tooling/`, `test/` and `packages/`, run
  directly by Node 24 (type stripping: no build step, no `enum` or other syntax Node cannot
  strip). Imports name the `.ts` file. `npx tsc --noEmit -p tsconfig.tooling.json` checks them
  and `npm run lint` runs Biome over `tooling/` too.
- clio.js is ES modules: each component's `<name>.behaviour.ts` plus `packages/core/src/runtime/`
  (shared helpers, sounds, the watch, centred labels, and `clio.ts`, the entry). No module does
  anything at load: each exports `install()`, and `runtime/clio.ts` calls them in a fixed order
  (listener order is observable) after its guard. Vite bundles `runtime/iife.ts` into
  `dist/clio.js` (a plain script that sets only `window.clio`) and `runtime/clio.ts` into
  `dist/clio.mjs` (exports `api` and `install`; importing installs nothing). esbuild bundles
  `dist/clio.min.js` from the same entry. The bundles drop comments; the modules keep them.
  The sounds panel is one file, `packages/core/src/sounds-panel/clio-sounds-panel.ts`, emitted by `tsc` as a plain script setting
  `window.clioSoundsPanel`. Public types live in `types/clio.d.ts` (shipped as
  `dist/clio.d.ts`); `api = { … } satisfies ClioApi` keeps declaration and code together.
  `npm run typecheck` checks all of it without building.
- clio.css-preact and clio.css-react come from one JSX source, `packages/components/src/`. It
  imports only "clio-jsx" (hooks, the children type, element attributes), which
  `packages/<framework>/src/jsx.ts` provides. Use `className`, `htmlFor` and style objects.
  Components are controlled and render clio.css markup; behaviour stays in clio.js. Each
  component has `packages/components/examples/<id>.tsx` rebuilding its `html` and variants.
  `test/components.test.ts` runs in both frameworks and requires the same DOM as
  components.json, so a markup change goes into the data module and the component together.
  `npm run build:components` builds `packages/<framework>/dist/`, published as clio.css-preact and clio.css-react (same version as clio.css).
- The docs page (docs/index.html) is Preact: `packages/site/src/`, prerendered at build time
  through Vite's SSR build (`tooling/build-site.ts`). Its specimens are the component examples
  and its client script is `client.ts`. A change to the site's look is proved with
  `node tooling/site-shots.ts capture <dir>`, run before and after, then `compare`:
  Chromium and WebKit pixel-identical; Firefox repeats about 1,500 px of noise.
- After a change: `npm test` (build + static checks) must pass. For chrome, run
  `npm run fidelity` (needs the private references) or at least `npm run fidelity:public`,
  and do not let a specimen's share fall.
- Every new or changed value needs an evidence row in the component's `<name>.data.ts` with an
  honest status: `measured` only when read from real pixels of the era (name the
  capture), `inferred` when reasoned, `adapted` for web-only changes, `third-party` for
  licensed art or fonts. An unmeasured value is never labelled measured.
- No Apple fonts, logos or icon files, and never ship a screenshot or a crop of one.
  Control art (arrows, boxes, lamps, tabs) may be a pixel-level reconstruction: an SVG
  or palette PNG redrawn from measured pixels by a script in `tooling/` (see
  `tooling/s6-art.py`, `tooling/tab-art.py`, `tooling/db-art.py`). Name the capture or
  resource it was measured from in its evidence row. Large textures and illustrations
  (Drawing Board's paper and sketch lines) are not reproduced: use the dominant measured
  colour and label it `adapted`.
  Third-party art needs a licence entry in `THIRD-PARTY.md`.
- Scope (owner, 2026-11-26 and 2026-11-27): Classic Mac OS — System 6, System 7, Drawing
  Board (Mac OS 8.5b6), Platinum (Mac OS 9) — and NeXTSTEP 3.3 (`data-era="nextstep"`, the
  `*.nextstep.css` fragments and `foundation/nextstep.css`, shipped only as
  `dist/clio.nextstep.css`; `dist/clio.css` stays the four Classic eras). Only eras measured in
  an emulator. **No new era starts.** The five eras take fixes and missing parts, each one
  through `npm run verify`. The Mac OS X eras belong to clio.wasm, a separate project;
  `dev/ROADMAP-MACOSX.md` is history, not a work order. Never Dewfall, AI System 6's own glass
  skin. AI System 6's own chrome (Control Strip, …) is in scope with its markup.
- Versions (owner, 2026-11-27): only 2.x is maintained; 1.x gets no releases. Fixes land on
  `main` only. What 2.x keeps compatible is listed in README "Versions and support"; the
  component packages' props follow semver only.
- Internal notes (roadmaps, lessons, audits, plans, handoffs, launch drafts, upstream
  drafts) live in `dev/`, never in `docs/` (`docs/` is the published GitHub Pages root).
- Tokens live on `:root, [data-era="system6"]` (`foundation/tokens.css`),
  `[data-era="system7"]` (`foundation/system7.css`), `:is([data-era="platinum"],
  [data-era="drawingboard"])` (`foundation/platinum.css`, shared: both are Appearance Manager
  themes) and `[data-era="drawingboard"]` (`foundation/drawingboard.css`, which overrides). A token that reads another token is
  resolved where it is declared, so an era that changes `--clio-paper` must re-declare
  every token built from it.
- Motion: none today. If added, animate `transform`/`opacity` only and honour
  `prefers-reduced-motion`.
- Clio Sans '84, Clio Text '84 and Clio Sans '97 are generated: edit `fonts-src/*.txt`
  (or re-extract with `npm run capture:keycaps [-- geneva|geneva9|charcoal]` then
  `npm run build:font`, which needs Python with fontTools and brotli), never the WOFF2 by
  hand. Clio Sans '97 (Charcoal 12) comes from Mac OS 9.0's Key Caps, whose bar is 2px.
- Keep `dist/clio.min.css` under the size budget in `test/check.test.ts`.

## Disclosure

- A commit an AI agent writes or helps with ends with an `Assisted-by: <model> via <tool>`
  trailer (for example `Assisted-by: Claude Opus 5.5 via Claude Code`), the form Fedora's
  AI-assisted contribution policy uses. The same line goes at the end of pull requests and
  issues an agent prepares for other projects.
- That trailer is the disclosure. README, release notes, launch posts and PR descriptions do
  not present AI use as a feature or a reason to trust or distrust the work; the evidence
  rows and `npm run fidelity:public` are what readers check.

## Releasing (owner only)

- `npm run verify` is the local release gate (GitHub Actions is not used). It clones HEAD
  into a temporary directory and runs, in order: `npm ci`, `npm test`, lint, typecheck; packs
  clio.css, clio.css-preact and clio.css-react and installs the tarballs into a scratch
  project, resolving every `exports` entry and rendering components with each peer
  framework against `components.json`; compares `dist/*.css` rules (headers and comments
  stripped) with the 1.1.1 baseline from npm, failing on any difference not listed in
  `dev/css-rule-allowlist.json`; checks the numbers and versions quoted in README.md,
  EVIDENCE.md and FIDELITY.md; checks relative links in Markdown; and runs
  `npm run fidelity:public` when a browser is installed, printing `skipped` (never a pass)
  when not. It writes its summary to `.verify/summary.md`.
- Before any publish, run `npm run verify` on the commit to be published and paste its
  summary into that version's CHANGELOG entry.
- `prepublishOnly` refuses to publish unless `CLIO_OWNER_RELEASE=1` is set, then runs
  `npm run verify`. **Agents never set `CLIO_OWNER_RELEASE`**, in any form (export, inline,
  `.npmrc`, scripts), and never run `npm publish`, `npm version`, `git tag` or `git push` for
  a release. Publishing is the owner's step.

