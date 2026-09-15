# GitHub Admin Setup — one-time, ~5 minutes

This connects `admin.html` to this project's own GitHub repo: once set up,
adding/editing/deleting products and photos in `admin.html` commits directly
to the repo and goes live on GitHub Pages shortly after — no separate
backend, no `git push` needed for catalog changes.

## 1. Fill in the repo details

Open `js/github-config.js` and replace both `"PASTE_ME"` values with this
repository's GitHub username/org and repo name — the two parts of
`https://github.com/<owner>/<name>`:

```js
window.CHANLONE_REPO = {
  owner: "your-github-username",
  name: "chan-lone-website",
  branch: "main"
};
```

This file is safe to commit/deploy as-is — it just names the repo, it isn't
a secret.

## 2. Create a personal access token (this IS a secret)

1. On GitHub, go to **Settings → Developer settings → Personal access
   tokens → Fine-grained tokens → Generate new token**.
2. **Resource owner**: the account that owns this repo.
3. **Repository access**: choose **Only select repositories**, then pick
   this one repo. Do **not** choose "All repositories."
4. **Permissions → Repository permissions**: set **Contents** to
   **Read and write**. Leave everything else at "No access."
5. Generate the token and copy it (starts with `github_pat_...`) — GitHub
   only shows it once.

Scoping the token this way means that even if it ever leaked, it could only
touch this one repo's files — nothing else in your GitHub account.

## 3. Connect admin.html

1. Open `admin.html` in your browser.
2. Paste the token into the connect box and click **Connect**.
3. The token is stored only in that browser's local storage — you'll need
   to reconnect (paste it again) if you clear browser data or use a
   different computer/browser.

## 4. Try it

- Click **Import Starter Catalog** to load 28 placeholder products you can
  edit or delete, or click **+ Add New Product** to start fresh.
- Open `index.html` or `shop.html` — your products load from
  `js/data/products.json`.

## Ongoing use

- Editing products or photos in `admin.html` commits straight to the repo
  and goes live on GitHub Pages within about a minute (Pages redeploys on
  every commit). The admin dashboard itself always shows your latest edits
  immediately, since it reads directly from GitHub's API.
- You only need to `git push` (see `README.md`) when you change actual site
  code/design — not for catalog changes.

## Troubleshooting

- **"That token isn't valid" / "Your token is invalid or expired"**: the
  token was revoked, expired, or mistyped — generate a new one (step 2) and
  reconnect.
- **"This token doesn't have write access to ..."**: the token exists but
  wasn't scoped to this repo, or Contents permission wasn't set to
  "Read and write" — regenerate it following step 2 exactly.
- **"Someone else (or another tab) changed the catalog"**: another admin
  session saved in between your load and save. Reload the page and redo
  the change — there's no data loss, just a rare race since this is a
  single-admin tool.

## Photo storage

Photos are committed as real image files under `images/products/<id>/`,
compressed client-side in the browser first (via `<canvas>`) so an
original phone photo doesn't balloon the repo. There's no per-document
size cap like a database would have — just keep source photos reasonable
(a normal phone photo is fine) and the admin will handle the rest.

## Rate limits

Authenticated GitHub API requests are capped at 5,000/hour. A single
save/upload/delete action uses at most 2-3 requests, so this is a
non-issue for one shop owner's day-to-day editing.
