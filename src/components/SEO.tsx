import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  canonicalPath: string;
  keywords?: string[];
  type?: "website" | "article";
  schemaData?: Record<string, any>;
}

export default function SEO({
  title,
  description,
  canonicalPath,
  keywords = [],
  type = "website",
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
    setMeta("name", "robots", "index, follow, max-image-preview:large, max-snippet:-1");
    if (keywords.length > 0) {
      setMeta("name", "keywords", keywords.join(", "));
    }

    // 3. Canonical URL
    const fullCanonical = `${window.location.origin}${canonicalPath}`;
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", fullCanonical);

    // 4. Open Graph Tags (Facebook, LinkedIn, Social Previews)
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", fullCanonical);
    setMeta("property", "og:type", type);
    setMeta("property", "og:site_name", "QuickBill POS");

    // 5. Twitter Card Tags
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);

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
  }, [title, description, canonicalPath, keywords, type, schemaData]);

  return null;
}
