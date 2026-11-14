"""Wrap Virtue 3.2.1 (the Mac 'sfnt' resource, extracted to a .ttf) as WOFF2
without changing a byte of any table. fontTools' encoder rewrites head's
checksumAdjustment and sets its WOFF2 flag; this puts the original head back
into the compressed stream. The author's permission requires the font itself
to stay unchanged (THIRD-PARTY.md).  Usage: virtue-woff2.py virtue321.ttf out.woff2
"""
import io, struct, sys, brotli
from fontTools.ttLib import TTFont, woff2
from fontTools.ttLib.woff2 import WOFF2Reader, woff2DirectorySize
src, out = sys.argv[1:3]
tmp = io.BytesIO(); woff2.compress(src, tmp, transform_tables=set()); w = tmp.getvalue()
r = WOFF2Reader(io.BytesIO(w))
dir_end = woff2DirectorySize + sum(len(e.toString()) for e in r.tables.values())
stream = bytearray(brotli.decompress(w[dir_end:dir_end + r.totalCompressedSize]))
orig = TTFont(src, lazy=True).reader
for tag, e in r.tables.items():
    assert stream[e.offset:e.offset + e.length] == orig[tag] or tag == 'head', tag
    stream[e.offset:e.offset + e.length] = orig[tag]
comp = brotli.compress(bytes(stream), mode=brotli.MODE_FONT, quality=11)
body = w[woff2DirectorySize:dir_end] + comp
body += b'\0' * (-len(body) % 4)
hdr = bytearray(w[:woff2DirectorySize])
struct.pack_into('>I', hdr, 8, woff2DirectorySize + len(body))     # length
struct.pack_into('>I', hdr, 20, len(comp))                          # totalCompressedSize
open(out, 'wb').write(bytes(hdr) + body)
a, b = TTFont(src, lazy=True).reader, TTFont(out, lazy=True).reader
diff = [t for t in a.keys() if a[t] != b[t]]
assert not diff, diff
print(out, len(bytes(hdr) + body), 'bytes; every table identical to', src)
