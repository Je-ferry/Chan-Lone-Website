document.addEventListener("DOMContentLoaded", function () {
  var grid = document.getElementById("wishlist-grid");

  function render() {
    var ids = window.ChanLoneWishlist.getWishlist();
    var items = window.PRODUCTS.filter(function (p) { return ids.indexOf(p.id) !== -1; });
    if (items.length === 0) {
      grid.innerHTML =
        '<div class="empty-state"><h3>Your wishlist is empty</h3>' +
        '<p>Tap the heart icon on any piece to save it here.</p>' +
        '<div style="margin-top: var(--space-5);"><a class="btn btn--primary" href="shop.html">Browse the Collection</a></div></div>';
      return;
    }
    window.ChanLoneRender.renderGrid(grid, items);
  }

  render();
  document.addEventListener("wishlist:change", render);
});
