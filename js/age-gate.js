/* ================= 18+ AGE GATE =================
   Self-contained age verification shown on entry to the site.
   Loaded synchronously in <head> on every page so it injects before
   the page paints — no flash of content behind it.

   - Remembers a confirmed visitor in localStorage ("akhmeteli.age_ok")
     so they are only asked once.
   - Reads/writes the site language key ("akhmeteli.lang") and offers a
     KA/EN/RU switch, so the question shows in the visitor's language.
   - Has its own trilingual strings, so it does not depend on the page's
     i18n setup (index.html and the inner pages use different ones).
*/
(function () {
  "use strict";

  var AGE_KEY = "akhmeteli.age_ok";
  var LANG_KEY = "akhmeteli.lang";
  var SUPPORTED = ["ka", "en", "ru"];
  var LEAVE_URL = "https://www.google.com";

  // Already verified → do nothing.
  try {
    if (localStorage.getItem(AGE_KEY) === "yes") return;
  } catch (e) { /* storage blocked — show the gate anyway */ }

  var STR = {
    ka: {
      age: "18+",
      title: "ასაკის დადასტურება",
      text: "ეს საიტი შეიცავს ალკოჰოლურ პროდუქციას. გასაგრძელებლად დაადასტურეთ, რომ ხართ 18 წლის ან მეტის.",
      yes: "დიახ, ვარ 18+",
      no: "არა",
      legal: "ალკოჰოლის ჭარბი მოხმარება ჯანმრთელობისთვის მავნებელია.",
      denyTitle: "ბოდიში",
      denyText: "სამწუხაროდ, ამ საიტზე წვდომა მხოლოდ 18 წელს გადაცილებულ პირებს აქვთ.",
      back: "← უკან დაბრუნება"
    },
    en: {
      age: "18+",
      title: "Age verification",
      text: "This site features alcoholic products. To continue, please confirm that you are 18 years of age or older.",
      yes: "Yes, I'm 18+",
      no: "No",
      legal: "Excessive consumption of alcohol is harmful to your health.",
      denyTitle: "Sorry",
      denyText: "Access to this site is restricted to visitors who are 18 years or older.",
      back: "← Go back"
    },
    ru: {
      age: "18+",
      title: "Подтверждение возраста",
      text: "На этом сайте представлена алкогольная продукция. Чтобы продолжить, подтвердите, что вам 18 лет или больше.",
      yes: "Да, мне 18+",
      no: "Нет",
      legal: "Чрезмерное употребление алкоголя вредит вашему здоровью.",
      denyTitle: "Извините",
      denyText: "Доступ к этому сайту разрешён только посетителям старше 18 лет.",
      back: "← Назад"
    }
  };

  function getLang() {
    try {
      var saved = localStorage.getItem(LANG_KEY);
      if (saved && SUPPORTED.indexOf(saved) !== -1) return saved;
    } catch (e) {}
    return "ka";
  }

  function setLang(lang) {
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
    // keep the rest of the page in sync if it exposes I18N
    if (window.I18N && typeof window.I18N.setLang === "function") {
      try { window.I18N.setLang(lang); } catch (e) {}
    }
  }

  var root = document.documentElement;
  root.classList.add("age-locked");

  var overlay = document.createElement("div");
  overlay.className = "age-gate";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "Age verification");

  function langButtons(active) {
    return (
      '<div class="age-gate__langs" role="group" aria-label="Language">' +
      SUPPORTED.map(function (l) {
        return '<button type="button" data-ag-lang="' + l + '"' +
          (l === active ? ' class="active"' : "") + ">" + l.toUpperCase() + "</button>";
      }).join("") +
      "</div>"
    );
  }

  function renderQuestion() {
    var lang = getLang();
    var s = STR[lang] || STR.ka;
    overlay.innerHTML =
      '<div class="age-gate__card">' +
        '<img class="age-gate__logo" src="img/logo-gold.png" alt="Akhmeteli Winery" />' +
        langButtons(lang) +
        '<div class="age-gate__age">' + s.age + "</div>" +
        '<h2 class="age-gate__title">' + s.title + "</h2>" +
        '<p class="age-gate__text">' + s.text + "</p>" +
        '<div class="age-gate__actions">' +
          '<button type="button" class="age-gate__btn age-gate__btn--yes" data-ag="yes">' + s.yes + "</button>" +
          '<button type="button" class="age-gate__btn age-gate__btn--no" data-ag="no">' + s.no + "</button>" +
        "</div>" +
        '<p class="age-gate__legal">' + s.legal + "</p>" +
      "</div>";
  }

  function renderDenied() {
    var lang = getLang();
    var s = STR[lang] || STR.ka;
    overlay.innerHTML =
      '<div class="age-gate__card">' +
        '<img class="age-gate__logo" src="img/logo-gold.png" alt="Akhmeteli Winery" />' +
        '<h2 class="age-gate__title">' + s.denyTitle + "</h2>" +
        '<p class="age-gate__text">' + s.denyText + "</p>" +
        '<button type="button" class="age-gate__btn age-gate__btn--yes" data-ag="leave">' + s.age + " — " + s.no + "</button>" +
        '<div><button type="button" class="age-gate__leave" data-ag="reset">' + s.back + "</button></div>" +
      "</div>";
  }

  function accept() {
    try { localStorage.setItem(AGE_KEY, "yes"); } catch (e) {}
    overlay.classList.add("age-gate--hiding");
    var done = function () {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      root.classList.remove("age-locked");
    };
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { done(); } else { setTimeout(done, 520); }
  }

  overlay.addEventListener("click", function (ev) {
    var btn = ev.target.closest("[data-ag], [data-ag-lang]");
    if (!btn) return;
    if (btn.hasAttribute("data-ag-lang")) {
      setLang(btn.getAttribute("data-ag-lang"));
      // re-render whichever view we're in
      if (overlay.querySelector('[data-ag="reset"]')) renderDenied();
      else renderQuestion();
      return;
    }
    var action = btn.getAttribute("data-ag");
    if (action === "yes") accept();
    else if (action === "no") renderDenied();
    else if (action === "reset") renderQuestion();
    else if (action === "leave") window.location.href = LEAVE_URL;
  });

  renderQuestion();

  // documentElement always exists during head parsing; body may not yet.
  (document.body || root).appendChild(overlay);
})();
