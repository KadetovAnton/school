// Уроки 5–6: There is / There are; множина іменників і some / any
module.exports = function (w) {
  const say = (en, ua, hl) => `<div class="ex"><div><div class="en">${hl || en}</div><div class="ua">${ua}</div></div><button class="say round" data-say="${en}">🔊</button></div>`;
  const inp = (task, p, a, h, e, err, extra) => Object.assign({ type: "input", task, p, a: Array.isArray(a) ? a : [a], h, e, err }, extra || {});
  const ch = (p, o, a, h, e, err) => ({ type: "choice", p, o, a, h, e, err });
  const fix = (p, bad, a, h, e) => ({ type: "fix", task: "Знайди і натисни слово з помилкою", p, bad, a, h, e });
  const dict = (a, h, e, err) => ({ type: "dict", task: "Послухай і напиши речення", p: "🎧 " + a, a: [a], h, e, err });
  const ord = (p, words, a, h, e, end) => Object.assign({ type: "order", task: "Склади речення", p, words, a, h, e }, end ? { end } : {});
  const DH = "Послухай ще раз — можна повільно 🐢";
  const S = { strict: true };

  /* ===================== УРОК 5 ===================== */
  w("lessons/l5.json", {
    id: "l5", title: "There is / There are",
    skillFiles: ["skills/there.json"],
    skills: ["there.form", "there.neg", "there.q"],
    practice: { perSkill: 4 },
    test: { plan: { "there.form": 3, "there.neg": 3, "there.q": 2 }, pass: 80 },
    explain: [
      { e: "🏠", h: "Що десь є",
        html: `<p>Коли розповідаємо, <b>що є</b> в кімнаті, місті, сумці, кажемо <b>There is</b> або <b>There are</b>.</p>
        <table class="t"><tr><td>одна річ</td><td><b>There is</b> a / an …</td><td class="muted">There's</td></tr>
        <tr><td>багато речей</td><td><b>There are</b> …</td><td></td></tr></table>
        ${say("There is a cat on the sofa.", "На дивані (є) кіт.", "<b>There is</b> a cat on the sofa.")}
        ${say("There are two books on the table.", "На столі (є) дві книжки.", "<b>There are</b> two books on the table.")}
        <div class="tip">💡 Українською «є» часто пропускаємо, а англійською There is / are обов'язкове.</div>` },
      { e: "🥛", h: "Те, що не рахують штуками",
        html: `<p>milk, water, bread, juice, cheese, money — їх не рахують «одна, дві». З ними завжди <b>is</b>:</p>
        ${say("There is some milk in the fridge.", "У холодильнику є трохи молока.", "<b>There is</b> some milk in the fridge.")}
        <div class="tip">⚠️ <s>There are some milk</s> → There <b>is</b> some milk.</div>` },
      { e: "🙅", h: "Чого немає",
        html: `<table class="t"><tr><td>одна річ</td><td>There <b>isn't</b> a …</td></tr>
        <tr><td>багато</td><td>There <b>aren't any</b> …</td></tr></table>
        ${say("There isn't a TV in my room.", "У моїй кімнаті немає телевізора.", "There <b>isn't</b> a TV in my room.")}
        ${say("There aren't any shops in our village.", "У нашому селі немає магазинів.", "There <b>aren't any</b> shops in our village.")}
        <p class="muted">У запереченні замість some кажемо <b>any</b>.</p>` },
      { e: "❓", h: "Питання і відповіді",
        html: `<p>Is / Are виходить наперед:</p>
        ${say("Is there a bank near here? Yes, there is.", "Тут поруч є банк? — Так.", "<b>Is there</b> a bank near here? — Yes, there <b>is</b>.")}
        ${say("Are there any cafes in your town? No, there aren't.", "У твоєму місті є кафе? — Ні.", "<b>Are there any</b> cafes in your town? — No, there <b>aren't</b>.")}
        ${say("How many pupils are there in your class?", "Скільки учнів у твоєму класі?", "<b>How many</b> pupils <b>are there</b> in your class?")}` }
    ],
    examples: { title: "Моя кімната",
      question: { q: "чому «There <b>is</b> a desk», але «There <b>are</b> two shelves»?", a: "Стіл один — is. Полиць дві, їх багато — are." },
      items: [
        ["My room is small but cosy.", "Моя кімната маленька, але затишна."],
        ["<b>There is</b> a bed next to the window.", "Біля вікна стоїть ліжко."],
        ["<b>There is</b> a desk and a chair.", "Є стіл і стілець."],
        ["<b>There are</b> two shelves with books.", "Є дві полиці з книжками."],
        ["<b>There are</b> some posters on the wall.", "На стіні кілька плакатів."],
        ["<b>There isn't</b> a TV in my room.", "У моїй кімнаті немає телевізора."],
        ["<b>Is there</b> a computer? — Yes, <b>there is</b>!", "Комп'ютер є? — Так, є!"]
      ] },
    words: [
      ["bed", "ліжко"], ["desk", "письмовий стіл"], ["chair", "стілець"], ["lamp", "лампа"], ["shelf", "полиця"],
      ["carpet", "килим"], ["mirror", "дзеркало"], ["on", "на"], ["under", "під"], ["next to", "поруч з"]
    ]
  });

  w("skills/there.json", { topic: "there", title: "There is / There are", skills: [
    { id: "there.form", title: "There is чи There are",
      rule: "Одна річ або те, що не рахують штуками (milk) → There is. Багато → There are.",
      worked: { p: "There ___ three bedrooms in our flat.", steps: [
        "Що є? <b>three bedrooms</b> — три спальні.",
        "Їх багато.",
        "Багато → <b>There are</b>.",
        "Відповідь: There <b>are</b> three bedrooms in our flat."] },
      alt: `<p>Подивись на слово <b>одразу після</b> There is / are:</p>
        <p>a cat, an apple, some milk → <b>is</b><br>two cats, many apples, some books → <b>are</b></p>
        <p class="muted">Є закінчення -s (books, cats) чи число більше за один — майже завжди are.</p>`,
      items: [
        ch("There ___ a cat on the sofa.", ["is", "are"], "is", ["a cat — скільки котів?", "Один → is."], "a cat — один → There <b>is</b>.", { "are": "a cat — один кіт, тож <b>is</b>." }),
        ch("There ___ two books on the table.", ["is", "are"], "are", ["two books — скільки?", "Багато → are."], "two books → There <b>are</b>.", { "is": "two books — їх дві, тож <b>are</b>." }),
        ch("There ___ some milk in the fridge.", ["is", "are"], "is", ["milk рахують штуками?", "Не рахують → is."], "milk — не рахують штуками → There <b>is</b>.", { "are": "milk не рахують штуками — з ним <b>is</b>." }),
        inp("Впиши is або are", "There ___ three bedrooms in our flat.", ["are"], ["three bedrooms — скільки?", "Багато → are."], "three bedrooms → There <b>are</b>.", { "is": "three bedrooms — їх три, тож <b>are</b>." }),
        inp("Впиши is або are", "There ___ an apple in my bag.", ["is"], ["an apple — скільки?", "Одне → is."], "an apple → There <b>is</b>.", { "are": "an apple — одне яблуко, тож <b>is</b>." }),
        inp("Впиши is або are", "There ___ a lot of children in the park.", ["are"], ["children — одна дитина чи багато?", "Багато → are."], "children — багато дітей → There <b>are</b>.", { "is": "children — це багато дітей, тож <b>are</b>." }),
        inp("Впиши is або are", "There ___ some water in the glass.", ["is"], ["water рахують штуками?", "Не рахують → is."], "water — не рахують штуками → There <b>is</b>.", { "are": "water не рахують штуками — з ним <b>is</b>." }),
        fix("There are a big tree in our garden.", 1, "There is a big tree in our garden.", ["a big tree — скільки дерев?", "Одне → is."], "a tree — одне → There <b>is</b>."),
        fix("There is five chairs in the kitchen.", 1, "There are five chairs in the kitchen.", ["five chairs — скільки?", "Багато → are."], "five chairs → There <b>are</b>."),
        dict("There are two windows in my room.", [DH, "two windows → are."], "two windows → There <b>are</b>.", { "There is two windows in my room.": "two windows — багато: There <b>are</b>." }),
        ord("«У нашому місті є парк».", ["is", "There", "a", "park", "in", "our", "town"], ["there is a park in our town", "in our town there is a park"], ["There is → що → де.", "There → is → a park → …"], "<b>There is a park in our town.</b>")
      ] },

    { id: "there.neg", title: "There isn't / There aren't any",
      rule: "Одна річ → There isn't a … Багато → There aren't any …",
      worked: { p: "There ___ any pictures on the wall.", steps: [
        "Що? <b>pictures</b> — картини, багато.",
        "Багато → are, заперечення → <b>aren't</b>.",
        "any вже стоїть — так і треба в запереченні.",
        "Відповідь: There <b>aren't</b> any pictures on the wall."] },
      alt: `<p>Заперечення — це просто <b>not</b> після is / are:</p>
        <p>There is → There <b>isn't</b> (a lift)<br>There are → There <b>aren't</b> (any shops)</p>
        <p class="muted">some у запереченні перетворюється на any: some apples → any apples.</p>`,
      items: [
        ch("There ___ any eggs in the fridge.", ["aren't", "isn't"], "aren't", ["eggs — скільки?", "Багато → aren't."], "eggs → There <b>aren't</b> any.", { "isn't": "eggs — їх багато, тож <b>aren't</b>." }),
        ch("There ___ a TV in my bedroom.", ["isn't", "aren't"], "isn't", ["a TV — скільки?", "Один → isn't."], "a TV → There <b>isn't</b>.", { "aren't": "a TV — один, тож <b>isn't</b>." }),
        ch("There aren't ___ shops in our village.", ["any", "some"], "any", ["Це заперечення.", "У запереченні — any."], "Заперечення → <b>any</b>.", { "some": "У запереченні — <b>any</b>." }),
        inp("Впиши isn't або aren't", "There ___ a lift in our building.", ["isn't", "is not"], ["a lift — скільки?", "Один → isn't."], "a lift → There <b>isn't</b>.", { "aren't": "a lift — один, тож <b>isn't</b>." }),
        inp("Впиши isn't або aren't", "There ___ any pictures on the wall.", ["aren't", "are not"], ["pictures — скільки?", "Багато → aren't."], "pictures → There <b>aren't</b> any.", { "isn't": "pictures — їх багато, тож <b>aren't</b>." }),
        inp("Впиши some або any", "There aren't ___ cars in the street.", ["any"], ["Це заперечення.", "У запереченні — any."], "Заперечення → <b>any</b>.", { "some": "У запереченні — <b>any</b>." }),
        fix("There isn't any apples in the box.", 1, "There aren't any apples in the box.", ["apples — скільки?", "Багато → aren't."], "apples → There <b>aren't</b> any."),
        fix("There aren't some books on the shelf.", 2, "There aren't any books on the shelf.", ["Це заперечення.", "some → any."], "У запереченні — <b>any</b>."),
        dict("There isn't a cinema in our village.", [DH, "a cinema — один → isn't."], "a cinema → There <b>isn't</b>.", { "There aren't a cinema in our village.": "a cinema — один: There <b>isn't</b>." })
      ] },

    { id: "there.q", title: "Is there…? Are there…? How many…?",
      rule: "Is there a …? / Are there any …? Відповідь: Yes, there is. / No, there aren't.",
      worked: { p: "___ there any bananas in the kitchen?", steps: [
        "Про що питаю? <b>bananas</b> — багато.",
        "Багато → <b>Are</b> на початок.",
        "У питанні — any.",
        "Відповідь: <b>Are</b> there any bananas in the kitchen?"] },
      alt: `<p>Питання — це There is / are, де слова <b>помінялись місцями</b>:</p>
        <p>There <b>is</b> a park. → <b>Is</b> there a park?<br>There <b>are</b> cafes. → <b>Are</b> there any cafes?</p>
        <p>Відповідаємо тими ж словами: Yes, there <b>is</b>. / No, there <b>aren't</b>.</p>`,
      items: [
        ch("___ there a bank near here?", ["Is", "Are"], "Is", ["a bank — скільки?", "Один → Is."], "a bank → <b>Is</b> there…?", { "Are": "a bank — один, тож <b>Is</b>." }),
        ch("___ there any cafes in your town?", ["Are", "Is"], "Are", ["cafes — скільки?", "Багато → Are."], "cafes → <b>Are</b> there…?", { "Is": "cafes — їх багато, тож <b>Are</b>." }),
        ch("Is there a park near your school? — Yes, there ___.", ["is", "are", "does"], "is", ["Питали з Is.", "Відповідаємо тим самим словом."], "Is there…? → Yes, there <b>is</b>.", { "are": "Питали з Is: Yes, there <b>is</b>.", "does": "Питали з Is: Yes, there <b>is</b>." }),
        inp("Впиши Is або Are", "___ there a computer in your classroom?", ["Is"], ["a computer — скільки?", "Один → Is."], "a computer → <b>Is</b> there…?", { "Are": "a computer — один, тож <b>Is</b>." }),
        inp("Впиши Is або Are", "___ there any bananas in the kitchen?", ["Are"], ["bananas — скільки?", "Багато → Are."], "bananas → <b>Are</b> there…?", { "Is": "bananas — їх багато, тож <b>Are</b>." }),
        inp("Впиши коротку відповідь", "Are there any apples? — No, there ___.", ["aren't", "are not"], ["Питали з Are, відповідь «ні».", "are → aren't."], "No, there <b>aren't</b>.", { "isn't": "Питали з Are: No, there <b>aren't</b>.", "don't": "Тут помічник are: No, there <b>aren't</b>." }),
        inp("Впиши коротку відповідь", "Is there a lamp on the desk? — Yes, there ___.", ["is"], ["Питали з Is.", "Відповідь тим самим словом."], "Yes, there <b>is</b>.", { "are": "Питали з Is: Yes, there <b>is</b>." }),
        ord("«Скільки учнів у твоєму класі?»", ["many", "How", "pupils", "are", "there", "in", "your", "class"], ["how many pupils are there in your class"], ["How many → кого → are there → де?", "How many → pupils → are → there → …"], "<b>How many pupils are there in your class?</b>", "?"),
        fix("Is there any eggs in the fridge?", 0, "Are there any eggs in the fridge?", ["eggs — скільки?", "Багато → Are."], "eggs → <b>Are</b> there any eggs…?"),
        dict("Is there a shop near your house?", [DH, "a shop — один → Is."], "a shop → <b>Is</b> there…?", { "Are there a shop near your house?": "a shop — один: <b>Is</b> there…?" })
      ] }
  ] });

  /* ===================== УРОК 6 ===================== */
  const PL = "Впиши слово в множині";
  w("lessons/l6.json", {
    id: "l6", title: "Множина іменників, some / any",
    skillFiles: ["skills/plural.json"],
    skills: ["pl.reg", "pl.irr", "some.any"],
    practice: { perSkill: 4 },
    test: { plan: { "pl.reg": 3, "pl.irr": 2, "some.any": 3 }, pass: 80 },
    explain: [
      { e: "🍎", h: "Множина: зазвичай + s",
        html: `<table class="t"><tr><td>Майже всі</td><td>+ s</td><td>book → book<b>s</b><br>apple → apple<b>s</b></td></tr>
        <tr><td>-s, -sh, -ch, -x</td><td>+ es</td><td>bus → bus<b>es</b><br>box → box<b>es</b><br>watch → watch<b>es</b></td></tr>
        <tr><td>приголосна + y</td><td>y → ies</td><td>city → cit<b>ies</b></td></tr>
        <tr><td>голосна + y</td><td>+ s</td><td>toy → toy<b>s</b></td></tr></table>
        <div class="tip">💡 Знайомо? Це ті самі правила, що й для he / she / it у Present Simple: watches, studies, plays.</div>` },
      { e: "🧒", h: "Слова-винятки",
        html: `<table class="t"><tr><td>man → <b>men</b></td><td>woman → <b>women</b></td></tr>
        <tr><td>child → <b>children</b></td><td>person → <b>people</b></td></tr>
        <tr><td>foot → <b>feet</b></td><td>tooth → <b>teeth</b></td></tr>
        <tr><td>mouse → <b>mice</b></td><td>sheep → <b>sheep</b>, fish → <b>fish</b></td></tr></table>
        ${say("There are five children in the yard.", "У дворі п'ятеро дітей.", "There are five <b>children</b> in the yard.")}
        <div class="tip">⚠️ <s>childs, mans, tooths, mouses, sheeps</s> — так не буває.</div>` },
      { e: "🧺", h: "some чи any",
        html: `<table class="t"><tr><td>ствердження</td><td><b>some</b></td><td>There are <b>some</b> apples.</td></tr>
        <tr><td>заперечення</td><td><b>any</b></td><td>There aren't <b>any</b> apples.</td></tr>
        <tr><td>питання</td><td><b>any</b></td><td>Are there <b>any</b> apples?</td></tr></table>
        ${say("Would you like some tea?", "Хочеш чаю?", "Would you like <b>some</b> tea?")}
        <div class="tip">💡 Коли щось <b>пропонуємо</b> чи просимо — some навіть у питанні: Would you like <b>some</b> tea? Can I have <b>some</b> water?</div>` }
    ],
    examples: { title: "На кухні в бабусі",
      question: { q: "чому «Would you like <b>some</b> cake?» — це ж питання?", a: "Бо бабуся пропонує торт. У пропозиціях кажемо some." },
      items: [
        ["There are <b>some</b> <b>cakes</b> on the table.", "На столі є кілька тістечок."],
        ["There aren't <b>any</b> <b>bananas</b>, but there are <b>some</b> <b>apples</b>.", "Бананів немає, але є кілька яблук."],
        ["Grandma has three <b>cats</b> and two <b>dogs</b>.", "У бабусі три коти і два собаки."],
        ["Her cats catch <b>mice</b> in the garden.", "Її коти ловлять мишей у саду."],
        ["There are a lot of <b>boxes</b> and <b>dishes</b> in the kitchen.", "На кухні багато коробок і тарілок."],
        ["Are there <b>any</b> eggs? — Yes, there are ten!", "Яйця є? — Так, десять!"],
        ["Would you like <b>some</b> tea, <b>children</b>?", "Хочете чаю, діти?"]
      ] },
    words: [
      ["plate", "тарілка"], ["cup", "чашка"], ["glass", "склянка"], ["fridge", "холодильник"], ["bread", "хліб"],
      ["cheese", "сир"], ["butter", "вершкове масло"], ["egg", "яйце"], ["juice", "сік"], ["cake", "торт / тістечко"]
    ]
  });

  w("skills/plural.json", { topic: "pl", title: "Множина іменників, some / any", skills: [
    { id: "pl.reg", title: "Множина: -s, -es, -ies",
      rule: "+s; після -s, -sh, -ch, -x → +es; приголосна + y → ies; голосна + y → +s.",
      worked: { p: "Kyiv and Lviv are big ___. (city)", steps: [
        "Слово: <b>city</b>, закінчується на -y.",
        "Що перед y? Буква <b>t</b> — приголосна.",
        "Приголосна + y → y міняємо на <b>ies</b>.",
        "Відповідь: big <b>cities</b>."] },
      alt: `<p>Це ті самі правила, що для he / she / it (watch<b>es</b>, stud<b>ies</b>, play<b>s</b>):</p>
        <p>box → box<b>es</b> (язик заплітається на «boxs»)<br>city → cit<b>ies</b> (перед y приголосна)<br>toy → toy<b>s</b> (перед y голосна)</p>`,
      items: [
        inp(PL, "I have two ___. (box)", ["boxes"], ["box закінчується на -x.", "Після -x → +es."], "box → <b>boxes</b>.", { "boxs": "Після -x додаємо -es: box<b>es</b>." }, S),
        inp(PL, "There are three ___ in the street. (bus)", ["buses"], ["bus закінчується на -s.", "Після -s → +es."], "bus → <b>buses</b>.", { "buss": "Після -s додаємо -es: bus<b>es</b>.", "busses": "Пишемо з одною s: <b>buses</b>." }, S),
        inp(PL, "Kyiv and Lviv are big ___. (city)", ["cities"], ["city закінчується на -y.", "Перед y приголосна → ies."], "city → <b>cities</b>.", { "citys": "Перед y приголосна (t): cit<b>ies</b>." }, S),
        inp(PL, "My little brother has a lot of ___. (toy)", ["toys"], ["toy закінчується на -y.", "Перед y голосна → просто +s."], "toy → <b>toys</b>.", { "toies": "Перед y голосна (o), тому просто +s: toy<b>s</b>." }, S),
        inp(PL, "We have five ___ today. (lesson)", ["lessons"], ["lesson — звичайне слово.", "Просто +s."], "lesson → <b>lessons</b>.", { "lessones": "Тут просто +s: lesson<b>s</b>." }, S),
        inp(PL, "She has two ___. (watch)", ["watches"], ["watch закінчується на -ch.", "Після -ch → +es."], "watch → <b>watches</b>.", { "watchs": "Після -ch додаємо -es: watch<b>es</b>." }, S),
        inp(PL, "There are many ___ in the sky. (star)", ["stars"], ["star — звичайне слово.", "Просто +s."], "star → <b>stars</b>.", { "stares": "Тут просто +s: star<b>s</b>." }, S),
        inp(PL, "Put the ___ on the table. (dish)", ["dishes"], ["dish закінчується на -sh.", "Після -sh → +es."], "dish → <b>dishes</b>.", { "dishs": "Після -sh додаємо -es: dish<b>es</b>." }, S),
        fix("There are three boxs on the floor.", 3, "There are three boxes on the floor.", ["Подивись на множину.", "box → +es."], "box → <b>boxes</b>."),
        fix("We visited two big citys.", 4, "We visited two big cities.", ["Подивись на множину.", "Приголосна + y → ies."], "city → <b>cities</b>."),
        dict("There are five benches in the park.", [DH, "bench → +es."], "bench → <b>benches</b>.", { "There are five benchs in the park.": "Після -ch додаємо -es: bench<b>es</b>.", "There is five benches in the park.": "benches — багато: There <b>are</b>." })
      ] },

    { id: "pl.irr", title: "Винятки: men, children, teeth, mice",
      rule: "man → men, woman → women, child → children, person → people, foot → feet, tooth → teeth, mouse → mice; sheep, fish — не змінюються.",
      worked: { p: "My ___ are cold. (foot)", steps: [
        "Слово: <b>foot</b> — нога (стопа).",
        "Це виняток: не foots.",
        "foot → <b>feet</b> (oo → ee).",
        "Відповідь: My <b>feet</b> are cold."] },
      alt: `<p>Винятки легше запам'ятати парами:</p>
        <p>f<b>oo</b>t → f<b>ee</b>t, t<b>oo</b>th → t<b>ee</b>th (oo → ee)<br>m<b>a</b>n → m<b>e</b>n, wom<b>a</b>n → wom<b>e</b>n (a → e)<br>child → child<b>ren</b>, mouse → mice, person → people</p>
        <p class="muted">sheep і fish однакові в однині й множині.</p>`,
      items: [
        ch("one man — two ___", ["men", "mans"], "men", ["man — виняток.", "a → e."], "man → <b>men</b>.", { "mans": "man — виняток: <b>men</b>." }),
        ch("one child — three ___", ["children", "childs"], "children", ["child — виняток.", "child + ren."], "child → <b>children</b>.", { "childs": "child — виняток: <b>children</b>." }),
        ch("one tooth — many ___", ["teeth", "tooths"], "teeth", ["tooth — виняток.", "oo → ee."], "tooth → <b>teeth</b>.", { "tooths": "tooth — виняток: <b>teeth</b>." }),
        inp(PL, "There are two ___ in the photo. (woman)", ["women"], ["woman — виняток.", "a → e."], "woman → <b>women</b>.", { "womans": "woman — виняток: <b>women</b>." }, S),
        inp(PL, "Cats like to catch ___. (mouse)", ["mice"], ["mouse — виняток.", "Зовсім нове слово."], "mouse → <b>mice</b>.", { "mouses": "mouse — виняток: <b>mice</b>." }, S),
        inp(PL, "My ___ are cold. (foot)", ["feet"], ["foot — виняток.", "oo → ee."], "foot → <b>feet</b>.", { "foots": "foot — виняток: <b>feet</b>." }, S),
        inp(PL, "There are a lot of ___ in the street. (person)", ["people"], ["person — виняток.", "Зовсім нове слово."], "person → <b>people</b>.", { "persons": "Зазвичай кажемо <b>people</b>." }, S),
        inp(PL, "The farmer has ten ___. (sheep)", ["sheep"], ["sheep — особливе слово.", "У множині не змінюється."], "sheep → <b>sheep</b>.", { "sheeps": "sheep у множині не змінюється: ten <b>sheep</b>." }, S),
        fix("There are five childs in the yard.", 3, "There are five children in the yard.", ["Подивись на множину.", "child — виняток."], "child → <b>children</b>."),
        dict("Brush your teeth twice a day.", [DH, "tooth → teeth."], "tooth → <b>teeth</b>.", { "Brush your tooths twice a day.": "tooth — виняток: <b>teeth</b>." })
      ] },

    { id: "some.any", title: "some чи any",
      rule: "some — у ствердженні і пропозиціях; any — у запереченні й питанні.",
      worked: { p: "We don't have ___ bread.", steps: [
        "Яке речення? <b>don't</b> — заперечення.",
        "У запереченні — <b>any</b>.",
        "Відповідь: We don't have <b>any</b> bread."] },
      alt: `<p>Простий тест: у реченні є <b>not</b> (don't, isn't, aren't) або це питання? → <b>any</b>. Інакше → <b>some</b>.</p>
        <p>Виняток: коли щось пропонуєш чи просиш — <b>some</b>: Would you like some juice?</p>`,
      items: [
        ch("There are ___ apples on the table.", ["some", "any"], "some", ["Це ствердження.", "У ствердженні — some."], "Ствердження → <b>some</b>.", { "any": "У ствердженні — <b>some</b>." }),
        ch("There aren't ___ apples on the table.", ["any", "some"], "any", ["Це заперечення.", "У запереченні — any."], "Заперечення → <b>any</b>.", { "some": "У запереченні — <b>any</b>." }),
        ch("Are there ___ apples on the table?", ["any", "some"], "any", ["Це питання.", "У питанні — any."], "Питання → <b>any</b>.", { "some": "У питанні — <b>any</b>." }),
        ch("Would you like ___ tea?", ["some", "any"], "some", ["Це пропозиція.", "У пропозиціях — some."], "Пропозиція → <b>some</b>.", { "any": "Коли щось пропонуємо — <b>some</b>." }),
        inp("Впиши some або any", "I have ___ new friends at school.", ["some"], ["Це ствердження.", "some."], "Ствердження → <b>some</b>.", { "any": "У ствердженні — <b>some</b>." }),
        inp("Впиши some або any", "We don't have ___ bread.", ["any"], ["don't — заперечення.", "any."], "Заперечення → <b>any</b>.", { "some": "У запереченні — <b>any</b>." }),
        inp("Впиши some або any", "Is there ___ juice in the fridge?", ["any"], ["Це питання.", "any."], "Питання → <b>any</b>.", { "some": "У питанні — <b>any</b>." }),
        inp("Впиши some або any", "There is ___ cheese on the plate.", ["some"], ["Це ствердження.", "some."], "Ствердження → <b>some</b>.", { "any": "У ствердженні — <b>some</b>." }),
        fix("There are any cakes in the kitchen.", 2, "There are some cakes in the kitchen.", ["Це ствердження.", "У ствердженні — some."], "Ствердження → <b>some</b>."),
        fix("I don't have some money.", 3, "I don't have any money.", ["don't — заперечення.", "У запереченні — any."], "Заперечення → <b>any</b>."),
        dict("Are there any eggs in the fridge?", [DH, "Питання → any."], "Питання → <b>any</b>.", { "Are there some eggs in the fridge?": "У питанні — <b>any</b>.", "Is there any eggs in the fridge?": "eggs — багато: <b>Are</b> there…?" })
      ] }
  ] });
};
