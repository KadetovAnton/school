from playwright.sync_api import sync_playwright
errors=[]; U="http://127.0.0.1:8765/"
def run(pg, setup, label):
    pg.goto(U); pg.evaluate("localStorage.clear()"); pg.evaluate(setup); pg.reload()
    pg.click(".who-b[data-id=anya]"); pg.click(".lesson.open[data-s=english]"); pg.wait_for_selector("#daily")
    print(label, "| card:", pg.locator(".card h2").first.inner_text(), "|", pg.inner_text("a[href='test.html']").replace("\n"," ")[:90])
    pg.click("a[href='test.html']"); pg.wait_for_selector("#copy")
    print("   result:", pg.inner_text(".score-big"), "| skip:", pg.evaluate("JSON.stringify(E.P().diag.skip)"))
    pg.goto(U+"#english"); pg.reload(); pg.wait_for_selector("#daily")
    print("   cont:", pg.inner_text("#cont"), "| diag card:", pg.inner_text("a[href='test.html']").replace("\n"," ")[:70])
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1243/chrome-linux64/chrome")
    pg=b.new_page(viewport={"width":390,"height":844}); pg.on("pageerror",lambda e:errors.append(str(e)))
    pg.goto(U)
    # відповіді: на перші 14 питань правильно (to be, ps, there, pc, частина past), решта «не знаю»
    mk = """(function(key){ var ans=[]; for(var i=0;i<29;i++){ ans.push(i<14?{ok:true,score:1,hint:false,given:'x'}:{ok:false,score:0,hint:false,given:null}); }
      localStorage.setItem(key, JSON.stringify({name:'Аня',i:29,started:true,done:true,ans:ans,date:'2026-11-16T15:00:00.000Z'})); })"""
    run(pg, mk+"('eng7-diag-v1')", "A) тест до профілів")
    run(pg, mk+"('eng7-diag-v1:anya');localStorage.setItem('school-v3',JSON.stringify({v:3,cur:'anya',profiles:{anya:{name:'Аня',days:[],daily:{},skills:{},lessons:{},seen:{},mistakes:[],reports:[],diag:{date:'16.11.2026',pct:48,topics:{}}}}}))", "B) тест 18:10–19:12")
    b.close()
print("ERRORS",errors)
