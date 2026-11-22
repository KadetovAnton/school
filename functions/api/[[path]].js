/* Сервер школи (Cloudflare Pages Functions).
   Сховище KV (прив'язка DB):
     pin:<дитина>   — хеш PIN
     tok:<токен>    — якій дитині належить вхід (живе 400 днів)
     prog:<дитина>  — прогрес {p, upd}
     fail:<дитина>  — лічильник невдалих спроб PIN (блок на 15 хв після 5)
     fail:parent    — те саме для PIN батьків
     dig:<дата>     — вечірній підсумок за цей день уже надіслано
     unf:<дитина>:<t> — про цю незакінчену сесію вже повідомили
   Секрети: TG_TOKEN (бот), TG_CHAT (чат тата).
   /api/cron викликає розклад (GitHub Actions, щогодини вдень): повідомлення про незакінчені
   сесії і вечірній підсумок о 20:00 за Києвом. Повторний виклик нічого не дублює. */
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
/* ---------- журнал занять: підсумки для батьків ---------- */
const NAME = { anya: "👧 Аня", artem: "👦 Артем" }, FEM = { anya: true, artem: false };
const SUBT = { english: "Англійська", math2: "Математика", algebra: "Алгебра", geometry: "Геометрія" };
function kyiv(ms) {
  const o = {};
  new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Kiev", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
    .formatToParts(new Date(ms)).forEach(x => { o[x.type] = x.value; });
  return { date: o.year + "-" + o.month + "-" + o.day, hm: o.hour + ":" + o.minute, h: +o.hour };
}
const num = x => String(Math.round(x * 10) / 10).replace(".", ",");
const subT = a => a.st && a.st !== a.sub ? a.st : SUBT[a.sub] || a.sub;
/* незакінчені: сесія з відомою кількістю завдань, почата, не доведена до кінця; якщо ту саму почали знову — дивимось лише на останню спробу */
function unfinished(acts) {
  return acts.filter((a, i) => a.tot && !a.fin && (a.pos || 0) > 0 && (a.pos || 0) < a.tot &&
    !acts.slice(i + 1).some(b => b.w === a.w && b.sub === a.sub));
}
function dayText(kid, p, date) {
  const daily = (p && p.daily && p.daily[date]) || {};
  const acts = ((p && p.act) || []).filter(a => a && a.d === date);
  let tasks = 0; for (const k in daily) tasks += daily[k] || 0;
  if (!tasks && !acts.length) return NAME[kid] + ": сьогодні не " + (FEM[kid] ? "займалась" : "займався");
  const n = acts.reduce((s, a) => s + (a.n || 0), 0), ok = acts.reduce((s, a) => s + (a.ok || 0), 0);
  const mins = Math.max(1, Math.round(acts.reduce((s, a) => s + (a.sec || 0), 0) / 60));
  const L = [NAME[kid] + " — " + (acts.length ? mins + " хв, " : "") + Math.max(tasks, n) + " завдань" + (n ? " (✅ " + ok + " правильно)" : "")];
  const gen = {};
  acts.forEach(a => {
    if (a.fin && a.w && a.mx) L.push("• " + subT(a) + ": " + a.w + " — " + num(a.sc) + " з " + a.mx);
    else if (!a.tot && a.n) { const k = subT(a) + (a.w ? ": " + a.w : ""); gen[k] = (gen[k] || 0) + a.n; }
  });
  for (const k in gen) L.push("• " + k + " — " + gen[k] + " відп.");
  unfinished(acts).forEach(a => L.push("⚠️ Не " + (FEM[kid] ? "закінчила" : "закінчив") + ": " + subT(a) + " — " + a.w + " (" + a.pos + " з " + a.tot + ")"));
  const newM = ((p && p.mistakes) || []).filter(m => m.d === date && !m.fixed).length;
  if (newM) L.push("📝 Помилок у «Мої помилки»: " + newM + " — повторить у наступних заняттях");
  return L.join("\n");
}
/* для сторінки батьків — лише те, що потрібно для статистики (без змісту завдань) */
function slim(p) {
  if (!p) return null;
  const sk = {}; for (const k in p.skills || {}) { const s = p.skills[k] || {}; sk[k] = { n: s.n, ok: s.ok, bad: s.bad, lvl: s.lvl, last: s.last, flag: s.flag }; }
  return {
    name: p.name, days: p.days || [], daily: p.daily || {}, act: (p.act || []).slice(-300), stars: p.stars || [], skills: sk, skn: p.skn || {},
    mistakes: (p.mistakes || []).map(m => ({ skill: m.skill, sub: m.sub, d: m.d, fixed: m.fixed })),
    lessons: Object.keys(p.lessons || {}).filter(k => (p.lessons[k] || {}).stars > 0 || (p.lessons[k] || {}).skip).length
  };
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
    if (raw.length > 1000000) return J(req, { error: "завеликий запит" }, 413);
    try { body = JSON.parse(raw); } catch (e) {}
  }

  if (path === "ping") return J(req, { ok: true, db: true, tg: !!env.TG_TOKEN, chat: !!env.TG_CHAT });


  // розклад: незакінчені сесії + вечірній підсумок (без входу — повторні виклики нічого не дублюють)
  if (path === "cron") {
    const now = Date.now(), K = kyiv(now), out = { unf: 0, digest: false };
    const progs = {}; for (const kid of KIDS) progs[kid] = ((await env.DB.get("prog:" + kid, "json")) || {}).p || null;
    const msgs = [];
    for (const kid of KIDS) {
      const acts = ((progs[kid] && progs[kid].act) || []).filter(a => a && now - (a.u || 0) < 24 * 3600000);
      for (const a of unfinished(acts).filter(a => now - (a.u || 0) > 40 * 60000 && now - (a.u || 0) < 12 * 3600000)) {
        const key = "unf:" + kid + ":" + a.t;
        if (await env.DB.get(key)) continue;
        await env.DB.put(key, "1", { expirationTtl: 3 * 86400 });
        msgs.push("⚠️ " + NAME[kid] + " " + (FEM[kid] ? "почала" : "почав") + " і не " + (FEM[kid] ? "закінчила" : "закінчив") + ": " + subT(a) + " — " + a.w +
          " (" + a.pos + " з " + a.tot + ", о " + kyiv(a.u).hm + ")" + (a.ok != null && a.n ? ". Правильно " + a.ok + " з " + a.n + "." : ""));
        out.unf++;
      }
    }
    if (msgs.length) await tg(env, msgs.join("\n"));
    if (K.h >= 20 && !(await env.DB.get("dig:" + K.date))) {
      await env.DB.put("dig:" + K.date, "1", { expirationTtl: 3 * 86400 });
      const d = K.date.split("-").reverse().join(".");
      await tg(env, "📊 Підсумок дня, " + d + "\n\n" + KIDS.map(k => dayText(k, progs[k], K.date)).join("\n\n"));
      out.digest = true;
    }
    return J(req, { ok: true, kyiv: K, ...out });
  }

  // сторінка батьків: PIN батьків (той, що задано в «⚙️ Батьки» у профілі дитини) → статистика дітей
  if (path === "parent" && req.method === "POST") {
    const pin = String(body.pin || "");
    if (!/^\d{4}$/.test(pin)) return J(req, { error: "PIN — 4 цифри" }, 400);
    const fails = +(await env.DB.get("fail:parent") || 0);
    if (fails >= 5) return J(req, { error: "Забагато спроб. Спробуйте через 15 хвилин." }, 429);
    // PIN батьків задається в профілі кожної дитини; підходить PIN з будь-якого профілю — тоді видно всіх дітей
    const kids = {}; let set = false, match = false;
    for (const kid of KIDS) {
      const p = ((await env.DB.get("prog:" + kid, "json")) || {}).p;
      const rp = p && p.reward && p.reward.pin;
      if (rp) set = true;
      if (rp && String(rp) === pin) match = true;
      kids[kid] = slim(p);
    }
    if (!set) return J(req, { error: "Спершу задайте PIN батьків: увійдіть у профіль дитини → 🎁 Нагорода тижня → ⚙️" }, 404);
    if (!match) {
      await env.DB.put("fail:parent", String(fails + 1), { expirationTtl: 900 });
      return J(req, { error: "PIN не підходить" }, 401);
    }
    await env.DB.delete("fail:parent");
    return J(req, { ok: true, kids });
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
