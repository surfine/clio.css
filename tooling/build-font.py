"""Build fonts/ClioSans84.woff2 from fonts-src/clio-sans-84.txt.

Each pixel becomes a 100x100-unit square on an em of 100 units per pixel of
the original size (1200 for 12-point faces, 900 for 9-point), so at that
font-size and its whole multiples every square lands on one device pixel. Needs fontTools and brotli:
  python3 -m venv .venv && .venv/bin/pip install fonttools brotli
  .venv/bin/python tooling/build-font.py
"""
import os, sys
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen

ROOT = os.path.join(os.path.dirname(__file__), '..')
FONTS = {  # source -> (output, family, PostScript name, what it rebuilds)
    'clio-sans-84': ('ClioSans84.woff2', "Clio Sans '84", 'ClioSans84-Regular', 'Chicago 12, designed by Susan Kare for Apple Computer, 1984'),
    'clio-text-84': ('ClioText84.woff2', "Clio Text '84", 'ClioText84-Regular', 'Geneva 12, designed by Susan Kare for Apple Computer, 1984'),
    'clio-text-84-9': ('ClioText84-9.woff2', "Clio Text '84 9", 'ClioText84-9-Regular', 'Geneva 9, designed by Susan Kare for Apple Computer, 1984'),
    'clio-sans-97': ('ClioSans97.woff2', "Clio Sans '97", 'ClioSans97-Regular', 'Charcoal 12, designed by David Berlow (Font Bureau) for Apple Computer, 1997'),
    'clio-sans-97-title': ('ClioSans97Title.woff2', "Clio Sans '97 Title", 'ClioSans97Title-Regular', 'Charcoal 12, designed by David Berlow (Font Bureau) for Apple Computer, 1997'),
}
KEY = sys.argv[1] if len(sys.argv) > 1 else 'clio-sans-84'
OUT_FILE, FAMILY, PS, ORIGIN = FONTS[KEY]
# '--exact': the same glyphs with each coverage level painted from its own
# palette entry instead of the text colour at an alpha, so a stylesheet can
# give, for a known text colour on a known background, the very colours Mac OS
# blends ((fg*a + bg*(255-a)) >> 8, a = 17 per level), which no alpha
# compositing reproduces exactly. Palette 0 is black at those alphas.
EXACT = '--exact' in sys.argv
# '--plain': for browsers without COLRv1 (Safari paints its alpha layers solid,
# every faint pixel black). The same levels as COLRv0 layers, which Safari
# draws: fully covered pixels in the text colour (palette 0xFFFF), the other
# levels from palette entries, black at the levels' alphas by default; a
# stylesheet recolours them with font-palette (white text, say). With
# --exact every level, solid included, is a palette entry. Browsers with no
# colour fonts at all draw the outline (pixels at least half covered).
PLAIN = '--plain' in sys.argv
if PLAIN:
    OUT_FILE = OUT_FILE.replace('.woff2', 'Plain.woff2'); FAMILY += ' Plain'; PS = PS.replace('-Regular', 'Plain-Regular')
if EXACT:
    OUT_FILE = OUT_FILE.replace('.woff2', 'Exact.woff2'); FAMILY += ' Exact'; PS = PS.replace('-Regular', 'Exact-Regular')
SIZE = 9 if KEY.endswith('-9') else 12      # the pixel size the em is drawn for
SRC = os.path.join(ROOT, 'fonts-src', KEY + '.txt')
OUT = os.path.join(ROOT, 'fonts', OUT_FILE)
PX = 100
UPM = PX * SIZE

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

LEVEL = '.123456789abcde#'
def level(ch): return 15 if ch == '#' else max(0, LEVEL.find(ch))
COVERAGE = any(ch in row for g in glyphs.values() for row in g[3] for ch in '123456789abcde')

def name(cp): return 'space' if cp == 0x20 else 'uni%04X' % cp

order = ['.notdef'] + [name(cp) for cp in sorted(glyphs)]
cmap = {cp: name(cp) for cp in glyphs}
cmap[0xA0] = 'space'

def draw(adv, x0, top, rows, keep=lambda ch: ch == '#'):
    pen = TTGlyphPen(None)
    for r, row in enumerate(rows):
        y = top - r                      # pixel row y spans [y, y+1) above the baseline
        x = 0
        while x < len(row):
            if not keep(row[x]): x += 1; continue
            n = 1
            while x + n < len(row) and keep(row[x + n]): n += 1
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
def lsb(x0, rows, keep):
    """TrueType places a glyph by its own xMin, so each outline's left side
    bearing is its leftmost kept pixel."""
    xs = [x for row in rows for x, ch in enumerate(row) if keep(ch)]
    return ((x0 + min(xs)) * PX) if xs else 0

layers = {}
for cp, (adv, x0, top, rows) in glyphs.items():
    # The plain outline (what a browser without colour fonts draws): every pixel
    # at least half covered, the same threshold the bitmap was cut at before.
    base = (lambda ch: level(ch) >= 8) if COVERAGE else (lambda ch: ch == '#')
    g = draw(adv, x0, top, rows, base)
    glyf[name(cp)] = g
    hmtx[name(cp)] = (adv * PX, lsb(x0, rows, base))
    if COVERAGE and rows:
        # One layer per coverage level, painted in the text colour at that alpha.
        for k in sorted({level(ch) for row in rows for ch in row} - {0}):
            ln = '%s.l%d' % (name(cp), k)
            glyf[ln] = draw(adv, x0, top, rows, lambda ch, k=k: level(ch) == k)
            hmtx[ln] = (adv * PX, lsb(x0, rows, lambda ch, k=k: level(ch) == k))
            order.append(ln)
            layers.setdefault(name(cp), []).append((ln, k / 15))

