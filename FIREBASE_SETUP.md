# Firebase Setup — one-time, ~15 minutes

This connects `admin.html` (and the rest of the site) to a real, private
backend: only you can sign in and add/edit/delete products, and every
visitor sees the catalog live, with no code edits or redeploys needed to
add a product going forward.

You need a free Google account. Firebase's free "Spark" plan is more than
enough for this site (tens of thousands of reads/day, several GB of photo
storage) — see the cost note at the bottom.

## 1. Create the Firebase project

1. Go to <https://console.firebase.google.com> and sign in.
2. Click **Add project**, name it (e.g. `chan-lone-jewelery`), and finish
   the wizard (you can disable Google Analytics — not needed here).

## 2. Turn on Authentication and create your one admin account

1. In the left sidebar: **Build → Authentication → Get started**.
2. Under **Sign-in method**, enable the **Email/Password** provider.
3. Go to the **Users** tab → **Add user**. Enter the email and password
   you (only) will use to log into `admin.html`. This is the *only*
   account that will ever be able to change anything — do this step
   before you deploy the site publicly, so nobody else can claim this
   project first.
4. Click into the user you just created and copy its **User UID**
   (a long string like `aB3xY...`). You'll paste this into the security
   rules in step 5 — save it somewhere for now.

## 3. Turn on Firestore (the product database)

1. **Build → Firestore Database → Create database**.
2. Choose **Production mode**, pick any region close to you, click Enable.

## 4. Turn on Storage (product photos)

1. **Build → Storage → Get started**.
2. Keep the default settings, click Done.

## 5. Lock it down with security rules

These rules are what actually makes this secure: anyone can *read* the
catalog (so the public site works), but only your one account (matched by
its UID) can *write*. Replace `<ADMIN_UID>` in both blocks below with the
UID you copied in step 2.4.

**Firestore rules** — go to **Firestore Database → Rules**, replace the
contents with this, then **Publish**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == "<ADMIN_UID>";
    }
  }
}
```

**Storage rules** — go to **Storage → Rules**, replace the contents with
this, then **Publish**:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /product-images/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == "<ADMIN_UID>";
    }
  }
}
```

## 6. Get your web app config

1. Click the gear icon next to "Project Overview" → **Project settings**.
2. Under **Your apps**, click the **`</>`** (web) icon to register a new
   web app. Give it any nickname (e.g. "Chan Lone Website"). You don't
   need Firebase Hosting — just finish the wizard.
3. You'll see a `firebaseConfig` object with `apiKey`, `authDomain`, etc.
   Copy it.

## 7. Paste your config into the site

Open `js/firebase-config.js` in the project and replace every
`"PASTE_ME"` with the matching value from step 6, e.g.:

```js
window.firebase.initializeApp({
  apiKey: "AIzaSy...",
  authDomain: "chan-lone-jewelery.firebaseapp.com",
  projectId: "chan-lone-jewelery",
  storageBucket: "chan-lone-jewelery.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
});
```

This file is safe to commit/deploy as-is — it's not a secret. Security
comes from the rules in step 5, not from hiding this config.

## 8. You're done — try it

1. Open `admin.html` in your browser and sign in with the email/password
   from step 2.3.
2. Click **Import Starter Catalog** to load 28 placeholder products you
   can edit or delete, or click **+ Add New Product** to start fresh.
3. Open `index.html` or `shop.html` — your products now load live from
   Firebase.

## Ongoing use

- Editing products, photos, or captions in `admin.html` goes live
  immediately — no `git push` needed for catalog changes.
- You only need to `git push` (and let GitHub Pages redeploy) when you
  change actual site code/design — see `README.md`.

## Cost

Firebase's free Spark plan includes (per day): ~50,000 Firestore reads,
~20,000 writes, 1 GiB stored; and for Storage, 5 GB stored + 1 GB/day
downloaded, all free. A small jewelry shop's catalog and traffic will
stay well within this — there's no billing to set up.
