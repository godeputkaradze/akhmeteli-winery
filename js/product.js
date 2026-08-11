// Product detail page — reads ?id=... and renders the matching wine.

(function () {
  function getId() {
    // hash first (survives static-host clean-URL redirects), then ?id=
    const hash = decodeURIComponent((location.hash || "").replace(/^#/, "")).trim();
    if (hash) return hash;
    return new URLSearchParams(location.search).get("id");
  }

  function relatedFor(p) {
    return window.PRODUCTS
      .filter(x => x.id !== p.id && x.category === p.category)
      .slice(0, 4);
  }

  function relatedCard(p) {
    const name = window.I18N.tField(p.name);
    const style = window.I18N.tField(p.style);
    return `
      <article class="p-card reveal" data-id="${p.id}">
        <a class="p-bottle" href="product.html?id=${p.id}" style="--p-bg:#1a1410">
          ${window.AKH.bottleSVG(p.color, "#c9a24a")}
        </a>
        <div class="p-body">
          <span class="p-style">${style}</span>
          <h3 class="p-name">${name}</h3>
          <div class="p-foot">
            <span class="p-price">$${p.price.toFixed(2)}</span>
            <div class="p-actions">
              <button data-add="${p.id}">${window.I18N.t("card.add")}</button>
            </div>
          </div>
        </div>
      </article>`;
  }

  function render() {
    const id = getId();
    const root = document.querySelector(".product-page");
    if (!root) return;
    const p = window.PRODUCTS.find(x => x.id === id);
    if (!p) {
      root.innerHTML = `<div class="container"><a class="product-back" href="shop.html">${window.I18N.t("product.back")}</a><h1>${window.I18N.t("product.notfound")}</h1></div>`;
      return;
    }

    document.title = `${window.I18N.tField(p.name)} — ${window.I18N.t("brand.producer")}`;
    root.style.setProperty("--p-glow", `${p.color}40`);

    const name = window.I18N.tField(p.name);
    const style = window.I18N.tField(p.style);
    const region = window.I18N.tField(p.region);
    const aroma = window.I18N.tField(p.aroma);
    const taste = window.I18N.tField(p.taste);

    const awards = window.AKH.awardBadges(p.awards || []);

    root.innerHTML = `
      <div class="container">
        <a class="product-back" href="shop.html">${window.I18N.t("product.back")}</a>

        <section class="product-hero">
          <div class="product-stage reveal-scale">
            <div class="product-grapes">${window.AKH.grapesSVG(p.color)}</div>
            <div class="product-bottle">${window.AKH.bottleSVG(p.color, "#c9a24a")}</div>
          </div>
          <div class="product-info reveal">
            <span class="eyebrow">${window.I18N.t("hero.eyebrow")}</span>
            <h1>${name}</h1>
            <div class="product-style">${style}</div>
            <p class="product-region">${region}</p>
            <div class="product-price-line">
              <span class="product-price">$${p.price.toFixed(2)}</span>
              <span class="product-volume">${p.volume} ${window.I18N.t("unit.ml")} · ${p.abv}% ${window.I18N.t("unit.abv")}</span>
            </div>
            <div class="hero-actions" style="display:flex; gap:1rem; flex-wrap:wrap;">
              <button class="btn" data-add="${p.id}">${window.I18N.t("card.add")}</button>
              <a class="btn btn-ghost" href="shop.html">${window.I18N.t("products.shop_all")}</a>
            </div>
            ${awards ? `<div class="product-awards-row">${awards}</div>` : ""}
          </div>
        </section>

        <section class="product-body">
          <div class="product-aroma reveal">
            <h3>${window.I18N.t("product.aroma")}</h3>
            <p>${aroma}</p>
          </div>
          <div class="product-taste reveal reveal-delay-1">
            <h3>${window.I18N.t("product.taste")}</h3>
            <p>${taste}</p>
          </div>
        </section>

        <section class="product-specs reveal">
          <div class="spec"><div class="spec-label">${window.I18N.t("product.grape")}</div><div class="spec-value">${window.I18N.grape(p.grape)}</div></div>
          ${p.vintage ? `<div class="spec"><div class="spec-label">${window.I18N.t("product.vintage")}</div><div class="spec-value">${p.vintage}</div></div>` : ""}
          <div class="spec"><div class="spec-label">${window.I18N.t("product.abv")}</div><div class="spec-value">${p.abv}%</div></div>
          <div class="spec"><div class="spec-label">${window.I18N.t("product.volume")}</div><div class="spec-value">${p.volume} ${window.I18N.t("unit.ml")}</div></div>
          <div class="spec"><div class="spec-label">${window.I18N.t("product.serve")}</div><div class="spec-value">${window.I18N.serve(p.serve)}</div></div>
          <div class="spec"><div class="spec-label">${window.I18N.t("product.method")}</div><div class="spec-value">${window.I18N.t("shop.method." + p.method)}</div></div>
        </section>

        <section class="product-related">
          <h2 class="reveal">${window.I18N.t("product.related")}</h2>
          <div class="products-row">
            ${relatedFor(p).map(relatedCard).join("")}
          </div>
        </section>
      </div>
    `;

    // wire up add buttons
    root.querySelectorAll("[data-add]").forEach(btn => {
      btn.addEventListener("click", () => {
        const pid = btn.dataset.add;
        window.CART.add(pid, 1);
        const original = btn.textContent;
        btn.textContent = window.I18N.t("card.added");
        btn.disabled = true;
        setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 1400);
      });
    });

    // This content is injected dynamically, so the global GSAP reveal pass
    // (which runs after this) leaves these elements at opacity:0 with scroll
    // triggers that never fire for already-visible content. Force them visible
    // on the next frame, after that pass has run, so the page always shows.
    function reveal() {
      root.querySelectorAll(".reveal, .reveal-scale, .reveal-x").forEach(el => {
        el.classList.add("visible");
        el.style.opacity = "1";
        el.style.transform = "none";
        el.style.clipPath = "none";
      });
    }
    requestAnimationFrame(() => requestAnimationFrame(reveal));
    window.addEventListener("load", reveal);
  }

  document.addEventListener("DOMContentLoaded", render);
  document.addEventListener("rerender", render);
})();
