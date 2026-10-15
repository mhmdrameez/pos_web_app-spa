import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import App from "./App";
import { renderHeadHtml, type SeoProps } from "./seo/head";
import { HOME_FAQS, HOME_STEPS, HOME_FEATURE_LIST } from "./seo/content";
import { LANDING_PAGES } from "./seo/pages";
import { PRICES, SITE } from "./seo/site";

export { renderHeadHtml, HOME_FAQS, HOME_STEPS, HOME_FEATURE_LIST, LANDING_PAGES, PRICES, SITE };

/** Pages that get a static HTML file, with sitemap priority. */
export const ROUTES: Array<{ path: string; priority: number }> = [
  { path: "/", priority: 1.0 },
  ...LANDING_PAGES.map((p) => ({ path: `/${p.slug}`, priority: 0.9 })),
  { path: "/privacy-policy", priority: 0.4 },
  { path: "/terms-and-conditions", priority: 0.4 },
];

export function render(url: string): { html: string; seo: SeoProps | null } {
  const g = globalThis as { __QB_SEO__?: SeoProps | null };
  g.__QB_SEO__ = null;
  const html = renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>
  );
  return { html, seo: g.__QB_SEO__ ?? null };
}
