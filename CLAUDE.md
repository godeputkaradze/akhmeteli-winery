# Akhmeteli Winery — project & animation guide

Static, trilingual (KA/EN/RU) Georgian wine site. Plain HTML + CSS + vanilla JS, no
build step. Dev server runs on **localhost:3456** (see `.claude/launch.json`). Pages:
`index.html`, `shop.html`, `product.html`, `gallery.html`, `contact.html`, `bottles-3d.html`.

## Motion stack (already in place — reuse it, don't reinvent)

The site is a motion-graphics site. The animation engine lives in
[js/animations.js](js/animations.js) and is built on:

- **GSAP 3.12.5** + **ScrollTrigger** (CDN) — all scroll-driven and timeline motion
- **Lenis 1.1.13** (CDN) — smooth/inertia scroll, driven from GSAP's ticker so
  ScrollTrigger stays in sync (`lerp: 0.1`, `wheelMultiplier: 0.9`)
- **Three.js** — interactive 3D bottle viewer in `js/bottle3d.js` + `bottles-3d.html`

Script load order matters: app scripts → GSAP → ScrollTrigger → Lenis →
`animations.js` → `winestory.js`. Add new CDN libs before `animations.js`.

## How to add motion — use the declarative hooks

`animations.js` wires animations from **HTML attributes/classes** on `DOMContentLoaded`.
To animate something new, prefer adding a hook to the markup over writing fresh JS:

| Hook | Effect |
|------|--------|
| `data-split-reveal` | Heading splits into chars, stagger-fades up on scroll-in |
| `class="reveal"` | Fades up (`y:50`) on scroll-in |
| `class="reveal-x"` | Slides in from left on scroll-in |
| `class="reveal-scale"` | Scales up from 0.92 on scroll-in |
| `class="clip-reveal"` | Image `clip-path` inset reveal |
| `data-count="1200"` | Number counts 0→target when it enters view (`data-count-duration` optional) |
| `class="magnetic"` | Button follows cursor (`data-magnetic="0.35"` sets strength) |
| `data-bg="#hexcolor"` | Shifts `--page-bg` while section is in view |
| `class="marquee-track"` | Content auto-duplicated for seamless infinite scroll |
| `class="section-num"` | Stagger-reveals section number labels |
| `.horizontal-showcase` + `.horizontal-track` | Pinned horizontal scroll gallery |

Anchor links (`a[href*="#"]`) on the same page are auto-hijacked for smooth Lenis
scroll. A custom cursor (`.cursor-dot` / `.cursor-ring`) is injected on fine-pointer
devices and reacts to `a, button, .magnetic, .p-card, [data-cursor="hover"]`.

## Conventions (match these)

- **Default ease: `power3.out`.** Hero/heading reveals ~0.9–1s, stagger 0.02–0.025.
- **60fps only:** animate `transform` / `opacity` / `clip-path`. Never animate
  `top/left/width/height`.
- **Accessibility is non-negotiable.** Every motion path checks
  `prefers-reduced-motion` (the `reduceMotion` flag at the top of `animations.js`) and
  CSS has reduced-motion blocks (`css/style.css`). When reduced motion is on: no Lenis,
  no cursor, no magnetic, and `.reveal*` elements get `.visible` immediately. Any new
  effect MUST have a static fallback on the same code path.
- **No-GSAP fallback:** code guards on `hasGSAP`; if GSAP fails to load, content must
  still be visible (reveals add `.visible`, counters jump to final value).
- **ScrollTrigger after dynamic content:** when JS injects cards (e.g. `shop.js`),
  dispatch/`rerender` or call `ScrollTrigger.refresh()` so triggers recalc. The
  horizontal showcase already retries until cards render.

## Verifying motion changes

This is a static site — to see animation working, ask me to **run it on :3456,
screenshot, and check the browser console**, then iterate against the rendered result.
Reduced-motion behaviour should be tested by toggling the OS setting / emulation.
