// The script build's entry: loading dist/clio.js installs window.clio. (The module build, dist/clio.mjs,
// is runtime/clio.ts itself: importing it installs nothing.)
import { install } from "./clio.ts";

install();
