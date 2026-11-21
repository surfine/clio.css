"""Draw an Appearance theme's window frame from its 'layo' resource (Mac OS 8.5 era).

  python3 tooling/theme-layout.py dump   <theme file> <layo id>
  python3 tooling/theme-layout.py render <theme file> <layo id> <width>x<height> <out.png>
  python3 tooling/theme-layout.py --check <theme file>

'layo' is undocumented; the layout below was read from the Drawing Board theme and
proved by drawing two windows and comparing them with 8.5 captures (--check):

  header    8 bytes, the guide count in the last two
  guide     16 bytes: kind, value, ref, clamp, -, limit, -, - (signed 16-bit)
            ref and limit name a guide (1-based) or the content rectangle's edge
            (-1 top, -2 left, -3 bottom, -4 right).
            kind 0: ref + value; kind 2: midway between ref and limit;
            kind 1: ref + value + the title's extent away from ref (half the
            title's width round a midway guide, else the font's height).
            clamp 1: not past limit (in the direction of the offset).
  part      40 bytes after 8 more header bytes: flags, -, kind, rect as four guides
            (top, left, bottom, right), -, resource type ('pxm#' or 'NULL'), id,
            anchor (1 top-left, 2 top-right, 3 bottom-left, 4 bottom-right), then
            the picture's index in the pxm# list first among seven words.
            A pxm# part tiles its picture from the anchor corner, clipped to the rect.

The flags of the boxes' and the collapsed frame's parts (which variant draws for
which window) are not decoded: a caller names the parts it draws. Nothing drawn
here is committed; the captures are local (.fidelity) and Apple's.
"""
import importlib.util, os, struct, sys
from PIL import Image, ImageChops

HERE = os.path.dirname(__file__)
spec = importlib.util.spec_from_file_location('tr', os.path.join(HERE, 'theme-resources.py'))
tr = importlib.util.module_from_spec(spec); spec.loader.exec_module(tr)


def load(theme):
    res = tr.parse(tr.read_fork(theme))
    cluts = {rid: tr.ctable(body, 0) for rid, _, body in res['clut']}
    pxm = {rid: tr.decode_pxm(body, cluts) for rid, _, body in res['pxm#']}
    return {rid: body for rid, _, body in res['layo']}, pxm


def parse(b):
    n = struct.unpack('>H', b[6:8])[0]
    guides = [struct.unpack('>8h', b[8 + i * 16:24 + i * 16]) for i in range(n)]
    parts, o = [], 16 + n * 16
    while o + 40 <= len(b):
        flags, _, kind, t, l, bo, r, _ = struct.unpack('>3H4hI', b[o:o + 18])
        typ = b[o + 18:o + 22].decode('mac_roman'); pid, anchor = struct.unpack('>hH', b[o + 22:o + 26])
        words = struct.unpack('>7h', b[o + 26:o + 40])
        parts.append(dict(off=o, flags=flags, kind=kind, rect=(t, l, bo, r), type=typ, id=pid, anchor=anchor, picture=words[0]))
        o += 40
    return guides, parts


