"""Extract the Clio Sans '84 glyph source from System 6.0.8 captures.

Reads the Key Caps frames written by `npm run capture:keycaps` (each character
typed between two "|" bars in Chicago 12) plus the File-menu frame for the
command-key glyph, and writes fonts-src/clio-sans-84.txt: one block per glyph
with its advance, the bitmap's left offset from the origin, and its rows.
Usage: python3 tooling/extract-glyphs.py [--font chicago|geneva|geneva9|charcoal] [--lb-bar N]
charcoal reads Mac OS 9.0's Key Caps (.fidelity/platinum9) and writes Clio Sans '97.
"""
import json, sys, os
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), '..')
def arg(name, default):
    return sys.argv[sys.argv.index(name) + 1] if name in sys.argv else default
FONT = arg('--font', 'chicago')
CAP = os.path.join(ROOT, '.fidelity', 'platinum9' if FONT == 'charcoal' else 'system6')
LEVEL = '.123456789abcde#'
COVERAGE = FONT == 'charcoal'   # Charcoal keeps its antialiasing: one character per level
LB_BAR = int(arg('--lb-bar', {'chicago': 2, 'geneva': 1, 'geneva9': 0, 'charcoal': 2}.get(FONT, 1)))
OUT_NAME = {'chicago': 'clio-sans-84.txt', 'geneva': 'clio-text-84.txt', 'geneva9': 'clio-text-84-9.txt', 'charcoal': 'clio-sans-97.txt'}[FONT]
# The text strip: Key Caps' line, or for Geneva 9 the Get Info comments box.
X0, X1, Y0, Y1 = {'geneva9': (20, 238, 221, 238), 'charcoal': (88, 488, 72, 97)}.get(FONT, (58, 458, 72, 96))

def frame(path):
    im = Image.open(path).convert('L')
    return lambda x, y: im.getpixel((x, y)) < 128

def levels(path, bg=255):
    """Mac OS 9 antialiases Charcoal in 16 coverage levels: on a ground of grey bg
    a pixel of level k (0..15) reads bg * (1 - k / 15). Returns k per pixel."""
    im = Image.open(path).convert('L')
    return lambda x, y: max(0, min(15, round((bg - im.getpixel((x, y))) * 15 / bg)))

def full_col(b, x):
    if not all(b(x, y) for y in range(BAR_TOP, BAR_BOT + 1)): return False
    return not any(b(x, y) for y in list(range(Y0, BAR_TOP)) + list(range(BAR_BOT + 1, Y1)))

def full_bar(b, x):
    """BAR_W full columns from x (Charcoal's bar is two pixels wide)."""
    return all(full_col(b, x + k) for k in range(BAR_W))

def strict(b, x):
    """A bar with blank columns on both sides."""
    return full_bar(b, x) and not any(b(x + d, y) for d in (-1, BAR_W) for y in range(Y0, Y1))

def relaxed(b, x):
    """A bar may touch a neighbour, but a bracket's stem (neighbour inked on the
    bar's top and bottom rows) or one of two adjacent full columns is not one."""
    if not full_bar(b, x): return False
    for d in (-1, BAR_W):
        if b(x + d, BAR_TOP) and b(x + d, BAR_BOT): return False
        if all(b(x + d, y) for y in range(BAR_TOP, BAR_BOT + 1)): return False
    return True

def find_bars(b, need):
    for rule in (strict, relaxed):
        bars = [x for x in range(X0, X1) if rule(b, x)][:need]
        if len(bars) == need - 1:
            # The closing bar can touch the text cursor that follows it.
            tail = [x for x in range(bars[-1] + 3, X1) if full_bar(b, x)]
            if tail: bars.append(tail[0])
        if len(bars) == need and all(bars[i + 1] - bars[i] > 2 for i in range(need - 1)):
            return bars
    raise SystemExit('could not find %d bars: strict %s relaxed %s' % (need, [x - X0 for x in range(X0, X1) if strict(b, x)], [x - X0 for x in range(X0, X1) if relaxed(b, x)]))

# The "|" bar's rows and advance, from the first frame (only bars typed).
b0 = frame(os.path.join(CAP, 'kc-%s-00.png' % FONT))
inked = [x for x in range(X0, X1) if sum(b0(x, y) for y in range(Y0, Y1)) >= 6]
bar_cols = [x for x in inked if x - 1 not in inked]          # each bar's first column
BAR_W = next(k for k in range(1, 5) if bar_cols[0] + k not in inked)
bar_rows = [y for y in range(Y0, Y1) if b0(bar_cols[0], y)]
BAR_TOP, BAR_BOT = bar_rows[0], bar_rows[-1]
BAR_ADV = bar_cols[1] - bar_cols[0]

