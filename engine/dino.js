/* 🦖 Герой-маскот: динозавр, який росте за пройдені уроки і вдягається за зірки.
   Малюнок — власний SVG (без зовнішніх картинок). */
(function () {
  var D = window.DINO = {};

  /* форми росту: скільки уроків пройдено (зірки > 0 або ⏭️) */
  D.FORMS = [
    { at: 0, t: "Яйце", s: 0 },
    { at: 1, t: "Щойно вилупився", s: 0.55 },
    { at: 4, t: "Малюк", s: 0.7 },
    { at: 10, t: "Підліток", s: 0.85 },
    { at: 17, t: "Дорослий динозавр", s: 1 },
    { at: 26, t: "Король динозаврів", s: 1 }
  ];
  /* речі: відкриваються, коли зібрано стільки зірок за весь час (зірки не витрачаються) */
  D.ITEMS = [
    { id: "cap", slot: "head", e: "🧢", t: "Кепка", at: 5 },
    { id: "bow", slot: "neck", e: "🎀", t: "Метелик", at: 15 },
    { id: "scarf", slot: "neck", e: "🧣", t: "Шарф", at: 30 },
    { id: "glasses", slot: "eyes", e: "🕶️", t: "Окуляри", at: 50 },
    { id: "bag", slot: "back", e: "🎒", t: "Рюкзак", at: 80 },
    { id: "cape", slot: "back", e: "🦸", t: "Плащ героя", at: 120 },
    { id: "ball", slot: "hand", e: "⚽", t: "М'яч", at: 170 },
    { id: "crown", slot: "head", e: "👑", t: "Корона", at: 230 }
  ];
  D.COLORS = {
    green: { t: "Зелений", body: "#5cc97b", dark: "#2f8f4e", belly: "#fdf0c4", spike: "#f59e42" },
    blue: { t: "Синій", body: "#5aa7f0", dark: "#2f6fc0", belly: "#fdf0c4", spike: "#facc15" },
    orange: { t: "Помаранчевий", body: "#fb9a4b", dark: "#c8621c", belly: "#fff3d6", spike: "#7c5cff" },
    purple: { t: "Фіолетовий", body: "#a98bf5", dark: "#6d4fd1", belly: "#fdf0c4", spike: "#34d399" }
  };

  D.form = function (lessons) { var f = 0; for (var i = 0; i < D.FORMS.length; i++) if (lessons >= D.FORMS[i].at) f = i; return f; };
  D.nextForm = function (lessons) { var f = D.form(lessons); return f + 1 < D.FORMS.length ? D.FORMS[f + 1] : null; };
  D.unlocked = function (stars) { return D.ITEMS.filter(function (x) { return stars >= x.at; }); };
  D.nextItem = function (stars) { for (var i = 0; i < D.ITEMS.length; i++) if (stars < D.ITEMS[i].at) return D.ITEMS[i]; return null; };

  function egg(c) {
    return '<ellipse cx="100" cy="186" rx="46" ry="7" fill="#000" opacity=".08"/>' +
      '<path d="M100 62 C130 62 148 110 148 140 C148 168 127 186 100 186 C73 186 52 168 52 140 C52 110 70 62 100 62Z" fill="#fffaf0" stroke="#e8dcc0" stroke-width="3"/>' +
      '<circle cx="82" cy="110" r="9" fill="' + c.body + '"/><circle cx="118" cy="132" r="12" fill="' + c.body + '"/><circle cx="86" cy="156" r="7" fill="' + c.body + '"/><circle cx="116" cy="92" r="6" fill="' + c.body + '"/>';
  }
  /* тіло динозавра (дивиться праворуч), «земля» — y=185 */
  function body(c, wear, king) {
    var s = "";
    if (wear.back === "cape") s += '<path d="M122 96 C96 96 50 112 22 178 L78 182 C86 150 108 124 132 110Z" fill="#e23b3b" stroke="#b82a2a" stroke-width="3" stroke-linejoin="round"/>';
    // хвіст
    s += '<path d="M62 128 C40 132 22 150 8 152 C24 162 50 160 70 156Z" fill="' + c.body + '" stroke="' + c.dark + '" stroke-width="3" stroke-linejoin="round"/>';
    // шипи на спині
    var sp = [[30, 148, 8], [50, 128, 10], [70, 110, 12], [92, 102, 12], [112, 92, 11]];
    sp.forEach(function (p) { var r = p[2]; s += '<path d="M' + (p[0] - r) + ' ' + (p[1] + 8) + ' L' + p[0] + ' ' + (p[1] - r - 4) + ' L' + (p[0] + r) + ' ' + (p[1] + 8) + 'Z" fill="' + c.spike + '" stroke="' + c.dark + '" stroke-width="2" stroke-linejoin="round"/>'; });
    // ноги (задня — темніша)
    s += '<rect x="64" y="150" width="20" height="34" rx="9" fill="' + c.dark + '"/>';
    // тулуб і шия
    s += '<ellipse cx="94" cy="138" rx="46" ry="34" fill="' + c.body + '" stroke="' + c.dark + '" stroke-width="3"/>';
    s += '<path d="M108 120 C110 100 116 92 126 84 L152 92 C146 104 140 118 134 134Z" fill="' + c.body + '"/>';
    s += '<ellipse cx="108" cy="148" rx="28" ry="20" fill="' + c.belly + '"/>';
    s += '<rect x="102" y="152" width="20" height="33" rx="9" fill="' + c.body + '" stroke="' + c.dark + '" stroke-width="3"/>';
    s += '<path d="M104 182 h16" stroke="' + c.dark + '" stroke-width="3" stroke-linecap="round"/>';
    if (wear.back === "bag") s += '<rect x="56" y="104" width="34" height="40" rx="10" fill="#3b82f6" stroke="#1e4fa8" stroke-width="3"/><rect x="62" y="122" width="22" height="12" rx="4" fill="#60a5fa"/><path d="M88 110 C100 116 104 128 100 140" stroke="#1e4fa8" stroke-width="4" fill="none"/>';
    // голова (два шипи на маківці)
    s += '<path d="M108 64 L112 42 L124 56Z M120 54 L130 32 L140 50Z" fill="' + c.spike + '" stroke="' + c.dark + '" stroke-width="2" stroke-linejoin="round"/>';
    s += '<ellipse cx="140" cy="74" rx="34" ry="27" fill="' + c.body + '" stroke="' + c.dark + '" stroke-width="3"/>';
    s += '<path d="M112 92 C118 100 128 104 136 104" stroke="' + c.body + '" stroke-width="10" fill="none"/>';
    // око, щічка, ніздря, усмішка
    s += '<circle cx="148" cy="66" r="9" fill="#fff"/><circle cx="150" cy="67" r="5" fill="#1f2937"/><circle cx="152" cy="65" r="1.8" fill="#fff"/>';
    s += '<circle cx="156" cy="84" r="5" fill="#ff8fa3" opacity=".6"/><circle cx="170" cy="70" r="2" fill="' + c.dark + '"/>';
    s += '<path d="M150 90 Q160 96 170 86" stroke="' + c.dark + '" stroke-width="3" fill="none" stroke-linecap="round"/>';
    // лапка
    s += '<path d="M128 126 C138 128 144 132 146 138" stroke="' + c.dark + '" stroke-width="7" fill="none" stroke-linecap="round"/>';
    if (wear.hand === "ball") s += '<circle cx="178" cy="170" r="15" fill="#fff" stroke="#1f2937" stroke-width="2.5"/><path d="M178 162 l6 4 -2 7 h-8 l-2 -7Z" fill="#1f2937"/><path d="M178 155v7M184 166l8-3M182 173l4 7M174 173l-4 7M172 166l-8-3" stroke="#1f2937" stroke-width="2"/>';
    if (wear.neck === "bow") s += '<path d="M120 104 L108 96 L108 114Z M120 104 L132 96 L132 114Z" fill="#ef4444" stroke="#b91c1c" stroke-width="2" stroke-linejoin="round"/><circle cx="120" cy="105" r="4.5" fill="#b91c1c"/>';
    if (wear.neck === "scarf") s += '<path d="M110 96 C122 104 138 106 150 98 L152 108 C138 116 120 114 108 106Z" fill="#ef4444"/><path d="M116 106 L110 130 L122 130 L124 108Z" fill="#dc2626"/><path d="M112 124 h10" stroke="#fff" stroke-width="2"/>';
    if (wear.eyes === "glasses") s += '<path d="M106 64 L138 64" stroke="#1f2937" stroke-width="3"/><rect x="136" y="56" width="26" height="18" rx="7" fill="#1f2937"/><path d="M141 60 l6 0" stroke="#fff" stroke-width="2" opacity=".7"/>';
    if (wear.head === "cap") s += '<path d="M114 56 C116 34 150 30 162 48 Z" fill="#2563eb"/><path d="M150 46 C164 44 180 46 186 52 C176 54 162 54 152 52Z" fill="#1e40af"/><circle cx="138" cy="36" r="3.5" fill="#1e40af"/>';
    if (wear.head === "crown" || king) s += '<path d="M118 50 L120 26 L130 38 L140 22 L150 38 L160 26 L162 50Z" fill="#facc15" stroke="#ca8a04" stroke-width="2.5" stroke-linejoin="round"/><circle cx="140" cy="42" r="3.5" fill="#ef4444"/><circle cx="127" cy="44" r="2.5" fill="#3b82f6"/><circle cx="153" cy="44" r="2.5" fill="#3b82f6"/>';
    return s;
  }
  /* o: {form, color, wear:{slot:id}, size} */
  D.svg = function (o) {
    var c = D.COLORS[o.color] || D.COLORS.green, f = D.FORMS[o.form] ? o.form : 0, sz = o.size || 160, inner;
    if (f === 0) inner = egg(c);
    else {
      var sc = D.FORMS[f].s, wear = o.wear || {}, king = f === D.FORMS.length - 1 && !wear.head;
      inner = '<ellipse cx="96" cy="186" rx="' + Math.round(70 * sc) + '" ry="6" fill="#000" opacity=".08"/>' +
        '<g transform="translate(100 185) scale(' + sc + ') translate(-100 -185)">' + body(c, wear, king) + '</g>';
      if (f === 1) inner += '<path d="M58 186 L56 160 L66 168 L76 156 L86 168 L96 156 L106 168 L116 156 L126 168 L136 158 L140 186Z" fill="#fffaf0" stroke="#e8dcc0" stroke-width="3" stroke-linejoin="round"/>';
      if (f === D.FORMS.length - 1) inner += '<text x="22" y="40" font-size="18">✨</text><text x="168" y="118" font-size="14">✨</text>';
    }
    // кадр під розмір: маленький динозаврик не губиться в порожнечі
    var h = f === 0 ? 160 : 200 - (1 - D.FORMS[f].s) * 100, x0 = 100 - h / 2 + 2;
    return '<svg class="dino" viewBox="' + x0.toFixed(1) + ' ' + (196 - h).toFixed(1) + ' ' + h.toFixed(1) + ' ' + h.toFixed(1) + '" width="' + sz + '" height="' + sz + '" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' + inner + '</svg>';
  };
})();
