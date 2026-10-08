import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import SEO from "../components/SEO";

export default function TermsAndConditions() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Terms and Conditions — QuickBill POS",
    description:
      "Official Terms and Conditions for QuickBill POS Point of Sale applications. Software license, offline responsibilities, and merchant operational terms.",
    url: typeof window !== "undefined" ? `${window.location.origin}/terms_and_condition` : "https://posquickbill.vercel.app/terms_and_condition",
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
          name: "Terms and Conditions",
          item: typeof window !== "undefined" ? `${window.location.origin}/terms_and_condition` : "https://posquickbill.vercel.app/terms_and_condition",
        },
      ],
    },
  };

  return (
    <div className="legal-page-wrap" id="terms-conditions-page">
      <SEO
        title="Terms and Conditions — QuickBill POS | Retail Billing Software"
        description="Official Terms and Conditions for QuickBill POS (Web POS and Android App-POS). Read our software license terms, offline data disclaimers, and user guidelines."
        canonicalPath="/terms_and_condition"
        keywords={[
          "QuickBill POS terms and conditions",
          "POS software license terms",
          "retail billing legal terms",
          "offline POS terms of service",
        ]}
        type="article"
        schemaData={schemaData}
      />

      {/* Navigation Header */}
      <header className="nav" id="top-nav">
        <div className="wrap nav-inner">
          <Link to="/" className="brand" id="brand-logo-link">
            <img src="/logo.svg" className="logo" alt="QuickBill POS Logo" width={38} height={38} />
            QuickBill POS
          </Link>
          <nav className="nav-links" aria-label="Page navigation">
            <Link to="/" className="ghost" id="nav-back-home">← Back to Home</Link>
            <a
              href="https://posquickbill.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              id="nav-web-pos"
              className="btn btn-primary"
              style={{ padding: "8px 16px", fontSize: 13.5 }}
            >
              Launch Web POS ↗
            </a>
            <Link to="/apk-upload" id="nav-admin" className="ghost" style={{ fontWeight: 700 }}>Admin</Link>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="legal-main" id="main-content">
        <div className="wrap">
          <article className="legal-card" id="terms-document">
            <header className="legal-header">
              <span className="kicker" id="terms-badge">
                <span className="dot" /> LEGAL & OPERATIONAL TERMS
              </span>
              <h1 id="page-heading">Terms and Conditions</h1>
              <p className="legal-date" id="last-updated">Last updated: October 8, 2026</p>

              {/* Quick Tab Switcher */}
              <div className="legal-nav-tabs" aria-label="Legal documents">
                <Link to="/privacy_policy" className="legal-tab" id="tab-privacy-policy">
                  Privacy Policy
                </Link>
                <Link to="/terms_and_condition" className="legal-tab active" id="tab-terms-conditions">
                  Terms & Conditions
                </Link>
              </div>

              {/* Utility Action Buttons */}
              <div className="legal-actions-strip">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => window.print()}
                  style={{ padding: "7px 14px", fontSize: 13 }}
                >
                  🖨️ Print Terms
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleCopy}
                  style={{ padding: "7px 14px", fontSize: 13 }}
                >
                  {copied ? "✓ Copied Link!" : "📋 Copy URL"}
                </button>
              </div>
            </header>

            <div className="legal-body">
              <div className="legal-callout" id="terms-summary">
                <strong>Executive Summary:</strong> QuickBill POS is provided to empower retail counters with independent, offline-first billing. You retain 100% control of your sales data and are responsible for backing up your local device records and complying with your local retail tax regulations.
              </div>

              <section id="section-acceptance">
                <h2>1. Acceptance of Terms</h2>
                <p>
                  By accessing, downloading, installing, or operating <strong>QuickBill POS</strong> (&quot;the Service&quot;), including the web application hosted at <strong>posquickbill.vercel.app</strong> and the mobile Android package <strong>QuickBillPoss (App-POS)</strong>, you agree to be bound by these Terms and Conditions.
                </p>
                <p>
                  If you disagree with any portion of these terms, you must refrain from installing or using the software.
                </p>
              </section>

              <section id="section-license">
                <h2>2. Software License & Permitted Usage</h2>
                <p>
                  We grant you a non-exclusive, revocable, non-transferable license to deploy and operate QuickBill POS for commercial or personal point of sale billing on your compatible devices:
                </p>
                <ul>
                  <li>You may install the Android APK on multiple POS terminals, smartphones, and tablets across your retail locations.</li>
                  <li>You may access and utilize the Web POS desk across modern web browsers.</li>
                  <li>You agree not to reverse-engineer, decompile, or attempt to tamper with the core integrity of the software packages.</li>
                </ul>
              </section>

              <section id="section-offline-responsibility">
                <h2>3. Offline-First Architecture & Merchant Responsibilities</h2>
                <p>
                  Because QuickBill POS is architected as an offline-first solution:
                </p>
                <ul>
                  <li>
                    <strong>Local Data Storage:</strong> Sales data, receipts, product inventories, and shift logs reside locally within the browser IndexedDB storage or mobile SQLite database.
                  </li>
                  <li>
                    <strong>Backup Obligation:</strong> Merchants are solely responsible for executing periodic exports and database backups. We do not maintain server-side copies of your local ledger.
                  </li>
                  <li>
                    <strong>Hardware Pairing:</strong> Users are responsible for procuring compatible Bluetooth ESC/POS thermal printers and ensuring correct paper roll calibration.
                  </li>
                </ul>
              </section>

              <section id="section-tax-compliance">
                <h2>4. Indian GST Compliance & Tax Invoicing (CGST / SGST / IGST)</h2>
                <p>
                  QuickBill POS provides customizable tax rate settings compliant with the <strong>Central Goods and Services Tax Act, 2017 (CGST)</strong>, State GST (SGST), and Integrated GST (IGST). It remains the merchant&apos;s sole obligation to:
                </p>
                <ul>
                  <li>Configure accurate HSN / SAC codes and applicable GST slabs (0%, 5%, 12%, 18%, 28%) for their business category.</li>
                  <li>Print valid GSTIN (Goods and Services Tax Identification Number) on commercial tax invoices issued to customers.</li>
                  <li>Fulfill all statutory GSTR-1, GSTR-3B, or Composition Scheme revenue declarations with local tax authorities.</li>
                  <li>Maintain accurate daily register records and offline ledger backups for statutory audits.</li>
                </ul>
              </section>

              <section id="section-disclaimer">
                <h2>5. Disclaimer of Warranties</h2>
                <p>
                  THE SOFTWARE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
                </p>
                <p>
                  While QuickBill POS is thoroughly tested for retail stability, we do not warrant that operation will be error-free or completely uninterrupted under all hardware configurations.
                </p>
              </section>

              <section id="section-liability">
                <h2>6. Limitation of Liability</h2>
                <p>
                  To the maximum extent permitted by applicable law, in no event shall QuickBill POS, its creators, or contributors be held liable for any indirect, incidental, punitive, or consequential damages resulting from lost sales, corrupted local storage, or printer communication timeouts.
                </p>
              </section>

              <section id="section-governing">
                <h2>7. Merchant Support & Inquiries</h2>
                <p>
                  We reserve the right to amend these terms as new builds and capabilities roll out. For commercial software support, licensing queries, or hardware assistance, contact our team:
                </p>
                <p>
                  💬 <strong>Merchant WhatsApp Support:</strong>{" "}
                  <a href="https://wa.me/919446960834?text=Hi%20QuickBill%20POS%20Team!%20I%20have%20an%20inquiry%20regarding%20Terms%20and%20Conditions" target="_blank" rel="noopener noreferrer" style={{ color: "#16a34a", fontWeight: 750 }}>
                    +91 9446960834
                  </a>{" "}
                  <span style={{ color: "var(--muted)" }}>(WhatsApp Chat Only · No Calls)</span>
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
            <Link to="/terms_and_condition" id="footer-terms" style={{ fontWeight: 600, color: "var(--primary)" }}>Terms & Conditions</Link>
            <Link to="/privacy_policy" id="footer-privacy" style={{ fontWeight: 600 }}>Privacy Policy</Link>
            <a
              href="https://posquickbill.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              id="footer-webpos"
              style={{ fontWeight: 700, color: "var(--primary)" }}
            >
              🌐 Web POS ↗
            </a>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Quick Action Button */}
      <a
        href="https://wa.me/919446960834?text=Hi%20QuickBill%20POS%20Team!%20I%20have%20a%20query%20regarding%20Terms%20and%20Conditions"
        target="_blank"
        rel="noopener noreferrer"
        className="floating-whatsapp-btn"
        aria-label="Chat on WhatsApp"
        title="WhatsApp Support (Chat Only): +91 9446960834"
      >
        <span style={{ fontSize: 20 }}>💬</span>
        <span className="floating-whatsapp-text">WhatsApp Support: +91 9446960834</span>
      </a>
    </div>
  );
}
