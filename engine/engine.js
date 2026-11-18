/* =====================================================================
   engine.js — рушій платформи (без інтерфейсу)
   Стан і прогрес, перевірка відповідей (з описками), рівні засвоєння
   🌱🌿🌳, інтервальні повторення, підбір завдань із банків навичок.
   Пишемо без найновішого JS, щоб працювало в Safari 15 (macOS Monterey).
   ===================================================================== */
(function () {
  "use strict";
  var E = (window.E = {});

  /* ---------- дати ---------- */
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function ymd(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function today() { return ymd(new Date()); }
  function addDays(s, n) {
    var p = String(s).split("-");
    return ymd(new Date(+p[0], +p[1] - 1, +p[2] + n));
  }
  E.today = today;
  E.addDays = addDays;

  /* ---------- стан ----------
     Сховище: {v:3, cur:"anya", profiles:{anya:{...}, artem:{...}}}
     Кожна дитина — окремий профіль зі своїм прогресом. */
  var KEY = "school-v3";
  var V2_KEY = "school-v2";
  var OLD_KEY = "eng7-cabinet-v1";
  E.IV = [1, 3, 7, 14, 30]; // інтервали повторення, днів

  function freshProfile(name) {
    return { name: name || "", days: [], daily: {}, skills: {}, lessons: {}, seen: {}, mistakes: [], reports: [] };
  }
  function freshStore() { return { v: 3, cur: "", profiles: {} }; }
  function isAnya(n) { return /^ан[яиюіа]|^anya|^ann/i.test(String(n || "").trim()); }

  /* Старий прогрес переносимо лише якщо він Анин; тестові проходи тата скидаємо. */
  function migrate() {
    var st = freshStore();
    try {
      var v2 = JSON.parse(localStorage.getItem(V2_KEY));
      if (v2 && v2.profiles) {
        Object.keys(v2.profiles).forEach(function (k) {
          var p = v2.profiles[k];
          if (isAnya(p.name)) { p.daily = p.daily || {}; p.name = "Аня"; st.profiles.anya = p; }
        });
        return st;
      }
      var o = JSON.parse(localStorage.getItem(OLD_KEY));
      if (o && o.lessons && isAnya(o.name)) {
        var p1 = freshProfile("Аня");
        (o.days || []).forEach(function (d) {
          var a = String(d).split("-");
          if (a.length === 3) p1.days.push(a[0] + "-" + pad(+a[1]) + "-" + pad(+a[2]));
        });
        Object.keys(o.lessons).forEach(function (id) {
          var l = o.lessons[id];
          p1.lessons[id] = { steps: l.steps || {}, stars: l.stars || 0, best: l.best || 0 };
        });
        st.profiles.anya = p1;
      }
    } catch (e) {}
    return st;
  }

  function load() {
    try {
      var s = JSON.parse(localStorage.getItem(KEY));
      if (s && s.v === 3 && s.profiles) return s;
    } catch (e) {}
    return migrate();
  }

  var store = load();
  E.store = function () { return store; };
  E.saveRaw = function () { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {} };
  /* зберегти; якщо дитина увійшла (sync.js) — позначити зміну і відправити на сервер */
  E.save = function () {
    var S = window.SYNC, id = store.cur, p = store.profiles[id];
    if (S && p && S.ready(id)) { p.dirty = true; p.dseq = (p.dseq || 0) + 1; }
    E.saveRaw();
    if (S && p && S.ready(id)) S.push(id);
  };
  /* профіль дитини (створюється за потреби) */
  E.profile = function (id, name) {
    var p = store.profiles[id];
    if (!p) p = store.profiles[id] = freshProfile(name);
    if (!p.daily) p.daily = {};
    if (name && !p.name) p.name = name;
    return p;
  };
  E.setCur = function (id, name) { E.profile(id, name); store.cur = id; E.saveRaw(); };

  /* Злиття двох версій прогресу дитини (з різних пристроїв) — нічого не губимо.
     into змінюється на місці (щоб посилання в екранах лишались дійсними). */
  function obj(x) { return x && typeof x === "object" ? x : {}; }
  E.mergeProfile = function (into, o) {
    if (!o || typeof o !== "object") return into;
    var k, a, b;
    into.days = (into.days || []).concat((o.days || []).filter(function (d) { return (into.days || []).indexOf(d) < 0; })).sort();
    into.daily = obj(into.daily); for (k in obj(o.daily)) { a = into.daily[k] = obj(into.daily[k]); for (var sb in obj(o.daily[k])) a[sb] = Math.max(a[sb] || 0, o.daily[k][sb] || 0); }
    // скидання етапу батьками: записи, старші за позначку скидання, відкидаються з обох боків
    into.resets = obj(into.resets); for (k in obj(o.resets)) into.resets[k] = Math.max(into.resets[k] || 0, o.resets[k] || 0);
    var RS = into.resets, stale = function (id, x) { return x && (x.g || 0) < (RS[id] || 0); };
    ["skills", "lessons"].forEach(function (f) { var m = into[f] = obj(into[f]); for (var q in m) if (stale(q, m[q])) delete m[q]; });
    o = JSON.parse(JSON.stringify(o)); ["skills", "lessons"].forEach(function (f) { var m = obj(o[f]); for (var q in m) if (stale(q, m[q])) delete m[q]; });
    into.skills = obj(into.skills); for (k in obj(o.skills)) { a = into.skills[k]; b = o.skills[k]; if (!a || (b.n || 0) > (a.n || 0) || ((b.n || 0) === (a.n || 0) && (b.last || "") > (a.last || ""))) into.skills[k] = b; }
    into.lessons = obj(into.lessons); for (k in obj(o.lessons)) {
      a = into.lessons[k]; b = o.lessons[k];
      if (!a) { into.lessons[k] = b; continue; }
      a.stars = Math.max(a.stars || 0, b.stars || 0); a.best = Math.max(a.best || 0, b.best || 0);
      a.steps = obj(a.steps); for (var st in obj(b.steps)) if (b.steps[st]) a.steps[st] = true;
      if (b.skip) a.skip = true; if (b.early) a.early = true;
    }
    into.seen = obj(into.seen); for (k in obj(o.seen)) if (!into.seen[k] || o.seen[k] > into.seen[k]) into.seen[k] = o.seen[k];
    into.mistakes = into.mistakes || []; var mk = {};
    into.mistakes.forEach(function (m) { mk[m.key] = m; });
    (o.mistakes || []).forEach(function (m) { var x = mk[m.key]; if (!x) { into.mistakes.push(m); mk[m.key] = m; } else { if (m.fixed) x.fixed = m.fixed; if ((m.d || "") > (x.d || "")) x.d = m.d; } });
    into.reports = into.reports || []; var rk = {};
    into.reports.forEach(function (r) { rk[r.key + "|" + r.d + "|" + r.given] = r; });
    (o.reports || []).forEach(function (r) { var x = rk[r.key + "|" + r.d + "|" + r.given]; if (!x) into.reports.push(r); else if (r.sent) x.sent = true; });
    // журнал зірок: однакові записи можуть бути законно — беремо більшу кількість з двох версій
    var cntA = {}, cntB = {}, key = function (x) { return x.d + "|" + x.n + "|" + x.why; };
    (into.stars || []).forEach(function (x) { cntA[key(x)] = (cntA[key(x)] || 0) + 1; });
    (o.stars || []).forEach(function (x) { cntB[key(x)] = (cntB[key(x)] || 0) + 1; });
    into.stars = into.stars || [];
    for (k in cntB) for (var i = cntA[k] || 0; i < cntB[k]; i++) { var pp = k.split("|"); into.stars.push({ d: pp[0], n: +pp[1], why: pp.slice(2).join("|") }); }
    into.stars.sort(function (x, y) { return x.d < y.d ? -1 : x.d > y.d ? 1 : 0; });
    ["rewardWeeks", "badges"].forEach(function (f) { into[f] = obj(into[f]); for (var q in obj(o[f])) if (!into[f][q] || o[f][q] < into[f][q]) into[f][q] = o[f][q]; });
    into.cnt = obj(into.cnt); for (k in obj(o.cnt)) into.cnt[k] = Math.max(into.cnt[k] || 0, o.cnt[k] || 0);
    into.words = obj(into.words); for (k in obj(o.words)) { a = into.words[k]; b = o.words[k]; if (!a || (b.n || 0) > (a.n || 0)) into.words[k] = b; }
    into.plans = obj(into.plans); for (k in obj(o.plans)) {
      a = into.plans[k]; b = o.plans[k];
      if (!a || (b.d || "") > (a.d || "")) into.plans[k] = b;
      else if (a.d === b.d) for (var f2 in b) if (b[f2] === true) a[f2] = true;
    }
    into.wrs = obj(into.wrs); for (k in obj(o.wrs)) {
      a = into.wrs[k]; b = o.wrs[k];
      if (!a || (b.w || "") > (a.w || "")) into.wrs[k] = b;
      else if (a.w === b.w && b.done && !a.done) into.wrs[k] = b;
    }
    into.wrHist = into.wrHist || []; var hk = {};
    into.wrHist.forEach(function (x) { hk[x.w + "|" + (x.sub || "")] = 1; });
    (o.wrHist || []).forEach(function (x) { if (!hk[x.w + "|" + (x.sub || "")]) into.wrHist.push(x); });
    if (o.diag && (!into.diag || (o.diag.d || "") > (into.diag.d || ""))) into.diag = o.diag;
    if (o.reward && (!into.reward || !into.reward.text)) into.reward = o.reward;
    if (o.dino) {
      a = obj(into.dino); b = o.dino;
      var nd = (b.u || 0) > (a.u || 0) ? JSON.parse(JSON.stringify(b)) : a;
      if ((a.v || 1) !== (b.v || 1)) nd = JSON.parse(JSON.stringify((a.v || 1) > (b.v || 1) ? a : b)); // старі правила росту не змішуємо з новими
      else { nd.form = Math.max(a.form || 0, b.form || 0); nd.items = Math.max(a.items || 0, b.items || 0); }
      into.dino = nd;
    }
    if (o.blitz) {
      a = into.blitz = obj(into.blitz); b = o.blitz;
      if ((b.best || 0) > (a.best || 0)) { a.best = b.best; a.bestD = b.bestD; }
      var bt = {}; a.hist = a.hist || []; a.hist.forEach(function (x) { bt[x.t] = 1; });
      (b.hist || []).forEach(function (x) { if (!bt[x.t]) a.hist.push(x); });
      a.hist.sort(function (x, y) { return x.t - y.t; }); a.hist = a.hist.slice(-60);
    }
    for (k in o) if (!(k in into) && k !== "srv" && k !== "dirty" && k !== "dseq") into[k] = o[k];
    return into;
  };
  E.hasProgress = function (p) {
    return !!p && ((p.days && p.days.length) || Object.keys(obj(p.lessons)).length || Object.keys(obj(p.skills)).length || Object.keys(obj(p.words)).length) ? true : false;
  };
  E.cur = function () { return store.profiles[store.cur] ? store.cur : ""; };
  E.P = function () { return E.profile(store.cur || "guest"); };
  E.save();

  /* лічильник виконаних завдань за день по предметах */
  E.tick = function (subject) {
    var p = E.P(), t = today();
    var d = p.daily[t] || (p.daily[t] = {});
    d[subject] = (d[subject] || 0) + 1;
    E.markDay();
  };
  E.todayCount = function (subject, prof) {
    var p = prof || E.P(), d = p.daily && p.daily[today()];
    if (!d) return 0;
    if (subject) return d[subject] || 0;
    var n = 0; for (var k in d) n += d[k]; return n;
  };

  E.markDay = function () {
    var p = E.P(), t = today();
    if (p.days.indexOf(t) < 0) {
      var last = p.days.length ? p.days[p.days.length - 1] : "";
      p.days.push(t); E.save();
      if (last && addDays(last, 3) <= t) E.cnt("back"); // перерва 2+ дні — і все одно повернулась
      E.checkBadges();
    }
  };
  /* Серія днів. ❄️ Заморозка: один пропущений день на тиждень (пн–нд) не рве серію,
     якщо день до і день після пропуску — навчальні. */
  function weekStart(s) {
    var p = String(s).split("-"), dt = new Date(+p[0], +p[1] - 1, +p[2]);
    return addDays(s, -((dt.getDay() + 6) % 7));
  }
  E.weekStart = weekStart;
  function streakInfo(p) {
    var n = 0, d = today(), used = {}, frozen = [];
    if (p.days.indexOf(d) < 0) d = addDays(d, -1); // сьогодні ще не займались — серія не згоряє
    for (var guard = 0; guard < 2000; guard++) {
      if (p.days.indexOf(d) >= 0) { n++; d = addDays(d, -1); continue; }
      var w = weekStart(d);
      if ((n > 0 || d === addDays(today(), -1)) && !used[w] && p.days.indexOf(addDays(d, -1)) >= 0) { used[w] = 1; frozen.push(d); d = addDays(d, -1); continue; }
      break;
    }
    return { n: n, frozen: frozen, freezeUsedThisWeek: !!used[weekStart(today())] || frozen.some(function (f) { return weekStart(f) === weekStart(today()); }) };
  }
  E.streak = function (prof) { return streakInfo(prof || E.P()).n; };
  E.streakInfo = function (prof) { return streakInfo(prof || E.P()); };
  E.lesson = function (id) {
    var p = E.P();
    return p.lessons[id] || (p.lessons[id] = { steps: {}, stars: 0, best: 0, g: (p.resets || {})[id] || 0 });
  };

  /* ---------- зірки ⭐ ----------
     Журнал нарахувань: {d, n, why}. Тижнева сума — з понеділка. */
  E.onStars = null; E.onBadge = null;
  E.addStars = function (n, why) {
    var p = E.P();
    if (!p.stars) p.stars = [];
    p.stars.push({ d: today(), n: n, why: why });
    if (p.stars.length > 2000) p.stars = p.stars.slice(-2000);
    E.save();
    if (E.onStars) E.onStars(n, why);
    E.checkBadges();
  };
  E.starsWeek = function (prof) {
    var p = prof || E.P(), w = weekStart(today()), n = 0;
    (p.stars || []).forEach(function (x) { if (x.d >= w) n += x.n; });
    return n;
  };
  E.starsTotal = function (prof) {
    var p = prof || E.P(), n = 0;
    (p.stars || []).forEach(function (x) { n += x.n; });
    return n;
  };
  /* тижнева нагорода: {text, goal, pin} — задає тато */
  E.reward = function (prof) {
    var p = prof || E.P();
    return p.reward || (p.reward = { text: "", goal: 30, pin: "" });
  };

  /* ---------- значки 🏅 ---------- */
  function totalTasks(p) { var n = 0; Object.keys(p.daily || {}).forEach(function (d) { for (var k in p.daily[d]) n += p.daily[d][k]; }); return n; }
  function fixedCount(p) { var k = {}, n = 0; p.mistakes.forEach(function (m) { if (m.fixed && !k[m.key]) { k[m.key] = 1; n++; } }); return n; }
  function lvlCount(p, l) { var n = 0; for (var id in p.skills) if (p.skills[id].lvl >= l) n++; return n; }
  E.BADGES = [
    { id: "day1", e: "🌅", t: "Перше заняття", s: "Виконати «Заняття на сьогодні»", ok: function (p) { return (p.cnt && p.cnt.daysDone) >= 1; } },
    { id: "lesson1", e: "🎓", t: "Перший урок", s: "Скласти тест уроку", ok: function (p) { for (var k in p.lessons) if (p.lessons[k].stars > 0) return true; return false; } },
    { id: "streak3", e: "🔥", t: "3 дні поспіль", s: "Займатися 3 дні підряд", ok: function (p) { return streakInfo(p).n >= 3; } },
    { id: "streak7", e: "🚀", t: "Тиждень поспіль", s: "Займатися 7 днів підряд", ok: function (p) { return streakInfo(p).n >= 7; } },
    { id: "streak30", e: "🏆", t: "Місяць поспіль", s: "Займатися 30 днів підряд", ok: function (p) { return streakInfo(p).n >= 30; } },
    { id: "fix10", e: "🛠️", t: "10 помилок виправлено", s: "Помилка — це і є навчання", ok: function (p) { return fixedCount(p) >= 10; } },
    { id: "fix50", e: "🧰", t: "50 помилок виправлено", s: "Справжній майстер виправлень", ok: function (p) { return fixedCount(p) >= 50; } },
    { id: "brave", e: "💪", t: "Наполегливість", s: "Не здатися і розібратися з другої спроби", ok: function (p) { return (p.cnt && p.cnt.brave) >= 1; } },
    { id: "back", e: "🤗", t: "З поверненням!", s: "Повернутися до занять після перерви", ok: function (p) { return (p.cnt && p.cnt.back) >= 1; } },
    { id: "know5", e: "🌿", t: "5 навичок «Знаю»", s: "Довести 5 навичок до 🌿", ok: function (p) { return lvlCount(p, 2) >= 5; } },
    { id: "master1", e: "🌳", t: "Перша засвоєна", s: "Перша навичка 🌳 — правильно і через день", ok: function (p) { return lvlCount(p, 3) >= 1; } },
    { id: "es", sub: "english", e: "🔤", t: "Майстер -es", s: "Засвоїти -s, -sh, -ch, -x, -o → + es", ok: function (p) { return p.skills["ps.es"] && p.skills["ps.es"].lvl >= 3; } },
    { id: "t100", e: "💯", t: "100 завдань", s: "Виконати 100 завдань", ok: function (p) { return totalTasks(p) >= 100; } },
    { id: "t500", e: "⭐", t: "500 завдань", s: "Виконати 500 завдань", ok: function (p) { return totalTasks(p) >= 500; } },
    { id: "w50", sub: "english", e: "🃏", t: "50 слів", s: "Вивчити 50 слів (коробка 4+)", ok: function (p) { return E.wordsLearned(p) >= 50; } },
    { id: "w100", sub: "english", e: "📚", t: "100 слів", s: "Вивчити 100 слів", ok: function (p) { return E.wordsLearned(p) >= 100; } },
    { id: "reward1", e: "🎁", t: "Перша нагорода", s: "Зібрати зірки на тижневу нагороду", ok: function (p) { return (p.cnt && p.cnt.rewards) >= 1; } },
    { id: "mtab", sub: "math2", e: "✖️", t: "Знавець таблиці", s: "Скласти тест «Таблиця на 2–5: усе разом»", ok: function (p) { return (p.lessons.m13 && p.lessons.m13.stars > 0); } },
    { id: "mtask", sub: "math2", e: "🧩", t: "Майстер задач", s: "Скласти тест «Задачі у 2 дії — крок за кроком»", ok: function (p) { return (p.lessons.m26 && p.lessons.m26.stars > 0) || (p.lessons.m17 && p.lessons.m17.stars > 0); } },
    { id: "mclock", sub: "math2", e: "⏰", t: "Знаю годинник", s: "Скласти тест «Годинник і час»", ok: function (p) { return (p.lessons.m20 && p.lessons.m20.stars > 0); } },
    { id: "myear", sub: "math2", e: "🏅", t: "Другий клас — пройдено!", s: "Скласти фінальне повторення року", ok: function (p) { return (p.lessons.m24 && p.lessons.m24.stars > 0); } }
  ];
  E.cnt = function (k, n) { var p = E.P(); if (!p.cnt) p.cnt = {}; p.cnt[k] = (p.cnt[k] || 0) + (n || 1); E.save(); E.checkBadges(); };
  var checking = false;
  E.checkBadges = function () {
    if (checking) return [];
    checking = true;
    var p = E.P(), out = [];
    if (!p.badges) p.badges = {};
    // нагорода тижня: зібрано ціль — фіксуємо раз на тиждень
    var r = E.reward(p), w = weekStart(today());
    if (r.text && r.goal && E.starsWeek(p) >= r.goal) {
      if (!p.rewardWeeks) p.rewardWeeks = {};
      if (!p.rewardWeeks[w]) { p.rewardWeeks[w] = today(); if (!p.cnt) p.cnt = {}; p.cnt.rewards = (p.cnt.rewards || 0) + 1; out.push({ e: "🎁", t: "Нагорода тижня: " + r.text, reward: true }); }
    }
    E.BADGES.forEach(function (b) {
      if (!p.badges[b.id] && b.ok(p)) { p.badges[b.id] = today(); out.push(b); }
    });
    if (out.length) E.save();
    checking = false;
    if (out.length && E.onBadge) out.forEach(function (b) { E.onBadge(b); });
    return out;
  };

  /* ---------- слова: коробки ----------
     P.words[en] = {box 1..5, due, n, ok, bad}. Правильно → коробка вище, слово повертається рідше;
     помилка → коробка 1, завтра знову. «Вивчено» — коробка 4+. */
  E.WBOX = [0, 1, 2, 4, 8, 16];
  E.DICT = {};   // en → ua
  E.WSETS = [];  // набори слів за темами
  E.addDict = function (list) { (list || []).forEach(function (x) { if (!E.DICT[x[0]]) E.DICT[x[0]] = x[1]; }); };
  function words() { var p = E.P(); return p.words || (p.words = {}); }
  E.wordBox = function (en) { var w = words()[en]; return w ? w.box : 0; };
  E.wordsLearned = function (prof) { var ws = (prof || E.P()).words || {}, n = 0; for (var k in ws) if (ws[k].box >= 4) n++; return n; };
  E.wordsDue = function () {
    var ws = words(), t = today();
    return Object.keys(ws).filter(function (k) { return E.DICT[k] && ws[k].due <= t; })
      .sort(function (a, b) { return ws[a].box - ws[b].box || (ws[a].due < ws[b].due ? -1 : 1); });
  };
  /* слова з уроку: потрапляють у коробку 1 (повторення завтра) */
  E.addWords = function (list) {
    var ws = words(), t = today();
    (list || []).forEach(function (x) { if (!ws[x[0]]) ws[x[0]] = { box: 1, due: addDays(t, 1), n: 0, ok: 0, bad: 0 }; });
    E.save();
  };
  E.wordAnswer = function (en, ok) {
    var ws = words(), t = today(), w = ws[en] || (ws[en] = { box: 0, due: t, n: 0, ok: 0, bad: 0 }), was = w.box;
    w.n++;
    if (ok) { w.ok++; w.box = Math.min(w.box + 1, 5); w.due = addDays(t, was === 5 ? 30 : E.WBOX[w.box]); }
    else { w.bad++; w.box = 1; w.due = addDays(t, 1); }
    E.save();
    if (ok && w.box === 4 && was === 3) E.addStars(1, "word");
    E.checkBadges();
    return w.box;
  };
  /* набір на сьогодні: слова, яким пора (до 10), + нові з поточної теми (до 5), разом до 12 */
  E.wordSession = function (max) {
    max = max || 12;
    var p = E.P(), ws = words(), due = E.wordsDue().slice(0, 10), out = due.slice(), nNew = 0;
    if (!p.wset && E.WSETS.length) p.wset = E.WSETS[0].id;
    for (var g = 0; g < E.WSETS.length && out.length < max && nNew < 5; g++) {
      var set = null; E.WSETS.forEach(function (x) { if (x.id === p.wset) set = x; });
      if (!set) break;
      var fresh = set.words.filter(function (x) { return !ws[x[0]] && out.indexOf(x[0]) < 0; });
      if (!fresh.length) { // тема пройдена — беремо наступну
        var i = E.WSETS.indexOf(set), nx = null;
        for (var j = 1; j <= E.WSETS.length; j++) { var c = E.WSETS[(i + j) % E.WSETS.length]; if (c.words.some(function (x) { return !ws[x[0]]; })) { nx = c; break; } }
        if (!nx) break; p.wset = nx.id; continue;
      }
      while (fresh.length && out.length < max && nNew < 5) { out.push(fresh.shift()[0]); nNew++; }
    }
    E.save();
    return out;
  };
  E.checkWord = function (right, given) {
    var f = function (x) { return E.norm(x).replace(/-/g, " ").replace(/\s+/g, " "); };
    var r = f(right), g = f(given);
    if (r === g) return "ok";
    if (r.length >= 5 && dist(r, g) === 1) return "typo";
    return "wrong";
  };

  /* ---------- навички ---------- */
  E.curSub = "english"; // поточний предмет (кабінет, план дня, помилки, повторення — окремо для кожного)
  E.SK = {}; // id → навичка зі змісту
  E.ITEM = {}; // key → завдання
  E.addSkills = function (json, subject) {
    (json.skills || []).forEach(function (s) {
      s.topic = json.topic;
      s.subject = subject || "english";
      (s.items || []).forEach(function (it) {
        it.skill = s.id;
        it.key = s.id + "|" + it.p + (it.type === "choice" ? "|" + it.a : "");
        E.ITEM[it.key] = it;
      });
      E.SK[s.id] = s;
    });
  };

  E.LV = [
    { e: "⚪", t: "Ще не почато" },
    { e: "🌱", t: "Вчу" },
    { e: "🌿", t: "Знаю" },
    { e: "🌳", t: "Засвоєно" }
  ];

  E.sk = function (id) {
    var p = E.P();
    return p.skills[id] || (p.skills[id] = { lvl: 0, run: 0, n: 0, ok: 0, bad: 0, iv: 0, due: "", knownAt: "", last: "", flag: false, g: (p.resets || {})[id] || 0 });
  };
  E.level = function (id) { var s = E.P().skills[id]; return s ? s.lvl : 0; };

  /* Запис результату завдання.
     ok    — відповідь правильна
     clean — правильна без жодної підказки
     Повертає новий рівень, якщо він змінився, інакше 0. */
  E.record = function (id, ok, clean) {
    var s = E.sk(id), t = today(), before = s.lvl;
    s.n++;
    if (ok) {
      s.ok++;
      if (s.lvl < 1) s.lvl = 1;
      if (clean) {
        s.run++;
        if (s.lvl === 1 && s.run >= 3) {
          s.lvl = 2; s.knownAt = t; s.iv = 0; s.due = addDays(t, E.IV[0]);
        } else if (s.lvl >= 2 && s.due && t >= s.due && t !== s.knownAt) {
          s.lvl = 3; s.iv = Math.min(s.iv + 1, E.IV.length - 1); s.due = addDays(t, E.IV[s.iv]);
        }
      } else {
        s.run = 0; // з підказкою — не рахується в «3 поспіль без підказок»
      }
    } else {
      s.bad++; s.run = 0;
      if (s.lvl < 1) s.lvl = 1;
      if (s.lvl === 3) s.lvl = 2;
      if (s.lvl >= 2) { s.iv = 0; s.due = addDays(t, 1); }
    }
    s.last = t;
    E.save();
    if (s.lvl > before && s.lvl >= 2) E.addStars(s.lvl === 2 ? 2 : 3, "lvl");
    return s.lvl !== before ? s.lvl : 0;
  };
  E.flag = function (id) { E.sk(id).flag = true; E.save(); };
  E.unflag = function (id) { E.sk(id).flag = false; E.save(); };
  /* навички, яким пора на повторення (для розминки) */
  function ofSub(id) { return E.SK[id] && E.SK[id].subject === E.curSub; }
  E.ofSub = ofSub;
  E.dueSkills = function () {
    var p = E.P(), t = today();
    return Object.keys(p.skills).filter(function (id) {
      var s = p.skills[id];
      return ofSub(id) && s.lvl >= 2 && s.due && s.due <= t;
    });
  };

  /* ---------- помилки і звіти ---------- */
  E.addMistake = function (it, given) {
    var p = E.P();
    var m = { key: it.key, skill: it.skill, sub: E.curSub, given: given == null ? null : String(given), d: today(), fixed: false };
    if (it.gen) m.it = JSON.parse(JSON.stringify(it)); // згенероване завдання зберігаємо цілим, щоб повторити
    p.mistakes.push(m);
    if (p.mistakes.length > 300) p.mistakes = p.mistakes.slice(-300);
    E.save();
  };
  function fixWhere(test) {
    var n = 0, seen = {};
    E.P().mistakes.forEach(function (m) { if (!m.fixed && test(m)) { m.fixed = true; if (!seen[m.key]) { seen[m.key] = 1; n++; } } });
    E.save();
    if (n) E.addStars(n, "fix");
    return n;
  }
  E.fixSkillMistakes = function (skill) { return fixWhere(function (m) { return m.skill === skill; }); };
  E.fixMistake = function (key) { return fixWhere(function (m) { return m.key === key; }); };
  /* невиправлені помилки: по одній на завдання, найновіші першими */
  E.openMistakes = function () {
    var seen = {}, out = [], ms = E.P().mistakes;
    for (var i = ms.length - 1; i >= 0; i--) {
      var m = ms[i];
      if (m.fixed || seen[m.key] || (m.sub || "english") !== E.curSub) continue;
      if (!E.ITEM[m.key] && m.it) E.ITEM[m.key] = m.it;
      if (!E.ITEM[m.key]) continue;
      seen[m.key] = 1; out.push(m);
    }
    return out;
  };

  /* план «Заняття на сьогодні»: розминка → крок уроку → помилки */
  E.plan = function () {
    var p = E.P(), t = today(), sub = E.curSub;
    if (!p.plans) p.plans = {};
    if (p.plan && sub === "english" && !p.plans.english) p.plans.english = p.plan; // перенос старого плану
    var pl = p.plans[sub];
    if (!pl || pl.d !== t) pl = p.plans[sub] = { d: t, warm: false, lesson: false, words: false, mist: false };
    p.plan = p.plans.english || p.plan;
    return pl;
  };
  /* розминка: спершу навички, яким пора повторитися, далі — давно не бачені з уже почате */
  E.warmItems = function (n, onlyIds) {
    var p = E.P(), due = E.dueSkills(), t = today();
    var started = Object.keys(p.skills).filter(function (id) {
      return ofSub(id) && p.skills[id].lvl >= 1 && due.indexOf(id) < 0 && (!onlyIds || onlyIds.indexOf(id) >= 0);
    });
    started.sort(function (a, b) { return (p.skills[a].last || "") < (p.skills[b].last || "") ? -1 : 1; });
    // сьогоднішні навички — в кінець (їх і так щойно тренували)
    started = started.filter(function (id) { return p.skills[id].last !== t; }).concat(started.filter(function (id) { return p.skills[id].last === t; }));
    var ids = due.concat(started), used = {}, out = [], round = 0;
    while (out.length < n && ids.length && round < 5) {
      for (var i = 0; i < ids.length && out.length < n; i++) {
        var x = E.pick(ids[i], 1, used)[0];
        if (x && !used[x.key]) { used[x.key] = 1; out.push(x); }
      }
      round++;
    }
    return out;
  };

  /* «Повторення тижня»: по 1–2 завдання з КОЖНОЇ вже початої навички (давно не бачені — першими), до 12 */
  E.reviewSkills = function () {
    var p = E.P();
    return Object.keys(p.skills).filter(function (id) { return ofSub(id) && (p.skills[id].lvl >= 1 || p.skills[id].n > 0); });
  };
  E.reviewItems = function (n) {
    n = n || 12;
    var p = E.P(), ids = E.reviewSkills(), used = {}, out = [];
    ids.sort(function (a, b) { return (p.skills[a].last || "") < (p.skills[b].last || "") ? -1 : 1; });
    for (var round = 0; round < 3 && out.length < n && ids.length; round++) {
      for (var i = 0; i < ids.length && out.length < n; i++) {
        var x = E.pick(ids[i], 1, used)[0];
        if (x && !used[x.key]) { used[x.key] = 1; out.push(x); }
      }
    }
    // перемішуємо, щоб теми не йшли підряд
    for (var j = out.length - 1; j > 0; j--) { var k = Math.floor(Math.random() * (j + 1)); var t = out[j]; out[j] = out[k]; out[k] = t; }
    return out;
  };
  E.review = function () {
    var p = E.P(), w = weekStart(today()), sub = E.curSub;
    if (!p.wrs) p.wrs = {};
    if (p.wr && sub === "english" && !p.wrs.english) p.wrs.english = p.wr;
    if (!p.wrs[sub] || p.wrs[sub].w !== w) p.wrs[sub] = { w: w, done: false };
    return p.wrs[sub];
  };
  E.reviewDone = function (score, max, bySkill) {
    var p = E.P(), r = E.review(), first = !r.done;
    r.done = true; r.score = score; r.max = max; r.d = today(); r.by = bySkill;
    if (!p.wrHist) p.wrHist = [];
    p.wrHist = p.wrHist.filter(function (x) { return !(x.w === r.w && (x.sub || "english") === E.curSub); }).concat([{ w: r.w, sub: E.curSub, score: score, max: max }]).slice(-60);
    E.save();
    if (first) E.addStars(5, "review");
  };

  /* батьки скидають етап: уроки й навички — як непройдені (зірки, що вже були, лишаються) */
  E.resetIds = function (lessonIds, skillIds) {
    var p = E.P(), ts = Date.now(), set = {};
    p.resets = p.resets || {};
    lessonIds.forEach(function (id) { p.resets[id] = ts; delete p.lessons[id]; });
    skillIds.forEach(function (id) { p.resets[id] = ts; delete p.skills[id]; set[id] = 1; });
    (p.mistakes || []).forEach(function (m) { if (set[m.skill] && !m.fixed) m.fixed = today(); });
    E.save();
  };

  /* ⚡ Блискавка: 60 секунд прикладів з уже початих тем; рекорд — лише проти себе */
  E.BLITZ = ["m.add10", "m.miss10", "m.add20", "m.sub20", "m.mix20", "m.addnc", "m.subnc", "m.addc", "m.subc", "m.mul23", "m.div23", "m.mul4", "m.div4", "m.mul5", "m.div5", "m.mulmiss", "m.md01"];
  E.blitzSkills = function () {
    var p = E.P(), ids = E.BLITZ.filter(function (id) { var s = p.skills[id]; return E.SK[id] && s && (s.n > 0 || s.lvl >= 1); });
    return ids.length ? ids : E.BLITZ.slice(0, 2).filter(function (id) { return !!E.SK[id]; });
  };
  E.blitzInfo = function () { var b = E.P().blitz || {}; return { best: b.best || 0, hist: b.hist || [] }; };
  E.blitzDone = function (ok, n) {
    var p = E.P(); if (!p.blitz) p.blitz = { best: 0, hist: [] };
    var b = p.blitz, prev = b.best || 0, rec = ok > prev;
    b.hist = (b.hist || []).concat([{ t: Date.now(), d: today(), ok: ok, n: n }]).slice(-60);
    if (rec) { b.best = ok; b.bestD = today(); }
    E.save();
    if (rec && prev > 0) E.addStars(2, "blitz");
    return { rec: rec, prev: prev };
  };

  E.reportIssue = function (it, given) {
    E.P().reports.push({ key: it.key, given: given == null ? null : String(given), d: today() });
    E.save();
  };

  /* ---------- підбір завдань ---------- */
  E.markSeen = function (it) { if (!it.gen) E.P().seen[it.key] = today(); };
  /* Навички-генератори (математика): завдання створюються на льоту функцією E.GEN[sk.gen] */
  E.GEN = E.GEN || {};
  E.makeGen = function (sk, extra) {
    var a = {}, k; for (k in sk.args || {}) a[k] = sk.args[k]; for (k in extra || {}) a[k] = extra[k];
    var it = E.GEN[sk.gen](a);
    it.skill = sk.id; it.key = sk.id + "|" + it.p + (it.uid ? "|" + it.uid : ""); it.gen = true;
    E.ITEM[it.key] = it;
    return it;
  };
  /* n завдань навички: спершу ті, що ще не траплялись у цій сесії (used),
     серед них — давно не бачені; при нестачі — повтор найдавніших. */
  E.pick = function (id, n, used, avoid, like) {
    var sk = E.SK[id];
    if (!sk) return [];
    if (sk.gen) {
      var g = [], tries = 0;
      while (g.length < n && tries < 80) {
        tries++;
        var it = E.makeGen(sk, like && like.tt ? { tt: like.tt } : null);
        if ((used && used[it.key]) || (avoid && it.key === avoid) || g.some(function (o) { return o.key === it.key; })) continue;
        g.push(it);
      }
      return g;
    }
    var seen = E.P().seen;
    var all = sk.items.filter(function (it) { return !(E.noAudio && it.type === "dict"); }).map(function (it) { return { it: it, r: Math.random() }; });
    all.sort(function (a, b) {
      var ua = used && used[a.it.key] ? 1 : 0, ub = used && used[b.it.key] ? 1 : 0;
      if (ua !== ub) return ua - ub;
      var sa = seen[a.it.key] || "", sb = seen[b.it.key] || "";
      if (sa !== sb) return sa < sb ? -1 : 1;
      return a.r - b.r;
    });
    var out = [];
    for (var i = 0; i < all.length && out.length < n; i++) {
      if (avoid && all[i].it.key === avoid) continue;
      out.push(all[i].it);
    }
    return out;
  };

  /* ---------- перевірка відповідей ---------- */
  /* Американське і британське написання обидва правильні: зводимо до одного */
  var VAR = { color: "colour", colors: "colours", favorite: "favourite", favorites: "favourites", neighbor: "neighbour", neighbors: "neighbours",
    math: "maths", practice: "practise", practiced: "practised", center: "centre", theater: "theatre", gray: "grey", traveling: "travelling",
    traveled: "travelled", traveler: "traveller", realize: "realise", organize: "organise", mom: "mum", honor: "honour", behavior: "behaviour",
    learnt: "learned", dreamt: "dreamed", spelt: "spelled", burnt: "burned", smelt: "smelled", leant: "leaned", spoilt: "spoiled" };
  function variants(s) { return s.replace(/[a-z]+/g, function (w) { return VAR[w] || w; }); }
  E.norm = function (s) { return variants(norm0(s)); };
  function norm0(s) {
    return String(s).toLowerCase()
      .replace(/[’'`ʼ]/g, "")
      .replace(/[.!?,;:«»"“”]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };
  /* для завдань, де апостроф важливий (Tom's): лишаємо його, лише вирівнюємо ’ → ' */
  E.normA = function (s) {
    return variants(String(s).toLowerCase()
      .replace(/[’`ʼ]/g, "'")
      .replace(/[.!?,;:«»"“”]/g, "")
      .replace(/\s+/g, " ")
      .trim());
  };
  function answersOf(it) {
    if (it.type === "choice" || it.type === "fix") return [it.a];
    if (it.type === "num") return [String(it.a)];
    return Array.isArray(it.a) ? it.a : [it.a];
  }
  E.answersOf = answersOf;

  // відстань Дамерау–Левенштейна (заміна, вставка, видалення, перестановка сусідніх)
  function dist(a, b) {
    var m = a.length, n = b.length, d = [], i, j;
    for (i = 0; i <= m; i++) { d[i] = [i]; }
    for (j = 0; j <= n; j++) { d[0][j] = j; }
    for (i = 1; i <= m; i++) {
      for (j = 1; j <= n; j++) {
        var c = a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1;
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + c);
        if (i > 1 && j > 1 && a.charAt(i - 1) === b.charAt(j - 2) && a.charAt(i - 2) === b.charAt(j - 1))
          d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
    return d[m][n];
  }
  /* Описка: різниця в одну літеру, і вона НЕ в закінченні слова
     (останні 2 літери — там живуть граматичні помилки: watchs, gos, drink→drinks). */
  /* guard — слова, де закінчення важливе (граматика); null = усі слова */
  function isTypo(right, given, guard) {
    if (right.length < 4 || dist(right, given) !== 1) return false;
    var p = 0;
    while (p < right.length && p < given.length && right.charAt(p) === given.charAt(p)) p++;
    var end = right.indexOf(" ", p);
    if (end < 0) end = right.length;
    var start = right.lastIndexOf(" ", p - 1) + 1;
    if (guard && !guard[right.slice(start, end)]) return true; // звичайне слово — описка будь-де
    return end - p > 2;
  }
  /* у диктанті «граматичні» слова — ті, що змінюються в типових помилках */
  function guardOf(it, right) {
    if (it.type !== "dict") return null;
    var g = {}, rw = right.split(" ");
    Object.keys(it.err || {}).forEach(function (k) {
      var kw = E.norm(k).split(" ");
      rw.forEach(function (w, i) { if (kw[i] !== w) g[w] = 1; });
    });
    return g;
  }

  /* Результат: {st:"ok"|"typo"|"wrong"|"idk", msg?, right} */
  E.check = function (it, given) {
    var ans = answersOf(it), right = ans[0];
    if (given == null) return { st: "idk", right: right };
    if (it.type === "fix") { // «Знайди помилку»: given — номер слова
      if (String(given) === String(it.bad)) return { st: "ok", right: right };
      var w = it.p.split(" ");
      return { st: "wrong", right: right, msg: "Слово «" + w[+given].replace(/[.,!?]/g, "") + "» тут правильне 🙂 Помилка в слові «<b>" + w[it.bad].replace(/[.,!?]/g, "") + "</b>»." };
    }
    var nf = it.apos ? E.normA : E.norm;
    var g = nf(given), i;
    for (i = 0; i < ans.length; i++) if (nf(ans[i]) === g) return { st: "ok", right: ans[i] };
    if (it.err) {
      var ks = Object.keys(it.err);
      for (i = 0; i < ks.length; i++) if (nf(ks[i]) === g) return { st: "wrong", msg: it.err[ks[i]], right: right };
    }
    if ((it.type === "input" || it.type === "dict") && !it.strict) { // strict — правопис і є правилом, описок не прощаємо
      for (i = 0; i < ans.length; i++) { var rn = nf(ans[i]); if (isTypo(rn, g, guardOf(it, rn))) return { st: "typo", right: ans[i] }; }
    }
    return { st: "wrong", right: right };
  };
  E._isTypo = isTypo; // для тестів
})();
