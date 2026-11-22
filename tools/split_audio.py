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
# Вибір n−1 пауз динамічним програмуванням: довші паузи — краще; тривалість кожного шматка має відповідати
# довжині тексту фрази (символи × темп). Так не плутаються паузи всередині фрази («Hi! I am Anya.») з паузами між фразами.
gaps = [g for g in gaps if g[0] >= 0.25]
m = len(gaps)
if m < n - 1: sys.exit("замало пауз: знайдено %d, треба %d" % (m, n - 1))
chars = [max(4, len(re.sub(r"\s+", " ", p))) for p in phr]
top = sum(sorted((g[0] for g in gaps), reverse=True)[: n - 1])
rate = (dur - top) / float(sum(chars))          # секунд на символ
exp = [c * rate for c in chars]
INF = float("inf"); A = 1.0                      # штраф за розбіжність тривалості шматка
def seg(a_end, b_start, k): return A * abs((b_start - a_end) - exp[k]) / max(0.6, exp[k]) ** 0.5
def solve(B):                                     # B — бонус за 1 с паузи
    dp = [[INF] * m for _ in range(n - 1)]; bk = [[-1] * m for _ in range(n - 1)]
    for j in range(m): dp[0][j] = seg(0.0, gaps[j][1], 0) - B * gaps[j][0]
    for i in range(1, n - 1):
        for j in range(i, m):
            best, arg = INF, -1
            for q in range(i - 1, j):
                if dp[i - 1][q] == INF: continue
                v = dp[i - 1][q] + seg(gaps[q][2], gaps[j][1], i)
                if v < best: best, arg = v, q
            if arg >= 0: dp[i][j] = best - B * gaps[j][0]; bk[i][j] = arg
    fin = min(range(m), key=lambda j: dp[n - 2][j] + seg(gaps[j][2], dur, n - 1) if dp[n - 2][j] < INF else INF)
    idxs = [fin]
    for i in range(n - 2, 0, -1): idxs.append(bk[i][idxs[-1]])
    return [gaps[j] for j in reversed(idxs)]
def corr(c):                                      # наскільки тривалості шматків відповідають довжині фраз
    b = [0.0] + [(g[1] + g[2]) / 2 for g in c] + [dur]; D = [b[k + 1] - b[k] for k in range(n)]
    mx = sum(chars) / float(n); my = sum(D) / float(n)
    den = (sum((a - mx) ** 2 for a in chars) * sum((d - my) ** 2 for d in D)) ** 0.5
    return sum((a - mx) * (d - my) for a, d in zip(chars, D)) / den if den else 0
# паузи між фразами не завжди довші за паузи всередині («Did Max win? — No, he didn't.»),
# тому пробуємо різну вагу пауз і беремо розбивку, де тривалості найкраще відповідають тексту
cands = [(corr(c), B, c) for B in (10, 4, 2, 1, 0.5) for c in [solve(B)]]
best = max(cands, key=lambda t: t[0] + (0.02 if t[1] == 10 else 0))
cuts = best[2]
sys.stderr.write("вага пауз %s, відповідність %.2f\n" % (best[1], best[0]))
starts = [0.0] + [e - 0.05 for _, s, e in cuts]; ends = [s + 0.12 for _, s, e in cuts] + [dur]
for i, (a, b) in enumerate(zip(starts, ends)):
    f = os.path.join(out, "%02d.mp3" % (i + 1))
    subprocess.check_call(["ffmpeg", "-y", "-loglevel", "error", "-ss", "%.2f" % a, "-t", "%.2f" % (b - a), "-i", clean, "-af", "loudnorm=I=-16:TP=-1.5", "-ac", "1", "-ar", "44100", "-b:a", "80k", f])
    print("%02d  %.2f с" % (i + 1, b - a))
os.remove(clean)
