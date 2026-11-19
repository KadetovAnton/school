// Генерує content/english/*.json з читабельного JS (лапки в HTML не ламають JSON)
const fs = require("fs");
const OUT = process.argv[2];
const w = (f, o) => { fs.mkdirSync(require("path").dirname(OUT + "/" + f), { recursive: true }); fs.writeFileSync(OUT + "/" + f, JSON.stringify(o, null, 1) + "\n"); };

/* ---------------- шлях ---------------- */
w("path.json", { subject: "english", title: "Англійська", stages: [
  { n: 1, title: "Фундамент", sub: "to be і теперішній час (5–6 клас)", lessons: [
    { id: "l17", title: "Дієслово to be: am / is / are", ic: "🙂", file: "lessons/l17.json" },
    { id: "l1", title: "Present Simple: що я роблю щодня", ic: "☀️", file: "lessons/l1.json" },
    { id: "l2", title: "Present Simple: заперечення і питання", ic: "❓", file: "lessons/l2.json" },
    { id: "l3", title: "Present Continuous: що відбувається зараз", ic: "👀", file: "lessons/l3.json" },
    { id: "l4", title: "Simple чи Continuous? Тренуємо різницю", ic: "⚖️", file: "lessons/l4.json" }] },
  { n: 2, title: "Минуле", sub: "Що було вчора (6 клас)", lessons: [
    { id: "l7", title: "Past Simple: правильні дієслова, was / were", ic: "📅", file: "lessons/l7.json" },
    { id: "l8", title: "30 головних неправильних дієслів", ic: "🧩", file: "lessons/l8.json" },
    { id: "l9", title: "Past Simple: питання і заперечення", ic: "🔁", file: "lessons/l9.json" }] },
  { n: 3, title: "Опис світу", sub: "Що в мене є, де і чиє (5–6 клас)", lessons: [
    { id: "l18", title: "have got / has got", ic: "🎒", file: "lessons/l18.json" },
    { id: "l5", title: "There is / There are", ic: "🏠", file: "lessons/l5.json" },
    { id: "l20", title: "Прийменники: in / on / at, under, next to", ic: "📦", file: "lessons/l20.json" },
    { id: "l6", title: "Множина іменників, some / any", ic: "🍎", file: "lessons/l6.json" },
    { id: "l21", title: "much / many / a lot of", ic: "🧺", file: "lessons/l21.json" },
    { id: "l14", title: "Артиклі a / an / the", ic: "🅰️", file: "lessons/l14.json" },
    { id: "l19", title: "Чиє це? 's, whose, this / these", ic: "🔑", file: "lessons/l19.json" },
    { id: "l15", title: "Займенники: me / mine / myself", ic: "🙋", file: "lessons/l15.json" }] },
  { n: 4, title: "Майбутнє, порівняння, правила", sub: "6–7 клас", lessons: [
    { id: "l16", title: "Майбутнє: will і be going to", ic: "🔮", file: "lessons/l16.json" },
    { id: "l10", title: "Ступені порівняння", ic: "📏", file: "lessons/l10.json" },
    { id: "l11", title: "can / must / mustn't", ic: "🚦", file: "lessons/l11.json" },
    { id: "l25", title: "Пропозиції й запрошення: Would you like…? Let's…", ic: "☕", file: "lessons/l25.json" }] },
  { n: 5, title: "7 клас (НУШ)", sub: "Програма року", lessons: [
    { id: "l22", title: "Розділові запитання: …, isn't it?", ic: "🤔", file: "lessons/l22.json" },
    { id: "l12", title: "Past Continuous", ic: "🎬", file: "lessons/l12.json" },
    { id: "l13", title: "Present Perfect", ic: "✅", file: "lessons/l13.json" },
    { id: "l24", title: "Present Perfect Continuous; Present Perfect чи Past Simple", ic: "⏳", file: "lessons/l24.json" },
    { id: "l23", title: "Past Perfect: що сталося раніше", ic: "⏪", file: "lessons/l23.json" }] }
] });

