from playwright.sync_api import sync_playwright
errors=[]; U="http://127.0.0.1:8765/"
GOOD={"ps","pc","past"}
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1243/chrome-linux64/chrome")
    pg=b.new_page(viewport={"width":390,"height":844},device_scale_factor=2); pg.on("pageerror",lambda e:errors.append(str(e)))
    pg.goto(U); pg.evaluate("localStorage.clear()"); pg.reload(); pg.click(".who-b[data-id=anya]"); pg.click(".lesson.open[data-s=english]"); pg.wait_for_selector("#daily")
    pg.click("a[href='test.html']"); pg.wait_for_selector("#go"); pg.click("#go")
    for i in range(40):
        if pg.locator("#copy").count(): break
        pg.wait_for_selector("#next, #idk", timeout=5000)
        if pg.locator("#idk").count():
            q=pg.evaluate("Q[S.i]")
            if q["t"] in GOOD:
                if q["type"]=="choice": pg.click(".opt[data-k='%d']"%q["o"].index(q["a"]))
                elif q["type"]=="input": pg.fill("#inp", q["a"][0]); pg.click("#check")
                else:
                    used=set()
                    for w in q["a"][0].split(" "):
                        bs=pg.locator("#pool .w")
                        for k in range(bs.count()):
                            if k not in used and bs.nth(k).inner_text().strip().lower()==w: bs.nth(k).click(); used.add(k); break
                    pg.click("#check")
            else: pg.click("#idk")
        pg.wait_for_selector("#next"); pg.click("#next")
    pg.screenshot(path="/home/claude/tools/shots/place_res.png",full_page=True)
    print("result reco:", [x.replace("\n"," ")[:200] for x in pg.locator(".reco").all_inner_texts()])
    print("skip:", pg.evaluate("JSON.stringify(E.P().diag.skip)"))
    pg.goto(U+"#english"); pg.reload(); pg.wait_for_selector("#daily")
    print("cabinet lessons:"); 
    for t in pg.locator(".lesson[data-file]").all_inner_texts()[:10]: print("   ", t.replace("\n"," ")[:90])
    print("cont:", pg.inner_text("#cont"))
    print("skills lvl:", pg.evaluate("JSON.stringify(Object.fromEntries(Object.entries(E.P().skills).map(([k,v])=>[k,v.lvl])))"))
    pg.screenshot(path="/home/claude/tools/shots/place_cab.png",full_page=True)
    b.close()
print("ERRORS",errors)
