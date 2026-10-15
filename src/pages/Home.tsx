import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { fetchReleases, type Release } from "../api";
import SEO from "../components/SEO";
import SiteHeader from "../components/SiteHeader";
import SiteFooter, { WhatsAppFloat } from "../components/SiteFooter";
import Icon from "../components/Icon";
import Receipt from "../components/Receipt";
import PricingSection from "../components/PricingSection";
import DownloadSection from "../components/DownloadSection";
import { waLink } from "../lib/contact";

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: "Do I need internet to bill my customers?",
    a: "No. Every bill is saved on your phone or tablet, so billing keeps working when the network is down or the router restarts. Connect now and then so the app can sync and check your subscription.",
  },
  {
    q: "Can customers pay by UPI?",
    a: "Yes. A QR code with the exact bill amount shows on your screen and prints on the bill. Customers can scan it with Google Pay, PhonePe, Paytm, BHIM or any other UPI app.",
  },
  {
    q: "Does it handle GST?",
    a: "Yes. Choose 5%, 12% or 18%, and the bill shows CGST and SGST separately with your GSTIN. If you are unregistered or on the Composition Scheme, set the rate to 0%. Check with your CA for your exact filing needs.",
  },
  {
    q: "Which printers work with it?",
    a: "Standard ESC/POS thermal printers over Bluetooth or USB, in 58 mm (2-inch) and 80 mm (3-inch) paper. That covers most portable pocket printers and desktop receipt printers. There are no drivers to install.",
  },
  {
    q: "How much does it cost?",
    a: "₹99 a month, or ₹999 a year (that is about ₹83 a month). You can also buy the annual kit for ₹3,199, which includes a Bluetooth printer, a year of the app and five paper rolls. Bills are unlimited on every plan.",
  },
  {
    q: "Which phones and tablets can I use?",
    a: "Android phones, tablets and POS handhelds running Android 7.0 or newer. The app is built for 64-bit (arm64-v8a) devices, which is almost every current Android phone and tablet.",
  },
  {
    q: "Where is my sales data stored?",
    a: "On your own device first. If you sign in and turn on optional cloud sync, your records are backed up to Google Firebase. We never sell your data. The full details are in our Privacy Policy.",
  },
];

const STEPS = [
  {
    title: "Install the app",
    body: "Download it, open the file, and allow the install if Android asks. It is about 30 MB.",
  },
  {
    title: "Add your shop",
    body: "Enter your shop name, GST rate and UPI ID. Add a few items, or skip that and just type amounts.",
  },
  {
    title: "Start billing",
    body: "Type the amount, tap Add, then Pay. Pair a Bluetooth printer if you want a paper bill.",
  },
];

const FEATURES: Array<{ icon: Parameters<typeof Icon>[0]["name"]; title: string; body: string }> = [
  {
    icon: "keypad",
    title: "Type the amount, tap Add",
    body: "Not everything has a barcode. Key in the rupee amount for a loose item, or pick saved items when you have them.",
  },
  {
    icon: "offline",
    title: "Keeps working offline",
    body: "Bills are saved on the device. If the network drops or the router restarts, the counter carries on.",
  },
  {
    icon: "receipt",
    title: "GST bills with CGST and SGST",
    body: "Pick 5%, 12% or 18% and your GSTIN prints on the bill. Set 0% if you are unregistered or on the Composition Scheme.",
  },
  {
    icon: "qr",
    title: "UPI QR with the exact amount",
    body: "Show it on the screen or print it on the bill. Customers pay with whichever UPI app they already use.",
  },
  {
    icon: "hold",
    title: "Hold a bill, serve the next person",
    body: "Customer went to fetch one more thing? Hold the bill, take the next customer, and bring it back later.",
  },
  {
    icon: "printer",
    title: "Prints on 58 mm and 80 mm paper",
    body: "Connect a Bluetooth or USB thermal printer. The bill is laid out to fit whichever roll you load.",
  },
];

