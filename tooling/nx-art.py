"""NeXTSTEP control art for clio.nextstep.css, redrawn pixel by pixel.

Each part below is a grid of letters in NeXTSTEP's four greys (2-bit display
PostScript): '#' black, 'd' dark grey #555555, 'a' light grey #aaaaaa, '.' white,
' ' transparent. A part's comment names where its pixels come from. Nothing here
is a screenshot or a crop: the grids are typed or read off a frame by `measure`
and the SVGs are drawn from them.

  python3 tooling/nx-art.py                 write the tokens into src/93-nextstep.css
  python3 tooling/nx-art.py measure FRAME x y w h
                                            print a frame's crop as a grid (frames stay
                                            in .fidelity/, which git ignores)
  python3 tooling/nx-art.py check FRAME     compare every part that names a frame crop
                                            with that crop (needs Pillow)
"""
import sys
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parent.parent
CSS = ROOT / "src/93-nextstep.css"
COLOURS = {"#": "#000", "d": "#555", "a": "#aaa", ".": "#fff"}
RGB = {(0, 0, 0): "#", (85, 85, 85): "d", (170, 170, 170): "a", (255, 255, 255): "."}

# name: (source, frame crop or None, grid). Frames are named as in .notes/nextstep.md.
ART = {
    # The title bar's miniaturize button, 15x15.
    "miniaturize": ("NeXTStep 3.0 in Infinite Mac, frame boot1 (File Viewer, key window)", ("ns30/boot1", 156, 16), """
..............d
.aaaaaaaaaaaad#
.a##########ad#
.a##########ad#
.a##########ad#
.a#aaaaaaaa#ad#
.a#aaaaaaaa#ad#
.a#aaaaaaaa#ad#
.a#aaaaaaaa#ad#
.a#aaaaaaaa#ad#
.a#aaaaaaaa#ad#
.a##########ad#
.aaaaaaaaaaaad#
.ddddddddddddd#
d##############
"""),
    # The close button, 15x15.
    "close": ("AI System 6 69-nextstep-appearance.css (--nextstep-close-art)", None, """
..............#
.aaaaaaaaaaaad#
.a#daaaaaad#ad#
.ad#daaaad#dad#
.aad#daad#daad#
.aaad#dd#daaad#
.aaaad##daaaad#
.aaaad##daaaad#
.aaad#dd#daaad#
.aad#daad#daad#
.ad#daaaad#dad#
.a#daaaaaad#ad#
.aaaaaaaaaaaad#
.ddddddddddddd#
###############
"""),
    # An edited document's close button: the X broken in the middle.
    "close-edited": ("AI System 6 assets/themes/nextstep/chrome/ns-close-edited-15.svg", None, """
..............#
.aaaaaaaaaaaad#
.a#daaaaaad#ad#
.ad#daaaad#dad#
.aad#aaaa#daad#
.aaaaaaaaaaaad#
.aaaaaaaaaaaad#
.aaaaaaaaaaaad#
.aaaaaaaaaaaad#
.aad#aaaa#daad#
.ad#daaaad#dad#
.a#daaaaaad#ad#
.aaaaaaaaaaaad#
.ddddddddddddd#
###############
"""),
    # A submenu item's arrow, 7x7.
    "submenu": ("NeXTStep 3.0 in Infinite Mac, frame boot1 (Workspace menu, Info row)", ("ns30/boot1", 80, 28), """
#d
# dd
#   dd
#     .
#   ..
# ..
#.
"""),
    # The pop-up list's mark, 11x8.
    "popup-mark": ("AI System 6 assets/themes/nextstep/chrome/ns-popup-mark-11x8.svg", None, """
........#
.aaaaaaad#
.aaaaaaad#d
.aaaaaaad#d
.dddddddd#d
#########dd
  ddddddddd
  ddddddddd
"""),
    # The scroller knob's dimple, 6x6.
    "dimple": ("AI System 6 assets/themes/nextstep/chrome/ns-knob-dimple-6.svg", None, """
 d###
d#dddd
#dd
#d  ..
#d ...
 d ..
"""),
    # A scroller arrow's triangle on its 16x16 button (up; down, left and right are
    # the same triangle turned about the button's face; the bevel is button()).
    "arrow-up": ("AI System 6 assets/themes/nextstep/chrome/ns-scroll-up-16.svg", None, """



       d
       #
      d#d
      ###
     d###d
     #####
    d#####d
    #######
   d#######d



"""),
    # The switch's check, 12x12, drawn on the raised square.
    "check": ("AI System 6 69-nextstep-appearance.css (--choice-checkmark-image)", None, """

         ##
         ##
        ##
       ###
      ###
 ##  ###
 ######
  ####
   ##


"""),
    # The radio button's ring, 12x12, and its dot.
    "radio": ("AI System 6 69-nextstep-appearance.css (--radio-image)", None, """

    dddd
   d    d
  d      d
 d        d
 d        d
 d        d
 d        d
  d      ..
   d    d.
    dddd.

"""),
    "radio-dot": ("AI System 6 69-nextstep-appearance.css (--radio-checked-image, a 2px circle at the centre)", None, """




     ##
    ####
    ####
     ##




"""),
}


