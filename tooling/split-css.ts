// P2: split the 24 era-ordered CSS files into component x layer fragments.
//
//   node tooling/split-css.ts             split src/*.css into packages/core/src/ and write order.ts
//                                         (ran once, on efd1816; src/ is gone since)
//   node tooling/split-css.ts --check efd1816   assemble every layer from today's fragments and
//                                         compare it byte for byte with that tree's src/ (passes
//                                         until a CSS change lands, which is the point of it)
//
// Each file is cut into top-level blocks (a rule, an at-rule with its body, or a statement), each
// with the comments and blank lines before it. A block goes to the component its selector names
// (the rightmost token a component owns), else to its file's default, else to foundation. Runs of
// blocks that go to the same fragment stay one segment; a fragment holds its segments in source
// order, separated by SEP. bundles.ts lists, per original file, which segments make it up, so
// joining them gives the original text exactly.
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { components } from "../packages/core/src/components.ts";
import { SEP } from "../packages/core/src/assemble.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const core = join(root, "packages/core/src");

// whole files that are not one component's: fonts, tokens, base, cursors, adapt, CJK
const FOUNDATION = /^(00-fonts|01-tokens|10-base|12-cursors|95-adapt|95-platinum-font-options|96-cjk|97-cjk-platinum-only|97-cjk-platinum|98-cjk-drawingboard)\.css$/;
// a component file's own component, for blocks whose selector names none
const FILE_DEFAULT: Record<string, string> = {
  "20-window.css": "window", "30-menu.css": "menu", "50-dialog.css": "dialog",
  "60-scrollbar.css": "scrollbar", "62-scrollbar-js.css": "scrollbar", "70-control-strip.css": "control-strip",
};
// tokens clio.js and the base files use that no component lists
const EXTRA: Record<string, string> = {
  ".clio-sb": "scrollbar", ".clio-scrollbars": "scrollbar", ".clio-scroll": "scrollbar", "::-webkit-scrollbar": "scrollbar",
  ".clio-popup": "select", ".clio-caret": "text-field", ".clio-outline": "window", ".clio-move": "window",
  ".clio-drag": "window", ".clio-split": "split-bar", ".details-bar": "window", ".inactive-title-bar": "window",
  ".close-box": "window", ".resize-box": "window", ".shade-box": "window", "summary": "disclosure", "details": "disclosure",
  ".window": "window", ".window-pane": "window", ".clio-popup-menu": "select", ".clio-split-outline": "split-bar",
  "textarea": "text-field", "legend": "fieldset", "fieldset": "fieldset", "progress": "progress", "select": "select",
};
const IGNORE = new Set(["li", "ul", "ol", "a", "img", "span", "div", "p", "h1", "h2", "h3", "label", "html", "body", "input", "kbd", ".clio", ".selected", "[aria-selected=true]"]);