function useIsAndroid() {
  const [isAndroid] = useState(
    () => typeof navigator !== "undefined" && /android/i.test(navigator.userAgent)
  );
  return isAndroid;
}

export default function Home() {
  const location = useLocation();
  const isAndroid = useIsAndroid();
  const [latest, setLatest] = useState<Release | null>(null);
  const [allReleases, setAllReleases] = useState<Release[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showBar, setShowBar] = useState(false);

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

    function handleUpdate(e: Event) {
      const detail = (e as CustomEvent<Release[]>).detail;
      if (Array.isArray(detail) && detail.length > 0) {
        setLatest(detail[0]);
        setAllReleases(detail);
      }
    }
    window.addEventListener("qb:releases_updated", handleUpdate);
    return () => window.removeEventListener("qb:releases_updated", handleUpdate);
  }, []);

  useEffect(() => {
    const id = location.hash.replace("#", "");
    const target = id ? document.getElementById(id) : null;
    if (target) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      requestAnimationFrame(() => target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }));
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.key, location.hash]);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const watched = ["hero-cta", "download", "final-cta"];
    const visible = new Set<string>(["hero-cta"]);
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target.id);
        else visible.delete(entry.target.id);
      }
      setShowBar(visible.size === 0);
    });
    watched.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  const direct = Boolean(latest && isAndroid);
  const ctaHref = direct && latest ? latest.downloadUrl : "#download";
  const ctaMain = isAndroid ? "Download the app" : "Get the Android app";
  const ctaSub = latest
    ? isAndroid
      ? `${latest.version} · ${latest.sizeLabel}`
      : "Scan a QR code with your phone"
    : "Download link on this page";

  const ctaProps = direct
    ? { href: ctaHref, target: "_blank", rel: "noopener noreferrer" }
    : { href: ctaHref };

  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "QuickBill POS",
      url: "https://www.quickbillpos.in",
      inLanguage: "en-IN",
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "QuickBill POS",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Android",
      url: "https://www.quickbillpos.in",
      description:
        "Offline billing app for Indian shops with GST bills, UPI QR payments and Bluetooth thermal printing.",
      offers: [
        { "@type": "Offer", name: "Monthly", price: "99", priceCurrency: "INR" },
        { "@type": "Offer", name: "Yearly", price: "999", priceCurrency: "INR" },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "QuickBill POS",
      url: "https://www.quickbillpos.in",
      logo: "https://www.quickbillpos.in/logo.svg",
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+91-9446960834",
        contactType: "customer service",
        areaServed: "IN",
        availableLanguage: ["en", "hi"],
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  return (
    <div className="qb">
      <SEO
        title="QuickBill POS: Billing app for Indian shops that works offline"
        description="Bill customers in seconds with GST invoices, a UPI QR on every bill and Bluetooth thermal printing. Works without internet on any Android phone or tablet. From ₹99 a month."
        canonicalPath="/"
        keywords={[
          "QuickBill POS",
          "billing app for kirana store",
          "offline billing software India",
          "GST billing app Android",
          "UPI QR billing",
          "Bluetooth thermal printer billing app",
          "POS app for small shops",
        ]}
        schemaData={schema}
      />

      <SiteHeader />

      <main id="main-content">
        {/* HERO */}
        <section className="qb-hero">
          <div className="qb-wrap qb-hero__grid">
            <div className="qb-hero__copy">
              <p className="qb-eyebrow">For kirana, café &amp; bakery</p>
              <h1>
                Bill in{" "}
                <span className="qb-ul">
                  two seconds
                  <svg viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M2 8 C 38 2, 72 11, 108 5 S 172 3, 198 7" pathLength="1" />
                  </svg>
                </span>
                . Even when the internet is down.
              </h1>
              <p className="qb-lede">
                QuickBill POS is a billing app that runs on the Android phone or tablet you already own. Type the
                amount, take cash or UPI, print the bill. Your counter never waits on the network.
              </p>
              <p className="qb-hi" lang="hi">
                इंटरनेट बंद हो, तब भी बिलिंग चलती रहती है।
              </p>

              <div className="qb-cta-row" id="hero-cta">
                <a className="qb-btn qb-btn--primary qb-btn--lg" {...ctaProps}>
                  <Icon name="download" />
                  <span className="qb-btn__text">
                    <span className="qb-btn__main">{ctaMain}</span>
                    <span className="qb-btn__sub">{ctaSub}</span>
                  </span>
                </a>
                <a
                  className="qb-btn qb-btn--ghost qb-btn--lg"
                  href={waLink("Hi QuickBill POS team, I'd like to see how it works for my shop.")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon name="chat" />
                  <span className="qb-btn__text">
                    <span className="qb-btn__main">Ask us on WhatsApp</span>
                    <span className="qb-btn__sub">Chat with a real person</span>
                  </span>
                </a>
              </div>

              <ul className="qb-micro">
                <li>
                  <Icon name="check" size={18} /> No sign-up to install
                </li>
                <li>
                  <Icon name="check" size={18} /> Android 7.0+
                </li>
                <li>
                  <Icon name="check" size={18} /> Works offline
                </li>
              </ul>
            </div>

            <div className="qb-stage">
              <figure className="qb-device qb-device--tilt">
                <img
                  src="/mockups/mobile-pos.png"
                  width={1024}
                  height={550}
                  alt="The QuickBill POS billing screen: a big amount field, a number keypad, and Hold, Print and Pay buttons"
                />
              </figure>
              <div className="qb-stage__receipt">
                <Receipt tilt />
              </div>
            </div>
          </div>
        </section>

        {/* FACTS */}
        <section className="qb-facts" aria-label="At a glance">
          <div className="qb-wrap qb-facts__grid">
            <div>
              <strong>No internet needed</strong>
              <span>Bills are saved on your device</span>
            </div>
            <div>
              <strong>GST ready</strong>
              <span>CGST and SGST on every bill</span>
            </div>
            <div>
              <strong>UPI QR on the bill</strong>
              <span>Google Pay, PhonePe, Paytm, BHIM</span>
            </div>
            <div>
              <strong>58 mm and 80 mm</strong>
              <span>Bluetooth and USB printers</span>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="qb-sec" id="how">
          <div className="qb-wrap">
            <div className="qb-head">
              <p className="qb-eyebrow">How it works</p>
              <h2 className="qb-h2">Ready to bill in about two minutes.</h2>
              <p className="qb-sub">No hardware to wire up and no account to create. Three steps and you&rsquo;re at the counter.</p>
            </div>
            <ol className="qb-steps">
              {STEPS.map((s, i) => (
                <li key={s.title}>
                  <span className="qb-steps__n" aria-hidden="true">
                    {i + 1}
                  </span>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* FEATURES */}
        <section className="qb-sec qb-sec--alt" id="features">
          <div className="qb-wrap">
            <div className="qb-head">
              <p className="qb-eyebrow">What&rsquo;s inside</p>
              <h2 className="qb-h2">Built around how a busy counter actually works.</h2>
            </div>
            <ul className="qb-features">
              {FEATURES.map((f) => (
                <li key={f.title}>
                  <Icon name={f.icon} size={28} />
                  <div>
                    <h3>{f.title}</h3>
                    <p>{f.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* SALES HISTORY */}
        <section className="qb-sec" id="history">
          <div className="qb-wrap qb-split">
            <div>
              <p className="qb-eyebrow">Know your day</p>
              <h2 className="qb-h2">At closing time, you already know what you sold.</h2>
              <p className="qb-sub">
                Every bill goes into your history. See the day&rsquo;s total, how many bills you made, and the average
                bill, without opening a notebook.
              </p>
              <ul className="qb-ticks">
                <li>
                  <Icon name="check" size={20} /> Total sales, bill count and average bill
                </li>
                <li>
                  <Icon name="check" size={20} /> Filter by Cash, UPI, Card or Split
                </li>
                <li>
                  <Icon name="check" size={20} /> Search by invoice number or customer
                </li>
                <li>
                  <Icon name="check" size={20} /> Reprint any bill in one tap
                </li>
              </ul>
            </div>
            <figure className="qb-device">
              <img
                src="/mockups/history.png"
                width={1024}
                height={541}
                loading="lazy"
                alt="QuickBill POS sales history showing total revenue, bill count, average bill and a list of invoices with a reprint button"
              />
            </figure>
          </div>
        </section>

        {/* PRINTERS */}
        <section className="qb-sec qb-sec--alt" id="printers">
          <div className="qb-wrap qb-split qb-split--flip">
            <div className="qb-printers__visual">
              <Receipt />
            </div>
            <div>
              <p className="qb-eyebrow">Printing</p>
              <h2 className="qb-h2">Use the Bluetooth printer you already own.</h2>
              <p className="qb-sub">
                QuickBill POS speaks standard ESC/POS, the language most thermal printers understand, so pairing takes
                a minute and there is nothing to install.
              </p>
              <dl className="qb-specs">
                <div>
                  <dt>Paper</dt>
                  <dd>58 mm (2-inch) and 80 mm (3-inch) rolls</dd>
                </div>
                <div>
                  <dt>Connection</dt>
                  <dd>Bluetooth or USB</dd>
                </div>
                <div>
                  <dt>Protocol</dt>
                  <dd>ESC/POS, no drivers needed</dd>
                </div>
                <div>
                  <dt>Good for</dt>
                  <dd>Counters, home delivery and van sales</dd>
                </div>
              </dl>
              <p className="qb-printers__aside">
                Don&rsquo;t have a printer yet? The <a href="#pricing">annual kit</a> includes one.
              </p>
            </div>
          </div>
        </section>

        <PricingSection />

        <DownloadSection release={latest} loaded={loaded} olderReleases={allReleases.slice(1)} />

        {/* FAQ */}
        <section className="qb-sec" id="faq">
          <div className="qb-wrap qb-faq">
            <div className="qb-head">
              <p className="qb-eyebrow">Questions</p>
              <h2 className="qb-h2">Things shop owners ask before they start.</h2>
              <p className="qb-sub">
                Still unsure? Message us on WhatsApp and a real person will answer.
              </p>
              <a
                className="qb-btn qb-btn--wa"
                href={waLink("Hi QuickBill POS team, I have a question.")}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name="chat" />
                <span>Ask on WhatsApp</span>
              </a>
            </div>
            <div className="qb-faq__list">
              {FAQS.map((f) => (
                <details key={f.q} name="faq">
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="qb-final" id="final-cta">
          <div className="qb-wrap qb-final__in">
            <div>
              <h2>Try it at your counter today.</h2>
              <p>Install it, make one bill, print it. You&rsquo;ll know in five minutes whether it fits your shop.</p>
            </div>
            <div className="qb-cta-row">
              <a className="qb-btn qb-btn--paper qb-btn--lg" {...ctaProps}>
                <Icon name="download" />
                <span className="qb-btn__text">
                  <span className="qb-btn__main">{ctaMain}</span>
                  <span className="qb-btn__sub">{ctaSub}</span>
                </span>
              </a>
              <a
                className="qb-btn qb-btn--ghost-light qb-btn--lg"
                href={waLink("Hi QuickBill POS team, I'd like to see how it works for my shop.")}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name="chat" />
                <span>WhatsApp us</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
      <WhatsAppFloat hideOnMobile />

      {/* Mobile bar: appears once the hero button has scrolled away */}
      <div className={`qb-bar ${showBar ? "is-on" : ""}`}>
        <a className="qb-btn qb-btn--primary" {...ctaProps}>
          <Icon name="download" />
          <span>{isAndroid && latest ? `Download · ${latest.sizeLabel}` : "Get the Android app"}</span>
        </a>
        <a
          className="qb-btn qb-btn--wa qb-btn--icon"
          href={waLink("Hi QuickBill POS team, I have a question.")}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
        >
          <Icon name="chat" />
        </a>
      </div>
    </div>
  );
}
