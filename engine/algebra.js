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
    var it = { type: "num", kb: "alg", task: "Обчисли", p: p.replace(" = ___", "\u00a0=\u00a0___"), a: String(a), h: h, e: e };
    for (var k in extra || {}) it[k] = extra[k];
    return it;
  }
  function choice(task, p, right, wrong, h, e, extra) {
    var o = [right], seen = {}; seen[right] = 1;
    wrong.forEach(function (w) { if (!seen[w] && o.length < 4) { seen[w] = 1; o.push(w); } });
    var it = { type: "choice", task: task, p: p.replace(" = ___", "\u00a0=\u00a0___"), o: shuffle(o), a: right, h: h, e: e };
    if (seen["Так"] && seen["Ні"] && o.length === 2) it.o = ["Так", "Ні"];
    if (seen["Один корінь"]) it.o = ["Один корінь", "Жодного кореня", "Безліч коренів"];
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
      div ? ["Ділення на дріб — це множення на перевернутий дріб: " + c + "/" + d + " → " + fr(d, c) + ".", a + "/" + b + " " + X + " " + d + "/" + c + " = (" + a + " " + X + " " + d + ")/(" + b + " " + X + " " + c + "). Не забудь скоротити."]
          : ["Чисельник множимо на чисельник, знаменник — на знаменник.", "(" + a + " " + X + " " + c + ")/(" + b + " " + X + " " + d + ") = " + a * c + "/" + b * d + ". Скороти, якщо можна."],
      div ? a + "/" + b + " : " + c + "/" + d + " = " + a + "/" + b + " " + X + " " + fr(d, c) + (a * d + "/" + b * c !== r ? " = " + a * d + "/" + b * c : "") + " = <b>" + r + "</b>."
          : a + "/" + b + " " + X + " " + c + "/" + d + (a * c + "/" + b * d !== r ? " = " + a * c + "/" + b * d : "") + " = <b>" + r + "</b>.",
      { chk: { v: "(" + a + "/" + b + ")" + (div ? "/" : "*") + "(" + c + "/" + d + ")" } });
    if (div) it.err = errs([[fr(a * c, b * d), "Це ти перемножила дроби. При <b>діленні</b> другий дріб перевертаємо: " + c + "/" + d + " → " + fr(d, c) + "."]], r);
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
      err = errs([[dec(q * 1000), "Кому перенесено лише в діленому. Переносимо <b>в обох</b> числах: " + A / 10 + " : " + y2 + "."], [dec(q * 10), "Кому перенесено лише в дільнику. Переносимо <b>в обох</b> числах: " + A / 10 + " : " + y2 + "."]], String(q)); }
    return num(p + " = ___", dec(r), h, e, { err: err, chk: { v: js } });
  };
  G.pProp = function () {
    var c = R(2, 12), b, x, a;
    do { b = R(2, 30); a = R(2, 12); x = a * b / c; } while (!Number.isInteger(x) || b === c || x > 60 || a === c);
    var left = Math.random() < 0.5;
    var p = left ? "x : " + a + " = " + b + " : " + c : a + " : x = " + c + " : " + b;
    var xx = left ? x : a * b / c;
    return num(p + "\nx = ___", xx,
      ["Основна властивість пропорції: добуток крайніх членів дорівнює добутку середніх.", left ? "x " + X + " " + c + " = " + a + " " + X + " " + b + ", тож x = " + a * b + " : " + c + "." : a + " " + X + " " + b + " = x " + X + " " + c + ", тож x = " + a * b + " : " + c + "."],
      (left ? "x " + X + " " + c + " = " + a + " " + X + " " + b : a + " " + X + " " + b + " = x " + X + " " + c) + ", x = " + a * b + " : " + c + " = <b>" + xx + "</b>.",
      { task: "Знайди невідомий член пропорції", chk: { eq: "x/" + a, r: left ? b + "/" + c : b + "/" + c } });
  };
  G.pPct = function () {
    var t = pick(["of", "whole", "what"]), P = pick([5, 10, 15, 20, 25, 30, 40, 50, 60, 75]), N, r, p, h, e, js;
    if (t === "of") { do { N = R(2, 60) * 10; r = N * P / 100; } while (!Number.isInteger(r));
      p = P + "% від числа " + N + " = ___"; js = N + "*" + P + "/100";
      h = ["1% — це сота частина: " + N + " : 100 = " + dec(N) + ".", P + "% — це " + P + " таких частин: " + dec(N) + " " + X + " " + P + "."];
      e = N + " " + X + " " + P + " : 100 = <b>" + r + "</b>.";
      return num(p, r, h, e, { task: "Знайди відсотки від числа", err: errs(Number.isInteger(N * 100 / P) ? [[N * 100 / P, "Це ти знайшла число за його відсотками. Тут треба частину від " + N + ": " + N + " " + X + " " + P + " : 100."]] : [], r), chk: { v: js } }); }
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
    if (Math.random() < 0.25) { // −2/3 + 1/2
      var b1, d1, a1, c1, L1, n1;
      do { b1 = R(2, 9); d1 = R(2, 9); a1 = R(1, b1 - 1); c1 = R(1, d1 - 1); L1 = lcm(b1, d1); n1 = -a1 * L1 / b1 + c1 * L1 / d1; } while (b1 === d1 || gcd(a1, b1) !== 1 || gcd(c1, d1) !== 1 || n1 === 0 || L1 > 36);
      var rr = fr(n1, L1);
      return num(M + a1 + "/" + b1 + " + " + c1 + "/" + d1 + " = ___", rr,
        ["Спільний знаменник " + L1 + ": " + M + a1 * L1 / b1 + "/" + L1 + " + " + c1 * L1 / d1 + "/" + L1 + ".", "Тепер чисельники: " + M + a1 * L1 / b1 + " + " + c1 * L1 / d1 + " = " + sn(n1) + "."],
        M + a1 + "/" + b1 + " + " + c1 + "/" + d1 + " = " + M + a1 * L1 / b1 + "/" + L1 + " + " + c1 * L1 / d1 + "/" + L1 + " = <b>" + rr + "</b>.",
        { err: errs([[fr(-n1, L1), "Перевір знак: знак суми — як у дробу з більшим модулем."]], rr), chk: { v: "-" + a1 + "/" + b1 + "+" + c1 + "/" + d1 } });
    }
    var a, b; do { a = RNZ(-20, 20); b = RNZ(-20, 20); } while (a > 0 && b > 0);
    var r = a + b, same = (a < 0) === (b < 0);
    return num(sn(a) + " + " + pn(b) + " = ___", sn(r),
      same ? ["Обидва числа від'ємні — додай їхні модулі й постав мінус.", Math.abs(a) + " + " + Math.abs(b) + " = " + (Math.abs(a) + Math.abs(b)) + ", знак «" + M + "»."]
           : ["Знаки різні — від більшого модуля відніми менший.", "Знак — як у числа з більшим модулем: " + (Math.abs(a) > Math.abs(b) ? sn(a) : sn(b)) + "."],
      sn(a) + " + " + pn(b) + " = <b>" + sn(r) + "</b>. " + (same ? "Однакові знаки: модулі додаємо, знак зберігаємо." : "Різні знаки: модулі віднімаємо, знак — як у більшого за модулем."),
      { err: errs(same ? [[sn(-r), "Обидва числа від'ємні — сума теж від'ємна."]] : [[sn(-r), "Перевір знак: результат має знак числа з більшим модулем."], [sn((Math.abs(a) > Math.abs(b) ? (a < 0 ? -1 : 1) : (b < 0 ? -1 : 1)) * (Math.abs(a) + Math.abs(b))), "Числа з різними знаками не додаємо модулями — від більшого модуля віднімаємо менший."]], sn(r)), chk: { v: a + "+(" + b + ")" } });
  };
  G.nSub = function () {
    var a, b, r;
    do { a = RNZ(-15, 15); b = RNZ(-15, 15); if (Math.random() < 0.4 && b > 0) b = -b; } while (a > 0 && b > 0 && a >= b);
    r = a - b;
    return num(sn(a) + " " + M + " " + pn(b) + " = ___", sn(r),
      ["Відняти число — те саме, що додати протилежне: " + sn(a) + " " + M + " " + pn(b) + " = " + sn(a) + " + " + pn(-b) + ".", "Тепер додай: " + sn(a) + " + " + pn(-b) + " = ?"],
      sn(a) + " " + M + " " + pn(b) + " = " + sn(a) + " + " + pn(-b) + " = <b>" + sn(r) + "</b>.",
      { err: errs([[sn(a + b), b < 0 ? "Мінус на мінус: " + M + " " + pn(b) + " = + " + (-b) + "." : "Віднімаємо, а не додаємо: " + sn(a) + " + " + pn(-b) + "."], [sn(-r), "Перевір знак результату."]], sn(r)), chk: { v: a + "-(" + b + ")" } });
  };
  G.nMul = function () {
    var a = RNZ(-12, 12), b = RNZ(-12, 12), div = Math.random() < 0.45;
    if (a > 0 && b > 0) { if (Math.random() < 0.5) a = -a; else b = -b; }
    if (Math.abs(a) === 1) a = a * R(2, 9);
    if (Math.abs(b) === 1) b = b * R(2, 9);
    if (!div && Math.random() < 0.25) { // десятковий: −0,4 · 5
      var t10 = RNZ(-9, 9), k5 = RNZ(-9, 9); if (t10 > 0 && k5 > 0) t10 = -t10; if (Math.abs(k5) === 1) k5 *= 3;
      var pr = t10 * k5 * 10;
      return num((t10 < 0 ? M : "") + dec(Math.abs(t10) * 10) + " " + X + " " + pn(k5) + " = ___", dec(pr),
        ["Спершу знак: однакові → «+», різні → «" + M + "».", Math.abs(t10) + " " + X + " " + Math.abs(k5) + " = " + Math.abs(t10 * k5) + ", а після коми — один знак."],
        (t10 < 0 ? M : "") + dec(Math.abs(t10) * 10) + " " + X + " " + pn(k5) + " = <b>" + dec(pr) + "</b>.",
        { err: errs([[dec(-pr), "Перевір знак: " + (pr < 0 ? "знаки різні — результат від'ємний." : "мінус на мінус дає плюс.")], [sn(t10 * k5), "Не загуби кому: у множнику один знак після коми."]], dec(pr)), chk: { v: "(" + t10 / 10 + ")*(" + k5 + ")" } });
    }
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
    var t = R(1, 5), a, b, c, d, p, js, r;
    if (t === 5) {
      var bb = R(2, 3), nn = bb === 2 ? R(2, 4) : 2, inP = Math.random() < 0.5, k2 = RNZ(-5, 5), c2 = RNZ(-12, 12);
      var pw = inP ? Math.pow(-bb, nn) : -Math.pow(bb, nn), pD = inP ? "(" + M + bb + ")" + sup(nn) : M + bb + sup(nn);
      p = pD + " " + X + " " + pn(k2) + " + " + pn(c2); js = (inP ? "(-" + bb + ")**" + nn : "-(" + bb + "**" + nn + ")") + "*(" + k2 + ")+(" + c2 + ")"; r = pw * k2 + c2;
      var wr = (inP ? -pw : -pw) * k2 + c2;
      return num(p + " = ___", sn(r),
        ["Порядок: спершу степінь, потім множення, потім додавання.", "Спершу " + pD + " = " + sn(pw) + (inP ? "" : " (мінус не під степенем)") + "."],
        pD + " = " + sn(pw) + "; " + sn(pw) + " " + X + " " + pn(k2) + " = " + sn(pw * k2) + "; " + sn(pw * k2) + " + " + pn(c2) + " = <b>" + sn(r) + "</b>.",
        { err: errs([[sn(wr), inP ? "Знак степеня: від'ємне число в " + (nn % 2 ? "непарному" : "парному") + " степені — " + (nn % 2 ? "від'ємне." : "додатне.") : M + bb + sup(nn) + " = " + M + "(" + bb + sup(nn) + ") = " + sn(pw) + ": мінус не під степенем."]], sn(r)), chk: { v: js } });
    }
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
    var eB = {}; if (minus) { eB[w1] = "Мінус перед дужками змінює знак <b>і числа</b> в дужках теж: " + M + "(" + (s2 > 0 ? "+" : M) + r + ") = " + (s2 > 0 ? M : "+") + r + "."; eB[w2] = "Мінус перед дужками змінює знак доданка з x: " + M + "(" + polyD([[q, "x"]]) + ") = " + polyD([[-q, "x"]]) + "."; eB[w3] = "Мінус перед дужками змінює знак <b>кожного</b> доданка в дужках."; }
    else { eB[w1] = "Плюс перед дужками нічого не змінює — знаки лишаються."; eB[w2] = eB[w1]; eB[w3] = eB[w1]; }
    return choice("Розкрий дужки і спрости", srcD + " = ___", right, [w1, w2, w3],
      [minus ? "Мінус перед дужками змінює знак <b>кожного</b> доданка в дужках." : "Плюс перед дужками — дужки просто прибираємо.", "Спершу розкрий: " + polyD([[s1 * p, "x"]]) + (minus ? " " + M + " " + polyD([[q, "x"]]) + (s2 > 0 ? " " + M + " " : " + ") + r : " + " + polyD(inner)) + ", потім зведи доданки з x."],
      srcD + " = " + polyD([[s1 * p, "x"]]) + (minus ? " " + M + " " + polyD([[q, "x"]]) + (s2 > 0 ? " " + M + " " : " + ") + r : " + " + polyD(inner)) + " = <b>" + right + "</b>.",
      { err: eB, chk: { src: srcJ, vars: ["x"] } });
  };

  /* =================== Розділ 1: лінійні рівняння =================== */
  /* підстановка у вираз для підказок: [[коеф, значення]] → «3 · (−2) − (−4) + 5», без «1 ·» */
  function substD(parts) {
    var s = "";
    parts.forEach(function (t, i) {
      var c = t[0], v = t[1], body, neg = c < 0, ac = Math.abs(c);
      if (v === null) body = String(ac); else body = (ac === 1 ? "" : ac + " " + X + " ") + pn(v);
      if (i === 0) s = (neg ? M : "") + body; else s += (neg ? " " + M + " " : " + ") + body;
    });
    return s;
  }
  /* кінець розв'язку: kx = m → x = … (без «x = 2 : 1») */
  function tail(k, m, x) {
    if (k === 1) return "x = <b>" + x + "</b>";
    if (k === -1) return M + "x = " + sn(m) + " → x = <b>" + x + "</b>";
    return polyD([[k, "x"]]) + " = " + sn(m) + " → x = " + sn(m) + " : " + pn(k) + " = <b>" + x + "</b>";
  }
  G.eRoot = function (o) {
    o = o || {};
    var a = RNZ(-6, 6), x = R(-6, 6), b = RNZ(-12, 12), c = a * x + b;
    var eq = polyD([[a, "x"], [b, ""]]) + " = " + sn(c), eqJ = polyJ([[a, "x"], [b, ""]]);
    if (o.multi || Math.random() < 0.5) {
      var cands = [x], d = shuffle([-2, -1, 1, 2, 3]);
      for (var i = 0; cands.length < 4; i++) cands.push(x + d[i]);
      return choice("Яке з чисел є коренем рівняння", eq, sn(x), shuffle(cands.slice(1)).map(sn),
        ["Корінь — число, яке перетворює рівняння на правильну рівність. Підставляй по черзі.", "Спробуй x = " + sn(x) + ": " + substD([[a, x], [b, null]]) + " = ?"],
        "Підставляємо x = " + sn(x) + ": " + substD([[a, x], [b, null]]) + " = " + sn(c) + " — рівність правильна, тож корінь <b>" + sn(x) + "</b>.",
        { long: true, chk: { eqo: [eqJ, String(c)] } });
    }
    var cand = Math.random() < 0.5 ? x : x + pick([-1, 1, 2]), ok = a * cand + b === c, val = a * cand + b;
    return choice("Чи є число " + sn(cand) + " коренем рівняння", eq, ok ? "Так" : "Ні", [ok ? "Ні" : "Так"],
      ["Корінь — число, яке перетворює рівняння на правильну рівність.", "Підстав x = " + sn(cand) + " у ліву частину: " + substD([[a, cand], [b, null]]) + " = ?"],
      "Підставляємо: " + substD([[a, cand], [b, null]]) + " = " + sn(val) + (ok ? " = " + sn(c) + " — рівність правильна, тож <b>так</b>, це корінь." : " ≠ " + sn(c) + " — <b>ні</b>, не корінь."),
      { long: true, chk: { tf: ok } });
  };
  G.eSimple = function () {
    var t = R(1, 4), x, a, p, h, e, eq, err = {};
    for (;;) { x = RNZ(-12, 12); a = RNZ(-9, 9); if (t === 1 && x > 0 && a > 0) continue; if (Math.abs(a) === 1 && t > 2) continue; break; }
    if (t === 1) { var b = x + a; p = a < 0 ? "x " + M + " " + (-a) + " = " + sn(b) : "x + " + a + " = " + sn(b);
      h = ["Невідомий доданок = сума " + M + " відомий доданок.", "x = " + sn(b) + " " + M + " " + pn(a) + "."]; e = "x = " + sn(b) + " " + M + " " + pn(a) + " = <b>" + sn(x) + "</b>."; eq = ["x+(" + a + ")", String(b)];
      err = errs([[sn(b + a), "Доданок переносимо в іншу частину з протилежним знаком: x = " + sn(b) + " " + M + " " + pn(a) + "."]], sn(x)); }
    else if (t === 2) { var c = RNZ(-10, 20); if (c === x) c = c + R(1, 5); var b2 = c - x; p = sn(c) + " " + M + " x = " + sn(b2);
      h = ["Невідомий від'ємник = зменшуване " + M + " різниця.", "x = " + sn(c) + " " + M + " " + pn(b2) + "."]; e = "x = " + sn(c) + " " + M + " " + pn(b2) + " = <b>" + sn(x) + "</b>."; eq = [c + "-x", String(b2)];
      err = errs([[sn(-x), "Перевір знак: x = " + sn(c) + " " + M + " " + pn(b2) + "."]], sn(x)); }
    else if (t === 3) { var b3 = a * x; p = sn(a) + "x = " + sn(b3);
      h = ["Обидві частини поділи на коефіцієнт при x: на " + sn(a) + ".", "x = " + sn(b3) + " : " + pn(a) + "."]; e = "x = " + sn(b3) + " : " + pn(a) + " = <b>" + sn(x) + "</b>."; eq = ["(" + a + ")*x", String(b3)];
      err = errs([[sn(-x), "Ділимо на " + sn(a) + " разом зі знаком."], [sn(b3 - a), "Тут x <b>помножили</b> на " + sn(a) + ", тож ділимо, а не віднімаємо."]], sn(x)); }
    else { var b4 = x; x = a * b4; p = "x : " + pn(a) + " = " + sn(b4);
      h = ["Невідоме ділене = частка " + X + " дільник.", "x = " + sn(b4) + " " + X + " " + pn(a) + "."]; e = "x = " + sn(b4) + " " + X + " " + pn(a) + " = <b>" + sn(x) + "</b>."; eq = ["x/(" + a + ")", String(b4)];
      err = errs([[sn(-x), "Перевір знак: x = " + sn(b4) + " " + X + " " + pn(a) + "."]], sn(x)); }
    return num(p + "\nx = ___", sn(x), h, e, { task: "Розв'яжи рівняння", err: err, chk: { eq: eq[0], r: eq[1] } });
  };
  G.eLin1 = function () {
    var t = Math.random(), a, x, b, c, m;
    if (t < 0.15) { // десяткові коефіцієнти: 0,3x − 1,2 = 0,6
      var a10 = RNZ(-9, 9), b10 = RNZ(-30, 30); x = RNZ(-10, 10); if (Math.abs(a10) === 1) a10 *= 3;
      var c10 = a10 * x + b10, aD = (a10 < 0 ? M : "") + dec(Math.abs(a10) * 10) + "x", bD = (b10 < 0 ? " " + M + " " : " + ") + dec(Math.abs(b10) * 10);
      return num(aD + bD + " = " + dec(c10 * 10) + "\nx = ___", sn(x),
        ["Перенеси " + dec(b10 * 10) + " вправо зі зміною знака: " + aD + " = " + dec(c10 * 10) + (b10 < 0 ? " + " : " " + M + " ") + dec(Math.abs(b10) * 10) + ".", aD + " = " + dec((c10 - b10) * 10) + ". Поділи на " + dec(a10 * 10) + " (зручно помножити обидва числа на 10)."],
        aD + " = " + dec((c10 - b10) * 10) + " → x = " + dec((c10 - b10) * 10) + " : " + (a10 < 0 ? "(" + dec(a10 * 10) + ")" : dec(a10 * 10)) + " = <b>" + sn(x) + "</b>.",
        { task: "Розв'яжи рівняння", err: errs([[sn(-x), "Ділимо разом зі знаком."]], sn(x)), chk: { eq: "(" + a10 / 10 + ")*x+(" + b10 / 10 + ")", r: String(c10 / 10) } });
    }
    if (t < 0.3) { // x/k + b = c
      var k = R(2, 6), q = RNZ(-9, 9); x = k * q; b = RNZ(-12, 12); c = q + b;
      return num("x/" + k + (b < 0 ? " " + M + " " + (-b) : " + " + b) + " = " + sn(c) + "\nx = ___", sn(x),
        ["Спершу перенеси " + sn(b) + ": x/" + k + " = " + sn(c) + (b < 0 ? " + " + (-b) : " " + M + " " + b) + " = " + sn(q) + ".", "x/" + k + " = " + sn(q) + " — x поділили на " + k + ", тож x = " + sn(q) + " " + X + " " + k + "."],
        "x/" + k + " = " + sn(q) + " → x = " + sn(q) + " " + X + " " + k + " = <b>" + sn(x) + "</b>.",
        { task: "Розв'яжи рівняння", err: errs([[sn(q), "Це x/" + k + ". А сам x у " + k + " рази більший: " + sn(q) + " " + X + " " + k + "."], [fr(q, k), "x поділили на " + k + " — щоб знайти x, множимо на " + k + ", а не ділимо."]], sn(x)), chk: { eq: "x/" + k + "+(" + b + ")", r: String(c) } });
    }
    var frac = t < 0.45;
    do { a = RNZ(-9, 9); b = RNZ(-20, 20); if (frac) { m = RNZ(-40, 40); c = m + b; } else { x = RNZ(-10, 10); c = a * x + b; m = c - b; } }
    while (Math.abs(a) === 1 || (frac && (m % a === 0 || Math.abs(c) > 50)));
    var ans = fr(m, a), w = (c + b) / a;
    return num(polyD([[a, "x"], [b, ""]]) + " = " + sn(c) + "\nx = ___", ans,
      ["Перенеси " + sn(b) + " у праву частину, змінивши знак: " + sn(a) + "x = " + sn(c) + (b < 0 ? " + " + (-b) : " " + M + " " + b) + ".", sn(a) + "x = " + sn(m) + ". Тепер поділи на " + sn(a) + "." + (frac ? " Націло не ділиться — відповідь буде дробом (можна 7/2 або 3,5)." : "")],
      sn(a) + "x = " + sn(c) + (b < 0 ? " + " + (-b) : " " + M + " " + b) + " = " + sn(m) + "; x = " + sn(m) + " : " + pn(a) + " = <b>" + ans + "</b>.",
      { task: "Розв'яжи рівняння", err: errs([[Number.isInteger(w) ? sn(w) : fr(c + b, a), "Переносячи доданок в іншу частину, змінюй його знак: " + sn(b) + " → " + sn(-b) + "."], [fr(-m, a), "Ділимо на " + sn(a) + " разом зі знаком."]], ans),
        chk: { eq: polyJ([[a, "x"], [b, ""]]), r: String(c) } });
  };
  G.eLin2 = function () {
    var a, c, x, b, d, frac = Math.random() < 0.2, k, m;
    do { a = RNZ(-9, 9); c = RNZ(-9, 9); b = RNZ(-15, 15); k = a - c;
      if (frac) { d = RNZ(-20, 20); m = d - b; } else { x = RNZ(-9, 9); d = a * x + b - c * x; m = d - b; } }
    while (a === c || Math.abs(d) > 40 || (frac && (m % k === 0 || Math.abs(k) === 1)));
    var ans = fr(m, k);
    var L = polyD([[a, "x"], [b, ""]]), Rr = polyD([[c, "x"], [d, ""]]);
    return num(L + " = " + Rr + "\nx = ___", ans,
      ["Доданки з x — вліво, числа — вправо. Переносячи, змінюй знак.", polyD([[a, "x"]]) + (c < 0 ? " + " + polyD([[-c, "x"]]) : " " + M + " " + polyD([[c, "x"]])) + " = " + sn(d) + (b < 0 ? " + " + (-b) : " " + M + " " + b) + ", тобто " + polyD([[k, "x"]]) + " = " + sn(m) + "."],
      tail(k, m, ans) + ".",
      { task: "Розв'яжи рівняння", err: errs([[fr(-m, k), "Перевір знаки, коли переносиш доданки: в іншій частині знак змінюється."], [fr(d + b, a + c || 1), "Переносячи доданок через «=», змінюй його знак."]], ans),
        chk: { eq: polyJ([[a, "x"], [b, ""]]), r: polyJ([[c, "x"], [d, ""]]) } });
  };
  G.eBr = function () {
    var k, m, c, x, d, n, t = R(1, 3), L, Rr, Lj, Rj, open, kk, mm, err = [];
    for (;;) {
      k = RNZ(-6, 6); m = RNZ(-9, 9); x = RNZ(-8, 8);
      if (t === 1) { if (Math.abs(k) === 1) continue; c = RNZ(-6, 6); if (c === k) continue; d = k * (x + m) - c * x; if (Math.abs(d) > 50) continue;
        L = sn(k) + "(" + polyD([[1, "x"], [m, ""]]) + ")"; Rr = polyD([[c, "x"], [d, ""]]); Lj = "(" + k + ")*(x+(" + m + "))"; Rj = polyJ([[c, "x"], [d, ""]]);
        open = polyD([[k, "x"], [k * m, ""]]) + " = " + Rr; kk = k - c; mm = d - k * m;
        var w1 = (d - m) / (k - c); if (Number.isInteger(w1) && w1 !== x) err.push([sn(w1), "Множник " + sn(k) + " треба помножити на <b>кожен</b> доданок у дужках: " + sn(k) + " " + X + " " + pn(m) + " = " + sn(k * m) + "."]); }
      else if (t === 2) { n = R(2, 20); c = RNZ(-12, 12); x = n - m - c; if (x === 0 || Math.abs(x) > 25) continue;
        L = n + " " + M + " (" + polyD([[1, "x"], [m, ""]]) + ")"; Rr = sn(c); Lj = n + "-(x+(" + m + "))"; Rj = String(c);
        open = polyD([[n, ""], [-1, "x"], [-m, ""]]) + " = " + Rr; kk = -1; mm = c - n + m;
        err.push([sn(n + m - c), "Мінус перед дужками змінює знак <b>кожного</b> доданка: " + M + "(" + polyD([[1, "x"], [m, ""]]) + ") = " + polyD([[-1, "x"], [-m, ""]]) + "."]); }
      else { if (Math.abs(k) === 1) continue; c = RNZ(-6, 6); if (c === k || Math.abs(c) === 1) continue; var cd = (k - c) * x + k * m; if (cd % c) continue; d = cd / c; if (d === 0 || Math.abs(d) > 12) continue;
        L = sn(k) + "(" + polyD([[1, "x"], [m, ""]]) + ")"; Rr = sn(c) + "(" + polyD([[1, "x"], [d, ""]]) + ")"; Lj = "(" + k + ")*(x+(" + m + "))"; Rj = "(" + c + ")*(x+(" + d + "))";
        open = polyD([[k, "x"], [k * m, ""]]) + " = " + polyD([[c, "x"], [c * d, ""]]); kk = k - c; mm = c * d - k * m; }
      break;
    }
    return num(L + " = " + Rr + "\nx = ___", sn(x),
      [t === 2 ? "Мінус перед дужками змінює знаки всіх доданків у дужках." : "Спершу розкрий дужки: множник перед дужками множимо на кожен доданок у них.", "Після розкриття: " + open + ". Далі — як звичайне лінійне рівняння."],
      open + " → " + tail(kk, mm, sn(x)) + ".",
      { task: "Розв'яжи рівняння", err: errs(err, sn(x)), chk: { eq: Lj, r: Rj } });
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
      ["Розкрий дужки: " + L + " = " + open + ". Порівняй з правою частиною.", "Збери x зліва, числа справа. Вийшло 0 · x = 0 → безліч коренів; 0 · x = число (не 0) → жодного."],
      L + " = " + open + ". " + (kind === "one" ? "Коефіцієнти при x різні — рівняння має <b>один корінь</b>." : kind === "none" ? "Збираємо: 0 · x = " + sn(t) + ". Нуль, помножений на будь-яке число, — це 0, а не " + sn(t) + ": <b>жодного кореня</b>." : "Збираємо: 0 · x = 0 — правильно при будь-якому x: <b>безліч коренів</b>."),
      { long: true, err: kind === "one" ? {} : (function () { var o = {}; o["Один корінь"] = "Розкрий дужки й перенеси x вліво: доданки з x знищуються, лишається 0 · x = " + (kind === "none" ? sn(t) : "0") + "."; return o; })(),
        chk: { spec: ["(" + a + ")*(x+(" + b + "))", Rj], kind: kind } });
  };
  /* ---------- задачі: модель (вибір рівняння) і розв'язання ---------- */
  var NAMES = [["Оля", "Олі"], ["Марта", "Марти"], ["Софія", "Софії"], ["Даринка", "Даринки"], ["Ліза", "Лізи"], ["Іра", "Іри"]];
  var BOYS = [["Андрій", "Андрія"], ["Максим", "Максима"], ["Денис", "Дениса"], ["Тарас", "Тараса"]];
  function pl(n, f) { var u = Math.abs(n) % 10, t = Math.abs(n) % 100; return t >= 11 && t <= 14 ? f[2] : u === 1 ? f[0] : u >= 2 && u <= 4 ? f[1] : f[2]; }
  function raz(k) { return k < 5 ? "рази" : "разів"; }
  function rokiv(m) { return pl(m, ["рік", "роки", "років"]); }
  function wordTask() {
    var t = R(1, 8), x, k, m, N, w = {}, big = Math.random() < 0.3;
    if (t === 1) { k = R(2, 5); x = R(4, 25);
      var S = pick([{ w: "У двох кошиках", f: "У першому кошику", s: "у другому", n: ["яблуко", "яблука", "яблук"], xd: "кількість яблук у другому кошику" },
        { w: "На двох полицях", f: "На першій полиці", s: "на другій", n: ["книжка", "книжки", "книжок"], xd: "кількість книжок на другій полиці" },
        { w: "У двох класах", f: "У першому класі", s: "у другому", n: ["учень", "учні", "учнів"], xd: "кількість учнів у другому класі" }]);
      if (S.n[0] === "учень") { k = 2; x = R(8, 13); }
      N = x * (k + 1); var first = S.f.replace(/^У першому |^На першій /, "");
      w.txt = S.w + " разом " + N + " " + pl(N, S.n) + ". " + S.f + " в " + k + " " + raz(k) + " більше, ніж " + S.s + ". " + (big ? "Скільки " + S.n[2] + " " + S.f.charAt(0).toLowerCase() + S.f.slice(1) + "?" : "Скільки " + S.n[2] + " " + S.s + "?");
      w.eqD = "x + " + k + "x = " + N; w.x = x; w.xd = S.xd; w.how = "Нехай x — " + S.xd + ", тоді " + S.f.charAt(0).toLowerCase() + S.f.slice(1) + " " + k + "x.";
      w.q = big ? k * x : x; w.qJ = big ? k + "*x" : "x"; w.qs = big ? "Тоді " + S.f.charAt(0).toLowerCase() + S.f.slice(1) + " " + k + " " + X + " " + x + " = " + k * x + "." : "";
      w.opts = [w.eqD, k + "x = " + N, "x + (x + " + k + ") = " + N, "x + " + k + "x = " + N + " " + X + " " + k]; }
    else if (t === 2) { m = R(3, 20); x = R(5, 40); N = 2 * x + m; var acc = pick([["марку", "марки", "марок"], ["наліпку", "наліпки", "наліпок"], ["листівку", "листівки", "листівок"]]), nn = pick(NAMES), bb = pick(BOYS);
      w.txt = nn[0] + " і " + bb[0] + " мають разом " + N + " " + pl(N, acc) + ". У " + nn[1] + " на " + m + " " + pl(m, acc) + " більше, ніж у " + bb[1] + ". Скільки " + acc[2] + " " + (big ? "в " + nn[1] : "в " + bb[1]) + "?";
      w.eqD = "x + (x + " + m + ") = " + N; w.x = x; w.xd = "кількість " + acc[2] + " " + bb[1]; w.how = "Нехай x — у " + bb[1] + ", тоді в " + nn[1] + " x + " + m + ".";
      w.q = big ? x + m : x; w.qJ = big ? "x+" + m : "x"; w.qs = big ? "Тоді в " + nn[1] + " " + x + " + " + m + " = " + (x + m) + "." : "";
      w.opts = [w.eqD, "x + (x " + M + " " + m + ") = " + N, "x + " + m + "x = " + N, "x + " + m + " = " + N]; }
    else if (t === 3) { m = R(22, 32); x = R(8, 16); N = 2 * x + m;
      w.txt = "Мама старша за доньку на " + m + " " + rokiv(m) + ". Разом їм " + N + " " + rokiv(N) + ". Скільки років " + (big ? "мамі" : "доньці") + "?";
      w.eqD = "x + (x + " + m + ") = " + N; w.x = x; w.xd = "вік доньки"; w.how = "Нехай доньці x років, тоді мамі x + " + m + ".";
      w.q = big ? x + m : x; w.qJ = big ? "x+" + m : "x"; w.qs = big ? "Тоді мамі " + x + " + " + m + " = " + (x + m) + "." : "";
      w.opts = [w.eqD, "x + " + m + " = " + N, "x + (x " + M + " " + m + ") = " + N, m + "x = " + N]; }
    else if (t === 4) { do { x = R(-5, 40); } while (x === 1); N = 3 * x + 3;
      w.txt = "Сума трьох послідовних цілих чисел дорівнює " + sn(N) + ". Знайди " + (big ? "найбільше" : "найменше") + " з них.";
      w.eqD = "x + (x + 1) + (x + 2) = " + sn(N); w.x = x; w.xd = "найменше з чисел"; w.how = "Нехай найменше число x, тоді наступні x + 1 і x + 2.";
      w.q = big ? x + 2 : x; w.qJ = big ? "x+2" : "x"; w.qs = big ? "Найбільше: " + sn(x) + " + 2 = " + sn(x + 2) + "." : "";
      w.opts = [w.eqD, "x + 2x + 3x = " + sn(N), "3x = " + sn(N), "x + (x + 2) + (x + 4) = " + sn(N)]; }
    else if (t === 5) { k = R(2, 6); m = R(2, 20); x = R(2, 15); N = k * x - m;
      w.txt = "Задумали число, помножили його на " + k + " і відняли " + m + ". Вийшло " + sn(N) + ". Яке число задумали?";
      w.eqD = k + "x " + M + " " + m + " = " + sn(N); w.x = x; w.xd = "задумане число"; w.how = "Нехай задумане число x."; w.q = x; w.qJ = "x"; w.qs = "";
      w.opts = [w.eqD, k + "(x " + M + " " + m + ") = " + sn(N), k + "x + " + m + " = " + sn(N), "x " + M + " " + m + " " + X + " " + k + " = " + sn(N)]; }
    else if (t === 6) { k = R(2, 4); x = R(3, 15); var P = 2 * (x + k * x);
      w.txt = "Довжина прямокутника в " + k + " " + raz(k) + " більша за ширину, а периметр — " + P + " см. Знайди " + (big ? "довжину" : "ширину") + ".";
      w.eqD = "2(x + " + k + "x) = " + P; w.x = x; w.xd = "ширину"; w.how = "Нехай ширина x см, тоді довжина " + k + "x см.";
      w.q = big ? k * x : x; w.qJ = big ? k + "*x" : "x"; w.qs = big ? "Довжина: " + k + " " + X + " " + x + " = " + k * x + " см." : "";
      w.opts = [w.eqD, "x + " + k + "x = " + P, "2(x + " + k + ") = " + P, "x + " + 2 * k + "x = " + P]; }
    else if (t === 7) { k = pick([2, 3, 5]); do { x = R(3, 20); m = x * (k - 1) / 2; } while (!Number.isInteger(m) || m < 2);
      w.txt = "У першому ящику в " + k + " " + raz(k) + " більше яблук, ніж у другому. Коли з першого переклали в другий " + m + " кг, у ящиках стало порівну. Скільки кілограмів яблук було в другому ящику спочатку?";
      w.eqD = k + "x " + M + " " + m + " = x + " + m; w.x = x; w.xd = "масу яблук у другому ящику спочатку"; w.how = "Нехай у другому було x кг, тоді в першому " + k + "x кг. Після перекладання: у першому " + k + "x " + M + " " + m + ", у другому x + " + m + ".";
      w.q = x; w.qJ = "x"; w.qs = "";
      w.opts = [w.eqD, k + "x + " + m + " = x " + M + " " + m, k + "x " + M + " " + m + " = x", "x + " + k + "x = " + 2 * m]; }
    else { var na = R(2, 5), nb = R(2, 4); m = R(3, 12); x = R(5, 25); N = na * x + nb * (x + m);
      w.txt = na + " " + pl(na, ["зошит", "зошити", "зошитів"]) + " і " + nb + " " + pl(nb, ["ручка", "ручки", "ручок"]) + " коштують разом " + N + " грн. Ручка дорожча за зошит на " + m + " грн. Скільки коштує " + (big ? "ручка" : "зошит") + "?";
      w.eqD = na + "x + " + nb + "(x + " + m + ") = " + N; w.x = x; w.xd = "ціну зошита"; w.how = "Нехай зошит коштує x грн, тоді ручка — x + " + m + " грн.";
      w.q = big ? x + m : x; w.qJ = big ? "x+" + m : "x"; w.qs = big ? "Ручка: " + x + " + " + m + " = " + (x + m) + " грн." : "";
      w.opts = [w.eqD, na + "x + " + nb + "x = " + N, na + "x + " + nb + "(x " + M + " " + m + ") = " + N, (na + nb) + "(x + " + m + ") = " + N]; }
    return w;
  }
  function eqJ(s) { return s.replace(/−/g, "-").replace(/·/g, "*").replace(/(\d)x/g, "$1*x").replace(/(\d)\(/g, "$1*(").replace(/\)\(/g, ")*("); }
  G.eModel = function () {
    var w = wordTask();
    return choice("Яке рівняння відповідає задачі", w.txt + " Познач через x " + w.xd + ".", w.eqD, w.opts.slice(1),
      ["" + w.how, "Склади вирази для всіх величин через x і запиши, що відомо з умови."],
      w.how + " Рівняння: <b>" + w.eqD + "</b>.",
      { long: true, chk: { model: w.opts.map(function (o) { var s = o.split(" = "); return [eqJ(s[0]), eqJ(s[1])]; }), root: w.x } });
  };
  G.eWord = function () {
    var w = wordTask(), v = w.eqD.split(" = ");
    return num(w.txt, sn(w.q),
      [w.how, "Рівняння: " + w.eqD + ". Розв'яжи його" + (w.qs ? " — і уважно: що питають у задачі?" : ".")],
      w.how + " " + w.eqD + " → x = " + sn(w.x) + ". " + (w.qs ? w.qs + " " : "") + "Відповідь: <b>" + sn(w.q) + "</b>.",
      { task: "Розв'яжи задачу за допомогою рівняння", long: true, err: w.qs ? errs([[sn(w.x), "x = " + sn(w.x) + " — правильно! Але в задачі питають інше: " + w.qs]], sn(w.q)) : {},
        chk: { eq: eqJ(v[0]), r: eqJ(v[1]), ans: w.qJ } });
  };

  /* =================== Розділ 2: вирази, тотожності, степені, одночлени =================== */
  G.xVal = function (o) {
    o = o || {};
    var t = o.t === "hard" ? R(2, 3) : R(1, 3), p, js, r, h, e, err = {}, ans;
    if (t === 1) { var a = RNZ(-6, 6), b = RNZ(-6, 6), P = RNZ(-7, 7), Q = RNZ(-7, 7);
      js = P + "*(" + a + ")+(" + Q + ")*(" + b + ")"; r = P * a + Q * b; ans = sn(r);
      p = polyD([[P, "a"], [Q, "b"]]) + "\nякщо a = " + sn(a) + ", b = " + sn(b) + "\n___";
      h = ["Підстав числа замість букв. Від'ємні числа бери в дужки.", substD([[P, a], [Q, b]]) + " = ?"];
      e = substD([[P, a], [Q, b]]) + " = " + sn(P * a) + (Q * b < 0 ? " " + M + " " + (-Q * b) : " + " + Q * b) + " = <b>" + ans + "</b>."; }
    else if (t === 2) { var x = o.t === "hard" ? -R(1, 5) : RNZ(-5, 5), P2 = RNZ(-6, 6), Q2 = R(-10, 10), sq = pick([1, 2]);
      js = sq + "*(" + x + ")**2+(" + P2 + ")*(" + x + ")+(" + Q2 + ")"; r = sq * x * x + P2 * x + Q2; ans = sn(r);
      p = polyD([[sq, "x²"], [P2, "x"], [Q2, ""]]) + "\nякщо x = " + sn(x) + "\n___";
      h = ["Спершу степінь: " + pn(x) + "² = " + x * x + "." + (x < 0 ? " Квадрат від'ємного числа — додатний." : ""), (sq === 1 ? "" : sq + " " + X + " ") + x * x + (P2 * x < 0 ? " " + M + " " + (-P2 * x) : " + " + P2 * x) + (Q2 < 0 ? " " + M + " " + (-Q2) : Q2 ? " + " + Q2 : "") + " = ?"];
      e = (sq === 1 ? "" : sq + " " + X + " ") + pn(x) + "²" + (P2 < 0 ? " " + M + " " : " + ") + (Math.abs(P2) === 1 ? "" : Math.abs(P2) + " " + X + " ") + pn(x) + (Q2 < 0 ? " " + M + " " + (-Q2) : Q2 ? " + " + Q2 : "") + " = " + (sq === 1 ? "" : sq + " " + X + " ") + x * x + (P2 * x < 0 ? " " + M + " " + (-P2 * x) : " + " + P2 * x) + (Q2 < 0 ? " " + M + " " + (-Q2) : Q2 ? " + " + Q2 : "") + " = <b>" + ans + "</b>.";
      if (x < 0) err = errs([[sn(r - 2 * sq * x * x), pn(x) + "² = " + x * x + " — квадрат від'ємного числа додатний."]], ans); }
    else { // x = ±0,5 або ±1,5: 4x² + Bx + C — ціле; 2x² + Bx + C — з половинками
      var pp = pick([-3, -1, 1, 3]), A = pick([2, 4]), B = 2 * RNZ(-4, 4), C = R(-6, 6), xs = (pp < 0 ? M : "") + dec(Math.abs(pp) * 50);
      var hh = A * pp * pp * 25 + B * pp * 50 + C * 100; ans = dec(hh);
      js = A + "*(" + pp / 2 + ")**2+(" + B + ")*(" + pp / 2 + ")+(" + C + ")";
      p = polyD([[A, "x²"], [B, "x"], [C, ""]]) + "\nякщо x = " + xs + "\n___";
      var sqv = dec(pp * pp * 25), bx = dec(B * pp * 50);
      h = ["Спершу квадрат: (" + xs + ")² = " + sqv + ".", A + " " + X + " " + sqv + " = " + dec(A * pp * pp * 25) + "; " + sn(B) + " " + X + " (" + xs + ") = " + bx + "."];
      e = A + " " + X + " " + sqv + (B * pp < 0 ? " " + M + " " + dec(Math.abs(B * pp * 50)) : " + " + bx) + (C < 0 ? " " + M + " " + (-C) : C ? " + " + C : "") + " = <b>" + ans + "</b>.";
      err = errs([[dec(hh - 2 * A * pp * pp * 25), "(" + xs + ")² = " + sqv + " — квадрат завжди невід'ємний."]], ans); }
    return num(p, ans, h, e, { task: "Знайди значення виразу", err: err, chk: { v: js } });
  };
  G.xLike = function () {
    var withC = Math.random() < 0.4, c1, c2, c3, c4, v2 = withC ? "" : "b", V = withC ? "x" : "a";
    do { c1 = RNZ(-9, 9); c2 = RNZ(-9, 9); c3 = RNZ(-9, 9); c4 = RNZ(-9, 9); }
    while (c1 + c3 === 0 || c2 + c4 === 0 || c1 - c3 === 0 || c2 - c4 === 0 || Math.abs(c1 - c3) === Math.abs(c1 + c3) || Math.abs(c2 - c4) === Math.abs(c2 + c4));
    var terms = Math.random() < 0.5 ? [[c1, V], [c2, v2], [c3, V], [c4, v2]] : [[c1, V], [c2, v2], [c4, v2], [c3, V]];
    var A = c1 + c3, A2 = c1 - c3, B = c2 + c4, B2 = c2 - c4;
    var right = polyD([[A, V], [B, v2]]), wa = polyD([[A2, V], [B, v2]]), wb = polyD([[A, V], [B2, v2]]), wab = polyD([[A2, V], [B2, v2]]);
    var ma = "Доданок " + polyD([[c3, V]]) + " — зі своїм знаком: " + sn(c1) + (c3 < 0 ? " " + M + " " + (-c3) : " + " + c3) + " = " + sn(A) + ".";
    var mb = (withC ? "Число " : "Доданок ") + polyD([[c4, v2]]) + " — зі своїм знаком: " + sn(c2) + (c4 < 0 ? " " + M + " " + (-c4) : " + " + c4) + " = " + sn(B) + ".";
    var err = {}; err[wa] = ma; err[wb] = mb; err[wab] = ma + " " + mb;
    return choice("Зведи подібні доданки", polyD(terms) + " = ___", right, [wa, wb, wab],
      ["Подібні доданки — з однаковою буквеною частиною: окремо всі з «" + V + "», окремо " + (withC ? "числа" : "всі з «b»") + ".", "Знак перед доданком належить йому: " + polyD([[c1, V]]) + " і " + polyD([[c3, V]]) + " → " + sn(c1) + (c3 < 0 ? " " + M + " " + (-c3) : " + " + c3) + " = " + sn(A) + "."],
      "З «" + V + "»: " + sn(c1) + (c3 < 0 ? " " + M + " " + (-c3) : " + " + c3) + " = " + sn(A) + "; " + (withC ? "числа" : "з «b»") + ": " + sn(c2) + (c4 < 0 ? " " + M + " " + (-c4) : " + " + c4) + " = " + sn(B) + ". Разом: <b>" + right + "</b>.",
      { err: err, chk: { src: polyJ(terms), vars: ["a", "b", "x"] } });
  };
  G.xDist = function () {
    var k = RNZ(-6, 6), a = RNZ(-7, 7), b = RNZ(-9, 9), V = pick(["x", "a", "y"]);
    if (k === 1) k = -1;
    if (Math.abs(b) === Math.abs(k * b)) b = b * 2 || 3;
    var src = (k === -1 ? M : sn(k)) + "(" + polyD([[a, V], [b, ""]]) + ")", srcJ = "(" + k + ")*(" + polyJ([[a, V], [b, ""]]) + ")";
    var right = polyD([[k * a, V], [k * b, ""]]);
    var forgot = Math.random() < 0.5 && Math.abs(k) !== 1, B2 = forgot ? b : -k * b;
    var wa = polyD([[-k * a, V], [k * b, ""]]), wb = polyD([[k * a, V], [B2, ""]]), wab = polyD([[-k * a, V], [B2, ""]]);
    var ka = sn(k) + " " + X + " " + (a < 0 ? "(" + polyD([[a, V]]) + ")" : polyD([[a, V]]));
    var ma = "Знак: " + ka + " = " + polyD([[k * a, V]]) + ".", mb = forgot ? "Множник " + sn(k) + " треба помножити і на " + sn(b) + ": " + sn(k) + " " + X + " " + pn(b) + " = " + sn(k * b) + "." : "Знак: " + sn(k) + " " + X + " " + pn(b) + " = " + sn(k * b) + ".";
    var err = {}; err[wa] = ma; err[wb] = mb; err[wab] = ma + " " + mb;
    return choice("Розкрий дужки", src + " = ___", right, [wa, wb, wab],
      ["Множник перед дужками множимо на <b>кожен</b> доданок у дужках.", ka + " = " + polyD([[k * a, V]]) + ", а " + sn(k) + " " + X + " " + pn(b) + " = ?"],
      src + " = " + ka + " + " + pn(k) + " " + X + " " + pn(b) + " = <b>" + right + "</b>.",
      { err: err, chk: { src: srcJ, vars: [V] } });
  };
  /* §5 тотожність: чи тотожно рівні два вирази */
  G.xId = function () {
    var k = RNZ(-5, 5), a = RNZ(-5, 5), b = RNZ(-9, 9), V = pick(["x", "a", "m"]), ok = Math.random() < 0.45, t = R(1, 2), A, Bx, Aj, Bj, why;
    if (Math.abs(k) === 1) k = k * 2;
    if (t === 1) { A = sn(k) + "(" + polyD([[a, V], [b, ""]]) + ")"; Aj = "(" + k + ")*(" + polyJ([[a, V], [b, ""]]) + ")";
      var bb = ok ? k * b : pick([b, -k * b]); Bx = polyD([[k * a, V], [bb, ""]]); Bj = polyJ([[k * a, V], [bb, ""]]);
      why = ok ? "Розкриваємо дужки: " + A + " = " + polyD([[k * a, V], [k * b, ""]]) + " — те саме." : "Розкриваємо дужки: " + A + " = " + polyD([[k * a, V], [k * b, ""]]) + ", а не " + Bx + "."; }
    else { var p1 = RNZ(-6, 6), q1 = RNZ(-6, 6), c0 = RNZ(-9, 9); A = polyD([[p1, V], [c0, ""], [q1, V]]); Aj = polyJ([[p1, V], [c0, ""], [q1, V]]);
      if (p1 + q1 === 0) q1 = q1 + 1, A = polyD([[p1, V], [c0, ""], [q1, V]]), Aj = polyJ([[p1, V], [c0, ""], [q1, V]]);
      var cc = ok ? p1 + q1 : p1 - q1; if (!ok && cc === p1 + q1) cc = p1 + q1 + 1; Bx = polyD([[cc, V], [c0, ""]]); Bj = polyJ([[cc, V], [c0, ""]]);
      why = ok ? "Зводимо подібні: " + A + " = " + polyD([[p1 + q1, V], [c0, ""]]) + " — те саме." : "Зводимо подібні: " + A + " = " + polyD([[p1 + q1, V], [c0, ""]]) + ", а не " + Bx + "."; }
    var x0 = R(1, 3);
    return choice("Чи тотожно рівні вирази", A + "   і   " + Bx, ok ? "Так" : "Ні", [ok ? "Ні" : "Так"],
      ["Тотожно рівні — рівні при <b>будь-якому</b> значенні змінної. Спрости перший вираз і порівняй.", "Або підстав, наприклад, " + V + " = " + x0 + " в обидва. Різні значення — точно не тотожні."],
      why + (ok ? " Вирази <b>тотожно рівні</b>." : " Вирази <b>не тотожні</b> (перевір підстановкою " + V + " = " + x0 + ")."),
      { long: true, chk: { idA: Aj.split(V).join("x"), idB: Bj.split(V).join("x"), same: ok } });
  };
  G.pwVal = function (o) {
    o = o || {};
    var t = o.t || pick(["neg", "neg", "minus", "frac", "dec", "one"]), b, n, p, r, h, e, err = {}, js;
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
      err = errs([[fr(Math.pow(a, n), d), "У степінь підносимо <b>і знаменник</b> теж: " + d + sup(n) + " = " + Math.pow(d, n) + "."]], r); }
    else if (t === "dec") { var dd = R(1, 9), big = Math.random() < 0.35; n = 2;
      if (big) { var v = R(11, 15); r = dec(v * v); p = dec(v * 10) + "²"; js = "(" + v / 10 + ")**2"; h = ["Порахуй без коми: " + v + "² = " + v * v + ".", "У множниках разом 2 знаки після коми — у відповіді теж 2."]; e = dec(v * 10) + " " + X + " " + dec(v * 10) + " = <b>" + r + "</b>.";
        err = errs([[dec(v * 20), "Степінь — не множення на 2: " + dec(v * 10) + "² = " + dec(v * 10) + " " + X + " " + dec(v * 10) + "."]], r); }
      else { r = dec(dd * dd); p = "0," + dd + "²"; js = "(" + dd / 10 + ")**2"; h = ["0," + dd + "² = 0," + dd + " " + X + " 0," + dd + ".", dd + " " + X + " " + dd + " = " + dd * dd + ", а знаків після коми має бути 2."]; e = "0," + dd + " " + X + " 0," + dd + " = <b>" + r + "</b> (після коми 1 + 1 = 2 знаки).";
        err = errs([[dec(dd * dd * 10), "Знаків після коми у відповіді стільки, скільки в обох множниках разом: 1 + 1 = 2."], [dec(dd * 20), "Степінь — не множення на 2: 0," + dd + "² = 0," + dd + " " + X + " 0," + dd + "."]], r); } }
    else { n = R(11, 40); r = n % 2 ? -1 : 1; p = "(" + M + "1)" + sup(n); js = "(-1)**" + n;
      h = ["(" + M + "1) " + X + " (" + M + "1) = 1. Кожна пара мінусів дає плюс.", "Показник " + n + " — " + (n % 2 ? "непарний" : "парний") + "."];
      e = "(" + M + "1)" + sup(n) + " = <b>" + sn(r) + "</b>: " + (n % 2 ? "непарний показник — " + M + "1." : "парний показник — 1.");
      err = errs([[sn(-r), "Парний показник → 1, непарний → " + M + "1."]], sn(r)); }
    return num(p + " = ___", typeof r === "number" ? sn(r) : r, h, e, { err: err, chk: { v: js } });
  };
  G.pwProp = function () {
    var t = pick(["mul", "div", "pow", "mix1", "mix2"]), m = R(2, 9), n = R(2, 9), k = R(2, 5), V = pick(["a", "x", "b", "y"]), p, r, h, err = {};
    if (t === "mul") { p = V + sup(m) + " " + X + " " + V + sup(n); r = m + n; h = ["При множенні степенів з однаковою основою показники <b>додають</b>.", m + " + " + n + " = ?"]; err = errs([[m * n, "При множенні степенів показники <b>додаються</b>, а не множаться: " + m + " + " + n + "."]], r); }
    else if (t === "div") { n = R(2, 7); m = n + R(1, 6); p = V + sup(m) + " : " + V + sup(n); r = m - n; h = ["При діленні степенів з однаковою основою показники <b>віднімають</b>.", m + " " + M + " " + n + " = ?"]; if (m % n === 0) err = errs([[m / n, "При діленні показники <b>віднімаються</b>, а не діляться: " + m + " " + M + " " + n + "."]], r); }
    else if (t === "pow") { m = R(2, 6); p = "(" + V + sup(m) + ")" + sup(k); r = m * k; h = ["При піднесенні степеня до степеня показники <b>множать</b>.", m + " " + X + " " + k + " = ?"]; err = errs([[m + k, "Степінь у степені: показники <b>множаться</b>: " + m + " " + X + " " + k + "."]], r); }
    else if (t === "mix1") { m = R(2, 5); p = "(" + V + sup(m) + ")" + sup(k) + " " + X + " " + V + sup(n); r = m * k + n; h = ["Спершу (" + V + sup(m) + ")" + sup(k) + " = " + V + sup(m * k) + " — показники множимо.", "Потім " + V + sup(m * k) + " " + X + " " + V + sup(n) + ": показники додаємо."]; err = errs([[m + k + n, "(" + V + sup(m) + ")" + sup(k) + " = " + V + sup(m * k) + ": у дужках степінь у степені — показники множимо."]], r); }
    else { var s = R(2, 8); n = R(2, 8); var q = R(2, s + n - 1); m = s; p = V + sup(m) + " " + X + " " + V + sup(n) + " : " + V + sup(q); r = m + n - q; h = ["Спершу множення: " + V + sup(m) + " " + X + " " + V + sup(n) + " = " + V + sup(m + n) + ".", "Потім ділення: " + (m + n) + " " + M + " " + q + "."]; }
    return num(p + " = " + V + "ⁿ\nn = ___", r, h, p + " = " + V + "<sup>" + r + "</sup>, тобто n = <b>" + r + "</b>.", { task: "Запиши у вигляді степеня", err: err, chk: { pw: [p, r] } });
  };
  G.pwCalc = function () {
    var t = pick([1, 2, 3, 4, 4, 5, 5]), p, js, h, r, e;
    if (t <= 3) {
      var b = pick([2, 2, 3, 3, 5, 10]), fin = b === 2 ? R(2, 5) : b === 10 ? R(2, 3) : b === 3 ? R(2, 4) : R(2, 3);
      if (t === 1) { var m = R(5, 12), n = R(2, 8), q = m + n - fin; p = b + sup(m) + " " + X + " " + b + sup(n) + " : " + b + sup(q); js = b + "**" + m + "*" + b + "**" + n + "/" + b + "**" + q;
        h = ["Не рахуй великі степені! Скористайся властивостями: " + b + sup(m) + " " + X + " " + b + sup(n) + " = " + b + sup(m + n) + ".", b + sup(m + n) + " : " + b + sup(q) + " = " + b + sup(fin) + ". Тепер обчисли."]; }
      else if (t === 2) { var m2 = R(fin + 3, 15), q2 = m2 - fin; p = b + sup(m2) + " : " + b + sup(q2); js = b + "**" + m2 + "/" + b + "**" + q2;
        h = ["При діленні показники віднімаємо: " + m2 + " " + M + " " + q2 + " = " + fin + ".", "Лишилось обчислити " + b + sup(fin) + "."]; }
      else { var mm = R(2, 4), kk = R(2, 3), q3 = mm * kk - fin; if (q3 < 1) { kk = 3; q3 = mm * kk - fin; } if (q3 < 1) { mm = 4; q3 = mm * kk - fin; } p = "(" + b + sup(mm) + ")" + sup(kk) + " : " + b + sup(q3); js = "(" + b + "**" + mm + ")**" + kk + "/" + b + "**" + q3;
        h = ["(" + b + sup(mm) + ")" + sup(kk) + " = " + b + sup(mm * kk) + " — показники множимо.", b + sup(mm * kk) + " : " + b + sup(q3) + " = " + b + sup(fin) + "."]; }
      r = Math.pow(b, fin); e = p + " = " + b + "<sup>" + fin + "</sup> = <b>" + r + "</b>.";
    } else if (t === 4) { // (ab)ⁿ = aⁿbⁿ
      var P = pick([["2", "5", 10, "2*5"], ["0,25", "4", 1, "0.25*4"], ["0,2", "5", 1, "0.2*5"], ["0,5", "4", 2, "0.5*4"], ["1/3", "3", 1, "(1/3)*3"], ["0,5", "6", 3, "0.5*6"], ["2,5", "4", 10, "2.5*4"]]);
      var nn = P[2] === 10 ? R(2, 3) : P[2] === 1 ? R(5, 12) : P[2] === 2 ? R(3, 6) : R(2, 4);
      var A = P[0].indexOf("/") >= 0 ? "(" + P[0] + ")" : P[0];
      p = A + sup(nn) + " " + X + " " + P[1] + sup(nn); js = "(" + P[3].split("*")[0] + ")**" + nn + "*(" + P[3].split("*")[1] + ")**" + nn; r = Math.pow(P[2], nn);
      h = ["Показники однакові! Тоді aⁿ " + X + " bⁿ = (a " + X + " b)ⁿ.", P[0] + " " + X + " " + P[1] + " = " + P[2] + ", тож це " + P[2] + sup(nn) + "."];
      e = p + " = (" + P[0] + " " + X + " " + P[1] + ")" + sup(nn) + " = " + P[2] + "<sup>" + nn + "</sup> = <b>" + r + "</b>.";
    } else { // зведи до однієї основи: 4³ : 2⁵, 27² : 3⁵
      var bs = pick([[2, 4, 2], [2, 8, 3], [3, 9, 2], [3, 27, 3], [5, 25, 2], [2, 16, 4]]), base = bs[0], B = bs[1], ee = bs[2], mB = R(2, 4), fin2 = base === 2 ? R(1, 4) : R(1, 2), qq = ee * mB - fin2;
      if (qq < 1) { mB = 4; qq = ee * mB - fin2; }
      p = B + sup(mB) + " : " + base + sup(qq); js = B + "**" + mB + "/" + base + "**" + qq; r = Math.pow(base, fin2);
      h = ["Запиши " + B + " як степінь " + base + ": " + B + " = " + base + sup(ee) + ".", B + sup(mB) + " = (" + base + sup(ee) + ")" + sup(mB) + " = " + base + sup(ee * mB) + ". Тепер поділи."];
      e = B + sup(mB) + " : " + base + sup(qq) + " = " + base + sup(ee * mB) + " : " + base + sup(qq) + " = " + base + (fin2 > 1 ? "<sup>" + fin2 + "</sup>" : "") + (fin2 > 1 ? " = <b>" + r + "</b>." : " = <b>" + r + "</b>.").replace(base + " = <b>" + base + "</b>", "<b>" + base + "</b>");
    }
    return num(p + " = ___", r, h, e, { task: "Обчисли зручно", chk: { v: js } });
  };
  /* одночлен: {a:2, b:1} → «a²b», лише наявні букви */
  function lettersD(v) { var s = ""; Object.keys(v).sort().forEach(function (k) { if (v[k] > 0) s += k + sup(v[k]); }); return s; }
  function degD(v) { var ks = Object.keys(v).sort().filter(function (k) { return v[k] > 0; }); return ks.map(function (k) { return v[k]; }).join(" + "); }
  function degN(v) { var s = 0; for (var k in v) s += v[k]; return s; }
  /* розкиданий добуток: 3a · (−2) · b · a · b² */
  function scatter() {
    var c1 = RNZ(-6, 6), c2 = RNZ(-5, 5), parts = [], vars = { a: 0, b: 0 }, js = [];
    while (Math.abs(c1) === 1) c1 = RNZ(-6, 6);
    if (c1 > 0 && c2 > 0 && Math.random() < 0.7) c2 = -c2;
    parts.push(String(c1) === String(Math.abs(c1)) ? c1 + "a" : M + Math.abs(c1) + "a"); vars.a += 1; js.push("(" + c1 + ")*a");
    var ea = R(1, 3), eb = R(1, 3), eb2 = R(0, 2);
    parts.push(c2 < 0 ? "(" + sn(c2) + ")" : String(c2)); js.push("(" + c2 + ")");
    parts.push("b" + sup(eb)); vars.b += eb; js.push("b**" + eb);
    parts.push("a" + sup(ea)); vars.a += ea; js.push("a**" + ea);
    if (eb2) { parts.push("b" + sup(eb2)); vars.b += eb2; js.push("b**" + eb2); }
    return { d: parts.join(" " + X + " "), js: js.join("*"), c: c1 * c2, v: vars };
  }
  G.mStd = function (o) {
    o = o || {};
    var t = o.t || pick(["coef", "deg", "std", "std", "is", "one"]);
    if (t === "coef" || t === "deg") {
      var s = scatter(), std = monoD(s.c, s.v);
      if (t === "deg") return num(s.d + "\nстепінь: ___", degN(s.v),
        ["Спершу зведи до стандартного вигляду: " + std + ".", "Степінь одночлена — сума показників усіх змінних: " + degD(s.v) + "."],
        s.d + " = " + std + "; степінь " + degD(s.v) + " = <b>" + degN(s.v) + "</b>.", { task: "Знайди степінь одночлена", err: errs([[Math.abs(s.c), "Це коефіцієнт. Степінь — сума показників букв."]], degN(s.v)), chk: { v: String(degN(s.v)) } });
      return num(s.d + "\nкоефіцієнт: ___", sn(s.c),
        ["Коефіцієнт — числовий множник. Перемнож усі числа в добутку.", "Числа тут: " + s.d.split(" " + X + " ").filter(function (x) { return /\d/.test(x) && !/[ab]/.test(x); }).concat([s.d.split(" " + X + " ")[0].replace(/a$/, "")]).reverse().join(" і ") + "."],
        s.d + " = <b>" + std + "</b>. Коефіцієнт — <b>" + sn(s.c) + "</b>.",
        { task: "Знайди коефіцієнт одночлена", err: errs([[sn(-s.c), "Перевір знак добутку."]], sn(s.c)), chk: { v: String(s.c) } });
    }
    if (t === "std") {
      var s2 = scatter(), right = monoD(s2.c, s2.v), va = { a: s2.v.a - 1, b: s2.v.b };
      if (va.a === 0) va.a = s2.v.a + 1;
      var wc = monoD(-s2.c, s2.v), we = monoD(s2.c, va), wce = monoD(-s2.c, va), err = {};
      err[wc] = "Перевір знак: " + s2.d.split(" " + X + " ")[0].replace(/a$/, "") + " " + X + " " + s2.d.split(" " + X + " ")[1] + " = " + sn(s2.c) + ".";
      err[we] = "Порахуй усі «a»: окреме «a» — це a¹. Показники однакових букв додаємо.";
      err[wce] = err[wc] + " " + err[we];
      return choice("Запиши одночлен у стандартному вигляді", s2.d + " = ___", right, [wc, we, wce],
        ["Стандартний вигляд: спершу число (перемнож усі числа), потім кожна буква один раз.", "Показники однакових букв додаємо; «a» без показника — це a¹."],
        "Числа: " + sn(s2.c) + "; a: " + s2.v.a + ", b: " + s2.v.b + " → <b>" + right + "</b>.",
        { err: err, chk: { src: s2.js, vars: ["a", "b"] } });
    }
    if (t === "is") {
      var c = RNZ(-9, 9), v = { a: R(1, 3), b: R(0, 2) }, mono = monoD(c, v);
      var wr = shuffle([R(2, 9) + "a + b", "x " + M + " " + R(1, 9), R(2, 9) + " : x", "a² " + M + " b²", R(2, 9) + "(x + 1)"]).slice(0, 3);
      return choice("Який із виразів — одночлен", "Обери одночлен", mono, wr,
        ["Одночлен — це <b>добуток</b> чисел і змінних (і їхніх степенів). Без «+» і «−» між доданками і без ділення на змінну.", "Шукай вираз, де є лише множення: число, букви, степені."],
        "<b>" + mono + "</b> — добуток числа і змінних, тож це одночлен. Решта містять суму, різницю або ділення на змінну.",
        { long: true, chk: { mono: mono } });
    }
    // коефіцієнт «невидимий»: −a²b → −1, a³b → 1
    var sg = pick([1, -1]), vv = { a: R(1, 4), b: R(1, 3) }, md = (sg < 0 ? M : "") + lettersD(vv);
    return num(md + "\nкоефіцієнт: ___", sn(sg),
      ["Перед буквами не написано число — отже, там 1 (або " + M + "1, якщо стоїть мінус).", md + " = " + sn(sg) + " " + X + " " + lettersD(vv) + "."],
      md + " = " + sn(sg) + " " + X + " " + lettersD(vv) + ", коефіцієнт <b>" + sn(sg) + "</b>.",
      { task: "Знайди коефіцієнт одночлена", err: errs([[sn(-sg), "Перевір знак: " + (sg < 0 ? "мінус перед буквами — коефіцієнт " + M + "1." : "мінуса немає — коефіцієнт 1.")]], sn(sg)), chk: { v: String(sg) } });
  };
  G.mMul = function () {
    var pow = Math.random() < 0.45, right, src, srcJ, h, e, wc, we, wce, mc, me;
    if (!pow) { var c1 = RNZ(-6, 6), c2 = RNZ(-6, 6), v1 = { a: R(1, 4), b: R(1, 3) }, v2 = { a: R(1, 4), b: R(1, 3) };
      while (Math.abs(c1 * c2) === 1) c2 = RNZ(-6, 6);
      if (c1 > 0 && c2 > 0 && Math.random() < 0.7) c1 = -c1;
      src = "(" + monoD(c1, v1) + ") " + X + " (" + monoD(c2, v2) + ")"; srcJ = monoJ(c1, v1) + "*" + monoJ(c2, v2);
      var sv = { a: v1.a + v2.a, b: v1.b + v2.b }, mv = { a: v1.a * v2.a, b: v1.b * v2.b };
      if (mv.a === sv.a && mv.b === sv.b) mv = { a: sv.a + 1, b: sv.b };
      right = monoD(c1 * c2, sv); wc = monoD(-c1 * c2, sv); we = monoD(c1 * c2, mv); wce = monoD(-c1 * c2, mv);
      mc = "Знак: " + sn(c1) + " " + X + " " + pn(c2) + " = " + sn(c1 * c2) + "."; me = "При множенні степенів показники <b>додаються</b>: a" + sup(v1.a) + " " + X + " a" + sup(v2.a) + " = a" + sup(sv.a) + ".";
      h = ["Коефіцієнти перемножуємо: " + sn(c1) + " " + X + " " + pn(c2) + " = " + sn(c1 * c2) + ".", "Степені з однаковою основою — показники додаємо: a" + sup(v1.a) + " " + X + " a" + sup(v2.a) + " = a" + sup(sv.a) + "."];
      e = "Коефіцієнти: " + sn(c1 * c2) + "; a: " + v1.a + " + " + v2.a + " = " + sv.a + "; b: " + v1.b + " + " + v2.b + " = " + sv.b + ". Разом <b>" + right + "</b>."; }
    else { var c = RNZ(-3, 3), n = R(2, 3), v = { a: R(1, 4), b: R(1, 3) }; if (Math.abs(c) === 1) c = c * 2;
      src = "(" + monoD(c, v) + ")" + sup(n); srcJ = "(" + monoJ(c, v) + ")**" + n;
      var cn = Math.pow(c, n), pv = { a: v.a * n, b: v.b * n }, av = { a: v.a + n, b: v.b + n };
      if (av.a === pv.a && av.b === pv.b) av = { a: pv.a + 1, b: pv.b };
      var cw = c * n !== cn ? c * n : -cn;
      right = monoD(cn, pv); wc = monoD(cw, pv); we = monoD(cn, av); wce = monoD(cw, av);
      mc = cw === -cn ? "Знак: " + pn(c) + sup(n) + " = " + sn(cn) + "." : "До степеня підносимо і коефіцієнт: " + pn(c) + sup(n) + " = " + sn(cn) + ", а не " + sn(c) + " " + X + " " + n + ".";
      me = "Степінь у степені — показники <b>множаться</b>: (a" + sup(v.a) + ")" + sup(n) + " = a" + sup(v.a * n) + ".";
      h = ["До степеня підносимо <b>кожен</b> множник: і коефіцієнт, і кожну букву.", pn(c) + sup(n) + " = " + sn(cn) + "; (a" + sup(v.a) + ")" + sup(n) + " = a" + sup(v.a * n) + " — показники множимо."];
      e = pn(c) + sup(n) + " = " + sn(cn) + "; показники: " + v.a + " " + X + " " + n + " = " + v.a * n + ", " + v.b + " " + X + " " + n + " = " + v.b * n + ". Разом <b>" + right + "</b>."; }
    var err = {}; err[wc] = mc; err[we] = me; err[wce] = mc + " " + me;
    return choice(pow ? "Піднеси одночлен до степеня" : "Перемнож одночлени", src + " = ___", right, [wc, we, wce], h, e, { err: err, chk: { src: srcJ, vars: ["a", "b"] } });
  };
  /* =================== Розділ 2: многочлени (§10–15) =================== */
  function xv(n) { return n === 0 ? "" : n === 1 ? "x" : "x" + sup(n); }
  /* многочлен від x: coefs[i] — коефіцієнт при xⁱ → терміни за спаданням степенів */
  function pX(coefs) { var t = []; for (var i = coefs.length - 1; i >= 0; i--) if (coefs[i]) t.push([coefs[i], xv(i)]); return t; }
  function pXD(coefs) { return polyD(pX(coefs)); }
  function pXJ(coefs) { return coefs.map(function (c, i) { return "(" + c + ")*x**" + i; }).join("+"); }
  function grid(right, wA, wB, wAB, mA, mB) { var e = {}; e[wA] = mA; e[wB] = mB; e[wAB] = mA + " " + mB; return { o: [wA, wB, wAB], err: e }; }
  /* §10: стандартний вигляд многочлена */
  G.pStd = function () {
    var a1, a2, b1, b2, c1, c2;
    do { a1 = RNZ(-7, 7); a2 = RNZ(-7, 7); b1 = RNZ(-9, 9); b2 = RNZ(-9, 9); c1 = RNZ(-9, 9); c2 = RNZ(-9, 9); }
    while (a1 + a2 === 0 || b1 + b2 === 0 || a1 - a2 === 0 || b1 - b2 === 0 || Math.abs(a1 - a2) === Math.abs(a1 + a2) || Math.abs(b1 - b2) === Math.abs(b1 + b2));
    var terms = shuffle([[a1, "x²"], [b1, "x"], [c1, ""], [a2, "x²"], [b2, "x"]]); if (Math.random() < 0.5) terms.push([c2, ""]); else c2 = 0;
    var src = polyD(terms), C = c1 + c2, right = pXD([C, b1 + b2, a1 + a2]);
    var g = grid(right, pXD([C, b1 + b2, a1 - a2]), pXD([C, b1 - b2, a1 + a2]), pXD([C, b1 - b2, a1 - a2]),
      "x²: " + sn(a1) + (a2 < 0 ? " " + M + " " + (-a2) : " + " + a2) + " = " + sn(a1 + a2) + " — знак належить доданку.", "x: " + sn(b1) + (b2 < 0 ? " " + M + " " + (-b2) : " + " + b2) + " = " + sn(b1 + b2) + " — знак належить доданку.");
    return choice("Зведи подібні члени і запиши в стандартному вигляді", src + " = ___", right, g.o,
      ["Подібні члени — з однаковою буквеною частиною: окремо x², окремо x, окремо числа.", "Стандартний вигляд — за спаданням степенів: спершу x², потім x, потім число."],
      "x²: " + sn(a1 + a2) + "; x: " + sn(b1 + b2) + "; числа: " + sn(C) + ". Разом <b>" + right + "</b>.",
      { err: g.err, chk: { src: polyJ(terms.map(function (t) { return [t[0], t[1] === "x²" ? "x*x" : t[1]]; })), vars: ["x"] } });
  };
  G.pDeg = function () {
    var n = R(2, 3), terms = [], best = 0, js = [];
    for (var i = 0; i < n; i++) { var v = { x: R(0, 4), y: R(0, 3) }; if (!v.x && !v.y) v.x = 1; var c = RNZ(-9, 9); terms.push(monoD(c, v, i === 0 ? true : false)); best = Math.max(best, v.x + v.y); js.push(v.x + v.y); }
    if (Math.random() < 0.5) terms.push(monoD(RNZ(-9, 9), {}, false));
    var src = terms.join("");
    return num(src + "\nстепінь: ___", best,
      ["Степінь многочлена — найбільший зі степенів його членів (многочлен уже в стандартному вигляді).", "Степінь члена — сума показників його букв: " + js.join(", ") + "."],
      "Степені членів: " + js.join(", ") + (terms.length > n ? ", 0" : "") + ". Найбільший — <b>" + best + "</b>.",
      { task: "Знайди степінь многочлена", err: errs([[js.reduce(function (a, b) { return a + b; }, 0), "Степені членів не додаємо — беремо <b>найбільший</b>."]], best), chk: { v: String(Math.max.apply(null, js)) } });
  };
  /* §11: додавання і віднімання */
  G.pAdd = function () {
    var P = [RNZ(-9, 9), RNZ(-9, 9), RNZ(-6, 6)], Q = [RNZ(-9, 9), RNZ(-9, 9), RNZ(-6, 6)], minus = Math.random() < 0.7, s = minus ? -1 : 1;
    var Rr = [P[0] + s * Q[0], P[1] + s * Q[1], P[2] + s * Q[2]];
    if (!Rr[2] || !Rr[1]) return G.pAdd();
    var src = "(" + pXD(P) + ")" + (minus ? " " + M + " " : " + ") + "(" + pXD(Q) + ")";
    var srcJ = "(" + pXJ(P) + ")" + (minus ? "-" : "+") + "(" + pXJ(Q) + ")";
    var right = pXD(Rr), wA, wB, wAB, mA, mB;
    if (minus) { wA = pXD([Rr[0], P[1] + Q[1], Rr[2]]); wB = pXD([P[0] + Q[0], Rr[1], Rr[2]]); wAB = pXD([P[0] + Q[0], P[1] + Q[1], Rr[2]]);
      mA = "Мінус перед дужками змінює знак <b>кожного</b> члена: і " + polyD([[Q[1], "x"]]) + " теж."; mB = "Мінус перед дужками змінює знак і числа: " + M + "(" + sn(Q[0]) + ") = " + sn(-Q[0]) + "."; }
    else { wA = pXD([Rr[0], P[1] - Q[1], Rr[2]]); wB = pXD([P[0] - Q[0], Rr[1], Rr[2]]); wAB = pXD([P[0] - Q[0], P[1] - Q[1], Rr[2]]);
      mA = "x: " + sn(P[1]) + (Q[1] < 0 ? " " + M + " " + (-Q[1]) : " + " + Q[1]) + " = " + sn(Rr[1]) + "."; mB = "Числа: " + sn(P[0]) + (Q[0] < 0 ? " " + M + " " + (-Q[0]) : " + " + Q[0]) + " = " + sn(Rr[0]) + "."; }
    if (wA === wB || wA === right || wB === right) return G.pAdd();
    var g = grid(right, wA, wB, wAB, mA, mB);
    var open = pXD(P) + (minus ? " " + M + " " + pXD(Q).replace(/^−/, "§").replace(/ \+ /g, " ‡ ").replace(/ − /g, " + ").replace(/ ‡ /g, " − ").replace(/^§/, "").replace(/^/, "") : " + " + pXD(Q));
    if (minus) open = pXD(P) + " " + polyD(pX(Q.map(function (c) { return -c; }))).replace(/^(?!−)/, "+ ").replace(/^−/, M + " ");
    return choice(minus ? "Відніми многочлени" : "Додай многочлени", src + " = ___", right, g.o,
      [minus ? "Розкрий дужки: мінус перед дужками змінює знак <b>кожного</b> члена другого многочлена." : "Плюс перед дужками — просто прибираємо дужки.", "Потім зведи подібні: окремо x², x і числа."],
      open + " = <b>" + right + "</b>.", { err: g.err, chk: { src: srcJ, vars: ["x"] } });
  };
  /* §12: одночлен на многочлен */
  G.pMono = function () {
    var k = RNZ(-5, 5), m = R(1, 2), A = [RNZ(-6, 6), RNZ(-6, 6), RNZ(-4, 4)]; if (Math.abs(k) === 1 && Math.random() < 0.6) k = k * 2;
    var mono = (k === -1 ? M : k === 1 ? "" : sn(k)) + xv(m), src = mono + "(" + pXD(A) + ")", srcJ = "(" + k + ")*x**" + m + "*(" + pXJ(A) + ")";
    var Rc = [0, 0, 0, 0, 0]; for (var i = 0; i < 3; i++) Rc[i + m] = k * A[i];
    var right = pXD(Rc);
    var wE = Rc.slice(); wE[m + 2] -= k * A[2]; wE[2] += k * A[2]; // x^m · x² → x² (показники не додала)
    var wC = Rc.slice(); wC[m] -= k * A[0]; wC[0] += k * A[0];     // число не помножила на x^m
    var wEC = wE.slice(); wEC[m] -= k * A[0]; wEC[0] += k * A[0];
    var oA = pXD(wE), oB = pXD(wC), oAB = pXD(wEC);
    if (oA === right || oB === right || oAB === right || oA === oB || oA === oAB || oB === oAB) return G.pMono();
    var g = grid(right, oA, oB, oAB, "Множачи степені, показники додаємо: " + xv(m) + " " + X + " x² = " + xv(m + 2) + ".", "Число в дужках теж множимо на " + mono + ": " + mono + " " + X + " " + pn(A[0]) + " = " + polyD([[k * A[0], xv(m)]]) + ".");
    return choice("Помнож одночлен на многочлен", src + " = ___", right, g.o,
      ["Помнож " + mono + " на <b>кожен</b> член многочлена.", "Коефіцієнти перемножуємо, показники x додаємо: " + xv(m) + " " + X + " x² = " + xv(m + 2) + "."],
      src + " = " + [2, 1, 0].map(function (i) { return "(" + mono + ") " + X + " (" + polyD([[A[i], xv(i)]]) + ")"; }).join(" + ") + " = <b>" + right + "</b>.",
      { err: g.err, chk: { src: srcJ, vars: ["x"] } });
  };
  G.pMonoEq = function () {
    var k = RNZ(-4, 4), a = RNZ(-8, 8), x = RNZ(-9, 9), c = R(-12, 12);
    if (Math.abs(k) === 1 && Math.random() < 0.5) k = 2 * k;
    var b = k * a * x + c; // k·x(x + a) − k·x² + c… → kax + c = b
    var Ld = (k === 1 ? "" : k === -1 ? M : sn(k)) + "x(" + polyD([[1, "x"], [a, ""]]) + ") " + (k > 0 ? M + " " + polyD([[k, "x²"]]) : "+ " + polyD([[-k, "x²"]])) + (c ? (c < 0 ? " " + M + " " + (-c) : " + " + c) : "");
    return num(Ld + " = " + sn(b) + "\nx = ___", sn(x),
      ["Розкрий дужки: " + (k === 1 ? "" : k === -1 ? M : sn(k)) + "x(" + polyD([[1, "x"], [a, ""]]) + ") = " + polyD([[k, "x²"], [k * a, "x"]]) + ".", "Члени з x² знищуються, лишається лінійне рівняння: " + polyD([[k * a, "x"], [c, ""]]) + " = " + sn(b) + "."],
      polyD([[k, "x²"], [k * a, "x"]]) + (k > 0 ? " " + M + " " + polyD([[k, "x²"]]) : " + " + polyD([[-k, "x²"]])) + (c ? (c < 0 ? " " + M + " " + (-c) : " + " + c) : "") + " = " + sn(b) + " → " + tail(k * a, b - c, sn(x)) + ".",
      { task: "Розв'яжи рівняння", err: errs([[sn(-x), "Перевір знаки: " + sn(k) + " " + X + " " + pn(a) + " = " + sn(k * a) + "."]], sn(x)), chk: { eq: "(" + k + ")*x*(x+(" + a + "))-(" + k + ")*x**2+(" + c + ")", r: String(b) } });
  };
  /* §13: винесення спільного множника */
  G.pFac = function () {
    if (Math.random() < 0.3) { // обчисли зручно: 37 · 64 + 37 · 36
      var a = R(13, 89), s = pick([10, 100, 100, 50]), b = R(s > 10 ? 11 : 2, s - 2), plus = Math.random() < 0.6, c = plus ? s - b : b - s;
      if (!plus) { b = R(s + 2, s + 40); c = b - s; }
      var p = plus ? a + " " + X + " " + b + " + " + a + " " + X + " " + c : a + " " + X + " " + b + " " + M + " " + a + " " + X + " " + c, r = a * s;
      return num(p + " = ___", r,
        ["У двох добутках є спільний множник " + a + ". Винеси його за дужки.", a + " " + X + " (" + b + (plus ? " + " : " " + M + " ") + c + ") = " + a + " " + X + " " + s + "."],
        p + " = " + a + " " + X + " (" + b + (plus ? " + " : " " + M + " ") + c + ") = " + a + " " + X + " " + s + " = <b>" + r + "</b>.",
        { task: "Обчисли зручним способом", chk: { v: a + "*" + b + (plus ? "+" : "-") + a + "*" + c } });
    }
    var k = R(2, 6), m = R(0, 2), u, w, three = Math.random() < 0.4, z = 0;
    do { u = RNZ(-6, 6); w = RNZ(-7, 7); z = three ? RNZ(-5, 5) : 0; } while (gcd(gcd(u, w), z || w) !== 1 || (k === 1 && m === 0));
    if (m === 0 && k === 1) k = 2;
    var e1 = R(1, 2), sg = Math.random() < 0.25 ? -1 : 1;
    if (u < 0) { u = -u; w = -w; z = -z; } // у дужках — додатний перший член (від'ємний множник виносимо разом з мінусом)
    var inner = three ? [[u, xv(e1 + 1)], [w, xv(e1)], [z, ""]] : [[u, xv(e1)], [w, ""]];
    var G1 = sg * k, gD = (G1 === -1 ? M : G1 === 1 ? "" : sn(G1)) + xv(m), gJ = "(" + G1 + ")*x**" + m;
    var exp = inner.map(function (t) { var pw = (t[1] === "" ? 0 : t[1] === "x" ? 1 : SUP.indexOf(t[1].slice(1)) ) + m; return [G1 * t[0], xv(pw)]; });
    var src = polyD(exp), right = gD + "(" + polyD(inner) + ")";
    var badLast = inner.slice(); badLast[badLast.length - 1] = [-badLast[badLast.length - 1][0], ""];
    var badFirst = inner.slice(); badFirst[0] = [-badFirst[0][0], badFirst[0][1]];
    var badBoth = inner.slice(); badBoth[0] = badFirst[0]; badBoth[badBoth.length - 1] = badLast[badLast.length - 1];
    var oA = gD + "(" + polyD(badFirst) + ")", oB = gD + "(" + polyD(badLast) + ")", oAB = gD + "(" + polyD(badBoth) + ")";
    var g = grid(right, oA, oB, oAB, "Перевір перший член: " + gD + " " + X + " " + polyD([inner[0]]) + " = " + polyD([exp[0]]) + ".", "Перевір останній член: " + gD + " " + X + " " + pn(inner[inner.length - 1][0]) + " = " + polyD([exp[exp.length - 1]]) + ".");
    return choice("Винеси спільний множник за дужки", src + " = ___", right, g.o,
      ["Спільний множник: найбільше число, на яке діляться всі коефіцієнти, і x у найменшому степені, що є в кожному члені.", "Тут це " + gD + ". Поділи кожен член на " + gD + " — це і буде в дужках."],
      "Спільний множник " + gD + ". " + exp.map(function (t, i) { return polyD([t]) + " : " + (G1 < 0 ? "(" + gD + ")" : gD) + " = " + polyD([inner[i]]); }).join("; ") + ". Отже, <b>" + right + "</b>.",
      { err: g.err, chk: { src: polyJ(exp.map(function (t) { return [t[0], t[1] ? "x**" + (t[1] === "x" ? 1 : SUP.indexOf(t[1].slice(1))) : ""]; })).replace(/\*x\*\*/g, "*x**"), vars: ["x"] } });
  };
  /* §14: многочлен на многочлен */
  G.pMul = function () {
    var a = pick([1, 1, 2, 3]), c = pick([1, 1, 2]), b = RNZ(-7, 7), d = RNZ(-7, 7);
    var M2 = a * d + b * c; if (M2 === 0) return G.pMul();
    var right = pXD([b * d, M2, a * c]);
    var miss = Math.random() < 0.5, wMid = miss ? 0 : -M2;
    var oA = pXD([b * d, wMid, a * c]), oB = pXD([-b * d, M2, a * c]), oAB = pXD([-b * d, wMid, a * c]);
    var mA = miss ? "Не загуби «середні» добутки: " + polyD([[a, "x"]]) + " " + X + " " + pn(d) + " і " + pn(b) + " " + X + " " + polyD([[c, "x"]]) + " — разом " + polyD([[M2, "x"]]) + "." : "Середній член: " + polyD([[a * d, "x"]]) + (b * c < 0 ? " " + M + " " : " + ") + polyD([[Math.abs(b * c), "x"]]) + " = " + polyD([[M2, "x"]]) + ".";
    var g = grid(right, oA, oB, oAB, mA, "Число: " + pn(b) + " " + X + " " + pn(d) + " = " + sn(b * d) + ".");
    var L1 = "(" + polyD([[a, "x"], [b, ""]]) + ")", L2 = "(" + polyD([[c, "x"], [d, ""]]) + ")";
    return choice("Помнож многочлени", L1 + L2 + " = ___", right, g.o,
      ["Кожен член першого многочлена множимо на <b>кожен</b> член другого — вийде 4 добутки.", polyD([[a, "x"]]) + " " + X + " " + polyD([[c, "x"]]) + ", " + polyD([[a, "x"]]) + " " + X + " " + pn(d) + ", " + pn(b) + " " + X + " " + polyD([[c, "x"]]) + ", " + pn(b) + " " + X + " " + pn(d) + "."],
      L1 + L2 + " = " + polyD([[a * c, "x²"], [a * d, "x"], [b * c, "x"], [b * d, ""]]) + " = <b>" + right + "</b>.",
      { err: g.err, chk: { src: "(" + a + "*x+(" + b + "))*(" + c + "*x+(" + d + "))", vars: ["x"] } });
  };
  G.pMulEq = function () {
    var a, b, x, c;
    do { a = RNZ(-8, 8); b = RNZ(-8, 8); x = RNZ(-9, 9); c = (a + b) * x + a * b; } while (a + b === 0 || Math.abs(c) > 60);
    var L = "(" + polyD([[1, "x"], [a, ""]]) + ")(" + polyD([[1, "x"], [b, ""]]) + ") " + M + " x²";
    return num(L + " = " + sn(c) + "\nx = ___", sn(x),
      ["Перемнож дужки: (" + polyD([[1, "x"], [a, ""]]) + ")(" + polyD([[1, "x"], [b, ""]]) + ") = " + polyD([[1, "x²"], [a + b, "x"], [a * b, ""]]) + ".", "x² і " + M + "x² знищуються: " + polyD([[a + b, "x"], [a * b, ""]]) + " = " + sn(c) + "."],
      polyD([[1, "x²"], [a + b, "x"], [a * b, ""]]) + " " + M + " x² = " + sn(c) + " → " + polyD([[a + b, "x"]]) + " = " + sn(c - a * b) + " → x = <b>" + sn(x) + "</b>.",
      { task: "Розв'яжи рівняння", err: errs(Number.isInteger(c / (a + b)) ? [[sn(c / (a + b)), "Не загуби добуток чисел: " + pn(a) + " " + X + " " + pn(b) + " = " + sn(a * b) + "."]] : [], sn(x)), chk: { eq: "(x+(" + a + "))*(x+(" + b + "))-x**2", r: String(c) } });
  };
  /* §15: групування */
  G.pGrp = function () {
    var s = RNZ(-5, 5), r = RNZ(-6, 6), V = pick([["a", "x", "y"], ["b", "m", "n"], ["c", "x", "y"]]), A = V[0], P = V[1], Q = V[2];
    if (Math.abs(r) === Math.abs(s)) r = r > 0 ? r + 1 : r - 1;
    var t = [[1, A + P], [s, A + Q], [r, P], [r * s, Q]];
    if (Math.random() < 0.5) t = [t[0], t[2], t[1], t[3]];
    var src = polyD(t), f1 = "(" + polyD([[1, P], [s, Q]]) + ")", f2 = "(" + polyD([[1, A], [r, ""]]) + ")";
    var right = f1 + f2, f1b = "(" + polyD([[1, P], [-s, Q]]) + ")", f2b = "(" + polyD([[1, A], [-r, ""]]) + ")";
    var g = grid(right, f1b + f2, f1 + f2b, f1b + f2b, "Перевір знак перед " + Q + ": " + polyD([[1, A + P], [s, A + Q]]) + " = " + A + f1 + ".", "Перевір знак числа: " + polyD([[r, P], [r * s, Q]]) + " = " + sn(r) + f1 + ".");
    var srcJ = polyJ(t.map(function (x) { return [x[0], x[1].length === 2 ? x[1].charAt(0) + "*" + x[1].charAt(1) : x[1]]; }));
    return choice("Розклади на множники способом групування", src + " = ___", right, g.o,
      ["Згрупуй члени з «" + A + "» і без нього: (" + polyD([[1, A + P], [s, A + Q]]) + ") + (" + polyD([[r, P], [r * s, Q]]) + ").", "З першої групи винеси " + A + ", з другої — " + sn(r) + ". У дужках вийде однаковий вираз " + f1 + " — винеси і його."],
      polyD([[1, A + P], [s, A + Q], [r, P], [r * s, Q]]) + " = " + A + f1 + (r < 0 ? " " + M + " " + (-r) : " + " + r) + f1 + " = <b>" + right + "</b>.",
      { err: g.err, chk: { src: srcJ, vars: [A, P, Q] } });
  };
})();
