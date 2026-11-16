import sys
from playwright.sync_api import sync_playwright
errors=[]; U="http://127.0.0.1:8765/"
def answer(pg, it, right=True):
    t=it["type"]
    if t=="choice": pg.click(".opt[data-k='%d']"%it["o"].index(it["a"] if right else [o for o in it["o"] if o!=it["a"]][0]))
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
    for weekend in (False, True):
        pg=b.new_page(viewport={"width":390,"height":844}); pg.on("pageerror",lambda e:errors.append(str(e)))
        if weekend: pg.add_init_script("Date.prototype.getDay=function(){return 6}")
        pg.goto(U); pg.evaluate("localStorage.clear()"); pg.reload(); pg.click(".who-b[data-id=anya]"); pg.click(".lesson.open[data-s=english]"); pg.wait_for_selector("#reviewBtn")
        print("weekend" if weekend else "weekday", "| row before:", pg.inner_text("#reviewBtn").replace("\n"," "))
        pg.evaluate("""(()=>{['ps.base','ps.s','ps.es','ps.neg','ps.q','pc.be','past.ed','irr.1','be.form','there.form'].forEach((id,i)=>{var s=E.sk(id);s.lvl=i%3?2:1;s.n=3;s.last=E.addDays(E.today(),-i)});E.save()})()""")
        pg.goto(U+"#english"); pg.reload(); pg.wait_for_selector("#reviewBtn")
        print("   row:", pg.inner_text("#reviewBtn").replace("\n"," "))
        if not weekend:
            pg.click("#reviewBtn")
        else:
            pg.click("#daily"); pg.wait_for_selector(".lesson[data-p]")
            print("   daily parts:", [x.replace("\n"," ")[:40] for x in pg.locator(".lesson[data-p]").all_inner_texts()])
            pg.click(".lesson[data-p=review]")
        n=0; skills=set()
        for _ in range(40):
            pg.wait_for_timeout(40)
            if pg.locator("#copy").count(): break
            if pg.locator("#idk").count() and pg.locator("#next").count()==0:
                it=pg.evaluate("window.UI_CUR"); skills.add(it["skill"]); n+=1; answer(pg,it, n%4!=0); pg.wait_for_selector("#next"); pg.click("#next")
        print("   tasks:", n, "skills covered:", len(skills))
        print("   result:", pg.inner_text(".card").replace("\n"," | ")[:330])
        pg.click("#go"); pg.wait_for_timeout(300)
        print("   after:", (pg.inner_text("#reviewBtn") if pg.locator("#reviewBtn").count() else pg.inner_text(".lesson[data-p=review]")).replace("\n"," "), "| stars week:", pg.evaluate("E.starsWeek()"))
        pg.close()
    b.close()
print("ERRORS",errors)
