from playwright.sync_api import sync_playwright
U="http://127.0.0.1:8765/"
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1243/chrome-linux64/chrome")
    pg=b.new_page(viewport={"width":390,"height":664}); errs=[]; pg.on("pageerror",lambda e:errs.append(str(e)))
    pg.goto(U); pg.evaluate("localStorage.clear()"); pg.goto(U); pg.wait_for_selector(".who-b")
    pg.click(".who-b[data-id=artem]"); pg.wait_for_selector(".lesson.open"); pg.click(".lesson.open[data-s=math2]"); pg.wait_for_selector("#daily")
    for L in ["m1","m2","m3","m4","m25"]: pg.evaluate("(l)=>{var x=E.lesson(l);x.stars=3;x.steps={explain:true,practice:true,test:true};E.save()}", L)
    pg.evaluate("E.lesson('m26').steps={explain:true}; E.save()"); pg.goto(U+"#math2"); pg.reload(); pg.wait_for_selector("#daily")
    pg.click(".lesson[data-file='lessons/m26.json']"); pg.wait_for_selector("#idk")
    for k in range(10):
        if pg.locator(".stps").count(): break
        a=pg.evaluate("""()=>{var t=document.querySelector('.prompt').innerText.replace(/\\s+/g,' ').trim();for(var k in E.ITEM){var it=E.ITEM[k];if(it.gen&&it.type==='choice'&&t.indexOf(it.p.slice(0,40))===0)return it.a;}return null}""")
        pg.locator(".opt", has_text=a).first.click(); pg.wait_for_selector("#next"); pg.click("#next"); pg.wait_for_timeout(200)
        while pg.locator("#go").count() and not pg.locator("#idk").count(): pg.click("#go"); pg.wait_for_timeout(150)
    bb=pg.locator(".key.ok").bounding_box(); print("m26 ✓ bottom:", round(bb["y"]+bb["height"]), "of 664")
    pg.screenshot(path="/home/claude/tools/shots/v_m26.png"); print(errs); b.close()
