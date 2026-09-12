/** localStorage-backed wishlist, shared across all pages/tabs. */
window.ChanLoneWishlist = (function () {
  var KEY = "chanlone_wishlist";

  function getWishlist() {
    try {
      var raw = window.localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveWishlist(ids) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(ids));
    } catch (e) { /* localStorage unavailable, fail silently */ }
    document.dispatchEvent(new CustomEvent("wishlist:change", { detail: { ids: ids } }));
  }

  function isInWishlist(id) {
    return getWishlist().indexOf(id) !== -1;
  }

  function toggle(id) {
    var ids = getWishlist();
    var idx = ids.indexOf(id);
    if (idx === -1) {
      ids.push(id);
    } else {
      ids.splice(idx, 1);
    }
    saveWishlist(ids);
    return ids.indexOf(id) !== -1;
  }

  function count() {
    return getWishlist().length;
  }

  window.addEventListener("storage", function (e) {
    if (e.key === KEY) {
      document.dispatchEvent(new CustomEvent("wishlist:change", { detail: { ids: getWishlist() } }));
    }
  });

  return {
    getWishlist: getWishlist,
    isInWishlist: isInWishlist,
    toggle: toggle,
    count: count
  };
})();
