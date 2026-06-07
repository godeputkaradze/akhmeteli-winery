// =============================================================
//  AKHMETELI 2026 — hero slider + collection / chacha / awards
//  Reuses window.PRODUCTS, window.I18N, window.CART, GSAP (optional).
// =============================================================
(function () {
  const hasGSAP = typeof gsap !== "undefined";
  const t  = (k) => (window.I18N ? window.I18N.t(k) : k);
  const tf = (f) => (window.I18N ? window.I18N.tField(f) : (f && f.en) || "");
  const img = (id) => `assets/bottles/${id}.png`;
  const wines   = (window.PRODUCTS || []).filter(p => p.type === "wine");
  const chachas = (window.PRODUCTS || []).filter(p => p.type === "chacha");
  const byId = (id) => (window.PRODUCTS || []).find(p => p.id === id);
  const money = (p) => "$" + Number(p).toFixed(1);

  /* ---------------- HERO SLIDER ---------------- */
  const SLIDES = [
    { num: 1, kicker: "Akhmeta · Kakheti", top: "WINE OF",       script: "Kakheti", textKey: "hero.s1.text", id: "saperavi" },
    { num: 2, kicker: "Qvevri Tradition",  top: "BORN OF",       script: "Qvevri",  textKey: "hero.s2.text", id: "kisi" },
    { num: 3, kicker: "Eight Thousand Years", top: "AGED IN",    script: "Amber",   textKey: "hero.s3.text", id: "tibaani" },
  ];

  function buildHero() {
    const host = document.getElementById("hero-slides");
    if (!host) return;
    host.innerHTML = SLIDES.map((s, i) => `
      <div class="slide${i === 0 ? " is-active" : ""}" data-slide="${i}">
        <div class="slide__halo"></div>
        <img class="slide__bottle" src="${img(s.id)}" alt="" />
        <div class="slide__head">
          <div class="slide__num"><b>0${s.num}</b> &nbsp;/&nbsp; 03 &nbsp;—&nbsp; ${s.kicker}</div>
          <h1 class="slide__title">${s.top}<span class="script">${s.script}</span></h1>
        </div>
        <div class="slide__aside">
          <p data-i18n="${s.textKey}"></p>
          <a class="link-arrow" href="#story"><span data-i18n="hero.discover"></span><span class="ln"></span></a>
        </div>
      </div>`).join("");

    const counter = document.getElementById("hero-counter");
    const slidesEls = [...host.querySelectorAll(".slide")];
    let cur = 0, timer = null;

    function go(n) {
      const next = (n + SLIDES.length) % SLIDES.length;
      if (next === cur) return;
      const prevEl = slidesEls[cur], nextEl = slidesEls[next];
      slidesEls.forEach(el => el.classList.remove("is-active"));
      nextEl.classList.add("is-active");
      cur = next;
      if (counter) counter.innerHTML = `<b>0${cur + 1}</b> / 03`;
      if (hasGSAP) {
        const b = nextEl.querySelector(".slide__bottle");
        const h = nextEl.querySelector(".slide__head");
        const a = nextEl.querySelector(".slide__aside");
        gsap.fromTo(nextEl, { opacity: 0 }, { opacity: 1, duration: .6, ease: "power2.out" });
        gsap.fromTo(b, { yPercent: 6, scale: .96, opacity: 0 }, { yPercent: 0, scale: 1, opacity: 1, duration: 1.1, ease: "power3.out" });
        gsap.fromTo(h, { x: -40, opacity: 0 }, { x: 0, opacity: 1, duration: .9, ease: "power3.out", delay: .05 });
        gsap.fromTo(a, { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: .9, ease: "power3.out", delay: .12 });
      }
    }
    function next() { go(cur + 1); }
    function prev() { go(cur - 1); }
    function autoplay() { clearInterval(timer); timer = setInterval(next, 7000); }

    document.getElementById("hero-next")?.addEventListener("click", () => { next(); autoplay(); });
    document.getElementById("hero-prev")?.addEventListener("click", () => { prev(); autoplay(); });
    document.querySelector(".hero")?.addEventListener("mouseenter", () => clearInterval(timer));
    document.querySelector(".hero")?.addEventListener("mouseleave", autoplay);
    if (counter) counter.innerHTML = `<b>01</b> / 03`;
    autoplay();
  }

  /* ---------------- COLLECTION (wines) ---------------- */
  function wineCard(p) {
    return `
      <article class="wine-card reveal" data-cat="${p.category}">
        <div class="wine-card__shot"><img src="${img(p.id)}" alt="${tf(p.name)}" loading="lazy" /></div>
        <span class="wine-card__cat">${tf(p.style)}</span>
        <h3 class="wine-card__name">${tf(p.name)}</h3>
        <span class="wine-card__style">${p.grape}</span>
        <div class="wine-card__foot">
          <span class="wine-card__price">${money(p.price)}</span>
          <button class="wine-card__add" data-add="${p.id}">${t("story.shop")}</button>
        </div>
      </article>`;
  }
  function buildCollection() {
    const grid = document.getElementById("wine-grid");
    if (grid) grid.innerHTML = wines.map(wineCard).join("");
    // filters
    const fbar = document.getElementById("coll-filters");
    if (fbar) {
      fbar.addEventListener("click", (e) => {
        const b = e.target.closest("button[data-filter]");
        if (!b) return;
        [...fbar.children].forEach(c => c.classList.remove("active"));
        b.classList.add("active");
        const f = b.dataset.filter;
        grid.querySelectorAll(".wine-card").forEach(card => {
          card.style.display = (f === "all" || card.dataset.cat === f) ? "" : "none";
        });
        if (hasGSAP && window.ScrollTrigger) ScrollTrigger.refresh();
      });
    }
  }

  /* ---------------- CHACHA ---------------- */
  function buildChacha() {
    const row = document.getElementById("chacha-row");
    if (!row) return;
    row.innerHTML = chachas.map(c => `
      <article class="chacha__card reveal" data-cursor="hover">
        <img src="${img(c.id)}" alt="${tf(c.name)}" loading="lazy" />
        <span class="t">${tf(c.style)}</span>
        <h3>${tf(c.name)}</h3>
        <p class="muted" style="margin-bottom:1.4rem">${tf(c.aroma)}</p>
        <button class="btn" data-add="${c.id}">${t("story.shop")}</button>
      </article>`).join("");
  }

  /* ---------------- AWARDS (certificates) ---------------- */
  function buildAwards() {
    const row = document.getElementById("awards-row");
    if (!row) return;
    const certs = ["certificate-01", "certificate-02", "certificate-03", "certificate-04", "certificate-05"];
    row.innerHTML = certs.map(c => `
      <div class="awards__cert reveal"><img src="assets/medals/${c}.png" alt="Award certificate" loading="lazy" /></div>`).join("");
  }

  /* ---------------- Add to cart (delegated) ---------------- */
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-add]");
    if (b && window.CART) { window.CART.add(b.dataset.add, 1); }
  });

  /* ---------------- Mobile menu ---------------- */
  function initMobileMenu() {
    const toggle = document.querySelector(".menu-toggle");
    const menu = document.getElementById("mobile-menu");
    if (!toggle || !menu) return;
    toggle.addEventListener("click", () => menu.classList.toggle("open"));
    menu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => menu.classList.remove("open")));
  }

  /* ---------------- boot + langchange ---------------- */
  function renderAll() { buildCollection(); buildChacha(); buildAwards(); }
  function boot() {
    buildHero();
    renderAll();
    initMobileMenu();
    if (window.I18N) window.I18N.apply();
  }
  document.addEventListener("langchange", () => { renderAll(); if (window.I18N) window.I18N.apply(); });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
