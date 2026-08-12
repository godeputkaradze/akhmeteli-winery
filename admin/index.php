<?php
// =============================================================
//  Akhmeteli Winery — admin panel entry point
//  Not signed in -> login form. Signed in -> the shop editor shell,
//  which then talks to api.php.
// =============================================================

require_once __DIR__ . '/lib.php';

// Never let a browser keep this page. Without no-store the back button can
// redisplay the panel from cache after signing out, which looks exactly like
// "log out doesn't work". It also keeps Chrome from putting it in bfcache.
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');

admin_session_start();

$error = '';
$notice = '';

// ---- sign out -------------------------------------------------------------
if (isset($_GET['logout'])) {
    admin_logout();
    header('Location: index.php');
    exit;
}

// ---- sign in (plain form POST, works without JavaScript) ------------------
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['login'])) {
    $wait = admin_throttle_locked();
    if ($wait > 0) {
        $error = 'Too many failed attempts. Try again in ' . ceil($wait / 60) . ' minute(s).';
    } elseif (!admin_csrf_ok(isset($_POST['csrf']) ? $_POST['csrf'] : '')) {
        $error = 'The form expired. Please try again.';
    } else {
        $user = isset($_POST['user']) ? trim((string) $_POST['user']) : '';
        $pass = isset($_POST['pass']) ? (string) $_POST['pass'] : '';
        // The name is matched case-insensitively (phones love to capitalise the
        // first letter); the password is not.
        if (hash_equals(strtolower(ADMIN_USER), strtolower($user)) && admin_password_verify($pass)) {
            admin_login_ok();
            header('Location: index.php');
            exit;
        }
        $left = admin_throttle_fail();
        $error = 'Wrong username or password.';
        if ($left <= 3 && $left > 0) {
            $error .= ' ' . $left . ' attempt(s) left before a 15-minute lockout.';
        }
    }
}

$authed = admin_logged_in();
$csrf = admin_csrf();
$catalogueWritable = is_writable(CATALOGUE_FILE);

function e($s)
{
    return htmlspecialchars((string) $s, ENT_QUOTES, 'UTF-8');
}
?>
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, nofollow" />
<title>Akhmeteli — Shop Admin</title>
<link rel="icon" href="../img/logo-gold.png" />
<link rel="stylesheet" href="assets/panel.css?v=2" />
</head>
<body class="<?php echo $authed ? 'is-app' : 'is-login'; ?>">

<?php if (!$authed) { ?>

  <main class="login">
    <form class="login__card" method="post" action="index.php" autocomplete="off">
      <img class="login__logo" src="../img/logo-gold.png" alt="Akhmeteli Winery" />
      <h1>Shop administration</h1>
      <p class="login__lead">Sign in to manage the wines shown in the shop.</p>

      <?php if ($error) { ?><div class="alert alert--error"><?php echo e($error); ?></div><?php } ?>
      <?php if ($notice) { ?><div class="alert"><?php echo e($notice); ?></div><?php } ?>

      <label class="field">
        <span>Username</span>
        <input type="text" name="user" autocapitalize="none" autocorrect="off" spellcheck="false" required autofocus />
      </label>
      <label class="field">
        <span>Password</span>
        <input type="password" name="pass" required />
      </label>

      <input type="hidden" name="csrf" value="<?php echo e($csrf); ?>" />
      <button class="btn btn--gold" type="submit" name="login" value="1">Sign in</button>
      <p class="login__foot">Single administrator account. Sessions end after 3 hours of inactivity.</p>
    </form>
  </main>

<?php } else { ?>

  <header class="top">
    <div class="top__left">
      <img class="top__logo" src="../img/logo-gold.png" alt="" />
      <div>
        <strong>Shop administration</strong>
        <span class="top__sub">signed in as <?php echo e(ADMIN_USER); ?></span>
      </div>
    </div>
    <div class="top__right">
      <span class="saved" id="savedState">Loading…</span>
      <button class="btn btn--gold" id="btnSave" disabled>Save changes</button>
      <div class="menu">
        <button class="btn btn--ghost" id="btnMenu" aria-haspopup="true" aria-expanded="false">More ▾</button>
        <div class="menu__list" id="menuList" hidden>
          <a href="../shop.html" target="_blank" rel="noopener">Open the shop ↗</a>
          <button type="button" data-menu="backups">Backups &amp; restore</button>
          <button type="button" data-menu="download">Download products.js</button>
          <button type="button" data-menu="password">Change password</button>
        </div>
      </div>
      <!-- Sign out stays in the bar itself: buried in the dropdown it was easy
           to miss, and it must work even if the panel's JavaScript fails. -->
      <a class="btn btn--ghost" id="btnLogout" href="index.php?logout=1">Sign out</a>
    </div>
  </header>

  <?php if (!$catalogueWritable) { ?>
    <div class="alert alert--error alert--bar">
      js/products.js is not writable by the web server, so saving will fail.
      Set the file permissions to 644 and its folder to 755 in cPanel &gt; File Manager.
    </div>
  <?php } ?>

  <main class="app">
    <aside class="list">
      <div class="list__head">
        <input type="search" id="search" placeholder="Search wines…" autocomplete="off" />
        <button class="btn btn--small" id="btnNew">+ New</button>
      </div>
      <ul class="list__items" id="productList"></ul>
      <p class="list__foot" id="listCount"></p>
    </aside>

    <section class="editor" id="editor">
      <div class="empty" id="emptyState">
        <p>Select a wine on the left, or create a new one.</p>
      </div>
    </section>
  </main>

  <div class="modal" id="modal" hidden>
    <div class="modal__card">
      <header class="modal__head">
        <h2 id="modalTitle"></h2>
        <button class="modal__x" id="modalClose" aria-label="Close">×</button>
      </header>
      <div class="modal__body" id="modalBody"></div>
    </div>
  </div>

  <div class="toast" id="toast" hidden></div>

  <script>
    window.AKH_ADMIN = {
      csrf: <?php echo json_encode($csrf); ?>,
      user: <?php echo json_encode(ADMIN_USER); ?>
    };
  </script>
  <script src="assets/panel.js?v=2"></script>

<?php } ?>

</body>
</html>