/* ---------------- урок 1 ---------------- */
w("lessons/l1.json", {
  id: "l1",
  title: "Present Simple: що я роблю щодня",
  skillFiles: ["skills/ps.json"],
  skills: ["ps.base", "ps.s", "ps.es", "ps.ies", "ps.has", "ps.adv"],
  practice: { perSkill: 2 },
  test: { plan: { "ps.base": 1, "ps.s": 1, "ps.es": 2, "ps.ies": 2, "ps.has": 1, "ps.adv": 1 }, pass: 80 },
  explain: [
    { e: "☀️", h: "Коли вживаємо?",
      html: `<p>Present Simple — це про те, що буває <b>регулярно</b>: щодня, завжди, зазвичай. Твої звички, розклад, факти.</p>
      <div class="ex"><div><div class="en">I <b>go</b> to school every day.</div><div class="ua">Я ходжу до школи щодня.</div></div><button class="say round" data-say="I go to school every day.">🔊</button></div>
      <div class="tip">🔎 <b>Слова-підказки:</b> every day (щодня), always (завжди), usually (зазвичай), often (часто), sometimes (іноді), never (ніколи).</div>` },
    { e: "🙂", h: "Як утворюється?",
      html: `<p>Найпростіше в англійській: беремо дієслово <b>як у словнику</b>, нічого не змінюємо.</p>
      <table class="t">
        <tr><td>I</td><td>play</td><td class="muted">я граю</td></tr>
        <tr><td>you</td><td>play</td><td class="muted">ти граєш</td></tr>
        <tr><td>we</td><td>play</td><td class="muted">ми граємо</td></tr>
        <tr><td>they</td><td>play</td><td class="muted">вони грають</td></tr>
      </table>
      <p class="muted">Порівняй: в українській дієслово змінюється для кожної особи, а в англійській майже ніколи. Майже…</p>` },
    { e: "⚠️", h: "Головна пастка: he / she / it",
      html: `<p>Коли мова про <b>одну людину чи предмет</b> (він, вона, воно), до дієслова додаємо хвостик <b>-s</b>.</p>
      <div class="rule-box" style="text-align:center;font-size:20px;font-weight:900">he / she / it → дієслово + s</div>
      <div class="ex"><div><div class="en">She <b>plays</b> tennis.</div><div class="ua">Вона грає в теніс.</div></div><button class="say round" data-say="She plays tennis.">🔊</button></div>
      <div class="ex"><div><div class="en">My mum <b>works</b> in a shop.</div><div class="ua">Моя мама працює в магазині.</div></div><button class="say round" data-say="My mum works in a shop.">🔊</button></div>
      <div class="tip">💡 Увага: <b>my mum, Tom, the cat, my friend</b> — це теж he / she / it! Тому і тут потрібна -s.</div>` },
    { e: "✏️", h: "Як правильно додати -s",
      html: `<table class="t">
        <tr><td>Майже всі</td><td>+ s</td><td>play → play<b>s</b><br>read → read<b>s</b></td></tr>
        <tr><td>-s, -sh, -ch, -x, -o</td><td>+ es</td><td>watch → watch<b>es</b><br>go → go<b>es</b><br>do → do<b>es</b></td></tr>
        <tr><td>приголосна + y</td><td>y → ies</td><td>study → stud<b>ies</b><br>fly → fl<b>ies</b></td></tr>
        <tr><td>голосна + y</td><td>+ s</td><td>play → play<b>s</b></td></tr>
        <tr><td>виняток</td><td>have</td><td>he <b>has</b></td></tr>
      </table>
      <div class="tip">💡 Чому -es? Спробуй вимовити «watchs» — язик заплітається. Тому додаємо голосну: watch<b>es</b> [вочіз].</div>` },
    { e: "📍", h: "Куди ставити always, usually, never?",
      html: `<p>Ці слова стоять <b>перед дієсловом</b>:</p>
      <div class="ex"><div><div class="en">She <b>always</b> gets up at seven.</div><div class="ua">Вона завжди встає о сьомій.</div></div><button class="say round" data-say="She always gets up at seven.">🔊</button></div>
      <div class="ex"><div><div class="en">I <b>never</b> drink coffee.</div><div class="ua">Я ніколи не п'ю каву.</div></div><button class="say round" data-say="I never drink coffee.">🔊</button></div>
      <div class="rule-box"><b>Запам'ятай:</b> хто → <u>як часто</u> → що робить → решта.</div>` }
  ],
  examples: { title: "Один день Софійки", tip: "Натисни 🔊 і повтори вголос. Подивись на виділені дієслова: де є -s, а де нема, і чому?",
    question: { q: "чому «Her brothers <b>play</b>» без -s?", a: "Бо brothers — їх кілька, це they." },
    items: [
      ["Sofia <b>gets</b> up at seven o'clock.", "Софійка встає о сьомій."],
      ["She <b>brushes</b> her teeth and <b>has</b> breakfast.", "Вона чистить зуби і снідає."],
      ["Her mum <b>makes</b> pancakes on Sundays.", "Її мама робить млинці в неділю."],
      ["Sofia <b>goes</b> to school by bus.", "Софійка їздить до школи автобусом."],
      ["She <b>studies</b> English and maths.", "Вона вивчає англійську і математику."],
      ["After school she <b>does</b> her homework.", "Після школи вона робить домашнє завдання."],
      ["Her brothers <b>play</b> football in the yard.", "Її брати грають у футбол у дворі."],
      ["In the evening the family <b>watches</b> TV.", "Увечері сім'я дивиться телевізор."],
      ["She usually <b>goes</b> to bed at ten.", "Зазвичай вона лягає спати о десятій."]
    ] },
  words: [
    ["get up", "вставати"], ["have breakfast", "снідати"], ["brush my teeth", "чистити зуби"],
    ["go to school", "йти до школи"], ["have lunch", "обідати"], ["do homework", "робити домашнє завдання"],
    ["go to bed", "лягати спати"], ["always", "завжди"], ["usually", "зазвичай"], ["never", "ніколи"]
  ]
});

