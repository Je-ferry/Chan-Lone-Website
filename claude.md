# Chan Lone Gold & Jewelery — Website

Static HTML/CSS/JS front end, no build step, no framework — must work by
double-clicking `index.html` and identically once hosted on GitHub Pages.
Product data lives in Firebase (Firestore + Storage) behind security rules,
fetched at runtime over HTTPS — see "Product data backend" below. There is
still no server-rendering, no bundler, and no CI/build step.

## Conventions
- Every customer-facing page duplicates the same header/footer markup (no
  templating available without a build step or server). When changing the
  header/footer/nav, update it in all HTML files: index, shop, product,
  wishlist, about, contact. (`admin.html` is exempt — see below.)
- `js/data/taxonomy.js` holds the static `CATEGORIES`/`MATERIALS` arrays
  (rarely change, hand-edited). Product data itself (`PRODUCTS`) is NOT a
  static file anymore — it's fetched from Firestore at runtime via
  `js/modules/productsStore.js` (`ChanLoneProductsStore.fetchAll()`),
  which resolves the full array and also sets `window.PRODUCTS` for
  back-compat with code that reads it synchronously after load. Never
  hand-write product HTML — always render fetched data via
  `js/modules/render.js`.
- Scripts are plain (non-module) and attach to `window` globals
  (`ChanLoneUtils`, `ChanLoneRender`, `ChanLoneWishlist`,
  `ChanLoneProductsStore`, etc.) because ES modules are unreliable over
  `file://`. The Firebase SDK is loaded the same way, via its official
  "compat" builds from `gstatic.com`, which attach a `window.firebase`
  global instead of requiring `import`. Keep new modules consistent with
  this pattern and load them in the fixed `<script>` order used on
  existing pages: Firebase SDK compat scripts -> `firebase-config.js` ->
  data (`business.js`, `taxonomy.js`) -> `productsStore.js` -> `utils.js`
  -> `render.js` -> `wishlist.js` -> `quickview.js` -> [page-specific
  modules, e.g. `filterSort.js`/`search.js` on shop] -> `partials.js` ->
  page controller. Page controllers (`home.js`, `shop.js`, `product.js`,
  `wishlist-page.js`) call `ChanLoneProductsStore.fetchAll().then(...)`
  and do their existing rendering inside that callback, since the data is
  now async.
- Wishlist state lives in `localStorage` under `chanlone_wishlist`, managed
  only through `js/modules/wishlist.js`.
- Placeholder product images use `.placeholder-media` (see
  `css/components.css` and `render.js`) instead of broken `<img>` tags.
  Real photos are uploaded through `admin.html` straight to Firebase
  Storage — there's no `images/products/` folder anymore.
- Business is inquiry-based, not e-commerce: there is no cart/checkout.
  Product CTAs link to Messenger (`m.me/chanlonjewelry`) or phone.
- No prices anywhere on the site (not in data, filters, sort, or display).
  Gold jewelry pricing moves with the daily international gold rate, so a
  stored price would go stale — customers always inquire on Messenger for
  the current price instead.
- Every product has a `nameBurmese` field alongside `name`, rendered under
  the English name (product cards and product detail) with `lang="my"` so
  it picks up the Myanmar font already set up in `base.css`.

## Product data backend (Firebase)
- **Firestore** (`products` collection) holds every product document;
  **Storage** (`product-images/<productId>/...`) holds uploaded photos;
  **Authentication** (Email/Password, exactly one account) gates who can
  write. Setup is one-time and manual — see `FIREBASE_SETUP.md`.
- `js/firebase-config.js` holds the public web-app config
  (`apiKey`/`authDomain`/etc.). This is safe to commit and deploy as-is —
  it identifies the project, it isn't a secret. **Real security is the
  Firestore/Storage rules**, which only allow writes from the one admin
  account, matched by its Firebase Auth **UID** (not just "any logged-in
  user" — Firebase's email/password provider lets anyone self-register via
  its REST API even with no sign-up UI in this app, so the rule must pin
  the exact UID). See the rules text in `FIREBASE_SETUP.md`; if you ever
  need to change them, edit them in the Firebase Console directly.
- `admin.html` (+ `js/admin.js`, `css/admin.css`) is a developer-only,
  password-protected dashboard: sign in, then add/edit/delete products and
  upload/remove photos, all persisted immediately to Firestore/Storage —
  changes are live on the public site on next reload, no `git push`
  needed. It is intentionally NOT linked from the site nav and does NOT
  follow the shared header/footer convention above (it's a standalone
  tool page, not a customer-facing page, so it isn't in the "update it in
  all HTML files" list). `js/data/seed-products.js` (`SEED_PRODUCTS`) is
  loaded only by `admin.html`, for its one-click "Import Starter Catalog"
  button — not used anywhere else.

## Real vs. placeholder content
Only the business name, Burmese name, and address are confirmed real (from
the Facebook page). Phone, hours, product catalog/photos and the Burmese
product names are placeholders — see `progress.md` for the full swap-in
checklist.

## Hosting
Static front end deployed via GitHub Pages (free) — see `README.md` for
deploy steps; no build/CI step required, Pages serves the repo files
directly. Before the admin panel or live product data will work, you also
need to complete the one-time `FIREBASE_SETUP.md` steps (create a Firebase
project, enable Auth/Firestore/Storage, paste your config into
`js/firebase-config.js`).
