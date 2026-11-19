// Перевірка алгебри: кожен генератор 3000 разів, відповідь перевіряється НЕЗАЛЕЖНО (підстановкою, обчисленням, тотожністю).
// node tools/check_algebra.js
const fs = require("fs"), vm = require("vm");
const ctx = { window: { E: {} }, Math, String, Array, JSON, Object, Number, console }; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(__dirname + "/../engine/algebra.js", "utf8"), ctx);
// перевірка відповіді — та сама функція, що в рушії
const eng = fs.readFileSync(__dirname + "/../engine/engine.js", "utf8");
const ratSrc = eng.slice(eng.indexOf("function gcdN"), eng.indexOf("E.ratOf = ratOf;"));
const ratOf = new Function(ratSrc + "; return ratOf;")();
const G = ctx.window.E.GEN, sk = JSON.parse(fs.readFileSync(__dirname + "/../content/algebra/skills/algebra.json")).skills;
const SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹";
function toJS(s) {
  s = s.replace(/[−]/g, "-").replace(/·/g, "*").replace(/:/g, "/").replace(/\s+/g, "");
  s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, m => "**" + m.split("").map(c => SUP.indexOf(c)).join(""));
  s = s.replace(/-([a-z])/g, "-1*$1");
  s = s.replace(/(\d)([a-z(])/g, "$1*$2").replace(/([a-z])(?=[a-z(])/g, "$1*").replace(/\)(?=[a-z0-9(])/g, ")*");
  return s;
}
function ev(js, vars) { const f = new Function(...Object.keys(vars), "return (" + js + ");"); return f(...Object.values(vars)); }
const close = (a, b) => Math.abs(a - b) < 1e-9 * Math.max(1, Math.abs(a));
function val(a) { const r = ratOf(a); return r ? r.n / r.d : NaN; }
// краєві випадки перевірки відповіді (незалежно від генераторів)
{ const T = [["1/2", "0,5", true], ["−3/−4", "3/4", true], ["6/3", "2", true], ["0,50", "1/2", true], ["−0", "0", true], ["2,450", "2,45", true], ["3/4", "0,7", false], ["−2", "2", false]];
  for (const [g, r, eq] of T) { const a = ratOf(g), b = ratOf(r); if (!a || !b || (a.n * b.d === b.n * a.d) !== eq) console.log("✗ ratOf", g, r); }
  for (const g of ["5,", "−", "3/", "3/0", ",5", "", "1/2/3"]) if (ratOf(g)) console.log("✗ ratOf приймає незавершене:", JSON.stringify(g));
  if (ratOf("6/8").red || !ratOf("3/4").red) console.log("✗ ratOf: ознака скороченого дробу"); }
let bad = 0; const B = (g, m, it) => { if (bad++ < 40) console.log("✗", g, m, JSON.stringify(it).slice(0, 400)); };
const rnd = () => ({ a: Math.random() * 4 - 2 + 0.3, b: Math.random() * 4 - 2 + 0.7, c: Math.random() * 3 - 1.3, m: Math.random() * 3 + 0.4, n: Math.random() * 2 - 2.6, x: Math.random() * 4 - 2 + 0.11, y: Math.random() * 3 + 0.2 });
function equiv(e1, e2, n = 6) { for (let i = 0; i < n; i++) { const v = rnd(); if (!close(ev(e1, v), ev(e2, v))) return false; } return true; }
for (const s of sk) {
  if (!G[s.gen]) { B(s.gen, "нема генератора"); continue; }
  const seen = new Set();
  for (let i = 0; i < 3000; i++) {
    const it = G[s.gen](s.args || {}); const txt = JSON.stringify(it);
    if (/undefined|NaN|null|Infinity/.test(txt)) B(s.gen, "undefined/NaN", it);
    const shown = [it.p, it.e, ...(it.h || []), ...(it.o || []), ...Object.keys(it.err || {}), ...Object.values(it.err || {})].join(" ").replace(/<[^>]+>/g, "");
    if (/-\d|\d-|\s-\s/.test(shown)) B(s.gen, "дефіс замість мінуса", it);
    if (/[+−] 0(?![,\d])|NaN|undefined/.test(shown.replace(/=\s*0\b/g, ""))) B(s.gen, "«+ 0» або NaN у тексті", it);
    if (!it.long && !it.p.includes("___")) B(s.gen, "нема ___", it);
    if (!it.h || it.h.length < 2 || !it.e) B(s.gen, "нема підказок/пояснення", it);
    seen.add(it.p);
    const c = it.chk || {};
    if (it.type === "num") {
      const r = ratOf(it.a); if (!r) { B(s.gen, "відповідь не число", it); continue; }
      if (r.frac && !r.red) B(s.gen, "відповідь не скорочена", it);
      for (const k in it.err || {}) { const e = ratOf(k); if (e && e.n * r.d === r.n * e.d) B(s.gen, "err=правильна", it); }
      const A = r.n / r.d;
      if (c.v !== undefined) { if (!close(eval(c.v), A)) B(s.gen, "обчислення " + eval(c.v), it); }
      else if (c.eq) { // розв'язуємо лінійне рівняння самі: f(x) = lhs − rhs
        const f = x => ev(c.eq, { x }) - ev(c.r, { x }); if (close(f(0), f(1))) { B(s.gen, "не один корінь", it); continue; }
        const root = -f(0) / (f(1) - f(0)); if (!close(f(root + 2), (f(1) - f(0)) * 2)) B(s.gen, "рівняння не лінійне", it);
        const want = c.ans ? ev(c.ans, { x: root }) : root; if (!close(want, A)) B(s.gen, "відповідь " + want, it); }
      else if (c.pw) { const [p, n] = c.pw; const js = toJS(p); for (const base of [2, 3]) { if (!close(ev(js, { a: base, b: base, x: base, y: base }), Math.pow(base, n))) B(s.gen, "степінь", it); } }
      else B(s.gen, "нема chk", it);
      if (Math.abs(A) > 9000) B(s.gen, "завелика відповідь", it);
    } else if (it.type === "choice") {
      if (!it.o.includes(it.a) || new Set(it.o).size !== it.o.length || it.o.length < 2) B(s.gen, "варіанти", it);
      if (c.src) {
        if (!equiv(c.src, toJS(it.a))) B(s.gen, "правильний варіант не тотожний", it);
        it.o.forEach(o => { if (o !== it.a && o !== c.incomplete && equiv(c.src, toJS(o))) B(s.gen, "хибний варіант теж тотожний: " + o, it); });
        if (c.incomplete && it.o.includes(c.incomplete) && !equiv(c.src, toJS(c.incomplete))) B(s.gen, "«не до кінця» не тотожний", it);
        if (it.o.length < 3) B(s.gen, "замало варіантів", it);
        if (!equiv(c.src, toJS(it.p.replace(/\s=\s___/, "")))) B(s.gen, "умова ≠ src", it);
      } else if (c.eqo) {
        const sat = it.o.filter(o => close(ev(c.eqo[0], { x: val(o) }), ev(c.eqo[1], { x: val(o) })));
        if (sat.length !== 1 || sat[0] !== it.a) B(s.gen, "корінь серед варіантів", it);
        const [l, rr] = it.p.split(" = "); if (!close(ev(toJS(l), { x: 1.7 }) - ev(toJS(rr), { x: 1.7 }), ev(c.eqo[0], { x: 1.7 }) - ev(c.eqo[1], { x: 1.7 }))) B(s.gen, "eqo≠умова", it);
      } else if (c.idA) {
        const same = equiv(c.idA, c.idB); if (same !== c.same || it.a !== (same ? "Так" : "Ні")) B(s.gen, "тотожність", it);
        const parts = it.p.split("   і   ").map(x => toJS(x.replace(/[am]/g, "x"))); if (!equiv(parts[0], c.idA) || !equiv(parts[1], c.idB)) B(s.gen, "id≠умова", it);
      } else if (c.mono) {
        const isMono = e => !/[+:(]/.test(e.replace(/^−/, "")) && !/ − /.test(e);
        if (!isMono(it.a) || it.o.filter(isMono).length !== 1) B(s.gen, "одночлен", it);
      } else if (c.tf !== undefined) {
        const m = it.task.match(/число (\S+) коренем/); const x = val(m[1]); const [l, rr] = it.p.split(" = ");
        const ok = close(ev(toJS(l), { x }), ev(toJS(rr), { x })); if (ok !== c.tf || it.a !== (ok ? "Так" : "Ні")) B(s.gen, "так/ні", it);
      } else if (c.spec) {
        const f = x => ev(c.spec[0], { x }) - ev(c.spec[1], { x }); const k = close(f(0), f(1)) ? (close(f(0), 0) ? "inf" : "none") : "one";
        if (k !== c.kind) B(s.gen, "кількість коренів " + k, it);
        const [l, rr] = it.p.split(" = "); for (const x of [0, 1.5, -2]) if (!close(ev(toJS(l), { x }) - ev(toJS(rr), { x }), f(x))) B(s.gen, "spec≠умова", it);
      } else if (c.model) {
        c.model.forEach((m, j) => { const ok = close(ev(m[0], { x: c.root }), ev(m[1], { x: c.root })); if (j === 0 && !ok) B(s.gen, "правильне рівняння не виконується", it); if (j > 0 && ok) B(s.gen, "хибне рівняння теж виконується", it); });
        if (!it.o.includes(it.a)) B(s.gen, "модель", it);
        if (!/Познач через x/.test(it.p)) B(s.gen, "не сказано, що таке x", it);
      } else B(s.gen, "нема chk", it);
    }
  }
  console.log(s.id.padEnd(10), "різних:", seen.size);
}
console.log(bad ? "ПОМИЛОК: " + bad : "✓ усе гаразд");
