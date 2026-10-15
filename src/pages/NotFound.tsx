import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import Icon from "../components/Icon";
import { LANDING_PAGES } from "../seo/pages";

export default function NotFound() {
  return (
    <div className="qb">
      <SEO
        title="Page not found | QuickBill POS"
        description="This page does not exist. Go back to the QuickBill POS home page."
        canonicalPath="/"
        noindex
      />
      <SiteHeader />
      <main id="main-content" className="qb-sec">
        <div className="qb-wrap qb-404">
          <p className="qb-eyebrow">Error 404</p>
          <h1>This page doesn&rsquo;t exist.</h1>
          <p className="qb-lede">The link may be old or mistyped. Here are some places to start.</p>
          <div className="qb-cta-row">
            <Link className="qb-btn qb-btn--primary qb-btn--lg" to="/">
              <Icon name="arrow" />
              <span>Go to the home page</span>
            </Link>
          </div>
          <ul className="qb-cards qb-cards--404">
            {LANDING_PAGES.map((p) => (
              <li key={p.slug}>
                <Link to={`/${p.slug}`}>
                  <strong>{p.navTitle}</strong>
                  <span>{p.cardBlurb}</span>
                  <Icon name="arrow" size={20} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
