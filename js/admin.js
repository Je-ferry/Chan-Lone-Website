/**
 * Product Admin — developer-only tool (admin.html). Real backend: Firebase
 * Auth gates sign-in, Firestore stores product documents, Storage holds
 * photos. Security is enforced server-side by the Firestore/Storage rules
 * (see FIREBASE_SETUP.md) — this file has no password/secret of its own.
 */
document.addEventListener("DOMContentLoaded", function () {
  var U = window.ChanLoneUtils;

  var notConfiguredSection = document.getElementById("admin-not-configured");
  var loginSection = document.getElementById("admin-login");
  var loginForm = document.getElementById("admin-login-form");
  var loginError = document.getElementById("admin-login-error");
  var emailInput = document.getElementById("admin-email");
  var passwordInput = document.getElementById("admin-password");
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

  var cfg = window.firebase.apps[0] && window.firebase.apps[0].options;
  if (!cfg || cfg.apiKey === "PASTE_ME") {
    notConfiguredSection.hidden = false;
    return;
  }

  var auth = window.firebase.auth();
  var db = window.firebase.firestore();
  var storage = window.firebase.storage();

  // ---- Auth ----

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    loginError.hidden = true;
    auth.signInWithEmailAndPassword(emailInput.value.trim(), passwordInput.value)
      .catch(function (err) {
        loginError.textContent = friendlyAuthError(err);
        loginError.hidden = false;
      });
  });

  logoutBtn.addEventListener("click", function () {
    auth.signOut();
  });

  function friendlyAuthError(err) {
    switch (err.code) {
      case "auth/invalid-email": return "That doesn't look like a valid email address.";
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential": return "Incorrect email or password.";
      case "auth/too-many-requests": return "Too many attempts. Please wait a moment and try again.";
      default: return err.message;
    }
  }

  auth.onAuthStateChanged(function (user) {
    if (user) {
      loginSection.hidden = true;
      dashboardSection.hidden = false;
      userEmailEl.textContent = user.email;
      userEmailEl.hidden = false;
      logoutBtn.hidden = false;
      loadProducts();
    } else {
      loginSection.hidden = false;
      dashboardSection.hidden = true;
      userEmailEl.hidden = true;
      logoutBtn.hidden = true;
      passwordInput.value = "";
    }
  });

  // ---- Product list ----

  var products = []; // [{ id, ...fields }]

  function loadProducts() {
    statusEl.textContent = "Loading…";
    db.collection("products").get().then(function (snapshot) {
      products = snapshot.docs.map(function (doc) {
        var data = doc.data();
        data.id = doc.id;
        return data;
      });
      renderGrid();
    }).catch(function (err) {
      statusEl.textContent = "Couldn't load products: " + err.message;
    });
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
    (product.images || []).forEach(function (url, idx) {
      var thumb = document.createElement("div");
      thumb.className = "admin-card__thumb";
      thumb.innerHTML = '<img src="' + url + '" alt=""><button type="button" aria-label="Remove photo">&times;</button>';
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
      var path = "product-images/" + product.id + "/" + Date.now() + "_" + file.name;
      var ref = storage.ref(path);
      ref.put(file).then(function () {
        return ref.getDownloadURL();
      }).then(function (url) {
        product.images = (product.images || []).concat([url]);
        return db.collection("products").doc(product.id).update({ images: product.images });
      }).then(function () {
        renderMedia(card, product);
        renderThumbs(card, product);
      }).catch(function (err) {
        alert("Photo upload failed: " + err.message);
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
    var updates = {
      name: card.querySelector('[data-field="name"]').value.trim(),
      nameBurmese: card.querySelector('[data-field="nameBurmese"]').value.trim(),
      category: card.querySelector('[data-field="category"]').value,
      material: card.querySelector('[data-field="material"]').value,
      isNew: card.querySelector('[data-field="isNew"]').checked,
      isFeatured: card.querySelector('[data-field="isFeatured"]').checked,
      shortDescription: card.querySelector('[data-field="shortDescription"]').value.trim(),
      description: card.querySelector('[data-field="description"]').value.trim(),
      tags: tagsText.split(",").map(function (t) { return t.trim(); }).filter(Boolean),
      updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
    };
    saveBtn.disabled = true;
    saveBtn.textContent = "Saving…";
    db.collection("products").doc(product.id).update(updates).then(function () {
      Object.assign(product, updates);
      unsavedBadge.hidden = true;
    }).catch(function (err) {
      alert("Couldn't save: " + err.message);
    }).finally(function () {
      saveBtn.disabled = false;
      saveBtn.textContent = "Save";
    });
  }

  function removeImage(product, idx, card) {
    if (!confirm("Remove this photo?")) return;
    var url = product.images[idx];
    var remaining = product.images.slice(0, idx).concat(product.images.slice(idx + 1));
    db.collection("products").doc(product.id).update({ images: remaining }).then(function () {
      product.images = remaining;
      renderMedia(card, product);
      renderThumbs(card, product);
      return storage.refFromURL(url).delete().catch(function () { /* best effort */ });
    }).catch(function (err) {
      alert("Couldn't remove photo: " + err.message);
    });
  }

  function deleteProduct(card, product) {
    if (!confirm('Delete "' + (product.name || "this product") + '"? This cannot be undone.')) return;
    var deleteBtn = card.querySelector("[data-delete]");
    deleteBtn.disabled = true;
    deleteBtn.textContent = "Deleting…";
    var imageDeletes = (product.images || []).map(function (url) {
      return storage.refFromURL(url).delete().catch(function () { /* best effort */ });
    });
    Promise.all(imageDeletes).then(function () {
      return db.collection("products").doc(product.id).delete();
    }).then(function () {
      products = products.filter(function (p) { return p.id !== product.id; });
      card.remove();
      emptyNote.hidden = products.length > 0;
      statusEl.textContent = products.length + " product" + (products.length === 1 ? "" : "s");
    }).catch(function (err) {
      alert("Couldn't delete: " + err.message);
      deleteBtn.disabled = false;
      deleteBtn.textContent = "Delete";
    });
  }

  // ---- Add / Import ----

  addBtn.addEventListener("click", function () {
    var blank = {
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
      createdAt: window.firebase.firestore.FieldValue.serverTimestamp()
    };
    addBtn.disabled = true;
    db.collection("products").add(blank).then(function (docRef) {
      blank.id = docRef.id;
      products.unshift(blank);
      var card = createCard(blank);
      grid.prepend(card);
      emptyNote.hidden = true;
      statusEl.textContent = products.length + " product" + (products.length === 1 ? "" : "s");
      var nameField = card.querySelector('[data-field="name"]');
      nameField.focus();
      nameField.select();
    }).catch(function (err) {
      alert("Couldn't create product: " + err.message);
    }).finally(function () {
      addBtn.disabled = false;
    });
  });

  importBtn.addEventListener("click", function () {
    if (!window.SEED_PRODUCTS || !window.SEED_PRODUCTS.length) return;
    if (!confirm("Import " + window.SEED_PRODUCTS.length + " starter placeholder products? You can edit or delete them afterward.")) return;
    importBtn.disabled = true;
    importBtn.textContent = "Importing…";
    var batch = db.batch();
    window.SEED_PRODUCTS.forEach(function (seed) {
      var ref = db.collection("products").doc();
      var data = Object.assign({}, seed, { createdAt: window.firebase.firestore.FieldValue.serverTimestamp() });
      batch.set(ref, data);
    });
    batch.commit().then(function () {
      loadProducts();
    }).catch(function (err) {
      alert("Import failed: " + err.message);
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
