// Akhmeteli Winery — company, contact and commercial terms.
//
// SINGLE SOURCE OF TRUTH. The footer block, the contact page and every legal
// document (js/legal.js) read from here, so a value changed in this file
// changes everywhere, in all three languages, at once.
//
// The legal identity below is the winery's registry record (Public Registry,
// 13/09/2021). Fields still marked "CONFIRM" are commercial terms the owner
// has not confirmed yet — they show as ordinary numbers on the site.

window.COMPANY = {
  // ---- 1. Legal identity (UniPay requirement 1) -----------------------------
  legalName: {
    ka: "შპს ქართული ღვინის კომპანია ახმეტელი",
    en: "Georgian Wine Company Akhmeteli LLC",
    ru: "ООО «Грузинская винная компания Ахметели»"
  },
  legalForm: {
    ka: "შეზღუდული პასუხისმგებლობის საზოგადოება",
    en: "Limited Liability Company",
    ru: "Общество с ограниченной ответственностью"
  },
  tradeName: {
    ka: "ახმეტელის მარანი",
    en: "Akhmeteli Winery",
    ru: "Винодельня Ахметели"
  },
  idCode: "424618079",
  registrationDate: "13/09/2021",
  registrar: {
    ka: "სსიპ საჯარო რეესტრის ეროვნული სააგენტო",
    en: "LEPL National Agency of Public Registry of Georgia",
    ru: "ППЮЛ Национальное агентство публичного реестра Грузии"
  },
  director: {
    ka: "კახა ბერაძე",
    en: "Kakha Beradze",
    ru: "Каха Берадзе"
  },
  legalAddress: {
    ka: "საქართველო, ახმეტის რაიონი, სოფ. კოღოთო",
    en: "Koghoto village, Akhmeta municipality, Georgia",
    ru: "Грузия, Ахметский муниципалитет, с. Когото"
  },

  // ---- 2. Contact (UniPay requirement 2) ------------------------------------
  phone: "+995 577 08 05 25",
  phoneHref: "tel:+995577080525",
  email: "gwc.akhmeteli@gmail.com",

  // ---- 3. Working hours (UniPay requirement 3) ------------------------------
  hours: {
    ka: "ორშაბათი–შაბათი, 10:00–19:00 (კვირა — დასვენება)",
    en: "Monday–Saturday, 10:00–19:00 (closed Sunday)",
    ru: "Понедельник–суббота, 10:00–19:00 (воскресенье — выходной)"
  },
  // Same hours without the closed-day note, for use inside a parenthesis.
  hoursShort: {
    ka: "ორშაბათი–შაბათი, 10:00–19:00",
    en: "Monday–Saturday, 10:00–19:00",
    ru: "Понедельник–суббота, 10:00–19:00"
  },

  // Visitor / tasting address, shown on the contact page and in the footer.
  visitAddress: {
    ka: "ახმეტა, კახეთი, საქართველო",
    en: "Akhmeta, Kakheti, Georgia",
    ru: "Ахмета, Кахетия, Грузия"
  },

  // ---- 5. Delivery terms (UniPay requirement 5) -----------------------------
  // These numbers must match js/cart.js (DELIVERY_FEE / FREE_THRESHOLD).
  delivery: {
    currency: "₾",
    fee: 5,               // CONFIRM
    freeOver: 50,         // CONFIRM
    tbilisiDays: "1–2",   // CONFIRM
    regionDays: "2–4",    // CONFIRM
    courier: {
      ka: "კურიერული სამსახური",   // CONFIRM the courier partner's name
      en: "courier service",
      ru: "курьерская служба"
    }
  },

  // ---- 6. Refund terms (UniPay requirement 6) -------------------------------
  refund: {
    requestDays: 14,      // CONFIRM — days the customer has to raise a claim
    processDays: "5–10"   // CONFIRM — banking days until the money is back
  },

  // Minimum age for buying alcohol in Georgia.
  minAge: 18
};

// index.html carries its own inline dictionary instead of js/i18n.js, so the
// language has to be read defensively rather than through window.I18N alone.
window.COMPANY.lang = function () {
  if (window.I18N) return window.I18N.getLang();
  let saved = null;
  try { saved = localStorage.getItem("akhmeteli.lang"); } catch (e) { /* private mode */ }
  const l = saved || document.documentElement.getAttribute("lang") || "ka";
  return ["ka", "en", "ru"].includes(l) ? l : "ka";
};

// Resolve a {ka,en,ru} field (or a plain value) for the active language.
window.COMPANY.field = function (v) {
  if (v && typeof v === "object") {
    const l = window.COMPANY.lang();
    return v[l] || v.en || "";
  }
  return v;
};

// ---------------------------------------------------------------------------
//  Footer identity block — renders into every <div data-company></div>.
//  Keeps the trader's identity, contacts and hours one click from any page,
//  which is what the e-commerce rules require.
// ---------------------------------------------------------------------------
(function () {
  const LABELS = {
    ka: { id: "ს/კ", addr: "მისამართი", phone: "ტელეფონი", email: "ელ-ფოსტა", hours: "სამუშაო საათები" },
    en: { id: "ID", addr: "Address", phone: "Phone", email: "Email", hours: "Working hours" },
    ru: { id: "ИК", addr: "Адрес", phone: "Телефон", email: "Эл. почта", hours: "Рабочие часы" }
  };

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function render() {
    const hosts = document.querySelectorAll("[data-company]");
    if (!hosts.length) return;
    const c = window.COMPANY;
    const L = LABELS[c.lang()] || LABELS.en;
    const addr = c.field(c.legalAddress) || c.field(c.visitAddress);

    const html = `
      <p class="company-block__name">${esc(c.field(c.legalName))}</p>
      <p class="company-block__line">${esc(L.id)}: ${esc(c.idCode)}</p>
      <p class="company-block__line">${esc(L.addr)}: ${esc(addr)}</p>
      <p class="company-block__line">${esc(L.phone)}:
        <a href="${esc(c.phoneHref)}">${esc(c.phone)}</a></p>
      <p class="company-block__line">${esc(L.email)}:
        <a href="mailto:${esc(c.email)}">${esc(c.email)}</a></p>
      <p class="company-block__line">${esc(L.hours)}: ${esc(c.field(c.hours))}</p>`;

    hosts.forEach(h => { h.innerHTML = html; });
  }

  function boot() {
    render();
    // index.html's inline switcher does not fire `langchange`, so re-render
    // after its own apply() has run.
    document.querySelectorAll(".lang-switch button").forEach(b => {
      b.addEventListener("click", () => setTimeout(render, 0));
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  document.addEventListener("langchange", render);
})();
