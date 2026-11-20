#!/usr/bin/env python3
"""Записана озвучка англійської: один файл з AI Studio → окремі mp3 на кожну фразу + словник index.json.
   python3 tools/en_audio.py content/audio/en/batch01.txt <файл.wav>
   Файл фрази називається за хешем нормалізованого тексту; speech.js (SAY.say) шукає фразу в index.json
   і грає запис замість голосу пристрою. Нормалізація ОДНАКОВА з speech.js: нижній регістр, без розмітки,
   лише літери/цифри/апостроф/пробіл."""
import sys, os, re, json, hashlib, subprocess, tempfile, shutil
txt, src = sys.argv[1], sys.argv[2]
here = os.path.dirname(os.path.abspath(__file__)); out = os.path.join(here, "..", "content", "audio", "en")
def norm(t):
    t = re.sub(r"<[^>]+>", "", t).replace("’", "'").replace("‘", "'").lower()
    t = re.sub(r"[^a-z0-9' ]+", " ", t)
    return re.sub(r"\s+", " ", t).strip()
phr = [p.strip() for p in re.split(r"\n\s*\n", open(txt, encoding="utf-8").read()) if p.strip()]
tmp = tempfile.mkdtemp()
subprocess.check_call([sys.executable, os.path.join(here, "split_audio.py"), src, txt, tmp])
idx_path = os.path.join(out, "index.json")
idx = json.load(open(idx_path)) if os.path.exists(idx_path) else {}
for i, p in enumerate(phr):
    k = norm(p); name = hashlib.sha1(k.encode()).hexdigest()[:10] + ".mp3"
    shutil.move(os.path.join(tmp, "%02d.mp3" % (i + 1)), os.path.join(out, name)); idx[k] = name
json.dump(idx, open(idx_path, "w"), ensure_ascii=False, indent=0, sort_keys=True)
shutil.rmtree(tmp); print("готово: %d фраз, у словнику %d" % (len(phr), len(idx)))
