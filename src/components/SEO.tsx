import { useEffect } from "react";

const PRODUCTION_SITE_ORIGIN = "https://www.quickbillpos.in";

interface SEOProps {
  title: string;
  description: string;
  canonicalPath: string;
  keywords?: string[];
  type?: "website" | "article";
  image?: string;
  schemaData?: Record<string, any> | Array<Record<string, any>>;
}

export default function SEO({
  title,
  description,
  canonicalPath,
  keywords = [],
  type = "website",
  image = "/logo.svg",
  schemaData,
}: SEOProps) {
  useEffect(() => {
    // 1. Page Title
    document.title = title;

    // Helper to update or create a meta tag
    const setMeta = (attrName: "name" | "property", attrVal: string, contentVal: string) => {
      let el = document.querySelector(`meta[${attrName}="${attrVal}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attrName, attrVal);
        document.head.appendChild(el);
      }
      el.setAttribute("content", contentVal);
    };

    // 2. Standard Meta Tags
    setMeta("name", "description", description);
    setMeta("name", "robots", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
    if (keywords.length > 0) {
      setMeta("name", "keywords", keywords.join(", "));
    }

    // 3. Canonical URL (Production origin preferred for stable search indexation)
    const normalizedPath = canonicalPath.startsWith("/") ? canonicalPath : `/${canonicalPath}`;
    const fullCanonical = `${PRODUCTION_SITE_ORIGIN}${normalizedPath === "/" ? "" : normalizedPath}`;
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", fullCanonical);

    // 4. Open Graph Tags
    const fullImageUrl = image.startsWith("http") ? image : `${PRODUCTION_SITE_ORIGIN}${image}`;
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", fullCanonical);
    setMeta("property", "og:type", type);
    setMeta("property", "og:site_name", "QuickBill POS");
    setMeta("property", "og:locale", "en_IN");
    setMeta("property", "og:image", fullImageUrl);
    setMeta("property", "og:image:alt", "QuickBill POS India — Offline Point of Sale Software");

    // 5. Twitter Card Tags
    setMeta("name", "twitter:card", "summary");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", fullImageUrl);
    setMeta("name", "twitter:image:alt", "QuickBill POS Logo");

    // 6. JSON-LD Structured Data Schema for Googlebot / Search Crawlers
    let scriptTag = document.getElementById("seo-schema-jsonld") as HTMLScriptElement | null;
    if (schemaData) {
      if (!scriptTag) {
        scriptTag = document.createElement("script");
        scriptTag.id = "seo-schema-jsonld";
        scriptTag.type = "application/ld+json";
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(schemaData);
    } else if (scriptTag) {
      scriptTag.remove();
    }

    return () => {
      // Clean up JSON-LD on unmount
      const existingScript = document.getElementById("seo-schema-jsonld");
      if (existingScript) existingScript.remove();
    };
  }, [title, description, canonicalPath, keywords, type, image, schemaData]);

  return null;
}
