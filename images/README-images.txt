HOW TO ADD REAL PRODUCT PHOTOS
===============================

Product photos ARE stored in this repo, under images/products/<product-id>/
-- but you never add them here by hand. They're resized/compressed in the
browser and committed automatically through the admin dashboard.

1. Complete GITHUB_SETUP.md (one-time), if you haven't already.
2. Open admin.html and connect with your personal access token.
3. Find the product (or click "+ Add New Product"), choose a photo file
   next to it, and it uploads and appears immediately -- on that product
   card, and live on the public site (home, shop grid, quick view,
   product page) within about a minute (GitHub Pages redeploy).
4. To remove a photo, hover its thumbnail on the product's card in
   admin.html and click the x.

Until a product has a photo, every page shows a styled placeholder (gold
gradient + a line-icon of a ring/necklace/bracelet/earring +
"Photo coming soon") automatically -- that's normal, not an error.

The icons in images/placeholders/icons/ are a separate, hand-maintained
set used only for those placeholders -- don't confuse them with real
product photos under images/products/.
