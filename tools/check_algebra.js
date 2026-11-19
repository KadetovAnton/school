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
let bad = 0; const B = (g, m, it) => { if (bad++ < 40) console.log("✗", g, m, JSON.stringify(it).slice(0, 400)); };
const rnd = () => ({ a: Math.random() * 4 - 2 + 0.3, b: Math.random() * 4 - 2 + 0.7, x: Math.random() * 4 - 2 + 0.11, y: Math.random() * 3 + 0.2 });
function equiv(e1, e2, n = 6) { for (let i = 0; i < n; i++) { const v = rnd(); if (!close(ev(e1, v), ev(e2, v))) return false; } return true; }
for (const s of sk) {
  if (!G[s.gen]) { B(s.gen, "нема генератора"); continue; }
  const seen = new Set();
  for (let i = 0; i < 3000; i++) {
    const it = G[s.gen](s.args || {}); const txt = JSON.stringify(it);
    if (/undefined|NaN|null|Infinity/.test(txt)) B(s.gen, "undefined/NaN", it);
    if (/-\d/.test(it.p) || /\d-/.test(it.p)) B(s.gen, "дефіс замість мінуса", it);
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
      else if (c.eq) { if (!close(ev(c.eq, { x: A }), ev(c.r, { x: A }))) B(s.gen, "рівняння не виконується", it);
        // корінь єдиний: лінійна функція не стала
        const f = x => ev(c.eq, { x }) - ev(c.r, { x }); if (close(f(0), f(1))) B(s.gen, "не один корінь", it); }
      else if (c.pw) { const [p, n] = c.pw; const js = toJS(p); for (const base of [2, 3]) { if (!close(ev(js, { a: base, b: base, x: base, y: base }), Math.pow(base, n))) B(s.gen, "степінь", it); } }
      else B(s.gen, "нема chk", it);
      if (Math.abs(A) > 2000) B(s.gen, "завелика відповідь", it);
    } else if (it.type === "choice") {
      if (!it.o.includes(it.a) || new Set(it.o).size !== it.o.length || it.o.length < 2) B(s.gen, "варіанти", it);
      if (c.src) {
        if (!equiv(c.src, toJS(it.a))) B(s.gen, "правильний варіант не тотожний", it);
        it.o.forEach(o => { if (o !== it.a && equiv(c.src, toJS(o))) B(s.gen, "хибний варіант теж тотожний: " + o, it); });
        if (it.o.length < 3) B(s.gen, "замало варіантів", it);
        if (!equiv(c.src, toJS(it.p.replace(" = ___", "")))) B(s.gen, "умова ≠ src", it);
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
      } else B(s.gen, "нема chk", it);
    }
  }
  console.log(s.id.padEnd(10), "різних:", seen.size);
}
console.log(bad ? "ПОМИЛОК: " + bad : "✓ усе гаразд");
