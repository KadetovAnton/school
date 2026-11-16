from playwright.sync_api import sync_playwright
errors=[]; U="http://127.0.0.1:8765/"
WRONG=["___ your dad work in Kyiv?","Is there ___ milk in the fridge?","Look! The dog ___ in the garden.","Yesterday I ___ football. (play)","Last summer we ___ to the sea. (go)","She didn't ___ the window.","This is the ___ book I have ever read.","I ___ TV when Mum came home."]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1243/chrome-linux64/chrome")
    pg=b.new_page(viewport={"width":390,"height":844}); pg.on("pageerror",lambda e:errors.append(str(e)))
    pg.goto(U); pg.evaluate("localStorage.clear()"); pg.reload(); pg.click(".who-b[data-id=anya]"); pg.click(".lesson.open[data-s=english]"); pg.wait_for_selector("#daily")
    pg.evaluate("var L=E.lesson('l1');L.stars=1;L.best=88;L.steps={explain:1,examples:1,practice:1,words:1,test:1};E.save()")
    pg.goto(U+"test.html"); pg.wait_for_selector("#go")
    pg.evaluate("""(W) => { (function(W){ var ans=Q.map(function(q){ var p=q.p.replace(/«|»/g,''); var bad=W.some(function(w){return q.p.indexOf(w)>=0}) || /bored/.test(q.p);
        return bad?{ok:false,score:0,hint:false,given:'x'}:{ok:true,score:1,hint:false,given:'x'}; });
      localStorage.setItem('eng7-diag-v1', JSON.stringify({name:'Аня',i:Q.length,started:true,done:true,ans:ans,date:'2026-11-16T17:40:00.000Z'})); })(W) }""", WRONG)
    pg.goto(U+"#english"); pg.reload(); pg.wait_for_selector("#daily")
    print("before:", pg.inner_text("a[href='test.html']").replace("\n"," "))
    pg.click("a[href='test.html']"); pg.wait_for_selector("#copy")
    print("result:", pg.inner_text(".score-big"), [x.replace("\n"," ")[:160] for x in pg.locator(".reco").all_inner_texts()])
    pg.goto(U+"#english"); pg.reload(); pg.wait_for_selector("#daily")
    print("cont:", pg.inner_text("#cont"))
    for t in pg.locator(".lesson[data-file]").all_inner_texts()[:9]: print("   ", t.replace("\n"," ")[:80])
    b.close()
print("ERRORS",errors)
