// @clio/core/contract (M2): what a host such as AI System 6 checks itself against, in one
// typed file: the eras, each component's class names, aliases and tokens, and each era's
// page-default token values read from its single file. tooling/build.ts writes it as
// dist/contract.js + dist/contract.d.ts and each era's values as dist/tokens/<era>.json.
import type { Component, Era } from "./types.ts";

export type Tokens = Record<string, string>;

/** The --clio-* values a page gets from `:root` in one single file (later rules win). */
export function rootTokens(css: string): Tokens {
  const text = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const out: Tokens = {};
  let i = 0;
  while (i < text.length) {
    const open = text.indexOf("{", i);
    if (open < 0) break;
    const prelude = text.slice(i, open).trim();
    let depth = 1, j = open + 1;
    while (depth && j < text.length) { if (text[j] === "{") depth++; else if (text[j] === "}") depth--; j++; }
    // a nested block (an at-rule) is only a page default when it is unconditional; skip them
    if (!prelude.startsWith("@") && prelude.split(",").some((s) => s.trim() === ":root")) {
      const body = text.slice(open + 1, j - 1);
      for (const m of body.matchAll(/(--clio-[\w-]+)\s*:\s*((?:[^;"'(]|"[^"]*"|'[^']*'|\((?:[^()]|\([^()]*\))*\))*)/g)) {
        out[m[1] as string] = (m[2] as string).trim().replace(/\s+/g, " ");
      }
    }
    i = j;
  }
  return out;
}

export interface Contract {
  version: string;
  eras: Era[];
  components: { id: string; selectors: string[]; aliases: Record<string, string[]>; tokens: string[]; eras?: Era[] }[];
  tokens: Record<string, Tokens>;
}

export function contract(version: string, components: Component[], tokens: Record<string, Tokens>): Contract {
  return {
    version,
    eras: Object.keys(tokens) as Era[],
    components: components.map((c) => ({ id: c.id, selectors: c.selectors, aliases: c.aliases ?? {}, tokens: c.tokens, ...(c.eras ? { eras: c.eras } : {}) })),
    tokens,
  };
}
