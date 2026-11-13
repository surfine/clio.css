// Static checks for a release. Fails loudly; prints what it checked.
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { components } from "../components/index.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");
const failures = [];
const fail = (m) => failures.push(m);
let checks = 0;
const ok = (cond, m) => { checks++; if (!cond) fail(m); };

// 1. Outputs exist.
const outputs = ["clio.css", "clio.min.css", "clio.system6.css", "clio.system6.min.css", "clio.platinum.css", "clio.platinum.min.css", "components.json", "fonts/ChicagoFLF.woff2", "fonts/Asap-Variable.woff2", "fonts/OFL-Asap.txt"];
for (const f of outputs) ok(existsSync(join(root, "dist", f)), `missing dist/${f}`);

const css = read("dist/clio.css");
const s6 = read("dist/clio.system6.css");
const pt = read("dist/clio.platinum.css");

// 2. Braces balance (outside strings) in every build.
for (const [name, text] of [["clio.css", css], ["clio.system6.css", s6], ["clio.platinum.css", pt], ["clio.min.css", read("dist/clio.min.css")]]) {
  const stripped = text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/"(?:[^"\\]|\\.)*"/g, '""');
  let depth = 0, bad = false;
  for (const ch of stripped) { if (ch === "{") depth++; if (ch === "}") depth--; if (depth < 0) bad = true; }
  ok(depth === 0 && !bad, `${name}: unbalanced braces`);
}

