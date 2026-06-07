// Heavy lifting: smooth scroll, scroll-driven animations, cursor, magnetic, split text.
// Loaded after gsap, ScrollTrigger, and Lenis from CDN.

(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGSAP = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

  // ---------- Lenis smooth scroll ----------
  // Tuned to the lenis.dev feel: lerp-based momentum (continuous trailing),
  // a touch of wheel weight, and smooth in-page anchor navigation.
  let lenis = null;
  function initSmoothScroll() {
    if (reduceMotion || typeof Lenis === "undefined") return;
    lenis = new Lenis({
      lerp: 0.1,               // trailing momentum — the "buttery" lenis.dev character
      wheelMultiplier: 0.9,    // slightly weighted, less twitchy
      smoothWheel: true,
      syncTouch: true          // smoother momentum on trackpads / touch
    });
    if (hasGSAP) {
      // Drive Lenis from GSAP's ticker so ScrollTrigger stays perfectly in sync.
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
      requestAnimationFrame(raf);
    }
    initAnchorScroll();
  }

  // ---------- Smooth in-page anchor navigation (lenis.dev-style) ----------
  function initAnchorScroll() {
    document.querySelectorAll('a[href*="#"]').forEach(link => {
      const url = link.getAttribute("href");
      const hash = url.slice(url.indexOf("#"));
      if (hash.length < 2) return;
      // Only hijack links that point to a target on THIS page.
      const samePage = url.startsWith("#") ||
        url.split("#")[0] === "" ||
        url.split("#")[0] === location.pathname.split("/").pop();
      if (!samePage) return;
      const target = document.querySelector(hash);
      if (!target) return;
      link.addEventListener("click", e => {
        e.preventDefault();
        if (lenis) lenis.scrollTo(target, { offset: -80, duration: 1.4 });
        else target.scrollIntoView({ behavior: "smooth" });
      });
    });
  }

  // ---------- Custom cursor ----------
  function initCursor() {
    if (reduceMotion) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const dot = document.createElement("div");
    const ring = document.createElement("div");
    dot.className = "cursor-dot";
    ring.className = "cursor-ring";
    document.body.appendChild(dot);
    document.body.appendChild(ring);
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;
    window.addEventListener("mousemove", e => { mx = e.clientX; my = e.clientY; });
    function tick() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      requestAnimationFrame(tick);
    }
    tick();
    document.addEventListener("mouseenter", e => {
      const t = e.target;
      if (t.nodeType !== 1) return;
      if (t.matches("a, button, .magnetic, .p-card, [data-cursor='hover']")) {
        ring.classList.add("hover");
      }
    }, true);
    document.addEventListener("mouseleave", e => {
      const t = e.target;
      if (t.nodeType !== 1) return;
      if (t.matches("a, button, .magnetic, .p-card, [data-cursor='hover']")) {
        ring.classList.remove("hover");
      }
    }, true);
  }

  // ---------- Magnetic ----------
  function initMagnetic() {
    if (reduceMotion) return;
    document.querySelectorAll(".magnetic").forEach(el => {
      const strength = parseFloat(el.dataset.magnetic) || 0.35;
      el.addEventListener("mousemove", e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * strength;
        const y = (e.clientY - r.top - r.height / 2) * strength;
        el.style.transform = `translate(${x}px, ${y}px)`;
      });
      el.addEventListener("mouseleave", () => { el.style.transform = ""; });
    });
  }

  // ---------- Split text into chars (word-aware so wrapping still works) ----------
  function splitTextChars(el) {
    if (el.dataset.split === "done") return [];
    const text = el.textContent.trim();
    const words = text.split(" ");
    el.innerHTML = words.map(w => {
      const chars = [...w].map(c => `<span class="char">${c}</span>`).join("");
      return `<span class="word">${chars}</span>`;
    }).join(' <span class="word-space">&nbsp;</span> ');
    el.dataset.split = "done";
    return el.querySelectorAll(".char");
  }

  // ---------- Hero: split-stagger text + scroll-pinned bottle ----------
  function initHero() {
    if (!hasGSAP) return;
    const titleEl = document.querySelector(".hero-title");
    const subEl   = document.querySelector(".hero-sub");
    const eyebrow = document.querySelector(".hero-eyebrow");
    const cta     = document.querySelector(".hero-cta-row");
    const meta    = document.querySelector(".hero-meta");
    const bottle  = document.querySelector(".hero-bottle-pin");

    if (titleEl) {
      const chars = splitTextChars(titleEl);
      gsap.from(chars, {
        yPercent: 110,
        opacity: 0,
        rotateZ: 6,
        stagger: 0.025,
        duration: 1,
        delay: 0.2,
        ease: "power3.out"
      });
    }
    if (eyebrow) gsap.from(eyebrow, { y: 20, opacity: 0, duration: 1, delay: 0.1, ease: "power2.out" });
    if (subEl)   gsap.from(subEl,   { y: 20, opacity: 0, duration: 1, delay: 0.9, ease: "power2.out" });
    if (cta)     gsap.from(cta,     { y: 20, opacity: 0, duration: 1, delay: 1.0, ease: "power2.out" });
    if (meta)    gsap.from(meta,    { y: 20, opacity: 0, duration: 1, delay: 1.1, ease: "power2.out" });

    if (bottle) {
      gsap.from(bottle, { y: 80, opacity: 0, duration: 1.4, delay: 0.4, ease: "power3.out" });
      // Scroll-pinned bottle: rotates and scales with scroll
      gsap.to(bottle, {
        rotateY: 720,
        y: -80,
        scale: 0.8,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: 0.6
        }
      });
    }
  }

  // ---------- Reveal: any [data-anim] ----------
  function initReveals() {
    if (!hasGSAP) {
      document.querySelectorAll(".reveal,.reveal-x,.reveal-scale").forEach(el => el.classList.add("visible"));
      return;
    }

    // Headings: split + stagger reveal on enter
    document.querySelectorAll("[data-split-reveal]").forEach(el => {
      const chars = splitTextChars(el);
      gsap.from(chars, {
        yPercent: 110,
        opacity: 0,
        stagger: 0.02,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 85%" }
      });
    });

    // Generic .reveal classes — animate up
    document.querySelectorAll(".reveal").forEach(el => {
      gsap.from(el, {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%" }
      });
    });
    document.querySelectorAll(".reveal-x").forEach(el => {
      gsap.from(el, {
        x: -60,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 85%" }
      });
    });
    document.querySelectorAll(".reveal-scale").forEach(el => {
      gsap.from(el, {
        scale: 0.92,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 90%" }
      });
    });

    // Image clip-path reveals
    document.querySelectorAll(".clip-reveal").forEach(el => {
      gsap.from(el, {
        clipPath: "inset(50% 0 50% 0)",
        duration: 1.4,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 85%" }
      });
    });
  }

  // ---------- Counters ----------
  function initCounters() {
    document.querySelectorAll("[data-count]").forEach(el => {
      const target = parseFloat(el.dataset.count);
      const dur = parseFloat(el.dataset.countDuration) || 2;
      const proxy = { v: 0 };
      el.textContent = "0";
      if (!hasGSAP) { el.textContent = String(target); return; }
      gsap.to(proxy, {
        v: target,
        duration: dur,
        ease: "power2.out",
        onUpdate: () => {
          el.textContent = Math.round(proxy.v).toLocaleString();
        },
        scrollTrigger: { trigger: el, start: "top 85%", once: true }
      });
    });
  }

  // ---------- Horizontal product showcase ----------
  function initHorizontal() {
    if (!hasGSAP) return;
    const sec = document.querySelector(".horizontal-showcase");
    const track = document.querySelector(".horizontal-track");
    if (!sec || !track) return;

    function build() {
      const distance = track.scrollWidth - window.innerWidth;
      if (distance <= 0) return;
      const tween = gsap.to(track, {
        x: -distance,
        ease: "none",
        scrollTrigger: {
          trigger: sec,
          pin: true,
          scrub: 0.7,
          start: "top top",
          end: () => "+=" + distance,
          invalidateOnRefresh: true
        }
      });
      return tween;
    }

    // Wait for cards to render (shop.js renders horizontal cards too)
    function tryBuild(retries) {
      if (track.children.length > 0) build();
      else if (retries > 0) setTimeout(() => tryBuild(retries - 1), 100);
    }
    tryBuild(20);

    document.addEventListener("rerender", () => {
      ScrollTrigger.refresh();
    });
  }

  // ---------- Marquee — duplicate content for seamless loop ----------
  function initMarquee() {
    document.querySelectorAll(".marquee-track").forEach(track => {
      if (track.dataset.cloned) return;
      const html = track.innerHTML;
      track.innerHTML = html + html;
      track.dataset.cloned = "1";
    });
  }

  // ---------- Section pin labels ----------
  function initStickyLabels() {
    if (!hasGSAP) return;
    document.querySelectorAll(".section-num").forEach(el => {
      gsap.from(el, {
        y: 30, opacity: 0, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 90%" }
      });
    });
  }

  // ---------- Background color shift per section ----------
  function initBgShift() {
    if (!hasGSAP) return;
    document.querySelectorAll("[data-bg]").forEach(sec => {
      const color = sec.dataset.bg;
      ScrollTrigger.create({
        trigger: sec,
        start: "top 60%",
        end: "bottom 40%",
        onEnter:    () => document.documentElement.style.setProperty("--page-bg", color),
        onEnterBack:() => document.documentElement.style.setProperty("--page-bg", color)
      });
    });
  }

  // ---------- Boot ----------
  document.addEventListener("DOMContentLoaded", () => {
    initSmoothScroll();
    initCursor();
    initMagnetic();
    initHero();
    initReveals();
    initCounters();
    initMarquee();
    initStickyLabels();
    initBgShift();
    // horizontal showcase needs products rendered first
    setTimeout(initHorizontal, 50);
  });

  // Expose Lenis so other modules can use its scrollTo
  window.AKH = window.AKH || {};
  window.AKH.lenis = () => lenis;
})();
