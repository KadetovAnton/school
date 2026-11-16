from playwright.sync_api import sync_playwright
errors=[]; U="http://127.0.0.1:8765/"; reqs=[]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1243/chrome-linux64/chrome", args=["--autoplay-policy=no-user-gesture-required"])
    pg=b.new_page(viewport={"width":390,"height":844}); pg.on("pageerror",lambda e:errors.append(str(e))); pg.on("request", lambda r: reqs.append(r.url) if "silent" in r.url else None)
    pg.add_init_script("""window.__spoken=[]; (function(){ var o=window.speechSynthesis; if(!o) return; var sp=o.speak.bind(o); o.speak=function(u){ window.__spoken.push([u.text,u.rate,u.lang]); try{sp(u)}catch(e){} }; })();""")
    pg.goto(U); pg.evaluate("localStorage.clear()"); pg.reload(); pg.click(".who-b[data-id=anya]"); pg.click(".lesson.open[data-s=english]"); pg.wait_for_selector("#daily")
    pg.evaluate("var L=E.lesson('l17');L.steps={explain:1,examples:1,practice:1,words:1};E.save()")
    pg.goto(U+"#english"); pg.reload(); pg.wait_for_selector("#cont"); pg.click("#cont"); pg.wait_for_selector(".step.cur")
    pg.click(".step[data-s=examples]"); pg.click(".ex .say >> nth=0"); pg.click("#all")
    print("examples spoken:", pg.evaluate("window.__spoken.length"), pg.evaluate("window.__spoken[0]"))
    # диктант у вправах: знайдемо dict
    (pg.click(".step[data-s=practice]") if pg.locator(".step[data-s=practice]").is_visible() else None)
    for _ in range(30):
        pg.wait_for_timeout(50)
        it=pg.evaluate("window.UI_CUR")
        if it and it.get("type")=="dict": break
        if pg.locator("#idk").count() and pg.locator("#next").count()==0: pg.click("#idk"); pg.wait_for_selector("#next"); pg.click("#next")
        while pg.locator("#go").count(): pg.click("#go")
    n0=pg.evaluate("window.__spoken.length")
    if pg.locator("#play").count():
        pg.click("#play"); pg.click("#slow")
        print("dict spoken:", pg.evaluate("window.__spoken.slice(%d)"%n0)); print("hint:", pg.locator("p.small").first.inner_text())
    print("voice lang test:", pg.evaluate("speechSynthesis.getVoices().length"))
    pg.goto(U+"test.html"); pg.wait_for_selector("#go"); print("test.html SAY:", pg.evaluate("!!window.SAY && SAY.can"))
    print("silent requested:", reqs[:2])
    b.close()
print("ERRORS",errors)
