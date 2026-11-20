/* =====================================================================
   speech.js — озвучка англійською (вбудований голос браузера)
   Особливості iPhone, які тут враховано:
   • не викликаємо cancel() без потреби — iOS інколи «ковтає» фразу,
     сказану одразу після cancel();
   • вибираємо найчіткіший англійський голос (без роботизованих; тато може обрати сам);
   • при першому натисканні програємо тиху аудіодоріжку — це перемикає
     iPhone у режим «відтворення медіа», щоб звук був і в беззвучному режимі
     (на частині версій iOS озвучка все одно глушиться перемикачем 🔕).
   ===================================================================== */
(function () {
  "use strict";
  var S = (window.SAY = {});
  var synth = null;
  try { synth = window.speechSynthesis || null; } catch (e) {}
  S.can = !!synth && typeof window.SpeechSynthesisUtterance === "function";

  var voice = null, voiceUk = null, VKEY = "school-voice";
  /* Якість голосу. На iPhone/Mac серед англійських голосів є «іграшкові» й роботизовані
     (Eddy, Flo, Rocko, Grandpa, Bubbles, Zarvox…) — вони звучать нечітко, їх не беремо.
     Найкращі — з позначкою Enhanced / Premium (тато може завантажити в налаштуваннях iPhone). */
  var BAD = /eddy|flo\b|grandma|grandpa|reed|rocko|sandy|shelley|albert|bad news|bahh|bells|boing|bubbles|cellos|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|hysterical|deranged|pipe|junior|ralph|fred|kathy|princess|vicki|victoria/i;
  var GOOD = /daniel|serena|kate|arthur|martha|stephanie|oliver|samantha|karen|moira|tessa|ava|allison|susan|tom\b|evan|nathan|zoe|joelle|noelle|google uk english|google us english|libby|sonia|ryan|maisie|aria|jenny|guy/i;
  function score(v) {
    if (!/^en/i.test(v.lang)) return -999;
    var n = v.name || "", sc = 0;
    if (BAD.test(n)) return -100;
    if (/^en[-_]GB/i.test(v.lang)) sc += 3; else if (/^en[-_]US/i.test(v.lang)) sc += 2; else sc += 1;
    if (/enhanced|premium|neural|natural|покращ|улучш/i.test(n)) sc += 10;
    if (GOOD.test(n)) sc += 5;
    if (v.localService === false && /google|microsoft/i.test(n)) sc += 2;
    return sc;
  }
  function chosen() { try { return localStorage.getItem(VKEY) || ""; } catch (e) { return ""; } }
  S.voices = function () { // англійські голоси від найкращого
    try { return (synth.getVoices() || []).filter(function (v) { return score(v) > -999; }).sort(function (a, b) { return score(b) - score(a); }).map(function (v) { return { name: v.name, lang: v.lang, good: score(v) >= 10, bad: score(v) < 0 }; }); } catch (e) { return []; }
  };
  S.setVoice = function (name) { try { if (name) localStorage.setItem(VKEY, name); else localStorage.removeItem(VKEY); } catch (e) {} voice = null; pick(); };
  S.current = function () { return voice ? voice.name : ""; };
  S.preview = function (name, text) { // прослухати голос, не обираючи його
    try { var keep = voice, vs = synth.getVoices() || []; for (var i = 0; i < vs.length; i++) if (vs[i].name === name) voice = vs[i]; S.say(text, 0.9); voice = keep; } catch (e) {}
  };
  function pick() {
    try {
      var vs = synth.getVoices() || [], want = chosen(), best = null, bs = -1e9, i;
      for (i = 0; i < vs.length; i++) {
        if (want && vs[i].name === want) { best = vs[i]; break; }
        var sc = score(vs[i]); if (sc > bs) { bs = sc; best = vs[i]; }
      }
      voice = best && score(best) > -999 ? best : null;
      voiceUk = null;
      for (i = 0; i < vs.length; i++) if (/^uk/i.test(vs[i].lang)) { voiceUk = vs[i]; if (/enhanced|premium/i.test(vs[i].name)) break; }
    } catch (e) {}
  }
  function changed() { voice = null; pick(); if (S.onvoices) try { S.onvoices(); } catch (e) {} }
  if (S.can) { pick(); try { synth.addEventListener ? synth.addEventListener("voiceschanged", changed) : (synth.onvoiceschanged = changed); } catch (e) {} }

  var unlocked = false, base = (function () { var s = document.currentScript && document.currentScript.src; return s ? s.replace(/[^\/]*$/, "") : "engine/"; })();
  function unlock() {
    if (unlocked) return; unlocked = true;
    try { var a = new Audio(base + "silent.mp3"); a.setAttribute("playsinline", ""); var p = a.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {}
  }

  function utter(text, rate, lang) {
    var u = new SpeechSynthesisUtterance(text);
    if (!voice) pick();
    if (lang === "uk") { if (voiceUk) { u.voice = voiceUk; u.lang = voiceUk.lang; } else u.lang = "uk-UA"; }
    else if (voice) { u.voice = voice; u.lang = voice.lang; } else u.lang = "en-GB";
    u.rate = rate || 0.9; u.volume = 1; u.pitch = 1;
    return u;
  }
  /* ---- записана озвучка (Gemini з AI Studio): content/audio/en/index.json = {нормалізований текст: файл} ---- */
  var REC = null, recBase = base.replace(/engine\/$/, "") + "content/audio/en/", player = null;
  function norm(t) { return String(t).replace(/<[^>]+>/g, "").replace(/[\u2018\u2019]/g, "'").toLowerCase().replace(/[^a-z0-9' ]+/g, " ").replace(/\s+/g, " ").replace(/^ | $/g, ""); }
  try {
    var xr = new XMLHttpRequest(); xr.open("GET", recBase + "index.json?v=" + (window.APP_VER || ""), true);
    xr.onload = function () { try { if (xr.status === 200) REC = JSON.parse(xr.responseText); } catch (e) {} };
    xr.send();
  } catch (e) {}
  // перше натискання будь-де «розблоковує» програвач, щоб запис грав і з затримкою (Safari на iPhone)
  function arm() {
    try { if (!player) { player = new Audio(); player.setAttribute("playsinline", ""); } if (!player.src) { player.src = base + "silent.mp3"; var q = player.play(); if (q && q.catch) q.catch(function () {}); } } catch (e) {}
    document.removeEventListener("touchend", arm, true); document.removeEventListener("click", arm, true);
  }
  try { document.addEventListener("touchend", arm, true); document.addEventListener("click", arm, true); } catch (e) {}
  S.recorded = function (text) { return !!(REC && REC[norm(text)]); };
  function playRec(text, rate) {
    var f = REC && REC[norm(text)];
    if (!f) return false;
    try {
      if (synth && (synth.speaking || synth.pending)) synth.cancel();
      if (!player) { player = new Audio(); player.setAttribute("playsinline", ""); }
      player.pause();
      player.src = recBase + f;
      var slow = rate && rate < 0.8;
      player.playbackRate = slow ? 0.75 : 1; // повільно — без «мультяшного» спотворення (тон зберігається)
      try { player.preservesPitch = true; player.webkitPreservesPitch = true; } catch (e) {}
      var p = player.play();
      if (p && p.catch) p.catch(function () { S.say(text, rate, "synth"); });
      return true;
    } catch (e) { return false; }
  }

  S.say = function (text, rate, lang) {
    if (!text) return;
    if (lang !== "uk" && lang !== "synth" && playRec(text, rate)) return;
    if (!S.can) return;
    try {
      unlock();
      if (synth.speaking || synth.pending) synth.cancel();
      if (synth.paused) synth.resume();
      synth.speak(utter(text, rate, lang));
    } catch (e) {}
  };
  S.list = function (texts, rate) {
    if (!S.can) return;
    try {
      unlock();
      if (synth.speaking || synth.pending) synth.cancel();
      texts.forEach(function (t) { synth.speak(utter(t, rate)); });
    } catch (e) {}
  };
  S.uk = function (text) { S.say(text, 0.95, "uk"); }; // українською — для завдань молодших
  S.stop = function () { try { if (player) player.pause(); if (synth && (synth.speaking || synth.pending)) synth.cancel(); } catch (e) {} };
})();
