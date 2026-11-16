from playwright.sync_api import sync_playwright
errors=[]; U="http://127.0.0.1:8765/"
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1243/chrome-linux64/chrome")
    pg=b.new_page(viewport={"width":390,"height":844}); pg.on("pageerror",lambda e:errors.append(str(e)))
    pg.goto(U); pg.evaluate("localStorage.clear()"); pg.reload(); pg.click(".who-b[data-id=anya]"); pg.click(".lesson.open[data-s=english]")
    pg.wait_for_selector("#cont"); pg.click("a[href='test.html']"); pg.wait_for_selector("#go"); pg.click("#go")
    for i in range(40):
        if pg.locator("#copy").count(): break
        pg.wait_for_selector("#next, #idk, [id^=idk]", timeout=5000)
        if pg.locator("#idk").count(): pg.click("#idk")
        pg.wait_for_selector("#next"); pg.click("#next")
    print("diag:", pg.evaluate("JSON.stringify(E.P().diag)"), "today", pg.evaluate("E.todayCount('english')"))
    pg.click("a[href='./#english']") if pg.locator("a[href='./#english']").count() else pg.goto(U+"#english")
    pg.wait_for_selector("#cont"); print("bottom:", pg.locator("a[href='test.html']").inner_text().replace("\n"," "))
    b.close()
print("ERRORS",errors)
