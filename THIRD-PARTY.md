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
- Drawing Board close, zoom and collapse boxes, check boxes, radio buttons, scroll arrows,
  pop-up arrow, hatched button corner, grow box, tab ends and menu underlines
  (`--clio-art-db-*`): re-encoded as palette PNGs by `tooling/db-art.py` from the
  `pxm#` pixmaps of Apple's Mac OS 8.5b6 "Drawing Board" theme, each matched 1:1 against
  the theme running in an emulator. The theme file is not included; the large paper
  and sketch textures and the window-frame illustrations are not reproduced.

They are included to document the look of these interfaces at the size of a single
control. If that does not suit your use, override the `--clio-art-s7-*`,
`--clio-art-p9-*` and `--clio-art-db-*` custom properties with your own art.

## Fonts

### Clio Sans '84, Clio Text '84 and Clio Sans '97 (`dist/fonts/ClioSans84.woff2`, `ClioText84.woff2`, `ClioText84-9.woff2`, `ClioSans97.woff2`)

Pixel reconstructions of Chicago 12 (Clio Sans '84), Geneva 12 (Clio Text '84) and
Geneva 9 (Clio Text '84 9), Macintosh system fonts designed by Susan Kare for Apple
Computer in 1984, and of Charcoal 12 (Clio Sans '97), the Mac OS 8 system font
designed by David Berlow of the Font Bureau for Apple in 1997. clio.css read every
glyph from System 6.0.8 or Mac OS 9.0 running in an emulator (`npm run capture:keycaps`),
wrote the bitmaps to `fonts-src/*.txt` and built the fonts from them
(`npm run build:font`). No Apple font file was copied.

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

Asap is a fallback stand-in for Charcoal and is not presented as an Apple font. Virtue
(Scooter Graphics, 1997), another Charcoal look-alike, is not included: its page offers it
free with a copyright notice and states no redistribution terms.

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

The Platinum pop-up arrow (and its disabled colour), check mark, submenu
arrow and the three tab drawings are re-encoded from `macos9/dropdown.svg`,
`checkmark.svg`, `menu-right.svg`, `tab.svg`, `tab-active.svg` and
`tab-selected.svg` of https://github.com/nielssp/classic-stylesheets at commit
9ebd2d84. AI System 6 also adapted Platinum control relationships from the
same project.

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
