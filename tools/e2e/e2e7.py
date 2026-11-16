from playwright.sync_api import sync_playwright
errors=[]; U="http://127.0.0.1:8765/"; SH="/home/claude/tools/shots/"
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1243/chrome-linux64/chrome")
    pg=b.new_page(viewport={"width":390,"height":844},device_scale_factor=2); pg.on("pageerror",lambda e:errors.append(str(e)))
    pg.goto(U); pg.evaluate("localStorage.clear()"); pg.reload(); pg.click(".who-b[data-id=anya]"); pg.click(".lesson.open[data-s=english]"); pg.wait_for_selector("#wordsBtn")
    pg.evaluate("(()=>{const t=E.today();E.P().words={};['mother','father','sister','brother','kitchen','T-shirt'].forEach((w,i)=>E.P().words[w]={box:4,due:t,n:3,ok:3,bad:0});E.P().wset='travel';E.save()})()")
    pg.goto(U+"#english"); pg.reload(); pg.wait_for_selector("#wordsBtn"); pg.click("#wordsBtn"); pg.click("#go2"); modes={}; shot=0
    for _ in range(60):
        pg.wait_for_timeout(40)
        if pg.locator("#go").count(): break
        if pg.locator("#fl").count(): pg.click("#fl",position={"x":15,"y":15}); pg.click("#yes"); modes["card"]=modes.get("card",0)+1; continue
        if pg.locator("#inp").count() and pg.locator("#next").count()==0:
            m="listen" if pg.locator("#pl").count() else "type"; modes[m]=modes.get(m,0)+1
            en=pg.evaluate("window.UI_CUR.en")
            g = "t shirt" if en=="T-shirt" else (en[:-2]+en[-1]+en[-2] if m=="type" and len(en)>=6 and modes[m]==1 else en)
            pg.fill("#inp", g); pg.click("#check")
            if pg.locator(".almost").count(): print("typo prompt for", en, "given", g); pg.fill("#inp", en); pg.click("#check")
            pg.wait_for_selector("#next")
            if shot<2: pg.screenshot(path=SH+"w_%s_%d.png"%(m,shot)); shot+=1
            pg.click("#next")
    print("modes", modes, "boxes", pg.evaluate("JSON.stringify(Object.fromEntries(Object.entries(E.P().words).map(([k,v])=>[k,v.box])))"))
    b.close()
print("ERRORS",errors)
