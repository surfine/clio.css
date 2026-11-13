// Build clio.css with no dependencies.
//   dist/clio.css            System 6 by default; data-era="platinum" switches any subtree
//   dist/clio.system6.css    System 6 only
//   dist/clio.system7.css    System 7 as the page default
//   dist/clio.platinum.css   Platinum as the page default
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
 * Classic Mac OS interface CSS: System 6, System 7 and Mac OS 9 Platinum.
 * Measured values traced to AI System 6; see EVIDENCE.md.
 * Includes art from system.css (MIT) and classic-stylesheets (MIT); see THIRD-PARTY.md. */\n`;

const srcFiles = readdirSync(join(root, "src")).filter((f) => f.endsWith(".css")).sort();
const part = (f) => read(`src/${f}`).trim() + "\n";
const all = srcFiles.map(part).join("\n");
const isEra = (f) => /system7|platinum/.test(f);
const eraDefault = (era) => srcFiles
  .filter((f) => !isEra(f) || f.includes(era))
  .map((f) => (f.includes(era) ? part(f).replaceAll(`[data-era="${era}"]`, ":root") : part(f)))
  .join("\n");
const system6 = srcFiles.filter((f) => !isEra(f)).map(part).join("\n").replace(',\n[data-era="system7"]', "");
const system7Default = eraDefault("system7");
const platinumDefault = eraDefault("platinum");

function minify(css) {
  return css
    .replace(/\/\*(?!!)[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{};])\s*/g, "$1")
    .replace(/,\s+/g, ",")
    .replace(/;}/g, "}")
    .replace(/\/\*![\s\S]*?\*\//, (m) => m + "\n")
    .trim() + "\n";
}

rmSync(join(root, "dist"), { recursive: true, force: true });
const outputs = {
  "clio.css": banner("") + all,
  "clio.system6.css": banner(" (System 6 only)") + system6,
  "clio.system7.css": banner(" (System 7 default)") + system7Default,
  "clio.platinum.css": banner(" (Platinum default)") + platinumDefault,
};
for (const [name, css] of Object.entries(outputs)) {
  write(`dist/${name}`, css);
  write(`dist/${name.replace(/\.css$/, ".min.css")}`, minify(css));
}
mkdirSync(join(root, "dist/fonts"), { recursive: true });
for (const f of readdirSync(join(root, "fonts"))) copyFileSync(join(root, "fonts", f), join(root, "dist/fonts", f));

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
  if (f.endsWith(".css")) copyFileSync(join(root, "dist", f), join(root, "docs/dist", f));
}
for (const f of readdirSync(join(root, "dist/fonts"))) copyFileSync(join(root, "dist/fonts", f), join(root, "docs/dist/fonts", f));
if (existsSync(join(root, "assets/og.png"))) copyFileSync(join(root, "assets/og.png"), join(root, "docs/og.png"));

// Size report.
for (const f of readdirSync(join(root, "dist")).filter((f) => f.endsWith(".css")).sort()) {
  const buf = readFileSync(join(root, "dist", f));
  console.log(`${f.padEnd(24)} ${String(buf.length).padStart(7)} B  gzip ${String(gzipSync(buf).length).padStart(6)} B`);
}
console.log(`${components.length} components, ${components.reduce((n, c) => n + c.evidence.length, 0)} evidence rows`);
