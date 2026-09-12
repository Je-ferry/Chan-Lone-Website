/** Quick-view modal: opens a product's details without leaving the page. */
window.ChanLoneQuickview = (function () {
  var overlay, body, lastFocused;

  function ensureModal() {
    if (overlay) return;
    overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.setAttribute("hidden", "");
    overlay.innerHTML =
      '<div class="modal" role="dialog" aria-modal="true" aria-label="Product quick view">' +
        '<button type="button" class="modal__close" aria-label="Close quick view">&times;</button>' +
        '<div class="modal__body"></div>' +
      "</div>";
    document.body.appendChild(overlay);
    body = overlay.querySelector(".modal__body");

    overlay.querySelector(".modal__close").addEventListener("click", close);
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !overlay.hasAttribute("hidden")) close();
    });
  }

  function open(id) {
    ensureModal();
    var product = (window.PRODUCTS || []).find(function (p) { return p.id === id; });
    if (!product) return;
    lastFocused = document.activeElement;
    window.ChanLoneRender.renderProductDetails(product, body, { showFullDetailsLink: true });
    overlay.removeAttribute("hidden");
    document.body.style.overflow = "hidden";
    overlay.querySelector(".modal__close").focus();
  }

  function close() {
    if (!overlay) return;
    overlay.setAttribute("hidden", "");
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  }

  return { open: open, close: close };
})();
