// Shared helpers for the Vercel serverless analytics API.
// Storage is Upstash Redis (free tier) over its REST API — no SDK required.
// Geolocation comes free from Vercel's own x-vercel-ip-* request headers.

import crypto from "node:crypto";

const REST_URL = (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || "").replace(/\/$/, "");
const REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || "";

export function redisConfigured() {
  return Boolean(REST_URL && REST_TOKEN);
}

/** Runs several Redis commands in one round trip. Throws on any command error. */
export async function redisPipeline(commands) {
  const res = await fetch(`${REST_URL}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${REST_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(commands),
  });
  if (!res.ok) throw new Error(`Redis REST error ${res.status}`);
  const out = await res.json();
  return out.map((r) => {
    if (r.error) throw new Error(r.error);
    return r.result;
  });
}

export function getIp(req) {
  // Vercel sets x-real-ip / x-forwarded-for itself; clients cannot spoof them here.
  const raw = String(req.headers["x-real-ip"] || req.headers["x-forwarded-for"] || "");
  return raw.split(",")[0].trim().slice(0, 45);
}

const regionNames = (() => {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" });
  } catch {
    return null;
  }
})();

function decodeHeader(value) {
  const s = String(value || "");
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

/** Free geolocation from Vercel's request headers (country, region, city, coords). */
export function getGeo(req) {
  const h = req.headers;
  const code = String(h["x-vercel-ip-country"] || "").toUpperCase().slice(0, 2);
  let country = "Unknown";
  if (code && regionNames) {
    try {
      country = regionNames.of(code) || code;
    } catch {
      country = code;
    }
  } else if (code) {
    country = code;
  }
  const lat = parseFloat(String(h["x-vercel-ip-latitude"] || ""));
  const lon = parseFloat(String(h["x-vercel-ip-longitude"] || ""));
  return {
    country,
    countryCode: code,
    region: decodeHeader(h["x-vercel-ip-country-region"]).slice(0, 60),
    city: decodeHeader(h["x-vercel-ip-city"]).slice(0, 60),
    lat: Number.isFinite(lat) ? lat : null,
    lon: Number.isFinite(lon) ? lon : null,
    isp: "",
    timezone: String(h["x-vercel-ip-timezone"] || "").slice(0, 50),
  };
}

export function jsonBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}

/** Strip control characters and cap length on anything that came from the client. */
export function cleanStr(value, max) {
  return String(value ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .slice(0, max);
}

/** Sliding-window-ish rate limit backed by Redis (INCR + EXPIRE). */
export async function rateLimited(key, limit, windowSec) {
  const [count] = await redisPipeline([
    ["INCR", `rl:${key}`],
    ["EXPIRE", `rl:${key}`, String(windowSec), "NX"],
  ]);
  return Number(count) > limit;
}

/** Stats are protected by the admin password sent as a Bearer token. */
export function isStatsAuthorized(req) {
  const expected =
    process.env.STATS_PASSWORD || process.env.VITE_ADMIN_PASSWORD || "QuickBill@2026";
  const got = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  const a = Buffer.from(got);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export const NOT_CONFIGURED_MSG =
  "Analytics storage is not set up yet: add the free Upstash Redis integration in your Vercel dashboard (Storage → Upstash → Redis), connect it to this project and redeploy.";
