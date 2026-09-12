document.addEventListener("DOMContentLoaded", function () {
  var U = window.ChanLoneUtils;
  var FS = window.ChanLoneFilterSort;
  var S = window.ChanLoneSearch;

  var grid = document.getElementById("shop-grid");
  var resultCount = document.getElementById("result-count");
  var title = document.getElementById("shop-title");
  var sortSelect = document.getElementById("sort-select");
  var clearBtn = document.getElementById("clear-filters");
  var categoryRadios = document.querySelectorAll('input[name="category"]');
  var materialChecks = document.querySelectorAll('input[name="material"]');

  window.ChanLoneProductsStore.fetchAll().then(function (products) {
    function readStateFromUrl() {
      return {
        category: U.getParam("category") || "",
        materials: U.getParamList("material"),
        q: U.getParam("q") || "",
        sort: U.getParam("sort") || "featured"
      };
    }

    function applyStateToControls(state) {
      categoryRadios.forEach(function (r) { r.checked = r.value === state.category; });
      materialChecks.forEach(function (c) { c.checked = state.materials.indexOf(c.value) !== -1; });
      sortSelect.value = state.sort;
    }

    function readStateFromControls(existing) {
      var category = document.querySelector('input[name="category"]:checked');
      var materials = Array.prototype.filter.call(materialChecks, function (c) { return c.checked; })
        .map(function (c) { return c.value; });
      return {
        category: category ? category.value : "",
        materials: materials,
        q: existing.q,
        sort: sortSelect.value
      };
    }

    function updateTitle(state) {
      if (state.q) {
        title.textContent = 'Search results for "' + state.q + '"';
      } else if (state.category) {
        title.textContent = U.categoryLabel(state.category);
      } else {
        title.textContent = "All Jewelry";
      }
    }

    function render(state) {
      U.setQueryParams({
        category: state.category,
        material: state.materials,
        q: state.q,
        sort: state.sort === "featured" ? "" : state.sort
      });

      var results = state.q ? S.search(products, state.q) : products.slice();
      results = FS.filterProducts(results, state);
      results = FS.sortProducts(results, state.sort);

      updateTitle(state);
      resultCount.textContent = results.length + (results.length === 1 ? " piece" : " pieces");
      window.ChanLoneRender.renderGrid(grid, results);
    }

    var currentState = readStateFromUrl();
    applyStateToControls(currentState);
    render(currentState);

    function onControlsChange() {
      currentState = readStateFromControls(currentState);
      render(currentState);
    }

    categoryRadios.forEach(function (r) { r.addEventListener("change", onControlsChange); });
    materialChecks.forEach(function (c) { c.addEventListener("change", onControlsChange); });
    sortSelect.addEventListener("change", onControlsChange);

    clearBtn.addEventListener("click", function () {
      categoryRadios.forEach(function (r) { r.checked = r.value === ""; });
      materialChecks.forEach(function (c) { c.checked = false; });
      sortSelect.value = "featured";
      currentState = { category: "", materials: [], q: "", sort: "featured" };
      render(currentState);
    });
  }).catch(function (err) {
    grid.innerHTML = '<div class="empty-state"><h3>Couldn\'t load products</h3><p>' + err.message + "</p></div>";
  });
});
