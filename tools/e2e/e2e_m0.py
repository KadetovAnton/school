from playwright.sync_api import sync_playwright
U="http://127.0.0.1:8765/"
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1243/chrome-linux64/chrome")
    pg=b.new_page(viewport={"width":390,"height":844}); pg.on("pageerror",lambda e:print("ERR",e))
    pg.goto(U); pg.evaluate("localStorage.clear()"); pg.goto(U); pg.wait_for_selector(".who-b")
    pg.click(".who-b[data-id=artem]"); pg.wait_for_selector(".lesson.open"); pg.click(".lesson.open[data-s=math2]"); pg.wait_for_selector("#cont")
    pg.click("#cont"); pg.wait_for_timeout(300)
    for i in range(5):
        print(i, pg.evaluate("[...document.querySelectorAll('button')].map(b=>(b.id||'')+':'+b.innerText.replace(/\\s+/g,' ').slice(0,25)+(b.disabled?'(off)':''))"))
        btn=pg.locator("button:has-text('Далі'), button:has-text('Зрозумів'), button:has-text('Тепер')").first
        if not btn.count(): break
        btn.click(); pg.wait_for_timeout(300)
    b.close()
