from playwright.sync_api import sync_playwright
U="http://127.0.0.1:8765/"; errs=[]
MOCK="""
(function(){var said=[];window.__said=said;
var V=[["Eddy (English (UK))","en-GB"],["Rocko (English (UK))","en-GB"],["Flo (English (US))","en-US"],["Daniel","en-GB"],["Samantha","en-US"],["Serena (Enhanced)","en-GB"],["Lesya","uk-UA"],["Thomas","fr-FR"]].map(function(x){return {name:x[0],lang:x[1],localService:true,voiceURI:x[0]}});
window.SpeechSynthesisUtterance=function(t){this.text=t};
Object.defineProperty(window,"speechSynthesis",{configurable:true,value:{getVoices:function(){return V},speak:function(u){said.push([u.text,u.voice&&u.voice.name])},cancel:function(){},speaking:false,pending:false,paused:false,addEventListener:function(){}}});
})();"""
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1243/chrome-linux64/chrome")
    pg=b.new_page(viewport={"width":390,"height":844}); pg.add_init_script(MOCK); pg.on("pageerror",lambda e:errs.append(str(e)))
    pg.goto(U); pg.evaluate("localStorage.clear()"); pg.goto(U); pg.wait_for_selector(".who-b")
    print("auto voice:", pg.evaluate("SAY.current()"))
    pg.click(".who-b[data-id=anya]"); pg.wait_for_selector(".lesson.open"); pg.click(".lesson.open[data-s=english]"); pg.wait_for_selector("#voiceBtn")
    pg.click("#voiceBtn"); pg.wait_for_selector("[data-pick]"); pg.screenshot(path="/home/claude/tools/shots/voice.png", full_page=True)
    print("list:", pg.inner_text(".card").split("\n")[2:12])
    pg.click("[data-v='2']"); print("preview said:", pg.evaluate("__said[__said.length-1]"), "current still:", pg.evaluate("SAY.current()"))
    pg.click("[data-pick='1']"); pg.wait_for_timeout(200); print("picked:", pg.evaluate("SAY.current()"))
    pg.reload(); pg.wait_for_timeout(500); print("after reload:", pg.evaluate("SAY.current()"))
    pg.evaluate("SAY.say('hello')"); print("say used:", pg.evaluate("__said[__said.length-1]"))
    pg.evaluate("SAY.uk('привіт')"); print("uk used:", pg.evaluate("__said[__said.length-1]"))
    b.close()
print("ERR",errs)
