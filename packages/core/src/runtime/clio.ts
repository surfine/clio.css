/*! clio.js — optional behaviour for clio.css | MIT | https://surfine.github.io/clio.css/
 * Load after clio.css; nothing in clio.css needs it. It adds what CSS cannot do:
 *   - a pressed control lets go while the pointer is off it and presses again on return
 *   - Return/Enter clicks a dialog's default button, Esc or Cmd-. its cancel button,
 *     each after flashing it pressed
 *   - scroll bars with the era's fixed-size scroll box, arrows that repeat while held,
 *     paging from the lane, and System 6/7's dragged outline (Mac OS 8/9 drag live)
 *   - menus that track the pointer (drag and release, blink, submenus, keys) and
 *     <select> opening as the era's pop-up menu
 *   - window dragging with a grey outline, the collapse box, clio.zoomRects()
 *   - the era's insertion point in text fields (XOR, measured blink)
 *   - optional Appearance sound sets and alert sounds you supply (clio.sounds.use)
 * Opt out per element with data-clio-js="off". */

import { install as installButton } from "../components/button/button.behaviour.ts";
import { install as installDialog } from "../components/dialog/dialog.behaviour.ts";
import { claimBars, install as installMenu } from "../components/menu/menu.behaviour.ts";
import { install as installSelect } from "../components/select/select.behaviour.ts";
import { live, refresh, scrollbars, unscroll } from "../components/scrollbar/scrollbar.behaviour.ts";
import { claimWindows, collapse, createLiveRegion, install as installWindow, zoomRects } from "../components/window/window.behaviour.ts";
import { install as installSplitBar } from "../components/split-bar/split-bar.behaviour.ts";
import { install as installTextField } from "../components/text-field/text-field.behaviour.ts";
import { centre, install as installCentre, queueCentre } from "./centre.ts";
import { play, soundsApi, install as installSounds } from "./sounds.ts";
import { install as installWatch } from "./watch.ts";

/* The API, as window.clio. Importing this module installs nothing: call install(). */
export const api = {
  version: "1.0.2",
  zoomRects,
  collapse,
  sounds: soundsApi,
  play,
  scrollbars,
  unscroll,
  refresh,
  centre,   // align centred labels again (after a change clio.js cannot see)
} satisfies ClioApi;

function start() {
  createLiveRegion();
  claimWindows(document);
  scrollbars(document);
  claimBars(document);   // clio.js opens these menus; focus alone no longer does
  queueCentre();
  new MutationObserver((records) => {
    for (const r of records) for (const n of r.addedNodes) if (n instanceof Element && !n.classList.contains("clio-sb-anchor") && !n.closest(".clio-sb-anchor")) { scrollbars(n); claimBars(n); if (!n.classList.contains("clio-move-menu") && !n.classList.contains("clio-outline") && !n.classList.contains("clio-live")) claimWindows(n); }
  }).observe(document.documentElement, { childList: true, subtree: true });
  // An era or Smart Scrolling switched anywhere: the bars' sizes come from the era.
  new MutationObserver(() => { queueCentre(); for (const b of live) if (b.host.isConnected) b.schedule(); })
    .observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: ["data-era", "data-clio-scrolling"] });
}

export function install(): void {
  if (typeof document === "undefined" || window.clio) return;
  // The order the statements ran in the single file: listener registration order is observable.
  installButton();
  installDialog();
  installMenu();
  installSelect();
  installWindow();
  installSplitBar();
  installCentre();
  installTextField();
  installSounds();
  installWatch();
  window.clio = api;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
}
