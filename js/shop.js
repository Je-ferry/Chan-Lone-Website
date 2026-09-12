document.addEventListener("DOMContentLoaded", function () {
  var U = window.ChanLoneUtils;
  var FS = window.ChanLoneFilterSort;
  var S = window.ChanLoneSearch;

  var grid = document.getElementById("shop-grid");
  var resultCount = document.getElementById("result-count");
  var title = document.getElementById("shop-title");
  var sortSelect = document.getElementById("sort-select");
  var minPriceInput = document.getElementById("min-price");
  var maxPriceInput = document.getElementById("max-price");
  var clearBtn = document.getElementById("clear-filters");
  var categoryRadios = document.querySelectorAll('input[name="category"]');
  var materialChecks = document.querySelectorAll('input[name="material"]');

  function readStateFromUrl() {
    return {
      category: U.getParam("category") || "",
      materials: U.getParamList("material"),
      minPrice: U.getParam("minPrice") || "",
      maxPrice: U.getParam("maxPrice") || "",
      q: U.getParam("q") || "",
      sort: U.getParam("sort") || "featured"
    };
  }

  function applyStateToControls(state) {
    categoryRadios.forEach(function (r) { r.checked = r.value === state.category; });
    materialChecks.forEach(function (c) { c.checked = state.materials.indexOf(c.value) !== -1; });
    minPriceInput.value = state.minPrice;
    maxPriceInput.value = state.maxPrice;
    sortSelect.value = state.sort;
  }

  function readStateFromControls(existing) {
    var category = document.querySelector('input[name="category"]:checked');
    var materials = Array.prototype.filter.call(materialChecks, function (c) { return c.checked; })
      .map(function (c) { return c.value; });
    return {
      category: category ? category.value : "",
      materials: materials,
      minPrice: minPriceInput.value,
      maxPrice: maxPriceInput.value,
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
      minPrice: state.minPrice,
      maxPrice: state.maxPrice,
      q: state.q,
      sort: state.sort === "featured" ? "" : state.sort
    });

    var results = state.q ? S.search(window.PRODUCTS, state.q) : window.PRODUCTS.slice();
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
  var debouncedChange = U.debounce(onControlsChange, 300);
  minPriceInput.addEventListener("input", debouncedChange);
  maxPriceInput.addEventListener("input", debouncedChange);

  clearBtn.addEventListener("click", function () {
    categoryRadios.forEach(function (r) { r.checked = r.value === ""; });
    materialChecks.forEach(function (c) { c.checked = false; });
    minPriceInput.value = "";
    maxPriceInput.value = "";
    sortSelect.value = "featured";
    currentState = { category: "", materials: [], minPrice: "", maxPrice: "", q: "", sort: "featured" };
    render(currentState);
  });
});
