HOW TO ADD REAL PRODUCT PHOTOS
===============================

Right now every product shows a styled placeholder (gold gradient + a line-icon
of a ring/necklace/bracelet/earring + "Photo coming soon") because we could
not automatically pull real photos from the Facebook page.

To swap in a real photo for a product:

1. Get the photo (from the Facebook page, or a new photo you take).
   Recommended: square image, at least 1000x1000px, JPG or WebP.

2. Save it into this folder as: images/products/<product-id>-1.jpg
   Example: images/products/rg-001-1.jpg
   (Product IDs are in js/data/products.js, e.g. "rg-001", "nk-003".)

   You can add more than one photo per product, e.g. rg-001-2.jpg, rg-001-3.jpg.

3. Open js/data/products.js and find that product's entry. Change:
       images: []
   to:
       images: ["images/products/rg-001-1.jpg", "images/products/rg-001-2.jpg"]

4. Save the file and refresh the page (or re-deploy) — the real photo will
   replace the placeholder automatically everywhere that product appears
   (home, shop grid, quick view, product page).

That's it — no other code changes needed.
