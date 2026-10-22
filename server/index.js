import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import multer from "multer";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

// --port=NNNN (used by dev:server) wins over PORT, so tooling that injects
// PORT for the Vite dev server can't collide with the API server in dev.
const portArg = process.argv.find((a) => a.startsWith("--port="));
const PORT = Number(portArg ? portArg.split("=")[1] : process.env.PORT || 8787);
const SESSION_SECRET = process.env.SESSION_SECRET || "dev-secret";
const ADMIN_USER = process.env.ADMIN_USER || "developer";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "QuickBill@2026";

const DATA_FILE = path.join(ROOT, "data", "releases.json");
const VISITS_FILE = path.join(ROOT, "data", "visitors.json");
const DOWNLOADS_FILE = path.join(ROOT, "data", "downloads.json");
const GEO_CACHE_FILE = path.join(ROOT, "data", "geo-cache.json");
const APK_DIR = path.join(ROOT, "uploads", "apks");
const DIST_DIR = path.join(ROOT, "dist");

fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
fs.mkdirSync(APK_DIR, { recursive: true });
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]");

const sessions = new Map();

function readReleases() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch {
    return [];
  }
}

function writeReleases(list) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2));
}

function signToken(id) {
  return crypto.createHmac("sha256", SESSION_SECRET).update(id).digest("hex");
}

function createSession() {
  const id = crypto.randomBytes(24).toString("hex");
  sessions.set(id, { createdAt: Date.now() });
  return `${id}.${signToken(id)}`;
}

function readSession(cookieValue) {
  if (!cookieValue) return null;
  const [id, sig] = String(cookieValue).split(".");
  if (!id || !sig) return null;
  const expected = signToken(id);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  return sessions.get(id) ? id : null;
}

function requireAuth(req, res, next) {
  const sid = readSession(req.cookies.qb_session);
  if (!sid) {
    return res.status(401).json({ error: "Unauthorized. Sign in to upload releases." });
  }
  req.sessionId = sid;
  next();
}

// Stats also accept the admin password as a Bearer token, matching the Vercel
// serverless /api/stats, so the admin panel works the same on both backends.
function requireStatsAuth(req, res, next) {
  const sid = readSession(req.cookies.qb_session);
  if (sid) {
    req.sessionId = sid;
    return next();
  }
  const got = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  const a = Buffer.from(got);
  const b = Buffer.from(ADMIN_PASSWORD);
  if (a.length === b.length && crypto.timingSafeEqual(a, b)) return next();
  return res.status(401).json({ error: "Unauthorized" });
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let n = bytes / 1024;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i += 1;
  }
  return `${n.toFixed(n >= 10 || i === 0 ? 1 : 2)} ${units[i]}`;
}

function publicRelease(row) {
  return {
    id: row.id,
    version: row.version,
    notes: row.notes,
    fileName: row.fileName,
    sizeBytes: row.sizeBytes,
    sizeLabel: formatBytes(row.sizeBytes),
    uploadedAt: row.uploadedAt,
    downloadUrl: `/api/download/${row.id}`,
  };
}

/* ---------------- Visitor & download analytics ---------------- */

const MAX_EVENT_ROWS = 5000; // keep the JSON files bounded; running totals never reset

function readJsonFile(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

// Write to a temp file then rename, so a crash mid-write can't corrupt the data file.
function writeJsonFileAtomic(file, data) {
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, file);
}

const visitsDb = readJsonFile(VISITS_FILE, { total: 0, visits: [] });
const downloadsDb = readJsonFile(DOWNLOADS_FILE, { total: 0, byFile: {}, events: [] });
const geoCache = new Map(Object.entries(readJsonFile(GEO_CACHE_FILE, {})));

let analyticsSaveTimer = null;
function scheduleAnalyticsSave() {
  if (analyticsSaveTimer) return;
  analyticsSaveTimer = setTimeout(() => {
    analyticsSaveTimer = null;
    try {
      writeJsonFileAtomic(VISITS_FILE, visitsDb);
      writeJsonFileAtomic(DOWNLOADS_FILE, downloadsDb);
      writeJsonFileAtomic(GEO_CACHE_FILE, Object.fromEntries(geoCache));
    } catch (err) {
      console.error("Analytics save failed:", err);
    }
  }, 2000);
}

function getClientIp(req) {
  // req.ip respects the trust-proxy setting; never read X-Forwarded-For directly.
  let ip = req.ip || req.socket?.remoteAddress || "";
  if (ip.startsWith("::ffff:")) ip = ip.slice(7);
  return ip.slice(0, 45);
}

