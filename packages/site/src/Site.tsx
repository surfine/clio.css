// The docs page (docs/index.html) as Preact components. tooling/build-site.ts renders it to a
// string at build time (Vite SSR + preact-render-to-string), so it reads in full without
// JavaScript. Each component's live specimen is drawn by the shared components
// (packages/components/examples/<id>.tsx); the snippet under it shows components.json's html.
import type { ComponentChildren } from "preact";
import type { Component, PackageInfo } from "../../core/src/types.ts";
import { ERA, STATUS } from "./labels.ts";
import css from "./site.css?raw";

/** One example module: the default export is the component's markup, `variants` its named variants. */
export type ExampleModule = { default: () => ComponentChildren; variants?: Record<string, () => ComponentChildren> };
export type SiteProps = { pkg: PackageInfo; components: Component[]; examples: Record<string, ExampleModule>; script: string };

const TITLE = "clio.css — Classic Mac OS and NeXTSTEP in CSS: System 6, System 7, Drawing Board, Mac OS 9 Platinum and NeXTSTEP 3.3";
const DESCRIPTION =
  "Classic Mac OS and NeXTSTEP in CSS: System 6, System 7, Drawing Board, Mac OS 9 Platinum and NeXTSTEP 3.3 windows, menus and controls, measured from real pixels. MIT.";

const Codes = ({ items, sep = " " }: { items: string[]; sep?: string }) => (
  <>
    {items.map((s, i) => (
      <>
        {i > 0 && sep}
        <code>{s}</code>
      </>
    ))}
  </>
);

function Example({ id, html, live, reserve, bare }: { id: string; html: string; live: ComponentChildren; reserve: number | undefined; bare: boolean | undefined }) {
  return (
    <>
      <div class="example" style={reserve ? `min-height: ${reserve}px` : undefined}>
        {bare ? live : <div class="specimen clio">{live}</div>}
      </div>
      <div class="snippet">
        <pre id={`code-${id}`}>
          <code>{html}</code>
        </pre>
        <button type="button" class="copy" data-copy={`code-${id}`}>
          Copy HTML
        </button>
      </div>
    </>
  );
}

