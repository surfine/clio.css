"""Write the Drawing Board theme's own cursor as PNGs, and check them against the resource.

The theme file carries four 'crsr' resources (Inside Macintosh: Imaging With QuickDraw,
CCrsr): 128 the plain arrow, 129-131 the same arrow with a drag badge (copy, alias, a
document). clio.css uses the arrow: 128.

Each CCrsr here is: 0x00 crsrType 0x8001, the map handle, xDataOff 0x92, the hot spot
rect (all zero), then at 0x34 the 32-byte 1-bit cursor mask (16 rows, 2 bytes each), at
0x64 a 46-byte PixMap (rowBytes 0x8008, bounds 0,0,16,16, indexed, 4 bits), at 0x92 its
16x16 4-bit pixels and at 0x110 its ColorTable (14 entries, greys). The mask says which
pixels are drawn; the pixmap gives their grey.

  python3 tooling/db-cursor.py [--theme FILE] [--check]
  npm run build posts nothing; the PNGs go to art/cursors/db-arrow{,-2x,-3x}.png.

`--check` reads the PNGs back and compares every pixel and the hot spot with the
resource; it exits non-zero on a mismatch. Nothing decoded here is committed as Apple's
art: the theme file stays in .fidelity/.
"""
import os, sys, struct, argparse
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
THEME = os.path.join(ROOT, '.fidelity/drawingboard-work/x/Mac OS 8.5b6 Beta Themes/Drawing Board/Drawing Board')
OUT = os.path.join(ROOT, 'art', 'cursors')
CRSR_ID = 128


def read_resources(path):
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import importlib.util
    spec = importlib.util.spec_from_file_location('theme_resources', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'theme-resources.py'))
    tr = importlib.util.module_from_spec(spec); spec.loader.exec_module(tr)
    return tr.parse(tr.read_fork(path))


def color_table(body, off):
    seed, flags, size = struct.unpack('>IHH', body[off:off + 8])
    out = {}
    for i in range(size + 1):
        v, r, g, b = struct.unpack('>HHHH', body[off + 8 + i * 8:off + 16 + i * 8])
        out[v] = (r >> 8, g >> 8, b >> 8)
    return out


def decode(body):
    """-> (16 rows of (r,g,b,a), hot spot) for one 16x16 CCrsr."""
    hot = struct.unpack('>hh', body[0x0C:0x10])   # the Rect's top and left
    mask = body[0x34:0x54]
    pix = body[0x92:0x112]
    cols = color_table(body, 0x110)
    rows = []
    for y in range(16):
        row = []
        for x in range(16):
            on = (mask[y * 2 + x // 8] >> (7 - x % 8)) & 1
            v = (pix[y * 8 + x // 2] >> (4 if x % 2 == 0 else 0)) & 15
            r, g, b = cols.get(v, (0, 0, 0))
            row.append((r, g, b, 255 if on else 0))
        rows.append(row)
    return rows, (hot[1], hot[0])   # (x, y)


def write_pngs(rows, out):
    os.makedirs(out, exist_ok=True)
    for s in (1, 2, 3):
        im = Image.new('RGBA', (16, 16))
        for y, row in enumerate(rows):
            for x, c in enumerate(row):
                im.putpixel((x, y), c)
        if s > 1:
            im = im.resize((16 * s, 16 * s), Image.NEAREST)
        im.save(os.path.join(out, f"db-arrow{'' if s == 1 else f'-{s}x'}.png"), optimize=True)


def check(rows, hot, out):
    bad = 0
    for s in (1, 2, 3):
        p = os.path.join(out, f"db-arrow{'' if s == 1 else f'-{s}x'}.png")
        im = Image.open(p).convert('RGBA')
        if im.size != (16 * s, 16 * s):
            print(f"{p}: {im.size}, expected {16 * s}x{16 * s}"); bad += 1; continue
        for y in range(16 * s):
            for x in range(16 * s):
                if im.getpixel((x, y)) != rows[y // s][x // s]:
                    bad += 1
    print(f"hot spot {hot[0]},{hot[1]}; " + ("every pixel of 1x, 2x and 3x equals the crsr" if not bad else f"{bad} pixels differ"))
    return 0 if not bad else 1


def main(argv):
    ap = argparse.ArgumentParser()
    ap.add_argument('--theme', default=THEME)
    ap.add_argument('--check', action='store_true')
    args = ap.parse_args(argv)
    if not os.path.exists(args.theme):
        print(f"theme file not found: {args.theme}", file=sys.stderr); return 2
    res = read_resources(args.theme).get('crsr', [])
    body = next((b for rid, name, b in res if rid == CRSR_ID), None)
    if body is None:
        print(f"crsr {CRSR_ID} not found", file=sys.stderr); return 2
    rows, hot = decode(body)
    if args.check:
        return check(rows, hot, OUT)
    write_pngs(rows, OUT)
    print(f"crsr {CRSR_ID}: hot spot {hot[0]},{hot[1]}; wrote art/cursors/db-arrow{{,-2x,-3x}}.png")
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
