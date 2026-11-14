"""Nine-slice frames for border-image, cut from real screens (classic eras).

Rounded Mac frames are pixel staircases that border-radius cannot draw (it
antialiases an arc). Each frame here is rebuilt from a capture: its four c x c
corners, one column and one row of each edge (taken where no label crosses)
and one pixel of face, written as a (2c + 1)-pixel square palette PNG that
border-image stretches back to any size. Colours listed as clear become
transparent (the paper round a ring, the gap inside it).

  .venv/bin/python tooling/frame-art.py     -> prints --clio-art-frame-* properties
"""
import base64, io, os
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), '..')
def load(era, name, mono=False):
    """mono: Infinite Mac tints 1-bit screens #222/#eee; threshold them back to black and white."""
    im = Image.open(os.path.join(ROOT, '.fidelity', era, name + '.png')).convert('RGB')
    return im.point(lambda v: 0 if v < 128 else 255) if mono else im

def outside(im, x0, y0, w, h, colour):
    """The pixels of one colour reachable from the crop's corners: what lies
    outside a rounded frame."""
    seen, todo = set(), [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]
    while todo:
        x, y = todo.pop()
        if (x, y) in seen or not (0 <= x < w and 0 <= y < h) or im.getpixel((x0 + x, y0 + y)) != colour: continue
        seen.add((x, y)); todo += [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]
    return seen

def nine(im, x0, y0, w, h, c, mx, my, clear=(), hole=None, out_colour=None, outer_only=False):
    """mx, my: the edge column and row to sample (crop coordinates); hole: a
    rectangle (crop coordinates) that is cleared, such as the button inside a ring;
    out_colour: clear that colour where it lies outside the frame."""
    n = 2 * c + 1
    out = Image.new('RGBA', (n, n))
    gone = outside(im, x0, y0, w, h, out_colour) if out_colour else set()
    # Inside the hole (the button within a ring) keep what shows outside the
    # button's rounded corners: reachable from the hole's corners without
    # crossing the button's dark frame.
    keep = set()
    if hole:
        hx, hy, hw, hh = hole
        todo = [(hx, hy), (hx + hw - 1, hy), (hx, hy + hh - 1), (hx + hw - 1, hy + hh - 1)]
        while todo:
            x, y = todo.pop()
            if (x, y) in keep or not (hx <= x < hx + hw and hy <= y < hy + hh): continue
            if sum(im.getpixel((x0 + x, y0 + y))) < 3 * 0x60: continue
            keep.add((x, y)); todo += [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]
    def px(x, y):
        if hole and (x, y) not in keep and hole[0] <= x < hole[0] + hole[2] and hole[1] <= y < hole[1] + hole[3]: return (0, 0, 0, 0)
        if (x, y) in gone: return (0, 0, 0, 0)
        p = im.getpixel((x0 + x, y0 + y))
        return (0, 0, 0, 0) if p in clear else p + (255,)
    for oy in range(n):
        for ox in range(n):
            sx = ox if ox < c else (mx if ox == c else w - (n - ox))
            sy = oy if oy < c else (my if oy == c else h - (n - oy))
            # outer_only: the edges keep just their outermost pixel (the frame line) and
            # the face is left out, for frames whose inside is not the same all along
            # (a pop-up's label part and arrow box); CSS draws that inside.
            if outer_only and (ox == c or oy == c) and not (ox in (0, n - 1) or oy in (0, n - 1)):
                out.putpixel((ox, oy), (0, 0, 0, 0)); continue
            out.putpixel((ox, oy), px(sx, sy))
    return out

