/* =====================================================================
   algebra.js — генератори завдань з алгебри (7 клас, НУШ, порядок тем — підручник Істер 2024)
   + повторення 5–6 класу (дроби, десяткові, від'ємні числа, порядок дій, пропорції, відсотки).
   Завдання type "num" з kb:"alg" — клавіатура з мінусом, комою і дробовою рискою;
   відповідь порівнюється за значенням (3/6 — «скороти», 0,5 = 1/2).
   chk — дані для незалежної перевірки (tools/check_algebra.js).
   ===================================================================== */
(function () {
  "use strict";
  var E = window.E;
  var G = (E.GEN = E.GEN || {});
  var M = "−", X = "·";

  function R(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function RNZ(a, b) { var v; do { v = R(a, b); } while (v === 0); return v; }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
  function lcm(a, b) { return a / gcd(a, b) * b; }
  function sn(n) { return n < 0 ? M + (-n) : String(n); }          // −3
  function pn(n) { return n < 0 ? "(" + M + (-n) + ")" : String(n); } // (−3)
  /* дріб n/d → скорочений рядок «−3/4» або ціле */
  function fr(n, d) { if (d < 0) { n = -n; d = -d; } var g = gcd(n, d) || 1; n /= g; d /= g; return d === 1 ? sn(n) : (n < 0 ? M : "") + Math.abs(n) + "/" + d; }
  /* десятковий: значення в сотих → «2,45» */
  function dec(h) { var s = h < 0 ? M : ""; h = Math.abs(h); var i = Math.floor(h / 100), r = h % 100; return s + i + (r ? "," + (r < 10 ? "0" + r : String(r)).replace(/0$/, "") : ""); }
  function decJ(h) { return String(h / 100); }
  var SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹";
  function sup(n) { return n === 1 ? "" : String(n).split("").map(function (c) { return SUP[+c]; }).join(""); }
  function num(p, a, h, e, extra) {
    var it = { type: "num", kb: "alg", task: "Обчисли", p: p, a: String(a), h: h, e: e };
    for (var k in extra || {}) it[k] = extra[k];
    return it;
  }
  function choice(task, p, right, wrong, h, e, extra) {
    var o = [right], seen = {}; seen[right] = 1;
    wrong.forEach(function (w) { if (!seen[w] && o.length < 4) { seen[w] = 1; o.push(w); } });
    var it = { type: "choice", task: task, p: p, o: shuffle(o), a: right, h: h, e: e };
    for (var k in extra || {}) it[k] = extra[k];
    return it;
  }
  function errs(list, right) { var o = {}; list.forEach(function (x) { var k = String(x[0]); if (k !== String(right) && !o[k]) o[k] = x[1]; }); return o; }

  /* ---------- одночлени й многочлени: показ і JS ---------- */
  // vars: {a:2, b:1}
  function monoD(c, vars, first) {
    var v = "", keys = Object.keys(vars).sort();
    keys.forEach(function (k) { if (vars[k] > 0) v += k + sup(vars[k]); });
    var ac = Math.abs(c), body = (ac === 1 && v ? "" : String(ac)) + v;
    if (first === false) return (c < 0 ? " " + M + " " : " + ") + body;
    return (c < 0 ? M : "") + body;
  }
  function monoJ(c, vars) { var s = "(" + c + ")"; Object.keys(vars).forEach(function (k) { if (vars[k] > 0) s += "*" + k + "**" + vars[k]; }); return s; }
  // terms: [[c, "x"], [c, ""]] — лінійні члени
  function polyD(terms) {
    var s = "";
    terms.forEach(function (t, i) {
      var c = t[0], v = t[1], ac = Math.abs(c), body = (ac === 1 && v ? "" : String(ac)) + v;
      if (c === 0) return;
      s += s === "" ? (c < 0 ? M : "") + body : (c < 0 ? " " + M + " " : " + ") + body;
    });
    return s || "0";
  }
  function polyJ(terms) { return terms.map(function (t) { return "(" + t[0] + ")" + (t[1] ? "*" + t[1] : ""); }).join("+") || "0"; }

  /* =================== 5–6 клас: звичайні дроби =================== */
  G.fRed = function () {
    var b = R(2, 12), a; do { a = R(1, 2 * b); } while (gcd(a, b) !== 1 || a === b);
    var k = R(2, 9), N = a * k, D = b * k;
    return num(N + "/" + D + " = ___", fr(a, b),
      ["Знайди число, на яке діляться і " + N + ", і " + D + ".", "Обидва діляться на " + k + ": " + N + " : " + k + " = ?, " + D + " : " + k + " = ?"],
      N + "/" + D + " = <b>" + fr(a, b) + "</b> (поділили чисельник і знаменник на " + k + ").",
      { task: "Скороти дріб", chk: { v: N + "/" + D } });
  };
  G.fAdd = function () {
    var b, d, a, c, plus, n, L;
    do {
      b = R(2, 12); d = R(2, 12); a = R(1, b - 1); c = R(1, d - 1); plus = Math.random() < 0.55;
      L = lcm(b, d); n = plus ? a * L / b + c * L / d : a * L / b - c * L / d;
    } while (b === d || gcd(a, b) !== 1 || gcd(c, d) !== 1 || n <= 0 || L > 60);
    var op = plus ? " + " : " " + M + " ", A = a * L / b, C = c * L / d, r = fr(n, L);
    var wrongN = plus ? a + c : a - c, wrong = wrongN > 0 ? fr(wrongN, plus ? b + d : Math.abs(b - d) || 1) : null;
    return num(a + "/" + b + op + c + "/" + d + " = ___", r,
      ["Спершу зведи дроби до спільного знаменника: найменше спільне кратне " + b + " і " + d + " — це " + L + ".",
       a + "/" + b + " = " + A + "/" + L + ", " + c + "/" + d + " = " + C + "/" + L + ". Тепер " + (plus ? "додай" : "відніми") + " чисельники."],
      a + "/" + b + op + c + "/" + d + " = " + A + "/" + L + op + C + "/" + L + " = " + n + "/" + L + (fr(n, L) !== n + "/" + L ? " = <b>" + r + "</b>" : "") + ".",
      { err: wrong ? errs([[wrong, "Знаменники не " + (plus ? "додаються" : "віднімаються") + "! Спершу зведи дроби до спільного знаменника " + L + "."]], r) : {},
        chk: { v: a + "/" + b + (plus ? "+" : "-") + c + "/" + d } });
  };
  G.fMul = function () {
    var a = R(1, 9), b = R(2, 12), c = R(1, 9), d = R(2, 12), div = Math.random() < 0.5;
    while (gcd(a, b) !== 1 || a === b) { a = R(1, 9); b = R(2, 12); }
    while (gcd(c, d) !== 1 || c === d) { c = R(1, 9); d = R(2, 12); }
    var r = div ? fr(a * d, b * c) : fr(a * c, b * d);
    var it = num(a + "/" + b + (div ? " : " : " " + X + " ") + c + "/" + d + " = ___", r,
      div ? ["Ділення на дріб — це множення на перевернутий дріб: " + c + "/" + d + " → " + d + "/" + c + ".", a + "/" + b + " " + X + " " + d + "/" + c + " = (" + a + " " + X + " " + d + ")/(" + b + " " + X + " " + c + "). Не забудь скоротити."]
          : ["Чисельник множимо на чисельник, знаменник — на знаменник.", "(" + a + " " + X + " " + c + ")/(" + b + " " + X + " " + d + ") = " + a * c + "/" + b * d + ". Скороти, якщо можна."],
      div ? a + "/" + b + " : " + c + "/" + d + " = " + a + "/" + b + " " + X + " " + d + "/" + c + " = <b>" + r + "</b>."
          : a + "/" + b + " " + X + " " + c + "/" + d + " = " + a * c + "/" + b * d + " = <b>" + r + "</b>.",
      { chk: { v: "(" + a + "/" + b + ")" + (div ? "/" : "*") + "(" + c + "/" + d + ")" } });
    if (div) it.err = errs([[fr(a * c, b * d), "Це ти перемножила дроби. При <b>діленні</b> другий дріб перевертаємо: " + c + "/" + d + " → " + d + "/" + c + "."]], r);
    return it;
  };

  /* =================== десяткові, пропорції, відсотки =================== */
  G.dOps = function () {
    var t = pick(["add", "sub", "mul", "mul", "div"]), A, B, r, p, h, e, err = {}, js;
    if (t === "add") { A = R(11, 99) * 10; B = R(101, 499); r = A + B; p = dec(A) + " + " + dec(B); js = decJ(A) + "+" + decJ(B);
      h = ["Пиши кому під комою: десяті під десятими, соті під сотими.", dec(A) + " = " + dec(A) + "0 — допиши нуль, щоб було однаково знаків після коми."];
      e = dec(A) + " + " + dec(B) + " = <b>" + dec(r) + "</b> (кома під комою).";
      err = errs([[dec(A / 10 + B), "Кому треба писати під комою: десяті під десятими."]], dec(r)); }
    else if (t === "sub") { A = R(31, 99) * 10; B = R(101, A - 10); if (B % 10 === 0) B++; r = A - B; p = dec(A) + " " + M + " " + dec(B); js = decJ(A) + "-" + decJ(B);
      h = ["Допиши нуль: " + dec(A) + " = " + dec(A) + "0, щоб знаків після коми було однаково.", "Тепер віднімай, як цілі числа, і постав кому під комою."];
      e = dec(A) + "0 " + M + " " + dec(B) + " = <b>" + dec(r) + "</b>."; }
    else if (t === "mul") { var x = Math.random() < 0.5 ? R(2, 9) : R(11, 39), y = R(2, 9); if (x % 10 === 0) x++; A = x * 10; B = y * 10; r = x * y; // десяті × десяті = соті
      p = dec(A) + " " + X + " " + dec(B); js = decJ(A) + "*" + decJ(B);
      h = ["Помнож, не дивлячись на коми: " + x + " " + X + " " + y + " = " + x * y + ".", "У множниках разом " + (2) + " знаки після коми — у відповіді теж 2 знаки."];
      e = x + " " + X + " " + y + " = " + x * y + ", після коми разом 2 знаки → <b>" + dec(r) + "</b>.";
      err = errs([[dec(r * 10), "Порахуй знаки після коми в обох множниках разом — у відповіді стільки ж (тут 2)."]], dec(r)); }
    else { var y2 = R(2, 9), q = R(2, 12); B = y2 * 10; A = B * q; r = q * 100; p = dec(A) + " : " + dec(B); js = decJ(A) + "/" + decJ(B);
      h = ["Перенеси кому в обох числах на один знак вправо — частка не зміниться.", dec(A) + " : " + dec(B) + " = " + A / 10 + " : " + y2 + "."];
      e = dec(A) + " : " + dec(B) + " = " + A / 10 + " : " + y2 + " = <b>" + q + "</b>.";
      err = errs([[dec(10 * q), "Частка в 10 разів менша. Переносимо кому <b>в обох</b> числах: " + A / 10 + " : " + y2 + "."], [dec(q * 10), "Переносимо кому <b>в обох</b> числах: " + A / 10 + " : " + y2 + " = " + q + "."]], String(q)); }
    return num(p + " = ___", dec(r), h, e, { err: err, chk: { v: js } });
  };
  G.pProp = function () {
    var c = R(2, 12), b, x, a;
    do { b = R(2, 30); a = R(2, 12); x = a * b / c; } while (!Number.isInteger(x) || b === c || x > 60 || a === c);
    var left = Math.random() < 0.5;
    var p = left ? "x : " + a + " = " + b + " : " + c : a + " : x = " + c + " : " + b;
    var xx = left ? x : a * b / c;
    return num(p + "  →  x = ___", xx,
      ["Основна властивість пропорції: добуток крайніх членів дорівнює добутку середніх.", left ? "x " + X + " " + c + " = " + a + " " + X + " " + b + ", тож x = " + a * b + " : " + c + "." : a + " " + X + " " + b + " = x " + X + " " + c + ", тож x = " + a * b + " : " + c + "."],
      (left ? "x " + X + " " + c + " = " + a + " " + X + " " + b : a + " " + X + " " + b + " = x " + X + " " + c) + ", x = " + a * b + " : " + c + " = <b>" + xx + "</b>.",
      { task: "Знайди невідомий член пропорції", chk: { eq: left ? "x/" + a : a + "/x", r: left ? b + "/" + c : c + "/" + b } });
  };
  G.pPct = function () {
    var t = pick(["of", "whole", "what"]), P = pick([5, 10, 15, 20, 25, 30, 40, 50, 60, 75]), N, r, p, h, e, js;
    if (t === "of") { do { N = R(2, 60) * 10; r = N * P / 100; } while (!Number.isInteger(r));
      p = P + "% від числа " + N + " = ___"; js = N + "*" + P + "/100";
      h = ["1% — це сота частина: " + N + " : 100 = " + dec(N) + ".", P + "% — це " + P + " таких частин: " + dec(N) + " " + X + " " + P + "."];
      e = N + " " + X + " " + P + " : 100 = <b>" + r + "</b>.";
      return num(p, r, h, e, { task: "Знайди відсотки від числа", err: errs([[N * 100 / P, "Це ти знайшла число за його відсотками. Тут треба частину від " + N + ": " + N + " " + X + " " + P + " : 100."]], r), chk: { v: js } }); }
    if (t === "whole") { do { N = R(2, 40) * 10; r = N * P / 100; } while (!Number.isInteger(r));
      p = P + "% числа дорівнюють " + r + ". Число = ___"; js = r + "*100/" + P;
      h = ["Якщо " + P + "% — це " + r + ", то 1% — це " + r + " : " + P + ".", "А 100% — у 100 разів більше: " + r + " : " + P + " " + X + " 100."];
      e = r + " : " + P + " " + X + " 100 = <b>" + N + "</b>.";
      var w = r * P / 100;
      return num(p, N, h, e, { task: "Знайди число за його відсотками", err: Number.isInteger(w) ? errs([[w, "Це " + P + "% від " + r + ". А тут " + r + " — це вже " + P + "% шуканого числа: " + r + " : " + P + " " + X + " 100."]], N) : {}, chk: { v: js } }); }
    do { N = R(2, 40) * 4; r = N * P / 100; } while (!Number.isInteger(r));
    p = "Скільки відсотків становить " + r + " від " + N + "? ___ %"; js = r + "/" + N + "*100";
    h = ["Яку частину " + N + " становить " + r + "? Це дріб " + r + "/" + N + ".", "Помнож цей дріб на 100%: " + r + " : " + N + " " + X + " 100."];
    e = r + " : " + N + " " + X + " 100 = <b>" + P + "</b>%.";
    return num(p, P, h, e, { task: "Знайди відсоткове відношення", chk: { v: js } });
  };

  /* =================== від'ємні числа =================== */
  G.nAdd = function () {
    var a, b; do { a = RNZ(-20, 20); b = RNZ(-20, 20); } while (a > 0 && b > 0);
    var r = a + b, same = (a < 0) === (b < 0);
    return num(sn(a) + " + " + pn(b) + " = ___", sn(r),
      same ? ["Обидва числа від'ємні — додай їхні модулі й постав мінус.", Math.abs(a) + " + " + Math.abs(b) + " = " + (Math.abs(a) + Math.abs(b)) + ", знак «" + M + "»."]
           : ["Знаки різні — від більшого модуля відніми менший.", "Знак — як у числа з більшим модулем: " + (Math.abs(a) > Math.abs(b) ? sn(a) : sn(b)) + "."],
      sn(a) + " + " + pn(b) + " = <b>" + sn(r) + "</b>. " + (same ? "Однакові знаки: модулі додаємо, знак зберігаємо." : "Різні знаки: модулі віднімаємо, знак — як у більшого за модулем."),
      { err: errs(same ? [[sn(-r), "Обидва числа від'ємні — сума теж від'ємна."]] : [[sn(-r), "Перевір знак: результат має знак числа з більшим модулем."], [sn((Math.abs(a) > Math.abs(b) ? (a < 0 ? -1 : 1) : (b < 0 ? -1 : 1)) * (Math.abs(a) + Math.abs(b))), "Числа з різними знаками не додаємо модулями — від більшого модуля віднімаємо менший."]], sn(r)), chk: { v: a + "+(" + b + ")" } });
  };
  G.nSub = function () {
    var a = RNZ(-15, 15), b = RNZ(-15, 15), r = a - b;
    if (Math.random() < 0.4 && b > 0) b = -b, r = a - b;
    return num(sn(a) + " " + M + " " + pn(b) + " = ___", sn(r),
      ["Відняти число — те саме, що додати протилежне: " + sn(a) + " " + M + " " + pn(b) + " = " + sn(a) + " + " + pn(-b) + ".", "Тепер додай: " + sn(a) + " + " + pn(-b) + " = ?"],
      sn(a) + " " + M + " " + pn(b) + " = " + sn(a) + " + " + pn(-b) + " = <b>" + sn(r) + "</b>.",
      { err: errs([[sn(a + b), b < 0 ? "Мінус на мінус: " + M + " " + pn(b) + " = + " + (-b) + "." : "Віднімаємо, а не додаємо: " + sn(a) + " + " + pn(-b) + "."], [sn(-r), "Перевір знак результату."]], sn(r)), chk: { v: a + "-(" + b + ")" } });
  };
  G.nMul = function () {
    var a = RNZ(-12, 12), b = RNZ(-12, 12), div = Math.random() < 0.45;
    if (a > 0 && b > 0) { if (Math.random() < 0.5) a = -a; else b = -b; }
    if (Math.abs(a) === 1) a = a * R(2, 9);
    var p, r;
    if (div) { var prod = a * b; p = sn(prod) + " : " + pn(b); r = a; }
    else { p = sn(a) + " " + X + " " + pn(b); r = a * b; }
    var neg = r < 0;
    return num(p + " = ___", sn(r),
      ["Спершу визнач знак: однакові знаки → «+», різні → «" + M + "».", "Тепер обчисли без знаків, а потім постав знак " + (neg ? "«" + M + "»" : "«+»") + "."],
      p + " = <b>" + sn(r) + "</b>: " + (neg ? "знаки різні — результат від'ємний." : "знаки однакові — результат додатний."),
      { err: errs([[sn(-r), neg ? "Знаки різні — результат від'ємний." : "Мінус на мінус дає плюс!"]], sn(r)), chk: { v: div ? "(" + a * b + ")/(" + b + ")" : a + "*(" + b + ")" } });
  };

  /* =================== порядок дій, дужки =================== */
  G.oOrd = function () {
    var t = R(1, 4), a, b, c, d, p, js, r;
    for (;;) {
      a = RNZ(-12, 12); b = RNZ(-9, 9); c = RNZ(-9, 9); d = RNZ(-6, 6);
      if (t === 1) { p = sn(a) + " " + M + " " + pn(b) + " " + X + " " + pn(c); js = a + "-(" + b + ")*(" + c + ")"; }
      else if (t === 2) { p = pn(b) + " " + X + " (" + sn(a) + " " + M + " " + pn(c) + ")"; js = "(" + b + ")*(" + a + "-(" + c + "))"; }
      else if (t === 3) { var q = RNZ(-6, 6); a = b * q; p = sn(a) + " : " + pn(b) + " + " + pn(c) + " " + X + " " + pn(d); js = "(" + a + ")/(" + b + ")+(" + c + ")*(" + d + ")"; }
      else { p = "(" + sn(a) + " + " + pn(b) + ") " + X + " " + pn(c) + " " + M + " " + pn(d); js = "(" + a + "+(" + b + "))*(" + c + ")-(" + d + ")"; }
      r = eval(js); if (Math.abs(r) <= 150 && Number.isInteger(r)) break;
    }
    var wrong = null;
    if (t === 1) wrong = (a - b) * c; if (t === 3) wrong = (a / b + c) * d;
    return num(p + " = ___", sn(r),
      ["Порядок: спершу дужки, потім множення й ділення, а потім додавання й віднімання.", t === 1 ? "Спершу " + pn(b) + " " + X + " " + pn(c) + " = " + sn(b * c) + "." : t === 2 ? "Спершу дужки: " + sn(a) + " " + M + " " + pn(c) + " = " + sn(a - c) + "." : t === 3 ? "Спершу ділення і множення: " + sn(a) + " : " + pn(b) + " = " + sn(a / b) + ", " + pn(c) + " " + X + " " + pn(d) + " = " + sn(c * d) + "." : "Спершу дужки: " + sn(a) + " + " + pn(b) + " = " + sn(a + b) + "."],
      p + " = <b>" + sn(r) + "</b>.",
      { err: wrong !== null && wrong !== r ? errs([[sn(wrong), "Множення й ділення виконуємо раніше за додавання й віднімання."]], sn(r)) : {}, chk: { v: js } });
  };
  G.oBr = function () {
    var p = R(2, 9), q = R(1, 9), r = R(1, 15), s1 = pick([1, -1]), s2 = pick([1, -1]);
    if (p === q) q = q % 9 + 1;
    // p·x  −  (q·x  s2 r)   або   p·x + (…)
    var minus = Math.random() < 0.7;
    var inner = [[q, "x"], [s2 * r, ""]], k = minus ? -1 : 1;
    var srcD = polyD([[s1 * p, "x"]]) + (minus ? " " + M + " " : " + ") + "(" + polyD(inner) + ")";
    var srcJ = "(" + s1 * p + ")*x" + (minus ? "-" : "+") + "(" + polyJ(inner) + ")";
    var cx = s1 * p + k * q, c0 = k * s2 * r;
    if (cx === 0) cx = s1 * p + k * q || 1;
    var right = polyD([[s1 * p + k * q, "x"], [c0, ""]]);
    var w1 = polyD([[s1 * p + k * q, "x"], [-c0, ""]]), w2 = polyD([[s1 * p - k * q, "x"], [c0, ""]]), w3 = polyD([[s1 * p - k * q, "x"], [-c0, ""]]);
    return choice("Розкрий дужки і спрости", srcD + " = ___", right, [w1, w2, w3],
      [minus ? "Мінус перед дужками змінює знак <b>кожного</b> доданка в дужках." : "Плюс перед дужками — дужки просто прибираємо.", "Спершу розкрий: " + polyD([[s1 * p, "x"]]) + (minus ? " " + M + " " + polyD([[q, "x"]]) + (s2 > 0 ? " " + M + " " : " + ") + r : " + " + polyD(inner)) + ", потім зведи доданки з x."],
      srcD + " = " + polyD([[s1 * p, "x"]]) + (minus ? " " + M + " " + polyD([[q, "x"]]) + (s2 > 0 ? " " + M + " " : " + ") + r : " + " + polyD(inner)) + " = <b>" + right + "</b>.",
      { chk: { src: srcJ, vars: ["x"] } });
  };

  /* =================== Розділ 1: лінійні рівняння =================== */
  G.eRoot = function () {
    var a = RNZ(-6, 6), x = R(-6, 6), b = RNZ(-12, 12), c = a * x + b, cand = Math.random() < 0.5 ? x : x + pick([-1, 1, 2]);
    var eq = polyD([[a, "x"], [b, ""]]) + " = " + sn(c), ok = a * cand + b === c, val = a * cand + b;
    return choice("Чи є число " + sn(cand) + " коренем рівняння", eq, ok ? "Так" : "Ні", [ok ? "Ні" : "Так"],
      ["Корінь — число, яке перетворює рівняння на правильну рівність.", "Підстав x = " + sn(cand) + " у ліву частину: " + sn(a) + " " + X + " " + pn(cand) + (b < 0 ? " " + M + " " + (-b) : " + " + b) + " = ?"],
      "Підставляємо: " + sn(a) + " " + X + " " + pn(cand) + (b < 0 ? " " + M + " " + (-b) : " + " + b) + " = " + sn(val) + (ok ? " = " + sn(c) + " — рівність правильна, тож <b>так</b>, це корінь." : " ≠ " + sn(c) + " — <b>ні</b>, не корінь."),
      { long: true, chk: { tf: ok } });
  };
  G.eSimple = function () {
    var t = R(1, 4), x = RNZ(-12, 12), a = RNZ(-9, 9), p, h, e, eq, err = {};
    if (t === 1) { var b = x + a; p = "x + " + pn(a) + " = " + sn(b); if (a < 0) p = "x " + M + " " + (-a) + " = " + sn(b);
      h = ["Невідомий доданок = сума " + M + " відомий доданок.", "x = " + sn(b) + " " + M + " " + pn(a) + "."]; e = "x = " + sn(b) + " " + M + " " + pn(a) + " = <b>" + sn(x) + "</b>."; eq = ["x+(" + a + ")", String(b)];
      err = errs([[sn(b + a), "Доданок переносимо в іншу частину з протилежним знаком: x = " + sn(b) + " " + M + " " + pn(a) + "."]], sn(x)); }
    else if (t === 2) { var c = R(-10, 20), b2 = c - x; p = sn(c) + " " + M + " x = " + sn(b2);
      h = ["Невідоме від'ємник = зменшуване " + M + " різниця.", "x = " + sn(c) + " " + M + " " + pn(b2) + "."]; e = "x = " + sn(c) + " " + M + " " + pn(b2) + " = <b>" + sn(x) + "</b>."; eq = [c + "-x", String(b2)];
      err = errs([[sn(-x), "Перевір знак: x = " + sn(c) + " " + M + " " + pn(b2) + "."]], sn(x)); }
    else if (t === 3) { if (Math.abs(a) === 1) a = a * R(2, 9); var b3 = a * x; p = sn(a) + "x = " + sn(b3);
      h = ["Обидві частини поділи на коефіцієнт при x: на " + sn(a) + ".", "x = " + sn(b3) + " : " + pn(a) + "."]; e = "x = " + sn(b3) + " : " + pn(a) + " = <b>" + sn(x) + "</b>."; eq = "(" + a + ")*x";
      eq = [eq, String(b3)]; err = errs([[sn(-x), "Ділимо на " + sn(a) + " разом зі знаком."], [sn(b3 - a), "Тут x <b>помножили</b> на " + sn(a) + ", тож ділимо, а не віднімаємо."]], sn(x)); }
    else { if (Math.abs(a) === 1) a = a * R(2, 6); var b4 = x; x = a * b4; p = "x : " + pn(a) + " = " + sn(b4);
      h = ["Невідоме ділене = частка " + X + " дільник.", "x = " + sn(b4) + " " + X + " " + pn(a) + "."]; e = "x = " + sn(b4) + " " + X + " " + pn(a) + " = <b>" + sn(x) + "</b>."; eq = ["x/(" + a + ")", String(b4)]; }
    return num(p + "  →  x = ___", sn(x), h, e, { task: "Розв'яжи рівняння", err: err, chk: { eq: eq[0], r: eq[1] } });
  };
  G.eLin1 = function () {
    var a, x, b, c;
    do { a = RNZ(-9, 9); x = RNZ(-10, 10); b = RNZ(-20, 20); c = a * x + b; } while (Math.abs(a) === 1);
    var p = polyD([[a, "x"], [b, ""]]) + " = " + sn(c), w = (c + b) / a;
    return num(p + "  →  x = ___", sn(x),
      ["Перенеси " + sn(b) + " у праву частину, змінивши знак: " + sn(a) + "x = " + sn(c) + (b < 0 ? " + " + (-b) : " " + M + " " + b) + ".", sn(a) + "x = " + sn(c - b) + ". Тепер поділи на " + sn(a) + "."],
      sn(a) + "x = " + sn(c) + (b < 0 ? " + " + (-b) : " " + M + " " + b) + " = " + sn(c - b) + "; x = " + sn(c - b) + " : " + pn(a) + " = <b>" + sn(x) + "</b>.",
      { task: "Розв'яжи рівняння", err: Number.isInteger(w) ? errs([[sn(w), "Переносячи доданок в іншу частину, змінюй його знак: " + sn(b) + " → " + sn(-b) + "."], [sn(-x), "Ділимо на " + sn(a) + " разом зі знаком."]], sn(x)) : errs([[sn(-x), "Ділимо на " + sn(a) + " разом зі знаком."]], sn(x)),
        chk: { eq: polyJ([[a, "x"], [b, ""]]), r: String(c) } });
  };
  G.eLin2 = function () {
    var a, c, x, b, d;
    do { a = RNZ(-9, 9); c = RNZ(-9, 9); x = RNZ(-9, 9); b = RNZ(-15, 15); d = a * x + b - c * x; } while (a === c || Math.abs(d) > 40);
    var L = polyD([[a, "x"], [b, ""]]), Rr = polyD([[c, "x"], [d, ""]]), k = a - c, m = d - b;
    return num(L + " = " + Rr + "  →  x = ___", sn(x),
      ["Доданки з x — вліво, числа — вправо. Переносячи, змінюй знак.", polyD([[a, "x"]]) + (c < 0 ? " + " + polyD([[-c, "x"]]) : " " + M + " " + polyD([[c, "x"]])) + " = " + sn(d) + (b < 0 ? " + " + (-b) : " " + M + " " + b) + ", тобто " + polyD([[k, "x"]]) + " = " + sn(m) + "."],
      polyD([[k, "x"]]) + " = " + sn(m) + "; x = " + sn(m) + " : " + pn(k) + " = <b>" + sn(x) + "</b>.",
      { task: "Розв'яжи рівняння", err: errs([[sn(-x), "Перевір знаки, коли переносиш доданки: в іншій частині знак змінюється."]], sn(x)),
        chk: { eq: polyJ([[a, "x"], [b, ""]]), r: polyJ([[c, "x"], [d, ""]]) } });
  };
  G.eBr = function () {
    var k, m, c, x, d, t = Math.random() < 0.5 ? 1 : 2, L, Rr, Lj, Rj, open, kk, mm;
    for (;;) {
      k = RNZ(-6, 6); m = RNZ(-9, 9); x = RNZ(-8, 8);
      if (Math.abs(k) === 1 && t === 1) continue;
      if (t === 1) { c = RNZ(-6, 6); if (c === k) continue; d = k * (x + m) - c * x; if (Math.abs(d) > 50) continue;
        L = sn(k) + "(" + polyD([[1, "x"], [m, ""]]) + ")"; Rr = polyD([[c, "x"], [d, ""]]); Lj = "(" + k + ")*(x+(" + m + "))"; Rj = polyJ([[c, "x"], [d, ""]]);
        open = polyD([[k, "x"], [k * m, ""]]); kk = k - c; mm = d - k * m; }
      else { var n = R(2, 20); c = RNZ(-12, 12); // n − (x + m) = c
        x = n - m - c; if (x === 0 || Math.abs(x) > 25) continue;
        L = n + " " + M + " (" + polyD([[1, "x"], [m, ""]]) + ")"; Rr = sn(c); Lj = n + "-(x+(" + m + "))"; Rj = String(c);
        open = polyD([[n, ""], [-1, "x"], [-m, ""]]); kk = -1; mm = c - n + m; }
      break;
    }
    return num(L + " = " + Rr + "  →  x = ___", sn(x),
      [t === 1 ? "Спершу розкрий дужки: кожен доданок у дужках помнож на " + sn(k) + "." : "Мінус перед дужками змінює знаки всіх доданків у дужках.", "Після розкриття: " + open + " = " + Rr + ". Далі — як звичайне лінійне рівняння."],
      open + " = " + Rr + " → " + polyD([[kk, "x"]]) + " = " + sn(mm) + " → x = <b>" + sn(x) + "</b>.",
      { task: "Розв'яжи рівняння", chk: { eq: Lj, r: Rj } });
  };
  G.eSpec = function () {
    var kind = pick(["one", "none", "inf"]), a = RNZ(-6, 6), b = RNZ(-9, 9), t = RNZ(-9, 9), c;
    if (Math.abs(a) === 1) a = a * 2;
    var L = sn(a) + "(" + polyD([[1, "x"], [b, ""]]) + ")", Rr, Rj;
    if (kind === "one") { do { c = RNZ(-6, 6); } while (c === a); Rr = polyD([[c, "x"], [R(-15, 15), ""]]); }
    else if (kind === "none") Rr = Math.random() < 0.5 ? polyD([[a, "x"], [a * b + t, ""]]) : polyD([[a * b + t, ""], [a, "x"]]);
    else Rr = Math.random() < 0.5 ? polyD([[a, "x"], [a * b, ""]]) : polyD([[a * b, ""], [a, "x"]]);
    Rj = Rr.replace(/−/g, "-").replace(/(\d)x/g, "$1*x");
    var right = { one: "Один корінь", none: "Жодного кореня", inf: "Безліч коренів" }[kind];
    var open = polyD([[a, "x"], [a * b, ""]]);
    return choice("Скільки коренів має рівняння", L + " = " + Rr, right, ["Один корінь", "Жодного кореня", "Безліч коренів"],
      ["Розкрий дужки: " + L + " = " + open + ". Порівняй з правою частиною.", "Якщо доданки з x скорочуються: вийшло 0 = 0 → безліч коренів; 0 = число (не 0) → жодного."],
      L + " = " + open + ". " + (kind === "one" ? "Коефіцієнти при x різні — рівняння має <b>один корінь</b>." : kind === "none" ? "Доданки з x знищуються, лишається 0 = " + sn(t) + " — неправильна рівність, <b>жодного кореня</b>." : "Ліва і права частини однакові: 0 = 0 при будь-якому x — <b>безліч коренів</b>."),
      { long: true, chk: { spec: ["(" + a + ")*(x+(" + b + "))", Rj], kind: kind } });
  };
  /* задачі: модель (вибір рівняння) і розв'язання */
  var NAMES = [["Оля", "Олі"], ["Марта", "Марти"], ["Софія", "Софії"], ["Даринка", "Даринки"], ["Ліза", "Лізи"]];
  function pl(n, f) { var u = n % 10, t = n % 100; return t >= 11 && t <= 14 ? f[2] : u === 1 ? f[0] : u >= 2 && u <= 4 ? f[1] : f[2]; }
  function raz(k) { return k < 5 ? "рази" : "разів"; }
  function rokiv(m) { var u = m % 10, t = m % 100; return t >= 11 && t <= 14 ? "років" : u === 1 ? "рік" : u >= 2 && u <= 4 ? "роки" : "років"; }
  function wordTask() {
    var t = R(1, 6), x, k, m, N, txt, eqD, eqJ, rJ, ask, ans, how, wrong, opts;
    if (t === 1) { k = R(2, 5); x = R(4, 25); N = x * (k + 1); var it1 = pick([["кошиках", ["яблуко", "яблука", "яблук"], "У першому кошику"], ["полицях", ["книжка", "книжки", "книжок"], "На першій полиці"], ["класах", ["учень", "учні", "учнів"], "У першому класі"]]);
      if (it1[2] === "У першому класі") { x = R(6, 12); k = 2; N = x * 3; }
      txt = "У двох " + it1[0] + " разом " + N + " " + pl(N, it1[1]) + ". " + it1[2] + " в " + k + " " + raz(k) + " більше, ніж у другому. Скільки " + it1[1][2] + " у другому?";
      eqD = "x + " + k + "x = " + N; eqJ = "x+" + k + "*x"; rJ = String(N); ans = x; how = "Нехай x — у другому, тоді в першому " + k + "x.";
      opts = [eqD, k + "x = " + N, "x + (x + " + k + ") = " + N, "x " + X + " " + k + " = " + N + " + x"]; }
    else if (t === 2) { m = R(3, 20); x = R(5, 40); N = 2 * x + m; var it2 = pick([["марка", "марки", "марок"], ["наліпка", "наліпки", "наліпок"], ["листівка", "листівки", "листівок"]]), nn = pick(NAMES), nm = nn[0];
      txt = nm + " і Андрій мають разом " + N + " " + pl(N, it2) + ". У " + nn[1] + " на " + m + " " + pl(m, it2) + " більше, ніж в Андрія. Скільки " + it2[2] + " в Андрія?";
      eqD = "x + (x + " + m + ") = " + N; eqJ = "x+(x+" + m + ")"; rJ = String(N); ans = x; how = "Нехай x — в Андрія, тоді в " + nn[1] + " x + " + m + ".";
      opts = [eqD, "x + (x " + M + " " + m + ") = " + N, "x + " + m + "x = " + N, "x + " + m + " = " + N]; }
    else if (t === 3) { m = R(22, 32); x = R(8, 16); N = 2 * x + m;
      txt = "Мама старша за доньку на " + m + " " + rokiv(m) + ". Разом їм " + N + " " + rokiv(N) + ". Скільки років доньці?";
      eqD = "x + (x + " + m + ") = " + N; eqJ = "x+(x+" + m + ")"; rJ = String(N); ans = x; how = "Нехай доньці x років, тоді мамі x + " + m + ".";
      opts = [eqD, "x + " + m + " = " + N, "x + (x " + M + " " + m + ") = " + N, m + "x = " + N]; }
    else if (t === 4) { do { x = R(-5, 40); } while (x === 1); N = 3 * x + 3;
      txt = "Сума трьох послідовних цілих чисел дорівнює " + sn(N) + ". Знайди найменше з них.";
      eqD = "x + (x + 1) + (x + 2) = " + sn(N); eqJ = "x+(x+1)+(x+2)"; rJ = String(N); ans = x; how = "Нехай найменше число x, тоді наступні x + 1 і x + 2.";
      opts = [eqD, "x + 2x + 3x = " + sn(N), "3x = " + sn(N), "x + (x + 2) + (x + 4) = " + sn(N)]; }
    else if (t === 5) { k = R(2, 6); m = R(2, 20); x = R(2, 15); N = k * x - m;
      txt = "Задумали число, помножили його на " + k + " і відняли " + m + ". Вийшло " + sn(N) + ". Яке число задумали?";
      eqD = k + "x " + M + " " + m + " = " + sn(N); eqJ = k + "*x-" + m; rJ = String(N); ans = x; how = "Нехай задумане число x.";
      opts = [eqD, k + "(x " + M + " " + m + ") = " + sn(N), k + "x + " + m + " = " + sn(N), "x " + M + " " + m + " " + X + " " + k + " = " + sn(N)]; }
    else { k = R(2, 4); m = R(2, 12); x = R(3, 15); N = k * x + m; // одна сторона в k разів більша і ще…: периметр
      var P = 2 * (x + k * x); txt = "Довжина прямокутника в " + k + " " + raz(k) + " більша за ширину, а периметр — " + P + " см. Знайди ширину.";
      eqD = "2(x + " + k + "x) = " + P; eqJ = "2*(x+" + k + "*x)"; rJ = String(P); ans = x; how = "Нехай ширина x см, тоді довжина " + k + "x см.";
      opts = [eqD, "x + " + k + "x = " + P, "2(x + " + k + ") = " + P, "x + " + 2 * k + "x = " + P]; }
    return { txt: txt, eqD: eqD, eqJ: eqJ, rJ: rJ, ans: ans, how: how, opts: opts };
  }
  function eqJ(s) { return s.replace(/−/g, "-").replace(/·/g, "*").replace(/(\d)x/g, "$1*x").replace(/(\d)\(/g, "$1*(").replace(/\)\(/g, ")*("); }
  G.eModel = function () {
    var w = wordTask();
    return choice("Яке рівняння відповідає задачі", w.txt, w.eqD, w.opts.slice(1),
      ["Познач невідоме буквою x. " + w.how, "Склади вирази для всіх величин через x і запиши, чому дорівнює їхня сума (або результат)."],
      w.how + " Рівняння: <b>" + w.eqD + "</b>.",
      { long: true, chk: { model: w.opts.map(function (o) { var s = o.split(" = "); return [eqJ(s[0]), eqJ(s[1])]; }), root: w.ans } });
  };
  G.eWord = function () {
    var w = wordTask();
    var v = w.eqD.split(" = ");
    return num(w.txt, sn(w.ans),
      [w.how, "Рівняння: " + w.eqD + ". Розв'яжи його."],
      w.how + " " + w.eqD + " → x = <b>" + sn(w.ans) + "</b>.",
      { task: "Розв'яжи задачу за допомогою рівняння", long: true, chk: { eq: eqJ(v[0]), r: eqJ(v[1]) } });
  };

  /* =================== Розділ 2: вирази, степені, одночлени =================== */
  G.xVal = function () {
    var t = Math.random() < 0.5 ? 1 : 2, p, js, r, h, e, err = {};
    if (t === 1) { var a = RNZ(-6, 6), b = RNZ(-6, 6), P = RNZ(-7, 7), Q = RNZ(-7, 7);
      var ex = polyD([[P, "a"], [Q, "b"]]); js = P + "*(" + a + ")+(" + Q + ")*(" + b + ")"; r = eval(js);
      p = ex + ", якщо a = " + sn(a) + ", b = " + sn(b) + "  →  ___";
      h = ["Підстав числа замість букв. Від'ємні числа бери в дужки.", sn(P) + " " + X + " " + pn(a) + (Q < 0 ? " " + M + " " + (-Q) : " + " + Q) + " " + X + " " + pn(b) + " = ?"];
      e = sn(P) + " " + X + " " + pn(a) + (Q < 0 ? " " + M + " " + (-Q) : " + " + Q) + " " + X + " " + pn(b) + " = " + sn(P * a) + (Q * b < 0 ? " " + M + " " + (-Q * b) : " + " + Q * b) + " = <b>" + sn(r) + "</b>."; }
    else { var x = RNZ(-5, 5), P2 = RNZ(-6, 6), Q2 = R(-10, 10), sq = Math.random() < 0.5 ? 1 : 2;
      var ex2 = polyD([[sq, "x²"], [P2, "x"], [Q2, ""]]); js = sq + "*(" + x + ")**2+(" + P2 + ")*(" + x + ")+(" + Q2 + ")"; r = eval(js);
      p = ex2 + ", якщо x = " + sn(x) + "  →  ___";
      h = ["Спершу степінь: " + pn(x) + "² = " + x * x + "." + (x < 0 ? " Квадрат від'ємного числа — додатний." : ""), (sq === 1 ? "" : sq + " " + X + " ") + x * x + (P2 < 0 ? " " + M + " " + (-P2) : " + " + P2) + " " + X + " " + pn(x) + (Q2 < 0 ? " " + M + " " + (-Q2) : " + " + Q2) + " = ?"];
      e = (sq === 1 ? "" : sq + " " + X + " ") + pn(x) + "²" + (P2 < 0 ? " " + M + " " + (-P2) : " + " + P2) + " " + X + " " + pn(x) + (Q2 < 0 ? " " + M + " " + (-Q2) : " + " + Q2) + " = " + (sq === 1 ? "" : sq + " " + X + " ") + x * x + (P2 * x < 0 ? " " + M + " " + (-P2 * x) : " + " + P2 * x) + (Q2 < 0 ? " " + M + " " + (-Q2) : " + " + Q2) + " = <b>" + sn(r) + "</b>.";
      if (x < 0) err = errs([[sn(r - 2 * sq * x * x), pn(x) + "² = " + x * x + " — квадрат від'ємного числа додатний."]], sn(r)); }
    return num(p, sn(r), h, e, { task: "Знайди значення виразу", err: err, chk: { v: js } });
  };
  G.xLike = function () {
    var withC = Math.random() < 0.4, c1, c2, c3, c4, v2 = withC ? "" : "b";
    do { c1 = RNZ(-9, 9); c2 = RNZ(-9, 9); c3 = RNZ(-9, 9); c4 = RNZ(-9, 9); } while (c1 + c3 === 0 || c2 + c4 === 0 || c1 === -c3 || Math.abs(c3) === Math.abs(c1));
    var V = withC ? "x" : "a";
    var terms = Math.random() < 0.5 ? [[c1, V], [c2, v2], [c3, V], [c4, v2]] : [[c1, V], [c2, v2], [c4, v2], [c3, V]];
    var src = polyD(terms), right = polyD([[c1 + c3, V], [c2 + c4, v2]]);
    var w = [polyD([[c1 - c3, V], [c2 + c4, v2]]), polyD([[c1 + c3, V], [c2 - c4, v2]]), polyD([[c1 + c3, V], [-(c2 + c4), v2]]), polyD([[-(c1 + c3), V], [c2 + c4, v2]])];
    return choice("Зведи подібні доданки", src + " = ___", right, w,
      ["Подібні доданки — з однаковою буквеною частиною: окремо всі з «" + V + "», окремо " + (withC ? "числа" : "всі з «b»") + ".", "Знак перед доданком належить йому: " + polyD([[c1, V]]) + " і " + polyD([[c3, V]]) + " → " + sn(c1) + (c3 < 0 ? " " + M + " " + (-c3) : " + " + c3) + " = " + sn(c1 + c3) + "."],
      "З «" + V + "»: " + sn(c1) + (c3 < 0 ? " " + M + " " + (-c3) : " + " + c3) + " = " + sn(c1 + c3) + "; " + (withC ? "числа" : "з «b»") + ": " + sn(c2) + (c4 < 0 ? " " + M + " " + (-c4) : " + " + c4) + " = " + sn(c2 + c4) + ". Разом: <b>" + right + "</b>.",
      { chk: { src: polyJ(terms), vars: ["a", "b", "x"] } });
  };
  G.xDist = function () {
    var k = RNZ(-6, 6), a = RNZ(-7, 7), b = RNZ(-9, 9), V = pick(["x", "a", "y"]);
    if (k === 1) k = -1;
    var src = (k === -1 ? M : sn(k)) + "(" + polyD([[a, V], [b, ""]]) + ")", srcJ = "(" + k + ")*(" + polyJ([[a, V], [b, ""]]) + ")";
    var right = polyD([[k * a, V], [k * b, ""]]);
    var w = [polyD([[k * a, V], [b, ""]]), polyD([[k * a, V], [-k * b, ""]]), polyD([[-k * a, V], [k * b, ""]]), polyD([[k + a, V], [k * b, ""]])];
    return choice("Розкрий дужки", src + " = ___", right, w,
      ["Множник перед дужками множимо на <b>кожен</b> доданок у дужках.", sn(k) + " " + X + " " + (a < 0 ? "(" + polyD([[a, V]]) + ")" : polyD([[a, V]])) + " = " + polyD([[k * a, V]]) + ", а " + sn(k) + " " + X + " " + pn(b) + " = ?"],
      src + " = " + sn(k) + " " + X + " " + (a < 0 ? "(" + polyD([[a, V]]) + ")" : polyD([[a, V]])) + " + " + pn(k) + " " + X + " " + pn(b) + " = <b>" + right + "</b>.",
      { chk: { src: srcJ, vars: [V] } });
  };
  G.pwVal = function () {
    var t = pick(["neg", "neg", "minus", "frac", "dec", "one"]), b, n, p, r, h, e, err = {}, js;
    if (t === "neg") { b = R(2, 5); n = R(2, b === 2 ? 7 : b === 3 ? 4 : 3); r = Math.pow(-b, n); p = "(" + M + b + ")" + sup(n); js = "(-" + b + ")**" + n;
      h = ["Степінь — це множення однакових множників: (" + M + b + ")" + sup(n) + " = " + Array(n + 1).join("(" + M + b + ") " + X + " ").slice(0, -3) + ".", "Від'ємне число в " + (n % 2 ? "непарному" : "парному") + " степені — " + (n % 2 ? "від'ємне" : "додатне") + "."];
      e = "(" + M + b + ")" + sup(n) + " = <b>" + sn(r) + "</b>: показник " + (n % 2 ? "непарний — знак «" + M + "»." : "парний — знак «+».");
      err = errs([[sn(-r), "Знак: від'ємне число в парному степені — додатне, у непарному — від'ємне."], [sn((n % 2 ? -1 : 1) * b * n), "Степінь — це не множення на показник: " + b + sup(n) + " = " + Array(n + 1).join(b + " " + X + " ").slice(0, -3) + "."]], sn(r)); }
    else if (t === "minus") { b = R(2, 9); n = 2; if (b <= 3 && Math.random() < 0.5) n = 4; r = -Math.pow(b, n); p = M + b + sup(n); js = "-(" + b + "**" + n + ")";
      h = ["Тут мінус стоїть <b>перед</b> степенем, а не в дужках.", "Спершу " + b + sup(n) + " = " + Math.pow(b, n) + ", а потім мінус."];
      e = M + b + sup(n) + " = " + M + "(" + b + sup(n) + ") = <b>" + sn(r) + "</b>. А от (" + M + b + ")" + sup(n) + " було б " + (-r) + ".";
      err = errs([[String(-r), "Без дужок степінь стосується лише " + b + ": " + M + b + sup(n) + " = " + M + "(" + b + sup(n) + ") = " + sn(r) + "."]], sn(r)); }
    else if (t === "frac") { var a = R(1, 4), d = R(a + 1, 7); while (gcd(a, d) !== 1) d++; n = a === 1 || d > 5 ? 2 : pick([2, 3]); r = fr(Math.pow(a, n), Math.pow(d, n)); p = "(" + a + "/" + d + ")" + sup(n); js = "(" + a + "/" + d + ")**" + n;
      h = ["До степеня підносимо і чисельник, і знаменник.", a + sup(n) + " = " + Math.pow(a, n) + ", " + d + sup(n) + " = " + Math.pow(d, n) + "."];
      e = "(" + a + "/" + d + ")" + sup(n) + " = " + a + sup(n) + "/" + d + sup(n) + " = <b>" + r + "</b>.";
      err = errs([[fr(Math.pow(a, n), d), "У степінь підносимо <b>і знаменник</b> теж: " + d + sup(n) + " = " + Math.pow(d, n) + "."], [fr(a * n, d * n), "Степінь — не множення на показник: (" + a + "/" + d + ")" + sup(n) + " = " + Array(n + 1).join(a + "/" + d + " " + X + " ").slice(0, -3) + "."]], r); }
    else if (t === "dec") { var dd = R(1, 9), big = Math.random() < 0.35; n = 2;
      if (big) { var v = R(11, 15); r = dec(v * v); p = dec(v * 10) + "²"; js = "(" + v / 10 + ")**2"; h = ["Порахуй без коми: " + v + "² = " + v * v + ".", "У множниках разом 2 знаки після коми — у відповіді теж 2."]; e = dec(v * 10) + " " + X + " " + dec(v * 10) + " = <b>" + r + "</b>."; }
      else { r = dec(dd * dd); p = "0," + dd + "²"; js = "(" + dd / 10 + ")**2"; h = ["0," + dd + "² = 0," + dd + " " + X + " 0," + dd + ".", dd + " " + X + " " + dd + " = " + dd * dd + ", а знаків після коми має бути 2."]; e = "0," + dd + " " + X + " 0," + dd + " = <b>" + r + "</b> (після коми 1 + 1 = 2 знаки).";
        err = errs([[dec(dd * dd * 10), "Знаків після коми у відповіді стільки, скільки в обох множниках разом: 1 + 1 = 2."], [dec(dd * 20), "Степінь — не множення на 2: 0," + dd + "² = 0," + dd + " " + X + " 0," + dd + "."]], r); } }
    else { n = R(11, 40); r = n % 2 ? -1 : 1; p = "(" + M + "1)" + sup(n); js = "(-1)**" + n;
      h = ["(" + M + "1) " + X + " (" + M + "1) = 1. Кожна пара мінусів дає плюс.", "Показник " + n + " — " + (n % 2 ? "непарний" : "парний") + "."];
      e = "(" + M + "1)" + sup(n) + " = <b>" + sn(r) + "</b>: " + (n % 2 ? "непарний показник — " + M + "1." : "парний показник — 1.");
      err = errs([[sn(-r), "Парний показник → 1, непарний → " + M + "1."]], sn(r)); }
    return num(p + " = ___", typeof r === "number" ? sn(r) : r, h, e, { err: err, chk: { v: js } });
  };
  G.pwProp = function () {
    var t = pick(["mul", "div", "pow", "mix1", "mix2"]), m = R(2, 9), n = R(2, 9), k = R(2, 5), V = pick(["a", "x", "b", "y"]), p, r, h, e, err = {};
    if (t === "mul") { p = V + sup(m) + " " + X + " " + V + sup(n); r = m + n; h = ["При множенні степенів з однаковою основою показники <b>додають</b>.", m + " + " + n + " = ?"]; err = errs([[m * n, "При множенні степенів показники <b>додаються</b>, а не множаться: " + m + " + " + n + "."]], r); }
    else if (t === "div") { n = R(2, 7); m = n + R(1, 6); p = V + sup(m) + " : " + V + sup(n); r = m - n; h = ["При діленні степенів з однаковою основою показники <b>віднімають</b>.", m + " " + M + " " + n + " = ?"]; err = errs([[m % n ? -1 : m / n, "При діленні показники <b>віднімаються</b>, а не діляться: " + m + " " + M + " " + n + "."]], r); }
    else if (t === "pow") { m = R(2, 6); p = "(" + V + sup(m) + ")" + sup(k); r = m * k; h = ["При піднесенні степеня до степеня показники <b>множать</b>.", m + " " + X + " " + k + " = ?"]; err = errs([[m + k, "Степінь у степені: показники <b>множаться</b>: " + m + " " + X + " " + k + "."]], r); }
    else if (t === "mix1") { m = R(2, 5); p = "(" + V + sup(m) + ")" + sup(k) + " " + X + " " + V + sup(n); r = m * k + n; h = ["Спершу (" + V + sup(m) + ")" + sup(k) + " = " + V + sup(m * k) + " — показники множимо.", "Потім " + V + sup(m * k) + " " + X + " " + V + sup(n) + ": показники додаємо."]; }
    else { var s = R(2, 8); n = R(2, 8); var q = R(2, s + n - 1); m = s; p = V + sup(m) + " " + X + " " + V + sup(n) + " : " + V + sup(q); r = m + n - q; h = ["Спершу множення: " + V + sup(m) + " " + X + " " + V + sup(n) + " = " + V + sup(m + n) + ".", "Потім ділення: " + (m + n) + " " + M + " " + q + "."]; }
    return num(p + " = " + V + "ⁿ.  n = ___", r, h, p + " = " + V + "<sup>" + r + "</sup>, тобто n = <b>" + r + "</b>.", { task: "Запиши у вигляді степеня", err: err, chk: { pw: [p, r] } });
  };
  G.pwCalc = function () {
    var b = pick([2, 2, 3, 3, 5, 10]), t = R(1, 3), fin = b === 2 ? R(1, 4) : b === 10 ? R(1, 3) : R(1, 2), p, js, h;
    if (t === 1) { var m = R(5, 12), n = fin + R(2, 8) - 0, q; n = R(2, 8); q = m + n - fin; p = b + sup(m) + " " + X + " " + b + sup(n) + " : " + b + sup(q); js = b + "**" + m + "*" + b + "**" + n + "/" + b + "**" + q;
      h = ["Не рахуй великі степені! Скористайся властивостями: " + b + sup(m) + " " + X + " " + b + sup(n) + " = " + b + sup(m + n) + ".", b + sup(m + n) + " : " + b + sup(q) + " = " + b + sup(fin) + ". Тепер обчисли."]; }
    else if (t === 2) { var m2 = R(fin + 3, 15), q2 = m2 - fin; p = b + sup(m2) + " : " + b + sup(q2); js = b + "**" + m2 + "/" + b + "**" + q2;
      h = ["При діленні показники віднімаємо: " + m2 + " " + M + " " + q2 + " = " + fin + ".", "Лишилось обчислити " + b + sup(fin) + "."]; }
    else { var mm = R(2, 4), kk = R(2, 3), q3 = mm * kk - fin; if (q3 < 1) { kk = 3; q3 = mm * kk - fin; } p = "(" + b + sup(mm) + ")" + sup(kk) + " : " + b + sup(q3); js = "(" + b + "**" + mm + ")**" + kk + "/" + b + "**" + q3;
      h = ["(" + b + sup(mm) + ")" + sup(kk) + " = " + b + sup(mm * kk) + " — показники множимо.", b + sup(mm * kk) + " : " + b + sup(q3) + " = " + b + sup(fin) + "."]; }
    var r = Math.pow(b, fin);
    return num(p + " = ___", r, h, p + " = " + b + (fin > 1 ? "<sup>" + fin + "</sup>" : "") + " = <b>" + r + "</b>.", { task: "Обчисли зручно", chk: { v: js } });
  };
  function randVars() { var o = { a: R(0, 4), b: R(0, 3) }; if (!o.a && !o.b) o.a = R(1, 3); return o; }
  G.mStd = function () {
    var c1 = RNZ(-6, 6), c2 = RNZ(-5, 5), v1 = randVars(), v2 = randVars(), deg = Math.random() < 0.5;
    var src = monoD(c1, v1) + " " + X + " " + (c2 < 0 ? "(" + monoD(c2, v2) + ")" : monoD(c2, v2));
    var ea = v1.a + v2.a, eb = v1.b + v2.b, std = monoD(c1 * c2, { a: ea, b: eb });
    if (deg) return num("Степінь одночлена " + src + " = ___", ea + eb,
      ["Спершу зведи до стандартного вигляду: " + std + ".", "Степінь одночлена — сума показників усіх змінних: " + ea + " + " + eb + "."],
      src + " = " + std + "; степінь " + ea + " + " + eb + " = <b>" + (ea + eb) + "</b>.", { task: "Знайди", err: errs([[Math.abs(c1 * c2), "Це коефіцієнт. Степінь — сума показників букв."]], ea + eb), chk: { v: String(ea + eb) } });
    return num("Коефіцієнт одночлена " + src + " = ___", sn(c1 * c2),
      ["Стандартний вигляд: спершу число (коефіцієнт), потім букви. Числа перемножуємо.", sn(c1) + " " + X + " " + pn(c2) + " = ?"],
      src + " = <b>" + sn(c1 * c2) + "</b>" + std.replace(/^−?\d*/, "") + ". Коефіцієнт — <b>" + sn(c1 * c2) + "</b>.",
      { task: "Знайди", err: errs([[sn(c1 + c2), "Коефіцієнти <b>перемножуємо</b>, а не додаємо."], [sn(-c1 * c2), "Перевір знак добутку."]], sn(c1 * c2)), chk: { v: c1 + "*(" + c2 + ")" } });
  };
  G.mMul = function () {
    var pow = Math.random() < 0.45, right, w, src, srcJ, h, e;
    if (!pow) { var c1 = RNZ(-6, 6), c2 = RNZ(-6, 6), v1 = { a: R(1, 4), b: R(0, 3) }, v2 = { a: R(1, 4), b: R(1, 3) };
      src = "(" + monoD(c1, v1) + ") " + X + " (" + monoD(c2, v2) + ")"; srcJ = monoJ(c1, v1) + "*" + monoJ(c2, v2);
      right = monoD(c1 * c2, { a: v1.a + v2.a, b: v1.b + v2.b });
      w = [monoD(c1 * c2, { a: v1.a * v2.a, b: Math.max(v1.b, 1) * v2.b }), monoD(c1 + c2 || 1, { a: v1.a + v2.a, b: v1.b + v2.b }), monoD(-c1 * c2, { a: v1.a + v2.a, b: v1.b + v2.b }), monoD(c1 * c2, { a: v1.a + v2.a + 1, b: v1.b + v2.b })];
      h = ["Коефіцієнти перемножуємо: " + sn(c1) + " " + X + " " + pn(c2) + " = " + sn(c1 * c2) + ".", "Степені з однаковою основою — показники додаємо: a" + sup(v1.a) + " " + X + " a" + sup(v2.a) + " = a" + sup(v1.a + v2.a) + "."];
      e = "Коефіцієнти: " + sn(c1 * c2) + "; a: " + v1.a + " + " + v2.a + " = " + (v1.a + v2.a) + "; b: " + v1.b + " + " + v2.b + " = " + (v1.b + v2.b) + ". Разом <b>" + right + "</b>."; }
    else { var c = RNZ(-3, 3), n = R(2, 3), v = { a: R(1, 4), b: R(1, 3) }; if (Math.abs(c) === 1 && Math.random() < 0.6) c = c * 2;
      src = "(" + monoD(c, v) + ")" + sup(n); srcJ = "(" + monoJ(c, v) + ")**" + n;
      var cn = Math.pow(c, n); right = monoD(cn, { a: v.a * n, b: v.b * n });
      w = [monoD(cn, { a: v.a + n, b: v.b + n }), monoD(c * n, { a: v.a * n, b: v.b * n }), monoD(-cn, { a: v.a * n, b: v.b * n }), monoD(cn, { a: v.a * n, b: v.b })];
      h = ["До степеня підносимо <b>кожен</b> множник: і коефіцієнт, і кожну букву.", pn(c) + sup(n) + " = " + sn(cn) + "; (a" + sup(v.a) + ")" + sup(n) + " = a" + sup(v.a * n) + " — показники множимо."];
      e = pn(c) + sup(n) + " = " + sn(cn) + "; показники: " + v.a + " " + X + " " + n + " = " + v.a * n + ", " + v.b + " " + X + " " + n + " = " + v.b * n + ". Разом <b>" + right + "</b>."; }
    return choice(pow ? "Піднеси одночлен до степеня" : "Перемнож одночлени", src + " = ___", right, w, h, e, { chk: { src: srcJ, vars: ["a", "b"] } });
  };
})();