function isPrivateIp(ip) {
  return (
    !ip ||
    ip === "::1" ||
    ip === "127.0.0.1" ||
    /^10\./.test(ip) ||
    /^192\.168\./.test(ip) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(ip) ||
    /^(fc|fd|fe80)/i.test(ip)
  );
}

const UNKNOWN_GEO = Object.freeze({
  country: "Unknown",
  countryCode: "",
  region: "",
  city: "",
  lat: null,
  lon: null,
  isp: "",
  timezone: "",
});

const GEO_TTL_MS = 30 * 24 * 60 * 60 * 1000;

// Free IP geolocation via ipwho.is (no API key). Each unique IP is looked up
// once and cached for 30 days, which keeps us far below the free quota.
async function lookupGeo(ip) {
  if (isPrivateIp(ip)) return { ...UNKNOWN_GEO, country: "Local / Private network" };
  const cached = geoCache.get(ip);
  if (cached && Date.now() - cached.at < GEO_TTL_MS) return cached.geo;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, { signal: ctrl.signal });
    clearTimeout(timer);
    const data = await res.json();
    const geo =
      data && data.success
        ? {
            country: String(data.country || "Unknown").slice(0, 60),
            countryCode: String(data.country_code || "").slice(0, 4),
            region: String(data.region || "").slice(0, 60),
            city: String(data.city || "").slice(0, 60),
            lat: typeof data.latitude === "number" ? data.latitude : null,
            lon: typeof data.longitude === "number" ? data.longitude : null,
            isp: String(data.connection?.isp || "").slice(0, 80),
            timezone: String(data.timezone?.id || "").slice(0, 50),
          }
        : UNKNOWN_GEO;
    geoCache.set(ip, { at: Date.now(), geo });
    if (geoCache.size > 20000) geoCache.delete(geoCache.keys().next().value);
    scheduleAnalyticsSave();
    return geo;
  } catch {
    return UNKNOWN_GEO; // lookup failure must never block the visitor
  }
}

// Tiny in-memory sliding-window rate limiter; also used to dedupe repeat events.
const rlHits = new Map();
function rateLimited(key, limit, windowMs) {
  const now = Date.now();
  const hits = (rlHits.get(key) || []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    rlHits.set(key, hits);
    return true;
  }
  hits.push(now);
  rlHits.set(key, hits);
  return false;
}
setInterval(() => {
  const now = Date.now();
  for (const [key, hits] of rlHits) {
    const live = hits.filter((t) => now - t < 10 * 60 * 1000);
    if (live.length) rlHits.set(key, live);
    else rlHits.delete(key);
  }
}, 10 * 60 * 1000).unref();

// Strip control characters and cap length on anything that came from the client.
function cleanStr(value, max) {
  return String(value ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .slice(0, max);
}

async function recordDownload(req, fileName, source) {
  const ip = getClientIp(req);
  const file = cleanStr(fileName, 150);
  if (!file) return false;
  // One count per IP per file per 10 minutes: repeat clicks and refresh spam
  // don't inflate the counter, so the number stays an honest download count.
  if (rateLimited(`dl:${ip}:${file}`, 1, 10 * 60 * 1000)) return false;
  const geo = await lookupGeo(ip);
  downloadsDb.total += 1;
  downloadsDb.byFile[file] = (downloadsDb.byFile[file] || 0) + 1;
  downloadsDb.events.push({
    ts: new Date().toISOString(),
    ip,
    file,
    source,
    country: geo.country,
    city: geo.city,
  });
  if (downloadsDb.events.length > MAX_EVENT_ROWS) {
    downloadsDb.events.splice(0, downloadsDb.events.length - MAX_EVENT_ROWS);
  }
  scheduleAnalyticsSave();
  return true;
}

/* --------------------------------------------------------------- */

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, APK_DIR),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok =
      file.originalname.toLowerCase().endsWith(".apk") ||
      file.mimetype === "application/vnd.android.package-archive" ||
      file.mimetype === "application/octet-stream";
    if (!ok) return cb(new Error("Only .apk files are accepted"));
    cb(null, true);
  },
});

const app = express();
app.disable("x-powered-by");
// Trust exactly one proxy hop (Render/nginx/Vercel) so req.ip is the real client
// IP but a client can't spoof it by sending its own X-Forwarded-For chain.
app.set("trust proxy", Number(process.env.TRUST_PROXY ?? 1));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, product: "QuickBill POS" });
});

