# Chan Lone Gold & Jewelery — Website

Static HTML/CSS/JS site. No build step, no framework, no backend — must work by
double-clicking `index.html` and identically once hosted on GitHub Pages.

## Conventions
- Every page duplicates the same header/footer markup (no templating available
  without a build step or server). When changing the header/footer/nav, update
  it in all HTML files: index, shop, product, wishlist, about, contact.
- All product data lives in one place: `js/data/products.js` (`PRODUCTS`,
  `CATEGORIES`, `MATERIALS`). Never hand-write product HTML — always render
  from this data via `js/modules/render.js`.
- Scripts are plain (non-module) and attach to `window` globals
  (`ChanLoneUtils`, `ChanLoneRender`, `ChanLoneWishlist`, etc.) because ES
  modules and `fetch()` are unreliable over `file://`. Keep new modules
  consistent with this pattern and load them in the same fixed `<script>`
  order used on existing pages (data -> utils -> render -> wishlist ->
  quickview -> [page-specific modules] -> partials -> page controller).
- Wishlist state lives in `localStorage` under `chanlone_wishlist`, managed
  only through `js/modules/wishlist.js`.
- Placeholder product images use `.placeholder-media` (see
  `css/components.css` and `render.js`) instead of broken `<img>` tags.
  Real photos go in `images/products/` — see `images/README-images.txt`.
- Business is inquiry-based, not e-commerce: there is no cart/checkout.
  Product CTAs link to Messenger (`m.me/chanlonjewelry`) or phone.

## Real vs. placeholder content
Only the business name, Burmese name, and address are confirmed real (from
the Facebook page). Phone, hours, product catalog/prices/photos are
placeholders — see `progress.md` for the full swap-in checklist.

## Hosting
Static site deployed via GitHub Pages (free). See `README.md` for deploy
steps. No build/CI step required — Pages serves the repo files directly.
