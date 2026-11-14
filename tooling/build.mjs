// Build clio.css with no dependencies.
//   dist/clio.css            System 6 by default; data-era="platinum" switches any subtree
//   dist/clio.system6.css    System 6 only
//   dist/clio.system7.css    System 7 as the page default
//   dist/clio.platinum.css   Platinum as the page default
//   dist/clio.drawingboard.css  Mac OS 8.5 Drawing Board as the page default
//   *.min.css, dist/fonts/, dist/components.json
//   docs/ (the site), llms.txt, llms-full.txt, EVIDENCE.md
import { readFileSync, writeFileSync, mkdirSync, readdirSync, copyFileSync, rmSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import { components, AIS6 } from "../components/index.mjs";
import { renderSite, renderLlms, renderLlmsFull, renderEvidence, renderSitemap } from "./site.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const read = (p) => readFileSync(join(root, p), "utf8");
const write = (p, s) => { mkdirSync(dirname(join(root, p)), { recursive: true }); writeFileSync(join(root, p), s); };

const banner = (variant) => `/*! clio.css ${pkg.version}${variant} | MIT | ${pkg.homepage}
 * Classic Mac OS interface CSS: System 6, System 7, Mac OS 8.5 Drawing Board and Mac OS 9 Platinum.
 * Measured values traced to AI System 6; see EVIDENCE.md.
 * Includes art from system.css (MIT) and pixel reconstructions of Apple control art; see THIRD-PARTY.md. */\n`;

const srcFiles = readdirSync(join(root, "src")).filter((f) => f.endsWith(".css")).sort();
// clio.js draws scroll bars as elements (fixed-size scroll boxes, held arrows, the
// dragged outline). Every ::-webkit-scrollbar rule is copied onto those elements, right
// after the original, so the two bars share one set of rules. Each pseudo-class maps to
// one class (or an always-true :not()), keeping the rules' relative specificity.
const SB = "> .clio-sb-anchor > ";
const ANY = ":not(.clio-sb-never)";
function mirrorSelector(sel) {
  const m = sel.match(/^(.*?)::-webkit-scrollbar(-[a-z]+)?((?::[a-z-]+)*)$/s);
  if (!m) return null;
  const [, host, part = "", states] = m;
  if (/html\.clio-scrollbars\)?\s*$/.test(host) && !/\*\)?\s*$/.test(host)) return null;   // the page's own scroll bar stays native
  const st = states.split(":").filter(Boolean);
  if (st.includes("start") && st.includes("increment") || st.includes("end") && st.includes("decrement")) return null;   // double arrows: placed by clio.js
  let axis = "", own = "";
  for (const s of st) {
    if (s === "vertical") axis += ".clio-sb-v";
    else if (s === "horizontal") axis += ".clio-sb-h";
    else if (s === "decrement") own += ".clio-sb-dec";
    else if (s === "increment") own += ".clio-sb-inc";
    else if (s === "start" || s === "end") own += ANY;
    else if (s === "active") own += ".clio-held";
    else if (s === "hover") own += ":hover";
    else throw new Error("mirrorSelector: unknown scroll-bar state :" + s);
  }
  const bar = `.clio-sb${axis}`;
  if (part === "") return `${host} ${SB}${bar}${own}`;
  if (part === "-corner") return `${host} ${SB}.clio-sb-corner${own}`;
  return `${host} ${SB}${bar} > .clio-sb${part}${own}`;
}
function splitList(sel) {
  const out = []; let depth = 0, cur = "";
  for (const ch of sel) {
    if (ch === "(") depth++; else if (ch === ")") depth--;
    if (ch === "," && depth === 0) { out.push(cur.trim()); cur = ""; } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}
function mirrorScrollbars(css) {
  let out = "", i = 0;
  while (i < css.length) {
    const open = css.indexOf("{", i);
    if (open < 0) { out += css.slice(i); break; }
    // the rule's prelude starts after the last top-level "}" or comment
    let depth = 1, j = open + 1;
    while (depth && j < css.length) { if (css[j] === "{") depth++; else if (css[j] === "}") depth--; j++; }
    const chunk = css.slice(i, j);
    out += chunk;
    const prelude = css.slice(i, open).replace(/\/\*[\s\S]*?\*\//g, "").trim();
    if (!prelude.startsWith("@") && prelude.includes("::-webkit-scrollbar")) {
      const sels = splitList(prelude).map(mirrorSelector).filter(Boolean);
      if (sels.length) out += "\n\n" + sels.join(",\n") + " " + css.slice(open, j);
    }
    i = j;
  }
  return out;
}
const part = (f) => {
  const css = read(`src/${f}`).trim() + "\n";
  return /scrollbar-js/.test(f) ? css : mirrorScrollbars(css);
};
const all = srcFiles.map(part).join("\n");
const isEra = (f) => /system7|platinum|drawingboard/.test(f);
// Drawing Board shares the Platinum layer, whose rules are scoped to either era.
const SHARED = ':is([data-era="platinum"], [data-era="drawingboard"])';
const layers = { system7: ["system7"], platinum: ["platinum"], drawingboard: ["platinum", "drawingboard"] };
const eraDefault = (era) => srcFiles
  .filter((f) => !isEra(f) || (layers[era].some((l) => f.includes(l)) && !(f.includes("platinum-only") && era !== "platinum")))
  .map((f) => (isEra(f) ? part(f).replaceAll(SHARED, ":root").replaceAll(`[data-era="${era}"]`, ":root") : part(f)))
  .join("\n");
const system6 = srcFiles.filter((f) => !isEra(f)).map(part).join("\n").replace(',\n[data-era="system7"]', "");
const system7Default = eraDefault("system7");
const platinumDefault = eraDefault("platinum");
const drawingboardDefault = eraDefault("drawingboard");

function minify(css) {
  return css
    .replace(/\/\*(?!!)[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{};])\s*/g, "$1")
    .replace(/,\s+/g, ",")
    .replace(/;}/g, "}")
    .replace(/#([0-9a-f])\1([0-9a-f])\2([0-9a-f])\3(?![0-9a-f])/gi, "#$1$2$3")   // #aabbcc -> #abc (data URIs spell # as %23)
    .replace(/\/\*![\s\S]*?\*\//, (m) => m + "\n")
    .trim() + "\n";
}

rmSync(join(root, "dist"), { recursive: true, force: true });
const outputs = {
  "clio.css": banner("") + all,
  "clio.system6.css": banner(" (System 6 only)") + system6,
  "clio.system7.css": banner(" (System 7 default)") + system7Default,
  "clio.platinum.css": banner(" (Platinum default)") + platinumDefault,
  "clio.drawingboard.css": banner(" (Drawing Board default)") + drawingboardDefault,
};
for (const [name, css] of Object.entries(outputs)) {
  write(`dist/${name}`, css);
  write(`dist/${name.replace(/\.css$/, ".min.css")}`, minify(css));
}
mkdirSync(join(root, "dist/fonts"), { recursive: true });
for (const f of readdirSync(join(root, "fonts"))) copyFileSync(join(root, "fonts", f), join(root, "dist/fonts", f));
// Drawing Board theme art: the files the stylesheets reference, beside them.
const artFiles = [...new Set([...all.matchAll(/url\("(art\/[^"]+)"\)/g)].map((m) => m[1]))].sort();
const copyArt = (to) => {
  for (const f of artFiles) { mkdirSync(dirname(join(root, to, f)), { recursive: true }); copyFileSync(join(root, f), join(root, to, f)); }
};
copyArt("dist");
// clio.js, the optional behaviour layer: copied as written (it carries its own banner).
write("dist/clio.js", read("js/clio.js").replace("0.11.0-dev", pkg.version));

// Machine-readable component index.
const index = {
  name: "clio.css",
  version: pkg.version,
  description: pkg.description,
  homepage: pkg.homepage,
  license: pkg.license,
  eras: [
    { id: "system6", name: "Macintosh System 6", attribute: 'data-era="system6"', default: true, file: "dist/clio.system6.css" },
    { id: "system7", name: "Macintosh System 7 (colour)", attribute: 'data-era="system7"', file: "dist/clio.system7.css" },
    { id: "drawingboard", name: "Mac OS 8.5 Drawing Board (beta theme)", attribute: 'data-era="drawingboard"', file: "dist/clio.drawingboard.css" },
    { id: "platinum", name: "Mac OS 8/9 Platinum", attribute: 'data-era="platinum"', file: "dist/clio.platinum.css" },
  ],
  install: {
    npm: `npm install ${pkg.name}`,
    cdn: `https://unpkg.com/${pkg.name}@${pkg.version}/dist/clio.css`,
    jsdelivr: `https://cdn.jsdelivr.net/npm/${pkg.name}@${pkg.version}/dist/clio.css`,
  },
  evidenceStatuses: {
    measured: "read from real pixels of the era",
    inferred: "reasoned from documentation or behaviour, not measured",
    adapted: "a deliberate departure for the web (touch, focus, contrast)",
    "third-party": "art or font from a named, licensed project",
  },
  evidenceBase: AIS6,
  components,
};
const json = JSON.stringify(index, null, 2) + "\n";
write("dist/components.json", json);

// Site and agent-facing files.
rmSync(join(root, "docs"), { recursive: true, force: true });
write("docs/index.html", renderSite({ pkg, components }));
write("docs/components.json", json);
const llms = renderLlms({ pkg, components });
const llmsFull = renderLlmsFull({ pkg, components, css: all });
write("docs/llms.txt", llms);
write("docs/llms-full.txt", llmsFull);
write("llms.txt", llms);
write("docs/sitemap.xml", renderSitemap({ pkg }));
write("docs/robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${pkg.homepage}sitemap.xml\n`);
write("docs/.nojekyll", "");
write("EVIDENCE.md", renderEvidence({ pkg, components }));
mkdirSync(join(root, "docs/dist/fonts"), { recursive: true });
for (const f of readdirSync(join(root, "dist"))) {
  if (f.endsWith(".css") || f.endsWith(".js")) copyFileSync(join(root, "dist", f), join(root, "docs/dist", f));
}
for (const f of readdirSync(join(root, "dist/fonts"))) copyFileSync(join(root, "dist/fonts", f), join(root, "docs/dist/fonts", f));
copyArt("docs/dist");
if (existsSync(join(root, "assets/og.png"))) copyFileSync(join(root, "assets/og.png"), join(root, "docs/og.png"));

// Size report.
for (const f of readdirSync(join(root, "dist")).filter((f) => f.endsWith(".css")).sort()) {
  const buf = readFileSync(join(root, "dist", f));
  console.log(`${f.padEnd(24)} ${String(buf.length).padStart(7)} B  gzip ${String(gzipSync(buf).length).padStart(6)} B`);
}
console.log(`${components.length} components, ${components.reduce((n, c) => n + c.evidence.length, 0)} evidence rows, ${artFiles.length} art files`);
