// End-to-end proof for clio.sounds with real packs (built by `npm run soundset` into the
// git-ignored packs/): a page loads a set and an alert list, clio.js plays a few sounds,
// and the page's own Web Audio output is recorded (the tap tooling/emulator/drive.ts
// uses) and compared with the decoded WAV by tooling/soundcompare.py: the right sound, at
// the manifest's gain, at the sound's own pitch.
//   node tooling/sound-proof.ts [set-slug] [code ...]     (defaults: platinum-sounds tabp mnuo)
//   CLIO_ENGINE=webkit|firefox node tooling/sound-proof.ts
import { createServer } from "node:http";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
import pw from "playwright";
interface Tap { on: boolean; chunks: Float32Array[]; ctx: AudioContext | null }
declare global { interface Window { __tap: Tap } }
declare const clio: { sounds: { use(set: string, alerts?: string): Promise<unknown> }; play(code: string): void };
const [slug = "platinum-sounds", ...codesArg] = process.argv.slice(2);
const codes = codesArg.length ? codesArg : ["tabp", "mnuo"];
const setUrl = `/packs/sets/${slug}/manifest.json`, alertUrl = "/packs/alerts/platinum/manifest.json";
if (!existsSync(join(root, setUrl))) { console.error(`${setUrl} missing: run npm run soundset first.`); process.exit(2); }
const out = join(root, ".fidelity/sound-proof"); mkdirSync(out, { recursive: true });
type Engine = "chromium" | "webkit" | "firefox";
const ENGINE = (process.env.CLIO_ENGINE || "chromium") as Engine;

const server = createServer((q, s) => {
  const f = join(root, decodeURIComponent(new URL(q.url ?? "/", "http://x").pathname));
  if (!f.startsWith(root) || !existsSync(f)) { s.writeHead(404); return s.end(); }
  s.writeHead(200, { "content-type": f.endsWith(".json") ? "application/json" : f.endsWith(".js") ? "text/javascript" : f.endsWith(".css") ? "text/css" : f.endsWith(".wav") ? "audio/wav" : "text/html" });
  s.end(readFileSync(f));
});
await new Promise<void>((r) => { server.listen(0, "127.0.0.1", () => r()); });
const addr = server.address();
if (!addr || typeof addr === "string") throw new Error("the sound server has no port");
const http = `http://127.0.0.1:${addr.port}`;
writeFileSync(join(out, "page.html"), `<!doctype html><html data-era="platinum"><head><meta charset="utf-8"><link rel="stylesheet" href="/dist/clio.css"></head><body><script src="/dist/clio.js"></script></body></html>`);

const browser = await pw[ENGINE].launch(ENGINE === "chromium" ? { args: ["--autoplay-policy=no-user-gesture-required"] } : ENGINE === "firefox" ? { firefoxUserPrefs: { "media.autoplay.default": 0, "media.autoplay.block-webaudio": false } } : {});
const page = await browser.newPage();
await page.addInitScript(() => {
  const tap: Tap = (window as unknown as { __tap: Tap }).__tap = { on: false, chunks: [], ctx: null };
  type Connect = (this: AudioNode, dest: AudioNode | AudioParam, ...rest: number[]) => unknown;
  const proto = AudioNode.prototype as unknown as { connect: Connect };
  const connect = proto.connect;
  proto.connect = function (this: AudioNode, dest: AudioNode | AudioParam, ...rest: number[]) {
    const r = connect.call(this, dest, ...rest);
    if (dest instanceof AudioDestinationNode && !(this instanceof ScriptProcessorNode) && !tap.ctx) {
      tap.ctx = this.context as AudioContext;
      const sp = tap.ctx.createScriptProcessor(1024, 1, 1);
      sp.onaudioprocess = (e: AudioProcessingEvent) => { if (tap.on) tap.chunks.push(e.inputBuffer.getChannelData(0).slice()); e.outputBuffer.getChannelData(0).fill(0); };
      connect.call(this, sp); connect.call(sp, tap.ctx.destination);
    }
    return r;
  };
});
await page.goto(`${http}/.fidelity/sound-proof/page.html`);
const loaded = await page.evaluate(async ([s, a]: [string, string]) => [await clio.sounds.use(s), await clio.sounds.use(a)], [setUrl, alertUrl] as [string, string]);
console.log(`${ENGINE}: loaded`, JSON.stringify(loaded));
await page.mouse.click(5, 5);   // a gesture, for engines that wait for one
const man = JSON.parse(readFileSync(join(root, setUrl), "utf8"));
const alerts = JSON.parse(readFileSync(join(root, alertUrl), "utf8"));
let bad = 0;
for (const code of [...codes, "alert"]) {
  const rate = await page.evaluate(async (code: string) => {
    const t = window.__tap; await t.ctx!.resume(); t.chunks = []; t.on = true;
    await new Promise((r) => setTimeout(r, 150));
    clio.play(code);
    await new Promise((r) => setTimeout(r, 1500));
    t.on = false; return t.ctx!.sampleRate;
  }, code);
  const data = await page.evaluate(() => { const c = window.__tap.chunks; const n = c.reduce((s, x) => s + x.length, 0), f = new Float32Array(n); let o = 0; for (const x of c) { f.set(x, o); o += x.length; } return Array.from(f); });
  const pcm = Buffer.alloc(data.length * 4); data.forEach((v, i) => pcm.writeFloatLE(v, i * 4));
  const h = Buffer.alloc(44); h.write("RIFF", 0); h.writeUInt32LE(36 + pcm.length, 4); h.write("WAVE", 8); h.write("fmt ", 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(3, 20); h.writeUInt16LE(1, 22); h.writeUInt32LE(rate, 24); h.writeUInt32LE(rate * 4, 28); h.writeUInt16LE(4, 32); h.writeUInt16LE(32, 34); h.write("data", 36); h.writeUInt32LE(pcm.length, 40);
  const cap = join(out, `${code}-${ENGINE}.wav`); writeFileSync(cap, Buffer.concat([h, pcm]));
  const ref = code === "alert" ? { file: alerts.alerts[alerts.selected].file, gain: 1, dir: "packs/alerts/platinum", rate: alerts.alerts[alerts.selected].rate } : { ...man.events[code].play, dir: `packs/sets/${slug}`, rate: man.sounds[man.events[code].play.sound].rate };
  const r = JSON.parse(execFileSync("python3", ["-I", join(root, "tooling/soundcompare.py"), cap, join(root, ref.dir, ref.file), "--rate", String(ref.rate)], { encoding: "utf8" }));
  // Chromium and WebKit resample linearly, as the comparison models: gain within 2%.
  // Firefox resamples with a windowed sinc, which the linear model fits worse (measured:
  // correlation 0.995-0.9999, fitted gain up to 8% high on short clicks).
  const tol = ENGINE === "firefox" ? 0.08 : 0.02;
  const good = r.correlation > 0.99 && Math.abs(r.gain - ref.gain) <= tol * Math.max(1, ref.gain);
  if (!good) bad++;
  console.log(`${good ? "ok  " : "FAIL"} ${code}: ${ref.file} at ${ref.rate} Hz into ${rate} Hz, gain ${r.gain} (manifest ${ref.gain}), correlation ${r.correlation}, ${r.samples} samples`);
}
await browser.close(); server.close();
process.exit(bad ? 1 : 0);
