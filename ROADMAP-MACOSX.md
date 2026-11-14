# Roadmap: the Mac OS X phase

Plan for taking clio.css from the Classic Mac OS eras to Mac OS X and NeXTSTEP, written
2026-11-14 from the state of the repository at 0.11.0. It starts when the Classic phase
passes its gate ([ROADMAP.md](ROADMAP.md), "Gate to Mac OS X"). The method is the one
that worked for Classic ([LESSONS.md](LESSONS.md)); this file only adds what is new.

Three requirements frame everything below:

1. **Every control in each era's HIG.** An era is done when every element its Human
   Interface Guidelines define has a row in COVERAGE.md with a status, the same way the
   Classic eras were held to HIG87, HIG92, IM-TE and HIG8.
2. **It goes back into AI System 6.** clio.css is the measured source of truth for AI
   System 6's appearances. Each era ships what AI System 6's primitives and capabilities
   need (section 3), not only what a static web page needs.
3. **Measured or labelled.** Unchanged from Classic: every value is measured from the
   real system, or labelled inferred, adapted or third-party.

## 1. Eras and where they are measured

AI System 6 has twelve appearances. Eight are Mac OS X or NeXT; one of those, Dewfall
(白露), is AI System 6's own skin and has nothing to measure.

| AI System 6 id | Real system | clio.css `data-era` | Emulator | Install media (TiPlus 7100, `Mac OS X Install Media/`) | HIG |
| --- | --- | --- | --- | --- | --- |
| `aqua` (2002) | Mac OS X 10.2 Jaguar | `aqua` | QEMU `qemu-system-ppc -M mac99` | `10.2-jaguar/` (2 CDs, MD5 ok) | *Aqua Human Interface Guidelines* (2001–2003) |
| `tiger` (2005) | Mac OS X 10.4 Tiger | `tiger` | Virtual Intel Mac (Quartz Extreme on); QEMU PPC as cross-check | `10.4-tiger-intel/` (iMac7,1 disc 1), `10.4-tiger-ppc/` (retail DVD) | *Apple Human Interface Guidelines* (2005/2006) |
| `nextstep` (1995) | OPENSTEP 4.2 for Intel (NeXTSTEP 3.3 look) | `nextstep` | QEMU `qemu-system-i386` | `openstep-4.2-intel/` (SHA256SUMS) | *NeXTSTEP User Interface Guidelines*, Release 3 (1993) |
| `snow-leopard` (2009) | Mac OS X 10.6 | `snowleopard` | Virtual Intel Mac | fetched by Virtual Intel Mac (Internet Archive) | *Apple HIG* (2009) |
| `lion` (2011) | 10.7 Lion, or 10.8 (see D2) | `lion` | Virtual Intel Mac | Apple CDN, SHA-256 in its catalog | *OS X HIG* (2011–2012) |
| `yosemite` (2014) | OS X 10.10 | `yosemite` | Virtual Intel Mac | Apple CDN | *OS X HIG* (2014) |
| `big-sur` (2020) | macOS 11 | `bigsur` | Virtual Intel Mac | Apple CDN | *Human Interface Guidelines: macOS* (2020) |
| `liquid-glass` (Dewfall) | none: AI System 6's own skin | — | — | — | — |

10.0 Cheetah, 10.1 Puma and 10.3 Panther media are on the drive as well; they are used
to confirm when a look first appeared and are not separate eras.

HIG sources found on the Internet Archive: `AquaHumanInterfaceGuidelines-Preliminary`
(2001), `apple-hig` (the Tiger/Leopard edition), and
`bitsavers_nextReleasInterfaceGuidelinesRelease3Nov93_9141848` (NeXTSTEP Release 3).
The OS X HIG (2014) is in Apple's documentation archive; the 2020 macOS HIG is in the
Wayback Machine. Fetch each into `.notes/hig/` (git-ignored) at the start of its phase
and cite page numbers in COVERAGE.md.

## 2. Decisions for the owner before P1

- **D1 Scope.** AGENTS.md limits clio.css to Mac OS X 10.0–10.4 and NeXTSTEP. AI System
  6 also ships Snow Leopard, Lion, Yosemite and Big Sur, and Virtual Intel Mac makes all
  four measurable. Recommendation: extend the scope to macOS 11 (phase P5), so all eleven
  measurable appearances can be fed back; Dewfall stays out.
- **D2 Lion or Mountain Lion.** AI System 6's `lion` appearance is dated 2011 (10.7);
  the owner has also called it 10.8. The two differ (10.8 dropped Lion's linen
  textures in places and redrew some controls). Pick one release to measure.
