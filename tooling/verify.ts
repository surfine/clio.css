// npm run verify: the local release gate (GitHub Actions is not used). It clones the current
// HEAD into a temporary directory, so only committed work is checked, and runs:
//   1. npm ci, npm test, lint, typecheck; then the clone must still be clean (committed dist/,
//      docs/, llms.txt and EVIDENCE.md are what the sources build);
//   2. npm pack for clio.css, clio.css-preact and clio.css-react, installed as tarballs into a
//      scratch project: every exports entry resolves to a file, the ES entries import, and both
//      component packages render with their own peer framework to components.json's markup;
//   3. dist/*.css rules against the 1.1.1 baseline from npm, headers and comments stripped:
//      any difference not listed in dev/css-rule-allowlist.json fails;
//   4. the numbers and versions quoted in README.md, EVIDENCE.md and FIDELITY.md;
//   5. relative links in every tracked Markdown file;
//   6. npm run fidelity:public when a browser is installed, otherwise "skipped".
// Writes .verify/summary.md and .verify/stamp.json in this checkout (git-ignored).
//   node tooling/verify.ts [--require-browser] [--keep]
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const requireBrowser = process.argv.includes("--require-browser");
const keep = process.argv.includes("--keep");
const outDir = join(root, ".verify");
const logDir = join(outDir, "logs");
mkdirSync(logDir, { recursive: true });

