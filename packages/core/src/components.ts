// The component index: one source for the docs site, components.json, llms.txt,
// llms-full.txt and EVIDENCE.md. Each component's data lives beside its CSS in
// components/<id>/<id>.data.ts; this list is the order the site and the files show them in.
//
// status: "measured"    value read from real pixels of the era
//         "inferred"    reasoned from documentation or behaviour, not measured
//         "adapted"     a deliberate departure for the web (touch, focus, contrast)
//         "third-party" art or font from a named, licensed project
//
// source: where the value lives in AI System 6 (github.com/surfine/AI-System-6, private
// development tree at commit b75cd4ed), or the capture it was read from. Evidence images
// the measurements were taken from are named in `upstream`; clio.css never ships them.
import type { Component } from "./types.ts";
import window from "./components/window/window.data.ts";
import menu from "./components/menu/menu.data.ts";
import button from "./components/button/button.data.ts";
import checkbox from "./components/checkbox/checkbox.data.ts";
import radio from "./components/radio/radio.data.ts";
import textField from "./components/text-field/text-field.data.ts";
import select from "./components/select/select.data.ts";
import listbox from "./components/listbox/listbox.data.ts";
import scrollbar from "./components/scrollbar/scrollbar.data.ts";
import dialog from "./components/dialog/dialog.data.ts";
import fieldset from "./components/fieldset/fieldset.data.ts";
import progress from "./components/progress/progress.data.ts";
import tabs from "./components/tabs/tabs.data.ts";
import controlStrip from "./components/control-strip/control-strip.data.ts";
import desktop from "./components/desktop/desktop.data.ts";
import disclosure from "./components/disclosure/disclosure.data.ts";
import listView from "./components/list-view/list-view.data.ts";
import slider from "./components/slider/slider.data.ts";
import littleArrows from "./components/little-arrows/little-arrows.data.ts";
import bevelButton from "./components/bevel-button/bevel-button.data.ts";
import chasingArrows from "./components/chasing-arrows/chasing-arrows.data.ts";
import helpButton from "./components/help-button/help-button.data.ts";
import imageWell from "./components/image-well/image-well.data.ts";
import balloon from "./components/balloon/balloon.data.ts";
import roundedWindow from "./components/rounded-window/rounded-window.data.ts";
import sideUtilityWindow from "./components/side-utility-window/side-utility-window.data.ts";
import placard from "./components/placard/placard.data.ts";
import splitBar from "./components/split-bar/split-bar.data.ts";
import browser from "./components/browser/browser.data.ts";
import pullDown from "./components/pull-down/pull-down.data.ts";
import dock from "./components/dock/dock.data.ts";
import typography from "./components/typography/typography.data.ts";

export const AIS6 = "AI System 6 @b75cd4ed";

export const components: Component[] = [
  window,
  menu,
  button,
  checkbox,
  radio,
  textField,
  select,
  listbox,
  scrollbar,
  dialog,
  fieldset,
  progress,
  tabs,
  controlStrip,
  desktop,
  disclosure,
  listView,
  slider,
  littleArrows,
  bevelButton,
  chasingArrows,
  helpButton,
  imageWell,
  balloon,
  roundedWindow,
  sideUtilityWindow,
  placard,
  splitBar,
  browser,
  pullDown,
  dock,
  typography,
];
