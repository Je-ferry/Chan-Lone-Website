/**
 * Fetches the product catalog from Firestore once, caches it in memory,
 * and sets window.PRODUCTS for any code that still reads it synchronously
 * after load (e.g. quickview.js). Every product document's Firestore doc
 * ID becomes its `id` field.
 */
window.ChanLoneProductsStore = (function () {
  var cache = null;
  var pending = null;

  function fetchAll() {
    if (cache) return Promise.resolve(cache);
    if (pending) return pending;

    pending = window.firebase.firestore().collection("products").get({ source: "server" })
      .then(function (snapshot) {
        cache = snapshot.docs.map(function (doc) {
          var data = doc.data();
          data.id = doc.id;
          return data;
        });
        window.PRODUCTS = cache;
        pending = null;
        return cache;
      })
      .catch(function (err) {
        pending = null;
        console.error("Could not load products from Firestore:", err);
        throw new Error("Could not load the product catalog. If you just set this site up, make sure js/firebase-config.js has your real Firebase project details (see FIREBASE_SETUP.md).");
      });

    return pending;
  }

  function invalidate() {
    cache = null;
  }

  return { fetchAll: fetchAll, invalidate: invalidate };
})();
