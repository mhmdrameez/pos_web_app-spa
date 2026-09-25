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

const PORT = Number(process.env.PORT || 8787);
const SESSION_SECRET = process.env.SESSION_SECRET || "dev-secret";
const ADMIN_USER = process.env.ADMIN_USER || "developer";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "QuickBill@2026";

const DATA_FILE = path.join(ROOT, "data", "releases.json");
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
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, product: "QuickBill POS" });
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
  app.use(express.static(DIST_DIR));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(DIST_DIR, "index.html"));
  });
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Server error" });
});

app.listen(PORT, () => {
  console.log(`QuickBill release server on http://127.0.0.1:${PORT}`);
});
