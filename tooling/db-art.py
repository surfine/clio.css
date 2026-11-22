"""Drawing Board control art, redrawn pixel for pixel from the theme's own pixmaps.

  python3 tooling/db-art.py "<Drawing Board theme file>"

Reads the 'pxm#' resources of the Mac OS 8.5b6 Drawing Board theme (decoded by
tooling/theme-resources.py) and prints CSS custom properties: each control part
as a palette PNG in a data URI, re-encoded from the decoded pixels and mask.
Only control-sized parts (boxes, check boxes, radio buttons, arrows, tab ends);
the large paper and sketch textures are not reproduced (see AGENTS.md).
"""
import base64, importlib.util, io, os, sys
from PIL import Image

HERE = os.path.dirname(__file__)
spec = importlib.util.spec_from_file_location('tr', os.path.join(HERE, 'theme-resources.py'))
tr = importlib.util.module_from_spec(spec); spec.loader.exec_module(tr)

res = tr.parse(tr.read_fork(sys.argv[1]))
cluts = {rid: tr.ctable(body, 0) for rid, _, body in res['clut']}
pxm = {rid: tr.decode_pxm(body, cluts) for rid, _, body in res['pxm#']}

def uri(im):
    im = im.convert('RGBA')
    buf = io.BytesIO()
    # Exact colours: a palette image keeps every pixel as decoded.
    px = [im.getpixel((x, y)) for y in range(im.height) for x in range(im.width)]
    px = [c if c[3] else (0, 0, 0, 0) for c in px]
    pal = sorted(set(px), key=lambda c: c[3])          # transparent entry first
    if len(pal) <= 256:
        p = Image.new('P', im.size)
        p.putpalette([v for c in pal for v in c[:3]], rawmode='RGB')
        idx = {c: i for i, c in enumerate(pal)}
        p.putdata([idx[c] for c in px])
        bits = next(b for b in (1, 2, 4, 8) if len(pal) <= 1 << b)
        p.save(buf, 'PNG', bits=bits, transparency=bytes(c[3] for c in pal if c[3] < 255) or None)
    else:
        im.save(buf, 'PNG', optimize=True)
    return 'url("data:image/png;base64,%s")' % base64.b64encode(buf.getvalue()).decode()

def hstack(*ims):
    w = sum(i.width for i in ims); h = max(i.height for i in ims)
    out = Image.new('RGBA', (w, h)); x = 0
    for i in ims: out.paste(i, (x, 0)); x += i.width
    return out

