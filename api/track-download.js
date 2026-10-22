// POST /api/track-download — counts one APK download (Vercel serverless).
// One count per IP per file per 10 minutes, so repeat clicks can't inflate it.

import {
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
    if (await rateLimited(`trackdl:${ip}`, 20, 60)) return res.status(429).json({ ok: false });

    const file = String(jsonBody(req).file || "");
    if (!/^[A-Za-z0-9 ._()[\]-]{1,150}$/.test(file)) {
      return res.status(400).json({ error: "Invalid file name" });
    }

    const [firstSeen] = await redisPipeline([
      ["SET", `dedupe:dl:${ip}:${file}`, "1", "EX", "600", "NX"],
    ]);
    if (firstSeen === null) return res.status(200).json({ ok: true, counted: false });

    const geo = getGeo(req);
    const event = {
      ts: new Date().toISOString(),
      ip,
      file,
      source: "site",
      country: geo.country,
      city: geo.city,
    };

    await redisPipeline([
      ["INCR", "downloads:total"],
      ["ZINCRBY", "downloads:byfile", "1", file],
      ["LPUSH", "downloads:log", JSON.stringify(event)],
      ["LTRIM", "downloads:log", "0", "999"],
    ]);

    res.status(200).json({ ok: true, counted: true });
  } catch (err) {
    console.error("track-download failed:", err);
    res.status(500).json({ error: "Analytics error" });
  }
}
