/**
 * Fetches the product catalog from js/data/products.json once, caches it in
 * memory, and sets window.PRODUCTS for any code that still reads it
 * synchronously after load (e.g. quickview.js).
 */
window.ChanLoneProductsStore = (function () {
  var PRODUCTS_URL = "js/data/products.json";
  var cache = null;
  var pending = null;

  function fetchAll() {
    if (cache) return Promise.resolve(cache);
    if (pending) return pending;

    pending = fetch(PRODUCTS_URL, { cache: "no-cache" })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (data) {
        cache = Array.isArray(data) ? data : [];
        window.PRODUCTS = cache;
        pending = null;
        return cache;
      })
      .catch(function (err) {
        pending = null;
        console.error("Could not load products.json:", err);
        throw new Error("Could not load the product catalog. Try reloading the page.");
      });

    return pending;
  }

  function invalidate() {
    cache = null;
  }

  return { fetchAll: fetchAll, invalidate: invalidate };
})();
