# Appearance sound sets: feasibility study

Owner's question (2026-11-15): can the sound sets of Mac OS 8.5–9's Appearance Manager,
such as the 44 collected in Macintosh Repository's
[More System Sound Sets for Appearance Manager](https://www.macintoshrepository.org/6749-more-system-sound-sets-for-appearance-manager),
become an optional enhancement pack for clio.css, reproduced as faithfully as possible?

**Answer: yes, completely.** The format is known and already partly decoded here, every
sound can be extracted losslessly, and every sound event the Mac defined can be tied to a
clio.js event. The one limit is distribution, not fidelity: the sounds belong to Apple and
to the sets' authors, so the pack is built from your own copies and kept out of the npm
package and the public repository.

## 1. What a sound set is

| | |
| --- | --- |
| File | type `tsnd` (creator probably `appr`), in System Folder › Appearance › Sound Sets |
| Sounds | `'snd '` resources |
| Map | `'snd#'` 1000: one-shot effects; `'snd#'` 1001: drag loops. Each entry: the event's four-character code, its class bit (1 windows, 2 menus, 4 controls, 8 Finder), and up to four `'snd '` IDs (the first that exists plays) |
| Two layouts | Mac OS 8.5b6 beta sets: a 32-bit count, 20-byte entries (read here from DrawingBoard Sounds). Release sets: a 16-bit version and count, 44-byte entries (zenwheel/bluebox's reading, checked against 219 files) |
| Audio | DrawingBoard Sounds: 8-bit samples at 11,127 and 22,255 Hz and extended 16-bit at 44.1 kHz. Third-party sets may use compressed `cmpSH` (MACE 3:1/6:1, IMA4), all documented and decodable |
| Setting | Appearance › Sound: a sound track (default "Platinum Sounds" in Apple's figure) and four check boxes, Menus, Windows, Controls, Finder (mask bits 2, 1, 4, 8) |
| Playing | `PlayThemeSound` plays one sound once, asynchronously; `BeginThemeDragSound`/`EndThemeDragSound` loop one sound for a drag, only one at a time |

Already on this machine (from the Mac OS 8.5b6 Beta Themes archive the owner approved on
2026-11-14): **DrawingBoard Sounds** (121 sounds, 92 effects, 11 drag loops), **Gizmo Sounds**
(66) and **Hi-Tech Sounds** (40), all Apple's. Platinum Sounds is in Mac OS 8.5–9 itself and
in the Macintosh Repository archive.

## 2. The events, and where clio.js already has them

Apple's `Appearance.h` defines 116 sound kinds and 14 drag loops.

| Mac event (codes) | clio.js today |
| --- | --- |
| Menus: open, close, item hilite, item release (`mnuo mnuc mnui mnus`) | menu tracking: open, switch, light, choose |
| Window box parts: press, enter, exit, release for close, zoom, collapse (`wcl* wzm* wco*`), utility windows (`ucl* uzm* uco*`) | held controls (data-clio-off gives enter and exit) |
| Window actions: open, close, zoom in/out, collapse up/down, activate (`wopn wcls wzmi wzmo wcol wexp wact`, utility `u…`) | collapse; open/close/activate need a hook (`clio:open`, `clio:close`, focus) |
| Dialogs and alerts open/close (`dopn dlgc aopn altc`), pop-up windows (`pwop pwcl`) | the alert observer of the current sounds interface; `<dialog>` toggle events |
| Buttons: plain, default, cancel, each press/enter/exit/release (`btn* dbt* cbt*`) | held controls; Return and Esc |
| Check boxes, radio buttons, bevel buttons, pop-up buttons, disclosure triangles, tabs, little arrows (`chk* rad* bev* pop* dsc* tab* la*`) | held controls, pop-up menus |
| Scroll bars: arrow press/enter/exit/release, track press, end of track (`sba* sbtp sbte`); sliders (`sltp slte`) | element scroll bars; sliders need a hook |
| Balloons open/close (`blno blnc`) | `.balloon` shown/hidden |
| Drag loops: move and grow window, utility window, dialog, alert; icon; slider and scroll thumb and their ghosts; held arrows (`wmov wgro umov ugro dmov amov imov slth slgh sbth sbgh sbad sbai drag`) | window drag (outline), scroll-box drag (live or outline), held arrows |
| Drag Manager and Finder (`dthi dtuh dtdr ftrs fsel fnew fdrp fcpd fral flap dski dske fdon fdof`) | no Finder in clio.css: `clio.play('ftrs')` for pages that have one |

So most of the 130 events fire from what clio.js already tracks; window open/close and
sliders need small hooks, and the Finder's are the page's to call.

## 3. How it would be built

1. **`tooling/soundset.py`** reads a sound set (or the `.sit` archive, through `unar`, which is
   installed): both `snd#` layouts, every `'snd '` (format 1 and 2; `stdSH`, `extSH`, `cmpSH`
   with MACE 3:1, MACE 6:1 and IMA4 decoders). It writes each sound as a lossless WAV at its
   own sample rate and bit depth, plus `manifest.json` (event → file, class, loop or one-shot,
   loop points from the sound header).
2. **clio.js** loads a manifest (`clio.sounds.use("sounds/drawingboard/manifest.json")`),
   decodes every sound into Web Audio buffers up front (no first-play delay), plays one-shots
   asynchronously and overlapping as the Mac did, keeps exactly one drag loop running, and
   honours the four classes (`data-clio-sounds="menus windows controls finder"`). Off unless
   a page loads a set; muted while the page is hidden.
3. **Checks**: decoding compared sample for sample with the same sounds captured from the
   emulator's audio output (Infinite Mac plays them; the driver needs a Web Audio tap
   added for this); behaviour checks that each event plays its sound once and
   each drag loop starts and stops.
4. **Default set per era**: Drawing Board era plays DrawingBoard Sounds, Platinum plays
   Platinum Sounds, when the owner turns sounds on; System 6/7 had no sound tracks (only the
   alert beep).

Estimate: the decoder and manifest a day; the clio.js player and event hooks a day; checks
half a day.

## 4. Distribution

- **Apple's sets** (Platinum, DrawingBoard, Gizmo, Hi-Tech): Apple's copyright.
- **Third-party sets** (the other 40): their authors' copyright; many also carry music, film
  or game sound (Star Wars, Terminator 2, Final Fantasy, Myst, Looney Tunes, Pac-Man,
  Windows sounds).
- So: the tool and the player ship in clio.css; the sounds do not. `npm run soundset` builds
  the pack from your copies into a git-ignored folder. Whether to serve a pack on
  aisystem6.aaronlau.me or aaronlau.me is the owner's decision (a personal, non-commercial
  page; the rights holders could still ask for removal).

## 5. Owner's decisions (2026-11-15)

1. **Both archives downloaded** into the git-ignored `.fidelity/soundsets/`, SHA-1 as the site
   lists: `Sound_Sets.sit` 21,315,909 bytes `cfd86614dd8094d6fd6383e34afc864e0464ba13`;
   `9-more-Sound-Sets.sit` 7,649,048 bytes `830a286fc78d6cad085aeceea83b522de97c28cf`.
2. **Packs are served on the owner's sites** (aisystem6.aaronlau.me, aaronlau.me), built from
   these copies; they stay out of the npm package and the public repository.
3. **Built in 0.12.1**, with the other items moved there.
4. Still open: the default set per era (proposed: DrawingBoard Sounds for Drawing Board,
   Platinum Sounds for Platinum).

## 5½. Inventory of the first archive (35 sets)

- Every release set uses the 44-byte layout: `snd#` 1000 has all 116 effect kinds (5,108
  bytes), `snd#` 1001 all 14 drag loops (620 bytes). Only the 8.5b6 DrawingBoard Sounds uses
  the beta's 20-byte layout (92 effects, 11 loops).
- Platinum Sounds: 68 sounds, all extended 16-bit. Apple's four sets: Platinum, DrawingBoard,
  Gizmo, Hi-Tech.
- Encodings across the sets: 8-bit `stdSH` (most), extended 8- and 16-bit, μ-law (`cmpSH`
  'ulaw', the Terminator 2 set), and 11 sounds in a rarer layout (format 2 or a short
  header) for the decoder to handle. No MACE or IMA4 in this archive.
- The second archive (9 sets; Clickz and SGI Sounds repeat the first's) uses the same layout
  and adds IMA4 (BLACKSILVER), a `cmpSH` whose format field is zero (MACE by compression
  ID, Windose98) and 15 rarer-layout sounds (Windows NT). So the decoder needs 8- and 16-bit
  PCM, μ-law, IMA4 and MACE 3:1/6:1: 42 distinct sets, 116 kinds and 14 loops each.

## 6. Found on the way

The Drawing Board theme file carries its own cursors (4 `crsr` resources); clio.css's Drawing
Board era uses the Platinum arrow. A candidate for 0.12.1.