// 3. Every custom property that is read is declared somewhere.
const noComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
const declared = new Set([...noComments.matchAll(/(--clio-[\w-]+)\s*:/g)].map((m) => m[1]));
const used = new Set([...noComments.matchAll(/var\((--clio-[\w-]+)/g)].map((m) => m[1]));
const optional = new Set(["--clio-details-shadow", "--clio-icon-selected-filter", "--clio-scrollbar-thumb-bg-horizontal", "--clio-scrollbar-thumb-shadow-horizontal", "--clio-scrollbar-thumb-color", "--clio-scrollbar-track-color"]);
for (const v of used) ok(declared.has(v) || optional.has(v), `read but never declared: ${v}`);
for (const v of optional) ok(noComments.includes(`var(${v},`), `${v} is optional but read without a fallback`);

// 4. System 6 build has no Platinum; Platinum build has no data-era scope left.
const strip = (t) => t.replace(/\/\*[\s\S]*?\*\//g, "");
ok(!strip(s6).includes('data-era="platinum"'), "clio.system6.css contains Platinum rules");
ok(!strip(pt).includes('[data-era="platinum"]'), "clio.platinum.css still scoped to data-era");

// 5. No external or Apple assets: url() is a data: URI or a bundled font.
for (const m of noComments.matchAll(/url\(\s*["']?([^"')]+)/g)) {
  const u = m[1];
  ok(u.startsWith("data:image/svg+xml,") || /^fonts\/(ChicagoFLF\.woff2?|Asap-Variable\.woff2|ClioSans84\.woff2|ClioText84\.woff2|ClioText84-9\.woff2)$/.test(u), `unexpected url(): ${u.slice(0, 60)}`);
}

// 6. Component index: every component is documented, evidenced and styled.
const allowed = new Set(["measured", "inferred", "adapted", "third-party"]);
const eras = new Set(["system6", "platinum", "both"]);
const ids = new Set();
for (const c of components) {
  ok(!ids.has(c.id), `duplicate component id ${c.id}`); ids.add(c.id);
  ok(c.summary && c.html && c.accessibility, `${c.id}: summary, html and accessibility required`);
  ok(c.evidence.length > 0, `${c.id}: no evidence`);
  const covered = new Set(c.evidence.map((e) => e.era));
  ok(covered.has("system6") || covered.has("both"), `${c.id}: no System 6 evidence`);
  ok(covered.has("platinum") || covered.has("both"), `${c.id}: no Platinum evidence`);
  for (const e of c.evidence) {
    ok(allowed.has(e.status), `${c.id}: bad status ${e.status}`);
    ok(eras.has(e.era), `${c.id}: bad era ${e.era}`);
    ok(e.claim && e.source && e.upstream, `${c.id}: evidence row missing claim, source or upstream`);
  }
  for (const t of c.tokens) ok(declared.has(t), `${c.id}: token ${t} not declared`);
  for (const sel of c.selectors) {
    for (const cls of sel.matchAll(/\.([a-z][\w-]*)/g)) ok(css.includes(`.${cls[1]}`), `${c.id}: selector class .${cls[1]} not styled`);
    for (const role of sel.matchAll(/\[role=(\w+)\]/g)) ok(css.includes(`role="${role[1]}"`), `${c.id}: role ${role[1]} not styled`);
  }
  // Markup in examples should only use classes the stylesheet knows (or inline styles).
  const known = new Set(["field-row", "field-row-stacked", "visually-hidden"]);
  for (const html of [c.html, ...(c.variants || []).map((v) => v.html)]) {
    for (const m of html.matchAll(/class="([^"]+)"/g)) {
      for (const cls of m[1].split(/\s+/)) ok(known.has(cls) || css.includes(`.${cls}`), `${c.id}: example uses unknown class .${cls}`);
    }
    ok(!/<script/i.test(html), `${c.id}: example contains a script`);
  }
}

// 7. components.json mirrors the source.
const json = JSON.parse(read("dist/components.json"));
ok(json.components.length === components.length, "components.json out of date");
ok(read("docs/components.json") === read("dist/components.json"), "docs/components.json differs from dist");

// 8. Docs site: sections, metadata, structured data.
const site = read("docs/index.html");
for (const c of components) ok(site.includes(`id="${c.id}"`) && site.includes(`href="#${c.id}"`), `docs: no section or link for ${c.id}`);
ok(/<meta name="description" content="[^"]{80,200}">/.test(site), "docs: meta description missing or not 80–200 chars");
ok(site.includes('<link rel="canonical"'), "docs: canonical link missing");
ok(site.includes('property="og:image"'), "docs: og:image missing");
const ld = site.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
ok(ld, "docs: JSON-LD missing");
if (ld) { try { const d = JSON.parse(ld[1]); ok(d["@graph"].some((n) => n["@type"] === "SoftwareSourceCode"), "docs: no SoftwareSourceCode node"); } catch { fail("docs: JSON-LD does not parse"); } }
ok((site.match(/<h1[\s>]/g) || []).length === 1, "docs: exactly one h1 expected");
ok(existsSync(join(root, "docs/dist/clio.css")), "docs: stylesheet not copied");
ok(existsSync(join(root, "docs/og.png")), "docs: og.png missing (run the og capture)");

// 9. llms.txt follows the llmstxt.org shape.
const llms = read("llms.txt");
ok(/^# clio\.css\n\n> .+/m.test(llms), "llms.txt: needs an H1 and a blockquote summary");
ok(/^## /m.test(llms), "llms.txt: needs H2 link sections");
ok(read("docs/llms.txt") === llms, "docs/llms.txt differs from llms.txt");
ok(read("docs/llms-full.txt").includes("```css"), "llms-full.txt: stylesheet missing");

// 10. Package.
const pkg = JSON.parse(read("package.json"));
for (const [k, v] of Object.entries(pkg.exports)) if (!v.includes("*")) ok(existsSync(join(root, v)), `exports ${k} -> ${v} missing`);
ok(statSync(join(root, "dist/clio.min.css")).size < 72000, "clio.min.css grew past 72 KB");

if (failures.length) {
  console.error(`FAIL ${failures.length} of ${checks} checks`);
  for (const f of failures) console.error("  - " + f);
  process.exit(1);
}
console.log(`ok ${checks} checks`);
