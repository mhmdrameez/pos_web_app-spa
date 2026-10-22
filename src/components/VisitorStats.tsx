import { useCallback, useEffect, useState } from "react";
import { STATIC_ADMIN_PASSWORD } from "../api";

const API_BASE = (import.meta.env.VITE_API_BASE || "").trim().replace(/\/$/, "");

type TopEntry = { name: string; count: number };

type Visit = {
  ts: string;
  ip: string;
  path: string;
  referrer: string;
  country: string;
  city: string;
  region: string;
  isp: string;
};

type DownloadEvent = {
  ts: string;
  ip: string;
  file: string;
  source: string;
  country: string;
  city: string;
};

type Stats = {
  visitors: {
    total: number;
    unique: number;
    today: number;
    last7Days: number;
    topCountries: TopEntry[];
    topCities: TopEntry[];
    topPages: TopEntry[];
    recent: Visit[];
  };
  downloads: {
    total: number;
    byFile: Record<string, number>;
    recent: DownloadEvent[];
  };
};

/**
 * Logs in to the analytics server (cookie session) alongside the static admin
 * login, so the /api/stats endpoint can be read. Fire-and-forget.
 */
export function serverLogin(userId: string, password: string) {
  fetch(`${API_BASE}/api/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, password }),
  }).catch(() => {});
}

const cardStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid var(--line)",
  borderRadius: 14,
  padding: "14px 16px",
  flex: "1 1 130px",
  minWidth: 130,
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  fontSize: 11.5,
  textTransform: "uppercase",
  letterSpacing: 0.4,
  color: "var(--muted)",
  padding: "6px 10px",
  borderBottom: "1px solid var(--line)",
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  fontSize: 12.5,
  padding: "6px 10px",
  borderBottom: "1px solid var(--line)",
  verticalAlign: "top",
};

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div style={cardStyle}>
      <div style={{ fontSize: 24, fontWeight: 800, color: "var(--navy)" }}>{value}</div>
      <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 700 }}>{label}</div>
    </div>
  );
}

function TopList({ title, entries }: { title: string; entries: TopEntry[] }) {
  return (
    <div style={{ ...cardStyle, flex: "1 1 220px" }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: "var(--navy)", marginBottom: 8 }}>{title}</div>
      {entries.length === 0 ? (
        <div style={{ fontSize: 12.5, color: "var(--muted)" }}>No data yet</div>
      ) : (
        entries.slice(0, 6).map((e) => (
          <div
            key={e.name}
            style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, padding: "3px 0" }}
          >
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "75%" }}>
              {e.name || "Unknown"}
            </span>
            <strong>{e.count}</strong>
          </div>
        ))
      )}
    </div>
  );
}

export default function VisitorStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/stats`, {
        credentials: "include",
        headers: { Authorization: `Bearer ${STATIC_ADMIN_PASSWORD}` },
      });
      if (res.status === 401) {
        throw new Error(
          "Unauthorized: the admin password the site was built with doesn't match the analytics server's password."
        );
      }
      if (!res.ok) {
        let serverMsg = "";
        try {
          serverMsg = (await res.json())?.error || "";
        } catch {
          /* non-JSON error page */
        }
        if (serverMsg) throw new Error(serverMsg);
        throw new Error(
          res.status === 404
            ? "Analytics API not found on this host. Redeploy the site so the /api functions are included, and add the free Upstash Redis integration in Vercel."
            : `Analytics server error (${res.status})`
        );
      }
      setStats(await res.json());
    } catch (err: any) {
      setError(
        err?.name === "TypeError" || /fetch/i.test(err?.message || "")
          ? "Analytics server is not reachable. It runs on the Express release server (npm run dev:server / npm start)."
          : err?.message || "Failed to load analytics"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const fmtTime = (iso: string) => {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
  };

  const place = (v: { city?: string; region?: string; country?: string }) =>
    [v.city, v.region, v.country].filter(Boolean).join(", ") || "Unknown";

  return (
    <div
      style={{
        background: "#f8fafc",
        border: "1px solid var(--line)",
        borderRadius: 16,
        padding: "16px 20px",
        marginTop: 24,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 800, color: "var(--navy)" }}>📊 Visitor Analytics</div>
          <div style={{ fontSize: 12.5, color: "var(--muted)" }}>
            Visits, locations and APK download counts collected by the release server (free, no third-party trackers).
          </div>
        </div>
        <button
          type="button"
          className="btn btn-outline"
          onClick={load}
          disabled={loading}
          style={{ padding: "7px 12px", fontSize: 13 }}
        >
          {loading ? "Loading…" : "↻ Refresh"}
        </button>
      </div>

      {error && (
        <div className="err" style={{ marginTop: 12 }}>
          ⚠️ {error}
        </div>
      )}

      {stats && (
        <>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
            <StatCard label="Total visits" value={stats.visitors.total} />
            <StatCard label="Unique visitors" value={stats.visitors.unique} />
            <StatCard label="Visits today" value={stats.visitors.today} />
            <StatCard label="Last 7 days" value={stats.visitors.last7Days} />
            <StatCard label="APK downloads" value={stats.downloads.total} />
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
            <TopList title="Top countries" entries={stats.visitors.topCountries} />
            <TopList title="Top cities" entries={stats.visitors.topCities} />
            <TopList title="Top pages" entries={stats.visitors.topPages} />
            <TopList
              title="Downloads by file"
              entries={Object.entries(stats.downloads.byFile)
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count)}
            />
          </div>

          <div style={{ ...cardStyle, marginTop: 10, overflowX: "auto" }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "var(--navy)", marginBottom: 8 }}>
              Recent visitors
            </div>
            {stats.visitors.recent.length === 0 ? (
              <div style={{ fontSize: 12.5, color: "var(--muted)" }}>No visits recorded yet.</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Time</th>
                    <th style={thStyle}>IP address</th>
                    <th style={thStyle}>Location</th>
                    <th style={thStyle}>ISP</th>
                    <th style={thStyle}>Page</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.visitors.recent.map((v, i) => (
                    <tr key={`${v.ts}-${i}`}>
                      <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>{fmtTime(v.ts)}</td>
                      <td style={{ ...tdStyle, fontFamily: "monospace" }}>{v.ip}</td>
                      <td style={tdStyle}>{place(v)}</td>
                      <td style={tdStyle}>{v.isp || "—"}</td>
                      <td style={tdStyle}>{v.path}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div style={{ ...cardStyle, marginTop: 10, overflowX: "auto" }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "var(--navy)", marginBottom: 8 }}>
              Recent downloads
            </div>
            {stats.downloads.recent.length === 0 ? (
              <div style={{ fontSize: 12.5, color: "var(--muted)" }}>No downloads recorded yet.</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Time</th>
                    <th style={thStyle}>IP address</th>
                    <th style={thStyle}>Location</th>
                    <th style={thStyle}>File</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.downloads.recent.map((d, i) => (
                    <tr key={`${d.ts}-${i}`}>
                      <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>{fmtTime(d.ts)}</td>
                      <td style={{ ...tdStyle, fontFamily: "monospace" }}>{d.ip}</td>
                      <td style={tdStyle}>{place(d)}</td>
                      <td style={{ ...tdStyle, wordBreak: "break-all" }}>{d.file}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
