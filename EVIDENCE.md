# Evidence

Generated from `components/index.mjs` by `npm run build`; edit there.

Every value in clio.css 0.1.0 has a row here. Sources are paths in the AI System 6 development tree at commit `b75cd4ed` (public mirror: https://github.com/surfine/AI-System-6; some evidence folders such as `internal/` are private). The images measurements were taken from are evidence only; clio.css never ships them.

| Status | Meaning | Rows |
| --- | --- | ---: |
| Measured | read from real pixels of the era | 29 |
| Inferred | reasoned from documentation or behaviour, not measured | 26 |
| Adapted | a deliberate departure for the web (touch, focus, contrast) | 7 |
| Third-party | art or font from a named, licensed project | 7 |

Pixel check: `npm run fidelity` renders the Platinum specimens and compares them with AI System 6's GUIdebook Mac OS 9.0 reference crops (it needs a local AI System 6 checkout; see the script).

| Component | Era | Value | Status | Source — upstream evidence |
| --- | --- | --- | --- | --- |
| Window | System 6 | Title bar: a 17px box below a 1px inset; 2px paper, a 12px row of six 1px ink stripes on a 2px period, 2px paper, a 1px rule | Measured | `apps/desktop/styles/00-foundation.css:906` — System 6.0.8 running in an emulator, read at exact 2x pixels |
| Window | System 6 | Close and zoom boxes are 11px squares, 7px in from each end, with 3px of paper cut out of the stripes around them | Measured | `apps/desktop/styles/00-foundation.css:906` — same capture |
| Window | System 6 | Zoom box: an inner square of 7 of the frame's 11 pixels sharing its top-left corner | Measured | `apps/desktop/styles/10-windows.css:1059` — System 6 zoom box, 7:11 |
| Window | System 6 | An inactive window draws a plain white title strip with its name; no stripes, close box or zoom box | Measured | `apps/desktop/styles/00-foundation.css:951` — observed behaviour of System 6 |
| Window | System 6 | Pressed close box shows a starburst | Inferred | `apps/desktop/styles/10-windows.css (close-box ::before/::after)` — System 6 close-box tracking; pixels redrawn for clio.css |
| Window | System 6 | The window frame has a 1px ink drop shadow on the right and bottom | Inferred | `not in AI System 6 (it sets no window shadow)` — Inside Macintosh, Window Manager: documentProc frame; to be measured |
| Window | System 6 | The details bar closes with two 1px rules | Inferred | `not measured` — System 6 Finder window header |
| Window | Platinum | Frame: 1px black line, a raised 4px strip (white top/left, #999 bottom/right), the black content line; 2px 5px 5px padding | Measured | `apps/desktop/styles/65-appearance-themes.css:1744 (P14)` — Mac OS 8/9 window captures 16 and 21 |
| Window | Platinum | Title bar 19px: #ccc, six white/#777 ridge pairs from row 1, #999 shadow row, black rule; #ccc covers behind the boxes | Measured | `apps/desktop/styles/65-appearance-themes.css:104` — GUIdebook Mac OS 9.0 Appearance window (Theme Lab specimen active-titlebar) |
| Window | Platinum | Title in bold Charcoal; on other systems Asap at width 123 shifted (-1px, -1px), the metrics the title bar was measured with | Measured | `apps/desktop/styles/65-appearance-themes.css:1803` — GUIdebook Mac OS 9.0 Appearance window |
| Window | Platinum | Boxes: 11px, #222 frame, #999 to white gradient, #888 bevel above-left and white below-right; pressed #444 to #bbb | Measured | `apps/desktop/styles/65-appearance-themes.css:1820` — GUIdebook Mac OS 9.0 captures |
| Window | Platinum | Zoom mark: a six-pixel lower-left corner; WindowShade mark: two nine-pixel rules at y=4 and y=6 | Measured | `apps/desktop/styles/65-platinum-utility.css:725, :738` — GUIdebook Mac OS 9, 1x pixels |
| Window | Platinum | Background window: #555 frame and drop, flat controls, #777 title, boxes erased | Measured | `apps/desktop/styles/65-appearance-themes.css:1757 (N1, P26)` — Mac OS 9 native capture 53; GUIdebook active/inactive |
| Menu bar and menus | System 6 | Menu bar 20px with a 1px ink rule; selected title inverts | Inferred | `docs/design/CLASSIC_PLATINUM_FIDELITY.md:87` — historical reference ~20px; not yet measured from a capture |
| Menu bar and menus | System 6 | Menu: paper, 1px ink frame, 1px ink drop shadow; 16px rows; the highlighted row inverts | Inferred | `apps/desktop/styles/00-foundation.css:1094` — System 6 menus; Chicago 12 line spacing |
| Menu bar and menus | System 6 | Separator: a dotted grey rule through a full-height row | Inferred | `not measured` — System 6 menus |
| Menu bar and menus | Platinum | Menu bar: #ddd, white top line, #999 bottom line, 1px black rule, 20px; open title #333399 with #6666cc/#000088 lines | Measured | `apps/desktop/styles/65-appearance-themes.css:298, :45` — Mac OS 9 native menu bar captures 02/04 |
| Menu bar and menus | Platinum | Menu: no top rule, white/#999 inner bevel, #222 1px drop; 16px rows at weight 600; highlight #333399 with #6666cc/#000088 side columns | Measured | `apps/desktop/styles/65-appearance-themes.css:912 (P21), :917 (P24)` — GUIdebook Mac OS 9.0 Apple menu (Theme Lab specimen apple-menu) |
| Menu bar and menus | Platinum | Separator: #888 over white, in an 8px row | Inferred | `apps/desktop/styles/65-appearance-themes.css (separator #888/white)` — the line pair is measured; the 8px row height is not |
| Menu bar and menus | Platinum | Check mark and submenu arrow art | Third-party | `classic-stylesheets macos9/checkmark.svg, menu-right.svg (MIT)` — nielssp/classic-stylesheets @9ebd2d8 |
| Push button | System 6 | 1px ink round rectangle, paper face, Chicago 12; pressed inverts to ink with paper text | Inferred | `apps/desktop/styles/10-windows.css:3588` — AI System 6 Theme Lab default-ok specimen (authored, not a capture) |
| Push button | System 6 | Default button: a 1px gap then a 3px ring | Inferred | `apps/desktop/styles/00-foundation.css:79` — Inside Macintosh, Dialog Manager: PenSize(3,3), InsetRect(-4,-4), FrameRoundRect(16,16) |
| Push button | Both eras | Hover never changes a push button; pressed only on pointer-down, Space or Enter | Inferred | `docs/design/CLASSIC_PLATINUM_FIDELITY.md:210` — a 1987–1999 Mac had no hover state |
| Push button | System 6 | Keyboard focus: a 1px dotted frame 2px out | Adapted | `apps/desktop/styles/00-foundation.css:519` — System 6 had no button focus; a dotted frame cannot be read as the default ring |
| Push button | Platinum | #ddd face, 1px black border, 3px corners, bevel white/#ddd over #777/#aaa | Measured | `apps/desktop/styles/65-appearance-themes.css:236` — GUIdebook Mac OS 9.0 About dialog (Theme Lab specimen default-ok) |
| Push button | Platinum | Pressed: #666 face, white text, #444/#555 top-left over #888/#777 bottom-right | Measured | `apps/desktop/styles/65-appearance-themes.css:933 (P29)` — Infinite Mac Mac OS 9.0 capture |
| Push button | Platinum | Default ring: 1px black, a #aaa band with #ddd/#777 edges, 1px gap | Measured | `apps/desktop/styles/65-platinum-utility.css:773` — GUIdebook Mac OS 9.0 (default-ok specimen) |
| Push button | Platinum | Disabled: #888 border, flat #ddd, #777 text; the default ring goes #888 | Measured | `apps/desktop/styles/65-appearance-themes.css (N5)` — GUIdebook Open dialog Eject button (button-disabled specimen) |
| Check box | System 6 | A 12px box; checked draws an X from corner to corner | Inferred | `apps/desktop/styles/00-foundation.css:965` — System 6 check box; AI System 6 uses 13px, clio.css 12px to match the radio |
| Check box | System 6 | X art | Third-party | `apps/desktop/assets/themes/classic/controls/checkmark.svg` — system.css icon/checkmark.svg (MIT, Sakun Acharige) |
| Check box | Platinum | 12px #ddd well, 1px black frame, white top-left and #888 bottom-right bevel | Measured | `apps/desktop/styles/65-appearance-themes.css:897 (P18)` — GUIdebook Mac OS 9.0 Appearance Options tab (checkbox specimens) |
| Check box | Platinum | Check mark art | Third-party | `classic-stylesheets macos9/checkmark.svg (MIT)` — nielssp/classic-stylesheets @9ebd2d8 |
| Radio button | System 6 | 12px ring and 6px dot art | Third-party | `apps/desktop/assets/themes/classic/controls/radio-*.svg` — system.css icon/radio-border.svg, radio-dot.svg (MIT, Sakun Acharige) |
| Radio button | Platinum | Radio drawn with CSS gradients: black ring, white to #888 well, 6px black dot | Adapted | `apps/desktop/styles/65-appearance-themes.css:291` — AI System 6 later replaced this with art cut from a capture (P19); clio.css ships no cut art |
| Text field | System 6 | 1px ink frame, white, Geneva 12 | Inferred | `apps/desktop/styles/00-foundation.css:189` — System 6 dialog edit text |
| Text field | Platinum | White field, 1px black frame, #888 shadow above-left and white etch below-right | Measured | `apps/desktop/styles/65-appearance-themes.css:935 (P30)` — Infinite Mac Mac OS 9.0 capture |
| Text field | Platinum | Focus: a 2px #6666cc ring | Measured | `apps/desktop/styles/65-platinum-utility.css:38` — Mac OS 9 capture platinum-native/10b-fonts-tab |
| Pop-up menu | System 6 | A box with a 1px drop shadow | Inferred | `not measured` — System 6 pop-up menu CDEF |
| Pop-up menu | System 6 | The down triangle | Adapted | `drawn for clio.css` — a System 7 convention, kept so the control reads as a menu |
| Pop-up menu | Platinum | #ddd, 3px corners, white/#aaa bevel, bold label, a separate bevelled arrow part with the 7x10 arrow | Measured | `apps/desktop/styles/65-appearance-themes.css:1916 (P31)` — GUIdebook Mac OS 9.0 (popup-normal specimen), native 09b |
| Pop-up menu | Platinum | The arrow part is drawn with background layers, approximating the measured bevel | Inferred | `clio.css` — select has no ::after in CSS |
| Pop-up menu | Platinum | Arrow art | Third-party | `classic-stylesheets macos9/dropdown.svg (MIT)` — nielssp/classic-stylesheets @9ebd2d8 |
| List box | System 6 | White list, 1px ink frame, 16px rows, selection inverts | Inferred | `not measured` — System 6 Standard File dialog |
| List box | Platinum | Selection is lavender #ccccff with black text | Measured | `apps/desktop/styles/65-appearance-themes.css:128` — GUIdebook Mac OS 9.0 Open dialog (open-list-scrollbar specimen) |
| List box | Platinum | Rows carry no divider | Measured | `apps/desktop/styles/65-appearance-themes.css:860 (P10)` — Mac OS 9 native list capture 21 |
| Scroll bar | System 6 | A 16px lane | Inferred | `apps/desktop/styles/00-foundation.css:1173` — System 6 document window frame |
| Scroll bar | System 6 | 50% grey lane pattern | Inferred | `apps/desktop/styles/00-foundation.css:1177` — drawn as a 1px checker here; AI System 6 uses a 2px cell |
| Scroll bar | System 6 | Hollow arrow art | Inferred | `drawn for clio.css` — System 6 scroll arrows; to be measured |
| Scroll bar | Both eras | The scroll box grows with the visible fraction instead of a fixed 16px square | Adapted | `clio.css` — browsers size ::-webkit-scrollbar-thumb themselves |
| Scroll bar | Platinum | Lane #aaa with a double bevel; lavender #9999ff scroll box with #ccf/#66c bevel and grip ridges; #ddd arrow boxes with stepped 2/4/6/8 arrows | Measured | `apps/desktop/styles/65-appearance-themes.css:336 (P16), :351 (P17), :364 (P27)` — Mac OS 9 native capture 16; GUIdebook Open dialog |
| Dialogs and alerts | System 6 | Modal frame: 1px ink, 1px paper gap, 2px ink | Inferred | `apps/desktop/styles/84-clio-write.css:210` — AI System 6 has two recipes (this one and 00-foundation.css .system-modal); neither is measured |
| Dialogs and alerts | System 6 | Plain box: 1px ink frame and a 2px drop shadow | Inferred | `not measured` — altDBoxProc |
| Dialogs and alerts | Both eras | The alert icon is drawn here, not Apple's | Adapted | `clio.css` — no Apple icons are shipped |
| Dialogs and alerts | Platinum | 1px black frame over #ddd, inner bevel of three white steps inside #555/#999/#aaa, 1px black drop | Measured | `apps/desktop/styles/65-appearance-themes.css:840 (P06)` — GUIdebook Mac OS 9.0 About application (about-alert specimen) |
| Group box | System 6 | 1px ink frame with the legend on paper | Inferred | `not measured` — System 6 control panels |
| Group box | Platinum | Etched: #888 line with a white line inside and below | Measured | `apps/desktop/styles/65-appearance-themes.css:909 (P20)` — Mac OS 9 native group box |
| Progress bar | System 6 | 1px ink frame, ink fill | Inferred | `not measured` — System 6 Finder copy progress |
| Progress bar | Platinum | Barber-pole fill: ten 1px hard stops from #333399 through #eee to #000055 | Measured | `apps/desktop/styles/65-appearance-themes.css:937 (P32)` — Mac OS 9 native progress bar |
| Progress bar | Platinum | #bbb track with white/#aaa outer and #888/#ddd inner bevel | Inferred | `apps/desktop/styles/65-appearance-themes.css:592` — AI System 6 token, not tagged as measured |
| Tabs | System 6 | Boxed labels that join the panel | Adapted | `clio.css` — System 6 had no tab control |
| Tabs | Platinum | Tab art: sloped caps, #ccc tabs, the front tab #eee and 2px taller | Third-party | `classic-stylesheets macos9/tab*.svg (MIT)` — nielssp/classic-stylesheets @9ebd2d8; AI System 6 measured a 21-row tab (P01, 65-appearance-themes.css:742) |
| Desktop and icons | System 6 | A 50% grey desktop pattern | Inferred | `apps/desktop/styles/00-foundation.css:224` — System 6.0.8 default desktop; AI System 6 draws an 8px stipple |
| Desktop and icons | System 6 | White name tag; a selected icon inverts | Inferred | `apps/desktop/styles/00-foundation.css (desktop-label tokens)` — System 6 Finder |
| Desktop and icons | Platinum | 70% white tag with no edge; selected: black tag, white name, artwork darkened | Measured | `apps/desktop/styles/65-appearance-themes.css:882 (P12, P13)` — Mac OS 9 native capture 02 |
| Desktop and icons | Platinum | Desktop colour #4a71ab | Inferred | `apps/desktop/styles/65-appearance-themes.css:85` — base colour of AI System 6's azul tile, generated from a 512 Pixels capture; the tile is not shipped |
| Type and tokens | System 6 | ChicagoFLF, a public-domain revival of Chicago, for chrome | Third-party | `vendor/system.css-reference/fonts/ChicagoFLF.woff2` — Robin Casady's ChicagoFLF (public domain), as shipped by system.css |
| Type and tokens | Platinum | Charcoal when installed; otherwise Asap (OFL) at width 113 for text and 123 for titles, weights 400/600/700 | Measured | `apps/desktop/assets/fonts/platinum/README.md; 65-appearance-themes.css:25` — Asap matched to a measured Charcoal sample's x-height and advance width |
| Type and tokens | Platinum | Palette #fff #ddd #ccc #999 #777 #000, accent #333399, lavender #ccccff | Measured | `tooling/classic-platinum-fidelity-contract.json (platinum.palette)` — Mac OS 9 captures |
| Type and tokens | System 6 | Disabled text #696969 instead of a 50% dither | Adapted | `apps/desktop/styles/00-foundation.css (shade-dark)` — 5.6:1 on white; a dither blurs under browser scaling |
