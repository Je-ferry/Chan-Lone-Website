# Chan Lone Gold & Jewelery — Website

A static front end (no build step, no server code to host) for Chan Lone
Gold & Jewelery. Product data lives in Firebase (Firestore + Storage), so
you do need one free Firebase project — see **`FIREBASE_SETUP.md`** for
the one-time setup (~15 minutes). Everything else about hosting below is
unchanged.

## View it locally
Double-click `index.html` — it opens in your browser. Browsing, filters,
search and wishlist all work as before; the product catalog itself now
loads from Firebase, so an internet connection is required (it no longer
works fully offline once Firebase is set up).

## Deploy for free on GitHub Pages
This puts the site on the public internet at no cost, reachable worldwide
(including Myanmar).

1. Create a free GitHub account at github.com if you don't have one.
2. Create a new **public** repository (e.g. named `chan-lone-website`).
3. From this folder, run:
   ```
   git init
   git add .
   git commit -m "Initial website"
   git branch -M main
   git remote add origin https://github.com/<your-username>/chan-lone-website.git
   git push -u origin main
   ```
4. On GitHub, go to your repo's **Settings → Pages**.
5. Under "Build and deployment", set **Source** to "Deploy from a branch",
   branch `main`, folder `/ (root)`, then Save.
6. After a minute, your site will be live at:
   `https://<your-username>.github.io/chan-lone-website/`

## Publishing future changes
Adding/editing/deleting **products or photos** happens in `admin.html` and
goes live immediately — no `git push` needed for that.

For actual **code or design changes**, after editing any file:
```
git add .
git commit -m "Describe what changed"
git push
```
GitHub Pages will automatically update the live site within a minute or two.

Note: this repo will include `js/firebase-config.js` with your project's
public config values. That's expected and safe to publish (see the
comment in that file / `FIREBASE_SETUP.md`) — it's not a secret, security
comes from the Firestore/Storage rules, not from hiding this file.

## Before sharing the live link with customers
See `progress.md` for the checklist of placeholder content to replace
first (phone number, store hours, and real product photos/catalog) and
make sure you've completed `FIREBASE_SETUP.md`.
