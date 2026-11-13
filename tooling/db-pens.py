"""Drawing Board controls drawn with pattern pens.

Mac OS 8.5 draws a Drawing Board push button, pop-up menu, default button or
text field with pattern pens ('ppat' 70xx: 64 or 32px-long rows, 16px-tall
columns) and a few fixed pencil pixels at the corners. A pen is tiled so that
its pixel 0 falls on the control's last column (rows) or last row (columns);
a held button's foot and right side are tiled from its second column and row
instead. For each state this writes, into art/drawingboard/pens/:

  <state>-<line>.png   one row or column of a ppat (a line of the frame)
  <state>-corners.png  the pixels of the box's outer ring the pens do not
                       explain, as a nine-slice image with K-pixel corners

and reports, for every listed sample of the state, how many corner pixels it
has and whether they equal the first sample's.
Usage: db-pens.py <theme file> <capture dir> [state ...]
"""
import os, sys, importlib.util
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location('tr', os.path.join(HERE, 'theme-resources.py'))
tr = importlib.util.module_from_spec(spec); spec.loader.exec_module(tr)
res = tr.parse(tr.read_fork(sys.argv[1]))
pp = {rid: np.array(tr.decode_ppat(body).convert('RGB')).astype(int) for rid, _, body in res['ppat']}
cluts = {rid: tr.ctable(body, 0) for rid, _, body in res['clut']}
pxm = {rid: [np.array(im.convert('RGBA')).astype(int) for im in tr.decode_pxm(body, cluts)] for rid, _, body in res['pxm#'] if rid == 1150}
CAP = sys.argv[2]
OUT = os.path.join(HERE, '..', 'art', 'drawingboard', 'pens'); os.makedirs(OUT, exist_ok=True)
K = 5
FACE = (0xce, 0xc6, 0xb5)

# Lines: name -> (axis, ppat, row or column, offset, anchor). offset: the row
# (axis 'h') or column ('v') it draws, counted from the box's top/left when
# >= 0 and from the last row/column + 1 when it is a string 'end+N' / 'end-N'.
# anchor 'end': pixel 0 on the last column/row; 'start+1': on the second.
def L(axis, rid, i, off, anchor='end'): return (axis, rid, i, off, anchor)
STATES = {
    'popup': dict(lines={'top': L('h', 7095, 0, 0), 'bottom': L('h', 7096, 2, 'end-1'),
                         'left': L('v', 7097, 0, 0), 'right': L('v', 7098, 2, 'end-1')},
                  samples=[('appearance', 288, 143, 180, 20), ('appearance', 288, 184, 180, 20)]),
    'popup-disabled': dict(lines={'top': L('h', 7095, 1, 0), 'bottom': L('h', 7096, 0, 'end-1'),
                                  'left': L('v', 7097, 1, 0), 'right': L('v', 7098, 0, 'end-1')},
                  samples=[('appearance', 288, 225, 180, 20)]),
    # Push button: a 1px pencil outline and a 1px shade right and below.
    'button': dict(lines={'top': L('h', 7071, 0, 0), 'bottom': L('h', 7070, 0, 'end-1'), 'shade-bottom': L('h', 7070, 1, 'end+0'),
                          'left': L('v', 7072, 0, 0), 'right': L('v', 7079, 0, 'end-1'), 'shade-right': L('v', 7079, 1, 'end+0')},
                  hatch=(0, 0, 0),   # ButtonFaceCorner image 0, flush with the box's right and bottom edges
                  samples=[('themes-tab', 518, 370, 103, 20), ('energy-saver-alert', 278, 375, 140, 20)]),
    'button-held': dict(lines={'top': L('h', 7071, 0, 0), 'bottom': L('h', 7126, 0, 'end-1', 'start+1'), 'shade-bottom': L('h', 7126, 1, 'end+0', 'start+1'),
                               'left': L('v', 7072, 0, 0), 'right': L('v', 7127, 0, 'end-1', 'start+1'), 'shade-right': L('v', 7127, 1, 'end+0', 'start+1')},
                  samples=[('button-held', 518, 370, 103, 20)]),
    # Text field: a 1px pencil line (ppat 7003-7006) 1px outside the white box;
    # the rows tiled from the white's left edge, the left column from its top,
    # the right column from 1px higher (Date & Time's two fields agree). The
    # 1px between line and white shows the paper (not part of the frame).
    'field': dict(lines={'top': L('h', 7005, 0, 0, 'start+2'), 'bottom': L('h', 7006, 0, 'end-1', 'start+2'),
                         'left': L('v', 7003, 0, 0, 'start+2'), 'right': L('v', 7003, 0, 'end-1', 'start+1')},
                  face=None, phase=64,
                  samples=[('date-time', 251, 121, 106, 25)]),
    # Default button: a 3px band, its inner line on the box's edge.
    'button-default': dict(lines={'top': L('h', 7085, 7, 0), 'top-2': L('h', 7085, 6, -1), 'top-3': L('h', 7085, 5, -2),
                                  'bottom': L('h', 7085, 0, 'end-1'), 'bottom-2': L('h', 7085, 1, 'end+0'), 'bottom-3': L('h', 7085, 2, 'end+1'),
                                  'left': L('v', 7086, 2, 0), 'left-2': L('v', 7086, 1, -1), 'left-3': L('v', 7086, 0, -2),
                                  'right': L('v', 7086, 5, 'end-1'), 'right-2': L('v', 7086, 6, 'end+0'), 'right-3': L('v', 7086, 7, 'end+1')},
                  samples=[('energy-saver-alert', 441, 375, 140, 20)]),
}
if len(sys.argv) > 3: STATES = {k: v for k, v in STATES.items() if k in sys.argv[3:]}

