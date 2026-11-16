from playwright.sync_api import sync_playwright
U="http://127.0.0.1:8765/"; errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1243/chrome-linux64/chrome")
    pg=b.new_page(viewport={"width":390,"height":844}); pg.on("pageerror",lambda e:errs.append(str(e)))
    pg.goto(U); pg.evaluate("localStorage.clear()"); pg.goto(U); pg.wait_for_selector(".who-b")
    pg.click(".who-b[data-id=artem]"); pg.wait_for_selector(".lesson.open"); pg.click(".lesson.open[data-s=math2]"); pg.wait_for_selector("#cont")
    for i in range(1,24): pg.evaluate("(l)=>{var x=E.lesson(l);x.stars=3;x.steps={explain:true,practice:true,test:true};E.save()}", "m%d"%i)
    for L in ["m13","m16","m20","m22","m23","m24"]:
        pg.evaluate("(l)=>{E.lesson(l).steps={explain:true}; E.save()}", L)
        pg.goto(U+"#math2"); pg.reload(); pg.wait_for_selector("#cont")
        pg.click(".lesson[data-file='lessons/%s.json']"%L); pg.wait_for_timeout(400)
        (pg.click(".step[data-s=practice]") if pg.locator(".step[data-s=practice]").is_visible() else None); pg.wait_for_selector("#idk")
        for k in range(3):
            pg.screenshot(path="shots/n_%s_%d.png"%(L,k))
            print(L, pg.inner_text(".card").replace("\n"," | ")[:130])
            pg.click("#idk"); pg.wait_for_selector("#next"); pg.click("#next"); pg.wait_for_timeout(200)
            while pg.locator("#go").count() and not pg.locator("#idk").count(): pg.click("#go"); pg.wait_for_timeout(150)
            if not pg.locator("#idk").count(): break
    pg.goto(U+"#math2"); pg.reload(); pg.wait_for_selector("#cont"); pg.screenshot(path="shots/n_path.png", full_page=True)
    b.close()
print("ERR",errs)
