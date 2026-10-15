import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import App from "./App";
import { renderHeadHtml, type SeoProps } from "./seo/head";
import { HOME_FAQS, HOME_STEPS, HOME_FEATURE_LIST } from "./seo/content";
import { LANDING_PAGES } from "./seo/pages";
import { guideLangs, guidesFor } from "./seo/guides";
import { PRICES, SITE } from "./seo/site";
import { LANGS, NON_DEFAULT_LANGS, homePath, pagePath, type LangCode } from "./i18n/config";
import { getDict, registerDict } from "./i18n/registry";
import type { Dict } from "./i18n/types";

// Every language file is needed at build time (the browser loads only the one it needs).
const langModules = import.meta.glob<{ default: Dict }>("./i18n/lang/*.ts", { eager: true });
for (const [file, mod] of Object.entries(langModules)) {
  const code = file.match(/\/([a-z]{2})\.ts$/)?.[1] as LangCode | undefined;
  if (code) registerDict(code, mod.default);
}

export {
  renderHeadHtml,
  HOME_FAQS,
  HOME_STEPS,
  HOME_FEATURE_LIST,
  LANDING_PAGES,
  PRICES,
  SITE,
  LANGS,
  getDict,
  guideLangs,
  guidesFor,
  homePath,
  pagePath,
};

export type PrerenderRoute = {
  path: string;
  priority: number;
  /** Same page in other languages, for sitemap hreflang annotations. */
  alternates: Array<{ hreflang: string; path: string }>;
};

const homeAlternates = LANGS.map((l) => ({ hreflang: l.htmlLang, path: homePath(l.code) }));

/** Pages that get a static HTML file. */
export const ROUTES: PrerenderRoute[] = [
  { path: "/", priority: 1.0, alternates: homeAlternates },
  ...NON_DEFAULT_LANGS.map((l) => ({ path: homePath(l.code), priority: 0.9, alternates: homeAlternates })),
  ...guideLangs().flatMap((lang) =>
    guidesFor(lang).map((p) => ({
      path: pagePath(lang, p.slug),
      priority: lang === "en" ? 0.9 : 0.8,
      alternates: guideLangs().map((l) => ({
        hreflang: LANGS.find((x) => x.code === l)!.htmlLang,
        path: pagePath(l, p.slug),
      })),
    }))
  ),
  { path: "/privacy-policy", priority: 0.4, alternates: [] },
  { path: "/terms-and-conditions", priority: 0.4, alternates: [] },
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
