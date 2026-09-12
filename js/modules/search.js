/** Simple client-side keyword search over PRODUCTS. */
window.ChanLoneSearch = (function () {
  function search(products, term) {
    if (!term) return products;
    var q = term.trim().toLowerCase();
    if (!q) return products;
    return products.filter(function (p) {
      var hay = [
        p.name, p.category, p.material,
        (p.tags || []).join(" "),
        p.description || "", p.shortDescription || ""
      ].join(" ").toLowerCase();
      return hay.indexOf(q) !== -1;
    });
  }

  return { search: search };
})();
