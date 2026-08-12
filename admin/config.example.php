<?php
// =============================================================
//  Akhmeteli Winery — admin panel configuration TEMPLATE
//
//  Copy this file to admin/config.php on the server and fill in the two
//  credential values. The real config.php is gitignored on purpose: this
//  repository is public, and publishing the login name together with the
//  password digest would hand an attacker an offline brute-force target.
//
//  Generate a digest for a new password (Node, no dependencies):
//
//    node -e "const c=require('crypto');const p='YOUR NEW PASSWORD';
//      const s=c.randomBytes(16),i=210000;
//      console.log('pbkdf2\$sha256\$'+i+'\$'+s.toString('base64')+'\$'+
//        c.pbkdf2Sync(p,s,i,32,'sha256').toString('base64'))"
//
//  Then upload just that file:  node deploy.js upload admin/config.php
//
//  Note: if the password was ever changed from inside the panel, the digest in
//  <private>/data/auth.json overrides whatever stands here — delete that file
//  to fall back to this one.
// =============================================================

// Login name (any string — it is only an identifier, nothing external is called).
define('ADMIN_USER', 'CHANGE_ME');

// Password digest. Format: pbkdf2$sha256$<iterations>$<salt b64>$<hash b64>
define('ADMIN_PASSWORD', 'pbkdf2$sha256$210000$CHANGE_ME$CHANGE_ME');

// Document root of the website (one level up from admin/).
define('SITE_ROOT', dirname(__DIR__));

// The catalogue the shop reads: window.PRODUCTS = [ ... ];
define('CATALOGUE_FILE', SITE_ROOT . '/js/products.js');

// Writable admin storage (throttle counters, password override, backups).
// Preferred location is one level ABOVE the web root — on cPanel that is
// /home/<user>/akhmeteli-admin, which no URL can ever reach. Hosts that keep
// the parent read-only fall back to admin/data + admin/backups, which the
// bundled .htaccess files deny.
$akh_private = dirname(SITE_ROOT) . '/akhmeteli-admin';
if (!is_dir($akh_private)) {
    @mkdir($akh_private, 0700, true);
}
$akh_private_ok = is_dir($akh_private) && is_writable($akh_private);
define('ADMIN_DATA', $akh_private_ok ? $akh_private . '/data' : __DIR__ . '/data');
define('ADMIN_BACKUPS', $akh_private_ok ? $akh_private . '/backups' : __DIR__ . '/backups');
unset($akh_private, $akh_private_ok);

// How many catalogue backups to keep before pruning the oldest.
define('BACKUP_KEEP', 40);

// Brute-force protection: attempts allowed per IP, then lockout seconds.
define('LOGIN_MAX_ATTEMPTS', 8);
define('LOGIN_LOCK_SECONDS', 900);   // 15 minutes

// Session lifetimes.
define('SESSION_IDLE_SECONDS', 3 * 3600);    // logged out after 3h of inactivity
define('SESSION_MAX_SECONDS', 12 * 3600);    // hard cap regardless of activity

// Uploads.
define('UPLOAD_MAX_BYTES', 8 * 1024 * 1024); // 8 MB
