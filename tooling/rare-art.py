# Art for the rare controls, redrawn from pixel
# measurements in Infinite Mac (canvas read 1:1; see EVIDENCE.md):
#
#   python3 tooling/rare-art.py            prints CSS custom properties
#   python3 tooling/rare-art.py --png      also writes art/platinum/utility-collapse-side.png
#
# Rounded-corner window (rDocProc): the Calculator desk accessory in System 6.0.8,
# System 7.5.3, Mac OS 8.5 (Drawing Board) and Mac OS 9.0 draws the same window.
# Each corner of the outline steps in 5, 3, 2, 1, 1 pixels over its first five
# rows (QuickDraw's 16px round-rect oval); the 1px frame follows the inside of
# that curve, which is the same curve one pixel in.
import sys
sys.path.insert(0, __import__("os").path.dirname(__file__))
H = "xmlns='http://www.w3.org/2000/svg'"

def runs(pixels):
    rows = {}
    for x, y in pixels: rows.setdefault(y, []).append(x)
    d = ""
    for y, xs in sorted(rows.items()):
        xs.sort(); i = 0
        while i < len(xs):
            n = 1
            while i + n < len(xs) and xs[i + n] == xs[i] + n: n += 1
            d += f"M{xs[i]} {y}h{n}v1h-{n}z"; i += n
    return d

def svg(w, h, layers):
    body = "".join(f"<path fill='{c}' d='{runs(p)}'/>" for c, p in layers if p)
    s = f"<svg {H} width='{w}' height='{h}' shape-rendering='crispEdges'>{body}</svg>"
    return 'url("data:image/svg+xml,' + s.replace('#', '%23').replace('<', '%3C').replace('>', '%3E') + '")'

N = 6
OUT = [5, 3, 2, 1, 1, 0]            # outline's first pixel in each of the corner's rows
inside = {(x, y) for y in range(N) for x in range(N) if x >= OUT[y]}
# The frame: on each row, from the outline to the curve one pixel in.
frame = set()
for y in range(N):
    inner = N if y == 0 else min(N, 1 + OUT[y - 1])
    for x in range(OUT[y], max(OUT[y] + 1, inner)): frame.add((x, y))
flips = {
    "tl": lambda x, y: (x, y),
    "tr": lambda x, y: (N - 1 - x, y),
    "bl": lambda x, y: (x, N - 1 - y),
    "br": lambda x, y: (N - 1 - x, N - 1 - y),
}
out = []
for k, f in flips.items():
    out.append((f"rdoc-mask-{k}", svg(N, N, [("#000", {f(x, y) for x, y in inside})])))
    out.append((f"rdoc-frame-{k}", svg(N, N, [("#000", {f(x, y) for x, y in frame})])))

for k, v in out: print(f"  --clio-art-{k}: {v};")

# Side-title utility window (Mac OS 9.0, the Appearance SDK's sample, frame side3):
# its collapse box at the foot of the side bar is the title-bar collapse box
# (art/platinum/utility-collapse.png, from the Application Switcher) turned on its
# diagonal: the measured 10x10 box is that picture transposed, pixel for pixel.
if "--png" in sys.argv:
    from PIL import Image
    import os
    root = os.path.join(os.path.dirname(__file__), "..")
    src = Image.open(os.path.join(root, "art/platinum/utility-collapse.png"))
    src.transpose(Image.Transpose.TRANSPOSE).save(os.path.join(root, "art/platinum/utility-collapse-side.png"))
