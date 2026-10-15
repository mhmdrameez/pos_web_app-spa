import { Link } from "react-router-dom";
import Icon from "./Icon";
import { WA_DISPLAY, waLink } from "../lib/contact";
import { LANGS, homePath, pagePath } from "../i18n/config";
import { altPath, useI18n } from "../i18n/context";
import { guidesFor } from "../seo/guides";

export function WhatsAppFloat({ hideOnMobile = false }: { hideOnMobile?: boolean }) {
  const { t } = useI18n();
  return (
    <a
      className={`qb-wa ${hideOnMobile ? "qb-wa--desktop" : ""}`}
      href={waLink("Hi QuickBill POS team, I have a question.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${t.bar.waAria} ${WA_DISPLAY}`}
    >
      <Icon name="chat" size={22} />
      <span>{t.final.wa}</span>
    </a>
  );
}

export default function SiteFooter() {
  const { lang, t, alternates } = useI18n();
  const home = homePath(lang);
  const guides = guidesFor(lang);

  return (
    <footer className="qb-footer">
      <div className="qb-wrap">
        <div className="qb-footer__grid">
          <div className="qb-footer__about">
            <Link className="qb-brand qb-brand--light" to={home}>
              <img src="/logo.svg" width={34} height={34} alt="" />
              <span>QuickBill POS</span>
            </Link>
            <p>{t.footer.about}</p>
          </div>

          <nav aria-label={t.footer.product}>
            <h2>{t.footer.product}</h2>
            <ul>
              <li>
                <Link to={{ pathname: home, hash: "#how" }}>{t.nav.how}</Link>
              </li>
              <li>
                <Link to={{ pathname: home, hash: "#features" }}>{t.nav.features}</Link>
              </li>
              <li>
                <Link to={{ pathname: home, hash: "#pricing" }}>{t.nav.pricing}</Link>
              </li>
              <li>
                <Link to={{ pathname: home, hash: "#download" }}>{t.nav.download}</Link>
              </li>
            </ul>
          </nav>

          {guides.length > 0 && (
            <nav aria-label={t.footer.guides}>
              <h2>{t.footer.guides}</h2>
              <ul>
                {guides.map((p) => (
                  <li key={p.slug}>
                    <Link to={pagePath(lang, p.slug)}>{p.navTitle}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          <nav aria-label={t.footer.help}>
            <h2>{t.footer.help}</h2>
            <ul>
              <li>
                <a href={waLink("Hi QuickBill POS team, I need help.")} target="_blank" rel="noopener noreferrer">
                  {t.footer.whatsapp} {WA_DISPLAY}
                </a>
              </li>
              <li>
                <Link to={{ pathname: home, hash: "#faq" }}>{t.footer.qa}</Link>
              </li>
            </ul>
          </nav>

          <nav aria-label={t.footer.legal}>
            <h2>{t.footer.legal}</h2>
            <ul>
              <li>
                <Link to="/privacy-policy">{t.nav.privacy}</Link>
              </li>
              <li>
                <Link to="/terms-and-conditions">{t.nav.terms}</Link>
              </li>
            </ul>
          </nav>
        </div>

        <nav className="qb-footer__langs" aria-label={t.footer.languages}>
          <h2>{t.footer.languages}</h2>
          <ul>
            {LANGS.map((l) => (
              <li key={l.code}>
                <a href={altPath(alternates, l.code)} hrefLang={l.htmlLang} lang={l.htmlLang}>
                  {l.native}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="qb-footer__bar">
          <span>
            © {new Date().getFullYear()} QuickBill POS. {t.footer.built}
          </span>
          <Link to="/apk-upload">{t.footer.admin}</Link>
        </div>
      </div>
    </footer>
  );
}
