// Renderers for the docs site and the agent-facing text files.
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const ERA = { system6: "System 6", system7: "System 7", drawingboard: "Drawing Board", platinum: "Platinum", nextstep: "NeXTSTEP", both: "Classic eras" };
const STATUS = {
  measured: "Measured",
  inferred: "Inferred",
  adapted: "Adapted",
  "third-party": "Third-party",
};

function evidenceTable(c) {
  const rows = c.evidence
    .map(
      (e) => `<tr>
          <td>${ERA[e.era]}</td>
          <td>${esc(e.claim)}</td>
          <td><span class="status status-${e.status}">${STATUS[e.status]}</span></td>
          <td><code>${esc(e.source)}</code><br><span class="upstream">${esc(e.upstream)}</span></td>
        </tr>`
    )
    .join("\n");
  return `<table class="evidence">
        <caption>Where each value comes from</caption>
        <thead><tr><th scope="col">Era</th><th scope="col">Value</th><th scope="col">Status</th><th scope="col">Source</th></tr></thead>
        <tbody>
${rows}
        </tbody>
      </table>`;
}

function example(html, id, reserve, bare) {
  const style = reserve ? ` style="min-height: ${reserve}px"` : "";
  const live = bare ? html : `<div class="specimen clio">\n${html}\n</div>`;
  return `<div class="example"${style}>
${live}
      </div>
      <div class="snippet">
        <pre id="code-${id}"><code>${esc(html)}</code></pre>
        <button type="button" class="copy" data-copy="code-${id}">Copy HTML</button>
      </div>`;
}

