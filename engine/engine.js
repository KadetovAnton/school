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
    if (p.days.indexOf(t) < 0) { p.days.push(t); E.save(); }
  };
  E.streak = function (prof) {
    var p = prof || E.P(), n = 0, d = today();
    if (p.days.indexOf(d) < 0) d = addDays(d, -1); // сьогодні ще не займались — серія не згоряє
    while (p.days.indexOf(d) >= 0) { n++; d = addDays(d, -1); }
    return n;
  };
  E.lesson = function (id) {
    var p = E.P();
    return p.lessons[id] || (p.lessons[id] = { steps: {}, stars: 0, best: 0 });
  };

  /* ---------- навички ---------- */
  E.SK = {}; // id → навичка зі змісту
  E.addSkills = function (json) {
    (json.skills || []).forEach(function (s) {
      s.topic = json.topic;
      (s.items || []).forEach(function (it) {
        it.skill = s.id;
        it.key = s.id + "|" + it.p + (it.type === "choice" ? "|" + it.a : "");
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
  E.fixSkillMistakes = function (skill) {
    E.P().mistakes.forEach(function (m) { if (m.skill === skill) m.fixed = true; });
    E.save();
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
    if (it.type === "input" || it.type === "dict") {
      for (i = 0; i < ans.length; i++) { var rn = E.norm(ans[i]); if (isTypo(rn, g, guardOf(it, rn))) return { st: "typo", right: ans[i] }; }
    }
    return { st: "wrong", right: right };
  };
  E._isTypo = isTypo; // для тестів
})();
