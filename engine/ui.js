/* =====================================================================
   ui.js — екрани: кабінет, кроки уроку, сесія завдань з циклом
   «помилка → розібраний приклад → 2–3 схожі завдання».
   Зміст береться з content/<предмет>/ (JSON), рушій — з engine.js.
   ===================================================================== */
(function () {
  "use strict";
  var VER = window.APP_VER || "1";
  /* Предмети: кожен має свою теку змісту і свої можливості */
  var SUBS = {
    english: { id: "english", base: "content/english/", title: "Англійська", ic: "🇬🇧", words: true, diag: true },
    math2: { id: "math2", base: "content/math2/", title: "Математика", ic: "🔢", words: false, diag: false, kid: true },
    algebra: { id: "algebra", base: "content/algebra/", title: "Алгебра", ic: "🔢", words: false, diag: "inline", check: true, strict: true }, // strict: усе по черзі — без «відкрити раніше» і без ⏭️ пропуску за перевіркою рівня
    geometry: { id: "geometry", base: "content/geometry/", title: "Геометрія", ic: "📐", words: false, diag: false, check: true, strict: true } // strict: усе по черзі — без «відкрити раніше» і без ⏭️ пропуску за перевіркою рівня
  };
  var SUB = SUBS.english, CTX = {};
  function setSub(id) {
    if (!SUBS[id]) return;
    CTX[SUB.id] = { PATH: PATH, ALL: ALL };
    SUB = SUBS[id]; E.curSub = id;
    var c = CTX[id] || {}; PATH = c.PATH || null; ALL = !!c.ALL;
    document.body.classList.toggle("kid", !!SUB.kid);
    document.body.classList.toggle("alg", id === "algebra" || id === "geometry");
  }
  /* звертання з урахуванням статі дитини: G("Зрозуміла", "Зрозумів") */
  function G(f, m) { var c = SUBJ && child(); return c && c.g === "m" ? m : f; }
  var $app = document.getElementById("app");

  /* ---------- допоміжне ---------- */
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function strip(s) { return String(s).replace(/<[^>]+>/g, ""); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function $(id) { return document.getElementById(id); }
  var canSpeak = window.SAY ? SAY.can : false;
  E.noAudio = !canSpeak;
  function say(text, rate) { if (window.SAY) SAY.say(text, rate); }
  function stopSay() { if (window.SAY) SAY.stop(); }
  /* текст для озвучки українською: без розмітки, знаки — словами */
  function ukText(t) {
    return String(t).replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/___/g, " пропуск ")
      .replace(/(\d)\s*·\s*(\d)/g, "$1 помножити на $2").replace(/(\d)\s*:\s*(\d)/g, "$1 поділити на $2")
      .replace(/\s−\s|\s-\s/g, " мінус ").replace(/\s\+\s/g, " плюс ").replace(/\s=\s/g, " дорівнює ")
      .replace(/\s>\s/g, " більше ніж ").replace(/\s<\s/g, " менше ніж ").replace(/[→•✓✅❌⚠️💡🔍]/g, " ").replace(/\s+/g, " ").trim();
  }
  function ukBtn(t) { return canSpeak && SUB.kid ? '<button class="say" data-uk="' + esc(ukText(t)) + '">🔊 Послухати</button>' : ""; }
  function bindSay(root) {
    var us = root.querySelectorAll("[data-uk]");
    for (var u = 0; u < us.length; u++) (function (b) {
      if (!canSpeak) { b.parentNode.removeChild(b); return; }
      b.onclick = function (e) { e.stopPropagation(); SAY.uk(b.getAttribute("data-uk")); };
    })(us[u]);
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
  function cget(path) { return cache[SUB.base + path]; }
  function getJSON(path) {
    var url = path.indexOf("content/") === 0 ? path : SUB.base + path;
    if (cache[url]) return Promise.resolve(cache[url]);
    return fetch(url + "?v=" + VER).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    }).then(function (j) { cache[url] = j; return j; });
  }
  function loadLesson(file) {
    return getJSON(file).then(function (L) {
      E.addDict(L.words);
      return Promise.all((L.skillFiles || []).map(getJSON)).then(function (arr) {
        arr.forEach(function (j) { if (!j._added) { E.addSkills(j, SUB.id); j._added = true; } });
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
    if (!r.text) return '<div class="card reward"><h3>🎁 Нагорода тижня</h3><p class="muted" style="margin:0">Домовтеся з батьками, яку нагороду ти отримаєш за зірки тижня ⭐ — і батьки впишуть її сюди.</p>' +
      '<div class="row"><button class="btn ghost full" data-act="dad">⚙️ Батьки: налаштувати</button></div></div>';
    var pct = Math.min(100, Math.round(w / r.goal * 100)), got = w >= r.goal;
    return '<div class="card reward"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px"><h3 style="margin:0">🎁 ' + esc(r.text) + '</h3><button class="btn plain" data-act="dad" title="Для батьків">⚙️</button></div>' +
      '<div class="prog" style="margin:10px 0 6px"><i style="width:' + pct + '%;' + (got ? "background:var(--ok)" : "background:var(--sun)") + '"></i></div>' +
      '<div style="font-weight:800">' + (got ? "🎉 " + G("Заслужила", "Заслужив") + "! Покажи батькам: " + w + " ⭐ цього тижня" : "⭐ " + w + " з " + r.goal + " · ще " + (r.goal - w) + " до нагороди") + '</div>' +
      '<p class="muted small" style="margin:4px 0 0">Зірки тижня рахуються з понеділка. ⭐ дають: заняття на сьогодні +5, виправлена помилка +1, нова навичка 🌿 +2 / 🌳 +3, зірка тесту +3.</p></div>';
  }
  function bindActs(back) {
    var bs = $app.querySelectorAll("[data-act]");
    for (var i = 0; i < bs.length; i++) (function (b) {
      b.onclick = function () { var a = b.getAttribute("data-act"); if (a === "dad") renderDad(back); if (a === "badges") renderBadges(back); toTop(); };
    })(bs[i]);
  }
  function myBadges() { var c = child(), subs = c ? c.subjects.filter(function (x) { return x.open; }).map(function (x) { return x.id; }) : []; return E.BADGES.filter(function (b) { return !b.sub || subs.indexOf(b.sub) >= 0; }); }
  function badgesRow() {
    var got = E.P().badges || {}, list = myBadges(), n = list.filter(function (b) { return got[b.id]; }).length;
    var last = list.filter(function (b) { return got[b.id]; }).slice(-5).map(function (b) { return b.e; }).join(" ");
    return '<button class="lesson" data-act="badges"><span class="ic">🏅</span><span><div class="lt">Мої значки та оформлення</div><div class="ls">' + n + ' з ' + list.length + (last ? " · " + last : " · перший уже близько!") + '</div></span></button>';
  }

  /* ================== ДЛЯ ТАТА ================== */
  function renderDad(back) {
    var r = E.reward();
    function form() {
      $app.innerHTML = '<div class="topbar"><button class="back" id="bk">← Назад</button><span class="muted small" style="font-weight:700">⚙️ Для батьків</span></div>' +
        '<div class="card"><h2>🎁 Нагорода тижня — ' + esc(E.P().name) + '</h2>' +
        '<label class="lbl">Що отримає за тиждень</label><input id="rt" type="text" placeholder="напр. похід у кіно, 200 грн, піца" value="' + esc(r.text) + '">' +
        '<label class="lbl">Скільки ⭐ треба за тиждень</label><input id="rg" type="text" inputmode="numeric" value="' + r.goal + '">' +
        '<p class="muted small">Орієнтир: повне заняття за день дає приблизно 6–10 ⭐. 30 ⭐ — це 4–5 днів занять.</p>' +
        '<label class="lbl">PIN батьків (4 цифри, щоб діти не змінили ціль)</label><input id="rp" type="text" inputmode="numeric" maxlength="4" placeholder="' + (r.pin ? "лишити як є" : "придумай PIN") + '">' +
        '<div class="row"><button class="btn full" id="sv">Зберегти</button></div></div>' +
        (PATH ? '<div class="card"><h2>↺ Почати етап заново</h2><p class="muted small">Якщо етап «пройдено» нечесно (з калькулятором, підглядаючи) — уроки й навички етапу стануть непройденими на всіх пристроях. Зірки, що вже нараховані, лишаються.</p>' +
          PATH.stages.map(function (st, i) { return '<div class="rs-row"><span>' + esc(st.title) + '</span><button class="btn ghost small" data-rs="' + i + '">↺ Заново</button></div>'; }).join("") + '</div>' : "");
      $("bk").onclick = function () { back(); toTop(); };
      var rb = $app.querySelectorAll("[data-rs]");
      for (var ri = 0; ri < rb.length; ri++) (function (b) {
        b.onclick = function () {
          var st = PATH.stages[+b.getAttribute("data-rs")];
          if (!window.confirm("Почати етап «" + st.title + "» заново для " + E.P().name + "? Уроки й навички етапу стануть непройденими.")) return;
          b.disabled = true;
          var files = st.lessons.map(function (l) { return l.file; }).filter(Boolean);
          Promise.all(files.map(getJSON)).then(function (arr) {
            var sk = {};
            arr.forEach(function (L) { (JSON.stringify(L).match(/"[^"]+"/g) || []).forEach(function (x) { x = x.slice(1, -1); if (E.SK[x]) sk[x] = 1; }); });
            E.resetIds(st.lessons.map(function (l) { return l.id; }), Object.keys(sk));
            toast("Етап «" + st.title + "» почато заново ↺"); b.textContent = "✓ Скинуто";
          }, function () { b.disabled = false; toast("Не вдалося завантажити етап — перевір інтернет"); });
        };
      })(rb[ri]);
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
    $app.innerHTML = '<div class="topbar"><button class="back" id="bk">← Назад</button></div><div class="card"><h2>🔒 Для батьків</h2><label class="lbl">PIN</label>' +
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
      myBadges().map(function (b) {
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

  /* заголовок вкладки браузера */
  function setTitle(t) { document.body.classList.remove("insession"); try { document.title = t ? t + " — Домашня школа" : "Домашня школа"; } catch (e) {} }

  /* ================== ХТО ВЧИТЬСЯ ================== */
  function renderWho() {
    setTitle("");
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
          enterChild(c);
        };
      })(bs[i]);
    });
  }

  /* ================== ВХІД ЗА PIN ================== */
  var SY = window.SYNC;
  function goChild(c) { E.setCur(c.id, c.name); applyTheme(); renderSubjects(); toTop(); }
  function enterChild(c) {
    if (!SY) return goChild(c);
    if (SY.has(c.id)) {
      $app.innerHTML = '<div class="loading">Завантажую прогрес… ⏳</div>';
      SY.pull(c.id).then(function (r) { if (r === "relogin") pinScreen(c); else goChild(c); });
    } else pinScreen(c);
  }
  function pinScreen(c, mode, first) {
    if (!mode) {
      $app.innerHTML = '<div class="loading">Хвилинку… ⏳</div>';
      SY.status(c.id).then(function (d) { if (d._status !== 200) return offlineScreen(c); pinScreen(c, d.pinSet ? "enter" : "create"); },
        function () { offlineScreen(c); });
      return;
    }
    var title = mode === "enter" ? "Введи свій PIN" : first ? "Повтори PIN ще раз" : "Придумай свій PIN";
    var sub = mode === "enter" ? "4 цифри, які ви придумали з батьками" : first ? "Щоб точно не помилитися" : "4 цифри — разом з батьками. Запам'ятай його: він потрібен на кожному новому пристрої.";
    $app.innerHTML = '<div class="topbar"><button class="back" id="bk">← Назад</button></div>' +
      '<div class="card" style="text-align:center"><div class="big-emoji">' + c.emoji + '</div><h1>' + esc(c.name) + ', ' + title.charAt(0).toLowerCase() + title.slice(1) + '</h1>' +
      '<p class="muted">' + sub + '</p><div class="pin" id="pin"><i></i><i></i><i></i><i></i></div><div class="pin-err" id="perr"></div>' +
      '<div class="keypad">' + [1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "⌫"].map(function (k) { return k === "" ? "<span></span>" : '<button class="key' + (k === "⌫" ? " del" : "") + '" data-k="' + k + '">' + k + '</button>'; }).join("") + '</div></div>';
    $("bk").onclick = function () { renderWho(); toTop(); };
    var val = "", lock = false;
    function draw() { var is = $("pin").querySelectorAll("i"); for (var i = 0; i < 4; i++) is[i].className = i < val.length ? "on" : ""; }
    function err(m) { $("perr").textContent = m; val = ""; draw(); lock = false; }
    function done() {
      lock = true;
      if (mode === "create" && !first) return pinScreen(c, "create", val);
      if (mode === "create" && first !== val) { toast("PIN не збігся — придумай ще раз"); return pinScreen(c, "create"); }
      SY.login(c.id, val).then(function (d) {
        if (d.token) { toast(d.created ? "PIN збережено 👍" : "Вітаю! 👋"); $app.innerHTML = '<div class="loading">Завантажую прогрес… ⏳</div>'; SY.pull(c.id).then(function () { goChild(c); }); }
        else if (d._status === 401 || d._status === 429 || d._status === 400) err(d.error || "Не вийшло, спробуй ще"); else offlineScreen(c);
      }, function () { offlineScreen(c); });
    }
    function press(k) {
      if (lock) return;
      if (k === "⌫") val = val.slice(0, -1); else if (val.length < 4) val += k;
      $("perr").textContent = ""; draw();
      if (val.length === 4) setTimeout(done, 120);
    }
    var ks = $app.querySelectorAll(".key");
    for (var i = 0; i < ks.length; i++) (function (b) { b.onclick = function () { press(b.getAttribute("data-k")); }; })(ks[i]);
    document.onkeydown = function (e) { if (!$("pin")) return; if (/^[0-9]$/.test(e.key)) press(e.key); else if (e.key === "Backspace") press("⌫"); };
  }
  function offlineScreen(c) {
    $app.innerHTML = '<div class="card" style="text-align:center"><div class="big-emoji">📡</div><h2>Немає зв\'язку з сервером</h2>' +
      '<p class="muted">Можна займатися й так — прогрес збережеться на цьому пристрої, а увійти можна пізніше.</p>' +
      '<div class="row"><button class="btn ghost" id="bk">← Назад</button><button class="btn full" id="go">Продовжити без входу</button></div></div>';
    $("bk").onclick = function () { renderWho(); toTop(); };
    $("go").onclick = function () { goChild(c); };
  }
  if (SY) SY.onLogout = function () { toast("Потрібно знову ввести PIN — зайди через «⇄ Змінити»"); };
  if (SY) SY.onRemote = function (id) { if (E.cur() === id && !document.querySelector("#stage, .task")) { toast("Оновлено з іншого пристрою 🔄"); renderSubjects(); } };

  /* звіт татові: у Telegram, а якщо не вийшло — скопіювати, як раніше */
  function sendDad(text, okCb) {
    var copy = function () {
      var ok = function () { if (okCb) okCb(); toast("Скопійовано — встав у месенджер"); };
      try { navigator.clipboard.writeText(text).then(ok, function () { fallbackCopy(text, ok); }); } catch (e) { fallbackCopy(text, ok); }
    };
    if (!SY || !SY.has(E.cur())) return copy();
    toast("Надсилаю… 📨");
    SY.report(E.cur(), text).then(function (ok) { if (ok) { if (okCb) okCb(); toast("✅ Надіслано батькам у Telegram"); } else copy(); });
  }

  /* як показати завдання в списках (помилки, результати тесту, звіт): у «Знайди помилку» речення навмисно з помилкою */
  function pText(it, html, strike) {
    if (it.type === "dict") return "🎧 Диктант";
    if (it.type === "fix") {
      var w = it.p.split(" ");
      return html ? "🔍 Знайди помилку: «" + w.map(function (x, i) { return strike && i === it.bad ? "<s>" + esc(x) + "</s>" : esc(x); }).join(" ") + "»" : "Знайди помилку: «" + it.p + "»";
    }
    return html ? esc(it.p) : it.p;
  }

  /* ================== ГОЛОС ОЗВУЧКИ ================== */
  function renderVoices() {
    SAY.onvoices = function () { if ($("auto")) renderVoices(); };
    var vs = SAY.voices(), cur = SAY.current();
    var sample = "Hello! My name is Anna. I usually walk to school, but yesterday I went by bus.";
    $app.innerHTML = '<div class="topbar"><button class="back" id="back">← Назад</button></div>' +
      '<div class="card"><h2>🔊 Голос озвучки</h2><p class="muted">Натисни ▶️, послухай і обери голос, який найчіткіше вимовляє. Найкращі позначені ⭐.</p>' +
      (vs.length ? vs.filter(function (v) { return !v.bad; }).slice(0, 12).map(function (v, i) {
        return '<div class="ex"><div><div class="en">' + (v.good ? "⭐ " : "") + esc(v.name) + (v.name === cur ? " ✅" : "") + '</div><div class="ua">' + esc(v.lang) + '</div></div>' +
          '<div class="row" style="margin:0;gap:6px"><button class="say round" data-v="' + i + '">▶️</button><button class="btn' + (v.name === cur ? "" : " ghost") + '" data-pick="' + i + '" style="padding:8px 12px">' + (v.name === cur ? "Обрано" : "Обрати") + '</button></div></div>';
      }).join("") : '<p>Голосів не знайдено.</p>') +
      '<div class="tip">💡 <b>Найчіткіший голос на iPhone</b> (меню російською): Настройки → Универсальный доступ → Устный контент → Голоса → Английский → напр., <b>Daniel</b> або <b>Serena</b> → завантажити <b>«Улучшенный»</b>. На Mac: Системные настройки → Универсальный доступ → Устный контент → Системный голос → Управлять голосами. Потім перезавантаж сторінку — голос з\'явиться тут.</div>' +
      '<div class="tip">🔕 Не чути? Вимкни беззвучний режим на iPhone.</div>' +
      '<button class="btn plain full" id="auto">Обирати автоматично</button></div>';
    var list = vs.filter(function (v) { return !v.bad; }).slice(0, 12);
    $("back").onclick = function () { stopSay(); renderHome(); toTop(); };
    $("auto").onclick = function () { SAY.setVoice(""); toast("Голос — автоматично"); renderVoices(); };
    var bs = $app.querySelectorAll("[data-v]");
    for (var i = 0; i < bs.length; i++) (function (b) { b.onclick = function () { SAY.preview(list[+b.getAttribute("data-v")].name, sample); }; })(bs[i]);
    var ps = $app.querySelectorAll("[data-pick]");
    for (var j = 0; j < ps.length; j++) (function (b) { b.onclick = function () { SAY.setVoice(list[+b.getAttribute("data-pick")].name); toast("Голос обрано 👍"); renderVoices(); }; })(ps[j]);
  }

  /* ================== МОЇ ПРЕДМЕТИ ================== */
  function renderSubjects() {
    withSubjects(function () {
      var c = child();
      if (!c) return renderWho();
      setTitle(c.name + ": мої предмети");
      var P = E.P(), goal = SUBJ.dailyGoal, st = E.streak();
      var html = '<div class="topbar"><button class="back" id="who">⇄ Змінити</button><span class="muted small" style="font-weight:700">' + c.grade + ' клас</span></div>' +
        (SY && SY.moved ? '<div class="card" style="background:var(--ok-soft)"><b>🏠 Сайт переїхав!</b><br>' + (SY.has(c.id) && E.P().srv ? "Твій прогрес уже перенесено ✅ " : "") + 'Тепер заходь сюди: <a href="https://school.akdtv.pp.ua/"><b>school.akdtv.pp.ua</b></a></div>' : "") +
        '<div class="card"><h1>Привіт, ' + esc(c.name) + '! ' + c.emoji + '</h1>' +
        '<div class="stats">' + freezeChip() + '<span class="stat">⭐ ' + E.starsWeek() + ' за тиждень</span></div>' +
        (hasOpen(c) ? goalBar(E.todayCount(null), goal) : '<div class="today"><div class="today-t">🚀 Твої заняття скоро з\'являться! Батьки вже готують.</div></div>') +
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
        b.onclick = function () { var id = b.getAttribute("data-s"); if (SUBS[id]) { setSub(id); renderHome(); toTop(); } };
      })(bs[i]);
    });
  }
  function hasOpen(c, id) { for (var i = 0; i < c.subjects.length; i++) if (c.subjects[i].open && (!id || c.subjects[i].id === id)) return true; return false; }
  function totalStars(P) { var n = 0; Object.keys(P.lessons).forEach(function (k) { n += P.lessons[k].stars || 0; }); return n; }

  /* ================== КАБІНЕТ АНГЛІЙСЬКОЇ ================== */
  function renderHome() {
    if (!SUBJ || !child()) return withSubjects(function () { if (child()) renderHome(); else renderWho(); });
    if (!hasOpen(child(), SUB.id)) { var f = null; child().subjects.forEach(function (x) { if (!f && x.open && SUBS[x.id]) f = x.id; }); if (f && f !== SUB.id) { setSub(f); return renderHome(); } return renderSubjects(); }
    var P = E.P();
    if (!ALL) return loadAll(function () { ALL = true; renderHome(); });
    if (SUB.diag) applyPlacement();
    if (SUB.strict) { var clr = false; PATH.stages.forEach(function (s0) { s0.lessons.forEach(function (l0) { var L0 = P.lessons[l0.id]; if (L0 && L0.skip) { L0.skip = false; L0.skipU = Date.now(); clr = true; } }); }); if (clr) E.save(); }
    setTitle(SUB.title + " · " + child().name);
    var st = E.streak(), doneCount = 0, allLessons = 0, num = 0;
    Object.keys(P.lessons).forEach(function (k) { if (P.lessons[k].stars > 0) doneCount++; });
    PATH.stages.forEach(function (s) { s.lessons.forEach(function (l) { if (l.file) allLessons++; }); });
    var T = lessonTarget(), next = T && T.next ? T : null, cont = T ? T.l : null;
    var IN = SUB.diag === "inline";
    var dg = !SUB.diag ? true : IN ? (P.diagS || {})[SUB.id] || null : P.diag && P.diag.v === 2 ? P.diag : null;
    var pendingDiag = SUB.diag && !IN && !dg && testDone(); // тест пройдено раніше, план ще не підлаштований
    var nMist = E.openMistakes().length, plan = E.plan(), dayDone = plan.warm && plan.lesson && (plan.words || !SUB.words) && plan.mist && (!plan.reviewPart || plan.review);

    var diagCard = dg ? "" : '<div class="card" style="border:2px solid var(--pri)"><h2>🧭 ' + (pendingDiag ? "Підлаштуймо план" : "Спершу — перевірка рівня") + '</h2><p class="muted" style="margin:0 0 4px">' + (pendingDiag ? "Перевірку рівня ти вже пройшла. Відкрий її ще раз — побачиш свій результат, а уроки, які вже знаєш, позначаться ⏭️." : IN ? (SUB.strict ? "Це не оцінка: перевірка покаже, що вже вмієш, а що підтягнути. Можна частинами." : "Це не оцінка: перевірка покаже, що вже вмієш, і уроки підлаштуються під тебе. Можна частинами.") : "15–20 хвилин. Це не оцінка: тест покаже, що вже знаєш, а що підтягнути, і план підлаштується під тебе.") + '</p>@DIAG@</div>';
    var html = '<div class="topbar"><button class="back" id="subj">← Мої предмети</button><span class="muted small" style="font-weight:700">' + SUB.ic + ' ' + SUB.title + '</span></div>' + diagCard +
      '<div class="card"><div class="hello"><div><h1>Привіт, ' + esc(P.name) + '! 👋</h1>' +
      '<p class="muted" style="margin:0">' + (cont ? (next ? "Зараз: урок " + next.n + " «" + esc(cont.title) + "»" : "Усі готові уроки пройдено! Нові вже готуються.") : "") + '</p></div></div>' +
      '<div class="stats">' + freezeChip() + '<span class="stat">⭐ ' + E.starsWeek() + ' за тиждень</span>' +
      '<span class="stat">📚 ' + doneCount + ' з ' + allLessons + ' уроків</span></div>' +
      goalBar(E.todayCount(SUB.id), SUBJ.dailyGoal) +
      ('<div class="row"><button class="btn full ' + (dayDone ? "okb" : "") + '" id="daily">' + (dayDone ? "✅ Заняття на сьогодні виконано" : "▶️ Заняття на сьогодні · ~" + (SUB.kid ? 10 : 15) + " хв") + '</button></div>' +
      (cont ? '<div class="row" style="margin-top:8px"><button class="btn ghost full' + (SUB.kid && !dayDone ? " small" : "") + '" id="cont">' + T.label + '</button></div>' : "")) + '</div>' +
      "";

    if (SUB.check) { var dueSt = null; PATH.stages.forEach(function (stg, q) { if (!dueSt && stageReady(stg) && checkDue(stg)) dueSt = q; });
      if (dueSt !== null) html += '<div class="card" style="padding:12px 16px"><button class="lesson open" data-chk="' + dueSt + '" data-re="1"><span class="ic">🔁</span><span><div class="lt">Пора освіжити: ' + esc(PATH.stages[dueSt].title) + '</div><div class="ls">6 завдань · ~7 хв · щоб не забулось · +3 ⭐</div></span></button></div>'; }
    if (SUB.id === "math2" && window.DINO) html += dinoCard();
    html += rewardCard();
    var wDue = E.wordsDue().length, wL = E.wordsLearned();
    var rv = E.review(), rvN = E.reviewSkills().length;
    html += '<div class="card" style="padding:12px 16px">' +
      (SUB.id === "math2" ? '<button class="lesson open" id="blitzBtn"><span class="ic">⚡</span><span><div class="lt">Блискавка</div><div class="ls">Скільки прикладів встигнеш за 60 секунд?' + (E.blitzInfo().best ? " · рекорд " + E.blitzInfo().best : "") + '</div></span></button>' : "") +
      '<button class="lesson ' + (rv.done ? "done" : rvN >= 2 ? "open" : "lock") + '" id="reviewBtn"><span class="ic">' + (rv.done ? "✅" : "🔁") + '</span><span><div class="lt">Повторення тижня</div><div class="ls">' +
      (rv.done ? "Зроблено цього тижня: " + fmt(rv.score) + " з " + rv.max + " · можна ще раз" : rvN >= 2 ? "По завданню з кожної пройденої теми · ~10 хв · +5 ⭐" : "З'явиться після перших уроків") + '</div></span></button>' + badgesRow() +
      (SUB.words && canSpeak ? '<button class="lesson" id="voiceBtn"><span class="ic">🔊</span><span><div class="lt">Голос озвучки</div><div class="ls">' + esc(SAY.current() || "автоматично") + ' · обрати чіткіший</div></span></button>' : "") +
      (SUB.words ? '<button class="lesson" id="wordsBtn"><span class="ic">🃏</span><span><div class="lt">Мої слова</div><div class="ls">вивчено ' + wL + (wDue ? " · на сьогодні " + wDue : "") + ' · 11 тем</div></span></button>' : "") +
      '<button class="lesson" id="mist"><span class="ic">📝</span><span><div class="lt">Мої помилки</div><div class="ls">' +
      (nMist ? nMist + " " + (nMist === 1 ? "завдання чекає" : nMist < 5 ? "завдання чекають" : "завдань чекають") + " на виправлення" : "Усі виправлено 🎉") + '</div></span></button></div>';
    num = 0;
    var prevOk = true, prevN = 0, early = {}, nLocked = 0;
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
          else if (L.skip) { cls = "done"; ic = "⏭️"; sub = "Знаєш за перевіркою рівня · можна пройти"; }
          else if (unlocked) { cls = "open"; ic = ls.ic; sub = nDone ? "Пройдено " + nDone + " з " + stepsOf(cget(ls.file)).length + " кроків" : "Почати · ~" + (SUB.kid ? 10 : 20) + " хв"; }
          else if (SUB.strict) { cls = "lock"; ic = "🔒"; sub = "Відкриється після уроку " + prevN; early[ls.file] = { l: ls, after: prevN, no: true }; nLocked++; if (nLocked > 2) cls += " hid"; }
          else { cls = "lock soon"; ic = "🔒"; sub = "Після уроку " + prevN + " · можна відкрити раніше"; early[ls.file] = { l: ls, after: prevN }; nLocked++; if (nLocked > 2) cls += " hid"; }
          if (lv && unlocked) sub += '<div class="lvls" title="Навички уроку">' + lv + '</div>';
          prevOk = L.stars > 0 || !!L.skip; prevN = num;
        } else if (next && next.n + 1 === num) { ic = "⏳"; sub = "Готується — скоро з'явиться"; }
        else { ic = "⏳"; sub = "Готується"; nLocked++; if (nLocked > 2) cls += " hid"; }
        html += '<button class="lesson ' + cls + '" data-file="' + (ls.file || "") + '"><span class="ic">' + ic + '</span>' +
          '<span><div class="lt">' + num + '. ' + esc(ls.title) + '</div><div class="ls">' + sub + '</div></span></button>';
      });
      if (SUB.check && anyOpen) html += checkBtn(stage, si);
      html += '</div>';
    });
    if (nLocked > 2) html += '<div class="card" style="padding:10px 16px"><button class="btn plain full" id="showAll">🔒 Показати всі уроки (ще ' + (nLocked - 2) + ')</button></div>';
    var diagHtml = IN ? '<button class="lesson' + (dg ? "" : " open") + '" id="diagGo"><span class="ic">🧭</span><span><div class="lt">Перевірка рівня</div><div class="ls">' +
      (dg ? "Пройдено " + dg.date + ": " + dg.pct + "% · можна пройти ще раз" : diagRunning() ? "Почато — продовжити з того місця" : "3 частини по ~10 хв: дроби, рівняння, степені") + '</div></span></button>' :
      '<a class="lesson' + (dg ? "" : " open") + '" href="test.html" style="text-decoration:none"><span class="ic">🧭</span><span><div class="lt">Перевірка рівня</div><div class="ls">' +
      (dg ? "Пройдено " + dg.date + ": " + dg.pct + "% · можна пройти ще раз" : pendingDiag ? "✅ Ти вже пройшла тест! Натисни — і план підлаштується під результат" : "Тест на 29 завдань: що вже знаю, а що підтягнути") + '</div></span></a>';
    html = !SUB.diag ? html : dg ? html + diagHtml : html.replace("@DIAG@", diagHtml);
    $app.innerHTML = html;
    if (IN && !dg) { ["daily", "cont"].forEach(function (id) { if ($(id)) $(id).classList.add("dim"); }); }
    $("subj").onclick = function () { renderSubjects(); toTop(); };
    bindActs(renderHome);
    if ($("diagGo")) $("diagGo").onclick = function () { renderDiag(); toTop(); };
    var cbs = $app.querySelectorAll("[data-chk]");
    for (var q = 0; q < cbs.length; q++) (function (b) { b.onclick = function () { var si = +b.getAttribute("data-chk"); if (stageReady(PATH.stages[si])) { renderCheck(si, b.getAttribute("data-re") === "1"); toTop(); } else toast("Спершу пройди всі уроки розділу 🙂"); }; })(cbs[q]);
    if ($("cont")) $("cont").onclick = function () { DAILY = false; openLesson(cont.file, T.step); };
    if ($("daily")) $("daily").onclick = function () { renderDaily(); toTop(); };
    if ($("mist")) $("mist").onclick = function () { renderMistakes(); toTop(); };
    if ($("dinoCard")) $("dinoCard").onclick = function () { renderDino(); toTop(); };
    if (SUB.id === "math2" && window.DINO) dinoNews();
    if ($("blitzBtn")) $("blitzBtn").onclick = function () { renderBlitz(); toTop(); };
    if ($("showAll")) $("showAll").onclick = function () { var hs = $app.querySelectorAll(".lesson.hid"); for (var q = 0; q < hs.length; q++) hs[q].classList.remove("hid"); this.parentNode.parentNode.removeChild(this.parentNode); };
    if ($("wordsBtn")) $("wordsBtn").onclick = function () { renderWords(); toTop(); };
    if ($("voiceBtn")) $("voiceBtn").onclick = function () { renderVoices(); toTop(); };
    $("reviewBtn").onclick = function () { if (rvN >= 2) { DAILY = false; runReview(renderHome); } };
    var bs = $app.querySelectorAll(".lesson[data-file]");
    for (var j = 0; j < bs.length; j++) (function (b) {
      var f = b.getAttribute("data-file");
      if (f) b.onclick = function () { if (early[f] && early[f].no) toast("🔒 Спершу пройди урок " + early[f].after); else if (early[f]) askEarly(early[f]); else openLesson(f); };
    })(bs[j]);
  }
  /* рядок значків рівнів навичок уроку */
  function lessonLevels(id) {
    var L = cget("lessons/" + id + ".json");
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

  /* Після перевірки рівня: навички уроків, які Аня вже знає, ставимо в 🌿 «Знаю»
     з повторенням завтра — так вони з'являтимуться в розминці. */
  function applyPlacement() {
    var P = E.P(), d = SUB.diag === "inline" ? (P.diagS || {})[SUB.id] : P.diag;
    if (!d || !d.skip || d.applied) return;
    d.skip.forEach(function (id) {
      var L = cget("lessons/" + id + ".json");
      (L && L.skills || []).forEach(function (sid) {
        var s = E.sk(sid);
        if (s.lvl < 2 && !s.n) { s.lvl = 2; s.knownAt = "placement"; s.iv = 0; s.due = E.addDays(E.today(), 1); } // власні відповіді Ані важливіші за тест
      });
    });
    d.applied = true; E.save();
  }
  /* ================== ПЕРЕВІРКА РІВНЯ В РУШІЇ (алгебра) ==================
     diag.json: {items:[{skill, t}]} — по завданню на навичку. Без зірок і рівнів; хід зберігається на пристрої.
     Урок позначається ⏭️, якщо всі його навички в перевірці розв'язані правильно без підказки. */

  /* ================== ПІДСУМКОВА ПЕРЕВІРКА РОЗДІЛУ ==================
     Відкривається, коли всі уроки етапу пройдені (✅ або ⏭️). 12 змішаних завдань з навичок етапу,
     без підказок, розв'язок — після відповіді; результат наприкінці. Помилкові навички → одразу
     «Закріпити» (2 схожі завдання на тему з повним розбором) і в «Мої помилки».
     Результат: profile.checks[sub][stage.n] = {t, date, score, max, weak:[skill], best}. */
  function stageReady(st) { var any = false; return st.lessons.every(function (l) { if (!l.file) return true; any = true; var L = E.lesson(l.id); return L.stars > 0 || !!L.skip; }) && any; }
  function checkRes(st) { return ((E.P().checks || {})[SUB.id] || {})[st.n] || null; }
  function checkKey(st, re) { return "school-check:" + E.cur() + ":" + SUB.id + ":" + st.n + (re ? ":re" : ""); }
  var RE_DAYS = [14, 30, 60]; // повторна перевірка: через 2 тижні, потім через місяць, далі — раз на 2 місяці
  function checkDue(st) { var r = checkRes(st); if (r && !r.due && r.d) r.due = E.addDays(r.d, RE_DAYS[0]); return r && r.due && r.due <= E.today() ? r : null; }
  function checkBtn(st, si) {
    var ready = stageReady(st), r = checkRes(st), run = null;
    try { run = JSON.parse(localStorage.getItem(checkKey(st)) || "null"); } catch (e) {}
    var due = checkDue(st);
    if (ready && due) return '<button class="lesson open" data-chk="' + si + '" data-re="1"><span class="ic">🔁</span><span><div class="lt">Пора освіжити розділ</div><div class="ls">Повторна перевірка · 6 завдань · ~7 хв · +3 ⭐<br>Минулого разу: ' + fmt(due.score) + ' з ' + due.max + '</div></span></button>';
    var sub = !ready ? "Відкриється, коли пройдеш усі уроки розділу" :
      r ? (r.rt ? "Повторна " + r.rt.date + ": " + r.rt.score + " з " + r.rt.max : "Пройдено " + r.date + ": " + fmt(r.score) + " з " + r.max) + (r.weak && r.weak.length ? " · закріпити: " + r.weak.length : (r.rt ? r.rt.score < r.rt.max : r.score < r.max) ? " · помилки закріплено ✅" : " · без жодної помилки 🔥") + (r.due ? "<br>Наступне повторення — " + r.due.slice(8, 10) + "." + r.due.slice(5, 7) : "") :
      run && run.i > 0 ? "Почато — продовжити з " + (run.i + 1) + "-го завдання" : "12 завдань упереміш · ~15 хв · без підказок · +5 ⭐";
    return '<button class="lesson ' + (!ready ? "lock" : r ? "done" : "open") + '" data-chk="' + si + '"><span class="ic">' + (!ready ? "🔒" : "🏁") + '</span><span><div class="lt">Підсумкова перевірка</div><div class="ls">' + sub + '</div></span></button>';
  }
  function checkItems(st, n) {
    var groups = [], used = {}, out = [];
    st.lessons.forEach(function (l) { var L = l.file && cget(l.file); if (L && L.skills) groups.push(shuffle(L.skills.filter(function (s) { return !!E.SK[s]; }).slice())); });
    var seen = {};
    for (var round = 0; round < 6 && out.length < n; round++) {
      shuffle(groups).forEach(function (g) {
        if (out.length >= n || !g.length) return;
        var id = null;
        for (var q = 0; q < g.length; q++) { var c = g[(round + q) % g.length]; if (!seen[c] || round >= g.length) { id = c; break; } }
        if (!id) return;
        var x = E.pick(id, 1, used)[0];
        if (x && !used[x.key]) { used[x.key] = 1; seen[id] = 1; out.push(x); }
      });
    }
    return shuffle(out);
  }
  function renderCheck(si, re) {
    loadAll(function () {
      var st = PATH.stages[si], run = null, N = re ? 6 : 12;
      try { run = JSON.parse(localStorage.getItem(checkKey(st, re)) || "null"); } catch (e) {}
      if (run && (!run.items || !run.t || Date.now() - run.t > 3 * 864e5)) run = null;
      var resume = run && run.i > 0 && run.i < run.items.length;
      var save = function (r) { try { localStorage.setItem(checkKey(st, re), JSON.stringify(r)); } catch (e) {} };
      var start = function (r) {
        var step = function () {
          if (r.i >= r.items.length) { try { localStorage.removeItem(checkKey(st, re)); } catch (e) {} return checkResult(si, r, re); }
          var it = r.items[r.i];
          E.ITEM[it.key] = it;
          showTask($app, it, {
            quiet: true, noHint: true, calm: "Розв'язок — нижче. Цю тему одразу після перевірки закріпимо.",
            onBack: function () { renderHome(); toTop(); },
            chip: (re ? "🔁 Повторна · " : "🏁 Підсумкова · ") + (r.i + 1) + " з " + r.items.length, prog: r.i / r.items.length,
            nextLabel: function () { return r.i + 1 < r.items.length ? "Далі →" : "Результат"; },
            done: function (x) {
              E.tick(SUB.id); E.record(it.skill, !!x.ok, !!x.clean);
              if (x.ok) E.fixMistake(it.key); else E.addMistake(it, x.given);
              r.res.push({ s: it.skill, ok: !!x.ok, k: it.key }); r.i++; save(r); step();
            }
          });
        };
        save(r); step();
      };
      var KB = SUB.id === "algebra" ? '<div class="tip" style="text-align:left">⌨️ <b>−</b> мінус, <b>,</b> кома, <b>/</b> дріб, <b>␣</b> мішане число (1 3/4).</div>' : "";
      $app.innerHTML = '<div class="card" style="text-align:center"><div class="celebrate">' + (re ? "🔁" : "🏁") + '</div><h2>' + (re ? "Освіжимо розділ" : "Підсумкова перевірка") + '</h2><p class="muted" style="margin-top:0">' + esc(st.title) + '</p>' +
        (resume ? '<p>Продовжимо з ' + (run.i + 1) + '-го завдання з ' + run.items.length + '.</p>' :
        (re ? '<p>Ти ' + G("пройшла", "пройшов") + ' цей розділ ' + esc(checkRes(st).date) + '. 6 завдань упереміш — перевіримо, що не забулось. Без підказок.</p>' : '<p>12 завдань з усього розділу впереміш — як у шкільній контрольній, але без оцінки. Підказок немає: так видно, що справді запам\'яталось.</p>')) +
        '<p class="muted">Помилилась — не біда: розв\'язок покажу одразу, а наприкінці закріпимо саме ці теми. Можна перервати й продовжити пізніше.</p>' + KB +
        '<div class="row"><button class="btn ghost" id="bk">← Назад</button><button class="btn full" id="go">' + (resume ? "Продовжити" : "Почати") + '</button></div></div>';
      $("bk").onclick = function () { renderHome(); toTop(); };
      $("go").onclick = function () { if (resume) return start(run); start({ items: checkItems(st, N), i: 0, res: [], t: Date.now() }); };
      toTop();
    });
  }
  function checkResult(si, r, re) {
    var st = PATH.stages[si], P = E.P(), by = {}, order = [], ok = 0;
    r.res.forEach(function (x) { if (!by[x.s]) { by[x.s] = [0, 0]; order.push(x.s); } by[x.s][1]++; if (x.ok) { by[x.s][0]++; ok++; } });
    var good = order.filter(function (s) { return by[s][0] === by[s][1]; }), weak = order.filter(function (s) { return by[s][0] < by[s][1]; });
    var bad = {}; r.res.forEach(function (x) { if (!x.ok && !bad[x.s]) bad[x.s] = r.items.filter(function (it) { return it.key === x.k; })[0]; });
    var now = new Date(), date = ("0" + now.getDate()).slice(-2) + "." + ("0" + (now.getMonth() + 1)).slice(-2) + "." + now.getFullYear();
    P.checks = P.checks || {}; P.checks[SUB.id] = P.checks[SUB.id] || {};
    var prev = P.checks[SUB.id][st.n], first = !prev;
    if (re && prev) { // повторна: основний результат лишається, інтервал росте (якщо все тримається; багато помилок — знову через 2 тижні)
      var rn = ok * 3 >= r.res.length * 2 ? Math.min((prev.rn || 0) + 1, RE_DAYS.length - 1) : 0;
      prev.rn = rn; prev.due = E.addDays(E.today(), RE_DAYS[rn]); prev.rt = { date: date, score: ok, max: r.res.length }; prev.weak = weak; prev.t = Date.now();
      E.save(); E.addStars(3, "recheck");
    } else {
      P.checks[SUB.id][st.n] = { t: Date.now(), d: E.today(), date: date, score: ok, max: r.res.length, weak: weak, best: Math.max(ok, prev && prev.best || 0), rn: 0, due: E.addDays(E.today(), RE_DAYS[0]) };
      E.save();
      if (first) E.addStars(5, "check");
    }
    var name = function (id) { return E.SK[id] ? E.SK[id].title : id; };
    var pct = ok / Math.max(1, r.res.length);
    var text = (re ? "🔁 " : "🏁 ") + child().name + " — " + (re ? "повторна" : "підсумкова") + " перевірка «" + st.title + "» (" + date + "): " + ok + " з " + r.res.length +
      (good.length ? "\n✅ Тримається:\n" + good.map(function (s) { return "• " + name(s); }).join("\n") : "") +
      (weak.length ? "\n🌱 Закріпити:\n" + weak.map(function (s) { return "• " + name(s); }).join("\n") : "\nУсе тримається!");
    $app.innerHTML = '<div class="card" style="text-align:center"><div class="celebrate">' + (pct >= 0.8 ? "🎉" : "💪") + '</div><h2>Перевірку пройдено!</h2>' +
      '<p style="font-size:1.3em;font-weight:800;margin:4px 0">' + ok + ' з ' + r.res.length + '</p>' +
      '<p class="muted">' + (re ? (pct >= 0.9 ? "Не забулось — тримається міцно! 🔥" : pct >= 0.6 ? "Більшість пам\'ятаєш. Кілька тем освіжимо." : "Дещо призабулось — це нормально, для цього й повторюємо.") + " +3 ⭐" : pct >= 0.9 ? "Розділ засвоєно — чудова робота!" : pct >= 0.6 ? "Більшість тримається. Кілька тем трохи підтягнемо." : "Тепер видно, що повторити, — для цього перевірка й потрібна.") + (first && !re ? " +5 ⭐" : "") + '</p></div>' +
      '<div class="card">' +
      (good.length ? '<div class="tip" style="text-align:left;background:var(--ok-soft)"><b>✅ Тримається</b><br>' + good.map(function (s) { return "• " + esc(name(s)); }).join("<br>") + '</div>' : "") +
      (weak.length ? '<div class="tip" style="text-align:left"><b>🌱 Варто закріпити</b> (уже в «Моїх помилках»)<br>' + weak.map(function (s) { return "• " + esc(name(s)); }).join("<br>") + '</div>' : "") +
      (weak.length ? '<div class="row"><button class="btn full" id="fix">💪 Закріпити зараз · ~' + Math.max(3, weak.length * 3) + ' хв</button></div>' : "") +
      '<div class="row"><button class="btn ghost full" id="send">📨 Надіслати батькам</button></div>' +
      '<div class="row"><button class="btn ' + (weak.length ? "plain" : "") + ' full" id="home">' + (weak.length ? "Закріплю пізніше" : "До уроків →") + '</button></div></div>';
    $("send").onclick = function () { sendDad(text); };
    $("home").onclick = function () { renderHome(); toTop(); };
    if ($("fix")) $("fix").onclick = function () { runFix(si, weak, bad); };
    toTop();
  }
  /* закріплення після перевірки: по 2 завдання тієї ж будови на кожну слабку тему; помилка → повний розбір */
  function runFix(si, weak, bad) {
    var used = {}, items = [];
    weak.forEach(function (s) { var f = bad[s]; if (f) used[f.key] = 1; E.pick(s, 2, used, f && f.key, f).forEach(function (x) { if (!used[x.key]) { used[x.key] = 1; items.push(x); } }); });
    if (!items.length) return renderHome();
    $app.innerHTML = '<div class="topbar"><button class="back" id="back">← Кабінет</button><span class="muted small" style="font-weight:700">💪 Закріплюємо</span></div><div id="stage"></div>';
    $("back").onclick = function () { stopSay(); renderHome(); toTop(); };
    DAILY = false;
    runSession($("stage"), { items: items, mode: "fix", onDone: function (s) {
      var okBy = {}, nBy = {};
      s.res.forEach(function (x) { var id = x.it.skill; nBy[id] = (nBy[id] || 0) + 1; if (x.ok) okBy[id] = (okBy[id] || 0) + 1; });
      var fixedT = weak.filter(function (id) { return nBy[id] && okBy[id] === nBy[id]; });
      fixedT.forEach(function (id) { E.fixSkillMistakes(id); });
      var c = checkRes(PATH.stages[si]);
      if (c && c.weak) { c.weak = c.weak.filter(function (id) { return fixedT.indexOf(id) < 0; }); c.t = Date.now(); E.save(); }
      showCard($("stage"), '<div class="celebrate">💪</div><h2>Закріпили!</h2><p class="muted">' + (fixedT.length === weak.length ? "Усі теми тепер тримаються 🔥" : fixedT.length ? "Закріплено " + fixedT.length + " з " + weak.length + ". Решта — у «Моїх помилках», повернемось до них у розминці." : "Ці теми ще хитрі — повернемось до них у «Моїх помилках» і розминці.") + '</p>', "До уроків →", function () { renderHome(); });
    } });
    toTop();
  }
  function diagKey() { return "school-diag:" + E.cur() + ":" + SUB.id; }
  function diagRunning() { var pr = (E.P().diagRun || {})[SUB.id]; if (pr && pr.items && pr.i > 0) return true; try { var r = JSON.parse(localStorage.getItem(diagKey()) || "null"); return !!(r && r.items && r.i > 0); } catch (e) { return false; } }
  function renderDiag() {
    loadAll(function () {
      getJSON("diag.json").then(function (D) {
        var run = null, parts = D.parts || [D.title];
        try { run = JSON.parse(localStorage.getItem(diagKey()) || "null"); } catch (e) {}
        var pr = (E.P().diagRun || {})[SUB.id]; if (pr && pr.items && (!run || (pr.u || 0) > (run.u || 0))) run = pr; // хід з іншого пристрою
        if (run && (!run.items || run.n !== D.items.length || !run.t || Date.now() - run.t > 7 * 864e5)) run = null; // змінилась перевірка або хід старий — заново
        var KB = '<div class="tip" style="text-align:left">⌨️ Відповідь набирай кнопками: <b>−</b> мінус, <b>,</b> кома, <b>/</b> дріб (3/4). Мішане число — через <b>␣</b>: 1 3/4.</div>';
        var start = function (r) {
          var save = function () { r.u = Date.now(); try { localStorage.setItem(diagKey(), JSON.stringify(r)); } catch (e) {} var P0 = E.P(); P0.diagRun = P0.diagRun || {}; P0.diagRun[SUB.id] = r; E.save(); };
          var step = function () {
            if (r.i >= r.items.length) { try { localStorage.removeItem(diagKey()); } catch (e) {} var P1 = E.P(); P1.diagRun = P1.diagRun || {}; P1.diagRun[SUB.id] = { u: Date.now(), done: 1 }; E.save(); return diagResult(D, r); }
            var it = r.items[r.i], pi = r.parts[r.i];
            if (r.i > 0 && r.parts[r.i - 1] !== pi && !r.go) { // кінець частини
              save();
              $app.innerHTML = '<div class="card" style="text-align:center"><div class="celebrate">🎉</div><h2>Частину ' + (r.parts[r.i - 1] + 1) + ' з ' + parts.length + ' пройдено!</h2>' +
                '<p class="muted">Далі: «' + esc(parts[pi]) + '». Можна зараз, а можна завтра — прогрес збережеться (і на іншому пристрої теж).</p>' +
                '<div class="row"><button class="btn ghost" id="later">Завтра</button><button class="btn full" id="more">Продовжити</button></div></div>';
              $("later").onclick = function () { renderHome(); toTop(); };
              $("more").onclick = function () { r.go = 1; step(); toTop(); };
              return;
            }
            r.go = 0;
            var inPart = 0, pos = 0; r.parts.forEach(function (x, q) { if (x === pi) { inPart++; if (q <= r.i) pos++; } });
            E.ITEM[it.key] = it;
            showTask($app, it, {
              quiet: true, onBack: function () { renderHome(); toTop(); },
              chip: "🧭 Частина " + (pi + 1) + " з " + parts.length + " · " + pos + " з " + inPart, prog: pos / inPart,
              nextLabel: function () { return r.i + 1 < r.items.length ? "Далі →" : "Результат"; },
              done: function (x) { r.res.push({ s: it.skill, ok: !!x.ok, clean: !!x.clean }); r.i++; save(); step(); }
            });
          };
          save(); step();
        };
        var resume = run && run.i > 0 && run.i < run.items.length;
        $app.innerHTML = '<div class="card" style="text-align:center"><div class="celebrate">🧭</div><h2>' + esc(D.title) + '</h2>' +
          (resume ? '<p>Продовжимо з того місця, де зупинилась: частина ' + (run.parts[run.i] + 1) + ' з ' + parts.length + '.</p>' :
          '<p>' + parts.length + ' короткі частини, ~10 хвилин кожна: ' + parts.map(function (x) { return "«" + esc(x) + "»"; }).join(", ") + '.</p>') +
          '<p class="muted">Це не контрольна і не оцінка! Перевірка покаже, що вже вмієш' + (SUB.strict ? ", а що підтягнути." : ", — і уроки підлаштуються.") + ' Не знаєш — тисни «🤷 Не знаю», це теж корисна відповідь.</p>' + KB +
          '<div class="row"><button class="btn ghost" id="bk">← Назад</button><button class="btn full" id="go">' + (resume ? "Продовжити" : "Почати") + '</button></div></div>';
        $("bk").onclick = function () { renderHome(); toTop(); };
        $("go").onclick = function () {
          if (resume) return start(run);
          var items = [], pa = [];
          D.items.forEach(function (d) { var sk = E.SK[d.skill]; if (!sk) return; var x = d.args ? E.makeGen(sk, d.args) : E.pick(d.skill, 1)[0]; if (x) { items.push(x); pa.push(d.part || 0); } });
          start({ items: items, parts: pa, i: 0, res: [], n: D.items.length, t: Date.now() });
        };
      }, function () { failView(renderDiag); });
    });
  }
  function diagResult(D, r) {
    var P = E.P(), by = {}, order = [], ok = 0, T = {}, cnt = {}, bad = {};
    D.items.forEach(function (d) { T[d.skill] = d.t; });
    r.res.forEach(function (x) { var t = T[x.s] || "Інше"; if (!by[t]) { by[t] = [0, 0]; order.push(t); } by[t][1]++; if (x.clean) { by[t][0]++; ok++; } cnt[x.s] = (cnt[x.s] || 0) + 1; if (!x.clean) bad[x.s] = 1; });
    var pct = Math.round(ok / Math.max(1, r.res.length) * 100);
    /* урок ⏭️: усі його навички були в перевірці, усі відповіді — правильно без підказки, і завдань на урок щонайменше 2 */
    var skip = [], skipT = [];
    PATH.stages.forEach(function (st) { st.lessons.forEach(function (l) {
      var L = l.file && cget(l.file); if (!L || !L.skills || !L.skills.length) return;
      var n = 0, all = L.skills.every(function (s) { n += cnt[s] || 0; return cnt[s] && !bad[s]; });
      var LL = E.lesson(l.id);
      if (all && n >= 2 && !SUB.strict) { skip.push(l.id); skipT.push(l.title); if (!(LL.stars > 0) && !LL.skip) { LL.skip = true; LL.skipU = Date.now(); } }
      else if (LL.skip) { LL.skip = false; LL.skipU = Date.now(); }
    }); });
    var now = new Date(), date = ("0" + now.getDate()).slice(-2) + "." + ("0" + (now.getMonth() + 1)).slice(-2) + "." + now.getFullYear();
    var first = !(P.diagS && P.diagS[SUB.id]);
    P.diagS = P.diagS || {};
    P.diagS[SUB.id] = { v: 2, t: Date.now(), d: E.today(), date: date, pct: pct, skip: skip, by: by, bad: Object.keys(bad) };
    E.save(); applyPlacement();
    if (first) E.addStars(5, "diag");
    var lev = function (b) { return b[0] === b[1] ? 0 : b[0] * 2 >= b[1] ? 1 : 2; };
    var grp = [[], [], []]; order.forEach(function (t) { grp[lev(by[t])].push(t); });
    var G3 = [["✅", "Уже вмієш"], ["🌿", "Трохи підтягнемо"], ["🌱", "Почнемо звідси"]];
    var rows = G3.map(function (g, k) { return grp[k].length ? '<p style="margin:10px 0 2px"><b>' + g[0] + ' ' + g[1] + ':</b></p><p class="muted" style="margin:0">' + grp[k].map(esc).join(", ") + '</p>' : ""; }).join("");
    var text = "🧭 " + child().name + " — " + D.title + " (" + date + "): " + pct + "% (" + ok + " з " + r.res.length + " без підказки)\n" +
      order.map(function (t) { var b = by[t]; return G3[lev(b)][0] + " " + t + ": " + b[0] + "/" + b[1]; }).join("\n") +
      (skipT.length ? "\n⏭️ Знає (уроки можна пропустити): " + skipT.join("; ") : "") +
      (Object.keys(bad).length ? "\nНе вийшло: " + Object.keys(bad).map(function (s) { return E.SK[s] ? E.SK[s].title : s; }).join("; ") : "");
    $app.innerHTML = '<div class="card" style="text-align:center"><div class="celebrate">🎉</div><h2>Перевірку пройдено!</h2>' +
      '<p>' + (grp[0].length ? "Ти вже вмієш: <b>" + grp[0].length + " " + (grp[0].length === 1 ? "тему" : grp[0].length < 5 ? "теми" : "тем") + "</b> ✅" : "Тепер зрозуміло, з чого почати") + '</p>' +
      '<p class="muted">' + (SUB.strict ? "Уроки йдуть по черзі: знайомі теми пройдеш швидко, а на складних зупинимось довше." : "План уроків уже підлаштований під тебе.") + (first ? " +5 ⭐ за перевірку!" : "") + '</p></div>' +
      '<div class="card">' + rows +
      (skipT.length ? '<p style="margin-top:12px">⏭️ <b>Ці уроки можна пропустити</b> (або пройти для певності):<br>' + skipT.map(esc).join("<br>") + '</p>' : "") +
      '<div class="row"><button class="btn ghost full" id="send">📨 Надіслати батькам</button></div>' +
      '<div class="row"><button class="btn full" id="home">До уроків →</button></div></div>';
    $("send").onclick = function () { sendDad(text); };
    $("home").onclick = function () { renderHome(); toTop(); };
    toTop();
  }
  /* чи є в пам'яті пройдений тест (для поточної дитини або старий, до появи профілів — для Ані) */
  function testDone() {
    try {
      var a = JSON.parse(localStorage.getItem("eng7-diag-v1:" + E.cur()) || "null");
      if (a && a.done) return true;
      if (E.cur() === "anya") { var o = JSON.parse(localStorage.getItem("eng7-diag-v1") || "null"); if (o && o.done) return true; }
    } catch (e) {}
    return false;
  }
  /* наступний крок навчання: перший непройдений урок і його перший незроблений крок */
  function lessonTarget() {
    if (!PATH) return null;
    var next = null, last = null, num = 0;
    PATH.stages.forEach(function (s) { s.lessons.forEach(function (l) { num++; if (l.file) { last = { l: l, n: num }; var LL = E.lesson(l.id); if (!next && !(LL.stars > 0) && !LL.skip) next = { l: l, n: num }; } }); });
    var t = next || last;
    if (!t) return null;
    var cs = E.lesson(t.l.id).steps, sd = null, LS = stepsOf(cget(t.l.file));
    var byId = function (id) { for (var k = 0; k < LS.length; k++) if (LS[k].id === id) return LS[k]; return LS[LS.length - 1]; };
    for (var i = 0; i < LS.length; i++) if (!cs[LS[i].id]) { sd = LS[i]; break; }
    if (!next) sd = byId("practice"); // усе пройдено — ще вправи
    else if (!sd) sd = byId("test"); // кроки є, а тест не зданий
    t.step = sd.id; t.stepT = sd.t; t.next = !!next;
    t.label = next ? (sd.id === "explain" && !Object.keys(cs).length ? "Почати урок " + t.n : "Продовжити урок " + t.n + ": " + sd.t.toLowerCase()) : "🔁 Повторити урок " + t.n;
    return t;
  }
  function loadAll(cb) {
    var go = function () {
      var files = []; PATH.stages.forEach(function (s) { s.lessons.forEach(function (l) { if (l.file) files.push(l.file); }); });
      var extra = SUB.words ? [getJSON("words/sets.json").then(function (j) {
        if (!E.WSETS.length) { E.WSETS = j.sets; j.sets.forEach(function (x) { E.addDict(x.words); }); }
      })] : [];
      Promise.all(files.map(loadLesson).concat(extra)).then(cb, function () { failView(function () { loadAll(cb); }); });
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
      var wl = plan.words || !SUB.words ? [] : E.wordSession();
      var wd = new Date().getDay(), weekend = wd === 6 || wd === 0, rv = E.review();
      var withReview = (weekend && E.reviewSkills().length >= 2 && !plan.noReview) || plan.reviewPart;
      if (withReview) { plan.reviewPart = true; plan.review = plan.review || rv.done; }
      if (!plan.words && !wl.length) plan.words = true;
      if (!warm.length) plan.warm = true;   // ще нічого повторювати
      if (!mist.length) plan.mist = true;   // помилок немає
      E.save();
      var parts = [
        { id: "warm", ic: "🔥", t: "Розминка", s: plan.warm && warm.length ? "Зроблено" : warm.length ? warm.length + " " + tasksW(warm.length) + " на вже пройдене, вперемішку" : "Сьогодні не потрібна: ще нема що повторювати", done: plan.warm },
        { id: "lesson", ic: "📘", t: plan.lesson || !T ? "Крок уроку" : "Урок " + T.n + ": " + T.stepT.toLowerCase(), s: plan.lesson ? "Зроблено" : T ? T.l.title : "", done: plan.lesson },
        withReview ? { id: "review", ic: "🔁", t: "Повторення тижня", s: plan.review ? "Зроблено" : "По завданню з кожної пройденої теми · ~10 хв", done: plan.review } : null,
        !SUB.words ? null : { id: "words", ic: "🃏", t: "Слова", s: plan.words ? "Зроблено" : wl.length + " " + (wl.length === 1 ? "слово" : wl.length < 5 ? "слова" : "слів") + ": повторення і нові", done: plan.words },
        { id: "mist", ic: "📝", t: "Мої помилки", s: mist.length ? Math.min(mist.length, 5) + (SUB.kid ? (Math.min(mist.length, 5) === 1 ? " завдання" : " завдання") : (Math.min(mist.length, 5) < 5 ? " речення" : " речень")) + " виправити" : (E.P().mistakes.length ? "Усі помилки виправлено 🎉" : "Помилок поки немає 🙂"), done: plan.mist }
      ];
      parts = parts.filter(Boolean);
      var cur = null; parts.forEach(function (x) { if (!cur && !x.done) cur = x; });
      var allDone = !cur;
      if (allDone && !plan.paid) { plan.paid = true; E.save(); E.cnt("daysDone"); E.addStars(5, "day"); toast("⭐ +5 за заняття на сьогодні!"); }
      var n = E.todayCount(SUB.id);
      var html = '<div class="topbar"><button class="back" id="back">← Кабінет</button><span class="muted small" style="font-weight:700">' + SUB.ic + ' Заняття на сьогодні</span></div>' +
        '<div class="card' + (allDone ? '" style="text-align:center"' : '"') + '>' +
        (allDone ? '<div class="celebrate">🎉</div><h1>Заняття на сьогодні виконано!</h1><p class="muted">Ти молодець. Завтра буде нова розминка — серія днів росте 🔥</p>'
                 : '<h1>Заняття на сьогодні</h1><p class="muted">' + (withReview ? "Сьогодні вихідний — додалось повторення тижня." : SUB.words ? "Чотири коротких частини, приблизно 15–20 хвилин." : "Кілька коротких частин, приблизно 10–15 хвилин.") + '</p>') +
        goalBar(n, SUBJ.dailyGoal) + '</div><div class="card">';
      parts.forEach(function (x, i) {
        html += '<button class="lesson ' + (x.done ? "done" : x === cur ? "open" : "") + '" data-p="' + x.id + '"><span class="ic">' + (x.done ? "✅" : x.ic) + '</span>' +
          '<span><div class="lt">' + (i + 1) + '. ' + esc(x.t) + '</div><div class="ls">' + esc(x.s) + '</div></span></button>';
      });
      html += (allDone ? '<div class="row"><button class="btn ghost full" id="more">💪 Хочу ще: наступний крок уроку</button><button class="btn full" id="home">До кабінету</button></div>'
                       : '<div class="row"><button class="btn full" id="go2">' + (cur.id === "warm" ? "Почати розминку →" : cur.id === "lesson" ? "До уроку →" : cur.id === "words" ? "До слів →" : cur.id === "review" ? "До повторення →" : "Виправити помилки →") + '</button></div>') + '</div>';
      $app.innerHTML = html;
      var start = function (id) {
        if (id === "warm") return runPart("warm", warm.length ? warm : E.warmItems(5));
        if (id === "review") return runReview(function () { plan.review = true; E.save(); renderDaily(); });
        if (id === "words") {
          var list = E.wordSession();
          if (!list.length) { plan.words = true; E.save(); return renderDaily(); }
          $app.innerHTML = '<div class="topbar"><button class="back" id="back">← Заняття</button></div><div id="stage"></div>';
          $("back").onclick = function () { stopSay(); renderDaily(); toTop(); };
          return runWords($("stage"), list, function (r) {
            plan.words = true; E.save();
            showCard($("stage"), '<div class="celebrate">🃏</div><h2>Слова — готово!</h2><p class="muted">Згадала ' + r.ok + ' з ' + r.n + '</p>', "Далі →", function () { renderDaily(); });
          });
        }
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
  /* 🦖 Герой-маскот: росте за уроки, вдягається за зірки (зірки не витрачаються) */
  function dinoState() {
    var P = E.P(), d = P.dino || (P.dino = { name: "", color: "green", wear: {}, form: 0, items: 0, u: 0, v: 2 }), n = 0, tr = 0;
    if (!d.wear) d.wear = {};
    if (PATH) PATH.stages.forEach(function (s) { s.lessons.forEach(function (l) { var L = P.lessons[l.id]; if (L && (L.stars > 0 || L.skip)) n++; }); });
    for (var id in P.skills) if (E.ofSub(id) && P.skills[id].lvl >= 3) tr++;
    var stars = E.starsTotal(), items = DINO.unlocked(stars), f = DINO.form({ lessons: n, trees: tr });
    if (d.v !== 2) { // 17.11.2026: нові, складніші правила — перерахувати без тостів, зняти ще не відкриті речі
      d.form = f; d.items = items.length; d.v = 2;
      for (var sl in d.wear) if (!items.some(function (x) { return x.id === d.wear[sl]; })) delete d.wear[sl];
      dinoSave(d);
    }
    // 🌳 може знову стати 🌿 після помилки — але динозавр назад не зменшується
    return { d: d, lessons: n, trees: tr, stars: stars, form: Math.max(f, d.form || 0), items: items };
  }
  function dinoName(d) { return d.name || "Дино"; }
  function dinoSave(d) { d.u = Date.now(); E.save(); }
  /* новини: підріс / нова річ — тост і сама вдягається */
  function dinoNews() {
    var st = dinoState(), d = st.d, ch = false;
    if (st.form > (d.form || 0)) {
      toast(st.form === 1 ? "🐣 Вилупився динозаврик! Натисни на нього й дай ім'я" : "🎉 " + dinoName(d) + " підріс: " + DINO.FORMS[st.form].t + "!");
      d.form = st.form; ch = true;
    }
    if (st.items.length > (d.items || 0)) {
      var nw = st.items.slice(d.items || 0);
      nw.forEach(function (x) { d.wear[x.slot] = x.id; });
      if (st.form > 0) toast("🎁 Нова річ для " + dinoName(d) + ": " + nw[nw.length - 1].e + " " + nw[nw.length - 1].t + "!");
      d.items = st.items.length; ch = true;
    }
    if (ch) { dinoSave(d); if ($("dinoCard")) $("dinoCard").innerHTML = dinoInner(dinoState()); }
  }
  function dinoSay(st) {
    var d = st.d, nf = DINO.nextForm(st.form), ni = DINO.nextItem(st.stars), opts = [];
    if (st.form === 0) return "Я ще в яйці! Пройди перший урок — і я вилуплюся 🥚";
    if (nf && nf.trees) { var k = Math.max(1, nf.trees - st.trees); opts.push("Закріпи ще " + k + " " + (k === 1 ? "тему" : k < 5 ? "теми" : "тем") + " до 🌳 — і я підросту!"); }
    if (ni) opts.push("Ще " + (ni.at - st.stars) + " ⭐ — і в мене буде " + ni.t.toLowerCase() + "!");
    opts.push(G("Ти молодчина", "Ти молодець") + ", " + esc(E.P().name) + "! Порахуємо щось? 🦖");
    if (!d.name) opts.unshift("Привіт! Як мене звати? Натисни на мене 🙂");
    return opts[Math.floor(Math.random() * opts.length)];
  }
  function dinoInner(st) {
    return '<div class="dino-row">' + DINO.svg({ form: st.form, color: st.d.color, wear: st.d.wear, size: 104 }) +
      '<div class="dino-say"><b>' + esc(dinoName(st.d)) + '</b><div>' + dinoSay(st) + '</div></div></div>';
  }
  function dinoCard() { return '<div class="card dino-card" id="dinoCard" role="button">' + dinoInner(dinoState()) + '</div>'; }
  function renderDino() {
    var st = dinoState(), d = st.d, nf = DINO.nextForm(st.form), worn = {};
    for (var sl in d.wear) worn[d.wear[sl]] = 1;
    setTitle("Мій динозавр · " + child().name);
    var cf = DINO.FORMS[st.form], from = cf.trees || 0, fp = nf ? Math.max(0, Math.min(100, Math.round((st.trees - from) / (nf.trees - from) * 100))) : 100;
    $app.innerHTML = '<div class="topbar"><button class="back" id="back">← Назад</button></div>' +
      '<div class="card" style="text-align:center">' + DINO.svg({ form: st.form, color: d.color, wear: d.wear, size: 220 }) +
      '<h2 style="margin:4px 0">' + esc(dinoName(d)) + ' <button class="btn plain small" id="ren">✏️</button></h2>' +
      '<div id="renBox"></div>' +
      '<p class="muted" style="margin:2px 0 8px">' + cf.t + ' · закріплено тем 🌳: ' + st.trees + '</p>' +
      (st.form === 0 ? '<p class="small muted">Пройди перший урок — і динозаврик вилупиться.</p>' :
        nf ? '<div class="prog"><i style="width:' + fp + '%"></i></div><p class="small muted">Наступне: «' + nf.t + '» — коли буде ' + nf.trees + ' тем 🌳.<br>🌳 — тема, яку ти ' + G("розв\'язала", "розв\'язав") + ' правильно, а потім ще раз — іншого дня. Динозавр росте, коли знання тримаються!</p>' : '<p>👑 Найбільший і найсильніший!</p>') +
      '</div>' +
      '<div class="card"><h3 style="margin:0 0 4px">Гардероб</h3><p class="muted small" style="margin:0 0 10px">Речі відкриваються за зірки (у тебе ⭐ ' + st.stars + ' за весь час). Зірки не витрачаються — натискай, щоб вдягнути чи зняти.</p><div class="dino-items">' +
      DINO.ITEMS.map(function (x) {
        var open = st.stars >= x.at;
        return '<button class="dino-it' + (worn[x.id] ? " on" : "") + (open ? "" : " lock") + '" data-it="' + x.id + '"><span class="e">' + (open ? x.e : "🔒") + '</span><span>' + x.t + '</span><span class="small muted">' + (open ? (worn[x.id] ? "вдягнено" : "вдягнути") : x.at + " ⭐") + '</span></button>';
      }).join("") + '</div></div>' +
      '<div class="card"><h3 style="margin:0 0 8px">Колір</h3><div class="dino-cols">' +
      Object.keys(DINO.COLORS).map(function (k) { var c = DINO.COLORS[k]; return '<button class="dino-col' + (d.color === k ? " on" : "") + '" data-c="' + k + '" title="' + c.t + '" style="background:' + c.body + ';border-color:' + c.dark + '"></button>'; }).join("") + '</div></div>';
    $("back").onclick = function () { renderHome(); toTop(); };
    $("ren").onclick = function () {
      $("renBox").innerHTML = '<input id="nm" maxlength="14" placeholder="Ім\'я динозавра" value="' + esc(d.name || "") + '" style="max-width:220px"><div class="row" style="justify-content:center"><button class="btn" id="nmOk">Зберегти</button></div>';
      $("nm").focus();
      var ok = function () { var v = $("nm").value.replace(/\s+/g, " ").trim().slice(0, 14); d.name = v; dinoSave(d); toast(v ? "Привіт, " + v + "! 🦖" : "Ім'я прибрано"); renderDino(); };
      $("nmOk").onclick = ok; $("nm").onkeydown = function (e) { if (e.key === "Enter") ok(); };
    };
    var its = $app.querySelectorAll(".dino-it");
    for (var i = 0; i < its.length; i++) (function (b) {
      b.onclick = function () {
        var x = null; DINO.ITEMS.forEach(function (y) { if (y.id === b.getAttribute("data-it")) x = y; });
        if (st.stars < x.at) { toast("Ще " + (x.at - st.stars) + " ⭐ — і " + x.t.toLowerCase() + " твоя!"); return; }
        if (st.form === 0) { toast("Спершу динозаврик має вилупитися 🥚"); return; }
        if (d.wear[x.slot] === x.id) delete d.wear[x.slot]; else d.wear[x.slot] = x.id;
        dinoSave(d); renderDino();
      };
    })(its[i]);
    var cs = $app.querySelectorAll(".dino-col");
    for (var j = 0; j < cs.length; j++) (function (b) { b.onclick = function () { d.color = b.getAttribute("data-c"); dinoSave(d); renderDino(); }; })(cs[j]);
  }
  window.UI_DINO = renderDino; // для автоматичних перевірок

  /* ⚡ Блискавка: 60 секунд, приклади з пройдених тем, без підказок; помилки — в «Мої помилки» */
  function renderBlitz() {
    loadAll(function () {
      var info = E.blitzInfo(), last = info.hist.slice(-5).map(function (x) { return x.ok; });
      setTitle("Блискавка · " + child().name);
      $app.innerHTML = '<div class="topbar"><button class="back" id="back">← Назад</button></div><div class="card" id="stage" style="text-align:center">' +
        '<div class="celebrate">⚡</div><h2>Блискавка</h2>' +
        '<p>Скільки прикладів встигнеш розв\'язати за <b>60 секунд</b>?</p>' +
        '<p class="muted small">Приклади з тем, які ти вже ' + G("пройшла", "пройшов") + '. Змагаєшся тільки сам' + G("а", "") + ' з собою 🙂</p>' +
        (info.best ? '<p class="bl-rec">🏆 Твій рекорд: <b>' + info.best + '</b></p>' + (last.length > 1 ? '<p class="muted small">Останні спроби: ' + last.join(", ") + '</p>' : "") : '<p class="muted small">Перша спроба покаже твій рекорд — потім будеш його бити!</p>') +
        '<div class="row"><button class="btn full" id="go">▶️ Старт</button></div></div>';
      $("back").onclick = function () { renderHome(); toTop(); };
      $("go").onclick = function () { blitzCount(3); };
    });
  }
  function blitzCount(n) {
    document.body.classList.add("insession");
    $("stage").innerHTML = '<div class="bl-cd">' + n + '</div><p class="muted">Приготуйся…</p>';
    if (n > 1) setTimeout(function () { if ($("stage")) blitzCount(n - 1); }, 700);
    else setTimeout(function () { if ($("stage")) blitzRun(); }, 700);
  }
  function blitzRun() {
    var ids = E.blitzSkills(), used = {}, res = [], T = 60000, t0 = Date.now(), it = null, val = "", lock = false, over = false, tm = null, lastSk = "";
    $app.querySelector(".topbar").innerHTML = '<button class="back" id="back">✕ Зупинити</button>';
    $("back").onclick = function () { over = true; clearInterval(tm); document.onkeydown = null; renderBlitz(); toTop(); };
    function nextIt() {
      var tries = 0, x = null;
      while (!x && tries++ < 20) {
        var pool = ids.length > 1 ? ids.filter(function (id) { return id !== lastSk; }) : ids;
        var id = pool[Math.floor(Math.random() * pool.length)];
        x = E.pick(id, 1, used)[0];
        if (x && (x.type !== "num" || x.long || x.steps || String(x.p).indexOf("___") < 0)) x = null;
      }
      if (!x) { used = {}; x = E.pick(ids[0], 1, used)[0]; }
      used[x.key] = 1; lastSk = x.skill; return x;
    }
    function draw() {
      var ok = res.filter(function (r) { return r.ok; }).length;
      $("bl-n").textContent = "✓ " + ok;
      $("bl-p").innerHTML = esc(it.p).replace("___", '<b class="bl-v' + (val ? "" : " e") + '">' + (val || "?") + '</b>');
    }
    function show() { it = nextIt(); window.UI_CUR = it; val = ""; lock = false; $("bl-p").className = "bl-p"; draw(); }
    function tick() {
      var left = Math.max(0, T - (Date.now() - t0));
      if ($("bl-t")) { $("bl-t").textContent = Math.ceil(left / 1000); $("bl-bar").style.width = (left / T * 100) + "%"; if (left < 10000) $("bl-t").className = "bl-t low"; }
      if (left <= 0) end();
    }
    function press(k) {
      if (lock || over) return;
      if (k === "⌫") val = val.slice(0, -1);
      else if (k === "✓") { if (val) check(); return; }
      else if (val.length < 3) val = (val === "0" ? "" : val) + k;
      draw();
    }
    function check() {
      lock = true;
      var ok = String(+val) === String(it.a), cur = it;
      res.push({ it: cur, ok: ok, given: val });
      E.tick(SUB.id);
      if (ok) E.fixMistake(cur.key); else E.addMistake(cur, val);
      $("bl-p").className = "bl-p " + (ok ? "good" : "badv");
      if (!ok) $("bl-p").innerHTML = esc(cur.p).replace("___", '<s>' + esc(val) + '</s> <b class="bl-v">' + esc(cur.a) + '</b>');
      setTimeout(function () { if (!over) show(); }, ok ? 250 : 1100);
    }
    function end() {
      if (over) return; over = true; clearInterval(tm); document.onkeydown = null;
      var ok = res.filter(function (r) { return r.ok; }), bad = res.filter(function (r) { return !r.ok; });
      var r = E.blitzDone(ok.length, res.length);
      setTitle("Блискавка · " + child().name);
      $app.innerHTML = '<div class="card" id="stage" style="text-align:center">' +
        '<div class="celebrate">' + (r.rec ? "🏆" : "⚡") + '</div><h2>Час!</h2>' +
        '<div class="bl-big">' + ok.length + '</div><p class="muted" style="margin-top:0">' + (ok.length === 1 ? "правильний приклад" : ok.length % 10 >= 2 && ok.length % 10 <= 4 && (ok.length % 100 < 12 || ok.length % 100 > 14) ? "правильні приклади" : "правильних прикладів") + ' за 60 секунд</p>' +
        (r.rec && r.prev ? '<p class="bl-rec">🎉 Новий рекорд! Було ' + r.prev + ' — стало ' + ok.length + '. +2 ⭐</p>' :
          r.rec ? '<p class="bl-rec">Це твій перший рекорд. Спробуй його побити! 💪</p>' :
          '<p>Рекорд: <b>' + r.prev + '</b>. ' + (r.prev - ok.length <= 2 ? "Зовсім близько! 🔥" : "Ще трохи практики — і поб'єш! 💪") + '</p>') +
        (bad.length ? '<div class="tip" style="text-align:left"><b>Перевір себе</b> (ці приклади вже в «Моїх помилках»):<br>' + bad.map(function (x) { return "• " + esc(x.it.p.replace("___", x.it.a)) + ' <span class="muted">(було ' + esc(x.given) + ')</span>'; }).join("<br>") + '</div>' : res.length ? '<p>Жодної помилки — супер! 🌟</p>' : "") +
        '<div class="row"><button class="btn full" id="again">⚡ Ще раз</button></div><div class="row" style="margin-top:8px"><button class="btn ghost full" id="home">← На головну</button></div></div>';
      $("again").onclick = function () { renderBlitz(); toTop(); };
      $("home").onclick = function () { renderHome(); toTop(); };
    }
    $("stage").innerHTML = '<div class="bl-top"><span class="bl-n" id="bl-n">✓ 0</span><span class="bl-t" id="bl-t">60</span></div>' +
      '<div class="prog"><i id="bl-bar" style="width:100%"></i></div><div class="bl-p" id="bl-p"></div>' +
      '<div class="keypad' + (SUB.kid ? " k5" : "") + '" id="keypad">' + (SUB.kid ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, "⌫", "✓"] : [1, 2, 3, 4, 5, 6, 7, 8, 9, "⌫", 0, "✓"]).map(function (k) { return '<button class="key' + (k === "✓" ? " ok" + (it.kb === "geo" ? " wide" : "") : k === "⌫" ? " del" : "") + '" data-k="' + k + '">' + k + '</button>'; }).join("") + '</div>';
    var ks = $("stage").querySelectorAll(".key");
    for (var i = 0; i < ks.length; i++) (function (b) { b.onclick = function () { press(b.getAttribute("data-k")); }; })(ks[i]);
    document.onkeydown = function (e) { if (!$("bl-p")) return; if (/^[0-9]$/.test(e.key)) press(e.key); else if (e.key === "Backspace") press("⌫"); else if (e.key === "Enter") press("✓"); };
    show(); tm = setInterval(tick, 200);
  }
  window.UI_BLITZ = renderBlitz; // для автоматичних перевірок

  function renderMistakes() {
    loadAll(function () {
      var ms = E.openMistakes(), fixedN = 0, seenK = {};
      E.P().mistakes.forEach(function (m) { if (m.fixed && !seenK[m.key]) { seenK[m.key] = 1; fixedN++; } });
      var html = '<div class="topbar"><button class="back" id="back">← Кабінет</button><span class="muted small" style="font-weight:700">📝 Мої помилки</span></div>' +
        '<div class="card"><h1>Мої помилки</h1><p class="muted">Помилка — не біда, а підказка, що закріпити. Правильна відповідь прибирає ' + (SUB.kid ? "завдання" : "речення") + ' зі списку.</p>' +
        (fixedN ? '<div class="tip">Уже виправлено: <b>' + fixedN + '</b> 💪</div>' : "") +
        (ms.length ? '<div class="row"><button class="btn full" id="go2">Виправити ' + Math.min(ms.length, 5) + ' →</button></div>' : '<p style="font-weight:800">Невиправлених помилок немає 🎉</p>') + '</div>';
      if (ms.length) {
        html += '<div class="card"><div class="sklist">' + ms.map(function (m) {
          var it = E.ITEM[m.key], sk = E.SK[it.skill];
          return '<div style="display:block"><div style="font-weight:700">' + pText(it, true) + '</div>' +
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

  /* ================== ПОВТОРЕННЯ ТИЖНЯ ================== */
  function runReview(back) {
    loadAll(function () {
      var items = E.reviewItems(12);
      if (!items.length) { back(); return; }
      $app.innerHTML = '<div class="topbar"><button class="back" id="back">← Назад</button><span class="muted small" style="font-weight:700">🔁 Повторення тижня</span></div><div id="stage"></div>';
      $("back").onclick = function () { stopSay(); back(); toTop(); };
      runSession($("stage"), { items: items, mode: "review", onDone: function (s) {
        var by = {};
        s.res.forEach(function (r) { var id = r.it.skill; if (!by[id]) by[id] = { ok: 0, n: 0 }; by[id].n++; if (r.ok) by[id].ok++; });
        E.reviewDone(s.score, s.max, by);
        var good = [], weak = [];
        Object.keys(by).forEach(function (id) { (by[id].ok === by[id].n ? good : weak).push(id); });
        var name = function (id) { return E.SK[id] ? E.SK[id].title : id; };
        $("stage").innerHTML = '<div class="card" style="text-align:center"><div class="celebrate">🔁</div><h2>Повторення тижня — готово!</h2><p class="muted">' + fmt(s.score) + ' з ' + s.max + ' балів</p>' +
          (good.length ? '<div class="tip" style="text-align:left;background:var(--ok-soft)"><b>Тримається 💪</b><br>' + good.map(function (id) { return "• " + esc(name(id)); }).join("<br>") + '</div>' : "") +
          (weak.length ? '<div class="tip" style="text-align:left"><b>Варто освіжити</b> (ці ' + (SUB.kid ? "завдання" : "речення") + ' вже в «Моїх помилках»)<br>' + weak.map(function (id) { return "• " + esc(name(id)); }).join("<br>") + '</div>' : '<p>Усе пам\'ятаєш — супер! 🔥</p>') +
          '<div class="row"><button class="btn ghost full" id="copy">📨 Надіслати батькам у Telegram</button><button class="btn full" id="go">Далі →</button></div></div>';
        $("copy").onclick = function () {
          var P = E.P(), d = new Date().toLocaleDateString("uk-UA");
          var text = [P.name + " — повторення тижня, " + d, "Результат: " + fmt(s.score) + " з " + s.max,
            good.length ? "Тримається:\n" + good.map(function (id) { return "• " + name(id); }).join("\n") : "",
            weak.length ? "Варто освіжити:\n" + weak.map(function (id) { return "• " + name(id); }).join("\n") : "Усе пам'ятає!"].filter(Boolean).join("\n");
          sendDad(text);
        };
        $("go").onclick = function () { back(); toTop(); };
      } });
      toTop();
    });
  }

  /* ================== МОЇ СЛОВА ================== */
  function renderWords() {
    loadAll(function () {
      var P = E.P(), ws = P.words || {}, due = E.wordsDue().length, learned = E.wordsLearned();
      if (!P.wset && E.WSETS.length) { P.wset = E.WSETS[0].id; E.save(); }
      var html = '<div class="topbar"><button class="back" id="back">← Кабінет</button><span class="muted small" style="font-weight:700">🃏 Мої слова</span></div>' +
        '<div class="card"><h1>Мої слова</h1><div class="stats"><span class="stat">🌳 вивчено ' + learned + '</span><span class="stat">🔁 на сьогодні ' + due + '</span></div>' +
        '<p class="muted small" style="margin-top:10px">Слово, яке знаєш, повертається рідше: через 1, 2, 4, 8, 16 днів. Не згадала — завтра знову, це нормально.</p>' +
        '<div class="row"><button class="btn full" id="go2">Тренувати слова · ~5 хв</button></div></div><div class="card"><h2>Теми</h2>';
      E.WSETS.forEach(function (st) {
        var tot = st.words.length, added = 0, lr = 0;
        st.words.forEach(function (x) { var w = ws[x[0]]; if (w) { added++; if (w.box >= 4) lr++; } });
        var on = P.wset === st.id;
        html += '<button class="lesson ' + (on ? "open" : lr === tot ? "done" : "") + '" data-set="' + st.id + '"><span class="ic">' + st.ic + '</span><span style="flex:1"><div class="lt">' + esc(st.title) + (on ? " · зараз вчу" : "") + '</div>' +
          '<div class="ls">вивчено ' + lr + ' з ' + tot + (added > lr ? " · у роботі " + (added - lr) : "") + '</div><div class="prog" style="margin:6px 0 0"><i style="width:' + Math.round(lr / tot * 100) + '%"></i></div></span></button>';
      });
      html += '<p class="muted small">Натисни на тему, щоб нові слова брались з неї.</p></div>';
      $app.innerHTML = html;
      $("back").onclick = function () { renderHome(); toTop(); };
      $("go2").onclick = function () {
        var list = E.wordSession();
        $app.innerHTML = '<div class="topbar"><button class="back" id="back">← Мої слова</button></div><div id="stage"></div>';
        $("back").onclick = function () { stopSay(); renderWords(); toTop(); };
        runWords($("stage"), list, function (r) {
          showCard($("stage"), '<div class="celebrate">🃏</div><h2>Слова на сьогодні — готово!</h2><p class="muted">Згадала ' + r.ok + ' з ' + r.n + '</p>', "До слів →", function () { renderWords(); });
        });
        toTop();
      };
      var bs = $app.querySelectorAll("[data-set]");
      for (var i = 0; i < bs.length; i++) (function (b) { b.onclick = function () { P.wset = b.getAttribute("data-set"); E.save(); renderWords(); }; })(bs[i]);
    });
  }
  /* Тренування слів. Режим залежить від коробки:
     нове / коробка 1 — картка «згадай переклад»; 2–3 — напиши англійською; 4+ — на слух (якщо є озвучка). */
  function runWords(root, list, done) {
    var q = list.slice(), again = {}, res = { n: 0, ok: 0 };
    if (!q.length) return done(res);
    var total = q.length, k = 0;
    function next() {
      if (!q.length) return done(res);
      var en = q.shift(), ua = E.DICT[en] || "", box = E.wordBox(en);
      window.UI_CUR = { en: en }; // для автоматичних перевірок
      var mode = box <= 1 ? "card" : box <= 3 || !canSpeak ? "type" : (Math.random() < 0.5 ? "listen" : "type");
      if (again[en] && mode === "card") mode = "card";
      k++;
      var chip = '<span class="chip">🃏 Слова · ' + Math.min(k, total) + ' з ' + total + '</span>' + (box ? '<span class="skillTag">коробка ' + box + ' з 5</span>' : '<span class="skillTag">нове слово ✨</span>');
      var fin = function (ok) {
        E.tick(SUB.id);
        if (!again[en]) { res.n++; if (ok) res.ok++; }
        E.wordAnswer(en, ok);
        if (!ok && !again[en]) { again[en] = 1; q.push(en); } // ще раз наприкінці
      };
      if (mode === "card") {
        var isNew = !(E.P().words || {})[en] || !(E.P().words[en].n);
        root.innerHTML = '<div class="card">' + chip + '<p class="muted" style="margin:6px 0 4px">' + (isNew ? "🆕 Нове слово! Послухай, переверни картку й запам'ятай." : "Згадай переклад і переверни картку.") + '</p>' +
          '<div class="flash" id="fl"><div class="flash-in"><div class="face front"><div class="word">' + esc(en) + '</div>' + (canSpeak ? '<button class="say" data-say="' + esc(en) + '">🔊 Послухати</button>' : "") + '<div class="sub">натисни, щоб перевернути</div></div>' +
          '<div class="face back"><div class="word" style="color:var(--pri-ink)">' + esc(ua) + '</div><div class="sub" style="color:var(--muted)">' + esc(en) + '</div>' + (canSpeak ? '<button class="say" data-say="' + esc(en) + '">🔊</button>' : "") + '</div></div></div>' +
          '<div class="row" id="btns" style="visibility:hidden"><button class="btn ghost" id="no">↺ Ще вчу</button><button class="btn okb" id="yes">✓ Знаю</button></div></div>';
        bindSay(root);
        $("fl").onclick = function () { $("fl").classList.toggle("flipped"); $("btns").style.visibility = "visible"; };
        $("yes").onclick = function () { fin(true); next(); };
        $("no").onclick = function () { fin(false); next(); };
        if (canSpeak) setTimeout(function () { say(en); }, 150);
        return;
      }
      var typoUsed = false;
      root.innerHTML = '<div class="card">' + chip +
        (mode === "listen" ? '<div class="prompt">🎧 Послухай і напиши слово</div><div class="row" style="margin-top:0"><button class="btn ghost" id="pl">🔊 Послухати</button><button class="btn ghost" id="sl">🐢 Повільно</button></div><p class="muted small" style="margin:6px 0 10px">Не чути? Вимкни беззвучний режим 🔕 і додай гучність.</p>'
                           : '<div class="task">Напиши англійською:</div><div class="prompt">' + esc(ua) + '</div>') +
        '<input id="inp" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="англійською"><div id="almost"></div>' +
        '<div class="row" id="chk"><button class="btn full" id="check" disabled>Перевірити</button></div><div class="row" id="aux"><button class="btn plain" id="idk">🤷 Не пам\'ятаю</button></div><div id="fb"></div></div>';
      if (mode === "listen") { $("pl").onclick = function () { say(en); }; $("sl").onclick = function () { say(en, 0.55); }; say(en); }
      var inp = $("inp"), ch = $("check");
      var check = function (given) {
        var st = given == null ? "wrong" : E.checkWord(en, given);
        if (st === "typo" && !typoUsed) { typoUsed = true; $("almost").innerHTML = '<div class="almost">✏️ Майже! Перевір написання 🙂</div>'; return; }
        var ok = st === "ok" || st === "typo";
        fin(ok);
        inp.disabled = true; $("chk").parentNode.removeChild($("chk")); $("aux").parentNode.removeChild($("aux")); $("almost").innerHTML = "";
        $("fb").innerHTML = '<div class="fb ' + (ok ? "ok" : "bad") + '"><h3>' + (ok ? (st === "typo" ? "Правильно! Лише перевір написання ✏️" : "Правильно! 🎉") : given == null ? "Нічого страшного 🙂" : "Майже! Запам'ятаймо 🙂") + '</h3>' +
          '<div><b>' + esc(en) + '</b> — ' + esc(ua) + '</div>' + (!ok ? '<div class="muted small" style="margin-top:6px">Це слово повернеться ще раз наприкінці і завтра.</div>' : "") +
          (canSpeak ? '<div style="margin-top:10px"><button class="say" data-say="' + esc(en) + '">🔊 Послухати</button></div>' : "") + '</div>' +
          '<div class="row"><button class="btn full" id="next">Далі →</button></div>';
        bindSay(root); if (canSpeak) say(en);
        $("next").onclick = function () { stopSay(); next(); };
      };
      inp.oninput = function () { ch.disabled = !inp.value.trim(); if (typoUsed) $("almost").innerHTML = ""; };
      inp.onkeydown = function (e) { if (e.key === "Enter" && inp.value.trim()) check(inp.value); };
      ch.onclick = function () { check(inp.value); };
      $("idk").onclick = function () { check(null); };
      setTimeout(function () { try { inp.focus({ preventScroll: true }); } catch (e) {} }, 50);
    }
    next();
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
  /* кроки уроку: за замовчуванням усі п'ять; урок може задати свої (математика: правило → тренування → перевірка) */
  function stepsOf(L) { var ids = L && L.steps; return ids ? STEPS.filter(function (s) { return ids.indexOf(s.id) >= 0; }) : STEPS; }

  function openLesson(file, stepId) {
    loadingView();
    loadLesson(file).then(function (L) { LES = L; renderLesson(stepId); toTop(); }, function () { failView(function () { openLesson(file, stepId); }); });
  }
  function stepAvailable(i) { var LS = stepsOf(LES), st = E.lesson(LES.id).steps; return i === 0 || st[LS[i - 1].id] || st[LS[i].id]; }
  function renderLesson(stepId) {
    setTitle(LES.title + " · " + SUB.title);
    var st = E.lesson(LES.id).steps, LS = stepsOf(LES);
    if (stepId && !LS.some(function (s) { return s.id === stepId; })) stepId = null;
    if (!stepId) { var f = null; for (var i = 0; i < LS.length; i++) if (!st[LS[i].id]) { f = LS[i]; break; } stepId = f ? f.id : LS[0].id; }
    var idx = 0; LS.forEach(function (s, i) { if (s.id === stepId) idx = i; });
    var stepsHtml = LS.map(function (s, i) {
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
    if (DAILY && BIG[stepsOf(LES)[idx].id]) { renderDaily(); toTop(); return; }
    var LS = stepsOf(LES), n = LS[idx + 1]; if (n) renderLesson(n.id); else renderHome(); toTop();
  }

  /* --- 1. Правило --- */
  function stepExplain(root, idx) {
    var k = 0, X = LES.explain;
    function draw() {
      var c = X[k];
      root.innerHTML = '<div class="card"><span class="chip">Правило · ' + (k + 1) + ' з ' + X.length + '</span>' +
        '<div class="big-emoji">' + c.e + '</div><h2>' + c.h + '</h2>' + ukBtn(c.h + ". " + c.html) +
        (c.anim && window.EXPLAIN && EXPLAIN.list[c.anim] ? '<button class="btn full ex-btn" id="anim">🎬 Подивитись, звідки це береться</button>' : "") + c.html +
        '<div class="dots">' + X.map(function (_, i) { return '<i class="' + (i === k ? "on" : "") + '"></i>'; }).join("") + '</div>' +
        '<div class="row">' + (k > 0 ? '<button class="btn ghost" id="prev">←</button>' : "") +
        '<button class="btn" id="nx" style="flex:3">' + (k < X.length - 1 ? "Далі →" : "Зрозуміло! " + ({ examples: "До прикладів", practice: "До вправ", test: "До тесту" }[(stepsOf(LES)[idx + 1] || {}).id] || "Далі") + " →") + '</button></div></div>';
      bindSay(root);
      if ($("anim")) $("anim").onclick = function () { stopSay(); EXPLAIN.play(root, c.anim, function () { draw(); toTop(); }); toTop(); };
      if ($("prev")) $("prev").onclick = function () { k--; draw(); toTop(); };
      $("nx").onclick = function () { if (k < X.length - 1) { k++; draw(); toTop(); } else { completeStep("explain"); nextStep(idx); } };
    }
    draw();
  }

  /* --- 2. Приклади --- */
  function stepExamples(root, idx) {
    var ex = LES.examples;
    root.innerHTML = '<div class="card"><span class="chip">Приклади</span><h2>🎧 ' + esc(ex.title) + '</h2>' +
      '<p class="muted">' + (ex.tip || "Натисни 🔊, послухай і повтори вголос. Зверни увагу на виділені слова.") + '</p>' +
      (canSpeak ? '<button class="btn ghost full" id="all" style="margin-bottom:8px">▶️ Послухати все</button>' : "") +
      ex.items.map(function (x) { return '<div class="ex"><div><div class="en">' + x[0] + '</div><div class="ua">' + x[1] + '</div></div><button class="say round" data-say="' + esc(strip(x[0])) + '">🔊</button></div>'; }).join("") +
      (ex.question ? '<div class="tip">🤔 <b>Питання на кмітливість:</b> ' + ex.question.q + ' <span id="ans" style="display:none">' + ex.question.a + '</span> <button class="say" id="showAns">Відповідь</button></div>' : "") +
      '<div class="row"><button class="btn full" id="nx">До вправ →</button></div></div>';
    bindSay(root);
    if ($("showAns")) $("showAns").onclick = function (e) { $("ans").style.display = "inline"; e.target.parentNode.removeChild(e.target); };
    if ($("all")) $("all").onclick = function () {
      SAY.list(ex.items.map(function (x) { return strip(x[0]); }));
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
    if (it.p.indexOf("___") >= 0) {
      var r = /^—/.test(right) ? "" : right; // «— (нічого)»: артикль не потрібен
      return cap(it.p.replace("___", r).replace(/\s*\(.*?\)\s*$/, "").replace(/\s+/g, " ").trim());
    }
    return right;
  }
  function showTask(root, it, cfg) {
    var hints = hintsOf(it), used = 0, answered = false, typoUsed = false, built = [];
    var pre = Math.min(cfg.pre || 0, hints.length);
    var sk = E.SK[it.skill];
    E.markSeen(it);
    window.UI_CUR = it; // для автоматичних перевірок
    var body = "";
    if (it.type === "choice") body = '<div class="opts">' + it.o.map(function (o, k) { return '<button class="opt' + (it.o.some(function (x) { return String(x).length > 14; }) ? " sm" : "") + '" data-k="' + k + '">' + esc(o) + '</button>'; }).join("") + '</div>';
    if (it.type === "dict") body = '<div class="row" style="margin-top:0"><button class="btn ghost" id="play">🔊 Послухати</button><button class="btn ghost" id="slow">🐢 Повільно</button></div><p class="muted small" style="margin:6px 0 10px">Не чути? Вимкни беззвучний режим 🔕 (перемикач збоку на iPhone) і додай гучність.</p>';
    if (it.type === "fix") body = '<div class="pool fixw">' + it.p.split(" ").map(function (w, k) { return '<button class="w" data-k="' + k + '">' + esc(w) + '</button>'; }).join("") + '</div>';
    if (it.type === "input" || it.type === "dict") body += '<input id="inp" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Твоя відповідь"><div id="almost"></div><div class="row" id="chkrow"><button class="btn full" id="check" disabled>Перевірити</button></div>';
    if (it.type === "num") body = (it.steps ? '<div class="stps">' + it.steps.map(function (st, k) { return '<div class="stp' + (k ? "" : " cur") + '" id="stp' + k + '"><span class="sq">' + (k + 1) + ') ' + esc(st.q) + '</span> <b class="sv" id="sv' + k + '">' + (k ? "" : "?") + '</b></div>'; }).join("") + '</div>' : "") +
      '<div class="numbox" id="numbox"></div><div id="almost"></div><div class="keypad' + (SUB.kid ? " k5" : it.kb ? " alg" : "") + '" id="keypad">' +
      (SUB.kid ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, "⌫", "✓"] : it.kb === "geo" ? [1, 2, 3, "⌫", 4, 5, 6, ",", 7, 8, 9, 0, "✓"] : it.kb ? [1, 2, 3, "⌫", 4, 5, 6, "−", 7, 8, 9, "/", ",", 0, "␣", "✓"] : [1, 2, 3, 4, 5, 6, 7, 8, 9, "⌫", 0, "✓"]).map(function (k) { var al = { "⌫": "Стерти", "✓": "Перевірити", "−": "Мінус", "/": "Дробова риска", ",": "Кома", "␣": "Пробіл для мішаного числа" }[k]; return '<button class="key' + (k === "✓" ? " ok" + (it.kb === "geo" ? " wide" : "") : k === "⌫" ? " del" : "") + '" data-k="' + k + '"' + (al ? ' aria-label="' + al + '"' : "") + '>' + k + '</button>'; }).join("") + '</div>';
    if (it.type === "order") body = '<div class="built empty" id="built"></div><div class="pool" id="pool">' + it.words.map(function (w, k) { return '<button class="w" data-k="' + k + '">' + esc(w) + '</button>'; }).join("") + '</div><div class="row" id="chkrow"><button class="btn full" id="check" disabled>Перевірити</button></div>';
    document.body.classList.add("insession");
    root.innerHTML = (cfg.onBack ? '<div class="topbar"><button class="back" id="qback">← Перервати</button><span class="muted small">прогрес збережено</span></div>' : "") + '<div class="card"><span class="chip">' + cfg.chip + '</span>' +
      (sk && !cfg.quiet ? '<span class="skillTag">' + lvl(it.skill).e + ' ' + esc(sk.title) + '</span>' : "") +
      '<div class="prog"><i style="width:' + Math.round((cfg.prog || 0) * 100) + '%"></i></div>' +
      (it.task ? '<div class="task">' + it.task + ':' + (it.read ? ' <button class="say" id="readIt">🔊 Прочитай</button>' : "") + '</div>' : "") +
      (it.pic ? '<div class="pic">' + it.pic + '</div>' : "") +
      (it.type === "dict" ? '<div class="prompt">🎧 Що ти чуєш?</div>' : it.type === "fix" ? "" : '<div class="prompt' + (it.type === "num" || SUB.kid ? " big" : "") + (it.kb ? " alg" : "") + (it.long ? " long" : "") + '">' + esc(it.p).replace("___", '<span class="blank" id="blank"></span>') + '</div>') + (it.kb ? '<div id="hints"></div>' : "") + body +
      (it.kb ? "" : '<div id="hints"></div>') + '<div class="row" id="aux"><button class="btn ghost" id="hintBtn"' + (cfg.noHint ? ' style="display:none"' : "") + '>💡 Підказка</button><button class="btn plain" id="idk">🤷 Не знаю</button></div>' +
      '<div id="fb" aria-live="polite"></div></div>';

    function addHint() {
      if (answered || used >= hints.length) return;
      $("hints").insertAdjacentHTML("beforeend", '<div class="hint"><b>Підказка ' + (used + 1) + ':</b> ' + hints[used] + (SUB.kid ? " " + ukBtn(hints[used]) : "") + '</div>');
      bindSay($("hints"));
      used++;
      if (used >= hints.length) { var b = $("hintBtn"); b.disabled = true; b.textContent = "💡 Більше немає"; }
    }
    for (var p = 0; p < pre; p++) addHint();

    function finish(given, btn, forced) {
      if (answered) return;
      var c = forced || E.check(it, given), spellNote = false;
      if (c.st === "typo" && !typoUsed) {
        typoUsed = true;
        $("almost").innerHTML = '<div class="almost">' + (c.msg || "✏️ Майже! Перевір написання і спробуй ще раз 🙂") + '</div>';
        if (it.kb && typeof show === "function") { val = ""; show(); }
        var inp0 = $("inp"); try { inp0.focus(); } catch (e) {}
        return;
      }
      if (c.st === "typo" && it.kb) c = { st: "wrong", right: c.right, msg: "Значення правильне, але дріб треба скоротити до кінця: <b>" + esc(c.right) + "</b>." };
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
      if ($("keypad")) $("keypad").parentNode.removeChild($("keypad"));
      if ($("numbox") && $("numbox").classList.contains("show")) $("numbox").classList.add(ok ? "good" : "badv");
      if (it.steps && $("stp" + si) && !$("stp" + si).classList.contains("bad")) { $("stp" + si).classList.remove("cur"); $("stp" + si).classList.add(ok ? "ok" : "bad"); if (given == null) $("sv" + si).textContent = "?"; }
      if (it.type === "num" && $("blank")) { $("blank").textContent = given == null ? "?" : given; $("blank").classList.add(ok ? "good" : "badv"); }
      if ($("chkrow")) $("chkrow").parentNode.removeChild($("chkrow"));
      if ($("almost")) $("almost").innerHTML = "";
      $("aux").parentNode.removeChild($("aux"));
      var full = fullSentence(it, c.right), h;
      if (ok) {
        h = '<div class="fb ok"><h3>' + (spellNote ? "Правильно! Лише перевір написання ✏️" : used ? "Правильно! 👍" : ["Правильно! 🎉", "Так тримати! ⭐", "Чудово! 💪", "Супер! 🚀"][Math.floor(Math.random() * 4)]) + '</h3>' +
          (spellNote ? '<div>Пишеться так: <b>' + esc(c.right) + '</b></div>' : "") +
          (it.type === "fix" ? '<div>Правильно: <b>' + esc(c.right) + '</b></div>' : "") + '<div>' + it.e + '</div>';
      } else if (cfg.quiet) {
        h = '<div class="fb calm"><h3>' + (given == null ? "Добре, що чесно 👌" : "Записали 👌") + '</h3><div>' + (cfg.calm || "Розберемо в уроках — для цього перевірка й потрібна.") + '</div>' +
          '<details style="margin-top:8px"><summary>Показати розв\'язок</summary><div style="margin-top:6px">Правильно: <b>' + esc(c.right) + '</b></div><div style="margin-top:4px">' + it.e + '</div></details>';
      } else {
        h = '<div class="fb bad"><h3>' + (given == null ? "Нічого страшного, розберімо 🙂" : c.msg || !SUB.words ? (c.msg ? "Майже! Розберімо 🙂" : "Не зовсім — розберімо 🙂") : "Майже! Розберімо 🙂") + '</h3>' +
          (c.msg ? '<div>' + c.msg + '</div>' : given != null ? '<div>Твоя відповідь: <b>' + esc(given) + '</b></div>' : "") +
          '<div style="margin-top:6px">Правильно: <b>' + esc(it.type === "order" ? full : c.right) + '</b></div>' +
          '<div class="rule"><b>' + (SUB.words ? "Правило" : "Розбір") + ':</b> ' + it.e + '</div>';
      }
      h += (canSpeak && /[a-z]/i.test(full) && SUB.words ? '<div style="margin-top:12px"><button class="say" data-say="' + esc(full) + '">🔊 Послухати</button></div>' : "") +
        (SUB.kid ? '<div style="margin-top:10px">' + ukBtn((ok ? "Правильно! " : "Правильна відповідь: " + c.right + ". ") + (c.msg && !ok ? c.msg + ". " : "") + it.e) + '</div>' : "") + '</div>' +
        '<div class="row"><button class="btn full" id="next">' + cfg.nextLabel(ok) + '</button></div>' +
        '<button class="report" id="rep">🚩 Тут, здається, помилка</button>';
      $("fb").innerHTML = h; bindSay(root);
      $("rep").onclick = function () { E.reportIssue(it, given); this.textContent = "Дякую! Батьки перевірять 👍"; this.disabled = true; };
      var nx = $("next");
      nx.onclick = function () { stopSay(); cfg.done({ ok: ok, clean: clean, given: given, st: c.st, it: it }); toTop(); };
      setTimeout(function () { try { nx.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) {} }, 80);
    }
    $("hintBtn").onclick = addHint;
    if (cfg.onBack) $("qback").onclick = function () { stopSay(); cfg.onBack(); };
    if ($("readIt")) $("readIt").onclick = function () { SAY.uk(it.read); };
    if (it.type === "num") {
      var val = "", box = $("numbox"), blank = $("blank"), si = 0, NS = it.steps ? it.steps.length : 0, retried = {};
      if (NS) blank = $("sv0"); // задача «крок за кроком»: кожна дія — свій рядок
      else if (!blank) box.classList.add("show"); // у задачах нема пропуску ___ — показуємо окреме поле відповіді
      var show = function () { box.innerHTML = '<span class="nl">Відповідь:</span> <b>' + (val || "?") + "</b>"; box.classList.toggle("empty", !val); if (blank) { blank.textContent = val || (NS ? "?" : ""); blank.classList.toggle("filled", !!val); } };
      var press = function (k) {
        if (answered) return;
        if (k === "⌫") val = val.slice(0, -1);
        else if (k === "✓") {
          if (!val || (it.kb && !E.ratOf(val))) return;
          if (NS && si < NS - 1) {
            var st = it.steps[si], row = $("stp" + si);
            var stOk = it.kb ? (function () { var g = E.ratOf(val), r = E.ratOf(st.a); return g && r && g.n * r.d === r.n * g.d; })() : E.norm(val) === E.norm(st.a);
            if (!stOk) {
              if (!retried[si]) { // перша помилка в дії — ще одна спроба з підказкою, не завершуємо задачу
                retried[si] = 1; used = Math.max(used, 1); val = "";
                row.classList.add("try");
                $("hints").insertAdjacentHTML("beforeend", '<div class="hint"><b>Перевір ' + (si + 1) + '-' + (it.kb ? "й крок" : "шу дію") + ':</b> ' + esc(st.q) + ' ' + (st.tip || "Подумай, яку дію тут зробити — додати, відняти, помножити чи поділити.") + (SUB.kid ? " " + ukBtn("Перевір " + (si + 1) + "-шу дію. " + st.q + " Подумай, яку дію тут зробити.") : "") + '</div>');
                bindSay($("hints")); show(); return;
              }
              row.classList.add("bad");
              return finish(val, null, { st: "wrong", right: E.answersOf(it)[0], msg: "У " + (si + 1) + (it.kb ? "-му кроці (" : "-й дії (") + esc((st.q.charAt(0).toLowerCase() + st.q.slice(1)).replace(/\?$/, "")) + ") має вийти <b>" + st.a + "</b>" + (st.how ? ": " + st.how : "") + "." });
            }
            row.classList.remove("cur"); row.classList.remove("try"); row.classList.add("ok");
            si++; val = ""; blank = $("sv" + si); $("stp" + si).classList.add("cur"); show();
            return;
          }
          finish(val); return;
        }
        else if (it.kb) { // алгебра: «−» перемикає знак, одна кома, одна риска, без ділення на 0
          if (val.length >= 9) return;
          if (k === "−") val = val.charAt(0) === "−" ? val.slice(1) : "−" + val;
          else if (k === ",") { if (!/\d$/.test(val) || /,|\//.test(val)) return; val += ","; }
          else if (k === "/") { if (!/\d$/.test(val) || /[,/]/.test(val)) return; val += "/"; }
          else if (k === "␣") { if (!/\d$/.test(val) || /[ ,/]/.test(val)) return; val += " "; }
          else { if (k === "0" && /\/$/.test(val)) return; val = (val === "0" ? "" : val === "−0" ? "−" : val) + k; }
        }
        else if (val.length < 4) val = (val === "0" ? "" : val) + k;
        if (typoUsed && $("almost")) $("almost").innerHTML = "";
        show();
      };
      var ks = root.querySelectorAll(".key");
      for (var q2 = 0; q2 < ks.length; q2++) (function (b) { b.onclick = function () { press(b.getAttribute("data-k")); }; })(ks[q2]);
      // з клавіатури комп'ютера теж можна
      document.onkeydown = function (e) {
        if (!$("keypad") || answered) return;
        if (/^[0-9]$/.test(e.key) || e.key === "Backspace" || e.key === "Enter" || (it.kb && /^[-−,./ ]$/.test(e.key))) { try { e.preventDefault(); } catch (er) {} }
        if (/^[0-9]$/.test(e.key)) press(e.key); else if (e.key === "Backspace") press("⌫"); else if (e.key === "Enter") press("✓");
        else if (it.kb && it.kb !== "geo" && (e.key === "-" || e.key === "−")) press("−"); else if (it.kb && (e.key === "," || e.key === ".")) press(","); else if (it.kb && it.kb !== "geo" && e.key === "/") press("/"); else if (it.kb && it.kb !== "geo" && e.key === " ") press("␣");
      };
      show();
    }
    $("idk").onclick = function () { finish(null); };
    if (it.type === "choice") {
      document.onkeydown = function (e) { if (answered) return; var n = +e.key; if (n >= 1 && n <= it.o.length && !e.metaKey && !e.ctrlKey) { var b = root.querySelector('.opt[data-k="' + (n - 1) + '"]'); if (b) b.click(); } };
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
        w.steps.slice(0, k).map(function (s, i) { return '<div class="wstep' + (i === k - 1 ? ' new' : '') + '"><span class="n">' + (i + 1) + '</span>' + s + '</div>'; }).join("") + ukBtn(w.steps[k - 1]) +
        '<div class="row"><button class="btn full" id="go">' + (k < w.steps.length ? "Далі крок →" : G("Тепер сама 💪 →", "Тепер сам 💪 →")) + '</button></div></div>';
      bindSay(root);
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
    var isP = o.mode === "practice" || o.mode === "fix";
    var CHIP = { fix: "💪 Закріплюємо", practice: "✍️ Вправи", test: "🏆 Міні-тест", warm: "🔥 Розминка", mist: "📝 Мої помилки", review: "🔁 Повторення тижня" };

    function rec(it, r) {
      E.tick(SUB.id);
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
    var shownW = {};
    function cycle(it, cont) {
      var sk = E.SK[it.skill];
      if (shownW[it.skill]) return series(it, 1, cont); // розбір уже бачили в цій сесії — не повторюємо
      shownW[it.skill] = 1;
      showWorked(root, sk, function () { series(it, 1, cont); });
    }
    function series(failed, attempt, cont) {
      var sk = E.SK[failed.skill];
      var items = failed.type === "choice" && failed.gen ? E.pick(failed.skill, 1, used, failed.key, failed).concat(E.pick(failed.skill, 2, used, failed.key)) // вибір: не лише та сама правильна відповідь, а суміш
        : E.pick(failed.skill, 3, used, failed.key, failed); // задачі тієї ж будови, що й та, де була помилка
      items.forEach(function (x) { used[x.key] = 1; });
      if (items.length < 2) E.pick(failed.skill, 3 - items.length, used, failed.key).forEach(function (x) { used[x.key] = 1; items.push(x); }); // мало задач цієї будови — доберемо інші тієї ж навички
      if (!items.length) items = [failed]; // крайній випадок: повторюємо те саме завдання
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
        if (okc >= 2 || (items.length && items.length < 2 && okc >= items.length)) {
          fixed++; E.fixSkillMistakes(failed.skill); E.unflag(failed.skill);
          if (attempt === 2) E.cnt("brave");
          return showCard(root, '<div class="celebrate">💪</div><h2>' + (attempt === 1 ? G("Зрозуміла!", "Зрозумів!") : "Вийшло! Ось це наполегливість!") + '</h2><p class="muted">' + esc(sk.title) + '</p>', "Далі →", cont);
        }
        if (attempt === 1) {
          return showCard(root, '<div class="celebrate">💡</div><h2>Спробуймо пояснити інакше</h2><div style="text-align:left">' + (sk.alt || ('<div class="rule-box">' + esc(sk.rule) + '</div>')) + '</div>',
            "Спробую ще →", function () { series(failed, 2, cont); });
        }
        E.flag(failed.skill); flagged.push(failed.skill);
        showCard(root, '<div class="celebrate">🤝</div><h2>Розберемо разом з батьками</h2><p>Ця штука поки хитра — і це нормально. Я позначила її, щоб розібрати разом. А зараз ідемо далі!</p>', "Далі →", cont);
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
    LES.skills.forEach(function (id) {
      var got = E.pick(id, n, used), sk = E.SK[id];
      if ((SUB.id === "algebra" || SUB.id === "geometry") && sk && sk.gen && got.length) { var ez = E.makeGen(sk, { easy: 1 }); if (!used[ez.key] && !got.some(function (g) { return g.key === ez.key; })) got[0] = ez; } // перше завдання навички — легше
      got.forEach(function (it) { used[it.key] = 1; out.push(it); });
    });
    return out;
  }
  function nextLabel(idx) { var n = stepsOf(LES)[idx + 1]; return n ? ({ examples: "До прикладів", practice: "До вправ", words: "До слів", test: "До тесту" }[n.id] || "Далі") + " →" : "До кабінету →"; }
  function stepPractice(root, idx) {
    runSession(root, { items: practiceItems(), mode: "practice", onDone: function (s) {
      completeStep("practice");
      var good = s.max ? s.score / s.max : 1;
      root.innerHTML = '<div class="card" style="text-align:center"><div class="celebrate">' + (good >= 0.8 ? "🎉" : "💪") + '</div><h2>Вправи зроблено!</h2>' +
        (s.fixed ? '<div class="tip">Ти ' + G("виправила", "виправив") + ' ' + s.fixed + ' ' + (s.fixed === 1 ? "помилку" : s.fixed < 5 ? "помилки" : "помилок") + ' — це і є навчання! 🌟</div>' : s.errSkills.length ? "" : '<p>Без жодної помилки! 🔥</p>') +
        '<p class="muted small">Бали: ' + fmt(s.score) + ' з ' + s.max + '</p>' +
        '<h3 style="text-align:left;margin-top:14px">Мої навички</h3>' + skillList(LES.skills) +
        '<p class="muted small" style="text-align:left">🌱 Вчу → 🌿 Знаю (3 правильно поспіль без підказок) → 🌳 Засвоєно (правильно при повторенні в інший день)</p>' +
        '<div class="row"><button class="btn ghost" id="again">↺ Ще раз</button><button class="btn" id="nx" style="flex:2">' + nextLabel(idx) + '</button></div></div>';
      $("again").onclick = function () { stepPractice(root, idx); toTop(); };
      $("nx").onclick = function () { nextStep(idx); };
    } });
  }

  /* --- 4. Слова --- */
  function stepWords(root, idx) {
    var W = LES.words, queue = W.map(function (_, k) { return k; }), known = 0;
    function draw() {
      if (!queue.length) {
        E.addWords(W);
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
      '<div class="tip">Урок зарахується від <b>' + pass + '%</b>. Підказки бери сміливо — просто зірок буде трохи менше.</div>' +
      '<p class="muted small">⭐ ' + pass + '%+ · ⭐⭐ 90%+ · ⭐⭐⭐ 100%</p><div class="row"><button class="btn full" id="go">Почати тест →</button></div></div>';
    $("go").onclick = function () {
      runSession(root, { items: testItems(), mode: "test", onDone: function (s) {
        var pct = Math.round(s.score / s.max * 100), okPct = Math.round(s.res.filter(function (r) { return r.ok; }).length / s.max * 100);
        var ok = okPct >= pass, stars = !ok ? 0 : pct >= 100 ? 3 : pct >= 90 ? 2 : 1; // зарахування — за правильними відповідями; підказки зменшують лише зірки
        var L = E.lesson(LES.id);
        if (ok) { completeStep("test"); if (stars > L.stars) { var gain = 3 * (stars - L.stars); L.stars = stars; E.save(); E.addStars(gain, "lesson"); toast("⭐ +" + gain + " за тест!"); } }
        if (pct > L.best) L.best = pct;
        E.markDay(); E.save();
        var wrong = s.res.filter(function (r) { return !r.ok; });
        root.innerHTML = '<div class="card" style="text-align:center"><div class="celebrate">' + (ok ? "🏆" : "🌱") + '</div><h2>' + (ok ? "Урок пройдено!" : "Майже! Ще трішки") + '</h2>' +
          '<div class="score-big">' + pct + '%</div>' +
          (ok ? '<div class="stars" style="font-size:30px">' + starsStr(stars) + '</div>' : '<p class="muted">Потрібно ' + pass + '%. Зроби ще раз вправи — там помилки розбираються крок за кроком. У тебе вийде!</p>') +
          (wrong.length ? '<div class="tip" style="text-align:left;margin-top:14px"><b>Варто закріпити:</b><br>' + wrong.map(function (r) { var an = esc(E.answersOf(r.it)[0]); return "• " + (r.it.type === "num" && String(r.it.p).indexOf("___") >= 0 && !r.it.long ? esc(r.it.p).replace(/\n/g, " ").replace("___", "<b>" + an + "</b>") : pText(r.it, true, true) + " → <b>" + an + "</b>"); }).join("<br>") + '</div>' : "") +
          skillList(LES.skills) +
          '<div class="row"><button class="btn ghost full" id="copy">📨 Надіслати батькам у Telegram</button>' +
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
    lines.push(wrong.length ? "Помилки:\n" + wrong.map(function (r) { return "• " + pText(r.it) + " → " + (r.given == null ? "не знаю" : r.given) + " (правильно: " + E.answersOf(r.it)[0] + ")"; }).join("\n") : "Без помилок!");
    lines.push("Навички:\n" + LES.skills.map(function (id) { var l = lvl(id), s = P.skills[id]; return "• " + l.e + " " + (E.SK[id] ? E.SK[id].title : id) + (s && s.flag ? " — розібрати з батьками 🤝" : ""); }).join("\n"));
    var rep = P.reports.filter(function (r) { return !r.sent; });
    if (rep.length) lines.push("Позначено «тут помилка»:\n" + rep.map(function (r) { return "• " + r.key.split("|")[1] + (r.given != null ? " (відповідь: " + r.given + ")" : ""); }).join("\n"));
    lines.push("Днів поспіль: " + E.streak());
    var text = lines.join("\n");
    sendDad(text, function () { rep.forEach(function (r) { r.sent = true; }); E.save(); });
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
    var start = function () {
      if (h && child()) { if (SUBS[h]) { setSub(h); renderHome(); } else renderSubjects(); }
      else renderWho();
    };
    var cid = E.cur();
    // на старому сайті та для дітей, що ще не входили, — спершу екран «Хто вчиться» (там вхід за PIN)
    if (SY && cid && !SY.has(cid)) return renderWho();
    if (SY && cid && SY.has(cid)) { SY.pull(cid).then(function (r) { if (r === "relogin") renderWho(); else start(); }); return; }
    start();
  });
})();
