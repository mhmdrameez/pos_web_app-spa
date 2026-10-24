import { PRICES, SITE, absoluteUrl } from "./site";
import type { Faq, Step } from "./content";
import { HOME_FEATURE_LIST } from "./content";
import type { LandingPageData } from "./pages";
import { homePath, langInfo, pagePath, type LangCode } from "../i18n/config";

const id = (hash: string) => `${SITE.origin}/#${hash}`;
const ORG = { "@id": id("organization") };
const WEBSITE = { "@id": id("website") };
const APP = { "@id": id("app") };

const organization = () => ({
  "@type": "Organization",
  "@id": id("organization"),
  name: SITE.name,
  url: `${SITE.origin}/`,
  logo: {
    "@type": "ImageObject",
    url: absoluteUrl("/icon-512.png"),
    width: 512,
    height: 512,
  },
  image: absoluteUrl(SITE.ogImage),
  areaServed: { "@type": "Country", name: "India" },
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "customer support",
      telephone: SITE.phone,
      url: SITE.whatsapp,
      areaServed: "IN",
      availableLanguage: ["English", "Hindi"],
    },
  ],
});

const website = () => ({
  "@type": "WebSite",
  "@id": id("website"),
  url: `${SITE.origin}/`,
  name: SITE.name,
  inLanguage: SITE.lang,
  publisher: ORG,
});

const app = () => ({
  "@type": ["MobileApplication", "SoftwareApplication"],
  "@id": id("app"),
  name: SITE.name,
  alternateName: ["QuickBill POS app", "QuickBillPoss"],
  description:
    "Offline billing app for Indian shops. Makes GST bills with CGST and SGST, shows and prints a UPI QR, and prints to Bluetooth thermal printers on 58 mm and 80 mm paper. Works without internet on Android phones, tablets and POS handhelds.",
  url: `${SITE.origin}/`,
  applicationCategory: "BusinessApplication",
  applicationSubCategory: "Point of sale and billing",
  operatingSystem: "Android 7.0 and above",
  inLanguage: "en-IN",
  countriesSupported: "IN",
  image: absoluteUrl(SITE.ogImage),
  screenshot: [absoluteUrl("/mockups/mobile-pos.webp"), absoluteUrl("/mockups/history.webp")],
  featureList: HOME_FEATURE_LIST,
  publisher: ORG,
  offers: [
    {
      "@type": "Offer",
      name: "Monthly license",
      price: String(PRICES.monthly),
      priceCurrency: "INR",
      description: "Unlimited bills, billed monthly.",
      url: `${SITE.origin}/#pricing`,
      availability: "https://schema.org/InStock",
    },
    {
      "@type": "Offer",
      name: "Yearly license",
      price: String(PRICES.yearly),
      priceCurrency: "INR",
      description: "Unlimited bills, billed yearly.",
      url: `${SITE.origin}/#pricing`,
      availability: "https://schema.org/InStock",
    },
    {
      "@type": "Offer",
      name: "Printer + 1 year",
      price: String(PRICES.starter),
      priceCurrency: "INR",
      description: "A 58mm thermal printer and one year of QuickBill POS with all features and priority support.",
      url: `${SITE.origin}/#pricing`,
      availability: "https://schema.org/InStock",
    },
  ],
});

const kitProduct = () => ({
  "@type": "Product",
  "@id": id("kit"),
  name: "QuickBill POS Annual Kit",
  description:
    "A wireless Bluetooth thermal printer, one year of QuickBill POS and five paper rolls, delivered across India.",
  image: absoluteUrl(SITE.ogImage),
  brand: { "@type": "Brand", name: SITE.name },
  offers: {
    "@type": "Offer",
    price: String(PRICES.kit),
    priceCurrency: "INR",
    availability: "https://schema.org/InStock",
    url: `${SITE.origin}/#pricing`,
    seller: ORG,
  },
});

export const faqPage = (faqs: Faq[], path: string) => ({
  "@type": "FAQPage",
  "@id": `${absoluteUrl(path)}#faq`,
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
});

export const howTo = (name: string, steps: Step[], path: string) => ({
  "@type": "HowTo",
  "@id": `${absoluteUrl(path)}#howto`,
  name,
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.name,
    text: s.text,
  })),
});

export const breadcrumb = (items: Array<{ name: string; path: string }>) => ({
  "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: it.name,
    item: absoluteUrl(it.path),
  })),
});

const webPage = (opts: {
  path: string;
  name: string;
  description: string;
  type?: string;
  breadcrumb?: unknown;
  lang?: LangCode;
}) => ({
  "@type": opts.type ?? "WebPage",
  "@id": `${absoluteUrl(opts.path)}#webpage`,
  url: absoluteUrl(opts.path),
  name: opts.name,
  description: opts.description,
  inLanguage: opts.lang ? langInfo(opts.lang).htmlLang : SITE.lang,
  isPartOf: WEBSITE,
  about: APP,
  primaryImageOfPage: { "@type": "ImageObject", url: absoluteUrl(SITE.ogImage) },
  datePublished: "2026-10-15",
  dateModified: SITE.updated,
  ...(opts.breadcrumb ? { breadcrumb: opts.breadcrumb } : {}),
});

export function homeGraph(faqs: Faq[], steps: Step[], title: string, description: string, lang: LangCode = "en", howToName = "How to start billing with QuickBill POS") {
  const path = homePath(lang);
  return {
    "@context": "https://schema.org",
    "@graph": [
      organization(),
      website(),
      app(),
      kitProduct(),
      webPage({ path, name: title, description, lang }),
      faqPage(faqs, path),
      howTo(howToName, steps, path),
    ],
  };
}

export function landingGraph(page: LandingPageData, lang: LangCode = "en", homeLabel = "Home") {
  const path = pagePath(lang, page.slug);
  const crumbs = breadcrumb([
    { name: homeLabel, path: homePath(lang) },
    { name: page.navTitle, path },
  ]);
  const graph: unknown[] = [
    organization(),
    website(),
    app(),
    webPage({ path, name: page.seoTitle, description: page.description, breadcrumb: crumbs, lang }),
    faqPage(page.faqs, path),
  ];
  if (page.howTo) graph.push(howTo(page.howTo.name, page.howTo.steps, path));
  return { "@context": "https://schema.org", "@graph": graph };
}
export function legalGraph(opts: { path: string; name: string; description: string }) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organization(),
      website(),
      webPage({
        path: opts.path,
        name: opts.name,
        description: opts.description,
        breadcrumb: breadcrumb([
          { name: "Home", path: "/" },
          { name: opts.name, path: opts.path },
        ]),
      }),
    ],
  };
}
