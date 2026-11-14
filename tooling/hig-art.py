"""Art for the controls the classic guidelines add beyond clio.css's first set
(disclosure triangles, list headers, sliders, little arrows, bevel buttons,
chasing arrows, utility windows, help balloons, image wells...), redrawn pixel
for pixel from real screens.

Reads .fidelity/hig/<era>/*.png (taken from Infinite Mac: Mac OS 9.0 for
Platinum, System 7.5.3, Mac OS 8.5 with Drawing Board) and writes palette PNGs
to art/<era>/, which the stylesheets load beside themselves. Two kinds of cut:

  fixed   a part at its own size; the backdrop colours listed are cleared, but
          only where they are reachable from the crop's edge (so white inside
          an outline stays white)
  nine    a nine-slice frame for border-image (tooling/frame-art.py's method:
          c x c corners, one sampled edge column and row, one pixel of face)

Drawing Board parts come from the theme file instead (tooling/db-art.py).
  python3 tooling/hig-art.py
"""
import importlib.util, os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, '..')
spec = importlib.util.spec_from_file_location('fa', os.path.join(HERE, 'frame-art.py'))
fa = importlib.util.module_from_spec(spec)
src = open(os.path.join(HERE, 'frame-art.py')).read()
exec(compile(src[:src.index('W, K = ')], 'frame-art.py', 'exec'), fa.__dict__)   # the helpers, not the frame list

def load(era, name):
    return Image.open(os.path.join(ROOT, '.fidelity', 'hig', era, name + '.png')).convert('RGB')

def fixed(im, x0, y0, w, h, clear=()):
    """A part at its own size; backdrop colours reachable from the crop's edge are cleared."""
    gone = set()
    for colour in clear:
        todo = [(x, 0) for x in range(w)] + [(x, h - 1) for x in range(w)] + [(0, y) for y in range(h)] + [(w - 1, y) for y in range(h)]
        while todo:
            x, y = todo.pop()
            if (x, y) in gone or not (0 <= x < w and 0 <= y < h) or im.getpixel((x0 + x, y0 + y)) != colour: continue
            gone.add((x, y)); todo += [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]
    out = Image.new('RGBA', (w, h))
    for y in range(h):
        for x in range(w):
            out.putpixel((x, y), (0, 0, 0, 0) if (x, y) in gone else im.getpixel((x0 + x, y0 + y)) + (255,))
    return out

def save(im, era, name):
    d = os.path.join(ROOT, 'art', era); os.makedirs(d, exist_ok=True)
    cols = sorted({im.getpixel((x, y)) for x in range(im.width) for y in range(im.height)}, key=lambda c: c[3])
    p = Image.new('P', im.size)
    p.putpalette([v for c in cols for v in c[:3]], rawmode='RGB')
    idx = {c: i for i, c in enumerate(cols)}
    p.putdata([idx[im.getpixel((x, y))] for y in range(im.height) for x in range(im.width)])
    alpha = bytes(c[3] for c in cols if c[3] < 255)
    p.save(os.path.join(d, name + '.png'), optimize=True, **({'transparency': alpha} if alpha else {}))

W, DDD, EEE = (255, 255, 255), (0xdd, 0xdd, 0xdd), (0xee, 0xee, 0xee)
P = 'platinum'
p_list, p_list_open = load('platinum9', 'list'), load('platinum9', 'list-open')
s_list, s_list_open = load('system7', 'list'), load('system7', 'list-open')
p_mouse = load('platinum9', 'mouse')
p_dt = Image.open(os.path.join(ROOT, '.fidelity', 'platinum9', 'date-time.png')).convert('RGB')
s_memory = load('system7', 'memory')
p_dt_edit = load('platinum9', 'date-time-edit')
p_nav, p_nav_held = load('platinum9', 'nav'), load('platinum9', 'nav-bevel-held')
p_sw = load('platinum9', 'switcher')

def strip(ims):
    out = Image.new('RGBA', (sum(i.width for i in ims), max(i.height for i in ims)))
    x = 0
    for i in ims: out.paste(i, (x, 0)); x += i.width
    return out

