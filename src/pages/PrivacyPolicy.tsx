import LegalLayout, { Fill, Mail, Table, type LegalSection } from "../components/LegalLayout";
import { LEGAL } from "../lib/legal";
import { WA_DISPLAY, waLink } from "../lib/contact";

const GLANCE = [
  "Your sales records are stored on your device first. Cloud sync is optional.",
  "We never sell, rent or trade your business or customer records.",
  "Bluetooth, camera and storage are used only for printing, scanning and import or export.",
  "You can delete your account any time in the app. Cloud data is wiped within 30 days.",
];

const SECTIONS: LegalSection[] = [
  {
    id: "introduction",
    title: "Introduction and Scope",
    body: (
      <>
        <div className="qb-callout">
          <strong>Privacy commitment.</strong> QuickBill POS is built on a <strong>local-first architecture</strong>.
          Your transactions, inventory and sales records are stored locally on your device. We never sell, rent or
          trade your business or customer records to third parties.
        </div>
        <p>
          QuickBill POS provides a point-of-sale (POS) and inventory management mobile application and related website
          services designed for retail merchants, small-to-medium businesses, cafés and service operators.
        </p>
        <p>This Privacy Policy applies to personal and business information collected through:</p>
        <ul>
          <li>
            The <strong>QuickBill POS</strong> mobile application (Android and iOS);
          </li>
          <li>
            Our official <strong>website</strong> and web-hosted portals;
          </li>
          <li>Cloud backup, cloud database synchronisation and subscription billing services (together, the &ldquo;Services&rdquo;).</li>
        </ul>
      </>
    ),
  },
  {
    id: "roles",
    title: "Roles: Data Controller and Data Processor",
    body: (
      <>
        <p>Under international privacy laws (including the EU/UK GDPR and California CCPA/CPRA):</p>
        <ul>
          <li>
            <strong>QuickBill POS as Data Controller.</strong> We act as the Data Controller for information about you
            (the merchant or website visitor), such as your registration email, store profile settings, device
            diagnostics and in-app purchase status.
          </li>
          <li>
            <strong>QuickBill POS as Data Processor (Service Provider).</strong> When you record personal details of
            your retail customers (such as names, phone numbers or email addresses for digital receipts),{" "}
            <strong>you, the merchant, are the Data Controller</strong>. We process that data only on your behalf, to
            provide receipts and transaction storage.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "information-we-collect",
    title: "Information We Collect",
    body: (
      <>
        <h3>A. Information you provide directly</h3>
        <ul>
          <li>
            <strong>Authentication:</strong> name, email address, profile photo (via Google Sign-In or Firebase Auth)
            and unique user IDs (<code>uid</code>). Passwords are never seen by us in plain text and are handled by
            Google Firebase Auth.
          </li>
          <li>
            <strong>Merchant store profile:</strong> business name, address, phone number, tax / VAT / GST registration
            number, currency, receipt header and footer notes, and store logo.
          </li>
          <li>
            <strong>Catalogue and sales records:</strong> product names, SKUs, barcodes, unit prices, cost prices, tax
            rates, sales history, order totals, discount coupons and expense logs.
          </li>
          <li>
            <strong>End-customer records:</strong> optional customer name, phone number and email entered at checkout
            for sending receipts or tracking credit.
          </li>
          <li>
            <strong>Contact inquiries:</strong> messages sent through our website contact form or support email.
          </li>
        </ul>

        <h3>B. Information collected automatically</h3>
        <ul>
          <li>
            <strong>Device data:</strong> hardware model, operating system version (Android / iOS), screen resolution,
            system language and time zone.
          </li>
          <li>
            <strong>App diagnostics and sync state:</strong> crash logs, sync failure diagnostics, database version
            checkpoints and execution metrics needed for software stability.
          </li>
          <li>
            <strong>Network state:</strong> connectivity status (online, offline, Wi-Fi, cellular), used to trigger
            sync queues.
          </li>
          <li>
            <strong>Website cookies:</strong> basic essential cookies to manage sessions and privacy-respecting website
            analytics. You can adjust cookie preferences in your browser.
          </li>
        </ul>

        <h3>C. In-app purchase and subscription details</h3>
        <p>
          When you buy a subscription through <strong>Google Play Billing</strong> or the <strong>Apple App Store</strong>,
          we receive transaction tokens, purchase IDs, subscription status and expiry timestamps. We{" "}
          <strong>never</strong> collect, receive or store your raw credit or debit card numbers.
        </p>
      </>
    ),
  },
  {
    id: "permissions",
    title: "Device Permissions",
    body: (
      <>
        <p>QuickBill POS requests only the permissions its features strictly need:</p>
        <Table
          head={["Permission", "Platform", "Purpose", "Data usage"]}
          rows={[
            [
              <strong key="p">Bluetooth (connect / scan)</strong>,
              "Android 12+ / iOS",
              "Discover and print receipts to Bluetooth ESC/POS thermal printers.",
              "Never used for location tracking or tracking user movement.",
            ],
            [
              <strong key="p">Camera</strong>,
              "Android / iOS",
              "Scan product barcodes and capture store logo images.",
              "Real-time scanning only. Video is never recorded or streamed.",
            ],
            [
              <strong key="p">Storage / document picker</strong>,
              "Android / iOS",
              "Export and import Excel / CSV inventory, sales and expense files.",
              "Restricted to files you select and app storage.",
            ],
            [
              <strong key="p">Internet</strong>,
              "Android / iOS",
              "Sync with Firebase Cloud Firestore and verify active subscriptions.",
              "Encrypted via TLS 1.3 / HTTPS.",
            ],
            [
              <strong key="p">Billing</strong>,
              "Android",
              "Manage in-app subscriptions and free trials via Google Play.",
              "Processed through the official Google Play Billing library.",
            ],
          ]}
        />
      </>
    ),
  },
  {
    id: "storage-and-sync",
    title: "Local-First Storage vs. Cloud Synchronisation",
    body: (
      <>
        <p>
          QuickBill POS operates on a <strong>local-first</strong> foundation:
        </p>
        <ul>
          <li>
            <strong>Local SQLite database.</strong> All transactions, products, receipts and expenses are processed
            locally in an isolated SQLite database on your device. You can work fully offline.
          </li>
          <li>
            <strong>Cloud sync (optional, requires sign-in).</strong> When you log in and enable cloud sync, your
            records synchronise with <strong>Google Firebase Cloud Firestore</strong> using TLS 1.3 transport
            encryption and AES-256 storage encryption. Your data is isolated using Firebase Security Rules.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "legal-bases",
    title: "Legal Bases for Processing (GDPR Article 6)",
    body: (
      <>
        <p>For users in the EEA, UK and Switzerland, our lawful bases for processing are:</p>
        <Table
          head={["Purpose", "Data categories", "Legal basis"]}
          rows={[
            [
              "Delivering POS, billing and cloud synchronisation",
              "Account info, business profile, sales records",
              <>
                <strong>Contractual necessity</strong> (Art. 6(1)(b))
              </>,
            ],
            [
              "Verifying subscription validity",
              "Purchase tokens, transaction identifiers",
              <>
                <strong>Contractual necessity</strong> (Art. 6(1)(b))
              </>,
            ],
            [
              "Preventing abuse, fixing bugs and securing servers",
              "Crash diagnostics, IP address, device specs",
              <>
                <strong>Legitimate interests</strong> (Art. 6(1)(f))
              </>,
            ],
            [
              "Meeting legal, statutory or tax obligations",
              "Receipts, invoice logs, billing records",
              <>
                <strong>Legal obligation</strong> (Art. 6(1)(c))
              </>,
            ],
          ]}
        />
      </>
    ),
  },
  {
    id: "third-parties",
    title: "Sub-Processors and Third Parties",
    body: (
      <>
        <p>We work only with vetted service providers that follow strict privacy safeguards:</p>
        <ul>
          <li>
            <strong>Google Firebase / Google Cloud:</strong> Cloud Firestore, Firebase Authentication and Cloud
            Functions (USA / global, Standard Contractual Clauses).
          </li>
          <li>
            <strong>Google Play Billing (Google LLC):</strong> in-app subscription processing on Android.
          </li>
          <li>
            <strong>Apple App Store / StoreKit (Apple Inc.):</strong> in-app subscription processing on iOS.
          </li>
          <li>
            <strong>Google Sign-In:</strong> optional OAuth single sign-on.
          </li>
        </ul>
        <div className="qb-callout">
          <strong>We do not sell, lease or monetise your data to data brokers or advertising networks.</strong>
        </div>
      </>
    ),
  },
  {
    id: "retention-and-deletion",
    title: "Data Retention and Account Deletion",
    body: (
      <>
        <p>You stay in control of your data:</p>
        <ul>
          <li>
            <strong>Local data</strong> stays on your device until you uninstall the app or clear app data.
          </li>
          <li>
            <strong>Cloud data</strong> is kept while your account is active.
          </li>
          <li>
            <strong>Account deletion (Apple Guideline 5.1.1(v) and GDPR).</strong> You can delete your account at any
            time in the app via <strong>Settings &gt; Account &gt; Delete Account</strong>, or by emailing{" "}
            <Mail address={LEGAL.privacyEmail} />. Once requested, your authentication and cloud database documents are
            permanently wiped within 30 days.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "your-rights",
    title: "Your Privacy Rights",
    body: (
      <>
        <p>Depending on where you live, you have the right to:</p>
        <ul>
          <li>
            <strong>Access and export:</strong> request a copy of your records, or export your sales and inventory to
            Excel / JSON files yourself.
          </li>
          <li>
            <strong>Rectification:</strong> correct inaccurate store or personal details in the app settings.
          </li>
          <li>
            <strong>Erasure:</strong> ask for permanent deletion of your account and cloud records.
          </li>
          <li>
            <strong>Opt out of cloud sync:</strong> use the app purely in offline mode.
          </li>
          <li>
            <strong>California residents (CCPA/CPRA):</strong> we do not sell or share personal information. You have
            the right to know, to delete, and to receive non-discriminatory service.
          </li>
        </ul>
        <p>
          To make a request, contact us at <Mail address={LEGAL.privacyEmail} />.
        </p>
      </>
    ),
  },
  {
    id: "children",
    title: "Children’s Privacy",
    body: (
      <p>
        QuickBill POS is designed strictly for commercial retail and business use. We do not knowingly collect personal
        data from children under 16 (or 13 where applicable). If we find such data, we will delete it immediately.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact Us",
    body: (
      <>
        <p>For questions or privacy requests, please contact our Data Protection Officer:</p>
        <ul>
          <li>
            <strong>App and website:</strong> QuickBill POS
          </li>
          <li>
            <strong>Entity:</strong> <Fill value={LEGAL.entityName} />
          </li>
          <li>
            <strong>Support email:</strong> <Mail address={LEGAL.supportEmail} />
          </li>
          <li>
            <strong>Privacy and DPO inquiries:</strong> <Mail address={LEGAL.privacyEmail} />
          </li>
          <li>
            <strong>WhatsApp (chat only):</strong>{" "}
            <a href={waLink("Hi QuickBill POS team, I have a privacy question.")} target="_blank" rel="noopener noreferrer">
              {WA_DISPLAY}
            </a>
          </li>
        </ul>
      </>
    ),
  },
];

export default function PrivacyPolicy() {
  return (
    <LegalLayout
      kind="privacy"
      title="Privacy Policy"
      seoTitle="Privacy Policy | QuickBill POS"
      seoDescription="How QuickBill POS handles your data: local-first storage, optional cloud sync, device permissions, your privacy rights and how to delete your account."
      canonicalPath="/privacy-policy"
      glance={GLANCE}
      sections={SECTIONS}
      next={{ to: "/terms-and-conditions", label: "Terms & Conditions" }}
    />
  );
}
