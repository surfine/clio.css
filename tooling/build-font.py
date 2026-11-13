"""Build fonts/ClioSans84.woff2 from fonts-src/clio-sans-84.txt.

Each pixel becomes a 100x100-unit square on a 1200-unit em, so at
font-size: 12px (and whole multiples) every square lands on one device pixel
and the text renders as the original bitmap. Needs fontTools and brotli:
  python3 -m venv .venv && .venv/bin/pip install fonttools brotli
  .venv/bin/python tooling/build-font.py
"""
import os
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen

ROOT = os.path.join(os.path.dirname(__file__), '..')
SRC = os.path.join(ROOT, 'fonts-src', 'clio-sans-84.txt')
OUT = os.path.join(ROOT, 'fonts', 'ClioSans84.woff2')
PX, UPM, FAMILY = 100, 1200, "Clio Sans '84"

lines = open(SRC).read().split('\n')
metrics = next(l for l in lines if l.startswith('metrics'))
m = dict(kv.split('=') for kv in metrics.split()[1:])
ASC, DESC = int(m['ascent']), int(m['descent'])

glyphs, i = {}, 0
while i < len(lines):
    l = lines[i]
    if l.startswith('U+'):
        parts = l.split()
        cp, adv, x0, top = int(parts[0][2:], 16), int(parts[1]), int(parts[2]), int(parts[3])
        rows, i = [], i + 1
        while i < len(lines) and lines[i] and not lines[i].startswith('U+'):
            rows.append(lines[i]); i += 1
        glyphs[cp] = (adv, x0, top, rows)
    else:
        i += 1

def name(cp): return 'space' if cp == 0x20 else 'uni%04X' % cp

order = ['.notdef'] + [name(cp) for cp in sorted(glyphs)]
cmap = {cp: name(cp) for cp in glyphs}
cmap[0xA0] = 'space'

def draw(adv, x0, top, rows):
    pen = TTGlyphPen(None)
    for r, row in enumerate(rows):
        y = top - r                      # pixel row y spans [y, y+1) above the baseline
        x = 0
        while x < len(row):
            if row[x] != '#': x += 1; continue
            n = 1
            while x + n < len(row) and row[x + n] == '#': n += 1
            l, rgt = (x0 + x) * PX, (x0 + x + n) * PX
            b, t = y * PX, (y + 1) * PX
            pen.moveTo((l, b)); pen.lineTo((l, t)); pen.lineTo((rgt, t)); pen.lineTo((rgt, b)); pen.closePath()
            x += n
    return pen.glyph()

notdef = TTGlyphPen(None)
for (l, b, r, t) in ((100, 0, 600, 100), (100, 800, 600, 900), (100, 0, 200, 900), (500, 0, 600, 900)):
    notdef.moveTo((l, b)); notdef.lineTo((l, t)); notdef.lineTo((r, t)); notdef.lineTo((r, b)); notdef.closePath()
glyf = {'.notdef': notdef.glyph()}
hmtx = {'.notdef': (700, 100)}
for cp, (adv, x0, top, rows) in glyphs.items():
    g = draw(adv, x0, top, rows)
    glyf[name(cp)] = g
    hmtx[name(cp)] = (adv * PX, (x0 * PX) if rows else 0)

fb = FontBuilder(UPM, isTTF=True)
fb.setupGlyphOrder(order)
fb.setupCharacterMap(cmap)
fb.setupGlyf(glyf)
fb.setupHorizontalMetrics(hmtx)
fb.setupHorizontalHeader(ascent=ASC * PX, descent=-DESC * PX, lineGap=0)
fb.setupNameTable({
    'familyName': FAMILY,
    'styleName': 'Regular',
    'uniqueFontIdentifier': "ClioSans84-Regular;clio.css",
    'fullName': FAMILY,
    'psName': 'ClioSans84-Regular',
    'version': 'Version 1.000',
    'copyright': 'Pixel reconstruction (c) 2026 clio.css contributors. Measured from Chicago 12 as drawn by System 6.0.8; the original bitmap design is by Susan Kare for Apple Computer, 1984.',
    'licenseDescription': 'Distributed with clio.css under the MIT licence. Not affiliated with or endorsed by Apple Inc.; Chicago is a trademark of Apple Inc.',
    'licenseInfoURL': 'https://github.com/surfine/clio.css/blob/main/THIRD-PARTY.md',
})
fb.setupOS2(version=4, sTypoAscender=ASC * PX, sTypoDescender=-DESC * PX, sTypoLineGap=0,
            usWinAscent=ASC * PX, usWinDescent=DESC * PX, fsSelection=0x40 | 0x80,
            achVendID='CLIO', usWeightClass=400, xAvgCharWidth=700)
fb.setupPost(isFixedPitch=0, underlinePosition=-200, underlineThickness=100)
fb.setupHead(unitsPerEm=UPM)
fb.font['head'].flags |= 1 << 3   # integer ppem scaling
fb.font.flavor = 'woff2'
fb.save(OUT)
print(OUT, os.path.getsize(OUT), 'bytes,', len(glyphs), 'glyphs')
