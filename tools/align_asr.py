#!/usr/bin/env python3
"""Межі фраз за розпізнаванням мови (коли паузи не допомагають: діалоги «Are you ready? Yes, I am.»).
   python3 tools/align_asr.py <файл> <текст.txt>  → друкує межі (секунди) через кому для CUTS=... split_audio.py
   Ідемо по фразах: для кожної пробуємо кінець на 1–5 наступних паузах, розпізнаємо шматок (Whisper tiny.en,
   sherpa-onnx; модель з GitHub-релізу k2-fsa/sherpa-onnx у /tmp) і беремо найсхожіший на очікуваний текст."""
import sys, re, subprocess, difflib, numpy as np, sherpa_onnx
src, txt = sys.argv[1], sys.argv[2]
M = "/tmp/sherpa-onnx-whisper-tiny.en/tiny.en"
rec = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=M + "-encoder.int8.onnx", decoder=M + "-decoder.int8.onnx", tokens=M + "-tokens.txt", num_threads=2)
def norm(t):
    t = t.replace("’", "'").lower(); t = re.sub(r"[^a-z0-9' ]+", " ", t); return re.sub(r"\s+", " ", t).strip()
phr = [norm(p) for p in re.split(r"\n\s*\n", open(txt, encoding="utf-8").read()) if p.strip()]
raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", src, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True).stdout
A = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768; dur = len(A) / 16000.0
log = subprocess.run(["ffmpeg", "-hide_banner", "-i", src, "-af", "silencedetect=n=-35dB:d=0.25", "-f", "null", "-"], capture_output=True, text=True).stderr
st = [float(x) for x in re.findall(r"silence_start: ([0-9.]+)", log)]; en = [float(x) for x in re.findall(r"silence_end: ([0-9.]+)", log)]
mids = [(s + e) / 2 for s, e in zip(st, en) if s > 0.3 and e < dur - 0.2]
def hear(a, b):
    s = rec.create_stream(); seg = A[int(a * 16000):int(b * 16000)]
    s.accept_waveform(16000, np.concatenate([np.zeros(4000, np.float32), seg, np.zeros(4800, np.float32)])); rec.decode_stream(s)
    return norm(s.result.text)
NUMW = {"twelve": "12", "eight": "8", "seven": "7", "ten": "10", "six": "6", "eleven": "11", "five": "5", "three": "3", "two": "2", "one": "1"}
def canon(t): return " ".join(NUMW.get(w, w) for w in t.split())
def sim(a, b): return difflib.SequenceMatcher(None, canon(a), canon(b)).ratio()
t0 = 0.0; cuts = []
for i, p in enumerate(phr[:-1]):
    cand = [m for m in mids if m > t0 + 0.3][:5]
    best = max(cand, key=lambda m: (sim(hear(t0, m), p), -m))
    cuts.append(best); t0 = best
    sys.stderr.write("%2d %.2f %s\n" % (i + 1, best, p))
print(",".join("%.2f" % c for c in cuts))
