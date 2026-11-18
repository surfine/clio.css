"""Read PEF containers out of a classic Mac OS data fork (research tooling).

Mac OS 9's System file is a concatenation of PowerPC PEF containers ("Joy!peff" /
"pwpc"). This reads a container's section table, its loader section and its export
table (Inside Macintosh: Mac OS Runtime Architectures, ch. 8), and decompresses a
pattern-initialized data section (opcodes 000-100), so a function like
`PlayThemeSound` can be found and disassembled. It is for reading evidence, not for
rebuilding anything: nothing here is shipped.

  python3 tooling/pef.py list <file>                     # every container, sizes, kinds
  python3 tooling/pef.py exports <file> <container-off>  # names -> section, offset
  python3 tooling/pef.py section <file> <container-off> <i> <out>   # one section (gunzipped pattern data)

The System file itself stays in .fidelity/ (git-ignored): it is Apple's.
"""
import struct, sys

def containers(d):
    out = []
    i = 0
    while True:
        i = d.find(b"Joy!peff", i)
        if i < 0:
            return out
        try:
            out.append((i, sections(d, i)))
        except Exception:
            pass
        i += 4

def sections(d, c):
    n = struct.unpack(">H", d[c + 32:c + 34])[0]
    secs, p = [], c + 40
    for i in range(n):
        name_off, def_addr, total, unpacked, packed, cont = struct.unpack(">iIIIII", d[p:p + 24])
        kind = d[p + 24]
        secs.append({"i": i, "total": total, "unpacked": unpacked, "packed": packed,
                     "off": c + cont, "kind": kind})
        p += 28
    return secs

def _arg(data, i):
    v = 0
    while True:
        b = data[i]
        i += 1
        v = (v << 7) | (b & 0x7F)
        if not b & 0x80:
            return v, i

def pidata(data, unpacked):
    """Pattern-initialized data -> bytes (RTArch-94: opcodes 000-100, 7-bit args)."""
    out, i = bytearray(), 0
    while i < len(data) and len(out) < unpacked:
        b = data[i]
        i += 1
        op, cnt = b >> 5, b & 0x1F
        if op == 0:                                   # zero
            n, i = (cnt, i) if cnt else _arg(data, i)
            out += b"\0" * n
        elif op == 1:                                 # blockCopy
            n, i = (cnt, i) if cnt else _arg(data, i)
            out += data[i:i + n]
            i += n
        elif op == 2:                                 # repeatedBlock
            bs, i = (cnt, i) if cnt else _arg(data, i)
            rc, i = _arg(data, i)
            blk = data[i:i + bs]
            i += bs
            out += blk * (rc + 1)
        elif op in (3, 4):                            # interleave with blockCopy / zero
            cs, i = (cnt, i) if cnt else _arg(data, i)
            cus, i = _arg(data, i)
            rc, i = _arg(data, i)
            common = data[i:i + cs] if op == 3 else b"\0" * cs
            i += cs if op == 3 else 0
            for _ in range(rc):
                out += common
                out += data[i:i + cus]
                i += cus
            out += common
        else:
            break
    return bytes(out[:unpacked])

def exports(d, c):
    secs = sections(d, c)
    ldr = [s for s in secs if s["kind"] == 4][-1]
    base = ldr["off"]
    (main_sec, main_off, init_sec, init_off, term_sec, term_off, libs, syms,
     relocs, reloc_off, str_off, hash_off, hash_pow, count) = struct.unpack(">iIiIiIIIIIIIII", d[base:base + 56])
    keys = base + hash_off + 4 * (1 << hash_pow)
    table = keys + 4 * count
    strs = base + str_off
    out = []
    for k in range(count):
        class_and_name, value, sec = struct.unpack(">IIH", d[table + k * 10:table + k * 10 + 10])
        key = struct.unpack(">I", d[keys + k * 4:keys + k * 4 + 4])[0]
        name_off, length = class_and_name & 0xFFFFFF, key >> 16
        out.append((d[strs + name_off:strs + name_off + length].decode("mac_roman", "replace"), sec, value))
    return out, secs

def main(argv):
    if len(argv) < 2:
        print(__doc__)
        return 2
    cmd, path = argv[0], argv[1]
    d = open(path, "rb").read()
    if cmd == "list":
        for off, secs in containers(d):
            print(f"{off:#09x} " + " ".join(f"[{s['kind']} {s['unpacked']}/{s['packed']}]" for s in secs))
        return 0
    if cmd == "exports":
        off = int(argv[2], 0)
        ex, secs = exports(d, off)
        for name, sec, value in ex:
            print(f"{name:<44} sec {sec} off {value:#08x}")
        return 0
    if cmd == "section":
        off, idx, out = int(argv[2], 0), int(argv[3]), argv[4]
        s = sections(d, off)[idx]
        raw = d[s["off"]:s["off"] + (s["packed"] if s["packed"] else s["total"])]
        data = pidata(raw, s["unpacked"]) if s["kind"] == 2 else raw
        open(out, "wb").write(data)
        print(f"section {idx}: kind {s['kind']}, {len(data)} bytes -> {out}")
        return 0
    print(__doc__)
    return 2

if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
