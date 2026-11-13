"""Read an Appearance theme file's resource fork (Mac OS 8.5 era) on macOS.

  python3 tooling/theme-resources.py list  <theme file>
  python3 tooling/theme-resources.py ppat  <theme file> <out dir>     # every pixel pattern as PNG
  python3 tooling/theme-resources.py pxm   <theme file> <out dir>     # every pixmap list, one PNG per state
  python3 tooling/theme-resources.py match <capture.png> <ppat dir> name:x:y:w:h ...

The theme file's data fork is empty; its resources live in the
com.apple.ResourceFork extended attribute (as `unar` writes it). Pixel patterns
('ppat') follow Inside Macintosh: Imaging With QuickDraw (PixPat, PixMap,
ColorTable); indexed and 16/32-bit direct pixels are decoded. `match` finds which
pattern, at which tiling offset, paints a region of a capture. Nothing decoded
here is committed: the theme and its art are Apple's.
"""
import os, sys, struct, subprocess, glob
def read_fork(path):
    hexs = subprocess.run(['xattr','-px','com.apple.ResourceFork',path],capture_output=True,text=True).stdout
    return bytes.fromhex(''.join(hexs.split()))
def parse(data):
    doff, moff, dlen, mlen = struct.unpack('>IIII', data[:16])
    m = data[moff:moff+mlen]
    tlo, nlo = struct.unpack('>HH', m[24:28])
    tl = m[tlo:]
    ntypes = struct.unpack('>H', tl[:2])[0] + 1
    out = {}
    for i in range(ntypes):
        t, n, ref = struct.unpack('>4sHH', tl[2+i*8:10+i*8])
        n += 1
        for j in range(n):
            rid, nameoff, attr_off = struct.unpack('>hHI', tl[ref+j*12:ref+j*12+8])
            off = attr_off & 0xFFFFFF
            ln = struct.unpack('>I', data[doff+off:doff+off+4])[0]
            body = data[doff+off+4:doff+off+4+ln]
            name = ''
            if nameoff != 0xFFFF:
                nl = m[nlo+nameoff]; name = m[nlo+nameoff+1:nlo+nameoff+1+nl].decode('mac_roman')
            out.setdefault(t.decode('mac_roman'), []).append((rid, name, body))
    return out
def ctable(b, off):
    seed, flags, size = struct.unpack('>IHH', b[off:off+8])
    cols = {}
    for i in range(size + 1):
        v, r, g, bl = struct.unpack('>HHHH', b[off+8+i*8:off+16+i*8])
        cols[i if flags & 0x8000 else v] = (r >> 8, g >> 8, bl >> 8)
    return cols
def unpack_bits(src, n):
    out = bytearray(); i = 0
    while len(out) < n and i < len(src):
        c = src[i]; i += 1
        if c < 128: out += src[i:i+c+1]; i += c + 1
        elif c > 128: out += bytes([src[i]]) * (257 - c); i += 1
    return bytes(out[:n]), i
