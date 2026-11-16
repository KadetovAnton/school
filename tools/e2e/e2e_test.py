import re
from playwright.sync_api import sync_playwright
errors=[]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1243/chrome-linux64/chrome")
    pg=b.new_page(viewport={"width":390,"height":844}); pg.on("pageerror",lambda e:errors.append(str(e)))
    pg.goto("http://127.0.0.1:8765/index.html")
    pg.evaluate("localStorage.clear();localStorage.setItem('school-v2',JSON.stringify({v:2,cur:'p1',profiles:{p1:{name:'Аня',days:[],skills:{},lessons:{l1:{steps:{explain:true,examples:true,practice:true,words:true},stars:0,best:0}},seen:{},mistakes:[],reports:[]}}}))")
    pg.goto("http://127.0.0.1:8765/index.html"); pg.click(".who-b[data-id=anya]"); pg.click(".lesson.open[data-s=english]"); pg.click(".lesson.open[data-file]"); pg.wait_for_selector("#go"); pg.click("#go")
    for n in range(12):
        if pg.locator(".score-big").count(): break
        pg.wait_for_selector(".prompt")
        it=pg.evaluate("""()=>{const t=document.querySelector('.prompt').innerText.replace(/\\s+/g,' ').trim();for(const id in E.SK)for(const x of E.SK[id].items)if(x.p.replace('___','').replace(/\\s+/g,' ').trim()===t)return x;return null}""")
        if it["type"]=="choice": pg.click(".opt[data-k='%d']"%it["o"].index(it["a"]))
        elif it["type"]=="input": pg.fill("#inp",it["a"][0]); pg.click("#check")
        else:
            used=set()
            for w in it["a"][0].split(" "):
                bs=pg.locator("#pool .w")
                for i in range(bs.count()):
                    if i not in used and bs.nth(i).inner_text().strip().lower()==w: bs.nth(i).click(); used.add(i); break
            pg.click("#check")
        pg.wait_for_selector("#next"); pg.click("#next")
    pg.wait_for_selector(".score-big")
    print(pg.inner_text(".card").replace("\n"," | ")[:500])
    pg.screenshot(path="shots/7_test.png",full_page=True)
    b.close()
print("ERRORS",errors)
