# Appearance sound sets and alert sounds

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
4. **Default set per era** (decided 2026-11-15, second round): DrawingBoard Sounds for
   Drawing Board, Platinum Sounds for Platinum.
5. **What the sites serve** (2026-11-15): Apple's four sets (Platinum, DrawingBoard, Gizmo,
   Hi-Tech) and the alert sounds only; the 38 third-party sets stay local (`packs --all`).
   Both aisystem6.aaronlau.me and aaronlau.me, from one Cloudflare R2 address, never a git
   repository.
6. **On the sites, sounds start off**: a toggle modelled on Appearance > Sound (sound track,
   the four class check boxes), remembered in the visitor's browser.
7. **Still to measure**: push buttons and the delay field again on a lightly loaded emulator.
   Mac OS 8.5's alert list was measured on 2026-11-15 (6 sounds, Sosumi selected; §8).
8. **Release**: with the rest of 0.12.1, published by the owner.

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

## 7. System 6 and System 7 (checked in Infinite Mac, 2026-11-15)

Neither has interface sounds: menus, windows and controls are silent. Sound tracks arrived
with the Appearance Manager in Mac OS 8.5. What they have is the **alert sound**
(`SysBeep`, played by alerts and errors), chosen in the Sound control panel:

- **System 6.0.8** (Control Panel › Sound, frame `.fidelity/snd6/sound`): Simple Beep,
  Clink-Klank, Boing, Monkey. Speaker volume 0–7.
- **System 7.5.3** (Sound control panel › Alert Sounds, frames `.fidelity/snd7/`): Basil, Bend
  Me, Blue Dust, Bye!, Dewdrop, Droplet, Indigo, Jacaranda, Natal, Quack, Ryan's Hope,
  Sheet, Simple Beep, Solly, Sosumi, Transvaal, Wild Eep (17; Sosumi selected in Infinite
  Mac). System 7.0's own set was Droplet, Indigo, Quack, Simple Beep, Sosumi, Wild Eep; the
  others came with later releases and models, which ones in which is not checked here,
  nor the factory default.
- Both live as `'snd '` resources in the System file. To extract them: copy the System file
  out through Infinite Mac's Uploads folder, or read Apple's freely released System 6.0.8 and
  7.5.3 install disks; then the same decoder as the sound sets.
- For clio.js: an era's alert sound plays for an alert (`.alert-box`, the `alert` event the
  sound interface already has), with the era's list to choose from; the startup chime is the
  ROM's, outside the system.

## 8. Built (0.12.1, 2026-11-15): what was measured and what is inferred

The tool (`tooling/soundset.py`), the player (clio.js `clio.sounds`) and the checks are in
this repository; the sounds are in the git-ignored `packs/` only (`npm run soundset`, from
`.fidelity/soundsets/`: both archives and `alerts-src/`, the files the emulator handed out).

### Decoding

| | Result |
| --- | --- |
| Sets | 42: both archives, Clickz 1.0 and SGI Sounds once each; Wet SoundSet 1.0 kept although its sounds and map equal Aqua SoundSet 1.0's; oddworld soundset found by its map (its Finder info is gone) |
| Layouts | 8.5b6 (DrawingBoard Sounds only): `u32` count, 20-byte entries `code, id×3, class, n, 0, 0, 5`; release: `u16` 1, `u16` count, 44-byte entries `code, class, flags, delay, 0, 4 × (id, level, Fixed)` |
| Encodings | `stdSH` 8-bit; `extSH` 8/16-bit mono and stereo; `cmpSH` μ-law (Terminator 2), IMA4 (BLACKSILVER, 4), MACE 3:1 (Windose98, 1) |
| "Rarer layouts" | the 26 sounds of §5½ are empty `'snd '` resources (LooneyTunes 9, PlasticWrap 1, Squeaky Chair 1, Windows NT 15): kept as silent |
| Lossless | every PCM sound byte for byte (8-bit stays unsigned 8-bit); IMA4 and μ-law identical to Apple's AudioToolbox decoder and ffmpeg (`soundset.py selftest`: 31/31); IMA4 carries its predictor across packets unless the header's index differs or its predictor is more than 127 away, as AudioToolbox does; MACE through ffmpeg's decoder (not checked against Apple's) |
| Sizes | every sound's frame count equals its header's; 2 copied loop points run past the end (Gizmo 136, Matrix 509), clamped by the browser |

