// Перевірка, що сервер-функції працюють і сховище DB підключене
export async function onRequest({ env }) {
  return Response.json({ ok: true, db: !!env.DB, tg: !!env.TG_TOKEN });
}
