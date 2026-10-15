import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { fetchReleases, type Release } from "../api";
import SEO from "../components/SEO";
import SiteHeader from "../components/SiteHeader";
import SiteFooter, { WhatsAppFloat } from "../components/SiteFooter";
import Icon from "../components/Icon";
import Receipt from "../components/Receipt";
import PricingSection from "../components/PricingSection";
import DownloadSection from "../components/DownloadSection";
import { waLink } from "../lib/contact";
import { LANGS, homePath, langInfo, pagePath, type LangCode } from "../i18n/config";
import { I18nProvider, fmt, useI18n } from "../i18n/context";
import { guidesFor } from "../seo/guides";
import { homeGraph } from "../seo/schema";

const FEATURE_ICONS = ["keypad", "offline", "receipt", "qr", "hold", "printer"] as const;

function useIsAndroid() {
  const [isAndroid, setIsAndroid] = useState(false);
  useEffect(() => {
    setIsAndroid(/android/i.test(navigator.userAgent));
  }, []);
  return isAndroid;
}

function HomeContent() {
  const { lang, t } = useI18n();
  const location = useLocation();
  const isAndroid = useIsAndroid();
  const [latest, setLatest] = useState<Release | null>(null);
  const [allReleases, setAllReleases] = useState<Release[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showBar, setShowBar] = useState(false);
  const info = langInfo(lang);
  const guides = guidesFor(lang);

  useEffect(() => {
    // The page is already painted from prerendered HTML. Fetch the release list when the browser is idle
    // so the GitHub requests never compete with fonts, images or scripts.
    const load = () =>
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

    const hasIdle = "requestIdleCallback" in window;
    const handle = hasIdle ? window.requestIdleCallback(load, { timeout: 2000 }) : window.setTimeout(load, 800);

    function handleUpdate(e: Event) {
      const detail = (e as CustomEvent<Release[]>).detail;
      if (Array.isArray(detail) && detail.length > 0) {
        setLatest(detail[0]);
        setAllReleases(detail);
      }
    }
    window.addEventListener("qb:releases_updated", handleUpdate);
    return () => {
      window.removeEventListener("qb:releases_updated", handleUpdate);
      if (hasIdle) window.cancelIdleCallback(handle);
      else window.clearTimeout(handle);
    };
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
  const ctaMain = isAndroid ? t.hero.ctaDownload : t.hero.ctaGet;
  const ctaSub = latest ? `${latest.version} · ${latest.sizeLabel}` : t.hero.ctaFallback;

  const ctaProps =
    direct && latest
      ? { href: latest.downloadUrl, target: "_blank", rel: "noopener noreferrer" }
      : { href: "#download" };

  const alternates = Object.fromEntries(LANGS.map((l) => [l.code, homePath(l.code)]));

  return (
    <div className="qb" lang={info.htmlLang} data-indic={lang !== "en" ? "" : undefined}>
      <SEO
        title={t.meta.title}
        description={t.meta.description}
        canonicalPath={homePath(lang)}
        lang={lang}
        alternates={alternates}
        schemaData={homeGraph(t.faq.items, t.how.steps, t.meta.title, t.meta.description, lang, t.how.h2)}
      />
      <SiteHeader />

      <main id="main-content">
        {/* HERO */}
        <section className="qb-hero">
          <div className="qb-wrap qb-hero__grid">
            <div className="qb-hero__copy">
              <p className="qb-eyebrow">{t.hero.eyebrow}</p>
              <h1>
                {t.hero.before}
                <span className="qb-ul">
                  {t.hero.em}
                  <svg viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M2 8 C 38 2, 72 11, 108 5 S 172 3, 198 7" pathLength="1" />
                  </svg>
                </span>
                {t.hero.after}
              </h1>
              <p className="qb-lede">{t.hero.lede}</p>
              {t.hero.altLine && (
                <p className="qb-hi" lang={lang === "en" ? "hi" : undefined}>
                  {t.hero.altLine}
                </p>
              )}

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
                    <span className="qb-btn__main">{t.hero.waMain}</span>
                    <span className="qb-btn__sub">{t.hero.waSub}</span>
                  </span>
                </a>
              </div>

              <ul className="qb-micro">
                {t.hero.micro.map((m) => (
                  <li key={m}>
                    <Icon name="check" size={18} /> {m}
                  </li>
                ))}
              </ul>
            </div>

            <div className="qb-stage">
              <figure className="qb-device qb-device--tilt">
                <img
                  src="/mockups/mobile-pos.webp"
                  width={1024}
                  height={550}
                  alt={t.hero.deviceAlt}
                  decoding="async"
                  {...({ fetchpriority: "high" } as Record<string, string>)}
                />
              </figure>
              <div className="qb-stage__receipt">
                <Receipt tilt />
              </div>
            </div>
          </div>
        </section>

        {/* FACTS */}
        <section className="qb-facts" aria-label={t.facts.aria}>
          <div className="qb-wrap qb-facts__grid">
            {t.facts.items.map((f) => (
              <div key={f.title}>
                <strong>{f.title}</strong>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="qb-sec" id="how">
          <div className="qb-wrap">
            <div className="qb-head">
              <p className="qb-eyebrow">{t.how.eyebrow}</p>
              <h2 className="qb-h2">{t.how.h2}</h2>
              <p className="qb-sub">{t.how.sub}</p>
            </div>
            <ol className="qb-steps">
              {t.how.steps.map((s, i) => (
                <li key={s.name}>
                  <span className="qb-steps__n" aria-hidden="true">
                    {i + 1}
                  </span>
                  <h3>{s.name}</h3>
                  <p>{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* FEATURES */}
        <section className="qb-sec qb-sec--alt" id="features">
          <div className="qb-wrap">
            <div className="qb-head">
              <p className="qb-eyebrow">{t.features.eyebrow}</p>
              <h2 className="qb-h2">{t.features.h2}</h2>
            </div>
            <ul className="qb-features">
              {t.features.items.map((f, i) => (
                <li key={f.title}>
                  <Icon name={FEATURE_ICONS[i]} size={28} />
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
              <p className="qb-eyebrow">{t.history.eyebrow}</p>
              <h2 className="qb-h2">{t.history.h2}</h2>
              <p className="qb-sub">{t.history.sub}</p>
              <ul className="qb-ticks">
                {t.history.ticks.map((tick) => (
                  <li key={tick}>
                    <Icon name="check" size={20} /> {tick}
                  </li>
                ))}
              </ul>
            </div>
            <figure className="qb-device">
              <img
                src="/mockups/history.webp"
                width={1024}
                height={541}
                loading="lazy"
                decoding="async"
                alt={t.history.alt}
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
              <p className="qb-eyebrow">{t.printers.eyebrow}</p>
              <h2 className="qb-h2">{t.printers.h2}</h2>
              <p className="qb-sub">{t.printers.sub}</p>
              <dl className="qb-specs">
                {t.printers.specs.map((s) => (
                  <div key={s.k}>
                    <dt>{s.k}</dt>
                    <dd>{s.v}</dd>
                  </div>
                ))}
              </dl>
              <p className="qb-printers__aside">
                {t.printers.asidePre}
                <a href="#pricing">{t.printers.asideLink}</a>
                {t.printers.asidePost}
              </p>
            </div>
          </div>
        </section>

        <PricingSection />

        <DownloadSection release={latest} loaded={loaded} olderReleases={allReleases.slice(1)} />

        {/* GUIDES (only for languages that have guide pages) */}
        {guides.length > 0 && (
          <section className="qb-sec qb-sec--alt" id="guides">
            <div className="qb-wrap">
              <div className="qb-head">
                <p className="qb-eyebrow">{t.guides.eyebrow}</p>
                <h2 className="qb-h2">{t.guides.h2}</h2>
                <p className="qb-sub">{t.guides.sub}</p>
              </div>
              <ul className="qb-cards">
                {guides.map((p) => (
                  <li key={p.slug}>
                    <Link to={pagePath(lang, p.slug)}>
                      <strong>{p.navTitle}</strong>
                      <span>{p.cardBlurb}</span>
                      <Icon name="arrow" size={20} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* FAQ */}
        <section className="qb-sec" id="faq">
          <div className="qb-wrap qb-faq">
            <div className="qb-head">
              <p className="qb-eyebrow">{t.faq.eyebrow}</p>
              <h2 className="qb-h2">{t.faq.h2}</h2>
              <p className="qb-sub">{t.faq.sub}</p>
              <a
                className="qb-btn qb-btn--wa"
                href={waLink("Hi QuickBill POS team, I have a question.")}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name="chat" />
                <span>{t.faq.ask}</span>
              </a>
            </div>
            <div className="qb-faq__list">
              {t.faq.items.map((f) => (
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
              <h2>{t.final.h2}</h2>
              <p>{t.final.p}</p>
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
                <span>{t.final.wa}</span>
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
          <span>{isAndroid && latest ? fmt(t.bar.download, { size: latest.sizeLabel }) : t.bar.get}</span>
        </a>
        <a
          className="qb-btn qb-btn--wa qb-btn--icon"
          href={waLink("Hi QuickBill POS team, I have a question.")}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t.bar.waAria}
        >
          <Icon name="chat" />
        </a>
      </div>
    </div>
  );
}

export default function Home({ lang = "en" }: { lang?: LangCode }) {
  return (
    <I18nProvider lang={lang}>
      <HomeContent />
    </I18nProvider>
  );
}
