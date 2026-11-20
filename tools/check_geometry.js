// Перевірка геометрії: кожен генератор 3000 разів; відповідь перевіряється НЕЗАЛЕЖНО (обчислення з даних умови,
// власна таблиця назв пар кутів, нерівність трикутника, розміщення кіл…), плюс форма завдання і рисунок.
// node tools/check_geometry.js
const fs = require("fs"), vm = require("vm");
const ctx = { window: { E: {} }, Math, String, Array, JSON, Object, Number, console }; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(__dirname + "/../engine/geometry.js", "utf8"), ctx);
const eng = fs.readFileSync(__dirname + "/../engine/engine.js", "utf8");
const ratOf = new Function(eng.slice(eng.indexOf("function gcdN"), eng.indexOf("E.ratOf = ratOf;")) + "; return ratOf;")();
const G = ctx.window.E.GEN, sk = JSON.parse(fs.readFileSync(__dirname + "/../content/geometry/skills/geometry.json")).skills;
let bad = 0; const seenB = {};
const B = (g, m, it) => { bad++; const k = g + "|" + m; seenB[k] = (seenB[k] || 0) + 1; if (seenB[k] <= 2) console.log("✗", g, m, JSON.stringify(it).slice(0, 300)); };
const val = a => { const r = ratOf(String(a)); return r ? r.n / r.d : NaN; };
const close = (a, b) => Math.abs(a - b) < 1e-9;
// власна таблиця пар кутів (номери: a — 1 ↖, 2 ↗, 3 ↙, 4 ↘; b — 5 ↖, 6 ↗, 7 ↙, 8 ↘)
const T = { "відповідні": [[1, 5], [2, 6], [3, 7], [4, 8]], "внутрішні різносторонні": [[3, 6], [4, 5]], "внутрішні односторонні": [[3, 5], [4, 6]], "вертикальні": [[1, 4], [2, 3], [5, 8], [6, 7]], "суміжні": [[1, 2], [1, 3], [2, 4], [3, 4], [5, 6], [5, 7], [6, 8], [7, 8]] };
const nameOf = (i, j) => { for (const n in T) if (T[n].some(([p, q]) => (p === i && q === j) || (p === j && q === i))) return n; return null; };
const sVal = (k, s) => [2, 3, 6, 7].includes(k) ? s : 180 - s; // при паралельних
const kind = d => d < 90 ? "гострий" : d === 90 ? "прямий" : d < 180 ? "тупий" : "розгорнутий";
const tri = (a, b, c) => a + b > c && a + c > b && b + c > a;
const O1 = "за I ознакою (дві сторони і кут між ними)", O2 = "за II ознакою (сторона і два прилеглі кути)", O3 = "за III ознакою (три сторони)", O0 = "даних недостатньо";

