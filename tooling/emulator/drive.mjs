// Long-running emulator driver for Infinite Mac (https://infinitemac.org), the
// tool every clio.css measurement since 0.9 was taken with. Usage:
//   node tooling/emulator/drive.mjs "https://infinitemac.org/1999/Mac%20OS%209.0" .fidelity/run [w h]
//   tooling/emulator/d.sh .fidelity/run "click 18 9" "wait 500" "shot apple-menu"
// Frames land in <dir> (keep them under .fidelity/, which git ignores: they are
// Apple's screens and are never committed). See LESSONS.md.
// Append commands (one per line) to <dir>/cmd; results in <dir>/log.
//  move x y | down | up | click x y | dbl x y | drag x1 y1 x2 y2 | slowdrag x1 y1 x2 y2 | key K | type TEXT | cmd K | wait ms
//  shot NAME (canvas png) | ctrlclick x y | ctrlup | dropzip FILE (drop a .zip onto the emulator)
//  rec x y w h ms [up | down | key K | X Y]   every animation frame of a crop, as [ms, hash] at each change -> rec.json (timing)
//  film x y w h ms [up | down | dbl X Y]  every changed frame of a crop as film/NNN-<ms>.png (animations)
//  quit
import { createRequire } from "node:module";
import { readFileSync, writeFileSync, appendFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
// Playwright from this repo, or from an AI System 6 checkout (AIS6_DIR), as tooling/fidelity.mjs.
const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
let pw;
for (const base of [join(root, "package.json"), join(process.env.AIS6_DIR || "/Users/aaron/AI System 6", "package.json")]) { try { pw = createRequire(base)("playwright"); break; } catch {} }
if (!pw) { console.error("Playwright not found (npm i -D playwright, or set AIS6_DIR)."); process.exit(2); }
const [url, dir, W = "1200", H = "900"] = process.argv.slice(2);
const log = (s) => appendFileSync(`${dir}/log`, s + "\n");
writeFileSync(`${dir}/cmd`, ""); writeFileSync(`${dir}/log`, "");
const b = await pw.chromium.launch();
const page = await b.newPage({ viewport: { width: +W, height: +H } });
await page.goto(url, { waitUntil: "domcontentloaded" });
await page.waitForSelector("canvas", { timeout: 120000 });
let box; const at = async (x, y) => { box = await page.locator("canvas").boundingBox(); return [box.x + +x + 0.5, box.y + +y + 0.5]; };
log("ready");
let done = 0;
for (;;) {
  const lines = readFileSync(`${dir}/cmd`, "utf8").split("\n").filter(Boolean);
  while (done < lines.length) {
    const [c, ...a] = lines[done++].split(" ");
    try {
      if (c === "move") await page.mouse.move(...await at(a[0], a[1]), { steps: 5 });
      else if (c === "down") await page.mouse.down();
      else if (c === "up") await page.mouse.up();
      else if (c === "click") { await page.mouse.move(...await at(a[0], a[1]), { steps: 5 }); await page.waitForTimeout(100); await page.mouse.down(); await page.waitForTimeout(120); await page.mouse.up(); }
      else if (c === "dbl") { await page.mouse.move(...await at(a[0], a[1]), { steps: 5 }); for (let i = 0; i < 2; i++) { await page.mouse.down(); await page.waitForTimeout(60); await page.mouse.up(); await page.waitForTimeout(60); } }
      else if (c === "slowdrag") { const [x0, y0, x1, y1] = a.map(Number); await page.mouse.move(...await at(x0, y0), { steps: 4 }); await page.waitForTimeout(150); await page.mouse.down(); await page.waitForTimeout(400); for (let i = 1; i <= 20; i++) { await page.mouse.move(...await at(x0 + (x1 - x0) * i / 20, y0 + (y1 - y0) * i / 20), { steps: 4 }); await page.waitForTimeout(150); } await page.waitForTimeout(600); await page.mouse.up(); await page.waitForTimeout(2500); }
      else if (c === "drag") { await page.mouse.move(...await at(a[0], a[1]), { steps: 5 }); await page.mouse.down(); await page.waitForTimeout(300); await page.mouse.move(...await at(a[2], a[3]), { steps: 15 }); await page.waitForTimeout(300); await page.mouse.up(); }
      else if (c === "key") await page.keyboard.press(a.join(" "));
      else if (c === "type") { for (const ch of a.join(" ")) { await page.keyboard.press(ch === " " ? "Space" : ch); await page.waitForTimeout(80); } }
      else if (c === "cmd") { await page.keyboard.down("Meta"); await page.waitForTimeout(150); await page.keyboard.press(a[0]); await page.waitForTimeout(150); await page.keyboard.up("Meta"); }
      else if (c === "wait") await page.waitForTimeout(+a[0]);
      else if (c === "shot") { const b64 = await page.evaluate(() => document.querySelector("canvas").toDataURL("image/png").split(",")[1]); writeFileSync(`${dir}/${a[0]}.png`, Buffer.from(b64, "base64")); }
      else if (c === "ctrlclick") { await page.mouse.move(...await at(a[0], a[1]), { steps: 5 }); await page.keyboard.down("Control"); await page.waitForTimeout(200); await page.mouse.down(); await page.waitForTimeout(1500); }
      else if (c === "ctrlup") { await page.mouse.up(); await page.keyboard.up("Control"); }
      else if (c === "dropzip") {
        const zip = readFileSync(a.join(" ")).toString("base64"); const name = a.join(" ").split("/").pop();
        await page.evaluate(async ([b64, name]) => {
          const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
          const dt = new DataTransfer(); dt.items.add(new File([bin], name, { type: "application/zip" }));
          const t = document.querySelector("canvas"); const r = t.getBoundingClientRect();
          for (const e of ["dragenter", "dragover", "drop"]) t.dispatchEvent(new DragEvent(e, { dataTransfer: dt, bubbles: true, cancelable: true, clientX: r.x + 200, clientY: r.y + 200 }));
        }, [zip, name]);
      }
      else if (c === "rec") {
        // rec x y w h ms [moveX moveY | up | down | key K]: record a crop every animation frame; optional action at start
        const [x, y, w, h, ms] = a.slice(0, 5).map(Number); const act = a.slice(5);
        const p = page.evaluate(([x, y, w, h, ms]) => new Promise((res) => {
          const cv = document.querySelector("canvas"); const g = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
          g.canvas.width = w; g.canvas.height = h; const out = []; const t0 = performance.now(); let last = null;
          const step = () => { g.drawImage(cv, x, y, w, h, 0, 0, w, h); const d = g.getImageData(0, 0, w, h).data; let s = 0; for (let i = 0; i < d.length; i += 4) s = (s * 31 + d[i] + d[i + 1] * 3 + d[i + 2] * 7) >>> 0;
            const t = Math.round(performance.now() - t0); if (s !== last) { out.push([t, s]); last = s; } if (t < ms) requestAnimationFrame(step); else res(out); };
          requestAnimationFrame(step);
        }), [x, y, w, h, ms]);
        if (act[0] === "up") { await page.waitForTimeout(30); await page.mouse.up(); }
        else if (act[0] === "down") { await page.waitForTimeout(30); await page.mouse.down(); }
        else if (act[0] === "key") { await page.waitForTimeout(30); await page.keyboard.press(act[1]); }
        else if (act.length === 2) { await page.waitForTimeout(30); await page.mouse.move(...await at(act[0], act[1]), { steps: 2 }); }
        writeFileSync(`${dir}/rec.json`, JSON.stringify(await p));
      }
      else if (c === "film") {
        // film x y w h ms [dbl X Y]: every changed frame of a crop as a PNG, with its time
        const [x, y, w, h, ms] = a.slice(0, 5).map(Number); const act = a.slice(5);
        const p = page.evaluate(([x, y, w, h, ms]) => new Promise((res) => {
          const cv = document.querySelector("canvas"); const g = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
          g.canvas.width = w; g.canvas.height = h; const out = []; const t0 = performance.now(); let last = null;
          const step = () => { g.drawImage(cv, x, y, w, h, 0, 0, w, h); const d = g.getImageData(0, 0, w, h).data; let s = 0; for (let i = 0; i < d.length; i += 4) s = (s * 31 + d[i] + d[i + 1] * 3 + d[i + 2] * 7) >>> 0;
            const t = Math.round(performance.now() - t0); if (s !== last) { out.push([t, g.canvas.toDataURL("image/png")]); last = s; } if (t < ms) requestAnimationFrame(step); else res(out); };
          requestAnimationFrame(step);
        }), [x, y, w, h, ms]);
        if (act[0] === "up") { await page.waitForTimeout(30); await page.mouse.up(); }
        if (act[0] === "down") { await page.waitForTimeout(30); await page.mouse.down(); }
        if (act[0] === "dbl") { await page.waitForTimeout(30); await page.mouse.move(...await at(act[1], act[2]), { steps: 2 }); for (let i = 0; i < 2; i++) { await page.mouse.down(); await page.waitForTimeout(60); await page.mouse.up(); await page.waitForTimeout(60); } }
        const frames = await p; const fs = await import("node:fs"); fs.mkdirSync(`${dir}/film`, { recursive: true });
        frames.forEach(([t, url], i) => fs.writeFileSync(`${dir}/film/${String(i).padStart(3, "0")}-${t}.png`, Buffer.from(url.split(",")[1], "base64")));
      }
      else if (c === "quit") { log("bye"); await b.close(); process.exit(0); }
      log("ok " + lines[done - 1]);
    } catch (e) { log("ERR " + lines[done - 1] + " " + e.message.split("\n")[0]); }
  }
  await page.waitForTimeout(200);
}
