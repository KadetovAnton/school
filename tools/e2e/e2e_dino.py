# 🦖 Маскот: яйце → вилупився (тост), нова річ, гардероб, колір, ім'я, злиття
from playwright.sync_api import sync_playwright
errors=[]; U="http://127.0.0.1:8765/"
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1243/chrome-linux64/chrome")
    pg=b.new_page(viewport={"width":390,"height":844},device_scale_factor=2); pg.on("pageerror",lambda e:errors.append(str(e)))
    pg.goto(U); pg.evaluate("localStorage.clear()"); pg.goto(U); pg.wait_for_selector(".who-b")
    pg.click(".who-b[data-id=artem]"); pg.wait_for_selector(".lesson.open"); pg.click(".lesson.open[data-s=math2]"); pg.wait_for_selector("#dinoCard")
    print("яйце:", pg.inner_text("#dinoCard").replace("\n"," | "))
    pg.screenshot(path="shots/d0.png")
    # пройдено 4 уроки і 32 зірки
    pg.evaluate("['m1','m2','m3','m25'].forEach(function(id){E.lesson(id).stars=3}); E.addStars(32,'test'); E.save()")
    pg.click("#subj"); pg.click(".lesson.open[data-s=math2]"); pg.wait_for_selector("#dinoCard"); pg.wait_for_timeout(300)
    print("тост:", pg.inner_text("#toast") if pg.locator("#toast").count() else "-")
    print("картка:", pg.inner_text("#dinoCard").replace("\n"," | "))
    print("dino:", pg.evaluate("JSON.stringify(E.P().dino)"))
    pg.screenshot(path="shots/d1.png")
    pg.click("#dinoCard"); pg.wait_for_selector(".dino-items")
    pg.screenshot(path="shots/d2.png", full_page=True)
    pg.click(".dino-it[data-it=cap]"); pg.click(".dino-col[data-c=blue]")
    pg.click(".dino-it[data-it=glasses]"); print("закрита річ:", pg.inner_text("#toast"))
    pg.click("#ren"); pg.fill("#nm","Рекс"); pg.click("#nmOk"); pg.wait_for_timeout(200)
    print("dino2:", pg.evaluate("JSON.stringify(E.P().dino)"))
    pg.screenshot(path="shots/d3.png", full_page=True)
    print("merge:", pg.evaluate("(function(){var a={dino:{name:'A',u:5,form:3,items:2,wear:{}}};E.mergeProfile(a,{dino:{name:'B',u:9,form:2,items:3,wear:{head:'cap'}}});return JSON.stringify(a.dino)})()"))
    pg.click("#back"); pg.wait_for_selector("#dinoCard")
    print("errors:", errors); b.close()
