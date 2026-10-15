import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import LangSwitcher from "./LangSwitcher";
import { homePath } from "../i18n/config";
import { useI18n } from "../i18n/context";

export default function SiteHeader() {
  const { lang, t } = useI18n();
  const [open, setOpen] = useState(false);

  const links: Array<[string, string]> = [
    ["how", t.nav.how],
    ["features", t.nav.features],
    ["pricing", t.nav.pricing],
    ["faq", t.nav.faq],
  ];

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => setOpen(false);
  const home = homePath(lang);

  return (
    <header className="qb-nav">
      <a className="qb-skip" href="#main-content">
        {t.nav.skip}
      </a>
      <div className="qb-wrap qb-nav__in">
        <Link className="qb-brand" to={home} onClick={close} aria-label={t.nav.homeAria}>
          <img src="/logo.svg" width={34} height={34} alt="" />
          <span>QuickBill POS</span>
        </Link>

        <nav className="qb-nav__links" aria-label={t.nav.mainAria}>
          {links.map(([id, label]) => (
            <Link key={id} to={{ pathname: home, hash: `#${id}` }}>
              {label}
            </Link>
          ))}
        </nav>

        <div className="qb-nav__actions">
          <LangSwitcher />
          <Link
            className="qb-btn qb-btn--primary qb-btn--sm"
            to={{ pathname: home, hash: "#download" }}
            onClick={close}
          >
            <span>
              {t.nav.download}
              <span className="qb-hide-xs">{t.nav.downloadSuffix}</span>
            </span>
          </Link>
          <button
            type="button"
            className="qb-burger"
            aria-expanded={open}
            aria-controls="qb-drawer"
            aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {open && (
        <nav id="qb-drawer" className="qb-drawer" aria-label="Mobile">
          <div className="qb-wrap">
            {links.map(([id, label]) => (
              <Link key={id} to={{ pathname: home, hash: `#${id}` }} onClick={close}>
                {label}
              </Link>
            ))}
            <Link to="/privacy-policy" onClick={close}>
              {t.nav.privacy}
            </Link>
            <Link to="/terms-and-conditions" onClick={close}>
              {t.nav.terms}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
