"""System 7 scroll-bar art, redrawn from System 7.5.3 pixels.

Reads .fidelity/system7/folder-window.png (from `npm run capture:system7`) and
prints CSS custom properties: the four 14x14 arrow boxes, the grow box and the
scroll-box grip, each an SVG of 1px rectangles in the captured colours.
"""
import os
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), '..')
im = Image.open(os.path.join(ROOT, '.fidelity', 'system7', 'folder-window.png')).convert('RGB')

def crop(x0, y0, w, h):
    return {(x, y): '#%02x%02x%02x' % im.getpixel((x0 + x, y0 + y)) for x in range(w) for y in range(h)}

def svg(px, w, h):
    by = {}
    for (x, y), c in px.items(): by.setdefault(c, []).append((x, y))
    body = ''
    for c, pts in sorted(by.items(), key=lambda kv: -len(kv[1])):
        rows = {}
        for x, y in pts: rows.setdefault(y, []).append(x)
        d = ''
        for y, xs in sorted(rows.items()):
            xs.sort(); i = 0
            while i < len(xs):
                n = 1
                while i + n < len(xs) and xs[i + n] == xs[i] + n: n += 1
                d += 'M%d %dh%dv1h-%dz' % (xs[i], y, n, n); i += n
        body += "<path fill='%s' d='%s'/>" % (c, d)
    s = "<svg xmlns='http://www.w3.org/2000/svg' width='%d' height='%d' shape-rendering='crispEdges'>%s</svg>" % (w, h, body)
    return 'url("data:image/svg+xml,' + s.replace('#', '%23').replace('<', '%3C').replace('>', '%3E') + '")'

art = {
    's7-up': (crop(406, 110, 14, 14), 14, 14),     # Control Panels & Extensions window
    's7-down': (crop(406, 219, 14, 14), 14, 14),
    's7-left': (crop(46, 234, 14, 14), 14, 14),
    's7-right': (crop(391, 234, 14, 14), 14, 14),
    's7-grow': (crop(406, 234, 14, 14), 14, 14),
    's7-grip-v': (crop(410, 128, 6, 10), 6, 10),
}
gv = art['s7-grip-v'][0]
art['s7-grip-h'] = ({(y, x): c for (x, y), c in gv.items()}, 10, 6)   # the horizontal grip is the vertical one transposed
for k, (px, w, h) in art.items():
    print('  --clio-art-%s: %s;' % (k, svg(px, w, h)))
