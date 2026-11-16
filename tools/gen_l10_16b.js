// Модальні (l11), Past Continuous (l12), Present Perfect (l13)
const { say, inp, ch, fix, dict, ord, DH, S } = require("./lib.js");
module.exports = function (w) {

  /* ===================== МОДАЛЬНІ ===================== */
  w("lessons/l11.json", {
    id: "l11", title: "can / must / mustn't",
    skillFiles: ["skills/mod.json"],
    skills: ["mod.can", "mod.must", "mod.form"],
    practice: { perSkill: 4 },
    test: { plan: { "mod.can": 3, "mod.must": 3, "mod.form": 2 }, pass: 80 },
    explain: [
      { e: "💪", h: "can — вмію, можу, можна",
        html: `<table class="t"><tr><td>вмію</td><td>I <b>can</b> swim.</td></tr><tr><td>не вмію / не можу</td><td>I <b>can't</b> (cannot) drive.</td></tr>
        <tr><td>можна?</td><td><b>Can</b> I open the window?</td></tr><tr><td>відповідь</td><td>Yes, you <b>can</b>. / No, you <b>can't</b>.</td></tr></table>
        ${say("My sister can play the piano.", "Моя сестра вміє грати на піаніно.", "My sister <b>can play</b> the piano.")}` },
      { e: "🚦", h: "must і mustn't — правила",
        html: `<table class="t"><tr><td><b>must</b></td><td>треба, обов'язково</td><td>You <b>must</b> wear a helmet.</td></tr>
        <tr><td><b>mustn't</b></td><td>не можна, заборонено</td><td>You <b>mustn't</b> run here.</td></tr></table>
        ${say("You mustn't use your phone in class.", "На уроці не можна користуватися телефоном.", "You <b>mustn't use</b> your phone in class.")}` },
      { e: "🧩", h: "Як їх будувати",
        html: `<div class="rule-box">can / must + <b>перша форма</b> — для всіх однаково</div>
        <p>✓ She <b>can sing</b>. ✓ He <b>must go</b>.</p>
        <div class="tip">⚠️ Три пастки: <s>she cans</s> (без -s), <s>can to sing</s> (без to), <s>Do you can…?</s> (питання без do: <b>Can you</b>…?).</div>` }
    ],
    examples: { title: "Правила басейну",
      question: { q: "чому «You <b>must</b> take a shower», а не «You must to take»?", a: "Після must (і can) — перша форма без to." },
      items: [
        ["Welcome to our swimming pool! Can you swim?", "Ласкаво просимо до басейну! Ти вмієш плавати?"],
        ["You <b>must</b> take a shower before swimming.", "Перед плаванням треба прийняти душ."],
        ["You <b>must</b> wear a swimming cap.", "Обов'язково вдягни шапочку."],
        ["You <b>mustn't</b> run near the pool.", "Біля басейну не можна бігати."],
        ["You <b>mustn't</b> eat in the water.", "У воді не можна їсти."],
        ["Children <b>can't</b> swim in the deep part without an adult.", "Діти не можуть плавати на глибині без дорослого."],
        ["<b>Can</b> I jump? — Yes, you <b>can</b>, but be careful!", "Можна стрибнути? — Так, але обережно!"]
      ] },
    words: [
      ["rule", "правило"], ["allowed", "дозволено"], ["dangerous", "небезпечний"], ["helmet", "шолом"], ["careful", "обережний"],
      ["quiet", "тихий"], ["forget", "забувати"], ["remember", "пам'ятати"], ["ill", "хворий"], ["try", "намагатися, пробувати"]
    ]
  });

  w("skills/mod.json", { topic: "mod", title: "Модальні дієслова", skills: [
    { id: "mod.can", title: "can / can't",
      rule: "can — вмію / можу / можна; can't — не вмію / не можу. Can I…? — Yes, you can.",
      worked: { p: "Penguins ___ fly.", steps: [
        "Пінгвіни вміють літати? Ні.",
        "Не вміють → <b>can't</b>.",
        "Відповідь: Penguins <b>can't</b> fly."] },
      alt: `<p>can = «вмію / можу», а can't = «не вмію / не можу». Одне слово — для всіх: I can, she can, they can.</p>
        <p>Питання: просто постав can на початок — <b>Can</b> you swim? Відповідь: Yes, I <b>can</b>.</p>`,
      items: [
        ch("I ___ swim very well.", ["can", "cans", "can to"], "can", ["can однакове для всіх.", "Без -s, без to."], "I <b>can</b> swim.", { "cans": "can — без -s: <b>can</b>.", "can to": "Після can — без to." }),
        ch("My little brother ___ read yet.", ["can't", "doesn't can"], "can't", ["Ще не вміє.", "Заперечення — can't."], "<b>can't</b> read.", { "doesn't can": "Заперечення: <b>can't</b>, без doesn't." }),
        ch("___ I open the window?", ["Can", "Do"], "Can", ["Просимо дозволу.", "Can на початок."], "<b>Can</b> I…?", { "Do": "Дозвіл питаємо з <b>Can</b> I…?" }),
        inp("Впиши can або can't", "Penguins ___ fly.", ["can't", "cannot"], ["Чи літають пінгвіни?", "Ні → can't."], "<b>can't</b> fly.", { "can": "Пінгвіни не літають: <b>can't</b>." }),
        inp("Впиши can або can't", "Birds ___ fly.", ["can"], ["Чи літають птахи?", "Так → can."], "Birds <b>can</b> fly.", { "can't": "Птахи вміють літати: <b>can</b>." }),
        inp("Впиши can або can't", "Sorry, I ___ come to your party. I'm ill.", ["can't", "cannot"], ["Хвора — не зможу.", "can't."], "<b>can't</b> come.", { "can": "Я хвора — не зможу: <b>can't</b>." }),
        inp("Впиши коротку відповідь", "Can you ride a bike? — Yes, I ___.", ["can"], ["Питали з Can.", "Yes, I can."], "Yes, I <b>can</b>.", { "do": "Питали з Can: Yes, I <b>can</b>.", "ride": "Коротка відповідь: Yes, I <b>can</b>." }),
        inp("Впиши коротку відповідь", "Can your sister swim? — No, she ___.", ["can't", "cannot"], ["Питали з Can, «ні».", "can't."], "No, she <b>can't</b>.", { "doesn't": "Питали з Can: No, she <b>can't</b>." }),
        fix("She cans play the piano.", 1, "She can play the piano.", ["can однакове для всіх.", "Без -s."], "<b>can</b> — без -s."),
        ord("«Можна мені трохи води?»", ["have", "Can", "some", "I", "water"], ["can i have some water"], ["Can → I → have → що?", "Can → I → have → some water."], "<b>Can I have some water?</b>", "?"),
        dict("I can't find my keys.", [DH, "Заперечення — can't."], "<b>can't</b> find.", { "I don't can find my keys.": "Заперечення: <b>can't</b>, без don't." })
      ] },

    { id: "mod.must", title: "must / mustn't",
      rule: "must — треба, обов'язково; mustn't — не можна, заборонено.",
      worked: { p: "You ___ swim here. It's dangerous!", steps: [
        "Небезпечно — значить, плавати <b>заборонено</b>.",
        "Заборона → <b>mustn't</b>.",
        "Відповідь: You <b>mustn't</b> swim here."] },
      alt: `<p>Уяви дорожні знаки:</p>
        <p>🟦 must — «обов'язково» (пристебнись, вдягни шолом)<br>⛔ mustn't — «заборонено» (не бігай, не їж тут)</p>`,
      items: [
        ch("You ___ wear a helmet when you ride a bike.", ["must", "mustn't"], "must", ["Шолом — це обов'язково.", "must."], "<b>must</b> wear.", { "mustn't": "Шолом — обов'язково: <b>must</b>." }),
        ch("You ___ use your phone during the test.", ["mustn't", "must"], "mustn't", ["На контрольній телефон…", "заборонено → mustn't."], "<b>mustn't</b> use.", { "must": "Телефон на контрольній заборонений: <b>mustn't</b>." }),
        ch("We ___ be late for school.", ["mustn't", "must"], "mustn't", ["Запізнюватися…", "не можна → mustn't."], "<b>mustn't</b> be late.", { "must": "Запізнюватися не можна: <b>mustn't</b>." }),
        inp("Впиши must або mustn't", "You ___ brush your teeth twice a day.", ["must"], ["Це обов'язково.", "must."], "<b>must</b>.", { "mustn't": "Чистити зуби — обов'язково: <b>must</b>." }),
        inp("Впиши must або mustn't", "You ___ swim here. It's dangerous!", ["mustn't", "must not"], ["Небезпечно.", "Заборона → mustn't."], "<b>mustn't</b>.", { "must": "Небезпечно — заборонено: <b>mustn't</b>." }),
        inp("Впиши must або mustn't", "Pupils ___ run in the corridor.", ["mustn't", "must not"], ["Бігати в коридорі…", "не можна."], "<b>mustn't</b> run.", { "must": "Бігати в коридорі не можна: <b>mustn't</b>." }),
        inp("Впиши must або mustn't", "I ___ do my homework before dinner.", ["must"], ["Треба зробити.", "must."], "<b>must</b> do.", { "mustn't": "Уроки — треба: <b>must</b>." }),
        fix("You mustn't to talk in the library.", 2, "You mustn't talk in the library.", ["Після mustn't…", "…без to."], "mustn't <b>talk</b> — без to."),
        dict("You must listen to the teacher.", [DH, "must + перша форма."], "<b>must listen</b>.", { "You must to listen to the teacher.": "Після must — без to." })
      ] },

    { id: "mod.form", title: "can / must + перша форма (без to, без -s)",
      rule: "can / must + перша форма для всіх. Без -s, без to, питання без do: Can you…?",
      worked: { p: "My dad can ___ very tasty pizza. (cook)", steps: [
        "Після <b>can</b> — перша форма.",
        "Без -s (хоч і dad), без to.",
        "Відповідь: My dad can <b>cook</b> very tasty pizza."] },
      alt: `<p>can і must — «сильні» слова: вони самі роблять усю роботу, тому дієслово після них лишається «голим»:</p>
        <p>she can <b>sing</b> (не sings), he must <b>go</b> (не to go), <b>Can</b> you…? (не Do you can…?)</p>`,
      items: [
        ch("He can ___ English well.", ["speak", "speaks", "to speak"], "speak", ["Після can…", "…перша форма."], "can <b>speak</b>.", { "speaks": "Після can — без -s: <b>speak</b>.", "to speak": "Після can — без to: <b>speak</b>." }),
        ch("She must ___ her room.", ["clean", "cleans", "to clean"], "clean", ["Після must…", "…перша форма."], "must <b>clean</b>.", { "cleans": "Після must — без -s: <b>clean</b>.", "to clean": "Після must — без to: <b>clean</b>." }),
        ch("Яке питання правильне?", ["Can you help me?", "Do you can help me?", "Can you to help me?"], "Can you help me?", ["Питання з can…", "…без do і без to."], "<b>Can you help</b> me?", { "Do you can help me?": "Питання з can — без do: <b>Can you</b>…?", "Can you to help me?": "Після can — без to." }),
        inp("Впиши дієслово", "My dad can ___ very tasty pizza. (cook)", ["cook"], ["Після can — перша форма.", "Без -s."], "can <b>cook</b>.", { "cooks": "Після can — без -s: <b>cook</b>.", "to cook": "Після can — без to: <b>cook</b>." }),
        inp("Впиши дієслово", "Tom must ___ to the doctor. (go)", ["go"], ["Після must — перша форма.", "Без -es."], "must <b>go</b>.", { "goes": "Після must — без -es: <b>go</b>.", "to go": "Після must — без to: <b>go</b>." }),
        fix("My sister can sings very well.", 3, "My sister can sing very well.", ["Подивись на дієслово після can.", "Без -s."], "can <b>sing</b>."),
        fix("Do you can swim?", 0, "Can you swim?", ["Питання з can…", "…без do."], "<b>Can</b> you swim?"),
        dict("She can speak three languages.", [DH, "can + перша форма."], "can <b>speak</b>.", { "She can speaks three languages.": "Після can — без -s: <b>speak</b>.", "She cans speak three languages.": "can — без -s." })
      ] }
  ] });

  /* ===================== PAST CONTINUOUS ===================== */
  w("lessons/l12.json", {
    id: "l12", title: "Past Continuous",
    skillFiles: ["skills/pastc.json"],
    skills: ["pastc.form", "pastc.negq", "pastc.when"],
    practice: { perSkill: 4 },
    test: { plan: { "pastc.form": 3, "pastc.negq": 2, "pastc.when": 3 }, pass: 80 },
    explain: [
      { e: "🎬", h: "Що відбувалось у той момент",
        html: `<p>Past Continuous — «кадр з відео» в минулому: дія <b>тривала</b> в певний момент.</p>
        <div class="rule-box"><b>was / were</b> + дієслово з <b>-ing</b></div>
        <table class="t"><tr><td>I / he / she / it</td><td><b>was</b> reading</td></tr><tr><td>you / we / they</td><td><b>were</b> reading</td></tr></table>
        ${say("At 8 o'clock yesterday I was having breakfast.", "Учора о восьмій я снідала.", "At 8 o'clock yesterday I <b>was having</b> breakfast.")}
        <div class="tip">🔎 Підказки: at 5 o'clock yesterday, at this time yesterday, at that moment, when, while.</div>` },
      { e: "❓", h: "Заперечення і питання",
        html: `${say("I wasn't sleeping.", "Я не спала.", "I <b>wasn't</b> sleeping.")}
        ${say("Were you watching TV at 8? Yes, I was.", "Ти дивилась телевізор о восьмій? — Так.", "<b>Were</b> you watching TV at 8? — Yes, I <b>was</b>.")}
        ${say("What were you doing?", "Що ти робила?", "What <b>were</b> you <b>doing</b>?")}
        <div class="tip">⚠️ Без did: <s>Did you sleeping?</s> → <b>Were</b> you sleeping?</div>` },
      { e: "⚡", h: "Довга дія + коротка дія",
        html: `<p>Довга дія (тло) — Past Continuous. Коротка, яка її перервала — Past Simple.</p>
        ${say("I was having a shower when the phone rang.", "Я була в душі, коли задзвонив телефон.", "I <b>was having</b> a shower when the phone <b>rang</b>.")}
        ${say("While Mum was cooking, Dad was reading.", "Поки мама готувала, тато читав.", "While Mum <b>was cooking</b>, Dad <b>was reading</b>.")}
        <p class="muted">while — «поки» (дві довгі дії разом); when — «коли» (часто перед короткою дією).</p>` }
    ],
    examples: { title: "Гроза",
      question: { q: "чому «we <b>were walking</b>», але «it <b>started</b>»?", a: "Ми йшли довго (тло) — Past Continuous. Дощ почався раптом — коротка дія, Past Simple." },
      items: [
        ["Yesterday at five o'clock we <b>were walking</b> in the park.", "Учора о п'ятій ми гуляли в парку."],
        ["The sun <b>was shining</b> and the birds <b>were singing</b>.", "Світило сонце, співали птахи."],
        ["Suddenly it <b>started</b> to rain.", "Раптом почався дощ."],
        ["While we <b>were running</b> home, we <b>saw</b> a rainbow!", "Поки ми бігли додому, побачили веселку!"],
        ["When we <b>got</b> home, Mum <b>was making</b> hot tea.", "Коли ми прийшли, мама заварювала гарячий чай."],
        ["<b>Were</b> you <b>sleeping</b> during the storm? — No, I <b>wasn't</b>!", "Ти спала під час грози? — Ні!"]
      ] },
    words: [
      ["when", "коли"], ["while", "поки"], ["suddenly", "раптом"], ["at that moment", "у той момент"], ["storm", "гроза, буря"],
      ["rainbow", "веселка"], ["shine", "світити"], ["noise", "шум"], ["scared", "наляканий"], ["fall", "падати"]
    ]
  });

  const PC = "Впиши was / were + дієслово з -ing";
  w("skills/pastc.json", { topic: "pastc", title: "Past Continuous", skills: [
    { id: "pastc.form", title: "was / were + -ing",
      rule: "I / he / she / it → was + -ing; you / we / they → were + -ing.",
      worked: { p: "At 5 pm yesterday she ___ TV. (watch)", steps: [
        "О 5-й учора — дія була <b>в процесі</b>.",
        "she → <b>was</b>.",
        "+ дієслово з -ing: <b>watching</b>.",
        "Відповідь: she <b>was watching</b> TV."] },
      alt: `<p>Це Present Continuous, «перенесений у минуле»: am / is → <b>was</b>, are → <b>were</b>.</p>
        <p>I am reading → I <b>was</b> reading. They are playing → they <b>were</b> playing.</p>`,
      items: [
        ch("At 8 o'clock yesterday I ___ breakfast.", ["was having", "had", "am having"], "was having", ["О 8-й — у процесі.", "was + -ing."], "<b>was having</b>.", { "had": "О 8-й дія тривала: <b>was having</b>.", "am having": "yesterday — минуле: <b>was having</b>." }),
        ch("They ___ football when it started to rain.", ["were playing", "was playing", "played"], "were playing", ["Тривала дія, яку перервав дощ.", "they → were + -ing."], "<b>were playing</b>.", { "was playing": "they → <b>were</b>.", "played": "Гра тривала, коли почався дощ: <b>were playing</b>." }),
        inp(PC, "At 5 pm yesterday she ___ TV. (watch)", ["was watching"], ["she → was.", "+ watching."], "<b>was watching</b>.", { "watched": "О 5-й дія була в процесі: <b>was watching</b>.", "were watching": "she → <b>was</b>.", "is watching": "yesterday — минуле: <b>was watching</b>." }),
        inp(PC, "We ___ dinner at 7 o'clock last night. (cook)", ["were cooking"], ["we → were.", "+ cooking."], "<b>were cooking</b>.", { "was cooking": "we → <b>were</b>.", "cooked": "О 7-й дія була в процесі: <b>were cooking</b>." }),
        inp(PC, "What were you doing at 10 pm? — I ___. (sleep)", ["was sleeping"], ["I → was.", "+ sleeping."], "<b>was sleeping</b>.", { "slept": "Питали «що робила о 10-й» — <b>was sleeping</b>.", "were sleeping": "I → <b>was</b>." }),
        inp(PC, "When I woke up, it ___. (snow)", ["was snowing"], ["Сніг уже йшов, коли я прокинулась.", "it → was + snowing."], "<b>was snowing</b>.", { "snowed": "Сніг тривав, коли я прокинулась: <b>was snowing</b>.", "were snowing": "it → <b>was</b>." }),
        inp(PC, "At this time yesterday my parents ___. (work)", ["were working"], ["parents → were.", "+ working."], "<b>were working</b>.", { "was working": "my parents — вони: <b>were</b>.", "worked": "«У цей час учора» — у процесі: <b>were working</b>." }),
        fix("I were reading a book at 9 o'clock.", 1, "I was reading a book at 9 o'clock.", ["I → ?", "was."], "I → <b>was</b>."),
        fix("They was swimming when I saw them.", 1, "They were swimming when I saw them.", ["They → ?", "were."], "they → <b>were</b>."),
        dict("She was listening to music.", [DH, "she → was + -ing."], "<b>was listening</b>.", { "She were listening to music.": "she → <b>was</b>." }),
        ord("«О шостій я робила уроки».", ["was", "At", "six", "I", "doing", "my", "homework"], ["at six i was doing my homework", "i was doing my homework at six"], ["Коли → хто → was → -ing → що.", "At six → I → was → doing → …"], "<b>At six I was doing my homework.</b>")
      ] },

    { id: "pastc.negq", title: "wasn't / weren't, Was / Were…?",
      rule: "wasn't / weren't + -ing; питання: Was / Were + хто + -ing? Відповідь: Yes, I was. / No, they weren't.",
      worked: { p: "Tom ___ his homework at 7. (not do)", steps: [
        "Tom = he → was → <b>wasn't</b>.",
        "+ дієслово з -ing: <b>doing</b>.",
        "Відповідь: Tom <b>wasn't doing</b> his homework at 7."] },
      alt: `<p>Усе як з was / were: «не» — wasn't / weren't, питання — Was / Were наперед. did тут не потрібен.</p>
        <p>She was sleeping → She <b>wasn't</b> sleeping → <b>Was</b> she sleeping?</p>`,
      items: [
        ch("I ___ sleeping when you called.", ["wasn't", "weren't", "didn't"], "wasn't", ["I → was.", "Заперечення → wasn't."], "<b>wasn't</b> sleeping.", { "weren't": "З I — <b>wasn't</b>.", "didn't": "Тут помічник was: <b>wasn't</b> sleeping." }),
        ch("___ you watching TV at 8 pm?", ["Were", "Was", "Did"], "Were", ["you → were.", "Питання → Were на початок."], "<b>Were</b> you watching…?", { "Was": "you → <b>Were</b>.", "Did": "Тут помічник were: <b>Were</b> you watching?" }),
        ch("Was she cooking? — Yes, she ___.", ["was", "did", "were"], "was", ["Питали з Was.", "Відповідь тим самим словом."], "Yes, she <b>was</b>.", { "did": "Питали з Was: Yes, she <b>was</b>.", "were": "she → <b>was</b>." }),
        inp("Впиши заперечення з дієсловом", "We ___ at that moment. (not listen)", ["weren't listening", "were not listening"], ["we → were → weren't.", "+ listening."], "<b>weren't listening</b>.", { "didn't listening": "Тут помічник were: <b>weren't</b> listening.", "wasn't listening": "we → <b>weren't</b>.", "weren't listen": "Не забудь -ing: <b>listening</b>." }),
        inp("Впиши заперечення з дієсловом", "Tom ___ his homework at 7. (not do)", ["wasn't doing", "was not doing"], ["Tom → was → wasn't.", "+ doing."], "<b>wasn't doing</b>.", { "didn't doing": "Тут помічник was: <b>wasn't</b> doing.", "weren't doing": "Tom = he → <b>wasn't</b>." }),
        inp("Впиши Was або Were", "___ it raining when you left?", ["Was"], ["it → was.", "Was на початок."], "<b>Was</b> it raining?", { "Were": "it → <b>Was</b>.", "Did": "Тут помічник was: <b>Was</b> it raining?" }),
        inp("Впиши коротку відповідь", "Were they playing chess? — No, they ___.", ["weren't", "were not"], ["Питали з Were, «ні».", "weren't."], "No, they <b>weren't</b>.", { "didn't": "Питали з Were: No, they <b>weren't</b>.", "wasn't": "they → <b>weren't</b>." }),
        fix("Did you sleeping at 11 o'clock?", 0, "Were you sleeping at 11 o'clock?", ["Питання з -ing…", "…з Were, без Did."], "<b>Were</b> you sleeping?"),
        dict("What were you doing at six?", [DH, "you → were."], "What <b>were</b> you doing?", { "What was you doing at six?": "you → <b>were</b>." })
      ] },

    { id: "pastc.when", title: "Довга дія + коротка: when / while",
      rule: "Довга дія (тло) — was / were + -ing; коротка дія, що її перервала — Past Simple.",
      worked: { p: "We were watching a film when the lights ___ off. (go)", steps: [
        "Довга дія: <b>were watching</b> (тло).",
        "Світло вимкнулось раптом — коротка дія → Past Simple.",
        "go → <b>went</b>.",
        "Відповідь: when the lights <b>went</b> off."] },
      alt: `<p>Уяви кіно: <b>довга сцена</b> (ми дивились фільм — was / were + -ing), і раптом <b>спалах</b> (вимкнулось світло — Past Simple).</p>
        <p>Довге — Continuous, коротке-раптове — Simple.</p>`,
      items: [
        ch("I ___ a shower when the phone rang.", ["was having", "had"], "was having", ["Душ — довга дія.", "Тло → was + -ing."], "<b>was having</b> (тло).", { "had": "Душ тривав, коли задзвонив телефон: <b>was having</b>." }),
        ch("When I was walking home, I ___ my friend.", ["met", "was meeting"], "met", ["Зустріч — коротка дія.", "Past Simple."], "Коротка дія → <b>met</b>.", { "was meeting": "Зустріч — коротка дія: <b>met</b>." }),
        ch("While Mum ___ dinner, Dad was reading.", ["was cooking", "cooked"], "was cooking", ["While — дві довгі дії одночасно.", "was + -ing."], "<b>was cooking</b>.", { "cooked": "While — обидві дії тривали: <b>was cooking</b>." }),
        ch("Яке речення правильне?", ["I was sleeping when you called.", "I slept when you were calling."], "I was sleeping when you called.", ["Що тривало, а що сталося раптом?", "Сон — довгий, дзвінок — короткий."], "Сон — тло (<b>was sleeping</b>), дзвінок — коротка дія (<b>called</b>).", { "I slept when you were calling.": "Сон — довга дія (was sleeping), дзвінок — коротка (called)." }),
        inp("Впиши дієслово в Past Simple або Past Continuous", "We were watching a film when the lights ___ off. (go)", ["went"], ["Світло вимкнулось раптом.", "Коротка дія → went."], "<b>went</b> off.", { "were going": "Світло вимкнулось раптом — коротка дія: <b>went</b>.", "goed": "go — неправильне: <b>went</b>." }),
        inp("Впиши дієслово в Past Simple або Past Continuous", "She ___ when she fell. (run)", ["was running"], ["Біг тривав.", "Тло → was + -ing."], "<b>was running</b>.", { "ran": "Біг тривав, коли вона впала: <b>was running</b>." }),
        inp("Впиши дієслово в Past Simple або Past Continuous", "When you called, I ___ a bath. (take)", ["was taking"], ["Ванна тривала.", "was + -ing."], "<b>was taking</b>.", { "took": "Ванна тривала, коли ти подзвонила: <b>was taking</b>.", "was takeing": "Німа -e відпадає: <b>taking</b>." }),
        inp("Впиши дієслово в Past Simple або Past Continuous", "While I was doing my homework, my brother ___ games. (play)", ["was playing"], ["While — обидві тривали.", "was + -ing."], "<b>was playing</b>.", { "played": "While — обидві дії тривали одночасно: <b>was playing</b>." }),
        dict("It was raining when we left school.", [DH, "Дощ — тло, вийшли — коротка дія."], "<b>was raining</b> … <b>left</b>.", { "It rained when we left school.": "Дощ тривав — <b>was raining</b>." })
      ] }
  ] });

  /* ===================== PRESENT PERFECT ===================== */
  const v3 = [["be", "been"], ["go", "gone"], ["see", "seen"], ["do", "done"], ["eat", "eaten"], ["write", "written"], ["take", "taken"], ["give", "given"],
    ["break", "broken"], ["buy", "bought"], ["make", "made"], ["have", "had"], ["come", "come"], ["swim", "swum"], ["drink", "drunk"], ["sing", "sung"],
    ["find", "found"], ["lose", "lost"], ["read", "read"], ["meet", "met"]];
  w("lessons/l13.json", {
    id: "l13", title: "Present Perfect",
    skillFiles: ["skills/pp.json"],
    skills: ["pp.form", "pp.ever", "pp.just"],
    practice: { perSkill: 4 },
    test: { plan: { "pp.form": 3, "pp.ever": 3, "pp.just": 2 }, pass: 80 },
    explain: [
      { e: "✅", h: "Вже зробила — і результат зараз",
        html: `<p>Present Perfect — про минулу дію, важливу <b>зараз</b>: результат видно, а коли саме — не важливо.</p>
        <div class="rule-box"><b>have / has</b> + третя форма дієслова</div>
        ${say("I have finished my homework.", "Я зробила домашнє (і тепер вільна).", "I <b>have finished</b> my homework.")}
        ${say("She has lost her keys.", "Вона загубила ключі (і зараз їх немає).", "She <b>has lost</b> her keys.")}
        <table class="t"><tr><td>I / you / we / they</td><td><b>have</b> (I've)</td></tr><tr><td>he / she / it</td><td><b>has</b> (she's)</td></tr></table>` },
      { e: "3️⃣", h: "Третя форма",
        html: `<p>Правильні дієслова: третя форма = -ed (played, cleaned, finished). Неправильні — своя:</p>
        <table class="t">${v3.map(r => `<tr><td>${r[0]}</td><td><b>${r[1]}</b></td><td style="padding:4px 0;width:44px"><button class="say round" data-say="${r[0]}, ${r[1]}">🔊</button></td></tr>`).join("")}</table>` },
      { e: "🌍", h: "ever / never — досвід",
        html: `${say("Have you ever been to London? No, I haven't.", "Ти колись була в Лондоні? — Ні.", "<b>Have</b> you <b>ever been</b> to London? — No, I <b>haven't</b>.")}
        ${say("I have never eaten sushi.", "Я ніколи не їла суші.", "I have <b>never</b> eaten sushi.")}
        <p class="muted">ever — «колись» (у питаннях), never — «ніколи». Стоять між have і третьою формою.</p>` },
      { e: "⏱️", h: "just / already / yet",
        html: `<table class="t"><tr><td><b>just</b></td><td>щойно</td><td>I have <b>just</b> finished.</td></tr>
        <tr><td><b>already</b></td><td>вже</td><td>She has <b>already</b> left.</td></tr>
        <tr><td><b>yet</b></td><td>ще не / вже? (в кінці)</td><td>I haven't finished <b>yet</b>. Have you finished <b>yet</b>?</td></tr></table>` }
    ],
    examples: { title: "Перед поїздкою",
      question: { q: "чому «Have you packed <b>yet</b>?», а «I've <b>already</b> packed»?", a: "yet — у питаннях і запереченнях, у кінці речення. already — у ствердженні, між have і третьою формою." },
      items: [
        ["Mum: <b>Have</b> you <b>packed</b> your suitcase <b>yet</b>?", "Мама: Ти вже спакувала валізу?"],
        ["Yes, I<b>'ve already packed</b> it!", "Так, уже спакувала!"],
        ["Dad <b>has just bought</b> the tickets.", "Тато щойно купив квитки."],
        ["We <b>have never been</b> to the sea in winter.", "Ми ніколи не були на морі взимку."],
        ["<b>Have</b> you <b>ever seen</b> the sea in winter?", "Ти колись бачила зимове море?"],
        ["Oh no! I<b>'ve lost</b> my phone! — No, you <b>haven't</b>. It's in your hand!", "Ой ні! Я загубила телефон! — Ні. Він у тебе в руці!"]
      ] },
    words: [
      ["ever", "коли-небудь"], ["never", "ніколи"], ["just", "щойно"], ["already", "вже"], ["yet", "ще (не); вже (у питанні)"],
      ["recently", "нещодавно"], ["famous", "відомий"], ["pack", "пакувати"], ["lose", "губити"], ["finish", "закінчувати"]
    ]
  });

  const PP = "Впиши have / has + третю форму";
  w("skills/pp.json", { topic: "pp", title: "Present Perfect", skills: [
    { id: "pp.form", title: "have / has + третя форма",
      rule: "I / you / we / they → have; he / she / it → has; + третя форма (cleaned, seen, done, written).",
      worked: { p: "She ___ a letter to her friend. (write)", steps: [
        "she → <b>has</b>.",
        "write — неправильне: write – wrote – <b>written</b>.",
        "Відповідь: She <b>has written</b> a letter."] },
      alt: `<p>Дві цеглинки: <b>have / has</b> + <b>третя форма</b>.</p>
        <p>Правильні — як минуле (-ed): has clean<b>ed</b>. Неправильні — з таблиці: seen, done, eaten, written, broken.</p>
        <p class="muted">Не плутай другу і третю: I <b>saw</b> (вчора) ↔ I have <b>seen</b>.</p>`,
      items: [
        ch("I ___ finished my homework.", ["have", "has", "am"], "have", ["I → have.", "+ третя форма."], "I <b>have</b> finished.", { "has": "З I — <b>have</b>.", "am": "Present Perfect — з have: I <b>have</b> finished." }),
        ch("She ___ lost her keys.", ["has", "have"], "has", ["she → has.", "+ третя форма."], "she <b>has</b> lost.", { "have": "she → <b>has</b>." }),
        ch("We have ___ this film.", ["seen", "saw", "see"], "seen", ["Після have — третя форма.", "see – saw – seen."], "have <b>seen</b>.", { "saw": "Після have — третя форма: <b>seen</b>.", "see": "Після have — третя форма: <b>seen</b>." }),
        inp(PP, "Tom ___ his room. (clean)", ["has cleaned", "'s cleaned"], ["Tom → has.", "clean — правильне: + ed."], "<b>has cleaned</b>.", { "have cleaned": "Tom = he → <b>has</b>.", "cleaned": "Потрібно has: <b>has cleaned</b>." }),
        inp(PP, "Oh no! I ___ my leg! (break)", ["have broken", "'ve broken"], ["I → have.", "break – broke – broken."], "<b>have broken</b>.", { "have broke": "Третя форма: <b>broken</b>.", "has broken": "З I — <b>have</b>." }, S),
        inp(PP, "They ___ a new car. (buy)", ["have bought", "'ve bought"], ["they → have.", "buy – bought – bought."], "<b>have bought</b>.", { "has bought": "they → <b>have</b>.", "have buyed": "buy — неправильне: <b>bought</b>." }, S),
        inp(PP, "She ___ a letter to her friend. (write)", ["has written", "'s written"], ["she → has.", "write – wrote – written."], "<b>has written</b>.", { "has wrote": "Третя форма: <b>written</b>.", "have written": "she → <b>has</b>.", "has writen": "Подвоюємо t: <b>written</b>." }, S),
        inp(PP, "We ___ dinner. We aren't hungry. (eat)", ["have eaten", "'ve eaten"], ["we → have.", "eat – ate – eaten."], "<b>have eaten</b>.", { "have ate": "Третя форма: <b>eaten</b>.", "has eaten": "we → <b>have</b>." }, S),
        inp(PP, "Dad ___ home. (come)", ["has come", "'s come"], ["Dad → has.", "come – came – come."], "<b>has come</b>.", { "has came": "Третя форма — така сама, як перша: <b>come</b>.", "have come": "Dad = he → <b>has</b>." }, S),
        fix("She have done her homework.", 1, "She has done her homework.", ["she → ?", "has."], "she <b>has</b> done."),
        fix("I have saw this film.", 2, "I have seen this film.", ["Після have — третя форма.", "see – saw – seen."], "have <b>seen</b>."),
        dict("I have lost my phone.", [DH, "I → have + lost."], "I <b>have lost</b>.", { "I has lost my phone.": "З I — <b>have</b>." })
      ] },

    { id: "pp.ever", title: "ever / never — досвід",
      rule: "Have you ever + третя форма? — Yes, I have. / No, I haven't. I have never + третя форма.",
      worked: { p: "Have you ever ___ to Paris? (be)", steps: [
        "Питання про досвід: <b>Have you ever</b>…",
        "be — неправильне: be – was – <b>been</b>.",
        "Відповідь: Have you ever <b>been</b> to Paris?"] },
      alt: `<p>ever і never стоять <b>між</b> have і третьою формою, як у сендвічі:</p>
        <p>Have you <b>ever</b> seen…? · I have <b>never</b> seen…</p>
        <p class="muted">never вже означає «не», тому друге not не потрібне: <s>I haven't never</s>.</p>`,
      items: [
        ch("Have you ever ___ to Paris?", ["been", "was", "be"], "been", ["Після have — третя форма.", "be – was – been."], "<b>been</b>.", { "was": "Після have — третя форма: <b>been</b>.", "be": "Після have — третя форма: <b>been</b>." }),
        ch("I have ___ eaten sushi. I want to try it!", ["never", "ever"], "never", ["«Ніколи не їла».", "never."], "<b>never</b> eaten.", { "ever": "«Ніколи» — <b>never</b>; ever — «колись» у питаннях." }),
        ch("___ you ever seen a whale?", ["Have", "Did", "Are"], "Have", ["ever + третя форма seen.", "Have на початок."], "<b>Have</b> you ever seen…?", { "Did": "seen — третя форма, тож <b>Have</b> you…?", "Are": "Present Perfect — з <b>Have</b>." }),
        ch("Has she ever met a famous person? — No, she ___.", ["hasn't", "haven't", "didn't"], "hasn't", ["Питали з Has.", "she → hasn't."], "No, she <b>hasn't</b>.", { "haven't": "she → <b>hasn't</b>.", "didn't": "Питали з Has: No, she <b>hasn't</b>." }),
        inp("Впиши ever або never", "I have ___ ridden a horse. It's my dream!", ["never"], ["Мрія — значить, ще не каталась.", "never."], "<b>never</b> ridden.", { "ever": "«Ніколи не каталась» — <b>never</b>." }),
        inp("Впиши ever або never", "Have you ___ tried Chinese food?", ["ever"], ["Питання «колись?».", "ever."], "Have you <b>ever</b>…?", { "never": "У питанні «колись» — <b>ever</b>." }),
        inp("Впиши коротку відповідь", "Have you ever been to the sea? — Yes, I ___.", ["have"], ["Питали з Have.", "Yes, I have."], "Yes, I <b>have</b>.", { "did": "Питали з Have: Yes, I <b>have</b>.", "was": "Питали з Have: Yes, I <b>have</b>.", "has": "З I — <b>have</b>." }),
        fix("Have you ever saw a tiger?", 3, "Have you ever seen a tiger?", ["Після have…ever — третя форма.", "see – saw – seen."], "ever <b>seen</b>."),
        dict("I have never been to London.", [DH, "be → been."], "never <b>been</b>.", { "I have never was to London.": "Після have — третя форма: <b>been</b>." })
      ] },

    { id: "pp.just", title: "just / already / yet",
      rule: "just — щойно, already — вже (між have і третьою формою); yet — у питаннях і запереченнях, у кінці.",
      worked: { p: "I haven't seen this film ___.", steps: [
        "Речення із запереченням: <b>haven't</b>.",
        "У запереченнях «ще не» — <b>yet</b>, у кінці.",
        "Відповідь: I haven't seen this film <b>yet</b>."] },
      alt: `<p>Запам'ятай місця:</p>
        <p>have <b>just</b> / <b>already</b> + третя форма (посередині)<br>… <b>yet</b>. / … <b>yet</b>? (у самому кінці, тільки з not або в питанні)</p>`,
      items: [
        ch("I have ___ finished. Look!", ["just", "yet"], "just", ["Щойно закінчила.", "just."], "<b>just</b> finished.", { "yet": "yet — тільки в запереченнях і питаннях. «Щойно» — <b>just</b>." }),
        ch("Have you done your homework ___?", ["yet", "already"], "yet", ["Питання, в кінці.", "yet."], "…<b>yet</b>?", { "already": "У питанні в кінці — <b>yet</b>." }),
        ch("She has ___ read this book. She knows the end.", ["already", "yet"], "already", ["Вже прочитала (ствердження).", "already."], "<b>already</b> read.", { "yet": "У ствердженні — <b>already</b>." }),
        inp("Впиши just, already або yet", "I haven't seen this film ___.", ["yet"], ["Заперечення.", "yet у кінці."], "…<b>yet</b>.", { "already": "У запереченні — <b>yet</b>.", "just": "У запереченні — <b>yet</b>." }),
        inp("Впиши just, already або yet", "We have ___ eaten, thanks. We aren't hungry.", ["already", "just"], ["Ствердження: вже поїли.", "already або just."], "<b>already</b> / <b>just</b> eaten.", { "yet": "yet — у запереченнях і питаннях. Тут <b>already</b>." }),
        inp("Впиши just, already або yet", "The bus has ___ left! We're late!", ["just", "already"], ["Щойно поїхав.", "just."], "<b>just</b> left.", { "yet": "yet — у запереченнях і питаннях. Тут <b>just</b>." }),
        fix("I have yet finished my project.", 2, "I have already finished my project.", ["Це ствердження.", "yet → already."], "<b>already</b> finished."),
        fix("Have you finished yet your homework?", 3, "Have you finished your homework yet?", ["yet стоїть у самому кінці.", "Перенеси yet у кінець."], "…your homework <b>yet</b>?"),
        dict("She hasn't come home yet.", [DH, "Заперечення → yet."], "…<b>yet</b>.", { "She hasn't come home already.": "У запереченні — <b>yet</b>." })
      ] }
  ] });
};