glyphs = {}
batches = json.load(open(os.path.join(CAP, 'kc-%s-batches.json' % FONT)))
for n, batch in enumerate(batches):
    if n == 0: continue
    b = frame(os.path.join(CAP, 'kc-%s-%02d.png' % (FONT, n)))
    lv = levels(os.path.join(CAP, 'kc-%s-%02d.png' % (FONT, n)))
    bars = find_bars(b, len(batch) + 1)
    for i, c in enumerate(batch):
        a, z = bars[i], bars[i + 1]
        origin = a - LB_BAR + BAR_ADV
        glyphs[c] = {'adv': z - a - BAR_ADV,
                     'raw': {(x - origin, y) for x in range(a + BAR_W, z) for y in range(Y0, Y1) if b(x, y)},
                     'lv': {(x - origin, y): lv(x, y) for x in range(a + BAR_W, z) for y in range(Y0, Y1) if lv(x, y)}}
BASE = max(y for x, y in glyphs['H']['raw']) + 1     # first row below the baseline
for g in glyphs.values():
    g['px'] = {(x, BASE - 1 - y) for x, y in g.pop('raw')}
    if 'lv' in g: g['lv'] = {(x, BASE - 1 - y): k for (x, y), k in g['lv'].items()}
glyphs['|'] = {'adv': BAR_ADV, 'px': {(LB_BAR + k, BASE - 1 - y) for k in range(BAR_W) for y in range(BAR_TOP, BAR_BOT + 1)}}

def lb(c): return min(x for x, y in glyphs[c]['px'])

if FONT == 'chicago':
    # Space: the gap in the title "Macintosh HD" (hd-window frame, rows 32-40).
    t = frame(os.path.join(CAP, 'hd-window.png'))
    cut0 = next(x for x in range(60, 200) if not t(x, 33))            # row 33 is a stripe row
    cut1 = next(x for x in range(cut0 + 40, 239) if all(t(x + k, 33) for k in range(6))) - 1
    cols = [x for x in range(cut0, cut1 + 1) if any(t(x, y) for y in range(32, 41))]
    m_ink, runs = cols[0], []
    for x in cols:
        if runs and x == runs[-1][1] + 1: runs[-1][1] = x
        else: runs.append([x, x])
    gap = max(range(1, len(runs)), key=lambda i: runs[i][0] - runs[i - 1][1])
    h_ink = runs[gap][0]
    after_h = (m_ink - lb('M')) + sum(glyphs[c]['adv'] for c in 'Macintosh')
    glyphs[' '] = {'adv': (h_ink - lb('H')) - after_h, 'px': set()}

    # Command key (U+2318): "⌘N" in the File menu (file-menu frame, rows 23-31).
    f = frame(os.path.join(CAP, 'file-menu.png'))
    cmd = {(x, y) for x in range(150, 164) for y in range(21, 34) if f(x, y)}
    cx0 = min(x for x, y in cmd); n_ink = min(x for x in range(cx0 + 10, 178) if any(f(x, y) for y in range(23, 32)))
    cmd_lb = lb('H')                                     # inferred: same side bearing as the capitals
    glyphs['⌘'] = {'adv': (n_ink - lb('N')) - (cx0 - cmd_lb),
                   'px': {(x - cx0 + cmd_lb, 31 - y) for x, y in cmd}}

    # Check mark (U+2713): the menu check measured in tooling/s6-art.py (9x8 on the baseline).
    check = [(8, 0), (7, 1), (8, 1), (6, 2), (7, 2), (5, 3), (6, 3), (0, 4), (4, 4), (5, 4), (0, 5), (1, 5), (3, 5), (4, 5), (1, 6), (2, 6), (3, 6), (2, 7)]
    glyphs['✓'] = {'adv': 11, 'px': {(x + 1, 7 - y) for x, y in check}}


if FONT == 'geneva':
    # Space: "Welcome to" on the first line of TeachText's Welcome! document (rows 45-53).
    t = frame(os.path.join(CAP, 'teachtext.png'))
    cols = [x for x in range(9, 200) if any(t(x, y) for y in range(42, 57))]
    runs = []
    for x in cols:
        if runs and x <= runs[-1][1] + 1: runs[-1][1] = x
        else: runs.append([x, x])
    w_ink = runs[0][0]
    to_ink = next(r[0] for r in runs[1:] if r[0] - prev[1] > 4) if (prev := runs[0]) else None
    gaps = [runs[i][0] - runs[i - 1][1] for i in range(1, len(runs))]
    to_ink = runs[gaps.index(max(gaps[:8])) + 1][0]
    after = (w_ink - lb('W')) + sum(glyphs[c]['adv'] for c in 'Welcome')
    glyphs[' '] = {'adv': (to_ink - lb('t')) - after, 'px': set()}

