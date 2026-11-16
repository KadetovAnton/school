// Артиклі (l14), займенники (l15), майбутнє (l16), ступені порівняння (l10)
const { say, inp, ch, fix, dict, ord, DH, S } = require("./lib.js");
module.exports = function (w) {
  const NONE = "— (нічого)";

  /* ===================== АРТИКЛІ ===================== */
  w("lessons/l14.json", {
    id: "l14", title: "Артиклі a / an / the",
    skillFiles: ["skills/art.json"],
    skills: ["art.aan", "art.the", "art.zero"],
    practice: { perSkill: 4 },
    test: { plan: { "art.aan": 3, "art.the": 3, "art.zero": 2 }, pass: 80 },
    explain: [
      { e: "🅰️", h: "a чи an — вирішує звук",
        html: `<p><b>a / an</b> — «один, якийсь». Ставимо перед однією річчю, яку можна порахувати.</p>
        <table class="t"><tr><td><b>a</b></td><td>перед приголосним <u>звуком</u></td><td>a book, a dog, a <b>u</b>niversity [ю]</td></tr>
        <tr><td><b>an</b></td><td>перед голосним <u>звуком</u></td><td>an apple, an egg, an <b>h</b>our [ауе]</td></tr></table>
        ${say("I have an apple and a banana.", "У мене є яблуко і банан.", "I have <b>an</b> apple and <b>a</b> banana.")}
        <div class="tip">💡 Важить звук, а не буква: <b>an</b> hour (h не читається), але <b>a</b> university (звучить «ю»).</div>` },
      { e: "👉", h: "the — «той самий»",
        html: `<p><b>the</b> — коли зрозуміло, про що саме мова:</p>
        <p>1) уже згадували: I have <b>a</b> dog. <b>The</b> dog is funny.<br>2) воно одне таке: <b>the</b> sun, <b>the</b> moon, <b>the</b> sky<br>3) найкращий / перший: <b>the</b> best, <b>the</b> first floor<br>4) зрозуміло з ситуації: Close <b>the</b> door, please.</p>
        ${say("I bought a cake. The cake was delicious.", "Я купила торт. Торт був смачний.", "I bought <b>a</b> cake. <b>The</b> cake was delicious.")}` },
      { e: "🚫", h: "Коли артикль не потрібен",
        html: `<table class="t"><tr><td>загалом, у множині</td><td>Cats like milk.</td></tr>
        <tr><td>їжа за розкладом</td><td>have breakfast / lunch / dinner</td></tr>
        <tr><td>спорт, ігри</td><td>play football, play chess</td></tr>
        <tr><td>мови, країни, імена</td><td>speak English, live in Ukraine, Anna</td></tr>
        <tr><td>звичні місця</td><td>go to school, go to bed, at home</td></tr></table>
        <div class="tip">⚠️ <s>play the football</s>, <s>go to the bed</s>, <s>have a breakfast</s>.</div>` }
    ],
    examples: { title: "Сова на дачі",
      question: { q: "чому «<b>an</b> owl», а потім «<b>the</b> owl»?", a: "Спершу сова «якась», згадуємо вперше — an (owl на голосний звук). Далі це та сама сова — the." },
      items: [
        ["Last summer we stayed in <b>a</b> small house in the country.", "Минулого літа ми жили в маленькому будиночку за містом."],
        ["One night I saw <b>an</b> owl in <b>a</b> tree.", "Одної ночі я побачила сову на дереві."],
        ["<b>The</b> owl looked at me with big yellow eyes.", "Сова дивилась на мене великими жовтими очима."],
        ["<b>The</b> moon was very bright.", "Місяць був дуже яскравий."],
        ["In the morning we had breakfast in the garden.", "Зранку ми снідали в саду."],
        ["Then my brother and I played football.", "Потім ми з братом грали у футбол."]
      ] },
    words: [
      ["owl", "сова"], ["island", "острів"], ["orange", "апельсин"], ["ice cream", "морозиво"], ["hour", "година"],
      ["idea", "ідея"], ["uniform", "форма (одяг)"], ["university", "університет"], ["sky", "небо"], ["moon", "місяць"]
    ]
  });

  w("skills/art.json", { topic: "art", title: "Артиклі", skills: [
    { id: "art.aan", title: "a чи an",
      rule: "a — перед приголосним звуком (a book, a university), an — перед голосним (an apple, an hour).",
      worked: { p: "We waited for ___ hour.", steps: [
        "Слово: <b>hour</b>. Як воно звучить?",
        "h не читається: [ауе] — починається з голосного звука.",
        "Голосний звук → <b>an</b>.",
        "Відповідь: We waited for <b>an</b> hour."] },
      alt: `<p>Скажи вголос «a apple» — між двома голосними язик спотикається. Тому додаємо n: <b>an</b> apple.</p>
        <p>Слухай початок слова: a <b>d</b>og, a <b>c</b>at, але <b>an</b> <b>e</b>gg, <b>an</b> <b>o</b>ld house.</p>`,
      items: [
        ch("I have ___ apple.", ["a", "an"], "an", ["apple починається з голосного звука.", "Голосний звук → an."], "<b>an</b> apple.", { "a": "apple починається з голосного звука: <b>an</b> apple." }),
        ch("She is ___ teacher.", ["a", "an"], "a", ["teacher починається з [т].", "Приголосний звук → a."], "<b>a</b> teacher.", { "an": "teacher починається з приголосного: <b>a</b> teacher." }),
        ch("It's ___ old house.", ["an", "a"], "an", ["Дивись на слово після артикля: old.", "old — голосний звук → an."], "<b>an</b> old house: важить наступне слово.", { "a": "Наступне слово old починається з голосного: <b>an</b> old house." }),
        ch("We waited for ___ hour.", ["an", "a"], "an", ["Як звучить hour?", "h не читається."], "<b>an</b> hour: h не читається.", { "a": "h у hour не читається [ауе], тому <b>an</b>." }),
        ch("He is ___ university student.", ["a", "an"], "a", ["Як звучить university?", "[ю] — це як приголосний звук."], "<b>a</b> university: звучить [ю].", { "an": "university звучить «ю…», як приголосний: <b>a</b> university." }),
        inp("Впиши a або an", "There is ___ elephant in the zoo.", ["an"], ["elephant — перший звук?", "Голосний → an."], "<b>an</b> elephant.", { "a": "elephant починається з голосного: <b>an</b>." }),
        inp("Впиши a або an", "My mum has ___ new car.", ["a"], ["Дивись на слово після артикля: new.", "Приголосний → a."], "<b>a</b> new car.", { "an": "new починається з приголосного: <b>a</b>." }),
        inp("Впиши a або an", "I'd like ___ ice cream, please.", ["an"], ["ice — перший звук?", "Голосний → an."], "<b>an</b> ice cream.", { "a": "ice починається з голосного: <b>an</b>." }),
        inp("Впиши a або an", "This is ___ easy exercise.", ["an"], ["Дивись на easy.", "Голосний → an."], "<b>an</b> easy exercise.", { "a": "easy починається з голосного: <b>an</b>." }),
        fix("I saw a owl in the forest.", 2, "I saw an owl in the forest.", ["owl починається з голосного звука.", "a → an."], "<b>an</b> owl."),
        fix("She ate an banana.", 2, "She ate a banana.", ["banana починається з приголосного.", "an → a."], "<b>a</b> banana."),
        dict("It's an interesting book.", [DH, "interesting — голосний звук → an."], "<b>an</b> interesting book.", { "It's a interesting book.": "interesting починається з голосного: <b>an</b>." })
      ] },

    { id: "art.the", title: "the — «той самий», «єдиний»",
      rule: "the — коли вже згадували, коли воно одне таке (the sun), з найкращим / першим (the best, the first) і коли зрозуміло, яке саме.",
      worked: { p: "I bought a cake. ___ cake was delicious.", steps: [
        "Торт уже згадували: «I bought <b>a</b> cake».",
        "Тепер мова про <b>той самий</b> торт.",
        "Той самий → <b>The</b>.",
        "Відповідь: <b>The</b> cake was delicious."] },
      alt: `<p>Уяви, що <b>the</b> — це вказівний палець 👉: «ось цей, саме той».</p>
        <p>Якщо можеш показати пальцем, про що мова (той торт, що купила; сонце, яке одне; двері в цій кімнаті) — <b>the</b>. Якщо «якийсь один із багатьох» — a / an.</p>`,
      items: [
        ch("I have a dog. ___ dog is very funny.", ["The", "A"], "The", ["Собаку вже згадували?", "Той самий → The."], "Той самий собака → <b>The</b>.", { "A": "Про цього собаку вже говорили: <b>The</b> dog." }),
        ch("___ sun is very hot today.", ["The", "A"], "The", ["Скільки в нас сонць?", "Одне таке → the."], "Сонце одне → <b>The</b> sun.", { "A": "Сонце одне: <b>The</b> sun." }),
        ch("Can you close ___ door, please?", ["the", "a"], "the", ["Які двері — якісь чи ось ці?", "Зрозуміло, які саме → the."], "Зрозуміло, які двері → <b>the</b> door.", { "a": "Мова про конкретні двері в кімнаті: <b>the</b> door." }),
        ch("Look at ___ moon!", ["the", "a"], "the", ["Скільки місяців на небі?", "Одне таке → the."], "<b>the</b> moon.", { "a": "Місяць один: <b>the</b> moon." }),
        inp("Впиши a, an або the", "I bought a cake. ___ cake was delicious.", ["The"], ["Торт уже згадували.", "Той самий → The."], "Той самий торт → <b>The</b>.", { "A": "Торт уже згадували: <b>The</b> cake." }),
        inp("Впиши a, an або the", "There's ___ cat in our garden.", ["a"], ["Кіт згадується вперше.", "Якийсь кіт → a."], "Уперше → <b>a</b> cat.", { "the": "Кіт згадується вперше: <b>a</b> cat." }),
        inp("Впиши a, an або the", "We live on ___ third floor.", ["the"], ["third — третій.", "Перший, другий, третій… → the."], "<b>the</b> third floor.", { "a": "З порядковими (first, third) — <b>the</b>." }),
        inp("Впиши a, an або the", "He is ___ best student in our class.", ["the"], ["best — найкращий.", "Найкращий — один такий → the."], "<b>the</b> best.", { "a": "Найкращий — один такий: <b>the</b> best." }),
        fix("A sky is blue today.", 0, "The sky is blue today.", ["Скільки в нас неб?", "Одне → the."], "<b>The</b> sky."),
        fix("I have the brother and a sister.", 2, "I have a brother and a sister.", ["Брат згадується вперше.", "Уперше → a."], "Уперше → <b>a</b> brother."),
        dict("The moon is very bright tonight.", [DH, "Місяць один → the."], "<b>The</b> moon.", { "A moon is very bright tonight.": "Місяць один: <b>The</b> moon." })
      ] },

    { id: "art.zero", title: "Коли артикль не потрібен",
      rule: "Без артикля: загалом у множині (Cats like milk), breakfast / lunch / dinner, спорт, мови, країни, go to school / bed.",
      worked: { p: "She plays ___ tennis on Fridays.", steps: [
        "tennis — це вид спорту.",
        "Перед видами спорту й іграми артикль не ставимо.",
        "Відповідь: She plays tennis on Fridays."] },
      alt: `<p>Запам'ятай «список без артикля»:</p>
        <p>🍳 breakfast, lunch, dinner · ⚽ football, chess · 🗣️ English · 🇺🇦 Ukraine · 🏫 go to school, go to bed, at home</p>
        <p class="muted">Але коли мова про конкретне: «<b>The</b> children in the garden» — конкретні діти, яких ми бачимо, тому the.</p>`,
      items: [
        ch("___ cats like milk.", [NONE, "The", "A"], NONE, ["Мова про котів узагалі чи про конкретних?", "Загалом → без артикля."], "Загалом: <b>Cats</b> like milk.", { "The": "Говоримо про котів загалом — без артикля.", "A": "cats — множина, a не буває." }),
        ch("We have ___ breakfast at eight.", [NONE, "a", "the"], NONE, ["breakfast — сніданок.", "Перед breakfast, lunch, dinner — без артикля."], "have <b>breakfast</b> — без артикля.", { "a": "Перед breakfast артикль не ставимо.", "the": "Перед breakfast артикль не ставимо." }),
        ch("She plays ___ tennis on Fridays.", [NONE, "the", "a"], NONE, ["tennis — спорт.", "Спорт → без артикля."], "play <b>tennis</b> — без артикля.", { "the": "Перед видами спорту — без артикля.", "a": "Перед видами спорту — без артикля." }),
        ch("My brother goes to ___ school by bus.", [NONE, "the", "a"], NONE, ["go to school — звичне місце.", "Без артикля."], "go to <b>school</b> — без артикля.", { "the": "go to school — без артикля.", "a": "go to school — без артикля." }),
        ch("They speak ___ English.", [NONE, "the", "an"], NONE, ["English — мова.", "Мови → без артикля."], "speak <b>English</b> — без артикля.", { "the": "Перед назвою мови — без артикля.", "an": "Перед назвою мови — без артикля." }),
        ch("I live in ___ Ukraine.", [NONE, "the", "a"], NONE, ["Ukraine — країна.", "Країни → без артикля."], "in <b>Ukraine</b> — без артикля.", { "the": "Перед назвою країни Ukraine артикль не ставимо.", "a": "Перед назвою країни — без артикля." }),
        ch("Look! ___ children in the garden are playing.", ["The", NONE, "A"], "The", ["Це діти загалом чи конкретні, яких бачимо?", "Конкретні → the."], "Конкретні діти → <b>The</b>.", { [NONE]: "Мова про конкретних дітей, яких ми бачимо: <b>The</b> children.", "A": "children — множина, a не буває." }),
        fix("I go to the bed at ten.", 3, "I go to bed at ten.", ["go to bed — звичний вираз.", "Тут артикль зайвий."], "go to <b>bed</b> — без артикля."),
        fix("We play the football after school.", 2, "We play football after school.", ["Спорт.", "Тут артикль зайвий."], "play <b>football</b> — без артикля."),
        dict("We have lunch at school.", [DH, "have lunch — без артикля."], "have <b>lunch</b> — без артикля.", { "We have a lunch at school.": "Перед lunch артикль не ставимо.", "We have the lunch at school.": "Перед lunch артикль не ставимо." })
      ] }
  ] });

  /* ===================== ЗАЙМЕННИКИ ===================== */
  w("lessons/l15.json", {
    id: "l15", title: "Займенники: me / mine / myself",
    skillFiles: ["skills/pron.json"],
    skills: ["pr.obj", "pr.poss", "pr.self"],
    practice: { perSkill: 4 },
    test: { plan: { "pr.obj": 3, "pr.poss": 3, "pr.self": 2 }, pass: 80 },
    explain: [
      { e: "🙋", h: "Хто? і Кого? Кому?",
        html: `<table class="t"><tr><td>хто?</td><td>кого? кому?</td></tr>
        <tr><td>I</td><td><b>me</b></td></tr><tr><td>you</td><td><b>you</b></td></tr><tr><td>he</td><td><b>him</b></td></tr>
        <tr><td>she</td><td><b>her</b></td></tr><tr><td>it</td><td><b>it</b></td></tr><tr><td>we</td><td><b>us</b></td></tr><tr><td>they</td><td><b>them</b></td></tr></table>
        ${say("I like her. She likes me.", "Мені подобається вона. Я подобаюсь їй.", "I like <b>her</b>. She likes <b>me</b>.")}
        <div class="tip">💡 Після дієслова і після with, to, for — друга колонка: help <b>me</b>, with <b>him</b>, to <b>them</b>.</div>` },
      { e: "🎒", h: "my чи mine",
        html: `<table class="t"><tr><td>перед іменником</td><td>без іменника</td></tr>
        <tr><td><b>my</b> bag</td><td>It's <b>mine</b>.</td></tr><tr><td><b>your</b> pen</td><td>It's <b>yours</b>.</td></tr>
        <tr><td><b>his</b> book</td><td>It's <b>his</b>.</td></tr><tr><td><b>her</b> phone</td><td>It's <b>hers</b>.</td></tr>
        <tr><td><b>our</b> house</td><td>It's <b>ours</b>.</td></tr><tr><td><b>their</b> dog</td><td>It's <b>theirs</b>.</td></tr></table>
        ${say("This is my bag. That bag is yours.", "Це моя сумка. Та сумка — твоя.", "This is <b>my</b> bag. That bag is <b>yours</b>.")}` },
      { e: "🪞", h: "Сам, собі: myself",
        html: `<table class="t"><tr><td>I → <b>myself</b></td><td>we → <b>ourselves</b></td></tr>
        <tr><td>you → <b>yourself</b></td><td>you (ви) → <b>yourselves</b></td></tr>
        <tr><td>he → <b>himself</b>, she → <b>herself</b></td><td>they → <b>themselves</b></td></tr>
        <tr><td>it → <b>itself</b></td><td></td></tr></table>
        ${say("I made this cake myself.", "Я сама спекла цей торт.", "I made this cake <b>myself</b>.")}
        <div class="tip">⚠️ <s>hisself</s>, <s>theirselves</s> — так не буває: <b>himself</b>, <b>themselves</b>.</div>` }
    ],
    examples: { title: "Чий це рюкзак?",
      question: { q: "чому «It's <b>mine</b>», а не «It's my»?", a: "Після mine немає іменника. my завжди потребує слова після себе: my bag." },
      items: [
        ["Whose backpack is this? Is it <b>yours</b>?", "Чий це рюкзак? Твій?"],
        ["No, it isn't <b>mine</b>. <b>My</b> backpack is blue.", "Ні, не мій. Мій рюкзак синій."],
        ["Maybe it's Oleh's. Ask <b>him</b>!", "Може, Олегів. Спитай його!"],
        ["Oleh, is this backpack <b>yours</b>? — Yes, it's <b>mine</b>! Thank you!", "Олеже, це твій рюкзак? — Так, мій! Дякую!"],
        ["He bought it <b>himself</b> with his own money.", "Він сам купив його за власні гроші."],
        ["The girls looked at <b>us</b> and smiled.", "Дівчата подивились на нас і усміхнулись."]
      ] },
    words: [
      ["neighbour", "сусід"], ["classmate", "однокласник"], ["best friend", "найкращий друг"], ["together", "разом"], ["alone", "сам, на самоті"],
      ["share", "ділитися"], ["borrow", "позичати (брати)"], ["lend", "позичати (давати)"], ["own", "власний"], ["belong to", "належати"]
    ]
  });

  const PR = "Впиши займенник";
  w("skills/pron.json", { topic: "pron", title: "Займенники", skills: [
    { id: "pr.obj", title: "me, him, her, us, them",
      rule: "Після дієслова і після with / to / for: me, you, him, her, it, us, them.",
      worked: { p: "Anna is in the garden. Go and see ___. (she)", steps: [
        "Займенник стоїть <b>після дієслова</b> see.",
        "Після дієслова — «кого?»: she → <b>her</b>.",
        "Відповідь: Go and see <b>her</b>."] },
      alt: `<p>Українською теж змінюємо: «вона» → «її», «вони» → «їх». Англійською так само:</p>
        <p>she → <b>her</b>, he → <b>him</b>, they → <b>them</b>, we → <b>us</b>, I → <b>me</b>.</p>
        <p class="muted">Перша колонка (I, she, they) — тільки на початку, хто діє. Після дієслова — друга.</p>`,
      items: [
        ch("This is my sister. Do you know ___?", ["her", "she"], "her", ["Займенник після дієслова know.", "she → her."], "after know → <b>her</b>.", { "she": "Після дієслова — <b>her</b>." }),
        ch("Tom is my friend. I play with ___ every day.", ["him", "he"], "him", ["Після with.", "he → him."], "with <b>him</b>.", { "he": "Після with — <b>him</b>." }),
        ch("Can you help ___, please?", ["me", "I"], "me", ["Після дієслова help.", "I → me."], "help <b>me</b>.", { "I": "Після дієслова — <b>me</b>." }),
        ch("Our parents love ___ very much.", ["us", "we"], "us", ["Після дієслова love.", "we → us."], "love <b>us</b>.", { "we": "Після дієслова — <b>us</b>." }),
        inp(PR, "I have two cats. I love ___ very much. (they)", ["them"], ["Після love.", "they → them."], "love <b>them</b>.", { "they": "Після дієслова — <b>them</b>.", "their": "their — «їхній». Тут потрібно <b>them</b>." }),
        inp(PR, "Where is my phone? I can't find ___. (it)", ["it"], ["Після find.", "it → it (не змінюється)."], "find <b>it</b>.", { "its": "its — «його» (чий). Тут <b>it</b>." }),
        inp(PR, "Anna is in the garden. Go and see ___. (she)", ["her"], ["Після see.", "she → her."], "see <b>her</b>.", { "she": "Після дієслова — <b>her</b>.", "hers": "hers — «її» (чий). Тут <b>her</b>." }),
        inp(PR, "Dad is at work. Call ___, please. (he)", ["him"], ["Після call.", "he → him."], "call <b>him</b>.", { "he": "Після дієслова — <b>him</b>.", "his": "his — «його» (чий). Тут <b>him</b>." }),
        inp(PR, "We're at home. Come and visit ___! (we)", ["us"], ["Після visit.", "we → us."], "visit <b>us</b>.", { "we": "Після дієслова — <b>us</b>.", "our": "our — «наш». Тут <b>us</b>." }),
        fix("Give it to I, please.", 3, "Give it to me, please.", ["Після to.", "I → me."], "to <b>me</b>."),
        fix("I see they every day.", 2, "I see them every day.", ["Після see.", "they → them."], "see <b>them</b>."),
        dict("Can you help me?", [DH, "Після help — me."], "help <b>me</b>.", { "Can you help I?": "Після дієслова — <b>me</b>." })
      ] },

    { id: "pr.poss", title: "my / mine, your / yours, her / hers",
      rule: "Перед іменником: my, your, his, her, our, their. Без іменника: mine, yours, his, hers, ours, theirs.",
      worked: { p: "This is Anna's book. It's ___. (вона)", steps: [
        "Чия книжка? Анина — «її».",
        "Після займенника <b>немає іменника</b> (It's ___.).",
        "Без іменника: her → <b>hers</b>.",
        "Відповідь: It's <b>hers</b>."] },
      alt: `<p>Подивись, що стоїть <b>після</b> пропуску:</p>
        <p>є іменник (bag, book, dog) → my, your, her, our, their<br>нічого немає (крапка) → mine, yours, hers, ours, theirs</p>
        <p class="muted">Підказка: у другій колонці майже всі мають -s на кінці (yours, hers, ours, theirs), а mine — виняток.</p>`,
      items: [
        ch("This is ___ bag.", ["my", "mine"], "my", ["Після пропуску є іменник bag.", "Перед іменником → my."], "<b>my</b> bag.", { "mine": "Перед іменником — <b>my</b>." }),
        ch("This bag is ___.", ["mine", "my"], "mine", ["Після пропуску немає іменника.", "Без іменника → mine."], "It's <b>mine</b>.", { "my": "Після немає іменника — <b>mine</b>." }),
        ch("Is this pen ___?", ["yours", "your"], "yours", ["Після пропуску немає іменника.", "→ yours."], "Is it <b>yours</b>?", { "your": "Без іменника після — <b>yours</b>." }),
        ch("___ house is very big.", ["Their", "Theirs"], "Their", ["Після пропуску є house.", "→ Their."], "<b>Their</b> house.", { "Theirs": "Перед іменником — <b>Their</b>." }),
        inp(PR, "This is Anna's book. It's ___. (вона)", ["hers"], ["Без іменника після.", "her → hers."], "It's <b>hers</b>.", { "her": "Без іменника — <b>hers</b>.", "she": "Тут треба «її» (чия?): <b>hers</b>." }),
        inp(PR, "Is it your phone or ___? (я)", ["mine"], ["Без іменника після.", "→ mine."], "or <b>mine</b>.", { "my": "Без іменника — <b>mine</b>.", "me": "Тут треба «мій» (чий?): <b>mine</b>." }),
        inp(PR, "This is our classroom. It's ___. (ми)", ["ours"], ["Без іменника.", "our → ours."], "It's <b>ours</b>.", { "our": "Без іменника — <b>ours</b>.", "us": "Тут треба «наш» (чий?): <b>ours</b>." }),
        inp(PR, "Tom and Kate have a dog. ___ dog is white. (вони)", ["Their"], ["Після пропуску є dog.", "→ Their."], "<b>Their</b> dog.", { "Theirs": "Перед іменником — <b>Their</b>.", "They": "Тут треба «їхній» (чий?): <b>Their</b>.", "Them": "Тут треба «їхній» (чий?): <b>Their</b>." }),
        fix("This is my pencil and that is your.", 7, "This is my pencil and that is yours.", ["Після останнього займенника нема іменника.", "your → yours."], "that is <b>yours</b>."),
        fix("Mine room is small.", 0, "My room is small.", ["Після займенника є іменник room.", "mine → my."], "<b>My</b> room."),
        dict("This book is mine.", [DH, "Без іменника → mine."], "is <b>mine</b>.", { "This book is my.": "Без іменника — <b>mine</b>." })
      ] },

    { id: "pr.self", title: "myself, himself, themselves",
      rule: "Сам / собі: myself, yourself, himself, herself, itself, ourselves, yourselves, themselves.",
      worked: { p: "We cleaned the room ___. (самі)", steps: [
        "Хто? <b>We</b>.",
        "we → our + <b>selves</b> (бо нас багато).",
        "Відповідь: We cleaned the room <b>ourselves</b>."] },
      alt: `<p>Однина → <b>-self</b>, множина → <b>-selves</b>:</p>
        <p>my<b>self</b>, your<b>self</b>, him<b>self</b>, her<b>self</b>, it<b>self</b><br>our<b>selves</b>, your<b>selves</b>, them<b>selves</b></p>`,
      items: [
        ch("I made this cake ___.", ["myself", "me"], "myself", ["Сама — хто зробив?", "I → myself."], "I … <b>myself</b>.", { "me": "«Сама» — <b>myself</b>." }),
        ch("She looked at ___ in the mirror.", ["herself", "her"], "herself", ["На себе саму.", "she → herself."], "<b>herself</b>.", { "her": "Дивилась на себе саму: <b>herself</b>." }),
        ch("Be careful! Don't hurt ___!", ["yourself", "you"], "yourself", ["Не порань себе.", "you → yourself."], "<b>yourself</b>.", { "you": "Не порань себе: <b>yourself</b>." }),
        inp("Впиши займенник з -self / -selves", "He did his homework ___. (сам)", ["himself"], ["he → him + self.", "Не his!"], "<b>himself</b>.", { "hisself": "Правильно: <b>himself</b>.", "him": "«Сам» — <b>himself</b>." }),
        inp("Впиши займенник з -self / -selves", "We cleaned the room ___. (самі)", ["ourselves"], ["we → our + selves.", "Множина → -selves."], "<b>ourselves</b>.", { "ourself": "Для we — множина: <b>ourselves</b>.", "us": "«Самі» — <b>ourselves</b>." }),
        inp("Впиши займенник з -self / -selves", "They built the house ___. (самі)", ["themselves"], ["they → them + selves.", "Не their!"], "<b>themselves</b>.", { "theirselves": "Правильно: <b>themselves</b>.", "themself": "Множина: <b>themselves</b>." }),
        inp("Впиши займенник з -self / -selves", "The machine turns off ___. (сама)", ["itself"], ["The machine = it.", "it → itself."], "<b>itself</b>.", { "herself": "Машина — це it: <b>itself</b>." }),
        fix("I can do it meself.", 4, "I can do it myself.", ["I → ?", "my + self."], "<b>myself</b>."),
        dict("She did it herself.", [DH, "she → herself."], "<b>herself</b>.", { "She did it sheself.": "Правильно: <b>herself</b>." })
      ] }
  ] });

  /* ===================== МАЙБУТНЄ ===================== */
  w("lessons/l16.json", {
    id: "l16", title: "Майбутнє: will і be going to",
    skillFiles: ["skills/fut.json"],
    skills: ["fut.will", "fut.going", "fut.choice"],
    practice: { perSkill: 4 },
    test: { plan: { "fut.will": 3, "fut.going": 3, "fut.choice": 2 }, pass: 80 },
    explain: [
      { e: "🔮", h: "will — буде, думаю, вирішила",
        html: `<p><b>will</b> + перша форма — однаково для всіх.</p>
        ${say("I think it will rain tomorrow.", "Думаю, завтра буде дощ.", "I think it <b>will rain</b> tomorrow.")}
        ${say("The phone is ringing. I will answer it!", "Телефон дзвонить. Я відповім!", "The phone is ringing. I <b>will answer</b> it!")}
        <table class="t"><tr><td>заперечення</td><td><b>won't</b> (= will not)</td></tr><tr><td>питання</td><td><b>Will</b> you help me?</td></tr><tr><td>коротко</td><td>I'll, she'll, we'll</td></tr></table>
        <div class="tip">⚠️ Після will — без to і без -s: <s>will to go</s>, <s>will goes</s>.</div>` },
      { e: "🗓️", h: "be going to — збираюсь, уже план",
        html: `<div class="rule-box">am / is / are + <b>going to</b> + перша форма</div>
        ${say("I am going to visit my grandma on Saturday.", "У суботу я збираюсь навідати бабусю.", "I <b>am going to visit</b> my grandma on Saturday.")}
        ${say("Look at those clouds! It is going to rain.", "Подивись на ті хмари! Зараз буде дощ.", "Look at those clouds! It <b>is going to rain</b>.")}
        <p class="muted">Заперечення: I'm not / she isn't / they aren't going to… Питання: Are you going to…?</p>` },
      { e: "⚖️", h: "will чи going to?",
        html: `<table class="t"><tr><td><b>going to</b></td><td>план, уже вирішено заздалегідь; бачимо ознаки зараз (хмари → дощ)</td></tr>
        <tr><td><b>will</b></td><td>рішення в цю секунду; думка, прогноз (I think, maybe, probably); обіцянка</td></tr></table>
        <div class="tip">💡 «Я вже купила квитки» → going to. «О, телефон! Я відповім» → will.</div>` }
    ],
    examples: { title: "Плани на канікули",
      question: { q: "чому «I'<b>ll</b> help you», а не «I'm going to help you»?", a: "Мама попросила щойно, і рішення допомогти прийнято в цю секунду — will." },
      items: [
        ["Next summer we <b>are going to travel</b> to the Carpathians.", "Наступного літа ми збираємось у Карпати."],
        ["Dad has already bought the tickets.", "Тато вже купив квитки."],
        ["We <b>are going to climb</b> Hoverla!", "Ми збираємось піднятися на Говерлу!"],
        ["I think it <b>will be</b> hard, but I <b>won't give</b> up.", "Думаю, буде важко, але я не здамся."],
        ["Mum: «Can somebody help me with the bags?» — «I<b>'ll help</b> you!»", "Мама: «Хтось допоможе з сумками?» — «Я допоможу!»"],
        ["Maybe we <b>will see</b> a bear!", "Може, ми побачимо ведмедя!"]
      ] },
    words: [
      ["plan", "план; планувати"], ["future", "майбутнє"], ["tomorrow", "завтра"], ["next week", "наступного тижня"], ["soon", "скоро"],
      ["later", "пізніше"], ["maybe", "можливо"], ["probably", "напевно"], ["hope", "сподіватися"], ["dream", "мрія; мріяти"]
    ]
  });

  w("skills/fut.json", { topic: "fut", title: "Майбутній час", skills: [
    { id: "fut.will", title: "will / won't + перша форма",
      rule: "will + перша форма для всіх; won't = will not; Will you…?",
      worked: { p: "I'm sure you ___ the test. (pass)", steps: [
        "Я впевнена — це прогноз, думка → <b>will</b>.",
        "Після will — перша форма, без to, без -s: <b>pass</b>.",
        "Відповідь: you <b>will pass</b> the test."] },
      alt: `<p>will — це «чарівна кнопка майбутнього»: ставиш перед дієсловом, а саме дієслово не чіпаєш.</p>
        <p>I go → I <b>will go</b>; she plays → she <b>will play</b> (без -s!); I don't → I <b>won't</b>.</p>`,
      items: [
        ch("I think it ___ rain tomorrow.", ["will", "wills"], "will", ["will однакове для всіх.", "Без -s."], "it <b>will</b> rain.", { "wills": "will однакове для всіх, без -s: <b>will</b>." }),
        ch("She will ___ you tomorrow.", ["call", "calls", "to call"], "call", ["Після will — перша форма.", "Без -s, без to."], "will <b>call</b>.", { "calls": "Після will — перша форма: <b>call</b>.", "to call": "Після will — без to: <b>call</b>." }),
        ch("Don't worry, I ___ tell anybody.", ["won't", "don't"], "won't", ["Обіцянка на майбутнє.", "will not = won't."], "<b>won't</b> tell.", { "don't": "Це обіцянка на майбутнє: <b>won't</b>." }),
        inp("Впиши will або won't + дієслово", "Tomorrow I ___ my grandma. (visit)", ["will visit", "'ll visit"], ["tomorrow — майбутнє.", "will + перша форма."], "<b>will visit</b>.", { "visit": "tomorrow — майбутнє: <b>will visit</b>.", "will visits": "Після will — перша форма: <b>will visit</b>.", "will to visit": "Після will — без to: <b>will visit</b>." }),
        inp("Впиши will або won't + дієслово", "I'm sure you ___ the test. (pass)", ["will pass", "'ll pass"], ["Впевненість, прогноз → will.", "will + перша форма."], "<b>will pass</b>.", { "will passed": "Після will — перша форма: <b>will pass</b>.", "pass": "Це про майбутнє: <b>will pass</b>." }),
        inp("Впиши will або won't + дієслово", "It's very cold. I think it ___ tomorrow. (snow)", ["will snow", "'ll snow"], ["I think — думка про майбутнє.", "will + snow."], "<b>will snow</b>.", { "snows": "Це про завтра: <b>will snow</b>.", "will snows": "Після will — перша форма: <b>will snow</b>." }),
        inp("Впиши will або won't + дієслово", "My dad ___ late tonight. (not be)", ["won't be", "will not be"], ["Заперечення → won't.", "won't + be."], "<b>won't be</b>.", { "willn't be": "Правильно: <b>won't</b> be.", "won't is": "Після won't — перша форма: <b>be</b>.", "doesn't be": "Майбутнє: <b>won't be</b>." }),
        inp("Впиши потрібне слово", "___ you help me with my homework?", ["Will"], ["Прохання на майбутнє.", "Will you…?"], "<b>Will</b> you help me?", { "Do": "Прохання про майбутню допомогу: <b>Will</b> you…?", "Are": "Тут <b>Will</b> you help…?" }),
        fix("I will to call you later.", 2, "I will call you later.", ["Після will…", "…без to."], "will <b>call</b> — без to."),
        fix("She wills come tomorrow.", 1, "She will come tomorrow.", ["will однакове для всіх.", "Без -s."], "<b>will</b> — без -s."),
        dict("I will see you tomorrow.", [DH, "will + перша форма."], "<b>will see</b>.", { "I will saw you tomorrow.": "Після will — перша форма: <b>see</b>.", "I see you tomorrow.": "tomorrow — майбутнє: <b>will see</b>." })
      ] },

    { id: "fut.going", title: "am / is / are going to",
      rule: "am / is / are + going to + перша форма: план або ознаки зараз.",
      worked: { p: "We ___ a film tonight. (watch)", steps: [
        "Хто? <b>We</b> → are.",
        "План на вечір → <b>going to</b>.",
        "+ перша форма: <b>watch</b>.",
        "Відповідь: We <b>are going to watch</b> a film tonight."] },
      alt: `<p>Це три цеглинки, і жодну не можна пропустити:</p>
        <div class="rule-box" style="font-weight:800">am / is / are + going to + дієслово</div>
        <p>I <b>am</b> going to read. She <b>is</b> going to sing. They <b>are</b> going to play.</p>`,
      items: [
        ch("I ___ going to visit my aunt.", ["am", "is", "are"], "am", ["Хто? I.", "I → am."], "I <b>am</b> going to…", { "is": "З I — <b>am</b>.", "are": "З I — <b>am</b>." }),
        ch("They are going ___ a new house.", ["to buy", "buy", "buying"], "to buy", ["going…", "…to + перша форма."], "going <b>to buy</b>.", { "buy": "Не забудь to: going <b>to buy</b>.", "buying": "going to + перша форма: <b>to buy</b>." }),
        ch("Look at the clouds! It's going ___.", ["to rain", "rain"], "to rain", ["going…", "…to + перша форма."], "going <b>to rain</b>.", { "rain": "Не забудь to: going <b>to rain</b>." }),
        inp("Впиши am / is / are going to + дієслово", "We ___ a film tonight. (watch)", ["are going to watch", "'re going to watch"], ["we → are.", "are going to + watch."], "<b>are going to watch</b>.", { "is going to watch": "we → <b>are</b>.", "going to watch": "Не забудь are: <b>are</b> going to watch.", "are going watch": "Не забудь to: are going <b>to</b> watch." }),
        inp("Впиши am / is / are going to + дієслово", "She ___ a doctor. (be)", ["is going to be", "'s going to be"], ["she → is.", "is going to + be."], "<b>is going to be</b>.", { "are going to be": "she → <b>is</b>.", "going to be": "Не забудь is: <b>is</b> going to be." }),
        inp("Впиши am / is / are going to + дієслово", "I ___ my room this evening. (clean)", ["am going to clean", "'m going to clean"], ["I → am.", "am going to + clean."], "<b>am going to clean</b>.", { "is going to clean": "З I — <b>am</b>.", "going to clean": "Не забудь am: <b>am</b> going to clean." }),
        inp("Впиши am / is / are going to + дієслово", "Tom ___ football tomorrow. (not play)", ["isn't going to play", "is not going to play", "'s not going to play"], ["Tom = he → isn't.", "isn't going to + play."], "<b>isn't going to play</b>.", { "doesn't going to play": "Тут помічник is: <b>isn't</b> going to play.", "aren't going to play": "Tom = he → <b>isn't</b>." }),
        inp("Впиши Is або Are", "___ you going to come to the party?", ["Are"], ["you → are.", "Питання → Are на початок."], "<b>Are</b> you going to…?", { "Do": "Тут помічник are: <b>Are</b> you going to…?", "Is": "you → <b>Are</b>." }),
        fix("She are going to sing.", 1, "She is going to sing.", ["she → ?", "is."], "she → <b>is</b> going to."),
        fix("We are going to visited Lviv.", 4, "We are going to visit Lviv.", ["Після going to…", "…перша форма."], "going to <b>visit</b>."),
        dict("I am going to buy a new bike.", [DH, "am going to + buy."], "<b>am going to buy</b>.", { "I going to buy a new bike.": "Не забувай am: I <b>am</b> going to buy." })
      ] },

    { id: "fut.choice", title: "will чи going to?",
      rule: "going to — план заздалегідь або видимі ознаки; will — рішення зараз, думка (I think, maybe), обіцянка.",
      worked: { p: "We have the tickets. We ___ Lviv next week.", steps: [
        "Квитки вже є — план готовий <b>заздалегідь</b>.",
        "План → <b>going to</b>.",
        "Відповідь: We <b>are going to visit</b> Lviv next week."] },
      alt: `<p>Спитай себе: <b>«Це вирішено раніше чи прямо зараз?»</b></p>
        <p>Раніше (купили квитки, домовились) → going to.<br>Прямо зараз («О, я допоможу!») або просто думка (I think, maybe) → will.</p>`,
      items: [
        ch("We have the tickets. We ___ Lviv next week.", ["are going to visit", "will visit"], "are going to visit", ["Квитки вже є.", "План → going to."], "План → <b>are going to visit</b>.", { "will visit": "План уже є (квитки куплено) — <b>going to</b>." }),
        ch("The phone is ringing. — I ___ answer it!", ["will", "am going to"], "will", ["Вирішила щойно.", "Рішення зараз → will."], "Рішення в цю мить → <b>will</b>.", { "am going to": "Рішення прийняте щойно — <b>will</b>." }),
        ch("I think robots ___ do all the housework one day.", ["will", "are going to"], "will", ["I think — думка.", "Думка, прогноз → will."], "I think → <b>will</b>.", { "are going to": "Після I think — зазвичай <b>will</b>." }),
        ch("Look at that black sky! It ___ rain.", ["is going to", "will"], "is going to", ["Бачимо ознаки зараз.", "Ознаки → going to."], "Чорне небо → <b>is going to</b> rain.", { "will": "Ми бачимо ознаки зараз — <b>is going to</b>." }),
        ch("Maybe I ___ go to the cinema tonight.", ["will", "am going to"], "will", ["Maybe — ще не вирішено.", "→ will."], "Maybe → <b>will</b>.", { "am going to": "maybe — ще не план: <b>will</b>." }),
        inp("Впиши will або going to з дієсловом", "I'm hungry! — Wait, I ___ you a sandwich! (make)", ["will make", "'ll make"], ["Вирішила щойно.", "will + make."], "Рішення зараз → <b>will make</b>.", { "am going to make": "Рішення в цю мить — <b>will make</b>.", "make": "Це про майбутнє: <b>will make</b>." }),
        inp("Впиши will або going to з дієсловом", "She has bought some paint. She ___ her room. (paint)", ["is going to paint", "'s going to paint"], ["Вже купила фарбу — план.", "is going to + paint."], "План → <b>is going to paint</b>.", { "will paint": "Уже є план (купила фарбу) — <b>is going to paint</b>.", "going to paint": "Не забудь is: <b>is</b> going to paint." }),
        dict("I think it will be sunny tomorrow.", [DH, "I think → will."], "I think → <b>will be</b>.", { "I think it will sunny tomorrow.": "Не забудь be: will <b>be</b> sunny." })
      ] }
  ] });

  /* ===================== СТУПЕНІ ПОРІВНЯННЯ ===================== */
  const CF = "Впиши прикметник у потрібній формі";
  w("lessons/l10.json", {
    id: "l10", title: "Ступені порівняння",
    skillFiles: ["skills/comp.json"],
    skills: ["comp.er", "comp.more", "comp.irr"],
    practice: { perSkill: 4 },
    test: { plan: { "comp.er": 3, "comp.more": 3, "comp.irr": 2 }, pass: 80 },
    explain: [
      { e: "📏", h: "Короткі слова: -er, -est",
        html: `<table class="t"><tr><td>tall</td><td>tall<b>er</b> (вищий)</td><td>the tall<b>est</b> (найвищий)</td></tr>
        <tr><td>nice</td><td>nice<b>r</b></td><td>the nice<b>st</b></td></tr>
        <tr><td>big</td><td>bi<b>gg</b>er</td><td>the bi<b>gg</b>est</td></tr>
        <tr><td>easy</td><td>eas<b>ier</b></td><td>the eas<b>iest</b></td></tr></table>
        ${say("My brother is taller than me.", "Мій брат вищий за мене.", "My brother is <b>taller than</b> me.")}
        <div class="tip">💡 «ніж» — <b>than</b>. Найвищий — завжди з <b>the</b>: the tallest. Правила правопису ті самі: німа -e, подвоєння, y → i.</div>` },
      { e: "📚", h: "Довгі слова: more, most",
        html: `<table class="t"><tr><td>interesting</td><td><b>more</b> interesting</td><td>the <b>most</b> interesting</td></tr>
        <tr><td>beautiful</td><td><b>more</b> beautiful</td><td>the <b>most</b> beautiful</td></tr>
        <tr><td>expensive</td><td><b>more</b> expensive</td><td>the <b>most</b> expensive</td></tr></table>
        ${say("This book is more interesting than that one.", "Ця книжка цікавіша за ту.", "This book is <b>more interesting than</b> that one.")}
        <div class="tip">⚠️ Або -er, або more — не разом: <s>more bigger</s>, <s>interestinger</s>.</div>` },
      { e: "🏆", h: "Винятки",
        html: `<table class="t"><tr><td>good</td><td><b>better</b></td><td>the <b>best</b></td></tr>
        <tr><td>bad</td><td><b>worse</b></td><td>the <b>worst</b></td></tr>
        <tr><td>far</td><td><b>farther</b></td><td>the <b>farthest</b></td></tr></table>
        ${say("This is the best day of my life!", "Це найкращий день у моєму житті!", "This is <b>the best</b> day of my life!")}` }
    ],
    examples: { title: "Тварини-рекордсмени",
      question: { q: "чому «the <b>fastest</b>», а «the <b>most dangerous</b>»?", a: "fast — коротке слово (-est). dangerous — довге (most)." },
      items: [
        ["The blue whale is <b>the biggest</b> animal in the world.", "Синій кит — найбільша тварина у світі."],
        ["The cheetah is <b>the fastest</b> animal on land.", "Гепард — найшвидша тварина на суші."],
        ["An elephant is <b>heavier than</b> a car.", "Слон важчий за автомобіль."],
        ["A giraffe is <b>taller than</b> any other animal.", "Жираф вищий за будь-яку іншу тварину."],
        ["Some people think sharks are <b>more dangerous than</b> lions.", "Дехто вважає, що акули небезпечніші за левів."],
        ["But for me, cats are <b>the best</b> animals!", "Але для мене найкращі тварини — коти!"]
      ] },
    words: [
      ["tall", "високий (про людину)"], ["short", "низький; короткий"], ["fast", "швидкий"], ["slow", "повільний"], ["strong", "сильний"],
      ["weak", "слабкий"], ["cheap", "дешевий"], ["expensive", "дорогий"], ["heavy", "важкий"], ["dangerous", "небезпечний"]
    ]
  });

  w("skills/comp.json", { topic: "comp", title: "Ступені порівняння", skills: [
    { id: "comp.er", title: "Короткі слова: taller, the tallest",
      rule: "Коротке слово: + er / the + est. Німа -e → r / st; подвоєння (big → bigger); y → ier / iest.",
      worked: { p: "July is the ___ month. (hot)", steps: [
        "«the …» — найбільш → <b>-est</b>.",
        "hot — коротке: голосна + приголосна → подвоюємо t.",
        "Відповідь: the <b>hottest</b> month."] },
      alt: `<p>Двоє порівнюємо → <b>-er + than</b>: taller than.<br>Найбільш з усіх → <b>the + -est</b>: the tallest.</p>
        <p>Правопис як у -ed / -ing: nice → nicer, big → bigger, easy → easier.</p>`,
      items: [
        ch("An elephant is ___ than a horse.", ["bigger", "biger", "more big"], "bigger", ["big — коротке слово.", "Подвоюємо g + er."], "big → <b>bigger</b>.", { "biger": "Подвоюємо g: <b>bigger</b>.", "more big": "Коротке слово — + er: <b>bigger</b>." }),
        inp(CF, "My brother is ___ than me. (tall)", ["taller"], ["Порівнюємо двох → -er.", "tall + er."], "<b>taller</b> than.", { "more tall": "Коротке слово — + er: <b>taller</b>.", "tallest": "Порівнюємо двох (than) — <b>taller</b>." }, S),
        inp(CF, "This is the ___ day of the year. (cold)", ["coldest"], ["the … → -est.", "cold + est."], "the <b>coldest</b>.", { "most cold": "Коротке слово — + est: <b>coldest</b>.", "colder": "the … — найбільш: <b>coldest</b>." }, S),
        inp(CF, "Maths is ___ than history. (easy)", ["easier"], ["easy: y після приголосної.", "y → ier."], "easy → <b>easier</b>.", { "easyer": "y → i: <b>easier</b>.", "more easy": "Коротке слово — <b>easier</b>." }, S),
        inp(CF, "July is the ___ month. (hot)", ["hottest"], ["hot — коротке, подвоюємо t.", "+ est."], "hot → <b>hottest</b>.", { "hotest": "Подвоюємо t: <b>hottest</b>.", "hotter": "the … — найбільш: <b>hottest</b>." }, S),
        inp(CF, "Your bag is ___ than mine. (heavy)", ["heavier"], ["heavy: y після приголосної.", "y → ier."], "heavy → <b>heavier</b>.", { "heavyer": "y → i: <b>heavier</b>.", "more heavy": "Слово на -y — <b>heavier</b>." }, S),
        inp(CF, "Kyiv is ___ than Lviv. (big)", ["bigger"], ["big — коротке, подвоюємо g.", "+ er."], "big → <b>bigger</b>.", { "biger": "Подвоюємо g: <b>bigger</b>." }, S),
        inp(CF, "This is the ___ pizza in town! (nice)", ["nicest"], ["nice — німа -e.", "+ st."], "nice → <b>nicest</b>.", { "niceest": "Німа -e: тільки + st — <b>nicest</b>." }, S),
        fix("My cat is more small than your dog.", 3, "My cat is smaller than your dog.", ["small — коротке слово.", "more тут зайве: smaller."], "<b>smaller</b> — без more."),
        fix("Today is the hotest day.", 3, "Today is the hottest day.", ["hot — подвоюємо t.", "hottest."], "<b>hottest</b>."),
        dict("My sister is younger than me.", [DH, "young → younger."], "<b>younger</b> than.", { "My sister is more young than me.": "Коротке слово — <b>younger</b>." })
      ] },

    { id: "comp.more", title: "Довгі слова: more / the most",
      rule: "Довге слово: more … than / the most …",
      worked: { p: "A car is ___ than a bike. (expensive)", steps: [
        "expensive — довге слово.",
        "Порівнюємо дві речі (than) → <b>more</b>.",
        "Відповідь: <b>more expensive</b> than a bike."] },
      alt: `<p>Якщо слово довге й важко вимовити з -er («expensiver» 😵), ставимо перед ним <b>more</b> або <b>the most</b>.</p>
        <p>beautiful → more beautiful → the most beautiful</p>`,
      items: [
        ch("This book is ___ than that one.", ["more interesting", "interestinger"], "more interesting", ["interesting — довге.", "more + interesting."], "<b>more interesting</b>.", { "interestinger": "Довге слово — <b>more interesting</b>." }),
        ch("She is the ___ girl in our class.", ["most beautiful", "beautifullest", "more beautiful"], "most beautiful", ["the … — найбільш.", "the most + довге слово."], "the <b>most beautiful</b>.", { "beautifullest": "Довге слово — the <b>most beautiful</b>.", "more beautiful": "the … — найбільш: <b>most beautiful</b>." }),
        inp(CF, "A car is ___ than a bike. (expensive)", ["more expensive"], ["Довге слово.", "Порівнюємо двоє → more."], "<b>more expensive</b>.", { "expensiver": "Довге слово — <b>more expensive</b>.", "most expensive": "Порівнюємо дві речі (than) — <b>more</b>." }),
        inp(CF, "This is the ___ film of the year. (popular)", ["most popular"], ["the … — найбільш.", "the most + popular."], "the <b>most popular</b>.", { "popularest": "Довге слово — <b>most popular</b>.", "more popular": "the … — найбільш: <b>most popular</b>." }),
        inp(CF, "English is ___ than maths for me. (difficult)", ["more difficult"], ["Довге слово.", "more + difficult."], "<b>more difficult</b>.", { "difficulter": "Довге слово — <b>more difficult</b>.", "most difficult": "Порівнюємо двоє (than) — <b>more</b>." }),
        inp(CF, "Lviv is one of the ___ cities in Ukraine. (beautiful)", ["most beautiful"], ["the … — найбільш.", "the most + beautiful."], "the <b>most beautiful</b>.", { "beautifullest": "Довге слово — <b>most beautiful</b>.", "more beautiful": "one of the … — <b>most beautiful</b>." }),
        fix("This exercise is difficulter than that one.", 3, "This exercise is more difficult than that one.", ["difficult — довге слово.", "more difficult."], "<b>more difficult</b>."),
        fix("It's the more important day of my life.", 2, "It's the most important day of my life.", ["the … — найбільш.", "the most."], "the <b>most</b> important."),
        dict("Football is more popular than tennis.", [DH, "Довге слово → more."], "<b>more popular</b>.", { "Football is popularer than tennis.": "Довге слово — <b>more popular</b>." })
      ] },

    { id: "comp.irr", title: "good-better-best, bad-worse-worst; than",
      rule: "good → better → the best; bad → worse → the worst. «ніж» — than.",
      worked: { p: "My English is ___ now than last year. (good)", steps: [
        "Порівнюємо «зараз» і «торік» — двоє (than).",
        "good — виняток: <b>better</b>.",
        "Відповідь: My English is <b>better</b> now."] },
      alt: `<p>Ці слова «перевдягаються» повністю — їх треба запам'ятати:</p>
        <p><b>good → better → the best</b> 👍<br><b>bad → worse → the worst</b> 👎</p>
        <p class="muted">І не плутай: <b>than</b> — «ніж», <b>then</b> — «потім».</p>`,
      items: [
        ch("My mark is ___ than yours.", ["better", "gooder", "more good"], "better", ["good — виняток.", "good → better."], "<b>better</b>.", { "gooder": "good — виняток: <b>better</b>.", "more good": "good — виняток: <b>better</b>." }),
        ch("This is the ___ day of my life!", ["best", "goodest", "better"], "best", ["the … — найбільш.", "good → the best."], "the <b>best</b>.", { "goodest": "good — виняток: the <b>best</b>.", "better": "the … — найкращий: <b>best</b>." }),
        ch("The weather today is ___ than yesterday.", ["worse", "badder", "more bad"], "worse", ["bad — виняток.", "bad → worse."], "<b>worse</b>.", { "badder": "bad — виняток: <b>worse</b>.", "more bad": "bad — виняток: <b>worse</b>." }),
        inp(CF, "She is the ___ singer in our school. (good)", ["best"], ["the … — найкраща.", "good → best."], "the <b>best</b>.", { "goodest": "good — виняток: <b>best</b>.", "better": "the … — найкраща: <b>best</b>." }, S),
        inp(CF, "This is the ___ film I have ever seen. (bad)", ["worst"], ["the … — найгірший.", "bad → worst."], "the <b>worst</b>.", { "baddest": "bad — виняток: <b>worst</b>.", "worse": "the … — найгірший: <b>worst</b>." }, S),
        inp(CF, "My English is ___ now than last year. (good)", ["better"], ["Порівнюємо двоє (than).", "good → better."], "<b>better</b>.", { "gooder": "good — виняток: <b>better</b>.", "best": "Порівнюємо двоє (than) — <b>better</b>." }, S),
        inp("Впиши than або then", "My dog is bigger ___ your cat.", ["than"], ["«ніж».", "than."], "bigger <b>than</b>.", { "then": "«ніж» — <b>than</b>; then — «потім».", "that": "«ніж» — <b>than</b>." }, S),
        fix("Your drawing is more better than mine.", 3, "Your drawing is better than mine.", ["better уже означає «кращий».", "more тут зайве."], "<b>better</b> — без more."),
        dict("This is the best day ever!", [DH, "good → the best."], "the <b>best</b>.", { "This is the goodest day ever!": "good — виняток: the <b>best</b>." })
      ] }
  ] });
};
