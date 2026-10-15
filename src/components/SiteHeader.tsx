import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const LINKS: Array<[string, string]> = [
  ["how", "How it works"],
  ["features", "Features"],
  ["pricing", "Pricing"],
  ["faq", "FAQ"],
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className="qb-nav">
      <a className="qb-skip" href="#main-content">
        Skip to content
      </a>
      <div className="qb-wrap qb-nav__in">
        <Link className="qb-brand" to="/" onClick={close} aria-label="QuickBill POS home">
          <img src="/logo.svg" width={34} height={34} alt="" />
          <span>QuickBill POS</span>
        </Link>

        <nav className="qb-nav__links" aria-label="Main">
          {LINKS.map(([id, label]) => (
            <Link key={id} to={{ pathname: "/", hash: `#${id}` }}>
              {label}
            </Link>
          ))}
        </nav>

        <div className="qb-nav__actions">
          <Link
            className="qb-btn qb-btn--primary qb-btn--sm"
            to={{ pathname: "/", hash: "#download" }}
            onClick={close}
          >
            <span>
              Download<span className="qb-hide-xs"> app</span>
            </span>
          </Link>
          <button
            type="button"
            className="qb-burger"
            aria-expanded={open}
            aria-controls="qb-drawer"
            aria-label={open ? "Close menu" : "Open menu"}
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
            {LINKS.map(([id, label]) => (
              <Link key={id} to={{ pathname: "/", hash: `#${id}` }} onClick={close}>
                {label}
              </Link>
            ))}
            <Link to="/privacy-policy" onClick={close}>
              Privacy Policy
            </Link>
            <Link to="/terms-and-conditions" onClick={close}>
              Terms &amp; Conditions
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
