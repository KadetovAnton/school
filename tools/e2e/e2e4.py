from playwright.sync_api import sync_playwright
errors=[]; U="http://127.0.0.1:8765/"; SH="/home/claude/tools/shots/"
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1243/chrome-linux64/chrome")
    pg=b.new_page(viewport={"width":390,"height":844},device_scale_factor=2); pg.on("pageerror",lambda e:errors.append(str(e)))
    pg.goto(U); pg.evaluate("localStorage.clear()"); pg.reload(); pg.click(".who-b[data-id=anya]"); pg.wait_for_selector(".reward")
    print("reward empty:", pg.inner_text(".reward").replace("\n"," ")[:120])
    pg.click("[data-act=dad]"); pg.fill("#rt","похід у кіно"); pg.fill("#rg","30"); pg.click("#sv")
    print("no pin ->", pg.inner_text("#toast"))
    pg.fill("#rp","1234"); pg.click("#sv"); pg.wait_for_selector(".reward"); print("reward set:", pg.inner_text(".reward").replace("\n"," ")[:160])
    pg.click("[data-act=dad]"); pg.wait_for_selector("#pn"); pg.fill("#pn","0000"); pg.click("#ok"); pg.wait_for_timeout(300); print("wrong pin still gate:", pg.locator("#pn").count())
    pg.fill("#pn","1234"); pg.click("#ok"); pg.wait_for_selector("#rt"); print("pin ok, form value:", pg.input_value("#rt")); pg.click("#bk")
    # нарахуємо зірки і перевіримо значки + тему
    pg.evaluate("E.addStars(25,'test');E.cnt('daysDone')"); pg.wait_for_timeout(200)
    pg.reload(); pg.goto(U+"#home"); pg.reload(); pg.wait_for_selector(".reward")
    print("reward after:", pg.inner_text(".reward").replace("\n"," ")[:120]); pg.screenshot(path=SH+"m1_subj.png",full_page=True)
    pg.click("[data-act=badges]"); pg.wait_for_selector(".badges"); print("badges got:", pg.locator(".badge.got").count(), "themes open:", pg.locator(".theme:not([disabled])").count())
    pg.click(".theme[data-th=ocean]"); print("body class:", pg.evaluate("document.body.className"))
    pg.screenshot(path=SH+"m2_badges.png",full_page=True)
    pg.click("#bk"); pg.click(".lesson.open[data-s=english]"); pg.wait_for_selector("#daily"); pg.screenshot(path=SH+"m3_cab.png",full_page=True)
    print("cab stats:", pg.inner_text(".stats").replace("\n"," "))
    pg.click("#subj"); pg.click("#who"); print("who body class:", repr(pg.evaluate("document.body.className")))
    b.close()
print("ERRORS",errors)
