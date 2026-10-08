import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchReleases, type Release } from "../api";
import SEO from "../components/SEO";
import LiveWebPosEmbed from "../components/LiveWebPosEmbed";
import DownloadQrCard from "../components/DownloadQrCard";
import PricingSection from "../components/PricingSection";

export default function Home() {
  const [latest, setLatest] = useState<Release | null>(null);
  const [allReleases, setAllReleases] = useState<Release[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeScreen, setActiveScreen] = useState<"mobile" | "web" | "history">("mobile");
  const [showOlderBuilds, setShowOlderBuilds] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "क्या QuickBill POS चलाने के लिए इंटरनेट ज़रूरी है? (Does it require active internet?)",
      a: "बिलकुल नहीं! (No!). QuickBill POS पूरी तरह से 100% Offline-First है। चाहे आपकी दुकान में ब्रॉडबैंड बंद हो या मोबाइल नेटवर्क न आ रहा हो, आपका बिलिंग काउंटर कभी नहीं रुकेगा। सारा डेटा आपके डिवाइस (SQLite / IndexedDB) में सुरक्षित रहता है।",
    },
    {
      q: "Does it support UPI payments (Google Pay, PhonePe, Paytm, BHIM)?",
      a: "Yes! QuickBill POS generates dynamic UPI QR payment codes directly on your counter screen or on your printed 58mm/80mm thermal receipt slip. Customers can scan with any UPI app to pay instantly.",
    },
    {
      q: "Is it compliant with Indian GST (CGST + SGST) or Composition Scheme?",
      a: "Yes. You can configure GST tax rates (5%, 12%, 18%) with automatic CGST and SGST splits and print your GSTIN on the tax invoice. If you are unregistered or under the Composition Scheme, switch to 0% with a single tap.",
    },
    {
      q: "Does QuickBill POS support all mobile printers?",
      a: "Yes! QuickBill POS supports all mobile Bluetooth and USB thermal printers using standard ESC/POS protocol across both 58mm (2-inch) and 80mm (3-inch) paper rolls. Whether it is a portable battery-operated pocket printer, handheld Android POS, or desktop thermal machine, it connects in seconds with zero driver hassle.",
    },
    {
      q: "What are the subscription plans for QuickBill POS?",
      a: "We offer simple, pocket-friendly pricing for Indian merchants: Monthly Plan at just ₹99/month (₹3.3/day) for maximum flexibility, or our Yearly Value Pass at ₹999/year (effective ~₹83/month with 2 months free and 16% savings). Both plans include unlimited offline bills, dynamic UPI QR payments, GST tax invoicing, and TVS/Sunmi Bluetooth printing.",
    },
    {
      q: "Can I use it on my existing Android phone, tablet, or PC?",
      a: "Yes! You can run Web POS directly in Google Chrome or Microsoft Edge on any desktop or laptop, or install the lightweight 29 MB Android APK on any smartphone, tablet, or Sunmi POS device running Android 7.0 or higher.",
    },
  ];

  return (
    <>
      <SEO
        title="QuickBill POS — Offline Billing & Point of Sale for Indian Retailers"
        description="Fast, offline-first Point of Sale for Indian Kirana, Cafes, Bakeries, and Retail Desks. GST compliant, UPI QR payment ready, and Bluetooth thermal printing for TVS, Sunmi & Epson."
        canonicalPath="/"
        keywords={[
          "QuickBill POS India",
          "offline POS software India",
          "Kirana store billing software",
          "GST thermal bill printer",
          "UPI QR POS billing",
          "Android POS APK India",
          "TVS printer billing app",
          "Sunmi POS billing software",
        ]}
      />

      {/* Navigation Bar */}
      <header className="nav" id="top-nav">
        <div className="wrap nav-inner">
          <a className="brand" href="#top" onClick={() => setMobileMenuOpen(false)}>
            <img src="/logo.svg" className="logo" alt="QuickBill POS Logo" width={38} height={38} />
            <span>QuickBill POS</span>
            <span className="brand-badge">🇮🇳 India Edition</span>
          </a>

          <nav className="nav-links desktop-only" aria-label="Main Navigation">
            <a href="#webpos">Live Web POS</a>
            <a href="#screens">Screens</a>
            <a href="#features">Features</a>
            <a href="#printers">Mobile Printers</a>
            <a href="#pricing" style={{ color: "var(--primary)", fontWeight: 750 }}>
              Plans (₹99)
            </a>
            <a href="#download">Download APK</a>
            <a
              href="https://wa.me/919446960834?text=Hi%20QuickBill%20POS%20Team,%20I%20am%20interested%20in%20QuickBill%20POS"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#16a34a", fontWeight: 750, display: "inline-flex", alignItems: "center", gap: 4 }}
              title="Chat with QuickBill Support on WhatsApp"
            >
              💬 +91 9446960834
            </a>
            <a
              href="https://posquickbill.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ padding: "8px 16px", fontSize: 13.5 }}
              title="Launch Web POS application in browser"
            >
              Launch Web POS ↗
            </a>
            <Link to="/apk-upload" className="ghost" style={{ fontWeight: 700 }}>
              Admin
            </Link>
          </nav>

          {/* Mobile Navigation Toggle */}
          <div className="mobile-nav-toggle-wrap">
            <a
              className="btn btn-outline"
              href="https://wa.me/919446960834"
              target="_blank"
              rel="noopener noreferrer"
              style={{ padding: "6px 10px", fontSize: 12, borderColor: "#22c55e", color: "#15803d" }}
            >
              💬 WhatsApp
            </a>
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
          <nav className="mobile-nav-drawer" aria-label="Mobile Navigation">
            <a
              href="https://wa.me/919446960834"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#16a34a", fontWeight: 800, background: "#ecfdf5", border: "1px solid #a7f3d0" }}
              onClick={() => setMobileMenuOpen(false)}
            >
              💬 Direct WhatsApp: +91 9446960834 ↗
            </a>
            <a href="#webpos" onClick={() => setMobileMenuOpen(false)}>
              🌐 Live Web POS App Desk
            </a>
            <a href="#screens" onClick={() => setMobileMenuOpen(false)}>
              📱 Screen Previews
            </a>
            <a href="#features" onClick={() => setMobileMenuOpen(false)}>
              ⚡ UPI, GST & Features
            </a>
            <a href="#printers" onClick={() => setMobileMenuOpen(false)}>
              🖨️ Supports All Mobile Printers
            </a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} style={{ color: "var(--primary)", fontWeight: 800 }}>
              💰 Plans (₹99 / mo & ₹999 / yr)
            </a>
            <a href="#download" onClick={() => setMobileMenuOpen(false)}>
              📥 Download Android APK
            </a>
            <a
              href="https://posquickbill.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="mobile-highlight-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              🌐 Launch Web POS Desk ↗
            </a>
            <Link
              to="/apk-upload"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontWeight: 700, color: "var(--navy)" }}
            >
              🔐 Admin Console
            </Link>
          </nav>
        )}
      </header>

      <main id="top">
        {/* =================================================================
            HERO SECTION (FOR INDIAN MERCHANTS)
            ================================================================= */}
        <section className="hero">
          <div className="wrap grid-2">
            <div>
              <div className="kicker">
                <span className="dot" />
                <span>🇮🇳 Made for Indian Retail · 100% Offline · UPI & GST Ready</span>
              </div>

              <h1>
                Point of Sale for Indian Counters.{" "}
                <span className="hero-headline-gradient">Built to Never Stop.</span>
              </h1>

              <p className="lede">
                Engineered for Kirana stores, QSR chai & snack counters, bakeries, sweet marts, and
                busy retail shops across India. Bill customers in sub-seconds with direct ₹ numeric
                entry, print instant thermal bills over Bluetooth, and accept UPI seamlessly without
                internet bottlenecks.
              </p>

              {/* Indian Performance Stats Strip */}
              <div className="hero-stats-row">
                <div className="stat-item">
                  <span className="stat-val">0.3s</span>
                  <span className="stat-lbl">Billing Speed (तेज़ बिलिंग)</span>
                </div>
                <div className="stat-item">
                  <span className="stat-val">100%</span>
                  <span className="stat-lbl">Offline (बिना इंटरनेट)</span>
                </div>
                <div className="stat-item">
                  <span className="stat-val">UPI & GST</span>
                  <span className="stat-lbl">GPay / PhonePe Ready</span>
                </div>
                <div className="stat-item">
                  <span className="stat-val">58/80mm</span>
                  <span className="stat-lbl">TVS / Sunmi Thermal</span>
                </div>
              </div>

              {/* Primary Dual Platform Action Cards */}
              <div className="action-grid">
                {/* 1. Web POS Action Card */}
                <div className="action-card highlight">
                  <div>
                    <div className="action-card-header">
                      <span style={{ fontSize: 24 }}>🌐</span>
                      <span className="action-badge">Instant PC / Browser Desk</span>
                    </div>
                    <h3>Web POS Desk</h3>
                    <p>Instant billing in your desktop browser. Local IndexedDB storage, GST receipts, and no installation required.</p>
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
                      <span style={{ fontSize: 24 }}>📱</span>
                      <span className="action-badge green">
                        {latest ? latest.version : "Android Build"}
                      </span>
                    </div>
                    <h3>App-POS (Android)</h3>
                    <p>Native mobile app for Android phones, tablets, and Sunmi / Pine Labs POS with Bluetooth thermal printing.</p>
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

            {/* Interactive Screen Viewer Card */}
            <div id="screens" className="card" style={{ padding: 20 }}>
              <div className="preview-tabs">
                <button
                  type="button"
                  className={`preview-tab-btn ${activeScreen === "mobile" ? "active" : ""}`}
                  onClick={() => setActiveScreen("mobile")}
                >
                  📱 Mobile & Sunmi POS
                </button>
                <button
                  type="button"
                  className={`preview-tab-btn ${activeScreen === "web" ? "active" : ""}`}
                  onClick={() => setActiveScreen("web")}
                >
                  💻 Desktop Web Desk
                </button>
                <button
                  type="button"
                  className={`preview-tab-btn ${activeScreen === "history" ? "active" : ""}`}
                  onClick={() => setActiveScreen("history")}
                >
                  🧾 Khata & History
                </button>
              </div>

              {activeScreen === "mobile" && (
                <div>
                  <img
                    src="/mockups/mobile-pos.png"
                    alt="QuickBill POS Android App"
                    style={{ borderRadius: 14, maxHeight: 390, objectFit: "cover", width: "100%" }}
                  />
                  <div className="shot-caption">
                    <strong>Android App-POS:</strong> Rapid touch keypad, hold cart queue, and direct ESC/POS Bluetooth pairing for TVS, Bluprint & Sunmi.
                  </div>
                </div>
              )}

              {activeScreen === "web" && (
                <div>
                  <img
                    src="/mockups/web-pos.png"
                    alt="QuickBill Web POS Desk"
                    style={{ borderRadius: 14, maxHeight: 390, objectFit: "cover", width: "100%" }}
                  />
                  <div className="shot-caption">
                    <strong>Web POS Desk:</strong> Desktop browser billing interface with local offline database storage and GST calculation.
                  </div>
                </div>
              )}

              {activeScreen === "history" && (
                <div>
                  <img
                    src="/mockups/history.png"
                    alt="QuickBill Sales History"
                    style={{ borderRadius: 14, maxHeight: 390, objectFit: "cover", width: "100%" }}
                  />
                  <div className="shot-caption">
                    <strong>Audit & Invoices:</strong> Daily revenue tally, payment mode filter (Cash / UPI / RuPay Card), and instant bill reprint.
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* =================================================================
            LIVE WEB POS DESK EMBED (https://posquickbill.vercel.app/)
            ================================================================= */}
        <section className="section" id="webpos" style={{ background: "rgba(241, 245, 249, 0.45)" }}>
          <div id="simulator" style={{ position: "relative", top: "-80px" }} />
          <div className="wrap">
            <div className="section-head">
              <span className="kicker">LIVE CLOUD & BROWSER COUNTER</span>
              <h2>Experience the Real QuickBill Web POS App Right Here</h2>
              <p className="sub">
                Try the actual live retail billing desk directly in your browser. Add products,
                enter ₹ amounts, test GST calculations, hold bills, and generate receipts in real-time.
              </p>
            </div>

            <LiveWebPosEmbed />
          </div>
        </section>

        {/* =================================================================
            BENTO GRID CORE CAPABILITIES (TAILORED FOR INDIA)
            ================================================================= */}
        <section className="section" id="features">
          <div className="wrap">
            <div className="section-head">
              <span className="kicker">BUILT FOR BHARAT</span>
              <h2>Tailored for Indian Retail Workflows</h2>
              <p className="sub">
                Designed to solve the real daily challenges of Indian shopkeepers, cafes, and billing desks.
              </p>
            </div>

            <div className="bento-grid">
              {/* Feature 1 */}
              <div className="bento-card bento-span-2">
                <div className="bento-icon-wrap">⚡</div>
                <h3>Amount-First Rapid Keypad (नकद व खुला हिसाब)</h3>
                <p>
                  In Indian retail, not every vegetable, sweet, or snack has a barcode. Simply type the ₹
                  amount into the tactile numeric pad, hit Enter, and bill customers in under 2 seconds.
                  Eliminates cashier lines during evening rush hours.
                </p>
                <div className="bento-pill-tag">⚡ 300% faster than typing item names</div>
              </div>

              {/* Feature 2 */}
              <div className="bento-card">
                <div className="bento-icon-wrap">📱</div>
                <h3>Dynamic UPI QR Code Billing</h3>
                <p>
                  Print customer payment QR codes directly onto thermal bills or show them on screen.
                  Customers scan with Google Pay, PhonePe, Paytm, or BHIM for instant confirmation.
                </p>
                <div className="bento-pill-tag">📱 Works with all Indian UPI apps</div>
              </div>

              {/* Feature 3 */}
              <div className="bento-card">
                <div className="bento-icon-wrap">📴</div>
                <h3>100% Offline-First (बिना इंटरनेट की चिंता)</h3>
                <p>
                  Frequent broadband drops, Wi-Fi router restarts, or spotty 4G/5G signals will never
                  freeze your checkout counter. Invoices and inventory persist locally in SQLite and IndexedDB.
                </p>
                <div className="bento-pill-tag">🔒 Zero downtime during network cuts</div>
              </div>

              {/* Feature 4 */}
              <div className="bento-card">
                <div className="bento-icon-wrap">🧾</div>
                <h3>GST Ready (CGST + SGST Breakdown)</h3>
                <p>
                  One-tap configuration for 5%, 12%, or 18% GST with compliant CGST and SGST itemization
                  and GSTIN printing. Easily toggle 0% for Unregistered or Composition Scheme merchants.
                </p>
                <div className="bento-pill-tag">⚖️ Indian GST Tax Invoice compliant</div>
              </div>

              {/* Feature 5 */}
              <div className="bento-card">
                <div className="bento-icon-wrap">⏸️</div>
                <h3>Park & Recall Multi-Carts (होल्ड बिल)</h3>
                <p>
                  Customer stepped away to pick up more items or is transferring money via UPI? Park the
                  bill with one tap, attend to the next customer, and resume the ticket whenever ready.
                </p>
                <div className="bento-pill-tag">🔄 Smooth queue management</div>
              </div>

              {/* Feature 6 */}
              <div className="bento-card">
                <div className="bento-icon-wrap">💰</div>
                <h3>Zero Monthly Software Rent</h3>
                <p>
                  Stop paying ₹12,000 to ₹30,000 every year for software subscriptions. QuickBill POS is
                  free of monthly recurring fees and vendor lock-in.
                </p>
                <div className="bento-pill-tag">💸 100% Lifetime Savings</div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
            SUPPORTS ALL MOBILE PRINTERS SECTION & HARDWARE SHOWCASE
            ================================================================= */}
        <section className="section" id="printers" style={{ background: "#ffffff" }}>
          <div id="compatibility" style={{ position: "relative", top: "-80px" }} />
          <div className="wrap">
            <div className="section-head">
              <span className="kicker">OFFICIAL HARDWARE & COMPATIBILITY</span>
              <h2>Supports All Mobile Printers</h2>
              <p className="sub">
                Pair directly via Bluetooth or USB with any portable 58mm or 80mm mobile thermal receipt printer.
                You can bring your own printer or order our official wireless mobile printer below.
              </p>
            </div>

            {/* Featured Hardware Hero Card (₹2,500 Standalone Hardware) */}
            <div className="printer-product-hero">
              <div className="printer-hero-icon-box">
                <div className="printer-hero-avatar">🖨️</div>
                <div style={{ textAlign: "center" }}>
                  <span className="printer-chip-tag">WIRELESS HARDWARE</span>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)", marginTop: 4 }}>
                    58mm Portable Thermal Printer
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                    Rechargeable Battery Powered · ESC/POS
                  </div>
                </div>
              </div>

              <div className="printer-hero-details">
                <span className="kicker" style={{ fontSize: 11.5 }}>
                  OFFICIAL HARDWARE
                </span>
                <h3>Wireless Mobile Thermal Printer</h3>
                <p className="printer-hero-sub">
                  Built for retail work shifts, doorstep delivery, van sales, and counter desks.
                  Rechargeable battery power, wireless Bluetooth pairing, and high-speed thermal printing with zero ink.
                </p>

                {/* Price Box */}
                <div className="printer-price-box">
                  <div>
                    <div className="printer-price-amount">
                      <span className="curr">₹</span>
                      <span className="val">2,500</span>
                    </div>
                    <span className="printer-price-tag-sub">
                      Individual Printer Price · Zero Monthly Rent
                    </span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ background: "#dcfce7", color: "#15803d", fontSize: 12, fontWeight: 800, padding: "3px 9px", borderRadius: 999 }}>
                      🚚 Free Delivery in India
                    </span>
                  </div>
                </div>

                {/* Specs Checklist */}
                <ul className="printer-specs-checklist">
                  <li>
                    <span className="check-icon highlight">✓</span>
                    <strong>Rechargeable Battery Powered</strong>
                  </li>
                  <li>
                    <span className="check-icon highlight">✓</span>
                    <strong>Built for Daily Retail Work Shifts</strong>
                  </li>
                  <li>
                    <span className="check-icon highlight">✓</span>
                    <strong>Bluetooth + USB Dual Mode</strong>
                  </li>
                  <li>
                    <span className="check-icon highlight">✓</span>
                    <strong>Standard 58mm Thermal Rolls</strong>
                  </li>
                  <li>
                    <span className="check-icon highlight">✓</span>
                    <strong>Zero Ink / No Ribbon Required</strong>
                  </li>
                  <li>
                    <span className="check-icon highlight">✓</span>
                    <strong>1 Year Hardware Replacement</strong>
                  </li>
                </ul>

                <div className="printer-cta-row">
                  <a
                    href="#pricing"
                    className="btn btn-primary"
                    style={{ padding: "10px 20px", fontSize: 14 }}
                  >
                    View Combos (₹3,199) →
                  </a>
                  <a
                    href="https://wa.me/919446960834?text=Hi%20QuickBill%20POS%20Team!%20I%20want%20to%20order%20the%20Mobile%20Thermal%20Printer%20(Rs%202500)"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline"
                    style={{ padding: "10px 18px", fontSize: 14, borderColor: "#22c55e", color: "#15803d" }}
                  >
                    💬 Order on WhatsApp (+91 9446960834)
                  </a>
                  <a
                    href="#pricing"
                    className="btn btn-outline"
                    style={{ padding: "10px 18px", fontSize: 14 }}
                  >
                    Buy Printer (₹2,500)
                  </a>
                </div>
              </div>
            </div>

            {/* Universal Feature Grid */}
            <div className="compat-matrix-grid">
              <div className="compat-item">
                <div className="compat-icon">📱</div>
                <div className="compat-title">Any Bluetooth Mobile Printer</div>
                <div className="compat-desc">
                  Seamless wireless pairing with portable belt-clip, pocket, and handheld battery-powered thermal printers.
                </div>
                <span className="compat-status-badge">✓ 100% Plug & Play</span>
              </div>

              <div className="compat-item">
                <div className="compat-icon">📏</div>
                <div className="compat-title">58mm & 80mm Paper Sizes</div>
                <div className="compat-desc">
                  Auto-formats bills perfectly for both standard 2-inch mini rolls and 3-inch wide tax invoice paper.
                </div>
                <span className="compat-status-badge">✓ Universal Sizes</span>
              </div>

              <div className="compat-item">
                <div className="compat-icon">⚡</div>
                <div className="compat-title">Standard ESC/POS Protocol</div>
                <div className="compat-desc">
                  Works out of the box with standard ESC/POS commands across all printer brands and manufacturers.
                </div>
                <span className="compat-status-badge">✓ Zero Driver Setup</span>
              </div>

              <div className="compat-item">
                <div className="compat-icon">🔋</div>
                <div className="compat-title">Doorstep & Van Billing Ready</div>
                <div className="compat-desc">
                  Ideal for on-the-go billing on Android smartphones, delivery counters, and stationary desktop PCs.
                </div>
                <span className="compat-status-badge">✓ Ultra Portable</span>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
            COMPARISON MATRIX: QUICKBILL VS COSTLY CLOUD POS (PETPOOJA, VYAPAR, ETC.)
            ================================================================= */}
        <section className="section" id="comparison">
          <div className="wrap">
            <div className="section-head">
              <span className="kicker">SAVINGS & FREEDOM</span>
              <h2>QuickBill POS vs Typical Indian Cloud Billing Apps</h2>
              <p className="sub">
                Why thousands of Indian shopkeepers are moving away from restrictive monthly subscription software.
              </p>
            </div>

            <div className="table-container">
              <table className="comp-table">
                <thead>
                  <tr>
                    <th>Parameter / सुविधा</th>
                    <th className="highlight-col">QuickBill POS (Offline-First)</th>
                    <th>Legacy Indian Cloud Apps</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Internet Downtime (नेटवर्क कटने पर)</strong></td>
                    <td className="highlight-col">
                      <span className="comp-badge-good">✓ 100% Uninterrupted Offline</span>
                    </td>
                    <td>
                      <span className="comp-badge-bad">✕ Bills freeze or slow down</span>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Software Cost & Monthly Rent</strong></td>
                    <td className="highlight-col">
                      <span className="comp-badge-good">✓ ₹99/mo or ₹999/yr (Unlimited Bills)</span>
                    </td>
                    <td>
                      <span className="comp-badge-bad">✕ ₹1,200 to ₹2,500 every month (₹15k - ₹30k/yr)</span>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Data Privacy & Sovereignty</strong></td>
                    <td className="highlight-col">
                      <span className="comp-badge-good">✓ Stored strictly on your device</span>
                    </td>
                    <td>
                      <span className="comp-badge-bad">✕ Uploaded to external cloud servers</span>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Checkout Velocity</strong></td>
                    <td className="highlight-col">
                      <span className="comp-badge-good">✓ Sub-second numeric entry</span>
                    </td>
                    <td>
                      <span className="comp-badge-bad">✕ 5 to 10 seconds per customer</span>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>UPI QR on Receipt</strong></td>
                    <td className="highlight-col">
                      <span className="comp-badge-good">✓ Dynamic UPI QR code included</span>
                    </td>
                    <td>
                      <span className="comp-badge-bad">✕ Often requires paid add-on licenses</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* =================================================================
            POCKET-FRIENDLY INDIAN PRICING (MONTHLY ₹99 & YEARLY ₹999)
            ================================================================= */}
        <PricingSection />

        {/* =================================================================
            DOWNLOAD AND RELEASE CENTER WITH QR SCAN
            ================================================================= */}
        <section className="section" id="download">
          <div className="wrap">
            <div className="section-head">
              <span className="kicker">ANDROID APK DOWNLOAD</span>
              <h2>Download QuickBillPoss for Android & POS</h2>
              <p className="sub">
                Get the official native Android APK build for your smartphone, tablet, or handheld POS terminal.
              </p>
            </div>

            {loaded && latest ? (
              <div>
                <div className="release-banner">
                  <div>
                    <div className="meta" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span>OFFICIAL ANDROID APK BUILD</span>
                      <span
                        style={{
                          background: "rgba(255,255,255,0.2)",
                          padding: "3px 9px",
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        {latest.version}
                      </span>
                    </div>
                    <h3>QuickBillPoss {latest.version}</h3>
                    <div className="meta">
                      Size: {latest.sizeLabel} · File: {latest.fileName} · Released:{" "}
                      {new Date(latest.uploadedAt).toLocaleDateString("en-IN")}
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}>
                    <a className="btn btn-primary" href={latest.downloadUrl} target="_blank" rel="noopener noreferrer">
                      Download APK ({latest.sizeLabel})
                    </a>
                    {latest.htmlUrl && (
                      <a
                        href={latest.htmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: 13, color: "#bfdbfe", textDecoration: "underline" }}
                      >
                        View release details on GitHub ↗
                      </a>
                    )}
                  </div>
                </div>

                {/* Instant QR Code Scanner Card */}
                <DownloadQrCard release={latest} />

                {/* Optional Older Builds Accordion */}
                {allReleases.length > 1 && (
                  <div style={{ marginTop: 20 }}>
                    <button
                      type="button"
                      onClick={() => setShowOlderBuilds(!showOlderBuilds)}
                      style={{
                        background: "#ffffff",
                        border: "1px solid var(--line)",
                        borderRadius: "12px",
                        color: "var(--navy)",
                        fontWeight: 700,
                        fontSize: 14,
                        cursor: "pointer",
                        padding: "10px 18px",
                      }}
                    >
                      {showOlderBuilds ? "▲ Hide previous versions" : `▼ View ${allReleases.length - 1} earlier builds`}
                    </button>

                    {showOlderBuilds && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
                        {allReleases.slice(1).map((rel) => (
                          <div
                            key={rel.id}
                            style={{
                              background: "#ffffff",
                              border: "1px solid var(--line)",
                              borderRadius: 14,
                              padding: "12px 18px",
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
                                {rel.sizeLabel} · {new Date(rel.uploadedAt).toLocaleDateString("en-IN")}
                              </span>
                            </div>
                            <a
                              className="btn btn-outline"
                              href={rel.downloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ padding: "7px 16px", fontSize: 13 }}
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
                  <h3 style={{ margin: "10px 0 6px" }}>No public release deployed yet</h3>
                  <p className="lede" style={{ margin: 0, fontSize: 15 }}>
                    The latest App-POS APK will appear here as soon as an administrator publishes it.
                  </p>
                </div>
                <Link className="btn btn-primary" to="/apk-upload">
                  Open Admin Panel
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* =================================================================
            INTERACTIVE FAQ ACCORDION (FOR INDIAN RETAILERS)
            ================================================================= */}
        <section className="section" id="faq" style={{ background: "#f8fafc" }}>
          <div className="wrap">
            <div className="section-head">
              <span className="kicker">अक्सर पूछे जाने वाले सवाल</span>
              <h2>Frequently Asked Questions</h2>
              <p className="sub">
                Answers to common queries about Indian GST billing, UPI QR codes, TVS/Sunmi printer setup, and offline mode.
              </p>
            </div>

            <div className="faq-grid">
              {faqs.map((faq, idx) => (
                <div key={idx} className={`faq-item ${openFaq === idx ? "open" : ""}`}>
                  <button
                    type="button"
                    className="faq-toggle-btn"
                    onClick={() => toggleFaq(idx)}
                    aria-expanded={openFaq === idx}
                  >
                    <span>{faq.q}</span>
                    <span className="faq-icon-chevron">{openFaq === idx ? "▲" : "▼"}</span>
                  </button>
                  {openFaq === idx && <div className="faq-answer">{faq.a}</div>}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* =================================================================
          POLISHED FOOTER WITH DIRECT SUPPORT
          ================================================================= */}
      <footer>
        <div className="wrap foot">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <img src="/logo.svg" alt="QuickBill Logo" width={22} height={22} />
              <strong style={{ color: "var(--ink)" }}>QuickBill POS India</strong>
            </div>
            <span>Sub-second retail counter point of sale. 100% offline-ready · Made for Bharat.</span>
            <div style={{ marginTop: 6, fontSize: 13, color: "var(--navy)" }}>
              📞 <strong>Direct Helpline & WhatsApp:</strong>{" "}
              <a
                href="https://wa.me/919446960834?text=Hi%20QuickBill%20POS%20Team!%20I%20have%20an%20inquiry"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#16a34a", fontWeight: 750 }}
              >
                +91 9446960834
              </a>{" "}
              <span style={{ color: "var(--muted)" }}>(Call or WhatsApp anytime)</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
            <a
              href="https://wa.me/919446960834"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontWeight: 700, color: "#16a34a" }}
            >
              💬 WhatsApp Us ↗
            </a>
            <Link to="/terms_and_condition" style={{ fontWeight: 600 }}>
              Terms & Conditions
            </Link>
            <Link to="/privacy_policy" style={{ fontWeight: 600 }}>
              Privacy Policy
            </Link>
            <a
              href="https://posquickbill.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontWeight: 700, color: "var(--primary)" }}
            >
              🌐 Web POS Desk ↗
            </a>
            <Link to="/apk-upload" style={{ fontWeight: 600 }}>
              Admin Console
            </Link>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Quick Action Button */}
      <a
        href="https://wa.me/919446960834?text=Hi%20QuickBill%20POS%20Team!%20I%20want%20to%20know%20more%20about%20QuickBill%20POS%20and%20the%20Mobile%20Printer."
        target="_blank"
        rel="noopener noreferrer"
        className="floating-whatsapp-btn"
        aria-label="Chat with QuickBill Support on WhatsApp"
        title="Chat on WhatsApp: +91 9446960834"
      >
        <span style={{ fontSize: 20 }}>💬</span>
        <span className="floating-whatsapp-text">+91 9446960834</span>
      </a>
    </>
  );
}
