<?php
// =============================================================
//  Akhmeteli Winery — admin panel core
//  Session/auth, brute-force throttle, CSRF, catalogue read/write,
//  image uploads. Shared by index.php and api.php.
//  Written for PHP 7.0+ (cPanel shared hosting).
// =============================================================

require_once __DIR__ . '/config.php';

// ---------- storage helpers ------------------------------------------------

function admin_ensure_dir($dir)
{
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
    // Storage must never be readable over HTTP.
    $guard = $dir . '/.htaccess';
    if (is_dir($dir) && !file_exists($guard)) {
        @file_put_contents($guard, "Require all denied\n<IfModule !mod_authz_core.c>\nOrder allow,deny\nDeny from all\n</IfModule>\n");
    }
    return $dir;
}

function admin_write_atomic($path, $contents)
{
    $dir = dirname($path);
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
    $tmp = $path . '.tmp' . getmypid();
    if (file_put_contents($tmp, $contents, LOCK_EX) === false) {
        return false;
    }
    @chmod($tmp, 0644);
    if (!@rename($tmp, $path)) {
        @unlink($tmp);
        return false;
    }
    return true;
}

function admin_json_read($path, $fallback)
{
    if (!is_file($path)) {
        return $fallback;
    }
    $raw = file_get_contents($path);
    $data = json_decode($raw, true);
    return is_array($data) ? $data : $fallback;
}

function admin_json_write($path, $data)
{
    return admin_write_atomic($path, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
}

// ---------- passwords ------------------------------------------------------

// pbkdf2$sha256$<iterations>$<salt b64>$<hash b64>
function admin_password_hash($plain, $iterations = 210000)
{
    $salt = function_exists('random_bytes') ? random_bytes(16) : openssl_random_pseudo_bytes(16);
    $hash = hash_pbkdf2('sha256', $plain, $salt, $iterations, 32, true);
    return 'pbkdf2$sha256$' . $iterations . '$' . base64_encode($salt) . '$' . base64_encode($hash);
}

function admin_stored_password()
{
    $override = admin_json_read(ADMIN_DATA . '/auth.json', array());
    if (!empty($override['password'])) {
        return $override['password'];
    }
    return ADMIN_PASSWORD;
}

function admin_password_verify($plain, $stored = null)
{
    if ($stored === null) {
        $stored = admin_stored_password();
    }
    $parts = explode('$', $stored);
    if (count($parts) !== 5 || $parts[0] !== 'pbkdf2') {
        return false;
    }
    $algo = $parts[1];
    $iter = (int) $parts[2];
    $salt = base64_decode($parts[3]);
    $want = base64_decode($parts[4]);
    if ($iter < 1000 || $salt === false || $want === false) {
        return false;
    }
    $got = hash_pbkdf2($algo, $plain, $salt, $iter, strlen($want), true);
    return hash_equals($want, $got);
}

// ---------- brute-force throttle ------------------------------------------

function admin_client_ip()
{
    $ip = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '0.0.0.0';
    return $ip;
}

function admin_throttle_file()
{
    return admin_ensure_dir(ADMIN_DATA) . '/throttle.json';
}

// Returns 0 when login is allowed, otherwise seconds left on the lockout.
function admin_throttle_locked()
{
    $all = admin_json_read(admin_throttle_file(), array());
    $key = admin_client_ip();
    if (empty($all[$key])) {
        return 0;
    }
    $rec = $all[$key];
    $until = isset($rec['until']) ? (int) $rec['until'] : 0;
    return $until > time() ? $until - time() : 0;
}

function admin_throttle_fail()
{
    $file = admin_throttle_file();
    $all = admin_json_read($file, array());
    $key = admin_client_ip();
    $now = time();
    $rec = isset($all[$key]) ? $all[$key] : array('n' => 0, 'first' => $now, 'until' => 0);
    // Window resets once the previous lockout has expired.
    if (!empty($rec['until']) && $rec['until'] < $now && $rec['n'] >= LOGIN_MAX_ATTEMPTS) {
        $rec = array('n' => 0, 'first' => $now, 'until' => 0);
    }
    $rec['n'] = (int) $rec['n'] + 1;
    $rec['last'] = $now;
    if ($rec['n'] >= LOGIN_MAX_ATTEMPTS) {
        $rec['until'] = $now + LOGIN_LOCK_SECONDS;
    }
    $all[$key] = $rec;
    // Drop stale entries so the file cannot grow without bound.
    foreach ($all as $k => $v) {
        $last = isset($v['last']) ? (int) $v['last'] : 0;
        if ($last && $last < $now - 86400) {
            unset($all[$k]);
        }
    }
    admin_json_write($file, $all);
    return max(0, LOGIN_MAX_ATTEMPTS - $rec['n']);
}

function admin_throttle_clear()
{
    $file = admin_throttle_file();
    $all = admin_json_read($file, array());
    unset($all[admin_client_ip()]);
    admin_json_write($file, $all);
}

// ---------- session / auth -------------------------------------------------

function admin_is_https()
{
    if (!empty($_SERVER['HTTPS']) && strtolower($_SERVER['HTTPS']) !== 'off') {
        return true;
    }
    if (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && strtolower($_SERVER['HTTP_X_FORWARDED_PROTO']) === 'https') {
        return true;
    }
    return false;
}

function admin_session_start()
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }
    admin_ensure_dir(ADMIN_DATA);
    $path = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/') . '/';
    $secure = admin_is_https();
    if (PHP_VERSION_ID >= 70300) {
        session_set_cookie_params(array(
            'lifetime' => 0,
            'path'     => $path,
            'httponly' => true,
            'secure'   => $secure,
            'samesite' => 'Lax',
        ));
    } else {
        // Pre-7.3 has no samesite argument; smuggle it through the path.
        session_set_cookie_params(0, $path . '; samesite=Lax', '', $secure, true);
    }
    session_name('akh_admin');
    session_start();
}