- **D3 Fonts.** Lucida Grande (10.0–10.9), Helvetica Neue (10.10) and SF (11) are
  Apple's or licensed to Apple; they are antialiased outline faces, so they cannot be
  rebuilt from pixels the way Chicago and Charcoal were. Options: local-only names with
  an OFL fallback fitted to measured metrics (the Asap precedent), or an OFL face
  chosen per era. Chinese chrome: STHeiti (华文黑体) is what 10.2–10.10 shipped; PingFang
  from 10.11. Same rule: local names only.
- **D4 Artwork.** Aqua's gel buttons, traffic lights, pinstripes and brushed metal are
  drawn bitmaps in the system's theme files (`Extras.rsrc`, later `ArtFile.bin`), not
  Quartz geometry. The Classic rule (art redrawn from measured pixels by a script,
  never a screenshot) still applies, but Aqua art is richer and more clearly authored.
  Decide how far reconstruction goes: per-pixel palette art for small parts (lamps,
  arrows, check marks) like Drawing Board, and fitted gradients for large surfaces.
- **D5 Builds and size.** Classic is at 193 KB of a 200 KB all-eras budget. Mac OS X
  ships as separate files: `clio.classic.css` (the four Classic eras), one file per Mac
  OS X era (`clio.aqua.css`, `clio.tiger.css`, …) and `clio.nextstep.css`;
  `clio.css` stays the Classic bundle for compatibility. Each Mac OS X era gets its own
  budget in `test/check.mjs`.
- **D6 Licence of the emulated systems.** Mac OS X client licences did not permit
  virtualisation. Screens are used as measurement evidence only and never shipped,
  as with Classic. The owner accepts or rejects this.

## 3. What AI System 6 needs from each era

AI System 6 builds every window from a fixed list of primitives (DESIGN.md, "Object
Vocabulary") and turns era features on through registry capabilities
(`apps/desktop/app/core/theme-registry.js`). Each era of clio.css must cover both.

**Primitives** (every era): `.window`, `.title-bar`, `.details-bar`, `.window-pane`;
`.btn`, `.mini-btn`, `.button-row`; `.field-row`, `.control-field`, `.select-wrap` (the
select harness); `.system-tabs`, `.system-tab`, `.system-tab-panel`; `.view-controls`,
`.view-btn`; `.menu-popover`, `.balloon-help`, `.finder-operation-modal`;
`.finder-item`, `.sys-icon`; the TDI document rail and the Finder sidebar.

**Capabilities by era** (from the registry):

| Era | Capabilities clio.css must draw |
| --- | --- |
| Aqua | pinstripe, traffic lights, minimize lamp, Dock, Window menu, fluid motion |
| Tiger | textured (brushed metal), unified toolbar, traffic lights, minimize lamp, Dock, Window menu, fluid motion |
| Snow Leopard | unified toolbar, traffic lights, minimize lamp, Dock, Window menu, fluid motion |
| Lion | the above plus overlay scroll bars and full screen |
| Yosemite | vibrancy, translucent sidebar, traffic lights, minimize lamp, Dock, full screen, Window menu, fluid motion |
| Big Sur | the above plus independent icons and window tabs; light and dark mode |
| NeXTSTEP | solid grayscale material and depth |

**Product constraints** that come with feeding AI System 6 (its CLAUDE.md and
DESIGN.md):

- Same DOM in every era. An era may change material, tokens and a CSS layout recipe;
  it may not need different markup. Where clio.css markup and AI System 6 markup
  differ, clio.css accepts AI System 6's class names as aliases (as it already does
  for `.close-box`, `.resize-box`, `.shade-box`).
- Touch and phone: AI System 6's coarse-pointer sizes and 44px hit areas stay; clio.css
  supplies `pointer: coarse` sizes per era as it does for Classic (**adapted** rows).
