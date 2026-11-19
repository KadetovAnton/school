/* Сервер школи (Cloudflare Pages Functions).
   Сховище KV (прив'язка DB):
     pin:<дитина>   — хеш PIN
     tok:<токен>    — якій дитині належить вхід (живе 400 днів)
     prog:<дитина>  — прогрес {p, upd}
     fail:<дитина>  — лічильник невдалих спроб PIN (блок на 15 хв після 5)
     tts:<хеш>      — готова озвучка (mp3), робиться один раз
     ttsc:<РРРР-ММ> — скільки символів відправлено в Google за місяць
   Секрети: TG_TOKEN (бот), TG_CHAT (чат тата), GOOGLE_TTS_KEY (озвучка Google).
   Змінні (необов'язково): TTS_VOICE (назва голосу), TTS_CAP (ліміт символів на місяць, типово 300000). */
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
  if (req.method === "POST" || req.method === "PUT") {
    const raw = await req.text();
    if (raw.length > 400000) return J(req, { error: "завеликий запит" }, 413);
    try { body = JSON.parse(raw); } catch (e) {}
  }

  if (path === "ping") return J(req, { ok: true, db: true, tg: !!env.TG_TOKEN, chat: !!env.TG_CHAT, tts: !!env.GOOGLE_TTS_KEY });

  // озвучка Google: лише для дитини, що увійшла; кожен текст — один раз (далі з кешу); місячний ліміт символів
  if (path === "tts" && req.method === "POST") {
    if (!(await who(req, env))) return J(req, { error: "потрібен вхід" }, 401);
    const text = String(body.text || "").trim();
    if (!text || text.length > 700) return J(req, { error: "текст порожній або задовгий" }, 400);
    const voice = String(env.TTS_VOICE || "uk-UA-Chirp3-HD-Achernar").trim();
    const key = "tts:" + await sha(voice + "|" + text);
    const audioHeaders = { "Content-Type": "audio/mpeg", "Cache-Control": "private, max-age=31536000", ...cors(req) };
    const hit = await env.DB.get(key, "arrayBuffer");
    if (hit) return new Response(hit, { headers: audioHeaders });
    if (!env.GOOGLE_TTS_KEY) return J(req, { error: "озвучку Google не налаштовано" }, 503);
    const month = "ttsc:" + new Date().toISOString().slice(0, 7);
    const used = +(await env.DB.get(month) || 0), cap = +(env.TTS_CAP || 300000);
    if (used + text.length > cap) return J(req, { error: "місячний ліміт озвучки вичерпано" }, 429);
    const r = await fetch("https://texttospeech.googleapis.com/v1/text:synthesize?key=" + encodeURIComponent(String(env.GOOGLE_TTS_KEY).trim()), {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: { text }, voice: { languageCode: voice.slice(0, 5), name: voice }, audioConfig: { audioEncoding: "MP3" } })
    }).then(x => x.json()).catch(e => ({ error: { message: String(e) } }));
    if (!r.audioContent) return J(req, { error: "Google: " + ((r.error && r.error.message) || "немає звуку") }, 502);
    await env.DB.put(month, String(used + text.length), { expirationTtl: 60 * 60 * 24 * 70 });
    const bin = Uint8Array.from(atob(r.audioContent), c => c.charCodeAt(0));
    await env.DB.put(key, bin.buffer);
    return new Response(bin, { headers: audioHeaders });
  }

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
    const p = body.p, isObj = x => x && typeof x === "object" && !Array.isArray(x);
    if (!isObj(p) || !Array.isArray(p.days) || !isObj(p.lessons) || !isObj(p.skills) || !Array.isArray(p.mistakes))
      return J(req, { error: "неправильний формат прогресу" }, 400);
    const s = await env.DB.get("prog:" + kid, "json");
    // хтось інший (інший пристрій) уже зберіг новішу версію — віддаємо її
    if (s && s.upd && body.base !== s.upd && !body.force) return J(req, { conflict: true, p: s.p, upd: s.upd }, 409);
    const upd = Date.now();
    await env.DB.put("prog:" + kid, JSON.stringify({ p, upd }));
    return J(req, { ok: true, upd });
  }

  // звіт татові в Telegram
  if (path === "report" && req.method === "POST") {
    // не більше 30 звітів на день від дитини — щоб групу не можна було заспамити
    const rk = "rep:" + kid + ":" + new Date().toISOString().slice(0, 10), n = +(await env.DB.get(rk) || 0);
    if (n >= 30) return J(req, { ok: false, error: "забагато звітів за день" }, 429);
    await env.DB.put(rk, String(n + 1), { expirationTtl: 2 * 86400 });
    return J(req, await tg(env, String(body.text || "").slice(0, 3500)));
  }

  return J(req, { error: "not found" }, 404);
}
