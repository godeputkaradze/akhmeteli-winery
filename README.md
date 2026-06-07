# Akhmeteli Winery

Marketing + e-commerce website for Akhmeteli Winery — a family estate in Akhmeta, Kakheti, Georgia.

## Features

- **Multi-page** — home, shop, product detail, gallery, contact
- **3-language** — Georgian (default), English, Russian; selector persists in `localStorage`
- **Animated hero** — layered parallax cover with floating bottle
- **Scroll-driven vine line** — gold SVG path that draws progressively as you scroll
- **Reveal animations** — IntersectionObserver-driven, on every section
- **Shop** — left-sidebar filters (category, sweetness, method), sorting, 15 products
- **Cart** — slide-in drawer, persisted in `localStorage`, with delivery-fee logic
  - 15 GEL flat delivery, **free over 200 GEL**
- **Product pages** — full-screen with rotating bottle, grape decoration, related wines
- **Contact** — form + Google Maps embed of Akhmeta
- **No build step** — plain HTML/CSS/JS, deployable as-is

## File layout

```
akhmeteli-winery/
├── index.html          home
├── shop.html           shop with filters
├── product.html        single product (uses ?id=)
├── gallery.html        gallery
├── contact.html        contact + form + map
├── css/style.css       all styles
├── js/
│   ├── i18n.js         translation dictionaries + switcher
│   ├── products.js     all 15 products, multilingual
│   ├── main.js         nav, reveal, vine line, hero parallax, SVG factories
│   ├── cart.js         cart logic + drawer
│   ├── shop.js         shop filters/sort + home preview
│   └── product.js      single product render
└── README.md
```

## Run locally

```bash
# any static server works
python -m http.server 8000
# then open http://localhost:8000
```

Opening `index.html` directly with `file://` mostly works too, but Google Maps and some assets behave better through a server.

## Deploy to GitHub Pages

```bash
cd akhmeteli-winery
git init
git add .
git commit -m "Initial Akhmeteli Winery site"
git branch -M main
git remote add origin https://github.com/<your-user>/akhmeteli-winery.git
git push -u origin main
```

Then in GitHub: **Settings → Pages → Source: Deploy from branch → `main` / `/ (root)`** → Save.

Your site will be live at `https://<your-user>.github.io/akhmeteli-winery/`.

## Catalog

15 products from the 2023 harvest:

| Category | Wines |
|---|---|
| Red Dry | Saperavi, Mukuzani |
| Red Semi-Dry | Pirosmani |
| Red Semi-Sweet | Kindzmarauli, Alazani Valley |
| White Dry | Tsinandali |
| Amber Dry (Qvevri) | Kisi, Tibaani, Gurjaani, Rkatsiteli, Tsarapi, Kakhuri Mtsvane |
| Chacha | Classic, Gold (Mango), Silver (Grapefruit) |

## Customization

- **Prices** — edit `price` field in [js/products.js](js/products.js)
- **Delivery rules** — `DELIVERY_FEE` and `FREE_THRESHOLD` constants in [js/cart.js](js/cart.js)
- **Translations** — UI strings in [js/i18n.js](js/i18n.js); product copy is per-product in `products.js`
- **Hero image** — `.hero-bg` background in [css/style.css](css/style.css)
- **Bottle visuals** — `window.AKH.bottleSVG()` in [js/main.js](js/main.js); each product gets tinted by its `color` field