/* ---------------- навички Present Simple ---------------- */
const VI = "Впиши дієслово з правильним закінченням";
const inp = (p, a, h, e, err) => ({ type: "input", task: VI, p, a: [a], h, e, err });
// «Знайди помилку»: bad — номер слова з помилкою (з 0), a — виправлене речення
const fix = (p, bad, a, h, e) => ({ type: "fix", task: "Знайди і натисни слово з помилкою", p, bad, a, h, e });
// «Послухай і напиши»: err — типові граматичні помилки в цьому реченні
const dict = (a, h, e, err) => ({ type: "dict", task: "Послухай і напиши речення", p: "🎧 " + a, a: [a], h, e, err });
const DH = "Послухай ще раз — можна повільно 🐢";

w("skills/ps.json", { topic: "ps", title: "Present Simple", skills: [

{ id: "ps.base", title: "I / you / we / they: дієслово без змін",
  rule: "З I, you, we, they дієслово як у словнику: I play, they play.",
  worked: { p: "My friends ___ basketball. (play)", steps: [
    "Хто? <b>My friends</b> — друзі, їх багато.",
    "Багато = <b>they</b>.",
    "З they дієслово не змінюємо, хвостика немає.",
    "Відповідь: My friends <b>play</b> basketball."] },
  alt: `<p>Уяви, що -s — це значок «один-єдиний». Його чіпляють до дієслова, тільки коли діє <b>одна</b> особа, і це не я і не ти.</p>
    <p>I (я), you (ти, ви), we (ми), they (вони) — значок не потрібен: <b>I play, you play, we play, they play</b>.</p>`,
  items: [
    { type: "choice", p: "I ___ football every Saturday.", o: ["play", "plays"], a: "play",
      h: ["Хто? <b>I</b> — я.", "Хвостик -s буває тільки з he / she / it."],
      e: "З I / you / we / they дієслово без змін: I <b>play</b>.",
      err: { "plays": "З <b>I</b> закінчення не додаємо — тільки з he / she / it." } },
    { type: "choice", p: "They ___ TV in the evening.", o: ["watch", "watches"], a: "watch",
      h: ["They — це «вони». Їх багато.", "Хвостик тільки для одного: he / she / it."],
      e: "they → дієслово без змін: they <b>watch</b>.",
      err: { "watches": "they — «вони», тут закінчення не потрібне: they <b>watch</b>." } },
    { type: "choice", p: "We ___ to school by bus.", o: ["goes", "go"], a: "go",
      h: ["We — «ми».", "Хвостик тільки для he / she / it."],
      e: "we → дієслово без змін: we <b>go</b>.",
      err: { "goes": "we — «ми», закінчення не потрібне: we <b>go</b>." } },
    { type: "choice", p: "I ___ milk every morning.", o: ["drink", "drinks"], a: "drink",
      h: ["I — я.", "З I хвостика немає."],
      e: "I → <b>drink</b>.",
      err: { "drinks": "З I закінчення не додаємо: I <b>drink</b>." } },
    { type: "choice", p: "Mark and Jane ___ in Kyiv.", o: ["live", "lives"], a: "live",
      h: ["Mark and Jane — скільки людей?", "Двоє = they."],
      e: "Mark and Jane = they → <b>live</b>.",
      err: { "lives": "Mark and Jane — це двоє (they), тому без закінчення: <b>live</b>." } },
    inp("You ___ very well. (sing)", "sing",
      ["You — «ти» або «ви».", "З you дієслово не змінюється."],
      "you → дієслово без змін: you <b>sing</b>.",
      { "sings": "З <b>you</b> закінчення не додаємо: you <b>sing</b>." }),
    inp("My parents ___ in a big city. (live)", "live",
      ["My parents — батьки. Скільки їх?", "Двоє = they."],
      "My parents = they → <b>live</b>.",
      { "lives": "My parents — це вони (they), закінчення не потрібне: <b>live</b>." }),
    inp("We ___ English on Mondays. (have)", "have",
      ["We — «ми».", "has буває тільки з he / she / it."],
      "we → <b>have</b>.",
      { "has": "has — тільки для he / she / it. З we: <b>have</b>." }),
    fix("My friends plays football after school.", 2, "My friends play football after school.",
      ["My friends — їх кілька. Це they.", "З they дієслово без -s."],
      "My friends = they → <b>play</b>, без -s."),
    fix("I goes to the park on Sundays.", 1, "I go to the park on Sundays.",
      ["Хто? I — я.", "З I дієслово не змінюється."],
      "I → <b>go</b>. -es буває тільки з he / she / it."),
    dict("We live in a small village.", [DH, "We — «ми»: дієслово без змін."],
      "we → <b>live</b>.", { "We lives in a small village.": "we — «ми», закінчення не потрібне: we <b>live</b>." }),
    dict("They play tennis on Fridays.", [DH, "They — «вони»: дієслово без змін."],
      "they → <b>play</b>.", { "They plays tennis on Fridays.": "they — «вони», закінчення не потрібне: they <b>play</b>." })
  ] },

{ id: "ps.s", title: "he / she / it: + s",
  rule: "he / she / it (і Tom, my mum, the cat) → дієслово + s.",
  worked: { p: "My cat ___ milk. (like)", steps: [
    "Хто? <b>My cat</b> — кіт, один.",
    "Один предмет чи тварина = <b>it</b>.",
    "he / she / it → додаємо <b>-s</b>.",
    "Відповідь: My cat <b>likes</b> milk."] },
  alt: `<p>Підстав замість того, хто діє, маленьке слово: <b>Tom → he</b>, <b>my mum → she</b>, <b>the dog → it</b>, <b>Tom and Ann → they</b>.</p>
    <p>Вийшло he, she чи it? Тоді дієслову потрібен хвостик <b>-s</b>. Вийшло I, you, we, they? Хвостика немає.</p>`,
  items: [
    { type: "choice", p: "My mum ___ in a hospital.", o: ["work", "works"], a: "works",
      h: ["My mum — це «вона».", "she → дієслово + s"],
      e: "My mum = she → <b>works</b>.",
      err: { "work": "My mum — це «вона» (she), тож потрібна -s: work<b>s</b>." } },
    { type: "choice", p: "Our teacher ___ very fast.", o: ["speak", "speaks"], a: "speaks",
      h: ["Our teacher = he або she.", "he / she → + s"],
      e: "Our teacher = she → <b>speaks</b>.",
      err: { "speak": "Our teacher — це одна людина (he/she): speak<b>s</b>." } },
    inp("My dad ___ coffee every morning. (drink)", "drinks",
      ["My dad = he.", "he → дієслово + s."],
      "My dad = he → drink<b>s</b>.",
      { "drink": "My dad — це «він» (he), потрібна -s: drink<b>s</b>." }),
    inp("The shop ___ at nine o'clock. (open)", "opens",
      ["The shop — магазин, один. Це he, she чи it?", "it → дієслово + s."],
      "The shop = it → open<b>s</b>.",
      { "open": "The shop — це «воно» (it), потрібна -s: open<b>s</b>." }),
    inp("Anna ___ in a small village. (live)", "lives",
      ["Anna = she.", "she → дієслово + s."],
      "Anna = she → live<b>s</b>.",
      { "live": "Anna — це «вона» (she), потрібна -s: live<b>s</b>." }),
    inp("It ___ a lot here in autumn. (rain)", "rains",
      ["It — «воно».", "it → дієслово + s."],
      "it → rain<b>s</b>.",
      { "rain": "З it потрібна -s: rain<b>s</b>." }),
    fix("My sister like ice cream.", 2, "My sister likes ice cream.",
      ["My sister = she.", "she → дієслово + s."],
      "My sister = she → <b>likes</b>."),
    fix("The dog sleep in the garden.", 2, "The dog sleeps in the garden.",
      ["The dog = it.", "it → дієслово + s."],
      "The dog = it → <b>sleeps</b>."),
    dict("He reads a lot of books.", [DH, "he → дієслово + s."],
      "he → read<b>s</b>.", { "He read a lot of books.": "he → потрібна -s: read<b>s</b>." }),
    dict("Our cat sleeps all day.", [DH, "Our cat = it → дієслово + s."],
      "Our cat = it → sleep<b>s</b>.", { "Our cat sleep all day.": "Our cat = it → потрібна -s: sleep<b>s</b>." })
  ] },

{ id: "ps.es", title: "-s, -sh, -ch, -x, -o → + es",
  rule: "Після -s, -sh, -ch, -x, -o додаємо -es: watches, goes.",
  worked: { p: "Dad ___ TV in the evening. (watch)", steps: [
    "Хто? <b>Dad</b> = he → потрібне закінчення.",
    "Дивлюся на кінець слова: watch → <b>-ch</b>.",
    "Після -s, -sh, -ch, -x, -o пишемо <b>-es</b>.",
    "Відповідь: Dad <b>watches</b> TV in the evening."] },
  alt: `<p>Скажи вголос: «watchs», «fixs», «washs». Язик заплітається, правда? 😄</p>
    <p>Тому після шиплячих і свистячих звуків (-s, -sh, -ch, -x) вставляємо голосну: <b>watch-es, fix-es, wash-es</b>. А go і do треба просто запам'ятати: <b>goes, does</b>.</p>`,
  items: [
    inp("Tom ___ cartoons every morning. (watch)", "watches",
      ["Tom = he, тож потрібне закінчення.", "watch закінчується на -ch. Подивись у табличку: -s чи -es?"],
      "Після -ch додаємо <b>-es</b>: watch → watch<b>es</b>.",
      { "watchs": "Після -ch додаємо -es: watch<b>es</b>.", "watch": "Tom = he, тож потрібне закінчення: watch<b>es</b>." }),
    inp("She ___ to bed at ten. (go)", "goes",
      ["she → закінчення потрібне.", "go закінчується на -o."],
      "go, do → <b>goes, does</b>.",
      { "gos": "go закінчується на -o, тому -es: go<b>es</b>.", "go": "she → потрібне закінчення: go<b>es</b>." }),
    inp("The lesson ___ at two o'clock. (finish)", "finishes",
      ["The lesson = it.", "finish закінчується на -sh."],
      "Після -sh додаємо <b>-es</b>: finish<b>es</b>.",
      { "finishs": "Після -sh додаємо -es: finish<b>es</b>.", "finish": "The lesson = it, потрібне закінчення: finish<b>es</b>." }),
    inp("My sister ___ her homework after school. (do)", "does",
      ["My sister = she.", "do закінчується на -o."],
      "do → <b>does</b>.",
      { "dos": "do закінчується на -o: do<b>es</b>.", "do": "My sister = she → <b>does</b>." }),
    inp("Dad ___ cars. (fix)", "fixes",
      ["Dad = he.", "fix закінчується на -x."],
      "Після -x → <b>-es</b>: fix<b>es</b>.",
      { "fixs": "Після -x додаємо -es: fix<b>es</b>.", "fix": "Dad = he → fix<b>es</b>." }),
    inp("My grandma ___ the dishes after dinner. (wash)", "washes",
      ["My grandma = she.", "wash закінчується на -sh."],
      "Після -sh → <b>-es</b>: wash<b>es</b>.",
      { "washs": "Після -sh додаємо -es: wash<b>es</b>.", "wash": "My grandma = she → wash<b>es</b>." }),
    inp("The bus ___ our house at eight. (pass)", "passes",
      ["The bus = it.", "pass закінчується на -s."],
      "Після -s → <b>-es</b>: pass<b>es</b>.",
      { "passs": "Після -s додаємо -es: pass<b>es</b>.", "pass": "The bus = it → pass<b>es</b>." }),
    inp("She ___ her teeth twice a day. (brush)", "brushes",
      ["she → закінчення потрібне.", "brush закінчується на -sh."],
      "Після -sh → <b>-es</b>: brush<b>es</b>.",
      { "brushs": "Після -sh додаємо -es: brush<b>es</b>.", "brush": "she → brush<b>es</b>." }),
    fix("He watchs cartoons every evening.", 1, "He watches cartoons every evening.",
      ["Подивись на дієслово: на що закінчується watch?", "-ch → + es."],
      "watch закінчується на -ch → <b>watches</b>."),
    fix("My dad gos to work by car.", 2, "My dad goes to work by car.",
      ["Подивись на дієслово: go закінчується на -o.", "-o → + es."],
      "go → <b>goes</b>."),
    dict("She goes to school at eight.", [DH, "go з she → ?"],
      "she → <b>goes</b>.", { "She go to school at eight.": "she → потрібне закінчення: go<b>es</b>.", "She gos to school at eight.": "go закінчується на -o: go<b>es</b>." }),
    dict("Tom watches TV in the evening.", [DH, "watch з he → ?"],
      "Tom = he, watch на -ch → <b>watches</b>.", { "Tom watch TV in the evening.": "Tom = he → watch<b>es</b>.", "Tom watchs TV in the evening.": "Після -ch додаємо -es: watch<b>es</b>." })
  ] },

{ id: "ps.ies", title: "y → ies чи просто + s",
  rule: "Приголосна + y → ies (studies). Голосна + y → + s (plays).",
  worked: { p: "Kate ___ hard. (study)", steps: [
    "Хто? <b>Kate</b> = she → потрібне закінчення.",
    "Кінець слова: study → <b>-y</b>.",
    "Що перед y? Буква <b>d</b> — приголосна.",
    "Приголосна + y → y міняємо на <b>ies</b>.",
    "Відповідь: Kate <b>studies</b> hard. А от у play перед y голосна a, тому просто play<b>s</b>."] },
  alt: `<p>Дивись на букву <b>перед y</b>:</p>
    <table class="t"><tr><td>голосна (a, e, o, u)</td><td>y лишається, + s</td><td>pl<b>a</b>y → plays</td></tr>
    <tr><td>приголосна</td><td>y → ies</td><td>stu<b>d</b>y → studies</td></tr></table>
    <p class="muted">Голосна ніби «тримає» y, і вона не змінюється. Приголосна не тримає — y перетворюється на ies.</p>`,
  items: [
    inp("My brother ___ English. (study)", "studies",
      ["My brother = he.", "study: перед y стоїть приголосна d. Що відбувається з y?"],
      "Приголосна + y → <b>ies</b>: study → stud<b>ies</b>.",
      { "studys": "Перед y стоїть приголосна (d), тому y → ies: stud<b>ies</b>.", "studyes": "y міняємо на i: stud<b>ies</b>.", "study": "My brother = he, потрібне закінчення: stud<b>ies</b>." }),
    inp("Max ___ to Lviv every summer. (fly)", "flies",
      ["Max = he.", "fly: перед y приголосна l."],
      "Приголосна + y → <b>ies</b>: fl<b>ies</b>.",
      { "flys": "Перед y приголосна, тому fl<b>ies</b>.", "fly": "Max = he → fl<b>ies</b>." }),
    inp("He ___ the guitar. (play)", "plays",
      ["he → закінчення потрібне.", "play: перед y стоїть голосна a."],
      "Голосна + y → просто <b>+s</b>: play<b>s</b>.",
      { "plaies": "Перед y голосна (a), тому y не чіпаємо: play<b>s</b>.", "play": "he → потрібне закінчення: play<b>s</b>." }),
    inp("The baby ___ at night. (cry)", "cries",
      ["The baby = he або she.", "cry: перед y приголосна r."],
      "Приголосна + y → <b>ies</b>: cr<b>ies</b>.",
      { "crys": "Перед y приголосна (r), тому cr<b>ies</b>.", "cry": "The baby — одна дитина, потрібне закінчення: cr<b>ies</b>." }),
    inp("My sister ___ her room on Saturdays. (tidy)", "tidies",
      ["My sister = she.", "tidy: перед y приголосна d."],
      "Приголосна + y → <b>ies</b>: tid<b>ies</b>.",
      { "tidys": "Перед y приголосна (d), тому tid<b>ies</b>.", "tidy": "My sister = she → tid<b>ies</b>." }),
    inp("Our cat ___ at home all day. (stay)", "stays",
      ["Our cat = it.", "stay: перед y голосна a."],
      "Голосна + y → просто <b>+s</b>: stay<b>s</b>.",
      { "staies": "Перед y голосна (a), тому y не чіпаємо: stay<b>s</b>.", "stay": "Our cat = it → stay<b>s</b>." }),
    inp("Mum ___ potatoes for dinner. (fry)", "fries",
      ["Mum = she.", "fry: перед y приголосна r."],
      "Приголосна + y → <b>ies</b>: fr<b>ies</b>.",
      { "frys": "Перед y приголосна (r), тому fr<b>ies</b>.", "fry": "Mum = she → fr<b>ies</b>." }),
    fix("My brother studys maths every day.", 2, "My brother studies maths every day.",
      ["Подивись на study: що стоїть перед y?", "Приголосна + y → ies."],
      "Перед y приголосна d → <b>studies</b>."),
    fix("She plaies the piano.", 1, "She plays the piano.",
      ["Подивись на play: що стоїть перед y?", "Голосна + y → просто + s."],
      "Перед y голосна a → <b>plays</b>."),
    dict("Anna studies French.", [DH, "study: перед y приголосна → ies."],
      "Anna = she, study → <b>studies</b>.", { "Anna studys French.": "Перед y приголосна (d): stud<b>ies</b>.", "Anna study French.": "Anna = she → stud<b>ies</b>." }),
    dict("He enjoys his English lessons.", [DH, "enjoy: перед y голосна o → просто + s."],
      "Перед y голосна o → enjoy<b>s</b>.", { "He enjoies his English lessons.": "Перед y голосна (o), тому просто + s: enjoy<b>s</b>.", "He enjoy his English lessons.": "he → потрібна -s: enjoy<b>s</b>." })
  ] },

{ id: "ps.has", title: "have → has",
  rule: "З he / she / it: have → has.",
  worked: { p: "My brother ___ a bike. (have)", steps: [
    "Хто? <b>My brother</b> = he.",
    "have — особливе слово: з he / she / it воно не have і не haves.",
    "he / she / it → <b>has</b>.",
    "Відповідь: My brother <b>has</b> a bike."] },
  alt: `<p>have — «неслухняне» слово. Замість haves у he / she / it кажемо коротко <b>has</b>.</p>
    <p>Порівняй: I <b>have</b> a cat. → She <b>has</b> a cat. We <b>have</b> a dog. → Tom <b>has</b> a dog.</p>`,
  items: [
    { type: "choice", p: "Ann ___ a cat.", o: ["have", "has", "haves"], a: "has",
      h: ["Ann = she.", "have — виняток!"],
      e: "have з he / she / it стає <b>has</b>.",
      err: { "have": "Ann = she, а have з she стає <b>has</b>.", "haves": "have — виняток, не haves, а <b>has</b>." } },
    { type: "choice", p: "She ___ two brothers.", o: ["have", "has"], a: "has",
      h: ["she → …", "have — виняток."],
      e: "she → <b>has</b>.",
      err: { "have": "З she have стає <b>has</b>." } },
    inp("My friend ___ a new phone. (have)", "has",
      ["My friend — один друг: he або she.", "have з he / she → ?"],
      "he / she → <b>has</b>.",
      { "haves": "have — виняток: не haves, а <b>has</b>.", "have": "My friend = he/she → <b>has</b>." }),
    inp("We ___ a big dog. (have)", "have",
      ["We — «ми».", "has — тільки для he / she / it."],
      "we → <b>have</b>.",
      { "has": "has — тільки для he / she / it. З we: <b>have</b>." }),
    inp("Dad ___ lunch at one o'clock. (have)", "has",
      ["Dad = he.", "have з he → ?"],
      "he → <b>has</b>: Dad has lunch.",
      { "haves": "have — виняток: не haves, а <b>has</b>.", "have": "Dad = he → <b>has</b>." }),
    inp("They ___ a lot of homework. (have)", "have",
      ["They — «вони».", "has — тільки для he / she / it."],
      "they → <b>have</b>.",
      { "has": "has — тільки для he / she / it. З they: <b>have</b>." }),
    fix("My mum have a red car.", 2, "My mum has a red car.",
      ["My mum = she.", "have з she → ?"],
      "My mum = she → <b>has</b>."),
    fix("We has a lot of friends.", 1, "We have a lot of friends.",
      ["We — «ми».", "has — тільки для he / she / it."],
      "we → <b>have</b>."),
    dict("She has a little brother.", [DH, "she → has."],
      "she → <b>has</b>.", { "She have a little brother.": "she → <b>has</b>.", "She haves a little brother.": "have — виняток: <b>has</b>." }),
    dict("They have a big garden.", [DH, "they → have."],
      "they → <b>have</b>.", { "They has a big garden.": "has — тільки для he / she / it. З they: <b>have</b>." })
  ] },

{ id: "ps.adv", title: "Де стоять always, usually, never",
  rule: "Хто → як часто → що робить: She always gets up…",
  worked: { p: "«Я завжди роблю уроки ввечері»", steps: [
    "Хто? <b>I</b>.",
    "Як часто? <b>always</b>.",
    "Що роблю? <b>do</b> my homework.",
    "«Як часто» ставимо перед дієсловом: I → always → do.",
    "Відповідь: <b>I always do my homework in the evening.</b>"] },
  alt: `<p>Уяви потяг з вагонів: <b>хто → як часто → що робить → решта</b>.</p>
    <p>Вагон «як часто» (always, usually, often, sometimes, never) чіпляється <b>одразу перед</b> вагоном «що робить».</p>`,
  items: [
    { type: "order", task: "Склади речення", p: "«Вона завжди встає о сьомій».",
      words: ["up", "She", "seven", "always", "at", "gets"],
      a: ["she always gets up at seven", "at seven she always gets up"],
      h: ["Хто → як часто → що робить → коли.", "She → always → gets up → …"],
      e: "<b>She always gets up at seven.</b> always стоїть перед дієсловом." },
    { type: "choice", p: "Яке речення правильне?", o: ["He usually walks to school.", "He walks usually to school.", "He usually walk to school."], a: "He usually walks to school.",
      h: ["usually ставимо перед дієсловом.", "І не забудь: he → дієслово + s."],
      e: "Хто → як часто → дієслово з -s: He <b>usually walks</b> to school.",
      err: { "He walks usually to school.": "usually стоїть <b>перед</b> дієсловом: He usually walks…", "He usually walk to school.": "Порядок правильний, але he → walk<b>s</b>." } },
    { type: "order", task: "Склади речення", p: "«Мій тато ніколи не п'є каву».",
      words: ["never", "coffee", "My", "drinks", "dad"],
      a: ["my dad never drinks coffee"],
      h: ["Хто → як часто → що робить → що.", "My dad → never → drinks → …"],
      e: "<b>My dad never drinks coffee.</b> never стоїть перед дієсловом." },
    { type: "order", task: "Склади речення", p: "«Я зазвичай снідаю о восьмій».",
      words: ["usually", "I", "breakfast", "have", "at", "eight"],
      a: ["i usually have breakfast at eight", "usually i have breakfast at eight", "at eight i usually have breakfast"],
      h: ["Хто → як часто → що робить → коли.", "I → usually → have breakfast → …"],
      e: "<b>I usually have breakfast at eight.</b> usually стоїть перед дієсловом." },
    { type: "order", task: "Склади речення", p: "«Ми іноді граємо в шахи».",
      words: ["sometimes", "We", "chess", "play"],
      a: ["we sometimes play chess", "sometimes we play chess", "we play chess sometimes"],
      h: ["Хто → як часто → що робить → що.", "We → sometimes → play → …"],
      e: "<b>We sometimes play chess.</b> sometimes зазвичай ставимо перед дієсловом (його ще можна на початок чи в кінець)." },
    { type: "choice", p: "Яке речення правильне?", o: ["Tom often plays chess.", "Tom plays often chess.", "Tom often play chess."], a: "Tom often plays chess.",
      h: ["often ставимо перед дієсловом.", "Tom = he → дієслово + s."],
      e: "Хто → як часто → дієслово з -s: Tom <b>often plays</b> chess.",
      err: { "Tom plays often chess.": "often стоїть <b>перед</b> дієсловом: Tom often plays…", "Tom often play chess.": "Порядок правильний, але Tom = he → play<b>s</b>." } },
    { type: "order", task: "Склади речення", p: "«Вона ніколи не їсть м'ясо».",
      words: ["never", "She", "meat", "eats"],
      a: ["she never eats meat"],
      h: ["Хто → як часто → що робить → що.", "She → never → eats → …"],
      e: "<b>She never eats meat.</b> never стоїть перед дієсловом." },
    fix("She goes always to school by bus.", 2, "She always goes to school by bus.",
      ["Слова «як часто» мають своє місце.", "always стоїть перед дієсловом."],
      "always — перед дієсловом: She <b>always goes</b>…"),
    fix("Tom plays often computer games.", 2, "Tom often plays computer games.",
      ["Слова «як часто» мають своє місце.", "often стоїть перед дієсловом."],
      "often — перед дієсловом: Tom <b>often plays</b>…"),
    dict("I usually get up at seven.", [DH, "Хто → як часто → що робить."],
      "<b>I usually get up</b> at seven."),
    dict("We never watch TV in the morning.", [DH, "Хто → як часто → що робить."],
      "<b>We never watch</b> TV in the morning.")
  ] }
] });
require("./gen_l2_4.js")(w);
require("./gen_l5_6.js")(w);
require("./gen_l7_9.js")(w);
require("./gen_l10_16a.js")(w);
require("./gen_l10_16b.js")(w);
require("./gen_found.js")(w);
require("./gen_g7.js")(w);
require("./gen_words.js")(w);
console.log("ok");

