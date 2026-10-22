// Lightweight visit / download beacons sent to the QuickBill release server.
// Analytics must never break the site: every call fails silently.

const API_BASE = (import.meta.env.VITE_API_BASE || "").trim().replace(/\/$/, "");

function post(endpoint: string, payload: Record<string, string>) {
  const url = `${API_BASE}${endpoint}`;
  const body = JSON.stringify(payload);
  try {
    // sendBeacon survives page unloads (e.g. a download click that navigates away)
    const blob = new Blob([body], { type: "application/json" });
    if (navigator.sendBeacon && navigator.sendBeacon(url, blob)) return;
  } catch {
    /* fall through to fetch */
  }
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {});
}

/** Records one visit per browser session. IP + location are resolved server-side. */
export function trackVisit() {
  try {
    if (sessionStorage.getItem("qb_visited")) return;
    sessionStorage.setItem("qb_visited", "1");
  } catch {
    /* private mode: the server dedupes repeat beacons anyway */
  }
  post("/api/track", {
    path: window.location.pathname,
    referrer: document.referrer || "",
    lang: navigator.language || "",
    screen: `${window.screen.width}x${window.screen.height}`,
  });
}

/** Records an APK download click. The server dedupes per IP to keep counts honest. */
export function trackDownload(fileName: string) {
  if (!fileName) return;
  post("/api/track-download", { file: fileName });
}
