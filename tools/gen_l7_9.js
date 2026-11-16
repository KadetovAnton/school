// Уроки 7–9: Past Simple (правильні дієслова, was/were), 30 неправильних дієслів, заперечення і питання
module.exports = function (w) {
  const say = (en, ua, hl) => `<div class="ex"><div><div class="en">${hl || en}</div><div class="ua">${ua}</div></div><button class="say round" data-say="${en}">🔊</button></div>`;
  const inp = (task, p, a, h, e, err, extra) => Object.assign({ type: "input", task, p, a: Array.isArray(a) ? a : [a], h, e, err }, extra || {});
  const ch = (p, o, a, h, e, err) => ({ type: "choice", p, o, a, h, e, err });
  const fix = (p, bad, a, h, e) => ({ type: "fix", task: "Знайди і натисни слово з помилкою", p, bad, a, h, e });
  const dict = (a, h, e, err) => ({ type: "dict", task: "Послухай і напиши речення", p: "🎧 " + a, a: [a], h, e, err });
  const ord = (p, words, a, h, e, end) => Object.assign({ type: "order", task: "Склади речення", p, words, a, h, e }, end ? { end } : {});
  const DH = "Послухай ще раз — можна повільно 🐢";
  const S = { strict: true };
  const PS = "Впиши дієслово в Past Simple";

  /* ===================== УРОК 7 ===================== */
  w("lessons/l7.json", {
    id: "l7", title: "Past Simple: правильні дієслова, was / were",
    skillFiles: ["skills/past.json"],
    skills: ["past.ed", "past.spell", "past.be"],
    practice: { perSkill: 4 },
    test: { plan: { "past.ed": 3, "past.spell": 3, "past.be": 2 }, pass: 80 },
    explain: [
      { e: "📅", h: "Що було вчора",
        html: `<p>Past Simple — про дію, яка <b>вже відбулась і закінчилась</b> у минулому.</p>
        ${say("I played football yesterday.", "Я грав у футбол учора.", "I <b>played</b> football yesterday.")}
        <div class="tip">🔎 <b>Слова-підказки:</b> yesterday (вчора), last week (минулого тижня), last year (минулого року), two days ago (два дні тому), in 2020.</div>` },
      { e: "🎉", h: "+ ed — і все!",
        html: `<p>До правильного дієслова додаємо <b>-ed</b>. Форма однакова <b>для всіх</b> — навіть для he / she / it!</p>
        <table class="t"><tr><td>I / you / we / they</td><td>play<b>ed</b></td></tr><tr><td>he / she / it</td><td>play<b>ed</b></td></tr></table>
        ${say("She watched TV last night.", "Вона дивилась телевізор учора ввечері.", "She <b>watched</b> TV last night.")}
        <div class="tip">💡 Гарна новина: хвостика -s для he / she / it у минулому немає.</div>` },
      { e: "✏️", h: "Як писати -ed",
        html: `<table class="t"><tr><td>Майже всі</td><td>+ ed</td><td>work → work<b>ed</b></td></tr>
        <tr><td>німа -e</td><td>+ d</td><td>live → live<b>d</b></td></tr>
        <tr><td>приголосна + y</td><td>y → ied</td><td>study → stud<b>ied</b></td></tr>
        <tr><td>голосна + y</td><td>+ ed</td><td>play → play<b>ed</b></td></tr>
        <tr><td>коротке: голосна + приголосна</td><td>подвоюємо</td><td>stop → sto<b>pped</b><br>plan → pla<b>nned</b></td></tr></table>
        <div class="tip">💡 Ті самі правила, що й для -ing та -s: studies, stopping, playing.</div>` },
      { e: "🕰️", h: "was / were — минуле від am / is / are",
        html: `<table class="t"><tr><td>I / he / she / it</td><td><b>was</b></td><td>wasn't</td></tr>
        <tr><td>you / we / they</td><td><b>were</b></td><td>weren't</td></tr></table>
        ${say("I was at home yesterday.", "Учора я був удома.", "I <b>was</b> at home yesterday.")}
        ${say("They were in the park.", "Вони були в парку.", "They <b>were</b> in the park.")}
        ${say("Were you at the party? Yes, I was.", "Ти був на вечірці? — Так.", "<b>Were</b> you at the party? — Yes, I <b>was</b>.")}` }
    ],
    examples: { title: "Минулої суботи",
      question: { q: "чому «stop<b>ped</b>», але «help<b>ed</b>» без подвоєння?", a: "stop — коротке слово з голосна + приголосна в кінці, тому p подвоюємо. help закінчується на дві приголосні (lp) — не подвоюємо." },
      items: [
        ["Last Saturday <b>was</b> a great day.", "Минула субота була чудовим днем."],
        ["In the morning I <b>helped</b> my mum in the garden.", "Зранку я допомагала мамі в саду."],
        ["Then we <b>visited</b> my grandparents.", "Потім ми відвідали бабусю й дідуся."],
        ["Grandma <b>cooked</b> a big dinner.", "Бабуся приготувала великий обід."],
        ["My brother <b>played</b> with the dog, and I <b>studied</b> for my test.", "Брат грався з собакою, а я вчилася до контрольної."],
        ["Our car <b>stopped</b> on the way home!", "Дорогою додому наша машина зупинилась!"],
        ["We <b>were</b> tired but happy.", "Ми були втомлені, але щасливі."]
      ] },
    words: [
      ["yesterday", "вчора"], ["last night", "учора ввечері"], ["last week", "минулого тижня"], ["last summer", "минулого літа"],
      ["ago", "тому (назад)"], ["then", "потім"], ["visit", "відвідувати"], ["help", "допомагати"], ["clean", "прибирати"], ["stay", "залишатися"]
    ]
  });

  w("skills/past.json", { topic: "past", title: "Past Simple: правильні дієслова, was / were", skills: [
    { id: "past.ed", title: "Past Simple: + ed",
      rule: "Минуле правильного дієслова: + ed, однаково для всіх (I played, she played).",
      worked: { p: "She ___ TV yesterday evening. (watch)", steps: [
        "Шукаю підказку: <b>yesterday</b> — це минуле.",
        "watch — правильне дієслово → + <b>ed</b>.",
        "Для she — та сама форма, без -s.",
        "Відповідь: She <b>watched</b> TV yesterday evening."] },
      alt: `<p>Уяви, що <b>-ed</b> — це «машина часу»: чіпляєш до дієслова, і воно летить у минуле.</p>
        <p>work → work<b>ed</b>, visit → visit<b>ed</b>. Для всіх однаково: I worked, she worked, they worked.</p>`,
      items: [
        ch("Yesterday I ___ football.", ["played", "play"], "played", ["Yesterday — коли?", "Минуле → + ed."], "yesterday → <b>played</b>.", { "play": "Yesterday — це минуле: <b>played</b>." }),
        ch("Last week we ___ our grandma.", ["visited", "visit", "visits"], "visited", ["Last week — минулого тижня.", "Минуле → + ed."], "last week → <b>visited</b>.", { "visit": "Last week — минуле: <b>visited</b>.", "visits": "Last week — минуле: <b>visited</b>." }),
        inp(PS, "She ___ TV yesterday evening. (watch)", ["watched"], ["yesterday — минуле.", "+ ed."], "yesterday → <b>watched</b>.", { "watch": "yesterday — минуле: <b>watched</b>.", "watches": "Це минуле, не теперішнє: <b>watched</b>." }),
        inp(PS, "My dad ___ in a bank ten years ago. (work)", ["worked"], ["ago — тому, минуле.", "+ ed."], "ten years ago → <b>worked</b>.", { "works": "ago — це минуле: <b>worked</b>.", "work": "ago — це минуле: <b>worked</b>." }),
        inp(PS, "They ___ the window five minutes ago. (open)", ["opened"], ["ago — минуле.", "+ ed."], "ago → <b>opened</b>.", { "open": "ago — минуле: <b>opened</b>." }),
        inp(PS, "I ___ my room last Saturday. (clean)", ["cleaned"], ["last Saturday — минуле.", "+ ed."], "last Saturday → <b>cleaned</b>.", { "clean": "last Saturday — минуле: <b>cleaned</b>." }),
        inp(PS, "We ___ to music last night. (listen)", ["listened"], ["last night — минуле.", "+ ed."], "last night → <b>listened</b>.", { "listen": "last night — минуле: <b>listened</b>." }),
        fix("Yesterday I help my mum in the kitchen.", 2, "Yesterday I helped my mum in the kitchen.", ["Yesterday — минуле.", "Дієслову потрібне -ed."], "yesterday → <b>helped</b>."),
        fix("Last summer we visit Lviv.", 3, "Last summer we visited Lviv.", ["Last summer — минуле.", "Дієслову потрібне -ed."], "last summer → <b>visited</b>."),
        dict("We played chess yesterday.", [DH, "yesterday → + ed."], "yesterday → <b>played</b>.", { "We play chess yesterday.": "yesterday — минуле: <b>played</b>." }),
        ord("«Я дивилася фільм учора».", ["a", "watched", "I", "film", "yesterday"], ["i watched a film yesterday", "yesterday i watched a film"], ["Хто → що робив → що → коли.", "I → watched → a film → …"], "<b>I watched a film yesterday.</b>")
      ] },

    { id: "past.spell", title: "Як писати -ed: lived, studied, stopped",
      rule: "Німа -e → + d; приголосна + y → ied; голосна + y → + ed; коротке слово з голосна+приголосна → подвоюємо.",
      worked: { p: "The bus ___ near our house. (stop)", steps: [
        "Дієслово: <b>stop</b> — коротке, одна голосна o.",
        "В кінці голосна + приголосна: o + p.",
        "Подвоюємо p і додаємо -ed.",
        "Відповідь: The bus <b>stopped</b> near our house."] },
      alt: `<p>Ті самі три перевірки, що й для -ing:</p>
        <p>1) Німа <b>-e</b>? Додаємо тільки d: live → live<b>d</b>.<br>2) <b>-y</b> після приголосної? → ied: study → stud<b>ied</b>. Після голосної — просто ed: play<b>ed</b>.<br>3) Коротке слово, голосна + приголосна? Подвоюємо: stop → sto<b>pp</b>ed.</p>`,
      items: [
        inp(PS, "We ___ in Odesa last year. (live)", ["lived"], ["live закінчується на німу -e.", "Додаємо тільки d."], "live → <b>lived</b>.", { "liveed": "Німа -e: додаємо тільки d — <b>lived</b>." }, S),
        inp(PS, "She ___ English yesterday. (study)", ["studied"], ["study: перед y приголосна d.", "y → ied."], "study → <b>studied</b>.", { "studyed": "Перед y приголосна: stud<b>ied</b>.", "studed": "y → ied: <b>studied</b>." }, S),
        inp(PS, "He ___ computer games all evening. (play)", ["played"], ["play: перед y голосна a.", "Просто + ed."], "play → <b>played</b>.", { "plaied": "Перед y голосна (a), тому просто + ed: <b>played</b>.", "plaid": "Просто + ed: <b>played</b>." }, S),
        inp(PS, "The bus ___ near our house. (stop)", ["stopped"], ["stop — коротке слово.", "Голосна + приголосна → подвоюємо."], "stop → <b>stopped</b>.", { "stoped": "Подвоюємо p: <b>stopped</b>." }, S),
        inp(PS, "I ___ for my friend for an hour. (wait)", ["waited"], ["wait: дві голосні ai.", "Тут не подвоюємо."], "wait → <b>waited</b>.", { "waitted": "Перед t дві голосні (ai) — не подвоюємо: <b>waited</b>." }, S),
        inp(PS, "The baby ___ all night. (cry)", ["cried"], ["cry: перед y приголосна r.", "y → ied."], "cry → <b>cried</b>.", { "cryed": "Перед y приголосна: cr<b>ied</b>." }, S),
        inp(PS, "We ___ a trip to the mountains. (plan)", ["planned"], ["plan — коротке слово.", "Подвоюємо n."], "plan → <b>planned</b>.", { "planed": "Подвоюємо n: <b>planned</b>." }, S),
        inp(PS, "Tom ___ the heavy box. (carry)", ["carried"], ["carry: перед y приголосна r.", "y → ied."], "carry → <b>carried</b>.", { "carryed": "Перед y приголосна: carr<b>ied</b>." }, S),
        inp(PS, "She ___ at the funny picture. (smile)", ["smiled"], ["smile закінчується на німу -e.", "Додаємо тільки d."], "smile → <b>smiled</b>.", { "smileed": "Німа -e: додаємо тільки d — <b>smiled</b>." }, S),
        fix("Yesterday I studyed for two hours.", 2, "Yesterday I studied for two hours.", ["Подивись, як написане дієслово.", "Приголосна + y → ied."], "study → <b>studied</b>."),
        fix("The car stoped at the corner.", 2, "The car stopped at the corner.", ["Подивись, як написане дієслово.", "stop — подвоюємо p."], "stop → <b>stopped</b>."),
        dict("My sister cried last night.", [DH, "cry → ied."], "cry → <b>cried</b>.", { "My sister cryed last night.": "Перед y приголосна: <b>cried</b>." })
      ] },

    { id: "past.be", title: "was / were",
      rule: "I / he / she / it → was; you / we / they → were. Заперечення: wasn't / weren't.",
      worked: { p: "You ___ late yesterday!", steps: [
        "Хто? <b>You</b>.",
        "З you завжди <b>were</b> — навіть коли це одна людина.",
        "Відповідь: You <b>were</b> late yesterday!"] },
      alt: `<p>Підглянь у теперішній час: <b>am / is → was</b>, <b>are → were</b>.</p>
        <p>I am → I <b>was</b>; she is → she <b>was</b>; they are → they <b>were</b>; you are → you <b>were</b>.</p>`,
      items: [
        ch("I ___ at home yesterday.", ["was", "were"], "was", ["Хто? I.", "I → was."], "I → <b>was</b>.", { "were": "З I — <b>was</b>." }),
        ch("They ___ in the park last Sunday.", ["were", "was"], "were", ["They — «вони».", "they → were."], "they → <b>were</b>.", { "was": "they → <b>were</b>." }),
        ch("The weather ___ cold last week.", ["was", "were"], "was", ["The weather = it.", "it → was."], "the weather = it → <b>was</b>.", { "were": "The weather — це it: <b>was</b>." }),
        inp("Впиши was або were", "We ___ at school yesterday.", ["were"], ["We — «ми».", "we → were."], "we → <b>were</b>.", { "was": "we → <b>were</b>." }),
        inp("Впиши was або were", "My grandma ___ a teacher many years ago.", ["was"], ["My grandma = she.", "she → was."], "she → <b>was</b>.", { "were": "My grandma — це «вона»: <b>was</b>." }),
        inp("Впиши was або were", "You ___ late yesterday!", ["were"], ["You → ?", "you → were завжди."], "you → <b>were</b>.", { "was": "З you завжди <b>were</b>, навіть про одну людину." }),
        inp("Впиши wasn't або weren't", "The film ___ interesting, so we left.", ["wasn't", "was not"], ["The film = it.", "it → wasn't."], "the film = it → <b>wasn't</b>.", { "weren't": "The film — одне (it): <b>wasn't</b>." }),
        inp("Впиши Was або Were", "___ you at the party last night?", ["Were"], ["you → ?", "you → Were."], "you → <b>Were</b> you…?", { "Was": "you → <b>Were</b>.", "Did": "З was / were питання без did: <b>Were</b> you…?" }),
        fix("My friends was very happy.", 2, "My friends were very happy.", ["My friends = they.", "they → were."], "they → <b>were</b>."),
        fix("I were tired after school.", 1, "I was tired after school.", ["Хто? I.", "I → was."], "I → <b>was</b>."),
        dict("It was sunny yesterday.", [DH, "it → was."], "it → <b>was</b>.", { "It were sunny yesterday.": "it → <b>was</b>.", "It is sunny yesterday.": "yesterday — минуле: <b>was</b>." })
      ] }
  ] });

  /* ===================== УРОК 8 ===================== */
  const verbTable = (rows) => '<table class="t">' + rows.map(r => `<tr><td>${r[0]}</td><td><b>${r[1]}</b></td><td class="muted">${r[2]}</td><td style="padding:4px 0;width:44px"><button class="say round" data-say="${r[0]}, ${r[1]}">🔊</button></td></tr>`).join("") + "</table>";
  w("lessons/l8.json", {
    id: "l8", title: "30 головних неправильних дієслів",
    skillFiles: ["skills/irr.json"],
    skills: ["irr.1", "irr.2", "irr.3"],
    practice: { perSkill: 4 },
    test: { plan: { "irr.1": 3, "irr.2": 3, "irr.3": 2 }, pass: 80 },
    explain: [
      { e: "🧩", h: "Дієслова зі своїм характером",
        html: `<p>Деякі дієслова в минулому <b>не беруть -ed</b>, а мають свою форму. Їх треба просто запам'ятати — але їх не так багато, а найчастіших — 30.</p>
        ${say("Yesterday I went to the cinema.", "Учора я ходила в кіно.", "Yesterday I <b>went</b> to the cinema.")}
        <div class="tip">⚠️ <s>goed, eated, buyed</s> — так не кажуть. Але форма теж однакова для всіх: I went, she went.</div>` },
      { e: "1️⃣", h: "Група 1: найчастіші",
        html: verbTable([["go", "went", "йти"], ["have", "had", "мати"], ["do", "did", "робити"], ["see", "saw", "бачити"], ["come", "came", "приходити"], ["get", "got", "отримувати"], ["make", "made", "робити, готувати"], ["take", "took", "брати"], ["give", "gave", "давати"], ["eat", "ate", "їсти"]]) },
      { e: "2️⃣", h: "Група 2: -ought / -aught та інші",
        html: verbTable([["buy", "bought", "купувати"], ["bring", "brought", "приносити"], ["think", "thought", "думати"], ["catch", "caught", "ловити"], ["teach", "taught", "навчати"], ["find", "found", "знаходити"], ["say", "said", "сказати"], ["tell", "told", "розповідати"], ["read", "read", "читати"], ["write", "wrote", "писати"]]) +
          `<div class="tip">💡 bought, brought, thought, caught, taught — усі звучать на [о:т]. read у минулому пишеться так само, але вимовляється [ред].</div>` },
      { e: "3️⃣", h: "Група 3: i → a та інші",
        html: verbTable([["swim", "swam", "плавати"], ["sing", "sang", "співати"], ["drink", "drank", "пити"], ["begin", "began", "починати"], ["run", "ran", "бігати"], ["sit", "sat", "сидіти"], ["meet", "met", "зустрічати"], ["leave", "left", "залишати, їхати"], ["sleep", "slept", "спати"], ["feel", "felt", "відчувати"]]) +
          `<div class="tip">💡 swim, sing, drink, begin, run: <b>i/u → a</b> (swam, sang, drank, began, ran). sleep, feel, meet, leave: стають коротшими (slept, felt, met, left).</div>` }
    ],
    examples: { title: "Мій день народження",
      question: { q: "чому «I <b>read</b> a book yesterday» — а де ж минуле?", a: "read — неправильне дієслово, у минулому пишеться так само, тільки звучить [ред]." },
      items: [
        ["On my birthday I <b>got</b> up early.", "У свій день народження я рано встала."],
        ["Mum <b>made</b> a big chocolate cake.", "Мама спекла великий шоколадний торт."],
        ["My friends <b>came</b> at three o'clock.", "Друзі прийшли о третій."],
        ["They <b>brought</b> presents, and Dad <b>bought</b> balloons.", "Вони принесли подарунки, а тато купив кульки."],
        ["We <b>ate</b> pizza and <b>drank</b> lemonade.", "Ми їли піцу й пили лимонад."],
        ["Then we <b>sang</b> songs and <b>took</b> a lot of photos.", "Потім ми співали пісні й багато фотографувались."],
        ["In the evening I <b>felt</b> tired but very happy.", "Увечері я почувалася втомленою, але дуже щасливою."]
      ] },
    words: [
      ["birthday", "день народження"], ["present", "подарунок"], ["party", "свято, вечірка"], ["guest", "гість"], ["balloon", "повітряна кулька"],
      ["candle", "свічка"], ["invite", "запрошувати"], ["celebrate", "святкувати"], ["wish", "бажання; бажати"], ["surprise", "сюрприз"]
    ]
  });

  const IR = "Впиши дієслово в Past Simple (неправильне!)";
  w("skills/irr.json", { topic: "irr", title: "Неправильні дієслова", skills: [
    { id: "irr.1", title: "go-went, have-had, see-saw…",
      rule: "go → went, have → had, do → did, see → saw, come → came, get → got, make → made, take → took, give → gave, eat → ate.",
      worked: { p: "Yesterday I ___ to the cinema. (go)", steps: [
        "Підказка <b>yesterday</b> → минуле.",
        "go — неправильне дієслово, -ed не додаємо.",
        "Згадую пару: go → <b>went</b>.",
        "Відповідь: Yesterday I <b>went</b> to the cinema."] },
      alt: `<p>Проговори пари вголос, як вірш, кілька разів:</p>
        <p><b>go — went, have — had, do — did,<br>see — saw, come — came, get — got,<br>make — made, take — took, give — gave, eat — ate.</b></p>
        <p class="muted">Підказка: came, made, gave — «-ame/-ade/-ave», схожі між собою.</p>`,
      items: [
        inp(IR, "Yesterday I ___ to the cinema. (go)", ["went"], ["go — неправильне.", "go → w…"], "go → <b>went</b>.", { "goed": "go — неправильне: <b>went</b>.", "go": "yesterday — минуле: <b>went</b>.", "gone": "gone — третя форма; у Past Simple: <b>went</b>." }, S),
        inp(IR, "We ___ pizza for dinner last night. (have)", ["had"], ["have — неправильне.", "have → h…"], "have → <b>had</b>.", { "haved": "have — неправильне: <b>had</b>.", "has": "last night — минуле: <b>had</b>." }, S),
        inp(IR, "She ___ her homework yesterday evening. (do)", ["did"], ["do — неправильне.", "do → d…"], "do → <b>did</b>.", { "doed": "do — неправильне: <b>did</b>.", "does": "yesterday — минуле: <b>did</b>.", "done": "done — третя форма; у Past Simple: <b>did</b>." }, S),
        inp(IR, "I ___ a big dog in the park yesterday. (see)", ["saw"], ["see — неправильне.", "see → s…"], "see → <b>saw</b>.", { "seed": "see — неправильне: <b>saw</b>.", "seen": "seen — третя форма; у Past Simple: <b>saw</b>." }, S),
        inp(IR, "Tom ___ home late last night. (come)", ["came"], ["come — неправильне.", "come → c…"], "come → <b>came</b>.", { "comed": "come — неправильне: <b>came</b>." }, S),
        inp(IR, "My mum ___ a cake yesterday. (make)", ["made"], ["make — неправильне.", "make → m…"], "make → <b>made</b>.", { "maked": "make — неправильне: <b>made</b>." }, S),
        inp(IR, "He ___ a lot of photos last summer. (take)", ["took"], ["take — неправильне.", "take → t…"], "take → <b>took</b>.", { "taked": "take — неправильне: <b>took</b>.", "taken": "taken — третя форма; у Past Simple: <b>took</b>." }, S),
        inp(IR, "Grandpa ___ me a present yesterday. (give)", ["gave"], ["give — неправильне.", "give → g…"], "give → <b>gave</b>.", { "gived": "give — неправильне: <b>gave</b>.", "given": "given — третя форма; у Past Simple: <b>gave</b>." }, S),
        ch("Last week I ___ a new phone.", ["got", "getted", "get"], "got", ["get — неправильне.", "get → g…"], "get → <b>got</b>.", { "getted": "get — неправильне: <b>got</b>.", "get": "Last week — минуле: <b>got</b>." }),
        ch("We ___ ice cream after school yesterday.", ["ate", "eated", "eat"], "ate", ["eat — неправильне.", "eat → a…"], "eat → <b>ate</b>.", { "eated": "eat — неправильне: <b>ate</b>.", "eat": "yesterday — минуле: <b>ate</b>." }),
        fix("Yesterday we goed to the zoo.", 2, "Yesterday we went to the zoo.", ["Одне дієслово — неправильне.", "go → went."], "go → <b>went</b>."),
        dict("I saw my friend yesterday.", [DH, "see → saw."], "see → <b>saw</b>.", { "I seed my friend yesterday.": "see — неправильне: <b>saw</b>.", "I see my friend yesterday.": "yesterday — минуле: <b>saw</b>." })
      ] },

    { id: "irr.2", title: "buy-bought, think-thought, write-wrote…",
      rule: "buy → bought, bring → brought, think → thought, catch → caught, teach → taught, find → found, say → said, tell → told, read → read, write → wrote.",
      worked: { p: "Mum ___ some bread yesterday. (buy)", steps: [
        "Підказка <b>yesterday</b> → минуле.",
        "buy — неправильне.",
        "Згадую «сім'ю -ought»: buy → <b>bought</b>.",
        "Відповідь: Mum <b>bought</b> some bread yesterday."] },
      alt: `<p>П'ять дієслів звучать однаково на кінці [о:т] — запам'ятай їх разом:</p>
        <p><b>bought, brought, thought</b> (на -ought) і <b>caught, taught</b> (на -aught).</p>
        <p>Решта: find → found, say → said, tell → told, write → wrote, read → read [ред].</p>`,
      items: [
        inp(IR, "Mum ___ some bread yesterday. (buy)", ["bought"], ["buy — неправильне.", "Звучить [бо:т]."], "buy → <b>bought</b>.", { "buyed": "buy — неправильне: <b>bought</b>.", "brought": "brought — це від bring. buy → <b>bought</b>." }, S),
        inp(IR, "She ___ her dog to school last Friday. (bring)", ["brought"], ["bring — неправильне.", "Звучить [бро:т]."], "bring → <b>brought</b>.", { "bringed": "bring — неправильне: <b>brought</b>.", "brang": "bring → <b>brought</b>.", "bought": "bought — це від buy. bring → <b>brought</b>." }, S),
        inp(IR, "At first I ___ it was easy. (think)", ["thought"], ["think — неправильне.", "Звучить [со:т]."], "think → <b>thought</b>.", { "thinked": "think — неправильне: <b>thought</b>." }, S),
        inp(IR, "My cat ___ a mouse last night. (catch)", ["caught"], ["catch — неправильне.", "-aught."], "catch → <b>caught</b>.", { "catched": "catch — неправильне: <b>caught</b>." }, S),
        inp(IR, "Our teacher ___ us a new song yesterday. (teach)", ["taught"], ["teach — неправильне.", "-aught."], "teach → <b>taught</b>.", { "teached": "teach — неправильне: <b>taught</b>." }, S),
        inp(IR, "I ___ my keys under the sofa this morning. (find)", ["found"], ["find — неправильне.", "find → f…"], "find → <b>found</b>.", { "finded": "find — неправильне: <b>found</b>." }, S),
        inp(IR, "He ___ hello and smiled. (say)", ["said"], ["say — неправильне.", "Пишеться s-a-i-d."], "say → <b>said</b>.", { "sayed": "say — неправильне: <b>said</b>.", "says": "smiled — минуле, тож і тут минуле: <b>said</b>." }, S),
        inp(IR, "Dad ___ us a funny story last night. (tell)", ["told"], ["tell — неправильне.", "tell → t…"], "tell → <b>told</b>.", { "telled": "tell — неправильне: <b>told</b>." }, S),
        ch("Yesterday I ___ a very interesting book.", ["read", "readed", "reads"], "read", ["read — неправильне.", "Пишеться так само!"], "read → <b>read</b> (звучить [ред]).", { "readed": "read у минулому пишеться так само: <b>read</b> [ред].", "reads": "yesterday — минуле: <b>read</b>." }),
        ch("Last week she ___ a letter to her grandma.", ["wrote", "writed", "write"], "wrote", ["write — неправильне.", "write → wr…"], "write → <b>wrote</b>.", { "writed": "write — неправильне: <b>wrote</b>.", "write": "Last week — минуле: <b>wrote</b>." }),
        fix("My mum buyed a new dress yesterday.", 2, "My mum bought a new dress yesterday.", ["Одне дієслово — неправильне.", "buy → bought."], "buy → <b>bought</b>."),
        dict("He told me a secret.", [DH, "tell → told."], "tell → <b>told</b>.", { "He telled me a secret.": "tell — неправильне: <b>told</b>." })
      ] },

    { id: "irr.3", title: "swim-swam, run-ran, sleep-slept…",
      rule: "swim → swam, sing → sang, drink → drank, begin → began, run → ran, sit → sat, meet → met, leave → left, sleep → slept, feel → felt.",
      worked: { p: "We ___ in the sea last summer. (swim)", steps: [
        "Підказка <b>last summer</b> → минуле.",
        "swim — неправильне.",
        "Правило «i → a»: sw<b>i</b>m → sw<b>a</b>m.",
        "Відповідь: We <b>swam</b> in the sea last summer."] },
      alt: `<p>Дві «сім'ї»:</p>
        <p><b>i/u → a:</b> swim → swam, sing → sang, drink → drank, begin → began, run → ran, sit → sat.</p>
        <p><b>Коротшають:</b> sleep → slept, feel → felt, meet → met, leave → left.</p>`,
      items: [
        inp(IR, "We ___ in the sea last summer. (swim)", ["swam"], ["swim — неправильне.", "i → a."], "swim → <b>swam</b>.", { "swimmed": "swim — неправильне: <b>swam</b>.", "swum": "swum — третя форма; у Past Simple: <b>swam</b>." }, S),
        inp(IR, "The children ___ a song at the concert. (sing)", ["sang"], ["sing — неправильне.", "i → a."], "sing → <b>sang</b>.", { "singed": "sing — неправильне: <b>sang</b>.", "sung": "sung — третя форма; у Past Simple: <b>sang</b>." }, S),
        inp(IR, "I ___ a glass of milk last night. (drink)", ["drank"], ["drink — неправильне.", "i → a."], "drink → <b>drank</b>.", { "drinked": "drink — неправильне: <b>drank</b>.", "drunk": "drunk — третя форма; у Past Simple: <b>drank</b>." }, S),
        inp(IR, "The lesson ___ at nine o'clock yesterday. (begin)", ["began"], ["begin — неправильне.", "i → a."], "begin → <b>began</b>.", { "beginned": "begin — неправильне: <b>began</b>.", "begun": "begun — третя форма; у Past Simple: <b>began</b>." }, S),
        inp(IR, "Tom ___ very fast and won the race. (run)", ["ran"], ["run — неправильне.", "u → a."], "run → <b>ran</b>.", { "runned": "run — неправильне: <b>ran</b>." }, S),
        inp(IR, "We ___ under a big tree and talked. (sit)", ["sat"], ["sit — неправильне.", "i → a."], "sit → <b>sat</b>.", { "sitted": "sit — неправильне: <b>sat</b>." }, S),
        inp(IR, "I ___ my best friend in the park yesterday. (meet)", ["met"], ["meet — неправильне.", "Коротшає."], "meet → <b>met</b>.", { "meeted": "meet — неправильне: <b>met</b>." }, S),
        inp(IR, "Yesterday the train ___ at six o'clock. (leave)", ["left"], ["leave — неправильне.", "leave → l…"], "leave → <b>left</b>.", { "leaved": "leave — неправильне: <b>left</b>." }, S),
        ch("I ___ for ten hours last night.", ["slept", "sleeped", "sleep"], "slept", ["sleep — неправильне.", "Коротшає."], "sleep → <b>slept</b>.", { "sleeped": "sleep — неправильне: <b>slept</b>.", "sleep": "last night — минуле: <b>slept</b>." }),
        ch("After the long walk we ___ tired.", ["felt", "feeled", "feel"], "felt", ["feel — неправильне.", "Коротшає."], "feel → <b>felt</b>.", { "feeled": "feel — неправильне: <b>felt</b>.", "feel": "Тут розповідь про минуле: <b>felt</b>." }),
        fix("Yesterday I swimmed in the river.", 2, "Yesterday I swam in the river.", ["Одне дієслово — неправильне.", "swim → swam."], "swim → <b>swam</b>."),
        dict("We met our teacher in the shop.", [DH, "meet → met."], "meet → <b>met</b>.", { "We meeted our teacher in the shop.": "meet — неправильне: <b>met</b>." })
      ] }
  ] });

  /* ===================== УРОК 9 ===================== */
  w("lessons/l9.json", {
    id: "l9", title: "Past Simple: питання і заперечення",
    skillFiles: ["skills/pastnq.json"],
    skills: ["past.neg", "past.q", "past.short", "past.wh"],
    practice: { perSkill: 3 },
    test: { plan: { "past.neg": 2, "past.q": 2, "past.short": 2, "past.wh": 2 }, pass: 80 },
    explain: [
      { e: "🙅", h: "«Не» в минулому: didn't",
        html: `<p>Для всіх однаково: <b>didn't</b> + дієслово у <b>першій формі</b> (як у словнику).</p>
        ${say("I didn't watch TV yesterday.", "Я не дивилась телевізор учора.", "I <b>didn't watch</b> TV yesterday.")}
        ${say("She didn't go to school.", "Вона не пішла до школи.", "She <b>didn't go</b> to school.")}
        <div class="tip">⚠️ Минуле вже «сховалось» у did, тому дієслово — перша форма: <s>didn't went</s>, <s>didn't watched</s>.</div>` },
      { e: "❓", h: "Питання: Did…?",
        html: `<div class="rule-box"><b>Did</b> + хто + дієслово (перша форма)?</div>
        ${say("Did you see the film? Yes, I did.", "Ти бачила фільм? — Так.", "<b>Did</b> you <b>see</b> the film? — Yes, I <b>did</b>.")}
        ${say("Did Max win? No, he didn't.", "Макс переміг? — Ні.", "<b>Did</b> Max <b>win</b>? — No, he <b>didn't</b>.")}
        <p class="muted">Це як Do / Does у теперішньому, тільки в минулому — одне слово Did для всіх.</p>` },
      { e: "🗺️", h: "Where did you go?",
        html: `<div class="rule-box">Питальне слово → <b>did</b> → хто → дієслово?</div>
        ${say("Where did you go last summer?", "Куди ти їздила минулого літа?", "<b>Where did</b> you <b>go</b> last summer?")}
        ${say("What did you do yesterday?", "Що ти робила вчора?", "<b>What did</b> you <b>do</b> yesterday?")}` },
      { e: "🕰️", h: "А з was / were — без did",
        html: `<p>was / were самі вміють робити питання й заперечення:</p>
        ${say("Were you at home? Yes, I was.", "Ти була вдома? — Так.", "<b>Were</b> you at home? — Yes, I <b>was</b>.")}
        ${say("I wasn't tired.", "Я не була втомлена.", "I <b>wasn't</b> tired.")}
        <div class="tip">⚠️ <s>Did you were…?</s> — так не буває.</div>` }
    ],
    examples: { title: "Як минули вихідні?",
      question: { q: "чому «Did you <b>go</b>», а не «Did you went»?", a: "Минуле вже в did. Дієслово після did — завжди перша форма." },
      items: [
        ["<b>Did</b> you <b>have</b> a good weekend, Kate?", "Добре провела вихідні, Кейт?"],
        ["Yes, I <b>did</b>! We <b>went</b> to the zoo.", "Так! Ми ходили в зоопарк."],
        ["<b>Did</b> you <b>see</b> the lions?", "Ти бачила левів?"],
        ["No, I <b>didn't</b>. They <b>were</b> asleep.", "Ні. Вони спали."],
        ["<b>What did</b> you <b>do</b> on Sunday?", "А що ти робила в неділю?"],
        ["I <b>didn't do</b> anything special. I <b>read</b> a book.", "Нічого особливого. Читала книжку."],
        ["<b>Were</b> you bored? — No, I <b>wasn't</b>!", "Тобі було нудно? — Ні!"]
      ] },
    words: [
      ["weekend", "вихідні"], ["go out", "виходити (гуляти)"], ["have a good time", "добре провести час"], ["zoo", "зоопарк"],
      ["picnic", "пікнік"], ["win", "перемагати"], ["lose", "програвати, губити"], ["tired", "втомлений"], ["bored", "знуджений"], ["special", "особливий"]
    ]
  });

  const DP = "Впиши дієслово в Past Simple";
  w("skills/pastnq.json", { topic: "past", title: "Past Simple: питання і заперечення", skills: [
    { id: "past.neg", title: "Заперечення: didn't + перша форма",
      rule: "didn't + дієслово в першій формі (як у словнику) для всіх: I didn't go, she didn't watch.",
      worked: { p: "Tom ___ to the party last Saturday. (not go)", steps: [
        "Минуле (last Saturday) + «не» → <b>didn't</b>.",
        "Після didn't — перша форма: <b>go</b> (не went!).",
        "Відповідь: Tom <b>didn't go</b> to the party last Saturday."] },
      alt: `<p>Минуле може бути в реченні <b>лише один раз</b>. Якщо воно вже в didn't, дієслово лишається звичайним:</p>
        <p>She <b>went</b>. → She <b>didn't go</b>.<br>We <b>watched</b>. → We <b>didn't watch</b>.</p>`,
      items: [
        ch("Yesterday I ___ go to school.", ["didn't", "don't"], "didn't", ["Yesterday — минуле.", "Минуле «не» → didn't."], "yesterday → <b>didn't</b>.", { "don't": "Yesterday — минуле: <b>didn't</b>." }),
        ch("She ___ call me last night.", ["didn't", "doesn't"], "didn't", ["last night — минуле.", "didn't для всіх."], "last night → <b>didn't</b>.", { "doesn't": "last night — минуле: <b>didn't</b> для всіх." }),
        ch("He ___ his homework yesterday.", ["didn't do", "didn't did", "doesn't do"], "didn't do", ["Минуле → didn't.", "Після didn't — перша форма."], "<b>didn't do</b>: після didn't — перша форма.", { "didn't did": "Після didn't — перша форма: didn't <b>do</b>.", "doesn't do": "yesterday — минуле: <b>didn't</b> do." }),
        inp(DP, "We ___ TV yesterday. (not watch)", ["didn't watch", "did not watch"], ["Минуле → didn't.", "Дієслово — перша форма."], "<b>didn't watch</b>.", { "didn't watched": "Після didn't — перша форма: didn't <b>watch</b>.", "don't watch": "yesterday — минуле: <b>didn't</b> watch.", "not watched": "Потрібен помічник: <b>didn't watch</b>." }),
        inp(DP, "Tom ___ to the party last Saturday. (not go)", ["didn't go", "did not go"], ["Минуле → didn't.", "go — перша форма, не went."], "<b>didn't go</b>.", { "didn't went": "Після didn't — перша форма: didn't <b>go</b>.", "doesn't go": "last Saturday — минуле: <b>didn't</b> go." }),
        inp(DP, "My parents ___ a new car last year. (not buy)", ["didn't buy", "did not buy"], ["Минуле → didn't.", "buy — перша форма."], "<b>didn't buy</b>.", { "didn't bought": "Після didn't — перша форма: didn't <b>buy</b>.", "don't buy": "last year — минуле: <b>didn't</b> buy." }),
        inp(DP, "I ___ breakfast yesterday morning. (not have)", ["didn't have", "did not have"], ["Учора — минуле → didn't.", "have — перша форма."], "<b>didn't have</b>.", { "didn't had": "Після didn't — перша форма: didn't <b>have</b>.", "don't have": "this morning (уже минув) — <b>didn't</b> have." }),
        fix("She didn't went to school yesterday.", 2, "She didn't go to school yesterday.", ["Подивись на дієслово після didn't.", "Після didn't — перша форма."], "didn't + <b>go</b>."),
        fix("We didn't played football last week.", 2, "We didn't play football last week.", ["Подивись на дієслово після didn't.", "Після didn't — перша форма."], "didn't + <b>play</b>."),
        dict("I didn't see him yesterday.", [DH, "Після didn't — перша форма."], "didn't + <b>see</b>.", { "I didn't saw him yesterday.": "Після didn't — перша форма: <b>see</b>.", "I don't see him yesterday.": "yesterday — минуле: <b>didn't</b>." }),
        ord("«Вони не прийшли вчора».", ["come", "They", "yesterday", "didn't"], ["they didn't come yesterday", "yesterday they didn't come"], ["Хто → didn't → дієслово → коли.", "They → didn't → come → …"], "<b>They didn't come yesterday.</b>")
      ] },

    { id: "past.q", title: "Питання: Did…?",
      rule: "Did + хто + дієслово в першій формі?",
      worked: { p: "Did Tom ___ you yesterday? (call)", steps: [
        "Питання вже починається з <b>Did</b> — минуле там.",
        "Тому дієслово — перша форма: <b>call</b>.",
        "Відповідь: Did Tom <b>call</b> you yesterday?"] },
      alt: `<p>Did — це «Do / Does у минулому». Одне слово для всіх:</p>
        <p>Do you like…? → <b>Did</b> you like…?<br>Does she play…? → <b>Did</b> she play…?</p>
        <p class="muted">А дієслово, як і з do / does, без змін.</p>`,
      items: [
        ch("___ you see the film yesterday?", ["Did", "Do", "Were"], "Did", ["yesterday — минуле.", "Питання в минулому → Did."], "yesterday → <b>Did</b> you see…?", { "Do": "yesterday — минуле: <b>Did</b>.", "Were": "see — дієслово дії, тож питаємо з <b>Did</b>." }),
        ch("Did she ___ the test?", ["pass", "passed"], "pass", ["Є Did.", "Після Did — перша форма."], "Did + <b>pass</b>.", { "passed": "Після Did — перша форма: <b>pass</b>." }),
        inp("Впиши Did або Do", "___ you go to the sea last summer?", ["Did"], ["last summer — минуле.", "Did."], "last summer → <b>Did</b>.", { "Do": "last summer — минуле: <b>Did</b>." }),
        inp("Впиши Did або Does", "___ your mum cook dinner yesterday?", ["Did"], ["yesterday — минуле.", "Did для всіх."], "yesterday → <b>Did</b>.", { "Does": "yesterday — минуле: <b>Did</b>." }),
        inp("Впиши дієслово", "Did Tom ___ you yesterday? (call)", ["call"], ["Є Did.", "Після Did — перша форма."], "Did + <b>call</b>.", { "called": "Після Did — перша форма: <b>call</b>." }),
        inp("Впиши дієслово", "Did they ___ the bus? (catch)", ["catch"], ["Є Did.", "Перша форма, не caught."], "Did + <b>catch</b>.", { "caught": "Після Did — перша форма: <b>catch</b>." }),
        fix("Did you went to the park?", 2, "Did you go to the park?", ["Подивись на дієслово після Did.", "Перша форма."], "Did + <b>go</b>."),
        fix("Do you see Anna yesterday?", 0, "Did you see Anna yesterday?", ["yesterday — минуле.", "Did."], "yesterday → <b>Did</b> you see…?"),
        ord("«Ти бачила мою сумку?»", ["see", "Did", "my", "you", "bag"], ["did you see my bag"], ["Did → хто → дієслово → що?", "Did → you → see → …"], "<b>Did you see my bag?</b>", "?"),
        dict("Did you have a good time?", [DH, "Після Did — have."], "Did + <b>have</b>.", { "Did you had a good time?": "Після Did — перша форма: <b>have</b>." })
      ] },

    { id: "past.short", title: "Yes, I did / No, she didn't",
      rule: "Did…? → Yes, I did. / No, I didn't. Was / Were…? → Yes, I was. / No, it wasn't.",
      worked: { p: "Did Anna call you? — No, she ___.", steps: [
        "Питали з <b>Did</b>.",
        "Відповідаємо тим самим помічником.",
        "«Ні» → <b>didn't</b>.",
        "Відповідь: No, she <b>didn't</b>."] },
      alt: `<p>Коротка відповідь — луна першого слова питання:</p>
        <p><b>Did</b> you…? → Yes, I <b>did</b>. / No, I <b>didn't</b>.<br><b>Were</b> you…? → Yes, I <b>was</b>. / No, I <b>wasn't</b>.<br><b>Was</b> it…? → Yes, it <b>was</b>. / No, it <b>wasn't</b>.</p>`,
      items: [
        ch("Did you like the film? — Yes, I ___.", ["did", "liked", "do"], "did", ["Питали з Did.", "Відповідь тим самим словом."], "Did…? → Yes, I <b>did</b>.", { "liked": "Коротка відповідь — з помічником: Yes, I <b>did</b>.", "do": "Питання в минулому: Yes, I <b>did</b>." }),
        ch("Did Max win? — No, he ___.", ["didn't", "doesn't", "wasn't"], "didn't", ["Питали з Did.", "«Ні» → didn't."], "No, he <b>didn't</b>.", { "doesn't": "Питали з Did: No, he <b>didn't</b>.", "wasn't": "Питали з Did: No, he <b>didn't</b>." }),
        inp("Впиши коротку відповідь", "Did your parents go out? — Yes, they ___.", ["did"], ["Питали з Did.", "did."], "Yes, they <b>did</b>.", { "went": "Коротка відповідь — з помічником: Yes, they <b>did</b>.", "do": "Питання в минулому: <b>did</b>." }),
        inp("Впиши коротку відповідь", "Did Anna call you? — No, she ___.", ["didn't", "did not"], ["Питали з Did, «ні».", "didn't."], "No, she <b>didn't</b>.", { "doesn't": "Питали з Did: <b>didn't</b>.", "wasn't": "Питали з Did: <b>didn't</b>." }),
        inp("Впиши коротку відповідь", "Were you at home? — Yes, I ___.", ["was"], ["Питали з Were.", "I → was."], "Yes, I <b>was</b>.", { "did": "Питали з Were: Yes, I <b>was</b>.", "were": "З I — <b>was</b>." }),
        inp("Впиши коротку відповідь", "Was the test easy? — No, it ___.", ["wasn't", "was not"], ["Питали з Was.", "it → wasn't."], "No, it <b>wasn't</b>.", { "didn't": "Питали з Was: No, it <b>wasn't</b>.", "weren't": "it → <b>wasn't</b>." }),
        ch("Did they enjoy the trip? Яка відповідь правильна?", ["Yes, they did.", "Yes, they enjoyed.", "Yes, they do."], "Yes, they did.", ["Питали з Did.", "Відповідаємо did."], "Did…? → Yes, they <b>did</b>.", { "Yes, they enjoyed.": "Коротка відповідь — з помічником: Yes, they <b>did</b>.", "Yes, they do.": "Питання в минулому: Yes, they <b>did</b>." }),
        fix("Did she help you? — Yes, she does.", 7, "Did she help you? — Yes, she did.", ["Питали з Did.", "Відповідь — тим самим словом."], "Did…? → Yes, she <b>did</b>.")
      ] },

    { id: "past.wh", title: "Where did you go? What did you do?",
      rule: "Питальне слово → did → хто → дієслово в першій формі?",
      worked: { p: "What did you ___ for breakfast? (eat)", steps: [
        "Питання з <b>did</b> — минуле вже там.",
        "Дієслово — перша форма: <b>eat</b> (не ate).",
        "Відповідь: What did you <b>eat</b> for breakfast?"] },
      alt: `<p>Візьми питання з Did і постав спереду питальне слово:</p>
        <p>Did you go? → <b>Where</b> did you go?<br>Did you do? → <b>What</b> did you do?<br>Did he cry? → <b>Why</b> did he cry?</p>`,
      items: [
        ch("Where ___ you go last summer?", ["did", "do", "were"], "did", ["last summer — минуле.", "did."], "last summer → Where <b>did</b>…?", { "do": "last summer — минуле: <b>did</b>.", "were": "go — дієслово дії, тож <b>did</b>." }),
        ch("What ___ she buy yesterday?", ["did", "does"], "did", ["yesterday — минуле.", "did."], "yesterday → What <b>did</b>…?", { "does": "yesterday — минуле: <b>did</b>." }),
        inp("Впиши допоміжне слово", "What ___ you do last weekend?", ["did"], ["last weekend — минуле.", "did."], "last weekend → <b>did</b>.", { "do": "last weekend — минуле: <b>did</b>." }),
        inp("Впиши допоміжне слово", "Why ___ Tom cry yesterday?", ["did"], ["yesterday — минуле.", "did."], "yesterday → Why <b>did</b>…?", { "does": "yesterday — минуле: <b>did</b>.", "was": "cry — дієслово дії, тож <b>did</b>." }),
        inp("Впиши дієслово", "What did you ___ for breakfast? (eat)", ["eat"], ["Є did.", "Перша форма, не ate."], "did + <b>eat</b>.", { "ate": "Після did — перша форма: <b>eat</b>." }),
        ord("«Куди ти ходила вчора?»", ["go", "Where", "yesterday", "you", "did"], ["where did you go yesterday"], ["Питальне слово → did → хто → дієслово → коли?", "Where → did → you → go → …"], "<b>Where did you go yesterday?</b>", "?"),
        ord("«Що ви робили в суботу?»", ["do", "What", "on", "you", "did", "Saturday"], ["what did you do on saturday"], ["Питальне слово → did → хто → дієслово.", "What → did → you → do → …"], "<b>What did you do on Saturday?</b>", "?"),
        fix("Where did you bought this T-shirt?", 3, "Where did you buy this T-shirt?", ["Подивись на дієслово після did.", "Перша форма."], "did + <b>buy</b>."),
        dict("What did you do yesterday?", [DH, "Після did — перша форма."], "What did you <b>do</b>?", { "What did you did yesterday?": "Після did — перша форма: <b>do</b>.", "What you did yesterday?": "Не забувай did: What <b>did</b> you do?" })
      ] }
  ] });
};
