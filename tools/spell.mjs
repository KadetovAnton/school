import fs from "fs"; import path from "path"; import nspell from "nspell";
const rd = d => ({ aff: fs.readFileSync(`node_modules/${d}/index.aff`), dic: fs.readFileSync(`node_modules/${d}/index.dic`) });
const en = nspell(rd("dictionary-en")), gb = nspell(rd("dictionary-en-gb")), uk = nspell(rd("dictionary-uk"));
const ROOT = "/home/claude/school/content";
const found = { en: new Map(), uk: new Map() };
function add(map, w, where) { if (!map.has(w)) map.set(w, new Set()); map.get(w).add(where); }
function strip(s) { return String(s).replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/g, " "); }
function scan(text, where) {
  text = strip(text);
  for (const m of text.matchAll(/[A-Za-z]+(?:'[A-Za-z]+)?/g)) {
    let w = m[0]; if (w.length < 2) continue;
    if (!en.correct(w) && !gb.correct(w) && !en.correct(w.toLowerCase()) && !gb.correct(w.toLowerCase())) add(found.en, w, where);
  }
  for (const m of text.matchAll(/[А-ЯҐЄІЇа-яґєії]+(?:['’ʼ][А-ЯҐЄІЇа-яґєії]+)?/g)) {
    let w = m[0].replace(/[’ʼ]/g, "'"); if (w.length < 2) continue;
    if (!uk.correct(w) && !uk.correct(w.toLowerCase()) && !uk.correct(w.replace(/'/g, "’")) && !uk.correct(w.toLowerCase().replace(/'/g, "’")) && !uk.correct(w.replace(/'/g, "ʼ")) && !uk.correct(w.toLowerCase().replace(/'/g, "ʼ"))) add(found.uk, w, where);
  }
}
function walk(o, where) {
  if (typeof o === "string") return scan(o, where);
  if (Array.isArray(o)) return o.forEach(x => walk(x, where));
  if (o && typeof o === "object") for (const k in o) { if (k === "id" || k === "file" || k === "skills" || k === "skillFiles" || k === "gen") continue; if (k === "err") Object.keys(o.err).forEach(x => scan(x, where + "/errkey")); walk(o[k], where); }
}
function files(d) { return fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? files(path.join(d, e.name)) : e.name.endsWith(".json") ? [path.join(d, e.name)] : []); }
for (const f of files(ROOT)) walk(JSON.parse(fs.readFileSync(f, "utf8")), f.replace(ROOT + "/", ""));
// також тексти в math.js і test.html
for (const f of ["/home/claude/school/engine/math.js", "/home/claude/school/test.html", "/home/claude/school/engine/ui.js"]) {
  const t = fs.readFileSync(f, "utf8"); for (const m of t.matchAll(/"([^"\\]{3,})"|`([^`]{3,})`/g)) scan(m[1] || m[2], path.basename(f));
}
for (const L of ["en", "uk"]) {
  const arr = [...found[L].entries()].sort((a, b) => a[0].localeCompare(b[0]));
  console.log("== " + L + ": " + arr.length);
  console.log(arr.map(([w, s]) => w + "  [" + [...s].slice(0, 2).join(", ") + "]").join("\n"));
}
