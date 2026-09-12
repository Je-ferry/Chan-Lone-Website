/** Header/footer behavior shared by every page: nav state, search, wishlist badge. */
(function () {
  function updateWishlistBadge() {
    document.querySelectorAll("[data-wishlist-badge]").forEach(function (el) {
      var n = window.ChanLoneWishlist.count();
      el.textContent = n;
      el.hidden = n === 0;
    });
  }

  function highlightActiveNav() {
    var page = document.body.getAttribute("data-page");
    if (!page) return;
    document.querySelectorAll("[data-nav]").forEach(function (link) {
      if (link.getAttribute("data-nav") === page) {
        link.classList.add("is-active");
      }
    });
  }

  function wireMobileNav() {
    var toggle = document.querySelector(".nav-toggle");
    var drawer = document.querySelector(".mobile-nav");
    if (!toggle || !drawer) return;
    toggle.addEventListener("click", function () {
      drawer.removeAttribute("hidden");
      document.body.style.overflow = "hidden";
    });
    var closeBtn = drawer.querySelector(".mobile-nav__close");
    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        drawer.setAttribute("hidden", "");
        document.body.style.overflow = "";
      });
    }
    drawer.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        drawer.setAttribute("hidden", "");
        document.body.style.overflow = "";
      });
    });
  }

  function wireSearchFlyout() {
    var toggle = document.querySelector("[data-search-toggle]");
    var flyout = document.querySelector(".search-flyout");
    if (!toggle || !flyout) return;
    toggle.addEventListener("click", function () {
      var isHidden = flyout.hasAttribute("hidden");
      if (isHidden) {
        flyout.removeAttribute("hidden");
        var input = flyout.querySelector("input[type=search]");
        if (input) input.focus();
      } else {
        flyout.setAttribute("hidden", "");
      }
    });

    var form = flyout.querySelector("form");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var input = form.querySelector("input[type=search]");
        var term = input ? input.value.trim() : "";
        window.location.href = "shop.html" + (term ? "?q=" + encodeURIComponent(term) : "");
      });
    }
  }

  function setYear() {
    var el = document.getElementById("year");
    if (el) el.textContent = new Date().getFullYear();
  }

  document.addEventListener("DOMContentLoaded", function () {
    updateWishlistBadge();
    highlightActiveNav();
    wireMobileNav();
    wireSearchFlyout();
    setYear();
    document.addEventListener("wishlist:change", updateWishlistBadge);
  });
})();
