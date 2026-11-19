# Підсумкова перевірка розділу: замок → перевірка (3 помилки) → результат → «Закріпити зараз»
from playwright.sync_api import sync_playwright
U="http://127.0.0.1:8765/"; errors=[]
def typ(pg,s):
    for ch in s: pg.click(".key[data-k='%s']"%ch)
    pg.click(".key[data-k='✓']")
def answer(pg):
    it=pg.evaluate("window.UI_CUR")
    if it["type"]=="choice": pg.click(".opt[data-k='%d']"%it["o"].index(it["a"]))
    elif it.get("steps"):
        for st in it["steps"]: typ(pg, st["a"])
    else: typ(pg,it["a"])
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1243/chrome-linux64/chrome")
    pg=b.new_page(viewport={"width":390,"height":844},device_scale_factor=2); pg.on("pageerror",lambda e:errors.append(str(e)))
    pg.goto(U); pg.evaluate("localStorage.clear()"); pg.reload()
    pg.click(".who-b[data-id=anya]"); pg.click(".lesson[data-s=algebra]"); pg.wait_for_selector("#diagGo")
    t=pg.inner_text("[data-chk='1']"); assert "Відкриється" in t, t
    # строгий порядок: урок 6 закритий, без «відкрити раніше»
    pg.evaluate("E.lesson('a5').skip=true;E.save()"); pg.evaluate("location.hash='algebra'"); pg.reload(); pg.wait_for_selector("#diagGo")
    assert pg.evaluate("E.lesson('a5').skip")==False
    t=pg.inner_text("#app"); assert "відкрити раніше" not in t and "Відкриється після уроку 1" in t, t
    pg.locator(".lesson[data-file='lessons/a2.json']").click(); pg.wait_for_timeout(200)
    assert pg.locator("#diagGo").count() and "Спершу пройди урок 1" in pg.inner_text("body")
    pg.evaluate("['a5','a6','a7','a8'].forEach(function(id){E.lesson(id).stars=3});E.save()")
    pg.evaluate("location.hash='algebra'"); pg.reload(); pg.wait_for_selector("#diagGo")
    t=pg.inner_text("[data-chk='1']"); assert "12 завдань" in t, t
    pg.screenshot(path="/home/claude/shots/chk_home.png")
    pg.click("[data-chk='1']"); pg.click("#go")
    n=0; skills=set()
    while pg.locator("#idk").count():
        assert not pg.locator("#hintBtn").is_visible()
        it=pg.evaluate("window.UI_CUR"); skills.add(it["skill"])
        if n<3: pg.click("#idk")
        else: answer(pg)
        if n==0: pg.screenshot(path="/home/claude/shots/chk_task.png")
        n+=1; pg.click("#next"); pg.wait_for_timeout(30)
        if n==5:  # перервати й продовжити
            pg.click("#qback"); pg.wait_for_selector("#diagGo")
            assert "продовжити з 6" in pg.inner_text("[data-chk='1']")
            pg.click("[data-chk='1']"); pg.click("#go")
    t=pg.inner_text("#app"); print("items",n,"skills",len(skills)); assert n==12 and "Перевірку пройдено" in t and "9 з 12" in t, t
    pg.screenshot(path="/home/claude/shots/chk_res.png", full_page=True)
    ch=pg.evaluate("JSON.stringify(E.P().checks)"); print(ch)
    pg.click("#fix"); k=0
    for step in range(80):
        pg.wait_for_timeout(30)
        if pg.locator("#idk").count() and pg.locator("#next").count()==0: answer(pg); k+=1; pg.click("#next"); continue
        if "Закріпили" in pg.inner_text("#app"): break
        for sel in ["#go","#nx","#next"]:
            if pg.locator(sel).count() and pg.locator(sel).first.is_visible(): pg.locator(sel).first.click(); break
    t=pg.inner_text("#app"); print("fix tasks",k); assert "Усі теми тепер тримаються" in t, t
    print(pg.evaluate("JSON.stringify(E.P().checks)"), "open mistakes:", pg.evaluate("E.openMistakes().length"))
    pg.locator("button:has-text('До уроків')").click(); pg.wait_for_selector("#diagGo")
    print(pg.inner_text("[data-chk='1']"))
    # повторна перевірка через 2 тижні
    pg.evaluate("E.P().checks.algebra['2'].due=E.addDays(E.today(),-1);E.save()")
    pg.evaluate("location.hash='algebra'"); pg.reload(); pg.wait_for_selector("#diagGo")
    assert "Пора освіжити" in pg.inner_text("#app")
    pg.screenshot(path="/home/claude/shots/chk_due.png")
    pg.locator("[data-re='1']").first.click(); pg.click("#go"); m=0
    while pg.locator("#idk").count():
        assert not pg.locator("#hintBtn").is_visible()
        answer(pg); m+=1; pg.click("#next"); pg.wait_for_timeout(30)
    t=pg.inner_text("#app"); assert m==6 and "6 з 6" in t and "Не забулось" in t, t
    c=pg.evaluate("JSON.stringify([E.P().checks.algebra['2'], E.addDays(E.today(),30)])"); print(c)
    assert '"rn":1' in c and c.count(pg.evaluate("E.addDays(E.today(),30)"))==2
    pg.click("#home"); pg.wait_for_selector("#diagGo")
    assert "Пора освіжити" not in pg.inner_text("#app")
    print(pg.inner_text("[data-chk='1']"))
    b.close()
print("JS:",errors[:3] or "немає")
