import sys, json
from playwright.sync_api import sync_playwright

MODE = sys.argv[1] if len(sys.argv)>1 else "good"
URL = "http://127.0.0.1:8765/index.html"
OUT = "/home/claude/tools/shots/"
import os; os.makedirs(OUT, exist_ok=True)
errors = []

with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1243/chrome-linux64/chrome")
    ctx = b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2)
    pg = ctx.new_page()
    pg.on("pageerror", lambda e: errors.append(str(e)))
    pg.on("console", lambda m: m.type == "error" and errors.append(m.text))
    # старий прогрес — перевіряємо міграцію
    pg.goto(URL)
    pg.evaluate("""localStorage.clear(); localStorage.setItem('eng7-cabinet-v1', JSON.stringify({name:'Аня',days:['2026-11-15'],lessons:{l1:{steps:{explain:true,examples:true},stars:0,best:0}}}))""")
    pg.goto(URL); pg.click(".who-b[data-id=anya]"); pg.click(".lesson.open[data-s=english]"); pg.wait_for_selector("#cont")
    pg.screenshot(path=OUT + "1_home.png", full_page=False)
    print("home:", pg.inner_text(".hello")[:80].replace("\n", " "))
    pg.click("#cont"); pg.wait_for_selector(".step.cur")
    print("opened step:", pg.inner_text(".step.cur").replace("\n", " "))

    def ans_of(it):
        return it["a"] if it["type"] == "choice" else it["a"][0]
    def cur_item():
        return pg.evaluate("""() => { const p=document.querySelector('.prompt').innerText.replace(/\\s+/g,' ').trim();
            for (const id in E.SK) for (const it of E.SK[id].items) { if (it.p.replace('___','').replace(/\\s+/g,' ').trim()===p.replace(/\\s+/g,' ').trim()) return it; }
            // запасний пошук за початком
            for (const id in E.SK) for (const it of E.SK[id].items) { const a=it.p.split('___')[0].trim(); if (a && p.startsWith(a)) return it; }
            return null; }""")
    def answer(it, right=True, typo=False):
        t = it["type"]
        if t == "choice":
            opt = it["a"] if right else [o for o in it["o"] if o != it["a"]][0]
            pg.click(".opt[data-k='%d']" % it["o"].index(opt))
        elif t == "input":
            a = it["a"][0]
            if typo:
                g = a[0] + a[2] + a[1] + a[3:]  # перестановка 2-ї і 3-ї літери
                pg.fill("#inp", g); pg.click("#check")
                return
            pg.fill("#inp", a if right else (list(it.get("err", {}).keys()) or ["zzz"])[0]); pg.click("#check")
        elif t == "order":
            words = it["a"][0].split(" ") if right else list(reversed(it["a"][0].split(" ")))
            used = set()
            for w in words:
                btns = pg.locator("#pool .w")
                for i in range(btns.count()):
                    if i in used: continue
                    if btns.nth(i).inner_text().strip().lower() == w:
                        btns.nth(i).click(); used.add(i); break
            pg.click("#check")

    (pg.click(".step[data-s=practice]") if pg.locator(".step[data-s=practice]").is_visible() else None); pg.wait_for_selector(".prompt")
    log = []
    first_error_done = False; typo_done = False; steps = 0
    while steps < 80:
        steps += 1
        if pg.locator("#go").count() == 0 and pg.locator("#fb").count() and pg.locator("#next").count() == 0:
            it = cur_item(); chip = pg.inner_text(".chip")
            if it is None: errors.append("item not found: " + pg.inner_text(".prompt")); break
            if not typo_done and it["type"] == "input" and len(it["a"][0]) >= 6 and "Вправи" in chip:
                answer(it, typo=True); typo_done = True
                pg.wait_for_selector(".almost"); log.append("typo shown: " + pg.inner_text(".almost"))
                pg.screenshot(path=OUT + "3_typo.png")
                pg.fill("#inp", it["a"][0]); pg.click("#check")
            elif not first_error_done and "Вправи" in chip:
                answer(it, right=False); first_error_done = True
                pg.wait_for_selector("#next"); log.append("ERR on " + it["skill"] + ": " + pg.inner_text(".fb h3"))
                pg.screenshot(path=OUT + "2_error.png", full_page=True)
            elif "Закріпимо" in chip:
                if "1 з" in chip: log.append("series hints open: %d" % pg.locator(".hint").count())
                answer(it, right=(MODE=="good"))
            else:
                answer(it, right=True)
            pg.wait_for_selector("#next")
            pg.click("#next")
        elif pg.locator("#go").count():
            title = pg.inner_text(".card")[:60].replace("\n", " ")
            log.append("card: " + title)
            if "думаю" in title: pg.screenshot(path=OUT + "4_worked.png", full_page=True)
            pg.click("#go")
        elif pg.locator("#nx").count() and "Вправи зроблено" in pg.inner_text(".card"):
            log.append("SUMMARY: " + pg.inner_text(".card").replace("\n", " | ")[:400])
            pg.screenshot(path=OUT + "5_summary.png", full_page=True)
            break
        else:
            pg.wait_for_timeout(200)
    print("\n".join(log))
    st = pg.evaluate("JSON.stringify(E.P().skills)")
    print("skills:", st)
    print("mistakes:", pg.evaluate("JSON.stringify(E.P().mistakes)"))
    # тест
    pg.click("#nx")  # до слів
    pg.click(".step[data-s=test]") if pg.locator(".step[data-s=test]:not([disabled])").count() else None
    print("test step enabled:", pg.locator(".step[data-s=test]:not([disabled])").count())
    pg.goto(URL+"#english"); pg.reload(); pg.wait_for_selector("#cont")
    print("home levels:", pg.inner_text(".lesson.open .lvls"), pg.inner_text(".today"))
    pg.screenshot(path=OUT + "6_home_after.png")
    b.close()
print("ERRORS:", errors)
