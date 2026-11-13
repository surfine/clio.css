"""Print @font-palette-values for Clio Sans '97 Exact and Clio Sans '97 Title Exact.

Mac OS antialiases Charcoal in 16 coverage levels. For a given text colour on
a given background every level comes out as one exact colour, but no single
blend formula gives them all (its level table is not quite linear), and
browser alpha compositing lands one step off on some edge pixels. So where
clio.css knows both colours it paints each level from a palette entry: the
colour the real screen shows for that level, read pixel by pixel from the
captures (MEASURED), and for a level that never occurs there,
(fg * a + bg * (255 - a)) >> 8 with a = 17 per level, which is within one step.
Drawing Board's solid pixels come out of a 16-bit buffer (5 bits per channel:
#333333 shows as #313131).
Usage: python3 tooling/aa-palettes.py, pasted into src/00-fonts.css.
"""
CONTEXTS = [  # name, family, text colour, background, 5-bit solid
    ('clio-aa-p9-title', "Clio Sans '97 Title Exact", '000000', 'cccccc', False),
    ('clio-aa-p9-title-inactive', "Clio Sans '97 Title Exact", '777777', 'cccccc', False),
    ('clio-aa-p9-button', "Clio Sans '97 Exact", '000000', 'dddddd', False),
    ('clio-aa-p9-button-held', "Clio Sans '97 Exact", 'ffffff', '666666', False),
    ('clio-aa-p9-button-disabled', "Clio Sans '97 Exact", '777777', 'dddddd', False),
    ('clio-aa-db-button', "Clio Sans '97 Exact", '333333', 'cec6b5', True),
    ('clio-aa-db-button-disabled', "Clio Sans '97 Exact", '9f9a94', 'cec6b5', True),
]
# Level -> colour on the real screen. Platinum: Appearance's title bar and "Set
# Desktop" (normal and held), Mac OS 9.0; Drawing Board: "Save Theme…", Mac OS 8.5.
MEASURED = {
    'clio-aa-p9-title': {1: 'bebebe', 2: 'b0b0b0', 4: '959595', 5: '878787', 6: '7a7a7a', 7: '6c6c6c', 8: '5f5f5f', 9: '515151', 10: '444444', 11: '363636', 12: '282828', 13: '1b1b1b', 14: '0d0d0d'},
    'clio-aa-p9-button': {1: 'cecece', 2: 'bfbfbf', 3: 'b0b0b0', 4: 'a2a2a2', 5: '939393', 6: '848484', 7: '757575', 8: '676767', 9: '585858', 10: '494949', 11: '3a3a3a', 12: '2c2c2c', 13: '1d1d1d', 14: '0e0e0e'},
    'clio-aa-p9-button-held': {1: '707070', 2: '7a7a7a', 3: '848484', 4: '8e8e8e', 5: '999999', 6: 'a3a3a3', 7: 'adadad', 8: 'b7b7b7', 9: 'c1c1c1', 10: 'cbcbcb', 11: 'd6d6d6', 12: 'e0e0e0', 13: 'eaeaea', 14: 'f4f4f4'},
    'clio-aa-db-button': {1: 'c3bcac', 2: 'b9b2a3', 3: 'aea89a', 4: 'a49e91', 5: '999488', 6: '8f8a80', 7: '848077', 8: '7a766e', 9: '6f6c65', 10: '65625d', 11: '5a5854', 12: '504e4b', 13: '454442', 14: '3b3a39'},
}
rgb = lambda h: [int(h[i:i + 2], 16) for i in (0, 2, 4)]
q5 = lambda v: ((v >> 3) << 3) | (v >> 5)
for name, fam, fg, bg, five in CONTEXTS:
    f, b = rgb(fg), rgb(bg)
    cols = []
    for k in range(1, 16):
        a = 17 * k
        c = [q5(x) for x in f] if (k == 15 and five) else ([(x * a + y * (255 - a)) >> 8 for x, y in zip(f, b)] if k < 15 else f)
        if k in MEASURED.get(name, {}): c = rgb(MEASURED[name][k])
        cols.append('%d #%02x%02x%02x' % (k - 1, *c))
    print('@font-palette-values --%s {\n  font-family: "%s";\n  override-colors:\n    %s;\n}\n' % (name, fam, ',\n    '.join(cols)))
