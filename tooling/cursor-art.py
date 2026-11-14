"""Cursors redrawn pixel for pixel from Infinite Mac frames (arrow: System 7.5.3
and Mac OS 9.0, identical; I-beam: Mac OS 9.0 Stickies). '#' black, '.' white,
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
for name, rows in (('arrow', ARROW), ('ibeam', IBEAM)):
    for s in (1, 2, 3):
        draw(rows, s).save(os.path.join(out, f"{name}{'' if s == 1 else f'-{s}x'}.png"), optimize=True)
print('wrote', len(os.listdir(out)), 'files')
