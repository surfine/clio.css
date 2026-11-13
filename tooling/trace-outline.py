"""Trace Clio Sans '97 Display: Charcoal's outlines, from Mac OS 9.0 drawing it large.

Reads the Stickies frames written by `npm run capture:charcoal-large` (every
character typed at 48 points between "|" bars), finds each glyph's advance from
the bars exactly as tooling/extract-glyphs.py does for the 12px bitmap, traces
the glyph's ink (Mac OS 9 smooths text this large, so the grey edge is upsampled
before thresholding) with potrace into cubic curves, and writes
fonts/ClioSans97Display.woff2, a CFF font with 2048 units per em.

  .venv/bin/python tooling/trace-outline.py      (needs fontTools, brotli, numpy, pillow, potracer)

The 12px bitmap (Clio Sans '97) stays exact at 12px and its multiples; this face
is for every other size. Inferred: the bar's left bearing is taken as half the
space it leaves in its advance.
"""
import json, os, sys
import numpy as np
from PIL import Image
import potrace
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.t2CharStringPen import T2CharStringPen
from fontTools.pens.recordingPen import RecordingPen
from fontTools.pens.boundsPen import BoundsPen

ROOT = os.path.join(os.path.dirname(__file__), '..')
CAP = os.path.join(ROOT, '.fidelity', 'platinum9')
meta = json.load(open(os.path.join(CAP, 'cl-batches.json')))
SIZE, batches = meta['size'], meta['batches']
UPM = 2048
U = UPM / SIZE                      # font units per screen pixel
UP = 4                              # upsampling before tracing
X0, X1, Y0, Y1 = 103, 776, 93, 93 + SIZE * 2   # the note's first line

def grey(n):
    im = Image.open(os.path.join(CAP, 'cl-%02d.png' % n)).convert('L')
    return np.asarray(im.crop((X0, Y0, X1, Y1))).astype(float) / 255.0   # 1 = paper

def ink(a):
    return a < 0.5

