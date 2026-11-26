// Long-running emulator driver for Infinite Mac (https://infinitemac.org), the
// tool every clio.css measurement since 0.9 was taken with. Usage:
//   node tooling/emulator/drive.mjs "https://infinitemac.org/1999/Mac%20OS%209.0" .fidelity/run [w h]
//   tooling/emulator/d.sh .fidelity/run "click 18 9" "wait 500" "shot apple-menu"
// Frames land in <dir> (keep them under .fidelity/, which git ignores: they are
// Apple's screens and are never committed). See LESSONS.md.
// Append commands (one per line) to <dir>/cmd; results in <dir>/log.
//  move x y | down | up | click x y | dbl x y | drag x1 y1 x2 y2 | slowdrag x1 y1 x2 y2 | key K | keydown K | keyup K | type TEXT | cmd K | wait ms
//  shot NAME | burst NAME N MS (N canvas screenshots every MS ms) | arec | astop NAME
//  shot NAME (canvas png) | ctrlclick x y | ctrlup | shiftclick x y | dropzip FILE (drop a .zip onto the emulator)
//  rec x y w h ms [up | down | key K | X Y]   every animation frame of a crop, as [ms, hash] at each change -> rec.json (timing)
//  film x y w h ms [up | down | dbl X Y]  every changed frame of a crop as film/NNN-<ms>.png (animations)
//  pageshot NAME (the whole page, for the emulator's own controls) | pclick x y (page pixels) | ptext TEXT (click the page element with that text)
//  arec (start recording the emulator's audio output) | astop NAME (stop; NAME.wav, 32-bit float at the
//  AudioContext's rate, as the emulator handed it to Web Audio) | ainfo (contexts, rates and nodes seen)
//  (downloads: anything the page downloads, e.g. a file put in The Outside World > Uploads, lands in <dir>)
//  quit
import { readFileSync, writeFileSync, appendFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
// Playwright from this repo.
const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
interface Tap { on: boolean; chunks: Float32Array[][]; ctxs: AudioContext[]; seen: string[] }
declare global { interface Window { __clioTap: Tap } }
import pw from "playwright";
const [url, dir, W = "1200", H = "900"] = process.argv.slice(2);
const log = (s: string) => appendFileSync(`${dir}/log`, s + "\n");
writeFileSync(`${dir}/cmd`, ""); writeFileSync(`${dir}/log`, "");
const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const page = await b.newPage({ viewport: { width: +W, height: +H } });
// Files put in The Outside World > Uploads come to the browser as a .zip download: keep them.
page.on("download", async (d) => { const f = `${dir}/${d.suggestedFilename()}`; await d.saveAs(f); log("download " + f); });
// Web Audio tap: whatever the page connects to an AudioContext's destination is also fed to
// a recorder (a ScriptProcessor, which hands over every rendered quantum on the main
// thread), so the emulator's sound is captured as the browser was given it.
await page.addInitScript(() => {
  const tap: Tap = (window as unknown as { __clioTap: Tap }).__clioTap = { on: false, chunks: [], ctxs: [], seen: [] };
  const recorders = new WeakMap<BaseAudioContext, ScriptProcessorNode>();
  const recorderFor = (ctx: BaseAudioContext): ScriptProcessorNode => {
    let r = recorders.get(ctx);
    if (r) return r;
    r = ctx.createScriptProcessor(1024, 2, 2);
    r.onaudioprocess = (e: AudioProcessingEvent) => { const i = e.inputBuffer; if (tap.on) tap.chunks.push([i.getChannelData(0).slice(), i.getChannelData(1).slice()]); for (let c = 0; c < e.outputBuffer.numberOfChannels; c++) e.outputBuffer.getChannelData(c).fill(0); };
    r.connect(ctx.destination);
    recorders.set(ctx, r); tap.ctxs.push(ctx as AudioContext);
    return r;
  };
  type Connect = (this: AudioNode, dest: AudioNode | AudioParam, ...rest: number[]) => unknown;
  const proto = AudioNode.prototype as unknown as { connect: Connect };
  const connect = proto.connect;
  proto.connect = function (this: AudioNode, dest: AudioNode | AudioParam, ...rest: number[]) {
    const out = connect.call(this, dest, ...rest);
    if (dest instanceof AudioDestinationNode && !(this instanceof ScriptProcessorNode)) { tap.seen.push(this.constructor.name); connect.call(this, recorderFor(this.context)); }
    return out;
  };
});
await page.goto(url, { waitUntil: "domcontentloaded" });
await page.waitForSelector("canvas", { timeout: 120000 });
const at = async (x: number | string, y: number | string): Promise<[number, number]> => { const box = await page.locator("canvas").boundingBox(); if (!box) throw new Error("the emulator canvas has no box"); return [box.x + +x + 0.5, box.y + +y + 0.5]; };
log("ready");
let done = 0, recAt = 0;   // while recording, each command's start is logged as @ms after arec
for (;;) {
  const lines = readFileSync(`${dir}/cmd`, "utf8").split("\n").filter(Boolean);
  while (done < lines.length) {
    const [c, ...a] = lines[done++].split(" ");
    const at0 = recAt ? ` @${Date.now() - recAt}` : "";
    if (c === "arec") recAt = Date.now();
    try {
      if (c === "move") await page.mouse.move(...await at(a[0], a[1]), { steps: 5 });
      else if (c === "down") await page.mouse.down();
      else if (c === "up") await page.mouse.up();
      else if (c === "click") { await page.mouse.move(...await at(a[0], a[1]), { steps: 5 }); await page.waitForTimeout(100); await page.mouse.down(); await page.waitForTimeout(120); await page.mouse.up(); }
      else if (c === "dbl") { await page.mouse.move(...await at(a[0], a[1]), { steps: 5 }); for (let i = 0; i < 2; i++) { await page.mouse.down(); await page.waitForTimeout(60); await page.mouse.up(); await page.waitForTimeout(60); } }
      else if (c === "slowdrag") { const [x0, y0, x1, y1] = a.map(Number); await page.mouse.move(...await at(x0, y0), { steps: 4 }); await page.waitForTimeout(150); await page.mouse.down(); await page.waitForTimeout(400); for (let i = 1; i <= 20; i++) { await page.mouse.move(...await at(x0 + (x1 - x0) * i / 20, y0 + (y1 - y0) * i / 20), { steps: 4 }); await page.waitForTimeout(150); } await page.waitForTimeout(600); await page.mouse.up(); await page.waitForTimeout(2500); }
      else if (c === "drag") { await page.mouse.move(...await at(a[0], a[1]), { steps: 5 }); await page.mouse.down(); await page.waitForTimeout(300); await page.mouse.move(...await at(a[2], a[3]), { steps: 15 }); await page.waitForTimeout(300); await page.mouse.up(); }
      else if (c === "key") await page.keyboard.press(a.join(" "));
      else if (c === "keydown") await page.keyboard.down(a[0]);
      else if (c === "keyup") await page.keyboard.up(a[0]);
      else if (c === "type") { for (const ch of a.join(" ")) { await page.keyboard.press(ch === " " ? "Space" : ch); await page.waitForTimeout(80); } }
      else if (c === "cmd") { await page.keyboard.down("Meta"); await page.waitForTimeout(150); await page.keyboard.press(a[0]); await page.waitForTimeout(150); await page.keyboard.up("Meta"); }
      else if (c === "wait") await page.waitForTimeout(+a[0]);
      else if (c === "shot") { const b64 = await page.evaluate(() => document.querySelector("canvas")!.toDataURL("image/png").split(",")[1]); writeFileSync(`${dir}/${a[0]}.png`, Buffer.from(b64, "base64")); }
      else if (c === "burst") { const [name, n, ms] = a; for (let i = 0; i < +n; i++) { const b64 = await page.evaluate(() => document.querySelector("canvas")!.toDataURL("image/png").split(",")[1]); writeFileSync(`${dir}/${name}-${i}.png`, Buffer.from(b64, "base64")); if (ms) await page.waitForTimeout(+ms); } log(`burst ${name} x${n} @${ms}ms`); }
      else if (c === "shiftclick") { await page.mouse.move(...await at(a[0], a[1]), { steps: 5 }); await page.keyboard.down("Shift"); await page.waitForTimeout(100); await page.mouse.down(); await page.waitForTimeout(120); await page.mouse.up(); await page.keyboard.up("Shift"); }
      else if (c === "ctrlclick") { await page.mouse.move(...await at(a[0], a[1]), { steps: 5 }); await page.keyboard.down("Control"); await page.waitForTimeout(200); await page.mouse.down(); await page.waitForTimeout(1500); }
      else if (c === "ctrlup") { await page.mouse.up(); await page.keyboard.up("Control"); }
      else if (c === "dropzip") {
        const zip = readFileSync(a.join(" ")).toString("base64"); const name = a.join(" ").split("/").pop() ?? "upload.zip";
        await page.evaluate(async ([b64, name]: [string, string]) => {
          const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
          const dt = new DataTransfer(); dt.items.add(new File([bin], name, { type: "application/zip" }));
          const t = document.querySelector("canvas")!; const r = t.getBoundingClientRect();
          for (const e of ["dragenter", "dragover", "drop"]) t.dispatchEvent(new DragEvent(e, { dataTransfer: dt, bubbles: true, cancelable: true, clientX: r.x + 200, clientY: r.y + 200 }));
        }, [zip, name] as [string, string]);
      }
      else if (c === "rec") {
        // rec x y w h ms [moveX moveY | up | down | key K]: record a crop every animation frame; optional action at start
        const [x, y, w, h, ms] = a.slice(0, 5).map(Number); const act = a.slice(5);
        const p = page.evaluate(([x, y, w, h, ms]: [number, number, number, number, number]) => new Promise<[number, number][]>((res) => {
          const cv = document.querySelector("canvas")!; const g = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
          g.canvas.width = w; g.canvas.height = h; const out: [number, number][] = []; const t0 = performance.now(); let last: number | null = null;
          const step = () => { g.drawImage(cv, x, y, w, h, 0, 0, w, h); const d = g.getImageData(0, 0, w, h).data; let s = 0; for (let i = 0; i < d.length; i += 4) s = (s * 31 + d[i] + d[i + 1] * 3 + d[i + 2] * 7) >>> 0;
            const t = Math.round(performance.now() - t0); if (s !== last) { out.push([t, s]); last = s; } if (t < ms) requestAnimationFrame(step); else res(out); };
          requestAnimationFrame(step);
        }), [x, y, w, h, ms] as [number, number, number, number, number]);
        if (act[0] === "up") { await page.waitForTimeout(30); await page.mouse.up(); }
        else if (act[0] === "down") { await page.waitForTimeout(30); await page.mouse.down(); }
        else if (act[0] === "key") { await page.waitForTimeout(30); await page.keyboard.press(act[1]); }
        else if (act.length === 2) { await page.waitForTimeout(30); await page.mouse.move(...await at(act[0], act[1]), { steps: 2 }); }
        writeFileSync(`${dir}/rec.json`, JSON.stringify(await p));
      }
      else if (c === "film") {
        // film x y w h ms [dbl X Y]: every changed frame of a crop as a PNG, with its time
        const [x, y, w, h, ms] = a.slice(0, 5).map(Number); const act = a.slice(5);
        const p = page.evaluate(([x, y, w, h, ms]: [number, number, number, number, number]) => new Promise<[number, string][]>((res) => {
          const cv = document.querySelector("canvas")!; const g = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
          g.canvas.width = w; g.canvas.height = h; const out: [number, string][] = []; const t0 = performance.now(); let last: number | null = null;
          const step = () => { g.drawImage(cv, x, y, w, h, 0, 0, w, h); const d = g.getImageData(0, 0, w, h).data; let s = 0; for (let i = 0; i < d.length; i += 4) s = (s * 31 + d[i] + d[i + 1] * 3 + d[i + 2] * 7) >>> 0;
            const t = Math.round(performance.now() - t0); if (s !== last) { out.push([t, g.canvas.toDataURL("image/png")]); last = s; } if (t < ms) requestAnimationFrame(step); else res(out); };
          requestAnimationFrame(step);
        }), [x, y, w, h, ms] as [number, number, number, number, number]);
        if (act[0] === "up") { await page.waitForTimeout(30); await page.mouse.up(); }
        if (act[0] === "down") { await page.waitForTimeout(30); await page.mouse.down(); }
        if (act[0] === "dbl") { await page.waitForTimeout(30); await page.mouse.move(...await at(act[1], act[2]), { steps: 2 }); for (let i = 0; i < 2; i++) { await page.mouse.down(); await page.waitForTimeout(60); await page.mouse.up(); await page.waitForTimeout(60); } }
        const frames = await p; const fs = await import("node:fs"); fs.mkdirSync(`${dir}/film`, { recursive: true });
        frames.forEach(([t, url], i) => fs.writeFileSync(`${dir}/film/${String(i).padStart(3, "0")}-${t}.png`, Buffer.from(url.split(",")[1], "base64")));
      }
      else if (c === "pageshot") await page.screenshot({ path: `${dir}/${a[0]}.png` });
      else if (c === "pclick") await page.mouse.click(+a[0], +a[1]);
      else if (c === "ptext") await page.getByText(a.join(" "), { exact: true }).first().click();
      else if (c === "arec") await page.evaluate(() => { const t = window.__clioTap; t.chunks = []; t.on = true; for (const x of t.ctxs) x.resume && x.resume(); });
      else if (c === "ainfo") log("audio " + JSON.stringify(await page.evaluate(() => { const t = window.__clioTap; return { contexts: t.ctxs.map((x) => [x.sampleRate, x.state, x.baseLatency]), nodes: t.seen, chunks: t.chunks.length }; })));
      else if (c === "astop") {
        const { rate, l, r } = await page.evaluate(() => {
          const t = window.__clioTap; t.on = false;
          const n = t.chunks.reduce((s, c) => s + c[0].length, 0), L = new Float32Array(n), R = new Float32Array(n);
          let o = 0; for (const [a, b] of t.chunks) { L.set(a, o); R.set(b, o); o += a.length; }
          t.chunks = [];
          const b64 = (f: Float32Array) => { const u = new Uint8Array(f.buffer); let s = ""; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode(...u.subarray(i, i + 0x8000)); return btoa(s); };
          return { rate: t.ctxs[0] ? t.ctxs[0].sampleRate : 0, l: b64(L), r: b64(R) };
        });
        const L = new Float32Array(new Uint8Array(Buffer.from(l, "base64")).buffer), R = new Float32Array(new Uint8Array(Buffer.from(r, "base64")).buffer);
        const n = L.length, data = Buffer.alloc(n * 8);
        for (let i = 0; i < n; i++) { data.writeFloatLE(L[i], i * 8); data.writeFloatLE(R[i], i * 8 + 4); }
        const h = Buffer.alloc(44);
        h.write("RIFF", 0); h.writeUInt32LE(36 + data.length, 4); h.write("WAVE", 8); h.write("fmt ", 12); h.writeUInt32LE(16, 16);
        h.writeUInt16LE(3, 20); h.writeUInt16LE(2, 22); h.writeUInt32LE(rate, 24); h.writeUInt32LE(rate * 8, 28); h.writeUInt16LE(8, 32); h.writeUInt16LE(32, 34);
        h.write("data", 36); h.writeUInt32LE(data.length, 40);
        writeFileSync(`${dir}/${a[0]}.wav`, Buffer.concat([h, data]));
        log(`audio ${a[0]}.wav ${n} frames at ${rate} Hz`);
      }
      else if (c === "quit") { log("bye"); await b.close(); process.exit(0); }
      if (c === "astop") recAt = 0;
      log("ok " + lines[done - 1] + at0);
    } catch (e) { log("ERR " + lines[done - 1] + " " + (e as Error).message.split("\n")[0]); }
  }
  await page.waitForTimeout(200);
}
