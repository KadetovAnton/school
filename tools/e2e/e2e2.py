# Проганяє вправи й тест, відповідаючи за поточним завданням; mode: good / bad (помилки в основних)
import sys
from playwright.sync_api import sync_playwright
MODE=sys.argv[1] if len(sys.argv)>1 else "good"
errors=[]; U="http://127.0.0.1:8765/"; seen_types={}
def answer(pg, it, right):
    t=it["type"]; seen_types[t]=seen_types.get(t,0)+1
    if t=="choice":
        opt=it["a"] if right else [o for o in it["o"] if o!=it["a"]][0]
        pg.click(".opt[data-k='%d']"%it["o"].index(opt))
    elif t=="fix":
        k=it["bad"] if right else (0 if it["bad"]!=0 else 1)
        pg.click(".fixw .w[data-k='%d']"%k)
    elif t in("input","dict"):
        a=it["a"][0]
        pg.fill("#inp", a if right else "zzz"); pg.click("#check")
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
    pg.goto(U); pg.evaluate("localStorage.clear()"); pg.reload()
    pg.click(".who-b[data-id=anya]"); pg.click(".lesson.open[data-s=english]"); pg.wait_for_selector("#cont")
    pg.evaluate("E.lesson('l17').steps={explain:true,examples:true,words:true};E.save()")
    pg.goto(U+"#english"); pg.reload(); pg.wait_for_selector("#cont"); pg.click("#cont"); pg.wait_for_selector(".step.cur")
    (pg.click(".step[data-s=practice]") if pg.locator(".step[data-s=practice]").is_visible() else None)
    shots=0; n=0
    for step in range(120):
        pg.wait_for_timeout(60)
        if pg.locator("#nx").count() and "зроблено" in pg.inner_text(".card"): break
        if pg.locator("#go").count(): pg.click("#go"); continue
        if pg.locator("#fb").count() and pg.locator("#next").count()==0 and (pg.locator("#idk").count()):
            it=pg.evaluate("window.UI_CUR"); chip=pg.inner_text(".chip")
            right = not (MODE=="bad" and "Вправи" in chip and n%3==0)
            if "Вправи" in chip: n+=1
            answer(pg,it,right)
            pg.wait_for_selector("#next")
            if it["type"] in ("fix","dict") and shots<4:
                pg.screenshot(path="/home/claude/tools/shots/n_%s_%d.png"%(it["type"],shots),full_page=True); shots+=1
            pg.click("#next")
    print("practice summary:", pg.inner_text(".card").replace("\n"," | ")[:200])
    pg.click("#nx"); pg.wait_for_selector(".step.cur"); pg.click(".step[data-s=test]"); pg.click("#go")
    for step in range(30):
        if pg.locator(".score-big").count(): break
        pg.wait_for_selector("#idk"); it=pg.evaluate("window.UI_CUR"); answer(pg,it,True); pg.wait_for_selector("#next"); pg.click("#next")
    print("test:", pg.inner_text(".card").replace("\n"," | ")[:120])
    print("types answered:", seen_types, "today:", pg.evaluate("E.todayCount('english')"))
    b.close()
print("ERRORS",errors)
