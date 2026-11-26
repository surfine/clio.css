import { CANCEL, DEFAULT, ALERT, TICK, isUtility, optedOut } from "./shared.ts";

interface SoundRef { file: string; sound?: string; gain?: number; loop?: [number, number] }
interface Manifest {
  name?: string; source?: string; selected?: string; list?: unknown; eras?: string[];
  sounds?: Record<string, { rate: number }>; alerts?: Record<string, { file: string; rate: number }>;
  events?: Record<string, { play?: SoundRef; class: number }>; loops?: Record<string, { roles?: Record<string, SoundRef>; class: number }>;
}
interface SoundSet { url: string; man: Manifest; files: Map<string, AudioBuffer>; eras: string[] | null }
interface Playing { src: AudioBufferSourceNode; g: GainNode }
interface Drag { code: string; era: string; el: Element | null | undefined; set: SoundSet; roles: Record<string, SoundRef>; mode: string | null; node: Playing | null; timer: number }

/* ---- Sounds ------------------------------------------------------------- */
// The Appearance Manager's sound tracks (Mac OS 8.5-9) and each era's alert sound.
// None ship: they are Apple's and the sets' authors'. tooling/soundset.py turns your
// own copies into WAV files and a manifest; clio.sounds.use(url) loads one and
// decodes every sound into Web Audio buffers up front. Nothing plays until a page
// loads one. A sound set plays for the Appearance eras (Drawing Board, Platinum:
// System 6 and 7 had no interface sounds, only the alert sound); an alert list plays
// for the eras its manifest names. One-shots overlap, as PlayThemeSound's did;
// exactly one drag loop runs at a time (BeginThemeDragSound/EndThemeDragSound).
// data-clio-sounds="menus windows controls finder" on <html> keeps those classes
// (Appearance > Sound's check boxes; absent: all four, "none": silent);
// clio.sounds.muted silences the page; nothing plays while the page is hidden.
// Every sound played is announced as a clio:sound event on the document.
const CLASS_BITS: Record<string, number> = { windows: 1, menus: 2, controls: 4, finder: 8 };
const APPEARANCE_ERAS = ["drawingboard", "platinum"];
const snd: { ctx: AudioContext | null; out: GainNode | null; sets: SoundSet[]; alerts: SoundSet[]; drag: Drag | null; muted: boolean; volume: number; alert: Record<string, string> } = { ctx: null, out: null, sets: [], alerts: [], drag: null, muted: false, volume: 1, alert: {} };
const legacy: Record<string | symbol, unknown> = {};   // clio.sounds.alert = "beep.wav": the 0.11 interface, still honoured
const eraOf = (el?: Element | null) => { const h = el instanceof Element ? el.closest("[data-era]") : document.documentElement.closest("[data-era]"); return (h && h.getAttribute("data-era")) || "system6"; };
function classesOn() {
  const v = document.documentElement.getAttribute("data-clio-sounds");
  if (v == null || !v.trim()) return 15;
  let m = 0; for (const t of v.toLowerCase().split(/\s+/)) m |= CLASS_BITS[t] || 0;
  return m;
}
const silent = () => snd.muted || document.hidden;
function audio() {
  if (snd.ctx) return snd.ctx;
  const AC = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  snd.ctx = new AC();
  snd.out = snd.ctx.createGain(); snd.out.gain.value = snd.volume; snd.out.connect(snd.ctx.destination);
  // A context made before any gesture starts suspended (autoplay policy): the first
  // press or key wakes it; the sounds that press makes then play.
  const wake = () => { if (snd.ctx!.state === "suspended" && !document.hidden) snd.ctx!.resume().catch(() => {}); };
  for (const t of ["pointerdown", "keydown", "touchend"]) document.addEventListener(t, wake, true);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { endDrag(true); snd.ctx!.suspend().catch(() => {}); } else wake();
  });
  return snd.ctx;
}
// WAV (PCM 8-bit unsigned or 16-bit, any channels) to an AudioBuffer at the sound's
// own rate, read here so the 'snd ' header's exact rate (11127.27 Hz, not the WAV's
// whole 11127) is kept and no decoder resamples on the way.
function wavBuffer(ctx: AudioContext, data: ArrayBuffer, rate: number | undefined) {
  const v = new DataView(data); let p = 12, fmt: { ch: number; rate: number; bits: number } | null = null, at = 0, len = 0;
  while (p + 8 <= v.byteLength) {
    const id = String.fromCharCode(v.getUint8(p), v.getUint8(p + 1), v.getUint8(p + 2), v.getUint8(p + 3)), n = v.getUint32(p + 4, true);
    if (id === "fmt ") fmt = { ch: v.getUint16(p + 10, true), rate: v.getUint32(p + 12, true), bits: v.getUint16(p + 22, true) };
    else if (id === "data") { at = p + 8; len = Math.min(n, v.byteLength - at); }
    p += 8 + n + (n & 1);
  }
  if (!fmt || !len) throw new Error("not a PCM WAV");
  const step = fmt.bits / 8, frames = Math.floor(len / (step * fmt.ch));
  const buf = ctx.createBuffer(fmt.ch, Math.max(1, frames), rate || fmt.rate);
  for (let c = 0; c < fmt.ch; c++) {
    const d = buf.getChannelData(c);
    for (let i = 0; i < frames; i++) {
      const o = at + (i * fmt.ch + c) * step;
      d[i] = fmt.bits === 8 ? (v.getUint8(o) - 128) / 128 : v.getInt16(o, true) / 32768;
    }
  }
  return buf;
}
async function use(url: string, opts: ClioSoundsUseOptions = {}) {
  const ctx = audio();
  if (!ctx) return null;
  const base = new URL(url, document.baseURI);
  const man: Manifest = await (await fetch(base)).json();
  const files = new Map<string, AudioBuffer>();
  const want = new Map<string, number>();   // file -> exact rate
  const add = (r: SoundRef | undefined) => { if (r && r.file && man.sounds && man.sounds[r.sound!]) want.set(r.file, man.sounds[r.sound!]!.rate); };
  if (man.alerts) for (const a of Object.values(man.alerts)) want.set(a.file, a.rate);
  for (const e of Object.values(man.events || {})) add(e.play);
  for (const e of Object.values(man.loops || {})) for (const r of Object.values(e.roles || {})) add(r);
  await Promise.all([...want].map(async ([file, rate]) => {
    const res = await fetch(new URL(file, base));
    if (res.ok) files.set(file, wavBuffer(ctx, await res.arrayBuffer(), rate));
  }));
  const eras = opts.era ? ([] as string[]).concat(opts.era) : man.eras || (man.alerts ? null : APPEARANCE_ERAS);
  const entry: SoundSet = { url: String(base), man, files, eras };
  if (man.alerts) { snd.alerts = snd.alerts.filter((x) => x.url !== entry.url); snd.alerts.push(entry); if (opts.alert) for (const e of eras || []) snd.alert[e] = opts.alert; }
  else { snd.sets = snd.sets.filter((x) => x.url !== entry.url); snd.sets.push(entry); }
  return { name: man.name || man.source, sounds: files.size };
}
const setFor = (era: string) => { for (let i = snd.sets.length - 1; i >= 0; i--) { const s = snd.sets[i]!; if (!s.eras || s.eras.includes("*") || s.eras.includes(era)) return s; } return null; };
const alertsFor = (era: string) => { for (let i = snd.alerts.length - 1; i >= 0; i--) { const s = snd.alerts[i]!; if (!s.eras || s.eras.includes("*") || s.eras.includes(era)) return s; } return null; };
function startSound(set: SoundSet, ref: SoundRef | undefined, opts: { loop?: boolean } = {}): Playing | null {
  const buf = ref && ref.file && set.files.get(ref.file);
  if (!buf || silent()) return null;
  const ctx = snd.ctx!, src = ctx.createBufferSource(), g = ctx.createGain();
  src.buffer = buf; g.gain.value = ref!.gain == null ? 1 : ref!.gain;
  if (opts.loop) {
    src.loop = true;
    if (ref!.loop) { src.loopStart = ref!.loop[0] / buf.sampleRate; src.loopEnd = ref!.loop[1] / buf.sampleRate; }
  }
  src.connect(g).connect(snd.out!);
  src.start();
  src.onended = () => g.disconnect();
  return { src, g };
}
const announceSound = (code: string, kind: string, era: string, el?: Element | null) => document.dispatchEvent(new CustomEvent("clio:sound", { detail: { code, kind, era, target: el instanceof Element ? el : null } }));
// clio.play(code[, element]): an Appearance sound kind ('mnuo', 'btnp', 'ftrs', ...) from
// the set for the element's era, or "alert" for the era's alert sound.
export function play(code: string, el?: Element | null) {
  if (typeof legacy[code] === "string") {   // the 0.11 interface: a URL per name
    if (!document.documentElement.hasAttribute("data-clio-sounds") || silent()) return;
    try { const a = new Audio(legacy[code] as string); a.play().catch(() => {}); } catch {}
    return;
  }
  if (!snd.ctx || silent()) return;
  const era = eraOf(el);
  if (code === "alert") {
    const list = alertsFor(era); if (!list) return;
    const name = snd.alert[era] || list.man.selected, a = list.man.alerts![name!];
    if (a && startSound(list, { file: a.file, gain: 1 })) announceSound("alert", "alert", era, el);
    return;
  }
  const set = setFor(era); if (!set) return;
  const e = set.man.events && set.man.events[code];
  if (!e || !e.play || !(e.class & classesOn())) return;
  if (startSound(set, e.play)) announceSound(code, "one-shot", era, el);
}
// Drag loops: attack once, then the moving loop while the pointer moves and the idle
// loop while it holds still (measured, Platinum's window drag), the release sound at
// the end. Starting another drag ends the one running.
const IDLE_AFTER = 6 * TICK;
export function beginDrag(code: string, el?: Element | null) {
  endDrag(true);
  if (!snd.ctx || silent()) return;
  const era = eraOf(el), set = setFor(era); if (!set) return;
  const e = set.man.loops && set.man.loops[code];
  if (!e || !e.roles || !(e.class & classesOn())) return;
  snd.drag = { code, era, el, set, roles: e.roles, mode: null, node: null, timer: 0 };
  startSound(set, e.roles.attack);
  loopMode("idle");
  announceSound(code, "loop-start", era, el);
}
function loopMode(mode: string) {
  const d = snd.drag; if (!d || d.mode === mode) return;
  if (d.node) { try { d.node.src.stop(); } catch {} d.node = null; }
  d.mode = mode; d.node = startSound(d.set, d.roles[mode], { loop: true });
}
export function dragMove() {
  const d = snd.drag; if (!d) return;
  loopMode("moving");
  clearTimeout(d.timer); d.timer = setTimeout(() => loopMode("idle"), IDLE_AFTER);
}
export function endDrag(quiet?: boolean) {
  const d = snd.drag; if (!d) return;
  snd.drag = null; clearTimeout(d.timer);
  if (d.node) { try { d.node.src.stop(); } catch {} }
  if (!quiet) startSound(d.set, d.roles.release);
  announceSound(d.code, "loop-stop", d.era, d.el);
}

