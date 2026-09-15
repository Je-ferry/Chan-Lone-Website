/**
 * Identifies which GitHub repo admin.html should read/write via the GitHub
 * REST API. This is PUBLIC by design — it just names the repo, it isn't a
 * secret. The actual credential is the personal access token the shop
 * owner pastes into admin.html itself (stored only in that browser's
 * localStorage, never committed here). Only admin.html loads this file —
 * the customer-facing pages read js/data/products.json directly and never
 * talk to the GitHub API.
 *
 * Follow GITHUB_SETUP.md, then replace both "PASTE_ME" values below with
 * this repository's GitHub username/org and repo name (e.g. the "owner"
 * and "name" in https://github.com/owner/name).
 */
window.CHANLONE_REPO = {
  owner: "Je-ferry",
  name: "Chan-Lone-Website",
  branch: "main"
};