function EvidenceTable({ c }: { c: Component }) {
  return (
    <table class="evidence">
      <caption>Where each value comes from</caption>
      <thead>
        <tr>
          <th scope="col">Era</th>
          <th scope="col">Value</th>
          <th scope="col">Status</th>
          <th scope="col">Source</th>
        </tr>
      </thead>
      <tbody>
        {c.evidence.map((e) => (
          <tr>
            <td>{ERA[e.era]}</td>
            <td>{e.claim}</td>
            <td>
              <span class={`status status-${e.status}`}>{STATUS[e.status]}</span>
            </td>
            <td>
              <code>{e.source}</code>
              <br />
              <span class="upstream">{e.upstream}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Section({ c, mod }: { c: Component; mod: ExampleModule | undefined }) {
  if (!mod) throw new Error(`site: no example for ${c.id} (packages/components/examples/${c.id}.tsx)`);
  const aliases = c.aliases ? Object.entries(c.aliases) : [];
  return (
    <section id={c.id} aria-labelledby={`h-${c.id}`}>
      <h2 id={`h-${c.id}`}>
        <a href={`#${c.id}`}>{c.name}</a>
      </h2>
      <p>{c.summary}</p>
      <Example id={c.id} html={c.html} live={mod.default()} reserve={c.reserveHeight} bare={c.bare} />
      {(c.variants || []).map((v, i) => {
        const render = mod.variants?.[v.name];
        if (!render) throw new Error(`site: ${c.id} has no variant "${v.name}" in its example`);
        return (
          <>
            <h3>{v.name}</h3>
            <p>{v.note}</p>
            <Example id={`${c.id}-${i}`} html={v.html} live={render()} reserve={0} bare={c.bare} />
          </>
        );
      })}
      <dl class="facts">
        <dt>Selectors</dt>
        <dd>
          <Codes items={c.selectors} />
        </dd>
        <dt>Tokens</dt>
        <dd>
          <Codes items={c.tokens} />
        </dd>
        <dt>Accessibility</dt>
        <dd>{c.accessibility}</dd>
      </dl>
      {c.aliases && (
        <p class="aliases">
          Also accepts:{" "}
          {aliases.map(([k, v], i) => (
            <>
              {i > 0 && "; "}
              {k} markup (<Codes items={v} sep=", " />)
            </>
          ))}
          .
        </p>
      )}
      <details class="evidence-details">
        <summary>Evidence ({c.evidence.length})</summary>
        <EvidenceTable c={c} />
      </details>
    </section>
  );
}

export function Site({ pkg, components, examples, script }: SiteProps) {
  const url = pkg.homepage;
  const repo = pkg.repository.url.replace(/^git\+/, "").replace(/\.git$/, "");
  const jsonld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareSourceCode",
        "@id": `${url}#software`,
        name: "clio.css",
        description: DESCRIPTION,
        url,
        codeRepository: repo,
        programmingLanguage: "CSS",
        license: "https://opensource.org/licenses/MIT",
        version: pkg.version,
        keywords: pkg.keywords.join(", "),
        runtimePlatform: "Web browsers",
        isAccessibleForFree: true,
        hasPart: components.map((c) => ({ "@type": "WebPageElement", name: c.name, url: `${url}#${c.id}` })),
      },
      { "@type": "WebSite", "@id": `${url}#site`, name: "clio.css", url, inLanguage: "en" },
    ],
  };
  const eras: [string, string][] = [
    ["system6", "System 6"],
    ["system7", "System 7"],
    ["drawingboard", "Drawing Board"],
    ["platinum", "Mac OS 9 Platinum"],
    ["nextstep", "NeXTSTEP"],
  ];
  return (
    <html lang="en" data-era="system6">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <link rel="canonical" href={url} />
        <meta name="color-scheme" content="light" />
        <meta name="theme-color" content="#ffffff" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="clio.css" />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:url" content={url} />
        <meta property="og:image" content={`${url}og.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="A System 6 window and a Mac OS 9 Platinum window drawn with clio.css" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="alternate" type="text/plain" title="llms.txt" href="llms.txt" />
        <link rel="alternate" type="application/json" title="Component index" href="components.json" />
        <link rel="stylesheet" href="dist/clio.css" id="clio-sheet" />
        <script src="dist/clio.js" defer />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonld) }} />
        <style dangerouslySetInnerHTML={{ __html: css }} />
      </head>
      <body>
        <header class="top">
          <h1>
            <span>clio.css</span>
          </h1>
          <p class="lede">
            A CSS library for Classic Mac OS and NeXTSTEP interfaces: <strong>System 6</strong>, <strong>System 7</strong>, Mac OS 8.5’s withdrawn <strong>Drawing Board</strong> theme,{" "}
            <strong>Mac OS 8/9 Platinum</strong> and <strong>NeXTSTEP 3.3</strong> (its own file). Windows, menus, buttons, check boxes, pop-up menus, scroll bars and dialogs, drawn with CSS and small SVGs. Every value is traced to
            measured pixels or marked as inferred. No JavaScript, no screenshots or Apple fonts. MIT.
          </p>
          <fieldset class="era-switch">
            <legend>Era</legend>
            {eras.map(([value, label]) => (
              <label>
                <input type="radio" name="era" value={value} checked={value === "system6"} /> {label}
              </label>
            ))}
          </fieldset>
        </header>

        <div class="page">
          <nav class="toc" aria-label="Contents">
            <ol>
              <li>
                <a href="#start">Get started</a>
              </li>
              {components.map((c) => (
                <li>
                  <a href={`#${c.id}`}>{c.name}</a>
                </li>
              ))}
              <li>
                <a href="#evidence-policy">Evidence policy</a>
              </li>
              <li>
                <a href="#for-agents">For AI agents</a>
              </li>
            </ol>
          </nav>

          <main>
            <section id="start" aria-labelledby="h-start" class="prose">
              <h2 id="h-start">Get started</h2>
              <div class="install">
                <pre>
                  <code>npm install {pkg.name}</code>
                </pre>
                <pre>
                  <code>{`<link rel="stylesheet" href="https://unpkg.com/${pkg.name}@${pkg.version}/dist/clio.css">`}</code>
                </pre>
                <p>Optional behaviour (held controls, Return and Esc in dialogs, scroll bars with the era's fixed scroll box):</p>
                <pre>
                  <code>{`<script src="https://unpkg.com/${pkg.name}@${pkg.version}/dist/clio.js" defer></script>`}</code>
                </pre>
              </div>
              <p>
                <code>clio.css</code> draws System 6 by default. Put <code>data-era="system7"</code>, <code>data-era="drawingboard"</code> or <code>data-era="platinum"</code> on{" "}
                <code>{"<html>"}</code>, or on any element, to switch everything inside it to that era. <code>clio.system6.css</code>, <code>clio.system7.css</code>,{" "}
                <code>clio.drawingboard.css</code> and <code>clio.platinum.css</code> are single-era builds. Every rule uses <code>:where()</code> or a single class, so your own CSS
                always wins, and every value is a <code>--clio-*</code> custom property.
              </p>
              <p>
                Coming from system.css? Its markup works unchanged: <code>.window</code>, <code>.title-bar</code> with <code>button.close</code> and <code>button.resize</code>,{" "}
                <code>.details-bar</code>, <code>.window-pane</code>, <code>.btn</code>, <code>.btn-default</code>, <code>.standard-dialog</code>, <code>.modal-dialog</code>,{" "}
                <code>.alert-box</code>, <code>.field-row</code> and <code>role="menu-bar"</code> menus.
              </p>
            </section>

            {components.map((c) => (
              <Section c={c} mod={examples[c.id]} />
            ))}

            <section id="evidence-policy" aria-labelledby="h-evidence" class="prose">
              <h2 id="h-evidence">Evidence policy</h2>
              <p>
                The values come from <a href="https://github.com/surfine/AI-System-6">AI System 6</a>, a writing desktop that recreates these eras and measures them against real
                screens: System 6.0.8, System 7.5.3 and Mac OS 8.5 (with the 8.5b6 Drawing Board theme) in the Infinite Mac emulator, and Mac OS 9.0 in Infinite Mac and from GUIdebook
                captures. Each value carries one of four labels:
              </p>
              <ul>
                <li>
                  <span class="status status-measured">Measured</span> read from real pixels of the era.
                </li>
                <li>
                  <span class="status status-inferred">Inferred</span> reasoned from documentation or behaviour, not yet measured.
                </li>
                <li>
                  <span class="status status-adapted">Adapted</span> a deliberate change for the web: touch sizes, keyboard focus, contrast.
                </li>
                <li>
                  <span class="status status-third-party">Third-party</span> art or a font from a named, licensed project.
                </li>
              </ul>
              <p>
                clio.css ships no screenshots, icons, logos or Apple fonts; screenshots stay evidence only. Small control parts for System 7, Mac OS 9 and Drawing Board (boxes,
                arrows, check boxes, tab ends) are redrawn pixel for pixel by a script, from measured pixels or the theme’s own resources, and labelled in the evidence; large
                textures are not reproduced. The fonts are ChicagoFLF (public domain) and Asap (SIL Open Font License). The full table is in <a href={`${repo}/blob/main/EVIDENCE.md`}>EVIDENCE.md</a>.
              </p>
            </section>

            <section id="for-agents" aria-labelledby="h-agents" class="prose">
              <h2 id="h-agents">For AI agents</h2>
              <p>
                Machine-readable entry points: <a href="llms.txt">llms.txt</a> (summary and links), <a href="llms-full.txt">llms-full.txt</a> (every component's markup and the full
                stylesheet) and <a href="components.json">components.json</a> (selectors, tokens, markup and evidence per component).
              </p>
            </section>
          </main>
        </div>

        <footer>
          <p>
            clio.css {pkg.version} · MIT · Not affiliated with or endorsed by Apple Inc. Macintosh, Mac OS and Chicago are trademarks of Apple Inc., named here only to describe the
            eras recreated.
          </p>
        </footer>

        <script dangerouslySetInnerHTML={{ __html: script }} />
      </body>
    </html>
  );
}