for (const s of sk) {
  if (!G[s.gen]) { B(s.gen, "нема генератора"); continue; }
  const kinds = new Set(), texts = new Set();
  for (let i = 0; i < 3000; i++) {
    const a = Object.assign({}, s.args || {}, i % 10 === 0 ? { easy: 1 } : {});
    let it; try { it = G[s.gen](a); } catch (e) { B(s.gen, "виняток " + e.message); break; }
    const txt = JSON.stringify(it); texts.add(it.p + "|" + (it.uid || "")); kinds.add(it.tt);
    if (/undefined|NaN|null|Infinity/.test(txt)) B(s.gen, "undefined/NaN", it);
    if (/</.test(it.p)) B(s.gen, "розмітка в умові (екранується)", it);
    if (!it.h || it.h.length < 2 || !it.e) B(s.gen, "нема підказок/пояснення", it);
    const shown = [it.p, it.e, ...(it.h || []), ...(it.o || [])].join(" ").replace(/<[^>]+>/g, "");
    if (/\d-\d|\s-\d/.test(shown)) B(s.gen, "дефіс замість мінуса", it);
    if (it.pic) { if (!/^<svg[^>]*>[\s\S]*<\/svg>$/.test(it.pic) || /NaN|Infinity/.test(it.pic)) B(s.gen, "рисунок", it);
      const vb = it.pic.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/); if (!vb || +vb[1] > 360 || +vb[2] > 260) B(s.gen, "завеликий рисунок", it); }
    const c = it.chk || {};
    if (it.type === "num") {
      if (!it.p.includes("___")) B(s.gen, "нема ___", it);
      const A = val(it.a); if (isNaN(A)) { B(s.gen, "відповідь не число", it); continue; }
      if (A <= 0) B(s.gen, "відповідь ≤ 0", it);
      if (/___°/.test(it.p) && !(A > 0 && A < 180)) B(s.gen, "кут поза (0;180)", it);
      if (!Number.isInteger(A * 10)) B(s.gen, "незручне число", it);
      for (const k in it.err || {}) if (close(val(k), A)) B(s.gen, "err = правильна", it);
      if (c.v === undefined) B(s.gen, "нема chk", it); else if (!close(eval(c.v), A)) B(s.gen, "обчислення " + c.v + " = " + eval(c.v), it);
      if (c.ij && c.s !== undefined) { const [p, q] = c.ij; if (!close(sVal(q, c.s), A)) B(s.gen, "кут при паралельних", it); }
      if (c.ij && c.want) { const [p, q] = c.ij; if (nameOf(p, q) !== c.want) B(s.gen, "назва пари", it); if (!close(c.want === "внутрішні односторонні" ? 180 - c.g : c.g, A)) B(s.gen, "ознака x", it); }
      if (c.iso) { const [x, y] = c.iso, opts = [[x, x, y], [y, y, x]].filter(t => tri(...t)); if (opts.length !== 1 || !close(opts[0][0] * 2 + opts[0][2], A)) B(s.gen, "рівнобедрений", it); }
    } else if (it.type === "choice") {
      if (!it.o.includes(it.a)) B(s.gen, "відповіді нема серед варіантів", it);
      if (new Set(it.o).size !== it.o.length || it.o.length < 2) B(s.gen, "варіанти", it);
      for (const k in it.err || {}) if (!it.o.includes(k)) B(s.gen, "err не з варіантів: " + k, it);
      if (it.err && it.err[it.a]) B(s.gen, "err для правильної", it);
      if (c.pick !== undefined && c.pick !== it.a) B(s.gen, "pick", it);
      if (c.deg !== undefined && kind(c.deg) !== it.a) B(s.gen, "вид кута", it);
      if (c.betw) { const [AB, BC, AC] = c.betw, w = AB + BC === AC ? "B" : AC + BC === AB ? "C" : AB + AC === BC ? "A" : null; if (w !== it.a || w !== c.w) B(s.gen, "між", it); }
      if (c.ij && !c.v) { if (nameOf(...c.ij) !== it.a) B(s.gen, "назва пари " + nameOf(...c.ij), it); }
      if (c.ij && c.v) { const n = nameOf(...c.ij), [x, y] = c.v, ok = n === "внутрішні односторонні" ? x + y === 180 : x === y; if ((ok ? "Так" : "Ні") !== it.a) B(s.gen, "ознака так/ні", it); if (!["відповідні", "внутрішні різносторонні", "внутрішні односторонні"].includes(n)) B(s.gen, "пара для ознаки " + n, it); }
      if (c.cfg) { const r = { SAS: O1, ASA: O2, SSS: O3, SSA: O0, AAA: O0 }[c.cfg]; if (r !== it.a) B(s.gen, "ознака " + c.cfg, it); if (c.cfg === "SSS" && !it.o.includes(O3)) B(s.gen, "SSS без III", it); }
      if (c.s) { if ((tri(...c.s) ? "Так" : "Ні") !== it.a) B(s.gen, "нерівність трикутника", it); }
      if (c.R !== undefined) { const { R, r, d } = c, p = d === R + r ? "дотикаються зовні" : d === R - r ? "дотикаються внутрішньо" : (d > R - r && d < R + r) ? "перетинаються" : "не мають спільних точок"; if (p !== it.a) B(s.gen, "кола", it); }
      if (c.ang) { const i = c.ang.indexOf(c.big ? Math.max(...c.ang) : Math.min(...c.ang)); if (["BC", "AC", "AB"][i] !== it.a) B(s.gen, "сторона проти кута", it); if (Math.abs(c.ang.reduce((x, y) => x + y) - 180) > 0) B(s.gen, "сума кутів", it); }
      if (c.sides) { const i = c.sides.indexOf(c.big ? Math.max(...c.sides) : Math.min(...c.sides)); if ("∠" + "ABC"[i] !== it.a) B(s.gen, "кут проти сторони", it); if (!tri(...c.sides)) B(s.gen, "сторони не трикутник", it); }
    } else B(s.gen, "тип " + it.type, it);
  }
  console.log((s.id + "          ").slice(0, 12), s.gen.padEnd(10), "різних умов:", String(texts.size).padStart(5), " видів:", [...kinds].filter(Boolean).length);
}
console.log(bad ? "\n✗ ПОМИЛОК: " + bad : "\n✓ Усе правильно");
