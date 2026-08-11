// Shared utilities: SVG bottle factory, nav, reveal, vine line, language switcher.

window.AKH = window.AKH || {};

// --------- Award badges (IWSC / Gold / Silver / Bronze, optional uploaded picture) ---------
// awards: [{ tier:"iwsc"|"gold"|"silver"|"bronze", title:"...", image:"assets/medals/x.png" }]
window.AKH.TIER_LABEL = { iwsc: "IWSC", gold: "Gold", silver: "Silver", bronze: "Bronze" };
window.AKH.awardBadge = function (a) {
  if (!a) return "";
  // Back-compat: a plain string award still renders as a neutral chip.
  if (typeof a === "string") return `<span class="award-badge award-badge--iwsc"><span class="award-badge__text">${a}</span></span>`;
  const tier = (a.tier || "iwsc").toLowerCase();
  const raw = a.title || window.AKH.TIER_LABEL[tier] || "";
  // Award titles are stored as English strings; translate the tier word in them.
  const title = window.I18N && window.I18N.awardTitle ? window.I18N.awardTitle(raw) : raw;
  if (a.image) {
    return `<span class="award-badge award-badge--img" title="${title.replace(/"/g, "&quot;")}">
      <img src="${a.image}" alt="${title.replace(/"/g, "&quot;")}" loading="lazy" />
    </span>`;
  }
  return `<span class="award-badge award-badge--${tier}">
    <span class="award-badge__medal" aria-hidden="true"></span>
    <span class="award-badge__text">${title}</span>
  </span>`;
};
window.AKH.awardBadges = function (awards) {
  if (!Array.isArray(awards) || !awards.length) return "";
  return `<div class="award-badges">${awards.map(window.AKH.awardBadge).join("")}</div>`;
};

// --------- Product bottle photo ---------
// One source of truth for the packshot path (shop cards, cart thumbs, …).
window.AKH.productPhoto = function (p) {
  if (!p) return "";
  return "assets/Products/" + p.id + "/" + (p.id === "mukuzani" ? "bottle-trim.png" : "bottle.png");
};

// --------- Bottle SVG (re-tinted per product color) ---------
window.AKH.bottleSVG = function (color, accent) {
  color = color || "#6b1a2c";
  accent = accent || "#c9a24a";
  return `
    <svg viewBox="0 0 120 360" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="bg-${color.replace("#","")}" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stop-color="${color}" stop-opacity="0.55"/>
          <stop offset="0.5" stop-color="${color}"/>
          <stop offset="1" stop-color="${color}" stop-opacity="0.55"/>
        </linearGradient>
        <linearGradient id="cap-${color.replace("#","")}" x1="0" x2="1">
          <stop offset="0" stop-color="#1a1410"/>
          <stop offset="0.5" stop-color="#2a1f18"/>
          <stop offset="1" stop-color="#1a1410"/>
        </linearGradient>
      </defs>
      <!-- cap -->
      <rect x="44" y="6" width="32" height="36" rx="2" fill="url(#cap-${color.replace("#","")})"/>
      <rect x="44" y="38" width="32" height="6" fill="${accent}" opacity="0.7"/>
      <!-- neck -->
      <path d="M48 44 L48 90 Q48 100 42 110 L42 150 L78 150 L78 110 Q72 100 72 90 L72 44 Z" fill="url(#bg-${color.replace("#","")})"/>
      <!-- body -->
      <path d="M22 150 Q22 160 30 170 L30 340 Q30 352 42 352 L78 352 Q90 352 90 340 L90 170 Q98 160 98 150 Z" fill="url(#bg-${color.replace("#","")})"/>
      <!-- shoulder highlight -->
      <path d="M30 152 Q30 162 36 170 L36 200" stroke="rgba(255,255,255,0.25)" stroke-width="1.5" fill="none"/>
      <!-- label -->
      <rect x="34" y="200" width="52" height="110" rx="2" fill="${accent}" opacity="0.95"/>
      <rect x="34" y="200" width="52" height="14" fill="rgba(0,0,0,0.18)"/>
      <text x="60" y="245" text-anchor="middle" font-family="Georgia, serif" font-size="9" fill="#1a1410" letter-spacing="2">AKHMETELI</text>
      <text x="60" y="265" text-anchor="middle" font-family="Georgia, serif" font-size="6" fill="#1a1410" letter-spacing="3">ESTATE</text>
      <line x1="40" y1="275" x2="80" y2="275" stroke="#1a1410" stroke-width="0.5"/>
      <text x="60" y="298" text-anchor="middle" font-family="Georgia, serif" font-size="6" fill="#1a1410" letter-spacing="2">KAKHETI</text>
      <!-- bottle highlight -->
      <ellipse cx="40" cy="240" rx="3" ry="40" fill="rgba(255,255,255,0.15)"/>
    </svg>
  `;
};

