import http from "http"; import fs from "fs"; import path from "path";
import { fileURLToPath } from "url";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.argv[2] || path.join(HERE, ".."), kv = new Map();
// свіжа копія серверної функції щоразу (імпортувати файл з [[ ]] у назві напряму незручно)
fs.copyFileSync(path.join(ROOT, "functions/api/[[path]].js"), path.join(HERE, ".fn.mjs"));
const { onRequest } = await import("./.fn.mjs");
const DB = { get: async (k, t) => { const v = kv.get(k); return v == null ? null : t === "json" ? JSON.parse(v) : v; }, put: async (k, v) => kv.set(k, v), delete: async k => kv.delete(k) };
const env = { DB };
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".mp3": "audio/mpeg" };
http.createServer(async (rq, rs) => {
  const u = new URL(rq.url, "http://x");
  if (u.pathname === "/__prog") { rs.end(kv.get("prog:" + u.searchParams.get("kid")) || "null"); return; }
  if (u.pathname === "/__kv") { rs.end(JSON.stringify([...kv.keys()])); return; }
  if (u.pathname.startsWith("/api/")) {
    let body = ""; for await (const c of rq) body += c;
    const req = new Request("http://x" + rq.url, { method: rq.method, headers: rq.headers, body: ["GET","HEAD","OPTIONS"].includes(rq.method) ? undefined : body });
    const r = await onRequest({ request: req, env, params: { path: u.pathname.slice(5).split("/") } });
    rs.writeHead(r.status, Object.fromEntries(r.headers)); rs.end(await r.text()); return;
  }
  let f = path.join(ROOT, u.pathname === "/" ? "index.html" : decodeURIComponent(u.pathname));
  fs.readFile(f, (e, d) => { if (e) { rs.writeHead(404); rs.end(); } else { rs.writeHead(200, { "Content-Type": types[path.extname(f)] || "text/plain" }); rs.end(d); } });
}).listen(8766);
