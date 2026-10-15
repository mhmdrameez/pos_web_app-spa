import { SITE, absoluteUrl } from "./site";
import { DEFAULT_LANG, langInfo, LANGS, type LangCode } from "../i18n/config";

export type SeoProps = {
  title: string;
  description: string;
  canonicalPath: string;
  type?: "website" | "article";
  image?: string;
  imageAlt?: string;
  noindex?: boolean;
  schemaData?: unknown;
  /** Page language. Defaults to English (India). */
  lang?: LangCode;
  /** Equivalent pages in other languages (path per language), emitted as hreflang links. */
  alternates?: Partial<Record<LangCode, string>>;
};

type MetaTag = { name?: string; property?: string; content: string };
type LinkTag = { rel: string; href: string; hreflang?: string };

export type HeadModel = {
  title: string;
  htmlLang: string;
  metas: MetaTag[];
  links: LinkTag[];
  jsonLd?: string;
};

const ROBOTS_INDEX = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
const ROBOTS_NOINDEX = "noindex, nofollow";

export function buildHeadModel(p: SeoProps): HeadModel {
  const lang = p.lang ?? DEFAULT_LANG;
  const info = langInfo(lang);
  const canonical = absoluteUrl(p.canonicalPath);
  const image = absoluteUrl(p.image ?? SITE.ogImage);
  const imageAlt = p.imageAlt ?? SITE.ogImageAlt;
  const isDefaultImage = !p.image;

  const metas: MetaTag[] = [
    { name: "description", content: p.description },
    { name: "robots", content: p.noindex ? ROBOTS_NOINDEX : ROBOTS_INDEX },
    { property: "og:site_name", content: SITE.name },
    { property: "og:locale", content: info.ogLocale },
    { property: "og:type", content: p.type ?? "website" },
    { property: "og:url", content: canonical },
    { property: "og:title", content: p.title },
    { property: "og:description", content: p.description },
    { property: "og:image", content: image },
    { property: "og:image:alt", content: imageAlt },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: p.title },
    { name: "twitter:description", content: p.description },
    { name: "twitter:image", content: image },
    { name: "twitter:image:alt", content: imageAlt },
  ];

  if (isDefaultImage) {
    metas.push(
      { property: "og:image:type", content: "image/png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" }
    );
  }

  const links: LinkTag[] = [];
  if (!p.noindex) {
    links.push({ rel: "canonical", href: canonical });
    if (p.alternates && Object.keys(p.alternates).length > 0) {
      for (const l of LANGS) {
        const path = p.alternates[l.code];
        if (path) links.push({ rel: "alternate", href: absoluteUrl(path), hreflang: l.htmlLang });
      }
      const xDefault = p.alternates[DEFAULT_LANG] ?? p.canonicalPath;
      links.push({ rel: "alternate", href: absoluteUrl(xDefault), hreflang: "x-default" });
    } else {
      links.push(
        { rel: "alternate", href: canonical, hreflang: info.htmlLang },
        { rel: "alternate", href: canonical, hreflang: "x-default" }
      );
    }
  }

  return {
    title: p.title,
    htmlLang: info.htmlLang,
    metas,
    links,
    jsonLd: p.schemaData ? JSON.stringify(p.schemaData) : undefined,
  };
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Server-side: the exact tags the client SEO component would create. */
export function renderHeadHtml(p: SeoProps): { title: string; htmlLang: string; tags: string } {
  const m = buildHeadModel(p);
  const parts: string[] = [];
  for (const meta of m.metas) {
    const key = meta.name ? `name="${esc(meta.name)}"` : `property="${esc(meta.property ?? "")}"`;
    parts.push(`<meta ${key} content="${esc(meta.content)}" />`);
  }
  for (const link of m.links) {
    const hl = link.hreflang ? ` hreflang="${esc(link.hreflang)}"` : "";
    parts.push(`<link rel="${esc(link.rel)}"${hl} href="${esc(link.href)}" />`);
  }
  if (m.jsonLd) {
    const safe = m.jsonLd.replace(/</g, "\\u003c");
    parts.push(`<script type="application/ld+json" id="seo-schema-jsonld">${safe}</script>`);
  }
  return { title: m.title, htmlLang: m.htmlLang, tags: parts.join("\n    ") };
}