art = {
    'db-close': pxm[200][0], 'db-close-on': pxm[200][1],
    'db-collapse': pxm[210][0], 'db-collapse-on': pxm[210][1],
    'db-zoom': pxm[220][0], 'db-zoom-on': pxm[220][1],
    'db-check': pxm[300][0], 'db-check-on': pxm[300][1], 'db-check-mixed': pxm[300][3],
    'db-check-pressed': pxm[300][4], 'db-check-on-pressed': pxm[300][5],
    'db-check-disabled': pxm[300][8], 'db-check-on-disabled': pxm[300][9],
    'db-radio': pxm[310][0], 'db-radio-on': pxm[310][1], 'db-radio-on-pressed': pxm[310][2],
    'db-radio-disabled': pxm[310][3], 'db-radio-on-disabled': pxm[310][4],
    'db-up': pxm[321][0], 'db-up-on': pxm[321][1], 'db-up-off': pxm[321][2],
    'db-down': pxm[322][0], 'db-down-on': pxm[322][1], 'db-down-off': pxm[322][2],
    'db-left': pxm[331][0], 'db-left-on': pxm[331][1], 'db-left-off': pxm[331][2],
    'db-right': pxm[332][0], 'db-right-on': pxm[332][1], 'db-right-off': pxm[332][2],
    # Smart Scrolling: both arrows in one picture at the far end (states as the single
    # arrows': 0 normal, 1 the second arrow held, 2 dimmed, 4 the first held).
    'db-hpair': pxm[334][0], 'db-hpair-inc-on': pxm[334][1], 'db-hpair-off': pxm[334][2], 'db-hpair-dec-on': pxm[334][4],
    'db-vpair': pxm[324][0], 'db-vpair-inc-on': pxm[324][1], 'db-vpair-off': pxm[324][2], 'db-vpair-dec-on': pxm[324][4],
    'db-popup-arrow': pxm[356][0], 'db-popup-arrow-off': pxm[356][2],
    'db-submenu': pxm[250][0],
    'db-grow': pxm[452][0],
    # ButtonFaceCorner: image 2 is the hatched corner of a pop-up button, image 0
    # that of a push button (both found in the capture, clipped to the face).
    'db-popup-corner': pxm[1150][2], 'db-popup-corner-off': pxm[1150][3], 'db-button-corner': pxm[1150][0],
    # The pencil overruns at a push button's corners (Button*, *Default), found 1:1
    # round "Save Theme…" and Energy Saver's default "Close Message".
    'db-btn-tl': pxm[1151][0], 'db-btn-tr': pxm[1152][0], 'db-btn-br': pxm[1153][0], 'db-btn-bl': pxm[1154][0], 'db-btn-br-held': pxm[1153][1],
    'db-progress-arrows': pxm[6243][0],   # the indeterminate bar's arrows (128x5), found 1:1 in the Finder copy window
    'db-def-tl': pxm[1160][0], 'db-def-tr': pxm[1161][0], 'db-def-br': pxm[1162][0], 'db-def-bl': pxm[1163][0],
    # Scroll box ends, grip and stretch (HThumb*/VThumb*), found in the capture.
    # Mac OS draws these, and the collapse box, through a 16-bit buffer:
    # each channel keeps 5 bits (#eee6d5 in the theme shows as #efe7d6), so
    # they are quantised the same way.
    'db-thumb-left': pxm[1113][0], 'db-thumb-right': pxm[1112][0],
    'db-thumb-hgrip': pxm[1115][0], 'db-thumb-hstretch': pxm[1114][0],
    'db-thumb-top': pxm[1116][0], 'db-thumb-bottom': pxm[1117][0],
    'db-thumb-vgrip': pxm[1119][0], 'db-thumb-vstretch': pxm[1118][0],
}
# The menu check mark is no pixmap: Mac OS 8.5 draws the menu font's check glyph in the
# menu's ink, #313131 (popup-open.png: the mark's solid pixels are 49,49,49 and its edges
# that ink's coverage over the paper). The glyph is Platinum's (tooling/p9-art.py, kept in
# src/90-platinum.css as --clio-art-p9-menucheck), recoloured.
def _menucheck():
    import re
    css = open(os.path.join(HERE, '..', 'src', '90-platinum.css')).read()
    b64 = re.search(r'--clio-art-p9-menucheck: url\("data:image/png;base64,([^"]+)"\)', css).group(1)
    im = Image.open(io.BytesIO(base64.b64decode(b64))).convert('RGBA')
    im.putdata([(0x31, 0x31, 0x31, a) if a else (0, 0, 0, 0) for (_, _, _, a) in im.getdata()])
    return im
art['db-menucheck'] = _menucheck()
# Tabs (NTabLeft 6x25, NTabRight 17x27; image 0 is the front tab, 1 a back
# tab, 2 pressed). In the capture the right end sits 2px above the left end,
# so the left end is dropped 2px. The 1px stretch between them is the right
# end's first column from the top rule down (its sketch overrun above the rule
# left out).
for state, i in (('', 1), ('-selected', 0), ('-pressed', 2)):
    L, R = pxm[1200][i], pxm[1201][i]
    L2 = Image.new('RGBA', (L.width, R.height)); L2.paste(L, (0, 2))
    M = Image.new('RGBA', (1, R.height))
    for y in range(6, R.height): M.putpixel((0, y), R.getpixel((0, y if y < 7 else 16)))
    art['db-tab' + state] = hstack(L2, M, R)
# Menu selection is a pencil underline, not an inverse bar.
# Left, centre and right pieces (Menu_Item_Underline_*, Menu_Title_Underline_*).
art['db-menu-underline-left'] = pxm[6101][0]
art['db-menu-underline'] = pxm[6103][0]
art['db-menu-underline-right'] = pxm[6102][0]
art['db-title-underline-left'] = pxm[6107][0]
art['db-title-underline'] = pxm[6108][0]
art['db-title-underline-right'] = pxm[6109][0]
TILED = ['db-menu-underline', 'db-title-underline']
def five_bit(im):
    im = im.convert('RGBA'); q = lambda v: ((v >> 3) << 3) | (v >> 5)
    im.putdata([(q(r), q(g), q(b), a) for r, g, b, a in im.getdata()]); return im