/** The tokens of a selector, in order: classes, roles, input types, elements, scroll-bar pseudo-elements. */
function tokens(sel: string): string[] {
  // drop :not(...) contents; keep :where/:is contents
  let s = "", depth = 0, skip = -1;
  for (let i = 0; i < sel.length; i++) {
    if (sel.startsWith(":not(", i) && skip < 0) { skip = depth; depth++; i += 4; continue; }
    const ch = sel[i];
    if (ch === "(") depth++;
    else if (ch === ")") { depth--; if (depth === skip) { skip = -1; continue; } }
    if (skip < 0) s += ch;
  }
  s = s.replace(/["']/g, "").replace(/\[data-era=[^\]]*\]/g, " ");
  const out: string[] = [];
  for (const m of s.matchAll(/::-webkit-scrollbar|\.[a-zA-Z][\w-]*|\[role=[\w-]+\]|\[aria-[\w-]+(?:=[\w-]+)?\]|input\[type=[\w-]+\]|(?<![\w.#:[-])[a-z][a-z0-9]*(?![\w-]*[=\]])/g)) {
    let t = m[0];
    if (t.startsWith(".clio-sb")) t = ".clio-sb";
    else if (t.startsWith(".clio-scroll") && t !== ".clio-scrollbars") t = ".clio-scroll";
    out.push(t);
  }
  return out;
}

// token -> component; a token two components claim is left out
const owner = new Map<string, string>();
const shared = new Set<string>();
for (const c of components) {
  for (const sel of [...c.selectors, ...Object.values(c.aliases ?? {}).flat()]) {
    for (const t of tokens(sel)) {
      if (IGNORE.has(t)) continue;
      const o = owner.get(t);
      if (o && o !== c.id) shared.add(t); else owner.set(t, c.id);
    }
  }
}
for (const t of shared) owner.delete(t);
for (const [t, c] of Object.entries(EXTRA)) owner.set(t, c);

function splitList(sel: string): string[] {
  const out: string[] = []; let depth = 0, cur = "";
  for (const ch of sel) {
    if (ch === "(") depth++; else if (ch === ")") depth--;
    if (ch === "," && depth === 0) { out.push(cur); cur = ""; } else cur += ch;
  }
  out.push(cur);
  return out;
}
/** The component a selector list belongs to: per selector, its rightmost owned token; the most common wins. */
function classify(prelude: string): string | null {
  const votes = new Map<string, number>();
  for (const sel of splitList(prelude)) {
    const ts = tokens(sel);
    for (let i = ts.length - 1; i >= 0; i--) {
      const c = owner.get(ts[i] as string);
      if (c) { votes.set(c, (votes.get(c) ?? 0) + 1); break; }
    }
  }
  let best: string | null = null, n = 0;
  for (const [c, v] of votes) if (v > n) { best = c; n = v; }
  return best;
}

type Block = { text: string; prelude: string };
/** Top-level blocks; each carries the whitespace and comments before it. */
function blocks(css: string): Block[] {
  const out: Block[] = [];
  let start = 0, i = 0, depth = 0, preludeStart = -1, prelude = "";
  while (i < css.length) {
    if (css.startsWith("/*", i)) { const e = css.indexOf("*/", i + 2); i = e < 0 ? css.length : e + 2; continue; }
    const ch = css[i] as string;
    if (ch === '"' || ch === "'") { let j = i + 1; while (j < css.length && css[j] !== ch) j += css[j] === "\\" ? 2 : 1; i = j + 1; continue; }
    if (depth === 0 && preludeStart < 0 && !/\s/.test(ch)) preludeStart = i;
    if (ch === "{") { if (depth === 0) prelude = css.slice(preludeStart, i); depth++; }
    else if (ch === "}") { depth--; if (depth === 0) { out.push({ text: css.slice(start, i + 1), prelude }); start = i + 1; preludeStart = -1; } }
    else if (ch === ";" && depth === 0) { out.push({ text: css.slice(start, i + 1), prelude: css.slice(preludeStart, i) }); start = i + 1; preludeStart = -1; }
    i++;
  }
  if (start < css.length) {
    const last = out[out.length - 1];
    if (last) last.text += css.slice(start); else out.push({ text: css.slice(start), prelude: "" });
  }
  return out;
}
/** For an at-rule, the selectors inside it stand for it. */
function innerPreludes(b: Block): string {
  if (!b.prelude.trim().startsWith("@")) return b.prelude;
  const body = b.text.slice(b.text.indexOf("{") + 1, b.text.lastIndexOf("}"));
  return blocks(body).map((x) => x.prelude).filter((p) => p.trim() && !p.trim().startsWith("@")).join(",");
}

const layerOf = (f: string): string => f.replace(/^\d+-/, "").replace(/\.css$/, "");
const isEraFile = (f: string): boolean => /^(8|9[0-3])\d?-/.test(f) && !FOUNDATION.test(f);
function fragmentFor(f: string, b: Block): string {
  if (FOUNDATION.test(f)) return `foundation/${layerOf(f)}.css`;
  const at = b.prelude.trim();
  const KEYFRAMES: Record<string, string> = { "clio-chase": "chasing-arrows" };
  const kf = /^@keyframes\s+([\w-]+)/.exec(at);
  const p = kf ? "" : innerPreludes(b);
  const forced = kf ? KEYFRAMES[kf[1] as string] : /base-select/.test(at) ? "select" : undefined;
  const c = forced ?? (p.trim() && !p.trim().startsWith("@font-face") ? classify(p) : null) ?? (isEraFile(f) ? null : FILE_DEFAULT[f] ?? null);
  if (!c) return `foundation/${layerOf(f)}.css`;
  return isEraFile(f) ? `components/${c}/${c}.${layerOf(f)}.css` : `components/${c}/${c}.css`;
}

const srcOf = (ref: string | null, f: string): string =>
  ref ? execFileSync("git", ["show", `${ref}:src/${f}`], { cwd: root, encoding: "utf8" }) : readFileSync(join(root, "src", f), "utf8");

if (process.argv[2] === "--check") {
  const ref = process.argv[3];
  if (!ref) { console.error("usage: split-css.ts --check <git ref with src/>"); process.exit(2); }
  const { srcFiles, source } = await import("../packages/core/src/bundles.ts");
  const want = execFileSync("git", ["ls-tree", "--name-only", `${ref}:src`], { cwd: root, encoding: "utf8" }).split("\n").filter((f) => f.endsWith(".css")).sort();
  let bad = 0;
  if (JSON.stringify(want) !== JSON.stringify(srcFiles)) { console.log(`FAIL file list differs: ${ref} has ${want.join(" ")}`); bad++; }
  for (const f of want) { if (source(f) !== srcOf(ref, f)) { console.log(`FAIL ${f}: assembled text differs from ${ref}`); bad++; } }
  console.log(bad ? `${bad} failures` : `ok: ${want.length} files assemble to ${ref}'s src/ byte for byte`);
  process.exit(bad ? 1 : 0);
}

const files = readdirSync(join(root, "src")).filter((f) => f.endsWith(".css")).sort();
const frags = new Map<string, string[]>();
const order: Record<string, [string, number][]> = {};
for (const f of files) {
  const seq: [string, number][] = [];
  let curFrag = "", cur = "";
  const flush = (): void => {
    if (!curFrag) return;
    const segs = frags.get(curFrag) ?? [];
    if (cur.includes(SEP)) throw new Error(`${f}: a segment contains the separator`);
    segs.push(cur); frags.set(curFrag, segs); seq.push([curFrag, segs.length - 1]);
  };
  for (const b of blocks(srcOf(null, f))) {
    const fr = fragmentFor(f, b);
    if (fr !== curFrag) { flush(); curFrag = fr; cur = ""; }
    cur += b.text;
  }
  flush();
  order[f] = seq;
}

rmSync(join(core, "components"), { recursive: true, force: true });
rmSync(join(core, "foundation"), { recursive: true, force: true });
for (const [fr, segs] of frags) {
  mkdirSync(dirname(join(core, fr)), { recursive: true });
  writeFileSync(join(core, fr), segs.join(SEP));
}
const lines = Object.entries(order).map(([f, seq]) => `  ${JSON.stringify(f)}: [${seq.map(([fr, n]) => `[${JSON.stringify(fr)}, ${n}]`).join(", ")}],`);
writeFileSync(join(core, "order.ts"), `// Written by tooling/split-css.ts (P2), then kept by hand: which fragment segments make up each
// single-file layer, in cascade order. A new rule goes into an existing segment; a new segment
// (a rule placed between two others of different fragments) is a new entry here.
export const order: Record<string, [string, number][]> = {
${lines.join("\n")}
};
`);
const segCount = [...frags.values()].reduce((n, s) => n + s.length, 0);
console.log(`${files.length} files -> ${frags.size} fragments, ${segCount} segments`);
for (const [fr, segs] of [...frags].sort()) console.log(`  ${fr}  ${segs.length} seg  ${segs.reduce((n, s) => n + s.length, 0)} B`);
