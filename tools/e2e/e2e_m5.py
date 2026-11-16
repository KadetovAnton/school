from playwright.sync_api import sync_playwright
U="http://127.0.0.1:8765/"; errs=[]
def it_of(pg):
    return pg.evaluate("""()=>{var t=document.querySelector('.prompt').innerText.replace(/\\s+/g,' ').trim();for(var k in E.ITEM){var it=E.ITEM[k];if(it.gen&&it.steps&&t.indexOf(it.p.slice(0,40))===0)return it;}return null}""")
def typ(pg,s):
    for ch in s: pg.click(".key[data-k='%s']"%ch)
    pg.click(".key.ok"); pg.wait_for_timeout(150)
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1243/chrome-linux64/chrome")
    pg=b.new_page(viewport={"width":390,"height":844}); pg.on("pageerror",lambda e:errs.append(str(e)))
    pg.goto(U); pg.evaluate("localStorage.clear()"); pg.goto(U); pg.wait_for_selector(".who-b")
    pg.click(".who-b[data-id=artem]"); pg.wait_for_selector(".lesson.open"); pg.click(".lesson.open[data-s=math2]"); pg.wait_for_selector("#cont")
    for L in ["m1","m2","m3","m4","m25"]: pg.evaluate("(l)=>{var x=E.lesson(l);x.stars=3;x.steps={explain:true,practice:true,test:true};E.save()}", L)
    pg.evaluate("E.lesson('m26').steps={explain:true};E.save()")
    pg.goto(U+"#math2"); pg.reload(); pg.wait_for_selector("#cont")
    pg.screenshot(path="shots/s_path.png", full_page=True)
    pg.click(".lesson[data-file='lessons/m26.json']"); pg.wait_for_timeout(300); (pg.click(".step[data-s=practice]") if pg.locator(".step[data-s=practice]").is_visible() else None); pg.wait_for_selector("#idk")
    done_ok=done_bad=plan=0
    for k in range(14):
        if not pg.locator("#idk").count(): break
        if pg.locator(".stps").count():
            it=it_of(pg)
            if not it: print("no item"); break
            if done_ok==0:
                typ(pg,it["steps"][0]["a"]); pg.screenshot(path="shots/s_step1.png")
                typ(pg,it["steps"][1]["a"]); pg.wait_for_selector("#next"); pg.screenshot(path="shots/s_ok.png"); done_ok=1
                print("OK case:", pg.inner_text(".fb")[:80].replace("\n"," "))
            else:
                bad=str(int(it["steps"][0]["a"])+1); typ(pg,bad); pg.wait_for_selector("#next"); pg.screenshot(path="shots/s_bad.png"); done_bad+=1
                print("BAD case:", pg.inner_text(".fb")[:160].replace("\n"," "))
        else:
            if not plan: pg.screenshot(path="shots/s_plan.png"); plan=1
            pg.locator(".opt").first.click(); pg.wait_for_selector("#next")
        pg.click("#next"); pg.wait_for_timeout(200)
        while pg.locator("#go").count() and not pg.locator("#idk").count(): pg.click("#go"); pg.wait_for_timeout(150)
        if done_ok and done_bad>=1 and plan: break
    b.close()
print("ERR",errs)
