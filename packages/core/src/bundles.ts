// The single files are built from layers in this order (file-name order, as src/ had them);
// each layer is the listed fragment segments joined. tooling/build.ts reads layers through
// source(); the cascade, and so every dist/*.css byte, is what it was before the split.
import { segments } from "./assemble.ts";
import { order } from "./order.ts";

export const srcFiles: string[] = Object.keys(order).sort();
/** One layer's text, e.g. source("20-window.css"). */
export function source(layer: string): string {
  const seq = order[layer];
  if (!seq) throw new Error(`no layer ${layer}`);
  return seq.map(([fragment, n]) => {
    const s = segments(fragment)[n];
    if (s === undefined) throw new Error(`${layer}: ${fragment} has no segment ${n}`);
    return s;
  }).join("");
}
/** Every fragment and how many segments the layers use from it (each must be used exactly once). */
export function usage(): Map<string, number[]> {
  const u = new Map<string, number[]>();
  for (const seq of Object.values(order)) for (const [f, n] of seq) { const a = u.get(f) ?? []; a.push(n); u.set(f, a); }
  return u;
}
