/* =====================================================================
   ui.js — екрани: кабінет, кроки уроку, сесія завдань з циклом
   «помилка → розібраний приклад → 2–3 схожі завдання».
   Зміст береться з content/<предмет>/ (JSON), рушій — з engine.js.
   ===================================================================== */
(function () {
  "use strict";
  var VER = window.APP_VER || "1";
  var BASE = "content/english/";
  var $app = document.getElementById("app");

  /* ---------- допоміжне ---------- */
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function strip(s) { return String(s).replace(/<[^>]+>/g, ""); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function $(id) { return document.getElementById(id); }
  var canSpeak = (function () { try { return "speechSynthesis" in window; } catch (e) { return false; } })();
  function say(text) {
    try { speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(text); u.lang = "en-GB"; u.rate = 0.9; speechSynthesis.speak(u); } catch (e) {}
  }
  function stopSay() { try { speechSynthesis.cancel(); } catch (e) {} }
  function bindSay(root) {
    var bs = root.querySelectorAll("[data-say]");
    for (var i = 0; i < bs.length; i++) (function (b) {
      if (!canSpeak) { b.parentNode.removeChild(b); return; }
      b.onclick = function (e) { e.stopPropagation(); say(b.getAttribute("data-say")); };
    })(bs[i]);
  }
  var toastTimer;
  function toast(m) {
    var t = $("toast"); t.textContent = m; t.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove("show"); }, 2600);
  }
  function toTop() { try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch (e) { window.scrollTo(0, 0); } }
  function starsStr(n) { return "★".repeat(n) + "☆".repeat(3 - n); }
  function fmt(n) { return n % 1 === 0 ? String(n) : n.toFixed(1).replace(".", ","); }
  function dayWord(n) { var a = n % 10, b = n % 100; if (a === 1 && b !== 11) return "день"; if (a >= 2 && a <= 4 && (b < 12 || b > 14)) return "дні"; return "днів"; }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function lvl(id) { return E.LV[E.level(id)]; }

  var cache = {};
  function getJSON(path) {
    if (cache[path]) return Promise.resolve(cache[path]);
    return fetch(BASE + path + "?v=" + VER).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    }).then(function (j) { cache[path] = j; return j; });
  }
  function loadLesson(file) {
    return getJSON(file).then(function (L) {
      return Promise.all((L.skillFiles || []).map(getJSON)).then(function (arr) {
        arr.forEach(function (j) { if (!j._added) { E.addSkills(j); j._added = true; } });
        return L;
      });
    });
  }
  function loadingView() { $app.innerHTML = '<div class="loading">Завантажую… ⏳</div>'; }
  function failView(retry) {
    $app.innerHTML = '<div class="card" style="text-align:center"><div class="celebrate">📡</div><h2>Не вдалося завантажити</h2><p class="muted">Перевір інтернет і спробуй ще раз.</p><div class="row"><button class="btn full" id="rt">Спробувати ще раз</button></div></div>';
    $("rt").onclick = retry;
  }

  var PATH = null;

  /* ================== КАБІНЕТ ================== */
  function renderHome() {
    var P = E.P();
    if (!P.name) return renderName();
    if (!PATH) { loadingView(); getJSON("path.json").then(function (j) { PATH = j; renderHome(); }, function () { failView(renderHome); }); return; }
    var l1 = E.lesson("l1"), done = l1.stars > 0, st = E.streak();
    var totalStars = 0, doneCount = 0, allLessons = 0;
    Object.keys(P.lessons).forEach(function (k) { totalStars += P.lessons[k].stars || 0; if (P.lessons[k].stars > 0) doneCount++; });
    PATH.stages.forEach(function (s) { allLessons += s.lessons.length; });

    var html = '<div class="card"><div class="hello"><div><h1>Привіт, ' + esc(P.name) + '! 👋</h1>' +
      '<p class="muted" style="margin:0">' + (done ? "Перший урок пройдено. Наступний уже на підході!" : "Сьогодні починаємо з першого уроку. 15–20 хвилин, і все вийде.") + '</p></div></div>' +
      '<div class="stats"><span class="stat">🔥 ' + st + ' ' + dayWord(st) + ' поспіль</span><span class="stat">⭐ ' + totalStars + '</span>' +
      '<span class="stat">📚 ' + doneCount + ' з ' + allLessons + ' уроків</span></div></div>';

    var num = 0;
    PATH.stages.forEach(function (stage, si) {
      html += '<div class="card stage ' + (si === 0 ? "" : "locked") + '"><div class="stage-h"><div class="stage-n">' + stage.n + '</div>' +
        '<div><div class="stage-t">' + esc(stage.title) + '</div><div class="stage-s">' + esc(stage.sub) + '</div></div></div>';
      stage.lessons.forEach(function (ls) {
        num++;
        var cls = "lock", sub = "🔒 Відкриється після попереднього уроку", ic = "🔒";
        if (ls.file) {
          var L = E.lesson(ls.id), nDone = 0;
          for (var k in L.steps) if (L.steps[k]) nDone++;
          var lv = lessonLevels(ls.id);
          if (L.stars > 0) { cls = "done"; ic = "✅"; sub = '<span class="stars">' + starsStr(L.stars) + '</span> · можна повторити'; }
          else { cls = "open"; ic = ls.ic; sub = nDone ? "Продовжити · " + nDone + " з 5 кроків" : "Почати · ~20 хв"; }
          if (lv) sub += '<div class="lvls" title="Навички уроку">' + lv + '</div>';
        } else if (ls.id === "l2" && done) { ic = "⏳"; sub = "Скоро з'явиться"; }
        html += '<button class="lesson ' + cls + '" data-file="' + (ls.file || "") + '"><span class="ic">' + ic + '</span>' +
          '<span><div class="lt">' + num + '. ' + esc(ls.title) + '</div><div class="ls">' + sub + '</div></span></button>';
      });
      html += '</div>';
    });
    html += '<a class="lesson" href="test.html" style="text-decoration:none"><span class="ic">🧭</span><span><div class="lt">Перевірка рівня</div><div class="ls">Тест на 29 завдань: що вже знаю, а що підтягнути</div></span></a>';
    $app.innerHTML = html;
    var bs = $app.querySelectorAll(".lesson[data-file]");
    for (var i = 0; i < bs.length; i++) (function (b) {
      var f = b.getAttribute("data-file");
      if (f) b.onclick = function () { openLesson(f); };
    })(bs[i]);
  }
  /* рядок значків рівнів навичок уроку (лише якщо урок уже завантажувався) */
  function lessonLevels(id) {
    var L = cache["lessons/" + id + ".json"];
    var ids = L ? L.skills : null;
    if (!ids) { // ще не завантажений — показуємо з прогресу, якщо щось є
      var P = E.P(), pre = id === "l1" ? "ps." : null;
      if (!pre) return "";
      ids = Object.keys(P.skills).filter(function (k) { return k.indexOf(pre) === 0; });
      if (!ids.length) return "";
    }
    return ids.map(function (s) { return '<span>' + lvl(s).e + '</span>'; }).join("");
  }

  function renderName() {
    $app.innerHTML = '<div class="card"><div class="big-emoji">🇬🇧</div><h1>Твій кабінет англійської</h1>' +
      '<p class="muted">Тут твій шлях навчання: короткі уроки по 15–20 хвилин, вправи з підказками, слова з озвучкою. Пройшла урок — відкривається наступний.</p>' +
      '<label style="display:block;font-weight:800;margin:8px 0 6px" for="nm">Як тебе звати?</label>' +
      '<input id="nm" type="text" autocomplete="off" placeholder="Ім\'я"><div class="row"><button class="btn full" id="go" disabled>Увійти →</button></div></div>';
    var nm = $("nm"), go = $("go");
    nm.oninput = function () { go.disabled = !nm.value.trim(); };
    nm.onkeydown = function (e) { if (e.key === "Enter" && nm.value.trim()) go.click(); };
    go.onclick = function () { E.P().name = nm.value.trim(); E.save(); renderHome(); };
  }

  /* ================== УРОК ================== */
  var STEPS = [
    { id: "explain", e: "📖", t: "Правило" },
    { id: "examples", e: "🎧", t: "Приклади" },
    { id: "practice", e: "✍️", t: "Вправи" },
    { id: "words", e: "🃏", t: "Слова" },
    { id: "test", e: "🏆", t: "Тест" }
  ];
  var LES = null; // поточний урок

  function openLesson(file, stepId) {
    loadingView();
    loadLesson(file).then(function (L) { LES = L; renderLesson(stepId); toTop(); }, function () { failView(function () { openLesson(file, stepId); }); });
  }
  function stepAvailable(i) { var st = E.lesson(LES.id).steps; return i === 0 || st[STEPS[i - 1].id] || st[STEPS[i].id]; }
  function renderLesson(stepId) {
    var st = E.lesson(LES.id).steps;
    if (!stepId) { var f = null; for (var i = 0; i < STEPS.length; i++) if (!st[STEPS[i].id]) { f = STEPS[i]; break; } stepId = f ? f.id : "explain"; }
    var idx = 0; STEPS.forEach(function (s, i) { if (s.id === stepId) idx = i; });
    var stepsHtml = STEPS.map(function (s, i) {
      return '<button class="step ' + (s.id === stepId ? "cur" : "") + ' ' + (st[s.id] ? "done" : "") + '" data-s="' + s.id + '" ' + (stepAvailable(i) ? "" : "disabled") + '>' +
        '<span class="e">' + (st[s.id] && s.id !== stepId ? "✓" : s.e) + '</span>' + s.t + '</button>';
    }).join("");
    $app.innerHTML = '<div class="topbar"><button class="back" id="back">← Кабінет</button><span class="muted small" style="font-weight:700">' + esc(LES.title) + '</span></div>' +
      '<div class="steps">' + stepsHtml + '</div><div id="stage"></div>';
    $("back").onclick = function () { stopSay(); renderHome(); toTop(); };
    var sb = $app.querySelectorAll(".step");
    for (var j = 0; j < sb.length; j++) (function (b) { b.onclick = function () { stopSay(); renderLesson(b.getAttribute("data-s")); toTop(); }; })(sb[j]);
    var stage = $("stage");
    ({ explain: stepExplain, examples: stepExamples, practice: stepPractice, words: stepWords, test: stepTest })[stepId](stage, idx);
  }
  function completeStep(id) { E.lesson(LES.id).steps[id] = true; E.markDay(); E.save(); }
  function nextStep(idx) { var n = STEPS[idx + 1]; if (n) renderLesson(n.id); else renderHome(); toTop(); }

  /* --- 1. Правило --- */
  function stepExplain(root, idx) {
    var k = 0, X = LES.explain;
    function draw() {
      var c = X[k];
      root.innerHTML = '<div class="card"><span class="chip">Правило · ' + (k + 1) + ' з ' + X.length + '</span>' +
        '<div class="big-emoji">' + c.e + '</div><h2>' + c.h + '</h2>' + c.html +
        '<div class="dots">' + X.map(function (_, i) { return '<i class="' + (i === k ? "on" : "") + '"></i>'; }).join("") + '</div>' +
        '<div class="row">' + (k > 0 ? '<button class="btn ghost" id="prev">←</button>' : "") +
        '<button class="btn" id="nx" style="flex:3">' + (k < X.length - 1 ? "Далі →" : "Зрозуміло! До прикладів →") + '</button></div></div>';
      bindSay(root);
      if ($("prev")) $("prev").onclick = function () { k--; draw(); toTop(); };
      $("nx").onclick = function () { if (k < X.length - 1) { k++; draw(); toTop(); } else { completeStep("explain"); nextStep(idx); } };
    }
    draw();
  }

  /* --- 2. Приклади --- */
  function stepExamples(root, idx) {
    var ex = LES.examples;
    root.innerHTML = '<div class="card"><span class="chip">Приклади</span><h2>🎧 ' + esc(ex.title) + '</h2>' +
      '<p class="muted">Натисни 🔊 і повтори вголос. Подивись на виділені дієслова: де є -s, а де нема, і чому?</p>' +
      (canSpeak ? '<button class="btn ghost full" id="all" style="margin-bottom:8px">▶️ Послухати все</button>' : "") +
      ex.items.map(function (x) { return '<div class="ex"><div><div class="en">' + x[0] + '</div><div class="ua">' + x[1] + '</div></div><button class="say round" data-say="' + esc(strip(x[0])) + '">🔊</button></div>'; }).join("") +
      (ex.question ? '<div class="tip">🤔 <b>Питання на кмітливість:</b> ' + ex.question.q + ' <span id="ans" style="display:none">' + ex.question.a + '</span> <button class="say" id="showAns">Відповідь</button></div>' : "") +
      '<div class="row"><button class="btn full" id="nx">До вправ →</button></div></div>';
    bindSay(root);
    if ($("showAns")) $("showAns").onclick = function (e) { $("ans").style.display = "inline"; e.target.parentNode.removeChild(e.target); };
    if ($("all")) $("all").onclick = function () {
      try { speechSynthesis.cancel(); ex.items.forEach(function (x) { var u = new SpeechSynthesisUtterance(strip(x[0])); u.lang = "en-GB"; u.rate = 0.9; speechSynthesis.speak(u); }); } catch (e) {}
    };
    $("nx").onclick = function () { completeStep("examples"); nextStep(idx); };
  }

  /* ================== ОДНЕ ЗАВДАННЯ ==================
     cfg: chip, prog (0..1), pre (скільки підказок відкрити одразу),
          nextLabel(ok) → підпис кнопки, done(r)
     r: {ok, clean, given, st, msg} */
  function hintsOf(it) {
    var h = (it.h || []).slice(), sk = E.SK[it.skill];
    if (sk && sk.rule && h.indexOf(sk.rule) < 0) h.push("<b>Правило:</b> " + sk.rule);
    return h;
  }
  function fullSentence(it, right) {
    if (it.type === "order") return cap(right) + ".";
    if (it.p.indexOf("___") >= 0) return it.p.replace("___", right).replace(/\s*\(.*?\)\s*$/, "");
    return right;
  }
  function showTask(root, it, cfg) {
    var hints = hintsOf(it), used = 0, answered = false, typoUsed = false, built = [];
    var pre = Math.min(cfg.pre || 0, hints.length);
    var sk = E.SK[it.skill];
    E.markSeen(it);
    var body = "";
    if (it.type === "choice") body = '<div class="opts">' + it.o.map(function (o, k) { return '<button class="opt" data-k="' + k + '">' + esc(o) + '</button>'; }).join("") + '</div>';
    if (it.type === "input") body = '<input id="inp" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Твоя відповідь"><div id="almost"></div><div class="row" id="chkrow"><button class="btn full" id="check" disabled>Перевірити</button></div>';
    if (it.type === "order") body = '<div class="built empty" id="built"></div><div class="pool" id="pool">' + it.words.map(function (w, k) { return '<button class="w" data-k="' + k + '">' + esc(w) + '</button>'; }).join("") + '</div><div class="row" id="chkrow"><button class="btn full" id="check" disabled>Перевірити</button></div>';
    root.innerHTML = '<div class="card"><span class="chip">' + cfg.chip + '</span>' +
      (sk ? '<span class="skillTag">' + lvl(it.skill).e + ' ' + esc(sk.title) + '</span>' : "") +
      '<div class="prog"><i style="width:' + Math.round((cfg.prog || 0) * 100) + '%"></i></div>' +
      (it.task ? '<div class="task">' + it.task + ':</div>' : "") +
      '<div class="prompt">' + esc(it.p).replace("___", '<span class="blank"></span>') + '</div>' + body +
      '<div id="hints"></div><div class="row" id="aux"><button class="btn ghost" id="hintBtn">💡 Підказка</button><button class="btn plain" id="idk">🤷 Не знаю</button></div>' +
      '<div id="fb"></div></div>';

    function addHint() {
      if (answered || used >= hints.length) return;
      $("hints").insertAdjacentHTML("beforeend", '<div class="hint"><b>Підказка ' + (used + 1) + ':</b> ' + hints[used] + '</div>');
      used++;
      if (used >= hints.length) { var b = $("hintBtn"); b.disabled = true; b.textContent = "💡 Більше немає"; }
    }
    for (var p = 0; p < pre; p++) addHint();

    function finish(given, btn) {
      if (answered) return;
      var c = E.check(it, given), spellNote = false;
      if (c.st === "typo" && !typoUsed) {
        typoUsed = true;
        $("almost").innerHTML = '<div class="almost">✏️ Майже! Перевір написання і спробуй ще раз 🙂</div>';
        var inp0 = $("inp"); try { inp0.focus(); } catch (e) {}
        return;
      }
      if (c.st === "typo") spellNote = true; // друга описка: граматика правильна, бал як з підказкою
      answered = true;
      var ok = c.st === "ok" || spellNote;
      var clean = ok && !spellNote && used === 0;
      var opts = root.querySelectorAll(".opt");
      for (var i = 0; i < opts.length; i++) {
        opts[i].disabled = true;
        if (E.norm(it.o[+opts[i].getAttribute("data-k")]) === E.norm(c.right)) opts[i].classList.add("right");
      }
      if (btn && !ok) btn.classList.add("wrong");
      if ($("inp")) $("inp").disabled = true;
      if ($("chkrow")) $("chkrow").parentNode.removeChild($("chkrow"));
      if ($("almost")) $("almost").innerHTML = "";
      $("aux").parentNode.removeChild($("aux"));
      var full = fullSentence(it, c.right), h;
      if (ok) {
        h = '<div class="fb ok"><h3>' + (spellNote ? "Правильно! Лише перевір написання ✏️" : used ? "Правильно! 👍" : ["Правильно! 🎉", "Так тримати! ⭐", "Чудово! 💪", "Супер! 🚀"][Math.floor(Math.random() * 4)]) + '</h3>' +
          (spellNote ? '<div>Пишеться так: <b>' + esc(c.right) + '</b></div>' : "") + '<div>' + it.e + '</div>';
      } else {
        h = '<div class="fb bad"><h3>' + (given == null ? "Нічого страшного, розберімо 🙂" : "Майже! Розберімо 🙂") + '</h3>' +
          (c.msg ? '<div>' + c.msg + '</div>' : given != null ? '<div>Твоя відповідь: <b>' + esc(given) + '</b></div>' : "") +
          '<div style="margin-top:6px">Правильно: <b>' + esc(it.type === "order" ? full : c.right) + '</b></div>' +
          '<div class="rule"><b>Правило:</b> ' + it.e + '</div>';
      }
      h += (canSpeak && /[a-z]/i.test(full) ? '<div style="margin-top:12px"><button class="say" data-say="' + esc(full) + '">🔊 Послухати</button></div>' : "") + '</div>' +
        '<div class="row"><button class="btn full" id="next">' + cfg.nextLabel(ok) + '</button></div>' +
        '<button class="report" id="rep">🚩 Тут, здається, помилка</button>';
      $("fb").innerHTML = h; bindSay(root);
      $("rep").onclick = function () { E.reportIssue(it, given); this.textContent = "Дякую! Тато перевірить 👍"; this.disabled = true; };
      var nx = $("next");
      nx.onclick = function () { stopSay(); cfg.done({ ok: ok, clean: clean, given: given, st: c.st, it: it }); toTop(); };
      setTimeout(function () { try { nx.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) {} }, 80);
    }
    $("hintBtn").onclick = addHint;
    $("idk").onclick = function () { finish(null); };
    if (it.type === "choice") {
      var os = root.querySelectorAll(".opt");
      for (var i = 0; i < os.length; i++) (function (b) { b.onclick = function () { finish(it.o[+b.getAttribute("data-k")], b); }; })(os[i]);
    }
    if (it.type === "input") {
      var inp = $("inp"), ch = $("check");
      inp.oninput = function () { ch.disabled = !inp.value.trim(); if (typoUsed) $("almost").innerHTML = ""; };
      inp.onkeydown = function (e) { if (e.key === "Enter" && inp.value.trim()) finish(inp.value); };
      ch.onclick = function () { finish(inp.value); };
      setTimeout(function () { try { inp.focus({ preventScroll: true }); } catch (e) {} }, 50);
    }
    if (it.type === "order") {
      var pool = $("pool"), bl = $("built"), chk = $("check");
      var rd = function () {
        bl.innerHTML = built.map(function (k) { return '<button class="w" data-k="' + k + '">' + esc(it.words[k]) + '</button>'; }).join("");
        bl.classList.toggle("empty", !built.length);
        var pw = pool.querySelectorAll(".w");
        for (var i = 0; i < pw.length; i++) pw[i].classList.toggle("used", built.indexOf(+pw[i].getAttribute("data-k")) >= 0);
        chk.disabled = built.length !== it.words.length;
        var bw = bl.querySelectorAll(".w");
        for (var j = 0; j < bw.length; j++) (function (b) { b.onclick = function () { if (answered) return; var k = +b.getAttribute("data-k"); built = built.filter(function (x) { return x !== k; }); rd(); }; })(bw[j]);
      };
      var pw0 = pool.querySelectorAll(".w");
      for (var q = 0; q < pw0.length; q++) (function (b) { b.onclick = function () { if (answered) return; var k = +b.getAttribute("data-k"); if (built.indexOf(k) < 0) { built.push(k); rd(); } }; })(pw0[q]);
      chk.onclick = function () { finish(built.map(function (k) { return it.words[k]; }).join(" ")); };
      rd();
    }
  }

  /* простий екран-картка з кнопкою */
  function showCard(root, html, btn, cb) {
    root.innerHTML = '<div class="card" style="text-align:center">' + html + '<div class="row"><button class="btn full" id="go">' + btn + '</button></div></div>';
    bindSay(root);
    $("go").onclick = function () { cb(); toTop(); };
  }

  /* «Дивись, як я думаю» — кроки відкриваються по одному */
  function showWorked(root, sk, cb) {
    var w = sk.worked;
    if (!w) return cb();
    var k = 1;
    function draw() {
      root.innerHTML = '<div class="card"><span class="chip">🧠 Дивись, як я думаю</span><div class="prompt" style="font-size:20px">' + esc(w.p).replace("___", '<span class="blank"></span>') + '</div>' +
        w.steps.slice(0, k).map(function (s, i) { return '<div class="wstep' + (i === k - 1 ? ' new' : '') + '"><span class="n">' + (i + 1) + '</span>' + s + '</div>'; }).join("") +
        '<div class="row"><button class="btn full" id="go">' + (k < w.steps.length ? "Далі крок →" : "Тепер сама 💪 →") + '</button></div></div>';
      $("go").onclick = function () { if (k < w.steps.length) { k++; draw(); } else { cb(); toTop(); } };
    }
    draw();
  }

  /* ================== СЕСІЯ ==================
     o: items, mode ("practice" | "test"), title, onDone(sum)
     Practice: помилка → пояснення → розібраний приклад → серія з 3 нових
     завдань (підказок усе менше) → 2 з 3 → далі; ні → інше пояснення → ще серія;
     знову ні → позначка «розібрати з татом». Наприкінці — по 1 завданню
     на кожну навичку, де була помилка. */
  function runSession(root, o) {
    var used = {}, main = o.items, i = 0, res = [], errSkills = [], fixed = 0, flagged = [];
    main.forEach(function (it) { used[it.key] = 1; });
    var isP = o.mode === "practice";

    function rec(it, r) {
      var nl = E.record(it.skill, r.ok, r.clean);
      if (nl >= 2) toast(E.LV[nl].e + " " + E.SK[it.skill].title + " — " + E.LV[nl].t + "!");
    }
    function nextMain() {
      if (i >= main.length) return endRepeat();
      var it = main[i];
      showTask(root, it, {
        chip: (isP ? "✍️ Вправи" : "🏆 Міні-тест") + " · " + (i + 1) + " з " + main.length,
        prog: i / main.length,
        nextLabel: function (ok) { return !ok && isP ? "Розберімо разом →" : i + 1 < main.length ? "Далі →" : "Готово"; },
        done: function (r) {
          rec(it, r); res.push(r); i++;
          if (!r.ok) {
            E.addMistake(it, r.given);
            if (errSkills.indexOf(it.skill) < 0) errSkills.push(it.skill);
            if (isP) return cycle(it, nextMain);
          }
          nextMain();
        }
      });
    }
    function cycle(it, cont) {
      var sk = E.SK[it.skill];
      showWorked(root, sk, function () { series(it, 1, cont); });
    }
    function series(failed, attempt, cont) {
      var sk = E.SK[failed.skill];
      var items = E.pick(failed.skill, 3, used, failed.key);
      items.forEach(function (x) { used[x.key] = 1; });
      var k = 0, okc = 0, bad = 0, PRE = [2, 1, 0];
      function step() {
        if (okc >= 2 || bad >= 2 || k >= items.length) return finishSeries();
        var it = items[k];
        showTask(root, it, {
          chip: "💪 Закріпимо ще разок · " + (k + 1) + " з " + items.length,
          prog: k / items.length, pre: PRE[k],
          nextLabel: function () { return "Далі →"; },
          done: function (r) { rec(it, r); if (r.ok) okc++; else { bad++; E.addMistake(it, r.given); } k++; step(); }
        });
      }
      function finishSeries() {
        if (okc >= 2 || (items.length < 2 && okc >= items.length)) {
          fixed++; E.fixSkillMistakes(failed.skill); E.unflag(failed.skill);
          return showCard(root, '<div class="celebrate">💪</div><h2>' + (attempt === 1 ? "Зрозуміла!" : "Вийшло! Ось це наполегливість!") + '</h2><p class="muted">' + esc(sk.title) + '</p>', "Далі →", cont);
        }
        if (attempt === 1) {
          return showCard(root, '<div class="celebrate">💡</div><h2>Спробуймо пояснити інакше</h2><div style="text-align:left">' + (sk.alt || ('<div class="rule-box">' + esc(sk.rule) + '</div>')) + '</div>',
            "Спробую ще →", function () { series(failed, 2, cont); });
        }
        E.flag(failed.skill); flagged.push(failed.skill);
        showCard(root, '<div class="celebrate">🤝</div><h2>Розберемо разом з татом</h2><p>Ця штука поки хитра — і це нормально. Я позначила її, щоб розібрати разом. А зараз ідемо далі!</p>', "Далі →", cont);
      }
      step();
    }
    function endRepeat() {
      if (!isP || !errSkills.length) return done();
      var rep = [];
      errSkills.forEach(function (s) { var x = E.pick(s, 1, used); if (x[0]) { used[x[0].key] = 1; rep.push(x[0]); } });
      if (!rep.length) return done();
      var k = 0;
      showCard(root, '<div class="celebrate">🔁</div><h2>Наостанок — ще разок</h2><p class="muted">По одному завданню на те, де сьогодні були помилки. Перевіримо, чи закріпилось.</p>', "Поїхали →", step);
      function step() {
        if (k >= rep.length) return done();
        var it = rep[k];
        showTask(root, it, {
          chip: "🔁 Ще разок · " + (k + 1) + " з " + rep.length, prog: k / rep.length,
          nextLabel: function () { return k + 1 < rep.length ? "Далі →" : "Готово"; },
          done: function (r) { rec(it, r); if (r.ok) E.fixSkillMistakes(it.skill); else E.addMistake(it, r.given); k++; step(); }
        });
      }
    }
    function done() {
      var score = 0;
      res.forEach(function (r) { score += r.ok ? (r.clean ? 1 : 0.5) : 0; });
      o.onDone({ res: res, score: score, max: res.length, fixed: fixed, errSkills: errSkills, flagged: flagged });
    }
    nextMain();
  }

  function skillList(ids) {
    return '<div class="sklist">' + ids.map(function (id) {
      var s = E.SK[id], l = lvl(id), f = E.P().skills[id] && E.P().skills[id].flag;
      return '<div><span>' + esc(s ? s.title : id) + (f ? " 🤝" : "") + '</span><b>' + l.e + ' ' + l.t + '</b></div>';
    }).join("") + '</div>';
  }

  /* --- 3. Вправи --- */
  function practiceItems() {
    var used = {}, out = [], n = (LES.practice && LES.practice.perSkill) || 2;
    LES.skills.forEach(function (id) { E.pick(id, n, used).forEach(function (it) { used[it.key] = 1; out.push(it); }); });
    return out;
  }
  function stepPractice(root, idx) {
    runSession(root, { items: practiceItems(), mode: "practice", onDone: function (s) {
      completeStep("practice");
      var good = s.max ? s.score / s.max : 1;
      root.innerHTML = '<div class="card" style="text-align:center"><div class="celebrate">' + (good >= 0.8 ? "🎉" : "💪") + '</div><h2>Вправи зроблено!</h2>' +
        '<p class="muted">' + fmt(s.score) + ' з ' + s.max + ' балів</p>' +
        (s.fixed ? '<div class="tip">Ти виправила ' + s.fixed + ' ' + (s.fixed === 1 ? "помилку" : s.fixed < 5 ? "помилки" : "помилок") + ' — це і є навчання! 🌟</div>' : s.errSkills.length ? "" : '<p>Без жодної помилки! 🔥</p>') +
        '<h3 style="text-align:left;margin-top:14px">Мої навички</h3>' + skillList(LES.skills) +
        '<p class="muted small" style="text-align:left">🌱 Вчу → 🌿 Знаю (3 правильно поспіль без підказок) → 🌳 Засвоєно (правильно при повторенні в інший день)</p>' +
        '<div class="row"><button class="btn ghost" id="again">↺ Ще раз</button><button class="btn" id="nx" style="flex:2">До слів →</button></div></div>';
      $("again").onclick = function () { stepPractice(root, idx); toTop(); };
      $("nx").onclick = function () { nextStep(idx); };
    } });
  }

  /* --- 4. Слова --- */
  function stepWords(root, idx) {
    var W = LES.words, queue = W.map(function (_, k) { return k; }), known = 0;
    function draw() {
      if (!queue.length) {
        completeStep("words");
        root.innerHTML = '<div class="card" style="text-align:center"><div class="celebrate">🃏</div><h2>Усі ' + W.length + ' слів вивчено!</h2><p class="muted">Вони ще трапляться в тесті та в наступних уроках.</p><div class="row"><button class="btn full" id="nx">До тесту →</button></div></div>';
        $("nx").onclick = function () { nextStep(idx); };
        return;
      }
      var en = W[queue[0]][0], ua = W[queue[0]][1];
      root.innerHTML = '<div class="card"><span class="chip">Слова · вивчено ' + known + ' з ' + W.length + '</span><p class="muted" style="margin-bottom:4px">Подивись на слово, згадай переклад і переверни картку.</p>' +
        '<div class="flash" id="fl"><div class="flash-in"><div class="face front"><div class="word">' + esc(en) + '</div>' + (canSpeak ? '<button class="say" data-say="' + esc(en) + '">🔊 Послухати</button>' : "") + '<div class="sub">натисни, щоб перевернути</div></div>' +
        '<div class="face back"><div class="word" style="color:var(--pri-ink)">' + esc(ua) + '</div><div class="sub" style="color:var(--muted)">' + esc(en) + '</div></div></div></div>' +
        '<div class="row" id="btns" style="visibility:hidden"><button class="btn ghost" id="again">↺ Ще вчу</button><button class="btn okb" id="ok">✓ Знаю</button></div></div>';
      bindSay(root);
      var fl = $("fl");
      fl.onclick = function () { fl.classList.toggle("flipped"); $("btns").style.visibility = "visible"; };
      $("ok").onclick = function () { queue.shift(); known++; draw(); };
      $("again").onclick = function () { queue.push(queue.shift()); draw(); };
      if (canSpeak) setTimeout(function () { say(en); }, 150);
    }
    draw();
  }

  /* --- 5. Тест --- */
  function testItems() {
    var used = {}, out = [], plan = LES.test.plan;
    Object.keys(plan).forEach(function (id) { E.pick(id, plan[id], used).forEach(function (it) { used[it.key] = 1; out.push(it); }); });
    return shuffle(out);
  }
  function stepTest(root, idx) {
    var pass = LES.test.pass || 80;
    root.innerHTML = '<div class="card"><div class="big-emoji">🏆</div><h2>Міні-тест</h2><p>Завдання на все, що вивчили в цьому уроці. Щоразу трохи інші.</p>' +
      '<div class="tip">Набери <b>' + pass + '%</b> або більше, і урок зарахується. Підказки є, але кожна забирає пів бала.</div>' +
      '<p class="muted small">⭐ ' + pass + '%+ · ⭐⭐ 90%+ · ⭐⭐⭐ 100%</p><div class="row"><button class="btn full" id="go">Почати тест →</button></div></div>';
    $("go").onclick = function () {
      runSession(root, { items: testItems(), mode: "test", onDone: function (s) {
        var pct = Math.round(s.score / s.max * 100);
        var stars = pct >= 100 ? 3 : pct >= 90 ? 2 : pct >= pass ? 1 : 0;
        var L = E.lesson(LES.id), ok = stars > 0;
        if (ok) { completeStep("test"); if (stars > L.stars) L.stars = stars; }
        if (pct > L.best) L.best = pct;
        E.markDay(); E.save();
        var wrong = s.res.filter(function (r) { return !r.ok; });
        root.innerHTML = '<div class="card" style="text-align:center"><div class="celebrate">' + (ok ? "🏆" : "🌱") + '</div><h2>' + (ok ? "Урок пройдено!" : "Майже! Ще трішки") + '</h2>' +
          '<div class="score-big">' + pct + '%</div>' +
          (ok ? '<div class="stars" style="font-size:30px">' + starsStr(stars) + '</div>' : '<p class="muted">Потрібно ' + pass + '%. Зроби ще раз вправи — там помилки розбираються крок за кроком. У тебе вийде!</p>') +
          (wrong.length ? '<div class="tip" style="text-align:left;margin-top:14px"><b>Варто закріпити:</b><br>' + wrong.map(function (r) { return "• " + esc(r.it.p) + " → <b>" + esc(E.answersOf(r.it)[0]) + "</b>"; }).join("<br>") + '</div>' : "") +
          skillList(LES.skills) +
          '<div class="row"><button class="btn ghost full" id="copy">📋 Надіслати результат татові</button>' +
          (ok ? "" : '<button class="btn ghost" id="pr">✍️ До вправ</button><button class="btn" id="retry">↺ Ще раз</button>') +
          '<button class="btn ' + (ok ? "" : "plain") + ' full" id="home">До кабінету' + (ok ? " →" : "") + '</button></div></div>';
        $("copy").onclick = function () { copyReport(pct, stars, wrong); };
        if ($("pr")) $("pr").onclick = function () { renderLesson("practice"); toTop(); };
        if ($("retry")) $("retry").onclick = function () { stepTest(root, idx); toTop(); };
        $("home").onclick = function () { renderHome(); toTop(); };
      } });
    };
  }

  function copyReport(pct, stars, wrong) {
    var P = E.P(), d = new Date().toLocaleDateString("uk-UA");
    var lines = [P.name + " — «" + LES.title + "», " + d, "Тест: " + pct + "% " + "★".repeat(stars)];
    lines.push(wrong.length ? "Помилки:\n" + wrong.map(function (r) { return "• " + r.it.p + " → " + (r.given == null ? "не знаю" : r.given) + " (правильно: " + E.answersOf(r.it)[0] + ")"; }).join("\n") : "Без помилок!");
    lines.push("Навички:\n" + LES.skills.map(function (id) { var l = lvl(id), s = P.skills[id]; return "• " + l.e + " " + (E.SK[id] ? E.SK[id].title : id) + (s && s.flag ? " — розібрати з татом 🤝" : ""); }).join("\n"));
    var rep = P.reports.filter(function (r) { return !r.sent; });
    if (rep.length) lines.push("Позначено «тут помилка»:\n" + rep.map(function (r) { return "• " + r.key.split("|")[1] + (r.given != null ? " (відповідь: " + r.given + ")" : ""); }).join("\n"));
    lines.push("Днів поспіль: " + E.streak());
    var text = lines.join("\n");
    var ok = function () { rep.forEach(function (r) { r.sent = true; }); E.save(); toast("Скопійовано — встав у месенджер"); };
    try { navigator.clipboard.writeText(text).then(ok, function () { fallbackCopy(text, ok); }); } catch (e) { fallbackCopy(text, ok); }
  }
  function fallbackCopy(text, ok) {
    try {
      var ta = document.createElement("textarea"); ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select(); var r = document.execCommand("copy"); document.body.removeChild(ta);
      if (r) return ok();
    } catch (e) {}
    toast("Не вдалося скопіювати — зроби скріншот");
  }

  window.UI = { home: renderHome, _runSession: runSession };
  renderHome();
})();
