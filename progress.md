# Build Progress

## Done
- Design system (black & gold theme): `css/tokens.css`, `base.css`, `layout.css`, `components.css`
- Static taxonomy: `js/data/taxonomy.js` (`CATEGORIES`, `MATERIALS`), `js/data/business.js`
- Product data lives in `js/data/products.json` — fetched at runtime via `js/modules/productsStore.js`; product photos are resized/compressed client-side and committed as real files under `images/products/<id>/`
- Shared rendering, wishlist, quick-view, filter/sort, and search modules under `js/modules/`
- Pages: Home (`index.html`), Shop (`shop.html`, with category/material filters + sort + search), Product detail (`product.html`), Wishlist (`wishlist.html`), About (`about.html`), Contact (`contact.html`)
- Placeholder product imagery (styled gold gradient + category icon) shown for any product with no uploaded photo yet
- Product Admin (`admin.html`, developer-only, not linked from the site) — a dashboard that connects with a GitHub personal access token, then add/edit/delete products and upload/remove photos, each committing straight to this repo and live on the public site within about a minute (GitHub Pages redeploy). `js/data/seed-products.js` powers its one-click "Import Starter Catalog" button (28 placeholder products) if you want a starting point instead of adding from scratch.
- Prices removed from the site entirely — gold jewelry pricing moves with the daily international gold rate, so every product now directs customers to inquire on Messenger for the current price instead of showing a number that would go stale
- `GITHUB_SETUP.md` completed — `js/github-config.js` points at the real repo (`Je-ferry/Chan-Lone-Website`) and a scoped personal access token is connected in `admin.html`
- Deployed live on GitHub Pages at `https://je-ferry.github.io/Chan-Lone-Website/`

## TODO before this goes live for real customers
- [ ] Delete the blank "New Product" test entry in `admin.html` (created while testing the GitHub connection — no real content, safe to remove)
- [ ] Replace `[PHONE_PLACEHOLDER]` with the real shop phone number (appears in `js/data/business.js`, `contact.html`, and every page's footer)
- [ ] Replace `[HOURS_PLACEHOLDER]` with real store hours (`contact.html`, `js/data/business.js`)
- [ ] Replace `[VIBER_PLACEHOLDER]` / `[WHATSAPP_PLACEHOLDER]` if you offer those, or remove those lines in `contact.html` if not
- [ ] Replace `[EMAIL_PLACEHOLDER]` in `js/data/business.js` if you want an email contact option
- [ ] Add your real products and photos in `admin.html` (or click "Import Starter Catalog" first, then edit/replace those placeholders) — review/replace the placeholder Burmese names too
- [ ] Replace the About page placeholder story text in `about.html` with your real shop history if you'd like something more specific than the current general copy

## Notes
- Confirmed real info used: business name, Burmese name, and address (C7, Yuzana Plaza, 1st Floor, Yangon) — pulled from the Facebook page. Facebook blocks automated scraping of photos/phone/hours for non-logged-in requests, so those remain placeholders.
- `admin.html` has no public sign-up — only whoever holds the personal access token created during `GITHUB_SETUP.md` can connect and change anything, enforced by that token's own repo-scoped permissions (not just by the page being unlinked).