### Alert sounds

| Era | Got out of the emulator | Notes |
| --- | --- | --- |
| System 6.0.8 | the System file, MacBinary through BlueSCSI SD Transfer (System 6's Outside World) | Boing, Monkey decoded; Simple Beep is a square-wave synth (`timbreCmd`, `freqCmd` 69, an `ampCmd` ramp) and Clink-Klank a sample played by `freqDurationCmd` 60 then 48: both kept as recorded |
| System 7.5.3 | the 16 sampled sounds dragged out of the System suitcase to Uploads (copying the whole System file gave a fork zeroed after 3.6 MB) | Simple Beep recorded |
| Mac OS 8.5 | Monitors & Sound > Alerts (8.5 has no Sound control panel): the six sounds played from the list, each recorded with `arec`/`astop` | list and Sosumi's selection from the panel (`.fidelity/snd-m85/alerts.png`); the System suitcase holds five `snd ` resources (Droplet, Indigo, Quack, Sosumi, Wild Eep); a single sound copies into The Outside World, but the 8.5 image then generates no zip download (the 9.0 image does), so nothing leaves the emulator and all six are recordings (four of them the samples System 7.5.3 ships), not decodes of 8.5's file |
| Mac OS 9.0 | the 12 sounds dragged out of the System suitcase | SimpleBeep recorded; no longer used for Drawing Board (8.5 measured) |

Infinite Mac selects Sosumi in System 7.5.3, Mac OS 8.5 and Mac OS 9.0 and Simple Beep in
System 6; the factory defaults were not checked (the saved image's own state). Mac OS 9.0's
sound track is None there.

Mac OS 8.5's alert list is six: Droplet, Indigo, Laugh, Simple Beep, Sosumi, Wild Eep, with
Sosumi selected. Played from the list and recorded, four of them are the samples System
7.5.3 also ships, matched by `soundcompare.py` against its decoded `snd ` resources: Droplet
correlation 0.999947 (gain 0.998), Indigo 0.999915 (0.997), Sosumi 0.999893 (0.995), Wild Eep
0.999776 (0.995). Laugh does not match Mac OS 9.0's Laugh (correlation -0.065): 8.5's is a
different sample, kept as recorded. The suitcase's five sounds are Droplet, Indigo, Quack,
Sosumi and Wild Eep — Quack is in the file but not in the list, and Laugh is in the list but
not in the file, so at least one of the six does not come from the System file (not traced).

### Against the emulator (`drive.mjs` arec/astop, `soundcompare.py`)

| Sound | Output | Result |
| --- | --- | --- |
| Sheet, Dewdrop, Basil (7.5.3, 16-bit 44.1 kHz stereo) | 22,050 Hz | identical at every sample (38,245, 42,877, 55,568): decimated 2:1, mixed (L+R)>>1 |
| Sosumi, Wild Eep, Droplet (11,127 Hz), Indigo (22,254 Hz), 8-bit | 22,050 Hz, 8-bit values with the byte repeated | correlation 0.99984-0.99997, gain 0.995-0.998; a 16.16 linear-interpolation model reproduces 88-94% of samples exactly, the rest ±1 step (Sound Manager's converter not fully modelled) |
| Boing, Monkey (6.0.8) | Mini vMac 22,254.5 Hz, labelled 22,050 Hz by Infinite Mac | correlation 0.997, 0.995 at the true rate |
| Temple, Sosumi (Mac OS 9.0) | 22,050 Hz, filtered converter | correlation 0.9998 |

### Sound-set semantics (Mac OS 9.0 with Platinum Sounds)

- **Measured**: a slot's level is a gain of level/255, 0 = full (tabp 185 -> 0.730, tabr 0 ->
  0.986, chke/chkx 55 -> 0.22, mnui 205 -> 0.84, button 205 -> 0.81, wmov idle 45 -> 0.168).
  The sound that plays is the first slot whose `'snd '` exists (check box press and release
  both played slot 0 whichever way the box went).
- **Measured**: a held window drag repeats the loop section of its idle sound until release.
- **Inferred**: the drag slots' roles, attack, moving, idle, release, from Platinum's own
  sound names; DrawingBoard's three as attack, loop, release ("wmov (release)").
- **Not settled, not used**: the per-slot Fixed value (laup 1, ladp -1, laur -2, ladr -4,
  btnp 4: not a pitch; a button with 4 sounded at its own pitch) and the entry's delay field
  (40-225). Timing in this emulator is unreliable: sounds load lazily from its network disk
  and the host was under load (a menu's open sound came 1.3 s after the press). clio.js plays
  press and release as the map defines them.
- **2026-11-18, Mac OS 8.5 (fresh image)**: Appearance > Sound ships with the track **None**;
  with **Platinum Sounds** and all four classes ticked, a File menu measured an open sound
  (105 ms, peak 0.15) and a close sound (40 ms, peak 0.16), so the play path works. In the same session
  four push buttons made **no** sound at all: Appearance's Save Theme… control, the Save Theme
  dialog's Cancel (quick click, and a 2 s hold then release), and SimpleText's Don't Save
  (2 s hold then release) — every recording is digital silence (peak 0.0), while an alert
  sound in the 9.0 image recorded at 0.56 through the same tap. This does not reproduce the
  earlier "Save Theme… on press, Cancel on release", so the button case is open: the next
  test is the 9.0 image with Platinum Sounds enabled (where the 205 -> 0.81 button was
  recorded) and a standard dialog button.
- Theme sounds came out about 15 cents flat against their own rate, alert sounds at 0 cents:
  not explained, not applied.

### The player

`clio.sounds.use(url, { era, alert })` loads a set (default eras Drawing Board and Platinum)
or an alert list (its manifest's eras); `clio.play(code[, el])`, `clio.play("alert")`;
`clio.sounds.beginDrag(code) / dragMove() / endDrag()`; `muted`, `volume`,
`alertSound(era[, name])`; `data-clio-sounds` classes; a `clio:sound` event per sound. The
idle loop takes over 6 ticks after the last move (chosen). Each manifest names, per kind,
the sound, the gain and the loop points, so the player interprets nothing.

### Default set per era

Decided (§5.4): DrawingBoard Sounds for Drawing Board, Platinum Sounds for Platinum
(`packs/index.json` `defaults`).

### Push buttons and the delay field, re-measured (2026-11-15, light load)

Mac OS 9.0 in Infinite Mac, Appearance > Sound: Platinum Sounds selected, all four classes
checked (`.fidelity/snd-push/pop2.png`); the output works (a Sound control panel alert recorded
at peak 0.44). Records in `.fidelity/snd-push/cap/`.

| Action (3 repeats) | What plays | When |
| --- | --- | --- |
| File menu held 3 s and released | two different sounds, each 0.10–0.13 s, peaks 0.43 and 0.44 | press sound 75–85 ms after the press (531 ms on the first try: the set loading from the network disk), release sound 15–30 ms after the release |
| Set Desktop (Appearance > Desktop) | nothing | — |
| a tab in the Appearance window | nothing | — |

The two menu sounds did not match any of Platinum Sounds' 68 decoded sounds by cross
correlation (best 0.32, against `mnuc`): their `'snd '` IDs are not identified, so the table
stops at what was heard. **2026-11-18:** the Appearance Manager's code is now available for
reading — the 9.0 System file exports intact through The Outside World and its data fork
carries the AppearanceLib symbol table (`PlayThemeSound`, `PlayThemeControlSound`,
`BeginThemeDragSound`, `EndThemeDragSound` at 0x1e1b32); the button-press/release rule and the
delay field can be settled from the code. Push buttons stay **inconsistent**: silent here (Set Desktop, a tab),
press on Save Theme… and release on Cancel in the previous run; clio.js is unchanged. The
per-slot `Fixed` value and the entry's delay field were not measured either.