// Visit beacon: called once per browser session by the site. Captures IP,
// free geolocation, page, referrer. Rate limited + deduped server-side.
app.post("/api/track", async (req, res) => {
  const ip = getClientIp(req);
  if (rateLimited(`track:${ip}`, 10, 60 * 1000)) return res.status(429).json({ ok: false });
  const ua = cleanStr(req.headers["user-agent"], 300);
  // The same IP + browser within 60s is one visit, however many beacons arrive.
  if (rateLimited(`visit:${ip}:${ua}`, 1, 60 * 1000)) return res.json({ ok: true, deduped: true });

  let pagePath = cleanStr(req.body?.path, 200);
  if (!pagePath.startsWith("/")) pagePath = "/";
  const geo = await lookupGeo(ip);
  visitsDb.total += 1;
  visitsDb.visits.push({
    ts: new Date().toISOString(),
    ip,
    path: pagePath,
    referrer: cleanStr(req.body?.referrer, 300),
    ua,
    lang: cleanStr(req.body?.lang, 40),
    screen: cleanStr(req.body?.screen, 20),
    ...geo,
  });
  if (visitsDb.visits.length > MAX_EVENT_ROWS) {
    visitsDb.visits.splice(0, visitsDb.visits.length - MAX_EVENT_ROWS);
  }
  scheduleAnalyticsSave();
  res.json({ ok: true });
});

// Download beacon for GitHub-hosted APK links clicked on the site.
app.post("/api/track-download", async (req, res) => {
  const ip = getClientIp(req);
  if (rateLimited(`trackdl:${ip}`, 20, 60 * 1000)) return res.status(429).json({ ok: false });
  const file = String(req.body?.file || "");
  if (!/^[A-Za-z0-9 ._()[\]-]{1,150}$/.test(file)) {
    return res.status(400).json({ error: "Invalid file name" });
  }
  const counted = await recordDownload(req, file, "site");
  res.json({ ok: true, counted });
});

// Public counters only — no IPs or personal data exposed here.
app.get("/api/downloads/count", (req, res) => {
  if (rateLimited(`dlcount:${getClientIp(req)}`, 30, 60 * 1000)) {
    return res.status(429).json({ ok: false });
  }
  res.json({ total: downloadsDb.total, byFile: downloadsDb.byFile });
});

// Full analytics (IPs, locations, recent visitors) — admin session required.
app.get("/api/stats", requireStatsAuth, (_req, res) => {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const visits = visitsDb.visits;
  const countedWithin = (ms) => visits.filter((v) => now - new Date(v.ts).getTime() < ms).length;
  const topBy = (rows, key, limit = 10) => {
    const counts = new Map();
    for (const row of rows) {
      const k = row[key] || "Unknown";
      counts.set(k, (counts.get(k) || 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([name, count]) => ({ name, count }));
  };
  res.json({
    visitors: {
      total: visitsDb.total,
      unique: new Set(visits.map((v) => v.ip)).size,
      today: countedWithin(dayMs),
      last7Days: countedWithin(7 * dayMs),
      topCountries: topBy(visits, "country"),
      topCities: topBy(visits, "city"),
      topPages: topBy(visits, "path"),
      recent: visits.slice(-50).reverse(),
    },
    downloads: {
      total: downloadsDb.total,
      byFile: downloadsDb.byFile,
      recent: downloadsDb.events.slice(-50).reverse(),
    },
  });
});

app.get("/api/releases", (_req, res) => {
  const list = readReleases()
    .slice()
    .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
    .map(publicRelease);
  res.json({ releases: list, latest: list[0] || null });
});

app.get("/api/releases/latest", (_req, res) => {
  const list = readReleases().slice().sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
  if (!list.length) return res.json({ latest: null });
  res.json({ latest: publicRelease(list[0]) });
});

app.get("/api/download/:id", (req, res) => {
  const row = readReleases().find((r) => r.id === req.params.id);
  if (!row) return res.status(404).json({ error: "Release not found" });
  const filePath = path.join(APK_DIR, row.storedName);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: "APK file missing" });
  recordDownload(req, row.fileName, "server").catch(() => {});
  res.setHeader("Content-Type", "application/vnd.android.package-archive");
  res.setHeader("Content-Disposition", `attachment; filename="${row.fileName}"`);
  res.sendFile(filePath);
});

