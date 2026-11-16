from playwright.sync_api import sync_playwright
errors=[]; U="http://127.0.0.1:8765/"
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1243/chrome-linux64/chrome")
    pg=b.new_page(viewport={"width":390,"height":844},device_scale_factor=2); pg.on("pageerror",lambda e:errors.append(str(e)))
    pg.goto(U)
    # старий прогрес тата "Антон" має скинутись
    pg.evaluate("localStorage.clear();localStorage.setItem('school-v2',JSON.stringify({v:2,cur:'p1',profiles:{p1:{name:'Антон',days:['2026-11-16'],skills:{},lessons:{l1:{steps:{explain:true},stars:0,best:0}},seen:{},mistakes:[],reports:[]}}}))")
    pg.goto(U); pg.wait_for_selector(".who-b"); pg.screenshot(path="/home/claude/tools/shots/w1.png")
    print("who:", pg.inner_text(".who").replace("\n"," "))
    pg.click(".who-b[data-id=anya]"); pg.wait_for_selector(".lesson.open")
    pg.screenshot(path="/home/claude/tools/shots/w2.png",full_page=True)
    pg.click(".lesson.open[data-s=english]"); pg.wait_for_selector("#cont")
    print("cabinet:", pg.inner_text(".card").replace("\n"," | ")[:300])
    pg.click("#cont"); pg.wait_for_selector(".step.cur"); print("cont->", pg.inner_text(".step.cur").replace("\n"," "))
    # відповімо на 3 завдання у вправах
    pg.evaluate("E.lesson('l17').steps.explain=true;E.lesson('l17').steps.examples=true;E.save()")
    (pg.click(".step[data-s=practice]") if pg.locator(".step[data-s=practice]").is_visible() else None) if pg.locator(".step[data-s=practice]:not([disabled])").count() else None
    pg.click("#back"); pg.wait_for_selector("#cont"); pg.click("#cont"); pg.wait_for_selector("#idk")
    for k in range(3):
        pg.click("#idk"); pg.wait_for_selector("#next"); pg.click("#next"); pg.wait_for_timeout(150)
        while pg.locator("#go").count(): pg.click("#go"); pg.wait_for_timeout(100)
        if pg.locator("#idk").count()==0: break
    print("today anya:", pg.evaluate("E.todayCount('english')"))
    pg.goto(U+"#english"); pg.reload(); pg.wait_for_selector("#cont"); print("cabinet today:", pg.inner_text(".today"))
    pg.screenshot(path="/home/claude/tools/shots/w3.png",full_page=True)
    pg.click("#subj"); pg.click("#who"); pg.wait_for_selector(".who-b"); print("who after:", pg.inner_text(".who").replace("\n"," "))
    pg.click(".who-b[data-id=artem]"); pg.wait_for_selector(".lesson"); print("artem:", pg.inner_text("#app").replace("\n"," | ")[:400])
    pg.screenshot(path="/home/claude/tools/shots/w4.png",full_page=True)
    # перевірка рівня для Артема -> окремий ключ; для Ані
    pg.goto(U+"test.html"); pg.wait_for_selector("#go"); print("test start name input:", pg.locator("#nm").count())
    pg.goto(U+"#english"); pg.reload(); pg.wait_for_timeout(800); print("artem #english ->", pg.inner_text("#app")[:60].replace("\n"," "))
    print("profiles:", pg.evaluate("Object.keys(E.store().profiles)"), "cur", pg.evaluate("E.cur()"))
    b.close()
print("ERRORS",errors)
