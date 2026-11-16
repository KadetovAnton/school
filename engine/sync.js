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
  var pulled = {}, timer = null, busy = false, again = false;

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

  S.login = function (id, pin) {
    return req("POST", "login", null, { kid: id, pin: pin }).then(function (d) {
      if (d.token) { setTok(id, d.token); pulled[id] = false; }
      return d;
    });
  };
  S.logout = function (id) { setTok(id, ""); pulled[id] = false; };

  /* Забрати прогрес з сервера. Новіший серверний — замінює локальний; якщо на сервері порожньо — відправляємо свій. */
  S.pull = function (id) {
    if (!tok(id)) return Promise.resolve(false);
    return req("GET", "progress", id).then(function (d) {
      if (d._status === 401) { S.logout(id); return "relogin"; }
      var st = E.store(), loc = st.profiles[id];
      if (d.p && d.upd && (!loc || !loc.srv || d.upd > loc.srv)) {
        d.p.srv = d.upd; d.p.upd = d.upd;
        st.profiles[id] = d.p; E.saveRaw();
        pulled[id] = true;
        return "updated";
      }
      pulled[id] = true;
      if (!d.p || (loc && loc.upd && loc.upd > (loc.srv || 0))) S.push(id, true);
      return "same";
    }, function () { pulled[id] = true; return "offline"; });
  };

  /* Відправити прогрес (з невеликою затримкою, щоб не слати після кожного кліку) */
  S.push = function (id, now) {
    if (!tok(id) || !pulled[id]) return;
    clearTimeout(timer);
    timer = setTimeout(function () { send(id); }, now ? 0 : 2500);
  };
  function send(id) {
    if (busy) { again = true; return; }
    var p = E.store().profiles[id];
    if (!p) return;
    busy = true;
    var copy = JSON.parse(JSON.stringify(p)); delete copy.srv;
    req("PUT", "progress", id, { p: copy, base: p.srv || 0 }).then(function (d) {
      busy = false;
      if (d.ok && d.upd) { p.srv = d.upd; p.upd = d.upd; E.saveRaw(); S.lastOk = Date.now(); }
      else if (d.conflict && d.p) {
        // інший пристрій зберіг новіше — беремо його версію
        d.p.srv = d.upd; d.p.upd = d.upd; E.store().profiles[id] = d.p; E.saveRaw();
        if (S.onRemote) S.onRemote(id);
      } else if (d._status === 401) S.logout(id);
      if (again) { again = false; send(id); }
    }, function () { busy = false; again = false; });
  }

  /* Звіт татові в Telegram; якщо не вийшло — false (тоді копіюємо як раніше) */
  S.report = function (id, text) {
    if (!tok(id)) return Promise.resolve(false);
    return req("POST", "report", id, { text: text }).then(function (d) { return !!d.ok; }, function () { return false; });
  };

  // повернулись до вкладки — перевірити, чи не займались на іншому пристрої
  document.addEventListener("visibilitychange", function () {
    var id = E.cur();
    if (document.visibilityState !== "visible" || !id || !tok(id) || busy) return;
    var before = (E.store().profiles[id] || {}).srv;
    S.pull(id).then(function (r) { if (r === "updated" && before !== (E.store().profiles[id] || {}).srv && S.onRemote) S.onRemote(id); });
  });
})();
