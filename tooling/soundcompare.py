"""Compare a decoded sound with the same sound captured from the emulator's audio output.

  python3 tooling/soundcompare.py <capture.wav> <decoded.wav> [--rate R] [--capture-rate R] [--offset] [--json out.json]

<capture.wav> comes from tooling/emulator/drive.mjs (`arec` / `astop`): 32-bit float, the
emulator's output as Web Audio was handed it (22,050 Hz in Infinite Mac's System 7.5.3
and Mac OS 9.0). <decoded.wav> comes from tooling/soundset.py. --rate gives the sound's
exact rate (the 'snd ' header's Fixed rate, e.g. 11127.2727) when the WAV's integer rate
is rounded. --capture-rate gives the emulator's true output rate where Infinite Mac labels
it wrongly: System 6.0.8 (Mini vMac) produces the Macintosh's 22,254.5454 Hz and hands it
to Web Audio as 22,050 Hz (measured: Boing and Monkey match only at a ratio of exactly
2 output samples per 11,127 Hz sample). --offset also fits a DC offset.

The Sound Manager plays a sound at the output's rate by interpolating between source
samples, mixes, and (in these emulators) hands out 8-bit values widened to 16 bits by
repeating the byte. So the comparison models that path: the decoded sound, interpolated
linearly to the output rate at every phase and lag near the onset, gain fitted by least
squares, then compared sample by sample. Reported: the best phase and lag, the fitted
gain, the correlation, how many samples are identical (16-bit, at unity gain), equal in
8-bit steps or within one step,
the largest difference, and the lengths. Stdlib only.
"""
import json, math, struct, sys, wave

def read_wav(path):
    """-> (rate, [channel lists], kind) with float samples scaled to signed 16-bit units."""
    with open(path, "rb") as f: d = f.read()
    assert d[:4] == b"RIFF" and d[8:12] == b"WAVE", path
    p = 12; fmt = None
    while p < len(d):
        cid, ln = d[p:p + 4], struct.unpack("<I", d[p + 4:p + 8])[0]
        body = d[p + 8:p + 8 + ln]
        if cid == b"fmt ": fmt = struct.unpack("<HHIIHH", body[:16])
        elif cid == b"data": data = body
        p += 8 + ln + (ln & 1)
    tag, ch, rate, _, _, bits = fmt
    if tag == 3 and bits == 32: v = [x * 32768 for x in struct.unpack(f"<{len(data) // 4}f", data)]
    elif bits == 16: v = list(struct.unpack(f"<{len(data) // 2}h", data))
    elif bits == 8: v = [(x - 128) * 256 for x in data]
    else: raise ValueError(f"{path}: {bits}-bit format {tag}")
    return rate, [v[c::ch] for c in range(ch)]

def mono(chs):
    # the emulator's output is mono (left = right); the Sound Manager mixed a stereo sound
    # down as (left + right) >> 1 (measured: Sheet, System 7.5.3)
    if len(chs) == 2 and all(isinstance(v, int) for v in chs[0][:64]): return [(a + b) >> 1 for a, b in zip(*chs)]
    return [sum(x) / len(chs) for x in zip(*chs)]

def lerp_resample(src, ratio, phase, n):
    out = []
    for k in range(n):
        p = k * ratio + phase; i = int(p)
        if i + 1 >= len(src): out.append(src[-1] if i < len(src) else 0.0); continue
        f = p - i; out.append(src[i] + (src[i + 1] - src[i]) * f)
    return out

def onset(x, thresh):
    return next((i for i, v in enumerate(x) if abs(v) > thresh), None)

def compare(cap_path, dec_path, rate=None, offset=False, capture_rate=None):
    crate, cch = read_wav(cap_path)
    crate = capture_rate or crate
    drate, dch = read_wav(dec_path)
    rate = rate or drate
    cap = mono(cch); src = mono(dch)
    # one 8-bit step of the output is 256 in 16-bit units; the capture's silence is 0 or -1
    c0 = onset(cap, 300); s0 = onset(src, 300)
    end = max(i for i, v in enumerate(cap) if abs(v) > 300)
    ratio = rate / crate
    n_out = int((len(src) - s0) / ratio)
    best = None
    for phase16 in range(int(16 * max(1, ratio))):   # a whole source sample of phases
        phase = s0 + phase16 / 16 - 2 * ratio   # start a little before the source's onset
        model = lerp_resample(src, ratio, phase, n_out + 8)
        for lag in range(-40, 41):
            a = c0 + lag - 2
            if a < 0: continue
            seg = cap[a:a + len(model)]
            m = model[:len(seg)]
            # least squares y = g x + b: gain and a DC offset (System 6's Mini vMac output
            # sits 3 steps below zero while a sound plays)
            n = len(m); sx_ = sum(m); sy_ = sum(seg)
            sxy = sum(x * y for x, y in zip(m, seg)); sxx = sum(x * x for x in m)
            den = n * sxx - sx_ * sx_
            if not den: continue
            g = (n * sxy - sx_ * sy_) / den; bb = (sy_ - g * sx_) / n
            if not offset: g, bb = sxy / sxx, 0.0
            err = sum((y - g * x - bb) ** 2 for x, y in zip(m, seg))
            if best is None or err < best[0]: best = (err, phase16 / 16, lag, g, a, m, seg, bb)
    err, ph, lag, g, a, m, seg, bb = best
    seg = [y - bb for y in seg]
    sy = sum(y * y for y in seg); sx = sum(x * x for x in m)
    corr = sum(x * y for x, y in zip(m, seg)) / math.sqrt(sx * sy) if sx and sy else 0
    exact = sum(1 for x, y in zip(m, seg) if round(y) == round(x)) if abs(g - 1) < 1e-3 else 0
    step = [round((y - g * x) / 256) for x, y in zip(m, seg)]
    diffs = [abs(y - g * x) / 256 for x, y in zip(m, seg)]
    res = {
        "capture": cap_path, "decoded": dec_path, "outputRate": crate, "soundRate": rate,
        "phase": ph, "lag": lag, "gain": round(g, 5), "offset": round(bb / 256, 3), "correlation": round(corr, 6),
        "samples": len(seg), "identical": exact, "identical8bit": sum(1 for s in step if s == 0),
        "withinOneStep": sum(1 for d in diffs if d <= 1.0), "maxDiffSteps": round(max(diffs), 2),
        # from the first to the last sample above 300 (about one 8-bit step), in output samples
        "capturedLength": end - c0 + 1, "expectedLength": round((max(i for i, v in enumerate(src) if abs(v) > 300) - s0) / ratio) + 1,
    }
    return res

if __name__ == "__main__":
    args = sys.argv[1:]
    rate = float(args[args.index("--rate") + 1]) if "--rate" in args else None
    out = args[args.index("--json") + 1] if "--json" in args else None
    crate = float(args[args.index("--capture-rate") + 1]) if "--capture-rate" in args else None
    r = compare(args[0], args[1], rate, "--offset" in args, crate)
    print(json.dumps(r, indent=1))
    if out:
        with open(out, "w") as f: json.dump(r, f, indent=1)
