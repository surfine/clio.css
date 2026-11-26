// prepublishOnly: only the owner publishes. Agents never set CLIO_OWNER_RELEASE (AGENTS.md).
//   node tooling/release-guard.ts            the root package: the guard, then npm run verify runs
//   node tooling/release-guard.ts --stamp    a component package: the guard, then a passing
//                                            .verify/stamp.json for this exact clean HEAD
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
if (process.env.CLIO_OWNER_RELEASE !== "1") {
  console.error("Refusing to publish: CLIO_OWNER_RELEASE=1 is not set. Publishing is the owner's step (AGENTS.md, Releasing); agents never set it.");
  process.exit(1);
}
if (process.argv.includes("--stamp")) {
  const git = (a: string[]): string => spawnSync("git", a, { cwd: root, encoding: "utf8" }).stdout.trim();
  const f = join(root, ".verify/stamp.json");
  const stamp = existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : null;
  const head = git(["rev-parse", "HEAD"]);
  if (!stamp || stamp.head !== head || !stamp.pass || stamp.skipped.length || git(["status", "--porcelain"])) {
    console.error(`Refusing to publish: no full passing npm run verify for ${head.slice(0, 7)} on a clean tree (.verify/stamp.json${stamp ? `: ${stamp.head.slice(0, 7)}, ${stamp.verdict}` : " missing"}). Publish clio.css first, or run npm run verify -- --require-browser.`);
    process.exit(1);
  }
}
