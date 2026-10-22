// GET /api/stats — full visitor & download analytics (Vercel serverless).
// Protected: requires the admin password as a Bearer token.
// Response shape matches the Express /api/stats so the admin panel works on both.

import { isStatsAuthorized, NOT_CONFIGURED_MSG, redisConfigured, redisPipeline } from "./_lib.js";

function zsetToTop(flat, limit = 10) {
  const out = [];
  for (let i = 0; i + 1 < (flat || []).length && out.length < limit; i += 2) {
    out.push({ name: flat[i], count: Number(flat[i + 1]) });
  }
  return out;
}

function parseLog(rows) {
  const out = [];
  for (const row of rows || []) {
    try {
      out.push(JSON.parse(row));
    } catch {
      // skip malformed rows
    }
  }
  return out;
}

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  if (!isStatsAuthorized(req)) return res.status(401).json({ error: "Unauthorized" });
  if (!redisConfigured()) return res.status(503).json({ error: NOT_CONFIGURED_MSG });

  try {
    const dayKeys = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      dayKeys.push(`visits:day:${d.toISOString().slice(0, 10)}`);
    }

    const [
      total,
      unique,
      dayCounts,
      byCountry,
      byCity,
      byPage,
      visitLog,
      dlTotal,
      dlByFile,
      dlLog,
    ] = await redisPipeline([
      ["GET", "visits:total"],
      ["PFCOUNT", "visits:uniq"],
      ["MGET", ...dayKeys],
      ["ZRANGE", "visits:bycountry", "0", "9", "REV", "WITHSCORES"],
      ["ZRANGE", "visits:bycity", "0", "9", "REV", "WITHSCORES"],
      ["ZRANGE", "visits:bypage", "0", "9", "REV", "WITHSCORES"],
      ["LRANGE", "visits:log", "0", "49"],
      ["GET", "downloads:total"],
      ["ZRANGE", "downloads:byfile", "0", "-1", "REV", "WITHSCORES"],
      ["LRANGE", "downloads:log", "0", "49"],
    ]);

    const days = (dayCounts || []).map((n) => Number(n) || 0);
    const byFile = {};
    for (const entry of zsetToTop(dlByFile, 1000)) byFile[entry.name] = entry.count;

    res.status(200).json({
      visitors: {
        total: Number(total) || 0,
        unique: Number(unique) || 0,
        today: days[0] || 0,
        last7Days: days.reduce((a, b) => a + b, 0),
        topCountries: zsetToTop(byCountry),
        topCities: zsetToTop(byCity),
        topPages: zsetToTop(byPage),
        recent: parseLog(visitLog),
      },
      downloads: {
        total: Number(dlTotal) || 0,
        byFile,
        recent: parseLog(dlLog),
      },
    });
  } catch (err) {
    console.error("stats failed:", err);
    res.status(500).json({ error: "Analytics error" });
  }
}