# The scroll box and the collapse box (the close box shows its own colours; the
# zoom box was not on screen and keeps its own).
for k in [k for k in art if k.startswith(('db-thumb-', 'db-collapse'))]: art[k] = five_bit(art[k])
# Disclosure triangles (Finder list view): closed as drawn, open through 16 bits.
art['db-disclosure'] = pxm[340][0]; art['db-disclosure-open'] = five_bit(pxm[343][0])
# Slider thumb pointing down (Keyboard, Key Repeat Rate), through 16 bits.
art['db-slider-thumb'] = five_bit(pxm[1106][0])
# Little arrows (Date & Time): normal, up held, down held, dimmed; through 16 bits.
for i, st in enumerate(('', '-up', '-down', '-disabled')): art['db-little-arrows' + st] = five_bit(pxm[350][i])
# Chasing arrows: the theme's six 16x16 frames side by side.
art['db-chasing-arrows'] = hstack(*[pxm[390][i] for i in range(6)])
# A menu's scroll arrows (Control Panels submenu): down 364, up 389.
art['db-menu-scroll-down'] = pxm[364][0]; art['db-menu-scroll-up'] = pxm[389][0]
# Larger theme art ships as PNG files beside the stylesheet (art/drawingboard/),
# not inside it: the document window's nine frame pieces (active, and the
# inactive ones where the theme has them) and the paper pattern behind content.
FILES = {
    'window-tl': (6176, 0), 'window-top': (6177, 0), 'window-tr': (6178, 0), 'window-ur': (6184, 0),
    'window-right': (6179, 0), 'window-br': (6180, 0), 'window-bottom': (6181, 0), 'window-bl': (6182, 0),
    'window-left': (6183, 0),
    'window-tl-inactive': (6176, 1), 'window-top-inactive': (6177, 1), 'window-tr-inactive': (6178, 1),
    'window-ur-inactive': (6184, 1), 'window-right-inactive': (6179, 1), 'window-br-inactive': (6180, 1),
    'window-bottom-inactive': (6181, 1), 'window-bl-inactive': (6182, 1), 'window-left-inactive': (6183, 1),
    # Alert frame (Energy Saver's start-up notice, found 1:1) and the modal
    # dialog frame, whose pieces have the alert's sizes.
    'alert-tl': (6127, 0), 'alert-top': (6132, 0), 'alert-tr': (6128, 0), 'alert-right': (6133, 0),
    'alert-br': (6129, 0), 'alert-bottom': (6134, 0), 'alert-bl': (6130, 0), 'alert-left': (6131, 0),
    'modal-tl': (6135, 0), 'modal-top': (6140, 0), 'modal-tr': (6136, 0), 'modal-right': (6141, 0),
    'modal-br': (6137, 0), 'modal-bottom': (6142, 0), 'modal-bl': (6138, 0), 'modal-left': (6139, 0),
    'menubar': (6104, 0),          # 630x27, tiled from the screen's left; the bar shows its top 22 rows
}
if '--files' in sys.argv:
    out = os.path.join(HERE, '..', 'art', 'drawingboard'); os.makedirs(out, exist_ok=True)
    ppats = {rid: tr.decode_ppat(body) for rid, _, body in res['ppat']}
    def save(im, name, to=None):
        im = im.convert('RGBA')
        px = [im.getpixel((x, y)) for y in range(im.height) for x in range(im.width)]
        px = [c if c[3] else (0, 0, 0, 0) for c in px]
        pal = sorted(set(px), key=lambda c: c[3])
        to = to or os.path.join(out, name + '.png')
        if len(pal) <= 256:
            p = Image.new('P', im.size); p.putpalette([v for c in pal for v in c[:3]], rawmode='RGB')
            idx = {c: i for i, c in enumerate(pal)}; p.putdata([idx[c] for c in px])
            alpha = bytes(c[3] for c in pal if c[3] < 255)
            p.save(to, 'PNG', optimize=True, **({'transparency': alpha} if alpha else {}))
        else:
            im.save(to, 'PNG', optimize=True)
    def png_uri(im):
        buf = io.BytesIO(); save(im, None, buf)
        return 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode()
    for name, (rid, i) in FILES.items():
        save(pxm[rid][min(i, len(pxm[rid]) - 1)], name)
    # Side-title utility window, as the theme's 'layo' 138 (ActiveSideFloatingWindow)
    # lays it out: rectangles on guides from the content's edges, each piece tiled from
    # one corner and clipped to its rectangle (tooling/theme-layout.py renders it; 100%
    # of the frame against the 8.5 capture rc8/side3). The column is the small system
    # font's height (9) plus 5 wide, so its pieces show their first 14 columns and the
    # left edge pieces their last one. 'layo' 139 (inactive) is the same pictures and
    # no boxes. Three SVGs for the window's ::before, the PNGs inside them (an SVG used
    # as an image may not fetch another file): the four corner groups, anchored to the
    # box's corners by nested viewports; the two runs between them along the top and
    # the foot (drawn in a box from x=30 to 36px before the right); the column's middle
    # and the right edge's (in a box from y=29 to 41px before the foot).
    def group(w, h, *pieces):
        g = Image.new('RGBA', (w, h), (0, 0, 0, 0))
        for rid, box, x, y in pieces:
            im = pxm[rid][0]; im = im.crop(box) if box else im; g.alpha_composite(im.convert('RGBA'), (x, y))
        return g
    def img(im, x, y): return "<image x='%d' y='%d' width='%d' height='%d' href='%s'/>" % (x, y, im.width, im.height, png_uri(im))
    def run(i, im, x, y, w, h):   # a piece tiled from (x, y) across a w x h rectangle
        return ("<pattern id='p%d' x='%d' y='%d' width='%d' height='%d' patternUnits='userSpaceOnUse'>%s</pattern>"
                "<rect x='%d' y='%d' width='%s' height='%s' fill='url(#p%d)'/>") % (i, x, y, im.width, im.height, img(im, 0, 0), x, y, w, h, i)
    def svg(body, name):
        open(os.path.join(out, name + '.svg'), 'w').write(
            "<svg xmlns='http://www.w3.org/2000/svg' style='image-rendering:pixelated'>%s</svg>" % body)
    tl = group(30, 29, (6205, (0, 0, 16, 19), 1, 0), (6213, None, 17, 5),
               (6206, (0, 0, 14, 10), 3, 19), (6204, (4, 0, 5, 10), 17, 19))
    bl = group(30, 41, (6208, (0, 0, 14, 33), 3, 0), (6202, (4, 0, 5, 33), 17, 0),
               (6209, (0, 0, 17, 8), 0, 33), (6214, None, 17, 33))
    tr = group(36, 27, (6193, None, 0, 3), (6194, None, 29, 0), (6195, None, 29, 17))
    br = group(36, 41, (6197, None, 29, 0), (6199, None, 0, 33), (6198, None, 29, 33))
    end = "<svg x='100%%' y='%s' overflow='visible'>%s</svg>"
    svg(img(tl, 0, 0) + "<svg y='100%' overflow='visible'>" + img(bl, 0, -41) + "</svg>"
        + end % (0, img(tr, -36, 2)) + end % ('100%', img(br, -36, -41)), 'side-frame')
    svg(run(0, pxm[6192][0], 0, 5, '100%', 4)
        + "<svg y='100%' overflow='visible'>" + run(1, pxm[6200][0], 0, -8, '100%', 5) + "</svg>", 'side-runs')
    svg(run(0, group(15, 256, (6207, (0, 0, 14, 256), 0, 0), (6203, (4, 0, 5, 256), 14, 0)), 3, 0, 15, '100%')
        + end % (0, run(1, pxm[6196][0], -7, 0, 5, '100%')), 'side-edges')
    # The boxes (pxm 201, and 211's upright pictures): close and collapse side by
    # side, their pressed pictures below.
    boxes = Image.new('RGBA', (18, 18), (0, 0, 0, 0))
    for rid, i, x, y in ((201, 0, 0, 0), (211, 2, 9, 0), (201, 1, 0, 9), (211, 3, 9, 9)):
        boxes.alpha_composite(pxm[rid][i].convert('RGBA'), (x, y))
    save(boxes, 'side-boxes')
    # Top-title utility window, as 'layo' 136 (ActiveFloatingWindow) lays it out (the
    # Application Switcher's palette: 3080 frame pixels equal, theme-layout.py --check).
    # The frame round a content rectangle W x H: 8px left, 19px above, 7px right (the
    # last 2 a shade), 8px below. The title bar's pieces show their top 13 rows, the
    # rule is 6192's bottom row; the line under it belongs to the content.
    def rows(rid, top, n): im = pxm[rid][0]; return im.crop((0, top, im.width, top + n))
    tl = Image.new('RGBA', (20, 38), (0, 0, 0, 0))
    for im, x, y in ((pxm[6187][0].crop((0, 0, 18, 18)), 1, 0), (pxm[6210][0].crop((0, 0, 17, 10)), 3, 18), (pxm[6204][0], 3, 28)):
        tl.alpha_composite(im.convert('RGBA'), (x, y))
    tr = Image.new('RGBA', (36, 38), (0, 0, 0, 0))
    for im, x, y in ((rows(6189, 0, 13), 0, 5), (rows(6193, 3, 1), 0, 18), (rows(6190, 0, 16), 29, 2),
                     (rows(6211, 0, 10), 29, 18), (pxm[6195][0], 29, 28)):
        tr.alpha_composite(im.convert('RGBA'), (x, y))
    bl = group(20, 41, (6202, None, 3, 0), (6201, None, 0, 33))
    br = group(36, 41, (6197, None, 29, 0), (6199, None, 0, 33), (6198, None, 29, 33))
    svg(img(tl, 0, 0) + "<svg y='100%' overflow='visible'>" + img(bl, 0, -41) + "</svg>"
        + end % (0, img(tr, -36, 0)) + end % ('100%', img(br, -36, -41)), 'utility-frame')
    svg(run(0, rows(6188, 0, 13), 0, 5, '100%', 13) + run(1, rows(6192, 3, 1), 1, 18, '100%', 1)
        + "<svg y='100%' overflow='visible'>" + run(2, pxm[6200][0], 1, -8, '100%', 5) + "</svg>", 'utility-runs')
    svg(run(0, pxm[6203][0], 3, 0, 5, '100%') + end % (0, run(1, pxm[6196][0], -7, 0, 5, '100%')), 'utility-edges')
    # Its boxes: close, zoom (221's both-ways picture) and collapse; pressed below.
    boxes = Image.new('RGBA', (27, 18), (0, 0, 0, 0))
    for rid, x in ((201, 0), (221, 9), (211, 18)):
        for i in (0, 1): boxes.alpha_composite(pxm[rid][i].convert('RGBA'), (x, 9 * i))
    save(boxes, 'utility-boxes')
    # Window paper (ppat 7120): origin at the content's top-left (Date & Time,
    # Appearance and Finder Preferences windows agree).
    save(ppats[7120], 'paper')
    # Tab pane paper (ppat 7115). The capture only ever shows its first 64 rows,
    # repeating every 64 from the pane's top (Appearance, Finder Preferences).
    save(ppats[7115].crop((0, 0, 256, 64)), 'tab-paper')
    # Menus: paper (ppat 7125) from the inside top-left, a pencil frame drawn
    # with pattern pens (ppat 129-133, 128px). Found in the File, Edit, Apple
    # and Control Panels menus: the left pen from the menu's top, the right pen
    # and its 2px shade from 4px lower, the foot and its shade from 4px in.
    def rows(im, *rs):
        out = Image.new('RGB', (im.width, len(rs)))
        for i, r in enumerate(rs): out.paste(im.crop((0, r, im.width, r + 1)), (0, i))
        return out
    def cols(im, *cs):
        out = Image.new('RGB', (len(cs), im.height))
        for i, c in enumerate(cs): out.paste(im.crop((c, 0, c + 1, im.height)), (i, 0))
        return out
    save(ppats[7125], 'menu-paper')
    save(rows(ppats[132], 0), 'menu-top')
    save(cols(ppats[129], 0), 'menu-left')
    save(cols(ppats[130], 2), 'menu-right')
    save(cols(ppats[130], 0, 1), 'menu-shade-right')
    save(rows(ppats[131], 2), 'menu-foot')
    save(rows(ppats[131], 3, 1), 'menu-shade-foot')
    save(rows(ppats[133], 0), 'menu-separator')
    # Scroll bar tracks: 16px of #ece6e4 ruled by pattern pens, tiled from the
    # track's start (a list's vertical bar; the Themes tab's horizontal bar,
    # which Mac OS drew half a tile along): edges ppat 7049 / 7046, the double
    # centre line ppat 7048 / 7045.
    save(rows(ppats[7024], 0), 'slider-track')   # the slider's 1px pencil track (Keyboard)
    save(rows(ppats[7049], 0), 'track-h-top'); save(rows(ppats[7049], 1), 'track-h-bottom')
    save(rows(ppats[7048], 0), 'track-h-mid1'); save(rows(ppats[7048], 1), 'track-h-mid2')
    save(cols(ppats[7046], 0), 'track-v-left'); save(cols(ppats[7046], 1), 'track-v-right')
    save(cols(ppats[7045], 0), 'track-v-mid1'); save(cols(ppats[7045], 1), 'track-v-mid2')
    # Where the pens meet, Mac OS draws a few fixed pencil pixels (identical
    # round the File and Edit menus): the right line darkens and the shade
    # starts a row early at the top right, the foot's first 4px darken and the
    # shade starts a column early at the bottom left, and a 3x3 bottom right.
    def grid(rows_):
        im = Image.new('RGBA', (len(rows_[0]), len(rows_)), (0, 0, 0, 0))
        for y, r in enumerate(rows_):
            for x, c in enumerate(r):
                if c: im.putpixel((x, y), tuple(int(c[i:i + 2], 16) for i in (0, 2, 4)) + (255,))
        return im
    save(grid([['220000', None, None], ['220000', 'c3b59a', '999966']]), 'menu-corner-tr')
    save(grid([['333300', 'baaa94', '000000'], ['cfc0a3', '756f66', '222222'], ['333333', '222222', '756f66']]), 'menu-corner-br')
    save(grid([['663333'] * 4, [None, None, None, '000000'], [None, None, None, '666633']]), 'menu-corner-bl')
    # The window's top and bottom edges as SVG patterns of themselves, so a background of
    # any width tiles them from its own left and stops where its box stops (a collapsed
    # window draws them in a box of their own, not under a clip). The PNG rides inside:
    # an SVG used as an image may not fetch another file.
    def tiled_svg(name):
        im = Image.open(os.path.join(out, name + '.png')).convert('RGBA')
        buf = io.BytesIO(); im.save(buf, 'PNG', optimize=True)
        png = 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode()
        svg = ("<svg xmlns='http://www.w3.org/2000/svg'><defs><pattern id='p' width='%d' height='%d' "
               "patternUnits='userSpaceOnUse'><image image-rendering='pixelated' style='image-rendering:pixelated' width='%d' height='%d' href='%s'/></pattern></defs>"
               "<rect width='100%%' height='100%%' fill='url(#p)'/></svg>") % (im.width, im.height, im.width, im.height, png)
        open(os.path.join(out, name + '-tiled.svg'), 'w').write(svg)
    for n in ('window-top', 'window-top-inactive', 'window-bottom', 'window-bottom-inactive'): tiled_svg(n)
    # The control art too, as files (the stylesheet's --clio-art-db-* point at them).
    os.makedirs(os.path.join(out, 'parts'), exist_ok=True)
    for k, im in art.items(): save(im, os.path.join('parts', k[len('db-'):]))
    print('wrote', len(FILES) + 21 + len(art), 'files to', os.path.normpath(out))
    sys.exit(0)