def rows(grid):
    lines = grid.strip("\n").split("\n")
    w = max(len(r) for r in lines)
    return [r.ljust(w) for r in lines]


def turn(grid, k):
    """Rotate a grid by k quarter turns clockwise."""
    g = rows(grid)
    for _ in range(k % 4):
        g = ["".join(g[len(g) - 1 - j][i] for j in range(len(g))) for i in range(len(g[0]))]
    return "\n".join(g)


def svg(grid):
    g = rows(grid)
    w, h = len(g[0]), len(g)
    paths = []
    for letter, colour in COLOURS.items():
        d = ""
        for y, r in enumerate(g):
            x = 0
            while x < w:
                if r[x] == letter:
                    s = x
                    while x < w and r[x] == letter:
                        x += 1
                    d += f"M{s} {y}h{x - s}v1H{s}z"
                else:
                    x += 1
        if d:
            paths.append(f"<path fill='{colour}' d='{d}'/>")
    body = f"<svg xmlns='http://www.w3.org/2000/svg' width='{w}' height='{h}' shape-rendering='crispEdges'>{''.join(paths)}</svg>"
    return 'url("data:image/svg+xml,' + quote(body, safe="/:=' ") + '")'


def held(grid):
    """A pressed title-bar button: the light face turns white (the art's own rule)."""
    g = rows(grid)
    return "\n".join(r[0] + r[1:-2].replace("a", ".") + r[-2:] if 0 < i < len(g) - 2 else r for i, r in enumerate(g))


def button(glyph, w=16, h=16):
    """A raised NeXT button w x h: white top and left, #555 then black bottom and
    right, light grey face, the glyph laid on the face from (0, 0)."""
    g = [["a"] * w for _ in range(h)]
    for x in range(w):
        g[0][x], g[h - 2][x], g[h - 1][x] = ".", "d", "#"
    for y in range(h):
        g[y][0], g[y][w - 2], g[y][w - 1] = ".", "d", "#"
    g[0][w - 2], g[0][w - 1] = ".", "#"
    g[h - 2][0], g[h - 1][0] = ".", "#"
    for y, r in enumerate(rows(glyph)):
        for x, c in enumerate(r):
            if c != " ":
                g[y][x] = c
    return "\n".join("".join(r) for r in g)


def tokens():
    parts = dict((k, v[2]) for k, v in ART.items())
    up = ART["arrow-up"][2]
    for k, turns in (("arrow-up", 0), ("arrow-right", 1), ("arrow-down", 2), ("arrow-left", 3)):
        parts[k] = button(turn(up, turns))
    parts["miniaturize-held"] = held(ART["miniaturize"][2])
    parts["close-held"] = held(ART["close"][2])
    lines = [f"  --clio-art-nx-{k}: {svg(v)};" for k, v in parts.items()]
    return "\n".join(lines)


def write():
    text = CSS.read_text()
    a, b = "/* nx-art:begin (tooling/nx-art.py writes this block) */", "/* nx-art:end */"
    i, j = text.index(a) + len(a), text.index(b)
    CSS.write_text(text[:i] + "\n" + tokens() + "\n  " + text[j:])
    print(f"wrote {len(ART)} parts into {CSS.relative_to(ROOT)}")


def frame(name):
    from PIL import Image
    return Image.open(ROOT / ".fidelity" / f"{name}.png").convert("RGB")


def measure(name, x, y, w, h):
    im = frame(name)
    for j in range(y, y + h):
        print("".join(RGB.get(im.getpixel((i, j)), "?") for i in range(x, x + w)))


def check():
    bad = 0
    for k, (src, crop, grid) in ART.items():
        if not crop:
            continue
        im, (x, y) = frame(crop[0]), crop[1:]
        for j, r in enumerate(rows(grid)):
            for i, c in enumerate(r):
                if c != " " and RGB.get(im.getpixel((x + i, y + j))) != c:
                    bad += 1
                    print(f"{k}: ({i},{j}) grid {c} frame {im.getpixel((x + i, y + j))}")
        print(f"{k}: checked against {crop[0]} at {x},{y}")
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    if sys.argv[1:2] == ["measure"]:
        measure(sys.argv[2], *map(int, sys.argv[3:7]))
    elif sys.argv[1:2] == ["check"]:
        check()
    else:
        write()
