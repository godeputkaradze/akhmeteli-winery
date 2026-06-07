// Product showcase — composites assets/Products/<id>/ layers and runs the entrance motion.
(function () {
  const VALID = new Set([
    "saperavi", "mukuzani", "kindzmarauli", "alazani-valley", "pirosmani",
    "kisi", "tsinandali", "tibaani", "gurjaani", "rkatsiteli", "tsarapi",
    "kakhuri-mtsvane", "chacha-classic", "chacha-gold", "chacha-silver"
  ]);

  const q = (s) => document.querySelector(s);
  const sec = q(".pshow");
  if (!sec) return;

  // id from hash (#mukuzani) — survives static-host redirects — with ?id= fallback
  const fromHash = decodeURIComponent((location.hash || "").replace(/^#/, "")).trim();
  const fromQuery = new URLSearchParams(location.search).get("id");
  const requested = VALID.has(fromHash) ? fromHash : fromQuery;
  const id = VALID.has(requested) ? requested : "saperavi";
  const base = "assets/Products/" + id + "/";

  q(".pshow__overlay").style.backgroundImage = 'url("' + base + 'background.png")';
  q(".pshow__bottle img").src = base + "bottle.png";
  q(".pshow__info img").src = base + "information.png";

  // price + cart + title from product data
  const p = (window.PRODUCTS || []).find((x) => x.id === id);

  // grapes only for wines — chacha (spirit) has no grapes, just hide that layer
  const isSpirit = id.indexOf("chacha") === 0 || (p && p.category === "spirit");
  const grapeWrap = q(".pshow__grape");
  if (isSpirit) {
    if (grapeWrap) grapeWrap.style.display = "none";
    sec.classList.add("is-spirit");
  } else {
    q(".pshow__grape img").src = base + "grape.png";
  }
  if (p) {
    const price = q(".pshow__price");
    if (price) price.textContent = p.price.toFixed(2) + " ₾";
    const name = (window.I18N && window.I18N.tField) ? window.I18N.tField(p.name) : null;
    if (name) document.title = name + " — Akhmeteli Winery";
  }
  const add = q(".pshow__add");
  if (add) add.addEventListener("click", () => { if (window.CART) window.CART.add(id, 1); });

  // entrance motion (arm hidden state, then play). No-JS keeps everything visible.
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  sec.classList.add("anim");
  const els = sec.querySelectorAll(".anim-el");
  if (reduce) { els.forEach((e) => e.classList.add("in")); return; }
  requestAnimationFrame(() => requestAnimationFrame(() => {
    els.forEach((e) => e.classList.add("in"));
  }));
})();