if '--sheet' in sys.argv:
    sheet = Image.new('RGBA', (sum(i.width + 4 for i in art.values()), 30), (80, 200, 80, 255)); x = 0
    for i in art.values(): sheet.paste(i, (x, 0), i); x += i.width + 4
    sheet.resize((sheet.width * 4, 120), Image.NEAREST).save(sys.argv[-1])
else:
    for k, im in art.items():
        print('  --clio-art-%s: url("art/drawingboard/parts/%s.png"); /* %dx%d */' % (k, k[len('db-'):], im.width, im.height))
    # Pieces Mac OS tiles across a stretch that ends before the box does (the
    # middle of a menu underline): an SVG whose pattern repeats the piece from
    # its own left edge, so a background-size of any width tiles and clips.
    for k in TILED:
        im = art[k]; png = uri(im)[len('url("'):-2]
        svg = ("<svg xmlns='http://www.w3.org/2000/svg'><defs><pattern id='p' width='%d' height='%d' "
               "patternUnits='userSpaceOnUse'><image image-rendering='pixelated' style='image-rendering:pixelated' width='%d' height='%d' href='%s'/></pattern></defs>"
               "<rect width='100%%' height='100%%' fill='url(%%23p)'/></svg>") % (im.width, im.height, im.width, im.height, png)
        svg = svg.replace('<', '%3C').replace('>', '%3E')
        print('  --clio-art-%s-tiled: url("data:image/svg+xml,%s"); /* %d px tile */' % (k, svg, im.width))
