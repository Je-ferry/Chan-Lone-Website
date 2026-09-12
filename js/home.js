document.addEventListener("DOMContentLoaded", function () {
  var container = document.getElementById("featured-grid");
  if (!container) return;
  var featured = window.PRODUCTS.filter(function (p) { return p.isFeatured; }).slice(0, 8);
  window.ChanLoneRender.renderGrid(container, featured);
});
