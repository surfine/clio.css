// The minified builds parse to the same rules as the full ones: every rule's selector
// (as the browser serialises it) and declarations (whitespace and #abc/#aabbcc aside).
//   node tooling/min-check.mjs        (Chromium, WebKit and Firefox through Playwright)
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
let playwright;
for (const base of [join(root, "package.json"), join(process.env.AIS6_DIR || "/Users/aaron/AI System 6", "package.json")]) { try { playwright = createRequire(base)("playwright"); break; } catch {} }
if (!playwright) { console.error("Playwright not found (npm i -D playwright, or set AIS6_DIR)."); process.exit(2); }
let failed = 0;
for (const engine of ["chromium", "webkit", "firefox"]) {
  const browser = await playwright[engine].launch(); const page = await browser.newPage();
  for (const n of ["clio", "clio.system6", "clio.system7", "clio.platinum", "clio.drawingboard"]) {
    const r = await page.evaluate(([full, min]) => {
      const rules = (css) => { const s = new CSSStyleSheet(); s.replaceSync(css); const out = []; const walk = (rs) => { for (const x of rs) { out.push((x.selectorText || x.conditionText || x.name || "") + " || " + (x.style ? x.style.cssText : "").replace(/#([0-9a-f])([0-9a-f])([0-9a-f])(?![0-9a-f])/gi, "#$1$1$2$2$3$3").replace(/\s+/g, "").toLowerCase()); if (x.cssRules) walk(x.cssRules); } }; walk(s.cssRules); return out; };
      const a = rules(full), b = rules(min); let diff = 0; for (let i = 0; i < Math.max(a.length, b.length); i++) if (a[i] !== b[i]) diff++;
      return { rules: a.length, diff };
    }, [readFileSync(join(root, "dist", n + ".css"), "utf8"), readFileSync(join(root, "dist", n + ".min.css"), "utf8")]);
    if (r.diff) failed++;
    console.log(`${r.diff ? "FAIL" : "ok  "} ${n}.min.css: ${r.rules} rules, ${r.diff} differ (${engine})`);
  }
  await browser.close();
}
process.exit(failed ? 1 : 0);
