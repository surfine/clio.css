"""Clio Sans NX: NeXTSTEP's Helvetica stand-in for machines without Helvetica.

NeXTSTEP 3 sets its chrome in Helvetica 12 (menus, buttons, fields) and Helvetica
Bold 12 (window and menu titles). Helvetica is Adobe's and Apple's and is never
shipped: clio.nextstep.css names it locally first. Elsewhere this face takes over.
It is Liberation Sans 2.x (SIL OFL 1.1), whose advance widths are Arial's, which
are Helvetica's, so a label keeps the width NeXTSTEP gave it (D3: "an OFL face
fitted to the measured advance widths and x-height"). The OFL reserves the name
"Liberation" for the unmodified fonts, so the subset is renamed.

  python3 tooling/nx-font.py LiberationSans-Regular.ttf LiberationSans-Bold.ttf

Fitted to NeXTSTEP's screen: Display PostScript set Helvetica 12 with each glyph's advance
rounded to whole pixels and no kerning (measured: menu and title text in NeXTStep 3.0's
Workspace, .notes/logs/nx-text-*.tsv), so every advance here is rounded to a whole pixel at
12px and kerning is left out. At other sizes the face is Liberation Sans's shapes with those
advances.

Needs fontTools and brotli. Writes fonts/ClioSansNX.woff2 and
fonts/ClioSansNX-Bold.woff2 (Latin-1 and the punctuation the chrome uses).
"""
import math
import sys
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
UNICODES = list(range(0x20, 0x7F)) + list(range(0xA0, 0x100)) + [
    0x2013, 0x2014, 0x2018, 0x2019, 0x201A, 0x201C, 0x201D, 0x201E, 0x2022, 0x2026, 0x2039, 0x203A, 0x20AC, 0x2122,
]


def build(src, out, style):
    font = TTFont(src)
    licence = font["name"].getDebugName(13) or ""
    if "Open Font License" not in licence:
        sys.exit(f"{src}: not an OFL Liberation Sans (licence field: {licence[:60]!r}); 1.x is GPL, use 2.x")
    opts = subset.Options()
    opts.flavor = "woff2"
    opts.layout_features = []   # NeXT's screen fonts set text unkerned, without ligatures
    opts.name_IDs = ["*"]
    opts.hinting = False
    opts.desubroutinize = True
    sub = subset.Subsetter(opts)
    sub.populate(unicodes=UNICODES)
    sub.subset(font)
    upm = font["head"].unitsPerEm
    hmtx = font["hmtx"]
    for g, (adv, lsb) in list(hmtx.metrics.items()):
        px = math.floor(adv * 12 / upm + 0.5)   # the screen font's whole-pixel advance at 12px
        hmtx.metrics[g] = (round(px * upm / 12), lsb)
    if "kern" in font:
        del font["kern"]
    family, full = "Clio Sans NX", "Clio Sans NX" + ("" if style == "Regular" else " " + style)
    ps = "ClioSansNX-" + style
    for rec in font["name"].names:
        if rec.nameID in (1, 16):
            rec.string = family
        elif rec.nameID in (2, 17):
            rec.string = style
        elif rec.nameID == 4:
            rec.string = full
        elif rec.nameID == 6:
            rec.string = ps
        elif rec.nameID == 3:
            rec.string = f"clio.css: {ps} (from Liberation Sans 2.x)"
    font.save(out)
    print(f"{out.relative_to(ROOT)}  {out.stat().st_size} B")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    build(sys.argv[1], ROOT / "fonts/ClioSansNX.woff2", "Regular")
    build(sys.argv[2], ROOT / "fonts/ClioSansNX-Bold.woff2", "Bold")
