import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchReleases, type Release } from "../api";

export default function Home() {
  const [latest, setLatest] = useState<Release | null>(null);
  const [loaded, setLoaded] = useState(false);

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
          <a className="brand" href="#top">
            <span className="logo">Q</span>
            QuickBill POS
          </a>
          <nav className="nav-links">
            <a href="#products">Products</a>
            <a href="#features">Features</a>
            <a href="#screens">Screens</a>
            <a href="#download">Download</a>
            <Link to="/apk-upload">Developer</Link>
            <a className="btn btn-primary" href="#download">Get App-POS</a>
          </nav>
        </div>
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
              <p className="lede">
                Record sales, print thermal receipts, park orders, and review local history — all
                in the browser, with no required backend. The same billing desk now ships as
                App-POS (QuickBillPoss) for Android.
              </p>
              <div className="hero-actions">
                <a className="btn btn-primary" href="#download">Download latest APK</a>
                <a className="btn btn-outline" href="#products">Compare web &amp; mobile</a>
              </div>
              <div className="product-pills">
                <div className="pill">
                  <strong>Web app</strong>
                  <span>Browser POS. Local history. Thermal print.</span>
                </div>
                <div className="pill">
                  <strong>App-POS · QuickBillPoss</strong>
                  <span>React Native, SQLite, Firestore, ESC/POS.</span>
                </div>
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
              <div className="release-banner">
                <div>
                  <div className="meta">Latest App-POS release</div>
                  <h3>QuickBillPoss {latest.version}</h3>
                  <div className="meta">
                    {latest.sizeLabel} · {latest.fileName} ·{" "}
                    {new Date(latest.uploadedAt).toLocaleString()}
                    {latest.notes ? ` · ${latest.notes}` : ""}
                  </div>
                </div>
                <a className="btn btn-dark" href={latest.downloadUrl}>
                  Download APK
                </a>
              </div>
            ) : (
              <div className="release-banner release-empty">
                <div>
                  <div className="kicker">ANDROID APK</div>
                  <h3 style={{ margin: "10px 0 6px" }}>No public release yet</h3>
                  <p className="lede" style={{ margin: 0, fontSize: 15 }}>
                    The latest App-POS APK will appear here after a developer uploads it at{" "}
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
          <Link to="/apk-upload">APK upload for developers</Link>
        </div>
      </footer>
    </>
  );
}
