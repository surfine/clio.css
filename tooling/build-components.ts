// clio.css-preact and clio.css-react from one JSX source (packages/components/src), P5.
//   packages/<framework>/dist/index.js     ESM, the framework left as an import (a peer dependency)
//   packages/<framework>/dist/types/       declarations, "clio-jsx" pointed at the package's own seam
// The tests (test/components.test.ts) run the source through the same seams; this is what ships.
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "vite";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const walk = (d: string): string[] => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));

for (const fw of ["preact", "react"] as const) {
  const out = join(root, "packages", fw, "dist");
  rmSync(out, { recursive: true, force: true });
  await build({
    configFile: false, root, logLevel: "warn", publicDir: false,
    oxc: { jsx: { runtime: "automatic", importSource: fw } },
    resolve: { alias: { "clio-jsx": join(root, "packages", fw, "src/jsx.ts") } },
    build: {
      outDir: out, emptyOutDir: false, minify: false, target: "es2022", reportCompressedSize: false,
      lib: { entry: join(root, "packages/components/src/index.ts"), formats: ["es"], fileName: () => "index.js" },
      rolldownOptions: { external: (id: string) => id === fw || id.startsWith(`${fw}/`) || (fw === "react" && id.startsWith("react-dom")) },
    },
  });
  // declarations for the library alone (the shared tsconfig also covers the examples and the test)
  const cfg = join(root, `.build/tsconfig.components.${fw}.json`);
  mkdirSync(dirname(cfg), { recursive: true });
  writeFileSync(cfg, JSON.stringify({ extends: `../tsconfig.components.${fw}.json`, include: ["../packages/components/src", `../packages/${fw}/src/jsx.ts`] }));
  execFileSync(join(root, "node_modules/.bin/tsc"), ["-p", cfg, "--noEmit", "false", "--declaration", "--emitDeclarationOnly", "--rewriteRelativeImportExtensions", "--rootDir", join(root, "packages"), "--outDir", join(out, "types")], { cwd: root, stdio: "inherit" });
  // the declarations name the seam by its alias and local files by their .ts/.tsx names: point
  // them at the seam's copy in the package and at the .js names a consumer resolves
  const seam = join(out, "types", fw, "src/jsx.js");
  for (const f of walk(join(out, "types")).filter((f) => f.endsWith(".d.ts"))) {
    const rel = relative(dirname(f), seam).replace(/^(?!\.)/, "./");
    writeFileSync(f, readFileSync(f, "utf8").replaceAll('"clio-jsx"', JSON.stringify(rel)).replace(/(from "\.\.?\/[^"]+)\.tsx?"/g, '$1.js"'));
  }
  const js = readFileSync(join(out, "index.js"), "utf8");
  if (/clio-jsx|from "\.\//.test(js)) throw new Error(`${fw}: index.js still imports the seam or a local file`);
  console.log(`packages/${fw}/dist/index.js  ${js.length} B`);
}
