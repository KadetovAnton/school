from playwright.sync_api import sync_playwright
U="http://127.0.0.1:8765/"
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1243/chrome-linux64/chrome")
    pg=b.new_page(viewport={"width":390,"height":844}); pg.on("pageerror",lambda e:print("ERR",e))
    pg.goto(U); pg.evaluate("localStorage.clear()"); pg.goto(U); pg.wait_for_selector(".who-b")
    pg.click(".who-b[data-id=artem]"); pg.wait_for_selector(".lesson.open"); pg.click(".lesson.open[data-s=math2]"); pg.wait_for_selector("#cont")
    for L in ["m1","m2","m3","m4","m5","m6","m7","m8","m9"]:
        pg.evaluate("(l)=>{var x=E.lesson(l);x.stars=3;x.steps={explain:true,practice:true,test:true};E.save()}", L)
    pg.goto(U+"#math2"); pg.reload(); pg.wait_for_selector("#cont"); pg.screenshot(path="shots/mpath.png",full_page=True)
    for L in ["m4","m5","m7","m9","m10"]:
        pg.evaluate("(l)=>{E.lesson(l).steps={explain:true}; E.save()}", L)
        pg.goto(U+"#math2"); pg.reload(); pg.wait_for_selector("#cont")
        pg.click(".lesson[data-file='lessons/%s.json']"%L); pg.wait_for_timeout(400)
        (pg.click(".step[data-s=practice]") if pg.locator(".step[data-s=practice]").is_visible() else None); pg.wait_for_selector("#idk")
        pg.screenshot(path="shots/mt_%s.png"%L)
        print(L, pg.inner_text(".card").replace("\n"," | ")[:160])
        pg.click("#back"); pg.wait_for_timeout(300)
    b.close()