fb = FontBuilder(UPM, isTTF=True)
fb.setupGlyphOrder(order)
fb.setupCharacterMap(cmap)
fb.setupGlyf(glyf)
fb.setupHorizontalMetrics(hmtx)
fb.setupHorizontalHeader(ascent=ASC * PX, descent=-DESC * PX, lineGap=0)
fb.setupNameTable({
    'familyName': FAMILY,
    'styleName': 'Regular',
    'uniqueFontIdentifier': PS + ";clio.css",
    'fullName': FAMILY,
    'psName': PS,
    'version': 'Version 1.000',
    'copyright': 'Pixel reconstruction (c) 2026 clio.css contributors, measured as drawn by ' + ('Mac OS 9.0' if KEY.startswith('clio-sans-97') else 'System 6.0.8') + '. The original bitmap design is ' + ORIGIN + '.',
    'licenseDescription': 'Distributed with clio.css under the MIT licence. Not affiliated with or endorsed by Apple Inc.; Chicago, Geneva and Charcoal are trademarks of Apple Inc.',
    'licenseInfoURL': 'https://github.com/surfine/clio.css/blob/main/THIRD-PARTY.md',
})
fb.setupOS2(version=4, sTypoAscender=ASC * PX, sTypoDescender=-DESC * PX, sTypoLineGap=0,
            usWinAscent=ASC * PX, usWinDescent=DESC * PX, fsSelection=0x40 | 0x80,
            achVendID='CLIO', usWeightClass=400, xAvgCharWidth=700)
fb.setupPost(isFixedPitch=0, underlinePosition=-200, underlineThickness=100)
fb.setupHead(unitsPerEm=UPM)
fb.font['head'].flags |= 1 << 3   # integer ppem scaling
if layers and PLAIN:
    from fontTools.colorLib.builder import buildCOLR, buildCPAL
    idx = (lambda k: k - 1) if EXACT else (lambda k: 0xFFFF if k == 15 else k - 1)
    fb.font['COLR'] = buildCOLR({g: [(ln, idx(round(a * 15))) for ln, a in ls] for g, ls in layers.items()}, version=0)
    fb.font['CPAL'] = buildCPAL([[(0.0, 0.0, 0.0, k * 17 / 255) for k in range(1, 16 if EXACT else 15)]])
elif layers:
    from fontTools.colorLib.builder import buildCOLR, buildCPAL
    if EXACT:
        fb.font['COLR'] = buildCOLR({g: {'Format': 1, 'Layers': [
            {'Format': 10, 'Glyph': ln, 'Paint': {'Format': 2, 'PaletteIndex': round(a * 15) - 1, 'Alpha': 1.0}} for ln, a in ls]}
            for g, ls in layers.items()}, version=1)
        fb.font['CPAL'] = buildCPAL([[(0.0, 0.0, 0.0, k * 17 / 255) for k in range(1, 16)]])
    else:
        fb.font['COLR'] = buildCOLR({g: {'Format': 1, 'Layers': [
            {'Format': 10, 'Glyph': ln, 'Paint': {'Format': 2, 'PaletteIndex': 0xFFFF, 'Alpha': a}} for ln, a in ls]}
            for g, ls in layers.items()}, version=1)
        fb.font['CPAL'] = buildCPAL([[(0.0, 0.0, 0.0, 1.0)]])
# Off: real iPhones drew no text at all from these SVG glyphs (0.9.2); the
# simulator drew them. Kept for study with --svg.
if PLAIN and COVERAGE and '--svg' in sys.argv:
    # Safari has no COLRv1 but draws OpenType-SVG glyphs: the same 16 levels
    # as squares in the text colour at each level's opacity.
    from fontTools.ttLib import newTable
    from fontTools.ttLib.tables.S_V_G_ import SVGDocument
    gid = {g: i for i, g in enumerate(fb.font.getGlyphOrder())}
    docs = []
    for cp, (adv, x0, top, rows) in sorted(glyphs.items()):
        rects = []
        for r, row in enumerate(rows):
            y = top - r; x = 0
            while x < len(row):
                k = level(row[x])
                if not k: x += 1; continue
                n = 1
                while x + n < len(row) and level(row[x + n]) == k: n += 1
                op = '' if k == 15 else ' fill-opacity="%.4f"' % (k / 15)
                rects.append('<rect x="%d" y="%d" width="%d" height="%d"%s/>' % ((x0 + x) * PX, -(y + 1) * PX, n * PX, PX, op))
                x += n
        if not rects: continue
        i = gid[name(cp)]
        docs.append(SVGDocument('<svg xmlns="http://www.w3.org/2000/svg"><g id="glyph%d" fill="currentColor">%s</g></svg>' % (i, ''.join(rects)), i, i, False))
    t = newTable('SVG '); t.docList = docs; fb.font['SVG '] = t
fb.font.flavor = 'woff2'
fb.save(OUT)
print(OUT, os.path.getsize(OUT), 'bytes,', len(glyphs), 'glyphs')