// Which sound kind a pressed control is: [prefix] + p (press), e (enter), x (exit), r (release).
function controlKind(el: Element) {
  const tb = el.closest(".title-bar > *");
  if (tb && tb.parentElement!.parentElement && tb.parentElement!.parentElement!.matches(".window")) {
    const u = isUtility(tb) ? "u" : "w";
    if (tb.matches(".close, .close-box")) return u + "cl";
    if (tb.matches(".zoom, .resize, .resize-box")) return u + "zm";
    if (tb.matches(".shade, .shade-box, .collapse")) return u + "co";
    return null;
  }
  if (el.matches("input[type=checkbox]")) return "chk";
  if (el.matches("input[type=radio]")) return "rad";
  if (el.matches(".bevel")) return "bev";
  if (el.matches(".disclosure")) return "dsc";
  if (el.matches('[role="tab"]')) return "tab";
  if (el.matches(".little-arrows > *")) return "la";
  if (el.matches(".control-strip-module, .control-strip-scroll")) return null;
  if (el.matches(DEFAULT)) return "dbt";
  if (el.matches(CANCEL)) return "cbt";
  return "btn";
}
export function controlSound(el: Element | null, phase: string) {
  const k = el && controlKind(el); if (!k) return;
  if (k === "la") {   // little arrows: up and down press and release apart, enter and exit shared
    const up = el!.matches(".up, :first-child");
    return play(phase === "p" ? (up ? "laup" : "ladp") : phase === "r" ? (up ? "laur" : "ladr") : phase === "e" ? "lare" : "larx", el);
  }
  play(k + phase, el);
}

