import { Link } from "react-router-dom";
import { useEffect } from "react";

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="legal-page-wrap">
      {/* Navigation Header */}
      <header className="nav">
        <div className="wrap nav-inner">
          <Link to="/" className="brand">
            <img src="/logo.svg" className="logo" alt="QuickBill POS" width={36} height={36} />
            QuickBill POS
          </Link>
          <nav className="nav-links">
            <Link to="/" className="ghost">← Back to Home</Link>
            <a
              href="https://posquickbill.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--blue)", fontWeight: 700 }}
            >
              Web POS App ↗
            </a>
            <Link to="/apk-upload" style={{ fontWeight: 600, color: "var(--navy)" }}>Admin</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="legal-main">
        <div className="wrap">
          <article className="legal-card">
            <div className="legal-header">
              <span className="kicker">
                <span className="dot" /> LEGAL & PRIVACY
              </span>
              <h1>Privacy Policy</h1>
              <p className="legal-date">Last updated: October 8, 2026</p>

              {/* Quick Switcher */}
              <div className="legal-nav-tabs">
                <Link to="/privacy-policy" className="legal-tab active">
                  Privacy Policy
                </Link>
                <Link to="/terms-and-condition" className="legal-tab">
                  Terms & Conditions
                </Link>
              </div>
            </div>

            <div className="legal-body">
              <div className="legal-callout">
                <strong>Summary:</strong> QuickBill POS is designed with privacy and offline reliability at its core. Your billing data, inventory records, and customer details remain stored locally on your device unless you explicitly configure remote synchronization or backup.
              </div>

              <h2>1. Introduction</h2>
              <p>
                Welcome to <strong>QuickBill POS</strong> (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). This Privacy Policy explains how we handle information across our Point of Sale platforms, including our web application (<strong>posquickbill.vercel.app</strong>) and our Android APK application (<strong>QuickBillPoss / App-POS</strong>).
              </p>
              <p>
                By downloading, accessing, or using QuickBill POS, you agree to the collection and use of information in accordance with this policy.
              </p>

              <h2>2. Information We Collect</h2>
              <p>We may collect or process the following categories of data when you utilize our software:</p>
              <ul>
                <li>
                  <strong>Business & Transaction Data:</strong> Product lists, SKU codes, pricing, inventory quantities, tax rates, generated invoices, and sales receipts created within the application.
                </li>
                <li>
                  <strong>Customer Records:</strong> Optional contact details (such as customer name, phone number, or email) that you enter to issue digital receipts or manage customer loyalty.
                </li>
                <li>
                  <strong>Device & Hardware Information:</strong> Basic device parameters (OS version, device model) utilized strictly for hardware compatibility (e.g., Bluetooth thermal printers).
                </li>
                <li>
                  <strong>Technical Diagnostics:</strong> Anonymized application crash logs or diagnostic reports to resolve technical errors and improve stability.
                </li>
              </ul>

              <h2>3. Device Permissions (Android App-POS)</h2>
              <p>
                To provide standard Point of Sale capabilities, the QuickBill POS mobile application may request the following device permissions:
              </p>
              <ul>
                <li>
                  <strong>Bluetooth & Nearby Devices (BLUETOOTH_CONNECT / BLUETOOTH_SCAN):</strong> Required solely to discover, pair with, and print receipts to Bluetooth ESC/POS thermal printers.
                </li>
                <li>
                  <strong>Camera:</strong> Used exclusively when scanning barcodes or QR codes for quick product lookups and billing. We do not store or transmit photos or camera feeds.
                </li>
                <li>
                  <strong>Storage / File Access:</strong> Required to export sales reports, download PDF/Excel invoices, and save offline local database backups.
                </li>
              </ul>

              <h2>4. Offline-First Architecture & Data Ownership</h2>
              <p>
                QuickBill POS operates primarily on an <strong>offline-first</strong> architecture. All sales records, item inventories, and settings are stored locally on your device (via IndexedDB / SQLite / Room Database).
              </p>
              <ul>
                <li>We do not sell, rent, monetize, or harvest your transactional or sales data.</li>
                <li>You retain full ownership of all data you input into the application.</li>
                <li>You can clear your local data at any time through the application settings or by clearing your browser/app storage.</li>
              </ul>

              <h2>5. Third-Party Services</h2>
              <p>
                Our web landing page and APK distribution may rely on trusted third-party providers:
              </p>
              <ul>
                <li><strong>Hosting & CDN:</strong> Vercel (for web app hosting) and GitHub Releases (for official APK download distribution).</li>
                <li><strong>External Links:</strong> Our website may contain links to external sites. We are not responsible for the privacy practices or content of third-party platforms.</li>
              </ul>

              <h2>6. Security of Your Data</h2>
              <p>
                We employ industry-standard security measures to safeguard your information. Because data is stored locally on your POS hardware or browser, we recommend securing your device with strong passwords, PINs, or biometric locks to prevent unauthorized physical access.
              </p>

              <h2>7. Children's Privacy</h2>
              <p>
                QuickBill POS is a commercial business billing tool and is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from children.
              </p>

              <h2>8. Updates to this Privacy Policy</h2>
              <p>
                We may update our Privacy Policy periodically to reflect changes in our practices or applicable laws. Any updates will be published on this page with an updated &quot;Last updated&quot; date.
              </p>

              <h2>9. Contact Us</h2>
              <p>
                If you have questions, feedback, or data requests regarding this Privacy Policy, please reach out to the QuickBill POS administrative team or open an issue on our official repository.
              </p>
            </div>
          </article>
        </div>
      </main>

      {/* Footer */}
      <footer>
        <div className="wrap foot">
          <span>QuickBill POS · Web app and App-POS (QuickBillPoss)</span>
          <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
            <Link to="/" style={{ fontWeight: 600 }}>Home</Link>
            <Link to="/terms-and-condition" style={{ fontWeight: 600 }}>Terms & Conditions</Link>
            <Link to="/privacy-policy" style={{ fontWeight: 600, color: "var(--blue)" }}>Privacy Policy</Link>
            <a
              href="https://posquickbill.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
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
