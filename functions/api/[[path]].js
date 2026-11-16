/* Сервер школи (Cloudflare Pages Functions).
   Сховище KV (прив'язка DB):
     pin:<дитина>   — хеш PIN
     tok:<токен>    — якій дитині належить вхід (живе 400 днів)
     prog:<дитина>  — прогрес {p, upd}
     fail:<дитина>  — лічильник невдалих спроб PIN (блок на 15 хв після 5)
   Секрети: TG_TOKEN (бот), TG_CHAT (чат тата). */
const KIDS = ["anya", "artem"];
const ORIGINS = ["https://school.akdtv.pp.ua", "https://kadetovanton.github.io", "https://school-9ax.pages.dev"];

function cors(req) {
  const o = req.headers.get("Origin");
  return o && ORIGINS.includes(o) ? { "Access-Control-Allow-Origin": o, "Access-Control-Allow-Headers": "Content-Type, Authorization", "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS", "Vary": "Origin" } : {};
}
function J(req, data, status) { return new Response(JSON.stringify(data), { status: status || 200, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...cors(req) } }); }
async function sha(s) { const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join(""); }
function rnd() { const a = new Uint8Array(24); crypto.getRandomValues(a); return [...a].map(x => x.toString(16).padStart(2, "0")).join(""); }
async function who(req, env) {
  const t = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/, "");
  return t && /^[0-9a-f]{48}$/.test(t) ? await env.DB.get("tok:" + t) : null;
}
async function tg(env, text) {
  const chat = env.TG_CHAT || "-5559835738"; // група «Домашня школа»
  if (!env.TG_TOKEN) return { ok: false, error: "telegram не налаштовано" };
  const r = await fetch("https://api.telegram.org/bot" + String(env.TG_TOKEN).trim() + "/sendMessage", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: String(chat).trim(), text: String(text).slice(0, 4000) })
  }).then(x => x.json()).catch(e => ({ ok: false, description: String(e) }));
  return { ok: !!r.ok, error: r.description || null };
}

export async function onRequest({ request: req, env, params }) {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(req) });
  if (!env.DB) return J(req, { error: "нема сховища DB" }, 500);
  const path = (params.path || []).join("/");
  const url = new URL(req.url);
  let body = {};
  if (req.method === "POST" || req.method === "PUT") { try { body = await req.json(); } catch (e) {} }

  if (path === "ping") return J(req, { ok: true, db: true, tg: !!env.TG_TOKEN, chat: !!env.TG_CHAT });

  // чи задано PIN для дитини
  if (path === "status") {
    const kid = url.searchParams.get("kid");
    if (!KIDS.includes(kid)) return J(req, { error: "kid" }, 400);
    return J(req, { pinSet: !!(await env.DB.get("pin:" + kid)) });
  }

  // вхід: {kid, pin}; якщо PIN ще не задано — він задається цим запитом
  if (path === "login" && req.method === "POST") {
    const kid = body.kid, pin = String(body.pin || "");
    if (!KIDS.includes(kid) || !/^\d{4}$/.test(pin)) return J(req, { error: "Потрібен PIN з 4 цифр" }, 400);
    const fails = +(await env.DB.get("fail:" + kid) || 0);
    if (fails >= 5) return J(req, { error: "Забагато спроб. Спробуй через 15 хвилин або попроси тата." }, 429);
    const h = await sha("school|" + kid + "|" + pin), stored = await env.DB.get("pin:" + kid);
    let created = false;
    if (!stored) { await env.DB.put("pin:" + kid, h); created = true; }
    else if (stored !== h) {
      await env.DB.put("fail:" + kid, String(fails + 1), { expirationTtl: 900 });
      return J(req, { error: "Неправильний PIN", left: 4 - fails }, 401);
    }
    await env.DB.delete("fail:" + kid);
    const t = rnd();
    await env.DB.put("tok:" + t, kid, { expirationTtl: 400 * 86400 });
    return J(req, { token: t, created });
  }

  const kid = await who(req, env);
  if (!kid) return J(req, { error: "Потрібно увійти" }, 401);

  // прогрес
  if (path === "progress" && req.method === "GET") {
    const s = await env.DB.get("prog:" + kid, "json");
    return J(req, s || { p: null, upd: 0 });
  }
  if (path === "progress" && req.method === "PUT") {
    const p = body.p;
    if (!p || typeof p !== "object") return J(req, { error: "p" }, 400);
    const s = await env.DB.get("prog:" + kid, "json");
    // хтось інший (інший пристрій) уже зберіг новішу версію — віддаємо її
    if (s && s.upd && body.base !== s.upd && !body.force) return J(req, { conflict: true, p: s.p, upd: s.upd }, 409);
    const upd = Date.now();
    await env.DB.put("prog:" + kid, JSON.stringify({ p, upd }));
    return J(req, { ok: true, upd });
  }

  // звіт татові в Telegram
  if (path === "report" && req.method === "POST") return J(req, await tg(env, body.text || ""));

  return J(req, { error: "not found" }, 404);
}
