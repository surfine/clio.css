# Draws the Platinum tab as a 33x24 pixel map (16px left cap | 1px middle | 16px
# right cap) for border-image. Geometry measured from the GUIdebook Mac OS 9.0
# Appearance tab (AI System 6 specimen "selected-tab"): a 1px step every 3 rows,
# a 3-row corner, white inner highlight on the left, #888/#555 shading on the
# right. This is a drawing of that geometry, not a crop of the capture.
import sys
K, D, W, G, S = "#000", "#ccc", "#fff", "#888", "#555"

def selected(face):
    """Outline: groups of three rows step 1px; the first row of each group is
    the anti-aliased step (#222 edge, #bbb inside on the left; #bbb/#444/#222
    on the right), the other two are #000 with #ccc (left) or #ddd/#888
    (right) inside. Values read from the reference tile's pixels."""
    E2, B, DD = "#222", "#bbb", "#ddd"
    rows = [dict() for _ in range(24)]
    def put(y, x, c): rows[y][x] = c
    # left cap (x 0..15)
    put(1, 11, E2); [put(1, x, K) for x in range(12, 16)]
    put(2, 9, E2); put(2, 10, K); put(2, 11, B); [put(2, x, D) for x in range(12, 16)]
    put(3, 8, E2); put(3, 9, B); put(3, 10, D); [put(3, x, W) for x in range(11, 16)]
    put(4, 7, E2); put(4, 8, B); put(4, 9, W); put(4, 10, W); [put(4, x, face) for x in range(11, 16)]
    put(5, 7, K); put(5, 8, D); put(5, 9, W); [put(5, x, face) for x in range(10, 16)]
    for i, y0 in enumerate(range(6, 21, 3)):
        bx = 6 - i
        put(y0, bx, E2); put(y0, bx + 1, B); put(y0, bx + 2, W)
        for y in (y0 + 1, y0 + 2):
            put(y, bx, K); put(y, bx + 1, D); put(y, bx + 2, W)
        for y in range(y0, y0 + 3):
            for x in range(bx + 3, 16): put(y, x, face)
    put(21, 0, K); put(21, 1, E2); put(21, 2, B); put(21, 3, W)
    put(22, 0, K); put(22, 1, K); put(22, 2, D); put(22, 3, W)
    for y in (21, 22):
        for x in range(4, 16): put(y, x, face)
    for x in range(0, 3): put(23, x, D)
    for x in range(3, 16): put(23, x, face)
    # middle column (x=16)
    put(1, 16, K); put(2, 16, D); put(3, 16, W)
    for y in range(4, 24): put(y, 16, face)
    # right cap: local j -> x = 17 + j
    def r(y, j, c): put(y, 17 + j, c)
    for j in range(0, 5): r(1, j, K)
    for j in range(0, 4): r(2, j, D)
    r(2, 4, B); r(2, 5, K); r(2, 6, K)
    for j in range(0, 5): r(3, j, W)
    r(3, 5, DD); r(3, 6, G); r(3, 7, K)
    for j in range(0, 6): r(4, j, face)
    r(4, 6, B); r(4, 7, "#444"); r(4, 8, E2)
    for j in range(0, 6): r(5, j, face)
    r(5, 6, DD); r(5, 7, G); r(5, 8, K)
    for i, y0 in enumerate(range(6, 21, 3)):
        bx = 7 + i
        for y in range(y0, y0 + 3):
            for j in range(0, bx): r(y, j, face)
        r(y0, bx, B); r(y0, bx + 1, "#444"); r(y0, bx + 2, E2)
        for y in (y0 + 1, y0 + 2):
            r(y, bx, DD); r(y, bx + 1, G); r(y, bx + 2, K)
    for j in range(0, 12): r(21, j, face)
    r(21, 12, B); r(21, 13, "#444"); r(21, 14, K); r(21, 15, K)
    for j in range(0, 12): r(22, j, face)
    r(22, 12, DD); r(22, 13, B); r(22, 14, K); r(22, 15, K)
    for j in range(0, 13): r(23, j, face)
    for j in range(13, 16): r(23, j, D)
    return rows

def shifted(face, hi, base=True):
    # Unselected / pressed: the same outline 2 rows lower, a black baseline.
    src = selected(face)
    rows = [dict() for _ in range(24)]
    for y in range(0, 21):
        for x, c in src[y].items():
            rows[y + 2][x] = (hi if c == W else c)
    if base:
        rows[23] = {x: K for x in range(33)}
    return rows

def svg(rows):
    paths = {}
    for y, r in enumerate(rows):
        xs = sorted(r.items())
        i = 0
        while i < len(xs):
            x, c = xs[i]
            n = 1
            while i + n < len(xs) and xs[i + n] == (x + n, c):
                n += 1
            paths.setdefault(c, []).append(f"M{x} {y}h{n}v1h-{n}z")
            i += n
    body = "".join(f"<path fill='{c}' d='{''.join(d)}'/>" for c, d in paths.items())
    s = f"<svg xmlns='http://www.w3.org/2000/svg' width='33' height='24' shape-rendering='crispEdges'>{body}</svg>"
    return 'url("data:image/svg+xml,' + s.replace('#', '%23').replace('<', '%3C').replace('>', '%3E') + '")'

print("  --clio-art-p-tab-selected: " + svg(selected("#eee")) + ";")
print("  --clio-art-p-tab: " + svg(shifted("#ccc", "#ddd")) + ";")
print("  --clio-art-p-tab-pressed: " + svg(shifted("#666", "#888")) + ";")
