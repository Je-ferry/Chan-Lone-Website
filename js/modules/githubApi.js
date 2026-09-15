/**
 * Thin wrapper around the GitHub REST "Contents" API — this is admin.html's
 * entire backend. Every admin write is a real git commit to this repo,
 * which GitHub Pages then redeploys automatically. Only admin.html loads
 * this module; customer-facing pages never call the GitHub API.
 */
window.ChanLoneGitHub = (function () {
  var TOKEN_KEY = "chanlone_admin_gh_pat";
  var API_ROOT = "https://api.github.com";

  function getToken() { return localStorage.getItem(TOKEN_KEY); }
  function setToken(token) { localStorage.setItem(TOKEN_KEY, token); }
  function clearToken() { localStorage.removeItem(TOKEN_KEY); }

  function repoBase() {
    var r = window.CHANLONE_REPO;
    return API_ROOT + "/repos/" + r.owner + "/" + r.name;
  }

  function headers(extra) {
    var base = {
      "Authorization": "Bearer " + getToken(),
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28"
    };
    if (extra) {
      Object.keys(extra).forEach(function (k) { base[k] = extra[k]; });
    }
    return base;
  }

  function readErrorBody(res) {
    return res.json().then(function (body) {
      throw new Error(body && body.message ? body.message : ("HTTP " + res.status));
    }, function () {
      throw new Error("HTTP " + res.status);
    });
  }

  // ---- UTF-8-safe base64 (Burmese text-safe; a plain btoa(str) corrupts
  // any character outside Latin-1) ----

  function utf8ToBase64(str) {
    var bytes = new TextEncoder().encode(str);
    var binary = "";
    for (var i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }

  function base64ToUtf8(b64) {
    var binary = atob(b64.replace(/\n/g, ""));
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new TextDecoder("utf-8").decode(bytes);
  }

  // ---- Contents API ----

  function checkAccess() {
    return fetch(repoBase(), { headers: headers() }).then(function (res) {
      if (res.status === 401) throw new Error("INVALID_TOKEN");
      if (res.status === 404) throw new Error("Repository not found — check js/github-config.js and that this token can see it.");
      if (!res.ok) return readErrorBody(res);
      return res.json();
    }).then(function (repo) {
      if (!repo.permissions || !repo.permissions.push) {
        throw new Error("This token doesn't have write access to " + window.CHANLONE_REPO.owner + "/" + window.CHANLONE_REPO.name + ".");
      }
      return true;
    });
  }

  function getFile(path) {
    var url = repoBase() + "/contents/" + path + "?ref=" + window.CHANLONE_REPO.branch + "&_=" + Date.now();
    return fetch(url, { headers: headers(), cache: "no-store" }).then(function (res) {
      if (res.status === 404) return null;
      if (res.status === 401) throw new Error("INVALID_TOKEN");
      if (!res.ok) return readErrorBody(res);
      return res.json();
    }).then(function (body) {
      if (!body) return null;
      return { sha: body.sha, base64: body.content.replace(/\n/g, ""), text: base64ToUtf8(body.content) };
    });
  }

  function putFile(path, base64Content, opts) {
    opts = opts || {};
    var body = {
      message: opts.message || ("Update " + path),
      content: base64Content,
      branch: window.CHANLONE_REPO.branch
    };
    if (opts.sha) body.sha = opts.sha;
    return fetch(repoBase() + "/contents/" + path, {
      method: "PUT",
      headers: headers({ "Content-Type": "application/json" }),
      body: JSON.stringify(body)
    }).then(function (res) {
      if (res.status === 401) throw new Error("INVALID_TOKEN");
      if (res.status === 409) throw new Error("CONFLICT");
      if (!res.ok) return readErrorBody(res);
      return res.json();
    });
  }

  function deleteFile(path, sha, message) {
    return fetch(repoBase() + "/contents/" + path, {
      method: "DELETE",
      headers: headers({ "Content-Type": "application/json" }),
      body: JSON.stringify({
        message: message || ("Delete " + path),
        sha: sha,
        branch: window.CHANLONE_REPO.branch
      })
    }).then(function (res) {
      if (res.status === 401) throw new Error("INVALID_TOKEN");
      if (!res.ok) return readErrorBody(res);
      return res.json();
    });
  }

  return {
    getToken: getToken,
    setToken: setToken,
    clearToken: clearToken,
    checkAccess: checkAccess,
    getFile: getFile,
    putFile: putFile,
    deleteFile: deleteFile,
    utf8ToBase64: utf8ToBase64,
    base64ToUtf8: base64ToUtf8
  };
})();
