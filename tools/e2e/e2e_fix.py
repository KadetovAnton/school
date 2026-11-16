from playwright.sync_api import sync_playwright
U="http://127.0.0.1:8765/"; errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1243/chrome-linux64/chrome")
    pg=b.new_page(viewport={"width":390,"height":844}); pg.on("pageerror",lambda e:errs.append(str(e)))
    pg.goto(U); pg.evaluate("localStorage.clear()"); pg.goto(U); pg.wait_for_selector(".who-b")
    pg.click(".who-b[data-id=anya]"); pg.wait_for_selector(".lesson.open"); pg.click(".lesson.open[data-s=english]"); pg.wait_for_selector("#cont")
    # завантажити irr і додати помилку з fix-завдання
    pg.evaluate("""()=>{ var k=Object.keys(E.ITEM).filter(function(k){return E.ITEM[k].type==='fix'})[0]; return k }""")
    pg.goto(U+"#english"); pg.reload(); pg.wait_for_selector("#cont")
    r=pg.evaluate("""()=>fetch('content/english/skills/irr.json').then(r=>r.json()).then(j=>{E.curSub='english';E.addSkills(j,'english');var it=null;Object.keys(E.ITEM).forEach(function(k){var x=E.ITEM[k];if(x.type==='fix'&&/goed/.test(x.p))it=x;});E.addMistake(it,'we');E.save();return it.key})""")
    print("key", r)
    pg.click("#mist"); pg.wait_for_timeout(500); print(pg.inner_text("#app")[:400].replace("\n"," | "))
    b.close()
print("ERR",errs)
