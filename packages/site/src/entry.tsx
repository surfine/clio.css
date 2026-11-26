// The server-rendered entry that tooling/build-site.ts builds with Vite and imports.
import { renderToString } from "preact-render-to-string";
import type { Component, PackageInfo } from "../../core/src/types.ts";
import { type ExampleModule, Site } from "./Site.tsx";

// Every example in packages/components/examples, keyed by component id.
const modules = import.meta.glob<ExampleModule>("../../components/examples/*.tsx", { eager: true });
const examples = Object.fromEntries(Object.entries(modules).map(([path, mod]) => [path.replace(/^.*\/(.+)\.tsx$/, "$1"), mod]));

export function renderPage(props: { pkg: PackageInfo; components: Component[]; script: string }): string {
  return `<!doctype html>\n${renderToString(<Site {...props} examples={examples} />)}\n`;
}
