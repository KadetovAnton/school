from playwright.sync_api import sync_playwright
import json, urllib.request
U="http://127.0.0.1:8766/"; errs=[]
def pin(pg, s):
    for ch in s: pg.click(".key[data-k='%s']"%ch)
    pg.wait_for_timeout(500)
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1243/chrome-linux64/chrome")
    # пристрій 1: старий прогрес Ані без входу
    c1=b.new_context(viewport={"width":390,"height":844}); pg=c1.new_page(); pg.on("pageerror",lambda e:errs.append(str(e)))
    pg.goto(U); pg.evaluate("localStorage.setItem('school-v3',JSON.stringify({v:3,cur:'anya',profiles:{anya:{name:'Аня',days:['2026-11-16'],daily:{},skills:{},lessons:{l1:{steps:{explain:true},stars:1,best:88}},seen:{},mistakes:[],reports:[]}}}))")
    pg.goto(U); pg.wait_for_selector(".who-b"); print("1. старт → екран вибору (бо ще не входила)")
    pg.click(".who-b[data-id=anya]"); pg.wait_for_selector("#pin"); print("2.", pg.inner_text("h1"))
    pin(pg,"1234"); pg.wait_for_selector("#pin"); print("3.", pg.inner_text("h1"))
    pin(pg,"1111"); pg.wait_for_timeout(300); print("   неспівпадіння →", pg.inner_text("h1"))
    pin(pg,"1234"); pin(pg,"1234"); pg.wait_for_selector(".lesson.open", timeout=8000); print("4. увійшла:", pg.inner_text(".card h1"))
    pg.wait_for_timeout(500)
    print("   kv:", urllib.request.urlopen(U+"__kv").read().decode())
    # зробити зміну
    pg.evaluate("E.lesson('l2').stars=2; E.save()"); pg.wait_for_timeout(3500)
    # пристрій 2
    c2=b.new_context(viewport={"width":390,"height":844}); q=c2.new_page(); q.on("pageerror",lambda e:errs.append(str(e)))
    q.goto(U); q.wait_for_selector(".who-b"); q.click(".who-b[data-id=anya]"); q.wait_for_selector("#pin"); print("5. пристрій 2:", q.inner_text("h1"))
    pin(q,"9999"); print("   хибний PIN:", q.inner_text("#perr"))
    pin(q,"1234"); q.wait_for_selector(".lesson.open", timeout=8000)
    print("6. прогрес на пристрої 2: l1 stars", q.evaluate("E.lesson('l1').stars"), "l2 stars", q.evaluate("E.lesson('l2').stars"), "best", q.evaluate("E.lesson('l1').best"))
    # зміна на пристрої 2, потім пристрій 1 повертається
    q.evaluate("E.lesson('l3').stars=3; E.save()"); q.wait_for_timeout(3500)
    pg.evaluate("document.dispatchEvent(new Event('visibilitychange'))"); pg.wait_for_timeout(1000)
    print("7. пристрій 1 після повернення: l3 stars", pg.evaluate("E.lesson('l3') && E.lesson('l3').stars"))
    # перезавантаження з токеном — без PIN
    pg.goto(U+"#english"); pg.reload(); pg.wait_for_timeout(1500); print("8. reload з входом →", pg.inner_text("#app")[:40].replace("\n"," "))
    # Артем у тому ж браузері — свій PIN
    pg.goto(U); pg.evaluate("localStorage.setItem('school-v3', JSON.stringify(Object.assign(JSON.parse(localStorage.getItem('school-v3')),{cur:''})))"); pg.goto(U); pg.wait_for_selector(".who-b")
    pg.click(".who-b[data-id=artem]"); pg.wait_for_selector("#pin"); print("9. Артем:", pg.inner_text("h1"))
    # звіт без telegram → копіювання
    r=pg.evaluate("SYNC.report('anya','тест').then(function(x){return x})"); print("10. report без TG:", r)
    b.close()
print("ERR", errs)
