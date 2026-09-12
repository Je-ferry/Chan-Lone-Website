document.addEventListener("DOMContentLoaded", function () {
  var U = window.ChanLoneUtils;
  var id = U.getParam("id");
  var container = document.getElementById("product-detail-container");
  var breadcrumbCurrent = document.getElementById("breadcrumb-current");
  var relatedGrid = document.getElementById("related-grid");

  window.ChanLoneProductsStore.fetchAll().then(function (products) {
    var product = products.find(function (p) { return p.id === id; });

    if (!product) {
      container.innerHTML =
        '<div class="empty-state"><h3>We couldn\'t find that piece</h3>' +
        '<p>It may have been removed. <a href="shop.html">Browse the full collection</a>.</p></div>';
      return;
    }

    document.title = product.name + " — Chan Lone Gold & Jewelery";
    breadcrumbCurrent.textContent = product.name;

    window.ChanLoneRender.renderProductDetails(product, container, { showFullDetailsLink: false });

    var related = products.filter(function (p) {
      return p.category === product.category && p.id !== product.id;
    }).slice(0, 4);
    window.ChanLoneRender.renderGrid(relatedGrid, related);
  }).catch(function (err) {
    container.innerHTML = '<div class="empty-state"><h3>Couldn\'t load this product</h3><p>' + err.message + "</p></div>";
  });
});