if FONT == 'geneva9':
    # Space: "2 items" in the Finder info line of the Macintosh HD window (rows 51-57).
    t = frame(os.path.join(CAP, 'hd-window.png'))
    cols = [x for x in range(4, 60) if any(t(x, y) for y in range(47, 61))]
    two = cols[0]
    i_ink = next(x for x in cols if x > two + glyphs['2']['adv'])
    glyphs[' '] = {'adv': (i_ink - lb('i')) - (two - lb('2') + glyphs['2']['adv']), 'px': set()}

if FONT == 'charcoal':
    # Space: "Infinite HD", the Finder window's title (frame finder, rows 58-66):
    # "I" inks at x=196 and "H" at x=244.
    t = frame(os.path.join(CAP, 'finder.png'))
    i_ink = next(x for x in range(193, 210) if any(t(x, y) for y in range(58, 67)))
    h_ink = next(x for x in range(240, 250) if all(t(x, y) for y in range(58, 67)))
    after = (i_ink - lb('I')) + sum(glyphs[c]['adv'] for c in 'Infinite')
    glyphs[' '] = {'adv': (h_ink - lb('H')) - after, 'px': set()}
    # (The same 3px space falls out of "About This Computer" in the Apple menu.)

    # Command key (U+2318): "⌘N" in the Finder's File menu (frame file-menu, rows 23-31).
    f = frame(os.path.join(CAP, 'file-menu.png'))
    cmd = {(x, y) for x in range(176, 188) for y in range(21, 34) if f(x, y)}
    cx0 = min(x for x, y in cmd)
    n_ink = min(x for x in range(cx0 + 9, 200) if any(f(x, y) for y in range(23, 32)))
    cmd_lb = lb('H')                                     # inferred: same side bearing as the capitals
    glyphs['⌘'] = {'adv': (n_ink - lb('N')) - (cx0 - cmd_lb),
                   'px': {(x - cx0 + cmd_lb, 31 - y) for x, y in cmd}}

TITLE = {'chicago': "Clio Sans '84 (Chicago 12)", 'geneva': "Clio Text '84 (Geneva 12)", 'geneva9': "Clio Text '84 9 (Geneva 9)", 'charcoal': "Clio Sans '97 (Charcoal 12)"}[FONT]
out = ["# %s glyph source. Generated by tooling/extract-glyphs.py from %s" % (TITLE, 'Mac OS 9.0' if FONT == 'charcoal' else 'System 6.0.8'),
       "# captures (Key Caps, Infinite Mac). One pixel = one design unit; the",
       "# baseline is y=0. Each glyph: U+XXXX advance left-offset top-row, then its rows.",
       "metrics ascent=%d descent=%d lb-bar=%d" % (((9, 2) if FONT == 'geneva9' else (11, 3)) + (LB_BAR,))]
if COVERAGE:
    out += ["# Pixels carry Mac OS 9's 16 antialiasing levels: '.' none, 1-9 a-e partial, '#' full."]
out.append("")
for c in sorted(glyphs, key=ord):
    g = glyphs[c]
    if COVERAGE and g.get('lv'):
        g['px'] = set(g['lv'])
    if not g['px']:
        out += ["U+%04X %d 0 0" % (ord(c), g['adv']), ""]; continue
    xs = [x for x, y in g['px']]; ys = [y for x, y in g['px']]
    x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
    out.append("U+%04X %d %d %d  %s" % (ord(c), g['adv'], x0, y1, c))
    for y in range(y1, y0 - 1, -1):
        if COVERAGE and g.get('lv'):
            out.append(''.join(LEVEL[g['lv'].get((x, y), 0)] for x in range(x0, x1 + 1)))
        else:
            out.append(''.join('#' if (x, y) in g['px'] else '.' for x in range(x0, x1 + 1)))
    out.append("")
open(os.path.join(ROOT, 'fonts-src', OUT_NAME), 'w').write("\n".join(out))
print(FONT, len(glyphs), 'glyphs; space', glyphs.get(' ', {}).get('adv'), '; bar', BAR_TOP, BAR_BOT, BAR_ADV, BAR_W, '; base', BASE, '; lb H', lb('H'))
