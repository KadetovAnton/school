/* =====================================================================
   geometry.js — генератори завдань з геометрії (7 клас, НУШ, порядок тем — підручник О. Істер 2024).
   Кожне завдання — щоразу нові числа і власний рисунок (SVG, накреслений у масштабі).
   Числові відповіді — type "num", kb "alg" (як в алгебрі); теорія — choice.
   chk — дані для незалежної перевірки (tools/check_geometry.js).
   ===================================================================== */
(function () {
  "use strict";
  var E = window.E;
  var G = (E.GEN = E.GEN || {});
  var M = "−", D = "°";

  function R(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function hash(t) { var x = 0; for (var i = 0; i < t.length; i++) x = (x * 31 + t.charCodeAt(i)) | 0; return (x >>> 0).toString(36); }
  function dec(v) { return String(Math.round(v * 100) / 100).replace(".", ","); } // 7.5 → «7,5»
  function num(p, a, h, e, extra) {
    var it = { type: "num", kb: "geo", task: "Знайди", p: p, a: String(a).replace(".", ","), h: h, e: e };
    for (var k in extra || {}) it[k] = extra[k];
    if (it.pic) it.uid = hash(it.pic + it.p);
    return it;
  }
  function choice(task, p, right, wrong, h, e, extra) {
    var o = [right], seen = {}; seen[right] = 1;
    wrong.forEach(function (w) { if (!seen[w] && o.length < 4) { seen[w] = 1; o.push(w); } });
    var it = { type: "choice", task: task, p: p, o: shuffle(o), a: right, h: h, e: e };
    for (var k in extra || {}) it[k] = extra[k];
    if (it.keep) it.o = it.keep.filter(function (x) { return seen[x]; });
    delete it.keep;
    if (it.err) { var ee = {}; for (var q in it.err) if (q !== right && it.o.indexOf(q) >= 0) ee[q] = it.err[q]; it.err = ee; }
    if (it.pic) it.uid = hash(it.pic + it.p);
    return it;
  }
  function nk(v) { return typeof v === "number" ? String(v).replace(".", ",") : String(v); }
  function cap(t) { return t.charAt(0).toUpperCase() + t.slice(1); }
  function errs(list, right) { var o = {}; list.forEach(function (x) { var k = nk(x[0]); if (k !== nk(right) && !o[k] && x[1]) o[k] = x[1]; }); return o; }

  /* =================== рисунки (SVG) ===================
     Фігура будується в «модельних» координатах (y угору), при виведенні масштабується
     під ~250×180 px; підписи й дуги — у пікселях, тож однакові на будь-якому рисунку. */
  var C1 = "#4B44E6", C2 = "#E0662B", INK = "#333", GR = "#888";
  function rad(d) { return d * Math.PI / 180; }
  function P(x, y) { return { x: x, y: y }; }
  function pol(c, r, d) { return P(c.x + r * Math.cos(rad(d)), c.y + r * Math.sin(rad(d))); }
  function dist(a, b) { return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y)); }
  function mid(a, b) { return P((a.x + b.x) / 2, (a.y + b.y) / 2); }
  function lerp(a, b, t) { return P(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t); }
  function rotP(p, d, c) { c = c || P(0, 0); var s = Math.sin(rad(d)), co = Math.cos(rad(d)), x = p.x - c.x, y = p.y - c.y; return P(c.x + x * co - y * s, c.y + x * s + y * co); }
  /* перетин прямих p1→p2 і p3→p4 */
  function cross(p1, p2, p3, p4) {
    var d = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
    var a = p1.x * p2.y - p1.y * p2.x, b = p3.x * p4.y - p3.y * p4.x;
    return P((a * (p3.x - p4.x) - (p1.x - p2.x) * b) / d, (a * (p3.y - p4.y) - (p1.y - p2.y) * b) / d);
  }
  function f1(v) { return Math.round(v * 10) / 10; }

  function Fig() { this.L = []; }
  Fig.prototype = {
    seg: function (a, b, o) { this.L.push({ k: "seg", a: a, b: b, o: o || {} }); return this; },
    line: function (a, b, o) { o = o || {}; var e = o.ext == null ? 0.5 : o.ext, d = dist(a, b), ux = (b.x - a.x) / d, uy = (b.y - a.y) / d;
      return this.seg(P(a.x - ux * e, a.y - uy * e), P(b.x + ux * e, b.y + uy * e), o); },
    ray: function (a, b, o) { o = o || {}; var e = o.ext == null ? 0.4 : o.ext, d = dist(a, b); return this.seg(a, P(b.x + (b.x - a.x) / d * e, b.y + (b.y - a.y) / d * e), o); },
    pt: function (p, name, o) { this.L.push({ k: "pt", p: p, name: name, o: o || {} }); return this; },
    arc: function (v, a, b, lab, o) { this.L.push({ k: "arc", v: v, a: a, b: b, lab: lab, o: o || {} }); return this; },
    rt: function (v, a, b, o) { this.L.push({ k: "rt", v: v, a: a, b: b, o: o || {} }); return this; },
    tick: function (a, b, n, o) { this.L.push({ k: "tick", a: a, b: b, n: n || 1, o: o || {} }); return this; },
    circ: function (c, r, o) { this.L.push({ k: "circ", c: c, r: r, o: o || {} }); return this; },
    txt: function (p, s, o) { this.L.push({ k: "txt", p: p, s: s, o: o || {} }); return this; },
    lab: function (a, b, s, o) { this.L.push({ k: "lab", a: a, b: b, s: s, o: o || {} }); return this; },
    svg: function (o) {
      o = o || {};
      var L = this.L, pts = [], cen = [], i;
      L.forEach(function (l) {
        if (l.k === "seg" || l.k === "lab" || l.k === "tick") { pts.push(l.a, l.b); }
        else if (l.k === "pt") { pts.push(l.p); cen.push(l.p); }
        else if (l.k === "arc" || l.k === "rt") pts.push(l.v);
        else if (l.k === "circ") pts.push(P(l.c.x - l.r, l.c.y - l.r), P(l.c.x + l.r, l.c.y + l.r));
        else if (l.k === "txt") pts.push(l.p);
      });
      var minx = Infinity, maxx = -Infinity, miny = Infinity, maxy = -Infinity;
      pts.forEach(function (p) { minx = Math.min(minx, p.x); maxx = Math.max(maxx, p.x); miny = Math.min(miny, p.y); maxy = Math.max(maxy, p.y); });
      var bw = Math.max(maxx - minx, 0.01), bh = Math.max(maxy - miny, 0.01);
      var MW = o.w || 250, MH = o.h || 175, pad = o.pad || 24, s = Math.min(MW / bw, MH / bh);
      var W = bw * s + 2 * pad, H = bh * s + 2 * pad;
      function T(p) { return [pad + (p.x - minx) * s, pad + (maxy - p.y) * s]; }
      var cx = 0, cy = 0; (cen.length ? cen : pts).forEach(function (p) { var t = T(p); cx += t[0]; cy += t[1]; });
      var CEN = [cx / (cen.length || pts.length), cy / (cen.length || pts.length)];
      function n2(v) { var d = Math.sqrt(v[0] * v[0] + v[1] * v[1]); return d < 1e-9 ? [0, -1] : [v[0] / d, v[1] / d]; }
      function r1(v) { return Math.round(v * 10) / 10; }
      var tx0 = 0, ty0 = 0, tx1 = W, ty1 = H;
      function text(x, y, s, col, size) { var hw = String(s).length * (size || 15) * 0.33 + 2, hh = (size || 15) * 0.6 + 2;
        tx0 = Math.min(tx0, x - hw); tx1 = Math.max(tx1, x + hw); ty0 = Math.min(ty0, y - hh); ty1 = Math.max(ty1, y + hh); return '<text x="' + r1(x) + '" y="' + r1(y) + '" dy=".35em" text-anchor="middle" font-size="' + (size || 15) + '" font-weight="800" fill="' + (col || INK) + '">' + s + '</text>'; }
      var out = [], top = [];
      L.forEach(function (l) {
        var q = l.o, a, b, v, t;
        if (l.k === "seg") { a = T(l.a); b = T(l.b);
          out.push('<line x1="' + r1(a[0]) + '" y1="' + r1(a[1]) + '" x2="' + r1(b[0]) + '" y2="' + r1(b[1]) + '" stroke="' + (q.c || INK) + '" stroke-width="' + (q.w || 2) + '"' + (q.dash ? ' stroke-dasharray="5 4"' : "") + ' stroke-linecap="round"/>'); }
        else if (l.k === "circ") { a = T(l.c); out.push('<circle cx="' + r1(a[0]) + '" cy="' + r1(a[1]) + '" r="' + r1(l.r * s) + '" fill="none" stroke="' + (q.c || INK) + '" stroke-width="' + (q.w || 2) + '"' + (q.dash ? ' stroke-dasharray="5 4"' : "") + '/>'); }
        else if (l.k === "arc") {
          v = T(l.v); a = T(l.a); b = T(l.b);
          var ta = Math.atan2(a[1] - v[1], a[0] - v[0]), tb = Math.atan2(b[1] - v[1], b[0] - v[0]), dd = tb - ta;
          while (dd > Math.PI) dd -= 2 * Math.PI; while (dd <= -Math.PI) dd += 2 * Math.PI;
          if (q.flip) dd = dd > 0 ? dd - 2 * Math.PI : dd + 2 * Math.PI;
          var r = q.r || (Math.abs(dd) < 0.45 ? 40 : Math.abs(dd) < 0.8 ? 30 : 22), col = q.c || C1, nn = q.n || 1;
          for (i = 0; i < nn; i++) {
            var rr = r + i * 4, p1 = [v[0] + rr * Math.cos(ta), v[1] + rr * Math.sin(ta)], p2 = [v[0] + rr * Math.cos(ta + dd), v[1] + rr * Math.sin(ta + dd)];
            out.push('<path d="M' + r1(p1[0]) + ' ' + r1(p1[1]) + ' A' + rr + ' ' + rr + ' 0 ' + (Math.abs(dd) > Math.PI ? 1 : 0) + ' ' + (dd > 0 ? 1 : 0) + ' ' + r1(p2[0]) + ' ' + r1(p2[1]) + '" fill="' + (q.fill && i === 0 ? col + "22" : "none") + '" stroke="' + col + '" stroke-width="2"/>');
          }
          if (l.lab != null && l.lab !== "") { var tm = ta + dd / 2, lr = r + (nn - 1) * 4 + (q.lr || (String(l.lab).length > 3 ? 18 : 13));
            top.push(text(v[0] + lr * Math.cos(tm), v[1] + lr * Math.sin(tm), l.lab, q.tc || col, q.fs || 14)); }
        }
        else if (l.k === "rt") { v = T(l.v); a = n2([T(l.a)[0] - v[0], T(l.a)[1] - v[1]]); b = n2([T(l.b)[0] - v[0], T(l.b)[1] - v[1]]); var z = q.z || 11;
          out.push('<path d="M' + r1(v[0] + a[0] * z) + ' ' + r1(v[1] + a[1] * z) + ' L' + r1(v[0] + a[0] * z + b[0] * z) + ' ' + r1(v[1] + a[1] * z + b[1] * z) + ' L' + r1(v[0] + b[0] * z) + ' ' + r1(v[1] + b[1] * z) + '" fill="none" stroke="' + (q.c || C1) + '" stroke-width="1.8"/>'); }
        else if (l.k === "tick") { a = T(l.a); b = T(l.b); var m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], u = n2([b[0] - a[0], b[1] - a[1]]), nr = [-u[1], u[0]];
          for (i = 0; i < l.n; i++) { var off = (i - (l.n - 1) / 2) * 5, c0 = [m[0] + u[0] * off, m[1] + u[1] * off];
            out.push('<line x1="' + r1(c0[0] - nr[0] * 6) + '" y1="' + r1(c0[1] - nr[1] * 6) + '" x2="' + r1(c0[0] + nr[0] * 6) + '" y2="' + r1(c0[1] + nr[1] * 6) + '" stroke="' + (q.c || C2) + '" stroke-width="2.2"/>'); } }
        else if (l.k === "pt") { t = T(l.p);
          if (q.dot !== false) out.push('<circle cx="' + r1(t[0]) + '" cy="' + r1(t[1]) + '" r="' + (q.big ? 4 : 3) + '" fill="' + (q.c || INK) + '"/>');
          if (l.name) { var dir = q.dir ? n2(q.dir) : n2([t[0] - (q.away ? T(q.away)[0] : CEN[0]), t[1] - (q.away ? T(q.away)[1] : CEN[1])]), dl = q.dl || 13;
            top.push(text(t[0] + dir[0] * dl, t[1] + dir[1] * dl, l.name, q.c || INK, q.fs || 16)); } }
        else if (l.k === "lab") { a = T(l.a); b = T(l.b); var mm = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], uu = n2([b[0] - a[0], b[1] - a[1]]), nn2 = [-uu[1], uu[0]];
          var aw = q.away ? T(q.away) : CEN; if ((mm[0] - aw[0]) * nn2[0] + (mm[1] - aw[1]) * nn2[1] < 0) nn2 = [-nn2[0], -nn2[1]];
          if (q.at != null) mm = [a[0] + (b[0] - a[0]) * q.at, a[1] + (b[1] - a[1]) * q.at];
          var tw = String(l.s).length * 4.2, od = (q.d || 9) + Math.abs(nn2[0]) * tw + Math.abs(nn2[1]) * 6; top.push(text(mm[0] + nn2[0] * od, mm[1] + nn2[1] * od, l.s, q.c || (l.s === "?" ? C2 : C1), q.fs || 14)); }
        else if (l.k === "txt") { t = T(l.p); top.push(text(t[0] + (q.dx || 0), t[1] + (q.dy || 0), l.s, q.c || INK, q.fs || 15)); }
      });
      var VW = tx1 - tx0, VH = ty1 - ty0;
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + r1(tx0) + ' ' + r1(ty0) + ' ' + r1(VW) + ' ' + r1(VH) + '" width="' + r1(VW) + '" height="' + r1(VH) + '" style="max-width:100%;height:auto;background:#fff;border-radius:10px" letter-spacing="0">' + out.join("") + top.join("") + '</svg>';
    }
  };
  E.GEO = { Fig: Fig, P: P, pol: pol, mid: mid, lerp: lerp, rotP: rotP, cross: cross, dist: dist, C1: C1, C2: C2 };

  /* підпис кута: число з «°» або «?» (невідомий — помаранчевим) */
  function AL(v) { return typeof v === "number" ? v + D : v; }
  function aOpt(v) { return v === "?" ? { c: C2 } : {}; }

  /* =================== Розділ 1. Елементарні фігури =================== */
  var LET = ["A", "B", "C", "D", "K", "M", "N", "P"];

  /* §1. Точка, пряма, промінь */
  G.gPts = function (a) {
    var t = a.tt || pick(a.easy ? ["onl", "lines"] : ["lines", "onl", "rays", "segs", "name"]), n, r;
    if (t === "lines") { n = a.easy ? 3 + R(0, 1) : R(4, 7); r = n * (n - 1) / 2;
      return num("Скільки прямих можна провести через " + n + (n < 5 ? " точки" : " точок") + ", жодні три з яких не лежать на одній прямій?\nПрямих: ___", r,
        ["Пряма проходить через дві точки. Порахуй, скільки різних пар точок можна утворити.", "Кожну з " + n + " точок можна з'єднати з " + (n - 1) + " іншими: " + n + " · " + (n - 1) + " = " + n * (n - 1) + ". Але так кожну пряму пораховано двічі."],
        "Через кожні дві точки — одна пряма. Пар точок: " + n + " · " + (n - 1) + " : 2 = <b>" + r + "</b>.",
        { tt: t, long: true, err: errs([[n * (n - 1), "Кожну пряму пораховано двічі: пряма AB і пряма BA — та сама. Поділи на 2."], [n, "Прямі проводимо через <b>пари</b> точок, тож їх більше, ніж точок."]], r), chk: { v: n + "*" + (n - 1) + "/2" } }); }
    if (t === "rays" || t === "segs") { n = R(2, 5);
      r = t === "rays" ? 2 * n : n * (n - 1) / 2;
      var pic = new Fig(), on = [];
      for (var i = 0; i < n; i++) { var p = P(i * 1.3 + Math.random() * 0.5, 0); on.push(p); }
      pic.line(on[0], on[n - 1], { ext: 0.9 }); on.forEach(function (p, i) { pic.pt(p, LET[i], { dir: [0, -1] }); });
      return num("На прямій позначили " + n + (n > 4 ? " точок" : " точки") + ".\nСкільки " + (t === "rays" ? "променів з початком у цих точках" : "відрізків з кінцями в цих точках") + " утворилося?\nВідповідь: ___", r,
        t === "rays" ? ["Кожна точка ділить пряму на два промені.", "З кожної з " + n + " точок виходять 2 промені: ліворуч і праворуч."] : ["Відрізок задають два кінці. Порахуй пари точок.", "Кожну точку можна з'єднати з " + (n - 1) + " іншими, але AB і BA — той самий відрізок."],
        t === "rays" ? "Кожна точка — початок двох променів: " + n + " · 2 = <b>" + r + "</b>." : "Пар точок: " + n + " · " + (n - 1) + " : 2 = <b>" + r + "</b>.",
        { tt: t, long: true, pic: pic.svg({ h: 60 }), err: t === "rays" ? errs([[n, "З кожної точки виходять <b>два</b> промені — у різні боки."], [n - 1, "Це кількість проміжків між точками. А промінь починається в точці й іде безмежно в один бік: з кожної точки — два."]], r) : errs([[n - 1, "Це лише відрізки між сусідніми точками. Є ще довші: AC, AD…"], [n * (n - 1), "Відрізок AB і BA — той самий, поділи на 2."]], r),
          chk: { v: t === "rays" ? "2*" + n : n + "*" + (n - 1) + "/2" } }); }
    if (t === "onl") {
      var k = R(2, 4), m = R(1, 3), ang = R(-20, 20), pic2 = new Fig(), names = shuffle(LET.slice(0, k + m)), pts = [], A0 = P(-0.3, 0), B0 = P(k * 1.2 + 0.6, 0);
      for (i = 0; i < k; i++) pts.push({ p: P(i * 1.2 + 0.3 + Math.random() * 0.4, 0), on: true });
      for (i = 0; i < m; i++) pts.push({ p: P((i + 0.5) * k * 1.2 / m + (Math.random() - 0.5) * 0.3, (i % 2 ? -1 : 1) * (Math.random() < 0.5 ? 1 : -1) * (0.6 + Math.random() * 0.35)), on: false });
      var aL = rotP(A0, ang), bL = rotP(B0, ang); pic2.line(aL, bL, { ext: 0.3 }); pic2.txt(bL, "a", { dx: 10, dy: -10, c: C1 });
      var onN = [];
      pts.forEach(function (q, i) { var pp = rotP(q.p, ang); pic2.pt(pp, names[i], { dir: q.on ? [0.35, -1] : [0, q.p.y > 0 ? -1 : 1] }); if (q.on) onN.push(names[i]); });
      var notQ = Math.random() < 0.4, ans = notQ ? m : k;
      return num("Скільки позначених точок " + (notQ ? "НЕ лежать" : "лежать") + " на прямій a?\nВідповідь: ___", ans,
        ["Точка лежить на прямій, якщо пряма проходить через неї.", "Через які точки проходить лінія a? Порахуй " + (notQ ? "решту" : "їх") + "."],
        "На прямій a лежать точки " + onN.sort().join(", ") + " — їх " + k + ". Решта (" + m + ") — поза прямою. Відповідь: <b>" + ans + "</b>.",
        { tt: t, long: true, pic: pic2.svg({ h: 110 }), err: errs([[notQ ? k : m, notQ ? "Це точки, що <b>лежать</b> на прямій. А питали про ті, що не лежать." : "Це точки поза прямою. Порахуй ті, через які проходить пряма a."], [k + m, "Це всі точки. Не всі вони лежать на прямій a."]], ans), chk: { v: String(ans) } });
    }
    // name: той самий промінь
    var o = R(-25, 25), O = P(0, 0), A1 = pol(O, 1.4, o), B1 = pol(O, 2.8, o), f = new Fig();
    f.ray(O, B1, { ext: 0.8 }); f.pt(O, "O", { dir: [0, -1] }); f.pt(A1, "A", { dir: [0, -1] }); f.pt(B1, "B", { dir: [0, -1] });
    var askS = Math.random() < 0.5;
    return choice("Обери", askS ? "Який запис позначає той самий промінь, що й OA?" : "Який запис позначає той самий промінь, що й OB?", askS ? "OB" : "OA", askS ? ["AO", "AB", "BO"] : ["AO", "AB", "BO"],
      ["Промінь називають двома буквами: <b>спершу — його початок</b>, потім будь-яка інша точка променя.", "Початок променя на рисунку — точка O. Отже, назва починається з O."],
      "Промінь починається в точці O і проходить через A і B. Тому OA і OB — той самий промінь. Відповідь: <b>" + (askS ? "OB" : "OA") + "</b>.",
      { tt: "name", pic: f.svg({ h: 60 }), err: { "AO": "Промінь AO починався б у точці A і йшов би до O — у протилежний бік. Спершу пишемо початок.", "AB": "Промінь AB починається в A і не містить точки O. А наш промінь починається в O.", "BO": "Перша буква — початок променя. Промінь BO починався б у точці B." }, chk: { pick: askS ? "OB" : "OA" } });
  };

  /* §2. Відрізок: частини, сума, різниця */
  function segPic(parts, labs, names, ticks) { // parts — довжини частин (масштаб), labs — підписи над частинами
    var f = new Fig(), x = 0, ang = R(-8, 8), pts = [P(0, 0)];
    parts.forEach(function (p) { x += p; pts.push(P(x, 0)); });
    pts = pts.map(function (p) { return rotP(p, ang); });
    f.seg(pts[0], pts[pts.length - 1], { w: 2.5 });
    pts.forEach(function (p, i) { f.pt(p, names[i], { dir: [0, 1] }); });
    (ticks || []).forEach(function (n, i) { if (n) f.tick(pts[i], pts[i + 1], n); });
    labs.forEach(function (l, i) { if (l && i < parts.length) f.lab(pts[i], pts[i + 1], l, { away: P(pts[i].x, pts[i].y - 5), c: l === "?" ? C2 : C1, d: ticks && ticks[i] ? 17 : 12 }); });
    return f;
  }
  G.gSeg = function (a) {
    var t = a.tt || pick(a.easy ? ["sum", "diff"] : ["sum", "diff", "more", "ratio", "betw", "two"]), x, y, s, k, m, n, f;
    if (t === "two") { x = R(5, 15); y = R(2, x - 1); var both = x + y + " см або " + (x - y) + " см";
      return choice("Обери", "Точки A, B і C лежать на одній прямій, AB = " + x + " см, BC = " + y + " см.\nЯкою може бути довжина AC?", both, ["лише " + (x + y) + " см", "лише " + (x - y) + " см", "будь-якою"],
        ["Де може бути точка C відносно відрізка AB? Намалюй обидва варіанти.", "C може лежати за точкою B (тоді AC = AB + BC) або між A і B (тоді AC = AB − BC)."],
        "Два випадки: C за точкою B — AC = " + x + " + " + y + " = " + (x + y) + " см; C між A і B — AC = " + x + " − " + y + " = " + (x - y) + " см. Відповідь: <b>" + both + "</b>.",
        { tt: t, long: true, err: errs([["лише " + (x + y) + " см", "Точка C може лежати й між A і B — тоді AC = AB − BC."], ["лише " + (x - y) + " см", "Точка C може лежати й за точкою B — тоді AC = AB + BC."], ["будь-якою", "Точки на одній прямій — лише два варіанти розміщення C."]], both), chk: { pick: both } }); }
    if (t === "betw") {
      var AB = R(3, 15), BC = R(2, 14), w = pick(["B", "C", "A"]), AC;
      if (AB === BC) BC++;
      if (w === "B") AC = AB + BC; else if (w === "C") { if (AB <= BC) { var tt = AB; AB = BC; BC = tt; } AC = AB - BC; } else { if (BC <= AB) { var t2 = AB; AB = BC; BC = t2; } AC = BC - AB; }
      var why = w === "B" ? "AB + BC = " + AB + " + " + BC + " = " + AC + " = AC" : w === "C" ? "AC + CB = " + AC + " + " + BC + " = " + AB + " = AB" : "BA + AC = " + AB + " + " + AC + " = " + BC + " = BC";
      return choice("Обери", "Точки A, B і C лежать на одній прямій.\nAB = " + AB + " см, BC = " + BC + " см, AC = " + AC + " см.\nЯка з точок лежить між двома іншими?", w, ["A", "B", "C"].filter(function (z) { return z !== w; }),
        ["Якщо точка лежить між двома іншими, то два менші відрізки разом дають найбільший.", "Знайди найбільший з трьох відрізків. Точка, якої в його назві немає, — посередині."],
        "Найбільший відрізок — " + (w === "B" ? "AC" : w === "C" ? "AB" : "BC") + ". Перевіряємо: " + why + ". Отже, між двома іншими лежить точка <b>" + w + "</b>.",
        { tt: t, keep: ["A", "B", "C"], chk: { betw: [AB, BC, AC], w: w } });
    }
    if (t === "sum") { x = R(2, 12); y = R(2, 12); s = x + y; f = segPic([x, y], [x + " см", y + " см"], ["A", "C", "B"]);
      return num("Точка C лежить на відрізку AB.\nAC = " + x + " см, CB = " + y + " см.\nAB = ___ см", s,
        ["Точка C ділить відрізок AB на дві частини.", "Довжина всього відрізка — сума частин: AB = AC + CB."], "AB = AC + CB = " + x + " + " + y + " = <b>" + s + "</b> см.",
        { tt: t, long: true, pic: f.svg({ h: 60 }), err: errs([[Math.abs(x - y), "Відрізок AB складається з AC і CB, тож довжини треба <b>додати</b>."]], s), chk: { v: x + "+" + y } }); }
    if (t === "diff") { x = R(2, 12); y = R(2, 12); s = x + y; f = segPic([x, y], [x + " см", "?"], ["A", "C", "B"]);
      return num("Точка C лежить на відрізку AB.\nAB = " + s + " см, AC = " + x + " см.\nCB = ___ см", y,
        ["AB = AC + CB. Відомі весь відрізок і одна частина.", "Щоб знайти частину, від цілого віднімаємо іншу частину: CB = AB − AC."], "CB = AB − AC = " + s + " − " + x + " = <b>" + y + "</b> см.",
        { tt: t, long: true, pic: f.svg({ h: 60 }), err: errs([[s + x, "CB — лише частина AB, вона менша за AB. Від цілого віднімаємо частину."]], y), chk: { v: s + "-" + x } }); }
    if (t === "more") { x = R(2, 10); k = R(1, 8); y = x + k; s = x + y; f = segPic([x, y], ["?", ""], ["A", "C", "B"]);
      return num("Точка C лежить на відрізку AB, AB = " + s + " см.\nВідрізок CB на " + k + " см довший за AC.\nAC = ___ см", x,
        ["Познач AC = x, тоді CB = x + " + k + ".", "x + (x + " + k + ") = " + s + ", тобто 2x = " + (s - k) + "."],
        "Нехай AC = x, тоді CB = x + " + k + ".<br>x + x + " + k + " = " + s + "; 2x = " + (s - k) + "; x = <b>" + x + "</b> см.",
        { tt: t, long: true, pic: f.svg({ h: 60 }), err: errs([[y, "Це CB — довша частина. А питали AC."], [(s - k), "Це 2x — подвоєна AC. Поділи на 2."], [s / 2, "Частини не рівні: CB довша на " + k + " см."]], x), chk: { v: "(" + s + "-" + k + ")/2" } }); }
    // ratio
    m = R(1, 5); n = R(m + 1, 7); k = R(1, 4); x = m * k; y = n * k; s = x + y; var askBig = Math.random() < 0.5;
    f = segPic([x, y], [askBig ? "" : "?", askBig ? "?" : ""], ["A", "C", "B"]);
    var ans = askBig ? y : x;
    return num("Точка C ділить відрізок AB = " + s + " см у відношенні AC : CB = " + m + " : " + n + ".\n" + (askBig ? "CB" : "AC") + " = ___ см", ans,
      ["Одна частина — x. Тоді AC = " + m + "x, CB = " + n + "x.", m + "x + " + n + "x = " + s + ", тобто " + (m + n) + "x = " + s + "."],
      "AC = " + m + "x, CB = " + n + "x; " + (m + n) + "x = " + s + "; x = " + k + ".<br>" + (askBig ? "CB = " + n + " · " + k : "AC = " + m + " · " + k) + " = <b>" + ans + "</b> см.",
      { tt: t, long: true, pic: f.svg({ h: 60 }), err: errs([[askBig ? x : y, "Це " + (askBig ? "AC" : "CB") + ". Перевір, яку частину питали."], [k, "Це одна частина (x). Помнож на " + (askBig ? n : m) + "."]], ans), chk: { v: s + "/" + (m + n) + "*" + (askBig ? n : m) } });
  };
  /* §2. Середина відрізка */
  G.gMid = function (a) {
    var t = a.tt || pick(a.easy ? ["full", "half"] : ["full", "half", "mn", "part"]), x, y, f;
    if (t === "full") { x = R(2, 15); f = segPic([x, x], [x + " см", ""], ["A", "M", "B"], [1, 1]);
      return num("M — середина відрізка AB, AM = " + x + " см.\nAB = ___ см", 2 * x,
        ["Середина ділить відрізок на дві <b>рівні</b> частини: AM = MB.", "AB = AM + MB = " + x + " + " + x + "."], "AM = MB = " + x + " см, тож AB = 2 · " + x + " = <b>" + 2 * x + "</b> см.",
        { tt: t, long: true, pic: f.svg({ h: 60 }), err: errs([[x / 2, "M — середина AB, тож AB удвічі <b>більший</b> за AM."]], 2 * x), chk: { v: "2*" + x } }); }
    if (t === "half") { x = R(5, 29); var h = x / 2; f = segPic([h, h], ["?", ""], ["A", "M", "B"], [1, 1]);
      return num("M — середина відрізка AB, AB = " + x + " см.\nAM = ___ см", dec(h),
        ["Середина ділить відрізок навпіл.", "AM = AB : 2 = " + x + " : 2." + (x % 2 ? " Відповідь може бути десятковим дробом (кома — клавіша «,»)." : "")], "AM = AB : 2 = " + x + " : 2 = <b>" + dec(h) + "</b> см.",
        { tt: t, long: true, pic: f.svg({ h: 60 }), err: errs([[2 * x, "AM — половина AB, вона менша за AB."]], dec(h)), chk: { v: x + "/2" } }); }
    if (t === "mn") { x = R(2, 9); y = R(2, 9); var AC = 2 * x + 2 * y;
      f = new Fig(); var ps = [P(0, 0), P(x, 0), P(2 * x, 0), P(2 * x + y, 0), P(2 * x + 2 * y, 0)], nm = ["A", "M", "B", "N", "C"];
      f.seg(ps[0], ps[4], { w: 2.5 }); ps.forEach(function (p, i) { f.pt(p, nm[i], { dir: [0, 1] }); }); f.tick(ps[0], ps[1], 1); f.tick(ps[1], ps[2], 1); f.tick(ps[2], ps[3], 2); f.tick(ps[3], ps[4], 2);
      return num("Точка B лежить на відрізку AC, AC = " + AC + " см.\nM — середина AB, N — середина BC.\nMN = ___ см", AC / 2,
        ["MN = MB + BN. MB — половина AB, BN — половина BC.", "MB + BN = (AB + BC) : 2 = AC : 2."], "MN = MB + BN = AB : 2 + BC : 2 = AC : 2 = " + AC + " : 2 = <b>" + AC / 2 + "</b> см. Цікаво: відповідь не залежить від того, де саме точка B!",
        { tt: t, long: true, pic: f.svg({ h: 60 }), err: errs([[AC, "MN — лише частина AC: половина AB плюс половина BC."], [AC / 4, "MN = MB + BN, обидві половинки разом дають половину AC."]], AC / 2), chk: { v: AC + "/2" } }); }
    // part: C на AB, M — середина AC
    x = R(2, 9); y = R(2, 12); f = segPic([x, x, y], [x + " см", "", y + " см"], ["A", "M", "C", "B"], [1, 1, 0]);
    return num("Точка C лежить на відрізку AB, M — середина AC.\nAM = " + x + " см, CB = " + y + " см.\nAB = ___ см", 2 * x + y,
      ["Спершу знайди AC: M — середина, тож AC = 2 · AM.", "AB = AC + CB."], "AC = 2 · " + x + " = " + 2 * x + " см; AB = AC + CB = " + 2 * x + " + " + y + " = <b>" + (2 * x + y) + "</b> см.",
      { tt: t, long: true, pic: f.svg({ h: 60 }), err: errs([[x + y, "AM — лише половина AC. Спершу AC = 2 · AM."]], 2 * x + y), chk: { v: "2*" + x + "+" + y } });
  };

  /* §3. Кути: рисунок кута з променем всередині */
  function angPic(parts, labs, names, base) { // parts: [α, β] (градуси), labs: підписи дуг; names: [A, C, B, O]
    var f = new Fig(), O = P(0, 0), b0 = base == null ? R(-10, 15) : base, tot = 0, rays = [b0];
    parts.forEach(function (p) { tot += p; rays.push(b0 + tot); });
    var ends = rays.map(function (d) { return pol(O, 2.2, d); });
    ends.forEach(function (p, i) { f.seg(O, p); });
    ends.forEach(function (p, i) { f.pt(p, names[i], { dot: false, dir: [Math.cos(rad(rays[i])), -Math.sin(rad(rays[i]))] }); });
    f.pt(O, names[names.length - 1], { dir: [-Math.cos(rad(b0 + tot / 2)), Math.sin(rad(b0 + tot / 2))] });
    parts.forEach(function (p, i) { if (labs[i] !== null) f.arc(O, ends[i], ends[i + 1], AL(labs[i]), { c: labs[i] === "?" ? C2 : C1, r: (parts[i] < 30 ? 46 : 32) + i * 12, n: 1 }); });
    return f;
  }
  G.gAng = function (a) {
    var t = a.tt || pick(a.easy ? ["sum", "diff"] : ["sum", "diff", "more", "ratio"]), x, y, k, m, n, f;
    if (t === "sum") { x = R(15, 85); y = R(15, 175 - x);
      f = angPic([x, y], [x, y], ["A", "C", "B", "O"]);
      return num("Промінь OC проходить між сторонами кута AOB.\n∠AOC = " + x + D + ", ∠COB = " + y + D + ".\n∠AOB = ___" + D, x + y,
        ["Промінь OC ділить кут AOB на два кути.", "∠AOB = ∠AOC + ∠COB."], "∠AOB = ∠AOC + ∠COB = " + x + D + " + " + y + D + " = <b>" + (x + y) + D + "</b>.",
        { tt: t, long: true, pic: f.svg({ h: 150 }), err: errs([[Math.abs(x - y), "Промінь всередині кута ділить його на частини, тож кути <b>додаємо</b>."]], x + y), chk: { v: x + "+" + y } }); }
    if (t === "diff") { x = R(15, 85); y = R(15, 175 - x); var s = x + y;
      f = angPic([x, y], [x, "?"], ["A", "C", "B", "O"]);
      return num("Промінь OC проходить між сторонами кута AOB.\n∠AOB = " + s + D + ", ∠AOC = " + x + D + ".\n∠COB = ___" + D, y,
        ["∠AOB = ∠AOC + ∠COB.", "Невідома частина = ціле − відома частина: ∠COB = ∠AOB − ∠AOC."], "∠COB = " + s + D + " − " + x + D + " = <b>" + y + D + "</b>.",
        { tt: t, long: true, pic: f.svg({ h: 150 }), err: errs([[s + x, "∠COB — частина кута AOB, тож він менший за ∠AOB."]], y), chk: { v: s + "-" + x } }); }
    if (t === "more") { y = R(15, 70); k = R(4, 40); x = y + k; if (x + y > 178) { y = 50; k = 20; x = 70; }
      f = angPic([x, y], ["?", null], ["A", "C", "B", "O"]);
      return num("Промінь OC ділить кут AOB = " + (x + y) + D + " на два кути.\n∠AOC на " + k + D + " більший за ∠COB.\n∠AOC = ___" + D, x,
        ["Нехай ∠COB = x, тоді ∠AOC = x + " + k + ".", "x + x + " + k + " = " + (x + y) + "; 2x = " + (x + y - k) + "."],
        "∠COB = x, ∠AOC = x + " + k + ".<br>2x + " + k + " = " + (x + y) + "; x = " + y + D + ".<br>∠AOC = " + y + D + " + " + k + D + " = <b>" + x + D + "</b>.",
        { tt: t, long: true, pic: f.svg({ h: 150 }), err: errs([[y, "Це менший кут ∠COB. ∠AOC на " + k + D + " більший."], [x + y - k, "Це 2x. Поділи на 2 і додай " + k + D + "."]], x), chk: { v: "(" + (x + y) + "-" + k + ")/2+" + k } }); }
    m = R(1, 4); n = R(m + 1, 7); do { k = R(5, 30); } while ((m + n) * k > 178); x = m * k; y = n * k;
    var big = Math.random() < 0.5, ans = big ? y : x;
    f = angPic([x, y], [big ? null : "?", big ? "?" : null], ["A", "C", "B", "O"]);
    return num("Промінь OC ділить кут AOB = " + (x + y) + D + " у відношенні ∠AOC : ∠COB = " + m + " : " + n + ".\n" + (big ? "∠COB" : "∠AOC") + " = ___" + D, ans,
      ["Одна частина — x: ∠AOC = " + m + "x, ∠COB = " + n + "x.", (m + n) + "x = " + (x + y) + D + "."],
      (m + n) + "x = " + (x + y) + "; x = " + k + D + ".<br>" + (big ? "∠COB = " + n : "∠AOC = " + m) + " · " + k + D + " = <b>" + ans + D + "</b>.",
      { tt: "ratio", long: true, pic: f.svg({ h: 150 }), err: errs([[big ? x : y, "Це інший кут. Перевір, який питали."], [k, "Це одна частина. Помнож на " + (big ? n : m) + "."]], ans), chk: { v: (x + y) + "/" + (m + n) + "*" + (big ? n : m) } });
  };
  /* §3. Види кутів */
  var KINDS = ["гострий", "прямий", "тупий", "розгорнутий"];
  function kindOf(d) { return d < 90 ? "гострий" : d === 90 ? "прямий" : d < 180 ? "тупий" : "розгорнутий"; }
  G.gKind = function (a) {
    var t = a.tt || pick(a.easy ? ["deg"] : ["deg", "deg", "pic", "adj"]), d, f, r;
    var why = "Гострий — менший за 90" + D + ", прямий — 90" + D + ", тупий — більший за 90" + D + ", але менший за 180" + D + ", розгорнутий — 180" + D + ".";
    var errK = { "гострий": "Гострий кут менший за 90" + D + ".", "прямий": "Прямий кут — рівно 90" + D + ".", "тупий": "Тупий кут більший за 90" + D + ", але менший за 180" + D + ".", "розгорнутий": "Розгорнутий кут — 180" + D + ": його сторони утворюють пряму." };
    if (t === "deg") { d = pick([R(5, 89), R(91, 179), R(5, 89), R(91, 179), 90, 180]); r = kindOf(d);
      var e1 = {}; KINDS.forEach(function (k) { if (k !== r) e1[k] = errK[k]; });
      return choice("Обери", "Який вид має кут " + d + D + "?", r, KINDS, ["Порівняй кут з 90" + D + " і 180" + D + ".", why], d + D + (d < 90 ? " < 90" + D : d === 90 ? " = 90" + D : d < 180 ? " — між 90" + D + " і 180" + D : " = 180" + D) + ", тож кут <b>" + r + "</b>.",
        { tt: t, keep: KINDS, err: e1, chk: { deg: d } }); }
    if (t === "pic") { d = pick([R(20, 70), R(110, 165), 90, 180]); r = kindOf(d);
      f = new Fig(); var O = P(0, 0), b0 = R(-15, 25), A1 = pol(O, 2, b0), B1 = pol(O, 2, b0 + d);
      f.seg(O, A1); f.seg(O, B1); f.pt(O, "O", { dir: [-Math.cos(rad(b0 + d / 2)), Math.sin(rad(b0 + d / 2))] }); f.pt(A1, "A", { dot: false }); f.pt(B1, "B", { dot: false });
      if (d === 90) f.rt(O, A1, B1); else f.arc(O, A1, B1, "", { r: 18 });
      var e2 = {}; KINDS.forEach(function (k) { if (k !== r) e2[k] = errK[k]; });
      return choice("Обери", "Який вид має кут AOB на рисунку?", r, KINDS, ["Порівняй з прямим кутом (кут зошита, позначка □).", why],
        "Кут на рисунку " + (d === 90 ? "позначено квадратиком — він прямий" : d === 180 ? "має сторони на одній прямій — розгорнутий" : d < 90 ? "менший за прямий — гострий" : "більший за прямий, але менший за розгорнутий — тупий") + ". Відповідь: <b>" + r + "</b>.",
        { tt: t, keep: KINDS, pic: f.svg({ h: 130 }), err: e2, chk: { deg: d } }); }
    // adj: ∠AOB — розгорнутий, ∠AOC — гострий → ∠COB?
    d = R(15, 80); var sharp = Math.random() < 0.5, x = sharp ? d : 180 - d, y = 180 - x; r = kindOf(y);
    f = angPic([x, y], [x, "?"], ["A", "C", "B", "O"], 0);
    return choice("Обери", "∠AOB — розгорнутий, OC — промінь між його сторонами.\n∠AOC = " + x + D + ". Який вид має кут COB?", r, KINDS,
      ["Розгорнутий кут — 180" + D + ". Знайди ∠COB = 180" + D + " − ∠AOC.", why], "∠COB = 180" + D + " − " + x + D + " = " + y + D + ", тож він <b>" + r + "</b>.",
      { tt: "adj", keep: KINDS, long: true, pic: f.svg({ h: 120 }), err: errs([[kindOf(x), "Це вид кута AOC. А ∠COB = 180" + D + " − " + x + D + " = " + y + D + "."]], r), chk: { deg: y } });
  };
  /* §3. Бісектриса кута */
  G.gBis = function (a) {
    var t = a.tt || pick(a.easy ? ["half", "full"] : ["half", "full", "inner", "inner"]), x, f, b0 = R(-10, 15), O = P(0, 0);
    function bisPic(tot, lab1, lab2, extra) {
      f = new Fig(); var A1 = pol(O, 2.2, b0), B1 = pol(O, 2.2, b0 + tot), K1 = pol(O, 2.4, b0 + tot / 2);
      f.seg(O, A1); f.seg(O, B1); f.seg(O, K1, { c: C1, w: 2.2 });
      f.pt(A1, "A", { dot: false }); f.pt(B1, "B", { dot: false }); f.pt(K1, "K", { dot: false, c: C1 }); f.pt(O, "O", { dir: [-Math.cos(rad(b0 + tot / 2)), Math.sin(rad(b0 + tot / 2))] });
      f.arc(O, A1, K1, lab1, { r: tot < 60 ? 46 : 32, c: lab1 === "?" ? C2 : C1 }); f.arc(O, K1, B1, lab2, { r: tot < 60 ? 46 : 32, c: lab2 === "?" ? C2 : C1 });
      return f;
    }
    if (t === "half") { x = 2 * R(10, 89);
      return num("OK — бісектриса кута AOB, ∠AOB = " + x + D + ".\n∠AOK = ___" + D, x / 2, ["Бісектриса ділить кут <b>навпіл</b>.", "∠AOK = ∠AOB : 2."], "∠AOK = " + x + D + " : 2 = <b>" + x / 2 + D + "</b>.",
        { tt: t, long: true, pic: bisPic(x, "?", "").svg({ h: 150 }), err: errs([[2 * x, "∠AOK — половина кута AOB, він менший."]], x / 2), chk: { v: x + "/2" } }); }
    if (t === "full") { x = R(10, 89);
      return num("OK — бісектриса кута AOB, ∠KOB = " + x + D + ".\n∠AOB = ___" + D, 2 * x, ["Бісектриса ділить кут на два рівні кути: ∠AOK = ∠KOB.", "∠AOB = ∠AOK + ∠KOB = 2 · " + x + D + "."], "∠AOB = 2 · " + x + D + " = <b>" + 2 * x + D + "</b>.",
        { tt: t, long: true, pic: bisPic(2 * x, "", x + D).svg({ h: 150 }), err: errs([[x / 2, "∠KOB — половина кута AOB. Цілий кут удвічі більший."]], 2 * x), chk: { v: "2*" + x } }); }
    // inner: OC між OA і OB, OK — бісектриса ∠COB; ∠AOC = p, ∠AOB = q → ∠AOK
    var p = R(15, 80), q; do { q = p + 2 * R(15, 60); } while (q > 178);
    f = new Fig(); var A1 = pol(O, 2.2, b0), C3 = pol(O, 2.2, b0 + p), B1 = pol(O, 2.2, b0 + q), K1 = pol(O, 2.4, b0 + (p + q) / 2);
    f.seg(O, A1); f.seg(O, C3); f.seg(O, B1); f.seg(O, K1, { c: C1, w: 2.2 }); f.pt(A1, "A", { dot: false }); f.pt(C3, "C", { dot: false }); f.pt(B1, "B", { dot: false }); f.pt(K1, "K", { dot: false, c: C1 });
    f.pt(O, "O", { dir: [-Math.cos(rad(b0 + q / 2)), Math.sin(rad(b0 + q / 2))] }); f.arc(O, A1, C3, p + D, { r: p < 30 ? 50 : 32 }); f.arc(O, C3, K1, "", { r: 44, c: C2 }); f.arc(O, K1, B1, "", { r: 44, c: C2 });
    var ans = p + (q - p) / 2;
    return num("Промінь OC проходить між сторонами кута AOB = " + q + D + ", ∠AOC = " + p + D + ".\nOK — бісектриса кута COB.\n∠AOK = ___" + D, ans,
      ["Спершу знайди ∠COB = ∠AOB − ∠AOC.", "Бісектриса ділить ∠COB навпіл: ∠COK = ∠COB : 2. Потім ∠AOK = ∠AOC + ∠COK."],
      "∠COB = " + q + D + " − " + p + D + " = " + (q - p) + D + "; ∠COK = " + (q - p) / 2 + D + ".<br>∠AOK = " + p + D + " + " + (q - p) / 2 + D + " = <b>" + ans + D + "</b>.",
      { tt: "inner", long: true, pic: f.svg({ h: 150 }), err: errs([[(q - p) / 2, "Це ∠COK. Додай ще ∠AOC = " + p + D + "."], [q / 2, "OK — бісектриса кута COB, а не AOB."]], ans), chk: { v: p + "+(" + q + "-" + p + ")/2" } });
  };

  /* =================== Розділ 2. Взаємне розміщення прямих =================== */
  /* §4. Аксіоми, теореми, означення */
  var AX = ["Через будь-які дві точки можна провести пряму, і до того ж тільки одну.", "Через точку, що не лежить на даній прямій, можна провести лише одну пряму, паралельну даній.", "Кожен відрізок має певну довжину, більшу за нуль.", "Кожен кут має певну градусну міру, більшу за нуль; розгорнутий кут дорівнює 180" + D + ".", "Яка б не була пряма, існують точки, що їй належать, і точки, що їй не належать."];
  var TH = ["Сума суміжних кутів дорівнює 180" + D + ".", "Вертикальні кути рівні.", "Дві прямі, перпендикулярні до третьої, паралельні між собою.", "Через кожну точку прямої можна провести лише одну пряму, перпендикулярну до неї.", "Якщо два кути рівні, то й суміжні з ними кути рівні.", "Дві прямі, паралельні третій, паралельні між собою."];
  var DF = ["Бісектриса кута — це промінь, що виходить з вершини кута і ділить його навпіл.", "Два кути називають суміжними, якщо одна сторона в них спільна, а дві інші є доповняльними променями.", "Відрізок — це частина прямої, обмежена двома точками.", "Дві прямі на площині називають паралельними, якщо вони не перетинаються.", "Кут, що дорівнює 90" + D + ", називають прямим.", "Середина відрізка — це точка, яка ділить його на два рівні відрізки."];
  // [умова, висновок, обернене, хибні варіанти]
  var IFT = [
    ["два кути вертикальні", "вони рівні", "Якщо два кути рівні, то вони вертикальні.", ["Якщо два кути не вертикальні, то вони не рівні.", "Якщо два кути не рівні, то вони не вертикальні."]],
    ["два кути суміжні", "їхня сума дорівнює 180" + D, "Якщо сума двох кутів дорівнює 180" + D + ", то вони суміжні.", ["Якщо два кути не суміжні, то їхня сума не дорівнює 180" + D + ".", "Якщо сума двох кутів не дорівнює 180" + D + ", то вони не суміжні."]],
    ["кут гострий", "суміжний з ним кут тупий", "Якщо кут, суміжний з даним, тупий, то даний кут гострий.", ["Якщо кут не гострий, то суміжний з ним кут не тупий.", "Якщо суміжний кут не тупий, то даний кут не гострий."]],
    ["дві прямі перпендикулярні до третьої", "вони паралельні", "Якщо дві прямі паралельні, то вони перпендикулярні до третьої прямої.", ["Якщо дві прямі не перпендикулярні до третьої, то вони не паралельні.", "Якщо дві прямі не паралельні, то вони не перпендикулярні до однієї прямої."]],
    ["дві прямі паралельні третій", "вони паралельні між собою", "Якщо дві прямі паралельні між собою, то вони паралельні якійсь третій прямій.", ["Якщо дві прямі не паралельні третій, то вони не паралельні між собою.", "Якщо дві прямі не паралельні між собою, то вони не паралельні третій."]],
    ["точка C лежить між точками A і B", "AC + CB = AB", "Якщо AC + CB = AB, то точка C лежить між точками A і B.", ["Якщо точка C не лежить між A і B, то AC + CB ≠ AB.", "Якщо AC + CB ≠ AB, то точка C не лежить між A і B."]]];
  G.gLogic = function (a) {
    var t = a.tt || pick(a.easy ? ["kind"] : ["kind", "kind", "cond", "conv"]);
    if (t === "kind") {
      var w = pick(["аксіома", "теорема", "означення"]), s = pick(w === "аксіома" ? AX : w === "теорема" ? TH : DF);
      return choice("Обери", "Що це — аксіома, теорема чи означення?\n«" + s + "»", w, ["аксіома", "теорема", "означення"],
        ["Означення пояснює, <b>що називають</b> певним словом. Аксіома приймається без доведення. Теорему доводять.", "Чи є тут нова назва («називають», «це…»)? Якщо ні — це властивість: базова (аксіома) чи доведена (теорема)?"],
        "Це <b>" + w + "</b>." + (w === "означення" ? " Воно пояснює, що означає назва." : w === "аксіома" ? " Таке твердження приймають без доведення — на ньому будується геометрія." : " Це твердження доводять, спираючись на аксіоми та вже доведені теореми."),
        { tt: t, keep: ["аксіома", "теорема", "означення"], long: true, err: { "аксіома": "Аксіоми — найпростіші вихідні твердження (про точки, прямі, вимірювання), їх не доводять.", "теорема": "Теорему доводять. А тут " + (w === "означення" ? "пояснюють, що означає назва." : "базове твердження, яке приймають без доведення."), "означення": "Означення пояснює, що називають певним словом. А тут — властивість." }, chk: { k: w } }); }
    var i = R(0, IFT.length - 1), th = IFT[i], askC = Math.random() < 0.5, others = [];
    if (t === "cond") {
      IFT.forEach(function (x, j) { if (j !== i) others.push(x[0], x[1]); });
      var right = askC ? th[0] : th[1], wrong = [askC ? th[1] : th[0]].concat(shuffle(others).slice(0, 2));
      return choice("Обери", "Теорема: «Якщо " + th[0] + ", то " + th[1] + "».\nЩо в ній " + (askC ? "умова (що дано)" : "висновок (що доводимо)") + "?", right, wrong,
        ["Теорема має вигляд «Якщо …, то …».", "Умова — після «якщо», висновок — після «то»."], "Умова — те, що після «якщо»: «" + th[0] + "». Висновок — після «то»: «" + th[1] + "». Відповідь: <b>" + right + "</b>.",
        { tt: t, long: true, err: errs([[askC ? th[1] : th[0], askC ? "Це висновок — те, що доводимо (після «то»)." : "Це умова — те, що дано (після «якщо»)."]], right), chk: { pick: right } }); }
    // conv: обернене твердження
    var rightC = th[2], same = "Якщо " + th[0] + ", то " + th[1] + ".";
    return choice("Обери", "Яке твердження обернене до теореми\n«Якщо " + th[0] + ", то " + th[1] + "»?", rightC, [same, th[3][1]],
      ["В оберненому твердженні умова і висновок міняються місцями.", "Те, що було після «то», стає після «якщо»."], "Міняємо місцями умову і висновок: <b>«" + rightC + "»</b> Обернене твердження не завжди правильне — його треба перевіряти окремо.",
      { tt: t, long: true, err: errs([[same, "Це сама теорема. В оберненому умова й висновок міняються місцями."], [th[3][0], "Тут додано «не», але умову й висновок не поміняли. Обернене — коли вони міняються місцями."], [th[3][1], "Тут ще й «не» додано. Обернене — просто поміняти місцями умову і висновок, без «не»."]], rightC), chk: { pick: rightC } });
  };

  /* §5. Суміжні кути */
  function adjPic(x, lab1, lab2) { // ∠COB = x (праворуч), ∠AOC = 180 − x
    var f = new Fig(), O = P(0, 0), A1 = P(-2.2, 0), B1 = P(2.2, 0), C3 = pol(O, 2, x);
    f.seg(A1, B1); f.seg(O, C3); f.pt(A1, "A", { dot: false, dir: [0, 1] }); f.pt(B1, "B", { dot: false, dir: [0, 1] }); f.pt(C3, "C", { dot: false }); f.pt(O, "O", { dir: [0, 1] });
    f.arc(O, C3, A1, AL(lab1), { r: 20, c: lab1 === "?" ? C2 : C1 }); f.arc(O, B1, C3, AL(lab2), { r: 28, c: lab2 === "?" ? C2 : C1 });
    return f;
  }
  G.gAdj = function (a) {
    var t = a.tt || pick(a.easy ? ["one"] : ["one", "more", "times", "ratio", "bis"]), x, y, k, n, m, f, big;
    if (t === "bis") { x = 2 * R(15, 80); if (x === 90) x = 100; var O0 = P(0, 0), Ab = P(-2.2, 0), Bb = P(2.2, 0), Cb = pol(O0, 2, 180 - x), Kb = pol(O0, 2.2, 180 - x / 2);
      f = new Fig(); f.seg(Ab, Bb); f.seg(O0, Cb); f.seg(O0, Kb, { c: C1 }); f.pt(Ab, "A", { dot: false, dir: [0, 1] }); f.pt(Bb, "B", { dot: false, dir: [0, 1] }); f.pt(Cb, "C", { dot: false }); f.pt(Kb, "K", { dot: false, c: C1 }); f.pt(O0, "O", { dir: [0, 1] });
      f.arc(O0, Cb, Kb, "", { r: 26 }); f.arc(O0, Kb, Ab, "", { r: 26 }); f.arc(O0, Bb, Kb, "?", { r: 40, c: C2 });
      return num("Кути AOC і COB — суміжні, ∠AOC = " + x + D + ".\nOK — бісектриса кута AOC.\n∠KOB = ___" + D, 180 - x / 2,
        ["∠KOC = ∠AOC : 2.", "∠COB = 180" + D + " − ∠AOC (суміжні). ∠KOB = ∠KOC + ∠COB."], "∠KOC = " + x / 2 + D + ", ∠COB = " + (180 - x) + D + ", ∠KOB = " + x / 2 + D + " + " + (180 - x) + D + " = <b>" + (180 - x / 2) + D + "</b>.",
        { tt: t, long: true, pic: f.svg({ h: 110 }), err: errs([[180 - x, "Це ∠COB. Додай ще половину кута AOC."], [x / 2, "Це ∠KOC. ∠KOB більший: ∠KOC + ∠COB."]], 180 - x / 2), chk: { v: x + "/2+180-" + x } }); }
    if (t === "one") { x = R(12, 168); if (x === 90) x = 91; y = 180 - x;
      f = adjPic(y, x, "?");
      return num("Кути AOC і COB — суміжні.\n∠AOC = " + x + D + ".\n∠COB = ___" + D, y, ["Сума суміжних кутів дорівнює 180" + D + ".", "∠COB = 180" + D + " − ∠AOC."], "∠COB = 180" + D + " − " + x + D + " = <b>" + y + D + "</b>.",
        { tt: t, long: true, pic: f.svg({ h: 110 }), err: errs([[90 - x > 0 ? 90 - x : null, "Це було б для прямого кута (90" + D + "). Суміжні кути разом дають 180" + D + "."], [x, "Суміжні кути не обов'язково рівні. Разом вони дають 180" + D + "."]].filter(function (z) { return z[0] != null; }), y), chk: { v: "180-" + x } }); }
    if (t === "more") { do { k = 2 * R(5, 70); } while (k >= 170); big = Math.random() < 0.5; x = (180 + k) / 2; y = (180 - k) / 2;
      f = adjPic(y, big ? "?" : "", big ? "" : "?");
      return num("Один із суміжних кутів на " + k + D + " більший за другий.\nЗнайди " + (big ? "більший" : "менший") + " кут: ___" + D, big ? x : y,
        ["Нехай менший кут x, тоді більший x + " + k + ". Разом — 180" + D + ".", "x + x + " + k + " = 180; 2x = " + (180 - k) + "."],
        "x + (x + " + k + ") = 180; 2x = " + (180 - k) + "; x = " + y + D + " — менший; більший = " + y + " + " + k + " = " + x + D + ". Відповідь: <b>" + (big ? x : y) + D + "</b>.",
        { tt: t, long: true, pic: f.svg({ h: 110 }), err: errs([[big ? y : x, "Це " + (big ? "менший" : "більший") + " кут. Питали " + (big ? "більший" : "менший") + "."], [180 - k, "Це 2x. Поділи на 2."], [k, "Це різниця кутів, а не кут."]], big ? x : y), chk: { v: big ? "(180+" + k + ")/2" : "(180-" + k + ")/2" } }); }
    if (t === "times") { n = pick([2, 3, 4, 5, 8, 9, 11]); y = 180 / (n + 1); x = 180 - y; big = Math.random() < 0.5;
      f = adjPic(y, big ? "?" : "", big ? "" : "?");
      return num("Один із суміжних кутів у " + n + " раз" + (n < 5 ? "и" : "ів") + " більший за другий.\nЗнайди " + (big ? "більший" : "менший") + " кут: ___" + D, big ? x : y,
        ["Нехай менший кут x, тоді більший " + n + "x.", "x + " + n + "x = 180, тобто " + (n + 1) + "x = 180."],
        (n + 1) + "x = 180; x = " + y + D + " — менший; більший " + n + " · " + y + " = " + x + D + ". Відповідь: <b>" + (big ? x : y) + D + "</b>.",
        { tt: t, long: true, pic: f.svg({ h: 110 }), err: errs([[big ? y : x, "Це " + (big ? "менший" : "більший") + " кут."], [180 / n, "Частин не " + n + ", а " + (n + 1) + ": x + " + n + "x."]], big ? x : y), chk: { v: big ? "180-180/" + (n + 1) : "180/" + (n + 1) } }); }
    do { m = R(1, 7); n = R(m + 1, 11); } while (180 % (m + n) || m === n);
    k = 180 / (m + n); x = n * k; y = m * k; big = Math.random() < 0.5;
    f = adjPic(y, big ? "?" : "", big ? "" : "?");
    return num("Суміжні кути відносяться як " + m + " : " + n + ".\nЗнайди " + (big ? "більший" : "менший") + " кут: ___" + D, big ? x : y,
      ["Кути — " + m + "x і " + n + "x. Разом 180" + D + ".", (m + n) + "x = 180."], (m + n) + "x = 180; x = " + k + D + ". " + (big ? "Більший: " + n + " · " + k : "Менший: " + m + " · " + k) + " = <b>" + (big ? x : y) + D + "</b>.",
      { tt: "ratio", long: true, pic: f.svg({ h: 110 }), err: errs([[big ? y : x, "Це " + (big ? "менший" : "більший") + " кут."], [k, "Це одна частина (x). Помнож на " + (big ? n : m) + "."]], big ? x : y), chk: { v: "180/" + (m + n) + "*" + (big ? n : m) } });
  };

  /* §6. Вертикальні кути: дві прямі, кути 1–4 */
  function vertPic(phi, hl) { // ∠1 = phi; hl — номер кута, який підсвітити «?»
    var f = new Fig(), O = P(0, 0), th = R(-12, 12), d = [th, th + phi, th + 180, th + 180 + phi], e = d.map(function (x) { return pol(O, 2.2, x); });
    f.seg(e[0], e[2]); f.seg(e[1], e[3]); f.pt(O, "", {});
    var mids = [th + phi / 2, th + phi + (180 - phi) / 2, th + 180 + phi / 2, th + 180 + phi + (180 - phi) / 2];
    for (var i = 0; i < 4; i++) {
      var on = hl && hl.indexOf(i + 1) >= 0;
      if (on) f.arc(O, e[i], e[(i + 1) % 4], "", { r: 16, c: hl[0] === i + 1 ? C2 : C1 });
      f.txt(pol(O, 0.95, mids[i]), String(i + 1), { c: on ? (hl[0] === i + 1 ? C2 : C1) : GR, fs: 15 });
    }
    return f;
  }
  G.gVert = function (a) {
    var t = a.tt || pick(a.easy ? ["one"] : ["one", "one", "sum2", "diff", "sum3", "between"]), phi, k, f, ans, q;
    phi = R(25, 155); if (phi === 90) phi = 70;
    var A = [phi, 180 - phi, phi, 180 - phi];
    if (t === "one") { q = pick([2, 3, 4]); ans = A[q - 1];
      return num("Прямі перетинаються, ∠1 = " + phi + D + ".\n∠" + q + " = ___" + D, ans,
        ["Які кути вертикальні (навпроти один одного), а які суміжні (сусідні)?", "Вертикальні кути рівні, суміжні разом дають 180" + D + "."],
        q === 3 ? "∠3 і ∠1 — вертикальні, тож ∠3 = ∠1 = <b>" + phi + D + "</b>." : "∠" + q + " і ∠1 — суміжні, тож ∠" + q + " = 180" + D + " − " + phi + D + " = <b>" + ans + D + "</b>.",
        { tt: t, long: true, pic: vertPic(phi, [q, 1]).svg({ h: 140 }), err: errs([[q === 3 ? 180 - phi : phi, q === 3 ? "∠1 і ∠3 — вертикальні (навпроти), вони рівні." : "∠1 і ∠" + q + " — суміжні (сусідні), а не вертикальні: разом 180" + D + "."]], ans), chk: { v: q === 3 ? String(phi) : "180-" + phi } }); }
    if (t === "sum2") { var s = 2 * phi; q = pick([1, 2]); ans = A[q - 1];
      return num("Прямі перетинаються, ∠1 + ∠3 = " + s + D + ".\n∠" + q + " = ___" + D, ans,
        ["∠1 і ∠3 — вертикальні, тож рівні: кожен = " + s + D + " : 2.", q === 2 ? "∠2 суміжний з ∠1: ∠2 = 180" + D + " − ∠1." : "∠1 = ∠3, разом " + s + D + "."],
        "∠1 = ∠3 = " + s + D + " : 2 = " + phi + D + "." + (q === 2 ? " ∠2 = 180" + D + " − " + phi + D + " = <b>" + ans + D + "</b>." : " Відповідь: <b>" + phi + D + "</b>."),
        { tt: t, long: true, pic: vertPic(phi, [q, 1, 3].filter(function (v, i, arr) { return arr.indexOf(v) === i; })).svg({ h: 140 }), err: errs([[s, "Це сума двох кутів. Вертикальні кути рівні — поділи навпіл."], [180 - s > 0 ? 180 - s : null, "∠1 і ∠3 не суміжні, а вертикальні."], [q === 1 ? 180 - phi : phi, q === 1 ? "Це ∠2. А ∠1 = " + s + " : 2." : "Це ∠1. ∠2 — суміжний з ним."]].filter(function (z) { return z[0] != null; }), ans), chk: { v: q === 2 ? "180-" + s + "/2" : s + "/2" } }); }
    if (t === "diff") { if (phi > 90) phi = 180 - phi; if (phi > 85) phi = 70; A = [phi, 180 - phi]; var dd = 180 - 2 * phi;
      return num("Прямі перетинаються, ∠2 на " + dd + D + " більший за ∠1.\n∠1 = ___" + D, phi,
        ["∠1 і ∠2 — суміжні: ∠1 + ∠2 = 180" + D + ".", "Нехай ∠1 = x, ∠2 = x + " + dd + ". 2x + " + dd + " = 180."], "2x + " + dd + " = 180; 2x = " + (180 - dd) + "; ∠1 = <b>" + phi + D + "</b>.",
        { tt: t, long: true, pic: vertPic(phi, [1, 2]).svg({ h: 140 }), err: errs([[180 - phi, "Це ∠2 — більший кут."], [180 - dd, "Це 2x. Поділи на 2."]], phi), chk: { v: "(180-" + dd + ")/2" } }); }
    if (t === "sum3") { var s3 = 180 + phi;
      return num("Прямі перетинаються, ∠1 + ∠2 + ∠3 = " + s3 + D + ".\n∠4 = ___" + D, 180 - phi,
        ["∠1 + ∠2 = 180" + D + " (суміжні). Тож ∠3 = " + s3 + D + " − 180" + D + ".", "∠4 — суміжний з ∠3: ∠4 = 180" + D + " − ∠3. Або: усі чотири кути разом — 360" + D + "."],
        "∠1 + ∠2 = 180" + D + ", тож ∠3 = " + s3 + " − 180 = " + phi + D + ". ∠4 = 180" + D + " − " + phi + D + " = <b>" + (180 - phi) + D + "</b> (або 360" + D + " − " + s3 + D + ").",
        { tt: t, long: true, pic: vertPic(phi, [4]).svg({ h: 140 }), err: errs([[phi, "Це ∠3 (і ∠1). ∠4 — суміжний з ним."]], 180 - phi), chk: { v: "360-" + s3 } }); }
    // between: кут між прямими
    var g = R(91, 170), sm = 180 - g, giv = Math.random() < 0.5 ? g : sm;
    return num("Один із кутів, що утворилися при перетині двох прямих, дорівнює " + giv + D + ".\nКут між прямими = ___" + D, sm,
      ["Кутом між прямими називають <b>менший</b> з кутів, що утворилися (не більший за 90" + D + ").", giv > 90 ? "Сусідній кут = 180" + D + " − " + giv + D + "." : "Цей кут уже не більший за 90" + D + "."],
      (giv > 90 ? "Сусідній кут: 180" + D + " − " + giv + D + " = " + sm + D + ". " : "") + "Кут між прямими — менший кут: <b>" + sm + D + "</b>.",
      { tt: "between", long: true, err: errs([[g, "Кут між прямими — менший з утворених кутів, він не більший за 90" + D + "."]], sm), chk: { v: String(Math.min(giv, 180 - giv)) } });
  };

  /* §7. Перпендикулярні прямі, відстань від точки до прямої */
  G.gPerp = function (a) {
    var t = a.tt || pick(a.easy ? ["in"] : ["in", "ratio", "out", "dist", "dist"]), x, f, O = P(0, 0), b0 = R(-15, 15);
    if (t === "in" || t === "ratio") {
      var m, n, k, ask;
      if (t === "in") { x = R(10, 80); } else { do { m = R(1, 5); n = R(m + 1, 9); } while (90 % (m + n)); k = 90 / (m + n); x = m * k; }
      f = new Fig(); var A1 = pol(O, 2.2, b0), B1 = pol(O, 2.2, b0 + 90), C3 = pol(O, 2.2, b0 + x);
      f.seg(pol(O, 2.2, b0 + 180), A1); f.seg(pol(O, 2.2, b0 + 270), B1); f.seg(O, C3, { c: C1 }); f.rt(O, pol(O, 1, b0 + 90), pol(O, 1, b0 + 180), { c: INK });
      f.pt(A1, "A", { dot: false }); f.pt(B1, "B", { dot: false }); f.pt(C3, "C", { dot: false, c: C1 }); f.pt(O, "O", { dir: [0.7, 1] });
      if (t === "in") { f.arc(O, A1, C3, x + D, { r: x < 30 ? 50 : 30 }); f.arc(O, C3, B1, "?", { r: 90 - x < 30 ? 50 : 38, c: C2 });
        return num("Прямі AO і BO перпендикулярні, промінь OC — між сторонами кута AOB.\n∠AOC = " + x + D + ".\n∠COB = ___" + D, 90 - x,
          ["Перпендикулярні прямі утворюють прямий кут: ∠AOB = 90" + D + ".", "∠COB = 90" + D + " − ∠AOC."], "∠AOB = 90" + D + ", тож ∠COB = 90" + D + " − " + x + D + " = <b>" + (90 - x) + D + "</b>.",
          { tt: t, long: true, pic: f.svg({ h: 150 }), err: errs([[180 - x, "AO ⊥ BO, тож ∠AOB = 90" + D + ", а не 180" + D + "."]], 90 - x), chk: { v: "90-" + x } }); }
      ask = Math.random() < 0.5; var ans = ask ? n * k : m * k;
      f.arc(O, A1, C3, "", { r: 30 }); f.arc(O, C3, B1, "", { r: 38, c: C2 });
      return num("OA ⊥ OB, промінь OC — між сторонами кута AOB.\n∠AOC : ∠COB = " + m + " : " + n + ".\n" + (ask ? "∠COB" : "∠AOC") + " = ___" + D, ans,
        ["∠AOB = 90" + D + ". Кути — " + m + "x і " + n + "x.", (m + n) + "x = 90."], (m + n) + "x = 90; x = " + k + D + "; " + (ask ? "∠COB = " + n : "∠AOC = " + m) + " · " + k + D + " = <b>" + ans + D + "</b>.",
        { tt: t, long: true, pic: f.svg({ h: 150 }), err: errs([[ask ? m * k : n * k, "Це інший кут."], [180 / (m + n) * (ask ? n : m), "Прямий кут — 90" + D + ", а не 180" + D + "."]], ans), chk: { v: "90/" + (m + n) + "*" + (ask ? n : m) } });
    }
    if (t === "out") { // AB — пряма, OK ⊥ AB, OC — промінь між OK і OB; ∠KOC = x → ∠AOC або ∠COB
      x = R(10, 80); var askA = Math.random() < 0.5, ans2 = askA ? 90 + x : 90 - x;
      f = new Fig(); var A2 = P(-2.2, 0), B2 = P(2.2, 0), K2 = P(0, 2.2), C4 = pol(O, 2.1, 90 - x);
      f.seg(A2, B2); f.seg(O, K2); f.seg(O, C4, { c: C1 }); f.rt(O, B2, K2, { c: INK });
      f.pt(A2, "A", { dot: false, dir: [0, 1] }); f.pt(B2, "B", { dot: false, dir: [0, 1] }); f.pt(K2, "K", { dot: false }); f.pt(C4, "C", { dot: false, c: C1 }); f.pt(O, "O", { dir: [0, 1] });
      f.arc(O, C4, K2, x + D, { r: x < 30 ? 50 : 34 }); if (askA) f.arc(O, C4, A2, "?", { r: 22, c: C2 }); else f.arc(O, B2, C4, "?", { r: 22, c: C2 });
      return num("OK ⊥ AB, промінь OC лежить між OK і OB, ∠KOC = " + x + D + ".\n" + (askA ? "∠AOC" : "∠COB") + " = ___" + D, ans2,
        ["OK ⊥ AB, тож ∠AOK = ∠KOB = 90" + D + ".", askA ? "∠AOC = ∠AOK + ∠KOC." : "∠COB = ∠KOB − ∠KOC."],
        askA ? "∠AOC = 90" + D + " + " + x + D + " = <b>" + ans2 + D + "</b>." : "∠COB = 90" + D + " − " + x + D + " = <b>" + ans2 + D + "</b>.",
        { tt: t, long: true, pic: f.svg({ h: 120 }), err: errs([[askA ? 90 - x : 90 + x, askA ? "Це ∠COB. ∠AOC містить увесь прямий кут AOK і ще ∠KOC." : "Це ∠AOC. ∠COB — частина прямого кута KOB."]], ans2), chk: { v: askA ? "90+" + x : "90-" + x } }); }
    // dist: відстань від точки до прямої
    var hgt = R(3, 9), l1 = hgt + R(1, 6), l2 = hgt + R(1, 7); if (l1 === l2) l2++;
    var nm = shuffle(["A", "B", "H", "K", "N"]).slice(0, 3), Mp = P(0, hgt), Hh = P(0, 0);
    var Ax = -Math.sqrt(l1 * l1 - hgt * hgt), Bx = Math.sqrt(l2 * l2 - hgt * hgt);
    f = new Fig(); var Ap = P(Ax, 0), Bp = P(Bx, 0);
    f.line(Ap, Bp, { ext: 2 }); f.seg(Mp, Ap); f.seg(Mp, Hh, { c: C1 }); f.seg(Mp, Bp); f.rt(Hh, Bp, Mp);
    f.pt(Mp, "M"); f.pt(Ap, nm[0], { dir: [0, 1] }); f.pt(Hh, nm[1], { dir: [0, 1] }); f.pt(Bp, nm[2], { dir: [0, 1] }); f.txt(P(Bx + 2, 0), "a", { dy: -12, c: GR });
    return num("Пряма a і точка M. Прямий кут позначено на рисунку.\nM" + nm[0] + " = " + l1 + " см, M" + nm[1] + " = " + hgt + " см, M" + nm[2] + " = " + l2 + " см.\nВідстань від точки M до прямої a = ___ см", hgt,
      ["Відстань від точки до прямої — довжина <b>перпендикуляра</b>, проведеного з точки до прямої.", "Перпендикуляр позначають квадратиком біля прямої. Інші відрізки — похилі, вони довші."],
      "Перпендикуляр — M" + nm[1] + " (прямий кут біля " + nm[1] + "). Відстань = M" + nm[1] + " = <b>" + hgt + "</b> см. Перпендикуляр завжди коротший за похилу.",
      { tt: "dist", long: true, pic: f.svg({ h: 120 }), err: errs([[l1, "M" + nm[0] + " — похила, а не перпендикуляр."], [l2, "M" + nm[2] + " — похила, а не перпендикуляр."]], hgt), chk: { v: "Math.min(" + l1 + "," + hgt + "," + l2 + ")" } });
  };

  /* §8. Паралельні прямі (теорія) */
  G.gPar = function (a) {
    var t = a.tt || pick(["tr", "one", "perp2", "cut", "perp1"].filter(function (z) { return !a.ex || a.ex.indexOf(z) < 0; })), L = shuffle(["a", "b", "c", "m", "n"]), x = L[0], y = L[1], z = L[2];
    var POS = ["паралельні", "перетинаються", "збігаються", "неможливо визначити"];
    if (t === "tr") return choice("Обери", "Прямі " + x + " і " + y + " паралельні, прямі " + y + " і " + z + " теж паралельні.\nЯк розміщені прямі " + x + " і " + z + "?", "паралельні", ["перетинаються", "перпендикулярні", "неможливо визначити"],
      ["Згадай наслідок з аксіоми паралельних прямих.", "Дві прямі, паралельні третій, паралельні між собою."], "Дві прямі, паралельні третій, паралельні між собою: " + x + " ∥ " + z + ". Відповідь: <b>паралельні</b>.",
      { tt: t, err: { "перетинаються": "Якби " + x + " і " + z + " перетиналися, через точку перетину проходили б дві прямі, паралельні " + y + " — а за аксіомою така пряма лише одна.", "перпендикулярні": "Паралельність «передається»: " + x + " ∥ " + y + " і " + y + " ∥ " + z + " → " + x + " ∥ " + z + ".", "неможливо визначити": "Можна: дві прямі, паралельні третій, паралельні між собою." }, chk: { pick: "паралельні" } });
    if (t === "one") return choice("Обери", "Точка M не лежить на прямій " + x + ".\nСкільки прямих, паралельних " + x + ", можна провести через точку M?", "одну", ["жодної", "дві", "безліч"],
      ["Це аксіома паралельних прямих.", "Через точку поза прямою проходить <b>лише одна</b> пряма, паралельна даній."], "За аксіомою паралельних прямих — <b>одну</b>.",
      { tt: t, keep: ["жодної", "одну", "дві", "безліч"], err: { "жодної": "Таку пряму завжди можна провести.", "дві": "Аксіома: через точку поза прямою — лише одна паралельна пряма.", "безліч": "Безліч прямих через M можна провести взагалі, але паралельна до " + x + " — лише одна." }, chk: { pick: "одну" } });
    if (t === "perp2") return choice("Обери", "Прямі " + x + " і " + y + " перпендикулярні до прямої " + z + ".\nЯк розміщені прямі " + x + " і " + y + "?", "паралельні", ["перетинаються", "перпендикулярні", "неможливо визначити"],
      ["Згадай теорему про дві прямі, перпендикулярні до третьої.", "Дві прямі, перпендикулярні до третьої, не перетинаються."], "Дві прямі, перпендикулярні до третьої, паралельні: " + x + " ∥ " + y + ". Відповідь: <b>паралельні</b>.",
      { tt: t, err: { "перпендикулярні": x + " і " + y + " перпендикулярні до " + z + ", а між собою вони паралельні (як рейки і шпали 🛤️).", "перетинаються": "Якби вони перетиналися, з однієї точки до прямої " + z + " було б два перпендикуляри — так не буває.", "неможливо визначити": "Можна: це теорема — вони паралельні." }, chk: { pick: "паралельні" } });
    if (t === "cut") return choice("Обери", "Прямі " + x + " і " + y + " паралельні. Пряма " + z + " перетинає пряму " + x + ".\nЧи перетинає пряма " + z + " пряму " + y + "?", "Так", ["Ні", "Не завжди"],
      ["Якби " + z + " не перетинала " + y + ", то " + z + " ∥ " + y + ".", "Тоді через точку перетину " + z + " і " + x + " проходили б дві прямі, паралельні " + y + ". Аксіома це забороняє."],
      "Якщо пряма перетинає одну з двох паралельних прямих, то вона перетинає і другу. Відповідь: <b>Так</b>.",
      { tt: t, keep: ["Так", "Ні", "Не завжди"], err: { "Ні": "Якби " + z + " не перетинала " + y + ", через одну точку проходили б дві прямі, паралельні " + y + " (" + x + " і " + z + "). Це суперечить аксіомі.", "Не завжди": "Завжди: це наслідок аксіоми паралельних прямих." }, chk: { pick: "Так" } });
    return choice("Обери", "Прямі " + x + " і " + y + " паралельні, пряма " + z + " перпендикулярна до " + x + ".\nЯк розміщені прямі " + z + " і " + y + "?", "перпендикулярні", ["паралельні", "неможливо визначити", "збігаються"],
      ["Пряма " + z + " перетинає " + x + ", тож перетинає і " + y + ".", "Відповідні кути при паралельних прямих рівні: якщо біля " + x + " кут 90" + D + ", то й біля " + y + " — 90" + D + "."],
      "Якщо пряма перпендикулярна до однієї з паралельних прямих, то вона перпендикулярна і до другої. Відповідь: <b>перпендикулярні</b>.",
      { tt: "perp1", err: { "паралельні": z + " перетинає " + x + ", тож перетинає і " + y + " — під тим самим прямим кутом.", "неможливо визначити": "Можна: відповідні кути рівні, тож біля " + y + " теж 90" + D + "." }, chk: { pick: "перпендикулярні" } });
  };

  /* §9–10. Дві прямі і січна: кути 1–8.
     Кут: [пряма 0=a/1=b, верх(1)/низ(0), право(1)/ліво(0)]. Номери: a: 1 ↖, 2 ↗, 3 ↙, 4 ↘; b: 5 ↖, 6 ↗, 7 ↙, 8 ↘. */
  var POSN = [null, [0, 1, 0], [0, 1, 1], [0, 0, 0], [0, 0, 1], [1, 1, 0], [1, 1, 1], [1, 0, 0], [1, 0, 1]];
  function pairName(i, j) {
    var p = POSN[i], q = POSN[j];
    if (p[0] === q[0]) { var dv = p[1] !== q[1], dh = p[2] !== q[2]; return dv && dh ? "вертикальні" : (dv || dh) ? "суміжні" : null; }
    var inP = p[0] === 0 ? p[1] === 0 : p[1] === 1, inQ = q[0] === 0 ? q[1] === 0 : q[1] === 1;
    if (p[1] === q[1] && p[2] === q[2]) return "відповідні";
    if (inP && inQ) return p[2] !== q[2] ? "внутрішні різносторонні" : "внутрішні односторонні";
    if (!inP && !inQ) return p[2] !== q[2] ? "зовнішні різносторонні" : "зовнішні односторонні";
    return null;
  }
  /* значення кута за номером: s — кут січної з прямою a (справа зверху), tau — нахил прямої b */
  function angVal(i, s, tau) { var p = POSN[i], u = s - (p[0] ? tau : 0); var ur = p[1] === p[2]; return ur ? u : 180 - u; }
  /* рисунок: a — горизонталь y=1.3, b — y=−1.3 з нахилом tau, січна під кутом s */
  function secPic(s, tau, opt) {
    opt = opt || {};
    var f = new Fig(), Pa = P(0, 1.3), Pb = cross(Pa, pol(Pa, 1, s), P(0, -1.3), pol(P(0, -1.3), 1, tau));
    var spanL = -2.6, spanR = 2.6;
    f.seg(P(spanL + Pa.x * 0.3, 1.3), P(spanR + Pa.x * 0.3, 1.3)); f.seg(pol(Pb, 2.7, tau + 180), pol(Pb, 2.7, tau));
    f.seg(pol(Pa, 1.2, s), pol(Pb, 1.2, s + 180), { c: GR });
    f.txt(P(spanR + Pa.x * 0.3, 1.3), "a", { dx: 10, dy: -9, c: GR }); f.txt(pol(Pb, 2.7, tau), "b", { dx: 10, dy: -9, c: GR }); f.txt(pol(Pa, 1.2, s), "c", { dx: 9, dy: 0, c: GR });
    var rays = function (Q, lam) { return [pol(Q, 1, lam), pol(Q, 1, s), pol(Q, 1, lam + 180), pol(Q, 1, s + 180)]; }; // право, верх, ліво, низ
    var lab = opt.lab || {}, hl = opt.hl || {};
    for (var i = 1; i <= 8; i++) {
      var p = POSN[i], Q = p[0] ? Pb : Pa, lam = p[0] ? tau : 0, rr = rays(Q, lam);
      var r1 = p[1] ? (p[2] ? rr[0] : rr[1]) : (p[2] ? rr[3] : rr[2]), r2 = p[1] ? (p[2] ? rr[1] : rr[2]) : (p[2] ? rr[0] : rr[3]);
      var dm = Math.atan2((r1.y + r2.y) / 2 - Q.y, (r1.x + r2.x) / 2 - Q.x) * 180 / Math.PI;
      if (hl[i]) f.arc(Q, r1, r2, "", { r: 20, c: hl[i], fill: true });
      var lp = function (px) { return { dx: Math.cos(rad(dm)) * px, dy: -Math.sin(rad(dm)) * px }; };
      if (lab[i] != null) { var o1 = lp(String(lab[i]).length > 2 ? 44 : 34); o1.c = hl[i] || C1; o1.fs = 16; f.txt(Q, lab[i], o1); }
      else if (opt.nums) { var o2 = lp(hl[i] ? 33 : 24); o2.c = hl[i] || GR; o2.fs = 15; f.txt(Q, String(i), o2); }
    }
    return f;
  }
  var PNAMES = ["відповідні", "внутрішні різносторонні", "внутрішні односторонні", "вертикальні", "суміжні"];
  G.gPairs = function (a) {
    var want = a.tt || pick(a.easy ? ["відповідні", "внутрішні різносторонні"] : ["відповідні", "відповідні", "внутрішні різносторонні", "внутрішні односторонні", "внутрішні односторонні", "вертикальні", "суміжні"]), i, j;
    do { i = R(1, 8); j = R(1, 8); } while (i === j || pairName(i, j) !== want);
    var s = R(50, 75) * (Math.random() < 0.5 ? 1 : -1); if (s < 0) s = 180 + s;
    var hl = {}; hl[i] = C2; hl[j] = C1;
    var f = secPic(s, 0, { nums: true, hl: hl });
    var expl = { "відповідні": "обидва з одного боку від січної і однаково розміщені щодо своїх прямих (обидва зверху або обидва знизу)", "внутрішні різносторонні": "обидва між прямими a і b (всередині), але з різних боків від січної", "внутрішні односторонні": "обидва між прямими a і b і з одного боку від січної", "вертикальні": "в однієї вершини, сторони одного — продовження сторін другого", "суміжні": "в однієї вершини, одна сторона спільна, дві інші утворюють пряму" };
    var e2 = {}; PNAMES.forEach(function (n) { if (n !== want) e2[n] = "Кути " + n + ", якщо " + expl[n] + ". Подивись ще раз, де лежать ∠" + Math.min(i, j) + " і ∠" + Math.max(i, j) + "."; });
    return choice("Обери", "Прямі a і b перетнуто січною c.\nЯк називаються кути " + Math.min(i, j) + " і " + Math.max(i, j) + "?", want, shuffle(PNAMES.filter(function (n) { return n !== want; })),
      ["Спершу: кути при одній вершині чи при різних прямих?", "«Внутрішні» — між прямими a і b. «Різносторонні» — з різних боків від січної c, «односторонні» — з одного боку."],
      "∠" + Math.min(i, j) + " і ∠" + Math.max(i, j) + " — <b>" + want + "</b>: " + expl[want] + ".",
      { tt: want, long: true, pic: f.svg({ h: 160 }), err: e2, chk: { ij: [i, j] } });
  };
  /* значення кута, що «робить» прямі паралельними */
  function parRule(n) { return n === "внутрішні односторонні" ? "сума дорівнює 180" + D : "рівні"; }
  G.gPTest = function (a) {
    var t = a.tt || pick(a.easy ? ["yn"] : ["yn", "yn", "x"]), want = pick(["відповідні", "внутрішні різносторонні", "внутрішні односторонні"]), i, j;
    do { i = R(1, 8); j = R(1, 8); } while (i === j || pairName(i, j) !== want);
    var s = R(48, 80) * 1; if (Math.random() < 0.5) s = 180 - s;
    var par = t === "x" ? true : Math.random() < 0.5, tau = par ? 0 : pick([-1, 1]) * R(6, 14);
    var vi = angVal(i, s, 0), vj = angVal(j, s, tau);
    if (POSN[i][0] === 1) { vi = angVal(i, s, tau); vj = angVal(j, s, 0); }
    var lab = {}, hl = {}; hl[i] = C2; hl[j] = C1;
    if (t === "yn") {
      lab[i] = vi + D; lab[j] = vj + D;
      var f = secPic(s, tau, { lab: lab, hl: hl }), ok = want === "внутрішні односторонні" ? vi + vj === 180 : vi === vj;
      return choice("Обери", "Прямі a і b перетнуто січною c (кути на рисунку).\nЧи паралельні прямі a і b?", ok ? "Так" : "Ні", ["Так", "Ні"],
        ["Визнач, як називаються позначені кути.", "Ознаки: відповідні рівні, або внутрішні різносторонні рівні, або сума внутрішніх односторонніх = 180" + D + " → прямі паралельні."],
        "Позначені кути — " + want + ". " + (want === "внутрішні односторонні" ? "Їхня сума: " + vi + D + " + " + vj + D + " = " + (vi + vj) + D + (ok ? " = 180" + D : " ≠ 180" + D) : vi + D + (ok ? " = " : " ≠ ") + vj + D) + ". Тож " + (ok ? "<b>так</b>, a ∥ b." : "<b>ні</b>, a і b не паралельні (вони перетнуться)."),
        { tt: "yn", keep: ["Так", "Ні"], long: true, pic: f.svg({ h: 160 }), err: ok ? { "Ні": "Для " + want + " кутів ознака: " + parRule(want) + ". Тут так і є — отже, a ∥ b." } : { "Так": want === "внутрішні односторонні" ? "Сума " + vi + D + " + " + vj + D + " = " + (vi + vj) + D + ", а має бути 180" + D + "." : "Кути " + vi + D + " і " + vj + D + " не рівні, а для паралельності " + want + " кути мають бути рівні." }, chk: { ij: [i, j], v: [vi, vj], ok: ok } });
    }
    lab[i] = vi + D; lab[j] = "x"; var ans = want === "внутрішні односторонні" ? 180 - vi : vi;
    var f2 = secPic(s, 0, { lab: lab, hl: hl });
    return num("При якому значенні x прямі a і b будуть паралельні?\nx = ___" + D, ans,
      ["Як називаються кути " + vi + D + " і x?", "Для паралельності: " + want + " кути — " + parRule(want) + "."],
      "Кути — " + want + ". Прямі паралельні, якщо " + (want === "внутрішні односторонні" ? "x + " + vi + D + " = 180" + D + ", тобто x = <b>" + ans + D + "</b>." : "x = <b>" + ans + D + "</b>."),
      { tt: "x", long: true, pic: f2.svg({ h: 160 }), err: errs([[want === "внутрішні односторонні" ? vi : 180 - vi, want === "внутрішні односторонні" ? "Внутрішні односторонні кути при паралельних прямих не рівні — їхня сума 180" + D + "." : cap(want) + " кути при паралельних прямих рівні, а не доповнюють до 180" + D + "."]], ans), chk: { ij: [i, j], g: vi, want: want, v: want === "внутрішні односторонні" ? "180-" + vi : String(vi) } });
  };
  /* шлях між кутами для пояснення */
  function relWhy(i, j) {
    var n = pairName(i, j); if (n) return "∠" + i + " і ∠" + j + " — " + n;
    return null;
  }
  G.gPAng = function (a) {
    var i, j, s = R(40, 80); if (Math.random() < 0.5) s = 180 - s;
    var hard = !a.easy && Math.random() < 0.35;
    var OK3 = { "відповідні": 1, "внутрішні різносторонні": 1, "внутрішні односторонні": 1 };
    function vertOf(i) { for (var k = 1; k <= 8; k++) if (POSN[k][0] === POSN[i][0] && pairName(i, k) === "вертикальні") return k; }
    do { i = R(1, 8); j = R(1, 8); } while (i === j || POSN[i][0] === POSN[j][0] || !(hard ? (!OK3[pairName(i, j)] && OK3[pairName(vertOf(i), j)]) : OK3[pairName(i, j)]));
    var vi = angVal(i, s, 0), vj = angVal(j, s, 0), lab = {}, hl = {}; lab[i] = vi + D; lab[j] = "?"; hl[i] = C1; hl[j] = C2;
    var f = secPic(s, 0, { lab: lab, hl: hl, nums: false });
    var nm = pairName(i, j), why;
    if (nm) why = "Кути — " + nm + ". При паралельних прямих " + (nm === "внутрішні односторонні" || nm === "зовнішні односторонні" ? "їхня сума 180" + D + ": ? = 180" + D + " − " + vi + D + " = <b>" + vj + D + "</b>." : "вони рівні: ? = <b>" + vj + D + "</b>.");
    else { // через вертикальний кут
      var k = vertOf(i);
      why = "Кут, вертикальний до " + vi + D + ", теж " + vi + D + ". Він і шуканий кут — " + pairName(k, j) + (pairName(k, j) === "внутрішні односторонні" ? ", тож ? = 180" + D + " − " + vi + D + " = <b>" + vj + D + "</b>." : ", тож ? = <b>" + vj + D + "</b>.");
    }
    return num("a ∥ b, c — січна.\nЗнайди кут, позначений «?»: ___" + D, vj,
      [nm ? "Як називаються даний кут і шуканий: відповідні, внутрішні різносторонні чи внутрішні односторонні?" : "Ці два кути не утворюють знайомої пари. Знайди кут, вертикальний до даного, — він і шуканий утворюють пару.", "При паралельних прямих відповідні й внутрішні різносторонні кути рівні, а внутрішні односторонні разом дають 180" + D + "."],
      why, { tt: "x", long: true, pic: f.svg({ h: 160 }), err: errs([[180 - vj, vj === vi ? "Ці кути при паралельних прямих рівні, а не доповнюють один одного до 180" + D + "." : "Ці кути разом дають 180" + D + ", а не рівні між собою."]], vj), chk: { ij: [i, j], s: s, v: String(vj) } });
  };
  /* §10. Внутрішні односторонні: різниця, відношення; зигзаг */
  G.gPSum = function (a) {
    var t = a.tt || pick(["diff", "ratio", "sum2"]), x, y, k, m, n, f, big = Math.random() < 0.5;
    if (t === "diff") { k = 2 * R(5, 60); x = (180 + k) / 2; y = (180 - k) / 2;
      return num("a ∥ b, c — січна. Один із внутрішніх односторонніх кутів на " + k + D + " більший за другий.\nЗнайди " + (big ? "більший" : "менший") + " з них: ___" + D, big ? x : y,
        ["Сума внутрішніх односторонніх кутів при паралельних прямих — 180" + D + ".", "x + (x + " + k + ") = 180."],
        "2x + " + k + " = 180; x = " + y + D + " (менший), більший — " + x + D + ". Відповідь: <b>" + (big ? x : y) + D + "</b>.",
        { tt: t, long: true, err: errs([[big ? y : x, "Це " + (big ? "менший" : "більший") + " кут."], [180 - k, "Це 2x. Поділи на 2."]], big ? x : y), chk: { v: big ? "(180+" + k + ")/2" : "(180-" + k + ")/2" } }); }
    if (t === "ratio") { do { m = R(1, 7); n = R(m + 1, 11); } while (180 % (m + n)); k = 180 / (m + n);
      return num("a ∥ b, c — січна. Внутрішні односторонні кути відносяться як " + m + " : " + n + ".\nЗнайди " + (big ? "більший" : "менший") + " з них: ___" + D, (big ? n : m) * k,
        ["Сума внутрішніх односторонніх кутів — 180" + D + ".", m + "x + " + n + "x = 180."], (m + n) + "x = 180; x = " + k + D + "; " + (big ? n : m) + " · " + k + D + " = <b>" + (big ? n : m) * k + D + "</b>.",
        { tt: t, long: true, err: errs([[(big ? m : n) * k, "Це інший кут."], [k, "Це одна частина."]], (big ? n : m) * k), chk: { v: "180/" + (m + n) + "*" + (big ? n : m) } }); }
    // sum2: сума двох внутрішніх різносторонніх кутів
    x = R(20, 85); if (Math.random() < 0.5) x = 180 - x;
    return num("a ∥ b, c — січна. Сума двох внутрішніх різносторонніх кутів дорівнює " + 2 * x + D + ".\nКожен з них = ___" + D, x,
      ["Внутрішні різносторонні кути при паралельних прямих рівні.", "Два рівні кути разом — " + 2 * x + D + "."], "Кути рівні, тож кожен — " + 2 * x + D + " : 2 = <b>" + x + D + "</b>.",
      { tt: t, long: true, err: errs([[180 - 2 * x > 0 ? 180 - 2 * x : null, "Внутрішні різносторонні кути рівні, а не доповнюють до 180" + D + "."], [180 - x, "Це внутрішній односторонній кут до шуканого."]].filter(function (z) { return z[0] != null; }), x), chk: { v: 2 * x + "/2" } });
  };
  G.gZig = function (a) {
    var al = R(25, 60), be = R(25, 60), ask = a.tt || (a.easy ? "M" : pick(["M", "M", "B"])), Mm = P(0, 0);
    var A = P(-1.6 / Math.tan(rad(al)), 1.6), B = P(-1.6 / Math.tan(rad(be)), -1.6);
    var f = new Fig(), A2 = P(A.x + 2.4, 1.6), B2 = P(B.x + 2.4, -1.6);
    var xl = Math.min(A.x, B.x) - 1, xr = Math.max(A2.x, B2.x, 0.5) + 0.8;
    f.seg(P(xl, 1.6), P(xr, 1.6)); f.seg(P(xl, -1.6), P(xr, -1.6)); f.seg(A, Mm, { c: C1 }); f.seg(B, Mm, { c: C1 });
    f.pt(A, "A", { dir: [0, -1] }); f.pt(B, "B", { dir: [0, 1] }); f.pt(Mm, "M", { dir: [1, 0] });
    f.txt(P(xr, 1.6), "a", { dx: 10, dy: -9, c: GR }); f.txt(P(xr, -1.6), "b", { dx: 10, dy: -9, c: GR });
    f.arc(A, A2, Mm, al + D, { r: 24 }); f.arc(B, Mm, B2, ask === "B" ? "?" : be + D, { r: 24, c: ask === "B" ? C2 : C1 }); f.arc(Mm, A, B, ask === "M" ? "?" : (al + be) + D, { r: 18, c: ask === "M" ? C2 : C1 });
    var hs = ["Проведи через M пряму, паралельну a (і b). Вона розріже ∠AMB на два кути.", "Кожна частина дорівнює внутрішньому різносторонньому куту: верхня — " + al + D + ", нижня — ∠B."];
    if (ask === "M") return num("a ∥ b. Знайди ∠AMB: ___" + D, al + be, hs,
      "Через M проводимо пряму MK ∥ a. ∠AMK = " + al + D + ", ∠KMB = " + be + D + " (внутрішні різносторонні). ∠AMB = " + al + D + " + " + be + D + " = <b>" + (al + be) + D + "</b>.",
      { tt: "M", long: true, pic: f.svg({ h: 150 }), err: errs([[180 - al - be, "Тут не потрібно віднімати від 180" + D + ": ∠AMB складається з двох частин, рівних " + al + D + " і " + be + D + "."]], al + be), chk: { v: al + "+" + be } });
    return num("a ∥ b, ∠AMB = " + (al + be) + D + ". Знайди кут, позначений «?»: ___" + D, be, hs,
      "Через M — пряма MK ∥ a. ∠AMK = " + al + D + ", тож ∠KMB = " + (al + be) + D + " − " + al + D + " = " + be + D + ". Він дорівнює шуканому (внутрішні різносторонні): <b>" + be + D + "</b>.",
      { tt: "B", long: true, pic: f.svg({ h: 150 }), err: errs([[180 - al - be, "∠AMB = " + al + D + " + ?, тож ? = ∠AMB − " + al + D + "."], [al + be + al, "∠AMB — це сума двох кутів, а не різниця. ? = ∠AMB − " + al + D + "."]], be), chk: { v: (al + be) + "-" + al } });
  };

  /* =================== Розділ 3. Трикутники =================== */
  var SUB1 = "₁";
  function triAng(al, be) { var t = Math.sin(rad(be)) / Math.sin(rad(al + be)); return [P(0, 0), P(1, 0), P(t * Math.cos(rad(al)), t * Math.sin(rad(al)))]; }
  function triSides(a, b, c) { var x = (b * b + c * c - a * a) / (2 * c); return [P(0, 0), P(c, 0), P(x, Math.sqrt(Math.max(b * b - x * x, 0.0001)))]; }
  function cenOf(V) { return P((V[0].x + V[1].x + V[2].x) / 3, (V[0].y + V[1].y + V[2].y) / 3); }
  function rotV(V, d) { var c = cenOf(V); return V.map(function (p) { return rotP(p, d, c); }); }
  function drawTri(f, V, names, o) { o = o || {}; var c = cenOf(V);
    for (var i = 0; i < 3; i++) f.seg(V[i], V[(i + 1) % 3], { w: o.w || 2.2 });
    if (names) V.forEach(function (p, i) { if (names[i]) f.pt(p, names[i], { away: c, dot: o.dot }); });
    return c; }
  /* позначки рівності: sides {"01": n}, angs {0: n} */
  function marks(f, V, sides, angs, col) {
    Object.keys(sides || {}).forEach(function (k) { f.tick(V[+k[0]], V[+k[1]], sides[k], { c: col || C2 }); });
    Object.keys(angs || {}).forEach(function (k) { var v = +k; f.arc(V[v], V[(v + 1) % 3], V[(v + 2) % 3], "", { n: angs[k], r: 15, c: col || C1 }); });
  }
  function sideName(n, i, j) { return n[i] + n[j]; }
  function angName(n, i) { return "∠" + n[i]; }

  /* §11. Периметр трикутника */
  function validTri(a, b, c) { return a + b > c && a + c > b && b + c > a; }
  G.gTriP = function (a) {
    var t = a.tt || pick(a.easy ? ["sum", "third"] : ["sum", "third", "rel", "ratio"]), x, y, z, f, V, k, m;
    do { x = R(3, 15); y = R(3, 15); z = R(3, 15); } while (!validTri(x, y, z) || (x === y && y === z));
    function pic(lx, ly, lz) { f = new Fig(); V = rotV(triSides(y, z, x), R(-15, 15)); // AB = x, BC = y, CA = z
      drawTri(f, V, ["A", "B", "C"]); if (lx) f.lab(V[0], V[1], lx); if (ly) f.lab(V[1], V[2], ly); if (lz) f.lab(V[2], V[0], lz); return f.svg({ h: 140 }); }
    if (t === "sum") return num("У трикутнику ABC: AB = " + x + " см, BC = " + y + " см, AC = " + z + " см.\nПериметр P = ___ см", x + y + z,
      ["Периметр — сума довжин усіх сторін.", "P = AB + BC + AC."], "P = " + x + " + " + y + " + " + z + " = <b>" + (x + y + z) + "</b> см.",
      { tt: t, long: true, pic: pic(x + " см", y + " см", z + " см"), err: errs([[x + y, "Сторін три — додай і AC."]], x + y + z), chk: { v: x + "+" + y + "+" + z } });
    if (t === "third") return num("Периметр трикутника ABC дорівнює " + (x + y + z) + " см, AB = " + x + " см, BC = " + y + " см.\nAC = ___ см", z,
      ["P = AB + BC + AC.", "AC = P − AB − BC."], "AC = " + (x + y + z) + " − " + x + " − " + y + " = <b>" + z + "</b> см.",
      { tt: t, long: true, pic: pic(x + " см", y + " см", "?"), err: errs([[x + y, "Це AB + BC. Віднім їх від периметра."], [x + y + z - x, "Відніми обидві відомі сторони."]], z), chk: { v: (x + y + z) + "-" + x + "-" + y } });
    if (t === "rel") { x = R(4, 12); k = R(1, 5); m = R(1, 4); y = x + k; z = y - m; if (!validTri(x, y, z)) { x = 6; k = 2; m = 3; y = 8; z = 5; }
      return num("AB = " + x + " см, сторона BC на " + k + " см довша за AB, а AC на " + m + " см коротша за BC.\nПериметр P = ___ см", x + y + z,
        ["Спершу знайди BC = AB + " + k + ".", "Потім AC = BC − " + m + ", і додай усі три сторони."], "BC = " + x + " + " + k + " = " + y + " см; AC = " + y + " − " + m + " = " + z + " см; P = " + x + " + " + y + " + " + z + " = <b>" + (x + y + z) + "</b> см.",
        { tt: t, long: true, err: errs([[x + y, "Не забудь третю сторону AC."]], x + y + z), chk: { v: x + "+(" + x + "+" + k + ")+(" + x + "+" + k + "-" + m + ")" } }); }
    var r; do { r = [R(2, 6), R(2, 7), R(3, 8)]; } while (!validTri(r[0], r[1], r[2]) || r[0] === r[1] || r[1] === r[2] || r[0] === r[2]);
    k = R(1, 4); var S = (r[0] + r[1] + r[2]) * k, big = Math.random() < 0.5, mx = Math.max.apply(null, r), mn = Math.min.apply(null, r), ans = (big ? mx : mn) * k;
    return num("Сторони трикутника відносяться як " + r.join(" : ") + ", а периметр дорівнює " + S + " см.\nЗнайди " + (big ? "найбільшу" : "найменшу") + " сторону: ___ см", ans,
      ["Сторони — " + r[0] + "x, " + r[1] + "x, " + r[2] + "x.", r.join("x + ") + "x = " + S + "."],
      (r[0] + r[1] + r[2]) + "x = " + S + "; x = " + k + ". " + (big ? "Найбільша: " + mx : "Найменша: " + mn) + " · " + k + " = <b>" + ans + "</b> см.",
      { tt: "ratio", long: true, err: errs([[k, "Це одна частина (x). Помнож на " + (big ? mx : mn) + "."], [(big ? mn : mx) * k, "Це " + (big ? "найменша" : "найбільша") + " сторона."]], ans), chk: { v: S + "/" + (r[0] + r[1] + r[2]) + "*" + (big ? mx : mn) } });
  };

  /* §11. Види трикутників */
  G.gTriKind = function (a) {
    var t = a.tt || pick(["sides", "ang", "ang"]), KS = ["різносторонній", "рівнобедрений", "рівносторонній"], KA = ["гострокутний", "прямокутний", "тупокутний"];
    if (t === "sides") { var md = pick([0, 1, 2]), x = R(3, 12), y, z; if (md === 2) { y = z = x; } else if (md === 1) { y = x; do { z = R(2, 15); } while (z === x || !validTri(x, x, z)); } else { do { y = R(3, 14); z = R(3, 14); } while (y === x || z === x || y === z || !validTri(x, y, z)); }
      var sd = shuffle([x, y, z]), r = KS[md];
      return choice("Обери", "Сторони трикутника — " + sd.join(" см, ") + " см.\nЯкий це трикутник за сторонами?", r, KS, ["Порахуй, скільки сторін рівні між собою.", "Усі різні — різносторонній; дві рівні — рівнобедрений; усі три — рівносторонній."],
        "Рівних сторін: " + ["жодної пари", "дві", "три"][md] + ". Це <b>" + r + "</b> трикутник." + (md === 2 ? " (Рівносторонній — окремий випадок рівнобедреного.)" : ""), { tt: t, keep: KS, err: errs([["рівнобедрений", "У рівнобедреного дві сторони рівні" + (md === 2 ? ", а тут рівні всі три — точніша назва «рівносторонній»." : ".")], ["різносторонній", "У різностороннього всі сторони різні."], ["рівносторонній", "У рівностороннього всі три сторони рівні."]], r), chk: { pick: r } }); }
    var k = pick([0, 1, 2]), al, be, f = new Fig(), V;
    if (k === 1) { al = R(28, 62); V = [P(0, 0), P(2.4, 0), P(0, 2.4 * Math.tan(rad(al)))]; V = [V[1], V[0], V[2]]; }
    else if (k === 2) { var ob = R(110, 140); al = R(15, 180 - ob - 15); V = triAng(al, 180 - ob - al); }
    else { do { al = R(50, 75); be = R(50, 75); } while (180 - al - be > 78 || 180 - al - be < 45); V = triAng(al, be); }
    V = rotV(V, R(-20, 20)); drawTri(f, V, ["A", "B", "C"]); if (k === 1) f.rt(V[1], V[0], V[2]);
    var r2 = KA[k];
    return choice("Обери", "Який це трикутник за кутами?", r2, KA, ["Подивись на найбільший кут трикутника.", "Усі кути гострі — гострокутний; є прямий (□) — прямокутний; є тупий — тупокутний."],
      ["Усі три кути гострі", "Один кут прямий (позначено квадратиком)", "Один кут тупий"][k] + " — це <b>" + r2 + "</b> трикутник.",
      { tt: "ang", keep: KA, pic: f.svg({ h: 120 }), err: errs([["гострокутний", "У гострокутного всі три кути гострі."], ["прямокутний", "У прямокутного є прямий кут (позначають квадратиком)."], ["тупокутний", "У тупокутного є тупий кут (більший за 90" + D + ")."]], r2), chk: { pick: r2 } });
  };

  /* §12. Рівність фігур: відповідність вершин */
  var T2N = [["M", "N", "K"], ["K", "L", "M"], ["D", "E", "F"], ["P", "Q", "R"]];
  G.gCong = function (a) {
    var n2 = pick(T2N), t = a.tt || pick(a.easy ? ["side", "ang"] : ["side", "ang", "angN", "per"]), i, j;
    var eq = "ΔABC = Δ" + n2.join("");
    if (t === "side") { i = R(0, 2); j = (i + R(1, 2)) % 3; var A3 = ["A", "B", "C"], right = n2[i] + n2[j];
      var wrong = [n2[0] + n2[1], n2[1] + n2[2], n2[0] + n2[2]].filter(function (s) { return s.split("").sort().join("") !== right.split("").sort().join(""); });
      var asked = A3[i] + A3[j];
      return choice("Обери", eq + ".\nЯка сторона дорівнює " + asked + "?", right, wrong,
        ["У записі рівності трикутників вершини йдуть <b>по порядку</b>: A ↔ " + n2[0] + ", B ↔ " + n2[1] + ", C ↔ " + n2[2] + ".", asked + " — це " + (i + 1) + "-ша і " + (j + 1) + "-ша букви. Візьми ті самі місця в Δ" + n2.join("") + "."],
        A3[i] + " ↔ " + n2[i] + ", " + A3[j] + " ↔ " + n2[j] + ", тож " + asked + " = <b>" + right + "</b>.",
        { tt: t, err: errs(wrong.map(function (w) { return [w, "Вершини відповідають за порядком у записі: A ↔ " + n2[0] + ", B ↔ " + n2[1] + ", C ↔ " + n2[2] + "."]; }), right), chk: { pick: right } }); }
    if (t === "ang") { i = R(0, 2); var r2 = "∠" + n2[i];
      return choice("Обери", eq + ".\nЯкий кут дорівнює ∠" + ["A", "B", "C"][i] + "?", r2, n2.filter(function (_, k) { return k !== i; }).map(function (z) { return "∠" + z; }),
        ["Відповідні вершини стоять на тих самих місцях у записі.", "∠" + ["A", "B", "C"][i] + " — " + (i + 1) + "-ша буква."], "∠" + ["A", "B", "C"][i] + " ↔ <b>" + r2 + "</b> (" + (i + 1) + "-ша буква в обох записах).",
        { tt: t, keep: n2.map(function (z) { return "∠" + z; }), chk: { pick: r2 } }); }
    if (t === "angN") { var x = R(30, 80), y = R(30, 80); i = pick([0, 1]);
      return num(eq + ", ∠A = " + x + D + ", ∠B = " + y + D + ".\n∠" + n2[i] + " = ___" + D, i ? y : x,
        ["∠" + n2[i] + " відповідає куту, що стоїть на тому самому місці в записі ΔABC.", "∠" + n2[i] + " ↔ ∠" + ["A", "B"][i] + "."], "∠" + n2[i] + " = ∠" + ["A", "B"][i] + " = <b>" + (i ? y : x) + D + "</b> (у рівних трикутниках відповідні кути рівні).",
        { tt: t, long: true, err: errs([[i ? x : y, "Це ∠" + ["A", "B"][1 - i] + ". А ∠" + n2[i] + " відповідає ∠" + ["A", "B"][i] + " — за місцем у записі."]], i ? y : x), chk: { v: String(i ? y : x) } }); }
    var p, q, r; do { p = R(3, 12); q = R(3, 12); r = R(3, 12); } while (!validTri(p, q, r));
    return num(eq + ", AB = " + p + " см, BC = " + q + " см, " + n2[0] + n2[2] + " = " + r + " см.\nПериметр ΔABC = ___ см", p + q + r,
      [n2[0] + n2[2] + " відповідає стороні AC.", "У рівних трикутниках відповідні сторони рівні: AC = " + n2[0] + n2[2] + " = " + r + " см."], "AC = " + n2[0] + n2[2] + " = " + r + " см. P = " + p + " + " + q + " + " + r + " = <b>" + (p + q + r) + "</b> см.",
      { tt: "per", long: true, err: errs([[p + q, "Третя сторона AC = " + n2[0] + n2[2] + "."]], p + q + r), chk: { v: p + "+" + q + "+" + r } });
  };

  /* §13, §16. Ознаки рівності трикутників */
  var O1 = "I ознака", O2 = "II ознака", O3 = "III ознака", O0 = "даних недостатньо";
  function twoTri(sides, angs, nm, sc) {
    var f = new Fig(), V, al, be;
    do { al = R(35, 80); be = R(35, 80); } while (Math.abs(al - be) < 10 || al + be > 140 || Math.abs(180 - al - be - al) < 10 || Math.abs(180 - al - be - be) < 10);
    V = rotV(triAng(al, be), R(-20, 20));
    var mir = Math.random() < 0.5, k2 = sc || 1, W = rotV(V.map(function (p) { return mir ? P(-p.x * k2, p.y * k2) : P(p.x * k2, p.y * k2); }), R(-60, 60));
    var maxX = Math.max(V[0].x, V[1].x, V[2].x), minX = Math.min(W[0].x, W[1].x, W[2].x), cy = cenOf(V).y - cenOf(W).y;
    W = W.map(function (p) { return P(p.x - minX + maxX + 0.45, p.y + cy); });
    drawTri(f, V, nm[0]); drawTri(f, W, nm[1]);
    marks(f, V, sides, angs); marks(f, W, sides, angs);
    return f;
  }
  G.gTest = function (a) {
    var set = a.set || [1, 2, 3], cfgs = ["SAS", "ASA", "SSA", "AAA"].concat(set.indexOf(3) >= 0 ? ["SSS", "SSS"] : ["SAS", "ASA"]);
    var c = a.tt || pick(cfgs), v = R(0, 2), u = (v + 1) % 3, w = (v + 2) % 3, sides = {}, angs = {}, right;
    function sk(i, j) { return i < j ? "" + i + j : "" + j + i; }
    if (c === "SAS") { sides[sk(v, u)] = 1; sides[sk(v, w)] = 2; angs[v] = 1; right = O1; }
    else if (c === "ASA") { sides[sk(v, u)] = 1; angs[v] = 1; angs[u] = 2; right = O2; }
    else if (c === "SSS") { sides[sk(0, 1)] = 1; sides[sk(1, 2)] = 2; sides[sk(0, 2)] = 3; right = O3; }
    else if (c === "SSA") { sides[sk(v, u)] = 1; sides[sk(u, w)] = 2; angs[v] = 1; right = O0; }
    else { angs[0] = 1; angs[1] = 2; angs[2] = 3; right = O0; }
    var f = twoTri(sides, angs, [["A", "B", "C"], ["A" + SUB1, "B" + SUB1, "C" + SUB1]], c === "AAA" ? 0.7 : 1);
    var opts = set.indexOf(3) >= 0 ? [O1, O2, O3, O0] : [O1, O2, O0];
    var why = { SAS: "Рівні дві сторони (позначки рисками) і кут <b>між ними</b> (дуга при їхній спільній вершині).", ASA: "Рівні сторона (риска) і обидва кути, що до неї <b>прилягають</b> (дуги на її кінцях).", SSS: "Рівні всі три сторони (одна, дві і три риски).", SSA: "Рівні дві сторони, але позначений кут <b>не між ними</b>. Такої ознаки немає — трикутники можуть бути різними.", AAA: "Рівні лише кути. Трикутники можуть мати однакову форму, але різний розмір — сторін не позначено." }[c];
    var e2 = {}; opts.forEach(function (o) { if (o !== right) e2[o] = o === O0 ? "Даних достатньо — це ознака. " + why : o === O1 ? "I ознака — дві сторони і кут <b>між ними</b>. Перевір, де позначений кут." : o === O2 ? "II ознака — сторона і два кути <b>на її кінцях</b>." : "III ознака — три пари рівних сторін."; });
    return choice("Обери", "За якою ознакою ΔABC = ΔA₁B₁C₁?", right, opts,
      ["Однакові риски — рівні сторони, однакові дуги — рівні кути. Порахуй, скільки пар рівних сторін і кутів.", "I — дві сторони і кут між ними; II — сторона і два кути на її кінцях; III — три сторони."],
      why + " Відповідь: <b>" + right + "</b>.", { tt: c, keep: opts, long: true, pic: f.svg({ h: 150, w: 310 }), err: e2, chk: { cfg: c } });
  };
  /* §16. Доведення: крок за кроком */
  var WHY = {
    cross: function () { var f = new Fig(), A = P(-2, 1.1), B = P(2, -1.1), C = P(-1.5, -1.25), Dd = P(1.5, 1.25), O = P(0, 0);
      f.seg(A, B); f.seg(C, Dd); f.seg(A, C); f.seg(B, Dd); f.tick(A, O, 1); f.tick(O, B, 1); f.tick(C, O, 2); f.tick(O, Dd, 2);
      f.pt(A, "A"); f.pt(B, "B"); f.pt(C, "C"); f.pt(Dd, "D"); f.pt(O, "O", { dir: [1, 0] });
      return { pic: f, given: "Відрізки AB і CD перетинаються в точці O, AO = OB, CO = OD.\nДоводимо: ΔAOC = ΔBOD.", qs: [
        ["Чому ∠AOC = ∠BOD?", "вони вертикальні", ["вони суміжні", "за умовою", "це спільний кут"], "∠AOC і ∠BOD мають спільну вершину O, а їхні сторони — продовження одна одної: це вертикальні кути, вони рівні."],
        ["За якою ознакою ΔAOC = ΔBOD?", O1, [O2, O3, O0], "AO = OB, CO = OD (за умовою) і ∠AOC = ∠BOD (вертикальні) — дві сторони і кут між ними: I ознака."],
        ["Трикутники рівні. Яка сторона дорівнює AC?", "BD", ["OD", "AB", "CD"], "У рівних трикутниках AOC і BOD відповідні сторони рівні: AC ↔ BD."]] }; },
    kite: function () { var f = new Fig(), A = P(0, 2.1), B = P(-1.3, 0), C = P(0, -1.1), Dd = P(1.3, 0);
      f.seg(A, B); f.seg(B, C); f.seg(C, Dd); f.seg(Dd, A); f.seg(A, C, { c: C1 }); f.tick(A, B, 1); f.tick(A, Dd, 1); f.tick(B, C, 2); f.tick(C, Dd, 2);
      f.pt(A, "A", { dir: [0, -1] }); f.pt(B, "B", { dir: [-1, 0] }); f.pt(C, "C", { dir: [0, 1] }); f.pt(Dd, "D", { dir: [1, 0] });
      return { pic: f, given: "AB = AD, CB = CD.\nДоводимо: ΔABC = ΔADC.", qs: [
        ["Що можна сказати про сторону AC?", "вона спільна для обох трикутників", ["вона дорівнює AB", "вона — бісектриса за умовою", "вона перпендикулярна до BD за умовою"], "AC — сторона і ΔABC, і ΔADC: спільна сторона дорівнює сама собі."],
        ["За якою ознакою ΔABC = ΔADC?", O3, [O1, O2, O0], "AB = AD, CB = CD (за умовою), AC — спільна: три сторони, III ознака."],
        ["Трикутники рівні. Який кут дорівнює ∠BAC?", "∠DAC", ["∠BCA", "∠ABC", "∠ADC"], "Відповідні кути рівних трикутників рівні: ∠BAC = ∠DAC. Отже, AC — бісектриса кута A."]] }; },
    bis: function () { var f = new Fig(), A = P(-2, 0), C = P(2, 0), B = P(0.2, 1.3), Dd = P(0.2, -1.3);
      f.seg(A, B); f.seg(B, C); f.seg(C, Dd); f.seg(Dd, A); f.seg(A, C, { c: C1 });
      f.arc(A, B, C, "", { r: 22, n: 1 }); f.arc(A, C, Dd, "", { r: 22, n: 1 }); f.arc(C, A, B, "", { r: 18, n: 2, c: C2 }); f.arc(C, Dd, A, "", { r: 18, n: 2, c: C2 });
      f.pt(A, "A", { dir: [-1, 0] }); f.pt(B, "B", { dir: [0, -1] }); f.pt(C, "C", { dir: [1, 0] }); f.pt(Dd, "D", { dir: [0, 1] });
      return { pic: f, given: "∠BAC = ∠DAC, ∠BCA = ∠DCA.\nДоводимо: ΔABC = ΔADC.", qs: [
        ["Чому AC в обох трикутниках однакова?", "вона спільна", ["за умовою", "вона — бісектриса", "вони вертикальні"], "AC належить обом трикутникам — це спільна сторона."],
        ["За якою ознакою ΔABC = ΔADC?", O2, [O1, O3, O0], "Сторона AC — спільна, а кути на її кінцях рівні за умовою: II ознака."],
        ["Трикутники рівні. Яка сторона дорівнює AB?", "AD", ["CD", "BC", "AC"], "AB ↔ AD (вершина A спільна, B ↔ D)."]] }; },
    iso: function () { var f = new Fig(), A = P(-1.5, 0), C = P(1.5, 0), B = P(0, 2.3), Mm = P(0, 0);
      f.seg(A, B); f.seg(B, C); f.seg(A, C); f.seg(B, Mm, { c: C1 }); f.tick(A, B, 1); f.tick(B, C, 1); f.tick(A, Mm, 2); f.tick(Mm, C, 2);
      f.pt(A, "A", { dir: [-1, 0.3] }); f.pt(C, "C", { dir: [1, 0.3] }); f.pt(B, "B", { dir: [0, -1] }); f.pt(Mm, "M", { dir: [0, 1] });
      return { pic: f, given: "AB = BC, BM — медіана.\nДоводимо: ΔABM = ΔCBM.", qs: [
        ["Чому AM = MC?", "BM — медіана", ["BM — бісектриса", "за умовою AB = BC", "вони вертикальні"], "Медіана ділить сторону навпіл, тож AM = MC."],
        ["За якою ознакою ΔABM = ΔCBM?", O3, [O1, O2, O0], "AB = CB (за умовою), AM = CM (BM — медіана), BM — спільна: III ознака."],
        ["∠AMB = ∠CMB, і вони суміжні. Скільки градусів кожен?", "90" + D, ["45" + D, "60" + D, "180" + D], "Суміжні кути разом — 180" + D + "; рівні суміжні кути — по 90" + D + ". Отже, медіана BM — ще й висота."]] }; },
    par: function () { var f = new Fig(), A = P(-2, 1), B = P(2, -1), O = P(0, 0), C = P(-0.4, 1), Dd = P(0.4, -1);
      f.seg(P(-2.6, 1), P(0.4, 1), { c: GR }); f.seg(P(-0.4, -1), P(2.6, -1), { c: GR }); f.seg(A, B); f.seg(C, Dd); f.tick(A, O, 1); f.tick(O, B, 1);
            f.pt(A, "A", { dir: [0, -1] }); f.pt(B, "B", { dir: [0, 1] }); f.pt(C, "C", { dir: [0, -1] }); f.pt(Dd, "D", { dir: [0, 1] }); f.pt(O, "O", { dir: [1, 0.3] });
      return { pic: f, given: "AC ∥ BD, O — середина AB, відрізок CD проходить через O.\nДоводимо: ΔAOC = ΔBOD.", qs: [
        ["Чому ∠CAO = ∠DBO?", "внутрішні різносторонні при AC ∥ BD", ["вони вертикальні", "вони суміжні", "за умовою"], "AC ∥ BD, AB — січна, ∠CAO і ∠DBO — внутрішні різносторонні, тож рівні."],
        ["Чому ∠AOC = ∠BOD?", "вони вертикальні", ["внутрішні різносторонні", "вони суміжні", "за умовою"], "Спільна вершина O, сторони — продовження одна одної: вертикальні кути."],
        ["За якою ознакою ΔAOC = ΔBOD?", O2, [O1, O3, O0], "AO = OB, ∠A = ∠B, ∠AOC = ∠BOD — сторона і два прилеглі кути: II ознака."]] }; }
  };
  G.gWhy = function (a) {
    var key = a.tt ? a.tt.split(":")[0] : pick(Object.keys(WHY)), cf = WHY[key](), qi = a.tt ? +a.tt.split(":")[1] : R(0, cf.qs.length - 1), q = cf.qs[qi];
    var WE = { "вони вертикальні": "Вертикальні кути мають спільну вершину, а їхні сторони — продовження одна одної. Перевір, чи так тут.", "вони суміжні": "Суміжні кути разом дають 180" + D + " — вони не обов'язково рівні.", "за умовою": "Перечитай умову: цього там не сказано — це треба обґрунтувати.", "це спільний кут": "Спільний кут — один і той самий кут в обох трикутниках. Тут кути різні.", "внутрішні різносторонні": "Ці кути не утворені двома паралельними прямими і січною.", "BM — бісектриса": "Про бісектрису в умові нічого немає.", "вона — бісектриса": "Що AC — бісектриса, ще треба довести.", "за умовою AB = BC": "AB = BC — про бічні сторони, а не про AM і MC.", "AM і MC — суміжні": "Суміжними бувають кути, а не відрізки." };
    var e2 = {}; q[2].forEach(function (w) { e2[w] = (WE[w] || (w === O1 ? "I ознака — дві сторони і кут між ними. Перевір, які елементи рівні." : w === O2 ? "II ознака — сторона і два прилеглі кути. Перевір, які елементи рівні." : w === O3 ? "III ознака — три пари рівних сторін." : w === O0 ? "Даних достатньо — знайди три пари рівних елементів." : "Подивись ще раз на рисунок і умову.")) + " " + q[3]; });
    var keepO = q[1] === O1 || q[1] === O2 || q[1] === O3 ? [O1, O2, O3, O0] : null;
    return choice("Доведення", cf.given + "\n" + q[0], q[1], q[2], ["Подивись на позначки на рисунку: однакові риски — рівні відрізки, однакові дуги — рівні кути.", "Можливі причини: «за умовою», «спільна сторона», «вертикальні кути», «властивість паралельних прямих», «означення медіани (бісектриси)»."],
      q[3], { tt: key + ":" + qi, long: true, keep: keepO, pic: cf.pic.svg({ h: 140 }), err: e2, chk: { pick: q[1] } });
  };

  /* §14. Рівнобедрений трикутник */
  function isoPic(b, s, labB, labS) { var h = Math.sqrt(Math.max(s * s - b * b / 4, 0.01)), f = new Fig(), A = P(-b / 2, 0), C = P(b / 2, 0), B = P(0, h);
    drawTri(f, [A, B, C], ["A", "B", "C"]); f.tick(A, B, 1); f.tick(B, C, 1); if (labB) f.lab(A, C, labB); if (labS) f.lab(A, B, labS, { at: 0.3 }); return f; }
  G.gIso = function (a) {
    var t = a.tt || pick(a.easy ? ["per", "side"] : ["per", "side", "base", "more", "times", "medP", "sign"]), b, s, k, P2;
    do { b = R(3, 16); s = R(3, 16); } while (b >= 2 * s || b === s);
    P2 = 2 * s + b;
    var hdr = "ΔABC — рівнобедрений, AC — основа (AB = BC).\n";
    if (t === "medP") { b = 2 * R(2, 8); s = b / 2 + R(2, 9); var md = R(Math.max(2, s - b / 2 + 1), s + b / 2 - 1), PA = s + b / 2 + md; P2 = 2 * s + b;
      var fm = isoPic(b, s); fm.seg(P(0, Math.sqrt(s * s - b * b / 4)), P(0, 0), { c: C1 }); fm.pt(P(0, 0), "D", { dir: [0, 1] });
      return num(hdr + "BD — медіана. P(ΔABC) = " + P2 + " см, P(ΔABD) = " + PA + " см.\nBD = ___ см", md, ["P(ΔABD) = AB + AD + BD. А AB + AD — це рівно половина периметра ΔABC (бо AD = AC : 2).", "BD = P(ΔABD) − P(ΔABC) : 2."],
        "AB + AD = (AB + BC + AC) : 2 = " + P2 + " : 2 = " + P2 / 2 + " см. BD = " + PA + " − " + P2 / 2 + " = <b>" + md + "</b> см.",
        { tt: t, long: true, pic: fm.svg({ h: 130 }), err: errs([[PA - P2 / 2 + b / 2, "AD — половина AC, а не вся AC."], [P2 - PA, "Відніми від P(ΔABD) половину периметра ΔABC."]], md), chk: { v: PA + "-" + P2 + "/2" } }); }
    if (t === "sign") { var bx = R(30, 80); s = R(3, 15);
      return num("У трикутнику ABC ∠A = ∠C = " + bx + D + ", AB = " + s + " см.\nBC = ___ см", s, ["Якщо у трикутнику два кути рівні, то він…?", "Ознака рівнобедреного трикутника: сторони, протилежні рівним кутам, рівні."], "∠A = ∠C, тож ΔABC рівнобедрений з основою AC: BC = AB = <b>" + s + "</b> см.",
        { tt: t, long: true, err: errs([[2 * s, "Рівні кути → рівні сторони, протилежні до них: BC = AB."]], s), chk: { v: String(s) } }); }
    if (t === "per") return num(hdr + "AC = " + b + " см, AB = " + s + " см.\nP = ___ см", P2, ["Бічні сторони рівні: BC = AB = " + s + " см.", "P = AB + BC + AC = 2 · " + s + " + " + b + "."], "P = 2 · " + s + " + " + b + " = <b>" + P2 + "</b> см.",
      { tt: t, long: true, pic: isoPic(b, s, b + " см", s + " см").svg({ h: 130 }), err: errs([[s + b, "Бічних сторін дві: AB і BC. Додай обидві."], [2 * b + s, "Рівні бічні сторони AB і BC, а AC — основа."]], P2), chk: { v: "2*" + s + "+" + b } });
    if (t === "side") { if ((P2 - b) % 2) P2 = 2 * s + b;
      return num(hdr + "P = " + P2 + " см, AC = " + b + " см.\nAB = ___ см", s, ["Дві бічні сторони разом: P − AC.", "AB = (P − AC) : 2."], "AB + BC = " + P2 + " − " + b + " = " + 2 * s + " см; AB = " + 2 * s + " : 2 = <b>" + s + "</b> см.",
        { tt: t, long: true, pic: isoPic(b, s, b + " см", "?").svg({ h: 130 }), err: errs([[2 * s, "Це обидві бічні сторони разом. Поділи на 2."], [(P2 - b) / 3, ""]], s), chk: { v: "(" + P2 + "-" + b + ")/2" } }); }
    if (t === "base") return num(hdr + "P = " + P2 + " см, AB = " + s + " см.\nAC = ___ см", b, ["BC = AB = " + s + " см.", "AC = P − 2 · AB."], "AC = " + P2 + " − 2 · " + s + " = <b>" + b + "</b> см.",
      { tt: t, long: true, pic: isoPic(b, s, "?", s + " см").svg({ h: 130 }), err: errs([[P2 - s, "Бічних сторін дві — віднімай обидві."]], b), chk: { v: P2 + "-2*" + s } });
    if (t === "more") { b = R(3, 12); k = R(1, 6); s = b + k; P2 = 3 * b + 2 * k;
      return num(hdr + "Бічна сторона на " + k + " см довша за основу, P = " + P2 + " см.\nAC = ___ см", b, ["Нехай AC = x, тоді AB = BC = x + " + k + ".", "x + 2(x + " + k + ") = " + P2 + "; 3x + " + 2 * k + " = " + P2 + "."],
        "3x + " + 2 * k + " = " + P2 + "; 3x = " + (P2 - 2 * k) + "; x = <b>" + b + "</b> см.", { tt: t, long: true, pic: isoPic(b, s, "x", "x + " + k).svg({ h: 130 }), err: errs([[s, "Це бічна сторона. Питали основу."], [(P2 - k) / 3, "Бічних сторін дві, тож «+ " + k + "» — двічі: 3x + " + 2 * k + "."]], b), chk: { v: "(" + P2 + "-2*" + k + ")/3" } }); }
    k = R(2, 4); b = R(2, 7); s = k * b; P2 = (2 * k + 1) * b;
    return num(hdr + "Бічна сторона в " + k + " рази більша за основу, P = " + P2 + " см.\nAC = ___ см", b, ["AC = x, AB = BC = " + k + "x.", "x + " + k + "x + " + k + "x = " + P2 + "."], (2 * k + 1) + "x = " + P2 + "; x = <b>" + b + "</b> см.",
      { tt: "times", long: true, pic: isoPic(b, s, "x", k + "x").svg({ h: 130 }), err: errs([[s, "Це бічна сторона."], [P2 / (k + 1), "Бічних сторін дві: x + " + k + "x + " + k + "x."]], b), chk: { v: P2 + "/" + (2 * k + 1) } });
  };

  /* §15. Медіана, бісектриса, висота */
  G.gMbh = function (a) {
    var t = a.tt || pick(a.easy ? ["which"] : ["which", "which", "med", "bis", "alt"]), al, be, V, f, Dd, k = pick(["медіана", "бісектриса", "висота"]);
    do { al = R(45, 80); be = R(40, 75); } while (al + be > 150 || Math.abs(al - be) < 12);
    V = triAng(al, be); var A = V[0], C = V[1], B = V[2]; // основа AC знизу, вершина B
    f = new Fig(); drawTri(f, [A, B, C], ["A", "B", "C"]);
    if (t === "which") {
      if (k === "медіана") { Dd = mid(A, C); f.tick(A, Dd, 1); f.tick(Dd, C, 1); }
      else if (k === "висота") { Dd = P(B.x, 0); f.rt(Dd, C, B); }
      else { var dA = dist(B, A), dC = dist(B, C); Dd = lerp(A, C, dA / (dA + dC)); f.arc(B, A, Dd, "", { r: 32 }); f.arc(B, Dd, C, "", { r: 32 }); }
      f.seg(B, Dd, { c: C1 }); f.pt(Dd, "D", { dir: [0, 1] });
      return choice("Обери", "Як називається відрізок BD на рисунку?", k, ["медіана", "бісектриса", "висота"].filter(function (z) { return z !== k; }),
        ["Подивись на позначки: однакові риски на AC, дуги біля B чи прямий кут біля D?", "Медіана ділить сторону навпіл, бісектриса — кут, висота перпендикулярна до сторони."],
        { "медіана": "AD = DC (однакові риски) — BD ділить сторону навпіл: це <b>медіана</b>.", "бісектриса": "Дуги біля B однакові — BD ділить кут навпіл: це <b>бісектриса</b>.", "висота": "Біля D прямий кут — BD ⊥ AC: це <b>висота</b>." }[k],
        { tt: t, keep: ["медіана", "бісектриса", "висота"], pic: f.svg({ h: 130 }), err: { "медіана": "Медіана з'єднує вершину із серединою сторони — тоді на AC були б однакові риски.", "бісектриса": "Бісектриса ділить кут навпіл — тоді біля B були б однакові дуги.", "висота": "Висота перпендикулярна до сторони — тоді біля D був би квадратик." }, chk: { pick: k } }); }
    if (t === "med") { var ac = 2 * R(3, 12), ask = Math.random() < 0.5; Dd = mid(A, C); f.tick(A, Dd, 1); f.tick(Dd, C, 1); f.seg(B, Dd, { c: C1 }); f.pt(Dd, "D", { dir: [0, 1] });
      return num("BD — медіана трикутника ABC, " + (ask ? "AC = " + ac : "AD = " + ac / 2) + " см.\n" + (ask ? "DC" : "AC") + " = ___ см", ask ? ac / 2 : ac,
        ["Медіана з'єднує вершину із <b>серединою</b> протилежної сторони.", "AD = DC = AC : 2."], ask ? "D — середина AC: DC = " + ac + " : 2 = <b>" + ac / 2 + "</b> см." : "AC = 2 · AD = <b>" + ac + "</b> см.",
        { tt: t, long: true, pic: f.svg({ h: 130 }), err: errs([[ask ? ac : ac / 2, ask ? "DC — лише половина AC." : "AD — половина AC, тож AC удвічі більша."]], ask ? ac / 2 : ac), chk: { v: ask ? ac + "/2" : String(ac) } }); }
    if (t === "bis") { var bb = 2 * R(20, 60), alB = Math.round((180 - bb) / 2) + R(-12, 12); V = triAng(alB, 180 - alB - bb); A = V[0]; C = V[1]; B = V[2];
      f = new Fig(); drawTri(f, [A, B, C], ["A", "B", "C"]);
      var dA2 = dist(B, A), dC2 = dist(B, C); Dd = lerp(A, C, dA2 / (dA2 + dC2)); f.arc(B, A, Dd, "", { r: 32 }); f.arc(B, Dd, C, "", { r: 32 }); f.seg(B, Dd, { c: C1 }); f.pt(Dd, "D", { dir: [0, 1] });
      var ask2 = Math.random() < 0.5;
      return num("BD — бісектриса трикутника ABC, " + (ask2 ? "∠ABC = " + bb : "∠ABD = " + bb / 2) + D + ".\n" + (ask2 ? "∠DBC" : "∠ABC") + " = ___" + D, ask2 ? bb / 2 : bb,
        ["Бісектриса ділить кут <b>навпіл</b>.", "∠ABD = ∠DBC = ∠ABC : 2."], ask2 ? "∠DBC = " + bb + D + " : 2 = <b>" + bb / 2 + D + "</b>." : "∠ABC = 2 · " + bb / 2 + D + " = <b>" + bb + D + "</b>.",
        { tt: t, long: true, pic: f.svg({ h: 130 }), err: errs([[ask2 ? bb : bb / 2, "Бісектриса ділить кут навпіл."]], ask2 ? bb / 2 : bb), chk: { v: ask2 ? bb + "/2" : String(bb) } }); }
    Dd = P(B.x, 0); f.rt(Dd, C, B); f.seg(B, Dd, { c: C1 }); f.pt(Dd, "D", { dir: [0, 1] }); var as = pick(["∠BDA", "∠BDC"]);
    return num("BD — висота трикутника ABC.\n" + as + " = ___" + D, 90, ["Висота — перпендикуляр з вершини до прямої, що містить протилежну сторону.", "Перпендикулярні прямі утворюють прямі кути."], "BD ⊥ AC, тож " + as + " = <b>90" + D + "</b>.",
      { tt: "alt", long: true, pic: f.svg({ h: 130 }), err: errs([[180, "Висота утворює зі стороною прямий кут, а не розгорнутий."], [45, "Висота перпендикулярна до сторони: кут прямий."]], 90), chk: { v: "90" } });
  };
  G.gIsoMed = function (a) {
    var t = a.tt || pick(["med", "bisH", "altAC", "bisAC"]), V, f, A, B, C, Dd, x = 2 * R(15, 60), vt = t === "bisH" ? x : R(40, 110);
    A = P(-Math.sin(rad(vt / 2)), 0); C = P(Math.sin(rad(vt / 2)), 0); B = P(0, Math.cos(rad(vt / 2))); Dd = P(0, 0);
    f = new Fig(); drawTri(f, [A, B, C], ["A", "B", "C"]); f.tick(A, B, 1); f.tick(B, C, 1); f.seg(B, Dd, { c: C1 }); f.pt(Dd, "D", { dir: [0, 1] });
    var hdr = "ΔABC — рівнобедрений, AB = BC. ", prop = "У рівнобедреному трикутнику медіана, проведена до основи, є також бісектрисою і висотою.";
    if (t === "med") { var as = pick(["∠BDA", "∠BDC"]); f.tick(A, Dd, 2); f.tick(Dd, C, 2);
      return num(hdr + "BD — медіана.\n" + as + " = ___" + D, 90, ["BD проведено до основи AC рівнобедреного трикутника.", prop], "Медіана BD до основи є і висотою: BD ⊥ AC, тож " + as + " = <b>90" + D + "</b>.",
        { tt: t, long: true, pic: f.svg({ h: 130 }), err: errs([[45, "BD — ще й висота, кут прямий."], [180, "Кут між висотою і стороною — прямий."]], 90), chk: { v: "90" } }); }
    if (t === "bisH") {
      return num(hdr + "BD — медіана, ∠ABC = " + x + D + ".\n∠ABD = ___" + D, x / 2, ["Медіана до основи рівнобедреного трикутника — ще й бісектриса.", "∠ABD = ∠ABC : 2."], "BD — і бісектриса: ∠ABD = " + x + D + " : 2 = <b>" + x / 2 + D + "</b>.",
        { tt: t, long: true, pic: f.svg({ h: 130 }), err: errs([[x, "BD ділить ∠ABC навпіл."], [90, "Прямий — кут між BD і AC, а питали ∠ABD."]], x / 2), chk: { v: x + "/2" } }); }
    if (t === "altAC") { f.rt(Dd, C, B); var ac = 2 * R(3, 12);
      return num(hdr + "BD — висота, AC = " + ac + " см.\nAD = ___ см", ac / 2, ["Висота, проведена до основи рівнобедреного трикутника, — ще й медіана.", "Медіана ділить AC навпіл."], "BD — і медіана: AD = " + ac + " : 2 = <b>" + ac / 2 + "</b> см.",
        { tt: t, long: true, pic: f.svg({ h: 130 }), err: errs([[ac, "D — середина AC, тож AD — половина AC."]], ac / 2), chk: { v: ac + "/2" } }); }
    f.arc(B, A, Dd, "", { r: 30 }); f.arc(B, Dd, C, "", { r: 30 }); var ad = R(3, 12);
    return num(hdr + "BD — бісектриса, AD = " + ad + " см.\nAC = ___ см", 2 * ad, ["Бісектриса, проведена до основи рівнобедреного трикутника, — ще й медіана.", "Отже, D — середина AC."], "BD — і медіана: AC = 2 · " + ad + " = <b>" + 2 * ad + "</b> см.",
      { tt: "bisAC", long: true, pic: f.svg({ h: 130 }), err: errs([[ad, "AD — лише половина AC."]], 2 * ad), chk: { v: "2*" + ad } });
  };

  /* §17. Сума кутів трикутника */
  function triPicA(al, be, labs) { var f = new Fig(), V = rotV(triAng(al, be), R(-12, 12)); drawTri(f, V, ["A", "B", "C"]);
    [0, 1, 2].forEach(function (i) { if (labs[i] != null) f.arc(V[i], V[(i + 1) % 3], V[(i + 2) % 3], AL(labs[i]), aOpt(labs[i])); }); return f; }
  G.gSum = function (a) {
    var t = a.tt || pick(a.easy ? ["two"] : ["two", "two", "ratio", "more", "rt"]), x, y, z, f, k, m, n;
    if (t === "two") { x = R(25, 100); y = R(20, 150 - x); z = 180 - x - y;
      return num("У трикутнику ABC ∠A = " + x + D + ", ∠B = " + y + D + ".\n∠C = ___" + D, z, ["Сума кутів трикутника дорівнює 180" + D + ".", "∠C = 180" + D + " − ∠A − ∠B."], "∠C = 180" + D + " − " + x + D + " − " + y + D + " = <b>" + z + D + "</b>.",
        { tt: t, long: true, pic: triPicA(x, y, [x, y, "?"]).svg({ h: 130 }), err: errs([[x + y, "Це сума двох кутів. Віднімай її від 180" + D + "."], [360 - x - y, "Сума кутів трикутника — 180" + D + ", а не 360" + D + "."]], z), chk: { v: "180-" + x + "-" + y } }); }
    if (t === "ratio") { var r; do { r = [R(1, 5), R(1, 6), R(2, 9)]; } while (180 % (r[0] + r[1] + r[2]) || r[0] === r[1] || r[1] === r[2] || r[0] === r[2]);
      k = 180 / (r[0] + r[1] + r[2]); var big = Math.random() < 0.5, mx = Math.max.apply(null, r), mn = Math.min.apply(null, r), ans = (big ? mx : mn) * k;
      return num("Кути трикутника відносяться як " + r.join(" : ") + ".\nЗнайди " + (big ? "найбільший" : "найменший") + " кут: ___" + D, ans, ["Кути — " + r[0] + "x, " + r[1] + "x, " + r[2] + "x; разом 180" + D + ".", (r[0] + r[1] + r[2]) + "x = 180."],
        (r[0] + r[1] + r[2]) + "x = 180; x = " + k + D + ". " + (big ? mx : mn) + " · " + k + D + " = <b>" + ans + D + "</b>.",
        { tt: t, long: true, err: errs([[k, "Це одна частина (x)."], [(big ? mn : mx) * k, "Це " + (big ? "найменший" : "найбільший") + " кут."]], ans), chk: { v: "180/" + (r[0] + r[1] + r[2]) + "*" + (big ? mx : mn) } }); }
    if (t === "more") { x = R(20, 60); k = R(5, 40); m = R(5, 30); y = x + k; z = 180 - x - y; if (z < 10) { x = 40; k = 20; y = 60; z = 80; }
      return num("У трикутнику ABC ∠B на " + k + D + " більший за ∠A, а ∠C = " + z + D + ".\n∠A = ___" + D, x, ["Нехай ∠A = x, тоді ∠B = x + " + k + ".", "x + x + " + k + " + " + z + " = 180."],
        "2x + " + (k + z) + " = 180; 2x = " + (180 - k - z) + "; ∠A = <b>" + x + D + "</b>.", { tt: t, long: true, pic: triPicA(x, y, ["?", null, z]).svg({ h: 130 }), err: errs([[y, "Це ∠B."], [180 - k - z, "Це 2x. Поділи на 2."], [180 - z, "Це ∠A + ∠B разом."]], x), chk: { v: "(180-" + k + "-" + z + ")/2" } }); }
    x = R(15, 75);
    return num("У прямокутному трикутнику ABC ∠C = 90" + D + ", ∠A = " + x + D + ".\n∠B = ___" + D, 90 - x, ["Сума кутів — 180" + D + ", один кут прямий.", "∠A + ∠B = 90" + D + "."], "∠B = 180" + D + " − 90" + D + " − " + x + D + " = <b>" + (90 - x) + D + "</b>. (Гострі кути прямокутного трикутника разом — 90" + D + ".)",
      { tt: "rt", long: true, err: errs([[180 - x, "Не забудь про прямий кут C = 90" + D + "."]], 90 - x), chk: { v: "180-90-" + x } });
  };
  G.gIsoAng = function (a) {
    var t = a.tt || pick(a.easy ? ["top"] : ["top", "base", "more"]), x, f, b, s;
    var hdr = "ΔABC — рівнобедрений, AC — основа.\n";
    function pic(top, lb, lt) { var LT = lt; var bs = (180 - top) / 2, V = triAng(bs, bs); f = new Fig(); drawTri(f, V, ["A", "C", "B"]); f.tick(V[0], V[2], 1); f.tick(V[1], V[2], 1);
      if (lb != null) f.arc(V[0], V[1], V[2], AL(lb), aOpt(lb)); if (lt != null) f.arc(V[2], V[0], V[1], AL(lt), aOpt(lt)); return f.svg({ h: 130 }); }
    if (t === "top") { x = 2 * R(10, 62); var bs = (180 - x) / 2;
      return num(hdr + "∠B = " + x + D + ".\n∠A = ___" + D, bs, ["Кути при основі рівні: ∠A = ∠C.", "∠A + ∠C = 180" + D + " − " + x + D + ", а кожен — половина."], "∠A = ∠C = (180" + D + " − " + x + D + ") : 2 = <b>" + bs + D + "</b>.",
        { tt: t, long: true, pic: pic(x, "?", x), err: errs([[180 - x, "Це ∠A + ∠C разом. Кути при основі рівні — поділи навпіл."], [x, "∠B — кут при вершині, він не обов'язково дорівнює кутам при основі."]], bs), chk: { v: "(180-" + x + ")/2" } }); }
    if (t === "base") { b = R(20, 85); var top = 180 - 2 * b;
      return num(hdr + "∠A = " + b + D + ".\n∠B = ___" + D, top, ["∠C = ∠A = " + b + D + " (кути при основі).", "∠B = 180" + D + " − 2 · " + b + D + "."], "∠C = ∠A = " + b + D + "; ∠B = 180" + D + " − " + 2 * b + D + " = <b>" + top + D + "</b>.",
        { tt: t, long: true, pic: pic(top, b, "?"), err: errs([[180 - b, "Кутів при основі два: віднімай 2 · " + b + D + "."], [b, "Рівні кути при основі (A і C), а B — при вершині."]], top), chk: { v: "180-2*" + b } }); }
    if (t === "more") { b = R(25, 70); var tp = 180 - 2 * b, d = tp - b; if (d === 0) { b = 40; tp = 100; d = 60; }
      return num(hdr + "Кут при вершині " + (d > 0 ? "на " + d + D + " більший" : "на " + (-d) + D + " менший") + " за кут при основі.\n∠A = ___" + D, b,
        ["Нехай ∠A = ∠C = x, тоді ∠B = x " + (d > 0 ? "+ " + d : M + " " + (-d)) + ".", "x + x + x " + (d > 0 ? "+ " + d : M + " " + (-d)) + " = 180."],
        "3x " + (d > 0 ? "+ " + d : M + " " + (-d)) + " = 180; 3x = " + (180 - d) + "; x = <b>" + b + D + "</b>.", { tt: t, long: true, pic: pic(tp, "x", "x " + (d > 0 ? "+ " + d : M + " " + (-d)) + D), err: errs([[tp, "Це кут при вершині B."], [(180 - d) / 2, "Кутів при основі два, і ще кут при вершині: 3x."]], b), chk: { v: "(180-(" + d + "))/3" } }); }
    // ext: зовнішній кут при основі
    b = R(20, 85); var ex = 180 - b, tp2 = 180 - 2 * b;
    return num(hdr + "Зовнішній кут при вершині C дорівнює " + ex + D + ".\n∠B = ___" + D, tp2, ["Зовнішній і внутрішній кути при C — суміжні: ∠C = 180" + D + " − " + ex + D + ".", "∠A = ∠C, ∠B = 180" + D + " − 2 · ∠C."],
      "∠C = 180" + D + " − " + ex + D + " = " + b + D + " = ∠A; ∠B = 180" + D + " − 2 · " + b + D + " = <b>" + tp2 + D + "</b>.", { tt: "ext", long: true, err: errs([[b, "Це кут при основі. Питали ∠B — при вершині."], [ex - b, ""]], tp2), chk: { v: "180-2*(180-" + ex + ")" } });
  };
  /* §18. Зовнішній кут */
  function extPic(al, be, labA, labB, labE, labC) { var V = triAng(al, 180 - al - be), A = V[0], C = V[1], B = V[2], Dd = P(C.x + 0.45, 0), f = new Fig();
    drawTri(f, [A, C, B], ["A", "C", "B"]); f.seg(C, Dd); f.pt(Dd, "D", { dir: [0, 1] });
    if (labA != null) f.arc(A, C, B, AL(labA), aOpt(labA)); if (labB != null) f.arc(B, A, C, AL(labB), aOpt(labB)); if (labE != null) f.arc(C, Dd, B, AL(labE), { r: 16, c: labE === "?" ? C2 : C1 }); if (labC != null) f.arc(C, B, A, AL(labC), aOpt(labC)); return f.svg({ h: 130 }); }
  G.gExt = function (a) {
    var t = a.tt || pick(a.easy ? ["sum"] : ["sum", "sum", "part", "inner", "iso"]), x, y, e;
    do { x = R(25, 80); y = R(25, 85); } while (x + y > 150);
    e = x + y; var hdr = "Кут BCD — зовнішній кут трикутника ABC.\n";
    if (t === "sum") return num(hdr + "∠A = " + x + D + ", ∠B = " + y + D + ".\n∠BCD = ___" + D, e, ["Зовнішній кут дорівнює сумі двох внутрішніх кутів, <b>не суміжних</b> з ним.", "∠BCD = ∠A + ∠B."], "∠BCD = " + x + D + " + " + y + D + " = <b>" + e + D + "</b>.",
      { tt: t, long: true, pic: extPic(x, y, x, y, "?", null), err: errs([[180 - e, "Це внутрішній кут C. Зовнішній — суміжний з ним: ∠A + ∠B."]], e), chk: { v: x + "+" + y } });
    if (t === "part") return num(hdr + "∠BCD = " + e + D + ", ∠A = " + x + D + ".\n∠B = ___" + D, y, ["∠BCD = ∠A + ∠B.", "∠B = ∠BCD − ∠A."], "∠B = " + e + D + " − " + x + D + " = <b>" + y + D + "</b>.",
      { tt: t, long: true, pic: extPic(x, y, x, "?", e, null), err: errs([[180 - e, "Це внутрішній кут C."], [180 - x - (180 - e) === y ? null : 0, ""]].filter(function (z) { return z[0] != null; }), y), chk: { v: e + "-" + x } });
    if (t === "inner") return num(hdr + "∠BCD = " + e + D + ".\n∠ACB = ___" + D, 180 - e, ["Зовнішній і внутрішній кути при одній вершині — суміжні.", "∠ACB = 180" + D + " − ∠BCD."], "∠ACB = 180" + D + " − " + e + D + " = <b>" + (180 - e) + D + "</b>.",
      { tt: t, long: true, pic: extPic(x, y, null, null, e, "?"), err: errs([[e, "Це зовнішній кут. Внутрішній ∠ACB — суміжний з ним."]], 180 - e), chk: { v: "180-" + e } });
    var bs = R(20, 80), ex = 2 * bs; // зовнішній при вершині B рівнобедреного дорівнює 2 · кут при основі
    return num("ΔABC — рівнобедрений з основою AC. Зовнішній кут при вершині B дорівнює " + ex + D + ".\n∠A = ___" + D, bs, ["Зовнішній кут при B = ∠A + ∠C.", "∠A = ∠C, тож кожен — половина зовнішнього кута."], "∠A + ∠C = " + ex + D + ", ∠A = ∠C = <b>" + bs + D + "</b>.",
      { tt: "iso", long: true, err: errs([[180 - ex, "Це внутрішній кут B."], [ex, "Зовнішній кут — сума ∠A і ∠C, тож ∠A — половина."]], bs), chk: { v: ex + "/2" } });
  };
  /* §18. Співвідношення сторін і кутів */
  G.gSideAng = function (a) {
    var t = a.tt || pick(["side", "ang"]), big = Math.random() < 0.5, x, y, z, ang, sides, names = ["BC", "AC", "AB"];
    if (t === "side") { do { x = R(25, 110); y = R(25, 120); z = 180 - x - y; } while (z < 20 || x === y || y === z || x === z);
      ang = [x, y, z]; var idx = ang.indexOf(big ? Math.max(x, y, z) : Math.min(x, y, z)), right = names[idx];
      return choice("Обери", "У трикутнику ABC ∠A = " + x + D + ", ∠B = " + y + D + ".\nЯка сторона " + (big ? "найбільша" : "найменша") + "?", right, names.filter(function (s) { return s !== right; }),
        ["Спершу знайди ∠C = 180" + D + " − ∠A − ∠B.", "Проти " + (big ? "більшого" : "меншого") + " кута лежить " + (big ? "більша" : "менша") + " сторона. Сторона «проти ∠A» — та, де немає букви A."],
        "∠C = " + z + D + ". " + (big ? "Найбільший" : "Найменший") + " кут — ∠" + "ABC"[idx] + " = " + ang[idx] + D + ". Проти нього — сторона <b>" + right + "</b>.",
        { tt: t, keep: names, err: errs(names.map(function (s, i) { return [s, "Сторона " + s + " лежить проти ∠" + "ABC"[i] + " = " + ang[i] + D + "."]; }), right), chk: { ang: ang, big: big, pick: right } }); }
    do { x = R(3, 15); y = R(3, 15); z = R(3, 15); } while (!validTri(x, y, z) || x === y || y === z || x === z);
    sides = [x, y, z]; // BC, AC, AB
    var j = sides.indexOf(big ? Math.max(x, y, z) : Math.min(x, y, z)), rA = "∠" + "ABC"[j];
    return choice("Обери", "У трикутнику ABC: BC = " + x + " см, AC = " + y + " см, AB = " + z + " см.\nЯкий кут " + (big ? "найбільший" : "найменший") + "?", rA, ["∠A", "∠B", "∠C"].filter(function (s) { return s !== rA; }),
      ["Проти " + (big ? "більшої" : "меншої") + " сторони лежить " + (big ? "більший" : "менший") + " кут.", "Кут проти сторони BC — ∠A (вершина, якої немає в назві сторони)."],
      (big ? "Найбільша" : "Найменша") + " сторона — " + names[j] + " = " + sides[j] + " см. Проти неї лежить <b>" + rA + "</b>.",
      { tt: "ang", keep: ["∠A", "∠B", "∠C"], err: errs(["∠A", "∠B", "∠C"].map(function (s, i) { return [s, s + " лежить проти сторони " + names[i] + " = " + sides[i] + " см."]; }), rA), chk: { sides: sides, big: big, pick: rA } });
  };

  /* §19. Прямокутний трикутник */
  function rtPic(al, labs, hyp) { var f = new Fig(), C = P(0, 0), A = P(Math.cos(rad(al)) * 0 + 3, 0), B = P(0, 3 * Math.tan(rad(al)));
    drawTri(f, [A, C, B], ["A", "C", "B"]); f.rt(C, A, B);
    if (labs) { if (labs.A != null) f.arc(A, B, C, AL(labs.A), aOpt(labs.A)); if (labs.B != null) f.arc(B, C, A, AL(labs.B), aOpt(labs.B)); if (labs.AB) f.lab(A, B, labs.AB); if (labs.BC) f.lab(B, C, labs.BC); if (labs.AC) f.lab(A, C, labs.AC); }
    return f; }
  G.gRight = function (a) {
    var t = a.tt || pick(a.easy ? ["acute", "h30"] : ["acute", "h30", "l30", "s30", "hgt", "inv", "iso"]), x, c, f;
    var hdr = "У трикутнику ABC ∠C = 90" + D + ".\n";
    if (t === "acute") { x = R(12, 78);
      return num(hdr + "∠A = " + x + D + ".\n∠B = ___" + D, 90 - x, ["Сума гострих кутів прямокутного трикутника — 90" + D + ".", "∠B = 90" + D + " − ∠A."], "∠B = 90" + D + " − " + x + D + " = <b>" + (90 - x) + D + "</b>.",
        { tt: t, long: true, pic: rtPic(x, { A: x, B: "?" }).svg({ h: 130 }), err: errs([[180 - x, "Прямий кут уже займає 90" + D + ": гострі кути разом — 90" + D + "."]], 90 - x), chk: { v: "90-" + x } }); }
    if (t === "h30") { c = 2 * R(2, 15);
      return num(hdr + "∠A = 30" + D + ", AB = " + c + " см.\nBC = ___ см", c / 2, ["Катет, що лежить <b>проти кута 30" + D + "</b>, дорівнює половині гіпотенузи.", "Проти ∠A лежить катет BC. Гіпотенуза — AB."], "BC лежить проти кута 30" + D + ": BC = AB : 2 = " + c + " : 2 = <b>" + c / 2 + "</b> см.",
        { tt: t, long: true, pic: rtPic(30, { A: 30, AB: c + " см", BC: "?" }).svg({ h: 130 }), err: errs([[2 * c, "Гіпотенуза — найбільша сторона. Катет удвічі менший."]], c / 2), chk: { v: c + "/2" } }); }
    if (t === "l30") { c = R(2, 15);
      return num(hdr + "∠B = 60" + D + ", BC = " + c + " см.\nAB = ___ см", 2 * c, ["Знайди ∠A = 90" + D + " − 60" + D + " = 30" + D + ".", "Катет BC лежить проти кута 30" + D + ", тож гіпотенуза AB удвічі довша."], "∠A = 30" + D + ", BC — проти нього: AB = 2 · " + c + " = <b>" + 2 * c + "</b> см.",
        { tt: t, long: true, pic: rtPic(30, { B: 60, BC: c + " см", AB: "?" }).svg({ h: 130 }), err: errs([[c / 2, "AB — гіпотенуза, вона довша за катет."]], 2 * c), chk: { v: "2*" + c } }); }
    if (t === "s30") { c = 2 * R(2, 12); var s = c + c / 2;
      return num(hdr + "∠A = 30" + D + ", AB + BC = " + s + " см.\nAB = ___ см", c, ["BC лежить проти 30" + D + ": BC = AB : 2. Нехай BC = x, AB = 2x.", "2x + x = " + s + "."], "3x = " + s + "; x = " + c / 2 + " см = BC; AB = 2x = <b>" + c + "</b> см.",
        { tt: t, long: true, err: errs([[c / 2, "Це BC (x). Гіпотенуза AB = 2x."], [s / 2, "AB і BC не рівні: AB = 2 · BC."]], c), chk: { v: "2*" + s + "/3" } }); }
    if (t === "hgt") { x = R(25, 65); var f2 = new Fig(), C = P(0, 0), A = P(3, 0), B = P(0, 3 * Math.tan(rad(x))), H = (function () { var t2 = ((C.x - A.x) * (B.x - A.x) + (C.y - A.y) * (B.y - A.y)) / ((B.x - A.x) * (B.x - A.x) + (B.y - A.y) * (B.y - A.y)); return lerp(A, B, t2); })();
      drawTri(f2, [A, C, B], ["A", "C", "B"]); f2.rt(C, A, B); f2.seg(C, H, { c: C1 }); f2.rt(H, B, C); f2.pt(H, "H"); f2.arc(A, B, C, x + D); f2.arc(C, B, H, "?", { r: 26, c: C2 });
      return num(hdr + "CH — висота, ∠A = " + x + D + ".\n∠BCH = ___" + D, x, ["У ΔACH: ∠ACH = 90" + D + " − ∠A.", "∠BCH = 90" + D + " − ∠ACH."], "∠ACH = 90" + D + " − " + x + D + " = " + (90 - x) + D + ", ∠BCH = 90" + D + " − " + (90 - x) + D + " = <b>" + x + D + "</b>. Цікаво: ∠BCH = ∠A!",
        { tt: t, long: true, pic: f2.svg({ h: 140 }), err: errs([[90 - x, "Це ∠ACH (або ∠B). ∠BCH — інша частина прямого кута C."]], x), chk: { v: "90-(90-" + x + ")" } }); }
    if (t === "inv") { c = R(2, 12); var askB = Math.random() < 0.5;
      return num(hdr + "BC = " + c + " см, AB = " + 2 * c + " см.\n" + (askB ? "∠B" : "∠A") + " = ___" + D, askB ? 60 : 30, ["Катет BC удвічі менший за гіпотенузу AB.", "Катет, що дорівнює половині гіпотенузи, лежить проти кута 30" + D + ". Проти BC лежить ∠A."],
        "BC = AB : 2, тож ∠A (проти BC) = 30" + D + (askB ? ", а ∠B = 90" + D + " − 30" + D + " = <b>60" + D + "</b>." : ": ∠A = <b>30" + D + "</b>."),
        { tt: t, long: true, pic: rtPic(30, { AB: 2 * c + " см", BC: c + " см" }).svg({ h: 130 }), err: errs([[askB ? 30 : 60, askB ? "30" + D + " — це ∠A (проти катета BC). ∠B = 90" + D + " − ∠A." : "Кут проти катета, що дорівнює половині гіпотенузи, — 30" + D + ", а не 60" + D + "."]], askB ? 60 : 30), chk: { v: askB ? "60" : "30" } }); }
    var exA = Math.random() < 0.5, as = pick(["∠A", "∠B"]);
    if (exA) return num("Прямокутний трикутник ABC (∠C = 90" + D + ") — рівнобедрений.\nЗовнішній кут при вершині A = ___" + D, 135, ["Спершу знайди ∠A: гострі кути рівні й разом дають 90" + D + ".", "Зовнішній кут — суміжний з внутрішнім: 180" + D + " − ∠A."], "∠A = 45" + D + ", зовнішній = 180" + D + " − 45" + D + " = <b>135" + D + "</b>.",
      { tt: "iso", long: true, err: errs([[45, "45" + D + " — це сам ∠A. Зовнішній кут суміжний з ним."], [90, "Зовнішній кут при A = 180" + D + " − ∠A."]], 135), chk: { v: "180-45" } });
    return num("Прямокутний трикутник ABC (∠C = 90" + D + ") — рівнобедрений.\n" + as + " = ___" + D, 45, ["Гострі кути разом — 90" + D + ".", "У рівнобедреному прямокутному трикутнику гострі кути рівні."], "∠A = ∠B = 90" + D + " : 2 = <b>45" + D + "</b>.",
      { tt: "iso", long: true, err: errs([[90, "90" + D + " — це прямий кут C."], [60, "Гострі кути разом — 90" + D + ", а не 120" + D + "."]], 45), chk: { v: "90/2" } });
  };
  var RTS = { LL: "за двома катетами", LH: "за катетом і гіпотенузою", HA: "за гіпотенузою і гострим кутом", LAa: "за катетом і прилеглим гострим кутом", LAo: "за катетом і протилежним гострим кутом" };
  G.gRtTest = function (a) {
    var c = a.tt || pick(Object.keys(RTS)), al = R(28, 62), f = new Fig();
    if (Math.abs(al - 45) < 6) al = 35;
    var V = [P(2.6, 0), P(0, 0), P(0, 2.6 * Math.tan(rad(al)))]; // A, C, B
    var W = rotV(V.map(function (p) { return P(-p.x, p.y); }), R(-30, 30)); var mx = Math.max(V[0].x, V[1].x, V[2].x), mn = Math.min(W[0].x, W[1].x, W[2].x);
    W = W.map(function (p) { return P(p.x - mn + mx + 1.1, p.y); });
    [V, W].forEach(function (T, k) { drawTri(f, T, k ? ["A" + SUB1, "C" + SUB1, "B" + SUB1] : ["A", "C", "B"]); f.rt(T[1], T[0], T[2]);
      var sides = {}, angs = {};
      if (c === "LL") { sides["01"] = 1; sides["12"] = 2; } else if (c === "LH") { sides["01"] = 1; sides["02"] = 2; } else if (c === "HA") { sides["02"] = 1; angs[0] = 1; } else if (c === "LAa") { sides["01"] = 1; angs[0] = 1; } else { sides["01"] = 1; angs[2] = 1; }
      marks(f, T, sides, angs); });
    var right = RTS[c], opts = shuffle(Object.keys(RTS).filter(function (k) { return k !== c; })).slice(0, 3).map(function (k) { return RTS[k]; });
    return choice("Обери", "Прямокутні трикутники ABC і A₁B₁C₁ (∠C = ∠C₁ = 90" + D + ").\nЗа якою ознакою вони рівні?", right, opts,
      ["Гіпотенуза — сторона проти прямого кута, катети — сторони, що його утворюють.", "Подивись, що позначено: катети, гіпотенуза, гострий кут? Кут «прилеглий» до катета — на його кінці, «протилежний» — навпроти."],
      "Позначено: " + { LL: "два катети", LH: "катет і гіпотенуза", HA: "гіпотенуза і гострий кут", LAa: "катет і гострий кут на його кінці", LAo: "катет і кут навпроти нього" }[c] + ". Відповідь: <b>" + right + "</b>.",
      { tt: c, long: true, pic: f.svg({ h: 150, w: 310 }), err: (function () { var NEED = { LL: "мали б бути позначені обидві сторони біля прямого кута", LH: "мали б бути позначені катет і гіпотенуза (сторона навпроти прямого кута)", HA: "мали б бути позначені гіпотенуза і гострий кут", LAa: "мали б бути позначені катет і гострий кут на його кінці", LAo: "мали б бути позначені катет і гострий кут навпроти нього" }, o = {};
        Object.keys(RTS).forEach(function (k) { if (k !== c) o[RTS[k]] = "Для ознаки «" + RTS[k] + "» " + NEED[k] + "."; }); return o; })(), chk: { pick: right } });
  };
  /* §20. Нерівність трикутника */
  G.gIneq = function (a) {
    var t = a.tt || pick(a.easy ? ["yn"] : ["yn", "yn", "iso", "max"]), x, y, z;
    if (t === "yn") { x = R(2, 15); y = R(2, 15); var mode = R(0, 2); z = mode === 0 ? x + y : mode === 1 ? R(Math.abs(x - y) + 1, x + y - 1) : x + y + R(1, 5);
      var ok = validTri(x, y, z), srt = [x, y, z].sort(function (p, q) { return p - q; });
      return choice("Обери", "Чи існує трикутник зі сторонами " + x + " см, " + y + " см і " + z + " см?", ok ? "Так" : "Ні", ["Так", "Ні"],
        ["Кожна сторона має бути меншою за суму двох інших.", "Досить перевірити найбільшу сторону: чи менша вона за суму двох менших?"],
        srt[0] + " + " + srt[1] + " = " + (srt[0] + srt[1]) + (ok ? " > " : srt[0] + srt[1] === srt[2] ? " = " : " < ") + srt[2] + ". " + (ok ? "<b>Так</b>, існує." : "<b>Ні</b>, не існує" + (srt[0] + srt[1] === srt[2] ? " (точки лягли б на одну пряму)." : ".")),
        { tt: t, keep: ["Так", "Ні"], err: ok ? { "Ні": "Найбільша сторона " + srt[2] + " менша за " + srt[0] + " + " + srt[1] + " = " + (srt[0] + srt[1]) + " — трикутник існує." } : { "Так": "Найбільша сторона " + srt[2] + " не менша за суму двох інших (" + (srt[0] + srt[1]) + ")." }, chk: { s: [x, y, z] } }); }
    if (t === "iso") { do { x = R(2, 12); y = R(2, 12); } while (x === y || (validTri(x, x, y) && validTri(y, y, x)));
      var lat = validTri(x, x, y) ? x : y, bs = lat === x ? y : x, Pp = 2 * lat + bs;
      return num("Дві сторони рівнобедреного трикутника дорівнюють " + Math.min(x, y) + " см і " + Math.max(x, y) + " см.\nПериметр = ___ см", Pp,
        ["Бічною може бути " + Math.min(x, y) + " або " + Math.max(x, y) + " см. Перевір обидва варіанти нерівністю трикутника.", "Сторони " + Math.min(x, y) + ", " + Math.min(x, y) + ", " + Math.max(x, y) + ": чи " + Math.min(x, y) + " + " + Math.min(x, y) + " > " + Math.max(x, y) + "?"],
        "Варіант " + bs + ", " + bs + ", " + lat + " не підходить: " + bs + " + " + bs + " ≤ " + lat + ". Отже, бічні — по " + lat + " см, основа " + bs + " см. P = " + lat + " + " + lat + " + " + bs + " = <b>" + Pp + "</b> см.",
        { tt: t, long: true, err: errs([[2 * bs + lat, "Такий трикутник не існує: " + bs + " + " + bs + " ≤ " + lat + "."]], Pp), chk: { iso: [x, y], v: String(Pp) } }); }
    x = R(2, 12); y = R(2, 12); var big = Math.random() < 0.5, ans = big ? x + y - 1 : Math.abs(x - y) + 1;
    return num("Дві сторони трикутника — " + x + " см і " + y + " см. Третя сторона — ціле число сантиметрів.\n" + (big ? "Найбільша" : "Найменша") + " можлива довжина третьої сторони: ___ см", ans,
      ["Третя сторона менша за суму двох інших: < " + (x + y) + ".", "І більша за їхню різницю: > " + Math.abs(x - y) + "."],
      Math.abs(x - y) + " < c < " + (x + y) + ", тож " + (big ? "найбільше ціле — <b>" + ans + "</b> см." : "найменше ціле — <b>" + ans + "</b> см."),
      { tt: "max", long: true, err: errs([[big ? x + y : Math.abs(x - y), "Нерівність строга: сторона не може дорівнювати " + (big ? "сумі" : "різниці") + " — тоді вершини лягли б на одну пряму."]], ans), chk: { v: big ? x + "+" + y + "-1" : "Math.abs(" + x + "-" + y + ")+1" } });
  };

  /* =================== Розділ 4. Коло і круг =================== */
  function circPic() { var f = new Fig(); f.circ(P(0, 0), 2); f.pt(P(0, 0), "O", { dir: [0, -1] }); return f; }
  G.gCirc = function (a) {
    var t = a.tt || pick(a.easy ? ["dr"] : ["dr", "dr", "ang", "base", "eq", "per", "perp"]), r, x, f = circPic(), O = P(0, 0), th = R(200, 240);
    if (t === "perp") { var hk = R(2, 12), half = Math.random() < 0.5, ca = R(50, 72), Ap = pol(O, 2, -90 - ca), Bp = pol(O, 2, -90 + ca), Mp = P(0, Ap.y), Cp = P(0, 2), Dp = P(0, -2);
      f.seg(Cp, Dp); f.seg(Ap, Bp, { c: C1 }); f.rt(Mp, Bp, Cp); f.tick(Ap, Mp, 1); f.pt(Ap, "A"); f.pt(Bp, "B"); f.pt(Mp, "M", { dir: [1, 1.2] }); f.pt(Cp, "C", { dir: [0, -1] }); f.pt(Dp, "D", { dir: [0, 1] });
      f.L = f.L.filter(function (l) { return !(l.k === "tick"); });
      return num("CD — діаметр, AB — хорда, CD ⊥ AB, M — точка їх перетину.\n" + (half ? "AB = " + 2 * hk + " см. AM = ___ см" : "AM = " + hk + " см. AB = ___ см"), half ? hk : 2 * hk,
        ["OA = OB (радіуси), тож ΔAOB рівнобедрений, а OM — його висота.", "Висота рівнобедреного трикутника, проведена до основи, — ще й медіана: AM = MB."],
        "Діаметр, перпендикулярний до хорди, ділить її навпіл: " + (half ? "AM = " + 2 * hk + " : 2 = <b>" + hk + "</b> см." : "AB = 2 · " + hk + " = <b>" + 2 * hk + "</b> см."),
        { tt: t, long: true, pic: f.svg({ h: 140 }), err: errs([[half ? 2 * hk : hk, half ? "AM — лише половина хорди." : "AM — половина AB, тож AB удвічі довша."]], half ? hk : 2 * hk), chk: { v: half ? 2 * hk + "/2" : "2*" + hk } }); }
    if (t === "dr") { var rd = Math.random() < 0.5; r = R(2, 20);
      var Ad = pol(O, 2, 200), Bd = pol(O, 2, 20); f.seg(Ad, Bd, { c: rd ? C1 : INK }); if (!rd) { f.seg(O, pol(O, 2, 70), { c: C1 }); } f.L.forEach(function (l) { if (l.k === "pt") l.o.dir = [-1, -0.7]; });
      return num(rd ? "Радіус кола " + r + " см.\nДіаметр = ___ см" : "Діаметр кола " + 2 * r + " см.\nРадіус = ___ см", rd ? 2 * r : r, ["Діаметр складається з двох радіусів.", rd ? "d = 2r." : "r = d : 2."], rd ? "d = 2 · " + r + " = <b>" + 2 * r + "</b> см." : "r = " + 2 * r + " : 2 = <b>" + r + "</b> см.",
        { tt: t, long: true, pic: f.svg({ h: 120 }), err: errs([[rd ? r / 2 : 4 * r, rd ? "Діаметр більший за радіус удвічі." : "Радіус — половина діаметра."]], rd ? 2 * r : r), chk: { v: rd ? "2*" + r : 2 * r + "/2" } }); }
    var A = pol(O, 2, th), B;
    if (t === "ang" || t === "base") { x = 2 * R(20, 80); B = pol(O, 2, th + x); f.seg(A, B, { c: C1 }); f.seg(O, A); f.seg(O, B); f.pt(A, "A"); f.pt(B, "B");
      if (t === "ang") { f.arc(O, A, B, "", { r: 16 }); f.arc(A, B, O, "?", { c: C2, r: 24 });
        return num("O — центр кола, AB — хорда, ∠AOB = " + x + D + ".\n∠OAB = ___" + D, (180 - x) / 2, ["OA = OB — радіуси, тож ΔAOB рівнобедрений.", "Кути при основі AB рівні: (180" + D + " − " + x + D + ") : 2."], "OA = OB, ΔAOB рівнобедрений: ∠OAB = ∠OBA = (180" + D + " − " + x + D + ") : 2 = <b>" + (180 - x) / 2 + D + "</b>.",
          { tt: t, long: true, pic: f.svg({ h: 130 }), err: errs([[180 - x, "Це сума двох кутів при основі. Поділи навпіл."], [x / 2, "Тут немає ділення кута навпіл: ΔAOB рівнобедрений, кути при основі = (180" + D + " − " + x + D + ") : 2."]], (180 - x) / 2), chk: { v: "(180-" + x + ")/2" } }); }
      var y = (180 - x) / 2; f.arc(A, B, O, y + D, { r: 24 }); f.arc(O, A, B, "?", { r: 16, c: C2, lr: 9 });
      return num("O — центр кола, AB — хорда, ∠OAB = " + y + D + ".\n∠AOB = ___" + D, x, ["ΔAOB — рівнобедрений (OA = OB), тож ∠OBA = ∠OAB.", "∠AOB = 180" + D + " − 2 · " + y + D + "."], "∠AOB = 180" + D + " − 2 · " + y + D + " = <b>" + x + D + "</b>.",
        { tt: t, long: true, pic: f.svg({ h: 130 }), err: errs([[180 - y, "Кути при основі рівні — їх два: віднімай 2 · " + y + D + "."]], x), chk: { v: "180-2*" + y } }); }
    var cang = 60; if (t === "per") { r = R(3, 12); x = R(2, 2 * r - 1); cang = 2 * Math.asin(x / (2 * r)) * 180 / Math.PI; }
    B = pol(O, 2, th + cang); f.seg(A, B, { c: C1 }); f.seg(O, A); f.seg(O, B); f.pt(A, "A"); f.pt(B, "B");
    if (t === "eq" && Math.random() < 0.5) { var rq = R(2, 15);
      return num("Хорда AB кола з центром O дорівнює радіусу, r = " + rq + " см.\nПериметр ΔAOB = ___ см", 3 * rq, ["OA і OB — радіуси.", "AB = r за умовою. Усі три сторони однакові."], "OA = OB = AB = " + rq + " см, P = 3 · " + rq + " = <b>" + 3 * rq + "</b> см.",
        { tt: t, long: true, pic: f.svg({ h: 130 }), err: errs([[2 * rq, "Сторін три: OA, OB і AB."]], 3 * rq), chk: { v: "3*" + rq } }); }
    if (t === "eq") { f.arc(O, A, B, "?", { r: 18, c: C2 });
      return num("Хорда AB дорівнює радіусу кола.\n∠AOB = ___" + D, 60, ["OA = OB = AB — усі три сторони ΔAOB рівні.", "У рівностороннього трикутника всі кути рівні: 180" + D + " : 3."], "OA = OB = AB, ΔAOB — рівносторонній, усі кути по 180" + D + " : 3 = <b>60" + D + "</b>.",
        { tt: t, long: true, pic: f.svg({ h: 130 }), err: errs([[90, "ΔAOB — рівносторонній, усі кути рівні."], [180, "∠AOB — кут трикутника AOB."]], 60), chk: { v: "180/3" } }); }
    return num("O — центр кола радіуса " + r + " см, AB — хорда, AB = " + x + " см.\nПериметр ΔAOB = ___ см", 2 * r + x, ["OA і OB — радіуси.", "P = OA + OB + AB."], "P = " + r + " + " + r + " + " + x + " = <b>" + (2 * r + x) + "</b> см.",
      { tt: "per", long: true, pic: f.svg({ h: 130 }), err: errs([[r + x, "OA і OB — обидва радіуси."], [4 * r + x, "Сторони OA і OB — радіуси, а не діаметри."]], 2 * r + x), chk: { v: "2*" + r + "+" + x } });
  };
  /* §22. Дотична */
  function tanPic(phi, two) { // P на відстані 1/sin(phi/2)… phi — кут APO
    var f = new Fig(), O = P(0, 0), r = 1.6, d = r / Math.sin(rad(phi)), Pp = P(d, 0), A = pol(O, r, 90 - phi), B = pol(O, r, -(90 - phi));
    f.circ(O, r); f.seg(Pp, A); f.seg(O, A); f.seg(O, Pp, { c: GR, dash: true }); f.rt(A, O, Pp);
    if (two) { f.seg(Pp, B); f.seg(O, B); f.rt(B, O, Pp); f.pt(B, "B"); }
    f.pt(O, "O", { dir: [-1, 0] }); f.pt(A, "A"); f.pt(Pp, "P", { dir: [1, 0] });
    return { f: f, O: O, A: A, B: B, P: Pp };
  }
  G.gTan = function (a) {
    var t = a.tt || pick(a.easy ? ["aop"] : ["aop", "seg", "aob", "r2"]), x, g;
    if (t === "aop") { x = R(20, 70); g = tanPic(x); g.f.arc(g.P, g.O, g.A, x + D, { r: 26 }); g.f.arc(g.O, g.A, g.P, "?", { r: 18, c: C2 });
      return num("PA — дотична до кола з центром O, A — точка дотику, ∠APO = " + x + D + ".\n∠AOP = ___" + D, 90 - x, ["Дотична перпендикулярна до радіуса, проведеного в точку дотику: ∠OAP = 90" + D + ".", "У ΔOAP: ∠AOP = 90" + D + " − ∠APO."], "OA ⊥ PA, ∠OAP = 90" + D + ", тож ∠AOP = 90" + D + " − " + x + D + " = <b>" + (90 - x) + D + "</b>.",
        { tt: t, long: true, pic: g.f.svg({ h: 130 }), err: errs([[180 - x, "Не забудь, що ∠OAP = 90" + D + "."]], 90 - x), chk: { v: "90-" + x } }); }
    if (t === "seg") { x = R(25, 60); g = tanPic(x, true); var l = R(3, 15); g.f.lab(g.P, g.A, l + " см"); g.f.lab(g.P, g.B, "?", { c: C2 });
      return num("PA і PB — дотичні до кола, A і B — точки дотику, PA = " + l + " см.\nPB = ___ см", l, ["Відрізки дотичних, проведених з однієї точки, рівні.", "PA = PB."], "Відрізки дотичних з точки P рівні: PB = PA = <b>" + l + "</b> см.",
        { tt: t, long: true, pic: g.f.svg({ h: 130 }), err: errs([[2 * l, "PA і PB рівні, а не PB удвічі довша."]], l), chk: { v: String(l) } }); }
    if (t === "aob") { x = R(15, 50); g = tanPic(x, true); g.f.arc(g.P, g.B, g.A, 2 * x + D, { r: 24 }); g.f.arc(g.O, g.A, g.B, "?", { r: 16, c: C2, lr: 10 }); g.f.L = g.f.L.filter(function (l) { return !(l.k === "seg" && l.o.dash); });
      return num("PA і PB — дотичні до кола з центром O, ∠APB = " + 2 * x + D + ".\n∠AOB = ___" + D, 180 - 2 * x, ["∠OAP = ∠OBP = 90" + D + " (дотична ⊥ радіус).", "PO ділить ∠APB навпіл (відрізки дотичних рівні). У прямокутному ΔAOP: ∠AOP = 90" + D + " − ∠APO, а ∠AOB = 2 · ∠AOP."],
        "∠APO = " + x + D + " (PO — бісектриса), ∠AOP = 90" + D + " − " + x + D + " = " + (90 - x) + D + ", ∠AOB = 2 · " + (90 - x) + D + " = <b>" + (180 - 2 * x) + D + "</b>.",
        { tt: t, long: true, pic: g.f.svg({ h: 130 }), err: errs([[90 - 2 * x > 0 ? 90 - 2 * x : null, "Тут ∠AOB + ∠APB = 180" + D + "."], [90 - x, "Це ∠AOP — лише половина ∠AOB."]].filter(function (z) { return z[0] != null; }), 180 - 2 * x), chk: { v: "180-" + 2 * x } }); }
    var rr = R(2, 12); g = tanPic(30); g.f.lab(g.O, g.A, rr + " см"); g.f.lab(g.O, g.P, 2 * rr + " см", { away: P(0, 3) }); g.f.arc(g.P, g.O, g.A, "?", { r: 30, c: C2 });
    if (Math.random() < 0.5) { g.f.L = g.f.L.filter(function (l) { return !(l.k === "arc"); }); g.f.arc(g.O, g.A, g.P, "?", { r: 18, c: C2 });
      return num("PA — дотична до кола з центром O, OA = " + rr + " см, OP = " + 2 * rr + " см.\n∠AOP = ___" + D, 60, ["ΔOAP — прямокутний (∠A = 90" + D + "), OP — гіпотенуза.", "Катет OA — половина гіпотенузи, тож проти нього кут 30" + D + ". А ∠AOP — другий гострий кут."],
        "OA = OP : 2, тож ∠APO = 30" + D + ", ∠AOP = 90" + D + " − 30" + D + " = <b>60" + D + "</b>.", { tt: "r2", long: true, pic: g.f.svg({ h: 130 }), err: errs([[30, "30" + D + " — це ∠APO (проти катета OA). ∠AOP = 90" + D + " − 30" + D + "."]], 60), chk: { v: "90-30" } }); }
    return num("PA — дотична до кола з центром O, OA = " + rr + " см, OP = " + 2 * rr + " см.\n∠APO = ___" + D, 30, ["ΔOAP — прямокутний (∠A = 90" + D + "), OP — гіпотенуза.", "Катет OA удвічі менший за гіпотенузу OP — він лежить проти кута 30" + D + "."], "OA = OP : 2, тож кут проти OA дорівнює 30" + D + ": ∠APO = <b>30" + D + "</b>.",
      { tt: "r2", long: true, pic: g.f.svg({ h: 130 }), err: errs([[60, "60" + D + " — це ∠AOP. Проти катета OA лежить ∠APO."], [45, "Катет, що дорівнює половині гіпотенузи, лежить проти 30" + D + "."]], 30), chk: { v: "30" } });
  };
  /* §23–24. Вписане й описане коло */
  G.gCenters = function (a) {
    var t = a.tt || pick(["in", "out", "rt", "pos", "eq", "eq", "how"]);
    if (t === "eq") { var Qs = [["Точка перетину бісектрис трикутника однаково віддалена від…", "усіх його сторін", ["усіх його вершин", "середин сторін", "основ висот"], "Кожна точка бісектриси кута рівновіддалена від його сторін, тож точка перетину бісектрис — від усіх трьох сторін (це центр вписаного кола)."],
        ["Точка перетину серединних перпендикулярів до сторін трикутника однаково віддалена від…", "усіх його вершин", ["усіх його сторін", "середин сторін", "основ висот"], "Кожна точка серединного перпендикуляра рівновіддалена від кінців відрізка, тож точка перетину — від усіх трьох вершин (центр описаного кола)."],
        ["Де завжди лежить центр кола, вписаного в трикутник?", "всередині трикутника", ["на одній зі сторін", "поза трикутником", "у вершині найбільшого кута"], "Бісектриси трикутника перетинаються всередині нього, тож центр вписаного кола — завжди всередині."]], q = pick(Qs), e3 = {}; q[2].forEach(function (w) { e3[w] = q[3]; });
      return choice("Обери", q[0], q[1], q[2], ["Згадай, чим є ця точка: центром вписаного чи описаного кола.", "Вписане коло торкається сторін, описане — проходить через вершини."], q[3] + " Відповідь: <b>" + q[1] + "</b>.", { tt: "eq", long: true, err: e3, chk: { pick: q[1] } }); }
    if (t === "how") return choice("Обери", "Скільки кіл можна вписати в даний трикутник?", "одне", ["жодного", "два", "безліч"], ["Центр вписаного кола — точка перетину бісектрис.", "Скільки точок перетину мають три бісектриси трикутника?"],
      "Бісектриси перетинаються в одній точці, і радіус визначається однозначно — коло <b>одне</b>.", { tt: "how", keep: ["жодного", "одне", "два", "безліч"], err: { "жодного": "У будь-який трикутник можна вписати коло.", "два": "Центр — одна точка перетину бісектрис, тож коло одне.", "безліч": "Безліч кіл можна вписати в кут, а в трикутник — лише одне." }, chk: { pick: "одне" } });
    var L4 = ["бісектрис", "медіан", "висот", "серединних перпендикулярів до сторін"];
    if (t === "in" || t === "out") { var ins = t === "in", r = ins ? "бісектрис" : "серединних перпендикулярів до сторін";
      return choice("Обери", "Центр кола, " + (ins ? "вписаного в трикутник" : "описаного навколо трикутника") + ", — це точка перетину…", r, L4.filter(function (z) { return z !== r; }),
        [ins ? "Центр вписаного кола однаково віддалений від усіх <b>сторін</b>." : "Центр описаного кола однаково віддалений від усіх <b>вершин</b>.", ins ? "Точки, рівновіддалені від сторін кута, лежать на його бісектрисі." : "Точки, рівновіддалені від кінців відрізка, лежать на серединному перпендикулярі до нього."],
        "Центр " + (ins ? "вписаного" : "описаного") + " кола — точка перетину <b>" + r + "</b>.", { tt: t, keep: L4, err: errs([[ins ? "серединних перпендикулярів до сторін" : "бісектрис", ins ? "Серединні перпендикуляри — для <b>описаного</b> кола (рівновіддалена від вершин точка)." : "Бісектриси — для <b>вписаного</b> кола (рівновіддалена від сторін точка)."], ["медіан", "Медіани теж перетинаються в одній точці, але вона не центр кола."], ["висот", "Висоти теж перетинаються в одній точці, але вона не центр кола."]], r), chk: { pick: r } }); }
    if (t === "rt") return choice("Обери", "Де лежить центр кола, описаного навколо прямокутного трикутника?", "на середині гіпотенузи", ["у вершині прямого кута", "на середині більшого катета", "поза трикутником"],
      ["Центр описаного кола — точка перетину серединних перпендикулярів до сторін.", "У прямокутному трикутнику серединні перпендикуляри до катетів перетинаються на гіпотенузі — у її середині."], "Серединні перпендикуляри перетинаються <b>на середині гіпотенузи</b>: вона однаково віддалена від усіх трьох вершин. Тож гіпотенуза — діаметр, R = гіпотенуза : 2.",
      { tt: t, err: { "у вершині прямого кута": "Центр однаково віддалений від усіх вершин, тож у самій вершині лежати не може.", "на середині більшого катета": "Від середини катета до третьої вершини далі, ніж до кінців катета. Центр — на гіпотенузі.", "поза трикутником": "Поза трикутником центр лежить у тупокутного трикутника." }, chk: { pick: "на середині гіпотенузи" } });
    var kind = pick(["гострокутного", "тупокутного"]), ans = { "гострокутного": "всередині трикутника", "тупокутного": "поза трикутником", "прямокутного": "на середині гіпотенузи" }[kind];
    return choice("Обери", "Де лежить центр кола, описаного навколо " + kind + " трикутника?", ans, ["всередині трикутника", "поза трикутником", "на середині гіпотенузи", "у вершині найбільшого кута"],
      ["Для прямокутного трикутника центр — на середині гіпотенузи.", "Чим «тупіший» трикутник, тим далі центр зміщується за найдовшу сторону."], "У " + kind + " трикутника центр описаного кола — <b>" + ans + "</b>.",
      { tt: "pos", err: { "всередині трикутника": "Всередині — у гострокутного трикутника.", "поза трикутником": "Поза трикутником — у тупокутного.", "на середині гіпотенузи": "Так буває лише у прямокутного трикутника.", "у вершині найбільшого кута": "Центр однаково віддалений від вершин, тож у вершині лежати не може." }, chk: { pick: ans } });
  };
  G.gInOut = function (a) {
    var t = a.tt || pick(a.easy ? ["R"] : ["R", "hyp", "tanP", "tanAK", "half"]), x, y, z, f;
    if (t === "R" || t === "hyp") { var c = 2 * R(3, 15), isR = t === "R";
      f = new Fig(); var al = R(25, 65), A = P(-2, 0), B = P(2, 0), C = pol(P(0, 0), 2, 180 - 2 * al); f.circ(P(0, 0), 2); drawTri(f, [A, C, B], ["A", "C", "B"]); f.rt(C, A, B); f.pt(P(0, 0), "O", { dir: [0, 1] });
      return num("Навколо прямокутного трикутника ABC (∠C = 90" + D + ") описано коло. " + (isR ? "Гіпотенуза AB = " + c + " см.\nРадіус кола = ___ см" : "Радіус кола " + c / 2 + " см.\nAB = ___ см"), isR ? c / 2 : c,
        ["Центр кола, описаного навколо прямокутного трикутника, — середина гіпотенузи.", "Гіпотенуза — діаметр: R = AB : 2."], isR ? "R = " + c + " : 2 = <b>" + c / 2 + "</b> см." : "AB = 2R = <b>" + c + "</b> см.",
        { tt: t, long: true, pic: f.svg({ h: 130 }), err: errs([[isR ? c : c / 2, isR ? "Гіпотенуза — діаметр, радіус — половина." : "Радіус — половина гіпотенузи, тож гіпотенуза удвічі довша."]], isR ? c / 2 : c), chk: { v: isR ? c + "/2" : String(c) } }); }
    if (t === "tanP") { x = R(2, 9); y = R(2, 9); z = R(2, 9);
      return num("Коло, вписане в трикутник ABC, дотикається до сторін AB, BC, CA в точках K, L, M.\nAK = " + x + " см, BL = " + y + " см, CM = " + z + " см.\nПериметр ΔABC = ___ см", 2 * (x + y + z),
        ["Відрізки дотичних з однієї вершини рівні: AK = AM, BK = BL, CL = CM.", "Кожна сторона складається з двох таких відрізків, і кожен трапляється двічі."], "AM = AK = " + x + ", BK = BL = " + y + ", CL = CM = " + z + ". P = 2 · (" + x + " + " + y + " + " + z + ") = <b>" + 2 * (x + y + z) + "</b> см.",
        { tt: t, long: true, err: errs([[x + y + z, "Кожен відрізок дотичної трапляється двічі (з обох боків від вершини)."]], 2 * (x + y + z)), chk: { v: "2*(" + x + "+" + y + "+" + z + ")" } }); }
    if (t === "tanAK") { x = R(2, 9); y = R(2, 9); z = R(2, 9); var AB = x + y, BC = y + z, AC = x + z;
      return num("Коло, вписане в трикутник ABC, дотикається до AB в точці K.\nAB = " + AB + " см, BC = " + BC + " см, AC = " + AC + " см.\nAK = ___ см", x,
        ["Познач AK = AM = x, тоді BK = BL = " + AB + " − x, CM = CL = " + AC + " − x.", "BL + LC = BC: (" + AB + " − x) + (" + AC + " − x) = " + BC + "."], "(" + AB + " − x) + (" + AC + " − x) = " + BC + "; 2x = " + (AB + AC - BC) + "; AK = <b>" + x + "</b> см. (Формула: AK = (AB + AC − BC) : 2.)",
        { tt: t, long: true, err: errs([[AB / 2, "Точка дотику не обов'язково ділить сторону навпіл."], [AB + AC - BC, "Це 2x. Поділи на 2."]], x), chk: { v: "(" + AB + "+" + AC + "-" + BC + ")/2" } }); }
    x = 2 * R(15, 70);
    return num("O — центр кола, вписаного в трикутник ABC, ∠BAC = " + x + D + ".\n∠OAC = ___" + D, x / 2, ["Центр вписаного кола — точка перетину бісектрис.", "AO — бісектриса кута A."], "AO — бісектриса, ∠OAC = " + x + D + " : 2 = <b>" + x / 2 + D + "</b>.",
      { tt: "half", long: true, err: errs([[x, "AO ділить кут A навпіл."]], x / 2), chk: { v: x + "/2" } });
  };
  /* §25. Центральні та вписані кути */
  G.gInscr = function (a) {
    var t = a.tt || pick(a.easy ? ["ins", "cen"] : ["ins", "cen", "diam", "same", "arc"]), x, f = new Fig(), O = P(0, 0), th = R(-120, -60);
    f.circ(O, 2);
    if (t === "ins" || t === "cen" || t === "arc") { x = 2 * R(20, 80); var A = pol(O, 2, th - x / 2), B = pol(O, 2, th + x / 2), C = pol(O, 2, th + 180 + R(-40, 40));
      f.seg(C, A); f.seg(C, B); f.pt(A, "A"); f.pt(B, "B"); f.pt(C, "C");
      if (t !== "arc") { f.seg(O, A, { c: GR }); f.seg(O, B, { c: GR }); f.pt(O, "O", { dir: [-Math.cos(rad(th)), Math.sin(rad(th))] }); }
      if (t === "ins") { f.arc(O, A, B, x + D, { r: 18 }); f.arc(C, A, B, "?", { c: C2, r: 26 });
        return num("O — центр кола, ∠AOB = " + x + D + ".\nВписаний кут ACB = ___" + D, x / 2, ["∠ACB і ∠AOB спираються на ту саму дугу AB.", "Вписаний кут дорівнює половині центрального, що спирається на ту саму дугу."], "∠ACB = ∠AOB : 2 = " + x + D + " : 2 = <b>" + x / 2 + D + "</b>.",
          { tt: t, long: true, pic: f.svg({ h: 140 }), err: errs([[x, "Вписаний кут — половина центрального."], [2 * x, "Вписаний кут менший за центральний (удвічі), а не більший."]], x / 2), chk: { v: x + "/2" } }); }
      if (t === "cen") { f.arc(C, A, B, x / 2 + D, { r: 26 }); f.arc(O, A, B, "?", { c: C2, r: 18 });
        return num("O — центр кола, вписаний кут ACB = " + x / 2 + D + ".\n∠AOB = ___" + D, x, ["Центральний кут спирається на ту саму дугу AB.", "Центральний кут удвічі більший за вписаний."], "∠AOB = 2 · " + x / 2 + D + " = <b>" + x + D + "</b>.",
          { tt: t, long: true, pic: f.svg({ h: 140 }), err: errs([[x / 4, "Центральний кут більший за вписаний, а не менший."]], x), chk: { v: "2*" + x / 2 } }); }
      f.arc(C, A, B, "?", { c: C2, r: 26 });
      return num("Вписаний кут ACB спирається на дугу AB, що дорівнює " + x + D + ".\n∠ACB = ___" + D, x / 2, ["Градусна міра дуги дорівнює центральному куту, що на неї спирається.", "Вписаний кут — половина дуги, на яку він спирається."], "∠ACB = " + x + D + " : 2 = <b>" + x / 2 + D + "</b>.",
        { tt: "arc", long: true, pic: f.svg({ h: 140 }), err: errs([[x, "Вписаний кут — половина дуги."]], x / 2), chk: { v: x + "/2" } }); }
    if (t === "diam") { x = R(15, 75); var A2 = pol(O, 2, 180), B2 = pol(O, 2, 0), C2p = pol(O, 2, 2 * x);
      f.seg(A2, B2); f.seg(A2, C2p); f.seg(C2p, B2); f.pt(A2, "A"); f.pt(B2, "B"); f.pt(C2p, "C"); f.pt(O, "O", { dir: [0, 1] }); f.arc(A2, B2, C2p, x + D, { r: 26 });
      var askC = Math.random() < 0.5;
      if (askC) f.arc(C2p, A2, B2, "?", { c: C2, r: 16 }); else f.arc(B2, C2p, A2, "?", { c: C2, r: 26 });
      return num("AB — діаметр кола, C — точка на колі, ∠CAB = " + x + D + ".\n" + (askC ? "∠ACB" : "∠ABC") + " = ___" + D, askC ? 90 : 90 - x, ["Вписаний кут, що спирається на діаметр, — прямий.", askC ? "∠ACB спирається на діаметр AB." : "∠ACB = 90" + D + ", тож ∠ABC = 90" + D + " − ∠CAB."],
        askC ? "∠ACB спирається на діаметр: <b>90" + D + "</b>." : "∠ACB = 90" + D + ", ∠ABC = 90" + D + " − " + x + D + " = <b>" + (90 - x) + D + "</b>.", { tt: t, long: true, pic: f.svg({ h: 140 }), err: errs(askC ? [[180 - x, "Вписаний кут на діаметр — завжди 90" + D + "."]] : [[180 - x, "∠ACB = 90" + D + " (на діаметр), тож ∠ABC = 90" + D + " − " + x + D + "."]], askC ? 90 : 90 - x), chk: { v: askC ? "90" : "90-" + x } }); }
    x = R(20, 75); var arc = 2 * x, A3 = pol(O, 2, th - x), B3 = pol(O, 2, th + x), C3 = pol(O, 2, th + 150), D3 = pol(O, 2, th + 215);
    f.seg(C3, A3); f.seg(C3, B3); f.seg(D3, A3); f.seg(D3, B3); f.pt(A3, "A"); f.pt(B3, "B"); f.pt(C3, "C"); f.pt(D3, "D");
    f.arc(C3, A3, B3, x + D, { r: 26 }); f.arc(D3, A3, B3, "?", { r: 26, c: C2 });
    return num("Точки A, B, C, D лежать на колі, ∠ACB = " + x + D + ".\n∠ADB = ___" + D, x, ["Обидва кути — вписані й спираються на ту саму дугу AB.", "Вписані кути, що спираються на ту саму дугу, рівні."], "∠ADB і ∠ACB спираються на дугу AB, тож рівні: <b>" + x + D + "</b>.",
      { tt: "same", long: true, pic: f.svg({ h: 140 }), err: errs([[2 * x, "Обидва кути вписані — жоден не центральний."], [180 - x, "Ці кути не доповнюють один одного — вони рівні."]], x), chk: { v: String(x) } });
  };
  /* §26. Два кола */
  var POS2 = ["перетинаються", "дотикаються зовні", "дотикаються внутрішньо", "не мають спільних точок"];
  function pos2(Rr, r, d) { return d === Rr + r ? "дотикаються зовні" : d === Rr - r ? "дотикаються внутрішньо" : d < Rr + r && d > Rr - r ? "перетинаються" : "не мають спільних точок"; }
  G.gTwo = function (a) {
    var t = a.tt || pick(a.easy ? ["pos"] : ["pos", "pos", "dOut", "dIn"]), Rr, r, d, ans;
    if (t === "pos") { r = R(2, 8); Rr = r + R(1, 8); var md = pick(["ext", "int", "cross", "far", "inside"]);
      d = md === "ext" ? Rr + r : md === "int" ? Rr - r : md === "cross" ? R(Rr - r + 1, Rr + r - 1) : md === "far" ? Rr + r + R(1, 6) : R(0, Rr - r - 1);
      ans = pos2(Rr, r, d); var f = new Fig(), sc = 2 / Rr; f.circ(P(0, 0), Rr * sc); f.circ(P(d * sc, 0), r * sc, { c: C1 }); f.pt(P(0, 0), "O" + SUB1, { dir: [0, 1] }); if (d) f.pt(P(d * sc, 0), "O₂", { dir: [0, 1], c: C1 });
      return choice("Обери", "Радіуси двох кіл — " + Rr + " см і " + r + " см, відстань між центрами — " + d + " см.\nЯк розміщені кола?", ans, POS2,
        ["Порівняй відстань d із сумою радіусів R + r = " + (Rr + r) + " і різницею R − r = " + (Rr - r) + ".", "d = R + r — дотик зовні; d = R − r — дотик внутрішній; між ними — перетин; інакше спільних точок немає."],
        "R + r = " + (Rr + r) + ", R − r = " + (Rr - r) + ", d = " + d + ". " + (ans === "перетинаються" ? (Rr - r) + " < " + d + " < " + (Rr + r) : ans === "дотикаються зовні" ? "d = R + r" : ans === "дотикаються внутрішньо" ? "d = R − r" : d > Rr + r ? "d > R + r" : "d < R − r (одне коло всередині іншого)") + ", тож кола <b>" + ans + "</b>.",
        { tt: t, keep: POS2, long: true, err: (function () { var o = {}; POS2.forEach(function (p) { if (p !== ans) o[p] = { "перетинаються": "Кола перетинаються, коли R − r < d < R + r.", "дотикаються зовні": "Зовнішній дотик — коли d = R + r.", "дотикаються внутрішньо": "Внутрішній дотик — коли d = R − r.", "не мають спільних точок": "Спільних точок немає, коли d > R + r або d < R − r." }[p]; }); return o; })(), chk: { R: Rr, r: r, d: d } }); }
    r = R(2, 9); Rr = r + R(1, 9); var out = t === "dOut"; ans = out ? Rr + r : Rr - r;
    return num("Два кола радіусів " + Rr + " см і " + r + " см дотикаються " + (out ? "зовні" : "внутрішньо") + ".\nВідстань між центрами = ___ см", ans,
      ["Точка дотику лежить на прямій, що з'єднує центри.", out ? "Центри — по різні боки від точки дотику: d = R + r." : "Центри — з одного боку від точки дотику: d = R − r."], "d = " + Rr + (out ? " + " : " − ") + r + " = <b>" + ans + "</b> см.",
      { tt: t, long: true, err: errs([[out ? Rr - r : Rr + r, out ? "При зовнішньому дотику радіуси додаємо." : "При внутрішньому дотику радіуси віднімаємо."]], ans), chk: { v: Rr + (out ? "+" : "-") + r } });
  };
  /* §27 + ГМТ: побудови і геометричне місце точок */
  var LOC = [
    ["Геометричне місце точок, рівновіддалених від кінців відрізка AB, — це…", "серединний перпендикуляр до AB", ["бісектриса", "коло з діаметром AB", "пряма, паралельна AB"], "Точка однаково віддалена від A і B тоді й лише тоді, коли лежить на серединному перпендикулярі до AB."],
    ["Геометричне місце точок кута, рівновіддалених від його сторін, — це…", "бісектриса кута", ["серединний перпендикуляр", "медіана", "коло"], "Точка всередині кута однаково віддалена від його сторін, якщо лежить на бісектрисі."],
    ["Геометричне місце точок, що лежать на відстані 3 см від точки O, — це…", "коло з центром O і радіусом 3 см", ["круг з центром O і радіусом 3 см", "дві прямі", "відрізок довжиною 3 см"], "Усі точки на відстані 3 см від O утворюють коло радіуса 3 см (круг містить ще й внутрішні точки)."],
    ["Геометричне місце точок, віддалених від точки O не більше ніж на 3 см, — це…", "круг з центром O і радіусом 3 см", ["коло з центром O і радіусом 3 см", "кільце", "відрізок довжиною 3 см"], "«Не більше ніж на 3 см» — і точки кола, і всі внутрішні точки: це круг."],
    ["Геометричне місце центрів кіл, що проходять через точки A і B, — це…", "серединний перпендикуляр до AB", ["пряма AB", "коло з діаметром AB", "бісектриса"], "Центр кола однаково віддалений від A і B (радіуси), тож лежить на серединному перпендикулярі до AB."],
    ["Будуємо: дві дуги однакового радіуса з центрами в кінцях відрізка AB, через точки їх перетину — пряму. Що побудовано?", "серединний перпендикуляр до AB", ["бісектрису кута", "пряму, паралельну AB", "дотичну до кола"], "Точки перетину дуг рівновіддалені від A і B — пряма через них є серединним перпендикуляром (а заодно ділить AB навпіл)."],
    ["Будуємо: дуга з вершини кута перетинає сторони в точках M і N; з M і N — дуги однакового радіуса, що перетинаються в точці K. Промінь з вершини через K — це…", "бісектриса кута", ["серединний перпендикуляр", "медіана", "висота"], "Трикутники рівні за трьома сторонами, тож промінь ділить кут навпіл — це бісектриса."],
    ["Для побудови трикутника за трьома сторонами беруть відрізок a, а з його кінців проводять дуги радіусами b і c. Коли побудова неможлива?", "коли одна сторона не менша за суму двох інших", ["коли всі сторони різні", "коли дві сторони рівні", "побудова можлива завжди"], "Дуги перетнуться лише тоді, коли виконується нерівність трикутника: кожна сторона менша за суму двох інших."]
  ];
  G.gLocus = function (a) {
    var i = a.tt != null ? +a.tt : R(0, LOC.length - 1), q = LOC[i], e2 = {}; q[2].forEach(function (w) { e2[w] = q[3]; });
    return choice("Обери", q[0], q[1], q[2], ["Подумай, яку властивість мають усі такі точки (або яку властивість має отримана фігура).", "Уяви кілька таких точок і подумай, на якій лінії вони всі лягають."],
      q[3] + " Відповідь: <b>" + q[1] + "</b>.", { tt: String(i), long: true, err: e2, chk: { pick: q[1] } });
  };
})();