// Windows, dialogs, alerts and balloons appearing and going: an observer, so pages need
// no calls. A window that loses .inactive is activated.
const OPENABLE = ".window, .modal-dialog, .standard-dialog, .modeless-dialog, .alert-box, dialog, [role=dialog], [role=alertdialog], .balloon";
const visible = (el: Element) => el.isConnected && el.getClientRects().length > 0;
function openKind(el: Element, open: boolean) {
  if (el.matches(".balloon")) return open ? "blno" : "blnc";
  if (el.matches(ALERT)) return open ? "aopn" : "altc";
  if (el.matches(".modal-dialog, .standard-dialog, .modeless-dialog, dialog, [role=dialog]") && !el.matches(".window")) return open ? "dopn" : "dlgc";
  if (el.matches(".window.modal-dialog, .window.movable-modal")) return open ? "dopn" : "dlgc";
  return (isUtility(el) ? "u" : "w") + (open ? "opn" : "cls");
}
function opened(el: Element) {
  if (optedOut(el)) return;
  if (el.matches(ALERT) || (el.querySelector && el.querySelector(ALERT))) play("alert", el);
  play(openKind(el, true), el);
}
const gone = (el: Element, parent: Element | null) => { if (!optedOut(parent || el)) play(openKind(el, false), parent || document.documentElement); };

