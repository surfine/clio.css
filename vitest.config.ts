// npm test: tooling/build.ts first (the checks read dist/ and docs/), then these. The component
// suite runs twice, once per framework: "clio-jsx" and "clio-render" resolve to that framework's
// seam (packages/<framework>/src/), and JSX compiles with its runtime.
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const at = (p: string): string => fileURLToPath(new URL(p, import.meta.url));
const framework = (name: "preact" | "react") => ({
  oxc: { jsx: { runtime: "automatic" as const, importSource: name } },
  resolve: { alias: { "clio-jsx": at(`packages/${name}/src/jsx.ts`), "clio-render": at(`packages/${name}/src/render.ts`) } },
  test: { name, include: ["test/components.test.ts"] },
});

export default defineConfig({
  test: {
    projects: [
      { test: { name: "static", include: ["test/check.test.ts"] } },
      framework("preact"),
      framework("react"),
    ],
  },
});
