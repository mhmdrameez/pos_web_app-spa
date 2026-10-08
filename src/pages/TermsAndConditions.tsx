import { Link } from "react-router-dom";
import { useEffect } from "react";
import SEO from "../components/SEO";

export default function TermsAndConditions() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
          <article className="legal-card" id="terms-document">
            <header className="legal-header">
              <span className="kicker" id="terms-badge">
                <span className="dot" /> LEGAL & TERMS OF SERVICE
              </span>
              <h1 id="page-heading">Terms and Conditions</h1>
              <p className="legal-date" id="last-updated">Last updated: October 8, 2026</p>

              {/* Quick Tab Switcher */}
              <div className="legal-nav-tabs" aria-label="Legal documents">
                <Link to="/terms_and_condition" className="legal-tab active" id="tab-terms-conditions">
                  Terms & Conditions
                </Link>
                <Link to="/privacy_policy" className="legal-tab" id="tab-privacy-policy">
                  Privacy Policy
                </Link>
              </div>
            </header>

            <div className="legal-body">
              <div className="legal-callout" id="terms-notice">
                <strong>Important Notice:</strong> By accessing or using QuickBill POS (Web POS and Android App-POS), you agree to comply with and be bound by the following terms, conditions, and operational policies.
              </div>

              <section id="section-acceptance">
                <h2>1. Agreement & Acceptance</h2>
                <p>
                  These Terms and Conditions (&quot;Terms&quot;) constitute a legally binding agreement between you (&quot;User&quot;, &quot;Merchant&quot;, or &quot;Customer&quot;) and <strong>QuickBill POS</strong> (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), governing your use of our retail billing software platforms.
                </p>
                <p>
                  If you disagree with any part of these Terms, you must discontinue your use of our applications immediately.
                </p>
              </section>

              <section id="section-license">
                <h2>2. Software License Grant</h2>
                <p>
                  We grant you a non-exclusive, non-transferable, revocable license to utilize QuickBill POS for your internal business operations, retail checkout, and customer receipt generation:
                </p>
                <ul>
                  <li>Install and operate the Android App-POS APK on compatible hardware terminals and smartphones.</li>
                  <li>Access and execute the Web POS application across desktop and tablet web browsers.</li>
                  <li>Generate, print, and export receipt invoices for retail billing.</li>
                </ul>
              </section>

              <section id="section-merchant-responsibilities">
                <h2>3. Merchant Responsibilities & Invoicing Compliance</h2>
                <p>Merchants utilizing QuickBill POS are solely responsible for:</p>
                <ul>
                  <li>
                    <strong>Pricing & Calculation Accuracy:</strong> Verifying all product costs, retail taxes (such as GST or VAT), discounts, and final invoice calculations.
                  </li>
                  <li>
                    <strong>Legal & Fiscal Compliance:</strong> Complying with all local tax authority regulations governing invoice generation, bill numbering, and record retention.
                  </li>
                  <li>
                    <strong>Receipt Delivery:</strong> Issuing truthful and accurate bills to consumers for all commercial transactions.
                  </li>
                </ul>
              </section>

              <section id="section-offline-backups">
                <h2>4. Offline Data Storage & Backup Disclaimer</h2>
                <p>
                  QuickBill POS functions primarily as an offline-first system. All transaction histories and product records are stored in the local memory of your terminal (SQLite / IndexedDB).
                </p>
                <p>
                  <strong>Merchant Data Responsibility:</strong> QuickBill POS is not liable for data loss caused by hardware malfunction, operating system clearing, browser cache resets, or uninstallation. You are advised to perform regular exports and backups of your sales data.
                </p>
              </section>

              <section id="section-prohibited-uses">
                <h2>5. Prohibited Uses</h2>
                <p>You agree not to:</p>
                <ul>
                  <li>Decompile, reverse-engineer, or tamper with the proprietary logic of the application.</li>
                  <li>Use the software to produce fraudulent, unlawful, or misleading invoices.</li>
                  <li>Interfere with or circumvent the security mechanisms of our release distributions.</li>
                </ul>
              </section>

              <section id="section-liability">
                <h2>6. Limitation of Liability</h2>
                <p>
                  QuickBill POS is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind. Under no circumstances shall the developers of QuickBill POS be liable for indirect, incidental, or consequential damages resulting from hardware incompatibility (including thermal printers) or operational interruptions.
                </p>
              </section>

              <section id="section-changes">
                <h2>7. Amendments & Updates</h2>
                <p>
                  We reserve the right to amend these Terms at any time. Updates become effective immediately upon being published on this page. Your continued use of the application signifies your acceptance of any amended terms.
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
            <Link to="/terms_and_condition" id="footer-terms" style={{ fontWeight: 600, color: "var(--blue)" }}>Terms & Conditions</Link>
            <Link to="/privacy_policy" id="footer-privacy" style={{ fontWeight: 600 }}>Privacy Policy</Link>
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
