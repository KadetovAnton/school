// Тимчасово: показує номер чату, з якого написали боту /start (щоб тато вписав TG_CHAT). Після налаштування видалити.
export async function onRequest({ env }) {
  if (!env.TG_TOKEN) return Response.json({ error: "нема TG_TOKEN" });
  const t = String(env.TG_TOKEN).trim();
  const r = await fetch("https://api.telegram.org/bot" + t + "/getUpdates").then(x => x.json());
  const chats = {};
  (r.result || []).forEach(u => { const m = u.message || u.my_chat_member; if (m && m.chat) chats[m.chat.id] = m.chat.first_name || m.chat.title || ""; });
  return Response.json({ ok: r.ok, error: r.description || null, token_looks_ok: /^\d{6,}:[\w-]{30,}$/.test(t), token_length: t.length, chats, tg_chat_set: !!env.TG_CHAT });
}
