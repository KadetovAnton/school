from playwright.sync_api import sync_playwright
errors=[]; U="http://127.0.0.1:8765/"; SH="/home/claude/tools/shots/"
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1243/chrome-linux64/chrome")
    pg=b.new_page(viewport={"width":390,"height":844},device_scale_factor=2); pg.on("pageerror",lambda e:errors.append(str(e)))
    pg.goto(U); pg.evaluate("localStorage.clear()"); pg.reload(); pg.click(".who-b[data-id=anya]"); pg.click(".lesson.open[data-s=english]"); pg.wait_for_selector("#wordsBtn")
    print("words row:", pg.inner_text("#wordsBtn").replace("\n"," "))
    pg.click("#wordsBtn"); pg.wait_for_selector("#go2"); pg.screenshot(path=SH+"w_page.png",full_page=True)
    print("page:", pg.inner_text(".card").replace("\n"," | ")[:150])
    pg.click("#go2"); n=0; modes={}
    for _ in range(40):
        pg.wait_for_timeout(50)
        if pg.locator("#go").count(): break
        if pg.locator("#fl").count():
            modes["card"]=modes.get("card",0)+1
            pg.click("#fl",position={"x":15,"y":15}); pg.click("#yes" if n%3 else "#no"); n+=1
    print("session done:", pg.inner_text(".card").replace("\n"," "), modes)
    st=pg.evaluate("JSON.stringify(Object.entries(E.P().words).map(([k,v])=>k+':'+v.box))"); print("words:", st[:300])
    # наступні дні: зсуваємо due і проганяємо введення
    for day in range(3):
        pg.evaluate("(()=>{const ws=E.P().words;for(const k in ws){ws[k].due=E.today()}E.save()})()")
        pg.goto(U+"#english"); pg.reload(); pg.wait_for_selector("#wordsBtn"); pg.click("#wordsBtn"); pg.click("#go2")
        for _ in range(60):
            pg.wait_for_timeout(40)
            if pg.locator("#go").count(): break
            if pg.locator("#fl").count():
                modes["card"]=modes.get("card",0)+1; pg.click("#fl",position={"x":15,"y":15}); pg.click("#yes"); continue
            if pg.locator("#inp").count() and pg.locator("#next").count()==0:
                m="listen" if pg.locator("#pl").count() else "type"; modes[m]=modes.get(m,0)+1
                en=pg.evaluate("(()=>{const p=document.querySelector('.prompt').innerText; if(p.indexOf('🎧')>=0) return null; for(const k in E.DICT) if(E.DICT[k]===p) return k; return null})()")
                if en is None: en=pg.evaluate("window._lastSay||''")
                pg.fill("#inp", en or "zzz"); pg.click("#check"); pg.wait_for_selector("#next"); pg.click("#next")
        if day==1: pg.screenshot(path=SH+"w_type.png")
    print("modes:", modes, "learned:", pg.evaluate("E.wordsLearned()"))
    # заняття на сьогодні містить слова
    pg.evaluate("E.P().plan=null;E.save()"); pg.goto(U+"#english"); pg.reload(); pg.wait_for_selector("#daily"); pg.click("#daily"); pg.wait_for_selector(".lesson[data-p]")
    print("daily parts:", [x.replace("\n"," ") for x in pg.locator(".lesson[data-p]").all_inner_texts()])
    b.close()
print("ERRORS",errors)
