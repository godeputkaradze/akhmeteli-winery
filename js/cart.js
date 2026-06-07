// localStorage cart with delivery-fee logic.

(function () {
  const KEY = "akhmeteli.cart";
  const DELIVERY_FEE = 5;             // USD
  const FREE_THRESHOLD = 50;          // USD — free above this

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch { return []; }
  }
  function write(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
    document.dispatchEvent(new CustomEvent("cartchange"));
  }

  function add(productId, qty) {
    qty = qty || 1;
    const items = read();
    const existing = items.find(i => i.id === productId);
    if (existing) existing.qty += qty;
    else items.push({ id: productId, qty });
    write(items);
  }
  function remove(productId) {
    write(read().filter(i => i.id !== productId));
  }
  function setQty(productId, qty) {
    const items = read();
    const it = items.find(i => i.id === productId);
    if (!it) return;
    it.qty = Math.max(1, qty);
    write(items);
  }
  function increment(productId) {
    const items = read();
    const it = items.find(i => i.id === productId);
    if (it) { it.qty += 1; write(items); }
  }
  function decrement(productId) {
    const items = read();
    const it = items.find(i => i.id === productId);
    if (!it) return;
    if (it.qty <= 1) {
      write(items.filter(i => i.id !== productId));
    } else {
      it.qty -= 1;
      write(items);
    }
  }
  function clear() { write([]); }
  function count() {
    return read().reduce((n, i) => n + i.qty, 0);
  }
  function subtotal() {
    return read().reduce((s, i) => {
      const p = window.PRODUCTS.find(p => p.id === i.id);
      return s + (p ? p.price * i.qty : 0);
    }, 0);
  }
  function delivery() {
    const sub = subtotal();
    if (sub === 0) return 0;
    if (sub >= FREE_THRESHOLD) return 0;
    return DELIVERY_FEE;
  }
  function total() { return subtotal() + delivery(); }
  function items() { return read(); }

  window.CART = {
    add, remove, setQty, increment, decrement, clear,
    count, subtotal, delivery, total, items,
    DELIVERY_FEE, FREE_THRESHOLD
  };

  // ------ UI: drawer + count badge ------
  function renderBadge() {
    document.querySelectorAll(".cart-count").forEach(el => {
      const n = count();
      el.textContent = n > 0 ? String(n) : "";
    });
  }

  function fmt(n) { return `$${n.toFixed(2)}`; }

  function renderDrawer() {
    const body = document.querySelector(".cart-body");
    const foot = document.querySelector(".cart-foot");
    if (!body || !foot) return;
    const its = read();
    if (!its.length) {
      body.innerHTML = `<div class="cart-empty" data-i18n="cart.empty">${window.I18N.t("cart.empty")}</div>`;
      foot.style.display = "none";
      return;
    }
    foot.style.display = "block";

    body.innerHTML = its.map(i => {
      const p = window.PRODUCTS.find(p => p.id === i.id);
      if (!p) return "";
      const name = window.I18N.tField(p.name);
      const style = window.I18N.tField(p.style);
      return `
        <div class="cart-item" data-id="${p.id}">
          <div class="cart-item-thumb">${window.AKH.bottleSVG(p.color, "#c9a24a")}</div>
          <div>
            <h4 class="cart-item-name">${name}</h4>
            <p class="cart-item-meta">${style} · ${p.volume} ml</p>
            <div class="cart-item-qty">
              <button data-act="dec" aria-label="−">−</button>
              <span>${i.qty}</span>
              <button data-act="inc" aria-label="+">+</button>
            </div>
          </div>
          <div>
            <div class="cart-item-price">${fmt(p.price * i.qty)}</div>
            <button class="cart-item-remove" data-act="rm">${window.I18N.t("cart.remove")}</button>
          </div>
        </div>`;
    }).join("");

    const sub = subtotal();
    const ship = delivery();
    foot.innerHTML = `
      <div class="cart-line"><span>${window.I18N.t("cart.subtotal")}</span><span>${fmt(sub)}</span></div>
      <div class="cart-line">
        <span>${window.I18N.t("cart.delivery")}</span>
        <span>${ship === 0 ? window.I18N.t("cart.delivery.free") : fmt(ship)}</span>
      </div>
      <p class="cart-note">${window.I18N.t("cart.delivery.note")}</p>
      <div class="cart-line total"><span>${window.I18N.t("cart.total")}</span><strong>${fmt(total())}</strong></div>
      <button class="btn cart-checkout">${window.I18N.t("cart.checkout")}</button>
    `;
  }

  function openDrawer() {
    document.querySelector(".cart-drawer")?.classList.add("open");
    document.querySelector(".cart-overlay")?.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeDrawer() {
    document.querySelector(".cart-drawer")?.classList.remove("open");
    document.querySelector(".cart-overlay")?.classList.remove("open");
    document.body.style.overflow = "";
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderBadge();
    renderDrawer();

    document.querySelectorAll(".cart-btn").forEach(b => b.addEventListener("click", openDrawer));
    document.querySelector(".cart-close")?.addEventListener("click", closeDrawer);
    document.querySelector(".cart-overlay")?.addEventListener("click", closeDrawer);

    // delegate item actions
    document.querySelector(".cart-body")?.addEventListener("click", e => {
      const btn = e.target.closest("[data-act]");
      if (!btn) return;
      const id = btn.closest(".cart-item")?.dataset.id;
      if (!id) return;
      const act = btn.dataset.act;
      if (act === "inc") increment(id);
      else if (act === "dec") decrement(id);
      else if (act === "rm") remove(id);
    });

    // checkout (placeholder)
    document.querySelector(".cart-foot")?.addEventListener("click", e => {
      if (e.target.classList.contains("cart-checkout")) {
        const lang = window.I18N.getLang();
        const msg = lang === "ka"
          ? "შეკვეთა მიღებულია — მენეჯერი მალე დაგიკავშირდებათ."
          : lang === "ru"
          ? "Заказ принят — менеджер скоро с вами свяжется."
          : "Order received — a manager will contact you shortly.";
        alert(msg);
        clear();
        closeDrawer();
      }
    });
  });

  document.addEventListener("cartchange", () => {
    renderBadge();
    renderDrawer();
  });

  document.addEventListener("rerender", renderDrawer);
})();
