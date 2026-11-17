# 🦖 Маскот: перехід зі старих правил, яйце → вилупився, ріст за 🌳, речі за зірки, гардероб, колір, ім'я, злиття
from playwright.sync_api import sync_playwright
errors=[]; U="http://127.0.0.1:8765/"
def home(pg): pg.click("#subj"); pg.click(".lesson.open[data-s=math2]"); pg.wait_for_selector("#dinoCard"); pg.wait_for_timeout(200)
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1243/chrome-linux64/chrome")
    pg=b.new_page(viewport={"width":390,"height":844},device_scale_factor=2); pg.on("pageerror",lambda e:errors.append(str(e)))
    pg.goto(U); pg.evaluate("localStorage.clear()"); pg.goto(U); pg.wait_for_selector(".who-b")
    pg.click(".who-b[data-id=artem]"); pg.wait_for_selector(".lesson.open"); pg.click(".lesson.open[data-s=math2]"); pg.wait_for_selector("#dinoCard")
    print("яйце:", pg.inner_text("#dinoCard").replace("\n"," | "))
    # як у Артема: 17 уроків, 200 зірок, старий динозавр (дорослий, у плащі)
    pg.evaluate("""(function(){var P=E.P(),n=0;['m1','m2','m3','m25','m26','m4','m5','m6','m7','m8','m9','m10','m11','m12','m13','m14','m15'].forEach(function(id){E.lesson(id).stars=3});
      ['m.add10','m.add20','m.sub20'].forEach(function(id){E.sk(id).lvl=3}); E.addStars(200,'test');
      P.dino={name:'Рекс',color:'blue',wear:{back:'cape',head:'cap'},form:4,items:6,u:1}; E.save()})()""")
    home(pg)
    print("після переходу:", pg.evaluate("JSON.stringify(E.P().dino)"), "|", pg.inner_text("#dinoCard").replace("\n"," | "))
    pg.evaluate("['m.mix20','m.addnc'].forEach(function(id){E.sk(id).lvl=3}); E.addStars(120,'test'); E.save()")
    home(pg)
    print("4 🌳, 320 ⭐:", pg.evaluate("JSON.stringify(E.P().dino)"))
    pg.evaluate("E.sk('m.addnc').lvl=2; E.save()"); home(pg)
    print("🌳 впав — форма лишилась:", pg.evaluate("E.P().dino.form"))
    pg.click("#dinoCard"); pg.wait_for_selector(".dino-items")
    print("сторінка:", pg.inner_text("#app")[:260].replace("\n"," | "))
    pg.screenshot(path="shots/d2.png", full_page=True)
    pg.click(".dino-it[data-it=cap]"); pg.click(".dino-col[data-c=orange]")
    pg.click("#ren"); pg.fill("#nm","Рекс"); pg.click("#nmOk"); pg.wait_for_timeout(200)
    print("dino2:", pg.evaluate("JSON.stringify(E.P().dino)"))
    print("merge:", pg.evaluate("(function(){var a={dino:{name:'A',u:5,form:3,items:2,wear:{}}};E.mergeProfile(a,{dino:{name:'B',u:9,form:2,items:3,wear:{head:'cap'}}});return JSON.stringify(a.dino)})()"))
    print("errors:", errors); b.close()
