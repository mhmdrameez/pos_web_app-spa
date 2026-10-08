import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchReleases, type Release } from "../api";

export default function Home() {
  const [latest, setLatest] = useState<Release | null>(null);
  const [allReleases, setAllReleases] = useState<Release[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeScreen, setActiveScreen] = useState<"mobile" | "web" | "history">("mobile");
  const [showOlderBuilds, setShowOlderBuilds] = useState(false);

  useEffect(() => {
    fetchReleases()
      .then((data) => {
        setLatest(data.latest);
        setAllReleases(data.releases || []);
      })
      .catch(() => {
        setLatest(null);
        setAllReleases([]);
      })
      .finally(() => setLoaded(true));

    function handleUpdate(e: any) {
      if (e.detail && Array.isArray(e.detail) && e.detail.length > 0) {
        setLatest(e.detail[0]);
        setAllReleases(e.detail);
      }
    }
    window.addEventListener("qb:releases_updated", handleUpdate);
    return () => window.removeEventListener("qb:releases_updated", handleUpdate);
  }, []);

  return (
    <>
      {/* Navigation Bar */}
      <header className="nav">
        <div className="wrap nav-inner">
          <a className="brand" href="#top" onClick={() => setMobileMenuOpen(false)}>
            <img src="/logo.svg" className="logo" alt="QuickBill POS" width={36} height={36} />
            QuickBill POS
          </a>
          <nav className="nav-links desktop-only">
            <a href="#screens">Preview</a>
            <a href="#features">Features</a>
            <a href="#download">Download APK</a>
            <a
              href="https://posquickbill.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--blue)", fontWeight: 700 }}
              title="Open Web POS"
            >
              Web POS App ↗
            </a>
            <Link to="/apk-upload" style={{ fontWeight: 600, color: "var(--navy)" }}>Admin</Link>
          </nav>

          {/* Mobile Navigation Toggle */}
          <div className="mobile-nav-toggle-wrap">
            <a
              className="btn btn-primary mobile-quick-cta"
              href="https://posquickbill.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ padding: "8px 14px", fontSize: 13 }}
            >
              Web POS ↗
            </a>
            <button
              type="button"
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <nav className="mobile-nav-drawer">
            <a href="#screens" onClick={() => setMobileMenuOpen(false)}>Preview</a>
            <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#download" onClick={() => setMobileMenuOpen(false)}>Download APK</a>
            <a
              href="https://posquickbill.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="mobile-highlight-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              🌐 Launch Web POS App ↗
            </a>
            <Link to="/apk-upload" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: 600, color: "var(--blue)" }}>
              Admin Panel
            </Link>
          </nav>
        )}
      </header>

      <main id="top">
        {/* Simple & High-Impact Hero Section */}
        <section className="hero">
          <div className="wrap grid-2">
            <div>
              <div className="kicker">
                <span className="dot" />
                Fast · Offline-First · Modern
              </div>
              <h1>QuickBill POS — Simple, Instant Point of Sale</h1>
              <p className="lede">
                High-speed retail billing, Bluetooth thermal receipt printing, and local sales history. Run directly in your browser or install on Android.
              </p>

              {/* Efficient Action Cards */}
              <div className="action-grid">
                {/* 1. Web POS Action Card */}
                <div className="action-card highlight">
                  <div>
                    <div className="action-card-header">
                      <span style={{ fontSize: 22 }}>🌐</span>
                      <span className="action-badge">No Install Needed</span>
                    </div>
                    <h3>Web POS Desk</h3>
                    <p>Instant browser billing with local offline history and thermal printing.</p>
                  </div>
                  <a
                    className="btn btn-primary"
                    href="https://posquickbill.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ width: "100%" }}
                  >
                    Launch Web POS ↗
                  </a>
                </div>

                {/* 2. Android APK Action Card */}
                <div className="action-card">
                  <div>
                    <div className="action-card-header">
                      <span style={{ fontSize: 22 }}>📱</span>
                      <span className="action-badge green">
                        {latest ? latest.version : "Android APK"}
                      </span>
                    </div>
                    <h3>App-POS (Android)</h3>
                    <p>Native mobile POS with Bluetooth printing, SQLite, and offline persistence.</p>
                  </div>
                  {latest ? (
                    <a
                      className="btn btn-dark"
                      href={latest.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ width: "100%" }}
                    >
                      Download APK ({latest.sizeLabel})
                    </a>
                  ) : (
                    <a className="btn btn-outline" href="#download" style={{ width: "100%" }}>
                      Download APK
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Clean Interactive Preview Card */}
            <div id="screens" className="card" style={{ padding: 18 }}>
              <div className="preview-tabs">
                <button
                  type="button"
                  className={`preview-tab-btn ${activeScreen === "mobile" ? "active" : ""}`}
                  onClick={() => setActiveScreen("mobile")}
                >
                  📱 Mobile POS
                </button>
                <button
                  type="button"
                  className={`preview-tab-btn ${activeScreen === "web" ? "active" : ""}`}
                  onClick={() => setActiveScreen("web")}
                >
                  💻 Web POS
                </button>
                <button
                  type="button"
                  className={`preview-tab-btn ${activeScreen === "history" ? "active" : ""}`}
                  onClick={() => setActiveScreen("history")}
                >
                  🧾 History & Sales
                </button>
              </div>

              {activeScreen === "mobile" && (
                <div>
                  <img
                    src="/mockups/mobile-pos.png"
                    alt="QuickBill POS Android App"
                    style={{ borderRadius: 14, maxHeight: 380, objectFit: "cover", width: "100%" }}
                  />
                  <div className="shot-caption">App-POS — Rapid touch keypad, hold cart, and direct thermal printing.</div>
                </div>
              )}

              {activeScreen === "web" && (
                <div>
                  <img
                    src="/mockups/web-pos.png"
                    alt="QuickBill Web POS Desk"
                    style={{ borderRadius: 14, maxHeight: 380, objectFit: "cover", width: "100%" }}
                  />
                  <div className="shot-caption">Web POS — Desktop browser billing desk with local offline data storage.</div>
                </div>
              )}

              {activeScreen === "history" && (
                <div>
                  <img
                    src="/mockups/history.png"
                    alt="QuickBill Sales History"
                    style={{ borderRadius: 14, maxHeight: 380, objectFit: "cover", width: "100%" }}
                  />
                  <div className="shot-caption">History & Invoices — Daily revenue, filter payment modes, and reprint receipts.</div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Streamlined Features (4 Core Capabilities) */}
        <section className="section" id="features">
          <div className="wrap">
            <h2>Everything you need. Nothing in the way.</h2>
            <p className="sub">Built for real counter speed, reliability, and simple retail workflows.</p>
            <div className="features" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
              <div className="feature">
                <div className="icon">⚡</div>
                <h3>Amount-First Billing</h3>
                <p>Enter amounts instantly, add quick products, and complete checkouts in seconds.</p>
              </div>
              <div className="feature">
                <div className="icon">🖨️</div>
                <h3>Thermal Receipt Printing</h3>
                <p>Direct ESC/POS thermal printing over Bluetooth. Fast reprinting from order history.</p>
              </div>
              <div className="feature">
                <div className="icon">📴</div>
                <h3>100% Offline-First</h3>
                <p>Never lose sales during internet outages. Local SQLite and browser storage keep you operational.</p>
              </div>
              <div className="feature">
                <div className="icon">⏸️</div>
                <h3>Park & Recall Orders</h3>
                <p>Hold customer carts during rush hours and resume anytime without losing tickets.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Clean Download APK Section */}
        <section className="section" id="download">
          <div className="wrap">
            {loaded && latest ? (
              <div>
                <div className="release-banner">
                  <div>
                    <div className="meta" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span>LATEST ANDROID RELEASE</span>
                      <span style={{ background: "rgba(255,255,255,0.2)", padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
                        {latest.version}
                      </span>
                    </div>
                    <h3>QuickBillPoss {latest.version}</h3>
                    <div className="meta">
                      Size: {latest.sizeLabel} · File: {latest.fileName} · Released: {new Date(latest.uploadedAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}>
                    <a className="btn btn-dark" href={latest.downloadUrl} target="_blank" rel="noopener noreferrer">
                      Download APK ({latest.sizeLabel})
                    </a>
                    {latest.htmlUrl && (
                      <a
                        href={latest.htmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: 13, color: "#bfdbfe", textDecoration: "underline" }}
                      >
                        View release on GitHub ↗
                      </a>
                    )}
                  </div>
                </div>

                {/* Optional Older Builds Accordion */}
                {allReleases.length > 1 && (
                  <div style={{ marginTop: 16 }}>
                    <button
                      type="button"
                      onClick={() => setShowOlderBuilds(!showOlderBuilds)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--navy)",
                        fontWeight: 700,
                        fontSize: 14,
                        cursor: "pointer",
                        padding: "6px 0",
                      }}
                    >
                      {showOlderBuilds ? "▲ Hide older versions" : `▼ View ${allReleases.length - 1} older builds`}
                    </button>

                    {showOlderBuilds && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
                        {allReleases.slice(1).map((rel) => (
                          <div
                            key={rel.id}
                            style={{
                              background: "#ffffff",
                              border: "1px solid var(--line)",
                              borderRadius: 12,
                              padding: "10px 16px",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: 12,
                              flexWrap: "wrap",
                            }}
                          >
                            <div>
                              <strong style={{ fontSize: 14 }}>{rel.title || rel.version}</strong>
                              <span style={{ fontSize: 12.5, color: "var(--muted)", marginLeft: 10 }}>
                                {rel.sizeLabel} · {new Date(rel.uploadedAt).toLocaleDateString()}
                              </span>
                            </div>
                            <a
                              className="btn btn-outline"
                              href={rel.downloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ padding: "6px 14px", fontSize: 13 }}
                            >
                              Download ({rel.sizeLabel})
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="release-banner release-empty">
                <div>
                  <div className="kicker">ANDROID APK</div>
                  <h3 style={{ margin: "10px 0 6px" }}>No public release yet</h3>
                  <p className="lede" style={{ margin: 0, fontSize: 15 }}>
                    The latest App-POS APK will appear here after an admin publishes it.
                  </p>
                </div>
                <Link className="btn btn-primary" to="/apk-upload">
                  Admin Panel
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Clean Unified Footer */}
      <footer>
        <div className="wrap foot">
          <span>QuickBill POS · Simple & Offline-First Point of Sale</span>
          <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
            <Link to="/terms-and-condition" style={{ fontWeight: 600 }}>Terms & Conditions</Link>
            <Link to="/privacy-policy" style={{ fontWeight: 600 }}>Privacy Policy</Link>
            <a
              href="https://posquickbill.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontWeight: 600, color: "var(--blue)" }}
            >
              🌐 Web POS App ↗
            </a>
            <Link to="/apk-upload" style={{ fontWeight: 600 }}>Admin</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
