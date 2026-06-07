// =============================================================
//  Interactive Wine Story Scroll  +  Chacha section
//  Consumes window.PRODUCTS, window.I18N, gsap/ScrollTrigger,
//  window.AKH.bottleSVG / grapesSVG.
// =============================================================
(function () {
  const hasGSAP = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const t  = (k) => (window.I18N ? window.I18N.t(k) : k);
  const tf = (f) => (window.I18N ? window.I18N.tField(f) : (f && f.en) || "");

  const wines   = (window.PRODUCTS || []).filter(p => p.type === "wine");
  const chachas = (window.PRODUCTS || []).filter(p => p.type === "chacha");

  // Liquid colour by wine category (reads correct: ruby / amber / straw)
  function liquid(w) {
    if (w.category === "red")   return "#6b1a2c";
    if (w.category === "amber") return "#b5762a";
    if (w.category === "white") return "#e0cd86";
    return w.color || "#6b1a2c";
  }
  // Grape cluster tint by category
  function grapeTint(w) {
    if (w.category === "red")   return "#7d1a2b";
    if (w.category === "amber") return "#bd8a33";
    return "#d6c074";
  }
  const pad = (n) => String(n).padStart(2, "0");

  const stage  = document.getElementById("ws-stage");
  const grapeEl = document.getElementById("ws-grape");
  const bottleEl = document.getElementById("ws-bottle");
  const infoEl = document.getElementById("ws-info");
  const countEl = document.getElementById("ws-count");
  const dotsEl = document.getElementById("ws-dots");
  if (!stage || !wines.length) { initChacha(); return; }

  let current = -1;
  let st = null;

  function infoHTML(w) {
    const grape = w.grape || "";
    const region = tf(w.region);
    return `
      <span class="ws-type">${tf(w.style)}</span>
      <h3 class="ws-name">${tf(w.name)}</h3>
      <div class="ws-attrs">
        <div><span>${t("story.grape")}</span><strong>${grape}</strong></div>
        ${region ? `<div><span>${t("product.region")}</span><strong>${region}</strong></div>` : ""}
      </div>
      <p class="ws-line"><b>${t("product.aroma")}</b> ${tf(w.aroma)}</p>
      <p class="ws-line"><b>${t("product.taste")}</b> ${tf(w.taste)}</p>
      <div class="ws-foot">
        <span class="ws-serve">${t("story.serve")} · ${w.serve || ""}</span>
        <button class="btn ws-add" data-add="${w.id}">${t("story.shop")}</button>
      </div>`;
  }

  function render(i, dir) {
    if (i === current) return;
    current = i;
    const w = wines[i];
    bottleEl.innerHTML = window.AKH.bottleSVG(liquid(w), "#d9b15c");
    grapeEl.innerHTML = `<div class="ws-grape-glow" style="--g:${grapeTint(w)}"></div>` +
      window.AKH.grapesSVG(grapeTint(w));
    infoEl.innerHTML = infoHTML(w);
    countEl.textContent = pad(i + 1) + " / " + pad(wines.length);
    if (dotsEl) [...dotsEl.children].forEach((d, k) => d.classList.toggle("on", k === i));

    if (hasGSAP && !reduceMotion) {
      const d = dir || 1;
      gsap.fromTo(grapeEl, { x: -50 * d, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: "power3.out", overwrite: true });
      gsap.fromTo(bottleEl, { rotateY: 40 * d, scale: 0.9, opacity: 0 }, { rotateY: 0, scale: 1, opacity: 1, duration: 0.7, ease: "power3.out", overwrite: true });
      gsap.fromTo(infoEl, { x: 50 * d, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: "power3.out", overwrite: true });
    }
  }

  // ---- Dots ----
  if (dotsEl) {
    wines.forEach((w, i) => {
      const dot = document.createElement("button");
      dot.className = "ws-dot";
      dot.setAttribute("aria-label", tf(w.name));
      dot.addEventListener("click", () => {
        if (!st) { render(i, 1); return; }
        const target = st.start + ((i + 0.5) / wines.length) * (st.end - st.start);
        const lenis = window.AKH && window.AKH.lenis && window.AKH.lenis();
        if (lenis) lenis.scrollTo(target, { duration: 1.2 });
        else window.scrollTo({ top: target, behavior: "smooth" });
      });
      dotsEl.appendChild(dot);
    });
  }

  // ---- Add to cart (delegated) ----
  stage.addEventListener("click", (e) => {
    const btn = e.target.closest(".ws-add");
    if (!btn) return;
    if (window.CART) window.CART.add(btn.dataset.add, 1);
  });

  // ---- Scroll engine ----
  function buildScroll() {
    if (!hasGSAP || reduceMotion) {
      render(0, 1);
      stage.classList.add("ws-static");
      return;
    }
    const perStep = () => Math.max(window.innerHeight * 0.85, 480);
    st = ScrollTrigger.create({
      trigger: stage,
      start: "top top",
      end: () => "+=" + (wines.length * perStep()),
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        let idx = Math.floor(self.progress * wines.length);
        if (idx >= wines.length) idx = wines.length - 1;
        if (idx < 0) idx = 0;
        if (idx !== current) render(idx, idx > current ? 1 : -1);
      },
      onRefreshInit: () => { /* keep current */ }
    });
    render(0, 1);
  }

  // ---- Chacha cards ----
  function initChacha() {
    const row = document.getElementById("chacha-row");
    if (!row || !chachas.length) return;
    row.innerHTML = chachas.map(c => `
      <article class="chacha-card reveal" data-cursor="hover">
        <div class="chacha-bottle">${window.AKH.bottleSVG(c.color, "#d9b15c")}</div>
        <span class="chacha-type">${tf(c.style)}</span>
        <h3>${tf(c.name)}</h3>
        <p>${tf(c.aroma)}</p>
        <button class="btn btn-ghost ws-add" data-add="${c.id}">${t("story.shop")}</button>
      </article>`).join("");
    row.addEventListener("click", (e) => {
      const btn = e.target.closest(".ws-add");
      if (btn && window.CART) window.CART.add(btn.dataset.add, 1);
    });
  }

  // ---- Re-render on language change ----
  document.addEventListener("langchange", () => {
    const keep = current < 0 ? 0 : current;
    current = -1;
    render(keep, 1);
    initChacha();
  });

  // ---- Boot ----
  function boot() {
    initChacha();
    buildScroll();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