def held_bevel():
    im = p_nav_held.crop((490, 198, 526, 225)).copy()
    for x in range(1, 36): im.putpixel((x, 26), (0x44, 0x44, 0x44))
    im.putpixel((0, 26), (0x11, 0x11, 0x11))
    return fa.nine(im, 0, 0, 36, 27, 3, 4, 4)
ART = {
    # Disclosure triangles, Finder list view ("Control Panels & Extensions"):
    # one box for both states, closed and open, on the row's #ddd.
    (P, 'disclosure'): fixed(p_list, 34, 120, 13, 13, (DDD,)),
    (P, 'disclosure-open'): fixed(p_list_open, 34, 120, 13, 13, (DDD,)),
    # The sort-direction button's mark (the header's last cell), on #ccc.
    (P, 'sort-direction'): fixed(p_list, 393, 101, 8, 7, ((0xcc, 0xcc, 0xcc),)),
    # Slider (Mouse, "Mouse Tracking"): the track as a 3x3-corner nine-slice
    # (53..208 x 130..136), the 15x16 thumb pointing down, a tick mark (2px of
    # white and black on #ddd with a #888 shade, 4 rows).
    (P, 'slider-track'): fa.nine(p_mouse, 53, 130, 156, 7, 3, 40, 3, out_colour=DDD),
    (P, 'slider-thumb'): fixed(p_mouse, 131, 127, 15, 16, (DDD,)),
    (P, 'slider-tick'): fixed(p_mouse, 62, 143, 3, 4, (DDD,)),
    # Little arrows (Date & Time, dimmed while its field is not being edited).
    (P, 'little-arrows-disabled'): fixed(p_dt, 359, 116, 13, 23, (DDD,)),
    # ...and while the field is edited (frame date-time-edit): the keyboard focus
    # ring's #6666cc round the pair's corners is cleared.
    (P, 'little-arrows'): fixed(p_dt_edit, 359, 116, 13, 23, ((0x66, 0x66, 0xcc),)),
    # Bevel button (Navigation Services, the Shortcuts button: 490..525 x 198..224),
    # normal and held; 3px corners, edges sampled clear of its icon. Held, the
    # opened menu covers the bottom row: it is rebuilt as the right edge's #444.
    (P, 'bevel'): fa.nine(p_nav, 490, 198, 36, 27, 3, 4, 4),
    (P, 'bevel-held'): held_bevel(),
    (P, 'bevel-menu-arrow'): fixed(p_nav, 518, 219, 3, 2, ((0xcc, 0xcc, 0xcc),)),
    # Chasing arrows (Network Browser looking for servers), three frames read
    # 0.7s apart, side by side; the order between them is not known.
    (P, 'chasing-arrows'): strip([fixed(load('platinum9', 'netb-%d' % i), 20, 56, 16, 16, (DDD,)) for i in (0, 2, 1)]),
    # Help button (Keyboard): a small bevel button with the help icon, 21x20.
    (P, 'help-button'): fixed(load('platinum9', 'keyboard'), 110, 331, 21, 20, (DDD,)),
    ('drawingboard', 'help-button'): fixed(load('drawingboard', 'keyboard'), 110, 333, 21, 20),
    # Utility window (the Application Switcher, torn off the Application menu):
    # its 9x9 close, zoom and collapse boxes, and one 3x3 tile of the title
    # bar's dots (white, then #777 one down and right, on #ccc).
    (P, 'utility-close'): fixed(p_sw, 614, 243, 10, 10),
    (P, 'utility-zoom'): fixed(p_sw, 747, 243, 10, 10),
    (P, 'utility-collapse'): fixed(p_sw, 758, 243, 10, 10),
    (P, 'utility-dots'): fixed(p_sw, 626, 244, 3, 3),
    ('system7', 'disclosure'): fixed(s_list, 32, 98, 11, 11, (W,)),
    ('system7', 'disclosure-open'): fixed(s_list_open, 32, 98, 11, 11, (W,)),
    # Little arrows (Memory, Cache Size): 15x25, an outlined rounded box.
    ('system7', 'little-arrows'): fixed(s_memory, 429, 70, 15, 25, (W,)),
}

if __name__ == '__main__':
    for (era, name), im in ART.items():
        save(im, era, name)
    print('wrote', len(ART), 'files')
