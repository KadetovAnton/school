# ↺ Батьки скидають етап «Множення і ділення»: уроки/навички непройдені; старий запис з іншого пристрою не повертає; нова робота після скидання зберігається
from playwright.sync_api import sync_playwright
errors=[]; U="http://127.0.0.1:8765/"
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1243/chrome-linux64/chrome")
    pg=b.new_page(viewport={"width":390,"height":844}); pg.on("pageerror",lambda e:errors.append(str(e)))
    pg.on("dialog", lambda d: d.accept())
    pg.goto(U); pg.evaluate("localStorage.clear()"); pg.goto(U); pg.wait_for_selector(".who-b")
    pg.click(".who-b[data-id=artem]"); pg.wait_for_selector(".lesson.open"); pg.click(".lesson.open[data-s=math2]"); pg.wait_for_selector("#dinoCard")
    pg.evaluate("""(function(){['m1','m2','m3','m4','m25','m26','m5','m6','m7','m8','m9','m10','m11','m12','m13','m14'].forEach(function(id){var L=E.lesson(id);L.stars=3;L.steps={explain:true,practice:true,test:true}});
      ['m.add20','m.mul23','m.div23','m.mul4','m.md01','m.probmd'].forEach(function(id){var s=E.sk(id);s.n=20;s.lvl=3});E.save();
      window.OLD=JSON.parse(JSON.stringify(E.P()));})()""")
    pg.click("#subj"); pg.click(".lesson.open[data-s=math2]"); pg.wait_for_selector("[data-act=dad]")
    print("до:", pg.inner_text(".hello").split("\n")[1] if pg.locator(".hello").count() else "")
    pg.click("[data-act=dad]"); pg.wait_for_selector("[data-rs]")
    pg.screenshot(path="shots/rs.png", full_page=True)
    pg.click("[data-rs='3']"); pg.wait_for_timeout(800)
    print("кнопка:", pg.inner_text("[data-rs='3']"))
    print("після:", pg.evaluate("JSON.stringify({m9:E.P().lessons.m9||null,m14:E.P().lessons.m14||null,m8:!!E.P().lessons.m8,mul4:E.P().skills['m.mul4']||null,add20:E.P().skills['m.add20'].lvl,resets:Object.keys(E.P().resets).sort()})"))
    # нова робота після скидання + злиття зі старим записом з іншого пристрою
    pg.evaluate("var s=E.sk('m.mul23');s.n=2;s.lvl=1;E.lesson('m9').steps.explain=true;E.save()")
    print("злиття зі старим:", pg.evaluate("(function(){var P=JSON.parse(JSON.stringify(E.P()));E.mergeProfile(P,OLD);return JSON.stringify({m9:P.lessons.m9,m10:P.lessons.m10||null,mul23:P.skills['m.mul23'].n,mul4:P.skills['m.mul4']||null,m8:P.lessons.m8.stars})})()"))
    print("старий ← новий:", pg.evaluate("(function(){var P=JSON.parse(JSON.stringify(OLD));E.mergeProfile(P,E.P());return JSON.stringify({m10:P.lessons.m10||null,mul23:P.skills['m.mul23'].n,mul4:P.skills['m.mul4']||null})})()"))
    pg.click("#bk"); pg.wait_for_selector("#dinoCard"); print("головна:", pg.inner_text(".hello").replace("\n"," | ")[:120])
    print("errors:", errors); b.close()
