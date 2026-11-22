// Static contract for ts/clio-sounds-panel.ts (the worker's job); behaviour is checked in a browser by the controller.
import { readFileSync, existsSync } from "node:fs";
const f = "ts/clio-sounds-panel.ts", d = "test/sounds-panel.html";
let bad = 0; const ok = (c, m) => { if (!c) { bad++; console.log("FAIL " + m); } };
ok(existsSync(f), f + " exists"); ok(existsSync(d), d + " exists");
const s = existsSync(f) ? readFileSync(f, "utf8") : "";
ok(/window\.clioSoundsPanel\s*=/.test(s), "defines window.clioSoundsPanel");
ok(!/^\s*(import|export)\s/m.test(s), "no ES module syntax");
ok(s.includes('"clio-sounds-panel"') || s.includes("'clio-sounds-panel'"), "localStorage key clio-sounds-panel");
ok((s.match(/try\s*{/g) || []).length >= 2, "storage access wrapped in try/catch");
for (const w of ["Menus", "Windows", "Controls", "Finder", "None", "Sound track"]) ok(s.includes(w), "label " + w);
ok(/clio!?\.sounds\.use\(/.test(s) && /clio!?\.sounds\.muted\s*=/.test(s), "uses clio.sounds.use and muted");   // clio! : the TypeScript source
ok(/data-clio-sounds/.test(s) && /"none"|'none'/.test(s), "sets data-clio-sounds, none when all unchecked");
ok(/index\.json/.test(s), "reads index.json");
ok(!/https?:\/\//.test(s), "no hard-coded URL");
ok(!/style\s*=|\.style\./.test(s), "no inline style");
ok(/destroy\s*\(/.test(s), "returns destroy()");
const h = existsSync(d) ? readFileSync(d, "utf8") : "";
ok(h.includes("clio-sounds-panel.js") && h.includes("data-era=\"platinum\""), "demo page loads the panel in Platinum");
console.log(bad ? `FAIL ${bad}` : "ok sounds-panel contract"); process.exit(bad ? 1 : 0);
