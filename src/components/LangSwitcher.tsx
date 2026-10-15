import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import { LANGS, langInfo } from "../i18n/config";
import { altPath, useI18n } from "../i18n/context";

/** Plain links on purpose: each language is its own prerendered, crawlable URL. */
export default function LangSwitcher() {
  const { lang, t, alternates } = useI18n();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <div className="qb-lang" ref={box}>
      <button
        type="button"
        className="qb-lang__btn"
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls="qb-lang-menu"
        aria-label={`${t.nav.language}: ${langInfo(lang).english}`}
        onClick={() => setOpen((v) => !v)}
      >
        <Icon name="globe" size={18} />
        <span lang={langInfo(lang).htmlLang}>{langInfo(lang).native}</span>
      </button>
      {open && (
        <ul id="qb-lang-menu" className="qb-lang__menu">
          {LANGS.map((l) => (
            <li key={l.code}>
              <a
                href={altPath(alternates, l.code)}
                hrefLang={l.htmlLang}
                lang={l.htmlLang}
                aria-current={l.code === lang ? "true" : undefined}
              >
                {l.native}
                {l.code !== "en" && <small>{l.english}</small>}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
