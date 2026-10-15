import { Link } from "react-router-dom";
import Icon from "./Icon";
import { WA_DISPLAY, waLink } from "../lib/contact";
import { LANDING_PAGES } from "../seo/pages";

export function WhatsAppFloat({ hideOnMobile = false }: { hideOnMobile?: boolean }) {
  return (
    <a
      className={`qb-wa ${hideOnMobile ? "qb-wa--desktop" : ""}`}
      href={waLink("Hi QuickBill POS team, I have a question.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat on WhatsApp ${WA_DISPLAY}`}
    >
      <Icon name="chat" size={22} />
      <span>WhatsApp us</span>
    </a>
  );
}

export default function SiteFooter() {
  return (
    <footer className="qb-footer">
      <div className="qb-wrap">
        <div className="qb-footer__grid">
          <div className="qb-footer__about">
            <Link className="qb-brand qb-brand--light" to="/">
              <img src="/logo.svg" width={34} height={34} alt="" />
              <span>QuickBill POS</span>
            </Link>
            <p>
              A billing app for kirana stores, cafés, bakeries and sweet shops. Works without internet,
              prints GST bills and shows a UPI QR.
            </p>
          </div>

          <nav aria-label="Product">
            <h2>Product</h2>
            <ul>
              <li>
                <Link to={{ pathname: "/", hash: "#how" }}>How it works</Link>
              </li>
              <li>
                <Link to={{ pathname: "/", hash: "#features" }}>Features</Link>
              </li>
              <li>
                <Link to={{ pathname: "/", hash: "#pricing" }}>Pricing</Link>
              </li>
              <li>
                <Link to={{ pathname: "/", hash: "#download" }}>Download</Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Guides">
            <h2>Guides</h2>
            <ul>
              {LANDING_PAGES.map((p) => (
                <li key={p.slug}>
                  <Link to={`/${p.slug}`}>{p.navTitle}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Help">
            <h2>Help</h2>
            <ul>
              <li>
                <a href={waLink("Hi QuickBill POS team, I need help.")} target="_blank" rel="noopener noreferrer">
                  WhatsApp {WA_DISPLAY}
                </a>
              </li>
              <li>
                <Link to={{ pathname: "/", hash: "#faq" }}>Questions &amp; answers</Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Legal">
            <h2>Legal</h2>
            <ul>
              <li>
                <Link to="/privacy-policy">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms-and-conditions">Terms &amp; Conditions</Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="qb-footer__bar">
          <span>© {new Date().getFullYear()} QuickBill POS. Built for Indian shops.</span>
          <Link to="/apk-upload">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
