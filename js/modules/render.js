/** Shared rendering: product cards, placeholder media, and detail view. */
window.ChanLoneRender = (function () {
  var U = window.ChanLoneUtils;

  var HEART_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s-7.5-4.6-10-9.3C.5 8.2 2.4 4.5 6 4.1c2.1-.2 4 .9 5 2.5 1-1.6 2.9-2.7 5-2.5 3.6.4 5.5 4.1 4 7.6C19.5 16.4 12 21 12 21z"/></svg>';

  function placeholderMedia(product, opts) {
    opts = opts || {};
    var sizeClass = opts.large ? " placeholder-media--lg" : "";
    return (
      '<div class="placeholder-media' + sizeClass + '">' +
        '<img src="' + U.categoryIconPath(product.category) + '" alt="' + U.escapeHtml(product.category) + ' icon" />' +
        '<span class="placeholder-media__caption">Photo coming soon</span>' +
      "</div>"
    );
  }

  function productMedia(product, opts) {
    if (product.images && product.images.length > 0) {
      return '<img src="' + product.images[0] + '" alt="' + U.escapeHtml(product.name) + '" />';
    }
    return placeholderMedia(product, opts);
  }

  function wishlistButtonHtml(product) {
    var active = window.ChanLoneWishlist && window.ChanLoneWishlist.isInWishlist(product.id);
    return (
      '<button type="button" class="wishlist-btn' + (active ? " is-active" : "") + '" ' +
      'data-wishlist-toggle data-id="' + product.id + '" ' +
      'aria-pressed="' + (active ? "true" : "false") + '" ' +
      'aria-label="Toggle wishlist for ' + U.escapeHtml(product.name) + '">' +
      HEART_SVG +
      "</button>"
    );
  }

  function createProductCard(product) {
    var badges = "";
    if (product.isNew) badges += '<span class="badge badge--new">New</span>';
    badges += '<span class="badge badge--material">' + U.escapeHtml(U.materialLabel(product.material)) + "</span>";

    return (
      '<article class="product-card" data-id="' + product.id + '">' +
        '<div class="product-card__media-wrap" data-quickview-trigger data-id="' + product.id + '">' +
          '<div class="product-card__badges">' + badges + "</div>" +
          wishlistButtonHtml(product) +
          productMedia(product) +
          '<span class="quickview-trigger">Quick View</span>' +
        "</div>" +
        '<div class="product-card__body">' +
          '<span class="product-card__category">' + U.escapeHtml(U.categoryLabel(product.category)) +
            ' <span lang="my">(' + U.escapeHtml(U.categoryLabelBurmese(product.category)) + ")</span></span>" +
          '<a class="product-card__name" href="product.html?id=' + product.id + '">' + U.escapeHtml(product.name) + "</a>" +
          (product.nameBurmese ? '<span class="product-card__name-burmese" lang="my">' + U.escapeHtml(product.nameBurmese) + "</span>" : "") +
        "</div>" +
      "</article>"
    );
  }

  function renderGrid(container, products) {
    if (!container) return;
    if (!products || products.length === 0) {
      container.innerHTML =
        '<div class="empty-state"><h3>No pieces match your selection</h3>' +
        "<p>Try adjusting your filters or search terms.</p></div>";
      return;
    }
    container.innerHTML = products.map(createProductCard).join("");
    wireCardInteractions(container);
  }

  function wireCardInteractions(scope) {
    scope.querySelectorAll("[data-wishlist-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        var id = btn.getAttribute("data-id");
        var active = window.ChanLoneWishlist.toggle(id);
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-pressed", active ? "true" : "false");
      });
    });

    scope.querySelectorAll("[data-quickview-trigger]").forEach(function (el) {
      el.addEventListener("click", function () {
        var id = el.getAttribute("data-id");
        if (window.ChanLoneQuickview) window.ChanLoneQuickview.open(id);
      });
    });
  }

  function renderProductDetails(product, container, opts) {
    opts = opts || {};
    if (!container || !product) return;

    var galleryHtml = productMedia(product, { large: true });
    var active = window.ChanLoneWishlist && window.ChanLoneWishlist.isInWishlist(product.id);
    var businessMsg = encodeURIComponent("Hi! I'm interested in the " + product.name + " (" + product.id + ").");
    var messengerUrl = (window.BUSINESS && window.BUSINESS.messengerUrl) || "#";

    container.innerHTML =
      '<div class="product-detail">' +
        '<div>' +
          '<div class="product-detail__gallery">' + galleryHtml + "</div>" +
        "</div>" +
        '<div class="product-detail__info">' +
          '<span class="eyebrow">' + U.escapeHtml(U.categoryLabel(product.category)) +
            ' <span lang="my">(' + U.escapeHtml(U.categoryLabelBurmese(product.category)) + ")</span></span>" +
          "<h1>" + U.escapeHtml(product.name) + "</h1>" +
          (product.nameBurmese ? '<p class="product-detail__name-burmese" lang="my">' + U.escapeHtml(product.nameBurmese) + "</p>" : "") +
          '<div class="product-detail__meta">' +
            '<span class="badge badge--material">' + U.escapeHtml(U.materialLabel(product.material)) + "</span>" +
            (product.isNew ? '<span class="badge badge--new">New</span>' : "") +
          "</div>" +
          '<p class="product-detail__desc">' + U.escapeHtml(product.description || product.shortDescription || "") + "</p>" +
          '<div class="product-detail__actions">' +
            '<a class="btn btn--primary" target="_blank" rel="noopener" href="' + messengerUrl + '?text=' + businessMsg + '">Inquire on Messenger</a>' +
            '<button type="button" class="btn btn--outline' + (active ? " is-active" : "") + '" data-wishlist-toggle data-id="' + product.id + '" aria-pressed="' + (active ? "true" : "false") + '">' +
              (active ? "Saved to Wishlist" : "Add to Wishlist") +
            "</button>" +
            (opts.showFullDetailsLink ? '<a class="btn btn--ghost" href="product.html?id=' + product.id + '">View Full Details</a>' : "") +
          "</div>" +
        "</div>" +
      "</div>";

    var wishlistBtn = container.querySelector("[data-wishlist-toggle]");
    if (wishlistBtn) {
      wishlistBtn.addEventListener("click", function () {
        var isActive = window.ChanLoneWishlist.toggle(product.id);
        wishlistBtn.classList.toggle("is-active", isActive);
        wishlistBtn.setAttribute("aria-pressed", isActive ? "true" : "false");
        wishlistBtn.textContent = isActive ? "Saved to Wishlist" : "Add to Wishlist";
      });
    }
  }

  return {
    createProductCard: createProductCard,
    renderGrid: renderGrid,
    renderProductDetails: renderProductDetails,
    placeholderMedia: placeholderMedia,
    wireCardInteractions: wireCardInteractions
  };
})();
