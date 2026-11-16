import sys
from playwright.sync_api import sync_playwright
errors=[]; U="http://127.0.0.1:8765/"; SH="/home/claude/tools/shots/"
def answer(pg, it, right):
    t=it["type"]
    if t=="choice":
        opt=it["a"] if right else [o for o in it["o"] if o!=it["a"]][0]; pg.click(".opt[data-k='%d']"%it["o"].index(opt))
    elif t=="fix": pg.click(".fixw .w[data-k='%d']"%(it["bad"] if right else (0 if it["bad"] else 1)))
    elif t in("input","dict"): pg.fill("#inp", it["a"][0] if right else "zzz"); pg.click("#check")
    else:
        used=set()
        for w in it["a"][0].split(" "):
            bs=pg.locator("#pool .w")
            for i in range(bs.count()):
                if i not in used and bs.nth(i).inner_text().strip().lower()==w: bs.nth(i).click(); used.add(i); break
        pg.click("#check")
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1243/chrome-linux64/chrome")
    pg=b.new_page(viewport={"width":390,"height":844},device_scale_factor=2); pg.on("pageerror",lambda e:errors.append(str(e)))
    pg.goto(U); pg.evaluate("localStorage.clear()"); pg.reload(); pg.click(".who-b[data-id=anya]"); pg.click(".lesson.open[data-s=english]"); pg.wait_for_selector("#daily")
    print("locked:", [x.replace("\n"," ") for x in pg.locator(".lesson.soon").all_inner_texts()])
    # відкрити урок 3 раніше
    pg.click(".lesson.soon[data-file='lessons/l3.json']"); pg.wait_for_selector("#yes"); print("early card:", pg.inner_text(".card").replace("\n"," ")[:90]); pg.click("#no"); pg.wait_for_selector("#daily")
    for lid in ["l17","l18","l19","l20","l21","l22","l23","l24","l25"]:
        pg.evaluate("(function(t){var all=['l1','l2','l3','l4','l5','l6','l7','l8','l9','l10','l11','l12','l13','l14','l15','l16','l17','l18','l19','l20','l21','l22','l23','l24','l25'];all.forEach(function(x){var L=E.lesson(x); if(x===t){L.stars=0;L.steps={};L.early=false;} else {L.stars=1;L.steps={explain:1,examples:1,practice:1,words:1,test:1};}});E.save();})('%s')"%lid)
        pg.goto(U+"#english"); pg.reload(); pg.wait_for_selector("#daily")
        pg.click(".lesson.open[data-file='lessons/%s.json']"%lid); pg.wait_for_selector(".step.cur")
        # правило і приклади
        k=0
        while pg.locator("#nx").count() and k<10:
            if k==0: pg.screenshot(path=SH+"L_%s_explain.png"%lid,full_page=True)
            pg.click("#nx"); pg.wait_for_timeout(80); k+=1
        n=0
        for _ in range(150):
            pg.wait_for_timeout(40)
            if pg.locator("#nx").count() and "зроблено" in pg.inner_text(".card"): break
            if pg.locator("#go").count(): pg.click("#go"); continue
            if pg.locator("#idk").count() and pg.locator("#next").count()==0:
                it=pg.evaluate("window.UI_CUR"); chip=pg.inner_text(".chip"); n+=1
                answer(pg,it, not ("Вправи" in chip and n%4==2)); pg.wait_for_selector("#next"); pg.click("#next")
        print(lid,"practice:", pg.inner_text(".card").replace("\n"," | ")[:110])
        pg.click("#nx"); pg.wait_for_selector(".step.cur")
        # слова
        for _ in range(12):
            if pg.locator("#fl").count()==0: break
            pg.click("#fl", position={"x":15,"y":15}); pg.click("#ok"); pg.wait_for_timeout(30)
        pg.click("#nx"); pg.click("#go")
        for _ in range(20):
            if pg.locator(".score-big").count(): break
            pg.wait_for_selector("#idk"); it=pg.evaluate("window.UI_CUR"); answer(pg,it,True); pg.wait_for_selector("#next"); pg.click("#next")
        print(lid,"test:", pg.inner_text(".card").replace("\n"," | ")[:150])
    pg.goto(U+"#english"); pg.reload(); pg.wait_for_selector("#daily"); pg.screenshot(path=SH+"L_cab.png",full_page=True)
    print("cabinet first card:", pg.inner_text(".card").replace("\n"," | ")[:200])
    b.close()
print("ERRORS",errors)
