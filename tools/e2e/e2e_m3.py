from playwright.sync_api import sync_playwright
U="http://127.0.0.1:8765/"; errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1243/chrome-linux64/chrome")
    pg=b.new_page(viewport={"width":390,"height":844}); pg.on("pageerror",lambda e:errs.append(str(e)))
    pg.goto(U); pg.evaluate("localStorage.clear()"); pg.goto(U); pg.wait_for_selector(".who-b")
    pg.click(".who-b[data-id=artem]"); pg.wait_for_selector(".lesson.open"); pg.click(".lesson.open[data-s=math2]"); pg.wait_for_selector("#cont")
    for L in ["m1","m2","m3"]: pg.evaluate("(l)=>{var x=E.lesson(l);x.stars=3;x.steps={explain:true,practice:true,test:true};E.save()}", L)
    pg.evaluate("E.lesson('m4').steps={explain:true};E.save()")
    pg.goto(U+"#math2"); pg.reload(); pg.wait_for_selector("#cont")
    pg.click(".lesson[data-file='lessons/m4.json']"); pg.wait_for_timeout(400); (pg.click(".step[data-s=practice]") if pg.locator(".step[data-s=practice]").is_visible() else None); pg.wait_for_selector("#idk")
    for i in range(4):
        long=pg.locator(".numbox.show").count()
        pg.click(".key[data-k='1']"); pg.click(".key[data-k='2']")
        print("long" if long else "expr", pg.inner_text(".numbox.show") if long else pg.inner_text(".prompt"))
        if long: pg.screenshot(path="shots/mfix.png")
        pg.click(".key.ok"); pg.wait_for_selector("#next")
        if long: pg.screenshot(path="shots/mfix2.png")
        pg.click("#next"); pg.wait_for_timeout(200)
        while pg.locator("#go").count() and not pg.locator("#idk").count(): pg.click("#go"); pg.wait_for_timeout(150)
        if not pg.locator("#idk").count(): break
    b.close()
print("ERR",errs)
