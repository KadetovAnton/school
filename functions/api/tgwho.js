// Тимчасово: налаштування Telegram. Показує номер чату, а з ?test=1 — шле пробне повідомлення в TG_CHAT. Після налаштування видалити.
export async function onRequest({ env, request }) {
  if (!env.TG_TOKEN) return Response.json({ error: "нема TG_TOKEN" });
  const t = String(env.TG_TOKEN).trim(), api = "https://api.telegram.org/bot" + t + "/";
  if (new URL(request.url).searchParams.get("test")) {
    const r = await fetch(api + "sendMessage", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: String(env.TG_CHAT || "-5559835738").trim(), text: "✅ Домашня школа підключена! Сюди приходитимуть результати Ані й Артема." }) }).then(x => x.json());
    return new Response(JSON.stringify({ sent: !!r.ok, error: r.description || null }), { headers: { "Content-Type": "application/json; charset=utf-8" } });
  }
  const r = await fetch(api + "getUpdates").then(x => x.json());
  const chats = {};
  (r.result || []).forEach(u => { const m = u.message || u.my_chat_member; if (m && m.chat) chats[m.chat.id] = m.chat.first_name || m.chat.title || ""; });
  return new Response(JSON.stringify({ ok: r.ok, error: r.description || null, chats, tg_chat_set: !!env.TG_CHAT }), { headers: { "Content-Type": "application/json; charset=utf-8" } });
}
