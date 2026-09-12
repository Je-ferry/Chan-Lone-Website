HOW TO ADD REAL PRODUCT PHOTOS
===============================

Product photos are no longer stored in this folder or referenced by a
file path in code -- they're uploaded straight to Firebase Storage
through the admin dashboard.

1. Complete FIREBASE_SETUP.md (one-time), if you haven't already.
2. Open admin.html and sign in.
3. Find the product (or click "+ Add New Product"), choose a photo file
   next to it, and it uploads and appears immediately -- on that product
   card, and live on the public site (home, shop grid, quick view,
   product page) as soon as you reload.
4. To remove a photo, hover its thumbnail on the product's card in
   admin.html and click the x.

Until a product has a photo, every page shows a styled placeholder (gold
gradient + a line-icon of a ring/necklace/bracelet/earring +
"Photo coming soon") automatically -- that's normal, not an error.

The icons in images/placeholders/icons/ are used for those placeholders
and are the only image files this project still keeps in the repo.
