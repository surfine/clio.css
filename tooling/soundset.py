"""Decode classic Mac OS sound sets and System alert sounds to WAV + manifest.json.

  python3 tooling/soundset.py packs [--all] [<fidelity dir> [<out dir>]]   # npm run soundset: Apple's 4 sets (--all: 42) and the alerts
  python3 tooling/soundset.py build <set file | folder | .sit>... <out dir>  # every set found
  python3 tooling/soundset.py scan  <set file | folder | .sit>...           # inventory, no output
  python3 tooling/soundset.py alerts <out dir> <System or sound file>...   # alert sounds
  python3 tooling/soundset.py snd <file> <id> <out.wav>                     # one 'snd ' resource
  python3 tooling/soundset.py selftest <sets>...                            # IMA4 and mu-law against ffmpeg
  python3 tooling/soundset.py capture <capture.wav> <out.wav> [--rate R]    # a synthesized beep, as recorded

A sound set (Mac OS 8.5-9 Appearance Manager, file type 'tsnd') keeps its sounds as
'snd ' resources and its map in 'snd#' 1000 (one-shot effects) and 'snd#' 1001 (drag
loops). Two map layouts exist:

  Mac OS 8.5b6 (DrawingBoard Sounds):  u32 count, then 20-byte entries
      code[4]  id[3] (int16)  class (u16)  param (int16)  0  0  5
  release (every other set):            u16 version (1), u16 count, then 44-byte entries
      code[4]  class (u16)  5 (u16)  delay? (int16)  0 (int16)
      4 slots of: id (int16)  level? (int16)  pitch? (Fixed 16.16)

The class bits are Appearance's: 1 windows, 2 menus, 4 controls, 8 Finder. The meaning
of the per-slot numbers is not documented anywhere found; they are kept raw in the
manifest (the "?" fields above are guesses, checked against the emulator in
SOUND-SETS.md). The sound that plays is the first slot whose 'snd ' exists.

'snd ' resources follow Inside Macintosh: Sound (format 1 and 2; stdSH, extSH, cmpSH).
Every sound is written losslessly at its own rate, depth and channel count: 8-bit
stays unsigned 8-bit (the WAV format's own 8-bit), 16-bit stays 16-bit; compressed
sounds are expanded to what the Sound Manager plays (mu-law and IMA4 to 16-bit, MACE
to 8-bit). MACE is expanded by ffmpeg's mace3/mace6 decoder through an AIFF-C wrapper;
IMA4 and mu-law are decoded here (and cross-checked with ffmpeg by `selftest`).

The resource fork is read from <file>/..namedfork/rsrc (macOS, as `unar` writes it).
Nothing decoded here is committed: the sounds are Apple's and the sets' authors'.
"""
import json, os, re, shutil, struct, subprocess, sys, tempfile, unicodedata, wave, hashlib

CLASS = {1: "windows", 2: "menus", 4: "controls", 8: "finder"}

