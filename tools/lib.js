// Спільні конструктори завдань
const say = (en, ua, hl) => `<div class="ex"><div><div class="en">${hl || en}</div><div class="ua">${ua}</div></div><button class="say round" data-say="${en}">🔊</button></div>`;
const inp = (task, p, a, h, e, err, extra) => Object.assign({ type: "input", task, p, a: Array.isArray(a) ? a : [a], h, e, err }, extra || {});
const ch = (p, o, a, h, e, err) => ({ type: "choice", p, o, a, h, e, err });
const fix = (p, bad, a, h, e) => ({ type: "fix", task: "Знайди і натисни слово з помилкою", p, bad, a, h, e });
const dict = (a, h, e, err) => ({ type: "dict", task: "Послухай і напиши речення", p: "🎧 " + a, a: [a], h, e, err });
const ord = (p, words, a, h, e, end) => Object.assign({ type: "order", task: "Склади речення", p, words, a, h, e }, end ? { end } : {});
const DH = "Послухай ще раз — можна повільно 🐢";
const S = { strict: true };
module.exports = { say, inp, ch, fix, dict, ord, DH, S };