# The bar: from the first frame (bars only).
g0 = ink(grey(0))
cols = [x for x in range(g0.shape[1]) if g0[:, x].sum() >= SIZE // 2]
starts = [x for x in cols if x - 1 not in cols]
BAR_W = next(k for k in range(1, 20) if starts[0] + k not in cols)
rows = np.where(g0[:, starts[0]])[0]
BAR_TOP, BAR_BOT = rows[0], rows[-1]
BAR_ADV = starts[1] - starts[0]
BAR_LB = (BAR_ADV - BAR_W) / 2

def bars(g, need):
    full = [x for x in range(g.shape[1] - BAR_W) if all(g[BAR_TOP:BAR_BOT + 1, x + k].all() for k in range(BAR_W))
            and not g[:BAR_TOP - 2, x].any() and not g[BAR_BOT + 3:, x].any()]
    st = [x for x in full if x - 1 not in full]
    if len(st) < need: raise SystemExit('found %d bars, need %d' % (len(st), need))
    return st[:need]

glyphs = {}
for n, batch in enumerate(batches):
    if n == 0: continue
    a = grey(n); g = ink(a)
    b = bars(g, len(batch) + 1)
    for i, c in enumerate(batch):
        left, right = b[i] + BAR_W, b[i + 1]
        origin = b[i] - BAR_LB + BAR_ADV                      # this glyph's origin, in pixels
        # Only the columns between the bars, with a column of paper added on each side.
        crop = np.pad(a[:, left:right], ((0, 0), (1, 1)), constant_values=1.0)
        glyphs[c] = {'adv': (b[i + 1] - b[i]) - BAR_ADV, 'crop': crop, 'x0': left - 1 - origin}
H = ink(glyphs['H']['crop'])
BASE = np.where(H.any(axis=1))[0][-1] + 1                   # first row below the baseline

def trace(crop, x0):
    big = np.asarray(Image.fromarray((crop * 255).astype(np.uint8)).resize(
        (crop.shape[1] * UP, crop.shape[0] * UP), Image.BICUBIC)).astype(float) / 255.0
    # potracer fills the False pixels, so hand it the paper as True.
    path = potrace.Bitmap(big >= 0.5).trace(turdsize=8, alphamax=1.0, opticurve=True, opttolerance=0.2)
    pen = RecordingPen()
    f = lambda p: (round((p.x / UP + x0) * U), round((BASE - p.y / UP) * U))
    for curve in path:
        pen.moveTo(f(curve.start_point))
        for seg in curve.segments:
            if seg.is_corner:
                pen.lineTo(f(seg.c)); pen.lineTo(f(seg.end_point))
            else:
                pen.curveTo(f(seg.c1), f(seg.c2), f(seg.end_point))
        pen.closePath()
    return pen

def charstring(rec, adv):
    t2, bp = T2CharStringPen(adv, None), BoundsPen(None)
    rec.replay(t2); rec.replay(bp)
    return t2.getCharString(), (bp.bounds[0] if bp.bounds else 0)

name = lambda cp: 'space' if cp == 0x20 else 'uni%04X' % cp
order, charstrings, hmtx, cmap = ['.notdef', 'space'], {}, {}, {0x20: 'space', 0xA0: 'space'}
charstrings['.notdef'], _ = charstring(RecordingPen(), round(5 * U)); hmtx['.notdef'] = (round(5 * U), 0)
# Space: Clio Sans '97 measured 3px at 12px; scaled to this size.
space = round(3 * SIZE / 12 * U)
charstrings['space'], _ = charstring(RecordingPen(), space); hmtx['space'] = (space, 0)
for c, g in sorted(glyphs.items(), key=lambda kv: ord(kv[0])):
    nm = name(ord(c)); order.append(nm); cmap[ord(c)] = nm
    adv = round(g['adv'] * U)
    charstrings[nm], lsb = charstring(trace(g['crop'], g['x0']), adv)
    hmtx[nm] = (adv, lsb)
bar = RecordingPen()
l, r, t, btm = round(BAR_LB * U), round((BAR_LB + BAR_W) * U), round((BASE - BAR_TOP) * U), round((BASE - BAR_BOT - 1) * U)
bar.moveTo((l, btm)); bar.lineTo((l, t)); bar.lineTo((r, t)); bar.lineTo((r, btm)); bar.closePath()
order.append('uni007C'); cmap[0x7C] = 'uni007C'
charstrings['uni007C'], lsb = charstring(bar, round(BAR_ADV * U)); hmtx['uni007C'] = (round(BAR_ADV * U), lsb)

ASC, DESC = round(SIZE * 11 / 12 * U), round(SIZE * 3 / 12 * U)
fb = FontBuilder(UPM, isTTF=False)
fb.setupGlyphOrder(order)
fb.setupCharacterMap(cmap)
fb.setupCFF('ClioSans97Display-Regular', {'FullName': "Clio Sans '97 Display"}, charstrings, {})
fb.setupHorizontalMetrics(hmtx)
fb.setupHorizontalHeader(ascent=ASC, descent=-DESC, lineGap=0)
fb.setupNameTable({
    'familyName': "Clio Sans '97 Display", 'styleName': 'Regular', 'uniqueFontIdentifier': 'ClioSans97Display;clio.css',
    'fullName': "Clio Sans '97 Display", 'psName': 'ClioSans97Display-Regular', 'version': 'Version 1.000',
    'copyright': 'Outline reconstruction (c) 2026 clio.css contributors, traced from Charcoal as drawn by Mac OS 9.0 at %d points. The original design is Charcoal, by David Berlow (Font Bureau) for Apple Computer, 1997.' % SIZE,
    'licenseDescription': 'Distributed with clio.css under the MIT licence. Not affiliated with or endorsed by Apple Inc.; Charcoal is a trademark of Apple Inc.',
    'licenseInfoURL': 'https://github.com/surfine/clio.css/blob/main/THIRD-PARTY.md',
})
fb.setupOS2(version=4, sTypoAscender=ASC, sTypoDescender=-DESC, sTypoLineGap=0, usWinAscent=ASC, usWinDescent=DESC,
            fsSelection=0x40 | 0x80, achVendID='CLIO', usWeightClass=400)
fb.setupPost()
fb.font.flavor = 'woff2'
out = os.path.join(ROOT, 'fonts', 'ClioSans97Display.woff2')
fb.save(out)
print(out, os.path.getsize(out), 'bytes,', len(order), 'glyphs; bar', BAR_W, BAR_ADV, BAR_TOP, BAR_BOT, 'base', BASE)
