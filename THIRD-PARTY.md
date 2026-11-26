# Third-party material

clio.css ships no Apple screenshots, icons, logos or font files. Screenshots used to
measure values stay evidence (git-ignored `.fidelity/`, or AI System 6) and are never
distributed. The following third-party material is included, each under its own licence.

## Control art reconstructed from Apple's interfaces

Some small control parts are pixel reconstructions, not original designs, and are not
presented as such:

- System 7 scroll arrows, grow box and grip (`--clio-art-s7-*`): redrawn as SVG by
  `tooling/s7-art.py` from System 7.5.3 running in an emulator.
- Mac OS 9 check mark, radio buttons and Control Strip parts (end cap, scroll arrows, menu
  triangle, tab and folded tab) (`--clio-art-p9-*`): re-encoded as palette PNGs by
  `tooling/p9-art.py` from Mac OS 9.0 running in an emulator.
- Drawing Board art (`dist/art/drawingboard/`, `--clio-art-db-*`): the `pxm#` pictures
  (window, alert and modal frames, menu bar, boxes, check boxes, radio buttons, scroll
  arrows and scroll box, pop-up arrow, hatched button corner, grow box, tab ends, menu
  underlines) and `ppat` patterns (window, tab and menu papers, and the pattern pens the
  theme draws its pencil lines with) of Apple's Mac OS 8.5b6 "Drawing Board" theme,
  re-encoded as palette PNGs by `tooling/db-art.py` and `tooling/db-pens.py`, each matched
  1:1 against the theme running in an emulator. A few corner pixels where the pens meet are
  read from that screen by `tooling/db-pens.py`. The theme file is not included. The
  textures and frame illustrations ship since 0.9.0, at the owner's decision.

They are included to document the look of these interfaces at the size of a single
control. If that does not suit your use, override the `--clio-art-s7-*`,
`--clio-art-p9-*` and `--clio-art-db-*` custom properties with your own art, or replace
the files in `dist/art/drawingboard/`.

## Fonts

### Clio Sans '84, Clio Text '84 and Clio Sans '97 (`dist/fonts/ClioSans84.woff2`, `ClioText84.woff2`, `ClioText84-9.woff2`, `ClioSans97.woff2`, `ClioSans97Title.woff2`, `ClioSans97Exact.woff2`, `ClioSans97TitleExact.woff2`, `ClioSans97Display.woff2`)