def uri(im):
    cols = sorted({im.getpixel((x, y)) for x in range(im.width) for y in range(im.height)}, key=lambda c: c[3])
    p = Image.new('P', im.size)
    p.putpalette([v for c in cols for v in c[:3]], rawmode='RGB')
    idx = {c: i for i, c in enumerate(cols)}
    p.putdata([idx[im.getpixel((x, y))] for y in range(im.height) for x in range(im.width)])
    buf = io.BytesIO()
    bits = next(b for b in (1, 2, 4, 8) if len(cols) <= 1 << b)
    alpha = bytes(c[3] for c in cols if c[3] < 255)
    p.save(buf, 'PNG', bits=bits, **({'transparency': alpha} if alpha else {}))
    return 'url("data:image/png;base64,%s")' % base64.b64encode(buf.getvalue()).decode()

W, K = (255, 255, 255), (0, 0, 0)
frames = {}
s6 = load('system6', 'alert', mono=True)
# System 6 OK (Alert, 6.0.8): the button 84..143 x 158..177 inside its ring 80..147 x 154..181.
frames['s6-button'] = nine(s6, 84, 158, 60, 20, 4, 10, 10, out_colour=W)
# Held (Save dialog's Cancel, 164..223 x 158..177): solid ink, the same corners.
frames['s6-button-held'] = nine(load('system6', 'button-pressed', mono=True), 164, 158, 60, 20, 4, 6, 10, out_colour=W)
frames['s6-ring'] = nine(s6, 80, 154, 68, 28, 7, 10, 14, clear=(W,), hole=(4, 4, 60, 20))

# Platinum (Mac OS 9.0). "Set Desktop" in Appearance (534..619 x 369..388) for the
# button; GUIdebook's Mac OS 9.0 tiles (AI System 6, AIS6_DIR) for the default ring
# round OK and for a disabled button.
G = (0xdd, 0xdd, 0xdd)
tiles = os.path.join(os.environ.get('AIS6_DIR', '/Users/aaron/AI System 6'), 'internal/evidence/drafts/theme-lab-fidelity/platinum/tiles')
tile = lambda n: Image.open(os.path.join(tiles, n + '-reference.png')).convert('RGB')
appear = load('platinum9', 'appearance')
frames['p9-button'] = nine(appear, 534, 369, 86, 20, 4, 6, 10, out_colour=(0xee, 0xee, 0xee))
# Held: "Set Desktop" held with the pointer on its label, clear of the corners (frame button-held).
frames['p9-button-held'] = nine(load('platinum9', 'button-held'), 534, 369, 86, 20, 4, 6, 10, out_colour=(0xee, 0xee, 0xee))
ok = tile('default-ok')                      # 73x32; the button sits at (4, 7), 65x20
frames['p9-ring'] = nine(ok, 1, 4, 71, 26, 6, 20, 13, hole=(3, 3, 65, 20), out_colour=G)
frames['p9-button-disabled'] = nine(tile('button-disabled'), 0, 0, 80, 20, 4, 6, 10, out_colour=G)

# Pop-up menus (Mac OS 9.0): "Apple platinum" (Appearance tab, 288..467 x 143..162)
# and the disabled "Position Automatically" (Desktop tab, 407..600 x 337..356). Their
# faces stay CSS (the label and the arrow box are background layers).
frames['p9-popup'] = nine(load('platinum9', 'appearance-tab'), 288, 143, 180, 20, 3, 6, 10, out_colour=(0xee, 0xee, 0xee), outer_only=True)
frames['p9-popup-disabled'] = nine(appear, 407, 337, 194, 20, 3, 6, 10, out_colour=(0xee, 0xee, 0xee), outer_only=True)
# Open (Appearance > Fonts, "Charcoal" held: 333..493 x 143..162): the arrows' corners pressed.
# Its left corners and edge lie under the open menu and never show; the top and bottom
# edges are sampled under the arrows.
frames['p9-popup-open'] = nine(load('platinum9', 'fonts-popup-open'), 333, 143, 161, 20, 3, 150, 10, out_colour=(0xee, 0xee, 0xee), outer_only=True)

for k, im in frames.items():
    print('  --clio-art-frame-%s: %s; /* %dx%d, slice %d */' % (k, uri(im), im.width, im.height, im.width // 2))
