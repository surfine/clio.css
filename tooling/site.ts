// Renderers for the docs site and the agent-facing text files.
import type { Component, PackageInfo } from "../packages/core/src/types.ts";
import { ERA, STATUS } from "../packages/site/src/labels.ts";

export function renderLlms({ pkg, components }: { pkg: PackageInfo; components: Component[] }): string {
  const url = pkg.homepage;
  return `# clio.css

> CSS library for classic Mac OS interfaces: Macintosh System 6, System 7, Mac OS 8.5 Drawing Board (the withdrawn beta theme) and Mac OS 8/9 Platinum. Windows, title bars, menu bars and menus, push buttons, check boxes, radio buttons, text fields, pop-up menus, list boxes, scroll bars, dialogs and alerts, group boxes, progress bars, tabs, the Control Strip and desktop icons: ${components.length} components. Pure CSS; an optional script, \`dist/clio.js\`, adds what CSS cannot (menu tracking, scroll bars, window dragging, the text caret, sounds). MIT licence; no Apple screenshots or font files. Every value is traced to its source and labelled measured (read from real pixels of the era), inferred, adapted or third-party.

Install: \`npm install ${pkg.name}\` or \`<link rel="stylesheet" href="https://unpkg.com/${pkg.name}@${pkg.version}/dist/clio.css">\`.
Optional script: \`<script src="https://unpkg.com/${pkg.name}@${pkg.version}/dist/clio.js" defer></script>\`.
System 6 is the default; add \`data-era="system7"\`, \`data-era="drawingboard"\` or \`data-era="platinum"\` to \`<html>\` or any element. Single-era builds: \`dist/clio.system6.css\`, \`dist/clio.system7.css\`, \`dist/clio.drawingboard.css\`, \`dist/clio.platinum.css\`. NeXTSTEP 3.3 is its own file, \`dist/clio.nextstep.css\` (never in \`clio.css\`): the menu bar becomes the vertical main menu, the collapse box the miniaturize button, the zoom box the resize bar.
All rules use \`:where()\` or one class, so author CSS always wins; every value is a \`--clio-*\` custom property.
Drop-in for system.css markup (.window, .title-bar button.close, .btn, .btn-default, .standard-dialog, .modal-dialog, .alert-box, .field-row, role="menu-bar").

## Docs

- [Documentation and live examples](${url}): every component with markup, tokens and evidence
- [Component index (JSON)](${url}components.json): selectors, tokens, HTML and evidence per component
- [Full reference for LLMs](${url}llms-full.txt): all component markup plus the complete stylesheet
- [README](${pkg.repository.url.replace(/^git\+/, "").replace(/\.git$/, "")}#readme)

## Components

${components.map((c) => `- [${c.name}](${url}#${c.id}): ${c.summary}`).join("\n")}

## Optional

- [EVIDENCE.md](${pkg.repository.url.replace(/^git\+/, "").replace(/\.git$/, "")}/blob/main/EVIDENCE.md): where every value comes from (measured, inferred, adapted, third-party)
- [THIRD-PARTY.md](${pkg.repository.url.replace(/^git\+/, "").replace(/\.git$/, "")}/blob/main/THIRD-PARTY.md): fonts and art from system.css, classic-stylesheets, ChicagoFLF and Asap
`;
}

export function renderLlmsFull({ pkg, components, css }: { pkg: PackageInfo; components: Component[]; css: string }): string {
  const parts = components.map((c) => {
    const variants = (c.variants || []).map((v) => `### ${v.name}\n\n${v.note}\n\n\`\`\`html\n${v.html}\n\`\`\`\n`).join("\n");
    return `## ${c.name} (#${c.id})

${c.summary}

Selectors: ${c.selectors.join(", ")}
Tokens: ${c.tokens.join(", ")}
Accessibility: ${c.accessibility}

\`\`\`html
${c.html}
\`\`\`
${variants}`;
  });
  return `# clio.css ${pkg.version} — full reference

Classic Mac OS interface CSS: System 6 (default), System 7 (data-era="system7"), Mac OS 8.5 Drawing Board (data-era="drawingboard") and Mac OS 8/9 Platinum (data-era="platinum"). NeXTSTEP 3.3 ships as its own file, dist/clio.nextstep.css (data-era="nextstep").
Install: npm install ${pkg.name} — or <link rel="stylesheet" href="https://unpkg.com/${pkg.name}@${pkg.version}/dist/clio.css">
Rules have zero or one-class specificity; override any --clio-* custom property on any element.

${parts.join("\n")}
## Stylesheet (dist/clio.css)

\`\`\`css
${css}\`\`\`
`;
}

export function renderEvidence({ pkg, components }: { pkg: PackageInfo; components: Component[] }): string {
  const rows = components
    .flatMap((c) => c.evidence.map((e) => `| ${c.name} | ${ERA[e.era]} | ${e.claim.replace(/\|/g, "\\|")} | ${STATUS[e.status]} | \`${e.source.replace(/\|/g, "\\|")}\` — ${e.upstream.replace(/\|/g, "\\|")} |`))
    .join("\n");
  const counts = components
    .flatMap((c) => c.evidence)
    .reduce<Record<string, number>>((m, e) => { m[e.status] = (m[e.status] || 0) + 1; return m; }, {});
  // P1 must leave the generated files byte-identical, so this sentence still names the
  // pre-migration path; P3 updates it when the artefacts are allowed to change.
  return `# Evidence

Generated from \`packages/core/src/components/*/*.data.ts\` by \`npm run build\`; edit there.

Every value in clio.css ${pkg.version} has a row here. Sources are paths in the AI System 6 development tree at commit \`b75cd4ed\` (public mirror: https://github.com/surfine/AI-System-6; some evidence folders such as \`internal/\` are private). The images measurements were taken from are evidence only; clio.css never ships them.

| Status | Meaning | Rows |
| --- | --- | ---: |
| Measured | read from real pixels of the era | ${counts.measured || 0} |
| Inferred | reasoned from documentation or behaviour, not measured | ${counts.inferred || 0} |
| Adapted | a deliberate departure for the web (touch, focus, contrast) | ${counts.adapted || 0} |
| Third-party | art or font from a named, licensed project | ${counts["third-party"] || 0} |

Pixel check: \`npm run fidelity\` renders the Platinum specimens and compares them with AI System 6's GUIdebook Mac OS 9.0 reference crops (it needs a local AI System 6 checkout; see the script).

| Component | Era | Value | Status | Source — upstream evidence |
| --- | --- | --- | --- | --- |
${rows}
`;
}

export function renderSitemap({ pkg }: { pkg: PackageInfo }): string {
  const today = new Date().toISOString().slice(0, 10);
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${pkg.homepage}</loc><lastmod>${today}</lastmod></url>
  <url><loc>${pkg.homepage}llms.txt</loc><lastmod>${today}</lastmod></url>
  <url><loc>${pkg.homepage}llms-full.txt</loc><lastmod>${today}</lastmod></url>
  <url><loc>${pkg.homepage}components.json</loc><lastmod>${today}</lastmod></url>
</urlset>
`;
}
