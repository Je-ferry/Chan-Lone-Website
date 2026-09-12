document.addEventListener("DOMContentLoaded", function () {
  var container = document.getElementById("featured-grid");
  if (!container) return;
  window.ChanLoneProductsStore.fetchAll().then(function (products) {
    var featured = products.filter(function (p) { return p.isFeatured; }).slice(0, 8);
    window.ChanLoneRender.renderGrid(container, featured);
  }).catch(function (err) {
    container.innerHTML = '<div class="empty-state"><h3>Couldn\'t load products</h3><p>' + err.message + "</p></div>";
  });
});
