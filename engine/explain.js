/* Анімовані пояснення з озвучкою (ES5 — Safari 15+).
   EXPLAIN.play(root, id, onDone) — кроки з картинкою (SVG), текстом і голосом; дитина сама тисне «Далі».
   Крок: {t: текст (html), say: що читати вголос (без формул — щоб голос не плутався), on: видимі елементи,
   hl: підсвічені, lab: підписи, f: формула внизу (html), quiz: {q, opts:[{t, ok, fb, on, lab}]}}.
   Голос: SAY.uk (голос пристрою); якщо є якісна озвучка — EXPLAIN.audio(id, k, text) повертає URL mp3. */
(function () {
  var X = window.EXPLAIN = { list: {} };
  function el(id) { return document.getElementById(id); }
  var C1 = "#5b8def", C2 = "#f2994a", C3 = "#27ae60";

  /* ---------- (a + b)² ---------- */
  var S = 300, O = 40, A = 140, B = 80; // квадрат 220×220: a = 140, b = 80
  var svgSq =
    '<svg viewBox="0 0 300 300" class="ex-svg" aria-hidden="true">' +
    '<rect id="x-rA" x="' + O + '" y="' + O + '" width="' + A + '" height="' + A + '" fill="' + C1 + '"/>' +
    '<rect id="x-rAB1" x="' + (O + A) + '" y="' + O + '" width="' + B + '" height="' + A + '" fill="' + C2 + '"/>' +
    '<rect id="x-rAB2" x="' + O + '" y="' + (O + A) + '" width="' + A + '" height="' + B + '" fill="' + C2 + '"/>' +
    '<rect id="x-rB" x="' + (O + A) + '" y="' + (O + A) + '" width="' + B + '" height="' + B + '" fill="' + C3 + '"/>' +
    '<text id="x-tA" x="' + (O + A / 2) + '" y="' + (O + A / 2 + 10) + '" class="ex-in">a²</text>' +
    '<text id="x-tAB1" x="' + (O + A + B / 2) + '" y="' + (O + A / 2 + 10) + '" class="ex-in">ab</text>' +
    '<text id="x-tAB2" x="' + (O + A / 2) + '" y="' + (O + A + B / 2 + 10) + '" class="ex-in">ab</text>' +
    '<text id="x-tB" x="' + (O + A + B / 2) + '" y="' + (O + A + B / 2 + 10) + '" class="ex-in">b²</text>' +
    '<rect id="x-sq" x="' + O + '" y="' + O + '" width="' + (A + B) + '" height="' + (A + B) + '" fill="none" stroke="#2d3047" stroke-width="3"/>' +
    '<line id="x-cut1" class="ex-cut" x1="' + (O + A) + '" y1="' + O + '" x2="' + (O + A) + '" y2="' + (O + A + B) + '"/>' +
    '<line id="x-cut2" class="ex-cut" x1="' + O + '" y1="' + (O + A) + '" x2="' + (O + A + B) + '" y2="' + (O + A) + '"/>' +
    '<g id="x-top"><path d="M' + O + ' 28 v-6 h' + A + ' v6 M' + (O + A + 4) + ' 28 v-6 h' + (B - 4) + ' v6" class="ex-br"/>' +
    '<text id="x-la" x="' + (O + A / 2) + '" y="16" class="ex-lab">a</text><text id="x-lb" x="' + (O + A + B / 2) + '" y="16" class="ex-lab">b</text></g>' +
    '<g id="x-left"><path d="M28 ' + O + ' h-6 v' + A + ' h6 M28 ' + (O + A + 4) + ' h-6 v' + (B - 4) + ' h6" class="ex-br"/>' +
    '<text id="x-la2" x="11" y="' + (O + A / 2 + 6) + '" class="ex-lab">a</text><text id="x-lb2" x="11" y="' + (O + A + B / 2 + 6) + '" class="ex-lab">b</text></g>' +
    '</svg>';
  var ALLR = ["rA", "rAB1", "rAB2", "rB"], ALLT = ["tA", "tAB1", "tAB2", "tB"];
  var base = ["sq", "top", "left"], cut = base.concat(["cut1", "cut2"]);
  var all = cut.concat(ALLR, ALLT);
  var c = function (col, s) { return '<b style="color:' + col + '">' + s + '</b>'; };
  var NUM = { la: "3", lb: "2", la2: "3", lb2: "2", tA: "9", tAB1: "6", tAB2: "6", tB: "4" };
  var XL = { la: "x", lb: "3", la2: "x", lb2: "3", tA: "x²", tAB1: "3x", tAB2: "3x", tB: "9" };
  X.list.sq = {
    title: "Звідки береться (a + b)²",
    svg: svgSq,
    audio: { base: "content/audio/sq/", steps: ["01", "02", "03", "04", "05", "06", "07", "08", "12"], quiz: ["09", "10", "11"] }, // озвучка Gemini 3.8 Flash TTS з Google AI Studio (один файл, порізаний за паузами); немає файла — голос пристрою
    steps: [
      { on: base, t: "Візьмемо квадрат зі стороною <b>a + b</b>. Його площа — <b>(a + b)²</b>.",
        say: "Візьмемо квадрат, у якого сторона — а плюс бе. Його площа — а плюс бе у квадраті.", f: "(a + b)² = ?" },
      { on: cut, t: "Розріжемо його двома лініями — вийде <b>чотири частини</b>.",
        say: "Розріжемо його двома лініями. Вийде чотири частини." , f: "(a + b)² = ?" },
      { on: cut.concat(["rA", "tA"]), hl: ["rA"], t: "Великий квадрат: a&nbsp;·&nbsp;a = " + c(C1, "a²") + ".",
        say: "Великий квадрат: а помножити на а — це а квадрат.", f: "(a + b)² = " + c(C1, "a²") + " + …" },
      { on: cut.concat(["rA", "tA", "rB", "tB"]), hl: ["rB"], t: "Маленький квадрат: b&nbsp;·&nbsp;b = " + c(C3, "b²") + ".",
        say: "Маленький квадрат: бе помножити на бе — це бе квадрат.", f: "(a + b)² = " + c(C1, "a²") + " + … + " + c(C3, "b²") },
      { on: all, hl: ["rAB1", "rAB2"], t: "І ще <b>два однакові прямокутники</b>: a&nbsp;·&nbsp;b і ще раз a&nbsp;·&nbsp;b — разом " + c(C2, "2ab") + ".",
        say: "І ще два однакові прямокутники: а на бе, і ще раз а на бе. Разом — два а бе.", f: "(a + b)² = " + c(C1, "a²") + " + " + c(C2, "2ab") + " + " + c(C3, "b²") },
      { on: all, hl: ALLR, t: "Площа всього квадрата = сума площ частин. Ось і вся формула!",
        say: "Площа всього квадрата дорівнює сумі площ чотирьох частин. Ось і вся формула: а плюс бе у квадраті дорівнює а квадрат плюс два а бе плюс бе квадрат.", f: "(a + b)² = " + c(C1, "a²") + " + " + c(C2, "2ab") + " + " + c(C3, "b²"), big: 1 },
      { on: all, lab: NUM, t: "Перевіримо на числах: a = 3, b = 2.<br>(3 + 2)² = 5² = <b>25</b>, а 9 + 6 + 6 + 4 = <b>25</b> ✓",
        say: "Перевіримо на числах. Нехай а — три, бе — два. Три плюс два — п'ять, а п'ять у квадраті — двадцять п'ять. А тепер частини: дев'ять, шість, шість і чотири. Разом — теж двадцять п'ять. Збігається!", f: "(3 + 2)² = " + c(C1, "9") + " + " + c(C2, "12") + " + " + c(C3, "4") + " = 25" },
      { on: cut, lab: XL, t: "Тепер ти! Квадрат зі стороною <b>x + 3</b>. Чому дорівнює <b>(x + 3)²</b>?",
        say: "Тепер ти! Квадрат зі стороною ікс плюс три. Чому дорівнює ікс плюс три у квадраті? Вибери відповідь.", f: "(x + 3)² = ?",
        quiz: [
          { t: "x² + 9", fb: "Майже! Ти загубила два прямокутники — " + c(C2, "3x") + " і " + c(C2, "3x") + ". Правильно: x² + 6x + 9.", say: "Майже! Ти загубила два прямокутники: три ікс і ще три ікс. Правильно: ікс квадрат плюс шість ікс плюс дев'ять.", on: all, hl: ["rAB1", "rAB2"] },
          { t: "x² + 3x + 9", fb: "Майже! Прямокутників <b>два</b>: 3x + 3x = " + c(C2, "6x") + ". Правильно: x² + 6x + 9.", say: "Майже! Прямокутників два: три ікс плюс три ікс — це шість ікс. Правильно: ікс квадрат плюс шість ікс плюс дев'ять.", on: all, hl: ["rAB1", "rAB2"] },
          { t: "x² + 6x + 9", ok: 1, fb: "Так! " + c(C1, "x²") + " + " + c(C2, "6x") + " + " + c(C3, "9") + " 🎉", say: "Так! Ікс квадрат плюс шість ікс плюс дев'ять. Молодець!", on: all, hl: ALLR }
        ] },
      { on: all, t: "Головне: <b>(a + b)² ≠ a² + b²</b>. Не загуби два прямокутники — подвоєний добуток " + c(C2, "2ab") + "!",
        say: "Головне: а плюс бе у квадраті — це не а квадрат плюс бе квадрат. Не загуби два прямокутники — подвоєний добуток, два а бе!", f: "(a + b)² = " + c(C1, "a²") + " + " + c(C2, "2ab") + " + " + c(C3, "b²"), big: 1 }
    ]
  };

  /* ---------- програвач ---------- */
  function voiceOn() { try { return localStorage.getItem("school-exvoice") !== "0"; } catch (e) { return true; } }
  function setVoice(v) { try { localStorage.setItem("school-exvoice", v ? "1" : "0"); } catch (e) {} }
  var audioEl = null;
  function stop() { try { if (audioEl) { audioEl.pause(); audioEl = null; } if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) {} }
  var player = null, seq = 0; // один програвач: «розблоковується» натисканням, далі грає й після завантаження (Safari)
  function playUrl(url, fail) {
    try {
      if (!player) player = new Audio();
      audioEl = player; player.onerror = fail; player.src = url;
      var p = player.play(); if (p && p.catch) p.catch(fail);
    } catch (e) { fail(); }
  }
  function speak(id, k, text, qi) {
    stop(); var my = ++seq;
    if (!voiceOn() || !text) return;
    var D = X.list[id], A = D && D.audio, f = A ? (qi != null ? A.quiz[qi] : A.steps[k]) : null;
    var device = function () { if (window.SAY && SAY.uk) SAY.uk(text); };
    var fallback = function () { // немає запису → озвучка Google (якщо налаштована), інакше голос пристрою
      if (!(window.SYNC && SYNC.tts)) return device();
      playUrl("engine/silent.mp3", function () {});
      SYNC.tts(text).then(function (u) { if (my !== seq) return; if (u) playUrl(u, function () { if (my === seq) device(); }); else device(); });
    };
    if (f) {
      try {
        var a = audioEl = new Audio(A.base + f + ".mp3"), failed = false;
        var fail = function () { if (failed || audioEl !== a) return; failed = true; audioEl = null; fallback(); };
        a.onerror = fail;
        var p = a.play(); if (p && p.catch) p.catch(fail);
        return;
      } catch (e) {}
    }
    fallback();
  }
  X.stop = stop;

  X.play = function (root, id, onDone) {
    var D = X.list[id], k = 0, picked = null;
    if (!D) { if (onDone) onDone(); return; }
    if (window.SYNC && SYNC.tts) { // заздалегідь готуємо озвучку кроків, для яких немає запису
      var todo = [];
      D.steps.forEach(function (st, i) { if (!(D.audio && D.audio.steps[i])) todo.push(st.say); (st.quiz || []).forEach(function (o, j) { if (!(D.audio && D.audio.quiz[j])) todo.push(o.say); }); });
      (function next() { var t = todo.shift(); if (t) SYNC.tts(t).then(next); })();
    }
    function apply(st, pick) {
      var on = (pick && pick.on) || st.on || [], hl = (pick && pick.hl) || st.hl || [], lab = st.lab || {};
      var ids = ["sq", "top", "left", "cut1", "cut2"].concat(ALLR, ALLT), i;
      for (i = 0; i < ids.length; i++) { var e = el("x-" + ids[i]); if (!e) continue; var v = on.indexOf(ids[i]) >= 0; e.setAttribute("class", (e.getAttribute("class") || "").replace(/\s*(ex-on|ex-hl)/g, "") + (v ? " ex-on" : "") + (hl.indexOf(ids[i]) >= 0 ? " ex-hl" : "")); }
      var dflt = { la: "a", lb: "b", la2: "a", lb2: "b", tA: "a²", tAB1: "ab", tAB2: "ab", tB: "b²" };
      for (var key in dflt) { var t = el("x-" + key); if (t) t.textContent = lab[key] || dflt[key]; }
    }
    function draw() {
      var st = D.steps[k], n = D.steps.length, last = k === n - 1;
      picked = null;
      root.innerHTML = '<div class="card ex-card"><span class="chip">🎬 ' + D.title + ' · ' + (k + 1) + ' з ' + n + '</span>' +
        '<button class="ex-vo" id="exVo" aria-label="Озвучка">' + (voiceOn() ? "🔊" : "🔇") + '</button>' +
        '<div class="ex-pic">' + D.svg + '</div>' +
        '<div class="ex-f' + (st.big ? " big" : "") + '">' + (st.f || "") + '</div>' +
        '<p class="ex-t">' + st.t + '</p>' +
        (st.quiz ? '<div class="opts" id="exQ">' + st.quiz.map(function (o, i) { return '<button class="opt" data-i="' + i + '">' + o.t + '</button>'; }).join("") + '</div><div id="exFb"></div>' : "") +
        '<div class="dots">' + D.steps.map(function (_, i) { return '<i class="' + (i === k ? "on" : "") + '"></i>'; }).join("") + '</div>' +
        '<div class="row">' + (k > 0 ? '<button class="btn ghost" id="exPrev">←</button>' : "") +
        '<button class="btn" id="exNx" style="flex:3"' + (st.quiz ? " disabled" : "") + '>' + (last ? "Зрозуміло! →" : "Далі →") + '</button></div>' +
        '<button class="btn plain full" id="exRep" style="margin-top:6px">↺ Повторити крок</button></div>';
      // спершу показуємо попередній стан, потім — новий: так працює анімація переходу
      apply(k > 0 ? D.steps[k - 1] : { on: [] });
      setTimeout(function () { apply(st); }, 60);
      speak(id, k, st.say);
      el("exVo").onclick = function () { var v = !voiceOn(); setVoice(v); this.textContent = v ? "🔊" : "🔇"; if (v) speak(id, k, picked ? picked.say : st.say, picked ? st.quiz.indexOf(picked) : null); else stop(); };
      el("exRep").onclick = function () { apply(k > 0 ? D.steps[k - 1] : { on: [] }); setTimeout(function () { apply(st, picked); }, 60); speak(id, k, picked ? picked.say : st.say, picked ? st.quiz.indexOf(picked) : null); };
      if (el("exPrev")) el("exPrev").onclick = function () { k--; draw(); };
      el("exNx").onclick = function () { stop(); if (!last) { k++; draw(); } else if (onDone) onDone(); };
      if (st.quiz) {
        var bs = el("exQ").querySelectorAll(".opt");
        for (var i = 0; i < bs.length; i++) (function (b) {
          b.onclick = function () {
            var o = st.quiz[+b.getAttribute("data-i")]; picked = o;
            for (var j = 0; j < bs.length; j++) bs[j].className = "opt" + (st.quiz[j].ok ? (o.ok || j === +b.getAttribute("data-i") ? " right" : "") : j === +b.getAttribute("data-i") ? " wrong" : "");
            if (!o.ok) { for (var q = 0; q < bs.length; q++) if (st.quiz[q].ok) bs[q].className = "opt right"; }
            el("exFb").innerHTML = '<div class="fb ' + (o.ok ? "ok" : "calm") + '" style="margin-top:10px"><div>' + o.fb + '</div></div>';
            apply(st, o); speak(id, k, o.say, +b.getAttribute("data-i"));
            el("exNx").disabled = false;
            setTimeout(function () { try { el("exNx").scrollIntoView({ behavior: "smooth", block: "end" }); } catch (e) {} }, 80);
            for (var z = 0; z < bs.length; z++) bs[z].disabled = true;
          };
        })(bs[i]);
      }
    }
    draw();
  };
})();
