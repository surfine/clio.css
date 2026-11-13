# System 6 art drawn from pixel measurements of System 6.0.8 running in
# Infinite Mac (canvas read 1:1; see EVIDENCE.md). Prints CSS custom properties.
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

# Up scroll arrow in the 14x14 arrow box (HD and System Folder windows).
up_outline = {(6, 1)}
for r in range(2, 7): up_outline |= {(6 - (r - 1), r), (6 + (r - 1), r)}
up_outline |= {(x, 7) for x in (0, 1, 2, 3, 9, 10, 11, 12)}
for r in (8, 9, 10): up_outline |= {(3, r), (9, r)}
up_outline |= {(x, 11) for x in range(3, 10)}
def fill_of(outline):
    pts = set()
    for y in range(14):
        xs = sorted(x for x, yy in outline if yy == y)
        if len(xs) >= 2:
            for x in range(xs[0], xs[-1] + 1): pts.add((x, y))
    return pts
up_solid = fill_of(up_outline) | {(x, 7) for x in range(0, 13)}
def flip_v(p): return {(x, 13 - y) for x, y in p}
def rot_left(p): return {(y, x) for x, y in p}           # up -> left (transpose)
def rot_right(p): return {(13 - y, x) for x, y in p}     # down -> right
arrows = {
    "up": up_outline, "down": flip_v(up_outline),
    "left": rot_left(up_outline), "right": rot_right(flip_v(up_outline)),
}
solids = {
    "up": up_solid, "down": flip_v(up_solid),
    "left": rot_left(up_solid), "right": rot_right(flip_v(up_solid)),
}
out = []
for k in ("up", "down", "left", "right"):
    out.append((f"s6-{k}", svg(14, 14, [("#fff", solids[k] - arrows[k]), ("#000", arrows[k])])))
    out.append((f"s6-{k}-on", svg(14, 14, [("#000", solids[k])])))

# Close / zoom box while held: the starburst (11x11 incl. the frame).
burst = {(5, 1), (5, 2), (5, 3), (5, 7), (5, 8), (5, 9), (1, 5), (2, 5), (3, 5), (7, 5), (8, 5), (9, 5), (5, 5),
         (2, 2), (3, 3), (8, 2), (7, 3), (2, 8), (3, 7), (8, 8), (7, 7)}
out.append(("s6-burst", svg(11, 11, [("#000", burst)])))

# Scroll lane: QuickDraw ltGray ($88 $22): one dot in four, rows offset by two.
out.append(("s6-ltgray", svg(4, 2, [("#000", {(0, 0), (2, 1)}), ("#fff", {(1, 0), (2, 0), (3, 0), (0, 1), (1, 1), (3, 1)})])))

# Grow box: a 7x7 square at (2,2) drawn over a 9x9 square at (4,4), in 14x14.
def square(x0, y0, n): return {(x, y) for x in range(x0, x0 + n) for y in range(y0, y0 + n) if x in (x0, x0 + n - 1) or y in (y0, y0 + n - 1)}
small = square(2, 2, 7); big = square(4, 4, 9)
small_inside = {(x, y) for x in range(3, 8) for y in range(3, 8)}
grow_ink = small | (big - small_inside)
out.append(("s6-grow", svg(14, 14, [("#000", grow_ink)])))

# Menu check mark (Chicago check glyph, 9x8).
check = {(8, 0), (7, 1), (8, 1), (6, 2), (7, 2), (5, 3), (6, 3), (0, 4), (4, 4), (5, 4), (0, 5), (1, 5), (3, 5), (4, 5), (1, 6), (2, 6), (3, 6), (2, 7)}
out.append(("s6-menucheck", svg(9, 8, [("#000", check)])))
out.append(("s6-menucheck-on", svg(9, 8, [("#fff", check)])))

for k, v in out: print(f"  --clio-art-{k}: {v};")
