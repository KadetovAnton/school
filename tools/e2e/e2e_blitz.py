# ⚡ Блискавка: старт, відповіді, 2 помилки, рекорд, «Мої помилки», повторна спроба
from playwright.sync_api import sync_playwright
import time
errors=[]; U="http://127.0.0.1:8765/"
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1243/chrome-linux64/chrome")
    pg=b.new_page(viewport={"width":390,"height":664},device_scale_factor=2); pg.on("pageerror",lambda e:errors.append(str(e)))
    pg.goto(U); pg.evaluate("localStorage.clear()"); pg.goto(U); pg.wait_for_selector(".who-b")
    pg.click(".who-b[data-id=artem]"); pg.wait_for_selector(".lesson.open"); pg.click(".lesson.open[data-s=math2]"); pg.wait_for_selector("#blitzBtn")
    # як ніби вже пройдені теми
    pg.evaluate("['m.add20','m.sub20','m.mul23'].forEach(function(id){E.sk(id).n=3;E.sk(id).lvl=1}); E.save()")
    for run in range(2):
        pg.click("#blitzBtn" if run==0 else "#again"); pg.wait_for_selector("#go"); pg.screenshot(path="shots/bl0.png")
        pg.click("#go"); pg.wait_for_selector("#bl-p", timeout=5000)
        if run==0: pg.screenshot(path="shots/bl1.png")
        wrong=0; n=0; t=time.time(); skills=set()
        while pg.locator("#bl-p").count() and time.time()-t<70:
            it=pg.evaluate("window.UI_CUR&&[UI_CUR.a,UI_CUR.skill,UI_CUR.p]")
            skills.add(it[1])
            bad = (run==0 and n in (3,7))
            ans = str(int(it[0])+1) if bad else it[0]
            for ch in ans: pg.click(".key[data-k='%s']"%ch)
            pg.click(".key.ok"); n+=1
            if bad: wrong+=1; pg.wait_for_timeout(150); pg.screenshot(path="shots/bl2.png") if n==4 else None
            pg.wait_for_timeout(1250 if bad else 400 if run==0 else 330)
        pg.wait_for_selector("#again", timeout=5000)
        pg.screenshot(path="shots/bl3_%d.png"%run, full_page=True)
        print("run",run,"відповідей",n,"навички",sorted(skills))
        print(pg.inner_text("#stage").replace("\n"," | ")[:400])
    print("blitz:", pg.evaluate("JSON.stringify(E.blitzInfo())")[:300])
    print("mist:", pg.evaluate("E.openMistakes().length"), "stars:", pg.evaluate("JSON.stringify(E.P().stars||[])"))
    pg.click("#home"); pg.wait_for_selector("#blitzBtn"); print(pg.inner_text("#blitzBtn").replace("\n"," | "))
    # злиття
    print("merge:", pg.evaluate("(function(){var a={blitz:{best:5,hist:[{t:1,ok:5}]}},b={blitz:{best:9,bestD:'x',hist:[{t:2,ok:9},{t:1,ok:5}]}};E.mergeProfile(a,b);return JSON.stringify(a.blitz)})()"))
    print("errors:", errors); b.close()