/* ---------- діти і предмети ---------- */
fs.writeFileSync(OUT + "/../subjects.json", JSON.stringify({
  dailyGoal: 15,
  children: [
    { id: "anya", name: "Аня", emoji: "👧", grade: 7, g: "f", subjects: [
      { id: "english", title: "Англійська", ic: "🇬🇧", open: true },
      { id: "algebra", title: "Алгебра", ic: "🔢", open: true },
      { id: "geometry", title: "Геометрія", ic: "📐" },
      { id: "ukrainian", title: "Українська мова", ic: "✍️" },
      { id: "physics", title: "Фізика", ic: "⚡" },
      { id: "chemistry", title: "Хімія", ic: "🧪" },
      { id: "biology", title: "Біологія", ic: "🌿" },
      { id: "geography", title: "Географія", ic: "🗺️" },
      { id: "history", title: "Історія", ic: "🏛️" }
    ] },
    { id: "artem", name: "Артем", emoji: "👦", grade: 2, g: "m", subjects: [
      { id: "math2", title: "Математика", ic: "🔢", open: true },
      { id: "ukrainian2", title: "Українська мова", ic: "✍️" },
      { id: "reading2", title: "Читання", ic: "📖" },
      { id: "world2", title: "Я досліджую світ", ic: "🌍" },
      { id: "english2", title: "Англійська", ic: "🇬🇧" }
    ] }
  ]
}, null, 1) + "\n");
