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
  E.noAudio = !canSpeak;
  function say(text, rate) {
    try { speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(text); u.lang = "en-GB"; u.rate = rate || 0.9; speechSynthesis.speak(u); } catch (e) {}
  }
  function stopSay() { try { speechSynthesis.cancel(); } catch (e) {} }
  function bindSay(root) {
    var bs = root.querySelectorAll("[data-say]");
    for (var i = 0; i < bs.length; i++) (function (b) {
      if (!canSpeak) { b.parentNode.removeChild(b); return; }
      b.onclick = function (e) { e.stopPropagation(); say(b.getAttribute("data-say")); };
    })(bs[i]);
  }
  var toastQ = [], toastBusy = false;
  function toast(m) { toastQ.push(m); if (!toastBusy) nextToast(); }
  function nextToast() {
    var t = $("toast"), m = toastQ.shift();
    if (!m) { toastBusy = false; return; }
    toastBusy = true; t.textContent = m; t.classList.add("show");
    setTimeout(function () { t.classList.remove("show"); setTimeout(nextToast, 250); }, 2600);
  }
  E.onBadge = function (b) { toast(b.reward ? "🎉 " + b.t + "!" : "🏅 Новий значок: " + b.e + " " + b.t); };
  function toTop() { try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch (e) { window.scrollTo(0, 0); } }
  function starsStr(n) { return "★".repeat(n) + "☆".repeat(3 - n); }
  function fmt(n) { return n % 1 === 0 ? String(n) : n.toFixed(1).replace(".", ","); }
  function dayWord(n) { var a = n % 10, b = n % 100; if (a === 1 && b !== 11) return "день"; if (a >= 2 && a <= 4 && (b < 12 || b > 14)) return "дні"; return "днів"; }
  function tasksW(n) { var a = n % 10, b = n % 100; return a >= 1 && a <= 4 && (b < 11 || b > 14) ? "завдання" : "завдань"; }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function lvl(id) { return E.LV[E.level(id)]; }

  var cache = {};
  function getJSON(path) {
    if (cache[path]) return Promise.resolve(cache[path]);
    var url = path.indexOf("content/") === 0 ? path : BASE + path;
    return fetch(url + "?v=" + VER).then(function (r) {
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

  var THEMES = [
    { id: "", t: "Класика", e: "💜", need: 0 },
    { id: "ocean", t: "Океан", e: "🌊", need: 20 },
    { id: "forest", t: "Ліс", e: "🌿", need: 50 },
    { id: "sunset", t: "Захід сонця", e: "🌅", need: 100 },
    { id: "berry", t: "Ягідна", e: "🫐", need: 200 }
  ];
  function applyTheme() {
    var id = (E.cur() && E.P().theme) || "";
    document.body.className = id ? "th-" + id : "";
  }
  function freezeChip() {
    var si = E.streakInfo();
    return '<span class="stat" title="Серія днів">🔥 ' + si.n + ' ' + dayWord(si.n) + ' поспіль</span>' +
      '<span class="stat" title="Один пропущений день на тиждень не обнуляє серію">' + (si.freezeUsedThisWeek ? "❄️ використано" : "❄️ заморозка є") + '</span>';
  }
  /* картка тижневої нагороди */
  function rewardCard() {
    var r = E.reward(), w = E.starsWeek();
    if (!r.text) return '<div class="card reward"><h3>🎁 Нагорода тижня</h3><p class="muted" style="margin:0">Домовтеся з татом, яку нагороду ти отримаєш за зірки тижня ⭐ — і тато впише її сюди.</p>' +
      '<div class="row"><button class="btn ghost full" data-act="dad">⚙️ Тато: налаштувати</button></div></div>';
    var pct = Math.min(100, Math.round(w / r.goal * 100)), got = w >= r.goal;
    return '<div class="card reward"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px"><h3 style="margin:0">🎁 ' + esc(r.text) + '</h3><button class="btn plain" data-act="dad" title="Для тата">⚙️</button></div>' +
      '<div class="prog" style="margin:10px 0 6px"><i style="width:' + pct + '%;' + (got ? "background:var(--ok)" : "background:var(--sun)") + '"></i></div>' +
      '<div style="font-weight:800">' + (got ? "🎉 Заслужила! Покажи татові: " + w + " ⭐ цього тижня" : "⭐ " + w + " з " + r.goal + " · ще " + (r.goal - w) + " до нагороди") + '</div>' +
      '<p class="muted small" style="margin:4px 0 0">Зірки тижня рахуються з понеділка. ⭐ дають: заняття на сьогодні +5, виправлена помилка +1, нова навичка 🌿 +2 / 🌳 +3, зірка тесту +3.</p></div>';
  }
  function bindActs(back) {
    var bs = $app.querySelectorAll("[data-act]");
    for (var i = 0; i < bs.length; i++) (function (b) {
      b.onclick = function () { var a = b.getAttribute("data-act"); if (a === "dad") renderDad(back); if (a === "badges") renderBadges(back); toTop(); };
    })(bs[i]);
  }
  function badgesRow() {
    var got = E.P().badges || {}, n = 0; for (var k in got) n++;
    var last = E.BADGES.filter(function (b) { return got[b.id]; }).slice(-5).map(function (b) { return b.e; }).join(" ");
    return '<button class="lesson" data-act="badges"><span class="ic">🏅</span><span><div class="lt">Мої значки та оформлення</div><div class="ls">' + n + ' з ' + E.BADGES.length + (last ? " · " + last : " · перший уже близько!") + '</div></span></button>';
  }

  /* ================== ДЛЯ ТАТА ================== */
  function renderDad(back) {
    var r = E.reward();
    function form() {
      $app.innerHTML = '<div class="topbar"><button class="back" id="bk">← Назад</button><span class="muted small" style="font-weight:700">⚙️ Для тата</span></div>' +
        '<div class="card"><h2>🎁 Нагорода тижня — ' + esc(E.P().name) + '</h2>' +
        '<label class="lbl">Що отримає за тиждень</label><input id="rt" type="text" placeholder="напр. похід у кіно, 200 грн, піца" value="' + esc(r.text) + '">' +
        '<label class="lbl">Скільки ⭐ треба за тиждень</label><input id="rg" type="text" inputmode="numeric" value="' + r.goal + '">' +
        '<p class="muted small">Орієнтир: повне заняття за день дає приблизно 6–10 ⭐. 30 ⭐ — це 4–5 днів занять.</p>' +
        '<label class="lbl">PIN тата (4 цифри, щоб діти не змінили ціль)</label><input id="rp" type="text" inputmode="numeric" maxlength="4" placeholder="' + (r.pin ? "лишити як є" : "придумай PIN") + '">' +
        '<div class="row"><button class="btn full" id="sv">Зберегти</button></div></div>';
      $("bk").onclick = function () { back(); toTop(); };
      $("sv").onclick = function () {
        var t = $("rt").value.trim(), g = parseInt($("rg").value, 10), pin = $("rp").value.trim();
        if (!(g > 0)) { toast("Вкажи кількість зірок числом"); return; }
        if (!r.pin && !/^\d{4}$/.test(pin)) { toast("Придумай PIN з 4 цифр"); return; }
        if (pin && !/^\d{4}$/.test(pin)) { toast("PIN — 4 цифри"); return; }
        r.text = t; r.goal = g; if (pin) r.pin = pin; E.save(); E.checkBadges();
        toast("Збережено 👍"); back(); toTop();
      };
    }
    if (!r.pin) return form();
    $app.innerHTML = '<div class="topbar"><button class="back" id="bk">← Назад</button></div><div class="card"><h2>🔒 Для тата</h2><label class="lbl">PIN</label>' +
      '<input id="pn" type="password" inputmode="numeric" maxlength="4" autocomplete="off"><div class="row"><button class="btn full" id="ok">Увійти</button></div></div>';
    $("bk").onclick = function () { back(); toTop(); };
    var go = function () { if ($("pn").value === r.pin) form(); else { toast("PIN не підходить"); $("pn").value = ""; } };
    $("ok").onclick = go; $("pn").onkeydown = function (e) { if (e.key === "Enter") go(); };
  }

  /* ================== ЗНАЧКИ І ОФОРМЛЕННЯ ================== */
  function renderBadges(back) {
    var P = E.P(), got = P.badges || {}, tot = E.starsTotal();
    var html = '<div class="topbar"><button class="back" id="bk">← Назад</button><span class="muted small" style="font-weight:700">🏅 Значки</span></div>' +
      '<div class="card"><h1>Мої значки</h1><p class="muted">Значки — за старанність, а не лише за ідеальність. Усього зірок: ⭐ ' + tot + '</p><div class="badges">' +
      E.BADGES.map(function (b) {
        return '<div class="badge ' + (got[b.id] ? "got" : "") + '"><div class="be">' + (got[b.id] ? b.e : "🔒") + '</div><div class="bt">' + esc(b.t) + '</div><div class="bs">' + esc(got[b.id] ? got[b.id].split("-").reverse().join(".") : b.s) + '</div></div>';
      }).join("") + '</div></div>' +
      '<div class="card"><h2>🎨 Оформлення</h2><p class="muted small">Нові кольори відкриваються за зібрані зірки.</p><div class="themes">' +
      THEMES.map(function (t) {
        var open = tot >= t.need, on = (P.theme || "") === t.id;
        return '<button class="theme th-' + (t.id || "classic") + (on ? " on" : "") + '" data-th="' + t.id + '"' + (open ? "" : " disabled") + '><span class="sw"></span>' + t.e + ' ' + esc(t.t) + '<span class="muted small">' + (open ? (on ? " ✓" : "") : " 🔒 " + t.need + " ⭐") + '</span></button>';
      }).join("") + '</div></div>';
    $app.innerHTML = html;
    $("bk").onclick = function () { back(); toTop(); };
    var ts = $app.querySelectorAll(".theme");
    for (var i = 0; i < ts.length; i++) (function (b) { b.onclick = function () { P.theme = b.getAttribute("data-th"); E.save(); applyTheme(); renderBadges(back); }; })(ts[i]);
  }

  var PATH = null, SUBJ = null, ALL = false;
  function withSubjects(cb) {
    if (SUBJ) return cb();
    loadingView();
    getJSON("content/subjects.json").then(function (j) { SUBJ = j; cb(); }, function () { failView(function () { withSubjects(cb); }); });
  }
  function child() {
    var id = E.cur();
    for (var i = 0; SUBJ && i < SUBJ.children.length; i++) if (SUBJ.children[i].id === id) return SUBJ.children[i];
    return null;
  }
  function goalBar(n, goal) {
    var pct = Math.min(100, Math.round(n / goal * 100));
    return '<div class="today"><div class="today-t">' + (n >= goal ? "✅ Сьогодні норму виконано: " + n + " " + tasksW(n) : "Сьогодні: " + n + " з " + goal + " " + tasksW(goal)) + '</div>' +
      '<div class="prog" style="margin:6px 0 0"><i style="width:' + pct + '%;' + (n >= goal ? "background:var(--ok)" : "") + '"></i></div></div>';
  }

  /* ================== ХТО ВЧИТЬСЯ ================== */
  function renderWho() {
    document.body.className = "";
    withSubjects(function () {
      $app.innerHTML = '<div class="card" style="text-align:center"><div class="big-emoji">🎒</div><h1>Хто сьогодні вчиться?</h1>' +
        '<div class="who">' + SUBJ.children.map(function (c) {
          var p = E.store().profiles[c.id], n = p ? E.todayCount(null, p) : 0, st = p ? E.streak(p) : 0;
          return '<button class="who-b" data-id="' + c.id + '"><span class="who-e">' + c.emoji + '</span><span class="who-n">' + esc(c.name) + '</span>' +
            '<span class="who-s">' + c.grade + ' клас' + (st ? ' · 🔥 ' + st : '') + (n ? ' · сьогодні ' + n : '') + '</span></button>';
        }).join("") + '</div></div>';
      var bs = $app.querySelectorAll(".who-b");
      for (var i = 0; i < bs.length; i++) (function (b) {
        b.onclick = function () {
          var c = null; SUBJ.children.forEach(function (x) { if (x.id === b.getAttribute("data-id")) c = x; });
          E.setCur(c.id, c.name); applyTheme(); renderSubjects(); toTop();
        };
      })(bs[i]);
    });
  }

  /* ================== МОЇ ПРЕДМЕТИ ================== */
  function renderSubjects() {
    withSubjects(function () {
      var c = child();
      if (!c) return renderWho();
      var P = E.P(), goal = SUBJ.dailyGoal, st = E.streak();
      var html = '<div class="topbar"><button class="back" id="who">⇄ Змінити</button><span class="muted small" style="font-weight:700">' + c.grade + ' клас</span></div>' +
        '<div class="card"><h1>Привіт, ' + esc(c.name) + '! ' + c.emoji + '</h1>' +
        '<div class="stats">' + freezeChip() + '<span class="stat">⭐ ' + E.starsWeek() + ' за тиждень</span></div>' +
        (hasOpen(c) ? goalBar(E.todayCount(null), goal) : '<div class="today"><div class="today-t">🚀 Твої заняття скоро з\'являться! Тато вже готує.</div></div>') +
        '</div>' + (hasOpen(c) ? rewardCard() : "") + '<div class="card"><h2>Мої предмети</h2>';
      c.subjects.forEach(function (s) {
        var n = E.todayCount(s.id);
        html += '<button class="lesson ' + (s.open ? "open" : "lock") + '" data-s="' + s.id + '"><span class="ic">' + s.ic + '</span><span style="flex:1">' +
          '<div class="lt">' + esc(s.title) + '</div><div class="ls">' +
          (s.open ? (n >= goal ? "✅ Сьогодні зроблено · " + n + " " + tasksW(n) : n ? "Сьогодні: " + n + " з " + goal + " " + tasksW(goal) : "Сьогодні ще не займались") : "🔒 Скоро з'явиться") +
          '</div></span></button>';
      });
      html += '</div>' + (hasOpen(c) ? '<div class="card">' + badgesRow() + '</div>' : "");
      $app.innerHTML = html;
      bindActs(renderSubjects);
      $("who").onclick = function () { renderWho(); toTop(); };
      var bs = $app.querySelectorAll(".lesson.open");
      for (var i = 0; i < bs.length; i++) (function (b) {
        b.onclick = function () { if (b.getAttribute("data-s") === "english") { renderHome(); toTop(); } };
      })(bs[i]);
    });
  }
  function hasOpen(c, id) { for (var i = 0; i < c.subjects.length; i++) if (c.subjects[i].open && (!id || c.subjects[i].id === id)) return true; return false; }
  function totalStars(P) { var n = 0; Object.keys(P.lessons).forEach(function (k) { n += P.lessons[k].stars || 0; }); return n; }

  /* ================== КАБІНЕТ АНГЛІЙСЬКОЇ ================== */
  function renderHome() {
    if (!SUBJ || !child()) return withSubjects(function () { if (child()) renderHome(); else renderWho(); });
    if (!hasOpen(child(), "english")) return renderSubjects();
    var P = E.P();
    if (!ALL) return loadAll(function () { ALL = true; renderHome(); });
    var st = E.streak(), doneCount = 0, allLessons = 0, num = 0;
    Object.keys(P.lessons).forEach(function (k) { if (P.lessons[k].stars > 0) doneCount++; });
    PATH.stages.forEach(function (s) { allLessons += s.lessons.length; });
    var T = lessonTarget(), next = T && T.next ? T : null, cont = T ? T.l : null;
    var nMist = E.openMistakes().length, plan = E.plan(), dayDone = plan.warm && plan.lesson && plan.mist;

    var html = '<div class="topbar"><button class="back" id="subj">← Мої предмети</button><span class="muted small" style="font-weight:700">🇬🇧 Англійська</span></div>' +
      '<div class="card"><div class="hello"><div><h1>Привіт, ' + esc(P.name) + '! 👋</h1>' +
      '<p class="muted" style="margin:0">' + (cont ? (next ? "Зараз: урок " + next.n + " «" + esc(cont.title) + "»" : "Усі готові уроки пройдено! Нові вже готуються.") : "") + '</p></div></div>' +
      '<div class="stats">' + freezeChip() + '<span class="stat">⭐ ' + E.starsWeek() + ' за тиждень</span>' +
      '<span class="stat">📚 ' + doneCount + ' з ' + allLessons + ' уроків</span></div>' +
      goalBar(E.todayCount("english"), SUBJ.dailyGoal) +
      '<div class="row"><button class="btn full ' + (dayDone ? "okb" : "") + '" id="daily">' + (dayDone ? "✅ Заняття на сьогодні виконано" : "▶️ Заняття на сьогодні · ~15 хв") + '</button></div>' +
      (cont ? '<div class="row" style="margin-top:8px"><button class="btn ghost full" id="cont">' + T.label + '</button></div>' : "") + '</div>' +
      (P.diag ? "" : '<div class="card"><h2>🧭 Спершу — перевірка рівня</h2><p class="muted" style="margin:0 0 4px">15–20 хвилин. Це не оцінка: тест покаже, що вже знаєш, а що підтягнути, і план підлаштується під тебе.</p>@DIAG@</div>');

    html += rewardCard();
    html += '<div class="card" style="padding:12px 16px">' + badgesRow() + '<button class="lesson" id="mist"><span class="ic">📝</span><span><div class="lt">Мої помилки</div><div class="ls">' +
      (nMist ? nMist + " " + (nMist === 1 ? "речення чекає" : "речень чекають") + " на виправлення" : "Усі виправлено 🎉") + '</div></span></button></div>';
    num = 0;
    var prevOk = true, prevN = 0, early = {};
    PATH.stages.forEach(function (stage, si) {
      var anyOpen = stage.lessons.some(function (l) { return !!l.file; });
      html += '<div class="card stage ' + (anyOpen ? "" : "locked") + '"><div class="stage-h"><div class="stage-n">' + stage.n + '</div>' +
        '<div><div class="stage-t">' + esc(stage.title) + '</div><div class="stage-s">' + esc(stage.sub) + '</div></div></div>';
      stage.lessons.forEach(function (ls) {
        num++;
        var cls = "lock", sub = "🔒 Відкриється після попереднього уроку", ic = "🔒";
        if (ls.file) {
          var L = E.lesson(ls.id), nDone = 0;
          for (var k in L.steps) if (L.steps[k]) nDone++;
          var lv = lessonLevels(ls.id);
          var unlocked = prevOk || L.early || L.stars > 0 || nDone > 0;
          if (L.stars > 0) { cls = "done"; ic = "✅"; sub = '<span class="stars">' + starsStr(L.stars) + '</span> · можна повторити'; }
          else if (unlocked) { cls = "open"; ic = ls.ic; sub = nDone ? "Пройдено " + nDone + " з 5 кроків" : "Почати · ~20 хв"; }
          else { cls = "lock soon"; ic = "🔒"; sub = "Відкриється після тесту уроку " + prevN + " · можна раніше"; early[ls.file] = { l: ls, after: prevN }; }
          if (lv && unlocked) sub += '<div class="lvls" title="Навички уроку">' + lv + '</div>';
          prevOk = L.stars > 0; prevN = num;
        } else if (next && next.n + 1 === num) { ic = "⏳"; sub = "Готується — скоро з'явиться"; }
        html += '<button class="lesson ' + cls + '" data-file="' + (ls.file || "") + '"><span class="ic">' + ic + '</span>' +
          '<span><div class="lt">' + num + '. ' + esc(ls.title) + '</div><div class="ls">' + sub + '</div></span></button>';
      });
      html += '</div>';
    });
    var dg = P.diag;
    var diagHtml = '<a class="lesson' + (dg ? "" : " open") + '" href="test.html" style="text-decoration:none"><span class="ic">🧭</span><span><div class="lt">Перевірка рівня</div><div class="ls">' +
      (dg ? "Пройдено " + dg.date + ": " + dg.pct + "% · можна пройти ще раз" : "Тест на 29 завдань: що вже знаю, а що підтягнути") + '</div></span></a>';
    html = dg ? html + diagHtml : html.replace("@DIAG@", diagHtml);
    $app.innerHTML = html;
    $("subj").onclick = function () { renderSubjects(); toTop(); };
    bindActs(renderHome);
    if ($("cont")) $("cont").onclick = function () { DAILY = false; openLesson(cont.file, T.step); };
    $("daily").onclick = function () { renderDaily(); toTop(); };
    if ($("mist")) $("mist").onclick = function () { renderMistakes(); toTop(); };
    var bs = $app.querySelectorAll(".lesson[data-file]");
    for (var j = 0; j < bs.length; j++) (function (b) {
      var f = b.getAttribute("data-file");
      if (f) b.onclick = function () { if (early[f]) askEarly(early[f]); else openLesson(f); };
    })(bs[j]);
  }
  /* рядок значків рівнів навичок уроку */
  function lessonLevels(id) {
    var L = cache["lessons/" + id + ".json"];
    if (!L || !L.skills) return "";
    var any = L.skills.some(function (s) { return E.level(s) > 0; });
    return any ? L.skills.map(function (s) { return '<span>' + lvl(s).e + '</span>'; }).join("") : "";
  }
  /* «Вільний режим»: відкрити урок раніше, якщо в школі вже проходять цю тему */
  function askEarly(x) {
    $app.innerHTML = '<div class="card" style="text-align:center"><div class="celebrate">🔓</div><h2>Відкрити урок раніше?</h2>' +
      '<p>«' + esc(x.l.title) + '»</p><p class="muted">Зазвичай він відкривається після тесту уроку ' + x.after + '. Але якщо в школі вже проходите цю тему чи скоро контрольна — відкривай сміливо.</p>' +
      '<div class="row"><button class="btn full" id="yes">Так, відкрити</button><button class="btn plain full" id="no">Ні, по черзі</button></div></div>';
    $("yes").onclick = function () { var L = E.lesson(x.l.id); L.early = true; E.save(); openLesson(x.l.file); };
    $("no").onclick = function () { renderHome(); toTop(); };
  }

  /* наступний крок навчання: перший непройдений урок і його перший незроблений крок */
  function lessonTarget() {
    if (!PATH) return null;
    var next = null, last = null, num = 0;
    PATH.stages.forEach(function (s) { s.lessons.forEach(function (l) { num++; if (l.file) { last = { l: l, n: num }; if (!next && !(E.lesson(l.id).stars > 0)) next = { l: l, n: num }; } }); });
    var t = next || last;
    if (!t) return null;
    var cs = E.lesson(t.l.id).steps, sd = null;
    for (var i = 0; i < STEPS.length; i++) if (!cs[STEPS[i].id]) { sd = STEPS[i]; break; }
    if (!next) sd = STEPS[2]; // усе пройдено — ще вправи
    else if (!sd) sd = STEPS[4]; // кроки є, а тест не зданий
    t.step = sd.id; t.stepT = sd.t; t.next = !!next;
    t.label = next ? (sd.id === "explain" && !Object.keys(cs).length ? "Почати урок " + t.n : "Продовжити урок " + t.n + ": " + sd.t.toLowerCase()) : "🔁 Повторити урок " + t.n;
    return t;
  }
  function loadAll(cb) {
    var go = function () {
      var files = []; PATH.stages.forEach(function (s) { s.lessons.forEach(function (l) { if (l.file) files.push(l.file); }); });
      Promise.all(files.map(loadLesson)).then(cb, function () { failView(function () { loadAll(cb); }); });
    };
    if (PATH) return go();
    loadingView();
    getJSON("path.json").then(function (j) { PATH = j; go(); }, function () { failView(function () { loadAll(cb); }); });
  }

  /* ================== ЗАНЯТТЯ НА СЬОГОДНІ ==================
     Розминка (повторення вже пройденого) → крок уроку → мої помилки. */
  var DAILY = false;
  function renderDaily() {
    DAILY = true;
    loadAll(function () {
      var plan = E.plan(), T = lessonTarget();
      var warm = E.warmItems(5), mist = E.openMistakes();
      if (!warm.length) plan.warm = true;   // ще нічого повторювати
      if (!mist.length) plan.mist = true;   // помилок немає
      E.save();
      var parts = [
        { id: "warm", ic: "🔥", t: "Розминка", s: plan.warm && warm.length ? "Зроблено" : warm.length ? warm.length + " " + tasksW(warm.length) + " на вже пройдене, вперемішку" : "Сьогодні не потрібна: ще нема що повторювати", done: plan.warm },
        { id: "lesson", ic: "📘", t: plan.lesson || !T ? "Крок уроку" : "Урок " + T.n + ": " + T.stepT.toLowerCase(), s: plan.lesson ? "Зроблено" : T ? T.l.title : "", done: plan.lesson },
        { id: "mist", ic: "📝", t: "Мої помилки", s: mist.length ? Math.min(mist.length, 5) + (Math.min(mist.length, 5) === 1 ? " речення" : Math.min(mist.length, 5) < 5 ? " речення" : " речень") + " виправити" : (E.P().mistakes.length ? "Усі помилки виправлено 🎉" : "Помилок поки немає 🙂"), done: plan.mist }
      ];
      var cur = null; parts.forEach(function (x) { if (!cur && !x.done) cur = x; });
      var allDone = !cur;
      if (allDone && !plan.paid) { plan.paid = true; E.save(); E.cnt("daysDone"); E.addStars(5, "day"); toast("⭐ +5 за заняття на сьогодні!"); }
      var n = E.todayCount("english");
      var html = '<div class="topbar"><button class="back" id="back">← Кабінет</button><span class="muted small" style="font-weight:700">🇬🇧 Заняття на сьогодні</span></div>' +
        '<div class="card' + (allDone ? '" style="text-align:center"' : '"') + '>' +
        (allDone ? '<div class="celebrate">🎉</div><h1>Заняття на сьогодні виконано!</h1><p class="muted">Ти молодець. Завтра буде нова розминка — серія днів росте 🔥</p>'
                 : '<h1>Заняття на сьогодні</h1><p class="muted">Три коротких частини, приблизно 15 хвилин.</p>') +
        goalBar(n, SUBJ.dailyGoal) + '</div><div class="card">';
      parts.forEach(function (x, i) {
        html += '<button class="lesson ' + (x.done ? "done" : x === cur ? "open" : "") + '" data-p="' + x.id + '"><span class="ic">' + (x.done ? "✅" : x.ic) + '</span>' +
          '<span><div class="lt">' + (i + 1) + '. ' + esc(x.t) + '</div><div class="ls">' + esc(x.s) + '</div></span></button>';
      });
      html += (allDone ? '<div class="row"><button class="btn ghost full" id="more">💪 Хочу ще: наступний крок уроку</button><button class="btn full" id="home">До кабінету</button></div>'
                       : '<div class="row"><button class="btn full" id="go2">' + (cur.id === "warm" ? "Почати розминку →" : cur.id === "lesson" ? "До уроку →" : "Виправити помилки →") + '</button></div>') + '</div>';
      $app.innerHTML = html;
      var start = function (id) {
        if (id === "warm") return runPart("warm", warm.length ? warm : E.warmItems(5));
        if (id === "mist") return runPart("mist", E.openMistakes().slice(0, 5).map(function (m) { return E.ITEM[m.key]; }));
        if (T) { LES = null; openLesson(T.l.file, T.step); }
      };
      $("back").onclick = function () { DAILY = false; renderHome(); toTop(); };
      if ($("go2")) $("go2").onclick = function () { start(cur.id); };
      if ($("more")) $("more").onclick = function () { start("lesson"); };
      if ($("home")) $("home").onclick = function () { DAILY = false; renderHome(); toTop(); };
      var bs = $app.querySelectorAll(".lesson[data-p]");
      for (var i = 0; i < bs.length; i++) (function (b) { b.onclick = function () { start(b.getAttribute("data-p")); }; })(bs[i]);
    });
  }
  function runPart(kind, items) {
    var plan = E.plan();
    if (!items.length) { plan[kind] = true; E.save(); return renderDaily(); }
    $app.innerHTML = '<div class="topbar"><button class="back" id="back">← Заняття</button></div><div id="stage"></div>';
    $("back").onclick = function () { stopSay(); renderDaily(); toTop(); };
    runSession($("stage"), { items: items, mode: kind, onDone: function (s) {
      plan[kind] = true; E.save();
      var root = $("stage");
      showCard(root, '<div class="celebrate">' + (kind === "warm" ? "🔥" : "📝") + '</div><h2>' + (kind === "warm" ? "Розминку зроблено!" : "Помилки опрацьовано!") + '</h2>' +
        '<p class="muted">' + fmt(s.score) + ' з ' + s.max + (kind === "mist" && s.max - s.res.filter(function (r) { return !r.ok; }).length ? " · виправлено " + s.res.filter(function (r) { return r.ok; }).length : "") + '</p>',
        "Далі →", function () { renderDaily(); });
    } });
    toTop();
  }

  /* ================== МОЇ ПОМИЛКИ ================== */
  function renderMistakes() {
    loadAll(function () {
      var ms = E.openMistakes(), fixedN = 0, seenK = {};
      E.P().mistakes.forEach(function (m) { if (m.fixed && !seenK[m.key]) { seenK[m.key] = 1; fixedN++; } });
      var html = '<div class="topbar"><button class="back" id="back">← Кабінет</button><span class="muted small" style="font-weight:700">📝 Мої помилки</span></div>' +
        '<div class="card"><h1>Мої помилки</h1><p class="muted">Помилка — не біда, а підказка, що закріпити. Правильна відповідь прибирає речення зі списку.</p>' +
        (fixedN ? '<div class="tip">Уже виправлено: <b>' + fixedN + '</b> 💪</div>' : "") +
        (ms.length ? '<div class="row"><button class="btn full" id="go2">Виправити ' + Math.min(ms.length, 5) + ' →</button></div>' : '<p style="font-weight:800">Невиправлених помилок немає 🎉</p>') + '</div>';
      if (ms.length) {
        html += '<div class="card"><div class="sklist">' + ms.map(function (m) {
          var it = E.ITEM[m.key], sk = E.SK[it.skill];
          return '<div style="display:block"><div style="font-weight:700">' + (it.type === "dict" ? "🎧 Диктант" : esc(it.p)) + '</div>' +
            '<div class="muted small">' + (m.given == null ? "«не знаю»" : "твоя відповідь: " + esc(m.given)) + ' · ' + esc(sk ? sk.title : "") + '</div></div>';
        }).join("") + '</div></div>';
      }
      $app.innerHTML = html;
      $("back").onclick = function () { renderHome(); toTop(); };
      if ($("go2")) $("go2").onclick = function () {
        DAILY = false;
        var items = ms.slice(0, 5).map(function (m) { return E.ITEM[m.key]; });
        $app.innerHTML = '<div class="topbar"><button class="back" id="back">← Мої помилки</button></div><div id="stage"></div>';
        $("back").onclick = function () { renderMistakes(); toTop(); };
        runSession($("stage"), { items: items, mode: "mist", onDone: function (s) {
          showCard($("stage"), '<div class="celebrate">📝</div><h2>Готово!</h2><p class="muted">Виправлено ' + s.res.filter(function (r) { return r.ok; }).length + ' з ' + s.max + '</p>', "До списку →", function () { renderMistakes(); });
        } });
        toTop();
      };
    });
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
    if (DAILY) $("back").textContent = "← Заняття";
    $("back").onclick = function () { stopSay(); if (DAILY) renderDaily(); else renderHome(); toTop(); };
    var sb = $app.querySelectorAll(".step");
    for (var j = 0; j < sb.length; j++) (function (b) { b.onclick = function () { stopSay(); renderLesson(b.getAttribute("data-s")); toTop(); }; })(sb[j]);
    var stage = $("stage");
    ({ explain: stepExplain, examples: stepExamples, practice: stepPractice, words: stepWords, test: stepTest })[stepId](stage, idx);
  }
  // у «Занятті» крок уроку зараховується після вправ, слів або тесту (правило й приклади — це розгін до вправ)
  var BIG = { practice: 1, words: 1, test: 1 };
  function completeStep(id) { E.lesson(LES.id).steps[id] = true; if (DAILY && BIG[id]) E.plan().lesson = true; E.markDay(); E.save(); }
  function nextStep(idx) {
    if (DAILY && BIG[STEPS[idx].id]) { renderDaily(); toTop(); return; }
    var n = STEPS[idx + 1]; if (n) renderLesson(n.id); else renderHome(); toTop();
  }

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
    if (it.type === "order") {
      // написання беремо з карток слів (Saturdays, I), а не з рядка відповіді
      var pool = it.words.slice();
      var ws = right.split(" ").map(function (w) {
        for (var i = 0; i < pool.length; i++) if (E.norm(pool[i]) === E.norm(w)) return pool.splice(i, 1)[0];
        return w;
      });
      return cap(ws.join(" ")) + (it.end || ".");
    }
    if (it.type === "fix" || it.type === "dict") return right;
    if (it.p.indexOf("___") >= 0) return it.p.replace("___", right).replace(/\s*\(.*?\)\s*$/, "");
    return right;
  }
  function showTask(root, it, cfg) {
    var hints = hintsOf(it), used = 0, answered = false, typoUsed = false, built = [];
    var pre = Math.min(cfg.pre || 0, hints.length);
    var sk = E.SK[it.skill];
    E.markSeen(it);
    window.UI_CUR = it; // для автоматичних перевірок
    var body = "";
    if (it.type === "choice") body = '<div class="opts">' + it.o.map(function (o, k) { return '<button class="opt" data-k="' + k + '">' + esc(o) + '</button>'; }).join("") + '</div>';
    if (it.type === "dict") body = '<div class="row" style="margin-top:0"><button class="btn ghost" id="play">🔊 Послухати</button><button class="btn ghost" id="slow">🐢 Повільно</button></div><div style="height:12px"></div>';
    if (it.type === "fix") body = '<div class="pool fixw">' + it.p.split(" ").map(function (w, k) { return '<button class="w" data-k="' + k + '">' + esc(w) + '</button>'; }).join("") + '</div>';
    if (it.type === "input" || it.type === "dict") body += '<input id="inp" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Твоя відповідь"><div id="almost"></div><div class="row" id="chkrow"><button class="btn full" id="check" disabled>Перевірити</button></div>';
    if (it.type === "order") body = '<div class="built empty" id="built"></div><div class="pool" id="pool">' + it.words.map(function (w, k) { return '<button class="w" data-k="' + k + '">' + esc(w) + '</button>'; }).join("") + '</div><div class="row" id="chkrow"><button class="btn full" id="check" disabled>Перевірити</button></div>';
    root.innerHTML = '<div class="card"><span class="chip">' + cfg.chip + '</span>' +
      (sk ? '<span class="skillTag">' + lvl(it.skill).e + ' ' + esc(sk.title) + '</span>' : "") +
      '<div class="prog"><i style="width:' + Math.round((cfg.prog || 0) * 100) + '%"></i></div>' +
      (it.task ? '<div class="task">' + it.task + ':</div>' : "") +
      (it.type === "dict" ? '<div class="prompt">🎧 Що ти чуєш?</div>' : it.type === "fix" ? "" : '<div class="prompt">' + esc(it.p).replace("___", '<span class="blank"></span>') + '</div>') + body +
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
      if (c.st === "typo") spellNote = true;
      if (it.type === "fix" && given != null) {
        var fw = root.querySelectorAll(".fixw .w");
        for (var f = 0; f < fw.length; f++) { fw[f].disabled = true; if (f === it.bad) fw[f].classList.add("bad"); }
        if (btn && String(given) !== String(it.bad)) btn.classList.add("miss");
        given = it.p.split(" ")[+given];
      } // друга описка: граматика правильна, бал як з підказкою
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
          (spellNote ? '<div>Пишеться так: <b>' + esc(c.right) + '</b></div>' : "") +
          (it.type === "fix" ? '<div>Правильно: <b>' + esc(c.right) + '</b></div>' : "") + '<div>' + it.e + '</div>';
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
    if (it.type === "fix") {
      var fws = root.querySelectorAll(".fixw .w");
      for (var fi = 0; fi < fws.length; fi++) (function (b) { b.onclick = function () { finish(b.getAttribute("data-k"), b); }; })(fws[fi]);
    }
    if (it.type === "dict") {
      $("play").onclick = function () { say(it.a[0]); };
      $("slow").onclick = function () { say(it.a[0], 0.55); };
      say(it.a[0]);
    }
    if (it.type === "input" || it.type === "dict") {
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
    var CHIP = { practice: "✍️ Вправи", test: "🏆 Міні-тест", warm: "🔥 Розминка", mist: "📝 Мої помилки" };

    function rec(it, r) {
      E.tick("english");
      var nl = E.record(it.skill, r.ok, r.clean);
      if (nl >= 2) toast(E.LV[nl].e + " " + E.SK[it.skill].title + " — " + E.LV[nl].t + "!");
    }
    function nextMain() {
      if (i >= main.length) return endRepeat();
      var it = main[i];
      showTask(root, it, {
        chip: CHIP[o.mode] + " · " + (i + 1) + " з " + main.length,
        prog: i / main.length,
        nextLabel: function (ok) { return !ok && isP ? "Розберімо разом →" : i + 1 < main.length ? "Далі →" : "Готово"; },
        done: function (r) {
          rec(it, r); res.push(r); i++;
          if (r.ok) E.fixMistake(it.key);
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
          if (attempt === 2) E.cnt("brave");
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
        if (ok) { completeStep("test"); if (stars > L.stars) { var gain = 3 * (stars - L.stars); L.stars = stars; E.save(); E.addStars(gain, "lesson"); toast("⭐ +" + gain + " за тест!"); } }
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
        if (DAILY) $("home").textContent = "До заняття →";
        $("home").onclick = function () { if (DAILY) renderDaily(); else renderHome(); toTop(); };
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
  withSubjects(function () {
    applyTheme();
    var h = (location.hash || "").replace("#", "");
    if (h && child()) { if (h === "english") renderHome(); else renderSubjects(); }
    else renderWho();
  });
})();
