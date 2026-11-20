# Геометрія: проходження всіх уроків по черзі (пояснення → вправи з помилками → тест) і підсумкова перевірка розділу 1.
# Статичний сервер на 8765: python3 -m http.server 8765
from playwright.sync_api import sync_playwright
import sys
errors=[]; U="http://127.0.0.1:8765/"; SH="/home/claude/shots/"
import os; os.makedirs(SH,exist_ok=True)
NL=int(sys.argv[1]) if len(sys.argv)>1 else 28
def typ(pg,s):
    for ch in s: pg.click(".key[data-k='%s']"%ch)
    pg.click(".key[data-k='✓']")
def answer(pg,it,right):
    if it["type"]=="choice":
        opt=it["a"] if right else [o for o in it["o"] if o!=it["a"]][0]
        pg.click(".opt[data-k='%d']"%it["o"].index(opt))
    else: typ(pg, it["a"] if right else "777")
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1243/chrome-linux64/chrome")
    pg=b.new_page(viewport={"width":390,"height":844},device_scale_factor=2); pg.on("pageerror",lambda e:errors.append(str(e)))
    pg.goto(U); pg.evaluate("localStorage.clear()"); pg.reload()
    pg.click(".who-b[data-id=anya]"); pg.wait_for_selector(".lesson[data-s=geometry]")
    pg.screenshot(path=SH+"g0_subjects.png")
    pg.click(".lesson[data-s=geometry]"); pg.wait_for_selector("#cont")
    pg.screenshot(path=SH+"g1_home.png",full_page=True)
    total=0
    for L in range(NL):
        pg.click("#cont"); pg.wait_for_timeout(200)
        if L<2: pg.screenshot(path=SH+"g2_explain%d.png"%L,full_page=True)
        tasks=0
        for step in range(300):
            pg.wait_for_timeout(30)
            if pg.locator("#idk").count() and pg.locator("#next").count()==0:
                it=pg.evaluate("window.UI_CUR"); answer(pg,it, tasks%7!=3); tasks+=1
                if tasks==2: pg.screenshot(path=SH+"g3_L%02d.png"%(L+1),full_page=True)
                if tasks==4 and L in (0,9,17): pg.screenshot(path=SH+"g4_fb%02d.png"%(L+1),full_page=True)
                pg.click("#next"); continue
            txt=pg.inner_text("#app")
            if "Урок пройдено" in txt or "Тест пройдено" in txt: break
            clicked=False
            for sel in ["#go","#nx","#next","#retry"]:
                if pg.locator(sel).count() and pg.locator(sel).first.is_visible(): pg.locator(sel).first.click(); clicked=True; break
            if not clicked: print("стоп:",txt[:300].replace("\n"," | ")); break
        total+=tasks
        les=pg.evaluate("Object.keys(E.P().lessons).filter(k=>E.P().lessons[k].passed||E.P().lessons[k].best).length")
        print("урок",L+1,"завдань",tasks,"| пройдено уроків:",les)
        for sel in ["#home","#back",".back"]:
            if pg.locator(sel).count(): pg.locator(sel).first.click(); break
        pg.wait_for_selector("#cont",timeout=5000)
    pg.screenshot(path=SH+"g5_home_end.png",full_page=True)
    print("усього завдань:",total)
    b.close()
print("JS-помилки:",errors[:5] if errors else "немає")
