// POST /api/track — records one site visit (Vercel serverless).
// Mirrors the Express endpoint in server/index.js so the same frontend
// beacon works on both the static Vercel deployment and the self-hosted server.

import {
  cleanStr,
  getGeo,
  getIp,
  jsonBody,
  NOT_CONFIGURED_MSG,
  rateLimited,
  redisConfigured,
  redisPipeline,
} from "./_lib.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!redisConfigured()) return res.status(503).json({ error: NOT_CONFIGURED_MSG });

  try {
    const ip = getIp(req);
    if (await rateLimited(`track:${ip}`, 10, 60)) return res.status(429).json({ ok: false });

    // The same IP within 60s is one visit, however many beacons arrive.
    const [firstSeen] = await redisPipeline([["SET", `dedupe:visit:${ip}`, "1", "EX", "60", "NX"]]);
    if (firstSeen === null) return res.status(200).json({ ok: true, deduped: true });

    const body = jsonBody(req);
    let pagePath = cleanStr(body.path, 200);
    if (!pagePath.startsWith("/")) pagePath = "/";
    const geo = getGeo(req);
    const day = new Date().toISOString().slice(0, 10);
    const visit = {
      ts: new Date().toISOString(),
      ip,
      path: pagePath,
      referrer: cleanStr(body.referrer, 300),
      ua: cleanStr(req.headers["user-agent"], 300),
      lang: cleanStr(body.lang, 40),
      screen: cleanStr(body.screen, 20),
      ...geo,
    };

    await redisPipeline([
      ["INCR", "visits:total"],
      ["PFADD", "visits:uniq", ip],
      ["INCR", `visits:day:${day}`],
      ["EXPIRE", `visits:day:${day}`, String(8 * 24 * 3600), "NX"],
      ["ZINCRBY", "visits:bycountry", "1", geo.country],
      ["ZINCRBY", "visits:bycity", "1", geo.city || "Unknown"],
      ["ZINCRBY", "visits:bypage", "1", pagePath],
      ["LPUSH", "visits:log", JSON.stringify(visit)],
      ["LTRIM", "visits:log", "0", "999"],
    ]);

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("track failed:", err);
    res.status(500).json({ error: "Analytics error" });
  }
}
