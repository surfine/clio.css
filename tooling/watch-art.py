"""Write the watch cursor's frames from a Mac OS System file, and check them.

The watch is not a 'crsr' but seven 16x16 1-bit 'CURS' resources: the Mac IIx's and
Mac OS 9.0's System both carry them at -20721 to -20715, the face turning from ten
o'clock round to one (Inside Macintosh: Imaging With QuickDraw, animated cursors). This
reads the System file's resource fork, writes art/cursors/watch-N{,-2x,-3x}.png, and
`--check` compares every pixel of the three sizes back to the resource.

  python3 tooling/watch-art.py --system .fidelity/re-appearance2/x/System [--check]

The System file stays in .fidelity/ (git-ignored): it is Apple's.
"""
import os, sys, argparse
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
OUT = os.path.join(ROOT, 'art', 'cursors')
FIRST, COUNT = -20721, 7


def read_resources(path):
    import importlib.util
    spec = importlib.util.spec_from_file_location('theme_resources', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'theme-resources.py'))
    tr = importlib.util.module_from_spec(spec); spec.loader.exec_module(tr)
    return tr.parse(tr.read_fork(path))


def decode(body):
    """One 16x16 1-bit CURS -> 16 rows of (r,g,b,a)."""
    mask, data = body[0:32], body[32:64]
    rows = []
    for y in range(16):
        row = []
        for x in range(16):
            on = (mask[y * 2 + x // 8] >> (7 - x % 8)) & 1
            ink = (data[y * 2 + x // 8] >> (7 - x % 8)) & 1
            row.append((0, 0, 0, 255) if (on and ink) else ((255, 255, 255, 255) if on else (0, 0, 0, 0)))
        rows.append(row)
    return rows


def write(frames):
    os.makedirs(OUT, exist_ok=True)
    for i, rows in enumerate(frames, 1):
        for s in (1, 2, 3):
            im = Image.new('RGBA', (16, 16))
            for y, row in enumerate(rows):
                for x, c in enumerate(row):
                    im.putpixel((x, y), c)
            if s > 1:
                im = im.resize((16 * s, 16 * s), Image.NEAREST)
            im.save(os.path.join(OUT, f"watch-{i}{'' if s == 1 else f'-{s}x'}.png"), optimize=True)


def check(frames):
    bad = 0
    for i, rows in enumerate(frames, 1):
        for s in (1, 2, 3):
            p = os.path.join(OUT, f"watch-{i}{'' if s == 1 else f'-{s}x'}.png")
            im = Image.open(p).convert('RGBA')
            if im.size != (16 * s, 16 * s):
                print(f"{p}: {im.size}"); bad += 1; continue
            for y in range(16 * s):
                for x in range(16 * s):
                    if im.getpixel((x, y)) != rows[y // s][x // s]:
                        bad += 1
    print("every pixel of %d frames at 1x, 2x and 3x equals the resource" % len(frames) if not bad else f"{bad} pixels differ")
    return 0 if not bad else 1


def main(argv):
    ap = argparse.ArgumentParser()
    ap.add_argument('--system', default=os.path.join(ROOT, '.fidelity/re-appearance2/x/System'))
    ap.add_argument('--check', action='store_true')
    a = ap.parse_args(argv)
    if not os.path.exists(a.system):
        print(f"System file not found: {a.system}", file=sys.stderr); return 2
    curs = dict((rid, b) for rid, name, b in read_resources(a.system).get('CURS', []))
    frames = [decode(curs[FIRST + i]) for i in range(COUNT)]
    if a.check:
        return check(frames)
    write(frames)
    print(f"wrote {COUNT} frames from CURS {FIRST}..{FIRST + COUNT - 1} to art/cursors/watch-N{{,-2x,-3x}}.png")
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
