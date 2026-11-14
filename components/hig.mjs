const P9 = "clio.css capture, Mac OS 9.0 in Infinite Mac (driven by hand, frames in .fidelity/hig/platinum9)";
const DB = "clio.css capture, Mac OS 8.5 with Drawing Board in Infinite Mac (frames in .fidelity/hig/drawingboard)";
const S7 = "clio.css capture, System 7.5.3 in Infinite Mac (frames in .fidelity/hig/system7)";
const THEME = "the theme file's pxm# and ppat resources (tooling/db-art.py)";
const HIG8 = "Mac OS 8 Human Interface Guidelines (1997), ch. 2";
const HIG92 = "Macintosh Human Interface Guidelines (1992)";
export default [
  { id: "disclosure", name: "Disclosure triangle",
    summary: "The triangle that shows and hides a list's or a dialog's details. A <details> summary gets it too.",
    selectors: [".disclosure", ".disclosure[aria-expanded=true]", "details > summary", "details[open] > summary"],
    tokens: ["--clio-disclosure-size", "--clio-art-disclosure", "--clio-art-disclosure-open"],
    accessibility: "Use a <button> with aria-expanded and aria-controls, or <details>/<summary>, which keyboards and screen readers already understand.",
    html: `<details open>
  <summary>Control Panels &amp; Extensions</summary>
  <p style="margin: 4px 0 0 17px">Appearance</p>
</details>
<button class="disclosure" aria-expanded="false" aria-label="Show Developer"></button> Developer`,
    evidence: [
      { era: "system7", claim: "11px, a black outline with a blue and white checker inside, closed and open", status: "measured", source: S7 + ", frames list and list-open (Finder, View by Name)", upstream: "Control Panels & Extensions" },
      { era: "system6", claim: "System 6 had no disclosure triangle; it uses System 7's", status: "adapted", source: "clio.css", upstream: HIG92 + ", ch. 7 (outline triangles)" },
      { era: "platinum", claim: "13px with its shadow, closed and open (the Finder list view)", status: "measured", source: P9 + ", frames list and list-open; tooling/hig-art.py", upstream: "100% identical, both states" },
      { era: "drawingboard", claim: "The theme's 11px pictures, closed (340) and open (343, drawn through 16 bits)", status: "measured", source: THEME, upstream: "both found 1:1 in the Finder list view" },
    ] },
  { id: "list-view", name: "List view",
    summary: "The Finder's list view: column headers with the sorted column marked, and rows of names and details.",
    selectors: [".list-view", ".list-view th[aria-sort]", ".list-view th.sort-direction", ".list-view td.sorted"],
    tokens: ["--clio-list-view-row", "--clio-list-view-header-height", "--clio-list-view-sorted-bg"],
    accessibility: "A real <table>: give the sorted header aria-sort, keep scope on headers; the disclosure buttons need labels.",
    html: `<table class="list-view" style="width: 340px">
  <thead><tr><th aria-sort="ascending">Name</th><th>Date Modified</th><th class="sort-direction" aria-label="Sort direction"></th></tr></thead>
  <tbody>
    <tr><td class="sorted"><button class="disclosure" aria-expanded="false" aria-label="Show"></button> Developer</td><td colspan="2">Thu, Apr 14, 2022</td></tr>
    <tr><td class="sorted"><button class="disclosure" aria-expanded="false" aria-label="Show"></button> Games</td><td colspan="2">Thu, Apr 14, 2022</td></tr>
  </tbody>
</table>`,
    evidence: [
      { era: "system7", claim: "Headers in the small font on the window's white, the sorted one underlined, a double rule (black, white, black) below", status: "measured", source: S7 + ", frame list", upstream: "Finder, View by Name" },
      { era: "system6", claim: "System 6's list views have System 7's headers", status: "inferred", source: "clio.css", upstream: "not captured" },
      { era: "platinum", claim: "21px bevelled headers: #666 above, white light, #ccc, #888 shade, a #333 rule; the sorted header sunk dark (#111/#444 frame, #555/#aaa bevel, #888); #666 dividers; a sort-direction cell with its mark; rows #eee, the sorted column #ddd, 19px", status: "measured", source: P9 + ", frame list", upstream: "100% identical (labels left out: Geneva 10 is not among clio.css's fonts)" },
      { era: "drawingboard", claim: "#cdc6bd headers and a #9f9a94 sorted one, each line in its dominant colour; the theme draws these lines with pattern pens, not reproduced", status: "adapted", source: DB + ", frame list-open", upstream: "Finder list view" },
    ] },
  { id: "slider", name: "Slider",
    summary: "<input type=range> as the Appearance slider, with optional tick marks.",
    selectors: ["input[type=range]", "input[type=range].ticks"],
    tokens: ["--clio-slider-height", "--clio-art-slider-track", "--clio-art-slider-thumb", "--clio-slider-tick-count"],
    accessibility: "Native range input: label it, and say the value with aria-valuetext when the number alone means little.",
    html: `<label for="clio-rate">Key Repeat Rate</label>
<input id="clio-rate" type="range" class="ticks" min="0" max="4" value="2" style="width: 120px; --clio-slider-tick-count: 5">`,
    evidence: [
      { era: "platinum", claim: "A 7-row track (light, black, three grey, black, white), a 15x16 thumb pointing down, tick marks of white, black and #888", status: "measured", source: P9 + ", frame mouse (Mouse Tracking); tooling/hig-art.py", upstream: "track and thumb 100% identical; the held thumb was not captured" },
      { era: "drawingboard", claim: "The theme's 9x16 thumb (1106, through 16 bits) on a 1px pencil track (ppat 7024)", status: "measured", source: THEME + "; " + DB + ", frame keyboard", upstream: "thumb and track pen found 1:1; ticks not reproduced" },
      { era: "system7", claim: "System 7 had no slider in the Toolbox (each control panel drew its own); it uses Platinum's", status: "adapted", source: "clio.css", upstream: HIG92 + ", ch. 7: Controls Not Supported by the Toolbox" },
      { era: "system6", claim: "System 6 had none; it uses Platinum's", status: "adapted", source: "clio.css", upstream: "—" },
    ] },
  { id: "little-arrows", name: "Little arrows",
    summary: "The up and down pair beside a number or a clock field.",
    selectors: [".little-arrows", ".little-arrows > .up", ".little-arrows > .down", ".little-arrows[aria-disabled=true]"],
    tokens: ["--clio-little-arrows-width", "--clio-little-arrows-height", "--clio-art-little-arrows"],
    accessibility: "Two real buttons with labels; keep the field itself editable and announce the new value.",
    html: `<input type="text" value="32K" style="width: 60px" aria-label="Cache size">
<span class="little-arrows" role="group" aria-label="Cache size">
  <button class="up" aria-label="Increase"></button><button class="down" aria-label="Decrease"></button>
</span>`,
    evidence: [
      { era: "system7", claim: "15x25, an outlined rounded box with two outlined arrows", status: "measured", source: S7 + ", frame memory (Cache Size)", upstream: "held and dimmed states not on screen; they keep the normal picture" },
      { era: "platinum", claim: "13x23, normal while its field is edited and dimmed otherwise", status: "measured", source: P9 + ", frames date-time-edit and date-time", upstream: "both 100% identical; held states were under the pointer" },
      { era: "drawingboard", claim: "The theme's 13x21 pictures (350): normal, up held, down held, dimmed, through 16 bits", status: "measured", source: THEME, upstream: "dimmed found 1:1 in Date & Time" },
      { era: "system6", claim: "System 6 had none; it uses System 7's", status: "adapted", source: "clio.css", upstream: "—" },
    ] },
  { id: "bevel-button", name: "Bevel button",
    summary: "A square bevelled button for an icon or a short label: push button, toggle (aria-pressed) or menu (class menu).",
    selectors: [".bevel", ".bevel.menu", ".bevel[aria-pressed=true]", ".bevel:active"],
    tokens: ["--clio-art-bevel", "--clio-art-bevel-held", "--clio-bevel-slice"],
    accessibility: "A real button: label icon-only ones; a menu bevel needs aria-haspopup and aria-expanded.",
    html: `<button class="bevel menu" style="width: 36px; height: 27px" aria-label="Shortcuts" aria-haspopup="menu">☞</button>
<button class="bevel" aria-pressed="true" style="width: 36px; height: 27px">B</button>`,
    evidence: [
      { era: "platinum", claim: "#666/#333 outline, white light, #ccc face, #999/#777 shade, 3px corners; held dark; a 3x2 menu arrow 5px from the right and 4px up", status: "measured", source: P9 + ", frames nav and nav-bevel-held (Navigation Services)", upstream: "normal with its menu arrow 100% identical; the held frame's bottom row was under the opened menu and is the right edge's #444 (inferred)" },
      { era: "drawingboard", claim: "Drawn as the theme's push button (pens, corner pixels, hatch)", status: "inferred", source: "clio.css", upstream: "the Navigation Services bevel buttons were not matched pen for pen" },
      { era: "system7", claim: "Earlier eras had none; they use Platinum's", status: "adapted", source: "clio.css", upstream: HIG8 + " (Bevel Buttons)" },
      { era: "system6", claim: "System 6 had none; it uses Platinum's", status: "adapted", source: "clio.css", upstream: "—" },
    ] },
  { id: "chasing-arrows", name: "Chasing arrows",
    summary: "The asynchronous progress indicator: two arrows chasing round a circle.",
    selectors: [".chasing-arrows"],
    tokens: ["--clio-art-chasing-arrows", "--clio-chasing-arrows-frames"],
    accessibility: "Give it role=status and a label saying what is going on; it stands still under prefers-reduced-motion.",
    html: `<span class="chasing-arrows" role="status" aria-label="Looking for servers"></span> Looking for servers…`,
    evidence: [
      { era: "platinum", claim: "16x16, three frames read 0.7s apart (their order is not known); turned by a transform, not repainted", status: "measured", source: P9 + ", frames netb-0..2 (Network Browser)", upstream: "first frame 100% identical" },
      { era: "drawingboard", claim: "The theme's six frames (390)", status: "measured", source: THEME, upstream: "not on screen in the capture" },
      { era: "system7", claim: "Earlier eras showed a spinning watch cursor instead; they use Platinum's", status: "adapted", source: "clio.css", upstream: "—" },
      { era: "system6", claim: "System 6 had none; it uses Platinum's", status: "adapted", source: "clio.css", upstream: "—" },
    ] },
  { id: "help-button", name: "Help button",
    summary: "The square button with the help icon in a dialog's lower left.",
    selectors: [".help-button"],
    tokens: ["--clio-art-help-button"],
    accessibility: "aria-label=\"Help\"; it should open help about the dialog.",
    html: `<button class="help-button" aria-label="Help"></button>`,
    evidence: [
      { era: "platinum", claim: "21x20, a small bevel button with the help icon", status: "measured", source: P9 + ", frame keyboard", upstream: "100% identical" },
      { era: "drawingboard", claim: "As the Keyboard control panel draws it", status: "measured", source: DB + ", frame keyboard", upstream: "the held state was not captured" },
      { era: "system7", claim: "Earlier eras used a Help push button; they use Platinum's", status: "adapted", source: "clio.css", upstream: HIG8 + " (Help Button Layout)" },
      { era: "system6", claim: "System 6 had none; it uses Platinum's", status: "adapted", source: "clio.css", upstream: "—" },
    ] },
  { id: "image-well", name: "Image well",
    summary: "A sunken well holding a picture or an icon.",
    selectors: [".image-well"],
    tokens: ["--clio-image-well-bg", "--clio-field-border", "--clio-field-shadow"],
    accessibility: "Describe the picture with alt text; a well that accepts drops needs a keyboard alternative.",
    html: `<div class="image-well" style="width: 48px; height: 48px">◆</div>`,
    evidence: [
      { era: "both", claim: "Drawn like the era's text field frame round a white face", status: "inferred", source: "clio.css", upstream: "no image well was on the captured screens (the Appearance desktop preview is a picture, not a well)" },
    ] },
  { id: "balloon", name: "Help balloon",
    summary: "Balloon Help: a white balloon with a tail pointing at what it describes.",
    selectors: [".balloon"],
    tokens: ["--clio-art-balloon", "--clio-art-balloon-tail"],
    accessibility: "role=tooltip, referenced by aria-describedby from the thing it explains; show it on focus as well as hover.",
    html: `<div class="balloon" role="tooltip" style="margin-top: 24px">Hard disk<br><br>A hard disk is a device that stores large numbers of files and folders.</div>`,
    evidence: [
      { era: "platinum", claim: "A rounded outline with a 2px drop on the right and below (10px corners), a tail rising from the top edge near the right", status: "measured", source: P9 + ", frame balloon (Infinite HD)", upstream: "top and bottom corners 100% identical; the tail's tip was under the pointer (inferred)" },
      { era: "system7", claim: "The same balloon in System 7 and Drawing Board", status: "measured", source: S7 + ", frame balloon (Trash); " + DB + ", frame balloon", upstream: "compared by eye, not pixel by pixel" },
      { era: "system6", claim: "System 6 had no Balloon Help; it uses the later balloon", status: "adapted", source: "clio.css", upstream: HIG92 + ", ch. 11" },
    ] },
];