app.post("/api/login", (req, res) => {
  const userId = String(req.body?.userId || "").trim();
  const password = String(req.body?.password || "");
  const userOk = userId === ADMIN_USER;
  const passBuf = Buffer.from(password);
  const expected = Buffer.from(ADMIN_PASSWORD);
  const passOk = passBuf.length === expected.length && crypto.timingSafeEqual(passBuf, expected);
  if (!userOk || !passOk) {
    return res.status(401).json({ error: "Invalid user ID or password" });
  }
  const token = createSession();
  const isProd = process.env.NODE_ENV === "production";
  const crossOrigin = process.env.CROSS_ORIGIN_COOKIE === "true";
  res.cookie("qb_session", token, {
    httpOnly: true,
    sameSite: crossOrigin ? "none" : (isProd ? "none" : "lax"),
    secure: crossOrigin || isProd,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
  res.json({ ok: true, userId: ADMIN_USER });
});

app.post("/api/logout", (req, res) => {
  const sid = readSession(req.cookies.qb_session);
  if (sid) sessions.delete(sid);
  const isProd = process.env.NODE_ENV === "production";
  const crossOrigin = process.env.CROSS_ORIGIN_COOKIE === "true";
  res.clearCookie("qb_session", {
    path: "/",
    sameSite: crossOrigin ? "none" : (isProd ? "none" : "lax"),
    secure: crossOrigin || isProd,
  });
  res.json({ ok: true });
});

app.get("/api/me", (req, res) => {
  const sid = readSession(req.cookies.qb_session);
  if (!sid) return res.json({ authenticated: false });
  res.json({ authenticated: true, userId: ADMIN_USER });
});

app.post("/api/releases", requireAuth, (req, res) => {
  upload.single("apk")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || "Upload failed" });
    }
    if (!req.file) return res.status(400).json({ error: "Choose an APK file to upload" });

    const version = String(req.body?.version || "").trim();
    const notes = String(req.body?.notes || "").trim();
    if (!version) {
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({ error: "Release version is required" });
    }
    if (!/^[vV]?\d+(\.\d+){1,3}([.-][A-Za-z0-9]+)?$/.test(version)) {
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({
        error: "Use a version like 1.0.0, 1.2.3, or 1.0.0-beta",
      });
    }

    const list = readReleases();
    if (list.some((r) => r.version.toLowerCase() === version.toLowerCase())) {
      fs.unlink(req.file.path, () => {});
      return res.status(409).json({ error: `Version ${version} already exists` });
    }

    const stats = fs.statSync(req.file.path);
    const row = {
      id: crypto.randomBytes(8).toString("hex"),
      version,
      notes,
      fileName: req.file.originalname.endsWith(".apk")
        ? req.file.originalname
        : `${req.file.originalname}.apk`,
      storedName: path.basename(req.file.filename),
      sizeBytes: stats.size,
      uploadedAt: new Date().toISOString(),
    };
    list.push(row);
    writeReleases(list);
    res.status(201).json({ release: publicRelease(row) });
  });
});

app.delete("/api/releases/:id", requireAuth, (req, res) => {
  const list = readReleases();
  const idx = list.findIndex((r) => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Release not found" });
  const [removed] = list.splice(idx, 1);
  writeReleases(list);
  const filePath = path.join(APK_DIR, removed.storedName);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  res.json({ ok: true });
});

if (fs.existsSync(DIST_DIR)) {
  // Prerendered pages: /privacy-policy -> privacy-policy.html, /hi -> hi/index.html, /hi/x -> hi/x.html
  app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api") || path.extname(req.path)) return next();
    const clean = req.path.replace(/\/+$/, "");
    if (!clean) return next();
    for (const candidate of [`${clean}.html`, `${clean}/index.html`]) {
      const file = path.join(DIST_DIR, candidate);
      if (file.startsWith(DIST_DIR) && fs.existsSync(file) && fs.statSync(file).isFile()) {
        return res.sendFile(file);
      }
    }
    next();
  });
  app.use(express.static(DIST_DIR));
  app.get("/apk-upload", (_req, res) => {
    res.set("X-Robots-Tag", "noindex, nofollow");
    res.sendFile(path.join(DIST_DIR, "app.html"));
  });
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    const notFound = path.join(DIST_DIR, "404.html");
    res.status(404).sendFile(fs.existsSync(notFound) ? notFound : path.join(DIST_DIR, "index.html"));
  });
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Server error" });
});

app.listen(PORT, () => {
  console.log(`QuickBill release server on http://127.0.0.1:${PORT}`);
});