export function renderSite({ pkg, components }) {
  const url = pkg.homepage;
  const title = "clio.css — classic Mac OS CSS for System 6, System 7, Drawing Board and Mac OS 9 Platinum";
  const description =
    "CSS library for classic Mac OS interfaces: System 6, System 7, Mac OS 8.5 Drawing Board and Mac OS 9 Platinum windows, menus, buttons and dialogs, measured from real pixels. MIT.";
  const jsonld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareSourceCode",
        "@id": `${url}#software`,
        name: "clio.css",
        description,
        url,
        codeRepository: pkg.repository.url.replace(/^git\+/, "").replace(/\.git$/, ""),
        programmingLanguage: "CSS",
        license: "https://opensource.org/licenses/MIT",
        version: pkg.version,
        keywords: pkg.keywords.join(", "),
        runtimePlatform: "Web browsers",
        isAccessibleForFree: true,
        hasPart: components.map((c) => ({ "@type": "WebPageElement", name: c.name, url: `${url}#${c.id}` })),
      },
      {
        "@type": "WebSite",
        "@id": `${url}#site`,
        name: "clio.css",
        url,
        inLanguage: "en",
      },
    ],
  };

  const nav = components.map((c) => `<li><a href="#${c.id}">${esc(c.name)}</a></li>`).join("\n          ");
  const sections = components
    .map((c) => {
      const variants = (c.variants || [])
        .map(
          (v, i) => `<h3>${esc(v.name)}</h3>
      <p>${esc(v.note)}</p>
      ${example(v.html, `${c.id}-${i}`, 0, c.bare)}`
        )
        .join("\n      ");
      const aliases = c.aliases
        ? `<p class="aliases">Also accepts: ${Object.entries(c.aliases)
            .map(([k, v]) => `${esc(k)} markup (${v.map((s) => `<code>${esc(s)}</code>`).join(", ")})`)
            .join("; ")}.</p>`
        : "";
      return `<section id="${c.id}" aria-labelledby="h-${c.id}">
      <h2 id="h-${c.id}"><a href="#${c.id}">${esc(c.name)}</a></h2>
      <p>${esc(c.summary)}</p>
      ${example(c.html, c.id, c.reserveHeight, c.bare)}
      ${variants}
      <dl class="facts">
        <dt>Selectors</dt><dd>${c.selectors.map((s) => `<code>${esc(s)}</code>`).join(" ")}</dd>
        <dt>Tokens</dt><dd>${c.tokens.map((s) => `<code>${esc(s)}</code>`).join(" ")}</dd>
        <dt>Accessibility</dt><dd>${esc(c.accessibility)}</dd>
      </dl>
      ${aliases}
      <details class="evidence-details">
        <summary>Evidence (${c.evidence.length})</summary>
      ${evidenceTable(c)}
      </details>
    </section>`;
    })
    .join("\n\n    ");

  return `<!doctype html>
<html lang="en" data-era="system6">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${url}">
  <meta name="color-scheme" content="light">
  <meta name="theme-color" content="#ffffff">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="clio.css">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${url}og.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="A System 6 window and a Mac OS 9 Platinum window drawn with clio.css">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="alternate" type="text/plain" title="llms.txt" href="llms.txt">
  <link rel="alternate" type="application/json" title="Component index" href="components.json">
  <link rel="stylesheet" href="dist/clio.css" id="clio-sheet">
  <script src="dist/clio.js" defer></script>
  <script type="application/ld+json">${JSON.stringify(jsonld)}</script>
  <style>
    :root { --doc-ink: #111; --doc-muted: #555; --doc-rule: #d4d4d4; --doc-bg: #ffffff; --doc-tint: #f4f4f4; }
    html { background: var(--doc-bg); }
    body { margin: 0; color: var(--doc-ink); background: var(--doc-bg); font: 16px/1.6 -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; }
    .page { display: grid; grid-template-columns: 220px minmax(0, 1fr); gap: 40px; max-width: 1120px; margin: 0 auto; padding: 0 24px 80px; }
    header.top { max-width: 1120px; margin: 0 auto; padding: 40px 24px 24px; }
    header.top h1 { margin: 0 0 8px; font-size: 40px; line-height: 1.1; letter-spacing: -0.01em; }
    header.top h1 span { font-family: "ChicagoFLF", sans-serif; font-weight: 400; }
    .lede { max-width: 680px; margin: 0 0 20px; color: var(--doc-muted); font-size: 18px; }
    nav.toc { position: sticky; top: 16px; align-self: start; max-height: calc(100vh - 32px); overflow: auto; font-size: 14px; }
    nav.toc ol { margin: 0; padding: 0; list-style: none; }
    nav.toc li { margin: 2px 0; }
    nav.toc a { color: var(--doc-ink); text-decoration: none; }
    nav.toc a:hover { text-decoration: underline; }
    main > section > h2 { margin: 56px 0 8px; font-size: 26px; line-height: 1.2; }
    main > section > h2 a { color: inherit; text-decoration: none; }
    main > section > h3 { margin: 24px 0 4px; font-size: 18px; }
    main > section:first-child > h2 { margin-top: 8px; }
    .era-switch { display: inline-flex; gap: 16px; align-items: center; padding: 8px 12px; border: 1px solid var(--doc-rule); border-radius: 8px; font-size: 14px; }
    .era-switch legend { float: left; margin-right: 8px; padding: 0; font-weight: 600; background: none; font-family: inherit; font-size: inherit; }
    .era-switch label { font-family: inherit; font-size: inherit; }
    .example { position: relative; display: flex; flex-wrap: wrap; align-items: flex-start; gap: 16px; margin: 16px 0 0; padding: 24px; border: 1px solid var(--doc-rule); border-radius: 8px 8px 0 0; background: var(--clio-desktop); overflow-x: auto; }
    .example > * { max-width: 100%; }
    .specimen { padding: 16px; border: 1px solid var(--clio-ink); background: var(--clio-pane-bg); }
    .example > .menu-bar { width: 100%; }
    .snippet { position: relative; margin: 0 0 16px; border: 1px solid var(--doc-rule); border-top: 0; border-radius: 0 0 8px 8px; background: var(--doc-tint); }
    .snippet pre { margin: 0; padding: 12px 16px; overflow-x: auto; font: 13px/1.5 ui-monospace, Menlo, Consolas, monospace; }
    .snippet .copy { position: absolute; top: 8px; right: 8px; }
    .facts { display: grid; grid-template-columns: max-content minmax(0, 1fr); gap: 4px 16px; margin: 16px 0; font-size: 14px; }
    .facts dt { font-weight: 600; }
    .facts dd { margin: 0; }
    code { font: 13px/1.4 ui-monospace, Menlo, Consolas, monospace; overflow-wrap: anywhere; }
    .aliases { font-size: 14px; color: var(--doc-muted); }
    .evidence-details > summary { cursor: pointer; font-weight: 600; font-size: 15px; }
    table.evidence { width: 100%; margin: 8px 0 0; border-collapse: collapse; font-size: 13px; line-height: 1.45; }
    table.evidence caption { text-align: left; color: var(--doc-muted); padding: 4px 0; }
    table.evidence th, table.evidence td { padding: 6px 8px; border-top: 1px solid var(--doc-rule); text-align: left; vertical-align: top; }
    table.evidence .upstream { color: var(--doc-muted); }
    .status { display: inline-block; padding: 0 6px; border-radius: 4px; font-weight: 600; white-space: nowrap; }
    .status-measured { background: #dff3e4; color: #0f5223; }
    .status-inferred { background: #fdf0d5; color: #6b4500; }
    .status-adapted { background: #e3ecfb; color: #183f86; }
    .status-third-party { background: #ececec; color: #333; }
    .install { display: grid; gap: 8px; max-width: 760px; }
    .install pre { margin: 0; padding: 10px 14px; border-radius: 6px; background: var(--doc-tint); overflow-x: auto; font: 14px/1.5 ui-monospace, Menlo, Consolas, monospace; }
    .prose { max-width: 720px; }
    footer { max-width: 1120px; margin: 0 auto; padding: 24px; border-top: 1px solid var(--doc-rule); color: var(--doc-muted); font-size: 14px; }
    @media (max-width: 820px) {
      .page { grid-template-columns: minmax(0, 1fr); gap: 0; padding: 0 16px 64px; }
      header.top { padding: 28px 16px 16px; }
      header.top h1 { font-size: 30px; }
      nav.toc { position: static; max-height: none; margin: 8px 0 16px; }
      nav.toc ol { columns: 2; }
      .example { padding: 16px; }
      table.evidence thead { display: none; }
      table.evidence tr { display: block; padding: 6px 0; border-top: 1px solid var(--doc-rule); }
      table.evidence td { display: block; padding: 2px 0; border: 0; }
    }
  </style>
</head>
<body>
  <header class="top">
    <h1><span>clio.css</span></h1>
    <p class="lede">A CSS library for classic Mac OS interfaces: <strong>System 6</strong>, <strong>System 7</strong>, Mac OS 8.5’s withdrawn <strong>Drawing Board</strong> theme and <strong>Mac OS 8/9 Platinum</strong>. Windows, menus, buttons, check boxes, pop-up menus, scroll bars and dialogs, drawn with CSS and small SVGs. Every value is traced to measured pixels or marked as inferred. No JavaScript, no screenshots or Apple fonts. MIT.</p>
    <fieldset class="era-switch">
      <legend>Era</legend>
      <label><input type="radio" name="era" value="system6" checked> System 6</label>
      <label><input type="radio" name="era" value="system7"> System 7</label>
      <label><input type="radio" name="era" value="drawingboard"> Drawing Board</label>
      <label><input type="radio" name="era" value="platinum"> Mac OS 9 Platinum</label>
      <label><input type="radio" name="era" value="nextstep"> NeXTSTEP</label>
    </fieldset>
  </header>

  <div class="page">
    <nav class="toc" aria-label="Contents">
      <ol>
          <li><a href="#start">Get started</a></li>
          ${nav}
          <li><a href="#evidence-policy">Evidence policy</a></li>
          <li><a href="#for-agents">For AI agents</a></li>
      </ol>
    </nav>

    <main>
    <section id="start" aria-labelledby="h-start" class="prose">
      <h2 id="h-start">Get started</h2>
      <div class="install">
        <pre><code>npm install ${esc(pkg.name)}</code></pre>
        <pre><code>&lt;link rel="stylesheet" href="https://unpkg.com/${esc(pkg.name)}@${esc(pkg.version)}/dist/clio.css"&gt;</code></pre>
        <p>Optional behaviour (held controls, Return and Esc in dialogs, scroll bars with the era's fixed scroll box):</p>
        <pre><code>&lt;script src="https://unpkg.com/${esc(pkg.name)}@${esc(pkg.version)}/dist/clio.js" defer&gt;&lt;/script&gt;</code></pre>
      </div>
      <p><code>clio.css</code> draws System 6 by default. Put <code>data-era="system7"</code>, <code>data-era="drawingboard"</code> or <code>data-era="platinum"</code> on <code>&lt;html&gt;</code>, or on any element, to switch everything inside it to that era. <code>clio.system6.css</code>, <code>clio.system7.css</code>, <code>clio.drawingboard.css</code> and <code>clio.platinum.css</code> are single-era builds. Every rule uses <code>:where()</code> or a single class, so your own CSS always wins, and every value is a <code>--clio-*</code> custom property.</p>
      <p>Coming from system.css? Its markup works unchanged: <code>.window</code>, <code>.title-bar</code> with <code>button.close</code> and <code>button.resize</code>, <code>.details-bar</code>, <code>.window-pane</code>, <code>.btn</code>, <code>.btn-default</code>, <code>.standard-dialog</code>, <code>.modal-dialog</code>, <code>.alert-box</code>, <code>.field-row</code> and <code>role="menu-bar"</code> menus.</p>
    </section>

    ${sections}

    <section id="evidence-policy" aria-labelledby="h-evidence" class="prose">
      <h2 id="h-evidence">Evidence policy</h2>
      <p>The values come from <a href="https://github.com/surfine/AI-System-6">AI System 6</a>, a writing desktop that recreates these eras and measures them against real screens: System 6.0.8, System 7.5.3 and Mac OS 8.5 (with the 8.5b6 Drawing Board theme) in the Infinite Mac emulator, and Mac OS 9.0 in Infinite Mac and from GUIdebook captures. Each value carries one of four labels:</p>
      <ul>
        <li><span class="status status-measured">Measured</span> read from real pixels of the era.</li>
        <li><span class="status status-inferred">Inferred</span> reasoned from documentation or behaviour, not yet measured.</li>
        <li><span class="status status-adapted">Adapted</span> a deliberate change for the web: touch sizes, keyboard focus, contrast.</li>
        <li><span class="status status-third-party">Third-party</span> art or a font from a named, licensed project.</li>
      </ul>
      <p>clio.css ships no screenshots, icons, logos or Apple fonts; screenshots stay evidence only. Small control parts for System 7, Mac OS 9 and Drawing Board (boxes, arrows, check boxes, tab ends) are redrawn pixel for pixel by a script, from measured pixels or the theme’s own resources, and labelled in the evidence; large textures are not reproduced. The fonts are ChicagoFLF (public domain) and Asap (SIL Open Font License). The full table is in <a href="${esc(pkg.repository.url.replace(/^git\+/, "").replace(/\.git$/, ""))}/blob/main/EVIDENCE.md">EVIDENCE.md</a>.</p>
    </section>

    <section id="for-agents" aria-labelledby="h-agents" class="prose">
      <h2 id="h-agents">For AI agents</h2>
      <p>Machine-readable entry points: <a href="llms.txt">llms.txt</a> (summary and links), <a href="llms-full.txt">llms-full.txt</a> (every component's markup and the full stylesheet) and <a href="components.json">components.json</a> (selectors, tokens, markup and evidence per component).</p>
    </section>
    </main>
  </div>

  <footer>
    <p>clio.css ${esc(pkg.version)} · MIT · Not affiliated with or endorsed by Apple Inc. Macintosh, Mac OS and Chicago are trademarks of Apple Inc., named here only to describe the eras recreated.</p>
  </footer>

  <script>
    (function () {
      var root = document.documentElement;
      // NeXTSTEP ships in its own file (clio.nextstep.css): the page swaps stylesheets for it.
      var sheet = document.getElementById("clio-sheet");
      function set(era) {
        root.setAttribute("data-era", ["platinum", "system7", "drawingboard", "nextstep"].indexOf(era) >= 0 ? era : "system6");
        if (sheet) sheet.setAttribute("href", era === "nextstep" ? "dist/clio.nextstep.css" : "dist/clio.css");
      }
      var era = new URLSearchParams(location.search).get("era");
      if (!era) { try { era = localStorage.getItem("clio-era"); } catch (e) {} }
      if (era) {
        set(era);
        var input = document.querySelector('input[name="era"][value="' + root.getAttribute("data-era") + '"]');
        if (input) input.checked = true;
      }
      document.querySelectorAll('input[name="era"]').forEach(function (input) {
        input.addEventListener("change", function () {
          set(input.value);
          try { localStorage.setItem("clio-era", input.value); } catch (e) {}
        });
      });
      document.querySelectorAll("button.copy").forEach(function (button) {
        button.addEventListener("click", function () {
          var text = document.getElementById(button.getAttribute("data-copy")).textContent;
          var done = function () { button.textContent = "Copied"; setTimeout(function () { button.textContent = "Copy HTML"; }, 1500); };
          if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () {});
        });
      });
    })();
  </script>
</body>
</html>
`;
}

export function renderLlms({ pkg, components }) {
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

export function renderLlmsFull({ pkg, components, css }) {
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

export function renderEvidence({ pkg, components }) {
  const rows = components
    .flatMap((c) => c.evidence.map((e) => `| ${c.name} | ${ERA[e.era]} | ${e.claim.replace(/\|/g, "\\|")} | ${STATUS[e.status]} | \`${e.source.replace(/\|/g, "\\|")}\` — ${e.upstream.replace(/\|/g, "\\|")} |`))
    .join("\n");
  const counts = components.flatMap((c) => c.evidence).reduce((m, e) => ((m[e.status] = (m[e.status] || 0) + 1), m), {});
  return `# Evidence

Generated from \`components/index.mjs\` by \`npm run build\`; edit there.

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

export function renderSitemap({ pkg }) {
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
