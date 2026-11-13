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
    'db-popup-arrow': pxm[356][0], 'db-popup-arrow-off': pxm[356][2],
    'db-submenu': pxm[250][0],
    'db-grow': pxm[452][0],
    # ButtonFaceCorner: image 2 is the hatched corner of a pop-up button, image 0
    # that of a push button (both found in the capture, clipped to the face).
    'db-popup-corner': pxm[1150][2], 'db-button-corner': pxm[1150][0],
    # Scroll box ends, grip and stretch (HThumb*/VThumb*), found in the capture.
    'db-thumb-left': pxm[1113][0], 'db-thumb-right': pxm[1112][0],
    'db-thumb-hgrip': pxm[1115][0], 'db-thumb-hstretch': pxm[1114][0],
    'db-thumb-top': pxm[1116][0], 'db-thumb-bottom': pxm[1117][0],
    'db-thumb-vgrip': pxm[1119][0], 'db-thumb-vstretch': pxm[1118][0],
}
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
if '--sheet' in sys.argv:
    sheet = Image.new('RGBA', (sum(i.width + 4 for i in art.values()), 30), (80, 200, 80, 255)); x = 0
    for i in art.values(): sheet.paste(i, (x, 0), i); x += i.width + 4
    sheet.resize((sheet.width * 4, 120), Image.NEAREST).save(sys.argv[-1])
else:
    for k, im in art.items():
        print('  --clio-art-%s: %s; /* %dx%d */' % (k, uri(im), im.width, im.height))
