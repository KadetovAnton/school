/* =====================================================================
   speech.js — озвучка англійською (вбудований голос браузера)
   Особливості iPhone, які тут враховано:
   • не викликаємо cancel() без потреби — iOS інколи «ковтає» фразу,
     сказану одразу після cancel();
   • явно вибираємо англійський голос (en-GB → en-US → будь-який en);
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

  var voice = null, voiceUk = null;
  function pick() {
    try {
      var vs = synth.getVoices() || [], by = function (re) { for (var i = 0; i < vs.length; i++) if (re.test(vs[i].lang)) return vs[i]; return null; };
      voice = by(/^en[-_]GB/i) || by(/^en[-_]US/i) || by(/^en/i) || null;
      voiceUk = by(/^uk/i) || null;
    } catch (e) {}
  }
  if (S.can) { pick(); try { synth.addEventListener ? synth.addEventListener("voiceschanged", pick) : (synth.onvoiceschanged = pick); } catch (e) {} }

  var unlocked = false, base = (function () { var s = document.currentScript && document.currentScript.src; return s ? s.replace(/[^\/]*$/, "") : "engine/"; })();
  function unlock() {
    if (unlocked) return; unlocked = true;
    try { var a = new Audio(base + "silent.mp3"); a.setAttribute("playsinline", ""); var p = a.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {}
  }

  function utter(text, rate, lang) {
    var u = new SpeechSynthesisUtterance(text);
    if (!voice || !voiceUk) pick();
    if (lang === "uk") { if (voiceUk) { u.voice = voiceUk; u.lang = voiceUk.lang; } else u.lang = "uk-UA"; }
    else if (voice) { u.voice = voice; u.lang = voice.lang; } else u.lang = "en-GB";
    u.rate = rate || 0.9; u.volume = 1; u.pitch = 1;
    return u;
  }
  S.say = function (text, rate, lang) {
    if (!S.can || !text) return;
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
  S.stop = function () { try { if (synth && (synth.speaking || synth.pending)) synth.cancel(); } catch (e) {} };
})();
