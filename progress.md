# Build Progress

## Done
- Design system (black & gold theme): `css/tokens.css`, `base.css`, `layout.css`, `components.css`
- Shared product data: `js/data/products.js` (28 placeholder products across rings/necklaces/bracelets/earrings), `js/data/business.js`
- Shared rendering, wishlist, quick-view, filter/sort, and search modules under `js/modules/`
- Pages: Home (`index.html`), Shop (`shop.html`, with category/material/price filters + sort + search), Product detail (`product.html`), Wishlist (`wishlist.html`), About (`about.html`), Contact (`contact.html`)
- Placeholder product imagery (styled gold gradient + category icon) since real Facebook photos could not be auto-fetched

## TODO before this goes live for real customers
- [ ] Replace `[PHONE_PLACEHOLDER]` with the real shop phone number (appears in `js/data/business.js`, `contact.html`, and every page's footer)
- [ ] Replace `[HOURS_PLACEHOLDER]` with real store hours (`contact.html`, `js/data/business.js`)
- [ ] Replace `[VIBER_PLACEHOLDER]` / `[WHATSAPP_PLACEHOLDER]` if you offer those, or remove those lines in `contact.html` if not
- [ ] Replace `[EMAIL_PLACEHOLDER]` in `js/data/business.js` if you want an email contact option
- [ ] Add real product photos — see `images/README-images.txt` for exact steps
- [ ] Review/replace placeholder product names, descriptions and prices in `js/data/products.js` with your real catalog and MMK prices
- [ ] Replace the About page placeholder story text in `about.html` with your real shop history if you'd like something more specific than the current general copy
- [ ] Deploy to GitHub Pages (see `README.md`)

## Notes
- Confirmed real info used: business name, Burmese name, and address (C7, Ujana Plaza, 1st Floor, near Central Bank, Yangon) — pulled from the Facebook page. Facebook blocks automated scraping of photos/phone/hours for non-logged-in requests, so those remain placeholders.
