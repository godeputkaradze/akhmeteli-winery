<?php
// =============================================================
//  Akhmeteli Winery — admin JSON API
//  Every endpoint except "login" requires an authenticated session;
//  every mutating endpoint additionally requires the CSRF token
//  (sent as the X-CSRF-Token header).
// =============================================================

require_once __DIR__ . '/lib.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function api_out($data, $code = 200)
{
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function api_fail($message, $code = 400, $extra = array())
{
    api_out(array_merge(array('ok' => false, 'error' => $message), $extra), $code);
}

$method = isset($_SERVER['REQUEST_METHOD']) ? $_SERVER['REQUEST_METHOD'] : 'GET';
$action = isset($_GET['action']) ? $_GET['action'] : '';

// JSON bodies arrive as a raw stream; multipart uploads use $_POST as usual.
$body = array();
if ($method === 'POST') {
    $ctype = isset($_SERVER['CONTENT_TYPE']) ? $_SERVER['CONTENT_TYPE'] : '';
    if (strpos($ctype, 'application/json') !== false) {
        $raw = file_get_contents('php://input');
        $decoded = json_decode($raw, true);
        if (is_array($decoded)) {
            $body = $decoded;
        }
    } else {
        $body = $_POST;
    }
    if ($action === '' && isset($body['action'])) {
        $action = $body['action'];
    }
}

// ---------- login ----------------------------------------------------------

if ($action === 'login') {
    if ($method !== 'POST') {
        api_fail('POST required', 405);
    }
    $wait = admin_throttle_locked();
    if ($wait > 0) {
        api_fail('Too many failed attempts. Try again in ' . ceil($wait / 60) . ' minute(s).', 429);
    }
    $user = isset($body['user']) ? trim((string) $body['user']) : '';
    $pass = isset($body['pass']) ? (string) $body['pass'] : '';
    $userOk = hash_equals(strtolower(ADMIN_USER), strtolower($user));
    $passOk = admin_password_verify($pass);
    if (!$userOk || !$passOk) {
        $left = admin_throttle_fail();
        // Deliberately vague: never reveal which half was wrong.
        api_fail('Wrong username or password.' . ($left <= 3 ? ' ' . $left . ' attempt(s) left before a 15-minute lockout.' : ''), 401);
    }
    admin_login_ok();
    api_out(array('ok' => true, 'user' => ADMIN_USER, 'csrf' => admin_csrf()));
}

// ---------- everything below needs a session -------------------------------

$authed = admin_logged_in();

if ($action === 'state') {
    if (!$authed) {
        api_out(array('ok' => true, 'auth' => false));
    }
    $products = catalogue_read();
    if ($products === null) {
        api_fail('Could not read js/products.js — check the file exists and is readable.', 500, array('auth' => true));
    }
    api_out(array(
        'ok'        => true,
        'auth'      => true,
        'user'      => ADMIN_USER,
        'csrf'      => admin_csrf(),
        'products'  => $products,
        'enums'     => product_enums(),
        'catalogue' => array(
            'path'     => 'js/products.js',
            'mtime'    => @filemtime(CATALOGUE_FILE),
            'writable' => is_writable(CATALOGUE_FILE),
            'count'    => count($products),
        ),
    ));
}

if (!$authed) {
    api_fail('Not signed in.', 401, array('auth' => false));
}

// Mutating calls must carry the CSRF token.
$mutating = array('save', 'upload', 'restore', 'password', 'logout');
if (in_array($action, $mutating, true)) {
    $token = isset($_SERVER['HTTP_X_CSRF_TOKEN']) ? $_SERVER['HTTP_X_CSRF_TOKEN'] : (isset($body['csrf']) ? $body['csrf'] : '');
    if (!admin_csrf_ok($token)) {
        api_fail('Session expired — reload the page and sign in again.', 403);
    }
}

// ---------- logout ---------------------------------------------------------

if ($action === 'logout') {
    admin_logout();
    api_out(array('ok' => true));
}

// ---------- save catalogue -------------------------------------------------

if ($action === 'save') {
    if (!isset($body['products']) || !is_array($body['products'])) {
        api_fail('No products were sent.');
    }
    $existing = catalogue_read();
    if ($existing === null) {
        api_fail('Could not read the current catalogue — refusing to overwrite it.', 500);
    }
    list($clean, $errors) = products_sanitize($body['products'], $existing);
    if (count($errors)) {
        api_fail('Nothing was saved — please fix these first:', 422, array('details' => $errors));
    }
    if (!catalogue_write($clean)) {
        api_fail('Write failed. js/products.js is not writable by the web server.', 500);
    }
    api_out(array(
        'ok'       => true,
        'count'    => count($clean),
        'mtime'    => @filemtime(CATALOGUE_FILE),
        'products' => $clean,
    ));
}

// ---------- image upload ---------------------------------------------------

if ($action === 'upload') {
    if (empty($_FILES['file']) || !is_uploaded_file($_FILES['file']['tmp_name'])) {
        api_fail('No file was received.');
    }
    $f = $_FILES['file'];
    if ($f['error'] !== UPLOAD_ERR_OK) {
        api_fail('Upload failed (code ' . $f['error'] . ').');
    }
    if ($f['size'] > UPLOAD_MAX_BYTES) {
        api_fail('That image is larger than ' . round(UPLOAD_MAX_BYTES / 1048576) . ' MB.');
    }
    $ext = upload_extension($f['tmp_name']);
    if ($ext === '') {
        api_fail('Only PNG, JPG, WebP or AVIF images are allowed.');
    }

    $role = isset($_POST['role']) ? $_POST['role'] : '';

    if ($role === 'medal') {
        $base = isset($_POST['name']) ? $_POST['name'] : pathinfo($f['name'], PATHINFO_FILENAME);
        $base = clean_id($base);
        if ($base === '') {
            $base = 'medal-' . date('Ymd-His');
        }
        $rel = 'assets/medals/' . $base . '.' . $ext;
        $dest = SITE_ROOT . '/' . $rel;
        if (!is_dir(dirname($dest)) && !@mkdir(dirname($dest), 0755, true)) {
            api_fail('Could not create assets/medals/.', 500);
        }
        if (!@move_uploaded_file($f['tmp_name'], $dest)) {
            api_fail('Could not write ' . $rel . ' — check folder permissions.', 500);
        }
        @chmod($dest, 0644);
        api_out(array('ok' => true, 'path' => $rel));
    }

    // The ID becomes a folder name, so it must already be clean — a value that
    // only survives sanitising (".." and friends) is rejected, not rewritten.
    $rawId = isset($_POST['id']) ? (string) $_POST['id'] : '';
    $id = clean_id($rawId);
    if ($id === '' || $id !== $rawId) {
        api_fail('That product ID is not valid (lowercase latin letters, digits and dashes only).');
    }
    $rel = product_image_path($id, $role);
    if ($rel === null) {
        api_fail('Unknown image slot.');
    }
    $dest = SITE_ROOT . '/' . $rel;
    if (!is_dir(dirname($dest)) && !@mkdir(dirname($dest), 0755, true)) {
        api_fail('Could not create the product image folder.', 500);
    }
    // These slots are referenced as .png by the site, so convert when needed.
    if (!image_to_png($f['tmp_name'], $ext, $dest)) {
        api_fail('Could not convert that image to PNG on the server. Upload a .png file instead.', 500);
    }
    @chmod($dest, 0644);
    api_out(array('ok' => true, 'path' => $rel, 'v' => time()));
}

// ---------- backups --------------------------------------------------------

if ($action === 'backups') {
    api_out(array('ok' => true, 'backups' => catalogue_backups()));
}

if ($action === 'restore') {
    $file = basename(isset($body['file']) ? $body['file'] : '');
    if (!preg_match('/^products-\d{8}-\d{6}\.js$/', $file)) {
        api_fail('Unknown backup.');
    }
    $path = ADMIN_BACKUPS . '/' . $file;
    if (!is_file($path)) {
        api_fail('That backup no longer exists.', 404);
    }
    // Restoring is itself a change, so the current file is backed up first.
    catalogue_backup();
    if (!@copy($path, CATALOGUE_FILE)) {
        api_fail('Restore failed — js/products.js is not writable.', 500);
    }
    $products = catalogue_read();
    api_out(array('ok' => true, 'products' => $products === null ? array() : $products));
}

// ---------- change password ------------------------------------------------

if ($action === 'password') {
    $current = isset($body['current']) ? (string) $body['current'] : '';
    $next    = isset($body['next']) ? (string) $body['next'] : '';
    if (!admin_password_verify($current)) {
        admin_throttle_fail();
        api_fail('Current password is wrong.', 401);
    }
    if (strlen($next) < 10) {
        api_fail('Pick a password of at least 10 characters.');
    }
    admin_ensure_dir(ADMIN_DATA);
    $ok = admin_json_write(ADMIN_DATA . '/auth.json', array(
        'password'   => admin_password_hash($next),
        'changed_at' => date('c'),
    ));
    if (!$ok) {
        api_fail('Could not save the new password (admin/data is not writable).', 500);
    }
    api_out(array('ok' => true));
}

// ---------- download a copy of the catalogue -------------------------------

if ($action === 'download') {
    $src = @file_get_contents(CATALOGUE_FILE);
    if ($src === false) {
        api_fail('Catalogue unreadable.', 500);
    }
    header('Content-Type: application/javascript; charset=utf-8');
    header('Content-Disposition: attachment; filename="products.js"');
    header('Content-Length: ' . strlen($src));
    echo $src;
    exit;
}

api_fail('Unknown action.', 404);
