# Website Plan — Chan Lone Gold & Jewelery

## Goal
A luxurious black-and-gold catalog website for Chan Lone Gold & Jewelery,
with browsing features inspired by Pandora (category filters/sort, wishlist,
quick-view, search), driving customers to contact the shop via Messenger/
phone rather than an online checkout (no cart, no payments).

## Stack
Plain HTML/CSS/JS, no build step, no framework — works locally via
`file://` and identically once hosted. Hosted for free on GitHub Pages.

## Structure
- `index.html`, `shop.html`, `product.html`, `wishlist.html`, `about.html`, `contact.html`
- `css/` — tokens (colors/fonts/spacing), base, layout, components
- `js/data/` — `products.js` (catalog), `business.js` (name/address/contact)
- `js/modules/` — `render.js`, `filterSort.js`, `search.js`, `wishlist.js`, `quickview.js`, `utils.js`
- `js/partials.js` + per-page controllers (`home.js`, `shop.js`, `product.js`, `wishlist-page.js`)
- `images/placeholders/icons/` — category line icons used until real photos are added
- `images/products/` — where real product photos go later

## Status
See `progress.md` for what's built and the remaining placeholder-content
checklist (phone, hours, real photos, real prices).

## Deploy
See `README.md` for GitHub Pages deployment steps.
