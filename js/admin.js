// =============================================================
//  Akhmeteli Winery — Shop Admin
//  Edits js/products.js and uploads award images straight to the
//  GitHub repo via the Contents API. A push triggers Vercel to
//  rebuild, so the live site updates ~1 minute after "Save".
// =============================================================
(function () {
  "use strict";

  // ---- repo / file config ---------------------------------------------------
  const CONFIG = {
    owner: "godeputkaradze",
    repo: "akhmeteli-winery",
    branch: "main",
    dataPath: "js/products.js",
    medalsDir: "assets/medals"
  };
  const TOKEN_KEY = "akh.admin.token";
  const API = "https://api.github.com";

  // ---- field vocabularies ---------------------------------------------------
  const LANGS = [["ka", "ქართული"], ["en", "English"], ["ru", "Русский"]];
  const ML_FIELDS = [
    ["name", "Name"],
    ["style", "Style / subtitle"],
    ["region", "Region"],
    ["aroma", "Description — Aroma"],
    ["taste", "Description — Taste"]
  ];
  const SELECTS = {
    category: ["red", "white", "amber", "spirit"],
    type: ["wine", "chacha", "spirit"],
    sweetness: ["dry", "semi-dry", "semi-sweet", "n/a"],
    method: ["european", "qvevri", "distilled"]
  };
  const TIERS = ["iwsc", "gold", "silver", "bronze"];
  const TIER_LABEL = { iwsc: "IWSC", gold: "Gold", silver: "Silver", bronze: "Bronze" };

  // ---- state ----------------------------------------------------------------
  const state = {
    token: null,
    user: null,
    products: [],
    fileSha: null,
    selected: -1,
    dirty: false
  };

  // ---- tiny DOM helpers -----------------------------------------------------
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  function h(tag, attrs, children) {
    const e = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      if (k === "class") e.className = attrs[k];
      else if (k === "html") e.innerHTML = attrs[k];
      else if (k.startsWith("on") && typeof attrs[k] === "function") e.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] != null && attrs[k] !== false) e.setAttribute(k, attrs[k]);
    }
    (Array.isArray(children) ? children : [children]).forEach(c => {
      if (c == null || c === false) return;
      e.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return e;
  }
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));

  let toastTimer;
  function toast(msg, kind) {
    const t = $("#toast");
    t.textContent = msg;
    t.className = "toast" + (kind ? " toast--" + kind : "");
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (t.hidden = true), kind === "error" ? 7000 : 4000);
  }

  // ---- base64 <-> UTF-8 (Unicode-safe: Georgian/Russian must survive) -------
  function bytesToBase64(bytes) {
    let bin = "";
    const CH = 0x8000;
    for (let i = 0; i < bytes.length; i += CH) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CH));
    return btoa(bin);
  }
  function utf8ToBase64(str) { return bytesToBase64(new TextEncoder().encode(str)); }
  function base64ToUtf8(b64) {
    const bin = atob(String(b64).replace(/\s/g, ""));
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }
  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(bytesToBase64(new Uint8Array(r.result)));
      r.onerror = reject;
      r.readAsArrayBuffer(file);
    });
  }

  // ---- GitHub API -----------------------------------------------------------
  async function gh(path, opts) {
    const res = await fetch(API + path, Object.assign({
      headers: {
        "Authorization": "Bearer " + state.token,
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28"
      }
    }, opts));
    if (!res.ok) {
      let detail = res.status + " " + res.statusText;
      try { const j = await res.json(); if (j.message) detail = j.message; } catch (e) {}
      const err = new Error(detail);
      err.status = res.status;
      throw err;
    }
    return res.status === 204 ? null : res.json();
  }
  function contentsUrl(p) {
    return "/repos/" + CONFIG.owner + "/" + CONFIG.repo + "/contents/" + p.split("/").map(encodeURIComponent).join("/");
  }
  async function getFile(p) {
    return gh(contentsUrl(p) + "?ref=" + encodeURIComponent(CONFIG.branch) + "&t=" + Date.now());
  }
  async function putFile(p, base64, message, sha) {
    const body = { message, content: base64, branch: CONFIG.branch };
    if (sha) body.sha = sha;
    return gh(contentsUrl(p), { method: "PUT", body: JSON.stringify(body) });
  }

  // ---- products.js parse / serialize ---------------------------------------
  // The file is `window.PRODUCTS = <JSON array>;` — anchor on the assignment so
  // comment brackets never confuse the parser.
  function parseProducts(text) {
    const anchor = text.indexOf("window.PRODUCTS");
    const eq = text.indexOf("=", anchor);
    const start = text.indexOf("[", eq);
    const end = text.lastIndexOf("]");
    if (anchor < 0 || start < 0 || end < 0) throw new Error("Could not find PRODUCTS array in " + CONFIG.dataPath);
    return JSON.parse(text.slice(start, end + 1));
  }
  function serializeProducts(list) {
    const header =
      "// Akhmeteli Winery — product catalogue.\n" +
      "// This file is generated/edited by the admin panel (admin.html) and committed to GitHub.\n" +
      "// Shape: window.PRODUCTS = <JSON array>;  (kept as clean JSON so the admin can parse & rewrite it.)\n" +
      "// Each award item has fields: tier (iwsc | gold | silver | bronze), title (display text), image (assets/medals/....png).\n\n";
    // drop transient keys (anything starting with "_") from the JSON
    const json = JSON.stringify(list, (k, v) => (k.charAt(0) === "_" ? undefined : v), 2);
    return header + "window.PRODUCTS =\n" + json + "\n;\n";
  }

  // ---- auth -----------------------------------------------------------------
  async function signIn(token, remember) {
    state.token = token;
    const user = await gh("/user");            // validates the token
    // confirm we can read the repo/file
    const file = await getFile(CONFIG.dataPath);
    state.user = user;
    state.fileSha = file.sha;
    state.products = parseProducts(base64ToUtf8(file.content));
    if (remember) localStorage.setItem(TOKEN_KEY, token);
    enterApp();
  }

  function enterApp() {
    $("#login").hidden = true;
    $("#app").hidden = false;
    $("#repoLabel").textContent = CONFIG.owner + "/" + CONFIG.repo + " · " + CONFIG.branch + " · @" + (state.user.login || "");
    renderList();
    if (state.products.length) selectWine(0);
  }

  function signOut() {
    localStorage.removeItem(TOKEN_KEY);
    location.reload();
  }

  // ---- list -----------------------------------------------------------------
  function tf(field) {
    if (!field) return "";
    return field.en || field.ka || field.ru || "";
  }
  function renderList() {
    const q = ($("#search").value || "").trim().toLowerCase();
    const ul = $("#wineList");
    ul.innerHTML = "";
    state.products.forEach((p, i) => {
      const label = tf(p.name) || p.id || "(untitled)";
      if (q && !(label.toLowerCase().includes(q) || (p.id || "").toLowerCase().includes(q))) return;
      const li = h("li", {
        class: "winelist__item" + (i === state.selected ? " is-active" : ""),
        onclick: () => maybeSwitch(i)
      }, [
        h("span", { class: "winelist__dot", style: "background:" + (p.color || "#888") }),
        h("span", { class: "winelist__name" }, label),
        p.awards && p.awards.length ? h("span", { class: "winelist__awards" }, "★" + p.awards.length) : null
      ]);
      ul.appendChild(li);
    });
    if (!ul.children.length) ul.appendChild(h("li", { class: "winelist__empty" }, "No matches."));
  }

  function maybeSwitch(i) {
    if (i === state.selected) return;
    selectWine(i);
  }

  // ---- editor ---------------------------------------------------------------
  function selectWine(i) {
    state.selected = i;
    renderList();
    renderEditor();
  }

  function markDirty() {
    state.dirty = true;
    $("#dirtyDot").hidden = false;
    $("#saveBtn").disabled = false;
  }

  function fieldRow(labelText, control) {
    return h("label", { class: "field" }, [h("span", { class: "field__label" }, labelText), control]);
  }

  function renderEditor() {
    const ed = $("#editor");
    const p = state.products[state.selected];
    if (!p) { ed.innerHTML = '<div class="editor__empty">Select a wine on the left, or create a new one.</div>'; return; }
    ed.innerHTML = "";

    const head = h("div", { class: "editor__head" }, [
      h("div", {}, [
        h("h2", { class: "editor__title" }, tf(p.name) || p.id || "New wine"),
        h("code", { class: "editor__id" }, "id: " + (p.id || "—"))
      ]),
      h("button", { class: "btn btn--danger btn--sm", onclick: () => deleteWine() }, "Delete wine")
    ]);
    ed.appendChild(head);

    // --- identity block ---
    const idBlock = h("div", { class: "grid grid--2" }, [
      fieldRow("ID / slug", textInput(p.id, v => { p.id = p.slug = slugify(v); markDirty(); refreshHead(); })),
      fieldRow("Accent colour", colorInput(p.color, v => { p.color = v; markDirty(); }))
    ]);
    ed.appendChild(section("Identity", idBlock));

    // --- classification selects ---
    const cls = h("div", { class: "grid grid--2" }, Object.keys(SELECTS).map(key =>
      fieldRow(cap(key), selectInput(SELECTS[key], p[key], v => { p[key] = v; markDirty(); }))
    ));
    ed.appendChild(section("Classification", cls));

    // --- pricing + specs ---
    const specs = h("div", { class: "grid grid--3" }, [
      fieldRow("Price", numInput(p.price, v => { p.price = v; markDirty(); }, 0.01)),
      fieldRow("Sale % (blank = none)", numInput(p.sale, v => { if (v) p.sale = v; else delete p.sale; markDirty(); }, 1)),
      fieldRow("Grape", textInput(p.grape, v => { p.grape = v; markDirty(); })),
      fieldRow("Vintage (blank = N/A)", numInput(p.vintage, v => { p.vintage = (v === "" || v == null) ? null : v; markDirty(); }, 1)),
      fieldRow("ABV %", numInput(p.abv, v => { p.abv = v; markDirty(); }, 0.1)),
      fieldRow("Volume (ml)", numInput(p.volume, v => { p.volume = v; markDirty(); }, 1)),
      fieldRow("Serving temp", textInput(p.serve, v => { p.serve = v; markDirty(); }))
    ]);
    ed.appendChild(section("Pricing & specs", specs));

    // --- multilingual fields ---
    ML_FIELDS.forEach(([key, label]) => {
      if (!p[key] || typeof p[key] !== "object") p[key] = { ka: "", en: "", ru: "" };
      const isLong = key === "aroma" || key === "taste";
      const rows = h("div", { class: "grid grid--3" }, LANGS.map(([code, lname]) =>
        fieldRow(lname, (isLong ? textArea : textInput)(p[key][code], v => { p[key][code] = v; markDirty(); if (key === "name") refreshHead(); }))
      ));
      ed.appendChild(section(label, rows));
    });

    // --- awards ---
    ed.appendChild(renderAwards(p));

    function refreshHead() {
      $(".editor__title", head).textContent = tf(p.name) || p.id || "New wine";
      $(".editor__id", head).textContent = "id: " + (p.id || "—");
      renderList();
    }
  }

  function section(title, body) {
    return h("section", { class: "block" }, [h("h3", { class: "block__title" }, title), body]);
  }

  // --- award editor ---
  function renderAwards(p) {
    if (!Array.isArray(p.awards)) p.awards = [];
    const wrap = h("div", { class: "awards" });

    function redraw() {
      wrap.innerHTML = "";
      if (!p.awards.length) wrap.appendChild(h("p", { class: "awards__empty" }, "No award labels yet."));
      p.awards.forEach((a, idx) => wrap.appendChild(awardRow(p, a, idx, redraw)));
      wrap.appendChild(h("button", {
        class: "btn btn--ghost btn--sm", onclick: () => {
          p.awards.push({ tier: "iwsc", title: "IWSC", image: "" });
          markDirty(); redraw();
        }
      }, "+ Add award label"));
    }
    redraw();
    return section("Awards / medals", wrap);
  }

  function awardRow(p, a, idx, redraw) {
    const preview = a._preview || a.image || "";
    return h("div", { class: "award" }, [
      h("div", { class: "award__main" }, [
        selectInput(TIERS, a.tier, v => { a.tier = v; if (!a._touchedTitle && !a.image) { a.title = TIER_LABEL[v]; } markDirty(); redraw(); }, TIER_LABEL),
        h("input", {
          class: "input award__title", type: "text", value: a.title || "", placeholder: "Label text, e.g. IWSC Bronze 2025",
          oninput: e => { a.title = e.target.value; a._touchedTitle = true; markDirty(); }
        }),
        h("button", { class: "btn btn--danger btn--xs", title: "Remove", onclick: () => { p.awards.splice(idx, 1); markDirty(); redraw(); } }, "✕")
      ]),
      h("div", { class: "award__media" }, [
        preview
          ? h("img", { class: "award__thumb", src: preview, alt: "" })
          : h("span", { class: "award__thumb award__thumb--empty award-badge award-badge--" + (a.tier || "iwsc") }, [h("span", { class: "award-badge__medal" })]),
        h("label", { class: "btn btn--ghost btn--xs award__upload" }, [
          "Upload picture",
          h("input", {
            type: "file", accept: "image/*", hidden: "hidden",
            onchange: e => onAwardImage(e.target.files[0], p, a, redraw)
          })
        ]),
        (a.image || a._preview) ? h("button", { class: "btn btn--ghost btn--xs", onclick: () => { delete a._file; delete a._preview; a.image = ""; markDirty(); redraw(); } }, "Remove picture") : null
      ])
    ]);
  }

  function onAwardImage(file, p, a, redraw) {
    if (!file) return;
    if (!/^image\//.test(file.type)) { toast("Please choose an image file.", "error"); return; }
    if (file.size > 5 * 1024 * 1024) { toast("Image is larger than 5 MB — please use a smaller one.", "error"); return; }
    const ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
    a._file = file;
    a._filename = CONFIG.medalsDir + "/" + slugify(p.id || "wine") + "-" + (a.tier || "award") + "-" + Date.now() + "." + ext;
    const r = new FileReader();
    r.onload = () => { a._preview = r.result; markDirty(); redraw(); };
    r.readAsDataURL(file);
  }

  // ---- form controls --------------------------------------------------------
  function textInput(val, on) {
    return h("input", { class: "input", type: "text", value: val == null ? "" : val, oninput: e => on(e.target.value) });
  }
  function textArea(val, on) {
    return h("textarea", { class: "input input--area", rows: "3", oninput: e => on(e.target.value) }, val == null ? "" : String(val));
  }
  function numInput(val, on, step) {
    return h("input", {
      class: "input", type: "number", step: step || "any", value: (val == null ? "" : val),
      oninput: e => on(e.target.value === "" ? "" : parseFloat(e.target.value))
    });
  }
  function colorInput(val, on) {
    const wrap = h("span", { class: "colorwrap" });
    const swatch = h("input", { class: "colorwrap__pick", type: "color", value: /^#[0-9a-f]{6}$/i.test(val || "") ? val : "#7a1f2b", oninput: e => { txt.value = e.target.value; on(e.target.value); } });
    const txt = h("input", { class: "input colorwrap__hex", type: "text", value: val || "", oninput: e => { if (/^#[0-9a-f]{6}$/i.test(e.target.value)) swatch.value = e.target.value; on(e.target.value); } });
    wrap.appendChild(swatch); wrap.appendChild(txt);
    return wrap;
  }
  function selectInput(opts, val, on, labels) {
    const list = opts.slice();
    if (val != null && val !== "" && !list.includes(val)) list.unshift(val);
    return h("select", { class: "input", onchange: e => on(e.target.value) },
      list.map(o => h("option", Object.assign({ value: o }, o === val ? { selected: "selected" } : {}), (labels && labels[o]) || o)));
  }

  // ---- add / delete ---------------------------------------------------------
  function newId(base) {
    let id = slugify(base) || "new-wine";
    const taken = new Set(state.products.map(p => p.id));
    if (!taken.has(id)) return id;
    let n = 2; while (taken.has(id + "-" + n)) n++;
    return id + "-" + n;
  }
  function addWine() {
    const id = newId("new-wine");
    const p = {
      id: id, slug: id, category: "red", type: "wine", sweetness: "dry", method: "european",
      grape: "", vintage: 2023, abv: 12, volume: 750, price: 0, awards: [], color: "#7a1f2b",
      region: { en: "", ka: "", ru: "" }, name: { en: "New wine", ka: "", ru: "" },
      style: { en: "", ka: "", ru: "" }, aroma: { en: "", ka: "", ru: "" }, taste: { en: "", ka: "", ru: "" },
      serve: ""
    };
    state.products.push(p);
    markDirty();
    selectWine(state.products.length - 1);
    toast("New wine added — fill it in and Save.");
  }
  function deleteWine() {
    const p = state.products[state.selected];
    if (!p) return;
    if (!confirm('Delete "' + (tf(p.name) || p.id) + '"? This removes it from the shop after you Save.')) return;
    state.products.splice(state.selected, 1);
    markDirty();
    state.selected = Math.min(state.selected, state.products.length - 1);
    renderList();
    renderEditor();
  }

  // ---- save -----------------------------------------------------------------
  async function save() {
    if (!state.dirty) { toast("Nothing to save."); return; }
    const btn = $("#saveBtn");
    btn.disabled = true; const label = btn.textContent; btn.textContent = "Saving…";
    try {
      // 1) upload any newly-picked award images (one commit each)
      const pending = [];
      state.products.forEach(p => (p.awards || []).forEach(a => { if (a._file) pending.push([p, a]); }));
      for (let i = 0; i < pending.length; i++) {
        const [p, a] = pending[i];
        btn.textContent = "Uploading image " + (i + 1) + "/" + pending.length + "…";
        const b64 = await fileToBase64(a._file);
        const res = await putFile(a._filename, b64, "admin: award image for " + (p.id || "wine"));
        a.image = res.content.path;      // e.g. "assets/medals/kisi-gold-123.png"
        delete a._file; delete a._preview; delete a._filename;
      }
      // 2) commit the catalogue
      btn.textContent = "Publishing…";
      const text = serializeProducts(state.products);
      const res = await putFile(CONFIG.dataPath, utf8ToBase64(text), "admin: update shop catalogue", state.fileSha);
      state.fileSha = res.content.sha;
      state.dirty = false;
      $("#dirtyDot").hidden = true;
      toast("Saved. The live site will update in about a minute.", "ok");
      renderEditor();
    } catch (err) {
      console.error(err);
      if (err.status === 409) toast("Save conflict — the file changed on GitHub. Reload the admin and try again.", "error");
      else toast("Save failed: " + err.message, "error");
      btn.disabled = false;
    } finally {
      btn.textContent = label;
      btn.disabled = state.dirty ? false : true;
    }
  }

  // ---- misc -----------------------------------------------------------------
  function slugify(s) {
    return String(s || "").toLowerCase().trim()
      .replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  }
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

  function warnBeforeUnload(e) { if (state.dirty) { e.preventDefault(); e.returnValue = ""; } }

  // ---- wiring ---------------------------------------------------------------
  function boot() {
    // login
    $("#loginBtn").addEventListener("click", doLogin);
    $("#tokenInput").addEventListener("keydown", e => { if (e.key === "Enter") doLogin(); });
    // app actions
    $("#logoutBtn").addEventListener("click", signOut);
    $("#saveBtn").addEventListener("click", save);
    $("#addBtn").addEventListener("click", addWine);
    $("#search").addEventListener("input", renderList);
    window.addEventListener("beforeunload", warnBeforeUnload);

    const saved = localStorage.getItem(TOKEN_KEY);
    if (saved) { $("#tokenInput").value = saved; doLogin(true); }
  }

  async function doLogin(silent) {
    const token = ($("#tokenInput").value || "").trim();
    const remember = $("#rememberToken").checked;
    const msg = $("#loginMsg");
    if (!token) { if (!silent) { msg.hidden = false; msg.textContent = "Please paste a token."; } return; }
    const btn = $("#loginBtn"); btn.disabled = true; const lbl = btn.textContent; btn.textContent = "Signing in…";
    msg.hidden = true;
    try {
      await signIn(token, remember);
    } catch (err) {
      console.error(err);
      msg.hidden = false;
      msg.textContent = err.status === 401 ? "Token rejected (401). Check it and try again."
        : err.status === 404 ? "Repo or file not found — token may lack access to this repository."
        : "Sign-in failed: " + err.message;
      localStorage.removeItem(TOKEN_KEY);
    } finally {
      btn.disabled = false; btn.textContent = lbl;
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
