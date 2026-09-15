# Chan Lone Gold & Jewelery — Website

Static HTML/CSS/JS front end, no build step, no framework — must work by
double-clicking `index.html` and identically once hosted on GitHub Pages.
Product data lives in `js/data/products.json` in this repo, fetched at
runtime; product photos are real files committed under `images/products/`.
The admin dashboard writes both by committing directly to this repo via the
GitHub REST API — see "Product data backend" below. There is still no
server-rendering, no bundler, and no CI/build step.

## Conventions
- Every customer-facing page duplicates the same header/footer markup (no
  templating available without a build step or server). When changing the
  header/footer/nav, update it in all HTML files: index, shop, product,
  wishlist, about, contact. (`admin.html` is exempt — see below.)
- `js/data/taxonomy.js` holds the static `CATEGORIES`/`MATERIALS` arrays
  (rarely change, hand-edited). Product data itself (`PRODUCTS`) is NOT
  hand-edited — it's fetched at runtime from `js/data/products.json` via
  `js/modules/productsStore.js` (`ChanLoneProductsStore.fetchAll()`),
  which resolves the full array and also sets `window.PRODUCTS` for
  back-compat with code that reads it synchronously after load. Never
  hand-write product HTML — always render fetched data via
  `js/modules/render.js`.
- Scripts are plain (non-module) and attach to `window` globals
  (`ChanLoneUtils`, `ChanLoneRender`, `ChanLoneWishlist`,
  `ChanLoneProductsStore`, etc.) because ES modules are unreliable over
  `file://`. Keep new modules consistent with this pattern and load them in
  the fixed `<script>` order used on existing pages: data (`business.js`,
  `taxonomy.js`) -> `productsStore.js` -> `utils.js` -> `render.js` ->
  `wishlist.js` -> `quickview.js` -> [page-specific modules, e.g.
  `filterSort.js`/`search.js` on shop] -> `partials.js` -> page controller.
  Page controllers (`home.js`, `shop.js`, `product.js`, `wishlist-page.js`)
  call `ChanLoneProductsStore.fetchAll().then(...)` and do their existing
  rendering inside that callback, since the data is fetched async.
  `admin.html` separately loads `js/github-config.js` and
  `js/modules/githubApi.js` (admin-only, never on customer-facing pages).
- Wishlist state lives in `localStorage` under `chanlone_wishlist`, managed
  only through `js/modules/wishlist.js`.
- Placeholder product images use `.placeholder-media` (see
  `css/components.css` and `render.js`) instead of broken `<img>` tags.
  Real photos are uploaded through `admin.html`, which resizes/compresses
  them client-side and commits each as a real file under
  `images/products/<id>/` via the GitHub API.
- Business is inquiry-based, not e-commerce: there is no cart/checkout.
  Product CTAs link to Messenger (`m.me/chanlonjewelry`) or phone.
- No prices anywhere on the site (not in data, filters, sort, or display).
  Gold jewelry pricing moves with the daily international gold rate, so a
  stored price would go stale — customers always inquire on Messenger for
  the current price instead.
- Every product has a `nameBurmese` field alongside `name`, rendered under
  the English name (product cards and product detail) with `lang="my"` so
  it picks up the Myanmar font already set up in `base.css`.

## Product data backend (GitHub Contents API)
- **`js/data/products.json`** holds the whole product catalog as a plain
  JSON array, fetched at runtime by `productsStore.js`. Each product's
  `images` field is an array of repo-relative file paths (e.g.
  `images/products/classic-gold-band-ring/1737928193482.jpg`, first one =
  primary/cover photo) — real files, not base64 blobs. Photos are
  resized/compressed client-side in `js/admin.js` (`compressImageToFit`)
  before being committed, mainly to keep page-load weight and repo size
  reasonable — there's no hard per-document size cap driving this anymore.
- **No separate auth system.** `admin.html` writes directly to this repo
  via the GitHub REST "Contents" API (`js/modules/githubApi.js`), using a
  personal access token the owner pastes in once (stored only in that
  browser's `localStorage`, sent as `Authorization: Bearer <token>` on
  every call). Real security is simply the token's scope — see
  `GITHUB_SETUP.md` for creating a fine-grained PAT limited to this one
  repo with Contents: Read-and-write only, nothing else. Losing/leaking a
  properly-scoped token can only affect this repo's files.
- `js/github-config.js` holds the public repo identifier
  (`{owner, name, branch}`). Safe to commit as-is — it just names the repo,
  it isn't a secret.
- Every admin write is read-modify-write: fetch `products.json` fresh (with
  its current `sha`), modify the in-memory array, commit the whole file
  back with that `sha`. Single-admin tool, so a 409 (sha mismatch, e.g. two
  tabs saving at once) just surfaces a "reload and try again" message — no
  merge logic. Authenticated GitHub API calls are capped at 5,000/hour,
  irrelevant at this usage scale.
- `admin.html` (+ `js/admin.js`, `css/admin.css`) is a developer-only
  dashboard: paste a token once to connect, then add/edit/delete products
  and upload/remove photos, each committing straight to the repo — changes
  are live on the public site (via GitHub Pages' redeploy, ~1 minute) with
  no manual `git push`. It is intentionally NOT linked from the site nav
  and does NOT follow the shared header/footer convention above (it's a
  standalone tool page, not a customer-facing page, so it isn't in the
  "update it in all HTML files" list). `js/data/seed-products.js`
  (`SEED_PRODUCTS`) is loaded only by `admin.html`, for its one-click
  "Import Starter Catalog" button — not used anywhere else.

## Real vs. placeholder content
Only the business name, Burmese name, and address are confirmed real (from
the Facebook page). Phone, hours, product catalog/photos and the Burmese
product names are placeholders — see `progress.md` for the full swap-in
checklist.

## Hosting
Deployed live on GitHub Pages at `https://je-ferry.github.io/Chan-Lone-Website/`
— see `README.md` for deploy steps; no build/CI step required, Pages serves
the repo files directly. `GITHUB_SETUP.md` is complete: `js/github-config.js`
points at the real repo (`Je-ferry/Chan-Lone-Website`), and the owner has a
personal access token connected in `admin.html`.