- Chinese UI text at the era's metrics (D3), and both languages in every specimen.
- Motion only on `transform`/`opacity`, interruptible, off under
  `prefers-reduced-motion` (AI System 6's red lines). Genie, sheets, drawers and the
  default-button pulse are measured, then rebuilt within those rules.
- AI System 6's floppy budget: it consumes the era's token layer, not the whole file.
- Delivery: per era, a token map from AI System 6's `--system-*`, `--btn-*`, `--window-*`
  tokens to `--clio-*`, so AI System 6 reads clio's values without changing its own
  components (the route agreed for Classic).

## 4. Controls each era must cover

The Mac OS X list below is from the Aqua HIG and the Apple HIG; each phase checks it
against its own edition and adds or strikes rows. Sizes: every control that the HIG
gives in regular, small and mini is drawn in all three.

**Windows**: document window (title bar, traffic lights with the unsaved dot and hover
symbols, proxy icon, toolbar button), active and inactive, main and key; utility
window and panel; brushed-metal (textured) window (10.2+); unified title and toolbar
(10.4); toolbar (icon, icon and text, text; customisation sheet not required);
sheet; drawer; alert (with the application icon badge); open and save panels (drawn
from the primitives above); window resize control; full screen (10.7+); window tabs
(10.12/11).

**Controls**: push button (rounded, regular/small/mini) and default button (with its
pulse); bevel, square, round, round-textured, recessed and gradient buttons; help
button; disclosure triangle and disclosure button; check box (incl. mixed); radio
button; pop-up menu, pull-down menu and command pop-down; combo box; text field,
secure field, search field (10.3+), token field (10.4+); date picker (10.4+); slider
(linear with and without ticks, circular); stepper (little arrows); segmented control
(10.3+); tab view (Jaguar's wrap tabs, then the 10.3+ segmented tabs); scroll bars
(arrows together and at ends, regular and small, inactive, overlay from 10.7);
progress bar (determinate, indeterminate barber pole), spinning progress indicator,
asynchronous arrows; level indicator (10.4+); image well, color well; table and outline
views with column headers, sort indicator, alternating rows and source list (sidebar);
column browser; split view dividers; group box (titled and untitled); separator;
placard; help tag (tool tip); focus ring.

**Menus**: menu bar (no Apple logo: a mark of the user's choice), Apple and application
menus, pull-down menus with icons, submenus, check marks, mixed state, dividers, key
equivalents with modifier glyphs, contextual menus, menu extras on the right,
translucent menus (10.5+ material, from D1).

**System chrome AI System 6 uses**: Dock with running-app indicators and magnification
(measured, motion within the red lines); desktop and icon labels; cursors (arrow,
I-beam, pointing hand, resize, busy).

**NeXTSTEP**: window with title bar, miniaturise and close buttons and resize bar;
menus as vertical panels with submenus and tear-off; buttons, switches (check boxes),
radio buttons, text fields, sliders, scrollers (left-side, arrows together),
browsers, pop-up and pull-down lists, panels (Open, Save, alert, Info), the Workspace
dock (tiles) and icon views, the NeXT focus and key-window states.

## 5. Phases

Each phase ends the way Classic batches did: build, `npm test`, `npm run fidelity`,
`npm run behaviour` in Chromium, WebKit and Firefox, push, Pages serving the new file,
CHANGELOG entry. Status letters: **M** measure, **B** browser work, **D** decision,
**F** feed back into AI System 6.

### P0 Infrastructure (no new era yet)

- **D1–D6** answered and written into AGENTS.md.
- **QEMU driver.** `tooling/emulator/qemu.mjs`: start a guest with a QMP socket, read
  the framebuffer with `screendump` (lossless, 1:1, no browser in between), send mouse
  and keys with `input-send-event` (absolute `usb-tablet`). Give it the same command
  file interface as `drive.mjs` (`shot`, `rec`, `film`, `move`, `click`, `key`), so
  the Classic measuring habits carry over unchanged.
- **Virtual Intel Mac route.** Check whether its QEMU exposes a monitor; if not, read
  pixels inside the guest with `screencapture` over its SSH remote login (Tiger has
  both), which gives the guest's own framebuffer. Record which route each frame used.
- **Guests.** Install Jaguar (QEMU PPC) and Tiger (Virtual Intel Mac) once, at the
  resolution the eras shipped with (1024×768), factory settings, and keep each disk
  image on TiPlus 7100 with a snapshot named `factory`. Every measurement starts from
  `factory` so settings drift cannot creep in (the Smart Scrolling lesson).
- **Builds.** Split files and budgets as decided in D5; add a minified clio.js.
- **Coverage skeleton.** Add the Mac OS X and NeXTSTEP tables to COVERAGE.md with every
  row from section 4 and status "—", so progress is a count of rows filled.

### P1 Aqua (10.2 Jaguar)

- **M** Window frame, pinstripe phase, traffic lights (states, hover symbols, unsaved
  dot), title text, toolbar button, sheets and drawers, menus and the menu bar.
- **M** Every control in section 4 that Jaguar has, at regular, small and mini, in
  every state; the focus ring; graphite as well as blue (a System Preferences
  setting, so both are measured from `factory` plus one change).
- **M** Motion: default-button pulse period and curve, sheet and drawer timing, genie
  frames, scroll-bar tracking (`rec` and `film`).
- **B** Art scripts (`tooling/aqua-art.py`) for lamps, arrows, check marks and bezels;
  fitted gradients for gel buttons and scroll thumbs; pinstripe as a 1×4 tile.
- **B** clio.js behaviours: sheets, drawers, default pulse, Window menu, minimise to the
  Dock (opacity and transform only).
- **F** Aqua token map into AI System 6, checked in its Theme Lab against the same
  frames; AI System 6 keeps its own sizes where its product rules differ.
- **Launch** (owner's rule): awesome lists and Show HN wait for this phase.

### P2 Tiger (10.4)

- **M** On Virtual Intel Mac with Quartz Extreme, cross-checked on QEMU PPC: unified
  toolbar, brushed metal, search field, token field, date picker, level indicator,
  segmented control, source list, Spotlight menu, Dashboard is out of scope.
- **B/F** As P1. In AI System 6, Tiger's `recipeBase` is Snow Leopard, so write the
  Tiger token map so that P5's Snow Leopard map can reuse it.

### P3 NeXTSTEP (OPENSTEP 4.2 for Intel)

- **M** Install per `openstep-4.2-intel/install-guide.html` in QEMU i386, apply Patch 4
  for the VESA driver, measure at 1024×768 in greyscale. The control set is small and
  flat, so this phase can run alongside P2.
- **D** Whether to also fetch NeXTSTEP 3.3 for Intel to match AI System 6's 1995 date;
  the look is the same family, the details are not.
- **F** NeXTSTEP token map; AI System 6 currently keeps Classic icons for this era.

### P4 Quartz rendering (clio-quartz)

Starts once P1 frames exist; runs alongside P2.

- **M** A test-pattern program run in the guest (built with the Developer Tools on the
  Tiger DVD): antialiased circles and lines at sub-pixel offsets, axial and radial
  gradients, alpha compositing, `CGContextSetShadow` at known blurs and offsets, the
  window server's window shadow, menu translucency. Capture each pattern 1:1.
- **B** A deterministic WASM rasteriser whose coverage, gradient interpolation and
  shadow kernel are fitted to those captures. At build time it renders nine-slice art
  and gradients into the era files, so clio.css stays CSS-only.
- **B** `clio-quartz.js` (optional, WebGPU with a Canvas 2D fallback): window shadows,
  menu and sidebar translucency, the genie effect. Without it everything falls back
  to the CSS approximation; with `prefers-reduced-motion` the motion is off.
- **Report** per effect in FIDELITY.md: identical, or the measured error. Text
  smoothing is recorded as not reproducible (it depends on the browser's rasteriser).

### P5 Later Mac OS X (if D1 extends the scope)

Snow Leopard, Lion or Mountain Lion (D2), Yosemite, Big Sur, in that order, each with
the P1 checklist. New material per era: Lion's overlay scroll bars and full screen,
Yosemite's vibrancy (`backdrop-filter`, with clio-quartz for the exact blur), Big
Sur's light and dark mode and window tabs.

### P6 Feeding back into AI System 6

Runs after each era, not at the end. One AI System 6 change per era, on its own
branch, through AI System 6's own gates (`verify:changed`, the cascade ledger, Theme
Lab fidelity). Each change: pin the clio.css release, add the token map for that
era's primitives and capabilities, compare Theme Lab before and after, record in AI
System 6's appearance evidence ledger that the values now come from clio.css.

## 6. Definition of done for an era

- Every row of that era in COVERAGE.md is yes, inferred or adapted; any "—" has a reason.
- Regular, small and mini sizes where the HIG defines them; active and inactive
  windows; pressed, disabled, focused, default and mixed states.
- Pixel specimens identical at 1x for everything Quartz does not antialias; for
  antialiased art, the measured error is in FIDELITY.md and does not grow.
- Behaviour checks for every clio.js feature of the era, in three engines.
- AI System 6 primitives and capabilities for the era all mapped; its Theme Lab passes.
- EVIDENCE.md rows for every value; README, llms.txt and components.json list the era.
- The era's single file is under its budget.

## 7. Risks

- Virtual Intel Mac's QEMU may not expose a monitor: the in-guest `screencapture`
  route covers it.
- QEMU PPC has no Quartz Extreme, so Jaguar's compositing is the software path it
  also used on most 2002 machines; Tiger's GPU effects come from Virtual Intel Mac.
- Antialiased text and art will not be pixel-identical in browsers; the target there
  is a measured, reported error, not a claim of identity.
- Aqua art is closer to authored illustration than Classic's; D4 sets the line.
