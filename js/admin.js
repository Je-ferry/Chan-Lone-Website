/**
 * Product Admin — developer-only tool (admin.html). Real backend: none —
 * this page commits directly to this project's own GitHub repo via the
 * GitHub REST "Contents" API, using a personal access token pasted in once
 * and kept only in this browser's localStorage (see js/modules/githubApi.js).
 * Product data lives in js/data/products.json; photos are real files
 * committed under images/products/<id>/. GitHub Pages redeploys
 * automatically on every commit — no separate server, no git/terminal step
 * for the shop owner. Security is simply: don't share the token, and scope
 * it (see GITHUB_SETUP.md) to Contents-only access on this one repo.
 */
document.addEventListener("DOMContentLoaded", function () {
  var U = window.ChanLoneUtils;
  var GH = window.ChanLoneGitHub;
  var PRODUCTS_PATH = "js/data/products.json";

  var notConfiguredSection = document.getElementById("admin-not-configured");
  var loginSection = document.getElementById("admin-login");
  var loginForm = document.getElementById("admin-login-form");
  var loginError = document.getElementById("admin-login-error");
  var loginSubmitBtn = document.getElementById("admin-login-submit");
  var tokenInput = document.getElementById("admin-token");
  var userEmailEl = document.getElementById("admin-user-email");
  var logoutBtn = document.getElementById("admin-logout");
  var dashboardSection = document.getElementById("admin-dashboard");

  var searchInput = document.getElementById("admin-search");
  var statusEl = document.getElementById("admin-status");
  var grid = document.getElementById("admin-grid");
  var emptyNote = document.getElementById("admin-empty");
  var addBtn = document.getElementById("admin-add-product");
  var importBtn = document.getElementById("admin-import-seed");
  var cardTemplate = document.getElementById("admin-card-template");

  var repoCfg = window.CHANLONE_REPO;
  if (!repoCfg || repoCfg.owner === "PASTE_ME" || repoCfg.name === "PASTE_ME") {
    notConfiguredSection.hidden = false;
    return;
  }

  // ---- Connect / disconnect ----

  function resetToLogin(message) {
    GH.clearToken();
    dashboardSection.hidden = true;
    loginSection.hidden = false;
    userEmailEl.hidden = true;
    logoutBtn.hidden = true;
    tokenInput.value = "";
    if (message) {
      loginError.textContent = message;
      loginError.hidden = false;
    } else {
      loginError.hidden = true;
    }
  }

  function showDashboard() {
    loginSection.hidden = true;
    dashboardSection.hidden = false;
    userEmailEl.textContent = "Connected to " + repoCfg.owner + "/" + repoCfg.name;
    userEmailEl.hidden = false;
    logoutBtn.hidden = false;
    loadProducts();
  }

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var token = tokenInput.value.trim();
    if (!token) return;
    loginError.hidden = true;
    loginSubmitBtn.disabled = true;
    loginSubmitBtn.textContent = "Connecting…";
    GH.setToken(token);
    GH.checkAccess().then(function () {
      showDashboard();
    }).catch(function (err) {
      GH.clearToken();
      loginError.textContent = err.message === "INVALID_TOKEN" ? "That token isn't valid." : err.message;
      loginError.hidden = false;
    }).finally(function () {
      loginSubmitBtn.disabled = false;
      loginSubmitBtn.textContent = "Connect";
    });
  });

  logoutBtn.addEventListener("click", function () {
    resetToLogin();
  });

  function handleWriteError(err, prefix) {
    if (err && err.message === "INVALID_TOKEN") {
      resetToLogin("Your token is invalid or expired — reconnect.");
      return;
    }
    if (err && err.message === "CONFLICT") {
      alert("Someone else (or another tab) changed the catalog. Reload the page and try again.");
      return;
    }
    alert((prefix || "Something went wrong") + ": " + (err && err.message ? err.message : err));
  }

  if (GH.getToken()) {
    GH.checkAccess().then(showDashboard).catch(function (err) {
      resetToLogin(err.message === "INVALID_TOKEN" ? "Your saved token is no longer valid — reconnect." : "Couldn't connect: " + err.message);
    });
  } else {
    loginSection.hidden = false;
  }

  // ---- Photo compression (photos become real committed files, so there's
  // no ~1MB Firestore-document ceiling to fit under — just a sensible cap
  // to keep page-load weight and repo size reasonable, and to stay safely
  // under GitHub's own per-file size limits) ----

  var MAX_IMAGE_CHARS = 1300000; // ~975KB raw per photo

  function resizeFileToDataUrl(file, maxDim, quality) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onerror = function () { reject(new Error("Couldn't read that file.")); };
      reader.onload = function () {
        var img = new Image();
        img.onerror = function () { reject(new Error("Couldn't decode that image.")); };
        img.onload = function () {
          var scale = Math.min(1, maxDim / Math.max(img.width, img.height));
          var canvas = document.createElement("canvas");
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function compressImageToFit(file) {
    var attempts = [
      { maxDim: 1600, quality: 0.82 },
      { maxDim: 1400, quality: 0.78 },
      { maxDim: 1200, quality: 0.72 },
      { maxDim: 1000, quality: 0.65 },
      { maxDim: 800, quality: 0.55 }
    ];
    function tryAttempt(i) {
      if (i >= attempts.length) {
        return Promise.reject(new Error("This photo is too large/detailed to fit — try a smaller or simpler image."));
      }
      return resizeFileToDataUrl(file, attempts[i].maxDim, attempts[i].quality).then(function (dataUrl) {
        return dataUrl.length <= MAX_IMAGE_CHARS ? dataUrl : tryAttempt(i + 1);
      });
    }
    return tryAttempt(0);
  }

  // ---- Product list ----

  var products = []; // [{ id, ...fields }]

  function loadProducts() {
    statusEl.textContent = "Loading…";
    GH.getFile(PRODUCTS_PATH).then(function (file) {
      products = file ? JSON.parse(file.text) : [];
      renderGrid();
    }).catch(function (err) {
      if (err.message === "INVALID_TOKEN") { resetToLogin("Your token is invalid or expired — reconnect."); return; }
      statusEl.textContent = "Couldn't load products: " + err.message;
    });
  }

  // Re-fetches the current products.json fresh, lets `mutate` compute the
  // new array from it, then commits that array back. Single admin, so this
  // just re-reads immediately before writing rather than doing any merge —
  // on a genuine 409 (e.g. another tab saved in between) it surfaces a
  // plain "reload and try again" message.
  function commitProducts(mutate, message) {
    return GH.getFile(PRODUCTS_PATH).then(function (file) {
      var current = file ? JSON.parse(file.text) : [];
      var updated = mutate(current);
      var content = GH.utf8ToBase64(JSON.stringify(updated, null, 2));
      var opts = { message: message };
      if (file) opts.sha = file.sha;
      return GH.putFile(PRODUCTS_PATH, content, opts).then(function () {
        products = updated;
        return updated;
      });
    });
  }

  function slugify(name) {
    return (name || "product").toLowerCase().trim()
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "product";
  }

  function generateProductId(name, existingIds) {
    var base = slugify(name);
    var id = base, n = 2;
    while (existingIds.indexOf(id) !== -1) { id = base + "-" + n; n++; }
    return id;
  }

  function renderGrid() {
    grid.innerHTML = "";
    products.forEach(function (product) {
      grid.appendChild(createCard(product));
    });
    emptyNote.hidden = products.length > 0;
    statusEl.textContent = products.length + " product" + (products.length === 1 ? "" : "s");
    applySearch();
  }

  function populateSelect(select, list, selected) {
    select.innerHTML = list.map(function (item) {
      return '<option value="' + item.id + '"' + (item.id === selected ? " selected" : "") + ">" + U.escapeHtml(item.label) + "</option>";
    }).join("");
  }

  function renderMedia(card, product) {
    var mediaEl = card.querySelector("[data-media]");
    mediaEl.innerHTML = (product.images && product.images.length)
      ? '<img src="' + product.images[0] + '" alt="">'
      : window.ChanLoneRender.placeholderMedia(product);
  }

  function renderThumbs(card, product) {
    var thumbsEl = card.querySelector("[data-thumbs]");
    thumbsEl.innerHTML = "";
    (product.images || []).forEach(function (path, idx) {
      var thumb = document.createElement("div");
      thumb.className = "admin-card__thumb";
      thumb.innerHTML = '<img src="' + path + '" alt=""><button type="button" aria-label="Remove photo">&times;</button>';
      thumb.querySelector("button").addEventListener("click", function () {
        removeImage(product, idx, card);
      });
      thumbsEl.appendChild(thumb);
    });
  }

  function createCard(product) {
    var card = cardTemplate.content.firstElementChild.cloneNode(true);
    card.dataset.id = product.id;

    renderMedia(card, product);
    renderThumbs(card, product);

    populateSelect(card.querySelector('[data-field="category"]'), window.CATEGORIES, product.category);
    populateSelect(card.querySelector('[data-field="material"]'), window.MATERIALS, product.material);

    card.querySelector('[data-field="name"]').value = product.name || "";
    card.querySelector('[data-field="nameBurmese"]').value = product.nameBurmese || "";
    card.querySelector('[data-field="isNew"]').checked = !!product.isNew;
    card.querySelector('[data-field="isFeatured"]').checked = !!product.isFeatured;
    card.querySelector('[data-field="shortDescription"]').value = product.shortDescription || "";
    card.querySelector('[data-field="description"]').value = product.description || "";
    card.querySelector('[data-field="tagsText"]').value = (product.tags || []).join(", ");

    var unsavedBadge = card.querySelector("[data-unsaved]");
    card.querySelectorAll("[data-field]").forEach(function (el) {
      el.addEventListener("input", function () { unsavedBadge.hidden = false; });
      el.addEventListener("change", function () { unsavedBadge.hidden = false; });
    });

    card.querySelector("[data-save]").addEventListener("click", function () {
      saveCard(card, product, unsavedBadge);
    });

    card.querySelector("[data-delete]").addEventListener("click", function () {
      deleteProduct(card, product);
    });

    var fileInput = card.querySelector("[data-file-input]");
    var uploadingEl = card.querySelector("[data-uploading]");
    fileInput.addEventListener("change", function () {
      var file = fileInput.files[0];
      if (!file) return;
      uploadingEl.hidden = false;
      compressImageToFit(file).then(function (dataUrl) {
        var base64 = dataUrl.split(",")[1];
        var path = "images/products/" + product.id + "/" + Date.now() + ".jpg";
        return GH.putFile(path, base64, { message: "Add photo for " + (product.name || product.id) }).then(function () {
          return commitProducts(function (current) {
            return current.map(function (p) {
              return p.id === product.id
                ? Object.assign({}, p, { images: (p.images || []).concat([path]), updatedAt: new Date().toISOString() })
                : p;
            });
          }, "Add photo reference for " + (product.name || product.id));
        });
      }).then(function (updated) {
        var updatedProduct = updated.find(function (p) { return p.id === product.id; });
        Object.assign(product, updatedProduct);
        renderMedia(card, product);
        renderThumbs(card, product);
      }).catch(function (err) {
        handleWriteError(err, "Photo upload failed");
      }).finally(function () {
        uploadingEl.hidden = true;
        fileInput.value = "";
      });
    });

    return card;
  }

  function saveCard(card, product, unsavedBadge) {
    var saveBtn = card.querySelector("[data-save]");
    var tagsText = card.querySelector('[data-field="tagsText"]').value;
    var fields = {
      name: card.querySelector('[data-field="name"]').value.trim(),
      nameBurmese: card.querySelector('[data-field="nameBurmese"]').value.trim(),
      category: card.querySelector('[data-field="category"]').value,
      material: card.querySelector('[data-field="material"]').value,
      isNew: card.querySelector('[data-field="isNew"]').checked,
      isFeatured: card.querySelector('[data-field="isFeatured"]').checked,
      shortDescription: card.querySelector('[data-field="shortDescription"]').value.trim(),
      description: card.querySelector('[data-field="description"]').value.trim(),
      tags: tagsText.split(",").map(function (t) { return t.trim(); }).filter(Boolean),
      updatedAt: new Date().toISOString()
    };
    saveBtn.disabled = true;
    saveBtn.textContent = "Saving…";
    commitProducts(function (current) {
      return current.map(function (p) { return p.id === product.id ? Object.assign({}, p, fields) : p; });
    }, "Update " + (fields.name || product.id)).then(function () {
      Object.assign(product, fields);
      unsavedBadge.hidden = true;
    }).catch(function (err) {
      handleWriteError(err, "Couldn't save");
    }).finally(function () {
      saveBtn.disabled = false;
      saveBtn.textContent = "Save";
    });
  }

  function removeImage(product, idx, card) {
    if (!confirm("Remove this photo?")) return;
    var path = product.images[idx];
    commitProducts(function (current) {
      return current.map(function (p) {
        if (p.id !== product.id) return p;
        var imgs = p.images.slice(0, idx).concat(p.images.slice(idx + 1));
        return Object.assign({}, p, { images: imgs, updatedAt: new Date().toISOString() });
      });
    }, "Remove photo from " + (product.name || product.id)).then(function (updated) {
      var updatedProduct = updated.find(function (p) { return p.id === product.id; });
      Object.assign(product, updatedProduct);
      renderMedia(card, product);
      renderThumbs(card, product);
      GH.getFile(path).then(function (file) {
        if (file) return GH.deleteFile(path, file.sha, "Delete removed image " + path);
      }).catch(function (err) {
        console.warn("Could not delete orphaned image file", path, err);
      });
    }).catch(function (err) {
      handleWriteError(err, "Couldn't remove photo");
    });
  }

  function deleteProduct(card, product) {
    if (!confirm('Delete "' + (product.name || "this product") + '"? This cannot be undone.')) return;
    var deleteBtn = card.querySelector("[data-delete]");
    deleteBtn.disabled = true;
    deleteBtn.textContent = "Deleting…";
    var imagesToDelete = (product.images || []).slice();
    commitProducts(function (current) {
      return current.filter(function (p) { return p.id !== product.id; });
    }, "Delete " + (product.name || product.id)).then(function () {
      card.remove();
      emptyNote.hidden = products.length > 0;
      statusEl.textContent = products.length + " product" + (products.length === 1 ? "" : "s");
      imagesToDelete.forEach(function (path) {
        GH.getFile(path).then(function (file) {
          if (file) return GH.deleteFile(path, file.sha, "Remove orphaned image " + path);
        }).catch(function (err) {
          console.warn("Could not delete orphaned image file", path, err);
        });
      });
    }).catch(function (err) {
      handleWriteError(err, "Couldn't delete");
      deleteBtn.disabled = false;
      deleteBtn.textContent = "Delete";
    });
  }

  // ---- Add / Import ----

  addBtn.addEventListener("click", function () {
    addBtn.disabled = true;
    var newProduct = null;
    commitProducts(function (current) {
      var existingIds = current.map(function (p) { return p.id; });
      var id = generateProductId("New Product", existingIds);
      var now = new Date().toISOString();
      newProduct = {
        id: id,
        name: "New Product",
        nameBurmese: "",
        category: window.CATEGORIES[0].id,
        material: window.MATERIALS[0].id,
        isNew: true,
        isFeatured: false,
        images: [],
        shortDescription: "",
        description: "",
        tags: [],
        createdAt: now,
        updatedAt: now
      };
      return [newProduct].concat(current);
    }, "Add product").then(function () {
      var card = createCard(newProduct);
      grid.prepend(card);
      emptyNote.hidden = true;
      statusEl.textContent = products.length + " product" + (products.length === 1 ? "" : "s");
      var nameField = card.querySelector('[data-field="name"]');
      nameField.focus();
      nameField.select();
    }).catch(function (err) {
      handleWriteError(err, "Couldn't create product");
    }).finally(function () {
      addBtn.disabled = false;
    });
  });

  importBtn.addEventListener("click", function () {
    if (!window.SEED_PRODUCTS || !window.SEED_PRODUCTS.length) return;
    if (!confirm("Import " + window.SEED_PRODUCTS.length + " starter placeholder products? You can edit or delete them afterward.")) return;
    importBtn.disabled = true;
    importBtn.textContent = "Importing…";
    commitProducts(function (current) {
      var existingIds = current.map(function (p) { return p.id; });
      var now = new Date().toISOString();
      var imported = window.SEED_PRODUCTS.map(function (seed) {
        var id = generateProductId(seed.name, existingIds);
        existingIds.push(id);
        return Object.assign({ id: id, createdAt: now, updatedAt: now }, seed);
      });
      return current.concat(imported);
    }, "Import starter catalog (" + window.SEED_PRODUCTS.length + " products)").then(function () {
      renderGrid();
    }).catch(function (err) {
      handleWriteError(err, "Import failed");
    }).finally(function () {
      importBtn.disabled = false;
      importBtn.textContent = "Import Starter Catalog";
    });
  });

  // ---- Search ----

  function applySearch() {
    var q = searchInput.value.trim().toLowerCase();
    grid.querySelectorAll(".admin-card").forEach(function (card) {
      if (!q) { card.hidden = false; return; }
      var name = card.querySelector('[data-field="name"]').value.toLowerCase();
      var nameBurmese = card.querySelector('[data-field="nameBurmese"]').value.toLowerCase();
      var hay = name + " " + nameBurmese + " " + card.dataset.id.toLowerCase();
      card.hidden = hay.indexOf(q) === -1;
    });
  }

  searchInput.addEventListener("input", U.debounce(applySearch, 150));
});
