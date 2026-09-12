/** Shared small helpers used across pages. */
window.ChanLoneUtils = (function () {
  function formatPrice(amount, currency) {
    return (currency || "MMK") + " " + Number(amount).toLocaleString("en-US");
  }

  function getParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function getParamList(name) {
    var val = getParam(name);
    return val ? val.split(",").filter(Boolean) : [];
  }

  function setQueryParams(params) {
    var usp = new URLSearchParams();
    Object.keys(params).forEach(function (key) {
      var val = params[key];
      if (val === undefined || val === null || val === "" ||
          (Array.isArray(val) && val.length === 0)) {
        return;
      }
      usp.set(key, Array.isArray(val) ? val.join(",") : val);
    });
    var qs = usp.toString();
    var newUrl = window.location.pathname + (qs ? "?" + qs : "");
    window.history.replaceState({}, "", newUrl);
  }

  function debounce(fn, wait) {
    var t;
    return function () {
      var args = arguments, ctx = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, args); }, wait || 250);
    };
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = String(str == null ? "" : str);
    return div.innerHTML;
  }

  function categoryLabel(id) {
    var cat = (window.CATEGORIES || []).find(function (c) { return c.id === id; });
    return cat ? cat.label : id;
  }

  function materialLabel(id) {
    var mat = (window.MATERIALS || []).find(function (m) { return m.id === id; });
    return mat ? mat.label : id;
  }

  function categoryIconPath(category) {
    var singular = {
      rings: "ring",
      necklaces: "necklace",
      bracelets: "bracelet",
      earrings: "earring"
    };
    var name = singular[category] || "ring";
    return "images/placeholders/icons/" + name + ".svg";
  }

  return {
    formatPrice: formatPrice,
    getParam: getParam,
    getParamList: getParamList,
    setQueryParams: setQueryParams,
    debounce: debounce,
    escapeHtml: escapeHtml,
    categoryLabel: categoryLabel,
    materialLabel: materialLabel,
    categoryIconPath: categoryIconPath
  };
})();
