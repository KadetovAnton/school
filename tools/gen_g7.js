// 7 клас (НУШ): розділові запитання (l22), Past Perfect (l23), Present Perfect Continuous + PP чи PS (l24), пропозиції й запрошення (l25)
const { say, inp, ch, fix, dict, ord, DH, S } = require("./lib.js");
module.exports = function (w) {

  /* ===================== TAG QUESTIONS ===================== */
  w("lessons/l22.json", {
    id: "l22", title: "Розділові запитання: …, isn't it?",
    skillFiles: ["skills/tag.json"],
    skills: ["tag.be", "tag.do"],
    practice: { perSkill: 5 },
    test: { plan: { "tag.be": 4, "tag.do": 4 }, pass: 80 },
    explain: [
      { e: "🤔", h: "«…, правда ж?»",
        html: `<p>Розділове запитання — речення + маленький «хвостик», яким просимо погодитись: «…, чи не так?», «…, правда?»</p>
        ${say("It's cold today, isn't it?", "Сьогодні холодно, правда ж?", "It's cold today, <b>isn't it</b>?")}
        <div class="rule-box"><b>Ствердження → хвостик із not.<br>Заперечення → хвостик без not.</b></div>
        ${say("She isn't at home, is she?", "Її немає вдома, так?", "She isn't at home, <b>is she</b>?")}` },
      { e: "🧩", h: "Хвостик з того ж помічника",
        html: `<table class="t"><tr><td>is / are / was / were / can</td><td>повторюємо його</td><td>You <b>are</b> tired, <b>aren't</b> you?<br>They <b>can</b> swim, <b>can't</b> they?</td></tr>
        <tr><td>звичайне дієслово</td><td>do / does / did</td><td>You <b>like</b> pizza, <b>don't</b> you?<br>She <b>lives</b> here, <b>doesn't</b> she?<br>They <b>went</b> home, <b>didn't</b> they?</td></tr></table>
        <div class="tip">💡 У хвостику — тільки займенник: Tom is nice, isn't <b>he</b>? (не isn't Tom)</div>` }
    ],
    examples: { title: "Нова учениця",
      question: { q: "чому «You like English, <b>don't</b> you», а «You're new, <b>aren't</b> you»?", a: "like — звичайне дієслово, тож хвостик із do. Друге речення з are, тож хвостик з are." },
      items: [
        ["You're new here, <b>aren't you</b>?", "Ти тут новенька, так?"],
        ["Yes, I am. Our school is big, <b>isn't it</b>?", "Так. Наша школа велика, правда ж?"],
        ["You like English, <b>don't you</b>?", "Тобі ж подобається англійська?"],
        ["Our teacher speaks very fast, <b>doesn't she</b>?", "Наша вчителька говорить дуже швидко, правда?"],
        ["You didn't bring your book, <b>did you</b>? Here, take mine!", "Ти ж не взяла підручник? Ось, візьми мій!"]
      ] },
    words: [
      ["agree", "погоджуватися"], ["right", "правильний; праві"], ["new", "новий"], ["classmate", "однокласник"], ["sure", "впевнений"],
      ["of course", "звичайно"], ["exactly", "саме так"], ["I think so", "я так думаю"], ["I don't think so", "я так не думаю"], ["really", "справді"]
    ]
  });

  const TQ = "Впиши розділове запитання (хвостик)";
  w("skills/tag.json", { topic: "tag", title: "Розділові запитання", skills: [
    { id: "tag.be", title: "…, isn't it? …, can't they?",
      rule: "Хвостик з того ж помічника (is, are, was, can): ствердження → з not, заперечення → без not. У хвостику — займенник.",
      worked: { p: "Tom is your friend, ___?", steps: ["Помічник: <b>is</b>. Речення стверджувальне.", "Ствердження → хвостик із not: <b>isn't</b>.", "Tom → займенник <b>he</b>.", "Відповідь: Tom is your friend, <b>isn't he</b>?"] },
      alt: `<p>Хвостик — це «дзеркало»: що в реченні «так», у хвостику «ні», і навпаки.</p><p>It <b>is</b> → <b>isn't</b> it? · You <b>aren't</b> → <b>are</b> you? · They <b>can</b> → <b>can't</b> they?</p>`,
      items: [
        ch("It's cold today, ___?", ["isn't it", "is it", "doesn't it"], "isn't it", ["Помічник is, ствердження.", "→ isn't it."], "…, <b>isn't it</b>?", { "is it": "Ствердження → хвостик із not: <b>isn't it</b>.", "doesn't it": "Помічник is: <b>isn't it</b>." }),
        ch("You are tired, ___?", ["aren't you", "are you", "don't you"], "aren't you", ["Помічник are, ствердження.", "→ aren't you."], "…, <b>aren't you</b>?", { "are you": "Ствердження → з not: <b>aren't you</b>.", "don't you": "Помічник are: <b>aren't you</b>." }),
        ch("She isn't at home, ___?", ["is she", "isn't she"], "is she", ["Заперечення isn't.", "→ хвостик без not."], "…, <b>is she</b>?", { "isn't she": "Заперечення → хвостик без not: <b>is she</b>." }),
        ch("They can swim, ___?", ["can't they", "don't they", "can they"], "can't they", ["Помічник can, ствердження.", "→ can't they."], "…, <b>can't they</b>?", { "don't they": "Помічник can: <b>can't they</b>.", "can they": "Ствердження → з not: <b>can't they</b>." }),
        inp(TQ, "Tom is your friend, ___?", ["isn't he"], ["Помічник is, ствердження.", "Tom → he."], "…, <b>isn't he</b>?", { "is he": "Ствердження → з not: <b>isn't he</b>.", "isn't Tom": "У хвостику — займенник: <b>isn't he</b>.", "doesn't he": "Помічник is: <b>isn't he</b>." }),
        inp(TQ, "You weren't at school yesterday, ___?", ["were you"], ["Заперечення weren't.", "→ без not."], "…, <b>were you</b>?", { "weren't you": "Заперечення → хвостик без not: <b>were you</b>.", "did you": "Помічник were: <b>were you</b>." }),
        inp(TQ, "We can go now, ___?", ["can't we"], ["Помічник can, ствердження.", "→ can't we."], "…, <b>can't we</b>?", { "can we": "Ствердження → з not: <b>can't we</b>.", "don't we": "Помічник can: <b>can't we</b>." }),
        inp(TQ, "Your sister was ill, ___?", ["wasn't she"], ["Помічник was, ствердження.", "your sister → she."], "…, <b>wasn't she</b>?", { "was she": "Ствердження → з not: <b>wasn't she</b>.", "didn't she": "Помічник was: <b>wasn't she</b>." }),
        fix("It's a nice day, is it?", 4, "It's a nice day, isn't it?", ["Речення стверджувальне.", "Хвостик — з not."], "…, <b>isn't</b> it?"),
        dict("You're from Kyiv, aren't you?", [DH, "Ствердження → aren't you."], "…, <b>aren't you</b>?", { "You're from Kyiv, are you?": "Ствердження → хвостик із not: <b>aren't you</b>." })
      ] },
    { id: "tag.do", title: "…, don't you? …, didn't they?",
      rule: "Звичайне дієслово → хвостик з do / does / did: You like…, don't you? She lives…, doesn't she? They went…, didn't they?",
      worked: { p: "Anna plays the piano, ___?", steps: ["Помічника немає — дієслово plays (Present Simple, she).", "Беремо <b>does</b>; ствердження → <b>doesn't</b>.", "Anna → <b>she</b>.", "Відповідь: …, <b>doesn't she</b>?"] },
      alt: `<p>Якщо в реченні немає is / are / can, «помічник» прихований: like → do, likes → does, liked / went → did.</p><p>You <b>like</b> → <b>don't</b> you? · She <b>likes</b> → <b>doesn't</b> she? · They <b>went</b> → <b>didn't</b> they?</p>`,
      items: [
        ch("You like pizza, ___?", ["don't you", "do you", "aren't you"], "don't you", ["like — звичайне дієслово.", "→ don't you."], "…, <b>don't you</b>?", { "do you": "Ствердження → з not: <b>don't you</b>.", "aren't you": "like — звичайне дієслово, тож do: <b>don't you</b>." }),
        ch("She lives in Lviv, ___?", ["doesn't she", "don't she", "isn't she"], "doesn't she", ["lives — she, Present Simple.", "→ doesn't she."], "…, <b>doesn't she</b>?", { "don't she": "she → <b>doesn't</b>.", "isn't she": "lives — звичайне дієслово: <b>doesn't she</b>." }),
        ch("They went to the zoo, ___?", ["didn't they", "don't they", "weren't they"], "didn't they", ["went — минуле.", "→ didn't they."], "…, <b>didn't they</b>?", { "don't they": "went — минуле: <b>didn't they</b>.", "weren't they": "went — звичайне дієслово: <b>didn't they</b>." }),
        ch("He doesn't eat meat, ___?", ["does he", "doesn't he"], "does he", ["Заперечення doesn't.", "→ без not."], "…, <b>does he</b>?", { "doesn't he": "Заперечення → хвостик без not: <b>does he</b>." }),
        inp(TQ, "Anna plays the piano, ___?", ["doesn't she"], ["plays — she.", "→ doesn't she."], "…, <b>doesn't she</b>?", { "does she": "Ствердження → з not: <b>doesn't she</b>.", "don't she": "she → <b>doesn't</b>.", "isn't she": "plays — звичайне дієслово: <b>doesn't she</b>." }),
        inp(TQ, "You didn't call me, ___?", ["did you"], ["Заперечення didn't.", "→ без not."], "…, <b>did you</b>?", { "didn't you": "Заперечення → хвостик без not: <b>did you</b>." }),
        inp(TQ, "Your parents work in Kyiv, ___?", ["don't they"], ["work — they.", "→ don't they."], "…, <b>don't they</b>?", { "doesn't they": "they → <b>don't</b>.", "don't your parents": "У хвостику — займенник: <b>don't they</b>.", "do they": "Ствердження → з not: <b>don't they</b>." }),
        inp(TQ, "We watched a good film, ___?", ["didn't we"], ["watched — минуле.", "→ didn't we."], "…, <b>didn't we</b>?", { "don't we": "watched — минуле: <b>didn't we</b>.", "did we": "Ствердження → з not: <b>didn't we</b>." }),
        fix("You like English, do you?", 3, "You like English, don't you?", ["Речення стверджувальне.", "Хвостик — з not."], "…, <b>don't</b> you?"),
        dict("She speaks English, doesn't she?", [DH, "speaks → doesn't she."], "…, <b>doesn't she</b>?", { "She speaks English, don't she?": "she → <b>doesn't</b>." })
      ] }
  ] });

  /* ===================== PAST PERFECT ===================== */
  w("lessons/l23.json", {
    id: "l23", title: "Past Perfect: що сталося раніше",
    skillFiles: ["skills/pperf.json"],
    skills: ["pperf.form", "pperf.negq", "pperf.mix"],
    practice: { perSkill: 4 },
    test: { plan: { "pperf.form": 3, "pperf.negq": 2, "pperf.mix": 3 }, pass: 80 },
    explain: [
      { e: "⏪", h: "«Минуле в минулому»",
        html: `<p>Коли розповідаємо про минуле і хочемо показати, що одна дія сталася <b>ще раніше</b> за іншу.</p>
        <div class="rule-box"><b>had</b> + третя форма — для всіх однаково</div>
        ${say("When we arrived, the film had started.", "Коли ми прийшли, фільм уже почався.", "When we arrived, the film <b>had started</b>.")}
        <p class="muted">Спершу почався фільм (had started), потім ми прийшли (arrived).</p>` },
      { e: "🙅", h: "Заперечення і питання",
        html: `${say("I hadn't finished when the bell rang.", "Я ще не закінчила, коли пролунав дзвоник.", "I <b>hadn't finished</b> when the bell rang.")}
        ${say("Had you eaten before you came? Yes, I had.", "Ти поїла, перш ніж прийти? — Так.", "<b>Had</b> you <b>eaten</b> before you came? — Yes, I <b>had</b>.")}` },
      { e: "🔎", h: "Підказки",
        html: `<p>by the time (до того часу як), by 10 o'clock (до 10-ї), already, never … before, before / after.</p>
        ${say("By the time I woke up, Mum had made breakfast.", "Коли я прокинулась, мама вже приготувала сніданок.", "By the time I woke up, Mum <b>had made</b> breakfast.")}
        <div class="tip">💡 Дві дії в минулому: та, що <b>раніше</b> — had + третя форма; та, що пізніше — звичайний Past Simple.</div>` }
    ],
    examples: { title: "Запізнились!",
      question: { q: "чому «the train <b>had left</b>», а «we <b>arrived</b>»?", a: "Потяг поїхав раніше (Past Perfect), а ми прибули пізніше (Past Simple)." },
      items: [
        ["Last Sunday we went to the station to meet Grandma.", "Минулої неділі ми поїхали на вокзал зустріти бабусю."],
        ["But when we <b>arrived</b>, her train <b>had</b> already <b>come</b>!", "Але коли ми приїхали, її потяг уже прибув!"],
        ["Grandma <b>had waited</b> for twenty minutes.", "Бабуся чекала двадцять хвилин."],
        ["She <b>had bought</b> a coffee and <b>had found</b> a seat.", "Вона купила каву і знайшла місце."],
        ["She wasn't angry because she <b>had read</b> half of her book!", "Вона не сердилась, бо встигла прочитати пів книжки!"]
      ] },
    words: [
      ["by the time", "до того часу як"], ["before", "до, перед тим як"], ["after", "після того як"], ["already", "вже"], ["station", "вокзал"],
      ["arrive", "прибувати"], ["leave", "від'їжджати"], ["wait", "чекати"], ["angry", "сердитий"], ["half", "половина"]
    ]
  });

  const HP = "Впиши had + третю форму";
  w("skills/pperf.json", { topic: "pperf", title: "Past Perfect", skills: [
    { id: "pperf.form", title: "had + третя форма",
      rule: "had + третя форма для всіх: I had finished, she had seen.",
      worked: { p: "I didn't go to the cinema because I ___ that film before. (see)", steps: ["Фільм бачила <b>раніше</b> за «не пішла» → Past Perfect.", "had + третя форма: see – saw – <b>seen</b>.", "Відповідь: I <b>had seen</b> that film before."] },
      alt: `<p>Це як Present Perfect (have / has + третя форма), тільки «на крок назад у минуле»: have / has → <b>had</b>.</p><p>I have eaten → I <b>had</b> eaten. She has gone → she <b>had</b> gone.</p>`,
      items: [
        ch("When we arrived, the film ___ started.", ["had", "has", "have"], "had", ["Фільм почався раніше, ніж ми прийшли (минуле).", "had."], "<b>had</b> started.", { "has": "Розповідь про минуле: <b>had</b> started.", "have": "Розповідь про минуле: <b>had</b> started." }),
        ch("She had ___ her homework before dinner.", ["done", "did", "do"], "done", ["Після had — третя форма.", "do – did – done."], "had <b>done</b>.", { "did": "Після had — третя форма: <b>done</b>.", "do": "Після had — третя форма: <b>done</b>." }),
        inp(HP, "By 10 o'clock I ___ my room. (clean)", ["had cleaned", "'d cleaned"], ["By 10 o'clock — до 10-ї (у минулому).", "had + cleaned."], "<b>had cleaned</b>.", { "have cleaned": "Це минуле: <b>had</b> cleaned.", "cleaned": "By … — до моменту в минулому: <b>had cleaned</b>." }),
        inp(HP, "They ___ the tickets before the trip. (buy)", ["had bought", "'d bought"], ["Купили раніше за поїздку.", "buy – bought – bought."], "<b>had bought</b>.", { "had buyed": "buy — неправильне: <b>bought</b>.", "has bought": "Це минуле: <b>had</b> bought." }, S),
        inp(HP, "I didn't go to the cinema because I ___ that film before. (see)", ["had seen", "'d seen"], ["Бачила раніше.", "see – saw – seen."], "<b>had seen</b>.", { "have seen": "Розповідь про минуле: <b>had</b> seen.", "had saw": "Третя форма: <b>seen</b>." }, S),
        inp(HP, "When I got home, my brother ___ all the cake. (eat)", ["had eaten", "'d eaten"], ["Брат з'їв раніше, ніж я прийшла.", "eat – ate – eaten."], "<b>had eaten</b>.", { "had ate": "Третя форма: <b>eaten</b>.", "ate": "Він з'їв ще до того, як я прийшла: <b>had eaten</b>." }, S),
        fix("When I came, they has left.", 4, "When I came, they had left.", ["Розповідь про минуле.", "has → had."], "they <b>had</b> left."),
        fix("She had wrote the letter before lunch.", 2, "She had written the letter before lunch.", ["Після had — третя форма.", "write – wrote – written."], "had <b>written</b>."),
        dict("The train had left when we arrived.", [DH, "Потяг поїхав раніше → had left."], "<b>had left</b>.", { "The train has left when we arrived.": "Розповідь про минуле: <b>had</b> left." })
      ] },
    { id: "pperf.negq", title: "hadn't, Had you…?",
      rule: "hadn't + третя форма; Had + хто + третя форма? — Yes, I had. / No, she hadn't.",
      worked: { p: "We ___ the news before you told us. (not hear)", steps: ["Ми не чули раніше, ніж ти сказала → Past Perfect.", "Заперечення: <b>hadn't</b> + третя форма.", "hear – heard – <b>heard</b>.", "Відповідь: We <b>hadn't heard</b> the news."] },
      alt: `<p>Усе крутиться довкола <b>had</b>: «не» — hadn't, питання — Had на початок. did тут не потрібен.</p>`,
      items: [
        ch("I ___ finished when the bell rang.", ["hadn't", "didn't", "haven't"], "hadn't", ["Ще не закінчила до дзвінка.", "hadn't."], "<b>hadn't</b> finished.", { "didn't": "Після didn't — перша форма. Тут: <b>hadn't</b> finished.", "haven't": "Розповідь про минуле: <b>hadn't</b>." }),
        ch("___ you eaten before you came?", ["Had", "Did", "Have"], "Had", ["eaten — третя форма, дія раніше.", "Had."], "<b>Had</b> you eaten…?", { "Did": "eaten — третя форма, тож <b>Had</b>.", "Have": "Розповідь про минуле: <b>Had</b>." }),
        ch("Had she seen the film before? — No, she ___.", ["hadn't", "didn't", "hasn't"], "hadn't", ["Питали з Had.", "hadn't."], "No, she <b>hadn't</b>.", { "didn't": "Питали з Had: <b>hadn't</b>.", "hasn't": "Питали з Had: <b>hadn't</b>." }),
        inp("Впиши заперечення з дієсловом", "We ___ the news before you told us. (not hear)", ["hadn't heard", "had not heard"], ["hadn't + третя форма.", "hear – heard – heard."], "<b>hadn't heard</b>.", { "didn't hear": "Не чули ще ДО того → <b>hadn't heard</b>.", "hadn't heared": "hear — неправильне: <b>heard</b>." }, S),
        inp("Впиши Had", "___ they left before you arrived?", ["Had"], ["left — третя форма, раніше.", "Had."], "<b>Had</b> they left…?", { "Did": "left тут — третя форма: <b>Had</b>.", "Have": "Розповідь про минуле: <b>Had</b>." }),
        inp("Впиши коротку відповідь", "Had you done your homework? — Yes, I ___.", ["had"], ["Питали з Had.", "Yes, I had."], "Yes, I <b>had</b>.", { "did": "Питали з Had: Yes, I <b>had</b>.", "have": "Питали з Had: Yes, I <b>had</b>." }),
        fix("Had you saw the film before?", 2, "Had you seen the film before?", ["Після Had — третя форма.", "see – saw – seen."], "Had you <b>seen</b>…?"),
        dict("She hadn't seen the sea before.", [DH, "hadn't + seen."], "<b>hadn't seen</b>.", { "She didn't seen the sea before.": "Після didn't — перша форма; тут <b>hadn't</b> seen." })
      ] },
    { id: "pperf.mix", title: "Past Simple чи Past Perfect",
      rule: "Дія, яка сталася раніше за іншу в минулому, — had + третя форма; пізніша — Past Simple. by the time → Past Perfect.",
      worked: { p: "By the time we arrived, the party ___. (finish)", steps: ["Дві дії: ми прийшли і вечірка закінчилась.", "Що раніше? Вечірка закінчилась <b>до</b> нашого приходу.", "Раніша дія → <b>had finished</b>.", "Відповідь: the party <b>had finished</b>."] },
      alt: `<p>Намалюй стрілку часу ⏪: дія лівіше (раніше) — had + третя форма, дія правіше — Past Simple.</p><p>⬅️ the film <b>had started</b> … ➡️ we <b>arrived</b>.</p>`,
      items: [
        ch("When I arrived at the station, the train ___.", ["had left", "leaves", "has left"], "had left", ["Потяг поїхав раніше, ніж я прийшла.", "had left."], "<b>had left</b>.", { "leaves": "Розповідь про минуле, дія раніше: <b>had left</b>.", "has left": "Розповідь про минуле: <b>had</b> left." }),
        ch("After she ___ her homework, she watched TV.", ["had done", "has done", "does"], "had done", ["Спершу уроки, потім телевізор.", "had done."], "<b>had done</b>.", { "has done": "Розповідь про минуле: <b>had</b> done.", "does": "Розповідь про минуле: <b>had done</b>." }),
        ch("I ___ my keys, so I couldn't open the door.", ["had lost", "have lost", "lose"], "had lost", ["Ключі загубила раніше.", "had lost."], "<b>had lost</b>.", { "have lost": "Розповідь про минуле: <b>had</b> lost.", "lose": "Розповідь про минуле: <b>had lost</b>." }),
        ch("Яке речення правильне?", ["When I came home, my brother had eaten all the cake.", "When I came home, my brother has eaten all the cake."], "When I came home, my brother had eaten all the cake.", ["Розповідь про минуле.", "Раніша дія → had eaten."], "…my brother <b>had eaten</b>…", { "When I came home, my brother has eaten all the cake.": "Розповідь про минуле: <b>had</b> eaten." }),
        inp("Впиши дієслово (Past Simple або Past Perfect)", "By the time we arrived, the party ___. (finish)", ["had finished", "'d finished"], ["By the time — до того моменту.", "had + finished."], "<b>had finished</b>.", { "finished": "By the time — вечірка закінчилась ДО того: <b>had finished</b>.", "has finished": "Розповідь про минуле: <b>had</b> finished." }),
        inp("Впиши дієслово (Past Simple або Past Perfect)", "By 2020 my family ___ to Kyiv. (move)", ["had moved", "'d moved"], ["By 2020 — до 2020 року.", "had + moved."], "<b>had moved</b>.", { "moved": "By 2020 — до того моменту: <b>had moved</b>.", "has moved": "Це минуле: <b>had</b> moved." }),
        inp("Впиши дієслово (Past Simple або Past Perfect)", "Before that trip I ___ snow. (never see)", ["had never seen", "'d never seen"], ["Досвід до моменту в минулому.", "had never + seen."], "<b>had never seen</b>.", { "never saw": "Досвід до моменту в минулому: <b>had never seen</b>.", "have never seen": "Це про минуле: <b>had</b> never seen.", "had never saw": "Третя форма: <b>seen</b>." }, S),
        fix("When we got to the station, the train has left.", 8, "When we got to the station, the train had left.", ["Розповідь про минуле.", "has → had."], "the train <b>had</b> left."),
        dict("By the time I woke up, Mum had made breakfast.", [DH, "By the time → had made."], "<b>had made</b>.", { "By the time I woke up, Mum made breakfast.": "By the time — сніданок був готовий ДО того: <b>had made</b>." })
      ] }
  ] });

  /* ===================== PRESENT PERFECT CONTINUOUS ===================== */
  w("lessons/l24.json", {
    id: "l24", title: "Present Perfect Continuous; Present Perfect чи Past Simple",
    skillFiles: ["skills/ppc.json"],
    skills: ["ppc.form", "pp.vs"],
    practice: { perSkill: 5 },
    test: { plan: { "ppc.form": 4, "pp.vs": 4 }, pass: 80 },
    explain: [
      { e: "⏳", h: "Як довго? — have been + -ing",
        html: `<p>Дія почалась у минулому і <b>триває досі</b>.</p>
        <div class="rule-box"><b>have / has been</b> + дієслово з <b>-ing</b></div>
        ${say("I have been learning English for five years.", "Я вчу англійську вже п'ять років.", "I <b>have been learning</b> English for five years.")}
        ${say("How long have you been waiting?", "Скільки ти вже чекаєш?", "How long <b>have</b> you <b>been waiting</b>?")}` },
      { e: "📏", h: "for чи since",
        html: `<table class="t"><tr><td><b>for</b></td><td>скільки часу</td><td>for two hours, for a week, for five years</td></tr>
        <tr><td><b>since</b></td><td>з якого моменту</td><td>since 9 o'clock, since Monday, since 2020</td></tr></table>` },
      { e: "⚖️", h: "Present Perfect чи Past Simple",
        html: `<table class="t"><tr><td><b>Past Simple</b></td><td>є час у минулому: yesterday, last week, in 2020, ago</td><td>I <b>saw</b> it yesterday.</td></tr>
        <tr><td><b>Present Perfect</b></td><td>час не важливий; досвід (ever, never); результат зараз; just / already / yet</td><td>I <b>have seen</b> it three times.</td></tr></table>
        <div class="tip">⚠️ <s>I have seen him yesterday</s> — з yesterday тільки Past Simple: I <b>saw</b> him yesterday.</div>` }
    ],
    examples: { title: "На тренуванні",
      question: { q: "чому «I <b>have been playing</b>», а «I <b>started</b> in 2021»?", a: "Граю досі (з 2021 і тепер) — have been playing. Почала в конкретний момент у минулому — started." },
      items: [
        ["How long <b>have</b> you <b>been playing</b> volleyball?", "Як довго ти граєш у волейбол?"],
        ["I<b>'ve been playing</b> for three years. I <b>started</b> in 2021.", "Граю три роки. Почала в 2021."],
        ["Our coach <b>has been working</b> here since 2019.", "Наш тренер працює тут з 2019 року."],
        ["We<b>'ve won</b> five games this season!", "Цього сезону ми виграли п'ять ігор!"],
        ["Last Saturday we <b>won</b> against the best team.", "Минулої суботи ми виграли в найкращої команди."]
      ] },
    words: [
      ["for", "протягом (скільки часу)"], ["since", "з (якогось моменту)"], ["how long", "як довго"], ["coach", "тренер"], ["team", "команда"],
      ["season", "сезон"], ["practise", "тренуватися"], ["win", "вигравати"], ["match", "матч"], ["still", "досі, все ще"]
    ]
  });

  w("skills/ppc.json", { topic: "ppc", title: "Present Perfect Continuous", skills: [
    { id: "ppc.form", title: "have / has been + -ing, for / since",
      rule: "have / has been + -ing — почалось і триває досі. for + скільки часу; since + з якого моменту.",
      worked: { p: "It ___ all day. (rain)", steps: ["Дощ почався зранку і <b>досі</b> йде.", "it → <b>has been</b> + raining.", "Відповідь: It <b>has been raining</b> all day."] },
      alt: `<p>Три цеглинки: <b>have / has</b> + <b>been</b> + <b>-ing</b>. Жодної не пропускай.</p><p>for — «скільки» (two hours), since — «відколи» (Monday).</p>`,
      items: [
        ch("I ___ English for three years.", ["have been learning", "am learning", "learn"], "have been learning", ["for three years — і досі.", "have been + -ing."], "<b>have been learning</b>.", { "am learning": "З for … (скільки часу досі) — <b>have been learning</b>.", "learn": "Дія триває досі: <b>have been learning</b>." }),
        ch("She has been ___ since 9 o'clock.", ["working", "worked", "work"], "working", ["has been + …", "-ing."], "has been <b>working</b>.", { "worked": "Після has been — -ing: <b>working</b>.", "work": "Після has been — -ing: <b>working</b>." }),
        ch("How long ___ you been waiting?", ["have", "has", "are"], "have", ["you → have.", "have been waiting."], "How long <b>have</b> you…?", { "has": "you → <b>have</b>.", "are": "have been + -ing: <b>have</b>." }),
        ch("We have lived here ___ 2015.", ["since", "for"], "since", ["2015 — момент, з якого.", "since."], "<b>since</b> 2015.", { "for": "2015 — це момент: <b>since</b>." }),
        ch("He has been playing ___ two hours.", ["for", "since"], "for", ["two hours — скільки часу.", "for."], "<b>for</b> two hours.", { "since": "two hours — проміжок: <b>for</b>." }),
        inp("Впиши have / has been + дієслово з -ing", "It ___ all day. (rain)", ["has been raining", "'s been raining"], ["it → has.", "has been + raining."], "<b>has been raining</b>.", { "is raining": "all day — з ранку і досі: <b>has been raining</b>.", "have been raining": "it → <b>has</b> been." }),
        inp("Впиши have / has been + дієслово з -ing", "I ___ for you for an hour! (wait)", ["have been waiting", "'ve been waiting"], ["I → have.", "have been + waiting."], "<b>have been waiting</b>.", { "am waiting": "for an hour — і досі: <b>have been waiting</b>.", "has been waiting": "З I — <b>have</b> been." }),
        inp("Впиши for або since", "They have been friends ___ 2020.", ["since"], ["2020 — момент.", "since."], "<b>since</b> 2020.", { "for": "2020 — момент, з якого: <b>since</b>." }),
        inp("Впиши for або since", "I've been reading this book ___ a week.", ["for"], ["a week — скільки часу.", "for."], "<b>for</b> a week.", { "since": "a week — проміжок: <b>for</b>." }),
        fix("She have been studying all morning.", 1, "She has been studying all morning.", ["She → ?", "has."], "she <b>has</b> been."),
        dict("How long have you been learning English?", [DH, "Як довго (і досі) → have you been learning."], "How long <b>have</b> you <b>been learning</b>…?", { "How long are you learning English?": "Як довго (і досі) — <b>have you been learning</b>." })
      ] },
    { id: "pp.vs", title: "Present Perfect чи Past Simple",
      rule: "Є час у минулому (yesterday, last week, ago, in 2020) → Past Simple. Досвід, результат зараз, ever / never / just / yet, час не названо → Present Perfect.",
      worked: { p: "I ___ this film last week. (see)", steps: ["Є підказка часу: <b>last week</b>.", "Конкретний час у минулому → Past Simple.", "see → <b>saw</b>.", "Відповідь: I <b>saw</b> this film last week."] },
      alt: `<p>Шукай «годинник» у реченні 🕰️: yesterday, last…, ago, in 2020, when…? Є → Past Simple. Немає, а важливий результат чи досвід → Present Perfect.</p>`,
      items: [
        ch("I ___ my homework. Can I go out now?", ["have done", "did"], "have done", ["Результат зараз (можна гуляти).", "Present Perfect."], "<b>have done</b>.", { "did": "Важливий результат зараз, час не названо: <b>have done</b>." }),
        ch("I ___ my homework yesterday.", ["did", "have done"], "did", ["yesterday — конкретний час.", "Past Simple."], "yesterday → <b>did</b>.", { "have done": "З yesterday — Past Simple: <b>did</b>." }),
        ch("We ___ to Lviv last summer.", ["went", "have gone"], "went", ["last summer — конкретний час.", "Past Simple."], "last summer → <b>went</b>.", { "have gone": "З last summer — Past Simple: <b>went</b>." }),
        inp("Впиши дієслово (Present Perfect або Past Simple)", "I ___ this film last week. (see)", ["saw"], ["last week — конкретний час.", "see → saw."], "<b>saw</b>.", { "have seen": "З last week — Past Simple: <b>saw</b>." }, S),
        inp("Впиши дієслово (Present Perfect або Past Simple)", "I ___ this film three times. (see)", ["have seen", "'ve seen"], ["Досвід, час не названо.", "have + seen."], "<b>have seen</b>.", { "saw": "Досвід без конкретного часу — <b>have seen</b>." }, S),
        inp("Впиши дієслово (Present Perfect або Past Simple)", "My sister ___ her leg — she can't walk! (break)", ["has broken", "'s broken"], ["Результат зараз — не може ходити.", "has + broken."], "<b>has broken</b>.", { "broke": "Важливий результат зараз: <b>has broken</b>.", "has broke": "Третя форма: <b>broken</b>." }, S),
        inp("Впиши дієслово (Present Perfect або Past Simple)", "Shakespeare ___ many plays. (write)", ["wrote"], ["Шекспір жив давно — це закінчене минуле.", "write → wrote."], "<b>wrote</b>.", { "has written": "Шекспір жив давно, його час минув: <b>wrote</b>." }, S),
        fix("I have seen him yesterday.", 1, "I saw him yesterday.", ["yesterday → Past Simple.", "have тут зайве: I saw."], "yesterday → <b>I saw</b>."),
        dict("Have you finished your project yet?", [DH, "yet → Present Perfect."], "<b>Have</b> you <b>finished</b>… yet?", { "Did you finish your project yet?": "yet → Present Perfect: <b>Have you finished</b>…?" })
      ] }
  ] });

  /* ===================== ПРОПОЗИЦІЇ Й ЗАПРОШЕННЯ ===================== */
  w("lessons/l25.json", {
    id: "l25", title: "Пропозиції й запрошення: Would you like…? Let's…",
    skillFiles: ["skills/off.json"],
    skills: ["off.would", "off.lets"],
    practice: { perSkill: 5 },
    test: { plan: { "off.would": 4, "off.lets": 4 }, pass: 80 },
    explain: [
      { e: "☕", h: "Would you like…? — ввічлива пропозиція",
        html: `${say("Would you like some tea?", "Хочеш чаю?", "<b>Would you like</b> some tea?")}
        ${say("Would you like to come to my party?", "Хочеш прийти на мою вечірку?", "<b>Would you like to come</b> to my party?")}
        <table class="t"><tr><td>Would you like + <b>щось</b>?</td><td>Would you like an apple?</td></tr>
        <tr><td>Would you like + <b>to</b> + дієслово?</td><td>Would you like to dance?</td></tr></table>
        <p>Відповіді: <b>Yes, please.</b> / <b>I'd love to!</b> / <b>No, thank you.</b> / <b>I'm afraid I can't.</b></p>
        <div class="tip">⚠️ Do you like…? = «Ти любиш…?» (взагалі). Would you like…? = «Хочеш…?» (зараз).</div>` },
      { e: "🙌", h: "Let's… Shall we…? Why don't we…?",
        html: `${say("Let's go to the park!", "Ходімо в парк!", "<b>Let's go</b> to the park!")}
        ${say("Shall we play chess?", "Зіграємо в шахи?", "<b>Shall we play</b> chess?")}
        ${say("Why don't we watch a film?", "Може, подивимось фільм?", "<b>Why don't we watch</b> a film?")}
        <p>Після Let's / Shall we / Why don't we — дієслово <b>без to</b>.</p>
        <p>Відповіді: <b>That's a good idea!</b> / <b>Great!</b> / <b>Sorry, I can't.</b></p>` }
    ],
    examples: { title: "Плануємо суботу",
      question: { q: "чому «Would you like <b>to come</b>», а «Let's <b>go</b>» без to?", a: "Після would like — to + дієслово. Після Let's, Shall we, Why don't we — без to." },
      items: [
        ["Hi Kate! <b>Would you like to come</b> to my place on Saturday?", "Привіт, Кейт! Хочеш прийти до мене в суботу?"],
        ["<b>I'd love to!</b> What shall we do?", "Із задоволенням! Що робитимемо?"],
        ["<b>Let's bake</b> a cake!", "Давай спечемо торт!"],
        ["<b>Why don't we invite</b> Max too? — <b>That's a good idea!</b>", "Може, запросимо ще й Макса? — Гарна ідея!"],
        ["<b>Would you like</b> some lemonade? — <b>Yes, please.</b>", "Хочеш лимонаду? — Так, будь ласка."]
      ] },
    words: [
      ["invite", "запрошувати"], ["invitation", "запрошення"], ["accept", "приймати"], ["refuse", "відмовляти"], ["suggest", "пропонувати"],
      ["idea", "ідея"], ["I'd love to", "із задоволенням"], ["I'm afraid", "на жаль, боюся"], ["Yes, please", "так, будь ласка"], ["No, thank you", "ні, дякую"]
    ]
  });

  w("skills/off.json", { topic: "off", title: "Пропозиції й запрошення", skills: [
    { id: "off.would", title: "Would you like…? / I'd like…",
      rule: "Would you like + щось? Would you like + to + дієслово? Відповідь: Yes, please / I'd love to / No, thank you.",
      worked: { p: "Would you like ___ with us? (play)", steps: ["Після <b>would like</b> — to + дієслово.", "→ <b>to play</b>.", "Відповідь: Would you like <b>to play</b> with us?"] },
      alt: `<p>Would you like = «Чи не хочеш…?» — ввічливо. Після нього або річ (some tea), або <b>to</b> + дія (to come).</p><p>Не плутай з Do you like…? — «Ти любиш…?»</p>`,
      items: [
        ch("___ you like some tea?", ["Would", "Do", "Will"], "Would", ["Пропонуємо чай зараз.", "Would you like…?"], "<b>Would</b> you like…?", { "Do": "Do you like = «чи любиш». Пропозиція — <b>Would</b> you like?", "Will": "Пропозиція — <b>Would</b> you like?" }),
        ch("Would you like ___ to the cinema?", ["to go", "go", "going"], "to go", ["Після would like…", "to + дієслово."], "would like <b>to go</b>.", { "go": "Після would like — <b>to</b> go.", "going": "Після would like — <b>to go</b>." }),
        ch("Would you like to come? — Yes, ___!", ["I'd love to", "I love", "I would like"], "I'd love to", ["Радо погоджуємось.", "I'd love to!"], "<b>I'd love to!</b>", { "I love": "Погодитись на запрошення — <b>I'd love to!</b>", "I would like": "Природніше: <b>I'd love to!</b>" }),
        ch("Would you like an apple? Як ввічливо відмовитись?", ["No, thank you.", "No, I wouldn't like.", "No, I don't."], "No, thank you.", ["Ввічлива відмова.", "No, thank you."], "<b>No, thank you.</b>", { "No, I wouldn't like.": "Ввічливо: <b>No, thank you.</b>", "No, I don't.": "Ввічливо: <b>No, thank you.</b>" }),
        inp("Впиши потрібне слово", "Would you like ___ cake?", ["some"], ["Пропонуємо — some, навіть у питанні.", "some."], "<b>some</b> cake.", { "any": "У пропозиціях — <b>some</b>." }),
        inp("Впиши дієслово в правильній формі", "Would you like ___ with us? (play)", ["to play"], ["would like + to.", "to play."], "<b>to play</b>.", { "play": "Після would like — <b>to</b> play.", "playing": "Після would like — <b>to play</b>." }),
        inp("Впиши потрібне слово", "___ you like a cup of coffee?", ["Would"], ["Ввічлива пропозиція.", "Would."], "<b>Would</b> you like…?", { "Do": "Пропозиція — <b>Would</b> you like…?", "Will": "Пропозиція — <b>Would</b> you like…?" }),
        fix("Would you like go to the park?", 3, "Would you like to go to the park?", ["Після would like…", "…to + дієслово."], "would like <b>to go</b>."),
        dict("Would you like to come to my party?", [DH, "would like + to come."], "<b>Would you like to come</b>…?", { "Do you like to come to my party?": "Запрошення — <b>Would</b> you like…?", "Would you like come to my party?": "Після would like — <b>to</b> come." })
      ] },
    { id: "off.lets", title: "Let's… Shall we…? Why don't we…?",
      rule: "Let's / Shall we / Why don't we + дієслово без to. Відповідь: That's a good idea! / Sorry, I can't.",
      worked: { p: "Let's ___ Grandma tomorrow. (visit)", steps: ["Після <b>Let's</b> — дієслово без to.", "→ <b>visit</b>.", "Відповідь: Let's <b>visit</b> Grandma tomorrow."] },
      alt: `<p>Let's = let us, «давай(те)». Після Let's, Shall we, Why don't we — «голе» дієслово, як після can.</p>`,
      items: [
        ch("___ go to the park!", ["Let's", "Shall", "Why"], "Let's", ["«Ходімо!»", "Let's."], "<b>Let's</b> go…!", { "Shall": "Shall — у питанні: Shall we go? Тут <b>Let's</b>.", "Why": "Повністю: Why don't we go? Тут <b>Let's</b>." }),
        ch("Let's ___ a pizza!", ["make", "to make", "making"], "make", ["Після Let's…", "…без to."], "Let's <b>make</b>.", { "to make": "Після Let's — без to: <b>make</b>.", "making": "Після Let's — перша форма: <b>make</b>." }),
        ch("___ we play chess?", ["Shall", "Let's", "Do"], "Shall", ["Пропозиція-питання.", "Shall we…?"], "<b>Shall</b> we…?", { "Let's": "Let's — без питання: Let's play. Питання — <b>Shall</b> we?", "Do": "Пропозиція — <b>Shall</b> we play?" }),
        ch("Why don't we ___ a film?", ["watch", "to watch", "watching"], "watch", ["Після Why don't we…", "…без to."], "<b>watch</b>.", { "to watch": "Після Why don't we — без to: <b>watch</b>.", "watching": "Перша форма: <b>watch</b>." }),
        ch("Let's go swimming! Як погодитись?", ["That's a good idea!", "Yes, I go.", "Yes, I like."], "That's a good idea!", ["Погоджуємось на пропозицію.", "That's a good idea!"], "<b>That's a good idea!</b>", { "Yes, I go.": "Погодитись: <b>That's a good idea!</b>", "Yes, I like.": "Погодитись: <b>That's a good idea!</b>" }),
        inp("Впиши дієслово", "Let's ___ Grandma tomorrow. (visit)", ["visit"], ["Після Let's — без to.", "visit."], "Let's <b>visit</b>.", { "to visit": "Після Let's — без to: <b>visit</b>.", "visiting": "Перша форма: <b>visit</b>." }),
        inp("Впиши Let's або Shall", "___ we meet at five?", ["Shall"], ["Це питання (знак ?).", "Shall we…?"], "<b>Shall</b> we meet…?", { "Let's": "Це питання: <b>Shall</b> we…?" }),
        fix("Let's to go home.", 1, "Let's go home.", ["Після Let's…", "…to зайве."], "Let's <b>go</b>."),
        dict("Shall we go to the cinema?", [DH, "Shall we + go."], "<b>Shall we go</b>…?", { "Shall we to go to the cinema?": "Після Shall we — без to." })
      ] }
  ] });
};
