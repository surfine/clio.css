"""Cursors redrawn pixel for pixel from Infinite Mac frames (arrow: System 7.5.3
and Mac OS 9.0, identical; I-beam: Mac OS 9.0 Stickies; watch: the first frame
of the spinning watch, System 7.5.3 and Mac OS 9.0 opening a Finder folder,
identical; its crown's two pixels inverted the screen, drawn black as on white). '#' black, '.' white,
' ' clear. Written at 1x, 2x and 3x (nearest neighbour) for image-set().
  python3 tooling/cursor-art.py"""
import os
from PIL import Image
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
ARROW = [
    "..        ",
    ".#.       ",
    ".##.      ",
    ".###.     ",
    ".####.    ",
    ".#####.   ",
    ".######.  ",
    ".#######. ",
    ".########.",
    ".#####.....",
    ".##.##.   ",
    ".#. .##.  ",
    "..  .##.  ",
    ".    .##. ",
    "     .##. ",
    "      ... ",
]
IBEAM = [
    "##   ##",
    "  # #  ",
    "   #   ", "   #   ", "   #   ", "   #   ", "   #   ", "   #   ",
    "   #   ", "   #   ", "   #   ", "   #   ", "   #   ", "   #   ",
    "  # #  ",
    "##   ##",
]
WATCH = [
    "  ######   ", "  ######   ", "  ######   ", "  ######   ",
    " #......#  ",
    "#....#...# ",
    "#....#...# ",
    "#....#...##",
    "#..###...##",
    "#........# ",
    "#........# ",
    " #......#  ",
    "  ######   ", "  ######   ", "  ######   ", "  ######   ",
]
def draw(rows, scale):
    w = max(len(r) for r in rows); im = Image.new('RGBA', (w * scale, len(rows) * scale))
    for y, r in enumerate(rows):
        for x, c in enumerate(r):
            if c in '#.':
                col = (0, 0, 0, 255) if c == '#' else (255, 255, 255, 255)
                for dy in range(scale):
                    for dx in range(scale): im.putpixel((x * scale + dx, y * scale + dy), col)
    return im
out = os.path.join(ROOT, 'art', 'cursors'); os.makedirs(out, exist_ok=True)
# NeXTSTEP (NeXTStep 3.0 in Infinite Mac): the arrow over the workspace (frame ns30b/edited),
# the Mac's but for its last row; the I-beam over Edit's text (frame ns30c/ibeam), black only,
# its crossbar on the hot spot's row (3, 8).
NX_ARROW = ARROW[:15] + ["      ..  "]
NX_IBEAM = ["##   ##", "  # #  "] + ["   #   "] * 6 + ["  ###  "] + ["   #   "] * 5 + ["  # #  ", "##   ##"]
for name, rows in (('arrow', ARROW), ('ibeam', IBEAM), ('watch', WATCH), ('nx-arrow', NX_ARROW), ('nx-ibeam', NX_IBEAM)):
    for s in (1, 2, 3):
        draw(rows, s).save(os.path.join(out, f"{name}{'' if s == 1 else f'-{s}x'}.png"), optimize=True)
print('wrote', len(os.listdir(out)), 'files')
