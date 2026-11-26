// The minified builds parse to the same rules as the full ones: every rule's selector
// (as the browser serialises it) and declarations (whitespace and #abc/#aabbcc aside).
//   node tooling/min-check.ts        (Chromium, WebKit and Firefox through Playwright)
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
import playwright from "playwright";
let failed = 0;
for (const engine of ["chromium", "webkit", "firefox"] as const) {
  const browser = await playwright[engine].launch(); const page = await browser.newPage();
  for (const n of ["clio", "clio.system6", "clio.system7", "clio.platinum", "clio.drawingboard"]) {
    const r = await page.evaluate(([full, min]: [string, string]) => {
      type Rule = CSSRule & { selectorText?: string; conditionText?: string; name?: string; style?: CSSStyleDeclaration; cssRules?: CSSRuleList };
      const rules = (css: string): string[] => { const s = new CSSStyleSheet(); s.replaceSync(css); const out: string[] = []; const walk = (rs: CSSRuleList) => { for (const rule of rs) { const x = rule as Rule; out.push((x.selectorText || x.conditionText || x.name || "") + " || " + (x.style ? x.style.cssText : "").replace(/#([0-9a-f])([0-9a-f])([0-9a-f])(?![0-9a-f])/gi, "#$1$1$2$2$3$3").replace(/\s+/g, "").toLowerCase()); if (x.cssRules) walk(x.cssRules); } }; walk(s.cssRules); return out; };
      const a = rules(full), b = rules(min); let diff = 0; for (let i = 0; i < Math.max(a.length, b.length); i++) if (a[i] !== b[i]) diff++;
      return { rules: a.length, diff };
    }, [readFileSync(join(root, "dist", n + ".css"), "utf8"), readFileSync(join(root, "dist", n + ".min.css"), "utf8")] as [string, string]);
    if (r.diff) failed++;
    console.log(`${r.diff ? "FAIL" : "ok  "} ${n}.min.css: ${r.rules} rules, ${r.diff} differ (${engine})`);
  }
  await browser.close();
}
process.exit(failed ? 1 : 0);