Pixel reconstructions of Chicago 12 (Clio Sans '84), Geneva 12 (Clio Text '84) and
Geneva 9 (Clio Text '84 9), Macintosh system fonts designed by Susan Kare for Apple
Computer in 1984, and of Charcoal 12 (Clio Sans '97), the Mac OS 8 system font
designed by David Berlow of the Font Bureau for Apple in 1997. clio.css read every
glyph from System 6.0.8 or Mac OS 9.0 running in an emulator (`npm run capture:keycaps`),
wrote the bitmaps to `fonts-src/*.txt` and built the fonts from them
(`npm run build:font`). Clio Sans '97 Display is Charcoal's outlines traced from
Mac OS 9.0 drawing every character at 72 points (`npm run capture:charcoal-large`,
`tooling/trace-outline.py`). The Exact variants carry the same glyphs with each
antialiasing level in its own palette entry. No Apple font file was copied.

They are not original designs and are not presented as such: the letterforms are
Apple's. They ship under clio.css's MIT licence on the basis that, in the United States, typeface
designs are not protected by copyright (37 CFR 202.1(e)); only font software is, and
these font files are new software. Some countries protect typeface designs separately; if
that matters for your use, override `--clio-font-chrome`, `--clio-font-text` and
`--clio-font-small` with your own stack. "Chicago", "Geneva" and "Charcoal" are trademarks of Apple
Inc., which is why the fonts have other names.

### Other fonts

| File | Font | Author | Licence |
| --- | --- | --- | --- |
| `dist/fonts/ChicagoFLF.woff2`, `.woff` | ChicagoFLF | Robin Casady | Public domain: the author's own statement and Font Library's listing (https://fontlibrary.org/font/chicagoflf); some download sites say "personal use", which is not the author's term. File as distributed by system.css |
| `dist/fonts/Asap-Variable.woff2` | Asap (variable, wdth + wght) | Omnibus-Type | SIL Open Font License 1.1, full text in `dist/fonts/OFL-Asap.txt`; upstream github.com/Omnibus-Type/Asap at commit 2de32f20, SHA-256 3f230328…498f |

Asap is a fallback stand-in for Charcoal and is not presented as an Apple font.

| `dist/fonts/ClioSansNX.woff2`, `dist/fonts/ClioSansNX-Bold.woff2` (clio.nextstep.css only) | Clio Sans NX: Liberation Sans 2.1.5 Regular and 2.00.5 Bold, subset to Latin-1, its advances rounded to whole pixels at 12px and its kerning left out, and renamed, by `tooling/nx-font.py` | Red Hat, Inc. (digitised data © 2010 Google Corporation) | SIL Open Font License 1.1, full text in `dist/fonts/OFL-Liberation.txt`; "Liberation" is a Reserved Font Name, so the modified subset carries another name |

Clio Sans NX is a fallback stand-in for Helvetica on machines that do not have it; it is not
presented as Helvetica, which clio.nextstep.css names only as a local font.

### Fusion Pixel Font (`dist/fonts/FusionPixel12-TC.woff2`, `-SC`, `-JA`, `-KO`)

Fusion Pixel Font 12px proportional, release 2026.11.10, © 2022 TakWolf
(https://github.com/TakWolf/fusion-pixel-font), SIL Open Font License 1.1 with no Reserved
Font Name. It merges glyphs from Ark Pixel Font (© 2021 TakWolf, OFL-1.1), Cubic 11 (with
JF Dot M+H 12 and the M+ bitmap fonts, free software) and Galmuri (© 2019–2025 Lee Minseo,
OFL-1.1). The licences, as the release ships them, are in `dist/fonts/OFL-FusionPixel.txt`.
The build code of the upstream project is MIT; clio.css uses only its released fonts.

clio.css ships Modified Versions under the same licence: `tooling/cjk-fonts.py` takes the
release's `otf.woff2` zip (SHA-256 4a0bab32…b075), keeps per language the characters of the
period Mac's interface font (Big5 for `zh_tw`, GB 2312 for `zh_hans`, JIS X 0208 for `ja`,
KS X 1001 for `ko`, plus ASCII) and sets the vertical metrics to Clio's own pixel fonts'
(ascent 11px, descent 3px). Glyph outlines are unchanged; the names are the upstream ones.
They stand in for Apple's Taipei, Beijing, Osaka and Seoul, which clio.css does not ship or
extract, and are not presented as Apple fonts.

### Virtue (`dist/fonts/Virtue.woff2`)

Virtue 3.2.1, © 1997–1999 Marty P. Pfeiffer, [Scooter Graphics](https://www.scootergraphics.com/)
(https://www.scootergraphics.com/virtue/). A TrueType reworking of Charcoal, used when a page
sets `data-clio-font="virtue"`. The file is Virtue 3.2.1 for the Mac (the `sfnt` resource of
`virtue321tt.sit`) wrapped as WOFF2 by `tooling/virtue-woff2.py`, which checks that
every one of its 16 tables, copyright notice included, is byte for byte the original.

Virtue's own licence (the `eul.htm` in its download) does not allow redistribution or
embedding. clio.css ships it by the author's written permission, which reads in part:
"I'm happy to grant you permission to convert Virtue 3.2.1 into WOFF2 format and distribute
it as part of clio.css, including through GitHub, npm and the public CDNs you mentioned,
provided that the font itself remains unchanged. Please retain the original copyright notice
and include a credit to Scooter Graphics with a link to scootergraphics.com in your
documentation and third-party notices. This permission applies to the use of Virtue in
clio.css under the conditions described in your letter. All other rights remain reserved."
The permission covers clio.css only: using Virtue outside clio.css, or changing the file,
needs the author's own licence.

## Art from system.css (MIT)

The System 6 check-box X, radio ring, pressed radio ring and radio dot are
re-encoded from `icon/checkmark.svg`, `icon/radio-border.svg`,
`icon/radio-border-focused.svg` and `icon/radio-dot.svg` of
https://github.com/sakofchit/system.css at commit c95b9542.


Copyright (c) 2022 Sakun Acharige

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
## Art from classic-stylesheets (MIT)

Up to 0.7.0 the Platinum pop-up arrow, check mark and submenu arrow were
re-encoded from `macos9/dropdown.svg`, `checkmark.svg` and `menu-right.svg` of
https://github.com/nielssp/classic-stylesheets at commit 9ebd2d84, and the tab
drawings followed its `tab*.svg`. Since 0.8.0 the arrows and check mark are
redrawn from Mac OS 9.0 (`tooling/p9-art.py`) and the tabs from measured geometry
(`tooling/tab-art.py`). AI System 6 adapted Platinum control relationships from the
same project, so the notice stays.

MIT License

Copyright (c) 2022 Niels Sonnich Poulsen (http://nielssp.dk)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
