/** Pure filter/sort functions over the PRODUCTS array. No DOM here. */
window.ChanLoneFilterSort = (function () {
  function filterProducts(products, state) {
    state = state || {};
    return products.filter(function (p) {
      if (state.category && p.category !== state.category) return false;
      if (state.materials && state.materials.length && state.materials.indexOf(p.material) === -1) return false;
      if (state.q) {
        var hay = (p.name + " " + p.category + " " + p.material + " " +
          (p.tags || []).join(" ") + " " + (p.description || "")).toLowerCase();
        if (hay.indexOf(state.q.toLowerCase()) === -1) return false;
      }
      return true;
    });
  }

  function sortProducts(products, key) {
    var list = products.slice();
    switch (key) {
      case "name-asc":
        return list.sort(function (a, b) { return a.name.localeCompare(b.name); });
      case "newest":
        return list.sort(function (a, b) { return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0); });
      default:
        return list;
    }
  }

  return { filterProducts: filterProducts, sortProducts: sortProducts };
})();
