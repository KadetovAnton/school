from playwright.sync_api import sync_playwright
U="http://127.0.0.1:8765/"; errors=[]
def typ(pg,s):
    for ch in s: pg.click(".key[data-k='%s']"%ch)
    pg.click(".key[data-k='✓']")
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1243/chrome-linux64/chrome")
    pg=b.new_page(viewport={"width":390,"height":844},device_scale_factor=2); pg.on("pageerror",lambda e:errors.append(str(e)))
    pg.goto(U); pg.evaluate("localStorage.clear()"); pg.reload()
    pg.click(".who-b[data-id=anya]"); pg.click(".lesson[data-s=algebra]"); pg.wait_for_selector("#diagGo")
    import sys
    L=sys.argv[1].split(",") if len(sys.argv)>1 else ["a15","a16","a17","a18","a19","a20"]
    for lid in L:
        pg.evaluate("E.lesson('%s').early=true;E.save()"%lid)
        pg.evaluate("location.hash='algebra'"); pg.reload(); pg.wait_for_selector("#diagGo")
        pg.locator(".lesson[data-file='lessons/%s.json']"%lid).click(); pg.wait_for_timeout(300)
        n=0
        for step in range(120):
            pg.wait_for_timeout(30)
            if pg.locator("#idk").count() and pg.locator("#next").count()==0:
                it=pg.evaluate("window.UI_CUR")
                if it["type"]=="choice": pg.click(".opt[data-k='%d']"%it["o"].index(it["a"]))
                else: typ(pg,it["a"])
                n+=1
                if n==2: pg.screenshot(path="/home/claude/shots/p_%s.png"%lid)
                pg.click("#next"); continue
            t=pg.inner_text("#app")
            if "Урок пройдено" in t: break
            done=False
            for sel in ["#go","#nx","#next"]:
                if pg.locator(sel).count() and pg.locator(sel).first.is_visible(): pg.locator(sel).first.click(); done=True; break
            if not done: break
        print(lid, n, pg.evaluate("JSON.stringify(E.lesson('%s').stars)"%lid))
    b.close()
print("JS:",errors[:3] or "немає")
