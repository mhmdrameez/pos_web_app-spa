import { useEffect } from "react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import SiteHeader from "../components/SiteHeader";
import SiteFooter, { WhatsAppFloat } from "../components/SiteFooter";
import Icon from "../components/Icon";
import { getLandingPage, type LandingPageData } from "../seo/pages";
import { landingGraph } from "../seo/schema";
import { PRICES } from "../seo/site";
import { waLink } from "../lib/contact";

export default function LandingPage({ page }: { page: LandingPageData }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page.slug]);

  const related = page.related
    .map((slug) => getLandingPage(slug))
    .filter((p): p is LandingPageData => Boolean(p));

  const download = { pathname: "/", hash: "#download" };

  return (
    <div className="qb">
      <SEO
        title={page.seoTitle}
        description={page.description}
        canonicalPath={`/${page.slug}`}
        schemaData={landingGraph(page)}
      />
      <SiteHeader />

      <main id="main-content">
        <section className="qb-lhero">
          <div className="qb-wrap">
            <nav className="qb-crumbs" aria-label="Breadcrumb">
              <ol>
                <li>
                  <Link to="/">Home</Link>
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
                  <span className="qb-btn__main">Get the Android app</span>
                  <span className="qb-btn__sub">From ₹{PRICES.monthly} a month</span>
                </span>
              </Link>
              <a
                className="qb-btn qb-btn--ghost qb-btn--lg"
                href={waLink(`Hi QuickBill POS team, I have a question about: ${page.navTitle}.`)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name="chat" />
                <span className="qb-btn__text">
                  <span className="qb-btn__main">Ask on WhatsApp</span>
                  <span className="qb-btn__sub">Chat with a real person</span>
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
              <h2>Questions</h2>
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

          <aside className="qb-guide__side" aria-label="Get QuickBill POS">
            <div className="qb-sidecard">
              <p className="qb-sidecard__title">QuickBill POS</p>
              <p className="qb-sidecard__price">
                ₹{PRICES.monthly}
                <small> a month</small>
              </p>
              <p className="qb-sidecard__sub">or ₹{PRICES.yearly} a year. Unlimited bills.</p>
              <ul>
                <li>
                  <Icon name="check" size={18} /> Works offline
                </li>
                <li>
                  <Icon name="check" size={18} /> GST bills, UPI QR
                </li>
                <li>
                  <Icon name="check" size={18} /> 58 mm and 80 mm printing
                </li>
              </ul>
              <Link className="qb-btn qb-btn--primary qb-btn--block" to={download}>
                Get the Android app
              </Link>
              <Link className="qb-sidecard__link" to={{ pathname: "/", hash: "#pricing" }}>
                See all plans
              </Link>
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <section className="qb-sec qb-sec--alt">
            <div className="qb-wrap">
              <p className="qb-eyebrow">Keep reading</p>
              <h2 className="qb-h2">More about QuickBill POS</h2>
              <ul className="qb-cards">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link to={`/${r.slug}`}>
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
    </div>
  );
}
