# Алгебра: перевірка рівня (частина правильно, частина ні) → результат → урок 1 (вправи й тест). Статичний сервер на 8765.
from playwright.sync_api import sync_playwright
errors=[]; U="http://127.0.0.1:8765/"; SH="/home/claude/shots/"
import os; os.makedirs(SH,exist_ok=True)
def typ(pg,s):
    for ch in s: pg.click(".key[data-k='%s']"%ch)
    pg.click(".key[data-k='✓']")
def answer(pg,it,right):
    if it["type"]=="choice":
        opt=it["a"] if right else [o for o in it["o"] if o!=it["a"]][0]
        pg.click(".opt[data-k='%d']"%it["o"].index(opt))
    else:
        typ(pg, it["a"] if right else "777")
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1243/chrome-linux64/chrome")
    pg=b.new_page(viewport={"width":390,"height":844},device_scale_factor=2); pg.on("pageerror",lambda e:errors.append(str(e)))
    pg.goto(U); pg.evaluate("localStorage.clear()"); pg.reload()
    pg.click(".who-b[data-id=anya]"); pg.wait_for_selector(".lesson[data-s=algebra]")
    pg.screenshot(path=SH+"a0_subjects.png")
    pg.click(".lesson[data-s=algebra]"); pg.wait_for_selector("#diagGo")
    pg.screenshot(path=SH+"a1_home.png",full_page=True)
    pg.click("#diagGo"); pg.wait_for_selector("#go"); pg.screenshot(path=SH+"a2_intro.png"); pg.click("#go")
    n=0; typo_tested=False
    while True:
        pg.wait_for_timeout(40)
        if pg.locator("#send").count(): break
        if pg.locator("#more").count(): pg.screenshot(path=SH+"a5b_part.png"); pg.click("#more"); continue
        it=pg.evaluate("window.UI_CUR")
        if n==0: pg.screenshot(path=SH+"a3_task.png")
        if it["type"]=="num" and "/" in it["a"] and not typo_tested:
            a=it["a"]; neg=a.startswith("−"); num,den=a.lstrip("−").split("/")
            typ(pg,("−" if neg else "")+str(int(num)*2)+"/"+str(int(den)*2)); pg.wait_for_timeout(50)
            assert "скоротити" in pg.inner_text("#almost"), "нема підказки скоротити"
            pg.screenshot(path=SH+"a4_typo.png"); typo_tested=True
            for _ in range(12): pg.click(".key[data-k='⌫']")
            typ(pg,a)
        else:
            right = n < 15 or n in (20,21)   # частина 1 правильно, далі здебільшого помилки
            answer(pg,it,right)
        if n==20: pg.screenshot(path=SH+"a5_fb.png",full_page=True)
        pg.click("#next"); n+=1
    pg.screenshot(path=SH+"a6_result.png",full_page=True)
    d=pg.evaluate("E.P().diagS.algebra"); print("diag:",d["pct"],d["skip"])
    pg.click("#home"); pg.wait_for_selector("#cont"); pg.screenshot(path=SH+"a7_home2.png",full_page=True)
    print("продовжити:",pg.inner_text("#cont"))
    # урок a9 (перший непропущений?) — пройти кроки
    pg.click("#cont"); pg.wait_for_timeout(300); pg.screenshot(path=SH+"a8_lesson.png",full_page=True)
    tasks=0; last=""
    for step in range(200):
        pg.wait_for_timeout(50)
        if pg.locator("#idk").count() and pg.locator("#next").count()==0:
            it=pg.evaluate("window.UI_CUR"); answer(pg,it, tasks%6!=2); tasks+=1
            if tasks==3: pg.screenshot(path=SH+"a8b_practice.png",full_page=True)
            pg.click("#next"); continue
        txt=pg.inner_text("#app")
        if "Тест пройдено" in txt or ("%" in txt and "Ще раз" in txt and tasks>10): break
        clicked=False
        for sel in ["#go","#nx","#next"]:
            if pg.locator(sel).count() and pg.locator(sel).first.is_visible(): pg.locator(sel).first.click(); clicked=True; break
        if not clicked:
            print("стоп:",txt[:200].replace("\n"," | ")); break
    print("завдань в уроці:",tasks, "| урок a6:", pg.evaluate("JSON.stringify(E.lesson('a6'))"))
    pg.screenshot(path=SH+"a9_end.png",full_page=True)
    b.close()
print("JS-помилки:",errors[:5] if errors else "немає")
