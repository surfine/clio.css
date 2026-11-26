// P5: the shared components, run once per framework (vitest.config.ts: projects "preact" and
// "react"). Each example in packages/components/examples renders, on the server, to markup that
// a browser parses into the same DOM as the component's html in components.json.
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, type Browser } from "playwright";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { framework, render } from "clio-render";
import { components } from "../packages/core/src/components.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const done = readdirSync(join(root, "packages/components/examples")).filter((f) => f.endsWith(".tsx")).map((f) => f.replace(/\.tsx$/, ""));

let browser: Browser;
let compare: (a: string, b: string) => Promise<string | null>;
beforeAll(async () => {
  browser = await chromium.launch();
  const page = await browser.newPage();
  // Both strings parse in one document. JSX drops the whitespace-only text between tags that a
  // hand-written example has (the examples restore the ones that show: the site's screenshots guard
  // visible spacing), and React separates adjacent text with comments: the walk ignores
  // both, collapses runs of white space in text, and compares style as the browser reads it.
  compare = (want, got) => page.evaluate(([a, b]) => {
    const parse = (html: string) => { const t = document.createElement("template"); t.innerHTML = html; return t.content; };
    const kids = (n: Node) => [...n.childNodes].filter((c) => c.nodeType === 1 || (c.nodeType === 3 && /\S/.test(c.textContent!)));
    const path = (n: Node): string => (n.parentNode && n.parentNode.nodeType === 1 ? path(n.parentNode) + " > " : "") + (n.nodeType === 1 ? (n as Element).tagName.toLowerCase() : "#text");
    const same = (x: Node, y: Node): string | null => {
      if (x.nodeType !== y.nodeType) return `${path(x)}: node type ${x.nodeType} vs ${y.nodeType}`;
      if (x.nodeType === 3) { const s = (t: string) => t.replace(/\s+/g, " "); return s(x.textContent!) === s(y.textContent!) ? null : `${path(x)}: text ${JSON.stringify(x.textContent)} vs ${JSON.stringify(y.textContent)}`; }
      const ex = x as Element, ey = y as Element;
      if (x.nodeType === 1 && ex.tagName !== ey.tagName) return `${path(x)}: <${ex.tagName}> vs <${ey.tagName}>`;
      const attrs = (e: Element) => Object.fromEntries([...e.attributes].map((a) => [a.name, a.name === "style" ? (e as HTMLElement).style.cssText : a.name === "class" ? a.value.trim().split(/\s+/).sort().join(" ") : a.value]));
      const ax = x.nodeType !== 1 ? "" : JSON.stringify(Object.entries(attrs(ex)).sort()), ay = y.nodeType !== 1 ? "" : JSON.stringify(Object.entries(attrs(ey)).sort());
      if (ax !== ay) return `${path(x)}: attributes ${ax} vs ${ay}`;
      const kx = kids(x), ky = kids(y);
      if (kx.length !== ky.length) return `${path(x)}: ${kx.length} children vs ${ky.length}`;
      for (let i = 0; i < kx.length; i++) { const d = same(kx[i]!, ky[i]!); if (d) return d; }
      return null;
    };
    const drop = (n: Node) => { for (const c of [...n.childNodes]) { if (c.nodeType === 8) c.remove(); else drop(c); } return n; };
    return same(parse(a), drop(parse(b)));
  }, [want, got] as const);
});
afterAll(async () => { await browser?.close(); });

describe(`components (${framework})`, () => {
  test("every example names a component", () => {
    expect(done.filter((id) => !components.some((c) => c.id === id))).toEqual([]);
  });
  for (const id of done) {
    const c = components.find((x) => x.id === id)!;
    test(`${id}: the example renders components.json's markup`, async () => {
      const mod = await import(`../packages/components/examples/${id}.tsx`);
      expect(await compare(c.html, render(mod.default()))).toBeNull();
      const vs = (mod.variants ?? {}) as Record<string, () => unknown>;
      expect(Object.keys(vs).sort()).toEqual((c.variants ?? []).map((v) => v.name).sort());
      for (const v of c.variants ?? []) expect(await compare(v.html, render(vs[v.name]!())), v.name).toBeNull();
    });
  }
});