function admin_logged_in()
{
    admin_session_start();
    if (empty($_SESSION['uid']) || $_SESSION['uid'] !== ADMIN_USER) {
        return false;
    }
    $now = time();
    $since = $now - (int) (isset($_SESSION['seen']) ? $_SESSION['seen'] : 0);
    $age = $now - (int) (isset($_SESSION['auth_at']) ? $_SESSION['auth_at'] : 0);
    if ($since > SESSION_IDLE_SECONDS || $age > SESSION_MAX_SECONDS) {
        admin_logout();
        return false;
    }
    $_SESSION['seen'] = $now;
    return true;
}

function admin_login_ok()
{
    admin_session_start();
    session_regenerate_id(true);
    $_SESSION['uid'] = ADMIN_USER;
    $_SESSION['auth_at'] = time();
    $_SESSION['seen'] = time();
    $_SESSION['csrf'] = bin2hex(function_exists('random_bytes') ? random_bytes(16) : openssl_random_pseudo_bytes(16));
    admin_throttle_clear();
}

function admin_logout()
{
    admin_session_start();
    $_SESSION = array();
    if (ini_get('session.use_cookies')) {
        $p = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $p['path'], $p['domain'], $p['secure'], $p['httponly']);
    }
    session_destroy();
}

function admin_csrf()
{
    admin_session_start();
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(function_exists('random_bytes') ? random_bytes(16) : openssl_random_pseudo_bytes(16));
    }
    return $_SESSION['csrf'];
}

function admin_csrf_ok($token)
{
    admin_session_start();
    return !empty($_SESSION['csrf']) && is_string($token) && hash_equals($_SESSION['csrf'], $token);
}

// ---------- catalogue ------------------------------------------------------

// Header kept on top of js/products.js so the file stays self-describing.
function catalogue_header()
{
    return "// Akhmeteli Winery — product catalogue.\n"
         . "// Generated by the admin panel (/admin/). Edit it there, not by hand:\n"
         . "// the panel keeps timestamped backups of every save in admin/backups/.\n"
         . "// Shape: window.PRODUCTS = <JSON array>;  (clean JSON so the panel can parse & rewrite it.)\n"
         . "// Each award item has fields: tier (iwsc | gold | silver | bronze), title (display text), image (assets/medals/....png).\n\n";
}

// Reads js/products.js and returns the product array (or null when unreadable).
function catalogue_read()
{
    if (!is_file(CATALOGUE_FILE)) {
        return null;
    }
    $src = file_get_contents(CATALOGUE_FILE);
    if ($src === false) {
        return null;
    }
    // The header comment also mentions "window.PRODUCTS", so anchor on the LAST
    // occurrence — that is the real assignment.
    $at = strrpos($src, 'window.PRODUCTS');
    if ($at === false) {
        return null;
    }
    $start = strpos($src, '[', $at);
    if ($start === false) {
        return null;
    }
    $json = rtrim(trim(substr($src, $start)), ';');
    $data = json_decode($json, true);
    return is_array($data) ? $data : null;
}

