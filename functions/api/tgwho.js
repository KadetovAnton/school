// Тимчасово: показує номер чату, з якого написали боту /start (щоб тато вписав TG_CHAT). Після налаштування видалити.
export async function onRequest({ env }) {
  if (!env.TG_TOKEN) return Response.json({ error: "нема TG_TOKEN" });
  const r = await fetch("https://api.telegram.org/bot" + env.TG_TOKEN + "/getUpdates").then(x => x.json());
  const chats = {};
  (r.result || []).forEach(u => { const m = u.message || u.my_chat_member; if (m && m.chat) chats[m.chat.id] = m.chat.first_name || m.chat.title || ""; });
  return Response.json({ ok: r.ok, chats, tg_chat_set: !!env.TG_CHAT });
}
