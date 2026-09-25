import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchReleases, type Release } from "../api";

export default function Home() {
  const [latest, setLatest] = useState<Release | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchReleases()
      .then((data) => setLatest(data.latest))
      .catch(() => setLatest(null))
      .finally(() => setLoaded(true));
  }, []);

  return (
    <>
      <header className="nav">
        <div className="wrap nav-inner">
          <a className="brand" href="#top" onClick={() => setMobileMenuOpen(false)}>
            <img src="/logo.svg" className="logo" alt="QuickBill POS" width={36} height={36} />
            QuickBill POS
          </a>
          <nav className="nav-links desktop-only">
            <a href="#products">Products</a>
            <a href="#features">Features</a>
            <a href="#screens">Screens</a>
            <a href="#download">Download</a>
            <a
              href="https://posquickbill.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--blue)", fontWeight: 700 }}
              title="Visit the live Point of Sale web application"
            >
              Web POS App ↗
            </a>
            <Link to="/apk-upload">Developer</Link>
            <a className="btn btn-primary" href="#download">Get App-POS</a>
          </nav>

          {/* Mobile Navigation Toggle & Quick CTA */}
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
            <a href="#products" onClick={() => setMobileMenuOpen(false)}>Products</a>
            <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#screens" onClick={() => setMobileMenuOpen(false)}>Screens</a>
            <a href="#download" onClick={() => setMobileMenuOpen(false)}>Download APK</a>
            <a
              href="https://posquickbill.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="mobile-highlight-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              🌐 Launch Live Web POS App ↗
            </a>
            <Link to="/apk-upload" onClick={() => setMobileMenuOpen(false)}>Developer Console</Link>
            <a
              className="btn btn-primary"
              href="#download"
              onClick={() => setMobileMenuOpen(false)}
              style={{ width: "100%", marginTop: 8 }}
            >
              Get App-POS (Download APK)
            </a>
          </nav>
        )}
      </header>

      <main id="top">
        <section className="hero">
          <div className="wrap grid-2">
            <div>
              <div className="kicker">
                <span className="dot" />
                Offline-first Point of Sale
              </div>
              <h1>A fast, modern POS for retail and billing desks.</h1>
              <div className="hero-actions">
                <a
                  className="btn btn-primary"
                  href="https://posquickbill.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  🌐 Launch Web POS Desk ↗
                </a>
                <a className="btn btn-outline" href="#download">Download APK</a>
                <a className="btn btn-outline" href="#products">Compare web &amp; mobile</a>
              </div>
              <div className="product-pills">
                <a
                  href="https://posquickbill.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pill"
                  style={{ textDecoration: "none", cursor: "pointer" }}
                  title="Launch live Point of Sale web app"
                >
                  <strong>Web app ↗</strong>
                  <span>Browser POS · Local history · Thermal print · Click to open</span>
                </a>
                <a href="#download" className="pill" style={{ textDecoration: "none" }}>
                  <strong>App-POS · QuickBillPoss</strong>
                  <span>React Native, SQLite, Firestore, ESC/POS.</span>
                </a>
              </div>
            </div>
            <div className="card">
              <img src="/mockups/mobile-pos.png" alt="QuickBill POS billing keypad and cart" />
              <div className="shot-caption">Live billing keypad, hold cart, print, and pay — built for a desk, not a demo.</div>
            </div>
          </div>
        </section>

        <section className="section" id="products">
          <div className="wrap">
            <h2>Two surfaces. One billing workflow.</h2>
            <p className="sub">Use the web app at the counter. Carry App-POS when the counter moves.</p>
            <div className="split">
              <article className="card" style={{ padding: 22 }}>
                <div className="kicker">WEB APP</div>
                <h3 style={{ marginTop: 14 }}>QuickBill POS for the browser</h3>
                <p className="lede" style={{ fontSize: 15 }}>
                  A fast, modern, and offline-first Point of Sale for retail and billing desks.
                  Record sales, print thermal receipts, park orders, and review local history —
                  all in the browser, with no required backend.
                </p>
                <div className="stack">
                  <span className="chip">Offline-first</span>
                  <span className="chip">Thermal receipts</span>
                  <span className="chip">Park / hold orders</span>
                  <span className="chip">Local history</span>
                  <span className="chip">No required backend</span>
                </div>
                <div style={{ marginTop: 20 }}>
                  <a
                    className="btn btn-primary"
                    href="https://posquickbill.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ padding: "10px 18px", fontSize: 14 }}
                  >
                    Open Web POS Desk ↗
                  </a>
                </div>
              </article>
              <article className="card" style={{ padding: 22 }}>
                <div className="kicker">REACT NATIVE</div>
                <h3 style={{ marginTop: 14 }}>App-POS (QuickBillPoss)</h3>
                <p className="lede" style={{ fontSize: 15 }}>
                  A local-first, offline-capable Point of Sale mobile application built with
                  React Native, high-performance SQLite, Cloud Firestore, and thermal ESC/POS printing.
                </p>
                <div className="stack">
                  <span className="chip">React Native</span>
                  <span className="chip">SQLite</span>
                  <span className="chip">Cloud Firestore</span>
                  <span className="chip">ESC/POS thermal</span>
                  <span className="chip">Local-first sync</span>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="section" id="features">
          <div className="wrap">
            <h2>Built for the desk, not the dashboard.</h2>
            <p className="sub">The keypad is the product. Everything else stays out of the way.</p>
            <div className="features">
              <div className="feature">
                <div className="icon">₹</div>
                <h3>Amount-first billing</h3>
                <p>Tap an amount, add the item, print or pay. Custom items and quick picks without leaving the keypad.</p>
              </div>
              <div className="feature">
                <div className="icon">P</div>
                <h3>Thermal ESC/POS print</h3>
                <p>Reprint receipts from history. Printer settings live next to the cart so a jammed roll never stops a sale.</p>
              </div>
              <div className="feature">
                <div className="icon">H</div>
                <h3>Park orders</h3>
                <p>Hold a cart, attach a customer later, and resume without losing the ticket — on web or App-POS.</p>
              </div>
              <div className="feature">
                <div className="icon">L</div>
                <h3>Local history</h3>
                <p>Revenue, bill count, and average bill stay on the device. Filter cash, UPI, card, split, or cancelled.</p>
              </div>
              <div className="feature">
                <div className="icon">O</div>
                <h3>Offline-first</h3>
                <p>Sales record even when the network does not. App-POS syncs through Firestore when the shop comes back online.</p>
              </div>
              <div className="feature">
                <div className="icon">S</div>
                <h3>SQLite on device</h3>
                <p>High-performance local store for products, held bills, and invoices — the source of truth at the counter.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="screens">
          <div className="wrap">
            <h2>The counter, as it actually looks.</h2>
            <p className="sub">Web POS keypad, App-POS billing, and searchable local invoices.</p>
            <div className="shots">
              <div className="card">
                <img src="/mockups/web-pos.png" alt="Web POS amount keypad and empty cart" />
                <div className="shot-caption">Web POS — amount keypad, add item, print, bill.</div>
              </div>
              <div className="card">
                <img src="/mockups/mobile-pos.png" alt="App-POS React Native billing screen" />
                <div className="shot-caption">App-POS — quick picks, hold, print, pay.</div>
              </div>
              <div className="card wide">
                <img src="/mockups/history.png" alt="Local invoice history with cash receipts" />
                <div className="shot-caption">History — revenue, bill count, average bill, reprint from the device.</div>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="download">
          <div className="wrap">
            {loaded && latest ? (
              <div className="release-banner" style={{ display: "flex", justifyContent: "space-between", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 280 }}>
                  <div className="meta" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span>Latest App-POS release</span>
                    <span style={{ background: "rgba(255,255,255,0.2)", padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
                      GitHub Release
                    </span>
                  </div>
                  <h3 style={{ margin: "6px 0 8px" }}>QuickBillPoss {latest.version}</h3>
                  <div className="meta">
                    {latest.sizeLabel} · {latest.fileName} ·{" "}
                    {new Date(latest.uploadedAt).toLocaleDateString()}
                  </div>

                  {latest.notes ? (
                    <div
                      style={{
                        marginTop: 12,
                        background: "rgba(255, 255, 255, 0.12)",
                        borderRadius: 12,
                        padding: "12px 16px",
                        maxWidth: 620,
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 800,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          color: "#93c5fd",
                          marginBottom: 4,
                        }}
                      >
                        What's Fixed in this Build:
                      </div>
                      <div
                        style={{
                          fontSize: 13.5,
                          lineHeight: 1.5,
                          whiteSpace: "pre-line",
                          color: "#f1f5f9",
                        }}
                      >
                        {latest.notes}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}>
                  <a className="btn btn-dark" href={latest.downloadUrl} target="_blank" rel="noopener noreferrer">
                    Download APK ({latest.sizeLabel})
                  </a>
                  {latest.htmlUrl ? (
                    <a
                      href={latest.htmlUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: 13, color: "#bfdbfe", textDecoration: "underline" }}
                    >
                      View release on GitHub ↗
                    </a>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="release-banner release-empty">
                <div>
                  <div className="kicker">ANDROID APK</div>
                  <h3 style={{ margin: "10px 0 6px" }}>No public release yet</h3>
                  <p className="lede" style={{ margin: 0, fontSize: 15 }}>
                    The latest App-POS APK will appear here after a developer publishes it to GitHub at{" "}
                    <Link to="/apk-upload">/apk-upload</Link>.
                  </p>
                </div>
                <Link className="btn btn-primary" to="/apk-upload">
                  Open upload console
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap foot">
          <span>QuickBill POS · Web app and App-POS (QuickBillPoss)</span>
          <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
            <a
              href="https://posquickbill.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontWeight: 600, color: "var(--blue)" }}
            >
              🌐 Visit Web POS App ↗
            </a>
            <Link to="/apk-upload">APK upload for developers</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
