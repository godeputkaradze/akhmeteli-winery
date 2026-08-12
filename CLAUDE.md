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
scroll. There is **no custom cursor** — the site uses the normal OS pointer. The
`data-cursor="hover"` attributes left in `site.js` / `winestory.js` are inert.

## Conventions (match these)

- **Default ease: `power3.out`.** Hero/heading reveals ~0.9–1s, stagger 0.02–0.025.
- **60fps only:** animate `transform` / `opacity` / `clip-path`. Never animate
  `top/left/width/height`.
- **Accessibility is non-negotiable.** Every motion path checks
  `prefers-reduced-motion` (the `reduceMotion` flag at the top of `animations.js`) and
  CSS has reduced-motion blocks (`css/style.css`). When reduced motion is on: no Lenis,
  no magnetic, and `.reveal*` elements get `.visible` immediately. Any new
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

## Shop admin panel — `/admin/` (PHP, cPanel only)

`admin/index.php` (login + shell) · `admin/api.php` (JSON API) · `admin/lib.php`
(auth, throttle, catalogue I/O) · `admin/config.php` (credentials) ·
`admin/assets/panel.{css,js}` (UI). **PHP does not run on Vercel** — there `/admin`
still rewrites to the older token-based `admin.html`, which is kept, not deleted.

- **One account, no registration:** `admin_aleko`. The password is stored only as a
  PBKDF2-SHA256 digest (210k iterations) in `config.php`; changing it from the panel
  writes a new digest to `<private>/data/auth.json`, which then wins.
- **Private storage** is `dirname(docroot)/akhmeteli-admin` (on cPanel:
  `/home/<user>/akhmeteli-admin`) so throttle counters, the password override and
  the backups are unreachable by URL. If that parent is read-only it falls back to
  `admin/data` + `admin/backups`, both denied by their own `.htaccess`.
- **It edits `js/products.js` directly** — the same `window.PRODUCTS` file the shop
  reads — after copying the current version into `<private>/backups/` (last 40 kept,
  restorable from More ▾ → Backups). Saves are validated server-side (enums, unique
  ids, hex colour, award image paths must sit inside `assets/`) and written atomically.
- **Images** go to `assets/Products/<id>/{bottle,background,grape,information}.png`,
  mirroring `window.AKH.productPhoto()` including the `mukuzani` → `bottle-trim.png`
  exception; medals go to `assets/medals/`. Non-PNG uploads are converted with GD.
- **Local testing needs PHP** (not installed on this machine): download a portable
  build and run `php -S 127.0.0.1:8899 -t .`, then open `/admin/`. The static
  `serve` on :3456 cannot execute the panel.
- **⚠ Divergence:** once the owner edits on the server, `js/products.js` there is
  newer than the repo. Pull it back with More ▾ → **Download products.js** before
  running `node deploy.js upload`, or the upload overwrites his changes.
