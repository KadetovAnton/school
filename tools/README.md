# tools — генератори змісту і перевірки

Зміст у `content/` **генерується** цими скриптами — правити треба генератори, а не JSON.

| Що | Команда |
|---|---|
| Англійська (усі 25 уроків, слова, subjects.json) | `node tools/gen.js content/english` (gen.js підтягує gen_*.js, lib.js) |
| Математика 2 клас | `node tools/gen_math.js content/math2` (генератори завдань — у `engine/math.js`) |
| Алгебра 7 клас | `node tools/gen_algebra.js content/algebra` (генератори — `engine/algebra.js`) |
| Геометрія 7 клас | `node tools/gen_geometry.js content/geometry` (генератори і рисунки — `engine/geometry.js`) |
| Перевірка геометрії (3000 прикладів на навичку, незалежна перевірка відповіді, форма рисунка) | `node tools/check_geometry.js` |
| Перевірка алгебри (3000 прикладів на навичку, незалежна перевірка відповіді) | `node tools/check_algebra.js` |
| Перевірка англійської (відповіді, err, fix, дублікати) | `node tools/check_content.js` (3 «fixdiff» про порядок слів — відомі, не помилки) |
| Перевірка математики (3000 прикладів на навичку) | `node tools/check_math.js` |
| Правопис (англ. GB/US + укр.) | `npm i nspell dictionary-en dictionary-en-gb dictionary-uk` у будь-якій папці, потім `node tools/spell.mjs` (шляхи всередині — /home/claude/…, поправити за потреби) |
| Локальний сервер з мок-KV (вхід, синхронізація) | `node tools/devserver.mjs` → http://127.0.0.1:8766 (серверну функцію підхоплює сам) |
| Браузерні тести (Playwright, Chromium) | `tools/e2e/*.py`; статичний сервер: `python3 -m http.server 8765` у корені (на порту 8765 синхронізація вимкнена); `e2e_sync*.py` — з devserver на 8766. Шляхи до Chromium і скріншотів усередині скриптів — під середовище Claude |
