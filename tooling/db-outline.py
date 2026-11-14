"""Drawing Board's dragged outline: four corner patches for clio.js's outline.

  python3 tooling/db-outline.py      -> the four patches as data URIs, for src/92-drawingboard.css

QuickDraw drags the frame of the window's structure region, 2px wide (InsetRgn by
2 across, then down). With the theme that region is the frame and its shadow (7px
right, 8px down) plus the dark parts of the frame pieces that overrun them, but
not the grey outer column left of the frame. Away from the corners its frame is a
plain band; near them it follows the pieces. This builds the region from the
theme's pieces (art/drawingboard/window-*.png, laid out as the stylesheet lays
them out), takes its frame, and writes, for each corner, the pixels where that
frame differs from the plain band round the frame-and-shadow rectangle: clio.js's
outline XORs them in. Measured against Mac OS 8.5 (tooling/outline-check.mjs).
"""
import base64, io, os
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
A = os.path.join(ROOT, 'art', 'drawingboard')
W, H = 387, 246            # a reference frame, big enough for the corners to be apart
EX, EY, BAND, M, P = 7, 8, 2, 12, 80   # shadow, band width, the outline's margin, patch size

R = set((x, y) for x in range(W) for y in range(H))
def piece(name, x0, y0, tile=None, clip=None):
    im = Image.open(os.path.join(A, name)).convert('RGBA'); w, h = im.size
    xs = range(*tile[0]) if tile else range(x0, x0 + w)
    ys = range(*tile[1]) if tile else range(y0, y0 + h)
    for X in xs:
        for Y in ys:
            ix, iy = (X - x0) % w, (Y - y0) % h
            if not tile and not (0 <= X - x0 < w and 0 <= Y - y0 < h): continue
            if clip and not clip(X, Y): continue
            if X == -1 and 0 <= Y < H - 1: continue      # the grey outer column is not region (its last row is: measured)
            if im.getpixel((ix, iy))[3] > 127: R.add((X, Y))
def inside(px, py, pts):
    c = False
    for i in range(len(pts)):
        (x1, y1), (x2, y2) = pts[i], pts[(i + 1) % len(pts)]
        if (y1 > py) != (y2 > py) and px < (x2 - x1) * (py - y1) / (y2 - y1) + x1: c = not c
    return c
# ::after (inset -10px -11px -18px -8px)
piece('window-tl.png', -3, -5)   # the region's piece sits 1px right of the drawn one (fitted: Mac OS 8.5 drag)
piece('window-tr.png', W - 6, -10)
piece('window-ur.png', W - 6, 22)
piece('window-br.png', W - 52, H - 46)
piece('window-bl.png', -7, H - 14)   # likewise 1px right
# ::before (inset 0 -7px -8px -1px) and its clip
Wb, Hb = W + 8, H + 8
pts = [(25, 0), (Wb - 13, 0), (Wb - 13, 54), (Wb, 54), (Wb, Hb - 54), (Wb - 59, Hb - 54), (Wb - 59, Hb), (57, Hb), (57, Hb - 22), (0, Hb - 22), (0, 22), (25, 22)]
clip = lambda X, Y: inside(X + 1.5, Y + 0.5, pts)
piece('window-top.png', 24, 0, tile=((24, W + 7), (0, 22)), clip=clip)
piece('window-left.png', -1, 22, tile=((-1, 6), (22, H + 8)), clip=clip)
piece('window-right.png', W - 6, 54, tile=((W - 6, W + 7), (54, H + 8)), clip=clip)
piece('window-bottom.png', 56, H - 6, tile=((56, W + 7), (H - 6, H + 8)), clip=clip)

def frame(S):
    across = set(p for p in S if all((p[0] + k, p[1]) in S for k in range(-BAND, BAND + 1)))
    inset = set(p for p in across if all((p[0], p[1] + k) in across for k in range(-BAND, BAND + 1)))
    return S - inset
plain = frame(set((x, y) for x in range(W + EX) for y in range(H + EY)))
diff = frame(R) ^ plain
# Corners of the outline element (the rectangle and a margin M all round).
EW, EH = W + EX + 2 * M, H + EY + 2 * M
corners = {'tl': (0, 0), 'tr': (EW - P, 0), 'bl': (0, EH - P), 'br': (EW - P, EH - P)}
left = set(diff)
for k, (cx, cy) in corners.items():
    im = Image.new('RGBA', (P, P))
    for (x, y) in list(left):
        ex, ey = x + M - cx, y + M - cy
        if 0 <= ex < P and 0 <= ey < P: im.putpixel((ex, ey), (255, 255, 255, 255)); left.discard((x, y))
    buf = io.BytesIO(); im.convert('LA').save(buf, 'PNG', optimize=True)
    # inline: a mask picture is fetched with CORS, which a file:// page or a CDN without it refuses
    print('  --clio-db-outline-%s: url("data:image/png;base64,%s");' % (k, base64.b64encode(buf.getvalue()).decode()))
if left: raise SystemExit('pixels outside the corner patches: %s' % sorted(left)[:10])
print('  /* outline patches: %d pixels in four %dx%d corners (tooling/db-outline.py) */' % (len(diff), P, P))