# ---- resource fork ---------------------------------------------------------------
def read_fork(path):
    """The resource fork: the file's own (macOS), or a MacBinary file's (.bin, as Infinite
    Mac's BlueSCSI transfer hands out System 6 files)."""
    try:
        with open(os.path.join(path, "..namedfork", "rsrc"), "rb") as f: fork = f.read()
    except OSError: fork = b""
    if fork or not path.lower().endswith(".bin"): return fork
    with open(path, "rb") as f: d = f.read()
    if len(d) >= 128 and d[0] == 0 and d[74] == 0 and 1 <= d[1] <= 63:
        dlen, rlen = struct.unpack(">II", d[83:91])
        start = 128 + ((dlen + 127) // 128) * 128
        return d[start:start + rlen]
    return b""

def finder_type(path):
    r = subprocess.run(["xattr", "-px", "com.apple.FinderInfo", path], capture_output=True, text=True)
    if r.returncode: return None, None
    b = bytes.fromhex("".join(r.stdout.split()))
    return b[:4].decode("mac_roman"), b[4:8].decode("mac_roman")

def resources(data):
    """{type: {id: (name, body)}} from a resource fork."""
    if len(data) < 16: return {}
    doff, moff, dlen, mlen = struct.unpack(">IIII", data[:16])
    m = data[moff:moff + mlen]
    tlo, nlo = struct.unpack(">HH", m[24:28])
    tl = m[tlo:]
    out = {}
    for i in range(struct.unpack(">H", tl[:2])[0] + 1):
        t, n, ref = struct.unpack(">4sHH", tl[2 + i * 8:10 + i * 8])
        for j in range(n + 1):
            rid, nameoff, attr_off = struct.unpack(">hHI", tl[ref + j * 12:ref + j * 12 + 8])
            off = doff + (attr_off & 0xFFFFFF)
            ln = struct.unpack(">I", data[off:off + 4])[0]
            name = ""
            if nameoff != 0xFFFF:
                nl = m[nlo + nameoff]; name = m[nlo + nameoff + 1:nlo + nameoff + 1 + nl].decode("mac_roman")
            out.setdefault(t.decode("mac_roman"), {})[rid] = (name, data[off + 4:off + 4 + ln])
    return out

# ---- 'snd#' maps -----------------------------------------------------------------
def read_map(body, ids):
    """[(code, entry)] from a 'snd#' resource, either layout."""
    entries = []
    if struct.unpack(">H", body[:2])[0] == 0:   # Mac OS 8.5b6: u32 count, 20-byte entries
        n = struct.unpack(">I", body[:4])[0]
        for i in range(n):
            e = body[4 + i * 20:24 + i * 20]
            code = e[:4]
            if code == b"\0\0\0\0": continue
            a, b, c, cls, p, q, r, s = struct.unpack(">hhhHhhhh", e[4:])
            slots = [{"id": x} for x in (a, b, c)]
            entries.append((code.decode("mac_roman"), {"layout": "8.5b6", "class": cls, "slots": slots, "raw": [a, b, c, cls, p, q, r, s]}))
    else:                                         # release: u16 version, u16 count, 44-byte entries
        ver, n = struct.unpack(">HH", body[:4])
        for i in range(n):
            e = body[4 + i * 44:48 + i * 44]
            code = e[:4]
            cls, flags, x1, x2 = struct.unpack(">HHhh", e[4:12])
            slots = []
            for k in range(4):
                sid, level, fx = struct.unpack(">hhi", e[12 + k * 8:20 + k * 8])
                slots.append({"id": sid, "level": level, "pitch": fx / 65536})
            entries.append((code.decode("mac_roman"), {"layout": "release", "version": ver, "class": cls, "flags": flags, "delay": x1, "x2": x2, "slots": slots}))
    for code, e in entries:
        e["sound"] = next((s["id"] for s in e["slots"] if s["id"] in ids), None)
    return entries

# ---- 'snd ' resources ------------------------------------------------------------
CMD = {0x50: "soundCmd", 0x51: "bufferCmd", 0x2B: "ampCmd", 0x2E: "volumeCmd", 0x28: "freqDurationCmd", 0x3C: "timbreCmd", 0x52: "rateCmd", 0x2A: "freqCmd"}

def parse_snd(b):
    """Return (header offset, commands, format, modifiers)."""
    fmt = struct.unpack(">h", b[:2])[0]
    if fmt == 1:
        nmods = struct.unpack(">h", b[2:4])[0]
        mods = [struct.unpack(">hI", b[4 + i * 6:10 + i * 6]) for i in range(nmods)]
        p = 4 + nmods * 6
    elif fmt == 2:
        mods = []; p = 4
    else:
        raise ValueError(f"'snd ' format {fmt}")
    ncmd = struct.unpack(">h", b[p:p + 2])[0]; p += 2
    cmds = [struct.unpack(">Hhi", b[p + i * 8:p + 8 + i * 8]) for i in range(ncmd)]
    hdr = None
    for c, p1, p2 in cmds:
        if (c & 0x7FFF) in (0x50, 0x51) and c & 0x8000: hdr = p2; break
    if hdr is None:   # no data-offset command: the header follows the commands (seen in a few sets)
        hdr = p + ncmd * 8
    return hdr, cmds, fmt, mods

def ext80(b):
    """80-bit IEEE extended (AIFF sample rate) to float."""
    exp, mant = struct.unpack(">HQ", b[:10])
    if exp == 0 and mant == 0: return 0.0
    sign = -1 if exp & 0x8000 else 1
    return sign * mant * 2.0 ** ((exp & 0x7FFF) - 16383 - 63)

def ulaw(byte):
    u = ~byte & 0xFF
    t = ((u & 0x0F) << 3) + 0x84
    t <<= (u & 0x70) >> 4
    return (0x84 - t) if u & 0x80 else (t - 0x84)

ULAW = [ulaw(i) for i in range(256)]
IMA_STEP = [7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 19, 21, 23, 25, 28, 31, 34, 37, 41, 45, 50, 55, 60, 66, 73, 80, 88, 97, 107, 118, 130, 143, 157, 173, 190, 209, 230, 253, 279, 307, 337, 371, 408, 449, 494, 544, 598, 658, 724, 796, 876, 963, 1060, 1166, 1282, 1411, 1552, 1707, 1878, 2066, 2272, 2499, 2749, 3024, 3327, 3660, 4026, 4428, 4871, 5358, 5894, 6484, 7132, 7845, 8630, 9493, 10442, 11487, 12635, 13899, 15289, 16818, 18500, 20350, 22385, 24623, 27086, 29794, 32767]
IMA_IDX = [-1, -1, -1, -1, 2, 4, 6, 8]

def ima4_packet(pk, state):
    """One 34-byte QuickTime IMA4 packet -> 64 samples. state = [predictor, index] carried
    from the channel's previous packet: the header resets it only when its step index
    differs or its predictor is more than 127 away (Apple's AudioToolbox decoder does
    the same; `selftest` checks against it)."""
    h = struct.unpack(">H", pk[:2])[0]
    pred = h & 0xFF80
    if pred & 0x8000: pred -= 0x10000
    idx = h & 0x7F
    if state[0] is None or state[1] != idx or abs(pred - state[0]) > 0x7F: state[0], state[1] = pred, idx
    pred, idx = state
    idx = min(88, idx)
    out = []
    for byte in pk[2:34]:
        for nib in (byte & 0x0F, byte >> 4):
            step = IMA_STEP[idx]
            diff = step >> 3
            if nib & 4: diff += step
            if nib & 2: diff += step >> 1
            if nib & 1: diff += step >> 2
            pred = pred - diff if nib & 8 else pred + diff
            pred = max(-32768, min(32767, pred))
            idx = max(0, min(88, idx + IMA_IDX[nib & 7]))
            out.append(pred)
    state[0], state[1] = pred, idx
    return out

def aifc(kind, channels, frames, bits, data, rate=22050.0):
    """An AIFF-C file around compressed data, for ffmpeg."""
    import math
    m, e = math.frexp(rate)
    name = {"MAC3": b"\x0cMACE 3-to-1", "MAC6": b"\x0cMACE 6-to-1", "ima4": b"\x04IMA4", "ulaw": b"\x04ulaw"}[kind]
    comm = struct.pack(">hIh", channels, frames, bits) + struct.pack(">HQ", e + 16382, int(m * (1 << 64))) + kind.encode() + name
    if len(name) % 2: comm += b"\0"
    ssnd = struct.pack(">II", 0, 0) + data
    body = b"AIFC" + b"FVER" + struct.pack(">II", 4, 0xA2805140) + b"COMM" + struct.pack(">I", len(comm)) + comm + b"SSND" + struct.pack(">I", len(ssnd)) + ssnd
    return b"FORM" + struct.pack(">I", len(body)) + body

def ffmpeg(blob, fmt, codec, decoder=None):
    cmd = ["ffmpeg", "-v", "error"] + (["-c:a", decoder] if decoder else []) + ["-f", "aiff", "-i", "-", "-f", fmt, "-c:a", codec, "-"]
    r = subprocess.run(cmd, input=blob, capture_output=True)
    if r.returncode: raise RuntimeError("ffmpeg: " + r.stderr.decode()[:200])
    return r.stdout

def mace(data, kind, channels, packets):
    """MACE 3:1 or 6:1 through ffmpeg (AIFF-C wrapper) -> unsigned 8-bit interleaved."""
    per = 2 if kind == "MAC3" else 1   # bytes per channel per packet (6 samples)
    data = data[:packets * per * channels]
    return ffmpeg(aifc(kind, channels, packets * 6, 8, data), "u8", "pcm_u8")

def selftest(paths):
    """Decode every IMA4 and mu-law sound here and with ffmpeg; they must match exactly."""
    bad = n = 0
    for p in (q for src in paths for q in find_sets(src)):
        for rid, (rname, body) in resources(read_fork(p)).get("snd ", {}).items():
            if not body: continue
            hdr = parse_snd(body)[0]
            if body[hdr + 20] != 0xFE: continue
            info = decode_header(body, hdr)
            kind = info["compression"]
            if kind not in ("ima4", "ulaw"): continue
            ch = info["channels"]; frames = struct.unpack(">I", body[hdr + 22:hdr + 26])[0]
            data = body[hdr + 64:hdr + 64 + (frames * 34 * ch if kind == "ima4" else frames * ch)]
            for dec in ([None, "adpcm_ima_qt_at"] if kind == "ima4" else [None]):
                try: ref = ffmpeg(aifc(kind, ch, frames * (64 if kind == "ima4" else 1), 16, data), "s16le", "pcm_s16le", dec)
                except RuntimeError as e: print("  skip", dec, e); continue
                n += 1; same = ref[:len(info["pcm"])] == info["pcm"] and len(ref) == len(info["pcm"])
                if not same: bad += 1
                print(f"{'same' if same else 'DIFF'} {os.path.basename(p)} {rid} {kind} vs ffmpeg {dec or 'native'}: {len(info['pcm'])} / {len(ref)} bytes")
    print(f"{n - bad}/{n} identical"); return 1 if bad else 0

def decode_header(b, off):
    """Decode a sound header at off -> dict with pcm bytes (WAV byte order) and facts."""
    samplePtr, n4, rate, ls, le = struct.unpack(">IIIII", b[off:off + 20])
    encode, base = b[off + 20], b[off + 21]
    info = {"rate": rate / 65536, "rateFixed": rate, "loopStart": ls, "loopEnd": le, "baseNote": base}
    if encode == 0x00:   # stdSH: 8-bit unsigned mono, n4 = length in bytes
        data = b[off + 22:off + 22 + n4]
        info.update(encoding="stdSH", channels=1, bits=8, frames=len(data), pcm=data, declared=n4)
        return info
    channels = n4
    frames = struct.unpack(">I", b[off + 22:off + 26])[0]
    info["aiffRate"] = ext80(b[off + 26:off + 36])
    if encode == 0xFF:   # extSH
        bits = struct.unpack(">h", b[off + 48:off + 50])[0]
        nbytes = frames * channels * bits // 8
        data = b[off + 64:off + 64 + nbytes]
        if bits == 16:   # big-endian signed -> little-endian
            data = bytes(_swap16(data))
        info.update(encoding="extSH", channels=channels, bits=bits, frames=len(data) // (channels * bits // 8), pcm=data, declared=frames)
        return info
    if encode == 0xFE:   # cmpSH
        fmt = b[off + 40:off + 44]
        cid, packet, snth, bits = struct.unpack(">hhhh", b[off + 56:off + 64])
        kind = fmt.decode("mac_roman") if fmt != b"\0\0\0\0" else {3: "MAC3", 4: "MAC6"}.get(cid, f"cid{cid}")
        payload = b[off + 64:]
        info.update(compression=kind, compressionID=cid, packetSize=packet, sampleSize=bits)
        if kind == "ulaw":
            data = payload[:frames * channels]
            pcm = struct.pack(f"<{len(data)}h", *(ULAW[x] for x in data))
            info.update(encoding="cmpSH", channels=channels, bits=16, frames=len(data) // channels, pcm=pcm, declared=frames)
        elif kind == "ima4":
            ch = [[] for _ in range(channels)]; st = [[None, 0] for _ in range(channels)]
            for p in range(frames):
                for c in range(channels):
                    pk = payload[(p * channels + c) * 34:(p * channels + c + 1) * 34]
                    if len(pk) < 34: break
                    ch[c] += ima4_packet(pk, st[c])
            n = min(len(x) for x in ch)
            inter = [ch[c][i] for i in range(n) for c in range(channels)]
            info.update(encoding="cmpSH", channels=channels, bits=16, frames=n, pcm=struct.pack(f"<{len(inter)}h", *inter), declared=frames * 64)
        elif kind in ("MAC3", "MAC6"):
            pcm = mace(payload, kind, channels, frames)
            info.update(encoding="cmpSH", channels=channels, bits=8, frames=len(pcm) // channels, pcm=pcm, declared=frames * 6)
        elif kind in ("raw ", "NONE", "twos", "sowt"):
            nbytes = frames * channels * bits // 8
            data = payload[:nbytes]
            if bits == 16 and kind != "sowt": data = bytes(_swap16(data))
            if bits == 8 and kind == "twos": data = bytes((x + 128) & 0xFF for x in data)
            info.update(encoding="cmpSH", channels=channels, bits=bits, frames=len(data) // (channels * bits // 8), pcm=data, declared=frames)
        else:
            raise ValueError(f"cmpSH compression {kind!r}")
        return info
    raise ValueError(f"sound header encode 0x{encode:02x}")

def _swap16(data):
    a = bytearray(data[:len(data) & ~1])
    a[0::2], a[1::2] = data[1:len(a):2], data[0:len(a):2]
    return a

def decode_snd(body):
    hdr, cmds, fmt, mods = parse_snd(body)
    if hdr + 22 > len(body):
        raise ValueError("no sampled sound (a synthesizer's commands only, e.g. Simple Beep): record it with `capture`")
    info = decode_header(body, hdr)
    if any((c & 0x7FFF) in (0x28, 0x29, 0x2A) for c, _, _ in cmds):
        # the sample is an instrument played by note commands (System 6's Clink-Klank): what
        # the Mac plays is not the sample; record it from the emulator with `capture`
        info["notes"] = True
    info["format"] = fmt
    info["commands"] = [{"cmd": CMD.get(c & 0x7FFF, hex(c & 0x7FFF)), "param1": p1, "param2": p2} for c, p1, p2 in cmds]
    if mods: info["modifiers"] = [{"id": i, "init": v} for i, v in mods]
    return info

def write_wav(path, info):
    with wave.open(path, "wb") as w:
        w.setnchannels(info["channels"]); w.setsampwidth(info["bits"] // 8)
        w.setframerate(max(1, round(info["rate"])))
        w.writeframes(info["pcm"])

# ---- finding sets ----------------------------------------------------------------
def slug(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-") or "set"

def find_sets(root):
    """Yield paths of 'tsnd' files under root (a file, a folder or a .sit archive)."""
    if os.path.isfile(root) and root.lower().endswith(".sit"):
        tmp = tempfile.mkdtemp(prefix="soundset-")
        import atexit; atexit.register(shutil.rmtree, tmp, True)
        subprocess.run(["unar", "-q", "-o", tmp, root], check=True)
        yield from find_sets(tmp)
        return
    if os.path.isfile(root):
        yield root; return
    for dp, dns, fns in os.walk(root):
        dns.sort()
        for fn in sorted(fns):
            p = os.path.join(dp, fn)
            t, _ = finder_type(p)
            # a set is a 'tsnd' file; one set here (oddworld) lost its Finder info but kept its map
            if t == "tsnd" or (t is None and "snd#" in resources(read_fork(p))): yield p

def build_set(path, out, scan=False):
    res = resources(read_fork(path))
    snds = res.get("snd ", {})
    ids = set(snds)
    maps = res.get("snd#", {})
    name = os.path.basename(path)
    man = {"name": name, "source": name, "classes": CLASS, "sounds": {}, "events": {}, "loops": {}, "problems": []}
    used = {}
    for rid, (rname, body) in sorted(snds.items()):
        if not body:   # an empty 'snd ' (11 in the first archive, 15 in Windows NT): exists, plays nothing
            man["sounds"][str(rid)] = {"name": rname, "empty": True}
            continue
        try:
            info = decode_snd(body)
        except Exception as e:
            man["problems"].append(f"'snd ' {rid} {rname!r}: {e}")
            continue
        pcm = info.pop("pcm")
        fn = f"{rid}.wav"
        info.update(file=fn, name=rname, sha1=hashlib.sha1(pcm).hexdigest())
        man["sounds"][str(rid)] = info
        used[rid] = (info, pcm)
    for mid, key, kind in ((1000, "events", "one-shot"), (1001, "loops", "loop")):
        if mid not in maps: continue
        for code, e in read_map(maps[mid][1], set(int(k) for k in man["sounds"])):
            e["kind"] = kind
            e["classes"] = [v for b, v in CLASS.items() if e["class"] & b]
            if e["sound"] is not None and "file" in man["sounds"][str(e["sound"])]:
                s = man["sounds"][str(e["sound"])]
                e["file"] = s["file"]
                e["loopPoints"] = [s["loopStart"], s["loopEnd"]]
            man[key][code] = e
    man["layout"] = next((e["layout"] for e in man["events"].values()), None)
    resolve(man)
    if not scan:
        os.makedirs(out, exist_ok=True)
        for rid, (info, pcm) in used.items():
            write_wav(os.path.join(out, info["file"]), dict(info, pcm=pcm))
        with open(os.path.join(out, "manifest.json"), "w") as f: json.dump(man, f, indent=1, ensure_ascii=False)
    return man

# Drag loops' classes in the 8.5b6 map (whose loop entries carry no class): as the release sets'.
LOOP_CLASS = {"wmov": 1, "wgro": 1, "umov": 1, "ugro": 1, "dmov": 1, "amov": 1, "imov": 1, "slth": 4, "slgh": 1,
              "sbth": 4, "sbgh": 4, "drag": 1, "sbai": 4, "sbad": 4}

def resolve(man):
    """What the player needs, worked out once: for each effect the sound and gain that play,
    for each drag loop its four roles. Measured in Mac OS 9.0 with Platinum Sounds (SOUND-SETS.md):
    a slot's level is a gain of level/255, 0 meaning full (tabp 185 -> 0.730, tabr 0 -> 0.99,
    chke 55 -> 0.22, wmov idle 45 -> 0.17); a drag loop's slots are attack, moving, idle and
    release (Platinum's own names: 'sbth attack', 'wmov moving', 'wmov idle', 'wmov release';
    8.5b6: attack, loop, '(release)'), and the idle loop plays while the drag holds still.
    Not used: the per-slot Fixed value and the entry's delay field (meaning not settled)."""
    def ref(sid, level=0):
        snd = man["sounds"].get(str(sid)) if sid else None
        if not snd: return None
        if snd.get("empty"): return {"sound": sid, "silent": True}
        return {"sound": sid, "file": snd["file"], "gain": round(level / 255, 4) if level else 1.0,
                "loop": [snd["loopStart"], snd["loopEnd"]] if snd["loopEnd"] > snd["loopStart"] + 1 else None}
    for code, e in man["events"].items():
        slot = next((x for x in e["slots"] if str(x["id"]) in man["sounds"]), None)
        e["play"] = ref(slot["id"], slot.get("level", 0)) if slot else None
    for code, e in man["loops"].items():
        sl = e["slots"]
        if e["layout"] == "8.5b6":
            e["class"] = LOOP_CLASS.get(code, 1); e["classes"] = [v for b, v in CLASS.items() if e["class"] & b]
            roles = [sl[0], sl[1], sl[1], sl[2]]
        else:
            roles = sl
        e["roles"] = {name: ref(x["id"], x.get("level", 0)) for name, x in zip(("attack", "moving", "idle", "release"), roles)}

def summary(man):
    from collections import Counter
    enc = Counter()
    for s in man["sounds"].values():
        if s.get("empty"): enc["empty"] += 1; continue
        enc[(s["encoding"], s.get("compression", ""), s["bits"], s["channels"], s["format"])] += 1
    played = sum(1 for e in man["events"].values() if "file" in e)
    loops = sum(1 for e in man["loops"].values() if "file" in e)
    return f"{man['name']}: {len(man['sounds'])} sounds, {played}/{len(man['events'])} effects, {loops}/{len(man['loops'])} loops, {man['layout']}; " + ", ".join(f"{k}x{v}" for k, v in sorted(enc.items(), key=str)) + (f"; PROBLEMS {man['problems']}" if man["problems"] else "")

# The alert lists, as each era's control panel shows them (measured in Infinite Mac,
# 2026-11-15), and where their sounds come from under <fidelity>/soundsets/alerts-src/<era>/:
# 'snd ' files or a System file the emulator handed out, and recordings of the sounds the
# Mac synthesizes (Simple Beep; System 6's Clink-Klank, an instrument played by notes).
ALERTS = {
    "system6": {"source": "System 6.0.8", "eras": ["system6"],
                "list": ["Simple Beep", "Clink-Klank", "Boing", "Monkey"], "selected": "Simple Beep",
                "captures": {"Simple Beep": ("simple-beep.wav", 22254.5454), "Clink-Klank": ("clink-klank.wav", 22254.5454)}},
    "system7": {"source": "System 7.5.3", "eras": ["system7"],
                "list": ["Basil", "Bend Me", "Blue Dust", "Bye!", "Dewdrop", "Droplet", "Indigo", "Jacaranda", "Natal", "Quack",
                         "Ryan's Hope", "Sheet", "Simple Beep", "Solly", "Sosumi", "Transvaal", "Wild Eep"], "selected": "Sosumi",
                "captures": {"Simple Beep": ("simple-beep.wav", 22050.0)}},
    # Mac OS 8.5 (Drawing Board): its own six, measured in Monitors & Sound > Alerts
    # (there is no Sound control panel in 8.5). All six are recordings of the emulator's
    # output: the System suitcase holds five snd resources (Quack, not Laugh, among them),
    # and they could not be dragged out this session (SOUND-SETS.md §8).
    "drawingboard": {"source": "Mac OS 8.5", "eras": ["drawingboard"],
                     "list": ["Droplet", "Indigo", "Laugh", "Simple Beep", "Sosumi", "Wild Eep"], "selected": "Sosumi",
                     "captures": {"Droplet": ("droplet.wav", 22050.0), "Indigo": ("indigo.wav", 22050.0),
                                  "Laugh": ("laugh.wav", 22050.0), "Simple Beep": ("simple-beep.wav", 22050.0),
                                  "Sosumi": ("sosumi.wav", 22050.0), "Wild Eep": ("wild-eep.wav", 22050.0)},
                     "capture_note": "recorded from the emulator's output (Monitors & Sound > Alerts): not decoded from 8.5's System file; Droplet, Indigo, Sosumi and Wild Eep match System 7.5.3's decoded samples (correlation 0.99978-0.99995), Laugh differs from 9.0's"},
    "platinum": {"source": "Mac OS 9.0", "eras": ["platinum"],
                 "list": ["ChuToy", "Glass", "Indigo", "Laugh", "Logjam", "Pong2003", "Purr", "SimpleBeep", "Sosumi",
                          "Submarine", "Temple", "Uh oh", "Voltage"], "selected": "Sosumi",
                 "captures": {"SimpleBeep": ("simple-beep.wav", 22050.0)}},
}
# Each era's default sound track (owner, 2026-11-15).
DEFAULT_SETS = {"drawingboard": "drawingboard-sounds", "platinum": "platinum-sounds"}
# What the owner's sites serve (owner, 2026-11-15): Apple's four sets and the alert sounds;
# the third-party sets stay on this machine (`packs --all` builds them too).
APPLE_SETS = {"platinum-sounds", "drawingboard-sounds", "gizmo-sounds", "hi-tech-sounds"}

def build_alerts(era, src, out):
    cfg = ALERTS[era]
    os.makedirs(out, exist_ok=True)
    tmp = tempfile.mkdtemp(prefix="alerts-"); import atexit; atexit.register(shutil.rmtree, tmp, True)
    files = []
    for fn in sorted(os.listdir(src)):
        p = os.path.join(src, fn)
        if fn.endswith(".zip"):   # Infinite Mac's downloads: AppleDouble inside, so ditto restores the forks
            d = os.path.join(tmp, fn[:-4]); subprocess.run(["ditto", "-x", "-k", p, d], check=True)
            files += [os.path.join(d, x) for x in sorted(os.listdir(d)) if not x.startswith(("__MACOSX", "."))]
    man = {"kind": "alerts", "era": era, "eras": cfg["eras"], "source": cfg["source"], "list": cfg["list"], "selected": cfg["selected"], "alerts": {}, "problems": []}
    for f in files:
        for rid, (rname, body) in sorted(resources(read_fork(f)).get("snd ", {}).items()):
            name = rname or os.path.basename(f)
            if name not in cfg["list"] or name in cfg["captures"]: continue
            info = decode_snd(body)
            if info.get("notes"): continue
            pcm = info.pop("pcm"); fn = f"{slug(name)}.wav"
            write_wav(os.path.join(out, fn), dict(info, pcm=pcm))
            info.update(file=fn, id=rid, sha1=hashlib.sha1(pcm).hexdigest())
            man["alerts"][name] = info
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from soundcompare import read_wav
    for name, (fn, rate) in cfg["captures"].items():
        _, chs = read_wav(os.path.join(src, fn)); x = [round(v) for v in chs[0]]
        nz = [i for i, v in enumerate(x) if v not in (0, -1)]; x = [max(-32768, min(32767, v)) for v in x[nz[0]:nz[-1] + 1]]
        byte = all(((v >> 8) & 0xFF) == (v & 0xFF) for v in x)
        info = {"rate": rate, "channels": 1, "bits": 8 if byte else 16, "frames": len(x), "encoding": "capture", "loopStart": 0, "loopEnd": 0}
        pcm = bytes(((v >> 8) + 128) & 0xFF for v in x) if byte else struct.pack(f"<{len(x)}h", *x)
        out_fn = f"{slug(name)}.wav"; write_wav(os.path.join(out, out_fn), dict(info, pcm=pcm))
        info.update(file=out_fn, sha1=hashlib.sha1(pcm).hexdigest(), note=cfg.get("capture_note", "recorded from the emulator's output: the Mac synthesizes this sound"))
        man["alerts"][name] = info
    missing = [n for n in cfg["list"] if n not in man["alerts"]]
    if missing: man["problems"].append(f"missing: {missing}")
    with open(os.path.join(out, "manifest.json"), "w") as f: json.dump(man, f, indent=1, ensure_ascii=False)
    print(f"{cfg['source']} alerts: {len(man['alerts'])}/{len(cfg['list'])}" + (f" PROBLEMS {man['problems']}" if man["problems"] else ""))
    return man

def build_packs(fidelity, out, everything=False):
    """What the owner's sites serve: Apple's four sound sets (all 42 with --all) and the
    four alert lists (6.0.8, 7.5.3, 8.5, 9.0)."""
    sits = sorted(os.path.join(fidelity, "soundsets", "downloads", f) for f in os.listdir(os.path.join(fidelity, "soundsets", "downloads")) if f.endswith(".sit"))
    rc = main(["build", *sits, os.path.join(out, "sets")])
    with open(os.path.join(out, "sets", "index.json")) as f: sets = json.load(f)
    if not everything:
        for x in sets:
            if x["slug"] not in APPLE_SETS: shutil.rmtree(os.path.join(out, "sets", x["slug"]))
        sets = [x for x in sets if x["slug"] in APPLE_SETS]
        with open(os.path.join(out, "sets", "index.json"), "w") as f: json.dump(sets, f, indent=1, ensure_ascii=False)
    alerts = {}
    for era in ALERTS:
        m = build_alerts(era, os.path.join(fidelity, "soundsets", "alerts-src", era), os.path.join(out, "alerts", era))
        alerts[era] = {"manifest": f"alerts/{era}/manifest.json", "eras": m["eras"], "selected": m["selected"], "count": len(m["alerts"])}
    index = {"sets": [dict(x, manifest="sets/" + x["manifest"]) for x in sets], "alerts": alerts, "defaults": DEFAULT_SETS}
    with open(os.path.join(out, "index.json"), "w") as f: json.dump(index, f, indent=1, ensure_ascii=False)
    print(f"{len(sets)} sets, {len(alerts)} alert lists -> {out}")
    return rc

def main(argv):
    if not argv or (len(argv) < 2 and argv[0] != "packs"): print(__doc__); return 2
    cmd = argv[0]
    if cmd in ("build", "scan"):
        srcs = argv[1:-1] if cmd == "build" else argv[1:]; out = argv[-1] if cmd == "build" else None
        index, seen = [], {}
        for p in (q for src in srcs for q in find_sets(src)):
            man = build_set(p, None, scan=True)
            # identical sets (same sounds and map) in several archives: build once
            key = hashlib.sha1(json.dumps([man["name"], man["sounds"], man["events"], man["loops"]], sort_keys=True, default=str).encode()).hexdigest()
            if key in seen: print(f"same as {seen[key]}: {p}"); continue
            s = slug(man["name"])
            while s in seen.values(): s += "-2"
            seen[key] = s
            if cmd == "build": man = build_set(p, os.path.join(out, s))
            print(summary(man))
            index.append({"slug": s, "name": man["name"], "manifest": f"{s}/manifest.json", "sounds": len(man["sounds"])})
        if cmd == "build":
            os.makedirs(out, exist_ok=True)
            with open(os.path.join(out, "index.json"), "w") as f: json.dump(index, f, indent=1, ensure_ascii=False)
        return 0
    if cmd == "alerts":
        # alerts <out dir> <file>...: every 'snd ' in a System file or in sound files ('sfil',
        # as the System 7 Finder drags them out of the System suitcase)
        out, srcs = argv[1], argv[2:]
        os.makedirs(out, exist_ok=True)
        man = {"alerts": {}, "problems": []}
        for src in srcs:
            for rid, (rname, body) in sorted(resources(read_fork(src)).get("snd ", {}).items()):
                name = rname or os.path.basename(src)
                try: info = decode_snd(body)
                except Exception as e: man["problems"].append(f"{name} {rid}: {e}"); continue
                if info.get("notes"): man["problems"].append(f"{name} {rid}: played by note commands, record it"); continue
                pcm = info.pop("pcm"); fn = f"{slug(name)}.wav"
                write_wav(os.path.join(out, fn), dict(info, pcm=pcm))
                info.update(file=fn, id=rid, source=os.path.basename(src), sha1=hashlib.sha1(pcm).hexdigest())
                man["alerts"][name] = info
                print(f"{name}: 'snd ' {rid}, {info['encoding']} {info.get('compression', '')} {info['bits']}-bit x{info['channels']} at {info['rate']:.3f} Hz, {info['frames']} frames, commands {[c['cmd'] for c in info['commands']]}")
        with open(os.path.join(out, "manifest.json"), "w") as f: json.dump(man, f, indent=1, ensure_ascii=False)
        return 1 if man["problems"] else 0
    if cmd == "selftest": return selftest(argv[1:])
    if cmd == "packs":
        here = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        everything = "--all" in argv; rest = [a for a in argv[1:] if a != "--all"]
        return build_packs(rest[0] if rest else os.path.join(here, ".fidelity"), rest[1] if len(rest) > 1 else os.path.join(here, "packs"), everything)
    if cmd == "capture":
        # capture <capture.wav> <out.wav> [name]: a sound the Mac synthesizes (Simple Beep: no
        # sampled 'snd ' to decode) kept as the emulator played it, from its first to its last
        # sound sample; 8-bit when every sample is a byte repeated (the 8-bit output path)
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        from soundcompare import read_wav
        rate, chs = read_wav(argv[1]); x = [round(v) for v in chs[0]]
        if "--rate" in argv: rate = float(argv[argv.index("--rate") + 1])   # System 6: 22254.5454 (see soundcompare.py)
        nz = [i for i, v in enumerate(x) if v not in (0, -1)]
        x = x[nz[0]:nz[-1] + 1]
        byte = all(((v >> 8) & 0xFF) == (v & 0xFF) for v in x)
        x = [max(-32768, min(32767, v)) for v in x]
        info = {"rate": float(rate), "channels": 1, "bits": 8 if byte else 16, "frames": len(x), "encoding": "capture"}
        info["pcm"] = bytes(((v >> 8) + 128) & 0xFF for v in x) if byte else struct.pack(f"<{len(x)}h", *x)
        write_wav(argv[2], info)
        print({k: v for k, v in info.items() if k != "pcm"}); return 0
    if cmd == "snd":
        res = resources(read_fork(argv[1])); info = decode_snd(res["snd "][int(argv[2])][1])
        write_wav(argv[3], info); print({k: v for k, v in info.items() if k != "pcm"}); return 0
    print(__doc__); return 2

if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
