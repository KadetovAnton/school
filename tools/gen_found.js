// Основа 5–6 класу: to be (l17), have got (l18), чиє це: 's / this / these (l19), прийменники in / on / at (l20), much / many (l21)
const { say, inp, ch, fix, dict, ord, DH, S } = require("./lib.js");
module.exports = function (w) {
  const A = { apos: true };

  /* ===================== TO BE ===================== */
  w("lessons/l17.json", {
    id: "l17", title: "Дієслово to be: am / is / are",
    skillFiles: ["skills/be.json"],
    skills: ["be.form", "be.neg", "be.q"],
    practice: { perSkill: 4 },
    test: { plan: { "be.form": 3, "be.neg": 2, "be.q": 3 }, pass: 80 },
    explain: [
      { e: "🙂", h: "am / is / are — «є», «бути»",
        html: `<p>Українською ми часто пропускаємо «є»: «Я учениця», «Вона вдома». Англійською це слово <b>обов'язкове</b>.</p>
        <table class="t"><tr><td>I</td><td><b>am</b></td><td class="muted">I'm</td></tr>
        <tr><td>he / she / it</td><td><b>is</b></td><td class="muted">she's, it's</td></tr>
        <tr><td>you / we / they</td><td><b>are</b></td><td class="muted">we're, they're</td></tr></table>
        ${say("I am twelve. My brother is eight.", "Мені дванадцять. Моєму братові вісім.", "I <b>am</b> twelve. My brother <b>is</b> eight.")}
        <div class="tip">⚠️ <s>I twelve</s>, <s>She at home</s> — без am / is / are не можна.</div>` },
      { e: "🙅", h: "Заперечення: not",
        html: `<table class="t"><tr><td>I <b>am not</b></td><td class="muted">I'm not</td></tr>
        <tr><td>he / she / it <b>is not</b></td><td class="muted">isn't</td></tr>
        <tr><td>you / we / they <b>are not</b></td><td class="muted">aren't</td></tr></table>
        ${say("She isn't at home. We aren't late.", "Її немає вдома. Ми не запізнились.", "She <b>isn't</b> at home. We <b>aren't</b> late.")}
        <div class="tip">⚠️ «amn't» не буває: тільки I'm not / I am not.</div>` },
      { e: "❓", h: "Питання: am / is / are наперед",
        html: `${say("Are you ready? Yes, I am.", "Ти готова? — Так.", "<b>Are</b> you ready? — Yes, I <b>am</b>.")}
        ${say("Is it your pen? No, it isn't.", "Це твоя ручка? — Ні.", "<b>Is</b> it your pen? — No, it <b>isn't</b>.")}
        ${say("How old are you? Where is my bag?", "Скільки тобі років? Де моя сумка?", "How old <b>are</b> you? Where <b>is</b> my bag?")}
        <div class="tip">⚠️ Тут не потрібні do / does: <s>Do you ready?</s> → <b>Are</b> you ready?</div>` }
    ],
    examples: { title: "Знайомтеся!",
      question: { q: "чому «My parents <b>are</b>», а «My dog <b>is</b>»?", a: "Батьків двоє (they) — are. Собака один (it) — is." },
      items: [
        ["Hi! I <b>am</b> Anya. I<b>'m</b> twelve.", "Привіт! Я Аня. Мені дванадцять."],
        ["My parents <b>are</b> very kind.", "Мої батьки дуже добрі."],
        ["My brother Artem <b>is</b> eight. He <b>isn't</b> at school now.", "Моєму брату Артему вісім. Зараз він не в школі."],
        ["Our dog <b>is</b> big and funny.", "Наш собака великий і кумедний."],
        ["<b>Are</b> you my new classmate? — Yes, I <b>am</b>!", "Ти мій новий однокласник? — Так!"]
      ] },
    words: [
      ["kind", "добрий"], ["funny", "кумедний"], ["happy", "щасливий"], ["sad", "сумний"], ["hungry", "голодний"],
      ["ready", "готовий"], ["late", "запізнений; пізно"], ["at home", "вдома"], ["at school", "у школі"], ["years old", "років (про вік)"]
    ]
  });

  w("skills/be.json", { topic: "be", title: "Дієслово to be", skills: [
    { id: "be.form", title: "am / is / are",
      rule: "I → am; he / she / it → is; you / we / they → are.",
      worked: { p: "My parents ___ at work.", steps: [
        "Хто? <b>My parents</b> — двоє = they.",
        "they → <b>are</b>.",
        "Відповідь: My parents <b>are</b> at work."] },
      alt: `<p>Запам'ятай як три «пари»:</p><div class="rule-box" style="font-weight:800">I am · he / she / it is · you / we / they are</div>
        <p>Не знаєш, хто це? Заміни: my mum → she → is; my friends → they → are.</p>`,
      items: [
        ch("I ___ twelve years old.", ["am", "is", "are"], "am", ["Хто? I.", "I → am."], "I <b>am</b>.", { "is": "З I — <b>am</b>.", "are": "З I — <b>am</b>." }),
        ch("My mum ___ a doctor.", ["is", "am", "are"], "is", ["My mum = she.", "she → is."], "she → <b>is</b>.", { "are": "My mum — одна людина (she): <b>is</b>.", "am": "am — тільки з I." }),
        ch("We ___ friends.", ["are", "is", "am"], "are", ["We — «ми».", "we → are."], "we → <b>are</b>.", { "is": "we → <b>are</b>.", "am": "am — тільки з I." }),
        inp("Впиши am, is або are", "The cat ___ on the sofa.", ["is"], ["The cat = it.", "it → is."], "it → <b>is</b>.", { "are": "Кіт один (it): <b>is</b>.", "am": "am — тільки з I." }),
        inp("Впиши am, is або are", "My parents ___ at work.", ["are"], ["My parents = they.", "they → are."], "they → <b>are</b>.", { "is": "Батьків двоє (they): <b>are</b>." }),
        inp("Впиши am, is або are", "You ___ my best friend.", ["are"], ["you → ?", "you → are."], "you → <b>are</b>.", { "is": "З you завжди <b>are</b>." }),
        inp("Впиши am, is або are", "It ___ cold today.", ["is"], ["it → ?", "it → is."], "it → <b>is</b>.", { "are": "it → <b>is</b>." }),
        fix("She are my sister.", 1, "She is my sister.", ["She → ?", "is."], "she → <b>is</b>."),
        fix("I is hungry.", 1, "I am hungry.", ["I → ?", "am."], "I → <b>am</b>."),
        dict("They are in the garden.", [DH, "they → are."], "they → <b>are</b>.", { "They is in the garden.": "they → <b>are</b>.", "They in the garden.": "Не забувай are: They <b>are</b> in the garden." }),
        ord("«Мій брат — учень».", ["is", "My", "a", "brother", "pupil"], ["my brother is a pupil"], ["Хто → is → хто він.", "My brother → is → a pupil."], "<b>My brother is a pupil.</b>")
      ] },
    { id: "be.neg", title: "am not / isn't / aren't",
      rule: "I am not (I'm not); he / she / it isn't; you / we / they aren't.",
      worked: { p: "My friends ___ here.", steps: [
        "Хто? <b>My friends</b> = they → are.",
        "Заперечення: are + not = <b>aren't</b>.",
        "Відповідь: My friends <b>aren't</b> here."] },
      alt: `<p>Просто додай <b>not</b> після am / is / are:</p><p>I am → I <b>am not</b><br>she is → she <b>isn't</b><br>they are → they <b>aren't</b></p>`,
      items: [
        ch("I ___ tired.", ["am not", "isn't", "aren't"], "am not", ["I → am.", "am not."], "I <b>am not</b>.", { "isn't": "З I — <b>am not</b>.", "aren't": "З I — <b>am not</b>." }),
        ch("Tom ___ at school today.", ["isn't", "aren't", "am not"], "isn't", ["Tom = he.", "isn't."], "he → <b>isn't</b>.", { "aren't": "Tom — один (he): <b>isn't</b>.", "am not": "am — тільки з I." }),
        ch("They ___ from London.", ["aren't", "isn't", "am not"], "aren't", ["They — «вони».", "aren't."], "they → <b>aren't</b>.", { "isn't": "they → <b>aren't</b>.", "am not": "am — тільки з I." }),
        inp("Впиши am not, isn't або aren't", "The shop ___ open on Sunday.", ["isn't", "is not"], ["The shop = it.", "isn't."], "it → <b>isn't</b>.", { "aren't": "Магазин один: <b>isn't</b>.", "doesn't": "Тут помічник is: <b>isn't</b>." }),
        inp("Впиши am not, isn't або aren't", "We ___ late.", ["aren't", "are not"], ["We → are.", "aren't."], "we → <b>aren't</b>.", { "isn't": "we → <b>aren't</b>.", "don't": "Тут помічник are: <b>aren't</b>." }),
        inp("Впиши am not, isn't або aren't", "I ___ a teacher.", ["am not"], ["I → am.", "am not."], "I <b>am not</b>.", { "amn't": "amn't не буває: I <b>am not</b>.", "isn't": "З I — <b>am not</b>.", "don't": "Тут помічник am: I <b>am not</b>." }),
        fix("My friends isn't here.", 2, "My friends aren't here.", ["My friends = they.", "aren't."], "they → <b>aren't</b>."),
        fix("It aren't my bag.", 1, "It isn't my bag.", ["It → ?", "isn't."], "it → <b>isn't</b>."),
        dict("She isn't at home.", [DH, "she → isn't."], "she → <b>isn't</b>.", { "She aren't at home.": "she → <b>isn't</b>.", "She don't at home.": "Тут помічник is: <b>isn't</b>." })
      ] },
    { id: "be.q", title: "Am I…? Is she…? Are you…?",
      rule: "Am / Is / Are на початок: Are you ready? — Yes, I am. / No, I'm not.",
      worked: { p: "___ your sister twelve?", steps: [
        "Про кого? <b>your sister</b> = she.",
        "she → <b>Is</b> на початок.",
        "Відповідь: <b>Is</b> your sister twelve?"] },
      alt: `<p>Питання — це просто речення, де am / is / are <b>помінявся місцями</b>:</p><p>You are ready. → <b>Are</b> you ready?<br>It is your pen. → <b>Is</b> it your pen?</p>`,
      items: [
        ch("___ you ready?", ["Are", "Is", "Do"], "Are", ["you → ?", "Are."], "<b>Are</b> you…?", { "Is": "you → <b>Are</b>.", "Do": "Тут помічник are: <b>Are</b> you ready?" }),
        ch("___ your sister twelve?", ["Is", "Are", "Does"], "Is", ["your sister = she.", "Is."], "<b>Is</b> your sister…?", { "Are": "Сестра одна (she): <b>Is</b>.", "Does": "Тут помічник is: <b>Is</b> your sister…?" }),
        ch("Is it your pen? — Yes, it ___.", ["is", "does", "are"], "is", ["Питали з Is.", "Відповідь тим самим словом."], "Yes, it <b>is</b>.", { "does": "Питали з Is: Yes, it <b>is</b>.", "are": "it → <b>is</b>." }),
        inp("Впиши Am, Is або Are", "___ I late?", ["Am"], ["I → ?", "Am."], "<b>Am</b> I…?", { "Is": "З I — <b>Am</b>.", "Are": "З I — <b>Am</b>." }),
        inp("Впиши Am, Is або Are", "___ they your friends?", ["Are"], ["they → ?", "Are."], "<b>Are</b> they…?", { "Is": "they → <b>Are</b>.", "Do": "Тут помічник are: <b>Are</b> they…?" }),
        inp("Впиши коротку відповідь", "Are you hungry? — No, I ___.", ["am not", "'m not"], ["Питали з Are you.", "No, I'm not."], "No, I'<b>m not</b>.", { "amn't": "amn't не буває: No, I'<b>m not</b>.", "don't": "Питали з Are: No, I'<b>m not</b>.", "aren't": "З I — <b>am not</b>." }),
        inp("Впиши коротку відповідь", "Is Anna at school? — Yes, she ___.", ["is"], ["Питали з Is.", "Yes, she is."], "Yes, she <b>is</b>.", { "does": "Питали з Is: Yes, she <b>is</b>.", "are": "she → <b>is</b>." }),
        ord("«Скільки тобі років?»", ["old", "How", "you", "are"], ["how old are you"], ["How old → are → you?", "Дослівно: «Наскільки старий ти?»"], "<b>How old are you?</b>", "?"),
        fix("Is they at home?", 0, "Are they at home?", ["they → ?", "Are."], "<b>Are</b> they…?"),
        dict("Where are my keys?", [DH, "keys — багато → are."], "Where <b>are</b> my keys?", { "Where is my keys?": "keys — їх кілька: <b>are</b>." })
      ] }
  ] });

  /* ===================== HAVE GOT ===================== */
  w("lessons/l18.json", {
    id: "l18", title: "have got / has got",
    skillFiles: ["skills/hg.json"],
    skills: ["hg.form", "hg.neg", "hg.q"],
    practice: { perSkill: 3 },
    test: { plan: { "hg.form": 3, "hg.neg": 2, "hg.q": 3 }, pass: 80 },
    explain: [
      { e: "🎒", h: "«У мене є» — have got",
        html: `<table class="t"><tr><td>I / you / we / they</td><td><b>have got</b></td><td class="muted">I've got</td></tr>
        <tr><td>he / she / it</td><td><b>has got</b></td><td class="muted">she's got</td></tr></table>
        ${say("I have got a dog. My sister has got a cat.", "У мене є собака. У сестри є кіт.", "I <b>have got</b> a dog. My sister <b>has got</b> a cat.")}
        <div class="tip">💡 Українською «у мене є», а англійською дослівно «я маю».</div>` },
      { e: "🙅", h: "«Немає»: haven't got / hasn't got",
        html: `${say("We haven't got a car. He hasn't got a phone.", "У нас немає машини. У нього немає телефону.", "We <b>haven't got</b> a car. He <b>hasn't got</b> a phone.")}
        <div class="tip">⚠️ <s>I don't have got</s> — так не кажуть.</div>` },
      { e: "❓", h: "Питання: Have / Has … got?",
        html: `${say("Have you got a pet? Yes, I have.", "У тебе є домашня тварина? — Так.", "<b>Have</b> you <b>got</b> a pet? — Yes, I <b>have</b>.")}
        ${say("Has your dad got a car? No, he hasn't.", "У твого тата є машина? — Ні.", "<b>Has</b> your dad <b>got</b> a car? — No, he <b>hasn't</b>.")}` }
    ],
    examples: { title: "Мій портрет",
      question: { q: "чому «I <b>have</b> got», а «Anna <b>has</b> got»?", a: "З I — have. Anna = she, а з he / she / it — has." },
      items: [
        ["I<b>'ve got</b> long brown hair and blue eyes.", "У мене довге каштанове волосся і блакитні очі."],
        ["My best friend <b>has got</b> short hair.", "У моєї найкращої подруги коротке волосся."],
        ["We <b>haven't got</b> a dog, but we<b>'ve got</b> two cats.", "Собаки в нас немає, зате є два коти."],
        ["My brother <b>has got</b> a new bike.", "У брата новий велосипед."],
        ["<b>Have</b> you <b>got</b> any brothers or sisters?", "У тебе є брати чи сестри?"]
      ] },
    words: [
      ["hair", "волосся"], ["eyes", "очі"], ["long", "довгий"], ["short", "короткий"], ["fair hair", "світле волосся"],
      ["dark hair", "темне волосся"], ["pet", "домашній улюбленець"], ["glasses", "окуляри"], ["phone", "телефон"], ["bike", "велосипед"]
    ]
  });

  w("skills/hg.json", { topic: "hg", title: "have got", skills: [
    { id: "hg.form", title: "have got / has got",
      rule: "I / you / we / they → have got; he / she / it → has got.",
      worked: { p: "Tom ___ two brothers.", steps: ["Tom = <b>he</b>.", "he → <b>has got</b>.", "Відповідь: Tom <b>has got</b> two brothers."] },
      alt: `<p>Як з Present Simple: для he / she / it «хвостик» з'являється і тут — ha<b>s</b> got.</p><p>I have got → she ha<b>s</b> got.</p>`,
      items: [
        ch("I ___ a dog.", ["have got", "has got"], "have got", ["Хто? I.", "have got."], "I <b>have got</b>.", { "has got": "З I — <b>have got</b>." }),
        ch("My sister ___ long hair.", ["has got", "have got"], "has got", ["My sister = she.", "has got."], "she → <b>has got</b>.", { "have got": "Сестра — she: <b>has got</b>." }),
        ch("We ___ a big garden.", ["have got", "has got"], "have got", ["We — «ми».", "have got."], "we → <b>have got</b>.", { "has got": "we → <b>have got</b>." }),
        inp("Впиши have got або has got", "Tom ___ two brothers.", ["has got", "'s got"], ["Tom = he.", "has got."], "<b>has got</b>.", { "have got": "Tom = he → <b>has got</b>." }),
        inp("Впиши have got або has got", "They ___ a new car.", ["have got", "'ve got"], ["They → ?", "have got."], "<b>have got</b>.", { "has got": "they → <b>have got</b>." }),
        inp("Впиши have got або has got", "The cat ___ green eyes.", ["has got", "'s got"], ["The cat = it.", "has got."], "<b>has got</b>.", { "have got": "Кіт — it: <b>has got</b>." }),
        fix("She have got a new phone.", 1, "She has got a new phone.", ["She → ?", "has."], "she → <b>has</b> got."),
        fix("We has got a lot of books.", 1, "We have got a lot of books.", ["We → ?", "have."], "we → <b>have</b> got."),
        dict("He has got a red bike.", [DH, "he → has got."], "<b>has got</b>.", { "He have got a red bike.": "he → <b>has</b> got." })
      ] },
    { id: "hg.neg", title: "haven't got / hasn't got",
      rule: "haven't got / hasn't got. Без don't!",
      worked: { p: "My brother ___ a computer.", steps: ["My brother = he → has.", "Заперечення: <b>hasn't got</b>.", "Відповідь: My brother <b>hasn't got</b> a computer."] },
      alt: `<p>«Не» чіпляється до have / has: have → <b>haven't</b> got, has → <b>hasn't</b> got. do / does тут не потрібні.</p>`,
      items: [
        ch("I ___ a cat.", ["haven't got", "hasn't got"], "haven't got", ["I → have.", "haven't got."], "<b>haven't got</b>.", { "hasn't got": "З I — <b>haven't got</b>." }),
        ch("Dad ___ a car.", ["hasn't got", "haven't got"], "hasn't got", ["Dad = he.", "hasn't got."], "<b>hasn't got</b>.", { "haven't got": "Dad = he → <b>hasn't got</b>." }),
        inp("Впиши haven't got або hasn't got", "We ___ any pets.", ["haven't got", "have not got"], ["We → have.", "haven't got."], "<b>haven't got</b>.", { "hasn't got": "we → <b>haven't got</b>.", "don't have got": "Так не кажуть: <b>haven't got</b>." }),
        inp("Впиши haven't got або hasn't got", "My brother ___ a computer.", ["hasn't got", "has not got"], ["he → has.", "hasn't got."], "<b>hasn't got</b>.", { "haven't got": "My brother = he → <b>hasn't got</b>.", "doesn't have got": "Так не кажуть: <b>hasn't got</b>." }),
        inp("Впиши haven't got або hasn't got", "They ___ a garden.", ["haven't got", "have not got"], ["They → have.", "haven't got."], "<b>haven't got</b>.", { "hasn't got": "they → <b>haven't got</b>." }),
        fix("She haven't got a sister.", 1, "She hasn't got a sister.", ["She → ?", "hasn't."], "she → <b>hasn't</b> got."),
        fix("I don't have got a bike.", 1, "I haven't got a bike.", ["have got не дружить з don't.", "I haven't got."], "<b>I haven't got</b> — без don't."),
        dict("We haven't got much time.", [DH, "we → haven't got."], "<b>haven't got</b>.", { "We hasn't got much time.": "we → <b>haven't</b> got." })
      ] },
    { id: "hg.q", title: "Have you got…? Has she got…?",
      rule: "Have / Has + хто + got …? — Yes, I have. / No, she hasn't.",
      worked: { p: "___ Anna got a bike?", steps: ["Anna = she → <b>Has</b>.", "Has на початок, got — після того, хто.", "Відповідь: <b>Has</b> Anna got a bike?"] },
      alt: `<p>have / has виходить наперед, а got лишається на місці:</p><p>You have got a pet. → <b>Have</b> you got a pet?<br>Відповідь коротка: Yes, I <b>have</b>. / No, I <b>haven't</b>.</p>`,
      items: [
        ch("___ you got a pet?", ["Have", "Has", "Do"], "Have", ["you → ?", "Have."], "<b>Have</b> you got…?", { "Has": "you → <b>Have</b>.", "Do": "З got питаємо через <b>Have</b>." }),
        ch("___ your dad got a car?", ["Has", "Have", "Does"], "Has", ["your dad = he.", "Has."], "<b>Has</b> your dad got…?", { "Have": "Тато — he: <b>Has</b>.", "Does": "З got питаємо через <b>Has</b>." }),
        ch("Have you got a sister? — Yes, I ___.", ["have", "got", "do"], "have", ["Питали з Have.", "Yes, I have."], "Yes, I <b>have</b>.", { "got": "Коротка відповідь: Yes, I <b>have</b>.", "do": "Питали з Have: Yes, I <b>have</b>." }),
        inp("Впиши Have або Has", "___ they got a dog?", ["Have"], ["they → ?", "Have."], "<b>Have</b> they got…?", { "Has": "they → <b>Have</b>.", "Do": "З got — <b>Have</b>." }),
        inp("Впиши Have або Has", "___ Anna got a bike?", ["Has"], ["Anna = she.", "Has."], "<b>Has</b> Anna got…?", { "Have": "Anna = she → <b>Has</b>.", "Does": "З got — <b>Has</b>." }),
        inp("Впиши коротку відповідь", "Has your cat got a toy? — No, it ___.", ["hasn't", "has not"], ["Питали з Has, «ні».", "hasn't."], "No, it <b>hasn't</b>.", { "haven't": "it → <b>hasn't</b>.", "doesn't": "Питали з Has: <b>hasn't</b>." }),
        ord("«У тебе є брат?»", ["got", "Have", "a", "you", "brother"], ["have you got a brother"], ["Have → you → got → a brother?", "got іде після you."], "<b>Have you got a brother?</b>", "?"),
        dict("Have you got a pen?", [DH, "you → Have."], "<b>Have</b> you got…?", { "Has you got a pen?": "you → <b>Have</b>." })
      ] }
  ] });

  /* ===================== ЧИЄ ЦЕ ===================== */
  w("lessons/l19.json", {
    id: "l19", title: "Чиє це? 's, whose, this / these",
    skillFiles: ["skills/pos.json"],
    skills: ["pos.s", "pos.this"],
    practice: { perSkill: 5 },
    test: { plan: { "pos.s": 4, "pos.this": 4 }, pass: 80 },
    explain: [
      { e: "🎒", h: "Чиє? — 's",
        html: `<p>Щоб сказати «Анин», «татів», додаємо <b>'s</b> (апостроф + s):</p>
        ${say("This is Anna's bag.", "Це Анина сумка.", "This is <b>Anna's</b> bag.")}
        ${say("My dad's car is red.", "Татова машина червона.", "My <b>dad's</b> car is red.")}
        <div class="tip">⚠️ Апостроф обов'язковий: <s>Annas bag</s> → <b>Anna's</b> bag. Питання «чий?» — <b>Whose</b>: Whose bag is this?</div>` },
      { e: "👉", h: "this / these, that / those",
        html: `<table class="t"><tr><td></td><td>одне</td><td>багато</td></tr>
        <tr><td>поруч (цей)</td><td><b>this</b> book</td><td><b>these</b> books</td></tr>
        <tr><td>далеко (той)</td><td><b>that</b> house</td><td><b>those</b> houses</td></tr></table>
        ${say("These shoes are new. Look at those birds!", "Ці черевики нові. Подивись на тих птахів!", "<b>These</b> shoes are new. Look at <b>those</b> birds!")}` }
    ],
    examples: { title: "Загублені речі",
      question: { q: "чому «<b>Whose</b> jacket», а не «Who's jacket»?", a: "Who's = who is («хто є»). «Чия?» — Whose." },
      items: [
        ["<b>Whose</b> jacket is this?", "Чия це куртка?"],
        ["It's <b>Max's</b> jacket.", "Це Максова куртка."],
        ["And <b>these</b> gloves? Are they <b>Kate's</b>?", "А ці рукавички? Вони Катині?"],
        ["No, <b>those</b> gloves over there are Kate's.", "Ні, Катині — ті рукавички он там."],
        ["<b>This</b> is my <b>sister's</b> umbrella.", "Це парасолька моєї сестри."]
      ] },
    words: [
      ["whose", "чий"], ["jacket", "куртка"], ["gloves", "рукавички"], ["umbrella", "парасолька"], ["backpack", "рюкзак"],
      ["keys", "ключі"], ["lost", "загублений"], ["find", "знаходити"], ["over there", "он там"], ["here", "тут"]
    ]
  });

  w("skills/pos.json", { topic: "pos", title: "Чиє це", skills: [
    { id: "pos.s", title: "Присвійний 's: Anna's, my dad's",
      rule: "Чиє? → ім'я + 's: Anna's bag, my dad's car. Питання — Whose?",
      worked: { p: "This is ___ room. (Tom)", steps: ["Чия кімната? Томова.", "До Tom додаємо <b>'s</b>.", "Відповідь: This is <b>Tom's</b> room."] },
      alt: `<p>'s — це англійський «суфікс чиєсті»: Анин → Anna<b>'s</b>, мамин → mum<b>'s</b>, другів → friend<b>'s</b>.</p><p class="muted">Не забудь апостроф — без нього Annas звучить як «багато Ань».</p>`,
      items: [
        ch("This is ___ bag.", ["Anna's", "Annas", "Anna"], "Anna's", ["Чия сумка?", "Anna + 's."], "<b>Anna's</b> bag.", { "Annas": "Потрібен апостроф: <b>Anna's</b>.", "Anna": "Чия? <b>Anna's</b>." }),
        ch("My ___ car is red.", ["dad's", "dads", "dad"], "dad's", ["Чия машина?", "dad + 's."], "my <b>dad's</b> car.", { "dads": "Потрібен апостроф: <b>dad's</b>.", "dad": "Чия? <b>dad's</b>." }),
        ch("Whose book is it? — It's ___.", ["Max's", "Maxs", "Max"], "Max's", ["Чия книжка?", "Max + 's."], "It's <b>Max's</b>.", { "Maxs": "Потрібен апостроф: <b>Max's</b>.", "Max": "Чия? <b>Max's</b>." }),
        ch("___ phone is ringing?", ["Whose", "Who's", "Who"], "Whose", ["«Чий телефон?»", "Whose."], "<b>Whose</b> phone…?", { "Who's": "Who's = who is. «Чий» — <b>Whose</b>.", "Who": "Who — «хто». «Чий» — <b>Whose</b>." }),
        inp("Впиши з 's", "This is ___ room. (Tom)", ["Tom's"], ["Чия кімната?", "Tom + 's."], "<b>Tom's</b> room.", { "Toms": "Не забудь апостроф: <b>Tom's</b>.", "Tom": "Чия? <b>Tom's</b>." }, A),
        inp("Впиши з 's", "Where is ___ phone? (my mum)", ["my mum's"], ["Чий телефон?", "my mum + 's."], "<b>my mum's</b> phone.", { "my mums": "Не забудь апостроф: <b>mum's</b>.", "my mum": "Чий? <b>my mum's</b>." }, A),
        inp("Впиши з 's", "___ cat is very fat. (Kate)", ["Kate's"], ["Чий кіт?", "Kate + 's."], "<b>Kate's</b> cat.", { "Kates": "Не забудь апостроф: <b>Kate's</b>.", "Kate": "Чий? <b>Kate's</b>." }, A),
        fix("This is my sister bike.", 3, "This is my sister's bike.", ["Чий велосипед?", "sister + 's."], "my <b>sister's</b> bike."),
        fix("Peters dog is black.", 0, "Peter's dog is black.", ["Чий собака?", "Потрібен апостроф."], "<b>Peter's</b> dog."),
        dict("It's my friend's house.", [DH, "Чий? friend's."], "my <b>friend's</b> house.", { "It's my friend house.": "Чий? <b>friend's</b>.", "It's my friends house.": "Потрібен апостроф: <b>friend's</b>." }, A)
      ].map(x => Object.assign(x, A)) },
    { id: "pos.this", title: "this / these, that / those",
      rule: "this (цей) — these (ці): поруч; that (той) — those (ті): далеко.",
      worked: { p: "___ apples are sweet.", steps: ["apples — багато.", "Поруч і багато → <b>These</b>.", "Відповідь: <b>These</b> apples are sweet."] },
      alt: `<p>Однина ↔ множина: th<b>is</b> ↔ th<b>ese</b>, th<b>at</b> ↔ th<b>ose</b>.</p><p>Можна торкнутися рукою — this / these. Показуєш пальцем удалину — that / those.</p>`,
      items: [
        ch("___ book is interesting.", ["This", "These"], "This", ["book — одна.", "This."], "<b>This</b> book.", { "These": "book — одна: <b>This</b>." }),
        ch("___ shoes are new.", ["These", "This"], "These", ["shoes — багато.", "These."], "<b>These</b> shoes.", { "This": "shoes — множина: <b>These</b>." }),
        ch("Look at ___ birds in the sky!", ["those", "that"], "those", ["birds — багато, далеко.", "those."], "<b>those</b> birds.", { "that": "birds — множина: <b>those</b>." }),
        ch("Is ___ your house over there?", ["that", "this"], "that", ["over there — он там, далеко.", "that."], "<b>that</b> … over there.", { "this": "over there — далеко: <b>that</b>." }),
        inp("Впиши this або these", "___ apples are sweet.", ["These"], ["apples — багато.", "These."], "<b>These</b> apples.", { "This": "apples — множина: <b>These</b>." }),
        inp("Впиши that або those", "Who is ___ girl over there?", ["that"], ["girl — одна.", "that."], "<b>that</b> girl.", { "those": "girl — одна: <b>that</b>." }),
        inp("Впиши this або these", "___ is my favourite song.", ["This"], ["song — одна.", "This."], "<b>This</b> is…", { "These": "song — одна: <b>This</b>." }),
        fix("This books are mine.", 0, "These books are mine.", ["books — багато.", "These."], "<b>These</b> books."),
        dict("Those flowers are beautiful.", [DH, "flowers — багато, далеко → those."], "<b>Those</b> flowers.", { "That flowers are beautiful.": "flowers — множина: <b>Those</b>." }),
        dict("Whose jacket is this?", [DH, "«Чия?» — Whose."], "<b>Whose</b> jacket…?", { "Who's jacket is this?": "«Чия» — <b>Whose</b>." })
      ] }
  ] });

  /* ===================== IN / ON / AT ===================== */
  w("lessons/l20.json", {
    id: "l20", title: "Прийменники: in / on / at, under, next to",
    skillFiles: ["skills/prep.json"],
    skills: ["prep.place", "prep.time"],
    practice: { perSkill: 5 },
    test: { plan: { "prep.place": 4, "prep.time": 4 }, pass: 80 },
    explain: [
      { e: "📦", h: "Де? in, on, under…",
        html: `<table class="t"><tr><td><b>in</b></td><td>у, всередині</td><td>in the box, in Kyiv</td></tr>
        <tr><td><b>on</b></td><td>на (поверхні)</td><td>on the table, on the wall</td></tr>
        <tr><td><b>under</b></td><td>під</td><td>under the bed</td></tr>
        <tr><td><b>next to</b></td><td>поруч з</td><td>next to the window</td></tr>
        <tr><td><b>between</b></td><td>між</td><td>between the bank and the cafe</td></tr>
        <tr><td><b>behind</b> / <b>in front of</b></td><td>за / перед</td><td>behind the sofa</td></tr>
        <tr><td><b>at</b></td><td>біля точки, на місці</td><td>at the bus stop, at school, at home</td></tr></table>` },
      { e: "🕐", h: "Коли? in, on, at",
        html: `<table class="t"><tr><td><b>at</b></td><td>точний час</td><td>at 7 o'clock, at night</td></tr>
        <tr><td><b>on</b></td><td>день, дата</td><td>on Monday, on the 5th of May</td></tr>
        <tr><td><b>in</b></td><td>місяць, рік, пора року, частина дня</td><td>in May, in 2013, in winter, in the morning</td></tr></table>
        <div class="tip">💡 Від меншого до більшого: <b>at</b> (година) → <b>on</b> (день) → <b>in</b> (місяць, рік).</div>` }
    ],
    examples: { title: "Моя кімната і мій тиждень",
      question: { q: "чому «<b>on</b> Monday», а «<b>in</b> the morning»?", a: "Дні — on. Частини дня (ранок, вечір) — in (крім at night)." },
      items: [
        ["My bed is <b>next to</b> the window.", "Моє ліжко біля вікна."],
        ["My books are <b>on</b> the shelf, and my clothes are <b>in</b> the wardrobe.", "Книжки на полиці, а одяг у шафі."],
        ["My cat sleeps <b>under</b> the bed.", "Кіт спить під ліжком."],
        ["I get up <b>at</b> seven <b>in</b> the morning.", "Я встаю о сьомій ранку."],
        ["We have English <b>on</b> Tuesday and Thursday.", "Англійська в нас у вівторок і четвер."],
        ["My birthday is <b>in</b> May.", "Мій день народження в травні."]
      ] },
    words: [
      ["under", "під"], ["behind", "за, позаду"], ["in front of", "перед"], ["between", "між"], ["next to", "поруч з"],
      ["Monday", "понеділок"], ["weekend", "вихідні"], ["morning", "ранок"], ["evening", "вечір"], ["at night", "вночі"]
    ]
  });

  const PR = "Впиши прийменник";
  w("skills/prep.json", { topic: "prep", title: "Прийменники", skills: [
    { id: "prep.place", title: "Де? in / on / at, under, next to, between",
      rule: "in — у, всередині; on — на поверхні; at — біля точки (at the bus stop, at school); under — під; next to — поруч; between — між; behind — за.",
      worked: { p: "The picture is ___ the wall.", steps: ["Картина висить на поверхні стіни.", "На поверхні → <b>on</b>.", "Відповідь: The picture is <b>on</b> the wall."] },
      alt: `<p>Уяви коробку 📦: всередині — <b>in</b>, зверху — <b>on</b>, під нею — <b>under</b>, поруч — <b>next to</b>, позаду — <b>behind</b>.</p><p><b>at</b> — коли місце як «точка зустрічі»: at the door, at the bus stop, at school.</p>`,
      items: [
        ch("The book is ___ the table.", ["on", "in", "at"], "on", ["Книжка лежить на столі.", "На поверхні → on."], "<b>on</b> the table.", { "in": "Книжка не всередині стола, а на ньому: <b>on</b>.", "at": "На поверхні — <b>on</b>." }),
        ch("My clothes are ___ the wardrobe.", ["in", "on"], "in", ["Одяг усередині шафи.", "in."], "<b>in</b> the wardrobe.", { "on": "Одяг усередині шафи: <b>in</b>." }),
        ch("«М'яч під ліжком»: The ball is ___ the bed.", ["under", "on", "in"], "under", ["під → ?", "under."], "<b>under</b> the bed.", { "on": "«під» — <b>under</b>.", "in": "«під» — <b>under</b>." }),
        ch("«Аптека між банком і кафе»: The chemist's is ___ the bank and the cafe.", ["between", "next to", "behind"], "between", ["між → ?", "between."], "<b>between</b>.", { "next to": "«між» — <b>between</b>.", "behind": "«між» — <b>between</b>." }),
        inp(PR, "«Я живу в Києві»: I live ___ Kyiv.", ["in"], ["Місто — всередині.", "in."], "<b>in</b> Kyiv.", { "at": "Місто, країна — <b>in</b>.", "on": "Місто — <b>in</b>." }),
        inp(PR, "«Картина на стіні»: The picture is ___ the wall.", ["on"], ["На поверхні стіни.", "on."], "<b>on</b> the wall.", { "in": "На поверхні — <b>on</b>." }),
        inp(PR, "«Ми зустрілися на зупинці»: We met ___ the bus stop.", ["at"], ["Зупинка — точка.", "at."], "<b>at</b> the bus stop.", { "on": "Точка, місце зустрічі — <b>at</b>.", "in": "Точка, місце зустрічі — <b>at</b>." }),
        inp(PR, "«Кіт сидить за диваном»: The cat is ___ the sofa.", ["behind"], ["за, позаду → ?", "behind."], "<b>behind</b> the sofa.", { "after": "after — «після» (про час). «За, позаду» — <b>behind</b>." }),
        inp(PR, "«Біля школи є парк»: There is a park ___ the school.", ["next to", "near"], ["поруч → ?", "next to."], "<b>next to</b> the school.", { "next": "Повністю: <b>next to</b>." }),
        fix("My keys are in the table.", 3, "My keys are on the table.", ["Ключі лежать на столі.", "on."], "<b>on</b> the table."),
        dict("The cat is under the bed.", [DH, "під → under."], "<b>under</b> the bed.")
      ] },
    { id: "prep.time", title: "Коли? at 7, on Monday, in May",
      rule: "at — точний час (at 7 o'clock); on — день, дата (on Monday); in — місяць, рік, пора року, частина дня (in May, in 2013, in winter, in the morning).",
      worked: { p: "My birthday is ___ the 5th of May.", steps: ["Тут конкретна <b>дата</b> (5 травня).", "День, дата → <b>on</b>.", "Відповідь: <b>on</b> the 5th of May."] },
      alt: `<p>Сходинки від маленького до великого:</p><p>🕐 <b>at</b> seven → 📅 <b>on</b> Monday → 🗓️ <b>in</b> May, <b>in</b> 2013, <b>in</b> winter</p>`,
      items: [
        ch("My birthday is ___ May.", ["in", "on", "at"], "in", ["May — місяць.", "Місяць → in."], "<b>in</b> May.", { "on": "Місяць — <b>in</b>.", "at": "Місяць — <b>in</b>." }),
        ch("The lesson starts ___ nine o'clock.", ["at", "in", "on"], "at", ["Точний час.", "at."], "<b>at</b> nine.", { "in": "Точний час — <b>at</b>.", "on": "Точний час — <b>at</b>." }),
        ch("We don't go to school ___ Sunday.", ["on", "in", "at"], "on", ["Sunday — день.", "День → on."], "<b>on</b> Sunday.", { "in": "Дні тижня — <b>on</b>.", "at": "Дні тижня — <b>on</b>." }),
        ch("___ the morning I drink tea.", ["In", "On", "At"], "In", ["Частина дня.", "in the morning."], "<b>In</b> the morning.", { "On": "Частина дня — <b>in</b> the morning.", "At": "Частина дня — <b>in</b> the morning." }),
        inp("Впиши in, on або at", "I was born ___ 2013.", ["in"], ["Рік.", "in."], "<b>in</b> 2013.", { "on": "Рік — <b>in</b>.", "at": "Рік — <b>in</b>." }),
        inp("Впиши in, on або at", "See you ___ Monday!", ["on"], ["День тижня.", "on."], "<b>on</b> Monday.", { "in": "Дні тижня — <b>on</b>.", "at": "Дні тижня — <b>on</b>." }),
        inp("Впиши in, on або at", "I go to bed ___ ten o'clock.", ["at"], ["Точний час.", "at."], "<b>at</b> ten.", { "in": "Точний час — <b>at</b>.", "on": "Точний час — <b>at</b>." }),
        inp("Впиши in, on або at", "It's very cold ___ winter.", ["in"], ["Пора року.", "in."], "<b>in</b> winter.", { "on": "Пора року — <b>in</b>.", "at": "Пора року — <b>in</b>." }),
        inp("Впиши in, on або at", "My birthday is ___ the 5th of May.", ["on"], ["Конкретна дата.", "on."], "<b>on</b> the 5th of May.", { "in": "Конкретна дата — <b>on</b>.", "at": "Конкретна дата — <b>on</b>." }),
        fix("I get up on seven o'clock.", 3, "I get up at seven o'clock.", ["Точний час.", "at."], "<b>at</b> seven."),
        dict("We have English on Tuesday.", [DH, "День → on."], "<b>on</b> Tuesday.", { "We have English in Tuesday.": "Дні тижня — <b>on</b>.", "We have English at Tuesday.": "Дні тижня — <b>on</b>." })
      ] }
  ] });

  /* ===================== MUCH / MANY ===================== */
  w("lessons/l21.json", {
    id: "l21", title: "much / many / a lot of",
    skillFiles: ["skills/qty.json"],
    skills: ["qty.mm", "qty.how"],
    practice: { perSkill: 5 },
    test: { plan: { "qty.mm": 5, "qty.how": 3 }, pass: 80 },
    explain: [
      { e: "🍎", h: "many — те, що рахуємо",
        html: `<p><b>many</b> — з тим, що можна порахувати: apples, friends, books, people.</p>
        ${say("I haven't got many friends here.", "У мене тут небагато друзів.", "I haven't got <b>many</b> friends here.")}` },
      { e: "🥛", h: "much — те, що не рахуємо",
        html: `<p><b>much</b> — з тим, що не рахують штуками: milk, water, time, money, bread.</p>
        ${say("There isn't much milk.", "Молока небагато.", "There isn't <b>much</b> milk.")}
        <div class="tip">💡 У стверджувальних реченнях частіше кажуть <b>a lot of</b> — підходить до всього: a lot of friends, a lot of milk.</div>` },
      { e: "❓", h: "How much? How many?",
        html: `${say("How many brothers have you got?", "Скільки в тебе братів?", "<b>How many</b> brothers have you got?")}
        ${say("How much water do you drink?", "Скільки води ти п'єш?", "<b>How much</b> water do you drink?")}
        ${say("How much is it?", "Скільки це коштує?", "<b>How much</b> is it?")}
        <p class="muted">Про ціну — завжди How much.</p>` }
    ],
    examples: { title: "Похід у магазин",
      question: { q: "чому «How <b>many</b> eggs», а «How <b>much</b> sugar»?", a: "Яйця рахуємо (one, two…) — many. Цукор не рахуємо штуками — much." },
      items: [
        ["We need to buy food. We haven't got <b>much</b> bread.", "Треба купити їжі. Хліба мало."],
        ["How <b>many</b> eggs do we need? — Ten.", "Скільки яєць треба? — Десять."],
        ["How <b>much</b> sugar? — Not <b>much</b>, just one kilo.", "Скільки цукру? — Небагато, лише кілограм."],
        ["There are <b>a lot of</b> people in the shop today.", "Сьогодні в магазині багато людей."],
        ["How <b>much</b> is this cake? — 200 hryvnias.", "Скільки коштує цей торт? — 200 гривень."]
      ] },
    words: [
      ["sugar", "цукор"], ["salt", "сіль"], ["water", "вода"], ["money", "гроші"], ["time", "час"],
      ["people", "люди"], ["price", "ціна"], ["cost", "коштувати"], ["kilo", "кілограм"], ["bottle", "пляшка"]
    ]
  });

  const MM = "Впиши much або many";
  w("skills/qty.json", { topic: "qty", title: "much / many", skills: [
    { id: "qty.mm", title: "much чи many, a lot of",
      rule: "many — з тим, що рахуємо (friends, apples); much — з тим, що не рахуємо (milk, time, money). a lot of — до всього.",
      worked: { p: "Did you spend ___ money?", steps: ["money — гроші. Рахуємо «одна гроша, дві…»? Ні.", "Не рахуємо → <b>much</b>.", "Відповідь: Did you spend <b>much</b> money?"] },
      alt: `<p>Спробуй поставити число: «три яблука» — можна → <b>many</b>. «Три молока» — дивно → <b>much</b>.</p>`,
      items: [
        ch("There isn't ___ milk.", ["much", "many"], "much", ["milk рахуємо?", "Ні → much."], "<b>much</b> milk.", { "many": "milk не рахуємо: <b>much</b>." }),
        ch("I haven't got ___ friends here.", ["many", "much"], "many", ["friends рахуємо?", "Так → many."], "<b>many</b> friends.", { "much": "friends рахуємо: <b>many</b>." }),
        ch("She has got ___ books.", ["a lot of", "much"], "a lot of", ["Це ствердження.", "У ствердженні — a lot of."], "<b>a lot of</b> books.", { "much": "books рахуємо, і в ствердженні кажуть <b>a lot of</b>." }),
        ch("We don't have ___ time.", ["much", "many"], "much", ["time рахуємо?", "Ні → much."], "<b>much</b> time.", { "many": "time не рахуємо: <b>much</b>." }),
        inp(MM, "There aren't ___ people in the park.", ["many"], ["people рахуємо?", "Так → many."], "<b>many</b> people.", { "much": "people рахуємо: <b>many</b>." }),
        inp(MM, "I don't drink ___ coffee.", ["much"], ["coffee рахуємо?", "Ні → much."], "<b>much</b> coffee.", { "many": "coffee не рахуємо: <b>much</b>." }),
        inp(MM, "Are there ___ apples in the bag?", ["many"], ["apples рахуємо?", "Так → many."], "<b>many</b> apples.", { "much": "apples рахуємо: <b>many</b>." }),
        inp(MM, "Did you spend ___ money?", ["much"], ["money рахуємо штуками?", "Ні → much."], "<b>much</b> money.", { "many": "money не рахуємо штуками: <b>much</b>." }),
        fix("There isn't many water in the bottle.", 2, "There isn't much water in the bottle.", ["water рахуємо?", "Ні → much."], "<b>much</b> water."),
        fix("I don't have much friends.", 3, "I don't have many friends.", ["friends рахуємо?", "Так → many."], "<b>many</b> friends."),
        dict("We haven't got much bread.", [DH, "bread не рахуємо → much."], "<b>much</b> bread.", { "We haven't got many bread.": "bread не рахуємо: <b>much</b>." })
      ] },
    { id: "qty.how", title: "How much? How many?",
      rule: "How many + те, що рахуємо? How much + те, що не рахуємо? Ціна — How much is it?",
      worked: { p: "How ___ brothers have you got?", steps: ["brothers — рахуємо.", "→ <b>How many</b>.", "Відповідь: How <b>many</b> brothers have you got?"] },
      alt: `<p>Після How many — слово в множині: How many <b>books</b>? Після How much — без множини: How much <b>water</b>? І про гроші: How much is it?</p>`,
      items: [
        ch("How ___ apples do you want?", ["many", "much"], "many", ["apples рахуємо.", "many."], "How <b>many</b>…?", { "much": "apples рахуємо: How <b>many</b>." }),
        ch("How ___ is this T-shirt? — It's 300 hryvnias.", ["much", "many"], "much", ["Питаємо про ціну.", "How much."], "Ціна → How <b>much</b>.", { "many": "Про ціну завжди How <b>much</b>." }),
        ch("How ___ sugar do you need?", ["much", "many"], "much", ["sugar рахуємо?", "Ні → much."], "How <b>much</b> sugar?", { "many": "sugar не рахуємо: How <b>much</b>." }),
        inp(MM, "How ___ brothers have you got?", ["many"], ["brothers рахуємо.", "many."], "How <b>many</b>…?", { "much": "brothers рахуємо: <b>many</b>." }),
        inp(MM, "How ___ water do you drink a day?", ["much"], ["water рахуємо?", "Ні → much."], "How <b>much</b>…?", { "many": "water не рахуємо: <b>much</b>." }),
        inp(MM, "How ___ pupils are there in your class?", ["many"], ["pupils рахуємо.", "many."], "How <b>many</b>…?", { "much": "pupils рахуємо: <b>many</b>." }),
        ord("«Скільки це коштує?»", ["much", "How", "it", "is"], ["how much is it"], ["Про ціну: How much…", "How → much → is → it?"], "<b>How much is it?</b>", "?"),
        dict("How many lessons have you got today?", [DH, "lessons рахуємо → many."], "How <b>many</b> lessons…?", { "How much lessons have you got today?": "lessons рахуємо: How <b>many</b>." })
      ] }
  ] });
};
