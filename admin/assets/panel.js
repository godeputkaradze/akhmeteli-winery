// =============================================================
//  Akhmeteli Winery — shop admin panel
//  Edits the catalogue the shop reads (js/products.js) through api.php.
//  Everything is held in memory until "Save changes"; each save writes a
//  timestamped backup on the server first, so nothing is ever lost.
// =============================================================
(function () {
  "use strict";

  var LANGS = [["ka", "ქართული"], ["en", "English"], ["ru", "Русский"]];
  var IMAGE_SLOTS = [
    ["bottle", "Bottle (shop card)"],
    ["background", "Background"],
    ["grape", "Grape"],
    ["information", "Information"]
  ];
  var TIERS = [["iwsc", "IWSC"], ["gold", "Gold"], ["silver", "Silver"], ["bronze", "Bronze"]];

  var state = {
    products: [],
    enums: {},
    selected: -1,
    dirty: false,
    lang: "ka",
    filter: "",
    newIds: {}     // ids created in this session — their ID stays editable
  };

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (m) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m];
    });
  }

  var toastTimer;
  function toast(msg, kind) {
    var t = $("#toast");
    t.innerHTML = msg;
    t.className = "toast" + (kind ? " toast--" + kind : "");
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, kind === "error" ? 9000 : 3500);
  }

  // ---------- api ----------------------------------------------------------

  function api(action, body, isForm) {
    var opts = { method: "POST", credentials: "same-origin", headers: { "X-CSRF-Token": window.AKH_ADMIN.csrf } };
    if (isForm) {
      opts.body = body;
    } else if (body) {
      opts.headers["Content-Type"] = "application/json";
      opts.body = JSON.stringify(body);
    } else {
      opts.method = "GET";
      delete opts.body;
    }
    return fetch("api.php?action=" + encodeURIComponent(action), opts).then(function (res) {
      return res.json().catch(function () {
        throw new Error("The server returned something unreadable (HTTP " + res.status + ").");
      }).then(function (data) {
        if (!res.ok || data.ok === false) {
          var msg = data.error || ("Request failed (HTTP " + res.status + ")");
          if (data.details && data.details.length) {
            msg += "<ul><li>" + data.details.map(esc).join("</li><li>") + "</li></ul>";
          }
          if (res.status === 401 || res.status === 403) {
            msg += ' — <a href="index.php">sign in again</a>';
          }
          var err = new Error(msg);
          err.handled = true;
          throw err;
        }
        return data;
      });
    });
  }

  function fail(e) { toast(e.handled ? e.message : esc(e.message || String(e)), "error"); }

  // ---------- model helpers ------------------------------------------------

  function tf(field) {
    if (!field) return "";
    return field[state.lang] || field.en || field.ka || field.ru || "";
  }
  function current() { return state.products[state.selected] || null; }

  function markDirty() {
    state.dirty = true;
    $("#btnSave").disabled = false;
    var s = $("#savedState");
    s.textContent = "Unsaved changes";
    s.classList.add("is-dirty");
  }
  function markClean(count) {
    state.dirty = false;
    $("#btnSave").disabled = true;
    var s = $("#savedState");
    s.textContent = count + " wines · all changes saved";
    s.classList.remove("is-dirty");
  }

  function blankProduct() {
    return {
      id: "", slug: "", category: "red", type: "wine", sweetness: "dry",
      method: "european", grape: "", vintage: new Date().getFullYear() - 1,
      abv: 13, volume: 750, price: 0, awards: [], color: "#6b1a2c",
      region: { en: "", ka: "", ru: "" },
      name: { en: "", ka: "", ru: "" },
      style: { en: "", ka: "", ru: "" },
      aroma: { en: "", ka: "", ru: "" },
      taste: { en: "", ka: "", ru: "" },
      serve: ""
    };
  }

  function photoUrl(p, role, bust) {
    if (!p.id) return "";
    var file = (role === "bottle" && p.id === "mukuzani") ? "bottle-trim" : role;
    return "../assets/Products/" + p.id + "/" + file + ".png" + (bust ? "?v=" + bust : "");
  }

  // ---------- product list -------------------------------------------------

  function renderList() {
    var ul = $("#productList");
    var term = state.filter.toLowerCase();
    var html = "";
    state.products.forEach(function (p, i) {
      var name = tf(p.name) || p.id || "(unnamed)";
      var hay = (name + " " + p.id + " " + (p.grape || "")).toLowerCase();
      if (term && hay.indexOf(term) === -1) return;
      html += '<li><button class="list__row' + (i === state.selected ? " is-active" : "") + '" data-i="' + i + '">' +
        '<img class="list__thumb" src="' + esc(photoUrl(p, "bottle")) + '" alt="" onerror="this.style.visibility=\'hidden\'" />' +
        '<span><span class="list__name">' + esc(name) + '</span>' +
        '<span class="list__meta">' + esc(p.id) + " · " + esc(p.category) + "</span></span>" +
        '<span class="list__price">' + Number(p.price || 0).toFixed(2) + " ₾</span>" +
        "</button></li>";
    });
    ul.innerHTML = html || '<li class="list__foot">Nothing matches that search.</li>';
    $$(".list__row", ul).forEach(function (b) {
      b.addEventListener("click", function () { select(+b.dataset.i); });
    });
    $("#listCount").textContent = state.products.length + " wines in the shop";
  }

  function select(i) {
    state.selected = i;
    renderList();
    renderEditor();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ---------- editor -------------------------------------------------------

  function selectHTML(key, value, options) {
    return '<select data-field="' + key + '">' + options.map(function (o) {
      var v = typeof o === "string" ? o : o[0];
      var l = typeof o === "string" ? o : o[1];
      return '<option value="' + esc(v) + '"' + (v === value ? " selected" : "") + ">" + esc(l) + "</option>";
    }).join("") + "</select>";
  }

  function renderEditor() {
    var p = current();
    var box = $("#editor");
    if (!p) {
      box.innerHTML = '<div class="empty"><p>Select a wine on the left, or create a new one.</p></div>';
      return;
    }
    var en = state.enums;
    var isNew = !!state.newIds[p.__key];

    var html =
      '<div class="editor__head">' +
        "<div><h2 class=\"editor__title\">" + esc(tf(p.name) || "(unnamed)") + "</h2>" +
        '<span class="editor__id">' + esc(p.id || "no id yet") + "</span></div>" +
        '<div class="editor__actions">' +
          '<button class="btn btn--small" data-act="up">↑ Up</button>' +
          '<button class="btn btn--small" data-act="down">↓ Down</button>' +
          '<button class="btn btn--small" data-act="dupe">Duplicate</button>' +
          '<a class="btn btn--small" href="../product.html#' + esc(p.id) + '" target="_blank" rel="noopener">View ↗</a>' +
          '<button class="btn btn--small btn--danger" data-act="remove">Remove</button>' +
        "</div>" +
      "</div>";

    // --- identity + specs ---
    html += '<div class="card"><h3>Basics</h3><div class="grid">';
    html += '<label class="field"><span>ID' + (isNew ? "" : " (fixed)") + '</span>' +
      '<input type="text" data-field="id" value="' + esc(p.id) + '"' + (isNew ? "" : " disabled") + ' /></label>';
    html += '<label class="field"><span>Category</span>' + selectHTML("category", p.category, en.category || []) + "</label>";
    html += '<label class="field"><span>Type</span>' + selectHTML("type", p.type, en.type || []) + "</label>";
    html += '<label class="field"><span>Sweetness</span>' + selectHTML("sweetness", p.sweetness, en.sweetness || []) + "</label>";
    html += '<label class="field"><span>Method</span>' + selectHTML("method", p.method, en.method || []) + "</label>";
    html += '<label class="field"><span>Grape</span><input type="text" data-field="grape" value="' + esc(p.grape) + '" /></label>';
    html += '<label class="field"><span>Vintage</span><input type="number" data-field="vintage" value="' + esc(p.vintage) + '" step="1" /></label>';
    html += '<label class="field"><span>ABV %</span><input type="number" data-field="abv" value="' + esc(p.abv) + '" step="0.1" /></label>';
    html += '<label class="field"><span>Volume (ml)</span><input type="number" data-field="volume" value="' + esc(p.volume) + '" step="10" /></label>';
    html += '<label class="field"><span>Serving temp.</span><input type="text" data-field="serve" value="' + esc(p.serve) + '" placeholder="16-18°C" /></label>';
    html += '<label class="field"><span>Colour (bottle graphic)</span><input type="text" data-field="color" value="' + esc(p.color) + '" placeholder="#6b1a2c" /></label>';
    html += "</div>";
    if (!isNew) {
      html += '<p class="list__foot" style="border:0;padding:0">The ID is locked because image folders and links point at it.</p>';
    }
    html += "</div>";

    // --- price ---
    html += '<div class="card"><h3>Price</h3><div class="grid">' +
      '<label class="field"><span>Price (₾)</span><input type="number" data-field="price" value="' + esc(p.price) + '" step="0.01" min="0" /></label>' +
      '<label class="field"><span>Discount %</span><input type="number" data-field="sale" value="' + esc(p.sale || 0) + '" step="1" min="0" max="90" /></label>' +
      "</div>" +
      '<p class="list__foot" style="border:0;padding:0">Leave the discount at 0 for full price. The shop shows the old price struck through when it is above 0.</p>' +
      "</div>";

    // --- translated text ---
    html += '<div class="card"><h3>Names &amp; descriptions</h3><div class="tabs">' +
      LANGS.map(function (l) {
        return '<button class="tab' + (l[0] === state.lang ? " is-active" : "") + '" data-lang="' + l[0] + '">' + l[1] + "</button>";
      }).join("") + "</div>";
    LANGS.forEach(function (l) {
      var code = l[0];
      html += '<div class="lang-pane" data-pane="' + code + '"' + (code === state.lang ? "" : " hidden") + ">" +
        '<label class="field"><span>Name</span><input type="text" data-ml="name" data-lang="' + code + '" value="' + esc((p.name || {})[code]) + '" /></label>' +
        '<label class="field"><span>Style / subtitle</span><input type="text" data-ml="style" data-lang="' + code + '" value="' + esc((p.style || {})[code]) + '" /></label>' +
        '<label class="field"><span>Region</span><input type="text" data-ml="region" data-lang="' + code + '" value="' + esc((p.region || {})[code]) + '" /></label>' +
        '<label class="field"><span>Description — aroma</span><textarea data-ml="aroma" data-lang="' + code + '">' + esc((p.aroma || {})[code]) + "</textarea></label>" +
        '<label class="field"><span>Description — taste</span><textarea data-ml="taste" data-lang="' + code + '">' + esc((p.taste || {})[code]) + "</textarea></label>" +
        "</div>";
    });
    html += "</div>";

    // --- images ---
    html += '<div class="card"><h3>Images</h3><div class="imgs">';
    IMAGE_SLOTS.forEach(function (slot) {
      var url = photoUrl(p, slot[0], p.__bust);
      html += '<div class="img">' +
        '<span class="img__label">' + esc(slot[1]) + "</span>" +
        '<div class="img__frame">' +
          (p.id
            ? '<img src="' + esc(url) + '" alt="" onerror="this.replaceWith(Object.assign(document.createElement(\'span\'),{className:\'missing\',textContent:\'no image yet\'}))" />'
            : '<span class="missing">save the wine first</span>') +
        "</div>" +
        '<button class="btn btn--small" data-upload="' + slot[0] + '"' + (p.id ? "" : " disabled") + ">Upload…</button>" +
        '<span class="img__path">' + esc(p.id ? photoUrl(p, slot[0]).replace("../", "") : "") + "</span>" +
        "</div>";
    });
    html += "</div>" +
      '<p class="list__foot" style="border:0;padding:0.6rem 0 0">PNG keeps transparency around the bottle. JPG/WebP are converted to PNG automatically.</p>' +
      "</div>";

    // --- awards ---
    html += '<div class="card"><h3>Awards &amp; medals</h3>';
    (p.awards || []).forEach(function (a, ai) {
      html += '<div class="award" data-award="' + ai + '">' +
        '<div style="text-align:center">' +
          (a.image ? '<img class="award__medal" src="../' + esc(a.image) + '" alt="" />' : '<span class="missing">no picture</span>') +
          '<br /><button class="btn btn--small" data-medal="' + ai + '">Picture…</button>' +
        "</div>" +
        '<label class="field"><span>Title</span><input type="text" data-award-field="title" data-i="' + ai + '" value="' + esc(a.title) + '" placeholder="IWSC Gold 2026" /></label>' +
        '<label class="field"><span>Tier</span><select data-award-field="tier" data-i="' + ai + '">' +
          TIERS.map(function (t) {
            return '<option value="' + t[0] + '"' + (t[0] === a.tier ? " selected" : "") + ">" + t[1] + "</option>";
          }).join("") + "</select></label>" +
        '<button class="btn btn--small btn--danger" data-award-remove="' + ai + '">Remove</button>' +
        "</div>";
    });
    html += '<button class="btn btn--small" data-act="add-award">+ Add award</button></div>';

    box.innerHTML = html;
    wireEditor(p);
  }

  function wireEditor(p) {
    var box = $("#editor");

    // plain fields
    $$("[data-field]", box).forEach(function (el) {
      el.addEventListener("input", function () {
        var k = el.dataset.field;
        var v = el.value;
        if (k === "vintage" || k === "volume" || k === "sale") v = parseInt(v, 10) || 0;
        else if (k === "abv" || k === "price") v = parseFloat(v) || 0;
        else if (k === "id") { v = String(v).toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/-+/g, "-"); el.value = v; p.slug = v; }
        p[k] = v;
        markDirty();
        if (k === "price" || k === "id") renderList();
      });
    });

    // translated fields
    $$("[data-ml]", box).forEach(function (el) {
      el.addEventListener("input", function () {
        var f = el.dataset.ml, lang = el.dataset.lang;
        if (!p[f] || typeof p[f] !== "object") p[f] = { en: "", ka: "", ru: "" };
        p[f][lang] = el.value;
        markDirty();
        if (f === "name") {
          renderList();
          $(".editor__title", box).textContent = tf(p.name) || "(unnamed)";
        }
      });
    });

    // language tabs
    $$(".tab", box).forEach(function (t) {
      t.addEventListener("click", function () {
        state.lang = t.dataset.lang;
        $$(".tab", box).forEach(function (x) { x.classList.toggle("is-active", x === t); });
        $$(".lang-pane", box).forEach(function (pane) { pane.hidden = pane.dataset.pane !== state.lang; });
        renderList();
      });
    });

    // row actions
    $$("[data-act]", box).forEach(function (b) {
      b.addEventListener("click", function () { rowAction(b.dataset.act, p); });
    });

    // awards
    $$("[data-award-field]", box).forEach(function (el) {
      el.addEventListener("input", function () {
        p.awards[+el.dataset.i][el.dataset.awardField] = el.value;
        markDirty();
      });
    });
    $$("[data-award-remove]", box).forEach(function (b) {
      b.addEventListener("click", function () {
        p.awards.splice(+b.dataset.awardRemove, 1);
        markDirty();
        renderEditor();
      });
    });
    $$("[data-medal]", box).forEach(function (b) {
      b.addEventListener("click", function () { pickFile("medal", p, +b.dataset.medal); });
    });

    // image uploads
    $$("[data-upload]", box).forEach(function (b) {
      b.addEventListener("click", function () { pickFile(b.dataset.upload, p); });
    });
  }

  function rowAction(act, p) {
    var i = state.selected;
    if (act === "up" && i > 0) {
      state.products.splice(i - 1, 0, state.products.splice(i, 1)[0]);
      state.selected = i - 1;
      markDirty(); renderList(); renderEditor();
    } else if (act === "down" && i < state.products.length - 1) {
      state.products.splice(i + 1, 0, state.products.splice(i, 1)[0]);
      state.selected = i + 1;
      markDirty(); renderList(); renderEditor();
    } else if (act === "dupe") {
      var copy = JSON.parse(JSON.stringify(p));
      copy.id = "";
      copy.slug = "";
      copy.__key = "new-" + Date.now();
      state.newIds[copy.__key] = true;
      state.products.splice(i + 1, 0, copy);
      state.selected = i + 1;
      markDirty(); renderList(); renderEditor();
      toast("Copied. Give it a new ID, then save.");
    } else if (act === "remove") {
      if (!confirm('Remove "' + (tf(p.name) || p.id) + '" from the shop?\n\nIt disappears from the site when you press Save. Its pictures stay on the server, and every save keeps a backup you can restore.')) return;
      state.products.splice(i, 1);
      state.selected = Math.min(i, state.products.length - 1);
      markDirty(); renderList(); renderEditor();
    } else if (act === "add-award") {
      p.awards = p.awards || [];
      p.awards.push({ tier: "gold", title: "", image: "" });
      markDirty(); renderEditor();
    }
  }

  // ---------- uploads ------------------------------------------------------

  function pickFile(role, p, awardIndex) {
    var input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png,image/jpeg,image/webp,image/avif";
    input.addEventListener("change", function () {
      var file = input.files && input.files[0];
      if (!file) return;
      var fd = new FormData();
      fd.append("file", file);
      fd.append("role", role === "medal" ? "medal" : role);
      fd.append("id", p.id || "");
      if (role === "medal") fd.append("name", (p.id || "medal") + "-" + Date.now().toString(36));
      toast("Uploading " + esc(file.name) + "…");
      api("upload", fd, true).then(function (res) {
        if (role === "medal") {
          p.awards[awardIndex].image = res.path;
          markDirty();
          renderEditor();
          toast("Picture uploaded. Press Save to publish it.");
        } else {
          p.__bust = res.v;
          renderEditor();
          renderList();
          // Images live on disk, not in products.js — they are live immediately.
          toast("Uploaded to " + esc(res.path) + " — already live on the site.");
        }
      }).catch(fail);
    });
    input.click();
  }

  // ---------- save ---------------------------------------------------------

  function stripInternal(list) {
    return list.map(function (p) {
      var copy = {};
      for (var k in p) {
        if (Object.prototype.hasOwnProperty.call(p, k) && k.indexOf("__") !== 0) copy[k] = p[k];
      }
      return copy;
    });
  }

  function save() {
    var btn = $("#btnSave");
    btn.disabled = true;
    api("save", { products: stripInternal(state.products) }).then(function (res) {
      state.products = res.products;
      state.newIds = {};
      markClean(res.count);
      renderList();
      renderEditor();
      toast("Saved — the shop is updated.");
    }).catch(function (e) {
      btn.disabled = false;
      fail(e);
    });
  }

  // ---------- modals -------------------------------------------------------

  function openModal(title, html) {
    $("#modalTitle").textContent = title;
    $("#modalBody").innerHTML = html;
    $("#modal").hidden = false;
  }
  function closeModal() { $("#modal").hidden = true; }

  function showBackups() {
    api("backups").then(function (res) {
      var rows = res.backups.map(function (b) {
        var when = new Date(b.mtime * 1000).toLocaleString();
        return "<tr><td>" + esc(when) + "</td><td>" + Math.round(b.size / 1024) + " KB</td>" +
          '<td style="text-align:right"><button class="btn btn--small" data-restore="' + esc(b.file) + '">Restore</button></td></tr>';
      }).join("");
      openModal("Backups", rows
        ? "<p>Every save stores a copy of the catalogue. Restoring replaces the shop with that version — and takes a backup of the current one first.</p><table>" + rows + "</table>"
        : "<p>No backups yet — the first one is written the next time you save.</p>");
      $$("[data-restore]").forEach(function (b) {
        b.addEventListener("click", function () {
          if (!confirm("Restore the catalogue from " + b.dataset.restore + "?")) return;
          api("restore", { file: b.dataset.restore }).then(function (r) {
            state.products = r.products;
            state.selected = -1;
            markClean(r.products.length);
            renderList();
            renderEditor();
            closeModal();
            toast("Restored.");
          }).catch(fail);
        });
      });
    }).catch(fail);
  }

  function showPassword() {
    openModal("Change password",
      '<label class="field"><span>Current password</span><input type="password" id="pwCur" /></label>' +
      '<label class="field"><span>New password (min. 10 characters)</span><input type="password" id="pwNew" /></label>' +
      '<label class="field"><span>Repeat new password</span><input type="password" id="pwNew2" /></label>' +
      '<button class="btn btn--gold" id="pwSave">Change password</button>');
    $("#pwSave").addEventListener("click", function () {
      var a = $("#pwNew").value, b = $("#pwNew2").value;
      if (a !== b) { toast("The two new passwords do not match.", "error"); return; }
      api("password", { current: $("#pwCur").value, next: a }).then(function () {
        closeModal();
        toast("Password changed. Use it next time you sign in.");
      }).catch(fail);
    });
  }

  // ---------- boot ---------------------------------------------------------

  function boot() {
    $("#btnSave").addEventListener("click", save);
    $("#btnNew").addEventListener("click", function () {
      var p = blankProduct();
      p.__key = "new-" + Date.now();
      state.newIds[p.__key] = true;
      state.products.push(p);
      state.selected = state.products.length - 1;
      markDirty();
      renderList();
      renderEditor();
    });
    $("#search").addEventListener("input", function (e) {
      state.filter = e.target.value;
      renderList();
    });

    var menu = $("#menuList");
    $("#btnMenu").addEventListener("click", function (e) {
      e.stopPropagation();
      menu.hidden = !menu.hidden;
      $("#btnMenu").setAttribute("aria-expanded", String(!menu.hidden));
    });
    document.addEventListener("click", function () { menu.hidden = true; });
    menu.addEventListener("click", function (e) { e.stopPropagation(); });
    $$("[data-menu]", menu).forEach(function (b) {
      b.addEventListener("click", function () {
        menu.hidden = true;
        if (b.dataset.menu === "backups") showBackups();
        else if (b.dataset.menu === "password") showPassword();
        else if (b.dataset.menu === "download") window.location.href = "api.php?action=download";
      });
    });
    $("#modalClose").addEventListener("click", closeModal);
    $("#modal").addEventListener("click", function (e) { if (e.target.id === "modal") closeModal(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeModal();
      if ((e.ctrlKey || e.metaKey) && e.key === "s") { e.preventDefault(); if (state.dirty) save(); }
    });

    // Signing out is deliberate, so it must never be blocked by the unsaved-work
    // guard — ask once in our own words, then let the link through.
    var loggingOut = false;
    $("#btnLogout").addEventListener("click", function (e) {
      if (state.dirty && !confirm("You have unsaved changes. Sign out anyway?\n\nAnything not saved will be lost.")) {
        e.preventDefault();
        return;
      }
      loggingOut = true;
    });

    window.addEventListener("beforeunload", function (e) {
      if (!state.dirty || loggingOut) return;
      e.preventDefault();
      e.returnValue = "";
    });

    api("state").then(function (res) {
      if (!res.auth) { window.location.href = "index.php"; return; }
      state.products = res.products;
      state.enums = res.enums;
      window.AKH_ADMIN.csrf = res.csrf;
      markClean(res.catalogue.count);
      renderList();
      if (!res.catalogue.writable) {
        toast("js/products.js is read-only on the server — saving will fail until permissions are fixed (644).", "error");
      }
    }).catch(fail);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
