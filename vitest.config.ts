// npm test: tooling/build.ts first (the checks read dist/ and docs/), then these.
import { defineConfig } from "vitest/config";

export default defineConfig({ test: { include: ["test/**/*.test.ts"], reporters: ["default"] } });
