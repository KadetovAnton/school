// Уроки 2–4: Present Simple (заперечення, питання), Present Continuous, Simple чи Continuous
module.exports = function (w) {
  const say = (en, ua, hl) => `<div class="ex"><div><div class="en">${hl || en}</div><div class="ua">${ua}</div></div><button class="say round" data-say="${en}">🔊</button></div>`;
  const inp = (task, p, a, h, e, err, extra) => Object.assign({ type: "input", task, p, a: Array.isArray(a) ? a : [a], h, e, err }, extra || {});
  const ch = (p, o, a, h, e, err) => ({ type: "choice", p, o, a, h, e, err });
  const fix = (p, bad, a, h, e) => ({ type: "fix", task: "Знайди і натисни слово з помилкою", p, bad, a, h, e });
  const dict = (a, h, e, err) => ({ type: "dict", task: "Послухай і напиши речення", p: "🎧 " + a, a: [a], h, e, err });
  const ord = (p, words, a, h, e, end) => Object.assign({ type: "order", task: "Склади речення", p, words, a, h, e }, end ? { end } : {});
  const DH = "Послухай ще раз — можна повільно 🐢";

  /* ===================== УРОК 2 ===================== */
  const DD = "Впиши do / does або don't / doesn't з дієсловом";
  w("lessons/l2.json", {
    id: "l2", title: "Present Simple: заперечення і питання",
    skillFiles: ["skills/psnq.json"],
    skills: ["ps.neg", "ps.q", "ps.short", "ps.wh"],
    practice: { perSkill: 3 },
    test: { plan: { "ps.neg": 2, "ps.q": 2, "ps.short": 2, "ps.wh": 2 }, pass: 80 },
    explain: [
      { e: "🙅", h: "Як сказати «не»",
        html: `<p>Перед дієсловом ставимо помічника: <b>don't</b> або <b>doesn't</b>.</p>
        <table class="t"><tr><td>I / you / we / they</td><td><b>don't</b> + дієслово</td></tr>
        <tr><td>he / she / it</td><td><b>doesn't</b> + дієслово</td></tr></table>
        ${say("I don't like milk.", "Я не люблю молоко.", "I <b>don't</b> like milk.")}
        ${say("She doesn't like milk.", "Вона не любить молоко.", "She <b>doesn't</b> like milk.")}
        <div class="tip">💡 don't = do not, doesn't = does not. Обидва варіанти правильні.</div>` },
      { e: "🧳", h: "Куди зникає -s?",
        html: `<p>Хвостик -s «переїжджає» в помічника: <b>does</b>. Тому саме дієслово лишається без змін.</p>
        <div class="rule-box" style="text-align:center;font-size:18px;font-weight:900">She play<b>s</b>. → She doe<b>s</b>n't play.</div>
        ${say("Tom doesn't play football.", "Том не грає у футбол.", "Tom doesn't <b>play</b> football.")}
        <div class="tip">⚠️ Пастка: <s>She doesn't plays</s>. Двох -s в одному реченні не буває!</div>` },
      { e: "❓", h: "Питання: Do чи Does?",
        html: `<p>Щоб запитати, ставимо помічника <b>на початок</b>:</p>
        <table class="t"><tr><td><b>Do</b></td><td>I / you / we / they + дієслово?</td></tr>
        <tr><td><b>Does</b></td><td>he / she / it + дієслово?</td></tr></table>
        ${say("Do you like pizza?", "Ти любиш піцу?", "<b>Do</b> you like pizza?")}
        ${say("Does your sister play the piano?", "Твоя сестра грає на піаніно?", "<b>Does</b> your sister <b>play</b> the piano?")}
        <div class="tip">💡 І тут -s живе тільки в Does: <s>Does she likes</s> → Does she <b>like</b>?</div>` },
      { e: "💬", h: "Короткі відповіді",
        html: `<p>Відповідаємо тим самим помічником, а не всім реченням:</p>
        <table class="t"><tr><td>Do you…?</td><td>Yes, I <b>do</b>. / No, I <b>don't</b>.</td></tr>
        <tr><td>Does he…?</td><td>Yes, he <b>does</b>. / No, he <b>doesn't</b>.</td></tr></table>
        ${say("Do you like cats? Yes, I do.", "Ти любиш котів? — Так.", "Do you like cats? — Yes, I <b>do</b>.")}
        <div class="tip">⚠️ Не кажемо «Yes, I like» чи «Yes, he do».</div>` },
      { e: "🗺️", h: "Питання з What, Where, When…",
        html: `<p>Питальне слово стає першим, далі все як у звичайному питанні:</p>
        <div class="rule-box"><b>Питальне слово → do / does → хто → дієслово?</b></div>
        ${say("What do you do after school?", "Що ти робиш після школи?", "<b>What do</b> you do after school?")}
        ${say("Where does your mum work?", "Де працює твоя мама?", "<b>Where does</b> your mum <b>work</b>?")}
        ${say("When does the lesson start?", "Коли починається урок?", "<b>When does</b> the lesson <b>start</b>?")}
        <p class="muted">What — що, Where — де, When — коли, What time — о котрій, Why — чому, How — як.</p>` }
    ],
    examples: { title: "Інтерв'ю з Максом",
      question: { q: "чому «Does he <b>play</b>», а не «Does he plays»?", a: "Бо -s уже «з'їла» does. У дієслові він не потрібен." },
      items: [
        ["<b>Do</b> you like sport, Max?", "Ти любиш спорт, Максе?"],
        ["Yes, I <b>do</b>. I play football every day.", "Так. Я граю у футбол щодня."],
        ["<b>Does</b> your brother play too?", "Твій брат теж грає?"],
        ["No, he <b>doesn't</b>. He <b>doesn't like</b> football.", "Ні. Він не любить футбол."],
        ["<b>What does</b> he <b>do</b> after school?", "Що він робить після школи?"],
        ["He draws pictures and listens to music.", "Він малює і слухає музику."],
        ["<b>Where do</b> you <b>play</b> football?", "Де ти граєш у футбол?"],
        ["We play in the park. We <b>don't</b> have a stadium.", "Ми граємо в парку. У нас немає стадіону."]
      ] },
    words: [
      ["hobby", "хобі"], ["collect stamps", "збирати марки"], ["draw", "малювати"], ["ride a bike", "кататися на велосипеді"],
      ["play computer games", "грати в комп'ютерні ігри"], ["go swimming", "ходити плавати"], ["listen to music", "слухати музику"],
      ["watch films", "дивитися фільми"], ["enjoy", "отримувати задоволення"], ["hate", "ненавидіти"]
    ]
  });

  w("skills/psnq.json", { topic: "ps", title: "Present Simple: заперечення і питання", skills: [
    { id: "ps.neg", title: "Заперечення: don't / doesn't",
      rule: "I/you/we/they → don't + дієслово; he/she/it → doesn't + дієслово без -s.",
      worked: { p: "My dad ___ coffee. (not drink)", steps: [
        "Хто? <b>My dad</b> = he.",
        "he → помічник <b>doesn't</b>.",
        "-s уже в doesn't, тому дієслово без змін: <b>drink</b>.",
        "Відповідь: My dad <b>doesn't drink</b> coffee."] },
      alt: `<p>Уяви, що -s — це одна монетка на все речення. Якщо її забрав <b>doesn't</b>, дієслову вже нічого не лишилось.</p>
        <p>She play<b>s</b> → She doe<b>s</b>n't play. А з I / you / we / they монетки немає взагалі: I don't play.</p>`,
      items: [
        ch("I ___ like milk.", ["don't", "doesn't"], "don't", ["Хто? I — я.", "З I помічник don't."], "I → <b>don't</b> like.", { "doesn't": "doesn't — тільки для he / she / it. З I: <b>don't</b>." }),
        ch("My brother ___ eat fish.", ["don't", "doesn't"], "doesn't", ["My brother = he.", "he → doesn't."], "My brother = he → <b>doesn't</b> eat.", { "don't": "My brother — це «він» (he), тож <b>doesn't</b>." }),
        ch("They ___ live in Lviv.", ["don't", "doesn't"], "don't", ["They — «вони».", "they → don't."], "they → <b>don't</b> live.", { "doesn't": "they — «вони», тож <b>don't</b>." }),
        inp(DD, "She ___ coffee. (not drink)", ["doesn't drink", "does not drink"], ["she → doesn't.", "Після doesn't дієслово без -s."], "she → <b>doesn't drink</b>.",
          { "don't drink": "she → <b>doesn't</b>: She doesn't drink.", "doesn't drinks": "Після doesn't дієслово без -s: doesn't <b>drink</b>.", "not drinks": "Потрібен помічник: She <b>doesn't drink</b>." }),
        inp(DD, "We ___ TV in the morning. (not watch)", ["don't watch", "do not watch"], ["we → don't.", "Дієслово без змін."], "we → <b>don't watch</b>.",
          { "doesn't watch": "we — «ми», тож <b>don't</b>.", "don't watches": "Після don't дієслово без змін: don't <b>watch</b>.", "not watch": "Потрібен помічник: We <b>don't watch</b>." }),
        inp(DD, "Tom ___ football. (not play)", ["doesn't play", "does not play"], ["Tom = he.", "he → doesn't + дієслово без -s."], "Tom = he → <b>doesn't play</b>.",
          { "doesn't plays": "Після doesn't дієслово без -s: doesn't <b>play</b>.", "don't play": "Tom = he → <b>doesn't</b> play.", "not plays": "Потрібен помічник: Tom <b>doesn't play</b>." }),
        inp(DD, "My parents ___ in a flat. (not live)", ["don't live", "do not live"], ["My parents = they.", "they → don't."], "My parents = they → <b>don't live</b>.",
          { "doesn't live": "My parents — це «вони» (they), тож <b>don't</b>.", "don't lives": "Після don't дієслово без змін: don't <b>live</b>." }),
        fix("Anna doesn't likes cats.", 2, "Anna doesn't like cats.", ["Подивись на дієслово після doesn't.", "-s уже є в doesn't."], "Після doesn't — дієслово без -s: doesn't <b>like</b>."),
        fix("My dog don't sleep at night.", 2, "My dog doesn't sleep at night.", ["My dog = it.", "it → doesn't."], "My dog = it → <b>doesn't</b> sleep."),
        dict("He doesn't speak French.", [DH, "he → doesn't + дієслово без -s."], "he → <b>doesn't speak</b>.",
          { "He don't speak French.": "he → <b>doesn't</b>.", "He doesn't speaks French.": "Після doesn't дієслово без -s: <b>speak</b>." }),
        ord("«Я не їм м'ясо».", ["eat", "I", "meat", "don't"], ["i don't eat meat"], ["Хто → don't → що робить → що.", "I → don't → eat → …"], "<b>I don't eat meat.</b>")
      ] },

    { id: "ps.q", title: "Питання: Do / Does",
      rule: "Do + I/you/we/they + дієслово? Does + he/she/it + дієслово без -s?",
      worked: { p: "___ your cat like fish?", steps: [
        "Про кого питаю? <b>your cat</b> = it.",
        "it → помічник <b>Does</b> на початок.",
        "Дієслово лишається без -s: <b>like</b>.",
        "Відповідь: <b>Does</b> your cat <b>like</b> fish?"] },
      alt: `<p>Питання — це речення, у якому помічник <b>вийшов наперед</b>:</p>
        <p>She <b>likes</b> pizza. → <b>Does</b> she <b>like</b> pizza?<br>They <b>play</b> chess. → <b>Do</b> they <b>play</b> chess?</p>
        <p class="muted">-s переходить разом із помічником у Does.</p>`,
      items: [
        ch("___ you like pizza?", ["Do", "Does"], "Do", ["you — ти / ви.", "you → Do."], "you → <b>Do</b> you like…?", { "Does": "Does — тільки для he / she / it. З you: <b>Do</b>." }),
        ch("___ your sister play the piano?", ["Do", "Does"], "Does", ["your sister = she.", "she → Does."], "your sister = she → <b>Does</b>.", { "Do": "your sister — це «вона» (she), тож <b>Does</b>." }),
        ch("___ they go to school on Saturdays?", ["Do", "Does"], "Do", ["they — «вони».", "they → Do."], "they → <b>Do</b>.", { "Does": "they — «вони», тож <b>Do</b>." }),
        inp("Впиши Do або Does", "___ Tom live near you?", ["Does"], ["Tom = he.", "he → Does."], "Tom = he → <b>Does</b>.", { "Do": "Tom — це «він» (he), тож <b>Does</b>." }),
        inp("Впиши Do або Does", "___ your friends play chess?", ["Do"], ["your friends = they.", "they → Do."], "your friends = they → <b>Do</b>.", { "Does": "your friends — це «вони» (they), тож <b>Do</b>." }),
        inp("Впиши Do або Does", "___ it rain a lot in London?", ["Does"], ["it — «воно».", "it → Does."], "it → <b>Does</b>.", { "Do": "it → <b>Does</b>." }),
        fix("Does she likes ice cream?", 2, "Does she like ice cream?", ["Подивись на дієслово.", "-s уже є в Does."], "У питанні з Does дієслово без -s: Does she <b>like</b>?"),
        fix("Do your mum work on Sundays?", 0, "Does your mum work on Sundays?", ["your mum = she.", "she → Does."], "your mum = she → <b>Does</b> your mum work…?"),
        ord("«Ти граєш у футбол?»", ["you", "Do", "football", "play"], ["do you play football"], ["Do → хто → що робить → що?", "Do → you → play → …"], "<b>Do you play football?</b>", "?"),
        ord("«Твій брат ходить у спортзал?»", ["your", "Does", "go", "brother", "to", "the", "gym"], ["does your brother go to the gym"], ["Does → хто → що робить → куди?", "Does → your brother → go → …"], "<b>Does your brother go to the gym?</b>", "?"),
        dict("Do you speak English?", [DH, "you → Do."], "you → <b>Do</b> you speak…?", { "Does you speak English?": "you → <b>Do</b>." })
      ] },

    { id: "ps.short", title: "Короткі відповіді: Yes, I do / No, she doesn't",
      rule: "Відповідаємо помічником: Yes, I do. / No, he doesn't.",
      worked: { p: "Does your dad cook? — Yes, he ___.", steps: [
        "Питання з <b>Does</b>.",
        "Коротка відповідь — тим самим помічником.",
        "he → <b>does</b>; якщо «ні» — doesn't.",
        "Відповідь: Yes, he <b>does</b>."] },
      alt: `<p>Коротка відповідь — це «луна» питання: що було на початку питання, те й звучить у відповіді.</p>
        <p><b>Do</b> you…? → Yes, I <b>do</b>. / No, I <b>don't</b>.<br><b>Does</b> she…? → Yes, she <b>does</b>. / No, she <b>doesn't</b>.</p>`,
      items: [
        ch("Do you like cats? — Yes, I ___.", ["do", "like", "does"], "do", ["Питання з Do.", "Відповідаємо помічником, а не дієсловом."], "Do you…? → Yes, I <b>do</b>.",
          { "like": "Коротка відповідь — з помічником: Yes, I <b>do</b>.", "does": "З I — <b>do</b>." }),
        ch("Does Max play tennis? — No, he ___.", ["don't", "doesn't", "isn't"], "doesn't", ["Питання з Does.", "he + «ні» → ?"], "Does he…? → No, he <b>doesn't</b>.",
          { "don't": "he → <b>doesn't</b>.", "isn't": "Питали з Does, тож відповідаємо <b>doesn't</b>." }),
        inp("Впиши коротку відповідь", "Do your parents work? — Yes, they ___.", ["do"], ["Питання з Do.", "they → do."], "Yes, they <b>do</b>.", { "does": "they → <b>do</b>.", "work": "Коротка відповідь — з помічником: Yes, they <b>do</b>." }),
        inp("Впиши коротку відповідь", "Does your cat sleep a lot? — Yes, it ___.", ["does"], ["Питання з Does.", "it → does."], "Yes, it <b>does</b>.", { "do": "it → <b>does</b>.", "sleeps": "Коротка відповідь — з помічником: Yes, it <b>does</b>." }),
        inp("Впиши коротку відповідь", "Do you live in Kyiv? — No, I ___.", ["don't", "do not"], ["Питання з Do, відповідь «ні».", "I → don't."], "No, I <b>don't</b>.", { "doesn't": "I → <b>don't</b>.", "not": "Потрібен помічник: No, I <b>don't</b>." }),
        inp("Впиши коротку відповідь", "Does Anna like maths? — No, she ___.", ["doesn't", "does not"], ["Питання з Does, відповідь «ні».", "she → doesn't."], "No, she <b>doesn't</b>.", { "don't": "she → <b>doesn't</b>." }),
        ch("Does your dad cook? Яка відповідь правильна?", ["Yes, he does.", "Yes, he cooks.", "Yes, he do."], "Yes, he does.", ["Питання з Does.", "Відповідаємо помічником does."], "Does he…? → Yes, he <b>does</b>.",
          { "Yes, he cooks.": "Коротка відповідь — з помічником: Yes, he <b>does</b>.", "Yes, he do.": "he → <b>does</b>." }),
        fix("Do they play football? — Yes, they does.", 7, "Do they play football? — Yes, they do.", ["they → ?", "Питали з Do."], "they → Yes, they <b>do</b>.")
      ] },

    { id: "ps.wh", title: "Питання з What, Where, When",
      rule: "Питальне слово → do/does → хто → дієслово?",
      worked: { p: "Where ___ your grandma live?", steps: [
        "Питальне слово вже є: <b>Where</b>.",
        "Про кого? <b>your grandma</b> = she → <b>does</b>.",
        "Далі хто і дієслово без -s: your grandma <b>live</b>.",
        "Відповідь: Where <b>does</b> your grandma live?"] },
      alt: `<p>Візьми звичайне питання і просто постав перед ним питальне слово:</p>
        <p><b>Does</b> she work? → <b>Where</b> does she work?<br><b>Do</b> you get up? → <b>What time</b> do you get up?</p>`,
      items: [
        ch("Where ___ your dad work?", ["do", "does"], "does", ["your dad = he.", "he → does."], "your dad = he → Where <b>does</b>…?", { "do": "your dad — це «він», тож <b>does</b>." }),
        ch("What ___ you do after school?", ["do", "does"], "do", ["you → ?", "you → do."], "you → What <b>do</b> you do…?", { "does": "З you — <b>do</b>." }),
        inp("Впиши do або does", "When ___ the film start?", ["does"], ["the film = it.", "it → does."], "the film = it → <b>does</b>.", { "do": "the film — це «воно» (it), тож <b>does</b>." }),
        inp("Впиши do або does", "What ___ your friends like?", ["do"], ["your friends = they.", "they → do."], "your friends = they → <b>do</b>.", { "does": "your friends — це «вони» (they), тож <b>do</b>." }),
        ord("«Де живе твоя бабуся?»", ["does", "Where", "live", "your", "grandma"], ["where does your grandma live"], ["Питальне слово → does → хто → дієслово?", "Where → does → your grandma → …"], "<b>Where does your grandma live?</b>", "?"),
        ord("«Що ти робиш по суботах?»", ["do", "What", "on", "you", "do", "Saturdays"], ["what do you do on saturdays"], ["Питальне слово → do → хто → дієслово.", "What → do → you → do → …"], "<b>What do you do on Saturdays?</b> Перше do — помічник, друге — «робити».", "?"),
        fix("Where does she lives?", 3, "Where does she live?", ["Подивись на дієслово.", "-s уже є в does."], "Після does дієслово без -s: Where does she <b>live</b>?"),
        fix("What time do the lesson start?", 2, "What time does the lesson start?", ["the lesson = it.", "it → does."], "the lesson = it → What time <b>does</b>…?"),
        dict("Where do you live?", [DH, "you → do."], "you → Where <b>do</b> you live?", { "Where does you live?": "you → <b>do</b>." })
      ] }
  ] });

  /* ===================== УРОК 3 ===================== */
  const ING = "Впиши дієслово з -ing";
  w("lessons/l3.json", {
    id: "l3", title: "Present Continuous: що відбувається зараз",
    skillFiles: ["skills/pc.json"],
    skills: ["pc.be", "pc.ing", "pc.neg", "pc.q"],
    practice: { perSkill: 3 },
    test: { plan: { "pc.be": 2, "pc.ing": 2, "pc.neg": 2, "pc.q": 2 }, pass: 80 },
    explain: [
      { e: "👀", h: "Що відбувається просто зараз",
        html: `<p>Present Continuous — про дію, яка йде <b>в цю хвилину</b>, ніби ти дивишся відео.</p>
        ${say("I am reading a book now.", "Я зараз читаю книжку.", "I <b>am reading</b> a book now.")}
        <div class="tip">🔎 <b>Слова-підказки:</b> now (зараз), right now (прямо зараз), at the moment (в цей момент), Look! (Дивись!), Listen! (Слухай!)</div>
        <p class="muted">Порівняй: I read every day — звичка (Present Simple). I am reading now — саме зараз.</p>` },
      { e: "🧩", h: "am / is / are + дієслово з -ing",
        html: `<table class="t"><tr><td>I</td><td><b>am</b> reading</td><td class="muted">I'm</td></tr>
        <tr><td>he / she / it</td><td><b>is</b> reading</td><td class="muted">she's</td></tr>
        <tr><td>you / we / they</td><td><b>are</b> reading</td><td class="muted">they're</td></tr></table>
        ${say("My mum is cooking dinner.", "Мама готує вечерю.", "My mum <b>is cooking</b> dinner.")}
        ${say("The children are playing in the garden.", "Діти граються в саду.", "The children <b>are playing</b> in the garden.")}
        <div class="tip">⚠️ Обидві частини обов'язкові: <s>I reading</s> → I <b>am</b> reading.</div>` },
      { e: "✏️", h: "Як правильно додати -ing",
        html: `<table class="t"><tr><td>Майже всі</td><td>+ ing</td><td>read → read<b>ing</b><br>play → play<b>ing</b></td></tr>
        <tr><td>німа -e в кінці</td><td>e відпадає</td><td>make → mak<b>ing</b><br>write → writ<b>ing</b></td></tr>
        <tr><td>коротке слово: голосна + приголосна</td><td>подвоюємо</td><td>swim → swim<b>ming</b><br>run → run<b>ning</b><br>sit → sit<b>ting</b></td></tr>
        <tr><td>-ie</td><td>ie → y</td><td>lie → l<b>ying</b></td></tr></table>
        <div class="tip">💡 Подвоєння — щоб звук лишився коротким: swi<b>mm</b>ing [свімін], а не «сваймін».</div>` },
      { e: "🙅", h: "Заперечення і питання",
        html: `<p>Заперечення: додаємо <b>not</b> після am / is / are.</p>
        ${say("She isn't sleeping.", "Вона не спить.", "She <b>isn't</b> sleeping.")}
        ${say("We aren't watching TV.", "Ми не дивимося телевізор.", "We <b>aren't</b> watching TV.")}
        <p>Питання: am / is / are виходить <b>наперед</b>.</p>
        ${say("Are you listening to me? Yes, I am.", "Ти мене слухаєш? — Так.", "<b>Are</b> you listening to me? — Yes, I <b>am</b>.")}
        ${say("What are you doing?", "Що ти робиш?", "What <b>are</b> you doing?")}
        <div class="tip">⚠️ Тут не потрібні do / does: <s>Do you listening?</s> → <b>Are</b> you listening?</div>` }
    ],
    examples: { title: "Субота вдома",
      question: { q: "чому «swim<b>ming</b>», а «read<b>ing</b>» без подвоєння?", a: "swim — коротке слово з голосною + приголосною в кінці, тому m подвоюємо. У read дві голосні (ea) — подвоювати не треба." },
      items: [
        ["It's Saturday morning. Everybody <b>is doing</b> something.", "Суботній ранок. Усі щось роблять."],
        ["Mum <b>is making</b> pancakes in the kitchen.", "Мама пече млинці на кухні."],
        ["Dad <b>is reading</b> a newspaper.", "Тато читає газету."],
        ["My little brother <b>is sitting</b> on the floor and <b>playing</b>.", "Молодший брат сидить на підлозі й грається."],
        ["The cat <b>is lying</b> on the sofa.", "Кіт лежить на дивані."],
        ["I <b>am not sleeping</b>. I <b>am writing</b> a message to my friend.", "Я не сплю. Я пишу повідомлення подрузі."],
        ["Look! It <b>is snowing</b>!", "Дивись! Іде сніг!"],
        ["<b>Are</b> you <b>coming</b> to the park? — Yes, I <b>am</b>!", "Ти йдеш у парк? — Так!"]
      ] },
    words: [
      ["right now", "прямо зараз"], ["at the moment", "в цей момент"], ["Look!", "Дивись!"], ["Listen!", "Слухай!"],
      ["wait for", "чекати на"], ["talk on the phone", "розмовляти по телефону"], ["wear", "бути вдягненим у"],
      ["cook dinner", "готувати вечерю"], ["sit", "сидіти"], ["lie", "лежати"]
    ]
  });

  w("skills/pc.json", { topic: "pc", title: "Present Continuous", skills: [
    { id: "pc.be", title: "am / is / are + -ing",
      rule: "I am, he/she/it is, you/we/they are + дієслово з -ing.",
      worked: { p: "My friends ___ waiting for me.", steps: [
        "Хто? <b>My friends</b> — їх кілька = they.",
        "they → <b>are</b>.",
        "Дієслово з -ing уже є: waiting.",
        "Відповідь: My friends <b>are</b> waiting for me."] },
      alt: `<p>Запам'ятай пари, як таблицю множення:</p>
        <div class="rule-box" style="font-weight:800">I → am · he / she / it → is · you / we / they → are</div>
        <p>Present Continuous — це завжди <b>дві частини</b>: am / is / are + дієслово з -ing. Одна без одної не працює.</p>`,
      items: [
        ch("I ___ reading a book now.", ["am", "is", "are"], "am", ["Хто? I.", "I → am."], "I → <b>am</b> reading.", { "is": "is — для he / she / it. З I: <b>am</b>.", "are": "are — для you / we / they. З I: <b>am</b>." }),
        ch("My mum ___ cooking dinner.", ["am", "is", "are"], "is", ["My mum = she.", "she → is."], "My mum = she → <b>is</b> cooking.", { "are": "My mum — одна людина (she): <b>is</b>.", "am": "am — тільки з I." }),
        ch("The children ___ playing in the garden.", ["am", "is", "are"], "are", ["The children — їх багато.", "they → are."], "The children = they → <b>are</b>.", { "is": "children — це багато дітей (they): <b>are</b>.", "am": "am — тільки з I." }),
        inp("Впиши am, is або are", "We ___ watching a film at the moment.", ["are"], ["We — «ми».", "we → are."], "we → <b>are</b>.", { "is": "we → <b>are</b>.", "am": "am — тільки з I." }),
        inp("Впиши am, is або are", "My friends ___ waiting for me.", ["are"], ["My friends = they.", "they → are."], "My friends = they → <b>are</b>.", { "is": "My friends — це «вони», тож <b>are</b>." }),
        inp("Впиши am, is або are", "It ___ raining now.", ["is"], ["It — «воно».", "it → is."], "it → <b>is</b>.", { "are": "it → <b>is</b>.", "am": "am — тільки з I." }),
        inp("Впиши am, is або are", "I ___ doing my homework.", ["am"], ["I — я.", "I → am."], "I → <b>am</b>.", { "is": "З I — <b>am</b>.", "are": "З I — <b>am</b>." }),
        fix("They is playing football now.", 1, "They are playing football now.", ["They — «вони».", "they → are."], "they → <b>are</b> playing."),
        fix("She are talking on the phone.", 1, "She is talking on the phone.", ["She — «вона».", "she → is."], "she → <b>is</b> talking."),
        dict("We are having lunch now.", [DH, "we → are + -ing."], "we → <b>are having</b>.", { "We is having lunch now.": "we → <b>are</b>.", "We having lunch now.": "Не забувай are: We <b>are</b> having lunch now." }),
        ord("«Мама зараз готує вечерю».", ["cooking", "Mum", "now", "dinner", "is"], ["mum is cooking dinner now"], ["Хто → is → дієслово з -ing → що → коли.", "Mum → is → cooking → …"], "<b>Mum is cooking dinner now.</b>")
      ] },

    { id: "pc.ing", title: "Як писати -ing: making, swimming, lying",
      rule: "Німа -e відпадає (making); коротке слово з голосна+приголосна — подвоюємо (swimming); ie → y (lying).",
      worked: { p: "They are ___ in the river. (swim)", steps: [
        "Дієслово: <b>swim</b> — коротке, одна голосна i.",
        "В кінці голосна + приголосна: i + m.",
        "Значить, останню літеру подвоюємо: swim → swim<b>m</b>.",
        "Відповідь: They are <b>swimming</b> in the river."] },
      alt: `<p>Перевір по черзі три питання:</p>
        <p>1) В кінці німа <b>-e</b>? Прибираємо її: write → writing.<br>2) В кінці <b>-ie</b>? Міняємо на y: lie → lying.<br>3) Коротке слово з <b>одною</b> голосною, а в кінці приголосна? Подвоюємо: run → running.</p>
        <p class="muted">Ні на одне — просто + ing: read → reading, play → playing.</p>`,
      items: [
        inp(ING, "She is ___ a letter. (write)", ["writing"], ["write закінчується на німу -e.", "-e відпадає."], "write → <b>writing</b>: німа -e відпадає.", { "writeing": "Німа -e відпадає: <b>writing</b>.", "writting": "Тут не подвоюємо: write → <b>writing</b>." }, { strict: true }),
        inp(ING, "They are ___ in the river. (swim)", ["swimming"], ["swim — коротке слово.", "Голосна + приголосна в кінці → подвоюємо."], "swim → <b>swimming</b>.", { "swiming": "Коротке слово з голосна + приголосна → подвоюємо: swim<b>m</b>ing." }, { strict: true }),
        inp(ING, "Tom is ___ in the park. (run)", ["running"], ["run — коротке слово.", "Подвоюємо n."], "run → <b>running</b>.", { "runing": "Подвоюємо n: run<b>n</b>ing." }, { strict: true }),
        inp(ING, "I am ___ a cake. (make)", ["making"], ["make закінчується на -e.", "-e відпадає."], "make → <b>making</b>.", { "makeing": "Німа -e відпадає: <b>making</b>.", "makking": "Не подвоюємо: <b>making</b>." }, { strict: true }),
        inp(ING, "We are ___ on the sofa. (sit)", ["sitting"], ["sit — коротке слово.", "Подвоюємо t."], "sit → <b>sitting</b>.", { "siting": "Подвоюємо t: sit<b>t</b>ing." }, { strict: true }),
        inp(ING, "The baby is ___ in the bedroom. (cry)", ["crying"], ["cry закінчується на -y.", "Перед -ing y не змінюється."], "cry → <b>crying</b>: y лишається.", { "criing": "y лишається: <b>crying</b>.", "cring": "y лишається: <b>crying</b>." }, { strict: true }),
        inp(ING, "He is ___ to music. (listen)", ["listening"], ["listen — просто + ing.", "Тут нічого не подвоюємо."], "listen → <b>listening</b>.", { "listenning": "Тут не подвоюємо: <b>listening</b>." }, { strict: true }),
        inp(ING, "The dog is ___ on the floor. (lie)", ["lying"], ["lie закінчується на -ie.", "ie → y."], "lie → <b>lying</b>: ie → y.", { "lieing": "ie → y: <b>lying</b>.", "liing": "ie → y: <b>lying</b>." }, { strict: true }),
        inp(ING, "Kate is ___ her bike. (ride)", ["riding"], ["ride закінчується на -e.", "-e відпадає."], "ride → <b>riding</b>.", { "rideing": "Німа -e відпадає: <b>riding</b>.", "ridding": "Не подвоюємо: <b>riding</b>." }, { strict: true }),
        fix("Look! He is swiming in the sea.", 3, "Look! He is swimming in the sea.", ["Подивись, як написане дієслово з -ing.", "swim — подвоюємо m."], "swim → <b>swimming</b>."),
        fix("I am writeing an email.", 2, "I am writing an email.", ["Подивись, як написане дієслово з -ing.", "Німа -e відпадає."], "write → <b>writing</b>."),
        dict("She is making a sandwich.", [DH, "make → -e відпадає."], "make → <b>making</b>.", { "She is makeing a sandwich.": "Німа -e відпадає: <b>making</b>.", "She making a sandwich.": "Не забувай is: She <b>is</b> making…" })
      ] },

    { id: "pc.neg", title: "Заперечення: isn't / aren't / am not",
      rule: "am not / isn't / aren't + дієслово з -ing. Без don't і doesn't!",
      worked: { p: "Dad ___ today. (not work)", steps: [
        "Хто? <b>Dad</b> = he → is.",
        "Заперечення: is + not = <b>isn't</b>.",
        "Дієслово з -ing: <b>working</b>.",
        "Відповідь: Dad <b>isn't working</b> today."] },
      alt: `<p>У Present Continuous свій помічник — am / is / are. Тому «не» чіпляємо до нього:</p>
        <p>I am → I <b>am not</b> (I'm not)<br>she is → she <b>isn't</b><br>they are → they <b>aren't</b></p>
        <p class="muted">don't / doesn't — це помічники з іншого часу (Present Simple). Тут вони не потрібні.</p>`,
      items: [
        ch("I ___ sleeping.", ["am not", "isn't", "aren't"], "am not", ["Хто? I.", "I → am → am not."], "I → <b>am not</b>.", { "isn't": "З I — <b>am not</b>.", "aren't": "З I — <b>am not</b>." }),
        ch("Dad ___ working today.", ["isn't", "aren't", "am not"], "isn't", ["Dad = he.", "he → is → isn't."], "Dad = he → <b>isn't</b>.", { "aren't": "Dad — одна людина (he): <b>isn't</b>.", "am not": "am — тільки з I." }),
        ch("We ___ watching TV.", ["isn't", "aren't", "am not"], "aren't", ["We — «ми».", "we → are → aren't."], "we → <b>aren't</b>.", { "isn't": "we → <b>aren't</b>.", "am not": "am — тільки з I." }),
        inp("Впиши заперечення з дієсловом", "She ___ to me. (not listen)", ["isn't listening", "is not listening"], ["she → is → isn't.", "Дієслово з -ing."], "she → <b>isn't listening</b>.",
          { "isn't listen": "Не забудь -ing: isn't <b>listening</b>.", "doesn't listening": "Тут помічник is, а не does: <b>isn't</b> listening.", "aren't listening": "she → <b>isn't</b>.", "don't listening": "Тут помічник is: <b>isn't</b> listening." }),
        inp("Впиши заперечення з дієсловом", "They ___ football now. (not play)", ["aren't playing", "are not playing"], ["they → are → aren't.", "Дієслово з -ing."], "they → <b>aren't playing</b>.",
          { "isn't playing": "they → <b>aren't</b>.", "don't playing": "Тут помічник are, а не do: <b>aren't</b> playing.", "aren't play": "Не забудь -ing: aren't <b>playing</b>." }),
        inp("Впиши заперечення з дієсловом", "I ___ a book now. (not read)", ["am not reading"], ["I → am not.", "Дієслово з -ing."], "I → <b>am not reading</b>.",
          { "isn't reading": "З I — <b>am not</b>.", "amn't reading": "amn't не буває: I <b>am not</b> reading.", "don't reading": "Тут помічник am: I <b>am not</b> reading.", "am not read": "Не забудь -ing: am not <b>reading</b>." }),
        fix("My brother aren't sleeping now.", 2, "My brother isn't sleeping now.", ["My brother = he.", "he → isn't."], "My brother = he → <b>isn't</b>."),
        fix("We isn't going to school today.", 1, "We aren't going to school today.", ["We — «ми».", "we → aren't."], "we → <b>aren't</b>."),
        dict("It isn't raining now.", [DH, "it → isn't + -ing."], "it → <b>isn't raining</b>.", { "It aren't raining now.": "it → <b>isn't</b>.", "It isn't rain now.": "Не забудь -ing: <b>raining</b>.", "It doesn't raining now.": "Тут помічник is: <b>isn't</b> raining." })
      ] },

    { id: "pc.q", title: "Питання: Are you…? Is she…?",
      rule: "Am / Is / Are на початок + хто + дієслово з -ing? Відповідь: Yes, I am. / No, she isn't.",
      worked: { p: "___ your parents working today?", steps: [
        "Про кого питаю? <b>your parents</b> = they.",
        "they → <b>Are</b> на початок.",
        "Далі хто і дієслово з -ing.",
        "Відповідь: <b>Are</b> your parents working today?"] },
      alt: `<p>Питання — це речення, де am / is / are <b>помінявся місцями</b> з тим, хто діє:</p>
        <p>She <b>is</b> sleeping. → <b>Is</b> she sleeping?<br>You <b>are</b> listening. → <b>Are</b> you listening?</p>
        <p>Коротка відповідь — тим самим словом: Yes, she <b>is</b>. / No, I'<b>m</b> not.</p>`,
      items: [
        ch("___ you listening to me?", ["Are", "Is", "Do"], "Are", ["you → ?", "У цьому часі питаємо з am / is / are."], "you → <b>Are</b> you listening?", { "Do": "Тут питання з am / is / are, а не do: <b>Are</b> you listening?", "Is": "you → <b>Are</b>." }),
        ch("___ your sister sleeping?", ["Is", "Are", "Does"], "Is", ["your sister = she.", "she → Is."], "your sister = she → <b>Is</b>.", { "Are": "your sister — одна людина (she): <b>Is</b>.", "Does": "Тут питання з is: <b>Is</b> your sister sleeping?" }),
        ch("Are they playing? — Yes, they ___.", ["are", "do", "is"], "are", ["Питали з Are.", "Відповідаємо тим самим словом."], "Are they…? → Yes, they <b>are</b>.", { "do": "Питали з Are, тож відповідь: Yes, they <b>are</b>.", "is": "they → <b>are</b>." }),
        inp("Впиши Am, Is або Are", "___ it raining now?", ["Is"], ["it → ?", "it → Is."], "it → <b>Is</b> it raining?", { "Are": "it → <b>Is</b>.", "Does": "Тут питання з is: <b>Is</b> it raining?" }),
        inp("Впиши Am, Is або Are", "___ your parents working today?", ["Are"], ["your parents = they.", "they → Are."], "your parents = they → <b>Are</b>.", { "Is": "your parents — це «вони», тож <b>Are</b>.", "Do": "Тут питання з are: <b>Are</b> your parents working?" }),
        inp("Впиши коротку відповідь", "Is Tom reading? — No, he ___.", ["isn't", "is not"], ["Питали з Is, відповідь «ні».", "he → isn't."], "No, he <b>isn't</b>.", { "doesn't": "Питали з Is: No, he <b>isn't</b>.", "aren't": "he → <b>isn't</b>." }),
        ord("«Що ти зараз робиш?»", ["doing", "What", "you", "are", "now"], ["what are you doing now"], ["Питальне слово → are → хто → дієслово з -ing → коли?", "What → are → you → doing → …"], "<b>What are you doing now?</b>", "?"),
        fix("Is they watching TV?", 0, "Are they watching TV?", ["they → ?", "they → Are."], "they → <b>Are</b> they watching TV?"),
        dict("What are you doing?", [DH, "you → are."], "you → What <b>are</b> you doing?", { "What is you doing?": "you → <b>are</b>.", "What you doing?": "Не забувай are: What <b>are</b> you doing?" })
      ] }
  ] });

  /* ===================== УРОК 4 ===================== */
  w("lessons/l4.json", {
    id: "l4", title: "Simple чи Continuous? Тренуємо різницю",
    skillFiles: ["skills/pspc.json", "skills/ps.json", "skills/pc.json"],
    skills: ["pspc.sig", "pspc.state"],
    practice: { perSkill: 5 },
    test: { plan: { "pspc.sig": 5, "pspc.state": 3 }, pass: 80 },
    explain: [
      { e: "⚖️", h: "Звичка чи «просто зараз»?",
        html: `<table class="t"><tr><td>Present Simple</td><td>звичка, розклад, факт</td><td>I <b>play</b> tennis on Mondays.</td></tr>
        <tr><td>Present Continuous</td><td>дія йде зараз</td><td>I <b>am playing</b> tennis now.</td></tr></table>
        ${say("I usually walk to school, but today I am going by bus.", "Зазвичай я ходжу до школи пішки, але сьогодні їду автобусом.", "I usually <b>walk</b> to school, but today I <b>am going</b> by bus.")}` },
      { e: "🔎", h: "Слова-підказки",
        html: `<table class="t"><tr><td>Simple</td><td>every day, usually, always, often, sometimes, never, on Mondays</td></tr>
        <tr><td>Continuous</td><td>now, right now, at the moment, today, Look!, Listen!</td></tr></table>
        <div class="tip">💡 Побачила «Look!» чи «Listen!» — це майже завжди Continuous: ти бачиш або чуєш дію саме зараз.</div>` },
      { e: "🧠", h: "Дієслова-стани: без -ing",
        html: `<p>Є дієслова, які означають не дію, а <b>стан</b>: що ти знаєш, любиш, хочеш. Їх у Continuous не ставимо навіть «зараз».</p>
        <div class="rule-box">like, love, hate, want, need, know, understand, believe, remember</div>
        ${say("I want an ice cream now.", "Я зараз хочу морозиво.", "I <b>want</b> an ice cream now.")}
        <div class="tip">⚠️ <s>I am wanting</s>, <s>She is knowing</s> — так не кажуть.</div>` }
    ],
    examples: { title: "Зима за вікном",
      question: { q: "чому «It <b>snows</b> a lot in January», але «Look! It <b>is snowing</b>»?", a: "Перше — факт про січень загалом (Simple). Друге — сніг іде просто зараз, ми це бачимо (Continuous)." },
      items: [
        ["It <b>snows</b> a lot in January.", "У січні часто йде сніг."],
        ["Look! It <b>is snowing</b> now!", "Дивись! Зараз іде сніг!"],
        ["Usually I <b>walk</b> to school.", "Зазвичай я ходжу до школи пішки."],
        ["But today Dad <b>is driving</b> me there.", "Але сьогодні тато везе мене машиною."],
        ["My brother <b>loves</b> winter.", "Мій брат обожнює зиму."],
        ["He <b>is making</b> a snowman in the yard right now.", "Він просто зараз ліпить сніговика у дворі."],
        ["I <b>want</b> some hot tea.", "Я хочу гарячого чаю."]
      ] },
    words: [
      ["snow", "сніг; іде сніг"], ["it's sunny", "сонячно"], ["it's windy", "вітряно"], ["it's cold", "холодно"],
      ["warm", "теплий"], ["umbrella", "парасолька"], ["every morning", "щоранку"], ["today", "сьогодні"],
      ["know", "знати"], ["understand", "розуміти"]
    ]
  });

  w("skills/pspc.json", { topic: "pspc", title: "Simple чи Continuous", skills: [
    { id: "pspc.sig", title: "Звичка чи «просто зараз»",
      rule: "every day, usually, often → Present Simple; now, at the moment, Look!, Listen! → am/is/are + -ing.",
      worked: { p: "Listen! Someone ___ the piano. (play)", steps: [
        "Шукаю слово-підказку: <b>Listen!</b>",
        "Я чую це просто зараз → <b>Continuous</b>.",
        "Someone = he/she → <b>is</b> + playing.",
        "Відповідь: Listen! Someone <b>is playing</b> the piano."] },
      alt: `<p>Задай собі питання: <b>«Це відбувається зараз, на моїх очах?»</b></p>
        <p>Так → am / is / are + -ing (I am reading now).<br>Ні, це звичка чи розклад → Present Simple (I read every evening).</p>`,
      items: [
        ch("Look! It ___.", ["is snowing", "snows"], "is snowing", ["Look! — бачимо зараз.", "Дія просто зараз → is + -ing."], "Look! → дія зараз: <b>is snowing</b>.", { "snows": "Look! — ми бачимо сніг зараз, тож <b>is snowing</b>." }),
        ch("It often ___ here in winter.", ["snows", "is snowing"], "snows", ["often — часто.", "Часто = звичка → Present Simple."], "often → <b>snows</b>.", { "is snowing": "often — це про те, як буває зазвичай: <b>snows</b>." }),
        ch("I ___ to school every day.", ["go", "am going"], "go", ["every day — щодня.", "Щодня = звичка."], "every day → <b>go</b>.", { "am going": "every day — звичка: I <b>go</b>." }),
        ch("Shh! The baby ___.", ["is sleeping", "sleeps"], "is sleeping", ["Shh! — тихо, бо зараз…", "Дія просто зараз."], "Дитина спить просто зараз: <b>is sleeping</b>.", { "sleeps": "Тихо, бо дитина спить зараз: <b>is sleeping</b>." }),
        inp("Впиши дієслово в Simple або Continuous", "My dad usually ___ at seven. (get up)", ["gets up"], ["usually — зазвичай.", "Звичка → Present Simple, he → + s."], "usually → <b>gets up</b>.", { "is getting up": "usually — це звичка: <b>gets up</b>.", "get up": "My dad = he → <b>gets</b> up." }),
        inp("Впиши дієслово в Simple або Continuous", "Listen! Someone ___ the piano. (play)", ["is playing"], ["Listen! — чуємо зараз.", "Дія зараз → is + -ing."], "Listen! → <b>is playing</b>.", { "plays": "Listen! — дія просто зараз: <b>is playing</b>.", "playing": "Не забудь is: <b>is playing</b>." }),
        inp("Впиши дієслово в Simple або Continuous", "We ___ English on Mondays and Fridays. (study)", ["study"], ["on Mondays — по понеділках.", "Розклад → Present Simple."], "Розклад → <b>study</b>.", { "are studying": "on Mondays — це розклад: we <b>study</b>.", "studies": "we → без -s: <b>study</b>." }),
        inp("Впиши дієслово в Simple або Continuous", "At the moment she ___ a shower. (take)", ["is taking"], ["At the moment — у цей момент.", "Дія зараз → is + -ing."], "At the moment → <b>is taking</b>.", { "takes": "At the moment — дія зараз: <b>is taking</b>.", "is takeing": "Німа -e відпадає: <b>taking</b>." }),
        inp("Впиши дієслово в Simple або Continuous", "Tom ___ his homework now. (do)", ["is doing"], ["now — зараз.", "Дія зараз → is + -ing."], "now → <b>is doing</b>.", { "does": "now — дія зараз: <b>is doing</b>." }),
        inp("Впиши дієслово в Simple або Continuous", "They never ___ TV in the morning. (watch)", ["watch"], ["never — ніколи.", "Звичка → Present Simple."], "never → <b>watch</b>.", { "are watching": "never — це про звичку: <b>watch</b>.", "watches": "they → без -s: <b>watch</b>." }),
        fix("Look! The children play in the snow.", 3, "Look! The children are playing in the snow.", ["Look! — це підказка.", "Дія зараз → are + -ing."], "Look! → <b>are playing</b>."),
        dict("She usually walks to school.", [DH, "usually → Present Simple."], "usually → <b>walks</b>.", { "She usually is walking to school.": "usually — звичка: <b>walks</b>.", "She usually walk to school.": "she → walk<b>s</b>." }),
        dict("Listen! The birds are singing.", [DH, "Listen! → are + -ing."], "Listen! → <b>are singing</b>.", { "Listen! The birds sing.": "Listen! — дія зараз: <b>are singing</b>.", "Listen! The birds is singing.": "birds — їх багато: <b>are</b>." })
      ] },

    { id: "pspc.state", title: "Дієслова-стани: like, want, know — без -ing",
      rule: "like, love, want, need, know, understand — не вживаємо з -ing, навіть «зараз».",
      worked: { p: "I ___ an ice cream now. (want)", steps: [
        "Є підказка <b>now</b>, але…",
        "<b>want</b> — це стан (бажання), а не дія.",
        "Дієслова-стани не беруть -ing.",
        "Відповідь: I <b>want</b> an ice cream now."] },
      alt: `<p>Дію можна «зняти на відео»: бігти, писати, готувати. А стан — ні: не можна зняти, як ти «знаєш» чи «хочеш».</p>
        <p>Що не знімеш на відео, те без -ing: I <b>know</b>, she <b>likes</b>, we <b>need</b>.</p>`,
      items: [
        ch("I ___ this song.", ["like", "am liking"], "like", ["like — дія чи стан?", "like — стан, без -ing."], "like — стан: I <b>like</b>.", { "am liking": "like — дієслово-стан, з -ing не вживається: I <b>like</b>." }),
        ch("She ___ the answer.", ["knows", "is knowing"], "knows", ["know — дія чи стан?", "know — стан, без -ing."], "know — стан: she <b>knows</b>.", { "is knowing": "know — стан, без -ing: she <b>knows</b>." }),
        ch("We ___ a new computer.", ["need", "are needing"], "need", ["need — потребувати.", "Це стан, без -ing."], "need — стан: we <b>need</b>.", { "are needing": "need — стан, без -ing: we <b>need</b>." }),
        ch("Яке речення правильне?", ["Mum is liking coffee.", "Mum likes coffee."], "Mum likes coffee.", ["like — стан.", "Стан → без -ing, she → + s."], "<b>Mum likes coffee.</b>", { "Mum is liking coffee.": "like — стан, без -ing: Mum <b>likes</b> coffee." }),
        inp("Впиши дієслово в правильній формі", "I ___ an ice cream now. (want)", ["want"], ["want — стан.", "Навіть з now — без -ing."], "want — стан: I <b>want</b>.", { "am wanting": "want — стан, без -ing навіть «зараз»: I <b>want</b>.", "wants": "I → без -s: <b>want</b>." }),
        inp("Впиши дієслово в правильній формі", "My brother ___ cats. (love)", ["loves"], ["love — стан.", "My brother = he → + s."], "love — стан: he <b>loves</b>.", { "is loving": "love — стан, без -ing: <b>loves</b>.", "love": "My brother = he → love<b>s</b>." }),
        ord("«Я зараз хочу пити».", ["want", "I", "drink", "a", "now"], ["i want a drink now"], ["want — стан, без -ing.", "I → want → a drink → now."], "<b>I want a drink now.</b> want — без -ing."),
        dict("She knows a lot of English words.", [DH, "know — стан, без -ing."], "know — стан: she <b>knows</b>.", { "She is knowing a lot of English words.": "know — стан, без -ing: <b>knows</b>.", "She know a lot of English words.": "she → know<b>s</b>." })
      ] }
  ] });
};