const sounds = {
  use,
  play,
  beginDrag,
  dragMove,
  endDrag: () => endDrag(false),
  get muted() { return snd.muted; },
  set muted(v: boolean) { snd.muted = !!v; if (v) endDrag(true); },
  get volume() { return snd.volume; },
  set volume(v: number) { snd.volume = Math.max(0, Math.min(1, +v || 0)); if (snd.out) snd.out.gain.value = snd.volume; },
  // the alert sound by name, per era: clio.sounds.alertSound("platinum", "Sosumi")
  alertSound(era: string, name?: string) { if (name === undefined) { const l = alertsFor(era); return snd.alert[era] || (l && l.man.selected) || null; } snd.alert[era] = name; },
  get loaded() { return { sets: snd.sets.map((s) => ({ name: s.man.name, eras: s.eras })), alerts: snd.alerts.map((s) => ({ name: s.man.source, eras: s.eras, list: s.man.list })) }; },
};
export const soundsApi = new Proxy(sounds, {   // the 0.11 interface: clio.sounds.alert = "url"
  set(t, k, v) { if (k in t) { (t as Record<string | symbol, unknown>)[k] = v; return true; } legacy[k] = v; return true; },
  get(t, k) { return k in t ? (t as Record<string | symbol, unknown>)[k] : legacy[k]; },
});

export function install(): void {
  new MutationObserver((records) => {
    if (!snd.ctx && !Object.keys(legacy).length) return;
    for (const r of records) {
      if (r.type === "attributes") {
        const el = r.target as HTMLElement;
        if (!el.matches(OPENABLE)) continue;
        if (r.attributeName === "class") {
          if (el.matches(".window") && (r.oldValue || "").split(/\s+/).includes("inactive") && !el.classList.contains("inactive")) play(isUtility(el) ? "uact" : "wact", el);
          continue;
        }
        const now = visible(el) && !el.hidden, was = r.attributeName === "open" ? r.oldValue !== null : r.oldValue === null;
        if (now && !was) opened(el); else if (!now && was) gone(el, el);
        continue;
      }
      for (const n of r.addedNodes) if (n instanceof Element && !n.closest(".clio-sb-anchor, .clio-outline, .clio-live, .clio-popup-menu, .clio-move-menu")) {
        const el = n.matches(OPENABLE) ? n : n.querySelector(OPENABLE);
        if (el && visible(el)) opened(el);
      }
      for (const n of r.removedNodes) if (n instanceof Element && n.matches(OPENABLE) && !(n as HTMLElement).hidden) gone(n, r.target instanceof Element ? r.target : null);
    }
  }).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeOldValue: true, attributeFilter: ["open", "hidden", "class"] });


  // Sliders (input[type=range]): the press, the thumb's drag loop (live), the end of the track.
  document.addEventListener("pointerdown", (e) => {
    const r = e.button === 0 && e.target instanceof Element && e.target.closest<HTMLInputElement>("input[type=range]");
    if (!r || r.disabled || optedOut(r) || !snd.ctx) return;
    play("sltp", r); beginDrag("slth", r);
    let last = r.value;
    const atEnd = () => r.value === r.max || r.value === r.min || (r.max === "" && r.value === "100") || (r.min === "" && r.value === "0");
    const move = (ev: PointerEvent) => { if (ev.pointerId !== e.pointerId) return; dragMove(); if (r.value !== last) { last = r.value; if (atEnd()) play("slte", r); } };
    const up = (ev: PointerEvent) => { if (ev.pointerId !== e.pointerId) return; document.removeEventListener("pointermove", move, true); document.removeEventListener("pointerup", up, true); document.removeEventListener("pointercancel", up, true); endDrag(); };
    document.addEventListener("pointermove", move, true); document.addEventListener("pointerup", up, true); document.addEventListener("pointercancel", up, true);
  }, true);
}
