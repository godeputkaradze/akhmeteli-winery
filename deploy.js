// Akhmeteli Winery — FTP/FTPS upload to cPanel shared hosting (domenebi.ge).
//
//   node deploy.js files    offline: list exactly what would be uploaded
//   node deploy.js test     read-only: connect and list the remote root
//   node deploy.js upload   mirror the site into the remote docroot
//   node deploy.js upload js/products.js css/style.css   push only these files
//
// Credentials live in .deploy.json (gitignored) — see .deploy.example.json.
const ftp = require("basic-ftp");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const MODE = process.argv[2] || "test";
// `files` is offline, so it must not require credentials to exist yet.
const cfg = MODE === "files"
  ? {}
  : JSON.parse(fs.readFileSync(path.join(__dirname, ".deploy.json"), "utf8"));
const ONLY = process.argv.slice(3);

// Never uploaded: local tooling, VCS, and the two dev-only asset dumps that
// only assets-gallery.html (an internal asset browser) points at.
const SKIP = new Set([
  "node_modules", ".git", ".claude", ".vercel", ".deploy.json",
  ".deploy.example.json", "package.json", "package-lock.json", "vercel.json",
  "deploy.js", "assets-gallery.html", "PRODUCTS 2", "New folder", ".gitignore",
  "CLAUDE.md", "README.md"
]);

async function connect() {
  const hosts = cfg.hostCandidates && cfg.hostCandidates.length ? cfg.hostCandidates : [cfg.host];
  const errors = [];
  for (const host of hosts) {
    for (const secure of [true, false]) {
      const client = new ftp.Client(60000);
      client.ftp.verbose = false;
      try {
        await client.access({
          host, port: cfg.port || 21, user: cfg.user, password: cfg.password,
          secure, secureOptions: { rejectUnauthorized: false }
        });
        console.log(`CONNECTED host=${host} secure=${secure}`);
        return client;
      } catch (e) {
        errors.push(`  ${host} secure=${secure} -> ${e.message}`);
        client.close();
      }
    }
  }
  throw new Error("All host candidates failed:\n" + errors.join("\n"));
}

function walk(dir, base = "") {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const rel = base ? base + "/" + entry.name : entry.name;
    if (entry.isDirectory()) out.push(...walk(path.join(dir, entry.name), rel));
    else out.push(rel);
  }
  return out;
}

function summarize(files) {
  const total = files.reduce((n, f) => n + fs.statSync(path.join(ROOT, f)).size, 0);
  return `${files.length} files, ${(total / 1048576).toFixed(1)} MB`;
}

(async () => {
  if (MODE === "files") {
    const files = walk(ROOT);
    files.forEach(f => console.log("  " + f));
    console.log(`\nWould upload ${summarize(files)}.`);
    return;
  }

  const client = await connect();
  try {
    const docroot = cfg.docroot || "public_html";
    await client.ensureDir(docroot);
    await client.cd(docroot);

    if (MODE === "test") {
      console.log(`\nRemote ${docroot}:`);
      for (const f of await client.list()) {
        console.log(`  ${f.isDirectory ? "d" : "-"} ${f.name}  ${f.size}`);
      }
      console.log("\nDry run — nothing was written. Run `node deploy.js upload` to publish.");
      return;
    }

    if (MODE !== "upload") throw new Error(`unknown mode "${MODE}" (use test | upload)`);

    const files = ONLY.length ? ONLY : walk(ROOT);
    const total = files.reduce((n, f) => n + fs.statSync(path.join(ROOT, f)).size, 0);
    console.log(`\nUploading ${files.length} files (${(total / 1048576).toFixed(1)} MB) -> ${docroot}\n`);

    let done = 0, bytes = 0;
    for (const rel of files) {
      const local = path.join(ROOT, rel);
      const dir = path.posix.dirname(rel);
      if (dir !== ".") {
        await client.ensureDir(dir);
        await client.cd("/" + docroot);
      }
      await client.uploadFrom(local, rel);
      done++;
      bytes += fs.statSync(local).size;
      console.log(`  [${String(done).padStart(3)}/${files.length}] ${rel}  (${(bytes / 1048576).toFixed(1)} MB)`);
    }
    console.log(`\nDone — ${done} files, ${(bytes / 1048576).toFixed(1)} MB.`);
  } finally {
    client.close();
  }
})().catch(e => { console.error("FAILED:", e.message); process.exit(1); });