// --------- Grape cluster SVG (decorative) ---------
window.AKH.grapesSVG = function (color) {
  color = color || "#6b1a2c";
  let circles = "";
  const positions = [
    [60,30],[40,50],[80,50],[30,80],[60,75],[90,80],[45,110],[75,110],[60,135]
  ];
  positions.forEach(([cx,cy]) => {
    circles += `<circle cx="${cx}" cy="${cy}" r="14" fill="${color}" opacity="0.85"/>
                <circle cx="${cx-3}" cy="${cy-3}" r="4" fill="rgba(255,255,255,0.25)"/>`;
  });
  return `
    <svg viewBox="0 0 120 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M60 5 Q50 15 55 25 Q40 18 30 28 Q42 30 48 38" stroke="${color}" stroke-width="2" fill="none"/>
      <path d="M62 5 Q70 12 70 22" stroke="#3a4a2a" stroke-width="2" fill="none"/>
      <ellipse cx="78" cy="20" rx="14" ry="9" fill="#3a4a2a" transform="rotate(20 78 20)"/>
      ${circles}
    </svg>
  `;
};

// --------- Navigation: scrolled state + mobile toggle ---------
function initNav() {
  const nav = document.querySelector(".nav");
  if (!nav) return;
  const onScroll = () => {
    if (window.scrollY > 40) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const toggle = nav.querySelector(".menu-toggle");
  const links = nav.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => links.classList.toggle("open"));
  }

  // mark active link by pathname
  const path = location.pathname.split("/").pop() || "index.html";
  nav.querySelectorAll(".nav-links a").forEach(a => {
    const href = a.getAttribute("href");
    if (href === path || (path === "" && href === "index.html") || (path === "index.html" && href === "index.html")) {
      a.classList.add("active");
    }
  });
}

// --------- Language switcher ---------
function initLangSwitch() {
  const wrap = document.querySelector(".lang-switch");
  if (!wrap) return;
  const buttons = wrap.querySelectorAll("button");
  const setActive = () => {
    const cur = window.I18N.getLang();
    buttons.forEach(b => b.classList.toggle("active", b.dataset.lang === cur));
  };
  buttons.forEach(b => {
    b.addEventListener("click", () => {
      window.I18N.setLang(b.dataset.lang);
      setActive();
    });
  });
  setActive();
}

// --------- Scroll reveal ---------
function initReveal() {
  const items = document.querySelectorAll(".reveal, .reveal-x, .reveal-scale");
  if (!items.length || !("IntersectionObserver" in window)) {
    items.forEach(i => i.classList.add("visible"));
    return;
  }
  const obs = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add("visible");
        obs.unobserve(en.target);
      }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
  items.forEach(i => obs.observe(i));
}

// --------- Vine line — drawn progressively as user scrolls ---------
function initVineLine() {
  const path = document.querySelector(".vine-path");
  if (!path) return;
  const len = path.getTotalLength();
  path.style.strokeDasharray = len;
  path.style.strokeDashoffset = len;
  const update = () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const p = h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0;
    path.style.strokeDashoffset = String(len * (1 - p));
  };
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
}

// --------- Hero parallax ---------
function initHeroParallax() {
  const layers = document.querySelectorAll(".hero [data-parallax]");
  if (!layers.length) return;
  const onScroll = () => {
    const y = window.scrollY;
    layers.forEach(l => {
      const k = parseFloat(l.dataset.parallax) || 0.2;
      l.style.transform = `translate3d(0, ${y * k}px, 0)`;
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

// --------- Inject hero bottle ---------
function initHeroBottle() {
  const old = document.querySelector(".hero-bottle-stage .bottle");
  if (old) old.innerHTML = window.AKH.bottleSVG("#9d1f3a", "#d9b15c");
  const pin = document.getElementById("hero-bottle");
  if (pin) pin.innerHTML = '<div class="bottle-float">' + window.AKH.bottleSVG("#9d1f3a", "#d9b15c") + '</div>';
}

// --------- Listen for language change → re-render dynamic content ---------
document.addEventListener("langchange", () => {
  document.dispatchEvent(new Event("rerender"));
});

// --------- Boot ---------
document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initLangSwitch();
  initReveal();
  initVineLine();
  initHeroParallax();
  initHeroBottle();
});
