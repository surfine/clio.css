"""Clio's CJK stand-in: Fusion Pixel Font 12px proportional (TakWolf, OFL-1.1, no Reserved
Font Name; https://github.com/TakWolf/fusion-pixel-font, release 2026.11.10), cut down per
language to the character set the period Mac's bitmap interface font drew: Big5 (Taipei),
GB 2312 (Beijing), JIS X 0208 (Osaka) and KS X 1001 (Seoul), plus printable ASCII.
Characters outside the set fall to the next font in the stack, as they could not be drawn
on the Mac either. The glyphs are not changed; unused ones are dropped and the vertical metrics set to Clio's.

  python3 -m venv .venv && .venv/bin/pip install fonttools brotli
  gh release download 2026.11.10 -R TakWolf/fusion-pixel-font -p "fusion-pixel-font-12px-proportional-otf.woff2-v2026.11.10.zip" -D /tmp/fpf
  .venv/bin/python tooling/cjk-fonts.py /tmp/fpf/fusion-pixel-font-12px-proportional-otf.woff2-v2026.11.10.zip
"""
import hashlib, io, os, sys, zipfile
from fontTools import subset
from fontTools.ttLib import TTFont

SHA256 = "4a0bab32ebb6ca0525f87024f3adbacf409a74b0fc8373d5345c93b1b7cbb075"
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
# (file suffix in the release, encoding, lead bytes of the double-byte set, output name)
LANGS = [
    ("zh_tw", "big5", (0xA1, 0xF9), "FusionPixel12-TC"),
    ("zh_hans", "gb2312", (0xA1, 0xF7), "FusionPixel12-SC"),
    ("ja", "shift_jis", (0x81, 0xEF), "FusionPixel12-JA"),
    ("ko", "euc_kr", (0xA1, 0xFE), "FusionPixel12-KO"),
]


def charset(enc, lead):
    out = set()
    for hi in range(lead[0], lead[1] + 1):
        for lo in range(0x40, 0xFF):
            try:
                ch = bytes([hi, lo]).decode(enc)
            except UnicodeDecodeError:
                continue
            if len(ch) == 1 and ord(ch) > 0x7F:
                out.add(ord(ch))
    if enc == "shift_jis":   # half-width katakana are single bytes
        out |= {ord(bytes([b]).decode(enc)) for b in range(0xA1, 0xE0)}
    return out


def main(zpath):
    data = open(zpath, "rb").read()
    if hashlib.sha256(data).hexdigest() != SHA256:
        sys.exit("Not the 2026.11.10 release zip this script was written for.")
    z = zipfile.ZipFile(io.BytesIO(data))
    for tag, enc, lead, name in LANGS:
        font = TTFont(io.BytesIO(z.read(f"fusion-pixel-12px-proportional-{tag}.otf.woff2")))
        cmap = set(font.getBestCmap())
        want = charset(enc, lead)
        have = want & cmap
        opts = subset.Options()
        opts.flavor = "woff2"
        opts.layout_features = ["*"]
        opts.name_IDs = ["*"]
        opts.name_languages = ["*"]
        opts.notdef_outline = True
        opts.drop_tables += ["FFTM"]
        sub = subset.Subsetter(opts)
        sub.populate(unicodes=have | set(range(0x20, 0x7F)))
        sub.subset(font)
        # Clio's own pixel fonts' vertical metrics (ascent 11px, descent 3px at 12px): the
        # line box and the baseline then come out the same whichever face a browser takes
        # as the line's first font (WebKit and Firefox take this one, Chromium Clio Sans).
        # The upstream ascent is 13px, which set CJK lines a pixel low there.
        font["hhea"].ascent = font["OS/2"].sTypoAscender = font["OS/2"].usWinAscent = 1100
        font["hhea"].descent = font["OS/2"].sTypoDescender = -300
        font["OS/2"].usWinDescent = 300
        font["hhea"].lineGap = font["OS/2"].sTypoLineGap = 0
        font["OS/2"].fsSelection |= 1 << 7   # USE_TYPO_METRICS, as Clio's fonts
        out = os.path.join(ROOT, "fonts", name + ".woff2")
        font.flavor = "woff2"
        font.save(out)
        cps = sorted(have | set(range(0x20, 0x7F)))
        ranges = []   # merged where the gap is under 128 code points, to keep the CSS short
        for c in cps:
            if ranges and c - ranges[-1][1] < 128: ranges[-1][1] = c
            else: ranges.append([c, c])
        print("  unicode-range: " + ", ".join(f"U+{a:X}-{b:X}" if a != b else f"U+{a:X}" for a, b in ranges))
        print(f"{name}: {enc} {len(have)}/{len(want)} = {100 * len(have) / len(want):.1f}%, {os.path.getsize(out) // 1024} KB")
    # Fusion Pixel's own licence, then those of the fonts it merges (Ark Pixel, Cubic 11, Galmuri).
    parts = [z.read(n) for n in ("OFL.txt", "LICENSES/ark-pixel/OFL.txt", "LICENSES/cubic-11/OFL.txt", "LICENSES/galmuri/LICENSE.txt")]
    open(os.path.join(ROOT, "fonts", "OFL-FusionPixel.txt"), "wb").write(b"\n\n".join(parts))


if __name__ == "__main__":
    main(sys.argv[1])
