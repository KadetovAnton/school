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
  function hash(t) { var x = 0; for (var i = 0; i < t.length; i++) x = (x * 31 + t.charCodeAt(i)) | 0; return (x >>> 0).toString(36); }
  function num(p, a, h, e, extra) {
    var it = { type: "num", kb: "alg", task: "Обчисли", p: p.replace(" = ___", "\u00a0=\u00a0___"), a: String(a), h: h, e: e };
    for (var k in extra || {}) it[k] = extra[k];
    if (it.pic) it.uid = hash(it.pic); // умова — на малюнку: різні завдання з однаковим текстом
    return it;
  }
  function choice(task, p, right, wrong, h, e, extra) {
    var o = [right], seen = {}; seen[right] = 1;
    wrong.forEach(function (w) { if (!seen[w] && o.length < 4) { seen[w] = 1; o.push(w); } });
    var it = { type: "choice", task: task, p: p.replace(" = ___", "\u00a0=\u00a0___"), o: shuffle(o), a: right, h: h, e: e };
    if (seen["Так"] && seen["Ні"] && o.length === 2) it.o = ["Так", "Ні"];
    if (seen["Один корінь"]) it.o = ["Один корінь", "Жодного кореня", "Безліч коренів"];
    for (var k in extra || {}) it[k] = extra[k];
    if (it.pic) it.uid = hash(it.pic);
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
  G.nAdd = function (o) {
    o = o || {};
    if (!o.easy && Math.random() < 0.25) { // −2/3 + 1/2
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
    parts = parts.filter(function (t) { return !((t[1] === null && t[0] === 0) || t[1] === 0); });
    if (!parts.length) return "0";
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
  G.eSimple = function (o) {
    o = o || {};
    var t = o.easy ? pick([1, 3]) : R(1, 4), x, a, p, h, e, eq, err = {};
    for (;;) { x = RNZ(-12, 12); a = RNZ(-9, 9); if (o.easy) { if (x < 0 || a < 0 || (t === 3 && a === 1)) continue; break; } if (t === 1 && x > 0 && a > 0) continue; if (Math.abs(a) === 1 && t > 2) continue; break; }
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
  G.eLin1 = function (o) {
    o = o || {};
    var t = o.easy ? 0.99 : Math.random(), a, x, b, c, m;
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
    while (Math.abs(a) === 1 || (frac && (m % a === 0 || Math.abs(c) > 50)) || (o.easy && (a < 0 || x < 0)));
    var ans = fr(m, a), w = (c + b) / a;
    return num(polyD([[a, "x"], [b, ""]]) + " = " + sn(c) + "\nx = ___", ans,
      ["Перенеси " + sn(b) + " у праву частину, змінивши знак: " + sn(a) + "x = " + sn(c) + (b < 0 ? " + " + (-b) : " " + M + " " + b) + ".", sn(a) + "x = " + sn(m) + ". Тепер поділи на " + sn(a) + "." + (frac ? " Націло не ділиться — відповідь буде дробом (можна 7/2 або 3,5)." : "")],
      sn(a) + "x = " + sn(c) + (b < 0 ? " + " + (-b) : " " + M + " " + b) + " = " + sn(m) + "; x = " + sn(m) + " : " + pn(a) + " = <b>" + ans + "</b>.",
      { task: "Розв'яжи рівняння", err: errs([[Number.isInteger(w) ? sn(w) : fr(c + b, a), "Переносячи доданок в іншу частину, змінюй його знак: " + sn(b) + " → " + sn(-b) + "."], [fr(-m, a), "Ділимо на " + sn(a) + " разом зі знаком."]], ans),
        chk: { eq: polyJ([[a, "x"], [b, ""]]), r: String(c) } });
  };
  G.eLin2 = function (o) {
    o = o || {};
    var a, c, x, b, d, frac = !o.easy && Math.random() < 0.2, k, m;
    do { a = RNZ(-9, 9); c = RNZ(-9, 9); b = RNZ(-15, 15); k = a - c;
      if (frac) { d = RNZ(-20, 20); m = d - b; } else { x = RNZ(-9, 9); d = a * x + b - c * x; m = d - b; } }
    while (a === c || Math.abs(d) > 40 || (frac && (m % k === 0 || Math.abs(k) === 1)) || (o.easy && (x < 0 || a - c < 0)));
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
    var t = o.t === "hard" ? R(2, 3) : o.easy ? 1 : R(1, 3), p, js, r, h, e, err = {}, ans;
    if (t === 1) { var a = RNZ(-6, 6), b = RNZ(-6, 6), P = RNZ(-7, 7), Q = RNZ(-7, 7); if (o.easy) { a = Math.abs(a); b = Math.abs(b); }
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
  function pX(coefs) { var t = []; for (var i = coefs.length - 1; i >= 0; i--) if (coefs[i]) t.push([coefs[i], xv(i)]); return t; }
  function pXD(coefs) { return polyD(pX(coefs)); }
  function pXJ(coefs) { return coefs.map(function (c, i) { return "(" + c + ")*x**" + i; }).join("+"); }
  function px(n) { return n === 0 ? 0 : n; }
  /* «множник · член» для пояснень: (−4x²) · (−x³), 3 · 5x */
  function par(d) { return /^−/.test(d) ? "(" + d + ")" : d; }
  /* продовження суми членом зі знаком: « − 3x²», « + 5» */
  function tailT(c, v) { return c === 0 ? "" : (c < 0 ? " " + M + " " : " + ") + ((Math.abs(c) === 1 && v) ? "" : Math.abs(c)) + v; }
  function opts(right, list) { var o = [], e = {}, seen = {}; seen[right] = 1; list.forEach(function (x) { if (!seen[x[0]] && o.length < 3) { seen[x[0]] = 1; o.push(x[0]); e[x[0]] = x[1]; } }); return { o: o, err: e }; }
  /* §10: стандартний вигляд */
  G.pStd = function () {
    var a1, a2, b1, b2, c1, c2;
    do { a1 = RNZ(-7, 7); a2 = RNZ(-7, 7); b1 = RNZ(-9, 9); b2 = RNZ(-9, 9); c1 = RNZ(-9, 9); c2 = RNZ(-9, 9); }
    while (a1 + a2 === 0 || b1 + b2 === 0 || c1 + c2 === 0 || a1 - a2 === 0 || b1 - b2 === 0 || Math.abs(a1 - a2) === Math.abs(a1 + a2) || Math.abs(b1 - b2) === Math.abs(b1 + b2));
    var V = Math.random() < 0.35 ? ["a²b", "ab²"] : ["x²", "x"], c0 = V[0] === "x²";
    var terms = shuffle([[a1, V[0]], [b1, V[1]], [c1, ""], [a2, V[0]], [b2, V[1]], [c2, ""]]);
    var A = a1 + a2, B = b1 + b2, C = c1 + c2, right = polyD([[A, V[0]], [B, V[1]], [C, ""]]);
    var g = opts(right, [
      [polyD([[a1 - a2, V[0]], [B, V[1]], [C, ""]]), V[0] + ": " + sn(a1) + tailT(a2, "") + " = " + sn(A) + " — знак належить члену."],
      [polyD([[A, c0 ? "x⁴" : "a⁴b²"], [B, c0 ? "x²" : "a²b⁴"], [C, ""]]), "Зводячи подібні, додаємо лише <b>коефіцієнти</b>, а буквена частина не змінюється: " + polyD([[a1, V[0]]]) + tailT(a2, V[0]) + " = " + polyD([[A, V[0]]]) + "."],
      [polyD([[A, V[0]], [b1 - b2, V[1]], [C, ""]]), V[1] + ": " + sn(b1) + tailT(b2, "") + " = " + sn(B) + " — знак належить члену."],
      [polyD([[A, V[0]], [B, V[1]]]), "Не загуби вільний член (число): " + sn(c1) + tailT(c2, "") + " = " + sn(C) + "."]]);
    var tj = terms.map(function (t) { return [t[0], t[1] === "x²" ? "x*x" : t[1] === "a²b" ? "a*a*b" : t[1] === "ab²" ? "a*b*b" : t[1]]; });
    return choice("Зведи подібні члени і запиши в стандартному вигляді", polyD(terms) + " = ___", right, g.o,
      ["Подібні члени — з однаковою буквеною частиною (" + V[0] + " з " + V[0] + ", " + V[1] + " з " + V[1] + ", числа з числами).", "Додаємо лише коефіцієнти, а буквена частина лишається: 2" + V[0] + " + 3" + V[0] + " = 5" + V[0] + "."],
      V[0] + ": " + sn(A) + "; " + V[1] + ": " + sn(B) + "; вільний член: " + sn(C) + ". Разом <b>" + right + "</b>.",
      { err: g.err, chk: { src: polyJ(tj), vars: ["a", "b", "x"] } });
  };
  G.pDeg = function () {
    var n = R(2, 3), terms = [], ds = [], used = {};
    while (terms.length < n) { var v = { x: R(0, 4), y: R(0, 3) }; if (!v.x && !v.y) continue; var k = v.x + "," + v.y; if (used[k]) continue; used[k] = 1; terms.push(monoD(RNZ(-9, 9), v, terms.length === 0)); ds.push(v.x + v.y); }
    var cst = Math.random() < 0.5; if (cst) { terms.push(monoD(RNZ(-9, 9), {}, false)); }
    var best = Math.max.apply(null, ds);
    return num(terms.join("") + "\nстепінь: ___", best,
      ["Степінь многочлена стандартного вигляду — <b>найбільший</b> зі степенів його членів.", "Степінь члена — сума показників його букв: " + ds.join(", ") + (cst ? "; у вільного члена (числа) — 0" : "") + "."],
      "Степені членів: " + ds.join(", ") + (cst ? ", 0" : "") + ". Найбільший — <b>" + best + "</b>.",
      { task: "Знайди степінь многочлена", err: errs([[ds.reduce(function (a, b) { return a + b; }, 0), "Степені членів не додаємо — беремо <b>найбільший</b>."]], best), chk: { v: String(best) } });
  };
  /* §11 */
  G.pAdd = function () {
    var P = [RNZ(-9, 9), RNZ(-9, 9), RNZ(-6, 6)], Q = [RNZ(-9, 9), RNZ(-9, 9), RNZ(-6, 6)], minus = Math.random() < 0.7, sg = minus ? -1 : 1;
    var Rr = [P[0] + sg * Q[0], P[1] + sg * Q[1], P[2] + sg * Q[2]];
    if (!Rr[0] || !Rr[1] || !Rr[2]) return G.pAdd();
    var src = "(" + pXD(P) + ")" + (minus ? " " + M + " " : " + ") + "(" + pXD(Q) + ")", srcJ = "(" + pXJ(P) + ")" + (minus ? "-" : "+") + "(" + pXJ(Q) + ")";
    var right = pXD(Rr), list;
    if (minus) list = [[pXD([P[0] + Q[0], P[1] + Q[1], Rr[2]]), "Мінус перед дужками змінює знак <b>кожного</b> члена, а не лише першого."],
      [pXD([Rr[0], P[1] + Q[1], Rr[2]]), "Мінус перед дужками змінює знак і члена " + polyD([[Q[1], "x"]]) + "."],
      [pXD([P[0] + Q[0], Rr[1], Rr[2]]), "Мінус перед дужками змінює знак і числа: " + sn(Q[0]) + " → " + sn(-Q[0]) + "."]];
    else list = [[pXD([Rr[0], Rr[1], P[2] * Q[2] ? Rr[2] : Rr[2]]).replace(/x²/, "x⁴"), "Зводячи подібні, буквену частину не змінюємо: x² + x² = 2x², а не x⁴."],
      [Rr[1] + Rr[2] ? polyD([[Rr[1] + Rr[2], "x³"], [Rr[0], ""]]) : pXD([Rr[0]]), "x² і x — неподібні члени, їх не зводимо (і тим паче не виходить x³)."],
      [pXD([0, Rr[1], Rr[2]]), "Не загуби вільний член: " + sn(P[0]) + tailT(Q[0], "") + " = " + sn(Rr[0]) + "."]];
    var g = opts(right, list);
    var open = pXD(P) + polyD(pX(Q.map(function (c) { return sg * c; }))).replace(/^(?!−)/, " + ").replace(/^−/, " " + M + " ");
    return choice(minus ? "Відніми многочлени" : "Додай многочлени", src + " = ___", right, g.o,
      [minus ? "Розкрий дужки: мінус перед дужками змінює знак <b>кожного</b> члена другого многочлена." : "Плюс перед дужками — просто прибираємо дужки.", "Потім зведи подібні: окремо x², x і вільні члени."],
      open + " = <b>" + right + "</b>.", { err: g.err, chk: { src: srcJ, vars: ["x"] } });
  };
  /* §12 */
  G.pMono = function () {
    var k = RNZ(-5, 5), m = R(1, 2), A = [RNZ(-6, 6), RNZ(-6, 6), RNZ(-4, 4)];
    if (Math.abs(k) === 1 && Math.random() < 0.6) k = k * 2;
    var mono = (k === -1 ? M : k === 1 ? "" : sn(k)) + xv(m), src = mono + "(" + pXD(A) + ")", srcJ = "(" + k + ")*x**" + m + "*(" + pXJ(A) + ")";
    var Rc = [0, 0, 0, 0, 0]; for (var i = 0; i < 3; i++) Rc[i + m] = k * A[i];
    var right = pXD(Rc);
    var wS = Rc.slice(); wS[m + 2] = -wS[m + 2];
    var wP = Rc.slice(); wP[m + 2] = 0; wP[2 * m] = (wP[2 * m] || 0) + k * A[2]; var wPd = pXD(wP);
    var wC = Rc.slice(); wC[m] -= k * A[0]; wC[0] += k * A[0];
    var g = opts(right, [
      [pXD(wS), "Знак першого члена: " + par(mono) + " " + X + " " + par(polyD([[A[2], "x²"]])) + " = " + polyD([[k * A[2], xv(m + 2)]]) + (k * A[2] > 0 ? " (мінус на мінус — плюс)." : ".")],
      [pXD(wC), "Число в дужках теж множимо на " + mono + ": " + par(mono) + " " + X + " " + par(sn(A[0])) + " = " + polyD([[k * A[0], xv(m)]]) + "."],
      [wPd, "Множачи степені, показники <b>додаємо</b>: " + xv(m) + " " + X + " x² = " + xv(m + 2) + ", а не " + xv(2 * m) + "."]]);
    if (g.o.length < 3) return G.pMono();
    return choice("Помнож одночлен на многочлен", src + " = ___", right, g.o,
      ["Помнож " + mono + " на <b>кожен</b> член многочлена.", "Коефіцієнти перемножуємо (стеж за знаком!), показники x додаємо: " + xv(m) + " " + X + " x² = " + xv(m + 2) + "."],
      src + " = " + [2, 1, 0].map(function (i) { return par(mono) + " " + X + " " + par(polyD([[A[i], xv(i)]])); }).join(" + ") + " = <b>" + right + "</b>.",
      { err: g.err, chk: { src: srcJ, vars: ["x"] } });
  };
  G.pMonoEq = function () {
    var x, k1, a, k2, b, c, rhs;
    for (;;) { // k1·x(x + a) − k2·x(x + b) = rhs, де k1 = k2 → x² знищуються
      k1 = RNZ(-4, 4); a = RNZ(-8, 8); b = RNZ(-8, 8); x = RNZ(-9, 9); c = Math.random() < 0.5 ? 0 : R(-10, 10);
      if (a === b) continue; k2 = k1; rhs = k1 * (a - b) * x + c; if (Math.abs(rhs) > 80) continue; break;
    }
    var two = Math.random() < 0.6;
    var kD = function (k) { return k === 1 ? "" : k === -1 ? M : sn(k); };
    var L = two ? kD(k1) + "x(" + polyD([[1, "x"], [a, ""]]) + ") " + (k2 > 0 ? M : "+") + " " + (Math.abs(k2) === 1 ? "" : Math.abs(k2)) + "x(" + polyD([[1, "x"], [b, ""]]) + ")"
                : kD(k1) + "x(" + polyD([[1, "x"], [a, ""]]) + ") " + (k1 > 0 ? M + " " + polyD([[k1, "x²"]]) : "+ " + polyD([[-k1, "x²"]]));
    var kk = two ? k1 * (a - b) : k1 * a, rr = two ? rhs : k1 * a * x + c;
    var Lj = two ? "(" + k1 + ")*x*(x+(" + a + "))-(" + k2 + ")*x*(x+(" + b + "))" : "(" + k1 + ")*x*(x+(" + a + "))-(" + k1 + ")*x**2";
    L += c ? tailT(c, "") : ""; Lj += "+(" + c + ")";
    if (!two) rr = k1 * a * x + c;
    var R2 = two ? rhs : rr;
    return num(L + " = " + sn(R2) + "\nx = ___", sn(x),
      ["Розкрий дужки: одночлен множимо на кожен член у дужках. Стеж за знаком перед другим добутком.", "Члени з x² мають знищитися — лишиться лінійне рівняння."],
      (two ? polyD([[k1, "x²"], [k1 * a, "x"]]) + polyD([[-k2, "x²"], [-k2 * b, "x"]]).replace(/^(?!−)/, " + ").replace(/^−/, " " + M + " ") : polyD([[k1, "x²"], [k1 * a, "x"]]) + polyD([[-k1, "x²"]]).replace(/^(?!−)/, " + ").replace(/^−/, " " + M + " ")) + (c ? tailT(c, "") : "") + " = " + sn(R2) + " → " + tail(kk, R2 - c, sn(x)) + ".",
      { task: "Розв'яжи рівняння", err: two && Number.isInteger((R2 - c) / (k1 * (a + b))) && k1 * (a + b) !== 0 ? errs([[sn((R2 - c) / (k1 * (a + b))), "Мінус перед другим добутком змінює знак <b>кожного</b> члена: " + M + polyD([[k2, "x"]]) + " " + X + " " + pn(b) + " = " + sn(-k2 * b) + "x."]], sn(x)) : errs([[sn(-x), "Перевір знаки при розкритті дужок."]], sn(x)),
        chk: { eq: Lj, r: String(R2) } });
  };
  /* §13: винесення спільного множника */
  G.pFac = function () {
    if (Math.random() < 0.25) { // обчисли зручно
      var dc = Math.random() < 0.3, a = dc ? R(11, 99) / 10 : R(13, 89), s = pick([10, 100, 100]), b, c, plus = Math.random() < 0.6;
      if (plus) { b = R(s > 10 ? 11 : 2, s - 2); c = s - b; } else { b = R(s + 2, s + 40); c = b - s; }
      if (dc) { var bb = R(11, 89), cc = (plus ? 100 - bb : bb - 100); if (!plus) { bb = R(102, 140); cc = bb - 100; } b = bb / 10; c = Math.abs(cc) / 10; s = 10; }
      var aD = dc ? dec(a * 100) : String(a), bD = dc ? dec(b * 100) : String(b), cD = dc ? dec(c * 100) : String(c);
      var p = aD + " " + X + " " + bD + (plus ? " + " : " " + M + " ") + aD + " " + X + " " + cD, r = Math.round(a * s * 100) / 100;
      return num(p + " = ___", dc ? dec(Math.round(a * s * 100)) : r,
        ["У двох добутках є спільний множник " + aD + ". Винеси його за дужки.", aD + " " + X + " (" + bD + (plus ? " + " : " " + M + " ") + cD + ") = " + aD + " " + X + " " + s + "."],
        p + " = " + aD + " " + X + " (" + bD + (plus ? " + " : " " + M + " ") + cD + ") = " + aD + " " + X + " " + s + " = <b>" + (dc ? dec(Math.round(a * s * 100)) : r) + "</b>.",
        { task: "Обчисли зручним способом", chk: { v: a + "*" + b + (plus ? "+" : "-") + a + "*" + c } });
    }
    var k = R(2, 6), m = R(0, 2), u, w, z, three = Math.random() < 0.4, one = !three && m > 0 && Math.random() < 0.35;
    do { u = R(1, 6); w = RNZ(-7, 7); z = three ? RNZ(-5, 5) : 0; } while (gcd(gcd(u, w), z || w) !== 1);
    if (one) w = pick([1, -1]); // один член збігається зі спільним множником → у дужках 1
    if (m === 0 && k === 1) k = 2;
    var e1 = R(1, 2), neg = Math.random() < 0.3; // перший член від'ємний → виносимо з мінусом
    var inner = three ? [[u, xv(e1 + 1)], [w, xv(e1)], [z, ""]] : [[u, xv(e1)], [w, ""]];
    var G1 = (neg ? -1 : 1) * k, gD = (G1 === -1 ? M : G1 === 1 ? "" : sn(G1)) + xv(m);
    var pw = function (v) { return v === "" ? 0 : v === "x" ? 1 : SUP.indexOf(v.slice(1)); };
    var exp = inner.map(function (t) { return [G1 * t[0], xv(pw(t[1]) + m)]; });
    var src = polyD(exp), right = gD + "(" + polyD(inner) + ")";
    var list = [];
    var lastI = inner.length - 1, bl = inner.slice(); bl[lastI] = [-bl[lastI][0], ""];
    list.push([gD + "(" + polyD(bl) + ")", "Перевір знак останнього члена: " + par(gD) + " " + X + " " + par(sn(inner[lastI][0])) + " = " + polyD([exp[lastI]]) + "."]);
    if (one) list.unshift([gD + "(" + polyD(inner.slice(0, lastI)) + ")", "Член " + polyD([exp[lastI]]) + " дорівнює спільному множнику, тож у дужках на його місці лишається <b>" + sn(inner[lastI][0]) + "</b>, а не нуль."]);
    var bp = inner.slice(); bp[0] = [inner[0][0], xv(pw(inner[0][1]) + m)];
    list.push([gD + "(" + polyD(bp) + ")", "Ділячи степені, показники віднімаємо: " + polyD([[1, exp[0][1]]]) + " : " + xv(m || 0) + (m ? "" : "1") + " = " + (inner[0][1] || "1") + "."].map(String));
    if (m === 0) list.pop();
    if (k % 2 === 0 && k > 2) { var hk = (neg ? -1 : 1) * k / 2, hD = (hk === -1 ? M : hk === 1 ? "" : sn(hk)) + xv(m), bi = inner.map(function (t) { return [t[0] * 2, t[1]]; }); var incD = hD + "(" + polyD(bi) + ")"; list.push([incD, "Тотожно правильно, але <b>не до кінця</b>: у дужках усе ще ділиться на 2. Спільний множник — найбільше число, на яке діляться всі коефіцієнти: " + k + ", а не " + k / 2 + "."]); }
    var bs = inner.map(function (t, i) { return i === 0 ? t : [-t[0], t[1]]; });
    list.push([gD + "(" + polyD(bs) + ")", "Ділячи на " + gD + ", зберігай знаки: " + polyD([exp[1]]) + " : " + par(gD) + " = " + polyD([inner[1]]) + "."]);
    var g = opts(right, list);
    if (g.o.length < 3) return G.pFac();
    return choice("Винеси спільний множник за дужки", src + " = ___", right, g.o,
      ["Яке найбільше число ділить усі коефіцієнти? І в якому найменшому степені x є в кожному члені?" + (neg ? " Перший член від'ємний — зручно винести множник разом з мінусом." : ""), "Знайшовши спільний множник, поділи на нього кожен член — це і буде в дужках. Перевір: розкрий дужки."],
      "Спільний множник " + gD + ". " + exp.map(function (t, i) { return polyD([t]) + " : " + par(gD) + " = " + polyD([inner[i]]); }).join("; ") + ". Отже, <b>" + right + "</b>.",
      { err: g.err, chk: { src: polyJ(exp.map(function (t) { return [t[0], t[1] ? "x**" + pw(t[1]) : ""]; })), vars: ["x"], incomplete: typeof incD === "string" ? incD : "" } });
  };
  /* §13: x² − 5x = 0 */
  G.pFacEq = function () {
    var k = RNZ(-6, 6), r = RNZ(-9, 9), b = -k * r; // kx² + bx = 0 → x(kx + b) = 0 → x = 0 або x = r
    if (Math.abs(k) === 1 && Math.random() < 0.5) k = k * 3, b = -k * r;
    var eq = polyD([[k, "x²"], [b, "x"]]) + " = 0", inner = polyD([[k, "x"], [b, ""]]);
    return num(eq + "\nненульовий корінь: x = ___", sn(r),
      ["Винеси x за дужки: x(" + inner + ") = 0.", "Добуток дорівнює нулю, коли хоча б один множник — нуль: x = 0 або " + inner + " = 0."],
      eq + " → x(" + inner + ") = 0 → x = 0 або " + inner + " = 0, x = <b>" + sn(r) + "</b>. Корені: 0 і " + sn(r) + ".",
      { task: "Розв'яжи рівняння", err: errs([[sn(-r), "Розв'яжи " + inner + " = 0 уважно: переносимо " + sn(b) + " зі зміною знака."], ["0", "x = 0 — теж корінь! Але тут питають про другий, ненульовий."]], sn(r)), chk: { v: String(-b / k) } });
  };
  /* §13: винесення многочлена за дужки: a(x − y) + 3(x − y), 5(a − b) − c(b − a) */
  G.pFacPoly = function () {
    var V = pick([["a", "b", "x", "y"], ["m", "n", "a", "b"], ["c", "x", "a", "b"]]), A = V[0], B = V[1], P = V[2], Q = V[3], k = RNZ(-6, 6), flip = Math.random() < 0.45, s = pick([1, -1]);
    if (Math.abs(k) === 1) k = k * 2;
    var d1 = "(" + polyD([[1, P], [s, Q]]) + ")", d2 = flip ? "(" + polyD([[1, Q], [s, P]]) + ")" : d1;
    // A·d1 + k·d2 (якщо flip і s = −1: (Q − P) = −(P − Q))
    var sign2 = flip && s === -1 ? -1 : 1, kk = k * sign2;
    var src = A + d1 + (k < 0 ? " " + M + " " + (-k) : " + " + k) + d2;
    var right = d1 + "(" + polyD([[1, A], [kk, ""]]) + ")";
    var srcJ = A + "*(" + P + "+(" + s + ")*" + Q + ")+(" + k + ")*(" + (flip ? Q + "+(" + s + ")*" + P : P + "+(" + s + ")*" + Q) + ")";
    var list = [[d1 + "(" + polyD([[1, A], [-kk, ""]]) + ")", flip && s === -1 ? "Дужки " + d2 + " і " + d1 + " протилежні: " + d2 + " = " + M + d1 + ". Тому " + (k < 0 ? M : "+") + Math.abs(k) + d2 + " = " + (kk < 0 ? M : "+") + Math.abs(kk) + d1 + "." : "Перевір знак числа: " + (k < 0 ? M : "+") + Math.abs(k) + d2 + "."],
      [d1 + "(" + A + " " + X + " " + Math.abs(k) + ")", "Між " + A + " і " + sn(kk) + " — додавання/віднімання, а не множення: виносимо спільну дужку, в інших дужках лишається " + polyD([[1, A], [kk, ""]]) + "."],
      ["(" + polyD([[1, P], [-s, Q]]) + ")(" + polyD([[1, A], [kk, ""]]) + ")", "Спільна дужка — " + d1 + ", її знаки не змінюються."]];
    var g = opts(right, list);
    return choice("Розклади на множники", src + " = ___", right, g.o,
      ["Спільний множник тут — ціла дужка " + d1 + (flip && s === -1 ? ". Зверни увагу: " + d2 + " = " + M + d1 + "." : "."), "Винеси її: " + d1 + "(… …)."],
      (flip && s === -1 ? d2 + " = " + M + d1 + ", тому " + src + " = " + A + d1 + tailT(kk, "") + d1 + ". " : "") + "Виносимо " + d1 + ": <b>" + right + "</b>.",
      { err: g.err, chk: { src: srcJ, vars: [A, B, P, Q] } });
  };
  /* §14 */
  G.pMul = function (o) {
    var easy = o && o.easy, a = easy ? 1 : pick([1, 1, 2, 3]), c = easy ? 1 : pick([1, 1, 2]), b = RNZ(-7, 7), d = RNZ(-7, 7), M2 = a * d + b * c;
    if (M2 === 0) return G.pMul();
    var right = pXD([b * d, M2, a * c]), hasNeg = b < 0 || d < 0;
    var list = [[pXD([b * d, 0, a * c]), "Не загуби «середні» добутки: " + polyD([[a, "x"]]) + " " + X + " " + pn(d) + " і " + pn(b) + " " + X + " " + polyD([[c, "x"]]) + " — разом " + polyD([[M2, "x"]]) + "."],
      [pXD([b * d, a * d, a * c]), "Загубився добуток " + pn(b) + " " + X + " " + polyD([[c, "x"]]) + " = " + polyD([[b * c, "x"]]) + ". Кожен член множимо на кожен — 4 добутки."]];
    if (hasNeg) list.push([pXD([-b * d, M2, a * c]), "Знак: " + pn(b) + " " + X + " " + pn(d) + " = " + sn(b * d) + "."]);
    list.push([pXD([b * d, M2, 0]) + (a * c ? tailT(a * c, "x").replace(/^ \+ /, " + ") : ""), polyD([[a, "x"]]) + " " + X + " " + polyD([[c, "x"]]) + " = " + polyD([[a * c, "x²"]]) + ": показники додаємо, x " + X + " x = x²."]);
    list.push([pXD([b * d, b * c, a * c]), "Загубився добуток " + polyD([[a, "x"]]) + " " + X + " " + pn(d) + " = " + polyD([[a * d, "x"]]) + "."]);
    var g = opts(right, list);
    var L1 = "(" + polyD([[a, "x"], [b, ""]]) + ")", L2 = "(" + polyD([[c, "x"], [d, ""]]) + ")";
    return choice("Помнож многочлени", L1 + L2 + " = ___", right, g.o,
      ["Кожен член першого многочлена множимо на <b>кожен</b> член другого — вийде 4 добутки.", "Потім зведи подібні (два члени з x)."],
      L1 + L2 + " = " + polyD([[a * c, "x²"], [a * d, "x"], [b * c, "x"], [b * d, ""]]) + " = <b>" + right + "</b>.",
      { err: g.err, chk: { src: "(" + a + "*x+(" + b + "))*(" + c + "*x+(" + d + "))", vars: ["x"] } });
  };
  /* §14: тричлен на двочлен */
  G.pMul3 = function () {
    var b = RNZ(-5, 5), p = RNZ(-5, 5), q = RNZ(-6, 6); // (x + b)(x² + px + q) = x³ + (p+b)x² + (q+bp)x + bq
    var Rc = [b * q, q + b * p, p + b, 1]; if (!Rc[1] || !Rc[2]) return G.pMul3();
    var right = pXD(Rc);
    var g = opts(right, [[pXD([b * q, q, p + b, 1]), "Загубився добуток " + pn(b) + " " + X + " " + polyD([[p, "x"]]) + " = " + polyD([[b * p, "x"]]) + ". Кожен член на кожен: 2 · 3 = 6 добутків."],
      [pXD([b * q, q + b * p, p, 1]), "Загубився добуток " + pn(b) + " " + X + " x² = " + polyD([[b, "x²"]]) + "."],
      [pXD([-b * q, q + b * p, p + b, 1]), "Знак вільного члена: " + pn(b) + " " + X + " " + pn(q) + " = " + sn(b * q) + "."]]);
    var src = "(" + polyD([[1, "x"], [b, ""]]) + ")(" + polyD([[1, "x²"], [p, "x"], [q, ""]]) + ")";
    return choice("Помнож многочлени", src + " = ___", right, g.o,
      ["Кожен член першого (2 члени) на кожен член другого (3 члени) — 6 добутків.", "Спершу x на всі три, потім " + sn(b) + " на всі три; потім зведи подібні."],
      src + " = " + polyD([[1, "x³"], [p, "x²"], [q, "x"]]) + polyD([[b, "x²"], [b * p, "x"], [b * q, ""]]).replace(/^(?!−)/, " + ").replace(/^−/, " " + M + " ") + " = <b>" + right + "</b>.",
      { err: g.err, chk: { src: "(x+(" + b + "))*(x*x+(" + p + ")*x+(" + q + "))", vars: ["x"] } });
  };
  /* §14: спрости (x − 2)(x + 3) − x(x + 1) */
  G.pSimp = function () {
    var a = RNZ(-6, 6), b = RNZ(-6, 6), c = RNZ(-6, 6), mn = Math.random() < 0.7;
    // (x + a)(x + b) ∓ x(x + c)
    var Rc = mn ? [a * b, a + b - c, 0] : [a * b, a + b + c, 2];
    if (!Rc[1]) return G.pSimp();
    var right = pXD(Rc);
    var w1 = mn ? pXD([a * b, a + b + c, 0]) : pXD([a * b, a + b - c, 2]);
    var g = opts(right, [[w1, mn ? "Мінус перед добутком змінює знак <b>кожного</b> члена: " + M + "x(" + polyD([[1, "x"], [c, ""]]) + ") = " + polyD([[-1, "x²"], [-c, "x"]]) + "." : "x(" + polyD([[1, "x"], [c, ""]]) + ") = " + polyD([[1, "x²"], [c, "x"]]) + " — знак " + polyD([[c, "x"]]) + " не змінюється."],
      [pXD([0, Rc[1], Rc[2]]), "Не загуби добуток чисел: " + pn(a) + " " + X + " " + pn(b) + " = " + sn(a * b) + "."],
      [pXD([a * b, Rc[1] - a, Rc[2]]), "У (" + polyD([[1, "x"], [a, ""]]) + ")(" + polyD([[1, "x"], [b, ""]]) + ") два «середні» добутки: " + polyD([[b, "x"]]) + " і " + polyD([[a, "x"]]) + "."]]);
    var src = "(" + polyD([[1, "x"], [a, ""]]) + ")(" + polyD([[1, "x"], [b, ""]]) + ") " + (mn ? M : "+") + " x(" + polyD([[1, "x"], [c, ""]]) + ")";
    return choice("Спрости вираз", src + " = ___", right, g.o,
      ["Спершу розкрий обидва добутки окремо.", mn ? "Другий добуток віднімаємо — візьми його в дужки, а потім зміни знаки: " + M + "(x² " + (c < 0 ? M : "+") + " " + Math.abs(c) + "x)." : "Потім зведи подібні."],
      "(" + polyD([[1, "x²"], [a + b, "x"], [a * b, ""]]) + ") " + (mn ? M : "+") + " (" + polyD([[1, "x²"], [c, "x"]]) + ") = <b>" + right + "</b>.",
      { err: g.err, chk: { src: "(x+(" + a + "))*(x+(" + b + "))" + (mn ? "-" : "+") + "x*(x+(" + c + "))", vars: ["x"] } });
  };
  G.pMulEq = function () {
    var a, b, x, c, t = Math.random() < 0.4 ? 2 : 1, d, e;
    if (t === 2) { // (x + a)(x + b) = (x + d)(x + e)
      do { a = RNZ(-6, 6); b = RNZ(-6, 6); d = RNZ(-6, 6); e = RNZ(-6, 6); x = RNZ(-9, 9); } while (a + b === d + e || (d * e - a * b) % (a + b - d - e) !== 0 || (d * e - a * b) / (a + b - d - e) !== x);
      var L = "(" + polyD([[1, "x"], [a, ""]]) + ")(" + polyD([[1, "x"], [b, ""]]) + ")", Rr = "(" + polyD([[1, "x"], [d, ""]]) + ")(" + polyD([[1, "x"], [e, ""]]) + ")";
      return num(L + " = " + Rr + "\nx = ___", sn(x),
        ["Перемнож дужки в обох частинах: кожен член на кожен.", "x² є в обох частинах — вони знищуються. Далі — лінійне рівняння."],
        polyD([[1, "x²"], [a + b, "x"], [a * b, ""]]) + " = " + polyD([[1, "x²"], [d + e, "x"], [d * e, ""]]) + " → " + tail(a + b - d - e, d * e - a * b, sn(x)) + ".",
        { task: "Розв'яжи рівняння", err: errs([[sn(-x), "Перевір знаки, коли переносиш члени через «=»."]], sn(x)), chk: { eq: "(x+(" + a + "))*(x+(" + b + "))", r: "(x+(" + d + "))*(x+(" + e + "))" } });
    }
    do { a = RNZ(-8, 8); b = RNZ(-8, 8); x = RNZ(-9, 9); c = (a + b) * x + a * b; } while (a + b === 0 || Math.abs(c) > 60);
    var L2 = "(" + polyD([[1, "x"], [a, ""]]) + ")(" + polyD([[1, "x"], [b, ""]]) + ") " + M + " x²";
    var w = (c - 0) / (a + b), w2 = (c - a * b) / (a - b || 1e9);
    return num(L2 + " = " + sn(c) + "\nx = ___", sn(x),
      ["Перемнож дужки: кожен член першої на кожен член другої (4 добутки).", "x² і " + M + "x² знищуються — лишається лінійне рівняння."],
      polyD([[1, "x²"], [a + b, "x"], [a * b, ""]]) + " " + M + " x² = " + sn(c) + " → " + tail(a + b, c - a * b, sn(x)) + ".",
      { task: "Розв'яжи рівняння", err: errs((Number.isInteger(w) ? [[sn(w), "Не загуби добуток чисел: " + pn(a) + " " + X + " " + pn(b) + " = " + sn(a * b) + "."]] : []).concat(Number.isInteger(w2) ? [[sn(w2), "Перевір «середні» добутки: x " + X + " " + pn(b) + " і " + pn(a) + " " + X + " x — обидва зі своїми знаками."]] : []), sn(x)),
        chk: { eq: "(x+(" + a + "))*(x+(" + b + "))-x**2", r: String(c) } });
  };
  /* §15 */
  G.pGrp = function () {
    if (Math.random() < 0.3) { // x³ + ax² + bx + ab = (x + a)(x² + b)
      var a = RNZ(-6, 6), b = RNZ(-6, 6); if (Math.abs(a) === Math.abs(b)) b = b > 0 ? b + 1 : b - 1;
      var src = polyD([[1, "x³"], [a, "x²"], [b, "x"], [a * b, ""]]), right = "(" + polyD([[1, "x"], [a, ""]]) + ")(" + polyD([[1, "x²"], [b, ""]]) + ")";
      var g0 = opts(right, [["(" + polyD([[1, "x"], [-a, ""]]) + ")(" + polyD([[1, "x²"], [b, ""]]) + ")", "Перевір першу групу: x³" + tailT(a, "x²") + " = x²(" + polyD([[1, "x"], [a, ""]]) + ")."],
        ["(" + polyD([[1, "x"], [a, ""]]) + ")(" + polyD([[1, "x²"], [-b, ""]]) + ")", "Перевір другу групу: " + polyD([[b, "x"], [a * b, ""]]) + " = " + sn(b) + "(" + polyD([[1, "x"], [a, ""]]) + ")."],
        ["(" + polyD([[1, "x"], [a, ""]]) + ")(" + polyD([[1, "x"], [b, ""]]) + ")", "З першої групи виносимо x², тож у другій дужці x², а не x."]]);
      return choice("Розклади на множники способом групування", src + " = ___", right, g0.o,
        ["Згрупуй перші два і останні два члени.", "З першої групи винеси x², з другої — " + sn(b) + "."],
        "(x³" + tailT(a, "x²") + ") + (" + polyD([[b, "x"], [a * b, ""]]) + ") = x²(" + polyD([[1, "x"], [a, ""]]) + ")" + tailT(b, "") + "(" + polyD([[1, "x"], [a, ""]]) + ") = <b>" + right + "</b>.",
        { err: g0.err, chk: { src: "x**3+(" + a + ")*x**2+(" + b + ")*x+(" + a * b + ")", vars: ["x"] } });
    }
    var V = pick([["a", "x", "y"], ["b", "m", "n"], ["c", "x", "y"]]), A = V[0], P = V[1], Q = V[2], s = RNZ(-5, 5), r = RNZ(-6, 6), ka = Math.random() < 0.35 ? pick([2, 3]) : 1;
    if (Math.abs(r) === Math.abs(s) || r === s * ka) r = r > 0 ? r + 1 : r - 1;
    // (ka·a + r)(x + s·y) = ka·ax + ka·s·ay + r·x + r·s·y
    var t = [[ka, A + P], [ka * s, A + Q], [r, P], [r * s, Q]];
    if (Math.random() < 0.5) t = [t[0], t[2], t[1], t[3]];
    var src = polyD(t), f1 = "(" + polyD([[1, P], [s, Q]]) + ")", aD = (ka === 1 ? "" : ka) + A, f2 = "(" + polyD([[ka, A], [r, ""]]) + ")";
    var right = f1 + f2;
    var g = opts(right, [["(" + polyD([[1, P], [-s, Q]]) + ")" + f2, "Перевір знак при " + Q + ": " + polyD([[ka, A + P], [ka * s, A + Q]]) + " = " + aD + f1 + "."],
      [f1 + "(" + polyD([[ka, A], [-r, ""]]) + ")", "Перевір знак числа: " + polyD([[r, P], [r * s, Q]]) + " = " + (r === 1 ? "" : r === -1 ? M : sn(r)) + f1 + "." + (r < 0 ? " Виносячи від'ємне число, змінюємо знаки в дужках." : "")],
      [f1 + "(" + polyD([[ka, A], [r * s, ""]]) + ")", "Із групи " + polyD([[r, P], [r * s, Q]]) + " виносимо " + sn(r) + ", а не " + sn(r * s) + "."],
      ]);
    if (g.o.length < 3) return G.pGrp();
    var rD = r === -1 ? M + " " : r === 1 ? "+ " : (r < 0 ? M + " " + (-r) : "+ " + r);
    return choice("Розклади на множники способом групування", src + " = ___", right, g.o,
      ["Згрупуй члени з «" + A + "» і без нього.", "З кожної групи винеси спільний множник — у дужках має вийти однаковий вираз."],
      "(" + polyD([[ka, A + P], [ka * s, A + Q]]) + ") + (" + polyD([[r, P], [r * s, Q]]) + ") = " + aD + f1 + " " + rD + f1 + " = <b>" + right + "</b>.",
      { err: g.err, chk: { src: polyJ(t.map(function (x) { return [x[0], x[1].length === 2 ? x[1].charAt(0) + "*" + x[1].charAt(1) : x[1]]; })), vars: [A, P, Q] } });
  };
  /* =================== Розділ 2: формули скороченого множення (§16–21) =================== */
  /* член c·u, u ∈ {"x","y","a","b",""}; квадрат (c·u)² = c²·u² */
  function sq(u) { return u ? u + "²" : ""; }
  function cub(u) { return u ? u + "³" : ""; }
  function mul2(u, v) { return u && v ? (u < v ? u + v : v + u) : u || v; }
  function tD(c, u) { return polyD([[c, u]]); }
  function tJ(u) { return u ? "*" + u.split("").map(function (ch) { return ch === "²" ? "**2" : ch === "³" ? "**3" : "*" + ch; }).join("").replace(/^\*/, "").replace(/\*\*\*/g, "**") : ""; }
  function pJ(terms) { return terms.map(function (t) { var v = t[1].replace(/([a-z])²/g, "$1*$1").replace(/([a-z])³/g, "$1*$1*$1").replace(/([a-z])(?=[a-z])/g, "$1*"); return "(" + t[0] + ")" + (v ? "*" + v : ""); }).join("+") || "0"; }
  function pair2() { // A = pa·U, B = pb·V
    var U = pick(["x", "m", "y"]), V = Math.random() < 0.5 ? "" : (U === "y" ? "x" : pick(["y", "n"])), pa = pick([1, 1, 2, 3]), pb = R(1, 7);
    if (!V && pb === 1) pb = R(2, 7);
    return { U: U, V: V, pa: pa, pb: pb, A: tD(pa, U), B: tD(pb, V) };
  }
  G.fSq = function (o) {
    var q = pair2(); if (o && o.easy) { q.pa = 1; q.V = ""; q.pb = R(2, 7); q.A = q.U; q.B = String(q.pb); }
    var s1 = pick([1, -1]), mid = 2 * s1 * q.pa * q.pb, UV = mul2(q.U, q.V);
    var src = "(" + q.A + (s1 > 0 ? " + " : " " + M + " ") + q.B + ")²", srcJ = "(" + q.pa + "*" + q.U + (s1 > 0 ? "+" : "-") + q.pb + (q.V ? "*" + q.V : "") + ")**2";
    var right = polyD([[q.pa * q.pa, sq(q.U)], [mid, UV], [q.pb * q.pb, sq(q.V)]]);
    var list = [[polyD([[q.pa * q.pa, sq(q.U)], [q.pb * q.pb, sq(q.V)]]), "Загубився подвоєний добуток 2 " + X + " " + par(q.A) + " " + X + " " + q.B + ". (a " + (s1 > 0 ? "+" : M) + " b)² ≠ a² + b²!"],
      [polyD([[q.pa * q.pa, sq(q.U)], [mid / 2, UV], [q.pb * q.pb, sq(q.V)]]), "Середній член — <b>подвоєний</b> добуток: 2 " + X + " " + q.A + " " + X + " " + q.B + " = " + tD(Math.abs(mid), UV) + "."],
      [polyD([[q.pa * q.pa, sq(q.U)], [-mid, UV], [q.pb * q.pb, sq(q.V)]]), "Знак середнього члена — як у дужках: (a " + (s1 > 0 ? "+" : M) + " b)² = a² " + (s1 > 0 ? "+" : M) + " 2ab + b²."]];
    if (q.pa > 1) list.unshift([polyD([[q.pa, sq(q.U)], [mid, UV], [q.pb * q.pb, sq(q.V)]]), "У квадрат підносимо і коефіцієнт: (" + q.A + ")² = " + tD(q.pa * q.pa, sq(q.U)) + ", а не " + tD(q.pa, sq(q.U)) + "."]);
    var g = opts(right, list);
    return choice("Піднеси до квадрата", src + " = ___", right, g.o,
      ["Формула: (перший " + (s1 > 0 ? "+" : M) + " другий)² = перший² " + (s1 > 0 ? "+" : M) + " 2 · перший · другий + другий².", "Перший вираз — " + q.A + ", другий — " + q.B + ". Піднеси кожен до квадрата (з коефіцієнтом!) і знайди подвоєний добуток."],
      src + " = (" + q.A + ")² " + (s1 > 0 ? "+" : M) + " 2 " + X + " " + par(q.A) + " " + X + " " + q.B + " + " + (q.V ? "(" + q.B + ")²" : q.B + "²") + " = <b>" + right + "</b>.",
      { err: g.err, chk: { src: srcJ, vars: ["m", "n", "x", "y"] } });
  };
  G.fSqCalc = function () {
    var base = pick([20, 30, 40, 50, 60, 70, 80, 90, 100, 200]), d = pick([1, 2, 1, -1, -2, 3]), n = base + d; if (n > 199) n = 199, base = 200, d = -1;
    var r = n * n;
    return num(n + "² = ___", r,
      ["Запиши " + n + " = " + base + (d < 0 ? " " + M + " " + (-d) : " + " + d) + " і скористайся формулою квадрата " + (d < 0 ? "різниці" : "суми") + ".", "(" + base + (d < 0 ? " " + M + " " : " + ") + Math.abs(d) + ")² = " + base * base + (d < 0 ? " " + M + " " : " + ") + 2 * base * Math.abs(d) + " + " + d * d + "."],
      n + "² = (" + base + (d < 0 ? " " + M + " " : " + ") + Math.abs(d) + ")² = " + base * base + (d < 0 ? " " + M + " " : " + ") + 2 * base * Math.abs(d) + " + " + d * d + " = <b>" + r + "</b>.",
      { task: "Обчисли за формулою", err: errs([[base * base + d * d, "Не загуби подвоєний добуток 2 " + X + " " + base + " " + X + " " + Math.abs(d) + " = " + 2 * base * Math.abs(d) + "."]], r), chk: { v: n + "*" + n } });
  };
  G.fSqFac = function () {
    var q = pair2(), s1 = pick([1, -1]), mid = 2 * s1 * q.pa * q.pb, UV = mul2(q.U, q.V);
    var src = polyD([[q.pa * q.pa, sq(q.U)], [mid, UV], [q.pb * q.pb, sq(q.V)]]), srcJ = pJ([[q.pa * q.pa, sq(q.U)], [mid, UV], [q.pb * q.pb, sq(q.V)]]);
    var right = "(" + q.A + (s1 > 0 ? " + " : " " + M + " ") + q.B + ")²";
    var g = opts(right, [["(" + q.A + (s1 > 0 ? " " + M + " " : " + ") + q.B + ")²", "Знак у дужках — як у середнього члена: " + tD(mid, UV) + "."],
      ["(" + q.A + (s1 > 0 ? " + " : " " + M + " ") + tD(q.pb * q.pb, sq(q.V)) + ")²", "У дужках — не " + tD(q.pb * q.pb, sq(q.V)) + ", а число (вираз), квадрат якого дорівнює " + tD(q.pb * q.pb, sq(q.V)) + ": це " + q.B + "."],
      ["(" + q.A + " " + M + " " + q.B + ")(" + q.A + " + " + q.B + ")", "Це різниця квадратів, вона дає " + tD(q.pa * q.pa, sq(q.U)) + " " + M + " " + tD(q.pb * q.pb, sq(q.V)) + " без середнього члена. Тут середній член є — це квадрат двочлена."]]);
    return choice("Подай у вигляді квадрата двочлена", src + " = ___", right, g.o,
      ["Шукай a² і b² серед крайніх членів: " + tD(q.pa * q.pa, sq(q.U)) + " = (" + q.A + ")², " + tD(q.pb * q.pb, sq(q.V)) + " = (" + q.B + ")².", "Перевір середній член: 2 " + X + " " + q.A + " " + X + " " + q.B + " = " + tD(Math.abs(mid), UV) + ". Знак " + (s1 > 0 ? "«+»" : "«" + M + "»") + " → (a " + (s1 > 0 ? "+" : M) + " b)²."],
      src + " = (" + q.A + ")² " + (s1 > 0 ? "+" : M) + " 2 " + X + " " + par(q.A) + " " + X + " " + q.B + " + (" + q.B + ")² = <b>" + right + "</b>.",
      { err: g.err, chk: { src: srcJ, vars: ["m", "n", "x", "y"] } });
  };
  G.fSqMiss = function () {
    var pa = pick([1, 1, 2, 3]), pb = R(1, 9), s1 = pick([1, -1]), U = "x", which = Math.random() < 0.6 ? "mid" : "last";
    if (pb === 1 && pa === 1) pb = 4;
    var mid = 2 * s1 * pa * pb, A = tD(pa, U);
    var p = which === "mid" ? tD(pa * pa, "x²") + (s1 > 0 ? " + " : " " + M + " ") + "___x + " + pb * pb + " = (" + A + (s1 > 0 ? " + " : " " + M + " ") + pb + ")²"
                            : tD(pa * pa, "x²") + tailT(mid, "x") + " + ___ = (" + A + (s1 > 0 ? " + " : " " + M + " ") + pb + ")²";
    var r = which === "mid" ? Math.abs(mid) : pb * pb;
    return num(p, r,
      ["(a " + (s1 > 0 ? "+" : M) + " b)² = a² " + (s1 > 0 ? "+" : M) + " 2ab + b², a = " + A + ", b = " + pb + ".", which === "mid" ? "Пропущено подвоєний добуток. Чому дорівнює 2 · a · b?" : "Пропущено b². Чому дорівнює b?"],
      which === "mid" ? "2 " + X + " " + A + " " + X + " " + pb + " = " + tD(Math.abs(mid), "x") + ", тож пропущено <b>" + r + "</b>." : "b² = " + pb + "² = <b>" + r + "</b>.",
      { task: "Встав пропущене число", err: errs(which === "mid" ? [[pa * pb, "Середній член — <b>подвоєний</b> добуток: 2 " + X + " " + pa + " " + X + " " + pb + " = " + 2 * pa * pb + "."]] : [[2 * pb, "b² = " + pb + " " + X + " " + pb + ", а не " + pb + " " + X + " 2."]], r), chk: { v: String(r) } });
  };
  G.fDsum = function () {
    var q = pair2(), sw = Math.random() < 0.5;
    var src = sw ? "(" + q.A + " + " + q.B + ")(" + q.A + " " + M + " " + q.B + ")" : "(" + q.A + " " + M + " " + q.B + ")(" + q.A + " + " + q.B + ")";
    var srcJ = "(" + q.pa + "*" + q.U + "-" + q.pb + (q.V ? "*" + q.V : "") + ")*(" + q.pa + "*" + q.U + "+" + q.pb + (q.V ? "*" + q.V : "") + ")";
    var right = polyD([[q.pa * q.pa, sq(q.U)], [-q.pb * q.pb, sq(q.V)]]), UV = mul2(q.U, q.V);
    var list = [[polyD([[q.pa * q.pa, sq(q.U)], [q.pb * q.pb, sq(q.V)]]), "(a − b)(a + b) = a² <b>−</b> b²: між квадратами мінус."],
      [polyD([[q.pa * q.pa, sq(q.U)], [-2 * q.pa * q.pb, UV], [-q.pb * q.pb, sq(q.V)]]), "Середні добутки " + M + "ab і +ab знищуються — середнього члена немає."],
      [polyD([[q.pa * q.pa, sq(q.U)], [-q.pb, q.V ? q.V + "²" : ""]]), "У квадрат підносимо і " + q.B + ": (" + q.B + ")² = " + tD(q.pb * q.pb, sq(q.V)) + "."]];
    if (q.pa > 1) list.unshift([polyD([[q.pa, sq(q.U)], [-q.pb * q.pb, sq(q.V)]]), "(" + q.A + ")² = " + tD(q.pa * q.pa, sq(q.U)) + " — коефіцієнт теж у квадрат."]);
    var g = opts(right, list);
    return choice("Виконай множення", src + " = ___", right, g.o,
      ["Це різниця двох виразів на їхню суму: (a − b)(a + b) = a² − b².", "Перший вираз — " + q.A + ", другий — " + q.B + ". Піднеси кожен до квадрата."],
      src + " = (" + q.A + ")² " + M + " (" + q.B + ")² = <b>" + right + "</b>.",
      { err: g.err, chk: { src: srcJ, vars: ["m", "n", "x", "y"] } });
  };
  G.fDsumCalc = function () {
    var base = pick([20, 30, 40, 50, 60, 70, 80, 100]), d = R(1, 4), a = base + d, b = base - d;
    return num(a + " " + X + " " + b + " = ___", a * b,
      ["Помітила? " + a + " = " + base + " + " + d + ", " + b + " = " + base + " " + M + " " + d + ".", "(" + base + " + " + d + ")(" + base + " " + M + " " + d + ") = " + base + "² " + M + " " + d + "²."],
      a + " " + X + " " + b + " = " + base + "² " + M + " " + d + "² = " + base * base + " " + M + " " + d * d + " = <b>" + a * b + "</b>.",
      { task: "Обчисли зручно", err: errs([[base * base + d * d, "(a + b)(a − b) = a² <b>−</b> b²."]], a * b), chk: { v: a + "*" + b } });
  };
  G.fDsqFac = function () {
    if (Math.random() < 0.35) { // x² − 49 = 0 або 67² − 33²
      if (Math.random() < 0.5) { var n = R(2, 12), k = pick([1, 1, 4, 9]), rt = n; var eq = (k === 1 ? "x²" : k + "x²") + " " + M + " " + k * n * n + " = 0";
        return num(eq + "\nдодатний корінь: x = ___", rt, ["Розклади ліву частину: " + (k === 1 ? "x² " + M + " " + n * n + " = (x " + M + " " + n + ")(x + " + n + ")" : "спершу поділи на " + k + ": x² " + M + " " + n * n + " = 0") + ".", "Добуток дорівнює нулю, коли один із множників — нуль: x = " + n + " або x = " + M + n + "."],
          eq + " → (x " + M + " " + n + ")(x + " + n + ") = 0 → x = <b>" + n + "</b> або x = " + M + n + ".", { task: "Розв'яжи рівняння", err: errs([[sn(-n), "Це теж корінь, але питають додатний."], [n * n, "x² = " + n * n + ", тож x = " + n + " (" + n + " " + X + " " + n + " = " + n * n + ")."]], rt), chk: { v: String(n) } }); }
      var a = R(51, 99), b = 100 - a; if (a === b) a++, b--;
      var plus = Math.random() < 0.5, B = plus ? 100 - a : a - pick([10, 20, 30]);
      var r = a * a - B * B;
      return num(a + "² " + M + " " + B + "² = ___", r, ["Різниця квадратів: a² − b² = (a − b)(a + b).", "(" + a + " " + M + " " + B + ")(" + a + " + " + B + ") = " + (a - B) + " " + X + " " + (a + B) + "."],
        a + "² " + M + " " + B + "² = (" + a + " " + M + " " + B + ")(" + a + " + " + B + ") = " + (a - B) + " " + X + " " + (a + B) + " = <b>" + r + "</b>.", { task: "Обчисли зручно", err: errs([[(a - B) * (a - B), "a² − b² ≠ (a − b)². Різниця квадратів = (a − b)(a + b)."]], r), chk: { v: a + "**2-" + B + "**2" } });
    }
    var q = pair2();
    var src = polyD([[q.pa * q.pa, sq(q.U)], [-q.pb * q.pb, sq(q.V)]]), srcJ = pJ([[q.pa * q.pa, sq(q.U)], [-q.pb * q.pb, sq(q.V)]]);
    var right = "(" + q.A + " " + M + " " + q.B + ")(" + q.A + " + " + q.B + ")";
    var g = opts(right, [["(" + q.A + " " + M + " " + q.B + ")²", "(a − b)² = a² − 2ab + b² — тут з'явився б середній член. Різниця квадратів = (a − b)(a + b)."],
      ["(" + tD(q.pa * q.pa, sq(q.U)) + " " + M + " " + q.B + ")(" + tD(q.pa * q.pa, sq(q.U)) + " + " + q.B + ")", "У дужках — не " + tD(q.pa * q.pa, sq(q.U)) + ", а вираз, квадрат якого дорівнює " + tD(q.pa * q.pa, sq(q.U)) + ": " + q.A + "."],
      ["(" + q.A + " " + M + " " + tD(q.pb * q.pb, sq(q.V)) + ")(" + q.A + " + " + tD(q.pb * q.pb, sq(q.V)) + ")", "У дужках — не " + tD(q.pb * q.pb, sq(q.V)) + ", а " + q.B + ", бо (" + q.B + ")² = " + tD(q.pb * q.pb, sq(q.V)) + "."]]);
    if (g.o.length < 3) return G.fDsqFac();
    return choice("Розклади на множники", src + " = ___", right, g.o,
      ["Це різниця квадратів: a² − b² = (a − b)(a + b).", tD(q.pa * q.pa, sq(q.U)) + " = (" + q.A + ")², " + tD(q.pb * q.pb, sq(q.V)) + " = (" + q.B + ")²."],
      src + " = (" + q.A + ")² " + M + " (" + q.B + ")² = <b>" + right + "</b>.",
      { err: g.err, chk: { src: srcJ, vars: ["m", "n", "x", "y"] } });
  };
  G.fCubes = function () {
    var U = pick(["x", "a", "y"]), pa = pick([1, 1, 1, 2]), pb = R(1, 4), plus = Math.random() < 0.5;
    if (pa === 1 && pb === 1) pb = 2;
    if (pa === 2 && pb % 2 === 0) pb = pb - 1 || 1;
    var A = tD(pa, U), B = String(pb), c3 = pa * pa * pa, b3 = pb * pb * pb;
    var src = tD(c3, cub(U)) + (plus ? " + " : " " + M + " ") + b3, srcJ = c3 + "*" + U + "**3" + (plus ? "+" : "-") + b3;
    var sq2 = tD(pa * pa, sq(U)), ab = pa * pb;
    var right = "(" + A + (plus ? " + " : " " + M + " ") + B + ")(" + sq2 + (plus ? " " + M + " " : " + ") + tD(ab, U) + " + " + pb * pb + ")";
    var g = opts(right, [["(" + A + (plus ? " + " : " " + M + " ") + B + ")(" + sq2 + (plus ? " + " : " " + M + " ") + tD(ab, U) + " + " + pb * pb + ")", "У другій дужці знак середнього члена <b>протилежний</b>: a³ " + (plus ? "+" : M) + " b³ = (a " + (plus ? "+" : M) + " b)(a² " + (plus ? M : "+") + " ab + b²)."],
      ["(" + A + (plus ? " " + M + " " : " + ") + B + ")(" + sq2 + (plus ? " " + M + " " : " + ") + tD(ab, U) + " + " + pb * pb + ")", "Знак у першій дужці — як між кубами: " + (plus ? "сума" : "різниця") + " кубів → (a " + (plus ? "+" : M) + " b)."],
      ["(" + A + (plus ? " + " : " " + M + " ") + B + ")(" + sq2 + (plus ? " " + M + " " : " + ") + tD(2 * ab, U) + " + " + pb * pb + ")", "У другій дужці — <b>неповний</b> квадрат: середній член ab, а не 2ab."]]);
    return choice("Розклади на множники", src + " = ___", right, g.o,
      ["a³ " + (plus ? "+" : M) + " b³ = (a " + (plus ? "+" : M) + " b)(a² " + (plus ? M : "+") + " ab + b²).", "a = " + A + " (бо (" + A + ")³ = " + tD(c3, cub(U)) + "), b = " + B + " (бо " + B + "³ = " + b3 + ")."],
      src + " = (" + A + ")³ " + (plus ? "+" : M) + " " + B + "³ = <b>" + right + "</b>.",
      { err: g.err, chk: { src: srcJ, vars: [U] } });
  };
  G.fMulti = function () {
    var k = R(2, 5), a = R(1, 6), t = R(1, 3), src, srcJ, right, list, h, e;
    if (t === 1) { // kx³ − ka²x = kx(x − a)(x + a)
      src = tD(k, "x³") + " " + M + " " + tD(k * a * a, "x"); srcJ = k + "*x**3-" + k * a * a + "*x";
      right = tD(k, "x") + "(x " + M + " " + a + ")(x + " + a + ")";
      list = [[tD(k, "x") + "(" + polyD([[1, "x²"], [-a * a, ""]]) + ")", "Тотожно правильно, але <b>не до кінця</b>: x² " + M + " " + a * a + " ще розкладається як різниця квадратів."],
        [tD(k, "x") + "(x " + M + " " + a + ")²", "x² " + M + " " + a * a + " — різниця квадратів: (x − " + a + ")(x + " + a + "), а не квадрат різниці."],
        [tD(k, "x") + "(x " + M + " " + a * a + ")(x + " + a * a + ")", "x² " + M + " " + a * a + " = (x " + M + " " + a + ")(x + " + a + "), бо " + a + "² = " + a * a + "."]];
      h = ["Спершу винеси спільний множник " + tD(k, "x") + ".", "У дужках лишиться x² " + M + " " + a * a + " — різниця квадратів."];
      e = src + " = " + tD(k, "x") + "(x² " + M + " " + a * a + ") = <b>" + right + "</b>."; }
    else if (t === 2) { // kx² ∓ 2kax + ka² = k(x ∓ a)²
      var sg = pick([1, -1]); src = polyD([[k, "x²"], [-2 * sg * k * a, "x"], [k * a * a, ""]]); srcJ = pJ([[k, "x²"], [-2 * sg * k * a, "x"], [k * a * a, ""]]);
      right = k + "(x " + (sg > 0 ? M : "+") + " " + a + ")²";
      list = [[k + "(" + polyD([[1, "x²"], [-2 * sg * a, "x"], [a * a, ""]]) + ")", "Тотожно правильно, але <b>не до кінця</b>: у дужках — квадрат двочлена."],
        [k + "(x " + (sg > 0 ? "+" : M) + " " + a + ")²", "Знак у дужках — як у середнього члена."],
        [k + "(x " + M + " " + a + ")(x + " + a + ")", "Тут є середній член — це квадрат двочлена, а не різниця квадратів."]];
      h = ["Спершу винеси спільний множник " + k + ".", "У дужках — x² " + (sg > 0 ? M : "+") + " " + 2 * a + "x + " + a * a + " = (x " + (sg > 0 ? M : "+") + " " + a + ")²."];
      e = src + " = " + k + "(" + polyD([[1, "x²"], [-2 * sg * a, "x"], [a * a, ""]]) + ") = <b>" + right + "</b>."; }
    else { // x³ − ax² − b²x + ab² = (x − a)(x − b)(x + b)
      var b = R(1, 5); if (b === a) b = a + 1;
      src = polyD([[1, "x³"], [-a, "x²"], [-b * b, "x"], [a * b * b, ""]]); srcJ = pJ([[1, "x³"], [-a, "x²"], [-b * b, "x"], [a * b * b, ""]]);
      right = "(x " + M + " " + a + ")(x " + M + " " + b + ")(x + " + b + ")";
      list = [["(x " + M + " " + a + ")(" + polyD([[1, "x²"], [-b * b, ""]]) + ")", "Тотожно правильно, але <b>не до кінця</b>: x² " + M + " " + b * b + " — різниця квадратів."],
        ["(x + " + a + ")(x " + M + " " + b + ")(x + " + b + ")", "Перевір знак: " + polyD([[-b * b, "x"], [a * b * b, ""]]) + " = " + M + b * b + "(x " + M + " " + a + ")."],
        ["(x " + M + " " + a + ")(x " + M + " " + b + ")²", "x² " + M + " " + b * b + " = (x − " + b + ")(x + " + b + "), а не (x − " + b + ")²."]];
      h = ["Згрупуй: (x³ " + M + " " + tD(a, "x²") + ") + (" + polyD([[-b * b, "x"], [a * b * b, ""]]) + ").", "x²(x " + M + " " + a + ") " + M + " " + b * b + "(x " + M + " " + a + ") = (x " + M + " " + a + ")(x² " + M + " " + b * b + "), а далі — різниця квадратів."];
      e = src + " = x²(x " + M + " " + a + ") " + M + " " + b * b + "(x " + M + " " + a + ") = (x " + M + " " + a + ")(x² " + M + " " + b * b + ") = <b>" + right + "</b>."; }
    var g = opts(right, list);
    return choice("Розклади на множники", src + " = ___", right, g.o, h, e, { err: g.err, chk: { src: srcJ, vars: ["x"], incomplete: list[0][0] } });
  };

  /* =================== Розділ 3: функції (§22–24) =================== */
  function linD(k, b, y) { return (y || "y") + " = " + (k === 0 ? sn(b) : polyD([[k, "x"], [b, ""]])); }
  function kD(k) { return Number.isInteger(k) ? k : fr(Math.round(k * 2), 2); }
  /* SVG-графік прямої y = kx + b на клітинках −6…6 */
  function graphSVG(k, b, mark) {
    var S = 18, N = 6, W = S * (2 * N) + 1, o = '<svg viewBox="0 0 ' + W + ' ' + W + '" width="234" height="234" style="background:#fff;border-radius:10px;max-width:100%">';
    for (var i = 0; i <= 2 * N; i++) { var c = i * S + 0.5; o += '<line x1="' + c + '" y1="0" x2="' + c + '" y2="' + W + '" stroke="#e6e1d6"/><line x1="0" y1="' + c + '" x2="' + W + '" y2="' + c + '" stroke="#e6e1d6"/>'; }
    var C = N * S + 0.5; o += '<line x1="0" y1="' + C + '" x2="' + W + '" y2="' + C + '" stroke="#555" stroke-width="1.5"/><line x1="' + C + '" y1="0" x2="' + C + '" y2="' + W + '" stroke="#555" stroke-width="1.5"/>';
    o += '<text x="' + (W - 9) + '" y="' + (C - 4) + '" font-size="11" fill="#555">x</text><text x="' + (C + 4) + '" y="10" font-size="11" fill="#555">y</text><text x="' + (C + S - 3) + '" y="' + (C + 12) + '" font-size="10" fill="#555">1</text><text x="' + (C - 9) + '" y="' + (C - S + 4) + '" font-size="10" fill="#555">1</text>';
    var X1 = -N, X2 = N, P = function (x, y) { return [(x + N) * S + 0.5, (N - y) * S + 0.5]; };
    var a = P(X1, k * X1 + b), z = P(X2, k * X2 + b);
    o += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + z[0] + '" y2="' + z[1] + '" stroke="#4B44E6" stroke-width="2.5"/>';
    if (mark) { var m = P(mark[0], mark[1]); o += '<circle cx="' + m[0] + '" cy="' + m[1] + '" r="3.5" fill="#4B44E6"/>'; }
    return o + '</svg>';
  }
  G.fnVal = function () {
    var t = R(1, 3);
    if (t === 1) { var k = RNZ(-5, 5), b = R(-9, 9), x = RNZ(-6, 6), f = linD(k, b, "f(x)"), r = k * x + b;
      return num(f + "\nf(" + sn(x) + ") = ___", sn(r), ["Підстав x = " + sn(x) + " у формулу.", substD([[k, x], [b, null]]) + " = ?"], "f(" + sn(x) + ") = " + substD([[k, x], [b, null]]) + " = <b>" + sn(r) + "</b>.",
        { task: "Знайди значення функції", err: errs([[sn(-r), x < 0 ? "Перевір знаки: від'ємне x бери в дужки — " + sn(k) + " " + X + " " + pn(x) + " = " + sn(k * x) + "." : "Перевір знак: " + sn(k) + " " + X + " " + x + " = " + sn(k * x) + "."]], sn(r)), chk: { v: k + "*(" + x + ")+(" + b + ")" } }); }
    if (t === 2) { var c = R(-9, 9), x2 = RNZ(-5, 5), r2 = x2 * x2 + c;
      return num("f(x) = x²" + tailT(c, "") + "\nf(" + sn(x2) + ") = ___", sn(r2), ["Підстав x = " + sn(x2) + ": " + pn(x2) + "²" + tailT(c, "") + ".", pn(x2) + "² = " + x2 * x2 + " — квадрат завжди невід'ємний."], "f(" + sn(x2) + ") = " + pn(x2) + "²" + tailT(c, "") + " = " + x2 * x2 + tailT(c, "") + " = <b>" + sn(r2) + "</b>.",
        { task: "Знайди значення функції", err: errs(x2 < 0 ? [[sn(-x2 * x2 + c), pn(x2) + "² = " + x2 * x2 + ", а не " + sn(-x2 * x2) + "."]] : [[sn(2 * x2 + c), x2 + "² = " + x2 + " " + X + " " + x2 + ", а не " + x2 + " " + X + " 2."]], sn(r2)), chk: { v: "(" + x2 + ")**2+(" + c + ")" } }); }
    var k3 = RNZ(-6, 6), b3 = R(-12, 12), x3 = RNZ(-8, 8), y3 = k3 * x3 + b3;
    if (Math.abs(k3) === 1) k3 = k3 * 2, y3 = k3 * x3 + b3;
    return num(linD(k3, b3) + "\nПри якому x значення функції дорівнює " + sn(y3) + "?  x = ___", sn(x3), ["Підстав y = " + sn(y3) + " і розв'яжи рівняння: " + polyD([[k3, "x"], [b3, ""]]) + " = " + sn(y3) + ".", "Перенеси " + sn(b3) + " вправо зі зміною знака, потім поділи на " + sn(k3) + "."],
      polyD([[k3, "x"], [b3, ""]]) + " = " + sn(y3) + " → " + tail(k3, y3 - b3, sn(x3)) + ".", { task: "Знайди аргумент", long: true, err: errs([[sn(k3 * y3 + b3), "Це значення функції при x = " + sn(y3) + ". А тут відоме саме значення y — треба знайти x."]], sn(x3)), chk: { eq: k3 + "*x+(" + b3 + ")", r: String(y3) } });
  };
  G.fnDom = function () {
    var a = RNZ(-9, 9), c = R(1, 4), k = RNZ(-9, 9), t = Math.random() < 0.5;
    var den = t ? polyD([[1, "x"], [-a, ""]]) : polyD([[c, "x"], [-c * a, ""]]), num1 = t ? sn(k) : "(x + " + R(1, 9) + ")";
    if (Math.random() < 0.35) {
      var kind = R(1, 3), fD = kind === 1 ? "y = " + num1 + " / (" + den + ")" : kind === 2 ? linD(RNZ(-5, 5), R(-9, 9)) : "y = " + R(1, 9) + " / (x² + " + R(1, 9) + ")";
      var right = kind === 1 ? "усі числа, крім " + sn(a) : "усі числа";
      var w = kind === 1 ? ["усі числа", "усі числа, крім " + sn(-a), "усі числа, крім 0"] : ["усі числа, крім 0", "усі числа, крім " + R(1, 9), "жодне число"];
      var er = {}; if (kind === 1) { er["усі числа"] = "При x = " + sn(a) + " знаменник " + den + " дорівнює 0 — ділити не можна."; er["усі числа, крім " + sn(-a)] = "Розв'яжи " + den + " = 0 уважно: x = " + sn(a) + "."; }
      else er["усі числа, крім 0"] = kind === 2 ? "Тут немає ділення на вираз з x — підходить будь-яке x." : "x² + число завжди більше за 0, тож знаменник ніколи не дорівнює нулю.";
      return choice("Яка область визначення функції", fD, right, w,
        ["Область визначення — усі x, при яких формула має зміст. Перешкода в 7 класі одна — ділення на нуль.", "Чи може знаменник дорівнювати нулю? При якому x?"],
        kind === 1 ? den + " = 0 при x = " + sn(a) + ", тож область визначення — <b>усі числа, крім " + sn(a) + "</b>." : kind === 2 ? "Лінійна функція визначена при <b>будь-яких</b> x." : "x² ≥ 0, тож x² + число > 0 — знаменник не дорівнює нулю: <b>усі числа</b>.",
        { long: true, err: er, chk: { domain: kind === 1 ? a : "—", kind: kind } });
    }
    return num("y = " + num1 + " / (" + den + ")\nне визначена при x = ___", sn(a),
      ["На нуль ділити не можна: функція не визначена там, де знаменник дорівнює 0.", den + " = 0 → x = ?"],
      den + " = 0 → x = <b>" + sn(a) + "</b>. Область визначення — усі числа, крім " + sn(a) + ".",
      { task: "Знайди, при якому x функція не визначена", long: true, err: errs([[sn(-a), "Розв'яжи " + den + " = 0 уважно: переносимо число зі зміною знака."]], sn(a)), chk: { eq: t ? "x-(" + a + ")" : c + "*x-(" + c * a + ")", r: "0" } });
  };
  function graphF(f, mark) {
    var S = 18, N = 6, W = S * (2 * N) + 1, o = graphSVG(0, 100).replace(/<line x1="[^"]*" y1="[^"]*" x2="[^"]*" y2="[^"]*" stroke="#4B44E6"[^>]*\/>/, ""), pts = [];
    for (var x = -N; x <= N + 1e-9; x += 0.125) { var y = f(x); if (Math.abs(y) <= N + 0.6) pts.push(((x + N) * S + 0.5).toFixed(1) + "," + ((N - y) * S + 0.5).toFixed(1)); else if (pts.length) { pts.push("M"); } }
    var d = "M" + pts.join(" L").replace(/ LM L/g, " M").replace(/ LM$/, "");
    return o.replace("</svg>", '<path d="' + d + '" fill="none" stroke="#4B44E6" stroke-width="2.5"/></svg>');
  }
  G.fnGraph = function () {
    if (Math.random() < 0.35) { // парабола
      var sg = pick([1, -1]), c = sg > 0 ? R(-4, 1) : R(-1, 4), xs = [];
      for (var xx = -3; xx <= 3; xx++) { var yy = sg * xx * xx + c; if (Math.abs(yy) <= 5 && xx !== 0) xs.push(xx); }
      if (!xs.length) return G.fnGraph();
      var x0 = pick(xs), y0 = sg * x0 * x0 + c;
      return num("За графіком знайди y, якщо x = " + sn(x0) + ".\ny = ___", sn(y0),
        ["Знайди на осі x число " + sn(x0) + " і рухайся вертикально до кривої.", "Від точки на кривій — горизонтально до осі y."],
        "На графіку точка (" + sn(x0) + "; " + sn(y0) + "), тож y = <b>" + sn(y0) + "</b>. (Це графік y = " + (sg < 0 ? M : "") + "x²" + tailT(c, "") + ".)",
        { task: "Графік функції", long: true, pic: graphF(function (x) { return sg * x * x + c; }), err: errs([[sn(-y0), "Перевір знак: нижче осі x — від'ємні y."]], sn(y0)), chk: { v: String(y0) } });
    }
    var k = pick([1, -1, 2, -2, 0.5, -0.5]), b = R(-3, 3), xs = [], x;
    for (x = -5; x <= 5; x++) { var y = k * x + b; if (Number.isInteger(y) && Math.abs(y) <= 5 && x !== 0) xs.push(x); }
    if (!xs.length) return G.fnGraph();
    x = pick(xs); var y0 = k * x + b, ask = Math.random() < 0.7 ? "y" : "x";
    var p = ask === "y" ? "За графіком знайди y, якщо x = " + sn(x) + ".\ny = ___" : "За графіком знайди x, при якому y = " + sn(y0) + ".\nx = ___";
    return num(p, ask === "y" ? sn(y0) : sn(x),
      [ask === "y" ? "Знайди на осі x число " + sn(x) + ", піднімись (опустись) по клітинках до прямої." : "Знайди на осі y число " + sn(y0) + ", пройди по горизонталі до прямої.", "Від точки на прямій — до іншої осі. Скільки клітинок?"],
      "На графіку точка (" + sn(x) + "; " + sn(y0) + "), тож " + (ask === "y" ? "y = <b>" + sn(y0) + "</b>" : "x = <b>" + sn(x) + "</b>") + ". (Це пряма " + linD(kD(k) === k ? k : k, b).replace(/0\.5/, "0,5") + ".)",
      { task: "Графік функції", long: true, pic: graphSVG(k, b), err: errs(ask === "y" ? [[sn(x), "Це x. Від x = " + sn(x) + " іди до прямої, а потім до осі y."], [sn(-y0), "Перевір знак: нижче осі x — від'ємні y."]] : [[sn(y0), "Це y. Шукаємо x — точку на горизонтальній осі."], [sn(-x), "Перевір знак: ліворуч від осі y — від'ємні x."]], ask === "y" ? sn(y0) : sn(x)), chk: { v: String(ask === "y" ? y0 : x) } });
  };
  G.fnPt = function () {
    var k = RNZ(-5, 5), b = R(-8, 8), x = RNZ(-5, 5), ok = Math.random() < 0.5, y = k * x + b + (ok ? 0 : pick([-2, -1, 1, 2]));
    return choice("Чи належить точка A(" + sn(x) + "; " + sn(y) + ") графіку функції", linD(k, b), ok ? "Так" : "Ні", [ok ? "Ні" : "Так"],
      ["Точка належить графіку, якщо її координати задовольняють формулу.", "Підстав x = " + sn(x) + ": y = " + substD([[k, x], [b, null]]) + ". Порівняй з " + sn(y) + "."],
      "y(" + sn(x) + ") = " + substD([[k, x], [b, null]]) + " = " + sn(k * x + b) + (ok ? " = " + sn(y) + " — <b>так</b>, належить." : " ≠ " + sn(y) + " — <b>ні</b>, не належить."),
      { long: true, chk: { pt: [x, y, k, b] } });
  };
  G.fnKB = function () {
    var k = RNZ(-7, 7), b = RNZ(-9, 9), t = R(1, 4), f, ask = Math.random() < 0.5 ? "k" : "b";
    if (t === 4) { f = "y = " + sn(b) + (k < 0 ? " " + M + " " + (k === -1 ? "" : -k) : " + " + (k === 1 ? "" : k)) + "x"; } else f = linD(k, b);
    if (t === 3 && Math.random() < 0.5) { f = "y = " + (k === 1 ? "" : k === -1 ? M : sn(k)) + "x"; b = 0; ask = Math.random() < 0.5 ? "k" : "b"; }
    var r = ask === "k" ? k : b;
    return num(f + "\n" + ask + " = ___", sn(r),
      ["Лінійна функція: y = kx + b. k — число біля x (кутовий коефіцієнт), b — вільний член.", "Порядок членів не важливий: y = 4 − 3x — це y = −3x + 4. Немає вільного члена — b = 0."],
      (t === 4 ? f + " = " + linD(k, b).slice(4) : f) + ": k = " + sn(k) + ", b = " + sn(b) + ". Відповідь: <b>" + sn(r) + "</b>.",
      { task: "Знайди коефіцієнт лінійної функції", err: errs([[sn(ask === "k" ? b : k), ask === "k" ? "Це b (вільний член). k — число біля x." : "Це k (число біля x). b — вільний член."], [sn(-r), "Знак належить коефіцієнту."]], sn(r)), chk: { v: String(r) } });
  };
  G.fnAxis = function () {
    var k = RNZ(-6, 6), x0 = RNZ(-8, 8), b = -k * x0, oy = Math.random() < 0.35;
    if (Math.abs(k) === 1) { k = 2 * k; b = -k * x0; }
    var f = linD(k, b);
    if (oy) return num(f + "\nграфік перетинає вісь y у точці (0; ___)", sn(b), ["На осі y абсциса x = 0.", "Підстав x = 0 у формулу — чому дорівнює y?"], "x = 0 → y = <b>" + sn(b) + "</b> (це завжди b).",
      { task: "Точка перетину з віссю y", long: true, err: errs([[sn(x0), "Це перетин з віссю x. З віссю y — підстав x = 0."]], sn(b)), chk: { v: String(b) } });
    return num(f + "\nграфік перетинає вісь x у точці (___; 0)", sn(x0), ["На осі x ордината y = 0.", "Розв'яжи " + polyD([[k, "x"], [b, ""]]) + " = 0."],
      polyD([[k, "x"], [b, ""]]) + " = 0 → " + tail(k, -b, sn(x0)) + ".", { task: "Точка перетину з віссю x", long: true, err: errs([[sn(b), "Це перетин з віссю y (x = 0). З віссю x — y = 0."], [sn(-x0), "Розв'язуючи " + polyD([[k, "x"], [b, ""]]) + " = 0, переносимо " + sn(b) + " зі зміною знака."]], sn(x0)), chk: { eq: k + "*x+(" + b + ")", r: "0" } });
  };
  G.fnPar = function () {
    if (Math.random() < 0.4) { var k = RNZ(-6, 6), b = R(-9, 9), up = k > 0;
      return choice("Функція зростає чи спадає", linD(k, b), up ? "Зростає" : "Спадає", [up ? "Спадає" : "Зростає"],
        ["Дивись на знак k — числа біля x.", "k > 0 — зростає (графік іде вгору зліва направо), k < 0 — спадає."],
        "k = " + sn(k) + (up ? " > 0 — функція <b>зростає</b>." : " < 0 — функція <b>спадає</b>."), { long: true, err: (function () { var o = {}; o[up ? "Спадає" : "Зростає"] = "Важить знак k (" + sn(k) + "), а не b."; return o; })(), chk: { incr: k } }); }
    var k1 = RNZ(-5, 5), b1 = R(-8, 8), b2; do { b2 = R(-8, 8); } while (b2 === b1);
    var right = linD(k1, b2), w = [linD(-k1, b1), linD(k1 + pick([1, 2]), b1), linD(k1 === 0 ? 1 : (k1 % 2 === 0 ? k1 / 2 : k1 * 2), b2)];
    var err = {}; err[w[0]] = "Паралельні прямі мають <b>однакові</b> k. Тут k = " + sn(-k1) + ", а треба " + sn(k1) + "."; err[w[1]] = "Однакове b означає спільну точку на осі y, а не паралельність. Дивись на k."; err[w[2]] = "k має бути рівно " + sn(k1) + ".";
    return choice("Який графік паралельний графіку", linD(k1, b1), right, w,
      ["Графіки y = k₁x + b₁ і y = k₂x + b₂ паралельні, якщо k₁ = k₂ і b₁ ≠ b₂.", "Шукай пряму з k = " + sn(k1) + "."],
      "У " + right + " k = " + sn(k1) + ", як у " + linD(k1, b1) + ", а b різні — графіки <b>паралельні</b>.", { long: true, err: err, chk: { par: [k1, b1] } });
  };

  /* =================== Розділ 4: системи (§25–30) =================== */
  function eq2D(a, b, c) { return polyD([[a, "x"], [b, "y"]]) + " = " + sn(c); }
  function sysH(e1, e2) { return '<div class="sys"><div>' + e1 + '</div><div>' + e2 + '</div></div>'; }
  G.sPair = function () {
    var a = RNZ(-6, 6), b = RNZ(-6, 6), x = R(-5, 5), y = R(-5, 5), ok = Math.random() < 0.5, c = a * x + b * y + (ok ? 0 : pick([-2, -1, 1, 2]));
    return choice("Чи є пара (" + sn(x) + "; " + sn(y) + ") розв'язком рівняння", eq2D(a, b, c), ok ? "Так" : "Ні", [ok ? "Ні" : "Так"],
      ["Пара (x; y): перше число — x, друге — y. Підстав обидва.", substD([[a, x], [b, y]]) + " = ?"],
      substD([[a, x], [b, y]]) + " = " + sn(a * x + b * y) + (ok ? " = " + sn(c) + " — <b>так</b>." : " ≠ " + sn(c) + " — <b>ні</b>."),
      { long: true, err: (function () { var o = {}; if (a * y + b * x === c && !ok) o["Так"] = "Перше число пари — x, друге — y. Ти, схоже, поміняла їх місцями."; return o; })(), chk: { lin: [a, b, c, x, y] } });
  };
  G.sExpr = function () {
    var a = RNZ(-5, 5), x = RNZ(-6, 6), y = RNZ(-6, 6), c = a * x + y, ask = Math.random() < 0.6 ? "y" : "x";
    var eq = polyD([[a, "x"], [1, "y"]]) + " = " + sn(c);
    if (ask === "y") return num(eq + "\nвирази y через x і знайди y при x = " + sn(x) + ".\ny = ___", sn(y),
      ["Вирази y: y = " + sn(c) + (a < 0 ? " + " + polyD([[-a, "x"]]) : " " + M + " " + polyD([[a, "x"]])) + ".", "Підстав x = " + sn(x) + "."],
      "y = " + sn(c) + (a < 0 ? " + " + polyD([[-a, "x"]]) : " " + M + " " + polyD([[a, "x"]])) + " = " + sn(c) + (a * x < 0 ? " + " + (-a * x) : " " + M + " " + a * x) + " = <b>" + sn(y) + "</b>.",
      { task: "Лінійне рівняння з двома змінними", long: true, err: errs([[sn(c + a * x), "Переносячи " + polyD([[a, "x"]]) + " вправо, змінюй знак."]], sn(y)), chk: { lin2: [a, 1, c, "x", x, "y"] } });
    if (Math.abs(a) === 1) a = a * 2, c = a * x + y, eq = polyD([[a, "x"], [1, "y"]]) + " = " + sn(c);
    return num(eq + "\nзнайди x, якщо y = " + sn(y) + ".\nx = ___", sn(x),
      ["Підстав y = " + sn(y) + ": " + polyD([[a, "x"]]) + tailT(y, "") + " = " + sn(c) + ".", polyD([[a, "x"]]) + " = " + sn(c - y) + "."],
      polyD([[a, "x"]]) + " = " + sn(c) + (y < 0 ? " + " + (-y) : " " + M + " " + y) + " = " + sn(c - y) + " → x = <b>" + sn(x) + "</b>.",
      { task: "Лінійне рівняння з двома змінними", long: true, err: errs([[sn(-x), "Ділимо на " + sn(a) + " разом зі знаком."]], sn(x)), chk: { lin2: [a, 1, c, "y", y, "x"] } });
  };
  G.sCount = function () {
    var kind = pick(["one", "none", "inf"]), k = RNZ(-4, 4), b = R(-6, 6), m = pick([2, 3, -2]);
    var e1, e2, sys;
    if (kind === "one") { var k2; do { k2 = RNZ(-4, 4); } while (k2 === k); e1 = linD(k, b); e2 = Math.random() < 0.5 ? linD(k2, R(-6, 6)) : eq2D(-k2 * m, m, m * R(-6, 6)); }
    else if (kind === "none") { var b2; do { b2 = R(-6, 6); } while (b2 === b); e1 = linD(k, b); e2 = linD(k, b2); }
    else { e1 = linD(k, b); e2 = eq2D(-m * k, m, m * b); }
    var right = { one: "Один розв'язок", none: "Жодного розв'язку", inf: "Безліч розв'язків" }[kind];
    var it = choice("Скільки розв'язків має система", "Скільки розв'язків?", right, ["Один розв'язок", "Жодного розв'язку", "Безліч розв'язків"],
      ["Кожне рівняння — пряма. Розв'язок системи — спільна точка прямих. Запиши обидва як y = kx + b.", "Різні k — прямі перетинаються (1 розв'язок). Однакові k, різні b — паралельні (0). Однакові k і b — збігаються (безліч)."],
      kind === "one" ? "Кутові коефіцієнти різні — прямі перетинаються в одній точці: <b>один розв'язок</b>." : kind === "none" ? "k однакові (" + sn(k) + "), b різні — прямі паралельні, спільних точок немає: <b>жодного розв'язку</b>." : "Друге рівняння — це перше, помножене на " + sn(m) + " (" + eq2D(-m * k, m, m * b) + " ⇔ " + e1 + "): прямі збігаються — <b>безліч розв'язків</b>.",
      { long: true, pic: sysH(e1, e2), chk: { count: [e1, e2], kind: kind } });
    it.o = ["Один розв'язок", "Жодного розв'язку", "Безліч розв'язків"];
    return it;
  };
  function sysPick(easy) { // a1x + b1y = c1, a2x + b2y = c2 з цілим розв'язком
    var x = RNZ(-6, 6), y = RNZ(-6, 6), a1, b1, a2, b2;
    for (;;) { a1 = RNZ(-5, 5); b1 = RNZ(-5, 5); a2 = RNZ(-5, 5); b2 = RNZ(-5, 5); if (a1 * b2 - a2 * b1 === 0) continue; if (easy === "sub" && !(Math.abs(b1) === 1 || Math.abs(a1) === 1)) continue; if (easy === "add" && !(b1 === -b2 || a1 === -a2)) continue; break; }
    return { a1: a1, b1: b1, c1: a1 * x + b1 * y, a2: a2, b2: b2, c2: a2 * x + b2 * y, x: x, y: y };
  }
  G.sSysPair = function () {
    var S = sysPick(), cands = [[S.x, S.y], [S.y, S.x], [S.x, -S.y], [-S.x, S.y], [S.x + 1, S.y], [S.x, S.y + 1]], o = [], seen = {}, sat = function (p) { return S.a1 * p[0] + S.b1 * p[1] === S.c1 && S.a2 * p[0] + S.b2 * p[1] === S.c2; };
    cands.forEach(function (p, i) { var d = "(" + sn(p[0]) + "; " + sn(p[1]) + ")"; if (!seen[d] && (i === 0 || !sat(p)) && o.length < 4) { seen[d] = 1; o.push(d); } });
    var right = o[0], half = o.slice(1).filter(function (d) { return true; });
    var err = {}; o.slice(1).forEach(function (d, i) { var p = d.replace(/[()]/g, "").split("; ").map(function (v) { return +v.replace("−", "-"); }); var s1 = S.a1 * p[0] + S.b1 * p[1] === S.c1, s2 = S.a2 * p[0] + S.b2 * p[1] === S.c2; err[d] = s1 && !s2 ? "Ця пара задовольняє лише перше рівняння. Розв'язок системи — пара, що підходить до <b>обох</b>." : !s1 && s2 ? "Ця пара задовольняє лише друге рівняння, а треба обидва." : (S.a1 * p[1] + S.b1 * p[0] === S.c1 && S.a2 * p[1] + S.b2 * p[0] === S.c2 ? "Перше число пари — x, друге — y. Ти, схоже, поміняла їх місцями." : "Ця пара не підходить до жодного рівняння — підстав і перевір обидва."); });
    return choice("Яка пара є розв'язком системи", "Обери пару (x; y)", right, half,
      ["Розв'язок системи — пара, яка задовольняє <b>обидва</b> рівняння.", "Підставляй кожну пару в обидва рівняння."],
      "(" + sn(S.x) + "; " + sn(S.y) + "): " + substD([[S.a1, S.x], [S.b1, S.y]]) + " = " + sn(S.c1) + " ✓, " + substD([[S.a2, S.x], [S.b2, S.y]]) + " = " + sn(S.c2) + " ✓ — <b>" + right + "</b>.",
      { long: true, pic: sysH(eq2D(S.a1, S.b1, S.c1), eq2D(S.a2, S.b2, S.c2)), err: err, chk: { sys: [S.a1, S.b1, S.c1, S.a2, S.b2, S.c2], pairs: true } });
  };
  function solveText(S, method) {
    if (method === "sub") {
      var fromFirst = Math.abs(S.b1) === 1, v = fromFirst ? "y" : "x";
      if (fromFirst) { var ex = sn(S.b1 * S.c1) + (S.b1 * S.a1 < 0 ? " + " + polyD([[-S.b1 * S.a1, "x"]]) : " " + M + " " + polyD([[S.b1 * S.a1, "x"]]));
        return "З першого: y = " + ex + ". Підставляємо в друге: " + polyD([[S.a2, "x"]]) + " " + (S.b2 < 0 ? M : "+") + " " + (Math.abs(S.b2) === 1 ? "" : Math.abs(S.b2)) + "(" + ex + ") = " + sn(S.c2) + " → x = " + sn(S.x) + "; y = " + sn(S.y) + "."; }
      var ex2 = sn(S.a1 * S.c1) + (S.a1 * S.b1 < 0 ? " + " + polyD([[-S.a1 * S.b1, "y"]]) : " " + M + " " + polyD([[S.a1 * S.b1, "y"]]));
      return "З першого: x = " + ex2 + ". Підставляємо в друге: " + (Math.abs(S.a2) === 1 ? (S.a2 < 0 ? M : "") : sn(S.a2)) + "(" + ex2 + ")" + tailT(S.b2, "y") + " = " + sn(S.c2) + " → y = " + sn(S.y) + "; x = " + sn(S.x) + ".";
    }
    if (S.b1 === -S.b2) return "Додаємо рівняння: y знищується → " + polyD([[S.a1 + S.a2, "x"]]) + " = " + sn(S.c1 + S.c2) + " → x = " + sn(S.x) + "; підставляємо: y = " + sn(S.y) + ".";
    return "Додаємо рівняння: x знищується → " + polyD([[S.b1 + S.b2, "y"]]) + " = " + sn(S.c1 + S.c2) + " → y = " + sn(S.y) + "; підставляємо: x = " + sn(S.x) + ".";
  }
  G.sSub = function () {
    var S = sysPick("sub"), ask = "y", r = S.y;
    return num("Знайди розв'язок (x; y): спершу x, потім y.", sn(r),
      ["Вирази з першого рівняння ту змінну, при якій коефіцієнт ±1.", "Підстав цей вираз у друге рівняння — вийде рівняння з однією змінною."],
      solveText(S, "sub") + " Відповідь: <b>(" + sn(S.x) + "; " + sn(S.y) + ")</b>.",
      { task: "Розв'яжи систему способом підстановки", long: true, steps: [{ q: "x =", a: sn(S.x), how: "x = " + sn(S.x), tip: "Вирази одну змінну з рівняння, де коефіцієнт ±1, і підстав у друге." }, { q: "y =", a: sn(S.y), how: "y = " + sn(S.y) }], pic: sysH(eq2D(S.a1, S.b1, S.c1), eq2D(S.a2, S.b2, S.c2)), err: errs([[sn(ask === "x" ? S.y : S.x), "Це значення " + (ask === "x" ? "y" : "x") + ". А питають " + ask + "."]], sn(r)), chk: { sys: [S.a1, S.b1, S.c1, S.a2, S.b2, S.c2], ask: ask } });
  };
  G.sAdd = function () {
    var mode = pick(["opp", "mul1", "mul1", "mul2"]), x = RNZ(-6, 6), y = RNZ(-6, 6), a1, b1, a2, b2, k1 = 1, k2 = 1, v;
    for (;;) {
      a1 = RNZ(-5, 5); b1 = RNZ(-5, 5); v = pick(["x", "y"]); k1 = 1; k2 = 1;
      if (mode === "opp") { a2 = v === "x" ? -a1 : RNZ(-5, 5); b2 = v === "y" ? -b1 : RNZ(-5, 5); }
      else if (mode === "mul1") { k2 = pick([2, 3, -2, -3]); var t1 = v === "x" ? a1 : b1; if (t1 % k2) continue; if (v === "x") { a2 = -a1 / k2; b2 = RNZ(-5, 5); } else { b2 = -b1 / k2; a2 = RNZ(-5, 5); } }
      else { var c1 = pick([2, 3, 4, 5]), c2 = pick([2, 3, 4, 5]); if (c1 === c2 || gcd(c1, c2) !== 1) continue; if (v === "x") { a1 = c1 * pick([1, -1]); a2 = c2 * pick([1, -1]); b1 = RNZ(-5, 5); b2 = RNZ(-5, 5); } else { b1 = c1 * pick([1, -1]); b2 = c2 * pick([1, -1]); a1 = RNZ(-5, 5); a2 = RNZ(-5, 5); } k1 = (v === "x" ? a2 : b2); k2 = -(v === "x" ? a1 : b1); }
      if (a1 * b2 - a2 * b1 === 0 || !a2 || !b2) continue; break;
    }
    var S = { a1: a1, b1: b1, c1: a1 * x + b1 * y, a2: a2, b2: b2, c2: a2 * x + b2 * y }, ask = "y", r = y;
    var A1 = S.a1 * k1 + S.a2 * k2, B1 = S.b1 * k1 + S.b2 * k2, C1 = S.c1 * k1 + S.c2 * k2;
    var how = (k1 !== 1 ? "Помножимо перше рівняння на " + sn(k1) + ", " : "") + (k2 !== 1 ? (k1 !== 1 ? "друге — на " : "Помножимо друге рівняння на ") + sn(k2) + ", щоб коефіцієнти при " + v + " стали протилежними. " : "") + "Додаємо: " + (v === "x" ? polyD([[B1, "y"]]) : polyD([[A1, "x"]])) + " = " + sn(C1) + " → " + (v === "x" ? "y = " + sn(y) : "x = " + sn(x)) + "; підставляємо — " + (v === "x" ? "x = " + sn(x) : "y = " + sn(y)) + ". Розв'язок (" + sn(x) + "; " + sn(y) + ").";
    var wrongAdd = null;
    if (mode === "mul1" && v === "x") { var B2 = S.b1 + S.b2 * k2, C2 = S.c1 + S.c2, w0 = C2 / B2; if (Number.isInteger(w0) && w0 !== r) wrongAdd = sn(w0); }
    return num("Знайди розв'язок (x; y): спершу x, потім y.", sn(r),
      [mode === "opp" ? "Коефіцієнти при " + v + " — протилежні числа. Додай рівняння почленно." : "Коефіцієнти ще не протилежні. На яке число помножити " + (mode === "mul2" ? "кожне рівняння" : "друге рівняння") + ", щоб коефіцієнти при " + v + " стали протилежними?", "Множимо <b>обидві</b> частини рівняння (і праву теж!). Потім додаємо — " + v + " знищиться."],
      how.replace(/ Розв'язок \(.*$/, "") + " Відповідь: <b>(" + sn(x) + "; " + sn(y) + ")</b>.",
      { task: "Розв'яжи систему способом додавання", long: true, steps: [{ q: "x =", a: sn(x), how: "x = " + sn(x), tip: "Зроби коефіцієнти при одній змінній протилежними (помнож обидві частини!) і додай рівняння." }, { q: "y =", a: sn(y), how: "y = " + sn(y) }], pic: sysH(eq2D(S.a1, S.b1, S.c1), eq2D(S.a2, S.b2, S.c2)), err: errs([[sn(ask === "x" ? y : x), "Це значення " + (ask === "x" ? "y" : "x") + ". А питають " + ask + "."]].concat(wrongAdd ? [[wrongAdd, "Множачи рівняння на число, множ <b>і праву частину</b> теж."]] : []), sn(r)), chk: { sys: [S.a1, S.b1, S.c1, S.a2, S.b2, S.c2], ask: ask } });
  };
  G.sWord = function () {
    var t = R(1, 7), x, y, txt, S, ask, xd, yd, ans;
    if (t === 1) { x = R(5, 25); y = R(4, 30); var n1 = R(2, 5), m1 = R(1, 4), n2 = R(1, 4), m2 = R(2, 5); if (n1 * m2 === n2 * m1) m2++;
      txt = n1 + " " + pl(n1, ["зошит", "зошити", "зошитів"]) + " і " + m1 + " " + pl(m1, ["ручка", "ручки", "ручок"]) + " коштують " + (n1 * x + m1 * y) + " грн, а " + n2 + " " + pl(n2, ["зошит", "зошити", "зошитів"]) + " і " + m2 + " " + pl(m2, ["ручка", "ручки", "ручок"]) + " — " + (n2 * x + m2 * y) + " грн. Скільки коштує ";
      S = [n1, m1, n1 * x + m1 * y, n2, m2, n2 * x + m2 * y]; ask = Math.random() < 0.5 ? "x" : "y"; txt += ask === "x" ? "зошит?" : "ручка?"; xd = "ціна зошита"; yd = "ціна ручки"; }
    else if (t === 2) { x = R(10, 60); y = R(2, x - 1); txt = "Сума двох чисел " + (x + y) + ", а їхня різниця " + (x - y) + ". Знайди " + (Math.random() < 0.5 ? (ask = "x", "більше") : (ask = "y", "менше")) + " число."; S = [1, 1, x + y, 1, -1, x - y]; xd = "більше число"; yd = "менше число"; }
    else if (t === 3) { x = R(5, 30); y = R(5, 30); var legs = 2 * x + 4 * y; txt = "У дворі кури й кролики. Разом " + (x + y) + " " + pl(x + y, ["голова", "голови", "голів"]) + " і " + legs + " " + pl(legs, ["нога", "ноги", "ніг"]) + ". Скільки " + (Math.random() < 0.5 ? (ask = "x", "курей") : (ask = "y", "кроликів")) + "?"; S = [1, 1, x + y, 2, 4, legs]; xd = "кури"; yd = "кролики"; }
    else if (t === 4) { x = R(3, 12); y = R(3, 12); var pA = pick([80, 100, 120]), pC = pick([40, 50, 60]); txt = "Продали " + (x + y) + " " + pl(x + y, ["квиток", "квитки", "квитків"]) + " на " + (pA * x + pC * y) + " грн: дорослий — по " + pA + " грн, дитячий — по " + pC + " грн. Скільки " + (Math.random() < 0.5 ? (ask = "x", "дорослих") : (ask = "y", "дитячих")) + " квитків продали?"; S = [1, 1, x + y, pA, pC, pA * x + pC * y]; xd = "дорослі квитки"; yd = "дитячі квитки"; }
    else if (t === 5) { y = R(1, 4); x = y + R(3, 12); var tt = R(2, 5), t2 = R(2, 5); var d1 = (x + y) * tt, d2 = (x - y) * t2; txt = "Човен за " + tt + " год за течією пройшов " + d1 + " км, а за " + t2 + " год проти течії — " + d2 + " км. Знайди " + (Math.random() < 0.5 ? (ask = "x", "власну швидкість човна") : (ask = "y", "швидкість течії")) + " (км/год)."; S = [tt, tt, d1, t2, -t2, d2]; xd = "власна швидкість човна"; yd = "швидкість течії"; }
    else if (t === 6) { y = R(4, 20); var kk = R(2, 4); x = kk * y + R(-3, 3); if (x === kk * y) x++; var dd = x - kk * y; txt = "Одне число в " + kk + " " + (kk < 5 ? "рази" : "разів") + " більше за інше" + (dd > 0 ? " і ще на " + dd : " без " + (-dd)) + ", а їхня сума " + (x + y) + ". Знайди " + (Math.random() < 0.5 ? (ask = "x", "більше") : (ask = "y", "менше")) + " число."; S = [1, 1, x + y, 1, -kk, dd]; xd = "більше число"; yd = "менше число"; }
    else { x = R(1, 8); y = R(1, 9); if (x === y) y = (y % 9) + 1; var sm = x + y; if (sm > 9 && Math.random() < 0.5) { y = 9 - x || 1; sm = x + y; } var nn = 10 * x + y, rv = 10 * y + x; txt = "Сума цифр двоцифрового числа дорівнює " + sm + ". Якщо цифри переставити, вийде число, " + (rv > nn ? "більше" : "менше") + " за дане на " + Math.abs(rv - nn) + ". Знайди дане число."; S = [1, 1, sm, -9, 9, rv - nn]; xd = "цифра десятків"; yd = "цифра одиниць"; ask = "n"; }
    ans = ask === "x" ? x : ask === "y" ? y : 10 * x + y;
    return num(txt, ans,
      ["Познач дві невідомі: x — " + xd + ", y — " + yd + ". Для кожної умови — своє рівняння." + (ask === "n" ? " Число з цифрами x і y — це 10x + y." : ""), "Перше рівняння: " + eq2D(S[0], S[1], S[2]) + ". А що каже друга умова? Склади друге рівняння сама."],
      "x — " + xd + ", y — " + yd + ". " + eq2D(S[0], S[1], S[2]) + ", " + eq2D(S[3], S[4], S[5]) + " → x = " + x + ", y = " + y + "." + (ask === "n" ? " Число 10x + y = " + ans + "." : "") + " Відповідь: <b>" + ans + "</b>.",
      { task: "Розв'яжи задачу за допомогою системи", long: true, err: errs(ask === "n" ? [[10 * y + x, "Це число з переставленими цифрами. Дане число — 10x + y, де x — десятки."]] : [[ask === "x" ? y : x, "Це друга невідома. Уважно: що питають у задачі?"]], ans), chk: { sys: S, ask: ask === "n" ? "n" : ask } });
  };
  /* §13: подільність: 7⁹ − 7⁸ ділиться на 6 */
  G.pDiv = function () {
    var b = pick([2, 3, 5, 6, 7, 9, 10, 11]), n = R(6, 15), plus = Math.random() < 0.35, k = plus ? b + 1 : b - 1;
    if (k < 2) return G.pDiv();
    var p = b + sup(n) + (plus ? " + " : " " + M + " ") + b + sup(n - 1);
    var bad = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].filter(function (d) { return d !== k && (Math.pow(b, 3) * k) % d !== 0 && b % d !== 0; });
    var w = shuffle(bad).slice(0, 3).map(String);
    return choice("На яке з чисел ділиться значення виразу", p, String(k), w,
      ["Винеси за дужки спільний множник — степінь з меншим показником: " + b + sup(n - 1) + ".", b + sup(n - 1) + "(" + b + (plus ? " + " : " " + M + " ") + "1) = " + b + sup(n - 1) + " " + X + " " + k + "."],
      p + " = " + b + sup(n - 1) + "(" + b + (plus ? " + " : " " + M + " ") + "1) = " + b + sup(n - 1) + " " + X + " " + k + " — один із множників " + k + ", тож вираз ділиться на <b>" + k + "</b>.",
      { long: true, chk: { div: [b, n, plus ? 1 : -1] } });
  };
  /* §24: k за точкою; точка перетину графіків */
  G.fnK = function () {
    if (Math.random() < 0.5) {
      var b = R(-6, 6), k = RNZ(-5, 5), x = RNZ(-4, 4), y = k * x + b;
      return num("Графік функції y = kx" + tailT(b, "") + " проходить через точку A(" + sn(x) + "; " + sn(y) + ").\nk = ___", sn(k),
        ["Точка лежить на графіку — її координати задовольняють формулу. Підстав x = " + sn(x) + " і y = " + sn(y) + ".", "Вийде рівняння з невідомим k."],
        sn(y) + " = k " + X + " " + pn(x) + tailT(b, "") + " → " + tail(x, y - b, sn(k)).replace(/x/g, "k") + ".",
        { task: "Знайди k", long: true, err: errs([[sn(-k), "Перевір знак: ділимо на " + sn(x) + " разом зі знаком."]], sn(k)), chk: { v: String((y - b) / x) } });
    }
    var k1, k2, b1, b2, X0 = RNZ(-5, 5), Y0;
    do { k1 = RNZ(-4, 4); k2 = RNZ(-4, 4); } while (k1 === k2);
    b1 = R(-6, 6); Y0 = k1 * X0 + b1; b2 = Y0 - k2 * X0;
    var ask = Math.random() < 0.5 ? "x" : "y";
    return num("Знайди точку перетину графіків " + linD(k1, b1) + " і " + linD(k2, b2) + ".\n" + ask + " = ___", sn(ask === "x" ? X0 : Y0),
      ["У точці перетину y однакові: прирівняй праві частини.", polyD([[k1, "x"], [b1, ""]]) + " = " + polyD([[k2, "x"], [b2, ""]]) + " — розв'яжи, потім знайди y."],
      polyD([[k1, "x"], [b1, ""]]) + " = " + polyD([[k2, "x"], [b2, ""]]) + " → x = " + sn(X0) + "; y = " + sn(Y0) + ". Точка (" + sn(X0) + "; " + sn(Y0) + "), відповідь: <b>" + sn(ask === "x" ? X0 : Y0) + "</b>.",
      { task: "Точка перетину графіків", long: true, err: errs([[sn(ask === "x" ? Y0 : X0), "Це друга координата точки. Питають " + ask + "."]], sn(ask === "x" ? X0 : Y0)), chk: { sys: [-k1, 1, b1, -k2, 1, b2], ask: ask } });
  };
  /* §27: графічний розв'язок системи */
  G.sGraph = function () {
    var ks = [1, -1, 2, -2, 0.5, -0.5], k1, k2, X0, Y0, b1, b2;
    for (;;) { k1 = pick(ks); k2 = pick(ks); if (k1 === k2) continue; X0 = R(-4, 4); Y0 = R(-4, 4); b1 = Y0 - k1 * X0; b2 = Y0 - k2 * X0; if (!Number.isInteger(b1) || !Number.isInteger(b2) || Math.abs(b1) > 5 || Math.abs(b2) > 5) continue; break; }
    var two = function (k, b) { return graphSVG(k, b); };
    var svg = graphSVG(k1, b1, [X0, Y0]).replace("</svg>", "") + graphSVG(k2, b2).replace(/^[\s\S]*?<line x1="0" y1="[^"]+" x2="[^"]+" y2="[^"]+" stroke="#555"[^>]*\/><line[^>]*\/>/, "").replace(/#4B44E6/, "#E0662B");
    var ask = Math.random() < 0.5 ? "x" : "y", r = ask === "x" ? X0 : Y0;
    var f1 = linD(k1, b1).replace(/0\.5/g, "0,5"), f2 = linD(k2, b2).replace(/0\.5/g, "0,5");
    return num("На малюнку — графіки рівнянь системи. За малюнком знайди розв'язок (x; y).\n" + ask + " = ___", sn(r),
      ["Розв'язок системи — точка, де прямі перетинаються.", "Від точки перетину опустись до осі x і пройди до осі y — прочитай обидві координати."],
      "Прямі перетинаються в точці (" + sn(X0) + "; " + sn(Y0) + "). Перевірка: " + f1 + " і " + f2 + " при x = " + sn(X0) + " дають y = " + sn(Y0) + ". Відповідь: <b>" + sn(r) + "</b>.",
      { task: "Графічний спосіб розв'язання системи", long: true, pic: svg, err: errs([[sn(ask === "x" ? Y0 : X0), "Це друга координата. x — по горизонталі, y — по вертикалі."]], sn(r)), chk: { sys: [-k1, 1, b1, -k2, 1, b2], ask: ask } });
  };
  /* §16–21: спрости / розв'яжи за формулами */
  G.fSimp = function () {
    var a = RNZ(-6, 6), b = R(1, 6), t = R(1, 3);
    if (t === 1) { // (x + a)² − (x − b)(x + b)
      var Rc = [a * a + b * b, 2 * a, 0], right = pXD(Rc), src = "(" + polyD([[1, "x"], [a, ""]]) + ")² " + M + " (x " + M + " " + b + ")(x + " + b + ")";
      var g = opts(right, [[pXD([a * a - b * b, 2 * a, 0]), "Мінус перед добутком: −(x² − " + b * b + ") = −x² + " + b * b + "."], [pXD([a * a + b * b, 0, 0]), "Не загуби подвоєний добуток 2 · x · " + pn(a) + " = " + tD(2 * a, "x") + "."], [pXD([b * b, 2 * a, 0]), "(x " + (a < 0 ? M : "+") + " " + Math.abs(a) + ")² містить і " + a * a + "."]]);
      return choice("Спрости вираз", src + " = ___", right, g.o, ["Розкрий за формулами: квадрат двочлена і різниця на суму.", "Другий добуток — у дужки, бо перед ним мінус."],
        "(" + polyD([[1, "x²"], [2 * a, "x"], [a * a, ""]]) + ") " + M + " (x² " + M + " " + b * b + ") = <b>" + right + "</b>.", { err: g.err, chk: { src: "(x+(" + a + "))**2-(x-" + b + ")*(x+" + b + ")", vars: ["x"] } });
    }
    if (t === 2) { // (x + a)² − x² = c
      var x = RNZ(-8, 8), c = 2 * a * x + a * a;
      return num("(" + polyD([[1, "x"], [a, ""]]) + ")² " + M + " x² = " + sn(c) + "\nx = ___", sn(x), ["Розкрий квадрат двочлена за формулою.", "x² знищуються — лишається лінійне рівняння."],
        polyD([[1, "x²"], [2 * a, "x"], [a * a, ""]]) + " " + M + " x² = " + sn(c) + " → " + tail(2 * a, c - a * a, sn(x)) + ".", { task: "Розв'яжи рівняння", err: Number.isInteger(c / (2 * a)) ? errs([[sn(c / (2 * a)), "Не загуби " + a * a + " = " + pn(a) + "² з формули квадрата."]], sn(x)) : {}, chk: { eq: "(x+(" + a + "))**2-x**2", r: String(c) } });
    }
    // (x − a)(x + a) − x(x + b) = c
    var x3 = RNZ(-8, 8), c3 = -a * a - b * x3;
    return num("(x " + M + " " + Math.abs(a) + ")(x + " + Math.abs(a) + ") " + M + " x(x + " + b + ") = " + sn(c3) + "\nx = ___", sn(x3), ["Різниця на суму: (x − a)(x + a) = x² − a².", "Розкрий другий добуток і віднімай його повністю — x² знищаться."],
      "x² " + M + " " + a * a + " " + M + " x² " + M + " " + b + "x = " + sn(c3) + " → " + tail(-b, c3 + a * a, sn(x3)) + ".", { task: "Розв'яжи рівняння", err: errs([[sn(-x3), "Мінус перед x(x + " + b + ") змінює знак і " + b + "x."]], sn(x3)), chk: { eq: "(x-" + Math.abs(a) + ")*(x+" + Math.abs(a) + ")-x*(x+" + b + ")", r: String(c3) } });
  };
  /* ===== доробки: §4 складання виразу, §1 рівносильні, §22 область значень, §26 особливі прямі, тотожності формул, групування x³ ===== */
  G.xMake = function () {
    var k = pick([2, 3]), kw = k === 2 ? ["подвоєного", "подвоєна"] : ["потроєного", "потроєна"], t = R(1, 6), d, right, w, js;
    if (t === 1) { d = "сума числа a і " + kw[0] + " числа b"; right = "a + " + k + "b"; w = [k + "(a + b)", k + "a + b", "a + b + " + k]; js = "a+" + k + "*b"; }
    else if (t === 2) { d = kw[1] + " сума чисел a і b"; right = k + "(a + b)"; w = [k + "a + b", "a + " + k + "b", k + " + a + b"]; js = k + "*(a+b)"; }
    else if (t === 3) { d = "різниця квадратів чисел a і b"; right = "a² " + M + " b²"; w = ["(a " + M + " b)²", "a² + b²", "2a " + M + " 2b"]; js = "a*a-b*b"; }
    else if (t === 4) { d = "квадрат різниці чисел a і b"; right = "(a " + M + " b)²"; w = ["a² " + M + " b²", "a " + M + " b²", "2(a " + M + " b)"]; js = "(a-b)**2"; }
    else if (t === 5) { d = "добуток числа a і суми чисел b і c"; right = "a(b + c)"; w = ["ab + c", "a + bc", "abc"]; js = "a*(b+c)"; }
    else { d = "півсума чисел x і y"; right = "(x + y) : 2"; w = ["x + y : 2", "2(x + y)", "x : 2 + y"]; js = "(x+y)/2"; }
    var err = {}; err[w[0]] = "Порядок слів важливий: «" + d + "» — спершу визнач, що з чим робимо, і де потрібні дужки.";
    return choice("Запиши у вигляді виразу", d.charAt(0).toUpperCase() + d.slice(1), right, w,
      ["Останнє слово дії («сума», «різниця», «добуток», «квадрат») — це те, що виконується <b>останнім</b>.", "Якщо сума чи різниця стоїть усередині іншої дії — бери її в дужки."],
      "«" + d + "» → <b>" + right + "</b>.", { long: true, err: err, chk: { expr: js } });
  };
  G.eEquiv = function () {
    if (Math.random() < 0.2) return choice("Чи рівносильні рівняння", "x² = " + pick([4, 9, 16, 25]) + "   і   x = " + pick([2, 3, 4, 5]), "Ні", ["Так"],
      ["Рівносильні — мають <b>однакові</b> корені (усі).", "У x² = 9 два корені: 3 і −3."],
      "У рівняння з x² два корені (додатний і від'ємний), а в x = … — один. Множини коренів різні — <b>не рівносильні</b>.", { long: true, chk: { eqv: "sq" } });
    var r = RNZ(-8, 8), a = RNZ(-5, 5), b = RNZ(-9, 9), ok = Math.random() < 0.5, r2 = ok ? r : r + pick([-2, -1, 1, 2]), k = RNZ(-4, 4);
    if (Math.abs(a) === 1) a *= 2;
    var A = polyD([[a, "x"], [b, ""]]) + " = " + sn(a * r + b), B = polyD([[k, "x"]]) + " = " + sn(k * r2);
    return choice("Чи рівносильні рівняння", A + "   і   " + B, ok ? "Так" : "Ні", [ok ? "Ні" : "Так"],
      ["Рівносильні рівняння мають однакові корені. Розв'яжи обидва.", "Корінь першого: x = " + sn(r) + ". А другого?"],
      "Корінь першого — " + sn(r) + ", другого — " + sn(r2) + ". " + (ok ? "Однакові — <b>рівносильні</b>." : "Різні — <b>не рівносильні</b>."),
      { long: true, chk: { eqv: [polyJ([[a, "x"], [b, ""]]), String(a * r + b), polyJ([[k, "x"]]), String(k * r2)] } });
  };
  G.fnRange = function () {
    var t = R(1, 5), c = R(-6, 6), f, right, w, why;
    if (t === 1) { f = "y = " + sn(c); right = "одне число: " + sn(c); w = ["усі числа", "y ≥ " + sn(c), "y ≤ " + sn(c)]; why = "При будь-якому x значення одне й те саме — " + sn(c) + "."; }
    else if (t === 2) { f = linD(RNZ(-5, 5), c); right = "усі числа"; w = ["y ≥ 0", "одне число: " + sn(c), "y ≥ " + sn(c)]; why = "Лінійна функція з k ≠ 0 набуває будь-яких значень."; }
    else if (t === 3) { f = "y = x²"; c = 0; right = "y ≥ 0"; w = ["усі числа", "y ≤ 0", "y > 0"]; why = "Квадрат числа не буває від'ємним, а 0 досягається при x = 0."; }
    else if (t === 4) { f = "y = x²" + tailT(c, ""); right = "y ≥ " + sn(c); w = ["усі числа", "y ≤ " + sn(c), "y ≥ 0"]; why = "x² ≥ 0, тому x²" + tailT(c, "") + " ≥ " + sn(c) + " (найменше — при x = 0)."; }
    else { f = "y = −x²" + tailT(c, ""); right = "y ≤ " + sn(c); w = ["усі числа", "y ≥ " + sn(c), "y ≤ 0"]; why = "−x² ≤ 0, тому −x²" + tailT(c, "") + " ≤ " + sn(c) + "."; }
    return choice("Яка область значень функції", f, right, w,
      ["Область значень — усі значення y, яких набуває функція.", t >= 3 ? "Пам'ятай: x² ≥ 0 при будь-якому x." : "Чи залежить y від x? Яких значень може набувати?"],
      why + " Область значень: <b>" + right + "</b>.", { long: true, chk: { rng: [t, c] } });
  };
  G.sLine = function () {
    var t = R(1, 3), c = RNZ(-6, 6), m = pick([1, 2, 3]), eq, right, why;
    if (t === 1) { eq = m === 1 ? "y = " + sn(c) : "0 · x + " + m + "y = " + sn(m * c); right = "пряма, паралельна осі x"; why = "y = " + sn(c) + " при будь-якому x — горизонтальна пряма через (0; " + sn(c) + ")."; }
    else if (t === 2) { eq = m === 1 ? "x = " + sn(c) : m + "x + 0 · y = " + sn(m * c); right = "пряма, паралельна осі y"; why = "x = " + sn(c) + " при будь-якому y — вертикальна пряма через (" + sn(c) + "; 0)."; }
    else { var k = RNZ(-4, 4); eq = linD(k, 0); right = "пряма через початок координат"; why = "При x = 0 маємо y = 0 — пряма проходить через (0; 0)."; }
    var all = ["пряма, паралельна осі x", "пряма, паралельна осі y", "пряма через початок координат"];
    var it = choice("Що є графіком рівняння", eq, right, all.filter(function (x) { return x !== right; }),
      ["Вирази y (або x): що лишається, коли один коефіцієнт дорівнює 0?", "y = число — горизонтальна пряма; x = число — вертикальна."],
      why + " Отже, <b>" + right + "</b>.", { long: true, err: (function () { var o = {}; o[all[t === 1 ? 1 : 0]] = t < 3 ? "Плутанина осей: y = число — паралельна осі <b>x</b> (горизонтальна); x = число — паралельна осі <b>y</b>." : ""; return o; })(), chk: { line: t } });
    it.o = all; return it;
  };
  G.fId = function () {
    var a = R(2, 7), ok = Math.random() < 0.45, t = R(1, 3), A, B, Aj, Bj, why;
    if (t === 1) { var sg = pick([1, -1]); A = "(x " + (sg > 0 ? "+" : M) + " " + a + ")²"; Aj = "(x+(" + sg * a + "))**2";
      if (ok) { B = polyD([[1, "x²"], [2 * sg * a, "x"], [a * a, ""]]); } else { B = pick([polyD([[1, "x²"], [a * a, ""]]), polyD([[1, "x²"], [sg * a, "x"], [a * a, ""]]), polyD([[1, "x²"], [-2 * sg * a, "x"], [a * a, ""]])]); }
      why = "(x " + (sg > 0 ? "+" : M) + " " + a + ")² = " + polyD([[1, "x²"], [2 * sg * a, "x"], [a * a, ""]]) + "."; }
    else if (t === 2) { A = "(x " + M + " " + a + ")(x + " + a + ")"; Aj = "(x-" + a + ")*(x+" + a + ")"; B = ok ? polyD([[1, "x²"], [-a * a, ""]]) : pick([polyD([[1, "x²"], [a * a, ""]]), polyD([[1, "x²"], [-2 * a, "x"], [-a * a, ""]])]); why = "(x − " + a + ")(x + " + a + ") = x² − " + a * a + "."; }
    else { A = "x² " + M + " " + a * a; Aj = "x*x-" + a * a; B = ok ? "(x " + M + " " + a + ")(x + " + a + ")" : pick(["(x " + M + " " + a + ")²", "(x " + M + " " + a * a + ")(x + " + a * a + ")"]); why = "x² − " + a * a + " = (x − " + a + ")(x + " + a + ")."; }
    Bj = B.replace(/−/g, "-").replace(/x²/g, "x*x").replace(/(\d)x/g, "$1*x").replace(/\)\(/g, ")*(").replace(/\)²/g, ")**2");
    return choice("Чи тотожно рівні вирази", A + "   і   " + B, ok ? "Так" : "Ні", [ok ? "Ні" : "Так"],
      ["Розкрий (або розклади) за формулою і порівняй.", "Сумніваєшся — підстав x = 1 в обидва вирази."],
      why + (ok ? " Вирази <b>тотожно рівні</b>." : " А тут " + B + " — <b>не тотожні</b>."), { long: true, chk: { idA: Aj, idB: Bj, same: ok } });
  };
})();
