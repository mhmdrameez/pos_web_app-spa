import { useEffect } from "react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import SiteHeader from "../components/SiteHeader";
import SiteFooter, { WhatsAppFloat } from "../components/SiteFooter";
import Icon from "../components/Icon";
import type { LandingPageData } from "../seo/pages";
import { getGuide, guideLangs } from "../seo/guides";
import { landingGraph } from "../seo/schema";
import { PRICES } from "../seo/site";
import { waLink } from "../lib/contact";
import { LANGS, homePath, langInfo, pagePath, type LangCode } from "../i18n/config";
import { I18nProvider, fmt, useI18n } from "../i18n/context";

function GuideContent({ page }: { page: LandingPageData }) {
  const { lang, t } = useI18n();
  const g = t.guide;
  const info = langInfo(lang);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page.slug]);

  const related = page.related
    .map((slug) => getGuide(lang, slug))
    .filter((p): p is LandingPageData => Boolean(p));

  const download = { pathname: homePath(lang), hash: "#download" };

  const alternates = Object.fromEntries(
    LANGS.map((l) => [l.code, guideLangs().includes(l.code) ? pagePath(l.code, page.slug) : homePath(l.code)])
  ) as Partial<Record<LangCode, string>>;
  // Only advertise real equivalents to search engines (not the home-page fallbacks).
  const hreflangAlternates = Object.fromEntries(
    guideLangs().map((l) => [l, pagePath(l, page.slug)])
  ) as Partial<Record<LangCode, string>>;

  return (
    <div className="qb" lang={info.htmlLang} data-indic={lang !== "en" ? "" : undefined}>
      <SEO
        title={page.seoTitle}
        description={page.description}
        canonicalPath={pagePath(lang, page.slug)}
        lang={lang}
        alternates={hreflangAlternates}
        schemaData={landingGraph(page, lang, g.home)}
      />
      <I18nProvider lang={lang} alternates={alternates}>
        <SiteHeader />

        <main id="main-content">
          <section className="qb-lhero">
            <div className="qb-wrap">
              <nav className="qb-crumbs" aria-label="Breadcrumb">
                <ol>
                  <li>
                    <Link to={homePath(lang)}>{g.home}</Link>
                  </li>
                  <li aria-current="page">{page.navTitle}</li>
                </ol>
              </nav>
              <p className="qb-eyebrow">{page.kicker}</p>
              <h1>{page.h1}</h1>
              <p className="qb-lede">{page.lead}</p>
              <div className="qb-cta-row">
                <Link className="qb-btn qb-btn--primary qb-btn--lg" to={download}>
                  <Icon name="download" />
                  <span className="qb-btn__text">
                    <span className="qb-btn__main">{g.getApp}</span>
                    <span className="qb-btn__sub">{fmt(g.fromMonth, { price: PRICES.monthly })}</span>
                  </span>
                </Link>
                <a
                  className="qb-btn qb-btn--ghost qb-btn--lg"
                  href={waLink(`Hi QuickBill POS team, I have a question about: ${page.slug}.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon name="chat" />
                  <span className="qb-btn__text">
                    <span className="qb-btn__main">{g.askWa}</span>
                    <span className="qb-btn__sub">{g.chat}</span>
                  </span>
                </a>
              </div>
            </div>
          </section>

          <div className="qb-wrap qb-guide">
            <article className="qb-prose">
              {page.sections.map((s) => (
                <section key={s.h2} className="qb-sect">
                  <h2>{s.h2}</h2>
                  {s.body?.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                  {s.bullets && (
                    <ul>
                      {s.bullets.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}

              {page.howTo && (
                <section className="qb-sect">
                  <h2>{page.howTo.name}</h2>
                  <ol className="qb-howto">
                    {page.howTo.steps.map((st, i) => (
                      <li key={st.name}>
                        <span aria-hidden="true">{i + 1}</span>
                        <div>
                          <strong>{st.name}</strong>
                          <p>{st.text}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>
              )}

              <section className="qb-sect">
                <h2>{g.questions}</h2>
                <div className="qb-faq__list">
                  {page.faqs.map((f) => (
                    <details key={f.q} name="guide-faq">
                      <summary>{f.q}</summary>
                      <p>{f.a}</p>
                    </details>
                  ))}
                </div>
              </section>
            </article>

            <aside className="qb-guide__side" aria-label={g.sideAria}>
              <div className="qb-sidecard">
                <p className="qb-sidecard__title">QuickBill POS</p>
                <p className="qb-sidecard__price">
                  ₹{PRICES.monthly}
                  <small> {g.perMonth}</small>
                </p>
                <p className="qb-sidecard__sub">{fmt(g.orYear, { price: PRICES.yearly })}</p>
                <ul>
                  <li>
                    <Icon name="check" size={18} /> {g.works}
                  </li>
                  <li>
                    <Icon name="check" size={18} /> {g.gstQr}
                  </li>
                  <li>
                    <Icon name="check" size={18} /> {g.print}
                  </li>
                </ul>
                <Link className="qb-btn qb-btn--primary qb-btn--block" to={download}>
                  {g.getApp}
                </Link>
                <Link className="qb-sidecard__link" to={{ pathname: homePath(lang), hash: "#pricing" }}>
                  {g.seePlans}
                </Link>
              </div>
            </aside>
          </div>

          {related.length > 0 && (
            <section className="qb-sec qb-sec--alt">
              <div className="qb-wrap">
                <p className="qb-eyebrow">{g.keepReading}</p>
                <h2 className="qb-h2">{g.more}</h2>
                <ul className="qb-cards">
                  {related.map((r) => (
                    <li key={r.slug}>
                      <Link to={pagePath(lang, r.slug)}>
                        <strong>{r.navTitle}</strong>
                        <span>{r.cardBlurb}</span>
                        <Icon name="arrow" size={20} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}
        </main>

        <SiteFooter />
        <WhatsAppFloat />
      </I18nProvider>
    </div>
  );
}

export default function LandingPage({ page, lang = "en" }: { page: LandingPageData; lang?: LangCode }) {
  return (
    <I18nProvider lang={lang}>
      <GuideContent page={page} />
    </I18nProvider>
  );
}