def decode_ppat(b):
    from PIL import Image
    patType, patMap, patData = struct.unpack('>HII', b[:10])
    if patType != 1: return None
    pm = b[patMap:patMap+50]
    rowBytes = struct.unpack('>H', pm[4:6])[0] & 0x3FFF
    top, left, bottom, right = struct.unpack('>hhhh', pm[6:14])
    pixelSize = struct.unpack('>H', pm[32:34])[0]
    pmTable = struct.unpack('>I', pm[42:46])[0]
    w, h = right - left, bottom - top
    data = b[patData:patData + rowBytes * h]
    im = Image.new('RGB', (w, h))
    if pixelSize in (16, 32):
        for y in range(h):
            row = data[y*rowBytes:(y+1)*rowBytes]
            for x in range(w):
                if pixelSize == 16:
                    v = struct.unpack('>H', row[x*2:x*2+2])[0]
                    im.putpixel((x, y), (((v >> 10) & 31) * 255 // 31, ((v >> 5) & 31) * 255 // 31, (v & 31) * 255 // 31))
                else:
                    im.putpixel((x, y), tuple(row[x*4+1:x*4+4]))
        return im
    cols = ctable(b, pmTable)
    for y in range(h):
        row = data[y*rowBytes:(y+1)*rowBytes]
        for x in range(w):
            bit = x * pixelSize
            v = (row[bit // 8] >> (8 - pixelSize - bit % 8)) & ((1 << pixelSize) - 1)
            im.putpixel((x, y), cols.get(v, (255, 0, 255)))
    return im
def decode_pxm(b, cluts):
    """'pxm#': the Appearance Manager's pixmap list (undocumented; layout read
    from the resources themselves). 24-byte header: version, flags, 4 reserved,
    height, width, pixel size, pixel size again, 4 reserved... then clut id (or 0
    for direct colour) and image count. Flag bit 0 set: one 1-bit mask (rows
    padded to 16 bits) shared by every image, then each image's pixels (rows
    padded to 16 bits). Clear: one mask per image, all masks first, then
    every image's pixels. Returns RGBA images."""
    from PIL import Image
    flags = struct.unpack('>H', b[2:4])[0]
    h, w, ps = struct.unpack('>HHH', b[8:14])
    clut_id, count = struct.unpack('>hH', b[20:24])
    mrow = (w + 15) // 16 * 2
    prow = (w * ps + 15) // 16 * 2
    shared = flags & 1
    cols = cluts.get(clut_id) if clut_id else None
    out = []
    for i in range(count):
        if shared:
            mask = b[24:24 + mrow * h]
            base = 24 + mrow * h + i * prow * h
        else:
            m0 = 24 + i * mrow * h
            mask = b[m0:m0 + mrow * h]
            base = 24 + count * mrow * h + i * prow * h
        im = Image.new('RGBA', (w, h))
        for y in range(h):
            row = b[base + y * prow: base + (y + 1) * prow]
            for x in range(w):
                a = 255 if (mask[y * mrow + x // 8] >> (7 - x % 8)) & 1 else 0
                if ps == 16:
                    v = struct.unpack('>H', row[x*2:x*2+2])[0]
                    c = (((v >> 10) & 31) * 255 // 31, ((v >> 5) & 31) * 255 // 31, (v & 31) * 255 // 31)
                elif ps == 32:
                    c = tuple(row[x*4+1:x*4+4])
                else:
                    bit = x * ps
                    v = (row[bit // 8] >> (8 - ps - bit % 8)) & ((1 << ps) - 1)
                    c = (cols or {}).get(v, (255, 0, 255))
                im.putpixel((x, y), c + (a,))
        out.append(im)
    return out

def match(cap_path, ppat_dir, specs):
    import numpy as np
    from PIL import Image
    load = lambda f: np.asarray(Image.open(f).convert('RGB')).astype(np.int16)
    pats = {int(os.path.basename(f)[:-4]): load(f) for f in glob.glob(os.path.join(ppat_dir, '*.png'))}
    cap = load(cap_path)
    for spec in specs:
        name, x, y, w, h = spec.split(':'); x, y, w, h = map(int, (x, y, w, h))
        R = cap[y:y+h, x:x+w]; best = []
        for pid, P in pats.items():
            ph, pw = P.shape[:2]
            reps = np.tile(P, ((h + ph) // ph + 1, (w + pw) // pw + 1, 1)); top = (0, -1, 0, 0)
            for oy in range(ph):
                for ox in range(pw):
                    ok = (np.abs(reps[oy:oy+h, ox:ox+w] - R).max(axis=2) <= 4).mean()
                    if ok > top[0]: top = (ok, pid, ox, oy)
            best.append(top)
        best.sort(reverse=True)
        print(name, [(round(float(a), 3), p, ox, oy) for a, p, ox, oy in best[:3]])

if __name__ == '__main__':
    cmd = sys.argv[1]
    if cmd == 'list':
        for t, items in sorted(parse(read_fork(sys.argv[2])).items()):
            print(t, len(items), [(i, n) for i, n, _ in items[:8]])
    elif cmd == 'ppat':
        from PIL import Image
        os.makedirs(sys.argv[3], exist_ok=True)
        for rid, name, body in parse(read_fork(sys.argv[2])).get('ppat', []):
            im = decode_ppat(body)
            if im: im.save(os.path.join(sys.argv[3], '%d.png' % rid))
    elif cmd == 'pxm':
        os.makedirs(sys.argv[3], exist_ok=True)
        res = parse(read_fork(sys.argv[2]))
        cluts = {rid: ctable(body, 0) for rid, _, body in res.get('clut', [])}
        for rid, name, body in res.get('pxm#', []):
            for i, im in enumerate(decode_pxm(body, cluts)):
                im.save(os.path.join(sys.argv[3], '%d-%s-%d.png' % (rid, name.replace('/', '_').replace(' ', '_'), i)))
    elif cmd == 'match':
        match(sys.argv[2], sys.argv[3], sys.argv[4:])
