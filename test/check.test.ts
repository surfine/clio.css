// Static checks for a release (Vitest: npm test). The checks run as the module loads, each
// filed under its numbered section; every section is one test that lists its failures.
import { expect, test } from "vitest";
import { readFileSync, existsSync, statSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { components } from "../packages/core/src/components.ts";
import { usage } from "../packages/core/src/bundles.ts";
import { segments } from "../packages/core/src/assemble.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p: string): string => readFileSync(join(root, p), "utf8");
const sections = new Map<string, { checks: number; failures: string[] }>();
let current = { checks: 0, failures: [] as string[] };
const section = (name: string): void => { current = { checks: 0, failures: [] }; sections.set(name, current); };
const fail = (m: string): void => { current.failures.push(m); };
const ok = (cond: unknown, m: string): void => { current.checks++; if (!cond) fail(m); };

section("1. Outputs exist.");
// 1. Outputs exist.
const outputs = ["clio.css", "clio.min.css", "clio.system6.css", "clio.system6.min.css", "clio.system7.css", "clio.system7.min.css", "clio.platinum.css", "clio.platinum.min.css", "clio.drawingboard.css", "clio.drawingboard.min.css", "clio.nextstep.css", "clio.nextstep.min.css", "fonts/ClioSansNX.woff2", "fonts/ClioSansNX-Bold.woff2", "fonts/OFL-Liberation.txt", "components.json", "fonts/ChicagoFLF.woff2", "fonts/Asap-Variable.woff2", "fonts/OFL-Asap.txt"];
for (const f of outputs) ok(existsSync(join(root, "dist", f)), `missing dist/${f}`);

const css = read("dist/clio.css");
const s6 = read("dist/clio.system6.css");
const pt = read("dist/clio.platinum.css");
const db = read("dist/clio.drawingboard.css");
const nx = read("dist/clio.nextstep.css");

section("2. Braces balance (outside strings) in every build.");
// 2. Braces balance (outside strings) in every build.
for (const [name, text] of [["clio.css", css], ["clio.system6.css", s6], ["clio.platinum.css", pt], ["clio.drawingboard.css", db], ["clio.nextstep.css", nx], ["clio.min.css", read("dist/clio.min.css")], ["clio.nextstep.min.css", read("dist/clio.nextstep.min.css")]]) {
  const stripped = text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/"(?:[^"\\]|\\.)*"/g, '""');
  let depth = 0, bad = false;
  for (const ch of stripped) { if (ch === "{") depth++; if (ch === "}") depth--; if (depth < 0) bad = true; }
  ok(depth === 0 && !bad, `${name}: unbalanced braces`);
}

