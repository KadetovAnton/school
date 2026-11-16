from playwright.sync_api import sync_playwright
errors=[]; U="http://127.0.0.1:8765/"; SH="/home/claude/tools/shots/"
def answer(pg, it, right):
    t=it["type"]
    if t=="choice":
        opt=it["a"] if right else [o for o in it["o"] if o!=it["a"]][0]; pg.click(".opt[data-k='%d']"%it["o"].index(opt))
    elif t=="fix": pg.click(".fixw .w[data-k='%d']"%(it["bad"] if right else (0 if it["bad"] else 1)))
    elif t in("input","dict"): pg.fill("#inp", it["a"][0] if right else "zzz"); pg.click("#check")
    else:
        used=set()
        for w in it["a"][0].split(" "):
            bs=pg.locator("#pool .w")
            for i in range(bs.count()):
                if i not in used and bs.nth(i).inner_text().strip().lower()==w: bs.nth(i).click(); used.add(i); break
        pg.click("#check")
def play(pg, stop, wrong_every=0, limit=200):
    n=0
    for _ in range(limit):
        pg.wait_for_timeout(50)
        if stop(): return True
        if pg.locator("#fl").count(): pg.click("#fl",position={"x":15,"y":15}); pg.click("#yes"); continue
        if pg.locator("#idk").count() and pg.locator("#next").count()==0 and "en" in (pg.evaluate("window.UI_CUR") or {}):
            pg.fill("#inp", pg.evaluate("window.UI_CUR.en")); pg.click("#check"); pg.wait_for_selector("#next"); pg.click("#next"); continue
        if pg.locator("#idk").count() and pg.locator("#next").count()==0:
            it=pg.evaluate("window.UI_CUR"); chip=pg.inner_text(".chip"); n+=1
            answer(pg,it, not (wrong_every and ("Вправи" in chip) and n%wrong_every==1)); pg.wait_for_selector("#next"); pg.click("#next")
        elif pg.locator("#go").count(): pg.click("#go")
        elif pg.locator("#nx").count(): pg.click("#nx")
    return False
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1243/chrome-linux64/chrome")
    pg=b.new_page(viewport={"width":390,"height":844},device_scale_factor=2); pg.on("pageerror",lambda e:errors.append(str(e)))
    pg.goto(U); pg.evaluate("localStorage.clear()"); pg.reload()
    pg.click(".who-b[data-id=anya]"); pg.click(".lesson.open[data-s=english]"); pg.wait_for_selector("#daily")
    pg.screenshot(path=SH+"d0_cab.png",full_page=True)
    pg.click("#daily"); pg.wait_for_selector("#go2"); print("day1 plan:", pg.inner_text(".card:nth-of-type(2)").replace("\n"," | ")[:300])
    pg.screenshot(path=SH+"d1_plan.png",full_page=True)
    pg.click("#go2"); pg.wait_for_selector(".step.cur"); print("lesson opened:", pg.inner_text(".step.cur").replace("\n"," "), "| back:", pg.inner_text("#back"))
    # правило (5 карток) + приклади -> вправи з помилками -> повернення до плану
    for _ in range(6):
        if pg.locator("#nx").count(): pg.click("#nx"); pg.wait_for_timeout(80)
    print("after explain/examples:", pg.inner_text(".step.cur").replace("\n"," "))
    play(pg, lambda: pg.locator("#go2").count()>0 or pg.locator("#more").count()>0, wrong_every=4)
    print("back at plan:", pg.inner_text("#app").replace("\n"," | ")[:350])
    for _ in range(3):
        if pg.locator("#go2").count(): pg.click("#go2")  # слова / помилки
        play(pg, lambda: pg.locator("#more").count()>0 or (pg.locator("#go2").count()>0 and "Заняття" in pg.inner_text(".topbar")))
    play(pg, lambda: pg.locator("#more").count()>0 or (pg.locator("#go2").count()>0 and "Заняття" in pg.inner_text(".topbar")))
    print("end of day:", pg.inner_text("#app").replace("\n"," | ")[:300])
    pg.screenshot(path=SH+"d2_done.png",full_page=True)
    pg.click("#home"); pg.wait_for_selector("#daily"); print("cabinet button:", pg.inner_text("#daily"), "| mist row:", pg.inner_text("#mist").replace("\n"," "))
    # наступний день
    pg.evaluate("""(()=>{const P=E.P();const y=E.addDays(E.today(),-1);P.plan.d=y;for(const k in P.skills){P.skills[k].last=y; if(P.skills[k].due) P.skills[k].due=E.today();}
      P.mistakes.push({key:Object.keys(E.ITEM)[3],skill:'ps.base',given:'x',d:y,fixed:false});E.save()})()""")
    pg.reload(); pg.wait_for_timeout(300)
    pg.goto(U+"#english"); pg.reload(); pg.wait_for_selector("#daily"); pg.click("#daily"); pg.wait_for_selector("#go2")
    print("day2 plan:", pg.inner_text("#app").replace("\n"," | ")[:350])
    pg.click("#go2"); pg.wait_for_selector(".chip"); print("warm chip:", pg.inner_text(".chip"))
    play(pg, lambda: pg.locator("#go2").count()>0 and "Заняття" in pg.inner_text(".topbar"))
    print("after warm:", pg.inner_text("#app").replace("\n"," | ")[:250])
    pg.click("#back"); pg.wait_for_selector("#mist"); pg.click("#mist"); pg.wait_for_selector("h1")
    print("mistakes page:", pg.inner_text("#app").replace("\n"," | ")[:300]); pg.screenshot(path=SH+"d3_mist.png",full_page=True)
    b.close()
print("ERRORS",errors)
