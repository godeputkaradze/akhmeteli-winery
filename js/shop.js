// Shop page: filter, sort, render. Also used for the "products" preview on home.

(function () {
  const state = {
    category: new Set(),
    sweetness: new Set(),
    method: new Set(),
    sort: "featured"
  };

  function filtered() {
    return window.PRODUCTS.filter(p => {
      if (state.category.size && !state.category.has(p.category)) return false;
      if (state.sweetness.size && !state.sweetness.has(p.sweetness)) return false;
      if (state.method.size && !state.method.has(p.method)) return false;
      return true;
    });
  }

  function sorted(list) {
    const a = list.slice();
    switch (state.sort) {
      case "priceAsc":  a.sort((x, y) => x.price - y.price); break;
      case "priceDesc": a.sort((x, y) => y.price - x.price); break;
      case "name":      a.sort((x, y) => window.I18N.tField(x.name).localeCompare(window.I18N.tField(y.name))); break;
      default: /* featured: keep catalog order */ break;
    }
    return a;
  }

  function cardHTML(p) {
    const name = window.I18N.tField(p.name);
    const style = window.I18N.tField(p.style);
    const region = window.I18N.tField(p.region);
    const award = p.awards && p.awards.length ? `<span class="p-award">${p.awards[0]}</span>` : "";
    return `
      <article class="p-card reveal" data-id="${p.id}">
        ${award}
        <a class="p-bottle" href="product.html?id=${p.id}" style="--p-bg:${shade(p.color, 0.15)}">
          ${window.AKH.bottleSVG(p.color, "#c9a24a")}
        </a>
        <div class="p-body">
          <span class="p-style">${style}</span>
          <h3 class="p-name">${name}</h3>
          <p class="p-region">${region}</p>
          <div class="p-foot">
            <span class="p-price">${window.AKH.money(p.price)}</span>
            <div class="p-actions">
              <a href="product.html?id=${p.id}">${window.I18N.t("card.view")}</a>
              <button data-add="${p.id}">${window.I18N.t("card.add")}</button>
            </div>
          </div>
        </div>
      </article>`;
  }

  function shade(hex, amount) {
    // mix hex with black (negative) — used to give each bottle a subtle backdrop
    const h = hex.replace("#","");
    const r = parseInt(h.substr(0,2),16), g = parseInt(h.substr(2,2),16), b = parseInt(h.substr(4,2),16);
    const k = 1 - Math.max(0, Math.min(1, amount));
    const rr = Math.round(r * k), gg = Math.round(g * k), bb = Math.round(b * k);
    return `rgb(${rr},${gg},${bb})`;
  }

  function renderHome() {
    const target = document.querySelector("[data-products-row]");
    if (target) {
      const max = parseInt(target.dataset.productsRow, 10) || 6;
      const list = window.PRODUCTS.slice(0, max);
      target.innerHTML = list.map(cardHTML).join("");
      bindAddButtons(target);
      revealNew(target);
    }

    const hs = document.querySelector("[data-horizontal]");
    if (hs) {
      const lang = window.I18N.getLang();
      const introTitle = lang === "ka"
        ? '15 ეტიკეტი<br/><em>15 ისტორია</em>'
        : lang === "ru"
        ? '15 этикеток<br/><em>15 историй</em>'
        : '15 labels<br/><em>15 stories</em>';
      const introHint = lang === "ka" ? "გადახედე →" : lang === "ru" ? "Листай →" : "Scroll →";
      const intro = `
        <div class="hs-intro">
          <h2>${introTitle}</h2>
          <p>${introHint} <span class="hs-arrow">→</span></p>
        </div>`;
      hs.innerHTML = intro + window.PRODUCTS.map((p, i) => {
        const name = window.I18N.tField(p.name);
        const style = window.I18N.tField(p.style);
        const num = String(i + 1).padStart(2, "0");
        return `
          <article class="hs-card" style="--c:${p.color}">
            <a class="hs-card-bottle" href="product.html?id=${p.id}">
              ${window.AKH.bottleSVG(p.color, "#d9b15c")}
            </a>
            <div class="hs-card-info">
              <span class="hs-num">${num} / 15</span>
              <h3>${name}</h3>
              <p>${style}</p>
              <a class="hs-cta" href="product.html?id=${p.id}">${window.I18N.t("card.view")} →</a>
            </div>
          </article>`;
      }).join("");
    }
  }

  function renderShop() {
    const list = document.querySelector(".shop-list");
    const count = document.querySelector(".shop-count");
    if (!list) return;
    const items = sorted(filtered());
    if (!items.length) {
      list.innerHTML = `<div class="shop-empty">${window.I18N.t("shop.empty")}</div>`;
    } else {
      list.innerHTML = items.map(cardHTML).join("");
    }
    if (count) count.textContent = `${items.length} / ${window.PRODUCTS.length}`;
    bindAddButtons(list);
    revealNew(list);
  }

  function bindAddButtons(root) {
    root.querySelectorAll("[data-add]").forEach(btn => {
      btn.addEventListener("click", e => {
        e.preventDefault();
        const id = btn.dataset.add;
        window.CART.add(id, 1);
        const original = btn.textContent;
        btn.textContent = window.I18N.t("card.added");
        btn.disabled = true;
        setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 1400);
      });
    });
  }

  function revealNew(root) {
    // Trigger the IntersectionObserver re-attach for new cards
    const items = root.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      items.forEach(i => i.classList.add("visible"));
      return;
    }
    const obs = new IntersectionObserver(es => {
      es.forEach(en => { if (en.isIntersecting) { en.target.classList.add("visible"); obs.unobserve(en.target); } });
    }, { threshold: 0.1 });
    items.forEach(i => obs.observe(i));
  }

  function bindFilters() {
    document.querySelectorAll(".filter-list input[type=checkbox]").forEach(cb => {
      cb.addEventListener("change", () => {
        const group = cb.dataset.group;
        const value = cb.dataset.value;
        if (cb.checked) state[group].add(value);
        else state[group].delete(value);
        renderShop();
      });
    });
    document.querySelector(".filter-clear")?.addEventListener("click", () => {
      state.category.clear();
      state.sweetness.clear();
      state.method.clear();
      document.querySelectorAll(".filter-list input[type=checkbox]").forEach(cb => cb.checked = false);
      renderShop();
    });
    document.querySelector(".shop-sort")?.addEventListener("change", e => {
      state.sort = e.target.value;
      renderShop();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderHome();
    if (document.querySelector(".shop-list")) {
      bindFilters();
      renderShop();
    }
  });

  document.addEventListener("rerender", () => {
    renderHome();
    renderShop();
  });
})();
