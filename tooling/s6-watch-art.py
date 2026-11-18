"""Write System 6's watch cursor from a System 6.0.8 System file, and check it.

System 6.0.8's System file carries the watch as six 16x16 1-bit 'CURS' resources
(258 to 263): a square face on a band, the hands turning from six o'clock round to
ten-thirty. It is a different drawing from System 7.5.3's and Mac OS 9.0's round
watch (CURS -20721..-20715), which clio.css used for every era until 0.12.1.

  python3 tooling/s6-watch-art.py --fork .fidelity/s608/System-rsrc.bin [--check]

The fork is extracted from the Mac System Software 6.0.8L floppies
(archive.org, mac-system-software-6.0.8-l.-7z); the System file stays in
.fidelity/ (git-ignored): it is Apple's.
"""
import os, sys, argparse
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
OUT = os.path.join(ROOT, 'art', 'cursors')
FIRST, COUNT = 258, 6


def parse_fork(fork):
    """The resource map's type list, then each resource's id -> body."""
    d_off, m_off, d_len, m_len = (int.from_bytes(fork[i:i + 4], 'big') for i in (0, 4, 8, 12))
    data = d_off
    tl = m_off + int.from_bytes(fork[m_off + 24:m_off + 26], 'big')
    n = int.from_bytes(fork[tl:tl + 2], 'big')
    out = {}
    for k in range(n):
        e = tl + 2 + k * 8
        typ = fork[e:e + 4]
        cnt = int.from_bytes(fork[e + 4:e + 6], 'big')
        ro = int.from_bytes(fork[e + 6:e + 8], 'big')
        for j in range(cnt):
            r = tl + ro + j * 12
            rid = int.from_bytes(fork[r:r + 2], 'big', signed=True)
            off = int.from_bytes(fork[r + 5:r + 8], 'big')
            out[(typ, rid)] = fork[data + off:data + off + 72]
    return out


def decode(body):
    """One 16x16 1-bit CURS (mask 32 bytes, then data 32) -> 16 rows of RGBA."""
    mask, data = body[8:40], body[40:72]
    rows = []
    for y in range(16):
        row = []
        for x in range(16):
            on = (mask[y * 2 + x // 8] >> (7 - x % 8)) & 1
            ink = (data[y * 2 + x // 8] >> (7 - x % 8)) & 1
            row.append((0, 0, 0, 255) if (on and ink) else ((255, 255, 255, 255) if on else (0, 0, 0, 0)))
        rows.append(row)
    return rows


def frames(res):
    return [decode(res[(b'CURS', FIRST + i)]) for i in range(COUNT)]


def write(rows, name):
    for scale, tag in ((1, ''), (2, '-2x'), (3, '-3x')):
        im = Image.new('RGBA', (16 * scale, 16 * scale))
        px = im.load()
        for y in range(16):
            for x in range(16):
                for dy in range(scale):
                    for dx in range(scale):
                        px[x * scale + dx, y * scale + dy] = rows[y][x]
        im.save(os.path.join(OUT, f'{name}{tag}.png'))
    return [os.path.join(OUT, f'{name}{tag}.png') for tag in ('', '-2x', '-3x')]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--fork', default=os.path.join(ROOT, '.fidelity/s608/System-rsrc.bin'))
    ap.add_argument('--check', action='store_true')
    a = ap.parse_args()
    if not os.path.exists(a.fork):
        sys.exit(f'no fork at {a.fork}')
    res = parse_fork(open(a.fork, 'rb').read())
    fr = frames(res)
    names = [f'watch6-{i + 1}' for i in range(COUNT)]
    files = ['watch6'] + names
    for name, rows in zip(files, [fr[0]] + fr):
        if a.check:
            for scale, tag in ((1, ''), (2, '-2x'), (3, '-3x')):
                got = Image.open(os.path.join(OUT, f'{name}{tag}.png')).convert('RGBA')
                if got.size != (16 * scale, 16 * scale):
                    sys.exit(f'{name}{tag}.png is {got.size}')
                px = got.load()
                for y in range(16):
                    for x in range(16):
                        for dy in range(scale):
                            for dx in range(scale):
                                if px[x * scale + dx, y * scale + dy] != rows[y][x]:
                                    sys.exit(f'{name}{tag}.png pixel {x},{y}')
            print(f'ok {name}{tag}')
        else:
            print('wrote', write(rows, name)[0])


if __name__ == '__main__':
    main()
