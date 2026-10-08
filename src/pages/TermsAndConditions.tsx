import { Link } from "react-router-dom";
import { useEffect } from "react";

export default function TermsAndConditions() {
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
                <span className="dot" /> LEGAL & TERMS
              </span>
              <h1>Terms and Conditions</h1>
              <p className="legal-date">Last updated: October 8, 2026</p>

              {/* Quick Switcher */}
              <div className="legal-nav-tabs">
                <Link to="/terms-and-condition" className="legal-tab active">
                  Terms & Conditions
                </Link>
                <Link to="/privacy-policy" className="legal-tab">
                  Privacy Policy
                </Link>
              </div>
            </div>

            <div className="legal-body">
              <div className="legal-callout">
                <strong>Important Notice:</strong> By accessing or using QuickBill POS (Web POS and Android App-POS), you acknowledge that you have read, understood, and agreed to be bound by these Terms and Conditions.
              </div>

              <h2>1. Agreement to Terms</h2>
              <p>
                These Terms and Conditions (&quot;Terms&quot;) constitute a legally binding agreement between you (&quot;User&quot;, &quot;Merchant&quot;, or &quot;you&quot;) and <strong>QuickBill POS</strong> (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), regarding your access to and use of our Point of Sale software, including the web application and Android mobile application.
              </p>
              <p>
                If you do not agree with any part of these Terms, you must discontinue the use of our applications and services immediately.
              </p>

              <h2>2. License to Use</h2>
              <p>
                Subject to your compliance with these Terms, QuickBill POS grants you a limited, non-exclusive, non-transferable, revocable license to:
              </p>
              <ul>
                <li>Install and run the QuickBill POS Android application on compatible devices.</li>
                <li>Access and utilize the QuickBill POS web software through standard web browsers.</li>
                <li>Generate and print receipts, bills, and reports solely for your legitimate business or personal operational purposes.</li>
              </ul>

              <h2>3. User Responsibilities & Tax Compliance</h2>
              <p>As a merchant or user utilizing QuickBill POS, you are solely responsible for:</p>
              <ul>
                <li>
                  <strong>Accuracy of Invoices:</strong> Ensuring that item names, rates, quantities, discounts, and totals calculated on customer receipts are accurate.
                </li>
                <li>
                  <strong>Tax & Legal Compliance:</strong> Ensuring that tax rates (such as GST, VAT, or local sales taxes) applied within the app comply with the tax jurisdiction where your business operates.
                </li>
                <li>
                  <strong>Customer Receipts:</strong> Providing valid and lawful receipts to your customers in accordance with consumer protection regulations.
                </li>
              </ul>

              <h2>4. Offline Storage & Backup Responsibility</h2>
              <p>
                QuickBill POS is designed as an offline-first solution. Your transaction history, inventory catalogs, and customer data are stored locally in your device&apos;s internal database.
              </p>
              <p>
                <strong>Merchant Responsibility:</strong> You are solely responsible for regularly exporting, saving, or backing up your sales data and reports. QuickBill POS is not liable for data loss arising from device damage, clearing of browser cache, app uninstallation, or operating system resets.
              </p>

              <h2>5. Prohibited Activities</h2>
              <p>You agree not to engage in any of the following activities:</p>
              <ul>
                <li>Attempting to reverse-engineer, decompile, or disassemble any part of the application software except as permitted by applicable law.</li>
                <li>Using the software to generate fraudulent invoices, deceptive receipts, or facilitate illegal commerce.</li>
                <li>Interfering with or disrupting the integrity or performance of the software or third-party release servers.</li>
              </ul>

              <h2>6. Intellectual Property Rights</h2>
              <p>
                All trademarks, logos, brand assets, source code, designs, and interface graphics associated with QuickBill POS are the intellectual property of QuickBill POS and its licensors. You may not copy, reproduce, or redistribute these assets without prior written consent.
              </p>

              <h2>7. Disclaimer of Warranties</h2>
              <p>
                QuickBill POS is provided on an <strong>&quot;AS IS&quot;</strong> and <strong>&quot;AS AVAILABLE&quot;</strong> basis, without warranties of any kind, whether express, implied, or statutory. We do not guarantee that the software will be uninterrupted, error-free, or compatible with every thermal printer model or hardware accessory.
              </p>

              <h2>8. Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by law, QuickBill POS and its creators shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, business revenue, data, or operational downtime arising out of your use or inability to use the software.
              </p>

              <h2>9. Changes to Terms</h2>
              <p>
                We reserve the right to modify or replace these Terms at any time. When modifications occur, we will update the &quot;Last updated&quot; date at the top of this document. Continued use of QuickBill POS after any changes constitutes acceptance of the new Terms.
              </p>

              <h2>10. Contact & Support</h2>
              <p>
                If you have questions, feedback, or need clarification regarding these Terms and Conditions, please contact the QuickBill POS administrative team or visit our official support channels.
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
            <Link to="/terms-and-condition" style={{ fontWeight: 600, color: "var(--blue)" }}>Terms & Conditions</Link>
            <Link to="/privacy-policy" style={{ fontWeight: 600 }}>Privacy Policy</Link>
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
