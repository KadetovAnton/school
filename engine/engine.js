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
  E.save = function () { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {} };
  /* профіль дитини (створюється за потреби) */
  E.profile = function (id, name) {
    var p = store.profiles[id];
    if (!p) p = store.profiles[id] = freshProfile(name);
    if (!p.daily) p.daily = {};
    if (name && !p.name) p.name = name;
    return p;
  };
  E.setCur = function (id, name) { E.profile(id, name); store.cur = id; E.save(); };
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
    return p.lessons[id] || (p.lessons[id] = { steps: {}, stars: 0, best: 0 });
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
    { id: "es", e: "🔤", t: "Майстер -es", s: "Засвоїти -s, -sh, -ch, -x, -o → + es", ok: function (p) { return p.skills["ps.es"] && p.skills["ps.es"].lvl >= 3; } },
    { id: "t100", e: "💯", t: "100 завдань", s: "Виконати 100 завдань", ok: function (p) { return totalTasks(p) >= 100; } },
    { id: "t500", e: "⭐", t: "500 завдань", s: "Виконати 500 завдань", ok: function (p) { return totalTasks(p) >= 500; } },
    { id: "reward1", e: "🎁", t: "Перша нагорода", s: "Зібрати зірки на тижневу нагороду", ok: function (p) { return (p.cnt && p.cnt.rewards) >= 1; } }
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

  /* ---------- навички ---------- */
  E.SK = {}; // id → навичка зі змісту
  E.ITEM = {}; // key → завдання
  E.addSkills = function (json) {
    (json.skills || []).forEach(function (s) {
      s.topic = json.topic;
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
    return p.skills[id] || (p.skills[id] = { lvl: 0, run: 0, n: 0, ok: 0, bad: 0, iv: 0, due: "", knownAt: "", last: "", flag: false });
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
  E.dueSkills = function () {
    var p = E.P(), t = today();
    return Object.keys(p.skills).filter(function (id) {
      var s = p.skills[id];
      return E.SK[id] && s.lvl >= 2 && s.due && s.due <= t;
    });
  };

  /* ---------- помилки і звіти ---------- */
  E.addMistake = function (it, given) {
    var p = E.P();
    p.mistakes.push({ key: it.key, skill: it.skill, given: given == null ? null : String(given), d: today(), fixed: false });
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
      if (m.fixed || seen[m.key] || !E.ITEM[m.key]) continue;
      seen[m.key] = 1; out.push(m);
    }
    return out;
  };

  /* план «Заняття на сьогодні»: розминка → крок уроку → помилки */
  E.plan = function () {
    var p = E.P(), t = today();
    if (!p.plan || p.plan.d !== t) p.plan = { d: t, warm: false, lesson: false, mist: false };
    return p.plan;
  };
  /* розминка: спершу навички, яким пора повторитися, далі — давно не бачені з уже почате */
  E.warmItems = function (n, onlyIds) {
    var p = E.P(), due = E.dueSkills(), t = today();
    var started = Object.keys(p.skills).filter(function (id) {
      return E.SK[id] && p.skills[id].lvl >= 1 && due.indexOf(id) < 0 && (!onlyIds || onlyIds.indexOf(id) >= 0);
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

  E.reportIssue = function (it, given) {
    E.P().reports.push({ key: it.key, given: given == null ? null : String(given), d: today() });
    E.save();
  };

  /* ---------- підбір завдань ---------- */
  E.markSeen = function (it) { E.P().seen[it.key] = today(); };
  /* n завдань навички: спершу ті, що ще не траплялись у цій сесії (used),
     серед них — давно не бачені; при нестачі — повтор найдавніших. */
  E.pick = function (id, n, used, avoid) {
    var sk = E.SK[id];
    if (!sk) return [];
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
  E.norm = function (s) {
    return String(s).toLowerCase()
      .replace(/[’'`ʼ]/g, "")
      .replace(/[.!?,;:«»"“”]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };
  function answersOf(it) {
    if (it.type === "choice" || it.type === "fix") return [it.a];
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
    var g = E.norm(given), i;
    for (i = 0; i < ans.length; i++) if (E.norm(ans[i]) === g) return { st: "ok", right: ans[i] };
    if (it.err) {
      var ks = Object.keys(it.err);
      for (i = 0; i < ks.length; i++) if (E.norm(ks[i]) === g) return { st: "wrong", msg: it.err[ks[i]], right: right };
    }
    if ((it.type === "input" || it.type === "dict") && !it.strict) { // strict — правопис і є правилом, описок не прощаємо
      for (i = 0; i < ans.length; i++) { var rn = E.norm(ans[i]); if (isTypo(rn, g, guardOf(it, rn))) return { st: "typo", right: ans[i] }; }
    }
    return { st: "wrong", right: right };
  };
  E._isTypo = isTypo; // для тестів
})();
