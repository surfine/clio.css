// The docs page (docs/index.html): packages/site/src as Preact components, rendered to static HTML
// with Vite's SSR build and preact-render-to-string. The page's behaviour (era switcher, copy
// buttons) is packages/site/src/client.ts, bundled by Vite and inlined at the end of the page.
// "clio-jsx" resolves to the Preact seam, as in tooling/build-components.ts and vitest.config.ts.
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "vite";
import type { Component, PackageInfo } from "../packages/core/src/types.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const site = join(root, "packages/site/src");
const shared = { configFile: false, root, logLevel: "warn", publicDir: false } as const;

async function bundleClient(): Promise<string> {
  const out = await build({
    ...shared,
    build: {
      write: false, minify: false, target: "es2022", reportCompressedSize: false,
      lib: { entry: join(site, "client.ts"), formats: ["iife"], name: "clioSite" },
    },
  });
  const chunks = (Array.isArray(out) ? out : [out]).flatMap((o) => ("output" in o ? o.output : []));
  const chunk = chunks.find((c) => c.type === "chunk");
  if (chunks.length !== 1 || !chunk || chunk.type !== "chunk") throw new Error(`site client build: expected one chunk, got ${chunks.length}`);
  return `\n${chunk.code.trim()}\n  `;
}

export async function buildSite({ pkg, components }: { pkg: PackageInfo; components: Component[] }): Promise<string> {
  const outDir = join(root, ".build/site");
  await build({
    ...shared,
    oxc: { jsx: { runtime: "automatic", importSource: "preact" } },
    resolve: { alias: { "clio-jsx": join(root, "packages/preact/src/jsx.ts") } },
    build: { ssr: join(site, "entry.tsx"), outDir, emptyOutDir: true, minify: false, target: "es2022", reportCompressedSize: false },
  });
  const { renderPage } = (await import(pathToFileURL(join(outDir, "entry.js")).href)) as { renderPage: (props: { pkg: PackageInfo; components: Component[]; script: string }) => string };
  const html = renderPage({ pkg, components, script: await bundleClient() });
  // preact-render-to-string closes void elements with "/>"; the page has always written them plain
  return html.replace(/<(meta|link|input|br)\b([^>]*?)\s?\/>/g, "<$1$2>");
}
