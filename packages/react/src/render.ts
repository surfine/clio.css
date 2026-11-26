// Server rendering for the shared component tests (test/components.test.ts).
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
export const framework = "react";
export const render = (node: unknown): string => renderToStaticMarkup(node as ReactNode);
