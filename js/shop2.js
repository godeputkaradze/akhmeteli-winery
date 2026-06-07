// =============================================================
//  SHOP v2 — light marketplace grid + filters
//  Renders window.PRODUCTS into the .shop2 catalogue layout.
// =============================================================
(function () {
  const PRODUCER = "Akhmeteli Winery";
  const LARI = "₾"; // ₾

  // ---- label maps ----
  const CAT = { red: "Red", white: "White", amber: "Amber", spirit: "Spirit" };
  const SWEET = { dry: "Dry", "semi-dry": "Semi-Dry", "semi-sweet": "Semi-Sweet", "n/a": "" };
  const TECH = { qvevri: "Qvevri", european: "European", distilled: "Distilled" };

  // ---- method icons ----
  const ICON = {
    qvevri: '<svg viewBox="0 0 24 30" aria-hidden="true"><path d="M12 1c-1.4 0-2.4 1-2.4 2.2 0 .8.4 1.4 1 1.9C7 6.6 5 10.2 5 15.4 5 22.4 8.4 28 12 28s7-5.6 7-12.6c0-5.2-2-8.8-5.6-10.3.6-.5 1-1.1 1-1.9C14.4 2 13.4 1 12 1z"/></svg>',
    european: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12l1 3H5l1-3zm-1 4h14c.7 1.9 1 4 1 6s-.3 4.1-1 6H5c-.7-1.9-1-4-1-6s.3-4.1 1-6zm0 14h14l-1 2.4H6L5 21z"/></svg>',
    distilled: '<svg viewBox="0 0 24 30" aria-hidden="true"><path d="M12 2c-3 0-5 2-5 5 0 5-4 7-4 13 0 5 4 7 9 7s9-2 9-7c0-6-4-8-4-13 0-3-2-5-5-5z"/></svg>'
  };

  const $ = (s, r) => (r || document).querySelector(s);
  const t = (k) => (window.I18N ? window.I18N.t(k) : k);
  const tf = (f) => (window.I18N ? window.I18N.tField(f) : (f && f.en) || f || "");
  const P = () => window.PRODUCTS || [];

  function styleLabel(p) {
    if (p.category === "spirit") return "Chacha";
    const c = CAT[p.category] || "";
    const s = SWEET[p.sweetness] || "";
    return (c + " " + s).trim();
  }
  function salePrice(p) { return p.sale ? p.price * (1 - p.sale / 100) : p.price; }
  function money(n) { return n.toFixed(2) + " " + LARI; }

  // ---- filter state ----
  const state = {
    category: new Set(), tech: new Set(), grape: new Set(),
    origin: new Set(), abv: new Set(), vintage: new Set(),
    pMin: 0, pMax: 0, sort: "newest"
  };
  let pFloor = 0, pCeil = 0;

  function distinct(getter) {
    return [...new Set(P().map(getter))].filter(v => v !== "" && v != null);
  }

  // ---- build the sidebar ----
  function buildSidebar() {
    // top category links
    const cats = distinct(p => p.category);
    $("#s2-cat").innerHTML = cats.map(c =>
      `<li><button data-cat="${c}">${(CAT[c] || c).toUpperCase()}</button></li>`).join("");
    $("#s2-cat").querySelectorAll("button").forEach(b => {
      b.addEventListener("click", () => {
        const c = b.dataset.cat;
        if (state.category.has(c)) { state.category.delete(c); b.classList.remove("is-active"); }
        else { state.category.add(c); b.classList.add("is-active"); }
        render();
      });
    });

    // price range from data
    pFloor = Math.floor(Math.min(...P().map(salePrice)));
    pCeil = Math.ceil(Math.max(...P().map(p => p.price)));
    state.pMin = pFloor; state.pMax = pCeil;
    $("#s2-pmin").value = pFloor; $("#s2-pmax").value = pCeil;
    const rMin = $("#s2-rmin"), rMax = $("#s2-rmax");
    rMin.min = rMax.min = pFloor; rMin.max = rMax.max = pCeil;
    rMin.value = pFloor; rMax.value = pCeil;
    $("#s2-lmin").textContent = pFloor; $("#s2-lmax").textContent = pCeil;
    syncSliderFill();

    // accordion groups
    const groups = [
      { key: "abv", title: "Alcohol %", opts: distinct(p => p.abv).sort((a, b) => a - b).map(v => ({ v, label: v + "%" })) },
      { key: "vintage", title: "Vintage Year", opts: distinct(p => p.vintage).sort((a, b) => b - a).map(v => ({ v, label: String(v) })) },
      { key: "tech", title: "Technology", opts: distinct(p => p.method).map(v => ({ v, label: TECH[v] || v })) },
      { key: "grape", title: "Grape", opts: distinct(p => p.grape).map(v => ({ v, label: v })) },
      { key: "origin", title: "Origin", opts: distinct(p => tf(p.region)).map(v => ({ v, label: v })) }
    ];
    $("#s2-groups").innerHTML = groups.map(g => `
      <div class="s2-group" data-group="${g.key}">
        <button class="s2-group__head" type="button" data-acc>${g.title}<i class="s2-chev"></i></button>
        <div class="s2-group__body">
          ${g.opts.map(o => `
            <label class="s2-opt">
              <input type="checkbox" data-fkey="${g.key}" value="${String(o.v).replace(/"/g, "&quot;")}">
              <span>${o.label}</span>
            </label>`).join("")}
        </div>
      </div>`).join("");

    // wire accordions (incl. the price group)
    document.querySelectorAll("[data-acc]").forEach(h => {
      h.addEventListener("click", () => h.closest(".s2-group").classList.toggle("open"));
    });
    // checkbox filters
    $("#s2-groups").querySelectorAll("input[type=checkbox]").forEach(cb => {
      cb.addEventListener("change", () => {
        const set = state[cb.dataset.fkey];
        const val = cb.dataset.fkey === "abv" ? parseFloat(cb.value)
                  : cb.dataset.fkey === "vintage" ? parseInt(cb.value, 10)
                  : cb.value;
        if (cb.checked) set.add(val); else set.delete(val);
        render();
      });
    });
  }

  // ---- price slider behaviour ----
  function syncSliderFill() {
    const span = (pCeil - pFloor) || 1;
    const a = ((state.pMin - pFloor) / span) * 100;
    const b = ((state.pMax - pFloor) / span) * 100;
    const fill = $("#s2-fill");
    fill.style.left = a + "%";
    fill.style.width = (b - a) + "%";
  }
  function wireSlider() {
    const rMin = $("#s2-rmin"), rMax = $("#s2-rmax");
    const nMin = $("#s2-pmin"), nMax = $("#s2-pmax");
    function fromRange() {
      let lo = +rMin.value, hi = +rMax.value;
      if (lo > hi) { const m = lo; lo = hi; hi = m; }
      state.pMin = lo; state.pMax = hi;
      nMin.value = lo; nMax.value = hi;
      syncSliderFill(); render();
    }
    function fromNumber() {
      let lo = Math.max(pFloor, Math.min(pCeil, +nMin.value || pFloor));
      let hi = Math.max(pFloor, Math.min(pCeil, +nMax.value || pCeil));
      state.pMin = lo; state.pMax = hi;
      rMin.value = lo; rMax.value = hi;
      syncSliderFill(); render();
    }
    rMin.addEventListener("input", fromRange);
    rMax.addEventListener("input", fromRange);
    nMin.addEventListener("change", fromNumber);
    nMax.addEventListener("change", fromNumber);
  }

  // ---- filter + sort ----
  function filtered() {
    return P().filter(p => {
      if (state.category.size && !state.category.has(p.category)) return false;
      if (state.tech.size && !state.tech.has(p.method)) return false;
      if (state.grape.size && !state.grape.has(p.grape)) return false;
      if (state.origin.size && !state.origin.has(tf(p.region))) return false;
      if (state.abv.size && !state.abv.has(p.abv)) return false;
      if (state.vintage.size && !state.vintage.has(p.vintage)) return false;
      const pr = salePrice(p);
      if (pr < state.pMin - 0.001 || pr > state.pMax + 0.001) return false;
      return true;
    });
  }
  function sorted(list) {
    const a = list.slice();
    switch (state.sort) {
      case "priceAsc": a.sort((x, y) => salePrice(x) - salePrice(y)); break;
      case "priceDesc": a.sort((x, y) => salePrice(y) - salePrice(x)); break;
      case "name": a.sort((x, y) => tf(x.name).localeCompare(tf(y.name))); break;
      default: a.sort((x, y) => y.vintage - x.vintage); break; // newest
    }
    return a;
  }

  // ---- card ----
  function cardHTML(p) {
    const onSale = !!p.sale;
    const priceHTML = onSale
      ? `<span class="was">${money(p.price)}</span><span>${money(salePrice(p))}</span>`
      : `<span>${p.price.toFixed(2)}</span> <span class="lari">${LARI}</span>`;
    const imgFile = p.id === "mukuzani" ? "bottle-trim.png" : "bottle.png";
    return `
      <article class="s2-card" data-id="${p.id}">
        <a class="s2-card__media" href="product.html#${p.id}">
          <img class="s2-card__photo" src="assets/Products/${p.id}/${imgFile}" alt="${tf(p.name)}" loading="lazy"
               onerror="this.onerror=null;this.outerHTML=window.AKH.bottleSVG('${p.color}', '#c9a24a')" />
          ${onSale ? `<span class="s2-badge">−${p.sale}%</span>` : ""}
        </a>
        <div class="s2-card__info">
          <h3 class="s2-card__name">${tf(p.name)}</h3>
          <span class="s2-card__year">${p.vintage}</span>
          <span class="s2-card__rule"></span>
          <div class="s2-card__icons">${ICON[p.method] || ""}</div>
          <em class="s2-card__style">${styleLabel(p)}</em>
          <span class="s2-card__producer">${PRODUCER}</span>
          <div class="s2-card__price">${priceHTML}</div>
          <div class="s2-card__buy">
            <button class="s2-buy" data-buy="${p.id}">Buy</button>
            <button class="s2-add" data-add="${p.id}">Add to Cart</button>
          </div>
        </div>
      </article>`;
  }

  function render() {
    const grid = $("#s2-grid");
    if (!grid) return;
    const items = sorted(filtered());
    grid.innerHTML = items.length
      ? items.map(cardHTML).join("")
      : `<div class="s2-empty">No wines match these filters.</div>`;

    // Only the product grid changes — the filter sidebar stays put. If a shorter
    // list left us scrolled past the shop area (into the footer below), pull the
    // viewport up to the shop's bottom so the sticky sidebar stays visible.
    // Never scrolls downward, so filtering near the top doesn't move at all.
    requestAnimationFrame(() => {
      const wrap = document.querySelector(".shop2__wrap");
      if (!wrap) return;
      const rect = wrap.getBoundingClientRect();
      const topAbs = rect.top + window.scrollY;
      const vh = window.innerHeight;
      // if the whole shop fits on screen, align its top under the nav;
      // otherwise just don't let the viewport fall past the shop's bottom.
      const maxY = rect.height <= vh - 120
        ? Math.max(0, Math.round(topAbs - 96))
        : Math.max(0, Math.round(topAbs + rect.height - vh));
      if (window.scrollY > maxY) window.scrollTo(0, maxY);
    });

    grid.querySelectorAll("[data-add]").forEach(btn => {
      btn.addEventListener("click", e => {
        e.preventDefault();
        if (window.CART) window.CART.add(btn.dataset.add, 1);
        btn.classList.add("added"); const txt = btn.textContent; btn.textContent = "Added";
        setTimeout(() => { btn.classList.remove("added"); btn.textContent = txt; }, 1300);
      });
    });
    grid.querySelectorAll("[data-buy]").forEach(btn => {
      btn.addEventListener("click", e => {
        e.preventDefault();
        if (window.CART) window.CART.add(btn.dataset.buy, 1);
        // open the cart drawer (bound to .cart-btn in cart.js)
        document.querySelector(".cart-btn")?.click();
      });
    });
  }

  function reset() {
    ["category", "tech", "grape", "origin", "abv", "vintage"].forEach(k => state[k].clear());
    state.pMin = pFloor; state.pMax = pCeil; state.sort = "newest";
    document.querySelectorAll("#s2-cat button").forEach(b => b.classList.remove("is-active"));
    document.querySelectorAll("#s2-groups input[type=checkbox]").forEach(cb => cb.checked = false);
    $("#s2-pmin").value = pFloor; $("#s2-pmax").value = pCeil;
    $("#s2-rmin").value = pFloor; $("#s2-rmax").value = pCeil;
    $("#s2-sort").value = "newest";
    syncSliderFill(); render();
  }

  function boot() {
    if (!$("#s2-grid")) return;
    buildSidebar();
    wireSlider();
    $("#s2-reset").addEventListener("click", reset);
    $("#s2-sort").addEventListener("change", e => { state.sort = e.target.value; render(); });
    wireFilterDrawer();
    render();
  }

  // ---- mobile filter drawer ----
  function wireFilterDrawer() {
    const aside = $("#s2-aside"), toggle = $("#s2-filter-toggle"),
          backdrop = $("#s2-filter-backdrop"), close = $("#s2-aside-close");
    if (!aside || !toggle) return;
    const open = () => { aside.classList.add("is-open"); if (backdrop) backdrop.classList.add("is-open"); document.body.style.overflow = "hidden"; };
    const shut = () => { aside.classList.remove("is-open"); if (backdrop) backdrop.classList.remove("is-open"); document.body.style.overflow = ""; };
    toggle.addEventListener("click", () => aside.classList.contains("is-open") ? shut() : open());
    if (backdrop) backdrop.addEventListener("click", shut);
    if (close) close.addEventListener("click", shut);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  document.addEventListener("langchange", () => { if ($("#s2-grid")) { buildSidebar(); wireSlider(); render(); } });
})();