function catalogue_serialize($products)
{
    $json = json_encode(array_values($products), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    return catalogue_header() . "window.PRODUCTS =\n" . $json . ";\n";
}

function catalogue_backup()
{
    if (!is_file(CATALOGUE_FILE)) {
        return null;
    }
    $dir = admin_ensure_dir(ADMIN_BACKUPS);
    $name = 'products-' . date('Ymd-His') . '.js';
    @copy(CATALOGUE_FILE, $dir . '/' . $name);
    // Prune oldest beyond BACKUP_KEEP.
    $files = glob($dir . '/products-*.js');
    if ($files && count($files) > BACKUP_KEEP) {
        sort($files);
        $drop = array_slice($files, 0, count($files) - BACKUP_KEEP);
        foreach ($drop as $f) {
            @unlink($f);
        }
    }
    return $name;
}

function catalogue_write($products)
{
    catalogue_backup();
    return admin_write_atomic(CATALOGUE_FILE, catalogue_serialize($products));
}

function catalogue_backups()
{
    $dir = ADMIN_BACKUPS;
    $out = array();
    if (!is_dir($dir)) {
        return $out;
    }
    $files = glob($dir . '/products-*.js');
    if (!$files) {
        return $out;
    }
    rsort($files);
    foreach ($files as $f) {
        $out[] = array(
            'file'  => basename($f),
            'size'  => filesize($f),
            'mtime' => filemtime($f),
        );
    }
    return $out;
}

// ---------- product validation --------------------------------------------

function product_enums()
{
    return array(
        'category'  => array('red', 'white', 'amber', 'spirit'),
        'type'      => array('wine', 'chacha', 'spirit'),
        'sweetness' => array('dry', 'semi-dry', 'semi-sweet', 'n/a'),
        'method'    => array('european', 'qvevri', 'distilled'),
    );
}

function product_key_order()
{
    return array(
        'id', 'slug', 'category', 'type', 'sweetness', 'method', 'grape',
        'vintage', 'abv', 'volume', 'price', 'sale', 'awards', 'color',
        'region', 'name', 'style', 'aroma', 'taste', 'serve',
    );
}

function ml_field($raw)
{
    $out = array();
    foreach (array('en', 'ka', 'ru') as $lang) {
        $v = '';
        if (is_array($raw) && isset($raw[$lang])) {
            $v = (string) $raw[$lang];
        } elseif (is_string($raw)) {
            $v = $raw;
        }
        $out[$lang] = trim($v);
    }
    return $out;
}

function clean_id($s)
{
    $s = strtolower(trim((string) $s));
    $s = preg_replace('/[^a-z0-9\-]+/', '-', $s);
    $s = preg_replace('/-+/', '-', $s);
    return trim($s, '-');
}

// Validates + normalises the array coming from the browser.
// Returns array(products, errors).
function products_sanitize($incoming, $existing)
{
    $errors = array();
    $enums = product_enums();
    $byId = array();
    foreach ((array) $existing as $p) {
        if (isset($p['id'])) {
            $byId[$p['id']] = $p;
        }
    }

    $out = array();
    $seen = array();
    $i = 0;
    foreach ((array) $incoming as $raw) {
        $i++;
        if (!is_array($raw)) {
            $errors[] = "Product #$i is malformed.";
            continue;
        }
        $id = clean_id(isset($raw['id']) ? $raw['id'] : '');
        if ($id === '') {
            $errors[] = "Product #$i has no ID (use lowercase latin letters, digits and dashes).";
            continue;
        }
        if (isset($seen[$id])) {
            $errors[] = "Duplicate ID \"$id\" — every product needs its own.";
            continue;
        }
        $seen[$id] = true;

        // Start from the stored product so any field this panel does not know
        // about survives a save untouched.
        $p = isset($byId[$id]) ? $byId[$id] : array();

        $p['id']   = $id;
        $slug      = clean_id(isset($raw['slug']) && $raw['slug'] !== '' ? $raw['slug'] : $id);
        $p['slug'] = $slug === '' ? $id : $slug;

        foreach ($enums as $key => $allowed) {
            $v = isset($raw[$key]) ? (string) $raw[$key] : '';
            if (!in_array($v, $allowed, true)) {
                $errors[] = "\"$id\": $key must be one of " . implode(', ', $allowed) . ".";
                $v = $allowed[0];
            }
            $p[$key] = $v;
        }

        $p['grape']   = trim((string) (isset($raw['grape']) ? $raw['grape'] : ''));
        $p['vintage'] = (int) (isset($raw['vintage']) ? $raw['vintage'] : 0);
        $p['abv']     = round((float) (isset($raw['abv']) ? $raw['abv'] : 0), 1);
        $p['volume']  = (int) (isset($raw['volume']) ? $raw['volume'] : 0);
        $p['price']   = round((float) (isset($raw['price']) ? $raw['price'] : 0), 2);

        if ($p['price'] < 0) {
            $errors[] = "\"$id\": price cannot be negative.";
            $p['price'] = 0;
        }
        if ($p['vintage'] !== 0 && ($p['vintage'] < 1900 || $p['vintage'] > (int) date('Y') + 2)) {
            $errors[] = "\"$id\": vintage $p[vintage] looks wrong.";
        }

        // Discount percentage — dropped entirely when zero, matching the file's
        // existing shape (only discounted wines carry a "sale" key).
        $sale = (int) (isset($raw['sale']) ? $raw['sale'] : 0);
        if ($sale > 0) {
            if ($sale > 90) {
                $errors[] = "\"$id\": discount above 90% is not allowed.";
                $sale = 90;
            }
            $p['sale'] = $sale;
        } else {
            unset($p['sale']);
        }

        // Awards.
        $awards = array();
        $tiers = array('iwsc', 'gold', 'silver', 'bronze');
        if (isset($raw['awards']) && is_array($raw['awards'])) {
            foreach ($raw['awards'] as $a) {
                if (!is_array($a)) {
                    continue;
                }
                $tier = isset($a['tier']) ? strtolower((string) $a['tier']) : 'iwsc';
                if (!in_array($tier, $tiers, true)) {
                    $tier = 'iwsc';
                }
                $title = trim((string) (isset($a['title']) ? $a['title'] : ''));
                $image = trim((string) (isset($a['image']) ? $a['image'] : ''));
                // Only site-relative asset paths may be stored.
                if ($image !== '' && !preg_match('#^assets/[A-Za-z0-9._/\- ]+$#', $image)) {
                    $errors[] = "\"$id\": award image path \"$image\" is not inside assets/.";
                    $image = '';
                }
                if ($title === '' && $image === '') {
                    continue;
                }
                $awards[] = array('tier' => $tier, 'title' => $title, 'image' => $image);
            }
        }
        $p['awards'] = $awards;

        $color = trim((string) (isset($raw['color']) ? $raw['color'] : ''));
        if (!preg_match('/^#[0-9a-fA-F]{6}$/', $color)) {
            $errors[] = "\"$id\": colour must be a hex value like #6b1a2c.";
            $color = isset($p['color']) && preg_match('/^#[0-9a-fA-F]{6}$/', $p['color']) ? $p['color'] : '#6b1a2c';
        }
        $p['color'] = strtolower($color);

        foreach (array('region', 'name', 'style', 'aroma', 'taste') as $f) {
            $p[$f] = ml_field(isset($raw[$f]) ? $raw[$f] : null);
        }
        if ($p['name']['en'] === '' && $p['name']['ka'] === '' && $p['name']['ru'] === '') {
            $errors[] = "\"$id\": the product needs a name in at least one language.";
        }

        $p['serve'] = trim((string) (isset($raw['serve']) ? $raw['serve'] : ''));

        // Re-order keys so the generated file stays readable and diff-friendly.
        $ordered = array();
        foreach (product_key_order() as $k) {
            if (array_key_exists($k, $p)) {
                $ordered[$k] = $p[$k];
            }
        }
        foreach ($p as $k => $v) {
            if (!array_key_exists($k, $ordered)) {
                $ordered[$k] = $v;
            }
        }
        $out[] = $ordered;
    }

    if (!count($out)) {
        $errors[] = 'The catalogue would be empty — refusing to save.';
    }
    return array($out, $errors);
}

// ---------- uploads --------------------------------------------------------

function upload_extension($file)
{
    $mime = '';
    if (function_exists('finfo_open')) {
        $fi = finfo_open(FILEINFO_MIME_TYPE);
        if ($fi) {
            $mime = (string) finfo_file($fi, $file);
            finfo_close($fi);
        }
    }
    if ($mime === '') {
        $info = @getimagesize($file);
        $mime = $info && isset($info['mime']) ? $info['mime'] : '';
    }
    $map = array(
        'image/png'  => 'png',
        'image/jpeg' => 'jpg',
        'image/webp' => 'webp',
        'image/avif' => 'avif',
    );
    return isset($map[$mime]) ? $map[$mime] : '';
}

// The shop resolves packshots as assets/Products/<id>/<role>.png — mirroring
// window.AKH.productPhoto() in js/main.js, including the mukuzani exception.
function product_image_path($id, $role)
{
    $roles = array('bottle', 'background', 'grape', 'information');
    if (!in_array($role, $roles, true)) {
        return null;
    }
    $file = ($role === 'bottle' && $id === 'mukuzani') ? 'bottle-trim' : $role;
    return 'assets/Products/' . $id . '/' . $file . '.png';
}

// Converts an uploaded image to PNG when GD is available; returns true on success.
function image_to_png($src, $ext, $dest)
{
    if ($ext === 'png') {
        return @copy($src, $dest);
    }
    if (!function_exists('imagecreatefromjpeg')) {
        return false;
    }
    $img = null;
    if ($ext === 'jpg') {
        $img = @imagecreatefromjpeg($src);
    } elseif ($ext === 'webp' && function_exists('imagecreatefromwebp')) {
        $img = @imagecreatefromwebp($src);
    } elseif ($ext === 'avif' && function_exists('imagecreatefromavif')) {
        $img = @imagecreatefromavif($src);
    }
    if (!$img) {
        return false;
    }
    imagesavealpha($img, true);
    $ok = @imagepng($img, $dest, 6);
    imagedestroy($img);
    return $ok;
}