def solve(guides, content, title):
    """content = (top, left, bottom, right); title = (width, font height)."""
    base = {-1: content[0], -2: content[1], -3: content[2], -4: content[3]}
    axis = {-1: 'v', -2: 'h', -3: 'v', -4: 'h'}
    val = {}

    def get(i):
        if i < 0: return base[i]
        if i in val: return val[i]
        kind, v, ref, clamp, _, limit, _, _ = guides[i - 1]
        if kind == 2:
            x = (get(ref) + get(limit)) // 2
        else:
            x = get(ref)
            ext = 0
            if kind == 1:
                mid = ref > 0 and guides[ref - 1][0] == 2
                ext = (title[0] // 2 if axis[ref] == 'h' and mid else title[1]) * (1 if v >= 0 else -1)
            x += v + ext
            if clamp == 1:
                x = min(x, get(limit)) if v + ext >= 0 else max(x, get(limit))
        axis[i] = axis[ref]; val[i] = x
        return x
    for i in range(1, len(guides) + 1): get(i)
    return lambda i: base[i] if i < 0 else val[i]


def draw(layo, pxm, rid, size, title=(60, 9), parts=None, skip=(), pad=40, inactive=False):
    """The frame round a content rectangle of size (w, h) at (pad, pad)."""
    guides, all_parts = parse(layo[rid])
    g = solve(guides, (0, 0, size[1], size[0]), title)
    im = Image.new('RGBA', (size[0] + 2 * pad, size[1] + 2 * pad), (0, 0, 0, 0))
    for p in all_parts:
        if p['type'] != 'pxm#' or p['off'] in skip or (parts is not None and p['off'] not in parts): continue
        t, l, b, r = (g(x) for x in p['rect'])
        t, b = sorted((t, b)); l, r = sorted((l, r)); w, h = r - l, b - t
        if w <= 0 or h <= 0: continue
        pics = pxm[p['id']]
        src = pics[min(p['picture'] + (1 if inactive else 0), len(pics) - 1)].convert('RGBA')
        right, bottom = p['anchor'] in (2, 4), p['anchor'] in (3, 4)
        x0 = w - src.width * -(-w // src.width) if right else 0
        y0 = h - src.height * -(-h // src.height) if bottom else 0
        tile = Image.new('RGBA', (w, h), (0, 0, 0, 0))
        for y in range(y0, h, src.height):
            for x in range(x0, w, src.width): tile.paste(src, (x, y), src)
        im.alpha_composite(tile, (l + pad, t + pad))
    return im


def compare(capture, im, origin, pad=40, mask=None):
    """Share of the drawing's opaque pixels equal to the capture, the content's
    top-left at origin; mask: rectangles (content coordinates) left out."""
    box = (origin[0] - pad, origin[1] - pad, origin[0] - pad + im.width, origin[1] - pad + im.height)
    cap = capture.convert('RGB').crop(box)
    drawn = im.getchannel('A').point(lambda a: 255 if a else 0)
    for x, y, w, h in mask or ():
        drawn.paste(0, (x + pad, y + pad, x + pad + w, y + pad + h))
    same = ImageChops.difference(cap, im.convert('RGB')).convert('L').point(lambda v: 255 if v == 0 else 0)
    good = ImageChops.multiply(same, drawn)
    n = drawn.histogram()[255]
    return good.histogram()[255], n


# Windows checked against captures: layo, content size and its top-left on the
# capture, the title (width, font height), the box parts this window draws, and
# what the application draws over the frame (content coordinates).
CHECKS = [
    # The Appearance SDK's side utility window (rc8 run, frame side3); its small size box.
    ('rc8/side3.png', 138, (237, 84), (504, 463), (60, 9), {0x840, 0x890, 0x8b8}, []),
    # The Application Switcher's palette; its title is text, not a piece.
    ('hig/drawingboard/switcher.png', 136, (150, 72), (614, 229), (82, 9), {0x7f8, 0x820, 0xa28}, [(34, -11, 71, 10)]),
]

if __name__ == '__main__':
    cmd = sys.argv[1]
    if cmd == '--check':
        layo, pxm = load(sys.argv[2])
        root = os.path.join(HERE, '..', '.fidelity')
        failed = 0
        for file, rid, size, origin, title, boxes, mask in CHECKS:
            guides, parts = parse(layo[rid])
            # the frame's parts: each piece's first part (the collapsed window's set
            # repeats the pieces round the title alone), and the boxes this window has
            frame, seen = set(), set()
            for p in parts:
                if p['type'] != 'pxm#' or p['id'] in (201, 211, 221, 450, 458) or p['id'] in seen: continue
                seen.add(p['id']); frame.add(p['off'])
            im = draw(layo, pxm, rid, size, title, parts=frame | boxes)
            same, n = compare(Image.open(os.path.join(root, file)), im, origin, mask=mask)
            ok = same == n; failed += not ok
            print('%-32s layo %d: %d of %d frame pixels equal%s' % (file, rid, same, n, '' if ok else '  FAIL'))
        sys.exit(1 if failed else 0)
    layo, pxm = load(sys.argv[2]); rid = int(sys.argv[3])
    if cmd == 'dump':
        guides, parts = parse(layo[rid])
        for i, gd in enumerate(guides, 1): print('guide %d' % i, gd)
        for p in parts: print('part @%04x' % p['off'], p)
    elif cmd == 'render':
        w, h = map(int, sys.argv[4].split('x'))
        draw(layo, pxm, rid, (w, h)).save(sys.argv[5])