def where(off, n):
    if isinstance(off, int): return off
    return n + int(off[3:]) if off[3] == '+' else n - int(off[4:])

def line_values(line, n_along, last, phase=0):
    axis, rid, i, off, anchor = line
    a = pp[rid]; L_ = a.shape[1] if axis == 'h' else a.shape[0]
    idx = np.arange(n_along)
    ix = (idx - last) % L_ if anchor == 'end' else (idx - int(anchor[6:])) % L_
    if axis == 'h': ix = (ix - phase) % L_
    return a[i, ix] if axis == 'h' else a[ix, i]

def predicted(st, w, h):
    """The box as the pens, face and hatch draw it (columns over rows)."""
    im = np.zeros((h, w, 4), int)
    if st.get('face', FACE) is not None: im[1:-1, 1:-1, :3] = FACE; im[1:-1, 1:-1, 3] = 128
    if 'hatch' in st:
        i, r, b = st['hatch']; a = pxm[1150][i]; hh, ww = a.shape[:2]
        x0, y0 = w - r - ww, h - b - hh
        for yy in range(1, h - 1):
            for xx in range(1, w - 1):
                if 0 <= yy - y0 < hh and 0 <= xx - x0 < ww and a[yy - y0, xx - x0, 3] == 255:
                    im[yy, xx, :3] = a[yy - y0, xx - x0, :3]
    for name, ln in st['lines'].items():
        if ln[0] == 'h':
            y = where(ln[3], h)
            if 0 <= y < h: im[y, :, :3] = line_values(ln, w, w - 1, st.get('phase', 0)); im[y, :, 3] = 255
    for name, ln in st['lines'].items():
        if ln[0] == 'v':
            x = where(ln[3], w)
            if 0 <= x < w: im[:, x, :3] = line_values(ln, h, h - 1); im[:, x, 3] = 255
    return im

def save(a, name):
    Image.fromarray(a.astype(np.uint8), 'RGBA' if a.shape[2] == 4 else 'RGB').save(os.path.join(OUT, name + '.png'), optimize=True)

for name, st in STATES.items():
    corners = None
    for f, x, y, w, h in st['samples']:
        ref = np.array(Image.open(os.path.join(CAP, f + '.png')).convert('RGB')).astype(int)[y:y + h, x:x + w]
        pen = predicted(st, w, h)
        c = np.zeros((2 * K, 2 * K, 4), int)
        for (cy, cx), (sy, sx) in {(0, 0): (0, 0), (0, 1): (0, w - K), (1, 0): (h - K, 0), (1, 1): (h - K, w - K)}.items():
            r = ref[sy:sy + K, sx:sx + K]; p = pen[sy:sy + K, sx:sx + K]
            diff = (r != p[..., :3]).any(-1) & (p[..., 3] > 0)
            blk = np.zeros((K, K, 4), int); blk[diff, :3] = r[diff]; blk[diff, 3] = 255
            c[cy * K:(cy + 1) * K, cx * K:(cx + 1) * K] = blk
        edge = pen[..., 3] == 255
        inner = edge.copy()
        inner[:K, :K] = inner[:K, -K:] = inner[-K:, :K] = inner[-K:, -K:] = False
        along = ((ref == pen[..., :3]).all(-1) | ~inner).mean()
        # Keep a corner pixel if any sample needs it (a pen can match it by chance).
        if corners is None: corners = c
        else:
            both = (corners[..., 3] == 255) & (c[..., 3] == 255)
            agree = (corners[both] == c[both]).all()
            corners[c[..., 3] == 255] = c[c[..., 3] == 255]
        print(f'{name}: {f} {x},{y} {w}x{h}: edges match {along:.3f}, corner pixels {int((c[..., 3] == 255).sum())}')
    for ln_name, (axis, rid, i, off, anchor) in st['lines'].items():
        a = pp[rid]
        save(a[i:i + 1] if axis == 'h' else a[:, i:i + 1], f'{name}-{ln_name}')
    save(corners, f'{name}-corners')
    for q, (cy, cx) in {'tl': (0, 0), 'tr': (0, 1), 'bl': (1, 0), 'br': (1, 1)}.items():
        save(corners[cy * K:(cy + 1) * K, cx * K:(cx + 1) * K], f'{name}-corner-{q}')
