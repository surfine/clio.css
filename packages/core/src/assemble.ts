// A fragment file holds its segments in source order, separated by SEP (a comment, so a
// fragment stays valid CSS for anyone importing it on its own).
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const SEP = "\n/* clio:segment */\n";
const here = dirname(fileURLToPath(import.meta.url));
const cache = new Map<string, string[]>();
/** The segments of one fragment, e.g. "components/window/window.css". */
export function segments(fragment: string): string[] {
  let s = cache.get(fragment);
  if (!s) { s = readFileSync(join(here, fragment), "utf8").split(SEP); cache.set(fragment, s); }
  return s;
}
