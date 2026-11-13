"""Mac OS 9 Platinum art, redrawn pixel for pixel from Mac OS 9.0 frames.

Reads .fidelity/platinum9/*.png (from `npm run capture:platinum`) and prints CSS
custom properties, each a palette PNG of the captured colours (smaller than an
SVG of 1px rectangles for many-coloured parts); the backdrop colour around a
part is left transparent.

  - check box mark and radio buttons (General Controls)
  - Control Strip: end-cap icon, scroll arrows, module menu triangle, the tab
    handle and the collapsed tab (Finder desktop)
"""
import base64, io, os
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), '..')
load = lambda n: Image.open(os.path.join(ROOT, '.fidelity', 'platinum9', n + '.png')).convert('RGB')
gc, strip, tab = load('general-controls'), load('strip-expanded'), load('strip-collapsed')

def crop(im, x0, y0, w, h, clear=()):
    px = {}
    for x in range(w):
        for y in range(h):
            c = im.getpixel((x0 + x, y0 + y))
            if c not in clear: px[(x, y)] = '#%02x%02x%02x' % c
    return px, w, h

def png(px, w, h):
    pal = [(0, 0, 0, 0)] + sorted({tuple(int(c[i:i + 2], 16) for i in (1, 3, 5)) + (255,) for c in px.values()})
    idx = {c: i for i, c in enumerate(pal)}
    im = Image.new('P', (w, h))
    im.putpalette([v for c in pal for v in c[:3]], rawmode='RGB')
    im.putdata([idx[tuple(int(px[(x, y)][i:i + 2], 16) for i in (1, 3, 5)) + (255,)] if (x, y) in px else 0
                for y in range(h) for x in range(w)])
    buf = io.BytesIO()
    bits = next(b for b in (1, 2, 4, 8) if len(pal) <= 1 << b)
    im.save(buf, 'PNG', bits=bits, transparency=bytes([0]))
    return 'url("data:image/png;base64,%s")' % base64.b64encode(buf.getvalue()).decode()

PANE, DESK, FACE = (0xee, 0xee, 0xee), (0x99, 0x99, 0xcc), (0xc0, 0xc0, 0xc0)
art = {
    # "Show Desktop when in background", checked: the mark inside the 12px box
    # (10x10 inside the black frame) and the two columns it overhangs the frame by.
    'p9-check': crop(gc, 34, 82, 10, 10),
    'p9-check-overhang': crop(gc, 45, 82, 2, 4, (PANE,)),
    'p9-radio-on': crop(gc, 268, 265, 12, 12, (PANE,)),
    'p9-radio': crop(gc, 268, 282, 12, 12, (PANE,)),
    'p9-strip-cap': crop(strip, 3, 584, 8, 8),
    'p9-strip-back': crop(strip, 16, 583, 10, 10, (FACE,)),
    'p9-strip-forward': crop(strip, 151, 583, 10, 10, (FACE,)),
    'p9-strip-menu': crop(strip, 49, 584, 4, 7, (FACE,)),
    'p9-strip-handle': crop(strip, 164, 576, 18, 24, (DESK,)),
    'p9-strip-tab': crop(tab, 0, 576, 18, 24, (DESK,)),
}
for k, (px, w, h) in art.items():
    print('  --clio-art-%s: %s; /* %dx%d */' % (k, png(px, w, h), w, h))
