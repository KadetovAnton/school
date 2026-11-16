from playwright.sync_api import sync_playwright
errors=[]; U="http://127.0.0.1:8765/"
def cur(pg): return pg.evaluate("window.__it||null")
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1243/chrome-linux64/chrome")
    pg=b.new_page(viewport={"width":390,"height":844},device_scale_factor=2); pg.on("pageerror",lambda e:errors.append(str(e)))
    pg.goto(U); pg.evaluate("localStorage.clear()"); pg.goto(U); pg.wait_for_selector(".who-b")
    pg.click(".who-b[data-id=artem]"); pg.wait_for_selector(".lesson.open"); pg.click(".lesson.open[data-s=math2]"); pg.wait_for_selector("#cont")
    pg.click("#cont"); pg.wait_for_timeout(300)
    for i in range(3): pg.click("#nx"); pg.wait_for_timeout(200)
    pg.wait_for_selector("#idk")
    pg.screenshot(path="shots/m3.png",full_page=True)
    n=0; wrong=0; shot=0
    for k in range(60):
        if pg.locator("#idk").count()==0: break
        txt=pg.inner_text(".prompt") if pg.locator(".prompt").count() else ""
        # знайти поточне завдання за текстом
        a=pg.evaluate("""(t)=>{for(var k in E.ITEM){var it=E.ITEM[k]; if(it.gen && t.indexOf(it.p.split('___')[0].trim().slice(0,12))>=0 && document.querySelector('.prompt').innerText.replace(/\\s+/g,' ').indexOf(it.p.replace('___','').replace(/\\s+/g,' ').trim().slice(-6))>=0) return [it.type,it.a,Object.keys(it.err||{})[0]||null];} return null}""", txt)
        if not a: print("не знайшов", txt); break
        bad = a[0]=='num' and wrong<2 and k>2
        ans = (a[2] or ("0" if a[1]!="0" else "1")) if bad and a[0]=="num" else a[1]
        if a[0]=="num":
            for ch in ans: pg.click(".key[data-k='%s']"%ch)
            if not shot: pg.screenshot(path="shots/m4.png",full_page=True); shot=1
            pg.click(".key.ok")
        else:
            opts=pg.locator(".opt"); 
            for i in range(opts.count()):
                if (opts.nth(i).inner_text()==ans)!=bad: opts.nth(i).click(); break
        pg.wait_for_selector("#next"); n+=1
        if bad: wrong+=1; pg.screenshot(path="shots/m5_%d.png"%k,full_page=True); print("помилка:", pg.inner_text(".fb").replace("\n"," ")[:200] if pg.locator(".fb").count() else "")
        pg.click("#next"); pg.wait_for_timeout(150)
        while pg.locator("#go").count() and pg.locator("#idk").count()==0: pg.click("#go"); pg.wait_for_timeout(150)
    print("відповідей:",n,"помилок:",wrong)
    pg.screenshot(path="shots/m6.png",full_page=True)
    print("after:", pg.inner_text("#app").replace("\n"," | ")[:300])
    print("skills:", pg.evaluate("JSON.stringify(E.P().skills)")[:300])
    print("mistakes:", pg.evaluate("JSON.stringify(E.P().mistakes.map(function(m){return [m.key,m.sub,!!m.it,m.fixed]}))"))
    print("today:", pg.evaluate("E.todayCount('math2')"), pg.evaluate("E.todayCount('english')"))
    b.close()
print("ERRORS",errors)