type Status = "pass" | "fail" | "skipped";
const steps: { name: string; status: Status; detail: string }[] = [];
const record = (name: string, status: Status, detail: string): void => {
  steps.push({ name, status, detail });
  console.log(`${status === "pass" ? "PASS" : status === "fail" ? "FAIL" : "SKIPPED"}  ${name}${detail ? ": " + detail.split("\n")[0] : ""}`);
  if (status === "fail" && detail.includes("\n")) console.log(detail.split("\n").slice(1, 40).map((l) => "      " + l).join("\n"));
};
const run = (name: string, cmd: string, args: string[], cwd: string, env: Record<string, string> = {}): { ok: boolean; out: string } => {
  const r = spawnSync(cmd, args, { cwd, env: { ...process.env, ...env }, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
  const out = (r.stdout || "") + (r.stderr || "");
  writeFileSync(join(logDir, name.replace(/[^\w.-]+/g, "_") + ".log"), `$ ${cmd} ${args.join(" ")}\n(cwd ${cwd})\n\n${out}`);
  return { ok: r.status === 0, out };
};
const tail = (s: string, n = 25): string => s.trim().split("\n").slice(-n).join("\n");
const git = (args: string[], cwd = root): string => spawnSync("git", args, { cwd, encoding: "utf8" }).stdout.trim();

const head = git(["rev-parse", "HEAD"]);
const dirty = git(["status", "--porcelain"]);
const work = mkdtempSync(join(tmpdir(), "clio-verify-"));
const repo = join(work, "repo");
console.log(`verify: HEAD ${head.slice(0, 7)}${dirty ? " (working tree has uncommitted changes: they are NOT checked)" : ""}, clone in ${work}`);

// 1. The repository's own checks, in a fresh clone.
let ok = run("clone", "git", ["clone", "--quiet", "--no-hardlinks", root, repo], work).ok;
if (!ok) { record("clone", "fail", "git clone failed"); finish(); }
for (const [name, args] of [["npm ci", ["ci", "--no-audit", "--no-fund"]], ["npm test", ["test"]], ["lint", ["run", "lint"]], ["typecheck", ["run", "typecheck"]]] as [string, string[]][]) {
  const r = run(name, "npm", args, repo);
  const tests = name === "npm test" ? (r.out.match(/Tests\s+(\d+ passed[^\n]*)/) || [])[1] : "";
  record(name, r.ok ? "pass" : "fail", r.ok ? (tests ? `${tests.trim()}` : "") : "exit non-zero\n" + tail(r.out));
  if (name === "npm ci" && !r.ok) finish();
}
const after = git(["status", "--porcelain"], repo);
record("clean after build", after ? "fail" : "pass", after ? "the build changed committed files (rebuild and commit them)\n" + after : "dist/, docs/, llms.txt and EVIDENCE.md match the sources");

const pkg = JSON.parse(readFileSync(join(repo, "package.json"), "utf8"));
const version: string = pkg.version;

// 2. Pack the three packages and install the tarballs into a scratch project.
const packs = join(work, "packs");
mkdirSync(packs);
const tarballs: Record<string, string> = {};
for (const [name, dir] of [["clio.css", "."], ["clio.css-preact", "packages/preact"], ["clio.css-react", "packages/react"]]) {
  const r = run(`pack ${name}`, "npm", ["pack", "--ignore-scripts", "--json", "--pack-destination", packs], join(repo, dir));
  if (!r.ok) { record(`npm pack ${name}`, "fail", tail(r.out)); continue; }
  const info = JSON.parse(r.out.slice(r.out.indexOf("[")))[0];
  tarballs[name] = join(packs, info.filename);
  record(`npm pack ${name}`, "pass", `${info.filename}, ${info.entryCount} files, ${(info.size / 1024).toFixed(1)} kB`);
}
const consumer = join(work, "consumer");
mkdirSync(consumer);
const dev = pkg.devDependencies;
writeFileSync(join(consumer, "package.json"), JSON.stringify({ name: "clio-verify-consumer", private: true, type: "module", dependencies: {
  ...Object.fromEntries(Object.entries(tarballs).map(([n, f]) => [n, "file:" + f])),
  preact: dev.preact, "preact-render-to-string": dev["preact-render-to-string"], react: dev.react, "react-dom": dev["react-dom"],
} }, null, 2));
if (Object.keys(tarballs).length === 3) {
  const inst = run("consumer install", "npm", ["install", "--no-audit", "--no-fund"], consumer);
  record("install tarballs", inst.ok ? "pass" : "fail", inst.ok ? `with preact ${dev.preact}, react ${dev.react}` : tail(inst.out));
  if (inst.ok) {
    const playwrightDir = join(repo, "node_modules/playwright");
    writeFileSync(join(consumer, "check.mjs"), consumerCheck(playwrightDir));
    const r = run("consumer check", "node", ["check.mjs"], consumer);
    for (const line of r.out.trim().split("\n")) {
      const m = line.match(/^(PASS|FAIL|SKIPPED) (.+?)(?:: (.*))?$/);
      if (m) record(m[2]!, m[1] === "PASS" ? "pass" : m[1] === "FAIL" ? "fail" : "skipped", (m[3] || "").replace(/\\n/g, "\n"));
    }
    if (!r.ok && !/^FAIL /m.test(r.out)) record("consumer check", "fail", tail(r.out));
  }
}

// 3. dist/*.css rules against 1.1.1.
cssBaseline();

// 4. Numbers and versions in the docs.
docNumbers();

// 5. Relative links in tracked Markdown.
markdownLinks();

// 6. The public pixel check.
{
  const canLaunch = spawnSync("node", ["-e", "import('playwright').then(async(p)=>{const b=await p.chromium.launch();await b.close();console.log('ok')})"], { cwd: repo, encoding: "utf8" }).stdout.trim() === "ok";
  if (!canLaunch) record("fidelity:public", requireBrowser ? "fail" : "skipped", "skipped: no Playwright Chromium installed (npx playwright install chromium); not counted as a pass");
  else {
    const r = run("fidelity public", "npm", ["run", "fidelity:public"], repo, { AIS6_DIR: join(work, "no-private-references") });
    const line = (r.out.match(/fidelity:public \(.*$/m) || [""])[0];
    record("fidelity:public", r.ok ? "pass" : "fail", r.ok ? line : line + "\n" + r.out.split("\n").filter((l) => l.startsWith("FAIL")).join("\n"));
  }
}
finish();

function finish(): never {
  const fails = steps.filter((s) => s.status === "fail");
  const skips = steps.filter((s) => s.status === "skipped");
  const verdict = fails.length ? "FAIL" : skips.length ? "PASS with skipped steps" : "PASS";
  const date = new Date().toISOString().replace(/\.\d+Z$/, "Z");
  const summary = `npm run verify — ${verdict}\n\nCommit ${head}${dirty ? " (uncommitted changes in the checkout were not checked)" : ""}, clio.css ${steps.length ? (JSON.parse(readFileSync(join(root, "package.json"), "utf8")).version) : "?"}, ${date}, Node ${process.version}, ${process.platform}.\n\n| Step | Result | Detail |\n| --- | --- | --- |\n${steps.map((s) => `| ${s.name} | ${s.status} | ${s.detail.split("\n")[0]!.replace(/\|/g, "\\|")} |`).join("\n")}\n`;
  writeFileSync(join(outDir, "summary.md"), summary);
  writeFileSync(join(outDir, "stamp.json"), JSON.stringify({ head, dirty: !!dirty, verdict, pass: !fails.length, skipped: skips.map((s) => s.name), date }, null, 2));
  console.log(`\n${verdict}: ${steps.length - fails.length - skips.length} passed, ${fails.length} failed, ${skips.length} skipped. Summary: .verify/summary.md; logs: .verify/logs/`);
  if (!keep) rmSync(work, { recursive: true, force: true });
  else console.log(`kept ${work}`);
  process.exit(fails.length ? 1 : 0);
}

// The scratch project's check: resolve every export, import the ES ones, render components.
function consumerCheck(playwrightDir: string): string {
  return `import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
const out = (s, name, d = "") => console.log(s + " " + name + (d ? ": " + d.replace(/\\n/g, "\\\\n") : ""));
let failed = false;
const samples = { "./dist/*": "./dist/clio.css", "./tokens/*": "./tokens/system6.json" };
const esm = new Set(["clio.css/js.esm", "clio.css/contract", "clio.css-preact", "clio.css-react"]);
for (const name of ["clio.css", "clio.css-preact", "clio.css-react"]) {
  const dir = fileURLToPath(new URL("./node_modules/" + name + "/", import.meta.url));
  const pj = JSON.parse(readFileSync(dir + "package.json", "utf8"));
  const bad = []; let n = 0;
  for (const [key, target] of Object.entries(pj.exports)) {
    const sub = samples[key] || key;
    const spec = name + (sub === "." ? "" : sub.slice(1));
    n++;
    try {
      const file = fileURLToPath(import.meta.resolve(spec));
      if (!existsSync(file)) bad.push(spec + " -> missing " + file);
      if (typeof target === "object" && target.types && !existsSync(dir + target.types.replace(/^\\.\\//, ""))) bad.push(spec + " types missing: " + target.types);
      if (esm.has(spec)) await import(spec);
    } catch (e) { bad.push(spec + ": " + String(e.message || e).split("\\n")[0]); }
  }
  for (const f of [pj.main, pj.style, pj.types].filter(Boolean)) if (!existsSync(dir + f)) bad.push("field file missing: " + f);
  if (bad.length) { failed = true; out("FAIL", name + " exports", bad.join("\\n")); } else out("PASS", name + " exports", n + " entries resolve" + (name === "clio.css" ? "; js.esm and contract import" : "; index imports"));
}
const cj = JSON.parse(readFileSync(fileURLToPath(import.meta.resolve("clio.css/components.json")), "utf8"));
const want = Object.fromEntries(cj.components.map((c) => [c.id, c.html]));
const contract = (await import("clio.css/contract")).default;
if (!contract || !contract.tokens || !contract.tokens.nextstep) { failed = true; out("FAIL", "contract", "no tokens.nextstep"); }
let chromium = null;
try { chromium = createRequire(${JSON.stringify(playwrightDir + "/")})("./index.js").chromium; await (await chromium.launch()).close(); } catch { chromium = null; }
if (!chromium) { out(${JSON.stringify(requireBrowser ? "FAIL" : "SKIPPED")}, "components render", "skipped: no Playwright Chromium to compare DOMs; not counted as a pass"); process.exit(failed ? 1 : 0); }
const browser = await chromium.launch(); const page = await browser.newPage();
const compare = (a, b) => page.evaluate(([a, b]) => {
  const parse = (html) => { const t = document.createElement("template"); t.innerHTML = html; return t.content; };
  const drop = (n) => { for (const c of [...n.childNodes]) { if (c.nodeType === 8) c.remove(); else drop(c); } return n; };
  const kids = (n) => [...n.childNodes].filter((c) => c.nodeType === 1 || (c.nodeType === 3 && /\\S/.test(c.textContent)));
  const attrs = (e) => JSON.stringify([...e.attributes].map((x) => [x.name, x.name === "style" ? e.style.cssText : x.name === "class" ? x.value.trim().split(/\\s+/).sort().join(" ") : x.value]).sort());
  const same = (x, y) => {
    if (x.nodeType !== y.nodeType) return "node type";
    if (x.nodeType === 3) return x.textContent.replace(/\\s+/g, " ") === y.textContent.replace(/\\s+/g, " ") ? null : "text " + JSON.stringify(x.textContent) + " vs " + JSON.stringify(y.textContent);
    if (x.nodeType === 1 && (x.tagName !== y.tagName || attrs(x) !== attrs(y))) return "<" + x.tagName + "> " + (x.tagName === y.tagName ? attrs(x) + " vs " + attrs(y) : "vs <" + y.tagName + ">");
    const kx = kids(x), ky = kids(y); if (kx.length !== ky.length) return kx.length + " children vs " + ky.length;
    for (let i = 0; i < kx.length; i++) { const d = same(kx[i], ky[i]); if (d) return d; }
    return null;
  };
  return same(parse(a), drop(parse(b)));
}, [a, b]);
const scenes = (h, C) => ({
  button: h(C.FieldRow, { style: { gap: "16px" } }, h(C.Button, null, "Cancel"), h(C.Button, { default: true }, "OK"), h(C.Button, { pressed: true }, "Pressed"), h(C.Button, { disabled: true }, "Eject")),
  checkbox: h(C.FieldRow, { stacked: true }, h(C.Checkbox, { label: "Show warnings", defaultChecked: true }), h(C.Checkbox, { label: "Use small icons" }), h(C.Checkbox, { label: "Locked", defaultChecked: true, disabled: true })),
});
const fw = {
  "clio.css-preact": async () => { const { h } = await import("preact"); const { render } = await import("preact-render-to-string"); return [h, (v) => render(v)]; },
  "clio.css-react": async () => { const { createElement } = await import("react"); const { renderToStaticMarkup } = await import("react-dom/server"); return [createElement, (v) => renderToStaticMarkup(v)]; },
};
for (const [name, load] of Object.entries(fw)) {
  const C = await import(name); const [h, render] = await load();
  const bad = [];
  for (const [id, el] of Object.entries(scenes(h, C))) { const d = await compare(want[id], render(el)); if (d) bad.push(id + ": " + d); }
  if (bad.length) { failed = true; out("FAIL", name + " render", bad.join("\\n")); } else out("PASS", name + " render", Object.keys(scenes(h, C)).join(", ") + " match components.json with " + (name.endsWith("preact") ? "preact" : "react"));
}
await browser.close();
process.exit(failed ? 1 : 0);
`;
}

// CSS with comments removed (strings kept) and white space collapsed, cut into rules at "}".
function rules(css: string): string[] {
  let o = "";
  for (let i = 0; i < css.length; i++) {
    const c = css[i]!;
    if (c === "/" && css[i + 1] === "*") { const e = css.indexOf("*/", i + 2); i = e < 0 ? css.length : e + 1; o += " "; continue; }
    if (c === '"' || c === "'") { let j = i + 1; while (j < css.length && css[j] !== c) j += css[j] === "\\" ? 2 : 1; o += css.slice(i, j + 1); i = j; continue; }
    o += c;
  }
  return o.replace(/\s+/g, " ").split("}").map((r) => r.trim()).filter(Boolean);
}
function cssBaseline(): void {
  const allowFile = join(repo, "dev/css-rule-allowlist.json");
  const allow: { baseline: string; entries: { file: string; change: "added" | "removed" | "new-file" | "order"; rule?: string; reason: string; changelog: string }[] } = JSON.parse(readFileSync(allowFile, "utf8"));
  const base = join(work, "baseline");
  mkdirSync(base);
  const r = run("baseline pack", "npm", ["pack", `clio.css@${allow.baseline}`, "--pack-destination", base, "--silent"], base);
  if (!r.ok) { record(`CSS rules vs ${allow.baseline}`, "fail", "could not fetch the baseline from npm\n" + tail(r.out)); return; }
  run("baseline untar", "tar", ["xzf", join(base, r.out.trim().split("\n").pop()!)], base);
  const oldDist = join(base, "package/dist"), newDist = join(repo, "dist");
  const changelog = readFileSync(join(repo, "CHANGELOG.md"), "utf8");
  const used = new Set<number>();
  const unexplained: string[] = [];
  const match = (file: string, change: string, rule?: string): boolean => {
    const i = allow.entries.findIndex((e) => (e.file === file || e.file === "*") && e.change === change && (rule === undefined || e.rule === rule));
    if (i >= 0) used.add(i);
    return i >= 0;
  };
  let files = 0, total = 0;
  for (const f of readdirSync(newDist).filter((x) => x.endsWith(".css")).sort()) {
    files++;
    if (!existsSync(join(oldDist, f))) { if (!match(f, "new-file")) unexplained.push(`${f}: new file`); continue; }
    const a = rules(readFileSync(join(oldDist, f), "utf8")), b = rules(readFileSync(join(newDist, f), "utf8"));
    total += b.length;
    const count = (xs: string[]) => { const m = new Map<string, number>(); for (const x of xs) m.set(x, (m.get(x) || 0) + 1); return m; };
    const ca = count(a), cb = count(b);
    for (const [x, n] of ca) for (let k = (cb.get(x) || 0); k < n; k++) if (!match(f, "removed", x)) unexplained.push(`${f}: removed ${x.slice(0, 160)}`);
    for (const [x, n] of cb) for (let k = (ca.get(x) || 0); k < n; k++) if (!match(f, "added", x)) unexplained.push(`${f}: added ${x.slice(0, 160)}`);
    const sa = a.filter((x) => cb.has(x)), sb = b.filter((x) => ca.has(x));
    if (sa.join("}") !== sb.join("}") && !match(f, "order")) unexplained.push(`${f}: rules in a different order`);
  }
  for (const f of readdirSync(oldDist).filter((x) => x.endsWith(".css"))) if (!existsSync(join(newDist, f)) && !match(f, "removed-file")) unexplained.push(`${f}: file removed`);
  const stale = allow.entries.map((e, i) => [e, i] as const).filter(([, i]) => !used.has(i)).map(([e]) => `allowlist entry not needed: ${e.file} ${e.change} ${(e.rule || "").slice(0, 80)}`);
  const noLog = allow.entries.filter((e) => !e.reason || !new RegExp(`^## ${e.changelog.replace(/\./g, "\\.")}\\b`, "m").test(changelog)).map((e) => `allowlist entry without a reason or a CHANGELOG "## ${e.changelog}" section: ${e.file} ${e.change}`);
  const problems = [...unexplained, ...stale, ...noLog];
  record(`CSS rules vs ${allow.baseline}`, problems.length ? "fail" : "pass", problems.length ? `${problems.length} unexplained difference(s)\n` + problems.slice(0, 30).join("\n") : `${files} files, ${total} rules: identical to ${allow.baseline} with headers and comments stripped, ${allow.entries.length} allow-listed change(s)`);
}

function docNumbers(): void {
  const read = (f: string) => readFileSync(join(repo, f), "utf8");
  const readme = read("README.md"), evidence = read("EVIDENCE.md"), fidelity = read("FIDELITY.md"), changelog = read("CHANGELOG.md");
  const bad: string[] = [];
  const need = (what: string, m: RegExpMatchArray | null): RegExpMatchArray | null => { if (!m) bad.push(`not found: ${what}`); return m; };
  // Versions.
  for (const dir of ["packages/preact", "packages/react"]) {
    const p = JSON.parse(read(dir + "/package.json"));
    if (p.version !== version) bad.push(`${p.name} is ${p.version}, clio.css is ${version}`);
    if (p.peerDependencies?.["clio.css"] !== `>=${version.split(".")[0]}.0.0`) bad.push(`${p.name} peer clio.css is ${p.peerDependencies?.["clio.css"]}`);
    for (const k of ["repository", "homepage", "license"]) if (!p[k]) bad.push(`${p.name} has no ${k}`);
  }
  const ev = need("EVIDENCE.md version line", evidence.match(/Every value in clio\.css (\S+) has a row/));
  if (ev && ev[1] !== version) bad.push(`EVIDENCE.md names ${ev[1]}`);
  const cj = JSON.parse(read("dist/components.json"));
  if (cj.version !== version) bad.push(`components.json version ${cj.version}`);
  for (const f of readdirSync(join(repo, "dist")).filter((x) => x.endsWith(".css"))) {
    const top = read("dist/" + f).slice(0, 600);
    if (!top.startsWith(`/*! clio.css ${version}`)) bad.push(`dist/${f} banner is not ${version}`);
    for (const era of ["System 6", "System 7", "Drawing Board", "Platinum", "NeXTSTEP"]) if (!top.includes(era)) bad.push(`dist/${f} banner does not name ${era}`);
  }
  const cdn = [...readme.matchAll(/clio\.css@([\w.-]+)/g)].map((m) => m[1]);
  if (!cdn.length) bad.push("README has no versioned CDN link");
  for (const v of new Set(cdn)) if (v !== version) bad.push(`README CDN link names clio.css@${v}, package is ${version}`);
  const head2 = need("CHANGELOG section for " + version, changelog.match(new RegExp(`^## ${version.replace(/\./g, "\\.")} \\(([^)]*)\\)`, "m")));
  if (head2 && /unreleased/i.test(head2[1]!)) bad.push(`CHANGELOG ${version} still says unreleased`);
  const topSection = (changelog.match(/^## .*$/m) || [""])[0];
  if (/unreleased/i.test(topSection)) bad.push(`CHANGELOG's newest section is unreleased: ${topSection}`);
  // Evidence counts: the header table, the rows themselves and the README sentence.
  const counts: Record<string, number> = {};
  for (const m of evidence.matchAll(/^\| [^|]+ \| [^|]+ \| .* \| (Measured|Inferred|Adapted|Third-party) \| .* \|$/gm)) counts[m[1]!] = (counts[m[1]!] || 0) + 1;
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  for (const s of ["Measured", "Inferred", "Adapted", "Third-party"]) {
    const h = need(`EVIDENCE.md header row ${s}`, evidence.match(new RegExp(`^\\| ${s} \\| [^|]+ \\| (\\d+) \\|$`, "m")));
    if (h && Number(h[1]) !== (counts[s] || 0)) bad.push(`EVIDENCE.md header says ${h[1]} ${s}, the table has ${counts[s] || 0}`);
  }
  const rs = need("README evidence sentence", readme.match(/(\d+) of (\d+) rows are \*\*measured\*\*[^,]*, (\d+)\s+\*\*inferred\*\*, (\d+) \*\*adapted\*\*[^,]* and (\d+) \*\*third-party\*\*/));
  if (rs) { const [, m, t, i, a, p] = rs.map(Number); if (m !== counts.Measured || t !== total || i !== counts.Inferred || a !== counts.Adapted || p !== counts["Third-party"]) bad.push(`README says ${rs[0]}; EVIDENCE has ${counts.Measured}/${total}, ${counts.Inferred}, ${counts.Adapted}, ${counts["Third-party"]}`); }
  // Components.
  const rc = need("README component count", readme.match(/(\d+) entries, the same as `dist\/components\.json`/));
  if (rc && Number(rc[1]) !== cj.components.length) bad.push(`README says ${rc[1]} components, components.json has ${cj.components.length}`);
  const rows = [...readme.slice(readme.indexOf("| Component | Selectors |")).matchAll(/^\| \[[^\]]+\]\(https:\/\/surfine\.github\.io\/clio\.css\/#([\w-]+)\)/gm)].map((m) => m[1]);
  const missing = cj.components.filter((c: { id: string }) => !rows.includes(c.id)).map((c: { id: string }) => c.id);
  if (missing.length) bad.push(`README components table lacks ${missing.join(", ")}`);
  // Sizes: README's table and clio.js figures against dist/.
  const kb = (n: number) => n / 1000;
  const fmt = (x: number) => (x >= 100 ? x.toFixed(0) : x.toFixed(1));
  for (const m of readme.matchAll(/^\| `dist\/(clio(?:\.\w+)?)\.css` \| [^|]+ \| ([\d.]+) kB \| ([\d.]+) kB \|$/gm)) {
    const f = join(repo, "dist", m[1] + ".min.css");
    if (!existsSync(f)) { bad.push(`README size row for ${m[1]}: no ${m[1]}.min.css`); continue; }
    const buf = readFileSync(f), size = fmt(kb(buf.length)), gz = fmt(kb(gzipSync(buf, { level: 9 }).length));
    if (size !== m[2] || gz !== m[3]) bad.push(`README: ${m[1]}.min.css ${m[2]} kB / ${m[3]} kB gzip; dist has ${size} / ${gz}`);
  }
  const js = need("README clio.js sizes", readme.match(/No dependencies; ([\d.]+) kB, or ([\d.]+) kB as `dist\/clio\.min\.js`/));
  if (js) for (const [f, said] of [["clio.js", js[1]], ["clio.min.js", js[2]]]) { const s = fmt(kb(statSync(join(repo, "dist", f)).size)); if (s !== said) bad.push(`README: ${f} ${said} kB, dist has ${s}`); }
  const badge = need("README gzip badge", readme.match(/clio\.min\.css-([\d.]+)%20kB%20gzip/));
  if (badge) { const g = fmt(kb(gzipSync(readFileSync(join(repo, "dist/clio.min.css")), { level: 9 }).length)); if (g !== badge[1]) bad.push(`README badge ${badge[1]} kB gzip, dist has ${g}`); }
  // Fidelity: every "n of m" in README's table must be one of FIDELITY.md's tables, in order.
  const tables: [number, number][] = [];
  for (const t of fidelity.split(/\n(?=\| Specimen \|)/).slice(1)) {
    const body = t.split("\n\n")[0]!.split("\n").slice(2).filter((l) => l.startsWith("|"));
    tables.push([body.filter((l) => l.split("|")[3]!.trim() === "100.0%").length, body.length]);
  }
  const fr = [...readme.slice(readme.indexOf("## Fidelity")).matchAll(/^\|[^|]+\|[^|]+\| (\d+) of (\d+) \|$/gm)].map((m) => [Number(m[1]), Number(m[2])] as [number, number]);
  if (!fr.length) bad.push("README fidelity table not found");
  let at = 0;
  for (const [n, m] of fr) { const j = tables.findIndex((t, k) => k >= at && t[0] === n && t[1] === m); if (j < 0) bad.push(`README fidelity row ${n} of ${m} is not a FIDELITY.md table (tables: ${tables.map((t) => t.join("/")).join(", ")})`); else at = j + 1; }
  const all = tables.reduce((a, t) => a + t[1], 0);
  const rt = readme.match(/\((\d+) specimens? compared\)/);
  if (rt && Number(rt[1]) !== all) bad.push(`README says ${rt[1]} specimens, FIDELITY.md has ${all}`);
  const dg = JSON.parse(read("test/fidelity-digests.json"));
  const pub = need("README public-check sentence", readme.match(/(\d+) of (\d+) specimens are publicly checkable/));
  const nv = Object.keys(dg.verifiable).length, nn = Object.keys(dg.notVerifiable).length;
  if (pub && (Number(pub[1]) !== nv || Number(pub[2]) !== nv + nn)) bad.push(`README: ${pub[0]}; digests: ${nv} of ${nv + nn}`);
  if (nv + nn !== all + Object.values(dg.notVerifiable as Record<string, string>).filter((w) => /no reference/.test(w)).length) bad.push(`digests cover ${nv + nn} specimens, FIDELITY.md ${all}`);
  record("docs numbers and versions", bad.length ? "fail" : "pass", bad.length ? `${bad.length} mismatch(es)\n` + bad.join("\n") : `version ${version} everywhere; evidence ${counts.Measured}/${counts.Inferred}/${counts.Adapted}/${counts["Third-party"]}; ${cj.components.length} components; sizes; fidelity ${tables.map((t) => t.join("/")).join(", ")}; ${nv} of ${nv + nn} public`);
}

function markdownLinks(): void {
  const files = git(["ls-files", "*.md"], repo).split("\n").filter(Boolean);
  const bad: string[] = [];
  let n = 0;
  for (const f of files) {
    const text = readFileSync(join(repo, f), "utf8").replace(/```[\s\S]*?```/g, "").replace(/`[^`\n]*`/g, "");
    for (const m of text.matchAll(/!?\[[^\]\n]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)|<img[^>]*\ssrc="([^"]+)"/g)) {
      const target = (m[1] || m[2])!;
      if (/^(https?:|mailto:|#|data:)/.test(target)) continue;
      n++;
      const path = decodeURI(target.split("#")[0]!.split("?")[0]!);
      const abs = resolve(dirname(join(repo, f)), path);
      if (!existsSync(abs) || relative(repo, abs).startsWith("..")) bad.push(`${f}: ${target}`);
    }
  }
  record("Markdown relative links", bad.length ? "fail" : "pass", bad.length ? `${bad.length} broken\n` + bad.join("\n") : `${n} links in ${files.length} files resolve`);
}
