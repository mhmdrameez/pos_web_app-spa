import { Link } from "react-router-dom";
import { useEffect } from "react";
import SEO from "../components/SEO";

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Privacy Policy — QuickBill POS",
    description:
      "Official Privacy Policy for QuickBill POS web application and Android mobile POS. Details on data protection, offline-first security, and device permissions.",
    url: typeof window !== "undefined" ? `${window.location.origin}/privacy_policy` : "https://posquickbill.vercel.app/privacy_policy",
    datePublished: "2026-09-01",
    dateModified: "2026-10-08",
    inLanguage: "en-US",
    publisher: {
      "@type": "Organization",
      name: "QuickBill POS",
      logo: {
        "@type": "ImageObject",
        url: typeof window !== "undefined" ? `${window.location.origin}/logo.svg` : "https://posquickbill.vercel.app/logo.svg",
      },
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: typeof window !== "undefined" ? window.location.origin : "https://posquickbill.vercel.app",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Privacy Policy",
          item: typeof window !== "undefined" ? `${window.location.origin}/privacy_policy` : "https://posquickbill.vercel.app/privacy_policy",
        },
      ],
    },
  };

  return (
    <div className="legal-page-wrap" id="privacy-policy-page">
      <SEO
        title="Privacy Policy — QuickBill POS | Offline-First Point of Sale"
        description="Official Privacy Policy for QuickBill POS (Web POS and Android App-POS). Read how customer transaction data, device permissions, and offline storage are handled securely."
        canonicalPath="/privacy_policy"
        keywords={[
          "QuickBill POS privacy policy",
          "POS data privacy",
          "offline POS privacy",
          "retail billing app permissions",
          "thermal printer bluetooth privacy",
        ]}
        type="article"
        schemaData={schemaData}
      />

      {/* Navigation Header */}
      <header className="nav" id="top-nav">
        <div className="wrap nav-inner">
          <Link to="/" className="brand" id="brand-logo-link">
            <img src="/logo.svg" className="logo" alt="QuickBill POS Logo" width={36} height={36} />
            QuickBill POS
          </Link>
          <nav className="nav-links" aria-label="Page navigation">
            <Link to="/" className="ghost" id="nav-back-home">← Back to Home</Link>
            <a
              href="https://posquickbill.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              id="nav-web-pos"
              style={{ color: "var(--blue)", fontWeight: 700 }}
            >
              Web POS App ↗
            </a>
            <Link to="/apk-upload" id="nav-admin" style={{ fontWeight: 600, color: "var(--navy)" }}>Admin</Link>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="legal-main" id="main-content">
        <div className="wrap">
          <article className="legal-card" id="privacy-policy-document">
            <header className="legal-header">
              <span className="kicker" id="policy-badge">
                <span className="dot" /> LEGAL & PRIVACY COMPLIANCE
              </span>
              <h1 id="page-heading">Privacy Policy</h1>
              <p className="legal-date" id="last-updated">Last updated: October 8, 2026</p>

              {/* Quick Tab Switcher */}
              <div className="legal-nav-tabs" aria-label="Legal documents">
                <Link to="/privacy_policy" className="legal-tab active" id="tab-privacy-policy">
                  Privacy Policy
                </Link>
                <Link to="/terms_and_condition" className="legal-tab" id="tab-terms-conditions">
                  Terms & Conditions
                </Link>
              </div>
            </header>

            <div className="legal-body">
              <div className="legal-callout" id="privacy-summary">
                <strong>Executive Summary:</strong> QuickBill POS is engineered around offline-first architecture. Your sales data, product catalogs, customer records, and invoices remain strictly on your local device. We never sell, harvest, or track your customer financial transactions.
              </div>

              <section id="section-introduction">
                <h2>1. Introduction & Scope</h2>
                <p>
                  This Privacy Policy governs the manner in which <strong>QuickBill POS</strong> (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) handles data and user privacy across our digital Point of Sale platforms, including our Web POS application (<strong>posquickbill.vercel.app</strong>) and our Android APK application (<strong>QuickBillPoss / App-POS</strong>).
                </p>
                <p>
                  By using or accessing QuickBill POS on any device, you acknowledge and agree to the data collection and management practices described in this document.
                </p>
              </section>

              <section id="section-data-collection">
                <h2>2. Information We Process</h2>
                <p>To provide high-speed retail checkout capabilities, the application processes the following types of information:</p>
                <ul>
                  <li>
                    <strong>Product & Inventory Data:</strong> Items, product names, SKU barcodes, categories, retail prices, and tax rates entered by the merchant.
                  </li>
                  <li>
                    <strong>Order & Transaction Records:</strong> Invoices, payment methods (Cash, Card, UPI, Split), timestamps, and itemized totals generated during checkout.
                  </li>
                  <li>
                    <strong>Customer Records (Optional):</strong> Contact information such as customer names or phone numbers entered solely for issuing digital receipts or loyalty lookup.
                  </li>
                  <li>
                    <strong>Hardware Connectivity:</strong> Anonymized Bluetooth identifiers used to pair and communicate with ESC/POS thermal receipt printers.
                  </li>
                </ul>
              </section>

              <section id="section-device-permissions">
                <h2>3. Android Device Permissions</h2>
                <p>
                  The QuickBill POS Android application requests minimal device permissions strictly necessary for hardware integration:
                </p>
                <ul>
                  <li>
                    <strong>Bluetooth & Nearby Devices (BLUETOOTH_CONNECT / BLUETOOTH_SCAN):</strong> Used solely to discover, connect with, and transmit receipt data to 58mm / 80mm ESC/POS thermal printers.
                  </li>
                  <li>
                    <strong>Camera Access:</strong> Utilized only when activating the in-app barcode or QR code scanner to quickly look up items during billing. No photos or video streams are stored or uploaded.
                  </li>
                  <li>
                    <strong>Storage Access:</strong> Enables exporting sales spreadsheets, PDF invoices, and offline SQLite database backup files.
                  </li>
                </ul>
              </section>

              <section id="section-offline-first">
                <h2>4. Offline-First Privacy & Data Sovereignty</h2>
                <p>
                  QuickBill POS functions entirely offline without requiring a constant internet connection:
                </p>
                <ul>
                  <li>Your billing data is stored locally in IndexedDB (Web) or SQLite/Room (Android).</li>
                  <li>We do not transmit your transactions to third-party ad networks or data brokers.</li>
                  <li>Merchants retain 100% ownership and control over their sales databases.</li>
                  <li>You can clear all stored records at any moment by clearing the application data or cache.</li>
                </ul>
              </section>

              <section id="section-third-party">
                <h2>5. Third-Party Infrastructure</h2>
                <p>
                  We rely on industry-standard infrastructure providers for hosting and software distribution:
                </p>
                <ul>
                  <li><strong>Vercel:</strong> Static asset CDN and website delivery.</li>
                  <li><strong>GitHub:</strong> Secure distribution of official Android APK releases.</li>
                </ul>
              </section>

              <section id="section-data-security">
                <h2>6. Data Security Practices</h2>
                <p>
                  We implement robust technical safeguards to ensure application stability and security. Since data resides locally on your terminal, we advise merchants to secure devices with screen locks, biometric authentication, and regular local backups.
                </p>
              </section>

              <section id="section-contact">
                <h2>7. Contact & Policy Updates</h2>
                <p>
                  We may periodically revise this Privacy Policy to reflect application upgrades or regulatory changes. For questions or privacy inquiries, contact the QuickBill POS administrative team via our official repository or contact channels.
                </p>
              </section>
            </div>
          </article>
        </div>
      </main>

      {/* Footer */}
      <footer id="footer">
        <div className="wrap foot">
          <span>QuickBill POS · Offline-first billing for retail desks</span>
          <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
            <Link to="/" id="footer-home" style={{ fontWeight: 600 }}>Home</Link>
            <Link to="/terms_and_condition" id="footer-terms" style={{ fontWeight: 600 }}>Terms & Conditions</Link>
            <Link to="/privacy_policy" id="footer-privacy" style={{ fontWeight: 600, color: "var(--blue)" }}>Privacy Policy</Link>
            <a
              href="https://posquickbill.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              id="footer-webpos"
              style={{ fontWeight: 600, color: "var(--blue)" }}
            >
              🌐 Web POS ↗
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
