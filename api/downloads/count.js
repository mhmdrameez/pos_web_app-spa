// GET /api/downloads/count — public aggregate download counters only.
// No IPs or personal data are exposed here.

import { getIp, notConfiguredBody, rateLimited, redisConfigured, redisPipeline } from "../_lib.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  if (!redisConfigured()) return res.status(503).json(notConfiguredBody());

  try {
    if (await rateLimited(`dlcount:${getIp(req)}`, 30, 60)) {
      return res.status(429).json({ ok: false });
    }
    const [total, flat] = await redisPipeline([
      ["GET", "downloads:total"],
      ["ZRANGE", "downloads:byfile", "0", "-1", "REV", "WITHSCORES"],
    ]);
    const byFile = {};
    for (let i = 0; i + 1 < (flat || []).length; i += 2) {
      byFile[flat[i]] = Number(flat[i + 1]);
    }
    res.status(200).json({ total: Number(total) || 0, byFile });
  } catch (err) {
    console.error("downloads/count failed:", err);
    res.status(500).json({ error: "Analytics error" });
  }
}
