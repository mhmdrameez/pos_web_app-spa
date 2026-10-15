import { useEffect } from "react";
import { buildHeadModel, type SeoProps } from "../seo/head";

/**
 * Sets <head> tags on the client. During server-side prerendering it instead records
 * its props so the build script can write the same tags into the static HTML.
 */
export default function SEO(props: SeoProps) {
  if (typeof document === "undefined") {
    (globalThis as { __QB_SEO__?: SeoProps }).__QB_SEO__ = props;
  }

  const serialized = JSON.stringify(props);

  useEffect(() => {
    const p: SeoProps = JSON.parse(serialized);
    const model = buildHeadModel(p);
    document.title = model.title;

    for (const meta of model.metas) {
      const attr = meta.name ? "name" : "property";
      const key = (meta.name ?? meta.property) as string;
      let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", meta.content);
    }

    const wanted = new Set(model.links.map((l) => `${l.rel}|${l.hreflang ?? ""}`));
    document.head.querySelectorAll<HTMLLinkElement>('link[rel="canonical"], link[rel="alternate"][hreflang]').forEach((el) => {
      if (!wanted.has(`${el.rel}|${el.getAttribute("hreflang") ?? ""}`)) el.remove();
    });
    for (const link of model.links) {
      const selector = link.hreflang
        ? `link[rel="${link.rel}"][hreflang="${link.hreflang}"]`
        : `link[rel="${link.rel}"]:not([hreflang])`;
      let el = document.head.querySelector<HTMLLinkElement>(selector);
      if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", link.rel);
        if (link.hreflang) el.setAttribute("hreflang", link.hreflang);
        document.head.appendChild(el);
      }
      el.setAttribute("href", link.href);
    }

    let script = document.getElementById("seo-schema-jsonld") as HTMLScriptElement | null;
    if (model.jsonLd) {
      if (!script) {
        script = document.createElement("script");
        script.id = "seo-schema-jsonld";
        script.type = "application/ld+json";
        document.head.appendChild(script);
      }
      script.textContent = model.jsonLd;
    } else if (script) {
      script.remove();
    }
  }, [serialized]);

  return null;
}
