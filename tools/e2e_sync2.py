# Сценарії втрати прогресу з технічного рев'ю: t1 перший вхід з наявним прогресом, t2 конфлікт двох пристроїв, t3 швидке перемикання дітей
from playwright.sync_api import sync_playwright
import json, urllib.request, time
U="http://127.0.0.1:8766/"; errs=[]
def pin(pg, s):
    for ch in s: pg.click(".key[data-k='%s']"%ch)
    pg.wait_for_timeout(400)
def login(pg, kid, code, create=False):
    pg.goto(U); pg.wait_for_selector(".who-b"); pg.click(".who-b[data-id=%s]"%kid); pg.wait_for_selector("#pin")
    pin(pg, code)
    if create: pin(pg, code)
    pg.wait_for_selector(".lesson.open", timeout=8000); pg.wait_for_timeout(800)
def srv(kid): return json.loads(urllib.request.urlopen(U+"__prog?kid="+kid).read().decode() or "null")
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1243/chrome-linux64/chrome")
    # t1: на пристрої A Артем уже має прогрес (старий сайт), але спершу він увійшов з порожнього пристрою B
    B=b.new_context().new_page(); B.on("pageerror",lambda e:errs.append(str(e)))
    login(B,"artem","1111",True)
    A=b.new_context().new_page(); A.on("pageerror",lambda e:errs.append(str(e)))
    A.goto(U); A.evaluate("localStorage.setItem('school-v3',JSON.stringify({v:3,cur:'',profiles:{artem:{name:'Артем',days:['2026-11-15','2026-11-16'],daily:{},skills:{'m.add10':{lvl:2,n:5,ok:5}},lessons:{m1:{steps:{explain:true,practice:true,test:true},stars:3,best:100}},seen:{},mistakes:[],reports:[],stars:[{d:'2026-11-16',n:5,why:'day'}]}}}))")
    login(A,"artem","1111")
    s=srv("artem")["p"]; print("t1 сервер: m1 stars", s["lessons"].get("m1",{}).get("stars"), "days", s["days"], "| локально A:", A.evaluate("E.lesson('m1').stars"))
    # t2: обидва пристрої міняють одночасно
    A.evaluate("E.lesson('m2').stars=2; E.save()"); B.evaluate("E.setCur('artem','Артем'); E.lesson('m3').stars=1; E.save()")
    A.wait_for_timeout(5000); B.evaluate("document.dispatchEvent(new Event('visibilitychange'))"); B.wait_for_timeout(1500); A.wait_for_timeout(1500)
    s=srv("artem")["p"]; print("t2 сервер:", {k:v.get("stars") for k,v in s["lessons"].items()}, "| B бачить m2:", B.evaluate("(E.store().profiles.artem.lessons.m2||{}).stars"))
    # t3: Аня відповіла і одразу перемкнулась на Артема
    login(A,"anya","2222",True)
    A.evaluate("E.lesson('l5').stars=3; E.save(); E.setCur('artem','Артем'); E.save()")
    A.wait_for_timeout(4500)
    print("t3 сервер Аня l5:", (srv("anya")["p"]["lessons"].get("l5") or {}).get("stars"))
    # t4: офлайн-зміна і закриття вкладки (pagehide → keepalive)
    A.evaluate("E.setCur('anya','Аня'); E.lesson('l6').stars=2; E.save()"); A.close()
    time.sleep(1.5); print("t4 сервер Аня l6 після закриття:", (srv("anya")["p"]["lessons"].get("l6") or {}).get("stars"))
    b.close()
print("ERR", errs)
