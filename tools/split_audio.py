#!/usr/bin/env python3
"""Ріже один аудіофайл озвучки (з Google AI Studio чи ElevenLabs) на фрази за паузами.
   python3 tools/split_audio.py <файл.wav|mp3> <текст.txt> <тека виходу>
   текст.txt — фрази в тому ж порядку, по одній на абзац (між абзацами порожній рядок).
   Межу кожної фрази очікуємо пропорційно до кількості символів і беремо найближчу паузу (довшу — охочіше);
   ріже, нормалізує гучність, mp3 моно 80 кбіт/с → 01.mp3, 02.mp3…
   Після нарізки ОБОВ'ЯЗКОВО звір тривалості з довжиною тексту фраз (довша фраза — довший файл)."""
import subprocess, sys, re, os
src, txt, out = sys.argv[1], sys.argv[2], sys.argv[3]
phr = [p.strip() for p in re.split(r"\n\s*\n", open(txt, encoding="utf-8").read()) if p.strip()]
n = len(phr)
os.makedirs(out, exist_ok=True)
clean = os.path.join(out, "_full.wav")
subprocess.check_call(["ffmpeg", "-y", "-loglevel", "error", "-i", src, "-c:a", "pcm_s16le", clean])  # чистий WAV: у файлів AI Studio битий заголовок
dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", clean]))
log = subprocess.run(["ffmpeg", "-hide_banner", "-i", clean, "-af", "silencedetect=n=-35dB:d=0.3", "-f", "null", "-"], capture_output=True, text=True).stderr
st = [float(x) for x in re.findall(r"silence_start: ([0-9.]+)", log)]; en = [float(x) for x in re.findall(r"silence_end: ([0-9.]+)", log)]
gaps = [(e - s, s, e) for s, e in zip(st, en) if s > 0.5 and e < dur - 0.3]
tot = float(sum(len(p) for p in phr)); acc = 0; cuts = []
for p in phr[:-1]:
    acc += len(p); exp = dur * acc / tot
    cand = [g for g in gaps if not cuts or g[1] > cuts[-1][2]]
    if not cand: sys.exit("замало пауз після %.1f с" % (cuts[-1][2] if cuts else 0))
    near = [g for g in cand if abs((g[1] + g[2]) / 2 - exp) <= max(3.0, 0.04 * dur)]
    cuts.append(max(near, key=lambda g: g[0]) if near else min(cand, key=lambda g: abs((g[1] + g[2]) / 2 - exp)))  # у вікні ±3 с — найдовша пауза
starts = [0.0] + [e - 0.05 for _, s, e in cuts]; ends = [s + 0.12 for _, s, e in cuts] + [dur]
for i, (a, b) in enumerate(zip(starts, ends)):
    f = os.path.join(out, "%02d.mp3" % (i + 1))
    subprocess.check_call(["ffmpeg", "-y", "-loglevel", "error", "-i", clean, "-ss", "%.2f" % a, "-to", "%.2f" % b, "-af", "loudnorm=I=-16:TP=-1.5", "-ac", "1", "-ar", "44100", "-b:a", "80k", f])
    print("%02d  %.2f с" % (i + 1, b - a))
os.remove(clean)
