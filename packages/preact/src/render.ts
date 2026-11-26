// Server rendering for the shared component tests (test/components.test.ts).
import type { VNode } from "preact";
import { renderToString } from "preact-render-to-string";
export const framework = "preact";
export const render = (node: unknown): string => renderToString(node as VNode);
