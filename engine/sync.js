/* =====================================================================
   sync.js — вхід за PIN і синхронізація прогресу з сервером (Cloudflare).
   Прогрес живе в браузері (як раніше) + копія на сервері під входом дитини.
   Без інтернету все працює локально; синхронізується, коли зв'язок з'явиться.
   ===================================================================== */
(function () {
  "use strict";
  var E = window.E;
  // локальна перевірка без сервера (python -m http.server 8765) — синхронізацію вимикаємо
  if (location.port === "8765") return;
  var host = location.hostname;
  // старий сайт (GitHub Pages) і локальна перевірка ходять на сервер нового домену
  var API = /github\.io$/.test(host) ? "https://school.akdtv.pp.ua/api/" : "/api/";
  var S = (window.SYNC = { API: API, onRemote: null, moved: /github\.io$/.test(host) });
  var TK = "school-tok-";
  var pulled = {}, timers = {}, busy = {}, again = {};

  function tok(id) { try { return localStorage.getItem(TK + id) || ""; } catch (e) { return ""; } }
  function setTok(id, t) { try { if (t) localStorage.setItem(TK + id, t); else localStorage.removeItem(TK + id); } catch (e) {} }
  S.has = function (id) { return !!tok(id); };
  S.ready = function (id) { return !!pulled[id]; };

  function req(method, path, id, body) {
    return new Promise(function (ok, bad) {
      var x = new XMLHttpRequest();
      x.open(method, API + path, true);
      x.timeout = 12000;
      x.setRequestHeader("Content-Type", "application/json");
      if (id && tok(id)) x.setRequestHeader("Authorization", "Bearer " + tok(id));
      x.onload = function () {
        var d = {}; try { d = JSON.parse(x.responseText); } catch (e) {}
        d._status = x.status; ok(d);
      };
      x.onerror = x.ontimeout = function () { bad(new Error("offline")); };
      x.send(body ? JSON.stringify(body) : null);
    });
  }

  S.status = function (id) { return req("GET", "status?kid=" + id); };
  /* статистика для батьків (PIN батьків) */
  S.parent = function (pin) { return req("POST", "parent", null, { pin: pin }).then(function (d) { if (!d.ok && !d.error) d.error = "Сервер не відповів (" + d._status + ")"; return d; }, function () { return { error: "Немає зв'язку з сервером" }; }); };

  S.login = function (id, pin) {
    return req("POST", "login", null, { kid: id, pin: pin }).then(function (d) {
      if (d.token) { setTok(id, d.token); pulled[id] = false; }
      return d;
    });
  };
  S.logout = function (id) { setTok(id, ""); pulled[id] = false; };

  function clean(p) { var c = JSON.parse(JSON.stringify(p)); delete c.srv; delete c.dirty; delete c.dseq; delete c._shrunk; return c; }

  /* Забрати прогрес з сервера і ЗЛИТИ з тим, що є на пристрої (нічого не губимо).
     Якщо на пристрої було щось, чого сервер не знає, — відправляємо об'єднану версію назад. */
  S.pull = function (id) {
    if (!tok(id)) return Promise.resolve(false);
    return req("GET", "progress", id).then(function (d) {
      if (d._status === 401) { S.logout(id); return "relogin"; }
      if (d._status !== 200) { pulled[id] = true; return "offline"; }
      var st = E.store(), loc = st.profiles[id], res = "same";
      if (d.p && d.upd && (!loc || d.upd !== loc.srv)) {
        if (!loc) { loc = st.profiles[id] = d.p; }
        else {
          var had = loc.dirty || (!loc.srv && E.hasProgress(loc));
          E.mergeProfile(loc, d.p);
          if (had) { loc.dirty = true; loc.dseq = (loc.dseq || 0) + 1; }
        }
        loc.srv = d.upd; E.saveRaw(); res = "updated";
      }
      pulled[id] = true;
      S.flushQueue(id);
      loc = st.profiles[id];
      if (loc && (loc.dirty || (!d.p && E.hasProgress(loc)))) { loc.dirty = true; S.push(id, true); }
      return res;
    }, function () { pulled[id] = true; return "offline"; });
  };

  /* Відправити прогрес (з невеликою затримкою, щоб не слати після кожного кліку). Окремо для кожної дитини. */
  S.push = function (id, now) {
    if (!tok(id) || !pulled[id]) return;
    clearTimeout(timers[id]);
    timers[id] = setTimeout(function () { send(id); }, now ? 0 : 2500);
  };
  function send(id) {
    if (busy[id]) { again[id] = true; return; }
    var p = E.store().profiles[id];
    if (!p || !p.dirty) return;
    busy[id] = true;
    var seq = p.dseq || 0;
    req("PUT", "progress", id, { p: clean(p), base: p.srv || 0 }).then(function (d) {
      busy[id] = false;
      var cur = E.store().profiles[id];
      if (d.ok && d.upd) { delete cur._shrunk; cur.srv = d.upd; if ((cur.dseq || 0) === seq) cur.dirty = false; E.saveRaw(); S.lastOk = Date.now(); }
      else if (d.conflict && d.p) {
        // інший пристрій зберіг свою версію — зливаємо обидві й відправляємо ще раз
        E.mergeProfile(cur, d.p); cur.srv = d.upd; cur.dirty = true; E.saveRaw();
        if (S.onRemote) S.onRemote(id);
        again[id] = true;
      } else if (d._status === 401) { S.logout(id); if (S.onLogout) S.onLogout(id); }
      else if (d._status === 413 && !cur._shrunk) { // прогрес завеликий — прибираємо зайве з «Моїх помилок» і пробуємо ще раз
        cur._shrunk = 1;
        (cur.mistakes || []).forEach(function (m) { if (m.fixed) delete m.it; else if (m.it && m.it.pic && m.it.seed != null) delete m.it.pic; });
        if (cur.mistakes && cur.mistakes.length > 200) cur.mistakes = cur.mistakes.slice(-200);
        E.saveRaw(); again[id] = true;
      }
      if (again[id]) { again[id] = false; send(id); }
    }, function () { busy[id] = false; again[id] = false; });
  }
  /* сторінку закривають або ховають — відправити одразу, не чекаючи таймера */
  function flushAll() {
    Object.keys(timers).forEach(function (id) {
      var p = E.store().profiles[id];
      if (!p || !p.dirty || busy[id] || !tok(id) || !pulled[id]) return;
      clearTimeout(timers[id]);
      try {
        if (window.fetch) fetch(API + "progress", { method: "PUT", keepalive: true, headers: { "Content-Type": "application/json", "Authorization": "Bearer " + tok(id) }, body: JSON.stringify({ p: clean(p), base: p.srv || 0 }) });
      } catch (e) {}
    });
  }
  window.addEventListener("pagehide", flushAll);

  /* Звіт татові в Telegram; якщо не вийшло — false (тоді копіюємо як раніше) */
  S.report = function (id, text) {
    if (!tok(id)) return Promise.resolve(false);
    return req("POST", "report", id, { text: text }).then(function (d) { return !!d.ok; }, function () { return false; });
  };

  /* Черга звітів, які не вдалося надіслати (немає інтернету) — підуть при наступному зв'язку. */
  var PK = "school-pend-";
  function pend(id) { try { return JSON.parse(localStorage.getItem(PK + id) || "[]") || []; } catch (e) { return []; } }
  function setPend(id, a) { try { if (a.length) localStorage.setItem(PK + id, JSON.stringify(a)); else localStorage.removeItem(PK + id); } catch (e) {} }
  S.queue = function (id, text) {
    var a = pend(id).filter(function (x) { return x.text !== text && Date.now() - x.t < 3 * 864e5; });
    a.push({ t: Date.now(), text: text }); setPend(id, a.slice(-10));
  };
  S.unqueue = function (id, text) { setPend(id, pend(id).filter(function (x) { return x.text !== text; })); };
  var flushing = {};
  S.flushQueue = function (id) {
    var a = pend(id).filter(function (x) { return Date.now() - x.t < 3 * 864e5; });
    if (!a.length || flushing[id] || !tok(id)) { if (!a.length) setPend(id, []); return; }
    flushing[id] = true;
    var x = a[0];
    req("POST", "report", id, { text: x.text + "\n(надіслано із запізненням — не було інтернету)" }).then(function (d) {
      flushing[id] = false;
      if (d.ok || d._status === 429 || d._status === 400) { S.unqueue(id, x.text); S.flushQueue(id); }
    }, function () { flushing[id] = false; });
  };
  window.addEventListener("online", function () { var id = E.cur(); if (id) S.flushQueue(id); });

  // сховали вкладку — відправити; повернулись — перевірити, чи не займались на іншому пристрої
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") return flushAll();
    var id = E.cur();
    if (!id || !tok(id) || busy[id]) return;
    if (document.querySelector("#stage, .task")) return; // посеред заняття нічого не підміняємо
    S.pull(id).then(function (r) { if (r === "updated" && S.onRemote) S.onRemote(id); });
  });
})();