section("3. Every custom property that is read is declared somewhere.");
// 3. Every custom property that is read is declared somewhere.
const noComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
const declared = new Set([...noComments.matchAll(/(--clio-[\w-]+)\s*:/g)].map((m) => m[1]));
const used = new Set([...noComments.matchAll(/var\((--clio-[\w-]+)/g)].map((m) => m[1]));
const optional = new Set(["--clio-details-shadow", "--clio-icon-selected-filter", "--clio-scrollbar-thumb-bg-horizontal", "--clio-scrollbar-thumb-shadow-horizontal", "--clio-scrollbar-thumb-color", "--clio-scrollbar-track-color"]);
// clio.js sets these on the scrollers it draws bars for (packages/core/src/components/scrollbar/scrollbar.behaviour.ts).
const js = readFileSync(join(root, "dist/clio.js"), "utf8");
const fromJs = (v: string): boolean => (/^--clio-sb-/.test(v) && js.includes(v.replace(/^--clio-sb-/, ""))) || js.includes(`"${v}"`);
for (const v of used) ok(declared.has(v) || optional.has(v) || fromJs(v), `read but never declared: ${v}`);
ok(/^\/\*! clio\.js/.test(js) && !js.includes("0.11.0-dev"), "dist/clio.js carries its banner and the package version");
for (const v of optional) ok(noComments.includes(`var(${v},`), `${v} is optional but read without a fallback`);
// ...and in the NeXTSTEP file, which is built from the base files and its own layer.
const nxNoComments = nx.replace(/\/\*[\s\S]*?\*\//g, "");
const nxDeclared = new Set([...nxNoComments.matchAll(/(--clio-[\w-]+)\s*:/g)].map((m) => m[1]));
for (const m of nxNoComments.matchAll(/var\((--clio-[\w-]+)\s*\)/g)) ok(nxDeclared.has(m[1]) || optional.has(m[1]) || fromJs(m[1]), `clio.nextstep.css reads but never declares ${m[1]}`);

section("4. System 6 build has no Platinum; Platinum build has no data-era scope left.");
// 4. System 6 build has no Platinum; Platinum build has no data-era scope left.
const strip = (t: string): string => t.replace(/\/\*[\s\S]*?\*\//g, "");
ok(!strip(s6).includes('data-era="platinum"') && !strip(s6).includes('data-era="system7"'), "clio.system6.css contains other eras' rules");
ok(!strip(pt).includes('[data-era="platinum"]'), "clio.platinum.css still scoped to data-era");
ok(!strip(pt).includes('data-era="drawingboard"'), "clio.platinum.css contains Drawing Board rules");
ok(!strip(db).includes('[data-era="drawingboard"]') && !strip(db).includes('[data-era="platinum"]'), "clio.drawingboard.css still scoped to data-era");
// NeXTSTEP ships only in its own file (D14): the Classic files never carry it.
for (const [name, text] of [["clio.css", css], ["clio.system6.css", s6], ["clio.platinum.css", pt], ["clio.drawingboard.css", db]]) ok(!strip(text).includes("nextstep") && !text.includes("ClioSansNX"), `${name} contains NeXTSTEP rules`);
ok(!strip(nx).includes('[data-era="nextstep"]') && !/data-era="(platinum|drawingboard)"|--clio-art-db-/.test(strip(nx)), "clio.nextstep.css still scoped to data-era or carries another era's layer");

section("5. No external assets: url() is a data: URI, a bundled font, or Drawing Board");
// 5. No external assets: url() is a data: URI, a bundled font, or Drawing Board
//    theme art shipped beside the stylesheet (dist/art/drawingboard/, written by
//    tooling/db-art.py and tooling/db-pens.py). PNG data URIs are allowed only for
//    Mac OS 9 and frame art (--clio-art-p9-*, --clio-art-frame-*) and inside the
//    SVG tiles of Drawing Board art and Drawing Board's outline patches (a mask picture is
//    fetched with CORS); "%23p" is such a tile's own pattern reference. The window edges'
//    SVG pattern files (art/drawingboard/*-tiled.svg) and the utility windows' three each
//    (art/drawingboard/side-*.svg, utility-*.svg) carry their PNGs inside.
for (const [text, m] of [noComments, nxNoComments].flatMap((t) => [...t.matchAll(/url\(\s*["']?([^"')]+)/g)].map((m): [string, RegExpExecArray] => [t, m]))) {
  const u = m[1];
  const png = u.startsWith("data:image/png;base64,") && /--clio-(art-(db|p9|s7|frame)|db-outline)-[\w-]+:\s*$/.test(text.slice(Math.max(0, m.index - 60), m.index));
  if (u.startsWith("art/")) ok(existsSync(join(root, "dist", u)), `missing art file dist/${u}`);
  ok(u.startsWith("data:image/svg+xml,") || png || /^fonts\/(ChicagoFLF\.woff2?|Asap-Variable\.woff2|ClioSans84\.woff2|ClioText84\.woff2|ClioText84-9\.woff2|ClioSans97\.woff2|ClioSans97Display\.woff2|ClioSans97Title\.woff2|ClioSans97Exact\.woff2|ClioSans97TitleExact\.woff2|ClioSans97Plain\.woff2|ClioSans97TitlePlain\.woff2|ClioSans97PlainExact\.woff2|ClioSans97TitlePlainExact\.woff2|ClioSansNX(-Bold)?\.woff2|Virtue\.woff2|FusionPixel12-(TC|SC|JA|KO)\.woff2)$/.test(u) || /^art\/(drawingboard|platinum|system7|system6|cursors)\/(pens\/|parts\/)?[a-z0-9-]+\.png$/.test(u) || /^art\/drawingboard\/([a-z0-9-]+-tiled|(side|utility)-(frame|runs|edges))\.svg$/.test(u) || /^%23\w+$/.test(u), `unexpected url(): ${u.slice(0, 60)}`);
}

section("6. Component index: every component is documented, evidenced and styled.");
// 6. Component index: every component is documented, evidenced and styled.
const allowed = new Set(["measured", "inferred", "adapted", "third-party"]);
const eras = new Set(["system6", "system7", "drawingboard", "platinum", "nextstep", "both"]);
const ids = new Set<string>();
for (const c of components) {
  ok(!ids.has(c.id), `duplicate component id ${c.id}`); ids.add(c.id);
  ok(c.summary && c.html && c.accessibility, `${c.id}: summary, html and accessibility required`);
  ok(c.evidence.length > 0, `${c.id}: no evidence`);
  const covered = new Set(c.evidence.map((e) => e.era));
  // A NeXTSTEP-only component (c.eras: ["nextstep"]) has no Classic rows; every other one needs both.
  const nxOnly = c.eras !== undefined && c.eras.length === 1 && c.eras[0] === "nextstep";
  ok(nxOnly || covered.has("system6") || covered.has("both"), `${c.id}: no System 6 evidence`);
  ok(nxOnly || covered.has("platinum") || covered.has("both"), `${c.id}: no Platinum evidence`);
  ok(!nxOnly || [...covered].every((e) => e === "nextstep"), `${c.id}: a NeXTSTEP-only component with Classic evidence`);
  const styled = nxOnly ? nx : css;
  for (const e of c.evidence) {
    ok(allowed.has(e.status), `${c.id}: bad status ${e.status}`);
    ok(eras.has(e.era), `${c.id}: bad era ${e.era}`);
    ok(e.claim && e.source && e.upstream, `${c.id}: evidence row missing claim, source or upstream`);
  }
  for (const t of c.tokens) ok((nxOnly ? nxDeclared : declared).has(t), `${c.id}: token ${t} not declared`);
  for (const sel of c.selectors) {
    for (const cls of sel.matchAll(/\.([a-z][\w-]*)/g)) ok(styled.includes(`.${cls[1]}`), `${c.id}: selector class .${cls[1]} not styled`);
    for (const role of sel.matchAll(/\[role=(\w+)\]/g)) ok(styled.includes(`role="${role[1]}"`), `${c.id}: role ${role[1]} not styled`);
  }
  // Markup in examples should only use classes the stylesheet knows (or inline styles).
  const known = new Set(["field-row", "field-row-stacked", "visually-hidden"]);
  for (const html of [c.html, ...(c.variants || []).map((v) => v.html)]) {
    for (const m of html.matchAll(/class="([^"]+)"/g)) {
      for (const cls of m[1].split(/\s+/)) ok(known.has(cls) || styled.includes(`.${cls}`), `${c.id}: example uses unknown class .${cls}`);
    }
    ok(!/<script/i.test(html), `${c.id}: example contains a script`);
  }
}

section("7. components.json mirrors the source.");
// 7. components.json mirrors the source.
const json = JSON.parse(read("dist/components.json"));
ok(json.components.length === components.length, "components.json out of date");
ok(read("docs/components.json") === read("dist/components.json"), "docs/components.json differs from dist");

section("8. Docs site: sections, metadata, structured data.");
// 8. Docs site: sections, metadata, structured data.
const site = read("docs/index.html");
for (const c of components) ok(site.includes(`id="${c.id}"`) && site.includes(`href="#${c.id}"`), `docs: no section or link for ${c.id}`);
ok(/<meta name="description" content="[^"]{80,200}">/.test(site), "docs: meta description missing or not 80–200 chars");
ok(site.includes('<link rel="canonical"'), "docs: canonical link missing");
ok(site.includes('property="og:image"'), "docs: og:image missing");
const ld = site.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
ok(ld, "docs: JSON-LD missing");
if (ld) { try { const d = JSON.parse(ld[1]) as { "@graph": { "@type": string }[] }; ok(d["@graph"].some((n) => n["@type"] === "SoftwareSourceCode"), "docs: no SoftwareSourceCode node"); } catch { fail("docs: JSON-LD does not parse"); } }
ok((site.match(/<h1[\s>]/g) || []).length === 1, "docs: exactly one h1 expected");
ok(existsSync(join(root, "docs/dist/clio.css")), "docs: stylesheet not copied");
ok(existsSync(join(root, "docs/og.png")), "docs: og.png missing (run the og capture)");

section("9. llms.txt follows the llmstxt.org shape.");
// 9. llms.txt follows the llmstxt.org shape.
const llms = read("llms.txt");
ok(/^# clio\.css\n\n> .+/m.test(llms), "llms.txt: needs an H1 and a blockquote summary");
ok(/^## /m.test(llms), "llms.txt: needs H2 link sections");
ok(read("docs/llms.txt") === llms, "docs/llms.txt differs from llms.txt");
ok(read("docs/llms-full.txt").includes("```css"), "llms-full.txt: stylesheet missing");

// 9b. CJK stand-ins (owner decisions 9 and 10): each face has a unicode-range, and the
// families are named only in --clio-font-cjk under :lang(), so pages without CJK text never
// fetch them. The fonts are outside the CSS size budget.
{
  const all = read("dist/clio.css");
  const faces = all.match(/@font-face\s*\{[^}]*Clio Pixel[^}]*\}/g) || [];
  ok(faces.length === 4 && faces.every((f) => /unicode-range:/.test(f)), "the four Clio Pixel faces need a unicode-range");
  const rest = all.replace(/@font-face\s*\{[^}]*\}/g, "");
  const uses = rest.match(/[^;{}]*Clio Pixel[^;{}]*/g) || [];
  ok(uses.length === 4 && uses.every((u) => /^\s*--clio-font-cjk:/.test(u)), "Clio Pixel named outside --clio-font-cjk");
  for (const m of all.matchAll(/([^{}]*)\{\s*--clio-font-cjk:/g)) ok(/:lang\(/.test(m[1]), `--clio-font-cjk set outside :lang(): ${m[1].trim().slice(0, 60)}`);
  for (const f of ["TC", "SC", "JA", "KO"]) ok(existsSync(join(root, `dist/fonts/FusionPixel12-${f}.woff2`)), `dist/fonts/FusionPixel12-${f}.woff2 missing`);
  ok(existsSync(join(root, "dist/fonts/OFL-FusionPixel.txt")), "the Fusion Pixel licence must ship beside the fonts");
}

section("10. Package.");
// 10. Package.
const pkg: { exports: Record<string, string | Record<string, string>> } = JSON.parse(read("package.json"));
for (const [k, e] of Object.entries(pkg.exports)) for (const v of typeof e === "string" ? [e] : Object.values(e)) if (!v.includes("*")) ok(existsSync(join(root, v)), `exports ${k} -> ${v} missing`);   // a conditional export ({ types, default }) names each file
// 200 KB since 0.10.0, which added every control the classic guidelines define (dev/COVERAGE.md);
// 220 KB from the Classic close (owner, 2026-11-14): the all-eras file keeps the four Classic
// eras, and Mac OS X eras ship as files of their own. 222 KB on 2026-11-18 (owner) for the
// Drawing Board utility window's frame (17 placed pieces, ~1.5 KB of CSS).
ok(statSync(join(root, "dist/clio.min.css")).size < 223000, "clio.min.css grew past 223 KB");
// NeXTSTEP's own file (D5, D14): the base files (about 99 KB minified, as clio.system6.min.css)
// plus its layer. 160 KB (owner, 2026-11-26, D16) leaves the layer about 60 KB.
ok(statSync(join(root, "dist/clio.nextstep.min.css")).size < 160000, "clio.nextstep.min.css grew past 160 KB");
const minJs = readFileSync(join(root, "dist/clio.min.js"), "utf8");
ok(/^\/\*! clio\.js/.test(minJs) && minJs.length < js.length * 0.7, "dist/clio.min.js missing, without its banner, or not minified");

section("11. Fragments assemble the single files");
// P2: the single files are assembled from component fragments (packages/core/src/bundles.ts).
// Every fragment on disk is used, and each of its segments exactly once, in no other order.
{
  const base = join(root, "packages/core/src");
  const onDisk = readdirSync(base, { recursive: true, encoding: "utf8" }).filter((f) => f.endsWith(".css")).map((f) => f.split("\\").join("/")).sort();
  const used = usage();
  ok(JSON.stringify(onDisk) === JSON.stringify([...used.keys()].sort()), `fragments on disk and in order.ts differ: ${onDisk.filter((f) => !used.has(f)).join(" ")} ${[...used.keys()].filter((f) => !onDisk.includes(f)).join(" ")}`);
  for (const [f, ns] of used) {
    const n = existsSync(join(base, f)) ? segments(f).length : 0;
    ok(ns.length === n && ns.every((x, i) => x === i), `${f}: order.ts uses segments ${ns.join(",")} of ${n}`);
  }
}

section("12. The host contract mirrors the index and the CSS");
{
  const c = (await import("../dist/contract.js")).default as { eras: string[]; components: { id: string; selectors: string[]; tokens: string[] }[]; tokens: Record<string, Record<string, string>> };
  ok(JSON.stringify(c.components.map((x) => [x.id, x.selectors, x.tokens])) === JSON.stringify(components.map((x) => [x.id, x.selectors, x.tokens])), "contract.js: components differ from the index");
  ok(JSON.stringify(c.eras) === JSON.stringify(["system6", "system7", "drawingboard", "platinum", "nextstep"]), `contract.js: eras ${c.eras.join(" ")}`);
  for (const era of c.eras) {
    const file = JSON.parse(read(`dist/tokens/${era}.json`));
    ok(JSON.stringify(file) === JSON.stringify(c.tokens[era]), `dist/tokens/${era}.json differs from contract.js`);
    ok(Object.keys(file).length > 300, `dist/tokens/${era}.json has ${Object.keys(file).length} tokens`);
  }
  // a token a component names is a page default or declared on some selector: the contract names nothing that does not exist
  const anyDeclared = new Set([...noComments.matchAll(/(--clio-[\w-]+)\s*:/g), ...nxNoComments.matchAll(/(--clio-[\w-]+)\s*:/g)].map((m) => m[1]));
  for (const x of c.components) for (const t of x.tokens) ok(anyDeclared.has(t) || optional.has(t) || fromJs(t), `${x.id} names ${t}, which no CSS declares`);
}

for (const [name, r] of sections) {
  test(`${name} (${r.checks} checks)`, () => {
    expect(r.checks).toBeGreaterThan(0);
    expect(r.failures).toEqual([]);
  });
}
