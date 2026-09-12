# Chan Lone Gold & Jewelery — Website

A static website (no server, no database) for Chan Lone Gold & Jewelery.

## View it locally
Just double-click `index.html` — it opens in your browser and works fully
offline (browsing, filters, search, wishlist all work without internet).

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
After editing any file:
```
git add .
git commit -m "Describe what changed"
git push
```
GitHub Pages will automatically update the live site within a minute or two.

## Before sharing the live link with customers
See `progress.md` for the checklist of placeholder content to replace first
(phone number, store hours, and real product photos).
